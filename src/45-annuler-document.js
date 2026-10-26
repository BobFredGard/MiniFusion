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
  docCheckpoint(); // une modification encore non enregistrée devient d'abord SA propre étape
  const s=docSnap();
  if(s==null)return;
  const top=docUndoStack[docUndoStack.length-1];
  if(!(top&&top.snap===s)){
    docUndoStack.push({snap:s,label:label||'opération',t:++undoTick});
    while(docUndoStack.length>DOC_UNDO_MAX)docUndoStack.shift();
    docRedoStack.length=0;
  }
  docBaseSync(s);
  docUndoUI();
}

/* ── filet universel ─────────────────────────────────────────────────
   Au fil des versions, des modules modifiaient le document sans appeler docPushUndo :
   Ctrl+Z les ignorait ou, pire, annulait l'opération d'AVANT. Plutôt que de courir après
   chaque appel oublié, on compare le document à son dernier état connu (docBase) à
   chaque fin de geste (relâcher la souris, valider un champ, relâcher une touche) et à
   chaque markDirty / faoTouch : toute différence non enregistrée devient une étape.
   CAO, FAO, mise en plan et apparences du rendu vivent dans le même document, donc
   sous le même filet. L'esquisse a le sien (skCheckpoint, plus bas) sur ses tracés.
   - Un module qui gère lui-même la pile (fenêtres dynamiques, scripts) n'est pas
     doublé : si la pile a bougé depuis docBase, on se recale sans rien empiler.
   - Pendant un geste ou un mode en cours (congé, coque, fenêtre d'extrusion…), rien
     n'est relevé : le mode entier devient UNE étape à sa sortie. */
