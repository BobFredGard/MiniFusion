/* ---------- FAO : fraisage 2.5D + post-processeurs CN ---------- */
// Module mené EN PARALLÈLE de la partie dessin : il ne touche à aucune géométrie.
// Il lit les corps affichés (bbox), génère des parcours outil (ébauche/finition
// 2.5D : surfaçage, poche, contour, perçage, débourrage) et post-processe en
// G-code pour Siemens SINUMERIK 840D (variantes 630 / 1520, cf. PostPro/*.cps)
// et Fagor 8065 (cf. PostPro/fagor-8065.cps).
//
// Référence atelier CAV-75-25.mpf (T6 D=25 CR=2, S8000, F5000/6000, ZMIN=-24.108) :
// débourrage = entrée hélicoïdale circulaire au centre (rayon centre-outil ~0.4*D,
// pas ~0.1*D/tour, en G1 petits segments, avance de coupe), puis vidage en spirale
// concentrique intérieur->extérieur à Z constant par niveau (ap 1-2), liaisons
// continues sans rétract (G1 + grands G3 de liaison), coins arrondis en G2/G3
// (IJK incrémental), parois reprises en tours seuls, finition par contour G2.
// C'est exactement ce que fait `pocket3d` : hélice (faoHelixEntry) + spirale
// rectangulaire + arrondi des coins (faoRoundMoves -> G2/G3) + tours de parois.
// Une poche circulaire Ø20 centre-outil s'obtient avec un carré + arrondi = demi-côté
// (4 coins à 90° -> cercle complet).
//
// Conventions reprises des .cps de référence :
//  - Siemens : `; %_N_NOM_MPF`, G71/G17/G90/G94, G54, `T.. D..` + M6, S/M3,
//    arrosage M7 (général) / M8 (broche) / M9 (arrêt), rétraction
//    `G0 SUPA Z600 D0` + parc X machine (630 : X-200, 1520 : X-430),
//    perçages MCALL CYCLE81/83/84 (phase 2 — le MVP déroule en G0/G1), fin M30,
//    pas de numéros de séquence.
//  - Fagor 8065 : commentaires `( ... )`, `G71/G17/G90/G94`, G54,
//    `T.. D.. M06`, S/M03, arrosage M08/M09, plans inclinés `#CS` (phase 2 —
//    le MVP reste 3 axes outil vertical), fin M30, séquences N10 pas de 5.
// Les cycles et CYCLE800/#CS arrivent en phase 2, une fois les mouvements validés.
// Les arcs sont en IJK incrémental départ (accepté par 840D comme 8065, <180°).
//
// État : `doc.fao` (persisté via serialise/deserialise, voir
// 90-picking-mesure-import.js) — les modifications FAO ne touchent JAMAIS à
// _docVersion, donc aucun rejeu géométrique n'est déclenché (travail parallèle
// sans interférence avec la partie dessin).
// Moves : [{r:0|1, x, y, z}] — r=1 rapide (G0), r=0 usinage (G1) ; arc:{i,j,cw} -> G2/G3.

const FAO_VER='32j';

/* ----- formats numériques (point décimal, comme les .cps : ascii) ----- */
function faoFmtXYZ(n){ const v=isFinite(+n)?+n:0; return (Math.round(v*1000)/1000).toFixed(3); }
function faoFmtF(n){ const v=isFinite(+n)&&+n>0?+n:100; return (Math.round(v*10)/10).toFixed(1); }
function faoFmtS(n){ const v=isFinite(+n)&&+n>0?+n:1000; return String(Math.round(v)); }
function faoProgName(s){
  // Nom de programme : majuscules, sans espaces (Siemens : 2 lettres mini).
  let t=String(s||'PIECE').toUpperCase().replace(/[^A-Z0-9_]/g,'_').replace(/^_+/,'');
  if(!/^[A-Z_]/.test(t))t='P_'+t;
  if(t.length<2)t=(t+'_X').slice(0,2);
  return t.slice(0,24);
}

/* ----- état : posages (persistés dans doc.fao) ----- */
// Un posage = machine + repère + modèle + brut + bridage + opérations, comme le
// SETUP Fusion (img1). Les outils vivent dans le posage (bibliothèque locale).
// Migration : job plat 31t/31u (name,post,tools,stock,ops) -> posage unique.
function faoStockDefault(){ return {x0:0,y0:0,z0:0,x1:100,y1:80,z1:25}; }
function faoDefaultTools(){
  // Bibliothèque initiale : cylindrique (ébauche/finition 2.5D), boule et
  // torique (finition 3D — rayon de coin stocké). T6 = fraise de la gamme
  // CAV-75-25 (D25 CR2 torique, S8000 F5000/6000) pour rejouer le débourrage
  // de référence à l'identique (hélice R10 = 0.4*D, ap 1-2, ae 8-10).
  return [
    {id:'T1',num:1,name:'Fraise D10',kind:'flat',d:10,cornerR:0,flutes:2,vc:250,fz:0.06},
    {id:'T2',num:2,name:'Fraise D6',kind:'flat',d:6,cornerR:0,flutes:2,vc:250,fz:0.04},
    {id:'T3',num:3,name:'Boule D8',kind:'ball',d:8,cornerR:4,flutes:2,vc:200,fz:0.04},
    {id:'T6',num:6,name:'Torique D25 R2',kind:'bull',d:25,cornerR:2,flutes:2,vc:628,fz:0.18}
  ];
}
let faoUidN=0;
const faoNewId=function(p){ return p+'_'+(++faoUidN)+'_'+Date.now().toString(36); };
function faoDefaultSetup(){
  return {
    id:faoNewId('setup'), name:'POSAGE1', machine:'siemens630', wcs:'G54',
    origin:{preset:'top-X0Y0'}, // préréglages point de bloc ; point pièce cliqué = phase suivante
    bodies:'all', // 'all' ou [ids de corps]
    tools:faoDefaultTools(),
    fixture:{note:'', radial:5, axial:5}, // mémorisé ; non pris en compte dans les parcours (phase suivante)
    coolant:'flood', secu:5, marge:5,
    rapide:5000, // vitesse des G0 (mm/min) — estimation + référence machine
    plungePct:30, // % de l'avance de coupe appliqué à la plongée (F de plongée)
    accel:1000, // accélération machine (mm/s²) — temps rapide réel d/v + v/A
    toolChg:30, // durée d'un changement d'outil (s) ajoutée à l'estimation
    orient:{b:0, c:0}, // indexation 3+2 : B (basculer Y) / C (tourner Z), degrés
    stock:faoStockDefault(), ops:[]
  };
}
function faoDefaultJob(){ return faoDefaultSetup(); } // alias historique (tests)
function faoMigrateSetup(flat){
  // Job plat 31t/31u -> posage : post->machine, outil unique->biblio, ops repris.
  const s=faoDefaultSetup();
  ['name','wcs','coolant','secu','marge','stock','rapide','plungePct'].forEach(function(k){
    if(flat&&flat[k]!==undefined)s[k]=flat[k];
  });
  if(flat&&(flat.machine||flat.post))s.machine=flat.machine||flat.post;
  if(flat&&flat.origin&&flat.origin.preset)s.origin={preset:flat.origin.preset};
  if(flat&&flat.bodies!==undefined)s.bodies=flat.bodies;
  if(flat&&flat.fixture)s.fixture=flat.fixture;
  if(Array.isArray(flat.tools)&&flat.tools.length)s.tools=flat.tools;
  else if(flat&&flat.tool&&isFinite(+flat.tool.d))s.tools=
    [{id:'T1',num:1,name:'Fraise D'+flat.tool.d,kind:'flat',d:+flat.tool.d,cornerR:0,flutes:2,vc:250,fz:0.06}];
  s.ops=Array.isArray(flat.ops)?flat.ops:[];
  faoSanitiseOps(s);
  return s;
}
function faoSanitiseOps(s){
  (s.ops||[]).forEach(function(op){
    if(!op.id)op.id=faoNewId('op');
    if(op.on===undefined)op.on=true;
    if(!op.toolId||!(s.tools||[]).some(function(t){return t.id===op.toolId;}))
      op.toolId=(s.tools&&s.tools[0]&&s.tools[0].id)||'T1';
    // 31z : laisse unique -> surépaisseurs radiale (XY) + axiale (fond/Z).
    // La géodésique garde `laisse` (le long de la normale, ni radial ni axial).
    if(op.type!=='geofinish'&&isFinite(+op.laisse)&&(op.radial===undefined&&op.axial===undefined)){
      op.radial=+op.laisse; op.axial=+op.laisse;
    }
    if(op.type!=='geofinish')delete op.laisse;
    if(op.limit&&op.limit.mode!=='rect'&&op.limit.mode!=='chain')delete op.limit;
  });
}
// radial/axial effectifs d'une op (compat 31v : `laisse` vaut les deux).
function faoRA(o){
  const leg=isFinite(+o.laisse)?+o.laisse:0;
  return {
    radial:isFinite(+o.radial)?+o.radial:leg,
    axial:isFinite(+o.axial)?+o.axial:leg
  };
}
function faoRoot(){
  // Racine {setups, activeSetupId} — crée + migre au besoin.
  try{
    if(typeof doc==='undefined')return {setups:[],activeSetupId:null};
    let r=doc.fao;
    if(!r||typeof r!=='object')r={};
    if(!Array.isArray(r.setups)){
      const s=(r.ops||r.stock)?faoMigrateSetup(r):faoDefaultSetup();
      r={setups:[s],activeSetupId:s.id};
      doc.fao=r;
    }
    if(!r.setups.length){
      const s=faoDefaultSetup(); r.setups.push(s); r.activeSetupId=s.id;
    }
    if(!r.activeSetupId||!r.setups.some(function(s){return s.id===r.activeSetupId;}))
      r.activeSetupId=r.setups[0].id;
    r.setups.forEach(faoSanitiseOps);
    return r;
  }catch(e){ return {setups:[faoDefaultSetup()],activeSetupId:null}; }
}
function faoSetup(id){
  const r=faoRoot();
  for(let i=0;i<r.setups.length;i++)if(r.setups[i].id===(id||r.activeSetupId))return r.setups[i];
  return r.setups[0];
}
function faoDoc(){ return faoSetup(); } // compat : l'ancien "job" = le posage actif
function faoTouch(){
  // Sale MAIS sans rejeu : dirty pour l'autosave, _docVersion inchangé.
  try{ dirty=true; }catch(e){}
  try{ if(typeof refreshParts==='function')refreshParts(); }catch(e){}
  try{ faoRenderTree(); }catch(e){}
}

/* ----- bibliothèque d'outils : Vc/fz -> S/F ----- */
function faoRapide(job){
  // Vitesse des G0 du posage (mm/min) — défaut machine 5000.
  return (job&&isFinite(+job.rapide)&&+job.rapide>0)?+job.rapide:5000;
}
function faoPlungePct(job){
  // % de l'avance de coupe appliqué à la plongée (défaut 30).
  return (job&&isFinite(+job.plungePct)&&+job.plungePct>0)?Math.min(100,+job.plungePct):30;
}
function faoAccel(job){
  // Accélération machine (mm/s²) — défaut 1000. Sert au temps rapide réel.
  return (job&&isFinite(+job.accel)&&+job.accel>0)?+job.accel:1000;
}
function faoToolChg(job){
  // Durée d'un changement d'outil (s) — défaut 30, ajoutée à chaque changement.
  return (job&&isFinite(+job.toolChg)&&+job.toolChg>=0)?+job.toolChg:30;
}
function faoOrient(job){
  // Indexation 3+2 du posage : B = bascule autour de Y, C = rotation autour de Z
  // (cinématique table C + B). {0,0} = usinage 3 axes strictement inchangé.
  const o=(job&&job.orient)||{};
  const b=isFinite(+o.b)?+o.b:0, c=isFinite(+o.c)?+o.c:0;
  return {b:Math.round(b*1000)/1000, c:Math.round(c*1000)/1000};
}
function faoOrientOn(job){ const o=faoOrient(job); return o.b!==0||o.c!==0; }
function faoToolById(job,id){
  const ts=(job&&job.tools)||[];
  for(let i=0;i<ts.length;i++)if(ts[i].id===id)return ts[i];
  if(ts.length)return ts[0];
  return {id:'T1',num:1,name:'Fraise D10',kind:'flat',d:10,cornerR:0,flutes:2,vc:250,fz:0.06};
}
function faoToolSF(t,setup){
  // S = Vc*1000/(pi*D) ; F = fz*z*S ; plongée = plungePct % de F (posage, défaut 30 %).
  const D=isFinite(+t.d)&&+t.d>0?+t.d:10;
  const vc=isFinite(+t.vc)&&+t.vc>0?+t.vc:250;
  const fz=isFinite(+t.fz)&&+t.fz>0?+t.fz:0.05;
  const z=isFinite(+t.flutes)&&+t.flutes>0?Math.round(+t.flutes):2;
  const s=Math.max(1,Math.round(vc*1000/(Math.PI*D)));
  const f=Math.max(1,Math.round(fz*z*s));
  return {s:s, f:f, plunge:Math.max(1,Math.round(f*faoPlungePct(setup)/100))};
}
function faoKindLabel(k){ return k==='ball'?'Boule':(k==='bull'?'Torique':'Cylindrique'); }

/* ----- brut : bbox des corps visibles, + marge ----- */
function faoStock(){
  const job=faoDoc();
  let box=null;
  try{
    if(typeof THREE!=='undefined'&&typeof bodies!=='undefined'&&bodies&&bodies.length){
      box=new THREE.Box3(); let n=0;
      bodies.forEach(function(b){
        if(!b||b.ghost||b.visible===false||!b.mesh)return;
        try{ box.expandByObject(b.mesh); n++; }catch(e){}
      });
      if(!n)box=null;
      else{
        try{ if(box.isEmpty())box=null; }catch(e){ box=null; }
      }
    }
  }catch(e){ box=null; }
  const m=isFinite(+job.marge)&&+job.marge>=0?+job.marge:5;
  if(box){
    try{
      const a=box.min,b=box.max;
      if([a.x,a.y,a.z,b.x,b.y,b.z].every(isFinite)&&b.x>a.x&&b.y>a.y&&b.z>a.z){
        job.stock={x0:a.x-m, y0:a.y-m, z0:a.z, x1:b.x+m, y1:b.y+m, z1:b.z};
        return job.stock;
      }
    }catch(e){}
  }
  // Repli : brut mémorisé s'il est valide, sinon défaut.
  const s=job.stock;
  if(s&&[s.x0,s.y0,s.z0,s.x1,s.y1,s.z1].every(isFinite)&&s.x1>s.x0&&s.y1>s.y0&&s.z1>s.z0)return s;
  job.stock=faoStockDefault();
  return job.stock;
}

/* ----- niveaux Z (ébauche par passes ap, finition = dernier niveau) ----- */
function faoLevels(zTop,zBot,ap){
  const p=isFinite(+ap)&&+ap>0?+ap:5;
  const lo=Math.min(+zTop,+zBot), hi=Math.max(+zTop,+zBot);
  const out=[]; let z=hi-p;
  if(!(isFinite(lo)&&isFinite(hi)))return [];
  while(z>lo+1e-9){ out.push(Math.round(z*1000)/1000); z-=p; }
  out.push(Math.round(lo*1000)/1000);
  return out;
}

/* ----- générateurs : surfaçage (zigzag, passe d'ébauche ou finition) ----- */
function faoGenFacing(stock,o){
  o=o||{};
  const D=isFinite(+o.toolD)&&+o.toolD>0?+o.toolD:10;
  const r=D/2, ae=isFinite(+o.ae)&&+o.ae>0?+o.ae:D*0.6;
  const z=isFinite(+o.z)?+o.z:stock.z1;
  const secu=isFinite(+o.secu)?+o.secu:z+5;
  const dep=r+2; // dépassement latéral (attaque hors matière)
  const yA=stock.y0-r, yB=stock.y1+r;
  const moves=[{r:1,x:stock.x0-dep,y:yA,z:secu},{r:1,x:stock.x0-dep,y:yA,z:z}];
  let y=yA, sens=1, garde=0;
  moves.push({r:0,x:stock.x0-dep,y:y,z:z});
  while(y<yB-1e-9&&garde++<100000){
    const xT=sens>0?stock.x1+dep:stock.x0-dep;
    moves.push({r:0,x:xT,y:y,z:z});
    y=Math.min(y+ae,yB);
    moves.push({r:0,x:xT,y:y,z:z});
    sens=-sens;
  }
  moves.push({r:1,x:moves[moves.length-1].x,y:moves[moves.length-1].y,z:secu});
  return moves;
}

/* ----- poche rectangulaire (ébauche : offsets concentriques par niveau) ----- */
// radial : surépaisseur sur parois (XY) ; axial : surépaisseur sur le fond (Z).
function faoGenPocket(rect,zTop,zBot,o){
  o=o||{};
  const D=isFinite(+o.toolD)&&+o.toolD>0?+o.toolD:10;
  const r=D/2, ae=isFinite(+o.ae)&&+o.ae>0?+o.ae:D*0.5;
  const RA=faoRA(o);
  const secu=isFinite(+o.secu)?+o.secu:+zTop+5;
  const R={x0:rect.x0+RA.radial, y0:rect.y0+RA.radial, x1:rect.x1-RA.radial, y1:rect.y1-RA.radial};
  const zb=+zBot+RA.axial;
  if(R.x1-R.x0<0.05||R.y1-R.y0<0.05)return [];
  const moves=[];
  const zs=faoLevels(+zTop,zb,isFinite(+o.ap)?+o.ap:5);
  zs.forEach(function(z){
    // Contours concentriques depuis la paroi (r) vers le centre.
    const insets=[]; let k=r;
    const cx=(R.x0+R.x1)/2, cy=(R.y0+R.y1)/2;
    while(k<=Math.min(R.x1-R.x0,R.y1-R.y0)/2+1e-9){ insets.push(k); k+=ae; }
    if(!insets.length)insets.push(Math.min(R.x1-R.x0,R.y1-R.y0)/2);
    insets.forEach(function(ins,idx){
      const ax=R.x0+ins, bx=R.x1-ins, ay=R.y0+ins, by=R.y1-ins;
      if(bx-ax<0.02||by-ay<0.02){ // fond étroit : une passe centrale
        moves.push({r:1,x:cx,y:cy,z:secu});
        moves.push({r:1,x:cx,y:cy,z:z});
        return;
      }
      if(idx===0&&z===zs[0])moves.push({r:1,x:ax,y:ay,z:secu});
      else moves.push({r:1,x:ax,y:ay,z:secu});
      moves.push({r:1,x:ax,y:ay,z:z});
      moves.push({r:0,x:bx,y:ay,z:z});
      moves.push({r:0,x:bx,y:by,z:z});
      moves.push({r:0,x:ax,y:by,z:z});
      moves.push({r:0,x:ax,y:ay,z:z});
    });
  });
  const last=moves.length?moves[moves.length-1]:{x:rect.x0,y:rect.y0};
  moves.push({r:1,x:last.x,y:last.y,z:secu});
  return moves;
}

/* ----- contour extérieur (finition : périmètre compensé du rayon outil) ----- */
function faoGenContour(rect,zTop,zBot,o){
  o=o||{};
  const D=isFinite(+o.toolD)&&+o.toolD>0?+o.toolD:10;
  const r=D/2;
  const RA=faoRA(o);
  const secu=isFinite(+o.secu)?+o.secu:+zTop+5;
  const ax=rect.x0-r-RA.radial, bx=rect.x1+r+RA.radial, ay=rect.y0-r-RA.radial, by=rect.y1+r+RA.radial;
  const moves=[];
  const zs=faoLevels(+zTop,+zBot+RA.axial,isFinite(+o.ap)?+o.ap:5);
  // Approche tangentielle : entrée à 45° depuis l'extérieur.
  const ex=ax-(r+3), ey=ay-(r+3);
  zs.forEach(function(z,li){
    if(li===0)moves.push({r:1,x:ex,y:ey,z:secu});
    else moves.push({r:1,x:ex,y:ey,z:secu});
    moves.push({r:1,x:ax,y:ay,z:z});
    moves.push({r:0,x:bx,y:ay,z:z});
    moves.push({r:0,x:bx,y:by,z:z});
    moves.push({r:0,x:ax,y:by,z:z});
    moves.push({r:0,x:ax,y:ay,z:z});
  });
  moves.push({r:1,x:ax,y:ay,z:secu});
  return moves;
}

/* ----- perçage (déroulé G0/G1 en MVP ; CYCLE81/G81 en phase 2) ----- */
function faoGenDrill(pts,zTop,zBot,secu){
  const s=isFinite(+secu)?+secu:+zTop+5;
  const moves=[];
  (pts||[]).forEach(function(p){
    moves.push({r:1,x:+p[0],y:+p[1],z:s});
    moves.push({r:1,x:+p[0],y:+p[1],z:+zTop});
    moves.push({r:0,x:+p[0],y:+p[1],z:+zBot});
    moves.push({r:1,x:+p[0],y:+p[1],z:s});
  });
  return moves;
}

/* ----- limite d'usinage rectangulaire + règle outil ----- */
// op.limit = null (tout usiner) ou {mode:'rect',x0,y0,x1,y1,
//   side:'center'|'in'|'out', extra}. Règle outil (comme Fusion) :
//   'in' = outil contenu dans la limite (zone rétractée de r),
//   'out' = la limite est entièrement couverte (zone dilatée de r),
//   'center' = le centre reste dans la limite. `extra` = décalage supp. (mm).
function faoEffLimit(op,toolD){
  const L=op&&op.limit;
  if(!L||L.mode!=='rect')return null;
  const r=(isFinite(+toolD)&&+toolD>0?+toolD:10)/2;
  const ex=isFinite(+L.extra)?+L.extra:0;
  const k=(L.side==='out'?r:L.side==='in'?-r:0)+ex;
  const R={x0:+L.x0-k, y0:+L.y0-k, x1:+L.x1+k, y1:+L.y1+k};
  if(!(R.x1>R.x0&&R.y1>R.y0))return null;
  return R;
}
function faoLimitDrillPts(op,toolD){
  const pts=(op&&op.pts)||[];
  const lim=op&&op.limit;
  if(lim&&lim.mode==='chain'&&lim.loop&&lim.loop.length>=3)
    return pts.filter(function(p){ return faoLimInside(+p[0],+p[1],lim,0); });
  const R=faoEffLimit(op,toolD);
  if(!R)return pts;
  return pts.filter(function(p){ return +p[0]>=R.x0&&+p[0]<=R.x1&&+p[1]>=R.y0&&+p[1]<=R.y1; });
}
function faoClipLB(p0,p1,R){
  // Liang-Barsky : fraction [t0,t1] du segment dans R, ou null.
  let t0=0, t1=1;
  const dx=p1.x-p0.x, dy=p1.y-p0.y, e=1e-12;
  const P=[-dx,dx,-dy,dy], Q=[p0.x-R.x0,R.x1-p0.x,p0.y-R.y0,R.y1-p0.y];
  for(let k=0;k<4;k++){
    if(Math.abs(P[k])<e){ if(Q[k]<0)return null; }
    else{ const t=Q[k]/P[k];
      if(P[k]<0){ if(t>t0)t0=t; } else if(t<t1)t1=t; }
  }
  return t0<=t1?[t0,t1]:null;
}
function faoClipMovesXY(moves,R,secuZ){
  // Ne garde que la coupe dans R. Ré-entrée sécurisée : remontée sécu,
  // rapide XY, plongée — jamais de G0 dans la matière.
  const out=[]; let px=null, py=null, pz=null, inside=false;
  const inR=function(x,y){ return x>=R.x0&&x<=R.x1&&y>=R.y0&&y<=R.y1; };
  moves.forEach(function(m){
    if(m.r){ out.push(m); px=m.x; py=m.y; pz=m.z; inside=inR(m.x,m.y); return; }
    if(m.arc){ out.push(m); px=m.x; py=m.y; pz=m.z; inside=inR(m.x,m.y); return; }
    if(px===null){ px=m.x; py=m.y; pz=m.z; inside=inR(m.x,m.y); }
    const seg=faoClipLB({x:px,y:py},{x:m.x,y:m.y},R);
    if(!seg){ inside=false; }
    else{
      const ax=px+(m.x-px)*seg[0], ay=py+(m.y-py)*seg[0], az=pz+(m.z-pz)*seg[0];
      const bx=px+(m.x-px)*seg[1], by=py+(m.y-py)*seg[1], bz=pz+(m.z-pz)*seg[1];
      if(!inside||Math.hypot(ax-px,ay-py)>1e-6){
        out.push({r:1,x:px,y:py,z:secuZ});
        out.push({r:1,x:ax,y:ay,z:secuZ});
        out.push({r:1,x:ax,y:ay,z:az});
      }
      out.push({r:0,x:bx,y:by,z:bz});
      inside=true;
    }
    px=m.x; py=m.y; pz=m.z;
  });
  return out;
}

