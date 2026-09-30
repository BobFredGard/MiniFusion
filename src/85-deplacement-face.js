/* ---------- déplacement d'une face (push/pull) ----------
   Le calcul est dans 20-noyau (occMoveFaceOnce). Ici : le mode de sélection au clic, la
   création de la fonction et les réglages. Le déplacement se fait le long de la normale
   SORTANTE de la face cliquée : distance positive = la face avance, négative = elle rentre.
   La face est mémorisée par une référence durable (centre + normale + dimensions), pas par
   son numéro : le numéro d'une face change dès qu'une opération en ajoute une autre, alors
   que la face visée, elle, reste la même. */
let mvMode=null; // null | {hover:faceRef|null}

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
  b.title='Déplacer une face le long de sa normale sortante : distance positive, la face avance ; négative, elle rentre';
  after.parentNode.insertBefore(b,after.nextSibling);
})();

function mvName(f){
  const d=+f.dist||0;
  return `Déplacement de face ${d>0?'+':''}${String(d).replace('.',',')} mm`;
}
function enterMoveFaceMode(){
  if(!occHas()||!occLive||!occLive.shape){
    faceEl.textContent='Déplacement de face : solide exact indisponible (OCCT non chargé ou aucun volume).';
    return;
  }
  mvMode={hover:null};
  faceEl.innerHTML='<b>📐 Déplacement de face</b><br><span class="note">Cliquez une face du solide '+
    'exact. Elle sera déplacée de 5 mm vers l\'extérieur (modifiez la distance ensuite dans '+
    'ses propriétés). <b>Échap</b> ou clic droit pour annuler.</span>';
  try{buildEdgeOverlay();}catch(e){}
  try{applyClip();}catch(e){}
}
function exitMoveFaceMode(silent){
  if(!mvMode)return;
  mvMode=null;
  try{clearHover();}catch(e){}
  if(!silent)try{faceEl.textContent='Déplacement de face : annulé.';}catch(e){}
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
    return ref?{ref:ref,ord:hit.ord}:null;
  }catch(e){return null;}
}
function mvFaceHover(e){
  if(!mvMode)return;
  if(e.buttons!==0)return;
  const hit=mvFaceUnder(e);
  const key=hit?hit.ref.pos.join(','):null;
  if(key===mvMode.hover)return;
  mvMode.hover=key;
  try{
    clearHover();
    if(hit&&selGroup===null){
      // on ne fait PAS de surbrillance : la face est déjà visible et l'utilisateur
      // choisit ce qu'il veut. On se contente du curseur + d'un rappel de position.
      faceEl.innerHTML='<b>📐 Déplacement de face</b><br><span class="note">Face visée : centre ('+
        hit.ref.pos.map(v=>(+v).toFixed(1)).join(' ; ')+') mm — cliquez pour la déplacer.</span>';
    }
  }catch(e){}
}
function mvFaceCommit(e){
  if(!mvMode)return;
  const hit=mvFaceUnder(e);
  if(!hit){
    faceEl.textContent='Déplacement de face : cliquez une face du solide exact (les faces lisses ou hors du solide Highlighté sont ignorées).';
    return;
  }
  // On attaque le solide SANS cette nouvelle fonction, pour la viser sur la forme courante.
  occSkipFeat=null;
  const f={id:uid('mv'),type:'xmove',name:mvName({dist:5}),ref:hit.ref,dist:5};
  addFeature(f); // instantané d'annulation + insertion au marqueur temps (comme extrusion/révolution/congé)
  const id=f.id;
  exitMoveFaceMode(true);
  markDirty();rebuild();renderTree();renderProps();
  const ap=doc.features.find(x=>x.id===id);
  faceEl.textContent='Déplacement de face créé (5 mm vers l\'extérieur). Réglez la distance dans ses propriétés — une distance négative fait rentrer la face.';
  if(ap)try{sel={kind:'feature',id:ap.id};renderProps();}catch(e){}
}
