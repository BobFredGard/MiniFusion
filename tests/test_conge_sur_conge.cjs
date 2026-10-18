// Congé SUR congé (le fichier réel de la pédale) : la jonction des deux congés doit
// être classée TANGENTE (grise) même quand le drapeau BRep_Tool reste C0. Avant
// correctif : 4 fragments noirs de 2 à 7 mm ; après : vives 85, tangentes 68.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
const json=fs.readFileSync(path.join(ROOT,'Exemples','Support Pédale Déportée R1200RT 2011.miniFusion'),'utf8');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const body=[
    'const out={};',
    'await bundleRestore('+JSON.stringify(json)+',{rebuild:false});',
    'occCkClear();markDirty();rebuild();',
    'const FR=occFinalShape(null);',
    'if(!FR||!FR.shape)throw new Error("shape nulle au rejeu");',
    'const es=occSharpEdges(FR.shape);',
    'out.tot=es.length;',
    'out.vives=es.filter(e=>e.sharp).length;',
    'out.tangentes=es.filter(e=>!e.sharp).length;',
    'const tang=es.filter(e=>!e.sharp).map(e=>e.len);',
    'out.t0=tang.some(l=>Math.abs(l-2)<0.05);',      // 7, 7, 3.15, 2 : les 4 fragments d\u2019avant
    'out.t315=tang.some(l=>Math.abs(l-3.15)<0.05);', //   doivent maintenant être GRIS
    'const viv=es.filter(e=>e.sharp).map(e=>e.len);',
    'out.v700=viv.some(l=>Math.abs(l-7)<0.05);',   // aucune vive à exactement 7 mm
    'return out;'
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx);
  console.log('arêtes classifiées : '+o.tot+' — vives : '+o.vives+' — tangentes : '+o.tangentes);
  console.log('fragments reconvertis en grises (t=2mm : '+o.t0+', t=3.15mm : '+o.t315+', 7mm vives restantes : '+o.v700+')');
  const bon=(o.tot===153&&o.vives===85&&o.tangentes===68&&o.t0&&o.t315&&!o.v700);
  console.log(bon?'TOUT EST CONFORME':'ÉCART — TOUTE SUITE ROUGE');
  process.exit(bon?0:1);
})().catch(e=>{console.log('FATAL',String((e&&e.message)||e).slice(0,600));process.exit(1);});
