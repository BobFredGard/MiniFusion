/* ---------- matières multicouches et patine de l'atelier RENDU (V0.13.0) ----------
   Ce qui donne à une image le « travail de la texture » : couches des matériaux (12-materiaux : fl paillettes
   sous le vernis, ir irisation en couche mince) et PATINE d'un corps — variation de teinte et de rugosité
   (taches, traces), usure des arêtes vives et arrondies (peinture : le métal apparaît ; métal et plastique :
   arête polie), salissure dans les creux. Les deux moteurs de l'atelier lisent les mêmes données :
   - surfGeo : copie du maillage où chaque sommet porte aUse = (usure, salissure) 0..1. Arêtes VIVES (angle
     > 25° entre faces voisines, convexes → usure, concaves → salissure) : le triangle qui les borde est
     recoupé par une ligne parallèle à l'arête, à la largeur de la bande — la valeur passe de 1 sur l'arête
     à 0 sur cette ligne, sans s'étaler sur les grandes faces. Congés et arrondis : courbure lue sur les
     normales des sommets (R ≤ 1,5 mm : pleine usure, R ≥ 8 mm : aucune).
   - moteur rapide (relApply, 98-rendu-reliefs) : bruit 3D dans le shader (éclats d'usure, taches, traces),
     paillettes = normale tirée au hasard par cellule ; l'irisation est celle de MeshPhysicalMaterial.
   - lancer de rayons (rtSurfMesh) : pas de shader à soi → coordonnées de texture par projection sur le plan
     dominant de chaque triangle (X, Y ou Z de la pièce, un matériau par plan), textures périodiques calculées
     ici (teinte, rugosité, et normales : relief + paillettes — le brossé y donne de vrais reflets étirés),
     usure et salissure en couleurs de sommets. */
