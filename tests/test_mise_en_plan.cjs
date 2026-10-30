// 2026-10-19 : espace PLAN (98-mep-*.js) — modèle doc.mep, persistance, planches, vues, cotes, esquisse.
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
    // orientation de la vue principale (2026-10-30) : Face → Côté droit, les projections suivent
    {
      const shO = doc.mep.sheets[doc.mep.cur];
      const b = mepAddViewStd('front');
      const t = mepProjectView('top', b), r = mepProjectView('right', b);
      mepSetViewOrient(b.id, 'right');
      // base Côté droit : dir (1,0,0) u (0,1,0) v (0,0,-1) ; dessus → dir (0,0,1) ; droit de la droite → arrière (0,1,0)
      const eq=(a,c)=>a&&a.every((x,i)=>Math.abs(x-c[i])<1e-9);
      out.orientOK = b.vk==='right' && b.label==='Côté droit' && eq(b.dir,[1,0,0])
        && eq(t.dir,[0,0,1]) && eq(t.u,[0,1,0]) && eq(r.dir,[0,1,0])
        && Math.abs(t.x-b.x)<1e-9 && t.y>b.y && Math.abs(r.y-b.y)<1e-9 && r.x<b.x;
      mepSetViewOrient(b.id, 'top');
      out.orientTop = b.vk==='top' && eq(t.dir,[0,1,0]) && eq(b.dir,[0,0,1]);
      shO.views = shO.views.filter(x=>x.id!==b.id && x.parent!==b.id);
    }
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
    // 18b) les 4 secteurs de deux droites à 60° (θ, 180−θ) et l'angle rentrant (360−θ)
    const R=Math.PI/180,secDeg=(q,big)=>Math.abs(mepAngSector({q,big},{a1:0,a2:60*R}).dd)/R;
    out.angSect = [0,1,2,3].map(q=>secDeg(q,false)).concat([0,1,2,3].map(q=>secDeg(q,true)));
    // 18c) génératrice discrétisée → un seul trait ; nœud de degré 3 (arête réelle) gardé
    const ml=mepMergeCollinear([{t:'L',x1:0,y1:5,x2:3,y2:5,k:'sharp'},{t:'L',x1:3,y1:5,x2:7,y2:5,k:'sharp'},{t:'L',x1:7,y1:5,x2:10,y2:5,k:'sharp'},
      {t:'L',x1:10,y1:5,x2:20,y2:5,k:'sharp'},{t:'L',x1:10,y1:5,x2:10,y2:0,k:'sharp'},{t:'L',x1:20,y1:5,x2:25,y2:6,k:'sharp'}]);
    out.mergeL = ml.map(e=>[e.x1,e.x2].join('-')).join(' ');
    out.dsymTxt = mepDimText({kind:'dist',dsym:'Ø'},20);
    out.angSectAt = [30,120,210,300].map(a=>mepAngSectorAt(0,60*R,a*R));

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

    // 20b) une modification purement PLAN (glissement de vue) ne doit pas jeter
    // le cache de géométrie : sinon chaque geste relance le HLR (latence 50-100 ms).
    const vCache = mepAddViewStd('front');
    const fakeGeo = {src:'cache', els:[]};
    if(vCache){
      window.__mepTest.setViewGeo(vCache, fakeGeo);
      const geoBefore = window.__mepTest.geo(vCache);
      window.mepViewDragCommit();
      const geoAfter = window.__mepTest.geo(vCache);
      out.planEditKeepsGeoCache = geoBefore===fakeGeo && geoAfter===fakeGeo;
    }

    // 21) placement / déplacement des cotes (aperçu et glisser de l'étiquette)
    const shN = doc.mep.sheets[doc.mep.cur];
    shN.views.length = 0; shN.dims.length = 0;
    const vN = mepAddViewStd('front');
    vN.scale = 1; vN.x = 50; vN.y = 40;
    const dN = {id:'dN',kind:'dist',vid:vN.id,vid2:null,a:{x:0,y:0},b:{x:10,y:0},off:8,ref:false,tol:null};
    const tp0 = mepDimTextPos(dN);
    out.tp0OK = !!tp0 && Math.abs(tp0.x-(vN.x+5))<1e-9 && Math.abs(tp0.y-(vN.y+6))<1e-9;
    // glisser : l'offset suit la perpendiculaire du curseur
    mepDimMoveTo(dN,{x:vN.x+5,y:vN.y-3});
    out.moveOffOK = Math.abs(dN.off+3)<1e-9;
    const tp1 = mepDimTextPos(dN);
    out.tp1OK = !!tp1 && Math.abs(tp1.y-(vN.y-5))<1e-9;
    // off=0 doit être respecté (pas de repli à 8)
    dN.off = 0;
    const tp2 = mepDimTextPos(dN);
    out.tpZeroOK = !!tp2 && Math.abs(tp2.y-(vN.y-2))<1e-9;
    // glisser l'étiquette : décalage le long de la cote, puis retour exact au centre
    shN.dims.push(dN);
    // en outil cotation, une cote posée s'attrape par n'importe quel trait
    dN.off = 8; dN.txtOff = 0; window.__mepTest.setEntSel([]); mepSetTool('dim'); window.mepRefresh();
    const gHit = mepDimLine(dN);
    const extPt = {x:(gHit.sa.x+gHit.ea.x)/2,y:(gHit.sa.y+gHit.ea.y)/2};
    out.dimAnyLineHitOK = window.__mepTest.dimAt(extPt.x,extPt.y)===dN;
    window.__mepTest.dimPaperDown(extPt.x,extPt.y);
    const pkHit = window.__mepTest.pick();
    out.dimToolDragOK = !!(pkHit&&pkHit.kind==='dimDrag'&&pkHit.id==='dN');
    window.__mepTest.clearPick(); dN.off = 0;
    const dT = {id:'dT',kind:'dist',vid:vN.id,vid2:null,a:{x:0,y:0},b:{x:40,y:0},
      off:8,ref:false,tol:null};
    dT.txtOff = 0;
    mepDimMoveTo(dT,{x:vN.x+37,y:vN.y+8},{labelHit:true});
    out.txtShiftOK = Math.abs(dT.off-8)<1e-9 && Math.abs(dT.txtOff-17)<1e-9;
    const tpS = mepDimTextPos(dT);
    out.txtShiftPosOK = !!tpS && Math.abs(tpS.x-(vN.x+37))<1e-9
      && Math.abs(tpS.y-(vN.y+6))<1e-9;
    mepDimMoveTo(dT,{x:vN.x+25,y:vN.y+8},{labelHit:true});
    out.txtSnapOK = Math.abs(dT.txtOff)<1e-9;
    const extT = window.__mepTest.dimExtent(dT);
    out.txtExtentOK = !!extT && Math.abs(extT.start+20)<1e-9
      && Math.abs(extT.end-20)<1e-9;
    dT.txtOff = 19; // étiquette nettement au-delà du bout (texte ISO h 3,5)
    const extO = window.__mepTest.dimExtent(dT);
    out.txtExtendOK = !!extO && extO.end>extO.half+1
      && extO.end>=19+window.__mepTest.dimLabelHalf(dT,mepDimValue(dT))-1e-9;
    // texte vertical : toujours à gauche du trait de cote
    const dV = {id:'dV',kind:'dist',vid:vN.id,vid2:null,a:{x:0,y:0},b:{x:0,y:30},
      off:8,ref:false,tol:null,orient:'v'};
    const gV = mepDimLine(dV),tpV = mepDimTextPos(dV);
    out.vertLeftOK = !!gV && !!tpV && Math.abs(gV.a1.x-gV.b1.x)<1e-9
      && tpV.x<gV.a1.x-1 && Math.abs(tpV.y-(vN.y+15))<1e-9;
    const offV=dV.off;
    mepDimMoveTo(dV,{x:gV.a1.x-8.5,y:vN.y+20},{labelHit:true});
    const tpV2=mepDimTextPos(dV);
    out.vertDragOK = Math.abs(dV.off-offV)<1e-9 && Math.abs(dV.txtOff)<1e-9
      && !!tpV2 && tpV2.x<gV.a1.x-1;
    dN.txtOff = 4;
    const gA = mepDimLine(dN);
    out.arrowHitOK = !!gA && window.__mepTest.dimArrowAt(gA.a1.x,gA.a1.y)===dN;
    dN.arr = 'out';
    out.arrowOutOK = mepDimLine(dN) && dN.arr==='out';
    dN.arr = 'in';
    out.dblCoteOK = window.__mepTest.dimToggleArrows(dN)===true && dN.arr==='out';
    // V0.23.5 : interligne des écarts au prorata de la hauteur des cotes (≈ ancien 0,72 × sub + 0,45 à 3,5 mm)
    const subGap=(window.__mepTest.dimStyle().textHeight||7)*0.68,lh0=window.__mepTest.dimTolLineH();
    out.tolGap45OK = Math.abs(lh0-subGap*0.855)<1e-9 && Math.abs(lh0-(subGap*0.72+0.45))<0.05;
    dN.txtOff = 0; dN.arr = 'in';
    const ptDbl = window.__mepTest.dimTextParts({kind:'len',tol:{m:'dbl',hi:0.1,lo:-0.05}},20);
    out.tolStackOK = ptDbl.main==='20' && ptDbl.up==='+0.1' && ptDbl.lo==='−0.05';
    const ptPm = window.__mepTest.dimTextParts({kind:'dia',tol:{m:'pm',s:0.1}},20);
    out.tolPmOK = ptPm.main==='20' && ptPm.sym==='±0.1' && !ptPm.up && !ptPm.lo;
    const ptPmAff = window.__mepTest.dimTextParts({kind:'len',pre:'2x',post:'THRU',
      tol:{m:'pm',s:0.1}},20);
    out.tolPmAffOK = ptPmAff.main==='2x 20' && ptPmAff.sym==='±0.1 THRU';
    const ptDiaPre = window.__mepTest.dimSymbolParts({kind:'dia',pre:'2x',post:'THRU',
      tol:{m:'pm',s:0.1}},20,'Ø');
    out.diaPreOK = ptDiaPre.main==='2x Ø20' && ptDiaPre.sym==='±0.1 THRU';
    const ptRadPre = window.__mepTest.dimSymbolParts({kind:'rad',pre:'4x',
      tol:{m:'dbl',hi:0.1,lo:-0.05}},20,'R');
    out.radPreOK = ptRadPre.main==='4x R20' && ptRadPre.up==='+0.1' && ptRadPre.lo==='−0.05';
    const ptCls = window.__mepTest.dimTextParts({kind:'dia',tol:{m:'cls',cls:'H7'}},20);
    // classe ISO : écarts entre parenthèses, empilés comme une tolérance bilatérale (2026-10-22-007)
    const ptCls2 = window.__mepTest.dimTextParts({kind:'len',tol:{m:'cls',cls:'h7'}},20);
    const ptFit = window.__mepTest.dimTextParts({kind:'dia',tol:{m:'cls',cls:'H7/g6'}},20);
    const ptClsDia = window.__mepTest.dimSymbolParts({kind:'dia',post:'THRU',tol:{m:'cls',cls:'H7'}},20,'Ø');
    out.tolClsOK = ptCls.main==='20 H7' && ptCls.up==='+0.021' && ptCls.lo==='0' && ptCls.par===true
      && ptCls2.up==='0' && ptCls2.lo==='−0.021' && ptFit.main==='20 H7/g6' && !ptFit.up && !ptFit.par
      && ptClsDia.main==='Ø20 H7' && ptClsDia.post==='THRU';
    const ptTxt = window.__mepTest.dimTextParts({kind:'len',txt:'X',tol:{m:'pm',s:0.1}},20);
    out.tolTxtOK = ptTxt.main==='X' && !ptTxt.up && !ptTxt.lo;
    const ptAff = window.__mepTest.dimTextParts({kind:'len',pre:'2x',post:'THRU'},20);
    out.affixOK = ptAff.main==='2x 20 THRU' && !ptAff.up && !ptAff.lo;
    const ptAffDbl = window.__mepTest.dimTextParts({kind:'len',pre:'2x',post:'THRU',
      tol:{m:'dbl',hi:0.1,lo:-0.05}},20);
    out.affixTolOK = ptAffDbl.main==='2x 20 THRU' && ptAffDbl.up==='+0.1' && ptAffDbl.lo==='−0.05';
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
    // 23b) entre deux droites parallèles : le rappel part du coin situé côté cote,
    // pas du point cliqué au milieu de l'arête (sinon le vide de 1,5 mm est caché).
    v2.x=50;v2.y=40;
    mepDimMoveTo(d2,{x:v2.x+25,y:v2.y+2.5});
    const gParV=mepDimLine(d2);
    out.parExtGapRight = !!gParV&&Math.abs(gParV.sa.x-61.5)<1e-9
      &&Math.abs(gParV.sb.x-61.5)<1e-9
      &&Math.abs(gParV.sa.y-40)<1e-9&&Math.abs(gParV.sb.y-45)<1e-9;
    mepDimMoveTo(d2,{x:v2.x-25,y:v2.y+2.5});
    const gParL=mepDimLine(d2);
    out.parExtGapLeft = !!gParL&&Math.abs(gParL.sa.x-48.5)<1e-9
      &&Math.abs(gParL.sb.x-48.5)<1e-9;


    const selProbe=[{vid:v2.id,i:0,t:'L',sig:T.entSig(eA),lx:7,ly:0}];
    T.setEntSel(selProbe);
    mepSetTool('select');
    out.selectClearsEdges = T.entSel().length===0;
    T.setEntSel(selProbe);
    T.clearDim();
    out.clearDimEdges = T.entSel().length===0 && T.hovEnt()===null;

    const hBase={type:'hole',kind:'simple',d:6.6,end:'blind',depth:15,tip:118};
    out.holeSimpleOK=T.holeText(hBase)==='Ø6.6 ↧15';
    out.holeCboreOK=T.holeText(Object.assign({},hBase,{kind:'cbore',cbD:11,cbH:6.4}))
      ==='Ø6.6 ↧15\\nLamage Ø11 ↧6.4';
    out.holeCsinkOK=T.holeText(Object.assign({},hBase,{kind:'csink',csD:13,csA:90}))
      ==='Ø6.6 ↧15\\nFraisure Ø13 x 90°';
    out.holeThroughOK=T.holeText(Object.assign({},hBase,{end:'through'}))==='Ø6.6 déb.';
    out.holeThreadOK=T.holeText(Object.assign({},hBase,{d:8.5,depth:25,
      thread:{size:'M10',p:1.25,len:18,lenMode:'len'},_thLen:18}))
      ==='M10×1.25 ↧18\\nØ8.5 ↧25';
    const hgA=T.holeCallout(0,0,10,25,-20,'Ø8 déb.\\nLamage Ø11,2 ↧2');
    const hgB=T.holeCallout(0,0,10,-25,-20,'Ø8 déb.\\nLamage Ø11,2 ↧2');
    out.holeLeaderUnderOK=!!hgA&&hgA.anchor==='start'&&hgA.u0===hgA.tx
      &&Math.abs(hgA.lineY-(hgA.y0+(hgA.lines.length-1)*hgA.lh+1.95))<1e-9 // souligné : 0,3 h (jambages) + 0,9 (halo), h 3,5
      &&Math.abs((hgA.u1-hgA.u0)-15*4.888*0.6)<1e-6; // souligné = texte (h 3,5), plus 3,8 mm par caractère
    out.holeLeaderUnderEndOK=!!hgB&&hgB.anchor==='end'&&hgB.u1===hgB.tx
      &&Math.abs(hgB.lineY-(hgB.y0+(hgB.lines.length-1)*hgB.lh+1.95))<1e-9;

    // 24) réglages « Paramètres — Plan » : hauteur/couleur des cotes, flèches.
    window.__mepTest.setViewSel(null);
    const ctl=window.__mepTest.dimSideControls();
    out.dimSettingsUI = ctl.num.length>=3 && ctl.color.length>=1;
    out.dimSettingsDefaults = ctl.num.some(v=>v===7)
      && ctl.color.length>=1 && ctl.check.indexOf('mepDimColTheme')>=0 && window.__mepTest.dimStyle().color==='theme';
    // ISO 3098 : h = majuscules ; corps de police = h / 0,716 (5 mm → 6,983)
    window.__mepTest.setDimStyle({dimH:5,lblH:7,color:'#ff0000',arrowAngle:45,arrowLen:5});
    const ag=window.mepArrowGeom();
    out.dimStyleApplied = ag.total===45 && Math.abs(ag.len-5)<1e-9
      && window.__mepTest.cssVar('--mepDimH')==='6.983px' && window.__mepTest.cssVar('--mepLblH')==='9.777px'
      && window.__mepTest.cssVar('--mepDimCol')==='#ff0000';
    window.__mepTest.resetDimStyle();
    const ds=window.__mepTest.dimStyle();
    out.dimStyleReset = ds.dimH===3.5 && ds.lblH===5 && ds.noteH===3.5 && Math.abs(ds.textHeight-4.888)<1e-9 && ds.color==='theme'
      && ds.arrowAngle===36 && ds.arrowLen===7 && window.mepArrowGeom().total===36;
    // séparateur décimal : point (et non virgule) dans les valeurs du plan
    out.fmtDot = window.__mepTest.fmt(21.1)==='21.1'
      && window.__mepTest.fmt(1.5)==='1.5'
      && window.__mepTest.fmt(0.125)==='0.125';

    // 25) ombrage SVG par vue : option visible, cache invalidé, face avant/arrière.
    window.__mepTest.setViewSel(v2.id);
    const vctl=window.__mepTest.dimSideControls();
    out.shadeUI=vctl.check.indexOf('mepChkShade')>=0;
    out.render3dUI=vctl.check.indexOf('mepChkRender3d')>=0;
    window.__mepTest.setViewSel(null);
    const sv={id:'__shade_test__',dir:[0,0,1],u:[1,0,0],v:[0,-1,0],
      bodyId:'__shade_none__',mode:'wire',shade:false};
    const fakeShade={src:'fake-shade',els:[]};
    window.__mepTest.setViewGeo(sv,fakeShade);
    out.shadeGeoCache=window.__mepTest.geo(sv)===fakeShade;
    sv.shade=true;
    const rebuilt=window.__mepTest.geo(sv);
    out.shadeSig=!!rebuilt&&rebuilt!==fakeShade&&rebuilt.src!=='fake-shade';
    const rv={id:'__render3d_test__',dir:[0,0,1],u:[1,0,0],v:[0,-1,0],
      bodyId:'__render3d_none__',mode:'wire',render3d:false};
    const fakeR3d={src:'fake-render3d',els:[]};
    window.__mepTest.setViewGeo(rv,fakeR3d);
    out.render3dGeoCache=window.__mepTest.geo(rv)===fakeR3d;
    rv.render3d=true;
    const rr=window.__mepTest.geo(rv);
    out.render3dSig=!!rr&&rr!==fakeR3d&&rr.src!=='fake-render3d';
    const ir1=window.__mepTest.imgRect({x:10,y:20,scale:1},{lx:-0.5,ly:-15.5,lw:21,lh:21});
    const ir2=window.__mepTest.imgRect({x:40,y:5,scale:2},{lx:-0.5,ly:-15.5,lw:21,lh:21});
    out.render3dFollow=ir1.x===9.5&&ir1.y===4.5&&ir1.w===21&&ir1.h===21
      &&ir2.x===39&&ir2.y===-26&&ir2.w===42&&ir2.h===42;
    // 26) axes de perçage : réglages par vue, détection et géométrie manuelle.
    out.axisUI=vctl.check.indexOf('mepChkAutoAxes')>=0
      &&vctl.check.indexOf('mepChkAutoPitch')>=0;
    out.axisDefaults=Array.isArray(v2.axes)&&v2.autoAxes===false&&v2.autoPitch===false;
    T.setAxisMode('pitch');
    out.axisModeOK=T.axisMode()==='pitch'&&T.tool()==='axis';
    T.setAxisMode('hole');
    const ptsC=[
      {x:10,y:0,r:1,fid:'h1',pid:'p1'},{x:0,y:10,r:1,fid:'h2',pid:'p2'},
      {x:-10,y:0,r:1,fid:'h3',pid:'p3'},{x:0,y:-10,r:1,fid:'h4',pid:'p4'}
    ];
    const fitC=T.axisFitCircle(ptsC);
    const grpC=T.axisPitchGroups(ptsC,{scale:1});
    out.axisFitOK=!!fitC&&Math.abs(fitC.r-10)<1e-9;
    out.axisPitchOK=grpC.length===1&&grpC[0].pts.length===4;
    const ptsL=[{x:0,y:0,r:1,fid:'l1',pid:'p1'},{x:10,y:0,r:1,fid:'l2',pid:'p2'},
      {x:20,y:0,r:1,fid:'l3',pid:'p3'}];
    out.axisLineOK=T.axisLineGroups(ptsL,{scale:1}).length===1
      &&T.axisLineGroups([{x:0,y:0,r:1},{x:10,y:0,r:1},{x:5,y:3,r:1}],{scale:1}).length===0;
    const av={id:'__axis_view__',x:10,y:20,scale:2,u:[1,0,0],v:[0,0,-1],dir:[0,-1,0],axes:[]};
    const axFree={id:'axFree',kind:'free',a:{x:0,y:0},b:{x:5,y:0}};
    const fp=T.axisManual(av,axFree);
    out.axisFreeOK=!!fp&&fp.length===1&&fp[0].t==='L'&&fp[0].x1===0&&fp[0].x2===5;
    av.axes=[axFree];
    sh2.views.push(av);
    const hitAx=T.axisAt(15,20);
    out.axisHitOK=!!hitAx&&hitAx.id==='axFree';
    // 2026-10-22-013 : tout trait d'axe s'étire (v.axExt), s'accroche et se cote
    try{
      av.axes=[];av.axExt={};
      const autoL=[{t:'L',x1:0,y1:5,x2:10,y2:5,cls:'mepAxisCross'}];
      let ls=T.axisLines(av,autoL);
      const ak=ls[0]&&ls[0].ak;
      av.axExt[ak]=[1,2];
      ls=T.axisLines(av,autoL);
      out.axisExtOK=!!ak&&ls[0].ak===ak&&Math.abs(ls[0].x1+1)<1e-9&&Math.abs(ls[0].x2-12)<1e-9
        &&ls[0].bx1===0&&ls[0].bx2===10&&ls[0].cls==='mepAxis'; // croix allongée → trait d'axe mixte fin
      const sp=T.snapPt(34.6,30.4);
      out.axisSnapOK=!!sp.hit&&sp.hit.t==='axEnd'&&Math.abs(sp.x-34)<1e-9&&Math.abs(sp.y-30)<1e-9;
      out.axisSnapOff=!T.snapPt(34.6,30.4,{noAxes:true}).hit||T.snapPt(34.6,30.4,{noAxes:true}).hit.t!=='axEnd';
      const ah=T.axisAt(33.8,30.2);
      out.axisEndHit=!!ah&&ah.ak===ak&&ah.end===2&&ah.id===null;
      const he=T.hitEnt(20,30.3,{axes:true});
      out.axisDimHit=!!he&&he.i==='ax:'+ak&&he.e.t==='L'&&!T.hitEnt(20,30.3);
      const eb=T.entByHint(av,{t:'seg',i:'ax:'+ak});
      out.axisHintOK=!!eb&&Math.abs(eb.x2-12)<1e-9&&T.entSig(eb)==='X'+ak;
    }catch(e){out.axisExtOK=false;out.axisExtErr=String(e&&e.stack||e);}
    // coupe : le 1er point s'accroche au bout d'un axe hors du cadre de sa vue
    try{
      av.axes=[{id:'axOut',kind:'free',a:{x:0,y:5},b:{x:40,y:5}}];av.axExt={}; // bout papier (90,30)
      window.mepBeginSectionCmd();
      window.__mepTest.dimPaperDown(90.4,30.3);
      const c=window.__mepTest.vcmd();
      out.secOutAxis=!!c&&c.kind==='section'&&c.stage===1&&c.par===av.id&&Math.abs(c.A.x-40)<1e-6&&Math.abs(c.A.y-5)<1e-6;
      if(!out.secOutAxis)out.secOutErr=JSON.stringify(c&&{st:c.stage,par:c.par,A:c.A});
      window.__mepTest.dimPaperDown(150,31);
      const c2=window.__mepTest.vcmd();
      out.secOutAxis2=!!c2&&c2.pts&&c2.pts.length===2;
      mepSetTool('select');
    }catch(e){out.secOutAxis=false;out.secOutErr=String(e&&e.stack||e);}
    sh2.views.pop();
    v2.axes=[axFree];v2.autoAxes=true;v2.autoPitch=true;
    out.axisSerialise=serialise(false).indexOf('axFree')>=0
      &&serialise(false).indexOf('"autoAxes":true')>=0;
    v2.axes=[];v2.autoAxes=false;v2.autoPitch=false;
    mepSetTool('select');
    const sf=window.__mepTest.shadeTri(sv,[0,0,0],[10,0,0],[0,10,0],0x336699,1);
    out.shadeTri=!!sf&&sf.p[0][0]===0&&sf.p[1][0]===10&&sf.p[2][1]===-10
      &&sf.o===1&&/^#[0-9a-f]{6}$/.test(sf.c);
    out.shadeBack=window.__mepTest.shadeTri(sv,[0,0,0],[0,10,0],[10,0,0],0x336699,1)===null;
    const st=window.__mepTest.shadeTri(sv,[0,0,0],[10,0,0],[0,10,0],0x336699,0.4);
    out.shadeOpacity=!!st&&st.o===0.4;
    // intégration : une maille triangulaire réelle devient une face projetée
    try{
      const pos={count:3,getX:i=>[0,10,0][i],getY:i=>[0,0,10][i],getZ:()=>0};
      const fb={id:'__shade_body__',bodyId:'__shade_body__',color:0x336699,
        mesh:{geometry:{attributes:{position:pos},index:null},
          matrixWorld:{elements:[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]},
          material:{transparent:false,opacity:1},visible:true,updateMatrixWorld(){}}};
      const nb=bodies.length;bodies.push(fb);
      const ff=window.__mepTest.shadeFaces({id:'__shade_face__',dir:[0,0,1],
        u:[1,0,0],v:[0,-1,0],bodyId:'__shade_body__',scale:1,shade:true});
      bodies.length=nb;
      out.shadeFaces=ff.length===1&&ff[0].p[1][0]===10&&ff[0].p[2][1]===-10
        &&ff[0].o===1;
    }catch(e){out.shadeFaces=false;}

    // V0.3.11 : cartouche enrichi (matière, traitement, tol. générales, révisions) + exports
    try{
      const sh0=doc.mep.sheets[doc.mep.cur];
      Object.assign(sh0.title,{matiere:'EN AW-2017',traitement:'Anodisation',tolgen:'ISO 2768-m',
        revs:[{i:'A',d:'01/10/2026',n:'F. Justet',t:'Création'},{i:'B',d:'21/10/2026',t:'Perçages'}]});
      const vals=window.__mepTest.titleTexts(sh0),revs=vals;
      out.cartRich=vals.indexOf('EN AW-2017')>=0&&vals.indexOf('Anodisation')>=0&&vals.indexOf('ISO 2768-m')>=0
        &&vals.indexOf('B')>=0; // indice = dernière révision
      out.cartRevs=revs.indexOf('Création')>=0&&revs.indexOf('Perçages')>=0&&revs.indexOf('MODIFICATION')>=0;
      out.cartRevNom=revs.indexOf('NOM')>=0&&revs.indexOf('F. Justet')>=0;
      // largeur totale imposée : le tableau finit au bord droit du cadre et mesure w
      sh0.title.revSt={w:150,h:3.5,lw:0.5};
      {const els=[];const mk=(tag,a)=>{const o=Object.assign({tag,textContent:''},a);els.push(o);return o;};
       const pd=window.__mepTest.pageDim(sh0);window.__mepTest.drawRevs(mk,sh0,pd,200);
       const R=els.find(o=>o.tag==='rect');
       out.cartRevW=!!R&&Math.abs(R.width-150)<1e-9&&Math.abs(R.x+R.width-(pd.ix+pd.iw))<1e-9&&/stroke-width:0\.5/.test(R.style)
         &&els.some(o=>o.tag==='text'&&/font-size:4\.888px/.test(o.style));}
      delete sh0.title.revSt;
      // perçage répété : base + instances = une seule famille (cote « n× »)
      {const F=doc.features,n0=F.length;
       const h1={id:'tH1',type:'hole',d:6},h2={id:'tH2',type:'hole',d:6,repeatId:'tRp'},h3={id:'tH3',type:'hole',d:6};
       F.push(h1,{id:'tRp',type:'repeat',base:['tH1']},h2,h3);
       const T=window.__mepTest;
       out.holeFamOK=T.holeFam(h1)===T.holeFam(h2)&&T.holeFam(h3)==='tH3';
       F.splice(n0);}
      // ligne de coupe : + brisure puis − brisure → retour à la coupe droite
      {const T=window.__mepTest,pv={id:'tPar',x:50,y:50,scale:1,u:[1,0,0],v:[0,0,-1],dir:[0,-1,0]};
       const sv={id:'tSec',kind:'section',section:{a:[0,0],b:[20,0],p:[0,0,0],n:[0,0,1],pid:'tPar'}};
       sh0.views.push(pv,sv);
       const okA=T.cutAddBreak(sh0,sv)&&sv.section.pts.length===4&&Math.abs(sv.section.pts[3][0]-20)<1e-9&&Math.abs(sv.section.pts[3][1])>1;
       const okD=T.cutDelBreak(sh0,sv)&&!sv.section.pts&&Math.abs(sv.section.b[0]-20)<1e-9&&Math.abs(sv.section.b[1])<1e-9;
       sh0.views.splice(sh0.views.indexOf(pv),2);
       out.cutBreakOK=okA&&okD;}
      // ligne de coupe associative : brisure accrochée à un perçage, puis le trou bouge → la ligne suit
      {const T=window.__mepTest,pv={id:'tPar2',x:50,y:50,scale:1,u:[1,0,0],v:[0,0,-1],dir:[0,-1,0]};
       const sv={id:'tSec2',kind:'section',section:{a:[0,0],b:[40,0],p:[0,0,0],n:[0,0,1],pid:'tPar2'}};
       const HA=globalThis.holeAxis,hz={z:-8};
       globalThis.holeAxis=()=>({dir:{x:0,y:1,z:0},pts:[{id:'q1',x:30,y:0,z:hz.z}]});
       doc.features.push({id:'tHf',type:'hole',sketchId:'tSkH'});doc.sketches.push({id:'tSkH'});
       sh0.views.push(pv,sv);
       try{
         const ok1=T.cutBreakAt(sh0,sv,0,20,8,{t:'hole',fid:'tHf',pid:'q1'})&&JSON.stringify(sv.section.pts)==='[[0,0],[20,0],[20,8],[40,8]]';
         hz.z=-12;T.cutFollow(sh0);
         const ok2=JSON.stringify(sv.section.pts)==='[[0,0],[20,0],[20,12],[40,12]]';
         // coupe droite posée sur l'axe du trou : lien automatique
         const sv2={id:'tSec3',kind:'section',section:{a:[0,12],b:[40,12],p:[0,0,-12],n:[0,0,1],pid:'tPar2'}};
         sh0.views.push(sv2);T.cutAutoRefs(sh0,sv2);
         const ok3=!!(sv2.section.refs&&sv2.section.refs[0]&&sv2.section.refs[0].t==='hole');
         hz.z=-15;T.cutFollow(sh0);
         const ok4=Math.abs(sv2.section.a[1]-15)<1e-9&&Math.abs(sv2.section.b[1]-15)<1e-9&&Math.abs(sv2.section.p[2]+15)<1e-9;
         out.cutAssocOK=ok1&&ok2&&ok3&&ok4;
         sh0.views.splice(sh0.views.indexOf(sv2),1);
       }finally{
         globalThis.holeAxis=HA;sh0.views.splice(sh0.views.indexOf(pv),2);
         doc.features=doc.features.filter(f=>f.id!=='tHf');doc.sketches=doc.sketches.filter(k=>k.id!=='tSkH');
       }}
      // paramètres plan : collectés puis réappliqués (projet ↔ session)
      {const LS0=globalThis.localStorage,mem={};
       globalThis.localStorage={getItem:k=>(k in mem?mem[k]:null),setItem:(k,v)=>{mem[k]=String(v);},removeItem:k=>{delete mem[k];}};
       try{const T=window.__mepTest,p0=T.prefsCollect();
       T.setDimStyle({dimH:7});const p1=T.prefsCollect();
       T.prefsApply(p0);const back=T.dimStyle().dimH;
       T.prefsApply(p1);const again=T.dimStyle().dimH;T.prefsApply(p0);
       out.prefsOK=/"dimH":7/.test(p1.ls.minifusion_mepDimStyle||'')&&back===3.5&&again===7;}
       finally{globalThis.localStorage=LS0;}}
      delete sh0.title.revs;delete sh0.title.matiere;delete sh0.title.traitement;delete sh0.title.tolgen;
    }catch(e){out.cartRich=false;out.cartErr=String(e);}
    // V0.3.12 : esquisse contrainte + cartouche dessiné
    try{
      const T=window.__mepTest.sk,sh0=doc.mep.sheets[doc.mep.cur];
      // cartouche Standard converti en esquisse : cohérent, 26 mm de haut, champs TTS/TTH présents
      const tb=T.fromStd(sh0);sh0.title.tb=tb;
      const err0=T.solve(tb.sk);
      out.tbStd=err0<1e-6&&Math.abs(T.tbH(sh0)-26)<1e-6
        &&tb.sk.ents.some(e=>e.t==='text'&&e.f==='tth')&&tb.sk.ents.some(e=>e.t==='text'&&e.f==='traitement');
      // la cote pilotante de largeur fait suivre séparateurs et textes
      const cw=tb.sk.cons.find(c=>c.type==='distX'&&c.b==='o');
      const W0=cw.val,txt=tb.sk.ents.find(e=>e.t==='text'&&e.f==='projet'),x0=tb.sk.pts[txt.p].x;
      cw.val=W0-100;const err1=T.solve(tb.sk);
      out.tbWidth=err1<1e-6&&Math.abs(tb.sk.pts[txt.p].x-(x0+100))<1e-6&&Math.abs(tb.sk.pts.o.x)<1e-12;
      sh0.title.matiere='C45';sh0.title.tth='Trempe + revenu';
      const tm=tb.sk.ents.find(e=>e.t==='text'&&e.f==='matiere'),th=tb.sk.ents.find(e=>e.t==='text'&&e.f==='tth');
      out.tbFields=T.textValue(sh0,tm)==='C45'&&T.textValue(sh0,th)==='Trempe + revenu';
      out.tbFormat=T.textValue(sh0,{t:'text',f:'format'})==='A3-H'; // 2026-10-23 : A3-H / A4-V…
      // 2026-10-23 : cotes du cartouche en édition — séparateurs des 2 rangées (même abscisse) : 8 cotes, aucune superposée
      {const skS=sh0.sk;sh0.sk=tb.sk;window.mepSetTool('line');
       const R=T.draw(sh0).filter(o=>o.tag==='rect'&&/mepSkConBg/.test(o.class||''));
       window.mepSetTool('select');sh0.sk=skS;
       const nX=tb.sk.cons.filter(c=>c.type==='distX'&&c.a!=='o'&&!tb.sk.ents.some(e=>e.t==='text'&&(e.p===c.b||e.p===c.a))).length;
       let ov=0;for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){const A1=R[i],B1=R[j];
         if(+A1.x<+B1.x+ +B1.width-0.05&&+B1.x<+A1.x+ +A1.width-0.05&&+A1.y<+B1.y+ +B1.height-0.05&&+B1.y<+A1.y+ +A1.height-0.05)ov++;}
       out.tbDimsAll=nX>=8&&ov===0;out.tbDimsDbg=nX+' cotes X, '+R.length+' étiquettes, '+ov+' chevauchement(s)';}
      // 2026-10-23 : en édition, un séparateur de cases se saisit même collé au texte de la case (le texte ne le masque plus)
      T.tbEdit(true);
      const c1=T.ctx(sh0),txv=tb.sk.ents.find(e=>e.t==='text'&&e.f==='echelle'),pv=tb.sk.pts[txv.p];
      const sep=tb.sk.ents.find(e=>e.t==='line'&&Math.abs(tb.sk.pts[e.p1].x-(pv.x-2))<1e-6&&Math.abs(tb.sk.pts[e.p2].x-(pv.x-2))<1e-6);
      const hk=sep&&T.hit(sh0,pv.x-2+1.6+c1.ox,pv.y-2+c1.oy);
      out.tbHitLine=!!sep&&hk==='e:'+sep.id;out.tbHitDbg=String(hk);
      T.tbEdit(false);
      sh0.title.tb=null;delete sh0.title.matiere;delete sh0.title.tth;
      // esquisse de planche : rectangle + cote horizontale pilotante ; contrainte contradictoire refusée
      const sk0=sh0.sk;sh0.sk=null;
      T.addRect(sh0,{x:10,y:10},{x:50,y:30});
      const sk=sh0.sk,top=sk.ents.find(e=>e.t==='line'&&Math.abs(sk.pts[e.p1].y-10)<1e-9&&Math.abs(sk.pts[e.p2].y-10)<1e-9);
      T.apply(sh0,'distX',['e:'+top.id]);
      const cx=sk.cons.find(c=>c.type==='distX');
      T.setVal(sh0,cx,60);
      const w=Math.abs(sk.pts[top.p2].x-sk.pts[top.p1].x);
      const right=sk.ents.find(e=>e.t==='line'&&e!==top&&Math.abs(sk.pts[e.p1].x-sk.pts[e.p2].x)<1e-6&&(e.p1===top.p2||e.p2===top.p2));
      out.skRect=Math.abs(w-60)<1e-4&&!!right&&Math.abs(sk.pts[right.p1].x-sk.pts[right.p2].x)<1e-4;
      const n0=sk.cons.length;T.apply(sh0,'vertical',['e:'+top.id]);
      out.skRefuse=sk.cons.length===n0&&Math.abs(sk.pts[top.p1].y-sk.pts[top.p2].y)<1e-4;
      // sélection au cadre, d'après les coordonnées réelles du rectangle [X0,X1]×[Y0,Y1]
      const xs=Object.values(sk.pts).map(q=>q.x),ys=Object.values(sk.pts).map(q=>q.y);
      const X0=Math.min(...xs),X1=Math.max(...xs),Y0=Math.min(...ys),Y1=Math.max(...ys),xm=(X0+X1)/2,ym=(Y0+Y1)/2;
      const nE=()=>T.sel().filter(k=>k[0]==='e').length;
      T.box(sh0,X0-5,Y0-5,xm,Y1+5,false);const winPart=nE();       // fenêtre : seul le côté gauche est entièrement dedans
      T.box(sh0,X0-5,Y0-5,X1+5,Y1+5,false);const winAll=nE();      // fenêtre englobante : 4 traits
      T.box(sh0,xm,Y0-5,X0-5,Y1+5,false);const crossPart=nE();     // capture : gauche + haut + bas
      T.box(sh0,xm+2,ym-2,xm-2,ym+2,false);const crossIn=nE();     // capture au milieu : ne touche rien
      out.boxSel=winPart===1&&winAll===4&&crossPart===3&&crossIn===0;
      out.boxDbg=[winPart,winAll,crossPart,crossIn].join(',');
      // V0.3.13 : style des nouveaux éléments (épaisseur libre, type, couleur) → rendu
      T.style({lw:0.25,lt:'axis',col:'#d40000'});
      const sl=T.addLine(sh0,{x:100,y:100},{x:140,y:120});
      T.style({});
      const at=T.draw(sh0).find(o=>o.tag==='line'&&Math.abs(o.x1-100)<1e-6&&Math.abs(o.y1-100)<1e-6);
      out.skStyle=!!sl&&sl.e.lw===0.25&&sl.e.col==='#d40000'&&!!at&&/stroke-width:0\.25/.test(at.style||'')&&/stroke:#d40000/.test(at.style||'')&&
        /mepUc/.test(at.class)&&/mepLtAxis/.test(at.class)&&T.draw(sh0).filter(o=>o.tag==='line'&&/mepSkThick/.test(o.class)&&!/mepUc/.test(o.class)).length===4;
      // 2026-10-23 : Ajuster — segments (pas les droites prolongées), une seule intersection suffit,
      // extrémités gardées, point de coupe tenu sur l'élément coupant, sans intersection : ligne entière
      sh0.sk=null;
      const H=T.addLine(sh0,{x:0,y:50},{x:100,y:50}),V=T.addLine(sh0,{x:40,y:0},{x:40,y:100});
      const F=T.addLine(sh0,{x:200,y:0},{x:200,y:10}); // loin : ne coupe H que prolongée
      const sk1=sh0.sk,p1H=H.e.p1,p2H=H.e.p2;
      T.trim(sh0,80,50); // tronçon droit de H (de x=40 à x=100)
      const hs=sk1.ents.filter(e=>e.t==='line'&&Math.abs(sk1.pts[e.p1].y-50)<1e-6&&Math.abs(sk1.pts[e.p2].y-50)<1e-6);
      const left=hs[0],cutP=left&&(left.p1===p1H?left.p2:left.p1);
      out.trimSeg=hs.length===1&&!!left&&(left.p1===p1H||left.p2===p1H)&&!sk1.pts[p2H]&&Math.abs(sk1.pts[cutP].x-40)<1e-6
        &&sk1.cons.some(c=>c.type==='onLine'&&c.p===cutP&&c.ent===V.e.id)&&sk1.cons.some(c=>c.type==='horizontal'&&(c.a===cutP||c.b===cutP));
      const nT=sk1.ents.length;T.trim(sh0,200,5);out.trimAll=sk1.ents.length===nT-1&&!sk1.ents.some(e=>e.id===F.e.id);
      out.trimDbg=JSON.stringify({n:hs.length,x:cutP&&sk1.pts[cutP]});
      // 2026-10-23 : détail — un trait qui part du centre sort du cercle au bon croisement (débordait à l'opposé)
      const cd=T.clipDetail([{t:'L',x1:0,y1:0,x2:20,y2:0,k:'sharp'},{t:'L',x1:-20,y1:3,x2:0,y2:3,k:'sharp'}],{cx:0,cy:0,r:10});
      out.detClip=cd.length===2&&Math.abs(cd[0].x1)<1e-9&&Math.abs(cd[0].x2-10)<1e-6&&Math.abs(cd[1].x1+Math.sqrt(91))<1e-6&&Math.abs(cd[1].x2)<1e-9;
      out.detDbg=JSON.stringify(cd.map(e=>[e.x1,e.x2].map(v=>+v.toFixed(3))));
      out.revIdx=[0,1,25,26,27].map(k=>T.revIdx('A',k)).join()==='A,B,Z,AA,AB'&&T.revIdx('0',0)==='0'&&T.revIdx('1',0)==='1'
        &&T.revNext('A',[{i:'C'}])==='D'&&T.revNext('A',[{i:'Z'}])==='AA'&&T.revNext('1',[{i:'4'}])==='5'&&T.revNext('0',[])==='0'&&T.revNext('1',[{i:'B'}])==='2';
      sh0.sk=sk0;
    }catch(e){out.skErr=String(e&&e.stack||e);}
    try{
      const mkSt=()=>{const o={};o.setProperty=(k,v)=>{o[k]=v;};o.removeProperty=k=>{delete o[k];};o['--mepDimCol']='var(--mepAccent,#0a84ff)';return o;};
      const c1={style:mkSt()},x1=window.__mepTest.exportPrep(c1,false);
      const c2={style:mkSt()},x2=window.__mepTest.exportPrep(c2,true);
      out.expCol=x1===''&&!!c1.style['--mepAccent']&&c1.style['--mepAxisCol']==='#ff0000'&&!!c1.style['--mepDimCol'];
      out.expBW=/mepUc\{stroke:#111!important/.test(x2)&&!c2.style['--mepDimCol']&&!c2.style['--mepAccent'];
    }catch(e){out.expErr=String(e);}
    // V0.3.13 : base alignée (coupe / auxiliaire) = projection 1er angle quand l'arête est horizontale
    try{
      const T=window.__mepTest,front={kind:'base',vk:'front',dir:[0,-1,0],u:[1,0,0],v:[0,0,-1],x:0,y:0,scale:1};
      const eq=(a,b)=>a.every((q,i)=>Math.abs(q-b[i])<1e-9);
      const dn=T.paperBasis(front,{x:1,y:0},{x:0,y:1},1),up=T.paperBasis(front,{x:1,y:0},{x:0,y:1},-1);
      // posée dessous = vue de dessus (dir +Z, u X, v -Y) ; posée dessus = vue de dessous (dir -Z, v +Y)
      out.paperBasis=eq(dn.dir,[0,0,1])&&eq(dn.u,[1,0,0])&&eq(dn.v,[0,-1,0])&&eq(up.dir,[0,0,-1])&&eq(up.v,[0,1,0]);
      const lt=T.paperBasis(front,{x:0,y:1},{x:-1,y:0},-1); // arête verticale, posée à droite = côté gauche (dir -X)
      out.paperBasisSide=eq(lt.dir,[-1,0,0]);
    }catch(e){out.paperErr=String(e);}
    // 2026-10-23 : vue DXF importée — géométrie, accrochage exact (lien qui suit la vue), détail
    try{
      const T=window.__mepTest,sh=doc.mep.sheets[doc.mep.cur];
      const D=['0','SECTION','2','HEADER','9','$INSUNITS','70','4','0','ENDSEC','0','SECTION','2','ENTITIES',
        '0','LWPOLYLINE','90','4','70','1','10','0','20','0','10','80','20','0','10','80','20','40','10','0','20','40',
        '0','CIRCLE','10','20','20','20','40','5','0','TEXT','10','0','20','0','1','X',
        '0','DIMENSION','8','COTES','2','*D1','10','80','20','-10','13','0','23','0','14','80','24','0','50','0','70','32',
        '0','DIMENSION','8','COTES','2','*D2','10','15','20','20','15','25','25','20','11','30','21','30','70','35',
        '0','LINE','8','COTES','10','0','20','0','11','0','21','-12','0','INSERT','2','*D1','10','0','20','0',
        '0','ENDSEC','0','EOF'].join(String.fromCharCode(10));
      const v=T.dxfView(D,'plaque'),g=T.geo(v);
      const Ls=g.els.filter(e=>e.t==='L'),C=g.els.find(e=>e.t==='C');
      out.dxfGeo=g.src==='dxf'&&Ls.length===4&&!!C&&Math.abs(C.r-5)<1e-9&&Math.abs(C.cx+20)<1e-9&&Math.abs(C.cy)<1e-9&&v.dxf.skipped.TEXT===1;
      // coin haut-gauche de la plaque (DXF 0,40 → vue −40,−20) : accroché comme une extrémité de vue
      const s0=T.snapPt(v.x-40*v.scale,v.y-20*v.scale);
      out.dxfSnap=!!(s0&&s0.hit&&s0.hit.vid===v.id&&s0.hit.t==='end');
      out.dxfDbg=JSON.stringify({n:g.els.length,s:s0&&s0.hit});
      // cotes du DXF : rien de dessiné (calque COTES, bloc *D1) ; DIMENSION → cotes natives 80 (horizontale) et Ø10 sur le cercle
      const nd=sh.dims.filter(d=>d.vid===v.id),dl=nd.find(d=>d.kind==='dist'),dd=nd.find(d=>d.kind==='dia');
      out.dxfDims=g.els.length===5&&nd.length===2&&!!dl&&dl.orient==='h'&&Math.abs(T.dimMeasure(dl)-80)<1e-6&&!!dd&&dd.a.hint&&dd.a.hint.i===g.els.indexOf(C)&&Math.abs(T.dimMeasure(dd)-10)<1e-6;
      out.dxfDimsDbg=JSON.stringify({els:g.els.length,dims:nd.map(d=>[d.kind,d.orient,+T.dimMeasure(d).toFixed(3)]),sk:v.dxf.skipped});
      delete v._dims;sh.dims=sh.dims.filter(d=>d.vid!==v.id);
      sh.views=sh.views.filter(x=>x.id!==v.id);
    }catch(e){out.dxfErr=String(e&&e.stack||e);}
    out.exportsNew=typeof window.mepExportDxf==='function'&&typeof window.mepDxfBuild==='function'
      &&typeof window.mepAutoHoles==='function'&&typeof window.mepSetPaper==='function';

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
  A(val&&val.angSect&&[60,120,120,60,300,240,240,300].every((x,i)=>Math.abs(val.angSect[i]-x)<1e-9),"cote d'angle : 4 secteurs θ / 180−θ et rentrants 360−θ ("+(val&&val.angSect)+")");
  A(val&&val.mergeL==='0-10 10-20 10-10 20-25','traits colinéaires bout à bout soudés, sommet à 3 arêtes gardé ('+(val&&val.mergeL)+')');
  A(val&&val.dsymTxt==='Ø20','distance entre génératrices de cylindre : Ø20 ('+(val&&val.dsymTxt)+')');
  A(val&&String(val.angSectAt)==='0,1,3,2',"cote d'angle : secteur choisi au curseur ("+(val&&val.angSectAt)+")");
  A(val&&val.g6&&Math.abs(val.g6.hi+0.007)<1e-12&&Math.abs(val.g6.lo+0.020)<1e-12,
    'ISO 286 : g6 Ø20 = −0,007 / −0,020 (arbre)');
  A(val&&val.G7&&Math.abs(val.G7.lo-0.007)<1e-12&&Math.abs(val.G7.hi-0.028)<1e-12,
    'ISO 286 : G7 Ø20 = +0,007 / +0,028 (alésage)');
  A(val&&val.fit&&val.fit.fit&&
    Math.abs(val.fit.fit.hole.hi-0.021)<1e-12&&Math.abs(val.fit.fit.hole.lo)<1e-12&&
    Math.abs(val.fit.fit.shaft.hi+0.007)<1e-12&&Math.abs(val.fit.fit.shaft.lo+0.020)<1e-12,
    'ISO 286 : ajustement H7/g6 Ø20 (alésage + arbre)');
  A(val&&val.dragUndo,'undo glissement : position d\'avant restaurée');
  A(val&&val.planEditKeepsGeoCache,'glissement de vue : cache géométrie conservé (pas de rejeu HLR)');
  A(val&&val.tp0OK,'cote linéaire : étiquette à l\'offset demandé');
  A(val&&val.moveOffOK,'glisser cote : offset perpendiculaire mis à jour');
  A(val&&val.tp1OK,'glisser cote : étiquette suit le curseur');
  A(val&&val.tpZeroOK,'cote linéaire : offset 0 respecté (pas de repli à 8)');
  A(val&&val.txtShiftOK&&val.txtShiftPosOK,'glisser étiquette : décalage gauche/droite');
  A(val&&val.txtSnapOK,'glisser étiquette : retour exact au centre');
  A(val&&val.txtExtentOK&&val.txtExtendOK,'ligne de cote : prolongée sous l’étiquette décalée');
  A(val&&val.vertLeftOK,'texte vertical : toujours à gauche de la ligne de cote');
  A(val&&val.vertDragOK,'texte vertical : glisser l’étiquette ne déplace pas la cote');
  A(val&&val.dimAnyLineHitOK&&val.dimToolDragOK,'cotation : n’importe quel trait rouge attrape la cote');
  A(val&&val.arrowHitOK&&val.arrowOutOK,'double-clic flèche : détection et inversion');
  A(val&&val.dblCoteOK,'double-clic sur la cote : inversion des flèches');
  A(val&&val.tolStackOK,'tolérances : écarts supérieur/inférieur empilés');
  A(val&&val.tolPmOK,'tolérances : ± reste sur la ligne de cote');
  A(val&&val.tolPmAffOK,'tolérances : ± avec texte avant/après');
  A(val&&val.diaPreOK&&val.radPreOK,'texte avant placé avant Ø/R');
  A(val&&val.tolGap45OK,'tolérances : interligne au prorata de la hauteur des cotes');
  A(val&&val.tolClsOK,'tolérances : classe H7 reste sur la ligne de cote');
  A(val&&val.tolTxtOK,'tolérances : texte personnalisé prioritaire');
  A(val&&val.affixOK,'texte avant/après ajouté à la cote');
  A(val&&val.affixTolOK,'texte avant/après conservé avec tolérance empilée');
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
  A(val&&val.parExtGapRight&&val.parExtGapLeft,
    'cote entre droites parallèles : rappels depuis le coin côté cote (vide visible)');
  A(val&&val.holeSimpleOK,'cotation perçage : trou simple (Ø et profondeur)');
  A(val&&val.holeCboreOK,'cotation perçage : lamage (Ø et profondeur)');
  A(val&&val.holeCsinkOK,'cotation perçage : fraisure (Ø et angle)');
  A(val&&val.holeThroughOK,'cotation perçage : trou débouchant');
  A(val&&val.holeThreadOK,'cotation perçage : taraudage (longueur filetée + profondeur trou)');
  A(val&&val.holeLeaderUnderOK&&val.holeLeaderUnderEndOK,
    'cotation perçage : leader et soulignement coïncidents aux 2 orientations');
  A(val&&val.dimSettingsUI,'Paramètres — Plan : réglages de cotation présents');
  A(val&&val.dimSettingsDefaults,'Paramètres — Plan : hauteur 7 mm et couleur du thème par défaut (V0.3.11)');
  A(val&&val.dimStyleApplied,'Paramètres — Plan : hauteur/couleur/flèches appliquées aux cotes');
  A(val&&val.dimStyleReset,'Paramètres — Plan : réinitialisation du style de cotation');
  A(val&&val.fmtDot,'valeurs du plan : séparateur décimal = point');
  A(val&&val.shadeUI,'vue : option Ombrage (faces) présente');
  A(val&&val.render3dUI,'vue : option Rendu 3D (image) présente');
  A(val&&val.render3dGeoCache&&val.render3dSig,'rendu 3D : le cache géométrie tient compte du mode');
  A(val&&val.render3dFollow,'rendu 3D : l\'image suit le déplacement et le zoom de la vue');
  A(val&&val.axisUI,'axes : les 2 cases automatiques sont présentes');
  A(val&&val.axisDefaults,'axes : cases et liste manuelle initialisées par vue');
  A(val&&val.axisModeOK,'axes : modes Trou/Alignement/Cercle/Libre sélectionnables');
  A(val&&val.axisFitOK&&val.axisPitchOK,'axes : cercle primitif détecté (4 trous équidistants)');
  A(val&&val.axisLineOK,'axes : alignement détecté, triangle rejeté');
  A(val&&val.axisFreeOK,'axes : tracé libre en coordonnées locales');
  A(val&&val.axisHitOK,'axes : sélection au clic d’un axe manuel');
  A(val&&val.axisSerialise,'axes : réglages et annotations sérialisés');
  A(val&&val.shadeGeoCache&&val.shadeSig,'ombrage : le cache géométrie tient compte du mode');
  A(val&&val.shadeTri&&val.shadeBack,'ombrage : faces avant dessinées, faces arrière ignorées');
  A(val&&val.shadeOpacity,'ombrage : transparence du corps reprise sur les faces');
  A(val&&val.shadeFaces,'ombrage : les maillages produisent des faces projetées');
  A(val&&val.cutAssocOK,'ligne de coupe associative : brisure accrochée au perçage, suit le trou déplacé');
  A(val&&val.cutBreakOK,'ligne de coupe : ajouter puis retirer une brisure');
  A(val&&val.holeFamOK,'perçage : répétition (base + instances) comptée comme une seule famille');
  A(val&&val.prefsOK,'paramètres plan : collectés et réappliqués (projet / session / fichier)');
  A(val&&val.cartRevNom,'révisions : colonne NOM (personne qui a modifié le plan)');
  A(val&&val.cartRevW,'révisions : largeur totale, hauteur h et trait réglables');
  A(val&&val.cartRich,'cartouche : matière, traitement, tolérances générales, indice (V0.3.11)'+(val&&val.cartErr?' — '+val.cartErr:''));
  A(val&&val.cartRevs,'cartouche : tableau des révisions');
  A(val&&val.tbStd,'cartouche Standard → esquisse cohérente (26 mm, TTS, TTH) (V0.3.12)'+(val&&val.skErr?' — '+val.skErr:''));
  A(val&&val.tbWidth,'cartouche dessiné : la cote de largeur fait suivre textes et séparateurs, origine fixe');
  A(val&&val.tbFields,'cartouche dessiné : champs matière / TTH = valeurs de la planche');
  A(val&&val.skRect,'esquisse : rectangle + cote horizontale pilotante 60 mm');
  A(val&&val.skRefuse,'esquisse : contrainte contradictoire refusée, géométrie intacte');
  A(val&&val.boxSel,'sélection au cadre : fenêtre (entièrement dedans) / capture (touche) — '+(val&&val.boxDbg));
  A(val&&val.skStyle,'esquisse : épaisseur / type / couleur par élément, rendus (V0.3.13)');
  A(val&&val.trimSeg,'Ajuster : tronçon entre segments retiré, extrémité gardée, coupe tenue sur la ligne coupante '+(val&&val.trimDbg));
  A(val&&val.trimAll,'Ajuster : ligne sans intersection (droites prolongées ignorées) retirée entière');
  A(val&&val.tbHitLine,'cartouche en édition : trait de séparation saisi devant le texte de la case '+(val&&val.tbHitDbg));
  A(val&&val.tbDimsAll,'cartouche en édition : toutes les cotes visibles, aucune étiquette superposée ('+(val&&val.tbDimsDbg)+')');
  A(val&&val.dxfGeo,'vue DXF : polyligne fermée → 4 traits, cercle R5 centré, texte ignoré et compté '+(val&&(val.dxfErr||val.dxfDbg)));
  A(val&&val.dxfDims,'vue DXF : cotes du DXF non dessinées, DIMENSION reprises en cotes du plan (80 et Ø10) '+(val&&val.dxfDimsDbg));
  A(val&&val.dxfSnap,'vue DXF : coin accroché comme une extrémité de vue (cotes, esquisse liée)');
  A(val&&val.tbFormat,'cartouche : champ FORMAT écrit A3-H (A4-V…)');
  A(val&&val.revIdx,'révisions : indices en lettres (A…Z, AA) ou chiffres (0… / 1…), suite du dernier');
  A(val&&val.detClip,'détail : traits qui entrent / sortent du cercle rognés au bon croisement '+(val&&val.detDbg));
  A(val&&val.expCol&&val.expBW,'export PDF / SVG : couleurs gardées par défaut, option noir'+(val&&val.expErr?' — '+val.expErr:''));
  A(val&&val.paperBasis&&val.paperBasisSide,'vues alignées (coupe / auxiliaire) : base = projection 1er angle (V0.3.13)'+(val&&val.paperErr?' — '+val.paperErr:''));
  A(val&&val.orientOK&&val.orientTop,'orientation de la vue principale (Face → Côté droit / Dessus) : projections recalculées et replacées');
  A(val&&val.exportsNew,'exports DXF, perçages auto et papier présents');
  A(val&&val.axisExtOK,'axe : allongement mémorisé par bout (v.axExt) '+(val&&val.axisExtErr||''));
  A(val&&val.axisSnapOK&&val.axisSnapOff,'axe : extrémités accrochables (flèches de coupe, esquisse)');
  A(val&&val.axisEndHit,'axe auto : extrémité saisissable pour l’étirer');
  A(val&&val.secOutAxis&&val.secOutAxis2,'coupe : 1er point accroché au bout d’un axe hors du cadre de la vue '+(val&&val.secOutErr||''));
  A(val&&val.axisDimHit&&val.axisHintOK,'axe : trait cotable (hint ax:, suit l’allongement)');

  if(ko){console.log('FAIL '+ko+' assertion(s)');process.exit(1);}
  console.log('OK espace PLAN');
  process.exit(0);
})().catch(e=>{console.error('ERREUR',e);process.exit(1);});
