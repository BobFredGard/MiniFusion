/* ============ FAO : perçage — trous reconnus sur le modèle ============
   2026-10-15-011 — retour : « l'opération Perçage ne fait rien, pas d'outil ni
   parcours » (elle créait UN trou au centre du brut, sur toute la hauteur, avec la
   fraise T1, et n'affichait rien avant « Tout régénérer »).
   • RECONNAISSANCE (géométrie exacte OCCT, pas le maillage) : un trou = cylindre
     intérieur (face REVERSED) d'axe vertical, couverture ≥ 270° ; on relève X/Y, Ø,
     Z haut/bas, débouchant (classifieur : sous le fond = hors matière) ou borgne,
     angle de pointe (cône coaxial sous le fond), chanfrein / lamage d'entrée (cône
     ou cylindre coaxial plus large au-dessus).
   • SÉLECTION : par GROUPE (même Ø + même hauteur de départ) — cases dans la fiche
     ou clic sur un trou dans la vue. op.holeSel = [{d,z}] ; les trous sont re-résolus
     sur le modèle à chaque reconstruction (op.holes = instantané → clé de cache).
   • PROFONDEUR : plein Ø au fond du trou (défaut : + longueur de pointe), pointe au
     fond, ou cote manuelle ; débouchant : + débouchage (1 mm) ; pointage : Ø de
     chanfrein voulu → profondeur selon l'angle du foret à centrer.
   • ORDRE : plus court chemin (plus proche voisin + 2-opt) ou zigzag.
   • OUTIL : types « Foret » et « Foret à centrer » (angle de pointe, avance par tour
     F = f × S) ; sélectionner un groupe affecte le foret du même Ø de la
     bibliothèque, ou le CRÉE. */
