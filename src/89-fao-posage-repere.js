/* ---------- Posage : repère visible, brut transparent, points cardinaux (2026-10-16-017) ----------
   Quand un posage (ou une de ses opérations) est sélectionné :
   - le BRUT apparaît en ambre transparent ;
   - le REPÈRE du posage (même dessin que celui de l'appli) est posé sur son origine, orienté
     selon l'indexation 3+2 (B/C) ;
   - les 27 POINTS CARDINAUX (8 coins, 12 milieux d'arêtes, 6 centres de faces, centre) du brut
     ou du modèle sont affichés : un clic sur l'un d'eux y place l'origine du posage.
   L'origine est mémorisée en fractions de la boîte : setup.origin={pt:[fx,fy,fz],src:'stock'|'model'}
   (les anciens préréglages {preset} restent lus tels quels). Le G-code est relatif à ce point ;
   les parcours (repère monde) ne changent pas. */
const FAO_CARD=(function(){const v=[0,0.5,1],o=[];v.forEach(z=>v.forEach(y=>v.forEach(x=>o.push([x,y,z]))));return o;})();
const FAO_PRESET_PT={'top-X0Y0':[0,0,1],'top-X1Y1':[1,1,1],'top-C':[0.5,0.5,1],'bot-X0Y0':[0,0,0]};
function faoOriginSpec(setup){
  const o=(setup&&setup.origin)||{};
  if(Array.isArray(o.pt)&&o.pt.length===3&&o.pt.every(v=>isFinite(+v)))
    return {pt:o.pt.map(Number),src:o.src==='model'?'model':'stock'};
  return {pt:(FAO_PRESET_PT[o.preset]||FAO_PRESET_PT['top-X0Y0']).slice(),src:'stock'};
}
function faoModelBox(setup){
  // boîte du MODÈLE usiné (corps du posage), sans marge ; repli : null
  try{
    if(typeof THREE==='undefined'||typeof bodies==='undefined'||!bodies)return null;
    const want=(setup&&Array.isArray(setup.bodies))?setup.bodies:null;
    const box=new THREE.Box3();let n=0;
    bodies.forEach(b=>{
      if(!b||b.ghost||!b.mesh)return;
      if(want){if(want.indexOf(b.id)<0)return;}
      else if(b.visible===false)return;
      if(setup&&setup.stockSrc==='body'&&setup.stockBody===b.id)return; // corps-brut ≠ modèle
      try{box.expandByObject(b.mesh);n++;}catch(e){}
    });
    if(!n||box.isEmpty())return null;
    const Fr=faoFrame(setup);
    if(!Fr.id){ const ms=bodies.filter(b=>b&&!b.ghost&&b.mesh&&(want?want.indexOf(b.id)>=0:b.visible!==false)&&!(setup&&setup.stockSrc==='body'&&setup.stockBody===b.id)).map(b=>b.mesh); const Bf=faoMeshesBoxF(ms,Fr); if(Bf)return Bf; }
    const a=box.min,c=box.max;
    if(![a.x,a.y,a.z,c.x,c.y,c.z].every(isFinite))return null;
    return {x0:a.x,y0:a.y,z0:a.z,x1:c.x,y1:c.y,z1:c.z};
  }catch(e){return null;}
}
function faoBoxPt(B,f){return [B.x0+f[0]*(B.x1-B.x0),B.y0+f[1]*(B.y1-B.y0),B.z0+f[2]*(B.z1-B.z0)];}
function faoCardLabel(f){
  const z=f[2]===1?'dessus':f[2]===0?'dessous':'mi-hauteur';
  const ax=(k,v)=>v===0.5?'':k+(v===0?'0':'1');
  const xy=(f[0]===0.5&&f[1]===0.5)?'centre':[ax('X',f[0]),ax('Y',f[1])].filter(Boolean).join(' ');
  const kind=(f[0]===0.5&&f[1]===0.5)?'':((f[0]===0.5||f[1]===0.5)?'milieu ':'coin ');
  return z+' '+kind+xy;
}
/* ----- dessin (reconstruit seulement quand la signature change) ----- */
let faoOpTriad=null;
let faoPoseGrp=null,faoPoseTriad=null,faoPoseSig='',faoPoseDots=null,faoPoseHover=-1;
function faoPoseSetupSel(){
  try{
    // Interface moderne : les visuels FAO (brut, cubes, repères, points) n'existent
    // QUE dans l'espace FAO. CAO et PLAN ne doivent jamais les afficher, même si un
    // posage reste sélectionné. Interface classique : comportement historique.
    const ws=document.body.getAttribute('data-ws');
    if(ws==='cao'||ws==='plan')return null;
    if(typeof sel==='undefined'||!sel||!(sel.kind==='faoSetup'||sel.kind==='faoOp'))return null;
    if(typeof skEdit!=='undefined'&&skEdit)return null;
    const r=faoRoot();
    const id=sel.kind==='faoSetup'?sel.id:(sel.setup||r.activeSetupId);
    return r.setups.filter(s=>s.id===id)[0]||null;
  }catch(e){return null;}
}
function faoPoseClear(){
  if(faoPoseGrp){
    try{
      if(faoPoseTriad)faoPoseGrp.remove(faoPoseTriad); // le repère est réutilisé, jamais libéré
      if(faoOpTriad)faoPoseGrp.remove(faoOpTriad);
      faoDel3D(faoPoseGrp);
      faoPoseGrp.traverse(o=>{if(!(o.userData&&o.userData.shared))o.geometry&&o.geometry.dispose();o.material&&o.material.dispose&&o.material.dispose();});
    }catch(e){}
    faoPoseGrp=null;
  }
  faoPoseDots=null;
}
function faoPoseSync(){
  try{faoRoot3D();}catch(e){} // matrice de la racine FAO = repère du posage actif
  const setup=faoPoseSetupSel();
  // le sol miroir suit le brut affiché : recalé à chaque apparition / disparition / changement
  if(!setup){if(faoPoseGrp){faoPoseClear();faoPoseSig='';if(faoPoseTriad)faoPoseTriad.visible=false;try{refreshMirror();}catch(e){}}return;}
  const st=setup.stock;
  if(!faoStockValid(st)){if(faoPoseGrp){faoPoseClear();try{refreshMirror();}catch(e){}}faoPoseSig='';return;}
  const spec=faoOriginSpec(setup),O=faoOrient(setup);
  // opération sélectionnée avec son repère propre (3+2) : son repère est dessiné aussi
  let selOp=null;try{if(sel.kind==='faoOp')selOp=(setup.ops||[]).filter(o=>o.id===sel.id)[0]||null;}catch(e){}
  const opF=(selOp&&selOp.frame)?faoFrame({frame:Object.assign({},selOp.frame,{o:null})}):null; // axes seuls : centre commun
  // La sélection opération/posage fait partie de la signature : même sans repère
  // propre à l'opération, passer de l'un à l'autre doit reconstruire le groupe.
  const sig=[setup.id,selOp?('op:'+selOp.id):'setup',opF&&!opF.id?opF.X.concat(opF.Z).map(q=>q.toFixed(6)).join(','):'',st.x0,st.y0,st.z0,st.x1,st.y1,st.z1,st.cyl?JSON.stringify(st.cyl):'',faoStockShape(setup),setup.stockBody,spec.pt.join(','),spec.src,O.b,O.c,faoFrameSig(setup),
    (typeof _docVersion!=='undefined'?_docVersion:0),faoPoseHover].join('|');
  if(sig===faoPoseSig&&faoPoseGrp)return;
  faoPoseSig=sig;faoPoseClear();
  const g=new THREE.Group();g.name='faoPose';
  // Cubes (brut + modèle) et points cardinaux : UNIQUEMENT quand le posage est
  // sélectionné. Une opération ne garde que les repères d'orientation.
  let P=null;
  if(!selOp){
  // brut transparent : cylindre, corps (forme réelle) ou boîte
  let drawn=false;
  try{const cy=faoStockCylMesh(st,0xffb340,.13);if(cy){cy.traverse(o=>{if(o.isMesh)o.userData.faoStock=true;});g.add(cy);drawn=true;}}catch(e){}
  if(!drawn&&faoStockShape(setup)==='solid'){
    try{
      const b=(typeof bodies!=='undefined'&&bodies?bodies:[]).filter(x=>x&&x.id===setup.stockBody)[0];
      if(b&&b.mesh){
        const mat=new THREE.MeshBasicMaterial({color:0xffb340,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide});
        const cl=new THREE.Mesh(b.mesh.geometry,mat);cl.applyMatrix4(b.mesh.matrixWorld);
        try{const Fr=faoFrame(setup);if(!Fr.id)cl.applyMatrix4(new THREE.Matrix4().makeBasis(new THREE.Vector3(...Fr.X),new THREE.Vector3(...Fr.Y),new THREE.Vector3(...Fr.Z)).invert());}catch(e){}cl.raycast=()=>{};cl.renderOrder=5;
        cl.userData.shared=true;cl.userData.faoStock=true;g.add(cl);drawn=true;
      }
    }catch(e){}
  }
  if(!drawn)try{
    const bg=new THREE.BoxGeometry(st.x1-st.x0,st.y1-st.y0,st.z1-st.z0);
    const box=new THREE.Mesh(bg,new THREE.MeshBasicMaterial({color:0xffb340,transparent:true,opacity:.13,depthWrite:false,side:THREE.DoubleSide}));
    box.position.set((st.x0+st.x1)/2,(st.y0+st.y1)/2,(st.z0+st.z1)/2);box.raycast=()=>{};box.renderOrder=5;box.userData.faoStock=true;g.add(box);
    const e=new THREE.LineSegments(new THREE.EdgesGeometry(bg),new THREE.LineBasicMaterial({color:0xffb340,transparent:true,opacity:.85}));
    e.position.copy(box.position);e.raycast=()=>{};g.add(e);
  }catch(e){}
  // CUBE DU MODÈLE (corps) : mêmes règles d'affichage que le cube du brut (faces
  // transparentes + arêtes), en blanc — visible dès qu'un posage est sélectionné,
  // quelle que soit l'origine choisie (avant : seulement un contour pointillé quand
  // l'origine était posée sur le modèle). Il encadre le volume réellement usiné.
  let Bm=null;
  try{Bm=faoModelBox(setup);}catch(e){Bm=null;}
  try{
    const eqSt=Bm&&st&&['x0','y0','z0','x1','y1','z1'].every(k=>Math.abs(+Bm[k]-+st[k])<1e-6);
    if(Bm&&!eqSt){
      const mg=new THREE.BoxGeometry(Bm.x1-Bm.x0,Bm.y1-Bm.y0,Bm.z1-Bm.z0);
      const mo=new THREE.Mesh(mg,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.10,depthWrite:false,side:THREE.DoubleSide}));
      mo.position.set((Bm.x0+Bm.x1)/2,(Bm.y0+Bm.y1)/2,(Bm.z0+Bm.z1)/2);mo.raycast=()=>{};mo.renderOrder=5;g.add(mo);
      const me=new THREE.LineSegments(new THREE.EdgesGeometry(mg),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.6}));
      me.position.copy(mo.position);me.raycast=()=>{};g.add(me);
    }
  }catch(e){}
  // points cardinaux de la boîte de référence (brut ou modèle)
  const B=(spec.src==='model'&&Bm)||st;
  const cylAx=(spec.src!=='model'&&st.cyl)?({x:0,y:1,z:2})[st.cyl.axis]:-1;
  P=FAO_CARD.map(f=>{
    if(cylAx>=0){const u=f[(cylAx+1)%3],v=f[(cylAx+2)%3];if(u!==0.5&&v!==0.5)return null;} // coin de section : hors du cylindre
    return faoBoxPt(B,f);});
  const cur=FAO_CARD.findIndex(f=>f[0]===spec.pt[0]&&f[1]===spec.pt[1]&&f[2]===spec.pt[2]);
  try{
    const pos=[],col=[];
    P.forEach((p,i)=>{if(i===cur||!p)return;pos.push(p[0],p[1],p[2]);const c=i===faoPoseHover?[1,0.35,0.12]:[1,1,1];col.push(...c);});
    const ge=new THREE.BufferGeometry();
    ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    ge.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    const pts=new THREE.Points(ge,new THREE.PointsMaterial({size:8,sizeAttenuation:false,vertexColors:true,depthTest:false,depthWrite:false,transparent:true}));
    pts.renderOrder=995;pts.raycast=()=>{};g.add(pts);
  }catch(e){}
  }
  faoPoseDots=P;
  // repère du posage : origine + orientation 3+2 (axes outil vus dans le repère pièce)
  if(!faoPoseTriad){faoPoseTriad=triadMake({name:'faoPoseTriad',px:70,renderOrder:996,planes:false});}
  const OP=faoOriginPoint(setup);
  faoPoseTriad.position.set(OP[0],OP[1],OP[2]);
  try{
    const M=new THREE.Matrix4().makeRotationY(O.b*Math.PI/180).multiply(new THREE.Matrix4().makeRotationZ(O.c*Math.PI/180));
    faoPoseTriad.setRotationFromMatrix(M.invert());
  }catch(e){}
  faoPoseTriad.visible=true;
  g.add(faoPoseTriad);
  // repère de l'OPÉRATION : même origine, orienté selon son Z / X (dans le repère du posage)
  if(!faoOpTriad){faoOpTriad=triadMake({name:'faoOpTriad',px:92,renderOrder:997,planes:false});}
  if(opF&&!opF.id){
    faoOpTriad.position.set(OP[0],OP[1],OP[2]); // centre COMMUN avec le posage (Fusion 360)
    faoOpTriad.setRotationFromMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(...opF.X),new THREE.Vector3(...opF.Y),new THREE.Vector3(...opF.Z)));
    faoOpTriad.visible=true;g.add(faoOpTriad);
    faoPoseTriad.userData.px=52; // le posage en plus petit : l'opération domine
  }else{faoOpTriad.visible=false;faoPoseTriad.userData.px=70;}
  faoAdd3D(g);faoPoseGrp=g;
  try{refreshMirror();}catch(e){}
}
function faoPoseNear(e){
  // index du point cardinal le plus proche du curseur (≤ 9 px), sinon -1
  if(!faoPoseGrp||!faoPoseDots)return -1;
  try{
    const r=renderer.domElement.getBoundingClientRect();
    const mx=e.clientX-r.left,my=e.clientY-r.top;
    let best=-1,bd=9;
    const v=new THREE.Vector3();
    let RW=null;try{faoPoseGrp.updateMatrixWorld(true);RW=faoPoseGrp.parent?faoPoseGrp.parent.matrixWorld:null;}catch(err){}
    faoPoseDots.forEach((p,i)=>{
      if(!p)return;
      v.set(p[0],p[1],p[2]);if(RW)v.applyMatrix4(RW);v.project(camera);
      if(v.z>1)return;
      const sx=(v.x+1)/2*r.width,sy=(1-v.y)/2*r.height;
      const d=Math.hypot(sx-mx,sy-my);if(d<bd){bd=d;best=i;}
    });
    return best;
  }catch(e){return -1;}
}
function faoPoseHoverAt(e){
  const i=faoPoseNear(e);
  if(i!==faoPoseHover){faoPoseHover=i;}
  return i>=0;
}
function faoPosePickAt(e){
  const i=faoPoseNear(e);if(i<0)return false;
  const setup=faoPoseSetupSel();if(!setup)return false;
  const spec=faoOriginSpec(setup);
  faoSnapshot('origine du posage');
  setup.origin={pt:FAO_CARD[i].slice(),src:spec.src};
  faoChanged();
  try{faceEl.textContent='Origine '+(setup.wcs||'G54')+' : '+faoOriginLabel(setup);}catch(err){}
  try{renderProps();}catch(err){}
  return true;
}
function faoStockCylMesh(st,col,op){
  // brut cylindrique (stock.cyl) : cylindre transparent + 2 cercles d'arête ; null sinon
  const C=st&&st.cyl;if(!C||!(C.r>0)||!Array.isArray(C.c))return null;
  const I=C.axis==='x'?0:C.axis==='y'?1:2;
  const L=I===0?st.x1-st.x0:I===1?st.y1-st.y0:st.z1-st.z0;
  const g=new THREE.Group();
  const cg=new THREE.CylinderGeometry(C.r,C.r,L,64,1,false);
  const m=new THREE.Mesh(cg,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,depthWrite:false,side:THREE.DoubleSide}));
  m.raycast=()=>{};m.renderOrder=5;g.add(m);
  [-L/2,L/2].forEach(y=>{
    const pts=[];for(let i=0;i<=64;i++){const a=i/64*Math.PI*2;pts.push(new THREE.Vector3(C.r*Math.cos(a),y,C.r*Math.sin(a)));}
    const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.85}));
    l.raycast=()=>{};g.add(l);
  });
  // CylinderGeometry est d'axe Y : on le couche sur l'axe voulu
  if(I===0)g.rotation.z=-Math.PI/2; else if(I===2)g.rotation.x=Math.PI/2;
  g.position.set(C.c[0],C.c[1],C.c[2]);
  return g;
}
/* ---------- Repère ORIENTÉ du posage (2026-10-16-019) ----------
   Le repère du posage est le repère absolu de ses opérations : tous les calculs FAO se font
   dans ses coordonnées (outil le long de SON Z). setup.frame = {z, x, flipZ, flipX} où z / x
   valent '+X' … '-Z' (axe du repère d'origine) ou [nx,ny,nz] (normale de face / arête cliquée).
   Coordonnées posage = rotation seule du repère pièce (même origine monde) : p_f = Rᵀ·p,
   p = R·p_f, colonnes de R = X, Y, Z du posage. L'origine G-code (point cardinal) est prise
   ensuite dans ces coordonnées. Repère par défaut = repère pièce : AUCUN changement. */
