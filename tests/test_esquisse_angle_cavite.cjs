// V0.7.1 : « impossible de coter un angle comme il faut » — Cavité Usinage, esquisse 11 (face).
// La poche a un flanc vertical e47 (15 mm, centré), un épaulement : e50 en biais jusqu'au flanc
// vertical e51, 6 mm plus loin (entraxe e172), raccordés par des congés R8 ; e51 monte jusqu'au
// congé R8 du coin (y = 24). Cote d'angle e236 entre e50 et e51.
// Géométrie (calcul à la main) : pour un angle θ, la pente monte de 6/tan θ et le congé prend
// 8·tan(θ/2) sur e51, d'où  longueur(e51) = (y_haut − y_bas) − 6/tan θ − 8·tan(θ/2).
// Avec 24 − 7,5 = 16,5 mm de hauteur : 20° donne −1,39 mm → IMPOSSIBLE ; la limite est ≈ 21,6°.
// V0.7.0 : la cote de 20° restait fausse de ~19° (résidu en radians, sans poids) sans le dire ;
// les angles possibles de 22° à 24° n'étaient pas atteints (120 itérations, système mal
// conditionné). V0.7.1 : résidu d'angle en mm au bout du plus long côté, prolongation de
// l'itération (8× / 400 ms), échec = retour arrière.
// Contrôles : 24° et 30° résolus, avec la longueur de e51 calculée à la main (±0,02 mm) ;
// 20° refusé, esquisse intacte, raison affichée. Harnais : DOM/THREE stubbé, sans OCCT.
const vm=require('vm'),fs=require('fs'),path=require('path');
const {loadApp}=require('./appvm.cjs');
const FIX=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','cavite_esquisse11.json'),'utf8'));
function inVm(){
  const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);};const f=n=>(+n).toFixed(3);
  confirm=function(){return true;};alert=function(){};skTool='select';
  const open=()=>{const sk=JSON.parse(JSON.stringify(__FIX.sketch));ensureSketchBasis(sk);doc.sketches=[sk];doc.features=[];openSketch(sk.id);return skEdit;};
  const len=(sk,id)=>{const l=entById(sk,id),P=sk.points;return Math.hypot(P[l.p2].x-P[l.p1].x,P[l.p2].y-P[l.p1].y);};
  const expect=(sk,deg)=>{const t=deg*Math.PI/180,P=sk.points,top=Math.max(P.p153.y,P.p74.y),bot=P.p46.y;return (top-bot)-6/Math.tan(t)-8*Math.tan(t/2);};
  const coords=sk=>JSON.stringify(Object.keys(sk.points).sort().map(k=>[k,sk.points[k].x,sk.points[k].y]));
  // départ : la cote du fichier (20°) est en défaut
  let sk=open();
  out.log.push('fichier : résidu '+f(skResid(sk))+' — '+skWorstViol(sk));
  // 24° et 30° : possibles → résolus, à la longueur calculée
  [24,30].forEach(deg=>{
    sk=open();skPushUndo();sk.dims.find(d=>d.id==='e236').value=deg*Math.PI/180;
    const t0=Date.now(),ok=skSolveOrRevert(sk,'Cote'),ms=Date.now()-t0;sk=skEdit;
    const L=len(sk,'e51'),E=expect(sk,deg);
    out.log.push(deg+'° : '+(ok?'acceptée':'refusée')+' en '+ms+' ms · e51 '+f(L)+' mm (à la main '+f(E)+') · résidu '+f(skResid(sk)));
    A(ok&&skResid(sk)<=1e-3,deg+'° : résolue — résidu '+f(skResid(sk))+(ok?'':' (refusée : '+skMsg+')'));
    A(Math.abs(L-E)<0.02,deg+'° : longueur de e51 '+f(L)+' ≠ calcul à la main '+f(E));
  });
  // 20° : impossible → refusée, esquisse intacte, raison affichée
  sk=open();sk.dims.find(d=>d.id==='e236').value=30*Math.PI/180;solveSketch(sk);
  A(skResid(sk)<=1e-3,'20° : préparation à 30° résolue');
  const c0=coords(sk);skPushUndo();sk.dims.find(d=>d.id==='e236').value=20*Math.PI/180;
  const ok20=skSolveOrRevert(sk,'Cote');sk=skEdit;
  out.log.push('20° : '+(ok20?'acceptée':'refusée')+' — '+skMsg);
  A(ok20===false,'20° : la cote impossible est refusée');
  A(coords(sk)===c0,'20° : l’esquisse reste exactement à 30°');
  A(Math.abs(sk.dims.find(d=>d.id==='e236').value-30*Math.PI/180)<1e-12,'20° : la cote revient à 30°');
  A(/⛔ Cote impossible/.test(skMsg)&&/angle/.test(skMsg),'20° : la raison nomme l’angle — « '+skMsg+' »');
  if(out.fails.length){out.log.push('');out.log.push('ECHECS ('+out.fails.length+') :');out.fails.forEach(m=>out.log.push('  x '+m));}
  else out.log.push('TOUT EST CONFORME');
  return out.log.join('\n');
}
(async()=>{
  const {ctx}=loadApp();ctx.__FIX=FIX;
  const r=vm.runInContext('('+inVm.toString()+')()',ctx,{filename:'test_esquisse_angle_cavite.js'});
  console.log('=== cote d’angle de la Cavité (esquisse 11) ===');
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,3000));process.exit(1);});
