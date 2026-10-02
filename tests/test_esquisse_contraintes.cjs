// 2026-10-02-003 : esquisse — garde-fou « saisie ancrée » : aucun glisser ne laisse plus
// de contrainte violée (point milieu / arête projetée figée).
// Régressions couvertes :
//  1) pendant un glisser, le point saisi est ANCRÉ (figé) par le solveur ; s'il est tiré
//     contre une contrainte irréductible (milieu sur une ARÊTE PROJETÉE figée, extrémité
//     coincée sur une ligne fixe, cote incompatible…) l'état ancré était gardé tel quel →
//     résidu laissé dans l'esquisse (« lignes rouges ») et tout dérive ensuite : le prochain
//     règlement part d'un état déjà invalide ;
//  2) le glisser d'ENTITÉ (corps rigide) ne passait PAS son ancre au solveur → la composante
//     saisie pouvait être tirée par les contraintes extérieures au lieu de suivre la souris ;
//  3) non-régression : un point/rectangle libre doit TOUJOURS suivre le curseur — le garde-fou
//     n'agit que si le résidu est réellement > 0 ;
//  4) pannes LIBRES (contrainte violée sans saisie) : les 17 types de contraintes + 7 cotes
//     doivent être réparés par un règlement simple ;
//  5) un conflit IRRÉDUCTIBLE reste signalé dans le panneau (pas de dégradation silencieuse).
// Harnais : DOM/THREE stubbé, aucun noyau OCCT requis — la projection est synthétisée
// exactement comme la crée l'outil ⧉ (ligne de construction + 2 contraintes « Fixe »).
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
'const mkSk=(pts,ents,cons,dims)=>({id:"k"+(mkSk.n=(mkSk.n||0)+1),name:"K",plane:"XY",visible:true,',
'  points:JSON.parse(JSON.stringify(pts)),entities:JSON.parse(JSON.stringify(ents)),',
'  constraints:JSON.parse(JSON.stringify(cons)),dims:JSON.parse(JSON.stringify(dims||[])),seq:300});',
'const mount=sk=>{ensureSketchBasis(sk);doc.sketches=[sk];doc.features=[];openSketch(sk.id);return sk;};',
// ═══ A. panne libre : chaque contrainte/cote violée doit être réparée ═══
'const B={O:{x:0,y:0},a:{x:-20,y:0},b:{x:20,y:0},c:{x:-20,y:10},d:{x:20,y:10}};',
'const L=(id,p1,p2)=>({id:id,t:"line",p1:p1,p2:p2});',
'const torture=(name,sk)=>{',
'  let err=null;try{ensureSketchBasis(sk);solveSketch(sk,120);}catch(e){err=String((e&&e.message)||e);}',
'  const r=err?999:R(sk);',
'  step("A · répare "+name+" → résidu "+r.toExponential(2));',
'  A(!err&&r<1e-6,name+" : règlement libre → résidu "+r+(err?" ("+err+")":""));};',
'torture("─ Horizontal",mkSk(B,[L("l","a","b")],[{id:"k",type:"h",line:"l"}]));',
'torture("│ Vertical",mkSk(B,[L("l","a","b")],[{id:"k",type:"v",line:"l"}]));',
'torture("∥ Parallèle",mkSk(B,[L("l1","a","b"),L("l2","c","d")],[{id:"k",type:"parallel",a:"l1",b:"l2"}]));',
'torture("⟂ Perpendiculaire",mkSk(B,[L("l1","a","b"),L("l2","c","d")],[{id:"k",type:"perpendicular",a:"l1",b:"l2"}]));',
'torture("＝ Égal (lignes)",mkSk(B,[L("l1","a","b"),L("l2","c","d")],[{id:"k",type:"equal",a:"l1",b:"l2"}]));',
'torture("＝ Égal (cercles)",mkSk({O:{x:0,y:0},c1:{x:-30,y:0},c2:{x:30,y:0}},',
'  [{id:"e1",t:"circle",pc:"c1",r:5},{id:"e2",t:"circle",pc:"c2",r:12}],[{id:"k",type:"equal",a:"e1",b:"e2"}]));',
'torture("⌾ Coïncident",mkSk({O:{x:0,y:0},a:{x:0,y:0},b:{x:20,y:0},cc:{x:25,y:9}},',
'  [L("l1","a","b"),L("l2","b","cc")],[{id:"k",type:"coincident",a:"b",b:"cc"}]));',
'torture("◎ Coaxial",mkSk({O:{x:0,y:0},c1:{x:-10,y:0},c2:{x:30,y:4}},',
'  [{id:"e1",t:"circle",pc:"c1",r:5},{id:"e2",t:"circle",pc:"c2",r:9}],[{id:"k",type:"coaxial",a:"e1",b:"e2"}]));',
'torture("⦾ Tangence (ligne/cercle)",mkSk({O:{x:0,y:0},a:{x:-20,y:0},b:{x:20,y:0},cc:{x:0,y:8}},',
'  [L("l","a","b"),{id:"e",t:"circle",pc:"cc",r:3}],[{id:"k",type:"tangent",line:"l",ent:"e"}]));',
'torture("⦾ Tangence (cercle/cercle)",mkSk({O:{x:0,y:0},c1:{x:-10,y:0},c2:{x:10,y:0}},',
'  [{id:"e1",t:"circle",pc:"c1",r:4},{id:"e2",t:"circle",pc:"c2",r:6}],[{id:"k",type:"tangent2",a:"e1",b:"e2"}]));',
'torture("∈ Point sur ligne",mkSk({O:{x:0,y:0},a:{x:0,y:0},b:{x:20,y:0},p:{x:7,y:6}},',
'  [L("l","a","b")],[{id:"k",type:"online",p:"p",line:"l"}]));',
'torture("⊙ Point sur cercle",mkSk({O:{x:0,y:0},cc:{x:0,y:0},p:{x:9,y:9}},',
'  [{id:"e",t:"circle",pc:"cc",r:6}],[{id:"k",type:"oncircle",p:"p",ent:"e"}]));',
'torture("⊕ Milieu pt/ligne",mkSk({O:{x:0,y:0},a:{x:-20,y:0},b:{x:20,y:0},m:{x:3,y:7}},',
'  [L("l","a","b")],[{id:"k",type:"midpoint",p:"m",line:"l"}]));',
'torture("⊕ Milieux égaux (2 lignes)",mkSk({O:{x:0,y:0},a1:{x:-20,y:0},a2:{x:20,y:0},b1:{x:-20,y:5},b2:{x:20,y:5}},',
'  [L("la","a1","a2"),L("lb","b1","b2")],[{id:"k",type:"midpoint",a:"la",b:"lb"}]));',
'torture("⇔ Symétrie",mkSk({O:{x:0,y:0},a1:{x:-25,y:0},a2:{x:-15,y:0},b1:{x:12,y:4},b2:{x:24,y:9},m1:{x:0,y:-5},m2:{x:0,y:5}},',
'  [L("la","a1","a2"),L("lb","b1","b2"),L("lm","m1","m2")],[{id:"k",type:"symmetric",a:"la",b:"lb",mid:"lm"}]));',
'torture("milieu + extrémité FIXE",mkSk({O:{x:0,y:0},a:{x:-20,y:0},b:{x:20,y:0},m:{x:0,y:9}},',
'  [L("l","a","b")],[{id:"kf",type:"fix",p:"a"},{id:"k",type:"midpoint",p:"m",line:"l"}]));',
'torture("milieu sur ligne FIGÉE (projetée)",mkSk({O:{x:0,y:0},a:{x:0,y:0},b:{x:100,y:0},m:{x:63,y:7}},',
'  [{id:"l",t:"line",p1:"a",p2:"b",construction:true,proj:true}],',
'  [{id:"f1",type:"fix",p:"a"},{id:"f2",type:"fix",p:"b"},{id:"k",type:"midpoint",p:"m",line:"l"}]));',
'torture("cote longueur",mkSk(B,[L("l","a","b")],[],[{id:"d",type:"length",line:"l",value:40,ox:0,oy:0}]));',
'torture("cote longueur horizontale",mkSk(B,[L("l","a","b")],[{id:"h",type:"h",line:"l"}],',
'  [{id:"d",type:"length",line:"l",value:40,orient:"h",ox:0,oy:0}]));',
'torture("cote distance",mkSk({O:{x:0,y:0},a:{x:0,y:0},b:{x:20,y:0}},[L("l","a","b")],[],',
'  [{id:"d",type:"distance",a:"a",b:"b",value:33,ox:0,oy:0}]));',
'torture("cote Ø",mkSk({O:{x:0,y:0},cc:{x:0,y:0}},[{id:"e",t:"circle",pc:"cc",r:3}],[],',
'  [{id:"d",type:"diameter",ent:"e",value:20,ox:0,oy:0}]));',
'torture("cote angle",mkSk({O:{x:0,y:0},a1:{x:0,y:0},a2:{x:20,y:0},b1:{x:0,y:0},b2:{x:0,y:20}},',
'  [L("la","a1","a2"),L("lb","b1","b2")],[],[{id:"d",type:"angle",a:"la",b:"lb",value:Math.PI/6,w:20,ox:0,oy:0}]));',
'torture("cote entraxe",mkSk({O:{x:0,y:0},a1:{x:0,y:0},a2:{x:20,y:0},b1:{x:0,y:8},b2:{x:20,y:8}},',
'  [L("la","a1","a2"),L("lb","b1","b2")],[{id:"ph",type:"h",line:"la"},{id:"ph2",type:"h",line:"lb"}],',
'  [{id:"d",type:"gap",a:"la",b:"lb",value:15,ox:0,oy:0}]));',
'torture("cote ⟂ centre↔ligne",mkSk({O:{x:0,y:0},a:{x:0,y:0},b:{x:20,y:0},p:{x:5,y:4}},',
'  [L("l","a","b")],[{id:"h",type:"h",line:"l"}],[{id:"d",type:"distline",line:"l",p:"p",value:12,ox:0,oy:0}]));',
// ═══ B. glisser (saisie ANCRÉE) ═══
'const C=(wx,wy)=>{const r=svg.getBoundingClientRect();const p=w2s(wx,wy);return [r.left+p[0],r.top+p[1]];};',
'const ev=(t,x,y,ex)=>{const r=Object.assign({type:t,button:0,buttons:0,shiftKey:false,ctrlKey:false,altKey:false,detail:1,pointerId:1,preventDefault:function(){},stopPropagation:function(){}},ex||{});r.clientX=x;r.clientY=y;return r};',
'const pdown=(x,y,ex)=>{const p=C(x,y);svg.dispatchEvent(ev("pointerdown",p[0],p[1],Object.assign({button:0,buttons:1,detail:1},ex)));};',
'const pmove=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev("pointermove",p[0],p[1],{buttons:1}));};',
'const pup=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev("pointerup",p[0],p[1],{button:0,buttons:0}));};',
// esquisse « 4 arêtes projetées + 2 points milieu + ligne centrale » (topologie réelle de l'outil ⧉)
'const projSk=()=>mkSk({a:{x:0,y:0},b:{x:100,y:0},c:{x:100,y:60},d:{x:0,y:60},mb:{x:50,y:0},mt:{x:50,y:60},',
'    fx:{x:200,y:100},fy:{x:250,y:100}},',
'  [{id:"lp",t:"line",p1:"a",p2:"b",construction:true,proj:true},',
'   {id:"lr",t:"line",p1:"b",p2:"c",construction:true,proj:true},',
'   {id:"lt",t:"line",p1:"c",p2:"d",construction:true,proj:true},',
'   {id:"ll",t:"line",p1:"d",p2:"a",construction:true,proj:true},',
'   {id:"lc",t:"line",p1:"mb",p2:"mt"},{id:"lx",t:"line",p1:"fx",p2:"fy"}],',
'  [{id:"fa",type:"fix",p:"a"},{id:"fb",type:"fix",p:"b"},{id:"fc",type:"fix",p:"c"},{id:"fd",type:"fix",p:"d"},',
'   {id:"m1",type:"midpoint",p:"mb",line:"lp"},{id:"m2",type:"midpoint",p:"mt",line:"lt"}]);',
'const sk=mount(projSk());solveSketch(sk);',
'A(R(sk)<1e-6,"B0 : esquisse projetée de départ réglée (résidu "+R(sk)+")");',
'skTool="select";',
// 1. le point MILIEU tiré hors de son milieu : il doit revenir au centre
'pdown(50,0);pmove(63,7);pup(63,7);',
'const mb=sk.points.mb;',
'step("B1 · glisser du point milieu → ("+f(mb.x)+","+f(mb.y)+") résidu "+R(sk));',
'A(R(sk)<1e-6,"B1 : glisser du point milieu → résidu "+R(sk)+" (sans garde-fou : 14,76 mm)");',
'A(Math.hypot(mb.x-50,mb.y-0)<1e-4,"B1 : le point est REVENU au centre de l\u2019arête projetée ("+f(mb.x)+","+f(mb.y)+")");',
// 2. idem sur le milieu du haut
'pdown(50,60);pmove(70,74);pup(70,74);',
'const mt=sk.points.mt;',
'step("B2 · glisser du milieu du haut → ("+f(mt.x)+","+f(mt.y)+") résidu "+R(sk));',
'A(R(sk)<1e-6,"B2 : glisser du milieu du haut → résidu "+R(sk));',
'A(Math.hypot(mt.x-50,mt.y-60)<1e-4,"B2 : revenu au centre ("+f(mt.x)+","+f(mt.y)+")");',
// 3. l'arête projetée reste figée (message d'entité fixée, rien ne bouge)
'const avant=JSON.stringify(sk.points);',
'pdown(25,0);pmove(25,12);pup(25,12);',
'step("B3 · glisser l\u2019arête projetée → "+skMsg);',
'A(JSON.stringify(sk.points)===avant,"B3 : arête projetée FIGÉE, aucune coordonnée ne bouge");',
'A(R(sk)<1e-6,"B3 : …et résidu "+R(sk));',
'A(/fix/i.test(skMsg||""),"B3 : message « entité fixée » affiché ("+skMsg+")");',
// 4. un point/segment libre doit TOUJOURS suivre le curseur (le garde-fou n\u2019agit pas ici)
'pdown(200,100);pmove(215,120);pup(215,120);',
'const fx=sk.points.fx;',
'step("B4 · glisser un point libre → ("+f(fx.x)+","+f(fx.y)+") résidu "+R(sk));',
'A(Math.hypot(fx.x-215,fx.y-120)<0.5,"B4 : le point libre SUIT le curseur ("+f(fx.x)+","+f(fx.y)+") — non-régression");',
'A(R(sk)<1e-6,"B4 : …résidu "+R(sk));',
// 5. le milieu re-suit quand la projection associative bouge (arête basse remontée de 10)
'sk.points.a.y=10;sk.points.b.y=10;solveSketch(sk);',
'step("B5 · projection déplacée → milieu ("+f(sk.points.mb.x)+","+f(sk.points.mb.y)+") résidu "+R(sk));',
'A(Math.hypot(sk.points.mb.x-50,sk.points.mb.y-10)<1e-4,"B5 : le milieu SUIT l\u2019arête projetée déplacée ("+f(sk.points.mb.x)+","+f(sk.points.mb.y)+")");',
'A(R(sk)<1e-6,"B5 : …résidu "+R(sk));',
// 6. corps rigide d\u2019un rectangle contraint (h/v) : il suit et reste rectangle
'const skR=mount(mkSk({q0:{x:150,y:10},q1:{x:250,y:10},q2:{x:250,y:80},q3:{x:150,y:80}},',
'  [L("e0","q0","q1"),L("e1","q1","q2"),L("e2","q2","q3"),L("e3","q3","q0")],',
'  [{id:"h0",type:"h",line:"e0"},{id:"v1",type:"v",line:"e1"},{id:"h2",type:"h",line:"e2"},{id:"v3",type:"v",line:"e3"}]));',
'solveSketch(skR);skTool="select";',
'pdown(150,10);pmove(165,20);pup(165,20);',
'const q0=skR.points.q0,q1=skR.points.q1,q2=skR.points.q2,q3=skR.points.q3;',
'step("B6 · rectangle contraint glissé → coin ("+f(q0.x)+","+f(q0.y)+") résidu "+R(skR));',
'A(Math.hypot(q0.x-165,q0.y-20)<0.5,"B6 : le coin suit le curseur ("+f(q0.x)+","+f(q0.y)+") — non-régression");',
'A(Math.abs((q1.x-q0.x)-100)<1e-3&&Math.abs(q1.y-q0.y)<1e-3&&Math.abs((q2.y-q1.y)-70)<1e-3,',
'  "B6 : le rectangle est resté rectangle (100×70) : dx="+(q1.x-q0.x).toFixed(3)+" dy="+(q1.y-q0.y).toFixed(3));',
'A(R(skR)<1e-6,"B6 : …résidu "+R(skR));',
// 7. conflit IRRÉDUCTIBLE : il doit rester signalé (pas de dégradation silencieuse)
'const skX=mount(mkSk({O:{x:0,y:0},u:{x:0,y:0},v:{x:20,y:0}},[],',
'  [{id:"f1",type:"fix",p:"u"},{id:"f2",type:"fix",p:"v"},{id:"k",type:"coincident",a:"u",b:"v"}]));',
'solveSketch(skX);skRefreshHealth();',
'const rX=R(skX),msg=skDefaultStatus();',
'step("B7 · conflit irréductible → résidu "+f(rX)+" · "+msg);',
'A(rX>0.05,"B7 : conflit irréductible SIGNALÉ (résidu "+f(rX)+" > 0,05 mm)");',
'A(/Sur-contrainte/.test(msg),"B7 : le panneau l\u2019annonce : "+msg);',
'return out;'
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx,{filename:'test_esquisse_contraintes.cjs'});
  console.log('=== esquisse : contraintes + garde-fou « saisie ancrée » ===');
  (o.log||[]).forEach(l=>console.log('  · '+l));
  if(o.fails&&o.fails.length){console.log('ECHECS :');o.fails.forEach(m=>console.log('  x '+m));process.exit(1);}
  console.log('TOUT EST CONFORME');
  process.exit(0);
})().catch(e=>{console.log('FATAL/FAIL',String((e&&e.stack)||e).slice(0,900));process.exit(1);});
