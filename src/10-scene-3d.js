/* ---------- scène façon viewer ---------- */
let mirrorOn=true,mirrorRT=null,mirrorCam=null,mirrorTexMat=null,mirrorU=null,floorMesh=null,axHelper=null,mirrorDirty=true;
let zoomInv=false;
try{const _zi=localStorage.getItem('minifusion_zoominv');if(_zi==='on')zoomInv=true;}catch(e){}
try{const _mo=localStorage.getItem('minifusion_mirror');if(_mo==='off')mirrorOn=false;}catch(e){}
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
  camera.up.set(0,0,1); // convention CAO : Z vers le haut, Y vers l'arrière, X à droite
  camera.position.set(90,-90,90);
  renderer=new THREE.WebGLRenderer({canvas:$('viewport'),antialias:true});
  renderer.localClippingEnabled=true;
  scene.add(new THREE.HemisphereLight(0xffffff,0x444444,0.75));
  const key=new THREE.DirectionalLight(0xffffff,1.0); key.position.set(60,-40,120); scene.add(key);
  try{if('environment' in scene)scene.environment=makeStudioEnv();}catch(e){} // reflets studio
  axHelper=new THREE.AxesHelper(60); scene.add(axHelper); // X rouge → droite, Y vert → arrière, Z bleu → haut
  // Sol miroir (réflexion planaire temps réel, fondu radial). Z-up : cercle déjà horizontal.
  mirrorRT=new THREE.WebGLRenderTarget(1024,1024);
  mirrorCam=new THREE.PerspectiveCamera();
  mirrorTexMat=new THREE.Matrix4();
  mirrorU={color:{value:new THREE.Color(0x141519)},tDiffuse:{value:mirrorRT.texture},
    textureMatrix:{value:mirrorTexMat},uCenter:{value:new THREE.Vector3()},uRadius:{value:1}};
  const fm=new THREE.ShaderMaterial({uniforms:mirrorU,
    vertexShader:'uniform mat4 textureMatrix; varying vec4 vUv; varying vec3 vWorld;\nvoid main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vWorld = wp.xyz; vUv = textureMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader:'uniform vec3 color; uniform sampler2D tDiffuse; uniform vec3 uCenter; uniform float uRadius; varying vec4 vUv; varying vec3 vWorld;\nvoid main(){ if(vUv.w<=1e-4){ gl_FragColor=vec4(color,1.0); return; } vec2 uv = vUv.xy / vUv.w; vec3 refl = texture2D(tDiffuse, uv).rgb; float d = distance(vWorld.xy, uCenter.xy); float f = exp(-pow(d / max(uRadius * 1.15, 1e-3), 2.0) * 2.0) * 0.85; gl_FragColor = vec4(mix(color, refl * 0.62, clamp(f, 0.0, 0.85)), 1.0); }'});
  floorMesh=new THREE.Mesh(new THREE.CircleGeometry(400,48),fm);
  floorMesh.name='floor';floorMesh.position.z=-0.5;scene.add(floorMesh);
  buildOriginPlanes();
  controls=new THREE.OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true; controls.dampingFactor=0.08;
  controls.zoomSpeed=zoomInv?-1:1;
  // Souris : rotation = clic GAUCHE enfoncé, roulette (molette) conservée = rotation aussi,
  // déplacement (pan) = clic DROIT enfoncé. Clic court sans glisser = sélection (gardien >6px).
  if(controls.mouseButtons&&THREE.MOUSE){controls.mouseButtons.LEFT=THREE.MOUSE.ROTATE;controls.mouseButtons.MIDDLE=THREE.MOUSE.ROTATE;controls.mouseButtons.RIGHT=THREE.MOUSE.PAN;}
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
  if(mirrorRT){
    const rw=Math.min(1024,W),rh=Math.max(2,Math.round(rw*H/Math.max(W,1)));
    if(mirrorRT.width!==rw||mirrorRT.height!==rh){mirrorRT.setSize(rw,rh);mirrorDirty=true;}
  }
}
const _mn=new THREE.Vector3(0,0,1),_mrwp=new THREE.Vector3(),_mcwp=new THREE.Vector3(),_mview=new THREE.Vector3();
const _mrot=new THREE.Matrix4(),_mlook=new THREE.Vector3(),_mtgt=new THREE.Vector3(),_mcu=new THREE.Vector3();
function updateMirror(){
  // Caméra virtuelle symétrique sous le sol (plan z = floorMesh.z) + matrice de projection reflet.
  if(!mirrorOn||!floorMesh||!mirrorCam)return false;
  _mrwp.set(0,0,floorMesh.position.z);
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
  mirrorCam.up.set(0,0,1).applyMatrix4(_mrot).reflect(_mn);
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
function refreshMirror(){
  // Sol sous les corps visibles + halo centré (comme le viewer).
  if(!floorMesh)return;
  mirrorDirty=true; // la cible de reflet est à refaire (position du sol, halo, visibilité)
  floorMesh.visible=mirrorOn;
  if(!mirrorOn)return;
  const box=new THREE.Box3();let n=0;
  bodies.forEach(b=>{if(b.visible&&b.mesh){box.expandByObject(b.mesh);n++;}});
  if(!n||box.isEmpty())return;
  floorMesh.position.z=box.min.z-0.5;
  _mcu.copy(box.getCenter(new THREE.Vector3()));
  mirrorU.uCenter.value.copy(_mcu);
  mirrorU.uRadius.value=Math.max(box.getSize(new THREE.Vector3()).length()/2,1);
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
  if(moved){viewChanged=true;mirrorDirty=true;} // la vue a changé : le reflet devient obsolète
  return moved;
}

function animate(){
  requestAnimationFrame(animate);
  controls.update();updateLabels();
  if(mirrorOn&&floorMesh&&mirrorCam){
    const vu=updateMirror();
    mirrorViewMoved();
    if(vu&&mirrorDirty){
      floorMesh.visible=false;
      renderer.setRenderTarget(mirrorRT);renderer.clear();renderer.render(scene,mirrorCam);
      renderer.setRenderTarget(null);
      floorMesh.visible=true;
      mirrorDirty=false;
    }
  }
  renderer.render(scene,camera);
}
function showAll(){
  const box=new THREE.Box3();
  bodies.forEach(b=>{if(b.visible)box.expandByObject(b.mesh);});
  doc.sketches.forEach(s=>{const m=scene.getObjectByName('sk_'+s.id);if(m&&s.visible!==false)box.expandByObject(m);});
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
  controls.target.copy(c);
  camera.position.set(c.x+o[0]*d,c.y+o[1]*d,c.z+o[2]*d);
  controls.update();
}
function setView(v){
  if(v==='iso'){viewFit([0.6,-0.6,0.6]);return;} // Iso = vue complète isométrique
  const t=controls.target.clone(),d=camera.position.distanceTo(t)||150;
  if(v==='top')camera.position.set(t.x,t.y,t.z+d); // dessus : on regarde vers -Z
  if(v==='front')camera.position.set(t.x,t.y-d,t.z); // face : depuis l'avant (Y-), Y part vers l'arrière
  if(v==='right')camera.position.set(t.x+d,t.y,t.z); // droite : depuis +X
  controls.update();
}

/* ---------- couleurs / overlay pièces ---------- */
function updateGhostVis(){
  // Fantômes d'outils (la « pièce rouge translucide ») : l'aperçu au clic dans l'arbre
  // fonctionne déjà (visible quand la découpe — ou l'outil — est sélectionnée). On y ajoute
  // UN seul cas : juste APRÈS une soustraction, l'outil reste CACHÉ, même si la nouvelle
  // découpe est sélectionnée (sinon l'outil s'affiche à l'instant même de l'opération).
  // Le masquage s'auto-efface dès que la sélection change.
  if(ghostHide&&!(sel.kind==='feature'&&sel.id===ghostHide))ghostHide=null;
  bodies.forEach(b=>{
    if(!b.ghost||!b.ref)return;
    let on=(sel.kind==='feature'&&sel.id===b.ref)||(sel.kind==='body'&&sel.id===b.id);
    if(ghostHide===b.ref)on=false; // opération en cours : outil caché
    b.visible=on;b.mesh.visible=on;
  });
}
function refreshParts(){
  try{const _t=$('optTint');if(_t&&partTint())_t.value=cssHex(partTint());}catch(e){}
  try{const _e=$('optEdges');if(_e&&_e.value!==edgeMode)_e.value=edgeMode;}catch(e){}
  try{
    if(doc.bodyVis)for(const b of bodies){
      if(b.ghost)continue; // fantôme : visibilité pilotée par la sélection, jamais mémorisée
      if(Object.prototype.hasOwnProperty.call(doc.bodyVis,b.id)){
        b.visible=!!doc.bodyVis[b.id];b.mesh.visible=b.visible;
      }
    }
  }catch(e){}
  updateGhostVis();
  // La liste « Pièces » a été retirée de l'interface : les corps se pilotent depuis
  // l'arborescence (œil sur la fonction) ou par le clic droit dans la vue 3D.
  // La visibilité mémorisée par corps reste appliquée, et l'œil d'une FONCTION la pilote
  // désormais aussi — sinon un corps masqué resterait invisible sans moyen de le rendre.
  // La liste « Pièces » a été retirée de l'interface : les corps se pilotent depuis
  // l'arborescence (œil sur la fonction) ou par le clic droit dans la vue 3D.
  const vis=bodies.filter(b=>b.visible);
  let tris=0;scene.traverse(o=>{if(o.isMesh&&o.geometry&&o.visible)tris+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;});
  log(`Corps: ${bodies.length} (${vis.length} visibles) · Tris≈${Math.round(tris).toLocaleString('fr')} · ${dirty?'● non sauvé':'✓ sauvé'}`);
}

/* ---------- rebuild paramétrique (THREE.ExtrudeGeometry) ---------- */
function clearBodies(){bodies.forEach(b=>{scene.remove(b.mesh);b.mesh.geometry.dispose();});bodies=[];const eo=scene.getObjectByName('edgeOverlay');if(eo)scene.remove(eo);clearMeasure();clearHover();if(selGroup){scene.remove(selGroup);selGroup=null;}selFaces=[];}
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
let _skPrevCam=null, _skBaseDist=400, _skBaseS=2.2, _skOrtho=null, _skOrigCam=null;
function sketchAlignCamera(){
  try{
    if(!skEdit||!camera||!controls||!renderer) return;
    const {n,o,u,v}=sketchBasis(skEdit);
    _skOrigCam=camera;
    _skPrevCam={pos:camera.position.clone(),target:controls.target.clone(),up:camera.up.clone(),rot:controls.enableRotate};
    const {W,H}=svgSize(); const s=skView.s||2.2; _skBaseS=s;
    const Wr=renderer.domElement.clientWidth||W, Hr=renderer.domElement.clientHeight||H; // kept for off calc
    const svgR=svg.getBoundingClientRect(), rendR=renderer.domElement.getBoundingClientRect();
    const offX=( Wr/2 - (svgR.left - rendR.left) - W/2 ) / s;
    const offY=( (svgR.top - rendR.top) + H/2 - Hr/2 ) / s;
    const hw=Wr/(2*s), hh=Hr/(2*s);
    _skOrtho=new THREE.OrthographicCamera(-hw, hw, hh, -hh, 0.1, 5000);
    _skOrtho.up.copy(v);
    const tgt=o.clone().addScaledVector(u, skView.cx + offX).addScaledVector(v, skView.cy + offY);
    _skOrtho.position.copy(tgt).addScaledVector(n, 500);
    _skOrtho.lookAt(tgt); _skOrtho.updateProjectionMatrix();
    camera=_skOrtho; controls.object=camera;
    controls.target.copy(tgt); controls.enableRotate=false; controls.update();
  }catch(e){}
}
function sketchSyncCamera(){
  try{
    if(!skEdit||!_skOrtho||!controls||!renderer) return;
    const {n,o,u,v}=sketchBasis(skEdit);
    const {W,H}=svgSize(); const s=skView.s||2.2;
    const Wr=renderer.domElement.clientWidth||W, Hr=renderer.domElement.clientHeight||H; // kept for off calc
    const svgR=svg.getBoundingClientRect(), rendR=renderer.domElement.getBoundingClientRect();
    const offX=( Wr/2 - (svgR.left - rendR.left) - W/2 ) / s;
    const offY=( (svgR.top - rendR.top) + H/2 - Hr/2 ) / s; // SVG Y inversé déjà géré par v
    const hw=Wr/(2*s), hh=Hr/(2*s);
    _skOrtho.left=-hw; _skOrtho.right=hw; _skOrtho.top=hh; _skOrtho.bottom=-hh;
    const tgt=o.clone().addScaledVector(u, skView.cx + offX).addScaledVector(v, skView.cy + offY);
    _skOrtho.position.copy(tgt).addScaledVector(n, 500);
    _skOrtho.up.copy(v); _skOrtho.lookAt(tgt); _skOrtho.updateProjectionMatrix();
    controls.target.copy(tgt); controls.update();
  }catch(e){}
}
function sketchRestoreCamera(){
  try{
    if(_skOrigCam){ camera=_skOrigCam; controls.object=camera; }
    if(_skPrevCam&&camera&&controls){
      camera.position.copy(_skPrevCam.pos);
      controls.target.copy(_skPrevCam.target);
      camera.up.copy(_skPrevCam.up);
      controls.enableRotate=_skPrevCam.rot;
      controls.update();
    }
    _skPrevCam=null; _skOrtho=null; _skOrigCam=null;
  }catch(e){}
}
function findHostForFace(pt,n){
  // Face porteuse : extrusion antérieure contenant pt (tol 1 mm).
  //  · TOP/BOTTOM : plan haut/bas, normale ∥ axe d'extrusion — comportement historique.
  //  · SIDE : face latérale = ARÊTE du footprint extrudée (normale ⟂ axe) — le plan SUIT
  //    l'arête quand le profil bouge, et h est clampé à la course → poches latérales suivent.
  // Null si plan d'origine.
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
      if(mDist>1.0||mDist>bd)continue;
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
        if(zl<lo-1.0||zl>hi+1.0)continue; // hors course du prisme : ce n'est pas UNE de ses faces
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
          if(dist>1.0||dist>bd2)continue;
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
  const SIZE=120;
  const defs={XY:{rot:null,corner:[75,75,0]},XZ:{rot:'x',corner:[75,0,75]},YZ:{rot:'y',corner:[0,75,75]}};
  Object.keys(defs).forEach(p=>{
    const col=PLANES[p].color;
    const geo=new THREE.PlaneGeometry(SIZE,SIZE);
    const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.10,side:THREE.DoubleSide,depthWrite:false}));
    m.name='origin_'+p;m.userData.plane=p;m.renderOrder=-1;
    if(defs[p].rot==='x')m.rotation.x=-Math.PI/2; // → plan XZ (vertical, face)
    if(defs[p].rot==='y')m.rotation.y=Math.PI/2; // → plan YZ (vertical, côté)
    const edge=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.85}));
    edge.raycast=()=>{};m.add(edge);
    const lab=makePlaneLabel(p,PLANES[p].css);lab.position.set(defs[p].corner[0],defs[p].corner[1],defs[p].corner[2]);m.add(lab);
    scene.add(m);originMeshes[p]=m;
  });
  updateOriginPlanes();
}
function updateOriginPlanes(){
  Object.keys(originMeshes).forEach(p=>{
    const m=originMeshes[p];if(!m)return;
    m.visible=originVis[p]!==false;
    const act=sel.kind==='plane'&&sel.id===p;
    m.material.opacity=act?0.30:0.10;
    if(m.children[0])m.children[0].material.opacity=act?1:.85;
  });
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