/* ----- limite par chaîne d'arêtes : boucle XY + clip polygone ----- */
// La chaîne est SNAPSHOTÉE à la sélection (pts 3D -> boucle XY) + les ancres des
// germes (milieu 3D + longueur) sont conservées : à chaque fin de rejeu,
// faoChainReplay re-suit la boucle sur les arêtes du nouveau solide (rejeu auto) ;
// si les arêtes ont trop bougé, la boucle figée reste et l'op passe en « stale ».
// op.limit = {mode:'chain', loop:[[x,y]...], closed, nEdges, tangent, side, extra,
//             anchors:[{m:[x,y,z],len}...], stale}.
function faoTangentSet(edges,seeds){
  // BFS tangentiel (même règle que les congés : |dot| > 0.985 aux sommets).
  const norm=function(v){ return (Math.abs(v)<0.0005?0:v).toFixed(3); };
  const vmap=new Map(), keys=[];
  edges.forEach(function(e,i){
    const p=e.pts||[];
    if(p.length<2)return;
    const k0=p[0].map(norm).join(','), k1=p[p.length-1].map(norm).join(',');
    keys[i]=[k0,k1];
    if(!vmap.has(k0))vmap.set(k0,[]);
    if(!vmap.has(k1))vmap.set(k1,[]);
    vmap.get(k0).push(i); vmap.get(k1).push(i);
  });
  const getTan=function(ei,atEnd){
    const p=(edges[ei]&&edges[ei].pts)||[];
    if(p.length<2)return null;
    const a=atEnd?p[p.length-2]:p[0], b=atEnd?p[p.length-1]:p[1];
    return [b[0]-a[0],b[1]-a[1],b[2]-a[2]];
  };
  const tang=function(a,b,sk){
    try{
      const ka=keys[a], kb=keys[b];
      if(!ka||!kb)return false;
      const ta=getTan(a,ka[0]!==sk), tb=getTan(b,kb[0]!==sk);
      if(!ta||!tb)return false;
      const la=Math.hypot(ta[0],ta[1],ta[2]), lb=Math.hypot(tb[0],tb[1],tb[2]);
      if(la<1e-9||lb<1e-9)return false;
      return Math.abs((ta[0]*tb[0]+ta[1]*tb[1]+ta[2]*tb[2])/(la*lb))>0.985;
    }catch(e){ return false; }
  };
  const seen=new Set(), queue=(seeds||[]).filter(function(i){return i>=0&&i<edges.length;});
  queue.forEach(function(i){seen.add(i);});
  while(queue.length){
    const cur=queue.shift();
    (keys[cur]||[]).forEach(function(k){
      (vmap.get(k)||[]).forEach(function(nb){
        if(seen.has(nb))return;
        if(tang(cur,nb,k)){ seen.add(nb); queue.push(nb); }
      });
    });
  }
  return Array.from(seen);
}
function faoOrderEdges(edges,idx){
  // Ordonne des indices d'arêtes en chemin(s) par extrémités proches (3D).
  const tol=1e-4, chains=[], used=new Set();
  const ends=function(i){
    const p=edges[i].pts;
    return [p[0],p[p.length-1]];
  };
  const near=function(a,b){
    const dx=a[0]-b[0], dy=a[1]-b[1], dz=a[2]-b[2];
    return dx*dx+dy*dy+dz*dz<tol*tol;
  };
  (idx||[]).forEach(function(s){
    if(used.has(s)||!edges[s]||!edges[s].pts||edges[s].pts.length<2)return;
    used.add(s);
    let chain=[s], grew=true, guard=0;
    while(grew&&guard++<10000){
      grew=false;
      const tipA=ends(chain[0])[0], tipB=ends(chain[chain.length-1])[1];
      for(let k=0;k<idx.length;k++){
        const j=idx[k];
        if(used.has(j)||!edges[j]||!edges[j].pts||edges[j].pts.length<2)continue;
        const e=ends(j);
        if(near(tipB,e[0])){chain.push(j);used.add(j);grew=true;break;}
        if(near(tipB,e[1])){chain.push(j);used.add(j);grew=true;break;}
        if(near(tipA,e[1])){chain.unshift(j);used.add(j);grew=true;break;}
        if(near(tipA,e[0])){chain.unshift(j);used.add(j);grew=true;break;}
      }
    }
    chains.push(chain);
  });
  return chains;
}
function faoLoopFromChains(edges,chains){
  // Chaînes 3D -> boucle XY (projection, dédupliquée, refermée d'office).
  let pts=[];
  (chains||[]).forEach(function(ch){
    ch.forEach(function(i,ci){
      const p=edges[i].pts;
      for(let k=(ci===0?0:1);k<p.length;k++)pts.push([p[k][0],p[k][1]]);
    });
  });
  pts=pts.filter(function(q,i){
    if(!i)return true;
    const a=pts[i-1];
    return Math.hypot(q[0]-a[0],q[1]-a[1])>1e-4;
  });
  if(pts.length<3)return {loop:[],closed:false};
  const closed=Math.hypot(pts[0][0]-pts[pts.length-1][0],pts[0][1]-pts[pts.length-1][1])<0.5;
  if(!closed)pts.push([pts[0][0],pts[0][1]]); // chaîne ouverte : refermée d'office
  return {loop:pts.map(function(q){return [Math.round(q[0]*1000)/1000,Math.round(q[1]*1000)/1000];}),closed:closed};
}
function faoLoopArea(loop){
  let a=0;
  for(let i=0;i+1<loop.length;i++)a+=loop[i][0]*loop[i+1][1]-loop[i+1][0]*loop[i][1];
  return Math.abs(a/2);
}

/* ----- rejeu auto : la limite « chaîne » suit le modèle ----- */
// Chaque validation mémorise milieu 3D + longueur de chaque GERME (ancres figées).
// À chaque fin de rejeu (buildDone → faoChainReplay), si chaque ancre retrouve « son »
// arête sur le nouveau solide (tolérance XY, Z libre pour un changement de profondeur,
// dérive de longueur ≤ 50 %), la boucle est RECONSTRUITE automatiquement (tangentes
// re-déduites depuis les germes). Sinon la boucle figée est conservée et l'op passe en
// « stale » : alerte dans la fiche + ATTENTION à l'export (repli = l'ancien
// « modèle modifié -> re-sélectionner », mais signalé au lieu d'être silencieux).
const FAO_CHAIN_TOL=10; // mm — distance XY max acceptée entre une ancre et son arête
function faoEdgeAnchor(e){
  // {m:[x,y,z], len} d'une arête : milieu OCCT si présent, sinon milieu du polyline.
  if(!e)return null;
  const p=e.pts||[];
  const m=(e.mid&&isFinite(e.mid[0]))?e.mid:(p.length>=2?p[Math.floor((p.length-1)/2)]:null);
  if(!m||!isFinite(m[0]))return null;
  return {m:[m[0],m[1],isFinite(+m[2])?+m[2]:0],len:isFinite(+e.len)?+e.len:0};
}
function faoChainLoopCap(res){
  // Cap 2000 pts (clip en O(n)) : les très longues chaînes sont sous-échantillonnées.
  if(!res||!res.loop||res.loop.length<=2000)return res;
  const stride=Math.ceil(res.loop.length/2000), thin=[];
  for(let i=0;i<res.loop.length;i+=stride)thin.push(res.loop[i]);
  if(thin[thin.length-1]!==res.loop[res.loop.length-1])thin.push(res.loop[res.loop.length-1]);
  return {loop:thin,closed:res.closed};
}
function faoChainRematch(op,edges){
  // Reconstruit la boucle si les ances des germes retrouvent leurs arêtes.
  // Retour {changed, stale, matched, nSel, skipped?} — état dérivé : JAMAIS de
  // snapshot (comme les projections associatives), l'annulation reste au rejeu modèle.
  const L=op&&op.limit;
  if(!L||L.mode!=='chain')return {changed:false,skipped:true};
  if(!(L.anchors&&L.anchors.length))return {changed:false,skipped:true}; // ancien document
  if(!edges||!edges.length)return {changed:false,skipped:true};
  const fail=function(nSel){
    const ch=!L.stale;
    L.stale=true;
    return {changed:!!ch,stale:true,matched:0,nSel:nSel||0};
  };
  // 1) appariement injectif ancre -> arête (meilleur score, tous les germes requis)
  const used=new Set(), seeds=[];
  for(let a=0;a<L.anchors.length;a++){
    const A=L.anchors[a];
    if(!A||!A.m||!isFinite(A.m[0]))return fail();
    let best=-1,bestD=Infinity,bestS=Infinity;
    for(let i=0;i<edges.length;i++){
      if(used.has(i))continue;
      const e=edges[i];
      if(!e||!e.pts||e.pts.length<2)continue;
      const m=(e.mid&&isFinite(e.mid[0]))?e.mid:null;
      if(!m)continue;
      const dxy=Math.hypot(m[0]-A.m[0],m[1]-A.m[1]);
      if(dxy>FAO_CHAIN_TOL)continue; // tolérance sèche sur XY (le Z n'est pas borné)
      const dz=Math.abs((isFinite(+m[2])?+m[2]:0)-(isFinite(+A.m[2])?+A.m[2]:0));
      const len=+e.len||0;
      const dl=A.len>1?Math.abs(len-A.len)/A.len:0;
      if(dl>0.5)continue; // même position mais taille fondu : plus la même arête
      const s=dxy+0.1*dz+5*dl;
      if(s<bestS){bestS=s;best=i;bestD=dxy;}
    }
    if(best<0||bestD>FAO_CHAIN_TOL)return fail();
    used.add(best); seeds.push(best);
  }
  // 2) re-déduction des tangentes depuis les germes appariés (même règle qu'à la saisie)
  let sel=seeds.slice();
  if(L.tangent){
    const all=[];
    seeds.forEach(function(s){
      faoTangentSet(edges,[s]).forEach(function(j){ if(all.indexOf(j)<0)all.push(j); });
    });
    sel=all;
  }
  // 3) reconstruction de la boucle XY (ordre, clip de longueur, validation)
  let res=faoLoopFromChains(edges,faoOrderEdges(edges,sel));
  res=faoChainLoopCap(res);
  if(!res.loop.length||res.loop.length<3||faoLoopArea(res.loop)<1e-6)return fail(sel.length);
  const wasStale=!!L.stale;
  const loopChanged=JSON.stringify(L.loop||[])!==JSON.stringify(res.loop);
  L.loop=res.loop; L.closed=res.closed; L.nEdges=sel.length; L.stale=false;
  return {changed:loopChanged||wasStale,stale:false,matched:seeds.length,nSel:sel.length};
}
function faoChainReplay(){
  // Fin de rejeu (buildDone) : re-suit toutes les limites chaîne du document sur les
  // arêtes du nouveau solide. Repli silencieux partout où l'on ne peut pas juger :
  // sélection en cours, OCCT absent, solide exact illisible, aucune ancre.
  try{
    if(typeof faoChainMode!=='undefined'&&faoChainMode)return 0;
    const F=(doc&&doc.fao&&doc.fao.setups)||[];
    let any=false;
    for(let i=0;i<F.length&&!any;i++){
      const ops=(F[i]&&F[i].ops)||[];
      for(let k=0;k<ops.length;k++){
        const L=ops[k]&&ops[k].limit;
        if(L&&L.mode==='chain'&&L.anchors&&L.anchors.length){any=true;break;}
      }
    }
    if(!any)return 0;
    if(typeof occHas==='function'&&!occHas())return 0;
    if(!occLive||!occLive.shape)return 0;
    const edges=occSharpEdges(occLive.shape);
    if(!edges.length)return 0;
    let n=0;
    F.forEach(function(st){
      ((st&&st.ops)||[]).forEach(function(op){
        const r=faoChainRematch(op,edges);
        if(r&&r.changed)n++;
      });
    });
    if(n)faoChanged();
    return n;
  }catch(e){ return 0; }
}
function faoPointInPoly(x,y,loop){
  // Impair : dedans <=> nombre impair de croisements.
  let inside=false;
  for(let i=0,j=loop.length-1;i<loop.length;j=i++){
    const xi=loop[i][0], yi=loop[i][1], xj=loop[j][0], yj=loop[j][1];
    if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))inside=!inside;
  }
  return inside;
}
function faoDistToPoly(x,y,loop){
  let m=1/0;
  for(let i=0;i+1<loop.length;i++){
    const ax=loop[i][0], ay=loop[i][1], bx=loop[i+1][0], by=loop[i+1][1];
    const dx=bx-ax, dy=by-ay, l2=dx*dx+dy*dy;
    let t=l2>1e-12?((x-ax)*dx+(y-ay)*dy)/l2:0;
    t=Math.max(0,Math.min(1,t));
    const d=Math.hypot(x-(ax+dx*t),y-(ay+dy*t));
    if(d<m)m=d;
  }
  return m;
}
function faoLimInside(x,y,lim,r){
  // Règle outil (comme Fusion) SANS offsetter le polygone : on teste le point
  // avec marge. side in : érodé de r ; out : dilaté de r ; center : tel quel.
  // extra (décalage supp.) dilate toujours la zone utile.
  const loop=lim&&lim.loop;
  if(!loop||loop.length<3)return true;
  const rr=isFinite(+r)&&+r>0?+r:0, ex=isFinite(+lim.extra)?+lim.extra:0;
  const in0=faoPointInPoly(x,y,loop), d=faoDistToPoly(x,y,loop);
  const side=lim.side||'center';
  if(side==='in')return in0&&(d+ex>=rr);
  if(side==='out')return in0||(d<=rr+ex);
  return in0||(d<=ex);
}
function faoClipMovesPoly(moves,lim,r,secuZ,sub){
  // Clip impair : on subdivise (pas `sub`, 2 mm défaut) et on ne garde que les
  // passages dedans, croisement affiné par dichotomie (0,1 mm). Ré-entrée
  // sécurisée comme en rect : remontée sécu, jamais de G0 dans la matière.
  const step=isFinite(+sub)&&+sub>0?+sub:2;
  const out=[]; let px=null, py=null, pz=null, inside=false;
  const at=function(x,y){ return faoLimInside(x,y,lim,r); };
  const cross=function(ax,ay,bx,by,ain){
    // Dichotomie du point de croisement (sortie à 0,1 mm).
    let t0=0, t1=1;
    for(let k=0;k<30;k++){
      const tm=(t0+t1)/2;
      const insideMid=at(ax+(bx-ax)*tm,ay+(by-ay)*tm);
      if(insideMid===ain)t0=tm; else t1=tm;
      if(Math.hypot((bx-ax)*(t1-t0),(by-ay)*(t1-t0))<0.1)break;
    }
    const t=ain?t1:t0;
    return [ax+(bx-ax)*t,ay+(by-ay)*t];
  };
  const zAt=function(ax,ay,az,bx,by,bz,cx,cy){
    // Z interpolé au point (cx,cy) sur le segment a->b.
    const dx=bx-ax, dy=by-ay, l2=dx*dx+dy*dy;
    const f=l2>1e-12?((cx-ax)*dx+(cy-ay)*dy)/l2:0;
    return az+(bz-az)*Math.max(0,Math.min(1,f));
  };
  const enter=function(x,y,z){
    out.push({r:1,x:px,y:py,z:secuZ});
    out.push({r:1,x:x,y:y,z:secuZ});
    out.push({r:1,x:x,y:y,z:z});
  };
  moves.forEach(function(m){
    if(m.r){ out.push(m); px=m.x; py=m.y; pz=m.z; inside=at(m.x,m.y); return; }
    if(m.arc){ out.push(m); px=m.x; py=m.y; pz=m.z; inside=at(m.x,m.y); return; }
    if(px===null){ px=m.x; py=m.y; pz=m.z; inside=at(m.x,m.y); }
    const len=Math.hypot(m.x-px,m.y-py);
    const n=Math.max(1,Math.ceil(len/step));
    let cx=px, cy=py, cz=pz, cin=inside;
    for(let i=1;i<=n;i++){
      const nx=px+(m.x-px)*i/n, ny=py+(m.y-py)*i/n, nz=pz+(m.z-pz)*i/n;
      const nin=at(nx,ny);
      if(nin&&!cin){
        const c=cross(cx,cy,nx,ny,false);
        const zc=zAt(cx,cy,cz,nx,ny,nz,c[0],c[1]);
        enter(c[0],c[1],zc);
        out.push({r:0,x:nx,y:ny,z:nz});
      }else if(nin&&cin){
        out.push({r:0,x:nx,y:ny,z:nz});
      }else if(!nin&&cin){
        const c=cross(cx,cy,nx,ny,true);
        out.push({r:0,x:c[0],y:c[1],z:zAt(cx,cy,cz,nx,ny,nz,c[0],c[1])});
      }
      cx=nx; cy=ny; cz=nz; cin=nin;
    }
    px=m.x; py=m.y; pz=m.z; inside=cin;
  });
  return out;
}

/* ----- débourrage de poche : pleines passes + tours de parois ----- */
// Par tranches épaisses (ap) : hélice au centre (pleine matière) + vidage
// complet jusqu'à R radial ; entre les tranches, TOURS DE PAROIS seuls au pas
// fin (tour) — les marches de ap sont reprises tous les 2 mm. Fin à
// zBot+axial (0,5 de la face la plus basse). La passe de finition viendra
// ensuite à R=0. Référence CAV-75-25 : hélice R=0.4*D (10 mm pour D25),
// pas hélice 0.1*D/tour, spirale intérieur->extérieur à Z constant, coins
// repris en G2/G3 par `arrondi` (dispatch), jamais de plongée verticale.
function faoGenPocketRough(rect,zTop,zBot,o){
  o=o||{};
  const D=isFinite(+o.toolD)&&+o.toolD>0?+o.toolD:10;
  const RA=faoRA(o);
  const r=D/2+RA.radial;
  const secu=isFinite(+o.secu)?+o.secu:+zTop+5;
  const ap=isFinite(+o.ap)&&+o.ap>0?+o.ap:6;
  const tour=isFinite(+o.tour)?+o.tour:2;
  const zb=+zBot+RA.axial;
  const moves=[];
  const W=(rect.x1-rect.x0)-2*r, H=(rect.y1-rect.y0)-2*r;
  if(!(W>0.5&&H>0.5))return [];
  const cx=(rect.x0+rect.x1)/2, cy=(rect.y0+rect.y1)/2;
  const step=Math.min(isFinite(+o.ae)&&+o.ae>0?+o.ae:D*0.6,D*0.5);
  // Boucles imbriquées intérieur->extérieur à partir d'un inset de base.
  const loopsFrom=function(inset){
    const loops=[];
    for(let k=0;;k++){
      const t=inset+k*step;
      const ax=rect.x0+t, bx=rect.x1-t, ay=rect.y0+t, by=rect.y1-t;
      if(!(bx-ax>0.5&&by-ay>0.5))break;
      loops.push([{x:ax,y:ay},{x:bx,y:ay},{x:bx,y:by},{x:ax,y:by},{x:ax,y:ay}]);
    }
    return loops.reverse(); // intérieur d'abord (après hélice centrale)
  };
  const deep=faoLevels(+zTop,zb,ap);
  deep.forEach(function(z,di){
    // 1. Hélice centrale (pleine matière) depuis z+ap, avance plongée.
    // CAV-75-25 : rayon centre-outil 10 mm pour D25, soit 0.4*D.
    const zFrom=Math.min(secu,z+ap);
    const fit=Math.min(W,H)/2;
    if(fit>=1.5&&Math.min(W,H)>=2.5*D){
      const hr=Math.min(D*0.4,fit-0.5);
      moves.push({r:1,x:cx,y:cy,z:secu});
      if(zFrom<secu-1e-9)moves.push({r:0,x:cx,y:cy,z:zFrom});
      faoHelixEntry(cx,cy,zFrom,z,hr,D).slice(1).forEach(function(m){moves.push(m);});
    }else{
      const rl=Math.min(W,2*D);
      moves.push({r:1,x:rect.x0+r,y:cy,z:secu});
      moves.push({r:0,x:rect.x0+r+rl,y:cy,z:z});
    }
    // 2. Vidage complet : spirale intérieur->extérieur (liaisons G1 courtes).
    loopsFrom(r).forEach(function(loop){
      loop.forEach(function(p){ moves.push({r:0,x:p.x,y:p.y,z:z}); });
    });
    moves.push({r:1,x:cx,y:cy,z:secu});
    // 3. Tours de parois seuls entre la tranche précédente et celle-ci.
    // tour<=0 : pas de tours (ébauche CAV pure, finition par contour séparé).
    const zHi=di===0?+zTop:deep[di-1];
    if(tour>0)
    for(let f=zHi-tour;f>z+1e-9;f-=tour){
      const fz=Math.round(f*1000)/1000;
      const ax=rect.x0+r, bx=rect.x1-r, ay=rect.y0+r, by=rect.y1-r;
      const ix=Math.min(ax+5,bx-1), iy=Math.min(ay+5,by-1);
      moves.push({r:1,x:ix,y:iy,z:secu});
      moves.push({r:1,x:ix,y:iy,z:fz});
      moves.push({r:0,x:ax,y:ay,z:fz});
      moves.push({r:0,x:bx,y:ay,z:fz});
      moves.push({r:0,x:bx,y:by,z:fz});
      moves.push({r:0,x:ax,y:by,z:fz});
      moves.push({r:0,x:ax,y:ay,z:fz});
      moves.push({r:1,x:ax,y:ay,z:secu});
    }
  });
  return moves;
}

