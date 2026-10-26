/* ---------- Simulation, moteur « cartes » : taille sur la carte graphique (V0.9.0) ----------
   « Il faut juste faire en sorte que ces 2 modes utilisent complètement le GPU. » Le rendu des
   cartes était déjà sur la carte graphique (colonnes instanciées, lancer de rayons), la TAILLE
   restait en JavaScript. Ici chaque carte (celle du posage, une par orientation 3+2) est une cible
   de rendu à trois textures écrites ensemble — hauteur (R32F), normale de l'outil (RGBA32F),
   direction radiale (RG32F) — plus une PROFONDEUR : la hauteur normalisée. Un pas d'outil est une
   instance (son rectangle dans la carte) ; le fragment calcule la cote de coupe de sa colonne
   (dessous de l'outil au rayon ρ : fond, arrondi, pointe) et l'écrit comme profondeur : le test
   de profondeur garde la plus basse, avec SA normale et SA direction radiale (ce que faisait
   faoMatterCarveSeg). Les textures sont lues telles quelles par les rendus existants.
   Hors WebGL2 ou sans cibles flottantes : la taille en JavaScript (src/88-fao-70). */
function faoCarteGOn(){
  try{return typeof renderer!=='undefined'&&renderer&&renderer.capabilities&&renderer.capabilities.isWebGL2&&
    !!renderer.extensions.get('EXT_color_buffer_float')&&typeof THREE.WebGLMultipleRenderTargets==='function';}catch(e){return false;}
}
const FAO_CGC_VS=[
  'in vec4 iSeg; in vec4 iZ;', // (ax, ay, bx, by) dans la carte ; (cote de pointe, rayon, ligne de l'outil, 0)
  'uniform vec4 uG; uniform vec2 uN;', // ox, oy, pas, fond ; nx, ny
  'flat out vec4 vSeg; flat out vec4 vZ;',
  'void main(){ vSeg=iSeg; vZ=iZ; float r=iZ.y;',
  '  vec2 mn=min(iSeg.xy,iSeg.zw)-r; vec2 mx=max(iSeg.xy,iSeg.zw)+r;',
  '  vec2 g0=floor((mn-uG.xy)/uG.z); vec2 g1=floor((mx-uG.xy)/uG.z)+1.0;',
  '  vec2 g=mix(g0,g1,position.xy); gl_Position=vec4(clamp(g/uN,0.0,1.0)*2.0-1.0,0.0,1.0);',
  '}'].join('\n');
const FAO_CGC_FS=[
  'precision highp sampler2D;',
  'layout(location=0) out highp vec4 oH; layout(location=1) out highp vec4 oN; layout(location=2) out highp vec4 oW;',
  'uniform sampler2D uTab; uniform vec4 uG; uniform vec2 uZr;', // uG.w : fond de la carte ; uZr : cote basse, étendue (profondeur)
  'flat in vec4 vSeg; flat in vec4 vZ;',
  'float hs(int row,int i){ return texelFetch(uTab,ivec2(i,row),0).r; }',
  'void main(){',
  '  vec2 c=floor(gl_FragCoord.xy); vec2 P=uG.xy+(c+0.5)*uG.z;',
  '  vec2 a=vSeg.xy; vec2 d=vSeg.zw-a; float L2=dot(d,d); float t=(L2>0.0)?clamp(dot(P-a,d)/L2,0.0,1.0):0.0;',
  '  vec2 q=a+d*t; vec2 w=P-q; float rho=length(w); float r=vZ.y;',
  '  if(rho>r)discard;',
  '  int row=int(vZ.z+0.5); float f=(1.0-sqrt(max(0.0,1.0-rho/r)))*48.0; int i=min(47,int(floor(f))); float u=f-float(i);',
  '  float h0=hs(row,i); float h1=hs(row,i+1); float zcol=max(uG.w,vZ.x+mix(h0,h1,u));',
  '  float q0=1.0-float(i)/48.0; float q1=1.0-float(i+1)/48.0; float s=(h1-h0)/max(1e-9,r*(q0*q0-q1*q1));', // pente sur l'intervalle de la table
  '  vec2 ux=(rho>1e-9)?w/rho:vec2(0.0);',
  '  vec3 n=normalize(vec3(-s*ux,1.0));', // normale de la surface de l'outil (vers le vide)
  '  gl_FragDepth=clamp((zcol-uZr.x)/uZr.y,0.0,1.0);',
  '  oH=vec4(zcol,0.0,0.0,1.0); oN=vec4(n,0.0); oW=vec4((rho>1e-9)?-ux:vec2(0.0),0.0,1.0);',
  '}'].join('\n');
