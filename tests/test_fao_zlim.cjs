// 2026-10-03-003 : ébauche 3D — zones de limitation HAUTES et BASSES par
// SÉLECTION D'ARÊTES (Phase A du plan Ébauche 3D, point 7 de la demande).
// Aujourd'hui ztop/zbot sont des nombres saisis à la main : le plan exige de
// sélectionner des arêtes du modèle pour cadrer le haut et le bas de la zone.
// CONTRAT :
//  A) capture : sélection kind 'z' (faoChainOk) -> op.zlim (ancres des germes)
//     + op.ztop = Zmax / op.zbot = Zmin des arêtes retenues ;
//  B) garde : il faut ztop > zbot (au moins une arête haute ET une basse,
//     ou une arête inclinée qui s'étend) sinon refus, limite inchangée ;
//  C) rejeu : faoZlimRematch re-branche les ancres à chaque fin de rejeu
//     (Z suit le modèle), stale si introuvable/hors tolérance (valeurs figées) ;
//  D) faoZlimBreak : l'édition manuelle d'un champ casse le lien (valeurs gardées) ;
//  E) faoRematchAll : la fin de rejeu (buildDone -> faoChainReplay) rejoue
//     chaînes XY ET limites Z dans une seule passe ;
//  F) fiche : bouton « Limiter Z (arêtes) » (lance la sélection kind 'z'),
//     badge « lié à N arêtes » + « Retirer », l'édition d'un champ casse le lien.
// Harnais : pur logique (aucun OCCT) — arêtes synthétiques au format occListEdges.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    // --- arête synthétique (format occListEdges) avec Z variable
    "const zMk=function(x1,y1,z1,x2,y2,z2){const dx=x2-x1,dy=y2-y1,dz=z2-z1;",
    "  return {mid:[(x1+x2)/2,(y1+y2)/2,(z1+z2)/2],pts:[[x1,y1,z1],[x2,y2,z2]],",
    "          len:Math.hypot(dx,dy,dz),sharp:true};};",
    // --- haut z=40 (bord y=0) et bas z=5 (bord y=40)
    "const zE=[zMk(0,0,40,60,0,40),zMk(0,40,5,60,40,5)];",
    // --- op rough3d réelle dans le posage actif
    "const zs=faoSetup();",
    "const zOp={id:'zop1',on:true,toolId:zs.tools[0].id,type:'rough3d',",
    "  ztop:25,zbot:0,ap:5,ae:4,radial:0.3,axial:0.3};",
    "zs.ops.push(zOp);",
    // --- A : capture (haut 40, bas 5)
    "faoChainMode={setupId:zs.id,opId:zOp.id,edges:zE,seeds:[0,1],tangent:false,sel:[0,1],kind:'z'};",
    "faoChainOk();",
    "att(!!zOp.zlim&&zOp.zlim.anchors&&zOp.zlim.anchors.length===2,'A : capture 2 ancres');",
    "att(zOp.ztop===40&&zOp.zbot===5,'A : ztop=40 zbot=5 (vu '+zOp.ztop+'/'+zOp.zbot+')');",
    "att(zOp.zlim.stale===false,'A : stale=false');",
    "att(zOp.zlim.nEdges===2,'A : nEdges=2');",
    "att(faoChainMode===null,'A : mode selection referme par OK');",
    // --- B : garde ztop>zbot (une seule arête -> ztop==zbot -> refus)
    "const zKeptT=zOp.ztop,zKeptB=zOp.zbot,zKeptL=JSON.stringify(zOp.zlim.anchors);",
    "faoChainMode={setupId:zs.id,opId:zOp.id,edges:zE,seeds:[0],tangent:false,sel:[0],kind:'z'};",
    "faoChainOk();",
    "att(zOp.ztop===zKeptT&&zOp.zbot===zKeptB&&JSON.stringify(zOp.zlim.anchors)===zKeptL,",
    "  'B : ztop<=zbot refuse, limite inchangee');",
    "att(String(faceEl.textContent||'').indexOf('Limite Z')>=0,'B : message d\\'erreur Limite Z ('+faceEl.textContent+')');",
    // --- C : rejeu — le modele bouge (haut 40->42, bas 5->3)
    "const zE2=[zMk(0,0,42,60,0,42),zMk(0,40,3,60,40,3)];",
    "const zR1=faoZlimRematch(zOp,zE2);",
    "att(zR1.changed&&zR1.stale===false&&zR1.matched===2,'C1 : 2/2 ancres rebranchees');",
    "att(zOp.ztop===42&&zOp.zbot===3,'C1 : Z suit le modele 42/3 (vu '+zOp.ztop+'/'+zOp.zbot+')');",
    // --- C2 : arête haute disparue -> stale + valeurs figees
    "const zR2=faoZlimRematch(zOp,[zE2[1]]);",
    "att(zR2.changed&&zOp.zlim.stale===true,'C2 : arete haute disparue -> stale');",
    "att(zOp.ztop===42&&zOp.zbot===3,'C2 : valeurs figees conservees');",
    // --- C3 : retour du modele d origine -> stale leve
    "const zR3=faoZlimRematch(zOp,zE2);",
    "att(zR3.changed&&zOp.zlim.stale===false&&zOp.ztop===42,'C3 : retour modele -> stale leve');",
    // --- C4 : deplacement hors tolérance (3D) -> stale
    "const zE3=[zMk(50,0,42,110,0,42),zMk(50,40,3,110,40,3)];",
    "const zR4=faoZlimRematch(zOp,zE3);",
    "att(zR4.stale===true&&zOp.ztop===42&&zOp.zbot===3,'C4 : +50mm hors tol -> stale, valeurs gardées');",
    "faoZlimRematch(zOp,zE2);",
    // --- C5 : op sans zlim -> skipped
    "att(faoZlimRematch({type:'pocket'},zE2).skipped===true,'C5 : op sans zlim -> skipped');",
    "att(faoZlimRematch({zlim:{}},zE2).skipped===true,'C5 : zlim sans ancre (ancien doc) -> skipped');",
    // --- D : edition manuelle casse le lien (valeurs gardées)
    "faoZlimBreak(zOp);",
    "att(!zOp.zlim,'D : lien casse');",
    "att(zOp.ztop===42&&zOp.zbot===3,'D : valeurs gardees');",
    // --- E : faoRematchAll (fin de rejeu) rejoue zlim dans une passe
    "faoChainMode={setupId:zs.id,opId:zOp.id,edges:zE2,seeds:[0,1],tangent:false,sel:[0,1],kind:'z'};",
    "faoChainOk();",
    "const zE4=[zMk(0,0,44,60,0,44),zMk(0,40,2,60,40,2)];",
    "const zN=faoRematchAll([zs],zE4);",
    "att(zN>=1,'E1 : faoRematchAll compte les changements ('+zN+')');",
    "att(zOp.ztop===44&&zOp.zbot===2,'E1 : zlim suivie via faoRematchAll ('+zOp.ztop+'/'+zOp.zbot+')');",
    "const zN2=faoRematchAll([zs],zE4);",
    "att(zN2===0,'E2 : deuxieme passe sans changement -> 0');",
    // --- F : fiche — badge lié, bouton Retirer, bouton Limiter Z, edition casse
    "const zBtns=function(root){const out=[];(function w(n){",
    "  (n.children||[]).forEach(function(c){if(c.textContent&&c.onclick&&/button/i.test(c.tagName||''))out.push(c);w(c);});",
    "  })(root);return out;};",
    "const zCard=faoOpCardElement(zs,zOp,0);",
    "const zTxt=zBtns(zCard).map(function(b){return b.textContent;}).join('|');",
    "att(/lié à/.test(zCard.textContent)||/Retirer/.test(zTxt),'F1 : badge « lié à N arêtes » + Retirer present ('+zTxt+')');",
    "const zUnlink=zBtns(zCard).filter(function(b){return /Retirer/.test(b.textContent);})[0];",
    "att(!!zUnlink,'F2 : bouton Retirer present');",
    "zUnlink.onclick();",
    "att(!zOp.zlim,'F2 : Retirer casse le lien');",
    "const zCard2=faoOpCardElement(zs,zOp,0);",
    "const zLink=zBtns(zCard2).filter(function(b){return /Limiter Z/.test(b.textContent);})[0];",
    "att(!!zLink,'F3 : bouton « Limiter Z (arêtes) » present');",
    "let zStart=0;const zOldStart=faoZlimStart;faoZlimStart=function(){zStart++;};",
    "zLink.onclick();faoZlimStart=zOldStart;",
    "att(zStart===1,'F3 : bouton branche faoZlimStart');",
    // édition du champ Haut casse le lien
    "faoChainMode={setupId:zs.id,opId:zOp.id,edges:zE4,seeds:[0,1],tangent:false,sel:[0,1],kind:'z'};",
    "faoChainOk();",
    "att(!!zOp.zlim&&zOp.ztop===44,'F4 : re-capture avant edition');",
    "const zCard3=faoOpCardElement(zs,zOp,0);",
    "let zTopIn=null;(function w(n){",
    "  (n.children||[]).forEach(function(c){",
    "    if(c.tagName==='INPUT'&&c.type==='number'&&parseFloat(c.value)===44)zTopIn=c;",
    "    w(c);});})(zCard3);",
    "att(!!zTopIn,'F4 : champ Haut = 44 trouve');",
    "if(zTopIn){zTopIn.value='12';zTopIn.onchange();}",
    "att(!zOp.zlim,'F4 : edition du champ Haut casse le lien');",
    "att(zOp.ztop===12,'F4 : ztop passe a 12 (vu '+zOp.ztop+')');",
    "return {P:P,ATT:ATT};"
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'zlim.js'});
  (o.P||[]).forEach(s=>console.log(s));
  if(o.ATT&&o.ATT.length){console.log('ECHECS ('+o.ATT.length+') :');o.ATT.forEach(m=>console.log('  x '+m));process.exit(1);}
  console.log('TOUT EST CONFORME');
  process.exit(0);
})().catch(e=>{console.error('FATAL',String((e&&e.stack)||e).slice(0,700));process.exit(1);});
