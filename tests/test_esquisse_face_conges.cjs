// 2026-10-02-021 : esquisse POSÉE SUR FACE — le modèle complet reste affiché (congés visibles).
// Bug document réel (face-congé.json = test.json de l'utilisateur) : rectangle 110x80 XY extrudé
// 20 mm puis 4 congés verticaux r=20 sur les coins — esquisse sur la face haute →
//   · AVANT correctif : openSketch verrouillait APRES la porteuse (tlEditLockAfter(ex_2)) →
//     le rejeu excluait xf_3 → 6 faces nettes, refs = 8 lignes 0 arc (seul le rectangle),
//     note « solide fini » mensongère ;
//   · CONTRAT : esquisse sur face NON consommée = AUCUN verrou, modèle complet (10 faces,
//     8 lignes + 8 arcs — les congés figurent dans la référence, comme la face cliquée).
// Non-régressions : esquisse XY libre → idem ; esquisse CONSOMMÉE → verrou AVANT la
// consommatrice conservé ; fondu translucide actif ; fermeture → verrou levé.
// Harnais : noyau OCCT réel (face count + refs planaires exacts).
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
const json=fs.readFileSync(path.join(ROOT,'tests','fixtures','face-congé.json'),'utf8');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const R=[
    'const out={fails:[],info:{}};',
    'const A=(c,m)=>{if(!c)out.fails.push(m);};',
    'const faceCount=()=>{try{if(!occLive||!occLive.shape)return -1;',
    '  const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;',
    '  const ex=new occt.TopExp_Explorer_2(occLive.shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);',
    '  let n=0;while(ex.More()){n++;ex.Next();}ex.delete();return n;}catch(e){return -2;}};',
    'const refs=()=>{const r=(skEdit&&skEdit._refs)||[];const o={n:r.length,arc:0,circle:0,line:0};',
    '  r.forEach(e=>{if(e.type==="arc")o.arc++;else if(e.type==="circle")o.circle++;else o.line++;});return o};',
    'const transOk=()=>bodies.filter(b=>!b.ghost).every(b=>{const m=b.mesh&&b.mesh.material;',
    '  return m&&Math.abs(m.opacity-0.75)<1e-6;});',
    'await deserialise('+JSON.stringify(json)+',{rebuild:false});',
    'occCkClear();markDirty();rebuild();',
    // ── A : esquisse sur la face haute → modèle complet, congés dans les refs ──
    'openSketch("sk_10_musc7igu");',
    'out.info.A={tlMark:tlMark,faces:faceCount(),refs:refs(),note:skEdit&&skEdit._refNote,fade:skEdit&&skEdit._fade};',
    'A(tlMark===null,"A1 : aucun verrou pour une esquisse sur face non consommée (xf_3 rejoué) — tlMark="+tlMark);',
    'A(faceCount()===10,"A2 : solide complet AVEC les 4 congés (10 faces) — obtenu "+faceCount());',
    'A(refs().arc>=4,"A3 : les arcs des congés figurent dans la référence — "+JSON.stringify(refs()));',
    'A(String(skEdit&&skEdit._refNote||"").indexOf("solide fini")>=0,"A4 : note « solide fini » vraie (modèle complet)");',
    'A(skEdit&&skEdit._fade==="bodies"&&transOk(),"A5 : fondu translucide 0.75 actif");',
    'closeSketch(false);',
    'A(tlMark===null,"A6 : verrou levé à la fermeture");',
    // ── B : esquisse XY libre — non-régression (déjà complet) ──
    'openSketch("sk_6_musc724j");',
    'out.info.B={tlMark:tlMark,faces:faceCount(),refs:refs()};',
    'A(tlMark===null,"B1 : esquisse XY libre → aucun verrou");',
    'A(faceCount()===10&&refs().arc>=4,"B2 : modèle complet + congés dans les refs — "+JSON.stringify(out.info.B.refs));',
    'closeSketch(false);',
    // ── C : esquisse CONSOMMÉE → verrou AVANT la consommatrice conservé ──
    'openSketch("sk_1_musc5r65");',
    'out.info.C={tlMark:tlMark};',
    'A(tlMark==="ex_2_musc631s","C1 : esquisse consommée → verrou AVANT la consommatrice conservé — tlMark="+tlMark);',
    'closeSketch(false);',
    'return out;'
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== esquisse sur face : modèle complet (congés visibles) ===');
  Object.keys(o.info||{}).forEach(k=>console.log('  '+k+' : '+JSON.stringify(o.info[k])));
  if(o.fails&&o.fails.length){console.log('ECHECS :');o.fails.forEach(m=>console.log('  x '+m));process.exit(1);}
  console.log('TOUT EST CONFORME');
  process.exit(0);
})().catch(e=>{console.log('FATAL/FAIL',String((e&&e.stack)||e).slice(0,900));process.exit(1);});
