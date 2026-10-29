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
  focale:50,ev:0,tons:'aces',res:'1080',ech:64,aretes:'non',solOn:true,solCol:'',miroir:true,ombreOn:true,ouv:0,map:0,moteur:'rapide',support:'',
  pDen:0.5,pHalo:0,pVig:0,pGrain:0,pCon:0,pSat:0,pTemp:0,calques:false}; // support : 98-rendu-scene (V0.14.0) ; p… finition, calques : 98-rendu-post (V0.15.0) // solCol '' = couleur du bas du fond ; ouv 0 = tout net ; map 0 = mise au point sur la cible ; moteur 'rayons' : 98-rendu-rayons
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
function rdSave(){try{localStorage.setItem(RD_LS,JSON.stringify(rd.st));}catch(e){}vEnvRdSt=null;} // Rendu direct (98-rendu-vue) : réglages relus
/* ── ambiances : scène d'environnement → PMREM ── */
function rdLin(hex){return new THREE.Color(hex).convertSRGBToLinear();}
function rdEnvDesc(amb){
  // Z en haut (convention CAO) : ciel = dégradé vertical {top, hor, bot}, lumières = panneaux émissifs (HDR > 1)
  // [az, el (degrés), distance, largeur, hauteur, intensité, teinte] tournés vers le centre ; key = lampe (az, el).
  // Décrite une seule fois : la scène PMREM (rdEnvScene) et le lancer de rayons (98-rendu-rayons) la lisent.
  const D={panels:[]};
  const sky=(top,hor,bot)=>{D.sky={top:new THREE.Color(top),hor:new THREE.Color(hor),bot:new THREE.Color(bot)};};
  const panel=(az,el,dist,w,h,inten,tint)=>{D.panels.push([az,el,dist,w,h,inten,tint==null?0xffffff:tint]);};
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
  D.key=key;return D;
}
function rdEnvScene(amb){
  const D=rdEnvDesc(amb),S=new THREE.Scene();
  { // ciel : sphère à couleurs de sommets
    const g=new THREE.SphereGeometry(100,48,24);g.rotateX(Math.PI/2); // pôles sur Z
    const P=g.attributes.position,col=[];
    const T=D.sky.top,H=D.sky.hor,B=D.sky.bot,c=new THREE.Color();
    for(let i=0;i<P.count;i++){const z=P.getZ(i)/100;
      if(z>=0)c.copy(H).lerp(T,Math.pow(z,0.6));else c.copy(H).lerp(B,Math.pow(-z,0.5));
      col.push(c.r,c.g,c.b);}
    g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    S.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
  }
  D.panels.forEach(([az,el,dist,w,h,inten,tint])=>{
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
    m.material.color.set(tint).multiplyScalar(inten);
    const a=az*Math.PI/180,e=el*Math.PI/180;
    m.position.set(dist*Math.cos(e)*Math.cos(a),dist*Math.cos(e)*Math.sin(a),dist*Math.sin(e));
    m.up.set(0,0,1);m.lookAt(0,0,0);S.add(m);
  });
  return {S,key:D.key};
}
function rdEnvTex(pmrem,amb,rot){ // ambiance → {rt (PMREM), key (direction de la lampe)} — aussi pour la vue (98-rendu-vue)
  const {S,key}=rdEnvScene(amb);
  S.rotation.z=(rot||0)*Math.PI/180;S.updateMatrixWorld(true);
  const rt=pmrem.fromScene(S,0.02);
  S.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});
  return {rt,key};
}
function rdBuildEnv(){
  const st=rd.st;let rt,key;
  if(rd.hdriBg){rd.hdriBg.dispose();rd.hdriBg=null;}
  rd.sunE=null;
  if(st.amb==='hdri'&&rdHdri){ // HDRI importée (98-rendu-scene) : reflets sans son soleil, le soleil devient la lampe
    const rot=st.envRot*Math.PI/180,env=new THREE.DataTexture(rdHdriWorld(rdHdri,rot,1024,1,true),1024,512,THREE.RGBAFormat,THREE.FloatType);
    env.mapping=THREE.EquirectangularReflectionMapping;env.magFilter=env.minFilter=THREE.LinearFilter;env.needsUpdate=true;
    rt=rd.pmrem.fromEquirectangular(env);env.dispose();
    const sk=rdHdriSunKey(rdHdri);key=sk?[sk.az,sk.el]:[0,90];rd.sunE=sk&&sk.el>1?sk.E:0;
    const W=Math.min(2048,rdHdri.w-(rdHdri.w%2)); // fond : l'image entière, soleil compris
    rd.hdriBg=new THREE.DataTexture(rdHdriWorld(rdHdri,rot,W,1,false),W,W/2,THREE.RGBAFormat,THREE.FloatType);
    rd.hdriBg.mapping=THREE.EquirectangularReflectionMapping;rd.hdriBg.magFilter=rd.hdriBg.minFilter=THREE.LinearFilter;rd.hdriBg.needsUpdate=true;
  }else({rt,key}=rdEnvTex(rd.pmrem,st.amb,st.envRot));
  if(rd.envRT)rd.envRT.dispose();
  rd.envRT=rt;rd.scene.environment=rt.texture;
  rd.keyDir=key;
}
/* ── fond : composé à l'affichage (rdShow), jamais dans la scène — les passes ont un fond transparent ;
   sauf l'image HDRI (V0.14.0) : fond de la scène, vu sous l'angle de chaque passe ── */
