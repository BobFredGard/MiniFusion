// V0.11.24 : inférences ∥ et prolongement au tracé de ligne, contrainte posée au lâcher d'un point glissé
// (comparatif SolidCraft, 2e tranche : glisser et inférence). Souris simulée, DOM / THREE stubbés, sans OCCT.
// Contrôles :
//  A. ligne inclinée (10,10)→(40,30) ; nouvelle ligne depuis (10,40) vers une direction à ~1° de la sienne :
//     guide ∥ (skInfer.par), le curseur est projeté sur la direction, le clic pose la contrainte parallèle ;
//  B. nouvelle ligne depuis (60,60) vers un point à 1 px de la DROITE de la ligne inclinée, au-delà de son bout :
//     guide ⟶ (skInfer.ext), le point d'arrivée est posé sur la droite et contraint « point sur ligne » ;
//  C. aucune inférence ∥ pour une ligne qui part du même point (ce serait colinéaire), ni pour une ligne H / V ;
//  D. glisser l'extrémité d'une 2e ligne sur l'extrémité de la 1re → coïncident ; sur son milieu → milieu ;
//     sur son intérieur → point sur ligne ; sur un cercle → point sur cercle ; lâché dans le vide → rien ;
//  E. l'autre bout de la ligne glissée n'est jamais une accroche (pas d'écrasement).
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
function inVm(){
  const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};
  const sec=(nm,fn)=>{try{fn();}catch(e){out.fails.push(nm+' : exception '+(e&&e.message)+' @ '+String(e&&e.stack).split('\n')[1]);}};
  confirm=function(){return true;};alert=function(){};prompt=function(){return null;};
  const C=(wx,wy)=>{const r=svg.getBoundingClientRect();const p=w2s(wx,wy);return [r.left+p[0],r.top+p[1]];};
  const ev=(t,x,y,ex)=>{const r=Object.assign({type:t,button:0,buttons:0,shiftKey:false,ctrlKey:false,altKey:false,metaKey:false,detail:1,pointerId:1,preventDefault(){},stopPropagation(){}},ex||{});r.clientX=x;r.clientY=y;return r;};
  const pmove=(x,y,ex)=>{const p=C(x,y);svg.dispatchEvent(ev('pointermove',p[0],p[1],Object.assign({buttons:0},ex||{})));};
  const pdown=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev('pointerdown',p[0],p[1],{button:0,buttons:1}));};
  const pup=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev('pointerup',p[0],p[1]));};
  const click=(x,y)=>{pmove(x,y);pdown(x,y);pup(x,y);};
  const near=(a,b,t)=>Math.abs(a-b)<(t||1e-6);
  const mk=(extra)=>{const sk={id:'s1',name:'S',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{a:{x:10,y:10},b:{x:40,y:30}},entities:[{id:'L',t:'line',p1:'a',p2:'b'}],constraints:[],dims:[],seq:20,visible:true};
    if(extra)extra(sk);doc.sketches=[sk];doc.features=[];openSketch('s1');try{$('skSnap').checked=false;}catch(e){}skTool='line';return skEdit;};
  const px=()=>1/skView.s;
  const lastLine=sk=>sk.entities.filter(e=>e.t==='line').slice(-1)[0];
  // A. parallèle
  sec('A',()=>{
    const sk=mk();
    click(10,40); // 1er point armé
    const ang=Math.atan2(20,30)+1*Math.PI/180,L=30; // à 1° de la direction de L
    pmove(10+L*Math.cos(ang),40+L*Math.sin(ang));
    A(!!skInfer&&skInfer.par==='L'&&!skInfer.perp&&!skInfer.h&&!skInfer.v,'A. guide ∥ sur L à 1° ('+JSON.stringify(skInfer)+')');
    const d=skDraft;const cr=Math.abs((d.x2-d.x1)*20-(d.y2-d.y1)*30)/Math.hypot(30,20);
    A(d&&near(cr,0,1e-6),'A. brouillon projeté sur la direction de L (écart '+cr.toFixed(6)+')');
    pdown(d.x2,d.y2);pup(d.x2,d.y2);
    const nl=lastLine(sk);
    A(nl&&nl.id!=='L'&&sk.constraints.some(c=>c.type==='parallel'&&((c.a===nl.id&&c.b==='L')||(c.a==='L'&&c.b===nl.id))),'A. clic : contrainte parallèle posée entre la nouvelle ligne et L');
    const P=sk.points,ux=P[nl.p2].x-P[nl.p1].x,uy=P[nl.p2].y-P[nl.p1].y;
    A(near(Math.abs(ux*20-uy*30)/Math.hypot(ux,uy)/Math.hypot(30,20),0,1e-6),'A. résolu : la nouvelle ligne est exactement parallèle');
    skCancelDraft();
  });
  // B. prolongement
  sec('B',()=>{
    const sk=mk();
    click(60,60);
    const t=1.6,ex=10+30*t,ey=10+20*t; // sur la droite de L, au-delà de b
    const nx=-20/Math.hypot(30,20),ny=30/Math.hypot(30,20); // normale
    pmove(ex+nx*1*px(),ey+ny*1*px()); // à 1 px de la droite
    A(!!skInfer&&skInfer.ext==='L'&&skInfer.from&&near(skInfer.from.x,40)&&near(skInfer.from.y,30),'B. guide ⟶ depuis le bout b de L ('+JSON.stringify(skInfer&&{ext:skInfer.ext,x:+skInfer.x.toFixed(3),y:+skInfer.y.toFixed(3)})+')');
    const d=skDraft;A(d&&near(d.x2,ex,1e-6)&&near(d.y2,ey,1e-6),'B. point d\'arrivée posé sur la droite ('+d.x2.toFixed(3)+', '+d.y2.toFixed(3)+')');
    pdown(d.x2,d.y2);pup(d.x2,d.y2);
    const nl=lastLine(sk);
    A(nl&&sk.constraints.some(c=>c.type==='online'&&c.p===nl.p2&&c.line==='L'),'B. clic : extrémité contrainte « point sur la ligne » L (pied hors du segment)');
    A(!sk.constraints.some(c=>c.type==='parallel'),'B. pas de parallèle en plus (le prolongement suffit)');
    skCancelDraft();
  });
  // C. pas de ∥ depuis le même point ni sur une ligne H
  sec('C',()=>{
    let sk=mk();
    click(10,10); // part de a, extrémité de L
    const ang=Math.atan2(20,30)+Math.PI; // vers l'arrière, dans l'axe de L à 0°
    pmove(10+20*Math.cos(ang+0.01),10+20*Math.sin(ang+0.01));
    A(!(skInfer&&(skInfer.par||skInfer.ext)),'C. ligne partant du même point que L : ni ∥ ni prolongement ('+JSON.stringify(skInfer)+')');
    skCancelDraft();
    sk=mk(s=>{s.points.b={x:40,y:10};}); // L horizontale
    click(10,40);pmove(40,40.2);
    A(!!skInfer&&skInfer.h&&!skInfer.par,'C. ligne H : guide H, pas de ∥ ('+JSON.stringify(skInfer)+')');
    skCancelDraft();
  });
  // D. lâcher d'un point glissé
  sec('D',()=>{
    const sk=mk(s=>{s.points.c={x:60,y:60};s.points.d={x:80,y:70};s.entities.push({id:'M',t:'line',p1:'c',p2:'d'});
      s.points.o={x:20,y:70};s.entities.push({id:'K',t:'circle',pc:'o',r:8});});
    skTool='select';
    const drag=(from,to)=>{pdown(from.x,from.y);pmove(to.x,to.y,{buttons:1});pup(to.x,to.y);};
    const n0=sk.constraints.length;
    drag({x:60,y:60},{x:40.3,y:30.2});
    const c1=sk.constraints.find(c=>c.type==='coincident'&&((c.a==='c'&&c.b==='b')||(c.a==='b'&&c.b==='c')));
    A(!!c1&&near(sk.points.c.x,40)&&near(sk.points.c.y,30),'D. lâché sur l\'extrémité b : coïncident posé, point c en (40,30)');
    sk.constraints=sk.constraints.filter(c=>c!==c1);sk.points.c={x:60,y:60};solveSketch(sk);drawSketch2D();
    drag({x:60,y:60},{x:25.3,y:20.1});
    const c2=sk.constraints.find(c=>c.type==='midpoint'&&c.p==='c'&&c.line==='L');
    A(!!c2&&near(sk.points.c.x,25,1e-6)&&near(sk.points.c.y,20,1e-6),'D. lâché sur le milieu de L : contrainte milieu, c en (25,20)');
    sk.constraints=sk.constraints.filter(c=>c!==c2);sk.points.c={x:60,y:60};solveSketch(sk);drawSketch2D();
    const nx=-20/Math.hypot(30,20),ny=30/Math.hypot(30,20);
    drag({x:60,y:60},{x:19+nx*0.5*px(),y:16+ny*0.5*px()}); // intérieur de L (t = 0,3), à ½ px
    const c3=sk.constraints.find(c=>c.type==='online'&&c.p==='c'&&c.line==='L');
    const dL=Math.abs((sk.points.c.x-10)*(-20)+(sk.points.c.y-10)*30)/Math.hypot(30,20);
    A(!!c3&&dL<1e-6,'D. lâché sur L : point sur la ligne (écart '+dL.toExponential(1)+')');
    sk.constraints=sk.constraints.filter(c=>c!==c3);sk.points.c={x:60,y:60};solveSketch(sk);drawSketch2D();
    drag({x:60,y:60},{x:20+8.3,y:70.2}); // bord du cercle K
    const c4=sk.constraints.find(c=>c.type==='oncircle'&&c.p==='c'&&c.ent==='K');
    A(!!c4&&near(Math.hypot(sk.points.c.x-20,sk.points.c.y-70),8,1e-6),'D. lâché sur le cercle : point sur le cercle (rayon '+Math.hypot(sk.points.c.x-20,sk.points.c.y-70).toFixed(4)+')');
    sk.constraints=sk.constraints.filter(c=>c!==c4);sk.points.c={x:60,y:60};solveSketch(sk);drawSketch2D();
    drag({x:60,y:60},{x:55,y:45});
    A(sk.constraints.length===n0&&near(sk.points.c.x,55)&&near(sk.points.c.y,45),'D. lâché dans le vide : aucune contrainte, point en (55,45)');
  });
  // E. jamais l'autre bout de sa propre ligne
  sec('E',()=>{
    const sk=mk(s=>{s.points.c={x:60,y:60};s.points.d={x:80,y:70};s.entities.push({id:'M',t:'line',p1:'c',p2:'d'});});
    skTool='select';
    pdown(60,60);pmove(80.2,70.1,{buttons:1});
    A(!skDragSnap||skDragSnap.pid!=='d','E. pendant le glisser de c : d (autre bout de M) n\'est pas une accroche ('+JSON.stringify(skDragSnap)+')');
    pup(80.2,70.1);
    A(!sk.constraints.some(c=>c.type==='coincident')&&Math.hypot(sk.points.d.x-sk.points.c.x,sk.points.d.y-sk.points.c.y)>0.1,'E. lâché près de d : pas de coïncidence, la ligne M n\'est pas écrasée');
  });
  closeSketch(false);
  return out;
}
const {ctx}=loadApp();
const out=vm.runInContext('('+inVm.toString()+')()',ctx,{filename:'test_esquisse_inference_glisser.js'});
console.log('=== Esquisse : inférences ∥ / prolongement au tracé, contrainte au lâcher d’un point glissé ===');
out.log.forEach(m=>console.log('  ✓ '+m));
out.fails.forEach(m=>console.log('  ✗ '+m));
console.log(out.fails.length?'\n*** '+out.fails.length+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
process.exit(out.fails.length?1:0);
