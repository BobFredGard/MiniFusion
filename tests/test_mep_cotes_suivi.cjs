// 2026-10-28 : « des fois, les cotes ne changent pas après avoir modifié le 3D : la largeur du
// 1er sketch passe de 10,14 à 10 et la cote de la mise en plan n'a pas bougé ; supprimée et
// recréée, elle est bonne ». Les cotes ne se ré-ancraient qu'au bouton « Rejeter » : une cote de
// distance gardait ses anciens points. Chaque point accroché à une arête (ou au centre d'un cercle)
// suit maintenant son entité dès que la géométrie exacte de la vue change.
// Rectangle 10,14 × 20 (vue à (100,100), échelle 1) + trou Ø6 en (5,10) ; valeurs à la main.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
let ko=0;
const {ctx}=loadApp();
vm.runInContext('window.confirm=function(){return true;};window.alert=function(){};rebuild=function(){};showAll=function(){};applyView=function(){};refreshParts=function(){};',ctx);
const out=vm.runInContext(`(function(){
  const r={fails:[],log:[]};const A=(c,m)=>{if(!c)r.fails.push(m);else r.log.push(m);};
  mepSetActive(true);
  const T=window.__mepTest,sh=T.sheet();
  sh.views.length=0;sh.dims.length=0;
  const v=mepAddViewStd('front');v.x=100;v.y=100;v.scale=1;v.axes=[];
  const geo=w=>({src:'dxf',els:[
    {t:'L',x1:0,y1:0,x2:0,y2:20,k:'sharp'},      // 0 gauche
    {t:'L',x1:0,y1:20,x2:w,y2:20,k:'sharp'},     // 1 bas
    {t:'L',x1:w,y1:20,x2:w,y2:0,k:'sharp'},      // 2 droite
    {t:'L',x1:w,y1:0,x2:0,y2:0,k:'sharp'},       // 3 haut
    {t:'C',cx:w/2,cy:10,r:3}]});                 // 4 trou au milieu
  T.setViewGeo(v,geo(10.14));
  T.st().zoom=1;
  const g0=T.geo(v),sig=i=>T.entSig(g0.els[i]);
  // 1. distance entre les 2 arêtes verticales (2 entités sélectionnées)
  T.setEntSel([{vid:v.id,i:0,t:'L',sig:sig(0),lx:0,ly:8},{vid:v.id,i:2,t:'L',sig:sig(2),lx:10.14,ly:12}]);
  const dd=T.dimDraftFromSel();dd.id='dW';delete dd.__ghost;delete dd.__sel;dd.off=-12;sh.dims.push(dd);
  // 2. longueur de l'arête du bas
  sh.dims.push({id:'dL',kind:'len',vid:v.id,vid2:null,a:{x:0,y:20,hint:{t:'seg',i:1}},b:{x:10.14,y:20},off:8,orient:'a',tol:null});
  // 3. distance coin → centre du trou (points accrochés : extrémité, centre)
  sh.dims.push({id:'dP',kind:'dist',vid:v.id,vid2:null,a:{x:10.14,y:0,hint:{t:'seg',i:2}},b:{x:5.07,y:10,hint:{t:'ctr',i:4}},off:6,orient:'h',tol:null});
  // 4. Ø du trou
  sh.dims.push({id:'dD',kind:'dia',vid:v.id,vid2:null,a:{x:5.07,y:10,hint:{t:'ctr',i:4}},b:{x:20,y:-5},off:0,tol:null});
  // 5. cote posée par 2 clics de points (accrochage extrémité puis centre)
  mepSetTool('dim');T.setSnapMode('end');T.dimClick({x:110.5,y:100.4});
  T.setSnapMode('ctr');T.dimClick({x:105.5,y:110.3});T.dimClick({x:108,y:90});
  const dK=sh.dims[sh.dims.length-1];dK.id='dK';dK.orient='a'; // oblique : le cas qui n'était pas rafraîchi
  A(dK.kind==='dist'&&dK.a.hint&&dK.a.hint.t==='seg'&&dK.b.hint&&dK.b.hint.t==='ctr','cote par points : coin et centre gardent leur entité');
  const M=id=>T.dimMeasure(sh.dims.find(d=>d.id===id));
  A(Math.abs(M('dK')-Math.hypot(5.07,10))<1e-6,'avant : coin → centre '+M('dK'));
  A(Math.abs(M('dW')-10.14)<1e-6,'avant : largeur 10,14 ('+M('dW')+')');
  A(Math.abs(M('dL')-10.14)<1e-6,'avant : longueur 10,14');
  A(Math.abs(M('dP')-5.07)<1e-6,'avant : coin → trou 5,07 en X');
  A(Math.abs(M('dD')-6)<1e-6,'avant : Ø 6');
  // le 3D change : largeur 10 (nouvel objet géométrie, comme après une régénération)
  T.setViewGeo(v,geo(10));
  A(Math.abs(M('dW')-10)<1e-6,'après : la cote de largeur suit (10) : '+M('dW'));
  A(Math.abs(M('dL')-10)<1e-6,'après : la longueur suit (10) : '+M('dL'));
  const dL=sh.dims.find(d=>d.id==='dL');
  A(Math.abs(dL.b.x-10)<1e-6,'après : les extrémités dessinées de la longueur suivent ('+dL.b.x+')');
  A(Math.abs(M('dP')-5)<1e-6,'après : coin → centre du trou suit (5) : '+M('dP'));
  A(Math.abs(M('dK')-Math.hypot(5,10))<1e-6,'après : cote par points (oblique) suit : '+M('dK'));
  // l'index des entités change (arêtes renumérotées) : le suivi passe par la forme, pas l'index
  const g2=geo(12);g2.els.reverse();
  T.setViewGeo(v,g2);
  A(Math.abs(M('dW')-12)<1e-6,'arêtes renumérotées, largeur 12 : '+M('dW'));
  A(Math.abs(M('dD')-6)<1e-6,'Ø 6 toujours trouvé après renumérotation');
  // maillage d'ouverture (non exact) : rien ne bouge
  T.setViewGeo(v,{src:'mesh',els:geo(30).els});
  A(Math.abs(M('dW')-12)<1e-6,'géométrie de maillage : pas de re-ancrage ('+M('dW')+')');
  return r;
})()`,ctx);
console.log('=== PLAN : les cotes suivent la géométrie après une modification 3D ===');
out.log.forEach(m=>console.log('  ✓ '+m));
out.fails.forEach(m=>{ko++;console.log('  ✗ '+m);});
console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
process.exit(ko?1:0);
