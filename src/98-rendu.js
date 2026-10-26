/* ---------- atelier RENDU (V0.10.0 phase 1 · V0.11.0 phase 2) ----------
   Une image soignée de la pièce ou de l'assemblage, en 1920×1080 (ou 4K), enregistrée en PNG.
   Ouvert par le bouton RENDU du bandeau (à côté de PLAN) ou l'appareil photo de la barre de vue.
   L'atelier a SA scène et SON moteur WebGL (la vue CAO n'est jamais touchée) : les maillages
   affichés sont copiés tels quels (rien n'est recalculé), chacun reçoit une matière physique tirée
   de la bibliothèque (12-materiaux) selon son APPARENCE DE RENDU (doc.rendu, o.rendu en assemblage,
   sinon matériau et couleur de la CAO). La transparence de la CAO (aide à la visualisation) est
   ignorée : seul le matériau (verres) rend transparent.
   - Ambiances : environnements de reflets générés à la volée (ciel dégradé + boîtes à lumière,
     filtrés par PMREM) — aucune image externe, l'application reste un seul fichier.
   - Reliefs procéduraux par corps : brossé, sablé, moleté, bois… (98-rendu-reliefs).
   - AFFINAGE PROGRESSIF (V0.11.0) : chaque passe est rendue dans une cible flottante, avec un léger
     décalage de l'image (bords lisses), de la lampe (ombre douce : vraie pénombre) et de l'objectif
     (profondeur de champ) ; la moyenne des passes est gardée. L'exposition, les tons et le fond sont
     appliqués à l'affichage (rdShow). Aperçu : jusqu'à RD_PREVIEW passes dès que la vue est immobile ;
     image : 16, 64 ou 256 passes à la taille finale.
   - Appareil photo : focale en mm (capteur 24×36, cadre 16:9), ouverture f/ et mise au point au clic,
     exposition en EV, rendu des tons ; vues enregistrées avec la pièce (doc.rendu.cams).
   Réglages retenus dans le navigateur (localStorage), pas dans le document. */
const RD_LS='minifusion_rendu';
const RD_DEF={amb:'studio',envRot:0,envInt:1,lum:1,fond:'degrade',fc1:'#f2f3f5',fc2:'#c3c7ce',ombre:0.45,douceur:6,
  focale:50,ev:0,tons:'aces',res:'1080',ech:64,aretes:'non',solOn:true,solCol:'',miroir:true,ombreOn:true,ouv:0,map:0}; // solCol '' = couleur du bas du fond ; ouv 0 = tout net ; map 0 = mise au point sur la cible
const RD_AMB=[
  ['studio','Studio (softbox)'],['clair','Studio lumineux'],['atelier','Atelier (lumière chaude)'],['exterieur','Extérieur (ciel)'],['noir','Scène noire (contre-jour)']];