function faoCarteGTex(arr,nx,ny,fmt){
  const t=new THREE.DataTexture(arr,nx,ny,fmt,THREE.FloatType);
  t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.flipY=false;t.unpackAlignment=1;t.needsUpdate=true;return t;
}
function faoCarteGInit(vw,g){
  // une cible par carte, remplie depuis l'état de départ (brut, cylindre, corps), puis rebranchée
  const maps=[g].concat((g.maps&&g.maps.list)||[]);
  const quad=new THREE.BufferGeometry();quad.setAttribute('position',new THREE.BufferAttribute(new Float32Array([0,0,0,1,0,0,1,1,0,0,0,0,1,1,0,0,1,0]),3));
  const cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const C={maps:[],quad,cam,scene:new THREE.Scene(),tools:new Map(),hsT:null,tabDirty:true,rows:[],mat:null,geo:null,mesh:null};
  // copie de départ : profondeur = hauteur normalisée, toujours écrite
  const cpMat=new THREE.ShaderMaterial({glslVersion:THREE.GLSL3,depthTest:true,depthWrite:true,depthFunc:THREE.AlwaysDepth,
    uniforms:{sH:{value:null},sN:{value:null},sW:{value:null},uZr:{value:new THREE.Vector2()}},
    vertexShader:'void main(){ gl_Position=vec4(position.xy*2.0-1.0,0.0,1.0); }',
    fragmentShader:['precision highp sampler2D;','layout(location=0) out highp vec4 oH; layout(location=1) out highp vec4 oN; layout(location=2) out highp vec4 oW;',
      'uniform sampler2D sH; uniform sampler2D sN; uniform sampler2D sW; uniform vec2 uZr;',
      'void main(){ ivec2 c=ivec2(gl_FragCoord.xy); float h=texelFetch(sH,c,0).r;',
      '  gl_FragDepth=clamp((h-uZr.x)/uZr.y,0.0,1.0); oH=vec4(h,0.0,0.0,1.0); oN=texelFetch(sN,c,0); oW=vec4(texelFetch(sW,c,0).rg,0.0,1.0); }'].join('\n')});
  const cs=new THREE.Scene(),cm=new THREE.Mesh(quad,cpMat);cm.frustumCulled=false;cs.add(cm);
  const ac=renderer.autoClear,prev=renderer.getRenderTarget();renderer.autoClear=false;
  try{
    maps.forEach((m,i)=>{
      const rt=new THREE.WebGLMultipleRenderTargets(m.nx,m.ny,3);
      rt.depthBuffer=true;
      [[THREE.RedFormat],[THREE.RGBAFormat],[THREE.RGFormat]].forEach((f,k)=>{const t=rt.texture[k];t.format=f[0];t.type=THREE.FloatType;
        t.minFilter=THREE.NearestFilter;t.magFilter=THREE.NearestFilter;t.generateMipmaps=false;});
      const zlo=m.oz-1,zr=Math.max(1,(m.full!=null?m.full:m.sz1)-m.oz+2);
      const sH=faoCarteGTex(m.h,m.nx,m.ny,THREE.RedFormat),sN=faoCarteGTex(m.nrm,m.nx,m.ny,THREE.RGBAFormat),sW=faoCarteGTex(m.wn,m.nx,m.ny,THREE.RGFormat);
      cpMat.uniforms.sH.value=sH;cpMat.uniforms.sN.value=sN;cpMat.uniforms.sW.value=sW;cpMat.uniforms.uZr.value.set(zlo,zr);cpMat.uniformsNeedUpdate=true;
      renderer.setRenderTarget(rt);renderer.clear(true,true,false);renderer.render(cs,cam);
      sH.dispose();sN.dispose();sW.dispose();
      C.maps.push({m,rt,zlo,zr,key:i?m.key:null,q:[]});
    });
  }finally{renderer.setRenderTarget(prev);renderer.autoClear=ac;}
  cpMat.dispose();
  C.mat=new THREE.ShaderMaterial({glslVersion:THREE.GLSL3,vertexShader:FAO_CGC_VS,fragmentShader:FAO_CGC_FS,depthTest:true,depthWrite:true,depthFunc:THREE.LessDepth,
    uniforms:{uTab:{value:null},uG:{value:new THREE.Vector4()},uN:{value:new THREE.Vector2()},uZr:{value:new THREE.Vector2()}}});
  vw.cg=C;
  faoCarteGBind(vw);
  return C;
}
function faoCarteGBind(vw){
  // les rendus existants lisent les textures de la carte graphique
  const C=vw.cg;if(!C)return;
  if(vw.rm&&typeof faoRmU!=='undefined'&&faoRmU){C.maps.forEach((M,i)=>{faoRmU['rmH'+i].value=M.rt.texture[0];faoRmU['rmN'+i].value=M.rt.texture[1];faoRmU['rmW'+i].value=M.rt.texture[2];});
    for(let i=C.maps.length;i<FAO_RM_MAX;i++){faoRmU['rmH'+i].value=C.maps[0].rt.texture[0];faoRmU['rmN'+i].value=C.maps[0].rt.texture[1];faoRmU['rmW'+i].value=C.maps[0].rt.texture[2];}}
  if(vw.gpu&&typeof faoGpuU!=='undefined'&&faoGpuU){const M=C.maps[0];faoGpuU.faoH.value=M.rt.texture[0];faoGpuU.faoN.value=M.rt.texture[1];faoGpuU.faoW.value=M.rt.texture[2];}
}
function faoCarteGTool(C,r,cr,tp){
  const T=faoEngTool(r,cr,tp);let row=C.tools.get(T.key);if(row!=null)return row;
  row=C.rows.length;C.rows.push(faoCarteGProfil(r,cr,tp));C.tools.set(T.key,row);C.tabDirty=true;return row;
}
function faoCarteGProfil(r,cr,tp){
  // Dessous de l'outil sur 49 points RESSERRÉS vers le bord : ρ_i = r·(1 − (1 − i/48)²). Au bord
  // d'une boule (ou de l'arrondi d'un tore) la pente devient verticale, h ≈ √(r − ρ) : la table
  // régulière de faoEngTool, interpolée linéairement, y surestimait la hauteur de ~0,2 mm (R4) et
  // la taille GPU laissait de la matière que la taille JavaScript (arc exact) enlevait.
  // En u = 1 − √(1 − ρ/r), le profil redevient lisse (tests/browser/gpu.spec.cjs).
  r=+r||5;
  const CR=(isFinite(+cr)&&+cr>0)?Math.min(+cr,r):0,TP=(tp&&tp.length>1)?tp:null,rc=r-CR,hs=new Float64Array(49);
  for(let i=0;i<=48;i++){const q=1-i/48,rho=r*(1-q*q);let h=0;
    if(TP)h=faoTipZAt(TP,rho);else if(CR>0&&rho>rc){const e=Math.min(rho-rc,CR);h=CR-Math.sqrt(Math.max(0,CR*CR-e*e));}
    hs[i]=i?Math.max(hs[i-1],h):h;}
  return {hs};
}
function faoCarteGQueue(vw,a,b,r,cr,tp,ax){
  // segment → pas à cote constante dans la carte de son orientation (même découpe que faoMatterCarveSeg)
  const C=vw.cg;let M=C.maps[0],A=a,B=b;
  if(ax&&!faoEngIsVertAx(ax)){const key=faoMapKey(ax);M=C.maps.find(x=>x.key===key);if(!M)return;
    const m=M.m,to=p=>({x:p.x*m.U[0]+p.y*m.U[1]+p.z*m.U[2],y:p.x*m.V[0]+p.y*m.V[1]+p.z*m.V[2],z:p.x*m.A[0]+p.y*m.A[1]+p.z*m.A[2]});A=to(a);B=to(b);}
  const row=faoCarteGTool(C,r,cr,tp),dz=Math.abs(B.z-A.z),n=dz>FAO_CARVE_DZ?Math.min(400,Math.ceil(dz/FAO_CARVE_DZ)):1,q=M.q;
  for(let s=0;s<n;s++){const t0=s/n,t1=(s+1)/n;
    q.push(A.x+(B.x-A.x)*t0,A.y+(B.y-A.y)*t0,A.x+(B.x-A.x)*t1,A.y+(B.y-A.y)*t1,Math.min(A.z+(B.z-A.z)*t0,A.z+(B.z-A.z)*t1),r,row,0);}
}
function faoEngIsVertAx(ax){const L=Math.hypot(ax[0],ax[1],ax[2])||1;return ax[2]/L>0.99999;}
function faoCarteGFlush(vw){
  // pas en attente → un dessin instancié par carte (test de profondeur : la coupe la plus basse gagne)
  const C=vw.cg;if(!C)return 0;let tot=0;
  if(C.tabDirty){
    const W=49,H=Math.max(1,C.rows.length),d=new Float32Array(W*H);C.rows.forEach((T,i)=>{for(let k=0;k<=48;k++)d[i*W+k]=T.hs[k];});
    if(C.hsT)C.hsT.dispose();C.hsT=faoCarteGTex(d,W,H,THREE.RedFormat);C.mat.uniforms.uTab.value=C.hsT;C.tabDirty=false;
  }
  const ac=renderer.autoClear,prev=renderer.getRenderTarget();renderer.autoClear=false;
  try{
    C.maps.forEach(M=>{
      const q=M.q,cnt=q.length/8;if(!cnt)return;tot+=cnt;
      const seg=new Float32Array(cnt*4),zz=new Float32Array(cnt*4);
      for(let i=0;i<cnt;i++){for(let j=0;j<4;j++){seg[i*4+j]=q[i*8+j];zz[i*4+j]=q[i*8+4+j];}}
      q.length=0;
      const geo=new THREE.InstancedBufferGeometry();geo.setAttribute('position',C.quad.getAttribute('position'));
      geo.setAttribute('iSeg',new THREE.InstancedBufferAttribute(seg,4));geo.setAttribute('iZ',new THREE.InstancedBufferAttribute(zz,4));geo.instanceCount=cnt;
      if(C.mesh){C.scene.remove(C.mesh);try{C.geo.dispose();}catch(e){}}
      const mesh=new THREE.Mesh(geo,C.mat);mesh.frustumCulled=false;C.scene.add(mesh);C.mesh=mesh;C.geo=geo;
      const m=M.m,U=C.mat.uniforms;U.uG.value.set(m.ox,m.oy,m.pas,m.oz);U.uN.value.set(m.nx,m.ny);U.uZr.value.set(M.zlo,M.zr);C.mat.uniformsNeedUpdate=true;
      renderer.setRenderTarget(M.rt);renderer.render(C.scene,C.cam);
    });
  }finally{renderer.setRenderTarget(prev);renderer.autoClear=ac;}
  return tot;
}
function faoCarteGCatch(vw){
  // rattrapage 0 → t : tous les segments joués, une passe par carte
  faoEngSegments(vw,null,(a,b,r,cr,tp,ax)=>faoCarteGQueue(vw,a,b,r,cr,tp,ax));
  return faoCarteGFlush(vw);
}
function faoCarteGStep(vw,p){
  const mi=(vw.mPos&&isFinite(+vw.mPos.i))?Math.round(+vw.mPos.i):-1;
  const cut=(a,b,r,cr,tp,ax)=>faoCarteGQueue(vw,a,b,r,cr,tp,ax);
  if(mi>=0&&mi<=p.i)faoEngSegments(vw,{i:mi,x:vw.mPos.x,y:vw.mPos.y,z:vw.mPos.z,p},cut);
  else if(mi<0)faoEngSegments(vw,null,cut);
  vw.mPos={x:p.x,y:p.y,z:p.z,i:p.i};
  faoCarteGFlush(vw);
}
function faoCarteGDispose(vw){
  const C=vw&&vw.cg;if(!C)return;
  try{C.maps.forEach(M=>M.rt.dispose());C.mat.dispose();C.quad.dispose();if(C.geo)C.geo.dispose();if(C.hsT)C.hsT.dispose();}catch(e){}
  vw.cg=null;
}
