// Raccourcis clavier esquisse — chargé APRÈS le script inline de fusion_mvp.html.
// Attention : skEdit/skTool sont déclarés avec « let » dans le script inline → ils sont
// dans l'environnement lexical global, PAS sur window (window.skEdit = undefined).
document.addEventListener('keydown',function(e){
  if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.isContentEditable))return;
  if(e.ctrlKey||e.altKey||e.metaKey)return;
  if(typeof skEdit==='undefined'||!skEdit)return;      // hors édition d'esquisse : on ignore
  const k=e.key.toLowerCase();
  const map={l:'line',c:'circle',r:'rect',b:'slot',p:'project',t:'trim',d:'dim'};
  if(!(k in map))return;
  const btn=document.querySelector('#skToolbar .tool[data-tool="'+map[k]+'"]');
  if(!btn)return;
  e.preventDefault();
  btn.click(); // délègue au handler existant de la barre d'outils (annule le brouillon, change d'outil, statut)
});
