/* ---------- environnements de RENDU dans la vue CAO (V0.10.0) ----------
   Réglages de vue ⚙ → « Environnement » : « Actuel (CAO) » (fond du thème, sol miroir, couleurs
   de la CAO) ou une ambiance de l'atelier RENDU (98-rendu) — Studio, Studio lumineux, Atelier,
   Extérieur, Scène noire — pour modéliser avec le rendu : reflets de l'ambiance, ombre douce au
   sol, fond dégradé. La pièce garde la COULEUR et le MATÉRIAU de la CAO (doc.bodies) : l'apparence de
   rendu (doc.rendu) ne sert qu'à l'atelier RENDU. Les arêtes, esquisses, surbrillances restent celles de la CAO.
   Comment : seules les matières des CORPS sont retouchées (onBeforeCompile) — couleur, métal et
   rugosité lus dans des uniformes (mat.color n'est jamais modifiée : la CAO la relit), puis tons
   ACES et sortie sRGB dans leur shader. Le moteur garde sa sortie linéaire : tout le reste de la
   scène s'affiche exactement comme avant. Espace CAO seulement (FAO, PLAN : environnement actuel). */
const VENV_LIST=[['actuel','Actuel (CAO)'],['studio','Studio'],['clair','Studio lumineux'],['atelier','Atelier'],['exterieur','Extérieur'],['noir','Scène noire']];
const VENV_SOL={studio:'#b4b8bf',clair:'#e2e4e8',atelier:'#272b31',exterieur:'#7d8894',noir:'#0b0b0d'}; // couleur du sol (case « Sol »)
const VENV_FOND={studio:['#d3d6db','#9a9fa7'],clair:['#f4f5f7','#cdd1d7'],atelier:['#3a4049','#121417'],exterieur:['#b7c5d4','#6a7684'],noir:['#1b1b1e','#000000']};
let vEnv='actuel';
try{const v=localStorage.getItem('minifusion_env');if(v&&VENV_LIST.some(x=>x[0]===v))vEnv=v;}catch(e){}
const vEnvS={on:false,amb:null,rt:null,key:null,bg:null,pmrem:null,sun:null,floor:null,mats:new Set()};
const VENV_GLSL=[
  'uniform vec3 uEnvCol;uniform float uEnvMet;uniform float uEnvRou;uniform float uEnvGlass;',
  'vec3 vEnvRrt(vec3 v){vec3 a=v*(v+0.0245786)-0.000090537;vec3 b=v*(0.983729*v+0.4329510)+0.238081;return a/b;}',
  'vec3 vEnvAces(vec3 c){',
  '  const mat3 I=mat3(vec3(0.59719,0.07600,0.02840),vec3(0.35458,0.90834,0.13383),vec3(0.04823,0.01566,0.83777));',
  '  const mat3 O=mat3(vec3(1.60475,-0.10208,-0.00327),vec3(-0.53108,1.10813,-0.07276),vec3(-0.07367,-0.00605,1.07602));',
  '  c*=1.0/0.6;c=I*c;c=vEnvRrt(c);c=O*c;return clamp(c,0.0,1.0);}',''].join('\n');
