/* ================= viewer d'usinage (brut + outil, ▶ lecture / ⏸ pause / ⏹ stop) =================
   Cache les traces, fait apparaître la boîte du brut (+ le corps-brut masqué s'il y en a un),
   anime l'outil le long du parcours et dessine un BOUT de trace qui suit la fraise
   puis disparaît au fur et à mesure derrière elle (fenêtre glissante). */
let faoVw=null, faoVwBar=null, faoVwBarT=null, faoVwBtn=null, faoVwMatterBtn=null, faoVwEsc=false;
// 2026-10-11-007 : le bouton de la barre est à 3 ÉTATS (cycle) —
//   `reel`  ◈  surface NETTE aux cotes exactes (défaut « forme réelle » de 003)
//   `lisse` ≈  physique réelle + surface DOUCE (heightfield continu de la 002)
//   (`simple` — cylindre, carve Ø/2, colonnes, boîte — retiré le 2026-10-22-002)
// `faoViewerExact` reste la PHYSIQUE réelle (= mode !== 'simple', lue par
// l'outil/le carve/le brut) ; `faoViewerMode` ajoute le style de SURFACE.
let faoViewerMode='reel';
let faoViewerExact=true, faoVwExactBtn=null;
// 2026-10-13-003 : affichage des RAPIDES dans l'aperçu (demande « presque
// plus de traces rouges, juste le nécessaire ») — 3 états :
//   tous   rouge 30 % (défaut, historique)
//   fondu  rouge 8 % (contexte sans bruit)
//   masque rapides non dessinés (coupe + entrées seules)
// Recoloration SANS régénération : faoRefreshPreview redessine depuis les
// moves mémorisés (lecture seule).
let faoViewerRap='tous', faoVwRapBtn=null;
function faoViewerRapLabel(s){
  return s==='tous'?'Rapides ✓':(s==='fondu'?'Rapides ~':'Rapides ✕');
}
function faoViewerRapSet(s){
  faoViewerRap=s;
  try{ if(faoVwRapBtn)faoVwRapBtn.textContent=faoViewerRapLabel(s); }catch(e){}
  try{ localStorage.setItem('minifusion_faoRap',s); }catch(e){}
  try{ faoRefreshPreview(); }catch(e){}
}
function faoViewerRapNext(){
  const order=['tous','fondu','masque'];
  const i=order.indexOf(faoViewerRap);
  faoViewerRapSet(order[(i<0?0:i+1)%order.length]);
}
// 2026-10-11-003 : finesse du détail (0 bas / 1 normal / 2 haut) — pilote le budget
// de la grille de matière ET le maillage de l'outil, avec les 2 cases de la barre :
// « corps pièce » (corps 3D masqués, brut et matière visibles) et « corps outil »
// (le mandrin gris).
// 2026-10-11-004 : budgets relevés pour que l'arrondi R2 de la fraise torique soit
// VISIBLE au niveau normal (maille 0,4 mm ≈ 5 échantillons sur l'arc de 2 mm — à
// 0,5/0,788 mm l'arc fondait à l'œil) — la promesse « byte-identique » du niveau 1
// est abandonnée (cf. CHANGELOG 2026-10-11-004).
let faoViewerDetail=1, faoVwDetailSel=null, faoVwHideBody=false, faoVwHideHold=false;
const faoDetailCfg=[
  {B:8000, F:2.0,  lathe:12, tub:16, rad:4},
  {B:200000,F:0.4, lathe:24, tub:36, rad:6},
  {B:400000,F:0.25,lathe:44, tub:64, rad:8}];
function faoViewerMsg(t){
  // Retour utilisateur (jamais silencieux) : barre d'état + console.
  try{ if(typeof faceEl!=='undefined'&&faceEl)faceEl.textContent=t; }catch(e){}
  try{ if(typeof console!=='undefined'&&console&&console.log)console.log(t); }catch(e){}
}
function faoViewerBtnUpdate(){
  // Le bouton « Usinage » de la fiche bascule : OUVRIR le mode lecture / en SORTIR.
  try{
    if(!faoVwBtn)return;
    faoVwBtn.textContent=faoVw?'■ Quitter l\'usinage':'▶ Usinage';
    faoVwBtn.title=faoVw
      ?'Mode lecture usinage actif : sortir du mode (aussi Échap ou ✕ de la barre) — ré-affiche les traces, retire l\'outil, le brut et la matière.'
      :'Viewer d\'usinage : cache les traces, fait apparaître le brut, anime l\'outil le long du parcours — barre ▶ ⏸ ⏹ ✕ en bas de la vue (Échap pour sortir).';
  }catch(e){}
}

