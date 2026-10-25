// 2026-10-02-013 : le REJEU RAPIDE redevient le défaut. Depuis 2026-09-30a,
// freshHard=true obligeait à une reconstruction complète à chaque modification,
// car la signature de préfixe (featSig) ne couvrait pas toutes les propriétés
// lues par la géométrie : un changement pouvait laisser un solide périmé. Le
// filet du lot 2026-10-02-011 (JSON.stringify de la fonction entière) invalide
// désormais toute propriété qui bouge, donc le rapide est aussi juste que le
// complet (prouvé par test_cache_exact) et ~4× plus rapide : le défaut bascule
// à false. V0.7.6 : la case ⚙ « Rafraîchissement dur à chaque modification »
// (optFresh) est SUPPRIMÉE — le rejeu rapide est toujours utilisé ; freshHard=true
// ne sert plus qu'aux tests. Le bouton ponctuel « Rafraîchissement dur » reste.
// 1) structure : défaut littéral false, plus de lecture de préférence, ancienne
// préférence effacée, plus de case dans la page ni de câblage ;
// 2) comportement : freshHard===false au chargement, rebuild() par défaut ne
// jette PAS les points de contrôle, freshHard=true (tests) repurge.
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const {ctx,sandbox}=loadApp();
  const src30=require('fs').readFileSync(require('path').join(__dirname,'..','src','30-marqueur-temps.js'),'utf8');
  const html=require('fs').readFileSync(require('path').join(__dirname,'..','fusion_mvp.html'),'utf8');
  const body=[
    "const out={fails:[],log:[]};",
    "const A=(c,m)=>{if(!c)out.fails.push(m);};",
    "const step=m=>out.log.push(m);",
    // ═══ 1) structure : le défaut est bien passé à false ═══
    "A(/let freshHard=false;/.test(__src30),'src/30 : le défaut littéral « freshHard=false » est absent — le rejeu rapide doit être le défaut');",
    "A(__src30.indexOf(\"!=='0'\")<0,\"src/30 : l'ancien idiome !=='0' (défaut dur) subsiste — la préférence absente doit signifier « rapide »\");",
    "A(__src30.indexOf('localStorage.getItem')<0&&__src30.indexOf('removeItem')>=0&&__src30.indexOf('minifusion_freshHard')>=0,\"src/30 : l'ancienne préférence est encore lue (ou pas effacée) — une case cochée autrefois forcerait le mode dur\");",
    "A(__html.indexOf('optFresh')<0&&__html.indexOf('Rafraîchissement dur à chaque modification')<0,'la case ⚙ « Rafraîchissement dur à chaque modification » est encore dans la page');",
    // ═══ 2) comportement ═══
    "A(typeof freshHard!=='undefined','freshHard invisible dans le contexte');",
    "A(freshHard===false,'freshHard au chargement = '+freshHard+' — le rejeu rapide (false) doit être le défaut');",
    "let nPurge=0;const __c=occCkClear;",
    "occCkClear=function(){nPurge++;return __c.apply(this,arguments);};",
    "markDirty();rebuild();",
    "A(nPurge===0,'rebuild() par défaut a jeté les points de contrôle ('+nPurge+' purge(s)) — le mode rapide doit conserver le cache');",
    "step('défaut : freshHard='+freshHard+' purge='+nPurge+' ck='+((typeof occCk!=='undefined'&&occCk.length)||0));",
    "nPurge=0;freshHard=true;markDirty();rebuild();",
    "A(nPurge===1,'freshHard=true : rebuild() doit purger avant le rejeu (observé '+nPurge+')');",
    "step('mode dur : purge='+nPurge);",
    "freshHard=false;",
    "A(!/optFresh/.test(String(typeof initToolbar==='function'?initToolbar:'')),'src/95 : câblage optFresh encore présent');",
    "occCkClear=__c;",
    "if(out.fails.length){out.log.push('');out.log.push('ECHECS ('+out.fails.length+') :');out.fails.forEach(m=>out.log.push('  x '+m));}",
    "else out.log.push('TOUT EST CONFORME');",
    "return out.log.join(String.fromCharCode(10));"
  ].join('\n');
  sandbox.__src30=src30;sandbox.__html=html;
  const r=await vm.runInContext('(async()=>{'+body+'})()',ctx,{filename:'freshdefault.js'});
  console.log('=== rejeu rapide par défaut (freshHard) ===');
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,600));process.exit(1);});
