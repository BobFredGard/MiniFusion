// Suppression de faces (touche Suppr) sur noyau réel : les voisines se rejoignent.
// 1. boîte 100x60x40 congée R10 sur une arête verticale : congé supprimé → 6 faces,
//    volume de la boîte d'origine (arête vive retrouvée).
// 2. coin à 3 congés (surface de raccord non plane/non cylindrique) : la référence
//    générique retrouve la face et la suppression aboutit sans exception.
// 3. boîte percée d'un trou débouchant Ø10 : la face du trou supprimée → trou rebouché.
// 4. dessus d'une boîte simple : impossible à refermer → avertissement, solide inchangé.
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
  const body=[
    'const out={fails:[]};',
    'const A=(c,m)=>{if(!c)out.fails.push(m);};',
    'const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE,FA=occt.TopAbs_ShapeEnum.TopAbs_FACE,ED=occt.TopAbs_ShapeEnum.TopAbs_EDGE;',
    'const nFaces=s=>{let n=0;const x=new occt.TopExp_Explorer_2(s,FA,SH);while(x.More()){n++;x.Next();}x.delete();return n;};',
    'const vol=s=>{const p=new occt.GProp_GProps_1();occt.BRepGProp.VolumeProperties_1(s,p,false,false,false);const v=p.Mass();p.delete();return v;};',
    'const faces=s=>{const o=[];const x=new occt.TopExp_Explorer_2(s,FA,SH);while(x.More()){o.push(occt.TopoDS.Face_1(x.Current()));x.Next();}x.delete();return o;};',
    'const box=()=>new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),100,60,40).Shape();',
    // congé d'arêtes choisies par un prédicat sur leur boîte englobante
    'const fillet=(s,pred,r)=>{const fm=new occt.BRepFilletAPI_MakeFillet(s,occt.ChFi3d_FilletShape.ChFi3d_Rational);const x=new occt.TopExp_Explorer_2(s,ED,SH);',
    '  while(x.More()){const e=occt.TopoDS.Edge_1(x.Current());const b=new occt.Bnd_Box_1();occt.BRepBndLib.Add(e,b,true);const a=b.CornerMin(),z=b.CornerMax();',
    '  if(pred([a.X(),a.Y(),a.Z()],[z.X(),z.Y(),z.Z()]))fm.Add_2(r,e);b.delete();x.Next();}x.delete();return fm.Shape();};',
    'const refsOf=(s,pick)=>faces(s).filter(pick).map(f=>occFaceRefAny(f));',
    'const notPlane=f=>occSurfKind(f)!=="Plane";',
    // 1) congé vertical
    '{const s=fillet(box(),(a,z)=>z[2]-a[2]>39&&a[0]>99&&a[1]>59,10);',
    ' A(nFaces(s)===7,"1 : boîte congée = 7 faces ("+nFaces(s)+")");',
    ' const f={type:"xdelface",faces:refsOf(s,notPlane)};A(f.faces.length===1,"1 : une face de congé");',
    ' const r=occApplyDeleteFaces(s,f);out.w1=r.warnings;',
    ' A(!r.warnings.length,"1 : sans avertissement "+r.warnings.join(" | "));',
    ' A(nFaces(r.shape)===6,"1 : 6 faces après suppression ("+nFaces(r.shape)+")");',
    ' A(Math.abs(vol(r.shape)-240000)<1,"1 : volume de la boîte d’origine ("+vol(r.shape).toFixed(1)+")");}',
    // 2) coin à 3 congés
    '{const s=fillet(box(),(a,z)=>(a[0]>99||z[0]<1e-6?a[0]>99:false)&&a[1]>59||a[0]>99&&a[2]>39||a[1]>59&&a[2]>39,5);',
    ' const kinds=faces(s).map(occSurfKind);out.kinds=kinds.join(",");',
    ' const fr=refsOf(s,f=>{const k=occSurfKind(f);return k!=="Plane"&&k!=="Cylinder";});',
    ' A(fr.length>=1,"2 : surface de raccord du coin trouvée ("+out.kinds+")");',
    ' if(fr.length){const h=occFindFaceAny(s,fr[0]);A(!!h,"2 : référence générique retrouvée");if(h)h.delete();',
    '  const all=refsOf(s,notPlane);const n0=nFaces(s);const r=occApplyDeleteFaces(s,{faces:all});out.w2=r.warnings;out.f2=[n0,nFaces(r.shape)];',
    '  A(!r.fatal,"2 : suppression des congés du coin aboutie "+r.warnings.join(" | "));',
    '  A(nFaces(r.shape)===6,"2 : coin vif retrouvé ("+nFaces(r.shape)+" faces)");}}',
    // 3) trou débouchant
    '{const cyl=new occt.BRepPrimAPI_MakeCylinder_3(new occt.gp_Ax2_3(new occt.gp_Pnt_3(50,30,-1),occt.gp.DZ()),5,42).Shape();',
    ' const s=occCut(box(),cyl);A(nFaces(s)===7,"3 : boîte percée = 7 faces ("+nFaces(s)+")");',
    ' const r=occApplyDeleteFaces(s,{faces:refsOf(s,notPlane)});',
    ' A(nFaces(r.shape)===6,"3 : trou rebouché ("+nFaces(r.shape)+" faces)");',
    ' A(Math.abs(vol(r.shape)-240000)<1,"3 : volume plein ("+vol(r.shape).toFixed(1)+")");}',
    // 4) impossible
    '{const s=box();const f={faces:refsOf(s,x=>occFaceBox(x).pos[2]>39.9)};',
    ' let r=null,err=null;try{r=occApplyDeleteFaces(s,f);}catch(e){err=e;}',
    ' A(!err,"4 : aucune exception");A(r&&r.fatal&&r.warnings.length,"4 : refus signalé");',
    ' A(r&&nFaces(r.shape)===6,"4 : solide inchangé");A(f._m&&f._m.m===0,"4 : ⚠ dans l’arbre (_m.m=0)");}',
    // 5) rejeu de l'historique : coin arrondi d'esquisse supprimé, puis hauteur changée en amont
    '{const sk={id:"s",name:"s",plane:"XY",origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{a:{x:0,y:0},b:{x:40,y:0},c:{x:40,y:20},cc:{x:30,y:20},d:{x:30,y:30},e:{x:0,y:30}},',
    ' entities:[{id:"l1",t:"line",p1:"a",p2:"b"},{id:"l2",t:"line",p1:"b",p2:"c"},{id:"ar",t:"arc",pc:"cc",pa:"c",pb:"d",r:10},{id:"l3",t:"line",p1:"d",p2:"e"},{id:"l4",t:"line",p1:"e",p2:"a"}],constraints:[],dims:[],seq:9,visible:false};',
    ' doc.sketches=[sk];doc.features=[{id:"F",type:"extrude",name:"P",sketchId:"s",distance:20,op:"add",visible:true}];doc.bodies=[];markDirty();rebuild();',
    ' const ref=refsOf(occLive.shape,notPlane)[0];A(!!ref,"5 : face arrondie repérée");',
    ' doc.features.push({id:"D",type:"xdelface",name:"S",faces:[ref],body:doc.features[0].body,visible:true});markDirty();rebuild();',
    ' A(nFaces(occLive.shape)===6,"5 : rejeu : coin vif ("+nFaces(occLive.shape)+" faces)");',
    ' for(const h of [35,8]){doc.features[0].distance=h;markDirty();rebuild();',
    '  A(nFaces(occLive.shape)===6&&doc.features[1]._m.m===1,"5 : hauteur "+h+" : la face suit ("+nFaces(occLive.shape)+" faces, "+JSON.stringify(doc.features[1]._m)+")");',
    '  A(Math.abs(vol(occLive.shape)-1200*h)<1,"5 : hauteur "+h+" : volume plein ("+vol(occLive.shape).toFixed(1)+")");}}',
    // signature : les faces visées entrent dans featSig
    '{const a=featSig({type:"xdelface",faces:[{pos:[1,2,3],dim:[1,1,1],st:"Torus"}]}),b=featSig({type:"xdelface",faces:[{pos:[1,2,4],dim:[1,1,1],st:"Torus"}]});A(a!==b,"signature : dépend des faces");}',
    'return out;'
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx,{filename:'suppression_face.cjs'});
  console.log('coin : types',o.kinds,'| faces avant/après',o.f2,'| avert.',o.w2);
  if(o.fails&&o.fails.length){console.log('ECHECS :');o.fails.forEach(m=>console.log('  x '+m));process.exit(1);}
  console.log('TOUT EST CONFORME');
  process.exit(0);
})().catch(e=>{console.log('FATAL/FAIL',String((e&&e.stack)||e).slice(0,900));process.exit(1);});