/* ----- dispatch : une op -> moves (outil de sa fiche + limite rect) ----- */
function faoOpMoves(op,job){
  const tool=faoToolById(job,op&&op.toolId);
  const D=isFinite(+tool.d)&&+tool.d>0?+tool.d:10;
  // secu = dégagement RELATIF au-dessus du brut (jamais dans la matière).
  const top=(job&&job.stock&&isFinite(+job.stock.z1))?+job.stock.z1:(isFinite(+op.z)?+op.z:(isFinite(+op.ztop)?+op.ztop:0));
  const secu=top+(isFinite(+((job||{}).secu))?+job.secu:5);
  const base={toolD:D, secu:secu};
  const RA=faoRA(op||{});
  let mv=[];
  if(!op||!op.type)return [];
  if(op.type==='facing')mv=faoGenFacing(job.stock||faoStockDefault(),
    {toolD:D, ae:isFinite(+op.ae)?+op.ae:D*0.6,
     z:(isFinite(+op.z)?+op.z:(job.stock||{}).z1)+RA.axial, secu:secu});
  else if(op.type==='pocket')mv=faoGenPocket({x0:+op.x0,y0:+op.y0,x1:+op.x1,y1:+op.y1},
    +op.ztop,+op.zbot,Object.assign({},base,{ap:+op.ap,ae:isFinite(+op.ae)?+op.ae:D*0.5,
      radial:RA.radial,axial:RA.axial}));
  else if(op.type==='contour')mv=faoGenContour({x0:+op.x0,y0:+op.y0,x1:+op.x1,y1:+op.y1},
    +op.ztop,+op.zbot,Object.assign({},base,{ap:+op.ap,radial:RA.radial,axial:RA.axial}));
  else if(op.type==='drill')mv=faoGenDrill(faoLimitDrillPts(op,D),+op.ztop,+op.zbot,secu);
  else if(op.type==='pocket3d')mv=faoGenPocketRough({x0:+op.x0,y0:+op.y0,x1:+op.x1,y1:+op.y1},
    +op.ztop,+op.zbot,Object.assign({},base,{ap:+op.ap,tour:isFinite(+op.tour)?+op.tour:2,
      ae:isFinite(+op.ae)?+op.ae:D*0.5,radial:RA.radial,axial:RA.axial}));
  else if(op.type==='rough3d'){
    let am=null;
    try{ am=faoActiveMesh(job); }catch(e){ am=null; }
    // bulge : le bombé d'arrondi (≤ arrondi/2 à 90°) est repris dans les
    // rétracts pour ne jamais entamer la surépaisseur radiale (smoothing).
    const bulge=(isFinite(+op.arrondi)&&+op.arrondi>0)?+op.arrondi*0.5:0;
    const brutTop=(job&&job.stock&&isFinite(+job.stock.z1))?+job.stock.z1:null;
    if(am&&am.mesh)mv=faoGenRough3D(am.mesh,am.box,+op.ztop,+op.zbot,
      {ap:+op.ap,ap2:+op.ap2||0,ae:isFinite(+op.ae)?+op.ae:D*0.6,toolD:D,
       radial:RA.radial,axial:RA.axial,
       radial2:isFinite(+op.radial2)?+op.radial2:RA.radial,
       axial2:isFinite(+op.axial2)?+op.axial2:RA.axial,
       strategy:op.strategy||'morph',entry:op.entry||'auto',bulge:bulge,brutTop:brutTop,secu:secu});
  }
  else if(op.type==='geofinish'){
    let am=null;
    try{ am=faoActiveMesh(job); }catch(e){ am=null; }
    if(am&&am.mesh){
      const tool=faoToolById(job,op.toolId);
      mv=faoGenGeoFinish(am.mesh,
        {step:isFinite(+op.step)?+op.step:1,toolD:D,kind:tool.kind,
         cornerR:tool.cornerR,laisse:+op.laisse||0,secu:secu,seed:op.seed||'top'});
    }
  }
  // Limite : rect (Liang-Barsky rapide) ou chaîne d'arêtes (clip impair).
  // Phase suivante : chaîne d'arêtes multiples, faces.
  const lim=op.limit;
  if(lim&&lim.mode==='rect'&&mv.length){
    const R=faoEffLimit(op,D);
    if(R)mv=faoClipMovesXY(mv,R,secu);
  }else if(lim&&lim.mode==='chain'&&lim.loop&&lim.loop.length>=3&&mv.length){
    mv=faoClipMovesPoly(mv,lim,D/2,secu,2);
  }
  // Arrondi des coins (trajectoires circulaires) : ébauche 3D + 2.5D
  // (surfaçage/poche/contour/débourrage). 0 = angles vifs.
  if(op&&isFinite(+op.arrondi)&&+op.arrondi>0&&mv.length&&
     (op.type==='rough3d'||op.type==='facing'||op.type==='pocket'||op.type==='contour'||op.type==='pocket3d'))
    mv=faoRoundMoves(mv,+op.arrondi);
  return mv;
}
function faoJobMoves(job){
  // Regroupe par outil (changement d'outil si l'id change). Les ops
  // désactivées (on=false) sont ignorées partout (aperçu, temps, G-code).
  const out=[]; let cur=null;
  ((job&&job.ops)||[]).forEach(function(op){
    if(op&&op.on===false)return;
    const tool=faoToolById(job,op&&op.toolId);
    const sf=faoToolSF(tool,job);
    const key=tool.id+'|'+tool.d;
    if(!cur||cur.key!==key){
      cur={key:key, tool:{id:tool.id,num:tool.num,name:tool.name,d:tool.d,
        s:sf.s, f:sf.f, plunge:sf.plunge}, blocks:[]};
      out.push(cur);
    }
    cur.blocks.push({op:op,moves:faoOpMoves(op,job)});
  });
  return out;
}

/* ----- estimation : longueurs + temps ----- */
/* ----- arcs G2/G3 : longueur, subdivision (aperçu), arrondi des coins ----- */
// Move circulaire : {r:0, x,y,z, arc:{i,j,cw}} — i,j = centre RELATIF au point
// de départ (IJK incrémental, accepté par 840D comme 8065, balayage < 180°).
function faoSegLen(p0,m){
  if(!m.arc)return Math.hypot(m.x-p0.x,m.y-p0.y,m.z-p0.z);
  const r=Math.hypot(m.arc.i,m.arc.j);
  if(!(r>1e-9))return Math.hypot(m.x-p0.x,m.y-p0.y,m.z-p0.z);
  // Centre = point de DÉPART + IJK (incrémental départ, comme les CN).
  const cx=p0.x+m.arc.i, cy=p0.y+m.arc.j;
  let a0=Math.atan2(p0.y-cy,p0.x-cx);
  let a1=Math.atan2(m.y-cy,m.x-cx);
  let sw=a1-a0;
  if(m.arc.cw){ while(sw>=0)sw-=2*Math.PI; }
  else{ while(sw<=0)sw+=2*Math.PI; }
  return Math.abs(sw)*r;
}
function faoArcSegs(p0,m,maxStep){
  // Subdivision d'arc pour l'aperçu (pas ~5°).
  const pts=[];
  if(!m.arc)return pts;
  const r=Math.hypot(m.arc.i,m.arc.j);
  if(!(r>1e-9))return pts;
  const cx=p0.x+m.arc.i, cy=p0.y+m.arc.j;
  let a0=Math.atan2(p0.y-cy,p0.x-cx), a1=Math.atan2(m.y-cy,m.x-cx);
  let sw=a1-a0;
  if(m.arc.cw){ while(sw>=0)sw-=2*Math.PI; }
  else{ while(sw<=0)sw+=2*Math.PI; }
  const n=Math.max(2,Math.ceil(Math.abs(sw)/(Math.PI/36)));
  for(let i=1;i<=n;i++){
    const a=a0+sw*i/n;
    pts.push([cx+r*Math.cos(a),cy+r*Math.sin(a),p0.z+(m.z-p0.z)*i/n]);
  }
  return pts;
}
function faoRoundPath(pts,radius){
  // Remplace chaque coin (changement de direction 1°..179°) par un arc
  // tangent de rayon donné. Retourne des moves {r:0} (droites + arcs).
  const out=[];
  const R=isFinite(+radius)&&+radius>0?+radius:0;
  if(!(R>0)||!pts||pts.length<3)return (pts||[]).map(function(p){return {r:0,x:p.x,y:p.y,z:p.z};});
  const P=pts.map(function(p){return {x:+p.x,y:+p.y,z:+p.z};});
  out.push({r:0,x:P[0].x,y:P[0].y,z:P[0].z});
  for(let i=1;i+1<P.length;i++){
    const a=P[i-1], b=P[i], c=P[i+1];
    if(Math.abs(b.z-a.z)>1e-9||Math.abs(c.z-b.z)>1e-9){
      out.push({r:0,x:b.x,y:b.y,z:b.z}); // pas d'arc hors plan : on garde le coin
      continue;
    }
    const vix=b.x-a.x, viy=b.y-a.y, li=Math.hypot(vix,viy);
    const vox=c.x-b.x, voy=c.y-b.y, lo=Math.hypot(vox, voy);
    if(li<1e-9||lo<1e-9){ out.push({r:0,x:b.x,y:b.y,z:b.z}); continue; }
    const ux=vix/li, uy=viy/li, vx=vox/lo, vy=voy/lo;
    const dot=Math.max(-1,Math.min(1,ux*vx+uy*vy));
    const theta=Math.acos(dot); // angle de braquage
    if(!(theta>0.017&&theta<3.124)){ out.push({r:0,x:b.x,y:b.y,z:b.z}); continue; }
    let t=R/Math.tan(theta/2);
    t=Math.min(t,li/2,lo/2);
    const rr=t*Math.tan(theta/2);
    const ax=b.x-ux*t, ay=b.y-uy*t, bx=b.x+vx*t, by=b.y+vy*t;
    const cross=ux*vy-uy*vx;
    const sgn=cross>0?1:-1; // virage à gauche (CCW) : centre à gauche
    let nx=-uy*sgn, ny=ux*sgn;
    const cx=ax+nx*rr, cy=ay+ny*rr;
    // Vérifie la tangence à la sortie (garde contre les cas limites).
    if(Math.abs(Math.hypot(bx-cx,by-cy)-rr)>Math.max(1e-6,rr*1e-3)){
      out.push({r:0,x:b.x,y:b.y,z:b.z}); continue;
    }
    out.push({r:0,x:ax,y:ay,z:b.z});
    out.push({r:0,x:bx,y:by,z:b.z,arc:{i:cx-ax,j:cy-ay,cw:sgn<0}});
  }
  const last=P[P.length-1];
  out.push({r:0,x:last.x,y:last.y,z:last.z});
  return out;
}
function faoRoundMoves(moves,radius){
  // Arrondit les passages coupés, passe par passe (les rapides coupent).
  const R=isFinite(+radius)&&+radius>0?+radius:0;
  if(!(R>0))return moves;
  const out=[]; let run=[];
  const flush=function(){
    if(run.length>=3){
      const rounded=faoRoundPath(run,R);
      // Le 1er point est déjà la position courante : on l'omet.
      for(let i=1;i<rounded.length;i++)out.push(rounded[i]);
    }else{
      run.forEach(function(p){out.push({r:0,x:p.x,y:p.y,z:p.z});});
    }
    run=[];
  };
  (moves||[]).forEach(function(m){
    if(m.r||m.arc){ flush(); out.push(m); return; }
    run.push({x:m.x,y:m.y,z:m.z});
  });
  flush();
  return out;
}
function faoEstimate(moves,fCut,fRap,accel){
  const fc=isFinite(+fCut)&&+fCut>0?+fCut:1200;
  const fr=isFinite(+fRap)&&+fRap>0?+fRap:5000;
  const A=isFinite(+accel)&&+accel>0?+accel:1000;
  let cut=0, rap=0, nr=0, prev=null;
  (moves||[]).forEach(function(m){
    if(prev!==null){
      const d=faoSegLen(prev,m);
      if(m.r){ rap+=d; nr++; } else cut+=d;
    }
    prev=m;
  });
  // Temps rapide réel : d/v + v/A (trapèze : la décélération « paie » l'accélération).
  // v en mm/s = fr/60, A en mm/s² -> v/A en secondes, converti en minutes.
  const tmin=cut/fc+rap/fr+nr*(fr/60)/A/60;
  return {cut:cut, rap:rap, nr:nr, tmin:tmin};
}

/* ----- origine pièce (point de bloc sur le brut, préréglages) ----- */
// Le G-code est exprimé RELATIF à ce point (= position du G54 sur la machine).
// Phase suivante : point pièce cliqué + orientation (3+2).
function faoOriginPoint(setup){
  const s=(setup&&setup.stock)||faoStockDefault();
  const pr=(setup&&setup.origin&&setup.origin.preset)||'top-X0Y0';
  if(pr==='top-X1Y1')return [s.x1,s.y1,s.z1];
  if(pr==='top-C')return [(s.x0+s.x1)/2,(s.y0+s.y1)/2,s.z1];
  if(pr==='bot-X0Y0')return [s.x0,s.y0,s.z0];
  return [s.x0,s.y0,s.z1]; // 'top-X0Y0' : dessus, coin X0 Y0 (défaut atelier)
}
function faoOriginLabel(setup){
  const pr=(setup&&setup.origin&&setup.origin.preset)||'top-X0Y0';
  return pr==='top-X1Y1'?'dessus coin X1Y1':pr==='top-C'?'dessus centre':
    pr==='bot-X0Y0'?'dessous coin X0Y0':'dessus coin X0Y0';
}
/* ----- plans : retrait (absolu, auto = dessus + 25) ----- */
function faoRetractZ(setup){
  if(setup&&isFinite(+setup.retract))return +setup.retract;
  const s=(setup&&setup.stock)||faoStockDefault();
  return (isFinite(+s.z1)?+s.z1:0)+25;
}
/* ================= post-processeurs ================= */
// Table des machines : `kind` porte le dialecte (commentaires, numérotation,
// fin de programme) — le corps du programme est commun aux dialectes.
const FAO_POSTS={
  siemens630:{label:'Siemens 840D · 630', ext:'mpf', parkX:'X-200', kind:'siemens'},
  siemens1520:{label:'Siemens 840D · 1520', ext:'mpf', parkX:'X-430', kind:'siemens'},
  fagor8065:{label:'Fagor 8065', ext:'nc', kind:'fagor'}
};
function faoToday(){ try{ return new Date().toISOString().slice(0,10); }catch(e){ return ''; } }

function faoArcWords(m,ox,oy,oz){
  // Bloc G2/G3 complet, IJK incrémental (centre relatif au départ).
  return (m.arc.cw?'G2 ':'G3 ')+'X'+faoFmtXYZ(m.x-ox)+' Y'+faoFmtXYZ(m.y-oy)+
    ' Z'+faoFmtXYZ(m.z-oz)+' I'+faoFmtXYZ(m.arc.i)+' J'+faoFmtXYZ(m.arc.j);
}
/* ----- cycle de perçage dialecte (P1-a) -----
   Mêmes valeurs que le déroulé G0/G1 (retrait = brut + secu, plan de
   référence = ztop, profondeur = zbot) : la prévisualisation, l'estimation
   et le garde-fou « sous le brut » restent calés sur le déroulé.
   Siemens 840D : CYCLE81(RTP,RFP,SDIS,DP) / CYCLE83 (broche à va-et-vient,
   paramètres alignés sur PostPro/630-5axes.cps).
   Fagor 8065    : `G98 G81 X Y Z I F` / `G98 G83 X Y Z I J F` (aligné sur
   PostPro/fagor-8065.cps) + annulation `G80` (cycles modaux). */
function faoDrillCycle(op,job,oz){
  if(!op||op.type!=='drill')return null;
  const tool=faoToolById(job,op.toolId)||{};
  const pts=faoLimitDrillPts(op,+tool.d);
  const zt=+op.ztop, zb=+op.zbot;
  if(!pts||!pts.length||!isFinite(zt)||!isFinite(zb))return null;
  const top=(job&&job.stock&&isFinite(+job.stock.z1))?+job.stock.z1:zt;
  const secuAbs=top+(isFinite(+((job||{}).secu))?+job.secu:5);
  const RFP=zt-oz, RTP=secuAbs-oz, SDIS=RTP-RFP, DP=zb-oz;
  let peck=isFinite(+op.peck)?+op.peck:0;
  const span=zt-zb;
  if(!(peck>0&&span>peck))peck=0;
  return {pts:pts,RTP:RTP,RFP:RFP,SDIS:SDIS,DP:DP,peck:peck,span:span};
}
// Post unifié : un seul corps de programme, dialecte réduit à la tête/pied + style de ligne.
//  - Siemens 840D : lignes brutes, commentaires `;`, fin SUPA Z600 + parc machine
//  - Fagor 8065    : lignes numérotées `N##` (+5), commentaires `( … )`, retrait Z classique
// Plongée : le F de plongée ne s'applique qu'à la première plongée Z après un rapide —
// un pur déplacement XY garde l'avance de coupe (correctif du bug Fagor).
function faoPost(job,postId){
  const id=postId||(job&&(job.machine||job.post))||'siemens630';
  const post=FAO_POSTS[id]||FAO_POSTS.siemens630;
  const fag=post.kind==='fagor';
  const name=faoProgName(job.name);
  const wcs=job.wcs||'G54';
  const OG=faoOriginPoint(job), ox=OG[0], oy=OG[1], oz=OG[2];
  const retr=faoRetractZ(job);
  // Indexation 3+2 (table C + B) : {0,0} = 3 axes strictement inchangé.
  const ORI=faoOrient(job), ori32=(ORI.b!==0||ORI.c!==0);
  const groups=faoJobMoves(job);
  // Garde-fou : aucun move de coupe (G1/G2/G3) sous le fond du brut — signalé en
  // tête de programme (le opérateur le voit) et remonté dans le résultat (warns).
  const z0=(job&&job.stock&&isFinite(+job.stock.z0))?+job.stock.z0:0;
  let sousBrut=0, zMin=Infinity;
  groups.forEach(function(g){ g.blocks.forEach(function(b){ b.moves.forEach(function(m){
    if(!m.r&&isFinite(+m.z)&&+m.z<z0-1e-6){ sousBrut++; if(+m.z<zMin)zMin=+m.z; }
  });}); });
  const warns=[];
  if(sousBrut)warns.push(sousBrut+' move(s) de coupe sous le brut (Zmin '+
    faoFmtXYZ(zMin)+' < fond du brut '+faoFmtXYZ(z0)+')');
  if(ori32&&fag)warns.push('3+2 (B'+ORI.b+' C'+ORI.c+') : Fagor 8065 = machine 3 axes — indexation '+
    'IGNORÉE : B/C non commandés, programme émis en 3 axes (la pièce ne sera PAS inclinée). '+
    'Remettre 3 axes ou exporter sur Siemens.');
  const staleCh=(job.ops||[]).filter(function(o){
    return o&&o.on!==false&&o.limit&&o.limit.mode==='chain'&&o.limit.stale;
  }).length;
  if(staleCh)warns.push(staleCh+' opération(s) : limite « chaîne » obsolète (arêtes du modèle '+
    'non retrouvées) — re-sélectionner la chaîne avant export');
  const L=[]; let n=10;
  const nc=function(s){ if(fag){ L.push('N'+n+' '+s); n+=5; } else L.push(s); };
  const cmt=function(s){ L.push(fag?('( '+s+' )'):('; '+s)); };
  const cool=fag?((job.coolant==='off')?null:'M08')
                :((job.coolant==='off')?'M9':(job.coolant==='through'?'M8':'M7'));
  // G40 (annule la compensation d'outil) + G80 (annule les cycles en canneau) en
  // entête : programme démarré proprement, jamais laissé d'un usage précédent.
  if(fag){
    L.push('('+name+' - MiniFusion FAO '+FAO_VER+' - '+post.label+' - '+faoToday()+')');
    L.push('('+faoOriginLabel(job)+' - origine '+wcs+')');
    if(warns.length)cmt('ATTENTION : '+warns.join(' ; '));
    nc('G71 G40 G80 G17 G90 G94 '+wcs);
  }else{
    L.push('; %_N_'+name+'_MPF');
    L.push('; MiniFusion FAO '+FAO_VER+' — '+post.label+' — '+faoToday());
    L.push('; Origine '+wcs+' : '+faoOriginLabel(job)+
      ' ('+faoFmtXYZ(ox)+','+faoFmtXYZ(oy)+','+faoFmtXYZ(oz)+')');
    if(warns.length)cmt('ATTENTION : '+warns.join(' ; '));
    nc('G71');
    nc('G40 G80 G17 G90 G94 '+wcs);
  }
  // 3+2 : indexation de table AVANT tout usinage. Siemens : TRAORI(1) — le
  // contrôleur transforme XYZ (arcs et cycles restent dans le repère pièce).
  // Fagor 8065 = machine 3 AXES uniquement : aucun axe rotatif — ne JAMAIS
  // commander B/C (alarme CN) ni laisser croire à une inclinaison : à plat.
  if(ori32){
    if(fag){
      cmt('3+2 : B'+faoFmtXYZ(ORI.b)+' C'+faoFmtXYZ(ORI.c)+
        ' demandé — machine 3 axes : B/C NON commandés, usinage à plat (voir avertissement)');
    }else{
      nc('TRAORI(1)');
      nc('G0 B'+faoFmtXYZ(ORI.b)+' C'+faoFmtXYZ(ORI.c));
    }
  }
  groups.forEach(function(g,gi){
    const t=g.tool;
    const S=faoFmtS(t.s), F=faoFmtF(t.f), FP=faoFmtF(t.plunge);
    if(gi>0){ nc(fag?'M09':'M9'); nc('G0 Z'+faoFmtXYZ(retr-oz)); }
    cmt('OUTIL T'+(t.num||1)+' '+faoKindLabel((faoToolById(job,t.id)||{}).kind)+
      ' D'+faoFmtXYZ(t.d)+' S'+S+' F'+F);
    if(fag){ nc('T'+(t.num||1)+' D1 M06'); }else{ nc('T'+(t.num||1)+' D1'); nc('M6'); }
    nc('S'+S+(fag?' M03':' M3'));
    if(cool&&cool!=='M9')nc(cool);
    g.blocks.forEach(function(b){
      cmt(faoOpLabel(b.op,job));
      // P1-a : perçage émis en cycle dialecte — le déroulé G0/G1 reste la
      // source prévisualisation/estimation/garde-fou mais n'est pas écrit ici.
      const DC=faoDrillCycle(b.op,job,oz);
      if(DC){
        DC.pts.forEach(function(p){
          const X='X'+faoFmtXYZ(+p[0]-ox), Y='Y'+faoFmtXYZ(+p[1]-oy);
          if(fag){
            if(DC.peck){
              const pl=Math.max(Math.floor(DC.span/DC.peck),1);
              const inc=-(DC.span/pl);
              nc('G98 G83 '+X+' '+Y+' Z'+faoFmtXYZ(DC.RTP)+
                ' I'+faoFmtXYZ(inc)+' J'+pl+' F'+FP);
            }else{
              nc('G98 G81 '+X+' '+Y+' Z'+faoFmtXYZ(DC.RTP)+
                ' I'+faoFmtXYZ(DC.DP)+' F'+FP);
            }
          }else{
            // F de plongée sur chaque G0 : séquence d'avances identique au Fagor.
            nc('G0 '+X+' '+Y+' Z'+faoFmtXYZ(DC.RTP)+' F'+FP);
            nc(DC.peck
              ? 'CYCLE83('+faoFmtXYZ(DC.RTP)+', '+faoFmtXYZ(DC.RFP)+', '+
                faoFmtXYZ(DC.SDIS)+', '+faoFmtXYZ(DC.DP)+', , '+
                faoFmtXYZ(DC.RFP-DC.peck)+', , 0, , , 1, 1, , '+
                faoFmtXYZ(DC.peck)+', 0, 0, 0)'
              : 'CYCLE81('+faoFmtXYZ(DC.RTP)+', '+faoFmtXYZ(DC.RFP)+', '+
                faoFmtXYZ(DC.SDIS)+', '+faoFmtXYZ(DC.DP)+', )');
          }
        });
        if(fag)nc('G80'); // Fagor : les cycles sont modaux, annulation obligatoire
        return;
      }
      let first=true;
      b.moves.forEach(function(m){
        const X='X'+faoFmtXYZ(m.x-ox), Y='Y'+faoFmtXYZ(m.y-oy), Z='Z'+faoFmtXYZ(m.z-oz);
        if(m.r){ nc('G0 '+X+' '+Y+' '+Z); first=true; }
        else if(m.arc){ nc(faoArcWords(m,ox,oy,oz)+' F'+F); first=false; }
        else{
          // première plongée après un rapide : avance de plongée, sinon avance de coupe.
          const plunge=first&&/Z/.test(Z);
          nc('G1 '+X+' '+Y+' '+Z+' F'+(plunge?FP:F));
          first=false;
        }
      });
    });
  });
  // 3+2 : annuler la transformation AVANT les coordonnées machine de fin (SUPA/park).
  if(ori32&&!fag)nc('TRAFOOF');
  if(fag){
    nc('M09');
    nc('G0 Z'+faoFmtXYZ(retr-oz));
  }else{
    nc('M9');
    nc('G0 SUPA Z600 D0');
    nc('G0 '+post.parkX);
  }
  nc('M30');
  return {code:L.join('\n')+'\n', ext:post.ext, warns:warns};
}

