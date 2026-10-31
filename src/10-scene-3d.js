/* ---------- scène façon viewer ---------- */
let mirrorOn=true,mirrorRT=null,mirrorCam=null,mirrorTexMat=null,mirrorU=null,floorMesh=null,axHelper=null,mirrorDirty=true;
let zoomInv=false;
try{const _zi=localStorage.getItem('minifusion_zoominv');if(_zi==='on')zoomInv=true;}catch(e){}
try{const _mo=localStorage.getItem('minifusion_mirror');if(_mo==='off')mirrorOn=false;}catch(e){}
let floorOn=true; // V0.10.0 : case « Sol » (disque du thème) — « Miroir » (mirrorOn) = le reflet seul, indépendant
try{if(localStorage.getItem('minifusion_sol')==='off')floorOn=false;}catch(e){}
// 2026-10-22 : orbite LIBRE (façon Fusion « Free Orbit ») — la pièce tourne dans tous les sens,
// roulis compris ; contrainte (défaut) = le Z de la vue reste en haut de l'écran.
let orbitFree=false,_fo=null,_fz=null,_foMark=null;
try{if(localStorage.getItem('minifusion_orbit')==='libre')orbitFree=true;}catch(e){}
// 2026-10-27 : EFFET DE PERSPECTIVE réglable (⚙ → Perspective) = angle de champ de la caméra 3D,
// 5° (presque orthographique) à 90° (fuyantes marquées) ; 50° par défaut.
let viewFov=50;
try{const _fv=parseFloat(localStorage.getItem('minifusion_fov'));if(_fv>=5&&_fv<=90)viewFov=_fv;}catch(e){}
function makeStudioEnv(){
  // Environnement procédural (reflets PBR) : 6 faces dégradé + boîtes lumineuses. Zéro asset externe.
  function face(draw){const c=document.createElement('canvas');c.width=c.height=256;draw(c.getContext('2d'));return c;}
  function base(ctx,top,mid,bot){const g=ctx.createLinearGradient(0,0,0,256);g.addColorStop(0,top);g.addColorStop(0.55,mid);g.addColorStop(1,bot);ctx.fillStyle=g;ctx.fillRect(0,0,256,256);}
  function softbox(ctx,x,y,w,h){ctx.fillStyle='rgba(255,255,255,0.95)';ctx.fillRect(x,y,w,h);ctx.fillStyle='rgba(255,255,255,0.25)';ctx.fillRect(x-8,y-8,w+16,h+16);}
  const px=face(ctx=>{base(ctx,'#3a3f4a','#6b7484','#17181c');softbox(ctx,60,60,136,60);});
  const nx=face(ctx=>{base(ctx,'#3a3f4a','#6b7484','#17181c');softbox(ctx,60,110,136,60);});
  const py=face(ctx=>{base(ctx,'#f5f7fa','#c9ced6','#8a8f99');});
  const ny=face(ctx=>{base(ctx,'#101114','#17181c','#0a0b0d');});
  const pz=face(ctx=>{base(ctx,'#3a3f4a','#7a8494','#17181c');softbox(ctx,30,70,60,110);softbox(ctx,166,70,60,110);});
  const nz=face(ctx=>{base(ctx,'#33363d','#5d6673','#141518');});
  const tex=new THREE.CubeTexture([px,nx,py,ny,pz,nz]);
  tex.needsUpdate=true;
  return tex;
}
function buildScene(){
  scene=new THREE.Scene(); scene.background=new THREE.Color(0x1c1c1e);
  camera=new THREE.PerspectiveCamera(50,1.5,0.1,5000);
  camSetFov(viewFov,false);
  camera.up.set(0,0,1); // convention CAO : Z vers le haut, Y vers l'arrière, X à droite
  camera.position.set(90,-90,90);
  renderer=new THREE.WebGLRenderer({canvas:$('viewport'),antialias:true,powerPreference:'high-performance'}); // V0.8.8 : carte graphique dédiée (NVIDIA) plutôt que l'intégrée sur un portable hybride
  renderer.localClippingEnabled=true;
  try{
    const dpr=(typeof window!=='undefined'&&window.devicePixelRatio)||1;
    renderer.setPixelRatio(Math.min(2,Math.max(1.25,dpr))); // arêtes nettes sur écran HiDPI
  }catch(e){}
  scene.add(new THREE.HemisphereLight(0xffffff,0x444444,0.75));
  const key=new THREE.DirectionalLight(0xffffff,1.0); key.position.set(60,-40,120); scene.add(key);
  try{if('environment' in scene)scene.environment=makeStudioEnv();}catch(e){} // reflets studio
  // 2026-10-16-017 : repère façon Fusion (point + 3 axes + 3 plans cliquables, taille constante à l'écran)
  axHelper=triadMake({name:'axHelper'}); scene.add(axHelper); scene.add(axHelper.userData.planeGroup); // plans = plans d'origine (œil de l'arbre) // X rouge → droite, Y vert → arrière, Z bleu → haut
  // Sol miroir (réflexion planaire temps réel, fondu radial). Z-up : cercle déjà horizontal.
  // 2026-10-15-003 : hors de la texture du reflet (bords d'écran, vue rapprochée), plus
  // d'échantillonnage étiré par le ClampToEdge (« fuyantes qui cherchent à sortir de la
  // zone 3D ») : pas de reflet hors [0,1], fondu doux sur les 3 % du bord.
  // 2026-10-15-004 : MÊMES RÉGLAGES que viewer_STEP (« le miroir fonctionne à
  // merveille, mets-moi les mêmes ») : reflet net ×0,62, cible 1024×1024, rendu
  // ×1,25 — et SEULS les solides se reflètent (arêtes, trièdre, plans d'origine,
  // trajectoires masqués pendant la passe reflet : c'étaient eux qui scintillaient).
  mirrorRT=new THREE.WebGLRenderTarget(1024,1024);
  mirrorCam=new THREE.PerspectiveCamera();
  mirrorTexMat=new THREE.Matrix4();
  mirrorU={color:{value:new THREE.Color(0x141519)},tDiffuse:{value:mirrorRT.texture},
    textureMatrix:{value:mirrorTexMat},uCenter:{value:new THREE.Vector3()},uRadius:{value:1},
    uDisk:{value:1},uRefl:{value:1},uFade:{value:0},uReflK:{value:0.62}}; // floorSync : Sol, Miroir, bords fondus (ambiance de rendu)
  const fm=new THREE.ShaderMaterial({uniforms:mirrorU,
    vertexShader:'uniform mat4 textureMatrix; varying vec4 vUv; varying vec3 vWorld;\nvoid main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vWorld = wp.xyz; vUv = textureMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader:'uniform vec3 color; uniform sampler2D tDiffuse; uniform vec3 uCenter; uniform float uRadius; uniform float uDisk; uniform float uRefl; uniform float uFade; uniform float uReflK; varying vec4 vUv; varying vec3 vWorld;\nvoid main(){ float d = distance(vWorld, uCenter); float a = uDisk > 0.5 ? (uFade > 0.5 ? 1.0 - smoothstep(uRadius * 1.5, uRadius * 5.0, d) : 1.0) : 0.0; vec3 refl = vec3(0.0); float ra = 0.0; float f = 0.0; if(uRefl > 0.5 && vUv.w > 1e-4){ vec2 uv = vUv.xy / vUv.w; float eg = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)); if(eg > 0.0){ vec4 r4 = texture2D(tDiffuse, uv); refl = r4.rgb; ra = r4.a; f = exp(-pow(d / max(uRadius * 1.15, 1e-3), 2.0) * 2.0) * 0.85 * smoothstep(0.0, 0.03, eg); } } if(uDisk > 0.5){ gl_FragColor = vec4(mix(color, refl * uReflK, clamp(f, 0.0, 0.85) * ra), a); return; } gl_FragColor = vec4(refl, ra * clamp(f, 0.0, 0.85) * 0.55); }'});
  floorMesh=new THREE.Mesh(new THREE.CircleGeometry(400,48),fm);
  floorMesh.name='floor';floorMesh.position.z=-0.5;scene.add(floorMesh);
  try{if(typeof mf3D==='function')mf3D(document.body.getAttribute('data-theme')||'nuit');}catch(e){} // thème (V0.2.1)
  buildOriginPlanes();
  controls=new THREE.OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true; controls.dampingFactor=0.08;
  controls.zoomSpeed=zoomInv?-1:1;
  controls.enableZoom=false; // V0.11.27 : molette = zoom VERS LA SOURIS (orbitZoomWheel), plus vers la cible
  // Souris : rotation = clic GAUCHE enfoncé, roulette (molette) conservée = rotation aussi,
  // déplacement (pan) = clic DROIT enfoncé. Clic court sans glisser = sélection (gardien >6px).
  if(controls.mouseButtons&&THREE.MOUSE){controls.mouseButtons.LEFT=THREE.MOUSE.ROTATE;controls.mouseButtons.MIDDLE=THREE.MOUSE.ROTATE;controls.mouseButtons.RIGHT=THREE.MOUSE.PAN;}
  orbitApplyButtons();orbitWire(renderer.domElement); // rotation : pivot sur la pièce (orbitRotate)
  // Dès que l'utilisateur pilote réellement la caméra (glisser bouton enfoncé / roulette),
  // le re-cadrage automatique du démarrage (occtFinishBoot) ne doit plus lui voler sa vue.
  try{
    renderer.domElement.addEventListener('pointermove',e=>{if(e.buttons)viewUserMoved=true;},{passive:true});
    renderer.domElement.addEventListener('wheel',()=>{viewUserMoved=true;},{passive:true});
  }catch(e){}
  fit(); wirePick(); animate();
  window.addEventListener('resize',fit);
}
function fit(){
  const w=$('vpwrap'); const W=Math.max(320,w.clientWidth),H=Math.max(240,w.clientHeight);
  camera.aspect=W/H; camera.updateProjectionMatrix(); renderer.setSize(W,H);
  // La cible de reflet suit l'aspect du canvas (1024 de large max) : c'est la SEULE
  // combinaison cohérente avec la projection de la caméra miroir. Cible carrée + projection
  // carrée = les bords de l'écran sortent de la texture, et le ClampToEdge de three y étire
  // les pixels du bord en traits déformés.
  // 2026-10-15-004 : cible fixe 1024×1024 comme viewer_STEP (plus de résolution
  // verticale ; la garde [0,1] du shader règle les bords).
  if(mirrorRT)mirrorDirty=true;
  try{viewCenterShift();}catch(e){}
}
/* V0.2.5 : le CENTRE de rotation suit la zone VISIBLE du grand panneau.
   Problème : le pivot d'orbite (cible OrbitControls) se projette au centre du CANVAS ;
   les bandeaux verticaux (arborescence à gauche, barre + panneau FAO à droite en
   classique) couvrent une moitié de l'écran — la pièce paraît excentrée et « fuit »
   quand on orbite. Fix : on décale la PROJECTION (camera.setViewOffset) du récentrage
   d pixels — le pivot se projette alors au milieu de la zone libre, et raycast/mesure/
   reflet suivent (ils passent tous par la matrice projetée, jamais par des NDC bruts).
   viewMidOffset : PURE — mesure les bandes et renvoie {W,H,L,R,d} (d = décalage px,
   positif = contenu à DROITE). Édition d'esquisse : cadre à 0 — la superposition SVG
   (s2w/w2s) et le fondu 3D partagent le même centrage, ne pas les séparer. */