const PAT_TYPES=[['','Patine : propre'],['aucune','Patine : aucune (aspect CAO)'],['legere','Patine : légère'],['usee','Patine : usée'],['tres','Patine : très usée']];
// v variation de teinte et de rugosité · w usure des arêtes · s salissure des creux
const PAT_DEF={propre:{v:0.5,w:0,s:0},aucune:{v:0,w:0,s:0},legere:{v:0.8,w:0.45,s:0.35},usee:{v:1,w:0.8,s:0.65},tres:{v:1.25,w:1.1,s:1}};
function patOf(rel){return PAT_DEF[rel&&rel.p]||PAT_DEF.propre;}
function surfOpts(src,d){
  // couches et patine d'une source de l'atelier (rdSources) : {fl, ir, pat, wear, paint}
  const pat=patOf(src&&src.rel);
  return {fl:d&&d.fl?d.fl:null,ir:d&&d.ir?d.ir:null,pat,wear:pat.w>0||pat.s>0,paint:!!(d&&d.fam==='Peintures')};
}
/* ── maillage : bandes d'usure et de salissure ── */
const _surfCache=new WeakMap();
function surfGeo(g0,band){
  const c=_surfCache.get(g0);if(c&&c.band===band)return c.geo.clone();
  const g=g0.index?g0.toNonIndexed():g0;
  const PA=g.attributes.position,NA=g.attributes.normal,n=Math.floor(PA.count/3);
  const P=new Float64Array(PA.count*3),N=new Float64Array(PA.count*3);
  for(let i=0;i<PA.count;i++){P[i*3]=PA.getX(i);P[i*3+1]=PA.getY(i);P[i*3+2]=PA.getZ(i);
    if(NA){N[i*3]=NA.getX(i);N[i*3+1]=NA.getY(i);N[i*3+2]=NA.getZ(i);}}
  // sommets soudés (les maillages de la CAO ne sont pas indexés) puis arêtes → triangles voisins
  const ids=new Map(),vid=new Int32Array(PA.count);
  for(let i=0;i<PA.count;i++){const k=Math.round(P[i*3]*1e3)+','+Math.round(P[i*3+1]*1e3)+','+Math.round(P[i*3+2]*1e3);
    let v=ids.get(k);if(v===undefined){v=ids.size;ids.set(k,v);}vid[i]=v;}
  const FN=new Float64Array(n*3);
  for(let t=0;t<n;t++){
    const a=t*9,ux=P[a+3]-P[a],uy=P[a+4]-P[a+1],uz=P[a+5]-P[a+2],vx=P[a+6]-P[a],vy=P[a+7]-P[a+1],vz=P[a+8]-P[a+2];
    let x=uy*vz-uz*vy,y=uz*vx-ux*vz,z=ux*vy-uy*vx;const l=Math.hypot(x,y,z)||1;x/=l;y/=l;z/=l;
    if(NA&&x*(N[a]+N[a+3]+N[a+6])+y*(N[a+1]+N[a+4]+N[a+7])+z*(N[a+2]+N[a+5]+N[a+8])<0){x=-x;y=-y;z=-z;} // sens : celui des normales
    FN[t*3]=x;FN[t*3+1]=y;FN[t*3+2]=z;
  }
  if(!NA)for(let i=0;i<PA.count;i++){const t=(i/3)|0;N[i*3]=FN[t*3];N[i*3+1]=FN[t*3+1];N[i*3+2]=FN[t*3+2];}
  const E=new Map(),SH=2097152; // clé d'arête : a·2²¹ + b (a < b)
  for(let t=0;t<n;t++)for(let i=0;i<3;i++){
    const a=vid[t*3+(i+1)%3],b=vid[t*3+(i+2)%3],k=a<b?a*SH+b:b*SH+a; // arête opposée au sommet i
    const L=E.get(k);if(L)L.push(t,i);else E.set(k,[t,i]);
  }
  const VF=new Uint8Array(ids.size); // sommets soudés posés sur une arête vive (bits : 1 convexe, 2 concave)
  const FL=new Uint8Array(n*3),cos25=Math.cos(25*Math.PI/180); // 1 arête vive convexe, 2 concave
  E.forEach(L=>{
    if(L.length!==4)return;
    const t1=L[0],i1=L[1],t2=L[2],i2=L[3];
    if(FN[t1*3]*FN[t2*3]+FN[t1*3+1]*FN[t2*3+1]+FN[t1*3+2]*FN[t2*3+2]>cos25)return;
    const o=t2*9+i2*3,e=t1*9+((i1+1)%3)*3; // sommet de t2 hors de l'arête, un point de l'arête
    const s=(P[o]-P[e])*FN[t1*3]+(P[o+1]-P[e+1])*FN[t1*3+1]+(P[o+2]-P[e+2])*FN[t1*3+2];
    const f=s<0?1:2;FL[t1*3+i1]=f;FL[t2*3+i2]=f;
    VF[vid[t1*3+(i1+1)%3]]|=f;VF[vid[t1*3+(i1+2)%3]]|=f;
  });
  // sortie : triangles (recoupés le long des arêtes vives), aUse par sommet
  const oP=[],oN=[],oU=[];
  const sm=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
  const put=(p,q,u)=>{oP.push(p[0],p[1],p[2]);const l=Math.hypot(q[0],q[1],q[2])||1;oN.push(q[0]/l,q[1]/l,q[2]/l);oU.push(u[0],u[1]);};
  const V=(t,i)=>{const a=t*9+i*3;return [P[a],P[a+1],P[a+2]];},Nn=(t,i)=>{const a=t*9+i*3;return [N[a],N[a+1],N[a+2]];};
  const lerp=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
  const dist=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);
  // coins : un sommet posé sur une arête vive (le triangle ne la borde pas : éventails des faces planes)
  // reçoit un petit triangle à lui, 1 au sommet, fondu sur la largeur de la bande — jamais tout le triangle
  const corners=(p3,q3,cut,u3,base)=>{
    if(!cut[0]&&!cut[1]&&!cut[2]){for(let i=0;i<3;i++)put(p3[i],q3[i],u3[i]);return;}
    const ring=[];
    for(let i=0;i<3;i++){
      if(!cut[i]){ring.push([p3[i],q3[i],u3[i]]);continue;}
      const j=(i+1)%3,h=(i+2)%3;
      const ka=Math.min(0.45,cut[i]/(dist(p3[i],p3[j])||1e-9)),kb=Math.min(0.45,cut[i]/(dist(p3[i],p3[h])||1e-9));
      const A=[lerp(p3[i],p3[j],ka),lerp(q3[i],q3[j],ka),base],B=[lerp(p3[i],p3[h],kb),lerp(q3[i],q3[h],kb),base];
      put(p3[i],q3[i],u3[i]);put(A[0],A[1],A[2]);put(B[0],B[1],B[2]);
      ring.push(B,A);
    }
    for(let i=1;i+1<ring.length;i++){put(...ring[0]);put(...ring[i]);put(...ring[i+1]);} // reste : polygone convexe en éventail
  };
  // un triangle : fl[i] arête vive opposée au sommet i (1 convexe, 2 concave), vf[i] sommet posé sur une arête vive
  const vuB=(vf,u)=>vf?[vf&1?1:u[0],vf&2?1:u[1]]:u,bw=f=>f&1?band:band*1.8;
  const proc=(p,q,fl,vf,base,depth)=>{
    const nf=(fl[0]?1:0)+(fl[1]?1:0)+(fl[2]?1:0);
    const hgt=i=>{const c=p[i],a=p[(i+1)%3],b=p[(i+2)%3],abx=b[0]-a[0],aby=b[1]-a[1],abz=b[2]-a[2],acx=c[0]-a[0],acy=c[1]-a[1],acz=c[2]-a[2];
      return Math.hypot(aby*acz-abz*acy,abz*acx-abx*acz,abx*acy-aby*acx)/(Math.hypot(abx,aby,abz)||1);};
    if(nf>=2&&depth<10&&Math.max(hgt(0),hgt(1),hgt(2))>2*band){
      // bordé de plusieurs arêtes vives (moitié de rectangle…) : coupé au milieu du plus grand côté
      let i=0,best=-1;for(let k=0;k<3;k++){const d=dist(p[(k+1)%3],p[(k+2)%3]);if(d>best){best=d;i=k;}}
      const j=(i+1)%3,h=(i+2)%3,M=lerp(p[j],p[h],0.5),qM=lerp(q[j],q[h],0.5),vfM=fl[i]||0;
      proc([p[i],p[j],M],[q[i],q[j],qM],[fl[i],0,fl[h]],[vf[i],vf[j],vfM],base,depth+1);
      proc([p[i],M,p[h]],[q[i],qM,q[h]],[fl[i],fl[j],0],[vf[i],vfM,vf[h]],base,depth+1);
      return;
    }
    if(nf===1){ // bande le long de l'arête vive du triangle
      const i=fl[0]?0:fl[1]?1:2,ia=(i+1)%3,ib=(i+2)%3,f=fl[i];
      const c=p[i],a=p[ia],b=p[ib],tt=bw(f)/(hgt(i)||1e-9);
      const eU=f===1?[1,base[1]]:[base[0],1];
      if(tt<0.5){
        const a2=lerp(a,c,tt),b2=lerp(b,c,tt),qa2=lerp(q[ia],q[i],tt),qb2=lerp(q[ib],q[i],tt);
        put(a2,qa2,base);put(a,q[ia],vuB(vf[ia],eU));put(b,q[ib],vuB(vf[ib],eU));
        put(a2,qa2,base);put(b,q[ib],vuB(vf[ib],eU));put(b2,qb2,base);
        corners([c,a2,b2],[q[i],qa2,qb2],[vf[i]?bw(vf[i]):0,0,0],[vuB(vf[i],base),base,base],base);
        return;
      }
    }
    if(nf===0){corners(p,q,vf.map(v=>v?bw(v):0),vf.map(v=>vuB(v,base)),base);return;}
    for(let i=0;i<3;i++){ // petit triangle : sommets des arêtes vives à 1
      let u=base;
      for(let e=0;e<3;e++)if(fl[e]&&e!==i)u=fl[e]===1?[1,u[1]]:[u[0],1];
      put(p[i],q[i],u);
    }
  };
  for(let t=0;t<n;t++){
    const p=[V(t,0),V(t,1),V(t,2)],q=[Nn(t,0),Nn(t,1),Nn(t,2)];
    // courbure signée (convexe > 0) : (nᵢ − nⱼ)·(pᵢ − pⱼ) / |pᵢ − pⱼ|², moyenne des trois côtés
    let k=0;
    for(let i=0;i<3;i++){const j=(i+1)%3,dx=p[i][0]-p[j][0],dy=p[i][1]-p[j][1],dz=p[i][2]-p[j][2],d2=dx*dx+dy*dy+dz*dz||1e-12;
      k+=((q[i][0]-q[j][0])*dx+(q[i][1]-q[j][1])*dy+(q[i][2]-q[j][2])*dz)/d2;}
    k/=3;
    const cw=sm((k-0.125)/0.54),cd=sm((-k-0.125)/0.54),base=[cw,cd];
    proc(p,q,[FL[t*3],FL[t*3+1],FL[t*3+2]],[VF[vid[t*3]],VF[vid[t*3+1]],VF[vid[t*3+2]]],base,0);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(oP,3));
  geo.setAttribute('normal',new THREE.Float32BufferAttribute(oN,3));
  geo.setAttribute('aUse',new THREE.Float32BufferAttribute(oU,2));
  _surfCache.set(g0,{band,geo});
  return geo.clone();
}
function surfBand(g0){ // largeur de la bande d'usure (mm) : suit la taille du corps
  if(!g0.boundingSphere)g0.computeBoundingSphere();
  const r=g0.boundingSphere?g0.boundingSphere.radius:30;
  return Math.max(0.25,Math.min(1.5,r*0.015));
}
/* ── moteur rapide : morceaux de shader (insérés par relApply) ── */
const SURF_VS_HEAD='#ifdef SURF_WEAR\nattribute vec2 aUse;\nvarying vec2 vUse;\n#endif\n';
const SURF_FS_HEAD=[
  'uniform float uSfV;uniform float uSfW;uniform float uSfS;uniform float uSfPaint;uniform float uFlT;uniform float uFlI;',
  '#ifdef SURF_WEAR',
  'varying vec2 vUse;',
  '#endif',''].join('\n');