function faoViewerBuild(setup){
  // Séquence complète du posage : points (arcs développés), Ø outil par point,
  // temps cumulé réel (coupe = feed outil, rapide = G0) — pur, testable sans scène.
  // 2026-10-08-004 : DÉBUT/FIN — l'outil VIENT de la zone de retrait et y
  // retourne, uniquement en Z : un point d'ancrage au même XY encadre le
  // parcours (aucun déplacement XY inventé en tête/queue de séquence).
  const chunks=[]; // par opération : {op, ext, f, d, kind, cr} — saut inter-ops sans temps (historique)
  faoSeqSafe(setup).forEach(function(S){
    const op=S.op;
    const tool=faoToolById(setup,op.toolId);
    const d=tool?faoToolBodyD(tool):10; // Ø du corps (d2 d'un foret à centrer)
    const kind=(tool&&tool.kind)?tool.kind:'flat';
    const cr=faoToolEffCr(tool); // rayon d'arête réel (mm) — forme de coupe par point
    const tp=faoToolTipProfile(tool); // pointe de foret (mm) — null = fraise
    const sf=tool?faoOpCutting(op,setup):null; // avance de CETTE opération
    const f=(sf&&isFinite(+sf.f)&&+sf.f>0)?+sf.f:1000;
    const mv=S.moves;
    const ext=[]; let pv=null; // arcs développés (tracé lisse)
    mv.forEach(function(m){
      let dev=false;
      if(pv&&!pv.r&&m.arc){
        try{
          const SA=faoArcSegs(pv,m);
          // 2026-10-08-005 : un arc développé d'entrée (ent) garde l'étiquette
          // sur ses échantillons — le tracé bleu suit l'arc entier.
          if(SA&&SA.length){ SA.forEach(function(q){ ext.push({x:q[0],y:q[1],z:q[2],r:0,ent:m.ent?1:0}); }); dev=true; }
        }catch(e){}
      }
      // Un arc développé ne repousse PAS son move original : ce doublon `.arc` ferait
      // recalculer faoSegLen depuis le bout du développé (i/j relatifs au VRAI départ →
      // centre faux → angle ≈ 2π → temps fictif = gel de ~3-5 s après chaque arc).
      ext.push(dev?{x:m.x,y:m.y,z:m.z,r:m.r?1:0,ent:m.ent?1:0}:m);
      pv=m;
    });
    // 2026-10-16-021 : axe outil de l'opération (repère propre 3+2), en repère posage — null = vertical
    const axO=(function(){ try{ const fr=faoOpFrame(setup,op); return fr?fr.rel.Z.slice():null; }catch(e){ return null; } })();
    if(ext.length)chunks.push({op:op,ext:ext,f:f,d:d,kind:kind,cr:cr,tp:tp,ax:axO});
  });
  // Encadrement « zone de retrait » (2026-10-08-004) : en tête, l'outil vient
  // de la zone de retrait ; en queue, il y retourne — dans les DEUX cas un
  // rapide vertical au même XY (le segment prend la commande de sa destination,
  // comme partout ailleurs). Segments plus courts que le retrait : inchangé.
  if(chunks.length){
    const r0=faoRetractAbs(chunks[0].op,setup);
    const rN=faoRetractAbs(chunks[chunks.length-1].op,setup);
    const e0=chunks[0].ext;
    if(isFinite(r0)&&r0>e0[0].z+1e-9)e0.unshift({x:e0[0].x,y:e0[0].y,z:r0,r:1});
    const eN=chunks[chunks.length-1].ext, lN=eN[eN.length-1];
    if(isFinite(rN)&&rN>lN.z+1e-9)eN.push({x:lN.x,y:lN.y,z:rN,r:1});
  }
  const pts=[], dd=[], kt=[], cr=[], tps=[], times=[], lens=[]; // times[i] = temps cumulé EN ARRIVANT au point i
  let total=0, cum=0; // cum = longueur cumulée (fenêtre de trace qui suit la fraise)
  chunks.forEach(function(C){
    let prev=null;
    C.ext.forEach(function(m){
      pts.push({x:+m.x||0, y:+m.y||0, z:+m.z||0, r:m.r?1:0, ent:m.ent?1:0, ax:C.ax||null});
      dd.push(C.d);
      kt.push(C.kind||'flat');
      cr.push(C.cr||0);
      tps.push(C.tp||null);
      if(prev){
        const len=faoSegLen(prev,m);
        const v=m.r?faoRapide(setup):C.f;
        total+=len/((isFinite(v)&&v>0?v:600)/60);
        cum+=len;
      }
      times.push(total);
      lens.push(cum);
      prev=m;
    });
  });
  return {pts:pts, dd:dd, kt:kt, cr:cr, tp:tps, times:times, lens:lens, T:total};
}
function faoViewerSeek(vw,t){
  // Position à l'instant t (linéaire entre les points, idx incrémental + retour arrière).
  const n=vw.pts.length;
  if(!n)return null;
  let i=Math.min(vw.idx||0, n-1);
  while(i<n-1&&vw.times[i+1]<=t)i++;
  while(i>0&&vw.times[i]>t)i--;
  vw.idx=i;
  if(t>=vw.T){ const p=vw.pts[n-1]; return {i:n-1,f:0,x:p.x,y:p.y,z:p.z,r:p.r,d:vw.dd[n-1],done:true}; }
  if(t<=0){ const p=vw.pts[0]; return {i:0,f:0,x:p.x,y:p.y,z:p.z,r:p.r,d:vw.dd[0],done:false}; }
  const t0=vw.times[i], t1=vw.times[i+1];
  const f=(t1>t0)?Math.max(0,Math.min(1,(t-t0)/(t1-t0))):0;
  const a=vw.pts[i], b=vw.pts[i+1];
  return {i:i,f:f,x:a.x+(b.x-a.x)*f, y:a.y+(b.y-a.y)*f, z:a.z+(b.z-a.z)*f, r:b.r, d:vw.dd[i+1], done:false};
}
function faoTraceWindow(lens,i,f){
  // Début de la fenêtre de trace : seul un BOUT (~40 mm) du trajet reste
  // visible derrière la fraise — le reste disparaît au fur et à mesure.
  // Pur (sans scène, testable) ; sans lens : 0 = repli historique complet.
  if(!lens||!lens.length)return 0;
  const n=lens.length;
  const k=Math.max(0,Math.min(n-1,i|0));
  const Le=lens[k]+((k+1<n)?(lens[k+1]-lens[k])*(+f||0):0);
  let from=k;
  while(from>0&&lens[from]>Le-40)from--;
  return from;
}
function faoViewerApply(){
  const vw=faoVw; if(!vw)return;
  const p=faoViewerSeek(vw,vw.t);
  if(!p)return;
  vw.drawn=Math.min(p.i+2,vw.pts.length); // points atteints (la fenêtre le resserre plus bas)
  if(vw.tool){
    // 2026-10-13-006 : les points chemin sont la POINTE outil (tip) — le corps
    // a sa pointe en z local 0, positionnement direct. (L'ancien bug centre→tip
    // est corrigé à la source dans addLevel du géofinish.)
    vw.tool.position.x=p.x; vw.tool.position.y=p.y; vw.tool.position.z=p.z;
    // 2026-10-16-021 : outil le long du Z de l'opération (3+2) — vertical sinon
    try{ const q=vw.pts[Math.min(p.i+1,vw.pts.length-1)]; const A=q&&q.ax;
      if(A)vw.tool.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(A[0],A[1],A[2]));
      else vw.tool.quaternion.set(0,0,0,1); }catch(e){}
    const d=(isFinite(p.d)&&p.d>0)?p.d:10;
    if(vw.toolBody){ vw.toolBody.scale.x=d; vw.toolBody.scale.z=d; }   // Ø réel
    if(vw.toolHold){ vw.toolHold.scale.x=d*1.6; vw.toolHold.scale.z=d*1.6; }
    if(vw.exact&&vw.kt){
      // Outil change en cours de parcours (changement T1→T6) : le profil réel
      // (kind + rayon d'arête / Ø) est reconstruit — seul le corps change.
      const i2=Math.min(p.i+1,vw.pts.length-1);
      const kind=vw.kt[i2]||'flat';
      const cr=(vw.cr&&isFinite(+vw.cr[i2]))?+vw.cr[i2]:0;
      const tp=(vw.tp&&vw.tp[i2])||null;
      const sig=kind+'@'+(cr/d).toFixed(4)+'#'+faoViewerDetail+faoTipSig(tp); // #détail : rebuild au changement de finesse
      if(sig!==vw.toolSig){ vw.toolSig=sig; faoViewerToolBodySwap(vw,kind,cr,d,tp); }
    }
  }
  if(vw.line){ // trace qui SUIT la fenêtre : ~40 mm de trajet derrière l'outil
    const i=p.i;
    const from=faoTraceWindow(vw.lens,p.i,p.f);
    const to=Math.min(i+2,vw.pts.length);
    vw.drawn=Math.max(0,to-from);
    try{
      const pos=vw.line.geometry&&vw.line.geometry.attributes&&vw.line.geometry.attributes.position;
      const arr=pos&&pos.array;
      if(arr&&arr.length>0&&arr.length>=6){
        arr[3*i]=vw.pts[i].x; arr[3*i+1]=vw.pts[i].y; arr[3*i+2]=vw.pts[i].z;
        if(i+1<vw.pts.length){ arr[3*i+3]=p.x; arr[3*i+4]=p.y; arr[3*i+5]=p.z; }
        pos.needsUpdate=true;
        vw.line.geometry.setDrawRange(from,vw.drawn);
      }
    }catch(e){}
  }
  try{ faoViewerMatterStep(vw,p); }catch(e){} // matière usinée qui disparaît
}
function faoFluteTh(off,t){
  // Angle de la gorge (Ø unitaire) : HÉLICE DROITE — th DÉCROÎT quand la hauteur
  // t croît (angle atan2(z,x) local qui décroît vers le mandrin). Fraise à
  // denture droite standard : cohérente avec la rotation M03 (horaire vue du
  // mandrin, `rotation.y -=`) — l'outil avance dans la matière et les copeaux
  // remontent. Sources : Mitsubishi (helix hand + « rotate clockwise viewed from
  // the shank side »), ISCAR (hélice droite = gorges qui s'enroulent horaire en
  // s'éloignant de l'extrémité), engineeringtechnology.org (coupier droite +
  // hélice droite = évacuation vers le haut).
  return off-2*Math.PI*1.5*t;
}
function faoViewerToolFill(spinner,kind,cr,d,H,tp){
  // Corps de la fraise en forme réelle : profil Lathe (plat / torique / boule) +
  // 3 gorges hélicoïdales (tubes fins) qui lisent comme des arêtes de coupe.
  // Coordonnées unitaires (Ø = 1) : le groupe outil met à l'échelle (scale x/z = Ø,
  // scale y = H). 2026-10-13-001 : H transmis au profil (sphère vraie) ; gorges
  // démarrant juste au-dessus de l'arc (arcH), plus au-dessus d'une pointe étirée.
  try{
    const cfg=faoDetailCfg[faoViewerDetail]||faoDetailCfg[1];
    const bh=(isFinite(+H)&&+H>0)?+H:((+d)||10);
    const tipH=(tp&&tp.length>1)?tp[tp.length-1][1]:0; // haut de la pointe de foret (mm)
    const arcH=Math.max((+cr||0),tipH)/bh;
    const pts=faoToolProfile(kind,cr,d,bh,tp).map(function(p){ return new THREE.Vector2(p[0],p[1]); });
    const lat=new THREE.Mesh(new THREE.LatheGeometry(pts,cfg.lathe),
      new THREE.MeshPhongMaterial({color:0x9ad1ff,emissive:0x112f4d}));
    lat.raycast=function(){};
    spinner.add(lat);
    const fm=new THREE.MeshPhongMaterial({color:0x2f5f8f,emissive:0x0a1626});
    const y0=arcH+0.02+Math.min(0.05,((+cr||0)/((+d)||10))*0.3); // gorges juste au-dessus de l'arc
    for(let f=0;f<3;f++){
      (function(off){
        const c=new THREE.Curve();
        c.getPoint=function(t,tgt){
          tgt=tgt||new THREE.Vector3();
          const th=faoFluteTh(off,t);
          tgt.set(0.465*Math.cos(th), y0+0.60*t, 0.465*Math.sin(th));
          return tgt;
        };
        const tube=new THREE.Mesh(new THREE.TubeGeometry(c,cfg.tub,0.05,cfg.rad,false),fm);
        tube.raycast=function(){};
        spinner.add(tube);
      })(f*2*Math.PI/3);
    }
  }catch(e){}
}
function faoViewerToolBodyMake(kind,cr,d,H,exact,tp){
  // Corps de fraisier : axe local Y, rotation 90° → vertical, pointe au z=0
  // du groupe outil. exact=false : cylindre Ø plat HISTORIQUE (inchangé byte-à-byte).
  if(!exact){
    const b=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,1,20),
      new THREE.MeshPhongMaterial({color:0x9ad1ff,flatShading:true,emissive:0x112f4d}));
    b.raycast=function(){};
    b.rotation.x=Math.PI/2;
    b.scale.x=10; b.scale.y=H; b.scale.z=10;
    b.position.z=H/2;
    return b;
  }
  const tb=new THREE.Group();
  tb.rotation.x=Math.PI/2;
  tb.scale.x=(d>0?d:10); tb.scale.y=H; tb.scale.z=(d>0?d:10);
  tb.position.z=0;
  const spin=new THREE.Group(); // rotation pendant l'avance (gorges qui tournent)
  faoViewerToolFill(spin,kind,cr,d,H,tp);
  tb.add(spin);
  tb.userData.spin=spin;
  return tb;
}
function faoViewerToolCreate(exact,kind,cr,d,tp){
  // Groupe outil : fraisier (voir faoViewerToolBodyMake) + mandrin.
  const H=30;
  const g=new THREE.Group(); g.name='faoViewerTool';
  let body=null, hold=null, spin=null, sig=null;
  try{
    body=faoViewerToolBodyMake(kind,cr,d,H,!!exact,tp);
    spin=(body&&body.userData)?body.userData.spin:null;
    sig=exact?(kind+'@'+((+cr||0)/((+d)||10)).toFixed(4)+'#'+faoViewerDetail+faoTipSig(tp)):null;
    g.add(body);
    hold=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,1,16),
      new THREE.MeshPhongMaterial({color:0x676c75,flatShading:true}));
    hold.raycast=function(){};
    hold.rotation.x=Math.PI/2;
    hold.scale.x=16; hold.scale.y=12; hold.scale.z=16;
    hold.position.z=H+6;
    g.add(hold);
  }catch(e){}
  return {group:g, body:body, hold:hold, H:H, spin:spin, sig:sig};
}
function faoViewerToolDispose(obj){
  try{
    obj.traverse(function(o){
      if(o.geometry&&o.geometry.dispose)o.geometry.dispose();
      if(o.material&&o.material.dispose)o.material.dispose();
    });
  }catch(e){}
}
function faoViewerToolBodySwap(vw,kind,cr,d,tp){
  // Changement d'outil EN COURS de parcours (T1→T6) : seul le corps est
  // reconstruit (profil + gorges) ; groupe outil et mandrin sont conservés.
  try{
    const parent=vw.tool; if(!parent)return;
    const old=vw.toolBody;
    const H=vw.toolH||30;
    const tb=faoViewerToolBodyMake(kind,cr,d,H,!!vw.exact,tp);
    tb.scale.x=(d>0?d:10); tb.scale.z=(d>0?d:10);
    parent.add(tb);
    if(old){ try{ parent.remove(old); }catch(e){} faoViewerToolDispose(old); }
    vw.toolBody=tb;
    vw.toolSpin=(tb&&tb.userData)?tb.userData.spin:null;
  }catch(e){}
}
function faoViewerStockCreate(){
  // Boîte du brut (semi-transparente + arêtes) : la bbox sert de « pièce à usiner ».
  // 2026-10-11-002 : en rendu « forme réelle », un brut au CORPS réel (stockSrc
  // = body) affiche un fantôme jaune du maillage du corps — pas une simple boîte.
  const s=faoStock();
  if(!faoStockValid(s))return null;
  const g=new THREE.Group(); g.name='faoViewerStock';
  if(faoViewerExact){
    try{
      const fs=faoSetup();
      if(fs&&fs.stockSrc==='body'&&fs.stockBody!=null){
        const b=(typeof bodies!=='undefined'&&bodies?bodies:[]).filter(function(x){return x&&x.id===fs.stockBody;})[0];
        if(b&&b.mesh&&b.mesh.isObject3D){
          const clone=b.mesh.clone();
          try{ const Fr=faoFrame(fs); if(!Fr.id)clone.applyMatrix4(new THREE.Matrix4().makeBasis(new THREE.Vector3(...Fr.X),new THREE.Vector3(...Fr.Y),new THREE.Vector3(...Fr.Z)).invert()); }catch(e){} // sous la racine posage
          const mat=new THREE.MeshBasicMaterial({color:0xffd60a,transparent:true,opacity:.12,depthWrite:false});
          clone.traverse(function(o){ if(o.isMesh){ o.material=mat; o.raycast=function(){}; } });
          g.add(clone);
          // 2026-10-14-012 : plus d'arêtes jaunes sur le brut-corps — EdgesGeometry
          // (seuil 1°) traçait TOUTES les lignes de tessellation d'un STEP importé
          // (surfaces courbes finement maillées) : « lignes jaunes qui polluent le
          // résultat ». Le fantôme transparent suffit à situer le brut.
          return g;
        }
      }
    }catch(e){}
  }
  try{ // 2026-10-16-018 : brut cylindrique
    const cy=faoStockCylMesh(s,0xffd60a,.12);
    if(cy){ g.add(cy); return g; }
  }catch(e){}
  try{
    const bg=new THREE.BoxGeometry(s.x1-s.x0, s.y1-s.y0, s.z1-s.z0);
    const mat=function(){ return new THREE.MeshBasicMaterial({color:0xffd60a,transparent:true,opacity:.12,depthWrite:false}); };
    const box=new THREE.Mesh(bg,mat());
    box.raycast=function(){};
    box.position.x=(s.x0+s.x1)/2; box.position.y=(s.y0+s.y1)/2; box.position.z=(s.z0+s.z1)/2;
    g.add(box);
    try{
      const e=new THREE.LineSegments(new THREE.EdgesGeometry(bg),new THREE.LineBasicMaterial({color:0xffd60a}));
      e.position.x=box.position.x; e.position.y=box.position.y; e.position.z=box.position.z;
      g.add(e);
    }catch(e2){}
  }catch(e){}
  return g;
}
function faoViewerLineCreate(vw){
  // Polyline continue, couleur par vertex façon Fusion 360 (2026-10-13-007) :
  // bleu = coupe, orange = rapide, vert = plongée (G1 vertical descendant —
  // 2026-10-08-004) ou entrée étiquetée ent (hélice, rampe, arc circ,
  // descente d'entrée — 005).
  const pos=[], col=[];
  vw.pts.forEach(function(p,i){
    pos.push(p.x,p.y,p.z);
    const q=(i>0)?vw.pts[i-1]:null;
    const plg=p.ent|| (q&&!p.r&&!q.r&&Math.abs(p.x-q.x)<1e-9&&Math.abs(p.y-q.y)<1e-9&&p.z<q.z-1e-9);
    const c=(i>0&&p.r)?0xff9f0a:(plg?0x30d158:0x2f80ff);
    col.push(((c>>16)&255)/255, ((c>>8)&255)/255, (c&255)/255);
  });
  try{
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pos),3));
    g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(col),3));
    const l=new THREE.Line(g,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.95}));
    l.name='faoViewerLine'; l.raycast=function(){};
    return l;
  }catch(e){ return null; }
}
/* ---- matière usinée (surface Z-map) : elle disparaît sous l'outil ----
   Logique pure (grille + carve) : testable sans scène ; THREE reste derrière
   des try/catch. Grille ≈ 40k voxels max sur la bbox du brut. */
