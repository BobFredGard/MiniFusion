/* ============ Esquisse : registre des contraintes + jeu d'icônes ============
   2026-10-15-007 — « consolider l'esquisse et ses règles, ajouter Colinéaire,
   revoir tous les icônes qui se ressemblent tous ».
   • SK_CON : UNE fiche par type de contrainte (nom, icône, degrés de liberté
     retirés, rôle de ses références). Le comptage des DDL, la liste du panneau,
     les badges du dessin et la recopie lors d'une coupe lisent cette fiche au
     lieu de listes en dur dispersées (qui oubliaient des types : ∥/⟂ absents de
     l'audit, Colinéaire impossible à ajouter sans toucher 10 endroits).
   • SK_ICONS : icônes SVG 24×24 au trait (même épaisseur, même grille), une
     FORME distincte par fonction — fini les glyphes Unicode ⦾ ◎ ⊕ ⌖ ⌾ quasi
     identiques. Utilisées par la barre, le menu contextuel, la liste des
     contraintes et les badges posés sur le dessin. */
const SK_ICONS={
  // ── outils de dessin ──
  select:'<path d="M6 3v15.5l4.2-4 2.9 6.5 2.6-1.1-2.9-6.4H19z" fill="currentColor" stroke="none"/>',
  line:'<path d="M5 19L19 5"/><circle cx="5" cy="19" r="2" fill="currentColor" stroke="none"/><circle cx="19" cy="5" r="2" fill="currentColor" stroke="none"/>',
  rect:'<rect x="4" y="6.5" width="16" height="11"/><circle cx="4" cy="6.5" r="1.8" fill="currentColor" stroke="none"/><circle cx="20" cy="17.5" r="1.8" fill="currentColor" stroke="none"/>',
  slot:'<path d="M8.5 7h7a5 5 0 0 1 0 10h-7a5 5 0 0 1 0-10z"/><circle cx="8.5" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="15.5" cy="12" r="1.3" fill="currentColor" stroke="none"/>',
  circle:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/>',
  arc:'<path d="M20 18A12 12 0 0 0 8 6"/><path d="M8 18h12M8 18V6" stroke-dasharray="1.6 2.4" stroke-width="1.3"/><circle cx="8" cy="18" r="1.6" fill="currentColor" stroke="none"/>',
  spline:'<path d="M3.5 18C6 6 10 5 12 12s6 6 8.5-6"/><circle cx="3.5" cy="18" r="1.7" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="20.5" cy="6" r="1.7" fill="currentColor" stroke="none"/>',
  cpoint:'<circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/><path d="M12 3.5v4.5M12 16v4.5M3.5 12H8M16 12h4.5"/>',
  // centre de perçage : CIBLE + FORET dont la pointe vise le centre (orange dans la barre)
  hpoint:'<circle cx="12" cy="17" r="5.2" stroke-width="1.6"/><path d="M12 10.5v13M5.5 17h13" stroke-width="1"/><path d="M10.2 1.5h3.6v3.2h-3.6z" fill="currentColor" stroke="none"/><path d="M10 4.7h4v7l-2 4.3-2-4.3z" stroke-width="1.4"/><path d="M10 6.6l4 1.4M10 8.9l4 1.4" stroke-width="1.1"/>',
  project:'<path d="M12 2.8l6 2.6v5.4l-6 2.6-6-2.6V5.4z"/><path d="M6 5.4l6 2.6 6-2.6M12 8v5.4" stroke-width="1.3"/><path d="M12 15.5v3" stroke-dasharray="1.5 1.8"/><path d="M4 21h16"/>',
  // intersection : pièce coupée par le plan (trait épais = courbe de section)
  isect:'<path d="M12 3l7 3.5v11L12 21l-7-3.5v-11z" stroke-width="1.2"/><path d="M5 6.5l7 3.5 7-3.5M12 10v11" stroke-width="1" stroke-dasharray="1.4 1.6"/><path d="M2.5 13.5l9.5 4.5 9.5-4.5" stroke-width="2.4"/>',
  dim:'<path d="M4 5v10M20 5v10"/><path d="M4 10h16"/><path d="M7.5 7.5L4 10l3.5 2.5M16.5 7.5L20 10l-3.5 2.5"/><path d="M9 19h6" stroke-width="2.4"/>',
  fillet:'<path d="M4 21v-8a9 9 0 0 1 9-9h8" stroke-width="2.2"/><path d="M4 9V4h5" stroke-dasharray="1.6 2.2" stroke-width="1.3"/><circle cx="13" cy="13" r="1.4" fill="currentColor" stroke="none"/>',
  chamfer:'<path d="M4 21V11l7-7h10" stroke-width="2.2"/><path d="M4 8V4h4" stroke-dasharray="1.6 2.2" stroke-width="1.3"/>',
  offset:'<path d="M3 19c3-9 15-9 18 0" stroke-width="2.2"/><path d="M7 21c2-5 8-5 10 0" stroke-dasharray="2.2 2" stroke-width="1.6"/><path d="M12 7.5v5M10 10.5l2 2 2-2" stroke-width="1.4"/>',
  trim:'<circle cx="6" cy="7" r="2.6"/><circle cx="6" cy="17" r="2.6"/><path d="M8.2 8.5L20 16.5M8.2 15.5L20 7.5"/>',
  // ── contraintes ──
  h:'<path d="M3.5 12h17" stroke-width="2.4"/><path d="M3.5 8v8M20.5 8v8" stroke-width="1.4"/>',
  v:'<path d="M12 3.5v17" stroke-width="2.4"/><path d="M8 3.5h8M8 20.5h8" stroke-width="1.4"/>',
  parallel:'<path d="M5 19L13 5M11 19L19 5" stroke-width="2.2"/>',
  perpendicular:'<path d="M4 19.5h16M12 19.5V4.5" stroke-width="2.2"/><path d="M12 15h4.5v4.5" stroke-width="1.4"/>',
  collinear:'<path d="M3 21l6-6M15 9l6-6" stroke-width="2.4"/><path d="M9 15l6-6" stroke-dasharray="1.4 2.2" stroke-width="1.4"/>',
  equal:'<path d="M5 9h14M5 15h14" stroke-width="2.4"/>',
  symmetric:'<path d="M12 2.5v19" stroke-dasharray="2 2.2" stroke-width="1.4"/><path d="M9 6.5L3.5 12 9 17.5M15 6.5l5.5 5.5-5.5 5.5"/>',
  fix:'<rect x="5.5" y="10.5" width="13" height="10" rx="1.6"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/><circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none"/>',
  tangent:'<circle cx="12" cy="14.5" r="6"/><path d="M2.5 8.5h19" stroke-width="2.2"/><circle cx="12" cy="8.5" r="1.6" fill="currentColor" stroke="none"/>',
  curvature:'<path d="M3 19c4-1 7-4 9-8s5-7 9-8" stroke-width="2.2"/><path d="M6 18.2v-4M9.5 16v-5.5M13 12.5V6.5M16.5 8.5V4.4" stroke-width="1.2"/>',
  cspline:'<path d="M4 18C7 8 11 6 13 12s5 6 7-4" stroke-width="2"/><path d="M4 18L6.5 6l9.5 13L20 8" stroke-dasharray="1.6 2" stroke-width="1.2"/><rect x="5" y="4.5" width="3" height="3" fill="currentColor" stroke="none"/><rect x="14.5" y="17.5" width="3" height="3" fill="currentColor" stroke="none"/>',
  tangent2:'<circle cx="7.5" cy="12" r="5"/><circle cx="17.5" cy="12" r="5"/><circle cx="12.5" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
  coaxial:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/>',
  midpoint:'<path d="M3 17h18"/><path d="M12 16.5l-3.6-6h7.2z" fill="currentColor" stroke="none"/><path d="M3 14.5v5M21 14.5v5" stroke-width="1.4"/>',
  coincident:'<circle cx="12" cy="12" r="3.4"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/><path d="M2.5 12h4.5M17 12h4.5"/><path d="M5 9.5L7.5 12 5 14.5M19 9.5L16.5 12l2.5 2.5"/>',
  online:'<path d="M3 18L21 8"/><circle cx="12" cy="13" r="2.6" fill="currentColor" stroke="none"/>',
  oncircle:'<circle cx="11" cy="13" r="7"/><circle cx="16" cy="8.1" r="2.4" fill="currentColor" stroke="none"/>',
  construction:'<path d="M3 21L12 12" stroke-dasharray="2.6 2.2"/><circle cx="15.5" cy="8.5" r="5" stroke-dasharray="2.6 2.2"/>',
  // ── cotes (liste du panneau) ──
  length:'<path d="M4 5v10M20 5v10"/><path d="M4 10h16"/><path d="M7.5 7.5L4 10l3.5 2.5M16.5 7.5L20 10l-3.5 2.5"/><path d="M9 19h6" stroke-width="2.4"/>',
  distance:'<circle cx="5" cy="16" r="2" fill="currentColor" stroke="none"/><circle cx="19" cy="16" r="2" fill="currentColor" stroke="none"/><path d="M5 9h14"/><path d="M8 6.8L5 9l3 2.2M16 6.8L19 9l-3 2.2"/>',
  diameter:'<circle cx="12" cy="12" r="8"/><path d="M6.3 17.7L17.7 6.3"/><path d="M14.5 6.3h3.2v3.2M9.5 17.7H6.3v-3.2" stroke-width="1.4"/>',
  radius:'<circle cx="12" cy="12" r="8"/><path d="M12 12l5.6-5.6"/><path d="M14.4 6.4h3.2v3.2" stroke-width="1.4"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
  angle:'<path d="M4 19.5h16M4 19.5L15 5"/><path d="M12 19.5a8 8 0 0 0-2.4-5.7"/>',
  gap:'<path d="M3 6.5h18M3 17.5h18" stroke-width="2.2"/><path d="M12 7.5v9M9.8 9.8L12 7.5l2.2 2.3M9.8 14.2L12 16.5l2.2-2.3" stroke-width="1.4"/>',
  distline:'<path d="M3 19h18" stroke-width="2.2"/><circle cx="12" cy="5" r="2" fill="currentColor" stroke="none"/><path d="M12 7.5v9.5M9.8 14.7L12 17l2.2-2.3" stroke-width="1.4"/>'
};
function skIcon(name,px){
  // Icône SVG en ligne (HTML). currentColor : suit la couleur du bouton / de la ligne.
  const s=px||18,body=SK_ICONS[name]||SK_ICONS.select;
  return '<svg class="skico" viewBox="0 0 24 24" width="'+s+'" height="'+s+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+body+'</svg>';
}
/* Registre : nom affiché · icône · DDL retirés · rôles des références.
   refs : 'line' (ligne), 'ent' (cercle/arc), 'a'/'b' (entités), 'p' (point),
   'mid' (axe), 'pts' (a/b = POINTS). pairLines = liaison entre 2 lignes, recopiée
   sur les morceaux d'une ligne coupée (scission, ajustement). */
