// 2026-10-19 : espace PLAN (98-mise-en-plan.js) — modèle doc.mep, persistance, planches, vues, cotes, esquisse.
// On ne passe pas par deserialise() (déclenche un rebuild complet incompatible du harnais partiel) ;
// la persistance est vérifiée sur serialise() + l'état de doc.mep directement.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  x '+m);}else console.log('  ✓ '+m);};
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox,loadErr}=loadApp();
  // loadErr connu du harnais : camera.up.set dans buildScene (stub THREE sans .up) — non bloquant
  if(loadErr&&!/camera\.up|reading 'set'/.test(String(loadErr&&loadErr.message||loadErr))){
    console.log('LOAD-ERR',String(loadErr&&loadErr.message||loadErr).slice(0,300));process.exit(1);
  }
  sandbox.__realOcct=real;
  vm.runInContext(
    'occt=__realOcct;occtReady=true;'+
    'window.confirm=function(){return true;};window.alert=function(){};window.prompt=function(d,v){return v;};'+
    // neutralise le rebuild (harnais partiel) — on ne teste pas la géométrie ici
    'rebuild=function(){};showAll=function(){};applyView=function(){};refreshParts=function(){};'+
    // body stub : setAttribute/getAttribute réels pour data-ws
    '(function(){var A={};document.body.setAttribute=function(k,v){A[k]=String(v);};document.body.getAttribute=function(k){return A[k]!==undefined?A[k]:null;};})();',
    ctx);

  const body=`
    const out={};
    out.hasMepExport = typeof mepSetActive==='function' && typeof mepInit==='function' && typeof mepReset==='function';
    out.hasSetTool = typeof mepSetTool==='function';
    out.hasAddStd = typeof mepAddViewStd==='function';

    // 1) doc.mep initial (null tant que l'espace n'est pas ouvert)
    out.mepInitial = doc.mep||null;

    // 2) activation → une planche par défaut
    mepSetActive(true);
    out.open = mepIsOpen();
    out.sheetsApres = doc.mep && doc.mep.sheets ? doc.mep.sheets.length : 0;
    const sh0 = doc.mep.sheets[doc.mep.cur];
    out.format0 = sh0 ? sh0.format : null;
    out.orient0 = sh0 ? sh0.orient : null;
    out.views0 = sh0 && Array.isArray(sh0.views) ? sh0.views.length : -1;
    out.dims0 = sh0 && Array.isArray(sh0.dims) ? sh0.dims.length : -1;
    out.sk0 = sh0 ? sh0.sk : 'absent';

    // 3) persistance serialise
    const j1 = serialise(false);
    out.serialiseHasMep = j1.indexOf('"mep"')>=0;
    const o1 = JSON.parse(j1);
    out.serialiseMepObj = !!(o1.mep && o1.mep.sheets && o1.mep.sheets.length>=1);
    out.serialiseMepFormat = o1.mep && o1.mep.sheets && o1.mep.sheets[0] ? o1.mep.sheets[0].format : null;

    // signature lisible dans le JSON
    doc.mep.sheets[0].name='Planche SIG';
    doc.mep.sheets[0].title.projet='TEST-PROJET';
    const j2 = serialise(false);
    out.j2SIG = j2.indexOf('Planche SIG')>=0;
    out.j2PROJET = j2.indexOf('TEST-PROJET')>=0;
    // round-trip JSON (pas deserialise : juste la forme)
    const rt = JSON.parse(j2);
    out.rtName = rt.mep.sheets[0].name;
    out.rtProjet = rt.mep.sheets[0].title.projet;
    // on recharge doc.mep depuis le JSON (équivalent léger de deserialise pour mep)
    doc.mep = rt.mep;
    out.reloadName = doc.mep.sheets[0].name;

    // 4) planches : add
    mepAddSheet();
    out.sheetsAdd = doc.mep.sheets.length;
    mepAddSheet();
    out.sheetsAdd2 = doc.mep.sheets.length;
    const noms = doc.mep.sheets.map(s=>s.name);
    out.nomsUniques = new Set(noms).size === noms.length;

    // 5) vues standards (sans corps : structure seule)
    mepAddViewStd('front');
    mepAddViewStd('top');
    mepAddViewStd('iso');
    const shC = doc.mep.sheets[doc.mep.cur];
    out.viewsCount = shC.views.length;
    const vf = shC.views[0];
    out.frontDirOK = vf && vf.dir[0]===0 && vf.dir[1]===-1 && vf.dir[2]===0;
    out.frontUOK = vf && vf.u[0]===1 && vf.u[1]===0 && vf.u[2]===0;
    out.frontVOK = vf && vf.v[0]===0 && vf.v[1]===0 && vf.v[2]===-1;
    out.vuesPlacees = shC.views.every(v=>isFinite(v.x)&&isFinite(v.y)&&v.scale>0);

    // 6) cote de distance
    mepSetTool('dim');
    const vid = shC.views[0].id;
    shC.dims.push({id:'dTEST',kind:'dist',vid,vid2:null,a:{x:0,y:0},b:{x:10,y:0},off:8,ref:false,tol:null});
    out.dimsCount = shC.dims.length;
    out.serialiseMepDims = serialise(false).indexOf('dTEST')>=0;

    // 7) esquisse de planche : format points/ents/cons
    shC.sk = {pts:{a:{x:0,y:0},b:{x:0,y:5}},ents:[{id:'e1',t:'line',p1:'a',p2:'b'}],cons:[],seq:10};
    try{ mepSetActive(false); mepSetActive(true); out.skReloadOK=true; }catch(e){ out.skReloadOK=false; out.skErr=String(e&&e.message||e); }
    out.skPresent = !!(doc.mep.sheets[doc.mep.cur].sk);

    // 8) undo
    out.undoLen = (typeof docUndoStack!=='undefined')?docUndoStack.length:0;
    out.undoLabels = (typeof docUndoStack!=='undefined')?docUndoStack.filter(e=>/Plan/.test(e.label||'')).length:0;

    // 9) docResetEmpty → mep vidé
    docResetEmpty();
    out.mepApresReset = doc.mep;

    // 10) réactivation repart propre
    mepSetActive(true);
    out.sheetsApresReset = doc.mep.sheets.length;

    // 11) tolérance ISO dans serialise
    mepAddViewStd('front');
    const shT = doc.mep.sheets[doc.mep.cur];
    if(shT.views[0]){
      shT.dims.push({id:'dTOL',kind:'dia',vid:shT.views[0].id,vid2:null,a:{x:0,y:0,hint:{t:'ctr',i:0}},b:{x:0,y:-1},off:0,ref:false,tol:{m:'cls',cls:'H7'}});
    }
    out.tolSerialise = serialise(false).indexOf('H7')>=0;

    // 12) mfWs('plan')
    out.hasMfWs = typeof mfWs==='function';
    if(typeof mfWs==='function'){
      try{ mfWs('plan'); out.wsPlan = document.body.getAttribute('data-ws'); }catch(e){ out.wsPlan='ERR:'+e.message; }
      try{ mfWs('cao'); out.wsCao = document.body.getAttribute('data-ws'); }catch(e){ out.wsCao='ERR'; }
    }

    // 13) espace fermé → data-ws=cao
    mepSetActive(false);
    out.closed = mepIsOpen()===false;

    return out;
  `;
  const p=vm.runInContext('(async()=>{\n'+body+'\n})()',ctx,{filename:'test_mep.cjs'});
  let val=await p;
  while(val&&typeof val.then==='function')val=await val;

  A(val&&val.hasMepExport,'exports mepSetActive/mepInit/mepReset présents');
  A(val&&val.hasSetTool,'export mepSetTool présent');
  A(val&&val.hasAddStd,'export mepAddViewStd présent');
  A(val&&val.open===true,'mepSetActive(true) ouvre l\'espace');
  A(val&&val.sheetsApres>=1,'une planche par défaut après activation');
  A(val&&val.format0==='A3','format par défaut A3');
  A(val&&val.orient0==='landscape','orientation paysage par défaut');
  A(val&&val.views0===0,'planche vide : 0 vue');
  A(val&&val.serialiseHasMep,'serialise() contient la clé mep');
  A(val&&val.serialiseMepObj,'serialise() mep = objet avec planches');
  A(val&&val.serialiseMepFormat==='A3','serialise() mep format A3');
  A(val&&val.j2SIG&&val.j2PROJET,'signature dans le JSON sérialisé');
  A(val&&val.rtName==='Planche SIG','round-trip JSON : nom');
  A(val&&val.rtProjet==='TEST-PROJET','round-trip JSON : titre projet');
  A(val&&val.reloadName==='Planche SIG','doc.mep rechargé depuis JSON');
  A(val&&val.sheetsAdd===2,'mepAddSheet ajoute une planche');
  A(val&&val.nomsUniques,'noms de planches uniques');
  A(val&&val.viewsCount===3,'3 vues standards créées');
  A(val&&val.frontDirOK,'vue Face : dir=(0,-1,0)');
  A(val&&val.frontUOK,'vue Face : u=(1,0,0)');
  A(val&&val.frontVOK,'vue Face : v=(0,0,-1)');
  A(val&&val.vuesPlacees,'vues placées (x,y,scale valides)');
  A(val&&val.dimsCount===1,'cote de distance injectée');
  A(val&&val.serialiseMepDims,'la cote est sérialisée dans doc.mep');
  A(val&&val.skReloadOK,'réactivation OK avec esquisse de planche');
  A(val&&val.skPresent,'esquisse de planche présente dans doc.mep');
  A(val&&val.undoLen>0,'des entrées undo ont été empilées');
  A(val&&val.undoLabels>0,'libellés undo commencent par « Plan : »');
  A(val&&val.mepApresReset===null||val.mepApresReset===undefined,'docResetEmpty() vide doc.mep');
  A(val&&val.sheetsApresReset>=1,'réactivation après reset recrée une planche');
  A(val&&val.tolSerialise,'tolérance classe H7 sérialisée');
  A(val&&val.hasMfWs,'mfWs présent');
  A(val&&val.wsPlan==='plan',"mfWs('plan') → data-ws=plan");
  A(val&&val.wsCao==='cao',"mfWs('cao') → data-ws=cao");
  A(val&&val.closed===true,'mepSetActive(false) ferme l\'espace');

  if(ko){console.log('FAIL '+ko+' assertion(s)');process.exit(1);}
  console.log('OK espace PLAN');
  process.exit(0);
})().catch(e=>{console.error('ERREUR',e);process.exit(1);});