function faoMatterGrid(s,pas,fineZ){
  if(!s||!(s.x1>s.x0)||!(s.y1>s.y0)||!(s.z1>s.z0))return null;
  let p=+pas;
  let nx=0,ny=0,nz=0,n=0,it=0,pz=0;
  if(p>0){
    // pas fourni = strict (tests) : isotrope historique, plafond 200k voxels.
    do{
      p=(it===0)?+pas:p;
      nx=Math.max(1,Math.ceil((s.x1-s.x0)/p));
      ny=Math.max(1,Math.ceil((s.y1-s.y0)/p));
      nz=Math.max(1,Math.ceil((s.z1-s.z0)/p));
      n=nx*ny*nz; it++;
      if(n>200000)p*=1.6;
    }while(n>200000&&it<6);
    pz=p;
  }else{
    // DEFaut (rendu) : grille ANISOTROPE (retour 4/10) — maille XY fine pour
    // l'emprise visuelle (colonnes jointives), couches Z grossieres : le rendu
    // lit la Z-map continue h[], seule la maille XY compte a l'ecran. Budget et
    // plancher XY viennent de faoDetailCfg[faoViewerDetail] (2026-10-11-003/004) :
    // 200000 colonnes / 0,4 mm au niveau normal (arrondi R2 ≈ 5 pts sur l'arc),
    // 32 couches Z max (n <= 13M au niveau haut, budget 400000).
    const X=s.x1-s.x0, Y=s.y1-s.y0, H=s.z1-s.z0;
    const cfg=faoDetailCfg[faoViewerDetail]||faoDetailCfg[1];
    // V0.7.7 : rendu GPU (src/88-fao-76) → maille XY deux fois plus fine, budget × 4
    const fine=(typeof faoMatterFine==='function')&&faoMatterFine();
    const B=cfg.B*(fine?4:1), F=cfg.F*(fine?0.5:1);
    p=Math.max(F,Math.sqrt((X*Y)/B));
    nx=Math.max(1,Math.ceil(X/p)); ny=Math.max(1,Math.ceil(Y/p));
    it=0;
    while(nx*ny>B&&it++<8){ p*=1.1; nx=Math.max(1,Math.ceil(X/p)); ny=Math.max(1,Math.ceil(Y/p)); }
    nz=Math.max(1,Math.min(32,Math.ceil(H/Math.max(p,1e-6))));
    // V0.7.6 : posage 3+2 — les cavités latérales se dessinent voxel par voxel : couches aussi
    // fines que la maille XY (32 couches = marches de ~1 mm sur les parois des trous de la tranche)
    if(fineZ)nz=Math.max(nz,Math.min(Math.ceil(H/Math.max(p,1e-6)),Math.floor(4e7/Math.max(1,nx*ny))));
    n=nx*ny*nz;
    pz=H/nz;
  }
  const alive=new Uint8Array(n);
  for(let i=0;i<n;i++)alive[i]=1;
  // Z-map : une hauteur continue PAR COLONNE (= cote de coupe exacte, non quantifiée
  // au voxel) — mise à jour par CarveSeg, lue par colTop pour le rendu.
  const nc=nx*ny;
  const h=new Float32Array(nc);
  // V0.7.7 : éclairage depuis l'OUTIL — normale de la surface taillée par colonne (dessus) et
  // direction radiale du dernier passage (parois), écrites par faoMatterCarveSeg / CarveTilt
  const nrm=new Float32Array(nc*4);for(let i=0;i<nc;i++)nrm[i*4+2]=1; // xyz + a = colonne creusée (3+2)
  const wn=new Float32Array(nc*2);
  // Extents RÉELS du brut (nx*pas peut dépasser x1 d'ici, d'un seul côté — le
  // rendu et la hauteur init sont calés sur x1/y1/z1 exacts, jamais sur la grille).
  const sx1=+s.x1, sy1=+s.y1, sz1=+s.z1;
  const full=sz1;
  for(let i=0;i<nc;i++)h[i]=full;
  // 2026-10-16-018 : brut CYLINDRIQUE — colonnes hors du disque (axe Z) vides ; axe X/Y : dessus
  // de colonne = génératrice du cylindre (la Z-map ne décrit que le dessus).
  try{
    const C=s.cyl;
    if(C&&C.r>0&&Array.isArray(C.c)){
      for(let iy=0;iy<ny;iy++)for(let ix=0;ix<nx;ix++){
        const x=+s.x0+(ix+0.5)*p, y=+s.y0+(iy+0.5)*p, k=iy*nx+ix;
        let top=full;
        if(C.axis==='z'){ if(Math.hypot(x-C.c[0],y-C.c[1])>C.r)top=+s.z0; }
        else{ const d=C.axis==='x'?(y-C.c[1]):(x-C.c[0]); top=Math.abs(d)>C.r?+s.z0:C.c[2]+Math.sqrt(C.r*C.r-d*d); }
        if(top<full){
          h[k]=top;
          const pzz=pz||p;for(let iz=0;iz<nz;iz++){ if(+s.z0+(iz+0.5)*pzz>top)alive[(iz*ny+iy)*nx+ix]=0; }
        }
      }
    }
  }catch(e){}
  // 2026-10-21-010 : brut = CORPS — la matière de départ est le dessus réel du
  // corps-brut (carte des hauteurs), plus la boîte pleine
  try{
    const T=(s&&s.solid!=null&&typeof faoStockTop==='function')?faoStockTop(faoSetup(),Math.max(0.5,p*0.5)):null;
    if(T){
      const pzz=pz||p;
      for(let iy=0;iy<ny;iy++)for(let ix=0;ix<nx;ix++){
        const x=+s.x0+(ix+0.5)*p,y=+s.y0+(iy+0.5)*p,k=iy*nx+ix;
        let top=T.at(x,y);if(!(top>-1/0))top=+s.z0;
        top=Math.min(top,full);
        if(top<full){h[k]=top;for(let iz=0;iz<nz;iz++){if(+s.z0+(iz+0.5)*pzz>top)alive[(iz*ny+iy)*nx+ix]=0;}}
      }
    }
  }catch(e){}
  return {pas:p,pz:pz,nx:nx,ny:ny,nz:nz,n:n,ox:s.x0,oy:s.y0,oz:s.z0,alive:alive,h:h,nrm:nrm,wn:wn,
          sx1:sx1,sy1:sy1,sz1:sz1,full:full};
}
function faoMatterIdx(g,ix,iy,iz){ return (iz*g.ny+iy)*g.nx+ix; }
function faoMatterNrmSet(g,c,dx,dy,d2,rc,CR,TP){
  // V0.7.7 : normale de la surface de l'OUTIL au point taillé (vers le vide) — fond plat, arrondi
  // d'arête (tore), cône de pointe — et direction radiale vers l'axe (parois des colonnes voisines)
  const rho=Math.sqrt(d2);let ux=0,uy=0;if(rho>1e-9){ux=dx/rho;uy=dy/rho;}
  let nx=0,ny=0,nz=1;
  if(TP){const e=1e-3,s=(faoTipZAt(TP,rho+e)-faoTipZAt(TP,Math.max(0,rho-e)))/(2*e);nx=-s*ux;ny=-s*uy;}
  else if(CR>0&&rho>rc){const e=Math.min(rho-rc,CR);nx=-e*ux/CR;ny=-e*uy/CR;nz=Math.sqrt(Math.max(0,CR*CR-e*e))/CR;}
  const L=Math.hypot(nx,ny,nz)||1,o=c*4;g.nrm[o]=nx/L;g.nrm[o+1]=ny/L;g.nrm[o+2]=nz/L;
  if(rho>1e-9){g.wn[c*2]=-ux;g.wn[c*2+1]=-uy;}
}
function faoMatterCarveSeg(g,ax,ay,az,bx,by,bz,r,outCols,cr,tp){
  // Enlève les voxels dont le CENTRE est à distance ≤ r du segment XY (2D)
  // et z ≥ cote de coupe − pas/2 : la matière SOUS la pointe reste. Retourne les indices tués.
  // Z-map : la hauteur de colonne descend à la cote de coupe — 2026-10-11-002 :
  // `cr` = rayon d'arête de l'outil (fraise torique) → l'ARRONDI R2 apparaît au bas
  // des parois : colonne à ρ de distance coupe à zc + cr − √(cr²−(ρ−(r−cr))²) au lieu
  // de zc seul (scallop réel sous l'arête). cr = 0 (défaut) = cylindre historique.
  // outCols (optionnel) : reçoit les colonnes TOUCHÉES en XY, tuées ou non — le mesh
  // doit être réécrit pour elles même quand aucun voxel ne meurt (cote entre deux
  // centres : c'était le gel « la passe suivante n'enlève rien à l'écran »).
  // 2026-10-11-004 : EARLY-OUT — colonne d'j retaillée (g.hc) à une cote ≤ z2 :
  // zcol ≥ z2 toujours (l'arc relève), h ne peut donc pas descendre et les kills
  // sont un no-op (voxels déjà morts) : on saute la colonne. Bit-identique (hashes
  // h/alive + arêtes vérifiés aux 3 budgets), rattrapage ×14 plus rapide, colonnes
  // poussées 65 M → 4 M (l'Array du rattrapage explosait au plafond V8 2^27 et
  // picait à 520 Mo). tc passe en tampon d'horodatage g.tcs (1 Uint32/colonne,
  // +1 par segment) au lieu d'une allocation Uint8Array(nc) par segment.
  const out=[];
  if(!g||!(r>0))return out;
  const nc=g.nx*g.ny;
  if(!g.hc){ g.hc=new Uint8Array(nc); if(g.h){ for(let i=0;i<nc;i++)g.hc[i]=(g.h[i]<g.full)?1:0; } }
  if(!g.tcs||g.tsg>4200000000){ g.tcs=new Uint32Array(nc); g.tsg=0; }
  const zc=Math.min(az,bz);
  const CR=(isFinite(+cr)&&+cr>0)?Math.min(+cr,+r):0;
  const rc=+r-CR; // rayon du fond plat de l'outil
  // 2026-10-22-001 : tp = pointe de foret (faoToolTipProfile) — la Z-map dessine le
  // cône (et le pilote + 60° d'un foret à centrer) au lieu d'un fond plat.
  const TP=(tp&&tp.length>1&&g.h)?tp:null;
  const shaped=(CR>0||TP)&&g.h;
  const pzv=g.pz||g.pas;
  const zmin=zc-pzv/2;
  const x0=Math.min(ax,bx)-r, x1=Math.max(ax,bx)+r;
  const y0=Math.min(ay,by)-r, y1=Math.max(ay,by)+r;
  if(x1<g.ox||x0>g.ox+g.nx*g.pas||y1<g.oy||y0>g.oy+g.ny*g.pas)return out;
  const i0=Math.max(0,Math.floor((x0-g.ox)/g.pas)), i1=Math.min(g.nx-1,Math.floor((x1-g.ox)/g.pas));
  const j0=Math.max(0,Math.floor((y0-g.oy)/g.pas)), j1=Math.min(g.ny-1,Math.floor((y1-g.oy)/g.pas));
  const k0=Math.max(0,Math.floor((zmin-g.oz)/pzv)), k1=g.nz-1;
  const dx=bx-ax, dy=by-ay, L2=dx*dx+dy*dy, r2=r*r;
  const useTc=(g.h||outCols);
  const tsg=useTc?(++g.tsg):0, tcBuf=useTc?g.tcs:null;
  const z2=g.h?(zc>g.oz?zc:g.oz):0;
  const hc=g.hc;
  // Test XY UNE fois par colonne (le segment balaye toute la hauteur de la colonne).
  for(let j=j0;j<=j1;j++){
    const py=g.oy+(j+0.5)*g.pas;
    for(let i=i0;i<=i1;i++){
      const c=j*g.nx+i;
      // EARLY-OUT : déjà retaillée à cette cote (ou plus basse) — aucune descente
      // de h possible (zcol >= z2), kills = no-op (voxels déjà morts).
      if(g.h&&hc[c]&&g.h[c]<=z2)continue;
      const px=g.ox+(i+0.5)*g.pas;
      let t=L2>0?((px-ax)*dx+(py-ay)*dy)/L2:0;
      t=t<0?0:(t>1?1:t);
      const qx=ax+dx*t, qy=ay+dy*t;
      const d2=(px-qx)*(px-qx)+(py-qy)*(py-qy);
      if(d2>r2)continue;
      // Cote de coupe de CETTE colonne : plate sous le fond de l'outil, arc sous
      // l'arête (CR>0) — la Z-map dessine alors l'arrondi réel du bas de paroi.
      let zcol=z2;
      if(TP){
        zcol=Math.max(g.oz, zc+faoTipZAt(TP,Math.sqrt(d2)));
      }else if(CR>0&&g.h){
        const rho=Math.sqrt(d2);
        if(rho>rc){ const e=rho-rc; zcol=Math.max(g.oz, zc+CR-Math.sqrt(Math.max(0,CR*CR-e*e))); }
      }
      // Colonne touchée en XY : la Z-map descend à la cote de coupe MÊME si aucun
      // voxel vivant n'est tué (cote entre deux centres de voxels, ou colonne déjà
      // vidée par la passe précédente) — c'était le gel « certaines passes
      // n'enlèvent rien » (alternance OK/KO au fil des passes).
      if(tcBuf){ if(tcBuf[c]!==tsg){ tcBuf[c]=tsg;
        if(g.h&&zcol<g.h[c]){ g.h[c]=zcol; hc[c]=1; if(g.nrm)faoMatterNrmSet(g,c,px-qx,py-qy,d2,rc,CR,TP); }
        // même cote (passe voisine qui recouvre) : la normale la plus PLATE gagne — sinon l'arrondi
        // de la passe précédente laissait une bande de normales inclinées sous un dessus plat
        else if(g.h&&g.nrm&&zcol<=g.h[c]+1e-6){ const nz0=g.nrm[c*4+2]; if(nz0<0.9999){ const keep=[g.nrm[c*4],g.nrm[c*4+1],nz0]; faoMatterNrmSet(g,c,px-qx,py-qy,d2,rc,CR,TP); if(g.nrm[c*4+2]<nz0){ g.nrm[c*4]=keep[0]; g.nrm[c*4+1]=keep[1]; g.nrm[c*4+2]=keep[2]; } } }
        if(outCols)outCols.push(c); } }
      const zminC=shaped?zcol-pzv/2:zmin;
      const ks0=shaped?Math.max(k0,Math.floor((zminC-g.oz)/pzv)):k0;
      for(let k=ks0;k<=k1;k++){
        const zcell=g.oz+(k+0.5)*pzv;
        if(zcell<zminC)continue;
        const idx=faoMatterIdx(g,i,j,k);
        if(!g.alive[idx])continue;
        g.alive[idx]=0; out.push(idx);
      }
    }
  }
  return out;
}
function faoMatterCarveTo(g,pts,dd,times,t,outCols,crs,tps){
  // Rattrapage 0 → t : segments complets + segment en cours interpolé (points d'arrivée en coupe).
  // crs (optionnel) : rayon d'arête par point (vd. faoMatterCarveSeg) — rendu « forme réelle ».
  const out=[];
  if(!g||!pts||pts.length<2||!(t>0))return out; // t<=0 : rien n'a été joué, rien à rattraper
  for(let i=0;i<pts.length-1;i++){
    if(times[i]>t)break;
    if(pts[i+1].r)continue;
    let a=pts[i], b=pts[i+1];
    if(times[i+1]>t){
      const t0=times[i], t1=times[i+1];
      const f=(t1>t0)?Math.max(0,Math.min(1,(t-t0)/(t1-t0))):0;
      b={x:a.x+(b.x-a.x)*f, y:a.y+(b.y-a.y)*f, z:a.z+(b.z-a.z)*f};
    }
    const r=((isFinite(dd[i+1])&&dd[i+1]>0)?dd[i+1]:10)/2;
    const crv=(crs&&isFinite(+crs[i+1]))?+crs[i+1]:0;
    const k=pts[i+1].ax?(g.maps?faoMatterCarveAx(g,a,b,r,pts[i+1].ax,outCols,crv,tps&&tps[i+1]):faoMatterCarveTilt(g,a,b,r,pts[i+1].ax,outCols,tps&&tps[i+1])):faoMatterCarveSeg(g,a.x,a.y,a.z,b.x,b.y,b.z,r,outCols,crv,tps&&tps[i+1]);
    for(let m=0;m<k.length;m++)out.push(k[m]);
  }
  return out;
}
function faoViewerMatterHideBodies(vw){
  // Corps 3D masqués pendant la matière (refs locales, doc.bodyVis jamais touché).
  // Ne JAMAIS réinitialiser le tableau : après un rebuild (Stop), les corps sont
  // déjà masqués — leurs refs doivent survivre pour être restaurables au close.
  if(!vw.hideBodies)vw.hideBodies=[];
  try{
    const bs=(typeof bodies!=='undefined'&&bodies)?bodies:[];
    bs.forEach(function(b){
      if(b&&b.mesh&&b.mesh.visible!==false&&vw.hideBodies.indexOf(b)<0){ b.mesh.visible=false; vw.hideBodies.push(b); }
    });
  }catch(e){}
}
function faoViewerMatterShowBodies(vw){
  // Restaure en respectant doc.bodyVis (le corps-brut v009 doit rester masqué).
  try{
    (vw.hideBodies||[]).forEach(function(b){
      if(b&&b.mesh)b.mesh.visible=!(doc&&doc.bodyVis&&doc.bodyVis[b.id]===false)&&(b.visible!==false);
    });
  }catch(e){}
  vw.hideBodies=[];
}
function faoViewerPieceBodyApply(){
  // Case « corps pièce » (2026-10-11-003) : cochée → tous les corps 3D masqués
  // (le brut — boîte/fantôme — et la matière restent gérés par leurs propres
  // toggles). La case passe par la LISTE hideBodies : un corps masqué par la case
  // est donc restauré normalement au close / à la décochette (aucun corps ne
  // peut rester masqué « hors liste »).
  const vw=faoVw; if(!vw)return;
  try{
    if(faoVwHideBody){
      faoViewerMatterHideBodies(vw); // masque + mémorise pour le close
    }else{
      faoViewerMatterShowBodies(vw); // restaure (dont ceux masqués par la case)
      if(vw.matterOn!==false)faoViewerMatterHideBodies(vw); // matière ON : invariant
    }
  }catch(e){}
  try{ refreshMirror(); }catch(e){} // V0.7.5 : corps masqués pendant la lecture : le sol suit
}
function faoViewerHoldApply(){
  // Case « corps outil » (mandrin gris) : cachée pendant la lecture, l'outil
  // (fraisier) reste seul visible.
  try{ if(faoVw&&faoVw.toolHold)faoVw.toolHold.visible=!faoVwHideHold; }catch(e){}
}
function faoViewerMatterDispose(vw,keepGrid){
  // keepGrid (V0.7.7) : bascule réel ↔ lisse — la grille taillée, sa position de lecture et ses
  // colonnes creusées restent ; seuls les maillages sont refaits (plus de retaille 0 → t).
  try{ faoViewerVoxDispose(vw,keepGrid); }catch(e){} // cavités 3+2 (src/88-fao-75)
  try{ faoMatterGpuDispose(vw); }catch(e){} // rendu GPU (src/88-fao-76)
  try{ faoMatterRmDispose(vw); }catch(e){} // lancer de rayons (src/88-fao-77)
  try{ if(vw.matter&&typeof scene!=='undefined'&&scene)faoDel3D(vw.matter); }catch(e){}
  try{ if(vw.matter&&vw.matter.geometry&&vw.matter.geometry.dispose)vw.matter.geometry.dispose(); }catch(e){}
  vw.matter=null; vw.mKills=[]; vw.mTops=null; vw.mArr=null; vw.mNrm=null; vw.mH=null;
  if(!keepGrid){ vw.matterGrid=null; vw.mPos=null; }
}
function faoMatterColTop(g,c){
  // Hauteur de surface de la colonne c (= iy*nx+ix) : Z-map continue (cote exacte),
  // repli sur le scan alive[] si la grille n'a pas de h.
  if(g.h)return g.h[c];
  const L=g.nx*g.ny;
  for(let k=g.nz-1;k>=0;k--){ if(g.alive[k*L+c])return g.oz+(k+1)*(g.pz||g.pas); }
  return g.oz;
}
function faoMatterPut(a,o,x,y,z){ a[o]=x; a[o+1]=y; a[o+2]=z; return o+3; }
function faoMatterMark(rw,list,c){ if(c<0||c>=rw.length||rw[c])return; rw[c]=1; list.push(c); }
function faoMatterPutN(a,n,o,x,y,z,v){ a[o]=x; a[o+1]=y; a[o+2]=z; if(n){ n[o]=v[0]; n[o+1]=v[1]; n[o+2]=v[2]; } return o+3; }
function faoViewerMatterWriteCol(vw,c){
  // 30 verts (top 2 tri + 4 côtés) de la colonne c écrits dans vw.mArr (diff seul).
  // V0.7.7 : normales explicites (vw.mNrm) — dessus : normale de l'outil (g.nrm) ; paroi vers une
  // voisine plus basse : direction radiale du passage qui a taillé cette voisine (g.wn), sinon la
  // face ; bords du brut : la face. Les parois rondes s'éclairent en continu (plus de stries).
  const g=vw.matterGrid, a=vw.mArr, N=vw.mNrm, T=vw.mTops;
  if(!g||!a||!T)return;
  const nx=g.nx, ny=g.ny, pas=g.pas, ox=g.ox, oy=g.oy, oz=g.oz;
  const sx1=(g.sx1!=null)?g.sx1:ox+nx*pas, sy1=(g.sy1!=null)?g.sy1:oy+ny*pas;
  const ix=c%nx, iy=(c/nx)|0;
  const x0=ox+ix*pas, x1=Math.min(x0+pas,sx1), y0=oy+iy*pas, y1=Math.min(y0+pas,sy1);
  if(!(x1>x0)||!(y1>y0))return; // colonne au-delà des extents réels (ne rien écrire)
  const zt=T[c];
  // côté replié (z2=zt → quad nul) si le voisin est plus haut : jamais deux faces coplanaires
  // colonne creusée (posage 3+2) : flancs repliés, dessinés voxel par voxel (src/88-fao-75)
  const cv=!!(vw.cav&&vw.cav[c]);
  const zN=(iy>0?T[c-nx]:oz); const n2=cv?zt:(zN<zt?zN:zt);
  const zS=(iy<ny-1?T[c+nx]:oz); const s2=cv?zt:(zS<zt?zS:zt);
  const zW=(ix>0?T[c-1]:oz); const w2=cv?zt:(zW<zt?zW:zt);
  const zE=(ix<nx-1?T[c+1]:oz); const e2=cv?zt:(zE<zt?zE:zt);
  const nr=g.nrm, wn=g.wn;
  const tn=nr?[nr[c*4],nr[c*4+1],nr[c*4+2]]:[0,0,1];
  const wall=function(nb,fx,fy){
    if(nb>=0&&wn){ const wx=wn[nb*2], wy=wn[nb*2+1]; if(wx*wx+wy*wy>0.5&&wx*fx+wy*fy>0.2)return [wx,wy,0]; }
    return [fx,fy,0];
  };
  const vN=wall(iy>0?c-nx:-1,0,-1), vS=wall(iy<ny-1?c+nx:-1,0,1), vW=wall(ix>0?c-1:-1,-1,0), vE=wall(ix<nx-1?c+1:-1,1,0);
  let o=c*90;
  // top
  o=faoMatterPutN(a,N,o,x0,y0,zt,tn); o=faoMatterPutN(a,N,o,x1,y0,zt,tn); o=faoMatterPutN(a,N,o,x1,y1,zt,tn);
  o=faoMatterPutN(a,N,o,x0,y0,zt,tn); o=faoMatterPutN(a,N,o,x1,y1,zt,tn); o=faoMatterPutN(a,N,o,x0,y1,zt,tn);
  // faces tournées vers l'extérieur (sens direct vu depuis leur normale) : avec des normales
  // explicites, une face arrière verrait sa normale retournée (DoubleSide) et s'assombrirait
  // côté -Y
  o=faoMatterPutN(a,N,o,x0,y0,n2,vN); o=faoMatterPutN(a,N,o,x1,y0,n2,vN); o=faoMatterPutN(a,N,o,x1,y0,zt,vN);
  o=faoMatterPutN(a,N,o,x0,y0,n2,vN); o=faoMatterPutN(a,N,o,x1,y0,zt,vN); o=faoMatterPutN(a,N,o,x0,y0,zt,vN);
  // côté +Y
  o=faoMatterPutN(a,N,o,x1,y1,s2,vS); o=faoMatterPutN(a,N,o,x0,y1,s2,vS); o=faoMatterPutN(a,N,o,x0,y1,zt,vS);
  o=faoMatterPutN(a,N,o,x1,y1,s2,vS); o=faoMatterPutN(a,N,o,x0,y1,zt,vS); o=faoMatterPutN(a,N,o,x1,y1,zt,vS);
  // côté -X
  o=faoMatterPutN(a,N,o,x0,y1,w2,vW); o=faoMatterPutN(a,N,o,x0,y0,w2,vW); o=faoMatterPutN(a,N,o,x0,y0,zt,vW);
  o=faoMatterPutN(a,N,o,x0,y1,w2,vW); o=faoMatterPutN(a,N,o,x0,y0,zt,vW); o=faoMatterPutN(a,N,o,x0,y1,zt,vW);
  // côté +X
  o=faoMatterPutN(a,N,o,x1,y0,e2,vE); o=faoMatterPutN(a,N,o,x1,y1,e2,vE); o=faoMatterPutN(a,N,o,x1,y1,zt,vE);
  o=faoMatterPutN(a,N,o,x1,y0,e2,vE); o=faoMatterPutN(a,N,o,x1,y1,zt,vE); o=faoMatterPutN(a,N,o,x1,y0,zt,vE);
}
function faoViewerMatterWriteAll(vw){
  const g=vw.matterGrid; if(!g||!vw.mArr||!vw.mTops)return;
  const nc=g.nx*g.ny;
  for(let c=0;c<nc;c++)faoViewerMatterWriteCol(vw,c);
  // fond plein du brut (6 verts, statique) — clampé aux extents réels du brut
  const a=vw.mArr, oz=g.oz, N=vw.mNrm;
  if(N){ for(let q=nc*90;q<nc*90+18;q+=3){ N[q]=0; N[q+1]=0; N[q+2]=-1; } }
  const X0=g.ox, X1=(g.sx1!=null)?g.sx1:g.ox+g.nx*g.pas, Y0=g.oy, Y1=(g.sy1!=null)?g.sy1:g.oy+g.ny*g.pas;
  let o=nc*90;
  o=faoMatterPut(a,o,X0,Y0,oz); o=faoMatterPut(a,o,X1,Y1,oz); o=faoMatterPut(a,o,X1,Y0,oz); // vu de dessous : sens direct
  o=faoMatterPut(a,o,X0,Y0,oz); o=faoMatterPut(a,o,X0,Y1,oz); o=faoMatterPut(a,o,X1,Y1,oz);
}
/* ---- surface : « nette » (défaut) OU « lisse » (3e version du bouton) ----
   2026-10-11-003 avait SUPPRIMÉ le heightfield de 002 (nœud = moyenne des 4
   cellules adjacentes) : ce lissage floutait les traces de l'outil d'une maille
   (arêtes R2, marches d'escalier, limite coupe/non-coupe). 2026-10-11-007 le
   RÉINTRODUIT en OPTION choisie (bouton ≈ lisse) — le défaut « net » de 003 est
   inchangé : la colonne à SA cote exacte via faoViewerMatterWriteCol. */
