// Répétition : OPÉRATION « Unir » / « Nouveau corps » (V0.15.10), noyau OCCT réel.
// Plot 10 × 10 × 10 percé Ø4 dans « Plaque ». Répétition linéaire de 3 le long de X au pas de 20.
// Unir : un seul corps, 3 plots. Nouveau corps : 1 + 2 corps, un plot percé chacun, ids stables
// d'une régénération à l'autre, nom donné conservé ; quantité réduite → corps en trop retiré ;
// retour à Unir → corps neufs retirés ; symétrie double → 3 corps neufs (image de l'image à part) ;
// perçage seul en nouveau corps → signalé vide ; relecture JSON ; suppression de la répétition →
// corps retirés sauf celui qui porte une fonction ajoutée ; suppression d'un corps d'exemplaire refusée.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};confirm=function(){return true;};',ctx);
  const R=String.raw`
    const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};const near=(a,b,t)=>Math.abs(a-b)<(t||1e-3);
    const base=id=>({id,name:id,plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],constraints:[],dims:[],seq:20,visible:false});
    docResetEmpty();doc.name='Banc';
    doc.sketches=[Object.assign(base('skA'),{points:{a:{x:0,y:0},b:{x:10,y:0},c:{x:10,y:10},d:{x:0,y:10}},
      entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}]}),
      Object.assign(base('skH'),{origin:[0,0,10],points:{p:{x:5,y:5}},entities:[{id:'c1',t:'circle',pc:'p',r:2}]})];
    doc.bodies=[{id:'b1',name:'Plaque',c:null,color:0xff0000}];doc.bodySeq=2;doc.activeBody='b1';
    doc.features=[{id:'F1',type:'extrude',name:'Plot',sketchId:'skA',distance:10,op:'add',visible:true,body:'b1'},
                  {id:'F2',type:'extrude',name:'Trou',sketchId:'skH',distance:-10,op:'cut',visible:true,body:'b1'}];
    ensureBodies();markDirty();rebuild();
    const vols=()=>{let FR=null;const m={};try{FR=occFinalShape(null);(FR.perBody||[]).forEach(pb=>{if(pb&&pb.shape)m[pb.bodyId]=occCoqueVolume(pb.shape);});}catch(e){m.err=String(e);}try{occCleanup(FR,null);}catch(e){}return m;};
    const tot=m=>Object.keys(m).filter(k=>k!=='err').reduce((s,k)=>s+m[k],0);
    const trou=Math.PI*4*10,plot=1000-trou;
    let v=vols();A(near(tot(v),plot,1e-2),'0 : un plot percé — '+tot(v).toFixed(3)+' '+JSON.stringify(Object.keys(v)));
    const rp={id:'rp1',type:'repeat',name:'',mode:'lin',copies:2,q:1,dist:20,axis:'X',base:['F1','F2'],children:[],visible:true,body:'b1'};
    rp.name=repTypeName(rp.mode,rp);
    doc.features.push(rp);repGenChildren(rp);markDirty();rebuild();
    const kids=()=>doc.features.filter(f=>f.repeatId==='rp1');
    v=vols();
    A(doc.bodies.length===1&&kids().every(k=>k.body==='b1')&&near(tot(v),3*plot,1e-2),'1 : Unir (défaut) — un seul corps, 3 plots percés ('+tot(v).toFixed(2)+')');
    rp.op='new';repGenChildren(rp);markDirty();rebuild();
    v=vols();
    const nb=[...new Set(kids().map(k=>k.body))];
    A(doc.bodies.length===3&&nb.length===2&&nb.indexOf('b1')<0,'2 : Nouveau corps — 2 corps créés ('+doc.bodies.map(b=>b.name).join(', ')+')');
    A(Object.keys(v).length===3&&Object.keys(v).every(k=>near(v[k],plot,1e-2)),'3 : chaque corps porte un plot percé — '+JSON.stringify(v));
    A(doc.bodies.slice(1).every(b=>b.color===0xff0000)&&doc.bodies[1].name==='Plaque (rép 1)','4 : couleur héritée du corps source, nom « '+doc.bodies[1].name+' »');
    const ids0=doc.bodies.map(b=>b.id).join(',');doc.bodies[2].name='Mon plot';
    rp.dist=25;repGenChildren(rp);markDirty();rebuild();
    A(doc.bodies.map(b=>b.id).join(',')===ids0&&doc.bodies[2].name==='Mon plot','5 : régénération (pas 25) — mêmes ids de corps, nom donné conservé');
    A(!!repBodyOwner(doc.bodies[1].id)&&!repBodyOwner('b1'),'6 : repBodyOwner reconnaît un corps d’exemplaire');
    const nB=doc.bodies.length;delBody(doc.bodies[1].id);
    A(doc.bodies.length===nB,'7 : suppression d’un corps d’exemplaire refusée (la répétition le régénère)');
    rp.copies=1;repGenChildren(rp);markDirty();rebuild();
    A(doc.bodies.length===2&&Object.keys(rp.bodyMap).length===1,'8 : quantité 2 → 1 corps neuf, le corps en trop est retiré');
    // relecture
    const s=docSnap();docResetEmpty();docApplySnap(s);
    const rp2=doc.features.find(f=>f.id==='rp1');
    v=vols();
    A(rp2&&rp2.op==='new'&&doc.bodies.length===2&&Object.keys(v).length===2,'9 : relu depuis le JSON — opération et corps conservés');
    rp2.copies=2;repGenChildren(rp2);markDirty();rebuild();
    delete rp2.op;repGenChildren(rp2);markDirty();rebuild();
    v=vols();
    A(doc.bodies.length===1&&!rp2.bodyMap&&near(tot(v),3*plot,1e-2),'10 : retour à Unir — corps neufs retirés, 3 plots dans « Plaque »');
    // symétrie double en nouveau corps : 3 images, 3 corps
    rp2.mode='mir';rp2.plane='YZ';rp2.plane2='XZ';rp2.op='new';rp2.name=repTypeName(rp2.mode,rp2);repGenChildren(rp2);markDirty();rebuild();
    v=vols();
    A(doc.bodies.length===4&&Object.keys(v).length===4&&Object.keys(v).every(k=>near(v[k],plot,1e-2)),'11 : symétrie double — 3 corps neufs, image de l’image à part ('+doc.bodies.map(b=>b.name).join(', ')+')');
    rp2.base=['F2'];
    A(repNewBodyEmpty(rp2),'12 : perçage seul en nouveau corps → signalé vide');
    rp2.base=['F1','F2'];repGenChildren(rp2);
    const keepB=doc.bodies[1].id;
    doc.features.push({id:'U1',type:'extrude',name:'Ajout',sketchId:'skA',distance:5,op:'add',visible:true,body:keepB});
    delFeature(rp2);markDirty();rebuild();
    A(doc.bodies.length===2&&doc.bodies.some(b=>b.id===keepB),'13 : répétition supprimée — corps neufs retirés, sauf celui qui porte une fonction ajoutée');
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== Répétition : Unir / Nouveau corps ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
