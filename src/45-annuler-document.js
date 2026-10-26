/* ---------- annuler / rétablir au niveau du DOCUMENT ---------- */
// L'undo existant (skUndoStack, dans 50-esquisse-5-panneau-audit) ne couvre QUE le tracé d'une
// esquisse. Ici : toute opération qui MODIFIE le modèle — création, suppression,
// changement de paramètre — empile un instantané du document.
//
// Instantané = le JSON du document, exactement celui de la sauvegarde. C'est un
// choix vérifié, pas supposé : test_undo_aller_retour.cjs prouve qu'un aller-retour
// JSON.parse(JSON.stringify(doc)) est BIT À BIT identique et rejoue le même solide
// (10 faces / 27 arêtes avant et après), avec l'hôte d'esquisse (antériorité),
// les références entre fonctions (xfillet.target, repeat.base), la visibilité et
// les contraintes. Aucune valeur non sérialisable (undefined/NaN) dans le document.
//
// ATTENTION : rebuild() NORMALISE le document (migrateSketch ajoute le point
// d'origine d'une esquisse). C'est sans conséquence — la migration est idempotente
// et refait à chaque rebuild — mais un instantané peut donc être « plus propre » que
// l'état affiché, jamais plus pauvre.

let docUndoStack=[],docRedoStack=[];
const DOC_UNDO_MAX=40; // au-delà, on oublie les plus anciennes étapes

function docSnap(){
  try{
    // Même normalisation que serialise : on ne stocke JAMAIS les transitoires
    // (_mesh/_m sur les fonctions, _refs sur les esquisses). Sans cela un import
    // STEP/STL gonflait chaque instantané d'un Mesh three.js complet (jusqu'à 40),
    // et au retour JSON.parse produisait un objet plat sans updateMatrixWorld :
    // crash au rejeu suivant (f._mesh.updateMatrixWorld dans 30).
    const c=Object.assign({},doc);
    c.sketches=(doc.sketches||[]).map(s=>{const o=Object.assign({},s);delete o._refs;return o;});
    c.features=(doc.features||[]).map(({_mesh,_m,...r})=>r);
    c.cgeo=(doc.cgeo||[]).map(cgClean);
    return JSON.stringify(c);
  }catch(e){return null;}
}

// À appeler AVANT de muter le document. Un instantané identique au précédent est
// ignoré : inutile d'empiler « rien n'a changé » (glisser, commits répétés).
// Horloge commune aux annulations du document et de l'assemblage (46) : une opération
// d'assemblage qui modifie aussi le document (composant depuis un corps) s'annule par
// Ctrl+Z en mode pièce, dans l'ordre où elle a été faite.
let undoTick=0;
function docPushUndo(label){
  const s=docSnap();
  if(s==null)return;
  const top=docUndoStack[docUndoStack.length-1];
  if(top&&top.snap===s)return;
  docUndoStack.push({snap:s,label:label||'opération',t:++undoTick});
  while(docUndoStack.length>DOC_UNDO_MAX)docUndoStack.shift();
  docRedoStack.length=0;
  docUndoUI();
}

// Restaure un instantané. Les champs de premier niveau sont remplacés en bloc,
// `sel` est remis à zéro (il peut pointer une fonction disparue) et les modes
  // suspendedus (congé, formulaires) sont refermés : ils)~tiennent un état validé
