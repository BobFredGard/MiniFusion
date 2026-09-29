// Le fichier REEL de l'utilisateur (congé.json) : que donne la 30d au chargement ?
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
const json=fs.readFileSync(path.join(ROOT,'tests','fixtures','congé.json'),'utf8');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const body=[
    'const out={};',
    'await deserialise('+JSON.stringify(json)+',{rebuild:false});',
    'out.avant=doc.features.filter(f=>f.type==="xfillet").map(f=>({nom:f.name,n:f.edges.length,',
    '  sansAncre:f.edges.filter(e=>!e.anchor).length,far:f.edges.filter(e=>e.anchor&&e.anchor.far).length}));',
    'occCkClear();markDirty();rebuild();',
    'out.apres=doc.features.filter(f=>f.type==="xfillet").map(f=>({nom:f.name,n:f.edges.length,',
    '  sansAncre:f.edges.filter(e=>!e.anchor).length,far:f.edges.filter(e=>e.anchor&&e.anchor.far).length,',
    '  _m:f._m?f._m.m+"/"+f._m.t:"?"}));',
    'out.warn=[];',
    'const FR=occFinalShape(null);out.arêtes=occListEdges(FR.shape).length;occCleanup(FR,null);',
    'return out;'
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx);
  console.log('=== AVANT rejeu (tel que sauvegarde) ===');
  o.avant.forEach(f=>console.log('  '+f.nom+' | '+f.n+' aretes | sans ancre : '+f.sansAncre+' | far:1 : '+f.far));
  console.log('\n=== APRES rejeu avec 30d ===');
  o.apres.forEach(f=>console.log('  '+f.nom+' | '+f.n+' aretes | sans ancre : '+f.sansAncre+' | far:1 : '+f.far+' | appariees : '+f._m));
  console.log('\narêtes du solide final :',o.arêtes);
  if(o.warn&&o.warn.length)console.log('avertissements :\n  '+o.warn.join('\n  '));
  else console.log('avertissements : aucun');
  process.exit(0);
})().catch(e=>{console.log('FATAL',String((e&&e.message)||e).slice(0,600));process.exit(1);});