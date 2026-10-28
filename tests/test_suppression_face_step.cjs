// 2026-10-28 : Suppr sur une face d'un STEP importé SEUL dans la pièce.
// Régression : « Suppression de face : solide exact indisponible (OCCT non chargé ou aucun
// volume) » alors que le noyau est prêt — un import seul n'entre pas dans la chaîne exacte
// (occReplayBody : importSeul), occLive restait null et occFaceOfHit ne connaissait que les
// corps exacts. Correctif : la face se résout sur le BRep de l'import (importGeom.brep) ;
// la fonction « Suppression de face » fait entrer le STEP dans la chaîne exacte.
// STEP : boîte 100×60×40 percée d'un trou débouchant Ø10 → face du trou supprimée →
// trou rebouché (6 faces, volume plein).
// Étendu aux autres outils de face (congé, chanfrein, déplacement, dépouille, coque) :
// le STEP seul entre dans la chaîne exacte le temps du mode (occStepForce), en ressort
// à l'annulation, y reste quand la fonction est validée.
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
  sandbox.__step=vm.runInContext(`(function(){
    const b=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),100,60,40).Shape();
    const c=new occt.BRepPrimAPI_MakeCylinder_3(new occt.gp_Ax2_3(new occt.gp_Pnt_3(50,30,-1),occt.gp.DZ()),5,42).Shape();
    const sh=occCut(b,c);
    const out=occWriteStep([sh],'/__d.stp');
    return out?Uint8Array.from(out).buffer:null;
  })()`,ctx);
  if(!sandbox.__step){console.log('  ✗ STEP de test impossible à produire');process.exit(1);}
  const body=`
    const out={};
    const FA=occt.TopAbs_ShapeEnum.TopAbs_FACE,SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
    const nFaces=s=>{let n=0;const x=new occt.TopExp_Explorer_2(s,FA,SH);while(x.More()){n++;x.Next();}x.delete();return n;};
    const vol=s=>{const p=new occt.GProp_GProps_1();occt.BRepGProp.VolumeProperties_1(s,p,false,false,false);const v=p.Mass();p.delete();return v;};
    await importSTEP({name:'perce.stp',arrayBuffer:async()=>__step});
    const f=doc.features.find(x=>x.type==='import');
    if(!f||!f._mesh)return{err:'import sans _mesh'};
    out.seul=bodies.filter(b=>b.kind==='import').length===1&&!bodies.some(b=>b.kind==='body');
    out.live=!!(occLive&&occLive.shape);
    // triangle de la face cylindrique du trou dans le maillage de l'import
    const ent=importGeom.get(f.id);
    // (le Mesh du harnais ne garde pas sa géométrie : groupes triangle → face posés ici,
    //  10 triangles par face, dans l'ordre d'exploration du BRep — comme occTessellate)
    if(!f._mesh.geometry||!f._mesh.geometry.userData){
      const n=nFaces(ent.brep);f._mesh.geometry={userData:{occGroups:Array.from({length:n},(_,k)=>({start:k*10,count:10,f:k}))}};
    }
    const gs=f._mesh.geometry.userData.occGroups||[];
    let tri=null;
    for(const g of gs){const fc=occFaceAt(ent.brep,g.f);if(fc&&occSurfKind(fc)==='Cylinder'){tri=g.start;}try{fc&&fc.delete();}catch(e){}if(tri!==null)break;}
    if(tri===null)return{err:'face du trou introuvable dans occGroups'};
    selFaces=[{mesh:f._mesh,faceIndex:tri}];
    deleteSelectedFaces();
    out.msg=String(faceEl.textContent||'');
    const d=doc.features.find(x=>x.type==='xdelface');
    out.feat=!!d;out.err=d&&(d._err||null);out.m=d&&d._m;
    const pc=bodies.filter(b=>b.kind==='body');
    out.corps=pc.length;
    out.faces=pc[0]&&pc[0].shape?nFaces(pc[0].shape):-1;
    out.vol=pc[0]&&pc[0].shape?vol(pc[0].shape):-1;
    out.importAffiche=bodies.some(b=>b.kind==='import');
    // ── Autres outils de face sur le STEP seul : entrée, annulation, validation ──
    const tick=()=>new Promise(r=>setTimeout(r,5));
    const seulDeNouveau=async()=>{doc.features=doc.features.filter(x=>x.type==='import');markDirty();rebuild();await tick();
      return bodies.some(b=>b.kind==='import')&&!bodies.some(b=>b.kind==='body')&&!(occLive&&occLive.shape);};
    out.outils={};
    const essai=async(nom,entrer,actif,sortir)=>{
      const r={};r.seul=await seulDeNouveau();
      try{entrer();}catch(e){r.exc=String(e&&e.message||e);}
      r.actif=!!actif();r.exact=!!(occLive&&occLive.shape)&&bodies.some(b=>b.kind==='body');
      r.refus=/solide exact indisponible|recalcul impossible/.test(String(faceEl.textContent||''));
      try{sortir();}catch(e){r.exc2=String(e&&e.message||e);}
      await tick();
      r.rendu=bodies.some(b=>b.kind==='import')&&!(occLive&&occLive.shape);
      out.outils[nom]=r;
    };
    await essai('congé',()=>enterFilletMode(),()=>filModeX&&filModeX.edges.length,()=>exitFilletMode(false));
    await essai('chanfrein',()=>enterExactFilletMode(null,'chamfer'),()=>filModeX,()=>exitFilletMode(false));
    await essai('déplacement',()=>enterMoveFaceMode(),()=>mvMode,()=>exitMoveFaceMode(false));
    await essai('dépouille',()=>enterDraftMode(),()=>draftMode,()=>exitDraftMode(false));
    await essai('coque',()=>enterCoqueMode(),()=>coqueMode,()=>exitCoqueMode(false));
    // un mode qui en remplace un autre garde le STEP dans la chaîne
    await seulDeNouveau();enterFilletMode();enterCoqueMode();await tick();
    out.relais=!!coqueMode&&!!(occLive&&occLive.shape);exitCoqueMode(true);await tick();
    // validation : coque ouverte sur le dessus, épaisseur 2
    await seulDeNouveau();enterCoqueMode();
    if(!(occLive&&occLive.shape)){out.dbg='coque : '+String(faceEl.textContent)+' mode='+!!coqueMode+' force='+occStepForce+' kinds='+bodies.map(b=>b.kind);return out;}
    {const H=occLive.shape;let ref=null;const x=new occt.TopExp_Explorer_2(H,FA,SH);
      while(x.More()){const fc=occt.TopoDS.Face_1(x.Current());const b=occFaceBox(fc);if(b&&b.pos[2]>39.9&&!ref)ref=occFaceRef(fc);x.Next();}x.delete();
      if(ref)coqueMode.faces.push(ref);coqueMode.thick=2;}
    coqueApply();await tick();
    {const pc=bodies.filter(b=>b.kind==='body');const d=doc.features.find(x=>x.type==='xshell');
      out.coque={feat:!!d,m:d&&d._m,corps:pc.length,import:bodies.some(b=>b.kind==='import'),vol:pc[0]&&pc[0].shape?vol(pc[0].shape):-1};}
    // validation : congé R5 sur la première arête vive
    await seulDeNouveau();enterFilletMode();
    {const e=filModeX.edges[0];filModeX.sel.push({pos:e.mid.slice(),pos0:e.mid.slice(),r:5,len:0,seed:1});filModeX.seeds=[0];filModeX.radius=5;}
    applyExactFillet();await tick();
    {const pc=bodies.filter(b=>b.kind==='body');const d=doc.features.find(x=>x.type==='xfillet');
      out.conge={feat:!!d,m:d&&d._m,corps:pc.length,import:bodies.some(b=>b.kind==='import'),faces:pc[0]&&pc[0].shape?nFaces(pc[0].shape):-1};}
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx);
  console.log('=== Suppr sur une face d’un STEP importé seul ===');
  if(o&&o.err&&typeof o.err==='string'&&!o.feat){console.log('  ERREUR : '+o.err);process.exit(1);}
  console.log('  message : '+o.msg.replace(/\n+/g,' | ').slice(0,240));
  A(o.seul&&!o.live,'avant : STEP seul, hors chaîne exacte (occLive vide)');
  A(!/solide exact indisponible/.test(o.msg),'plus de « solide exact indisponible »');
  A(o.feat&&!o.err&&(!o.m||o.m.m===o.m.t),'fonction « Suppression de face » créée sans ⚠ '+JSON.stringify(o.m||null));
  A(o.corps===1&&!o.importAffiche,'le STEP est devenu le corps exact (pas de mesh en double)');
  A(o.faces===6,'trou rebouché : 6 faces ('+o.faces+')');
  A(Math.abs(o.vol-240000)<1,'volume plein ('+(+o.vol).toFixed(1)+')');
  if(o.dbg)console.log('  DBG '+o.dbg);
  console.log('--- autres outils de face sur le STEP seul ---');
  for(const [nom,r] of Object.entries(o.outils||{})){
    A(r.seul&&r.actif&&r.exact&&!r.refus&&!r.exc&&!r.exc2,nom+' : le mode s’ouvre sur le solide exact du STEP '+JSON.stringify(r));
    A(r.rendu,nom+' : annulé, le STEP redevient un import affiché tel quel');
  }
  A(o.relais,'un outil qui en remplace un autre garde le STEP dans la chaîne exacte');
  A(o.coque&&o.coque.feat&&o.coque.corps===1&&!o.coque.import&&o.coque.vol>0&&o.coque.vol<240000-1000,'coque validée sur le STEP '+JSON.stringify(o.coque));
  A(o.conge&&o.conge.feat&&o.conge.corps===1&&!o.conge.import&&o.conge.faces>7,'congé validé sur le STEP '+JSON.stringify(o.conge));
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log("FATAL",String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
