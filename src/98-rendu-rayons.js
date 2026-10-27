/* ---------- atelier RENDU : moteur « Lancer de rayons » (V0.12.0, prototype) ----------
   Second moteur de l'atelier (bloc « Moteur » du panneau) : three-gpu-pathtracer sur un three RÉCENT, empaqueté
   à part (threejs/rendu-rayons.js → window.RDPT, chargé au premier choix du moteur). Il ne partage rien avec le
   three r147 de la CAO ni avec le moteur rapide : son canevas (posé sur celui du moteur rapide, sans souris :
   la navigation et la mise au point restent au moteur rapide), son contexte WebGL, ses copies des maillages de
   l'atelier (rd.group, mêmes matières physiques).
   - Lumière : la même ambiance (rdEnvDesc) calculée en image équirectangulaire flottante, plus la lampe de
     l'atelier en petit disque (rayon angulaire = « Douceur ») de même énergie que dans le moteur rapide.
     La lumière est suivie de rebond en rebond : reflets entre pièces, ombres de contact, verre réfracté.
   - Sol : disque à bords fondus (alphaMap, comme rdDisk), vernis si « Miroir ». Le fond (dégradé, uni,
     transparent) est composé derrière le canevas, comme rdShow le fait pour le moteur rapide.
   - Pendant un glisser, l'image du moteur rapide reparaît (instantanée), puis l'affinage repart de zéro.
   Limites du prototype : les reliefs (bump) ne sont rendus que par la rugosité qu'ils ajoutent, pas d'arêtes
   CAO, le curseur « Ombre » (opacité) est sans effet. */
