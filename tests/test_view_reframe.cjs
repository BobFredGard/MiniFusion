// Vue 3D au démarrage — le cadrage a lieu APRÈS la bascule sur le noyau exact
// (occtFinishBoot re-cadre si l'utilisateur n'a pas touché la caméra) et JAMAIS
// pendant le repli maillage (init garde showAll derrière occtReady) : cadrer le
// « solide combiné » du repli, dont la boîte mesurée fait 40×40×10000, propulse
// la caméra hors du plan lointain 5000 → vue noire jusqu'au prochain Iso.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  sandbox.__src00=fs.readFileSync(path.join(ROOT,'src','00-entete-et-outils.js'),'utf8');
  sandbox.__src10=fs.readFileSync(path.join(ROOT,'src','10-scene-3d.js'),'utf8');
  sandbox.__src99=fs.readFileSync(path.join(ROOT,'src','99-init.js'),'utf8');
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const R=[
    "return new Promise(REZ=>{",
    "  const P=[];const p=s=>P.push(String(s));",
    "  const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    "  const fini=()=>{",
    "    if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  ✗ '+m));}",
    "    else{p('');p('TOUT EST CONFORME');}",
    "    REZ(P.join(String.fromCharCode(10)));",
    "  };",
    // ---------- structure source ----------
    "  att(/let viewUserMoved=false/.test(__src00),'src/00 : drapeau viewUserMoved absent');",
    "  att(/if\\(!viewUserMoved\\)\\{try\\{showAll\\(\\);\\}catch\\(e\\)\\{\\}\\}/.test(__src00),'src/00 : re-cadrage dans occtFinishBoot (sous guard viewUserMoved) absent');",
    "  const n99=(__src99.match(/if\\(occtReady\\)showAll\\(\\)/g)||[]).length;",
    "  att(n99>=2,'src/99 : cadrage init non gardé par occtReady ('+n99+'/2)');",
    "  att(!/try\\{showAll\\(\\);\\}catch\\(e\\)\\{\\}/.test(__src99),'src/99 : un showAll() nu subsiste dans init');",
    "  att(/pointermove/.test(__src10)&&/wheel/.test(__src10)&&(/viewUserMoved=true/.test(__src10)),'src/10 : écoute glisser/roulette (viewUserMoved) absent');",
    // ---------- comportement : occtFinishBoot re-cadre, sauf après interaction utilisateur ----------
    "  if(typeof occtFinishBoot!=='function'){att(false,'occtFinishBoot() absente (src/00)');fini();return;}",
    "  let calls=0;const orig=showAll;showAll=function(){calls++;};",
    "  viewUserMoved=false;",
    "  occtFinishBoot().then(()=>{",
    "    att(calls===1,'occtFinishBoot sans re-cadrage : showAll appelé '+calls+' fois (attendu 1) — vue noire après bascule exact');",
    "    p('re-cadrage après bascule exact : showAll x'+calls);",
    "    viewUserMoved=true;",
    "    return occtFinishBoot().then(()=>{",
    "      att(calls===1,'re-cadrage volé après interaction utilisateur : showAll appelé '+calls+' fois (attendu 1)');",
    "      p('après interaction utilisateur : showAll x'+calls);",
    "    });",
    "  }).catch(e=>{att(false,'occtFinishBoot : '+((e&&e.message)||e));}).then(()=>{showAll=orig;fini();});",
    "});"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'viewreframe.js'});
  console.log(r);
  process.exit(/ECHECS|✗/.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