function vEnvActive(){return vEnvS.on;}
function vEnvSet(k){
  vEnv=VENV_LIST.some(x=>x[0]===k)?k:'actuel';
  try{localStorage.setItem('minifusion_env',vEnv);}catch(e){}
  const s=document.getElementById('optEnv');if(s)s.value=vEnv;
}
/* ── matières des corps ── */
function vEnvPatch(m){
  if(!m||!m.isMeshStandardMaterial||m.userData.vEnv)return;
  const U={uEnvCol:{value:new THREE.Color()},uEnvMet:{value:0.35},uEnvRou:{value:0.4},uEnvGlass:{value:0}};
  m.userData.vEnv={U,obc:m.onBeforeCompile,key:m.customProgramCacheKey,env:m.envMap,ei:m.envMapIntensity};
  m.onBeforeCompile=function(sh){
    Object.assign(sh.uniforms,U);
    sh.fragmentShader=VENV_GLSL+sh.fragmentShader
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );','vec4 diffuseColor = vec4( pow( uEnvCol, vec3( 2.2 ) ), opacity );')
      .replace('vec3 totalEmissiveRadiance = emissive;','vec3 totalEmissiveRadiance = pow( emissive, vec3( 2.2 ) );')
      .replace('#include <roughnessmap_fragment>','float roughnessFactor = uEnvRou;')
      .replace('#include <metalnessmap_fragment>','float metalnessFactor = uEnvMet;')
      .replace('#include <encodings_fragment>',
        // verre approché : plus opaque et plus réfléchissant sur les bords (Fresnel)
        'gl_FragColor.a = clamp( gl_FragColor.a + uEnvGlass * 0.6 * pow( 1.0 - abs( dot( normalize( normal ), normalize( vViewPosition ) ) ), 3.0 ), 0.0, 1.0 );'+
        'gl_FragColor.rgb = vEnvAces( gl_FragColor.rgb ); gl_FragColor = LinearTosRGB( gl_FragColor );');
  };
  m.customProgramCacheKey=function(){return 'vEnvPhoto';};
  m.envMap=vEnvS.rt.texture;m.envMapIntensity=1;
  m.needsUpdate=true;vEnvS.mats.add(m);
}
function vEnvUnpatch(m){
  const s=m&&m.userData&&m.userData.vEnv;if(!s)return;
  m.onBeforeCompile=s.obc;m.customProgramCacheKey=s.key;m.envMap=s.env;m.envMapIntensity=s.ei;
  delete m.userData.vEnv;m.needsUpdate=true;
}
function vEnvMeshes(cb){
  // corps de la pièce (hors modes congé / dépouille / coque : leur matière est celle de l'outil)
  (bodies||[]).forEach(b=>{
    if(!b||b.ghost||!b.mesh||!b.mesh.material)return;
    if(b._xSaved!=null||b._dSaved!=null||b._cSaved!=null)return;
    const id=bodyIdOfRuntime(b),L={mat:id?bodyMatOf(id):null,color:id?bodyColorOf(id):(b.color||0x9a9aa0)}; // vue CAO : couleur et matériau de la CAO (l'apparence de rendu ne sert qu'à l'atelier)
    cb(b.mesh,L);
    // passe intérieure d'un corps transparent (glassDepthMask, src/20) : même apparence
    b.mesh.children.forEach(c=>{if(c.isMesh&&c.material&&c.material.isMeshStandardMaterial)cb(c,L);});
  });
  // autres composants (autour de la pièce, ou mode Assembler) : apparence capturée (47, userData.rd)
  const visit=root=>{if(!root)return;root.traverse(o=>{const r=o.isMesh&&o.userData&&o.userData.rd;if(r&&!r.ghost)cb(o,{mat:r.cmat||null,color:r.ccol!=null?r.ccol:r.color});});};
  visit(scene.getObjectByName('asmCtx'));
  try{if(asmMode==='asm'&&asmScene)visit(asmScene.getObjectByName('asmOcc'));}catch(e){}
}
/* ── ambiance, fond, sol ── */
function vEnvBg(){
  const f=VENV_FOND[vEnv]||VENV_FOND.studio;
  const c=document.createElement('canvas');c.width=16;c.height=512;
  const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,512);g.addColorStop(0,f[0]);g.addColorStop(1,f[1]);
  x.fillStyle=g;x.fillRect(0,0,16,512);
  if(vEnvS.bg)vEnvS.bg.dispose();
  vEnvS.bg=new THREE.CanvasTexture(c); // sortie linéaire du moteur : les couleurs s'affichent telles quelles
  scene.background=vEnvS.bg;
}
function vEnvOn(){
  if(!vEnvS.pmrem)vEnvS.pmrem=new THREE.PMREMGenerator(renderer);
  if(vEnvS.amb!==vEnv){
    const old=vEnvS.rt,{rt,key}=rdEnvTex(vEnvS.pmrem,vEnv,0);
    vEnvS.rt=rt;vEnvS.key=key;vEnvS.amb=vEnv;
    vEnvS.mats.forEach(m=>{if(m.userData&&m.userData.vEnv)m.envMap=rt.texture;});
    if(old)old.dispose();
    vEnvBg();
  }
  if(vEnvS.on)return;
  vEnvS.on=true;
  if(scene.background!==vEnvS.bg)vEnvBg();
  try{floorSync();}catch(e){} // sol : couleur de l'ambiance, bords fondus (10-scene-3d)
}
function vEnvOff(){
  vEnvS.on=false;
  vEnvS.mats.forEach(vEnvUnpatch);vEnvS.mats.clear();
  scene.background=new THREE.Color();
  try{mf3D(document.body.getAttribute('data-theme')||'nuit');}catch(e){} // fond et sol du thème
  if(vEnvS.bg){vEnvS.bg.dispose();vEnvS.bg=null;}
  if(vEnvS.rt){vEnvS.rt.dispose();vEnvS.rt=null;}vEnvS.amb=null;
  try{floorSync();}catch(e){}
}
/* ── ombre portée (case « Ombre », tous les environnements de l'espace CAO) ──
   Lampe d'OMBRE seulement (intensité 0 : l'éclairage reste celui de la vue) + plan qui la reçoit. */
