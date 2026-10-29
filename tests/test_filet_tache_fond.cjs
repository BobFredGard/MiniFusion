// V0.21.19 : filets modélisés calculés en TÂCHE DE FOND (worker de src/21).
// Le harnais n'a pas de Worker : même worker_threads que test_suppression_face_worker, qui
// exécute le VRAI code du worker (delWkSource) avec un VRAI noyau OCCT.
// 1. Bloc 60×40×20 + M8 modélisé borgne : le rejeu rend la main tout de suite — pièce sans
//    filets (avant-trou au Ø de perçage exact), filet cosmétique affiché, travail envoyé.
// 2. À la réponse : un seul solide, gorge hélicoïdale présente, filet cosmétique retiré ;
//    la FAO voit l'avant-trou exact (corps sans filets).
// 3. Rejeu suivant : résultat repris du cache, aucun nouveau travail.
// 4. Modification pendant le calcul : le travail caduc est abandonné, seul le dernier compte.
const fs=require('fs'),vm=require('vm'),path=require('path');
const {Worker:NodeWorker}=require('worker_threads');
const ROOT=path.join(__dirname,'..'),OCCT=path.join(ROOT,'occt');
globalThis.__dirname=OCCT;
vm.runInThisContext(fs.readFileSync(path.join(OCCT,'opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  ✗ '+m);}else console.log('  ✓ '+m);};

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
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};window.confirm=function(){return true;};',ctx);
  const body=`
    const out={};
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    const attendre=async(c,ms)=>{const t=Date.now();while(!c()&&Date.now()-t<ms)await sleep(50);return c();};
    const box={id:'skB',name:'Bloc',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{a:{x:0,y:0},b:{x:60,y:0},c:{x:60,y:40},d:{x:0,y:40}},
      entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],constraints:[],dims:[],seq:20,visible:false};
    const hs={id:'s1',name:'s1',plane:'XY',origin:[0,0,20],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{h0:{x:30,y:20}},
      entities:[{id:'e0',t:'cpoint',p:'h0',hole:true}],constraints:[],dims:[],seq:30,visible:false};
    doc.sketches=[box,hs];
    doc.features=[{id:'E',type:'extrude',name:'Bloc',sketchId:'skB',distance:20,op:'add',visible:true}];
    doc.bodies=[];delete doc.activeBody;markDirty();rebuild();
    askHole('s1');const f=doc.features[doc.features.length-1];
    f.d=tapDrill('M8',1.25);f.end='blind';f.depth=16;f.tip=118;
    f.thread={size:'M8',p:1.25,len:10,lenMode:'len',model:true,clear:0};f.name=holeName(f);
    out.usable=delWkUsable();
    const st=(x,y,z)=>{const cl=new occt.BRepClass3d_SolidClassifier_2(occLive.shape);const p=new occt.gp_Pnt_3(x,y,z);cl.Perform(p,1e-6);const s=cl.State();p.delete();cl.delete();return s;};
    const OUT=occt.TopAbs_State.TopAbs_OUT;
    const usinee=z=>{const cl=new occt.BRepClass3d_SolidClassifier_2(occLive.shape);let n=0;for(let k=0;k<72;k++){const a=k/72*Math.PI*2;const p=new occt.gp_Pnt_3(30+3.75*Math.cos(a),20+3.75*Math.sin(a),z);cl.Perform(p,1e-6);if(cl.State()===OUT)n++;p.delete();}cl.delete();return n/72;};
    const t0=Date.now();markDirty();rebuild();
    out.t1={ms:Date.now()-t0,pend:occThrPending,file:delWkPending(),usinee:usinee(15),axe:st(30,20,10)===OUT,
      cosm:(holeThreadPaths()||[]).length};
    out.t2={fini:await attendre(()=>!delWkPending()&&!occThrPending,240000)};
    await sleep(200);
    const nS=(()=>{const e=new occt.TopExp_Explorer_2(occLive.shape,occt.TopAbs_ShapeEnum.TopAbs_SOLID,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);let n=0;for(;e.More();e.Next())n++;e.delete();return n;})();
    faoHoleCache={shape:null,list:null};const H=faoHolesDetect();
    Object.assign(out.t2,{solides:nS,usinee:usinee(15),axe:st(30,20,10)===OUT,cosm:(holeThreadPaths()||[]).length,
      fao:H.map(h=>h.d+'@'+h.x+','+h.y+(h.feat&&h.feat.thread?' '+h.feat.thread.size:'')).join(' ')});
    const j0=__stats.jobs;markDirty();rebuild();
    out.t3={jobs:__stats.jobs-j0,pend:occThrPending,usinee:usinee(15)};
    // 4 : deux modifications coup sur coup — seule la dernière est calculée
    const j1=__stats.jobs,k1=__stats.terminated;
    f.thread.len=8;markDirty();rebuild();
    await sleep(300);
    f.thread.len=12;markDirty();rebuild();
    out.t4={fini:await attendre(()=>!delWkPending()&&!occThrPending,240000)};
    await sleep(200);
    Object.assign(out.t4,{jobs:__stats.jobs-j1,arrets:__stats.terminated-k1,usinee9:usinee(9),usinee7:usinee(6.5)});
    try{if(delWk)delWkStop(delWk);}catch(e){}
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx);
  console.log('=== V0.21.19 : filets modélisés en tâche de fond ===');
  console.log('  '+JSON.stringify(o));
  A(o.usable,'worker utilisable (delWkUsable)');
  A(o.t1.pend&&o.t1.file>=1,'1a : rejeu rendu tout de suite ('+o.t1.ms+' ms), filets envoyés au worker');
  A(o.t1.usinee<0.02&&o.t1.axe,'1b : pièce affichée sans filets, avant-trou ouvert');
  A(o.t1.cosm>0,'1c : filet cosmétique affiché pendant le calcul');
  A(o.t2.fini,'2a : réponse du worker reçue');
  A(o.t2.solides===1&&o.t2.usinee>0.15&&o.t2.usinee<0.8&&o.t2.axe,'2b : un seul solide, gorge hélicoïdale ('+Math.round(o.t2.usinee*100)+' %)');
  A(o.t2.cosm===0,'2c : filet cosmétique retiré une fois le filet creusé');
  A(/^6\.75@30,20 M8/.test(o.t2.fao),'2d : FAO sur le corps sans filets : avant-trou Ø6,75 taraudé M8 ('+o.t2.fao+')');
  A(o.t3.jobs===0&&!o.t3.pend&&o.t3.usinee>0.15,'3 : rejeu suivant repris du cache, aucun nouveau calcul');
  A(o.t4.fini&&o.t4.usinee9>0.15&&o.t4.usinee7<0.02,'4a : après deux modifications, le filet suit la DERNIÈRE longueur (12 mm)');
  A(o.t4.arrets>=1,'4b : travail caduc abandonné ('+o.t4.jobs+' envoi(s), '+o.t4.arrets+' arrêt(s))');
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