const FAO_AX={'+X':[1,0,0],'-X':[-1,0,0],'+Y':[0,1,0],'-Y':[0,-1,0],'+Z':[0,0,1],'-Z':[0,0,-1]};
function faoV(v){
  if(typeof v==='string')return FAO_AX[v]?FAO_AX[v].slice():null;
  if(Array.isArray(v)&&v.length===3&&v.every(q=>isFinite(+q))){const l=Math.hypot(+v[0],+v[1],+v[2]);return l>1e-9?[v[0]/l,v[1]/l,v[2]/l]:null;}
  return null;
}
function faoFrame(setup){
  // {X,Y,Z,id} ; id = repère identique au repère pièce
  const f=(setup&&setup.frame)||{};
  let Z=faoV(f.z)||[0,0,1], X=faoV(f.x)||[1,0,0];
  if(f.flipZ)Z=Z.map(q=>-q);
  if(f.flipX)X=X.map(q=>-q);
  // X projeté perpendiculairement à Z ; parallèle → axe de repli le moins aligné
  let d=X[0]*Z[0]+X[1]*Z[1]+X[2]*Z[2];
  let Xp=[X[0]-d*Z[0],X[1]-d*Z[1],X[2]-d*Z[2]],L=Math.hypot(Xp[0],Xp[1],Xp[2]);
  let warn='';
  if(L<1e-6){
    warn='X parallèle à Z : X remplacé';
    const c=[[1,0,0],[0,1,0],[0,0,1]].sort((a,b)=>Math.abs(a[0]*Z[0]+a[1]*Z[1]+a[2]*Z[2])-Math.abs(b[0]*Z[0]+b[1]*Z[1]+b[2]*Z[2]))[0];
    d=c[0]*Z[0]+c[1]*Z[1]+c[2]*Z[2];Xp=[c[0]-d*Z[0],c[1]-d*Z[1],c[2]-d*Z[2]];L=Math.hypot(Xp[0],Xp[1],Xp[2]);
  }
  X=[Xp[0]/L,Xp[1]/L,Xp[2]/L];
  let Y=[Z[1]*X[2]-Z[2]*X[1],Z[2]*X[0]-Z[0]*X[2],Z[0]*X[1]-Z[1]*X[0]];
  // 2026-10-21-009 : ROTATION autour du X du repère (X+ : sens direct, Y vers Z ;
  // X− : sens inverse), en degrés — ex. posage de Fusion tourné de −11,25°.
  const ra=(isFinite(+f.rx)&&Math.abs(+f.rx)>1e-9)?(+f.rx)*(f.rxAx==='-X'?-1:1)*Math.PI/180:0;
  if(ra){const c=Math.cos(ra),s=Math.sin(ra);
    const Yn=[Y[0]*c+Z[0]*s,Y[1]*c+Z[1]*s,Y[2]*c+Z[2]*s],Zn=[Z[0]*c-Y[0]*s,Z[1]*c-Y[1]*s,Z[2]*c-Y[2]*s];
    Y=Yn;Z=Zn;}
  // 2026-10-16-020 : origine du repère (monde) — repère d'opération posé sur une face
  const O=(Array.isArray(f.o)&&f.o.length===3&&f.o.every(q=>isFinite(+q)))?f.o.map(Number):[0,0,0];
  const id=Math.abs(X[0]-1)<1e-9&&Math.abs(Y[1]-1)<1e-9&&Math.abs(Z[2]-1)<1e-9&&Math.abs(O[0])<1e-12&&Math.abs(O[1])<1e-12&&Math.abs(O[2])<1e-12;
  return {X,Y,Z,O,id,warn};
}
function faoFrameSig(setup){
  const F=faoFrame(setup);if(F.id)return '';
  const r=v=>v.map(q=>(Math.round(q*1e6)/1e6)).join(',');
  return 'F'+r(F.X)+';'+r(F.Z)+((F.O[0]||F.O[1]||F.O[2])?';'+r(F.O):'');
}
// points : translation + rotation ; directions (normales, axes) : rotation seule
function faoRotF(F,p){return [p[0]*F.X[0]+p[1]*F.X[1]+p[2]*F.X[2],p[0]*F.Y[0]+p[1]*F.Y[1]+p[2]*F.Y[2],p[0]*F.Z[0]+p[1]*F.Z[1]+p[2]*F.Z[2]];}
function faoRotW(F,q){return [q[0]*F.X[0]+q[1]*F.Y[0]+q[2]*F.Z[0],q[0]*F.X[1]+q[1]*F.Y[1]+q[2]*F.Z[1],q[0]*F.X[2]+q[1]*F.Y[2]+q[2]*F.Z[2]];}
function faoToF(F,p){const O=F.O||[0,0,0];return faoRotF(F,[p[0]-O[0],p[1]-O[1],p[2]-O[2]]);}
function faoToW(F,q){const O=F.O||[0,0,0],w=faoRotW(F,q);return [w[0]+O[0],w[1]+O[1],w[2]+O[2]];}
function faoFrameLabel(v){
  if(typeof v==='string'&&FAO_AX[v])return v;
  const u=faoV(v);if(!u)return '+Z';
  return 'face ('+u.map(q=>(Math.abs(q)<5e-4?0:q).toFixed(3).replace(/\.?0+$/,'')).join(', ')+')';
}
/* Racine d'affichage FAO : tout ce que la FAO dessine (aperçu, simulation, chaînes, perçages,
   brut, repère du posage) est en coordonnées POSAGE sous ce groupe, dont la matrice = R. */