function viewMidOffset(){
  const o={W:0,H:0,L:0,R:0,d:0};
  const w=$('vpwrap');if(!w)return o;
  o.W=w.clientWidth||0;o.H=w.clientHeight||0;
  if(!o.W||!o.H)return o;
  o.R=o.W; // par défaut : zone libre jusqu'au bord droit du canvas
  try{if(typeof skEdit!=='undefined'&&skEdit)return o;}catch(e){}
  try{
    const cr=w.getBoundingClientRect();
    const edge=(el,side)=>{ // bandeau de GAUCHE → cote droite ; bandeau de DROITE → cote gauche
      if(!el)return null;
      const r=el.getBoundingClientRect();
      if(!r||r.width<=1||r.height<=1)return null;
      return side==='l'?r.right-cr.left:r.left-cr.left;
    };
    const mod=!!(document.body&&document.body.classList&&document.body.classList.contains('ui-modern'));
    const ws=mod?document.body.getAttribute('data-ws'):null;
    // Moderne espace FAO : le panneau Usinage vit À GAUCHE (#faoWrap repoussé) ;
    // les fiches posage/opération sont hors canvas (aside.right). Classique :
    // arborescence à gauche, barre + panneau FAO en overlay À DROITE du canvas
    // (#faoWrap garde sa min-width 270 MÊME replié → mesurer ses ENFANTS).
    if(mod&&ws==='fao'){
      const tw=(typeof faoTreeWrapEl!=='undefined'&&faoTreeWrapEl)?faoTreeWrapEl:document.getElementById('faoTreeWrap');
      const v=edge(tw,'l');if(v!=null)o.L=v;
    }else{
      const v=edge(document.getElementById('treeWrap'),'l');if(v!=null)o.L=v;
      const fw=typeof faoTreeWrapEl!=='undefined'?faoTreeWrapEl:null;
      const ab=typeof faoAddBarEl!=='undefined'?faoAddBarEl:document.getElementById('faoAddBar');
      const a=edge(ab,'r'),b2=edge(fw||document.getElementById('faoTreeWrap'),'r');
      const vr=(a!=null&&b2!=null)?Math.min(a,b2):(a!=null?a:b2);
      if(vr!=null)o.R=vr;
    }
  }catch(e){}
  o.d=(o.L+o.R)/2-o.W/2;
  return o;
}
function viewCenterShift(){
  if(!camera)return;
  const o=viewMidOffset();
  if(!o.W||!o.H||Math.abs(o.d)<2){ // seuil 2px : un onglet isolé ne vaut pas un re-projet
    try{if(camera.view&&camera.view.enabled)camera.clearViewOffset();}catch(e){}
    return;
  }
  // offsetX = −d → la frustum se décale de −d : le contenu VA À DROITE de d pixels,
  // l'ancien centre projeté se retrouve au milieu de la zone visible.
  try{if(typeof camera.setViewOffset==='function')camera.setViewOffset(o.W,Math.max(1,o.H),-o.d,0,o.W,Math.max(1,o.H));}catch(e){}
}
const _mn=new THREE.Vector3(0,0,1),_mrwp=new THREE.Vector3(),_mcwp=new THREE.Vector3(),_mview=new THREE.Vector3();
const _mrot=new THREE.Matrix4(),_mlook=new THREE.Vector3(),_mtgt=new THREE.Vector3(),_mcu=new THREE.Vector3();
function updateMirror(){
  // Caméra virtuelle symétrique sous le sol (plan z = floorMesh.z) + matrice de projection reflet.
  if(!mirrorOn||!floorMesh||!mirrorCam)return false;
  _mrwp.copy(floorMesh.position);
  _mcwp.setFromMatrixPosition(camera.matrixWorld);
  _mview.subVectors(_mrwp,_mcwp);
  if(_mview.dot(_mn)>0)return false; // caméra sous le sol : pas de reflet
  _mview.reflect(_mn).negate();
  _mview.add(_mrwp);
  _mrot.extractRotation(camera.matrixWorld);
  _mlook.set(0,0,-1).applyMatrix4(_mrot).add(_mcwp);
  _mtgt.subVectors(_mrwp,_mlook);
  _mtgt.reflect(_mn).negate();
  _mtgt.add(_mrwp);
  mirrorCam.position.copy(_mview);
  // Haut LOCAL de la caméra = (0,1,0) (comme viewer_STEP / Reflector de three). Avec
  // (0,0,1) — le Z-haut du MONDE pris pour un axe local — la caméra miroir partait en
  // roulis : son cadre ne couvrait plus l'écran, le reflet était coupé sur les côtés
  // (« le miroir se déglingue sous les panneaux ») ou étiré (« fuyantes », 003).
  mirrorCam.up.set(0,1,0).applyMatrix4(_mrot).reflect(_mn);
  mirrorCam.lookAt(_mtgt);
  // La cible de rendu a l'aspect du canvas (cf. fit()) : on recopie la projection de la
  // caméra, seule combinaison qui garde les UV dans [0,1] sur toute la surface visible.
  mirrorCam.near=camera.near;mirrorCam.far=camera.far;
  mirrorCam.projectionMatrix.copy(camera.projectionMatrix);
  mirrorCam.updateMatrixWorld();
  floorMesh.updateMatrixWorld(); // le sol vient d'être déplacé : matrixWorld périmée d'une image
  mirrorTexMat.set(0.5,0,0,0.5, 0,0.5,0,0.5, 0,0,0.5,0.5, 0,0,0,1);
  mirrorTexMat.multiply(mirrorCam.projectionMatrix);
  mirrorTexMat.multiply(mirrorCam.matrixWorldInverse);
  mirrorTexMat.multiply(floorMesh.matrixWorld);
  return true;
}
function floorSync(){
  // V0.10.0 : deux cases — « Sol » : disque à la couleur du thème (ou de l'ambiance de rendu, 98-rendu-vue,
  // bords fondus dans le fond) ; « Miroir » : le reflet de la pièce, avec ou sans disque.
  if(!floorMesh||!mirrorU)return;
  const env=typeof vEnvActive==='function'&&vEnvActive();
  // bords toujours fondus dans le fond (le disque s'arrêtait net à 400 mm, visible en thème Clair)
  mirrorU.uDisk.value=floorOn?1:0;mirrorU.uRefl.value=mirrorOn?1:0;mirrorU.uFade.value=1;mirrorU.uReflK.value=env?0.8:0.62;
  const fm=floorMesh.material,tr=true;
  if(fm.transparent!==tr){fm.transparent=tr;fm.depthWrite=!tr;fm.needsUpdate=true;}
  floorMesh.renderOrder=tr?-3:0;
  floorMesh.visible=floorOn||mirrorOn;
  mirrorDirty=true;
}
function floorMeshes(){
  // Corps sur lesquels le sol se pose (refreshMirror, floorFollowTick).
  // 2026-10-22 : en FAO, le BRUT affiché (posage sélectionné) compte aussi — le sol
  // passe sous lui, pas sous la pièce qu'il enveloppe.
  // V0.7.5 : seulement ce qui est réellement AFFICHÉ (objet et parents visibles) — un corps masqué
  // (case, simulation) ne retient plus le sol sous lui ; le sol passe sous la dernière pièce visible
  const ms=[],shown=o=>{for(let p=o;p;p=p.parent)if(p.visible===false)return false;return true;};
  // mode Assembler : la vue dessine asmScene (47) — le sol passe sous les composants placés (fantômes exclus)
  const asmG=(typeof asmMode!=='undefined'&&asmMode==='asm'&&typeof asmScene!=='undefined'&&asmScene)?asmScene.getObjectByName('asmOcc'):null;
  if(asmG)asmG.traverse(o=>{if(o.isMesh&&o.geometry&&!(o.userData.rd&&o.userData.rd.ghost)&&shown(o))ms.push(o);});
  else bodies.forEach(b=>{if(b.visible&&b.mesh&&shown(b.mesh))ms.push(b.mesh);});
  try{
    if(faoPoseGrp&&faoPoseGrp.parent&&faoPoseGrp.parent.visible!==false)
      faoPoseGrp.traverse(o=>{if(o.isMesh&&o.userData&&o.userData.faoStock&&shown(o))ms.push(o);});
  }catch(e){}
  // V0.7.5 : assemblage en mode Modéliser — les autres composants affichés autour de la pièce
  try{const g=scene.getObjectByName('asmCtx');if(g)g.traverse(o=>{if(o.isMesh&&shown(o))ms.push(o);});}catch(e){}
  // V0.7.5 : FAO en simulation — le brut et la matière usinée du simulateur (88-fao-70)
  try{if(typeof faoVw!=='undefined'&&faoVw)[faoVw.stock,faoVw.matter].forEach(g=>{if(g&&g.traverse)g.traverse(o=>{if(o.isMesh&&shown(o))ms.push(o);});});}catch(e){}
  return ms;
}
// V0.23.12 : le sol suit À CHAQUE IMAGE ce qui est affiché, comme le reflet — avant, il n'était
// recalé que sur certains événements (posage, simulation, cases) et restait en place quand le
// brut changeait autrement (matière simulée, brut corps modifié…) alors que son reflet suivait.
// Signature : nombre de corps + boîte englobante (boundingBox des géométries, sans parcours des
// sommets) + haut de la vue ; le recalage complet n'a lieu que si elle change.
let _floorSig='';
// V0.23.23 : plan du sol (centre des corps projeté, haut de la vue) — aussi lu par le plan
// d'ombre portée (vEnvTick, 98), qui restait sous la pièce et coupait le cube du brut.
let floorPlane=null;
function floorBoxSig(n,box){
  const r=v=>Math.round(v*1e3);
  return n+'|'+(box.isEmpty()?'':[box.min.x,box.min.y,box.min.z,box.max.x,box.max.y,box.max.z].map(r).join(','))+'|'+[_mn.x,_mn.y,_mn.z].map(v=>Math.round(v*1e6)).join(',');
}
function floorFollowTick(){
  const sh=typeof vEnvS!=='undefined'&&vEnvS&&vEnvS.floor; // ombre portée : suit le même plan
  if(!floorMesh||(!floorMesh.visible&&!sh))return;
  const ms=floorMeshes(),box=new THREE.Box3();
  ms.forEach(m=>{m.updateWorldMatrix(true,false);box.expandByObject(m);});
  if(floorBoxSig(ms.length,box)!==_floorSig)refreshMirror();
}
function refreshMirror(){
  // Sol sous les corps visibles + halo centré (comme le viewer).
  // 2026-10-21-005 : le sol est PERPENDICULAIRE au haut de la vue (_mn : Z monde, ou
  // Z du posage / de l'opération en FAO — viewUpSync) et posé sous le point le plus
  // bas des corps LE LONG de cet axe (sommets exacts : une boîte englobante penchée
  // laisserait un vide sous la pièce).
  if(!floorMesh)return;
  mirrorDirty=true; // la cible de reflet est à refaire (position du sol, halo, visibilité)
  floorSync();
  const sh=typeof vEnvS!=='undefined'&&vEnvS&&vEnvS.floor;
  if(!floorMesh.visible&&!sh)return;
  const ms=floorMeshes();
  const box=new THREE.Box3();let n=0;
  ms.forEach(m=>{m.updateWorldMatrix(true,false);box.expandByObject(m);n++;});
  _floorSig=floorBoxSig(n,box);
  if(!n||box.isEmpty()){floorPlane=null;return;}
  const U=_mn,sz=box.getSize(new THREE.Vector3()).length();
  let dmin=Infinity;
  const up=Math.abs(U.z-1)<1e-9;
  if(up)dmin=box.min.z;
  else ms.forEach(m=>{
    if(!m.geometry)return;
    const pos=m.geometry.attributes&&m.geometry.attributes.position;if(!pos)return;
    const M=m.matrixWorld.elements,a=pos.array,st=Math.max(1,Math.floor(pos.count/60000));
    for(let i=0;i<pos.count;i+=st){const x=a[i*3],y=a[i*3+1],z=a[i*3+2];
      const wx=M[0]*x+M[4]*y+M[8]*z+M[12],wy=M[1]*x+M[5]*y+M[9]*z+M[13],wz=M[2]*x+M[6]*y+M[10]*z+M[14];
      const d=wx*U.x+wy*U.y+wz*U.z;if(d<dmin)dmin=d;}
  });
  if(!isFinite(dmin))dmin=box.min.dot(U);
  // 2026-10-16-014 : sol COLLÉ à la pièce (était −0,5 mm) — le reflet de l'arête du bas tombait
  // 1 mm plus bas que le trait en filigrane vu à travers une pièce transparente.
  dmin-=Math.max(0.02,sz*1e-4);
  const c=box.getCenter(new THREE.Vector3());
  // centre du halo = centre des corps projeté sur le plan du sol
  _mcu.copy(c).addScaledVector(U,dmin-c.dot(U));
  floorPlane={c:_mcu.clone(),U:U.clone()};
  if(!floorMesh.visible)return;
  floorMesh.position.copy(_mcu);
  floorMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),U);
  floorMesh.updateMatrixWorld();
  mirrorU.uCenter.value.copy(_mcu);
  mirrorU.uRadius.value=Math.max(sz/2,1);
  const _fs=Math.max(1,sz*3/400);floorMesh.scale.set(_fs,_fs,1); // disque assez grand pour que son fondu reste dans le disque
}
/* 2026-10-21-005 : HAUT DE LA VUE en FAO — l'orbite (camera.up) et le sol miroir
   suivent le Z du posage, ou celui de l'opération sélectionnée quand elle a son
   propre repère (3+2). Hors FAO (CAO, PLAN) : Z monde. OrbitControls fige son axe
   d'orbite à la création : il est recréé (mêmes réglages, même cible) quand le haut
   change. Rien ne bouge pendant l'édition d'esquisse (caméra ortho dédiée). */
/* 2026-10-22 : la ROTATION ne passe plus par OrbitControls (qui ne garde que le pan au clic droit
   et le zoom) : elle tourne autour d'un PIVOT distinct de la cible — centre de la face
   sélectionnée, sinon centre des pièces visibles. Un pan ne déplace donc plus le centre de
   rotation (comme Fusion). Caméra ET cible tournent autour du pivot ; OrbitControls.update()
   ne fait ensuite que recopier la position et regarder la cible.
   Contrainte : azimut autour du Z de la vue, élévation bornée avant les pôles, Z en haut.
   Libre : rotation autour des axes ÉCRAN (haut et droite de la caméra), camera.up suit.
   Inertie : 20 % du reste par image (ORBIT_ROT_DAMP, V0.10.0 ; OrbitControls : 8 % pour le pan et le zoom). */
function orbitApplyButtons(){
  if(!controls||!controls.mouseButtons||!THREE.MOUSE)return;
  controls.mouseButtons.LEFT=-1;controls.mouseButtons.MIDDLE=-1;
}
// haut de l'écran = Z de la vue (monde, ou posage / opération en FAO) : vues normalisées, retour en contraint
function viewUpReset(){
  if(!camera||!controls)return;
  camera.up.copy(_mn);
  const off=camera.position.clone().sub(controls.target);
  if(off.lengthSq()>0&&Math.abs(off.clone().normalize().dot(_mn))>0.9999){
    const s=new THREE.Vector3(1,-1,0).normalize();if(Math.abs(s.dot(_mn))>0.9)s.set(0,1,0);
    camera.position.addScaledVector(s,off.length()*1e-3);
  }
}
function camSetFov(f,keep){
  // Change l'angle de champ ; keep : recule/avance la caméra pour que le plan de la cible garde
  // la même taille à l'écran (seule la convergence des fuyantes change, façon « travelling compensé »).
  f=Math.min(90,Math.max(5,+f||50));
  if(!camera||!camera.isPerspectiveCamera)return;
  const t0=Math.tan((camera.fov||50)*Math.PI/360),t1=Math.tan(f*Math.PI/360);
  if(keep&&controls){
    const off=camera.position.clone().sub(controls.target);
    camera.position.copy(controls.target).addScaledVector(off,t0/t1);
  }
  // petit angle = caméra lointaine : plans de coupe éloignés d'autant (précision de profondeur gardée)
  const k=Math.max(1,Math.tan(25*Math.PI/180)/t1);
  camera.fov=f;camera.near=0.1*k;camera.far=5000*k;camera.updateProjectionMatrix();
  viewFov=f;
  if(keep){try{controls.update();}catch(e){}mirrorDirty=true;}
}
function orbitSetMode(free){
  orbitFree=!!free;
  try{localStorage.setItem('minifusion_orbit',orbitFree?'libre':'contrainte');}catch(e){}
  orbitApplyButtons();
  if(!orbitFree){viewUpReset();try{controls.update();}catch(e){}} // la pièce se redresse
  try{const o=document.getElementById('optOrbit');if(o)o.value=orbitFree?'libre':'contrainte';}catch(e){}
  try{if(typeof mfOrbitBtnSync==='function')mfOrbitBtnSync();}catch(e){}
}
/* V0.11.27 : POINT SOUS LA SOURIS — sert de pivot à la rotation et de centre au zoom.
   Plus on zoomait sur un détail, plus la rotation autour du centre des pièces le jetait hors
   de l'écran. Désormais on tourne autour du point de pièce cliqué, et la molette zoome vers
   le point visé (il reste sous le curseur). Rien sous la souris : null. */
