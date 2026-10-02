/* ---------- arbre + timeline + props ---------- */
let repMode=null;
// Marques « source de la répétition » : styles injectés depuis le code, la coque
// HTML/CSS du livrable généré n'étant jamais éditée à la main (même règle que le
// bouton Révolution, 30h).
(function(){
  try{
    if(typeof document==='undefined'||document.getElementById('cssRepSrc'))return;
    const st=document.createElement('style');st.id='cssRepSrc';
    st.textContent='.repsrc{font-size:.72rem;font-weight:700;margin-left:4px;color:#7ee0c0;}'+
      '.repsrc.vide{color:#ff9f6e;}'+
      '.srcmark{color:#7ee0c0;font-weight:700;margin-right:2px;}';
    (document.head||document.body||document.documentElement).appendChild(st);
  }catch(e){}
})();
// Bandeau de CORPS (🧱) : fond teinté, nom en gras, ⏻ de rejeu et 👁 de vue
// distincts. Injecté depuis le code — la coque HTML/CSS du livrable généré n'est
// jamais éditée à la main (même règle que cssRepSrc ci-dessus).
(function(){
  try{
    if(typeof document==='undefined'||document.getElementById('cssTreeBody'))return;
    const st=document.createElement('style');st.id='cssTreeBody';
    st.textContent=
      '.tnode.bh{background:linear-gradient(90deg,rgba(142,142,147,.13),rgba(142,142,147,0))}'+
      '.tnode.bh .nm,.tnode.bh>span:nth-child(2){font-weight:700}'+
      '.tnode.bh .tri{opacity:.75}'+
      '.tnode.bh.off .nm{opacity:.6}'+
      '.tnode .pwr{cursor:pointer;user-select:none;font-size:.8rem;opacity:.34;filter:grayscale(1)}'+
      '.tnode .pwr.on{opacity:1;filter:none;color:var(--accent)}'+
      '.tnode .eye{cursor:pointer;user-select:none}'+
      '.tnode.bh.hidden .pwr{filter:none;opacity:.6}';
    (document.head||document.body||document.documentElement).appendChild(st);
  }catch(e){}
})();
// Sélection MULTIPLE de fonctions (Ctrl+clic) + suppression au clavier (Suppr).
// `sel` reste le modèle simple utilisé partout ailleurs (panneau, outils) : la
// multi-sélection est un état parallèle, jamais une refonte de `sel`.
// L'annulation, elle, est celle du DOCUMENT (voir 45-annuler-document.js) : pas
// de pile locale ici, sinon deux historiques qui se désynchronisent.
let treeSel=[];   // ids de fonctions, dans l'ordre de clic
// Un glyphe par TYPE de fonction ; l'œil (👁/🙈) reste, lui, exclusivement la
// visibilité. Fonction globale : servant aussi à la liste de sources de la
// répétition, qui vit hors de renderTree.
function featIconOf(f){
  if(!f)return '◧';
  if(f.type==='extrude')return (f.op||'add')==='cut'?'▾':'▤';
  if(f.type==='xfillet')return xIcon(xKindOf(f))+((f._m&&f._m.m<f._m.t)||f._err?'⚠':'');
  if(f.type==='fillet')return xIcon(xKindOf(f));
  if(f.type==='repeat')return '🔁';
  if(f.type==='revolve')return (f.op||'add')==='cut'?'◔':'◍';
  if(f.type==='xmove')return '📐';
  if(f.type==='xdraft')return ((f._m&&f._m.m<f._m.t)||f._err)?'⚠':'📐';
  if(f.type==='xshell')return ((f._m&&f._m.m<f._m.t)||f._err)?'⚠':'🥚';
  return '◧';
}
function renderTree(){
  const t=$('tree');t.innerHTML='';
  const g=(s)=>{const d=document.createElement('div');d.className='tgroup';d.textContent=s;t.appendChild(d);};
  // Groupe repliable (Origine, Esquisses) : même triangle ▶/▼ que les répétitions,
  // état persisté dans doc.fold. Ouvert par défaut (comportement actuel inchangé).
  const gfold=(k,label)=>{
    const f=!!(doc.fold&&doc.fold[k]);
    const d=document.createElement('div');d.className='tgroup';d.style.cursor='pointer';
    d.innerHTML='<span class="tri" title="Déplier / replier">'+(f?'▶':'▼')+'</span><span>'+label+'</span>';
    d.onclick=()=>{doc.fold=doc.fold||{};doc.fold[k]=!f;try{dirty=true;}catch(e){}renderTree();};
    t.appendChild(d);
    return !f;
  };
  const node=(icon,name,kind,id,visible,dbl)=>{
    const _tlLk=(tlMark!=null&&kind==='feature'?(function(){const mi=tlIdx();return mi>=0&&doc.features.findIndex(x=>x.id===id)>=mi;})():false);
    const d=document.createElement('div');
    // une fonction est « sel » si elle est la sélection courante OU membre du lot Ctrl+clic
    const estSel=(sel.kind===kind&&sel.id===id)||(kind==='feature'&&treeSel.indexOf(id)>=0);
    // Décalage dans le corps (▲▼) : toute fonction non dérivée — les instances de
    // répétition se déplacent avec leur bloc, jamais seules (pas de chevrons).
    const _mv=(kind==='feature'&&(function(){const _f=doc.features.find(x=>x.id===id);return !!(_f&&!_f.repeatId);})())
      ?' <span class="mv" data-d="-1" title="Monter dans le corps">▲</span><span class="mv" data-d="1" title="Descendre dans le corps">▼</span>':'';
    d.className='tnode'+(estSel?' sel':'')+(visible===false?' hidden':'')+(_tlLk?' locked':'');
    d.innerHTML=`<span>${icon}</span><span class="nm">${name}</span>${_mv}<span class="eye" title="Afficher / masquer">`+(visible===false?'🙈':'👁')+`</span>`;
    d.onclick=ev=>{
      if(ev.target&&ev.target.classList&&ev.target.classList.contains('mv')){
        let dd=0;
        try{dd=+(ev.target.dataset&&ev.target.dataset.d!=null?ev.target.dataset.d:ev.target.getAttribute('data-d'));}catch(e){}
        if(!featMove(id,dd)){try{faceEl.textContent='Déjà en tête / en fin de corps — rien à décaler.';}catch(e){}}
        return;
      }
      if(ev.target&&ev.target.classList&&ev.target.classList.contains('eye')){
        if(kind==='plane'){setOriginVis(id,!originVis[id]);return;}
        if(kind==='sketch'){const s=doc.sketches.find(x=>x.id===id);if(s){s.visible=!(s.visible!==false);markDirty();rebuild();renderTree();}}
        else if(kind==='feature'){const f=doc.features.find(x=>x.id===id);if(f){f.visible=!(f.visible!==false);if(f.type==='repeat')doc.features.forEach(k=>{if(k.repeatId===f.id)k.visible=f.visible;});
          // l'oeil d'une fonction = la visibilité de TOUS ses corps (sinon un corps masqué
          // n'aurait plus aucun moyen de réapparaître, l'overlay Pièces ayant disparu)
          if(!f.repeatId&&doc.bodyVis)bodies.forEach(b=>{if(b.ref===f.id)delete doc.bodyVis[b.id];});
          markDirty();rebuild();renderTree();}}
        return;
      }
      if(kind==='feature'&&ev.ctrlKey){
        // Ctrl+clic n'a QU'UN sens : ajouter/retirer du lot de fonctions à supprimer.
        // Le choix des sources d'une RÉPÉTITION se fait dans SON panneau (cases à
        // cocher) — plus de conflicto : avant, un Ctrl+clic sur une répétition
        // ouvrait le panneau Répétition et_CCicl sur une autre fonction y ajoutait la
        // source, ce qui rendait la multi-suppression inutilisable.
        treeSelToggle(id);return;
      }
      if(kind==='feature'&&ghostHide===id)ghostHide=null;
      treeSel=kind==='feature'?[id]:[];
      sel={kind,id};
      // Le corps cliqué devient le corps ACTIF (persisté, marqué ● dans l'arbre).
      if(kind==='body'){try{if(doc.activeBody!==id){doc.activeBody=id;dirty=true;}}catch(e){}}
      renderTree();renderProps();refreshParts();
    };
    if(kind==='sketch')d.title='Clic = sélectionner · double-clic = modifier l’esquisse · 👁 = afficher/masquer';
    else if(kind==='feature')d.title='Clic = sélectionner · double-clic = éditer congé/chanfrein exact · 👁 = afficher/masquer · ▲▼ = décaler dans le corps';
    if(dbl)d.ondblclick=dbl;
    d.oncontextmenu=e=>{e.preventDefault();showCtx(e.clientX,e.clientY,{kind,id});};
    t.appendChild(d);
  };
  if(gfold('origin','⬒ Origine · Z↑ haut · Y arrière')){
    ['XY','XZ','YZ'].forEach(p=>{
      const d=document.createElement('div');
      d.className='tnode'+(sel.kind==='plane'&&sel.id===p?' sel':'')+(originVis[p]?'':' hidden');
      d.title='Clic = sélectionner · double-clic = esquisse dessus · 👁 = montrer/masquer · '+PLANES[p].label;
      d.innerHTML=`<span class="pdot" style="background:${PLANES[p].css}"></span><span class="nm">Plan ${p} <span style="color:var(--muted)">· ${PLANES[p].role}</span></span><span class="eye" title="Afficher / masquer le plan">👁</span>`;
      d.onclick=ev=>{if(ev.target&&ev.target.classList&&ev.target.classList.contains('eye')){setOriginVis(p,!originVis[p]);return;}sel={kind:'plane',id:p};renderTree();renderProps();refreshParts();};
      d.ondblclick=()=>{sel={kind:'plane',id:p};newSketch(p);};
      d.oncontextmenu=e=>{e.preventDefault();showCtx(e.clientX,e.clientY,{kind:'plane',id:p});};
      t.appendChild(d);
    });
  }
  if(gfold('sk','✏️ Esquisses ('+doc.sketches.length+')')){
    doc.sketches.forEach(s=>node('✏️',s.name+' · '+sketchFaceLabel(s)+' · '+s.entities.length+' traits','sketch',s.id,s.visible,()=>openSketch(s.id)));
  }
  if(tlMark!=null){
    const mi=tlIdx();
    const mbar=document.createElement('div');mbar.style.cssText='display:flex;align-items:center;gap:6px;justify-content:space-between;padding:6px 8px;margin:6px 0 2px;border:1px solid var(--border);border-radius:8px;font-size:.72rem;cursor:pointer;background:linear-gradient(90deg,rgba(232,179,74,.14),transparent)';
    mbar.title='Clic = rejouer toute la timeline (lever le marqueur)';
    const lab=document.createElement('span');
    lab.innerHTML='⏱ Temps bloqué avant « '+(mi<0?'(fonction supprimée)':doc.features[mi].name)+' » — <b>'+(mi<0?0:mi)+'</b> fonction(s) rejouée(s)';
    const endB=document.createElement('button');endB.textContent='↗ Rejouer tout';endB.className='mini';
    endB.onclick=ev=>{ev.stopPropagation();if(tlMark!=null){tlSetPtr(null);markDirty();rebuild();renderTree();renderProps();}};
    mbar.onclick=endB.onclick;
    mbar.appendChild(lab);mbar.appendChild(endB);
    t.appendChild(mbar);
  }
  // Un glyphe par TYPE de fonction ; l'œil (👁/🙈) reste, lui, exclusivement la
  // visibilité — l'overlay « Pièces » ayant disparu, il n'y a plus de doublon.
  // glyphe par type : délégué à featIconOf (partagé avec le panneau de répétition)
  const featIcon=f=>featIconOf(f);
  // Une fonction APPARTIENT à un corps (f.body) : l'arbre regroupe par corps, chacun
  // avec son en-tête (activation au clic, œil, menu renommer/supprimer). Les instances
  // de répétition restent affichées sous leur répétition, où qu'elles soient rangées.
  const bodyIds=()=>((doc.bodies||[]).length?doc.bodies:[{id:'b1',name:'Corps 1'}]).map(e=>e.id);
  const bodyOf=f=>(f&&bodyIds().indexOf(f.body)>=0)?f.body:bodyIds()[0];
  const featNode=f=>{
    if(tlMark!=null&&f.id===tlMark){
      const dm=document.createElement('div');dm.className='tnode';dm.style.cursor='default';
      dm.style.borderTop='2px dashed var(--warn)';dm.style.color='var(--warn)';dm.style.fontWeight='700';
      dm.textContent='⏱ — marqueur ici —';
      t.appendChild(dm);
    }
    if(f.repeatId)return; // instance : affichée sous sa répétition
    if(f.type==='repeat'){
      const kids=doc.features.filter(c=>c.repeatId===f.id);
      // les SOURCES de la répétition sélectionnée : marquées dans l'arbre, pour voir
      // d'un coup d'œil ce qui l'alimente et ce qui ne lui appartient pas.
      const srcs=(f.base||[]);
      // répétition dépliée si elle est sélectionnée (ou dans le lot) : on voit ses
      // instances sans avoir à cliquer le triangle
      const estChoisie=(sel.kind==='feature'&&sel.id===f.id)||treeSel.indexOf(f.id)>=0;
      const open=f.open===true||estChoisie;
      const d=document.createElement('div');
      d.className='tnode'+((sel.kind==='feature'&&sel.id===f.id)||treeSel.indexOf(f.id)>=0?' sel':'')+(f.visible===false?' hidden':'')+(tlLocked(f)?' locked':'');
      const srcNames=srcs.map(id=>{const b=doc.features.find(x=>x.id===id);return b?b.name:'?';});
      d.innerHTML=`<span class="tri" title="Déplier / replier les fonctions copiées">${open?'▼':'▶'}</span><span>🔁</span><span class="nm">${f.name} · ${repTypeName(f.mode,f)} · ${kids.length} instance(s)`+
        (srcs.length?` <span class="repsrc" title="Sources : ${srcNames.join(', ')}">◀ ${srcs.length}</span>`:' <span class="repsrc vide" title="Aucune source choisie">◀ 0</span>')+
        `</span> <span class="mv" data-d="-1" title="Monter dans le corps (bloc entier)">▲</span><span class="mv" data-d="1" title="Descendre dans le corps (bloc entier)">▼</span><span class="eye" title="Afficher / masquer">`+(f.visible===false?'🙈':'👁')+`</span>`;
      d.title='Clic = sélectionner · ▶/▼ = montrer/masquer les fonctions copiées · ▲▼ = décaler le bloc dans le corps'+
        (srcs.length?(' · sources : '+srcNames.join(', ')):' · AUCUNE source : la répétition ne produit rien');
      d.onclick=ev=>{
        if(ev.target&&ev.target.classList&&ev.target.classList.contains('mv')){
          let dd=0;
          try{dd=+(ev.target.dataset&&ev.target.dataset.d!=null?ev.target.dataset.d:ev.target.getAttribute('data-d'));}catch(e){}
          if(!featMove(f.id,dd)){try{faceEl.textContent='Déjà en tête / en fin de corps — rien à décaler.';}catch(e){}}
          return;
        }
        if(ev.target&&ev.target.classList&&ev.target.classList.contains('tri')){f.open=!f.open;renderTree();renderProps();return;}
        if(ev.target&&ev.target.classList&&ev.target.classList.contains('eye')){f.visible=!(f.visible!==false);doc.features.forEach(k=>{if(k.repeatId===f.id)k.visible=f.visible;});markDirty();rebuild();renderTree();return;}
        if(ev.ctrlKey){treeSelToggle(f.id);return;}
        treeSel=[f.id]; // un clic simple remet le lot à zéro : plus de sélection fantôme
        sel={kind:'feature',id:f.id};renderTree();renderProps();refreshParts();
      };
      d.oncontextmenu=e=>{e.preventDefault();showCtx(e.clientX,e.clientY,{kind:'feature',id:f.id});};
      t.appendChild(d);
      if(!open)return;
      kids.forEach(k=>{
        const d=document.createElement('div');d.className='tnode repchild'+((sel.kind==='feature'&&sel.id===f.id)||treeSel.indexOf(k.id)>=0?' sel':'')+(k.visible===false?' hidden':'');
        d.innerHTML=`<span>${featIcon(k)}</span><span class="nm">${k.name}</span><span class="eye" title="Afficher / masquer">`+(k.visible===false?'🙈':'👁')+`</span>`;
        d.style.paddingLeft='22px';
        d.title='Instance n°'+k.repIndex+' de la répétition — clic = sélectionner la répétition · Ctrl+clic = ajouter au lot à supprimer';
        d.onclick=ev=>{
          if(ev.target&&ev.target.classList&&ev.target.classList.contains('eye')){k.visible=!(k.visible!==false);markDirty();rebuild();renderTree();return;}
          if(ev.ctrlKey){treeSelToggle(k.id);return;}
          treeSel=[f.id]; // idem : pas de résidu du lot précédent
          sel={kind:'feature',id:f.id};renderTree();renderProps();refreshParts();
        };
        d.ondblclick=()=>{if(k.type==='xfillet'){sel={kind:'feature',id:k.id};treeSel=[];enterExactFilletMode(k);}else if(k.type==='xdraft'){sel={kind:'feature',id:k.id};treeSel=[];enterDraftMode(k);}else if(k.type==='xshell'){sel={kind:'feature',id:k.id};treeSel=[];enterCoqueMode(k);}};
        d.oncontextmenu=e=>{e.preventDefault();showCtx(e.clientX,e.clientY,{kind:'feature',id:f.id});};
        t.appendChild(d);
      });
      return;
    }
    // While a REPETITION is selected, its source features carry a visible mark:
    // the question "is this function part of it ?" gets an answer in the tree itself.
    const repF=sel.kind==='feature'?doc.features.find(x=>x.id===sel.id&&x.type==='repeat'):null;
    const estSrc=!!(repF&&(repF.base||[]).indexOf(f.id)>=0);
    const ri=repMode&&repMode.feats&&repMode.feats.includes(f.id)?'✓ ':'';
    node(ri+(estSrc?'<span class="srcmark" title="Source de la répétition sélectionnée">◀</span>':'')+featIcon(f),f.name,'feature',f.id,f.visible,(f.type==='xfillet'||f.type==='xdraft'||f.type==='xshell')?()=>{sel={kind:'feature',id:f.id};treeSel=[];if(f.type==='xfillet')enterExactFilletMode(f);else if(f.type==='xdraft')enterDraftMode(f);else enterCoqueMode(f);}:null);
  };
  const groups=(doc.bodies||[]).length?doc.bodies:[{id:'b1',name:'Corps 1'}];
  g('🧱 Corps / Fonctions ('+doc.features.length+') · ➕ additif / ➖ découpe · ● = actif');
  groups.forEach(be=>{
    // En-tête du corps : clic = sélectionner ET ACTIVER (les fonctions suivantes
    // naîtront dedans), œil = montrer/masquer ses fonctions, clic droit = renommer,
    // isoler, supprimer le corps et ses fonctions.
    const kids=doc.features.filter(f=>!f.repeatId&&bodyOf(f)===be.id);
    const estActif=doc.activeBody===be.id;
    // (état réel de l'en-tête : visVue = vue 3D, enRejeu = rejeu — plus haut)
    // Replié sur demande (▲ triangle, comme les répétitions), mais jamais quand il
    // contient la sélection : on ne cache pas ce qu'on édite. Persisté (be.open).
    const selIn=treeSel.concat([(sel.kind==='feature'||sel.kind==='body')?sel.id:null]).filter(Boolean);
    const hasSel=selIn.some(id=>id===be.id||bodyOf(doc.features.find(x=>x.id===id))===be.id);
    const open=be.open!==false||hasSel;
    const hd=document.createElement('div');
    // 👁 = VUE SEULE (doc.bodyVis : le mesh disparaît, le corps reste dans le rejeu).
    // ⏻ = REJEU (bodyEnabledOf : toutes les fonctions sont exclues/incluses du
    // recalcul) — les deux états sont indépendants, un corps peut être visible et
    // hors rejeu (grisé) ou masqué et activé. Le brut FAO masque aussi via bodyVis :
    // c'est le même état, l'œil le réaffiche (bodyToggleVis).
    let visVue=true;
    try{ visVue=!(doc.bodyVis&&doc.bodyVis[be.id]===false); }catch(e){}
    const enRejeu=bodyEnabledOf(be.id);
    // 🧱 = bandeau de CORPS : glyphe dédié (distinct du ◧ des fonctions), bordure
    // gauche à la couleur du corps et fond teinté — l'arbre se lit d'un coup d'œil.
    hd.className='tnode bh'+((sel.kind==='body'&&sel.id===be.id)?' sel':'')+(visVue?'':' hidden')+(enRejeu?'':' off');
    const bcol=bodyTextColor(be);
    try{ hd.style.boxShadow='inset 3px 0 0 '+(bcol||'#9a9aa0'); }catch(e){}
    hd.innerHTML='<span class="tri" title="Déplier / replier les fonctions du corps">'+(open?'▼':'▶')+'</span><span title="Corps — '+(be.name||'')+'">🧱</span>'+
      '<span class="nm"'+(bcol?(' style="color:'+bcol+'"'):'')+'>'+be.name+(estActif?' ●':'')+' · '+kids.length+' fonction(s)</span>'+
      '<span class="pwr'+(enRejeu?' on':'')+'" title="'+(enRejeu?'Rejeu ACTIF : toutes les fonctions de ce corps sont recalculées — cliquer pour les EXCLURE (le corps reste visible)':'Rejeu ÉTEINT : toutes les fonctions de ce corps sont exclues (grisées) — cliquer pour les inclure')+'">⏻</span>'+
      '<span class="eye" title="'+(visVue?'Corps visible dans la 3D — cliquer pour le CACHER (il reste dans le rejeu et l\'export)':'Corps masqué dans la 3D (vue seule) — cliquer pour l\'AFFICHER. Aucune fonction n\'est touchée')+'">'+(visVue?'👁':'🙈')+'</span>';
    hd.title='Clic = sélectionner et ACTIVER (les nouvelles fonctions naîtront dans « '+be.name+' ») · ▶/▼ = replier · ⏻ = rejeu (inclure/exclure ses fonctions du recalcul) · 👁 = vue 3D seule · clic droit = renommer / supprimer';
    hd.onclick=ev=>{
      if(ev.target&&ev.target.classList&&ev.target.classList.contains('tri')){be.open=!open;try{dirty=true;}catch(e){}renderTree();return;}
      if(ev.target&&ev.target.classList&&ev.target.classList.contains('pwr')){
        bodyToggleEnabled(be.id);return;
      }
      if(ev.target&&ev.target.classList&&ev.target.classList.contains('eye')){
        bodyToggleVis(be.id);return;
      }
      treeSel=[];
      sel={kind:'body',id:be.id};
      try{if(doc.activeBody!==be.id){doc.activeBody=be.id;dirty=true;}}catch(e){}
      renderTree();renderProps();refreshParts();
    };
    hd.oncontextmenu=e=>{e.preventDefault();showCtx(e.clientX,e.clientY,{kind:'body',id:be.id});};
    t.appendChild(hd);
    if(open)doc.features.forEach(f=>{if(!f.repeatId&&bodyOf(f)===be.id)featNode(f);});
  });
  updateOriginPlanes();
}
function renderTimeline(){
  const tl=$('timeline');if(!tl)return; // panneau retiré : l'arborescence fait foi
  tl.innerHTML='';
  doc.features.forEach((f,i)=>{
    const c=document.createElement('span');c.className='chip';c.textContent=`${i+1} · ${f.name}`;
    c.title='Clic = sélectionner';c.onclick=()=>{sel={kind:'feature',id:f.id};renderTree();renderProps();refreshParts();};
    if(f.type==='extrude'&&(f.op||'add')==='cut'){c.style.borderColor='#ff453a';c.style.background='rgba(255,69,58,.18)';c.title='Découpe (soustractive) — clic = sélectionner';}
    tl.appendChild(c);
  });
  if(!doc.features.length)tl.innerHTML='<span class="note">Vide — créez une esquisse puis une extrusion.</span>';
}
// Fonction répétable : extrusion ou congé/chanfrein exact. NI une répétition, NI une
// instance de répétition (une instance est déjà générée : la répéter empilerait des
// clones sans sens, et la liste à cocher la proposait).
function repCanFeature(id){
  const f=doc.features.find(x=>x.id===id);
  if(!f)return false;
  if(f.repeatId)return false;
  if(f.type==='repeat')return false;
  return f.type==='extrude'||f.type==='xfillet';
}
// Ce qu'une fonction apporte comme source de répétition — sert d'infobulle dans la
// liste à cocher, pour qu'on sache ce qu'on coche.
function repCanFeatureHint(f){
  if(!f)return'';
  if(f.type==='extrude')return((f.op||'add')==='cut'?'Découpe':'Plot')+' · '+(+f.distance||0).toFixed(2)+' mm';
  if(f.type==='xfillet')return xLabel(xKindOf(f))+' · '+(f.edges||[]).length+' arête(s)';
  if(f.type==='xmove')return 'Déplacement de face · '+(+f.dist||0)+' mm';
  if(f.type==='xdraft')return 'Dépouillage · '+(+f.angle||0).toFixed(1).replace('.',',')+'° · '+(f.faces||[]).length+' face(s)';
  if(f.type==='xshell')return 'Coque · '+String(Math.round((+f.thick||0)*100)/100).replace('.',',')+' mm · '+(f.faces||[]).length+' face(s) retirée(s)';
  return '';
}
// Liste des fonctions répétables, en CASES À COCHER.
// PARTAGÉE par la création (repMode) et l'édition d'une répétition déjà construite :
// les deux offrent exactement les mêmes choix, la ticked = sources actuelles. Extraite
// en une seule fonction pour que les deux panneaux ne puissent pas diverger.
//
// RÈGLE ABSOLUE : cette liste ne se reconstruit JAMAIS depuis le `onchange` d'une de ses
// cases. Reconstruire le panneau (p.innerHTML='') pendant le clic DÉTRUIT le nœud que
// l'utilisateur vient de cocher : le navigateur achève alors l'activation sur un nœud
// détaché et l'état visuel retombe — d'où le symptôme « je peux décocher mais pas
// cocher » (décocher « marche » seulement parce que l'image est déjà celle attendue).
// On met donc à jour le compteur SUR PLACE, et on ne rafraîchit que le modèle et la 3D.
function repSourceList(base,onChange,onTick){
  const box=document.createElement('div');box.className='col';box.style.marginTop='6px';
  const cand=doc.features.filter(f=>repCanFeature(f.id));
  const t=document.createElement('div');t.className='note';t.style.marginBottom='2px';
  const estDedans=id=>cand.some(f=>f.id===id);
  const majCompteur=()=>{
    t.textContent='Fonctions à répéter — '+(base||[]).filter(estDedans).length+' cochée(s) sur '+cand.length;
  };
  majCompteur();
  box.appendChild(t);
  if(!cand.length){
    const w=document.createElement('span');w.className='note';
    w.textContent='Aucune fonction répétable pour l\'instant (extrusion, découpe, congé ou chanfrein).';
    box.appendChild(w);
    return box;
  }
  cand.forEach(f=>{
    const l=document.createElement('label');
    l.style.display='flex';l.style.alignItems='center';l.style.gap='6px';l.style.cursor='pointer';
    const c=document.createElement('input');c.type='checkbox';c.checked=(base||[]).indexOf(f.id)>=0;
    c.className='repsrcchk'; // identifie les cases de sources (la case « Visible » du panneau en est une autre)
    c.onchange=()=>{
      const b=(base||[]).slice();
      const i=b.indexOf(f.id);
      if(c.checked){if(i<0)b.push(f.id);}else if(i>=0)b.splice(i,1);
      // la case garde son propre état : on ne la remplace pas, on met à jour autour
      let ko=null;
      try{onChange(b,f);}catch(err){ko=err;}
      base=b; // l'état fait foi, même si la reconstruction a échoué : l'interface reste cohérente
      majCompteur();
      if(ko){
        try{faceEl.textContent='Répétition : mise à jour impossible ('+(ko.message||ko)+').';}catch(e){}
      }else if(onTick){
        try{onTick();}catch(e){}
      }
    };
    const s=document.createElement('span');
    s.textContent=featIconOf(f)+' '+f.name;
    s.title=repCanFeatureHint(f);
    l.appendChild(c);l.appendChild(s);
    box.appendChild(l);
  });
  return box;
}
function enterRepMode(){
  if(skEdit)return;
  if(filMode||filModeX)exitFilletMode(true);
  repMode={type:'lin',copies:2,dist:20,angle:360,axis:'X',plane:'YZ',feats:[]};
  if(sel.kind==='feature'&&repCanFeature(sel.id))repMode.feats.push(sel.id);
  renderTree();renderRepPanel();
  faceEl.textContent='Répétition : cochez les fonctions à répéter dans la liste ci-dessus, puis Appliquer. Astuce : la repetition est depliee dans l arbre et ses sources sont marquees ◀.';
}
function exitRepMode(){repMode=null;renderTree();renderProps();}
function repTypeName(m,f){if(m==='mir'&&f&&f.plane2)return 'Symétrie double';return m==='mir'?'Symétrie':m==='circ'?'Circulaire':'Linéaire';}
function repAxisVec(cfg){const c=cfg||repMode;const a=c&&c.axis;if(c&&c.dir)return repNorm(c.dir);if(a==='Y')return[0,1,0];if(a==='Z')return[0,0,1];return[1,0,0];}
function repPlaneN(cfg){const c=cfg||repMode;if(c&&c.planeN)return repNorm(c.planeN);const p=c&&c.plane;if(p==='XY')return[0,0,1];if(p==='XZ')return[0,1,0];return[1,0,0];}
function repNorm(a){const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];}
function repDot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function repCross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function repAdd(a,b){return[a[0]+b[0],a[1]+b[1],a[2]+b[2]];}
function repScale(a,s){return[a[0]*s,a[1]*s,a[2]*s];}
function repRot(v,axis,deg){
  const u=repNorm(axis),t=deg*Math.PI/180,c=Math.cos(t),s=Math.sin(t),uxv=repCross(u,v),ud=repDot(u,v);
  return repAdd(repAdd(repScale(v,c),repScale(uxv,s)),repScale(u,ud*(1-c)));
}
function repTransformPoint(p,i,cfg){const c=cfg||repMode,t=c.mode||c.type;
  const v=[+(p&&p[0]||0),+(p&&p[1]||0),+(p&&p[2]||0)];
  if(t==='lin')return repAdd(v,repScale(repAxisVec(c),(+c.dist||0)*i));
  if(t==='circ')return repRot(v,repAxisVec(c),(+c.angle||360)*i/(+c.copies||1));
  const n=repPlaneN(c);return repAdd(v,repScale(n,-2*repDot(v,n)));
}
function repTransformVec(v,i,cfg){const c=cfg||repMode,t=c.mode||c.type;
  const a=[+(v&&v[0]||0),+(v&&v[1]||0),+(v&&v[2]||0)];
  if(t==='lin')return a;
  if(t==='circ')return repRot(a,repAxisVec(c),(+c.angle||360)*i/(+c.copies||1));
  const n=repPlaneN(c);return repAdd(a,repScale(n,-2*repDot(a,n)));
}
let repGenBusy=false; // garde-fou : une régénération ne s'emboîte jamais (rejeu non borné)
function repCloneSketch(sk,i,skMap,featMap,cfg,reuse){
  // reuse = esquisse d'une instance déjà créée : MISE À JOUR EN PLACE (id conservé). Les
  // identifiants d'esquisses d'instances sont donc STABLES d'une régénération à l'autre :
  // cotes, hôtes, projections, sélection et marqueur temps gardent leurs cibles.
  if(!reuse&&skMap[sk.id])return skMap[sk.id];
  const ns=JSON.parse(JSON.stringify(sk));
  ensureSketchBasis(ns);
  ns.name=(sk.name||'Esquisse')+' (rép '+i+')';
  ns.origin=repTransformPoint(ns.origin||[0,0,0],i,cfg).map(v=>+v.toFixed(6));
  ns.axU=repTransformVec(ns.axU,i,cfg).map(v=>+v.toFixed(9));
  ns.axV=repTransformVec(ns.axV,i,cfg).map(v=>+v.toFixed(9));
  ns.axN=repTransformVec(ns.axN,i,cfg).map(v=>+v.toFixed(9));
  if(ns.host&&ns.host.feat&&featMap[ns.host.feat])ns.host.feat=featMap[ns.host.feat];else delete ns.host;
  if(reuse){
    const keep=reuse.id;
    for(const k of Object.keys(reuse))if(!(k in ns))delete reuse[k];
    Object.assign(reuse,ns);reuse.id=keep;
    if(!reuse.host)delete reuse.host;
    return keep;
  }
  ns.id=uid('sk');
  doc.sketches.push(ns);skMap[sk.id]=ns.id;return ns.id;
}
function repCloneFeature(f,i,skMap,featMap,cfg,reuse){
  // reuse = instance déjà créée : on rafraîchit l'objet EXISTANT (id conservé) au lieu d'en
  // créer un nouveau — les fonctions qui pointent vers cette instance restent valides.
  const nf=JSON.parse(JSON.stringify(f));delete nf._m;delete nf._mesh;
  nf.visible=true;nf._src=f.id;
  const target=reuse?reuse.id:uid(f.type==='xfillet'?'xf':'ex');
  if(f.type==='extrude'){
    const sk=doc.sketches.find(s=>s.id===f.sketchId);if(!sk)return null;
    featMap[f.id]=target; // AVANT l'esquisse : l'hôte (feat) de l'esquisse se remappe sur l'instance
    const reuseSk=reuse?doc.sketches.find(s=>s.id===reuse.sketchId):null;
    nf.sketchId=repCloneSketch(sk,i,skMap,featMap,cfg,reuseSk);
    if(nf.upto&&nf.upto.ex){if(featMap[nf.upto.ex])nf.upto.ex=featMap[nf.upto.ex];else nf.upto=null;}
  }else{
    featMap[f.id]=target;
    if(f.type==='xfillet')nf.edges=(nf.edges||[]).map(s=>{
      // Le clone d'un congé doit être le MIROIR de la sélection — donc `pos` ET `pos0`
      // (la position au moment du clic, qui sert de référence à l'appariement) sont
      // transformés. Ne transformer que `pos` laissait `pos0` sur la source : le
      // congruence cherchait alors l'arête du mauvais côté de la pièce, s'accrochait à
      // celle d'origine (d'où « ancre divergente ignorée (pointait 37,9 mm du clic) »)
      // et finissait en `_err` — le triangle ⚠ de l'arbre.
      const o=Object.assign({},s,{anchor:null});
      o.pos=repTransformPoint(s.pos,i,cfg).map(v=>+v.toFixed(6));
      o.pos0=repTransformPoint(s.pos0||s.pos,i,cfg).map(v=>+v.toFixed(6));
      delete o._div; // divergence herdée de la source : sans rapport avec le clone
      return o;
    });
  }
  // Le NOM de la FONCTION COPIÉE est conservé tel quel dans la sous-arborescence (c'est la
  // répétition elle-même qui porte le nom du TYPE : Linéaire / Circulaire / Symétrie).
  nf.name=f.name||'Fonction';
  if(reuse){
    const keep=reuse.id;
    for(const k of Object.keys(reuse))if(!(k in nf))delete reuse[k];
    Object.assign(reuse,nf);reuse.id=keep;
    return reuse;
  }
  nf.id=target;return nf; // l'insertion dans doc.features est faite par repGenChildren (kids)
}
function repGenChildren(rp){
  // Reconstruit les INSTANCES d'une répétition depuis rp.base et ses paramètres, PAR
  // RECONSTRUCTION À PARTIR DE LA MODIFICATION : les instances existantes sont rafraîchies
  // en place (même id, même id d'esquisse), seules les instances surnuméraires ou sans
  // source sont retirées, et le tout est replacé juste après la répétition dans la timeline.
  if(!rp||rp.type!=='repeat'||repGenBusy)return 0;
  repGenBusy=true;
  try{
  const olds=doc.features.filter(f=>f.repeatId===rp.id);
  const dropSketch=cid=>{
    const f=doc.features.find(x=>x.id===cid);if(!f||!f.sketchId)return;
    const sk=doc.sketches.find(s=>s.id===f.sketchId);
    if(sk&&!doc.features.some(x=>x.id!==f.id&&x.sketchId===sk.id))doc.sketches=doc.sketches.filter(s=>s.id!==sk.id);
  };
  rp.base=rp.base.filter(id=>{const b=doc.features.find(x=>x.id===id);return b&&b.type!=='repeat'&&!b.repeatId;});
  const n=rp.mode==='mir'?1:repMaxCopies(rp.copies);
  const base=rp.base.map(id=>doc.features.find(f=>f.id===id)).filter(Boolean).sort((a,b)=>doc.features.indexOf(a)-doc.features.indexOf(b));
  // Symétrie DOUBLE : un 2ᵉ plan (rp.plane2) ajoute une 2ᵉ passe qui miroite la BASE et
  // les instances de la 1ʳᵉ passe — « la 1ère symétrie est comprise dans la seconde,
  // ainsi que l'opération initiale ». Chaque passe applique UN SEUL miroir via la
  // machinerie existante (pas de transformée composée, pas d'imbrication — celle-ci
  // reste exclue par le filtre ci-dessus et la garde repGenBusy).
  const mir2=rp.mode==='mir'&&!!rp.plane2;
  const cfg2=mir2?Object.assign({},rp,{plane:rp.plane2,planeN:rp.planeN2}):null;
  if(mir2){
    // Deux plans identiques (n et −n = même plan) : la 2ᵉ passe remettrait tout en place.
    try{
      const n1=repPlaneN(rp);
      const n2=rp.planeN2?repNorm(rp.planeN2):repPlaneN({plane:rp.plane2});
      const d=Math.abs(n1[0]*n2[0]+n1[1]*n2[1]+n1[2]*n2[2]);
      rp._samePlane=!(d<0.999);
    }catch(e){rp._samePlane=false;}
  }else delete rp._samePlane;
  // Recyclage : pour (index, type), on reprend les instances existantes dans l'ordre de la
  // timeline (priorité à celle dont la source _src correspond).
  const g=new Map();
  olds.forEach(c=>{const k=(c.repIndex||1)+'|'+c.type;if(!g.has(k))g.set(k,[]);g.get(k).push(c);});
  const take=(i,t,src)=>{
    const arr=g.get(i+'|'+t)||[];
    let c=arr.find(x=>x._src===src);
    if(!c)c=arr[0]||null;
    if(c)arr.splice(arr.indexOf(c),1);
    return c;
  };
  // 1) Recyclage : voir buildPass ci-dessous — chaque passe recycle ses propres
  // instances via take() (clé 'index|type', préférence _src), ids stables d'un rejeu
  // à l'autre. Pour la 2ᵉ passe, la source est l'instance de 1ʳᵉ passe (id stable).
  const reuse=new Map(); // 'index|srcId' -> instance existante (toutes passes)
  // 2) Purge : instances hors bornes ou dont la source a disparu (+ esquisses orphelines).
  // Pour le miroir double, les instances de 2ᵉ passe sont recyclées à partir des instances
  // de 1ʳᵉ passe (ids stables) : la passe 1 est donc reconstruite D'ABORD, puis la passe 2
  // recycle et reconstruit à partir des instances de passe 1 déjà à jour.
  const buildPass=(sources,cfg,idx)=>{
    const skMap={},featMap={};
    const kids=[];
    sources.forEach(f=>{
      const c=take(idx,f.type,f.id);
      const nf=repCloneFeature(f,idx,skMap,featMap,cfg,c||null);
      if(nf){nf.repeatId=rp.id;nf.repIndex=idx;if(c)reuse.set(idx+'|'+f.id,c);kids.push(nf);}
    });
    return kids;
  };
  const kids1=(rp.mode==='mir')?buildPass(base,rp,1):[];
  let kids2=[];
  if(mir2&&!rp._samePlane){
    const sources2=[];
    base.forEach(f=>{sources2.push(f);const k1=kids1.find(k=>k._src===f.id);if(k1)sources2.push(k1);});
    kids2=buildPass(sources2,cfg2,2);
  }
  const kept=new Set([...reuse.values()]);
  olds.forEach(c=>{if(!kept.has(c))dropSketch(c.id);});
  doc.features=doc.features.filter(f=>f.repeatId!==rp.id);
  rp.children=[];
  const kids=(rp.mode==='mir')?kids1.concat(kids2):[];
  if(rp.mode!=='mir'){
    for(let i=1;i<=n;i++){
      const skMap={},featMap={};
      base.forEach(f=>{
        const c=take(i,f.type,f.id);
        const nf=repCloneFeature(f,i,skMap,featMap,rp,c||null);
        if(nf){nf.repeatId=rp.id;nf.repIndex=i;if(c)reuse.set(i+'|'+f.id,c);rp.children.push(nf.id);kids.push(nf);}
      });
    }
  }else{
    kids.forEach(nf=>rp.children.push(nf.id));
  }
  const at=doc.features.indexOf(rp);
  if(at<0)doc.features=doc.features.concat(kids);else doc.features.splice(at+1,0,...kids);
  return kids.length;
  }finally{repGenBusy=false;}
}
function repRemoveRepeat(rp){
  if(!rp||rp.type!=='repeat')return;
  for(const f of [...doc.features]){
    if(f.repeatId!==rp.id||!f.sketchId)continue;
    const sk=doc.sketches.find(s=>s.id===f.sketchId);
    if(sk&&!doc.features.some(x=>x!==f&&x.sketchId===sk.id))doc.sketches=doc.sketches.filter(s=>s.id!==sk.id);
  }
  doc.features=doc.features.filter(f=>f.id!==rp.id&&f.repeatId!==rp.id);
}
function repSyncForSketch(skId){
  // Régénère les instances des répétitions dont une fonction SOURCE utilise cette esquisse :
  // après une édition d'esquisse, les clones (esquisses copiées/miroir) suivent la géométrie.
  if(!skId)return;
  const fids=new Set();
  doc.features.forEach(f=>{if(f.sketchId===skId&&f.type!=='repeat'&&!f.repeatId)fids.add(f.id);});
  if(!fids.size)return;
  for(const rp of [...doc.features]){if(rp.type==='repeat'&&rp.base.some(id=>fids.has(id)))repGenChildren(rp);}
}
function repSyncForFeature(f){
  // Régénère les instances des répétitions dont f est une fonction SOURCE (profondeur,
  // opération, sens, étendue, congé édités) : les clones suivent les nouveaux paramètres.
  if(!f)return;
  for(const rp of [...doc.features]){if(rp.type==='repeat'&&rp.base.includes(f.id))repGenChildren(rp);}
}
const REPEAT_MAX=200; // garde-fou : une saisie de copies aberrante ne doit pas figer le rejeu
function repMaxCopies(v){const n=Math.floor(+v||1);return isFinite(n)?Math.min(REPEAT_MAX,Math.max(1,n)):1;}
function repCloneSkName(sk){return /\(rép\s*\d+\)\s*$/.test((sk&&sk.name)||'');}
function docSanitise(){
  // Répare un document rechargé : instance en double, instance sans répétition, esquisse
  // d'instance abandonnée et nombre de copies aberrant. Les esquisses LIBRES (non
  // consommées par une extrusion) sont conservées : elles sont légitimes.
  // Les corps conteneurs sont normalisés aussi (anciens documents : tout vers « Corps 1 »).
  try{ensureBodies();}catch(e){}
  let dup=0,orph=0,sk=0,cap=0;
  const seen=new Set();
  doc.features=(doc.features||[]).filter(f=>{
    if(!f||!f.id)return false;
    if(seen.has(f.id)){dup++;return false;}
    seen.add(f.id);return true;
  });
  const repIds=new Set(doc.features.filter(f=>f.type==='repeat').map(f=>f.id));
  doc.features=doc.features.filter(f=>{if(f.repeatId&&!repIds.has(f.repeatId)){orph++;return false;}return true;});
  doc.features.forEach(f=>{if(f.type==='repeat'){const c=repMaxCopies(f.copies);if(c!==Math.floor(+f.copies||1))cap++;f.copies=c;}});
  const used=new Set(doc.features.map(f=>f.sketchId).filter(Boolean));
  doc.sketches=(doc.sketches||[]).filter(x=>{
    if(used.has(x.id))return true;
    if(repCloneSkName(x)){sk++;return false;}
    return true;
  });
  // Nom des congés/chanfreins exacts : une ancienne version pouvait perdre des arêtes
  // (fusion de jumeaux sur des arcs sans ancre) et laisser « Congé exact (16 arête(s)) »
  // alors qu'il n'en restait que 12 — un nom menteur dans l'arbre. On le réaligne sur la
  // géométrie réelle au chargement. Les noms de fonctions ne sont pas éditables à la main.
  let ren=0;
  doc.features.forEach(f=>{if(f.type==='xfillet'){const n=xFeatName(f);if(f.name!==n){f.name=n;ren++;}}});
  // Même raison pour le dépouillage : un nom qui annonce « 3 face(s) » quand il en reste 1
  // (faces disparues après une modification en amont) doit être remis d'aplomb au chargement.
  doc.features.forEach(f=>{if(f.type==='xdraft'){const n=draftName(f);if(f.name!==n){f.name=n;ren++;}}});
  // Même raison pour la coque : « 2 face(s) retirée(s) » doit suivre la sélection réelle.
  doc.features.forEach(f=>{if(f.type==='xshell'){const n=shellName(f);if(f.name!==n){f.name=n;ren++;}}});
  return {dup,orph,sk,cap,ren};
}
function delFeature(f){
  if(!f)return;
  if(f.type==='repeat'){repRemoveRepeat(f);return;}
  doc.features=doc.features.filter(x=>x.id!==f.id);
  doc.features.forEach(rp=>{if(rp.type==='repeat')rp.base=rp.base.filter(id=>id!==f.id);});
  if(tlMark===f.id)tlMark=null;
}
// Le bouton vit ici (sources, jamais la coque HTML — même règle que Révolution) :
// après Révolution si présente, sinon après Extrusion. Le regroupement du bandeau
// (96) ne déplace que ses ids connus : ➕ Corps reste en direct, action primaire.
(function(){
  if(typeof document==='undefined'||document.getElementById('btnBody'))return;
  const after=document.getElementById('btnRevolve')||document.getElementById('btnExtrude');
  if(!after||!after.parentNode)return;
  const b=document.createElement('button');
  b.id='btnBody';b.textContent='◧ Corps';
  b.title='Nouveau corps : les fonctions suivantes naîtront dedans (il devient actif ●)';
  b.onclick=()=>newBody();
  after.parentNode.insertBefore(b,after.nextSibling);
})();
function newBody(){
  // Crée un corps VIDE et l'ACTIVE : esquissez puis extrudez, la fonction naîtra
  // dedans (addFeature taggue au corps actif). Annulable comme toute modification.
  try{ensureBodies();}catch(e){}
  docPushUndo('création d\'un corps');
  const n=doc.bodySeq++;
  const e={id:'b'+n,name:'Corps '+n,c:null};
  doc.bodies.push(e);doc.activeBody=e.id;
  treeSel=[];sel={kind:'body',id:e.id};
  try{dirty=true;}catch(e2){}
  renderTree();renderProps();refreshParts();
  try{faceEl.textContent='« '+e.name+' » créé et ACTIF (●) : esquissez puis extrudez — la fonction naîtra dedans.';}catch(e2){}
}
function bodyTextColor(be){
  // Couleur du NOM du corps dans l'arbre : celle du mesh affiché si présent
  // (toujours définie : palette auto au pire), sinon celle de la fiche, sinon
  // couleur du texte par défaut (''). Même source que la pièce 3D : on lit le corps.
  try{
    const live=bodies.find(b=>b.kind==='body'&&b.id===be.id);
    const c=(live&&isFinite(+live.color)&&+live.color>0)?+live.color:((be&&isFinite(+be.color)&&+be.color>0)?+be.color:0);
    return c?cssHex(c):'';
  }catch(e){return '';}
}
function bodyToggleVis(id){
  // Œil du corps = VUE SEULE : le mesh disparaît de la 3D, rien d'autre ne bouge.
  // Le corps reste dans le rejeu (f.visible inchangé), reste le corps actif, et
  // reste exportable — cacher ne désactive plus. Séparation stricte des 3 rôles :
  //   👁 = vue (doc.bodyVis, ce fichier) · ⏻ = rejeu (bodyToggleEnabled) · ● = actif.
  try{
    const caché=!!(doc.bodyVis&&doc.bodyVis[id]===false);
    if(caché){
      delete doc.bodyVis[id];
      // Un corps masqué comme BRUT FAO (doc.bodyVis=false posé par faoStockBodyHide_)
      // revient par l'œil : on ne défait QUE ce qu'on a fait.
      const s=(typeof faoSetup==='function')?faoSetup():null;
      if(s&&s.stockSrc==='body'&&s.stockBody===id)s.stockBodyHid=false;
      const bd=(typeof bodies!=='undefined'&&bodies?bodies:[]).filter(function(b){return b&&b.id===id;})[0];
      if(bd){bd.visible=true;if(bd.mesh)bd.mesh.visible=true;}
      markDirty();refreshParts();renderTree();
      return;
    }
    doc.bodyVis=doc.bodyVis||{};doc.bodyVis[id]=false;
    const bd=(typeof bodies!=='undefined'&&bodies?bodies:[]).filter(function(b){return b&&b.id===id;})[0];
    if(bd){bd.visible=false;if(bd.mesh)bd.mesh.visible=false;}
    markDirty();refreshParts();renderTree();
  }catch(e){}
}
function bodyEnabledOf(id){
  // true = toutes les fonctions du corps sont dans le rejeu (⏻ allumé).
  try{
    const kids=doc.features.filter(f=>!f.repeatId&&f.body===id);
    if(!kids.length)return true;
    const specs=kids.concat(doc.features.filter(k=>k.repeatId&&k.body===id));
    return specs.some(f=>f.visible!==false);
  }catch(e){return true;}
}
function bodyToggleEnabled(id){
  // ⏻ du corps = REJEU : bascule f.visible sur TOUTES ses fonctions (et leurs
  // instances de répétition) — exactement ce que faisait l'œil avant. Une seule
  // source de vérité, annulable (Ctrl+Z), persistée dans le document.
  // N' touche à AUCUNE visibilité de mesh : le corps reste affiché (grisé hors rejeu).
  const kids=doc.features.filter(f=>!f.repeatId&&f.body===id);
  const vis=!bodyEnabledOf(id); // tout est dedans → on coupe, sinon on rallume
  kids.forEach(f=>{f.visible=vis;});
  doc.features.forEach(k=>{if(k.repeatId&&k.body===id)k.visible=vis;});
  markDirty();rebuild();renderTree();
}
function featBlockOf(f){
  // Bloc déplaçable d'un cran : fonction simple ([i,i]) ou répétition + ses
  // instances ([i,j], contiguës par construction de repGenChildren). Une instance
  // seule n'est jamais déplaçable (dérivée) : null.
  const F=doc.features;
  const i=F.indexOf(f);
  if(!f||i<0||f.repeatId)return null;
  if(f.type!=='repeat')return [i,i];
  const kids=F.filter(k=>k.repeatId===f.id);
  const j=i+kids.length;
  for(let k=i+1;k<=j;k++){const o=F[k];if(!o||o.repeatId!==f.id)return null;}
  return [i,j];
}
function featMove(id,dir){
  // Décale un bloc d'un cran DANS SON CORPS (ordre de rejeu du corps), en sautant
  // les fonctions des autres corps et les blocs voisins entiers. L'ordre global
  // n'a de sens que par corps depuis les corps conteneurs : A2 peut passer devant
  // A1 même si B1 est entre les deux. Annulable (une étape). Retourne true si fait.
  const F=doc.features;
  const f=F.find(x=>x.id===id);
  if(!f||(dir!==1&&dir!==-1))return false;
  const bl=featBlockOf(f);
  if(!bl)return false;
  const mine=f.body, L=bl[1]-bl[0]+1;
  const topAt=k=>{ // début du bloc contenant l'index k (conteneur ou fonction simple)
    const o=F[k];if(!o)return -1;
    if(o.repeatId){const c=F.findIndex(x=>x.id===o.repeatId&&x.type==='repeat');return c;}
    return k;
  };
  const blkLen=k=>{const o=F[k];return (o&&o.type==='repeat'&&!o.repeatId)?F.filter(x=>x.repeatId===o.id).length:0;};
  let at=-1,after=0;
  if(dir<0){
    let k=bl[0]-1;
    while(k>=0){
      const s=topAt(k);
      if(s<0||s>=bl[0]){k--;continue;}
      if(F[s].body===mine){at=s;after=0;break;}
      k=s-1; // saute le bloc entier d'un autre corps
    }
    if(at<0)return false;
    docPushUndo('déplacement de « '+f.name+' »');
    const seg=F.splice(bl[0],L);
    F.splice(at,0,...seg);
  }else{
    let k=bl[1]+1;
    while(k<F.length){
      const o=F[k];
      if(o.repeatId){k++;continue;} // anomalie (instance sans conteneur avant) : on avance
      const e=k+blkLen(k);
      if(o.body===mine){at=k;after=e-k+1;break;}
      k=e+1; // saute le bloc entier d'un autre corps
    }
    if(at<0)return false;
    docPushUndo('déplacement de « '+f.name+' »');
    const seg=F.splice(bl[0],L);
    F.splice(at-L+after,0,...seg);
  }
  markDirty();rebuild();renderTree();renderProps();
  return true;
}
function delBody(id){
  // Supprime le corps ET ses fonctions (avec leurs dépendances : congés, répétitions
  // qui les consomment — delFeature cascade déjà). Les répétitions à cheval sur deux
  // corps partent aussi, sinon leurs instances resteraient orphelines sans se régénérer.
  const e=(doc.bodies||[]).find(x=>x.id===id);
  if(!e)return;
  const kids=doc.features.filter(f=>f.body===id);
  const kidIds=new Set(kids.map(f=>f.id));
  const reps=doc.features.filter(f=>f.type==='repeat'&&(f.body===id||(f.base||[]).some(b=>kidIds.has(b))));
  const nF=kids.length+reps.filter(r=>r.body!==id).length;
  if(!confirm('Supprimer « '+e.name+' »'+(nF?(' et ses '+nF+' fonction(s)'):' (vide)')+' ?'))return;
  docPushUndo('suppression de « '+e.name+' »');
  reps.forEach(f=>delFeature(f));
  doc.features.filter(f=>f.body===id).forEach(f=>delFeature(f));
  doc.bodies=doc.bodies.filter(x=>x.id!==id);
  if(!doc.bodies.length){const n=doc.bodySeq++;const nid='b'+n;doc.bodies.push({id:nid,name:'Corps '+n,c:null});}
  if(!doc.bodies.some(x=>x.id===doc.activeBody))doc.activeBody=doc.bodies[0].id;
  treeSel=[];sel={kind:'body',id:doc.activeBody};
  markDirty();rebuild();renderTree();renderProps();
}

