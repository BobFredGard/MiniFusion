// V0.11.30 : RÉPÉTER UNE RÉPÉTITION, noyau OCCT réel. Plaque 100 × 100 × 10, un perçage Ø6
// traversant en (10, 10). rp1 : 3 le long de X au pas de 20 (3 perçages). rp2 répète rp1 le long
// de Y, 2 au pas de 25 → le motif ENTIER (source + 2 instances) est recopié : 6 perçages.
// Contrôles : instances, volume exact, cascade (rp1 passe à 4 → rp2 suit : 8 perçages), symétrie
// d'une répétition, relecture, et aperçu rouge = les fonctions cochées seules (pas le corps).
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
    doc.sketches=[Object.assign(base('skA'),{points:{a:{x:0,y:0},b:{x:100,y:0},c:{x:100,y:100},d:{x:0,y:100}},
      entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}]}),
      Object.assign(base('skH'),{origin:[0,0,10],points:{p:{x:10,y:10}},entities:[{id:'c1',t:'circle',pc:'p',r:3}]})];
    doc.bodies=[{id:'b1',name:'Plaque',c:null}];doc.bodySeq=2;doc.activeBody='b1';
    doc.features=[{id:'F1',type:'extrude',name:'Plaque',sketchId:'skA',distance:10,op:'add',visible:true,body:'b1'},
                  {id:'F2',type:'extrude',name:'Perçage',sketchId:'skH',distance:-10,op:'cut',visible:true,body:'b1'}];
    ensureBodies();markDirty();rebuild();
    const vol=()=>{let FR=null,v=0;try{FR=occFinalShape(null);(FR.perBody||[]).forEach(pb=>{if(pb&&pb.shape)v+=occCoqueVolume(pb.shape);});}catch(e){}try{occCleanup(FR,null);}catch(e){}return v;};
    const trou=Math.PI*9*10,plein=100*100*10;
    const rp1={id:'rp1',type:'repeat',name:'Linéaire',mode:'lin',copies:2,q:1,dist:20,axis:'X',base:['F2'],children:[],visible:true};
    doc.features.push(rp1);repGenChildren(rp1);markDirty();rebuild();
    A(near(vol(),plein-3*trou,1e-3),'0 : rp1 seule — 3 perçages');
    A(repCanFeature('rp1'),'1 : une répétition est proposée comme source');
    A(!repCanFeature(doc.features.find(f=>f.repeatId==='rp1').id),'1b : ses instances, non (elles viennent avec elle)');
    const rp2={id:'rp2',type:'repeat',name:'Linéaire',mode:'lin',copies:1,q:1,dist:25,axis:'Y',base:['rp1'],children:[],visible:true};
    doc.features.push(rp2);repGenChildren(rp2);markDirty();rebuild();
    const kids=id=>doc.features.filter(f=>f.repeatId===id);
    A(kids('rp2').length===3,'2 : rp2 recopie le motif entier (source + 2 instances) : '+kids('rp2').length+' instance(s)');
    const ctr=kids('rp2').map(k=>{const s=doc.sketches.find(x=>x.id===k.sketchId);return (s.origin[0]+10)+','+(s.origin[1]+10);}).sort();
    A(JSON.stringify(ctr)===JSON.stringify(['10,35','30,35','50,35']),'3 : centres des copies (10,35) (30,35) (50,35) — '+ctr.join(' '));
    A(near(vol(),plein-6*trou,1e-3),'4 : volume exact, 6 perçages — '+vol().toFixed(3));
    // cascade : rp1 passe à 4 au total → rp2 suit
    rp1.copies=3;repGenChildren(rp1);repSyncForFeature(rp1);markDirty();rebuild();
    A(kids('rp2').length===4&&near(vol(),plein-8*trou,1e-3),'5 : rp1 à 4 → rp2 suit en cascade : 8 perçages ('+kids('rp2').length+' instances)');
    // et via le rejeu seul (signature du motif développé)
    rp1.copies=2;repGenChildren(rp1);markDirty();rebuild();
    A(kids('rp2').length===3&&near(vol(),plein-6*trou,1e-3),'6 : rp1 revient à 3 → rp2 régénérée au rejeu (6 perçages)');
    // symétrie d'une répétition (YZ) : rp2 cochée avec rp1 et F2, qu'elle contient déjà — chaque
    // fonction du motif n'est recopiée qu'une fois
    const rp3={id:'rp3',type:'repeat',name:'Symétrie',mode:'mir',plane:'YZ',copies:1,q:1,base:['rp2','rp1','F2'],children:[],visible:true};
    doc.features.push(rp3);repGenChildren(rp3);
    A(kids('rp3').length===6,'7 : symétrie de rp2 (+ rp1 + F2 cochées, sans doublon) : '+kids('rp3').length+' instance(s)');
    // relecture
    const s=docSnap();docResetEmpty();docApplySnap(s);markDirty();rebuild();
    A(kids('rp2').length===3&&kids('rp3').length===6,'8 : document relu : instances gardées');
    // aperçu rouge : les fonctions cochées, pas le corps
    doc.features=doc.features.filter(f=>f.id!=='rp3'&&f.repeatId!=='rp3');markDirty();rebuild();
    repMode={type:'lin',copies:1,dist:30,axis:'Y',plane:'YZ',feats:['rp2']};
    const it=repPreviewSources();
    A(it.length===6&&it.every(x=>!x.mw),'9 : aperçu de rp2 = 6 solides-outils (motif entier), pas la plaque : '+it.length);
    repMode.feats=['F2'];
    A(repPreviewSources().length===1,'10 : aperçu du perçage seul = 1 solide-outil');
    repMode.feats=[];
    A(repPreviewSources().length===0,'11 : rien de coché = rien en rouge');
    repPreviewSrcFree();repMode=null;
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== V0.11.30 : répéter une répétition ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