let faoRootG=null,faoRootSig='';
function faoRoot3D(){
  try{
    if(typeof scene==='undefined'||!scene||typeof THREE==='undefined')return null;
    if(!faoRootG||!faoRootG.parent){faoRootG=new THREE.Group();faoRootG.name='faoFrameRoot';faoRootG.matrixAutoUpdate=false;scene.add(faoRootG);faoRootSig='?';}
    let st=null;try{st=faoSetup();}catch(e){}
    const sg=faoFrameSig(st);
    if(sg!==faoRootSig){
      const F=faoFrame(st);
      faoRootG.matrix.makeBasis(new THREE.Vector3(...F.X),new THREE.Vector3(...F.Y),new THREE.Vector3(...F.Z));
      faoRootG.matrix.setPosition(F.O[0],F.O[1],F.O[2]);
      faoRootG.matrixWorldNeedsUpdate=true;faoRootSig=sg;
    }
    // Interface moderne : parcours, simulation, brut… n'existent à l'écran QUE dans
    // l'espace FAO — masqués en CAO / PLAN, rendus tels quels au retour (rien n'est détruit).
    try{const ws=document.body.getAttribute('data-ws');faoRootG.visible=!(ws==='cao'||ws==='plan');}catch(e){}
    return faoRootG;
  }catch(e){return (typeof scene!=='undefined')?scene:null;}
}
function faoAdd3D(o){const r=faoRoot3D();if(r&&o)r.add(o);}
function faoDel3D(o){try{if(o&&o.parent)o.parent.remove(o);}catch(e){}}
function faoGet3D(name){try{const r=faoRoot3D();return (r&&r.getObjectByName(name))||(scene&&scene.getObjectByName(name))||null;}catch(e){return null;}}
/* Entrées géométriques ramenées dans le repère du posage */
function faoMeshToF(mm,F){
  if(!mm||!F||F.id)return mm;
  return {v:mm.v.map(p=>faoToF(F,p)),t:mm.t};
}
function faoBoxOfVerts(V){
  let x0=1/0,y0=1/0,z0=1/0,x1=-1/0,y1=-1/0,z1=-1/0;
  for(const p of V){if(p[0]<x0)x0=p[0];if(p[1]<y0)y0=p[1];if(p[2]<z0)z0=p[2];if(p[0]>x1)x1=p[0];if(p[1]>y1)y1=p[1];if(p[2]>z1)z1=p[2];}
  return {x0,y0,z0,x1,y1,z1};
}
function faoMeshesBoxF(meshes,F){
  // boîte englobante, en coordonnées posage, des maillages THREE donnés
  const v=new THREE.Vector3();let B=null;
  meshes.forEach(me=>{
    const pa=me.geometry&&me.geometry.attributes&&me.geometry.attributes.position;if(!pa)return;
    me.updateMatrixWorld(true);
    for(let i=0;i<pa.count;i++){
      v.fromBufferAttribute(pa,i).applyMatrix4(me.matrixWorld);
      const q=faoToF(F,[v.x,v.y,v.z]);
      if(!B)B={x0:q[0],y0:q[1],z0:q[2],x1:q[0],y1:q[1],z1:q[2]};
      else{if(q[0]<B.x0)B.x0=q[0];if(q[1]<B.y0)B.y0=q[1];if(q[2]<B.z0)B.z0=q[2];if(q[0]>B.x1)B.x1=q[0];if(q[1]>B.y1)B.y1=q[1];if(q[2]>B.z1)B.z1=q[2];}
    }
  });
  return B;
}
const faoShapeFCache=new Map();
function faoShapeToF(sh,F){
  // solide OCCT tourné dans le repère du posage (trous, arêtes) — mis en cache par repère
  if(!sh||!F||F.id||typeof occt==='undefined'||!occt)return sh;
  const k=F.X.join(',')+'|'+F.Z.join(',')+'|'+(F.O||[]).join(',');
  const c=faoShapeFCache.get(sh);if(c&&c.k===k)return c.s;
  try{
    const t=new occt.gp_Trsf_1();
    const tO=faoRotF(F,F.O||[0,0,0]);
    t.SetValues(F.X[0],F.X[1],F.X[2],-tO[0], F.Y[0],F.Y[1],F.Y[2],-tO[1], F.Z[0],F.Z[1],F.Z[2],-tO[2]);
    const b=new occt.BRepBuilderAPI_Transform_2(sh,t,true);
    const s=b.Shape();
    if(faoShapeFCache.size>6)faoShapeFCache.clear();
    faoShapeFCache.set(sh,{k,s});
    return s;
  }catch(e){return sh;}
}
/* ----- choix des axes du posage : axe du repère d'origine, ou face / arête cliquée ----- */
let faoFramePick=null; // {setupId, which:'z'|'x'}
function faoFramePickStart(setupId,which,opId){
  faoFramePick={setupId,which,opId:opId||null};
  try{renderer.domElement.style.cursor='crosshair';}catch(e){}
  try{faceEl.textContent='Axe '+which.toUpperCase()+' du posage : cliquez une FACE plane (sa normale sortante), une face cylindrique (son axe) ou une ARÊTE droite (sa direction) — Échap annule.';}catch(e){}
  try{renderProps();}catch(e){}
}
function faoFramePickCancel(){faoFramePick=null;try{renderer.domElement.style.cursor='default';}catch(e){}try{renderProps();}catch(e){}}
function faoFramePickCommit(e){
  const t=faoFramePick;if(!t)return;
  const setup=faoSetup(t.setupId);if(!setup){faoFramePickCancel();return;}
  const op=t.opId?(setup.ops||[]).filter(o=>o.id===t.opId)[0]:null; // repère d'opération : direction ramenée dans le posage
  if(t.opId&&!op){faoFramePickCancel();return;}
  let dir=null,what='',hitP=null;
  try{
    const h=pick(e);
    if(h&&h.point)hitP=[h.point.x,h.point.y,h.point.z];
    const eh=(typeof edgeHoverPick==='function')?edgeHoverPick(e,h):null;
    if(eh){ // arête droite : direction premier → dernier point
      const P=edgeHoverSegs()[eh.pi];
      if(P&&P.length>=2){
        const a=P[0],b=P[P.length-1],d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(...d);
        let straight=L>1e-6;
        if(straight)for(const q of P){const w=[q[0]-a[0],q[1]-a[1],q[2]-a[2]];const c=[w[1]*d[2]-w[2]*d[1],w[2]*d[0]-w[0]*d[2],w[0]*d[1]-w[1]*d[0]];if(Math.hypot(...c)/L>0.01){straight=false;break;}}
        if(straight){dir=d.map(q=>q/L);what='arête';}
      }
    }
    if(!dir&&h){
      let G=null;try{G=occFaceGeom(h.object,h.faceIndex);}catch(err){}
      if(G&&G.kind==='cyl'&&G.axis){dir=[G.axis.x,G.axis.y,G.axis.z];what='axe du cylindre';}
      else if(h.face&&h.face.normal){const v=h.face.normal.clone().transformDirection(h.object.matrixWorld);dir=[v.x,v.y,v.z];what='normale de la face';}
    }
  }catch(err){}
  if(!dir){try{faceEl.textContent='Axe du posage : rien de reconnu ici — cliquez une face ou une arête droite.';}catch(e){}return;}
  if(op){const P=faoFrame(setup);if(!P.id)dir=faoRotF(P,dir);}
  // direction alignée sur un axe du repère d'origine : on garde son nom (plus lisible)
  const r=dir.map(q=>Math.abs(q)<1e-9?0:Math.round(q*1e9)/1e9);
  let v=r;for(const k in FAO_AX){const a=FAO_AX[k];if(Math.abs(a[0]-r[0])<1e-7&&Math.abs(a[1]-r[1])<1e-7&&Math.abs(a[2]-r[2])<1e-7){v=k;break;}}
  const own=op||setup; // cible : l'opération ou le posage
  faoSnapshot('axe '+t.which.toUpperCase()+(op?' de l’opération':' du posage'));
  const apply=function(){
    own.frame=Object.assign({},own.frame||{});
    own.frame[t.which]=v;
    if(t.which==='z'){own.frame.flipZ=false;faoFrameFixX(own);}else own.frame.flipX=false;
    if(op)delete own.frame.o; // centre commun avec le posage (Fusion 360)
  };
  // opération : la face cliquée donne la HAUTEUR de travail (cote le long du nouveau Z)
  let hitF=null;if(op&&t.which==='z'&&hitP){const P=faoFrame(setup);hitF=faoToF(P,hitP);}
  if(op)faoOpFrameEdit(setup,op,apply,hitF);else apply();
  faoFramePick=null;try{renderer.domElement.style.cursor='default';}catch(e){}
  faoStock();faoChanged();
  try{faceEl.textContent='Axe '+t.which.toUpperCase()+(op?' de l’opération':' du posage')+' = '+what+' '+faoFrameLabel(v)+(faoFrame(own).warn?' — '+faoFrame(own).warn:'')+'. Parcours à régénérer.';}catch(e){}
  try{renderProps();}catch(e){}
}
function faoFrameRows(p,setup){
  // Fiche posage : orientation du repère (absolu pour toutes ses opérations)
  p.appendChild(faoH('Repère du posage'));
  const f=setup.frame||{};
  const row=(which,lab,flipKey)=>{
    const r=faoRow();
    r.appendChild(faoLab(lab));
    const cur=f[which];
    const opts=Object.keys(FAO_AX).map(k=>[k,k]);
    const isFace=Array.isArray(cur);
    if(isFace)opts.push(['face',faoFrameLabel(cur)]);
    r.appendChild(faoSel(opts,isFace?'face':(typeof cur==='string'&&FAO_AX[cur]?cur:(which==='z'?'+Z':'+X')),function(v){
      if(v==='face')return;
      setup.frame=Object.assign({},setup.frame||{});setup.frame[which]=v;if(which==='z')faoFrameFixX(setup);faoStock();
    },'Direction de l’axe '+lab+' du posage, prise sur un axe du repère d’origine.'));
    r.appendChild(faoMini('Face / arête',function(){ faoFramePickStart(setup.id,which); },
      'Cliquez dans la vue : face plane = sa normale sortante, face cylindrique = son axe, arête droite = sa direction.'));
    const cb=document.createElement('input');cb.type='checkbox';cb.checked=!!f[flipKey];
    cb.onchange=function(){ faoSnapshot('inverser '+lab); setup.frame=Object.assign({},setup.frame||{}); setup.frame[flipKey]=cb.checked; faoStock(); faoChanged(); try{renderProps();}catch(e){} };
    const lb=document.createElement('label');lb.className='fao-check';lb.appendChild(cb);lb.appendChild(document.createTextNode('Inverser'));
    r.appendChild(lb);
    p.appendChild(r);
  };
  row('z','Axe Z','flipZ');
  row('x','Axe X','flipX');
  faoFrameRotRow(p,f,function(fn){ setup.frame=Object.assign({},setup.frame||{}); fn(setup.frame); faoStock(); },'du posage');
  const F=faoFrame(setup);
  const n=document.createElement('div');n.className='fao-help';
  n.textContent=(F.id?'Repère du posage = repère de la pièce. ':'Repère orienté : Z posage = ('+F.Z.map(q=>q.toFixed(3)).join(', ')+'). ')+
    (F.warn?'⚠ '+F.warn+'. ':'')+'Toutes les opérations du posage sont calculées dans ce repère (outil le long de son Z) ; le G-code est relatif à son origine.';
  p.appendChild(n);
  if(faoFramePick&&faoFramePick.setupId===setup.id){
    const w=document.createElement('div');w.className='fao-alert';w.textContent='Cliquez une face ou une arête dans la vue pour l’axe '+faoFramePick.which.toUpperCase()+' (Échap annule).';
    p.appendChild(w);
  }
}
// Ligne « Rotation autour de [X+|X−] [angle°] » — edit(fn) applique la modif.
function faoFrameRotRow(p,f,edit,lab){
  const r=faoRow();
  r.appendChild(faoLab('Rotation autour de'));
  r.appendChild(faoSel([['+X','X+'],['-X','X−']],f.rxAx==='-X'?'-X':'+X',function(v){
    edit(function(fr){ if(v==='-X')fr.rxAx='-X'; else delete fr.rxAx; });
  },'Axe de rotation : X du repère '+lab+' (X+ : sens direct, Y vers Z ; X− : sens inverse).'));
  r.appendChild(faoNum(isFinite(+f.rx)?+f.rx:0,function(v){
    edit(function(fr){ if(isFinite(v)&&Math.abs(v)>1e-9)fr.rx=+v; else delete fr.rx; });
  },52,0.25,'Angle de rotation du repère '+lab+' autour de son axe X (degrés), appliqué après le choix des axes Z et X.'));
  r.appendChild(faoLab('°'));
  p.appendChild(r);
}
function faoFrameFixX(setup){
  // Après un changement de Z : si X lui est (presque) parallèle, on prend l'axe du repère
  // d'origine le moins aligné avec Z (+X, sinon +Y) — la fiche affiche alors le vrai X.
  const f=setup.frame=Object.assign({},setup.frame||{});
  let Z=faoV(f.z)||[0,0,1];if(f.flipZ)Z=Z.map(q=>-q);
  let X=faoV(f.x)||[1,0,0];
  if(Math.abs(X[0]*Z[0]+X[1]*Z[1]+X[2]*Z[2])<0.999)return;
  const c=['+X','+Y','+Z'].map(k=>[k,Math.abs(FAO_AX[k][0]*Z[0]+FAO_AX[k][1]*Z[1]+FAO_AX[k][2]*Z[2])]).sort((a,b)=>a[1]-b[1]+(a[1]===b[1]?0:0))[0][0];
  f.x=c;f.flipX=false;
}
/* ---------- Repère PROPRE d'une opération (2026-10-16-020) ----------
   op.frame = {z, x, flipZ, flipX} exprimé dans le repère du POSAGE (±X… = axes du posage, ou
   direction de face/arête cliquée ramenée dans le posage). Absent = repère du posage.
   L'opération est calculée dans son repère (outil le long de son Z : maillage, brut, plans,
   arêtes, trous y sont ramenés), puis ses mouvements sont ré-exprimés dans le repère du posage
   (arcs linéarisés). G-code : orientation de l'outil par B/C (3+2) avant l'opération. */
