/* ---------- Aide : raccourcis et informations utiles (2026-10-16-006) ----------
   Bouton « ❔ Aide » au bout de la rangée d'astuces, juste sous le badge de version.
   F1 (hors esquisse — en esquisse F1 = coïncidence) ou « ? » ouvrent la même fenêtre. */
const AIDE_SECTIONS=[
  ['Esquisse — contraintes',[
    ['F1','Coïncidence (2 points · point + ligne / cercle)'],['F2','Horizontale ou verticale selon l’inclinaison'],
    ['F3','Tangence'],['F4','Égalité'],['F5','Parallèle'],['F6','Perpendiculaire'],['F7','Milieu'],
    ['F8','Concentricité'],['F9','Colinéaire'],['F10','Symétrie (2 lignes + axe)'],['F12','Blocage'],
    ['X','Construction ↔ profil'],['Clic droit','Menu : contraintes, congé, axe de rotation…']]],
  ['Esquisse — tracé et cotes',[
    ['H','Centre de perçage'],['Ligne','Le 2e clic enchaîne la ligne suivante'],
    ['Ctrl/Cmd + rectangle','Rectangle par le centre'],['Ctrl/Cmd + clic','Multi-sélection'],
    ['Chiffres pendant une ligne','Longueur saisie (Tab = angle)'],['Double-clic sur une cote','Modifier la valeur'],
    ['nom = valeur','Nommer une cote (ex. Longueur = 80)'],['Longueur/2','Expression ƒx (cotes nommées, paramètres)'],
    ['Cote grise (…)','Cote de référence : double-clic pour la rendre pilotante'],
    ['Congé, plusieurs coins','Une seule cote R pilote toute la passe'],
    ['Ctrl/Cmd+Z · Ctrl/Cmd+Y','Annuler · rétablir'],['Échap','Termine l’outil, retour à la sélection']]],
  ['3D — fonctions',[
    ['E','Extrusion'],['R','Révolution'],['H','Perçage'],['F','Congés'],['C','Chanfreins'],['M','Répétitions'],
    ['F5','Vue isométrique complète'],['ƒx Paramètres','Paramètres et cotes nommées']]],
  ['3D — sélection et mesure',[
    ['Clic','Face (ou arête présélectionnée en orange)'],['Ctrl/Cmd + clic','2e face ou arête : mesure (entraxe, distance ⟂, angle)'],
    ['Shift + clic','Ø exact'],['Molette','Tourner'],['Ctrl + clic droit','Recentrer'],
    ['Alt + double-clic','Isoler'],['Clic droit','Menu pièce'],['Échap','Effacer la sélection']]],
  ['Couleurs d’esquisse',[
    ['Bleu','Entité libre (sous-contrainte)'],['Blanc','Entité entièrement déterminée'],
    ['Vert','Cote pilotante'],['Gris (entre parenthèses)','Cote de référence (mesure seulement)'],
    ['Orange','Sélection · axe de rotation']]]
];
function openAide(){
  let ov=document.getElementById('aideDlg');if(ov){ov.remove();return;}
  ov=document.createElement('div');ov.id='aideDlg';
  ov.style.cssText='position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center';
  const box=document.createElement('div');
  box.style.cssText='background:#1c1c20;color:#e8e8ea;border:1px solid #3a3a40;border-radius:10px;padding:14px 18px;width:min(860px,94vw);max-height:84vh;overflow:auto;font-size:12.5px;box-shadow:0 14px 40px rgba(0,0,0,.6)';
  const ver=(document.getElementById('prodVer')||{}).textContent||'';
  let h='<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><b style="font-size:15px">❔ Aide — raccourcis et astuces</b><span style="opacity:.6">'+ver+' · '+(typeof APP_VER!=='undefined'?APP_VER:'')+'</span><span style="flex:1"></span><button id="aideClose">Fermer</button></div>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(380px,1fr));gap:12px">';
  AIDE_SECTIONS.forEach(([titre,rows])=>{
    h+='<div><div style="font-weight:700;color:#ff9f0a;margin:4px 0 4px">'+titre+'</div><table style="border-collapse:collapse;width:100%">';
    rows.forEach(([k,t])=>{h+='<tr><td style="padding:2px 8px 2px 0;white-space:nowrap;vertical-align:top"><kbd style="background:#2c2c32;border:1px solid #44444c;border-radius:4px;padding:0 5px;font-size:11.5px">'+k+'</kbd></td><td style="padding:2px 0;opacity:.9">'+t+'</td></tr>';});
    h+='</table></div>';
  });
  h+='</div><div style="opacity:.6;margin-top:10px">F1 (hors esquisse) ou « ? » rouvrent cette aide · Échap ou clic hors de la fenêtre pour fermer.</div>';
  box.innerHTML=h;ov.appendChild(box);
  ov.addEventListener('mousedown',e=>{if(e.target===ov)ov.remove();});
  document.body.appendChild(ov);
  const c=document.getElementById('aideClose');if(c)c.onclick=()=>ov.remove();
}
(function(){
  try{
    const hints=document.querySelector('.hints');
    if(hints&&!document.getElementById('btnAide')){
      const b=document.createElement('button');b.id='btnAide';b.textContent='❔ Aide';
      b.title='Raccourcis clavier et informations utiles (F1 hors esquisse, ou « ? »)';
      b.style.cssText='margin-left:auto;font-size:.72rem;padding:2px 10px;border-radius:20px';
      hints.appendChild(b);b.onclick=()=>openAide();
    }
  }catch(e){}
  window.addEventListener('keydown',e=>{
    const d=document.getElementById('aideDlg');
    if(d&&e.key==='Escape'){d.remove();e.preventDefault();return;}
    if(e.ctrlKey||e.altKey||e.metaKey)return;
    const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable))return;
    const ov=document.getElementById('sketchOverlay');const inSk=(typeof skEdit!=='undefined'&&skEdit)||(ov&&ov.classList.contains('open'));
    if(e.key==='?'||(e.key==='F1'&&!inSk)){e.preventDefault();openAide();}
  });
})();
