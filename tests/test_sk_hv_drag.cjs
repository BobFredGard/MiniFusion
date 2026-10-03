// 2026-10-02-016 : droites verticales/horizontales pendant un glisser.
// Symptôme : « il faut faire en sorte, comme pour les coïncidences et tangences, qu'une
// droite verticale ou horizontale LE RESTE quand on déplace le reste de l'esquisse — là
// elles se déforment et reviennent à leur état ».
// Cause : les passes h/v de solveSketchRelax n'ont PAS la garde « les deux extrémités
// figées → ne rien bouger » que possèdent coincident/online/midpoint/parallel/angle.
// Pendant un glisser, fix = skFixed ∪ ancre : avec O (fixé) + le point tiré (ancré), le
// else « moyenne » déplace les DEUX extrémités (y compris O, provisoirement), ce qui rend
// la contrainte apparemment satisfaite → le garde-fou « saisie ancrée » ne se déclenche
// pas → le filet de sortie recolle O en (0,0) → la ligne reste penchée de la moitié du
// delta pendant tout le glisser, puis « revient » au prochain règlement (sans ancre).
// Correctif : `if(aF&&bF)return;` sur les passes h et v → l'ancre cède à la contrainte :
// la ligne reste droite, le point tiré ne suit le curseur que sur l'axe libre.
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
'const mount=sk=>{ensureSketchBasis(sk);doc.sketches=[sk];doc.features=[];openSketch(sk.id);return sk};',
'const L=(id,p1,p2)=>({id:id,t:"line",p1:p1,p2:p2});',
'const Opos=sk=>{const O=(sk.points||{}).O;return O?("("+f(O.x)+","+f(O.y)+")"):"ABSENT";};',
'const at0=O=>!!O&&Math.abs(O.x)<1e-9&&Math.abs(O.y)<1e-9;',
'confirm=function(){return true;};',
'skTool="select";',
'const C=(wx,wy)=>{const r=svg.getBoundingClientRect();const p=w2s(wx,wy);return [r.left+p[0],r.top+p[1]];};',
'const ev=(t,x,y,ex)=>{const r=Object.assign({type:t,button:0,buttons:0,shiftKey:false,ctrlKey:false,altKey:false,detail:1,pointerId:1,preventDefault:function(){},stopPropagation:function(){}},ex||{});r.clientX=x;r.clientY=y;return r};',
'const pdown=(x,y,ex)=>{const p=C(x,y);svg.dispatchEvent(ev("pointerdown",p[0],p[1],Object.assign({button:0,buttons:1,detail:1},ex)));};',
'const pmove=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev("pointermove",p[0],p[1],{buttons:1}));};',
'const pup=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev("pointerup",p[0],p[1],{button:0,buttons:0}));};',
// ═══ A. glisser d un POINT sur une ligne h attachée à l origine ═══
'const skA=mount({id:"kHA",name:"K",plane:"XY",visible:true,seq:4,',
'  points:{O:{x:0,y:0},a:{x:40,y:0}},entities:[L("l","O","a")],',
'  constraints:[{id:"ch",type:"h",line:"l"}],dims:[],origin:[0,0,0]});',
'pdown(40,0);pmove(40,15);',
'step("A · pendant : a=("+f(skA.points.a.x)+","+f(skA.points.a.y)+") O="+Opos(skA));',
'A(Math.abs(skA.points.a.y)<1e-6,"A1 : la ligne reste horizontale pendant le glisser — a.y="+f(skA.points.a.y));',
'A(Math.abs(skA.points.a.x-40)<1e-6,"A2 : le point suit la souris en X — a.x="+f(skA.points.a.x));',
'A(at0(skA.points.O),"A3 : O intact pendant le glisser — "+Opos(skA));',
'pup(40,15);',
'A(Math.abs(skA.points.a.y)<1e-6,"A4 : après relâcher — a.y="+f(skA.points.a.y));',
'A(at0(skA.points.O)&&R(skA)<1e-4,"A5 : O intact, résidu "+R(skA)+" — "+Opos(skA));',
// ═══ B. glisser d une ENTITÉ du rectangle attaché à l origine (h/v des 4 côtés) ═══
'const skB=mount({id:"kHB",name:"K",plane:"XY",visible:true,seq:8,',
'  points:{O:{x:0,y:0},a:{x:40,y:0},b:{x:40,y:30},c:{x:0,y:30}},',
'  entities:[L("e5","O","a"),L("e6","a","b"),L("e7","b","c"),L("e8","c","O")],',
'  constraints:[{id:"h1",type:"h",line:"e5"},{id:"v1",type:"v",line:"e6"},',
'    {id:"h2",type:"h",line:"e7"},{id:"v2",type:"v",line:"e8"}],dims:[],origin:[0,0,0]});',
'pdown(40,15);pmove(60,5);',
'step("B · pendant : a=("+f(skB.points.a.x)+","+f(skB.points.a.y)+") c=("+f(skB.points.c.x)+","+f(skB.points.c.y)+") O="+Opos(skB));',
'A(Math.abs(skB.points.a.y)<1e-6,"B1 : O→a reste horizontale pendant le glisser — a.y="+f(skB.points.a.y));',
'A(Math.abs(skB.points.c.x)<1e-6,"B2 : c→O reste verticale pendant le glisser — c.x="+f(skB.points.c.x));',
'A(Math.abs(skB.points.b.x-skB.points.a.x)<1e-6,"B3 : a→b reste verticale — dx="+f(skB.points.b.x-skB.points.a.x));',
'A(at0(skB.points.O),"B4 : O intact pendant le glisser — "+Opos(skB));',
'pup(60,5);',
'A(Math.abs(skB.points.a.y)<1e-6&&Math.abs(skB.points.c.x)<1e-6,"B5 : après relâcher — a.y="+f(skB.points.a.y)+" c.x="+f(skB.points.c.x));',
'A(at0(skB.points.O)&&R(skB)<1e-4,"B6 : O intact, résidu "+R(skB)+" — "+Opos(skB));',
// ═══ C. non-régression : ligne h sans point fixé (une extrémité ancrée, l autre libre) ═══
'const skC=mount({id:"kHC",name:"K",plane:"XY",visible:true,seq:4,',
'  points:{d:{x:10,y:10},e:{x:40,y:10}},entities:[L("m","d","e")],',
'  constraints:[{id:"ch2",type:"h",line:"m"}],dims:[],origin:[0,0,0]});',
'pdown(10,10);pmove(10,25);',
'A(Math.abs(skC.points.d.y-skC.points.e.y)<1e-6,"C1 : ligne libre — h tenu pendant le glisser dy="+f(skC.points.d.y-skC.points.e.y));',
'A(Math.abs(skC.points.e.y-25)<1e-6,"C2 : l extrémité libre suit l ancre sur l horizontale — e.y="+f(skC.points.e.y));',
'pup(10,25);',
'A(Math.abs(skC.points.d.y-skC.points.e.y)<1e-6&&R(skC)<1e-4,"C3 : après relâcher dy="+f(skC.points.d.y-skC.points.e.y)+" résidu "+R(skC));',
// ═══ D. point fixé par contrainte (pas O) : ne doit JAMAIS bouger pendant un glisser ═══
'const skD=mount({id:"kHD",name:"K",plane:"XY",visible:true,seq:4,',
'  points:{f:{x:5,y:0},g:{x:45,y:0}},entities:[L("m2","f","g")],',
'  constraints:[{id:"ch3",type:"h",line:"m2"},{id:"cf",type:"fix",p:"f"}],dims:[],origin:[0,0,0]});',
'pdown(45,0);pmove(45,15);',
'step("D · pendant : f=("+f(skD.points.f.x)+","+f(skD.points.f.y)+") g=("+f(skD.points.g.x)+","+f(skD.points.g.y)+")");',
'A(Math.abs(skD.points.f.y)<1e-6,"D1 : le point fixé ne bouge pas — f.y="+f(skD.points.f.y));',
'A(Math.abs(skD.points.g.y)<1e-6,"D2 : l extrémité tirée reste sur l horizontale de f — g.y="+f(skD.points.g.y));',
'pup(45,15);',
'A(Math.abs(skD.points.f.y)<1e-6&&Math.abs(skD.points.g.y)<1e-6,"D3 : après relâcher f.y="+f(skD.points.f.y)+" g.y="+f(skD.points.g.y));',
'A(at0(skD.points.O)&&R(skD)<1e-4,"D4 : O intact, résidu "+R(skD)+" — "+Opos(skD));',
'if(out.fails.length){out.log.push("");out.log.push("ECHECS ("+out.fails.length+") :");out.fails.forEach(m=>out.log.push("  x "+m));}',
'else out.log.push("TOUT EST CONFORME");',
'return out.log.join(String.fromCharCode(10));'
  ].join('\n');
  const wrapped='(function(){\n'+body+'\n})()';
  const r=vm.runInContext(wrapped,ctx,{filename:'test_sk_hv_drag.js'});
  console.log('=== droites h/v pendant un glisser ===');
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,3000));process.exit(1);});
