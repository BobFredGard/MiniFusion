// 2026-10-01r : UNIR / SOUSTRAIRE une esquisse à un STEP importé.
// Régression : la voie exacte ne rejouait QUE extrude/revolve (occReplayBody,
// `if(f.type!=='extrude'&&f.type!=='revolve')return;`) — f.type==='import' était
// sauté en silence, le STEP n'entrait donc JAMAIS dans l'accumulateur :
//   • « Uni » restait deux pièces affichées côte à côte (pas de fusion) ;
//   • « Soustraction » tombait dans le vide (« découpe dans le vide — ignorée »).
// Correctif : le BRep de l'import est conservé à l'import (entry.brep) et copié dans
// l'accumulateur du corps — la table garde le sien, le rejeu reste propriétaire du
// sien. L'import ainsi consommé n'est plus affiché en double (il EST le corps).
// On mesure la GÉOMÉTRIE (BRepGProp n'est pas exposé dans cette build) :
// faces, solides, boîte englobante — jamais la présence d'un simple message.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  ✗ '+m);}else console.log('  ✓ '+m);};
const aR=(v,e,p)=>Math.abs(v-e)<=(p||0.5);
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox,loadErr}=loadApp();
  if(loadErr)console.log('  (harnais : buildScene interrompu — comportement normal du stub)');
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};window.confirm=function(){return true;};',ctx);
  // STEP de test : boîte 60×40×20 écrite par l'export du projet lui-même
  // (chemin COURT obligatoire : des noms comme /__bool.stp sortent corrompus du FS OCCT)
  sandbox.__step=vm.runInContext(`(function(){
    const mk=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),60,40,20);
    const sh=mk.Shape();
    const b=occWriteStep([sh],'/__q.stp');
    try{sh.delete();}catch(e){}
    try{mk.delete();}catch(e){}
    return b?Uint8Array.from(b).buffer:null;
  })()`,ctx);
  if(!sandbox.__step){console.log('  ✗ STEP de test impossible à produire');process.exit(1);}

  const body=`
    const out={};
    const bb=function(sh){const b=new occt.Bnd_Box_1();occt.BRepBndLib.Add(sh,b,false);
      const a=b.CornerMin(),z=b.CornerMax();b.delete();return [a.X(),a.Y(),a.Z(),z.X(),z.Y(),z.Z()];};
    const cnt=(sh,k)=>{let n=0;const ex=new occt.TopExp_Explorer_2(sh,k,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);
      while(ex.More()){n++;ex.Next();}ex.delete();return n;};
    const nf=s=>cnt(s,occt.TopAbs_ShapeEnum.TopAbs_FACE);
    const nsol=s=>cnt(s,occt.TopAbs_ShapeEnum.TopAbs_SOLID);
    // faces cylindriques : la preuve d'un ALÉSAGE (indépendante du découpage des faces)
    const ncyl=function(sh){let n=0;const ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);
      while(ex.More()){const fc=occt.TopoDS.Face_1(ex.Current());
        try{const ad=new occt.BRepAdaptor_Surface_2(fc,true);
          if(ad.GetType()===occt.GeomAbs_SurfaceType.GeomAbs_Cylinder)n++;ad.delete();}catch(e){}
        ex.Next();}ex.delete();return n;};
    // scène instrumentée : l'import consommé ne doit PLUS y être (il EST le corps)
    const inScene=new Set();
    const _add=scene.add.bind(scene),_rm=scene.remove.bind(scene);
    scene.add=function(o){if(o)inScene.add(o);return _add(o);};
    scene.remove=function(o){if(o)inScene.delete(o);return _rm(o);};
    const rejouer=()=>{markDirty();rebuild();};

    // ── 1. import SEUL : comportement inchangé (affiché comme avant) ──
    await importSTEP({name:'bloc.stp',arrayBuffer:async()=>__step});
    const f=doc.features.find(x=>x.type==='import');
    if(!f||!f._mesh)return{err:'import sans _mesh'};
    out.seulCorps=bodies.filter(b=>b.kind==='import').length;
    out.seulScene=inScene.has(f._mesh);
    let ent=null;try{ent=importGeom.get(f.id);}catch(e){ent=null;}
    out.brep=!!(ent&&ent.brep);

    // ── 2. SOUSTRACTION : Ø20 à travers la boîte (60×40×20, trou au centre) ──
    doc.sketches.push({id:'skT',name:'Perce',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],
      points:{c:{x:30,y:20}},entities:[{id:'ci',t:'circle',pc:'c',r:10}],constraints:[],dims:[],visible:false});
    doc.features.push({id:'exC',type:'extrude',name:'Perçage',sketchId:'skT',op:'cut',distance:40,mid:true,visible:true});
    rejouer();
    out.cutMsg=String(faceEl.textContent||'');
    const pc=bodies.find(b=>b.kind==='body');
    out.cutFaces=pc&&pc.shape?nf(pc.shape):-1;
    out.cutCyl=pc&&pc.shape?ncyl(pc.shape):-1;
    out.cutSolids=pc&&pc.shape?nsol(pc.shape):-1;
    out.cutGhost=bodies.some(b=>b.ghost);
    out.cutImport=bodies.some(b=>b.kind==='import');
    out.cutScene=inScene.has(f._mesh);

    // ── 3. UNION : bloc saillant 55→85 en X (déborde la boîte) ──
    doc.features=doc.features.filter(x=>x.id!=='exC');
    doc.sketches=doc.sketches.filter(s=>s.id!=='skT');
    doc.sketches.push({id:'skU',name:'Bloc',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],
      points:{a:{x:55,y:10},b:{x:85,y:10},c:{x:85,y:30},d:{x:55,y:30}},
      entities:[{id:'l0',t:'line',p1:'a',p2:'b'},{id:'l1',t:'line',p1:'b',p2:'c'},
                {id:'l2',t:'line',p1:'c',p2:'d'},{id:'l3',t:'line',p1:'d',p2:'a'}],
      constraints:[],dims:[],visible:false});
    doc.features.push({id:'exU',type:'extrude',name:'Bloc saillant',sketchId:'skU',op:'add',distance:40,visible:true});
    rejouer();
    out.uniMsg=String(faceEl.textContent||'');
    const pu=bodies.filter(b=>b.kind==='body');
    out.uniParts=pu.length;
    if(pu[0]&&pu[0].shape){const B=bb(pu[0].shape);
      out.uniBox=B;out.uniFaces=nf(pu[0].shape);out.uniSolids=nsol(pu[0].shape);}
    out.uniImport=bodies.some(b=>b.kind==='import');
    out.uniScene=inScene.has(f._mesh);
    out.uniKinds=bodies.map(b=>b.kind).join(',');
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx);

  console.log('=== 2026-10-01r : unir / soustraire une esquisse à un STEP importé ===');
  if(o&&o.err){console.log('  ERREUR : '+o.err);A(false,'import STEP exécuté');process.exit(1);}
  console.log('  import seul : corps='+o.seulCorps+' scène='+o.seulScene+' brep='+o.brep);
  console.log('  soustraction : faces='+o.cutFaces+' cyl='+o.cutCyl+' solides='+o.cutSolids+' outil='+o.cutGhost+
              ' import='+o.cutImport+' scène='+o.cutScene);
  if(o.cutMsg)console.log('    messages : '+o.cutMsg.replace(/\n+/g,' | ').slice(0,240));
  console.log('  union : corps='+o.uniParts+' faces='+o.uniFaces+' solides='+o.uniSolids+
              ' boîte=['+(o.uniBox||[]).map(v=>v.toFixed(1)).join(',')+']');
  console.log('    kinds : '+o.uniKinds);
  if(o.uniMsg)console.log('    messages : '+o.uniMsg.replace(/\n+/g,' | ').slice(0,240));

  A(o.seulCorps===1&&o.seulScene,'import seul : affiché comme avant (1 corps import, mesh en scène)');
  A(o.brep===true,'la table d\'imports conserve le solide exact (entry.brep)');

  A(o.cutFaces>=7,'soustraction : la boîte a perdu des faces au profit du trou ('+o.cutFaces+' ≥ 7)');
  A(o.cutCyl>=1,'soustraction : alésage cylindrique Ø20 creusé dans le STEP ('+o.cutCyl+' face(s) cylindrique(s))');
  A(o.cutSolids===1,'soustraction : un seul solide ('+o.cutSolids+')');
  A(!/coupe dans le vide/i.test(o.cutMsg||''),'soustraction : plus de « découpe dans le vide »');
  A(o.cutGhost===true,'soustraction : l\'outil de découpe est bien un fantôme');
  A(o.cutImport===false&&o.cutScene===false,'soustraction : l\'import EST le corps (plus de mesh en double)');

  A(o.uniParts===1,'union : un seul corps exact (pas deux pièces côte à côte)');
  A(o.uniBox&&aR(o.uniBox[0],0),'union : la boîte englobante commence à x=0 (le STEP est dedans) ['+(o.uniBox||[]).map(v=>v.toFixed(1))+']');
  A(o.uniBox&&aR(o.uniBox[3],85),'union : et va jusqu\'à x=85 (bloc saillant fusionné)');
  A(o.uniFaces>6,'union : plus de faces qu\'une simple boîte ('+o.uniFaces+' > 6)');
  A(o.uniSolids===1,'union : un seul solide ('+o.uniSolids+')');
  A(o.uniImport===false&&o.uniScene===false,'union : plus de mesh d\'import en double');

  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,900));process.exit(1);});
