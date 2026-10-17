// V0.2.2 : COÏNCIDENT en contrainte (bouton du groupe contraintes ; l'outil ⌖ reste) —
// point + ligne : le point reste sur la DROITE et peut glisser AU-DELÀ du segment.
const vm=require('vm');const {loadApp}=require('./appvm.cjs');
let ko=0;const A=(c,m)=>{if(!c){ko++;console.log('  x '+m);}else console.log('  ✓ '+m);};
const {ctx}=loadApp();
const r=vm.runInContext(`(function(){const o={};
  const sk={id:'s',name:'s',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],
    points:{a:{x:0,y:0},b:{x:10,y:0},p:{x:5,y:3},q:{x:20,y:7},c:{x:30,y:0},d:{x:31,y:6}},
    entities:[{id:'l',t:'line',p1:'a',p2:'b'},{id:'k',t:'circle',pc:'c',r:5},{id:'pp',t:'cpoint',p:'p'},{id:'qq',t:'cpoint',p:'q'}],
    constraints:[{id:'f1',type:'fix',p:'a'},{id:'f2',type:'fix',p:'b'},{id:'f3',type:'fix',p:'c'}],dims:[],seq:50};
  doc.sketches=[sk];skEdit=sk;
  skSel={kind:'point',pid:'p'};skSelX=[{kind:'ent',id:'l'}];applyCon('coincident');
  o.online=sk.constraints.some(c=>c.type==='online'&&c.p==='p'&&c.line==='l');
  o.py=sk.points.p.y;
  sk.points.p.x=25;sk.points.p.y=2;sk.constraints.push({id:'fx',type:'fix',p:'p'});sk.points.p.y=2;
  sk.constraints=sk.constraints.filter(c=>c.id!=='fx');
  solveSketch(sk);o.beyond=[sk.points.p.x,sk.points.p.y];
  skSel={kind:'point',pid:'q'};skSelX=[{kind:'point',pid:'p'}];applyCon('coincident');
  o.pp=sk.constraints.some(c=>c.type==='coincident'&&((c.a==='q'&&c.b==='p')||(c.a==='p'&&c.b==='q')));
  skSel={kind:'point',pid:'d'};skSelX=[{kind:'ent',id:'k'}];applyCon('coincident');
  o.oncircle=sk.constraints.some(c=>c.type==='oncircle'&&c.p==='d'&&c.ent==='k');
  o.dR=Math.hypot(sk.points.d.x-30,sk.points.d.y)-5;
  return o;})()`,ctx);
A(r.online&&Math.abs(r.py)<1e-6,'1 point + 1 ligne : contrainte « point sur droite », point ramené sur la droite (y='+r.py.toFixed(6)+')');
A(Math.abs(r.beyond[1])<1e-6&&r.beyond[0]>10,'le point glisse AU-DELÀ du segment (x='+r.beyond[0].toFixed(3)+', y='+r.beyond[1].toFixed(6)+')');
A(r.pp,'2 points : coïncidence point/point');
A(r.oncircle&&Math.abs(r.dR)<1e-6,'1 point + 1 cercle : point sur le cercle (écart '+r.dR.toExponential(1)+')');
console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');process.exit(ko?1:0);