const RT_SRC='threejs/rendu-rayons.js';
const RT_PREVIEW=512; // échantillons par pixel de l'aperçu
const RT_ECH={16:128,64:512,256:2048}; // qualité de l'image (passes du moteur rapide) → échantillons par pixel
const RT_TONS={aces:'ACESFilmicToneMapping',doux:'ReinhardToneMapping',cine:'CineonToneMapping',lin:'NoToneMapping'};
let rtLoading=null;
function rtLoad(){
  if(window.RDPT)return Promise.resolve(window.RDPT);
  if(!rtLoading)rtLoading=new Promise((ok,ko)=>{
    const s=document.createElement('script');s.src=RT_SRC;
    s.onload=()=>window.RDPT?ok(window.RDPT):ko(new Error('bibliothèque vide'));
    s.onerror=()=>{rtLoading=null;s.remove();ko(new Error(RT_SRC+' introuvable'));};
    document.head.appendChild(s);
  });
  return rtLoading;
}
function rtOn(){return !!(rd&&rd.rt&&rd.rt.pt&&rd.st.moteur==='rayons');}
function rtSamples(){return rd.rt.pt.samples;}
/* ── ambiance → image équirectangulaire (convention du pathtracer : u autour de Y, v de haut en bas) ── */
function rtEnvData(){
  const st=rd.st,D=rdEnvDesc(st.amb),W=1024,H=512,data=new Float32Array(W*H*4);
  const rot=st.envRot*Math.PI/180;
  const rgb=h=>[((h>>16)&255)/255,((h>>8)&255)/255,(h&255)/255];
  const P=D.panels.map(([az,el,dist,w,h,inten,tint])=>{ // repère du panneau, tourné vers le centre (comme lookAt)
    const a=az*Math.PI/180+rot,e=el*Math.PI/180;
    const c=[Math.cos(e)*Math.cos(a),Math.cos(e)*Math.sin(a),Math.sin(e)];
    let x=[c[1],-c[0],0];const nx=Math.hypot(x[0],x[1])||1;x=[x[0]/nx,x[1]/nx,0]; // haut × (-c)
    const y=[c[2]*x[1],-c[2]*x[0],-(c[0]*x[1]-c[1]*x[0])];                         // (-c) × x
    return {c,x,y,dist,hw:w/2,hh:h/2,col:rgb(tint).map(v=>v*inten)};
  });
  const T=D.sky.top,Hz=D.sky.hor,B=D.sky.bot;
  // lampe : disque de rayon « Douceur » (comme rdSunJitter), éclairement égal à celui de la DirectionalLight r147
  const ka=(D.key[0]+st.envRot)*Math.PI/180,ke=D.key[1]*Math.PI/180;
  const kd=[Math.cos(ke)*Math.cos(ka),Math.cos(ke)*Math.sin(ka),Math.sin(ke)];
  const kr=Math.max(0.8,st.douceur*0.4)*Math.PI/180,kc=Math.cos(kr);
  const E=st.lum*(st.amb==='noir'?0.6:1.4)*Math.PI; // r147 (lumières non physiques) : éclairement × π
  const lamp=[];let om=0;const eUp=[0,0,0]; // éclairement d'un plan horizontal par le ciel et les panneaux
  const dU=2*Math.PI/W,dV=Math.PI/H;
  for(let j=0;j<H;j++){
    const ph=(1-(j+0.5)/H)*Math.PI,sp=Math.sin(ph),cp=Math.cos(ph);
    for(let i=0;i<W;i++){
      const th=((i+0.5)/W-0.5)*2*Math.PI;
      const d0=sp*Math.cos(th),d1=cp,d2=sp*Math.sin(th); // direction du monde (Z en haut chez nous)
      let r,g,b;const z=d2;
      if(z>=0){const k=Math.pow(z,0.6);r=Hz.r+(T.r-Hz.r)*k;g=Hz.g+(T.g-Hz.g)*k;b=Hz.b+(T.b-Hz.b)*k;}
      else{const k=Math.pow(-z,0.5);r=Hz.r+(B.r-Hz.r)*k;g=Hz.g+(B.g-Hz.g)*k;b=Hz.b+(B.b-Hz.b)*k;}
      let best=Infinity;
      for(const p of P){
        const dc=d0*p.c[0]+d1*p.c[1]+d2*p.c[2];if(dc<1e-6)continue;
        const t=p.dist/dc;if(t>=best)continue;
        const lx=t*d0-p.dist*p.c[0],ly=t*d1-p.dist*p.c[1],lz=t*d2-p.dist*p.c[2];
        if(Math.abs(lx*p.x[0]+ly*p.x[1]+lz*p.x[2])>p.hw||Math.abs(lx*p.y[0]+ly*p.y[1]+lz*p.y[2])>p.hh)continue;
        best=t;[r,g,b]=p.col;
      }
      const k=4*(j*W+i);data[k]=r;data[k+1]=g;data[k+2]=b;data[k+3]=1;
      if(z>0){const w=z*dU*dV*sp;eUp[0]+=r*w;eUp[1]+=g*w;eUp[2]+=b*w;}
      if(d0*kd[0]+d1*kd[1]+d2*kd[2]>=kc){lamp.push(k);om+=dU*dV*sp;}
    }
  }
  if(om>0&&E>0){const L=E/om;lamp.forEach(k=>{data[k]+=L;data[k+1]+=L;data[k+2]+=L;});} // énergie exacte sur les pixels touchés
  return {data,W,H,eUp,eKey:E*Math.max(0,Math.sin(ke))};
}
function rtBuildEnv(){
  const R=rd.rt,T=R.T,{data,W,H,eUp,eKey}=rtEnvData();
  R.eUp=eUp;R.eKey=eKey;
  const tex=new T.DataTexture(data,W,H,T.RGBAFormat,T.FloatType);
  tex.mapping=T.EquirectangularReflectionMapping;tex.magFilter=tex.minFilter=T.LinearFilter;tex.needsUpdate=true;
  if(R.env)R.env.dispose();
  R.env=tex;R.scene.environment=tex;R.scene.environmentIntensity=rd.st.envInt;R.envKey=rtEnvKey();
}
function rtEnvKey(){const st=rd.st;return [st.amb,st.envRot,st.lum,st.douceur].join('|');}
function rtFloorKey(){const st=rd.st;return [st.solOn,st.miroir,st.ombreOn,rdSolHex(),rd.rt.envKey,st.envInt].join('|');} // l'albédo du sol suit l'éclairement
/* ── objets et sol : copies des maillages de l'atelier ── */
function rtAttr(T,a){
  if(!a.isInterleavedBufferAttribute)return new T.BufferAttribute(a.array,a.itemSize,a.normalized);
  const o=new Float32Array(a.count*a.itemSize);
  for(let i=0;i<a.count;i++)for(let c=0;c<a.itemSize;c++)o[i*a.itemSize+c]=a.getComponent?a.getComponent(i,c):[a.getX(i),a.getY(i),a.getZ(i)][c];
  return new T.BufferAttribute(o,a.itemSize);
}
function rtMaterial(T,m,src){
  // la matière physique du moteur rapide (rdMaterial), relue champ par champ ; un relief devient sa rugosité
  const d=src?matDef(src.mat):null,rel=src?relOf({rel:src.rel},d):null;
  const p=new T.MeshPhysicalMaterial({metalness:m.metalness,roughness:Math.min(1,m.roughness+(rel?REL_DEF[rel.t].r:0)),
    clearcoat:m.clearcoat,clearcoatRoughness:m.clearcoatRoughness,transmission:m.transmission,ior:m.ior,thickness:m.thickness,
    attenuationDistance:m.attenuationDistance,sheen:m.sheen,sheenRoughness:m.sheenRoughness});
  p.color.setRGB(m.color.r,m.color.g,m.color.b); // déjà linéaires (rdLin) = espace de travail du three récent
  p.attenuationColor.setRGB(m.attenuationColor.r,m.attenuationColor.g,m.attenuationColor.b);
  if(m.sheenColor)p.sheenColor.setRGB(m.sheenColor.r,m.sheenColor.g,m.sheenColor.b);
  return p;
}
function rtFloorAlpha(T){ // opaque jusqu'à 1,6 R, transparent à 5,5 R, sur un disque de rayon 8 R (rdDisk)
  const N=256,a=new Uint8Array(N*N*4);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
    const r=Math.hypot((x+0.5)/N-0.5,(y+0.5)/N-0.5)*16,t=Math.min(1,Math.max(0,(r-1.6)/3.9)),v=Math.round(255*(1-t*t*(3-2*t)));
    const k=4*(y*N+x);a[k]=a[k+1]=a[k+2]=a[k+3]=v;
  }
  const tx=new T.DataTexture(a,N,N,T.RGBAFormat);tx.magFilter=tx.minFilter=T.LinearFilter;tx.needsUpdate=true;return tx;
}
function rtFloorMat(){
  const R=rd.rt,st=rd.st,m=R.floor.material,on=!!(st.solOn||st.miroir||st.ombreOn);
  // comme rdDisk, le sol HORS de l'ombre garde sa couleur choisie : albédo = couleur × π / éclairement reçu
  // (ciel et panneaux × « Reflets », plus la lampe) ; l'ombre et l'occlusion au contact l'assombrissent
  m.color.set(rdSolHex()); // sRGB → linéaire (gestion des couleurs du three récent)
  const E=[0,1,2].map(i=>Math.max(1e-3,R.eUp[i]*st.envInt+R.eKey));
  m.color.setRGB(Math.min(1,m.color.r*Math.PI/E[0]),Math.min(1,m.color.g*Math.PI/E[1]),Math.min(1,m.color.b*Math.PI/E[2]));
  m.roughness=st.miroir?0.4:0.9;m.clearcoat=st.miroir?1:0;m.clearcoatRoughness=0.04;
  m.opacity=on?1:0;R.floorKey=rtFloorKey();
}
function rtBuildObjects(){
  const R=rd.rt,T=R.T;
  if(R.group){R.scene.remove(R.group);R.group.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});}
  const G=new T.Group();
  (rd.group?rd.group.children:[]).forEach((m,i)=>{
    if(!m.isMesh||!m.geometry||!m.geometry.attributes.position)return;
    const A=m.geometry.attributes,g=new T.BufferGeometry();
    g.setAttribute('position',rtAttr(T,A.position));
    if(A.normal)g.setAttribute('normal',rtAttr(T,A.normal));else g.computeVertexNormals();
    if(m.geometry.index)g.setIndex(new T.BufferAttribute(m.geometry.index.array,1));
    const o=new T.Mesh(g,rtMaterial(T,m.material,rd.srcs&&rd.srcs[i]));
    o.matrixAutoUpdate=false;o.matrix.fromArray(m.matrix.elements);
    G.add(o);
  });
  R.group=G;R.scene.add(G);
  // sol : un disque toujours présent (sa matière seule change : pas de BVH à refaire pour une case cochée)
  const b=rd.box,c=b.getCenter(new THREE.Vector3()),Rr=b.getSize(new THREE.Vector3()).length()*0.5||50;
  if(!R.floor){
    R.floor=new T.Mesh(new T.CircleGeometry(1,128),new T.MeshPhysicalMaterial({metalness:0,transparent:true,alphaMap:rtFloorAlpha(T)}));
    R.floor.matrixAutoUpdate=false;R.scene.add(R.floor);
  }
  R.floor.matrix.makeScale(Rr*8,Rr*8,1).setPosition(c.x,c.y,b.min.z-Rr*0.001);
  rtFloorMat();
  R.pt.setScene(R.scene,R.cam);
}
/* ── appareil photo : celui du moteur rapide, recopié (focale sur 36 mm, pupille = focale / ouverture) ── */
function rtSyncCam(){
  const c=rd.rt.cam,s=rd.cam,st=rd.st;
  c.position.fromArray(s.position.toArray());c.quaternion.fromArray(s.quaternion.toArray());c.up.fromArray(s.up.toArray());
  c.fov=s.fov;c.aspect=s.aspect;c.near=s.near;c.far=s.far;c.filmGauge=36;
  c.fStop=st.ouv>0?st.ouv:1e6;c.focusDistance=rdFocusDist();
  c.updateProjectionMatrix();c.updateMatrixWorld();
  rd.rt.pt.setCamera(c);
}
function rtLook(){ // tons, exposition, fond : à l'affichage seulement (pas de nouvel affinage)
  const R=rd.rt,T=R.T,st=rd.st;
  const tm=T[RT_TONS[st.tons]||'ACESFilmicToneMapping'];
  if(R.r.toneMapping!==tm){R.r.toneMapping=tm;R.pt._quad.material.needsUpdate=true;}
  R.r.toneMappingExposure=Math.pow(2,st.ev);
  R.canvas.style.background=st.fond==='transparent'?'none':st.fond==='degrade'?'linear-gradient('+st.fc1+','+st.fc2+')':st.fc1;
}
/* ── affinage ──
   Le compteur du pathtracer avance à l'ENVOI des tuiles (3 × 3 par échantillon) : sans frein, la file du GPU
   s'allonge de plusieurs secondes et fige la page. Une barrière (fenceSync, WebGL 2) suit chaque lot : le lot
   suivant ne part qu'une fois le précédent calculé, et sa taille vise une durée GPU (cible, en ms). */