let docBase=null,docBaseKey=null,docBaseDoc=null,docBaseStack=null,docBaseTop=null,docBaseLen=0,docCkT=null;
let undoPtrDown=false,undoActLabel='',undoActT=0;
// Clé de comparaison : l'instantané SANS les champs « _… » (transitoires d'affichage : _fade
// d'une esquisse ouverte, _audit, _health…), comparée nombres à 1e-6 près (relatif) : le
// solveur d'esquisse redépose les points à 1e-8 mm près au premier passage, 1e-12 ensuite.
// Le vrai instantané garde tout ; mais ces écarts-là, à eux seuls, ne font pas une étape —
// ouvrir puis fermer une esquisse sans rien y toucher en laissait une.
function undoKeyRep(k,v){return k.charCodeAt(0)===95?undefined:v;}
function undoSame(a,b){
  if(a===b)return true;
  if(a==null||b==null)return false;
  const eq=(x,y)=>{
    if(x===y)return true;
    if(typeof x==='number'&&typeof y==='number')return Math.abs(x-y)<=1e-6*Math.max(1,Math.abs(x),Math.abs(y));
    if(!x||!y||typeof x!=='object'||typeof y!=='object'||Array.isArray(x)!==Array.isArray(y))return false;
    const kx=Object.keys(x),ky=Object.keys(y);
    if(kx.length!==ky.length)return false;
    for(const k of kx)if(!Object.prototype.hasOwnProperty.call(y,k)||!eq(x[k],y[k]))return false;
    return true;
  };
  try{return eq(JSON.parse(a),JSON.parse(b));}catch(e){return false;}
}
function docSnapKey(){
  try{
    const c=Object.assign({},doc);
    c.sketches=(doc.sketches||[]).map(s=>{const o=Object.assign({},s);delete o._refs;return o;});
    c.features=(doc.features||[]).map(({_mesh,_m,...r})=>r);
    c.cgeo=(doc.cgeo||[]).map(cgClean);
    return JSON.stringify(c,undoKeyRep);
  }catch(e){return null;}
}
function docBaseSync(s){
  docBase=s!=null?s:docSnap();docBaseKey=docSnapKey();docBaseDoc=doc;docBaseStack=docUndoStack;
  docBaseTop=docUndoStack[docUndoStack.length-1]||null;docBaseLen=docUndoStack.length;
}
function docUndoBusy(){
  if(undoPtrDown)return true;
  try{
    if(asmMode==='asm')return true; // l'assemblage a sa propre pile (46)
    if(typeof skEdit!=='undefined'&&skEdit)return true; // l'esquisse aussi (skCheckpoint)
    if((typeof extDyn!=='undefined'&&extDyn)||(typeof fdyn!=='undefined'&&fdyn)||
      (typeof extNew!=='undefined'&&extNew)||(typeof revNew!=='undefined'&&revNew)||
      (typeof combineNew!=='undefined'&&combineNew)||(typeof filMode!=='undefined'&&filMode)||
      (typeof filModeX!=='undefined'&&filModeX)||(typeof draftMode!=='undefined'&&draftMode)||
      (typeof coqueMode!=='undefined'&&coqueMode)||(typeof splitMode!=='undefined'&&splitMode)||
      (typeof repMode!=='undefined'&&repMode)||(typeof mvMode!=='undefined'&&mvMode)||
      (typeof cgMode!=='undefined'&&cgMode)||(typeof faoChainMode!=='undefined'&&faoChainMode)||
      (typeof treeDrag!=='undefined'&&treeDrag))return true;
  }catch(e){}
  return false;
}
function docCheckpoint(){
  if(docCkT){clearTimeout(docCkT);docCkT=null;}
  if(docUndoBusy())return false;
  const cur=docSnap();if(cur==null)return false;
  const top=docUndoStack[docUndoStack.length-1]||null;
  // document remplacé (ouverture, composant activé) ou pile travaillée par un module : on se recale
  if(docBase==null||docBaseDoc!==doc||docBaseStack!==docUndoStack||docBaseTop!==top||docBaseLen!==docUndoStack.length){
    docBaseSync(cur);return false;
  }
  if(cur===docBase)return false;
  if(undoSame(docSnapKey(),docBaseKey)){docBase=cur;return false;} // transitoires, dérive du solveur
  if(!(top&&top.snap===docBase)){
    const lbl=(Date.now()-undoActT<15000&&undoActLabel)||'modification';
    docUndoStack.push({snap:docBase,label:lbl,t:++undoTick});
    while(docUndoStack.length>DOC_UNDO_MAX)docUndoStack.shift();
    docRedoStack.length=0;
  }
  docBaseSync(cur);
  docUndoUI();
  return true;
}
// Différé : une rafale de markDirty (rejeu, glissement) ne relève qu'une fois
function docUndoNudge(){
  if(docCkT)clearTimeout(docCkT);
  docCkT=setTimeout(()=>{docCkT=null;if(undoPtrDown)return;docCheckpoint();skCheckpoint();},300);
}

/* esquisse : même filet sur ses tracés (skUndoStack, 50-esquisse-5) */
let skBase=null,skBaseKey=null,skBaseSk=null,skBaseStack=null,skBaseTop=null,skBaseLen=0;
function skSnapStr(){
  return JSON.stringify({points:skEdit.points,entities:skEdit.entities,constraints:skEdit.constraints,dims:skEdit.dims});
}
function skSnapKey(){
  return JSON.stringify({points:skEdit.points,entities:skEdit.entities,constraints:skEdit.constraints,dims:skEdit.dims},undoKeyRep);
}
function skBaseSync(s){
  skBase=s!=null?s:(skEdit?skSnapStr():null);skBaseKey=skEdit?skSnapKey():null;skBaseSk=skEdit;skBaseStack=skUndoStack;
  skBaseTop=skUndoStack[skUndoStack.length-1]||null;skBaseLen=skUndoStack.length;
}
function skUndoBusy(){
  if(undoPtrDown)return true;
  try{
    if(typeof skDyn!=='undefined'&&skDyn)return true; // saisie d'une longueur au clavier
    if(typeof skDragWalk!=='undefined'&&skDragWalk)return true;
    if(typeof skFilletSess!=='undefined'&&skFilletSess)return true;
  }catch(e){}
  return false;
}
function skCheckpoint(){
  if(typeof skEdit==='undefined'||!skEdit||typeof skUndoStack==='undefined'||skUndoBusy())return false;
  let cur;try{cur=skSnapStr();}catch(e){return false;}
  const top=skUndoStack[skUndoStack.length-1]||null;
  if(skBase==null||skBaseSk!==skEdit||skBaseStack!==skUndoStack||skBaseTop!==top||skBaseLen!==skUndoStack.length){
    skBaseSync(cur);return false;
  }
  if(cur===skBase)return false;
  if(undoSame(skSnapKey(),skBaseKey)){skBase=cur;return false;} // dérive du solveur seulement
  if(!(top&&JSON.stringify(top)===skBase)){
    skUndoStack.push(JSON.parse(skBase));
    if(skUndoStack.length>100)skUndoStack.shift();
    skRedoStack=[];
  }
  skBaseSync(cur);
  try{skUndoBtn();}catch(e){}
  return true;
}