function viewHitAt(cx,cy){
  if(!camera||!renderer)return null;
  const r=renderer.domElement.getBoundingClientRect();
  if(!r.width||!r.height)return null;
  const ndc=new THREE.Vector2(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1);
  rayc.setFromCamera(ndc,camera);
  const objs=[],prev=[];
  try{
    if(typeof asmMode!=='undefined'&&asmMode==='asm'&&typeof asmSceneGet==='function'){
      const G=asmSceneGet().getObjectByName('asmOcc');
      if(G)G.traverse(m=>{if(m.isMesh&&m.visible!==false)objs.push(m);});
    }else bodies.forEach(b=>{
      if(!b.visible||!b.mesh||b.mesh.visible===false)return;
      // V0.21.5 : l'aperçu d'une fonction (congé, chanfrein, dépouille, coque) REMPLACE la pièce,
      // qui est masquée — sans lui, plus rien sous la souris : la rotation retombait sur le centre
      // des pièces. Son raycast reste coupé pour la sélection ; on le lance ici à la main.
      if(b.preview&&b.mesh.isMesh)prev.push(b.mesh);else if(!b.ghost)objs.push(b.mesh);
    });
  }catch(e){}
  try{
    if(typeof faoPoseGrp!=='undefined'&&faoPoseGrp&&faoPoseGrp.parent&&faoPoseGrp.parent.visible!==false)
      faoPoseGrp.traverse(o=>{if(o.isMesh&&o.visible&&o.userData&&o.userData.faoStock)objs.push(o);});
  }catch(e){}
  try{if(!(typeof asmMode!=='undefined'&&asmMode==='asm'))asmCtxSub().forEach(m=>prev.push(m));}catch(e){} // raycast coupé : lancé à la main
  if(!objs.length&&!prev.length)return null;
  let hits=[];try{hits=objs.length?rayc.intersectObjects(objs,false):[];}catch(e){}
  if(prev.length){
    try{prev.forEach(m=>{m.updateMatrixWorld();THREE.Mesh.prototype.raycast.call(m,rayc,hits);});}catch(e){}
    hits.sort((a,b)=>a.distance-b.distance);
  }
  const h=hits.find(x=>x.object&&(!x.object.material||x.object.material.opacity===undefined||x.object.material.opacity>0.05));
  return h?h.point.clone():null;
}
// point du plan de la cible (perpendiculaire à la vue) sous la souris : repli du zoom dans le vide
function viewTargetPlaneAt(cx,cy){
  const r=renderer.domElement.getBoundingClientRect();
  const ndc=new THREE.Vector2(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1);
  rayc.setFromCamera(ndc,camera);
  const d=camera.getWorldDirection(new THREE.Vector3());
  const pl=new THREE.Plane().setFromNormalAndCoplanarPoint(d,controls.target);
  return rayc.ray.intersectPlane(pl,new THREE.Vector3());
}
// V0.21.14 : mode Modéliser — sous-composants du composant actif dessinés autour de la pièce (asmCtx, 47) :
// ils servent au pivot de rotation comme les occurrences sélectionnables du mode Assembler
function asmCtxSub(){
  const out=[];if(typeof scene==='undefined'||!scene)return out;
  const G=scene.getObjectByName('asmCtx');if(!G||G.visible===false)return out;
  G.children.forEach(g=>{if(g.userData&&g.userData.sub&&g.visible!==false)g.traverse(m=>{if(m.isMesh&&m.geometry&&m.visible!==false)out.push(m);});});
  return out;
}
// pivot hors pièce : centre des pièces visibles (+ brut en FAO) ; mode Placer : repère / occurrence
function orbitPivot(){
  // mode Placer (V0.7.4) : repère choisi, occurrence sélectionnée ou centre des pièces placées
  try{if(typeof asmOrbitPivot==='function'){const p=asmOrbitPivot();if(p)return p;}}catch(e){}
  const box=new THREE.Box3();
  try{bodies.forEach(b=>{if(b.visible&&b.mesh&&b.mesh.visible!==false)box.expandByObject(b.mesh);});}catch(e){}
  try{asmCtxSub().forEach(m=>box.expandByObject(m));}catch(e){}
  try{
    if(typeof faoPoseGrp!=='undefined'&&faoPoseGrp&&faoPoseGrp.parent&&faoPoseGrp.parent.visible!==false)
      faoPoseGrp.traverse(o=>{if(o.isMesh&&o.visible&&o.userData&&o.userData.faoStock)box.expandByObject(o);});
  }catch(e){}
  return box.isEmpty()?controls.target.clone():box.getCenter(new THREE.Vector3());
}
// pivot d'un glisser qui commence en (cx,cy) : le point de la face sous la souris ; dans le vide,
// le centre du solide (V0.11.27 — la face sélectionnée n'est plus le pivot)
function orbitPivotAt(cx,cy){
  try{if(typeof asmMode!=='undefined'&&asmMode==='asm'&&typeof asmPivot!=='undefined'&&asmPivot){const p=asmOrbitPivot();if(p)return p;}}catch(e){} // repère choisi : prioritaire
  try{const h=viewHitAt(cx,cy);if(h)return h;}catch(e){}
  return orbitPivot();
}
// repère visuel du pivot pendant la rotation (point orange, taille écran fixe, toujours devant)
function orbitMarkShow(P){
  try{
    if(!_foMark){
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0],3));
      _foMark=new THREE.Points(g,new THREE.PointsMaterial({color:0xff8a00,size:9,sizeAttenuation:false,depthTest:false,transparent:true}));
      _foMark.renderOrder=999;_foMark.userData.noMirror=true;_foMark.name='orbitPivotMark';
    }
    if(P){
      _foMark.position.copy(P);_foMark.visible=true;
      const S=(typeof asmMode!=='undefined'&&asmMode==='asm'&&typeof asmSceneGet==='function')?asmSceneGet():scene;
      if(_foMark.parent!==S)S.add(_foMark);
    }else _foMark.visible=false;
  }catch(e){}
}
// molette : zoom VERS le point visé (homothétie centrée sur lui : il reste sous le curseur).
// Pièce sous la souris → son point ; sinon le plan de la cible. Amorti comme la rotation.
let _fzHit=null; // dernier point visé par la molette {x,y,t,P,cam}
function orbitCamKey(){
  const p=camera.position,q=camera.quaternion;
  return [p.x,p.y,p.z,q.x,q.y,q.z,q.w].map(v=>v.toFixed(5)).join(',');
}
function orbitZoomWheel(e){
  if(!controls||controls.enabled===false||!camera)return;
  try{if(typeof skEdit!=='undefined'&&skEdit)return;}catch(err){}
  e.preventDefault();
  let d=e.deltaY*(e.deltaMode===1?33:(e.deltaMode===2?400:1));
  if(!d)return;
  d=Math.max(-300,Math.min(300,d));
  if(zoomInv)d=-d;
  // V0.23.0 : le point visé est MÉMORISÉ pendant un geste — zoomer vers P le garde sous le
  // curseur, donc tant que la souris ne bouge pas (±3 px) et que la caméra n'a bougé que par
  // ce zoom, P est encore le bon point. Avant : un lancer de rayon par cran (Moule 73-40,
  // 2,1 M triangles : 55 ms chacun, des dizaines par geste sous Chrome = zoom saccadé).
  const now=performance.now(),H=_fzHit;
  let P=null;
  if(H&&Math.abs(e.clientX-H.x)<=3&&Math.abs(e.clientY-H.y)<=3&&now-H.t<1000&&H.cam===orbitCamKey())P=H.P;
  else{
    try{P=viewHitAt(e.clientX,e.clientY)||viewTargetPlaneAt(e.clientX,e.clientY);}catch(err){}
    if(!P)P=controls.target.clone();
    _fzHit={x:e.clientX,y:e.clientY,P,cam:orbitCamKey()};
  }
  _fzHit.t=now;
  // un cran (100) ≈ 15 % ; logarithme du facteur cumulé, écoulé par orbitTick
  const ln=d*0.0016;
  if(_fz&&_fz.ln*ln>0)_fz.ln+=ln;else _fz={ln};
  _fz.P=P;
  viewUserMoved=true;
}
function orbitZoomApply(ln,P){
  const dc=camera.position.distanceTo(P);
  // bornes : pas plus près que 0,5 mm du point visé, pas plus loin que 20 m
  let k=Math.exp(ln);
  if(dc*k<0.5)k=0.5/Math.max(dc,1e-9);
  if(dc*k>20000)k=20000/Math.max(dc,1e-9);
  if(Math.abs(k-1)<1e-9)return false;
  const t=controls.target;
  const oc=camera.position.clone().sub(P).multiplyScalar(k),ot=t.clone().sub(P).multiplyScalar(k);
  camera.position.copy(P).add(oc);t.copy(P).add(ot);
  return true;
}
function orbitRotate(dx,dy,P){
  if(!camera||!controls||!renderer)return;
  const k=2*Math.PI/(renderer.domElement.clientHeight||600)*(controls.rotateSpeed||1); // même vitesse qu'OrbitControls
  const t=controls.target;
  if(!P)P=t.clone();
  camera.updateMatrixWorld();
  const U=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1).normalize();
  const R=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0).normalize();
  let q;
  if(orbitFree){
    // glisser à droite : la pièce tourne vers la droite ; glisser vers le bas : on passe par-dessus
    q=new THREE.Quaternion().setFromAxisAngle(U,-dx*k).multiply(new THREE.Quaternion().setFromAxisAngle(R,-dy*k));
  }else{
    // élévation autour de la droite écran (horizontale : up = Z de la vue), bornée avant les pôles
    const d=camera.position.clone().sub(t).normalize();
    const phi=Math.acos(Math.max(-1,Math.min(1,d.dot(_mn))));
    const lim=1e-3,a=Math.max(lim,Math.min(Math.PI-lim,phi-dy*k))-phi;
    q=new THREE.Quaternion().setFromAxisAngle(_mn,-dx*k).multiply(new THREE.Quaternion().setFromAxisAngle(R,a));
  }
  const off=camera.position.clone().sub(P).applyQuaternion(q),toff=t.clone().sub(P).applyQuaternion(q);
  if(orbitFree)camera.up.copy(U.applyQuaternion(q));else camera.up.copy(_mn);
  camera.position.copy(P).add(off);t.copy(P).add(toff);camera.lookAt(t);
  viewUserMoved=true;
}
// inertie : le reste du glissement s'écoule à chaque image. V0.10.0 : 20 % par image (était 8 %,
// l'amortissement d'OrbitControls) — la pièce suit la souris de plus près, avec une inertie plus courte ;
// l'atelier RENDU, lui, suit la souris sans inertie. Le pan et le zoom gardent 8 %.
const ORBIT_ROT_DAMP=0.2;
function orbitTick(){
  if(_fz){
    const f=(controls&&controls.enableDamping)?0.3:1,a=_fz.ln*f;
    let moved=false;try{moved=orbitZoomApply(a,_fz.P);}catch(e){}
    if(_fzHit)_fzHit.cam=orbitCamKey(); // ce mouvement-là ne périme pas le point visé
    _fz.ln-=a;
    if(!moved||Math.abs(_fz.ln)<1e-4)_fz=null;
  }
  if(!_fo||(!_fo.vx&&!_fo.vy))return;
  try{if(typeof skEdit!=='undefined'&&skEdit){_fo.vx=_fo.vy=0;return;}}catch(e){}
  const f=(controls&&controls.enableDamping)?ORBIT_ROT_DAMP:1;
  orbitRotate(_fo.vx*f,_fo.vy*f,_fo.P);
  _fo.vx*=1-f;_fo.vy*=1-f;
  if(Math.abs(_fo.vx)<0.01&&Math.abs(_fo.vy)<0.01){_fo.vx=_fo.vy=0;if(!_fo.down){_fo=null;orbitMarkShow(null);}}
}
function orbitWire(el){
  // 2026-10-23 : Ctrl + molette enfoncée = DÉPLACEMENT, comme le clic droit. Écouteur en
  // CAPTURE : il passe avant OrbitControls et règle la molette pour ce seul geste.
  el.addEventListener('pointerdown',e=>{
    if(e.button!==1||!controls||!controls.mouseButtons||!THREE.MOUSE)return;
    // OrbitControls INVERSE le rôle avec Ctrl/Maj (PAN + Ctrl = rotation, ROTATE + Ctrl = déplacement) :
    // la molette est donc déclarée ROTATE pour ce geste, ce qui donne bien un déplacement
    controls.mouseButtons.MIDDLE=(e.ctrlKey||e.metaKey)?THREE.MOUSE.ROTATE:-1;
  },true);
  el.addEventListener('pointerdown',e=>{
    if(e.button!==0&&e.button!==1)return;
    if(e.button===1&&(e.ctrlKey||e.metaKey))return; // Ctrl + molette : déplacement (OrbitControls)
    if(!controls||controls.enabled===false||!controls.enableRotate)return; // esquisse : caméra figée
    try{if(typeof skEdit!=='undefined'&&skEdit)return;}catch(err){}
    _fo={id:e.pointerId,x:e.clientX,y:e.clientY,P:orbitPivotAt(e.clientX,e.clientY),x0:e.clientX,y0:e.clientY,vx:0,vy:0,down:true,moved:false};
  });
  el.addEventListener('wheel',orbitZoomWheel,{passive:false});
  window.addEventListener('pointermove',e=>{
    if(!_fo||!_fo.down||e.pointerId!==_fo.id)return;
    const dx=e.clientX-_fo.x,dy=e.clientY-_fo.y;_fo.x=e.clientX;_fo.y=e.clientY;
    _fo.vx+=dx;_fo.vy+=dy;
    if(!_fo.moved&&Math.hypot(e.clientX-_fo.x0,e.clientY-_fo.y0)>3){_fo.moved=true;orbitMarkShow(_fo.P);}
  });
  const fin=e=>{if(_fo&&e.pointerId===_fo.id){_fo.down=false;if(!_fo.vx&&!_fo.vy){_fo=null;orbitMarkShow(null);}}};
  window.addEventListener('pointerup',fin);window.addEventListener('pointercancel',fin);
}
function viewFaoActive(){
  try{
    const mod=!!(document.body&&document.body.classList&&document.body.classList.contains('ui-modern'));
    if(mod)return document.body.getAttribute('data-ws')==='fao';
    return typeof sel!=='undefined'&&!!sel&&(sel.kind==='faoSetup'||sel.kind==='faoOp');
  }catch(e){return false;}
}
// repère de la vue {X,Y,Z} (directions monde) : posage / opération en FAO, monde sinon
function viewBasis(){
  const W={X:[1,0,0],Y:[0,1,0],Z:[0,0,1]};
  try{
    if(!viewFaoActive()||typeof faoFrame!=='function'||typeof faoRoot!=='function')return W;
    const r=faoRoot();
    let sid=r&&r.activeSetupId,opId=null;
    if(typeof sel!=='undefined'&&sel){
      if(sel.kind==='faoSetup')sid=sel.id;
      else if(sel.kind==='faoOp'){sid=sel.setup||sid;opId=sel.id;}
    }
    const st=(r.setups||[]).filter(s=>s.id===sid)[0]||(r.setups||[])[0];
    if(!st)return W;
    const op=opId?(st.ops||[]).filter(o=>o.id===opId)[0]:null;
    const of=(op&&typeof faoOpFrame==='function')?faoOpFrame(st,op):null;
    const F=of||faoFrame(st);
    if(!F||!F.Z||!F.X||!F.Y)return W;
    return {X:F.X,Y:F.Y,Z:F.Z};
  }catch(e){return W;}
}
let _viewUpSig='0,0,1';
function viewControlsRebuild(){
  const t=controls.target.clone(),o={rot:controls.enableRotate,damp:controls.enableDamping,df:controls.dampingFactor,
    zs:controls.zoomSpeed,mb:controls.mouseButtons?Object.assign({},controls.mouseButtons):null,obj:controls.object};
  try{controls.dispose();}catch(e){}
  controls=new THREE.OrbitControls(o.obj||camera,renderer.domElement);
  controls.enableDamping=o.damp;controls.dampingFactor=o.df;controls.zoomSpeed=o.zs;controls.enableRotate=o.rot;
  controls.enableZoom=false; // zoom vers la souris : orbitZoomWheel
  if(o.mb&&controls.mouseButtons)Object.assign(controls.mouseButtons,o.mb);
  controls.target.copy(t);controls.update();
}
function viewUpSync(){
  if(!camera||!controls||!renderer)return;
  try{if(typeof skEdit!=='undefined'&&skEdit)return;}catch(e){}
  const Z=viewBasis().Z;
  const l=Math.hypot(Z[0],Z[1],Z[2])||1;
  const sig=[Z[0]/l,Z[1]/l,Z[2]/l].map(v=>(Math.abs(v)<1e-9?0:Math.round(v*1e6)/1e6)).join(',');
  if(sig===_viewUpSig)return;
  _viewUpSig=sig;
  const U=new THREE.Vector3(Z[0]/l,Z[1]/l,Z[2]/l);
  camera.up.copy(U);
  _mn.copy(U);
  // caméra pile sur l'axe : léger écart, sinon lookAt est indéterminé
  const off=camera.position.clone().sub(controls.target);
  if(off.lengthSq()>0&&Math.abs(off.clone().normalize().dot(U))>0.9999)camera.position.addScaledVector(new THREE.Vector3(1,-1,0).normalize(),off.length()*1e-3);
  viewControlsRebuild();
  try{refreshMirror();}catch(e){}
}
const _msig={x:NaN,y:NaN,z:NaN,qx:NaN,qy:NaN,qz:NaN,qw:NaN,fov:NaN,aspect:NaN,zoom:NaN};
function mirrorViewMoved(){
  // La vue a-t-elle bougé (orbite, zoom, recadrage, resize) ? Le reflet n'est recalculé que
  // dans ce cas — avant, la scène entière était re-rendue dans la cible À CHAQUE image
  // (double coût GPU en continu, même à l'arrêt). NaN au premier appel → un rendu est forcé.
  // (Un rendu PRINCIPAL « à la demande » a été essayé puis écarté : le survol des faces, la
  // sélection et le glissement des points de contrôle changent l'image sans toucher à la
  // caméra — il aurait fallu invalider partout, donc risqué de figer l'affichage.)
  const q=camera.quaternion;
  const moved=_msig.x!==camera.position.x||_msig.y!==camera.position.y||_msig.z!==camera.position.z
    ||_msig.qx!==q.x||_msig.qy!==q.y||_msig.qz!==q.z||_msig.qw!==q.w
    ||_msig.fov!==camera.fov||_msig.aspect!==camera.aspect||_msig.zoom!==camera.zoom;
  _msig.x=camera.position.x;_msig.y=camera.position.y;_msig.z=camera.position.z;
  _msig.qx=q.x;_msig.qy=q.y;_msig.qz=q.z;_msig.qw=q.w;
  _msig.fov=camera.fov;_msig.aspect=camera.aspect;_msig.zoom=camera.zoom;
  if(moved){mirrorDirty=true;} // la vue a changé : le reflet devient obsolète
  return moved;
}

