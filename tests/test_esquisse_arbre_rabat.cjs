// 2026-10-02-020 : esquisse — l'arborescence (menu des corps / fonctions) se
// RABAT à l'entrée en mode esquisse et redevient VISIBLE à la sortie.
// Motif : le voile de l'esquisse (rgba .72) laisse transparaître l'arborescence
// pendant toute l'édition — elle encombre le plan de travail ; à la sortie elle
// doit être là, exactement comme avant.
// Contrats :
//   A) entrée (arbre déplié) → replié ; sortie → déplié (visible) ;
//   B) déjà repliée avant l'entrée → l'état antérieur est respecté des deux côtés
//      (l'entrée/sortie ne force rien) ;
//   C) entrée/sortie n'écrivent JAMAIS dans localStorage (seul le clic manuel
//      sur l'onglet ❯/❮ persiste) ;
//   D) dépliage manuel PENDANT l'esquisse est conservé à la sortie.
// Observables : textContent de #treeToggle ('❮' replié / '❯' déplié) + espion
// localStorage branché sur le sandbox avant les scénarios.
// Harnais : DOM/THREE stubbé, aucun noyau OCCT requis.
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const {ctx,sandbox,loadErr}=loadApp();
  if(loadErr)console.log('  (harnais : buildScene interrompu — comportement normal du stub)');
  const ls=[];
  sandbox.__ls=ls;
  sandbox.localStorage={getItem(){return null;},setItem(k,v){ls.push(k+'='+v);},removeItem(){}};
  const body=[
    'const out={fails:[],log:[]};',
    'const A=(c,m)=>{if(!c)out.fails.push(m);};',
    'const step=m=>out.log.push(m);',
    'const tog=document.getElementById("treeToggle");',
    'const state=()=>tog.textContent;',
    'const foldWrites=()=>__ls.filter(x=>x.indexOf("minifusion_treeFolded")===0);',
    'const sk={id:"sR",name:"R",plane:"XY",entities:[],points:{},constraints:[],dims:[],seq:1,visible:true};',
    'ensureSketchBasis(sk);doc.sketches=[sk];doc.features=[];',
    // ═══ A. arbre déplié à l'entrée → rabattu en esquisse → visible à la sortie ═══
    'step("A : état initial onglet="+JSON.stringify(state()));',
    'openSketch("sR");',
    'A(state()==="❮","A1 : l arborescence doit être RABATTUE en mode esquisse — onglet="+JSON.stringify(state()));',
    'closeSketch(false);',
    'A(state()==="❯","A2 : l arborescence doit être RENDUE VISIBLE à la sortie — onglet="+JSON.stringify(state()));',
    // ═══ B. déjà rabattue avant l'entrée : l'état antérieur est respecté ═══
    'tog.onclick();',
    'A(state()==="❮","B0 : pliage manuel via l onglet — onglet="+JSON.stringify(state()));',
    'openSketch("sR");',
    'A(state()==="❮","B1 : déjà rabattue avant l entrée : reste rabattue en esquisse");',
    'closeSketch(false);',
    'A(state()==="❮","B2 : état antérieur respecté : reste RABATTUE à la sortie (l entrée/sortie ne force pas)");',
    'tog.onclick();',
    // ═══ C. entrée/sortie n'écrivent jamais localStorage (seul le clic manuel) ═══
    '__ls.length=0;',
    'openSketch("sR");',
    'A(state()==="❮","C0 : repli à l entrée (avant vérif localStorage)");',
    'closeSketch(false);',
    'A(foldWrites().length===0,"C1 : entrée/sortie ne doivent PAS écrire localStorage — écritures="+foldWrites().join(","));',
    'A(state()==="❯","C2 : visible à la sortie");',
    '__ls.length=0;',
    'tog.onclick();',
    'A(foldWrites().length===1,"C3 : le clic MANUEL persiste bien l état ("+foldWrites().join(",")+")");',
    'tog.onclick();',
    // ═══ D. dépliage manuel PENDANT l'esquisse conservé à la sortie ═══
    'openSketch("sR");',
    'A(state()==="❮","D0 : repli à l entrée");',
    'tog.onclick();',
    'A(state()==="❯","D1 : dépliage manuel pendant l esquisse");',
    'closeSketch(false);',
    'A(state()==="❯","D2 : le choix manuel (visible) est conservé à la sortie — onglet="+JSON.stringify(state()));',
    'if(out.fails.length){out.log.push("");out.log.push("ECHECS ("+out.fails.length+") :");out.fails.forEach(m=>out.log.push("  x "+m));}',
    'else out.log.push("TOUT EST CONFORME");',
    'return out.log.join(String.fromCharCode(10));'
  ].join('\n');
  const txt=await vm.runInContext('(async()=>{'+body+'})()',ctx,{filename:'test_esquisse_arbre_rabat.js'});
  console.log('=== esquisse : arborescence (menu corps) rabattue à l\'entrée, visible à la sortie ===');
  console.log(txt);
  process.exit(/ECHECS|  x /.test(txt)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,3000));process.exit(1);});
