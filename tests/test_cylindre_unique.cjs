// V0.11.5 : un cercle d'esquisse extrudé donne UN cylindre (une arête de cercle fermée), plus
// deux demi-cylindres : pas d'arête de jonction, un seul cercle à projeter. Noyau OCCT réel.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};',ctx);
  const R=[
    "const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};",
    "const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE,FA=occt.TopAbs_ShapeEnum.TopAbs_FACE;",
    "const faces=s=>{const o=[];const x=new occt.TopExp_Explorer_2(s,FA,SH);while(x.More()){o.push(occt.TopoDS.Face_1(x.Current()));x.Next();}x.delete();return o;};",
    "const kinds=s=>faces(s).map(occSurfKind);",
    "const sq={id:'skB',name:'Bloc',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{a:{x:-20,y:-20},b:{x:20,y:-20},c:{x:20,y:20},d:{x:-20,y:20}},",
    "  entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],constraints:[],dims:[],seq:20,visible:false};",
    "const ci={id:'skC',name:'Cyl',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{k:{x:0,y:0}},entities:[{id:'cc',t:'circle',pc:'k',r:8}],constraints:[],dims:[],seq:20,visible:false};",
    // 1) pastille seule
    "doc.sketches=[sq,ci];doc.features=[];doc.bodies=[];delete doc.activeBody;ensureBodies();const B=doc.bodies[0].id;",
    "doc.features.push({id:'C',type:'extrude',name:'Cyl',sketchId:'skC',distance:20,op:'add',visible:true,body:B});markDirty();rebuild();",
    "{const k=kinds(occLive.shape);A(k.length===3&&k.filter(x=>x==='Cylinder').length===1,'1 : pastille Ø16 : 3 faces dont UN cylindre ('+k.join(',')+')');",
    " const E=occSharpEdges(occLive.shape);A(E.length===2,'1 : 2 arêtes (cercles haut et bas), pas de jonction ('+E.length+')');}",
    // 2) trou débouchant dans un bloc
    "doc.features=[{id:'F',type:'extrude',name:'Bloc',sketchId:'skB',distance:20,op:'add',visible:true,body:B},{id:'T',type:'extrude',name:'Trou',sketchId:'skC',distance:20,op:'cut',visible:true,body:B}];markDirty();rebuild();",
    "{const k=kinds(occLive.shape);A(k.length===7&&k.filter(x=>x==='Cylinder').length===1,'2 : bloc percé : 7 faces dont UN cylindre ('+k.join(',')+')');",
    " const top=occSharpEdges(occLive.shape).filter(e=>e.pts.every(p=>Math.abs(p[2]-20)<1e-3)&&Math.hypot(e.mid[0],e.mid[1])<9);A(top.length===1,'2 : bord du trou en haut = UNE arête ('+top.length+')');}",
    "return out;"
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== V0.11.5 : cylindre en une seule face ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
