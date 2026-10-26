// 2026-10-21-002 : ÉBAUCHE 3D — BRUT PLUS LARGE QUE LA PIÈCE (rapides en matière).
// Retour utilisateur (Malaxeur Retard : pièce RETARD.step, brut = corps « Brut
// Retard Dents », torique D20 R2, zone chaîne côté extérieur) : « j'ai des
// passes rapides en pleine matière ». Cause : le domaine des centres d'outil
// était la boîte de la PIÈCE ± r ; le brut déborde de 2,25 mm sur les flancs
// plats (x = 48,2 → 50,45) : bande jamais usinée, traversée par les rapides de
// liaison à +5 mm (40 rapides, 5,8 m en matière). Le domaine inclut désormais
// la boîte du brut.
// Contrôle : parcours rejoué sur la Z-map du VRAI brut (corps STEP), matière
// retirée par les avances (outil torique exact) ; aucun rapide ne doit entrer
// dans la matière restante, et la bande des flancs doit être usinée.
// 2026-10-21-004 : niveaux bas (Z −40 → −50, sous la lentille) — un rampage de
// descente reliait deux échantillons légaux séparés par un trou EN LIGNE
// DROITE à travers la pièce (8 m d'avance dans la matière) : aucune avance ne
// doit passer sous le dessus de la pièce (corps d'outil vertical).
// Parties (tests/run.cjs les lance en parallèle) : `a` = niveaux du défaut
// (rapides, bande des flancs), `b` = niveaux bas ; sans argument : tout.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
let ko=0;
const PART=process.argv[2]||'', DO_A=PART!=='b', DO_B=PART!=='a';
const A=(c,m)=>{if(!c){ko++;console.log('  ✗ '+m);}else console.log('  ✓ '+m);};
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  // THREE du harnais = stub : BufferGeometry minimale (maillage FAO des imports)
  const T0=sandbox.THREE;
  class BG{constructor(){this.attributes={};this.userData={};this.index=null;}
    setAttribute(n,a){this.attributes[n]=a;return this;} getAttribute(n){return this.attributes[n];}
    setIndex(i){this.index=i;return this;} computeVertexNormals(){} computeBoundingBox(){} computeBoundingSphere(){} dispose(){}}
  class F32{constructor(a,n){this.array=Float32Array.from(a);this.itemSize=n;this.count=this.array.length/n;}}
  sandbox.THREE=new Proxy({},{get(t,k){if(k==='BufferGeometry')return BG;if(k==='Float32BufferAttribute')return F32;return T0[k];}});
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};window.confirm=function(){return true;};showAll=function(){};',ctx);
  sandbox.__part=fs.readFileSync(path.join(__dirname,'fixtures','RETARD.step')).buffer;
  sandbox.__stock=fs.readFileSync(path.join(__dirname,'fixtures','RETARD_brut_dents.step')).buffer;
  sandbox.__setup=fs.readFileSync(path.join(__dirname,'fixtures','retard_ebauche_posage.json'),'utf8');
  const ZBOT=10; // niveaux du défaut : 12,8 … 48,8 (temps de test borné)
  sandbox.__zbot=ZBOT;
  sandbox.__doA=DO_A;sandbox.__doB=DO_B;
  const body=`
    const eS=importStepBuild(new Uint8Array(__stock));
    const mS=_faoMeshFromBodyOrig({mesh:{geometry:eS.faoGeo}},600000);
    await importSTEP({name:'RETARD.step',arrayBuffer:async()=>__part});
    try{markDirty();rebuild();}catch(e){}
    const setup=faoSetup();const src=JSON.parse(__setup);
    ['tools','secu','marge','rapide','plungePct','accel','toolChg','planes','machine','origin','wcs'].forEach(k=>{if(src[k]!==undefined)setup[k]=src[k];});
    // brut = boîte exacte du corps brut du document (le moteur ne lit que la boîte)
    setup.stockSrc='manual';
    setup.stock={x0:src.stock.x0,y0:src.stock.y0,z0:src.stock.z0,x1:src.stock.x1,y1:src.stock.y1,z1:src.stock.z1};
    faoStock();
    setup.ops=src.ops.map(o=>Object.assign({},o,{zbot:__zbot}));
    faoSanitiseOps(setup);
    const op=setup.ops[0];
    const tool=faoToolById(setup,op.toolId);
    const mv=__doA?faoOpMoves(op,setup):[];
    // niveaux bas : ponts de rampage
    const opL=Object.assign({},src.ops[0],{id:'bas',ztop:-40,zbot:-50});setup.ops=[opL];faoSanitiseOps(setup);
    const mvL=__doB?faoOpMoves(setup.ops[0],setup):[];
    const eP=importStepBuild(new Uint8Array(__part));
    const mP=_faoMeshFromBodyOrig({mesh:{geometry:eP.faoGeo}},600000);
    return {mP:mP,mvL:mvL.map(m=>[m.r?1:0,m.x,m.y,m.z]),mS:mS,stock:setup.stock,tool:{d:+tool.d,cr:+tool.cornerR||0},mv:mv.map(m=>[m.r?1:0,m.x,m.y,m.z])};
  `;
  let r;
  try{ r=await vm.runInContext('(async()=>{'+body+'})()',ctx); }
  catch(e){ console.log('  ✗ exception',e&&e.stack||e); process.exit(1); }
  const mv=r.mv;
  if(DO_A)A(mv.length>1000,'ébauche 3D générée ('+mv.length+' mouvements)');
  // Z-map du dessus du VRAI brut (raster des triangles)
  const G=0.5,m=r.mS;
  let x0=1/0,y0=1/0,x1=-1/0,y1=-1/0;for(const p of m.v){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1]);}
  x0-=1;y0-=1;x1+=1;y1+=1;
  const nx=Math.ceil((x1-x0)/G)+1,ny=Math.ceil((y1-y0)/G)+1,H=new Float32Array(nx*ny).fill(-1/0);
  for(const t of m.t){const P=m.v[t[0]],Q=m.v[t[1]],S=m.v[t[2]];
    const i0=Math.max(0,Math.floor((Math.min(P[0],Q[0],S[0])-x0)/G)),i1=Math.min(nx-1,Math.ceil((Math.max(P[0],Q[0],S[0])-x0)/G));
    const j0=Math.max(0,Math.floor((Math.min(P[1],Q[1],S[1])-y0)/G)),j1=Math.min(ny-1,Math.ceil((Math.max(P[1],Q[1],S[1])-y0)/G));
    const d=(Q[1]-S[1])*(P[0]-S[0])+(S[0]-Q[0])*(P[1]-S[1]);if(Math.abs(d)<1e-12)continue;
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=x0+i*G,y=y0+j*G;
      const l1=((Q[1]-S[1])*(x-S[0])+(S[0]-Q[0])*(y-S[1]))/d,l2=((S[1]-P[1])*(x-S[0])+(P[0]-S[0])*(y-S[1]))/d,l3=1-l1-l2;
      if(l1<-1e-9||l2<-1e-9||l3<-1e-9)continue;const z=l1*P[2]+l2*Q[2]+l3*S[2];const k=j*nx+i;if(z>H[k])H[k]=z;}}
  const Rt=r.tool.d/2,cr=Math.min(Rt,r.tool.cr),rc=Rt-cr,n=Math.ceil(Rt/G);
  const visit=(x,y,z,fn)=>{const ci=Math.round((x-x0)/G),cj=Math.round((y-y0)/G);
    for(let dj=-n;dj<=n;dj++)for(let di=-n;di<=n;di++){const i=ci+di,j=cj+dj;if(i<0||j<0||i>=nx||j>=ny)continue;
      const rho=Math.hypot(x0+i*G-x,y0+j*G-y);if(rho>Rt)continue;
      fn(j*nx+i,rho>rc?z+cr-Math.sqrt(Math.max(0,cr*cr-(rho-rc)**2)):z);}};
  if(DO_A){
  let nR=0,inMat=0,worst=0,worstAt=null;
  for(let i=1;i<mv.length;i++){const a=mv[i-1],b=mv[i];
    const L=Math.hypot(b[1]-a[1],b[2]-a[2],b[3]-a[3]),ns=Math.max(1,Math.ceil(L/0.5));
    for(let k=1;k<=ns;k++){const t=k/ns,x=a[1]+(b[1]-a[1])*t,y=a[2]+(b[2]-a[2])*t,z=a[3]+(b[3]-a[3])*t;
      if(b[0]){let d=0;visit(x,y,z,(c,zc)=>{const e=H[c]-zc;if(e>d)d=e;});
        if(d>0.05){inMat+=L/ns;if(d>worst){worst=d;worstAt=[x,y,z,i];}}}
      else visit(x,y,z,(c,zc)=>{if(zc<H[c])H[c]=zc;});}
    if(b[0])nR++;}
  console.log('  · '+nR+' rapides ; en matière : '+inMat.toFixed(1)+' mm (pire '+worst.toFixed(2)+' mm'+(worstAt?' en '+worstAt.map(v=>+v.toFixed(1)).join(','):'')+')');
  A(inMat<1,'aucun rapide dans la matière restante du vrai brut (avant correctif : 5,8 m)');
  let xMax=-1/0;for(const q of mv)if(!q[0]&&q[3]>ZBOT+1&&q[3]<45)xMax=Math.max(xMax,q[1]);
  A(xMax>=r.stock.x1+Rt-1,'bande du flanc x=48,2→'+r.stock.x1.toFixed(2)+' usinée (centre jusqu’à '+xMax.toFixed(2)+' ≥ brut + R − 1)');
  }
  if(DO_B){// avances des niveaux bas sous le dessus de la PIÈCE (Z-map du dessus)
    const mp=r.mP;let a0=1/0,b0=1/0,a1=-1/0,b1=-1/0;for(const p of mp.v){a0=Math.min(a0,p[0]);b0=Math.min(b0,p[1]);a1=Math.max(a1,p[0]);b1=Math.max(b1,p[1]);}
    a0-=1;b0-=1;a1+=1;b1+=1;const mx=Math.ceil((a1-a0)/G)+1,my=Math.ceil((b1-b0)/G)+1,HP=new Float32Array(mx*my).fill(-1/0);
    for(const t of mp.t){const P=mp.v[t[0]],Q=mp.v[t[1]],S=mp.v[t[2]];
      const i0=Math.max(0,Math.floor((Math.min(P[0],Q[0],S[0])-a0)/G)),i1=Math.min(mx-1,Math.ceil((Math.max(P[0],Q[0],S[0])-a0)/G));
      const j0=Math.max(0,Math.floor((Math.min(P[1],Q[1],S[1])-b0)/G)),j1=Math.min(my-1,Math.ceil((Math.max(P[1],Q[1],S[1])-b0)/G));
      const d=(Q[1]-S[1])*(P[0]-S[0])+(S[0]-Q[0])*(P[1]-S[1]);if(Math.abs(d)<1e-12)continue;
      for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=a0+i*G,y=b0+j*G;
        const l1=((Q[1]-S[1])*(x-S[0])+(S[0]-Q[0])*(y-S[1]))/d,l2=((S[1]-P[1])*(x-S[0])+(P[0]-S[0])*(y-S[1]))/d,l3=1-l1-l2;
        if(l1<-1e-9||l2<-1e-9||l3<-1e-9)continue;const z=l1*P[2]+l2*Q[2]+l3*S[2];const k=j*mx+i;if(z>HP[k])HP[k]=z;}}
    let pen=0,penL=0,penAt=null;const mvL=r.mvL;
    for(let i=1;i<mvL.length;i++){const a=mvL[i-1],b=mvL[i];if(b[0])continue;
      const L=Math.hypot(b[1]-a[1],b[2]-a[2],b[3]-a[3]),ns=Math.max(1,Math.ceil(L/0.5));
      for(let k=1;k<=ns;k++){const t=k/ns,x=a[1]+(b[1]-a[1])*t,y=a[2]+(b[2]-a[2])*t,z=a[3]+(b[3]-a[3])*t;
        const ci=Math.round((x-a0)/G),cj=Math.round((y-b0)/G);let d=0;
        for(let dj=-n;dj<=n;dj++)for(let di=-n;di<=n;di++){const ii=ci+di,jj=cj+dj;if(ii<0||jj<0||ii>=mx||jj>=my)continue;
          const rho=Math.hypot(a0+ii*G-x,b0+jj*G-y);if(rho>Rt)continue;
          const zc=rho>rc?z+cr-Math.sqrt(Math.max(0,cr*cr-(rho-rc)**2)):z;const e=HP[jj*mx+ii]-zc;if(e>d)d=e;}
        if(d>0.1){penL+=L/ns;if(d>pen){pen=d;penAt=[x,y,z,i];}}}}
    console.log('  · niveaux bas (Z −40 → −50) : '+mvL.length+' mouvements ; avances sous la pièce '+penL.toFixed(1)+' mm (pire '+pen.toFixed(2)+(penAt?' en '+penAt.map(v=>+v.toFixed(1)).join(','):'')+')');
    A(mvL.length>100,'niveaux bas générés');
    A(penL<0.5,'aucune avance à travers la pièce aux niveaux bas (avant correctif : rampes en ligne droite sous la lentille)');
  }
  console.log(ko?'ÉCHEC '+ko:'OK');
  process.exit(ko?1:0);
})();
