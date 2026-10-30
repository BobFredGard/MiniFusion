/* ---------- coupe : plan X / Y / Z, remplissage des faces coupées ----------
   Repris de viewer_STEP (« Coupe / Section ») et adapté à miniFusion :
   • plan perpendiculaire à X, Y ou Z (Z = hauteur), curseur calé sur l'emprise des corps
     montrés le long de l'axe, saisie au mm (Entrée), côté gardé inversable ;
   • REMPLISSAGE : pour chaque corps, 2 pochoirs stencil (sa géométrie, faces arrière +1 /
     faces avant −1, coupés par le plan, sans couleur ni profondeur) puis une PEAU plane à la
     couleur du corps, posée sur le plan, dessinée seulement là où le compteur ≠ 0 (= dans la
     matière). Corps par corps : stencil effacé avant chaque corps (pas de mélange entre corps,
     ni avec la marque stencil des corps transparents — 20 glassDepthMask) ;
   • clipPlane (00) reste LA référence lue à la création des matériaux : objet unique tant que
     la coupe est active (le curseur ne fait que déplacer le plan, aucune recompilation) ;
   • clipTick (à chaque image, 10 animate) rattrape ce qui naît après applyClip — arêtes
     (buildEdgeOverlay), passes de transparence, corps reconstruits — et suit visibilité /
     couleur des corps. Peaux, pochoirs et plan affiché : noMirror (hors passe reflet).
   Prérequis : maillages fermés (c'est le cas des corps OCCT / CSG) — un maillage ouvert
   donne une peau partielle, jamais d'erreur. */
