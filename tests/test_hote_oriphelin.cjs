// Hôtes d'esquisse PÉRIMÉS : quand la fonction porteuse d'une esquisse (sk.host.feat)
// a été supprimée/remplacée, l'esquisse restait figée à son origine enregistrée — un
// perçage « comme avant » après un déplacement de face. Le rebuild doit réancrer l'hôte
// sur la face VIVANTE la plus proche (sans déplacer l'esquisse quand son origine tombe
// déjà sur une face).
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
const {loadApp}=require('./appvm.cjs');
const json=fs.readFileSync(path.join(ROOT,'Exemples','Support Pédale Déportée R1200RT 2011.miniFusion'),'utf8');
const raw=JSON.parse(json).doc.sketches;
const RAW={};raw.forEach(s=>{RAW[s.id]={o:(s.origin||[]).slice(),h:(s.host&&s.host.feat)||null};});
(async()=>{
  const {ctx}=loadApp();
  const body=[
    'const RAW='+JSON.stringify(RAW)+';',
    'const P=[];const p=s=>P.push(String(s));const ATT=[];const att=(ok,m)=>{if(!ok)ATT.push(m);};',
    'await bundleRestore('+JSON.stringify(json)+',{rebuild:false});',
    'resolveAllSketchHosts();',
    'const dead=[];',
    'for(const s of (doc.sketches||[])){',
    '  if(s.plane!==\'FACE\')continue;',
    '  const live=!!(s.host&&s.host.feat&&doc.features.some(f=>f.id===s.host.feat));',
    '  if(!live)dead.push(s.id);',
    '}',
    'p(\'hôtes morts restants : \'+dead.length+(dead.length?\' (\'+dead.join(\', \')+\')\':\'\'));',
    'att(dead.length===0,\'toutes les esquisses FACE doivent avoir un hôte vivant après rebuild\');',
    'for(const [nm,id] of [[\'Esquisse 8\',\'sk_27_mvc7z3qf\'],[\'Esquisse 10\',\'sk_36_mvcajvrn\'],[\'Esquisse 11\',\'sk_43_mvcb3v1j\']]){',
    '  const sk=doc.sketches.find(s=>s.id===id);',
    '  const live=!!(sk&&sk.host&&sk.host.feat&&doc.features.some(f=>f.id===sk.host.feat));',
    '  p(nm+\' : hôte \'+RAW[id].h+\' (mort) -> \'+(sk.host&&sk.host.feat)+\' (\'+(live?\'vivant\':\'MORT\')+\')\');',
    '  att(live,nm+\' : hôte non réancré\');',
    '  att(RAW[id].h!==(sk.host&&sk.host.feat),nm+\' : l\\\'hôte mort devait être remplacé\');',
    '}',
    'const sk8=doc.sketches.find(s=>s.id===\'sk_27_mvc7z3qf\'),sk10=doc.sketches.find(s=>s.id===\'sk_36_mvcajvrn\');',
    'const near=(o,r)=>o&&r&&Math.abs(o[0]-r[0])<1e-6&&Math.abs(o[1]-r[1])<1e-6&&Math.abs(o[2]-r[2])<1e-6;',
    'att(near(sk8.origin,RAW.sk_27_mvc7z3qf.o),\'Esquisse 8 : position conservée à l\\\'identique\');',
    'att(near(sk10.origin,RAW.sk_36_mvcajvrn.o),\'Esquisse 10 : position conservée à l\\\'identique\');',
    'p(\'Esquisse 8 origine \'+JSON.stringify(sk8.origin)+\' — Esquisse 10 origine \'+JSON.stringify(sk10.origin));',
    'if(ATT.length){p(\'\');p(\'ECHECS (\'+ATT.length+\') :\');ATT.forEach(m=>p(\'  x \'+m));}',
    'else{p(\'\');p(\'TOUT EST CONFORME\');}',
    'return P.join(String.fromCharCode(10));'
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+body+'})()',ctx,{filename:'hote_oriphelin.js'});
  console.log(r);
  process.exit(/ECHECS/.test(r)?1:0);
})().catch(e=>{console.error('FATAL',String((e&&e.stack)||e).slice(0,800));process.exit(1);});