let faoFrameCur=null; // repère (monde) de l'opération en cours de calcul — trous détectés dedans
function faoOpFrameOf(setupId,opId){try{const s=faoSetup(setupId);const op=(s.ops||[]).filter(o=>o.id===opId)[0];return (op&&faoOpFrame(s,op))||faoFrame(s);}catch(e){return faoFrame(null);}}
function faoOpFrame(job,op){
  // repère composé (directions MONDE) de l'opération ; null si = repère du posage
  if(!op||!op.frame)return null;
  // 2026-10-16-020 (Fusion 360) : centre COMMUN avec le posage — seuls les axes suivent les faces
  const Og=faoOriginPoint(job);
  const R=faoFrame({frame:Object.assign({},op.frame,{o:Og})});
  if(R.id)return null;
  const P=faoFrame(job);
  // origine de l'opération (repère posage) → monde
  return {X:faoRotW(P,R.X),Y:faoRotW(P,R.Y),Z:faoRotW(P,R.Z),O:faoToW(P,R.O),id:false,rel:R,P:P};
}
function faoOpBC(job,op){
  // angles B/C (table C+B) qui amènent le Z de l'opération (repère posage) sur l'axe outil
  const fr=faoOpFrame(job,op);if(!fr)return null;
  const o=faoOrientFromNormal(fr.rel.Z[0],fr.rel.Z[1],fr.rel.Z[2]);
  return {b:o.b,c:o.c,down:o.down};
}
let faoOpJobMemo=new WeakMap();
function faoOpJob(job,op,fr){
  // posage « vu » dans le repère de l'opération : même posage, autre repère, brut ramené.
  // Mémorisé par opération (clé de cache, contrôles « à jour ? » : appelé souvent).
  let sig=null;
  try{sig=JSON.stringify([fr.X,fr.Y,fr.Z,fr.O,op.z,op.ztop,job.stock,job.marge,faoBodyGen,job.bodies||null]);
    const m=faoOpJobMemo.get(op);if(m&&m.job===job&&m.sig===sig)return m.jo;}catch(e){sig=null;}
  const jo=faoOpJob0(job,op,fr);
  if(sig!==null)try{faoOpJobMemo.set(op,{job:job,sig:sig,jo:jo});}catch(e){}
  return jo;
}
function faoOpJob0(job,op,fr){
  const jo=Object.create(job);
  Object.defineProperty(jo,'__opJob',{value:op,enumerable:false}); // posage vu par CETTE opération
  jo.frame={z:fr.Z.slice(),x:fr.X.slice(),o:fr.O.slice()};
  jo.originZero=true; // coordonnées de l'opération : Z0 = son origine (= celle du posage)
  try{
    const s=job.stock;
    if(faoStockValid(s)){
      const C=[];[s.x0,s.x1].forEach(x=>[s.y0,s.y1].forEach(y=>[s.z0,s.z1].forEach(z=>C.push(faoToF(fr,faoToW(fr.P,[x,y,z]))))));
      const B=faoBoxOfVerts(C);
      jo.stock={x0:B.x0,y0:B.y0,z0:B.z0,x1:B.x1,y1:B.y1,z1:B.z1};
      // emprise XY = la matière du MODÈLE sur / au-dessus du plan Z0 de l'opération (la face
      // cliquée) — pas la boîte du brut vue en biais, qui ferait usiner surtout dans le vide
      try{
        const am=faoActiveMesh(jo);
        if(am&&am.mesh&&am.mesh.v.length){
          const zr=(op.z!==''&&op.z!==undefined&&isFinite(+op.z))?+op.z:((op.ztop!==''&&op.ztop!==undefined&&isFinite(+op.ztop))?+op.ztop:null);
          const up=zr===null?[]:am.mesh.v.filter(p=>p[2]>=zr-0.01);
          if(up.length>=3){
            const U=faoBoxOfVerts(up),m=+(job.marge)>=0?+job.marge:0;
            const nb={x0:Math.max(B.x0,U.x0-m),y0:Math.max(B.y0,U.y0-m),x1:Math.min(B.x1,U.x1+m),y1:Math.min(B.y1,U.y1+m)};
            if(nb.x1>nb.x0&&nb.y1>nb.y0)Object.assign(jo.stock,nb);
          }
        }
      }catch(e){}
    }
  }catch(e){}
  return jo;
}
function faoOpView(setup,op){
  // posage VU par l'opération : repère propre (3+2) → brut et maillage dans SES coordonnées ;
  // sinon le posage lui-même. Pour les valeurs automatiques des fiches (hauteurs, rectangles).
  try{const fr=faoOpFrame(setup,op);return fr?faoOpJob(setup,op,fr):setup;}catch(e){return setup;}
}
function faoOpMatrix(setup,op){
  // matrice THREE repère opération → repère posage (null = repère du posage) : dessins de saisie
  try{const fr=faoOpFrame(setup,op);if(!fr||typeof THREE==='undefined')return null;
    const Pw=fr.P,o=faoToF(Pw,fr.O),x=faoRotF(Pw,fr.X),y=faoRotF(Pw,fr.Y),z=faoRotF(Pw,fr.Z);
    const m=new THREE.Matrix4();m.makeBasis(new THREE.Vector3(...x),new THREE.Vector3(...y),new THREE.Vector3(...z));m.setPosition(o[0],o[1],o[2]);return m;}catch(e){return null;}
}
function faoPtOpToPos(fr,p){return faoToF(fr.P,faoToW(fr,p));}
function faoMovesOpToPos(mv,fr){
  // mouvements repère opération → repère posage ; arcs (plan XY de l'opération) linéarisés
  if(!Array.isArray(mv))return mv;
  const out=[];let prev=null;
  for(const m of mv){
    if(!m||!isFinite(+m.x)){out.push(m);continue;}
    if(m.arc&&prev){
      const cx=prev.x+(+m.arc.i||0),cy=prev.y+(+m.arc.j||0);
      let a0=Math.atan2(prev.y-cy,prev.x-cx),a1=Math.atan2(m.y-cy,m.x-cx);
      const R=Math.hypot(prev.x-cx,prev.y-cy);
      if(m.arc.cw){while(a1>a0-1e-12)a1-=2*Math.PI;}else{while(a1<a0+1e-12)a1+=2*Math.PI;}
      const n=Math.max(2,Math.min(180,Math.ceil(Math.abs(a1-a0)*Math.max(R,0.1)/0.2)));
      for(let k=1;k<=n;k++){
        const t=k/n,a=a0+(a1-a0)*t,z=prev.z+(m.z-prev.z)*t;
        const q=k===n?[m.x,m.y,m.z]:[cx+R*Math.cos(a),cy+R*Math.sin(a),z];
        const w=faoPtOpToPos(fr,q);const o=Object.assign({},m);delete o.arc;o.x=w[0];o.y=w[1];o.z=w[2];out.push(o);
      }
    }else{
      const w=faoPtOpToPos(fr,[+m.x,+m.y,+m.z]);const o=Object.assign({},m);o.x=w[0];o.y=w[1];o.z=w[2];out.push(o);
    }
    prev=m;
  }
  for(const k in mv)if(!/^\d+$/.test(k))out[k]=mv[k]; // diag, etc.
  out.opFrame=true;
  return out;
}
function faoSeqSafeOp(job,op,fr,mv,prev){
  // Rapides d'une opération au repère propre (3+2), mouvements en repère posage :
  //  - entre deux points : retrait / translation / plongée au plan de dégagement de
  //    l'opération, le long de SON Z (plus de remontée selon le Z du posage) ;
  //  - entrée : au plan de sécurité du posage au-dessus du point d'entrée, puis le long
  //    du Z de l'opération depuis son plan de retrait ;
  //  - sortie : le long du Z de l'opération jusqu'à son plan de retrait, puis au plan du posage.
  const jo=faoOpJob(job,op,fr),safeO=faoClearAbs(op,jo);
  const retrO=Math.max(safeO,faoRetractAbs(op,jo)); // entrée / sortie : jusqu'au plan de RETRAIT de l'opération
  const hop=faoClearAbs(null,job);
  const toO=function(p){const q=faoToF(fr,faoToW(fr.P,[+p.x,+p.y,+p.z]));return {r:p.r?1:0,x:q[0],y:q[1],z:q[2]};};
  const toP=function(p){const w=faoPtOpToPos(fr,[p.x,p.y,p.z]);return {r:1,x:w[0],y:w[1],z:w[2]};};
  const out=[];
  const put=function(J){const l=out.length?out[out.length-1]:prev;
    if(l&&Math.abs(l.x-J.x)<1e-9&&Math.abs(l.y-J.y)<1e-9&&Math.abs(l.z-J.z)<1e-9)return;out.push(J);};
  let pO=null;
  for(let i=0;i<mv.length;i++){
    const m=mv[i];
    if(!m||!isFinite(+m.x)){out.push(m);continue;}
    const mO=toO(m);
    if(!pO){
      const e=toP({x:mO.x,y:mO.y,z:Math.max(mO.z,retrO)});
      const zh=Math.max(hop,e.z,prev?+prev.z:-Infinity);
      if(prev)put({r:1,x:prev.x,y:prev.y,z:zh});
      put({r:1,x:e.x,y:e.y,z:zh});put(e);
    }else{
      const ins=faoSafeAhead(pO,mO,safeO);
      if(ins)ins.forEach(function(J){put(toP(J));});
    }
    out.push(m);pO=mO;
  }
  if(pO){
    const e=toP({x:pO.x,y:pO.y,z:Math.max(pO.z,retrO)});put(e);
    put({r:1,x:e.x,y:e.y,z:Math.max(hop,e.z)});
  }
  return {out:out,prev:out.length?out[out.length-1]:prev};
}
function* faoOpMovesIt(op,job){
  const fr=faoOpFrame(job,op);
  if(!fr)return yield* faoOpMovesIt0(op,job);
  const jo=faoOpJob(job,op,fr);
  const it=faoOpMovesIt0(op,jo);
  const step=()=>{const k=faoFrameCur;faoFrameCur=fr;try{return it.next();}finally{faoFrameCur=k;}};
  let r=step();
  while(!r.done){
    const v=r.value;
    yield (Array.isArray(v)&&v.length&&v[0]&&isFinite(+v[0].x))?faoMovesOpToPos(v,fr):v;
    r=step();
  }
  return faoMovesOpToPos(r.value,fr);
}
function faoOpFrameRows(d,setup,op){
  d.appendChild(faoH('Repère de l’opération'));
  const own=!!op.frame;
  const r0=faoRow();
  r0.appendChild(faoLab('Repère'));
  r0.appendChild(faoSel([['pos','Celui du posage'],['own','Propre (3+2)']],own?'own':'pos',function(v){
    faoOpFrameEdit(setup,op,function(){ if(v==='own'){ if(!op.frame)op.frame={z:'+Z',x:'+X'}; } else delete op.frame; });
    try{renderProps();}catch(e){}
  },'Par défaut l’opération travaille dans le repère du posage. « Propre » : l’outil est orienté selon le Z choisi (indexation 3+2).'));
  d.appendChild(r0);
  if(!own){d.appendChild(faoHelp('Repère du posage : outil le long de son Z, G-code relatif à son origine.'));return;}
  const f=op.frame;
  const row=(which,lab,flipKey)=>{
    const r=faoRow();r.appendChild(faoLab(lab));
    const cur=f[which],isFace=Array.isArray(cur);
    const opts=Object.keys(FAO_AX).map(k=>[k,k+' posage']);
    if(isFace)opts.push(['face',faoFrameLabel(cur)]);
    r.appendChild(faoSel(opts,isFace?'face':(typeof cur==='string'&&FAO_AX[cur]?cur:(which==='z'?'+Z':'+X')),function(v){
      if(v==='face')return;faoOpFrameEdit(setup,op,function(){op.frame=Object.assign({},op.frame||{});op.frame[which]=v;if(which==='z')faoFrameFixX(op);});
    },'Axe '+lab+' de l’opération, pris sur un axe du repère du POSAGE.'));
    r.appendChild(faoMini('Face / arête',function(){ faoFramePickStart(setup.id,which,op.id); },
      'Cliquez dans la vue : face plane = sa normale sortante, face cylindrique = son axe, arête droite = sa direction.'));
    const cb=document.createElement('input');cb.type='checkbox';cb.checked=!!f[flipKey];
    cb.onchange=function(){ faoSnapshot('inverser '+lab); faoOpFrameEdit(setup,op,function(){op.frame=Object.assign({},op.frame||{}); op.frame[flipKey]=cb.checked;}); faoChanged(); try{renderProps();}catch(e){} };
    const lb=document.createElement('label');lb.className='fao-check';lb.appendChild(cb);lb.appendChild(document.createTextNode('Inverser'));
    r.appendChild(lb);d.appendChild(r);
  };
  row('z','Axe Z','flipZ');row('x','Axe X','flipX');
  faoFrameRotRow(d,f,function(fn){ faoOpFrameEdit(setup,op,function(){ op.frame=Object.assign({},op.frame||{}); fn(op.frame); }); },'de l’opération');
  const BC=faoOpBC(setup,op),F=faoFrame({frame:op.frame});
  const n=document.createElement('div');n.className=(BC&&BC.down)?'fao-alert':'fao-help';
  n.textContent=(BC?('Orientation outil : B '+BC.b+'° · C '+BC.c+'° (table C+B) — vérifiez les sens de rotation de votre machine. '):'Même orientation que le posage. ')+
    (BC&&BC.down?'⚠ Z tourné vers le bas : pièce à retourner. ':'')+(F.warn?'⚠ '+F.warn+'. ':'')+
    'Calcul dans ce repère ; G-code en coordonnées du posage, outil orienté (TRAORI).';
  d.appendChild(n);
}
function faoOpTopZ(setup,op){
  // dessus du brut vu dans le repère de l'opération (sinon du posage)
  try{const fr=faoOpFrame(setup,op);const st=fr?faoOpJob(setup,op,fr).stock:setup.stock;return (st&&isFinite(+st.z1))?+st.z1:null;}catch(e){return null;}
}
function faoOpFrameEdit(setup,op,fn,onFace){
  let fr0=null,zr=0;try{fr0=faoOpFrame(setup,op);zr=isFinite(+op.zbot)?+op.zbot:0;}catch(e){}
  faoOpFrameEdit0(setup,op,fn,onFace);
  // la géométrie déjà choisie (zones, rectangles, ancres, points) suit le NOUVEAU repère
  try{faoOpGeomRemap(setup,op,fr0,faoOpFrame(setup,op),zr);}catch(e){}
  // perçage « trous du modèle » : les trous choisis se retrouvent dans le NOUVEAU repère
  if(op&&op.type==='drill'){try{faoDrillResolve(op);}catch(e){}}
}
function faoOpGeomRemap(setup,op,fr0,fr1,zr){
  // Coordonnées de l'opération : ancien repère → monde → nouveau (null = repère du posage).
  // Boucles et rectangles sont plans (XY de l'opération) : pris à la cote zr. Z changé : ils
  // ne sont plus dans le plan de travail → zone « à revoir » (⚠).
  if(!op||(!fr0&&!fr1))return;
  const P=faoFrame(setup);
  const M=function(p){const w=fr0?faoToW(fr0,p):faoToW(P,p);return fr1?faoToF(fr1,w):faoToF(P,w);};
  const r6=function(v){return Math.round(v*1e6)/1e6;};
  const Z0=fr0?fr0.Z:faoRotW(P,[0,0,1]),Z1=fr1?fr1.Z:faoRotW(P,[0,0,1]);
  const zSame=Math.abs(Z0[0]*Z1[0]+Z0[1]*Z1[1]+Z0[2]*Z1[2])>0.9999;
  const xy=function(q){const m=M([+q[0],+q[1],zr]);return [r6(m[0]),r6(m[1])];};
  const rect=function(o){if(![o.x0,o.y0,o.x1,o.y1].every(function(v){return isFinite(+v);}))return;
    const c=[[o.x0,o.y0],[o.x1,o.y0],[o.x1,o.y1],[o.x0,o.y1]].map(xy);
    o.x0=Math.min.apply(null,c.map(function(q){return q[0];}));o.x1=Math.max.apply(null,c.map(function(q){return q[0];}));
    o.y0=Math.min.apply(null,c.map(function(q){return q[1];}));o.y1=Math.max.apply(null,c.map(function(q){return q[1];}));};
  const anc=function(A){(A||[]).forEach(function(a){if(a&&Array.isArray(a.m)&&a.m.length===3){const m=M(a.m.map(Number));a.m=[r6(m[0]),r6(m[1]),r6(m[2])];}});};
  [op.limit,op.limit2].forEach(function(L){
    if(!L||typeof L!=='object')return;
    if(Array.isArray(L.loop)&&L.loop.length)L.loop=L.loop.map(xy);
    if(L.mode==='rect')rect(L);
    anc(L.anchors);
    if(!zSame&&L.mode!=='all'&&((L.loop||[]).length||L.mode==='rect'))L.stale=true;
  });
  if(op.zlim)anc(op.zlim.anchors);
  if(op.type==='pocket'||op.type==='contour')rect(op);
  if(Array.isArray(op.pts)&&op.pts.length)op.pts=op.pts.map(xy);
}
function faoOpFrameEdit0(setup,op,fn,onFace){
  // change le repère de l'opération en gardant ses hauteurs RELATIVES au dessus du brut ;
  // repère posé sur une face (onFace) : la face devient le dessus (Z0)
  if(onFace){ // onFace = point cliqué (repère posage) : sa cote le long du Z de l'opération = hauteur de travail
    const d=(isFinite(+op.ztop)&&isFinite(+op.zbot))?(+op.ztop)-(+op.zbot):null;
    fn();
    const fr=faoOpFrame(setup,op);
    const zf=fr?Math.round(faoToF(fr,faoToW(fr.P,onFace))[2]*1e4)/1e4:0;
    if(op.z!==undefined&&op.z!=='')op.z=zf;
    if(d!==null){op.ztop=zf;op.zbot=Math.round((zf-d)*1e4)/1e4;}
    return;
  }
  const t0=faoOpTopZ(setup,op);
  fn();
  const t1=faoOpTopZ(setup,op);
  if(t0!=null&&t1!=null&&Math.abs(t1-t0)>1e-9)['z','ztop','zbot'].forEach(k=>{if(op[k]!==undefined&&op[k]!==''&&isFinite(+op[k]))op[k]=Math.round((+op[k]+t1-t0)*1e4)/1e4;});
}
/* ---------- Cotes des fiches RELATIVES à l'origine du posage (2026-10-16-020) ----------
   Le repère du posage est LE repère d'usinage : Z0 = son origine (point cardinal), pas le Z de
   la pièce. Les champs (Z, Haut, Bas, rectangles…) affichent et reçoivent des cotes relatives à
   cette origine ; le document garde ses valeurs internes (pas de migration, parcours inchangés).
   Opération à repère propre : ses cotes sont déjà relatives à SON origine (face cliquée). */