const SURF_FS_COLOR=[
  '  float sfW = 0.0, sfD = 0.0;',
  '  diffuseColor.rgb *= 1.0 + uSfV * ( ( relFbm( vRelP * 0.14 + 3.1 ) - 0.5 ) * 0.16 + ( relNoise( vRelP * 0.6 + 9.7 ) - 0.5 ) * 0.06 );', // taches
  '#ifdef SURF_WEAR',
  '  sfW = smoothstep( 0.42, 0.62, vUse.x * uSfW * ( 0.45 + 0.9 * relFbm( vRelP * 1.7 + 5.3 ) ) );',                 // éclats irréguliers
  '  sfD = clamp( vUse.y * uSfS * ( 0.55 + 0.6 * relFbm( vRelP * 0.5 + 1.3 ) ), 0.0, 1.0 );',
  '  if( uSfPaint > 0.5 ) diffuseColor.rgb = mix( diffuseColor.rgb, vec3( 0.42, 0.43, 0.45 ), sfW ); else diffuseColor.rgb *= 1.0 + 0.3 * sfW;',
  '  diffuseColor.rgb *= 1.0 - 0.6 * sfD;',
  '#endif',''].join('\n');
const SURF_FS_ROUGH=[
  '  roughnessFactor = clamp( roughnessFactor + uSfV * ( relFbm( vRelP * 0.2 + 11.0 ) - 0.5 ) * 0.22, 0.02, 1.0 );',  // traces
  '  if( uSfPaint > 0.5 ) roughnessFactor = mix( roughnessFactor, 0.32, sfW ); else roughnessFactor *= 1.0 - 0.45 * sfW;',
  '  roughnessFactor = min( 1.0, roughnessFactor + 0.3 * sfD );',''].join('\n');
