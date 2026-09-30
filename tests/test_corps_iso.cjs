// Corps vrais conteneurs (vrai noyau OCCT) : le rejeu est ISOLÉ par corps.
// Preuves : une découpe du corps A ne touche pas le corps B ; deux corps aux
// signatures identiques ne partagent pas leurs points de contrôle ; occLive voit
// l'ensemble (composé) ; chaque perBody porte l'id de SON corps.
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
    "const nsol=function(sh){let n=0;const ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_SOLID,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);while(ex.More()){n++;ex.Next();}ex.delete();return n;};",
    // carré w×h en (x0,y0)
    "const mkSq=function(id,x0,y0,w,h){const sk={id:id,name:'C',plane:'XY',origin:[0,0,0],points:{},entities:[],constraints:[],dims:[]};",
    "  [['p0',x0,y0],['p1',x0+w,y0],['p2',x0+w,y0+h],['p3',x0,y0+h]].forEach(q=>{sk.points[q[0]]={x:q[1],y:q[2]};});",
    "  sk.entities.push({id:id+'e0',t:'line',p1:'p0',p2:'p1'},{id:id+'e1',t:'line',p1:'p1',p2:'p2'},{id:id+'e2',t:'line',p1:'p2',p2:'p3'},{id:id+'e3',t:'line',p1:'p3',p2:'p0'});return sk;};",
    // --- deux blocs IDENTIQUES (mêmes cotes) dans 2 corps : les checkpoints ne
    //     doivent pas se partager (sinon B hériterait du solide de A, mal placé)
    "doc.sketches=[mkSq('skA',0,0,100,60),mkSq('skB',200,0,100,60)];",
    "doc.bodies=[{id:'b1',name:'Corps 1',c:null},{id:'b2',name:'Corps 2',c:null}];",
    "doc.bodySeq=3;doc.activeBody='b1';",
    "doc.features=[",
    "  {id:'exA',type:'extrude',name:'Bloc A',sketchId:'skA',op:'add',distance:40,body:'b1'},",
    "  {id:'exB',type:'extrude',name:'Bloc B',sketchId:'skB',op:'add',distance:40,body:'b2'}];",
    "occSkipFeat=null;occCk.length=0;",
    "let FR=occFinalShape(null);",
    "att(FR.perBody.length===2,'2 corps rejoués (vu '+FR.perBody.length+')');",
    "att(FR.perBody[0].bodyId==='b1'&&FR.perBody[1].bodyId==='b2','perBody porte les ids (vu '+FR.perBody.map(q=>q.bodyId).join(',')+')');",
    "const bA=bb(FR.perBody[0].shape),bB=bb(FR.perBody[1].shape);",
    "p('A : '+bA.map(v=>v.toFixed(1)).join('/')+'  faces='+nf(FR.perBody[0].shape));",
    "p('B : '+bB.map(v=>v.toFixed(1)).join('/')+'  faces='+nf(FR.perBody[1].shape));",
    "att(Math.abs(bA[0]-0)<0.5&&Math.abs(bA[3]-100)<0.5,'A bien placé en x 0..100');",
    "att(Math.abs(bB[0]-200)<0.5&&Math.abs(bB[3]-300)<0.5,'B bien placé en x 200..300 (pas le solide de A)');",
    "att(nf(FR.perBody[0].shape)===6&&nf(FR.perBody[1].shape)===6,'6 faces chacun');",
    "att(FR.shape&&nsol(FR.shape)===2,'occLive : composé de 2 solides');",
    // --- découpe DANS A SEULEMENT (poche intérieure 40×40) : B inchangé
    "doc.sketches.push(mkSq('skC',10,10,40,40));",
    "doc.features.push({id:'cuA',type:'extrude',name:'Poche A',sketchId:'skC',op:'cut',distance:40,body:'b1'});",
    "occCk.length=0;",
    "FR=occFinalShape(null);",
    "const fA=nf(FR.perBody[0].shape),fB=nf(FR.perBody[1].shape);",
    "const qB=bb(FR.perBody[1].shape);",
    "p('après poche en A : A faces='+fA+'  B faces='+fB+'  B x '+qB[0].toFixed(1)+'..'+qB[3].toFixed(1));",
    "att(fA>6,'A évidé : '+fA+' faces (> 6)');",
    "att(fB===6,'B intact : 6 faces (découpe isolée)');",
    "att(Math.abs(qB[0]-200)<0.5&&Math.abs(qB[3]-300)<0.5,'B non déplacé');",
    // --- undo : le document taggé survit à l'instantané
    "const snap=docSnap();",
    "att(snap.indexOf('\"body\":\"b2\"')>=0,'undo : tags corps dans l instantané');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  x '+m));}",
    "else p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'corps_iso.js'});
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
