// 2026-10-26 : couleur « entièrement contrainte » — un arc / cercle FIXÉ ne laisse plus de DDL fantôme.
// Symptôme (Cavité Test, Esquisse 3) : « mon esquisse 3 devrait être toute blanche ». Cause :
// skJacobian (analyse de rang des couleurs) prenait TOUS les rayons comme inconnues, y compris
// celui d'un arc projeté portant « Fixe » (constant pour le solveur) : aucune équation ne le
// tenait → 1 DDL, l'arc, le point sur cercle et la tangente restaient bleus.
// Données : l'Esquisse 3 telle qu'enregistrée (arc projeté R10 fixe, droite projetée fixe,
// quadrilatère : point sur l'arc, tangence, ⟂, ∥, entraxe 1, distances 1 et 2).
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
const {ctx,sandbox}=loadApp();
sandbox.__sk={"points":{"O":{"x":0,"y":0},"p1":{"x":20.89495372687144,"y":18.411809548974787},"p3":{"x":23.999999999961695,"y":30},"p6":{"x":11.235695463980756,"y":21},"p8":{"x":11.235695463980758,"y":11.000000000000002},"p14":{"x":12.234444681752688,"y":11.049999999999573},"p15":{"x":23.464101615099448,"y":28},"p34":{"x":24.43002744138866,"y":27.74118095489744},"p36":{"x":20.171111730727,"y":11.846691137554823}},"entities":[{"id":"e5","t":"line","p1":"p1","p2":"p3","construction":true,"proj":true},{"id":"e12","t":"arc","pc":"p6","pa":"p8","pb":"p1","r":10,"construction":true,"proj":true},{"id":"e16","t":"line","p1":"p14","p2":"p15"},{"id":"e35","t":"line","p1":"p15","p2":"p34"},{"id":"e37","t":"line","p1":"p34","p2":"p36"},{"id":"e38","t":"line","p1":"p36","p2":"p14"}],"constraints":[{"id":"e2","type":"fix","p":"p1"},{"id":"e4","type":"fix","p":"p3"},{"id":"e7","type":"fix","p":"p6"},{"id":"e9","type":"fix","p":"p8"},{"id":"e13","type":"fix","ent":"e12"},{"id":"e17","type":"oncircle","p":"p14","ent":"e12"},{"id":"e18","type":"online","p":"p15","line":"e5"},{"id":"e39","type":"tangent","line":"e38","ent":"e12"},{"id":"e40","type":"perpendicular","a":"e35","b":"e37"},{"id":"e42","type":"parallel","a":"e5","b":"e37"}],"dims":[{"id":"e43","type":"gap","value":1,"a":"e37","b":"e5"},{"id":"e44","type":"distance","value":1,"a":"p14","b":"p8"},{"id":"e45","type":"distance","value":2,"a":"p15","b":"p3"}]};
const r=vm.runInContext(`(function(){
  const fails=[],log=[];const A=(c,m)=>{if(!c)fails.push(m);else log.push(m);};
  const sk=Object.assign({id:'s3',name:'Esquisse 3',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],seq:60,visible:true},JSON.parse(JSON.stringify(__sk)));
  doc.sketches=[sk];doc.features=[];
  const D=skDofInfo(sk);
  A(D.dof===0,'Esquisse 3 : 0 degré de liberté (avant : 1, le rayon de l arc fixe) — dof='+D.dof);
  const bleues=sk.entities.filter(e=>!D.entFull(e)).map(e=>e.id);
  A(!bleues.length,'toutes les entités sont blanches (entièrement déterminées) — bleues : '+(bleues.join(',')||'aucune'));
  // sans « Fixe » sur l'arc, son rayon redevient libre : la règle ne masque pas un vrai DDL
  const sk2=JSON.parse(JSON.stringify(sk));sk2.id='s3b';sk2.constraints=sk2.constraints.filter(c=>c.ent!=='e12');
  const D2=skDofInfo(sk2);
  A(D2.dof>=1,'contre-épreuve : sans « Fixe » sur l arc, son rayon redevient une inconnue (dof='+D2.dof+')');
  // une cote de rayon sur un cercle NON fixé reste pilotante (pas passée en référence)
  const sk3={id:'s4',name:'C',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],seq:9,visible:true,
    points:{O:{x:0,y:0},c:{x:0,y:0}},entities:[{id:'k',t:'circle',pc:'c',r:5}],constraints:[{id:'f',type:'coincident',a:'c',b:'O'}],dims:[{id:'d',type:'radius',ent:'k',value:5}]};
  skCheckNewDims(sk3);
  A(!sk3.dims[0].ref&&skDofInfo(sk3).dof===0,'cercle coté R5 centré à l origine : cote pilotante, 0 DDL');
  return {fails,log};
})()`,ctx);
console.log('=== DDL : arc / cercle fixé ===');
r.log.forEach(m=>console.log('  ✓ '+m));r.fails.forEach(m=>console.log('  ✗ '+m));
console.log(r.fails.length?'\n*** '+r.fails.length+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
process.exit(r.fails.length?1:0);
