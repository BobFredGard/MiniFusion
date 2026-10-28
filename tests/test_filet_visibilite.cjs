// V0.15.11 : « quand je cache un corps avec des trous taraudés, je veux cacher aussi les filets
// spirales ». Deux corps (Bloc A, Bloc B), un perçage taraudé M8 cosmétique dans chacun, noyau
// OCCT réel. Contrôles : chaque filet porte le corps de sa fonction ; œil du corps A → filets de A
// cachés, ceux de B visibles ; œil rallumé → filets de A revenus ; maillage caché sans passer par
// l'œil (clic droit « Cacher », isoler, esquisse fantôme) → filets cachés à l'image suivante ;
// mise en plan : un corps caché ne donne plus de filet.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};confirm=function(){return true;};',ctx);
  const R=String.raw`
    const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};
    const rect=(id,x0)=>({id,name:id,plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],
      points:{a:{x:x0,y:0},b:{x:x0+40,y:0},c:{x:x0+40,y:40},d:{x:x0,y:40}},
      entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],constraints:[],dims:[],seq:20,visible:false});
    const pt=(id,x)=>({id,name:id,plane:'XY',origin:[0,0,20],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{h:{x,y:20}},
      entities:[{id:'e',t:'cpoint',p:'h',hole:true}],constraints:[],dims:[],seq:30,visible:false});
    docResetEmpty();
    doc.sketches=[rect('skA',0),rect('skB',60),pt('hA',20),pt('hB',80)];
    doc.bodies=[{id:'b1',name:'Bloc A',c:null},{id:'b2',name:'Bloc B',c:null}];doc.bodySeq=3;doc.activeBody='b1';
    const th=()=>({size:'M8',p:1.25,len:12,lenMode:'len'});
    doc.features=[{id:'EA',type:'extrude',name:'Bloc A',sketchId:'skA',distance:20,op:'add',visible:true,body:'b1'},
                  {id:'EB',type:'extrude',name:'Bloc B',sketchId:'skB',distance:20,op:'add',visible:true,body:'b2'}];
    ensureBodies();markDirty();rebuild();
    doc.activeBody='b1';askHole('hA');let f=doc.features[doc.features.length-1];f.body='b1';f.d=tapDrill('M8',1.25);f.end='blind';f.depth=16;f.thread=th();f.name=holeName(f);
    doc.activeBody='b2';askHole('hB');f=doc.features[doc.features.length-1];f.body='b2';f.d=tapDrill('M8',1.25);f.end='blind';f.depth=16;f.thread=th();f.name=holeName(f);
    markDirty();rebuild();
    A(builtEngine==='exact'&&!doc.features.some(x=>x._err),'0 : deux blocs percés taraudés, rejeu exact sans erreur');
    const P=holeThreadPaths();
    A(P.length===2&&P.map(t=>t.bodyId).sort().join(',')==='b1,b2','1 : chaque filet porte le corps de sa fonction ('+P.map(t=>t.bodyId).join(',')+')');
    // Harnais : les objets THREE y sont des bouchons (Group.add muet, userData factice) — le groupe
    // affiché est donc reconstitué ici à l'identique de holeThreadOverlay (hélice + cercle par trou,
    // userData.bodyId = corps du filet) ; le dessin réel est contrôlé dans le navigateur.
    const mkGrp=()=>{const g={parent:scene,children:[]};holeThreadPaths().forEach(T=>{for(let k=0;k<2;k++)g.children.push({visible:true,userData:{bodyId:T.bodyId}});});holeThreadGrp=g;holeThreadVisSync();};
    mkGrp();
    const grp=()=>holeThreadGrp;
    const shown=bid=>grp().children.filter(o=>o.userData.bodyId===bid).map(o=>o.visible);
    A(grp()&&shown('b1').length===2&&shown('b2').length===2&&shown('b1').concat(shown('b2')).every(v=>v),'2 : hélice + cercle d’entrée par trou, tous visibles');
    bodyToggleVis('b1');holeThreadVisSync();
    A(shown('b1').every(v=>!v)&&shown('b2').every(v=>v),'3 : œil de « Bloc A » éteint → ses filets cachés, ceux de « Bloc B » visibles');
    bodyToggleVis('b1');holeThreadVisSync();
    A(shown('b1').every(v=>v),'4 : œil rallumé → filets de « Bloc A » revenus');
    // maillage caché sans passer par l'œil (clic droit « Cacher » de la vue, esquisse fantôme…)
    const rb=bodies.filter(b=>!b.ghost&&bodyIdOfRuntime(b)==='b2');
    A(rb.length>0,'5a : « Bloc B » a un maillage affiché ('+rb.length+')');
    rb.forEach(b=>{b.visible=false;b.mesh.visible=false;});holeThreadVisSync();
    A(shown('b2').every(v=>!v)&&shown('b1').every(v=>v),'5 : maillage de « Bloc B » caché hors de l’œil → ses filets suivent à l’image suivante');
    rb.forEach(b=>{b.visible=true;b.mesh.visible=true;});holeThreadVisSync();
    A(shown('b2').every(v=>v),'6 : maillage ré-affiché → filets revenus');
    // rejeu complet avec un corps caché : le nouveau groupe naît déjà à jour
    bodyToggleVis('b2');markDirty();rebuild();mkGrp();
    A(shown('b2').length===2&&shown('b2').every(v=>!v)&&shown('b1').every(v=>v),'7 : après un rejeu, les filets d’un corps caché naissent cachés');
    // mise en plan : règle partagée
    A(holeThreadBodyShown('b1')&&!holeThreadBodyShown('b2'),'8 : holeThreadBodyShown (mise en plan) : « Bloc B » caché, « Bloc A » montré');
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== Filets taraudés : cachés avec leur corps ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
