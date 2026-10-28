// Corps et TEMPS (V0.15.12), noyau OCCT réel. Plot 10×10×10 dans « Plaque », répété en
// « Nouveau corps » (2 corps neufs). Marqueur reculé avant la répétition : le corps actif (un
// corps d'exemplaire, pas encore né) retombe sur « Plaque », une fonction ajoutée y naît, et
// l'activation d'un corps pas encore né est refusée ; marqueur levé → choix rendu.
// Découpe multi-corps : poche traversant les 3 corps → « son corps seul », « tous les corps
// visibles » (f.cutBodies), « un corps en particulier » ; corps masqué hors des candidats.
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
    // fente 50×2 traversant les 3 plots (x 0..10, 20..30, 40..50), y 4..6
    doc.sketches=[Object.assign(base('skA'),{points:{a:{x:0,y:0},b:{x:10,y:0},c:{x:10,y:10},d:{x:0,y:10}},
      entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}]}),
      Object.assign(base('skS'),{origin:[0,0,10],points:{a:{x:-1,y:4},b:{x:51,y:4},c:{x:51,y:6},d:{x:-1,y:6}},
      entities:[{id:'m1',t:'line',p1:'a',p2:'b'},{id:'m2',t:'line',p1:'b',p2:'c'},{id:'m3',t:'line',p1:'c',p2:'d'},{id:'m4',t:'line',p1:'d',p2:'a'}]})];
    doc.bodies=[{id:'b1',name:'Plaque',c:null}];doc.bodySeq=2;doc.activeBody='b1';
    doc.features=[{id:'F1',type:'extrude',name:'Plot',sketchId:'skA',distance:10,op:'add',visible:true,body:'b1'}];
    const rp={id:'rp1',type:'repeat',name:'Rép',mode:'lin',copies:2,q:1,dist:20,axis:'X',base:['F1'],children:[],visible:true,body:'b1',op:'new'};
    doc.features.push(rp);ensureBodies();repGenChildren(rp);markDirty();rebuild();
    const vols=()=>{let FR=null;const m={};try{FR=occFinalShape(null);(FR.perBody||[]).forEach(pb=>{if(pb&&pb.shape)m[pb.bodyId]=occCoqueVolume(pb.shape);});}catch(e){m.err=String(e);}try{occCleanup(FR,null);}catch(e){}return m;};
    const bN=doc.bodies.map(b=>b.id);
    A(bN.length===3,'0 : répétition « Nouveau corps » → 3 corps ('+doc.bodies.map(b=>b.name).join(', ')+')');
    // ── antériorité ──
    const last=bN[2];
    A(tlActivateBody(last)&&doc.activeBody===last,'1 : marqueur à la fin — le dernier corps s’active');
    A(!bodyBornAt(last,doc.features.indexOf(rp))&&bodyBornAt('b1',doc.features.indexOf(rp)),'2 : avant la répétition, le corps d’exemplaire n’est pas né, « Plaque » oui');
    tlSetPtr(rp);
    A(doc.activeBody==='b1','3 : marqueur reculé avant la répétition → corps actif = « Plaque » (corps source), pas « '+last+' »');
    A(!tlActivateBody(last)&&doc.activeBody==='b1','4 : activer un corps pas encore né est refusé');
    const nf={id:'H1',type:'extrude',name:'Ajout',sketchId:'skA',distance:2,op:'add',visible:true};
    addFeature(nf);
    A(nf.body==='b1'&&doc.features.indexOf(nf)<doc.features.indexOf(rp),'5 : la fonction ajoutée naît dans « Plaque », avant la répétition');
    doc.features=doc.features.filter(f=>f.id!=='H1');
    tlSetPtr(null);
    A(doc.activeBody===last,'6 : marqueur levé → le corps choisi par l’utilisateur redevient actif');
    // corps vide créé à la main : toujours né
    A(bodyBornAt('zz',0)===true,'7 : un corps sans fonction existe à tout instant');
    // ── découpe multi-corps ──
    doc.activeBody='b1';
    const cut={id:'C1',type:'extrude',name:'Fente',sketchId:'skS',distance:-10,op:'cut',visible:true,body:'b1'};
    doc.features.push(cut);markDirty();rebuild();
    let v=vols();const fente=10*2*10,plot=1000;
    A(near(v.b1,plot-fente,1e-2)&&near(v[bN[1]],plot,1e-2),'8 : son corps seul — seule « Plaque » est fendue '+JSON.stringify(v));
    const cand=cutBodyCandidates(cut).map(e=>e.id);
    A(cand.length===3,'9 : 3 corps visibles candidats');
    A(!!cutBodiesField(cut),'10 : la ligne « Corps visés » est proposée');
    cut.cutBodies=cand.filter(b=>b!=='b1');markDirty();rebuild();v=vols();
    A(bN.every(b=>near(v[b],plot-fente,1e-2)),'11 : tous les corps visibles — les 3 sont fendus '+JSON.stringify(v));
    delete cut.cutBodies;cut.body=bN[1];markDirty();rebuild();v=vols();
    A(near(v.b1,plot,1e-2)&&near(v[bN[1]],plot-fente,1e-2)&&near(v[bN[2]],plot,1e-2),'12 : un corps en particulier — seul « '+bN[1]+' » est fendu');
    doc.bodyVis={};doc.bodyVis[bN[2]]=false;
    A(cutBodyCandidates(cut).every(e=>e.id!==bN[2]),'13 : un corps masqué n’est pas proposé');
    doc.bodyVis={};
    cut.body='b1';cut.cutBodies=[bN[1],bN[2]];
    const s=docSnap();docResetEmpty();docApplySnap(s);markDirty();rebuild();v=vols();
    A(bN.every(b=>near(v[b],plot-fente,1e-2)),'14 : relu depuis le JSON — découpe multi-corps conservée');
    // les exemplaires « Nouveau corps » d'une découpe multi-corps ne visent que leur corps
    const rp2=doc.features.find(f=>f.id==='rp1');rp2.base=['F1','C1'];
    doc.features=doc.features.filter(f=>f.id!=='C1');doc.features.splice(1,0,Object.assign({},cut));
    repGenChildren(rp2);
    A(doc.features.filter(f=>f.repeatId==='rp1'&&f.type==='extrude'&&f.op==='cut').every(k=>!k.cutBodies),'15 : copie « Nouveau corps » d’une découpe multi-corps — ne vise que son corps');
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== Corps et temps : antériorité, découpe multi-corps ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
