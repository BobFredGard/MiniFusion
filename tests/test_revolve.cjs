// 2026-09-30l : RÉVOLUTION 360° sur le noyau OCCT réel.
// Mesures : nombre de faces, rayons vus depuis l'axe, longueurs des arêtes, englobant.
// (BRepGProp n'est pas exposé dans cette build : on mesure la géométrie, pas le volume.)
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  ✗ '+m);}else console.log('  ✓ '+m);};
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const body=[
    'const out={};',
    'let sn=0;',
    'const reset=()=>{doc.sketches=[];doc.features=[];occCkClear();};',
    'const mkSk=(profs,plane)=>{',
    '  const sk={id:"sk"+(++sn),name:"S"+sn,plane:plane||"XY",origin:[0,0,0],',
    '    axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{},entities:[],constraints:[],dims:[],visible:false};',
    '  sk.points.pa={x:0,y:-60};sk.points.pb={x:0,y:60};',
    '  sk.entities.push({id:"ax",t:"line",p1:"pa",p2:"pb",construction:true});',
    '  let k=0;',
    '  for(const prof of profs){const ids=prof.map(q=>{const id="q"+(++k);sk.points[id]={x:q[0],y:q[1]};return id;});',
    '    for(let i=0;i<ids.length;i++)sk.entities.push({id:"L"+(++k),t:"line",p1:ids[i],p2:ids[(i+1)%ids.length]});}',
    '  doc.sketches.push(sk);return sk;};',
    'const facesOf=s=>{let n=0;const ex=new occt.TopExp_Explorer_2(s,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);',
    '  while(ex.More()){n++;ex.Next();}try{ex.delete();}catch(e){}return n;};',
    '// géométrie EXACTE d\'une forme : rayons des cercles + longueurs des droites',
    '// (les points échantillonnés sous-estiment les rayons de ~5 % : on lit l\'adaptateur)',
    'const mesure=shape=>{',
    '  const rad=new Set(),lens=[],arcs=[];',
    '  const ex=new occt.TopExp_Explorer_2(shape,occt.TopAbs_ShapeEnum.TopAbs_EDGE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);',
    '  while(ex.More()){',
    '    const e=occt.TopoDS.Edge_1(ex.Current());',
    '    try{',
    '      const ad=new occt.BRepAdaptor_Curve_2(e);',
    '      const du=Math.abs(ad.LastParameter()-ad.FirstParameter());',
    '      let r=-1;try{r=ad.Circle().Radius();}catch(err){}',
    '      if(r>1e-6){rad.add(Math.round(r*100)/100);arcs.push(Math.round(du*r*100)/100);}',
    '      else lens.push(Math.round(du*100)/100);',
    '    }catch(err){}',
    '    ex.Next();}',
    '  return{faces:facesOf(shape),rad:Array.from(rad).sort((a,b)=>a-b),',
    '    lignes:lens.sort((a,b)=>b-a),arcs:arcs.sort((a,b)=>b-a)};};',
    'const runRev=f=>{const r=occShapeOfRevolve(f);const m=mesure(r.shape);',
    '  (r.bins||[]).forEach(b=>{try{b.delete();}catch(e){}});',
    '  if(r.warn&&r.warn.length)console.log("   [warn] "+r.warn.join(" | "));',
    '  return m;};',
    'const aR=(tab,vals,tol)=>vals.every(v=>tab.some(t=>Math.abs(t-v)<(tol||0.15)));',
    '// ── 1) TUBE : rectangle 5..15, hauteur 20, révolution autour de Y ──',
    'reset();let sk=mkSk([[[5,-10],[15,-10],[15,10],[5,10]]]);',
    'let f1={id:"r1",type:"revolve",sketchId:sk.id,axis:{k:"line",id:"ax"},angle:360,op:"add",visible:true};',
    'out.tube=runRev(f1);',
    'out.nom=revolveName(f1);',
    '// ── 2) PLEIN : profil adossé à l\'axe ──',
    'reset();sk=mkSk([[[0,-10],[20,-10],[20,10],[0,10]]]);',
    'let f2={id:"r2",type:"revolve",sketchId:sk.id,axis:{k:"line",id:"ax"},angle:360,op:"add",visible:true};',
    'out.plein=runRev(f2,"Y");',
    '// ── 3) PROFIL QUI TRAVERSE L\'AXE : refusé ──',
    'reset();sk=mkSk([[[-5,-10],[15,-10],[15,10],[-5,10]]]);',
    'let f3={id:"r3",type:"revolve",sketchId:sk.id,axis:{k:"line",id:"ax"},angle:360,op:"add",visible:true};',
    'try{runRev(f3,"Y");out.traverse="AUCUNE ERREUR (inattendu)";}catch(e){out.traverse=String(e.message);}',
    '// ── 4) TUBE PERCÉ : profil + trou ──',
    'reset();sk=mkSk([[[8,-10],[20,-10],[20,10],[8,10]],[[10,-4],[18,-4],[18,4],[10,4]]]);',
    'let f4={id:"r4",type:"revolve",sketchId:sk.id,axis:{k:"line",id:"ax"},angle:360,op:"add",visible:true};',
    'out.perce=runRev(f4,"Y");',
    '// ── 5) RÉVOLUTION EN POCHE (gorge) creusée dans un bloc ──',
    'reset();',
    'const bl=mkSk([[[-30,-30],[30,-30],[30,30],[-30,30]]]);',
    'bl.entities=bl.entities.filter(e=>e.id!=="ax");',
    'doc.features.push({id:"exB",type:"extrude",name:"Bloc",sketchId:bl.id,distance:30,op:"add",visible:true,mid:false,upto:null});',
    'markDirty();rebuild();',
    'const FB=occFinalShape(null);out.bloc=FB.shape?mesure(FB.shape,"Z"):null;',
    'if(FB.shape)occCleanup(FB,null);',
    'const gsk=mkSk([[[16,-15],[20,-15],[20,15],[16,15]]]);',
    'const rg={id:"rG",type:"revolve",sketchId:gsk.id,axis:{k:"line",id:"ax"},angle:360,op:"cut",visible:true};',
    'rg.name=revolveName(rg);doc.features.push(rg);',
    'markDirty();rebuild();',
    'const FR=occFinalShape(null);',
    'out.gorge=FR.shape?mesure(FR.shape,"Z"):null;out.gorgeMsgs=FR.msgs.slice(0,3);',
    'if(FR.shape)occCleanup(FR,null);',
    '// ── 6) REPLI MAILLAGE ──',
    'reset();sk=mkSk([[[5,-10],[15,-10],[15,10],[5,10]]]);',
    'let f6={id:"r6",type:"revolve",sketchId:sk.id,axis:{k:"line",id:"ax"},angle:360,op:"add",visible:true};',
    'try{const g=legacyRevolveGeos(f6,[]);out.maillage={n:g.length};}catch(e){out.maillage={err:String(e.message)};}',
    '// ── 7) AXE SYSTÈME dans un plan XZ (profil D\'UN SEUL CÔTÉ de Z) ──',
    'reset();sk=mkSk([[[2,-10],[5,-10],[5,10],[2,10]]],"XZ");',
    'sk.axU=[1,0,0];sk.axV=[0,0,1];sk.axN=[0,-1,0];',
    'let f7={id:"r7",type:"revolve",sketchId:sk.id,axis:{k:"sys",d:"Z"},angle:360,op:"add",visible:true};',
    'out.axeSys=runRev(f7,"Z");',
    '// ── 8) NOMS (sur une esquisse encore vivante) ──',
    'reset();sk=mkSk([[[5,-10],[15,-10],[15,10],[5,10]]]);',
    'let f8={id:"r8",type:"revolve",sketchId:sk.id,axis:{k:"line",id:"ax"},angle:360,op:"add",visible:true};',
    'out.nom=revolveName(f8);',
    'out.nomCoupe=revolveName(Object.assign({},f8,{op:"cut"}));',
    'out.nom180=revolveName(Object.assign({},f8,{angle:180}));',
    '// ── 9) PROFIL CIRCULAIRE : tore (exerce diskOf, chemin « pastille ») ──',
    'reset();sk=mkSk([]);',
    'sk.points.cc={x:20,y:0};',
    'sk.entities.push({id:"C1",t:"circle",pc:"cc",r:5});',
    'let f9={id:"r9",type:"revolve",sketchId:sk.id,axis:{k:"line",id:"ax"},angle:360,op:"add",visible:true};',
    'out.tore=runRev(f9);',
    '// ── 10) PROFIL EN ARC : demi-disque fermé → « C » de révolution ──',
    'reset();sk=mkSk([]);',
    'sk.points.cc={x:20,y:0};sk.points.p1={x:20,y:-8};sk.points.p3={x:20,y:8};',
    'sk.entities.push({id:"A1",t:"arc",pc:"cc",r:8,pa:"p1",pb:"p3"});', // CCW : passe par (28,0)
    'sk.entities.push({id:"D1",t:"line",p1:"p3",p2:"p1"});',            // diamètre : ferme le profil
    'let f10={id:"r10",type:"revolve",sketchId:sk.id,axis:{k:"line",id:"ax"},angle:360,op:"add",visible:true};',
    'out.arc=runRev(f10);',
    '// ── 11) ANGLE PARTIEL ──',
    'reset();sk=mkSk([[[5,-10],[15,-10],[15,10],[5,10]]]);',
    'let f11={id:"r11",type:"revolve",sketchId:sk.id,axis:{k:"line",id:"ax"},angle:90,op:"add",visible:true};',
    'out.p90=runRev(f11);out.nom90=revolveName(f11);',
    'let f11b={id:"r11b",type:"revolve",sketchId:sk.id,axis:{k:"line",id:"ax"},angle:360,op:"add",visible:true};',
    'out.p360b=runRev(f11b);',
    '// ── 12) CERCLE CENTRÉ SUR L\'AXE : refusé (franchit l\'axe) ──',
    'reset();sk=mkSk([]);',
    'sk.points.cc={x:0,y:0};',
    'sk.entities.push({id:"C1",t:"circle",pc:"cc",r:5});',
    'let f12={id:"r12",type:"revolve",sketchId:sk.id,axis:{k:"line",id:"ax"},angle:360,op:"add",visible:true};',
    'try{runRev(f12);out.cercleAxe="AUCUNE ERREUR (inattendu)";}catch(e){out.cercleAxe=String(e.message);}',
    'return out;'
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx);
  const aR=(tab,vals,tol)=>vals.every(v=>tab.some(t=>Math.abs(t-v)<(tol||0.15)));
  console.log('=== 2026-09-30l : révolution 360° (noyau OCCT réel) ===');
  console.log('  tube Ø10 h20      : '+o.tube.faces+' faces, rayons '+o.tube.rad.join('/')+', droites '+o.tube.lignes.join('/'));
  console.log('  profil adossé     : '+o.plein.faces+' faces, rayons '+o.plein.rad.join('/')+', droites '+(o.plein.lignes.join('/')||'aucune'));
  console.log('  tube percé        : '+o.perce.faces+' faces, rayons '+o.perce.rad.join('/'));
  console.log('                     droites '+o.perce.lignes.join('/'));
  console.log('  axe système Z(XZ) : '+o.axeSys.faces+' faces, rayons '+o.axeSys.rad.join('/'));
  console.log('  bloc (extrusion)  : '+o.bloc.faces+' faces, rayons '+o.bloc.rad.join('/'));
  console.log('  bloc + gorge      : '+o.gorge.faces+' faces, rayons '+o.gorge.rad.join('/'));
  A(o.tube.faces===4&&aR(o.tube.rad,[5,15]),'tube Ø10 h20 : 4 faces, rayons 5 et 15');
  A(aR(o.tube.lignes,[20,20,20,20]),'tube Ø10 h20 : 4 génératrices de 20 mm');
  A(o.plein.faces===3&&aR(o.plein.rad,[20]),'profil adossé à l\'axe : cylindre PLEIN (3 faces, rayon 20)');
  A(typeof o.traverse==='string'&&/part et d|autre/.test(o.traverse),'profil traversant l\'axe REFUSÉ : « '+o.traverse+' »');
  A(o.perce.faces===8&&aR(o.perce.rad,[8,10,18,20]),'profil avec trou : 8 faces, rayons 8/10/18/20');
  A(aR(o.perce.lignes,[20,8]),'le perçage a bien 4 droites de 8 mm (l\'alésage)');
  A(!!o.gorge,'révolution « poche » rejouée sans erreur'+(o.gorgeMsgs.length?' ('+o.gorgeMsgs.length+' avertissement)':''));
  if(o.gorgeMsgs.length)o.gorgeMsgs.forEach(m=>console.log('    ! '+m));
  A(o.gorge.faces>o.bloc.faces,'la gorge creuse : '+o.bloc.faces+' → '+o.gorge.faces+' faces');
  A(aR(o.gorge.rad,[16,20]),'la gorge a bien les rayons 16 et 20');
  A(o.maillage&&o.maillage.n===1&&!o.maillage.err,'repli maillage : '+((o.maillage&&o.maillage.n)||0)+' géométrie'+(o.maillage&&o.maillage.err?' — '+o.maillage.err:''));
  A(o.axeSys.faces===4&&aR(o.axeSys.rad,[2,5]),'axe SYSTÈME (Z dans un plan XZ) opérationnel');
  console.log('  noms : "'+o.nom+'" | poche : "'+o.nomCoupe+'" | 180° : "'+o.nom180+'"');
  A(/Révolution/.test(o.nom)&&/360/.test(o.nom),'nom : Révolution … 360°');
  A(/180°/.test(o.nom180),'nom à 180° : « … 180° »');
  console.log('  tore (Ø10 @ r20)  : '+o.tore.faces+' faces, rayons '+o.tore.rad.join('/')+'  (attendu 15 et 25)');
  A(o.tore.faces>=1&&aR(o.tore.rad,[15,25]),'profil CIRCULAIRE : tore construit (pastille diskOf)');
  console.log('  arc (demi-disque r8 @ r20) : '+o.arc.faces+' faces, cercles '+o.arc.rad.join('/')+', droites '+o.arc.lignes.join('/'));
  A(o.arc.faces===2&&aR(o.arc.rad,[8,20])&&aR(o.arc.lignes,[16]),
    'profil EN ARC : « C » de révolution (cylindre r20 + demi-tore r8, coutures R8 et L16)');
  console.log('  angle 90°         : '+o.p90.faces+' faces, arcs '+o.p90.arcs.join('/'));
  console.log('     (90° attendu : génératrices = 2πr/4 → 7,85 (r5) et 23,56 (r15))');
  A(o.p90.faces===6&&aR(o.p90.arcs,[23.56,7.85],0.2),'angle partiel 90° : les génératrices font bien un quart de tour');
  A(o.p360b.faces===4&&aR(o.p360b.arcs,[31.42,94.25],0.2),'angle 360° : tour complet (cercles 2πr)');
  A(/90°/.test(o.nom90),'angle partiel 90° : nommé « … 90° »');
  A(typeof o.cercleAxe==='string'&&/axe/.test(o.cercleAxe),'cercle centré sur l\'axe REFUSÉ : « '+o.cercleAxe+' »');
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.message)||e).slice(0,800));process.exit(1);});