let vShadowOn=true;
try{if(localStorage.getItem('minifusion_ombre')==='off')vShadowOn=false;}catch(e){}
function vShadowStart(){
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap;
  const sun=new THREE.DirectionalLight(0xffffff,0);sun.name='vEnvSun';sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);sun.shadow.radius=6;sun.shadow.blurSamples=16;sun.shadow.bias=-0.0005;
  scene.add(sun);scene.add(sun.target);vEnvS.sun=sun;
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.ShadowMaterial({opacity:0.35}));
  fl.name='vEnvFloor';fl.receiveShadow=true;fl.raycast=()=>{};fl.userData.noMirror=true;fl.renderOrder=-2;
  scene.add(fl);vEnvS.floor=fl;
}
function vShadowStop(){
  try{(bodies||[]).forEach(b=>{if(b&&b.mesh)b.mesh.castShadow=false;});}catch(e){}
  try{const g=scene.getObjectByName('asmCtx');if(g)g.traverse(o=>{if(o.isMesh)o.castShadow=false;});}catch(e){}
  if(vEnvS.sun){scene.remove(vEnvS.sun.target);scene.remove(vEnvS.sun);if(vEnvS.sun.shadow.map)vEnvS.sun.shadow.map.dispose();vEnvS.sun=null;}
  if(vEnvS.floor){scene.remove(vEnvS.floor);vEnvS.floor.geometry.dispose();vEnvS.floor.material.dispose();vEnvS.floor=null;}
  renderer.shadowMap.enabled=false;
}
function vCaoWs(){
  if(typeof scene==='undefined'||!scene||typeof renderer==='undefined'||!renderer)return false;
  const ws=document.body&&document.body.getAttribute('data-ws');
  return !ws||ws==='cao';
}
const _vEnvBox=new THREE.Box3(),_vEnvC=new THREE.Vector3(),_vEnvSz=new THREE.Vector3();
function vEnvTick(){
  // appelée à chaque image (animate, 10-scene-3d) : suit l'espace de travail, les corps et leurs apparences
  const cao=vCaoWs(),envW=cao&&vEnv!=='actuel',shW=cao&&vShadowOn;
  // sol et reflet SUIVENT la pièce (déplacée, modifiée, composant placé) : recalés toutes les 15 images
  vEnvS.n=(vEnvS.n||0)+1;
  if(cao&&vEnvS.n%15===0&&(floorOn||mirrorOn)){try{refreshMirror();}catch(e){}}
  if(envW){if(!vEnvS.on||vEnvS.amb!==vEnv)vEnvOn();}else if(vEnvS.on)vEnvOff();
  if(shW&&!vEnvS.sun)vShadowStart();else if(!shW&&vEnvS.sun)vShadowStop();
  if(!envW&&!shW)return;
  if(envW&&mirrorU)mirrorU.color.value.set(VENV_SOL[vEnv]||VENV_SOL.studio); // sol à la couleur de l'ambiance
  const box=_vEnvBox.makeEmpty();
  vEnvMeshes((m,L)=>{
    const mat=m.material;if(!mat||!mat.isMeshStandardMaterial)return;
    if(envW){
      vEnvPatch(mat);const U=mat.userData.vEnv&&mat.userData.vEnv.U;
      if(U){
        const d=matDef(L.mat);
        U.uEnvCol.value.setHex(L.color);
        U.uEnvGlass.value=0;
        if(d&&d.trans){U.uEnvMet.value=0;U.uEnvRou.value=d.rough;U.uEnvGlass.value=1;} // verre approché : lisse, reflets nets, bords plus opaques
        else if(mat.transparent){U.uEnvMet.value=mat.metalness;U.uEnvRou.value=mat.roughness;} // transparence CAO : réglages de setMatAlpha
        else{U.uEnvMet.value=d?d.metal:0.15;U.uEnvRou.value=d?d.rough:0.42;}
        if(mat.envMap!==vEnvS.rt.texture)mat.envMap=vEnvS.rt.texture;
      }
    }
    const dv=matDef(L.mat);
    m.castShadow=shW&&m.name!=='glassIn'&&!(dv&&dv.trans); // un corps transparent (réglage CAO) porte aussi son ombre ; sa passe intérieure et le verre, non
    if(shW&&m.parent&&rdShown(m))box.expandByObject(m);
  });
  const fl=vEnvS.floor,sun=vEnvS.sun;if(!shW||!fl||!sun)return;
  fl.visible=!box.isEmpty();if(box.isEmpty())return;
  const dark=!envW||vEnv==='noir'||vEnv==='atelier';fl.material.opacity=dark?0.55:0.32;
  box.getCenter(_vEnvC);const R=box.getSize(_vEnvSz).length()*0.5||50;
  fl.scale.set(R*14,R*14,1);fl.position.set(_vEnvC.x,_vEnvC.y,box.min.z-R*0.002);
  const k=envW?vEnvS.key:[-34,59]; // environnement actuel : direction de la lampe de la vue (10-scene-3d)
  const a=k[0]*Math.PI/180,e=k[1]*Math.PI/180,D=R*4;
  sun.position.set(_vEnvC.x+D*Math.cos(e)*Math.cos(a),_vEnvC.y+D*Math.cos(e)*Math.sin(a),_vEnvC.z+D*Math.sin(e));
  sun.target.position.copy(_vEnvC);sun.target.updateMatrixWorld();
  const sc=sun.shadow.camera;
  if(sc.right!==R*1.6||sc.far!==R*8){sc.left=-R*1.6;sc.right=R*1.6;sc.top=R*1.6;sc.bottom=-R*1.6;sc.near=R*0.5;sc.far=R*8;sc.updateProjectionMatrix();}
}
(function(){
  // ⚙ Réglages de visualisation → Affichage : liste « Environnement », en tête
  try{
    const mi=document.getElementById('optMirror'),row0=mi&&mi.closest('.setRow');
    if(!row0||document.getElementById('optEnv'))return;
    const row=document.createElement('div');row.className='setRow';
    const lab=document.createElement('label');lab.textContent='Environnement ';
    const s=document.createElement('select');s.id='optEnv';
    s.title='Actuel : fond du thème · ambiances : éclairage et reflets de l’atelier RENDU, fond dégradé, pour modéliser — la pièce garde ses couleurs et matériaux CAO — espace CAO';
    VENV_LIST.forEach(([k,t])=>{const o=document.createElement('option');o.value=k;o.textContent=t;if(k===vEnv)o.selected=true;s.appendChild(o);});
    s.onchange=()=>vEnvSet(s.value);
    lab.appendChild(s);row.appendChild(lab);
    row0.parentNode.insertBefore(row,row0);
    const lo=document.createElement('label');lo.title='Ombre portée de la pièce sur le sol (espace CAO)';
    const co=document.createElement('input');co.type='checkbox';co.id='optShadow';co.checked=vShadowOn;
    co.onchange=()=>{vShadowOn=co.checked;try{localStorage.setItem('minifusion_ombre',vShadowOn?'on':'off');}catch(e){}};
    lo.appendChild(co);lo.appendChild(document.createTextNode(' Ombre'));
    row0.appendChild(document.createTextNode(' '));row0.appendChild(lo);
  }catch(e){}
})();