const RD_PREVIEW=64; // passes de l'aperçu
let rd=null; // état de l'atelier ouvert (null = fermé)
function rdSettings(){
  let s={};try{s=JSON.parse(localStorage.getItem(RD_LS)||'{}')||{};}catch(e){s={};}
  if(typeof s.sol==='string'){s.ombreOn=s.sol==='ombre';delete s.sol;} // réglage d'avant les cases Sol / Miroir / Ombre
  delete s.qual; // V0.10.0 : suréchantillonnage ×2, remplacé par le nombre de passes (ech)
  return Object.assign({},RD_DEF,s);
}
function rdSave(){try{localStorage.setItem(RD_LS,JSON.stringify(rd.st));}catch(e){}}
/* ── ambiances : scène d'environnement → PMREM ── */
function rdLin(hex){return new THREE.Color(hex).convertSRGBToLinear();}
function rdEnvScene(amb){
  // Z en haut (convention CAO) : ciel = sphère à dégradé vertical, lumières = panneaux émissifs (HDR > 1)
  const S=new THREE.Scene();
  const sky=(top,hor,bot)=>{
    const g=new THREE.SphereGeometry(100,48,24);g.rotateX(Math.PI/2); // pôles sur Z
    const P=g.attributes.position,col=[];
    const T=new THREE.Color(top),H=new THREE.Color(hor),B=new THREE.Color(bot),c=new THREE.Color();
    for(let i=0;i<P.count;i++){const z=P.getZ(i)/100;
      if(z>=0)c.copy(H).lerp(T,Math.pow(z,0.6));else c.copy(H).lerp(B,Math.pow(-z,0.5));
      col.push(c.r,c.g,c.b);}
    g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    S.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
  };
  const panel=(az,el,dist,w,h,inten,tint)=>{ // az, el en degrés ; panneau tourné vers le centre
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
    m.material.color.set(tint==null?0xffffff:tint).multiplyScalar(inten);
    const a=az*Math.PI/180,e=el*Math.PI/180;
    m.position.set(dist*Math.cos(e)*Math.cos(a),dist*Math.cos(e)*Math.sin(a),dist*Math.sin(e));
    m.up.set(0,0,1);m.lookAt(0,0,0);S.add(m);
  };
  let key=[-60,40]; // direction de la lumière principale (az, el) : ombre portée
  if(amb==='clair'){
    sky(0xf4f5f7,0xd9dce1,0x8e939b);
    panel(90,80,30,40,40,3);panel(-60,35,30,22,30,5);panel(30,25,30,20,26,3);panel(150,20,30,40,8,2.5);
    key=[-60,40];
  }else if(amb==='atelier'){
    sky(new THREE.Color(0x6a5a48),new THREE.Color(0x4a3d30),new THREE.Color(0x1d1813));
    panel(-40,30,30,10,34,7,0xffd9a8);panel(-15,30,30,10,34,7,0xffd9a8);panel(140,55,30,30,12,2.5,0xfff1dc);panel(60,10,30,30,10,1.2,0xffe2bd);
    key=[-28,32];
  }else if(amb==='exterieur'){
    sky(new THREE.Color(0x2f5fb3).multiplyScalar(1.4),new THREE.Color(0xdde8f2).multiplyScalar(1.5),new THREE.Color(0x4a4236));
    panel(-45,50,40,5,5,120,0xfff2d6); // soleil
    key=[-45,50];
  }else if(amb==='noir'){
    sky(0x050506,0x0b0b0d,0x020203);
    panel(160,20,30,7,44,24);panel(-160,20,30,7,44,24);panel(90,75,30,34,18,5);panel(-70,15,30,26,20,1.2);
    key=[90,70];
  }else{ // studio
    sky(new THREE.Color(0x45484d),new THREE.Color(0x26282c),new THREE.Color(0x0c0d0f)); // murs sombres : les métaux gardent du contraste
    panel(90,75,30,36,36,8);panel(-55,30,30,20,28,12);panel(40,20,30,16,24,4);panel(170,25,30,6,36,10);
    key=[-55,45];
  }
  return {S,key};
}
function rdEnvTex(pmrem,amb,rot){ // ambiance → {rt (PMREM), key (direction de la lampe)} — aussi pour la vue (98-rendu-vue)
  const {S,key}=rdEnvScene(amb);
  S.rotation.z=(rot||0)*Math.PI/180;S.updateMatrixWorld(true);
  const rt=pmrem.fromScene(S,0.02);
  S.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});
  return {rt,key};
}
function rdBuildEnv(){
  const {rt,key}=rdEnvTex(rd.pmrem,rd.st.amb,rd.st.envRot);
  if(rd.envRT)rd.envRT.dispose();
  rd.envRT=rt;rd.scene.environment=rt.texture;
  rd.keyDir=key;
}
/* ── fond : composé à l'affichage (rdShow), jamais dans la scène — les passes ont un fond transparent ── */
function rdBackground(){rd.scene.background=null;}
/* ── objets : maillages affichés + matières physiques ── */
function rdShown(o){for(let p=o;p;p=p.parent)if(p.visible===false)return false;return true;}
function rdSources(){
  // [{mesh, id (corps de la pièce active, sinon null), mat, color, rel}]
  const out=[];
  const asmS=(typeof asmMode!=='undefined'&&asmMode==='asm'&&typeof asmScene!=='undefined'&&asmScene)?asmScene:null;
  if(!asmS){
    (bodies||[]).forEach(b=>{
      if(!b||b.ghost||!b.mesh||!b.mesh.geometry||b.visible===false||!rdShown(b.mesh))return;
      const id=bodyIdOfRuntime(b);
      const L=id?renderLookOf(id):null; // apparence de RENDU (sinon celle de la CAO) — 12-materiaux
      out.push({mesh:b.mesh,id,mat:L?L.mat:null,color:L?L.color:(b.color||0x9a9aa0),rel:L?L.rel:null});
    });
  }
  const root=asmS||scene; // assemblage autour de la pièce (asmCtx) ou mode Placer : maillages repérés par userData.rd (47)
  root.traverse(o=>{
    const r=o.isMesh&&o.userData&&o.userData.rd;
    if(!r||r.ghost||!o.geometry||!rdShown(o))return;
    out.push({mesh:o,id:null,mat:r.mat,color:r.color,rel:r.rel||null,bid:r.bid||null,comp:r.comp||null,occ:r.occ||null});
  });
  return out;
}
function rdUndo(){try{if(typeof docPushUndo==='function')docPushUndo('apparence de rendu');}catch(e){}}
function rdBuildEdges(){
  // Arêtes « comme la CAO » (vives noires, tangentes grises) : la pièce active par edgeOverlayData
  // (asmEdgeCapture, même si le bouton « Arêtes » est éteint), les autres composants par leurs
  // groupes d'arêtes déjà dessinés (48-assemblage-apparence). Copies : rien n'est partagé avec la CAO.
  if(rd.edges){rd.scene.remove(rd.edges);rd.edges.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});rd.edges=null;}
  if(rd.st.aretes!=='cao')return;
  const G=new THREE.Group();
  const add=(geo,M)=>{const l=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({vertexColors:true,toneMapped:false}));
    if(M){l.matrixAutoUpdate=false;l.matrix.copy(M);}G.add(l);};
  const asmS=(typeof asmMode!=='undefined'&&asmMode==='asm'&&typeof asmScene!=='undefined'&&asmScene)?asmScene:null;
  if(!asmS){try{const g=asmEdgeCapture();if(g)add(g,null);}catch(e){}}
  (asmS||scene).traverse(o=>{
    if(!(o.userData&&o.userData.asmEdges)||!rdShown(o))return;
    o.updateMatrixWorld(true);
    o.children.forEach(c=>{if(c.isLineSegments&&c.material&&c.material.vertexColors&&c.geometry)add(c.geometry.clone(),c.matrixWorld);});
  });
  rd.edges=G;rd.scene.add(G);
}
function rdMaterial(src){
  const d=matDef(src.mat);
  const m=new THREE.MeshPhysicalMaterial({
    color:rdLin(src.color),
    metalness:d?d.metal:0.15,roughness:d?d.rough:0.42,
    clearcoat:d&&d.cc?d.cc:(d?0:0.25),clearcoatRoughness:d&&d.ccr!=null?d.ccr:0.25,
    envMapIntensity:rd.st.envInt,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1}); // décalage : les arêtes restent devant les faces
  if(d&&d.trans){m.transmission=d.trans;m.ior=d.ior||1.5;m.thickness=4;m.attenuationColor=rdLin(src.color);m.attenuationDistance=d.trans<1?8:60;m.color.setRGB(1,1,1);}
  if(d&&d.sheen){m.sheen=d.sheen;m.sheenRoughness=0.8;m.sheenColor=new THREE.Color(0.35,0.35,0.35);}
  return relApply(m,relOf({rel:src.rel},d)); // relief du corps, sinon celui du matériau (98-rendu-reliefs)
}
function rdBuildObjects(){
  if(rd.group){rd.scene.remove(rd.group);rd.group.traverse(o=>{if(o.material)o.material.dispose();if(o.geometry)o.geometry.dispose();});}
  const G=new THREE.Group();rd.srcs=rdSources();
  rd.srcs.forEach(s=>{
    s.mesh.updateMatrixWorld(true);
    const m=new THREE.Mesh(s.mesh.geometry.clone(),rdMaterial(s)); // copie : un rejeu de la CAO libère ses maillages
    m.matrixAutoUpdate=false;m.matrix.copy(s.mesh.matrixWorld);
    m.castShadow=true;m.receiveShadow=false; // seul le sol reçoit l'ombre (pas d'acné sur les faces)
    G.add(m);
  });
  G.updateMatrixWorld(true);
  rd.group=G;rd.scene.add(G);
  rdBuildEdges();
  const box=new THREE.Box3().setFromObject(G);
  if(box.isEmpty())box.set(new THREE.Vector3(-50,-50,0),new THREE.Vector3(50,50,50));
  rd.box=box;
}
function rdFloor(){
  const st=rd.st,b=rd.box,c=b.getCenter(new THREE.Vector3()),R=b.getSize(new THREE.Vector3()).length()*0.5||50;
  if(!rd.floor){
    rd.floor=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.ShadowMaterial({opacity:0.4}));
    rd.floor.receiveShadow=true;rd.scene.add(rd.floor);
    rd.key=new THREE.DirectionalLight(0xffffff,1);rd.key.castShadow=true;
    rd.key.shadow.mapSize.set(4096,4096);rd.key.shadow.bias=-0.0004;
    rd.scene.add(rd.key);rd.scene.add(rd.key.target);
  }
  rd.floor.visible=!!st.ombreOn;
  rdDisk(c,R,b.min.z);
  rd.floor.scale.set(R*12,R*12,1);rd.floor.position.set(c.x,c.y,b.min.z-R*0.002);
  rd.floor.material.opacity=st.ombre;
  // lumière principale : direction de l'ambiance, tournée avec elle ; rdSunJitter la promène dans un cône
  rd.keyBase={c,R,a:(rd.keyDir[0]+st.envRot)*Math.PI/180,e:rd.keyDir[1]*Math.PI/180};
  rdSunJitter(-1);
  rd.key.target.position.copy(c);rd.key.target.updateMatrixWorld();
  rd.key.intensity=st.lum*(st.amb==='noir'?0.6:1.4);
  const sc=rd.key.shadow.camera;sc.left=-R*1.6;sc.right=R*1.6;sc.top=R*1.6;sc.bottom=-R*1.6;sc.near=R*0.5;sc.far=R*8;sc.updateProjectionMatrix();
}
function rdHalton(i,b){let f=1,r=0;i=i+1;while(i>0){f/=b;r+=f*(i%b);i=Math.floor(i/b);}return r;}
function rdDisk2(i,b1,b2){ // point uniforme dans le disque unité (suite de Halton : couverture régulière)
  const u=rdHalton(i,b1),v=rdHalton(i,b2),r=Math.sqrt(u),t=2*Math.PI*v;return [r*Math.cos(t),r*Math.sin(t)];
}
function rdSunJitter(i){
  // i < 0 : direction de base ; sinon un point du disque de la lampe (rayon angulaire = « Douceur »)
  const K=rd.keyBase;if(!K)return;
  let a=K.a,e=K.e;
  if(i>=0){const s=rd.st.douceur*0.4*Math.PI/180,[u,v]=rdDisk2(i,5,7);a+=u*s/Math.max(0.2,Math.cos(e));e+=v*s;}
  const D=K.R*4;
  rd.key.position.set(K.c.x+D*Math.cos(e)*Math.cos(a),K.c.y+D*Math.cos(e)*Math.sin(a),K.c.z+D*Math.sin(e));
  rd.key.updateMatrixWorld();
}
/* ── sol et miroir (cases « Sol », « Miroir » — comme la vue CAO, 10-scene-3d / 98-rendu-vue) ──
   Disque à bords fondus dans le fond ; reflet plan : caméra symétrique sous le sol rendue dans une
   cible (fond transparent), relue par projection. Tout est LINÉAIRE ici : les tons, l'exposition et
   le sRGB sont appliqués une seule fois, à l'affichage (rdShow). */