/* ── routage UNIQUE de Ctrl+Z / Ctrl+Y, quel que soit l'espace ──
   Placer (assemblage) → sa pile ; esquisse ouverte → ses tracés ; sinon (CAO, FAO, PLAN,
   Rendu) → le document. Bouton ↩/↪ et clavier passent tous par ici. */
function undoDispatch(redo){
  try{if(asmMode==='asm'){const r=redo?asmRedo():asmUndo();docUndoUI();return r;}}catch(e){}
  if(typeof skEdit!=='undefined'&&skEdit)return redo?skRedoTrans():skUndoTrans(); // esquisse ouverte
  return redo?docRedo():docUndo();
}
// Un champ de texte EN COURS DE FRAPPE garde son propre Ctrl+Z (lettres tapées). Un champ
// seulement focalisé — valeur validée par Entrée, case cochée, liste choisie — le rend à
// l'application : sans cela, Ctrl+Z juste après avoir changé une cote ne faisait rien.
function undoKeyNative(t){
  if(!t)return false;
  if(t.isContentEditable||t.tagName==='TEXTAREA')return true;
  if(t.tagName!=='INPUT')return false;
  const ty=String(t.type||'text').toLowerCase();
  if(['checkbox','radio','button','submit','reset','range','color','file'].indexOf(ty)>=0)return false;
  return !!t._mfEdit;
}
function undoLabelOf(t){
  try{
    if(!t||!t.closest)return '';
    let s='';
    if(/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)){
      const l=t.labels&&t.labels[0];
      s=t.getAttribute('aria-label')||t.title||(l&&l.textContent)||
        (t.previousElementSibling&&t.previousElementSibling.textContent)||t.placeholder||'';
    }
    if(!s){
      const el=t.closest('button,[role=button],[data-tool],.tool,li,a,label,option,summary,[title]');
      if(el)s=el.getAttribute('aria-label')||el.title||el.textContent||'';
    }
    s=String(s).replace(/\s+/g,' ').replace(/\s*\(.*$/,'').trim();
    return s.length>48?s.slice(0,48)+'…':s;
  }catch(e){return '';}
}
(function(){
  if(typeof window==='undefined'||!window.addEventListener)return;
  const act=t=>{const s=undoLabelOf(t);if(s){undoActLabel=s;undoActT=Date.now();}};
  window.addEventListener('pointerdown',e=>{undoPtrDown=true;act(e.target);},true);
  const up=()=>{if(!undoPtrDown)return;undoPtrDown=false;docUndoNudge();};
  window.addEventListener('pointerup',up,true);
  window.addEventListener('pointercancel',up,true);
  window.addEventListener('blur',up);
  window.addEventListener('focusin',e=>{if(e.target)e.target._mfEdit=false;},true);
  window.addEventListener('input',e=>{const t=e.target;if(t&&t.tagName==='INPUT')t._mfEdit=true;},true);
  window.addEventListener('change',e=>{const t=e.target;if(t){t._mfEdit=false;act(t);}docUndoNudge();},true);
  window.addEventListener('keyup',e=>{
    if(['Control','Shift','Alt','Meta'].indexOf(e.key)>=0)return;
    if(e.ctrlKey||e.metaKey)return; // Ctrl+Z / Ctrl+Y relâchés : déjà traités
    if(e.key==='Delete'||e.key==='Backspace'){undoActLabel='suppression';undoActT=Date.now();}
    docUndoNudge();
  },true);
  // Capture sur window : avant les champs qui coupent la propagation (fenêtres dynamiques)
  // et avant les gestionnaires de chaque espace, qui n'ont plus à traiter Ctrl+Z eux-mêmes.
  window.addEventListener('keydown',e=>{
    if(!(e.ctrlKey||e.metaKey)||e.altKey)return;
    const k=String(e.key||'').toLowerCase();
    const undo=k==='z'&&!e.shiftKey,redo=k==='y'||(k==='z'&&e.shiftKey);
    if(!undo&&!redo)return;
    if(undoKeyNative(e.target))return;
    if(document.querySelector&&document.querySelector('.mffDlgBg'))return; // boîte de dialogue ouverte
    e.preventDefault();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    undoDispatch(redo);
  },true);
})();

