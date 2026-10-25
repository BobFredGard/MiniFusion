/* ---------- Simulation : rendu de la matière sur la carte graphique (V0.7.7) ----------
   Le rendu « réel » écrivait 30 sommets par colonne dans un grand tableau (1,5 M de sommets à
   0,4 mm) : la finesse de la maille était bornée par cette mémoire et ses réécritures. Ici la
   colonne est une INSTANCE (30 sommets fixes, un dessin instancié de nx × ny colonnes) ; les
   hauteurs (g.h), les normales de l'outil (g.nrm) et les directions radiales (g.wn) sont des
   TEXTURES flottantes lues dans le vertex shader (texelFetch), qui recalcule la géométrie de la
   colonne comme faoViewerMatterWriteCol — parois repliées vers une voisine plus haute, colonnes
   creusées (3+2) repliées. Après une taille, seules les textures sont renvoyées. La maille XY peut
   alors être deux fois plus fine (faoMatterFine) pour le même coût d'affichage.
   Repli : sans WebGL2, l'ancien tableau de sommets (src/88-fao-70-simulation.js). */
function faoMatterGpuSupported(){
  try{ return !!(typeof renderer!=='undefined'&&renderer&&renderer.capabilities&&renderer.capabilities.isWebGL2&&typeof THREE!=='undefined'&&THREE.InstancedBufferGeometry&&THREE.DataTexture); }
  catch(e){ return false; }
}
function faoMatterFine(){ return faoMatterGpuSupported(); } // maille XY ÷ 2, budget de colonnes × 4
const FAO_GPU_VS=[
  'uniform sampler2D faoH; uniform sampler2D faoN; uniform sampler2D faoW;',
  'uniform vec4 faoG; uniform vec2 faoS; uniform ivec2 faoNX;', // ox, oy, pas, oz ; sx1, sy1 ; nx, ny
  'attribute float faoQ;',
  'vec3 gP; vec3 gN;',
  'float faoHat(int ix,int iy){ return texelFetch(faoH, ivec2(ix,iy), 0).r; }',
  'void faoCell(){',
  '  int c=gl_InstanceID; int nx=faoNX.x; int ny=faoNX.y; int iy=c/nx; int ix=c-iy*nx;',
  '  float x0=faoG.x+float(ix)*faoG.z; float x1=min(x0+faoG.z, faoS.x);',
  '  float y0=faoG.y+float(iy)*faoG.z; float y1=min(y0+faoG.z, faoS.y);',
  '  float zt=faoHat(ix,iy); float oz=faoG.w;',
  '  vec4 N=texelFetch(faoN, ivec2(ix,iy), 0); bool cv=N.a>0.5;',
  '  int q=int(faoQ+0.5); int f=q/6; int k=q-f*6;',
  '  int ci=(k==0||k==3)?0:(k==1?1:((k==2||k==4)?2:3));', // 2 triangles du quad : 0,1,2 / 0,2,3
  '  vec3 p; vec3 n;',
  '  if(f==0){', // dessus : sens direct vu de dessus
  '    vec2 xy=(ci==0)?vec2(x0,y0):((ci==1)?vec2(x1,y0):((ci==2)?vec2(x1,y1):vec2(x0,y1)));',
  '    p=vec3(xy,zt); n=N.xyz;',
  '  }else{',
  '    int dx=0; int dy=0; vec3 fn;',
  '    if(f==1){dy=-1;fn=vec3(0.0,-1.0,0.0);}else if(f==2){dy=1;fn=vec3(0.0,1.0,0.0);}else if(f==3){dx=-1;fn=vec3(-1.0,0.0,0.0);}else{dx=1;fn=vec3(1.0,0.0,0.0);}',
  '    int jx=ix+dx; int jy=iy+dy; bool inb=(jx>=0&&jy>=0&&jx<nx&&jy<ny);',
  '    float zn=inb?faoHat(jx,jy):oz; float z2=cv?zt:((zn<zt)?zn:zt);', // paroi vers une voisine plus basse ; sinon repliée
  '    float a0; float a1;', // sens direct vu depuis fn : -Y x0→x1 ; +Y x1→x0 ; -X y1→y0 ; +X y0→y1
  '    if(f==1){a0=x0;a1=x1;}else if(f==2){a0=x1;a1=x0;}else if(f==3){a0=y1;a1=y0;}else{a0=y0;a1=y1;}',
  '    float a=(ci==0||ci==3)?a0:a1; float z=(ci<2)?z2:zt;',
  '    if(f<=2)p=vec3(a,(f==1)?y0:y1,z); else p=vec3((f==3)?x0:x1,a,z);',
  '    n=fn;',
  '    if(inb){ vec4 Wn=texelFetch(faoW, ivec2(jx,jy), 0); if(dot(Wn.xy,Wn.xy)>0.5&&dot(Wn.xy,fn.xy)>0.2)n=vec3(Wn.xy,0.0); }',
  '  }',
  '  gP=p; gN=n;',
  '}'
].join('\n');
let faoGpuMat=null, faoGpuU=null; // matériau unique (programme compilé une fois), uniforms partagés
function faoMatterGpuMat(){
  if(faoGpuMat)return faoGpuMat;
  faoGpuU={faoH:{value:null},faoN:{value:null},faoW:{value:null},
    faoG:{value:new THREE.Vector4()},faoS:{value:new THREE.Vector2()},faoNX:{value:new THREE.Vector2()}};
  const U=faoGpuU;
  const mat=faoMatterStyle(new THREE.MeshPhongMaterial({color:0x9c846a,side:THREE.FrontSide}));
  mat.onBeforeCompile=function(sh){
    Object.assign(sh.uniforms,U);
    sh.vertexShader=FAO_GPU_VS+'\n'+sh.vertexShader
      .replace('#include <beginnormal_vertex>','faoCell();\n vec3 objectNormal = gN;')
      .replace('#include <begin_vertex>','vec3 transformed = gP;');
  };
  mat.customProgramCacheKey=function(){return 'faoMatterGpu';};
  faoGpuMat=mat;return mat;
}
function faoMatterGpuBuild(vw,g){
  // Maillage instancié + textures (partagent les tableaux de la grille : aucune copie).
  const nc=g.nx*g.ny;
  const geo=new THREE.InstancedBufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(30*3),3));
  const q=new Float32Array(30);for(let i=0;i<30;i++)q[i]=i;
  geo.setAttribute('faoQ',new THREE.BufferAttribute(q,1));
  geo.instanceCount=nc;
  const tex=function(data,fmt){const t=new THREE.DataTexture(data,g.nx,g.ny,fmt,THREE.FloatType);
    t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.flipY=false;t.unpackAlignment=1;t.needsUpdate=true;return t;};
  const hTex=tex(g.h,THREE.RedFormat),nTex=tex(g.nrm,THREE.RGBAFormat),wTex=tex(g.wn,THREE.RGFormat);
  const sx1=(g.sx1!=null)?g.sx1:g.ox+g.nx*g.pas,sy1=(g.sy1!=null)?g.sy1:g.oy+g.ny*g.pas;
  const mat=faoMatterGpuMat(),U=faoGpuU;
  U.faoH.value=hTex;U.faoN.value=nTex;U.faoW.value=wTex;
  U.faoG.value.set(g.ox,g.oy,g.pas,g.oz);U.faoS.value.set(sx1,sy1);U.faoNX.value.set(g.nx,g.ny);
  const mesh=new THREE.Mesh(geo,mat);
  mesh.name='faoMatter';mesh.raycast=function(){};mesh.frustumCulled=false;
  // fond plein du brut (statique), tourné vers le bas
  try{
    const bg=new THREE.PlaneGeometry(sx1-g.ox,sy1-g.oy);bg.rotateX(Math.PI);
    const bm=new THREE.Mesh(bg,faoMatterStyle(new THREE.MeshPhongMaterial({color:0x9c846a,side:THREE.FrontSide})));
    bm.position.set((g.ox+sx1)/2,(g.oy+sy1)/2,g.oz);bm.raycast=function(){};bm.frustumCulled=false;bm.name='faoMatterFond';
    mesh.add(bm);
  }catch(e){}
  vw.gpu={hTex:hTex,nTex:nTex,wTex:wTex,geo:geo,mat:mat,mesh:mesh};
  return mesh;
}
function faoMatterGpuUpdate(vw){
  // Après une taille : les tableaux de la grille ont changé, les textures sont renvoyées.
  const G=vw&&vw.gpu;if(!G)return;
  G.hTex.needsUpdate=true;G.nTex.needsUpdate=true;G.wTex.needsUpdate=true;
}
function faoMatterGpuDispose(vw){
  const G=vw&&vw.gpu;if(!G)return;
  try{ G.hTex.dispose();G.nTex.dispose();G.wTex.dispose(); }catch(e){}
  try{ G.geo.dispose(); }catch(e){} // le matériau reste (programme compilé une fois)
  try{ G.mesh.children.forEach(function(ch){ if(ch.geometry)ch.geometry.dispose(); if(ch.material)ch.material.dispose(); }); }catch(e){}
  vw.gpu=null;
}
