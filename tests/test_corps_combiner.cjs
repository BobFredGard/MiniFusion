// 2026-10-16-009 : extrusion « Nouveau corps », COMBINER (union / soustraction / intersection),
// transparence vraie par corps enregistrée. Noyau OCCT réel.
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
    "const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};const near=(a,b,t)=>Math.abs(a-b)<(t||1e-3);",
    "occt=__realOcct;occtReady=true;",
    "const bbox=sh=>{const E=occListEdges(sh);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;E.forEach(e=>e.pts.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);z0=Math.min(z0,p[2]);z1=Math.max(z1,p[2]);}));return{x0,x1,y0,y1,z0,z1,n:E.length};};",
    "const box={id:'skA',name:'Bloc',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{a:{x:-20,y:-20},b:{x:20,y:-20},c:{x:20,y:20},d:{x:-20,y:20}},",
    "  entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],constraints:[],dims:[],seq:20,visible:false};",
    "const cyl={id:'skC',name:'Cyl',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{k:{x:0,y:0}},entities:[{id:'cc',t:'circle',pc:'k',r:10}],constraints:[],dims:[],seq:20,visible:false};",
    "doc.sketches=[box,cyl];doc.features=[];doc.bodies=[];delete doc.activeBody;ensureBodies();",
    "doc.features.push({id:'F1',type:'extrude',name:'Bloc',sketchId:'skA',distance:20,op:'add',visible:true,body:doc.bodies[0].id});",
    // extrusion « Nouveau corps » via le formulaire de création
    "const nb0=doc.bodies.length;extNew={sketchId:'skC',op:'new',dist:40};extNewOk();",
    "const F2=doc.features.find(f=>f.sketchId==='skC');",
    "A(F2&&F2.newBody&&doc.bodies.length===nb0+1&&F2.body===doc.bodies[doc.bodies.length-1].id&&F2.op==='add'&&F2.distance===40,'1 : extrusion « Nouveau corps » : solide séparé dans un corps neuf');",
    "markDirty();rebuild();let FR=occFinalShape(null);",
    "A(builtEngine==='exact'&&FR.perBody.length===2,'2 : 2 corps affichés avant combinaison ('+FR.perBody.length+')');occCleanup(FR,null);",
    "const B1=doc.bodies[0].id,B2=F2.body;",
    "const mk=(mode,keep)=>{doc.features=doc.features.filter(f=>f.type!=='combine');const f={id:'cb'+mode,type:'combine',name:'',body:B1,tools:[B2],mode,keep:!!keep,visible:true};f.name=combineName(f);doc.features.push(f);markDirty();rebuild();const R=occFinalShape(null);const bb=bbox(R.shape);const n=R.perBody.length;occCleanup(R,null);return{bb,n,err:doc.features.some(x=>x._err)};};",
    "let r=mk('union');A(r.n===1&&near(r.bb.z1,40)&&near(r.bb.x1,20)&&!r.err,'3 : UNION : un seul corps, bloc + cylindre (Z 0 → 40)');",
    "r=mk('cut');A(r.n===1&&near(r.bb.z1,20)&&near(r.bb.x1,20)&&r.bb.n>12,'4 : SOUSTRACTION : le bloc percé par le cylindre (Z 20, arêtes du trou : '+r.bb.n+')');",
    "r=mk('intersect');A(r.n===1&&near(r.bb.z1,20)&&near(r.bb.x1,10)&&near(r.bb.x0,-10),'5 : INTERSECTION : le cylindre limité au bloc (Ø20 × 20)');",
    "r=mk('cut',true);A(r.n===2,'6 : « garder le corps outil » : les 2 corps restent affichés');",
    "const cf=doc.features.find(f=>f.type==='combine');A(/Soustraction/.test(cf.name)&&featIconOf(cf)==='⊖','7 : nom et icône (« '+cf.name+' »)');",
    // cache : modifier le corps OUTIL invalide bien la combinaison
    "mk('cut');F2.distance=10;markDirty();rebuild();{const R=occFinalShape(null);const E=occListEdges(R.shape);const fond=E.some(e=>e.mid&&near(e.mid[2],10,1e-3)&&e.pts.every(p=>near(p[2],10,1e-3)));occCleanup(R,null);A(fond,'8 : outil raccourci (10) : la soustraction suit — fond de trou borgne à Z10');}",
    // transparence vraie
    "setBodyGlass(B1,0.4);A(bodyGlassOf(B1)===0.4,'9 : transparence enregistrée sur le corps');",
    "const m={transparent:false,opacity:1,depthWrite:true};setMatAlpha(m,1,0.4);A(m.transparent&&near(m.opacity,0.4)&&m.depthWrite===false,'10 : matière : transparente SANS écriture de profondeur (on voit l\\u2019intérieur)');",
    "const m2={transparent:false,opacity:1,depthWrite:true};setMatAlpha(m2,0.6);A(m2.transparent&&m2.depthWrite===true,'11 : « Intensité » inchangée (profondeur conservée)');",
    "const js=JSON.parse(serialise(false));A(js.bodies.find(b=>b.id===B1).gl===0.4,'12 : transparence enregistrée dans le fichier');",
    "return out;"
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== 2026-10-16-009 : nouveau corps, combiner, transparence ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
