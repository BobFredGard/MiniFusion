/* ---------- annuler / rétablir au niveau du DOCUMENT ---------- */
// L'undo existant (skUndoStack, dans 50-esquisse) ne couvre QUE le tracé d'une
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
    return JSON.stringify(c);
  }catch(e){return null;}
}

// À appeler AVANT de muter le document. Un instantané identique au précédent est
// ignoré : inutile d'empiler « rien n'a changé » (glisser, commits répétés).
function docPushUndo(label){
  const s=docSnap();
  if(s==null)return;
  const top=docUndoStack[docUndoStack.length-1];
  if(top&&top.snap===s)return;
  docUndoStack.push({snap:s,label:label||'opération'});
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
  sel={kind:null,id:null};
  if(typeof treeSel!=='undefined')treeSel=[];
  try{if(filMode)exitFilletMode(true);}catch(e){}
  try{if(filModeX)exitExactFilletMode(true);}catch(e){}
  // Un dépouillage en cours d'édition joue sur occSkipFeat (rejeu sans la fonction) : le
  // quitter sans le remettre à null laisserait le solide amputé de cette fonction.
  try{if(typeof draftMode!=='undefined'&&draftMode)exitDraftMode(true);}catch(e){}
  try{if(typeof repMode!=='undefined'&&repMode)exitRepMode();}catch(e){}
  try{if(typeof extNew!=='undefined'&&extNew)extNew=null;}catch(e){}
  try{if(typeof revNew!=='undefined'&&revNew)revNew=null;}catch(e){}
  markDirty();rebuild();
  renderTree();renderProps();refreshParts();
  try{buildEdgeOverlay();}catch(e){}
  try{refreshMirror();}catch(e){}
  return true;
}

function docUndo(){
  if(!docUndoStack.length){docUndoUI();return false;}
  const cur=docSnap();
  const e=docUndoStack.pop();
  if(cur!=null)docRedoStack.push({snap:cur,label:e.label});
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
  if(!docRedoStack.length){docUndoUI();return false;}
  const cur=docSnap();
  const e=docRedoStack.pop();
  if(cur!=null)docUndoStack.push({snap:cur,label:e.label});
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
  if(u){
    const n=docUndoStack.length;
    u.textContent=n?('↩ Annuler ('+n+')'):'↩ Annuler';
    u.disabled=!n;
    u.title=n?('Annuler : '+docUndoStack[n-1].label+'  (Ctrl+Z)'):'Rien à annuler';
  }
  if(r){
    const n=docRedoStack.length;
    r.textContent=n?('↪ Rétablir ('+n+')'):'↪ Rétablir';
    r.disabled=!n;
    r.title=n?('Rétablir : '+docRedoStack[n-1].label+'  (Ctrl+Y)'):'Rien à rétablir';
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
    u.onclick=()=>docUndo();
    const r=document.createElement('button');
    r.id='btnRedo';
    r.textContent='↪ Rétablir';
    r.title='Rétablir la modification annulée (Ctrl+Y)';
    r.onclick=()=>docRedo();
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
  const ds=$('sketchOverlay');
  if(ds&&ds.classList.contains('open'))return;   // l'esquisse possède Suppr et Ctrl+Z
  const t=e.target;
  if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
  const ctrl=e.ctrlKey||e.metaKey;
  if(ctrl&&!e.altKey){
    const k=String(e.key||'').toLowerCase();
    if(k==='z'&&!e.shiftKey){if(docUndoStack.length||docRedoStack.length){e.preventDefault();docUndo();}return;}
    if(k==='y'||(k==='z'&&e.shiftKey)){if(docRedoStack.length){e.preventDefault();docRedo();}return;}
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
