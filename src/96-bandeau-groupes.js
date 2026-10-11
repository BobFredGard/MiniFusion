/* ---------- bandeau supérieur, regroupé par type de fonction ----------
   Le bandeau de la coque HTML alignait quinze boutons à plat : la moitié sont des exports,
   qui prenaient la place des actions qu'on utilise à chaque régime. Les actions primaires
   (Esquisse, Extrusion, Révolution) restent en direct ; tout le reste est regroupé dans un
   menu déroulant par TYPE : Modifier le solide (arêtes / faces / ensembles), Fichier
   (importer / exporter) et Projet.

   La coque HTML étant générée et jamais éditée à la main, c'est ici que le bandeau est
   réorganisé : on déplace les boutons EXISTANTS (donc leurs identifiants, leurs gestionnaires
   déjà branchés dans 95-toolbar.js et le raccourci clavier E restent valides) dans leur
   groupe, et on n'ajoute que le décor. Idempotent : si le regroupement a déjà été fait,
   on ne touche à rien. */
(function(){
  const bar=document.querySelector('.tb');
  if(!bar)return;
  // Badge de version produit, en haut à droite du bandeau : enfant du .topbar
  // (hors .tb, donc jamais déplacé par le regroupement), poussé à droite par
  // margin-left:auto, avant la rangée .hints qui force le retour à la ligne.
  const top=document.querySelector('.topbar')||bar.parentNode;
  if(!Array.from((top&&top.children)||[]).some(c=>c&&c.id==='prodVer')){
    const v=document.createElement('span');
    v.id='prodVer';v.textContent='V0.1.4';v.title='Version produit';
    const hints=document.querySelector('.hints');
    if(top&&hints&&hints.parentNode===top)top.insertBefore(v,hints);
    else if(top)top.appendChild(v);
    else bar.appendChild(v);
  }
  if(bar.querySelector('.dd'))return; // déjà fait
  const $=id=>document.getElementById(id);

  // Le style part aussi d'ici (même raison que le bandeau).
  if(!Array.from(document.head.children||[]).some(n=>n&&n.id==='styleBandeau')){
    const st=document.createElement('style');
    st.id='styleBandeau';
    st.textContent=[
      '.dd{position:relative}',
      '.dd>.ddBtn::after{content:"\\25BE";font-size:.62em;opacity:.65;margin-left:5px;vertical-align:1px}',
      '.ddMenu{display:none;position:absolute;top:calc(100% + 6px);left:0;z-index:6000;min-width:238px;padding:4px;',
      '  background:rgba(28,28,32,.97);border:1px solid var(--border);border-radius:9px;box-shadow:0 12px 34px rgba(0,0,0,.55)}',
      '.dd.open>.ddMenu{display:block}',
      '.ddMenu button{display:block;width:100%;text-align:left;background:none;border:none;padding:7px 10px;',
      '  border-radius:6px;cursor:pointer;color:inherit;font-size:.82rem;line-height:1.35}',
      '.ddMenu button:hover{background:var(--primary)}',
      '.ddMenu button i{font-style:normal;opacity:.85;margin-right:7px}',
      '.ddMenu .ddSep{width:auto;height:1px;margin:4px 6px;background:var(--border)}',
      '.ddMenu .ddLab{padding:7px 10px 3px;font-size:.66rem;letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}',
      '#prodVer{margin-left:auto;font-size:.68rem;font-weight:700;letter-spacing:.03em;padding:3px 10px;border-radius:20px;border:1px solid var(--border);background:rgba(255,255,255,.06);color:var(--text);white-space:nowrap}'
    ].join('\n');
    document.head.appendChild(st);
  }

  const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;};
  // Un groupe : un bouton-titre + un menu, dans lequel on range les boutons ids indiqués.
  // `parts` décrit l'ordre du menu : [ 'libellé de section'|null, id, 'texte affiché' ]
  const groupe=(titre,ttl,parts,icone)=>{
    const dd=el('div','dd');
    const t=el('button','ddBtn');t.innerHTML=icone+' '+titre;t.title=ttl;
    dd.appendChild(t);
    const menu=el('div','ddMenu');
    parts.forEach(p=>{
      if(p[0]==='#'){menu.appendChild(el('div','ddSep'));return;}
      if(p[0]===null){menu.appendChild(el('div','ddLab',p[1]));return;}
      const b=$(p[0]);
      if(!b)return;
      b.innerHTML=p[2]; // libellé enrichi : l'icône ne fait plus partie du texte du bouton
      menu.appendChild(b);
    });
    dd.appendChild(menu);
    return dd;
  };

  // On mémorise l'emplacement d'ancrage (le séparateur qui suit l'Extrusion) AVANT de
  // déplacer quoi que ce soit : c'est lui qui garde la bonne place dans la barre.
  const inputs=(()=>{const a=$('fileProj'),b=$('fileImport');return [a,b].filter(Boolean);})();

  const gMod=groupe('Modifier le solide','Fonctions qui modifient le solide existant',[
    [null,'Arêtes'],
    ['btnFillet','◔','Congé — rayon par arête'],
    ['btnChamfer','◑','Chanfrein — distance par arête'],
    '#',
    [null,'Faces'],
    ['btnMoveFace','\u{1F4D0}','Déplacer une face'],
    ['btnDraft','\u{1F6E1}','Dépouillage (angle de démoulage)'],
      ['btnCoque','⚙','Coque'],
    '#',
    [null,'Ensembles'],
    ['btnRepeat','\u{1F501}','Répétition (linéaire, circulaire, symétrie)']
  ],'\u{1F527}');
  const gFile=groupe('Fichier','Importer une pièce, ou l\'exporter dans un format',[
    [null,'Importer'],
    ['btnImport','\u{1F4C2}','Importer une pièce (STEP / STL)'],
    '#',
    [null,'Exporter'],
    ['btnExportStep','\u{2B07}','STEP — géométrie exacte'],
    ['btnExportStl','\u{2B07}','STL — maillage'],
    ['btnExportObj','\u{2B07}','OBJ — maillage']
  ],'\u{1F4BE}');
  const gProj=groupe('Projet','Nouveau modèle, sauvegarde, ouverture',[
    ['btnNew','\u{1F195}','Nouveau modèle'],
    ['btnSave','\u{1F4BE}','Sauvegarder'],
    ['btnSaveAs','\u{1F4BE}','Sauvegarder sous…'],
    ['btnLoad','\u{1F4C2}','Ouvrir un projet…']
  ],'\u{1F4C1}');

  // Réunion : à la construction des groupes, chaque bouton a DÉJÀ quitté la barre pour
  // rejoindre son menu (appendChild déplace un nœud). Il ne reste qu'à insérer les groupes
  // là où étaient les séparateurs, qui n'ont plus de sens : les fonctions qu'ils encadraient
  // sont désormais dans des menus.
  //
  // ORDRE IMPÉRATIF : on insère ENCORE dans la barre, puis on retire les vieux séparateurs.
  // L'inverse (retirer d'abord, puis insérer « avant le séparateur ») fait planter le
  // navigateur : `insertBefore` refuse une référence qui n'est plus enfant de son parent
  // (NotFoundError). Ce n'est pas un détail : l'exception tuait le script au chargement,
  // donc 99-init.js ne tournait plus et la vue 3D restait vide — sans modèle, sans arbre.
  const seps=Array.from(bar.children).filter(c=>c.classList&&c.classList.contains('sep'));
  const ref=seps[0]||inputs[0]||null;
  if(ref){
    if(seps.length)bar.insertBefore(el('div','sep'),ref);
    bar.insertBefore(gMod,ref);
    bar.insertBefore(gFile,ref);
    bar.insertBefore(gProj,ref);
  }else{
    bar.appendChild(el('div','sep'));
    bar.appendChild(gMod);bar.appendChild(gFile);bar.appendChild(gProj);
  }
  seps.forEach(s=>{if(s.parentNode===bar)bar.removeChild(s);});
  inputs.forEach(n=>bar.appendChild(n));

  // Ouverture : un seul menu à la fois, fermeture au clic dehors et à Échap.
  const closeAll=()=>{Array.from(bar.querySelectorAll('.dd.open')).forEach(d=>d.classList.remove('open'));};
  Array.from(bar.querySelectorAll('.dd')).forEach(dd=>{
    const t=dd.querySelector('.ddBtn');
    t.addEventListener('click',e=>{
      e.stopPropagation();
      const was=dd.classList.contains('open');
      closeAll();
      if(!was)dd.classList.add('open');
    });
    // Un clic sur un item ferme le menu (le gestionnaire de l'item s'exécute d'abord).
    dd.querySelector('.ddMenu').addEventListener('click',closeAll);
  });
  document.addEventListener('click',closeAll);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll();});
})();
