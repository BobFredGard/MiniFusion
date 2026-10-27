// Découpe dont le fond tombe pile dans le plan d'une face existante (Exemples/test suppr) :
// le fond ne doit plus rester une « mini surface » à part (occUnifyCutSeams).
// 1. bloc 50x40x20 + bossage, encoche sous le bossage jusqu'à Z=20 → fond recollé au dessus.
// 2. couture d'OUTIL (profil scindé en un point, cf. test_conge_fond_poche) : gardée.
// 3. couture du solide d'AVANT (face déjà scindée) : gardée.
// 4. rejeu complet : découpe d'esquisse XY dont le fond coïncide → même résultat.
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
    'const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE,FA=occt.TopAbs_ShapeEnum.TopAbs_FACE;',
    'const B=(x0,y0,z0,x1,y1,z1)=>new occt.BRepPrimAPI_MakeBox_3(new occt.gp_Pnt_3(x0,y0,z0),new occt.gp_Pnt_3(x1,y1,z1)).Shape();',
    'const faces=s=>{const o=[];const x=new occt.TopExp_Explorer_2(s,FA,SH);while(x.More()){o.push(occt.TopoDS.Face_1(x.Current()));x.Next();}x.delete();return o;};',
    'const vol=s=>{const p=new occt.GProp_GProps_1();occt.BRepGProp.VolumeProperties_1(s,p,false,false,false);const v=p.Mass();p.delete();return v;};',
    // faces horizontales vers le haut à la cote z
    'const atZ=(s,z)=>faces(s).filter(f=>{const b=occFaceBox(f),n=occFaceOutNormal(f);return n&&n[2]>0.99&&Math.abs(b.pos[2]-z)<1e-6;});',
    'const cutU=(a,t)=>occUnifyCutSeams(occCut(a,t),a,t);',
    // 1) encoche sous un bossage (test suppr)
    '{const s=occUnify(occFuse(B(-25,-20,0,25,20,20),B(-20,8.5,20,-11,15,26)));',
    ' const raw=occCut(s,B(-20,8.5,20,-13.9,15,24));',
    ' A(atZ(raw,20).length===2,"1 : sans recollage, le fond de l’encoche est à part ("+atZ(raw,20).length+")");',
    ' const r=cutU(s,B(-20,8.5,20,-13.9,15,24));',
    ' A(atZ(r,20).length===1,"1 : fond recollé au dessus du bloc ("+atZ(r,20).length+" face(s) à Z=20)");',
    ' A(faces(r).length===13,"1 : 13 faces ("+faces(r).length+")");',
    ' A(Math.abs(vol(r)-vol(raw))<1e-6,"1 : volume inchangé");}',
    // 2) couture d'outil : profil en deux régions jointives, fond de poche scindé en x=30
    '{const tool=occFuse(B(10,10,30,30,50,41),B(30,10,30,50,50,41));',
    ' const r=cutU(B(0,0,0,100,60,40),tool);',
    ' A(atZ(r,30).length===2,"2 : couture d’esquisse du fond gardée ("+atZ(r,30).length+")");}',
    // 3) couture du solide d’avant : dessus scindé en x=50, découpe ailleurs
    '{const prev=occFuse(B(0,0,0,50,60,40),B(50,0,0,100,60,40));',
    ' const n0=atZ(prev,40).length;',
    ' const r=cutU(prev,B(60,20,30,80,40,41));',
    ' A(n0===2&&atZ(r,40).length===2,"3 : dessus scindé gardé ("+n0+" → "+atZ(r,40).length+")");}',
    // 4) rejeu : bloc + bossage + découpe XY décalée à Z=20 qui coïncide avec le dessus
    '{const rect=(id,x0,y0,x1,y1,o)=>({id,name:id,plane:"XY",origin:[0,0,o],points:{a:{x:x0,y:y0},b:{x:x1,y:y0},c:{x:x1,y:y1},d:{x:x0,y:y1}},',
    '   entities:[{id:"l1",t:"line",p1:"a",p2:"b"},{id:"l2",t:"line",p1:"b",p2:"c"},{id:"l3",t:"line",p1:"c",p2:"d"},{id:"l4",t:"line",p1:"d",p2:"a"}],constraints:[],dims:[],seq:9,visible:false});',
    ' doc.sketches=[rect("s1",-25,-20,25,20,0),rect("s2",-20,8.5,-11,15,20),rect("s3",-20,8.5,-13.9,15,24)];',
    ' doc.features=[{id:"F1",type:"extrude",name:"Bloc",sketchId:"s1",distance:20,op:"add",visible:true},',
    '  {id:"F2",type:"extrude",name:"Bossage",sketchId:"s2",distance:6,op:"add",visible:true},',
    '  {id:"F3",type:"extrude",name:"Encoche",sketchId:"s3",distance:-4,op:"cut",visible:true}];',
    ' doc.bodies=[];occCkClear();markDirty();rebuild();',
    ' const s=occLive&&occLive.shape;A(!!s,"4 : solide reconstruit");',
    ' if(s){A(atZ(s,20).length===1,"4 : rejeu : une seule face à Z=20 ("+atZ(s,20).length+")");',
    '  A(faces(s).length===13,"4 : rejeu : 13 faces ("+faces(s).length+")");}}',
    'return out;'
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx,{filename:'decoupe_coplanaire.cjs'});
  if(o.fails&&o.fails.length){console.log('ECHECS :');o.fails.forEach(m=>console.log('  x '+m));process.exit(1);}
  console.log('TOUT EST CONFORME');
  process.exit(0);
})().catch(e=>{console.log('FATAL/FAIL',String((e&&e.stack)||e).slice(0,900));process.exit(1);});
