// V0.11.7 : cacher un corps cache AUSSI ses arêtes (overlay, survol, congés) — un seul test
// de visibilité, bodyShown(). Deux corps issus d'une scission, noyau OCCT réel.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};window.confirm=function(){return true;};',ctx);
  const R=[
    "const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};",
    "const box={id:'skA',name:'Bloc',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{a:{x:-20,y:-20},b:{x:20,y:-20},c:{x:20,y:20},d:{x:-20,y:20}},",
    "  entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],constraints:[],dims:[],seq:20,visible:false};",
    "doc.sketches=[box];doc.features=[];doc.bodies=[];delete doc.activeBody;ensureBodies();const B1=doc.bodies[0].id;",
    "doc.features.push({id:'F1',type:'extrude',name:'Bloc',sketchId:'skA',distance:20,op:'add',visible:true,body:B1});",
    "markDirty();rebuild();",
    // coupe à X=5 : deux corps disjoints (bloc 25 et bloc 15), 12 arêtes chacun
    "splitMode={mode:'body',faces:[],body:B1,pl:{src:'YZ'},off:5,flip:false,editing:null};splitApply();",
    "const f=doc.features.find(x=>x.type==='xsplit'),B2=f.newBody;edgeMode='on';",
    "const nE=()=>edgeOverlayData().length;",
    "A(bodies.filter(b=>b.kind==='body').length===2,'0 : deux corps exacts');",
    "const tous=nE();A(tous===20,'1 : deux corps montrés → 20 arêtes (4 communes au plan de coupe) ('+tous+')');",
    "bodyToggleVis(B2);A(!bodyShown(bodies.find(b=>b.id===B2)),'2 : œil → corps caché');",
    "const un=nE();A(un===12,'2 : corps caché → ses arêtes partent aussi (12, '+un+')');",
    "A(edgeHoverSegs().length===12,'2 : survol / choix d’arêtes : seulement le corps montré');",
    "{const xs=edgeOverlayData().map(d=>d.pts.map(p=>p[0])).flat();A(xs.every(x=>x<=5+1e-6),'2 : les arêtes restantes sont celles du corps −X');}",
    "filModeX={edges:[],tang:[],sel:[]};filEdgesReload();A(filModeX.edges.length===12,'3 : congés : arêtes du corps caché non proposées ('+filModeX.edges.length+')');filModeX=null;",
    "bodyToggleVis(B1);A(nE()===0,'4 : les deux cachés → aucune arête');",
    "bodyToggleVis(B1);bodyToggleVis(B2);A(nE()===20,'5 : tout remontré → 20 arêtes');",
    // rejeu : la visibilité mémorisée (doc.bodyVis) est réappliquée, arêtes comprises
    "bodyToggleVis(B2);markDirty();rebuild();A(nE()===12,'6 : après rejeu, le corps caché reste sans arêtes');",
    "globalThis.__out=out;"
  ].join('\n');
  vm.runInContext(R,ctx);
  // 7) quel que soit le chemin (ici l'œil), refreshParts() relance l'overlay 3D — différé, une fois
  vm.runInContext("globalThis.__nb=0;const __b=buildEdgeOverlay;buildEdgeOverlay=function(){__nb++;return __b.apply(this,arguments);};bodyToggleVis(bodies.find(b=>b.kind==='body').id);refreshParts();refreshParts();",ctx);
  await new Promise(r=>setTimeout(r,20));
  vm.runInContext("(__nb===1&&edgeOverlayVisSig===bodyVisSig()?__out.log:__out.fails).push('7 : œil → overlay 3D reconstruit une seule fois ('+__nb+')');__nb=0;refreshParts();",ctx);
  await new Promise(r=>setTimeout(r,20));
  vm.runInContext("(__nb===0?__out.log:__out.fails).push('7 : sans changement de visibilité, pas de reconstruction ('+__nb+')');",ctx);
  const out=vm.runInContext('__out',ctx);
  out.log.forEach(m=>console.log('  ✓ '+m));out.fails.forEach(m=>console.log('  ✗ '+m));
  console.log(out.fails.length?'\n*** ÉCHEC ***':'\n*** TOUT PASSE ***');
  process.exit(out.fails.length?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
