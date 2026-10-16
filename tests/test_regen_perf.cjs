// 2026-10-16-003 : temps de régénération (« Cavité Usinage » : 26 s pour passer la 1re
// extrusion de 50 à 55). Causes : (1) chaque entité projetée rejouait le solide partiel ;
// (2) une ligne projetée était déclarée « modifiée » à CHAQUE passe (d1>0.02||d2>0.02,
// toujours vrai) → passes complètes jusqu'à REGEN_MAX_PASS ; (3) outils d'extrusion
// reconstruits même sur point de contrôle ; (4) projections relues à chaque reconstruction.
// Test STRUCTUREL (pas de chrono) : nombre de passes, rejeux partiels, géométrie inchangée.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  sandbox.__doc=fs.readFileSync(path.join(ROOT,'tests','fixtures','cavite_regeneration.json'),'utf8');
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};showAll=function(){};applyView=function(){};',ctx);
  const R=[
    'const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};',
    'occt=__realOcct;occtReady=true;',
    'await deserialise(__doc);occt=__realOcct;occtReady=true;markDirty();rebuild();',
    'const G=()=>{const E=occListEdges(occLive.shape);let z=0;E.forEach(e=>{if(e.mid)z+=e.mid[2];});return E.length+"/"+z.toFixed(3);};',
    'let passes=0,partial=0;const oR=globalThis.rebuild,oF=globalThis.occFinalShape;',
    'globalThis.rebuild=function(p){passes=Math.max(passes,(p||0)+1);return oR.apply(this,arguments);};',
    'globalThis.occFinalShape=function(u){if(u!=null)partial++;return oF.apply(this,arguments);};',
    'const g0=G();',
    'passes=0;partial=0;markDirty();rebuild();',
    'A(passes===1&&partial===0,"1 : reconstruction sans changement : 1 passe, AUCUN rejeu partiel pour les projections ("+passes+" passe(s), "+partial+" rejeu(x) partiel(s))");',
    'const f=doc.features.find(x=>x.id==="ex_3_mup7fzw5");',
    'passes=0;partial=0;f.distance=55;markDirty();rebuild();const g55=G();',
    'A(passes<=2,"2 : 1re extrusion 50 → 55 : la chaîne de projections se règle en ≤ 2 passes ("+passes+")");',
    'passes=0;partial=0;f.distance=50;markDirty();rebuild();',
    'const p50=passes,g50=G();f.distance=55;markDirty();rebuild();const g55b=G();f.distance=50;markDirty();rebuild();',
    'A(p50<=2&&G()===g50&&g55b===g55,"3 : retour à 50 en ≤ 2 passes, aller-retour REPRODUCTIBLE (2e cycle identique : "+G()+")");',
    'A(g55!==g0,"4 : à 55 la géométrie a bien changé ("+g55+")");',
    'globalThis.rebuild=oR;globalThis.occFinalShape=oF;',
    // projetée parfaitement en place : pas de « changement »
    'const sk=doc.sketches.find(s=>(s.entities||[]).some(e=>e.proj&&e.t==="line"));',
    'A(!!sk&&updateAssociativeProjections(sk)===false,"5 : esquisse aux projetées déjà en place → aucune modification signalée");',
    'return out;'
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== 2026-10-16-003 : régénération — passes et caches ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
