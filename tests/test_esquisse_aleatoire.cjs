// V0.7.1 : suites ALÉATOIRES d'édition d'esquisse (idée SolidCraft, sketch_fuzz_tests).
// Générateur déterministe (xorshift) : chaque graine rejoue la même suite. Opérations : ajouter
// une cote, modifier une cote, ajouter une contrainte (H, V, ∥, ⟂, =), supprimer une cote ou
// une contrainte, glisser un point (1 à 3 mouvements de souris rapides), annuler.
// Invariants après CHAQUE opération :
//  - aucune exception, tous les points et rayons finis ;
//  - une cote / contrainte ajoutée ou modifiée sur une esquisse résolue : soit l'esquisse est
//    résolue, soit la modification est refusée et les coordonnées sont EXACTEMENT celles d'avant ;
//  - pendant un glisser d'une esquisse résolue, l'esquisse affichée reste résolue ;
// et à la fin : l'esquisse survit à un aller-retour JSON (rouverte et résolue, elle ne bouge pas).
// Harnais : DOM/THREE stubbé, aucun noyau OCCT requis.
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
const SEEDS=(process.env.SEEDS||'1,2,3,5,8,11,23,37,41,59,73,97').split(',').map(Number),OPS=+(process.env.OPS||40);
function inVm(){
  const out={fails:[],log:[]};const f=n=>(+n).toFixed(3);
  confirm=function(){return true;};alert=function(){};skTool='select';
  const C=(wx,wy)=>{const r=svg.getBoundingClientRect();const p=w2s(wx,wy);return [r.left+p[0],r.top+p[1]];};
  const ev=(t,x,y,ex)=>{const r=Object.assign({type:t,button:0,buttons:0,shiftKey:false,ctrlKey:false,altKey:false,detail:1,pointerId:1,preventDefault(){},stopPropagation(){}},ex||{});r.clientX=x;r.clientY=y;return r;};
  const pdown=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev('pointerdown',p[0],p[1],{button:0,buttons:1,detail:1}));};
  const pmove=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev('pointermove',p[0],p[1],{buttons:1}));};
  const pup=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev('pointerup',p[0],p[1],{button:0,buttons:0}));};
  const coords=sk=>JSON.stringify(Object.keys(sk.points).sort().map(k=>[k,sk.points[k].x,sk.points[k].y]));
  const finite=sk=>Object.values(sk.points).every(p=>isFinite(p.x)&&isFinite(p.y))&&(sk.entities||[]).every(e=>!(e.t==='circle'||e.t==='arc')||isFinite(e.r));
  const lineLenOf=(sk,l)=>{const A=sk.points[l.p1],B=sk.points[l.p2];return Math.hypot(B.x-A.x,B.y-A.y);};
  __SEEDS.forEach(seed=>{
    let s=seed>>>0||1;const rnd=()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};
    const pick=a=>a[Math.floor(rnd()*a.length)];
    // polygone fermé de 4 à 6 côtés autour de (30,20), un sommet sur l'origine
    const n=4+Math.floor(rnd()*3),pts={O:{x:0,y:0}},ents=[];const ids=['O'];
    for(let i=1;i<n;i++){const a=Math.PI*2*i/n,r=20+rnd()*15;pts['q'+i]={x:+(25+r*Math.cos(a+Math.PI)+25).toFixed(3),y:+(r*Math.sin(a+Math.PI)+(rnd()-0.5)*6).toFixed(3)};ids.push('q'+i);}
    for(let i=0;i<n;i++)ents.push({id:'l'+i,t:'line',p1:ids[i],p2:ids[(i+1)%n]});
    pts.cc={x:30,y:5};ents.push({id:'c1',t:'circle',pc:'cc',r:4});
    const sk0={id:'kF'+seed,name:'F',plane:'XY',visible:true,seq:200,points:pts,entities:ents,constraints:[],dims:[],origin:[0,0,0]};
    ensureSketchBasis(sk0);doc.sketches=[sk0];doc.features=[];openSketch(sk0.id);solveSketch(sk0);
    let nid=0;const id=()=>'z'+(++nid);
    const fail=(op,m)=>out.fails.push('graine '+seed+' · '+op+' : '+m);
    const counts={};
    for(let k=0;k<__OPS;k++){
      const sk=skEdit,lines=sk.entities.filter(e=>e.t==='line'),r0=skResid(sk),c0=coords(sk);
      const op=pick(['dimAdd','dimAdd','dimEdit','dimEdit','con','con','del','drag','drag','drag','undo']);counts[op]=(counts[op]||0)+1;
      try{
        if(op==='dimAdd'||op==='dimEdit'||op==='con'){
          skPushUndo();
          if(op==='dimAdd'){const l=pick(lines);if(!sk.dims.some(d=>d.line===l.id))sk.dims.push({id:id(),type:'length',line:l.id,value:+(lineLenOf(sk,l)*(0.8+rnd()*0.4)).toFixed(3),orient:'a'});}
          else if(op==='dimEdit'){if(sk.dims.length){const d=pick(sk.dims);d.value=+(d.value*(0.5+rnd()*1.1)).toFixed(3);}}
          else{const t=pick(['h','v','parallel','perpendicular','equal']);const a=pick(lines),b=pick(lines);
            if(t==='h'||t==='v'){if(!sk.constraints.some(c=>(c.type==='h'||c.type==='v')&&c.line===a.id))sk.constraints.push({id:id(),type:t,line:a.id});}
            else if(a.id!==b.id)sk.constraints.push({id:id(),type:t,a:a.id,b:b.id});}
          const nU=skUndoStack.length;
          const ok=skSolveOrRevert(skEdit,op==='con'?'Contrainte':'Cote');
          const sk2=skEdit;
          if(!finite(sk2))fail(op,'coordonnées non finies');
          if(r0<=SK_OK_RES){
            if(ok&&skResid(sk2)>SK_OK_RES)fail(op,'acceptée mais non résolue — résidu '+f(skResid(sk2)));
            if(!ok&&coords(sk2)!==c0)fail(op,'refusée mais coordonnées modifiées');
            if(!ok&&skUndoStack.length!==nU-1)fail(op,'refusée mais étape d’annulation laissée');
          }
        }else if(op==='del'){
          skPushUndo();
          if(rnd()<0.5&&sk.dims.length){const d=pick(sk.dims);sk.dims=sk.dims.filter(x=>x!==d);}
          else if(sk.constraints.length){const c=pick(sk.constraints);sk.constraints=sk.constraints.filter(x=>x!==c);}
          solveSketch(sk);if(!finite(sk))fail(op,'coordonnées non finies');
        }else if(op==='drag'){
          const pid=pick(Object.keys(sk.points).filter(p=>p!=='O'));const p=sk.points[pid];
          pdown(p.x,p.y);
          if(skDrag===pid){const m=1+Math.floor(rnd()*3);let x=p.x,y=p.y;
            for(let i=0;i<m;i++){x+=(rnd()-0.5)*40;y+=(rnd()-0.5)*40;pmove(x,y);
              if(!finite(skEdit))fail(op,'glisser de '+pid+' : coordonnées non finies');
              if(r0<=SK_OK_RES&&skResid(skEdit)>SK_OK_RES)fail(op,'glisser de '+pid+' : esquisse affichée non résolue — résidu '+f(skResid(skEdit)));}
            pup(x,y);
          }else pup(p.x,p.y);
          if(!finite(skEdit))fail(op,'après glisser : coordonnées non finies');
        }else{skUndoTrans();if(!finite(skEdit))fail(op,'après annulation : coordonnées non finies');}
      }catch(e){fail(op,'exception '+String(e&&e.message||e).slice(0,160));}
    }
    // aller-retour JSON : rouverte et résolue, l'esquisse ne bouge pas
    const sk=skEdit,r=skResid(sk);
    const back=JSON.parse(JSON.stringify(sk));ensureSketchBasis(back);doc.sketches=[back];openSketch(back.id);solveSketch(back);
    let m=0;for(const k in sk.points){const a=sk.points[k],b=back.points[k];if(!b){m=Infinity;break;}m=Math.max(m,Math.hypot(a.x-b.x,a.y-b.y));}
    if(r<=1e-4&&m>1e-3)out.fails.push('graine '+seed+' : aller-retour JSON — l’esquisse rouverte bouge de '+f(m)+' mm');
    out.log.push('graine '+seed+' : '+__OPS+' opérations '+JSON.stringify(counts)+' · '+sk.dims.length+' cotes, '+sk.constraints.length+' contraintes, résidu final '+f(r));
  });
  if(out.fails.length){out.log.push('');out.log.push('ECHECS ('+out.fails.length+') :');out.fails.forEach(m=>out.log.push('  x '+m));}
  else out.log.push('TOUT EST CONFORME');
  return out.log.join('\n');
}
(async()=>{
  const {ctx}=loadApp();ctx.__SEEDS=SEEDS;ctx.__OPS=OPS;
  const r=vm.runInContext('('+inVm.toString()+')()',ctx,{filename:'test_esquisse_aleatoire.js'});
  console.log('=== suites aléatoires d’édition d’esquisse ===');
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,3000));process.exit(1);});
