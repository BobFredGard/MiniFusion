// 2026-10-26 : outil Cote — un POINT sous le curseur passe avant la ligne qui le porte.
// Symptôme : « je veux sélectionner 2 points lors de la cotation et ce sont toujours les droites
// qui sont sélectionnées ». dimClick testait les lignes AVANT les points : cliquer l'extrémité
// d'une droite créait sa cote de longueur, la cote entre 2 points était impossible.
// Rectangle 100×60 (0,0)-(100,60) ; valeurs attendues calculées à la main.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
let ko=0;
const {ctx}=loadApp();
const out=vm.runInContext(`(function(){
  const r={fails:[],log:[]};const A=(c,m)=>{if(!c)r.fails.push(m);else r.log.push(m);};
  const sk={id:'s1',name:'S',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{},entities:[],constraints:[],dims:[],seq:20,visible:true};
  [['p0',0,0,'e0','p1'],['p1',100,0,'e1','p2'],['p2',100,60,'e2','p3'],['p3',0,60,'e3','p0']].forEach(l=>{sk.points[l[0]]={x:l[1],y:l[2]};sk.entities.push({id:l[3],t:'line',p1:l[0],p2:l[4]});});
  sk.points.c={x:30,y:30};sk.entities.push({id:'ec',t:'circle',pc:'c',r:8});
  doc.sketches=[sk];doc.features=[];
  openSketch('s1');skTool='dim';skUpdateTols();
  const reset=()=>{sk.dims=[];skDimPlace=null;skPendPt=null;skDimLine=null;};
  // 1. deux coins (extrémités de droites) → cote DISTANCE entre les 2 points
  reset();dimClick(100,0,false);
  A(skPendPt==='p1'&&sk.dims.length===0,'1er clic sur le coin (100,0) : le POINT est retenu, pas la droite ('+skPendPt+', '+sk.dims.length+' cote)');
  dimClick(0,60,false);
  const d=sk.dims[0];
  A(d&&d.type==='distance'&&((d.a==='p1'&&d.b==='p3')||(d.a==='p3'&&d.b==='p1')),'2e clic sur le coin opposé : cote distance p1↔p3');
  A(d&&Math.abs(d.value-Math.hypot(100,60))<0.01,'valeur = √(100²+60²) = 116,62 ('+(d&&d.value)+')');
  // 2. clic au MILIEU d'une droite → toujours sa longueur
  reset();dimClick(50,0,false);
  A(sk.dims.length===1&&sk.dims[0].type==='length'&&sk.dims[0].line==='e0'&&Math.abs(sk.dims[0].value-100)<0.01,'clic au milieu de la droite : cote de longueur 100');
  // 3. cote de longueur vivante + clic sur un point d'une autre droite → distance point↔droite
  skDimPlace={id:sk.dims[0].id};
  A(tryExtendDim(sk.dims[0],nearestEntity(sk,100,60,SK_PICK),nearestPoint(sk,100,60,SK_PT))&&sk.dims[0].type==='distline'&&sk.dims[0].p==='p2'&&Math.abs(sk.dims[0].value-60)<0.01,
    'longueur vivante + clic sur le coin (100,60) : distance point↔droite = 60 (et non un angle avec la droite voisine) : '+sk.dims[0].type);
  // 4. diamètre vivant + clic sur un coin → distance centre↔point
  reset();dimClick(38,30,false);
  const dc=sk.dims[0];
  A(dc&&dc.type==='diameter','clic sur le cercle : Ø');
  A(tryExtendDim(dc,nearestEntity(sk,0,0,SK_PICK),nearestPoint(sk,0,0,SK_PT))&&dc.type==='distance'&&Math.abs(dc.value-Math.hypot(30,30))<0.01,'Ø vivant + clic sur le coin (0,0) : distance centre↔point = 42,43 ('+dc.type+')');
  // 5. le centre du cercle est un point : cote centre ↔ origine
  reset();dimClick(30,30,false);
  A(skPendPt==='c','clic sur le centre : point retenu');
  dimClick(0,0,false);
  A(sk.dims.length===1&&sk.dims[0].type==='distance','centre → coin : cote distance');
  closeSketch(false);
  return r;
})()`,ctx);
console.log('=== Cote : les points passent avant les droites ===');
out.log.forEach(m=>console.log('  ✓ '+m));
out.fails.forEach(m=>{ko++;console.log('  ✗ '+m);});
console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
process.exit(ko?1:0);