// pour un document qui n'existe plus.
function docApplySnap(snap){
  let d;
  try{d=JSON.parse(snap);}catch(e){return false;}
  Object.keys(d).forEach(k=>{doc[k]=d[k];});
  if(!Array.isArray(doc.sketches))doc.sketches=[];
  if(!Array.isArray(doc.features))doc.features=[];
  if(!Array.isArray(doc.cgeo))doc.cgeo=[];
  sel={kind:null,id:null};
  if(typeof treeSel!=='undefined')treeSel=[];
  try{if(filMode)exitFilletMode(true);}catch(e){}
  try{if(filModeX)exitExactFilletMode(true);}catch(e){}
  // Un dépouillage en cours d'édition joue sur occSkipFeat (rejeu sans la fonction) : le
  // quitter sans le remettre à null laisserait le solide amputé de cette fonction.
  try{if(typeof draftMode!=='undefined'&&draftMode)exitDraftMode(true);}catch(e){}
  // Une coque en cours d'édition joue aussi sur occSkipFeat : même remise à null.
  try{if(typeof coqueMode!=='undefined'&&coqueMode)exitCoqueMode(true);}catch(e){}
  try{if(typeof splitMode!=='undefined'&&splitMode)exitSplitMode(true);}catch(e){}
  try{if(typeof repMode!=='undefined'&&repMode)exitRepMode();}catch(e){}
  try{if(typeof extNew!=='undefined'&&extNew)extNew=null;}catch(e){}
  try{if(typeof revNew!=='undefined'&&revNew)revNew=null;}catch(e){}
  markDirty();rebuild();
  renderTree();renderProps();refreshParts();
  // doc.fao vit dans le même document : l'arbre FAO, sa fiche et l'aperçu doivent
  // suivre la restauration (même garde-fou que les sorties de mode plus haut).
  try{ if(typeof faoRefreshFaoUI==='function')faoRefreshFaoUI(); }catch(e){}
  try{ if(typeof faoRefreshPreview==='function')faoRefreshPreview(); }catch(e){}
  try{buildEdgeOverlay();}catch(e){}
  try{refreshMirror();}catch(e){}
  // doc.mep vient d'être remplacé en bloc : la planche/overlay PLAN doit suivre.
  try{if(typeof window!=='undefined'&&typeof window.mepRefresh==='function')window.mepRefresh();}catch(e){}
  return true;
}

function docUndo(){
  if(asmMode==='asm'||asmUndoFirst(false)){const r=asmUndo();docUndoUI();return r;} // assemblage : son annulation (46)
  if(!docUndoStack.length){docUndoUI();return false;}
  const cur=docSnap();
  const e=docUndoStack.pop();
  if(cur!=null)docRedoStack.push({snap:cur,label:e.label,t:++undoTick});
  if(!docApplySnap(e.snap)){ // instantané illisible : on ne le perd pas
    docUndoStack.push(e);
    faceEl.textContent='↩ Annulation impossible (instantané illisible).';
    return false;
  }
  faceEl.textContent='↩ Annulé : '+e.label+
    (docUndoStack.length?('  ('+docUndoStack.length+' étape(s) restante(s))'):'  — plus rien à annuler');
  docUndoUI();
  return true;
}

function docRedo(){
  if(asmMode==='asm'||asmUndoFirst(true)){const r=asmRedo();docUndoUI();return r;}
  if(!docRedoStack.length){docUndoUI();return false;}
  const cur=docSnap();
  const e=docRedoStack.pop();
  if(cur!=null)docUndoStack.push({snap:cur,label:e.label,t:++undoTick});
  if(!docApplySnap(e.snap)){
    docRedoStack.push(e);
    faceEl.textContent='↪ Rétablissement impossible (instantané illisible).';
    return false;
  }
  faceEl.textContent='↪ Rétabli : '+e.label+
    (docRedoStack.length?('  ('+docRedoStack.length+' étape(s) restante(s))'):'');
  docUndoUI();
  return true;
}

function docUndoUI(){
  const u=$('btnUndo'),r=$('btnRedo');
  // V0.7.6 : pendant une esquisse, les flèches suivent l'annulation des TRACÉS (skUndoStack)
  if(typeof skEdit!=='undefined'&&skEdit&&typeof skUndoStack!=='undefined'){
    if(u){const n=skUndoStack.length;u.textContent=n?('↩ Annuler ('+n+')'):'↩ Annuler';u.disabled=!n;u.title=n?'Annuler le dernier tracé (Ctrl+Z)':'Rien à annuler';}
    if(r){const n=skRedoStack.length;r.textContent=n?('↪ Rétablir ('+n+')'):'↪ Rétablir';r.disabled=!n;r.title=n?'Rétablir le tracé (Ctrl+Y)':'Rien à rétablir';}
    return;
  }
  // mode Placer : l'annulation de l'assemblage ; mode pièce : celle du document, sauf si la
  // dernière opération est une opération d'assemblage qui l'a modifié (46 : asmUndoFirst)
  const US=asmMode==='asm'||asmUndoFirst(false)?asmUndoStack:docUndoStack,RS=asmMode==='asm'||asmUndoFirst(true)?asmRedoStack:docRedoStack;
  if(u){
    const n=US.length;
    u.textContent=n?('↩ Annuler ('+n+')'):'↩ Annuler';
    u.disabled=!n;
    u.title=n?('Annuler : '+US[n-1].label+'  (Ctrl+Z)'):'Rien à annuler';
  }
  if(r){
    const n=RS.length;
    r.textContent=n?('↪ Rétablir ('+n+')'):'↪ Rétablir';
    r.disabled=!n;
    r.title=n?('Rétablir : '+RS[n-1].label+'  (Ctrl+Y)'):'Rien à rétablir';
  }
}