function faoHFAddTri(pos,acc,a,b,c){
  const ax=pos[a*3],ay=pos[a*3+1],az=pos[a*3+2];
  const bx=pos[b*3],by=pos[b*3+1],bz=pos[b*3+2];
  const cx=pos[c*3],cy=pos[c*3+1],cz=pos[c*3+2];
  const ux=bx-ax,uy=by-ay,uz=bz-az, vx=cx-ax,vy=cy-ay,vz=cz-az;
  const nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
  acc[a*3]+=nx;acc[a*3+1]+=ny;acc[a*3+2]+=nz;
  acc[b*3]+=nx;acc[b*3+1]+=ny;acc[b*3+2]+=nz;
  acc[c*3]+=nx;acc[c*3+1]+=ny;acc[c*3+2]+=nz;
}
function faoViewerMatterHFBuild(vw){
  // (Re)construit la surface continue pleine du brut : nœuds à la cote du brut,
  // murs de bord jusqu'au fond, fond plein — retourne le mesh (ou null).
  const g=vw.matterGrid; if(!g||!vw.mTops)return null;
  try{
    const nx=g.nx, ny=g.ny, NX=nx+1, NY=ny+1, NV=NX*NY, nc=nx*ny;
    const sx1=(g.sx1!=null)?g.sx1:g.ox+nx*g.pas, sy1=(g.sy1!=null)?g.sy1:g.oy+ny*g.pas;
    const oz=g.oz;
    const full=(g.full!=null)?g.full:(g.sz1!=null?g.sz1:oz+g.nz*(g.pz||g.pas));
    const E=2*nx+2*ny;               // quads de mur (dessous + dessus + gauche + droite)
    const NVW=NV+4*E+4;              // nœuds + murs (4 verts/quad) + fond
    const pos=new Float32Array(NVW*3), nrm=new Float32Array(NVW*3);
    const n2top=new Int32Array(NV*2).fill(-1);
    const idx=new Uint32Array(nc*6+E*6+6);
    const nodeX=function(ni){ return Math.min(g.ox+ni*g.pas, sx1); };
    const nodeY=function(nj){ return Math.min(g.oy+nj*g.pas, sy1); };
    for(let nj=0;nj<NY;nj++)for(let ni=0;ni<NX;ni++){
      const n=nj*NX+ni;
      pos[n*3]=nodeX(ni); pos[n*3+1]=nodeY(nj); pos[n*3+2]=full;
      nrm[n*3]=0; nrm[n*3+1]=0; nrm[n*3+2]=1;
    }
    let io=0;
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
      const a=j*NX+i, b=a+1, cN=a+NX, dN=a+NX+1;
      idx[io++]=a; idx[io++]=b; idx[io++]=dN;
      idx[io++]=a; idx[io++]=dN; idx[io++]=cN;
    }
    let e=0;
    const wall=function(nA,nB,ex,ey){
      const wv=NV+e*4;
      const ax=pos[nA*3],ay=pos[nA*3+1],bx=pos[nB*3],by=pos[nB*3+1];
      pos[wv*3]=ax;   pos[wv*3+1]=ay;   pos[wv*3+2]=full;
      pos[(wv+1)*3]=bx;pos[(wv+1)*3+1]=by;pos[(wv+1)*3+2]=full;
      pos[(wv+2)*3]=bx;pos[(wv+2)*3+1]=by;pos[(wv+2)*3+2]=oz;
      pos[(wv+3)*3]=ax;pos[(wv+3)*3+1]=ay;pos[(wv+3)*3+2]=oz;
      for(let s=0;s<4;s++){ nrm[(wv+s)*3]=ex; nrm[(wv+s)*3+1]=ey; nrm[(wv+s)*3+2]=0; }
      idx[io++]=wv; idx[io++]=wv+1; idx[io++]=wv+2;
      idx[io++]=wv; idx[io++]=wv+2; idx[io++]=wv+3;
      if(n2top[nA*2]<0)n2top[nA*2]=wv; else n2top[nA*2+1]=wv;
      if(n2top[nB*2]<0)n2top[nB*2]=wv+1; else n2top[nB*2+1]=wv+1;
      e++;
    };
    for(let ni=0;ni<nx;ni++)wall(ni,ni+1,0,-1);                       // bord −Y
    for(let ni=0;ni<nx;ni++){ const base=ny*NX+ni; wall(base,base+1,0,1); } // bord +Y
    for(let nj=0;nj<ny;nj++)wall(nj*NX,(nj+1)*NX,-1,0);               // bord −X
    for(let nj=0;nj<ny;nj++)wall(nj*NX+nx,(nj+1)*NX+nx,1,0);          // bord +X
    const b0=NV+4*E, b1=b0+1, b2=b0+2, b3=b0+3;
    pos[b0*3]=g.ox;pos[b0*3+1]=g.oy;pos[b0*3+2]=oz;
    pos[b1*3]=sx1;pos[b1*3+1]=g.oy;pos[b1*3+2]=oz;
    pos[b2*3]=sx1;pos[b2*3+1]=sy1;pos[b2*3+2]=oz;
    pos[b3*3]=g.ox;pos[b3*3+1]=sy1;pos[b3*3+2]=oz;
    for(let s=0;s<4;s++){ nrm[(b0+s)*3]=0; nrm[(b0+s)*3+1]=0; nrm[(b0+s)*3+2]=-1; }
    idx[io++]=b0; idx[io++]=b1; idx[io++]=b2;
    idx[io++]=b0; idx[io++]=b2; idx[io++]=b3;
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    geo.setAttribute('normal',new THREE.BufferAttribute(nrm,3));
    geo.setIndex(new THREE.BufferAttribute(idx,1));
    const mesh=new THREE.Mesh(geo,new THREE.MeshPhongMaterial({color:0x9c846a,side:THREE.DoubleSide}));
    mesh.name='faoMatter';
    mesh.raycast=function(){};
    mesh.frustumCulled=false;
    if(typeof scene!=='undefined'&&scene)faoAdd3D(mesh);
    vw.mH={NX:NX,NY:NY,NV:NV,E:E,pos:pos,nrm:nrm,n2top:n2top,geo:geo,idx:idx,mesh:mesh};
    return mesh;
  }catch(e){ return null; }
}
function faoViewerMatterHFUpdate(vw,chg){
  // Diff seul : la hauteur des NŒUDS des cellules changées (moyenne de leurs
  // 4 cellules adjacentes = lissage naturel de la Z-map), le dessus des murs
  // de bord concernés, puis les normales des cellules touchantes.
  const H=vw.mH, g=vw.matterGrid, T=vw.mTops;
  if(!H||!g||!T||!chg||!chg.length)return;
  const NX=H.NX, NV=H.NV, pos=H.pos, nrm=H.nrm, n2top=H.n2top;
  const nc=g.nx*g.ny;
  const zSeen=new Uint8Array(NV), zList=[];
  for(let m=0;m<chg.length;m++){
    const c=chg[m]; if(c<0||c>=nc)continue;
    const i=c%g.nx, j=(c/g.nx)|0;
    for(let dj=0;dj<2;dj++)for(let di=0;di<2;di++){
      const ni=(i+di>g.nx)?g.nx:(i+di), nj=(j+dj>g.ny)?g.ny:(j+dj);
      const n=nj*NX+ni;
      if(zSeen[n])continue;
      zSeen[n]=1; zList.push(n);
      let sum=0,cnt=0;
      for(let cj=Math.max(0,nj-1);cj<=Math.min(g.ny-1,nj);cj++)
        for(let ci=Math.max(0,ni-1);ci<=Math.min(g.nx-1,ni);ci++){ sum+=T[ci+cj*g.nx]; cnt++; }
      if(cnt)pos[n*3+2]=sum/cnt;
      for(let s=0;s<2;s++){ const w=n2top[n*2+s]; if(w>=0)pos[w*3+2]=pos[n*3+2]; }
    }
  }
  if(!zList.length)return;
  const cSeen=new Uint8Array(nc), cList=[];
  const nSeen=new Uint8Array(NV), nList=[];
  for(let m=0;m<zList.length;m++){
    const n=zList[m], ni=n%NX, nj=(n/NX)|0;
    for(let cj=Math.max(0,nj-1);cj<=Math.min(g.ny-1,nj);cj++)
      for(let ci=Math.max(0,ni-1);ci<=Math.min(g.nx-1,ni);ci++){
        const c=ci+cj*g.nx;
        if(!cSeen[c]){ cSeen[c]=1; cList.push(c); }
      }
  }
  const acc=new Float32Array(NV*3);
  const markN=function(n){ if(!nSeen[n]){ nSeen[n]=1; nList.push(n); } };
  for(let m=0;m<cList.length;m++){
    const c=cList[m], i=c%g.nx, j=(c/g.nx)|0;
    const a=j*NX+i, b=a+1, cN=a+NX, dN=a+NX+1;
    markN(a);markN(b);markN(cN);markN(dN);
    faoHFAddTri(pos,acc,a,b,dN);
    faoHFAddTri(pos,acc,a,dN,cN);
  }
  for(let m=0;m<nList.length;m++){
    const n=nList[m], o=n*3;
    const x=acc[o],y=acc[o+1],z=acc[o+2];
    const L=Math.sqrt(x*x+y*y+z*z);
    if(L>1e-12){ nrm[o]=x/L; nrm[o+1]=y/L; nrm[o+2]=z/L; }
    else { nrm[o]=0; nrm[o+1]=0; nrm[o+2]=1; }
  }
  try{
    const attr=H.geo&&H.geo.attributes;
    if(attr&&attr.position&&attr.normal){ attr.position.needsUpdate=true; attr.normal.needsUpdate=true; }
  }catch(e){}
}
function faoViewerMatterEnable(vw,keepGrid){
  // (Re)construit la surface Z-map pleine du brut + rattrapage 0 → t courant.
  // Retourne le nb de voxels suivis.
  // 2026-10-11-003 « surface nette » (défaut, modes réel ET simple) : la colonne
  // à SA cote exacte (30 verts, côtés repliés si voisin plus haut).
  // 2026-10-11-007 « ≈ lisse » (3e version du bouton, vw.smooth) : heightfield
  // continu — nœud = moyenne des 4 cellules adjacentes (flou d'une maille sur
  // les traces assumé, cf. 003), normales lissées, murs de bord + fond.
  keepGrid=!!(keepGrid&&vw&&vw.matterGrid);
  faoViewerMatterDispose(vw,keepGrid);
  if(!vw||vw.matterOn===false)return 0;
  const s=faoStock(); if(!faoStockValid(s))return 0;
  // V0.7.8 : orientations inclinées + WebGL2 → cartes par orientation et lancer de rayons (src/88-fao-77) ;
  // la grille du posage n'a alors pas besoin de couches fines (plus de voxels)
  const rm=faoViewerVoxWanted(vw)&&(typeof faoMatterRmSupported==='function')&&faoMatterRmSupported();
  const g=keepGrid?vw.matterGrid:faoMatterGrid(s,0,faoViewerVoxWanted(vw)&&!rm); if(!g)return 0; // 3+2 sans WebGL2 : couches fines (src/88-fao-75)
  if(rm&&!g.maps)faoMapsInit(g,faoMapsAxes(vw.pts));
  const nc=g.nx*g.ny;
  const smooth=!!vw.smooth; // « ≈ lisse » : heightfield continu au lieu des colonnes
  let mesh=null, arr=null;
  if(rm){
    try{ mesh=faoMatterRmBuild(vw,g,smooth); if(typeof scene!=='undefined'&&scene)faoAdd3D(mesh); }catch(e){ mesh=null; vw.rm=null; }
  }
  const gpu=!mesh&&!smooth&&(typeof faoMatterGpuSupported==='function')&&faoMatterGpuSupported();
  if(gpu){
    try{ mesh=faoMatterGpuBuild(vw,g); if(typeof scene!=='undefined'&&scene)faoAdd3D(mesh); }catch(e){ mesh=null; vw.gpu=null; }
  }
  if(!smooth&&!mesh&&!vw.rm){
    try{
      arr=new Float32Array((nc*30+6)*3);
      vw.mNrm=new Float32Array((nc*30+6)*3); // V0.7.7 : normales depuis l'outil
      const geo=new THREE.BufferGeometry();
      geo.setAttribute('position',new THREE.BufferAttribute(arr,3));
      geo.setAttribute('normal',new THREE.BufferAttribute(vw.mNrm,3));
      const mat=new THREE.MeshPhongMaterial({color:0x9c846a,side:THREE.DoubleSide});
      mesh=new THREE.Mesh(geo,mat);
      mesh.name='faoMatter';
      mesh.raycast=function(){};
      mesh.frustumCulled=false;
      if(typeof scene!=='undefined'&&scene)faoAdd3D(mesh);
    }catch(e){ return 0; }
  }
  const tops=new Float32Array(nc);
  const full=(g.full!=null)?g.full:(g.sz1!=null?g.sz1:g.oz+g.nz*(g.pz||g.pas));
  // 2026-10-21-011 : cote d'affichage = Z-map de départ (brut-corps, cylindre) —
  // initialisée à la boîte pleine, la simulation dessinait toujours un cube
  // (« toujours un cube à la place du brut corps ») ; colonnes vides : rien.
  for(let c=0;c<nc;c++)tops[c]=g.h?Math.min(full,g.h[c]):full;
  vw.matter=mesh; vw.matterGrid=g; vw.mTops=tops; vw.mArr=arr; vw.mKills=[]; vw.mPos=keepGrid?vw.mPos:null; vw.mH=null; // grille conservée : position de lecture gardée (sinon retaille 0 → t)
  if(smooth&&!vw.rm){
    const m2=faoViewerMatterHFBuild(vw);
    if(!m2){ faoViewerMatterDispose(vw); return 0; }
    vw.matter=m2; // le heightfield EST la matière (mêmes noms/dispose que mArr)
    // 2026-10-22-002 : nœuds à la Z-map de départ (brut-corps, cylindre) — le
    // heightfield partait de la boîte pleine (« le brut en Lisse est toujours
    // un rectangle »).
    const all=[];for(let c=0;c<nc;c++)if(tops[c]<full-1e-9)all.push(c);
    if(all.length)faoViewerMatterHFUpdate(vw,all);
    if(keepGrid)try{ faoViewerVoxFoldAll(vw); }catch(e){} // cavités 3+2 déjà creusées : cellules repliées (src/88-fao-75)
  }else if(!vw.gpu&&!vw.rm){
    try{ faoViewerMatterWriteAll(vw); }catch(e){ faoViewerMatterDispose(vw); try{ if(mesh&&scene)faoDel3D(mesh); }catch(e2){} return 0; }
  }
  // V0.7.6 : outil incliné (3+2) quelque part dans le parcours → cavités sous la surface dessinées
  if(!keepGrid){
    vw.vox=faoViewerVoxWanted(vw)&&!vw.rm; vw.voxAt=0; vw.voxDirty=false; // cartes par orientation : plus de voxels ni de complément
    vw.cav=vw.vox?new Uint8Array(nc):null; vw.cavN=0; // colonnes creusées (src/88-fao-75)
  }
  if(vw.t>0&&!keepGrid){
    const tcols=[];
    const ks=faoMatterCarveTo(g,vw.pts,vw.dd,vw.times,vw.t,tcols,vw.exact?vw.cr:null,vw.exact?vw.tp:null);
    faoViewerMatterKill(vw,ks,tcols);
  }
  if(vw.vox)faoViewerVoxRefresh(vw,true);
  faoViewerMatterHideBodies(vw); // la surface remplace les corps visibles
  return g.n;
}
function faoViewerMatterKill(vw,ks,cols){
  // Diff seul : recalcule la hauteur des colonnes TOUCHÉES (voxels tués + colonnes
  // dont la Z-map a baissé sans kill), réécrit leurs verts + ceux des 4 voisins.
  // 2026-10-11-003 « net » : unifié sur WriteCol — cote EXACTE de chaque colonne ;
  // 2026-10-11-007 « lisse » : branche HFUpdate (nœuds moyennés + normales).
  if(!vw||!vw.matter||!vw.matterGrid||!vw.mTops||(!vw.mArr&&!vw.mH&&!vw.gpu&&!vw.rm))return; // gpu / rm : textures
  if((!ks||!ks.length)&&(!cols||!cols.length)&&!(vw.rm&&faoMapsDirty(vw.matterGrid)))return;
  if(vw.vox)faoViewerVoxKill(vw,ks); // posage 3+2 : cavités sous la surface (src/88-fao-75)
  const g=vw.matterGrid, nc=g.nx*g.ny, T=vw.mTops;
  const seen=new Uint8Array(nc), chg=[];
  const mark=function(c){
    if(c<0||c>=nc||seen[c])return;
    seen[c]=1;
    const t=faoMatterColTop(g,c);
    if(t!==T[c]){ T[c]=t; chg.push(c); }
  };
  if(ks){
    for(let n=0;n<ks.length;n++){
      const idx=ks[n];
      if(idx<0||idx>=g.n)continue;
      mark(idx%nc);
    }
  }
  if(cols){
    for(let n=0;n<cols.length;n++)mark(cols[n]);
  }
  if(vw.rm){ faoMatterRmUpdate(vw,chg.length>0); return; } // lancer de rayons : textures des cartes renvoyées (src/88-fao-77)
  if(!chg.length)return;
  if(vw.mH){ // « ≈ lisse » : réécriture des NŒUDS (moyennes) + normales — diff seul
    try{ faoViewerMatterHFUpdate(vw,chg); }catch(e){}
    return;
  }
  if(vw.gpu){ faoMatterGpuUpdate(vw); return; } // rendu GPU : textures renvoyées (src/88-fao-76)
  const rw=new Uint8Array(nc), list=[];
  for(let m=0;m<chg.length;m++){
    const c=chg[m], ix=c%g.nx;
    faoMatterMark(rw,list,c);
    if(ix>0)faoMatterMark(rw,list,c-1);
    if(ix<g.nx-1)faoMatterMark(rw,list,c+1);
    if(c>=g.nx)faoMatterMark(rw,list,c-g.nx);
    if(c+g.nx<nc)faoMatterMark(rw,list,c+g.nx);
  }
  for(let m=0;m<list.length;m++)faoViewerMatterWriteCol(vw,list[m]);
  try{ vw.matter.geometry.attributes.position.needsUpdate=true; if(vw.matter.geometry.attributes.normal)vw.matter.geometry.attributes.normal.needsUpdate=true; }catch(e){}
}
function faoMatterCarveRange(g,pts,dd,times,t,i0,x0,y0,z0,p,outCols,crs,tps){
  // INCREMENTAL : taille uniquement depuis le DERNIER point joue (x0,y0,z0,
  // segment i0) jusqu'a la position p (index p.i). Rappatrier 0 -> t a chaque
  // frame coutait O(i) : a 80 000 points d'ebauche 3D, la lecture devenait
  // intenable — le surfaçage (30 points) passait inapercu.
  // crs (optionnel) : rayon d'arête par point (vd. faoMatterCarveSeg).
  const out=[];
  if(!g||!pts||pts.length<2)return out;
  let i=Math.max(0,Math.min(i0|0,pts.length-2));
  const lastRaw=(p&&isFinite(+p.i))?Math.round(+p.i):i;
  const last=Math.max(i,Math.min(lastRaw,pts.length-2));
  let a={x:+x0,y:+y0,z:+z0};
  for(;i<=last;i++){
    const dst=(i===last)?p:pts[i+1];
    if(!dst)break;
    if(dst.r){ a={x:dst.x,y:dst.y,z:dst.z}; continue; } // G0 : rien a tailler
    const b={x:+dst.x,y:+dst.y,z:+dst.z};
    const r=((isFinite(dd[i+1])&&dd[i+1]>0)?dd[i+1]:10)/2;
    const crv=(crs&&isFinite(+crs[i+1]))?+crs[i+1]:0;
    const axD=pts[i+1]&&pts[i+1].ax; // le point en cours (p, interpolé) ne porte pas l'axe : celui du segment
    const k=axD?(g.maps?faoMatterCarveAx(g,a,b,r,axD,outCols,crv,tps&&tps[i+1]):faoMatterCarveTilt(g,a,b,r,axD,outCols,tps&&tps[i+1])):faoMatterCarveSeg(g,a.x,a.y,a.z,b.x,b.y,b.z,r,outCols,crv,tps&&tps[i+1]);
    for(let m=0;m<k.length;m++)out.push(k[m]);
    a=b;
  }
  return out;
}
function faoViewerMatterStep(vw,p){
  // À chaque frame : enleve la matière du segment balayé (ou rattrapage si saut).
  // INCREMENTAL : on ne repart JAMAIS de 0 sauf au tout premier appel.
  if(!vw||vw.matterOn===false||!vw.matterGrid||!vw.matter)return;
  const g=vw.matterGrid;
  let ks=null;
  const cols=[];
  const mi=(vw.mPos&&isFinite(+vw.mPos.i))?Math.round(+vw.mPos.i):-1;
  const crs=vw.exact?vw.cr:null; // rayon d'arête (forme réelle) — null = cylindre
  const tps=vw.exact?vw.tp:null; // pointes de foret (forme réelle)
  if(mi>=0&&mi<=p.i){
    ks=faoMatterCarveRange(g,vw.pts,vw.dd,vw.times,vw.t,mi,
                           vw.mPos.x,vw.mPos.y,vw.mPos.z,p,cols,crs,tps);
  }else if(mi>p.i){
    ks=null; // retour arriere : la matiere enlevee n'est jamais restituee
  }else{
    ks=faoMatterCarveTo(g,vw.pts,vw.dd,vw.times,vw.t,cols,crs,tps);
  }
  vw.mPos={x:p.x,y:p.y,z:p.z,i:p.i};
  // Tués OU colonnes touchées : la Z-map descend aussi quand aucun voxel ne meurt,
  // le mesh doit suivre à chaque passe (sinon la matière ré-apparaît au pass suivant).
  if((ks&&ks.length)||cols.length||(vw.rm&&faoMapsDirty(g)))faoViewerMatterKill(vw,ks,cols); // cartes d'orientation changées (src/88-fao-77)
}
function faoViewerMatterToggle(){
  const vw=faoVw; if(!vw)return;
  vw.matterOn=!(vw.matterOn!==false);
  if(vw.matterOn===false){ faoViewerMatterShowBodies(vw); faoViewerMatterDispose(vw); }
  else faoViewerMatterEnable(vw);
  faoViewerMatterBarUpdate();
  faoViewerPieceBodyApply(); // case « corps pièce » : l'invariant matière ne doit pas la révéler
}
function faoViewerMatterBarUpdate(){
  try{
    if(faoVwMatterBtn&&faoVw)faoVwMatterBtn.textContent=(faoVw.matterOn!==false)?'◼ matière':'◻ matière';
  }catch(e){}
}
function faoViewerExactBarUpdate(){
  try{
    if(faoVwExactBtn){
      // 2026-10-22-002 : bouton à 2 ÉTATS — ◈ réel ↔ ≈ lisse (« simple » retiré)
      faoVwExactBtn.textContent=(faoViewerMode==='lisse')?'≈ lisse':'◈ réel';
      faoVwExactBtn.title=(faoViewerMode==='lisse')
        ?'Rendu « lisse » : physique réelle (profil de fraise, carve R2, brut au corps) + surface DOUCE (heightfield continu, nœuds moyennés) — clic = revenir au rendu « réel ».'
        :'Rendu « forme réelle » : profil de fraise (torique/boule), carve au rayon d’arête (arrondi R2 au bas des parois), surface NETTE aux cotes exactes et brut au corps réel — clic = basculer vers « lisse ».';
    }
  }catch(e){}
}
function faoViewerExactToggle(){
  // Cycle des versions : ◈ réel ↔ ≈ lisse (2026-10-11-007 ; « simple » retiré 2026-10-22-002).
  // EN COURS de lecture : la matière est reconstruite à la volée (rattrapage
  // 0 → t, temps et lecture préservés) ; outil et brut ne sont reconstruits
  // que si la PHYSIQUE change (« simple » <-> réel/lisse).
  const order=['reel','lisse']; // 2026-10-22-002 : « simple » retiré
  const i=order.indexOf(faoViewerMode);
  faoViewerModeSet(order[(i<0?0:i+1)%order.length]);
}
function faoViewerModeSet(m){
  // m : 'reel' (surface nette, défaut) | 'lisse' (surface douce) | 'simple'
  // (historique). Physique (outil/carve/brut) = mode !== 'simple' (toujours
  // lue via faoViewerExact) ; style de surface = vw.smooth.
  if(m!=='lisse')m='reel'; // 2026-10-22-002 : « simple » retiré (-> réel)
  faoViewerMode=m;
  faoViewerExact=(m!=='simple');
  faoViewerExactBarUpdate();
  const vw=faoVw;
  if(!vw)return;
  const phys=(vw.exact!==faoViewerExact); // physique réelle <-> simple : outil + brut à rebuild
  vw.exact=faoViewerExact;
  vw.smooth=(m==='lisse');
  if(phys){
    vw.toolSig=null;
    try{ // outil : profil réel <-> cylindre plat
      const old=vw.tool;
      const T=faoViewerToolCreate(vw.exact,(vw.kt&&vw.kt[0])||'flat',(vw.cr&&vw.cr[0])||0,(vw.dd&&vw.dd[0])||10,(vw.tp&&vw.tp[0])||null);
      vw.tool=T.group; vw.toolBody=T.body; vw.toolHold=T.hold; vw.toolSpin=T.spin; vw.toolSig=T.sig;
      if(old){ try{ faoDel3D(old); }catch(e){} faoViewerToolDispose(old); }
      if(vw.tool)faoAdd3D(vw.tool);
    }catch(e){}
    try{ // brut : fantôme corps <-> boîte
      const st=vw.stock;
      vw.stock=faoViewerStockCreate();
      if(st)try{ faoDel3D(st); }catch(e){}
      if(vw.stock)faoAdd3D(vw.stock);
    }catch(e){}
  }
  try{ if(vw.matterOn!==false)faoViewerMatterEnable(vw,!phys); }catch(e){} // grille conservée (V0.7.7) ; physique changée : retaille 0 → t
  try{ faoViewerApply(); }catch(e){}
  faoViewerMsg('FAO : rendu '+({reel:'forme réelle — surface NETTE aux cotes exactes',
    lisse:'lisse — physique réelle + surface DOUCE (heightfield)',
    simple:'simple historique'}[m])+'.');
  faoViewerPieceBodyApply(); // cases « corps pièce » / « corps outil » suivent le rebuild
  faoViewerHoldApply();
}
function faoViewerDetailSet(v){
  // Finesse du détail (2026-10-11-003) : change le niveau PUIS reconstruit sur
  // place — outil (toolSig #n → BodySwap) et matière (grille neuve + rattrapage
  // 0 → t), temps et lecture préservés. Sans viewer : le niveau s'applique à la
  // prochaine ouverture.
  const n=(+v===0||+v===1||+v===2)?+v:1;
  faoViewerDetail=n;
  try{ if(faoVwDetailSel&&faoVwDetailSel.value!==String(n))faoVwDetailSel.value=String(n); }catch(e){}
  const vw=faoVw;
  if(vw){
    try{ vw.toolSig=null; faoViewerApply(); }catch(e){}
    try{ faoViewerMatterEnable(vw); }catch(e){}
    try{ faoViewerPieceBodyApply(); }catch(e){}
  }
  faoViewerMsg('FAO : finesse du détail = '+['bas','normal','haut'][n]+
    ' (grille '+faoDetailCfg[n].B+' colonnes, outil '+faoDetailCfg[n].lathe+' segments).');
}
function faoViewerOpen(){
  if(faoVw)return true;
  try{
    const b=faoViewerBuild(faoSetup());
    if(!b.pts.length||!(b.T>0)){
      faoViewerMsg('FAO : aucune trajectoire à jouer — vérifiez le brut et activez au moins une opération.');
      return false; // aucune opération jouable (jamais silencieux)
    }
    const vw={pts:b.pts, dd:b.dd, kt:b.kt, cr:b.cr, tp:b.tp, times:b.times, lens:b.lens, T:b.T, t:0, idx:0, drawn:0,
      playing:false, speed:1, prevVis:true, body:null, tool:null, toolBody:null,
      toolHold:null, toolSpin:null, toolSig:null, line:null, stock:null, toolH:30, _last:0, _looping:false,
      exact:faoViewerExact,
      smooth:faoViewerMode==='lisse',
      matterOn:true, matter:null, matterGrid:null, mKills:[], mPos:null, mTops:null, mArr:null, mH:null, hideBodies:[]};
    faoVw=vw;
    // 1) traces cachées (non destructif : juste .visible=false)
    try{ if(faoPrevGroup){ vw.prevVis=faoPrevGroup.visible!==false; faoPrevGroup.visible=false; } }catch(e){}
    // 2) le brut apparaît : box du stock + corps-brut masqué (v009) ré-affiché
    try{ vw.stock=faoViewerStockCreate(); if(vw.stock)faoAdd3D(vw.stock); }catch(e){}
    try{
      const fs=faoSetup();
      if(fs&&fs.stockSrc==='body'&&fs.stockBody!=null){
        const b2=(typeof bodies!=='undefined'&&bodies?bodies:[]).filter(function(x){return x&&x.id===fs.stockBody;})[0];
        if(b2&&b2.mesh&&b2.mesh.visible===false&&doc.bodyVis&&doc.bodyVis[b2.id]===false){
          vw.body=b2; b2.visible=true; b2.mesh.visible=true;
        }
      }
    }catch(e){}
    // 3) outil + trace progressive
    try{
      const T=faoViewerToolCreate(vw.exact,(b.kt&&b.kt[0])||'flat',(b.cr&&b.cr[0])||0,(b.dd&&b.dd[0])||10,(b.tp&&b.tp[0])||null);
      vw.tool=T.group; vw.toolBody=T.body; vw.toolHold=T.hold; vw.toolH=T.H;
      vw.toolSpin=T.spin; vw.toolSig=T.sig;
      if(vw.tool)faoAdd3D(vw.tool);
    }catch(e){}
    try{ vw.line=faoViewerLineCreate(vw); if(vw.line)faoAdd3D(vw.line); }catch(e){}
    // 4) matière usinée : surface Z-map pleine (colonnes jointives, un seul mesh)
    try{ faoViewerMatterEnable(vw); }catch(e){}
    // 5) barre transporteur ▶ ⏸ ⏹ ✕ + matière
    try{ faoViewerBarShow(); }catch(e){}
    try{ faoViewerApply(); }catch(e){}
    try{ faoViewerBarUpdate(); }catch(e){}
    faoViewerBtnUpdate();
    faoViewerMatterBarUpdate();
    faoViewerPieceBodyApply(); // état des cases (persistées entre deux ouvertures)
    faoViewerHoldApply();
    try{ refreshMirror(); }catch(e){} // V0.7.5 : le sol passe sous le brut simulé
    return true;
  }catch(e){
    // Rollback complet : JAMAIS d'état « mi-ouvert » bloqué (aucune trace, aucun ✕).
    try{ faoViewerClose(); }catch(e2){}
    faoViewerMsg('Usinage : ouverture impossible ('+((e&&e.message)||e)+')');
    return false;
  }
}
function faoViewerClose(){
  // Sortie du mode lecture : ENLEVE l'outil, le brut, la matière, ré-affiche les traces.
  const vw=faoVw;
  faoVw=null;
  if(vw){
    try{ if(faoPrevGroup)faoPrevGroup.visible=(faoPrevOn!==false); }catch(e){}
    try{ faoViewerMatterShowBodies(vw); }catch(e){}
    try{ faoViewerMatterDispose(vw); }catch(e){}
    try{ // le corps-brut masqué redevient invisible (on ne défait que ce qu'on a fait)
      if(vw.body&&doc.bodyVis&&doc.bodyVis[vw.body.id]===false){ vw.body.visible=false; vw.body.mesh.visible=false; }
    }catch(e){}
    try{ if(vw.stock)faoDel3D(vw.stock); }catch(e){}
    try{ if(vw.tool)faoDel3D(vw.tool); }catch(e){}
    try{ if(vw.line)faoDel3D(vw.line); }catch(e){}
  }
  try{ if(faoVwBar)faoVwBar.style.display='none'; }catch(e){}
  faoViewerBtnUpdate();
  try{ refreshMirror(); }catch(e){} // V0.7.5 : le brut simulé parti, le sol revient sous les pièces
}
function faoViewerStart(){
  if(faoVw&&faoVw.playing)return true;
  if(!faoVw&&!faoViewerOpen())return false;
  return faoViewerPlay();
}
function faoViewerToggle(){
  // Bascule du bouton « ▶ Usinage » : OUVRIR le mode lecture / en SORTIR nettoyé.
  try{
    if(faoVw){
      faoViewerClose();
      faoViewerMsg('FAO : mode lecture usinage quitté — traces ré-affichées, outil et brut retirés.');
      return false;
    }
    if(faoViewerStart()){ faoViewerMsg('FAO : lecture usinage en cours (Échap ou ✕ pour sortir).'); return true; }
    faoViewerMsg('FAO : aucune trajectoire à jouer — vérifiez le brut et activez au moins une opération.');
  }catch(e){
    faoViewerMsg('Usinage : '+((e&&e.message)||e));
  }
  return false;
}
function faoViewerPlay(){
  const vw=faoVw; if(!vw)return false;
  if(vw.t>=vw.T)vw.t=0;
  vw.playing=true; vw._last=0;
  if(!vw._looping){ vw._looping=true; faoViewerLoop(); }
  faoViewerBarUpdate();
  return true;
}
function faoViewerPause(){
  if(!faoVw)return;
  faoVw.playing=false;
  faoViewerBarUpdate();
}
function faoViewerStop(){
  const vw=faoVw; if(!vw)return;
  vw.t=0; vw.idx=0; vw.playing=false; vw.mPos=null;
  try{ if(vw.matterOn!==false)faoViewerMatterEnable(vw); }catch(e){} // matière restaurée en entier
  faoViewerApply();
  faoViewerBarUpdate();
}
function faoViewerAdvance(dt){
  // Avance logique : secondes réelles × vitesse — pur (rAF + tests).
  const vw=faoVw;
  if(!vw||!vw.playing)return false;
  const d=+dt;
  if(isFinite(d)&&d>0)vw.t+=d*(vw.speed||1);
  if(isFinite(d)&&d>0&&vw.exact&&vw.toolSpin)vw.toolSpin.rotation.y-=d*(vw.speed||1)*10; // fraise qui tourne
  if(vw.t>=vw.T){ vw.t=vw.T; vw.playing=false; }
  faoViewerApply();
  faoViewerBarUpdate();
  return true;
}
function faoViewerLoop(){
  const vw=faoVw;
  if(!vw){ return; }
  if(!vw.playing){ vw._looping=false; return; }
  let now=0;
  try{ now=(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now(); }catch(e){ now=Date.now(); }
  const dt=vw._last?Math.min(0.25,(now-vw._last)/1000):0;
  vw._last=now;
  faoViewerAdvance(dt);
  if(faoVw&&faoVw.playing&&typeof requestAnimationFrame==='function')requestAnimationFrame(faoViewerLoop);
  else if(faoVw)vw._looping=false;
}
function faoViewerFmt(sec){
  const s=Math.max(0,Math.floor(+sec||0));
  const m=Math.floor(s/60);
  return (m<10?'0':'')+m+':'+((s%60)<10?'0':'')+(s%60);
}
function faoViewerBarShow(){
  if(faoVwBar){ faoVwBar.style.display='flex'; return; }
  try{
    const mk=function(t,title,fn){
      const b=document.createElement('button'); b.textContent=t;
      b.style.fontSize='.85rem'; b.title=title;
      if(fn)b.onclick=fn;
      return b;
    };
    const bar=document.createElement('div'); bar.id='faoViewerBar';
    bar.style.cssText='position:absolute;bottom:14px;left:50%;transform:translateX(-50%);display:flex;gap:6px;align-items:center;'
      +'background:rgba(18,20,24,.94);border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:6px 10px;'
      +'z-index:30;font-size:.78rem;color:#fff;box-shadow:0 4px 18px rgba(0,0,0,.45);';
    bar.appendChild(mk('▶','Lecture — en fin de parcours : pause automatique',function(){ faoViewerPlay(); }));
    bar.appendChild(mk('⏸','Pause',function(){ faoViewerPause(); }));
    bar.appendChild(mk('⏹','Stop : revient au début du parcours',function(){ faoViewerStop(); }));
    bar.appendChild(mk('✕','Quitter le mode lecture : ré-affiche les traces, retire l\'outil, le brut et la matière (Échap aussi)',function(){ faoViewerClose(); faoViewerMsg('FAO : mode lecture usinage quitté.'); }));
    const mb=mk('◼ matière','Matière usinée ON : la matière disparaît sous l\'outil (toggle)',function(){ faoViewerMatterToggle(); });
    bar.appendChild(mb); faoVwMatterBtn=mb;
    const eb=mk('◈ réel','',function(){ faoViewerExactToggle(); });
    bar.appendChild(eb); faoVwExactBtn=eb;
    // 2026-10-11-003 : finesse du détail (près de ◈ réel) + 2 cases à cocher.
    const ds=document.createElement('select');
    ds.title='Finesse du détail : grille de matière + maillage de l\'outil (bas = rapide, haut = fin)';
    ds.style.fontSize='.75rem';
    [[0,'bas'],[1,'normal'],[2,'haut']].forEach(function(o){
      const op=document.createElement('option'); op.value=o[0]; op.textContent=o[1]; ds.appendChild(op);
    });
    ds.value=String(faoViewerDetail);
    ds.onchange=function(){ faoViewerDetailSet(+ds.value); };
    bar.appendChild(ds); faoVwDetailSel=ds;
    const mkChk=function(label,title,get,set){
      const lb=document.createElement('label');
      lb.style.cssText='display:flex;gap:4px;align-items:center;cursor:pointer;user-select:none;white-space:nowrap;';
      lb.title=title;
      const inp=document.createElement('input');
      inp.type='checkbox'; inp.checked=!!get();
      inp.onchange=function(){ set(inp.checked); };
      lb.appendChild(inp);
      const sp=document.createElement('span'); sp.textContent=label; lb.appendChild(sp);
      bar.appendChild(lb);
      return inp;
    };
    mkChk('corps pièce',
      'Corps de pièce : masque les corps 3D pendant la lecture — le brut (boîte ou fantôme) et la matière restent visibles (case cochée).',
      function(){ return faoVwHideBody; },
      function(v){ faoVwHideBody=v; faoViewerPieceBodyApply(); });
    mkChk('corps outil',
      'Corps de l\'outil : masque le mandrin gris au-dessus de la fraise — la fraise seule reste visible.',
      function(){ return faoVwHideHold; },
      function(v){ faoVwHideHold=v; faoViewerHoldApply(); });
    const t=document.createElement('span');
    t.style.cssText='font-family:monospace;min-width:118px;text-align:center;color:rgba(255,255,255,.85);';
    t.textContent='00:00 / 00:00';
    bar.appendChild(t); faoVwBarT=t;
    const sp=document.createElement('select');
    sp.title='Vitesse de lecture (× temps réel)';
    sp.style.fontSize='.75rem';
    [[1,'×1'],[2,'×2'],[5,'×5'],[10,'×10'],[20,'×20']].forEach(function(o){
      const op=document.createElement('option'); op.value=o[0]; op.textContent=o[1]; sp.appendChild(op);
    });
    sp.onchange=function(){ if(faoVw)faoVw.speed=(+sp.value>0)?+sp.value:1; };
    bar.appendChild(sp);
    const host=document.getElementById('vpwrap')||document.body;
    host.appendChild(bar);
    faoVwBar=bar;
    faoViewerMatterBarUpdate();
    faoViewerExactBarUpdate();
  }catch(e){}
}
function faoViewerBarUpdate(){
  try{
    if(!faoVwBar)return;
    if(!faoVw){ faoVwBar.style.display='none'; return; }
    faoVwBar.style.display='flex';
    if(faoVwBarT){
      const pct=faoVw.T>0?Math.round(100*faoVw.t/faoVw.T):100;
      faoVwBarT.textContent=faoViewerFmt(faoVw.t)+' / '+faoViewerFmt(faoVw.T)+' · '+pct+'%';
    }
  }catch(e){}
}
