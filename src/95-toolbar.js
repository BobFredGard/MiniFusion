/* ---------- toolbar ---------- */
// Bouton « Révolution » : la coque HTML (boutons, CSS) vit dans le livrable GÉNÉRÉ, qu'on
// n'édite jamais à la main — le bouton est donc créé ici, dans les sources, juste avant
// l'Extrusion. Idempotent : rien n'est ajouté s'il existe déjà.
(function(){
  if(!document.getElementById('btnRevolve')){
    const b=document.getElementById('btnExtrude');
    if(b&&b.parentNode){
      const n=document.createElement('button');
      n.id='btnRevolve';
      n.textContent='🔄 Révolution';
      n.title='Révolution 360° : le profil de l\'esquisse pivote autour d\'un axe (ligne de construction de l\'esquisse ou axe système X/Y/Z).';
      b.parentNode.insertBefore(n,b);
    }
  }
})();
const btnRevolve=$('btnRevolve');
if(btnRevolve)btnRevolve.onclick=()=>askRevolve(sel.kind==='sketch'?sel.id:null);
$('btnSketch').onclick=()=>{
  if(skEdit)return;
  if(selFaces&&selFaces.length){newSketchOnFace();return;}
  if(sel.kind==='plane'&&typeof sel.id==='string'&&PLANES[sel.id]){newSketch(sel.id);return;}
  newSketch('XY');
};
$('btnExtrude').onclick=()=>askExtrude(sel.kind==='sketch'?sel.id:null);
$('btnFillet').onclick=()=>{if(filMode||filModeX)exitFilletMode();else enterFilletMode();};
$('btnChamfer').onclick=()=>{if(filModeX&&filModeX.kind==='chamfer'){exitFilletMode();return;}if(filMode||filModeX)exitFilletMode(true);enterExactFilletMode(null,'chamfer');};
$('btnRepeat').onclick=()=>{if(repMode)exitRepMode();else enterRepMode();};
$('btnFit').onclick=showAll;
$('btnSelfTest').onclick=runSelfTests;
if($('btnRebuild'))$('btnRebuild').onclick=()=>{
  // FORCE le rejeu : sans cela la garde « rien n'a changé » court-circuite et le bouton
  // semblait ne rien faire (régression introduite par l'optimisation de reconstruction).
  builtVersion=-1;builtHash=null;builtEngine=null;
  faceEl.textContent='Recalcul demandé…';
  try{rebuild();}catch(e){faceEl.textContent+='\n[Recalcul] '+String((e&&e.message)||e);}};