function faoOffOf(op){
  try{
    const s=(op&&typeof faoSetupOfOp==='function'&&faoSetupOfOp(op))||faoSetup();
    if(op&&faoOpFrame(s,op))return [0,0,0];
    return faoOriginPoint(s);
  }catch(e){return [0,0,0];}
}
function faoDsp(op,v,i){
  if(v===''||v===null||v===undefined||!isFinite(+v))return v;
  return Math.round((+v-faoOffOf(op)[i])*1e4)/1e4;
}
function faoInp(op,v,i){
  if(v===''||v===null||v===undefined||!isFinite(+v))return v;
  return Math.round((+v+faoOffOf(op)[i])*1e6)/1e6;
}
/* ---------- Simulation : outil INCLINÉ (opération 3+2) (2026-10-16-021, revu V0.7.6) ----------
   La matière simulée est une Z-map (une hauteur par colonne, vue du Z du posage) doublée de
   voxels. Un outil incliné est un cylindre (bout plat, corps illimité le long de son axe) : pour
   chaque colonne, la verticale coupe le volume balayé en intervalles de Z. Les voxels de ces
   intervalles meurent ; la hauteur de la colonne ne descend QUE si la coupe débouche sur son
   dessus (chanfrein, dressage incliné). Un trou sur la tranche reste donc dans la matière,
   sans « cheminée » verticale jusqu'au-dessus du brut. */
