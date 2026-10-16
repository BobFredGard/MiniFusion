// 2026-10-16-008 : paramètres ƒx dans les FONCTIONS 3D (distance d'extrusion, perçage, …) —
// suite de V0.1.41 (cotes d'esquisse nommées / expressions). Noyau OCCT réel.
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
    "const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};const near=(a,b)=>Math.abs(a-b)<1e-6;",
    "occt=__realOcct;occtReady=true;",
    "const box={id:'skA',name:'Plaque',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{O:{x:0,y:0},a:{x:0,y:0},b:{x:100,y:0},c:{x:100,y:60},d:{x:0,y:60}},",
    "  entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],",
    "  constraints:[{id:'h1',type:'h',line:'l1'},{id:'v1',type:'v',line:'l2'},{id:'h2',type:'h',line:'l3'},{id:'v2',type:'v',line:'l4'},{id:'co',type:'coincident',a:'a',b:'O'}],",
    "  dims:[{id:'W',type:'length',line:'l1',value:100,chk:1},{id:'H',type:'length',line:'l2',value:60,chk:1}],seq:20,visible:false};",
    "const hs={id:'sH',name:'Centres',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{O:{x:0,y:0},h0:{x:30,y:30}},entities:[{id:'c0',t:'cpoint',p:'h0',hole:true}],constraints:[],dims:[],seq:10,visible:false};",
    "doc.sketches=[box,hs];doc.params=[];doc.features=[{id:'F1',type:'extrude',name:'Plaque',sketchId:'skA',distance:10,op:'add',visible:true}];",
    "doc.bodies=[];delete doc.activeBody;",
    // cote d'esquisse nommée L = 100
    "let r=parDimCommit(box,box.dims[0],'L = 100');box.dims[0].value=r.nv;",
    // épaisseur d'extrusion = L/10, nommée Ep
    "const F1=doc.features[0];r=parFxSet(F1,'distance','Ep = L/10');",
    "A(r.ok&&near(r.v,10)&&F1.expr.distance==='L/10'&&F1.pname.distance==='Ep','1 : distance d\\u2019extrusion « Ep = L/10 » → 10');",
    "markDirty();rebuild();",
    // perçage : profondeur Ep - 2 (borgne), Ø via paramètre libre
    "doc.params.push({name:'Dperc',expr:'8'});",
    "askHole('sH');const fH=doc.features[doc.features.length-1];fH.end='depth';",
    "r=parFxSet(fH,'depth','Ep - 2');fH.depth=r.v;r=parFxSet(fH,'d','Dperc');fH.d=r.v;",
    "markDirty();rebuild();",
    "A(builtEngine==='exact'&&!doc.features.some(f=>f._err),'2 : pièce exacte (plaque + perçage ƒx)');",
    "A(near(fH.depth,8)&&near(fH.d,8),'3 : perçage : profondeur Ep - 2 = 8, Ø = Dperc = 8');",
    // la cote L passe à 150 → tout suit au rejeu
    "r=parDimCommit(box,box.dims[0],'150');box.dims[0].value=r.nv;markDirty();rebuild();",
    "A(near(F1.distance,15)&&near(fH.depth,13)&&!doc.features.some(f=>f._err),'4 : L = 150 → épaisseur 15 et profondeur de perçage 13 au rejeu ('+F1.distance+' / '+fH.depth+')');",
    "A(/15/.test(F1.name),'4b : le nom de l\\u2019extrusion suit (« '+F1.name+' »)');",
    "const zs=occListEdges(occLive.shape).map(e=>e.mid&&e.mid[2]).filter(z=>z!=null);A(near(Math.max(...zs),15),'5 : solide : dessus à Z15 ('+Math.max(...zs).toFixed(3)+')');",
    // découpe : le SENS est conservé
    "const F2={id:'F2',type:'extrude',name:'Découpe',sketchId:'skA',distance:-5,op:'cut',visible:false};doc.features.push(F2);",
    "r=parFxSet(F2,'distance','Ep/3');parHolderSet(F2,'distance',r.v);A(near(F2.distance,-5),'6 : découpe : la valeur ƒx garde le sens (−5)');",
    "doc.features=doc.features.filter(f=>f!==F2);",
    // garde-fous
    "r=parFxSet(fH,'depth','Ep2 = Zorg');A(!r.ok&&/inconnu/.test(r.msg)&&fH.expr.depth==='Ep - 2','7 : nom inconnu refusé, l\\u2019expression précédente reste');",
    "r=parFxSet(F1,'distance','Ep = Ep*2');A(!r.ok&&/circulaire/.test(r.msg),'8 : référence circulaire refusée');",
    "r=parFxSet(fH,'d','L = 3');A(!r.ok&&/déjà utilisé/.test(r.msg),'9 : nom déjà pris (cote d\\u2019esquisse) refusé');",
    // une cote d'esquisse peut utiliser la valeur d'une fonction 3D
    "r=parDimCommit(box,box.dims[1],'Ep*4');box.dims[1].value=r.nv;parApplyAll();",
    "A(r.ok&&near(box.dims[1].value,60),'10 : cote d\\u2019esquisse = Ep*4 = 60 (valeur de fonction 3D réutilisée)');",
    // champ : parFx convertit l'expression en nombre pour le code existant
    "const inp=document.createElement('input');inp.value='10';parFx(inp,F1,'distance');",
    "A(inp.value==='Ep = L/10','11 : le champ affiche « Ep = L/10 »');",
    "let seen=null;inp.addEventListener('change',()=>{seen=inp.value;});inp.value='Ep = L/5';inp.dispatchEvent({type:'change'});",
    "A(seen==='30'&&F1.expr.distance==='L/5','12 : saisie « Ep = L/5 » → le code reçoit 30, l\\u2019expression est mémorisée ('+seen+')');",
    // fichier
    "const js=JSON.parse(serialise(false));const g=js.features.find(f=>f.id==='F1');",
    "A(g&&g.expr&&g.expr.distance==='L/5'&&g.pname.distance==='Ep','13 : expressions et noms enregistrés dans le fichier');",
    "return out;"
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== 2026-10-16-008 : paramètres ƒx dans les fonctions 3D ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
