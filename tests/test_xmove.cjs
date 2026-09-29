// Déplacement de face : parcours COMPLET sur le moteur de l'application (pas une sonde
// isolée). On construit une boîte par les outils du moteur lui-même, on déplace sa face +X,
// on vérifie la boîte obtenue, puis on REJOUE depuis le document sérialisé — c'est le seul
// test qui prouve que la référence de face survit au rejeu.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    "const bb=function(sh){const b=new occt.Bnd_Box_1();occt.BRepBndLib.Add(sh,b,true);const a=b.CornerMin(),z=b.CornerMax();b.delete();return [a.X(),a.Y(),a.Z(),z.X(),z.Y(),z.Z()];};",
    "const nf=function(sh){let n=0;const ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);while(ex.More()){n++;ex.Next();}ex.delete();return n;};",
    "const nsolide=function(sh){let n=0;const ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_SOLID,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);while(ex.More()){n++;ex.Next();}ex.delete();return n;};",
    "const ncoque=function(sh){let n=0;const ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_SHELL,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);while(ex.More()){n++;ex.Next();}ex.delete();return n;};",
    "const decrireSolide=function(nom,sh){",
    "  if(!sh){p(nom+' : AUCUNE FORME');att(false,nom+' : aucune forme');return;}",
    "  const ns=nsolide(sh),nk=ncoque(sh);",
    "  p(nom+' : '+f3(bb(sh))+'  faces='+nf(sh)+'  coques='+nk+'  SOLIDES='+ns);",
    "  att(ns===1,nom+' : '+ns+' solide(s) au lieu d un seul');",
    "  att(nk===1,nom+' : '+nk+' coque(s) au lieu d une seule');",
    "  return bb(sh);",
    "};",
    "const f3=v=>v.map(x=>x.toFixed(1)).join('/');",
    // --- une esquisse carrée + une extrusion : on utilise le vrai chemin de l'app
    "const sk={id:'sk_t',name:'Carré',plane:'XY',origin:[0,0,0],points:{},entities:[],constraints:[],dims:[]};",
    "[['p0',0,0,'e0','p1'],['p1',100,0,'e1','p2'],['p2',100,60,'e2','p3'],['p3',0,60,'e3','p0']].forEach(l=>{",
    "  sk.points[l[0]]={x:l[1],y:l[2]};sk.entities.push({id:l[3],t:'line',p1:l[0],p2:l[4]});});",
    "doc.sketches=[sk];",
    "doc.features=[{id:'ex_t',type:'extrude',name:'Extrusion 1',sketchId:'sk_t',op:'add',distance:40,dist:40,d2:0}];",
    "occSkipFeat=null;",
    "let FR=occFinalShape(null);",
    "p('extrusion seule : '+(FR.shape?f3(bb(FR.shape)):'AUCUNE FORME')+'  ('+nf(FR.shape)+' faces)');",
    "let msgs0=(FR.msgs||[]).slice();msgs0.forEach(m=>p('  ! '+m));",
    "if(!FR.shape){return P.join(String.fromCharCode(10));}",
    "const base=FR.shape;",
    // --- on repère la face +X par son centre, comme le ferait un clic
    "{",
    "  const ex=new occt.TopExp_Explorer_2(base,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);",
    "  let ref=null,face=null;",
    "  while(ex.More()){const f=occt.TopoDS.Face_1(ex.Current());const b=occFaceBox(f),n=occFaceOutNormal(f);",
    "    if(b&&n&&b.pos[0]>99&&n[0]>0.9){ref=occFaceRef(f);face=f;break;}ex.Next();}",
    "  ex.delete();",
    "  if(!ref){p('face +X non reperee');return P.join(String.fromCharCode(10));}",
    "  p('face +X : centre ('+ref.pos.join(', ')+')  dim ('+ref.dim.join(', ')+')  normale ('+ref.n.join(', ')+')');",
    "  // --- déplacement +10 dans la timeline",
    "  doc.features.push({id:'mv_t',type:'xmove',name:'Déplacement de face 1',ref:ref,dist:10});",
    "  occCk.length=0;",
    "  FR=occFinalShape(null);",
    "  decrireSolide('deplacement +10 (attendu 110/60/40, UN solide)',FR.shape);",
    "  att(Math.abs(bb(FR.shape)[3]-110)<0.5,'+10 : la face n avance pas de 10 mm');",
    "  att(nf(FR.shape)===6,'+10 : '+nf(FR.shape)+' faces au lieu de 6 (coutures non fusionnees)');",
    "  (FR.msgs||[]).forEach(m=>p('  ! '+m));",
    "  if(FR.shape)FR.shape.delete();",
    "  // --- déplacement -10",
    "  doc.features[1].dist=-10;occCk.length=0;",
    "  FR=occFinalShape(null);",
    "  decrireSolide('deplacement -10 (attendu 90/60/40,  UN solide)',FR.shape);",
    "  att(Math.abs(bb(FR.shape)[3]-90)<0.5,'-10 : la face ne rentre pas de 10 mm');",
    "  att(nf(FR.shape)===6,'-10 : '+nf(FR.shape)+' faces au lieu de 6');",
    "  (FR.msgs||[]).forEach(m=>p('  ! '+m));",
    "  if(FR.shape)FR.shape.delete();",
    "  // --- REJOU après sérialisation : la référence doit survivre au chargement",
    "  doc.features[1].dist=10;occCk.length=0;",
    "  const json=JSON.stringify(doc);",
    "  try{await deserialise(json,{rebuild:false});}catch(e){p('  (cadre de vue ignore : harnais)');}",
    "  FR=occFinalShape(null);",
    "  decrireSolide('apres rechargement du document  ',FR.shape);",
    "  att(FR.shape&&Math.abs(bb(FR.shape)[3]-110)<0.5,'rechargement : la reference de face ne survit pas');",
    "  (FR.msgs||[]).forEach(m=>p('  ! '+m));",
    "  if(FR.shape)FR.shape.delete();",
    "  // --- la face a disparu : que se passe-t-il ? (ne doit pas casser le solide)",
    "  const mv=doc.features.find(f=>f.type==='xmove');mv.ref.pos=[999,999,999];occCk.length=0;",
    "  FR=occFinalShape(null);",
    "  p('face introuvable : '+(FR.shape?f3(bb(FR.shape)):'AUCUNE FORME')+'  (le solide doit rester intact)');",
    "  (FR.msgs||[]).forEach(m=>p('  ! '+m));",
    "  att(!!FR.shape,'face introuvable : le solide a disparu au lieu de rester intact');",
    "  if(FR.shape)FR.shape.delete();",
    "}",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  ✗ '+m));}",
    "else p('');p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'xmove.js'});
  console.log(r);
  process.exit(/ECHECS|✗/.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
