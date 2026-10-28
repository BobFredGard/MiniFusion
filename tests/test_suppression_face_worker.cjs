// V0.15.8 : suppression de face dans un Web Worker (src/21-suppression-face-calcul.js).
// Le harnais n'a pas de Worker : on en fournit un, bâti sur worker_threads, qui exécute le
// VRAI code du worker (delWkSource) avec un VRAI noyau OCCT chargé dans le thread.
// 1. Boîte 100×60×40 percée Ø10 (STEP) : Suppr sur le trou → le rejeu rend la main tout de
//    suite (⏳ « calcul en cours »), le corps reste affiché sans la suppression ; à la
//    réponse, même solide que le calcul synchrone (6 faces, 240 000 mm³).
// 2. Cache : points de contrôle vidés puis rejeu complet → résultat repris du cache par
//    ckKey, aucun nouveau calcul envoyé au worker.
// 3. Délai : Cavité Usinage.step, 5ᵉ face non plane (cylindre 33×33×23 : ~10 min puis
//    plantage du noyau en synchrone) → abandon propre au délai (3 s ici), ⚠ « temps
//    raisonnable », pièce intacte ; le worker suivant repart et supprime une face ordinaire.
const fs=require('fs'),vm=require('vm'),path=require('path');
const {Worker:NodeWorker}=require('worker_threads');
const ROOT=path.join(__dirname,'..'),OCCT=path.join(ROOT,'occt');
globalThis.__dirname=OCCT;
vm.runInThisContext(fs.readFileSync(path.join(OCCT,'opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  ✗ '+m);}else console.log('  ✓ '+m);};

// ── Worker du navigateur, version worker_threads ──
const stats={created:0,jobs:0,terminated:0};
const blobs=new Map();
class Blob{constructor(parts){this.text=parts.join('');}}
const URLs={createObjectURL(b){const k='blob:t'+blobs.size;blobs.set(k,b.text);return k;}};
const PRE=`const {parentPort}=require('worker_threads');const fs=require('fs'),path=require('path'),vm=require('vm');
globalThis.require=require;globalThis.self=globalThis;globalThis.__dirname=${JSON.stringify(OCCT)};
const lire=u=>fs.readFileSync(path.join(${JSON.stringify(OCCT)},path.basename(String(u))));
self.postMessage=m=>parentPort.postMessage(m);
self.importScripts=u=>vm.runInThisContext(lire(u).toString('utf8'),{filename:'occt.js'});
globalThis.fetch=async u=>({arrayBuffer:async()=>{const b=lire(u);return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);}});
parentPort.on('message',d=>self.onmessage&&self.onmessage({data:d}));
`;
class Worker{
  constructor(url){
    stats.created++;
    this.nw=new NodeWorker(PRE+blobs.get(url),{eval:true});
    this.nw.on('message',d=>this.onmessage&&this.onmessage({data:d}));
    this.nw.on('error',e=>this.onerror&&this.onerror({message:String((e&&e.message)||e),preventDefault(){}}));
  }
  postMessage(m){if(m&&m.t==='job')stats.jobs++;this.nw.postMessage(m);}
  terminate(){stats.terminated++;this.nw.terminate();}
}

