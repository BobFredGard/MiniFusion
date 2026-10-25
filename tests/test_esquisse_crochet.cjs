// V0.7.1 : l'esquisse du Crochet ne décroche plus.
// Symptôme : « j'ai encore des moments où l'esquisse décroche ». Sur l'esquisse du Crochet
// (fixture copiée de Exemples/Crochet.miniFusion), V0.7.0 laissait un glisser rapide puis le
// retour avec une esquisse non résolue, une ligne retournée ou des points partis à des
// centaines de milliers de mm ; une cote d'angle modifiée restait à ~3° de sa valeur.
// Causes et correctifs :
//  - le point tiré sautait sous le curseur et une seule résolution suivait → glisser par
//    PETITS PAS, chacun depuis le dernier état résolu, avec garde de branche (skDragWalkTo) ;
//  - amortissement de Marquardt (diagonale de JᵀJ) → amortissement au MOINDRE DÉPLACEMENT ;
//  - résidu d'angle en radians face à des mm ×300 → résidu d'angle en mm.
// Contrôles : chaque cote ×0,7 / ×1,3 / ×1,8 puis rétablie, et des glissers rapides
// aller-retour de chaque point : l'esquisse reste résolue PENDANT et APRÈS, et revient
// exactement à son état de départ (esquisse entièrement contrainte : une seule solution
// proche). Harnais : DOM/THREE stubbé, aucun noyau OCCT requis.
const vm=require('vm'),fs=require('fs'),path=require('path');
const {loadApp}=require('./appvm.cjs');
const FIX=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','crochet_esquisses.json'),'utf8'));
function inVm(){
  const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);};const f=n=>(+n).toFixed(3);
  confirm=function(){return true;};skTool='select';
  const C=(wx,wy)=>{const r=svg.getBoundingClientRect();const p=w2s(wx,wy);return [r.left+p[0],r.top+p[1]];};
  const ev=(t,x,y,ex)=>{const r=Object.assign({type:t,button:0,buttons:0,shiftKey:false,ctrlKey:false,altKey:false,detail:1,pointerId:1,preventDefault(){},stopPropagation(){}},ex||{});r.clientX=x;r.clientY=y;return r;};
  const pdown=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev('pointerdown',p[0],p[1],{button:0,buttons:1,detail:1}));};
  const pmove=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev('pointermove',p[0],p[1],{buttons:1}));};
  const pup=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev('pointerup',p[0],p[1],{button:0,buttons:0}));};
  const coords=sk=>{const o={};for(const k in sk.points)o[k]={x:sk.points[k].x,y:sk.points[k].y};return o;};
  const dev=(sk,c0)=>{let m=0,w='';for(const k in c0){const p=sk.points[k];if(!p)continue;const d=Math.hypot(p.x-c0[k].x,p.y-c0[k].y);if(d>m){m=d;w=k;}}return [m,w];};
  __FIX.sketches.forEach((src,si)=>{
    const fresh=()=>{const sk=JSON.parse(JSON.stringify(src));ensureSketchBasis(sk);doc.sketches=[sk];doc.features=[];openSketch(sk.id);solveSketch(sk);return sk;};
    let sk=fresh();const c0=coords(sk);
    A(skResid(sk)<=1e-4,'esquisse '+si+' : résolue au départ — résidu '+f(skResid(sk)));
    let nd=0,ng=0;
    // 1. cotes modifiées puis rétablies
    (src.dims||[]).forEach(d0=>{if(d0.ref)return;[0.7,1.3,1.8].forEach(k=>{
      sk=fresh();const d=sk.dims.find(x=>x.id===d0.id);const v0=d.value;
      d.value=v0*k;solveSketch(sk);const r1=skResid(sk);d.value=v0;solveSketch(sk);const r2=skResid(sk);const [m,w]=dev(sk,c0);nd++;
      A(r1<=SK_OK_RES&&r2<=SK_OK_RES&&m<=1e-3,'esquisse '+si+' : cote '+d.id+' ('+d.type+') ×'+k+' puis rétablie — résidu '+f(r1)+' / '+f(r2)+', écart '+f(m)+' mm ('+w+')');
    });});
    // 2. glissers rapides aller-retour (un seul mouvement de souris à l'aller)
    Object.keys(c0).forEach(pid=>{if(pid==='O')return;[10,25].forEach(D=>{[[1,0],[0,1],[-0.7,0.7]].forEach(([ux,uy])=>{
      sk=fresh();const p=c0[pid];pdown(p.x,p.y);if(skDrag!==pid){pup(p.x,p.y);return;}
      pmove(p.x+ux*D,p.y+uy*D);const r1=skResid(sk);pmove(p.x,p.y);pup(p.x,p.y);const r2=skResid(sk);const [m,w]=dev(sk,c0);ng++;
      A(r1<=SK_OK_RES&&r2<=SK_OK_RES&&m<=0.05,'esquisse '+si+' : glisser '+pid+' de '+D+' mm ('+ux+','+uy+') puis retour — résidu pendant '+f(r1)+', après '+f(r2)+', écart '+f(m)+' mm ('+w+')');
    });});});
    out.log.push('esquisse '+si+' « '+src.name+' » : '+nd+' modifications de cote, '+ng+' glissers aller-retour');
  });
  if(out.fails.length){out.log.push('');out.log.push('ECHECS ('+out.fails.length+') :');out.fails.forEach(m=>out.log.push('  x '+m));}
  else out.log.push('TOUT EST CONFORME');
  return out.log.join('\n');
}
(async()=>{
  const {ctx}=loadApp();ctx.__FIX=FIX;
  const r=vm.runInContext('('+inVm.toString()+')()',ctx,{filename:'test_esquisse_crochet.js'});
  console.log('=== esquisse du Crochet : cotes et glissers sans décrochage ===');
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,3000));process.exit(1);});
