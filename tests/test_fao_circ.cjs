// 2026-10-08-004 « Entrée circulaire + plongées bleues » — Vérité terrain.
// 1. Helpers d'arc : géométrie des deux côtés tangents, points d'échantillon,
//    ancre (matière déjà ouverte) et garde-fous de faoCircEval (repli = null).
// 2. Migration : sanitise (entry/entryR) + défauts à la création ('circ') +
//    mode géofinition (circ interdit sans ébauche amont → rampe).
// 3. Générateurs via le DISPATCH (doc sans champ = circ) :
//    · poche   : arcs d'entrée + rings en stay-down (moins de remontées) ;
//    · contour : arc tangent arrivant au coin de passe ;
//    · escargot: arcs de ré-entrée ('auto' reste sans arc, arrondi 0).
// 4. EntryR : |S−P| = rho·√2 (rayon transmis jusqu'au générateur).
// 5. Aperçu : faoSegSplit route la plongée verticale descendante en bleu (plg).
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    // ===== 1. helpers =====
    "const sid=faoSidesCirc(10,0,1,0,3);",
    "att(sid&&sid.length===2&&sid[0].sx===7&&sid[0].sy===3&&sid[0].cx===10&&sid[0].cy===3&&sid[0].cw===false,'sides : S=(7,3) C=(10,3) CCW');",
    "att(sid[1].sx===7&&sid[1].sy===-3&&sid[1].cx===10&&sid[1].cy===-3&&sid[1].cw===true,'sides miroir : S=(7,-3) C=(10,-3) CW');",
    "att(faoSidesCirc(0,0,0,0,3)===null,'sides : direction nulle -> null');",
    "const ap=faoCircArcPts(sid[0],10,0);",
    "att(ap.length===13&&Math.abs(ap[0][0]-7)<1e-9&&Math.abs(ap[0][1]-3)<1e-9&&Math.abs(ap[12][0]-10)<1e-9&&Math.abs(ap[12][1])<1e-9,'arc pts : 13 echantillons de S a P');",
    "const mvAnc=[{r:1,x:0,y:0,z:30},{r:0,x:5,y:5,z:10},{r:0,x:15,y:5,z:10}];",
    "att(faoCircAnchor(mvAnc,7,3,10,10)===true,'ancre : coupe a z<=10 a 2 mm de S');",
    "att(faoCircAnchor(mvAnc,7,3,5,10)===false,'ancre : aucune coupe a z<=5 -> false');",
    "att(faoCircAnchor([{r:1,x:5,y:3,z:10},{r:1,x:15,y:3,z:10}],7,3,10,10)===false,'ancre : les rapids ne comptent pas');",
    "const alw=function(){return true;};",
    "att(faoCircEval(10,0,1,0,3,alw,[],10,10,true)===null,'eval : sans ancre -> null (repli legacy)');",
    "const e2=faoCircEval(10,0,1,0,3,alw,mvAnc,10,10,true);",
    "att(e2&&e2.sx===7&&e2.sy===3,'eval : ancre presente -> cote CCW');",
    "const e3=faoCircEval(10,0,1,0,3,alw,[],10,10,false);",
    "att(e3&&e3.sx===7&&e3.sy===3,'eval : needAnchor false (contour) -> sans ancre');",
    "const noS0=function(x,y){return !(Math.abs(x-7)<1&&Math.abs(y-3)<1);};",
    "const mvAnc2=mvAnc.concat([{r:0,x:0,y:-3,z:10},{r:0,x:14,y:-3,z:10}]);",
    "const e4=faoCircEval(10,0,1,0,3,noS0,mvAnc2,10,10,true);",
    "att(e4&&e4.sx===7&&e4.sy===-3,'eval : cote CCW illegal -> miroir CW');",
    "const noBoth=function(){return false;};",
    "att(faoCircEval(10,0,1,0,3,noBoth,mvAnc,10,10,true)===null,'eval : aucun cote legal -> null');",
    // ===== 2. sanitise + defauts + mode geo =====
    "const sk={ops:[{id:'o1',type:'pocket',entry:'zigzag',entryR:'x'},{id:'o2',type:'rough3d',entry:'circ',entryR:4}]};",
    "faoSanitiseOps(sk);",
    "att(sk.ops[0].entry===undefined,'sanitise : entry inconnu supprime');",
    "att(sk.ops[0].entryR===undefined,'sanitise : entryR invalide supprime');",
    "att(sk.ops[1].entry==='circ'&&sk.ops[1].entryR===4,'sanitise : valeurs valides conservees');",
    "att(faoOpDefaults('rough3d').entry==='circ','defaut : rough3d entry circ');",
    "att(faoOpDefaults('geofinish').entry==='circ','defaut : geofinish entry circ');",
    "att(faoOpDefaults('pocket').entry===undefined,'defaut : poche sans champ (dispatch -> circ)');",
    "att(faoGeoEntryMode('circ',true)==='circ','geo mode : circ avec ebauche amont');",
    "att(faoGeoEntryMode('circ',false)==='ramp','geo mode : circ sans ebauche -> rampe');",
    // ===== 3. poche via dispatch =====
    "const J=faoDefaultSetup();J.stock={x0:0,y0:0,z0:0,x1:100,y1:60,z1:20};",
    "const pkC={id:'pkc',on:true,toolId:'T1',type:'pocket',x0:10,y0:10,x1:90,y1:50,ztop:20,zbot:15,ap:5,ae:5,radial:0,axial:0,arrondi:0};",
    "const mvC=faoOpMoves(pkC,J);",
    "att(mvC.some(m=>!m.r&&m.arc),'poche circ : arc d entree (dispatch sans champ)');",
    "const pkA=Object.assign({},pkC,{id:'pka',entry:'auto'});",
    "const mvA=faoOpMoves(pkA,J);",
    "att(!mvA.some(m=>!m.r&&m.arc),'poche auto : aucun arc (arrondi 0)');",
    "att(mvC.filter(m=>m.r).length<mvA.filter(m=>m.r).length,'poche circ : rings en stay-down (moins de remontees '+mvC.filter(m=>m.r).length+' < '+mvA.filter(m=>m.r).length+')');",
    "const mvE=faoOpMoves(Object.assign({},pkC,{id:'pke',entryR:3}),J);",
    "const ia=mvE.findIndex(m=>!m.r&&m.arc);",
    "att(ia>0,'poche entryR=3 : arc present');",
    "if(ia>0){const pv=mvE[ia-1],pe=mvE[ia];",
    "  att(Math.abs(Math.hypot(pe.x-pv.x,pe.y-pv.y)-3*Math.SQRT2)<1e-6,'entryR=3 : |S-P| = rho*sqrt2, vu '+(Math.hypot(pe.x-pv.x,pe.y-pv.y)).toFixed(4));}",
    // ===== 4. contour via dispatch =====
    "const coC={id:'coc',on:true,toolId:'T1',type:'contour',x0:20,y0:20,x1:80,y1:40,ztop:20,zbot:15,ap:5,radial:0,axial:0,arrondi:0};",
    "const mc=faoOpMoves(coC,J);",
    "att(mc.some(m=>!m.r&&m.arc&&Math.abs(m.x-15)<1e-9&&Math.abs(m.y-15)<1e-9),'contour circ : arc tangent arrivant au coin (15,15)');",
    "const coA=Object.assign({},coC,{id:'coa',entry:'auto'});",
    "att(!faoOpMoves(coA,J).some(m=>m.arc),'contour auto : aucun arc');",
    // ===== 5. escargot (rough3d) via generateur =====
    "const mkB=function(x0,x1,y0,y1,z0,z1){return {v:[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],t:[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[2,3,7],[2,7,6],[0,4,7],[0,7,3],[1,2,6],[1,6,5]]};};",
    "const mg=function(A,B){const off=A.v.length;return {v:A.v.concat(B.v),t:A.t.concat(B.t.map(function(t){return [t[0]+off,t[1]+off,t[2]+off];}))};};",
    "const CN=mg(mkB(0,20,0,60,0,40),mkB(80,100,0,60,0,40));",
    "const BX={x0:-5,y0:-5,x1:105,y1:65};",
    "const rC=faoGenRough3D(CN,BX,40,0,{ap:10,ae:6,toolD:10,radial:0,axial:0,secu:45,mode:'escargot',entry:'circ'});",
    "const rA=faoGenRough3D(CN,BX,40,0,{ap:10,ae:6,toolD:10,radial:0,axial:0,secu:45,mode:'escargot',entry:'auto'});",
    "att(!rA.some(m=>m.arc),'escargot auto : aucun arc (arrondi 0)');",
    "att(rC.some(m=>!m.r&&m.arc),'escargot circ : arcs de re-entree');",
    "att(rC.length>10&&rA.length>10,'escargot : generation non vide (circ '+rC.length+' / auto '+rA.length+' moves)');",
    "att(rC.filter(m=>!m.r).every(m=>m.z>=-1e-9),'escargot circ : aucune coupe sous le fond');",
    // ===== 6. apercu : plongees en bleu (bucket plg) =====
    "const sp1=faoSegSplit([{r:1,x:0,y:0,z:10},{r:0,x:0,y:0,z:0}],null);",
    "att(sp1.plg.length===6,'plongee : G1 vertical descendant -> 6 coords en bleu');",
    "att(sp1.cut.length===0&&sp1.rap.length===0,'plongee : ni coupe ni rapide sur ce couple');",
    "const sp2=faoSegSplit([{r:0,x:0,y:0,z:0},{r:0,x:5,y:0,z:0},{r:0,x:5,y:0,z:-2},{r:1,x:9,y:9,z:5}],null);",
    "att(sp2.cut.length===6,'split : G1 horizontal -> coupe verte');",
    "att(sp2.plg.length===6,'split : G1 vertical descendant -> plongee bleue');",
    "att(sp2.rap.length===6,'split : destination G0 -> rapide rouge');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  x '+m));}",
    "else p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'fao_circ.js'});
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
