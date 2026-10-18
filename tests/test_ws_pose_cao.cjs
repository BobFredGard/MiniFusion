// Retour à l'espace Modèle (moderne, data-ws="cao") : brut, repère et points du posage
// doivent DISPARAÎTRE, même avec un posage encore sélectionné. Cube du corps (modèle)
// dessiné avec les mêmes règles que le cube du brut ; plus de contour pointillé.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
const {loadApp}=require('./appvm.cjs');
const {ctx}=loadApp();
const R=[
  "const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};",
  // contrats de source
  "A(/data-ws/.test(String(faoPoseSetupSel))&&/cao/.test(String(faoPoseSetupSel)),'1 : faoPoseSetupSel refuse le visuel quand l espace Modèle est actif (data-ws=cao)');",
  "A(/faoModelBox\\(setup\\)/.test(String(faoPoseSync))&&/0xffffff/.test(String(faoPoseSync))&&/opacity:\\.10/.test(String(faoPoseSync)),'2 : cube du modèle (cube blanc, faces transparentes opacité 0,10) dessiné');",
  "A(/EdgesGeometry/.test(String(faoPoseSync)),'3 : arêtes du cube du modèle visibles (mêmes règles que le brut)');",
  "A(!/LineDashedMaterial/.test(String(faoPoseSync)),'4 : contour pointillé de l ancien comportement supprimé');",
  // comportement : visibles en FAO, tout ravaudé en CAO, reconstruits au retour
  "document.body.getAttribute=function(){return 'fao';};",
  "const ss=faoDefaultSetup();ss.stock={x0:-10,y0:-20,z0:-5,x1:30,y1:40,z1:15};faoRoot().setups=[ss];faoRoot().activeSetupId=ss.id;sel={kind:'faoSetup',id:ss.id};",
  "let err=null;try{faoPoseSync();}catch(e){err=e;}",
  "A(!err,'5 : faoPoseSync sans erreur ('+(err?String(err&&err.message).slice(0,80):'ok')+')');",
  "A(!!faoPoseGrp,'6 : espace Usinage : le visuel du posage est dessiné');",
  "A(!faoPoseTriad||faoPoseTriad.visible===true,'7 : repère du posage visible dans l espace Usinage');",
  "document.body.getAttribute=function(){return 'cao';};",
  "err=null;try{faoPoseSync();}catch(e){err=e;}",
  "A(!err,'8 : faoPoseSync (retour Modèle) sans erreur ('+(err?String(err&&err.message).slice(0,80):'ok')+')');",
  "A(faoPoseGrp===null,'9 : retour Modèle : ni brut, ni cube du modèle, ni points (groupe vidé)');",
  "A(!faoPoseTriad||faoPoseTriad.visible===false,'10 : retour Modèle : repère masqué');",
  "document.body.getAttribute=function(){return null;};",
  "err=null;try{faoPoseSync();}catch(e){err=e;}",
  "A(!err&&!!faoPoseGrp,'11 : retour Usinage : le visuel est reconstruit');",
  "sel={kind:null,id:null};document.body.getAttribute=function(){return null;};",
  "return out;"
].join('\n');
(async()=>{
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== 2026-10-18 : espace Modèle — brut/repère/points masqués ; cube du corps affiché ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