function animate(){
  requestAnimationFrame(animate);
  try{viewUpSync();}catch(e){} // 2026-10-21-005 : haut de vue = Z du posage / de l'opération en FAO
  orbitTick();controls.update();updateLabels();
  const RS=asmRenderScene(); // vue d'assemblage : sa propre scène (47)
  viewDecorTo(RS);
  try{if(typeof vEnvTick==='function')vEnvTick();}catch(e){} // V0.10.0 : environnement de rendu (98-rendu-vue)
  if(mirrorOn&&floorMesh&&mirrorCam){ // aussi sous une ambiance de rendu : sinon le sol montrait le dernier reflet calculé, figé
    const vu=updateMirror();mirrorU.uRefl.value=vu?1:0; // caméra sous le sol : pas de reflet (il resterait figé)
    mirrorViewMoved();
    if(vu){const _fv=floorMesh.visible; // V0.10.0 : à CHAQUE image — un reflet recalculé au seul mouvement de caméra restait figé (survol, sélection, couleur, pièce modifiée)
      floorMesh.visible=false;
      // Seuls les SOLIDES se reflètent (comme viewer_STEP) : traits, aides et plans masqués.
      const _mh=[];
      RS.traverse(o=>{
        if(!o.visible||o===RS)return;
        if(o.isLine||o.isLineSegments||o.isPoints||o.isSprite||o===axHelper||(o.userData&&(o.userData.triad||o.userData.noMirror))||(o.material&&(o.material.isShaderMaterial||o.material.depthTest===false))||(o.material&&o.material.transparent&&o.material.opacity<0.6)){o.visible=false;_mh.push(o);} // depthTest false : manipulateur d'assemblage (48)
      });
      const _bg=RS.background,_ca=renderer.getClearAlpha();
      RS.background=null;renderer.setClearAlpha(0); // alpha 0 hors de la pièce : seul le reflet de la pièce se pose sur le sol (plus de tache du fond)
      renderer.setRenderTarget(mirrorRT);renderer.clear();renderer.render(RS,mirrorCam);
      RS.background=_bg;renderer.setClearAlpha(_ca);
      for(const o of _mh)o.visible=true;
      renderer.setRenderTarget(null);
      floorMesh.visible=_fv;
      mirrorDirty=false;
    }
  }
  try{sketchCamTick();}catch(e){}
  try{triadUpdateAll();}catch(e){}
  try{cgPaintIfNeeded();}catch(e){} // construction : la surbrillance suit la sélection
  try{if(typeof extDynTick==='function')extDynTick();}catch(e){} // extrusion dynamique : flèche et cote (70)
  try{if(typeof faoPoseSync==='function')faoPoseSync();}catch(e){}
  try{floorFollowTick();}catch(e){} // le sol suit le brut / les corps affichés (V0.23.12)
  try{if(typeof faoFaceHlSync==='function')faoFaceHlSync();}catch(e){} // faces bleues / rouges de l'op sélectionnée
  try{if(typeof holeThreadVisSync==='function')holeThreadVisSync();}catch(e){} // filets taraudés : cachés avec leur corps (76)
  try{if(typeof clipTick==='function')clipTick();}catch(e){} // coupe : remplissage des faces coupées (91)
  renderer.render(RS,camera);
}
// Sol miroir, lampe et plan d'ombre (98-rendu-vue) suivent la scène dessinée : celle de la pièce,
// ou asmScene en mode Assembler (sinon ni reflet ni ombre sous les composants placés)
function viewDecorTo(S){
  const mv=o=>{if(o&&o.parent!==S)S.add(o);};
  mv(floorMesh);
  try{if(typeof vEnvS!=='undefined'&&vEnvS){if(vEnvS.sun){mv(vEnvS.sun);mv(vEnvS.sun.target);}mv(vEnvS.floor);}}catch(e){}
}
function showAll(){
  const box=new THREE.Box3();
  bodies.forEach(b=>{if(b.visible)box.expandByObject(b.mesh);});
  doc.sketches.forEach(s=>{const m=scene.getObjectByName('sk_'+s.id);if(m&&s.visible!==false)box.expandByObject(m);});
  viewUpReset();
  if(box.isEmpty()){camera.position.set(90,-90,90);controls.target.set(0,0,0);}
  else{const c=box.getCenter(new THREE.Vector3()),r=box.getSize(new THREE.Vector3()).length()||50;
    controls.target.copy(c);camera.position.copy(c).add(new THREE.Vector3(r*.7,-r*.6,r*.7));}
  controls.update();
}
function viewFit(o){
  // Recadrage « vue complète » : cadre ISO/l'ensemble visible (pièce + esquisses) et règle la
  // distance caméra pour que la pièce soit ENTIÈREMENT dans le champ (le plus contraignant des
  // deux angles FOV vertical / horizontal, marge 25%).
  const box=new THREE.Box3();
  bodies.forEach(b=>{if(b.visible)box.expandByObject(b.mesh);});
  doc.sketches.forEach(s=>{const m=scene.getObjectByName('sk_'+s.id);if(m&&s.visible!==false)box.expandByObject(m);});
  if(box.isEmpty())return;
  const c=box.getCenter(new THREE.Vector3()),sz=box.getSize(new THREE.Vector3());
  const r=(sz.length()*0.5)||50;
  const aspect=camera.aspect||1;
  const fv=((camera.fov||45)*Math.PI/180);
  const s=Math.max(Math.sin(fv*0.5),Math.sin(Math.atan(Math.tan(fv*0.5)*aspect)));
  const d=(r/Math.max(s,0.05))*1.25;
  controls.target.copy(c);viewUpReset();
  // 2026-10-21-005 : direction exprimée dans le repère de la vue (posage en FAO)
  const B=viewBasis(),w=[0,1,2].map(k=>B.X[k]*o[0]+B.Y[k]*o[1]+B.Z[k]*o[2]);
  camera.position.set(c.x+w[0]*d,c.y+w[1]*d,c.z+w[2]*d);
  controls.update();
}
function setView(v){
  // esquisse ouverte : la vue d'esquisse s'oriente (le plan reste éditable)
  try{const SV={iso:[0.6,-0.6,0.6],top:[0,0,1],front:[0,-1,0],right:[1,0,0]};if(SV[v]&&sketchViewDir(SV[v]))return;}catch(e){}
  if(v==='iso'){viewFit([0.6,-0.6,0.6]);return;} // Iso = vue complète isométrique
  viewUpReset(); // orbite libre : la vue normalisée se redresse
  const t=controls.target.clone(),d=camera.position.distanceTo(t)||150;
  // 2026-10-21-005 : axes de la vue = repère du posage / de l'opération en FAO
  const B=viewBasis(),at=function(a,s){camera.position.set(t.x+a[0]*s*d,t.y+a[1]*s*d,t.z+a[2]*s*d);};
  if(v==='top'){at(B.Z,1);const e=B.Y;camera.position.x-=e[0]*d*1e-4;camera.position.y-=e[1]*d*1e-4;camera.position.z-=e[2]*d*1e-4;} // dessus : on regarde vers -Z (écart infime : lookAt défini)
  if(v==='front')at(B.Y,-1); // face : depuis l'avant (Y-), Y part vers l'arrière
  if(v==='right')at(B.X,1); // droite : depuis +X
  controls.update();
}

/* ---------- couleurs / overlay pièces ---------- */
function ghostMaterial(col){
  // V0.23.26 : outil de la fonction sélectionnée, bien visible — dessiné PAR-DESSUS la pièce
  // (sans test de profondeur : un perçage se voit même enfoui). Mat (Lambert : pas de reflet
  // blanc qui le délavait en rose), rouge vif auto-éclairé, peu transparent.
  const c=new THREE.Color(col===0xff453a?0xff1a10:col);
  return new THREE.MeshLambertMaterial({color:c,emissive:c.clone().multiplyScalar(0.48),transparent:true,opacity:0.75,depthWrite:false,depthTest:false});
}
function updateGhostVis(){
  // Fantômes d'outils (la « pièce rouge translucide ») : l'aperçu au clic dans l'arbre
  // fonctionne déjà (visible quand la découpe — ou l'outil — est sélectionnée). On y ajoute
  // UN seul cas : juste APRÈS une soustraction, l'outil reste CACHÉ, même si la nouvelle
  // découpe est sélectionnée (sinon l'outil s'affiche à l'instant même de l'opération).
  // Le masquage s'auto-efface dès que la sélection change.
  if(ghostHide&&!(sel.kind==='feature'&&sel.id===ghostHide))ghostHide=null;
  // V0.23.26 : répétition sélectionnée → le motif entier en rouge (sources + instances)
  const motif=new Set();
  try{
    const rp=sel.kind==='feature'?(doc.features||[]).find(f=>f.id===sel.id&&f.type==='repeat'):null;
    if(rp)repExpandSources([rp]).forEach(f=>motif.add(f.id));
  }catch(e){}
  bodies.forEach(b=>{
    if(!b.ghost||!b.ref)return;
    let on=(sel.kind==='feature'&&(sel.id===b.ref||motif.has(b.ref)))||(sel.kind==='body'&&sel.id===b.id);
    if(ghostHide===b.ref)on=false; // opération en cours : outil caché
    b.visible=on;b.mesh.visible=on;
  });
}
let refreshEdgesPending=false;
function refreshParts(){
  try{const _e=$('optEdges');if(_e&&_e.value!==edgeMode)_e.value=edgeMode;}catch(e){}
  try{
    if(doc.bodyVis)for(const b of bodies){
      if(b.ghost)continue; // fantôme : visibilité pilotée par la sélection, jamais mémorisée
      if(Object.prototype.hasOwnProperty.call(doc.bodyVis,b.id)){
        b.visible=!!doc.bodyVis[b.id];b.mesh.visible=b.visible;
      }
    }
  }catch(e){}
  try{ // mode lecture usinage + matière : les corps restent masqués quoi qu'il arrive
    if(typeof faoVw!=='undefined'&&faoVw&&faoVw.hideBodies)faoVw.hideBodies.forEach(b=>{if(b&&b.mesh)b.mesh.visible=false;});
  }catch(e){}
  updateGhostVis();
  // V0.11.7 : visibilité d'un corps changée (œil, clic droit, brut FAO, annuler…) → ses arêtes
  // suivent. Différé : dans un rejeu, buildEdgeOverlay() passe juste après et la signature
  // est alors déjà à jour — aucun double calcul.
  if(!refreshEdgesPending)try{if(bodyVisSig()!==edgeOverlayVisSig){refreshEdgesPending=true;
    setTimeout(()=>{refreshEdgesPending=false;try{if(bodyVisSig()!==edgeOverlayVisSig)buildEdgeOverlay();}catch(e){}},0);}}catch(e){}
  // La liste « Pièces » a été retirée de l'interface : les corps se pilotent depuis
  // l'arborescence (œil sur la fonction) ou par le clic droit dans la vue 3D.
  // La visibilité mémorisée par corps reste appliquée, et l'œil d'une FONCTION la pilote
  // désormais aussi — sinon un corps masqué resterait invisible sans moyen de le rendre.
  const vis=bodies.filter(b=>b.visible);
  let tris=0;scene.traverse(o=>{if(o.isMesh&&o.visible&&o.geometry&&o.geometry.attributes&&o.geometry.attributes.position)tris+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;});
  log(`Corps: ${bodies.length} (${vis.length} visibles) · Tris≈${Math.round(tris).toLocaleString('fr')} · ${dirty?'● non sauvé':'✓ sauvé'}`);
}

/* ---------- rebuild paramétrique (THREE.ExtrudeGeometry) ---------- */
function clearBodies(){
  // Les `shape` des corps exacts sont des sous-solides du COMPOSÉ occLive (handles
  // partageant les TShapes, compteur de références OCCT : les supprimer est sûr),
  // SAUF le repli « forme non décomposable » où l'entrée référence le composé lui-même
  // (même objet que occLive.shape) — celui-là, seul occDropLive le libère (double-free sinon).
  // Les meshes d'import (f._mesh) appartiennent à la fonction : retirés de la scène
  // comme tous les autres, mais JAMAIS libérés — la table `importGeom` en décide
  // (annuler/rétablir doit pouvoir les remettre en scène tels quels).
  const vivant=(typeof importMeshesOfDoc==='function')?importMeshesOfDoc():new Set();
  const garde=(typeof importOwnedMeshes==='function')?importOwnedMeshes():new Set();
  bodies.forEach(b=>{
    try{if(b._faoGeo&&b._faoGeo.dispose)b._faoGeo.dispose();}catch(e){}
    try{if(b._faoGeoFine&&b._faoGeoFine.dispose)b._faoGeoFine.dispose();}catch(e){}
    if(!b.mesh)return;
    scene.remove(b.mesh);
    if(!vivant.has(b.mesh)&&!garde.has(b.mesh)){try{b.mesh.geometry.dispose();}catch(e){}}
    try{if(b.shape&&(!occLive||b.shape!==occLive.shape))b.shape.delete();}catch(e){}
  });bodies=[];const eo=scene.getObjectByName('edgeOverlay');if(eo)scene.remove(eo);clearMeasure();clearHover();if(selGroup){scene.remove(selGroup);selGroup=null;}selFaces=[];}