// La coque HTML vit dans le livrable GÉNÉRÉ, jamais éditée à la main : la ligne
// est donc créée ici, à côté du bouton « Recalculer ». Idempotent.
(function(){
  try{
    if($('btnUndo'))return;
    const hote=$('btnRebuild');
    if(!hote||!hote.parentNode)return;
    const row=document.createElement('div');
    row.className='row';
    row.style.marginTop='6px';
    const u=document.createElement('button');
    u.id='btnUndo';
    u.textContent='↩ Annuler';
    u.title='Annuler la dernière modification du modèle (Ctrl+Z)';
    // V0.7.6 : pendant une esquisse, la flèche annule le dernier tracé (comme Ctrl+Z) — le bandeau
    // Esquisse n'a plus ses propres boutons Annuler / Rétablir
    u.onclick=()=>{if(typeof skEdit!=='undefined'&&skEdit&&typeof skUndoTrans==='function')return skUndoTrans();docUndo();};
    const r=document.createElement('button');
    r.id='btnRedo';
    r.textContent='↪ Rétablir';
    r.title='Rétablir la modification annulée (Ctrl+Y)';
    r.onclick=()=>{if(typeof skEdit!=='undefined'&&skEdit&&typeof skRedoTrans==='function')return skRedoTrans();docRedo();};
    row.appendChild(u);row.appendChild(r);
    hote.parentNode.parentNode.insertBefore(row,hote.parentNode.nextSibling);
    docUndoUI();
  }catch(e){}
})();

// Aide de l'arbre : les deux gestes nouveaux (Ctrl+clic = lot, Suppr = supprimer).
// Texte mis à jour depuis le code, pour la même raison que la ligne ci-dessus.
(function(){
  try{
    const wrap=document.querySelector?document.querySelector('.ovlNote'):null;
    if(!wrap)return;
    wrap.textContent='Clic = sélectionner · Ctrl+clic = ajouter au lot · Suppr = supprimer le lot · '+
      'Ctrl+Z = annuler · double-clic = éditer · clic droit = menu (renommer / temps / supprimer).';
  }catch(e){}
})();

// ── raccourcis ───────────────────────────────────────────────────────────────
// Ctrl+Z / Ctrl+Y hors esquisse : l'undo de tracé (50) garde la main quand
// l'esquisse est ouverte, et un champ de saisie a toujours priorité.
window.addEventListener('keydown',e=>{
  if(asmKey(e))return; // vue d'assemblage : Ctrl+Z, Suppr, Échap (47)
  const ds=$('sketchOverlay');
  if(ds&&ds.classList.contains('open'))return;   // l'esquisse possède Suppr et Ctrl+Z
  // Espace PLAN (98) : cède Suppr/Escape au plan ouvert (ses propres handlers en capture)
  try{if(typeof mepIsOpen==='function'&&mepIsOpen()&&(e.key==='Delete'||e.key==='Backspace'||e.key==='Escape'))return;}catch(e2){}
  const t=e.target;
  if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
  const ctrl=e.ctrlKey||e.metaKey;
  if(ctrl&&!e.altKey){
    const k=String(e.key||'').toLowerCase();
    if(k==='z'&&!e.shiftKey){if(docUndoStack.length||docRedoStack.length||asmUndoFirst(false)){e.preventDefault();docUndo();}return;}
    if(k==='y'||(k==='z'&&e.shiftKey)){if(docRedoStack.length||asmUndoFirst(true)){e.preventDefault();docRedo();}return;}
  }
  // Faces sélectionnées dans la vue 3D (dernier clic dans la vue) : Suppr les retire du
  // solide (85-suppression-face). Sinon, Suppr supprime la sélection de l'arbre.
  if(e.key==='Delete'&&typeof delFacesWanted==='function'&&delFacesWanted()){
    e.preventDefault();
    deleteSelectedFaces();
    return;
  }
  if((e.key==='Delete'||e.key==='Backspace')&&treeSelIds().length){
    e.preventDefault();
    treeDeleteSel();
    return;
  }
  if(e.key==='Escape'&&treeSel&&treeSel.length>1){
    treeSel=[];renderTree();renderProps();
    faceEl.textContent='Sélection multiple annulée.';
  }
});