// ---------- rafraîchissement DUR ----------
function hardRefresh(){
  // On jette TOUT ce qui pourrait être périmé, puis on rejoue le modèle entier :
  //   · points de contrôle du rejeu (solides accumulés mémorisés entre deux reconstructions)
  //   · empreinte du document (mémoïsée) et état du dernier affichage valide
  //   · tous les corps affichés (géométries et matériaux) et le solide exact vivant
  // Le noyau OCCT, lui, n'est PAS rechargé : le recompiler coûterait 10 à 60 s. S'il est
  // lui-même bloqué, c'est le rechargement de la page (navigateur) qui redemarre.
  const t0=performance.now();
  let nCk=0;try{nCk=(typeof occCk!=='undefined'&&occCk.length)||0;occCkClear();}catch(e){}
  _hashMemo=null;_hashVer=-1;
  builtHash=null;builtEngine=null;builtVersion=-1;
  try{for(const b of bodies){try{scene.remove(b.mesh);}catch(e){}try{if(b.mesh&&b.mesh.geometry)b.mesh.geometry.dispose();}catch(e){}}}catch(e){}
  bodies=[];occLive=null;selFaces=[];
  try{clearMeasure();}catch(e){}
  try{scene.children.filter(o=>o.name&&o.name.startsWith('sk_')).forEach(o=>{try{scene.remove(o);}catch(e){}});}catch(e){}
  let tris=0;try{scene.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.attributes&&o.geometry.attributes.position)tris+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;});}catch(e){}
  faceEl.textContent='Rafraîchissement dur : caches jetés ('+nCk+' point(s) de contrôle), rejeu complet…';
  let err=null;
  try{rebuild();}catch(e){err=e;}
  const ms=Math.round(performance.now()-t0);
  let nb=0,t2=0;
  try{nb=bodies.length;scene.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.attributes&&o.geometry.attributes.position)t2+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;});}catch(e){}
  const lignes=[];
  lignes.push('Code '+APP_VER+' — rafraîchissement dur terminé en '+ms+' ms');
  lignes.push('· caches jetés : '+nCk+' point(s) de contrôle du rejeu, empreinte, affichage');
  lignes.push('· moteur : '+(occEngineMsg||'?'));
  lignes.push('· modèle : '+doc.features.length+' fonction(s), '+doc.sketches.length+' esquisse(s)');
  lignes.push('· affichage : '+nb+' corps, ≈'+Math.round(t2).toLocaleString('fr')+' triangles (avant : ≈'+Math.round(tris).toLocaleString('fr')+')');
  if(err)lignes.push('ERREUR : '+String((err&&err.message)||err));
  else if(!nb)lignes.push('⚠ aucun corps affiché — le modèle est vide ou toutes les fonctions sont masquées.');
  faceEl.textContent=lignes.join('\n');
  try{refreshParts();renderTree();renderProps();}catch(e){}
  return {ms:ms,nCk:nCk,bodies:nb,tris:Math.round(t2),engine:occEngineMsg,err:err?String(err.message||err):null};
}
if($('btnHard'))$('btnHard').onclick=()=>{try{hardRefresh();}catch(e){faceEl.textContent+='\n[Hard] '+String((e&&e.message)||e);}};
// Raccourci : Ctrl+Maj+R (F5 est déjà pris par la vue isométrique)
addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.shiftKey&&(e.key==='R'||e.key==='r')){
    const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
    e.preventDefault();try{hardRefresh();}catch(err){}
  }
});
try{
  if($('optTint')){
    if(partTint())$('optTint').value=cssHex(partTint());
    $('optTint').addEventListener('input',()=>{
      const m=/^#?([0-9a-fA-F]{6})$/.exec($('optTint').value.trim());if(!m)return;
      doc.tint=parseInt(m[1],16);
      bodies.forEach(b=>{if(!b.ghost&&b.mesh&&b.mesh.material&&b.mesh.material.color)b.mesh.material.color.setHex(doc.tint);});
    });
    $('optTint').addEventListener('change',()=>{markDirty();rebuild();});
  }
  if($('optTintAuto'))$('optTintAuto').onclick=()=>{delete doc.tint;markDirty();rebuild();};
}catch(e){}
if($('btnOccWasm'))$('btnOccWasm').onclick=()=>$('fileWasm').click();
if($('fileWasm'))$('fileWasm').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
    occBaseMsg='OCCT : lecture du .wasm local…';occStatus();
    const buf=await f.arrayBuffer();
    // On met le noyau en cache : les lancements suivants démarrent automatiquement (file://).
    if(!confirm('Compilation du noyau exact OCCT (~65 Mo).\n\nL’interface sera FIGÉE pendant la compilation (10 à 60 s, parfois plus).\n\nContinuer ?')){e.target.value='';return;}
    occCacheSave(buf).then(()=>{occBaseMsg='OCCT : noyau mis en cache — prochain lancement automatique.';occStatus();}).catch(()=>{});
    await bootWasmBinary(buf);
  }
  catch(err){occBaseMsg='OCCT : lecture impossible ('+err.message+')';occStatus();}
  e.target.value='';
});
try{if($('optMirror')){$('optMirror').checked=mirrorOn;$('optMirror').onchange=()=>{mirrorOn=$('optMirror').checked;try{localStorage.setItem('minifusion_mirror',mirrorOn?'on':'off');}catch(e){}refreshMirror();};}}catch(e){}
try{if($('optAxes')){$('optAxes').checked=axHelper?axHelper.visible:true;$('optAxes').onchange=()=>{if(axHelper)axHelper.visible=$('optAxes').checked;markDirty();};}}catch(e){}
try{if($('optZoomInv')){$('optZoomInv').checked=zoomInv;$('optZoomInv').onchange=()=>{zoomInv=$('optZoomInv').checked;if(controls)controls.zoomSpeed=zoomInv?-1:1;try{localStorage.setItem('minifusion_zoominv',zoomInv?'on':'off');}catch(e){}markDirty();};}}catch(e){}
if($('btnNew'))$('btnNew').onclick=()=>{
  if(!confirm('Nouveau modèle ? Le document courant non sauvé sera perdu.'))return;
  try{exitFilletMode(true);}catch(e){}
  if(skEdit)closeSketch(false);
  doc={name:'Sans titre',tint:0,sketches:[],features:[],bodyVis:{}};
  sel={kind:null,id:null};selFaces=[];fileHandle=null;uidN=0;builtHash=null;builtEngine=null;builtVersion=-1;
  try{occCkClear();}catch(e){}
  markDirty();rebuild();renderProps();showAll();
  faceEl.textContent='Nouveau modèle. Créez une esquisse.';
};
try{if($('optEdges')){$('optEdges').value=edgeMode;$('optEdges').onchange=()=>{edgeMode=$('optEdges').value;try{localStorage.setItem('minifusion_edges',edgeMode);}catch(e){}buildEdgeOverlay();};}}catch(e){}
$('clipOn').onchange=applyClip;$('clipPos').oninput=applyClip;$('clipFlip').onchange=applyClip;
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
// --- arborescence dans la vue 3D : onglet de repli + menu réglages ---
(function(){
  const wrap=$('treeWrap'),tog=$('treeToggle');
  if(wrap&&tog){
    const fold=()=>{wrap.classList.toggle('folded');tog.textContent=wrap.classList.contains('folded')?'❮':'❯';
      tog.title=wrap.classList.contains('folded')?'Déplier l’arborescence':'Replier l’arborescence';};
    tog.onclick=fold;
    try{if(localStorage.getItem('minifusion_treeFolded')==='1')fold();}catch(e){}
    tog.addEventListener('click',()=>{try{localStorage.setItem('minifusion_treeFolded',wrap.classList.contains('folded')?'1':'0');}catch(e){}});
  }
  const btn=$('btnSettings'),menu=$('setMenu');
  if(btn&&menu){
    const close=()=>menu.classList.remove('open');
    btn.onclick=ev=>{ev.stopPropagation();menu.classList.toggle('open');};
    menu.onclick=ev=>ev.stopPropagation();
    addEventListener('click',close);
    addEventListener('keydown',e=>{if(e.key==='Escape')close();});
    if($('setFit'))$('setFit').onclick=()=>{showAll();close();};
    const fr=$('optFresh');
    if(fr){
      fr.checked=!!freshHard;
      fr.onchange=()=>{
        freshHard=fr.checked;
        try{localStorage.setItem('minifusion_freshHard',freshHard?'1':'0');}catch(e){}
        faceEl.textContent=freshHard
          ?'Rafraîchissement dur activé : chaque modification reconstruit le modèle entier.'
          :'Rejeu rapide activé : les parties inchangées de la timeline sont réutilisées (moins frais, ~4× plus rapide).';
        try{occCkClear();}catch(e){}
        builtVersion=-1;_hashMemo=null;_hashVer=-1;
        markDirty();rebuild();renderProps();
      };
    }
  }
})();
$('skOk').onclick=()=>closeSketch(true);$('skCancel').onclick=()=>closeSketch(false);
$('skUndo').onclick=()=>skUndoTrans();$('skRedo').onclick=()=>skRedoTrans();$('skClear').onclick=()=>skClearAll();
window.addEventListener('pointerdown',e=>{if(!$('ctxMenu').contains(e.target))hideCtx();if(!$('ctxMenu3D').contains(e.target))hideCtx3D();});