function planeBasis(plane,sk){
  // Base arbitraire : si l'esquisse porte axU/axV/axN (esquisse sur face), on les utilise.
  // Sinon repli sur les 3 plans d'origine. Z↑ haut, Y→arrière.
  if(sk&&sk.axU&&sk.axV&&sk.axN){
    const v3=a=>new THREE.Vector3(a[0],a[1],a[2]);
    return{u:v3(sk.axU),v:v3(sk.axV),n:v3(sk.axN)};
  }
  if(plane==='XZ')return{u:new THREE.Vector3(1,0,0),v:new THREE.Vector3(0,0,1),n:new THREE.Vector3(0,-1,0)};
  if(plane==='YZ')return{u:new THREE.Vector3(0,1,0),v:new THREE.Vector3(0,0,1),n:new THREE.Vector3(1,0,0)};
  return{u:new THREE.Vector3(1,0,0),v:new THREE.Vector3(0,1,0),n:new THREE.Vector3(0,0,1)};
}
function sketchBasis(sk){
  const{u,v,n}=planeBasis(sk?sk.plane:'XY',sk);
  let o=new THREE.Vector3(0,0,0);
  if(sk&&sk.origin&&isFinite(sk.origin[0]))o=new THREE.Vector3(sk.origin[0],sk.origin[1],sk.origin[2]);
  return{u,v,n,o};
}
function ensureSketchBasis(sk){
  if(!sk.origin)sk.origin=[0,0,0];
  if(sk.axU&&sk.axV&&sk.axN)return sk;
  const{u,v,n}=planeBasis(sk.plane,null);
  sk.axU=[u.x,u.y,u.z];sk.axV=[v.x,v.y,v.z];sk.axN=[n.x,n.y,n.z];
  if(!sk.origin)sk.origin=[0,0,0];
  return sk;
}
// Vue d'esquisse ORTHOGRAPHIQUE calée sur le SVG : le point (cx,cy) du plan tombe au centre
// du SVG, à s px/mm. ORIENTATION LIBRE (skOrb) comme dans l'espace 3D : repère caméra R (droite),
// U (haut), D (vers la caméra) exprimé dans le repère LOCAL du plan (u,v,n). En orthographique,
// plan → écran est AFFINE : skOrbL() donne cette application (2×2 autour du centre du SVG),
// posée sur le groupe racine du dessin SVG et inversée pour la souris — tracé et accroche
// restent sur le plan d'esquisse quel que soit l'angle de vue.
//   · skOrbFront() (touche N) : vue À PLAT, face de l'esquisse DEVANT (caméra côté +n) et
//     DROITE (le Z du monde vers le haut ; plan horizontal : Y vers le haut, comme le cube) ;
//   · ouverture : à plat, ou vue 3D courante gardée (case « À plat », skFlatOpen) ;
//   · orbite : clic-molette glissé (comme en 3D), cube de vue, boutons de vue (setView).
// 2026-10-29 : DE FACE (plan d'esquisse face à l'écran) = ORTHOGRAPHIQUE (projections arrière
// sans fuyantes) ; dès que la vue QUITTE LE PLAN = PERSPECTIVE, la caméra 3D elle-même. Plan →
// écran devient une HOMOGRAPHIE (_skH, 3×3 sur [px,py,1]) : le dessin est tracé en vue normale
// dans un second SVG (#skSvgP) que CSS projette (matrix3d) ; la souris repasse par _skHi. La
// rotation reprend celle de l'espace 3D (orbitRotate : vitesse, contraint / libre, inertie) et
// passe derrière le plan ; lâchée à moins de 4° de face, la vue se recale dans le plan.
let skOrb={R:[1,0,0],U:[0,1,0],D:[0,0,1]};
let skFlatOpen=true; // ouverture à plat (sinon la vue 3D courante est gardée) — persisté
try{if(localStorage.getItem('minifusion_skFlat')==='0')skFlatOpen=false;}catch(e){}
let _skKeep=false; // session ouverte « vue 3D gardée » : la sortie garde l'orientation
let _skH=null,_skHi=null,_skEdge=false; // homographie perspective et son inverse (null = orthographique)
const SK_EDGE=Math.sin(0.5*Math.PI/180); // plan vu par la tranche : dessin masqué (homographie dégénérée)
const SK_SNAP_FACE=Math.cos(4*Math.PI/180); // lâcher à moins de 4° de face : retour dans le plan
function skPersp(){return Math.abs(skOrb.D[2])<1-1e-9;} // hors du plan → perspective
function skOrbOn(){return !(Math.abs(skOrb.D[2]-1)<1e-12&&Math.abs(skOrb.U[1]-1)<1e-12);}
function skOrbL(){ // SVG « vue normale » → SVG affiché, autour du centre du SVG : [l11,l12,l21,l22]
  if(!skOrbOn())return[1,0,0,1];
  const R=skOrb.R,U=skOrb.U;
  return[R[0],-R[1],-U[0],U[1]];
}
function skH(h,px,py,wmin){ // homographie appliquée à un point ; wmin : au-delà de l'horizon, point lointain
  let w=h[6]*px+h[7]*py+h[8];if(wmin!=null&&w<wmin)w=wmin;
  return[(h[0]*px+h[1]*py+h[2])/w,(h[3]*px+h[4]*py+h[5])/w];
}
function skOrbFwd(px,py){ // point SVG normal → point SVG affiché
  if(!skOrbOn())return[px,py];
  if(_skH)return skH(_skH,px,py);
  const{W,H}=svgSize(),L=skOrbL(),x=px-W/2,y=py-H/2;
  return[W/2+L[0]*x+L[1]*y,H/2+L[2]*x+L[3]*y];
}
function skOrbInv(px,py){ // point SVG affiché (souris) → point SVG normal
  if(!skOrbOn())return[px,py];
  if(_skH)return _skHi?skH(_skHi,px,py,0.02):[px,py];
  const{W,H}=svgSize(),L=skOrbL(),x=px-W/2,y=py-H/2,det=(L[0]*L[3]-L[1]*L[2])||1e-9;
  return[W/2+(L[3]*x-L[1]*y)/det,H/2+(-L[2]*x+L[0]*y)/det];
}
function skOrbTransform(){ // attribut transform du groupe racine du SVG (null = vue normale ou perspective)
  if(!skOrbOn()||_skH)return null;
  const{W,H}=svgSize(),L=skOrbL(),cx=W/2,cy=H/2;
  return `matrix(${L[0]} ${L[2]} ${L[1]} ${L[3]} ${cx-L[0]*cx-L[1]*cy} ${cy-L[2]*cx-L[3]*cy})`;
}
function skOrbUpright(root){
  // Textes LISIBLES quel que soit l'angle : chaque texte (et le fond d'étiquette de cote, qui
  // pivote autour du même point) annule la déformation autour de son point d'ancrage ; une
  // étiquette alignée sur sa ligne de cote reprend l'angle de la ligne À L'ÉCRAN.
  // Perspective : application LOCALE (jacobienne de l'homographie au point d'ancrage).
  root.querySelectorAll('text,rect').forEach(el=>{
    const m=/rotate\(\s*([-\d.e]+)[\s,]+([-\d.e]+)[\s,]+([-\d.e]+)\s*\)/.exec(el.getAttribute('transform')||'');
    let px,py,al=0,dx=1,dy=0;
    if(m){
      px=+m[2];py=+m[3];const r=(+m[1])*Math.PI/180;dx=Math.cos(r);dy=Math.sin(r);
    }else{
      if(el.tagName!=='text')return;
      px=+el.getAttribute('x');py=+el.getAttribute('y');
    }
    if(!isFinite(px)||!isFinite(py))return;
    const L=skOrbJ(px,py),det=L[0]*L[3]-L[1]*L[2];if(Math.abs(det)<1e-9)return;
    const I=[L[3]/det,-L[1]/det,-L[2]/det,L[0]/det];
    if(m){
      al=Math.atan2(L[2]*dx+L[3]*dy,L[0]*dx+L[1]*dy)*180/Math.PI;
      if(al>90.01)al-=180;else if(al<-90.01)al+=180;
    }
    const e=px-(I[0]*px+I[1]*py),f=py-(I[2]*px+I[3]*py);
    el.setAttribute('transform',`matrix(${I[0]} ${I[2]} ${I[1]} ${I[3]} ${e} ${f})`+(al?` rotate(${al} ${px} ${py})`:''));
  });
}
function skOrbJ(px,py){ // application linéaire locale plan → écran au point SVG normal (px,py)
  if(!_skH)return skOrbL();
  const h=_skH,A=h[0]*px+h[1]*py+h[2],B=h[3]*px+h[4]*py+h[5],w=h[6]*px+h[7]*py+h[8],w2=w*w;
  return[(h[0]*w-A*h[6])/w2,(h[1]*w-A*h[7])/w2,(h[3]*w-B*h[6])/w2,(h[4]*w-B*h[7])/w2];
}
function skOrbVisPoly(W,H){
  // Zone du plan visible dans le cadre du SVG, en coordonnées SVG normales (polygone convexe).
  // Perspective : le cadre est d'abord coupé sous l'horizon (w de l'inverse ≥ 0,35 : au-delà, la
  // grille ne serait plus qu'un gris uniforme — et un point derrière la caméra n'a pas d'image).
  let poly=[[0,0],[W,0],[W,H],[0,H]];
  if(_skH&&_skHi){
    const h=_skHi,c=p=>h[6]*p[0]+h[7]*p[1]+h[8],cm=0.35,out=[];
    for(let i=0;i<poly.length;i++){
      const a=poly[i],b=poly[(i+1)%poly.length],ca=c(a)-cm,cb=c(b)-cm;
      if(ca>=0)out.push(a);
      if((ca>=0)!==(cb>=0)){const t=ca/(ca-cb);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
    }
    poly=out;
  }
  return poly.map(p=>skOrbInv(p[0],p[1]));
}
function skClipSeg(poly,x1,y1,x2,y2){
  // Segment coupé par un polygone convexe (Cyrus-Beck, sens quelconque) ; null = hors du polygone
  const n=poly.length;if(n<3)return null;
  let ar=0;for(let i=0;i<n;i++){const a=poly[i],b=poly[(i+1)%n];ar+=a[0]*b[1]-b[0]*a[1];}
  const sg=ar<0?-1:1,dx=x2-x1,dy=y2-y1;let t0=0,t1=1;
  for(let i=0;i<n;i++){
    const a=poly[i],b=poly[(i+1)%n],ex=b[0]-a[0],ey=b[1]-a[1];
    const num=sg*(ex*(y1-a[1])-ey*(x1-a[0])),den=sg*(ex*dy-ey*dx); // dedans : num + t·den ≥ 0
    if(Math.abs(den)<1e-15){if(num<0)return null;continue;}
    const t=-num/den;if(den>0){if(t>t0)t0=t;}else if(t<t1)t1=t;
    if(t0>t1)return null;
  }
  return[x1+dx*t0,y1+dy*t0,x1+dx*t1,y1+dy*t1];
}
const _v3=a=>new THREE.Vector3(a[0],a[1],a[2]);
function skOrbLocal(w){const{u,v,n}=sketchBasis(skEdit);return[w.dot(u),w.dot(v),w.dot(n)];}
function skOrbWorld(a){const{u,v,n}=sketchBasis(skEdit);return new THREE.Vector3().addScaledVector(u,a[0]).addScaledVector(v,a[1]).addScaledVector(n,a[2]);}
function skOrbBtnSync(){
  try{const b=$('skOrbit');if(b){const on=!skOrbIsFront();b.classList.toggle('on',on);
    b.title=on?'Revenir à plat, face de l’esquisse devant, vue orthogonale (touche N)':'Vue 3D inclinée en perspective — orbite : clic-molette glissé, ou cube de vue · N = à plat';}}catch(e){}
}
function skOrbFrontUp(){ // haut de la vue à plat, en local : Z du monde projeté (plan horizontal : Y)
  const{n}=sketchBasis(skEdit);
  const up=Math.abs(n.z)>0.95?new THREE.Vector3(0,1,0):new THREE.Vector3(0,0,1);
  const U=skOrbLocal(up);U[2]=0;
  return Math.hypot(U[0],U[1])>1e-6?U:[0,1,0];
}
function skOrbIsFront(){
  if(!skEdit)return true;
  const U=skOrbFrontUp(),h=Math.hypot(U[0],U[1]);
  return Math.abs(skOrb.D[2]-1)<1e-9&&Math.abs(skOrb.U[0]-U[0]/h)<1e-9&&Math.abs(skOrb.U[1]-U[1]/h)<1e-9;
}
function skOrbSetFrame(D,U,noDraw){
  // D, U en LOCAL ; orthonormalisés — jamais EXACTEMENT par la tranche (homographie non inversible)
  let d=D.slice(),L=Math.hypot(d[0],d[1],d[2])||1;d=d.map(x=>x/L);
  if(Math.abs(d[2])<1e-3){
    const sg=d[2]<0?-1:1,h=Math.hypot(d[0],d[1])||1,c=Math.sqrt(1-1e-6);
    d=[d[0]/h*c,d[1]/h*c,sg*1e-3];
  }
  let u=U.slice();const k=u[0]*d[0]+u[1]*d[1]+u[2]*d[2];u=[u[0]-k*d[0],u[1]-k*d[1],u[2]-k*d[2]];
  L=Math.hypot(u[0],u[1],u[2]);
  if(L<1e-6){u=Math.abs(d[2])<0.9?[0,0,1]:[0,1,0];const k2=u[0]*d[0]+u[1]*d[1]+u[2]*d[2];u=[u[0]-k2*d[0],u[1]-k2*d[1],u[2]-k2*d[2]];L=Math.hypot(u[0],u[1],u[2]);}
  u=u.map(x=>x/L);
  const r=[u[1]*d[2]-u[2]*d[1],u[2]*d[0]-u[0]*d[2],u[0]*d[1]-u[1]*d[0]]; // R = U × D
  if(Math.abs(d[2]-1)<1e-12&&Math.abs(u[1]-1)<1e-12){d=[0,0,1];u=[0,1,0];r[0]=1;r[1]=0;r[2]=0;}
  skOrb={R:r,U:u,D:d};
  skOrbBtnSync();
  if(skEdit&&!noDraw)drawSketch2D();
}
function skOrbFromWorld(Dw,Uw,noDraw){if(skEdit)skOrbSetFrame(skOrbLocal(Dw.clone().normalize()),skOrbLocal(Uw),noDraw);}
function skOrbFront(noDraw){if(skEdit)skOrbSetFrame([0,0,1],skOrbFrontUp(),noDraw);}
function skOrbDragBy(dx,dy){
  // Orbite EXACTEMENT comme en 3D (orbitRotate) — même vitesse, orbite contrainte (tour autour du
  // Z de la vue, bascule bornée avant les pôles, Z en haut) ou libre (axes écran, roulis compris) ;
  // pivot au centre du dessin. Le plan peut passer par la tranche : on voit l'esquisse de dos.
  if(!skEdit)return;
  const k=2*Math.PI/((renderer&&renderer.domElement.clientHeight)||600)*((controls&&controls.rotateSpeed)||1);
  const D=skOrbWorld(skOrb.D),U=skOrbWorld(skOrb.U),R=new THREE.Vector3().crossVectors(U,D).normalize();
  let q;
  if(orbitFree){
    q=new THREE.Quaternion().setFromAxisAngle(U,-dx*k).multiply(new THREE.Quaternion().setFromAxisAngle(R,-dy*k));
    D.applyQuaternion(q);U.applyQuaternion(q);
  }else{
    const phi=Math.acos(Math.max(-1,Math.min(1,D.dot(_mn))));
    const lim=1e-3,a=Math.max(lim,Math.min(Math.PI-lim,phi-dy*k))-phi;
    q=new THREE.Quaternion().setFromAxisAngle(_mn,-dx*k).multiply(new THREE.Quaternion().setFromAxisAngle(R,a));
    D.applyQuaternion(q);U.applyQuaternion(q);
    const Uz=_mn.clone().addScaledVector(D,-_mn.dot(D)); // haut de l'écran = Z de la vue
    if(Uz.lengthSq()>1e-12)U.copy(Uz.normalize());
  }
  skOrbFromWorld(D,U);
}
function skOrbSnapFace(){ // lâchée presque de face : la vue se recale DANS le plan (orthographique)
  if(!skEdit||!skPersp()||Math.abs(skOrb.D[2])<SK_SNAP_FACE)return;
  skOrbSetFrame([0,0,skOrb.D[2]<0?-1:1],[skOrb.U[0],skOrb.U[1],0]);
}
function skOrbTick(){
  // inertie de l'orbite d'esquisse : comme orbitTick (ORBIT_ROT_DAMP du reste par image)
  const o=(typeof skOrbDrag!=='undefined')?skOrbDrag:null;if(!o)return;
  if(!skEdit){skOrbDrag=null;return;}
  if(o.vx||o.vy){
    const f=(controls&&controls.enableDamping)?ORBIT_ROT_DAMP:1;
    skOrbDragBy(o.vx*f,o.vy*f);o.vx*=1-f;o.vy*=1-f;
    if(Math.abs(o.vx)<0.01&&Math.abs(o.vy)<0.01)o.vx=o.vy=0;
  }
  if(!o.down&&!o.vx&&!o.vy){skOrbDrag=null;skOrbSnapFace();}
}
function sketchViewDir(o){
  // Cube de vue / boutons de vue pendant l'esquisse : on oriente la vue d'esquisse (le plan
  // reste éditable), Z en haut ; dessus / dessous : Y en haut. true = pris en charge.
  if(!skEdit||!_skOrtho)return false;
  const D=new THREE.Vector3(o[0],o[1],o[2]).normalize();
  skOrbFromWorld(D,Math.abs(D.z)>0.99?new THREE.Vector3(0,1,0):new THREE.Vector3(0,0,1));
  return true;
}
let _skPrevCam=null, _skBaseDist=400, _skBaseS=2.2, _skOrtho=null, _skOrigCam=null, _skLaySig='';
function sketchAlignCamera(){
  try{
    if(!skEdit||!camera||!controls||!renderer) return;
    _skOrigCam=camera;
    _skPrevCam={pos:camera.position.clone(),target:controls.target.clone(),up:camera.up.clone(),rot:controls.enableRotate};
    _skBaseS=skView.s||2.2;
    _skKeep=false;_skH=_skHi=null;
    if(!skFlatOpen&&camera.isPerspectiveCamera){
      // Vue 3D GARDÉE : même direction, même haut, même échelle au point visé ; le centre du
      // dessin = point du plan sous le centre de la zone d'esquisse (repli : cible projetée).
      try{
        const B=sketchBasis(skEdit),Dw=camera.position.clone().sub(controls.target).normalize();
        const Uw=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion);
        const dist=camera.position.distanceTo(controls.target)||150;
        const Hr=renderer.domElement.clientHeight||svgSize().H;
        const s=Hr/(2*dist*Math.tan((camera.fov||45)*Math.PI/360));
        const svgR=svg.getBoundingClientRect(),rr=renderer.domElement.getBoundingClientRect();
        const nd=new THREE.Vector2((svgR.left+svgR.width/2-rr.left)/rr.width*2-1,-((svgR.top+svgR.height/2-rr.top)/rr.height*2-1));
        const rc=new THREE.Raycaster();camera.updateMatrixWorld();rc.setFromCamera(nd,camera);
        const hit=new THREE.Vector3(),pl=new THREE.Plane().setFromNormalAndCoplanarPoint(B.n,B.o);
        let P=rc.ray.intersectPlane(pl,hit);
        if(!P||P.distanceTo(controls.target)>20*dist)P=pl.projectPoint(controls.target,new THREE.Vector3());
        const d=P.clone().sub(B.o);
        skView.s=Math.max(SK_SCALE_MIN,Math.min(SK_SCALE_MAX,s));skView.cx=d.dot(B.u);skView.cy=d.dot(B.v);skUpdateTols();
        skOrbFromWorld(Dw,Uw,true);
        _skKeep=true;
      }catch(e){_skKeep=false;}
    }
    if(!_skKeep)skOrbFront(true);
    _skOrtho=new THREE.OrthographicCamera(-1,1,1,-1,0.1,20000);
    camera=_skOrtho; controls.object=camera; controls.enableRotate=false;
    drawSketch2D();
  }catch(e){}
}
function sketchLayoutSig(){
  const a=svg.getBoundingClientRect(),b=renderer.domElement.getBoundingClientRect();
  return [a.left,a.top,a.width,a.height,b.left,b.top,b.width,b.height].map(Math.round).join(',');
}
function sketchSyncCamera(){
  // Caméra calée sur le SVG : DE FACE, caméra orthographique (frustum asymétrique, le pivot de
  // l'orbite est le milieu du dessin) ; HORS DU PLAN, la caméra perspective de l'espace 3D, à la
  // distance qui donne s px/mm au centre du dessin (décalage de vue : ce centre tombe au milieu
  // du SVG) — l'homographie _skH (SVG normal → SVG affiché) en est tirée.
  try{
    if(!skEdit||!_skOrtho||!controls||!renderer) return;
    const {o,u,v}=sketchBasis(skEdit);
    const {W,H}=svgSize(); const s=skView.s||2.2;
    const Wr=renderer.domElement.clientWidth||W, Hr=renderer.domElement.clientHeight||H;
    const svgR=svg.getBoundingClientRect(), rendR=renderer.domElement.getBoundingClientRect();
    _skLaySig=sketchLayoutSig();
    const ox=svgR.left-rendR.left, oy=svgR.top-rendR.top, scx=ox+W/2, scy=oy+H/2;
    const tgt=o.clone().addScaledVector(u, skView.cx).addScaledVector(v, skView.cy);
    const Dw=skOrbWorld(skOrb.D), Uw=skOrbWorld(skOrb.U);
    const P=(_skOrigCam&&_skOrigCam.isPerspectiveCamera)?_skOrigCam:null;
    _skH=_skHi=null;_skEdge=false;
    if(P&&skPersp()){
      const dist=Hr/(2*s*Math.tan((P.fov||50)*Math.PI/360));
      camera=P; controls.object=P;
      P.aspect=Wr/Hr; P.near=Math.max(0.01,dist/1000); P.far=dist*20+20000;
      P.setViewOffset(Wr,Hr,Wr/2-scx,Hr/2-scy,Wr,Hr);
      P.position.copy(tgt).addScaledVector(Dw,dist); P.up.copy(Uw);
      controls.target.copy(tgt); controls.update();
      P.updateProjectionMatrix(); P.updateMatrixWorld();
      // point SVG normal (px,py) → plan → écran : [X·w, Y·w, w] est affine en (px,py)
      const M=new THREE.Matrix4().multiplyMatrices(P.projectionMatrix,P.matrixWorldInverse),q4=new THREE.Vector4();
      const f=(px,py)=>{const x=skView.cx+(px-W/2)/s,y=skView.cy-(py-H/2)/s;
        q4.set(o.x+u.x*x+v.x*y,o.y+u.y*x+v.y*y,o.z+u.z*x+v.z*y,1).applyMatrix4(M);
        return[(q4.x+q4.w)/2*Wr-ox*q4.w,(q4.w-q4.y)/2*Hr-oy*q4.w,q4.w];};
      const c=f(0,0),a=f(1,0),b=f(0,1),wc=f(W/2,H/2)[2]||1;
      const h=[a[0]-c[0],b[0]-c[0],c[0],a[1]-c[1],b[1]-c[1],c[1],a[2]-c[2],b[2]-c[2],c[2]].map(x=>x/wc);
      // inverse (adjointe), normalisée : w = 1 au centre du SVG
      const I=[h[4]*h[8]-h[5]*h[7],h[2]*h[7]-h[1]*h[8],h[1]*h[5]-h[2]*h[4],
               h[5]*h[6]-h[3]*h[8],h[0]*h[8]-h[2]*h[6],h[2]*h[3]-h[0]*h[5],
               h[3]*h[7]-h[4]*h[6],h[1]*h[6]-h[0]*h[7],h[0]*h[4]-h[1]*h[3]];
      const ic=I[6]*W/2+I[7]*H/2+I[8];
      _skH=h; _skHi=Math.abs(ic)>1e-12?I.map(x=>x/ic):null;
      _skEdge=Math.abs(skOrb.D[2])<SK_EDGE||!_skHi;
    }else{
      camera=_skOrtho; controls.object=_skOrtho;
      _skOrtho.left=-scx/s; _skOrtho.right=(Wr-scx)/s; _skOrtho.top=scy/s; _skOrtho.bottom=-(Hr-scy)/s;
      _skOrtho.position.copy(tgt).addScaledVector(Dw, 2000);
      _skOrtho.up.copy(Uw); _skOrtho.lookAt(tgt); _skOrtho.updateProjectionMatrix();
      controls.target.copy(tgt); controls.update();
    }
  }catch(e){}
}
function sketchCamTick(){
  // La mise en page bouge encore APRÈS l'ouverture (barre d'outils d'esquisse, panneau,
  // arborescence rabattue) : la caméra calée sur l'ancienne taille montrait la pièce
  // décalée jusqu'au premier clic. On suit la géométrie réelle à chaque image ; dans la
  // seconde qui suit une ouverture À PLAT on recadre (cadrage d'ouverture, sur la taille finale).
  try{skOrbTick();}catch(e){}
  try{
    if(!skEdit||!_skOrtho)return;
    if(sketchLayoutSig()===_skLaySig)return;
    if(!_skKeep&&skOpenAt&&performance.now()-skOpenAt<1000)skFitView();else drawSketch2D();
  }catch(e){}
}
function sketchRestoreCamera(){
  try{
    const keep=_skKeep&&skEdit&&_skOrtho;
    let K=null;
    if(keep){ // vue 3D gardée à l'ouverture → la sortie garde aussi l'orientation de l'esquisse
      const B=sketchBasis(skEdit);
      K={T:B.o.clone().addScaledVector(B.u,skView.cx).addScaledVector(B.v,skView.cy),D:skOrbWorld(skOrb.D),U:skOrbWorld(skOrb.U)};
    }
    if(_skOrigCam){ camera=_skOrigCam; controls.object=camera; // perspective d'esquisse : décalage de vue et plans de coupe remis
      try{camera.clearViewOffset();camSetFov(viewFov,false);camera.aspect=(renderer.domElement.clientWidth||1)/(renderer.domElement.clientHeight||1);camera.updateProjectionMatrix();}catch(e){} }
    if(_skPrevCam&&camera&&controls){
      camera.up.copy(_skPrevCam.up);
      controls.enableRotate=_skPrevCam.rot;
      if(K&&camera.isPerspectiveCamera){
        const Hr=renderer.domElement.clientHeight||600;
        const dist=Hr/(2*(skView.s||2.2)*Math.tan((camera.fov||45)*Math.PI/360));
        controls.target.copy(K.T);
        camera.position.copy(K.T).addScaledVector(K.D,dist);
        if(Math.abs(K.D.dot(camera.up))>0.999)camera.position.addScaledVector(K.U,-dist*1e-4); // pôle : lookAt défini
      }else{
        camera.position.copy(_skPrevCam.pos);
        controls.target.copy(_skPrevCam.target);
      }
      controls.update();
    }
    _skPrevCam=null; _skOrtho=null; _skOrigCam=null; _skKeep=false; skOrb={R:[1,0,0],U:[0,1,0],D:[0,0,1]};
    _skH=_skHi=null; _skEdge=false; try{skSvgPHide();}catch(e){}
    try{viewCenterShift();}catch(e){} // recentrage sur la zone libre (neutre pendant l'esquisse)
  }catch(e){}
}
function findHostForFace(pt,n,tol){
  // Face porteuse : extrusion antérieure contenant pt (tol 1 mm par défaut).
  //  · TOP/BOTTOM : plan haut/bas, normale ∥ axe d'extrusion — comportement historique.
  //  · SIDE : face latérale = ARÊTE du footprint extrudée (normale ⟂ axe) — le plan SUIT
  //    l'arête quand le profil bouge, et h est clampé à la course → poches latérales suivent.
  // Null si plan d'origine. `tol` : tolérance (mm) pour le réancrage d'un hôte périmé.
  tol=(tol>0)?tol:1.0;
  let best=null,bd=1e9;
  for(const f of (doc.features||[])){
    if(f.type!=='extrude'||f.visible===false)continue;
    const hs=doc.sketches.find(s=>s.id===f.sketchId);if(!hs)continue;
    try{
      const B=sketchBasis(hs),o=B.o,hn=B.n,hu=B.u,hv=B.v;
      const dot=n.dot(hn);
      if(Math.abs(Math.abs(dot)-1)>1e-2&&Math.abs(dot)>1e-2)continue; // ni ∥ ni ⟂ : ni haut/bas ni latéral
      if(Math.abs(Math.abs(dot)-1)<=1e-2){
      const spH=extrudeSpan(f);
      const top=o.clone().addScaledVector(hn,spH.hi),bot=o.clone().addScaledVector(hn,spH.lo);
      const cand=(dot>0)?top:bot; // pt doit être sur TOP si n==hn, BOTTOM si n==-hn
      const mDist=Math.abs(n.dot(new THREE.Vector3().subVectors(pt,cand)));
      if(mDist>tol||mDist>bd)continue;
      // footprint : pt projeté sur le plan de l'esquisse porteuse
      const dx=pt.x-o.x,dy=pt.y-o.y,dz=pt.z-o.z;
      const x=dx*hu.x+dy*hu.y+dz*hu.z,y=dx*hv.x+dy*hv.y+dz*hv.z;
      // on applique les congés 2D de l'extrusion porteuse (sinon coins arrondis ratés)
      let data=hs;
      try{
        const fils=(doc.features||[]).filter(fi=>fi.type==='fillet'&&fi.target===f.id&&fi.visible!==false);
        if(fils.length){const rf=applyFilletsToSketch(hs,fils);data=rf.sk;}
      }catch(e){data=hs;}
      const tr=skLoopTrace(data);
      if(!tr||(!tr.solids.length&&!tr.circlesOut.length))continue;
      // pip direct sur les boucles 2D : on reconstruit l'enveloppe comme au rebuild
      const rings=[];
      try{
        for(const sol of tr.solids){
          const ch=sol.chain;if(!ch||!ch.length)continue;
          const ring=chainPolygon(ch,tr.pts);
          if(ring&&ring.length>=3)rings.push({ring,holes:(sol.holes||[]).map(h=>chainPolygon(h,tr.pts))});
        }
        (tr.circlesOut||[]).forEach(c=>{
          const Cc=data.points[c.pc];if(!Cc)return;
          const ring=[];for(let i=0;i<48;i++){const a=i/48*Math.PI*2;ring.push([Cc.x+c.r*Math.cos(a),Cc.y+c.r*Math.sin(a)]);}
          rings.push({ring,holes:[]});
        });
      }catch(e){}
      let hit=false;
      for(const r of rings){
        const onEdge=r.ring.some((_,i,a)=>distSeg2(x,y,a[i][0],a[i][1],a[(i+1)%a.length][0],a[(i+1)%a.length][1])<0.6);
        if(!pip([x,y],r.ring)&&!onEdge)continue;
        let inHole=false;
        for(const h of (r.holes||[])){
          const holeOnEdge=h.some((_,i,a)=>distSeg2(x,y,a[i][0],a[i][1],a[(i+1)%a.length][0],a[(i+1)%a.length][1])<0.6);
          if(h&&(pip([x,y],h)||holeOnEdge)){inHole=true;break;}
        }
        if(!inHole||onEdge){hit=true;break;}
      }
      if(!hit)continue;
      best={feat:f,tag:(dot>0)?'TOP':'BOTTOM',x:+x.toFixed(3),y:+y.toFixed(3)};bd=mDist;
      }else{
        // ── SIDE : face latérale ⟂ à l'axe d'extrusion = arête footprint (lignes non construction)
        const dx=pt.x-o.x,dy=pt.y-o.y,dz=pt.z-o.z;
        const x=dx*hu.x+dy*hu.y+dz*hu.z,y=dx*hv.x+dy*hv.y+dz*hv.z,zl=dx*hn.x+dy*hn.y+dz*hn.z;
        const spS=extrudeSpan(f),lo=spS.lo,hi=spS.hi;
        if(zl<lo-tol||zl>hi+tol)continue; // hors course du prisme : ce n'est pas UNE de ses faces
        const n2x=n.x*hu.x+n.y*hu.y+n.z*hu.z,n2y=n.x*hv.x+n.y*hv.y+n.z*hv.z;
        if(Math.hypot(n2x,n2y)<0.99)continue; // normale pas dans le plan de l'esquisse porteuse
        let bestE=null,bd2=1e9;
        for(const en of (hs.entities||[])){
          if(en.t!=='line'||en.construction)continue;
          const a=hs.points[en.p1],b=hs.points[en.p2];if(!a||!b)continue;
          const ex=b.x-a.x,ey=b.y-a.y,L2=ex*ex+ey*ey;if(L2<1e-12)continue;
          const ux=ex/Math.sqrt(L2),uy=ey/Math.sqrt(L2);
          if(Math.abs(ux*n2x+uy*n2y)>0.1)continue; // arête non ⟂ à la normale de la face
          const t=((x-a.x)*ex+(y-a.y)*ey)/L2;
          const px=a.x+ex*t,py=a.y+ey*t; // projection sur la droite (plan de la face = droite ∞ extrudée)
          const dist=Math.hypot(x-px,y-py);
          if(dist>tol||dist>bd2)continue;
          bd2=dist;bestE={en,px,py};
        }
        if(!bestE||bd2>bd)continue;
        best={feat:f,tag:'SIDE',x:+bestE.px.toFixed(3),y:+bestE.py.toFixed(3),edge:bestE.en.id,h:+zl.toFixed(3)};
        bd=bd2;
      }
    }catch(e){}
  }
  return best;
}
function chainPolygon(chain,pts){
  // Chaîne d'esquisse → polygone 2D approximé (lignes + arcs discrétisés)
  try{
    const ring=[];
    if(!chain||!chain.length)return null;
    const sk=doc.sketches.find(s=>chain[0]&&chain[0].from&&pts[chain[0].from])?null:null;
    void sk;
    for(let i=0;i<chain.length;i++){
      const st=chain[i],ed=st.ed;
      if(ed.kind==='line'){
        const q=pts[(ed.a===st.from)?ed.b:ed.a];if(!q)continue;
        ring.push([q.x,q.y]);
        if(i===0){const a=pts[st.from];if(a)ring.unshift([a.x,a.y]);}
      }else if(ed.kind==='arc'){
        const a=ed.e,C=pts[a.pc];if(!C)return null;
        const an=arcAngles({points:pts},a);if(!an)return null;
        const fwd=(ed.a===st.from);
        let a1=fwd?an.a1:an.a2,a2=fwd?an.a2:an.a1;
        let dd=a2-a1;const TAU=Math.PI*2;dd=((dd%TAU)+TAU)%TAU;if(dd<1e-9)dd=TAU;
        const n=Math.max(8,Math.ceil(dd/TAU*48));
        for(let k=1;k<=n;k++){const t=a1+dd*k/n;ring.push([C.x+a.r*Math.cos(t),C.y+a.r*Math.sin(t)]);}
        if(i===0){const a0=pts[st.from];if(a0)ring.unshift([a0.x,a0.y]);}
      }else if(ed.kind==='spline'){
        const pl=skEdgePoly(ed,st.from);for(let k=(i===0?0:1);k<pl.length;k++)ring.push([pl[k][0],pl[k][1]]);
      }
    }
    return ring;
  }catch(e){return null;}
}
function resolveSketchHost(sk){
  // Replace l'origine d'une esquisse posée sur face à partir de son host (antériorité).
  //  · TOP/BOTTOM : translation le long de la normale porteuse (suivi d'épaisseur) — inchangé.
  //  · SIDE : glisse (x,y) sur l'arête footprint VIVANTE (profil qui bouge → la face suit) et
  //    clamp h à la course [min(0,d),max(0,d)] (épaisseur réduite → la poche reste sur la face).
  // Retourne true si déplacée.
  if(!sk||!sk.host||!sk.host.feat)return false;
  const hf=doc.features.find(f=>f.id===sk.host.feat);if(!hf)return false;
  const hs=doc.sketches.find(s=>s.id===hf.sketchId);if(!hs)return false;
  const B=sketchBasis(hs);
  const spH=extrudeSpan(hf);
  if(spH.unres)return false; // étendue « à travers tout » non mesurable (aucun solide) : origine inchangée
  const nx=B.n.x,ny=B.n.y,nz=B.n.z;
  const ox=B.o.x,oy=B.o.y,oz=B.o.z;
  const ux=B.u.x,uy=B.u.y,uz=B.u.z,vx=B.v.x,vy=B.v.y,vz=B.v.z;
  const x=sk.host.x||0,y=sk.host.y||0,tag=sk.host.tag||'TOP';
  let nx2,ny2,nz2;
  if(tag==='SIDE'){
    // glissement sur l'arête porteuse (si elle existe encore) — sinon coords figées (repli)
    let x2=x,y2=y;
    const en=hs.entities&&hs.entities.find(e=>e.id===sk.host.edge&&e.t==='line');
    if(en&&hs.points[en.p1]&&hs.points[en.p2]){
      const a=hs.points[en.p1],b=hs.points[en.p2];
      const ex=b.x-a.x,ey=b.y-a.y,L2=ex*ex+ey*ey;
      if(L2>1e-12){const t=((x-a.x)*ex+(y-a.y)*ey)/L2;x2=+(a.x+ex*t).toFixed(3);y2=+(a.y+ey*t).toFixed(3);}
    }
    let h=(sk.host.h!=null&&isFinite(sk.host.h))?sk.host.h:0;
    const lo=spH.lo,hi=spH.hi;
    if(h<lo)h=lo;else if(h>hi)h=hi; // suit le raccourcissement (non destructif : h d'origine inchangé)
    nx2=ox+nx*h+ux*x2+vx*y2;
    ny2=oy+ny*h+uy*x2+vy*y2;
    nz2=oz+nz*h+uz*x2+vz*y2;
  }else{
    const baseD=(tag==='TOP')?spH.hi:spH.lo;
    nx2=ox+nx*baseD+ux*x+vx*y;
    ny2=oy+ny*baseD+uy*x+vy*y;
    nz2=oz+nz*baseD+uz*x+vz*y;
  }
  if(Math.hypot(nx2-sk.origin[0],ny2-sk.origin[1],nz2-sk.origin[2])<1e-6)return false;
  sk.origin[0]=+nx2.toFixed(3);sk.origin[1]=+ny2.toFixed(3);sk.origin[2]=+nz2.toFixed(3);
  // normal/axes de la porteuse : restent ceux de la face (host ne tourne pas en prisme droit)
  return true;
}
function reanchorSketchHost(sk){
  // Hôte PÉRIMÉ : la fonction porteuse a été supprimée/remplacée et sk.host.feat ne
  // désigne plus rien → l'esquisse restait figée (perçage « comme avant » après un
  // déplacement de face). On retrouve la face VIVANTE la plus proche, puis on réécrit
  // sk.host pour que resolveSketchHost la fasse de nouveau suivre le solide.
  if(!sk||sk.plane!=='FACE')return false;
  if(sk.host&&sk.host.feat&&doc.features.some(f=>f.id===sk.host.feat))return false; // hôte vivant
  if(!sk.axN)return false;
  const name=(sk.host&&sk.host.name)||null;
  const nv=new THREE.Vector3(+sk.axN[0]||0,+sk.axN[1]||0,+sk.axN[2]||0);
  if(!(nv.lengthSq()>1e-6))return false;
  nv.normalize();
  const set=h=>{
    sk.host=Object.assign({feat:h.feat.id,tag:h.tag,x:h.x,y:h.y,name:name||entName('face')},
      (h.tag==='SIDE')?{edge:h.edge,h:h.h}:{});
    return true;
  };
  const tryPt=(p,tol)=>{try{return findHostForFace(new THREE.Vector3(p[0],p[1],p[2]),nv.clone(),tol);}catch(e){return null;}};
  // 1) l'ORIGINE d'abord : x/y/h sont ceux de l'origine → la position de l'esquisse est
  //    conservée (l'arête projetée ne sert qu'en secours, ses points pouvant l'avoir quittée).
  if(sk.origin&&isFinite(sk.origin[0])&&isFinite(sk.origin[1])&&isFinite(sk.origin[2])){
    for(const tl of [1.0,5.0]){const h=tryPt(sk.origin,tl);if(h&&h.feat)return set(h);}
  }
  // 2) sinon les arêtes projetées (srcMid) : on garde l'hôte le plus fréquent.
  const tally=new Map();
  for(const en of (sk.entities||[])){
    if(!(en.proj&&en.srcMid&&isFinite(en.srcMid[0])&&isFinite(en.srcMid[1])&&isFinite(en.srcMid[2])))continue;
    for(const tl of [1.0,5.0]){
      const h=tryPt(en.srcMid,tl);if(!h||!h.feat)continue;
      const key=h.feat.id+'|'+h.tag+'|'+(h.edge||'');
      const t=tally.get(key)||{n:0,h:h};t.n++;tally.set(key,t);
      break;
    }
  }
  let best=null,bn=0;
  for(const t of tally.values())if(t.n>bn){bn=t.n;best=t.h;}
  return best?set(best):false;
}
function resolveAllSketchHosts(){
  // Appelé en tête de chaque rebuild : matérialise toutes les esquisses sur faces.
  let ch=false;
  for(let pass=0;pass<3;pass++){
    let any=false;
    for(const sk of (doc.sketches||[])){
      if(sk.plane==='FACE'&&sk.host&&sk.host.feat){if(resolveSketchHost(sk))any=true;}
    }
    if(!any)break;ch=ch||any;
  }
  // hôtes PÉRIMÉS : la fonction porteuse n'existe plus → réancrage sur la face vivante
  for(const sk of (doc.sketches||[])){
    if(sk.plane!=='FACE'||!sk.host||!sk.host.feat)continue; // sans hôte : migration plus bas
    if(doc.features.some(f=>f.id===sk.host.feat))continue;  // hôte vivant : rien à faire
    if(reanchorSketchHost(sk))ch=true;
  }
  // l'hôte réancré vient d'être écrit : matérialise tout de suite les origines
  for(let pass=0;pass<3;pass++){
    let any=false;
    for(const sk of (doc.sketches||[])){
      if(sk.plane==='FACE'&&sk.host&&sk.host.feat){if(resolveSketchHost(sk))any=true;}
    }
    if(!any)break;ch=ch||any;
  }
  // migration : héritage de noms manquants (documents antérieurs au nommage)
  for(const sk of (doc.sketches||[])){
    if(sk.plane==='FACE'&&sk.host&&sk.host.feat&&!sk.host.name){sk.host.name=entName('face');ch=true;}
  }
  // migration : anciennes esquisses FACE sans host (origines à 20mm figées) → infère
  for(const sk of (doc.sketches||[])){
    if(sk.plane!=='FACE'||sk.host)continue;
    if(!sk.origin||!isFinite(sk.origin[0]))continue;
    if(!sk.axN)continue;
    const pt=new THREE.Vector3(sk.origin[0],sk.origin[1],sk.origin[2]);
    const n=new THREE.Vector3(sk.axN[0],sk.axN[1],sk.axN[2]).normalize();
    const h=findHostForFace(pt,n);
    if(h){sk.host=Object.assign({feat:h.feat.id,tag:h.tag,x:h.x,y:h.y,name:entName('face')},(h.tag==='SIDE')?{edge:h.edge,h:h.h}:{});ch=true;}
  }
  return ch;
}
function basisOnFace(nw,refU){
  // (u,v) dans le plan de normale nw ; u = refU projeté (alignement repère parent → projections symétriques)
  const n=nw.clone().normalize();
  let u=refU?refU.clone().addScaledVector(n,-n.dot(refU)):null;
  if(!u||u.lengthSq()<1e-8){
    u=new THREE.Vector3(1,0,0);u.addScaledVector(n,-n.dot(u));
    if(u.lengthSq()<1e-8){u=new THREE.Vector3(0,1,0);u.addScaledVector(n,-n.dot(u));}
  }
  u.normalize();
  const v=new THREE.Vector3().crossVectors(n,u).normalize();
  return{u,v,n};
}
function faceRefU(n){
  // U de la dernière esquisse parallèle (parent de la face), sinon X global
  for(let i=doc.sketches.length-1;i>=0;i--){
    const sk=doc.sketches[i];let nn=null,uu=null;
    if(sk.axN&&sk.axU){nn=new THREE.Vector3(sk.axN[0],sk.axN[1],sk.axN[2]);uu=new THREE.Vector3(sk.axU[0],sk.axU[1],sk.axU[2]);}
    else if(sk.plane&&sk.plane!=='FACE'){const b=planeBasis(sk.plane,null);nn=b.n;uu=b.u;}
    if(nn&&uu&&Math.abs(Math.abs(nn.dot(n))-1)<1e-3)return uu;
  }
  return new THREE.Vector3(1,0,0);
}
function faceCentroid(mesh,fi){
  // Centroïde surfacique de la face cliquée (déterministe par face : même face → même point,
  // même si le clic varie, même si le centroïde surplombe un trou). Null si illisible.
  try{
    mesh.updateMatrixWorld(true);
    const g=mesh.geometry;if(!g||!g.attributes.position)return null;
    const pos=g.attributes.position,idx=g.index;
    let tris=null;
    try{
      const groups=g.userData.occGroups||[];
      const gr=(fi!==undefined&&fi!==null)?groups.find(gr=>fi>=gr.start&&fi<gr.start+gr.count):null;
      if(gr){tris=[];for(let t=gr.start;t<gr.start+gr.count;t++)tris.push(t);}
    }catch(e){}
    if(!tris){
      try{
        const grown=(typeof growTris==='function')?growTris(mesh,fi):null;
        if(grown&&grown.length)tris=grown.slice();
      }catch(e){}
    }
    if(!tris||!tris.length){
      if(fi===undefined||fi===null)return null;
      tris=[fi]; // dernier recours : le triangle cliqué
    }
    const A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3();
    let sx=0,sy=0,sz=0,sa=0;
    for(const t of tris){
      const ia=idx?idx.getX(3*t):3*t,ib=idx?idx.getX(3*t+1):3*t+1,ic=idx?idx.getX(3*t+2):3*t+2;
      if(ia<0||ib<0||ic<0||ia>=pos.count||ib>=pos.count||ic>=pos.count)continue;
      A.fromBufferAttribute(pos,ia).applyMatrix4(mesh.matrixWorld);
      B.fromBufferAttribute(pos,ib).applyMatrix4(mesh.matrixWorld);
      C.fromBufferAttribute(pos,ic).applyMatrix4(mesh.matrixWorld);
      const e1x=B.x-A.x,e1y=B.y-A.y,e1z=B.z-A.z,e2x=C.x-A.x,e2y=C.y-A.y,e2z=C.z-A.z;
      const cx=e1y*e2z-e1z*e2y,cy=e1z*e2x-e1x*e2z,cz=e1x*e2y-e1y*e2x;
      const ar=Math.hypot(cx,cy,cz)/2;
      if(!(ar>1e-12))continue;
      sx+=(A.x+B.x+C.x)/3*ar;sy+=(A.y+B.y+C.y)/3*ar;sz+=(A.z+B.z+C.z)/3*ar;sa+=ar;
    }
    if(!(sa>1e-12))return null;
    return new THREE.Vector3(sx/sa,sy/sa,sz/sa);
  }catch(e){return null;}
}
function faceSketchOrigin(mesh,n,pt,fi){
  // Règle stable (24m corrigée) : origine GLOBALE projetée si elle tombe sur la face ;
  // sinon origines d'esquisses ; sinon CENTROÏDE DE LA FACE (déterministe par face).
  // Le point de clic n'est plus utilisé qu'en ultime recours (illisible) : fini l'aléatoire.
  const d0=n.dot(pt);
  const project=o=>o.clone().addScaledVector(n,-(n.dot(o)-d0));
  const onFace=p=>{
    try{
      mesh.updateMatrixWorld(true);
      const from=p.clone().addScaledVector(n,1);
      const rc=new THREE.Raycaster(from,n.clone().negate(),0.01,3);
      const hits=rc.intersectObject(mesh,true);
      if(!hits.length)return false;
      return hits[0].distance<2.5&&hits[0].point.distanceTo(p)<0.75;
    }catch(e){return false;}
  };
  const cands=[new THREE.Vector3(0,0,0)];
  for(let i=doc.sketches.length-1;i>=0;i--){
    const sk=doc.sketches[i];
    if(sk.origin&&isFinite(sk.origin[0]))cands.push(new THREE.Vector3(sk.origin[0],sk.origin[1],sk.origin[2]));
  }
  for(const c of cands){const p=project(c);if(onFace(p))return p;}
  const fc=faceCentroid(mesh,fi);
  if(fc){
    // ramène sur le plan (le centroïde peut flotter hors plan sur face courbe) : reste déterministe
    return fc.addScaledVector(n,-(n.dot(fc)-d0));
  }
  return pt.clone();
}
/* ----- plans d'origine 3D : un quad semi-transparent par plan, couleur dédiée + étiquette ----- */
function makePlaneLabel(text,css){
  const c=document.createElement('canvas');c.width=256;c.height=128;
  const x=c.getContext('2d');x.font='700 64px sans-serif';x.textAlign='center';x.textBaseline='middle';
  x.lineWidth=10;x.strokeStyle='rgba(0,0,0,.85)';x.strokeText(text,128,64);x.fillStyle=css;x.fillText(text,128,64);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthTest:false}));
  s.scale.set(30,15,1);s.raycast=()=>{};return s;
}
function buildOriginPlanes(){
  // 2026-10-16-020 : les grands plans d'origine (quads de 120 mm) sont remplacés par les
  // 3 petits plans du repère pièce (src/11-repere.js) — mêmes clés, même œil dans l'arbre.
  try{Object.assign(originMeshes,axHelper.userData.planes);}catch(e){}
  updateOriginPlanes();
}
function updateOriginPlanes(){
  Object.keys(originMeshes).forEach(p=>{
    const m=originMeshes[p];if(!m)return;
    m.visible=originVis[p]!==false;
  });
  try{triadPaint(axHelper);}catch(e){}
}
function pickPlane(e){
  const keys=Object.keys(originMeshes).filter(p=>originVis[p]!==false);
  if(!keys.length)return null;
  const r=renderer.domElement.getBoundingClientRect();
  const ndc=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
  rayc.setFromCamera(ndc,camera);
  const hits=rayc.intersectObjects(keys.map(k=>originMeshes[k]),false);
  return hits.length?hits[0].object.userData.plane:null;
}
function skLoopTrace(sk){ // traçage de faces déterministe (demi-arêtes, mur à gauche) + trous
  const P=sk.points||{};
  const TAU=Math.PI*2;
  const normAng=a=>{a%=TAU;if(a<0)a+=TAU;return a;};
  const lines=(sk.entities||[]).filter(e=>e.t==='line'&&!e.construction&&!e.ref&&P[e.p1]&&P[e.p2]&&Math.hypot(P[e.p2].x-P[e.p1].x,P[e.p2].y-P[e.p1].y)>1e-9);
  const arcs=(sk.entities||[]).filter(e=>e.t==='arc'&&!e.construction&&P[e.pc]&&P[e.pa]&&P[e.pb]&&e.r>1e-9);
  const circles=(sk.entities||[]).filter(e=>e.t==='circle'&&!e.construction&&P[e.pc]&&e.r>1e-9);
  const pts=Object.assign({},P);
  let tn=0;
  arcs.forEach(a=>{
    const C=P[a.pc],an=arcAngles(sk,a);if(!an)return;
    const pa='__a'+(tn++),pb='__a'+(tn++);
    pts[pa]={x:C.x+a.r*Math.cos(an.a1),y:C.y+a.r*Math.sin(an.a1)};
    pts[pb]={x:C.x+a.r*Math.cos(an.a2),y:C.y+a.r*Math.sin(an.a2)};
    a._t=[pa,pb];
  });
  // 2026-10-29 : splines (50-esquisse-6) — arêtes calculées ici : une spline fermée par points de contrôle
  // a des nœuds virtuels (« __s… », la courbe ne passe par aucun pôle), ajoutés aux points comme ceux des arcs
  // lot 3 : un bout de ligne / d'arc / d'autre spline posé sur la courbe la coupe (jonction en T)
  const splEd=[],splEnds=new Set();
  lines.forEach(l=>{splEnds.add(l.p1);splEnds.add(l.p2);});arcs.forEach(a=>{splEnds.add(a.pa);splEnds.add(a.pb);});
  (sk.entities||[]).forEach(e=>{if(e.t==='spline'&&!e.construction&&e.pts.length){splEnds.add(e.pts[0]);splEnds.add(e.pts[e.pts.length-1]);}});
  (sk.entities||[]).forEach(e=>{if(e.t!=='spline'||e.construction)return;
    skSplineEdges(sk,e,skSplineCutsFor(sk,e,[...splEnds])).forEach(se=>{if(se.virt)Object.keys(se.virt).forEach(k=>{pts[k]={x:se.virt[k][0],y:se.virt[k][1]};});splEd.push([e,se]);});});
  // canonisation : fusionne les noeuds quasi-coincidents (1 µm)
  const canon=new Map(),reps=[];
  Object.keys(pts).forEach(pid=>{
    const p=pts[pid];if(!p){canon.set(pid,pid);return;}
    const f=reps.find(r=>Math.hypot(pts[r].x-p.x,pts[r].y-p.y)<1e-3);
    canon.set(pid,f||(reps.push(pid),pid));
  });
  const Cid=pid=>canon.get(pid)||pid;
  const edges=[];
  const pushEdge=(a,b,e,kind)=>{const ed={a:Cid(a),b:Cid(b),e,kind};edges.push(ed);return edges.length-1;};
  lines.forEach(l=>{const ei=pushEdge(l.p1,l.p2,l,'line');l._ei=ei;});
  arcs.forEach(a=>{if(!a._t)return;const ei=pushEdge(a._t[0],a._t[1],a,'arc');a._ei=ei;});
  // splines : arête exacte (pôles + nœuds) + polyligne ; fermée = 2 moitiés
  const splHE=[];
  splEd.forEach(([e,se])=>{const ei=pushEdge(se.a,se.b,e,'spline');Object.assign(edges[ei],{bs:se.bs,poly:se.poly});splHE.push([ei,se.o,se.i]);});
  const hes=[];
  const addHE=(ei,oAng,iAng)=>{
    const ed=edges[ei],a=hes.length;
    hes.push({from:ed.a,to:ed.b,oAng:normAng(oAng),iAng:normAng(iAng),edge:ei,twin:a+1,used:false});
    hes.push({from:ed.b,to:ed.a,oAng:normAng(iAng+Math.PI),iAng:normAng(oAng+Math.PI),edge:ei,twin:a,used:false});
  };
  lines.forEach(l=>{if(l._ei===undefined)return;const A=pts[Cid(l.p1)],B=pts[Cid(l.p2)];
    const a=Math.atan2(B.y-A.y,B.x-A.x);addHE(l._ei,a,a);});
  arcs.forEach(a=>{
    if(a._ei===undefined)return;const an=arcAngles(sk,a);if(!an)return;
    addHE(a._ei,an.a1+Math.PI/2,an.a2+Math.PI/2);
  });
  splHE.forEach(([ei,o,i])=>addHE(ei,o,i)); // tangentes de départ / d'arrivée de la courbe
  arcs.forEach(a=>{delete a._t;});lines.forEach(l=>{delete l._ei;});
  const out=new Map();
  hes.forEach((h,i)=>{if(!out.has(h.from))out.set(h.from,[]);out.get(h.from).push(i);});
  function succIdx(hi){ // successeur : plus petit virage horaire depuis le retour (mur à gauche)
    const h=hes[hi],lst=out.get(h.to)||[];
    const rev=normAng(h.iAng+Math.PI);
    let best=-1,bestCw=1e9;
    for(const j of lst){
      if(j===h.twin)continue;
      if(hes[j].used)continue;
      const cw=normAng(rev-hes[j].oAng);
      if(cw<bestCw-1e-12){bestCw=cw;best=j;}
    }
    if(best>=0)return best;
    return h.twin; // demi-tour sur éperon (bout ouvert)
  }
  const rawFaces=[];
  hes.forEach((h,i)=>{
    if(h.used)return;
    const startNode=h.from;
    hes[i].used=true;
    const stack=[i],seen=new Set([i]);
    let cur=i,done=false,guard=0;
    while(guard++<10000){
      const nx=succIdx(cur);
      if(nx<0)break;
      cur=nx;
      hes[cur].used=true;
      if(stack.length&&hes[stack[stack.length-1]].twin===cur)stack.pop();
      else stack.push(cur);
      if(hes[cur].to===startNode){done=true;break;} // refermé sur le noeud de départ
      if(seen.has(cur))break; // revisite sans fermer : dégénéré
      seen.add(cur);
    }
    if(done&&stack.length)rawFaces.push(stack);
  });
  function ringOf(steps){
    const ring=[];
    steps.forEach(ci=>{
      const h=hes[ci],ed=edges[h.edge];
      if(ed.kind==='line'){const q=pts[h.to];ring.push([q.x,q.y]);}
      else if(ed.kind==='spline'){const pl=skEdgePoly(ed,h.from);for(let k=1;k<pl.length;k++)ring.push([pl[k][0],pl[k][1]]);}
      else{const a=ed.e,Cc=pts[a.pc],an=arcAngles(sk,a);if(!an||!Cc)return;
        const fwd=(ed.a===h.from);
        let sA=fwd?an.a1:an.a2,sB=fwd?an.a2:an.a1;
        let dd=sB-sA;dd=((dd%TAU)+TAU)%TAU;if(dd<1e-9)dd=TAU;
        const n2=Math.max(2,Math.ceil(dd/TAU*24));
        for(let k=1;k<=n2;k++){const t=sA+dd*k/n2;ring.push([Cc.x+a.r*Math.cos(t),Cc.y+a.r*Math.sin(t)]);}
      }
    });
    return ring;
  }
  function polyArea(rg){let s=0;for(let i=0;i<rg.length;i++){const a=rg[i],b=rg[(i+1)%rg.length];s+=a[0]*b[1]-b[0]*a[1];}return s/2;}
  function faceSample(steps){
    const h=hes[steps[0]],ed=edges[h.edge];
    if(ed.kind==='line'){const A=pts[h.from],B=pts[h.to];return[(A.x+B.x)/2,(A.y+B.y)/2];}
    if(ed.kind==='spline'){const q=ed.poly[Math.floor(ed.poly.length/2)];return[q[0],q[1]];}
    const a=ed.e,Cc=pts[a.pc],an=arcAngles(sk,a);
    const mid=(an.a1+an.a2)/2;return[Cc.x+a.r*Math.cos(mid),Cc.y+a.r*Math.sin(mid)];
  }
  function pipPt(pt,rg){
    let ins=false;
    for(let i=0,j=rg.length-1;i<rg.length;j=i++){
      const xi=rg[i][0],yi=rg[i][1],xj=rg[j][0],yj=rg[j][1];
      if(((yi>pt[1])!==(yj>pt[1]))&&(pt[0]<(xj-xi)*(pt[1]-yi)/(yj-yi)+xi))ins=!ins;
    }
    return ins;
  }
  function segDist(px,py,ax,ay,bx,by){
    const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy||1e-18;
    let t=((px-ax)*dx+(py-ay)*dy)/L2;t=Math.max(0,Math.min(1,t));
    return Math.hypot(px-(ax+t*dx),py-(ay+t*dy));
  }
  function ringDist(pt,rg){
    let m=1e18;
    for(let i=0;i<rg.length;i++){const a=rg[i],b=rg[(i+1)%rg.length];
      const d=segDist(pt[0],pt[1],a[0],a[1],b[0],b[1]);if(d<m)m=d;}
    return m;
  }
  const strictInRing=(pt,rg)=>pipPt(pt,rg)&&ringDist(pt,rg)>1e-6;
  const faces=[];
  rawFaces.forEach(steps=>{
    const ring=ringOf(steps);
    if(ring.length<3)return;
    const area=polyArea(ring);
    if(Math.abs(area)<1e-6)return; // éperon / dégénéré
    faces.push({steps,ring,area,sample:faceSample(steps),parent:-1,depth:0,children:[]});
  });
  // imbrication STRICTE : un jumeau (même anneau) ne peut jamais être parent ; la frontière ne compte pas.
  faces.forEach((f,i)=>{
    let best=-1,bestA=1e18;
    faces.forEach((g,j)=>{
      if(i===j)return;
      if(!(Math.abs(g.area)>Math.abs(f.area)*1.000000001+1e-12))return;
      let ok=f.ring.length>0;
      for(const v of f.ring){if(!strictInRing(v,g.ring)){ok=false;break;}}
      if(ok&&Math.abs(g.area)<bestA){bestA=Math.abs(g.area);best=j;}
    });
    f.parent=best;
  });
  faces.forEach((f,i)=>{if(f.parent>=0)faces[f.parent].children.push(i);});
  faces.forEach((f,i)=>{let d=0,p=f.parent;while(p>=0){d++;p=faces[p].parent;}f.depth=d;});
  const toChain=steps=>steps.map(ci=>({ed:edges[hes[ci].edge],from:hes[ci].from}));
  const ringKey=r=>{let x0=1e18,x1=-1e18,y0=1e18,y1=-1e18;for(const p of r){if(p[0]<x0)x0=p[0];if(p[0]>x1)x1=p[0];if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1];}
    return r.length+'|'+x0.toFixed(3)+','+y0.toFixed(3)+'|'+x1.toFixed(3)+','+y1.toFixed(3);};
  const solids=[],loops=[];
  const isHoleFace=f=>f.depth%2===1&&f.area<0;
  faces.forEach((f,i)=>{
    if(f.parent<0&&f.area<0)return; // face infinie
    if(f.depth%2===0){
      const holeIdx=f.children.filter(c=>faces[c].depth%2===1&&faces[c].area<0);
      const seen=new Set(),dedup=[];
      holeIdx.forEach(c=>{const k=ringKey(faces[c].ring);if(!seen.has(k)){seen.add(k);dedup.push(c);}});
      solids.push({chain:toChain(f.steps),holes:dedup.map(c=>toChain(faces[c].steps)),area:f.area,faces:[i,...dedup]});
      loops.push({chain:toChain(f.steps),area:f.area,kind:f.parent<0?'outer':'island'});
      dedup.forEach(c=>loops.push({chain:toChain(faces[c].steps),area:faces[c].area,kind:'hole'}));
      return;
    }
    if(f.area<0)return; // trou déjà rattaché à son solide
    const par=faces[f.parent];
    if(par&&isHoleFace(par)){ // îlot dans un trou : solide propre
      solids.push({chain:toChain(f.steps),holes:[],area:f.area,faces:[i]});
      loops.push({chain:toChain(f.steps),area:f.area,kind:'island'});
    }
    // sinon : jumelle CCW d'un trou -> rejet silencieux
  });
  // cercles complets : trou du solide dont la matière les contient, sinon solide propre
  const circlesOut=[],circleHoles=[];
  circles.forEach(c=>{
    const Cc=P[c.pc],rp=[Cc.x+c.r,Cc.y];
    let best=-1,bestA=1e18;
    faces.forEach((f,j)=>{if(Math.abs(f.area)<bestA&&pipPt(rp,f.ring)&&ringDist(rp,f.ring)>1e-6){bestA=Math.abs(f.area);best=j;}});
    if(best>=0&&faces[best].depth%2===0){
      const si=solids.findIndex(s=>s.faces.includes(best));
      if(si>=0){circleHoles.push({circle:c,solid:si});return;}
    }
    circlesOut.push(c);
  });
  // bouts ouverts : noeuds de degré 1
  const deg=new Map();
  edges.forEach(ed=>{deg.set(ed.a,(deg.get(ed.a)||0)+1);deg.set(ed.b,(deg.get(ed.b)||0)+1);});
  // un bout qui REPose sur un vrai cercle/arc (tangence/coupe épinglée) n'est pas un bout ouvert : raccordé, pas en rouge
  const onCurve=pt=>circles.some(c=>{const C=P[c.pc];return C&&Math.abs(Math.hypot(pt.x-C.x,pt.y-C.y)-c.r)<0.02;})
    ||arcs.some(a=>{const C=P[a.pc];if(!C||Math.abs(Math.hypot(pt.x-C.x,pt.y-C.y)-a.r)>0.02)return false;
      const an=arcAngles(sk,a);return !!an&&angInArc(Math.atan2(pt.y-C.y,pt.x-C.x),an.a1,an.a2);});
  const opens=[];
  deg.forEach((d,pid)=>{if(d===1&&pts[pid]&&!onCurve(pts[pid]))opens.push({x:pts[pid].x,y:pts[pid].y});});
  return{loops,solids,opens,pts,edges,circlesOut,circleHoles,hasGeom:edges.length>0};
}
function sketchShape(sk){
  const P=sk.points||{};
  const tr=skLoopTrace(sk);
  const shapes=[];
  const chainToPath=(chain,PV,isHole)=>{
    const path=isHole?new THREE.Path():new THREE.Shape();
    const s0=PV[chain[0].from];path.moveTo(s0.x,s0.y);
    chain.forEach(st=>{
      const ed=st.ed;
      if(ed.kind==='line'){const B=PV[(ed.a===st.from)?ed.b:ed.a];path.lineTo(B.x,B.y);}
      else if(ed.kind==='spline'){const pl=skEdgePoly(ed,st.from);for(let k=1;k<pl.length;k++)path.lineTo(pl[k][0],pl[k][1]);}
      else{const a=ed.e,C=P[a.pc],an=arcAngles(sk,a),fwd=(ed.a===st.from);if(!an||!C)return;
        if(fwd)path.absarc(C.x,C.y,a.r,an.a1,an.a2,false);
        else path.absarc(C.x,C.y,a.r,an.a1,an.a2,true);}
    });
    path.closePath();return path;
  };
  const fullCircle=(e,isHole)=>{
    const C=P[e.pc];if(!C||!(e.r>0))return null;
    if(isHole){const p=new THREE.Path();p.absarc(C.x,C.y,e.r,0,Math.PI*2,true);return p;}
    const p=new THREE.Path();p.absarc(C.x,C.y,e.r,0,Math.PI*2,true);
    const s=new THREE.Shape();s.curves=p.curves;return s;
  };
  tr.solids.forEach(sol=>{
    const shape=chainToPath(sol.chain,tr.pts,false);
    (sol.holes||[]).forEach(h=>shape.holes.push(chainToPath(h,tr.pts,true)));
    tr.circleHoles.filter(c=>c.solid===tr.solids.indexOf(sol)).forEach(c=>{const hp=fullCircle(c.circle,true);if(hp)shape.holes.push(hp);});
    shapes.push(shape);
  });
  tr.circlesOut.forEach(e=>{const s=fullCircle(e,false);if(s)shapes.push(s);});
  if(!shapes.length){
    if(tr.hasGeom)return{shapes:[],open:true,opens:tr.opens};
    return{shapes:[],open:false,opens:[]};
  }
  return{shapes,open:false,opens:tr.opens};
}