const FAO_DRILL_KINDS={drill:1,spot:1};
function faoToolIsDrill(t){ return !!(t&&FAO_DRILL_KINDS[t.kind]); }
function faoToolAngle(t){ const a=t&&+t.ang; return (isFinite(a)&&a>20&&a<180)?a:(t&&t.kind==='spot'?90:118); }
function faoToolTipLen(t){ const D=(t&&+t.d>0)?+t.d:6; return (D/2)/Math.tan(faoToolAngle(t)*Math.PI/360); }
function faoToolFr(t){
  // Avance par tour (mm/tr) d'un foret : saisie, sinon règle d'atelier (carbure).
  const v=t&&+t.fr; if(isFinite(v)&&v>0)return v;
  const D=(t&&+t.d>0)?+t.d:6;
  return t&&t.kind==='spot'?0.05:Math.round((0.012*D+0.03)*1000)/1000;
}
/* ----- reconnaissance des trous ----- */
let faoHoleCache={shape:null,list:null};
function faoHoleShapes(){
  const out=[];
  try{ if(typeof occLive!=='undefined'&&occLive&&occLive.shape)out.push(occLive.shape); }catch(e){}
  try{
    (typeof bodies!=='undefined'&&bodies?bodies:[]).forEach(function(b){
      if(!b||b.kind!=='import'||b.visible===false||b.ghost)return;
      const e=(typeof importGeom!=='undefined')?importGeom.get(b.ref||b.id):null;
      if(e&&e.brep)out.push(e.brep);
    });
  }catch(e){}
  return out;
}
function faoHolesDetect(shapes){
  // Liste des trous verticaux (axe ±Z) des solides donnés. Pur OCCT : testable en Node.
  shapes=shapes||faoHoleShapes();
  if(!shapes.length||typeof occt==='undefined'||!occt)return [];
  if(shapes.length===1&&faoHoleCache.shape===shapes[0]&&faoHoleCache.list)return faoHoleCache.list;
  const groups=new Map(), cones=[];
  const T=occt.GeomAbs_SurfaceType, REV=occt.TopAbs_Orientation.TopAbs_REVERSED;
  shapes.forEach(function(sh,si){
    let ex=null;
    try{ ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE); }catch(e){ return; }
    let k=0;
    while(ex.More()){
      let f=null,ad=null;
      try{
        f=occt.TopoDS.Face_1(ex.Current());
        ad=new occt.BRepAdaptor_Surface_2(f,true);
        const ty=ad.GetType();
        if(ty===T.GeomAbs_Cylinder){
          const c=ad.Cylinder(),ax=c.Axis(),L=ax.Location(),Dd=ax.Direction();
          // Orientation de face NON fiable (repère direct/indirect selon la construction :
          // une découpe extrudée en −Z donne des trous « FORWARD ») → tri par la matière
          // autour du cylindre, plus bas (faoHoleIsHole).
          if(Math.abs(Dd.Z())>0.9999){
            const r=c.Radius(),u=Math.abs(ad.LastUParameter()-ad.FirstUParameter());
            const za=L.Z()+Dd.Z()*ad.FirstVParameter(),zb=L.Z()+Dd.Z()*ad.LastVParameter();
            const key=L.X().toFixed(2)+'|'+L.Y().toFixed(2)+'|'+r.toFixed(3);
            let g=groups.get(key);
            if(!g){g={x:+L.X().toFixed(3),y:+L.Y().toFixed(3),r:r,zLo:Infinity,zHi:-Infinity,cov:0,faces:[],shape:si};groups.set(key,g);}
            g.zLo=Math.min(g.zLo,za,zb);g.zHi=Math.max(g.zHi,za,zb);g.cov+=u;g.faces.push(si+':'+k);
          }
        }else if(ty===T.GeomAbs_Cone){
          const c=ad.Cone(),ax=c.Axis(),Dd=ax.Direction();
          if(Math.abs(Dd.Z())>0.9999){
            const A=c.Apex(),za=ad.FirstVParameter(),zb=ad.LastVParameter();
            // v = distance le long de la génératrice depuis la base : z = Lz + v·cos(semi)·dz
            const L=ax.Location(),cs=Math.cos(c.SemiAngle());
            const z1=L.Z()+Dd.Z()*za*cs,z2=L.Z()+Dd.Z()*zb*cs;
            cones.push({x:A.X(),y:A.Y(),apex:A.Z(),semi:Math.abs(c.SemiAngle()),zLo:Math.min(z1,z2),zHi:Math.max(z1,z2),rev:f.Orientation_1()===REV});
          }
        }
      }catch(e){}
      try{ if(ad)ad.delete(); }catch(e){}
      k++;ex.Next();
    }
    try{ ex.delete(); }catch(e){}
  });
  const holes=[];
  groups.forEach(function(g){
    if(g.cov<Math.PI*1.5)return; // < 270° : congé, rainure, demi-lune — pas un trou
    if(!faoHoleIsHole(shapes[g.shape],g))return; // pion / bossage : matière DEDANS
    const h={x:g.x,y:g.y,d:+(2*g.r).toFixed(3),ztop:+g.zHi.toFixed(3),zbot:+g.zLo.toFixed(3),
      through:false,tipAng:0,zSurf:+g.zHi.toFixed(3),chD:0,cb:null,faces:g.faces};
    cones.forEach(function(c){
      if(Math.hypot(c.x-g.x,c.y-g.y)>0.01)return;
      if(c.zHi<=g.zLo+0.01&&c.apex<g.zLo)h.tipAng=+(2*c.semi*180/Math.PI).toFixed(1); // pointe de forage
      if(c.zLo>=g.zHi-0.01){ // chanfrein d'entrée
        h.chD=+(2*Math.abs(c.zHi-c.apex)*Math.tan(c.semi)).toFixed(3);
        h.zSurf=+Math.max(h.zSurf,c.zHi).toFixed(3);
      }
    });
    holes.push(h);
  });
  // lamage / trou étagé : cylindre coaxial plus large posé sur le haut du trou
  holes.forEach(function(h){
    holes.forEach(function(o){
      if(o===h||Math.hypot(o.x-h.x,o.y-h.y)>0.01||o.d<=h.d+0.01)return;
      if(Math.abs(o.zbot-h.ztop)<0.02){h.cb={d:o.d,depth:+(o.ztop-o.zbot).toFixed(3)};h.zSurf=Math.max(h.zSurf,o.zSurf);o.step=true;}
    });
  });
  // débouchant : SOUS la pointe éventuelle (le vide du cône n'est pas « sous la
  // pièce »), hors matière. Un cylindre posé sur un trou plus petit (lamage) a un
  // fond plat annulaire : borgne.
  holes.forEach(function(h,i){
    if(h.step){h.through=false;delete h.step;return;}
    const g=Array.from(groups.values()).find(function(q){return Math.abs(q.x-h.x)<1e-6&&Math.abs(q.y-h.y)<1e-6&&Math.abs(2*q.r-h.d)<1e-6;});
    let zTest=h.zbot-0.3;
    cones.forEach(function(c){ if(Math.hypot(c.x-h.x,c.y-h.y)<=0.01&&c.zHi<=h.zbot+0.01&&c.apex<h.zbot)zTest=Math.min(zTest,c.apex-0.3); });
    try{
      const cl=new occt.BRepClass3d_SolidClassifier_2(shapes[g?g.shape:0]);
      const P=new occt.gp_Pnt_3(h.x,h.y,zTest);
      cl.Perform(P,1e-6);
      h.through=(cl.State()===occt.TopAbs_State.TopAbs_OUT);
      try{P.delete();cl.delete();}catch(e){}
    }catch(e){}
  });
  holes.sort(function(a,b){return b.ztop-a.ztop||a.d-b.d||a.x-b.x||a.y-b.y;});
  if(shapes.length===1){faoHoleCache={shape:shapes[0],list:holes};}
  return holes;
}
function faoHoleIsHole(sh,g){
  // Trou = vide juste à l'intérieur du rayon, matière juste à l'extérieur, à mi-hauteur
  // (8 directions ; majorité — un perçage voisin ou une poche peut en manger une).
  let inOut=0,outIn=0;
  const zm=(g.zLo+g.zHi)/2,e=Math.min(0.3,g.r*0.25);
  try{
    const cl=new occt.BRepClass3d_SolidClassifier_2(sh);
    const st=function(x,y,z){const P=new occt.gp_Pnt_3(x,y,z);cl.Perform(P,1e-6);const r=cl.State();try{P.delete();}catch(e2){}return r;};
    const IN=occt.TopAbs_State.TopAbs_IN,OUT=occt.TopAbs_State.TopAbs_OUT;
    for(let k=0;k<8;k++){
      const a=k*Math.PI/4,c=Math.cos(a),s=Math.sin(a);
      if(st(g.x+(g.r+e)*c,g.y+(g.r+e)*s,zm)===IN)inOut++;
      if(st(g.x+(g.r-e)*c,g.y+(g.r-e)*s,zm)===OUT)outIn++;
    }
    try{cl.delete();}catch(e2){}
  }catch(e){return false;}
  return inOut>=5&&outIn>=5;
}
function faoHoleGroups(holes){
  // Groupes « même Ø + même départ (Z haut) » — l'unité de sélection.
  const m=new Map();
  (holes||[]).forEach(function(h){
    const k=h.d.toFixed(2)+'@'+h.ztop.toFixed(2);
    let g=m.get(k);if(!g){g={d:h.d,z:h.ztop,holes:[]};m.set(k,g);}
    g.holes.push(h);
  });
  return Array.from(m.values());
}
function faoHoleInSel(op,h){
  return (op.holeSel||[]).some(function(s){return Math.abs(s.d-h.d)<0.02&&Math.abs(s.z-h.ztop)<0.05;});
}
function faoDrillResolve(op){
  // Re-résout les trous sélectionnés sur le modèle COURANT (suit les modifications).
  // Retourne true si op.holes a changé. Sans modèle exact : instantané conservé.
  if(!op||op.type!=='drill'||op.src!=='model')return false;
  const shapes=faoHoleShapes();if(!shapes.length)return false;
  const all=faoHolesDetect(shapes);
  const nh=all.filter(function(h){return faoHoleInSel(op,h);}).map(function(h){
    return {x:h.x,y:h.y,d:h.d,ztop:h.ztop,zbot:h.zbot,zSurf:h.zSurf,through:h.through,tipAng:h.tipAng,chD:h.chD};});
  const a=JSON.stringify(op.holes||[]),b=JSON.stringify(nh);
  if(a===b)return false;
  op.holes=nh;return true;
}
function faoDrillReplay(){
  // Fin de reconstruction : chaque perçage « trous du modèle » suit la pièce.
  try{
    faoHoleCache={shape:null,list:null};
    const r=faoRoot();let ch=false;
    ((r&&r.setups)||[]).forEach(function(s){((s&&s.ops)||[]).forEach(function(op){if(faoDrillResolve(op))ch=true;});});
    if(ch){try{faoChanged();}catch(e){}}
  }catch(e){}
}
/* ----- profondeur, ordre, mouvements ----- */
function faoDrillDepthOf(op,t,h){
  // Z de la POINTE de l'outil au fond, pour un trou.
  const L=faoToolTipLen(t),brk=isFinite(+op.brk)?Math.max(0,+op.brk):1;
  const cyc=op.cycle||'drill';
  if(cyc==='spot'){
    const chD=(+op.chD>0)?+op.chD:((h.chD>0)?h.chD:(h.d+0.4));
    const Dt=(t&&+t.d>0)?+t.d:10;
    const r=Math.min(chD,Dt)/2;
    return h.zSurf-r/Math.tan(faoToolAngle(t)*Math.PI/360);
  }
  const mode=op.depthMode||'full';
  if(mode==='manual'&&isFinite(+op.zbot))return +op.zbot;
  const bottom=h.through?(h.zbot-brk):h.zbot;
  return mode==='tip'?bottom:bottom-L;
}
function faoDrillOrder(pts,mode,start){
  // pts : [{x,y,…}] → ordre. 'auto' : plus proche voisin + 2-opt ; 'zigzag' : rangées en Y.
  const P=pts.slice();if(P.length<3||mode==='sel')return P;
  if(mode==='zigzag'){
    const ys=P.map(function(p){return p.y;}).sort(function(a,b){return a-b;});
    const tol=Math.max(1,(ys[ys.length-1]-ys[0])/50);
    P.sort(function(a,b){return Math.abs(a.y-b.y)>tol?a.y-b.y:a.x-b.x;});
    const rows=[];P.forEach(function(p){const r=rows[rows.length-1];if(r&&Math.abs(r[0].y-p.y)<=tol)r.push(p);else rows.push([p]);});
    return rows.reduce(function(o,r,i){return o.concat(i%2?r.reverse():r);},[]);
  }
  const s=start||{x:P[0].x,y:P[0].y};
  const out=[];let cx=s.x,cy=s.y;const left=P.slice();
  while(left.length){let bi=0,bd=Infinity;for(let i=0;i<left.length;i++){const d=Math.hypot(left[i].x-cx,left[i].y-cy);if(d<bd){bd=d;bi=i;}}
    const p=left.splice(bi,1)[0];out.push(p);cx=p.x;cy=p.y;}
  const D=function(a,b){return Math.hypot(a.x-b.x,a.y-b.y);};
  for(let pass=0;pass<4;pass++){let imp=false;
    for(let i=0;i<out.length-2;i++)for(let j=i+2;j<out.length;j++){
      const a=out[i],b=out[i+1],c=out[j],d2=out[j+1];
      const before=D(a,b)+(d2?D(c,d2):0),after=D(a,c)+(d2?D(b,d2):0);
      if(after<before-1e-9){out.splice(i+1,j-i,...out.slice(i+1,j+1).reverse());imp=true;}
    }
    if(!imp)break;}
  return out;
}
function faoDrillPlan(op,job){
  // Trous à percer dans l'ordre : [{x,y,rfp,zTip,d}] (Z pièce). Modèle ou saisie XY.
  const t=faoToolById(job,op.toolId);
  let list=[];
  if(op.src==='model'){
    list=(op.holes||[]).map(function(h){return {x:h.x,y:h.y,rfp:h.zSurf,zTip:faoDrillDepthOf(op,t,h),d:h.d};});
  }else{
    const D=(t&&+t.d>0)?+t.d:10;
    list=faoLimitDrillPts(op,D).map(function(p){return {x:+p[0],y:+p[1],rfp:+op.ztop,zTip:+op.zbot,d:D};});
  }
  // saisie XY historique : ordre saisi (programmes existants inchangés) sauf choix explicite
  return faoDrillOrder(list,op.order||(op.src==='model'?'auto':'sel'));
}
function faoGenDrillPlan(plan,secuAbs){
  const moves=[];
  plan.forEach(function(p){
    const s=Math.max(+secuAbs||0,p.rfp+2);
    moves.push({r:1,x:p.x,y:p.y,z:s});
    moves.push({r:1,x:p.x,y:p.y,z:p.rfp+Math.min(2,Math.max(0.5,s-p.rfp))});
    moves.push({r:0,x:p.x,y:p.y,z:p.zTip});
    moves.push({r:1,x:p.x,y:p.y,z:s});
  });
  return moves;
}
/* ----- outil : affectation automatique ----- */
function faoDrillAutoTool(setup,op,d){
  // Foret du bon Ø dans la bibliothèque, sinon création ; foret à centrer pour un pointage.
  const want=(op.cycle==='spot')?'spot':'drill';
  const cur=faoToolById(setup,op.toolId);
  if(cur&&cur.kind===want&&(want==='spot'||Math.abs(+cur.d-d)<0.011))return null;
  const tools=setup.tools||(setup.tools=[]);
  let t=tools.find(function(x){return x.kind===want&&(want==='spot'||Math.abs(+x.d-d)<0.011);});
  let made=false;
  if(!t){
    const n=tools.reduce(function(m,x){return Math.max(m,+x.num||0);},0)+1;
    t=want==='spot'
      ?{id:'T'+n+'_'+Date.now().toString(36),num:n,name:'Foret à centrer D10',kind:'spot',d:10,cornerR:0,flutes:2,vc:60,fz:0.03,ang:90}
      :{id:'T'+n+'_'+Date.now().toString(36),num:n,name:'Foret D'+(+d.toFixed(2)),kind:'drill',d:+d.toFixed(3),cornerR:0,flutes:2,vc:80,fz:0.05,ang:118};
    tools.push(t);made=true;
  }
  op.toolId=t.id;delete op.cut;
  return {tool:t,made:made};
}
/* ----- sélection dans la vue ----- */
let faoHolePick=null; // {setupId,opId}
function faoHolePickStart(setupId,opId){
  faoHolePick={setupId:setupId,opId:opId};
  faoHoleMarks();
  try{renderer.domElement.style.cursor='crosshair';}catch(e){}
  try{faceEl.textContent='Perçage : cliquez un trou dans la vue — tous les trous de même Ø et même départ sont pris (re-clic = retirer). Échap pour finir.';}catch(e){}
}
function faoHolePickExit(){
  faoHolePick=null;
  try{const o=scene.getObjectByName('faoHoleMarks');if(o)scene.remove(o);}catch(e){}
  try{renderer.domElement.style.cursor='default';}catch(e){}
  try{faoRefreshFaoUI();}catch(e){}
}
function faoHolePickAt(e){
  // Clic : trou dont l'axe passe au plus près du point d'impact (≤ Ø/2 + 0,5 mm).
  if(!faoHolePick)return false;
  const setup=faoSetup(faoHolePick.setupId),op=(setup.ops||[]).find(function(o){return o.id===faoHolePick.opId;});
  if(!op){faoHolePickExit();return false;}
  const h=pick(e);if(!h)return false;
  const holes=faoHolesDetect();
  let best=null,bd=Infinity;
  holes.forEach(function(H){
    if(h.point.z>H.zSurf+0.5||h.point.z<H.zbot-0.5)return;
    const d=Math.hypot(h.point.x-H.x,h.point.y-H.y);
    if(d<=H.d/2+0.5&&d<bd){bd=d;best=H;}
  });
  if(!best){try{faceEl.textContent='Perçage : ce n’est pas un trou vertical reconnu.';}catch(e){}return true;}
  faoHoleToggle(setup,op,best.d,best.ztop);
  faoHoleMarks();
  return true;
}
function faoHoleToggle(setup,op,d,z){
  faoSnapshot('sélection de trous');
  // UN diamètre par opération de perçage (un foret) : ajouter un autre Ø crée une
  // NOUVELLE opération avec son foret — sinon les trous déjà pris seraient percés au
  // nouveau Ø. Le pointage (foret à centrer) accepte tous les Ø.
  const cyc=op.cycle||'drill';
  const other=(op.holeSel||[]).some(function(s){return Math.abs(s.d-d)>=0.02;});
  const already=(op.holeSel||[]).some(function(s){return Math.abs(s.d-d)<0.02&&Math.abs(s.z-z)<0.05;});
  if(cyc!=='spot'&&other&&!already){
    const no=faoOpDefaults('drill');
    ['cycle','depthMode','brk','order','peck','dwell'].forEach(function(k){if(op[k]!==undefined)no[k]=op[k];});
    no.holeSel=[{d:+(+d).toFixed(3),z:+(+z).toFixed(3)}];
    const idx=(setup.ops||[]).indexOf(op);
    setup.ops.splice(idx<0?setup.ops.length:idx+1,0,no);
    faoDrillResolve(no);
    const r=faoDrillAutoTool(setup,no,d);
    faoChanged();
    try{faceEl.textContent='Perçage : Ø'+(+(+d).toFixed(2))+' ≠ Ø de cette opération → nouvelle opération Perçage ('+(no.holes||[]).length+' trou(s), T'+faoToolById(setup,no.toolId).num+' '+faoToolById(setup,no.toolId).name+(r&&r.made?' créé':'')+').';}catch(e){}
    return no;
  }
  op.src='model';
  op.holeSel=op.holeSel||[];
  const i=op.holeSel.findIndex(function(s){return Math.abs(s.d-d)<0.02&&Math.abs(s.z-z)<0.05;});
  if(i>=0)op.holeSel.splice(i,1);else op.holeSel.push({d:+(+d).toFixed(3),z:+(+z).toFixed(3)});
  faoDrillResolve(op);
  let msg='Perçage : '+(op.holes||[]).length+' trou(s) sélectionné(s).';
  if(i<0){const r=faoDrillAutoTool(setup,op,d);if(r)msg+=r.made?(' Outil créé : T'+r.tool.num+' '+r.tool.name+' (bibliothèque).'):(' Outil : T'+r.tool.num+' '+r.tool.name+'.');}
  faoChanged();
  try{faceEl.textContent=msg;}catch(e){}
  return op;
}
function faoHoleMarks(){
  // Anneaux sur les trous reconnus : gris = disponibles, orange = sélectionnés.
  try{
    const old=scene.getObjectByName('faoHoleMarks');if(old)scene.remove(old);
    if(!faoHolePick)return;
    const setup=faoSetup(faoHolePick.setupId),op=(setup.ops||[]).find(function(o){return o.id===faoHolePick.opId;});
    const grp=new THREE.Group();grp.name='faoHoleMarks';
    const segOf=function(H,r){const a=[];const N=40;for(let k=0;k<N;k++){const t0=k/N*Math.PI*2,t1=(k+1)/N*Math.PI*2;
      a.push(H.x+r*Math.cos(t0),H.y+r*Math.sin(t0),H.zSurf+0.05,H.x+r*Math.cos(t1),H.y+r*Math.sin(t1),H.zSurf+0.05);}return a;};
    const on=[],off=[];
    faoHolesDetect().forEach(function(H){(op&&faoHoleInSel(op,H)?on:off).push.apply(op&&faoHoleInSel(op,H)?on:off,segOf(H,H.d/2+0.6));});
    if(off.length)grp.add(faoThickSegs(off,0x8e8e93,1,2));
    if(on.length)grp.add(faoThickSegs(on,0xff9f0a,1,3));
    scene.add(grp);
  }catch(e){}
}
/* ----- fiche : sections Trous + Cycle ----- */
function faoDrillSections(setup,op,d){
  const t=faoToolById(setup,op.toolId);
  // ── cycle (Réglages)
  const rc=faoRow();
  rc.appendChild(faoLab('Cycle'));
  rc.appendChild(faoSel([['spot','Pointage (centrage)'],['drill','Perçage simple'],['peck','Débourrage (dégagement total)'],['chip','Brise-copeaux']],op.cycle||'drill',
    function(v){op.cycle=v; if(op.src==='model'&&(op.holes||[]).length){faoDrillAutoTool(setup,op,op.holes[0].d);} },
    'Pointage : G81/CYCLE81 à faible profondeur · Simple : G81 (G82 si temporisation) · Débourrage : G83/CYCLE83 remontée complète · Brise-copeaux : petit recul à chaque passe'));
  if(op.cycle==='peck'||op.cycle==='chip'){
    rc.appendChild(faoLab('Q'));
    rc.appendChild(faoNum((+op.peck)||Math.max(1,+(((+t.d)||6)*1).toFixed(1)),function(v){op.peck=Math.max(0.1,v);},48,0.5,'Profondeur de chaque passe (mm)'));
  }
  rc.appendChild(faoLab('Tempo'));
  rc.appendChild(faoNum((+op.dwell)||0,function(v){op.dwell=Math.max(0,v);},44,0.1,'Temporisation au fond (s) — 0 = aucune'));
  d.appendChild(rc);
  const rd=faoRow();
  if(op.cycle==='spot'){
    rd.appendChild(faoLab('Ø pointage'));
    rd.appendChild(faoNum((+op.chD)||0,function(v){op.chD=Math.max(0,v);},52,0.1,'Ø du chanfrein laissé par le foret à centrer (0 = chanfrein du modèle, sinon Ø du trou + 0,4)'));
  }else{
    rd.appendChild(faoLab('Profondeur'));
    rd.appendChild(faoSel([['full','Plein Ø au fond du trou'],['tip','Pointe au fond'],['manual','Cote manuelle']],op.depthMode||'full',function(v){op.depthMode=v;},
      'Plein Ø : la pointe descend en plus de sa longueur (angle du foret) · Pointe au fond : la pointe s’arrête au fond · Cote manuelle : Z de pointe saisi'));
    if((op.depthMode||'full')==='manual'){rd.appendChild(faoLab('Z')); rd.appendChild(faoNum(op.zbot,function(v){op.zbot=v;},52,null,'Z de la pointe (mm)'));}
    rd.appendChild(faoLab('Débouchage'));
    rd.appendChild(faoNum(isFinite(+op.brk)?+op.brk:1,function(v){op.brk=Math.max(0,v);},44,0.5,'Trous débouchants : dépassement sous la pièce (mm)'));
  }
  rd.appendChild(faoLab('Ordre'));
  rd.appendChild(faoSel([['auto','Plus court'],['zigzag','Zigzag']],op.order||'auto',function(v){op.order=v;},'Ordre de passage des trous'));
  d.appendChild(rd);
  if(!faoToolIsDrill(t)){
    const w=document.createElement('div');w.className='fao-note';
    w.textContent='⚠ L’outil T'+t.num+' n’est pas un foret ('+faoKindLabel(t.kind)+') — choisissez des trous : le foret du bon Ø est pris ou créé.';
    d.appendChild(w);
  }
  // ── trous (Zone)
  d.appendChild(faoH('Trous'));
  const rs=faoRow();
  rs.appendChild(faoLab('Source'));
  rs.appendChild(faoSel([['model','Trous du modèle'],['xy','Coordonnées XY']],op.src||'xy',function(v){op.src=v;faoDrillResolve(op);},'Trous reconnus sur la pièce, ou points saisis'));
  if(op.src==='model')rs.appendChild(faoMini(faoHolePick?'✔ Fin':'Choisir dans la vue',function(){
    if(faoHolePick)faoHolePickExit();else faoHolePickStart(setup.id,op.id);},'Cliquer un trou de la pièce : tous les trous de même Ø et même départ'));
  d.appendChild(rs);
  if(op.src==='model'){
    const holes=faoHolesDetect();
    if(!holes.length){const n=document.createElement('div');n.className='fao-empty';n.textContent='Aucun trou vertical reconnu sur le modèle (noyau exact requis).';d.appendChild(n);}
    faoHoleGroups(holes).forEach(function(g){
      const r=faoRow();
      const cb=document.createElement('input');cb.type='checkbox';cb.checked=faoHoleInSel(op,{d:g.d,ztop:g.z});
      cb.onchange=function(){faoHoleToggle(setup,op,g.d,g.z);};
      r.appendChild(cb);
      const h0=g.holes[0];
      const s=document.createElement('span');s.className='fao-meta';
      s.textContent='Ø'+(+g.d.toFixed(2))+' × '+g.holes.length+' · Z '+(+g.z.toFixed(2))+' → '+(+h0.zbot.toFixed(2))+' · '+(h0.through?'débouchant':'borgne')+
        (h0.tipAng?(' · pointe '+h0.tipAng+'°'):'')+(h0.chD?(' · chanfrein Ø'+(+h0.chD.toFixed(2))):'')+(h0.cb?(' · lamage Ø'+h0.cb.d):'');
      r.appendChild(s);d.appendChild(r);
    });
  }else{
    const pts=(op.pts||[]).map(function(q){return (+q[0])+','+(+q[1]);}).join('; ');
    const rp=faoRow();
    rp.appendChild(faoLab('XY'));
    rp.appendChild(faoTxt(pts,function(v){
      const lst=String(v).split(';').map(function(s){const q=s.split(',').map(function(x){return parseFloat(x);});
        return (q.length>=2&&isFinite(q[0])&&isFinite(q[1]))?[q[0],q[1]]:null;}).filter(function(q){return q;});
      op.pts=lst;},150,'Points X,Y séparés par « ; »'));
    rp.appendChild(faoLab('Haut'));rp.appendChild(faoNum(op.ztop,function(v){op.ztop=v;},52));
    rp.appendChild(faoLab('Bas'));rp.appendChild(faoNum(op.zbot,function(v){op.zbot=v;},52));
    d.appendChild(rp);
  }
}
