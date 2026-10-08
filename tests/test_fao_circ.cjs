// 2026-10-08-004 « Entrée circulaire + plongées bleues » + 005 « disque hors
// matière + tracé bleu des entrées » — Vérité terrain.
// 1. Helpers d'arc : géométrie des deux côtés tangents, points d'échantillon,
//    ancre (matière déjà ouverte) et garde-fous de faoCircEval (repli = null).
//    005 : l'ancre ponctuelle devient faoPlungeClear — le DISQUE D/2 autour de
//    S doit être entièrement balayé (coupes z'≤z) ou en air (airAt) ; rayons
//    candidats faoCircRhos (entryR, Ø/2, ae, Ø croissants).
// 2. Migration : sanitise (entry/entryR) + défauts à la création ('circ') +
//    mode géofinition (circ interdit sans ébauche amont → rampe).
// 3. Générateurs via le DISPATCH (doc sans champ = circ) :
//    · poche   : arcs d'entrée + rings en stay-down (moins de remontées) ;
//    · contour : arc tangent arrivant au coin de passe ;
//    · escargot: arcs de ré-entrée ('auto' reste sans arc, arrondi 0).
// 4. EntryR : |S−P| = rho·√2 (rayon transmis jusqu'au générateur).
// 5. Aperçu : faoSegSplit route la plongée verticale descendante en bleu (plg) ;
//    005 : les moves étiquetés ent (hélice, rampe, arc circ, descente d'entrée)
//    partent aussi en bleu, et l'étiquette survit à faoViewerBuild.
// 6. 006 (feedback Ø25) : JAMAIS de plongée à plat dans la matière — poche =
//    rampe le long du 1er anneau, ébauche 3D = hélice à orbite légale réduite.
// 7. 007 (feedback « après la spirale à cheval ») : air = hors du BRUT (boîte),
//    entrées de faces/ré-entries = rampes le long du chemin — fixture poche
//    ouverte escargot Ø25 : 0 plongée à plat dont le disque ne soit balayé.
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
    "const airNo=function(){return false;};",
    // --- 005 : faoPlungeClear — le disque D/2 autour de S est TOTALEMENT hors
    // matière restante (balayé par les coupes z'<=z ou en air via airAt).
    "att(faoPlungeClear(7,3,[],10,10,airNo)===false,'plungeClear : disque non couvert, pas d air -> false');",
    "att(faoPlungeClear(7,3,[],10,10,alw)===true,'plungeClear : disque en air (airAt) -> true');",
    "const mvSw=[{r:1,x:0,y:0,z:30}];",
    "for(let yy=-2;yy<=8;yy+=1){mvSw.push({r:0,x:2,y:yy,z:10},{r:0,x:12,y:yy,z:10});}",
    "att(faoPlungeClear(7,3,mvSw,10,10,airNo)===true,'plungeClear : disque entierement balaye par les coupes -> true');",
    "att(faoPlungeClear(7,3,[{r:0,x:30,y:30,z:10},{r:0,x:40,y:30,z:10}],10,10,airNo)===false,'plungeClear : coupe trop loin de S -> false');",
    "att(faoPlungeClear(7,3,[{r:1,x:2,y:3,z:10},{r:1,x:12,y:3,z:10}],10,10,airNo)===false,'plungeClear : les rapides ne couvrent pas');",
    "att(faoPlungeClear(7,3,[{r:0,x:2,y:3,z:20},{r:0,x:12,y:3,z:20}],10,10,airNo)===false,'plungeClear : coupe au-dessus de z ignoree');",
    // --- 005 : faoCircRhos — candidats croissants entryR, D/2, ae, D.
    "const rh1=faoCircRhos(10,6,undefined);",
    "att(rh1.length===4&&rh1[0]===2.5&&rh1[1]===5&&rh1[2]===6&&rh1[3]===10,'rhos defaut : [D/4, D/2, ae, D] croissants');",
    "const rh2=faoCircRhos(10,0,3);",
    "att(rh2.length===3&&rh2[0]===3&&rh2[1]===5&&rh2[2]===10,'rhos entryR=3, ae nul : [3, 5, 10]');",
    // --- faoCircEval avec la nouvelle regle disque.
    "att(faoCircEval(10,0,1,0,3,alw,[],10,10,true,airNo)===null,'eval : disque non couvert sans air -> null (repli legacy)');",
    "const eAir=faoCircEval(10,0,1,0,3,alw,[],10,10,true,alw);",
    "att(eAir&&eAir.sx===7&&eAir.sy===3,'eval : disque en air -> cote CCW');",
    "const e2=faoCircEval(10,0,1,0,3,alw,mvSw,10,10,true,airNo);",
    "att(e2&&e2.sx===7&&e2.sy===3,'eval : disque balaye -> cote CCW');",
    "const mvPatch=[{r:1,x:0,y:0,z:30}];",
    "for(let yy=0;yy<=9;yy+=1){mvPatch.push({r:0,x:0,y:yy,z:10},{r:0,x:4,y:yy,z:10});}",
    "const e2r=faoCircEval(10,0,1,0,[2.5,7],alw,mvPatch,10,4,true,airNo);",
    "att(e2r&&Math.abs(e2r.sx-3)<1e-9&&Math.abs(e2r.sy-7)<1e-9,'eval : rho 2.5 echoue (disque non balaye), rho 7 reussi -> S=(3,7)');",
    "const e3=faoCircEval(10,0,1,0,3,alw,[],10,10,false);",
    "att(e3&&e3.sx===7&&e3.sy===3,'eval : needAnchor false (contour) -> sans disque');",
    "const noS0=function(x,y){return !(Math.abs(x-7)<1&&Math.abs(y-3)<1);};",
    "const mvAnc2=[{r:1,x:0,y:0,z:30},{r:0,x:0,y:-3,z:10},{r:0,x:14,y:-3,z:10}];",
    "const e4=faoCircEval(10,0,1,0,3,noS0,mvAnc2,10,10,true,airNo);",
    "att(e4&&e4.sx===7&&e4.sy===-3,'eval : cote CCW illegal -> miroir CW (disque balaye par y=-3)');",
    "const noBoth=function(){return false;};",
    "att(faoCircEval(10,0,1,0,3,noBoth,mvSw,10,10,true,airNo)===null,'eval : aucun cote legal -> null');",
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
    "att(mvC.some(m=>m.ent===1),'poche circ : sequence d entree etiquetee ent (bleu)');",
    "const mvE=faoOpMoves(Object.assign({},pkC,{id:'pke',entryR:3}),J);",
    "const ia=mvE.findIndex(m=>!m.r&&m.arc);",
    "att(ia>0,'poche entryR=3 : arc present');",
    "if(ia>0){const pv=mvE[ia-1],pe=mvE[ia];",
    "  // 005 : rho=3 est recale a 5 — le disque D/2 autour de S doit etre balaye",
    "  // (rho=3 laisserait des echantillons dans la matiere restante).",
    "  att(Math.abs(Math.hypot(pe.x-pv.x,pe.y-pv.y)-5*Math.SQRT2)<1e-6,'entryR=3 recale a 5 (disque hors matiere) : |S-P| = 5*sqrt2, vu '+(Math.hypot(pe.x-pv.x,pe.y-pv.y)).toFixed(4));}",
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
    "att(rC.some(m=>m.ent===1),'escargot circ : ent sur les entrees');",
    "const iArc=rC.findIndex(m=>!m.r&&m.arc);",
    "att(iArc>0&&rC[iArc].ent===1,'escargot : arc etiquete ent');",
    "const spE=faoSegSplit([rC[iArc-1],rC[iArc]],null);",
    "att(spE.plg.length>6&&spE.plg.length%3===0,'split : arc ent developpe en plongee bleue ('+spE.plg.length+' coords)');",
    "att(spE.cut.length===0,'split : rien de vert sur un arc ent');",
    // ===== 6. apercu : plongees en bleu (bucket plg) =====
    "const sp1=faoSegSplit([{r:1,x:0,y:0,z:10},{r:0,x:0,y:0,z:0}],null);",
    "att(sp1.plg.length===6,'plongee : G1 vertical descendant -> 6 coords en bleu');",
    "att(sp1.cut.length===0&&sp1.rap.length===0,'plongee : ni coupe ni rapide sur ce couple');",
    "const sp2=faoSegSplit([{r:0,x:0,y:0,z:0},{r:0,x:5,y:0,z:0},{r:0,x:5,y:0,z:-2},{r:1,x:9,y:9,z:5}],null);",
    "att(sp2.cut.length===6,'split : G1 horizontal -> coupe verte');",
    "att(sp2.plg.length===6,'split : G1 vertical descendant -> plongee bleue');",
    "att(sp2.rap.length===6,'split : destination G0 -> rapide rouge');",
    "const hx=faoHelixEntry(0,0,10,0,2,10);",
    "att(hx.length>11&&hx.slice(1).every(m=>m.ent===1),'helix : toutes les G1 etiquetees ent (bleu)');",
    "const JO=Object.assign({},J,{ops:[pkC]});",
    "const vwC=faoViewerBuild(JO);",
    "att(vwC.pts.some(p=>p.ent===1),'viewer : ent propage jusqu aux pts (bleu)');",
    // ===== 7. 006 : JAMAIS de plongee a plat dans la matiere (Ø25) =====
    "const d2sT=function(ax,ay,bx,by,px,py){const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;let t=L2>0?((px-ax)*dx+(py-ay)*dy)/L2:0;t=t<0?0:(t>1?1:t);const ex=ax+t*dx-px,ey=ay+t*dy-py;return ex*ex+ey*ey;};",
    "const J25=faoDefaultSetup();J25.stock={x0:0,y0:0,z0:0,x1:120,y1:90,z1:20};",
    "J25.tools=[{id:'T1',d:25,f:800,sf:1000}];",
    "const pk25={id:'p25',on:true,toolId:'T1',type:'pocket',x0:10,y0:10,x1:110,y1:80,ztop:20,zbot:5,ap:5,ae:6,radial:0,axial:0,arrondi:0};",
    "const mv25=faoOpMoves(pk25,J25);",
    "let nPlat=0;",
    "for(let i=1;i<mv25.length;i++){const a=mv25[i-1],b=mv25[i];",
    "  if(!(Math.abs(b.x-a.x)<1e-9&&Math.abs(b.y-a.y)<1e-9&&b.z<a.z-1e-9))continue;",
    "  if(a.z-b.z<=3+1e-9||b.z>=20-1e-9)continue;",
    "  let covF=0;",
    "  for(let j=1;j<i&&!covF;j++){const c=mv25[j-1],e=mv25[j];if(c.r||e.r)continue;if(c.z>b.z+1e-9||e.z>b.z+1e-9)continue;if(d2sT(c.x,c.y,e.x,e.y,b.x,b.y)<=13*13)covF=1;}",
    "  if(!covF)nPlat++;",
    "}",
    "att(nPlat===0,'006 poche D25 : aucune plongee a plat non couverte dans la matiere ('+nPlat+')');",
    "att(mv25.filter(m=>m.ent===1).length>=10,'006 poche D25 : rampes d entree etiquetees ent ('+mv25.filter(m=>m.ent===1).length+' moves)');",
    "const CN1=mkB(0,60,0,80,0,30);",
    "const r25=faoGenRough3D(CN1,{x0:-2,y0:-2,x1:62,y1:82},30,0,{ap:10,ae:8,toolD:25,radial:0,axial:0,secu:45,mode:'escargot',entry:'circ'});",
    "let nPlatE=0;",
    "for(let i=1;i<r25.length;i++){const a=r25[i-1],b=r25[i];",
    "  if(!(Math.abs(b.x-a.x)<1e-9&&Math.abs(b.y-a.y)<1e-9&&b.z<a.z-1e-9))continue;",
    "  if(a.z-b.z<=3+1e-9||b.z>=30-1e-9)continue;",
    "  if(!(b.x>=0&&b.x<=60&&b.y>=0&&b.y<=80))continue;",
    "  let covE=0;",
    "  for(let j=1;j<i&&!covE;j++){const c=r25[j-1],e=r25[j];if(c.r||e.r)continue;if(c.z>b.z+1e-9||e.z>b.z+1e-9)continue;if(d2sT(c.x,c.y,e.x,e.y,b.x,b.y)<=13*13)covE=1;}",
    "  if(!covE)nPlatE++;",
    "}",
    "att(nPlatE===0,'006 escargot D25 : aucune plongee a plat dans la matiere ('+nPlatE+')');",
    // ===== 8. 007 : air = hors du BRUT (boite) — apres la spirale, AUCUNE
    // plongee a plat dont le disque D/2 ne soit deja balaye (croissants des
    // murs/coins non sweeps par les tours circulaires = « a cheval »). =====
    "const FVa=[[0,0,0],[80,0,0],[80,60,0],[0,60,0],",
    " [0,0,18],[80,0,18],[80,60,18],[0,60,18],",
    " [10,10,4],[70,10,4],[70,50,4],[10,50,4],",
    " [10,10,18],[70,10,18],[70,50,18],[10,50,18],",
    " [0,10,18],[80,10,18],[80,50,18],[0,50,18]];",
    "const FTa=[[0,2,1],[0,3,2],",
    " [0,1,5],[0,5,4],[2,3,7],[2,7,6],",
    " [0,4,16],[0,16,19],[0,19,7],[0,7,3],",
    " [1,2,6],[1,6,18],[1,18,17],[1,17,5],",
    " [4,5,17],[4,17,13],[4,13,12],[4,12,16],",
    " [6,7,19],[6,19,15],[6,15,14],[6,14,18],",
    " [16,12,15],[16,15,19],[13,17,18],[13,18,14],",
    " [8,9,10],[8,10,11],",
    " [8,13,9],[8,12,13],[10,15,11],[10,14,15],",
    " [8,11,15],[8,15,12],[9,13,14],[9,14,10]];",
    "const FRa={v:FVa,t:FTa};",
    "const Ba={x0:-5,y0:-5,x1:85,y1:65};",
    "const r7=faoGenRough3D(FRa,Ba,18,4,{ap:4,ae:8,toolD:25,radial:0,axial:0,secu:45,mode:'escargot',entry:'circ'});",
    "const airHB=function(x,y){return x<Ba.x0-1e-9||x>Ba.x1+1e-9||y<Ba.y0-1e-9||y>Ba.y1+1e-9;};",
    "let n7=0,nc7=0;",
    "for(let i=1;i<r7.length;i++){const a=r7[i-1],b=r7[i];",
    "  if(!(Math.abs(b.x-a.x)<1e-9&&Math.abs(b.y-a.y)<1e-9&&b.z<a.z-1e-9))continue;",
    "  if(a.z-b.z<=3+1e-9||b.z>=18-1e-9)continue;",
    "  n7++;",
    "  if(!faoPlungeClear(b.x,b.y,r7.slice(0,i),b.z,25,airHB))nc7++;",
    "}",
    "att(nc7===0,'007 escargot D25 poche ouverte : 0 plongee a plat non couverte apres la spirale ('+nc7+'/'+n7+')');",
    "att(r7.filter(m=>m.ent===1).length>=20,'007 escargot : entrees/rampes etiquetees ent ('+r7.filter(m=>m.ent===1).length+' moves)');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  x '+m));}",
    "else p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'fao_circ.js'});
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
