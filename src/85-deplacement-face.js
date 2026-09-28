/* ---------- déplacement d'une face (push/pull) ----------
   Le calcul est dans 20-noyau (occMoveFaceOnce). Ici : le mode de sélection au clic, la
   création de la fonction et les réglages. Le déplacement se fait le long de la normale
   SORTANTE de la face cliquée : distance positive = la face avance, négative = elle rentre.
   La face est mémorisée par une référence durable (centre + normale + dimensions), pas par
   son numéro : le numéro d'une face change dès qu'une opération en ajoute une autre, alors
   que la face visée, elle, reste la même. */
let mvMode=null; // null | {hover:faceRef|null}

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
// Face exacte sous le curseur (le groupe de triangles donne l'index BRep de la face).
function mvFaceUnder(e){
  if(!occHas()||!occLive||!occLive.shape)return null;
  try{
    const h=pick(e);
    if(!h||!h.object||!h.object.geometry)return null;
    if(h.object.userData.bid!=='occ_result')return null;
    if(h.faceIndex===undefined||h.faceIndex===null)return null;
    const groups=h.object.geometry.userData.occGroups||[];
    const g=groups.find(g=>h.faceIndex>=g.start&&h.faceIndex<g.start+g.count);
    if(!g)return null;
    const f=occFaceAt(occLive.shape,g.f);
    if(!f)return null;
    const ref=occFaceRef(f);
    return ref?{ref:ref,ord:g.f}:null;
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
  doc.features.push(f);
  const id=f.id;
  exitMoveFaceMode(true);
  markDirty();rebuild();renderTree();renderProps();
  const ap=doc.features.find(x=>x.id===id);
  faceEl.textContent='Déplacement de face créé (5 mm vers l\'extérieur). Réglez la distance dans ses propriétés — une distance négative fait rentrer la face.';
  if(ap)try{sel={kind:'feature',id:ap.id};renderProps();}catch(e){}
}
