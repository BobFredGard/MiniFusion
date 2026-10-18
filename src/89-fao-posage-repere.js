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
    // Espace Modèle (interface moderne, data-ws="cao") : aucun visuel FAO à l'écran —
    // ni brut, ni repère, ni points cardinaux, même si un posage reste sélectionné.
    // Interface classique : pas d'attribut, le visuel suit la sélection comme avant.
    if(document.body.getAttribute('data-ws')==='cao')return null;
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
  if(!setup){if(faoPoseGrp){faoPoseClear();faoPoseSig='';if(faoPoseTriad)faoPoseTriad.visible=false;}return;}
  const st=setup.stock;
  if(!faoStockValid(st)){if(faoPoseGrp)faoPoseClear();faoPoseSig='';return;}
  const spec=faoOriginSpec(setup),O=faoOrient(setup);
  // opération sélectionnée avec son repère propre (3+2) : son repère est dessiné aussi
  let selOp=null;try{if(sel.kind==='faoOp')selOp=(setup.ops||[]).filter(o=>o.id===sel.id)[0]||null;}catch(e){}
  const opF=(selOp&&selOp.frame)?faoFrame({frame:Object.assign({},selOp.frame,{o:null})}):null; // axes seuls : centre commun
  const sig=[setup.id,opF&&!opF.id?opF.X.concat(opF.Z).map(q=>q.toFixed(6)).join(','):'',st.x0,st.y0,st.z0,st.x1,st.y1,st.z1,st.cyl?JSON.stringify(st.cyl):'',faoStockShape(setup),setup.stockBody,spec.pt.join(','),spec.src,O.b,O.c,faoFrameSig(setup),
    (typeof _docVersion!=='undefined'?_docVersion:0),faoPoseHover].join('|');
  if(sig===faoPoseSig&&faoPoseGrp)return;
  faoPoseSig=sig;faoPoseClear();
  const g=new THREE.Group();g.name='faoPose';
  // 2026-10-16-020 : dans une OPÉRATION, ni brut ni points d'accroche — seulement les repères
  let P=null;
  if(!selOp){
  // brut transparent : cylindre, corps (forme réelle) ou boîte
  let drawn=false;
  try{const cy=faoStockCylMesh(st,0xffb340,.13);if(cy){g.add(cy);drawn=true;}}catch(e){}
  if(!drawn&&faoStockShape(setup)==='solid'){
    try{
      const b=(typeof bodies!=='undefined'&&bodies?bodies:[]).filter(x=>x&&x.id===setup.stockBody)[0];
      if(b&&b.mesh){
        const mat=new THREE.MeshBasicMaterial({color:0xffb340,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide});
        const cl=new THREE.Mesh(b.mesh.geometry,mat);cl.applyMatrix4(b.mesh.matrixWorld);
        try{const Fr=faoFrame(setup);if(!Fr.id)cl.applyMatrix4(new THREE.Matrix4().makeBasis(new THREE.Vector3(...Fr.X),new THREE.Vector3(...Fr.Y),new THREE.Vector3(...Fr.Z)).invert());}catch(e){}cl.raycast=()=>{};cl.renderOrder=5;
        cl.userData.shared=true;g.add(cl);drawn=true;
      }
    }catch(e){}
  }
  if(!drawn)try{
    const bg=new THREE.BoxGeometry(st.x1-st.x0,st.y1-st.y0,st.z1-st.z0);
    const box=new THREE.Mesh(bg,new THREE.MeshBasicMaterial({color:0xffb340,transparent:true,opacity:.13,depthWrite:false,side:THREE.DoubleSide}));
    box.position.set((st.x0+st.x1)/2,(st.y0+st.x1)/2,(st.z0+st.z1)/2);box.raycast=()=>{};box.renderOrder=5;g.add(box);
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
  const Y=[Z[1]*X[2]-Z[2]*X[1],Z[2]*X[0]-Z[0]*X[2],Z[0]*X[1]-Z[1]*X[0]];
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
function faoOpJob(job,op,fr){
  // posage « vu » dans le repère de l'opération : même posage, autre repère, brut ramené
  const jo=Object.create(job);
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
/* ---------- Simulation : outil INCLINÉ (opération 3+2) (2026-10-16-021) ----------
   La matière simulée est une Z-map (une hauteur par colonne, vue du Z du posage). Un outil
   incliné n'est plus un cylindre vertical : on balaie son ENVELOPPE INFÉRIEURE — le disque du
   bout (incliné) et les génératrices du corps — par de petits segments verticaux décalés, chacun
   taillé comme un fin cylindre vertical. La matière sous le disque incliné reste intacte. */
function faoMatterCarveTilt(g,a,b,r,ax,outCols){
  const out=[];
  try{
    let A=ax.slice();const L=Math.hypot(A[0],A[1],A[2])||1;A=A.map(q=>q/L);
    const t=Math.abs(A[2])<0.9?[0,0,1]:[1,0,0];
    let u=[A[1]*t[2]-A[2]*t[1],A[2]*t[0]-A[0]*t[2],A[0]*t[1]-A[1]*t[0]];const lu=Math.hypot(...u);u=u.map(q=>q/lu);
    const v=[A[1]*u[2]-A[2]*u[1],A[2]*u[0]-A[0]*u[2],A[0]*u[1]-A[1]*u[0]];
    const pas=Math.max(+g.pas||0.5,r/8),rr=Math.max((+g.pas||0.5)*0.55,pas*0.55);
    const offs=[];
    for(let i=-r;i<=r+1e-9;i+=pas)for(let j=-r;j<=r+1e-9;j+=pas){ // disque du bout
      if(i*i+j*j>r*r)continue;offs.push([u[0]*i+v[0]*j,u[1]*i+v[1]*j,u[2]*i+v[2]*j]);}
    const H=Math.max(4*r,8); // hauteur de corps balayée (au-delà : rarement de la matière)
    for(let k=0;k<16;k++){const c=Math.cos(k*Math.PI/8),s=Math.sin(k*Math.PI/8); // corps
      for(let h=pas;h<=H+1e-9;h+=pas)offs.push([A[0]*h+r*(u[0]*c+v[0]*s),A[1]*h+r*(u[1]*c+v[1]*s),A[2]*h+r*(u[2]*c+v[2]*s)]);}
    // segment EN PENTE (passe qui descend le chanfrein) : la taille d'un segment se fait à sa
    // cote la plus basse — on le découpe en petits pas de hauteur, sinon des marches apparaissent
    const n=Math.max(1,Math.min(400,Math.ceil(Math.abs(b.z-a.z)/Math.max(0.05,(+g.pas||0.5)*0.4))));
    for(let s=0;s<n;s++){
      const t0=s/n,t1=(s+1)/n;
      const ax0=a.x+(b.x-a.x)*t0,ay0=a.y+(b.y-a.y)*t0,az0=a.z+(b.z-a.z)*t0;
      const bx1=a.x+(b.x-a.x)*t1,by1=a.y+(b.y-a.y)*t1,bz1=a.z+(b.z-a.z)*t1;
      for(const o of offs){
        const k=faoMatterCarveSeg(g,ax0+o[0],ay0+o[1],az0+o[2],bx1+o[0],by1+o[1],bz1+o[2],rr,outCols,0);
        for(let m=0;m<k.length;m++)out.push(k[m]);
      }
    }
  }catch(e){}
  return out;
}
