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
  // 3. cote complète : intersection (2 clics d'entités) → extrémité, puis placement
  mepSetTool('dim');
  T.setSnapMode('int');
  T.dimClick({x:141,y:101});
  A(!T.st().dim&&!T.st().intPick,'Intersection : un clic dans le vide ne prend rien');
  T.dimClick({x:110,y:100.3});
  A(!T.st().dim&&T.st().intPick&&T.st().intPick.i===0,'Intersection : 1ʳᵉ entité = L1, pas encore de point');
  T.dimClick({x:110.5,y:100.2});
  A(!T.st().dim&&T.st().intPick,'Intersection : recliquer la même entité ne donne rien');
  T.dimClick({x:140.2,y:120});
  A(T.st().dim&&T.st().dim.kind==='dist'&&near(T.st().dim.a,40,0)&&!T.st().intPick,'1ᵉʳ point = intersection L1 × L2 (40,0), dans le vide');
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
  T.setViewGeo(v,{src:'dxf',els:[L1,L2,C]});
  // 6. ligne × cercle : des 2 intersections, la plus proche du 2ᵉ clic
  mepSetTool('dim');T.setSnapMode('int');
  T.dimClick({x:110,y:100.3});T.dimClick({x:179.9,y:101.5});
  A(T.st().dim&&near(T.st().dim.a,80,0),'L1 × C, 2ᵉ clic côté droit du cercle → (80,0)');
  mepSetTool('dim');T.setSnapMode('int');
  T.dimClick({x:110,y:100.3});T.dimClick({x:160.1,y:101.5});
  A(T.st().dim&&near(T.st().dim.a,60,0),'L1 × C, 2ᵉ clic côté gauche → (60,0)');
  mepSetTool('dim');T.setSnapMode('int');
  T.dimClick({x:110,y:100.3});T.intCancel();
  A(T.snapMode()==='int'&&!T.st().intPick&&!T.st().dim,'Échap : seule l’intersection en cours est annulée');
  // 7. droite (1ʳᵉ entité) → point imposé : distance perpendiculaire
  mepSetTool('dim');
  T.dimClick({x:140.2,y:120});
  A(T.st().dim&&T.st().dim.kind==='len','clic sur L2 : longueur en cours');
  T.setSnapMode('ctr');
  A(!T.st().dim&&T.st().dimLine&&T.st().dimLine.i===1,'Centre choisi : L2 reste la 1ʳᵉ entité');
  T.dimClick({x:169,y:100.5});
  const D7=T.st().dim;
  A(D7&&D7.kind==='dist'&&D7.orient==='h'&&near(D7.a,40,10)&&near(D7.b,70,0),'L2 verticale → centre : cote horizontale du pied (40,10) au centre');
  T.dimClick({x:150,y:80});
  const d7=sh.dims[sh.dims.length-1];
  A(d7&&d7.orient==='h'&&Math.abs(T.dimMeasure(d7)-30)<1e-6,'valeur 30 ('+(d7&&T.dimMeasure(d7))+')');
  // 8. droite → intersection (L2 puis Intersection L1 × C, côté gauche)
  mepSetTool('dim');
  T.dimClick({x:140.2,y:120});T.setSnapMode('int');
  T.dimClick({x:110,y:100.3});T.dimClick({x:160.1,y:101.5});
  T.dimClick({x:150,y:80});
  const d8=sh.dims[sh.dims.length-1];
  A(d8&&d8!==d7&&d8.b.hint&&d8.b.hint.t==='int'&&Math.abs(T.dimMeasure(d8)-20)<1e-6,'L2 → intersection (60,0) : 20 ('+(d8&&T.dimMeasure(d8))+')');
  // 9. droite oblique → point : cote alignée sur la perpendiculaire
  const L3={t:'L',x1:0,y1:50,x2:10,y2:60};
  T.setViewGeo(v,{src:'dxf',els:[L1,L2,C,L3]});
  mepSetTool('dim');
  T.dimClick({x:105,y:155});T.setSnapMode('end');
  T.dimClick({x:120.3,y:100.3}); // extrémité (20,0) de L1
  const D9=T.st().dim;
  A(D9&&D9.orient==='a'&&near(D9.a,-15,35),'L3 oblique → (20,0) : pied (-15,35) sur la droite prolongée');
  T.dimClick({x:100,y:120});
  const d9=sh.dims[sh.dims.length-1];
  A(d9&&Math.abs(T.dimMeasure(d9)-35*Math.SQRT2)<1e-6,'valeur perpendiculaire 35√2 ('+(d9&&T.dimMeasure(d9))+')');
  return r;
})()`,ctx);
console.log('=== PLAN : accrochages imposés de l’outil Cote ===');
out.log.forEach(m=>console.log('  ✓ '+m));
out.fails.forEach(m=>{ko++;console.log('  ✗ '+m);});
console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
process.exit(ko?1:0);
