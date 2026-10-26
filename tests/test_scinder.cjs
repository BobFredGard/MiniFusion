// V0.11.5 : SCINDER par un plan — faces (le solide reste entier, faces coupées) ou corps
// (deux corps, le second rejoue le corps source jusqu'à la scission). Noyau OCCT réel.
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
    "const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};const near=(a,b,t)=>Math.abs(a-b)<(t||1e-3);",
    "const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE,FA=occt.TopAbs_ShapeEnum.TopAbs_FACE,SO=occt.TopAbs_ShapeEnum.TopAbs_SOLID;",
    "const cnt=(s,t)=>{let n=0;const x=new occt.TopExp_Explorer_2(s,t,SH);while(x.More()){n++;x.Next();}x.delete();return n;};",
    "const vol=s=>{const p=new occt.GProp_GProps_1();occt.BRepGProp.VolumeProperties_1(s,p,false,false,false);const v=p.Mass();p.delete();return v;};",
    "const faces=s=>{const o=[];const x=new occt.TopExp_Explorer_2(s,FA,SH);while(x.More()){o.push(occt.TopoDS.Face_1(x.Current()));x.Next();}x.delete();return o;};",
    // bloc 40 x 40 x 20 centré sur l'origine (X, Y de -20 à 20)
    "const box={id:'skA',name:'Bloc',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{a:{x:-20,y:-20},b:{x:20,y:-20},c:{x:20,y:20},d:{x:-20,y:20}},",
    "  entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],constraints:[],dims:[],seq:20,visible:false};",
    "doc.sketches=[box];doc.features=[];doc.bodies=[];delete doc.activeBody;ensureBodies();const B1=doc.bodies[0].id;",
    "doc.features.push({id:'F1',type:'extrude',name:'Bloc',sketchId:'skA',distance:20,op:'add',visible:true,body:B1});",
    "markDirty();rebuild();A(builtEngine==='exact'&&cnt(occLive.shape,FA)===6,'0 : bloc exact, 6 faces');",
    // 1) plan résolu
    "{const P=splitPlaneOf({pl:{src:'YZ'},off:5});A(near(P.o[0],5)&&near(P.n[0],1),'1 : plan YZ décalé de 5 → X=5, normale +X');",
    " const Q=splitPlaneOf({pl:{src:'face',o:[0,0,20],n:[0,0,2]},off:-3,flip:true});A(near(Q.o[2],17)&&near(Q.n[2],-1),'1 : face figée, décalage −3, inversé');}",
    // 2) faces : le dessus scindé par YZ
    "{const top=faces(occLive.shape).map(f=>occFaceRefAny(f)).filter(r=>r&&r.pos[2]>19.9);A(top.length===1,'2 : face du dessus repérée');",
    " const f={id:'S1',type:'xsplit',name:'',mode:'face',faces:top,pl:{src:'YZ'},off:0,visible:true,body:B1};f.name=splitName(f);doc.features.push(f);markDirty();rebuild();",
    " A(cnt(occLive.shape,FA)===7&&cnt(occLive.shape,SO)===1,'2 : FACES : dessus coupé en deux, un seul solide (7 faces, '+cnt(occLive.shape,FA)+')');",
    " A(near(vol(occLive.shape),32000,1),'2 : volume inchangé ('+vol(occLive.shape).toFixed(1)+')');A(f._m&&f._m.m===1&&!f._err,'2 : face retrouvée, sans erreur');",
    // hauteur changée en amont : la face suit
    " doc.features[0].distance=30;markDirty();rebuild();A(cnt(occLive.shape,FA)===7&&near(vol(occLive.shape),48000,1),'2 : hauteur 30 : la scission suit ('+cnt(occLive.shape,FA)+' faces)');",
    // plan qui ne coupe pas
    " f.off=50;markDirty();rebuild();A(cnt(occLive.shape,FA)===6&&f._m.m===0,'2 : plan hors de la face → solide inchangé, ⚠ ('+JSON.stringify(f._m)+')');",
    " doc.features=doc.features.filter(x=>x!==f);doc.features[0].distance=20;markDirty();rebuild();}",
    // 3) corps : coupe à X=5
    "{const nb0=doc.bodies.length;splitMode={mode:'body',faces:[],body:B1,pl:{src:'YZ'},off:5,flip:false,editing:null};splitApply();",
    " const f=doc.features.find(x=>x.type==='xsplit');A(f&&f.mode==='body'&&f.newBody&&doc.bodies.length===nb0+1,'3 : CORPS : fonction créée avec un corps neuf');",
    " let FR=occFinalShape(null);const vs=FR.perBody.map(p=>({b:p.bodyId,v:vol(p.shape)}));occCleanup(FR,null);",
    " A(vs.length===2&&near(vs.find(x=>x.b===B1).v,25*40*20,1)&&near(vs.find(x=>x.b===f.newBody).v,15*40*20,1),'3 : 2 corps : 25 mm côté −X dans le corps d’origine, 15 mm côté +X dans le neuf ('+JSON.stringify(vs.map(x=>x.v.toFixed(0)))+')');",
    // inverser
    " f.flip=true;markDirty();rebuild();FR=occFinalShape(null);const w=FR.perBody.map(p=>({b:p.bodyId,v:vol(p.shape)}));occCleanup(FR,null);",
    " A(near(w.find(x=>x.b===B1).v,15*40*20,1)&&near(w.find(x=>x.b===f.newBody).v,25*40*20,1),'3 : Inverser échange les côtés');f.flip=false;",
    // modification en amont : le corps neuf suit
    " doc.features[0].distance=10;markDirty();rebuild();FR=occFinalShape(null);const z=FR.perBody.map(p=>({b:p.bodyId,v:vol(p.shape)}));occCleanup(FR,null);",
    " A(near(z.find(x=>x.b===f.newBody).v,15*40*10,1),'3 : hauteur 10 en amont : le corps neuf suit ('+z.map(x=>x.v.toFixed(0)).join(' / ')+')');",
    // une fonction dans le corps neuf : découpe du corps neuf seul
    " doc.features.push({id:'D1',type:'xdelface',name:'x',faces:[],body:f.newBody,visible:true});",
    " const c={id:'CB',type:'combine',name:'',body:B1,tools:[f.newBody],mode:'union',keep:false,visible:true};c.name=combineName(c);doc.features.push(c);markDirty();rebuild();",
    " FR=occFinalShape(null);A(FR.perBody.length===1&&near(vol(FR.perBody[0].shape),40*40*10,1),'3 : le corps neuf se recombine (union → bloc entier)');occCleanup(FR,null);",
    " doc.features=doc.features.filter(x=>x.id!=='CB'&&x.id!=='D1');",
    // plan hors du corps : tout reste dans le corps d'origine
    " f.off=100;markDirty();rebuild();FR=occFinalShape(null);A(FR.perBody.length===1&&FR.perBody[0].bodyId===B1&&f._m.m===0,'3 : plan hors du corps → corps d’origine entier, ⚠');occCleanup(FR,null);f.off=5;",
    // signature
    " const a=featSig(f);f.off=6;A(a!==featSig(f),'4 : signature : dépend du plan');f.off=5;",
    // suppression : le corps neuf vide part avec la fonction
    " const nb=f.newBody;delFeature(f);A(!doc.bodies.some(b=>b.id===nb),'5 : supprimer la scission retire le corps neuf vide');}",
    // 7) congé scindé : l'arête de coupe entre les deux moitiés (tangentes) est tracée NOIRE
    "{const ED=occt.TopAbs_ShapeEnum.TopAbs_EDGE;const bx=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),100,60,40).Shape();",
    " const fm=new occt.BRepFilletAPI_MakeFillet(bx,occt.ChFi3d_FilletShape.ChFi3d_Rational);const x=new occt.TopExp_Explorer_2(bx,ED,SH);",
    " while(x.More()){const e=occt.TopoDS.Edge_1(x.Current());const b=new occt.Bnd_Box_1();occt.BRepBndLib.Add(e,b,true);const a=b.CornerMin(),z=b.CornerMax();if(z.Z()-a.Z()>39&&a.X()>99&&a.Y()>59)fm.Add_2(10,e);x.Next();}",
    " const s=fm.Shape();const cg=faces(s).map(f=>occFaceRefAny(f)).filter(r=>r.st==='Cylinder');A(cg.length===1,'7 : face du congé repérée');",
    " const f={id:'S7',type:'xsplit',name:'',mode:'face',faces:cg,pl:{src:'XY'},off:20,visible:true,body:B1};",
    " const r=occApplySplit(s,f,'neg');A(!r.fatal&&cnt(r.shape,FA)===8,'7 : congé coupé en deux ('+cnt(r.shape,FA)+' faces)');",
    " const mi=E=>E.filter(e=>Math.abs(e.mid[2]-20)<1e-3&&e.mid[0]>90&&e.mid[1]>50);",
    " doc.features.push(f);let E=mi(occSharpEdges(r.shape));A(E.length===1&&E[0].sharp&&E[0].split,'7 : arête de coupe du congé NOIRE ('+JSON.stringify(E.map(e=>[e.sharp,e.split]))+')');",
    " f.visible=false;E=mi(occSharpEdges(r.shape));A(E.length===0||!E[0].sharp,'7 : sans la scission active, la jonction des deux moitiés n’est pas tracée en noir (ancien comportement : masquée)');",
    " doc.features=doc.features.filter(q=>q!==f);}",
    "{const f={type:'xsplit',mode:'body',pl:{src:'XY'},off:0};A(/Scinder/.test(splitName(f))&&featIconOf(Object.assign({},f))==='✂','6 : nom « '+splitName(f)+' » et icône');}",
    "return out;"
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== V0.11.5 : Scinder (faces / corps) ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