let clipPlaneObj=null;   // le plan (persistant) ; clipPlane = lui ou null
let clipCaps=[];         // {b, mesh, geo, sB, sF, cap, mat}
let clipHelperObj=null;  // plan affiché (voile + cadre)
let clipRecenter=false;  // changement d'axe : curseur ramené au milieu de l'emprise
const _clipN=new THREE.Vector3(),_clipC=new THREE.Vector3(),_clipZ=new THREE.Vector3(0,0,1),_clipQ=new THREE.Quaternion();
function clipAxis(){const a=(($('clipAxis')||{}).value||'Z').toUpperCase();return a==='X'||a==='Y'?a:'Z';}
function clipBounds(){
  // emprise monde des corps montrés (repli : tous les corps)
  const box=new THREE.Box3();
  try{bodies.forEach(b=>{if(bodyShown(b))box.expandByObject(b.mesh);});
    if(box.isEmpty())bodies.forEach(b=>{if(b&&b.mesh)box.expandByObject(b.mesh);});}catch(e){box.makeEmpty();}
  return box.isEmpty()?null:box;
}
function clipSyncRange(){
  // bornes du curseur = emprise sur l'axe (+3 %) ; valeur hors bornes → milieu
  const sl=$('clipPos'),num=$('clipPosN');if(!sl)return;
  const box=clipBounds(),k=clipAxis().toLowerCase();
  if(box){
    const lo=box.min[k],hi=box.max[k],m=Math.max((hi-lo)*0.03,0.5);
    const a=Math.floor((lo-m)*10)/10,z=Math.ceil((hi+m)*10)/10;
    if(+sl.min!==a||+sl.max!==z){sl.min=a;sl.max=z;}
    const span=z-a;sl.step=span>400?1:span>40?0.1:0.01;
    const v=parseFloat(sl.value);
    if(clipRecenter||!(v>=a&&v<=z))sl.value=((lo+hi)/2).toFixed(2);
  }
  clipRecenter=false;
  if(num){num.min=sl.min;num.max=sl.max;num.step=sl.step;
    if(document.activeElement!==num)num.value=String(Math.round(parseFloat(sl.value)*100)/100);}
}
function clipFromNum(){
  // saisie au mm (Entrée / sortie du champ), bornée à la plage du curseur
  const sl=$('clipPos'),num=$('clipPosN');if(!sl||!num)return;
  let v=parseFloat(String(num.value).replace(',','.'));
  if(!isFinite(v))v=parseFloat(sl.value)||0;
  const lo=parseFloat(sl.min),hi=parseFloat(sl.max);
  if(isFinite(lo)&&isFinite(hi))v=Math.max(lo,Math.min(hi,v));
  sl.value=v;num.value=String(Math.round(v*100)/100);
  applyClip();
}
function clipMatSet(o,cp){
  // un objet (maillage / traits) prend le plan courant — pochoirs exclus (ils gardent le leur)
  if(!o||!o.material||(o.userData&&o.userData.clipStencil))return;
  if(!(o.isMesh||o.isLine||o.isLineSegments))return;
  (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{
    if(!m)return;
    const cur=m.clippingPlanes&&m.clippingPlanes.length?m.clippingPlanes[0]:null;
    if(cur===(cp?cp[0]:null))return;
    m.clippingPlanes=cp;m.clipShadows=!!cp;m.needsUpdate=true;
  });
}
function clipApplyMats(){
  const cp=clipPlane?[clipPlane]:null;
  try{bodies.forEach(b=>{if(b&&b.mesh)b.mesh.traverse(o=>clipMatSet(o,cp));});}catch(e){}
  // traits du modèle hors des corps : arêtes (20) et filets taraudés (76)
  ['edgeOverlay','holeThreads'].forEach(nm=>{try{const ov=scene.getObjectByName(nm);if(ov)ov.traverse(o=>clipMatSet(o,cp));}catch(e){}});
}
function applyClip(){
  const on=!!($('clipOn')&&$('clipOn').checked);
  clipSyncRange();
  if(on){
    const ax=clipAxis(),pos=parseFloat($('clipPos').value)||0,flip=$('clipFlip').checked?-1:1;
    if(!clipPlaneObj)clipPlaneObj=new THREE.Plane(new THREE.Vector3(0,0,-1),0);
    // n = −axe (×−1 si inversé), constante = −n·p0 : même côté gardé que l'ancienne coupe Z
    _clipN.set(ax==='X'?-flip:0,ax==='Y'?-flip:0,ax==='Z'?-flip:0);
    clipPlaneObj.normal.copy(_clipN);clipPlaneObj.constant=flip*pos;
    clipPlane=clipPlaneObj;
  }else clipPlane=null;
  clipApplyMats();
  clipTick();
}
function clipCapsClear(){
  for(const d of clipCaps){
    try{if(d.mesh){d.mesh.remove(d.sB);d.mesh.remove(d.sF);}}catch(e){}
    try{if(d.cap&&d.cap.parent)d.cap.parent.remove(d.cap);}catch(e){}
    try{d.sB.material.dispose();d.sF.material.dispose();d.mat.dispose();d.cap.geometry.dispose();}catch(e){}
  }
  clipCaps=[];
}
function clipCapsBuild(list){
  clipCapsClear();
  list.forEach((b,k)=>{
    const me=b.mesh,order=1000+k; // après tous les corps opaques (0) et transparents (≤ 3)
    const mk=side=>{
      const m=new THREE.MeshBasicMaterial();
      m.depthWrite=false;m.depthTest=false;m.colorWrite=false;
      m.stencilWrite=true;m.stencilFunc=THREE.AlwaysStencilFunc;
      m.side=side;m.clippingPlanes=[clipPlaneObj];
      const op=side===THREE.BackSide?THREE.IncrementWrapStencilOp:THREE.DecrementWrapStencilOp;
      m.stencilFail=op;m.stencilZFail=op;m.stencilZPass=op;
      return m;
    };
    const st=(side,ro)=>{const s=new THREE.Mesh(me.geometry,mk(side));s.renderOrder=ro;s.raycast=()=>{};
      s.name='clipStencil';s.userData.clipStencil=true;s.userData.noMirror=true;s.frustumCulled=me.frustumCulled;me.add(s);return s;};
    const sB=st(THREE.BackSide,order),sF=st(THREE.FrontSide,order+0.1);
    sB.onBeforeRender=r=>{try{r.clearStencil();}catch(e){}}; // compteur à zéro pour CE corps
    const src=Array.isArray(me.material)?me.material[0]:me.material;
    const mat=new THREE.MeshStandardMaterial({color:(src&&src.color)?src.color.getHex():0x9aa3ad,
      metalness:(src&&isFinite(src.metalness))?src.metalness:0.35,roughness:(src&&isFinite(src.roughness))?src.roughness:0.4,
      side:THREE.DoubleSide,stencilWrite:true,stencilRef:0,stencilFunc:THREE.NotEqualStencilFunc,
      stencilFail:THREE.ReplaceStencilOp,stencilZFail:THREE.ReplaceStencilOp,stencilZPass:THREE.ReplaceStencilOp});
    const cap=new THREE.Mesh(new THREE.PlaneGeometry(1,1),mat);
    cap.renderOrder=order+0.2;cap.raycast=()=>{};cap.frustumCulled=false;
    cap.name='clipCap';cap.userData.noMirror=true;
    // cible sans tampon stencil (reflet, projections de plan, captures) : la peau couvrirait
    // tout le plan → rien n'est dessiné
    cap.onBeforeRender=r=>{const rt=r.getRenderTarget();cap.geometry.setDrawRange(0,rt&&!rt.stencilBuffer?0:Infinity);};
    scene.add(cap);
    clipCaps.push({b,mesh:me,geo:me.geometry,sB,sF,cap,mat});
  });
}
function clipShownInScene(o){while(o){if(!o.visible)return false;if(o===scene)return true;o=o.parent;}return false;}
function clipHelperSync(on,box){
  const want=!!(on&&$('clipHelper')&&$('clipHelper').checked);
  if(!want){if(clipHelperObj)clipHelperObj.visible=false;return;}
  if(!clipHelperObj){
    clipHelperObj=new THREE.Group();clipHelperObj.name='clipHelper';clipHelperObj.userData.noMirror=true;
    const g=new THREE.PlaneGeometry(1,1);
    const veil=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0xffd60a,transparent:true,opacity:0.12,side:THREE.DoubleSide,depthWrite:false}));
    const rim=new THREE.LineSegments(new THREE.EdgesGeometry(g),new THREE.LineBasicMaterial({color:0xffd60a}));
    [veil,rim].forEach(o=>{o.raycast=()=>{};o.userData.noMirror=true;clipHelperObj.add(o);});
    scene.add(clipHelperObj);
  }
  if(clipHelperObj.parent!==scene)scene.add(clipHelperObj);
  clipHelperObj.position.copy(_clipC);clipHelperObj.quaternion.copy(_clipQ);
  clipHelperObj.scale.setScalar(box?Math.max(box.getSize(new THREE.Vector3()).length()*0.9,1):100);
  clipHelperObj.visible=true;
}
function clipTick(){
  if(!clipPlane){if(clipCaps.length)clipCapsClear();clipHelperSync(false);return;}
  clipApplyMats(); // arêtes / passes / corps nés après applyClip
  const box=clipBounds();
  // centre du plan = centre de l'emprise projeté sur le plan (pièce loin de l'origine)
  if(box)box.getCenter(_clipC);else _clipC.set(0,0,0);
  _clipC.addScaledVector(clipPlane.normal,-clipPlane.distanceToPoint(_clipC));
  _clipQ.setFromUnitVectors(_clipZ,clipPlane.normal);
  clipHelperSync(true,box);
  const capOn=!!($('clipCap')&&$('clipCap').checked);
  const list=capOn?bodies.filter(b=>b&&!b.ghost&&b.mesh&&b.mesh.isMesh&&b.mesh.geometry):[];
  if(list.length!==clipCaps.length||list.some((b,i)=>clipCaps[i].mesh!==b.mesh||clipCaps[i].geo!==b.mesh.geometry))clipCapsBuild(list);
  const sz=box?Math.max(box.getSize(new THREE.Vector3()).length()*1.5,1):1000;
  for(const d of clipCaps){
    const sv=d.b.visible!==false&&clipShownInScene(d.mesh);
    d.sB.visible=d.sF.visible=sv;d.cap.visible=sv;
    d.cap.position.copy(_clipC);d.cap.quaternion.copy(_clipQ);d.cap.scale.setScalar(sz);
    try{const src=Array.isArray(d.mesh.material)?d.mesh.material[0]:d.mesh.material;if(src&&src.color)d.mat.color.copy(src.color);}catch(e){}
  }
}