function faoOpLabel(op,job){
  if(!op)return '?';
  const t=op.type;
  const tool=job?faoToolById(job,op.toolId):null;
  const tag=tool?(' [T'+tool.num+' D'+tool.d+']'):'';
  const off=(op&&op.on===false)?' (désactivée)':'';
  const RA=faoRA(op||{});
  const ra=((op&&(op.type==='pocket'||op.type==='contour'||op.type==='rough3d'||op.type==='facing'))&&(RA.radial>0||RA.axial>0))?(' R'+RA.radial+' A'+RA.axial):'';
  const lim=(op&&op.limit&&(op.limit.mode==='rect'||(op.limit.mode==='chain'&&(op.limit.loop||[]).length>=3)))
    ?' [limite]'+(op.limit.stale?'⚠':''):'';
  if(t==='facing')return 'Surfaçage Z='+op.z+tag+off+ra+lim;
  if(t==='pocket')return 'Poche ['+op.x0+','+op.y0+' -> '+op.x1+','+op.y1+'] '+op.ztop+' -> '+op.zbot+ra+tag+off+lim;
  if(t==='contour')return 'Contour ['+op.x0+','+op.y0+' -> '+op.x1+','+op.y1+'] '+op.ztop+' -> '+op.zbot+ra+tag+off+lim;
  if(t==='drill')return 'Perçage '+(op.pts||[]).length+' trou(s) '+op.ztop+' -> '+op.zbot+((+op.peck)>0?' Q'+op.peck:'')+tag+off+lim;
  if(t==='rough3d')return 'Ébauche 3D '+op.ztop+' -> '+op.zbot+' ap '+op.ap+
    (isFinite(+op.ap2)&&+op.ap2>0?(' +fin '+op.ap2):'')+ra+tag+off+lim;
  if(t==='pocket3d')return 'Débourrage ['+op.x0+','+op.y0+' -> '+op.x1+','+op.y1+'] '+
    op.ztop+' -> '+op.zbot+' ap '+op.ap+' tours '+op.tour+ra+tag+off+lim;
  if(t==='geofinish')return 'Finition géodésique pas '+op.step+tag+off+lim;
  return t;
}

/* ================= prévisualisation 3D (décor, jamais de rejeu) ================= */
let faoPrevGroup=null, faoPrevOn=true;
function faoClearPreview(){
  try{
    if(faoPrevGroup&&typeof scene!=='undefined'&&scene){
      scene.remove(faoPrevGroup);
      try{ faoPrevGroup.traverse(function(o){ if(o.geometry&&o.geometry.dispose)o.geometry.dispose(); }); }catch(e){}
    }
  }catch(e){}
  faoPrevGroup=null;
}
function faoRefreshPreview(){
  faoClearPreview();
  if(!faoPrevOn)return 0;
  const job=faoDoc(); let total=0;
  try{
    if(typeof THREE==='undefined'||typeof scene==='undefined'||!scene)return 0;
    faoPrevGroup=new THREE.Group(); faoPrevGroup.name='faoPreview';
    const mk=function(moves){
      // Segments par PAIRE CONSECUTIVE de la séquence réelle : coupe->coupe
      // en vert, tout passage par un rapide en rouge. Plus aucune liaison
      // fantôme entre passes disjointes.
      if(!moves||!moves.length)return;
      try{
        const cut=[], rap=[];
        let prev=null;
        const seg=function(arr,ax,ay,az,bx,by,bz){ arr.push(ax,ay,az,bx,by,bz); };
        moves.forEach(function(m){
          if(prev!==null){
            const arr=(!prev.r&&!m.r)?cut:rap;
            if(m.arc&&!prev.r){
              let pp={x:prev.x,y:prev.y,z:prev.z};
              faoArcSegs(prev,m).forEach(function(q){
                seg(arr,pp.x,pp.y,pp.z,q[0],q[1],q[2]); pp={x:q[0],y:q[1],z:q[2]};
              });
            }else{
              seg(arr,prev.x,prev.y,prev.z,m.x,m.y,m.z);
            }
          }
          prev=m;
        });
        const add=function(arr,color){
          if(arr.length<6)return;
          const g=new THREE.BufferGeometry();
          g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(arr),3));
          faoPrevGroup.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:color})));
        };
        add(cut,0x30d158);
        add(rap,0xff453a);
      }catch(e){}
    };
    (job.ops||[]).forEach(function(op){
      if(op&&op.on===false)return;
      const mv=faoOpMoves(op,job); total+=mv.length;
      mk(mv);
    });
    scene.add(faoPrevGroup);
  }catch(e){}
  return total;
}

/* ================= interface (bouton + panneau flottant) ================= */
function faoOpDefaults(type){
  const s=faoStock(); const job=faoDoc();
  const tool=(job.tools&&job.tools[0])||{id:'T1',d:10};
  const cx=(s.x0+s.x1)/2, cy=(s.y0+s.y1)/2;
  const base={id:faoNewId('op'), on:true, toolId:tool.id, radial:0, axial:0};
  const D=isFinite(+tool.d)?+tool.d:10;
  if(type==='facing')return Object.assign({},base,{type:'facing', z:s.z1, ae:+(D*0.6).toFixed(2), arrondi:0});
  if(type==='pocket')return Object.assign({},base,{type:'pocket',
    x0:+(s.x0+job.marge).toFixed(2), y0:+(s.y0+job.marge).toFixed(2),
    x1:+(s.x1-job.marge).toFixed(2), y1:+(s.y1-job.marge).toFixed(2),
    ztop:s.z1, zbot:s.z0, ap:5, ae:+(D*0.5).toFixed(2), radial:0.5, axial:0.5, arrondi:0});
  if(type==='pocket3d')return Object.assign({},base,{type:'pocket3d',
    x0:+(s.x0+job.marge).toFixed(2), y0:+(s.y0+job.marge).toFixed(2),
    x1:+(s.x1-job.marge).toFixed(2), y1:+(s.y1-job.marge).toFixed(2),
    ztop:s.z1, zbot:s.z0, ap:6, tour:2, ae:+(D*0.5).toFixed(2),
    radial:0.5, axial:0.5, arrondi:+(Math.min(2,D*0.25)).toFixed(2)});
  if(type==='contour')return Object.assign({},base,{type:'contour',
    x0:s.x0, y0:s.y0, x1:s.x1, y1:s.y1, ztop:s.z1, zbot:s.z0, ap:5, radial:0.5, axial:0.5, arrondi:0});
  if(type==='drill')return Object.assign({},base,{type:'drill',
    pts:[[+cx.toFixed(2),+cy.toFixed(2)]], ztop:s.z1, zbot:s.z0, peck:0});
  if(type==='rough3d')return Object.assign({},base,{type:'rough3d',
    ztop:s.z1, zbot:s.z0, ap:5, ap2:1, ae:+(D*0.6).toFixed(2),
    radial:0.5, axial:0.5, radial2:0.25, axial2:0.25, strategy:'morph', entry:'auto',
    arrondi:+(Math.min(2,D*0.25)).toFixed(2)});
  if(type==='geofinish')return Object.assign({},base,{type:'geofinish',
    step:1, laisse:0, seed:'top'});
  return Object.assign({},base,{type:type});
}
/* ================= interface FAO : arbre + fiches panneau droit ================= */
// Arbre FAO dédié (overlay dans la vue 3D) : posages > opérations, état on/off,
// badge outil. La fiche du posage / de l'op sélectionnée s'affiche dans le
// panneau droit (#props), comme toute fonction dessin (hook dans renderProps).
function faoH(t){ const h=document.createElement('div');
  h.style.cssText='font-weight:700;font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;color:#98989d;margin-top:4px;';
  h.textContent=t; return h; }
function faoRow(){ const d=document.createElement('div');
  d.style.cssText='display:flex;gap:6px;align-items:center;flex-wrap:wrap;'; return d; }
function faoLab(t){ const s=document.createElement('span'); s.textContent=t;
  s.style.cssText='color:rgba(255,255,255,.6);font-size:.74rem;'; return s; }
function faoSnapshot(title){
  // Instantané du document AVANT mutation — même discipline que le modèle dessin
  // (45-annuler-document.js) : Ctrl+Z revient à l'état FAO précédent. Le titre du
  // widget (infobulle) devient le libellé dans le bouton « Annuler ».
  try{
    if(typeof docPushUndo==='function')
      docPushUndo('FAO : '+(title?String(title).slice(0,48):'modification'));
  }catch(e){}
}
function faoChanged(){ faoTouch(); faoRefreshPreview(); faoRefreshFaoUI(); }
function faoNum(val,fn,w,step,title){
  const i=document.createElement('input'); i.type='number'; i.value=val; i.style.width=(w||60)+'px';
  if(step)i.step=step;
  if(title)i.title=title;
  i.onchange=function(){ const v=parseFloat(i.value); if(isFinite(v)){ faoSnapshot(title); fn(v); faoChanged(); } };
  return i; }
function faoTxt(val,fn,w,title){
  const i=document.createElement('input'); i.type='text'; i.value=val; i.style.width=(w||120)+'px';
  if(title)i.title=title;
  i.onchange=function(){ faoSnapshot(title); fn(i.value); faoChanged(); };
  return i; }
function faoSel(opts,val,fn,title){
  const s=document.createElement('select');
  opts.forEach(function(o){ const op=document.createElement('option');
    op.value=o[0]; op.textContent=o[1]; if(o[2])op.title=o[2]; s.appendChild(op); });
  s.value=val;
  if(title)s.title=title;
  s.onchange=function(){ faoSnapshot(title); fn(s.value); faoChanged(); };
  return s; }
function faoMini(t,fn,title){
  const b=document.createElement('button'); b.textContent=t; b.style.fontSize='.72rem';
  if(title)b.title=title;
  b.onclick=function(){ faoSnapshot(title||('bouton « '+t+' »')); fn(); faoChanged(); };
  return b; }
function faoHelp(t){
  // Ligne d'aide sous un groupe de champs (néophytes : quoi mettre et pourquoi).
  const n=document.createElement('div');
  n.style.cssText='font-size:.68rem;color:rgba(255,255,255,.55);line-height:1.35;flex-basis:100%;';
  n.textContent=t; return n; }
function faoCard(){
  const d=document.createElement('div');
  d.style.cssText='display:flex;flex-direction:column;gap:6px;background:rgba(255,255,255,.05);'
    +'border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:6px 8px;margin:4px 0;';
  return d; }
