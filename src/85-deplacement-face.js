/* ---------- déplacement d'une face (push/pull) ----------
   Le calcul est dans 20-noyau (occMoveFaceOnce). Ici : le mode de sélection au clic, la
   création de la fonction et les réglages. Le déplacement se fait le long de la normale
   SORTANTE de la face cliquée : distance positive = la face avance, négative = elle rentre.
   La face est mémorisée par une référence durable (centre + normale + dimensions), pas par
   son numéro : le numéro d'une face change dès qu'une opération en ajoute une autre, alors
   que la face visée, elle, reste la même.

   V0.21.6 : multi-sélection — clic = ajouter / re-clic = retirer (surbrillance orange),
   distance commune, Appliquer (Entrée) / Échap. La fonction mémorise `faces` (toutes) et
   `ref` (la première, pour les chemins qui ne lisent qu'une face). Le même mode ÉDITE une
   fonction existante (« Re-sélectionner »), comme la coque (87). */
let mvMode=null; // null | {faces:[ref], dist, editing:id|null}
let mvGroup=null; // surbrillance 3D des faces retenues

// Bouton « Déplacer une face » : la coque HTML étant générée et jamais éditée à la main,
// il est créé ICI, dans les sources, comme le bouton Révolution. Idempotent. Il est placé
// juste après l'Extrusion ; le regroupement par type (96-bandeau-groupes.js) le rangera
// ensuite dans le menu « Modifier le solide ».
(function(){
  if(document.getElementById('btnMoveFace'))return;
  const after=document.getElementById('btnExtrude');
  if(!after||!after.parentNode)return;
  const b=document.createElement('button');
  b.id='btnMoveFace';
  b.textContent='\u{1F4D0} Déplacer une face';
  b.title='Déplacer une ou plusieurs faces le long de leur normale sortante : distance positive, la face avance ; négative, elle rentre';
  after.parentNode.insertBefore(b,after.nextSibling);
})();