function rdBackground(){rd.scene.background=rd.st.fond==='hdri'&&rd.hdriBg?rd.hdriBg:null;}
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
function rdUndo(lbl){try{if(typeof docPushUndo==='function')docPushUndo(lbl||'apparence de rendu');}catch(e){}}
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
  if(d&&d.ir){m.iridescence=d.ir.i;m.iridescenceIOR=d.ir.ior;m.iridescenceThicknessRange=d.ir.th.slice();} // couche mince (V0.13.0)
  // relief du corps, sinon celui du matériau (98-rendu-reliefs) ; couches et patine (98-rendu-surface)
  return relApply(m,relOf({rel:src.rel},d),surfOpts(src,d));
}
function rdBuildObjects(){
  if(rd.group){rd.scene.remove(rd.group);rd.group.traverse(o=>{if(o.material)o.material.dispose();if(o.geometry)o.geometry.dispose();});}
  const G=new THREE.Group();rd.srcs=rdSources();
  rd.srcs.forEach(s=>{
    s.mesh.updateMatrixWorld(true);
    // copie : un rejeu de la CAO libère ses maillages ; patine usée : bandes d'usure et de salissure (surfGeo)
    const g0=s.mesh.geometry,wear=surfOpts(s,matDef(s.mat)).wear;
    const m=new THREE.Mesh(wear?surfGeo(g0,surfBand(g0)):g0.clone(),rdMaterial(s));
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
  const studio=st.fond==='studio';
  rd.floor.visible=!!st.ombreOn&&!studio;
  rdDisk(c,R,b.min.z);
  rdStudio(c,R,b.min.z);
  rd.floor.scale.set(R*12,R*12,1);rd.floor.position.set(c.x,c.y,b.min.z-R*0.002);
  rd.floor.material.opacity=st.ombre;
  // lumière principale : direction de l'ambiance, tournée avec elle ; rdSunJitter la promène dans un cône
  rd.keyBase={c,R,a:(rd.keyDir[0]+st.envRot)*Math.PI/180,e:rd.keyDir[1]*Math.PI/180};
  rdSunJitter(-1);
  rd.key.target.position.copy(c);rd.key.target.updateMatrixWorld();
  // HDRI : éclairement de son soleil (r147, lumières non physiques : intensité = E / π) ; sans soleil, pas de lampe
  rd.key.intensity=rd.sunE!=null?st.lum*rd.sunE/Math.PI:st.lum*(st.amb==='noir'?0.6:1.4);
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
  if(st.fond==='hdri'&&rdHdri)return rdLinHex(rdHdriGround(rdHdri)); // devant l'image : la couleur de son sol
  return st.fond==='degrade'?st.fc2:st.fond==='uni'?st.fc1:st.fond==='studio'?'#d9dbdf':'#9a9ea6';
}
function rdStudio(c,R,z){
  // fond courbe (98-rendu-scene) : reçoit l'ombre de la lampe, n'en porte pas (ses murs masqueraient tout)
  const st=rd.st,on=st.fond==='studio';
  if(rd.studio&&rd.studioR!==R){rd.scene.remove(rd.studio);rd.studio.geometry.dispose();rd.studio.material.dispose();rd.studio=null;}
  if(!rd.studio){if(!on)return;
    rd.studio=new THREE.Mesh(rdStudioGeo(THREE,R),new THREE.MeshStandardMaterial({metalness:0,side:THREE.DoubleSide}));
    rd.studio.receiveShadow=true;rd.studio.castShadow=false;rd.studioR=R;rd.scene.add(rd.studio);}
  rd.studio.visible=on;
  rd.studio.position.set(c.x,c.y,z-R*0.001);rd.studio.updateMatrixWorld();
  // calé comme le sol du lancer de rayons : hors de l'ombre, le fond garde la couleur choisie (sinon il brûle)
  const m=rd.studio.material,E=rdEnvCal(),cl=rdLin(rdSolHex());
  m.color.setRGB(...[cl.r,cl.g,cl.b].map((v,i)=>Math.min(1,v*Math.PI/Math.max(1e-3,E.eUp[i]*st.envInt+E.eKey))));
  m.roughness=st.miroir?0.35:0.9;m.envMapIntensity=st.envInt;
}
function rdSupTex3(k){ // texture du support pour le moteur rapide (sRGB 8 bits, convertie dans le shader du sol)
  if(!k||!RD_SUP_DEF[k])return null;
  rd.supTex=rd.supTex||{};
  if(!rd.supTex[k]){const S=rdSupTex(k),t=new THREE.DataTexture(S.data,S.N,S.N,THREE.RGBAFormat);
    t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=8;t.needsUpdate=true;
    rd.supTex[k]=t;}
  return rd.supTex[k];
}
function rdDisk(c,R,z){
  const st=rd.st;
  if(!rd.disk){
    rd.mirRT=new THREE.WebGLRenderTarget(2048,2048,{samples:4,type:THREE.HalfFloatType});
    rd.mirCam=new THREE.PerspectiveCamera();rd.mirMat=new THREE.Matrix4();
    const U={color:{value:new THREE.Color()},tRefl:{value:rd.mirRT.texture},texM:{value:rd.mirMat},uC:{value:new THREE.Vector3()},
      uR:{value:1},uDisk:{value:1},uRefl:{value:1},tSup:{value:null},uSup:{value:0},uSupT:{value:100}};
    rd.disk=new THREE.Mesh(new THREE.CircleGeometry(1,128),new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,
      vertexShader:'uniform mat4 texM; varying vec4 vUv; varying vec3 vW;\nvoid main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; vUv = texM * vec4(position, 1.0); gl_Position = projectionMatrix * viewMatrix * wp; }',
      fragmentShader:'uniform vec3 color; uniform sampler2D tRefl; uniform vec3 uC; uniform float uR; uniform float uDisk; uniform float uRefl; uniform sampler2D tSup; uniform float uSup; uniform float uSupT; varying vec4 vUv; varying vec3 vW;\n'+
        'void main(){ float d = distance(vW, uC); float a = uDisk > 0.5 ? 1.0 - smoothstep(uR * 1.6, uR * 5.5, d) : 0.0; vec3 refl = vec3(0.0); float ra = 0.0; float f = 0.0; '+
        'if(uRefl > 0.5 && vUv.w > 1e-4){ vec2 uv = vUv.xy / vUv.w; if(uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0){ vec4 r4 = texture2D(tRefl, uv); ra = r4.a; refl = ra > 1e-4 ? r4.rgb / ra : vec3(0.0); f = exp(-pow(d / max(uR * 1.2, 1e-3), 2.0) * 1.6) * 0.8; } } '+
        'vec3 base = uSup > 0.5 ? pow(texture2D(tSup, vW.xy / uSupT).rgb, vec3(2.2)) : pow(color, vec3(2.2)); '+ // couleur choisie ou support (sRGB) → linéaire
        'if(uDisk > 0.5){ gl_FragColor = vec4(mix(base, refl, clamp(f * ra * 0.7, 0.0, 1.0)), a); return; } gl_FragColor = vec4(refl, ra * f * 0.6); }'}));
    rd.disk.renderOrder=-3;rd.scene.add(rd.disk);
    rd.floor.renderOrder=-2; // l'ombre par-dessus le sol et le reflet
  }
  const U=rd.disk.material.uniforms;
  rd.disk.visible=!!(st.solOn||st.miroir)&&st.fond!=='studio';
  rd.disk.scale.set(R*8,R*8,1);rd.disk.position.set(c.x,c.y,z-R*0.001);rd.disk.updateMatrixWorld();
  U.color.value.set(rdSolHex());U.uC.value.set(c.x,c.y,z);U.uR.value=R;
  U.uDisk.value=st.solOn?1:0;U.uRefl.value=st.miroir?1:0;
  const sup=rdSupTex3(st.support);U.uSup.value=sup?1:0;U.tSup.value=sup;U.uSupT.value=sup?RD_SUP_DEF[st.support].t:100;
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
  rdUndo('vue de rendu enregistrée');
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
  rdUndo('vue de rendu supprimée');const n=cs[i].n;cs.splice(i,1);
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
function rdShow(){ // V0.15.0 : finition commune aux deux moteurs (98-rendu-post) — halo, tons, fond, étalonnage, vignettage, grain
  const A=rd.acc;
  if(!rd.post)rd.post=rpCreate(THREE,rd.r);
  rpRender(rd.post,A.a.texture,A.w,A.h,rpOpts(true,false));
}
function rdCount(){if(rd&&rd.cnt&&rd.acc)rd.cnt.textContent='Affinage : '+rd.acc.n+' / '+RD_PREVIEW+(rd.st.ouv>0?' · f/'+String(rd.st.ouv).replace('.',',')+' · net à '+Math.round(rdFocusDist())+' mm':'');}
function rdLoop(){
  rd&&(rd.raf=0);
  if(!rd||rd.busy||!rd.acc)return;
  const A=rd.acc,lim=rtOn()?1:RD_PREVIEW; // lancer de rayons : le moteur rapide ne fait que l'aperçu des glissers
  if(A.n===0||!rd.drag){
    const k=A.n===0?1:2;
    for(let j=0;j<k&&A.n<lim;j++)rdSample();
    rdShow();if(!rtOn())rdCount();
  }
  if(A.n<lim&&!rd.drag)rd.raf=requestAnimationFrame(rdLoop);
}
function rdReset(){ // la scène ou la vue a changé : l'aperçu repart de zéro
  if(!rd||!rd.acc)return;
  rd.acc.n=0;
  if(!rd.raf)rd.raf=requestAnimationFrame(rdLoop);
  rtKick();
}
/* ── rendu ── */
function rdFitCanvas(){
  if(!rd)return;
  const host=rd.view,W=Math.max(200,host.clientWidth-24),H=Math.max(120,host.clientHeight-24);
  let w=W,h=Math.round(W*9/16);if(h>H){h=H;w=Math.round(H*16/9);}
  rd.r.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  rd.r.setSize(w,h,false);rd.canvas.style.width=w+'px';rd.canvas.style.height=h+'px';
  const sz=rd.r.getDrawingBufferSize(new THREE.Vector2());
  rdAccInit(sz.x,sz.y);rdReset();rtFit();
}
function rdRefresh(what){
  if(!rd)return;
  if(what==='env'){rdBuildEnv();rdBackground();}
  if(what==='fond')rdBackground();
  if(what==='objets')rdBuildObjects();
  rdFloor();rdApplyCam();rdReset();rdSave();rtRefresh(what);
}
async function rdExport(){
  if(!rd||rd.busy)return;
  if(rtOn())return rtExport();
  rd.busy=true;
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
    const nm=String((typeof doc!=='undefined'&&doc&&doc.name)||'piece').replace(/[\\/:*?"<>|]+/g,'-');
    const sv=await rdSaveImage(blob,W,H,nm+' - rendu '+W+'x'+H);url=sv.url; // PNG, ou archive des calques (98-rendu-post)
    rdMsg((sv.zip?'Calques ':'Image ')+W+'×'+H+(sv.zip?' enregistrés : ':' enregistrée : ')+N+' passes en '+((performance.now()-t0)/1000).toFixed(1).replace('.',',')+' s ('+(sv.size/1048576).toFixed(1).replace('.',',')+' Mo).');
  }catch(e){rdMsg('Rendu impossible : '+(e&&e.message||e));}
  finally{
    rd.busy=false;
    rdFitCanvas();
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
  // V0.11.2 : même habillage que le panneau de la mise en plan (carte « Paramètres », lignes compactes,
  // boutons segmentés), une seule page en blocs encadrés — moins de place, l'image s'agrandit
  const s=document.createElement('style');s.id='rdCss';s.textContent=[
    '#rdOverlay{position:fixed;inset:0;z-index:9000;display:flex;background:#101012;color:var(--text,#f5f5f7);font-size:.74rem}',
    '#rdView{flex:1;display:flex;align-items:center;justify-content:center;position:relative;min-width:0;background:repeating-conic-gradient(#1a1a1c 0% 25%,#141416 0% 50%) 50%/22px 22px}',
    '#rdView canvas{box-shadow:0 10px 40px rgba(0,0,0,.55);cursor:grab;outline:1px solid rgba(255,255,255,.08)}',
    '#rdView .rdHint{position:absolute;left:14px;bottom:10px;color:#98989d;font-size:.72rem}',
    '#rdView canvas.rdPT{position:absolute;pointer-events:none;box-shadow:none;outline:none}',
    '#rdView .rdCnt{position:absolute;right:14px;bottom:10px;color:#98989d;font-size:.72rem;font-variant-numeric:tabular-nums}',
    '#rdPanel{width:290px;flex:none;display:flex;flex-direction:column;background:var(--bg,#1c1c1e);padding:8px;gap:8px;min-height:0}',
    '#rdPanel .rdCard{flex:1;min-height:0;overflow-y:auto;padding:8px 10px}',
    '#rdPanel .rdHead{display:flex;align-items:center;gap:6px}',
    '#rdPanel .rdHead .panel-title{flex:1;margin:0}',
    '#rdPanel .rdHead button{padding:2px 8px;font-size:.7rem;border:1px solid var(--border);background:none;color:var(--text);border-radius:6px;cursor:pointer}',
    '#rdPanel .rdSec{border:1px solid var(--border);border-radius:8px;padding:6px 8px 7px;margin:8px 0 0;background:rgba(127,127,127,.04)}',
    '#rdPanel .rdSec>h4.rdSecT{margin:0 0 5px;padding-bottom:4px;border-bottom:1px solid var(--border);font-size:.7rem;color:var(--text);letter-spacing:.06em}',
    '#rdPanel h4{margin:8px 0 3px;font-size:.66rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);font-weight:600}',
    '#rdPanel .rdRow{display:flex;gap:5px;align-items:center;margin:4px 0;min-height:22px}',
    '#rdPanel .rdRow>label{flex:1;min-width:0;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#rdPanel select,#rdPanel input[type=number]{max-width:132px;padding:3px 6px;font-size:.72rem;border:1px solid var(--border);border-radius:5px;background:var(--bg);color:var(--text)}',
    '#rdPanel .rdRow>select{flex:0 1 128px;min-width:0}',
    '#rdPanel .rdRow.rdWrap{flex-wrap:wrap;justify-content:space-between;row-gap:3px}',
    '#rdPanel input[type=range]{flex:0 1 96px;min-width:0;margin:0}',
    '#rdPanel .rdV{min-width:36px;text-align:right;font-variant-numeric:tabular-nums;color:var(--text)}',
    '#rdPanel input[type=color]{width:30px;height:20px;padding:0;border:1px solid var(--border);border-radius:4px;background:none;flex:none}',
    '#rdPanel input[type=checkbox]{margin:0;flex:none}',
    '#rdPanel button.rdB{padding:3px 8px;font-size:.71rem;border:1px solid var(--border);background:none;color:var(--text);border-radius:6px;cursor:pointer}',
    '#rdPanel button.rdB:hover,#rdPanel .rdSeg button:hover{border-color:var(--primary,#0a84ff)}',
    '#rdPanel button.rdB.active{background:var(--primary,#0a84ff);border-color:var(--primary,#0a84ff);color:#fff}',
    '#rdPanel .rdSeg{display:inline-flex;flex-wrap:wrap;gap:3px;justify-content:flex-end}',
    '#rdPanel .rdSeg button{padding:3px 7px;font-size:.7rem;border:1px solid var(--border);background:none;color:var(--text);border-radius:6px;cursor:pointer}',
    '#rdPanel .rdSeg button.active{background:var(--primary,#0a84ff);border-color:var(--primary,#0a84ff);color:#fff;font-weight:600}',
    '#rdPanel .rdBtns{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}',
    '#rdPanel .rdChk{display:inline-flex;align-items:center;gap:3px;color:var(--text);white-space:nowrap;cursor:pointer}',
    '#rdPanel .rdLookRow{display:flex;align-items:center;gap:6px;width:100%;margin:2px 0;padding:4px 6px;border:1px solid transparent;border-radius:6px;background:none;color:var(--text);font-size:.72rem;cursor:pointer;text-align:left}',
    '#rdPanel .rdLookRow:hover{border-color:var(--primary,#0a84ff)}',
    '#rdPanel .rdLookRow>i{width:12px;height:12px;border-radius:3px;flex:none;outline:1px solid rgba(127,127,127,.4)}',
    '#rdPanel .rdLookRow>span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}',
    '#rdPanel .rdLookRow>em{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted);font-style:normal}',
    '#rdPanel .rdCam{display:inline-flex;border:1px solid var(--border);border-radius:6px;overflow:hidden}',
    '#rdPanel .rdCam>button{background:none;border:none;color:var(--text);padding:3px 8px;font-size:.71rem;cursor:pointer}',
    '#rdPanel .rdCam>button+button{border-left:1px solid var(--border);color:var(--muted)}',
    '#rdPanel .rdNote{color:var(--muted);font-size:.68rem;margin:4px 0;line-height:1.35}',
    '#rdPanel .rdFoot{flex:none;padding:8px 10px}',
    '#rdPanel .rdGo{width:100%;padding:7px;border:none;border-radius:8px;background:var(--primary,#0a84ff);color:#fff;font-weight:600;font-size:.76rem;cursor:pointer}',
    '#rdPanel .rdGo:disabled{opacity:.6;cursor:wait}',
    '#rdPanel .rdMsg{color:var(--accent,#30d158);font-size:.7rem;margin-top:6px;min-height:1em}',
    '#rdPanel .rdFootRow{display:flex;gap:5px;align-items:center;margin-bottom:6px;color:var(--muted)}',
    '#rdPanel .rdFootRow>span{flex:1}'
  ].join('\n');
  document.head.appendChild(s);
}
const RD_TABS=[['mot','Moteur'],['amb','Ambiance'],['fond','Fond et sol'],['cam','Appareil photo'],['vues','Vues enregistrées'],['mat','Matériaux et reliefs'],['fin','Finition'],['img','Image']]; // blocs du panneau, dans l'ordre
function rdPanel(){
  const st=rd.st,p=rd.panel;
  const sc0=rd.card?rd.card.scrollTop:0;p.innerHTML='';
  const el=(tag,cls,txt)=>{const d=document.createElement(tag);if(cls)d.className=cls;if(txt!=null)d.textContent=txt;return d;};
  const card=el('div','panel rdCard');p.appendChild(card);rd.card=card;
  const head=el('div','rdHead');head.appendChild(el('p','panel-title','Paramètres — Rendu'));
  const x=el('button',null,'Fermer');x.title='Revenir à la modélisation (Échap)';x.onclick=rdClose;head.appendChild(x);card.appendChild(head);
  // une seule page : un bloc encadré et titré par sujet (V0.11.2, habillage de la mise en plan)
  let pane=card;
  const row=(lab,...nodes)=>{const r=el('div','rdRow');r.appendChild(el('label',null,lab));nodes.forEach(n=>{if(n)r.appendChild(n);});pane.appendChild(r);return r;};
  const select=(opts,cur,fn)=>{const s=el('select');opts.forEach(([v,t])=>{const o=el('option',null,t);o.value=v;if(String(v)===String(cur))o.selected=true;s.appendChild(o);});s.onchange=()=>fn(s.value);return s;};
  const seg=(opts,cur,fn)=>{const d=el('div','rdSeg');opts.forEach(([v,t,tip])=>{const b=el('button',String(v)===String(cur)?'active':null,t);if(tip)b.title=tip;
    b.onclick=()=>fn(v);d.appendChild(b);});return d;};
  const slider=(lab,k,min,max,step,fmt,what)=>{
    const r=el('input');r.type='range';r.min=min;r.max=max;r.step=step;r.value=st[k];
    const v=el('span','rdV',fmt(+st[k]));
    r.oninput=()=>{st[k]=+r.value;v.textContent=fmt(st[k]);rdRefresh(what);};
    return row(lab,r,v);
  };
  const chk=(lab,k,tip)=>{const l=el('label','rdChk');l.title=tip||'';const c=el('input');c.type='checkbox';c.checked=!!st[k];
    c.onchange=()=>{st[k]=c.checked;rdRefresh();};l.appendChild(c);l.appendChild(document.createTextNode(lab));return l;};
  RD_TABS.forEach(([t,lab])=>{
  pane=el('div','rdSec');pane.appendChild(el('h4','rdSecT',lab));card.appendChild(pane);
  if(t==='mot'){
    row('Calcul',seg([['rapide','Rapide','Rastérisation affinée : image presque immédiate'],['rayons','Lancer de rayons','Suit la lumière de rebond en rebond : reflets entre pièces, ombres de contact, verre réfracté — plus lent']],st.moteur,rdSetMoteur));
    if(st.moteur==='rayons')pane.appendChild(el('div','rdNote','Sans arêtes CAO. Pendant un glisser, l’aperçu rapide reprend la main.'));
  }else if(t==='amb'){
    // V0.14.0 : image HDRI importée (98-rendu-scene), gardée par le navigateur
    const ambs=RD_AMB.concat(rdHdri?[['hdri','Image HDRI : '+rdHdri.name]]:[]);
    row('Lumière',select(ambs,st.amb,v=>{st.amb=v;if(v!=='hdri'&&st.fond==='hdri')st.fond='degrade';rdRefresh('env');rdRefresh('fond');rdPanel();}));
    const ib=el('button','rdB',rdHdri?'Autre image HDRI…':'Importer une image HDRI…');
    ib.title='Panorama .hdr ou .exr (Poly Haven…) : lumière, reflets et, au choix, fond de l’image ; « Lampe » règle son soleil';
    ib.onclick=()=>rdHdriImport(()=>{if(!rd)return;st.amb='hdri';rdRefresh('env');rdPanel();});
    const ir=el('div','rdBtns');ir.appendChild(ib);pane.appendChild(ir);
    slider('Rotation','envRot',0,360,5,v=>v+'°','env');
    slider('Reflets','envInt',0,3,0.05,v=>v.toFixed(2).replace('.',','),null);
    slider('Lampe','lum',0,3,0.05,v=>v.toFixed(2).replace('.',','),null);
    slider('Douceur','douceur',0,20,1,v=>v?String(v):'nette',null).title='Taille de la lampe : pénombre de l’ombre, calculée passe après passe';
    slider('Exposition','ev',-3,3,0.1,v=>(v>0?'+':'')+v.toFixed(1).replace('.',',')+' EV',null);
    row('Tons',select([['aces','Film (ACES)'],['doux','Doux (Reinhard)'],['cine','Cinéon'],['lin','Neutre (linéaire)']],st.tons,v=>{st.tons=v;rdRefresh();}));
  }else if(t==='fond'){
    const fonds=[['degrade','Dégradé'],['uni','Uni'],['studio','Studio','Fond courbe de photographe (sol, gorge et mur d’un seul tenant), couleur du sol']]
      .concat(st.amb==='hdri'&&rdHdri?[['hdri','Image','L’image HDRI derrière la pièce']]:[]).concat([['transparent','Transp.','Transparent : PNG détouré']]);
    row('Fond',seg(fonds,st.fond,v=>{st.fond=v;rdRefresh('fond');rdPanel();}));
    if(st.fond==='degrade'||st.fond==='uni'){
      const c1=el('input');c1.type='color';c1.value=st.fc1;c1.title=st.fond==='degrade'?'Haut du dégradé':'Couleur du fond';c1.oninput=()=>{st.fc1=c1.value;rdRefresh('fond');};
      let c2=null;if(st.fond==='degrade'){c2=el('input');c2.type='color';c2.value=st.fc2;c2.title='Bas du dégradé';c2.oninput=()=>{st.fc2=c2.value;rdRefresh('fond');};}
      row('Couleurs',c1,c2);
    }
    const pres=el('div','rdBtns');
    [['Blanc','#f2f3f5','#c3c7ce'],['Gris','#9aa0a8','#4b5058'],['Ardoise','#3a4049','#121417'],['Noir','#121214','#000000'],['Bleu nuit','#24324a','#0b111c']].forEach(([n,a,b])=>{
      const q=el('button','rdB',n);q.onclick=()=>{st.fc1=a;st.fc2=b;if(st.fond==='transparent')st.fond='degrade';rdPanel();rdRefresh('fond');};pres.appendChild(q);});
    if(st.fond!=='studio'&&st.fond!=='hdri')pane.appendChild(pres);
    pane.appendChild(el('h4',null,st.fond==='studio'?'Studio':'Sol'));
    if(st.fond==='studio'){ // fond courbe : sa couleur et son vernis
      const r=el('div','rdRow rdWrap');
      const sc=el('input');sc.type='color';sc.value=rdSolHex();sc.title='Couleur du fond courbe';sc.oninput=()=>{st.solCol=sc.value;rdRefresh();};
      r.appendChild(el('label',null,'Couleur'));r.appendChild(sc);
      r.appendChild(chk('Brillant','miroir','Fond verni : la pièce s’y reflète'));
      pane.appendChild(r);
    }else{ // Sol (et sa couleur) · Miroir · Ombre : trois cases, comme dans la vue CAO ; support texturé (V0.14.0)
      const r=el('div','rdRow rdWrap');
      r.appendChild(chk('Sol','solOn','Disque sous la pièce, bords fondus dans le fond'));
      const sc=el('input');sc.type='color';sc.value=rdSolHex();sc.title='Couleur du sol (par défaut : bas du fond)';sc.oninput=()=>{st.solCol=sc.value;rdRefresh();};r.appendChild(sc);
      r.appendChild(chk('Miroir','miroir','Reflet de la pièce au sol, avec ou sans disque'));
      r.appendChild(chk('Ombre','ombreOn','Ombre portée sur le sol'));
      pane.appendChild(r);
      row('Support',select(RD_SUPPORTS,st.support||'',v=>{st.support=v;if(v)st.solOn=true;rdRefresh();rdPanel();}))
        .title='Matière du sol, à l’échelle réelle (béton, plateau de bois, marbre, tapis de découpe quadrillé tous les 10 mm)';
      slider('Ombre','ombre',0,1,0.05,v=>Math.round(v*100)+' %',null);
    }
    pane.appendChild(el('h4',null,'Dessin'));
    row('Arêtes',seg([['non','Sans','Photo'],['cao','CAO','Comme la CAO : vives noires, tangentes grises']],st.aretes,v=>{st.aretes=v;rdBuildEdges();rdRefresh();rdPanel();}));
  }else if(t==='cam'){
    const fv=el('span','rdV',st.focale+' mm');
    const fs=el('input');fs.type='range';fs.min=14;fs.max=200;fs.step=1;fs.value=st.focale;
    fs.oninput=()=>{rdSetFocale(+fs.value);fv.textContent=rd.st.focale+' mm';rdReset();rdSave();};
    row('Focale',fs,fv);
    pane.appendChild(seg([24,35,50,85,135].map(f=>[f,String(f),f<35?'Grand angle':f>60?'Téléobjectif : peu de déformation, rendu « catalogue »':'Normal']),st.focale,
      f=>{rdSetFocale(+f);rdReset();rdSave();rdPanel();})).style.cssText='display:flex;justify-content:flex-end;margin:0 0 6px';
    row('Ouverture',select([['0','Tout net'],['1.4','f/1,4'],['2','f/2'],['2.8','f/2,8'],['4','f/4'],['5.6','f/5,6'],['8','f/8'],['11','f/11'],['16','f/16'],['22','f/22']],st.ouv,
      v=>{st.ouv=+v;rdReset();rdSave();rdCount();})).title='Profondeur de champ : plus le nombre est petit, plus le flou est fort (diamètre de la pupille = focale / ouverture)';
    const mb=st.map>0?el('button','rdB','Sur la cible'):null;
    if(mb)mb.onclick=()=>{st.map=0;rdReset();rdSave();rdPanel();};
    row('Mise au point',el('span','rdV',st.map>0?Math.round(st.map)+' mm':'cible'),mb).title='Cliquez sur la pièce (sans glisser) pour y placer la mise au point';
    pane.appendChild(el('div','rdNote','Clic sur la pièce : mise au point à cet endroit (visible avec une ouverture f/…).'));
    const vb=el('div','rdBtns');
    const b1=el('button','rdB','Cadrer la pièce');b1.onclick=()=>{rdFrame();rdReset();};vb.appendChild(b1);
    const b2=el('button','rdB','Reprendre la vue CAO');b2.onclick=()=>{rdFromView();rdReset();rdPanel();};vb.appendChild(b2);
    pane.appendChild(vb);
  }else if(t==='vues'){
    const cv=el('div','rdBtns');
    rdCams().forEach((k,i)=>{const w=el('span','rdCam');
      const g=el('button',null,k.n);g.title='Aller à cette vue (focale '+k.f+' mm)';g.onclick=()=>rdCamGo(k);
      const d=el('button',null,'×');d.title='Supprimer « '+k.n+' »';d.onclick=()=>rdCamDel(i);
      w.appendChild(g);w.appendChild(d);cv.appendChild(w);});
    if(!rdCams().length)pane.appendChild(el('div','rdNote','Aucune vue enregistrée.'));
    pane.appendChild(cv);
    const ca=el('button','rdB','+ Enregistrer la vue');ca.title='Position, cible et focale, enregistrées avec la pièce';ca.onclick=rdCamAdd;
    const r=el('div','rdBtns');r.appendChild(ca);pane.appendChild(r);
  }else if(t==='mat'){ // V0.17.0 : une ligne par pièce, le détail au clic droit (98-rendu-apparence)
    rdLookList(pane,el);
  }else if(t==='fin'){ // V0.15.0 : finition de l'image (98-rendu-post), appliquée à l'affichage : pas de nouvel affinage
    const pct=v=>Math.round(v*100)+' %',sg=v=>(v>0?'+':'')+Math.round(v*100);
    const look=()=>{rdSave();if(rd.acc&&rd.acc.n)rdShow();if(rd.rt&&rd.rt.pt){rd.rt.lookDirty=true;rtKick(false);}};
    const sl=(lab,k,min,max,fmt,tip)=>{const r=el('input');r.type='range';r.min=min;r.max=max;r.step=0.01;r.value=st[k];
      const v=el('span','rdV',fmt(+st[k]));r.oninput=()=>{st[k]=+r.value;v.textContent=fmt(st[k]);look();};const w=row(lab,r,v);if(tip)w.title=tip;return w;};
    if(st.moteur==='rayons')sl('Débruitage','pDen',0,1,pct,'Lisse le grain du lancer de rayons sans flouter les contours (filtre bilatéral)');
    sl('Halo','pHalo',0,1,pct,'La lumière des reflets intenses déborde autour d’eux');
    sl('Vignettage','pVig',0,1,pct,'Assombrit les bords de l’image');
    sl('Grain','pGrain',0,1,pct,'Grain de film, plus marqué dans les tons moyens');
    sl('Contraste','pCon',-0.5,0.5,sg);
    sl('Saturation','pSat',-1,1,sg);
    sl('Température','pTemp',-1,1,v=>v<-0.02?'froide':v>0.02?'chaude':'neutre','Balance des blancs : bleutée ou chaude');
    const b=el('div','rdBtns'),set=o=>()=>{Object.assign(st,o);look();rdPanel();};
    const n=el('button','rdB','Neutre');n.onclick=set({pHalo:0,pVig:0,pGrain:0,pCon:0,pSat:0,pTemp:0});b.appendChild(n);
    const ph=el('button','rdB','Photo');ph.title='Halo léger, vignettage, grain fin, un peu de contraste';ph.onclick=set({pHalo:0.3,pVig:0.35,pGrain:0.2,pCon:0.1,pSat:0.05,pTemp:0});b.appendChild(ph);
    const ci=el('button','rdB','Cinéma');ci.title='Contraste fort, couleurs chaudes, vignettage marqué';ci.onclick=set({pHalo:0.45,pVig:0.55,pGrain:0.35,pCon:0.2,pSat:-0.1,pTemp:0.35});b.appendChild(ci);
    pane.appendChild(b);
  }else if(t==='img'){
    row('Format',seg([['1080','1920 × 1080'],['2160','4K','3840 × 2160']],st.res,v=>{st.res=v;rdSave();rdPanel();rdFoot();}));
    const ray=st.moteur==='rayons';
    row('Qualité',seg([['16','16'],['64','64'],['256','256']].map(([v])=>[v,ray?String(RT_ECH[v]):v,(v==='16'?'Brouillon':v==='64'?'Bonne':'Haute')+' : '+(ray?RT_ECH[v]+' échantillons':v+' passes')]),st.ech,v=>{st.ech=+v;rdSave();rdPanel();rdFoot();}))
      .title=ray?'Échantillons par pixel : moins de grain, surtout dans les ombres et le verre':'Nombre de passes moyennées : bords, ombres douces et profondeur de champ plus lisses';
    pane.appendChild(el('div','rdNote',(ray?'Échantillons : '+RT_ECH[16]+' brouillon · '+RT_ECH[64]+' bonne · '+RT_ECH[256]+' haute.':'Passes : 16 brouillon · 64 bonne · 256 haute.')+' Le fond transparent (onglet Fond et sol) donne un PNG détouré.'));
    const cr=el('div','rdRow');cr.appendChild(chk('Calques séparés (.zip)','calques','Pour la retouche : beauté, masque, profondeur, normales, identifiants des corps, ombre seule'));pane.appendChild(cr);
    if(st.calques)pane.appendChild(el('div','rdNote','Archive .zip : beauté, masque, profondeur, normales, identifiants des corps, ombre — même cadrage.'));
  }
  });
  // pied, toujours visible : format retenu + bouton
  const foot=el('div','panel rdFoot');p.appendChild(foot);rd.foot=foot;
  rdFoot();
  card.scrollTop=sc0;
}
function rdFoot(){
  const f=rd.foot;if(!f)return;const st=rd.st,msg=rd.msg?rd.msg.textContent:'';f.innerHTML='';
  const r=document.createElement('div');r.className='rdFootRow';
  const s=document.createElement('span');s.textContent=(st.res==='2160'?'3840 × 2160':'1920 × 1080')+' · '+(st.moteur==='rayons'?(RT_ECH[+st.ech]||512)+' échantillons':(+st.ech||64)+' passes')+(st.fond==='transparent'?' · détouré':'');r.appendChild(s);f.appendChild(r);
  const go=document.createElement('button');go.className='rdGo';go.textContent='Rendre et enregistrer le PNG';go.onclick=rdExport;f.appendChild(go);
  rd.msg=document.createElement('div');rd.msg.className='rdMsg';rd.msg.textContent=msg;f.appendChild(rd.msg);
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
  // patine (V0.13.0) : taches et traces, usure des arêtes, salissure des creux — rangée sous le relief
  const F=document.createDocumentFragment(),r2=el('div','rdRel');F.appendChild(r);
  const pt=select(PAT_TYPES,(rel0&&rel0.p)||'',v=>fn(relNorm(Object.assign({},rel0||{},{p:v||undefined}))));
  pt.title='Patine : variation de teinte et de rugosité, usure des arêtes (la peinture laisse voir le métal), salissure des creux';
  r2.appendChild(pt);F.appendChild(r2);
  return F;
}
function rdAsmRedraw(){ // l'assemblage redessine ses instances (userData.rd), puis l'atelier les reprend
  try{asmDraw();}catch(e){}try{asmCtxDraw();}catch(e){}
  rdRefresh('objets');rdPanel();
}
function rdKey(e){if(rd&&e.key==='Escape'&&!rd.busy&&!rdLookT){ // Échap ferme d'abord la fenêtre d'apparence (98-rendu-apparence)
  e.stopPropagation();e.preventDefault();rdClose();}}
function rdOpen(){
  if(rd)return;
  try{if(typeof skEdit!=='undefined'&&skEdit){faceEl.textContent='Terminez l’esquisse avant d’ouvrir le rendu.';return;}}catch(e){}
  try{if(typeof mfCloseMenus==='function')mfCloseMenus();}catch(e){}
  rdCss();
  const ov=document.createElement('div');ov.id='rdOverlay';
  const view=document.createElement('div');view.id='rdView';
  const canvas=document.createElement('canvas');view.appendChild(canvas);
  const hint=document.createElement('div');hint.className='rdHint';hint.textContent='Glisser ou clic molette : tourner · clic droit : déplacer · clic droit sur une pièce : son matériau · molette : avancer / reculer · clic : mise au point — le cadre est l’image finale (16:9)';view.appendChild(hint);
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
  if(ctl.mouseButtons&&THREE.MOUSE){ctl.mouseButtons.LEFT=THREE.MOUSE.ROTATE;ctl.mouseButtons.MIDDLE=THREE.MOUSE.ROTATE;ctl.mouseButtons.RIGHT=THREE.MOUSE.PAN;}
  ctl.addEventListener('change',()=>{if(rd&&!rd.busy){rdApplyCam();rdReset();}});
  ctl.addEventListener('start',()=>{if(rd)rd.drag=true;});
  ctl.addEventListener('end',()=>{if(rd){rd.drag=false;rdReset();}});
  let down=null,downR=null;
  canvas.addEventListener('pointerdown',e=>{down=e.button===0?{x:e.clientX,y:e.clientY}:null;downR=e.button===2?{x:e.clientX,y:e.clientY}:null;});
  // clic droit sans glisser sur une pièce : son matériau (98-rendu-apparence) ; glissé : déplacer la vue
  canvas.addEventListener('contextmenu',e=>{e.preventDefault();if(downR&&rd&&!rd.busy&&Math.hypot(e.clientX-downR.x,e.clientY-downR.y)<4){try{rdLookPick(e);}catch(err){}}downR=null;});
  canvas.addEventListener('pointerup',e=>{if(down&&rd&&!rd.busy&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<4){try{rdPick(e);rdPanel();}catch(err){}}down=null;});
  rd={ov,view,canvas,panel,r,cam,ctl,cnt,scene:new THREE.Scene(),pmrem:new THREE.PMREMGenerator(r),st:rdSettings(),keyDir:[-55,45],drag:false,raf:0};
  rdBuildObjects();rdBuildEnv();rdBackground();rdFloor();
  rdFromView();
  rdPanel();
  rd.onResize=()=>rdFitCanvas();window.addEventListener('resize',rd.onResize);
  document.addEventListener('keydown',rdKey,true);
  document.querySelectorAll('[data-mfrd]').forEach(b=>b.classList.add('on'));
  requestAnimationFrame(()=>{rdFitCanvas();if(rd&&rd.st.moteur==='rayons')rtStart();});
  if(rd.st.amb==='hdri'&&!rdHdri) // l'HDRI de la dernière fois (IndexedDB) ; absente : retour au studio
    rdHdriRestore().then(h=>{if(!rd)return;if(!h){rd.st.amb='studio';if(rd.st.fond==='hdri')rd.st.fond='degrade';}rdRefresh('env');rdRefresh('fond');rdPanel();});
}
function rdClose(){
  if(!rd)return;
  if(rd.raf)cancelAnimationFrame(rd.raf);
  rtStop();
  window.removeEventListener('resize',rd.onResize);document.removeEventListener('keydown',rdKey,true);
  try{rd.ctl.dispose();}catch(e){}
  try{if(rd.group)rd.group.traverse(o=>{if(o.material)o.material.dispose();if(o.geometry)o.geometry.dispose();});}catch(e){}
  try{if(rd.edges)rd.edges.traverse(o=>{if(o.material)o.material.dispose();if(o.geometry)o.geometry.dispose();});}catch(e){}
  try{if(rd.envRT)rd.envRT.dispose();rd.pmrem.dispose();}catch(e){}
  try{if(rd.floor){rd.floor.geometry.dispose();rd.floor.material.dispose();}if(rd.key&&rd.key.shadow.map)rd.key.shadow.map.dispose();}catch(e){}
  try{if(rd.disk){rd.disk.geometry.dispose();rd.disk.material.dispose();rd.mirRT.dispose();}}catch(e){}
  try{if(rd.studio){rd.studio.geometry.dispose();rd.studio.material.dispose();}if(rd.hdriBg)rd.hdriBg.dispose();Object.values(rd.supTex||{}).forEach(t=>t.dispose());}catch(e){}
  try{const A=rd.acc;if(A){['s','a','b'].forEach(k=>{if(A[k])A[k].dispose();});A.quad.geometry.dispose();A.mix.dispose();A.out.dispose();}rpDispose(rd.post);}catch(e){}
  try{rd.r.dispose();rd.r.forceContextLoss();}catch(e){}
  try{rdLookClose();}catch(e){}
  rd.ov.remove();rd=null;vEnvRdSt=null; // Rendu direct : réglages de la fenêtre relus
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
      vb.insertBefore(b,document.getElementById('btnLive')||st||null); // appareil photo, Rendu direct (98-rendu-vue), ⚙
    }
  }catch(e){}
})();
