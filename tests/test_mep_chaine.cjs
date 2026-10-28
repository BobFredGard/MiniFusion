// 2026-10-28 : PLAN, outil Cote — cotation en chaîne : un clic sur une ligne de rappel d'une cote posée
// lance la chaîne ; chaque clic suivant pose une cote sur la MÊME ligne de cote (même orientation), son
// 2ᵉ rappel devient le départ suivant ; Échap termine. Valeurs attendues calculées à la main.
// Vue à (100,100), échelle 1 : traits verticaux x = 0, 15, 35, 60, 80 (y de 0 à 20).
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
  const V=x=>({t:'L',x1:x,y1:0,x2:x,y2:20});
  T.setViewGeo(v,{src:'dxf',els:[V(0),V(15),V(35),V(60),V(80)]});
  T.st().zoom=1;
  // 1. 1ʳᵉ cote : (0,20) → (15,20), horizontale, posée au-dessus
  mepSetTool('dim');
  T.setSnapMode('end');T.dimClick({x:100.3,y:120.3});
  T.setSnapMode('end');T.dimClick({x:115.3,y:120.3});T.dimClick({x:108,y:135});
  const d1=sh.dims[sh.dims.length-1];
  A(d1&&d1.orient==='h'&&Math.abs(T.dimMeasure(d1)-15)<1e-6,'1ʳᵉ cote horizontale 15 ('+(d1&&T.dimMeasure(d1))+')');
  const g1=T.dimLineOf(d1);
  // 2. quel rappel sous le curseur ?
  const mid=(p,q)=>({x:(p.x+q.x)/2,y:(p.y+q.y)/2});
  A(T.chainRappelAt(d1,mid(g1.sb,g1.eb))==='b','milieu du 2ᵉ rappel → b');
  A(T.chainRappelAt(d1,mid(g1.sa,g1.ea))==='a','milieu du 1ᵉʳ rappel → a');
  A(T.chainRappelAt(d1,mid(g1.a1,g1.b1))===null,'ligne de cote : pas un rappel');
  A(T.chainRappelAt(d1,{x:115.1,y:129})==='b','rappel dans la zone large de l’étiquette (cote courte) : b');
  // 3. chaîne depuis le 2ᵉ rappel
  A(T.chainStart(d1,'b')&&T.st().chain&&near(T.st().chain.a,15,20),'chaîne lancée depuis le point (15,20)');
  T.chainHover({x:135.2,y:120.4});
  const gh=T.st().chain.ghost;
  A(gh&&Math.abs(T.dimMeasure(gh)-20)<1e-6,'aperçu de la cote suivante : 20');
  T.chainClick({x:135.2,y:120.4});
  const d2=sh.dims[sh.dims.length-1],g2=T.dimLineOf(d2);
  A(d2!==d1&&d2.orient==='h'&&Math.abs(T.dimMeasure(d2)-20)<1e-6,'2ᵉ cote (15 → 35) : 20 ('+T.dimMeasure(d2)+')');
  A(g2&&Math.abs(g2.a1.y-g1.a1.y)<1e-6,'même ligne de cote que la 1ʳᵉ (y '+(g2&&g2.a1.y)+' / '+g1.a1.y+')');
  T.chainClick({x:160.2,y:120.4});
  const d3=sh.dims[sh.dims.length-1],g3=T.dimLineOf(d3);
  A(d3!==d2&&Math.abs(T.dimMeasure(d3)-25)<1e-6&&Math.abs(g3.a1.y-g1.a1.y)<1e-6,'3ᵉ cote (35 → 60) : 25, alignée');
  // 4. point sans écart horizontal : refusé, la chaîne continue
  const n0=sh.dims.length;
  T.chainClick({x:160.2,y:110});
  A(sh.dims.length===n0&&T.st().chain,'point à la même abscisse : refusé, chaîne toujours active');
  // 5. accrochage imposé dans la chaîne : milieu de x = 80
  T.setSnapMode('mid');
  T.chainClick({x:180.3,y:111});
  const d4=sh.dims[sh.dims.length-1],g4=T.dimLineOf(d4);
  A(d4!==d3&&Math.abs(T.dimMeasure(d4)-20)<1e-6&&near(d4.b,80,10)&&Math.abs(g4.a1.y-g1.a1.y)<1e-6,'milieu imposé (80,10) : 20, toujours alignée');
  A(T.snapMode()===null,'accrochage revenu à Automatique après la cote');
  // 6. fin
  A(T.chainEnd()&&!T.st().chain,'Échap : chaîne terminée');
  A(sh.dims.length===4,'4 cotes au total : '+sh.dims.length);
  return r;
})()`,ctx);
console.log('=== PLAN : cotation en chaîne ===');
out.log.forEach(m=>console.log('  ✓ '+m));
out.fails.forEach(m=>{ko++;console.log('  ✗ '+m);});
console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
process.exit(ko?1:0);
