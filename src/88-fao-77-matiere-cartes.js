/* ---------- Simulation : une carte de hauteurs par orientation d'outil, rendu par lancer de rayons (V0.7.8) ----------
   Palier 2 de la qualité de simulation. Un posage avec des opérations 3+2 avait ses cavités latérales
   taillées dans des voxels (src/88-fao-75) : marches de la taille de la couche, complément reconstruit.
   Ici chaque orientation d'outil rencontrée dans le parcours (le Z du posage, puis le Z de chaque
   opération au repère propre) a SA carte de hauteurs, dans son propre repère (U, V, A) : l'opération y
   taille exactement comme une opération verticale — faoMatterCarveSeg, même pointe de foret, même
   arrondi, mêmes normales et directions radiales. La matière est l'INTERSECTION des cartes : un point
   est dans la matière s'il est sous la hauteur de CHAQUE carte (et dans la boîte du brut).
   Le rendu est un lancer de rayons dans un shader (boîte du brut dessinée en faces arrière) : marche
   adaptative, bissection, profondeur écrite (gl_FragDepth) — l'outil et le reste de la scène s'y
   intersectent normalement. La carte active au point touché donne la normale : celle de l'outil sur
   un dessus, la direction radiale de la colonne basse sur une paroi. Rendu « lisse » : hauteurs
   interpolées bilinéairement (plus de surface moyennée à part).
   Au plus FAO_RM_MAX cartes (échantillonneurs du shader) : la carte du posage + 3 orientations. */
