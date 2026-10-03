// 2026-10-02-013 : le REJEU RAPIDE redevient le défaut. Depuis 2026-09-30a,
// freshHard=true obligeait à une reconstruction complète à chaque modification,
// car la signature de préfixe (featSig) ne couvrait pas toutes les propriétés
// lues par la géométrie : un changement pouvait laisser un solide périmé. Le
// filet du lot 2026-10-02-011 (JSON.stringify de la fonction entière) invalide
// désormais toute propriété qui bouge, donc le rapide est aussi juste que le
// complet (prouvé par test_cache_exact) et ~4× plus rapide : le défaut bascule
// à false. La préférence utilisateur (⚙ optFresh) reste persistée telle quelle.
// 1) structure : défaut literal false + lecture de préférence ==='1' (l'ancien
// idiome !=='0', qui signifiait « défaut dur », doit avoir disparu) ;
// 2) comportement : freshHard===false au chargement, rebuild() par défaut ne
// jette PAS les points de contrôle, freshHard=true repurge, et le réglage
// optFresh bascule avec persistance localStorage + messages faceEl.
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const {ctx,sandbox}=loadApp();
  const src30=require('fs').readFileSync(require('path').join(__dirname,'..','src','30-marqueur-temps.js'),'utf8');
  const body=[
    "const out={fails:[],log:[]};",
    "const A=(c,m)=>{if(!c)out.fails.push(m);};",
    "const step=m=>out.log.push(m);",
    // ═══ 1) structure : le défaut est bien passé à false ═══
    "A(/let freshHard=false;/.test(__src30),'src/30 : le défaut littéral « freshHard=false » est absent — le rejeu rapide doit être le défaut');",
    "A(__src30.indexOf(\"!=='0'\")<0,\"src/30 : l'ancien idiome !=='0' (défaut dur) subsiste — la préférence absente doit signifier « rapide »\");",
    "A(/===?'1'/.test(__src30),\"src/30 : lecture de préférence ==='1' absente — la case ⚙ optFresh cochée doit reposer le mode dur\");",
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
    "const fr=$('optFresh');",
    "A(!!fr&&typeof fr.onchange==='function','réglage ⚙ optFresh non câblé (src/95)');",
    "const calls=[];let __s=null;",
    "try{if(typeof localStorage!=='undefined'&&localStorage){__s=localStorage.setItem;localStorage.setItem=function(k,v){calls.push(k+'='+v);};}}catch(e){}",
    "if(fr&&typeof fr.onchange==='function'){",
    "  fr.checked=true;fr.onchange();",
    "  A(freshHard===true,'optFresh coché : freshHard='+freshHard+' (attendu true)');",
    "  A(/Rafraîchissement dur/.test(faceEl.textContent),'message faceEl du mode dur absent');",
    "  A(calls.some(c=>c==='minifusion_freshHard=1'),'persistance localStorage « 1 » absente ('+calls.join(', ')+')');",
    "  fr.checked=false;fr.onchange();",
    "  A(freshHard===false,'optFresh décoché : freshHard='+freshHard+' (attendu false)');",
    "  A(/Rejeu rapide/.test(faceEl.textContent),'message faceEl du mode rapide absent');",
    "  A(calls.some(c=>c==='minifusion_freshHard=0'),'persistance localStorage « 0 » absente ('+calls.join(', ')+')');",
    "  step('toggle : dur puis rapide, stocké ['+calls.join(', ')+']');",
    "}",
    "try{if(typeof localStorage!=='undefined'&&localStorage&&__s)localStorage.setItem=__s;}catch(e){}",
    "occCkClear=__c;",
    "if(out.fails.length){out.log.push('');out.log.push('ECHECS ('+out.fails.length+') :');out.fails.forEach(m=>out.log.push('  x '+m));}",
    "else out.log.push('TOUT EST CONFORME');",
    "return out.log.join(String.fromCharCode(10));"
  ].join('\n');
  sandbox.__src30=src30;
  const r=await vm.runInContext('(async()=>{'+body+'})()',ctx,{filename:'freshdefault.js'});
  console.log('=== rejeu rapide par défaut (freshHard) ===');
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,600));process.exit(1);});
