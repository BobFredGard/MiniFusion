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
  if(bar.querySelector('.dd'))return; // déjà fait
  const $=id=>document.getElementById(id);

  // Le style part aussi d'ici (même raison que le bandeau).
  if(!document.getElementById('styleBandeau')){
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
      '.ddMenu .ddLab{padding:7px 10px 3px;font-size:.66rem;letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}'
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
  // rejoindre son menu (appendChild déplace un nœud). Il ne reste donc qu'à poser les
  // groupes là où étaient les séparateurs, qui n'ont plus de sens : les fonctions
  // qu'ils encadraient sont désormais dans des menus.
  const seps=Array.from(bar.children).filter(c=>c.classList&&c.classList.contains('sep'));
  const hadSep=seps.length>0;
  const before=seps[0]||inputs[0]||null;
  seps.forEach(s=>{if(s.parentNode)bar.removeChild(s);});
  if(before){
    if(hadSep)bar.insertBefore(el('div','sep'),before);
    bar.insertBefore(gMod,before);
    bar.insertBefore(gFile,before);
    bar.insertBefore(gProj,before);
  }else{
    bar.appendChild(el('div','sep'));
    bar.appendChild(gMod);bar.appendChild(gFile);bar.appendChild(gProj);
  }
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