function faoRefreshFaoUI(){
  try{ faoRenderTree(); }catch(e){}
  try{
    if(typeof sel!=='undefined'&&sel&&sel.kind&&(sel.kind==='faoSetup'||sel.kind==='faoOp')
      &&typeof renderProps==='function')renderProps();
  }catch(e){}
}
function faoInitUI(){
  if(typeof document==='undefined')return;
  try{
    if(!document.getElementById('btnFao')){
      const anchor=document.getElementById('btnExtrude');
      if(anchor&&anchor.parentNode){
        const b=document.createElement('button');
        b.id='btnFao'; b.textContent='FAO';
        b.title='Fraisage : posages, surfaçage, poche, contour, perçage, 3D + G-code Siemens 840D / Fagor 8065.';
        b.onclick=function(){
          try{
            const w=document.getElementById('faoTreeWrap');
            if(w)w.style.display=(w.style.display==='none')?'block':'none';
          }catch(e){}
        };
        anchor.parentNode.insertBefore(b,anchor.nextSibling);
      }
    }
    if(!document.getElementById('faoTreeWrap')){
      const host=document.getElementById('vpwrap')||document.body;
      const w=document.createElement('div');
      w.id='faoTreeWrap';
      w.style.cssText='position:absolute;top:52px;right:10px;z-index:20;width:244px;'
        +'max-height:calc(100% - 130px);overflow-y:auto;padding:10px 12px;border-radius:12px;'
        +'background:rgba(16,18,22,.85);border:1px solid rgba(255,255,255,.13);color:#e9e9ec;'
        +'font-size:.78rem;backdrop-filter:blur(7px);';
      const t=document.createElement('div');
      t.style.cssText='margin:0 0 6px;font-size:.76rem;font-weight:700;color:#fff;';
      t.textContent='FAO · posages';
      w.appendChild(t);
      const tree=document.createElement('div'); tree.id='faoTree'; w.appendChild(tree);
      const add=document.createElement('button'); add.textContent='+ Posage'; add.style.fontSize='.72rem';
      add.style.marginTop='6px';
      add.onclick=function(){
        try{
          const r=faoRoot();
          faoSnapshot('nouveau posage');
          const s=faoDefaultSetup(); s.name='POSAGE'+(r.setups.length+1);
          r.setups.push(s); r.activeSetupId=s.id;
          faoChanged();
        }catch(e){}
      };
      w.appendChild(add);
      host.appendChild(w);
    }
    faoRenderTree();
  }catch(e){}
}
function faoRenderTree(){
  let tree=null;
  try{ tree=document.getElementById('faoTree'); }catch(e){ return; }
  if(!tree)return;
  try{
    tree.innerHTML='';
    const r=faoRoot();
    const isSel=function(kind,id){ try{
      return typeof sel!=='undefined'&&sel&&sel.kind===kind&&sel.id===id;
    }catch(e){ return false; } };
    r.setups.forEach(function(s,si){
      const h=document.createElement('div');
      h.style.cssText='font-weight:700;font-size:.76rem;margin:6px 0 2px;cursor:pointer;'
        +'padding:3px 6px;border-radius:6px;'
        +(isSel('faoSetup',s.id)?'background:rgba(10,132,255,.4);':'');
      h.textContent='▤ '+s.name+' · '+(FAO_POSTS[s.machine||s.post]?FAO_POSTS[s.machine||s.post].label:s.machine)
        +(faoOrientOn(s)?(' · 3+2 B'+faoOrient(s).b+' C'+faoOrient(s).c):'');
      h.title='Clic = fiche du posage dans le panneau droit';
      h.onclick=function(){ faoSelectSetup(s.id); };
      tree.appendChild(h);
      (s.ops||[]).forEach(function(op,i){
        const d=document.createElement('div');
        d.style.cssText='display:flex;gap:6px;align-items:center;padding:3px 6px 3px 14px;'
          +'border-radius:6px;cursor:pointer;font-size:.76rem;'
          +(isSel('faoOp',op.id)?'background:rgba(10,132,255,.4);':'')
          +(op.on===false?'opacity:.5;':'');
        d.title='Clic = fiche dans le panneau droit';
        const eye=document.createElement('span');
        eye.textContent=op.on===false?'○':'●'; eye.title='Activer / désactiver';
        eye.style.color=op.on===false?'#98989d':'#30d158';
        eye.onclick=function(ev){ try{ if(ev&&ev.stopPropagation)ev.stopPropagation(); }catch(e){}
          faoSnapshot('activer/désactiver « '+faoOpShortLabel(op)+' »');
          op.on=!(op.on!==false); faoChanged(); };
        const lb=document.createElement('span'); lb.style.flex='1';
        lb.textContent=(i+1)+'. '+faoOpShortLabel(op);
        const tool=faoToolById(s,op.toolId);
        const badge=document.createElement('span');
        badge.style.cssText='font-size:.68rem;color:#7ee0c0;font-weight:700;';
        badge.textContent='[T'+(tool.num||'?')+']';
        d.appendChild(eye); d.appendChild(lb); d.appendChild(badge);
        d.onclick=function(){ faoSelectOp(s.id,op.id); };
        tree.appendChild(d);
      });
    });
  }catch(e){}
}
function faoOpShortLabel(op){
  const n={facing:'Surfaçage',pocket:'Poche',contour:'Contour',drill:'Perçage',
    rough3d:'Ébauche 3D',geofinish:'Finition géod.',pocket3d:'Débourrage'}[op.type]||op.type;
  if(op.type==='drill')return n+' ('+(op.pts||[]).length+')';
  return n;
}
function faoSelectSetup(id){
  try{
    const r=faoRoot(); r.activeSetupId=id;
    sel={kind:'faoSetup',id:id};
    if(typeof renderTree==='function')renderTree();
    if(typeof renderProps==='function')renderProps();
    faoRenderTree();
  }catch(e){}
}
function faoSelectOp(setupId,opId){
  try{
    const r=faoRoot(); r.activeSetupId=setupId;
    sel={kind:'faoOp',id:opId,setup:setupId};
    if(typeof renderTree==='function')renderTree();
    if(typeof renderProps==='function')renderProps();
    faoRenderTree();
  }catch(e){}
}
/* ----- bibliothèque d'outils (élément réutilisable) ----- */
function faoToolsElement(setup){
  const wrap=document.createElement('div');
  const H=faoH('Outils ('+(setup.tools||[]).length+') · Vc/fz → S/F auto');
  wrap.appendChild(H);
  (setup.tools||[]).forEach(function(t,ti){
    const sf=faoToolSF(t,setup);
    const d=faoCard();
    const r=faoRow();
    r.appendChild(faoLab('T'+t.num));
    r.appendChild(faoTxt(t.name,function(v){ t.name=String(v||t.name).slice(0,24); },92));
    r.appendChild(faoSel([['flat','Cylindrique'],['bull','Torique'],['ball','Boule']],t.kind||'flat',
      function(v){ t.kind=v; if(v==='ball')t.cornerR=t.d/2; }));
    r.appendChild(faoMini('✕',function(){
      if(setup.tools.length<=1)return;
      setup.tools.splice(ti,1);
      setup.tools.forEach(function(k,i){ k.num=i+1; });
    }));
    d.appendChild(r);
    const r2=faoRow();
    r2.appendChild(faoLab('D')); r2.appendChild(faoNum(t.d,function(v){ t.d=Math.max(0.5,v);
      if(t.kind==='ball')t.cornerR=t.d/2; },52));
    if(t.kind==='bull'){ r2.appendChild(faoLab('r')); r2.appendChild(faoNum(t.cornerR||0,function(v){ t.cornerR=Math.max(0,v); },44)); }
    r2.appendChild(faoLab('dents')); r2.appendChild(faoNum(t.flutes,function(v){ t.flutes=Math.max(1,Math.round(v)); },40));
    d.appendChild(r2);
    const r3=faoRow();
    r3.appendChild(faoLab('Vc')); r3.appendChild(faoNum(t.vc,function(v){ t.vc=Math.max(1,v); },56));
    r3.appendChild(faoLab('fz')); r3.appendChild(faoNum(t.fz,function(v){ t.fz=Math.max(0.005,v); },52,0.01));
    const s=document.createElement('span');
    s.style.cssText='font-family:monospace;font-size:.72rem;color:#7ee0c0;';
    s.textContent='→ S'+sf.s+' F'+sf.f+' (plongée '+sf.plunge+')';
    r3.appendChild(s);
    d.appendChild(r3);
    wrap.appendChild(d);
  });
  const rT=faoRow();
  const bT=document.createElement('button'); bT.textContent='+ Outil'; bT.style.fontSize='.72rem';
  bT.onclick=function(){
    faoSnapshot('nouvel outil');
    const n=(setup.tools||[]).length+1;
    setup.tools.push({id:'T'+n+'_'+Date.now().toString(36),num:n,name:'Fraise D10',kind:'flat',
      d:10,cornerR:0,flutes:2,vc:250,fz:0.06});
    faoChanged();
  };
  rT.appendChild(bT); wrap.appendChild(rT);
  return wrap;
}
/* ----- fiche d'opération (élément réutilisable) ----- */
function faoToolOpts(setup){
  return (setup.tools||[]).map(function(t){
    const sf=faoToolSF(t,setup);
    return [t.id,'T'+t.num+' '+t.name+' (S'+sf.s+' F'+sf.f+')']; });
}
function faoOpCardElement(setup,op,i){
  const d=faoCard();
  if(op.on===false)d.style.opacity='0.55';
  const typeName={facing:'Surfaçage',pocket:'Poche',contour:'Contour',drill:'Perçage',
    rough3d:'Ébauche 3D',geofinish:'Finition géod.',pocket3d:'Débourrage poche'};
  const r=faoRow();
  const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=op.on!==false;
  cb.title='Décocher = ignorer cette opération (aperçu, temps, G-code)';
  cb.onchange=function(){ faoSnapshot('activer/désactiver « '+(typeName[op.type]||op.type)+' »');
    op.on=cb.checked; faoChanged(); };
  r.appendChild(cb);
  const tt=document.createElement('span');
  tt.style.cssText='font-weight:700;font-size:.76rem;flex:1;';
  tt.textContent=(i+1)+'. '+(typeName[op.type]||op.type);
  r.appendChild(tt);
  r.appendChild(faoSel(faoToolOpts(setup),op.toolId,function(v){ op.toolId=v; },
    'Outil de cette opération (vitesse et avance calculées depuis sa fiche)'));
  r.appendChild(faoMini('↑',function(){ if(i>0){ setup.ops.splice(i,1); setup.ops.splice(i-1,0,op); } },
    'Remonter cette opération (usinée plus tôt)'));
  r.appendChild(faoMini('↓',function(){ if(i<setup.ops.length-1){ setup.ops.splice(i,1); setup.ops.splice(i+1,0,op); } },
    'Descendre cette opération (usinée plus tard)'));
  r.appendChild(faoMini('✕',function(){ setup.ops.splice(i,1); },'Supprimer cette opération'));
  d.appendChild(r);
  const rp=faoRow();
  const rect4=function(){
    rp.appendChild(faoLab('X')); rp.appendChild(faoNum(op.x0,function(v){op.x0=v;},56));
    rp.appendChild(faoLab('Y')); rp.appendChild(faoNum(op.y0,function(v){op.y0=v;},56));
    rp.appendChild(faoLab('→')); rp.appendChild(faoNum(op.x1,function(v){op.x1=v;},56));
    rp.appendChild(faoNum(op.y1,function(v){op.y1=v;},56));
  };
  const zz=function(){
    rp.appendChild(faoLab('Zhaut')); rp.appendChild(faoNum(op.ztop,function(v){op.ztop=v;},56));
    rp.appendChild(faoLab('Zbas')); rp.appendChild(faoNum(op.zbot,function(v){op.zbot=v;},56));
  };
  if(op.type==='facing'){
    rp.appendChild(faoLab('Z')); rp.appendChild(faoNum(op.z,function(v){op.z=v;},60));
    rp.appendChild(faoLab('pas')); rp.appendChild(faoNum(op.ae,function(v){op.ae=Math.max(0.5,v);},52));
    rp.appendChild(faoLab('laisse Z')); rp.appendChild(faoNum(faoRA(op).axial,function(v){op.axial=Math.max(0,v);},48,0.1));
    rp.appendChild(faoLab('Arrondi')); rp.appendChild(faoNum(isFinite(+op.arrondi)?+op.arrondi:0,function(v){op.arrondi=Math.max(0,v);},48,0.5));
  }else if(op.type==='pocket'||op.type==='contour'){
    rect4(); zz();
    rp.appendChild(faoLab('ap')); rp.appendChild(faoNum(op.ap,function(v){op.ap=Math.max(0.5,v);},48));
    if(op.type==='pocket'){ rp.appendChild(faoLab('pas')); rp.appendChild(faoNum(op.ae,function(v){op.ae=Math.max(0.5,v);},48)); }
    rp.appendChild(faoLab('R')); rp.appendChild(faoNum(faoRA(op).radial,function(v){op.radial=Math.max(0,v);},44,0.1));
    rp.appendChild(faoLab('A')); rp.appendChild(faoNum(faoRA(op).axial,function(v){op.axial=Math.max(0,v);},44,0.1));
    rp.appendChild(faoLab('Arrondi')); rp.appendChild(faoNum(isFinite(+op.arrondi)?+op.arrondi:0,function(v){op.arrondi=Math.max(0,v);},48,0.5));
  }else if(op.type==='pocket3d'){
    rect4(); zz();
    rp.appendChild(faoLab('ap')); rp.appendChild(faoNum(op.ap,function(v){op.ap=Math.max(0.5,v);},48,0.5));
    rp.appendChild(faoLab('tours')); rp.appendChild(faoNum(op.tour||0,function(v){op.tour=Math.max(0,v);},48,0.5));
    rp.appendChild(faoLab('pas')); rp.appendChild(faoNum(op.ae,function(v){op.ae=Math.max(0.5,v);},48));
    rp.appendChild(faoLab('R')); rp.appendChild(faoNum(faoRA(op).radial,function(v){op.radial=Math.max(0,v);},44,0.1));
    rp.appendChild(faoLab('A')); rp.appendChild(faoNum(faoRA(op).axial,function(v){op.axial=Math.max(0,v);},44,0.1));
    rp.appendChild(faoLab('Arrondi')); rp.appendChild(faoNum(isFinite(+op.arrondi)?+op.arrondi:0,function(v){op.arrondi=Math.max(0,v);},48,0.5));
    const nt=document.createElement('div');
    nt.style.cssText='font-size:.68rem;color:rgba(255,255,255,.5);';
    nt.textContent='Pleines passes à ap + tours de parois seuls au pas tours.';
    d.appendChild(nt);
  }else if(op.type==='rough3d'){
    // --- fiche Ébauche 3D : sections titrées pour les néophytes.
    // Chaque champ porte son nom complet + infobulle ; les stratégies et
    // l'entrée sont expliquées en une ligne, avec garde-fous chiffrés.
    const strat=op.strategy||'morph';
    const toolD=(function(){ const t=faoToolById(setup,op.toolId);
      return (isFinite(+t.d)&&+t.d>0)?+t.d:10; })();
    const aeNow=isFinite(+op.ae)&&+op.ae>0?+op.ae:toolD*0.6;
    const apNow=isFinite(+op.ap)&&+op.ap>0?+op.ap:5;
    d.appendChild(faoH('Hauteurs à usiner (mm)'));
    const rZ=faoRow();
    rZ.appendChild(faoLab('Haut')); rZ.appendChild(faoNum(op.ztop,function(v){op.ztop=v;},56,
      null,'Niveau le plus haut usiné — en général le dessus du brut.'));
    rZ.appendChild(faoLab('Bas')); rZ.appendChild(faoNum(op.zbot,function(v){op.zbot=v;},56,
      null,'Niveau le plus bas — fond de la zone à ébaucher (hors surépaisseur).'));
    d.appendChild(rZ);
    d.appendChild(faoH('Stratégie de vidage'));
    const rS=faoRow();
    rS.appendChild(faoSel([
      ['morph','Morph · spirale qui suit la forme','Boucles qui épousent les parois, du centre vers l’extérieur. Bon compromis partout.'],
      ['zigzag','Zigzag · balayage en avalant','Lignes droites aller simple avec dégagements. Simple, mais effort irrégulier.'],
      ['adaptive','Adaptive · effort constant (conseillé)','Petites passes latérales à grande profondeur : charge d’outil constante. Trochoïdes auto dans les goulets.']],
      strat,function(v){op.strategy=v;},'Façon de vider la matière à chaque niveau.'));
    d.appendChild(rS);
    d.appendChild(faoHelp(
      strat==='adaptive'?'Adaptive : gardez ae petit (≤ ¼ du Ø outil) et ap profond (≈ 1×Ø). L’outil ne s’enterre jamais.' :
      strat==='zigzag'?'Zigzag : simple et prévisible. Préférez Morph pour les formes creuses.' :
      'Morph : spirale régulière. Ajoutez ap2 pour adoucir les marches là où la forme change.'));
    d.appendChild(faoH('Passes (mm)'));
    const rP=faoRow();
    rP.appendChild(faoLab('ap')); rP.appendChild(faoNum(op.ap,function(v){op.ap=Math.max(0.5,v);},48,0.5,
      'Descente : hauteur usinée par niveau (Maximum Stepdown). Grand en Adaptive (≈ Ø outil), petit en finition.'));
    rP.appendChild(faoLab('ap2')); rP.appendChild(faoNum(op.ap2||0,function(v){op.ap2=Math.max(0,v);},48,0.5,
      'Affinage : passes fines entre niveaux là où la forme change (Fine Stepdown). 0 = désactivé. Ignoré en Adaptive.'));
    rP.appendChild(faoLab('ae')); rP.appendChild(faoNum(op.ae,function(v){op.ae=Math.max(0.5,v);},48,
      'Pas latéral : distance entre deux passes voisines (Stepover). Petit en Adaptive (≤ ¼ Ø), large en surfaçage.'));
    d.appendChild(rP);
    d.appendChild(faoHelp(
      (strat==='adaptive'&&aeNow>toolD*0.25+1e-9)
        ?('⚠ ae = '+(aeNow/toolD).toFixed(2)+'×Ø : réduisez à ≤ '+(toolD*0.25).toFixed(1)+' mm pour l’Adaptive (Ø '+toolD+').')
        :('ae = '+(aeNow/toolD).toFixed(2)+'×Ø, ap = '+(apNow/toolD).toFixed(2)+'×Ø (outil Ø '+toolD+').')));
    d.appendChild(faoH('Matière à laisser (mm)'));
    const rR=faoRow();
    rR.appendChild(faoLab('Parois')); rR.appendChild(faoNum(faoRA(op).radial,function(v){op.radial=Math.max(0,v);},44,0.1,
      'Surépaisseur sur les côtés : l’ébauche s’arrête à cette distance des parois (la finition l’enlèvera).'));
    rR.appendChild(faoLab('Fond')); rR.appendChild(faoNum(faoRA(op).axial,function(v){op.axial=Math.max(0,v);},44,0.1,
      'Surépaisseur sur le fond : l’ébauche s’arrête à cette hauteur au-dessus du fond.'));
    d.appendChild(rR);
    const rR2=faoRow();
    rR2.appendChild(faoLab('Parois fin')); rR2.appendChild(faoNum(isFinite(+op.radial2)?+op.radial2:faoRA(op).radial,function(v){op.radial2=Math.max(0,v);},44,0.1,
      'Surépaisseur des passes fines ap2 sur les côtés.'));
    rR2.appendChild(faoLab('Fond fin')); rR2.appendChild(faoNum(isFinite(+op.axial2)?+op.axial2:faoRA(op).axial,function(v){op.axial2=Math.max(0,v);},44,0.1,
      'Surépaisseur des passes fines ap2 sur le fond.'));
    d.appendChild(rR2);
    d.appendChild(faoH('Trajectoire'));
    const rT2=faoRow();
    rT2.appendChild(faoLab('Arrondi')); rT2.appendChild(faoNum(isFinite(+op.arrondi)?+op.arrondi:0,function(v){op.arrondi=Math.max(0,v);},48,0.5,
      'Rayon d’arrondi des angles vifs (sort en G2/G3, trajectoire fluide). 0 = angles vifs.'));
    rT2.appendChild(faoLab('Entrée'));
    rT2.appendChild(faoSel([
      ['auto','Auto · hélice si possible','Hélice quand le vide fait ≥ 2×Ø, sinon rampe.'],
      ['helix','Hélice · descente circulaire','Creuse sa place en tournant : il faut un vide d’au moins 2×Ø.'],
      ['ramp','Rampe · descente en biais','Descend en avançant le long de la passe : passe partout, plus lent.']],
      op.entry||'auto',function(v){op.entry=v;},'Manière de plonger dans la matière — jamais de plongée verticale.'));
    d.appendChild(rT2);
  }else if(op.type==='geofinish'){
    rp.appendChild(faoLab('pas 3D')); rp.appendChild(faoNum(op.step,function(v){op.step=Math.max(0.2,v);},52,0.5));
    rp.appendChild(faoLab('laisse')); rp.appendChild(faoNum(op.laisse,function(v){op.laisse=Math.max(0,v);},48,0.1));
    rp.appendChild(faoLab('départ'));
    rp.appendChild(faoSel([['top','Sommet'],['bottom','Fond']],op.seed||'top',function(v){op.seed=v;}));
  }else if(op.type==='drill'){
    zz();
    const pts=(op.pts||[]).map(function(q){return (+q[0])+','+(+q[1]);}).join('; ');
    rp.appendChild(faoLab('XY'));
    rp.appendChild(faoTxt(pts,function(v){
      const lst=String(v).split(';').map(function(s){
        const q=s.split(',').map(function(x){return parseFloat(x);});
        return (q.length>=2&&isFinite(q[0])&&isFinite(q[1]))?[q[0],q[1]]:null;
      }).filter(function(q){return q;});
      if(lst.length)op.pts=lst;
    },150));
    rp.appendChild(faoLab('Q pas'));
    rp.appendChild(faoNum((+op.peck)||0,function(v){op.peck=Math.max(0,v);},52,0.5,
      'Profondeur de chaque plongée (mm). 0 = perçage simple (CYCLE81 / G81), sinon broche à va-et-vient (CYCLE83 / G83).'));
  }
  if(rp.children.length)d.appendChild(rp); // vide pour l'Ébauche 3D (sections propres)
  // Limite d'usinage (tout, rectangle, ou chaîne d'arêtes).
  const rl=faoRow();
  const limMode=op.limit?(op.limit.mode||'all'):'all';
  rl.appendChild(faoLab('Zone'));
  rl.appendChild(faoSel([['all','Tout usiner'],['rect','Rectangle'],['chain','Chaîne d\'arêtes']],limMode,function(v){
    if(v==='rect'){
      const s=faoStock();
      op.limit={mode:'rect',x0:s.x0,y0:s.y0,x1:s.x1,y1:s.y1,side:'center',extra:0};
    }else if(v==='chain'){
      const old=op.limit&&op.limit.mode==='chain'?op.limit:null;
      op.limit=old||{mode:'chain',loop:[],closed:false,nEdges:0,tangent:true,side:'center',extra:0};
      faoChainStart(setup.id,op.id);
    }else delete op.limit;
  },'Zone usinée : tout le brut, un rectangle, ou l’intérieur d’une chaîne d’arêtes.'));
  if(limMode==='rect'&&op.limit){
    const L=op.limit;
    rl.appendChild(faoNum(L.x0,function(v){L.x0=v;},52,null,'Rectangle : coin X mini (mm)'));
    rl.appendChild(faoNum(L.y0,function(v){L.y0=v;},52,null,'Rectangle : coin Y mini (mm)'));
    rl.appendChild(faoNum(L.x1,function(v){L.x1=v;},52,null,'Rectangle : coin X maxi (mm)'));
    rl.appendChild(faoNum(L.y1,function(v){L.y1=v;},52,null,'Rectangle : coin Y maxi (mm)'));
  }
  d.appendChild(rl);
  if(limMode==='chain'&&op.limit){
    const rc=faoRow();
    const hasLoop=(op.limit.loop||[]).length>=3;
    const info=document.createElement('span');
    info.style.cssText='font-size:.74rem;color:rgba(255,255,255,.7);';
    info.textContent=hasLoop
      ?(op.limit.nEdges||'?')+' arêtes, boucle '+(op.limit.closed?'fermée':'refermée')
        +(op.limit.tangent?' (tangentes)':'')+' · '+op.limit.loop.length+' pts'
      :'aucune boucle — sélectionnez des arêtes';
    rc.appendChild(info);
    const bs=document.createElement('button'); bs.textContent=hasLoop?'Re-sélectionner':'Sélectionner';
    bs.style.fontSize='.72rem';
    bs.onclick=function(){ faoChainStart(setup.id,op.id); };
    rc.appendChild(bs);
    d.appendChild(rc);
    if(op.limit.stale){
      const ws=document.createElement('div');
      ws.style.cssText='font-size:.7rem;color:#ff9f0a;line-height:1.35;';
      ws.textContent='⚠ Modèle modifié : arêtes non retrouvées — boucle inchangée (obsolète), re-sélectionnez la chaîne.';
      d.appendChild(ws);
    }
  }
  if((limMode==='rect'||limMode==='chain')&&op.limit){
    const rs=faoRow();
    rs.appendChild(faoLab('Outil'));
    rs.appendChild(faoSel([
      ['center','Centre dedans','Le centre de l’outil reste dans la zone.'],
      ['in','Outil dedans','L’outil entier reste dans la zone (retrait d’un rayon).'],
      ['out','Tout couvrir','La zone est entièrement balayée, l’outil déborde d’un rayon.']],
      op.limit.side||'center',function(v){op.limit.side=v;},
      'Position de l’outil par rapport au bord de la zone.'));
    rs.appendChild(faoLab('Marge'));
    rs.appendChild(faoNum(op.limit.extra||0,function(v){op.limit.extra=v;},44,0.5,
      'Élargit (+) ou rétrécit (−) la zone en mm.'));
    d.appendChild(rs);
  }
  const sf=faoToolSF(faoToolById(setup,op.toolId),setup);
  const rr=faoRow();
  const rs=document.createElement('span');
  rs.style.cssText='font-family:monospace;font-size:.7rem;color:rgba(255,255,255,.55);';
  const mv=faoOpMoves(op,setup);
  const ee=faoEstimate(mv,sf.f,faoRapide(setup),faoAccel(setup));
  rs.textContent='S'+sf.s+' F'+sf.f+' · '+mv.length+' pts · ≈'+ee.tmin.toFixed(1)+' min';
  rr.appendChild(rs);
  d.appendChild(rr);
  return d;
}
/* ----- fiche du posage ----- */
function faoSetupFiche(p,setup){
  const stock=faoStock();
  p.appendChild(faoH('Posage · '+setup.name));
  const rN=faoRow();
  rN.appendChild(faoLab('Nom'));
  rN.appendChild(faoTxt(setup.name,function(v){ setup.name=faoProgName(v)||setup.name; },120));
  if(faoRoot().setups.length>1)
    rN.appendChild(faoMini('Supprimer',function(){
      const r=faoRoot();
      r.setups=r.setups.filter(function(s){return s.id!==setup.id;});
      r.activeSetupId=(r.setups[0]||{}).id||null;
      try{ sel={kind:null,id:null}; }catch(e){}
    }));
  p.appendChild(rN);
  const rM=faoRow();
  rM.appendChild(faoLab('Machine'));
  rM.appendChild(faoSel(Object.keys(FAO_POSTS).map(function(k){return [k,FAO_POSTS[k].label];}),
    setup.machine||'siemens630',function(v){ setup.machine=v; }));
  rM.appendChild(faoLab('Origine '+(setup.wcs||'G54')));
  rM.appendChild(faoSel([['G54','G54'],['G55','G55'],['G56','G56'],['G57','G57'],['G58','G58'],['G59','G59']],
    setup.wcs||'G54',function(v){ setup.wcs=v; }));
  p.appendChild(rM);
  const rO=faoRow();
  rO.appendChild(faoLab('Point de bloc'));
  rO.appendChild(faoSel([['top-X0Y0','Dessus coin X0Y0'],['top-X1Y1','Dessus coin X1Y1'],
    ['top-C','Dessus centre'],['bot-X0Y0','Dessous coin X0Y0']],
    (setup.origin&&setup.origin.preset)||'top-X0Y0',function(v){ setup.origin={preset:v}; }));
  p.appendChild(rO);
  // Indexation 3+2 (table C + B) — {0,0} = usinage 3 axes strictement inchangé.
  const r32=faoRow();
  const O=faoOrient(setup);
  r32.appendChild(faoLab('3+2 B'));
  r32.appendChild(faoNum(O.b,function(v){ setup.orient={b:Math.round(v*1000)/1000,c:faoOrient(setup).c}; },
    44,5,"Bascule de table autour de Y (degrés). 0 = usinage 3 axes. Non nul : Siemens = TRAORI(1) + positionnement B/C (XYZ restent repère pièce) ; Fagor 8065 = machine 3 axes : indexation ignorée à l'export (aucun B/C, alerte)."));
  r32.appendChild(faoLab('C'));
  r32.appendChild(faoNum(O.c,function(v){ setup.orient={b:faoOrient(setup).b,c:Math.round(v*1000)/1000}; },
    44,5,"Rotation de table autour de Z (degrés) — indexation de la pièce dans le plan d'usinage."));
  r32.appendChild(faoLab('°'));
  r32.appendChild(faoMini('3 axes',function(){ setup.orient={b:0,c:0}; },
    'Remise à plat : annule l\'indexation 3+2 (B=0, C=0).'));
  p.appendChild(r32);
  if((FAO_POSTS[setup.machine||setup.post]||{}).kind==='fagor'&&(O.b!==0||O.c!==0)){
    const w32=document.createElement('div');
    w32.style.cssText='font-size:.7rem;color:#ff9f0a;line-height:1.35;';
    w32.textContent='⚠ Fagor 8065 = machine 3 axes : cette indexation 3+2 sera IGNORÉE à l\'export (programme émis à plat, aucun B/C).';
    p.appendChild(w32);
  }
  // Modèle : corps à usiner
  p.appendChild(faoH('Modèle à usiner'));
  const rB=faoRow();
  let bl=[];
  try{ bl=(typeof bodies!=='undefined'&&bodies?bodies:[]).filter(function(b){return b&&!b.ghost;}); }catch(e){}
  if(!bl.length)rB.appendChild(faoLab('Aucun corps (tout le brut).'));
  else{
    const all=setup.bodies==='all';
    bl.forEach(function(b){
      const cb=document.createElement('input'); cb.type='checkbox';
      cb.checked=all||(Array.isArray(setup.bodies)&&setup.bodies.indexOf(b.id)>=0);
      const nm=(b.name||b.id)+'';
      const lb=document.createElement('label');
      lb.style.cssText='font-size:.74rem;display:inline-flex;gap:4px;align-items:center;';
      lb.appendChild(cb);
      lb.appendChild(document.createTextNode(nm));
      cb.onchange=function(){
        faoSnapshot('corps modélisés du posage');
        const checked=[];
        try{
          Array.from(rB.querySelectorAll('input[type=checkbox]')).forEach(function(x,i){
            if(x.checked&&bl[i])checked.push(bl[i].id); });
        }catch(e){}
        setup.bodies=(checked.length===bl.length)?'all':checked;
        faoChanged();
      };
      rB.appendChild(lb);
    });
  }
  p.appendChild(rB);
  // Brut + bridage
  p.appendChild(faoH('Brut · bridage'));
  const rS=faoRow();
  rS.appendChild(faoLab('Brut '+stock.x0.toFixed(0)+','+stock.y0.toFixed(0)+','+stock.z0.toFixed(0)
    +' → '+stock.x1.toFixed(0)+','+stock.y1.toFixed(0)+','+stock.z1.toFixed(0)+' · marge'));
  rS.appendChild(faoNum(setup.marge,function(v){ setup.marge=Math.max(0,v); faoStock(); },48));
  rS.appendChild(faoMini('MAJ brut',function(){ faoStock(); }));
  p.appendChild(rS);
  const rF=faoRow();
  rF.appendChild(faoLab('Bridage'));
  rF.appendChild(faoTxt((setup.fixture&&setup.fixture.note)||'',function(v){
    setup.fixture=setup.fixture||{}; setup.fixture.note=String(v).slice(0,80); },110));
  rF.appendChild(faoLab('dég.rad.'));
  rF.appendChild(faoNum(setup.fixture?setup.fixture.radial:5,function(v){
    setup.fixture=setup.fixture||{}; setup.fixture.radial=Math.max(0,v); },44));
  rF.appendChild(faoLab('ax.'));
  rF.appendChild(faoNum(setup.fixture?setup.fixture.axial:5,function(v){
    setup.fixture=setup.fixture||{}; setup.fixture.axial=Math.max(0,v); },44));
  p.appendChild(rF);
  const nF=document.createElement('div');
  nF.style.cssText='font-size:.68rem;color:rgba(255,255,255,.5);';
  nF.textContent='Bridage mémorisé (phase suivante : évitement dans les parcours).';
  p.appendChild(nF);
  const rC=faoRow();
  rC.appendChild(faoLab('Sécur')); rC.appendChild(faoNum(setup.secu,function(v){ setup.secu=Math.max(0,v); },48));
  rC.appendChild(faoLab('Retrait')); rC.appendChild(faoNum(faoRetractZ(setup),function(v){ setup.retract=v; },56));
  rC.appendChild(faoMini('Auto',function(){ setup.retract=null; }));
  rC.appendChild(faoLab('Arrosage'));
  rC.appendChild(faoSel([['flood','M7/M08'],['through','M8'],['off','arrêt']],setup.coolant||'flood',
    function(v){ setup.coolant=v; }));
  p.appendChild(rC);
  const rV=faoRow();
  rV.appendChild(faoLab('Rapide G0'));
  rV.appendChild(faoNum(faoRapide(setup),function(v){ setup.rapide=Math.max(1,Math.round(v)); },
    56,100,'Vitesse des déplacements en mode rapide (mm/min) — employée pour l\'estimation des temps.'));
  rV.appendChild(faoLab('Plongée'));
  rV.appendChild(faoNum(faoPlungePct(setup),function(v){ setup.plungePct=Math.min(100,Math.max(1,v)); },
    36,100,"Pourcentage de l'avance de coupe appliqué à la plongée (F de plongée des G1 Z)."));
  rV.appendChild(faoLab('% de F'));
  const rA=faoRow();
  rA.appendChild(faoLab('Accél.'));
  rA.appendChild(faoNum(faoAccel(setup),function(v){ setup.accel=Math.max(100,Math.round(v)); },
    44,100,"Accélération de la machine (mm/s²) — le temps des rapides vaut d/v + v/A, un rapide court coûte plus que sa longueur."));
  rA.appendChild(faoLab('mm/s²'));
  rA.appendChild(faoLab('Ch. outil'));
  rA.appendChild(faoNum(faoToolChg(setup),function(v){ setup.toolChg=Math.max(0,Math.round(v)); },
    40,5,"Durée d'un changement d'outil (secondes) ajoutée à l'estimation pour chaque changement de groupe outil."));
  rA.appendChild(faoLab('s'));
  p.appendChild(rV);
  p.appendChild(rA);
  p.appendChild(faoToolsElement(setup));
  // Opérations du posage
  p.appendChild(faoH('Opérations ('+(setup.ops||[]).length+')'));
  const r4=faoRow();
  [['facing','+ Surfaçage'],['pocket','+ Poche'],['contour','+ Contour'],['drill','+ Perçage'],
   ['rough3d','+ Ébauche 3D'],['geofinish','+ Finition géod.'],['pocket3d','+ Débourrage']].forEach(function(a){
    const b=document.createElement('button'); b.textContent=a[1]; b.style.fontSize='.72rem';
    b.onclick=function(){ faoSnapshot('nouvelle opération « '+a[1].replace(/^\+ /,'')+' »');
      setup.ops.push(faoOpDefaults(a[0])); faoChanged(); };
    r4.appendChild(b); });
  p.appendChild(r4);
  (setup.ops||[]).forEach(function(op,i){
    p.appendChild(faoOpCardElement(setup,op,i));
  });
  // Générer + export
  const r5=faoRow();
  const bg=document.createElement('button'); bg.textContent='Générer + aperçu'; bg.style.fontSize='.78rem';
  bg.onclick=function(){
    const n=faoRefreshPreview(); faoTouch();
    st.textContent=faoStatsText();
    try{ if(typeof faceEl!=='undefined'&&faceEl)faceEl.textContent='FAO : '+n+' points de parcours.'; }catch(e){}
  };
  const tg=document.createElement('button'); tg.textContent=faoPrevOn?'Masquer':'Afficher'; tg.style.fontSize='.72rem';
  tg.onclick=function(){ faoPrevOn=!faoPrevOn; if(!faoPrevOn)faoClearPreview(); else faoRefreshPreview(); faoRefreshFaoUI(); };
  const be=document.createElement('button'); be.textContent='Exporter G-code'; be.style.fontSize='.78rem';
  be.onclick=function(){ faoExport(); };
  r5.appendChild(bg); r5.appendChild(tg); r5.appendChild(be); p.appendChild(r5);
  const st=document.createElement('div');
  st.style.cssText='font-family:monospace;font-size:.7rem;color:rgba(255,255,255,.7);white-space:pre-wrap;';
  st.textContent=faoStatsText();
  p.appendChild(st);
  const note=document.createElement('div');
  note.style.cssText='font-size:.68rem;color:rgba(255,255,255,.5);line-height:1.35;';
    note.textContent='3 axes : G0/G1, G2/G3 (arrondis) + cycles de perçage (CYCLE81/G81). Validez toujours le 1er programme en simulation / à vide sur la CN.';
  p.appendChild(note);
}
/* ----- dispatcher panneau droit ----- */
function faoRenderProps(p,s){
  try{
    p.innerHTML='';
    const r=faoRoot();
    let setup=null, op=null, idx=-1;
    if(s.kind==='faoSetup'){
      setup=r.setups.filter(function(x){return x.id===s.id;})[0]||null;
    }else{
      setup=r.setups.filter(function(x){return x.id===(s.setup||r.activeSetupId);})[0]||faoSetup();
      if(setup)(setup.ops||[]).forEach(function(o,i){ if(o.id===s.id){op=o;idx=i;} });
    }
    if(!setup){ const d=document.createElement('div'); d.textContent='Posage introuvable.'; p.appendChild(d); return; }
    if(typeof faoChainMode!=='undefined'&&faoChainMode&&op&&
       faoChainMode.setupId===setup.id&&faoChainMode.opId===op.id){
      faoChainPanel(p,setup,op);
      return;
    }
    if(op){
      p.appendChild(faoH('Opération · '+setup.name));
      p.appendChild(faoOpCardElement(setup,op,idx));
      const back=faoRow();
      const bb=document.createElement('button'); bb.textContent='← Posage '+setup.name; bb.style.fontSize='.72rem';
      bb.onclick=function(){ faoSelectSetup(setup.id); };
      back.appendChild(bb);
      p.appendChild(back);
    }else{
      faoSetupFiche(p,setup);
    }
  }catch(e){}
}

