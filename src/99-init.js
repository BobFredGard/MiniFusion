/* ---------- init ---------- */
window.addEventListener('error',e=>{try{statsEl.textContent+='\n[ERREUR] '+(e.message||e.error);}catch(_){}});
try{$('appVerLive').textContent=APP_VER;}catch(e){}
buildScene();renderTree();renderTimeline();renderProps();refreshParts();
try{const auto=localStorage.getItem('minifusion_auto');if(auto){deserialise(auto,{rebuild:false});renderProps();faceEl.textContent='Brouillon local restauré.';}}catch(e){}
try{restoreViewCache().then(ok=>{if(ok){log('Pièce finie restaurée — aucun recalcul.');}else{rebuild();}});}catch(e){rebuild();}
log('Prêt. Esquisse → Extrusion → Export. Même navigation que le viewer.');