// ── sélection multiple + suppression ─────────────────────────────────────────
function treeSelToggle(id){
  const i=treeSel.indexOf(id);
  if(i>=0){if(treeSel.length===1)treeSel=[];else treeSel.splice(i,1);}
  else treeSel.push(id);
  // `sel` suit le dernier clic : le panneau de propriétés reste cohérent
  sel={kind:'feature',id};
  renderTree();renderProps();refreshParts();
  const n=treeSel.length;
  faceEl.textContent=n?(n+' fonction(s) sélectionnée(s) — Suppr pour supprimer, Échap pour désélectionner.')
                    :'Sélection vidée.';
}
function treeSelIds(){
  if(treeSel&&treeSel.length)return treeSel.slice();
  if(sel&&sel.kind==='feature')return [sel.id];
  return [];
}
// Ce qui DÉPEND des fonctions visées et qu'il faut donc emporter avec elles :
// congé/chanfrein exact (target), répétition (base), et — en cascade de suppression
//elles-mêmes — les dépendances de dépendances (boucle bornée à quelques tours).
function treeSelDeps(ids){
  const set=new Set(ids),out=[];
  const ajouter=id=>{if(id&&!set.has(id)){set.add(id);out.push(id);}};
  for(let tour=0;tour<4;tour++){
    let trouve=false;
    doc.features.forEach(f=>{
      if(set.has(f.id))return;
      if((f.type==='xfillet'||f.type==='fillet')&&set.has(f.target)){ajouter(f.id);trouve=true;}
      if(f.type==='repeat'&&(f.base||[]).some(b=>set.has(b))){ajouter(f.id);trouve=true;}
    });
    if(!trouve)break;
  }
  return out;
}
function treeDeleteSel(){
  const ids=treeSelIds().filter(id=>doc.features.some(f=>f.id===id));
  if(!ids.length)return;
  const noms=id=>{const f=doc.features.find(x=>x.id===id);return f?f.name:id;};
  const deps=treeSelDeps(ids);
  const tous=ids.concat(deps);
  let msg;
  if(tous.length===1)msg='Supprimer « '+noms(tous[0])+' » ?';
  else msg='Supprimer '+tous.length+' fonction(s) ?\n\n· '+tous.map(noms).join('\n· ');
  if(deps.length)msg+='\n\n'+deps.length+' fonction(s) en dépendent : elles seront supprimées aussi.';
  // les esquisses posées sur une face de la fonction supprimée ne sont PAS
  // détruites (trop destructif) : on prévient qu'elles perdent leur hôte.
  const skDep=(doc.sketches||[]).filter(s=>s.host&&ids.indexOf(s.host.feat)>=0);
  if(skDep.length)msg+='\n'+skDep.length+' esquisse(s) sont posées sur ses faces : elles resteront, sans hôte.';
  if(!confirm(msg))return;
  docPushUndo('suppression de '+tous.length+' fonction(s)');
  tous.slice().forEach(id=>{
    const f=doc.features.find(x=>x.id===id);
    if(f)delFeature(f);
  });
  treeSel=[];sel={kind:null,id:null};
  markDirty();rebuild();
  renderTree();renderProps();refreshParts();
  try{buildEdgeOverlay();}catch(e){}
  try{refreshMirror();}catch(e){}
  faceEl.textContent='🗑 Supprimé : '+tous.map(noms).join(', ')+'  —  Ctrl+Z pour annuler.';
}
function repUseFaceFor(rp,which){
  if(!selFaces||!selFaces.length)return;
  const s=selFaces[0],n=faceNormalWorld(s.mesh,s.faceIndex);if(!n)return;
  const a=[n.x,n.y,n.z];
  if(rp.mode==='mir'){
    if(which===2){rp.plane2='Face';rp.planeN2=a;}
    else{rp.plane='Face';rp.planeN=a;}
  }else{rp.axis='Face';rp.dir=a;}
  repGenChildren(rp);markDirty();rebuild();renderTree();renderProps();refreshParts();
}
function applyRepPattern(){
  if(!repMode)return;
  const ids=(repMode.feats||[]).filter(repCanFeature);
  if(!ids.length){faceEl.textContent='Répétition : cochez au moins une fonction à répéter dans la liste ci-dessus.';return;}
  const base=ids.map(id=>doc.features.find(f=>f.id===id)).filter(Boolean).sort((a,b)=>doc.features.indexOf(a)-doc.features.indexOf(b));
  // La répétition devient une FONCTION réelle (type 'repeat') : elle garde ses paramètres,
  // ses fonctions sources (base) et ses instances (children, créées par repGenChildren).
  const rp={id:uid('rp'),type:'repeat',name:repTypeName(repMode.type,repMode),mode:repMode.type,
    copies:repMaxCopies(repMode.copies),dist:repMode.dist,angle:repMode.angle,
    axis:repMode.axis,plane:repMode.plane,dir:repMode.dir,planeN:repMode.planeN,
    plane2:repMode.plane2||undefined,planeN2:repMode.planeN2||undefined,
    base:base.map(f=>f.id),children:[],visible:true};
  addFeature(rp);
  const nb=repGenChildren(rp);
  exitRepMode();
  sel={kind:'feature',id:rp.id};
  markDirty();rebuild();renderTree();renderProps();refreshParts();
  faceEl.textContent='Répétition : '+nb+' fonction(s) copiée(s) — « '+rp.name+' » — les sources se cochent dans le panneau, à la création comme à l\'édition.';
}
function repUseSelectedFace(){
  if(!repMode||!selFaces||!selFaces.length)return;
  const s=selFaces[0],n=faceNormalWorld(s.mesh,s.faceIndex);if(!n)return;
  const a=[n.x,n.y,n.z];
  if(repMode.type==='mir'){repMode.plane='Face';repMode.planeN=a;}else{repMode.axis='Face';repMode.dir=a;}
  renderRepPanel();
}
function repUseSelectedFace2(){
  if(!repMode||repMode.type!=='mir'||!selFaces||!selFaces.length)return;
  const s=selFaces[0],n=faceNormalWorld(s.mesh,s.faceIndex);if(!n)return;
  repMode.plane2='Face';repMode.planeN2=[n.x,n.y,n.z];
  renderRepPanel();
}
function renderRepPanel(){
  const p=$('props');p.innerHTML='';if(!repMode)return;
  const h=document.createElement('div');h.innerHTML='<b>🔁 Répétition</b><br><span class="note">Choisissez les fonctions à répéter ci-dessous (cases à cocher). Dans l\'arbre, un <b>Ctrl+clic</b> sert désormais à la multi-suppression.</span>';p.appendChild(h);
  const row=document.createElement('div');row.className='row';
  const typ=document.createElement('select');[['lin','Linéaire'],['circ','Circulaire'],['mir','Symétrie']].forEach(o=>{const op=document.createElement('option');op.value=o[0];op.textContent=o[1];typ.appendChild(op);});typ.value=repMode.type;typ.onchange=()=>{repMode.type=typ.value;renderRepPanel();};row.appendChild(typ);
  const cnt=document.createElement('input');cnt.type='number';cnt.min='1';cnt.value=repMode.copies;cnt.style.width='64px';cnt.title='Nombre de copies';cnt.onchange=()=>{repMode.copies=repMaxCopies(cnt.value);};row.appendChild(cnt);p.appendChild(row);
  const ax=document.createElement('select');['X','Y','Z','Face'].forEach(v=>{const op=document.createElement('option');op.value=v;op.textContent=(repMode.type==='mir'?(v==='X'?'YZ':v==='Y'?'XZ':v==='Z'?'XY':v):v);ax.appendChild(op);});
  ax.value=repMode.type==='mir'?(repMode.plane==='XY'?'Z':repMode.plane==='XZ'?'Y':repMode.plane==='Face'?'Face':'X'):(repMode.axis||'X');
  ax.onchange=()=>{if(repMode.type==='mir'){repMode.plane=ax.value==='X'?'YZ':ax.value==='Y'?'XZ':ax.value==='Z'?'XY':'Face';delete repMode.planeN;}else{repMode.axis=ax.value;delete repMode.dir;}renderRepPanel();};p.appendChild(ax);
  if(repMode.type==='mir'){
    // Symétrie DOUBLE : un 2ᵉ plan dont la passe englobe la base ET la 1ʳᵉ symétrie.
    // Absent par défaut (compatibilité : une symétrie existante reste simple).
    const r2=document.createElement('div');r2.className='row';
    const t2=document.createElement('input');t2.type='checkbox';t2.checked=!!repMode.plane2;
    t2.title='Ajouter un 2ᵉ plan : la 1ʳᵉ symétrie est comprise dans la 2ᵉ, ainsi que l\u2019opération initiale';
    const l2=document.createElement('span');l2.textContent=' 2ᵉ plan (symétrie double)';
    r2.appendChild(t2);r2.appendChild(l2);p.appendChild(r2);
    t2.onchange=()=>{
      if(t2.checked){if(!repMode.plane2)repMode.plane2=(repMode.plane||'YZ')==='XZ'?'YZ':'XZ';}
      else{delete repMode.plane2;delete repMode.planeN2;}
      renderRepPanel();
    };
    if(repMode.plane2){
      const ax2=document.createElement('select');
      ['X','Y','Z','Face'].forEach(v=>{const op=document.createElement('option');op.value=v;op.textContent=(v==='X'?'YZ':v==='Y'?'XZ':v==='Z'?'XY':v);ax2.appendChild(op);});
      ax2.value=repMode.plane2==='XY'?'Z':repMode.plane2==='XZ'?'Y':repMode.plane2==='Face'?'Face':'X';
      ax2.title='2ᵉ plan de symétrie';
      ax2.onchange=()=>{repMode.plane2=ax2.value==='X'?'YZ':ax2.value==='Y'?'XZ':ax2.value==='Z'?'XY':'Face';delete repMode.planeN2;renderRepPanel();};
      p.appendChild(ax2);
      const bf2=document.createElement('button');bf2.textContent='🎯 Face → 2ᵉ plan';bf2.title='Prend la normale de la face sélectionnée comme 2ᵉ plan';
      bf2.onclick=()=>{repUseSelectedFace2();};p.appendChild(bf2);
    }
  }
  if(repMode.type==='lin'){const l=document.createElement('label');l.textContent=' Distance (mm)';const inp=document.createElement('input');inp.type='text';inp.inputMode='decimal';inp.value=repMode.dist;inp.style.width='80px';inp.onchange=()=>{repMode.dist=parseFloat(String(inp.value).replace(',','.'))||0;};l.appendChild(inp);p.appendChild(l);}
  if(repMode.type==='circ'){const l=document.createElement('label');l.textContent=' Angle total (°)';const inp=document.createElement('input');inp.type='text';inp.inputMode='decimal';inp.value=repMode.angle;inp.style.width='80px';inp.onchange=()=>{repMode.angle=parseFloat(String(inp.value).replace(',','.'))||360;};l.appendChild(inp);p.appendChild(l);}
  const bf=document.createElement('button');bf.textContent='Utiliser la face sélectionnée';bf.onclick=repUseSelectedFace;p.appendChild(bf);
  // ── FONCTIONS RÉPÉTABLES : la MÊME liste à cocher qu'à l'édition (voir
  // repSourceList). Aucun re-rendu ici : la case garde son état, seul l'arbre se
  // rafraîchit (le compteur se met à jour sur place, dans la liste).
  p.appendChild(repSourceList(repMode.feats,function(b){repMode.feats=b;},function(){renderTree();}));
  const r=document.createElement('div');r.className='row';r.style.marginTop='8px';const ok=document.createElement('button');ok.className='primary';ok.textContent='✔ Appliquer';ok.onclick=applyRepPattern;r.appendChild(ok);const q=document.createElement('button');q.textContent='Quitter';q.onclick=exitRepMode;r.appendChild(q);p.appendChild(r);
}
function renderProps(){
  if(typeof extNew!=='undefined'&&extNew)extNew=null; // une sélection annule le formulaire en cours
  if(typeof revNew!=='undefined'&&revNew)revNew=null; // idem pour le formulaire de révolution
  const p=$('props');p.innerHTML='';p.className='col'; // marqueur FAO retiré hors mode FAO
  // FAO : les fiches posage/opération vivent dans src/88-fao.js (arbre FAO dédié).
  if(sel&&(sel.kind==='faoSetup'||sel.kind==='faoOp')){
    try{ faoRenderProps(p,sel); }catch(e){}
    return;
  }
  const nm=document.createElement('div');nm.innerHTML=`<label>Nom du document<input type="text" id="docNameIn" value="${doc.name}"></label>`;
  p.appendChild(nm);$('docNameIn').onchange=e=>{doc.name=e.target.value;$('docName').textContent=doc.name;markDirty();};
  $('docName').textContent=doc.name;
  if(sel.kind==='sketch'){
    const sk=doc.sketches.find(s=>s.id===sel.id);if(!sk){p.appendChild(note('Esquisse supprimée.'));return;}
    p.appendChild(info(`<b>${sk.name}</b> · plan ${sketchFaceLabel(sk)} · ${sk.entities.length} entités`));
    p.appendChild(btn('🔧 Éditer l\'esquisse',()=>openSketch(sk.id)));
    p.appendChild(btn('🧱 Extruder cette esquisse',()=>askExtrude(sk.id)));
    p.appendChild(toggleBtn('👁 Visible',sk.visible!==false,v=>{sk.visible=v;rebuild();renderTree();}));
  }else if(sel.kind==='feature'){
    const f=doc.features.find(x=>x.id===sel.id);if(!f){p.appendChild(note('Fonction supprimée.'));return;}
    if(tlLocked(f)){
      p.appendChild(info(`⏱ <b>${f.name}</b> est exclue du rejeu : le marqueur temps s'arrête avant elle, elle n'apparaît pas dans la pièce.`));
      p.appendChild(btn('🔓 Lever le marqueur & éditer',()=>{tlSetPtr(null);markDirty();rebuild();renderTree();renderProps();}));
      p.appendChild(btn('🗑 Supprimer',()=>{treeSel=[f.id];sel={kind:'feature',id:f.id};treeDeleteSel();}));
      p.appendChild(btn('👁 Afficher / masquer',()=>{f.visible=!(f.visible!==false);markDirty();rebuild();renderTree();renderProps();}));
      return;
    }
    if(f.type==='xmove'){
      p.appendChild(info(`<b>${f.name}</b> · 📐 Déplacement d'une face`));
      if(f.ref){
        p.appendChild(note('Face visée : centre ('+f.ref.pos.map(v=>(+v).toFixed(1)).join(' ; ')+') mm, normale ('+
          f.ref.n.map(v=>(+v).toFixed(2)).join(' ; ')+'). La face est retrouvée à chaque rejeu par sa '+
          'position et sa normale, pas par son numéro — celui-ci change dès qu\'une opération ajoute une face.'));
      }
      const d=document.createElement('input');
      d.type='text';d.inputMode='decimal';
      d.value=String(+f.dist||0).replace('.',',');
      d.style.width='90px';
      d.addEventListener('change',()=>{
        const v=parseFloat(String(d.value).replace(',','.').replace(/\s/g,''));
        if(!isFinite(v)){d.value=String(+f.dist||0).replace('.',',');return;}
        if(v===+f.dist)return;
        f.dist=Math.abs(v)<1e-9?0:v;f.name=mvName(f);
        markDirty();rebuild();renderTree();renderProps();
        faceEl.textContent=v===0?'Distance nulle : la fonction ne déforme rien.':
          ('Distance '+f.name.replace('Déplacement de face ','')+' appliquée le long de la normale sortante de la face.');
      });
      const lab=document.createElement('span');
      lab.textContent=' Distance (mm) : ';lab.style.marginLeft='8px';
      p.appendChild(lab);p.appendChild(d);
      p.appendChild(note('Positif : la face avance. Négatif : elle rentre. 0 : la fonction ne fait rien.'));
      p.appendChild(btn('📐 Re-sélectionner la face',()=>{exitMoveFaceMode(true);try{if(filMode||filModeX)exitFilletMode(true);}catch(e){}enterMoveFaceMode();}));
      p.appendChild(btn('👁 Afficher / masquer',()=>{f.visible=!(f.visible!==false);markDirty();rebuild();renderTree();renderProps();}));
      p.appendChild(btn('🗑 Supprimer',()=>{treeSel=[f.id];sel={kind:'feature',id:f.id};treeDeleteSel();}));
      return;
    }
    if(f.type==='xdraft'){
      p.appendChild(info(`<b>${f.name}</b> · 📐 Dépouillage · ${(f.faces||[]).length} face(s)`));
      // Un dépouillage PARTIEL (⚠ dans l'arbre) doit s'expliquer comme un congé partiel :
      // combien de faces ont été retrouvées sur la pièce courante, lesquelles manquent.
      if(f._m&&f._m.t&&f._m.m<f._m.t){
        const manquant=f._m.t-f._m.m;
        p.appendChild(info(`<span style="color:var(--warn)">⚠ <b>${f._m.m}/${f._m.t}</b> face(s) retrouvée(s) — ${manquant} perdue(s).</span>`));
        p.appendChild(note('Les faces sont retrouvées à chaque rejeu par leur position et leur normale. '+
          'Si la pièce a changé en amont, re-sélectionnez les faces avec le bouton ci-dessous.'));
      }
      if(f.ref){
        p.appendChild(note('Face de référence (plan neutre, elle reste fixe) : centre ('+
          f.ref.pos.map(v=>(+v).toFixed(1)).join(' ; ')+') mm, normale ('+
          f.ref.n.map(v=>(+v).toFixed(2)).join(' ; ')+').'));
      }
      const d=document.createElement('input');
      d.type='text';d.inputMode='decimal';
      d.value=String(+f.angle||0).replace('.',',');
      d.style.width='90px';
      d.addEventListener('change',()=>{
        const v=parseFloat(String(d.value).replace(',','.').replace(/\s/g,''));
        if(!isFinite(v)){d.value=String(+f.angle||0).replace('.',',');return;}
        // 0 < a < 90 : au-delà, la dépouille n'a plus de sens géométrique.
        if(v<=0||v>=90){d.value=String(+f.angle||0).replace('.',',');faceEl.textContent='Angle hors bornes : le dépouillage doit être compris entre 0 et 90° (exclus).';return;}
        if(v===+f.angle)return;
        // Poussé dans l'historique AVANT la modification : l'undo doit ramener l'ancien
        // angle, sinon le point de contrôle rejoue la mauvaise géométrie.
        docPushUndo();
        f.angle=v;f.name=draftName(f);
        markDirty();rebuild();renderTree();renderProps();
        faceEl.textContent='Dépouillage à '+v.toFixed(1).replace('.',',')+'° appliqué.';
      });
      const lab=document.createElement('span');
      lab.textContent=' Angle (°) : ';lab.style.marginLeft='8px';
      p.appendChild(lab);p.appendChild(d);
      p.appendChild(note('Angle de démoulage : chaque face retenue pivote de cet angle autour de sa '+
        'ligne d\'intersection avec le plan neutre, de façon à ce qu\'elle ne coince plus au démontage. '+
        'Une face doit toucher le plan neutre ; une face qui lui est parallèle est refusée (pivot dégénéré).'));
      p.appendChild(btn('📐 Re-sélectionner les faces',()=>{exitDraftMode(true);try{if(filMode||filModeX)exitFilletMode(true);}catch(e){}enterDraftMode(f);}));
      p.appendChild(btn('👁 Afficher / masquer',()=>{f.visible=!(f.visible!==false);markDirty();rebuild();renderTree();renderProps();}));
      p.appendChild(btn('🗑 Supprimer',()=>{treeSel=[f.id];sel={kind:'feature',id:f.id};treeDeleteSel();}));
      return;
    }
    if(f.type==='xshell'){
      p.appendChild(info(`<b>${f.name}</b> · 🥚 Coque (évidage) · ${(f.faces||[]).length} face(s) retirée(s)`));
      // Partielle (⚠) : comme dépouillage/congé, on explique combien de faces
      // d'ouverture ont été retrouvées sur la pièce courante.
      if(f._m&&f._m.t&&f._m.m<f._m.t){
        const manquant=f._m.t-f._m.m;
        p.appendChild(info(`<span style="color:var(--warn)">⚠ <b>${f._m.m}/${f._m.t}</b> face(s) retrouvée(s) — ${manquant} perdue(s).</span>`));
        p.appendChild(note('Les faces sont retrouvées à chaque rejeu par leur position et leur normale. '+
          'Si la pièce a changé en amont, re-sélectionnez-les avec le bouton ci-dessous.'));
      }
      if((f.faces||[]).length){
        p.appendChild(note('Ouverture(s) (faces retirées), centres : '+
          f.faces.map(r=>'('+r.pos.map(v=>(+v).toFixed(1)).join(' ; ')+')').join(' · ')+'.'));
      }
      const d=document.createElement('input');
      d.type='text';d.inputMode='decimal';
      d.value=String(+f.thick||0).replace('.',',');
      d.style.width='90px';
      d.addEventListener('change',()=>{
        const v=parseFloat(String(d.value).replace(',','.').replace(/\s/g,''));
        if(!isFinite(v)){d.value=String(+f.thick||0).replace('.',',');return;}
        if(!(v>0)){d.value=String(+f.thick||0).replace('.',',');faceEl.textContent='Épaisseur hors bornes : la paroi doit être strictement positive.';return;}
        if(v===+f.thick)return;
        // Poussé dans l'historique AVANT la modification (même règle que l'angle).
        docPushUndo();
        f.thick=v;f.name=shellName(f);
        markDirty();rebuild();renderTree();renderProps();
        faceEl.textContent='Coque à '+String(v).replace('.',',')+' mm appliquée.';
      });
      const lab=document.createElement('span');
      lab.textContent=' Paroi (mm) : ';lab.style.marginLeft='8px';
      p.appendChild(lab);p.appendChild(d);
      p.appendChild(note('L\'intérieur est creusé de cette épaisseur sous chaque face conservée. '+
        'Trop épaisse pour la pièce, le moteur la refuse (rien n\'est cassé : réduisez).'));
      p.appendChild(btn('🥚 Re-sélectionner les faces',()=>{exitCoqueMode(true);try{if(filMode||filModeX)exitFilletMode(true);}catch(e){}enterCoqueMode(f);}));
      p.appendChild(btn('👁 Afficher / masquer',()=>{f.visible=!(f.visible!==false);markDirty();rebuild();renderTree();renderProps();}));
      p.appendChild(btn('🗑 Supprimer',()=>{treeSel=[f.id];sel={kind:'feature',id:f.id};treeDeleteSel();}));
      return;
    }
    const filRims=f.rims||((f.rimTop||f.rimBot)?{top:!!f.rimTop,bottom:!!f.rimBot}:null);
    p.appendChild(info(`<b>${f.name}</b> · ${f.type==='extrude'?((f.op||'add')==='cut'?'➖ ':'➕ ')+extName(f):((f.type==='fillet')?'Congé R'+f.radius+' · '+(f.corners||[]).length+' verticale(s)'+(filRims&&(filRims.top||filRims.bottom)?' + périmètre '+(filRims.top&&filRims.bottom?'haut+bas':(filRims.top?'haut':'bas')):'')+' sur '+exName(f.target):((f.type==='xfillet')?`${xIcon(xKindOf(f))} ${xLabel(xKindOf(f))} · ${(f.edges||[]).length} arête(s)`:(f.type==='repeat'?'🔁 Répétition':'Import')))}`));
    // Un congé PARTIEL (le triangle ⚠ de l'arbre) doit s'expliquer ici : combien
    // d'arêtes ont été retrouvées, lesquelles manquent, et pourquoi.
    if(f.type==='xfillet'&&f._m&&f._m.t&&f._m.m<f._m.t){
      const manquant=f._m.t-f._m.m;
      p.appendChild(info(`<span style="color:var(--warn)">⚠ <b>${f._m.m}/${f._m.t}</b> arêtes retrouvées — ${manquant} perdue(s).</span>`));
      if(f._miss&&f._miss.length){
        p.appendChild(note('Introuvables, près de : '+f._miss.map(q=>'('+q.join(', ')+')').join('  ')));
      }
      // deux causes distinctes, à ne pas confondre :
      if(f._err)p.appendChild(note(f._err));
      else p.appendChild(note('La pièce a bougé depuis la sélection : l\'arête n\'existe plus à cet endroit. Re-sélectionnez-la (clic sur l\'arête, ou la boucle entière).'));
      const div=(f.edges||[]).filter(e=>e._div!==undefined).length;
      if(div)p.appendChild(note(`${div} arête(s) à ancre divergente : l\'ancre d\'esquisse pointait ailleurs, l\'arête cliquée a été conservée.`));
    }
    if(f.type==='repeat'){
      // Menu de la RÉPÉTITION : paramètres éditables + la MÊME liste de fonctions
      // répétables qu'à la création, cochée sur les sources actuelles. Cocher ou
      // décocher régénère les instances puis rejoue (et c'est annulable, Ctrl+Z).
      // AUCUN re-rendu du panneau ici : la ligne d'en-tête se met à jour sur place,
      // sinon on détruirait la case en cours de clic (symptôme « je ne peux pas cocher »).
      const majEntete=()=>{
        const k=doc.features.filter(c=>c.repeatId===f.id).length;
        entete.innerHTML=`<b>${f.name}</b> · ${repTypeName(f.mode,f)} · ${f.copies||1} copie(s) · ${k} instance(s)`;
      };
      const entete=document.createElement('div');p.appendChild(entete);majEntete();
      p.appendChild(repSourceList(f.base,function(b){
        docPushUndo('sources de « '+f.name+' »');
        f.base=b;
        repGenChildren(f);markDirty();rebuild();renderTree();refreshParts();
      },function(){majEntete();}));
      const row=document.createElement('div');row.className='row';
      const typ=document.createElement('select');[['lin','Linéaire'],['circ','Circulaire'],['mir','Symétrie']].forEach(o=>{const op=document.createElement('option');op.value=o[0];op.textContent=o[1];typ.appendChild(op);});typ.value=f.mode||'lin';
      const applyCfg=()=>{repGenChildren(f);markDirty();rebuild();renderTree();renderProps();refreshParts();};
      typ.onchange=()=>{f.mode=typ.value;f.name=repTypeName(f.mode,f);applyCfg();};
      row.appendChild(typ);
      const cnt=document.createElement('input');cnt.type='number';cnt.min='1';cnt.value=f.copies||1;cnt.style.width='64px';cnt.title='Nombre de copies';
      cnt.onchange=()=>{f.copies=repMaxCopies(cnt.value);applyCfg();};
      row.appendChild(cnt);p.appendChild(row);
      const ax=document.createElement('select');
      ['X','Y','Z','Face'].forEach(v=>{const op=document.createElement('option');op.value=v;op.textContent=(f.mode==='mir'?(v==='X'?'YZ':v==='Y'?'XZ':v==='Z'?'XY':v):v);ax.appendChild(op);});
      ax.value=f.mode==='mir'?(f.plane==='XY'?'Z':f.plane==='XZ'?'Y':f.plane==='Face'?'Face':'X'):(f.axis||'X');
      ax.onchange=()=>{if(f.mode==='mir'){f.plane=ax.value==='X'?'YZ':ax.value==='Y'?'XZ':ax.value==='Z'?'XY':'Face';delete f.planeN;}else{f.axis=ax.value;delete f.dir;}applyCfg();};
      p.appendChild(ax);
      if(f.mode==='mir'){
        // 2ᵉ plan : la passe englobe la base ET la 1ʳᵉ symétrie (symétrie double).
        const r2=document.createElement('div');r2.className='row';
        const t2=document.createElement('input');t2.type='checkbox';t2.checked=!!f.plane2;
        t2.title='Ajouter un 2ᵉ plan : la 1ʳᵉ symétrie est comprise dans la 2ᵉ, ainsi que l\u2019opération initiale';
        const l2=document.createElement('span');l2.textContent=' 2ᵉ plan (symétrie double)';
        r2.appendChild(t2);r2.appendChild(l2);p.appendChild(r2);
        t2.onchange=()=>{
          docPushUndo('2ᵉ plan de « '+f.name+' »');
          if(t2.checked){if(!f.plane2)f.plane2=(f.plane||'YZ')==='XZ'?'YZ':'XZ';}
          else{delete f.plane2;delete f.planeN2;}
          f.name=repTypeName(f.mode,f);applyCfg();
        };
        if(f.plane2){
          const ax2=document.createElement('select');
          ['X','Y','Z','Face'].forEach(v=>{const op=document.createElement('option');op.value=v;op.textContent=(v==='X'?'YZ':v==='Y'?'XZ':v==='Z'?'XY':v);ax2.appendChild(op);});
          ax2.value=f.plane2==='XY'?'Z':f.plane2==='XZ'?'Y':f.plane2==='Face'?'Face':'X';
          ax2.title='2ᵉ plan de symétrie';
          ax2.onchange=()=>{docPushUndo('2ᵉ plan de « '+f.name+' »');f.plane2=ax2.value==='X'?'YZ':ax2.value==='Y'?'XZ':ax2.value==='Z'?'XY':'Face';delete f.planeN2;applyCfg();};
          p.appendChild(ax2);
          p.appendChild(btn('🎯 Face → 2ᵉ plan',()=>repUseFaceFor(f,2)));
        }
        if(f._samePlane)p.appendChild(note('⚠ Les deux plans sont identiques : la 2ᵉ passe est sans effet.'));
      }
      if(f.mode==='lin'){const l=document.createElement('label');l.textContent=' Distance (mm)';const inp=document.createElement('input');inp.type='text';inp.inputMode='decimal';inp.value=f.dist;inp.style.width='80px';inp.addEventListener('change',()=>{f.dist=parseFloat(String(inp.value).replace(',','.'))||0;applyCfg();});l.appendChild(inp);p.appendChild(l);}
      if(f.mode==='circ'){const l=document.createElement('label');l.textContent=' Angle total (°)';const inp=document.createElement('input');inp.type='text';inp.inputMode='decimal';inp.value=f.angle;inp.style.width='80px';inp.addEventListener('change',()=>{f.angle=parseFloat(String(inp.value).replace(',','.'))||360;applyCfg();});l.appendChild(inp);p.appendChild(l);}
      p.appendChild(btn('🎯 Utiliser la face sélectionnée',()=>repUseFaceFor(f)));
p.appendChild(toggleBtn('👁 Visible',f.visible!==false,v=>{f.visible=v;doc.features.forEach(k=>{if(k.repeatId===f.id)k.visible=v;});markDirty();rebuild();}));
      p.appendChild(btn('🗑 Supprimer',()=>{treeSel=[f.id];sel={kind:'feature',id:f.id};treeDeleteSel();}));
      return;
    }
    if(f.type==='fillet'){
      const lab=document.createElement('label');lab.textContent='Rayon (mm)';
      const inp=document.createElement('input');inp.type='text';inp.inputMode='decimal';inp.value=f.radius;inp.style.width='80px';
      const commit=()=>{
        const v=parseFloat(String(inp.value).replace(',','.'));
        if(v>0&&isFinite(v)){f.radius=v;const nc=(f.corners||[]).length+((filRims&&(filRims.top||filRims.bottom))?1:0);f.name=`Congé R${v} (${nc} arête(s))`;markDirty();rebuild();renderProps();}
      };
      inp.addEventListener('change',commit);
      inp.addEventListener('blur',commit);
      inp.addEventListener('keydown',e=>{if(e.key==='Enter'){commit();inp.blur();}});
      inp.addEventListener('click',e=>e.stopPropagation());
      p.appendChild(lab);p.appendChild(inp);
    }
    if(f.type==='xfillet'){
      if(f._m)p.appendChild(info(f._m.m>=f._m.t?`✅ ${f._m.m}/${f._m.t} arêtes retrouvées`:`⚠ ${f._m.m}/${f._m.t} arêtes retrouvées — cliquez « Modifier la sélection » (✏️)`));
      // Échec géométrique (pas d'arête introuvable, mais le rayon refusé par OCCT) : on dit
      // POURQUOI et QUOI faire, sinon la fonction est simplement « en rouge » sans explication.
      if(f._err){const e=document.createElement('div');e.style.cssText='font-size:.83rem;color:#ff6b60;background:rgba(255,69,58,.09);border:1px solid rgba(255,69,58,.3);border-radius:6px;padding:5px 7px;margin-top:6px';e.textContent='⚠ '+f._err;p.appendChild(e);}
      const lst=document.createElement('div');lst.className='col';lst.style.marginTop='6px';lst.style.maxHeight='180px';lst.style.overflow='auto';
      (f.edges||[]).forEach((s,i)=>{
        const r=document.createElement('div');r.className='tnode';
        const k=xKindOf(f),dp=xDimPrefix(k);
        r.innerHTML=`<span>${xIcon(k)}</span><span class="nm">${s.name?`<b>${s.name}</b> · `:''}${dp} <b>${s.r}</b>${s.anchor?' ⌖':''} · (${s.pos.map(v=>v.toFixed(1)).join(', ')})</span>`;
        const num=document.createElement('input');num.type='text';num.inputMode='decimal';num.value=s.r;num.style.width='56px';num.title=(f.chamfer?'Distance':'Rayon')+' de cette arête';
        num.onclick=ev=>ev.stopPropagation();
        const c2=()=>{
          const v=parseFloat(String(num.value).replace(',','.'));
          if(v>0&&isFinite(v)){s.r=v;repSyncForFeature(f);markDirty();rebuild();renderProps();}
        };
        num.addEventListener('change',c2);
        num.addEventListener('blur',c2);
        num.addEventListener('keydown',e=>{if(e.key==='Enter'){c2();num.blur();} e.stopPropagation();});
        r.appendChild(num);
        const x=document.createElement('span');x.textContent='✕';x.title='Retirer';x.style.cursor='pointer';
        x.onclick=ev=>{ev.stopPropagation();f.edges.splice(i,1);f.name=xFeatName(f);repSyncForFeature(f);markDirty();rebuild();renderProps();};
        r.appendChild(x);lst.appendChild(r);
      });
      p.appendChild(lst);
      p.appendChild(btn('✏️ Modifier la sélection (ajout / retrait)',()=>enterExactFilletMode(f)));
    }
    if(f.type==='revolve'){
      // ── Opération (comme l'extrusion) ──
      const lo=document.createElement('label');lo.textContent='Opération';
      const so=document.createElement('select');
      so.innerHTML=`<option value="add">➕ Plot (ajoute de la matière)</option><option value="cut">➖ Poche (retire de la matière)</option>`;
      so.value=f.op||'add';
      so.onchange=()=>{f.op=so.value;f.name=revolveName(f);repSyncForFeature(f);markDirty();rebuild();renderProps();};
      lo.appendChild(so);p.appendChild(lo);
      // ── Axe : lignes de l'esquisse + axes système ──
      const skR=doc.sketches.find(x=>x.id===f.sketchId);
      const la=document.createElement('label');la.textContent='Axe de révolution';
      const sa=document.createElement('select');
      const lns=(skR&&skR.entities||[]).filter(e=>e.t==='line');
      sa.innerHTML=lns.map(e=>`<option value="L:${e.id}">${e.construction?'ligne de construction ':'ligne '}${e.id}</option>`).join('')+
        `<option value="S:X">axe système X</option><option value="S:Y">axe système Y</option><option value="S:Z">axe système Z</option>`;
      const curv=(f.axis&&f.axis.k==='line')?'L:'+f.axis.id:'S:'+(f.axis?f.axis.d:'X');
      sa.value=lns.some(e=>'L:'+e.id===curv)?curv:'S:X';
      sa.onchange=()=>{const v=sa.value;
        f.axis=(v[0]==='L')?{k:'line',id:v.slice(2)}:{k:'sys',d:v.slice(2)};
        f.name=revolveName(f);repSyncForFeature(f);markDirty();rebuild();renderProps();};
      la.appendChild(sa);p.appendChild(la);
      // ── Angle ──
      const lan=document.createElement('label');lan.textContent='Angle (°)';
      const ian=document.createElement('input');ian.type='text';ian.inputMode='decimal';ian.value=revolveAngle(f);ian.style.width='80px';
      const cn=()=>{const v=parseFloat(String(ian.value).replace(',','.'));
        if(isFinite(v)&&v>0){f.angle=Math.min(360,v);f.name=revolveName(f);repSyncForFeature(f);markDirty();rebuild();renderProps();}};
      ian.addEventListener('change',cn);ian.addEventListener('blur',cn);
      ian.addEventListener('keydown',e=>{if(e.key==='Enter'){cn();ian.blur();}e.stopPropagation();});
      ian.addEventListener('click',e=>e.stopPropagation());
      lan.appendChild(ian);p.appendChild(lan);
      // ── diagnostic : l'axe et le profil sont-ils utilisables ? ──
      if(skR){
        const axR=revolveAxis2D(skR,f);
        const trR=skLoopTrace(skR);
        const msgR=[]; // note
        if(axR.err)msgR.push('⚠ '+axR.err);
        else if(!trR.solids.length&&!trR.circlesOut.length)msgR.push('⚠ profil non fermé (bouts ouverts en rouge)');
        else{const sd=revolveSideCheck(skR,trR,axR);
          msgR.push(sd.ok?('✓ axe « '+axR.label+' » — profil d\'un seul côté, rayon '+sd.rMin.toFixed(1)+' à '+sd.rMax.toFixed(1)+' mm'):('⚠ '+sd.msg));}
        const nR=document.createElement('span');nR.className='note';nR.style.marginTop='6px';nR.textContent=msgR.join(' ');
        p.appendChild(nR);
      }
      p.appendChild(btn('🔧 Changer d\'esquisse',()=>askRevokePanel(f)));
      p.appendChild(btn('🗑 Supprimer',()=>{treeSel=[f.id];sel={kind:'feature',id:f.id};treeDeleteSel();}));
    }
    if(f.type==='extrude'){
      // ── Sens : un côté (classique) ou symétrique/miroir (f.mid = course totale, prisme ±|d|/2)
      const labM=document.createElement('label');labM.textContent='Sens';
      const selM=document.createElement('select');
      selM.innerHTML=`<option value="0">↗ Un côté</option><option value="1">↕ Symétrique (miroir)</option>`;
      selM.value=f.mid?'1':'0';
      selM.onchange=()=>{f.mid=(selM.value==='1');f.name=extName(f);repSyncForFeature(f);markDirty();rebuild();renderProps();};
      labM.appendChild(selM);p.appendChild(labM);
      // ── Étendue : Distance / Jusqu'à la face / A travers tout
      const labU=document.createElement('label');labU.textContent='Étendue';
      const selU=document.createElement('select');
      selU.innerHTML=`<option value="dist">📏 Distance</option><option value="upto">🎯 Jusqu'à la face...</option><option value="through">⤴ A travers tout</option>`;
      selU.value=f.upto?'upto':(f.through?'through':'dist');
      selU.onchange=()=>{
        if(selU.value==='upto'){
          if(!f.upto){
            const me=doc.features.indexOf(f);
            const prevs=doc.features.slice(0,me).filter(x=>x.type==='extrude'&&(x.op||'add')==='add');
            if(!prevs.length){faceEl.textContent='Jusqu\'à la face : aucune extrusion additive ANTÉRIEURE — ajoutez d\'abord un volume avant cette fonction.';selU.value='dist';return;}
            f.upto={ex:prevs[prevs.length-1].id,side:1};
          }
          // Active le mode clic-face immédiatement
          extPickFace={f};
          try{renderer.domElement.style.cursor='crosshair';}catch(e){}
          faceEl.textContent='Cliquez une face du corps cible pour définir la limite (Échap annule).';
        }else if(selU.value==='through'){
          f.upto=null;f.through=true;f.distance=null;
          f.name=extName(f);repSyncForFeature(f);markDirty();rebuild();renderProps();
        }else{
          f.upto=null;f.through=false;
          if(!isFinite(f.distance))f.distance=10;
          f.name=extName(f);repSyncForFeature(f);markDirty();rebuild();renderProps();
        }
      };
      labU.appendChild(selU);p.appendChild(labU);
      if(f.upto){
        // Mode « jusqu'à la face » : clic face uniquement, l'extrusion va jusqu'à cette face
        const faceInfo=f.upto.faceId;
        const faceName=faceInfo&&faceInfo.bid?`face #${faceInfo.fi} (${bodies.find(b=>b.id===faceInfo.bid)?.name||'?'})`:'(non définie)';
        const labF=document.createElement('label');labF.textContent='Face cible';
        const faceDiv=document.createElement('div');faceDiv.style.cssText='display:flex;gap:4px;align-items:center;';
        faceDiv.innerHTML=`<span class="note">${faceName}</span>`;
        labF.appendChild(faceDiv);p.appendChild(labF);
        p.appendChild(btn('🎯 Changer la face cliquée',()=>{extPickFace={f};try{renderer.domElement.style.cursor='crosshair';}catch(e){}faceEl.textContent='Cliquez une face du corps cible pour changer la cible (Échap annule).';}));
        p.appendChild(info(`Face : ${faceName} — ${Math.abs(f.distance)} mm — ${(f.op==='cut')?'Poche (soustraction)':'Plot (addition)'}`));
      }else if(f.through){
        // Mode « A travers tout » : pas de distance, traverse tout le modèle
        p.appendChild(info(`A travers tout — ${(f.op==='cut')?'Poche (soustraction)':'Plot (addition)'}`));
      }else{
        const lab=document.createElement('label');lab.textContent=f.mid?'Course totale (mm)':'Distance (mm)';
        const inp=document.createElement('input');inp.type='text';inp.inputMode='decimal';inp.value=Math.abs(f.distance);inp.style.width='80px';
        const cd=()=>{
          if(f.upto){return}
          const v=parseFloat(String(inp.value).replace(',','.'));
          if(isFinite(v)&&v!==0){extDistSet(f,Math.abs(v)*((f.op||'add')==='cut'?-1:1));repSyncForFeature(f);markDirty();rebuild();renderProps();}
        };
        inp.addEventListener('change',cd);
        inp.addEventListener('blur',cd);
        inp.addEventListener('keydown',e=>{if(e.key==='Enter'){cd();inp.blur();} e.stopPropagation();});
        inp.addEventListener('click',e=>e.stopPropagation());
        p.appendChild(lab);p.appendChild(inp);
      }
      const lab2=document.createElement('label');lab2.textContent='Opération';
      const sel2=document.createElement('select');
      sel2.innerHTML=`<option value="add">➕ Plot (hors pièce → addition)</option><option value="cut">➖ Poche (dans pièce → soustraction)</option>`;
      sel2.value=f.op||'add';
      sel2.onchange=()=>{
        f.op=sel2.value;
        if(!f.upto && !f.through){
          // Mode Distance : le signe suit l'opération (Add = +, Cut = -)
          f.distance=Math.abs(f.distance)*(f.op==='cut'?-1:1);
        }
        f.name=extName(f);repSyncForFeature(f);markDirty();rebuild();renderProps();
      };
      lab2.appendChild(sel2);p.appendChild(lab2);
      // ── Direction : inversion du sens SANS changer l'opération (Plot reste un ajout,
      // Poche reste un retrait — seul le côté du plan d'esquisse change). Miroir pur de
      // la course : tout ce qui dépend d'extrudeSpan suit ensemble.
      {
        let cote='±';
        try{
          const sp=extrudeSpan(f);
          if(!(f.mid))cote=(sp.hi>0&&sp.lo>=-1e-9)?'+n':((sp.lo<0&&sp.hi<=1e-9)?'−n':'±');
        }catch(e){}
        const row=document.createElement('div');row.className='row';row.style.marginTop='6px';
        const bf=document.createElement('button');bf.textContent='⇄ Inverser le sens';
        bf.title='Miroir de la course par rapport au plan d\u2019esquisse. Plot reste Plot, Poche reste Poche.';
        bf.onclick=()=>{f.flip=!f.flip;f.name=extName(f);repSyncForFeature(f);markDirty();rebuild();renderProps();};
        row.appendChild(bf);
        const tag=document.createElement('span');tag.className='note';
        tag.textContent='Côté actuel : '+cote+(f.mid?' (symétrique — sans effet)':'')+(f.flip?' (inversé)':'');
        row.appendChild(tag);p.appendChild(row);
      }
      // ── Dépouille : angle signé par rapport au plan d'esquisse (profil exact au plan,
      // évasé ou rétréci selon le signe). 0 = parois droites.
      {
        const labD=document.createElement('label');labD.textContent='Dépouille (°)';
        const inpD=document.createElement('input');inpD.type='text';inpD.inputMode='decimal';
        inpD.value=String(+f.draft||0).replace('.',',');inpD.style.width='70px';
        inpD.title='Angle signé / plan d\u2019esquisse — le signe donne le sens. 0 = parois droites.';
        const cdD=()=>{
          const v=parseFloat(String(inpD.value).replace(',','.').replace(/\s/g,''));
          if(!isFinite(v)){inpD.value=String(+f.draft||0).replace('.',',');return;}
          if(v===(+f.draft||0))return;
          f.draft=Math.abs(v)<1e-9?0:+v.toFixed(3);
          f.name=extName(f);repSyncForFeature(f);markDirty();rebuild();renderProps();
        };
        inpD.addEventListener('change',cdD);
        inpD.addEventListener('blur',cdD);
        inpD.addEventListener('keydown',e=>{if(e.key==='Enter'){cdD();inpD.blur();}e.stopPropagation();});
        inpD.addEventListener('click',e=>e.stopPropagation());
        labD.appendChild(inpD);p.appendChild(labD);
      }
      p.appendChild(btn('🔧 Changer d\'esquisse',()=>askExtrude(null,f)));
    }
    p.appendChild(toggleBtn('👁 Visible',f.visible!==false,v=>{f.visible=v;markDirty();rebuild();}));
    p.appendChild(btn('🗑 Supprimer',()=>{treeSel=[f.id];sel={kind:'feature',id:f.id};treeDeleteSel();}));
  }else if(sel.kind==='body'){
    // Corps conteneur : son id EST celui de la fiche (doc.bodies) et, en mode
    // exact, celui des meshes affichés. En mode maillage le mesh porte l'id de la
    // fonction : on le retrouve par bodyId (bodyIdOfRuntime).
    let e=null;try{e=bodyEntryOf(sel.id);}catch(err){}
    const shown=bodies.filter(x=>!x.ghost&&bodyIdOfRuntime(x)===sel.id);
    const b=shown.find(x=>x.kind==='body')||shown[0]||null;
    const kids=doc.features.filter(f=>!f.repeatId&&f.body===sel.id);
    p.appendChild(info(b?`<b>${e?e.name:sel.id}</b> · corps affiché · ${kids.length} fonction(s)`:(e?`<b>${e.name}</b> · corps vide · ${kids.length} fonction(s) — esquissez puis extrudez pour le remplir.`:'Corps non reconstruit.')));
    if(doc.activeBody!==sel.id)p.appendChild(btn('● Activer ce corps',()=>{
      doc.activeBody=sel.id;try{dirty=true;}catch(err){}
      renderTree();renderProps();refreshParts();
      try{faceEl.textContent='« '+((e&&e.name)||sel.id)+' » ACTIF (●) : les nouvelles fonctions naîtront dedans.';}catch(err){}
    }));
    // ── Style du corps : UNE source (doc.bodies[].color / .op), la même que le
    //    clic-droit et le rendu. Plus de couleur ni d'opacité par fonction.
    p.appendChild(bodyStyleField(sel.id));
    if(b)p.appendChild(btn('🎯 Isoler',()=>isolate(b.id)));
    p.appendChild(btn('✅ Tout afficher',showAll));
    p.appendChild(btn('🗑 Supprimer le corps',()=>delBody(sel.id)));
  }else if(sel.kind==='plane'){
    const P=PLANES[sel.id]||{role:'',label:''};
    p.appendChild(info(`<b>Plan ${sel.id}</b> · ${P.role} — ${P.label}`));
    p.appendChild(btn('✏️ Esquisse sur ce plan',()=>newSketch(sel.id)));
    p.appendChild(toggleBtn('👁 Visible',originVis[sel.id]!==false,v=>setOriginVis(sel.id,v)));
  }else p.appendChild(note('Sélectionnez un plan / esquisse / extrusion / corps dans l\'arbre.'));
  function note(s){const d=document.createElement('span');d.className='note';d.textContent=s;return d;}
  function info(h){const d=document.createElement('div');d.style.fontSize='.83rem';d.innerHTML=h;return d;}
  function btn(s,fn){const b=document.createElement('button');b.textContent=s;b.onclick=fn;return b;}
  function toggleBtn(s,val,fn){const l=document.createElement('label');const c=document.createElement('input');c.type='checkbox';c.checked=val;c.onchange=()=>fn(c.checked);l.appendChild(c);l.appendChild(document.createTextNode(' '+s));return l;}
}
const skName=id=>(doc.sketches.find(s=>s.id===id)||{name:'?'}).name;
const exName=id=>(doc.features.find(f=>f.id===id)||{name:'?'}).name;
function bodyStyleField(id){
  // ── Couleur + transparence du CORPS : la fiche doc.bodies fait foi PARTOUT ──
  // (panneau ci-dessous, clic-droit arbre + vue 3D, rendu). Ni couleur ni opacité
  // par fonction, et surtout AUCUN bouton « Auto » : ce qu'on choisit est ce
  // qu'on a. Tout est appliqué en direct (applyBodyStyleLive) : le glisser ne
  // déclenche aucun rejeu, il n'y a donc rien à « valider » à la fin.
  const holder=document.createElement('div');holder.className='col';
  const wrap=document.createElement('div');wrap.className='skrow';
  const lab=document.createElement('label');lab.textContent='Couleur du corps';lab.style.flex='1';
  const inp=document.createElement('input');
  inp.type='color';inp.value=cssHex(bodyColorOf(id));
  inp.style.width='44px';inp.style.height='26px';inp.style.padding='0';inp.style.border='none';inp.style.background='none';
  inp.title='Couleur de CE corps — la même dans l\u2019arbre, au clic-droit et à l\u2019écran';
  const readHex=()=>{const m=/^#?([0-9a-fA-F]{6})$/.exec(String(inp.value||'').trim());return m?parseInt(m[1],16):null;};
  const sw=swatchRow(c=>{inp.value=cssHex(c);commitColor(c,true);});
  sw.dataset.sw='1'; // repéré par ctxStyleSync : l'anneau suit la source
  const commitColor=(c,fin)=>{
    if(c==null)return;
    setBodyColor(id,c);          // source unique
    applyBodyStyleLive(id);      // écran immédiat, sans rejeu
    try{renderTree();}catch(e){} // nom du corps dans l'arbre : dans sa couleur
    swatchMark(sw,cssHex(c));
    try{ctxStyleSync();}catch(e){}
    if(fin){markDirty();renderProps();}
  };
  inp.addEventListener('input',()=>commitColor(readHex(),false));
  inp.addEventListener('change',()=>commitColor(readHex(),true));
  wrap.appendChild(lab);wrap.appendChild(inp);
  holder.appendChild(wrap);
  holder.appendChild(sw);
  swatchMark(sw,cssHex(bodyColorOf(id)));
  const row=document.createElement('div');row.className='skrow';
  const lab2=document.createElement('label');lab2.textContent='Transparence';lab2.style.flex='1';
  const r=document.createElement('input');r.type='range';r.min='15';r.max='100';r.step='1';
  r.value=Math.round(bodyOpOf(id)*100);r.style.flex='2';
  r.title='100 % = opaque · on voit au travers SANS que la pièce perde son éclat';
  const v=document.createElement('span');v.textContent=r.value+'%';v.style.minWidth='38px';v.style.textAlign='right';v.style.fontSize='.78rem';
  const commitOp=(fin)=>{
    v.textContent=r.value+'%';
    setBodyOp(id,+r.value/100);  // source unique
    applyBodyStyleLive(id);      // direct : pas de rejeu, donc fluide
    try{ctxStyleSync();}catch(e){}
    if(fin){markDirty();renderProps();}
  };
  r.addEventListener('input',()=>commitOp(false));
  r.addEventListener('change',()=>commitOp(true));
  row.appendChild(lab2);row.appendChild(r);row.appendChild(v);
  holder.appendChild(row);
  return holder;
}