const SK_CON={
  h:            {nom:'Horizontal',      ic:'h',            dof:1},
  v:            {nom:'Vertical',        ic:'v',            dof:1},
  parallel:     {nom:'Parallèle',       ic:'parallel',     dof:1, pairLines:true},
  perpendicular:{nom:'Perpendiculaire', ic:'perpendicular',dof:1, pairLines:true},
  collinear:    {nom:'Colinéaire',      ic:'collinear',    dof:2, pairLines:true},
  equal:        {nom:'Égal',            ic:'equal',        dof:1},
  symmetric:    {nom:'Symétrie',        ic:'symmetric',    dof:4, pairLines:true},
  fix:          {nom:'Fixe',            ic:'fix',          dof:2},   // point : 2 · entité : 3 (cf. skConDof)
  tangent:      {nom:'Tangence',        ic:'tangent',      dof:1},
  tangent2:     {nom:'Tangence',        ic:'tangent2',     dof:1},
  coaxial:      {nom:'Coaxial',         ic:'coaxial',      dof:2},
  coincident:   {nom:'Coïncident',      ic:'coincident',   dof:2},
  midpoint:     {nom:'Milieu',          ic:'midpoint',     dof:2},
  online:       {nom:'Point sur ligne', ic:'online',       dof:1},
  oncircle:     {nom:'Point sur courbe',ic:'oncircle',     dof:1},
  stangent:     {nom:'Tangence',        ic:'tangent',      dof:1},   // 2026-10-29 : poignée de spline alignée sur l'autre courbe
  scurv:        {nom:'Courbure (G2)',   ic:'curvature',    dof:1},   // 2026-10-29 : courbures égales au raccord d'une spline
  offset:       {nom:'Décalage égal',   ic:'offset',       dof:1}   // V0.11.25 : l'écart (c→d) suit l'écart (a→b) porté par la cote unique du décalage
};
const SK_DIM_IC={length:'length',distance:'distance',diameter:'diameter',radius:'radius',angle:'angle',gap:'gap',distline:'distline'};
function skConDof(c){
  if(!c)return 0;
  if(c.type==='fix')return c.ent?3:2;
  if(c.type==='symmetric'&&c.inf)return 2; // symétrie de droites
  const r=SK_CON[c.type];
  return r?r.dof:1;
}
function skPairLineType(t){ const r=SK_CON[t]; return !!(r&&r.pairLines); }
// Barre d'esquisse : chaque bouton outil/contrainte reçoit l'icône du jeu commun
// (le libellé reste dans title). Les boutons texte (Effacer tout, Terminer…) restent.
(function skIconizeToolbar(){
  try{
    const TOOL_IC={select:'select',line:'line',rect:'rect',slot:'slot',circle:'circle',arc:'arc',cpoint:'cpoint',hpoint:'hpoint',project:'project',dim:'dim',coincident:'coincident',trim:'trim'};
    document.querySelectorAll('#skToolbar .tool').forEach(function(b){const k=TOOL_IC[b.dataset.tool];if(k)b.innerHTML=skIcon(k,20);});
    document.querySelectorAll('#skToolbar .con').forEach(function(b){const k=b.dataset.con;if(SK_ICONS[k])b.innerHTML=skIcon(k,20);});
  }catch(e){}
})();
