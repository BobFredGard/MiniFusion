// 2026-10-22-010 : mise en plan d'un import STEP — le HLR exact OCCT doit lire le
// solide exact de l'import (importGeom.brep). Seul bd.shape était lu : la vue
// d'un STEP retombait sur le maillage d'affichage et dessinait ses triangles
// (retour : « la mise en plan est très facétisée »).
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  ✗ '+m);}else console.log('  ✓ '+m);};
(async()=>{
  const STEP=path.join(ROOT,'Exemples','RETARD.step');
  if(!fs.existsSync(STEP)){console.log('  (RETARD.step absent — test ignoré)');console.log('OK');process.exit(0);}
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  const T0=sandbox.THREE;
  class BG{constructor(){this.attributes={};this.userData={};this.index=null;}
    setAttribute(n,a){this.attributes[n]=a;return this;} getAttribute(n){return this.attributes[n];}
    setIndex(i){this.index=i;return this;} computeVertexNormals(){} computeBoundingBox(){} computeBoundingSphere(){} dispose(){}}
  class F32{constructor(a,n){this.array=Float32Array.from(a);this.itemSize=n;this.count=this.array.length/n;}
    getX(i){return this.array[i*3];} getY(i){return this.array[i*3+1];} getZ(i){return this.array[i*3+2];}}
  sandbox.THREE=new Proxy({},{get(t,k){if(k==='BufferGeometry')return BG;if(k==='Float32BufferAttribute')return F32;return T0[k];}});
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};window.confirm=function(){return true;};showAll=function(){};',ctx);
  sandbox.__part=fs.readFileSync(STEP).buffer;
  const r=await vm.runInContext(`(async()=>{
    await importSTEP({name:'RETARD.step',arrayBuffer:async()=>__part});
    try{markDirty();rebuild();}catch(e){}
    const imp=bodies.find(b=>b.kind==='import');
    const e=imp?importGeom.get(imp.ref||imp.id):null;
    const out={imp:!!imp,brep:!!(e&&e.brep)};
    try{mepSetActive(true);}catch(err){out.err='mepSetActive '+err.message;}
    const mk=function(id,exact){return {id:id,kind:'base',dir:[-1,0,0],u:[0,1,0],v:[0,0,1],x:0,y:0,scale:1,
      mode:'hide',tangent:false,hlrExact:exact,flip:false};};
    try{const g=window.__mepTest.geo(mk('vx',true));out.src=g.src;out.n=g.els.length;}catch(err){out.err=(out.err||'')+' geo '+err.message;}
    try{const g=window.__mepTest.geo(mk('vm',false));out.srcM=g.src;out.nM=g.els.length;}catch(err){out.err=(out.err||'')+' geoM '+err.message;}
    // 2026-10-22-012 : axes des cylindres du STEP (alésage d'axe X)
    try{out.cyls=window.__mepTest.shapeCyls(imp).map(g=>({d:g.d.map(x=>+x.toFixed(3)),r:+g.r.toFixed(2),L:+(g.t1-g.t0).toFixed(1)}));}catch(err){out.err=(out.err||'')+' cyls '+err.message;}
    const ax=function(dir,u,v2){const w=mk('va'+dir.join(''),true);w.dir=dir;w.u=u;w.v=v2;w.autoAxes=true;
      let ps=[];try{ps=window.__mepTest.axisAuto(w);}catch(err){out.err=(out.err||'')+' auto '+err.message;}
      return {lines:ps.filter(p=>p.t==='L'&&p.cls==='mepAxis').length,cross:ps.filter(p=>p.cls==='mepAxisCross').length};};
    out.bout=ax([-1,0,0],[0,1,0],[0,0,1]);
    out.cote=ax([0,-1,0],[1,0,0],[0,0,1]);
    // axe de symétrie : parallèles (médiane) et sécantes (bissectrice)
    out.symP=window.__mepTest.axisSym({x1:0,y1:0,x2:20,y2:0},{x1:20,y1:10,x2:0,y2:10},{scale:1});
    out.symS=window.__mepTest.axisSym({x1:0,y1:0,x2:10,y2:0},{x1:0,y1:0,x2:0,y2:10},{scale:1});
    return out;
  })()`,ctx);
  if(r.err)console.log('  (info) '+r.err);
  console.log('  · vue de côté RETARD : HLR exact « '+r.src+' » '+r.n+' segments ; repli maillage « '+r.srcM+' » '+r.nM+' segments');
  A(r.imp&&r.brep,'import STEP avec solide exact (importGeom.brep)');
  A(r.src==='OCCT HLR','la vue d’un STEP passe par le HLR exact OCCT (plus le maillage d’affichage)');
  console.log('  · cylindres du STEP : '+JSON.stringify(r.cyls)+' ; vue de bout '+JSON.stringify(r.bout)+' ; vue de côté '+JSON.stringify(r.cote));
  A(Array.isArray(r.cyls)&&r.cyls.some(c=>Math.abs(Math.abs(c.d[0])-1)<1e-3),'cylindre d’axe X reconnu sur le STEP (alésage)');
  A(r.bout&&r.bout.cross>0,'vue de bout : croix de centre sur le cylindre du STEP');
  A(r.cote&&r.cote.lines>0,'vue de côté : trait d’axe sur le cylindre du STEP');
  const P=r.symP,S=r.symS;
  console.log('  · symétrie parallèles '+JSON.stringify(P)+' ; sécantes '+JSON.stringify(S));
  A(P&&Math.abs(P.a.y-5)<1e-6&&Math.abs(P.b.y-5)<1e-6&&Math.abs(Math.min(P.a.x,P.b.x)+3)<1e-6&&Math.abs(Math.max(P.a.x,P.b.x)-23)<1e-6,'axe de symétrie de 2 parallèles : médiane y=5, de −3 à 23 (dépassement 3)');
  A(S&&Math.abs(S.b.x-S.b.y)<1e-6&&S.b.x>0,'axe de symétrie de 2 sécantes : bissectrice à 45°');
  console.log(ko?'ÉCHEC '+ko:'OK');
  process.exit(ko?1:0);
})();