function faoTiltColIv(px,py,S,A,r,H,out){
  // intervalle de Z où la verticale (px,py) traverse le cylindre {S + h·A + ρ, 0≤h≤H, |ρ|≤r}
  const wx=px-S[0],wy=py-S[1],wz=-S[2];
  const wa=wx*A[0]+wy*A[1]+wz*A[2];
  const p=[wx-wa*A[0],wy-wa*A[1],wz-wa*A[2]],q=[-A[2]*A[0],-A[2]*A[1],1-A[2]*A[2]];
  const qq=q[0]*q[0]+q[1]*q[1]+q[2]*q[2],pq=p[0]*q[0]+p[1]*q[1]+p[2]*q[2],pp=p[0]*p[0]+p[1]*p[1]+p[2]*p[2]-r*r;
  let lo=-Infinity,hi=Infinity;
  if(qq<1e-12){ if(pp>0)return; }
  else{ const D=pq*pq-qq*pp;if(D<0)return;const sD=Math.sqrt(D);lo=(-pq-sD)/qq;hi=(-pq+sD)/qq; }
  if(Math.abs(A[2])>1e-12){ let z1=(0-wa)/A[2],z2=(H-wa)/A[2];if(z1>z2){const x=z1;z1=z2;z2=x;}lo=Math.max(lo,z1);hi=Math.min(hi,z2); }
  else if(wa<0||wa>H)return;
  if(hi>lo)out.push([lo,hi]);
}
function faoMatterCarveTilt(g,a,b,r,ax,outCols,tp){
  // tp (faoToolTipProfile) : pointe de foret / foret à centrer — sans lui, le corps entier
  // taillait à plat : un pointage sur la tranche creusait un cratère au Ø du corps.
  const out=[];
  try{
    let A=ax.slice();const L=Math.hypot(A[0],A[1],A[2])||1;A=A.map(q=>q/L);
    const pz=g.pz||g.pas;
    const H=Math.hypot(g.nx*g.pas,g.ny*g.pas,g.nz*pz)+2*r; // corps : traverse toute la grille
    // échantillons du bout le long du segment ; plongée le long de l'axe : le bout le plus profond suffit
    const d=[b.x-a.x,b.y-a.y,b.z-a.z],dl=Math.hypot(d[0],d[1],d[2]);
    const da=dl>1e-12?(d[0]*A[0]+d[1]*A[1]+d[2]*A[2])/dl:1;
    let S=[];
    if(dl<1e-9||Math.abs(Math.abs(da)-1)<1e-9)S=[da>=0?[a.x,a.y,a.z]:[b.x,b.y,b.z]];
    else{const n=Math.max(1,Math.min(400,Math.ceil(dl/Math.max(0.05,(+g.pas||0.5)*0.5))));
      for(let s=0;s<=n;s++){const f=s/n;S.push([a.x+d[0]*f,a.y+d[1]*f,a.z+d[2]*f]);}}
    // emprise : bouts ± r, plus le corps le long de A
    let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;
    [[a.x,a.y,a.z],[b.x,b.y,b.z]].forEach(function(P){[0,H].forEach(function(h){
      const X=P[0]+A[0]*h,Y=P[1]+A[1]*h;x0=Math.min(x0,X);x1=Math.max(x1,X);y0=Math.min(y0,Y);y1=Math.max(y1,Y);});});
    x0-=r;x1+=r;y0-=r;y1+=r;
    const i0=Math.max(0,Math.floor((x0-g.ox)/g.pas)),i1=Math.min(g.nx-1,Math.floor((x1-g.ox)/g.pas));
    const j0=Math.max(0,Math.floor((y0-g.oy)/g.pas)),j1=Math.min(g.ny-1,Math.floor((y1-g.oy)/g.pas));
    const zTop=g.oz+g.nz*pz;
    // pointe : pile de disques (rayon ρ, à partir de la hauteur tipZ(ρ) depuis la pointe)
    let discs=[[r,0]];
    if(tp&&tp.length>1){
      const rs=new Set();for(let q=1;q<=6;q++)rs.add(r*q/6);
      tp.forEach(function(p){if(p[0]>0&&p[0]<=r+1e-9)rs.add(+p[0]);});
      discs=Array.from(rs).sort(function(u,v){return u-v;}).map(function(rho){return [rho,faoTipZAt(tp,rho)];});
    }
    for(let j=j0;j<=j1;j++){
      const py=g.oy+(j+0.5)*g.pas;
      for(let i=i0;i<=i1;i++){
        const px=g.ox+(i+0.5)*g.pas,c=j*g.nx+i;
        const iv=[];
        for(let s=0;s<S.length;s++)for(let q=0;q<discs.length;q++){const D=discs[q];
          faoTiltColIv(px,py,[S[s][0]+A[0]*D[1],S[s][1]+A[1]*D[1],S[s][2]+A[2]*D[1]],A,D[0],H-D[1],iv);}
        if(!iv.length)continue;
        iv.sort(function(u,v){return u[0]-v[0];});
        const m=[iv[0].slice()];
        for(let n=1;n<iv.length;n++){const l=m[m.length-1];if(iv[n][0]<=l[1]+1e-9)l[1]=Math.max(l[1],iv[n][1]);else m.push(iv[n].slice());}
        if(m[m.length-1][1]<g.oz||m[0][0]>zTop)continue;
        let touched=false;
        m.forEach(function(I){
          const k0=Math.max(0,Math.ceil((I[0]-g.oz)/pz-0.5)),k1=Math.min(g.nz-1,Math.floor((I[1]-g.oz)/pz-0.5));
          for(let k=k0;k<=k1;k++){const idx=faoMatterIdx(g,i,j,k);if(g.alive[idx]){g.alive[idx]=0;out.push(idx);touched=true;}}
        });
        // la Z-map descend si un intervalle débouche sur le dessus de la colonne ; outil plutôt
        // vertical (≤ 60°) : le surplomb au-dessus du corps (non représentable) est aussi enlevé
        if(g.h){const h0=g.h[c];
          for(let n=m.length-1;n>=0;n--){const I=m[n];
            if((I[1]>=h0-1e-6||A[2]>=0.5)&&I[0]<h0){const z=Math.max(g.oz,I[0]);if(z<g.h[c]){g.h[c]=z;if(g.hc)g.hc[c]=1;touched=true;}break;}}}
        if(touched&&outCols)outCols.push(c);
      }
    }
  }catch(e){}
  return out;
}
