// 2026-10-28 : PLAN, outil Cote — accrochages imposés au menu contextuel : extrémité, milieu,
// centre, point extrême suivant X / Y, intersection (y compris dans le vide : lignes et cercles
// prolongés, prolongements tracés avec la cote). Valeurs attendues calculées à la main.
// Vue à (100,100), échelle 1 : L1 (0,0)-(20,0), L2 (40,10)-(40,30), cercle C (70,0) R10.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
let ko=0;
const {ctx}=loadApp();
vm.runInContext('window.confirm=function(){return true;};window.alert=function(){};rebuild=function(){};showAll=function(){};applyView=function(){};refreshParts=function(){};',ctx);
const out=vm.runInContext(`(function(){
  const r={fails:[],log:[]};const A=(c,m)=>{if(!c)r.fails.push(m);else r.log.push(m);};
  const near=(p,x,y,t)=>!!p&&Math.abs(p.x-x)<(t||1e-6)&&Math.abs(p.y-y)<(t||1e-6);
  mepSetActive(true);
  const T=window.__mepTest,sh=T.sheet();
  sh.views.length=0;sh.dims.length=0;
  const v=mepAddViewStd('front');v.x=100;v.y=100;v.scale=1;v.axes=[];
  const L1={t:'L',x1:0,y1:0,x2:20,y2:0},L2={t:'L',x1:40,y1:10,x2:40,y2:30},C={t:'C',cx:70,cy:0,r:10};
  T.setViewGeo(v,{src:'dxf',els:[L1,L2,C]});
  T.st().zoom=1;
  // 1. intersections des supports
  const i12=T.snapInter(L1,L2);
  A(i12.length===1&&near(i12[0],40,0),'droite × droite prolongées = (40,0)');
  const i1c=T.snapInter(L1,C);
  A(i1c.length===2&&i1c.some(p=>near(p,60,0))&&i1c.some(p=>near(p,80,0)),'droite × cercle = (60,0) et (80,0)');
  A(T.snapInter({t:'C',cx:0,cy:0,r:5},{t:'C',cx:8,cy:0,r:5}).every(p=>Math.abs(p.x-4)<1e-9&&Math.abs(Math.abs(p.y)-3)<1e-9),'cercle × cercle = (4,±3)');
  A(T.snapInter(L1,{t:'L',x1:0,y1:5,x2:9,y2:5}).length===0,'droites parallèles : aucune intersection');
  // 2. accrochages sous le curseur (mm papier)
  const si=T.snapModePt(141,101,'int');
  A(near(si,140,100)&&si.q.hint&&si.q.hint.t==='int','intersection dans le vide visée près de (140,100)');
  const ex=T.snapExt(v,si.q,si.q.hint.e);
  A(ex.length===2,'2 prolongements (L1 et L2 ne touchent pas le point) : '+ex.length);
  A(ex.some(p=>near({x:p.x1,y:p.y1},120,100)&&p.x2>140),'L1 prolongée de (20,0) au-delà du point');
  A(ex.some(p=>near({x:p.x1,y:p.y1},140,110)&&p.y2<100),'L2 prolongée de (40,10) au-delà du point');
  A(near(T.snapModePt(161,101,'int'),160,100),'droite prolongée × cercle : (60,0)');
  A(near(T.snapModePt(119,101,'end'),120,100),'extrémité de L1');
  A(near(T.snapModePt(112,102,'mid'),110,100),'milieu de L1');
  A(near(T.snapModePt(166,102,'ctr'),170,100),'centre du cercle');
  A(near(T.snapModePt(179,101,'maxx'),180,100),'point extrême X du cercle (côté curseur)');
  A(near(T.snapModePt(161,99,'maxx'),160,100),'point extrême X du cercle (autre côté)');
  A(near(T.snapModePt(171,109,'maxy'),170,110),'point extrême Y du cercle');
  A(near(T.snapModePt(140.5,128,'maxy'),140,130),'point extrême Y d’une droite : son extrémité');
  A(T.snapModePt(300,300,'int')===null,'rien dans le vide lointain');
  // 3. cote complète : intersection → extrémité, puis placement
  mepSetTool('dim');
  T.setSnapMode('int');
  T.dimClick({x:141,y:101});
  A(T.st().dim&&T.st().dim.kind==='dist'&&near(T.st().dim.a,40,0),'1ᵉʳ point = intersection (40,0)');
  T.setSnapMode('end');
  A(T.st().dim&&near(T.st().dim.a,40,0),'changer d’accrochage garde le 1ᵉʳ point');
  T.dimClick({x:101,y:101});
  A(T.st().dim&&near(T.st().dim.b,0,0),'2ᵉ point = extrémité (0,0)');
  T.dimClick({x:120,y:90});
  const d=sh.dims[sh.dims.length-1];
  A(d&&d.kind==='dist'&&d.a.hint&&d.a.hint.t==='int','cote posée avec le point d’intersection référencé');
  A(d&&Math.abs(T.dimMeasure(d)-40)<1e-6,'valeur 40 ('+(d&&T.dimMeasure(d))+')');
  A(T.snapMode()===null,'accrochage revenu à Automatique après la pose');
  // 4. les prolongements sont dessinés avec la cote
  const lines=[];T.drawDim((tag,a)=>{if(tag==='line')lines.push(a);return{appendChild(){},setAttribute(){},textContent:''};},d);
  A(lines.some(p=>Math.abs(p.y1-100)<1e-6&&Math.abs(p.x1-120)<1e-6&&p.x2>140),'prolongement de L1 tracé avec la cote');
  A(lines.some(p=>Math.abs(p.x1-140)<1e-6&&Math.abs(p.y1-110)<1e-6&&p.y2<100),'prolongement de L2 tracé avec la cote');
  // 5. suivi : L2 se déplace à x=45 → la cote vaut 45
  T.setViewGeo(v,{src:'dxf',els:[L1,{t:'L',x1:45,y1:10,x2:45,y2:30},C]});
  A(Math.abs(T.dimMeasure(d)-45)<1e-6,'L2 déplacée : le point d’intersection suit (45) : '+T.dimMeasure(d));
  return r;
})()`,ctx);
console.log('=== PLAN : accrochages imposés de l’outil Cote ===');
out.log.forEach(m=>console.log('  ✓ '+m));
out.fails.forEach(m=>{ko++;console.log('  ✗ '+m);});
console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
process.exit(ko?1:0);