function faoStats(job){
  // Estimation complète du posage : temps de coupe + rapides (accélération
  // machine) + changements d'outil (nb de groupes outil - 1) × durée unitaire.
  let cut=0, rap=0, tm=0, n=0;
  ((job&&job.ops)||[]).forEach(function(op){
    if(op&&op.on===false)return;
    const sf=faoToolSF(faoToolById(job,op.toolId),job);
    const e=faoEstimate(faoOpMoves(op,job),sf.f,faoRapide(job),faoAccel(job));
    cut+=e.cut; rap+=e.rap; tm+=e.tmin; n++;
  });
  let groups=0;
  try{ groups=job?faoJobMoves(job).length:0; }catch(e){ groups=0; }
  const tchg=Math.max(0,groups-1)*(faoToolChg(job)/60);
  return {n:n, cut:cut, rap:rap, groups:groups, tchg:tchg, tmin:tm+tchg};
}
function faoStatsText(){
  try{
    const s=faoStats(faoDoc());
    return s.n+' op · coupe '+(s.cut/1000).toFixed(1)+' m · rapides '+(s.rap/1000).toFixed(1)+' m · ≈'+s.tmin.toFixed(1)+' min';
  }catch(e){ return ''; }
}
function faoExport(){
  try{
    const job=faoDoc();
    const actives=(job.ops||[]).filter(function(o){return !o||o.on!==false;});
    if(!actives.length){ try{ faceEl.textContent='FAO : aucune opération active à exporter.'; }catch(e){} return; }
    const r=faoPost(job);
    const name=faoProgName(job.name)+'.'+r.ext;
    const blob=new Blob([r.code],{type:'text/plain'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob); a.download=name;
    document.body.appendChild(a); a.click();
    setTimeout(function(){ try{ URL.revokeObjectURL(a.href); a.remove(); }catch(e){} },500);
    try{ faceEl.textContent='FAO : '+name+' exporté ('+r.code.split('\n').length+' blocs).'
      +(r.warns&&r.warns.length?(' ⚠ '+r.warns.join(' ; ')):''); }catch(e){}
  }catch(e){}
}

/* ================= 3D : ébauche par tranches + finition iso-géodésique ================= */
// Maillage plan : {v:[[x,y,z]], t:[[a,b,c]]} — aucune dépendance THREE : tout ce
// bloc est pur et testé en Node sur maillages synthétiques. Le lien avec la
// scène (faoActiveMesh) est le seul point navigateur.
// Ébauche : tranches Z (faoLevels) + vidage scanline par tranche — pas de
// librairie de clipping : pour chaque ligne Y on intersecte la section (impair),
// on rétracte de r+laisse, on zigzague en continu (l'air coupé, jamais de rapide
// dans la matière ; les retracts inter-passes viendront en optimisation).
// Finition : champ de distances géodésiques approché (Dijkstra sur les arêtes)
// depuis le sommet + iso-courbes à pas 3D constant (feston régulier), sorties en
// centre outil (contact + normale×R). Approximation honnête : Dijkstra/arêtes,
// pas MMP/exact — largement suffisante en finition.

function faoMeshFromBody(b){
  // BufferGeometry (indexée ou non) -> maillage plan soudé, en coordonnées pièce.
  try{
    if(!b||!b.mesh||!b.mesh.geometry)return null;
    const g=b.mesh.geometry, pos=g.attributes&&g.attributes.position;
    if(!pos||!pos.count||!pos.array)return null;
    const arr=pos.array, idx=g.index&&g.index.array?g.index.array:null;
    const m=b.mesh.matrixWorld, M=m&&m.elements?m.elements:null;
    const P=function(i){
      let x=arr[i*3],y=arr[i*3+1],z=arr[i*3+2];
      if(M){
        const nx=M[0]*x+M[4]*y+M[8]*z+M[12], ny=M[1]*x+M[5]*y+M[9]*z+M[13],
              nz=M[2]*x+M[6]*y+M[10]*z+M[14], w=M[3]*x+M[7]*y+M[11]*z+M[15]||1;
        x=nx/w; y=ny/w; z=nz/w;
      }
      return [x,y,z];
    };
    const ntri=idx?idx.length/3:pos.count/3;
    if(!(ntri>0)||ntri>120000)return null; // garde-fou : trop lourd pour le navigateur
    const v=[], t=[], map={};
    const W=function(p){
      const k=p[0].toFixed(4)+','+p[1].toFixed(4)+','+p[2].toFixed(4);
      let j=map[k];
      if(j===undefined){ j=v.length; v.push(p); map[k]=j; }
      return j;
    };
    for(let k=0;k<ntri;k++){
      const a=idx?idx[k*3]:k*3, b2=idx?idx[k*3+1]:k*3+1, c=idx?idx[k*3+2]:k*3+2;
      t.push([W(P(a)),W(P(b2)),W(P(c))]);
    }
    if(!v.length||!t.length)return null;
    return {v:v,t:t};
  }catch(e){ return null; }
}
function faoActiveMesh(setup){
  // Fusion des corps du MODÈLE du posage (setup.bodies : 'all' ou [ids]).
  try{
    if(typeof bodies==='undefined'||!bodies||!bodies.length)return null;
    const only=(setup&&Array.isArray(setup.bodies))?setup.bodies:null;
    const V=[], T=[];
    let x0=1/0,y0=1/0,z0=1/0,x1=-1/0,y1=-1/0,z1=-1/0, n=0;
    for(let bi=0;bi<bodies.length;bi++){
      const b=bodies[bi];
      if(!b||b.ghost||b.visible===false)continue;
      if(only&&only.indexOf(b.id)<0)continue;
      const mm=faoMeshFromBody(b);
      if(!mm)continue;
      const off=V.length;
      for(let i=0;i<mm.v.length;i++){ const p=mm.v[i]; V.push(p);
        if(p[0]<x0)x0=p[0]; if(p[1]<y0)y0=p[1]; if(p[2]<z0)z0=p[2];
        if(p[0]>x1)x1=p[0]; if(p[1]>y1)y1=p[1]; if(p[2]>z1)z1=p[2]; }
      for(let i=0;i<mm.t.length;i++)T.push([mm.t[i][0]+off,mm.t[i][1]+off,mm.t[i][2]+off]);
      n++;
      if(T.length>120000)return null;
    }
    if(!n||!V.length)return null;
    return {mesh:{v:V,t:T}, box:{x0:x0,y0:y0,z0:z0,x1:x1,y1:y1,z1:z1}};
  }catch(e){ return null; }
}
function faoMeshNormals(mesh){
  // Normales aux sommets, pondérées par l'aire (robuste aux soupes de triangles).
  const n=[]; let i;
  for(i=0;i<mesh.v.length;i++)n.push([0,0,0]);
  for(i=0;i<mesh.t.length;i++){
    const a=mesh.v[mesh.t[i][0]], b=mesh.v[mesh.t[i][1]], c=mesh.v[mesh.t[i][2]];
    const ux=b[0]-a[0], uy=b[1]-a[1], uz=b[2]-a[2], wx=c[0]-a[0], wy=c[1]-a[1], wz=c[2]-a[2];
    const nx=uy*wz-uz*wy, ny=uz*wx-ux*wz, nz=ux*wy-uy*wx;
    [[mesh.t[i][0]],[mesh.t[i][1]],[mesh.t[i][2]]].forEach(function(q){
      n[q[0]][0]+=nx; n[q[0]][1]+=ny; n[q[0]][2]+=nz; });
  }
  for(i=0;i<n.length;i++){
    const l=Math.hypot(n[i][0],n[i][1],n[i][2])||1;
    n[i]=[n[i][0]/l,n[i][1]/l,n[i][2]/l];
  }
  return n;
}
function faoSliceZ(mesh,z){
  // Intersection maillage/plan Z -> segments 2D [[x1,y1,x2,y2]].
  // Les deux sens de contact sommet/plan sont traités (un niveau pile sur un
  // plan de faces — fond de poche, embase — sortait vide avant : le brut
  // complet était alors usiné à travers la pièce).
  const segs=[], e=1e-9; let i;
  for(i=0;i<mesh.t.length;i++){
    const P=[mesh.v[mesh.t[i][0]],mesh.v[mesh.t[i][1]],mesh.v[mesh.t[i][2]]];
    const d=[P[0][2]-z,P[1][2]-z,P[2][2]-z];
    const pts=[];
    for(let k=0;k<3;k++){
      const a=P[k], b=P[(k+1)%3], da=d[k], db=d[(k+1)%3];
      if((da<-e&&db>e)||(da>e&&db<-e)){
        const s=da/(da-db);
        pts.push([a[0]+(b[0]-a[0])*s, a[1]+(b[1]-a[1])*s]);
      }else if(Math.abs(da)<=e&&Math.abs(db)>e){
        pts.push([a[0],a[1]]);
      }else if(Math.abs(db)<=e&&Math.abs(da)>e){
        pts.push([b[0],b[1]]);
      }
    }
    const uq=[];
    pts.forEach(function(p){
      if(!uq.some(function(q){return Math.hypot(q[0]-p[0],q[1]-p[1])<1e-7;}))uq.push(p);
    });
    if(uq.length>=2)segs.push([uq[0][0],uq[0][1],uq[1][0],uq[1][1]]);
  }
  return segs;
}
function faoScanIntervals(segs,y){
  // Ligne Y -> intervalles matière [xa,xb] (règle impair, tol 1e-7).
  // Décalage epsilon : une ligne passant EXACTEMENT par des sommets de section
  // compterait chaque contact double et annulerait les paires (cas systématique
  // en test : y=5 sur une boîte 0..10).
  const yy=y+1e-7, xs=[];
  for(let i=0;i<segs.length;i++){
    const s=segs[i];
    if((s[1]-yy)*(s[3]-yy)<=0&&s[1]!==s[3]){
      xs.push(s[0]+(s[2]-s[0])*(yy-s[1])/(s[3]-s[1]));
    }
  }
  xs.sort(function(a,b){return a-b;});
  const out=[];
  for(let i=0;i+1<xs.length;i+=2){
    if(xs[i+1]-xs[i]>1e-7)out.push([xs[i],xs[i+1]]);
  }
  return out;
}
/* ----- entrées douces : hélice (descente circulaire) ou rampe (biais) ----- */
// Jamais de plongée verticale dans la matière : l'hélice creuse sa place quand
// la largeur le permet, sinon la rampe descend en avançant (avance plongée).
// L'hélice attaque TOUJOURS hors matière, 2 mm au-dessus (faoHelixSpot).
let faoSliceCache=null;
function faoSliceZCached(mesh,z){
  const k=Math.round(z*1000)/1000;
  if(faoSliceCache&&faoSliceCache.mesh===mesh&&faoSliceCache.map[k])return faoSliceCache.map[k];
  const s=faoSliceZ(mesh,z);
  if(faoSliceCache&&faoSliceCache.mesh===mesh)faoSliceCache.map[k]=s;
  return s;
}
function faoSliceHit(segs,cx,cy,clear){
  // Le disque de dégagement [clear] autour du point touche-t-il la section ?
  for(let i=0;i<segs.length;i++){
    const s=segs[i];
    const dx=s[2]-s[0], dy=s[3]-s[1], l2=dx*dx+dy*dy;
    let t=l2>1e-12?((cx-s[0])*dx+(cy-s[1])*dy)/l2:0;
    t=Math.max(0,Math.min(1,t));
    if(Math.hypot(cx-(s[0]+dx*t),cy-(s[1]+dy*t))<clear)return true;
  }
  const xs=[];
  for(let i=0;i<segs.length;i++){
    const s=segs[i];
    if((s[1]-cy)*(s[3]-cy)<=0&&s[1]!==s[3])
      xs.push(s[0]+(s[2]-s[0])*(cy-s[1])/(s[3]-s[1]));
  }
  xs.sort(function(a,b){return a-b;});
  let left=0;
  for(let i=0;i<xs.length;i++)if(xs[i]<cx-1e-9)left++;
  return (left%2)===1;
}
function faoDiscClear(segs,cx,cy,hr,r){
  // Le disque d'hélice (centre,hr) évite-t-il la pièce (dedans ou à moins
  // de r) ? 8 échantillons sur le cercle.
  for(let k=0;k<8;k++){
    const a=k/8*Math.PI*2, xx=cx+hr*Math.cos(a), yy=cy+hr*Math.sin(a);
    const xs=[];
    for(let i=0;i<segs.length;i++){
      const s=segs[i];
      if((s[1]-yy)*(s[3]-yy)<=0&&s[1]!==s[3])
        xs.push(s[0]+(s[2]-s[0])*(yy-s[1])/(s[3]-s[1]));
    }
    xs.sort(function(a,b){return a-b;});
    if(xs.length%2)return false;
    let left=0;
    for(let i=0;i<xs.length;i++)if(xs[i]<xx-1e-9)left++;
    if(left%2)return false;
    for(let i=0;i<xs.length;i+=2){
      if(xx>=xs[i]-r-1e-9&&xx<=xs[i+1]+r+1e-9)return false;
    }
  }
  return true;
}
function faoHelixSpot(mesh,cx,cy,hr,r,z,brutTop,planes){
  // Départ hélice = 2 mm au-dessus de la plus haute matière sous le disque.
  // Colonne vide : 2 mm au-dessus du niveau (rainure ouverte). Jamais enterré.
  // Avec `planes` (Z vertex du maillage) : aucun voile fin manqué entre deux
  // pas de 1 mm ; sans : balayage historique au pas de 1 mm (morph/zigzag).
  const top=isFinite(+brutTop)?+brutTop:z;
  if(Array.isArray(planes)&&planes.length){
    for(let k=planes.length-1;k>=0;k--){
      const zz=planes[k];
      if(!(zz>z+1e-9&&zz<=top+1e-9))continue;
      if(faoSliceHit(faoSliceZCached(mesh,Math.round(zz*1000)/1000),cx,cy,hr+r))return zz+2;
    }
    return z+2;
  }
  for(let zz=top;zz>z+1e-9;zz-=1){
    if(faoSliceHit(faoSliceZCached(mesh,zz),cx,cy,hr+r))return zz+2;
  }
  return z+2;
}
function faoHelixEntry(cx,cy,zFrom,zTo,radius,toolD){
  const drop=Math.max(0.5,(isFinite(+toolD)&&+toolD>0?+toolD:10)*0.1);
  const depth=Math.max(0.01,zFrom-zTo);
  const turns=Math.max(1,Math.ceil(depth/drop));
  const per=10, moves=[{r:1,x:cx+radius,y:cy,z:zFrom}];
  const total=turns*per;
  for(let i=1;i<=total;i++){
    const a=i/per*Math.PI*2;
    moves.push({r:0,x:cx+radius*Math.cos(a),y:cy+radius*Math.sin(a),
      z:Math.round((zFrom-depth*i/total)*1000)/1000});
  }
  for(let i=1;i<=per;i++){ // tour de fond : palier propre
    const a=i/per*Math.PI*2;
    moves.push({r:0,x:cx+radius*Math.cos(a),y:cy+radius*Math.sin(a),z:zTo});
  }
  return moves;
}
function faoGenRough3D(mesh,box,ztop,zbot,o){
  // Ébauche 3D façon poche morph : passes épaisses (ap) à R radial, puis
  // passes fines (ap2) à R2 là où la section change (marches réduites).
  // Par tranche non plate : spirale morph (boucles imbriquées qui suivent les
  // parois, entrée hélice au centre), zigzag (option, poches complexes) ou
  // adaptive (pelage au petit pas + trochoïdes G2/G3 clampées en Y dans les
  // goulets, façon Adaptive 3D : ap profond, ae ≤ 0.25*D, liaisons sans
  // retrait, ombre EXACTE aux plans vertex = brut restant sans voile manqué,
  // entrées multi-spots hélice/rampe X-Y/micro-hélice avec colonnes exactes,
  // ordre de pelage selon l'ouverture).
  // Plats (couverture > 85 %) : zigzag au grand pas D*0.8 (morph/adaptive gardent
  // leur petit pas : le plat reste pelé, pas surfacing pleine largeur).
  o=o||{};
  if(!mesh||!mesh.v||!mesh.v.length)return [];
  const D=isFinite(+o.toolD)&&+o.toolD>0?+o.toolD:10;
  const RA=faoRA(o);
  const secu=isFinite(+o.secu)?+o.secu:(+zbot+5);
  const zt=+ztop; // le brut au-dessus de la pièce se surfaçe (niveaux vides) :
  // jamais de clamp au sommet pièce, sinon le dessus du brut serait oublié.
  const zBot=+zbot+RA.axial;
  const ap=isFinite(+o.ap)&&+o.ap>0?+o.ap:2;
  const ae=isFinite(+o.ae)&&+o.ae>0?+o.ae:D*0.6;
  const ap2=isFinite(+o.ap2)&&+o.ap2>0?+o.ap2:0;
  const RA2={radial:isFinite(+o.radial2)?+o.radial2:RA.radial,
             axial:isFinite(+o.axial2)?+o.axial2:RA.axial};
  const tol=isFinite(+o.refineTol)&&+o.refineTol>0?+o.refineTol:20; // % de changement
  const strategy=o.strategy||'morph'; // 'morph' | 'zigzag' | 'adaptive'
  const entryMode=o.entry||'auto';
  const B=box||{x0:0,y0:0,x1:100,y1:80};
  // Signature de section (longueur balayée sur 9 lignes) pour le raffinement.
  const sigCache={};
  const sig=function(z){
    const k=Math.round(z*1000)/1000;
    if(sigCache[k]===undefined){
      const segs=faoSliceZ(mesh,z);
      let s=0;
      for(let q=0;q<9;q++){
        const yy=B.y0+(B.y1-B.y0)*(q+0.5)/9;
        faoScanIntervals(segs,yy).forEach(function(iv){ s+=iv[1]-iv[0]; });
      }
      sigCache[k]={segs:segs,s:s};
    }
    return sigCache[k];
  };
  // Plan : niveaux épais + niveaux fins là où la forme change.
  // Adaptive : ap profond constant, pas de raffinement ap2 (le petit ae suffit
  // à suivre les marches, comme Fusion qui garde la pleine profondeur).
  const plan=[];
  const coarse=faoLevels(zt,zBot,ap);
  coarse.forEach(function(z,i){
    plan.push({z:z,radial:RA.radial});
    if(strategy!=='adaptive'&&ap2>0&&i+1<coarse.length){
      const a=sig(z).s, b=sig(coarse[i+1]).s;
      const ch=Math.abs(a-b)/Math.max(a,b,1e-9)*100;
      if(ch>tol){
        for(let f=z-ap2;f>coarse[i+1]+1e-9;f-=ap2)
          plan.push({z:Math.round(f*1000)/1000,radial:RA2.radial,fine:true});
      }
    }
  });
  const moves=[];
  const bulge=isFinite(+o.bulge)&&+o.bulge>0?+o.bulge:0;
  faoSliceCache={mesh:mesh,map:{}};
  plan.forEach(function(L){
    // Entrée depuis z+ap (rainure du dessus déjà ouverte, descente en avance
    // plongée) : l'hélice ne refait jamais toute la hauteur depuis la sécu.
    const zFrom=Math.min(secu,L.z+ap);
    if(strategy==='adaptive'){
      faoRoughAdaptiveLevel(mesh,B,L.z,D,D/2+L.radial+bulge,secu,zFrom,ae,entryMode,o.brutTop,zt,moves);
    }else{
      faoRoughLevel(mesh,B,L.z,D,D/2+L.radial+bulge,secu,zFrom,ae,strategy,entryMode,o.brutTop,moves);
    }
  });
  faoSliceCache=null;
  return moves;
}
function faoTrochSlot(moves,xa,xb,y,z,D,aeA,yMin,yMax){
  // Trochoïde en VRAIS arcs G2/G3 le long d'un goulet : chaque boucle = 4
  // quarts à 90° (< 180°, IJK incrémental, centre = départ + IJK comme les CN),
  // émis CCW (G3). Engagement d'un seul côté, pas d'arrêt en fond de
  // rainure. Reste dans [xa,xb], Z constant. L'excursion en Y (±Rt) est
  // clampée à la bande balayée (lignes extrêmes ± aeA/2 : au-delà, on ne sait
  // pas que c'est du vide) ; sans place pour un rayon ≥ 0.5 : passe droite.
  const W=xb-xa;
  if(!(W>0.5))return;
  const Y=Math.round(y*1000)/1000;
  const edge=(isFinite(yMin)&&isFinite(yMax))
    ?Math.max(0,Math.min(y-yMin,yMax-y)+Math.max(0.5,isFinite(+aeA)&&+aeA>0?+aeA:2)*0.5)
    :1/0;
  const Rt0=Math.min(D*0.3,aeA*1.5,W/2-0.2,edge);
  if(!(Rt0>=0.5)){
    moves.push({r:0,x:Math.round(xa*1000)/1000,y:Y,z:z});
    moves.push({r:0,x:Math.round(xb*1000)/1000,y:Y,z:z});
    return;
  }
  const Rt=Math.round(Rt0*1000)/1000;
  const pitch=Math.max(0.5,Math.min(aeA,D*0.2));
  moves.push({r:0,x:Math.round((xa+Rt)*1000)/1000,y:Y,z:z});
  let cx=xa+Rt, guard=0;
  while(cx<xb-Rt-1e-9&&guard++<10000){
    const X=Math.round(cx*1000)/1000;
    const xE=Math.round((cx+Rt)*1000)/1000, xW=Math.round((cx-Rt)*1000)/1000;
    const yN=Math.round((y+Rt)*1000)/1000, yS=Math.round((y-Rt)*1000)/1000;
    // E -> N -> W -> S -> E autour de (X,Y), CCW : i,j = centre - départ.
    moves.push({r:0,x:X,y:yN,z:z,arc:{i:Math.round((X-xE)*1000)/1000,j:0,cw:false}});
    moves.push({r:0,x:xW,y:Y,z:z,arc:{i:0,j:Math.round((Y-yN)*1000)/1000,cw:false}});
    moves.push({r:0,x:X,y:yS,z:z,arc:{i:Math.round((X-xW)*1000)/1000,j:0,cw:false}});
    moves.push({r:0,x:xE,y:Y,z:z,arc:{i:0,j:Math.round((Y-yS)*1000)/1000,cw:false}});
    cx+=pitch;
  }
  moves.push({r:0,x:Math.round(xb*1000)/1000,y:Y,z:z});
}
function faoShadowPlanes(mesh,z,zt){
  // Plans Z où lire l'ombre : les Z vertex du maillage entre z et zt
  // (dédup 1 µm, cap 160 avec sous-échantillonnage régulier en repli).
  // EXACTITUDE : tout voile horizontal, si fin soit-il, a ses faces haute et
  // basse à des Z vertex — aucun ne peut se cacher entre deux plans
  // (les croisements variant linéairement, l'union des emprises est atteinte
  // aux plans vertex). Sans vertex : grille historique au pas ≤ 2 mm.
  const pls=[Math.round(z*1000)/1000];
  let zv=null;
  try{
    const zs=[];
    for(let k=0;k<mesh.v.length;k++){ const q=mesh.v[k][2]; if(isFinite(q))zs.push(q); }
    zs.sort(function(a,b){return a-b;});
    zv=[];
    for(let k=0;k<zs.length;k++)if(!zv.length||zs[k]-zv[zv.length-1]>1e-6)zv.push(zs[k]);
    if(zv.length>160){
      const thin=[zv[0]], st=(zv.length-1)/159;
      for(let k=1;k<159;k++)thin.push(zv[Math.round(k*st)]);
      thin.push(zv[zv.length-1]); zv=thin;
    }
  }catch(e){ zv=null; }
  if(zv&&zv.length){
    zv.forEach(function(zz){
      if(zz>z+1e-9&&zz<=zt+1e-9)pls.push(Math.round(zz*1000)/1000);
    });
  }else{
    const H=Math.max(0,zt-z), n=Math.max(1,Math.ceil(H/2));
    for(let k=1;k<=n;k++)pls.push(Math.round((z+H*k/n)*1000)/1000);
  }
  const seen={}, out=[];
  pls.forEach(function(zz){ const k=String(zz); if(!seen[k]){seen[k]=1;out.push(zz);} });
  return out;
}
function faoShadowIntervals(mesh,B,y,z,zt,r,aeA,planes){
  // `planes` optionnel : plans pré-calculés du niveau (partagés avec
  // l'hélice) ; sinon calcul local via faoShadowPlanes.
  // Vide à z avec BRUT RESTANT : l'outil vertical n'atteint que ce qui est
  // libre depuis le dessus — union des sections aux plans vertex entre z et
  // zt (faoShadowPlanes : aucun voile fin manqué), dilatées de r, puis
  // complément dans le brut. Les porte-à-faux sont exclus : jamais de plongée
  // sous un surplomb. Matière lue sur 3 lignes (y±aeA) : une ligne pile sur
  // une arête (epsilon scanline) verrait un vide plein large et fraiserait le
  // flanc — les voisines rattrapent le bord. Les 3 vides : [] (conservatif).
  const lo=B.x0+r, hi=B.x1-r;
  const out=[];
  if(!(hi-lo>0.2))return out;
  const stepY=Math.max(0.5,isFinite(+aeA)&&+aeA>0?+aeA:2);
  const forb=[];
  let pls=null;
  if(Array.isArray(planes)&&planes.length){
    const seen={}, tmp=[];
    planes.forEach(function(zz){
      if(zz>=z-1e-9&&zz<=zt+1e-9){
        const q=Math.round(zz*1000)/1000, k=String(q);
        if(!seen[k]){seen[k]=1;tmp.push(q);}
      }
    });
    pls=tmp.length?tmp:faoShadowPlanes(mesh,z,zt);
  }else pls=faoShadowPlanes(mesh,z,zt);
  pls.forEach(function(zz){
    const segs=faoSliceZCached(mesh,zz);
    [y-stepY,y,y+stepY].forEach(function(yy){
      faoScanIntervals(segs,yy).forEach(function(iv){
        const a=Math.max(lo,iv[0]-r), b=Math.min(hi,iv[1]+r);
        if(b-a>-1e-9)forb.push([a,b]);
      });
    });
  });
  if(!forb.length)return out;
  forb.sort(function(p,q){return p[0]-q[0];});
  const mg=[forb[0].slice()];
  for(let k=1;k<forb.length;k++){
    const last=mg[mg.length-1];
    if(forb[k][0]<=last[1]+1e-9)last[1]=Math.max(last[1],forb[k][1]);
    else mg.push(forb[k].slice());
  }
  let cur=lo;
  mg.forEach(function(f){
    if(f[0]-cur>0.2)out.push({a:cur,b:f[0],wl:cur>lo+1e-9,wr:true});
    if(f[1]>cur)cur=f[1];
  });
  if(hi-cur>0.2)out.push({a:cur,b:hi,wl:cur>lo+1e-9,wr:false});
  return out;
}
function faoRoughAdaptiveLevel(mesh,B,z,D,r,secu,zFrom,ae,entryMode,brutTop,zt,moves){
  // Une tranche façon Adaptive : pelage au petit pas (aeA ≤ 0.25*D) dans le
  // vide RESTANT (ombre des niveaux supérieurs), entrée hélice multi-spots /
  // rampe X ou Y / micro-hélice, liaisons G1 sans retrait dans la région,
  // trochoïdes G2/G3 dans les goulets (largeur < 2.5*D).
  const segs=faoSliceZCached(mesh,z);
  const top=isFinite(+zt)?+zt:z;
  const aeA=Math.max(0.5,Math.min(isFinite(+ae)&&+ae>0?+ae:D*0.2,D*0.25));
  // Plans partagés du niveau : ombre + colonnes d'hélice lisent les mêmes
  // Z vertex (aucun voile fin manqué, slices en cache).
  const planes=faoShadowPlanes(mesh,z,Math.max(top,isFinite(+brutTop)?+brutTop:z));
  const ys=[]; let y=B.y0+r, g=0;
  while(y<=B.y1-r+1e-9&&g++<100000){ ys.push(y); y+=aeA; }
  if(!ys.length)return;
  const lines=[];
  ys.forEach(function(yy){
    const ivs=faoShadowIntervals(mesh,B,yy,z,top,r,aeA,planes);
    if(ivs.length)lines.push({y:yy,ivs:ivs});
  });
  if(!lines.length)return;
  const regs=faoRoughRegions(lines);
  regs.forEach(function(R){
    const rl=R.map(function(q){return {y:q.y,ivs:[q.iv]};});
    // --- entrée : on ne suppose plus le centre. Candidats hélice = top-3
    // intervalles les plus larges + centroïde ; sinon rampe le long du plus
    // long run (X ou Y) ; sinon micro-hélice ; sinon région sautée (outil
    // trop gros — laissé au plus petit outil, jamais de plongée verticale).
    const byW=rl.slice().sort(function(a,b){
      return (b.ivs[0].b-b.ivs[0].a)-(a.ivs[0].b-a.ivs[0].a); });
    let cx0=0, cy0=0;
    rl.forEach(function(L){ cx0+=(L.ivs[0].a+L.ivs[0].b)/2; cy0+=L.y; });
    cx0/=rl.length; cy0/=rl.length;
    const forced=(entryMode||'auto')==='helix'?'helix':(entryMode||'auto')==='ramp'?'ramp':'auto';
    let hx=null, hr=0, hStart=zFrom, hy=0;
    if(forced!=='ramp'){
      const cands=byW.slice(0,3).map(function(L){
        return {x:(L.ivs[0].a+L.ivs[0].b)/2,y:L.y,elen:L.ivs[0].b-L.ivs[0].a}; });
      cands.push({x:cx0,y:cy0,elen:0});
      for(let ci=0;ci<cands.length&&!hx;ci++){
        const c=cands[ci];
        const hrr=c.elen>0?Math.max(1,Math.min(D*0.4,c.elen/2-1)):Math.max(0.5,D*0.2);
        if(!(c.elen>0?c.elen>=2*D:true))continue;
        if(forced==='auto'&&!(c.elen>=2*D))continue;
        if(!faoDiscClear(segs,c.x,c.y,hrr,r))continue;
        hx=c.x; hy=c.y; hr=hrr;
        hStart=Math.min(zFrom,faoHelixSpot(mesh,c.x,c.y,hrr,r,z,brutTop,planes));
      }
    }
    // Run X le plus long + run Y (intersection commune des intervalles).
    let E={y:rl[0].y,iv:rl[0].ivs[0]};
    rl.forEach(function(L){ L.ivs.forEach(function(iv){
      if(iv.b-iv.a>E.iv.b-E.iv.a)E={y:L.y,iv:iv}; }); });
    const elen=E.iv.b-E.iv.a;
    let ixA=1/0, ixB=-1/0;
    rl.forEach(function(L){ ixA=Math.min(ixA,L.ivs[0].a); ixB=Math.max(ixB,L.ivs[0].b); });
    const yRun=(ixB-ixA>0.2)?(rl[rl.length-1].y-rl[0].y):0;
    let ramp=null; // {x0,y0,x1,y1}
    if(forced!=='helix'&&!hx){
      if(elen>=yRun&&elen>0.2)ramp={x0:E.iv.a,y0:E.y,x1:E.iv.a+Math.min(elen,2*D),y1:E.y};
      else if(yRun>0.2){ const xm=(ixA+ixB)/2; ramp={x0:xm,y0:rl[0].y,x1:xm,y1:rl[0].y+Math.min(yRun,2*D)}; }
    }
    if(hx!==null){
      moves.push({r:1,x:hx,y:hy,z:secu});
      if(hStart<secu-1e-9)moves.push({r:0,x:hx,y:hy,z:hStart});
      faoHelixEntry(hx,hy,hStart,z,hr,D).slice(1).forEach(function(m){moves.push(m);});
    }else if(ramp&&(forced==='ramp'||Math.max(elen,yRun)>=D*0.5)){
      moves.push({r:1,x:ramp.x0,y:ramp.y0,z:secu});
      moves.push({r:0,x:ramp.x1,y:ramp.y1,z:z});
    }else if(forced!=='ramp'){
      // Micro-hélice : le run est trop court pour une rampe mais un disque
      // minuscule passe — perçage hélicoïdal lent mais sûr.
      const run=Math.max(elen,yRun);
      const mhr=Math.max(0.5,run/2-0.2);
      const mx=ramp?ramp.x0:(E.iv.a+E.iv.b)/2, my=ramp?ramp.y0:E.y;
      if(run>0.5&&faoDiscClear(segs,mx,my,mhr,r)){
        const ms=Math.min(zFrom,faoHelixSpot(mesh,mx,my,mhr,r,z,brutTop,planes));
        moves.push({r:1,x:mx,y:my,z:secu});
        if(ms<secu-1e-9)moves.push({r:0,x:mx,y:my,z:ms});
        faoHelixEntry(mx,my,ms,z,mhr,D).slice(1).forEach(function(m){moves.push(m);});
        hx=mx; hy=my;
      }else return; // inusinable à cet outil : on ne laisse aucun move partiel
    }else return;
    const fromHole=(hx!==null);
    // Goulet : tout trochoïde G2/G3, une ligne après l'autre, sans retrait.
    let maxLen=0;
    rl.forEach(function(L){ maxLen=Math.max(maxLen,L.ivs[0].b-L.ivs[0].a); });
    if(maxLen<2.5*D&&rl.length>=2){
      let yLo=1/0, yHi=-1/0;
      rl.forEach(function(L){ if(L.y<yLo)yLo=L.y; if(L.y>yHi)yHi=L.y; });
      rl.forEach(function(L){
        const iv=L.ivs[0];
        faoTrochSlot(moves,iv.a,iv.b,L.y,z,D,aeA,yLo,yHi);
      });
      const last=moves[moves.length-1];
      moves.push({r:1,x:last.x,y:last.y,z:secu});
      return;
    }
    if(rl.length<2){
      // Balayage complet du segment (l'entrée n'en a ouvert qu'un bout).
      const iv=rl[0].ivs[0];
      moves.push({r:0,x:iv.a,y:rl[0].y,z:z});
      moves.push({r:0,x:iv.b,y:rl[0].y,z:z});
      const last=moves[moves.length-1];
      moves.push({r:1,x:last.x,y:last.y,z:secu});
      return;
    }
    // Pelage : boucles imbriquées au pas aeA, liaisons G1 continues.
    const step=aeA, loops=[];
    for(let k=0;;k++){
      let mL=0;
      rl.forEach(function(L){ mL=Math.max(mL,L.ivs[0].b-L.ivs[0].a); });
      if(mL-2*k*step<0.5)break;
      const ptsL=[], ptsR=[];
      rl.forEach(function(L){
        const iv=L.ivs[0], a=iv.a+k*step, b=iv.b-k*step;
        if(b-a>0.2){ ptsL.push({x:a,y:L.y}); ptsR.push({x:b,y:L.y}); }
      });
      if(!ptsL.length)break;
      loops.push(ptsL.concat(ptsR.reverse()));
    }
    if(!loops.length){
      const last=moves[moves.length-1];
      moves.push({r:1,x:last.x,y:last.y,z:secu});
      return;
    }
    // Ordre selon l'ouverture : trou central (hélice) -> intérieur d'abord ;
    // rampe au bord -> extérieur d'abord. Chaque boucle reste adjacente au
    // vide, engagement constant d'un seul côté.
    if(fromHole){
      for(let li=loops.length-1;li>=0;li--){
        loops[li].forEach(function(p){ moves.push({r:0,x:Math.round(p.x*1000)/1000,y:Math.round(p.y*1000)/1000,z:z}); });
      }
    }else{
      for(let li=0;li<loops.length;li++){
        loops[li].forEach(function(p){ moves.push({r:0,x:Math.round(p.x*1000)/1000,y:Math.round(p.y*1000)/1000,z:z}); });
      }
    }
    const last2=moves[moves.length-1];
    moves.push({r:1,x:last2.x,y:last2.y,z:secu});
  });
}
function faoRoughLevel(mesh,B,z,D,r,secu,zFrom,ae,strategy,entryMode,brutTop,moves){
  // Une tranche : entrée douce + vidage (morph ou zigzag + parois) + retract.
  const segs=faoSliceZ(mesh,z);
  const scanLines=function(step){
    const ys=[]; let y=B.y0+r, g=0;
    while(y<=B.y1-r+1e-9&&g++<100000){ ys.push(y); y+=step; }
    return ys;
  };
  let ys=scanLines(ae);
  if(!ys.length)return;
  let cov=0;
  ys.forEach(function(yy){
    faoRoughIntervals(segs,B,yy,r).forEach(function(iv){ cov+=iv.b-iv.a; });
  });
  cov=cov/Math.max(1e-9,ys.length*Math.max(1e-9,B.x1-B.x0-2*r));
  let flat=false;
  if(cov>0.85&&ae<D*0.8){ // plat : on recommence au grand pas
    const ys2=scanLines(D*0.8);
    if(ys2.length){ ys=ys2; flat=true; }
  }
  const lines=[];
  ys.forEach(function(yy){
    const ivs=faoRoughIntervals(segs,B,yy,r);
    if(ivs.length)lines.push({y:yy,ivs:ivs});
  });
  if(!lines.length)return;
  if(!flat&&strategy==='morph'){
    // Régions connexes (nervures/îlots suivis chacun pour soi) ; une ligne
    // isolée = une passe simple avec rampe.
    const regs=faoRoughRegions(lines);
    regs.forEach(function(R){
      const rl=R.map(function(q){return {y:q.y,ivs:[q.iv]};});
      if(rl.length>=2)faoRoughMorph(rl,z,D,r,secu,zFrom,ae,entryMode,mesh,brutTop,moves);
      else{
        const iv=R[0].iv;
        moves.push({r:1,x:iv.a,y:R[0].y,z:secu});
        moves.push({r:0,x:Math.min(iv.a+2*D,iv.b),y:R[0].y,z:z});
        if(iv.a+2*D<iv.b-1e-9)moves.push({r:0,x:iv.b,y:R[0].y,z:z});
        moves.push({r:1,x:iv.b,y:R[0].y,z:secu});
      }
    });
    const last=moves[moves.length-1];
    if(last&&!last.r)moves.push({r:1,x:last.x,y:last.y,z:secu});
    return;
  }
  faoRoughZigzag(lines,z,D,r,secu,zFrom,ae,entryMode,flat,segs,B,mesh,brutTop,moves);
}
function faoRoughMorph(lines,z,D,r,secu,zFrom,ae,entryMode,mesh,brutTop,moves){
  // Spirale morph : boucles imbriquées (pas radial mini(ae, D/2)), émises du
  // centre vers les parois après une hélice centrale (ou rampe si exigu).
  // L'entrée part de zFrom (rainure du niveau précédent), pas de la sécu.
  const step=Math.min(ae,D*0.5);
  const loops=[];
  for(let k=0;;k++){
    let maxLen=0;
    lines.forEach(function(L){ maxLen=Math.max(maxLen,L.ivs[0].b-L.ivs[0].a); });
    if(maxLen-2*k*step<0.5)break;
    const ptsL=[], ptsR=[];
    lines.forEach(function(L){
      const iv=L.ivs[0], a=iv.a+k*step, b=iv.b-k*step;
      if(b-a>0.2){ ptsL.push({x:a,y:L.y}); ptsR.push({x:b,y:L.y}); }
    });
    if(!ptsL.length)break;
    loops.push(ptsL.concat(ptsR.reverse()));
  }
  if(!loops.length)return;
  // Entrée : hélice au centre de la boucle interne si la place le permet.
  const inner=loops[loops.length-1];
  let cx=0, cy=0;
  inner.forEach(function(p){ cx+=p.x; cy+=p.y; });
  cx/=inner.length; cy/=inner.length;
  let hx=0, hy=0;
  inner.forEach(function(p){ hx=Math.max(hx,Math.abs(p.x-cx)); hy=Math.max(hy,Math.abs(p.y-cy)); });
  const fit=Math.min(hx,hy);
  // Hélice : disque hors pièce au niveau + départ 2 mm au-dessus de la matière.
  // CAV-75-25 : R=0.4*D (10 mm pour D25).
  let wantHelix=(entryMode||'auto')==='helix'||((entryMode||'auto')==='auto'&&fit>=1.5);
  let hr=Math.max(1,Math.min(D*0.4,fit-0.5));
  let hStart=zFrom;
  if(wantHelix){
    if(!(fit>=1.5))wantHelix=false;
    else if(!faoDiscClear(faoSliceZCached(mesh,z),cx,cy,hr,r))wantHelix=false;
    else hStart=Math.min(zFrom,faoHelixSpot(mesh,cx,cy,hr,r,z,brutTop));
  }
  if(wantHelix){
    moves.push({r:1,x:cx,y:cy,z:secu});
    if(hStart<secu-1e-9)moves.push({r:0,x:cx,y:cy,z:hStart});
    faoHelixEntry(cx,cy,hStart,z,hr,D).slice(1).forEach(function(m){moves.push(m);});
  }else{
    let E={y:lines[0].y,iv:lines[0].ivs[0]};
    lines.forEach(function(L){ L.ivs.forEach(function(iv){
      if(iv.b-iv.a>E.iv.b-E.iv.a)E={y:L.y,iv:iv}; }); });
    const rl=Math.min(E.iv.b-E.iv.a,2*D);
    moves.push({r:1,x:E.iv.a,y:E.y,z:secu});
    moves.push({r:0,x:E.iv.a+rl,y:E.y,z:z});
  }
  // Spirale : de l'intérieur vers les parois (liaisons G1 courtes = coupe).
  for(let li=loops.length-1;li>=0;li--){
    loops[li].forEach(function(p){ moves.push({r:0,x:p.x,y:p.y,z:z}); });
  }
  const last=moves[moves.length-1];
  moves.push({r:1,x:last.x,y:last.y,z:secu});
}
function faoRoughRegions(lines){
  // Regroupe les intervalles en régions connexes en Y (recouvrement X) :
  // une nervure/îlot = une région, suivie pour elle-même (morph).
  const parent={};
  const id=function(li,ii){ return li+':'+ii; };
  const find=function(a){ while(parent[a]!==a)a=parent[a]; return a; };
  const uni=function(a,b){ a=find(a); b=find(b); if(a!==b)parent[a]=b; };
  lines.forEach(function(L,li){ L.ivs.forEach(function(iv,ii){ parent[id(li,ii)]=id(li,ii); }); });
  for(let li=1;li<lines.length;li++){
    lines[li].ivs.forEach(function(iv,ii){
      lines[li-1].ivs.forEach(function(pv,pi){
        if(iv.a<pv.b&&pv.a<iv.b)uni(id(li,ii),id(li-1,pi));
      });
    });
  }
  const groups={};
  lines.forEach(function(L,li){
    L.ivs.forEach(function(iv,ii){
      const r=find(id(li,ii));
      (groups[r]=groups[r]||[]).push({y:L.y,iv:iv});
    });
  });
  return Object.keys(groups).map(function(k){return groups[k];});
}
/* ----- entrée en arc tangent sur une paroi (mène à la passe) ----- */
// Quart de cercle S->W tangent à la direction de paroi (+Y) en W, avec
// S sur la ligne vidée à ≤10 mm de W (rayon capé à 5). G2 à gauche,
// G3 à droite — tangence prouvée par test.
function faoLeadArc(Mx,My,Wx,Wy,leftWall,z){
  const dir=leftWall?1:-1;
  if((Mx-Wx)*dir<=0)return null; // M du mauvais côté : pas d'arc
  const rLead=Math.min(Math.abs(Mx-Wx)/2,5);
  if(!(rLead>=0.5))return null;
  const Sx=Wx+dir*2*rLead, cx=Wx+dir*rLead;
  return {sx:Sx, move:{r:0,x:Wx,y:Wy,z:z,arc:{i:cx-Sx,j:0,cw:leftWall}}};
}

function faoRoughZigzag(lines,z,D,r,secu,zFrom,ae,entryMode,flat,segs,B,mesh,brutTop,moves){
  // Zigzag TOUT EN AVALANT (one-way) avec liaisons sécu : chaque intervalle =
  // approche sécu + rampe + passe + dégagement. Jamais de traversée de nervure
  // à fond, jamais de demi-tour à 180° dans la matière (c'était le cas avant).
  // Première passe du niveau : l'entrée douce du niveau (hélice/rampe).
  // Entrée du niveau sur le premier intervalle (aucun saut de coupe) ;
  // les intervalles suivants ont leur propre rampe.
  const E={y:lines[0].y,iv:lines[0].ivs[0]};
  const elen=E.iv.b-E.iv.a;
  const ecx=(E.iv.a+E.iv.b)/2;
  // CAV-75-25 : R=0.4*D.
  let wantHelix=entryMode==='helix'||(entryMode==='auto'&&elen>=2.5*D);
  let hr=Math.max(1,Math.min(D*0.4,elen/2-1));
  let hStart=zFrom;
  if(wantHelix&&!(elen>=2)){
    wantHelix=false; // trop étroit : repli rampe
  }else if(wantHelix){
    // Disque hors pièce au niveau + départ 2 mm au-dessus de la matière.
    if(!faoDiscClear(segs,ecx,E.y,hr,r))wantHelix=false;
    else hStart=Math.min(zFrom,faoHelixSpot(mesh,ecx,E.y,hr,r,z,brutTop));
  }
  let first=true;
  const pass=function(y,xa,xb,isEntry){
    if(isEntry&&wantHelix&&first){
      moves.push({r:1,x:ecx,y:E.y,z:secu});
      if(hStart<secu-1e-9)moves.push({r:0,x:ecx,y:E.y,z:hStart});
      faoHelixEntry(ecx,E.y,hStart,z,hr,D).slice(1).forEach(function(m){moves.push(m);});
      moves.push({r:0,x:xa,y:y,z:z});
      moves.push({r:0,x:xb,y:y,z:z});
    }else{
      const len=xb-xa, dir=len>=0?1:-1, rl=dir*Math.min(Math.abs(len),2*D);
      moves.push({r:1,x:xa,y:y,z:secu});
      moves.push({r:0,x:xa+rl,y:y,z:z});
      if(Math.abs(rl)<Math.abs(len)-1e-9)moves.push({r:0,x:xb,y:y,z:z});
    }
    moves.push({r:1,x:xb,y:y,z:secu});
    first=false;
  };
  let sens=1;
  lines.forEach(function(L){
    let ivs=L.ivs;
    if(sens<0)ivs=ivs.slice().reverse();
    ivs.forEach(function(iv){
      if(sens>0)pass(L.y,iv.a,iv.b,first);
      else pass(L.y,iv.b,iv.a,first);
    });
    sens=-sens;
  });
  // Parois pièce : une passe par paroi de chaque région (jamais de saut à
  // travers une nervure : les régions sont connexes en Y). On ne suit que les
  // bornes qui touchent la pièce (wl/wr), jamais les bords brut. Entrée en arc
  // tangent depuis la ligne vidée (remontée sécu, plongée au départ d'arc).
  if(!flat){
    faoRoughRegions(lines).forEach(function(R){
      [{k:'wl',x:'a',left:true},{k:'wr',x:'b',left:false}].forEach(function(side){
        const pts=[];
        R.forEach(function(q){
          if(q.iv[side.k])pts.push({x:q.iv[side.x],y:q.y,mid:(q.iv.a+q.iv.b)/2});
        });
        if(!pts.length)return;
        const p0=pts[0];
        const lead=faoLeadArc(p0.mid,p0.y,p0.x,p0.y,side.left,z);
        const cur=moves[moves.length-1];
        moves.push({r:1,x:cur.x,y:cur.y,z:secu});
        if(lead){
          moves.push({r:1,x:lead.sx,y:p0.y,z:secu});
          moves.push({r:1,x:lead.sx,y:p0.y,z:z});
          moves.push(lead.move);
        }else{
          moves.push({r:1,x:p0.mid,y:p0.y,z:secu});
          moves.push({r:1,x:p0.mid,y:p0.y,z:z});
          moves.push({r:0,x:p0.x,y:p0.y,z:z});
        }
        for(let i=1;i<pts.length;i++)moves.push({r:0,x:pts[i].x,y:pts[i].y,z:z});
      });
    });
  }
  const last=moves[moves.length-1];
  moves.push({r:1,x:last.x,y:last.y,z:secu});
}
function faoRoughIntervals(segs,B,y,r){
  // Zone à vider = BRUT rétracté MOINS section dilatée de r : on usine
  // brut−pièce (jamais la pièce). Chaque intervalle porte wl/wr : la borne
  // touche une paroi pièce (passe de paroi à suivre) ou le bord brut.
  const out=[];
  const lo=B.x0+r, hi=B.x1-r;
  if(!(hi-lo>0.2))return out;
  if(!segs.length){ out.push({a:lo,b:hi,wl:false,wr:false}); return out; }
  const forb=[];
  faoScanIntervals(segs,y).forEach(function(iv){
    const a=Math.max(lo,iv[0]-r), b=Math.min(hi,iv[1]+r);
    if(b-a>-1e-9)forb.push([a,b]);
  });
  forb.sort(function(p,q){return p[0]-q[0];});
  if(!forb.length)return []; // ligne hors section (ex : epsilon au-dessus d'un bord) : rien à y vider
  let cur=lo;
  forb.forEach(function(f){
    if(f[0]-cur>0.2)out.push({a:cur,b:f[0],wl:cur>lo+1e-9,wr:true});
    if(f[1]>cur)cur=f[1];
  });
  if(hi-cur>0.2)out.push({a:cur,b:hi,wl:cur>lo+1e-9,wr:false});
  return out;
}
/* ----- géodésique approchée : Dijkstra + iso-courbes ----- */
function faoAdjacency(mesh){
  const adj=[]; let i;
  for(i=0;i<mesh.v.length;i++)adj.push([]);
  const link=function(a,b){ if(adj[a].indexOf(b)<0)adj[a].push(b); };
  for(i=0;i<mesh.t.length;i++){
    const t=mesh.t[i];
    link(t[0],t[1]); link(t[1],t[0]); link(t[1],t[2]); link(t[2],t[1]); link(t[2],t[0]); link(t[0],t[2]);
  }
  return adj;
}
function faoDijkstra(mesh,seed){
  // Tas binaire : V=50k sans broncher dans le navigateur.
  const n=mesh.v.length, dist=new Array(n).fill(1/0);
  const adj=faoAdjacency(mesh);
  dist[seed]=0;
  const HK=[], HV=[];
  const push=function(k,v){ HK.push(k); HV.push(v); let i=HK.length-1;
    while(i>0){ const p=(i-1)>>1; if(HK[p]<=k)break; HK[i]=HK[p]; HV[i]=HV[p]; i=p; }
    HK[i]=k; HV[i]=v; };
  const pop=function(){ const top=HV[0];
    const lk=HK.pop(), lv=HV.pop();
    if(HK.length){
      HK[0]=lk; HV[0]=lv; // le dernier prend la racine, puis on le fait descendre
      let i=0;
      for(;;){ const l=i*2+1, r=l+1; let m=i;
        if(l<HK.length&&HK[l]<HK[m])m=l; if(r<HK.length&&HK[r]<HK[m])m=r;
        if(m===i)break;
        const tk=HK[i];HK[i]=HK[m];HK[m]=tk;
        const tv=HV[i];HV[i]=HV[m];HV[m]=tv; i=m; }
    }
    return top; };
  push(0,seed);
  const done=new Array(n).fill(false);
  while(HK.length){
    const u=pop();
    if(done[u])continue; done[u]=true;
    const du=dist[u], pu=mesh.v[u], nb=adj[u];
    for(let i=0;i<nb.length;i++){
      const w=nb[i], pw=mesh.v[w];
      const nd=du+Math.hypot(pw[0]-pu[0],pw[1]-pu[1],pw[2]-pu[2]);
      if(nd<dist[w]){ dist[w]=nd; push(nd,w); }
    }
  }
  return dist;
}
function faoSeedTop(mesh){
  let bi=0, bm=-1/0;
  for(let i=0;i<mesh.v.length;i++)if(mesh.v[i][2]>bm){bm=mesh.v[i][2];bi=i;}
  return bi;
}
function faoIsoSegs(mesh,normals,dist,iso){
  // Marching-triangles : segments 3D + normales interpolées (points de contact).
  const segs=[];
  for(let i=0;i<mesh.t.length;i++){
    const ti=mesh.t[i];
    const P=[mesh.v[ti[0]],mesh.v[ti[1]],mesh.v[ti[2]]];
    const N=[normals[ti[0]],normals[ti[1]],normals[ti[2]]];
    const d=[dist[ti[0]]-iso,dist[ti[1]]-iso,dist[ti[2]]-iso];
    const pts=[];
    for(let k=0;k<3;k++){
      const da=d[k], db=d[(k+1)%3];
      if((da<0&&db>=0)||(da>=0&&db<0)){
        const s=Math.abs(db-da)>1e-12?da/(da-db):0;
        const A=P[k], B=P[(k+1)%3], NA=N[k], NB=N[(k+1)%3];
        pts.push({
          p:[A[0]+(B[0]-A[0])*s,A[1]+(B[1]-A[1])*s,A[2]+(B[2]-A[2])*s],
          n:[NA[0]+(NB[0]-NA[0])*s,NA[1]+(NB[1]-NA[1])*s,NA[2]+(NB[2]-NA[2])*s]
        });
      }
    }
    if(pts.length>=2)segs.push([pts[0],pts[1]]);
  }
  return segs;
}
function faoChainSegs(segs,tol){
  // Chaînage glouton par extrémités proches (points iso coïncidents aux arêtes).
  const t2=(tol||1e-4), chains=[];
  const used=new Array(segs.length).fill(false);
  const key=function(p){return p.p;};
  const deq=function(a,b){ const dx=a[0]-b[0],dy=a[1]-b[1],dz=a[2]-b[2];
    return dx*dx+dy*dy+dz*dz<t2*t2; };
  for(let s=0;s<segs.length;s++){
    if(used[s])continue;
    used[s]=true;
    const chain=[segs[s][0],segs[s][1]];
    let grew=true, guard=0;
    while(grew&&guard++<100000){
      grew=false;
      for(let k=0;k<segs.length;k++){
        if(used[k])continue;
        const A=segs[k][0], B=segs[k][1];
        if(deq(key(chain[chain.length-1]),key(A))){chain.push(B);used[k]=true;grew=true;break;}
        if(deq(key(chain[chain.length-1]),key(B))){chain.push(A);used[k]=true;grew=true;break;}
        if(deq(key(chain[0]),key(B))){chain.unshift(A);used[k]=true;grew=true;break;}
        if(deq(key(chain[0]),key(A))){chain.unshift(B);used[k]=true;grew=true;break;}
      }
    }
    chains.push(chain);
  }
  return chains;
}
function faoGenGeoFinish(mesh,o){
  // Finition iso-géodésique : iso-courbes du champ de distances, sorties centre
  // outil (contact + normale×Rc, Rc = rayon actif : boule D/2, torique r coin).
  o=o||{};
  if(!mesh||!mesh.v||!mesh.v.length)return [];
  const D=isFinite(+o.toolD)&&+o.toolD>0?+o.toolD:8;
  const kind=o.kind||'ball';
  const Rc=kind==='flat'?0:(kind==='bull'?Math.min(D/2,isFinite(+o.cornerR)?+o.cornerR:D/2):D/2);
  const L=isFinite(+o.laisse)&&+o.laisse>0?+o.laisse:0;
  const R=Rc+L;
  const secu=isFinite(+o.secu)?+o.secu:5;
  const step=isFinite(+o.step)&&+o.step>0?+o.step:1;
  const normals=faoMeshNormals(mesh);
  const seed=(o.seed==='bottom')?faoSeedBottom(mesh):faoSeedTop(mesh);
  const dist=faoDijkstra(mesh,seed);
  let dmax=0;
  for(let i=0;i<dist.length;i++)if(dist[i]<1/0&&dist[i]>dmax)dmax=dist[i];
  if(!(dmax>0))return [];
  const moves=[];
  for(let iso=step;iso<dmax;iso+=step){
    const segs=faoIsoSegs(mesh,normals,dist,iso);
    if(!segs.length)continue;
    const chains=faoChainSegs(segs,Math.max(1e-4,step*0.02));
    chains.forEach(function(ch){
      if(ch.length<2)return;
      const cen=ch.map(function(q){
        const l=Math.hypot(q.n[0],q.n[1],q.n[2])||1;
        return {x:q.p[0]+q.n[0]/l*R, y:q.p[1]+q.n[1]/l*R, z:q.p[2]+q.n[2]/l*R};
      });
      moves.push({r:1,x:cen[0].x,y:cen[0].y,z:secu});
      moves.push({r:1,x:cen[0].x,y:cen[0].y,z:cen[0].z});
      for(let i=0;i<cen.length;i++)moves.push({r:0,x:cen[i].x,y:cen[i].y,z:cen[i].z});
    });
    if(moves.length){ const last=moves[moves.length-1]; moves.push({r:1,x:last.x,y:last.y,z:secu}); }
  }
  return moves;
}
function faoSeedBottom(mesh){
  let bi=0, bm=1/0;
  for(let i=0;i<mesh.v.length;i++)if(mesh.v[i][2]<bm){bm=mesh.v[i][2];bi=i;}
  return bi;
}

/* ----- mode sélection : chaîne d'arêtes pour limite d'usinage ----- */
// Germes cliqués (jaune) + tangentes déduites (rouge), comme les congés.
// À la validation on SNAPSHOTE la boucle XY dans op.limit + les ancres des germes :
// la limite survit au rejeu (re-suie auto par faoChainReplay) et à la sauvegarde
// sans OCCT ; arêtes trop déplacées -> stale (alerte) -> re-sélectionner.
let faoChainMode=null, faoChainHover=null;
function faoChainStart(setupId,opId){
  try{
    if(typeof skEdit!=='undefined'&&skEdit){faceEl.textContent='Chaîne : fermez l\'esquisse d\'abord.';return;}
    if((typeof filMode!=='undefined'&&filMode)||(typeof filModeX!=='undefined'&&filModeX)||
       (typeof mvMode!=='undefined'&&mvMode)||(typeof draftMode!=='undefined'&&draftMode)||
       (typeof coqueMode!=='undefined'&&coqueMode)||(typeof extPickFace!=='undefined'&&extPickFace)){
      faceEl.textContent='Chaîne : quittez le mode en cours d\'abord.';return;
    }
    if(!occLive||!occLive.shape){
      if(typeof occHas==='function'&&!occHas()){faceEl.textContent='Chaîne : solide exact indisponible (OCCT non chargé ou aucun volume).';return;}
      try{rebuild();}catch(e){}
      if(!occLive||!occLive.shape){faceEl.textContent='Chaîne : recalcul impossible.';return;}
    }
    let edges=[];
    try{ edges=occSharpEdges(occLive.shape); }catch(e){ edges=[]; }
    if(!edges.length){faceEl.textContent='Chaîne : aucune arête listable.';return;}
    const setup=faoSetup(setupId);
    const op=(setup.ops||[]).filter(function(o){return o.id===opId;})[0];
    if(!op){faceEl.textContent='Chaîne : opération introuvable.';return;}
    const old=op.limit&&op.limit.mode==='chain'?op.limit:null;
    faoChainMode={setupId:setup.id,opId:op.id,edges:edges,seeds:[],
      tangent:old?!!old.tangent:true,sel:[]};
    faoChainHover=null;
    faoChainBuildOverlay();
    if(typeof renderProps==='function')renderProps();
    faceEl.textContent='Chaîne : cliquez des arêtes ('+edges.length+' listées) · tangentes auto '+
      (faoChainMode.tangent?'ON':'OFF')+' · OK valide, Échap annule.';
  }catch(e){ try{faceEl.textContent='Chaîne : impossible ('+e.message+').';}catch(e2){} }
}
function faoChainExit(silent){
  try{
    faoChainMode=null; faoChainHover=null;
    if(typeof scene!=='undefined'&&scene){
      const o=scene.getObjectByName('faoChainEdges');
      if(o)scene.remove(o);
    }
    try{renderer.domElement.style.cursor='default';}catch(e){}
    if(!silent){
      faoRefreshFaoUI();
      try{ if(typeof renderProps==='function')renderProps(); }catch(e){}
    }
  }catch(e){}
}
function faoChainBuildOverlay(){
  try{
    if(!faoChainMode)return;
    const old=scene.getObjectByName('faoChainEdges');
    if(old)scene.remove(old);
    const positions=[], colors=[], segEdge=[];
    faoChainMode.edges.forEach(function(e,i){
      const p=e.pts||[];
      for(let k=0;k+1<p.length;k++){
        positions.push(p[k][0],p[k][1],p[k][2],p[k+1][0],p[k+1][1],p[k+1][2]);
        colors.push(0,0,0,0,0,0);
        segEdge.push(i);
      }
    });
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    const mat=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0.95,depthTest:true});
    const l=new THREE.LineSegments(geo,mat);
    l.renderOrder=999;
    l.userData.segEdge=segEdge;
    const grp=new THREE.Group(); grp.name='faoChainEdges'; grp.add(l);
    scene.add(grp);
    faoChainPaint();
  }catch(e){ try{faceEl.textContent='Chaîne : affichage impossible ('+e.message+').';}catch(e2){} }
}
function faoChainIsSeed(i){
  return !!(faoChainMode&&faoChainMode.seeds&&faoChainMode.seeds.indexOf(i)>=0);
}
function faoChainIsSel(i){
  if(!faoChainMode)return false;
  return faoChainMode.sel.indexOf(i)>=0;
}
function faoChainPaint(){
  try{
    const grp=scene.getObjectByName('faoChainEdges');
    if(!grp||!faoChainMode)return;
    const l=grp.children[0];
    if(!l||!l.geometry||!l.geometry.attributes.color)return;
    const col=l.geometry.attributes.color, segEdge=l.userData.segEdge;
    if(!segEdge)return;
    const c=new THREE.Color(), cache={};
    for(let k=0;k<segEdge.length;k++){
      const i=segEdge[k];
      let hex=cache[i];
      if(hex===undefined)hex=cache[i]=faoChainIsSeed(i)?0xffd60a:(faoChainIsSel(i)?0xff453a:(faoChainHover===i?0xffd60a:0x0a84ff));
      c.setHex(hex);
      col.setXYZ(k*2,c.r,c.g,c.b);
      col.setXYZ(k*2+1,c.r,c.g,c.b);
    }
    col.needsUpdate=true;
  }catch(e){}
}
function faoChainPick(e){
  try{
    const grp=scene.getObjectByName('faoChainEdges');
    if(!grp||!faoChainMode)return null;
    const r=renderer.domElement.getBoundingClientRect();
    const ndc=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
    rayc.setFromCamera(ndc,camera);
    rayc.params.Line.threshold=2;
    const hits=rayc.intersectObjects(grp.children,false);
    if(!hits.length)return null;
    const segEdge=hits[0].object.userData.segEdge;
    if(!segEdge)return null;
    const i=segEdge[Math.round(hits[0].index/2)];
    return (i!==undefined&&i>=0&&i<faoChainMode.edges.length)?i:null;
  }catch(e){ return null; }
}
function faoChainSync(){
  if(!faoChainMode)return;
  if(faoChainMode.tangent){
    const all=[];
    (faoChainMode.seeds||[]).forEach(function(s){
      faoTangentSet(faoChainMode.edges,[s]).forEach(function(j){ if(all.indexOf(j)<0)all.push(j); });
    });
    faoChainMode.sel=all;
  }else{
    faoChainMode.sel=(faoChainMode.seeds||[]).slice();
  }
}
function faoChainToggle(e){
  try{
    if(!faoChainMode||!faoChainMode.edges)return;
    const i=faoChainPick(e);
    if(i===null||i===undefined||!faoChainMode.edges[i]){
      faceEl.textContent='Chaîne : cliquez une arête bleue.'+
        (faoChainMode.tangent?' Les tangentes sont ajoutées automatiquement.':' Une seule arête par clic.');
      return;
    }
    const k=faoChainMode.seeds.indexOf(i);
    if(k>=0)faoChainMode.seeds.splice(k,1);
    else faoChainMode.seeds.push(i);
    faoChainSync();
    faoChainPaint();
    if(typeof renderProps==='function')renderProps();
    const extra=(faoChainMode.tangent&&faoChainMode.sel.length>faoChainMode.seeds.length)
      ?' ('+faoChainMode.sel.length+' retenues dont '+faoChainMode.seeds.length+' cliquée(s) + tangentes)':'';
    faceEl.textContent='Chaîne : '+faoChainMode.sel.length+' arête(s)'+extra+'.';
  }catch(err){ try{faceEl.textContent='Chaîne : sélection impossible ('+err.message+').';}catch(e2){} }
}
function faoChainPanel(p,setup,op){
  p.appendChild(faoH('Limite : chaîne d\'arêtes'));
  const n=faoChainMode.sel.length, ns=(faoChainMode.seeds||[]).length;
  const info=document.createElement('div');
  info.style.cssText='font-size:.78rem;';
  info.textContent=n+' arête(s) retenue(s)'+(faoChainMode.tangent?' dont '+ns+' cliquée(s) + tangentes':'')+'.';
  p.appendChild(info);
  const r=faoRow();
  const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=!!faoChainMode.tangent;
  cb.onchange=function(){ faoChainMode.tangent=cb.checked; faoChainSync(); faoChainPaint(); faoRefreshFaoUI(); };
  r.appendChild(cb);
  const lb=document.createElement('span'); lb.textContent='Arêtes tangentes auto';
  lb.style.cssText='font-size:.76rem;'; r.appendChild(lb);
  p.appendChild(r);
  const r2=faoRow();
  const ok=document.createElement('button'); ok.textContent='OK · utiliser comme limite'; ok.style.fontSize='.78rem';
  ok.onclick=function(){ faoChainOk(); };
  const no=document.createElement('button'); no.textContent='Annuler'; no.style.fontSize='.72rem';
  no.onclick=function(){ faoChainExit(); faceEl.textContent='Chaîne : annulée, limite inchangée.'; };
  const clr=document.createElement('button'); clr.textContent='Effacer'; clr.style.fontSize='.72rem';
  clr.onclick=function(){ faoChainMode.seeds=[]; faoChainMode.sel=[]; faoChainPaint(); faoRefreshFaoUI(); };
  r2.appendChild(ok); r2.appendChild(no); r2.appendChild(clr);
  p.appendChild(r2);
  const note=document.createElement('div');
  note.style.cssText='font-size:.68rem;color:rgba(255,255,255,.5);line-height:1.35;';
  note.textContent='La boucle est re-suie automatiquement à chaque rejeu (ancres des germes) ; si les arêtes ont trop bougé, la fiche passe en alerte. Chaîne ouverte : refermée d\'office en segment droit.';
  p.appendChild(note);
}
function faoChainOk(){
  try{
    if(!faoChainMode)return;
    const setup=faoSetup(faoChainMode.setupId);
    const op=(setup.ops||[]).filter(function(o){return o.id===faoChainMode.opId;})[0];
    if(!op){faceEl.textContent='Chaîne : opération introuvable.';faoChainExit();return;}
    if(!faoChainMode.sel.length){faceEl.textContent='Chaîne : aucune arête — limite inchangée.';faoChainExit();return;}
    const chains=faoOrderEdges(faoChainMode.edges,faoChainMode.sel);
    let res=faoLoopFromChains(faoChainMode.edges,chains);
    if(!res.loop.length||faoLoopArea(res.loop)<1e-6){
      faceEl.textContent='Chaîne : boucle dégénérée — limite inchangée.';return;
    }
    // Cap : les très longues chaînes sont sous-échantillonnées (clip en O(n)).
    res=faoChainLoopCap(res);
    const nEdges=faoChainMode.sel.length, wasTangent=!!faoChainMode.tangent;
    const old=op.limit&&op.limit.mode==='chain'?op.limit:null;
    faoSnapshot('limite en chaîne');
    op.limit={mode:'chain',loop:res.loop,closed:res.closed,
      nEdges:nEdges,tangent:wasTangent,
      // Ancres des germes (figées) : permettent à faoChainReplay de re-suivre la
      // boucle à chaque fin de rejeu, et de passer en stale si plus retrouvable.
      anchors:(faoChainMode.seeds||[]).map(function(i){return faoEdgeAnchor(faoChainMode.edges[i]);}).filter(Boolean),
      stale:false,
      side:(old&&old.side)||'center',extra:(old&&isFinite(+old.extra))?+old.extra:0};
    faoChainExit();
    faoChanged();
    faceEl.textContent='Chaîne : limite '+(res.closed?'fermée':'refermée')+' ('+
      nEdges+' arêtes) enregistrée.';
  }catch(e){ try{faceEl.textContent='Chaîne : validation impossible ('+e.message+').';}catch(e2){} }
}
try{ faoInitUI(); }catch(e){}
