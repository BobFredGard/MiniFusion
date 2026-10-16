// 2026-10-16-007 : arcs PROJETÉS (références violettes de l'esquisse) — « toujours un problème
// de projection des entités arc de cercle ». Cause : skBRepPlanarRefs traçait l'arc de début à
// fin en sens trigo sans regarder le sens de parcours de l'arête OCCT → le COMPLÉMENT pour les
// arcs parcourus en sens horaire (congés concaves en quasi-cercles) ; et le cercle complet
// était « détecté » en comparant la CORDE à la circonférence (jamais vrai).
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
    "occt=__realOcct;occtReady=true;",
    "const T=2*Math.PI,sweep=r=>{let d=(r.a2-r.a1)%T;if(d<=0)d+=T;return d;};",
    // ── fonction pure
    "let q=skArcRef(0,0,10, 10*Math.cos(0.5),10*Math.sin(0.5), 10*Math.cos(-0.5),10*Math.sin(-0.5), 10,0);",
    "A(q.type==='arc'&&Math.abs(sweep(q)-1)<1e-9&&angInArc(0,q.a1,q.a2),'1 : arête parcourue en sens HORAIRE → arc de 57° contenant son milieu (pas le complément de 303°)');",
    "q=skArcRef(0,0,10, 10*Math.cos(-0.5),10*Math.sin(-0.5), 10*Math.cos(0.5),10*Math.sin(0.5), 10,0);",
    "A(q.type==='arc'&&Math.abs(sweep(q)-1)<1e-9,'2 : sens trigo inchangé');",
    "q=skArcRef(0,0,10,10,0,10,0,-10,0);A(q.type==='circle','3 : arête fermée → cercle complet');",
    // ── noyau réel : plaque 100×60×10 + encoche R10 (cylindre centré 4 mm HORS du bord gauche) + 4 trous Ø12
    "const box={id:'skA',name:'Plaque',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{a:{x:0,y:0},b:{x:100,y:0},c:{x:100,y:60},d:{x:0,y:60}},",
    "  entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],constraints:[],dims:[],seq:20,visible:false};",
    "const cut={id:'skB',name:'Encoche',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{k:{x:-4,y:30},h:{x:60,y:30}},",
    "  entities:[{id:'cc',t:'circle',pc:'k',r:10},{id:'ch',t:'circle',pc:'h',r:6}],constraints:[],dims:[],seq:20,visible:false};",
    "doc.sketches=[box,cut];doc.features=[{id:'F1',type:'extrude',name:'Plaque',sketchId:'skA',distance:10,op:'add',visible:true},{id:'F2',type:'extrude',name:'Encoche',sketchId:'skB',distance:10,op:'cut',through:true,visible:true}];",
    "doc.bodies=[];delete doc.activeBody;markDirty();rebuild();",
    "A(builtEngine==='exact'&&!doc.features.some(f=>f._err),'4 : pièce exacte');",
    "const top={id:'skT',name:'Dessus',plane:'XY',origin:[0,0,10],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{O:{x:0,y:0}},entities:[],constraints:[],dims:[],seq:5,visible:true};",
    "doc.sketches.push(top);skEdit=top;",
    "const refs=skBRepPlanarRefs(occLive.shape)||[];",
    "const notch=refs.filter(r=>r.type==='arc'&&Math.abs(r.r-10)<1e-3),hole=refs.filter(r=>Math.abs(r.r-6)<1e-3);",
    "out.log.push('références : '+refs.map(r=>r.type+(r.r?' R'+r.r.toFixed(1)+(r.type==='arc'?' '+(sweep(r)*180/Math.PI).toFixed(1)+'°':''):'')).join(' | '));",
    "const exp=2*Math.acos(4/10);",
    "const tot=notch.reduce((t,r)=>t+sweep(r),0);",
    "A(notch.length>=1&&notch.every(r=>sweep(r)<Math.PI)&&Math.abs(tot-exp)<1e-3&&notch.some(r=>angInArc(0,r.a1,r.a2)),'5 : encoche concave R10 : '+notch.length+' arc(s), '+(tot*180/Math.PI).toFixed(1)+'° au total côté matière (attendu '+(exp*180/Math.PI).toFixed(1)+'°, pas le complément)');",
    "const keys=refs.map(r=>JSON.stringify(r));A(new Set(keys).size===keys.length,'5b : aucune référence en double (arête visitée par 2 faces)');",
    "A(hole.length===1&&hole[0].type==='circle','6 : trou Ø12 → CERCLE complet (avant : « arc » de début = fin)');",
    "skEdit=null;",
    "return out;"
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== 2026-10-16-007 : arcs projetés (références d’esquisse) ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
