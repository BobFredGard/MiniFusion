/* ---------- arbre + timeline + props ---------- */
let repMode=null;
// ── CSS panneau Paramètres (aside.right #props) : MÊME style que le panneau
//    « Paramètres — Plan » de l'espace PLAN (98-mise-en-plan.js) — sections,
//    rangées label/control, cases alignées, boutons d'action groupés.
(function(){
  try{
    if(typeof document==='undefined'||document.getElementById('cssPropsPlan'))return;
    const st=document.createElement('style');st.id='cssPropsPlan';
    st.textContent=
      /* sections */
      '#props .pnl-h{margin:10px 0 4px;font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);font-weight:600}'+
      /* rangées label + contrôle */
      '#props .pnl-row{display:flex;gap:5px;align-items:center;margin:4px 0;flex-wrap:wrap}'+
      '#props .pnl-row>pnl-lab,#props .pnl-row>label{flex:1;min-width:0;color:var(--muted);font-size:.74rem;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
      '#props .pnl-row>input[type=text],#props .pnl-row>input[type=number],#props .pnl-row>select{max-width:130px;padding:3px 6px;font-size:.72rem;border:1px solid var(--border);border-radius:5px;background:var(--bg);color:var(--text);width:auto;flex:none}'+
      '#props .pnl-row>input[type=checkbox]{max-width:none;flex:none;margin-left:auto}'+
      /* boutons d'action (Cadrer / Rejeter / Supprimer…) */
      '#props .pnl-btns{display:flex;gap:5px;flex-wrap:wrap;margin:6px 0}'+
      '#props .pnl-btns button{padding:3px 8px;font-size:.71rem;border:1px solid var(--border);background:none;color:var(--text);border-radius:6px;cursor:pointer}'+
      '#props .pnl-btns button:hover{border-color:var(--primary)}'+
      '#props .pnl-btns button.danger{border-color:#ff453a;color:#ff453a}'+
      /* note d'aide */
      '#props .pnl-note{color:var(--muted);font-size:.68rem;margin:4px 0;line-height:1.35}'+
      /* les anciens .row/.col du panneau héritent aussi du style compact */
      '#props .row{display:flex;gap:5px;align-items:center;margin:4px 0;flex-wrap:wrap}'+
      '#props .row>label{flex:1;min-width:0;color:var(--muted);font-size:.74rem}'+
      '#props button{padding:3px 8px;font-size:.71rem;border:1px solid var(--border);background:none;color:var(--text);border-radius:6px;cursor:pointer}'+
      '#props button:hover{border-color:var(--primary)}'+
      '#props .note{font-size:.68rem;color:var(--muted);margin:4px 0;display:block;line-height:1.35}';
    (document.head||document.body||document.documentElement).appendChild(st);
  }catch(e){}
})();
// ── Barres de défilement de l'arbre (#treeOverlay) et du panneau FAO
//    (#faoTreeWrap .fao-cnt) : thème cohérent (pouce = --muted, piste transparente),
//    MASQUÉES par défaut, visibles 1,2 s à chaque défilement (molette / tactile).
(function(){
  try{
    if(typeof document==='undefined'||document.getElementById('cssScrollbars'))return;
    const st=document.createElement('style');st.id='cssScrollbars';
    st.textContent=
      /* Firefox : barre entièrement masquée par défaut */
      '#treeOverlay,#faoTreeWrap .fao-cnt{scrollbar-width:none;-ms-overflow-style:none}'+
      /* WebKit : piste et pouce transparents par défaut, la piste garde sa zone de clic */
      '#treeOverlay::-webkit-scrollbar,#faoTreeWrap .fao-cnt::-webkit-scrollbar{width:8px;height:8px}'+
      '#treeOverlay::-webkit-scrollbar-track,#faoTreeWrap .fao-cnt::-webkit-scrollbar-track{background:transparent}'+
      '#treeOverlay::-webkit-scrollbar-thumb,#faoTreeWrap .fao-cnt::-webkit-scrollbar-thumb{background:transparent;border-radius:4px;transition:background .2s}'+
      /* classe .sbOn posée 1,2 s au défilement : la barre apparaît dans le thème */
      '#treeOverlay.sbOn,#faoTreeWrap .fao-cnt.sbOn{scrollbar-width:thin;scrollbar-color:var(--muted) transparent}'+
      '#treeOverlay.sbOn::-webkit-scrollbar-thumb,#faoTreeWrap .fao-cnt.sbOn::-webkit-scrollbar-thumb{background:var(--muted)}'+
      '#treeOverlay.sbOn::-webkit-scrollbar-thumb:hover,#faoTreeWrap .fao-cnt.sbOn::-webkit-scrollbar-thumb:hover{background:var(--text)}';
    (document.head||document.body||document.documentElement).appendChild(st);
    let t=null;
    const show=function(el){
      if(!el||!el.classList)return;
      el.classList.add('sbOn');
      if(t)clearTimeout(t);
      t=setTimeout(function(){ try{ if(el.classList)el.classList.remove('sbOn'); }catch(e){} t=null; },1200);
    };
    const bind=function(){
      try{
        const a=document.getElementById('treeOverlay');
        if(a&&!a._sbBound){ a._sbBound=1; a.addEventListener('scroll',function(){show(a);}); }
      }catch(e){}
      try{
        const f=document.querySelector('#faoTreeWrap .fao-cnt');
        if(f&&!f._sbBound){ f._sbBound=1; f.addEventListener('scroll',function(){show(f);}); }
      }catch(e){}
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);
    else bind();
    setTimeout(bind,600);setTimeout(bind,2500); // la FAO est créée plus tard par 88-fao.js
  }catch(e){}
})();
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
  if(f.type==='combine')return f.mode==='cut'?'⊖':(f.mode==='intersect'?'⊗':'⊕');
  if(f.type==='revolve')return (f.op||'add')==='cut'?'◔':'◍';
  if(f.type==='hole')return '⊚';
  if(f.type==='xmove')return '📐';
  if(f.type==='xdelface')return ((f._m&&f._m.m<f._m.t)||f._err)?'⚠':'⌫';
  if(f.type==='xdraft')return ((f._m&&f._m.m<f._m.t)||f._err)?'⚠':'📐';
  if(f.type==='xshell')return ((f._m&&f._m.m<f._m.t)||f._err)?'⚠':'🥚';
  return '◧';
}
function renderTree(){
  const t=$('tree');t.innerHTML='';
  // Assemblage (47) : arbre des occurrences en vue d'assemblage, fil d'Ariane en mode pièce
  if(asmMode==='asm'&&asm){asmTreeRender(t);try{renderTimeline();}catch(e){}return;}
  asmBreadcrumb(t);
  try{cfgTreeRow(t);}catch(e){} // V0.8.4 : configuration active (52-configurations)
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
    // 2026-10-16-017 : le REPÈRE (point + 3 axes + 3 plans cliquables) en tête du groupe Origine
    {
      const on=!!(axHelper&&axHelper.visible);
      const d=document.createElement('div');
      d.className='tnode'+(on?'':' hidden');
      d.title='Repère de l’origine : point central, axes X/Y/Z et 3 plans cliquables (un clic sur un plan le sélectionne) · 👁 = montrer/masquer';
      d.innerHTML=`<span class="pdot" style="background:#fff;box-shadow:0 0 0 2px #1c1c1e inset"></span><span class="nm">Repère <span style="color:var(--muted)">· X Y Z + plans</span></span><span class="eye" title="Afficher / masquer le repère">${on?'👁':'🙈'}</span>`;
      d.onclick=ev=>{
        if(ev.target&&ev.target.classList&&ev.target.classList.contains('eye')){
          const v=!(axHelper&&axHelper.visible);
          if(axHelper)axHelper.visible=v;
          try{const o=$('optAxes');if(o){o.checked=v;}}catch(e){}
          try{markDirty();}catch(e){}
          renderTree();return;
        }
        if(cgTreePick({k:'o',id:'O'}))return; // construction : l'origine comme point / repère
        try{faceEl.textContent='Repère de l’origine : cliquez un de ses 3 petits plans dans la vue pour le sélectionner (esquisse dessus, référence).';}catch(e){}
      };
      t.appendChild(d);
    }
    ['XY','XZ','YZ'].forEach(p=>{
      const d=document.createElement('div');
      d.className='tnode'+(sel.kind==='plane'&&sel.id===p?' sel':'')+(originVis[p]?'':' hidden');
      d.title='Clic = sélectionner · double-clic = esquisse dessus · 👁 = montrer/masquer · '+PLANES[p].label;
      d.innerHTML=`<span class="pdot" style="background:${PLANES[p].css}"></span><span class="nm">Plan ${p} <span style="color:var(--muted)">· ${PLANES[p].role}</span></span><span class="eye" title="Afficher / masquer le plan">👁</span>`;
      d.onclick=ev=>{if(ev.target&&ev.target.classList&&ev.target.classList.contains('eye')){setOriginVis(p,!originVis[p]);return;}if(cgTreePick({k:'o',id:p}))return;sel={kind:'plane',id:p};renderTree();renderProps();refreshParts();};
      d.ondblclick=()=>{sel={kind:'plane',id:p};newSketch(p);};
      d.oncontextmenu=e=>{e.preventDefault();showCtx(e.clientX,e.clientY,{kind:'plane',id:p});};
      t.appendChild(d);
    });
    // V0.5.0 : axes de l'origine — références de la géométrie de construction (axe, angle, repère)
    [['X','#ff453a','droite'],['Y','#30d158','arrière'],['Z','#0a84ff','haut']].forEach(([a,c,r])=>{
      const d=document.createElement('div');
      d.className='tnode'+(sel.kind==='originAxis'&&sel.id===a?' sel':'');
      d.title='Axe '+a+' de l’origine — référence d’un plan à un angle, d’un axe, d’un repère';
      d.innerHTML=`<span class="pdot" style="background:${c};border-radius:1px;height:3px;margin-top:5px"></span><span class="nm">Axe ${a} <span style="color:var(--muted)">· ${r}</span></span>`;
      d.onclick=()=>{if(cgTreePick({k:'o',id:a}))return;sel={kind:'originAxis',id:a};renderTree();renderProps();};
      t.appendChild(d);
    });
  }
  cgTreeRows(t); // 📐 Construction (79)
  // Les esquisses des INSTANCES de répétition (« … (rép 3) ») sont dérivées et régénérées :
  // elles ne s'éditent pas, l'arbre ne les montre pas (on modifie l'esquisse source).
  const skVis=doc.sketches.filter(s=>!skIsRepCopy(s));
  if(gfold('sk','✏️ Esquisses ('+skVis.length+')')){
    skVis.forEach(s=>node('✏️',s.name+' · '+sketchFaceLabel(s)+' · '+s.entities.length+' traits','sketch',s.id,s.visible,()=>openSketch(s.id)));
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
      dm.textContent='⏱ — marqueur ici — '+(doc.features.length-tlIdx())+' fonction(s) masquée(s) sous le marqueur';
      t.appendChild(dm);
    }
    if(f.repeatId)return; // instance : affichée sous sa répétition
    if(tlLocked(f))return; // ⏱ FILTRE au blocage : hors rejeu = hors arbre (bandeau + ligne marqueur restent)
    if(f.type==='repeat'){
      const kids=doc.features.filter(c=>c.repeatId===f.id);
      const vkids=kids.filter(k=>!tlLocked(k)); // ⏱ filtre au blocage : instances hors rejeu masquées
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
      d.innerHTML=`<span class="tri" title="Déplier / replier les fonctions copiées">${open?'▼':'▶'}</span><span>🔁</span><span class="nm">${f.name} · ${repTypeName(f.mode,f)} · ${vkids.length} instance(s)`+
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
      vkids.forEach(k=>{
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
  g('🧱 Corps / Fonctions ('+doc.features.filter(f=>!tlLocked(f)).length+') · ➕ additif / ➖ découpe · ● = actif');
  groups.forEach(be=>{
    // En-tête du corps : clic = sélectionner ET ACTIVER (les fonctions suivantes
    // naîtront dedans), œil = montrer/masquer ses fonctions, clic droit = renommer,
    // isoler, supprimer le corps et ses fonctions.
    const kids=doc.features.filter(f=>!f.repeatId&&bodyOf(f)===be.id);
    const kidsVis=kids.filter(f=>!tlLocked(f)); // ⏱ filtre au blocage : compteurs = fonctions affichées
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
      '<span class="nm"'+(bcol?(' style="color:'+bcol+'"'):'')+'>'+be.name+(estActif?' ●':'')+' · '+kidsVis.length+' fonction(s)</span>'+
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
      // Intersection en cours d'esquisse : le corps cliqué dans l'arbre est coupé par le plan
      if(typeof skEdit!=='undefined'&&skEdit&&skTool==='isect'&&typeof skIsectFromBody==='function'&&skIsectFromBody(be.id))return;
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
  try{renderTimeline();}catch(e){} // bandeau de timeline (41) : suit chaque rendu de l'arbre (sélection, rejeu)
}
// Fonction répétable : extrusion ou congé/chanfrein exact. NI une répétition, NI une
// instance de répétition (une instance est déjà générée : la répéter empilerait des
// clones sans sens, et la liste à cocher la proposait).
function skIsRepCopy(sk){
  // Esquisse utilisée UNIQUEMENT par des instances de répétition (copie générée) → true
  const F=doc.features||[];
  return !!sk&&F.some(f=>f.repeatId&&f.sketchId===sk.id)&&!F.some(f=>!f.repeatId&&f.sketchId===sk.id);
}
function repCanFeature(id){
  const f=doc.features.find(x=>x.id===id);
  if(!f)return false;
  if(f.repeatId)return false;
  if(f.type==='repeat')return false;
  return f.type==='extrude'||f.type==='xfillet'||f.type==='hole'; // 2026-10-16-005 : perçages répétables
}
// Ce qu'une fonction apporte comme source de répétition — sert d'infobulle dans la
// liste à cocher, pour qu'on sache ce qu'on coche.
function repCanFeatureHint(f){
  if(!f)return'';
  if(f.type==='extrude')return((f.op||'add')==='cut'?'Découpe':'Plot')+' · '+(+f.distance||0).toFixed(2)+' mm';
  if(f.type==='hole')return 'Perçage · Ø'+(+f.d||0)+(f.thread&&f.thread.size?' · taraudé '+f.thread.size:'')+(f.kind&&f.kind!=='simple'?' · '+f.kind:'');
  if(f.type==='xfillet')return xLabel(xKindOf(f))+' · '+(f.edges||[]).length+' arête(s)';
  if(f.type==='xmove')return 'Déplacement de face · '+(+f.dist||0)+' mm';
  if(f.type==='xdelface')return 'Suppression · '+(f.faces||[]).length+' face(s)';
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
function repTypeName(m,f){if(m==='mir'&&f&&f.plane2)return 'Symétrie double';if(m==='lin'&&f&&f.lin2)return 'Linéaire 2 directions';return m==='mir'?'Symétrie':m==='circ'?'Circulaire':'Linéaire';}
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
// pas angulaire d'une répétition circulaire (2026-10-23) : sur un tour complet, l'angle se
// partage entre original + copies (6 trous à 60°) — la dernière copie ne retombe plus sur
// l'original ; sur un secteur, original et dernière copie sont aux deux bornes.
function repCircStep(c){const a=+c.angle||360,n=+c.copies||1;return Math.abs(a)>=360-1e-9?a/(n+1):a/n;}
function repTransformPoint(p,i,cfg){const c=cfg||repMode,t=c.mode||c.type;
  const v=[+(p&&p[0]||0),+(p&&p[1]||0),+(p&&p[2]||0)];
  if(t==='lin')return repAdd(v,c._off?c._off:repScale(repAxisVec(c),(+c.dist||0)*i)); // _off : décalage d'une case de grille
  if(t==='circ')return repRot(v,repAxisVec(c),repCircStep(c)*i);
  const n=repPlaneN(c);return repAdd(v,repScale(n,-2*repDot(v,n)));
}
// Répétition linéaire à DEUX directions (grille) : 2ᵉ axe (rp.axis2 X/Y/Z/Face + rp.dir2), quantité
// rp.copies2 (stockée − 1, comme copies), pas rp.dist2. Une instance par case (i, j) hors (0, 0).
function repAxis2Vec(c){return repAxisVec({axis:c&&c.axis2,dir:c&&c.dir2});}
function repLinCells(rp){
  // Cases de la grille, original exclu : [{i, j, off}] — 200 instances au plus (REPEAT_MAX)
  const n1=repMaxCopies(rp.copies),out=[];
  const d1=repScale(repAxisVec(rp),+rp.dist||0);
  if(!rp.lin2){for(let i=1;i<=n1;i++)out.push({i,j:0,off:repScale(d1,i)});return out;}
  const n2=repMaxCopies(rp.copies2),d2=repScale(repAxis2Vec(rp),+rp.dist2||0);
  for(let j=0;j<=n2;j++)for(let i=0;i<=n1;i++){if(!i&&!j)continue;if(out.length>=REPEAT_MAX)return out;out.push({i,j,off:repAdd(repScale(d1,i),repScale(d2,j))});}
  return out;
}
function repTransformVec(v,i,cfg){const c=cfg||repMode,t=c.mode||c.type;
  const a=[+(v&&v[0]||0),+(v&&v[1]||0),+(v&&v[2]||0)];
  if(t==='lin')return a;
  if(t==='circ')return repRot(a,repAxisVec(c),repCircStep(c)*i);
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
  // 2026-10-26 : esquisse posée sur un PLAN DE CONSTRUCTION (plane 'CG') — la copie ne doit
  // pas garder le lien : cgResolveAll recopiait à chaque rejeu la base du plan porteur dans
  // l'esquisse clonée, effaçant la transformée (la nervure « symétrique » retombait SUR
  // l'originale, ses congés copiés cherchaient des arêtes absentes). La copie devient une
  // esquisse libre au repère déjà transformé ; si le plan bouge, la source suit (cgSyncSketch),
  // sa signature change et repSyncStale régénère la copie.
  if(ns.plane==='CG'){ns.plane='FACE';delete ns.cg;}
  if(ns.host&&ns.host.feat&&featMap[ns.host.feat])ns.host.feat=featMap[ns.host.feat];else delete ns.host;
  if(reuse){
    const keep=reuse.id;
    for(const k of Object.keys(reuse))if(!(k in ns))delete reuse[k];
    Object.assign(reuse,ns);reuse.id=keep;
    if(!reuse.host)delete reuse.host;
    skMap[sk.id]=keep; // les congés de la passe y retrouvent l'esquisse de leur ancre
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
  const target=reuse?reuse.id:uid(f.type==='xfillet'?'xf':(f.type==='hole'?'ho':'ex'));
  if(f.type==='extrude'||f.type==='hole'){ // perçage : son esquisse de centres est clonée / transformée comme un profil
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
      // 2026-10-26 : l'ANCRE suit aussi — elle est en repère d'esquisse (point/entité, z,
      // côté), donc valable telle quelle sur l'esquisse CLONÉE (mêmes ids, repère miroir).
      // La remettre à null laissait xAnchorFor ré-ancrer la copie sur la meilleure esquisse
      // venue : souvent l'esquisse SOURCE ou la plaque (far:1) ; le congé copié partait sur
      // l'arête d'origine ou une arête de 0,6 mm (« le dernier congé fait des misères »).
      // Ancre sur une esquisse hors répétition : sans équivalent dans la copie → null.
      const a=s.anchor&&s.anchor.sk&&skMap[s.anchor.sk]?Object.assign({},s.anchor,{sk:skMap[s.anchor.sk]}):null;
      const o=Object.assign({},s,{anchor:a});
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
    // linéaire : une instance par case de grille (une seule direction = une ligne), décalage explicite
    const cells=rp.mode==='lin'?repLinCells(rp):null;
    const N=cells?cells.length:n;
    for(let i=1;i<=N;i++){
      const skMap={},featMap={};
      const cfg=cells?Object.assign({},rp,{_off:cells[i-1].off}):rp;
      base.forEach(f=>{
        const c=take(i,f.type,f.id);
        const nf=repCloneFeature(f,i,skMap,featMap,cfg,c||null);
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
const repGenSigs=new Map(); // id de répétition -> signature des sources au dernier régénéré
function repSourceSig(rp){
  let s=JSON.stringify([rp.mode,rp.copies,rp.dist,rp.angle,rp.axis,rp.plane,rp.planeN,rp.plane2,rp.planeN2,rp.base,rp.dir,rp.lin2,rp.axis2,rp.dir2,rp.copies2,rp.dist2]);
  (rp.base||[]).forEach(id=>{const f=doc.features.find(x=>x.id===id);s+='#'+(f?featSig(f):'?');});
  return s;
}
function repSyncStale(){
  // Rejeu : régénère les répétitions dont une source (fonction OU esquisse) a changé
  // depuis la dernière génération. Renvoie true si au moins une instance a été refaite.
  let any=false;
  for(const rp of [...(doc.features||[])]){
    if(rp.type!=='repeat'||rp.visible===false)continue;
    let sg='';try{sg=repSourceSig(rp);}catch(e){continue;}
    if(repGenSigs.get(rp.id)===sg)continue;
    const first=!repGenSigs.has(rp.id);
    repGenSigs.set(rp.id,sg);
    if(first)continue; // 1er passage : on mémorise seulement (instances déjà générées à l'ouverture / à la création)
    try{repGenChildren(rp);any=true;}catch(e){}
  }
  return any;
}
function repGenAll(){
  // Balayage de réparation : CHAQUE répétition régénérée depuis ses sources. Appelé par
  // les boutons Recalcul et Rafraîchissement dur — le filet qui réaligne les instances
  // même si un chemin d'édition n'a pas synchronisé pendant la session.
  for(const rp of [...doc.features]){if(rp.type==='repeat')repGenChildren(rp);}
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
  // 2026-10-23 : répétition circulaire sur un tour complet — l'ancien pas (360°/copies) posait la
  // dernière copie SUR l'original (perçage doublé, paroi scindée). Le nouveau pas partage le tour
  // entre original + copies : on retire cette copie superflue, la pièce garde ses positions.
  doc.features.forEach(f=>{
    if(f.type!=='repeat'||f.q)return;f.q=1;
    if(f.mode==='circ'&&Math.abs(+f.angle||360)>=360-1e-9&&f.copies>=2){f.copies--;cap++;try{repGenChildren(f);}catch(e){}}
  });
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
function featBlockOf(f,F){
  // Bloc déplaçable d'un cran : fonction simple ([i,i]) ou répétition + ses
  // instances ([i,j], contiguës par construction de repGenChildren). Une instance
  // seule n'est jamais déplaçable (dérivée) : null. F = liste de travail (doc.features par défaut).
  F=F||doc.features;
  const i=F.indexOf(f);
  if(!f||i<0||f.repeatId)return null;
  if(f.type!=='repeat')return [i,i];
  const kids=F.filter(k=>k.repeatId===f.id);
  const j=i+kids.length;
  for(let k=i+1;k<=j;k++){const o=F[k];if(!o||o.repeatId!==f.id)return null;}
  return [i,j];
}
function featMoveRaw(F,id,dir){
  // Cœur de featMove sur une liste de travail F (modifiée en place) : décale le bloc d'un
  // cran DANS SON CORPS, sans annulation ni rejeu. Partagé avec le glisser-déposer du
  // bandeau de timeline (41), qui enchaîne les crans sur une copie. Retourne true si fait.
  const f=F.find(x=>x.id===id);
  if(!f||(dir!==1&&dir!==-1))return false;
  const bl=featBlockOf(f,F);
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
    const seg=F.splice(bl[0],L);
    F.splice(at-L+after,0,...seg);
  }
  return true;
}
function featMoveApply(A,label){
  // Pose un nouvel ordre de doc.features (même tableau, même contenu) : une étape d'annulation + rejeu
  docPushUndo(label);
  doc.features.splice(0,doc.features.length,...A);
  markDirty();rebuild();renderTree();renderProps();
}
function featMove(id,dir){
  // Décale un bloc d'un cran DANS SON CORPS (ordre de rejeu du corps), en sautant
  // les fonctions des autres corps et les blocs voisins entiers. L'ordre global
  // n'a de sens que par corps depuis les corps conteneurs : A2 peut passer devant
  // A1 même si B1 est entre les deux. Annulable (une étape). Retourne true si fait.
  const A=doc.features.slice();
  if(!featMoveRaw(A,id,dir))return false;
  const f=doc.features.find(x=>x.id===id);
  featMoveApply(A,'déplacement de « '+f.name+' »');
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
function repPickedDir(faceOnly){
  // Direction choisie dans la vue : ARÊTE sélectionnée (droite : sa direction ; cercle / arc : son
  // axe), sinon normale de la FACE sélectionnée. faceOnly : symétrie (un plan = une normale de face).
  // → {a:[x,y,z], what} | null
  try{
    if(!faceOnly&&typeof selEdges!=='undefined'&&selEdges&&selEdges.length){
      const G=selEdges[selEdges.length-1].G;
      const v=G&&(G.kind==='line'?G.u:(G.kind==='circle'?G.axis:null));
      if(v)return {a:[v.x,v.y,v.z],what:G.kind==='line'?'arête':(G.closed?'axe du cercle':'axe de l’arc')};
    }
    if(selFaces&&selFaces.length){const s=selFaces[0],n=faceNormalWorld(s.mesh,s.faceIndex);if(n)return {a:[n.x,n.y,n.z],what:'face'};}
  }catch(e){}
  try{faceEl.textContent=faceOnly?'Sélectionnez d’abord une face (clic dans la vue).':'Sélectionnez d’abord une face ou une arête (clic dans la vue).';}catch(e){}
  return null;
}
function repFlipDir(rp,which){
  // Inverse une direction (le sens d'une arête choisie est arbitraire) : la direction devient
  // explicite (« Face / arête ») et opposée — X/Y/Z compris ; circulaire : sens de rotation inversé
  docPushUndo('inverser la direction de « '+rp.name+' »');
  if(which===2){rp.dir2=repScale(repAxis2Vec(rp),-1);rp.axis2='Face';}
  else{rp.dir=repScale(repAxisVec(rp),-1);rp.axis='Face';}
  repGenChildren(rp);markDirty();rebuild();renderTree();renderProps();refreshParts();
}
function repUseFaceFor(rp,which){
  const P=repPickedDir(rp.mode==='mir');if(!P)return;
  const a=P.a;
  docPushUndo('direction de « '+rp.name+' »');
  try{faceEl.textContent=(which===2?'2ᵉ direction':(rp.mode==='mir'?'Plan':'Direction'))+' : '+P.what+' sélectionnée.';}catch(e){}
  if(rp.mode==='mir'){
    if(which===2){rp.plane2='Face';rp.planeN2=a;}
    else{rp.plane='Face';rp.planeN=a;}
  }else if(which===2){rp.axis2='Face';rp.dir2=a;}else{rp.axis='Face';rp.dir=a;}
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
    copies:repMaxCopies(repMode.copies),q:1,dist:repMode.dist,angle:repMode.angle,
    axis:repMode.axis,plane:repMode.plane,dir:repMode.dir,planeN:repMode.planeN,
    plane2:repMode.plane2||undefined,planeN2:repMode.planeN2||undefined,
    lin2:repMode.type==='lin'&&repMode.lin2?true:undefined,axis2:repMode.type==='lin'&&repMode.lin2?repMode.axis2:undefined,
    dir2:repMode.type==='lin'&&repMode.lin2?repMode.dir2:undefined,copies2:repMode.type==='lin'&&repMode.lin2?repMaxCopies(repMode.copies2):undefined,
    dist2:repMode.type==='lin'&&repMode.lin2?(+repMode.dist2||0):undefined,
    base:base.map(f=>f.id),children:[],visible:true};
  addFeature(rp);
  const nb=repGenChildren(rp);
  exitRepMode();
  sel={kind:'feature',id:rp.id};
  markDirty();rebuild();renderTree();renderProps();refreshParts();
  faceEl.textContent='Répétition : '+nb+' fonction(s) copiée(s) — « '+rp.name+' » — les sources se cochent dans le panneau, à la création comme à l\'édition.';
}
function repUseSelectedFace(){
  if(!repMode)return;
  const P=repPickedDir(repMode.type==='mir');if(!P)return;
  const a=P.a;
  if(repMode.type==='mir'){repMode.plane='Face';repMode.planeN=a;}else{repMode.axis='Face';repMode.dir=a;}
  renderRepPanel();
}
function repUseSelectedFace2(){
  if(!repMode||(repMode.type!=='mir'&&repMode.type!=='lin'))return;
  const P=repPickedDir(repMode.type==='mir');if(!P)return;
  if(repMode.type==='lin'){repMode.axis2='Face';repMode.dir2=P.a;}
  else{repMode.plane2='Face';repMode.planeN2=P.a;}
  renderRepPanel();
}
function renderRepPanel(){
  const p=$('props');p.innerHTML='';if(!repMode)return;
  const h=document.createElement('div');h.innerHTML='<b>🔁 Répétition</b><br><span class="note">Choisissez les fonctions à répéter ci-dessous (cases à cocher). Dans l\'arbre, un <b>Ctrl+clic</b> sert désormais à la multi-suppression.</span>';p.appendChild(h);
  const row=document.createElement('div');row.className='row';
  const typ=document.createElement('select');[['lin','Linéaire'],['circ','Circulaire'],['mir','Symétrie']].forEach(o=>{const op=document.createElement('option');op.value=o[0];op.textContent=o[1];typ.appendChild(op);});typ.value=repMode.type;typ.onchange=()=>{repMode.type=typ.value;renderRepPanel();};row.appendChild(typ);
  // 2026-10-23 : QUANTITÉ, original compris (6 = l'original + 5 copies) ; stocké : copies = quantité − 1
  const cnt=document.createElement('input');cnt.type='number';cnt.min='2';cnt.value=(+repMode.copies||1)+1;cnt.title='Quantité, original compris (6 = l’original + 5 copies)';cnt.onchange=()=>{repMode.copies=repMaxCopies((+cnt.value||2)-1);cnt.value=repMode.copies+1;};
  if(repMode.type==='mir'){cnt.disabled=true;cnt.value=2;}
  row.appendChild(cnt);p.appendChild(row);
  const ax=document.createElement('select');['X','Y','Z','Face'].forEach(v=>{const op=document.createElement('option');op.value=v;op.textContent=(repMode.type==='mir'?(v==='X'?'YZ':v==='Y'?'XZ':v==='Z'?'XY':v):(v==='Face'?'Face / arête':v));ax.appendChild(op);});
  ax.value=repMode.type==='mir'?(repMode.plane==='XY'?'Z':repMode.plane==='XZ'?'Y':repMode.plane==='Face'?'Face':'X'):(repMode.axis||'X');
  ax.onchange=()=>{if(repMode.type==='mir'){repMode.plane=ax.value==='X'?'YZ':ax.value==='Y'?'XZ':ax.value==='Z'?'XY':'Face';delete repMode.planeN;}else{repMode.axis=ax.value;delete repMode.dir;}renderRepPanel();};p.appendChild(ax);
  const bf=document.createElement('button');bf.textContent=repMode.type==='mir'?'🎯 Face sélectionnée → plan':'🎯 Face / arête sélectionnée → direction';
  bf.title=repMode.type==='mir'?'Plan de symétrie : normale de la face sélectionnée':'Direction de l’arête sélectionnée (axe d’un cercle ou d’un arc), sinon normale de la face sélectionnée';
  bf.onclick=repUseSelectedFace;p.appendChild(bf);
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
  if(repMode.type==='lin'){const l=document.createElement('label');l.textContent=' Distance (mm)';const inp=document.createElement('input');inp.type='text';inp.inputMode='decimal';inp.value=repMode.dist;inp.onchange=()=>{repMode.dist=parseFloat(String(inp.value).replace(',','.'))||0;};l.appendChild(inp);p.appendChild(l);
    // 2ᵉ DIRECTION (grille) : axe, quantité (original compris), pas
    const r2=document.createElement('div');r2.className='row';
    const t2=document.createElement('input');t2.type='checkbox';t2.checked=!!repMode.lin2;t2.className='rep2Chk';
    t2.title='Ajouter une 2ᵉ direction : la ligne de la 1ʳᵉ direction est répétée le long de la 2ᵉ (grille)';
    const l2=document.createElement('span');l2.textContent=' 2ᵉ direction (grille)';r2.appendChild(t2);r2.appendChild(l2);p.appendChild(r2);
    t2.onchange=()=>{repMode.lin2=t2.checked;
      if(t2.checked){if(!repMode.axis2)repMode.axis2=(repMode.axis||'X')==='X'?'Y':'X';if(!repMode.copies2)repMode.copies2=1;if(repMode.dist2==null)repMode.dist2=repMode.dist||10;}
      renderRepPanel();};
    if(repMode.lin2){
      const ax2=document.createElement('select');['X','Y','Z','Face'].forEach(v=>{const op=document.createElement('option');op.value=v;op.textContent=v==='Face'?'Face / arête':v;ax2.appendChild(op);});
      ax2.value=repMode.axis2||'Y';ax2.title='Axe de la 2ᵉ direction';ax2.onchange=()=>{repMode.axis2=ax2.value;delete repMode.dir2;renderRepPanel();};p.appendChild(ax2);
      const c2=document.createElement('input');c2.type='number';c2.min='2';c2.value=(+repMode.copies2||1)+1;c2.title='Quantité dans la 2ᵉ direction, original compris';
      c2.onchange=()=>{repMode.copies2=repMaxCopies((+c2.value||2)-1);c2.value=repMode.copies2+1;};p.appendChild(c2);
      const ld=document.createElement('label');ld.textContent=' Distance 2 (mm)';const i2=document.createElement('input');i2.type='text';i2.inputMode='decimal';i2.value=repMode.dist2;
      i2.onchange=()=>{repMode.dist2=parseFloat(String(i2.value).replace(',','.'))||0;};ld.appendChild(i2);p.appendChild(ld);
      const bf2=document.createElement('button');bf2.textContent='🎯 Face / arête → 2ᵉ direction';bf2.title='Prend la direction de l’arête sélectionnée (axe d’un cercle) ou la normale de la face sélectionnée';bf2.onclick=()=>repUseSelectedFace2();p.appendChild(bf2);
    }
  }
  if(repMode.type==='circ'){const l=document.createElement('label');l.textContent=' Angle total (°)';const inp=document.createElement('input');inp.type='text';inp.inputMode='decimal';inp.value=repMode.angle;inp.onchange=()=>{repMode.angle=parseFloat(String(inp.value).replace(',','.'))||360;};l.appendChild(inp);p.appendChild(l);}
  // ── FONCTIONS RÉPÉTABLES : la MÊME liste à cocher qu'à l'édition (voir
  // repSourceList). Aucun re-rendu ici : la case garde son état, seul l'arbre se
  // rafraîchit (le compteur se met à jour sur place, dans la liste).
  p.appendChild(repSourceList(repMode.feats,function(b){repMode.feats=b;},function(){renderTree();}));
  const r=document.createElement('div');r.className='row';r.style.marginTop='8px';const ok=document.createElement('button');ok.className='primary';ok.textContent='✔ Appliquer';ok.onclick=applyRepPattern;r.appendChild(ok);const q=document.createElement('button');q.textContent='Quitter';q.onclick=exitRepMode;r.appendChild(q);p.appendChild(r);
}
function renderProps(){
  if(typeof extNew!=='undefined'&&extNew)extNew=null; // une sélection annule le formulaire en cours
  if(typeof revNew!=='undefined'&&revNew)revNew=null; // idem pour le formulaire de révolution
  const p=$('props');p.innerHTML='';p.className='col';
  // FAO : les fiches posage/opération vivent dans src/88-fao.js (arbre FAO dédié).
  if(sel&&(sel.kind==='faoSetup'||sel.kind==='faoOp')){
    try{ faoRenderProps(p,sel); }catch(e){}
    return;
  }
  if(asmInspect){try{if(asmInspectProps(p))return;}catch(e){}} // résultats d'inspection (48)
  if(asmMode==='asm'&&asm){try{asmRenderProps(p);}catch(e){}return;} // vue d'assemblage (47)
  // Géométrie de construction (79) : création / modification en cours, ou élément sélectionné
  if(cgMode||(sel&&sel.kind==='cg')){try{cgRenderProps(p);}catch(e){}return;}
  /* ── helpers layout PLAN (mêmes classes que #mepSide de 98) ── */
  const pH=t=>{const h=document.createElement('div');h.className='pnl-h';h.textContent=t;p.appendChild(h);return h;};
  const pRow=(lab,el)=>{const r=document.createElement('div');r.className='pnl-row';
    const L=document.createElement('label');L.textContent=lab;r.appendChild(L);
    if(el)r.appendChild(el);p.appendChild(r);return r;};
  const pChk=(lab,val,fn)=>{const c=document.createElement('input');c.type='checkbox';c.checked=!!val;
    c.onchange=()=>fn(c.checked);pRow(lab,c);return c;};
  const pBtns=list=>{const d=document.createElement('div');d.className='pnl-btns';
    list.forEach(([t,fn,cls])=>{const b=document.createElement('button');b.textContent=t;
      if(cls)b.className=cls;b.onclick=fn;d.appendChild(b);});
    p.appendChild(d);return d;};
  const pNote=t=>{const n=document.createElement('div');n.className='pnl-note';n.textContent=t;p.appendChild(n);return n;};
  const pInfo=h=>{const d=document.createElement('div');d.className='pnl-note';d.innerHTML=h;p.appendChild(d);return d;};
  const pIn=(val,fn)=>{const i=document.createElement('input');i.type='text';i.inputMode='decimal';
    i.value=val;i.onchange=()=>fn(i.value);return i;};
  const pSel=(opts,val,fn)=>{const s=document.createElement('select');
    opts.forEach(o=>{const op=document.createElement('option');op.value=o[0];op.textContent=o[1];if(o[2])op.title=o[2];s.appendChild(op);});
    s.value=val;s.onchange=()=>fn(s.value);return s;};
  const visDel=f=>pBtns([
    ['👁 Visible',()=>{f.visible=!(f.visible!==false);markDirty();rebuild();renderTree();renderProps();}],
    ['🗑 Supprimer',()=>{treeSel=[f.id];sel={kind:'feature',id:f.id};treeDeleteSel();}, 'danger']]);
  /* ── nom du document (toujours en haut) ── */
  const nmIn=document.createElement('input');nmIn.type='text';nmIn.id='docNameIn';nmIn.value=doc.name;
  nmIn.onchange=e=>{doc.name=e.target.value;$('docName').textContent=doc.name;markDirty();};
  pRow('Nom du document',nmIn);
  $('docName').textContent=doc.name;
  /* ═══════ esquisse ═══════ */
  if(sel.kind==='sketch'){
    const sk=doc.sketches.find(s=>s.id===sel.id);if(!sk){pNote('Esquisse supprimée.');return;}
    pH('Esquisse');
    pInfo(`<b>${sk.name}</b> · plan ${sketchFaceLabel(sk)} · ${sk.entities.length} entités`);
    pBtns([
      ['🔧 Éditer',()=>openSketch(sk.id)],
      ['🧱 Extruder',()=>askExtrude(sk.id)],
      ['👁 Visible',()=>{sk.visible=sk.visible===false;rebuild();renderTree();renderProps();}]]);
    return;
  }
  /* ═══════ fonction ═══════ */
  if(sel.kind==='feature'){
    const f=doc.features.find(x=>x.id===sel.id);if(!f){pNote('Fonction supprimée.');return;}
    if(tlLocked(f)){
      pH('Fonction verrouillée');
      pInfo(`⏱ <b>${f.name}</b> est exclue du rejeu : le marqueur temps s'arrête avant elle.`);
      pBtns([
        ['🔓 Lever le marqueur',()=>{tlSetPtr(null);markDirty();rebuild();renderTree();renderProps();}],
        ['👁 Afficher / masquer',()=>{f.visible=!(f.visible!==false);markDirty();rebuild();renderTree();renderProps();}],
        ['🗑 Supprimer',()=>{treeSel=[f.id];sel={kind:'feature',id:f.id};treeDeleteSel();},'danger']]);
      return;
    }
    /* — déplacement de face — */
    if(f.type==='xmove'){
      pH('Déplacement de face');
      pInfo(`<b>${f.name}</b>`);
      if(f.ref)pNote('Face visée : centre ('+f.ref.pos.map(v=>(+v).toFixed(1)).join(' ; ')+') mm, normale ('+f.ref.n.map(v=>(+v).toFixed(2)).join(' ; ')+').');
      const d=document.createElement('input');d.type='text';d.inputMode='decimal';
      d.value=String(+f.dist||0).replace('.',',');parFx(d,f,'dist');
      d.addEventListener('change',()=>{
        const v=parseFloat(String(d.value).replace(',','.').replace(/\s/g,''));
        if(!isFinite(v)){d.value=String(+f.dist||0).replace('.',',');return;}
        if(v===+f.dist)return;
        f.dist=Math.abs(v)<1e-9?0:v;f.name=mvName(f);repSyncForFeature(f);
        markDirty();rebuild();renderTree();renderProps();
      });
      pRow('Distance (mm)',d);
      pNote('Positif : la face avance. Négatif : elle rentre. 0 : la fonction ne fait rien.');
      pBtns([
        ['📐 Re-sélectionner',()=>{exitMoveFaceMode(true);try{if(filMode||filModeX)exitFilletMode(true);}catch(e){}enterMoveFaceMode();}],
        ...[]]);
      visDel(f);
      return;
    }
    /* — dépouillage — */
    if(f.type==='xdraft'){
      pH('Dépouillage');
      pInfo(`<b>${f.name}</b> · ${(f.faces||[]).length} face(s)`);
      if(f._m&&f._m.t&&f._m.m<f._m.t){
        pInfo(`<span style="color:var(--warn)">⚠ <b>${f._m.m}/${f._m.t}</b> face(s) retrouvée(s) — ${f._m.t-f._m.m} perdue(s).</span>`);
        pNote('Les faces sont retrouvées à chaque rejeu par leur position et leur normale.');
      }
      if(f.ref)pNote('Face de référence (plan neutre) : centre ('+f.ref.pos.map(v=>(+v).toFixed(1)).join(' ; ')+') mm.');
      const d=document.createElement('input');d.type='text';d.inputMode='decimal';
      d.value=String(+f.angle||0).replace('.',',');parFx(d,f,'angle');
      d.addEventListener('change',()=>{
        const v=parseFloat(String(d.value).replace(',','.').replace(/\s/g,''));
        if(!isFinite(v)){d.value=String(+f.angle||0).replace('.',',');return;}
        if(v<=0||v>=90){d.value=String(+f.angle||0).replace('.',',');faceEl.textContent='Angle hors bornes : 0 < a < 90°.';return;}
        if(v===+f.angle)return;
        docPushUndo();
        f.angle=v;f.name=draftName(f);repSyncForFeature(f);
        markDirty();rebuild();renderTree();renderProps();
      });
      pRow('Angle (°)',d);
      pNote('Angle de démoulage : chaque face retenue pivote de cet angle autour de sa ligne d\'intersection avec le plan neutre.');
      pBtns([['📐 Re-sélectionner les faces',()=>{exitDraftMode(true);try{if(filMode||filModeX)exitFilletMode(true);}catch(e){}enterDraftMode(f);}]]);
      visDel(f);
      return;
    }
    /* — coque — */
    if(f.type==='xshell'){
      pH('Coque (évidage)');
      pInfo(`<b>${f.name}</b> · ${(f.faces||[]).length} face(s) retirée(s)`);
      if(f._m&&f._m.t&&f._m.m<f._m.t){
        pInfo(`<span style="color:var(--warn)">⚠ <b>${f._m.m}/${f._m.t}</b> face(s) retrouvée(s) — ${f._m.t-f._m.m} perdue(s).</span>`);
      }
      if((f.faces||[]).length)pNote('Ouverture(s) : '+f.faces.map(r=>'('+r.pos.map(v=>(+v).toFixed(1)).join(' ; ')+')').join(' · '));
      const d=document.createElement('input');d.type='text';d.inputMode='decimal';
      d.value=String(+f.thick||0).replace('.',',');parFx(d,f,'thick');
      d.addEventListener('change',()=>{
        const v=parseFloat(String(d.value).replace(',','.').replace(/\s/g,''));
        if(!isFinite(v)){d.value=String(+f.thick||0).replace('.',',');return;}
        if(!(v>0)){d.value=String(+f.thick||0).replace('.',',');faceEl.textContent='La paroi doit être strictement positive.';return;}
        if(v===+f.thick)return;
        docPushUndo();
        f.thick=v;f.name=shellName(f);repSyncForFeature(f);
        markDirty();rebuild();renderTree();renderProps();
      });
      pRow('Paroi (mm)',d);
      pNote('L\'intérieur est creusé de cette épaisseur sous chaque face conservée.');
      pBtns([['🥚 Re-sélectionner les faces',()=>{exitCoqueMode(true);try{if(filMode||filModeX)exitFilletMode(true);}catch(e){}enterCoqueMode(f);}]]);
      visDel(f);
      return;
    }
    /* — suppression de faces — */
    if(f.type==='xdelface'){
      pH('Suppression de face');
      pInfo(`<b>${f.name}</b>`);
      if(f._m&&f._m.t&&f._m.m<f._m.t){
        pInfo(`<span style="color:var(--warn)">⚠ <b>${f._m.m}/${f._m.t}</b> face(s) supprimée(s) — ${f._m.t-f._m.m} perdue(s) ou refusée(s).</span>`);
      }
      if((f.faces||[]).length)pNote('Face(s) retirée(s) : '+f.faces.map(r=>'('+r.pos.map(v=>(+v).toFixed(1)).join(' ; ')+')').join(' · '));
      pNote('Les faces voisines sont prolongées jusqu\'à se rejoindre (congé → arête vive, trou → rebouché). Pour revenir en arrière : Ctrl+Z ou supprimer cette fonction.');
      visDel(f);
      return;
    }
    /* — en-tête commun (extrude, fillet, xfillet, repeat, hole, revolve, combine…) — */
    const filRims=f.rims||((f.rimTop||f.rimBot)?{top:!!f.rimTop,bottom:!!f.rimBot}:null);
    const typeLabel=f.type==='extrude'?((f.op||'add')==='cut'?'➖ ':'➕ ')+extName(f)
      :f.type==='fillet'?'Congé R'+f.radius+' · '+(f.corners||[]).length+' verticale(s)'
      :f.type==='xfillet'?xLabel(xKindOf(f))+' · '+(f.edges||[]).length+' arête(s)'
      :f.type==='repeat'?'Répétition'
      :f.type==='hole'?'Perçage'
      :f.type==='revolve'?'Révolution'
      :f.type==='combine'?'Combiner'
      :'Import';
    pH(typeLabel);
    pInfo(`<b>${f.name}</b>`);
    if(f.type==='xfillet'&&f._m&&f._m.t&&f._m.m<f._m.t){
      const manquant=f._m.t-f._m.m;
      pInfo(`<span style="color:var(--warn)">⚠ <b>${f._m.m}/${f._m.t}</b> arêtes retrouvées — ${manquant} perdue(s).</span>`);
      if(f._miss&&f._miss.length)pNote('Introuvables, près de : '+f._miss.map(q=>'('+q.join(', ')+')').join('  '));
      if(f._err)pNote(f._err);
      else pNote('La pièce a bougé depuis la sélection. Re-sélectionnez l\'arête.');
    }
    /* — répétition — */
    if(f.type==='repeat'){
      const majEntete=()=>{
        const k=doc.features.filter(c=>c.repeatId===f.id).length;
        entete.innerHTML=`<b>${f.name}</b> · ${repTypeName(f.mode,f)} · ${f.copies||1} copie(s) · ${k} instance(s)`;
      };
      const entete=document.createElement('div');p.appendChild(entete);majEntete();
      p.appendChild(repSourceList(f.base,function(b){
        docPushUndo('sources de « '+f.name+' »');f.base=b;
        repGenChildren(f);markDirty();rebuild();renderTree();refreshParts();
      },function(){majEntete();}));
      const applyCfg=()=>{repGenChildren(f);markDirty();rebuild();renderTree();renderProps();refreshParts();};
      // 🎯 / ⇄ sur la LIGNE de l'axe qu'ils règlent (et non en bas du panneau)
      const icoBtns=(row,list)=>{list.forEach(([ic,tip,fn])=>{const b=document.createElement('button');b.className='mini repDirBtn';b.textContent=ic;b.title=tip;b.style.cssText='padding:1px 6px;margin-left:4px;flex:none';b.onclick=fn;row.appendChild(b);});return row;};
      const pickTip='Prendre la direction de la sélection dans la vue : arête droite (sa direction), cercle ou arc (son axe), sinon face (sa normale)';
      const typ=pSel([['lin','Linéaire'],['circ','Circulaire'],['mir','Symétrie']],f.mode||'lin',
        v=>{f.mode=v;f.name=repTypeName(f.mode,f);applyCfg();});
      pRow('Type',typ);
      // 2026-10-23 : QUANTITÉ, original compris (6 = l'original + 5 copies) ; stocké : copies = quantité − 1
      const cnt=document.createElement('input');cnt.type='number';cnt.min='2';cnt.value=(+f.copies||1)+1;cnt.title='Quantité, original compris (6 = l’original + 5 copies)';
      cnt.onchange=()=>{f.copies=repMaxCopies((+cnt.value||2)-1);applyCfg();};
      if(f.mode!=='mir')pRow('Quantité',cnt);
      const axOpts=['X','Y','Z','Face'].map(v=>[v,f.mode==='mir'?(v==='X'?'YZ':v==='Y'?'XZ':v==='Z'?'XY':v):(v==='Face'?'Face / arête':v)]);
      const axCur=f.mode==='mir'?(f.plane==='XY'?'Z':f.plane==='XZ'?'Y':f.plane==='Face'?'Face':'X'):(f.axis||'X');
      icoBtns(pRow(f.mode==='mir'?'Plan':'Axe',pSel(axOpts,axCur,
        v=>{if(f.mode==='mir'){f.plane=v==='X'?'YZ':v==='Y'?'XZ':v==='Z'?'XY':'Face';delete f.planeN;}else{f.axis=v;delete f.dir;}applyCfg();})),
        f.mode==='mir'?[['🎯','Prendre le plan de la face sélectionnée dans la vue (sa normale)',()=>repUseFaceFor(f)]]
          :[['🎯',pickTip,()=>repUseFaceFor(f)],['⇄','Inverser la direction',()=>repFlipDir(f,1)]]);
      if(f.mode==='mir'){
        pChk('2ᵉ plan (double)',!!f.plane2,v=>{
          docPushUndo('2ᵉ plan de « '+f.name+' »');
          if(v){if(!f.plane2)f.plane2=(f.plane||'YZ')==='XZ'?'YZ':'XZ';}
          else{delete f.plane2;delete f.planeN2;}
          f.name=repTypeName(f.mode,f);applyCfg();
        });
        if(f.plane2){
          const ax2=pSel(['X','Y','Z','Face'].map(v=>[v,v==='X'?'YZ':v==='Y'?'XZ':v==='Z'?'XY':v]),
            f.plane2==='XY'?'Z':f.plane2==='XZ'?'Y':f.plane2==='Face'?'Face':'X',
            v=>{docPushUndo('2ᵉ plan');f.plane2=v==='X'?'YZ':v==='Y'?'XZ':v==='Z'?'XY':'Face';delete f.planeN2;applyCfg();});
          icoBtns(pRow('2ᵉ plan',ax2),[['🎯','Prendre le 2ᵉ plan de la face sélectionnée dans la vue (sa normale)',()=>repUseFaceFor(f,2)]]);
        }
        if(f._samePlane)pNote('⚠ Les deux plans sont identiques : la 2ᵉ passe est sans effet.');
      }
      if(f.mode!=='mir')pNote('🎯 : sélectionnez une arête (ou une face) dans la vue, puis cliquez 🎯 — la direction devient « Face / arête ». ⇄ : sens opposé.');
      if(f.mode==='lin'){
        const inp=document.createElement('input');inp.type='text';inp.inputMode='decimal';inp.value=f.dist;parFx(inp,f,'dist');
        inp.addEventListener('change',()=>{f.dist=parseFloat(String(inp.value).replace(',','.'))||0;applyCfg();});
        pRow('Distance (mm)',inp);
        // 2ᵉ DIRECTION (grille)
        pChk('2ᵉ direction (grille)',!!f.lin2,v=>{
          docPushUndo('2ᵉ direction de « '+f.name+' »');
          if(v){f.lin2=true;if(!f.axis2)f.axis2=(f.axis||'X')==='X'?'Y':'X';if(!f.copies2)f.copies2=1;if(f.dist2==null)f.dist2=f.dist||10;}
          else{delete f.lin2;}
          f.name=repTypeName(f.mode,f);applyCfg();
        });
        if(f.lin2){
          icoBtns(pRow('2ᵉ axe',pSel(['X','Y','Z','Face'].map(v=>[v,v==='Face'?'Face / arête':v]),f.axis2||'Y',v=>{docPushUndo('2ᵉ direction');f.axis2=v;delete f.dir2;applyCfg();})),
            [['🎯',pickTip,()=>repUseFaceFor(f,2)],['⇄','Inverser la 2ᵉ direction',()=>repFlipDir(f,2)]]);
          const c2=document.createElement('input');c2.type='number';c2.min='2';c2.value=(+f.copies2||1)+1;c2.title='Quantité dans la 2ᵉ direction, original compris';
          c2.onchange=()=>{docPushUndo('2ᵉ direction');f.copies2=repMaxCopies((+c2.value||2)-1);applyCfg();};
          pRow('Quantité 2',c2);
          const i2=document.createElement('input');i2.type='text';i2.inputMode='decimal';i2.value=f.dist2;parFx(i2,f,'dist2');
          i2.addEventListener('change',()=>{docPushUndo('2ᵉ direction');f.dist2=parseFloat(String(i2.value).replace(',','.'))||0;applyCfg();});
          pRow('Distance 2 (mm)',i2);
          const tot=(repMaxCopies(f.copies)+1)*(repMaxCopies(f.copies2)+1);
          pNote('Grille '+(repMaxCopies(f.copies)+1)+' × '+(repMaxCopies(f.copies2)+1)+' = '+tot+' exemplaires, original compris'+(tot-1>REPEAT_MAX?' — limité à '+REPEAT_MAX+' copies':'')+'.');
        }
      }
      if(f.mode==='circ'){
        const inp=document.createElement('input');inp.type='text';inp.inputMode='decimal';inp.value=f.angle;parFx(inp,f,'angle');
        inp.addEventListener('change',()=>{f.angle=parseFloat(String(inp.value).replace(',','.'))||360;applyCfg();});
        pRow('Angle total (°)',inp);
      }
      visDel(f);
      return;
    }
    /* — congé simple (fillet legacy) — */
    if(f.type==='fillet'){
      const inp=document.createElement('input');inp.type='text';inp.inputMode='decimal';inp.value=f.radius;parFx(inp,f,'radius');
      const commit=()=>{
        const v=parseFloat(String(inp.value).replace(',','.'));
        if(v>0&&isFinite(v)){f.radius=v;const nc=(f.corners||[]).length+((filRims&&(filRims.top||filRims.bottom))?1:0);f.name=`Congé R${v} (${nc} arête(s))`;markDirty();rebuild();renderProps();}
      };
      inp.addEventListener('change',commit);inp.addEventListener('blur',commit);
      inp.addEventListener('keydown',e=>{if(e.key==='Enter'){commit();inp.blur();}});
      pRow('Rayon (mm)',inp);
    }
    if(f.type==='combine'&&typeof combineProps==='function'){combineProps(p,f);}
    /* — congé exact (xfillet) — */
    if(f.type==='xfillet'){
      if(f._m)pInfo(f._m.m>=f._m.t?`✅ ${f._m.m}/${f._m.t} arêtes retrouvées`:`⚠ ${f._m.m}/${f._m.t} arêtes retrouvées — cliquez « Modifier la sélection »`);
      if(f._err){const e=document.createElement('div');e.style.cssText='font-size:.78rem;color:#ff6b60;background:rgba(255,69,58,.09);border:1px solid rgba(255,69,58,.3);border-radius:6px;padding:5px 7px;margin-top:6px';e.textContent='⚠ '+f._err;p.appendChild(e);}
      const lst=document.createElement('div');lst.className='col';lst.style.marginTop='6px';lst.style.maxHeight='180px';lst.style.overflow='auto';
      (f.edges||[]).forEach((s,i)=>{
        const r=document.createElement('div');r.className='tnode';
        const k=xKindOf(f),dp=xDimPrefix(k);
        r.innerHTML=`<span>${xIcon(k)}</span><span class="nm">${s.name?`<b>${s.name}</b> · `:''}${dp} <b>${s.r}</b>${s.anchor?' ⌖':''} · (${s.pos.map(v=>v.toFixed(1)).join(', ')})</span>`;
        const num=document.createElement('input');num.type='text';num.inputMode='decimal';num.value=s.r;num.title=(f.chamfer?'Distance':'Rayon')+' de cette arête';parFx(num,s,'r');
        num.onclick=ev=>ev.stopPropagation();
        const c2=()=>{const v=parseFloat(String(num.value).replace(',','.'));if(v>0&&isFinite(v)){s.r=v;repSyncForFeature(f);markDirty();rebuild();renderProps();}};
        num.addEventListener('change',c2);num.addEventListener('blur',c2);
        num.addEventListener('keydown',e=>{if(e.key==='Enter'){c2();num.blur();}e.stopPropagation();});
        r.appendChild(num);
        const x=document.createElement('span');x.textContent='✕';x.title='Retirer';x.style.cursor='pointer';
        x.onclick=ev=>{ev.stopPropagation();f.edges.splice(i,1);f.name=xFeatName(f);repSyncForFeature(f);markDirty();rebuild();renderProps();};
        r.appendChild(x);lst.appendChild(r);
      });
      p.appendChild(lst);
      pBtns([['✏️ Modifier la sélection',()=>enterExactFilletMode(f)]]);
      // V0.8.0 : une valeur pour toutes les arêtes (comme la flèche dans la vue), OK / Annuler
      if((f.edges||[]).length){
        const all=fdynNumIn(+(f.edges[0].r)||1,v=>fdynSet((f.chamfer?'distance':'rayon')+' de « '+f.name+' »',g=>{(g.edges||[]).forEach(s=>{s.r=v;});}),'fdynAll',80);
        pRow((f.chamfer?'Distance':'Rayon')+' (toutes)',all);
      }
      fdynFoot(p,f);
    }
    if(f.type==='hole'){fdynEnsure(f);renderHoleProps(p,f);fdynFoot(p,f);} // V0.8.0 : OK / Annuler, flèche de profondeur
    /* — révolution — V0.8.0 : fenêtre dynamique (71-fenetre-dynamique) */
    if(f.type==='revolve'){ fdynRevolvePanel(p,f); }
    /* — extrusion — */
    if(f.type==='extrude'){
      // V0.7.6 : fenêtre de l'extrusion dynamique — boutons à icônes, flèche dans la vue (70-extrusion-dynamique)
      extDynPanel(p,f);
    }
    visDel(f);
    return;
  }
  /* ═══════ corps ═══════ */
  if(sel.kind==='body'){
    let e=null;try{e=bodyEntryOf(sel.id);}catch(err){}
    const shown=bodies.filter(x=>!x.ghost&&bodyIdOfRuntime(x)===sel.id);
    const b=shown.find(x=>x.kind==='body')||shown[0]||null;
    const kids=doc.features.filter(f=>!f.repeatId&&f.body===sel.id);
    pH('Corps');
    pInfo(b?`<b>${e?e.name:sel.id}</b> · ${kids.length} fonction(s)`:(e?`<b>${e.name}</b> · corps vide — esquissez puis extrudez.`:'Corps non reconstruit.'));
    if(doc.activeBody!==sel.id)pBtns([['● Activer ce corps',()=>{
      doc.activeBody=sel.id;try{dirty=true;}catch(err){}
      renderTree();renderProps();refreshParts();
      try{faceEl.textContent='« '+((e&&e.name)||sel.id)+' » ACTIF : les nouvelles fonctions naîtront dedans.';}catch(err){}
    }]]);
    p.appendChild(bodyStyleField(sel.id));
    pBtns([
      ['🎯 Isoler',()=>isolate(b.id)],
      ['✅ Tout afficher',showAll],
      ['🗑 Supprimer',()=>delBody(sel.id),'danger']]);
    return;
  }
  /* ═══════ axe d'origine ═══════ */
  if(sel.kind==='originAxis'){
    pH('Axe '+sel.id+' de l’origine');
    pInfo('Référence des constructions : plan à un angle, axe, repère.');
    pBtns([['▱ Plan normal à cet axe',()=>{const a=sel.id;cgStart('plane');if(cgMode){cgSetHow('normal');cgMode.draft.refs[0]={k:'o',id:a};cgNextSlot();cgRefresh();}}]]);
    return;
  }
  /* ═══════ plan d'origine ═══════ */
  if(sel.kind==='plane'){
    const P=PLANES[sel.id]||{role:'',label:''};
    pH('Plan '+sel.id);
    pInfo(`${P.role} — ${P.label}`);
    pBtns([['✏️ Esquisse sur ce plan',()=>newSketch(sel.id)],['▱ Plan décalé',()=>cgStart('plane')]]);
    pChk('Visible',originVis[sel.id]!==false,v=>setOriginVis(sel.id,v));
    return;
  }
  pNote('Sélectionnez un plan / esquisse / fonction / corps dans l\'arbre.');
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
  const lab2=document.createElement('label');lab2.textContent='Intensité';lab2.style.flex='1';
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
  // 2026-10-16-009 : vraie TRANSPARENCE (on voit l'intérieur), enregistrée avec la pièce
  const rowG=document.createElement('div');rowG.className='skrow';
  const labG=document.createElement('label');labG.textContent='Transparence';labG.style.flex='1';
  const rg=document.createElement('input');rg.type='range';rg.min='0';rg.max='90';rg.step='1';
  rg.value=Math.round((1-bodyGlassOf(id))*100);rg.style.flex='2';
  rg.title='0 % = opaque · on voit au travers de la pièce : poches, perçages, arêtes cachées';
  const vg=document.createElement('span');vg.textContent=rg.value+'%';vg.style.minWidth='38px';vg.style.textAlign='right';vg.style.fontSize='.78rem';
  const commitG=(fin)=>{vg.textContent=rg.value+'%';setBodyGlass(id,1-(+rg.value/100));applyBodyStyleLive(id);try{buildEdgeOverlay();}catch(e){}if(fin){markDirty();renderProps();}};
  rg.addEventListener('input',()=>commitG(false));
  rg.addEventListener('change',()=>commitG(true));
  rowG.appendChild(labG);rowG.appendChild(rg);rowG.appendChild(vg);
  holder.appendChild(rowG);
  return holder;
}

