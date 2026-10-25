// V0.7.1 : une résolution déplace le reste de l'esquisse LE MOINS POSSIBLE.
// Avant : amortissement de Marquardt (diagonale de JᵀJ) — une inconnue que les résidus voient
// peu était bon marché à déplacer : un point tenu sur une ligne faisait pivoter l'autre bout
// de cette ligne au lieu de glisser. Correctif : amortissement λ·W au moindre déplacement,
// un point tenu sur une courbe coûtant SK_SLIDE_W fois moins (il glisse).
// Cas (repris de SolidCraft, least_motion_tests) : rectangle O-b-c-d dont le côté haut c-d est
// libre de pencher, séparateur vertical m1-m2 dont les bouts sont tenus sur le bas et le haut.
//  A. on monte le coin d : le haut penche autour de c, qui reste ; m2 glisse sur le haut ;
//  B. on descend le coin c : le haut tourne autour de d, qui reste ; m2 glisse.
// Les points tenus sur ligne (m1, m2) coûtent peu : ils absorbent le mouvement (ils peuvent
// glisser un peu de côté), les coins libres ne bougent presque pas (≤ 0,1 mm, V0.7.0 : 4,9 mm).
// Harnais : DOM/THREE stubbé, aucun noyau OCCT requis.
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
function inVm(){
  const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);};const f=n=>(+n).toFixed(3);
  confirm=function(){return true;};skTool='select';
  const C=(wx,wy)=>{const r=svg.getBoundingClientRect();const p=w2s(wx,wy);return [r.left+p[0],r.top+p[1]];};
  const ev=(t,x,y,ex)=>{const r=Object.assign({type:t,button:0,buttons:0,shiftKey:false,ctrlKey:false,altKey:false,detail:1,pointerId:1,preventDefault(){},stopPropagation(){}},ex||{});r.clientX=x;r.clientY=y;return r;};
  const pdown=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev('pointerdown',p[0],p[1],{button:0,buttons:1,detail:1}));};
  const pmove=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev('pointermove',p[0],p[1],{buttons:1}));};
  const pup=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev('pointerup',p[0],p[1],{button:0,buttons:0}));};
  const L=(id,p1,p2)=>({id,t:'line',p1,p2});
  const mount=()=>{const sk={id:'kLM',name:'K',plane:'XY',visible:true,seq:20,
    points:{O:{x:0,y:0},b:{x:40,y:0},c:{x:40,y:30},d:{x:0,y:30},m1:{x:20,y:0},m2:{x:20,y:30}},
    entities:[L('e1','O','b'),L('e2','b','c'),L('e3','c','d'),L('e4','d','O'),L('e5','m1','m2')],
    constraints:[{id:'k1',type:'h',line:'e1'},{id:'k2',type:'v',line:'e2'},{id:'k3',type:'v',line:'e4'},{id:'k4',type:'v',line:'e5'},
      {id:'k5',type:'online',p:'m1',line:'e1'},{id:'k6',type:'online',p:'m2',line:'e3'}],
    dims:[{id:'d1',type:'length',line:'e1',value:40,orient:'h'}],origin:[0,0,0]};
    ensureSketchBasis(sk);doc.sketches=[sk];doc.features=[];openSketch(sk.id);solveSketch(sk);return sk;};
  const onTop=sk=>{const P=sk.points,c=P.c,d=P.d,m=P.m2;return Math.abs((m.x-d.x)*(c.y-d.y)-(m.y-d.y)*(c.x-d.x))/Math.hypot(c.x-d.x,c.y-d.y);};
  // A. monter d
  let sk=mount();pdown(0,30);for(let i=1;i<=10;i++)pmove(0,30+i);
  const Pa=sk.points;
  out.log.push('A · d=('+f(Pa.d.x)+','+f(Pa.d.y)+') c=('+f(Pa.c.x)+','+f(Pa.c.y)+') m2=('+f(Pa.m2.x)+','+f(Pa.m2.y)+')');
  A(Math.abs(Pa.d.y-40)<1e-3,'A1 : le coin d suit la souris — d.y='+f(Pa.d.y));
  A(Math.hypot(Pa.c.x-40,Pa.c.y-30)<0.1,'A2 : le coin opposé c reste en place (V0.7.0 : 4,9 mm) — c=('+f(Pa.c.x)+','+f(Pa.c.y)+')');
  A(onTop(sk)<1e-3&&Math.abs(Pa.m2.y-35)<0.2,'A3 : m2 glisse sur le haut penché (y≈35) — m2.y='+f(Pa.m2.y)+', écart '+f(onTop(sk)));
  A(Math.abs(Pa.m1.y)<1e-3,'A4 : m1 reste sur le bas — m1.y='+f(Pa.m1.y));
  pup(0,40);A(skResid(sk)<=1e-4,'A5 : résolue après relâcher — résidu '+f(skResid(sk)));
  // B. descendre c
  sk=mount();pdown(40,30);for(let i=1;i<=10;i++)pmove(40,30-i);
  const Pb=sk.points;
  out.log.push('B · c=('+f(Pb.c.x)+','+f(Pb.c.y)+') d=('+f(Pb.d.x)+','+f(Pb.d.y)+') m2=('+f(Pb.m2.x)+','+f(Pb.m2.y)+')');
  A(Math.abs(Pb.c.y-20)<1e-3,'B1 : le coin c suit la souris — c.y='+f(Pb.c.y));
  A(Math.hypot(Pb.d.x,Pb.d.y-30)<0.1,'B2 : le coin d reste en place (V0.7.0 : 4,9 mm) — d=('+f(Pb.d.x)+','+f(Pb.d.y)+')');
  A(onTop(sk)<1e-3&&Math.abs(Pb.m2.y-25)<0.2,'B3 : m2 glisse sur le haut (y≈25) — m2.y='+f(Pb.m2.y));
  pup(40,20);A(skResid(sk)<=1e-4,'B4 : résolue après relâcher — résidu '+f(skResid(sk)));
  if(out.fails.length){out.log.push('');out.log.push('ECHECS ('+out.fails.length+') :');out.fails.forEach(m=>out.log.push('  x '+m));}
  else out.log.push('TOUT EST CONFORME');
  return out.log.join('\n');
}
(async()=>{
  const {ctx}=loadApp();
  const r=vm.runInContext('('+inVm.toString()+')()',ctx,{filename:'test_esquisse_moindre_deplacement.js'});
  console.log('=== moindre déplacement pendant un glisser ===');
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,3000));process.exit(1);});
