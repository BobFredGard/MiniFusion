/* ---------- suppression de faces (touche Suppr) ----------
   Le calcul est dans 20-noyau (occDeleteFacesOnce / occApplyDeleteFaces). Ici : la touche
   Suppr sur les faces sélectionnées dans la vue 3D (clic, Ctrl+clic pour en ajouter) crée
   une fonction « Suppression de face » : les faces partent et leurs voisines se prolongent
   jusqu'à se rejoindre, comme Suppr dans Fusion (congé → arête vive, trou → rebouché).
   Les faces sont mémorisées par référence durable (occFaceRefAny), pas par leur numéro. */

// Suppr vise les faces seulement si le DERNIER clic a eu lieu dans la vue 3D : une face
// restée en surbrillance ne doit pas voler Suppr à une fonction cliquée ensuite dans l'arbre.
let delLastPtr3D=false;
document.addEventListener('pointerdown',e=>{
  try{delLastPtr3D=!!(renderer&&renderer.domElement&&e.target===renderer.domElement);}catch(err){delLastPtr3D=false;}
},true);

function delFaceName(n){return n>1?`Suppression de ${n} faces`:'Suppression de face';}
function delFacesWanted(){
  if(!delLastPtr3D||!selFaces||!selFaces.length)return false;
  try{if(mvMode||draftMode||coqueMode||filModeX||filMode)return false;}catch(e){}
  return true;
}
function deleteSelectedFaces(){
  if(!occHas()||!occLive||!occLive.shape){
    faceEl.textContent='Suppression de face : solide exact indisponible (OCCT non chargé ou aucun volume).';
    return;
  }
  // Faces regroupées par corps : une fonction par corps touché (multi-corps).
  const byBody=new Map(),seen=new Set();
  let lost=0;
  for(const s of selFaces){
    let hit=null;
    try{hit=occFaceOfHit(s.mesh,s.faceIndex);}catch(e){}
    if(!hit||!hit.face){lost++;continue;}
    const key=hit.bd.bodyId+'#'+hit.ord;
    let ref=null;
    if(!seen.has(key)){seen.add(key);try{ref=occFaceRefAny(hit.face);}catch(e){}}
    else ref='dup';
    try{hit.face.delete();}catch(e){}
    if(ref==='dup')continue;
    if(!ref){lost++;continue;}
    if(!byBody.has(hit.bd.bodyId))byBody.set(hit.bd.bodyId,[]);
    byBody.get(hit.bd.bodyId).push(ref);
  }
  if(!byBody.size){
    faceEl.textContent='Suppression de face : sélectionnez une face d\'un solide exact (les maillages STL ne se modifient pas).';
    return;
  }
  occSkipFeat=null;
  const ids=[];
  byBody.forEach((faces,body)=>{
    const f={id:uid('df'),type:'xdelface',name:delFaceName(faces.length),faces,body,visible:true};
    addFeature(f); // instantané d'annulation + insertion au marqueur temps
    ids.push(f.id);
  });
  try{clearMeasure();}catch(e){}
  markDirty();rebuild();renderTree();renderProps();
  const made=ids.map(id=>doc.features.find(x=>x.id===id)).filter(Boolean);
  const bad=made.filter(f=>f._err||(f._m&&f._m.m<f._m.t));
  const n=made.reduce((a,f)=>a+(f.faces||[]).length,0);
  faceEl.textContent=bad.length
    ?'Suppression de face : le noyau n\'a pas pu refermer le solide pour '+bad.length+' fonction(s) — voir ⚠ dans l\'arbre (Ctrl+Z pour annuler).'
    :`${n} face(s) supprimée(s) — les faces voisines ont été prolongées.${lost?` (${lost} face(s) ignorée(s) : hors solide exact)`:''} Ctrl+Z pour annuler.`;
  if(made.length===1)try{sel={kind:'feature',id:made[0].id};renderProps();}catch(e){}
}
