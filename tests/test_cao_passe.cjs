// V0.11.27 : passe CAO — zoom vers la souris, axe de symétrie, « jusqu'à la face ».
const vm=require('vm');const {loadApp}=require('./appvm.cjs');
let ko=0;const A=(c,m)=>{if(!c){ko++;console.log('  x '+m);}else console.log('  ✓ '+m);};
const {ctx}=loadApp();
const r=vm.runInContext(`(function(){const o={};
  // 1) zoom : homothétie centrée sur le point visé — caméra ET cible glissent sur leur droite vers
  //    lui, d'un même facteur : la direction de visée est gardée, le point reste sous le curseur
  try{
    const saveC=camera,saveT=controls&&controls.target;
    camera={position:new THREE.Vector3(110,-90,90)};if(!controls)controls={};controls.target=new THREE.Vector3(20,15,10);
    const P=new THREE.Vector3(35,5,20),c0=camera.position.clone().sub(P),t0=controls.target.clone().sub(P);
    orbitZoomApply(-0.5,P);
    const k=Math.exp(-0.5),c1=camera.position.clone().sub(P),t1=controls.target.clone().sub(P);
    o.zoomFix=Math.max(c1.clone().sub(c0.clone().multiplyScalar(k)).length(),t1.clone().sub(t0.clone().multiplyScalar(k)).length());
    orbitZoomApply(-50,P);o.zoomMin=camera.position.distanceTo(P);
    camera=saveC;if(saveT)controls.target=saveT;
  }catch(e){o.zoomErr=String(e&&e.message||e);}
  // 2) symétrie : l'axe est la ligne de construction, même cliquée en premier
  const sk={id:'s',name:'s',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],
    points:{a:{x:-5,y:0},b:{x:-5,y:10},c:{x:6,y:0},d:{x:6,y:10},m:{x:0,y:-2},n:{x:0,y:12}},
    entities:[{id:'g',t:'line',p1:'a',p2:'b'},{id:'h',t:'line',p1:'c',p2:'d'},{id:'ax',t:'line',p1:'m',p2:'n',construction:true}],
    constraints:[],dims:[],seq:50};
  doc.sketches=[sk];skEdit=sk;
  skSel={kind:'ent',id:'ax'};skSelX=[{kind:'ent',id:'g'},{kind:'ent',id:'h'}];applyCon('symmetric');
  o.sym=sk.constraints.filter(c=>c.type==='symmetric');
  // 3) jusqu'à la face : nom « → face » quand une face a été cliquée, cible = fonction antérieure du corps
  const f0={id:'E1',type:'extrude',sketchId:'s',distance:20,op:'add',visible:true,body:'b1'};
  const f1={id:'E2',type:'extrude',sketchId:'s',distance:5,op:'add',visible:true,body:'b1',upto:{ex:'E1',side:1,faceProps:{center:{x:0,y:0,z:20},normal:{x:0,y:0,z:1},area:1}}};
  doc.features=[f0,f1];
  o.name=extName(f1);o.tgt=(extUptoTarget(f1,'b1')||{}).id;o.tgt0=extUptoTarget(f0,'b1');
  return o;})()`,ctx);
A(!r.zoomErr,'zoom : pas d’erreur'+(r.zoomErr?' ('+r.zoomErr+')':''));
A(r.zoomFix<1e-9,'zoom : caméra et cible rapprochées du point visé d’un même facteur (écart '+(r.zoomFix||0).toExponential(1)+')');
A(Math.abs(r.zoomMin-0.5)<1e-9,'zoom : butée à 0,5 mm du point visé');
A(r.sym.length===1&&r.sym[0].mid==='ax'&&[r.sym[0].a,r.sym[0].b].sort().join()==='g,h','symétrie : axe = ligne de construction cliquée EN PREMIER');
A(/→ face$/.test(r.name),'jusqu’à la face : nom « → face » ('+r.name+')');
A(r.tgt==='E1'&&r.tgt0===null,'jusqu’à la face : cible = fonction antérieure du corps, aucune pour la 1re');
console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');process.exit(ko?1:0);