function rdSolHex(){
  const st=rd.st;if(st.solCol)return st.solCol;
  return st.fond==='degrade'?st.fc2:st.fond==='uni'?st.fc1:'#9a9ea6';
}
function rdDisk(c,R,z){
  const st=rd.st;
  if(!rd.disk){
    rd.mirRT=new THREE.WebGLRenderTarget(2048,2048,{samples:4,type:THREE.HalfFloatType});
    rd.mirCam=new THREE.PerspectiveCamera();rd.mirMat=new THREE.Matrix4();
    const U={color:{value:new THREE.Color()},tRefl:{value:rd.mirRT.texture},texM:{value:rd.mirMat},uC:{value:new THREE.Vector3()},
      uR:{value:1},uDisk:{value:1},uRefl:{value:1}};
    rd.disk=new THREE.Mesh(new THREE.CircleGeometry(1,128),new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,
      vertexShader:'uniform mat4 texM; varying vec4 vUv; varying vec3 vW;\nvoid main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; vUv = texM * vec4(position, 1.0); gl_Position = projectionMatrix * viewMatrix * wp; }',
      fragmentShader:'uniform vec3 color; uniform sampler2D tRefl; uniform vec3 uC; uniform float uR; uniform float uDisk; uniform float uRefl; varying vec4 vUv; varying vec3 vW;\n'+
        'void main(){ float d = distance(vW, uC); float a = uDisk > 0.5 ? 1.0 - smoothstep(uR * 1.6, uR * 5.5, d) : 0.0; vec3 refl = vec3(0.0); float ra = 0.0; float f = 0.0; '+
        'if(uRefl > 0.5 && vUv.w > 1e-4){ vec2 uv = vUv.xy / vUv.w; if(uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0){ vec4 r4 = texture2D(tRefl, uv); ra = r4.a; refl = ra > 1e-4 ? r4.rgb / ra : vec3(0.0); f = exp(-pow(d / max(uR * 1.2, 1e-3), 2.0) * 1.6) * 0.8; } } '+
        'vec3 base = pow(color, vec3(2.2)); '+ // couleur choisie (sRGB) → linéaire
        'if(uDisk > 0.5){ gl_FragColor = vec4(mix(base, refl, clamp(f * ra * 0.7, 0.0, 1.0)), a); return; } gl_FragColor = vec4(refl, ra * f * 0.6); }'}));
    rd.disk.renderOrder=-3;rd.scene.add(rd.disk);
    rd.floor.renderOrder=-2; // l'ombre par-dessus le sol et le reflet
  }
  const U=rd.disk.material.uniforms;
  rd.disk.visible=!!(st.solOn||st.miroir);
  rd.disk.scale.set(R*8,R*8,1);rd.disk.position.set(c.x,c.y,z-R*0.001);rd.disk.updateMatrixWorld();
  U.color.value.set(rdSolHex());U.uC.value.set(c.x,c.y,z);U.uR.value=R;
  U.uDisk.value=st.solOn?1:0;U.uRefl.value=st.miroir?1:0;
  rd.floorZ=z;
}
const _rdV1=new THREE.Vector3(),_rdV2=new THREE.Vector3();
function rdMirror(){ // passe reflet, avant chaque passe : caméra RÉELLE de la passe (décalages compris)
  if(!rd.disk||!rd.disk.visible||!rd.st.miroir)return;
  const z0=rd.floorZ,cam=rd.cam,mc=rd.mirCam;
  const dir=_rdV1.set(0,0,-1).applyQuaternion(cam.quaternion),up=_rdV2.set(0,1,0).applyQuaternion(cam.quaternion);
  const tx=cam.position.x+dir.x*100,ty=cam.position.y+dir.y*100,tz=cam.position.z+dir.z*100;
  mc.position.set(cam.position.x,cam.position.y,2*z0-cam.position.z);
  mc.up.set(up.x,up.y,-up.z);mc.lookAt(tx,ty,2*z0-tz);
  mc.projectionMatrix.copy(cam.projectionMatrix);mc.projectionMatrixInverse.copy(cam.projectionMatrixInverse);mc.updateMatrixWorld();
  rd.mirMat.set(0.5,0,0,0.5, 0,0.5,0,0.5, 0,0,0.5,0.5, 0,0,0,1).multiply(mc.projectionMatrix).multiply(mc.matrixWorldInverse).multiply(rd.disk.matrixWorld);
  const hid=[rd.disk,rd.floor,rd.edges].filter(o=>o&&o.visible);
  hid.forEach(o=>{o.visible=false;});
  rd.r.setRenderTarget(rd.mirRT);rd.r.setClearColor(0x000000,0);rd.r.clear();rd.r.render(rd.scene,mc);
  hid.forEach(o=>{o.visible=true;});
}
/* ── appareil photo ── */
function rdFov(f){return 2*Math.atan(18/f/(16/9))*180/Math.PI;} // capteur 36 mm de large, cadre 16:9
function rdApplyCam(){
  const st=rd.st,cam=rd.cam,R=rd.box.getSize(new THREE.Vector3()).length()*0.5||50;
  cam.fov=rdFov(st.focale);cam.aspect=16/9;
  const d=cam.position.distanceTo(rd.ctl.target);
  cam.near=Math.max(0.05,d-R*4)*0.5;cam.far=d+R*30;cam.updateProjectionMatrix();
  rd.group.traverse(o=>{if(o.material)o.material.envMapIntensity=st.envInt;});
}
function rdFocusDist(){ // distance de mise au point (mm) : point cliqué, sinon la cible
  return rd.st.map>0?rd.st.map:rd.cam.position.distanceTo(rd.ctl.target);
}
function rdFrame(){ // cadre la pièce entière dans le 16:9 en gardant la direction de vue
  const cam=rd.cam,c=rd.box.getCenter(new THREE.Vector3()),R=rd.box.getSize(new THREE.Vector3()).length()*0.5||50;
  const vf=rdFov(rd.st.focale)*Math.PI/180,hf=2*Math.atan(Math.tan(vf/2)*16/9);
  const d=R/Math.sin(Math.min(vf,hf)/2)*1.08;
  const dir=cam.position.clone().sub(rd.ctl.target);if(dir.lengthSq()<1e-9)dir.set(1,-1,0.8);
  dir.normalize();rd.ctl.target.copy(c);cam.position.copy(c).addScaledVector(dir,d);
  rd.ctl.update();rdApplyCam();
}
function rdSetFocale(f){ // garde la taille de la pièce à l'écran : on recule quand la focale s'allonge
  f=Math.max(12,Math.min(300,+f||50));
  const o=rd.st.focale,t=rd.ctl.target,cam=rd.cam;
  const k=Math.tan(rdFov(o)*Math.PI/360)/Math.tan(rdFov(f)*Math.PI/360);
  const off=cam.position.clone().sub(t).multiplyScalar(k); // AVANT de toucher à la position (sinon distance 0)
  cam.position.copy(t).add(off);
  if(rd.st.map>0)rd.st.map*=k; // la mise au point suit le recul
  rd.st.focale=f;rd.ctl.update();rdApplyCam();
}
function rdFromView(){ // reprend la vue CAO (direction et cible), puis cadre
  rd.cam.position.copy(camera.position);rd.ctl.target.copy(controls.target);rd.ctl.update();rd.st.map=0;rdFrame();
}
/* ── vues enregistrées (doc.rendu.cams, avec la pièce) ── */
function rdCams(){return (typeof doc!=='undefined'&&doc&&doc.rendu&&doc.rendu.cams)||[];}
function rdCamAdd(){
  rdUndo();
  if(!doc.rendu)doc.rendu={};
  const cs=doc.rendu.cams||(doc.rendu.cams=[]);
  let n=cs.length+1;while(cs.some(k=>k.n==='Vue '+n))n++;
  cs.push({n:'Vue '+n,p:rd.cam.position.toArray().map(v=>+v.toFixed(3)),t:rd.ctl.target.toArray().map(v=>+v.toFixed(3)),u:[0,0,1],f:rd.st.focale});
  markDirty();rdPanel();rdMsg('« Vue '+n+' » enregistrée avec la pièce.');
}
function rdCamGo(k){
  rd.cam.position.fromArray(k.p);rd.ctl.target.fromArray(k.t);rd.st.focale=k.f;rd.st.map=0;
  rd.ctl.update();rdApplyCam();rdReset();rdSave();rdPanel();
}
function rdCamDel(i){
  const cs=rdCams();if(!cs[i])return;
  rdUndo();const n=cs[i].n;cs.splice(i,1);
  if(!cs.length){delete doc.rendu.cams;if(!doc.rendu.corps)doc.rendu=null;}
  markDirty();rdPanel();rdMsg('« '+n+' » supprimée.');
}
/* ── affinage progressif ── */
const RD_QV='varying vec2 vUv;\nvoid main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
function rdAccInit(w,h){
  const A=rd.acc||(rd.acc={n:0});
  if(!A.cam){
    A.cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);A.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));A.quad.frustumCulled=false;
    A.sc=new THREE.Scene();A.sc.add(A.quad);
    A.mix=new THREE.ShaderMaterial({uniforms:{tA:{value:null},tS:{value:null},k:{value:1}},depthTest:false,depthWrite:false,vertexShader:RD_QV,
      fragmentShader:'uniform sampler2D tA; uniform sampler2D tS; uniform float k; varying vec2 vUv;\nvoid main(){ gl_FragColor = mix(texture2D(tA, vUv), texture2D(tS, vUv), k); }'});
    A.out=new THREE.ShaderMaterial({uniforms:{tA:{value:null},uExpo:{value:1},uTone:{value:0},uBg:{value:1},uC1:{value:new THREE.Color()},uC2:{value:new THREE.Color()}},
      depthTest:false,depthWrite:false,vertexShader:RD_QV,
      fragmentShader:VENV_GLSL+'uniform sampler2D tA; uniform float uExpo; uniform float uTone; uniform float uBg; uniform vec3 uC1; uniform vec3 uC2; varying vec2 vUv;\n'+
        'vec3 rdTone(vec3 c){ c *= uExpo; if(uTone < 0.5) return vEnvAces(c); if(uTone < 1.5) return clamp(c / (1.0 + c), 0.0, 1.0); '+
        'if(uTone < 2.5){ c = max(vec3(0.0), c - 0.004); return pow((c * (6.2 * c + 0.5)) / (c * (6.2 * c + 1.7) + 0.06), vec3(2.2)); } return clamp(c, 0.0, 1.0); }\n'+
        'void main(){ vec4 a = texture2D(tA, vUv); vec3 c = a.a > 1e-4 ? a.rgb / a.a : vec3(0.0); vec3 col = LinearTosRGB(vec4(rdTone(c), 1.0)).rgb; '+
        'if(uBg > 1.5){ gl_FragColor = vec4(col * a.a, a.a); return; } '+ // fond transparent : alpha prémultiplié (PNG détouré)
        'vec3 bg = uBg > 0.5 ? mix(uC2, uC1, vUv.y) : uC1; gl_FragColor = vec4(mix(bg, col, clamp(a.a, 0.0, 1.0)), 1.0); }'});
  }
  if(A.w!==w||A.h!==h||!A.s){
    ['s','a','b'].forEach(k=>{if(A[k])A[k].dispose();});
    A.s=new THREE.WebGLRenderTarget(w,h,{type:THREE.HalfFloatType,samples:4});
    A.a=new THREE.WebGLRenderTarget(w,h,{type:THREE.HalfFloatType,depthBuffer:false});
    A.b=new THREE.WebGLRenderTarget(w,h,{type:THREE.HalfFloatType,depthBuffer:false});
    A.w=w;A.h=h;A.n=0;
  }
  return A;
}
const _rdP0=new THREE.Vector3(),_rdQ0=new THREE.Quaternion(),_rdU0=new THREE.Vector3();
function rdSample(){
  // une passe : décalages (image, objectif, lampe) → cible s → moyenne dans a
  const A=rd.acc,cam=rd.cam,st=rd.st,i=A.n,jit=i>0; // la 1re passe est nette et centrée (aperçu pendant le glisser)
  _rdP0.copy(cam.position);_rdQ0.copy(cam.quaternion);_rdU0.copy(cam.up);
  if(jit){
    if(st.ouv>0){ // profondeur de champ : point de la pupille (diamètre = focale / ouverture), visée sur le plan net
      const dir=_rdV1.set(0,0,-1).applyQuaternion(_rdQ0),fp=_rdP0.clone().addScaledVector(dir,rdFocusDist());
      const rad=st.focale/st.ouv/2,[u,v]=rdDisk2(i,11,13);
      const R=new THREE.Vector3(1,0,0).applyQuaternion(_rdQ0),U=new THREE.Vector3(0,1,0).applyQuaternion(_rdQ0);
      cam.position.copy(_rdP0).addScaledVector(R,u*rad).addScaledVector(U,v*rad);cam.up.copy(U);cam.lookAt(fp);
    }
    cam.setViewOffset(A.w,A.h,rdHalton(i,2)-0.5,rdHalton(i,3)-0.5,A.w,A.h); // bords : décalage sous le pixel
    rdSunJitter(i);
  }else rdSunJitter(-1);
  cam.updateMatrixWorld();
  rd.r.shadowMap.needsUpdate=true;
  rdMirror();
  rd.r.setRenderTarget(A.s);rd.r.setClearColor(0x000000,0);rd.r.clear();rd.r.render(rd.scene,cam);
  A.mix.uniforms.tA.value=A.a.texture;A.mix.uniforms.tS.value=A.s.texture;A.mix.uniforms.k.value=1/(i+1);
  A.quad.material=A.mix;rd.r.setRenderTarget(A.b);rd.r.render(A.sc,A.cam);
  const t=A.a;A.a=A.b;A.b=t;A.n++;
  rd.r.setRenderTarget(null);
  if(jit){cam.clearViewOffset();cam.position.copy(_rdP0);cam.quaternion.copy(_rdQ0);cam.up.copy(_rdU0);cam.updateMatrixWorld();}
}
function rdShow(){
  const A=rd.acc,st=rd.st,U=A.out.uniforms;
  U.tA.value=A.a.texture;U.uExpo.value=Math.pow(2,st.ev);U.uTone.value={aces:0,doux:1,cine:2,lin:3}[st.tons]||0;
  U.uBg.value=st.fond==='transparent'?2:st.fond==='degrade'?1:0;U.uC1.value.set(st.fc1);U.uC2.value.set(st.fc2);
  A.quad.material=A.out;rd.r.setRenderTarget(null);rd.r.render(A.sc,A.cam);
}
function rdCount(){if(rd&&rd.cnt&&rd.acc)rd.cnt.textContent='Affinage : '+rd.acc.n+' / '+RD_PREVIEW+(rd.st.ouv>0?' · f/'+String(rd.st.ouv).replace('.',',')+' · net à '+Math.round(rdFocusDist())+' mm':'');}
function rdLoop(){
  rd&&(rd.raf=0);
  if(!rd||rd.busy||!rd.acc)return;
  const A=rd.acc;
  if(A.n===0||!rd.drag){
    const k=A.n===0?1:2;
    for(let j=0;j<k&&A.n<RD_PREVIEW;j++)rdSample();
    rdShow();rdCount();
  }
  if(A.n<RD_PREVIEW&&!rd.drag)rd.raf=requestAnimationFrame(rdLoop);
}
function rdReset(){ // la scène ou la vue a changé : l'aperçu repart de zéro
  if(!rd||!rd.acc)return;
  rd.acc.n=0;
  if(!rd.raf)rd.raf=requestAnimationFrame(rdLoop);
}
/* ── rendu ── */
function rdLayout(){
  if(!rd)return;
  const host=rd.view,W=Math.max(200,host.clientWidth-24),H=Math.max(120,host.clientHeight-24);
  let w=W,h=Math.round(W*9/16);if(h>H){h=H;w=Math.round(H*16/9);}
  rd.r.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  rd.r.setSize(w,h,false);rd.canvas.style.width=w+'px';rd.canvas.style.height=h+'px';
  const sz=rd.r.getDrawingBufferSize(new THREE.Vector2());
  rdAccInit(sz.x,sz.y);rdReset();
}
function rdDraw(){rdReset();}
function rdRefresh(what){
  if(!rd)return;
  if(what==='env')rdBuildEnv();
  if(what==='fond')rdBackground();
  if(what==='objets')rdBuildObjects();
  rdFloor();rdApplyCam();rdReset();rdSave();
}
async function rdExport(){
  if(!rd||rd.busy)return;rd.busy=true;
  if(rd.raf){cancelAnimationFrame(rd.raf);rd.raf=0;}
  const st=rd.st,W=st.res==='2160'?3840:1920,H=st.res==='2160'?2160:1080,N=Math.max(1,+st.ech||64);
  const btn=rd.panel.querySelector('.rdGo');if(btn){btn.disabled=true;btn.textContent='Calcul en cours…';}
  await new Promise(r=>setTimeout(r,30)); // laisse le bouton se redessiner
  let url=null;const t0=performance.now();
  try{
    rd.r.setPixelRatio(1);rd.r.setSize(W,H,false);
    rdAccInit(W,H);rd.acc.n=0;
    for(let i=0;i<N;i++){
      rdSample();
      if(i%4===3||i===N-1){if(btn)btn.textContent='Calcul : '+Math.round(100*(i+1)/N)+' %  ('+(i+1)+' / '+N+' passes)';await new Promise(r=>setTimeout(r,0));}
    }
    rdShow();
    const blob=await new Promise(r=>rd.canvas.toBlob(r,'image/png'));
    if(!blob)throw new Error('image vide');
    url=URL.createObjectURL(blob);
    const nm=String((typeof doc!=='undefined'&&doc&&doc.name)||'piece').replace(/[\\/:*?"<>|]+/g,'-');
    const a=document.createElement('a');a.href=url;a.download=nm+' - rendu '+W+'x'+H+'.png';document.body.appendChild(a);a.click();a.remove();
    rdMsg('Image '+W+'×'+H+' enregistrée : '+N+' passes en '+((performance.now()-t0)/1000).toFixed(1).replace('.',',')+' s ('+(blob.size/1048576).toFixed(1).replace('.',',')+' Mo).');
  }catch(e){rdMsg('Rendu impossible : '+(e&&e.message||e));}
  finally{
    rd.busy=false;
    rdLayout();
    if(btn){btn.disabled=false;btn.textContent='Rendre et enregistrer le PNG';}
    if(url)setTimeout(()=>URL.revokeObjectURL(url),20000);
  }
}
function rdMsg(t){if(rd&&rd.msg)rd.msg.textContent=t||'';}
function rdPick(ev){
  // clic sans glisser sur la pièce : mise au point à cette distance (le long de l'axe de visée)
  const r=rd.canvas.getBoundingClientRect();
  const m=new THREE.Vector2((ev.clientX-r.left)/r.width*2-1,-((ev.clientY-r.top)/r.height*2-1));
  const ray=new THREE.Raycaster();ray.setFromCamera(m,rd.cam);
  const hit=ray.intersectObjects(rd.group.children,false)[0];if(!hit)return;
  const dir=_rdV1.set(0,0,-1).applyQuaternion(rd.cam.quaternion);
  rd.st.map=Math.max(1,hit.point.clone().sub(rd.cam.position).dot(dir));
  rdReset();rdSave();
  rdMsg(rd.st.ouv>0?'Mise au point à '+Math.round(rd.st.map)+' mm.':'Mise au point à '+Math.round(rd.st.map)+' mm — choisissez une ouverture (f/…) pour voir le flou.');
}
/* ── interface ── */
function rdCss(){
  if(document.getElementById('rdCss'))return;
  const s=document.createElement('style');s.id='rdCss';s.textContent=[
    '#rdOverlay{position:fixed;inset:0;z-index:9000;display:flex;background:#101012;color:var(--text,#f5f5f7);font-size:.82rem}',
    '#rdView{flex:1;display:flex;align-items:center;justify-content:center;position:relative;min-width:0;background:repeating-conic-gradient(#1a1a1c 0% 25%,#141416 0% 50%) 50%/22px 22px}',
    '#rdView canvas{box-shadow:0 10px 40px rgba(0,0,0,.55);cursor:grab;outline:1px solid rgba(255,255,255,.08)}',
    '#rdView .rdHint{position:absolute;left:14px;bottom:10px;color:#98989d;font-size:.74rem}',
    '#rdView .rdCnt{position:absolute;right:14px;bottom:10px;color:#98989d;font-size:.74rem;font-variant-numeric:tabular-nums}',
    '#rdPanel{width:350px;flex:none;overflow:auto;background:var(--bg,#1c1c1e);border-left:1px solid var(--border,rgba(255,255,255,.09));padding:10px 14px 18px}',
    '#rdPanel h2{font-size:1rem;margin:2px 0 8px;display:flex;align-items:center;gap:8px}',
    '#rdPanel h2 .rdX{margin-left:auto;background:none;border:1px solid var(--border);color:inherit;border-radius:7px;padding:2px 9px;cursor:pointer}',
    '#rdPanel h3{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted,#98989d);margin:14px 0 6px;font-weight:600}',
    '#rdPanel .rdRow{display:flex;align-items:center;gap:8px;margin:5px 0}',
    '#rdPanel .rdRow>label{flex:0 0 96px;color:var(--muted,#98989d)}',
    '#rdPanel .rdRow>select,#rdPanel .rdRow>input[type=range]{flex:1;min-width:0}',
    '#rdPanel .rdRow>.rdV{min-width:46px;text-align:right;font-variant-numeric:tabular-nums}',
    '#rdPanel input[type=color]{width:36px;height:24px;padding:0;border:none;background:none}',
    '#rdPanel .rdBtns{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}',
    '#rdPanel button.rdB{background:var(--surface,#2c2c2e);border:1px solid var(--border);color:inherit;border-radius:7px;padding:4px 9px;cursor:pointer}',
    '#rdPanel button.rdB.on{background:var(--primary,#0a84ff);color:#fff;border-color:transparent}',
    '#rdPanel .rdGo{width:100%;margin-top:10px;padding:9px;border:none;border-radius:9px;background:var(--primary,#0a84ff);color:#fff;font-weight:600;cursor:pointer}',
    '#rdPanel .rdGo:disabled{opacity:.6;cursor:wait}',
    '#rdPanel .rdMat{display:flex;align-items:center;gap:6px;margin:4px 0}',
    '#rdPanel .rdMat>span{flex:0 0 90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '#rdPanel .rdMat>select{flex:1;min-width:0}',
    '#rdPanel .rdRel{display:flex;align-items:center;gap:5px;margin:0 0 8px 20px}',
    '#rdPanel .rdRel>select:first-child{flex:1;min-width:0}',
    '#rdPanel .rdRel>input{width:56px}',
    '#rdPanel .rdCam{display:inline-flex;border:1px solid var(--border);border-radius:7px;overflow:hidden}',
    '#rdPanel .rdCam>button{background:var(--surface,#2c2c2e);border:none;color:inherit;padding:4px 8px;cursor:pointer}',
    '#rdPanel .rdCam>button+button{border-left:1px solid var(--border);color:var(--muted,#98989d)}',
    '#rdPanel .rdNote{color:var(--muted,#98989d);font-size:.74rem;margin:6px 0}',
    '#rdPanel .rdMsg{color:var(--accent,#30d158);font-size:.76rem;margin-top:8px;min-height:1em}'
  ].join('\n');
  document.head.appendChild(s);
}
function rdPanel(){
  const st=rd.st,p=rd.panel,sc0=p.scrollTop;p.innerHTML='';
  const el=(tag,cls,txt)=>{const d=document.createElement(tag);if(cls)d.className=cls;if(txt!=null)d.textContent=txt;return d;};
  const row=(lab,node,val)=>{const r=el('div','rdRow');r.appendChild(el('label',null,lab));r.appendChild(node);if(val)r.appendChild(val);p.appendChild(r);return r;};
  const select=(opts,cur,fn)=>{const s=el('select');opts.forEach(([v,t])=>{const o=el('option',null,t);o.value=v;if(String(v)===String(cur))o.selected=true;s.appendChild(o);});s.onchange=()=>fn(s.value);return s;};
  const slider=(lab,k,min,max,step,fmt,what)=>{
    const r=el('input');r.type='range';r.min=min;r.max=max;r.step=step;r.value=st[k];
    const v=el('span','rdV',fmt(+st[k]));
    r.oninput=()=>{st[k]=+r.value;v.textContent=fmt(st[k]);rdRefresh(what);};
    return row(lab,r,v);
  };
  const h=el('h2');h.appendChild(el('span',null,'Rendu'));
  const x=el('button','rdX','Fermer');x.title='Revenir à la modélisation (Échap)';x.onclick=rdClose;h.appendChild(x);p.appendChild(h);
  // ambiance
  p.appendChild(el('h3',null,'Ambiance'));
  row('Lumière',select(RD_AMB,st.amb,v=>{st.amb=v;rdRefresh('env');}));
  slider('Rotation','envRot',0,360,5,v=>v+'°','env');
  slider('Reflets','envInt',0,3,0.05,v=>v.toFixed(2).replace('.',','),null);
  slider('Lampe princ.','lum',0,3,0.05,v=>v.toFixed(2).replace('.',','),null);
  // fond et sol
  p.appendChild(el('h3',null,'Fond et sol'));
  const c1=el('input');c1.type='color';c1.value=st.fc1;c1.title='Haut du fond (ou fond uni)';
  const c2=el('input');c2.type='color';c2.value=st.fc2;c2.title='Bas du dégradé';
  const fr=row('Fond',select([['degrade','Dégradé'],['uni','Uni'],['transparent','Transparent (PNG détouré)']],st.fond,v=>{st.fond=v;c2.style.display=v==='degrade'?'':'none';rdRefresh('fond');}));
  fr.appendChild(c1);fr.appendChild(c2);c2.style.display=st.fond==='degrade'?'':'none';
  c1.oninput=()=>{st.fc1=c1.value;rdRefresh('fond');};c2.oninput=()=>{st.fc2=c2.value;rdRefresh('fond');};
  const pres=el('div','rdBtns');
  [['Blanc','#f2f3f5','#c3c7ce'],['Gris','#9aa0a8','#4b5058'],['Ardoise','#3a4049','#121417'],['Noir','#121214','#000000'],['Bleu nuit','#24324a','#0b111c']].forEach(([n,a,b])=>{
    const q=el('button','rdB',n);q.onclick=()=>{st.fc1=a;st.fc2=b;if(st.fond==='transparent')st.fond='degrade';rdPanel();rdRefresh('fond');};pres.appendChild(q);});
  p.appendChild(pres);
  { // Sol (et sa couleur) · Miroir · Ombre : trois cases, comme dans la vue CAO
    const r=el('div','rdRow');r.appendChild(el('label',null,'Sol'));
    const box=(lab,k,tip)=>{const l=el('label');l.style.cssText='flex:none;color:inherit;display:flex;align-items:center;gap:3px';l.title=tip;
      const c=el('input');c.type='checkbox';c.checked=!!st[k];c.onchange=()=>{st[k]=c.checked;rdRefresh();};l.appendChild(c);l.appendChild(document.createTextNode(lab));r.appendChild(l);};
    box('Sol','solOn','Disque sous la pièce, bords fondus dans le fond');
    const sc=el('input');sc.type='color';sc.value=rdSolHex();sc.title='Couleur du sol (par défaut : bas du fond)';sc.oninput=()=>{st.solCol=sc.value;rdRefresh();};r.appendChild(sc);
    box('Miroir','miroir','Reflet de la pièce au sol, avec ou sans disque');
    box('Ombre','ombreOn','Ombre portée sur le sol');
    p.appendChild(r);
  }
  slider('Ombre','ombre',0,1,0.05,v=>Math.round(v*100)+' %',null);
  slider('Douceur','douceur',0,20,1,v=>v?String(v):'nette',null).title='Taille de la lampe : pénombre de l’ombre, calculée passe après passe';
  row('Arêtes',select([['non','Sans (photo)'],['cao','Comme la CAO (vives noires, tangentes grises)']],st.aretes,v=>{st.aretes=v;rdBuildEdges();rdRefresh();}));
  // appareil photo
  p.appendChild(el('h3',null,'Appareil photo'));
  const fv=el('span','rdV',st.focale+' mm');
  const fs=el('input');fs.type='range';fs.min=14;fs.max=200;fs.step=1;fs.value=st.focale;
  fs.oninput=()=>{rdSetFocale(+fs.value);fv.textContent=rd.st.focale+' mm';rdReset();rdSave();};
  row('Focale',fs,fv);
  const fb=el('div','rdBtns');
  [24,35,50,85,135].forEach(f=>{const q=el('button','rdB',f+' mm');q.title=f<35?'Grand angle':f>60?'Téléobjectif : peu de déformation, rendu « catalogue »':'Normal';
    q.onclick=()=>{rdSetFocale(f);fs.value=f;fv.textContent=f+' mm';rdReset();rdSave();};fb.appendChild(q);});
  p.appendChild(fb);
  row('Ouverture',select([['0','Tout net'],['1.4','f/1,4'],['2','f/2'],['2.8','f/2,8'],['4','f/4'],['5.6','f/5,6'],['8','f/8'],['11','f/11'],['16','f/16'],['22','f/22']],st.ouv,
    v=>{st.ouv=+v;rdReset();rdSave();rdCount();})).title='Profondeur de champ : plus le nombre est petit, plus le flou est fort (diamètre de la pupille = focale / ouverture)';
  const mp=el('div','rdBtns');
  const mpt=el('span','rdNote',st.map>0?'Net à '+Math.round(st.map)+' mm (point cliqué)':'Net sur la cible — cliquez sur la pièce pour choisir le point net');mpt.style.margin='0';
  mp.appendChild(mpt);
  if(st.map>0){const b=el('button','rdB','Sur la cible');b.onclick=()=>{st.map=0;rdReset();rdSave();rdPanel();};mp.appendChild(b);}
  p.appendChild(mp);
  slider('Exposition','ev',-3,3,0.1,v=>(v>0?'+':'')+v.toFixed(1).replace('.',',')+' EV',null);
  row('Rendu des tons',select([['aces','Film (ACES)'],['doux','Doux (Reinhard)'],['cine','Cinéon'],['lin','Neutre (linéaire)']],st.tons,v=>{st.tons=v;rdRefresh();}));
  const vb=el('div','rdBtns');
  const b1=el('button','rdB','Cadrer la pièce');b1.onclick=()=>{rdFrame();rdReset();};vb.appendChild(b1);
  const b2=el('button','rdB','Reprendre la vue CAO');b2.onclick=()=>{rdFromView();rdReset();rdPanel();};vb.appendChild(b2);
  p.appendChild(vb);
  // vues enregistrées
  p.appendChild(el('h3',null,'Vues enregistrées'));
  const cv=el('div','rdBtns');
  rdCams().forEach((k,i)=>{const w=el('span','rdCam');
    const g=el('button',null,k.n);g.title='Aller à cette vue (focale '+k.f+' mm)';g.onclick=()=>rdCamGo(k);
    const d=el('button',null,'×');d.title='Supprimer « '+k.n+' »';d.onclick=()=>rdCamDel(i);
    w.appendChild(g);w.appendChild(d);cv.appendChild(w);});
  const ca=el('button','rdB','+ Enregistrer la vue');ca.title='Position, cible et focale, enregistrées avec la pièce';ca.onclick=rdCamAdd;cv.appendChild(ca);
  p.appendChild(cv);
  // matériaux
  p.appendChild(el('h3',null,'Matériaux et reliefs'));
  const ids=[];(rd.srcs||[]).forEach(s=>{if(s.id&&ids.indexOf(s.id)<0)ids.push(s.id);});
  ids.forEach(id=>{
    const e=bodyEntryOf(id),b=(bodies||[]).find(q=>bodyIdOfRuntime(q)===id);
    const r=el('div','rdMat');const n=el('span',null,(e&&e.name)||(b&&b.name)||id);n.title=n.textContent;r.appendChild(n);
    const L=renderLookOf(id);
    const ci=el('input');ci.type='color';ci.value=cssHex(L.color);ci.title='Couleur de rendu (la pièce CAO garde la sienne)';
    const done=()=>{markDirty();rdRefresh('objets');rdPanel();};
    const s=matSelect(L.mat,k=>{rdUndo();setRenderLook(id,k,null);done();},'Sans matériau');
    ci.onchange=()=>{const v=parseInt(ci.value.slice(1),16);if(v>=0){rdUndo();setRenderLook(id,renderLookOf(id).mat,v);done();}};
    r.appendChild(s);r.appendChild(ci);
    const z=el('button','rdB','↺');z.title=L.own?'Reprendre le matériau et la couleur de la CAO':'Apparence de la CAO (rien de propre au rendu)';z.disabled=!L.own;z.style.opacity=L.own?'':'.35';
    z.onclick=()=>{rdUndo();clearRenderLook(id);done();};r.appendChild(z);
    p.appendChild(r);
    p.appendChild(rdRelRow(el,select,L.rel,matDef(L.mat),rel=>{rdUndo();const L2=renderLookOf(id);setRenderLook(id,L2.mat,L2.color,rel);done();}));
  });
  const asmView=(rd.srcs||[]).some(x=>!x.id&&x.comp);
  if(!ids.length&&!asmView)p.appendChild(el('div','rdNote','Aucun corps de la pièce active à l’écran.'));
  rdAsmPanel(p,el,select);
  if(ids.length)p.appendChild(el('div','rdNote','Apparence propre au RENDU, enregistrée avec la pièce : la CAO garde ses couleurs. Au départ, le rendu reprend le matériau et la couleur de la CAO (↺ pour y revenir). Relief : motif calculé, échelle en mm, direction X / Y / Z de la pièce.'));
  // sortie
  p.appendChild(el('h3',null,'Image'));
  row('Format',select([['1080','1920 × 1080 (Full HD)'],['2160','3840 × 2160 (4K)']],st.res,v=>{st.res=v;rdSave();}));
  row('Qualité',select([['16','Brouillon (16 passes)'],['64','Bonne (64 passes)'],['256','Haute (256 passes)']],st.ech,v=>{st.ech=+v;rdSave();}))
    .title='Nombre de passes moyennées : bords, ombres douces et profondeur de champ plus lisses';
  const go=el('button','rdGo','Rendre et enregistrer le PNG');go.onclick=rdExport;p.appendChild(go);
  rd.msg=el('div','rdMsg');p.appendChild(rd.msg);
  p.scrollTop=sc0;
}
function rdRelRow(el,select,rel0,dm,fn){
  // ligne « relief » d'un corps : type (selon le matériau / aucun / brossé…), direction, échelle (mm)
  const eff=relOf({rel:rel0},dm);
  const r=el('div','rdRel');
  const t=select(REL_TYPES.map(([v,l])=>[v,v===''?'Relief : '+(dm&&dm.rel?(REL_TYPES.find(q=>q[0]===dm.rel.t)||['',''])[1].toLowerCase():'aucun'):l]),(rel0&&rel0.t)||'',
    v=>fn(relNorm(Object.assign({},rel0||{},{t:v||undefined}))));
  t.title='Relief calculé sur la surface (sans image)';
  r.appendChild(t);
  if(eff){
    const d=select([['x','X'],['y','Y'],['z','Z']],eff.d,v=>fn(relNorm(Object.assign({},rel0||{},{d:v}))));d.title='Direction du motif (axes de la pièce)';
    const e=el('input');e.type='number';e.step='0.01';e.min='0.01';e.value=String(eff.e);e.title='Échelle du motif (mm)';
    e.onchange=()=>{if(+e.value>0)fn(relNorm(Object.assign({},rel0||{},{e:+e.value})));};
    r.appendChild(d);r.appendChild(e);r.appendChild(el('span','rdNote','mm'));
  }
  return r;
}
function rdAsmPanel(p,el,select){
  // Rendu d'assemblage (mode Assembler) : apparence de rendu par OCCURRENCE, corps par corps
  // (o.rendu, 48-assemblage-apparence) ; ⇉ = la même pour toutes les occurrences du composant
  const seen=new Set(),rows=[];
  (rd.srcs||[]).forEach(s=>{if(s.id||!s.comp||!s.bid)return;const k=(s.occ||'')+'|'+s.bid;if(seen.has(k))return;seen.add(k);rows.push(s);});
  if(!rows.length){if((rd.srcs||[]).some(s=>!s.id))p.appendChild(el('div','rdNote','Autres composants : apparence choisie en mode Assembler (atelier ouvert sur l’assemblage).'));return;}
  let last=null;
  rows.forEach(s=>{
    const c=asmComp(s.comp),o=s.occ?asmOcc(s.occ):null;
    if(s.occ!==last){last=s.occ;const h=el('div','rdNote',(o?o.name:(c&&c.name)||'?'));h.style.cssText='margin:8px 0 2px;color:inherit;font-weight:600';p.appendChild(h);}
    const be=c&&c.doc&&(c.doc.bodies||[]).find(e=>e&&e.id===s.bid);
    const r=el('div','rdMat');const n=el('span',null,(be&&be.name)||s.bid);n.title=n.textContent;r.appendChild(n);
    if(!o){ // le composant ouvert lui-même (racine) : apparence de rendu de sa pièce
      const L=renderLookOf(s.bid);
      const sel=matSelect(L.mat,k=>{rdUndo();setRenderLook(s.bid,k,null);markDirty();rdAsmRedraw();},'Sans matériau');
      const ci=el('input');ci.type='color';ci.value=cssHex(L.color);ci.onchange=()=>{rdUndo();setRenderLook(s.bid,renderLookOf(s.bid).mat,parseInt(ci.value.slice(1),16));markDirty();rdAsmRedraw();};
      r.appendChild(sel);r.appendChild(ci);p.appendChild(r);
      p.appendChild(rdRelRow(el,select,L.rel,matDef(L.mat),rel=>{rdUndo();const L2=renderLookOf(s.bid);setRenderLook(s.bid,L2.mat,L2.color,rel);markDirty();rdAsmRedraw();}));
      return;
    }
    const own=!!(o.rendu&&o.rendu.corps&&o.rendu.corps[s.bid]);
    const sel=matSelect(s.mat,k=>{asmSetOccRendu(o,s.bid,k,null,false);rdAsmRedraw();},'Sans matériau');
    const ci=el('input');ci.type='color';ci.value=cssHex(s.color);ci.title='Couleur de rendu de cette occurrence';
    ci.onchange=()=>{asmSetOccRendu(o,s.bid,s.mat,parseInt(ci.value.slice(1),16),false,s.rel);rdAsmRedraw();};
    const all=el('button','rdB','⇉');all.title='Même apparence pour toutes les occurrences de « '+((c&&c.name)||'?')+' »';
    all.onclick=()=>{asmSetOccRendu(o,s.bid,s.mat,s.color,true,s.rel);rdAsmRedraw();};
    const z=el('button','rdB','↺');z.title='Reprendre l’apparence de la pièce';z.disabled=!own;z.style.opacity=own?'':'.35';
    z.onclick=()=>{asmClearOccRendu(o,s.bid,false);rdAsmRedraw();};
    r.appendChild(sel);r.appendChild(ci);r.appendChild(all);r.appendChild(z);p.appendChild(r);
    p.appendChild(rdRelRow(el,select,s.rel,matDef(s.mat),rel=>{asmSetOccRendu(o,s.bid,s.mat,s.color,false,rel);rdAsmRedraw();}));
  });
  p.appendChild(el('div','rdNote','Rendu d’assemblage : apparence par occurrence, enregistrée avec l’assemblage (⇉ : toutes les occurrences du composant, ↺ : celle de la pièce). La vue CAO garde les couleurs de la CAO.'));
}
function rdAsmRedraw(){ // l'assemblage redessine ses instances (userData.rd), puis l'atelier les reprend
  try{asmDraw();}catch(e){}try{asmCtxDraw();}catch(e){}
  rdRefresh('objets');rdPanel();
}
function rdKey(e){if(rd&&e.key==='Escape'&&!rd.busy){e.stopPropagation();e.preventDefault();rdClose();}}
function rdOpen(){
  if(rd)return;
  try{if(typeof skEdit!=='undefined'&&skEdit){faceEl.textContent='Terminez l’esquisse avant d’ouvrir le rendu.';return;}}catch(e){}
  try{if(typeof mfCloseMenus==='function')mfCloseMenus();}catch(e){}
  rdCss();
  const ov=document.createElement('div');ov.id='rdOverlay';
  const view=document.createElement('div');view.id='rdView';
  const canvas=document.createElement('canvas');view.appendChild(canvas);
  const hint=document.createElement('div');hint.className='rdHint';hint.textContent='Glisser : tourner · clic droit : déplacer · molette : avancer / reculer · clic sur la pièce : mise au point — le cadre est l’image finale (16:9)';view.appendChild(hint);
  const cnt=document.createElement('div');cnt.className='rdCnt';view.appendChild(cnt);
  const panel=document.createElement('div');panel.id='rdPanel';
  ov.appendChild(view);ov.appendChild(panel);document.body.appendChild(ov);
  let r;
  try{r=new THREE.WebGLRenderer({canvas,antialias:false,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});}
  catch(e){ov.remove();alert('Rendu indisponible : WebGL refusé par le navigateur.');return;}
  // passes linéaires (cibles flottantes) ; tons et sRGB à l'affichage seulement (rdShow)
  r.outputEncoding=THREE.LinearEncoding;r.toneMapping=THREE.NoToneMapping;
  r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;r.shadowMap.autoUpdate=false;
  const cam=new THREE.PerspectiveCamera(30,16/9,0.1,10000);cam.up.set(0,0,1);
  cam.position.copy(camera.position);
  const ctl=new THREE.OrbitControls(cam,canvas);
  ctl.target.copy(controls.target);ctl.enableDamping=false;
  if(ctl.mouseButtons&&THREE.MOUSE){ctl.mouseButtons.LEFT=THREE.MOUSE.ROTATE;ctl.mouseButtons.MIDDLE=THREE.MOUSE.DOLLY;ctl.mouseButtons.RIGHT=THREE.MOUSE.PAN;}
  ctl.addEventListener('change',()=>{if(rd&&!rd.busy){rdApplyCam();rdReset();}});
  ctl.addEventListener('start',()=>{if(rd)rd.drag=true;});
  ctl.addEventListener('end',()=>{if(rd){rd.drag=false;rdReset();}});
  let down=null;
  canvas.addEventListener('pointerdown',e=>{down=e.button===0?{x:e.clientX,y:e.clientY}:null;});
  canvas.addEventListener('pointerup',e=>{if(down&&rd&&!rd.busy&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<4){try{rdPick(e);rdPanel();}catch(err){}}down=null;});
  rd={ov,view,canvas,panel,r,cam,ctl,cnt,scene:new THREE.Scene(),pmrem:new THREE.PMREMGenerator(r),st:rdSettings(),keyDir:[-55,45],drag:false,raf:0};
  rdBuildObjects();rdBuildEnv();rdBackground();rdFloor();
  rdFromView();
  rdPanel();
  rd.onResize=()=>rdLayout();window.addEventListener('resize',rd.onResize);
  document.addEventListener('keydown',rdKey,true);
  document.querySelectorAll('[data-mfrd]').forEach(b=>b.classList.add('on'));
  requestAnimationFrame(rdLayout);
}
function rdClose(){
  if(!rd)return;
  if(rd.raf)cancelAnimationFrame(rd.raf);
  window.removeEventListener('resize',rd.onResize);document.removeEventListener('keydown',rdKey,true);
  try{rd.ctl.dispose();}catch(e){}
  try{if(rd.group)rd.group.traverse(o=>{if(o.material)o.material.dispose();if(o.geometry)o.geometry.dispose();});}catch(e){}
  try{if(rd.edges)rd.edges.traverse(o=>{if(o.material)o.material.dispose();if(o.geometry)o.geometry.dispose();});}catch(e){}
  try{if(rd.envRT)rd.envRT.dispose();rd.pmrem.dispose();}catch(e){}
  try{if(rd.floor){rd.floor.geometry.dispose();rd.floor.material.dispose();}if(rd.key&&rd.key.shadow.map)rd.key.shadow.map.dispose();}catch(e){}
  try{if(rd.disk){rd.disk.geometry.dispose();rd.disk.material.dispose();rd.mirRT.dispose();}}catch(e){}
  try{const A=rd.acc;if(A){['s','a','b'].forEach(k=>{if(A[k])A[k].dispose();});A.quad.geometry.dispose();A.mix.dispose();A.out.dispose();}}catch(e){}
  try{rd.r.dispose();rd.r.forceContextLoss();}catch(e){}
  rd.ov.remove();rd=null;
  document.querySelectorAll('[data-mfrd]').forEach(b=>b.classList.remove('on'));
  try{renderProps();}catch(e){} // la fiche du corps reprend un matériau changé dans l'atelier
}
(function(){
  // appareil photo dans la barre de vue (à gauche du ⚙)
  try{
    const vb=document.getElementById('viewbar'),st=document.getElementById('btnSettings');
    if(vb&&!document.getElementById('btnRender')){
      const b=document.createElement('button');b.id='btnRender';b.dataset.mfrd='1';b.title='Rendu : image réaliste 1920×1080 (matériaux, ambiance, appareil photo)';
      b.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-3px"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
      b.onclick=()=>rdOpen();
      vb.insertBefore(b,st||null);
    }
  }catch(e){}
})();
