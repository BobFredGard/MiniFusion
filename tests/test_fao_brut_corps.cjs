// 2026-10-21-010 : BRUT = CORPS (retour utilisateur Malaxeur Retard) — « le brut
// pris en compte n'est pas la pièce mais un cube, pourtant un corps est bien
// sélectionné » ; « pense à regarder que les minipasses soient partout » ; « et
// que le brut de la simulation soit le bon ».
// Pièce RETARD.step + brut « Brut Retard Dents » (corps), torique D20 R2, faces
// rouges = flancs (devant interdit), 2 minipasses. Contrôles :
//   • l'ébauche n'usine plus le cube : avance dans le vide << boîte ;
//   • minipasses présentes à chaque bande ;
//   • aucune avance à travers la pièce (outil vertical, Z-map du dessus) ;
//   • aucun rapide horizontal dans la matière RESTANTE du vrai brut ;
//   • simulation : matière de départ = dessus du corps-brut, pas la boîte.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  ✗ '+m);}else console.log('  ✓ '+m);};
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
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
  const r=await vm.runInContext(`(async()=>{
    await importSTEP({name:'RETARD.step',arrayBuffer:async()=>__part});
    try{markDirty();rebuild();}catch(e){}
    const imp=bodies.find(b=>b.kind==='import');
    // brut-corps inscrit comme import (le harnais n'importe pas deux STEP)
    const eS=importStepBuild(new Uint8Array(__stock));importGeom.set('stk',eS);
    bodies.push({id:'stk',ref:'stk',name:'Brut Retard Dents',kind:'import',visible:false,mesh:{geometry:eS.faoGeo,visible:false,matrixWorld:null}});
    const src=JSON.parse(__setup);
    const setup=faoSetup();
    ['tools','secu','marge','rapide','plungePct','accel','toolChg','planes','machine','origin','wcs'].forEach(k=>{if(src[k]!==undefined)setup[k]=src[k];});
    setup.bodies=[imp.id];
    setup.stockSrc='manual';
    const box={x0:src.stock.x0,y0:src.stock.y0,z0:src.stock.z0,x1:src.stock.x1,y1:src.stock.y1,z1:src.stock.z1};
    const base=Object.assign({},src.ops[0],{id:'bc',ztop:box.z1,zbot:30,minipasses:2,limit:undefined,
      protect:[{b:imp.id,f:1},{b:imp.id,f:3},{b:imp.id,f:6}],protectFront:true});
    const run=function(solid){
      setup.stock=Object.assign({},box);if(solid)setup.stock.solid='stk';
      setup.ops=[Object.assign({},base,{id:solid?'bc':'bx'})];faoSanitiseOps(setup);
      return faoOpMoves(setup.ops[0],setup);
    };
    const mvBox=run(false), mvBody=run(true);
    const T=faoStockTop(setup,1),dil=T.dil(10);
    const air=function(mv){let a=0,c=0;for(let i=1;i<mv.length;i++){const p=mv[i-1],q=mv[i];if(q.r)continue;const L=Math.hypot(q.x-p.x,q.y-p.y,q.z-p.z);
      if(dil((p.x+q.x)/2,(p.y+q.y)/2)>(p.z+q.z)/2+0.05)c+=L;else a+=L;}return [a,c];};
    // simulation : colonnes de la matière de départ
    const gm=faoMatterGrid(setup.stock);let full=0;for(let i=0;i<gm.nx*gm.ny;i++)if(gm.h[i]>=box.z1-1e-6)full++;
    const eP=importStepBuild(new Uint8Array(__part));
    const mP=_faoMeshFromBodyOrig({mesh:{geometry:eP.faoGeo}},600000),mS=_faoMeshFromBodyOrig({mesh:{geometry:eS.faoGeo}},600000);
    return {airBox:air(mvBox),airBody:air(mvBody),nBox:mvBox.length,nBody:mvBody.length,zt:box.z1,
      sim:{cols:gm.nx*gm.ny,full:full},mP:mP,mS:mS,mv:mvBody.map(m=>[m.r?1:0,m.x,m.y,m.z])};
  })()`,ctx);
  const pc=a=>(100*a[0]/(a[0]+a[1])).toFixed(0);
  console.log('  · avance dans le vide : boîte '+(r.airBox[0]/1000).toFixed(1)+' m ('+pc(r.airBox)+' %) → corps '+(r.airBody[0]/1000).toFixed(1)+' m ('+pc(r.airBody)+' %) ; mouvements '+r.nBox+' → '+r.nBody);
  A(r.airBody[0]<0.3*r.airBox[0],'l’ébauche n’usine plus le cube : avance dans le vide divisée par plus de 3');
  // minipasses : 2 cotes par bande (ap = 3 → +1, +2)
  const mv=r.mv,L={};for(let i=1;i<mv.length;i++){const a=mv[i-1],b=mv[i];if(a[0]||b[0]||Math.abs(a[3]-b[3])>1e-6)continue;const k=b[3].toFixed(3);L[k]=(L[k]||0)+Math.hypot(b[1]-a[1],b[2]-a[2]);}
  const bands=[];for(let k=1;;k++){const z=Math.round((r.zt-3*k)*1000)/1000;if(z<30-1e-6)break;
    bands.push([z,[1,2].map(d=>L[(Math.round((z+d)*1000)/1000).toFixed(3)]||0)]);}
  // au-dessus de la pièce (z > 67,8) : pas de paroi, rien à faire ; près des
  // bords hauts des flancs rouges (z ≥ 59) un morceau peut n'avoir aucune entrée
  // légale côté libre (le devant de la face est interdit)
  const sous=bands.filter(b=>b[0]<64);
  const manq=[];sous.forEach(b=>b[1].forEach((v,i)=>{if(!(v>5))manq.push(+(b[0]+i+1).toFixed(1));}));
  console.log('  · minipasses (longueur mm par cote, 2 cotes par bande) : '+bands.map(b=>b[0].toFixed(1)+':'+b[1].map(v=>v.toFixed(0)).join('/')).join(' ')+' — cotes manquantes sous la pièce : '+(manq.join(',')||'aucune'));
  A(manq.length<=3&&manq.every(z=>z>=59),'minipasses présentes à chaque bande (au plus 3 cotes près des bords hauts des flancs rouges)');
  A(sous.filter(b=>b[0]<57).every(b=>b[1].every(v=>v>5)),'minipasses complètes à toutes les bandes sous Z 57');
  // Z-maps du dessus pièce / brut
  const G=0.5;const zmap=m=>{let x0=1/0,y0=1/0,x1=-1/0,y1=-1/0;for(const p of m.v){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1]);}
    x0-=1;y0-=1;x1+=1;y1+=1;const nx=Math.ceil((x1-x0)/G)+1,ny=Math.ceil((y1-y0)/G)+1,h=new Float32Array(nx*ny).fill(-1/0);
    for(const t of m.t){const P=m.v[t[0]],Q=m.v[t[1]],S=m.v[t[2]];const d=(Q[1]-S[1])*(P[0]-S[0])+(S[0]-Q[0])*(P[1]-S[1]);if(Math.abs(d)<1e-12)continue;
      const i0=Math.max(0,Math.floor((Math.min(P[0],Q[0],S[0])-x0)/G)),i1=Math.min(nx-1,Math.ceil((Math.max(P[0],Q[0],S[0])-x0)/G));
      const j0=Math.max(0,Math.floor((Math.min(P[1],Q[1],S[1])-y0)/G)),j1=Math.min(ny-1,Math.ceil((Math.max(P[1],Q[1],S[1])-y0)/G));
      for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=x0+i*G,y=y0+j*G;const l1=((Q[1]-S[1])*(x-S[0])+(S[0]-Q[0])*(y-S[1]))/d,l2=((S[1]-P[1])*(x-S[0])+(P[0]-S[0])*(y-S[1]))/d,l3=1-l1-l2;
        if(l1<-1e-9||l2<-1e-9||l3<-1e-9)continue;const z=l1*P[2]+l2*Q[2]+l3*S[2];const k=j*nx+i;if(z>h[k])h[k]=z;}}return {x0,y0,nx,ny,h};};
  const ZP=zmap(r.mP),ZS=zmap(r.mS);const Hs=Float32Array.from(ZS.h);
  const Rt=10,cr=2,rc=8,n=Math.ceil(Rt/G);
  const visit=(Z,x,y,z,fn)=>{const ci=Math.round((x-Z.x0)/G),cj=Math.round((y-Z.y0)/G);
    for(let dj=-n;dj<=n;dj++)for(let di=-n;di<=n;di++){const i=ci+di,j=cj+dj;if(i<0||j<0||i>=Z.nx||j>=Z.ny)continue;
      const rho=Math.hypot(Z.x0+i*G-x,Z.y0+j*G-y);if(rho>Rt)continue;fn(j*Z.nx+i,rho>rc?z+cr-Math.sqrt(Math.max(0,cr*cr-(rho-rc)**2)):z);}};
  let pen=0,rapH=0,rapHAt=null;
  for(let i=1;i<mv.length;i++){const a=mv[i-1],b=mv[i];const L2=Math.hypot(b[1]-a[1],b[2]-a[2],b[3]-a[3]),ns=Math.max(1,Math.ceil(L2/0.5));
    const horiz=b[0]&&Math.abs(b[3]-a[3])<1e-6&&Math.hypot(b[1]-a[1],b[2]-a[2])>0.5;
    for(let k=1;k<=ns;k++){const t=k/ns,x=a[1]+(b[1]-a[1])*t,y=a[2]+(b[2]-a[2])*t,z=a[3]+(b[3]-a[3])*t;
      if(!b[0])visit(ZP,x,y,z,(c,zc)=>{const e=ZP.h[c]-zc;if(e>0.1)pen+=L2/ns/((2*n+1)**2);});
      if(horiz){let d=0;visit(ZS,x,y,z,(c,zc)=>{const e=Hs[c]-zc;if(e>d)d=e;});if(d>0.6&&d>rapH){rapH=d;rapHAt=[x,y,z,i];}}
      if(!b[0])visit(ZS,x,y,z,(c,zc)=>{if(zc<Hs[c])Hs[c]=zc;});}}
  A(pen<0.01,'aucune avance à travers la pièce');
  A(rapH===0,'aucun rapide horizontal dans la matière restante du brut'+(rapHAt?' (pire '+rapH.toFixed(2)+' mm en '+rapHAt.map(v=>+v.toFixed(1)).join(',')+')':''));
  console.log('  · simulation : '+r.sim.full+' colonnes pleines sur '+r.sim.cols);
  A(r.sim.full<0.05*r.sim.cols,'simulation : matière de départ = dessus du corps-brut (pas la boîte pleine)');
  console.log(ko?'ÉCHEC '+ko:'OK');
  process.exit(ko?1:0);
})();
