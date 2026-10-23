// Raccourcis clavier esquisse : une lettre = un outil de la barre d'esquisse.
// Ex-shortcuts.js (chargé à part, hors lint et tests), intégré au build le 2026-10-23 en
// dernière position pour garder l'ordre d'enregistrement d'origine. H n'y figure plus :
// H = centre de perçage (skShortcut, 60-trim-et-souris.js) ; l'ancien H → chanfrein
// cliquait le chanfrein juste avant que skShortcut ne bascule sur le point de perçage.
document.addEventListener('keydown',function(e){
  if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.isContentEditable))return;
  if(e.ctrlKey||e.altKey||e.metaKey)return;
  if(typeof skEdit==='undefined'||!skEdit)return;      // hors édition d'esquisse : on ignore
  const k=e.key.toLowerCase();
  const map={l:'line',c:'circle',r:'rect',b:'slot',p:'project',t:'trim',d:'dim',f:'fillet',o:'offset'};
  if(!(k in map))return;
  const btn=document.querySelector('#skToolbar .tool[data-tool="'+map[k]+'"]');
  if(!btn)return;
  e.preventDefault();
  btn.click(); // délègue au handler existant de la barre d'outils (annule le brouillon, change d'outil, statut)
});