function rtGpuReady(R,cible){
  if(!R.fence)return true;
  const gl=R.r.getContext();
  if(gl.getSyncParameter(R.fence,gl.SYNC_STATUS)!==gl.SIGNALED)return false;
  gl.deleteSync(R.fence);R.fence=null;
  const dt=Math.max(1,performance.now()-R.tSub);
  R.batch=Math.max(1,Math.min(144,Math.round(R.batch*Math.min(2,Math.max(0.5,cible/dt)))));
  return true;
}
function rtSubmit(R,goal){ // jusqu'à R.batch tuiles, puis la barrière
  for(let i=0;i<R.batch&&rtSamples()<goal;i++){R.pt.renderSample();if(R.pt.isCompiling)break;}
  const gl=R.r.getContext();R.fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();R.tSub=performance.now();
}
function rtLoop(){
  const R=rd&&rd.rt;if(!R||!R.pt)return;
  R.raf=0;
  if(rd.busy||rd.st.moteur!=='rayons')return;
  if(rd.drag){R.canvas.style.visibility='hidden';return;}
  if(R.camDirty){rtSyncCam();R.camDirty=false;}
  if(rtSamples()<RT_PREVIEW){if(rtGpuReady(R,24))rtSubmit(R,RT_PREVIEW);}
  else if(R.lookDirty){R.pt.pausePathTracing=true;R.pt.renderSample();R.pt.pausePathTracing=false;}
  R.lookDirty=false;
  R.canvas.style.visibility=rtSamples()>=1?'visible':'hidden';
  rtCount();
  if(rtSamples()<RT_PREVIEW)R.raf=requestAnimationFrame(rtLoop);
}
function rtKick(cam){
  const R=rd&&rd.rt;if(!R||!R.pt)return;
  if(cam!==false)R.camDirty=true;
  if(!R.raf)R.raf=requestAnimationFrame(rtLoop);
}
function rtCount(){
  if(!rtOn()||!rd.cnt)return;
  const R=rd.rt;
  rd.cnt.textContent=R.pt.isCompiling?'Lancer de rayons : préparation du calcul (la première fois : jusqu’à 30 s)…':
    'Lancer de rayons : '+Math.floor(rtSamples())+' / '+RT_PREVIEW+' échantillons'+(rd.st.ouv>0?' · f/'+String(rd.st.ouv).replace('.',','):'');
}
function rtFit(){
  const R=rd&&rd.rt;if(!R||!R.r)return;
  const c=rd.canvas;
  R.canvas.style.left=c.offsetLeft+'px';R.canvas.style.top=c.offsetTop+'px';
  R.canvas.style.width=c.style.width;R.canvas.style.height=c.style.height;
  R.r.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  R.r.setSize(parseInt(c.style.width)||c.clientWidth,parseInt(c.style.height)||c.clientHeight,false);
  R.pt.reset();rtKick();
}
function rtRefresh(what){ // pendant de rdRefresh : ne refait que ce qui a changé
  const R=rd&&rd.rt;if(!R||!R.pt)return;
  const st=rd.st;
  if(what==='objets'){rtBuildObjects();}
  else{
    if(rtEnvKey()!==R.envKey){rtBuildEnv();R.pt.updateEnvironment();}
    else if(R.scene.environmentIntensity!==st.envInt){R.scene.environmentIntensity=st.envInt;R.pt.updateEnvironment();}
    if(rtFloorKey()!==R.floorKey){rtFloorMat();R.pt.updateMaterials();}
  }
  R.lookDirty=true;rtLook();rtKick();
}
/* ── démarrage / arrêt ── */
async function rtStart(){
  if(!rd||rd.rt)return;
  const R=rd.rt={};
  rdMsg('Chargement du moteur « Lancer de rayons »…');
  let L;
  try{L=await rtLoad();}
  catch(e){if(rd&&rd.rt===R){rd.rt=null;rd.st.moteur='rapide';rdSave();rdPanel();rdMsg('Lancer de rayons indisponible : '+(e&&e.message||e));}return;}
  if(!rd||rd.rt!==R)return; // atelier fermé ou moteur changé pendant le chargement
  const T=L.THREE,canvas=document.createElement('canvas');canvas.className='rdPT';
  let r;
  try{r=new T.WebGLRenderer({canvas,antialias:false,alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});}
  catch(e){rd.rt=null;rd.st.moteur='rapide';rdSave();rdPanel();rdMsg('Lancer de rayons indisponible : WebGL 2 refusé.');return;}
  r.outputColorSpace=T.SRGBColorSpace;
  canvas.style.visibility='hidden';rd.view.appendChild(canvas);
  const pt=new L.WebGLPathTracer(r);
  pt.renderDelay=0;pt.fadeDuration=0;pt.minSamples=1;pt.rasterizeScene=false;
  pt.bounces=8;pt.transmissiveBounces=10;pt.filterGlossyFactor=0.5;
  const cam=new L.PhysicalCamera();cam.up.set(0,0,1);
  Object.assign(R,{L,T,r,canvas,pt,cam,scene:new T.Scene(),raf:0,batch:9,fence:null});
  try{
    const t0=performance.now();
    rtBuildEnv();rtSyncCam();rtBuildObjects();
    rtLook();
    rtFit();
    rdMsg('Lancer de rayons prêt ('+(rd.srcs||[]).length+' corps, scène préparée en '+((performance.now()-t0)/1000).toFixed(1).replace('.',',')+' s).');
  }catch(e){rtStop();rd.st.moteur='rapide';rdSave();rdPanel();rdMsg('Lancer de rayons impossible : '+(e&&e.message||e));}
  rdReset();
}
function rtStop(){
  const R=rd&&rd.rt;if(!R)return;
  rd.rt=null;
  if(R.raf)cancelAnimationFrame(R.raf);
  try{if(R.group)R.group.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});}catch(e){}
  try{if(R.floor){R.floor.geometry.dispose();if(R.floor.material.alphaMap)R.floor.material.alphaMap.dispose();R.floor.material.dispose();}}catch(e){}
  try{if(R.env)R.env.dispose();}catch(e){}
  try{if(R.fence)R.r.getContext().deleteSync(R.fence);if(R.pt)R.pt.dispose();}catch(e){}
  try{if(R.r){R.r.dispose();R.r.forceContextLoss();}}catch(e){}
  try{if(R.canvas)R.canvas.remove();}catch(e){}
}
function rdSetMoteur(v){
  if(rd.busy||rd.st.moteur===v)return;
  rd.st.moteur=v;rdSave();
  if(v==='rayons')rtStart();else{rtStop();rdMsg('');}
  rdReset();rdPanel();
}
/* ── image finale ── */
async function rtExport(){
  const R=rd.rt,st=rd.st,W=st.res==='2160'?3840:1920,H=st.res==='2160'?2160:1080,N=RT_ECH[+st.ech]||512;
  rd.busy=true;
  if(R.raf){cancelAnimationFrame(R.raf);R.raf=0;}
  const btn=rd.panel.querySelector('.rdGo');if(btn){btn.disabled=true;btn.textContent='Calcul en cours…';}
  await new Promise(r=>setTimeout(r,30));
  let url=null;const t0=performance.now();
  try{
    R.r.setPixelRatio(1);R.r.setSize(W,H,false);
    rtSyncCam();R.pt.reset();
    let last=0;
    while(rtSamples()<N){
      if(rtGpuReady(R,80))rtSubmit(R,N);
      if(btn&&Math.floor(rtSamples())!==last){last=Math.floor(rtSamples());
        const el=(performance.now()-t0)/1000,rest=last>0?el*(N-last)/last:0;
        btn.textContent='Calcul : '+Math.round(100*last/N)+' %  ('+last+' / '+N+(last>2?' · reste '+Math.ceil(rest)+' s':'')+')';}
      await new Promise(r=>setTimeout(r,4));
      if(!rd||rd.rt!==R)return;
    }
    while(!rtGpuReady(R,80))await new Promise(r=>setTimeout(r,4)); // dernier lot calculé avant la copie
    // le fond (dégradé ou uni) est composé ici ; transparent : PNG détouré tel quel
    const out=document.createElement('canvas');out.width=W;out.height=H;const g=out.getContext('2d');
    if(st.fond!=='transparent'){
      if(st.fond==='degrade'){const lg=g.createLinearGradient(0,0,0,H);lg.addColorStop(0,st.fc1);lg.addColorStop(1,st.fc2);g.fillStyle=lg;}else g.fillStyle=st.fc1;
      g.fillRect(0,0,W,H);
    }
    g.drawImage(R.canvas,0,0);
    const blob=await new Promise(r=>out.toBlob(r,'image/png'));
    if(!blob)throw new Error('image vide');
    url=URL.createObjectURL(blob);
    const nm=String((typeof doc!=='undefined'&&doc&&doc.name)||'piece').replace(/[\\/:*?"<>|]+/g,'-');
    const a=document.createElement('a');a.href=url;a.download=nm+' - rendu '+W+'x'+H+' (rayons).png';document.body.appendChild(a);a.click();a.remove();
    rdMsg('Image '+W+'×'+H+' enregistrée : '+N+' échantillons en '+((performance.now()-t0)/1000).toFixed(1).replace('.',',')+' s ('+(blob.size/1048576).toFixed(1).replace('.',',')+' Mo).');
  }catch(e){rdMsg('Rendu impossible : '+(e&&e.message||e));}
  finally{
    if(rd){rd.busy=false;rdFitCanvas();if(btn){btn.disabled=false;btn.textContent='Rendre et enregistrer le PNG';}}
    if(url)setTimeout(()=>URL.revokeObjectURL(url),20000);
  }
}
