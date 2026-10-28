// 2026-10-28 : PLAN, cote d'angle — le texte est collé à l'arc, du côté extérieur (au-dessus en haut,
// en dessous en bas, à côté sur les flancs), centré ; il glisse le long de l'arc et revient au centre
// (aimant de 3 mm). Valeurs attendues calculées à la main. Vue à (100,100), échelle 1, sommet (0,0).
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
  // haut : 2 droites partant du sommet vers le haut (y papier vers le bas) → milieu de l'arc à -90°
  // bas : les mêmes vers le bas → +90° ; droite : horizontale et 45° vers le haut → -22,5°
  T.setViewGeo(v,{src:'dxf',els:[
    {t:'L',x1:0,y1:0,x2:-10,y2:-20},{t:'L',x1:0,y1:0,x2:10,y2:-20},
    {t:'L',x1:0,y1:0,x2:-10,y2:20},{t:'L',x1:0,y1:0,x2:10,y2:20},
    {t:'L',x1:0,y1:0,x2:20,y2:0},{t:'L',x1:0,y1:0,x2:14,y2:-14}]});
  T.st().zoom=1;
  const ang=(i,j)=>({id:'a'+i,kind:'ang',vid:v.id,vid2:v.id,a:{x:0,y:0,hint:{t:'seg',i}},b:{x:0,y:0,hint:{t:'seg',i:j}},off:14,tol:null});
  const up=ang(0,1),dn=ang(2,3),sd=ang(4,5);
  sh.dims.push(up,dn,sd);
  const H=3.5,R=14,GAP=1.2;
  // 1. au-dessus
  const pu=T.angTextPos(up);
  A(pu&&Math.abs(pu.x-100)<1e-6,'haut : texte centré sur le sommet en x ('+(pu&&pu.x)+')');
  A(pu&&Math.abs(pu.y-(100-R-GAP-H/2))<1e-6,'haut : boîte posée sur l’arc, 1,2 mm au-dessus ('+(pu&&pu.y)+')');
  A(pu&&pu.by>pu.y&&pu.by<100-R,'haut : ligne de base sous le centre, au-dessus de l’arc');
  // 2. en dessous
  const pd=T.angTextPos(dn);
  A(pd&&Math.abs(pd.x-100)<1e-6&&Math.abs(pd.y-(100+R+GAP+H/2))<1e-6,'bas : boîte sous l’arc, 1,2 mm ('+(pd&&pd.y)+')');
  // 3. sur le flanc : la boîte touche l'arc (fonction d'appui = r + 1,2) et reste extérieure
  const ps=T.angTextPos(sd),t=-Math.PI/8,nx=Math.cos(t),ny=Math.sin(t);
  const supp=(ps.x-100)*nx+(ps.y-100)*ny-Math.abs(nx)*ps.hw-Math.abs(ny)*ps.hh;
  A(Math.abs(supp-(R+GAP))<1e-6,'flanc : boîte à 1,2 mm de l’arc dans la direction du milieu ('+supp.toFixed(4)+')');
  A(ps.x-ps.hw>100+R*Math.cos(t)-1e-6,'flanc : texte à droite de l’arc');
  // 4. glisser le texte le long de l'arc
  const g=T.angGeom(up),O=g.O,at=a=>({x:O.x+(R+3)*Math.cos(a),y:O.y+(R+3)*Math.sin(a)});
  const a0=g.a1+g.dd/2,pk={labelHit:true,sx:at(a0).x,sy:at(a0).y,txtOff0:0};
  T.dimMoveTo(up,at(a0+2/R),pk);
  A(!up.txtOff,'2 mm le long de l’arc : aimanté au centre');
  T.dimMoveTo(up,at(a0+10/R),pk);
  A(Math.abs(up.txtOff-10)<1e-3,'10 mm le long de l’arc : décalé de 10 ('+up.txtOff+')');
  const pm=T.angTextPos(up);
  A(pm.x>100+1,'décalé : le texte suit l’arc vers la droite ('+pm.x.toFixed(2)+')');
  A(up.off===14,'glisser le texte ne change pas le rayon de l’arc');
  const pk2={labelHit:true,sx:at(a0+10/R).x,sy:at(a0+10/R).y,txtOff0:up.txtOff};
  T.dimMoveTo(up,at(a0+1/R),pk2);
  A(!up.txtOff,'ramené près du milieu : recentré automatiquement');
  // 5. hors des flèches : l'arc est prolongé jusqu'au texte
  up.txtOff=-20;
  const lines=[];T.drawDim((tag,a)=>{if(tag==='line')lines.push(a);return{appendChild(){},setAttribute(){},textContent:''};},up);
  A(lines.some(p=>Math.abs(Math.hypot(p.x2-O.x,p.y2-O.y)-R)<1e-6&&Math.abs(Math.hypot(p.x1-O.x,p.y1-O.y)-R)<1e-6),'texte hors de l’arc : prolongement d’arc tracé');
  return r;
})()`,ctx);
console.log('=== PLAN : texte des cotes d’angle ===');
out.log.forEach(m=>console.log('  ✓ '+m));
out.fails.forEach(m=>{ko++;console.log('  ✗ '+m);});
console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
process.exit(ko?1:0);
