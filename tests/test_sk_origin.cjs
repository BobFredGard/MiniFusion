// 2026-10-02-015 : point d'origine — « mon point d'origine perd son origine ».
// Régressions couvertes :
//  1) état corrompu persisté (document réel de l'utilisateur) : le point O est resté au
//     centre du rectangle dérivé (-38,27 ; -26,70) au lieu de (0,0) — rien ne le ramène
//     (ensureOrigin ne fait que créer s absent) → l ouverture doit le ré-anchrer et le
//     règlement doit re-centrer le dessin sur (0,0) avec résidu nul ;
//  2) doublon : esquisse SANS point O mais avec un point pile en (0,0) portant les
//     droites (ancien faux-origine) — ensureOrigin créait O A CÔTÉ → deux points superposés,
//     le vrai « origine » ne joue plus son rôle et le faux bouge avec les droites ;
//     la promotion doit FUSIONNER le porteur en O (références transférées) ;
//  3) filet de fin de règlement : si une passe emmène O, solveSketch doit le recoller en
//     (0,0) à la sortie (et l ouverture/chaque action passe par ensureOrigin) ;
//  4) ancrages de congé : fusion vers O doit transférer les ancres type p des features ;
//  5) non-régressions : glisser sur O bloqué, cote depuis O réglée, skClearAll, aucun
//     écart de O pendant un règlement standard.
// Harnais : DOM/THREE stubbé, aucun noyau OCCT requis.
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const {ctx,loadErr}=loadApp();
  if(loadErr)console.log('  (harnais : buildScene interrompu — comportement normal du stub)');
  const body=[
'const out={fails:[],log:[]};',
'const A=(c,m)=>{if(!c)out.fails.push(m);};',
'const f=n=>(typeof n==="number"&&isFinite(n))?n.toFixed(4):String(n);',
'const R=sk=>{try{return skAudit(sk).residual||0;}catch(e){return 999;}};',
'const step=m=>out.log.push(m);',
'const Opos=sk=>{const O=(sk.points||{}).O;return O?("("+f(O.x)+","+f(O.y)+")"):"ABSENT";};',
'const at0=O=>!!O&&Math.abs(O.x)<1e-9&&Math.abs(O.y)<1e-9;',
'const nAt0=sk=>Object.keys(sk.points).filter(p=>at0(sk.points[p])).length;',
'const mount=sk=>{ensureSketchBasis(sk);doc.sketches=[sk];doc.features=[];openSketch(sk.id);return sk};',
'const L=(id,p1,p2)=>({id:id,t:"line",p1:p1,p2:p2});',
'confirm=function(){return true;};',
// ═══ A. document réel de l'utilisateur (extrait esquisse.json) : O dérivé au centre ═══
'const userSk=()=>({id:"kA",name:"Esquisse 1",plane:"XY",visible:true,seq:24,',
'  origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],',
'  points:{O:{x:-38.27076791349009,y:-26.698817510627315},',
'    p1:{x:-123.27076791349009,y:-96.69881751062732},p2:{x:46.72923208650991,y:-96.69881751062732},',
'    p3:{x:46.72923208650991,y:43.30118248937269},p4:{x:-123.27076791349009,y:43.30118248937269},',
'    p13:{x:131.95845170454544,y:-26.698817510627315},p14:{x:-38.27076791349009,y:113.27414772727273}},',
'  entities:[L("e5","p1","p2"),L("e6","p2","p3"),L("e7","p3","p4"),L("e8","p4","p1"),',
'    {id:"e15",t:"line",p1:"O",p2:"p13",construction:true},{id:"e16",t:"line",p1:"O",p2:"p14",construction:true}],',
'  constraints:[{id:"e9",type:"h",line:"e5"},{id:"e10",type:"h",line:"e7"},',
'    {id:"e11",type:"v",line:"e6"},{id:"e12",type:"v",line:"e8"},',
'    {id:"e17",type:"h",line:"e15"},{id:"e18",type:"v",line:"e16"},{id:"e19",type:"fix",p:"O"},',
'    {id:"e20",type:"symmetric",a:"e8",b:"e6",mid:"e16"},{id:"e21",type:"symmetric",a:"e5",b:"e7",mid:"e15"}],',
'  dims:[{id:"e22",type:"length",line:"e5",value:170,ox:0,oy:6},{id:"e23",type:"length",line:"e6",value:140,ox:6,oy:0}]});',
'const skA=mount(userSk());',
'step("A0 · état reçu : O="+Opos(skA));',
'A(at0(skA.points.O),"A1 : à l ouverture, O est ré-anchré en (0,0) — reçu "+Opos(skA));',
'let eA=null;try{solveSketch(skA,160);}catch(e){eA=String((e&&e.message)||e);}',
'const rA=eA?999:R(skA);',
'step("A1 · après règlement : O="+Opos(skA)+" résidu "+rA.toExponential(2));',
'A(at0(skA.points.O),"A2 : O reste (0,0) après règlement — "+Opos(skA)+(eA?" ("+eA+")":""));',
'A(!eA&&rA<1e-4,"A3 : le document se re-règle (résidu "+rA+")");',
'const cx=(skA.points.p1.x+skA.points.p2.x+skA.points.p3.x+skA.points.p4.x)/4;',
'const cy=(skA.points.p1.y+skA.points.p2.y+skA.points.p3.y+skA.points.p4.y)/4;',
'step("A2 · centre rectangle ("+f(cx)+","+f(cy)+")");',
'A(Math.hypot(cx,cy)<1e-3,"A4 : rectangle re-centré sur l origine ("+f(cx)+","+f(cy)+")");',
// ═══ B. doublon : esquisse sans O, porteur en (0,0) ═══
'const skB=mount({id:"kB",name:"K",plane:"XY",visible:true,seq:6,',
'  points:{a:{x:0,y:0},b:{x:50,y:0}},',
'  entities:[L("l","a","b")],constraints:[{id:"ch",type:"h",line:"l"}],dims:[],origin:[0,0,0]});',
'step("B0 · points après ouverture : "+Object.keys(skB.points).join(",")+" (anciens : a,b)");',
'A(!!skB.points.O,"B1 : O existe après ouverture");',
'A(nAt0(skB)===1,"B2 : UN SEUL point en (0,0) (doublon : "+nAt0(skB)+")");',
'A(skB.entities[0].p1==="O","B3 : la ligne est ré-attachée à O (promotion) — p1="+skB.entities[0].p1);',
'A(!skB.points.a,"B4 : l ancien faux-origine n existe plus en double");',
'let eB=null;try{solveSketch(skB,120);}catch(e){eB=String((e&&e.message)||e);}',
'A(!eB&&R(skB)<1e-6,"B5 : règlement résidu "+(eB?eB:R(skB)));',
'A(at0(skB.points.O),"B6 : O à (0,0) après règlement");',
// ═══ C. filet de fin de règlement : O déplacé entre deux actions ═══
'skA.points.O={x:12,y:-7};',
'let eC=null;try{solveSketch(skA,160);}catch(e){eC=String((e&&e.message)||e);}',
'step("C0 · O artificiellement (12,-7) → après règlement "+Opos(skA));',
'A(at0(skA.points.O),"C1 : filet de solveSketch recolle O en (0,0) — "+Opos(skA)+(eC?" ("+eC+")":""));',
'A(!eC&&R(skA)<1e-4,"C2 : résidu après recol "+(eC?eC:R(skA)));',
// C3 : une passe « dérape » en fin de règlement (skSolveFinal simulé) → filet de sortie
'const _fin=skSolveFinal;',
'skSolveFinal=function(s,a){_fin(s,a);s.points.O={x:12,y:-7};};',
'let eC3=null;try{solveSketch(skA,160);}catch(e){eC3=String((e&&e.message)||e);}finally{skSolveFinal=_fin;}',
'step("C1 · passe parasite simulée → O="+Opos(skA));',
'A(at0(skA.points.O),"C3 : filet de sortie de solveSketch recolle l origine — "+Opos(skA)+(eC3?" ("+eC3+")":""));',
// ═══ D. ancrages de congé transférés par la fusion vers O ═══
'const skD=mount({id:"kD",name:"K",plane:"XY",visible:true,seq:4,',
'  points:{O:{x:0,y:0},a:{x:1,y:0},b:{x:40,y:0}},entities:[L("l","a","b")],constraints:[],dims:[],origin:[0,0,0]});',
'doc.features=[{id:"f1",type:"xfillet",edges:[{anchor:{t:"p",sk:skD.id,id:"a"}}]}];',
'skD.points.a={x:0,y:0}; // porteur pile en (0,0), ancre le pointant (ancien faux-origine)',
'delete skD.points.O; // corruption : O disparu, ancre et ligne restent sur a',
'openSketch(skD.id);',
'const anch=doc.features[0].edges[0].anchor;',
'step("D0 · ancre après ouverture : "+JSON.stringify(anch));',
'A(anch.id==="O","D3 : l ancre de congé suit la promotion en O — id="+anch.id);',
// ═══ E. non-régressions ═══
'const skE=mount({id:"kE",name:"K",plane:"XY",visible:true,seq:4,',
'  points:{O:{x:0,y:0},a:{x:30,y:0}},entities:[L("l","O","a")],constraints:[],',
'  dims:[{id:"d",type:"distance",a:"O",b:"a",value:50,ox:0,oy:0}],origin:[0,0,0]});',
'let eE=null;try{solveSketch(skE,120);}catch(e){eE=String((e&&e.message)||e);}',
'A(!eE&&R(skE)<1e-6&&at0(skE.points.O),"E1 : cote depuis O réglée, O intact (résidu "+(eE?eE:R(skE))+")");',
// glisser sur O : le point origine ne bouge pas (point fixe)
'skTool="select";',
'const C=(wx,wy)=>{const r=svg.getBoundingClientRect();const p=w2s(wx,wy);return [r.left+p[0],r.top+p[1]];};',
'const ev=(t,x,y,ex)=>{const r=Object.assign({type:t,button:0,buttons:0,shiftKey:false,ctrlKey:false,altKey:false,detail:1,pointerId:1,preventDefault:function(){},stopPropagation:function(){}},ex||{});r.clientX=x;r.clientY=y;return r};',
'const pdown=(x,y,ex)=>{const p=C(x,y);svg.dispatchEvent(ev("pointerdown",p[0],p[1],Object.assign({button:0,buttons:1,detail:1},ex)));};',
'const pmove=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev("pointermove",p[0],p[1],{buttons:1}));};',
'const pup=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev("pointerup",p[0],p[1],{button:0,buttons:0}));};',
'pdown(0,0);pmove(18,11);pup(18,11);',
'A(at0(skE.points.O),"E2 : glisser sur l origine bloqué — O="+Opos(skE));',
'A(Math.hypot(skE.points.a.x-50,skE.points.a.y)<1e-3,"E3 : la cote 50 a étiré a à 50 (O cloué) — a=("+f(skE.points.a.x)+","+f(skE.points.a.y)+")");',
// skClearAll : O recréé proprement
'skEdit=skE;skClearAll();',
'A(!!skE.points.O&&at0(skE.points.O),"E4 : skClearAll → O recréé à (0,0)");',
'if(out.fails.length){out.log.push("");out.log.push("ECHECS ("+out.fails.length+") :");out.fails.forEach(m=>out.log.push("  x "+m));}',
'else out.log.push("TOUT EST CONFORME");',
'return out.log.join(String.fromCharCode(10));'
  ].join('\n');
  const wrapped='(function(){\n'+body+'\n})()';
  const r=vm.runInContext(wrapped,ctx,{filename:'test_sk_origin.js'});
  console.log('=== point d origine (0,0) ===');
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,3000));process.exit(1);});
