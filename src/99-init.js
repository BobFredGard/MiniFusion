/* ---------- init ---------- */
window.addEventListener('error',e=>{try{statsEl.textContent+='\n[ERREUR] '+(e.message||e.error);}catch(_){}});
try{$('appVerLive').textContent=APP_VER;}catch(e){}
buildScene();renderTree();renderTimeline();renderProps();refreshParts();
try{const auto=localStorage.getItem('minifusion_auto');if(auto){deserialise(auto,{rebuild:false});renderProps();faceEl.textContent='Brouillon local restauré.';}}catch(e){}
// Le cache d'affichage n'est qu'un DÉCOR : il redonne une image, pas un modèle. Sans rejeu,
// il n'y a pas de solide exact (occLive) — donc ni congé, ni esquisse sur face, ni sélection
// de face : « impossible de rejouer le solide ». Symptôme mesuré : le PREMIER F5 rejouait
// (cache périmé par la version), le SECOND ne rejouait plus (cache valide) et la pièce
// devenait inerte. On force donc le rejeu dans les DEUX cas. Le cadrage a lieu une fois
// le noyau exact prêt (occtFinishBoot) : cadrer ici, pendant le repli maillage, prendrait
// la boîte du « solide combiné » parfois dégénérée (40×40×10000) — caméra hors champ,
// vue noire. Tant qu'OCCT n'est pas prêt, la caméra par défaut (90,-90,90) montre l'origine.
try{
  restoreViewCache().then(ok=>{
    if(ok)log('Affichage restauré depuis le cache — rejeu exact en cours…');
    // builtVersion=-1 : la garde « rien n'a changé » court-circuterait sinon le rejeu,
    // puisque restoreViewCache vient de poser builtHash.
    builtVersion=-1;builtHash=null;builtEngine=null;
    try{rebuild();}catch(e){}
    try{if(occtReady)showAll();}catch(e){}
    try{faoMovesPreloadSoon(true);}catch(e){} // solide rejoue : on (re)charge les parcours persistes
  });
}catch(e){try{builtVersion=-1;builtHash=null;builtEngine=null;rebuild();if(occtReady)showAll();faoMovesPreloadSoon(true);}catch(e2){}}
log('Prêt. Esquisse → Extrusion → Export. Même navigation que le viewer.');
