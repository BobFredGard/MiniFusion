// 2026-10-01n : LE mesh d'un import STEP survit à tout le cycle de vie du document.
// Régression corrigée : commitPrev() (30-marqueur-temps.js) retirait le mesh de la scène
// + le libérait à CHAQUE rejeu, alors que `bodies` le contenait toujours — le STEP
// disparaissait dès la création d'une esquisse (2e rejeu), et docSnap() (strip de _mesh)
// rendait le corps fantôme après un annuler/rétablir.
//
// On exécute le VRAI importSTEP (noyau OCCT réel, STEP généré ici même par occWriteStep :
// aucune dépendance à un fichier modèle), puis on observe le COMPORTEMENT : présence dans
// la scène, appartenance à bodies, historique d'annulation, suppression.
// NOTE : le harnais a un THREE stub — le mesh est donc un objet simple, la scène est
// instrumentée (add/remove) ; occTessellate y tourne mais ne produit pas de vrais attributs.
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
  // STEP de test : boîte 60×40×20 écrite par l'export du projet lui-même
  sandbox.__step=vm.runInContext(`(function(){
    const mk=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),60,40,20);
    const sh=mk.Shape();
    const b=occWriteStep([sh],'/__vie.stp');
    try{sh.delete();}catch(e){}
    try{mk.delete();}catch(e){}
    return b?Uint8Array.from(b).buffer:null;
  })()`,ctx);
  if(!sandbox.__step){console.log('  ✗ STEP de test impossible à produire');process.exit(1);}

  const body=`
    const out={};
    // scène instrumentée : quels objets y sont ACTUELLEMENT
    const inScene=new Set();
    const _add=scene.add.bind(scene),_rm=scene.remove.bind(scene);
    scene.add=function(o){if(o)inScene.add(o);return _add(o);};
    scene.remove=function(o){if(o)inScene.delete(o);return _rm(o);};
    const file={name:'vie.stp',arrayBuffer:async()=>__step};
    try{await importSTEP(file);}catch(e){return {err:String((e&&e.message)||e)};}
    const f=doc.features.find(x=>x.type==='import');
    if(!f||!f._mesh)return {err:'import sans _mesh'};
    const mesh=f._mesh;
    const g=mesh.geometry;let dispo=0;
    if(g&&typeof g.dispose==='function'){const d=g.dispose;g.dispose=function(){dispo++;return d.apply(g,arguments);};}
    const table=()=>(typeof importGeom==='object'&&importGeom)?importGeom.size:-1;
    out.table1=table();
    out.inScene1=inScene.has(mesh);
    out.body1=bodies.some(b=>b.kind==='import'&&b.mesh===mesh);

    // ── trois rejeux : le mesh doit rester AFFICHÉ et appartenir au corps ──
    for(let i=0;i<3;i++){markDirty();rebuild();}
    out.inScene3=inScene.has(mesh);
    out.body3=bodies.some(b=>b.kind==='import'&&b.mesh===mesh);
    out.dispo3=dispo;

    // ── scénario exact du bug : création d'une esquisse puis rejeu ──
    const sk={id:'skVie',name:'Vie',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],
      points:{a:{x:0,y:0}},entities:[],constraints:[],dims:[],visible:false};
    doc.sketches.push(sk);
    markDirty();rebuild();
    out.inSceneSk=inScene.has(mesh);
    out.bodySk=bodies.some(b=>b.kind==='import'&&b.mesh===mesh);
    out.meshMemeObjet=(f._mesh===mesh);
    out.dispoSk=dispo;

    // ── annuler : la fonction quitte le document (docSnap strippe _mesh) ──
    out.okUndo=!!docUndo();
    out.importAbsent=!doc.features.some(x=>x.type==='import');
    out.dispoUndo=dispo;      // la géométrie doit être CONSERVÉE : l'historique peut la remettre
    out.tableUndo=table();

    // ── rétablir : le mesh doit être re-broché, jamais recréé ──
    out.okRedo=!!docRedo();
    const f2=doc.features.find(x=>x.type==='import');
    out.meshAuRetour=!!(f2&&f2._mesh);
    out.meshIdentique=!!(f2&&f2._mesh===mesh);
    out.inSceneRetour=inScene.has(f2&&f2._mesh);
    out.bodyRetour=bodies.some(b=>b.kind==='import'&&b.mesh===(f2&&f2._mesh));
    out.dispoRetour=dispo;

    // ── suppression définitive : plus rien d'affiché ──
    docPushUndo('purge');
    doc.features=doc.features.filter(x=>x.type!=='import');
    markDirty();rebuild();
    out.corpsParti=!bodies.some(b=>b.kind==='import');
    out.horsScene=!inScene.has(mesh);
    out.dispoPurge=dispo;     // encore dans l'historique : toujours pas libéré

    // ── l'id sort de TOUT l'historique : la table peut enfin libérer ──
    docUndoStack.length=0;docRedoStack.length=0;
    markDirty();rebuild();
    out.tableVide=table();
    out.dispoFinal=dispo;
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx);

  console.log('=== 2026-10-01n : mesh d\'import STEP = cycle de vie complet ===');
  if(o.err){console.log('  ERREUR : '+o.err);A(false,'import STEP exécuté');process.exit(1);}
  console.log('  table='+o.table1+'  scène='+o.inScene1+'  corps='+o.body1+
    '   · 3 rejeux : scène='+o.inScene3+' corps='+o.body3+' libérés='+o.dispo3+
    '   · esquisse : scène='+o.inSceneSk+' corps='+o.bodySk+
    '   · retour : mesh='+o.meshAuRetour+' identique='+o.meshIdentique+' scène='+o.inSceneRetour+
    '   · purge : corps='+o.corpsParti+' scène='+o.horsScene+' table='+o.tableVide+' libérés='+o.dispoFinal);
  A(o.table1===1,'la table d\'imports est alimentée à l\'import (1 entrée)');
  A(o.inScene1&&o.body1,'le mesh importé est dans la scène ET dans bodies');
  A(o.inScene3,'3 rejeux plus tard, le mesh est TOUJOURS dans la scène');
  A(o.body3,'les corps affichés pointent toujours ce mesh');
  A(o.dispo3===0,'aucune géométrie libérée pendant les rejeux ('+o.dispo3+')');
  A(o.inSceneSk&&o.bodySk,'création d\'esquisse : le STEP ne disparaît pas (régression corrigée)');
  A(o.meshMemeObjet,'c\'est bien le MÊME objet mesh, jamais recréé');
  A(o.okUndo&&o.importAbsent,'annuler retire bien la fonction import du document');
  A(o.dispoUndo===0&&o.tableUndo===1,'annuler CONSERVE la géométrie (l\'historique peut la remettre)');
  A(o.okRedo&&o.meshAuRetour&&o.meshIdentique,'rétablir re-broche le mesh d\'origine (pas de fantôme)');
  A(o.inSceneRetour&&o.bodyRetour,'après rétablir, le corps affiché est de nouveau dans la scène');
  A(o.dispoRetour===0,'rétablir ne recrée ni ne libère rien ('+o.dispoRetour+')');
  A(o.corpsParti&&o.horsScene,'suppression : le mesh sort des corps ET de la scène');
  A(o.dispoPurge===0,'géométrie gardée tant que l\'id reste dans l\'historique d\'annulation');
  A(o.tableVide===0&&o.dispoFinal>=1,'historique purgé : table vidée et géométrie libérée (une fois)');
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,900));process.exit(1);});
