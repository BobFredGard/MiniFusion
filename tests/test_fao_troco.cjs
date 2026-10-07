// FAO 3D — 2026-10-07-004 : mode trocoïdal + poche d'entrée (esquisse).
// Phase A : évidement conventionnel de la poche (niveaux ap, coupes clipées
// à >= D/2 à l'intérieur du polygone). Phase B : niveaux à pas Ø outil sur
// TOUTE la cavité, entrée forcée dans la poche évacuée (colonne réellement
// vide, pas seulement vide au modèle). Repli conventionnel STRICT (sortie
// identique au parcours sans polygone) quand la poche est absente ou
// inutilisable : outil qui ne tient pas, poche hors région usinable,
// esquisse absente / verticale / multi-contours / îlot / trou / cercle.
//
// Fixture : bloc 80x60x18 avec poche ouverte x[10,70] y[10,50] fond z=4 —
// topologie manifold prouvée du test_fao_fond_finition (mêmes rôles de
// sommets, coordonnées adaptées). Bas = fond (zbot=4) : aucune grille sous
// le plancher, donc aucune coupe « hors poche » parasite en deçà de z=4.
// Grilles : phase A [14,10,6,4.5] (ap=4), phase B [8,4.5] (pas Ø=10).
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    // --- fixture manifold : bloc + poche ouverte vers le haut (rôles = fond_finition)
    "const FV=[[0,0,0],[80,0,0],[80,60,0],[0,60,0],",
    " [0,0,18],[80,0,18],[80,60,18],[0,60,18],",
    " [10,10,4],[70,10,4],[70,50,4],[10,50,4],",
    " [10,10,18],[70,10,18],[70,50,18],[10,50,18],",
    " [0,10,18],[80,10,18],[80,50,18],[0,50,18]];",
    "const FT=[[0,2,1],[0,3,2],",
    " [0,1,5],[0,5,4],[2,3,7],[2,7,6],",
    " [0,4,16],[0,16,19],[0,19,7],[0,7,3],",
    " [1,2,6],[1,6,18],[1,18,17],[1,17,5],",
    " [4,5,17],[4,17,13],[4,13,12],[4,12,16],",
    " [6,7,19],[6,19,15],[6,15,14],[6,14,18],",
    " [16,12,15],[16,15,19],[13,17,18],[13,18,14],",
    " [8,9,10],[8,10,11],",
    " [8,13,9],[8,12,13],[10,15,11],[10,14,15],",
    " [8,11,15],[8,15,12],[9,13,14],[9,14,10]];",
    "const FR={v:FV,t:FT};",
    "const BX={x0:-5,y0:-5,x1:85,y1:65};",
    "(function(){ // fermeture manifold : chaque arete 2 fois, sens opposes",
    "  const ed={};let bad=0;",
    "  for(let i=0;i<FT.length;i++)for(let k=0;k<3;k++){",
    "    const a=FT[i][k],b=FT[i][(k+1)%3];",
    "    const key=Math.min(a,b)+','+Math.max(a,b);",
    "    if(!ed[key])ed[key]=[];",
    "    ed[key].push(a<b?1:-1);",
    "  }",
    "  for(const k in ed){const e=ed[k];if(e.length!==2||e[0]===e[1])bad++;}",
    "  att(bad===0,'fixture poche manifold : '+(bad?bad+' arete(s) mal fermee(s)':'20 sommets, 62 tris'));",
    "})();",
    // --- poche monde 30x20 au coeur de la cavite (D10 : marge outil 10 >= 5,25)
    "const POLY=[[35,30],[65,30],[65,50],[35,50]];",
    // distance signee : + = dedans (mm du bord), - = dehors
    "const sd=function(x,y,pp){return faoDistToPoly(x,y,pp)*(faoPointInPoly(x,y,pp)?1:-1);};",
    "const BASE={ap:4,ae:5,toolD:10,radial:0.5,axial:0.5,secu:23,minipasses:0};",
    "const gen=function(o){const z={};for(const k in BASE)z[k]=BASE[k];if(o)for(const k in o)z[k]=o[k];",
    "  return faoGenRough3D(FR,BX,18,4,z);};",
    "const cuts=function(mv){return mv.filter(function(m){return !m.r;});};",
    "const atZ=function(ms,z){return ms.filter(function(m){return Math.abs(m.z-z)<1e-6;});};",
    "const minSd=function(ms,pp){let w=1/0;ms.forEach(function(m){const d=sd(m.x,m.y,pp);if(d<w)w=d;});return w;};",
    // ================= 1. conventionnel sans poche (reference) =================
    "const mvC=gen();",
    "const cC=cuts(mvC);",
    "att(cC.length>100,'conv : '+cC.length+' coupes');",
    "const z21c=atZ(cC,14);",
    "att(z21c.length>50,'conv : niveau z=14 pleine cavite ('+z21c.length+' coupes)');",
    "att(minSd(z21c,POLY)<=-8,'conv : z=14 s attaque loin de la poche (min sd '+minSd(z21c,POLY).toFixed(2)+')');",
    // ================= 2. troco avec poche valide =================
    "const mvT=gen({poly:POLY});",
    "const cT=cuts(mvT);",
    "att(cT.length>150,'troco : '+cT.length+' coupes (phase A + phase B)');",
    // niveaux des deux grilles presents
    "[14,10,6,4.5].forEach(function(z){att(atZ(cT,z).length>20,'troco : niveau phase A z='+z+' usine ('+atZ(cT,z).length+' coupes)');});",
    "att(atZ(cT,8).length>50,'troco : niveau phase B z=8 (pas Ø) usine ('+atZ(cT,8).length+' coupes)');",
    // PHASE A : z=14/10/6 — jamais plus de ~4 mm hors poche (rayon helice
    // d entree autour d un centre CLIPPE dans le polygone ; les coupes de
    // pelage sont clippees a D/2 = 5 mm dedans)
    "[14,10,6].forEach(function(z){",
    "  const w=minSd(atZ(cT,z),POLY);",
    "  att(w>=-4.1,'troco : phase A z='+z+' reste dans la poche (min sd '+w.toFixed(2)+' >= -4.1)');",
    "});",
    "const w14=minSd(atZ(cT,14),POLY);",
    "att(w14>=-4.1,'troco : z=14 jamais loin de la poche (min sd '+w14.toFixed(2)+')');",
    // PHASE B : le Ø attaque TOUTE la cavite — des coupes hors poche a z=8
    // et z=4.5 (fond), pas seulement des accidents d helice
    "const z8T=atZ(cT,8).filter(function(m){return sd(m.x,m.y,POLY)<=-6;});",
    "att(z8T.length>5,'phase B : z=8 coupe hors poche pres des parois ('+z8T.length+' coupes a sd<=-6)');",
    "const z45T=atZ(cT,4.5).filter(function(m){return sd(m.x,m.y,POLY)<=-6;});",
    "att(z45T.length>5,'phase B : z=4.5 (fond) coupe hors poche ('+z45T.length+' coupes a sd<=-6)');",
    "const z8C=atZ(cC,8);",
    "p('z=8 : troco '+atZ(cT,8).length+' coupes vs conv '+z8C.length+' (accidents d helice)');",
    "att(atZ(cT,8).length>Math.max(20,3*z8C.length),'phase B : vrai plan z=8, pas un accident d helice');",
    "const iA=cT.findIndex(function(m){return !m.r&&Math.abs(m.z-14)<1e-6;});",
    "const iB=cT.findIndex(function(m){return !m.r&&Math.abs(m.z-8)<1e-6&&sd(m.x,m.y,POLY)<=-6;});",
    "att(iA>=0&&iB>iA,'ordre : phase A (z=14) avant la phase B hors poche (z=8)');",
    // ================= 3. repli conventionnel strict =================
    // (a) outil trop grand pour la poche : 5x5 < D/2 + 0,25 = 5,25
    "const TINY=[[37.5,27.5],[42.5,27.5],[42.5,32.5],[37.5,32.5]];",
    "att(faoPolyUsable(TINY,10,FR,BX,18,4,5)===false,'repli : outil D10 ne tient pas dans la poche 5x5');",
    "const mvN=gen({poly:TINY});",
    "att(JSON.stringify(mvN)===JSON.stringify(mvC),'repli outil : sortie STRICTEMENT identique au conventionnel');",
    // (b) poche hors region usinable (loin de tout)
    "const FAR=[[100,100],[120,100],[120,120],[100,120]];",
    "att(faoPolyUsable(FAR,10,FR,BX,18,4,5)===false,'repli : poche hors region usinable');",
    "const mvF=gen({poly:FAR});",
    "att(JSON.stringify(mvF)===JSON.stringify(mvC),'repli hors zone : sortie STRICTEMENT identique au conventionnel');",
    // (c) poche valide : garde-fou passe (et sans maillage = controle structurel seul)
    "att(faoPolyUsable(POLY,10,FR,BX,18,4,5)===true,'garde : poche valide reconnue');",
    "att(faoPolyUsable(POLY,10,null,BX,18,4,5)===true,'garde : sans maillage, controle structurel seul');",
    // (d) polygone malforme (moins de 3 points)
    "att(faoPolyUsable([[0,0],[10,0]],10,FR,BX,18,4,5)===false,'garde : poly < 3 points');",
    // ================= 4. sens long (transposition x<->y) =================
    "const TV=[[0,0,0],[60,0,0],[60,80,0],[0,80,0],",
    " [0,0,18],[60,0,18],[60,80,18],[0,80,18],",
    " [10,10,4],[50,10,4],[50,70,4],[10,70,4],",
    " [10,10,18],[50,10,18],[50,70,18],[10,70,18],",
    " [0,10,18],[60,10,18],[60,70,18],[0,70,18]];",
    "const TP={v:TV,t:FT};",
    "const TB={x0:-5,y0:-5,x1:65,y1:85};",
    "att((TB.y1-TB.y0)>(TB.x1-TB.x0),'sens long : boite portrait (le generateur bascule x<->y)');",
    "const POLY2=[[20,30],[40,30],[40,50],[20,50]];",
    "const mvT2=faoGenRough3D(TP,TB,18,4,{ap:4,ae:5,toolD:10,radial:0.5,axial:0.5,secu:23,minipasses:0,poly:POLY2});",
    "const cT2=cuts(mvT2);",
    "att(cT2.length>150,'sens long : '+cT2.length+' coupes');",
    "[14,10,6].forEach(function(z){",
    "  const w=minSd(atZ(cT2,z),POLY2);",
    "  att(atZ(cT2,z).length>20&&w>=-4.1,'sens long : phase A z='+z+' dans la poche transposee ('+atZ(cT2,z).length+' coupes, min sd '+w.toFixed(2)+')');",
    "});",
    "const z8T2=atZ(cT2,8).filter(function(m){return sd(m.x,m.y,POLY2)<=-6;});",
    "att(z8T2.length>5,'sens long : phase B z=8 hors poche ('+z8T2.length+' coupes)');",
    // ================= 5. faoEntreePoly : esquisse -> polygone monde =================
    "const SK0=doc.sketches.slice();",
    "const mkSk=function(id){return {id:id,name:'P'+id,plane:'XY',origin:[0,0,0],",
    "  axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{},entities:[],constraints:[],dims:[],visible:false,seq:1};};",
    "const rectSk=function(sk,x0,y0,x1,y1,pre){pre=pre||'p';",
    "  sk.points[pre+'a']={x:x0,y:y0};sk.points[pre+'b']={x:x1,y:y0};",
    "  sk.points[pre+'c']={x:x1,y:y1};sk.points[pre+'d']={x:x0,y:y1};",
    "  sk.entities.push({id:pre+'l0',t:'line',p1:pre+'a',p2:pre+'b'},",
    "    {id:pre+'l1',t:'line',p1:pre+'b',p2:pre+'c'},",
    "    {id:pre+'l2',t:'line',p1:pre+'c',p2:pre+'d'},",
    "    {id:pre+'l3',t:'line',p1:pre+'d',p2:pre+'a'});",
    "  return sk;};",
    "const bboxOf=function(pp){let x0=1/0,x1=-1/0,y0=1/0,y1=-1/0;",
    "  pp.forEach(function(q){if(q[0]<x0)x0=q[0];if(q[0]>x1)x1=q[0];if(q[1]<y0)y0=q[1];if(q[1]>y1)y1=q[1];});",
    "  return [x0,x1,y0,y1];};",
    "const bbOk=function(bb,a){return Math.abs(bb[0]-a[0])<1e-6&&Math.abs(bb[1]-a[1])<1e-6&&",
    "  Math.abs(bb[2]-a[2])<1e-6&&Math.abs(bb[3]-a[3])<1e-6;};",
    // rectangle simple : 4 traits forts -> 4 points, bbox monde
    "const skP=rectSk(mkSk('skP'),35,30,65,50);",
    "doc.sketches.push(skP);",
    "const polyP=faoEntreePoly({entree:{sk:'skP'}});",
    "att(Array.isArray(polyP)&&polyP.length===4,'poche : rect 4 traits -> '+polyP.length+' points');",
    "att(polyP&&bbOk(bboxOf(polyP),[35,65,30,50]),'poche : bbox monde [35,65]x[30,50] (vidage attendu)');",
    "att(polyP&&faoPointInPoly(50,40,polyP)&&Math.abs(faoDistToPoly(50,40,polyP)-10)<1e-9,'poche : centre dedans, 10 mm du bord');",
    // trait de construction ignore (contour fort seul)
    "skP.entities.push({id:'dc',t:'line',p1:'pa',p2:'pc',construction:true});",
    "const polyC=faoEntreePoly({entree:{sk:'skP'}});",
    "att(Array.isArray(polyC)&&polyC.length===4,'poche : diagonale de construction ignoree');",
    "skP.entities=skP.entities.filter(function(e){return !e.construction;});",
    // anneau (dedans) -> repli
    "const skD=rectSk(rectSk(mkSk('skD'),0,0,60,40,'o'),20,10,40,30,'i');",
    "doc.sketches.push(skD);",
    "att(faoEntreePoly({entree:{sk:'skD'}})===null,'poche : anneau (trou dedans) -> repli');",
    // deux contours exterieurs disjoints -> repli
    "const sk2=rectSk(rectSk(mkSk('sk2'),0,0,30,20,'a'),40,0,70,20,'b');",
    "doc.sketches.push(sk2);",
    "att(faoEntreePoly({entree:{sk:'sk2'}})===null,'poche : deux contours exterieurs -> repli');",
    // cercle dedans -> repli
    "const skC=rectSk(mkSk('skC'),0,0,60,40);",
    "skC.points.o={x:30,y:20};",
    "skC.entities.push({id:'ci',t:'circle',pc:'o',r:8});",
    "doc.sketches.push(skC);",
    "att(faoEntreePoly({entree:{sk:'skC'}})===null,'poche : cercle dedans -> repli');",
    // plan vertical (n non horizontal) -> repli
    "const skV=rectSk(mkSk('skV'),0,0,30,20);",
    "skV.axN=[0,1,0];skV.axU=[1,0,0];skV.axV=[0,0,1];",
    "doc.sketches.push(skV);",
    "att(faoEntreePoly({entree:{sk:'skV'}})===null,'poche : plan vertical -> repli');",
    // esquisse absente -> repli
    "att(faoEntreePoly({entree:{sk:'zzz_absent'}})===null,'poche : esquisse absente -> repli');",
    "att(faoEntreePoly({})===null&&faoEntreePoly(null)===null,'poche : op sans entree -> repli');",
    // arc : contour arrondi tesselle (> 4 points)
    "const skA=mkSk('skA');",
    "skA.points.o={x:0,y:0};skA.points.qb={x:10,y:0};skA.points.qc={x:0,y:10};",
    "skA.entities.push({id:'la',t:'line',p1:'o',p2:'qb'},",
    "  {id:'aa',t:'arc',pc:'o',pa:'qb',pb:'qc',r:10},",
    "  {id:'lb',t:'line',p1:'qc',p2:'o'});",
    "doc.sketches.push(skA);",
    "const polyA=faoEntreePoly({entree:{sk:'skA'}});",
    "att(Array.isArray(polyA)&&polyA.length>=7,'poche : arc tesselle ('+(polyA?polyA.length:0)+' points)');",
    "att(polyA&&bbOk(bboxOf(polyA),[0,10,0,10]),'poche : arc bbox [0,10]²');",
    // origine deplanchee : coordonnees monde (pas 2D)
    "const skO=rectSk(mkSk('skO'),0,0,30,20);",
    "skO.origin=[5,7,0];",
    "doc.sketches.push(skO);",
    "const polyO=faoEntreePoly({entree:{sk:'skO'}});",
    "att(polyO&&bbOk(bboxOf(polyO),[5,35,7,27]),'poche : origine portee en coordonnees monde');",
    // ================= 6. sanitise : mode + sig rajeuchi =================
    "const skS=rectSk(mkSk('skS'),0,0,30,20);",
    "doc.sketches.push(skS);",
    "const op1={id:'tr1',type:'rough3d',minipasses:0,mode:'troco',entree:'skS'};",
    "faoSanitiseOps({ops:[op1]});",
    "att(op1.mode==='troco','sanitise : mode troco conserve');",
    "att(op1.entree&&op1.entree.sk==='skS','sanitise : entree string -> objet {sk}');",
    "att(op1.entree&&typeof op1.entree.sig==='string'&&op1.entree.sig.length>0,'sanitise : sig de la poche pose');",
    "const sig1=op1.entree.sig;",
    "skS.points.pb.x=31;skS.seq=(skS.seq||1)+1;",
    "faoSanitiseOps({ops:[op1]});",
    "att(op1.entree&&op1.entree.sig!==sig1,'sanitise : sig perime des que la poche est editee');",
    "const op2={id:'tr2',type:'rough3d',minipasses:0,mode:'conv'};",
    "faoSanitiseOps({ops:[op2]});",
    "att(!op2.mode,'sanitise : conv n ecrit aucun champ mode (sigs existants inchanges)');",
    "const op3={id:'tr3',type:'rough3d',minipasses:0,mode:'vidange'};",
    "faoSanitiseOps({ops:[op3]});",
    "att(!op3.mode,'sanitise : mode inconnu purge');",
    "const op4={id:'tr4',type:'rough3d',minipasses:0,mode:'troco',entree:{sk:'zzz_absent'}};",
    "faoSanitiseOps({ops:[op4]});",
    "att(!op4.entree,'sanitise : esquisse retiree du document -> entree supprimee');",
    "const keepDoc=doc;",
    "try{",
    "  doc=undefined;",
    "  const op5={id:'tr5',type:'rough3d',minipasses:0,mode:'troco',entree:{sk:'skP',sig:'x'}};",
    "  faoSanitiseOps({ops:[op5]});",
    "  att(op5.entree&&op5.entree.sk==='skP','sanitise : sans doc, la reference est conservee');",
    "}catch(e){att(false,'sanitise sans doc : exception '+e.message);}",
    "finally{doc=keepDoc;}",
    // ================= 7. dispatch : op troco -> parcours complet =================
    "const job=faoDefaultJob();",
    "job.stock={x0:-5,y0:-5,z0:0,x1:85,y1:65,z1:18};",
    "const mkOp=function(id,extra){const o={id:id,on:true,toolId:'T1',type:'rough3d',",
    "  ztop:18,zbot:4,ap:4,ae:5,radial:0.5,axial:0.5,minipasses:0};",
    "  if(extra)for(const k in extra)o[k]=extra[k];return o;};",
    "const opT=mkOp('dt1',{mode:'troco',entree:{sk:'skP'}});",
    "const opC=mkOp('dt2',{});",
    "const opM=mkOp('dt3',{mode:'troco',entree:{sk:'zzz_absent'}});",
    "const opV=mkOp('dt4',{mode:'troco'});",
    "job.ops=[opT,opC,opM,opV];",
    "const keepAM=faoActiveMesh;",
    "faoActiveMesh=function(){return {mesh:FR,box:BX};};",
    "let dT=[],dC=[],dM=[],dV=[];",
    "try{",
    "  dT=faoOpMoves(opT,job);",
    "  dC=faoOpMoves(opC,job);",
    "  dM=faoOpMoves(opM,job);",
    "  dV=faoOpMoves(opV,job);",
    "}catch(e){att(false,'dispatch : exception '+e.message);}",
    "finally{faoActiveMesh=keepAM;}",
    "att(opT.entree&&opT.entree.sig,'dispatch : sig de poche pose par faoOpMovesKey');",
    "const dTc=cuts(dT),dCc=cuts(dC);",
    "att(dTc.length>150,'dispatch troco : '+dTc.length+' coupes generees');",
    "att(dCc.length>100,'dispatch conv : '+dCc.length+' coupes generees');",
    "const wd=minSd(atZ(dTc,14),POLY);",
    "att(wd>=-4.1,'dispatch troco : z=14 dans la poche (min sd '+wd.toFixed(2)+')');",
    "att(atZ(dTc,8).filter(function(m){return sd(m.x,m.y,POLY)<=-6;}).length>5,'dispatch troco : phase B z=8 hors poche');",
    "const wc=minSd(atZ(dCc,14),POLY);",
    "att(wc<=-8,'dispatch conv : z=14 pleine cavite (min sd '+wc.toFixed(2)+')');",
    "att(JSON.stringify(dM)===JSON.stringify(dC),'dispatch : esquisse absente -> repli conv strict');",
    "att(JSON.stringify(dV)===JSON.stringify(dC),'dispatch : troco sans poche -> repli conv strict');",
    // ================= restauration =================
    "doc.sketches.length=0;SK0.forEach(function(s){doc.sketches.push(s);});",
    "p('troco : '+cT.length+' coupes | conv : '+cC.length+' | phase B z=8 hors poche : '+z8T.length);",
    "p('z=14 min sd : troco '+w14.toFixed(2)+' vs conv '+minSd(z21c,POLY).toFixed(2));",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(function(m){p('  x '+m);});}",
    "else p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'fao_troco.js'});
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
