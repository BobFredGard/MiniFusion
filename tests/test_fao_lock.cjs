// 2026-10-01q : « FAO blindée » — l'outillage reçoit la géométrie D'AUJOURD'HUI.
// La phase 3 a affiné l'affichage (occDisplayDefl + budget) et 88-fao lit les
// positions du mesh affiché pour son maillage plan de posage. Sans intervention :
//   • autre triangulation ⇒ autre G-code (l'historique FAO ne serait pas reproductible) ;
//   • plus de 120 000 triangles ⇒ faoMeshFromBody renvoie null ⇒ corps EXCLU du posage.
// Corrigé par le wrapper de fin de 90-picking-mesure-import.js :
//   • corps exact  → re-tessellation avec occXDefl() (référence outillage, dynamique
//     avec les congés) après BRepTools.Clean (BRepMesh réutilise un maillage plus fin) ;
//   • import STEP  → entry.faoGeo posé à l'import en 0,5 mm/0,5 rad AVANT la finesse
//     d'affichage (le noyau ne retesselle jamais vers plus grossier).
// Le verrou est mesuré sur le NOYAU : nombre de triangles du shape après le passage
// de la FAO, comparé à une référence indépendante tesselée en 0,5/0,5.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  ✗ '+m);}else console.log('  ✓ '+m);};
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox,loadErr}=loadApp();
  if(loadErr)console.log('  (harnais : buildScene interrompu — comportement normal du stub)');
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};window.confirm=function(){return true;};',ctx);

  // STEP de test : boîte 100×60×40 avec congé R4 (mêmes données que test_aretes_import)
  sandbox.__step=vm.runInContext(`(function(){
    const mk=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),100,60,40);
    const box=mk.Shape();
    const E=occListEdges(box);
    let cible=null;
    for(let i=0;i<E.length;i++){
      const a=E[i].pts[0],b=E[i].pts[E[i].pts.length-1];
      const L=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);
      if(L>4&&Math.abs(b[2]-a[2])>Math.hypot(b[0]-a[0],b[1]-a[1])){cible=E[i];break;}
    }
    const pf=cible?xPreviewShape(box,[{src:cible.src,r:4,mid:cible.mid}],false):null;
    const sh=(pf&&pf.shape)?pf.shape:box;
    const b=occWriteStep([sh],'/__b.stp');
    if(pf&&pf.shape){try{pf.shape.delete();}catch(e){}}
    try{box.delete();}catch(e){}try{mk.delete();}catch(e){}
    return b?Uint8Array.from(b).buffer:null;
  })()`,ctx);
  if(!sandbox.__step){console.log('  ✗ STEP de test impossible à produire');process.exit(1);}

  const o=await vm.runInContext(`(async function(){
    const out={};
    if(typeof faoMeshFromBody!=='function')return{err:'faoMeshFromBody absent'};
    if(typeof _faoMeshFromBodyOrig!=='function')return{err:'ancêtre FAO non capturé (wrapper absent)'};
    if(typeof faoLegacyGeo!=='function')return{err:'faoLegacyGeo absente'};

    const nbTris=(sh)=>{
      let n=0;const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
      const ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);
      while(ex.More()){
        const f=occt.TopoDS.Face_1(ex.Current());const loc=new occt.TopLoc_Location_1();
        try{const h=occt.BRep_Tool.Triangulation(f,loc);if(h&&!h.IsNull())n+=h.get().NbTriangles();}catch(e){}
        try{loc.delete();}catch(e){}
        ex.Next();
      }
      try{ex.delete();}catch(e){}
      return n;
    };

    // ── 1. référence indépendante : la même pièce, dans l'ordre des passages ──
    const ref=new occt.BRepPrimAPI_MakeCylinder_1(30,40).Shape();
    occTessellate(ref,0.5,0.5);                // définition historique de la FAO
    out.refFao=nbTris(ref);                    // ce que la FAO voit AUJOURD'HUI
    occTessellate(ref,occDisplayDefl(ref).lin,occDisplayDefl(ref).ang);
    out.refAffichage=nbTris(ref);              // ce que l'affichage (phase 3) produit
    try{
      occt.BRepTools.Clean(ref);               // sans ça, BRepMesh réutilise le fin
      occTessellate(ref,0.5,0.5);
      out.refApresClean=nbTris(ref);
    }catch(e){out.refErr=e.message;}
    try{ref.delete();}catch(e){}

    // ── 2. corps exact dont le shape est déjà maillé EN AFFICHAGE (plus fin) ──
    const mk=new occt.BRepPrimAPI_MakeCylinder_1(30,40);
    const cy=mk.Shape();
    const D=occDisplayDefl(cy);
    occTessellate(cy,D.lin,D.ang);
    out.avantFao=nbTris(cy);                   // maillage fin laissé par l'affichage

    const _bodies=bodies.slice();
    const b={id:'F1',name:'Corps FAO',kind:'body',ref:null,visible:true,shape:cy,
             mesh:{matrixWorld:null,geometry:{}}};
    bodies.push(b);
    const x0=occXDefl();
    const rec=[];const _o=occTessellate;
    occTessellate=function(s,lin,ang){rec.push([lin,ang]);return _o(s,lin,ang);};
    let mm=null;try{mm=faoMeshFromBody(b);}finally{occTessellate=_o;}
    out.params=rec[0]||null;
    out.nbAppels=rec.length;
    out.apresFao=nbTris(cy);                   // ← LE VERROU
    out.cache=!!b._faoGeo;
    out.xDefl=x0;

    const rec2=[];occTessellate=function(s,lin,ang){rec2.push(1);return _o(s,lin,ang);};
    try{faoMeshFromBody(b);}finally{occTessellate=_o;}
    out.appelsCache=rec2.length;

    // ── 3. avec un congé : occXDefl() change, la FAO doit suivre (référence vivante) ──
    const mk2=new occt.BRepPrimAPI_MakeCylinder_1(20,30).Shape();
    doc.features.push({id:'XF',type:'xfillet',name:'Congé',target:'E1',chamfer:false,
      edges:[{pos:[0,0,0],r:2,len:10}],visible:true});
    const b2={id:'F2',name:'Corps 2',kind:'body',ref:null,visible:true,shape:mk2,
              mesh:{matrixWorld:null,geometry:{}}};
    bodies.push(b2);
    out.xDeflAvecConge=occXDefl();
    const rec3=[];occTessellate=function(s,lin,ang){rec3.push([lin,ang]);return _o(s,lin,ang);};
    try{faoMeshFromBody(b2);}finally{occTessellate=_o;}
    out.paramsAvecConge=rec3[0]||null;
    doc.features.pop();

    // ── 4. corps sans shape (repli maillage / aperçus) : chemin d'origine, intact ──
    const rec4=[];occTessellate=function(s,lin,ang){rec4.push(1);return _o(s,lin,ang);};
    let autre=null;
    try{autre=faoMeshFromBody({id:'csg',kind:'boolean',mesh:{matrixWorld:null,geometry:{}}});}
    finally{occTessellate=_o;}
    out.autreSansRetessellation=rec4.length;
    out.autre=autre;

    // ── 5. import STEP : faoGeo posé en 0,5/0,5 AVANT la finesse d'affichage ──
    const seq=[];const _o2=occTessellate;
    occTessellate=function(s,lin,ang){seq.push([lin,ang]);return _o2(s,lin,ang);};
    try{await importSTEP({name:'fao.stp',arrayBuffer:async()=>__step});}
    finally{occTessellate=_o2;}
    out.seqImport=seq.slice(0,3);
    const f=doc.features.find(x=>x.type==='import'&&x.name==='fao');
    out.importOk=!!f;
    out.importFaoGeo=false;
    if(f&&typeof importGeom==='object'&&importGeom){
      const e=importGeom.get(f.id);
      out.importFaoGeo=!!(e&&e.faoGeo);
      if(e&&e.faoGeo){
        // l'outillage d'un import ne retesselle JAMAIS : il réutilise faoGeo
        const rec5=[];occTessellate=function(s,lin,ang){rec5.push(1);return _o2(s,lin,ang);};
        try{faoMeshFromBody({id:f.id,kind:'import',mesh:f._mesh});}finally{occTessellate=_o2;}
        out.importSansRetessellation=rec5.length;
      }
    }

    bodies.length=0;_bodies.forEach(x=>bodies.push(x));
    try{cy.delete();}catch(e){}try{mk.delete();}catch(e){}
    try{mk2.delete();}catch(e){}
    return out;
  })()`,ctx);

  if(o&&o.err){console.log('  ✗ '+o.err);process.exit(1);}
  console.log('=== 2026-10-01q : FAO blindée (corps exact + import STEP) ===');
  console.log('  cylindre : historique(0,5/0,5)='+o.refFao+' tris · affichage(0,024/0,2)='+o.refAffichage+' tris · après Clean+historique='+o.refApresClean);
  console.log('  corps exact : avant FAO='+o.avantFao+' tris → après FAO='+o.apresFao+' tris (paramètres '+JSON.stringify(o.params)+')');
  console.log('  avec congé R2 : occXDefl='+JSON.stringify(o.xDefl)+' → appelés '+JSON.stringify(o.paramsAvecConge));
  console.log('  import STEP : 2 premières tessellations '+JSON.stringify(o.seqImport));
  A(o.refApresClean===o.refFao,'BRepTools.Clean restitue bien le maillage historique ('+o.refApresClean+' tris)');
  A(o.refAffichage>o.refFao,'l\'affichage de la phase 3 est effectivement plus fin ('+o.refAffichage+' > '+o.refFao+' tris)');
  A(o.apresFao===o.refFao,'VERROU FAO : un corps exact est retessellé aux paramètres d\'AUJOURD\'HUI ('+o.apresFao+' = '+o.refFao+' tris)');
  A(o.apresFao<o.avantFao,'…et non avec la finesse d\'affichage ('+o.avantFao+' tris)');
  A(o.nbAppels===1&&o.params&&o.params[0]===o.xDefl.lin&&o.params[1]===o.xDefl.ang,
    'les paramètres appelés sont exactement occXDefl() = '+JSON.stringify(o.xDefl));
  A(o.cache===true,'la géométrie d\'outillage est mise en cache sur le corps (b._faoGeo)');
  A(o.appelsCache===0,'appel suivant : aucun retessellage (cache utilisé)');
  A(o.paramsAvecConge&&o.paramsAvecConge[0]===o.xDeflAvecConge.lin&&o.paramsAvecConge[1]===o.xDeflAvecConge.ang,
    'référence VIVANTE : avec un congé, la FAO suit occXDefl() = '+JSON.stringify(o.xDeflAvecConge));
  A(o.autreSansRetessellation===0,'corps sans shape (repli maillage) : aucun retessellage, chemin d\'origine');
  A(o.importFaoGeo===true,'import STEP : entry.faoGeo bien posé');
  A(o.seqImport&&o.seqImport[0]&&o.seqImport[0][0]===0.5&&o.seqImport[0][1]===0.5,
    'l\'import tesselle EN PREMIER avec la définition historique (0,5/0,5)');
  A(o.seqImport&&o.seqImport[1]&&o.seqImport[1][0]<0.5&&o.seqImport[1][1]===0.2,
    '…puis avec la définition d\'affichage (lin<0,5, ang=0,2)');
  A(o.importSansRetessellation===0,'la FAO d\'un import réutilise faoGeo sans retesseller');
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL '+(e&&e.name)+' : '+(e&&e.message));
  console.log(String((e&&e.stack)||e).slice(0,700));process.exit(1);});
