// « Nouveau modèle » → la FAO repart de zéro : mode lecture fermé, fenêtre outils
// fermée, TRACES retirées de la scène, posages et opérations remis au défaut.
// (btnNew recréait doc sans toucher à doc.fao ni aux traces : l'ancien usinage
//  survivait au nouveau document.)
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    // --- état de départ : 2 posages dont un jouable, traces, lecture, outils
    "const s1=faoDefaultSetup();s1.name='AVANT1';",
    "s1.stock={x0:0,y0:0,z0:0,x1:100,y1:80,z1:25};",
    "doc.fao={setups:[s1],activeSetupId:s1.id};",
    "s1.ops=[faoOpDefaults('facing')];s1.ops[0].z=20;",
    "const s2=faoDefaultSetup();s2.name='AVANT2';s2.ops=[faoOpDefaults('facing')];s2.ops[0].z=18;",
    "doc.fao={setups:[s1,s2],activeSetupId:s1.id};",
    "faoPrevOn=true;const nPrev=faoRefreshPreview('calcule');",
    "att(nPrev>0,'depart : traces affichees ('+nPrev+' pts)');",
    "faoVw=null;att(faoViewerStart()===true,'depart : mode lecture usinage ouvert');",
    "faoToolsWindowOpen();att(!!faoToolsWin,'depart : fenetre outils ouverte');",
    "att(doc.fao.setups.length===2,'depart : 2 posages ('+doc.fao.setups.length+')');",
    // --- clic « Nouveau modèle »
    "globalThis.confirm=function(){return true;};",
    // recentrage caméra = hors sujet ici (pas de controls dans le harnais) :
    "showAll=function(){};",
    "const btn=document.getElementById('btnNew');",
    "att(typeof btn.onclick==='function','btnNew clicable');",
    "btn.onclick();",
    // --- après : tout à zéro
    "att(faoVw===null,'apres : mode lecture usinage ferme');",
    "att(faoToolsWin===null,'apres : fenetre outils fermee');",
    "att(!!doc.fao&&doc.fao.setups.length===1,'apres : 1 seul posage ('+(doc.fao?doc.fao.setups.length:'doc.fao absent')+')');",
    "att(faoSetup().ops.length===0,'apres : aucune operation ('+faoSetup().ops.length+')');",
    "att(faoSetup().name==='POSAGE1','apres : posage par defaut ('+faoSetup().name+')');",
    "const nAfter=faoRefreshPreview();",
    "att(nAfter===0,'apres : plus aucune trace ('+nAfter+' pts)');",
    "att(doc.bodies.length===1&&doc.bodies[0].name==='Corps 1','apres : 1 seul conteneur vierge ('+(doc.bodies[0]&&doc.bodies[0].name)+')');",
    "att(doc.features.length===0&&doc.sketches.length===0,'apres : ni fonction ni esquisse');",
    "att(doc.name==='Sans titre','apres : document vierge ('+doc.name+')');",
    "att(!sel||!sel.kind,'apres : selection vide');",
    "att(/Nouveau mod.le/.test(faceEl.textContent),'apres : retour en face d informations ('+faceEl.textContent+')');",
    // --- faoReset() appelé directement (autres chemins : import, ouverture…)
    "const sA=faoDefaultSetup();sA.stock={x0:0,y0:0,z0:0,x1:100,y1:80,z1:25};",
    "doc.fao={setups:[sA],activeSetupId:sA.id};sA.ops=[faoOpDefaults('facing')];sA.ops[0].z=20;",
    "faoVw=null;faoViewerStart();faoToolsWindowOpen();faoRefreshPreview();",
    "att(!!faoVw&&!!faoToolsWin,'faoReset : etat sale monte');",
    "faoReset();",
    "att(faoVw===null&&faoToolsWin===null,'faoReset : lecture + outils fermes');",
    "att(doc.fao.setups.length===1&&faoSetup().ops.length===0,'faoReset : FAO remise a zero');",
    "att(faoRefreshPreview()===0,'faoReset : traces effacees');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(function(m){p('  x '+m);});}",
    "else p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'faoreset.js'});
  console.log('=== nouveau modele -> FAO a zero ===');
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
