// 2026-10-16-015 : congé / chanfrein sur UNE arête, case « tangentes » décochée — le noyau OCCT
// suit toujours la chaîne tangente ; ici l'arête seule est arrondie (outil extrudé qui déborde
// devant et derrière). Noyau réel. Pièce : plaque dont un coin est un arc tangent.
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
    "const sk={id:'s',name:'s',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{a:{x:0,y:0},b:{x:40,y:0},c:{x:40,y:20},cc:{x:30,y:20},d:{x:30,y:30},e:{x:0,y:30}},",
    "  entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'ar',t:'arc',pc:'cc',pa:'c',pb:'d',r:10},{id:'l3',t:'line',p1:'d',p2:'e'},{id:'l4',t:'line',p1:'e',p2:'a'}],constraints:[],dims:[],seq:9,visible:false};",
    "doc.sketches=[sk];doc.features=[{id:'F',type:'extrude',name:'P',sketchId:'s',distance:10,op:'add',visible:true}];doc.bodies=[];markDirty();rebuild();",
    "const NF=sh=>{let k=0;const ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);while(ex.More()){k++;ex.Next();}return k;};",
    "const ok=sh=>{try{const c=new occt.BRepCheck_Analyzer(sh,true,false);return c.IsValid();}catch(e){return null;}};",
    "const base=occLive.shape,E=occListEdges(base),f0=NF(base);",
    "const e2=E.find(e=>Math.abs(e.mid[2]-10)<1e-6&&Math.abs(e.mid[0]-40)<1e-6);", // arête du haut x=40, tangente à l'arc
    "const keys=sh=>occFaceKeys(sh);",
    "let w=[];const tan=occFilletRun(base,[{src:e2.src,r:2,mid:e2.mid}],w,false);",
    "w=[];const one=occFilletRun(base,[{src:e2.src,r:2,mid:e2.mid}],w,false,{single:true});",
    "out.log.push('faces : base '+f0+' · tangentes suivies '+(tan?NF(tan):'?')+' · arête seule '+(one?NF(one):'?'));",
    "const torus=sh=>keys(sh).filter(k=>/^S/.test(k)).length;", // surfaces non plan/cylindre (tore du coin)
    "A(tan&&NF(tan)-f0===3,'1 : OCCT (case cochée) : le congé suit la chaîne tangente (arête + arc + arête = 3 faces)');",
    "A(one&&ok(one)!==false,'2 : arête seule : solide valide');",
    "const vive=sh=>occListEdges(sh).some(e=>Math.abs(e.mid[2]-10)<1e-6&&Math.abs(e.mid[1]-30)<1e-6&&Math.abs(e.mid[0]-15)<1e-3);", // arête du haut y=30 (après l'arc)
    "A(!vive(tan)&&vive(one),'3 : arête seule : l\\u2019arête après l\\u2019arc reste VIVE (case cochée : elle est arrondie)');",
    "const cylR2=keys(one).filter(k=>/^C/.test(k)&&/\\|2$/.test(k)).length;",
    "A(cylR2>=1,'4 : face de congé cylindrique R2 présente, le congé déborde dans l\\u2019arc ('+cylR2+' morceau(x))');",
    "w=[];const ch=occFilletRun(base,[{src:e2.src,r:1,mid:e2.mid}],w,true,{single:true});",
    "A(ch&&ok(ch)!==false&&xNewFaces(base,ch).filter(Boolean).length>=1,'5 : chanfrein sur l\\u2019arête seule : solide valide, face de chanfrein créée');",
    "const ex1=E.find(e=>Math.abs(e.mid[2]-10)<1e-6&&Math.abs(e.mid[1])<1e-6);", // arête du haut y=0 (sans tangence)
    "w=[];const a1=occFilletRun(base,[{src:ex1.src,r:2,mid:ex1.mid}],w,false,{single:true});w=[];const b1=occFilletRun(base,[{src:ex1.src,r:2,mid:ex1.mid}],w,false);",
    "A(a1&&b1&&NF(b1)===f0+1&&ok(a1)!==false,'6 : arête sans tangence : arrondie seule dans les 2 modes');",
    "return out;"
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== 2026-10-16-015 : congé / chanfrein sur une arête seule ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
