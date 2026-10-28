// V0.15.4 : « Suppression de face » — édition multi-faces et garde-fou « part en vrille ».
// 1. Édition : STEP seul 100×60×40 percé de DEUX trous Ø10 ; Suppr sur le premier, puis
//    édition de la fonction (mode de la coque, drapeau del) : le second trou s'ajoute,
//    Enregistrer → les deux trous rebouchés (6 faces, volume plein), une seule fonction.
//    Le STEP redevient seul pendant l'édition (fonction sautée) : il reste dans la chaîne.
// 2. Vrille : prisme trapézoïdal (base 40, haut 38, hauteur 10, épaisseur 20) — supprimer
//    le dessus fait se rejoindre les flancs presque parallèles ~200 mm plus haut. Avant :
//    accepté (pointe géante, cf. capture du plateau). Maintenant : refusé, solide inchangé,
//    ⚠ dans l'arbre et message qui dit d'ajouter les faces voisines.
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
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};window.confirm=function(){return true;};',ctx);
  // Harnais : Mesh et tessellation sont des bouchons sans géométrie. On garde la géométrie et
  // ses groupes triangle → face (10 triangles par face, ordre d'exploration du BRep, comme
  // occTessellate) : surbrillance et correspondance des faces de l'édition en ont besoin.
  const T0=sandbox.THREE;
  sandbox.THREE=new Proxy({},{get(t,k){if(k==='Mesh')return function(g,m){const o=T0.Mesh();if(g&&g.userData&&Array.isArray(g.userData.occGroups))o.geometry=g;if(m)o.material=m;return o;};return T0[k];}});
  vm.runInContext('occTessellate=function(sh){let n=0;const x=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);while(x.More()){n++;x.Next();}x.delete();'+
    'const pos={count:n*30,array:new Float32Array(n*90)};return{userData:{occGroups:Array.from({length:n},(_,k)=>({start:k*10,count:10,f:k}))},attributes:{position:pos},getAttribute(){return pos;},dispose(){}};};'+
    'occTessellateBudget=function(sh){return occTessellate(sh);};',ctx);
  sandbox.__step=vm.runInContext(`(function(){
    const cyl=x=>new occt.BRepPrimAPI_MakeCylinder_3(new occt.gp_Ax2_3(new occt.gp_Pnt_3(x,30,-1),occt.gp.DZ()),5,42).Shape();
    const b=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),100,60,40).Shape();
    const sh=occCut(occCut(b,cyl(30)),cyl(70));
    const out=occWriteStep([sh],'/__e.stp');
    return out?Uint8Array.from(out).buffer:null;
  })()`,ctx);
  if(!sandbox.__step){console.log('  ✗ STEP de test impossible à produire');process.exit(1);}
  const body=`
    const out={};
    const FA=occt.TopAbs_ShapeEnum.TopAbs_FACE,SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
    const nFaces=s=>{let n=0;const x=new occt.TopExp_Explorer_2(s,FA,SH);while(x.More()){n++;x.Next();}x.delete();return n;};
    const vol=s=>{const p=new occt.GProp_GProps_1();occt.BRepGProp.VolumeProperties_1(s,p,false,false,false);const v=p.Mass();p.delete();return v;};
    const tick=()=>new Promise(r=>setTimeout(r,5));
    const cylRefs=s=>{const o=[];const x=new occt.TopExp_Explorer_2(s,FA,SH);
      while(x.More()){const fc=occt.TopoDS.Face_1(x.Current());if(occSurfKind(fc)==='Cylinder')o.push(occFaceRefAny(fc));x.Next();}x.delete();
      return o.sort((a,b)=>a.pos[0]-b.pos[0]);};
    // ── 1. édition ──
    await importSTEP({name:'deux.stp',arrayBuffer:async()=>__step});
    const im=doc.features.find(x=>x.type==='import');
    const ent=importGeom.get(im.id);
    if(!(im._mesh.geometry&&im._mesh.geometry.userData&&im._mesh.geometry.userData.occGroups)){
      const n=nFaces(ent.brep);im._mesh.geometry={userData:{occGroups:Array.from({length:n},(_,k)=>({start:k*10,count:10,f:k}))}};
    }
    let tri=null;
    for(const g of im._mesh.geometry.userData.occGroups){const fc=occFaceAt(ent.brep,g.f);
      const ok=fc&&occSurfKind(fc)==='Cylinder'&&occFaceBox(fc).pos[0]<50;try{fc&&fc.delete();}catch(e){}if(ok){tri=g.start;break;}}
    selFaces=[{mesh:im._mesh,faceIndex:tri}];
    deleteSelectedFaces();await tick();
    const f=doc.features.find(x=>x.type==='xdelface');
    out.f1=f?{n:f.faces.length,faces:nFaces(occLive.shape)}:null;
    enterCoqueMode(f);
    out.mode=!!(coqueMode&&coqueMode.del&&coqueMode.editing===f.id);
    out.modeExact=!!(occLive&&occLive.shape);
    out.modeTrous=out.modeExact?cylRefs(occLive.shape).length:-1; // fonction sautée : 2 trous visibles
    out.marques=coqueMode?coqueMode.faces.filter(r=>r._ord>=0).length:-1;
    if(out.modeExact){const r2=cylRefs(occLive.shape)[1];r2._ord=coqueOrdOf(r2);coqueMode.faces.push(r2);}
    coqueApply();await tick();
    const pc=bodies.filter(b=>b.kind==='body');
    out.apres={fonctions:doc.features.filter(x=>x.type==='xdelface').length,n:f.faces.length,name:f.name,m:f._m,
      corps:pc.length,import:bodies.some(b=>b.kind==='import'),faces:pc[0]&&pc[0].shape?nFaces(pc[0].shape):-1,
      vol:pc[0]&&pc[0].shape?vol(pc[0].shape):-1,mode:!!coqueMode,skip:occSkipFeat};
    // annulation d'une édition : la fonction reste telle quelle
    enterCoqueMode(f);coqueMode.faces=[];exitCoqueMode();await tick();
    out.annule={n:f.faces.length,faces:nFaces(occLive.shape)};
    // ── 2. vrille ──
    doc.features=[];doc.bodies=[];
    doc.sketches=[{id:'t',name:'t',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],
      points:{a:{x:0,y:0},b:{x:40,y:0},c:{x:39,y:10},d:{x:1,y:10}},
      entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],
      constraints:[],dims:[],seq:9,visible:false}];
    doc.features=[{id:'P',type:'extrude',name:'Prisme',sketchId:'t',distance:20,op:'add',visible:true}];
    markDirty();rebuild();
    const S=occLive.shape;const v0=vol(S),n0=nFaces(S);
    let top=null;{const x=new occt.TopExp_Explorer_2(S,FA,SH);while(x.More()){const fc=occt.TopoDS.Face_1(x.Current());const b=occFaceBox(fc);if(b&&b.pos[1]>9.9&&!top)top=occFaceRefAny(fc);x.Next();}x.delete();}
    doc.features.push({id:'D',type:'xdelface',name:'Suppression de face',faces:[top],body:doc.features[0].body,visible:true});
    markDirty();rebuild();
    const d=doc.features[1];
    let hi=null;try{const B=occBoxMinMax(occLive.shape);hi=B.hi[1];}catch(e){}
    out.vrille={m:d._m,faces:nFaces(occLive.shape),n0,dv:Math.abs(vol(occLive.shape)-v0),hautY:hi,msg:String(faceEl.textContent||'')};
    // règle du garde-fou (boîtes chiffrées : le noyau n'a pas reproduit la pointe du plateau sur une forme simple)
    const bx=(a,b)=>({lo:a,hi:b});
    out.regle={
      plateau:occDelFaceDebord(bx([-200,-200,0],[200,200,30]),bx([-200,-200,0],[200,200,400]),[bx([150,-50,25],[190,-10,30])]),
      pointeX:occDelFaceDebord(bx([-200,-200,0],[200,200,30]),bx([-200,-200,0],[520,200,30]),[bx([150,-50,25],[190,-10,30])]),
      chanfrein:occDelFaceDebord(bx([0,0,0],[100,60,40]),bx([0,0,0],[100,60,40]),[bx([0,50,30],[100,60,40])]),
      trapeze:occDelFaceDebord(bx([0,0,0],[40,10,20]),bx([0,0,0],[40,40,20]),[bx([5,10,0],[35,10,20])]),
      trou:occDelFaceDebord(bx([0,0,0],[100,60,40]),bx([0,0,0],[100,60,40]),[bx([25,25,0],[35,35,40])])};
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx);
  console.log('=== Suppression de face : édition multi-faces ===');
  A(o.f1&&o.f1.n===1,'Suppr sur le 1er trou du STEP : une fonction, une face '+JSON.stringify(o.f1));
  A(o.mode,'édition : mode ouvert sur la suppression (drapeau del)');
  A(o.modeExact&&o.modeTrous===2,'édition : fonction sautée, STEP seul gardé exact — les 2 trous cliquables ('+o.modeTrous+')');
  A(o.marques===1,'édition : la face mémorisée est retrouvée et surlignée ('+o.marques+')');
  const a=o.apres||{};
  A(a.fonctions===1&&a.n===2&&a.name==='Suppression de 2 faces','Enregistrer : même fonction, 2 faces '+JSON.stringify({n:a.n,name:a.name}));
  A(!a.mode&&!a.skip,'Enregistrer : mode fermé, plus de fonction sautée');
  A(a.m&&a.m.m===2&&a.m.t===2,'Enregistrer : les 2 faces supprimées '+JSON.stringify(a.m));
  A(a.corps===1&&!a.import&&a.faces===6&&Math.abs(a.vol-240000)<1,'les deux trous rebouchés (6 faces, '+(+a.vol).toFixed(1)+' mm³)');
  A(o.annule&&o.annule.n===2&&o.annule.faces===6,'Échap en édition : la fonction reste inchangée '+JSON.stringify(o.annule));
  console.log('=== Garde-fou : prolongement hors de la pièce ===');
  const v=o.vrille||{};
  console.log('  message : '+String(v.msg).replace(/\n+/g,' | ').slice(0,260));
  A(v.m&&v.m.m===0,'suppression refusée (⚠ dans l\'arbre) '+JSON.stringify(v.m));
  A(v.faces===v.n0&&v.dv<1,'solide inchangé ('+v.faces+' faces, Δvol '+(+v.dv).toFixed(2)+')');
  A(v.hautY!=null&&v.hautY<10.5,'pas de pointe : la pièce s\'arrête à y=10 ('+(v.hautY==null?'?':v.hautY.toFixed(1))+')');
  A(/hors de la pièce|ne se rejoignent pas/.test(v.msg),'message explicite');
  const g=o.regle||{};console.log('  règle : '+JSON.stringify(g));
  A(g.plateau>300,'pointe de 370 mm au-dessus d’un plateau de 30 mm (face de 40 mm) : refusée ('+g.plateau+' mm hors zone)');
  A(g.pointeX>250,'pointe latérale : refusée ('+g.pointeX+')');
  A(g.chanfrein===0&&g.trou===0,'chanfrein → coin vif, trou rebouché : acceptés');
  A(g.trapeze===0,'trapèze 40/30 → triangle (sommet à 30 mm de la face de 30 mm) : accepté');
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
