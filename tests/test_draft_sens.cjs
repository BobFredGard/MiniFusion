// V0.11.19 : dépouille à ANGLE SIGNÉ + INVERSION du sens (idée SolidCraft `solid.draft` : angle
// entre −90° et 90°). Noyau réel, par le DOCUMENT (fonction xdraft rejouée). Boîte 40×30×20,
// plan neutre = dessus (normale +Z), face dépouillée = mur x=40.
//   angle +5° : la pièce se RESSERRE le long de +Z — sous le plan neutre (vers −Z) elle s'évase :
//               volume 24000 + 30 × (½ · 20 · 20·tan 5°) = 24524,93
//   angle −5°, ou +5° inversé : le mur rentre sous le neutre → 23475,07
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
    "const sk={id:'s',name:'s',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{a:{x:0,y:0},b:{x:40,y:0},c:{x:40,y:30},d:{x:0,y:30}},",
    "  entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],constraints:[],dims:[],seq:9,visible:false};",
    "doc.sketches=[sk];doc.features=[{id:'F',type:'extrude',name:'P',sketchId:'s',distance:20,op:'add',visible:true}];doc.bodies=[];markDirty();rebuild();",
    "const vol=sh=>{const G=new occt.GProp_GProps_1();occt.BRepGProp.VolumeProperties_1(sh,G,false,false,false);const v=G.Mass();try{G.delete();}catch(e){}return v;};",
    "const near=(a,b,t)=>Math.abs(a-b)<=t;",
    // références durables du dessus et du mur x=40, lues sur le solide exact
    "const refs=[];{const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;const ex=new occt.TopExp_Explorer_2(occLive.shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);",
    " while(ex.More()){try{const f=occt.TopoDS.Face_1(ex.Current());const r=occFaceRef(f);if(r)refs.push(r);try{f.delete();}catch(e){}}catch(e){}ex.Next();}try{ex.delete();}catch(e){}}",
    "const top=refs.find(r=>near(r.pos[2],20,1e-3)&&r.n[2]>0.99),wall=refs.find(r=>near(r.pos[0],40,1e-3)&&r.n[0]>0.99);",
    "A(!!top&&!!wall,'0 : dessus et mur x=40 repérés ('+refs.length+' faces)');",
    "const clean=r=>({pos:r.pos.slice(),dim:r.dim.slice(),n:r.n.slice()});",
    "const dr={id:'D',type:'xdraft',name:'d',ref:clean(top),faces:[clean(wall)],angle:5,visible:true};",
    "doc.features.push(dr);",
    "const final=()=>{freshHard=true;occCkClear();markDirty();rebuild();const FR=occFinalShape(null);const sh=FR.perBody[0].shape;const r={v:vol(sh),m:dr._m?dr._m.m+'/'+dr._m.t:'?',msgs:(FR.msgs||[]).filter(s=>/impossible|introuvable/i.test(s))};occCleanup(FR,null);return r;};",
    "const T=0.5*20*20*Math.tan(5*Math.PI/180)*30;",
    "const p=final();",
    "A(near(p.v,24000+T,0.05)&&p.m==='1/1'&&!p.msgs.length,'1 : +5° : la pièce s\\u2019évase sous le neutre, volume '+(24000+T).toFixed(2)+' ('+p.v.toFixed(2)+', '+p.m+')');",
    "A(draftName(dr)==='Dépouillage 5° · 1 face(s)','1 : nom « Dépouillage 5° · 1 face(s) » ('+draftName(dr)+')');",
    "const sig1=featSig(dr);",
    "dr.angle=-5;const n=final();",
    "A(near(n.v,24000-T,0.05)&&n.m==='1/1'&&!n.msgs.length,'2 : −5° : le mur rentre sous le neutre, volume '+(24000-T).toFixed(2)+' ('+n.v.toFixed(2)+')');",
    "A(draftName(dr)==='Dépouillage −5° · 1 face(s)','2 : nom « Dépouillage −5° · 1 face(s) » ('+draftName(dr)+')');",
    "A(featSig(dr)!==sig1,'2 : signature de rejeu distincte de +5°');",
    "dr.angle=5;dr.flip=true;const f=final();",
    "A(near(f.v,24000-T,0.05)&&f.m==='1/1','3 : +5° inversé (flip) = −5° : volume '+(24000-T).toFixed(2)+' ('+f.v.toFixed(2)+')');",
    "A(draftAngleEff(dr)===-5&&draftName(dr)==='Dépouillage −5° · 1 face(s)','3 : angle effectif −5, nom signé');",
    "A(featSig(dr)!==sig1,'3 : flip change la signature (cache non réutilisé)');",
    "dr.angle=-5;dr.flip=true;const ff=final();",
    "A(near(ff.v,24000+T,0.05),'4 : −5° inversé = +5° : volume '+(24000+T).toFixed(2)+' ('+ff.v.toFixed(2)+')');",
    "A(draftAngleOk(5)&&draftAngleOk(-5)&&draftAngleOk(89.9)&&!draftAngleOk(0)&&!draftAngleOk(90)&&!draftAngleOk(-90)&&!draftAngleOk(NaN),'5 : draftAngleOk : ]−90 ; 90[ sans 0');",
    "A(draftAngleEff({angle:5})===5&&draftAngleEff({angle:5,flip:true})===-5&&draftAngleEff({angle:-3,flip:true})===3&&draftAngleEff({})===0,'5 : draftAngleEff : flip × angle');",
    "return out;"
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== V0.11.19 : dépouille à angle signé + inversion ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