function mvName(f){
  const d=+f.dist||0,n=mvRefs(f).length;
  return `Déplacement ${n>1?'de '+n+' faces':'de face'} ${d>0?'+':''}${String(d).replace('.',',')} mm`;
}
function mvClearHl(){
  if(!mvGroup)return;
  mvGroup.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});
  scene.remove(mvGroup);mvGroup=null;
}
function mvPaint(){
  mvClearHl();
  if(mvMode)mvGroup=facesHlGroup(mvMode.faces,0xff9f0a,'mvFaces');
}
function mvHelp(){
  const nf=mvMode?mvMode.faces.length:0;
  faceEl.innerHTML='<b>📐 '+(mvMode&&mvMode.editing?'Édition du déplacement de face':'Déplacement de face')+'</b><br><span class="note">'+
    (nf?nf+' face(s) retenue(s). ':'')+'Cliquez les faces à déplacer (re-clic = retirer), réglez la distance puis '+
    '<b>Appliquer</b> (<b>Entrée</b>). <b>Échap</b> annule.</span>';
}
function enterMoveFaceMode(editF){
  const editing=(editF&&editF.type==='xmove')?editF:null;
  if(mvMode){if(editing&&mvMode.editing===editing.id)return;exitMoveFaceMode(true);}
  if(!occHas()||!occExactForTool()){ // STEP seul compris
    faceEl.textContent='Déplacement de face : solide exact indisponible (OCCT non chargé ou aucun volume).';
    return;
  }
  try{if(draftMode)exitDraftMode(true);}catch(e){}
  try{if(coqueMode)exitCoqueMode(true);}catch(e){}
  mvMode={faces:[],dist:5,editing:editing?editing.id:null};
  if(editing){
    // Édition : rejeu SANS la fonction (occSkipFeat) → les faces d'origine redeviennent
    // cliquables et se repeignent. Même stratégie que congé/dépouillage/coque.
    mvMode.faces=mvRefs(editing).filter(r=>r&&Array.isArray(r.pos)&&Array.isArray(r.n)&&Array.isArray(r.dim))
      .map(r=>{const o={pos:r.pos.slice(),n:r.n.slice(),dim:r.dim.slice(),_ord:-1};if(typeof r._bid==='string')o._bid=r._bid;return o;});
    mvMode.dist=+editing.dist||0;parFxFrom(editing,mvMode,['dist']);
    occSkipFeat=editing.id;
    tlEditLock(editing);
    if(!occExactForTool(true)){occSkipFeat=null;mvMode=null;tlEditUnlock();faceEl.textContent='Déplacement de face : recalcul impossible.';return;}
    coqueOrdIdx=new Map(); // un parcours des faces par solide pour toute la sélection (87)
    try{mvMode.faces.forEach(r=>{try{r._ord=coqueOrdOf(r);}catch(e){r._ord=-1;}});}finally{coqueOrdIdx=null;}
  }
  try{buildEdgeOverlay();}catch(e){}
  try{applyClip();}catch(e){}
  mvPaint();renderMvPanel();mvHelp();
}
function exitMoveFaceMode(silent){
  if(!mvMode)return;
  const wasEditing=!!mvMode.editing;
  mvMode=null;mvClearHl();
  if(wasEditing){occSkipFeat=null;tlEditUnlock();markDirty();try{rebuild();}catch(e){}}
  occStepForceEnd();
  try{clearHover();}catch(e){}
  if(!silent){try{faceEl.textContent='Déplacement de face : annulé.';}catch(e){}try{renderProps();}catch(e){}}
}
// Face exacte sous le curseur (le groupe de triangles donne l'index BRep de la face,
// résolu sur le SOLIDE DU CORPS cliqué — multi-corps, voir occFaceOfHit dans 20-noyau).
function mvFaceUnder(e){
  if(!occHas()||!occLive||!occLive.shape)return null;
  try{
    const h=pick(e);
    if(!h||!h.object||!h.object.geometry)return null;
    const hit=occFaceOfHit(h.object,h.faceIndex);
    if(!hit||!hit.face)return null;
    const ref=occFaceRef(hit.face);
    try{hit.face.delete();}catch(e){}
    if(!ref)return null;
    // `_ord`/`_bid` = session (surbrillance seule), jamais persistés tels quels.
    if(hit.bd)ref._bid=hit.bd.id;
    ref._ord=hit.ord;
    return {ref:ref,ord:hit.ord};
  }catch(e){return null;}
}
function mvFaceHover(e){
  if(!mvMode)return;
  renderer.domElement.style.cursor='pointer';
}
// Clic : ajoute la face à la sélection, ou la retire si elle y est déjà.
function mvFaceCommit(e){
  if(!mvMode)return;
  const hit=mvFaceUnder(e);
  if(!hit){
    faceEl.textContent='Déplacement de face : cliquez une face plane ou cylindrique du solide exact.';
    return;
  }
  const k=coqueKey(hit.ref);
  const i=mvMode.faces.findIndex(r=>coqueKey(r)===k);
  if(i>=0)mvMode.faces.splice(i,1);else mvMode.faces.push(hit.ref);
  mvPaint();renderMvPanel();mvHelp();
}
/* ---------- panneau ---------- */
function renderMvPanel(){
  const p=document.getElementById('props');if(!p)return;
  p.innerHTML='';if(!mvMode)return;
  const h=document.createElement('div');h.className='pnl-h';
  h.textContent=mvMode.editing?'📐 Édition du déplacement de face':'📐 Déplacement de face';
  p.appendChild(h);
  if(mvMode.faces.length){
    const lst=document.createElement('div');lst.className='lst';
    mvMode.faces.forEach((fr,i)=>{
      const r2=document.createElement('div');r2.className='item';
      const s=document.createElement('span');
      s.textContent=(fr._ord>=0?'✅ ':'⚠ ')+'▸ centre ('+fr.pos.map(v=>(+v).toFixed(1)).join(' ; ')+') mm';
      r2.appendChild(s);
      const x=document.createElement('button');x.textContent='✕';x.title='Retirer cette face';
      x.onclick=()=>{mvMode.faces.splice(i,1);mvPaint();renderMvPanel();mvHelp();};
      r2.appendChild(x);lst.appendChild(r2);
    });
    p.appendChild(lst);
  }else{
    const n=document.createElement('span');n.className='note';
    n.textContent='Cliquez une ou plusieurs faces dans la vue 3D.';
    p.appendChild(n);
  }
  const row=document.createElement('div');row.className='pnl-row';row.style.marginTop='8px';
  const lab=document.createElement('label');lab.textContent='Distance (mm)';row.appendChild(lab);
  const inp=document.createElement('input');inp.type='text';inp.inputMode='decimal';
  inp.id='mvDistIn';inp.value=String(mvMode.dist).replace('.',',');
  parFx(inp,mvMode,'dist');
  inp.onchange=()=>{
    const v=parseFloat(String(inp.value).replace(',','.').replace(/\s/g,''));
    if(!isFinite(v)){inp.value=String(mvMode.dist).replace('.',',');faceEl.textContent='Distance invalide (ex. 5 ou -3).';return;}
    mvMode.dist=Math.abs(v)<1e-9?0:v;inp.value=String(mvMode.dist).replace('.',',');
  };
  row.appendChild(inp);p.appendChild(row);
  const btns=document.createElement('div');btns.className='pnl-btns';btns.style.marginTop='8px';
  const ok=document.createElement('button');ok.className='primary';
  ok.textContent=mvMode.editing?'✔ Enregistrer':'✔ Appliquer';ok.onclick=mvApply;btns.appendChild(ok);
  const q=document.createElement('button');q.textContent=mvMode.editing?'✖ Annuler':'Quitter';q.onclick=()=>exitMoveFaceMode();
  btns.appendChild(q);p.appendChild(btns);
  const n2=document.createElement('span');n2.className='note';
  n2.textContent='Chaque face se déplace le long de sa normale sortante : positif, elle avance ; négatif, elle rentre.';
  p.appendChild(n2);
}
function mvApply(){
  if(!mvMode)return;
  if(!mvMode.faces.length){faceEl.textContent='Déplacement de face : retenez au moins une face.';return;}
  // On retire `_ord` (index BRep de la session) : surbrillance seule, rien pour le rejeu.
  const faces=mvMode.faces.map(r=>{const o={pos:r.pos.slice(),dim:r.dim.slice(),n:r.n.slice()};if(typeof r._bid==='string')o._bid=r._bid;return o;});
  const dist=+mvMode.dist||0;
  if(mvMode.editing){
    // Édition EN PLACE (une seule fonction, comme congé/dépouillage/coque).
    const f=doc.features.find(x=>x.id===mvMode.editing&&x.type==='xmove');
    if(f){
      docPushUndo('édition de « '+f.name+' »');
      f.faces=faces;f.ref=JSON.parse(JSON.stringify(faces[0]));f.dist=dist;
      parFxCopy(mvMode,f,['dist']);f.name=mvName(f);
      repSyncForFeature(f); // les instances de la répétition suivent
      sel={kind:'feature',id:f.id};
    }
    exitMoveFaceMode(true);
    markDirty();rebuild();renderTree();renderProps();
    faceEl.textContent=f?'Déplacement de face mis à jour : '+f.name+'.':'Déplacement de face : fonction introuvable.';
    return;
  }
  // On attaque le solide SANS cette nouvelle fonction, pour la viser sur la forme courante.
  occSkipFeat=null;
  const f={id:uid('mv'),type:'xmove',name:'',faces,ref:JSON.parse(JSON.stringify(faces[0])),dist};
  f.name=mvName(f);
  parFxCopy(mvMode,f,['dist']);
  addFeature(f); // instantané d'annulation + insertion au marqueur temps (comme extrusion/révolution/congé)
  exitMoveFaceMode(true);
  sel={kind:'feature',id:f.id};
  markDirty();rebuild();renderTree();renderProps();
  faceEl.textContent='Déplacement de face créé : '+f.name+'. Distance modifiable dans ses propriétés.';
}