// Restaure un instantané. Les champs de premier niveau sont remplacés en bloc,
// `sel` est remis à zéro (il peut pointer une fonction disparue) et les modes
  // suspendedus (congé, formulaires) sont refermés : ils)~tiennent un état validé
// pour un document qui n'existe plus.
function docApplySnap(snap){
  let d;
  try{d=JSON.parse(snap);}catch(e){return false;}
  // Une clé apparue APRÈS l'instantané (doc.rendu créé par une première vue de rendu…) n'y
  // figure pas : sans ce retrait, l'annulation la laissait en place.
  Object.keys(doc).forEach(k=>{if(!Object.prototype.hasOwnProperty.call(d,k))delete doc[k];});
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
  // Atelier de rendu ouvert : les apparences (doc.rendu) viennent de changer
  try{if(typeof rd!=='undefined'&&rd){rdRefresh('objets');rdPanel();}}catch(e){}
  docBaseSync(); // état restauré (normalisé par rebuild) = nouvelle référence du filet
  return true;
}

function docUndo(){
  docCheckpoint(); // la dernière modification non encore relevée est bien celle qu'on annule
  if(asmMode==='asm'||asmUndoFirst(false)){const r=asmUndo();docUndoUI();return r;} // assemblage : son annulation (46)
  if(!docUndoStack.length){docUndoUI();try{faceEl.textContent='↩ Rien à annuler.';}catch(e){}return false;}
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
  docCheckpoint(); // une modification faite après l'annulation a vidé la pile de rétablissement
  if(asmMode==='asm'||asmUndoFirst(true)){const r=asmRedo();docUndoUI();return r;}
  if(!docRedoStack.length){docUndoUI();try{faceEl.textContent='↪ Rien à rétablir.';}catch(e){}return false;}
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
    u.onclick=()=>undoDispatch(false);
    const r=document.createElement('button');
    r.id='btnRedo';
    r.textContent='↪ Rétablir';
    r.title='Rétablir la modification annulée (Ctrl+Y)';
    r.onclick=()=>undoDispatch(true);
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
// Ctrl+Z / Ctrl+Y : routage unique plus haut (undoDispatch, en capture). Ici : Suppr, Échap.
window.addEventListener('keydown',e=>{
  if(asmKey(e))return; // vue d'assemblage : Suppr, Échap (47)
  const ds=$('sketchOverlay');
  if(ds&&ds.classList.contains('open'))return;   // l'esquisse possède Suppr et Ctrl+Z
  // Espace PLAN (98) : cède Suppr/Escape au plan ouvert (ses propres handlers en capture)
  try{if(typeof mepIsOpen==='function'&&mepIsOpen()&&(e.key==='Delete'||e.key==='Backspace'||e.key==='Escape'))return;}catch(e2){}
  const t=e.target;
  if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
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
