// 2026-10-01o : arêtes de tangence SUR UN IMPORT STEP, identiques à celles d'une pièce native.
// Régression corrigée : les arêtes d'un import étaient perdues pour toujours —
//   1) importSTEP détruisait le shape BRep juste après la tessellation, donc la
//      classification C0/G1 (occSharpEdges a besoin des faces et de leur continuité)
//      devenait IMPOSSIBLE ;
//   2) buildEdgeOverlay ne classait que le solide exact natif : un STEP affiché
//      à côté d'une pièce native ne recevait AUCUNE arête, et seul, il retombait
//      sur un repli maillage (tout noir, calculé sur le maillage grossier).
// On exécute le vrai importSTEP (noyau OCCT réel, STEP généré ici : boîte + congé,
// seule façon d'obtenir de VRAIES arêtes tangentes), puis on observe edgeOverlayData().
//
// NOTE HARNAIS : la voie exacte de occRebuild est inutilisable en Node (THREE stub :
// `g.attributes.position.count/3` lève « Cannot convert object to primitive value »,
// préexistant et identique sur le build d'avant) — occLive n'y est jamais positionné.
// L'état « pièce native exacte » est donc recréé ici avec un VRAI solide OCCT, ce qui
// teste la logique modifiée (edgeOverlayData) sans dépendre de ce stumbling block.
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
  // STEP de test : boîte 100×60×40 avec congé R4 → arêtes VIVES (boîte) + TANGENTES (congé)
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
    const b=occWriteStep([sh],'/__a.stp');
    if(pf&&pf.shape){try{pf.shape.delete();}catch(e){}}
    try{box.delete();}catch(e){}try{mk.delete();}catch(e){}
    return b?Uint8Array.from(b).buffer:null;
  })()`,ctx);
  if(!sandbox.__step){console.log('  ✗ STEP de test impossible à produire');process.exit(1);}

  const body=`
    const out={};
    if(typeof edgeOverlayData!=='function')return {err:'edgeOverlayData absente (build d avant correction)'};
    await importSTEP({name:'aretes.stp',arrayBuffer:async()=>__step});
    const f=doc.features.find(x=>x.type==='import');
    if(!f||!f._mesh)return {err:'import sans _mesh'};
    const ent=(typeof importGeom==='object'&&importGeom)?importGeom.get(f.id):null;
    out.table=!!ent;
    out.nbEdges=ent&&ent.edges?ent.edges.length:0;
    out.sharp=ent&&ent.edges?ent.edges.filter(e=>e.sharp).length:0;
    out.tangent=ent&&ent.edges?ent.edges.filter(e=>!e.sharp).length:0;
    let adds=0;const _add=scene.add;
    const spy=fn=>{adds=0;scene.add=function(o){adds++;return _add.call(scene,o);};try{fn();}finally{scene.add=_add;}return adds;};

    // ── A. STEP SEUL : l'overlay doit couvrir TOUTES les arêtes classées ──
    edgeMode='on';
    const d1=edgeOverlayData();
    out.seulTotal=d1.length;
    out.seulSharp=d1.filter(d=>d.sharp).length;
    out.seulTangent=d1.filter(d=>!d.sharp).length;
    out.objetsSeul=spy(buildEdgeOverlay);

    // ── B. STEP à côté d'une pièce native exacte : les DEUX doivent être dessinés ──
    //     (état recréé — voir note harnais en tête de fichier)
    const mk=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),60,40,20);
    const natifShape=mk.Shape();
    let natif=0;try{natif=occSharpEdges(natifShape).length;}catch(e){}
    out.natifSeul=natif;
    const _live=occLive;const _bodies=bodies.slice();
    occLive={shape:natifShape};
    bodies.push({id:'natif',name:'Pièce native',mesh:{visible:true},color:0xffffff,visible:true,kind:'body',ref:null});
    const d2=edgeOverlayData();
    out.duoTotal=d2.length;
    out.duoImport=ent&&ent.edges?ent.edges.length:0;
    out.duoVivres=d2.filter(d=>d.sharp).length;
    out.duoTangentes=d2.filter(d=>!d.sharp).length;
    out.objetsDuo=spy(buildEdgeOverlay);
    bodies.length=0;_bodies.forEach(b=>bodies.push(b));
    occLive=_live;
    try{natifShape.delete();}catch(e){}try{mk.delete();}catch(e){}

    // ── C. overlay coupé : rien de dessiné ──
    edgeMode='off';
    out.off=edgeOverlayData().length;
    out.objetsOff=spy(buildEdgeOverlay);
    edgeMode='on';
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx);

  console.log('=== 2026-10-01o : arêtes de tangence sur import STEP ===');
  if(o.err){console.log('  ERREUR : '+o.err);A(false,'edgeOverlayData disponible');process.exit(1);}
  console.log('  import : '+o.nbEdges+' arêtes classées ('+o.sharp+' vives, '+o.tangent+' tangentes)');
  console.log('  seul   : '+o.seulTotal+' dessinées ('+o.seulSharp+' noires / '+o.seulTangent+' grises) en '+o.objetsSeul+' objet(s)');
  console.log('  duo    : '+o.duoTotal+' dessinées (natif '+o.natifSeul+' + import '+o.duoImport+') = '+o.duoVivres+' noires / '+o.duoTangentes+' grises, en '+o.objetsDuo+' objet(s)');
  A(o.table,'la table d\'imports garde les arêtes de l\'import');
  A(o.nbEdges>0,'les arêtes du STEP sont classées à l\'import (shape encore vivant)');
  A(o.sharp>0,'…dont des arêtes VIVES (boîte)');
  A(o.tangent>0,'…dont des arêtes TANGENTES (congé G1) — le cas non couvert avant');
  A(o.seulTotal===o.nbEdges,'STEP seul : TOUTES les arêtes sont dessinées ('+o.seulTotal+'/'+o.nbEdges+')');
  A(o.seulSharp>0&&o.seulTangent>0,'…mêlant noires (vives) et grises (tangentes)');
  A(o.objetsSeul===1,'UN SEUL objet dessiné au lieu d\'un Line + matériau par arête ('+o.objetsSeul+')');
  A(o.natifSeul>0,'la pièce native exacte a ses propres arêtes ('+o.natifSeul+')');
  A(o.duoTotal===o.natifSeul+o.duoImport,'natif + import TOUS dessinés ('+o.duoTotal+' = '+o.natifSeul+'+'+o.duoImport+')');
  A(o.duoTotal>o.natifSeul,'le STEP reçoit bien ses propres arêtes à côté du natif (régression corrigée)');
  A(o.duoTangentes===o.tangent,'les arêtes TANGENTES du STEP survivent à côté du natif ('+o.duoTangentes+')');
  A(o.duoVivres===o.natifSeul+o.sharp,'les vives des deux pièces sont mêlées ('+o.duoVivres+' = '+o.natifSeul+'+'+o.sharp+')');
  A(o.objetsDuo===1,'toujours UN SEUL objet pour les deux ('+o.objetsDuo+')');
  A(o.off===0&&o.objetsOff===0,'overlay coupé : rien de dessiné');
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,900));process.exit(1);});