const FAO_RM_MAX=4;
function faoMapsAxes(pts){
  // orientations distinctes (axe outil, repère posage) des points inclinés du parcours
  const out=[],seen=new Set();
  (pts||[]).forEach(function(p){const a=p&&p.ax;if(!a)return;
    const k=a.map(function(v){return Math.round(v*1000)/1000;}).join(',');if(seen.has(k))return;seen.add(k);out.push(a.slice());});
  return out;
}
function faoMapKey(a){return a.map(function(v){return Math.round(v*1000)/1000;}).join(',');}
function faoMapFrame(A){
  const L=Math.hypot(A[0],A[1],A[2])||1;A=[A[0]/L,A[1]/L,A[2]/L];
  const ref=Math.abs(A[2])<0.9?[0,0,1]:[1,0,0];
  let U=[A[1]*ref[2]-A[2]*ref[1],A[2]*ref[0]-A[0]*ref[2],A[0]*ref[1]-A[1]*ref[0]];
  const lu=Math.hypot(U[0],U[1],U[2])||1;U=[U[0]/lu,U[1]/lu,U[2]/lu];
  const V=[A[1]*U[2]-A[2]*U[1],A[2]*U[0]-A[0]*U[2],A[0]*U[1]-A[1]*U[0]];
  return {A:A,U:U,V:V};
}
function faoMapCreate(g,A){
  // carte d'une orientation : couvre la boîte du brut projetée sur (U, V) ; hauteur initiale = le
  // bord de la boîte le plus loin le long de A (la boîte borne le rendu de toute façon)
  const F=faoMapFrame(A);
  const sx1=(g.sx1!=null)?g.sx1:g.ox+g.nx*g.pas,sy1=(g.sy1!=null)?g.sy1:g.oy+g.ny*g.pas;
  const zT=(g.full!=null)?g.full:g.oz+g.nz*(g.pz||g.pas);
  let u0=1/0,u1=-1/0,v0=1/0,v1=-1/0,w0=1/0,w1=-1/0;
  [g.ox,sx1].forEach(function(x){[g.oy,sy1].forEach(function(y){[g.oz,zT].forEach(function(z){
    const u=x*F.U[0]+y*F.U[1]+z*F.U[2],v=x*F.V[0]+y*F.V[1]+z*F.V[2],w=x*F.A[0]+y*F.A[1]+z*F.A[2];
    if(u<u0)u0=u;if(u>u1)u1=u;if(v<v0)v0=v;if(v>v1)v1=v;if(w<w0)w0=w;if(w>w1)w1=w;});});});
  const pas=g.pas,nx=Math.max(1,Math.ceil((u1-u0)/pas)),ny=Math.max(1,Math.ceil((v1-v0)/pas)),nc=nx*ny;
  const alive=new Uint8Array(nc);for(let i=0;i<nc;i++)alive[i]=1;
  const h=new Float32Array(nc);for(let i=0;i<nc;i++)h[i]=w1;
  const nrm=new Float32Array(nc*4);for(let i=0;i<nc;i++)nrm[i*4+2]=1;
  return {pas:pas,pz:pas,nx:nx,ny:ny,nz:1,n:nc,ox:u0,oy:v0,oz:w0,alive:alive,h:h,nrm:nrm,wn:new Float32Array(nc*2),
          sx1:u1,sy1:v1,sz1:w1,full:w1,A:F.A,U:F.U,V:F.V,key:faoMapKey(A),dirty:true};
}
function faoMapsInit(g,axes){
  // cartes des orientations inclinées, rattachées à la grille du posage (g.maps)
  const list=[],byKey={};
  (axes||[]).slice(0,FAO_RM_MAX-1).forEach(function(A){const m=faoMapCreate(g,A);list.push(m);byKey[m.key]=m;});
  g.maps={list:list,byKey:byKey};
  return g.maps;
}
function faoMapsDirty(g){const M=g&&g.maps;if(!M)return false;for(let i=0;i<M.list.length;i++)if(M.list[i].dirty)return true;return false;}
function faoMatterCarveAx(g,a,b,r,ax,outCols,cr,tp){
  // taille d'un segment d'outil INCLINÉ dans la carte de son orientation : les points passent dans le
  // repère de la carte (u, v, w), l'outil y est vertical → faoMatterCarveSeg tel quel
  const M=g.maps,key=faoMapKey(ax),m=M&&M.byKey[key];
  if(!m)return [];
  const to=function(p){return [p.x*m.U[0]+p.y*m.U[1]+p.z*m.U[2],p.x*m.V[0]+p.y*m.V[1]+p.z*m.V[2],p.x*m.A[0]+p.y*m.A[1]+p.z*m.A[2]];};
  const A=to(a),B=to(b),cols=[];
  faoMatterCarveSeg(m,A[0],A[1],A[2],B[0],B[1],B[2],r,cols,cr,tp);
  if(cols.length)m.dirty=true;
  return [];
}
/* ---------- rendu ---------- */
function faoMatterRmSupported(){ return (typeof faoMatterGpuSupported==='function')&&faoMatterGpuSupported(); }
const FAO_RM_FS=[
  'uniform sampler2D rmH0; uniform sampler2D rmH1; uniform sampler2D rmH2; uniform sampler2D rmH3;',
  'uniform sampler2D rmN0; uniform sampler2D rmN1; uniform sampler2D rmN2; uniform sampler2D rmN3;',
  'uniform sampler2D rmW0; uniform sampler2D rmW1; uniform sampler2D rmW2; uniform sampler2D rmW3;',
  'uniform vec3 rmU[4]; uniform vec3 rmV[4]; uniform vec3 rmA[4]; uniform vec4 rmP[4]; uniform vec2 rmNxy[4];', // rmP : ou, ov, pas, w0
  'uniform int rmCount; uniform vec3 rmMin; uniform vec3 rmMax; uniform float rmSmooth; uniform int rmDebug;',
  'uniform mat4 rmInvModel; uniform mat4 rmModelView; uniform mat4 rmProj; uniform mat3 rmNormalMat;',
  'varying vec3 vRmPos;',
  'vec3 rmN; vec4 rmPv; float rmDepth; vec3 rmDbg; float rmIt; float rmTop; vec3 rmWdbg;',
  'float rmHf(int i, ivec2 c){ if(i==0)return texelFetch(rmH0,c,0).r; if(i==1)return texelFetch(rmH1,c,0).r; if(i==2)return texelFetch(rmH2,c,0).r; return texelFetch(rmH3,c,0).r; }',
  'vec4 rmNf(int i, ivec2 c){ if(i==0)return texelFetch(rmN0,c,0); if(i==1)return texelFetch(rmN1,c,0); if(i==2)return texelFetch(rmN2,c,0); return texelFetch(rmN3,c,0); }',
  'vec2 rmWf(int i, ivec2 c){ if(i==0)return texelFetch(rmW0,c,0).rg; if(i==1)return texelFetch(rmW1,c,0).rg; if(i==2)return texelFetch(rmW2,c,0).rg; return texelFetch(rmW3,c,0).rg; }',
  'ivec2 rmCell(int i, vec2 uv){ return ivec2(clamp(floor(uv), vec2(0.0), rmNxy[i]-1.0)); }',
  'float rmH(int i, vec2 uv){ return rmHf(i,rmCell(i,uv)); }', // uv en cellules — hauteur du texel (exacte)
  'vec3 rmNsmooth(int i, vec2 uv, float hc, float pas){', // « lisse » : normale interpolée entre les 4 texels voisins de hauteur proche
  '  vec2 f=uv-0.5; vec2 fl=floor(f); vec2 t=f-fl; vec2 n1=rmNxy[i]-1.0;',
  '  ivec2 c0=ivec2(clamp(fl,vec2(0.0),n1)); ivec2 c1=ivec2(clamp(fl+1.0,vec2(0.0),n1));',
  '  vec3 acc=vec3(0.0); float wsum=0.0;',
  '  for(int k=0;k<4;k++){ ivec2 c=(k==0)?c0:((k==1)?ivec2(c1.x,c0.y):((k==2)?ivec2(c0.x,c1.y):c1));',
  '    float w=((k==0)?(1.0-t.x)*(1.0-t.y):((k==1)?t.x*(1.0-t.y):((k==2)?(1.0-t.x)*t.y:t.x*t.y)));',
  '    if(abs(rmHf(i,c)-hc)<=1.5*pas){ acc+=w*rmNf(i,c).xyz; wsum+=w; } }',
  '  return (wsum>1e-6)?normalize(acc/wsum):vec3(0.0,0.0,1.0);',
  '}',
  'vec2 rmUV(int i, vec3 p){ return vec2((dot(p,rmU[i])-rmP[i].x)/rmP[i].z,(dot(p,rmV[i])-rmP[i].y)/rmP[i].z); }',
  'float rmMargin(int i, vec3 p){ return dot(p,rmA[i])-rmH(i,rmUV(i,p)); }', // > 0 : hors matière pour cette carte
  'bool rmInside(vec3 p, out int act, out float best){ act=0; best=-1e9;',
  '  for(int i=0;i<4;i++){ if(i>=rmCount)break; float m=rmMargin(i,p); if(m>best){best=m;act=i;} }',
  '  return best<=0.0; }',
  'void rmMarch(){',
  '  vec3 ro=(rmInvModel*vec4(cameraPosition,1.0)).xyz; vec3 rd=normalize(vRmPos-ro);',
  '  vec3 ird=1.0/rd; vec3 t0=(rmMin-ro)*ird; vec3 t1=(rmMax-ro)*ird; vec3 tmn=min(t0,t1); vec3 tmx=max(t0,t1);',
  '  float tIn=max(max(tmn.x,tmn.y),tmn.z); float tOut=min(min(tmx.x,tmx.y),tmx.z);',
  '  float tStart=max(tIn,0.0); if(tOut<=tStart)discard;',
  '  float pas=rmP[0].z; float t=tStart+1e-4; float tPrev=t; bool hit=false; int act=0; int first=1;',
  '  rmIt=0.0; rmTop=0.0; rmWdbg=vec3(0.5,0.5,0.0);',
  '  for(int k=0;k<1400;k++){ if(t>tOut)break; vec3 p=ro+rd*t; float best; int a; rmIt+=1.0;',
  '    if(rmInside(p,a,best)){ hit=true; act=a; break; }',
  '    first=0; float st=max(pas*0.6, min(best*0.5, 3.0)); tPrev=t; t+=st; }',
  '  if(!hit)discard;',
  '  vec3 n; vec3 p;',
  '  if(first==1&&tIn>0.0){', // entré dans la matière par une face de la boîte du brut
  '    p=ro+rd*tStart;',
  '    if(tIn==tmn.x)n=vec3(-sign(rd.x),0.0,0.0); else if(tIn==tmn.y)n=vec3(0.0,-sign(rd.y),0.0); else n=vec3(0.0,0.0,-sign(rd.z));',
  '  }else{',
  '    float lo=tPrev; float hi=t;',
  '    for(int k=0;k<8;k++){ float m=0.5*(lo+hi); float b; int a; if(rmInside(ro+rd*m,a,b)){hi=m;act=a;} else lo=m; }',
  '    p=ro+rd*hi; vec3 pp=ro+rd*lo;',
  '    { int ac=-1; float bc=-1e9; for(int i=0;i<4;i++){ if(i>=rmCount)break; float mo=rmMargin(i,pp); if(mo>bc){bc=mo;ac=i;} } if(bc>0.0)act=ac; }', // carte franchie : la plus violée juste dehors (une paroi du posage près d'un trou latéral n'est pas la carte latérale)
  '    vec2 uv=rmUV(act,p); ivec2 c=rmCell(act,uv); float hc=rmHf(act,c); float w=dot(p,rmA[act]);',
  '    if(w>hc-1.5*pas){ rmTop=1.0; vec3 nl=(rmSmooth>0.5)?rmNsmooth(act,uv,hc,pas):rmNf(act,c).xyz; n=nl.x*rmU[act]+nl.y*rmV[act]+nl.z*rmA[act]; }', // dessus : normale de l'outil (lisse : interpolée)
  '    else{', // paroi : direction radiale de la colonne basse (celle d'où vient le rayon)
  '      ivec2 cq=rmCell(act,rmUV(act,pp)); vec2 wn=rmWf(act,cq); vec2 lat=vec2(dot(pp-p,rmU[act]),dot(pp-p,rmV[act]));',
  '      rmWdbg=vec3(wn*0.5+0.5,0.0);',
  '      if(!(dot(wn,wn)>0.5)){', // colonne sans direction : la plus basse des 4 voisines qui en a une
  '        float hb=1e9; for(int s=0;s<4;s++){ ivec2 d=(s==0)?ivec2(-1,0):((s==1)?ivec2(1,0):((s==2)?ivec2(0,-1):ivec2(0,1)));',
  '          ivec2 cn=ivec2(clamp(vec2(c+d),vec2(0.0),rmNxy[act]-1.0)); vec2 w2=rmWf(act,cn); float h2=rmHf(act,cn);',
  '          if(dot(w2,w2)>0.5&&h2<hc-0.5*pas&&h2<hb){hb=h2;wn=w2;} } }',
  '      if(dot(wn,wn)>0.5&&dot(wn,lat)>-0.2){ n=wn.x*rmU[act]+wn.y*rmV[act]; rmWdbg.z=0.25; }',
  '      else{', // gradient de la carte (paroi en escalier, mais toujours tournée vers le vide)
  '        float hx=rmHf(act,ivec2(clamp(vec2(c)+vec2(1.0,0.0),vec2(0.0),rmNxy[act]-1.0)))-rmHf(act,ivec2(clamp(vec2(c)-vec2(1.0,0.0),vec2(0.0),rmNxy[act]-1.0)));',
  '        float hy=rmHf(act,ivec2(clamp(vec2(c)+vec2(0.0,1.0),vec2(0.0),rmNxy[act]-1.0)))-rmHf(act,ivec2(clamp(vec2(c)-vec2(0.0,1.0),vec2(0.0),rmNxy[act]-1.0)));',
  '        vec3 gN=-hx*rmU[act]-hy*rmV[act]+2.0*pas*rmA[act]; vec3 l3=lat.x*rmU[act]+lat.y*rmV[act];',
  '        n=(dot(gN,gN)>1e-12)?normalize(gN):((dot(l3,l3)>1e-12)?normalize(l3):rmA[act]); rmWdbg.z=1.0; }',
  '    }',
  '  }',
  '  rmN=normalize(rmNormalMat*normalize(n)); rmPv=rmModelView*vec4(p,1.0);',
  '  vec2 uvd=rmUV(act,p); ivec2 cd=rmCell(act,uvd); float hcd=rmHf(act,cd); float wd=dot(p,rmA[act]);',
  '  rmDbg=vec3(0.0); if(rmDebug==1)rmDbg=vec3(act==0?1.0:0.0,act==1?1.0:0.0,act==2?1.0:0.0); else if(rmDebug==2)rmDbg=normalize(n)*0.5+0.5; else if(rmDebug==3)rmDbg=vec3(fract(length(p-ro)/10.0)); else if(rmDebug==4)rmDbg=vec3(rmIt/200.0,rmTop,float(first)); else if(rmDebug==5)rmDbg=rmNf(act,cd).xyz*0.5+0.5; else if(rmDebug==6)rmDbg=vec3(clamp((hcd-wd)/(1.5*pas),0.0,1.0),clamp((wd-hcd)/(1.5*pas),0.0,1.0),0.0); else if(rmDebug==7)rmDbg=vec3(clamp(rmMargin(1,p)*0.1+0.5,0.0,1.0),clamp(rmMargin(2,p)*0.1+0.5,0.0,1.0),clamp(rmMargin(0,p)*0.1+0.5,0.0,1.0)); else if(rmDebug==9)rmDbg=rmWdbg; else if(rmDebug==8)rmDbg=vec3(clamp((rmH(1,rmUV(1,p))-rmHf(1,rmCell(1,rmUV(1,p))))*2.0+0.5,0.0,1.0),clamp((rmH(0,rmUV(0,p))-rmHf(0,rmCell(0,rmUV(0,p))))*2.0+0.5,0.0,1.0),0.0);',
  '  vec4 clip=rmProj*rmPv; rmDepth=(clip.z/clip.w)*0.5+0.5;',
  '  if(first==1&&tIn>0.0)rmDepth+=2e-6;', // face de la boîte du brut : coplanaire avec le fantôme du brut → léger recul (plus de dents de scie)
  '}'
].join('\n');
let faoRmMat=null, faoRmU=null;
function faoMatterRmMat(){
  if(faoRmMat)return faoRmMat;
  const U={};
  ['rmH0','rmH1','rmH2','rmH3','rmN0','rmN1','rmN2','rmN3','rmW0','rmW1','rmW2','rmW3'].forEach(function(k){U[k]={value:null};});
  const v3=function(){const a=[];for(let i=0;i<4;i++)a.push(new THREE.Vector3());return a;};
  U.rmU={value:v3()};U.rmV={value:v3()};U.rmA={value:v3()};
  U.rmP={value:[new THREE.Vector4(),new THREE.Vector4(),new THREE.Vector4(),new THREE.Vector4()]};
  U.rmNxy={value:[new THREE.Vector2(),new THREE.Vector2(),new THREE.Vector2(),new THREE.Vector2()]};
  U.rmCount={value:1};U.rmDebug={value:0};U.rmMin={value:new THREE.Vector3()};U.rmMax={value:new THREE.Vector3()};U.rmSmooth={value:0};
  U.rmInvModel={value:new THREE.Matrix4()};U.rmModelView={value:new THREE.Matrix4()};U.rmProj={value:new THREE.Matrix4()};U.rmNormalMat={value:new THREE.Matrix3()};
  faoRmU=U;
  const mat=faoMatterStyle(new THREE.MeshPhongMaterial({color:0x9c846a,side:THREE.BackSide}));
  mat.onBeforeCompile=function(sh){
    Object.assign(sh.uniforms,U);
    sh.vertexShader='varying vec3 vRmPos;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vRmPos = position;');
    sh.fragmentShader=FAO_RM_FS+'\n'+sh.fragmentShader
      .replace('#include <clipping_planes_fragment>','rmMarch();\n#include <clipping_planes_fragment>')
      .replace('#include <normal_fragment_begin>','vec3 normal = rmN;\n vec3 geometryNormal = normal;')
      .replace('#include <color_fragment>','#include <color_fragment>\n if(rmDebug>0){ diffuseColor.rgb = rmDbg; }')
      .replace('geometry.position = - vViewPosition;','geometry.position = rmPv.xyz;')
      .replace('normalize( vViewPosition );','normalize( -rmPv.xyz );')
      .replace('#include <dithering_fragment>','#include <dithering_fragment>\n gl_FragDepth = rmDepth;');
  };
  mat.customProgramCacheKey=function(){return 'faoMatterRm';};
  faoRmMat=mat;return mat;
}
function faoMatterRmTex(data,nx,ny,fmt){
  const t=new THREE.DataTexture(data,nx,ny,fmt,THREE.FloatType);
  t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.flipY=false;t.unpackAlignment=1;t.needsUpdate=true;return t;
}
function faoMatterRmBuild(vw,g,smooth){
  // boîte du brut (faces arrière) portant le shader ; cartes = la grille du posage + g.maps
  const maps=[g].concat((g.maps&&g.maps.list)||[]).slice(0,FAO_RM_MAX);
  const mat=faoMatterRmMat(),U=faoRmU;
  const texs=[];
  maps.forEach(function(m,i){
    const hT=faoMatterRmTex(m.h,m.nx,m.ny,THREE.RedFormat),nT=faoMatterRmTex(m.nrm,m.nx,m.ny,THREE.RGBAFormat),wT=faoMatterRmTex(m.wn,m.nx,m.ny,THREE.RGFormat);
    texs.push({map:m,h:hT,n:nT,w:wT});
    U['rmH'+i].value=hT;U['rmN'+i].value=nT;U['rmW'+i].value=wT;
    const Ux=m.U||[1,0,0],Vy=m.V||[0,1,0],Az=m.A||[0,0,1];
    U.rmU.value[i].set(Ux[0],Ux[1],Ux[2]);U.rmV.value[i].set(Vy[0],Vy[1],Vy[2]);U.rmA.value[i].set(Az[0],Az[1],Az[2]);
    U.rmP.value[i].set(m.ox,m.oy,m.pas,m.oz);U.rmNxy.value[i].set(m.nx,m.ny);
  });
  for(let i=maps.length;i<FAO_RM_MAX;i++){U['rmH'+i].value=texs[0].h;U['rmN'+i].value=texs[0].n;U['rmW'+i].value=texs[0].w;}
  U.rmCount.value=maps.length;U.rmSmooth.value=smooth?1:0;
  const sx1=(g.sx1!=null)?g.sx1:g.ox+g.nx*g.pas,sy1=(g.sy1!=null)?g.sy1:g.oy+g.ny*g.pas,zT=(g.full!=null)?g.full:g.oz+g.nz*(g.pz||g.pas);
  U.rmMin.value.set(g.ox,g.oy,g.oz);U.rmMax.value.set(sx1,sy1,zT);
  const geo=new THREE.BoxGeometry(sx1-g.ox,sy1-g.oy,zT-g.oz);geo.translate((g.ox+sx1)/2,(g.oy+sy1)/2,(g.oz+zT)/2);
  const mesh=new THREE.Mesh(geo,mat);
  mesh.name='faoMatter';mesh.raycast=function(){};mesh.frustumCulled=false;
  mesh.onBeforeRender=function(renderer,scene,camera){
    try{ mesh.updateMatrixWorld(); U.rmInvModel.value.copy(mesh.matrixWorld).invert();
      U.rmModelView.value.multiplyMatrices(camera.matrixWorldInverse,mesh.matrixWorld);
      U.rmProj.value.copy(camera.projectionMatrix); U.rmNormalMat.value.getNormalMatrix(U.rmModelView.value); }catch(e){}
  };
  vw.rm={mesh:mesh,geo:geo,texs:texs};
  return mesh;
}
function faoMatterRmUpdate(vw,zChanged){
  // après une taille : textures de la carte du posage (si une colonne a changé) et des cartes changées
  const R=vw&&vw.rm;if(!R)return;
  R.texs.forEach(function(T,i){ if((i===0&&zChanged)||(i>0&&T.map.dirty)){ T.h.needsUpdate=true;T.n.needsUpdate=true;T.w.needsUpdate=true;T.map.dirty=false; } });
}
function faoMatterRmDispose(vw){
  const R=vw&&vw.rm;if(!R)return;
  try{ R.texs.forEach(function(T){T.h.dispose();T.n.dispose();T.w.dispose();}); }catch(e){}
  try{ R.geo.dispose(); }catch(e){}
  vw.rm=null;
}
