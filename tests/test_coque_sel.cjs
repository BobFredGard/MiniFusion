// Coque : on doit VOIR quelle surface part — chargement validé + aperçu, sur noyau réel.
// 1. coqueCleanRef : valide acceptée, dim/pos manquants et null refusés, copie profonde.
// 2. boîte 100x60x40 moins son dessus, paroi 2 : solide ouvert valide, plus de faces
//    qu'avant (parois internes + rebord), aucune exception — c'est le calcul de l'aperçu.
// Les couleurs/panneau sont du DOM+THREE (non testables ici), comme pour la dépouille.
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
    'const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;',
    // 1) chargement validé
    'A(coqueCleanRef({pos:[1,2,3],n:[0,0,1],dim:[10,10,0]})!==null,"cleanRef : ref valide acceptée");',
    'A(coqueCleanRef({pos:[1,2,3],n:[0,0,1],dim:[10,10,0]})._ord===-1,"cleanRef : _ord initialisé à -1");',
    'A(coqueCleanRef({pos:[1,2,3],n:[0,0,1]})===null,"cleanRef : dim manquant refusé (occFindFace lèverait)");',
    'A(coqueCleanRef({pos:[1,2],n:[0,0,1],dim:[1,1,0]})===null,"cleanRef : pos trop court refusé");',
    'A(coqueCleanRef(null)===null,"cleanRef : null refusé");',
    '{const src={pos:[1,2,3],n:[0,0,1],dim:[10,10,0]};const cp2=coqueCleanRef(src);cp2.pos[0]=999;',
    'A(src.pos[0]===1,"cleanRef : copie profonde, pas d\u2019alias sur le document");}',
    // 2) calcul d'aperçu : boîte moins son dessus, paroi 2
    'const mk=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),100,60,40);',
    'const box=mk.Shape();',
    'const refs={};{const ex=new occt.TopExp_Explorer_2(box,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);let i=0;while(ex.More()){try{const f=occt.TopoDS.Face_1(ex.Current());const r=occFaceRef(f);if(r)refs[i]=r;try{f.delete();}catch(e){}}catch(e){}i++;ex.Next();}try{ex.delete();}catch(e){}}',
    'const topOrd=Object.keys(refs).find(k=>refs[k].pos[2]>39.9);',
    'A(topOrd!==undefined,"dessus repéré pour l\u2019ouverture");',
    'const got=[];',
    'if(topOrd!==undefined){try{const h=occFindFace(box,refs[topOrd]);if(h)got.push(h);}catch(e){}}',
    'A(got.length===1,"ouverture résolue : "+got.length);',
    'let prev=null,prevErr=null;',
    'try{const r=occCoqueOnce(box,got,2);prev=r.shape;}catch(e){prevErr=String((e&&e.message)||e).slice(0,120);}',
    'got.forEach(g=>{try{g.delete();}catch(e){}});',
    'A(!prevErr,"aperçu : calcul sans exception"+(prevErr?" ("+prevErr+")":""));',
    'A(!!prev,"aperçu : solide évidé produit");',
    'if(prev){let nf=0,ne=0;',
    'try{const a=new occt.TopExp_Explorer_2(prev,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);while(a.More()){nf++;a.Next();}a.delete();}catch(e){}',
    'try{ne=occListEdges(prev).length;}catch(e){}',
    'out.facesApercu=nf;out.aretesApercu=ne;',
    'A(nf>6,"aperçu : coque ouverte = parois internes en plus ("+nf+" faces)");',
    'A(ne>0,"aperçu : solide avec des arêtes ("+ne+")");',
    'try{prev.delete();}catch(e){}}',
    'try{box.delete();}catch(e){}try{mk.delete();}catch(e){}',
    'return out;'
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx,{filename:'coque_sel.cjs'});
  console.log('faces apercu      :',o.facesApercu,' | aretes :',o.aretesApercu);
  if(o.fails&&o.fails.length){console.log('ECHECS :');o.fails.forEach(m=>console.log('  x '+m));process.exit(1);}
  console.log('TOUT EST CONFORME');
  process.exit(0);
})().catch(e=>{console.log('FATAL/FAIL',String((e&&e.message)||e).slice(0,600));process.exit(1);});
