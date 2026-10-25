// V0.8.5 : scripts JSON (53-scripts.js), noyau OCCT réel. Plaque 60 × 40 × 10 percée Ø12 par
// script : volume exact (24 000 − π·36·10), esquisse visée par l'id du script, paramètre,
// révolution, une seule étape d'annulation, script atomique (erreur → document intact, numéro
// de commande), op inconnue, configuration, JSON en texte.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};confirm=function(){return true;};',ctx);
  const R=String.raw`
    const ATT=[],OK=[];const att=(ok,msg)=>{(ok?OK:ATT).push(msg);};const near=(a,b,t)=>Math.abs(a-b)<(t||1e-6);
    docResetEmpty();
    // ── plaque percée ──
    let r=mfScriptRun([
      {op:'new',name:'Plaque script'},
      {op:'param',name:'E',expr:'10'},
      {op:'sketch',id:'s1',name:'Contour',plane:'XY',shapes:[{rect:[0,0,60,40]},{circle:[30,20,6]}]},
      {op:'extrude',id:'x1',sketch:'s1',distance:10,name:'Plaque'},
      {op:'info'}]);
    const info=r.ok&&r.results[r.results.length-1];
    att(r.ok&&doc.name==='Plaque script'&&doc.sketches.length===1&&doc.features.length===1,'1 : script exécuté : document, esquisse, extrusion');
    att(info&&info.bodies.length===1&&near(info.bodies[0].volume,24000-Math.PI*36*10,1e-2),'2 : volume exact de la plaque percée '+(info&&info.bodies[0]?info.bodies[0].volume:'?')+' mm³ (24 000 − π·36·10)');
    att(info&&near(info.bodies[0].box.max[0],60,1e-6)&&near(info.bodies[0].box.max[2],10,1e-6)&&near(info.bodies[0].center[0],30,1e-6),'3 : boîte (60 × 40 × 10) et centre (X 30)');
    att(info&&info.params[0].name==='E'&&info.params[0].value===10&&info.features[0].name==='Plaque','4 : paramètre et fonction dans l’état');
    const u1=docUndoStack.length;
    // ── une étape d'annulation ──
    r=mfScriptRun([{op:'sketch',id:'b',plane:'XY',offset:10,shapes:[{circle:[10,10,4]}]},{op:'extrude',sketch:'b',distance:5},{op:'extrude',sketch:'b',distance:2,cut:true}]);
    att(r.ok&&doc.features.length===3&&docUndoStack.length===u1+1,'5 : trois commandes, une seule étape d’annulation');
    att(doc.sketches[1].origin[2]===10,'6 : offset : esquisse à Z 10');
    docUndo();
    att(doc.features.length===1&&doc.sketches.length===1,'7 : Ctrl+Z défait tout le script');
    // ── atomique ──
    const s0=docSnap(),u2=docUndoStack.length;
    r=mfScriptRun([{op:'sketch',id:'k',plane:'XZ',shapes:[{rect:[0,0,5,5]}]},{op:'extrude',sketch:'k',distance:3},{op:'extrude',sketch:'zz',distance:3}]);
    att(!r.ok&&r.at===3&&/introuvable/.test(r.error)&&docSnap()===s0&&docUndoStack.length===u2,'8 : erreur à la 3e commande : document intact, rien dans l’annulation ('+r.error+')');
    r=mfScriptRun([{op:'fly'}]);
    att(!r.ok&&r.at===1&&/inconnue/.test(r.error),'9 : op inconnue refusée');
    r=mfScriptRun([{op:'sketch',shapes:[{rect:[0,0,0,5]}]}]);
    att(!r.ok&&/plat/.test(r.error),'10 : forme fausse expliquée');
    r=mfScriptRun('[{"op":"param","name":"E","expr":"E+"}]');
    att(!r.ok&&/E/.test(r.error)&&doc.params[0].expr==='10','11 : expression fausse : refusée, paramètre intact');
    r=mfScriptRun('{pas du json');
    att(!r.ok&&/JSON/.test(r.error),'12 : JSON illisible');
    // ── révolution ──
    r=mfScriptRun([{op:'new',name:'Galet'},{op:'sketch',id:'p',plane:'XZ',shapes:[{rect:[5,0,15,10]}]},{op:'revolve',sketch:'p',axis:'Z',angle:360},{op:'info'}]);
    const g=r.ok&&r.results[3];
    att(g&&near(g.bodies[0].volume,Math.PI*(225-25)*10,1),'13 : révolution d’une bague (π·(15²−5²)·10 = '+(Math.PI*2000).toFixed(1)+') : '+(g&&g.bodies[0]?g.bodies[0].volume:'?'));
    // ── configuration ──
    r=mfScriptRun([{op:'new',name:'Cfg'},{op:'param',name:'H',expr:'10'},{op:'sketch',id:'c',plane:'XY',shapes:[{rect:[0,0,10,10]}]},{op:'extrude',sketch:'c',distance:10}]);
    const ex=doc.features[0];ex.expr={distance:'H'};parApplyAll();
    const row=cfgAddRow('Basse');cfgAddCol('H');row.vals.H='10';const row2=cfgAddRow('Haute');row2.vals.H='25';
    r=mfScriptRun([{op:'config',name:'Haute'},{op:'info'}]);
    att(r.ok&&near(r.results[1].bodies[0].volume,2500,1e-3)&&r.results[1].configs.active===row2.id,'14 : configuration « Haute » par script : volume 2 500');
    // ── coupe tracée depuis le BORD de la pièce (V0.8.5, Perçages coupe B-B) : tout est coupé ──
    r=mfScriptRun([{op:'new',name:'Plaque'},{op:'sketch',id:'q',plane:'XY',shapes:[{rect:[-50,-32.5,50,32.5]}]},{op:'extrude',sketch:'q',distance:20}]);
    const T=window.__mepTest,sh=T.sheet();const pv=T.addView({kind:'base',vk:'front'});
    const sv={id:'__svB',kind:'section',parent:pv.id,x:pv.x,y:pv.y+60,scale:1,axes:[],label:'B',section:{a:[-50,0],b:[71.46,0],pid:pv.id,p:[-50,0,0],n:[0,1,0]}};
    sh.views.push(sv);
    const gB=T.geo(sv);let mx=-1e9,mn=1e9;(gB.hatch||[]).forEach(l=>l.forEach(p=>{mx=Math.max(mx,p[0]);mn=Math.min(mn,p[0]);}));
    att(near(mn,-50,1e-6)&&near(mx,50,1e-6),'15 : coupe tracée depuis le bord gauche (X −50) : hachures de −50 à 50 (vu '+mn.toFixed(2)+' → '+mx.toFixed(2)+')');
    return {ATT,OK};
  `;
  const o=await vm.runInContext('(async function(){'+R+'})()',ctx);
  console.log('=== V0.8.5 : scripts JSON ===');
  o.OK.forEach(m=>console.log('  ✓ '+m));
  if(o.ATT.length){o.ATT.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.ATT.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
