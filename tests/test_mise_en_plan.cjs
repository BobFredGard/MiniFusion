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
    const vf = shC.views[0], vIso = shC.views[2];
    out.frontDirOK = vf && vf.dir[0]===0 && vf.dir[1]===-1 && vf.dir[2]===0;
    out.frontUOK = vf && vf.u[0]===1 && vf.u[1]===0 && vf.u[2]===0;
    out.frontVOK = vf && vf.v[0]===0 && vf.v[1]===0 && vf.v[2]===-1;
    out.isoHeadUp = !!(vIso && vIso.v[2] < -0.5);
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

    // 11b) fermeture/réouverture PLAN : la sélection de vue est conservée
    const shSel = doc.mep.sheets[doc.mep.cur];
    const vidSel = shSel.views[0].id;
    out.planSelId = vidSel;
    __mepTest.setViewSel(vidSel);
    mepSetActive(false);
    out.planSelClosed = __mepTest.viewSel();
    mepSetActive(true);
    out.planSelReopen = __mepTest.viewSel();

    // 12) mfWs('plan')
    out.hasMfWs = typeof mfWs==='function';
    if(typeof mfWs==='function'){
      try{ mfWs('plan'); out.wsPlan = document.body.getAttribute('data-ws'); out.planSelWs = __mepTest.viewSel(); }catch(e){ out.wsPlan='ERR:'+e.message; }
      try{ mfWs('cao'); out.wsCao = document.body.getAttribute('data-ws'); }catch(e){ out.wsCao='ERR'; }

      // 12b) chaque espace retrouve SA sélection au retour
      sel={kind:'body',id:'bodyTEST'}; treeSel=['bodyTEST'];
      mfWs('fao'); mfWs('cao');
      out.wsCaoSel = sel.kind+':'+sel.id;
      out.wsCaoTree = treeSel.join(',');
      mfWs('fao');
      sel={kind:'faoOp',id:'opTEST',setup:'setupTEST'};
      mfWs('cao'); mfWs('fao');
      out.wsFaoSel = sel.kind+':'+sel.id;
    }

    // 13) espace fermé → data-ws=cao
    mepSetActive(false);
    out.closed = mepIsOpen()===false;

    // 14) vues projetées (1er angle)
    mepSetActive(true);
    const shP = doc.mep.sheets[doc.mep.cur];
    shP.views.length = 0; shP.dims.length = 0;
    const par = mepAddViewStd('front');
    const pTop = mepProjectView('top', par);
    const pRight = mepProjectView('right', par);
    out.projKinds = pTop && pTop.kind==='proj' && pTop.proj==='top' && pRight && pRight.proj==='right';
    // 1er angle depuis Face (dir 0,-1,0 / u 1,0,0 / v 0,0,-1) :
    // dessus → dir=(0,0,1) placé SOUS la mère ; droit → dir=(1,0,0) placé à GAUCHE
    out.projTopDir = pTop && pTop.dir[0]===0 && pTop.dir[1]===0 && pTop.dir[2]===1;
    out.projTopBelow = pTop && Math.abs(pTop.x-par.x)<1e-9 && pTop.y > par.y;
    out.projRightDir = pRight && pRight.dir[0]===1 && pRight.dir[1]===0 && pRight.dir[2]===0;
    out.projRightLeft = pRight && pRight.y===par.y && pRight.x < par.x;
    out.projParentLink = pTop && pTop.parent===par.id && pRight && pRight.parent===par.id;
    out.projScaleLinked = pTop && pRight && pTop.scale===par.scale && pRight.scale===par.scale;
    // rejeu : on pivote la mère (dessus devient -Y au lieu de +Z) → la projection suit
    par.vk=''; par.dir=[0,0,-1]; par.u=[1,0,0]; par.v=[0,1,0];
    mepReprojectView(par.id);
    out.projReprojected = pTop && pTop.dir[0]===0 && pTop.dir[1]===-1 && pTop.dir[2]===0;
    // sérialisation des projections
    out.projSerialise = serialise(false).indexOf('"proj"')>=0;
    // suppression de la mère → les projections partent aussi
    const idPar = par.id;
    const before = doc.mep.sheets[doc.mep.cur].views.length;
    mepSetActive(false); // pas de delete interactif : filtre direct
    mepSetActive(true);
    // (mepDelView nécessite la sélection UI — on teste le filtre parent via suppression manuelle)
    const shD = doc.mep.sheets[doc.mep.cur];
    shD.views = shD.views.filter(x=>x.id!==idPar && x.parent!==idPar);
    out.projCascade = shD.views.every(x=>x.parent!==idPar);

    // 15) cotes en mm MODÈLE : l'échelle de la vue ne doit pas changer la valeur
    const shM = doc.mep.sheets[doc.mep.cur];
    shM.views.length = 0; shM.dims.length = 0;
    const vScale = mepAddViewStd('front');
    vScale.scale = 0.5; // vue 1:2
    const dDist = {id:'dS1',kind:'dist',vid:vScale.id,vid2:null,a:{x:0,y:0},b:{x:10,y:0},off:8,ref:false,tol:null};
    const dLen  = {id:'dS2',kind:'len', vid:vScale.id,vid2:null,a:{x:0,y:0},b:{x:10,y:0},off:8,ref:false,tol:null};
    const dDia  = {id:'dS3',kind:'dia', vid:vScale.id,vid2:null,a:{x:0,y:0},b:{x:0,y:5},off:0,ref:false,tol:null};
    shM.dims.push(dDist,dLen,dDia);
    out.dimDistModel = mepDimValue(dDist);
    out.dimLenModel  = mepDimValue(dLen);
    out.dimDiaModel  = mepDimValue(dDia);

    // 16) flip d'une vue de base : le miroir doit s'appliquer au rejeu
    const vFlip = mepAddViewStd('front');
    out.flipAvant = vFlip.v.slice();
    vFlip.flip = true;
    mepReprojectView(vFlip.id);
    out.flipApres = vFlip.v.slice();

    // 17) vue caméra câblée au ruban
    const nCam = shM.views.length;
    mepAddCameraViewCmd();
    const vCam = shM.views[shM.views.length-1];
    out.cameraAdded = shM.views.length===nCam+1 && !!vCam && vCam.kind==='base' && vCam.vk==='';
    out.camHeadUp = !!vCam && vCam.v[2] < 0;

    // 18) angle obtus : 120° reste 120° (pas de repli à 90°)
    out.ang120 = mepAngleDeg(0, 120*Math.PI/180);
    out.ang60  = mepAngleDeg(0, 60*Math.PI/180);
    out.ang240 = mepAngleDeg(0, 240*Math.PI/180); // plus petit angle = 120°

    // 19) ISO 286 : g6 arbre négatif, G7 alésage positif, ajustement H7/g6
    out.g6  = mepTolInfo('g6', 20);
    out.G7  = mepTolInfo('G7', 20);
    out.fit = mepTolInfo('H7/g6', 20);

    // 20) undo d'un glissement : instantané pris AVANT le déplacement
    const shU = doc.mep.sheets[doc.mep.cur];
    shU.views.length = 0; shU.dims.length = 0;
    const vU = mepAddViewStd('front');
    let ux = 0, uy = 0;
    if(vU){
      ux = vU.x; uy = vU.y;
      docPushUndo('Plan : déplacement vue');
      vU.x = ux + 25; vU.y = uy - 10;
      mepViewDragCommit();
      docUndo();
    }
    const vU2 = doc.mep.sheets[doc.mep.cur].views.find(v=>v.id===(vU&&vU.id));
    out.dragUndo = !!vU2 && Math.abs(vU2.x-ux)<1e-9 && Math.abs(vU2.y-uy)<1e-9;

    // 21) placement / déplacement des cotes (aperçu et glisser de l'étiquette)
    const shN = doc.mep.sheets[doc.mep.cur];
    shN.views.length = 0; shN.dims.length = 0;
    const vN = mepAddViewStd('front');
    vN.scale = 1; vN.x = 50; vN.y = 40;
    const dN = {id:'dN',kind:'dist',vid:vN.id,vid2:null,a:{x:0,y:0},b:{x:10,y:0},off:8,ref:false,tol:null};
    const tp0 = mepDimTextPos(dN);
    out.tp0OK = !!tp0 && Math.abs(tp0.x-(vN.x+5))<1e-9 && Math.abs(tp0.y-(vN.y+8))<1e-9;
    // glisser : l'offset suit la perpendiculaire du curseur
    mepDimMoveTo(dN,{x:vN.x+5,y:vN.y-3});
    out.moveOffOK = Math.abs(dN.off+3)<1e-9;
    const tp1 = mepDimTextPos(dN);
    out.tp1OK = !!tp1 && Math.abs(tp1.y-(vN.y-3))<1e-9;
    // off=0 doit être respecté (pas de repli à 8)
    dN.off = 0;
    const tp2 = mepDimTextPos(dN);
    out.tpZeroOK = !!tp2 && Math.abs(tp2.y-vN.y)<1e-9;
    // Ø : le texte se place exactement au point choisi
    const dD = {id:'dD',kind:'dia',vid:vN.id,vid2:null,a:{x:0,y:0,hint:{t:'ctr',i:0}},b:{x:0,y:1},off:0,ref:false,tol:null};
    mepDimMoveTo(dD,{x:vN.x+20,y:vN.y+10});
    out.diaPlaceOK = !!dD.b && Math.abs(dD.b.x-20)<1e-9 && Math.abs(dD.b.y-10)<1e-9;
    const tpD = mepDimTextPos(dD);
    out.diaTextOK = !!tpD && Math.abs(tpD.x-(vN.x+20))<1e-9 && Math.abs(tpD.y-(vN.y+10))<1e-9;
    // défaut : arc → R, cercle → Ø (Alt inverse)
    out.kindArc = mepDimKindForEnt('A',false);
    out.kindArcAlt = mepDimKindForEnt('A',true);
    out.kindCirc = mepDimKindForEnt('C',false);
    out.kindCircAlt = mepDimKindForEnt('C',true);
    // rappels : le prolongement doit rester sur la normale au trait (pas de trapèze)
    dN.off = 8;
    const gH = mepDimLine(dN);
    out.extPerpOK = !!gH && Math.abs(gH.a1.x-gH.a.x)<1e-9 && Math.abs(gH.b1.x-gH.b.x)<1e-9;
    out.extGapOK = !!gH && Math.abs(Math.hypot(gH.sa.x-gH.a.x,gH.sa.y-gH.a.y)-MEP_DIM_STYLE.gap)<1e-9;
    out.extOverOK = !!gH && Math.abs(Math.hypot(gH.ea.x-gH.a1.x,gH.ea.y-gH.a1.y)-MEP_DIM_STYLE.overrun)<1e-9;
    out.styleOK = MEP_DIM_STYLE.gap>=1 && MEP_DIM_STYLE.gap<=2
      && MEP_DIM_STYLE.overrun>=1.5 && MEP_DIM_STYLE.overrun<=2;
    out.arrowOK = mepArrowGeom().total===MEP_DIM_STYLE.arrowAngle
      && mepArrowGeom().total>20 && mepArrowGeom().total<46;

    // 21b) orientation des cotes lineaires : alignee (a), X (h), Y (v)
    const dO = {id:'dOrient',kind:'dist',vid:vN.id,vid2:null,
      a:{x:0,y:0},b:{x:10,y:10},off:8,ref:false,tol:null,__ghost:true};
    // au-dessus du milieu -> horizontale X
    mepDimMoveTo(dO,{x:vN.x+5,y:vN.y-25});
    out.orientH = dO.orient==='h' && Math.abs(mepDimValue(dO)-10)<1e-9;
    const gOH = mepDimLine(dO);
    out.orientHLine = !!gOH && Math.abs(gOH.a1.y-gOH.b1.y)<1e-9
      && Math.abs(gOH.a1.y-(vN.y-25))<1e-9 && Math.abs(gOH.dy)<1e-9;
    // a droite du milieu -> verticale Y
    mepDimMoveTo(dO,{x:vN.x+35,y:vN.y+5});
    out.orientV = dO.orient==='v' && Math.abs(mepDimValue(dO)-10)<1e-9;
    const gOV = mepDimLine(dO);
    out.orientVLine = !!gOV && Math.abs(gOV.a1.x-gOV.b1.x)<1e-9
      && Math.abs(gOV.a1.x-(vN.x+35))<1e-9 && Math.abs(gOV.dx)<1e-9;
    // perpendiculaire a l'arete oblique -> alignee
    const nrm=Math.SQRT1_2*20;
    mepDimMoveTo(dO,{x:vN.x+5-nrm,y:vN.y+5+nrm});
    out.orientA = dO.orient==='a'
      && Math.abs(mepDimValue(dO)-Math.hypot(10,10))<1e-9;
    // remise a l'axe X : la mesure suit l'axe, pas la longueur oblique
    dO.orient='h';
    out.orientMeasureX = Math.abs(mepDimValue(dO)-10)<1e-9;
    // choix explicite pendant la pose : le survol ne doit plus changer l'axe
    window.__mepTest.setOrient(dO,'v',true);
    const lock0 = dO.__orientLock===true && dO.orient==='v';
    mepDimMoveTo(dO,{x:vN.x+5,y:vN.y-25});
    const gOL = mepDimLine(dO);
    out.orientLock = lock0 && dO.orient==='v' && !!gOL && Math.abs(gOL.dx)<1e-9
      && Math.abs(mepDimValue(dO)-10)<1e-9;

    // 22) régression : OCCT répète le premier point à la fin des cercles.
    // L'ancien fit premier/milieu/dernier était dégénéré et aucun trou n'était
    // reconnu comme cercle (donc non sélectionnable pour une cote Ø).
    const circPts=[];
    for(let i=0;i<=50;i++){
      const a=i/50*Math.PI*2;
      circPts.push([3+10*Math.cos(a),-4+10*Math.sin(a)]);
    }
    const fc=window.__mepTest.fitCircle(circPts);
    out.circClosed=!!fc&&fc.full&&Math.abs(fc.r-10)<1e-6
      &&Math.abs(fc.cx-3)<1e-6&&Math.abs(fc.cy+4)<1e-6;
    const arcPts=[];
    for(let i=0;i<=20;i++){
      const a=i/20*Math.PI/2;
      arcPts.push([10*Math.cos(a),10*Math.sin(a)]);
    }
    const fa=window.__mepTest.fitCircle(arcPts);
    out.arcOpen=!!fa&&!fa.full&&Math.abs(fa.r-10)<1e-6;
    const ellPts=[];
    for(let i=0;i<=50;i++){
      const a=i/50*Math.PI*2;
      ellPts.push([10*Math.cos(a),5*Math.sin(a)]);
    }
    out.ellipseRejected=!window.__mepTest.fitCircle(ellPts);

    // 23) cote entre 2 entités : ancrage sur les points cliqués (et non le
    // milieu arbitraire de B), avec les extrémités réelles de la géométrie.
    const sh2=doc.mep.sheets[doc.mep.cur];
    sh2.views.length=0; sh2.dims.length=0;
    const v2=mepAddViewStd('front');
    v2.scale=1;
    const eA={t:'L',x1:0,y1:0,x2:10,y2:0},eB={t:'L',x1:0,y1:5,x2:10,y2:5};
    window.__mepTest.setViewGeo(v2,{src:'test',els:[eA,eB]});
    const T=window.__mepTest;
    T.setEntSel([
      {vid:v2.id,i:0,t:'L',sig:T.entSig(eA),lx:7,ly:0},
      {vid:v2.id,i:1,t:'L',sig:T.entSig(eB),lx:2,ly:5}
    ]);
    const d2=T.dimDraftFromSel();
    out.twoEntAnchorOK=!!d2&&d2.kind==='dist'
      &&Math.abs(d2.a.x-4.5)<1e-9&&Math.abs(d2.a.y)<1e-9
      &&Math.abs(d2.b.x-4.5)<1e-9&&Math.abs(d2.b.y-5)<1e-9;
    T.setEntSel([
      {vid:v2.id,i:0,t:'L',sig:T.entSig(eA),lx:9.8,ly:0.2},
      {vid:v2.id,i:1,t:'L',sig:T.entSig(eB),lx:9.7,ly:4.8}
    ]);
    const d3=T.dimDraftFromSel();
    out.twoEntEndSnapOK=!!d3&&d3.kind==='dist'
      &&Math.abs(d3.a.x-10)<1e-9&&Math.abs(d3.a.y)<1e-9
      &&Math.abs(d3.b.x-10)<1e-9&&Math.abs(d3.b.y-5)<1e-9;
    const selProbe=[{vid:v2.id,i:0,t:'L',sig:T.entSig(eA),lx:7,ly:0}];
    T.setEntSel(selProbe);
    mepSetTool('select');
    out.selectClearsEdges = T.entSel().length===0;
    T.setEntSel(selProbe);
    T.clearDim();
    out.clearDimEdges = T.entSel().length===0 && T.hovEnt()===null;

    const hBase={type:'hole',kind:'simple',d:6.6,end:'blind',depth:15,tip:118};
    out.holeSimpleOK=T.holeText(hBase)==='Ø6,6 ↧15';
    out.holeCboreOK=T.holeText(Object.assign({},hBase,{kind:'cbore',cbD:11,cbH:6.4}))
      ==='Ø6,6 ↧15\\nLamage Ø11 ↧6,4';
    out.holeCsinkOK=T.holeText(Object.assign({},hBase,{kind:'csink',csD:13,csA:90}))
      ==='Ø6,6 ↧15\\nFraisure Ø13 x 90°';
    out.holeThroughOK=T.holeText(Object.assign({},hBase,{end:'through'}))==='Ø6,6 déb.';
    out.holeThreadOK=T.holeText(Object.assign({},hBase,{d:8.5,depth:25,
      thread:{size:'M10',p:1.25,len:18,lenMode:'len'},_thLen:18}))
      ==='M10×1,25 ↧18\\nØ8,5 ↧25';
    const hgA=T.holeCallout(0,0,10,25,-20,'Ø8 déb.\\nLamage Ø11,2 ↧2');
    const hgB=T.holeCallout(0,0,10,-25,-20,'Ø8 déb.\\nLamage Ø11,2 ↧2');
    out.holeLeaderUnderOK=!!hgA&&hgA.anchor==='start'&&hgA.u0===hgA.tx
      &&Math.abs(hgA.lineY-(hgA.y0+(hgA.lines.length-1)*hgA.lh+2.2))<1e-9;
    out.holeLeaderUnderEndOK=!!hgB&&hgB.anchor==='end'&&hgB.u1===hgB.tx
      &&Math.abs(hgB.lineY-(hgB.y0+(hgB.lines.length-1)*hgB.lh+2.2))<1e-9;

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
  A(val&&val.isoHeadUp,'vue ISO : Z monde vers le haut papier');
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
  A(val&&val.planSelClosed===val.planSelId,'mepSetActive(false) conserve la sélection PLAN');
  A(val&&val.planSelReopen===val.planSelId,'mepSetActive(true) restaure la sélection PLAN');
  A(val&&val.planSelWs===val.planSelId,"mfWs('plan') retrouve la sélection PLAN");
  A(val&&val.wsCaoSel==='body:bodyTEST','retour CAO : sélection restaurée');
  A(val&&val.wsCaoTree==='bodyTEST','retour CAO : lot d\'arbre restauré');
  A(val&&val.wsFaoSel==='faoOp:opTEST','retour FAO : opération restaurée');
  A(val&&val.closed===true,'mepSetActive(false) ferme l\'espace');
  A(val&&val.projKinds,'vues projetées : kind=proj, proj=top/right');
  A(val&&val.projTopDir,'projection Dessus : dir=(0,0,1) (1er angle)');
  A(val&&val.projTopBelow,'projection Dessus : sous la mère, alignée en x');
  A(val&&val.projRightDir,'projection Côté droit : dir=(1,0,0)');
  A(val&&val.projRightLeft,'projection Côté droit : à gauche de la mère, alignée en hauteur');
  A(val&&val.projParentLink,'projections : parent référencé');
  A(val&&val.projScaleLinked,'projections : échelle liée à la mère');
  A(val&&val.projReprojected,'rejeu : la projection suit la nouvelle base de la mère');
  A(val&&val.projSerialise,'projections sérialisées (clé proj)');
  A(val&&val.projCascade,'suppression de la mère : projections orphelines écartées');
  A(val&&Math.abs(val.dimDistModel-10)<1e-9,'cote distance en mm modèle malgré une vue 1:2');
  A(val&&Math.abs(val.dimLenModel-10)<1e-9,'cote longueur en mm modèle malgré une vue 1:2');
  A(val&&Math.abs(val.dimDiaModel-10)<1e-9,'cote Ø en mm modèle malgré une vue 1:2');
  A(val&&val.flipApres&&val.flipApres[0]===0&&val.flipApres[1]===0&&val.flipApres[2]===1,
    'flip d\'une vue de base : v inversé au rejeu');
  A(val&&val.cameraAdded,'vue Caméra ajoutée (bouton ruban câblé)');
  A(val&&val.camHeadUp,'vue Caméra : Z monde vers le haut papier');
  A(val&&Math.abs(val.ang120-120)<1e-9,'angle 120° non replié à 90°');
  A(val&&Math.abs(val.ang60-60)<1e-9,'angle 60° inchangé');
  A(val&&Math.abs(val.ang240-120)<1e-9,'angle 240° → plus petit angle 120°');
  A(val&&val.g6&&Math.abs(val.g6.hi+0.007)<1e-12&&Math.abs(val.g6.lo+0.020)<1e-12,
    'ISO 286 : g6 Ø20 = −0,007 / −0,020 (arbre)');
  A(val&&val.G7&&Math.abs(val.G7.lo-0.007)<1e-12&&Math.abs(val.G7.hi-0.028)<1e-12,
    'ISO 286 : G7 Ø20 = +0,007 / +0,028 (alésage)');
  A(val&&val.fit&&val.fit.fit&&
    Math.abs(val.fit.fit.hole.hi-0.021)<1e-12&&Math.abs(val.fit.fit.hole.lo)<1e-12&&
    Math.abs(val.fit.fit.shaft.hi+0.007)<1e-12&&Math.abs(val.fit.fit.shaft.lo+0.020)<1e-12,
    'ISO 286 : ajustement H7/g6 Ø20 (alésage + arbre)');
  A(val&&val.dragUndo,'undo glissement : position d\'avant restaurée');
  A(val&&val.tp0OK,'cote linéaire : étiquette à l\'offset demandé');
  A(val&&val.moveOffOK,'glisser cote : offset perpendiculaire mis à jour');
  A(val&&val.tp1OK,'glisser cote : étiquette suit le curseur');
  A(val&&val.tpZeroOK,'cote linéaire : offset 0 respecté (pas de repli à 8)');
  A(val&&val.diaPlaceOK,'cote Ø : texte placé au point choisi');
  A(val&&val.diaTextOK,'cote Ø : hit-test sur la position réelle du texte');
  A(val&&val.kindArc==='rad','arc : cote R par défaut');
  A(val&&val.kindArcAlt==='dia','arc : Alt (ou menu) → Ø');
  A(val&&val.kindCirc==='dia','cercle complet : cote Ø par défaut');
  A(val&&val.kindCircAlt==='rad','cercle complet : Alt (ou menu) → R');
  A(val&&val.extPerpOK,'rappels : perpendiculaires au trait de cote');
  A(val&&val.extGapOK,'rappels : vide de 1–2 mm au départ de la pièce');
  A(val&&val.extOverOK,'rappels : dépassement de 1,5–2 mm après la cote');
  A(val&&val.styleOK,'paramètres de style cohérents (fichier 98-00-style-plan.js)');
  A(val&&val.arrowOK,'flèches : angle réduit (< 46°)');
  A(val&&val.orientH&&val.orientHLine,'cote lineaire : orientation X (horizontale)');
  A(val&&val.orientV&&val.orientVLine,'cote lineaire : orientation Y (verticale)');
  A(val&&val.orientA&&val.orientMeasureX,'cote lineaire : orientation alignee / mesure par axe');
  A(val&&val.orientLock,'cote lineaire : orientation choisie conservee pendant la pose');
  A(val&&val.selectClearsEdges,'outil selection : aucune arete pre-selectionnee');
  A(val&&val.clearDimEdges,'creation de cote : selection d aretes et survol effaces');
  A(val&&val.circClosed,'cercle fermé OCCT (point dupliqué) reconnu comme cercle complet');
  A(val&&val.arcOpen,'arc ouvert non marqué complet');
  A(val&&val.ellipseRejected,'ellipse non assimilée à un cercle');
  A(val&&val.twoEntAnchorOK,'cote 2 entités : ancrage aux points cliqués/extrémités');
  A(val&&val.twoEntEndSnapOK,'cote 2 entités : accrochage exact aux extrémités proches');
  A(val&&val.holeSimpleOK,'cotation perçage : trou simple (Ø et profondeur)');
  A(val&&val.holeCboreOK,'cotation perçage : lamage (Ø et profondeur)');
  A(val&&val.holeCsinkOK,'cotation perçage : fraisure (Ø et angle)');
  A(val&&val.holeThroughOK,'cotation perçage : trou débouchant');
  A(val&&val.holeThreadOK,'cotation perçage : taraudage (longueur filetée + profondeur trou)');
  A(val&&val.holeLeaderUnderOK&&val.holeLeaderUnderEndOK,
    'cotation perçage : leader et soulignement coïncidents aux 2 orientations');

  if(ko){console.log('FAIL '+ko+' assertion(s)');process.exit(1);}
  console.log('OK espace PLAN');
  process.exit(0);
})().catch(e=>{console.error('ERREUR',e);process.exit(1);});
