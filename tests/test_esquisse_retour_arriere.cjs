// V0.7.1 : ÉCHEC = RETOUR ARRIÈRE.
// Avant : une cote impossible ou une contrainte en conflit laissait l'esquisse dans la « moins
// mauvaise » solution — déformée, souvent retournée, lignes rouges partout. Désormais
// (skSolveOrRevert) : si l'esquisse était résolue avant et ne l'est plus, la modification est
// annulée, l'esquisse revient EXACTEMENT à son état précédent et la barre d'état dit pourquoi.
// Une esquisse déjà en défaut n'est pas bloquée (on doit pouvoir la réparer pas à pas).
// Cas : triangle O-a-b, O-a horizontale de 30, a-b et b-O de 20.
//  A. cote b-O → 60 (inégalité triangulaire) : refusée, coordonnées et valeur intactes ;
//  B. contrainte H sur a-b (impossible) : refusée, contrainte non ajoutée ;
//  C. cote b-O → 25 : acceptée et résolue ; Ctrl+Z la défait ;
//  D. esquisse déjà en défaut : une modification n'est pas bloquée.
// Harnais : DOM/THREE stubbé, aucun noyau OCCT requis.
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
function inVm(){
  const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);};const f=n=>(+n).toFixed(4);
  confirm=function(){return true;};alert=function(){};skTool='select';
  const L=(id,p1,p2)=>({id,t:'line',p1,p2});
  const mount=()=>{const sk={id:'kRA',name:'K',plane:'XY',visible:true,seq:20,
    points:{O:{x:0,y:0},a:{x:30,y:0},b:{x:15,y:18}},
    entities:[L('l1','O','a'),L('l2','a','b'),L('l3','b','O')],
    constraints:[{id:'k1',type:'h',line:'l1'}],
    dims:[{id:'d1',type:'length',line:'l1',value:30,orient:'a'},{id:'d2',type:'length',line:'l2',value:20,orient:'a'},{id:'d3',type:'length',line:'l3',value:20,orient:'a'}],origin:[0,0,0]};
    ensureSketchBasis(sk);doc.sketches=[sk];doc.features=[];openSketch(sk.id);solveSketch(sk);return skEdit;};
  const coords=sk=>JSON.stringify(Object.keys(sk.points).sort().map(k=>[k,+sk.points[k].x.toFixed(9),+sk.points[k].y.toFixed(9)]));
  let sk=mount();
  A(skResid(sk)<=1e-4,'départ : triangle résolu — résidu '+f(skResid(sk)));
  const c0=coords(sk),nU=skUndoStack.length;
  // A. cote impossible
  skPushUndo();sk.dims.find(d=>d.id==='d3').value=60;
  const okA=skSolveOrRevert(sk,'Cote');sk=skEdit;
  out.log.push('A · '+skMsg);
  A(okA===false,'A1 : la cote 60 est refusée');
  A(coords(sk)===c0,'A2 : coordonnées EXACTEMENT celles d’avant');
  A(sk.dims.find(d=>d.id==='d3').value===20,'A3 : la cote revient à 20 — '+sk.dims.find(d=>d.id==='d3').value);
  A(/⛔/.test(skMsg)&&/Cote impossible/.test(skMsg),'A4 : la barre d’état explique — « '+skMsg+' »');
  A(skUndoStack.length===nU,'A5 : aucune étape d’annulation laissée par le refus — '+skUndoStack.length+' / '+nU);
  // B. contrainte en conflit, par la commande du panneau
  skSel={kind:'ent',id:'l2'};skSelX=[];const nC=sk.constraints.length;
  applyCon('h');sk=skEdit;
  out.log.push('B · '+skMsg);
  A(sk.constraints.length===nC,'B1 : la contrainte H impossible n’est pas ajoutée — '+sk.constraints.length+' / '+nC);
  A(coords(sk)===c0,'B2 : coordonnées intactes');
  A(/⛔/.test(skMsg)&&/Contrainte impossible/.test(skMsg),'B3 : la barre d’état explique — « '+skMsg+' »');
  // C. modification possible : acceptée, puis Ctrl+Z
  skPushUndo();sk.dims.find(d=>d.id==='d3').value=25;
  const okC=skSolveOrRevert(sk,'Cote');sk=skEdit;
  const P=sk.points,lb=Math.hypot(P.b.x,P.b.y);
  A(okC===true&&skResid(sk)<=1e-4&&Math.abs(lb-25)<1e-4,'C1 : cote 25 acceptée et résolue — |bO|='+f(lb)+' résidu '+f(skResid(sk)));
  skUndoTrans();sk=skEdit;
  A(coords(sk)===c0&&sk.dims.find(d=>d.id==='d3').value===20,'C2 : Ctrl+Z revient au triangle de départ');
  // D. esquisse déjà en défaut : pas bloquée
  sk.dims.find(d=>d.id==='d3').value=60;solveSketch(sk);
  A(skResid(sk)>SK_OK_RES,'D0 : esquisse mise en défaut (cote 60) — résidu '+f(skResid(sk)));
  skPushUndo();sk.dims.find(d=>d.id==='d2').value=21;
  const okD=skSolveOrRevert(sk,'Cote');sk=skEdit;
  A(okD===true&&sk.dims.find(d=>d.id==='d2').value===21,'D1 : la modification d’une esquisse déjà en défaut passe');
  if(out.fails.length){out.log.push('');out.log.push('ECHECS ('+out.fails.length+') :');out.fails.forEach(m=>out.log.push('  x '+m));}
  else out.log.push('TOUT EST CONFORME');
  return out.log.join('\n');
}
(async()=>{
  const {ctx}=loadApp();
  const r=vm.runInContext('('+inVm.toString()+')()',ctx,{filename:'test_esquisse_retour_arriere.js'});
  console.log('=== échec = retour arrière (cotes et contraintes) ===');
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,3000));process.exit(1);});