const SURF_FS_METAL='  if( uSfPaint > 0.5 ) metalnessFactor = mix( metalnessFactor, 1.0, sfW );\n';
const SURF_FS_NORMAL=[ // paillettes : une normale au hasard par cellule (le vernis garde la normale de la surface)
  '#ifdef SURF_FLAKE',
  '  { vec3 flC = floor( vRelP / uFlT ); vec3 flR = vec3( relHash( flC ), relHash( flC + 17.3 ), relHash( flC + 41.9 ) ) * 2.0 - 1.0;',
  '    normal = normalize( normal + flR * uFlI * 0.55 ); }',
  '#endif',''].join('\n');
/* ── lancer de rayons : bruit périodique et textures ── */
function sfHash(i,j,s){let h=(Math.imul(i,374761393)+Math.imul(j,668265263)+Math.imul(s,1442695041))|0;
  h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;}
function sfNoise(x,y,px,py,s){ // bruit de valeur périodique : px × py cellules par tuile
  const i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
  const m=(a,p)=>((a%p)+p)%p,i0=m(i,px),i1=m(i+1,px),j0=m(j,py),j1=m(j+1,py);
  const a=sfHash(i0,j0,s),b=sfHash(i1,j0,s),c=sfHash(i0,j1,s),d=sfHash(i1,j1,s);
  return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;
}
function sfFbm(x,y,px,py,s){return sfNoise(x,y,px,py,s)*0.6+sfNoise(x*2,y*2,px*2,py*2,s+1)*0.3+sfNoise(x*4,y*4,px*4,py*4,s+2)*0.1;}
const sfTri=x=>Math.abs(x-Math.floor(x)-0.5)*2;
function sfTile(rel,fl){ // tuile des normales (mm) : multiple du pas du relief, ~4 mm
  if(!rel)return 4;
  const e=rel.e,k=rel.t==='molete'?e*Math.SQRT2:e;
  return k*Math.max(1,Math.round(4/k));
}
function sfHeight(rel,kind,T){
  // hauteur (0..1) en (u, v) mm d'une tuile T : 'side' = faces qui contiennent la direction D du motif
  // (u le long de D pour brossé, bois, stries ; v le long de D pour couches) ; 'end' = faces ⟂ D
  if(!rel)return null;
  const f=1/rel.e,c=Math.max(1,Math.round(T*f)),t=rel.t;
  const iso=(u,v)=>{const x=u/T*c,y=v/T*c,c2=Math.max(1,Math.round(c*0.25));return sfFbm(x,y,c,c,1)*0.7+sfNoise(u/T*c2,v/T*c2,c2,c2,4)*0.3;};
  if(t==='sable'||t==='grain')return iso;
  if(t==='molete')return (u,v)=>1-Math.max(sfTri((u+v)*f*Math.SQRT1_2),sfTri((u-v)*f*Math.SQRT1_2));
  if(t==='brosse'){const cu=Math.max(1,Math.round(T*f*0.02)),cu2=Math.max(1,Math.round(T*f*0.005)),cv2=Math.max(1,Math.round(T*f*0.2));
    return (u,v)=>sfFbm(u/T*cu,v/T*c,cu,c,1)*0.65+sfNoise(u/T*cu2,v/T*cv2,cu2,cv2,2)*0.35;}
  if(t==='bois'){if(kind==='end')return iso;const cw=Math.max(1,Math.round(T*f*0.05));
    return (u,v)=>sfTri((v+(sfFbm(u/T*cw,v/T*c,cw,c,3)-0.5)*1.6*rel.e)*f);}
  if(t==='stries')return (u,v)=>sfTri(v*f);
  if(t==='couches'){if(kind==='end')return null;return (u,v)=>Math.pow(sfTri(v*f),0.6);}
  return null;
}
function sfTex(T3,w,h,fill,tile){ // tuile en mm : uv (en mm) × 1/tuile
  const a=new Uint8Array(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)fill(x,y,a,(y*w+x)*4);
  const t=new T3.DataTexture(a,w,h,T3.RGBAFormat);
  t.wrapS=t.wrapT=T3.RepeatWrapping;t.magFilter=t.minFilter=T3.LinearFilter;t.repeat.set(1/tile,1/tile);t.needsUpdate=true;
  return t;
}
function sfKit(T3,cache,o){
  // textures d'un corps pour un sens de faces (o.kind 'side' | 'end'), mises en commun par clé :
  // {map, rough, normal (tuiles posées sur chaque texture), cMax, rMax}
  const k=JSON.stringify(o);if(cache.has(k))return cache.get(k);
  const {rel,fl,v,rough,kind}=o,K={};
  // teinte et rugosité : taches et traces, tuile 48 mm (le bois : multiple du pas de ses cernes, ~48 mm)
  const wood=rel&&rel.t==='bois'&&kind==='side';
  const Tn=sfTile(rel,fl),Tm=wood?rel.e*Math.max(1,Math.round(48/rel.e)):48,R=wood?1024:512,cM=1+0.11*v;
  const hW=wood?sfHeight(rel,kind,Tm):null;
  if(v>0||wood){
    const c1=Math.max(1,Math.round(Tm*0.14)),c2=Math.max(1,Math.round(Tm*0.6));
    K.map=sfTex(T3,R,R,(x,y,a,i)=>{
      const u=x/R*Tm,w=y/R*Tm;
      let m=1+v*((sfFbm(x/R*c1,y/R*c1,c1,c1,7)-0.5)*0.16+(sfNoise(x/R*c2,y/R*c2,c2,c2,9)-0.5)*0.06);
      if(hW)m*=0.62+0.46*hW(u,w); // veinage
      const b=Math.max(0,Math.min(255,Math.round(255*m/(wood?1.1*cM:cM))));a[i]=a[i+1]=a[i+2]=b;a[i+3]=255;},Tm);
    K.cMax=wood?1.1*cM:cM;
  }
  if(v>0){
    const Tr=48,cr=Math.max(1,Math.round(Tr*0.2)),rMax=Math.min(1,rough+0.11*v);
    K.rough=sfTex(T3,R,R,(x,y,a,i)=>{
      const r=Math.max(0.02,Math.min(1,rough+v*(sfFbm(x/R*cr,y/R*cr,cr,cr,11)-0.5)*0.22));
      a[i]=a[i+2]=255;a[i+1]=Math.round(255*r/rMax);a[i+3]=255;},Tr);
    K.rMax=rMax;
  }
  const H=sfHeight(rel,kind,Tn);
  if(H||fl){
    const N=1024,P=REL_DEF[rel?rel.t:'grain'],A=rel?P.a*(rel.e/P.e):0,du=Tn/N;
    const hv=new Float32Array(N*N);
    if(H)for(let y=0;y<N;y++)for(let x=0;x<N;x++)hv[y*N+x]=H(x*du,y*du);
    const cf=fl?Math.max(1,Math.round(Tn/fl.t)):0;
    K.normal=sfTex(T3,N,N,(x,y,a,i)=>{
      let nx=0,ny=0;
      if(H){const xp=(x+1)%N,xm=(x+N-1)%N,yp=(y+1)%N,ym=(y+N-1)%N;
        nx=-(hv[y*N+xp]-hv[y*N+xm])*A/(2*du);ny=-(hv[yp*N+x]-hv[ym*N+x])*A/(2*du);}
      if(fl){const cx=Math.floor(x/N*cf),cy=Math.floor(y/N*cf);
        nx+=(sfHash(cx,cy,21)*2-1)*0.55*fl.i;ny+=(sfHash(cx,cy,22)*2-1)*0.55*fl.i;}
      const l=Math.hypot(nx,ny,1);
      a[i]=Math.round((nx/l*0.5+0.5)*255);a[i+1]=Math.round((ny/l*0.5+0.5)*255);a[i+2]=Math.round((1/l*0.5+0.5)*255);a[i+3]=255;},Tn);
  }
  cache.set(k,K);return K;
}
function rtSurfMesh(T3,m,src,base,cache){
  // maillage du lancer de rayons pour une copie de l'atelier m (r147) : base = MeshPhysicalMaterial récente
  // déjà réglée (rtMaterial). Rend un T3.Mesh, ou, avec textures, un T3.Group d'un maillage par plan de
  // projection : le pathtracer donne UNE matière par maillage (ses groupes de géométrie sont ignorés).
  const d=src?matDef(src.mat):null,S=surfOpts(src,d),rel=src?relOf({rel:src.rel},d):null;
  const G=m.geometry,PA=G.attributes.position,NA=G.attributes.normal,UA=G.attributes.aUse,n=Math.floor(PA.count/3);
  const tex=S.pat.v>0||S.fl||(rel&&!!sfHeight(rel,'side',sfTile(rel,S.fl)));
  const Dax=rel?{x:0,y:1,z:2}[rel.d||'x']:0;
  // couleurs d'usure et de salissure (les cartes de rugosité ne passent pas par les sommets)
  let col=null;
  if(S.wear&&UA){
    const c=base.color,g=[0.42,0.43,0.45];col=new Float32Array(PA.count*4); // RVBA : le format que le pathtracer donne aux autres maillages
    for(let i=0;i<PA.count;i++){
      // pas d'éclats au pixel ici : un bruit le long des arêtes rend l'usure inégale d'une portion à l'autre
      const x=PA.getX(i),y=PA.getY(i),z=PA.getZ(i),nz=sfNoise(0.45*(x+0.37*z),0.45*(y-0.61*z),65536,65536,5);
      const w=Math.min(1,UA.getX(i)*S.pat.w*0.7*Math.max(0,Math.min(1,nz*1.8-0.35))),s=Math.min(1,UA.getY(i)*S.pat.s),k=1-0.6*s;
      for(let ch=0;ch<3;ch++){const cc=[c.r,c.g,c.b][ch]||1e-3;
        col[i*4+ch]=(S.paint?1+(g[ch]/cc-1)*w:1+0.3*w)*k;}
      col[i*4+3]=1;
    }
  }
  if(!tex){
    const geo=new T3.BufferGeometry();
    geo.setAttribute('position',rtAttr(T3,PA));
    if(NA)geo.setAttribute('normal',rtAttr(T3,NA));else geo.computeVertexNormals();
    if(G.index)geo.setIndex(new T3.BufferAttribute(G.index.array,1));
    if(col){geo.setAttribute('color',new T3.BufferAttribute(col,4));base.vertexColors=true;}
    return new T3.Mesh(geo,base);
  }
  // triangles rangés par plan dominant (X, Y, Z) ; uv = coordonnées en mm sur ce plan, u le long de D
  // (brossé, bois, stries) ou v le long de D (couches) quand D est dans le plan
  const ax=new Uint8Array(n),cnt=[0,0,0];
  for(let t=0;t<n;t++){let sx=0,sy=0,sz=0;
    for(let j=0;j<3;j++){const i=t*3+j;if(NA){sx+=NA.getX(i);sy+=NA.getY(i);sz+=NA.getZ(i);}}
    if(!NA){const i=t*3;const ux=PA.getX(i+1)-PA.getX(i),uy=PA.getY(i+1)-PA.getY(i),uz=PA.getZ(i+1)-PA.getZ(i),
      vx=PA.getX(i+2)-PA.getX(i),vy=PA.getY(i+2)-PA.getY(i),vz=PA.getZ(i+2)-PA.getZ(i);sx=uy*vz-uz*vy;sy=uz*vx-ux*vz;sz=ux*vy-uy*vx;}
    const a=Math.abs(sx)>=Math.abs(sy)&&Math.abs(sx)>=Math.abs(sz)?0:Math.abs(sy)>=Math.abs(sz)?1:2;ax[t]=a;cnt[a]++;}
  const UV=a=>{ // axes (u, v) du plan ⟂ a
    const o=[0,1,2].filter(q=>q!==a);
    if(rel&&Dax!==a){if(rel.t==='couches')return Dax===o[0]?[o[1],o[0]]:[o[0],o[1]];
      if(Dax===o[1])return [o[1],o[0]];}
    return o;
  };
  const tot=n*3,pos=new Float32Array(tot*3),nor=new Float32Array(tot*3),uv=new Float32Array(tot*2),tan=new Float32Array(tot*4),cl=col?new Float32Array(tot*4):null;
  let w=0;const starts=[0,0,0];
  for(let a=0;a<3;a++){
    starts[a]=w;const [ua,va]=UV(a);
    for(let t=0;t<n;t++){if(ax[t]!==a)continue;
      for(let j=0;j<3;j++){const i=t*3+j,p=[PA.getX(i),PA.getY(i),PA.getZ(i)],q=NA?[NA.getX(i),NA.getY(i),NA.getZ(i)]:[0,0,0];
        pos.set(p,w*3);nor.set(q,w*3);uv[w*2]=p[ua];uv[w*2+1]=p[va];
        const U=[0,0,0],Vv=[0,0,0];U[ua]=1;Vv[va]=1;
        const cr=[q[1]*U[2]-q[2]*U[1],q[2]*U[0]-q[0]*U[2],q[0]*U[1]-q[1]*U[0]]; // N × U : signe de la bitangente
        tan[w*4]=U[0];tan[w*4+1]=U[1];tan[w*4+2]=U[2];tan[w*4+3]=cr[0]*Vv[0]+cr[1]*Vv[1]+cr[2]*Vv[2]<0?-1:1;
        if(cl)cl.set(col.subarray(i*4,i*4+4),w*4);
        w++;}
    }
  }
  const out=new T3.Group();
  for(let a=0;a<3;a++){
    if(!cnt[a])continue;
    const s0=starts[a],s1=s0+cnt[a]*3,ga=new T3.BufferGeometry();
    ga.setAttribute('position',new T3.BufferAttribute(pos.slice(s0*3,s1*3),3));ga.setAttribute('normal',new T3.BufferAttribute(nor.slice(s0*3,s1*3),3));
    ga.setAttribute('uv',new T3.BufferAttribute(uv.slice(s0*2,s1*2),2));ga.setAttribute('tangent',new T3.BufferAttribute(tan.slice(s0*4,s1*4),4));
    if(cl)ga.setAttribute('color',new T3.BufferAttribute(cl.slice(s0*4,s1*4),4));
    const kind=rel&&Dax===a?'end':'side';
    const K=sfKit(T3,cache,{rel,fl:S.fl,v:S.pat.v,rough:+base.roughness.toFixed(3),kind});
    const M=base.clone();
    if(cl)M.vertexColors=true;
    if(K.map){M.map=K.map;M.color.multiplyScalar(K.cMax);} // textures partagées (cache) : une seule copie au GPU
    if(K.rough){M.roughnessMap=K.rough;M.roughness=K.rMax;}
    if(K.normal)M.normalMap=K.normal;
    out.add(new T3.Mesh(ga,M));
  }
  base.dispose();
  return out;
}
