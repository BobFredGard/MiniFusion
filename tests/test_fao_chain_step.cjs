// 2026-10-11-006 : chaîne d'arêtes JOIGNABLE SUR UN IMPORT STEP pour délimiter
// une zone d'usinage. Régression corrigée : un import SEUL n'entre jamais dans la
// chaîne exacte (occReplayBody : « importSeul → return ») donc occLive reste NULL
// et faoChainStart refusait TOUTE sélection (« recalcul impossible ») alors que
// l'overlay « Arêtes » dessinait bien le STEP (importGeom entry.edges, test
// test_aretes_import). faoChainStart + faoChainReplay listent désormais via
// faoChainEdgesWorld (occLive COMME AVANT + arêtes classées des imports affichés).
// Exécute le vrai importSTEP (noyau OCCT réel, STEP = boîte 100×60×40 générée ici).
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
  // STEP de test : boîte pleine 100×60×40 — 12 arêtes vives, face haute à z=40.
  sandbox.__step=vm.runInContext(`(function(){
    const mk=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),100,60,40);
    const box=mk.Shape();
    const b=occWriteStep([box],'/__z.stp');
    try{box.delete();}catch(e){}try{mk.delete();}catch(e){}
    return b?Uint8Array.from(b).buffer:null;
  })()`,ctx);
  if(!sandbox.__step){console.log('  ✗ STEP de test impossible à produire');process.exit(1);}

  const body=`
    const R=[];
    const att=(c,m)=>R.push([!!c,m]);
    await importSTEP({name:'zone.stp',arrayBuffer:async()=>__step});
    const f=doc.features.find(x=>x.type==='import');
    if(!f||!f._mesh)return {err:'import sans _mesh',R:R};
    const ent=(typeof importGeom==='object'&&importGeom)?importGeom.get(f.id):null;
    att(ent&&ent.brep,'table d imports : brep exact conservé');
    att(ent&&ent.edges&&ent.edges.length===12,'12 arêtes classées à l import (obtenu '+(ent&&ent.edges?ent.edges.length:0)+')');
    // ── CAUSE RACINE : import seul = AUCUN solide exact → occLive null ──
    const liveAvant=!!(occLive&&occLive.shape);
    att(!liveAvant,'ROOT CAUSE : import SEUL -> occLive null (pas de chaine exacte)');
    let imp=bodies.find(b=>b.kind==='import'&&(b.ref===f.id||b.id===f.id));
    if(!imp){try{markDirty();rebuild();}catch(e){}imp=bodies.find(b=>b.kind==='import'&&(b.ref===f.id||b.id===f.id));}
    att(!!imp,'corps import present dans bodies (affiché)');

    // ── A. ouverture de la saisie : refusée avant (« recalcul impossible ») ──
    const setup=faoSetup();
    if(!setup.ops.length)setup.ops.push({id:'zst1',on:true,toolId:(setup.tools[0]&&setup.tools[0].id)||'T1',type:'facing',z:40,ae:6});
    const op=setup.ops[0];
    faoChainStart(setup.id,op.id);
    att(!!faoChainMode,'faoChainStart ouvre la saisie sur STEP seul (refusait avant)');
    if(!faoChainMode)return {err:'faoChainMode absent — faceEl = '+(typeof faceEl!=='undefined'?faceEl.textContent:'?'),R:R};
    att(String(faceEl.textContent).indexOf('recalcul impossible')<0,'faceEl sans « recalcul impossible » ('+faceEl.textContent+')');
    att(String(faceEl.textContent).indexOf('listées')>=0,'message « N listées » ('+faoChainMode.edges.length+' arêtes)');
    att(faoChainMode.edges.length>=12,'au moins les 12 arêtes du STEP (obtenu '+faoChainMode.edges.length+')');
    att(faoChainMode.edges.every(e=>e&&e.pts&&e.pts.length>=2&&isFinite(e.mid&&e.mid[0])&&e.len>0),
        'chaque arête a pts/mid/len exploitables (germes + ancrage)');

    // ── B. sélection des 4 arêtes de la face haute (z=40) + validation ──
    const top=faoChainMode.edges.map(function(e,i){return {e:e,i:i};})
      .filter(function(o){return Math.abs(o.e.mid[2]-40)<1e-6;}).map(function(o){return o.i;});
    att(top.length===4,'4 arêtes de la face haute à z=40 (obtenu '+top.length+')');
    faoChainMode.tangent=false;
    faoChainMode.seeds=top.slice();
    faoChainSync();
    att(faoChainMode.sel.length===4,'4 arêtes sélectionnées (obtenu '+faoChainMode.sel.length+')');
    faoChainOk();
    att(op.limit&&op.limit.mode==='chain','limite chaîne enregistrée sur l opération');
    att(op.limit&&op.limit.anchors&&op.limit.anchors.length===4,'4 ancres de germes');
    att(op.limit&&op.limit.stale===false,'stale=false');
    const L=op.limit?op.limit.loop:[];
    const area=(function(){let a=0;for(let i=0;i+1<L.length;i++)a+=L[i][0]*L[i+1][1]-L[i+1][0]*L[i][1];return Math.abs(a/2);})();
    att(Math.abs(area-6000)<1,'boucle = face 100x60 : aire 6000 (obtenu '+area.toFixed(3)+')');
    const bx=L.reduce(function(a,p){return[Math.min(a[0],p[0]),Math.max(a[1],p[0]),Math.min(a[2],p[1]),Math.max(a[3],p[1])];},[1/0,-1/0,1/0,-1/0]);
    att(bx[0]>-1e-6&&bx[1]<100+1e-6&&bx[2]>-1e-6&&bx[3]<60+1e-6,
        'boucle bornée dans la face [0..100]x[0..60] ('+bx.map(v=>v.toFixed(3)).join('..')+')');

    // ── C. rejeu : re-suivi automatique sur le STEP (géométrie figée) ──
    const loop0=JSON.stringify(op.limit.loop);
    const n=faoChainReplay();
    att(n===0,'faoChainReplay : 0 changement sur STEP statique (obtenu '+n+')');
    att(op.limit.stale===false,'rejeu : stale=false (ancres retrouvées)');
    att(JSON.stringify(op.limit.loop)===loop0,'rejeu : boucle inchangée');

    // ── D. pièce native exacte + STEP côte à côte : les DEUX sources listées ──
    const mk=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),60,40,20);
    const natif=mk.Shape();
    const liveSaved=occLive;
    occLive={shape:natif};
    const W=faoChainEdgesWorld();
    att(W.length===24,'mixte : 12 natif + 12 import = 24 arêtes (obtenu '+W.length+')');
    occLive=liveSaved;
    try{natif.delete();}catch(e){}try{mk.delete();}catch(e){}
    faoChainExit();
    att(faoChainMode===null,'faoChainExit : mode refermé');
    return {R:R};
  `;
  const o=await vm.runInContext('(async function(){'+body+'})()',ctx);

  console.log('=== 2026-10-11-006 : chaîne d arêtes joignable sur import STEP ===');
  if(o&&o.err)console.log('  ERREUR : '+o.err);
  (o&&o.R?o.R:[]).forEach(r=>A(r[0],r[1]));
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko||o.err?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,900));process.exit(1);});