(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(OCCT,'opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;sandbox.Worker=Worker;sandbox.Blob=Blob;sandbox.URL=URLs;sandbox.__stats=stats;
  sandbox.__cavite=(()=>{const b=fs.readFileSync(path.join(ROOT,'Exemples','Cavité Usinage.step'));return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);})();
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};window.confirm=function(){return true;};',ctx);
  sandbox.__step=vm.runInContext(`(function(){
    const b=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),100,60,40).Shape();
    const c=new occt.BRepPrimAPI_MakeCylinder_3(new occt.gp_Ax2_3(new occt.gp_Pnt_3(50,30,-1),occt.gp.DZ()),5,42).Shape();
    const out=occWriteStep([occCut(b,c)],'/__d.stp');
    return out?Uint8Array.from(out).buffer:null;
  })()`,ctx);
  const body=`
    const out={};
    const FA=occt.TopAbs_ShapeEnum.TopAbs_FACE,SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
    const nFaces=s=>{let n=0;const x=new occt.TopExp_Explorer_2(s,FA,SH);while(x.More()){n++;x.Next();}x.delete();return n;};
    const vol=s=>{const p=new occt.GProp_GProps_1();occt.BRepGProp.VolumeProperties_1(s,p,false,false,false);const v=p.Mass();p.delete();return v;};
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    const attendre=async(c,ms)=>{const t=Date.now();while(!c()&&Date.now()-t<ms)await sleep(50);return c();};
    const corps=()=>{const b=bodies.find(x=>x.kind==='body');return b&&b.shape?{faces:nFaces(b.shape),vol:vol(b.shape)}:null;};
    // Import d'un STEP seul + sélection de la face de rang k (groupes de 10 triangles par face,
    // dans l'ordre d'exploration, comme test_suppression_face_step).
    const importer=async(nom,buf)=>{
      doc.features=[];markDirty();rebuild();
      await importSTEP({name:nom,arrayBuffer:async()=>buf});
      const f=doc.features.find(x=>x.type==='import');const ent=importGeom.get(f.id);
      const n=nFaces(ent.brep);
      f._mesh.geometry={userData:{occGroups:Array.from({length:n},(_,k)=>({start:k*10,count:10,f:k}))}};
      return{f,ent,n};
    };
    const suppr=(imp,k)=>{
      selFaces=[{mesh:imp.f._mesh,faceIndex:k*10}];
      const t=Date.now();deleteSelectedFaces();
      return{ms:Date.now()-t,msg:String(faceEl.textContent||''),d:doc.features.filter(x=>x.type==='xdelface').pop()};
    };
    const synchrone=(imp,k)=>{
      const s=occShapeCopy(imp.ent.brep),fc=occFaceAt(imp.ent.brep,k),ref=occFaceRefAny(fc);fc.delete();
      const h=occFindFaceAny(s,ref),r=occDelFacesTry(s,[h]);h.delete();
      const o=r.r?{faces:nFaces(r.r),vol:vol(r.r)}:{err:r.err};
      if(r.r)r.r.delete();s.delete();return o;
    };
    out.usable=delWkUsable();

    // ── 1. boîte percée : calcul au worker, même résultat que le synchrone ──
    {
      const imp=await importer('perce.stp',__step);
      let k=-1;for(let i=0;i<imp.n&&k<0;i++){const fc=occFaceAt(imp.ent.brep,i);if(occSurfKind(fc)==='Cylinder')k=i;fc.delete();}
      out.ref1=synchrone(imp,k);
      const s=suppr(imp,k);
      out.t1={ms:s.ms,calc:!!s.d._calc,msg:s.msg,icone:featIconOf(s.d),avant:corps()};
      out.t1.fini=await attendre(()=>!delWkPending()&&!s.d._calc,180000);
      out.t1.apres=corps();out.t1.m=s.d._m;out.t1.msgFin=String(faceEl.textContent||'');
      out.jobs1=__stats.jobs;
      // ── 2. cache : points de contrôle vidés, rejeu complet → aucun nouveau calcul ──
      occCkClear();builtVersion=-1;builtHash=null;builtEngine=null;rebuild();
      out.t2={jobs:__stats.jobs,calc:!!s.d._calc,c:corps()};
    }

    // ── 3. Cavité Usinage : 5ᵉ face non plane → abandon au délai ──
    {
      DEL_WK_DELAI=3000;
      const imp=await importer('Cavité Usinage.step',__cavite);
      out.nCav=imp.n;
      let k=-1,np=0;
      for(let i=0;i<imp.n&&k<0;i++){const fc=occFaceAt(imp.ent.brep,i);if(occSurfKind(fc)!=='Plane'&&++np===5){k=i;out.box=occFaceBox(fc);out.kind=occSurfKind(fc);}fc.delete();}
      const t0=Date.now();
      const s=suppr(imp,k);
      out.t3={ms:s.ms,calc:!!s.d._calc,msg:s.msg,avant:corps()};
      out.t3.fini=await attendre(()=>!delWkPending()&&!s.d._calc,240000);
      out.t3.total=Date.now()-t0;out.t3.m=s.d._m;out.t3.apres=corps();out.t3.msgFin=String(faceEl.textContent||'');
      out.t3.stop=__stats.terminated;
      // ── 4. après l'arrêt : un nouveau worker supprime une face ordinaire (rang 0) ──
      DEL_WK_DELAI=60000;
      doc.features=doc.features.filter(x=>x.type==='import');markDirty();rebuild();
      out.ref4=synchrone(imp,0);
      const s4=suppr(imp,0);
      out.t4={ms:s4.ms,calc:!!s4.d._calc};
      out.t4.fini=await attendre(()=>!delWkPending()&&!s4.d._calc,180000);
      out.t4.apres=corps();out.t4.m=s4.d._m;out.t4.created=__stats.created;
    }
    try{if(delWk)delWkStop(delWk);}catch(e){}
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx);
  const r1=x=>x?JSON.stringify({faces:x.faces,vol:x.vol!=null?+x.vol.toFixed(1):undefined,err:x.err}):'∅';
  const same=(a,b)=>a&&b&&a.faces===b.faces&&Math.abs(a.vol-b.vol)<1e-3*Math.max(1,Math.abs(b.vol));
  console.log('=== Suppression de face au worker ===');
  A(o.usable,'worker utilisable (delWkUsable)');
  console.log('--- 1. boîte percée Ø10 ---');
  A(o.t1.calc&&/calcul en cours/.test(o.t1.msg),'Suppr rend la main tout de suite avec « calcul en cours… » ('+o.t1.ms+' ms) — icône '+o.t1.icone);
  A(o.t1.avant&&o.t1.avant.faces===7,'pendant le calcul : corps affiché SANS la suppression '+r1(o.t1.avant));
  A(o.t1.fini,'réponse du worker reçue');
  A(same(o.t1.apres,o.ref1)&&o.t1.apres.faces===6&&Math.abs(o.t1.apres.vol-240000)<1,'même solide que le synchrone : '+r1(o.t1.apres)+' = '+r1(o.ref1));
  A(o.t1.m&&o.t1.m.m===1&&o.t1.m.t===1,'fonction sans ⚠ '+JSON.stringify(o.t1.m)+' — « '+o.t1.msgFin.slice(0,80)+' »');
  console.log('--- 2. cache par clé de point de contrôle ---');
  A(o.t2.jobs===o.jobs1&&!o.t2.calc,'rejeu complet sans points de contrôle : résultat repris du cache, aucun calcul relancé (travaux '+o.jobs1+' → '+o.t2.jobs+')');
  A(same(o.t2.c,o.ref1),'solide repris identique '+r1(o.t2.c));
  console.log('--- 3. Cavité Usinage, face pathologique ---');
  console.log('  face visée : '+o.kind+' '+JSON.stringify(o.box&&o.box.dim.map(v=>+v.toFixed(1)))+' sur '+o.nCav+' faces');
  A(o.t3.calc&&o.t3.ms<15000,'Suppr rend la main ('+o.t3.ms+' ms, import compris) avec « calcul en cours »');
  A(o.t3.fini&&o.t3.total<60000,'calcul abandonné au délai ('+(o.t3.total/1000).toFixed(1)+' s de bout en bout, délai 3 s, démarrage du worker compris)');
  A(o.t3.m&&o.t3.m.m===0&&/temps raisonnable/.test(o.t3.msgFin),'⚠ « '+o.t3.msgFin.slice(0,140)+' »');
  A(o.t3.stop>=1,'worker arrêté net ('+o.t3.stop+' arrêt)');
  A(o.t3.apres&&o.t3.avant&&o.t3.apres.faces===o.nCav&&o.t3.avant.faces===o.nCav,'pièce intacte ('+(o.t3.apres&&o.t3.apres.faces)+' faces)');
  console.log('--- 4. worker relancé, face ordinaire ---');
  A(o.t4.calc&&o.t4.fini,'calcul relancé et terminé ('+o.t4.created+' workers créés)');
  A(o.ref4&&!o.ref4.err?same(o.t4.apres,o.ref4)&&o.t4.m&&o.t4.m.m===1:(o.t4.m&&o.t4.m.m===0),'même résultat que le synchrone : '+r1(o.t4.apres)+' / '+r1(o.ref4));
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
