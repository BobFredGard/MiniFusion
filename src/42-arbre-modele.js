/* ---------- arbre : modèle + rendu générique ----------
   renderTree() (40) délègue ici. L'arbre est construit en deux temps :
     treeModel()   → liste ordonnée de LIGNES décrites (aucun DOM) :
                     {cls, html|text, title, css, style:{…}, kids:[{tag,cls,text,click}], lvl,
                      on:{click, dbl, ctx, mv(dir), tri, eye, pwr}, drag, drop, init}
                     ou {raw:fn} pour les sections rendues par leur propre module
                     (fil d'Ariane 47, configuration 52, lignes Placer 47),
                     ou {group:[…], indent} pour un bloc décalé.
     treeDraw(t,L) → un seul dessinateur ; un seul répartiteur (treeDispatch) lit la
                     classe de la cible (mv / tri / eye / pwr) et appelle le bon gestionnaire.
   Sans assemblage, l'arbre de la pièce est celui d'avant (référence figée :
   tests/fixtures/arbre_reference.json), précédé de la recherche.
   Avec un assemblage, la hiérarchie des composants EST l'arbre (treeComps) : la pièce active
   s'imbrique sous son instance, les autres composants se déplient en lecture seule ;
   occurrences identiques regroupées « ×N » (TREE_GRP_MIN) ; dossier ⚙ Liaisons.
   Recherche : champ en tête ; chaque ligne porte un NIVEAU lvl, treeFilter garde les lignes
   trouvées et leurs parents, tout est déplié.
   Glisser-déposer : une fonction sur une autre du même corps (crans featMoveRaw), un corps ou
   une esquisse sur un composant (asmCmdMoveTo). Aucune logique métier propre à l'arbre. */
// Champ de recherche et repère des lignes trouvées (styles injectés, comme cssTreeBody)
(function(){
  try{
    if(typeof document==='undefined'||document.getElementById('cssTreeV2'))return;
    const st=document.createElement('style');st.id='cssTreeV2';
    st.textContent='.tsearch{padding:4px 6px 6px}'+
      '.tsearch input{width:100%;box-sizing:border-box;padding:3px 8px;font-size:.74rem;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text)}'+
      '.tnode.tmatch .nm{color:var(--primary);font-weight:600}'+
      '.tnode.tdrop{outline:2px dashed var(--primary);outline-offset:-2px}'+
      // sections (Origine, Esquisses, Construction, Composants, Liaisons) : nœuds sobres, pas de bandeau
      '.tnode.tsec .nm{font-weight:600}'+
      '.tnode .tind{flex:none;align-self:stretch;margin:-3px 0 -3px -6px;background:repeating-linear-gradient(to right,transparent 0 6px,rgba(142,142,147,.28) 6px 7px,transparent 7px 14px)}'+
      '#treeOverlay{width:300px}@media(max-width:1100px){#treeOverlay{width:230px}}'+
      // colonnes : triangle 12 px, icône 18 px — les noms s'alignent d'une ligne à l'autre
      '#tree .tnode{gap:5px}'+
      '#tree .tnode>.tri{width:12px;flex:none;text-align:center;color:var(--muted);font-size:.68rem}'+
      '#tree .tnode>.tri+span:not(.pdot){width:18px;flex:none;text-align:center}'+
      '#tree .tnode>.tri+.pdot{margin:0 4px}'+
      // pièce active : barre bleue et nom en gras (plus de « · actif »)
      '#tree .tnode.tactive{box-shadow:inset 3px 0 0 var(--primary)}#tree .tnode.tactive .nm{font-weight:700;color:var(--primary)}'+
      // pastilles (fixée, liaison, alerte)
      '#tree .tbadge{flex:none;font-size:.64rem;line-height:1.35;padding:0 5px;border-radius:9px;border:1px solid rgba(142,142,147,.45);color:var(--muted)}'+
      '#tree .tbadge.j{border-color:var(--primary);color:var(--primary)}#tree .tbadge.w{border-color:var(--warn);color:var(--warn)}'+
      // allègement : ▲▼ et ⏻ (actif) au survol ou sur la ligne sélectionnée ; corps sans dégradé
      '#tree .tnode .mv,#tree .tnode .pwr.on{visibility:hidden}'+
      '#tree .tnode:hover .mv,#tree .tnode.sel .mv,#tree .tnode:hover .pwr.on,#tree .tnode.sel .pwr.on{visibility:visible}'+
      '#tree .tnode .eye{opacity:.7}#tree .tnode.bh{background:none}';
    (document.head||document.body||document.documentElement).appendChild(st);
  }catch(e){}
})();

/* ── modèle ── */
let treeInstOpen=new Set(); // lot 1 : instances dépliées (contenu en lecture seule), état de vue
let treeGrpOpen=new Set();  // lot 2 : groupes ×N dépliés
let treeJointsOpen=true;    // lot 2 : dossier Liaisons déplié
let treeQuery='';           // lot 2 : texte recherché (état de vue, jamais enregistré)
const TREE_GRP_MIN=3;
const TREE_IND=14;          // retrait par niveau (px)       // occurrences identiques à partir desquelles on regroupe
function treeModel(){
  const L=[];
  L.push(treeSearchRow());
  // Lot 1 : avec un assemblage, la hiérarchie des composants devient l'arbre lui-même ;
  // sans assemblage, l'arbre reste celui de la pièce (identique à renderTree)
  const uni=!!asm&&asmOn();
  if(asmMode==='asm'&&asm){
    if(!uni)L.push({raw:asmTreeRender,keep:true});
    else{
      L.push({raw:asmBreadcrumb,keep:true});
      treeComps(L,treePlacer()); // mode Placer : les repères du composant actif, sous sa ligne
    }
    return treeQuery?treeFilter(L,treeQuery):L;
  }
  L.push({raw:asmBreadcrumb,keep:true});
  L.push({raw:function(t){try{cfgTreeRow(t);}catch(e){}},keep:true});
  if(!uni)treePart(L);
  else{const P=[];treePart(P);treeComps(L,P);}
  return treeQuery?treeFilter(L,treeQuery):L;
}
function treeSearchRow(){
  const v=String(treeQuery).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  return {cls:'tsearch',keep:true,
    html:'<input id="treeQ" type="search" placeholder="Rechercher dans l’arbre (nom, type…)" value="'+v+'" aria-label="Rechercher dans l’arbre">',
    init:d=>{
      const i=d.querySelector?d.querySelector('input'):null;if(!i)return;
      i.oninput=()=>{
        treeQuery=i.value;const p=i.selectionStart;renderTree();
        try{const j=document.getElementById('treeQ');if(j){j.focus();j.setSelectionRange(p,p);}}catch(e){}
      };
      // les raccourcis de l'application ne voient pas la frappe ; Échap vide la recherche
      i.onkeydown=e=>{e.stopPropagation();if(e.key==='Escape'&&treeQuery){treeQuery='';renderTree();}};
    }};
}
// Recherche : sans accents ni casse ; une ligne reste si elle correspond OU si une ligne
// plus profonde qui la suit (avant le retour à son niveau) correspond. Les sections
// dessinées par leur module (raw) disparaissent, sauf celles marquées keep.
function treeNorm(s){return String(s||'').replace(/<[^>]*>/g,' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function treeFilter(L,q){
  const Q=treeNorm(q).trim();if(!Q)return L;
  const flat=[];
  const walk=(A,base,box)=>A.forEach(r=>{if(r.group)walk(r.group,base+(r.lvlBase||0),r);else flat.push({r,l:base+(r.lvl||0),box});});
  walk(L,0,null);
  const hit=flat.map(x=>!x.r.raw&&!x.r.keep&&treeNorm(x.r.html!=null?x.r.html:x.r.text).indexOf(Q)>=0);
  const keep=flat.map((x,i)=>{
    if(x.r.keep)return true;if(x.r.raw)return false;if(hit[i])return true;
    for(let j=i+1;j<flat.length&&!flat[j].r.keep&&flat[j].l>x.l;j++)if(hit[j])return true;
    return false;
  });
  const out=[];let cur=null;
  flat.forEach((x,i)=>{
    if(!keep[i])return;
    const r=hit[i]?Object.assign({},x.r,{cls:(x.r.cls||'')+' tmatch'}):x.r;
    if(x.box){if(!cur||cur.src!==x.box){cur={group:[],indent:x.box.indent,src:x.box};out.push(cur);}cur.group.push(r);}
    else{cur=null;out.push(r);}
  });
  if(!flat.some((x,i)=>hit[i]))out.push({cls:'tnode',text:'Aucun résultat pour « '+q+' ».',style:{color:'var(--muted)',cursor:'default'}});
  return out;
}
let treePlacerOpen=true; // section « Repères » du mode Placer dépliée
function treePlacer(){
  // Mode Placer : origine et repères de construction du composant actif — cibles d'un alignement,
  // clic = la vue tourne autour (asmPivotPick, 47). Imbriqués sous la ligne du composant actif.
  const L=[],c=asmActiveComp();if(!c)return L;
  const open=treePlacerOpen||!!treeQuery;
  L.push({lvl:0,cls:'tnode tsec',title:'Repères du composant : cibles d’un alignement · clic sur un repère = la vue tourne autour',
    html:'<span class="tri" title="Déplier / replier">'+(open?'▼':'▶')+'</span><span>⌖</span><span class="nm">Repères</span>',
    on:{click:()=>{treePlacerOpen=!treePlacerOpen;renderTree();}}});
  if(open){
    const one=(cg,name,icon,title)=>L.push({lvl:1,cls:'tnode'+(asmPivot&&(asmPivot.cg||null)===(cg||null)?' sel':''),style:{cursor:'pointer'},
      html:icon+'<span class="nm">'+asmEsc(name)+'</span>',title,on:{click:()=>asmPivotPick(cg,name)}});
    const on='Origine de « '+c.name+' »';
    one(null,on,'<span class="pdot" style="background:#fff;box-shadow:0 0 0 2px #1c1c1e inset"></span>','Repère du composant : cible d’un alignement · clic = la vue tourne autour');
    (c.doc.cgeo||[]).forEach(k=>{if(k&&k.kind==='frame')one(k.id,k.name,'<span>⌖</span>','Repère de construction du composant : cible d’un alignement · clic = la vue tourne autour');});
  }
  if(!c.occ.length)L.push({lvl:0,cls:'tnode',html:'<span class="nm" style="color:var(--muted)">Aucun composant : « Nouveau composant » ou « Insérer ».</span>'});
  return L;
}
// Contenu de la pièce ACTIVE (`doc`) : origine, construction, esquisses, corps et fonctions
function treePart(L){
  // ⚠ d'antériorité (43) : fonctions qui s'appuient sur une fonction placée après elles
  const ANT=antWarnMap();
  const antTag=id=>{const w=ANT.get(id);return w?'<span class="antwarn" style="color:var(--warn);flex:none;margin-left:4px" title="Antériorité : '+w.join(' ; ').replace(/"/g,'&quot;')+' — déplacez l’une ou l’autre pour rétablir l’ordre">⚠</span>':'';};
  // Section repliable (Origine, Esquisses) : un nœud comme les autres, état dans doc.fold
  // (défaut : defFold) ; jamais repliée sur ce qu'on sélectionne, ni pendant une recherche
  const gfold=(k,icon,label,tip,defFold)=>{
    const f=doc.fold&&(k in doc.fold)?!!doc.fold[k]:!!defFold;
    // l'origine s'ouvre aussi quand une commande de construction attend une référence (cgMode)
    const open=!f||!!treeQuery||(k==='origin'&&(sel.kind==='plane'||sel.kind==='originAxis'||(typeof cgMode!=='undefined'&&!!cgMode)));
    L.push({lvl:0,cls:'tnode tsec',title:tip,
      html:'<span class="tri" title="Déplier / replier">'+(open?'▼':'▶')+'</span><span>'+icon+'</span><span class="nm">'+label+'</span>',
      on:{click:()=>{doc.fold=doc.fold||{};doc.fold[k]=open;try{dirty=true;}catch(e){}renderTree();}}});
    return open;
  };
  // ligne d'esquisse ou de fonction : l'ancien node() de renderTree
  const node=(icon,name,kind,id,visible,dbl,info)=>{
    const lk=(tlMark!=null&&kind==='feature'?(function(){const mi=tlIdx();return mi>=0&&doc.features.findIndex(x=>x.id===id)>=mi;})():false);
    const estSel=(sel.kind===kind&&sel.id===id)||treeSel.indexOf(id)>=0;
    const mvOk=kind==='feature'&&(function(){const _f=doc.features.find(x=>x.id===id);return !!(_f&&!_f.repeatId);})();
    const mv=mvOk?' <span class="mv" data-d="-1" title="Monter dans le corps">▲</span><span class="mv" data-d="1" title="Descendre dans le corps">▼</span>':'';
    const on={
      mv:dd=>{if(!featMove(id,dd))featMoveFail();},
      eye:()=>{
        if(kind==='plane'){setOriginVis(id,!originVis[id]);return;}
        if(kind==='sketch'){const s=doc.sketches.find(x=>x.id===id);if(s){s.visible=!(s.visible!==false);markDirty();rebuild();renderTree();}}
        else if(kind==='feature'){const f=doc.features.find(x=>x.id===id);if(f){f.visible=!(f.visible!==false);if(f.type==='repeat')doc.features.forEach(k=>{if(k.repeatId===f.id)k.visible=f.visible;});
          if(!f.repeatId&&doc.bodyVis)bodies.forEach(b=>{if(b.ref===f.id)delete doc.bodyVis[b.id];});
          markDirty();rebuild();renderTree();}}
      },
      click:ev=>{
        if(treeSelClick(kind,id,ev))return;
        if(kind==='feature'&&ghostHide===id)ghostHide=null;
        treeSel=kind==='feature'?[id]:[];
        sel={kind,id};
        if(kind==='body'){try{tlActivateBody(id);}catch(e){}}
        renderTree();renderProps();refreshParts();
      },
      ctx:e=>showCtx(e.clientX,e.clientY,{kind,id})
    };
    if(dbl)on.dbl=dbl;
    const dd=kind==='sketch'?{drag:{kind:'sketch',id}}:(mvOk?{drag:{kind:'feature',id},drop:treeDropFeat(id)}:{});
    L.push(Object.assign(dd,{lvl:1,cls:'tnode'+(estSel?' sel':'')+(visible===false?' hidden':'')+(lk?' locked':''),
      html:`<span>${icon}</span><span class="nm">${name}</span>${kind==='feature'?antTag(id):''}${mv}<span class="eye" title="Afficher / masquer">`+(visible===false?EYE_OFF:'👁')+`</span>`,
      title:kind==='sketch'?(info?info+' — ':'')+'Clic = sélectionner · Ctrl+clic = ajouter au lot · Shift+clic = plage · Suppr = supprimer · double-clic = modifier l’esquisse · 👁 = afficher/masquer':
        kind==='feature'?'Clic = sélectionner · Ctrl+clic = ajouter au lot · Shift+clic = plage · double-clic = éditer congé/chanfrein exact · 👁 = afficher/masquer · ▲▼ = décaler dans le corps':undefined,
      on}));
  };
  if(gfold('origin','⬒','Origine','Repère de l’origine · Z↑ haut · Y arrière',true)){
    {
      const on=!!(axHelper&&axHelper.visible);
      L.push({lvl:1,cls:'tnode'+(on?'':' hidden'),
        title:'Repère de l’origine : point central, axes X/Y/Z et 3 plans cliquables (un clic sur un plan le sélectionne) · 👁 = montrer/masquer',
        html:`<span class="pdot" style="background:#fff;box-shadow:0 0 0 2px #1c1c1e inset"></span><span class="nm">Repère <span style="color:var(--muted)">· X Y Z + plans</span></span><span class="eye" title="Afficher / masquer le repère">${on?'👁':EYE_OFF}</span>`,
        on:{
          eye:()=>{
            const v=!(axHelper&&axHelper.visible);
            if(axHelper)axHelper.visible=v;
            try{const o=$('optAxes');if(o){o.checked=v;}}catch(e){}
            try{markDirty();}catch(e){}
            renderTree();
          },
          click:()=>{
            if(cgTreePick({k:'o',id:'O'}))return;
            try{faceEl.textContent='Repère de l’origine : cliquez un de ses 3 petits plans dans la vue pour le sélectionner (esquisse dessus, référence).';}catch(e){}
          }}});
    }
    ['XY','XZ','YZ'].forEach(p=>{
      L.push({lvl:1,cls:'tnode'+(sel.kind==='plane'&&sel.id===p?' sel':'')+(originVis[p]?'':' hidden'),
        title:'Clic = sélectionner · double-clic = esquisse dessus · 👁 = montrer/masquer · '+PLANES[p].label,
        html:`<span class="pdot" style="background:${PLANES[p].css}"></span><span class="nm">Plan ${p} <span style="color:var(--muted)">· ${PLANES[p].role}</span></span><span class="eye" title="Afficher / masquer le plan">👁</span>`,
        on:{
          eye:()=>setOriginVis(p,!originVis[p]),
          click:()=>{if(cgTreePick({k:'o',id:p}))return;treeSel=[];sel={kind:'plane',id:p};renderTree();renderProps();refreshParts();},
          dbl:()=>{sel={kind:'plane',id:p};newSketch(p);},
          ctx:e=>showCtx(e.clientX,e.clientY,{kind:'plane',id:p})}});
    });
    [['X','#ff453a','droite'],['Y','#30d158','arrière'],['Z','#0a84ff','haut']].forEach(([a,c,r])=>{
      L.push({lvl:1,cls:'tnode'+(sel.kind==='originAxis'&&sel.id===a?' sel':''),
        title:'Axe '+a+' de l’origine — référence d’un plan à un angle, d’un axe, d’un repère',
        html:`<span class="pdot" style="background:${c};border-radius:1px;height:3px;margin-top:5px"></span><span class="nm">Axe ${a} <span style="color:var(--muted)">· ${r}</span></span>`,
        on:{click:()=>{if(cgTreePick({k:'o',id:a}))return;treeSel=[];sel={kind:'originAxis',id:a};renderTree();renderProps();}}});
    });
  }
  cgTreeModel(L); // 📐 Construction (79) : section + éléments en enfants
  const skVis=doc.sketches.filter(s=>!skIsRepCopy(s)&&!s.fao); // V0.23.20 : esquisses FAO jamais en CAO
  if(gfold('sk','✏️','Esquisses ('+skVis.length+')','Esquisses de la pièce',false)){
    skVis.forEach(s=>node('✏️',s.name,'sketch',s.id,s.visible,()=>openSketch(s.id),sketchFaceLabel(s)+' · '+s.entities.length+' traits'));
  }
  if(tlMark!=null){
    const mi=tlIdx();
    const replay=ev=>{if(ev&&ev.stopPropagation)ev.stopPropagation();if(tlMark!=null){tlSetPtr(null);markDirty();rebuild();renderTree();renderProps();}};
    L.push({css:'display:flex;align-items:center;gap:6px;justify-content:space-between;padding:6px 8px;margin:6px 0 2px;border:1px solid var(--border);border-radius:8px;font-size:.72rem;cursor:pointer;background:linear-gradient(90deg,rgba(232,179,74,.14),transparent)',
      title:'Clic = rejouer toute la timeline (lever le marqueur)',
      kids:[{tag:'span',html:'⏱ Temps bloqué avant « '+(mi<0?'(fonction supprimée)':doc.features[mi].name)+' » — <b>'+(mi<0?0:mi)+'</b> fonction(s) rejouée(s)'},
            {tag:'button',cls:'mini',text:'↗ Rejouer tout',click:replay}],
      on:{click:replay}});
  }
  const bodyIds=()=>((doc.bodies||[]).length?doc.bodies:[{id:'b1',name:'Corps 1'}]).map(e=>e.id);
  const bodyOf=f=>(f&&bodyIds().indexOf(f.body)>=0)?f.body:bodyIds()[0];
  const featNode=f=>{
    if(tlMark!=null&&f.id===tlMark){
      L.push({lvl:1,cls:'tnode',style:{cursor:'default',borderTop:'2px dashed var(--warn)',color:'var(--warn)',fontWeight:'700'},
        text:'⏱ — marqueur ici — '+(doc.features.length-tlIdx())+' fonction(s) masquée(s) sous le marqueur'});
    }
    if(f.repeatId)return;
    if(tlLocked(f))return;
    if(f.type==='repeat'){
      const kids=doc.features.filter(c=>c.repeatId===f.id);
      const vkids=kids.filter(k=>!tlLocked(k));
      const srcs=(f.base||[]);
      const estChoisie=(sel.kind==='feature'&&sel.id===f.id)||treeSel.indexOf(f.id)>=0;
      const open=f.open===true||estChoisie||!!treeQuery;
      const srcNames=srcs.map(id=>{const b=doc.features.find(x=>x.id===id);return b?b.name:'?';});
      L.push({drag:{kind:'feature',id:f.id},drop:treeDropFeat(f.id),lvl:1,cls:'tnode'+((sel.kind==='feature'&&sel.id===f.id)||treeSel.indexOf(f.id)>=0?' sel':'')+(f.visible===false?' hidden':'')+(tlLocked(f)?' locked':''),
        html:`<span class="tri" title="Déplier / replier les fonctions copiées">${open?'▼':'▶'}</span><span>🔁</span><span class="nm">${f.name} · ${repTypeName(f.mode,f)} · ${vkids.length} instance(s)`+(repIsNewBody(f)?' <span title="Opération Nouveau corps : un corps par exemplaire">◧</span>':'')+
          (srcs.length?` <span class="repsrc" title="Sources : ${srcNames.join(', ')}">◀ ${srcs.length}</span>`:' <span class="repsrc vide" title="Aucune source choisie">◀ 0</span>')+
          `</span>`+antTag(f.id)+` <span class="mv" data-d="-1" title="Monter dans le corps (bloc entier)">▲</span><span class="mv" data-d="1" title="Descendre dans le corps (bloc entier)">▼</span><span class="eye" title="Afficher / masquer">`+(f.visible===false?EYE_OFF:'👁')+`</span>`,
        title:'Clic = sélectionner · ▶/▼ = montrer/masquer les fonctions copiées · ▲▼ = décaler le bloc dans le corps'+
          (srcs.length?(' · sources : '+srcNames.join(', ')):' · AUCUNE source : la répétition ne produit rien'),
        on:{
          mv:dd=>{if(!featMove(f.id,dd))featMoveFail();},
          tri:()=>{f.open=!f.open;renderTree();renderProps();},
          eye:()=>{f.visible=!(f.visible!==false);doc.features.forEach(k=>{if(k.repeatId===f.id)k.visible=f.visible;});markDirty();rebuild();renderTree();},
          click:ev=>{
            if(treeSelClick('feature',f.id,ev))return;
            treeSel=[f.id];
            sel={kind:'feature',id:f.id};renderTree();renderProps();refreshParts();
          },
          ctx:e=>showCtx(e.clientX,e.clientY,{kind:'feature',id:f.id})}});
      if(!open)return;
      vkids.forEach(k=>{
        L.push({lvl:2,cls:'tnode repchild'+((sel.kind==='feature'&&sel.id===f.id)||treeSel.indexOf(k.id)>=0?' sel':'')+(k.visible===false?' hidden':''),
          html:`<span>${featIconOf(k)}</span><span class="nm">${k.name}</span><span class="eye" title="Afficher / masquer">`+(k.visible===false?EYE_OFF:'👁')+`</span>`,
          title:'Instance n°'+k.repIndex+' de la répétition — clic = sélectionner la répétition · Ctrl+clic = ajouter au lot à supprimer',
          on:{
            eye:()=>{k.visible=!(k.visible!==false);markDirty();rebuild();renderTree();},
            click:ev=>{
              if(ev.ctrlKey||ev.metaKey){treeSelToggle(k.id,'feature');return;}
              treeSel=[f.id];
              sel={kind:'feature',id:f.id};renderTree();renderProps();refreshParts();
            },
            dbl:()=>{if(k.type==='xfillet'){sel={kind:'feature',id:k.id};treeSel=[];enterExactFilletMode(k);}else if(k.type==='xdraft'){sel={kind:'feature',id:k.id};treeSel=[];enterDraftMode(k);}else if(k.type==='xshell'){sel={kind:'feature',id:k.id};treeSel=[];enterCoqueMode(k);}else if(k.type==='xsplit'){sel={kind:'feature',id:k.id};treeSel=[];enterSplitMode(k);}},
            ctx:e=>showCtx(e.clientX,e.clientY,{kind:'feature',id:f.id})}});
      });
      return;
    }
    const repF=sel.kind==='feature'?doc.features.find(x=>x.id===sel.id&&x.type==='repeat'):null;
    const estSrc=!!(repF&&(repF.base||[]).indexOf(f.id)>=0);
    const ri=repMode&&repMode.feats&&repMode.feats.includes(f.id)?'✓ ':'';
    node(ri+(estSrc?'<span class="srcmark" title="Source de la répétition sélectionnée">◀</span>':'')+featIconOf(f),f.name,'feature',f.id,f.visible,(f.type==='xfillet'||f.type==='xdraft'||f.type==='xshell'||f.type==='xdelface'||f.type==='xsplit')?()=>{sel={kind:'feature',id:f.id};treeSel=[];if(f.type==='xfillet')enterExactFilletMode(f);else if(f.type==='xdraft')enterDraftMode(f);else if(f.type==='xsplit')enterSplitMode(f);else enterCoqueMode(f);}:null);
    // V0.22.5 : STEP multi-corps — arborescence d'assemblage repliable sous la fonction (90)
    const IT=f.type==='import'&&typeof importTreeOf==='function'?importTreeOf(f):null;
    if(IT){
      const row=L[L.length-1],open=impTreeOpen.has(f.id)||!!treeQuery;
      row.html='<span class="tri" title="Déplier / replier l’arborescence du STEP">'+(open?'▼':'▶')+'</span>'+row.html;
      row.on.tri=()=>{if(impTreeOpen.has(f.id))impTreeOpen.delete(f.id);else impTreeOpen.add(f.id);renderTree();};
      if(open)importTreeRows(L,f,IT,2);
    }
  };
  const groups=(doc.bodies||[]).length?doc.bodies:[{id:'b1',name:'Corps 1'}];
  groups.forEach(be=>{
    const kids=doc.features.filter(f=>!f.repeatId&&bodyOf(f)===be.id);
    const kidsVis=kids.filter(f=>!tlLocked(f));
    const estActif=doc.activeBody===be.id;
    let pasNe=false;try{pasNe=tlMark!=null&&!bodyBornAt(be.id,tlIdx());}catch(e){} // V0.15.12 : corps né plus loin que le marqueur
    const selIn=treeSel.concat([(sel.kind==='feature'||sel.kind==='body')?sel.id:null]).filter(Boolean);
    const hasSel=selIn.some(id=>id===be.id||bodyOf(doc.features.find(x=>x.id===id))===be.id);
    const open=be.open!==false||hasSel||!!treeQuery;
    let visVue=true;
    try{ visVue=!(doc.bodyVis&&doc.bodyVis[be.id]===false); }catch(e){}
    const enRejeu=bodyEnabledOf(be.id);
    const bcol=bodyTextColor(be);
    L.push({drag:{kind:'body',id:be.id},drop:treeDropBody(be.id),lvl:0,cls:'tnode bh'+((sel.kind==='body'&&sel.id===be.id)?' sel':'')+(visVue?'':' hidden')+(enRejeu?'':' off')+(pasNe?' locked':''),
      style:{boxShadow:'inset 3px 0 0 '+(bcol||'#9a9aa0')},
      html:'<span class="tri" title="Déplier / replier les fonctions du corps">'+(open?'▼':'▶')+'</span><span title="Corps — '+(be.name||'')+'">🧱</span>'+
        '<span class="nm"'+(bcol?(' style="color:'+bcol+'"'):'')+'>'+be.name+(estActif?' ●':'')+(pasNe?' <span title="Ce corps naît plus loin dans la timeline : il n’existe pas encore au marqueur">⏳ pas encore créé</span>':' · '+kidsVis.length+' fonction(s)')+(function(){const o=typeof repBodyOwner==='function'?repBodyOwner(be.id):null;return o?' <span class="repsrc" title="Corps créé par la répétition « '+o.name+' » (opération Nouveau corps)">🔁 '+o.name+'</span>':'';})()+'</span>'+
        '<span class="pwr'+(enRejeu?' on':'')+'" title="'+(enRejeu?'Rejeu ACTIF : toutes les fonctions de ce corps sont recalculées — cliquer pour les EXCLURE (le corps reste visible)':'Rejeu ÉTEINT : toutes les fonctions de ce corps sont exclues (grisées) — cliquer pour les inclure')+'">⏻</span>'+
        '<span class="eye" title="'+(visVue?'Corps visible dans la 3D — cliquer pour le CACHER (il reste dans le rejeu et l\'export)':'Corps masqué dans la 3D (vue seule) — cliquer pour l\'AFFICHER. Aucune fonction n\'est touchée')+'">'+(visVue?'👁':EYE_OFF)+'</span>',
      title:'Clic = sélectionner et ACTIVER (les nouvelles fonctions naîtront dans « '+be.name+' ») · ▶/▼ = replier · ⏻ = rejeu (inclure/exclure ses fonctions du recalcul) · 👁 = vue 3D seule · clic droit = renommer / supprimer · ➕ additif / ➖ découpe · ● = corps actif',
      on:{
        tri:()=>{be.open=!open;try{dirty=true;}catch(e){}renderTree();},
        pwr:()=>bodyToggleEnabled(be.id),
        eye:()=>bodyToggleVis(be.id),
        click:()=>{
          if(typeof skEdit!=='undefined'&&skEdit&&skTool==='isect'&&typeof skIsectFromBody==='function'&&skIsectFromBody(be.id))return;
          treeSel=[];
          sel={kind:'body',id:be.id};
          try{tlActivateBody(be.id);}catch(e){}
          renderTree();renderProps();refreshParts();
        },
        ctx:e=>showCtx(e.clientX,e.clientY,{kind:'body',id:be.id})}});
    if(open)doc.features.forEach(f=>{if(!f.repeatId&&bodyOf(f)===be.id)featNode(f);});
  });
  return L;
}

/* ── assemblage : composants imbriqués ──
   🧩 racine (le fichier)
      ⬒ Origine…              contenu propre de la racine (modifiable si elle est active)
      📦 Composants (n)       occurrences de la racine, puis leurs sous-occurrences
         📦 Base:1            ▶ = contenu en lecture seule (grisé), double-clic = le modéliser
         ✏️ Goupille:1           (active : barre bleue) contenu modifiable (P = treePart), imbriqué
         📦 Vis M6 ×8         frères identiques regroupés au-delà de TREE_GRP_MIN
      ⚙ Liaisons (n)          une ligne par occurrence placée (treeJoints)
   Gestionnaires des occurrences repris de l'ancienne section Composants (47). */
function treeComps(L,P){
  const Q=!!treeQuery;
  const AP=asm.path,n=AP.length;
  const same=(a,b)=>a.length===b.length&&a.every((q,i)=>q===b[i]);
  const pre=(a,b)=>a.length<=b.length&&a.every((q,i)=>q===b[i]); // a préfixe de b
  const all=asmInstances(asm.root);
  const sec=(lvl,open,icon,label,title,toggle)=>L.push({lvl,cls:'tnode tsec',title,
    html:'<span class="tri" title="Déplier / replier">'+(open?'▼':'▶')+'</span><span>'+icon+'</span><span class="nm">'+label+'</span>',
    on:{click:toggle}});
  const emit=(inst,lv)=>{
    const c=asmComp(inst.comp)||{};
    const self=same(inst.path,AP);
    const mine=inst.path.length>n&&AP.every((q,i)=>inst.path[i]===q);
    const direct=mine&&inst.path.length===n+1;
    const key=inst.path.join('/')||'/';
    const edit=self&&!!P;
    const open=edit||treeInstOpen.has(key)||Q;
    const tri='<span class="tri" title="'+(edit?'Pièce en cours de modélisation':'Afficher / masquer le contenu (lecture seule)')+'">'+(open?'▼':'▶')+'</span>';
    const togg=()=>{if(edit)return;if(treeInstOpen.has(key))treeInstOpen.delete(key);else treeInstOpen.add(key);renderTree();};
    if(!inst.path.length){
      // la racine : le fichier lui-même
      L.push({drop:treeDropComp(inst.comp),lvl:lv,cls:'tnode tocc troot'+(self?' tactive':''),style:self?{}:{opacity:'0.55'},
        html:'<span class="tri"></span><span>'+(self?'✏️':'🧩')+'</span><span class="nm">'+asmEsc(c.name)+'</span>',
        title:'Composant racine (le fichier) · double-clic = le modéliser',
        on:{dbl:()=>asmShow([],'part')}});
      return {open,edit,togg,c};
    }
    const id=inst.path[inst.path.length-1],o=asmOcc(id);if(!o)return null;
    const sub=(c.occ&&c.occ.length?' <span style="color:var(--muted)" title="Sous-composants">('+c.occ.length+')</span>':'')+asmLinkBadge(c);
    const badges=(o.fixed?'<span class="tbadge" title="Fixée">📌 fixe</span>':'')+
      (o.align?(o.align.type?'<span class="tbadge j" title="Liaison">⚙ '+asmEsc((ASM_JOINTS[o.align.type]||{}).lab||'')+'</span>':'<span class="tbadge j" title="Alignée sur un repère (rigide)">⚙ Rigide</span>'):'')+
      (o.st==='warn'?'<span class="tbadge w" title="'+asmEsc(o.msg)+'">⚠</span>':'');
    L.push({drop:treeDropComp(inst.comp),lvl:lv,cls:'tnode tocc'+(self?' tactive':'')+(direct&&asmMode==='asm'&&asmLotHas(id)?' sel':'')+(o.visible===false?' hidden':''),
      style:(!mine&&!self)?{opacity:'0.55'}:{},
      html:tri+'<span>'+(self?'✏️':'📦')+'</span><span class="nm">'+asmEsc(o.name)+sub+'</span>'+badges+
        '<span class="eye" title="Afficher / masquer">'+(o.visible===false?EYE_OFF:'👁')+'</span>',
      title:direct?'Clic = sélectionner · Ctrl+clic = ajouter au lot · Shift+clic = plage · Suppr = supprimer le lot · double-clic = modéliser · ▶ = contenu · clic droit = menu':'Double-clic = modéliser ce composant · ▶ = contenu',
      on:{
        tri:togg,
        eye:()=>{asmPush('visibilité');o.visible=!(o.visible!==false);asmNotify();renderTree();},
        click:ev=>{
          {const f=globalThis.asmTreePick;if(typeof f==='function'&&f(inst.path))return;}
          if(direct){if(asmMode!=='asm'){asmShow(AP,'asm',id);return;}if(asmSelClick(id,ev))return;asmSelId=id;asmPivot=null;asmDraw();renderTree();renderProps();}
        },
        dbl:()=>asmShow(inst.path,'part'),
        ctx:e=>{
          const items=[{html:'✏️ Modéliser ce composant',fn:()=>asmShow(inst.path,'part')}];
          if(c.occ&&c.occ.length)items.push({html:'🧩 Placer ses composants',fn:()=>asmShow(inst.path,'asm')});
          if(direct){
            if(asmMode==='asm'&&!asmLotHas(id)){asmSelId=id;asmDraw();renderTree();renderProps();} // dans le lot : le lot reste
            items.push({html:'✥ Déplacer',fn:()=>asmCmdMoveOcc(AP,id)},
              {html:'➕ Nouvelle occurrence',fn:()=>{if(asmMode!=='asm')asmShow(AP,'asm',id);asmSelId=id;asmCmdNewOcc();}},
              {html:o.fixed?'📌 Libérer':'📌 Fixer',fn:()=>asmToggleFixed(id)},
              {html:'🏷 Renommer le composant',fn:()=>asmRename(id)},
              ...(c.doc&&c.doc.std?[{html:'🔩 Modifier la pièce normalisée…',fn:()=>stdDlg({occ:id})}]:[]), // 48-composants-normalises
              {html:'🗑 Supprimer'+(asmLotIds().length>1&&asmLotHas(id)?' le lot ('+asmLotIds().length+')':''),fn:()=>asmAskDeleteLot(asmLotHas(id)?asmLotIds():[id])});
          }
          items.push(...asmLinkMenu(c));
          try{mfPop({getBoundingClientRect:()=>({left:e.clientX,right:e.clientX+200,top:e.clientY-6,bottom:e.clientY-6,width:200,height:0})},items);}catch(err){}
        }}});
    return {open,edit,togg,c};
  };
  // contenu d'une instance : modifiable (pièce active) ou en lecture seule
  const content=(inst,st,lv)=>{
    if(st.edit)L.push({group:P,lvlBase:lv});
    else if(st.open)treeCompContent(L,inst,st.c,lv);
  };
  const stack=new Set();
  // sous-occurrences d'une instance, au niveau lv (frères identiques regroupés ×N)
  const kids=(cid,path,lv)=>{
    const c=asmComp(cid);if(!c||stack.has(cid))return;
    stack.add(cid);
    const G=[];c.occ.forEach(o=>{let g=G.find(x=>x.comp===o.comp);if(!g)G.push(g={comp:o.comp,occ:[]});g.occ.push(o);});
    G.forEach(g=>{
      if(g.occ.length<TREE_GRP_MIN){g.occ.forEach(o=>walk(o.comp,path.concat(o.id),lv));return;}
      const gk=(path.join('/')||'/')+'#'+g.comp;
      // jamais replié quand il contient l'instance éditée ou l'occurrence sélectionnée
      const force=Q||g.occ.some(o=>pre(path.concat(o.id),AP)||(asmSelId===o.id&&same(path,AP)));
      const gopen=treeGrpOpen.has(gk)||force;
      const gc=asmComp(g.comp)||{};
      const nf=g.occ.filter(o=>o.fixed).length,nj=g.occ.filter(o=>o.align).length,nh=g.occ.filter(o=>o.visible===false).length;
      const gt=()=>{if(force)return;if(treeGrpOpen.has(gk))treeGrpOpen.delete(gk);else treeGrpOpen.add(gk);renderTree();};
      L.push({lvl:lv,cls:'tnode tgrp'+(nh===g.occ.length?' hidden':''),
        html:'<span class="tri" title="Afficher / masquer les occurrences">'+(gopen?'▼':'▶')+'</span><span>📦</span><span class="nm">'+asmEsc(gc.name)+
          ' <span style="color:var(--muted)">×'+g.occ.length+'</span>'+(nf?' <span title="'+nf+' fixée(s)">📌'+(nf<g.occ.length?nf:'')+'</span>':'')+
          (nj?' <span title="'+nj+' liée(s) / alignée(s)">⚙'+(nj<g.occ.length?nj:'')+'</span>':'')+'</span>'+
          '<span class="eye" title="Afficher / masquer toutes les occurrences">'+(nh===g.occ.length?EYE_OFF:'👁')+'</span>',
        title:g.occ.length+' occurrences de « '+(gc.name||'')+' » · ▶ = les détailler · Ctrl+clic = toutes au lot · 👁 = toutes · double-clic = modéliser le composant',
        on:{tri:gt,
          click:ev=>{
            // Ctrl+clic (mode Placer, occurrences du composant actif) : tout le groupe au lot
            if(ev&&(ev.ctrlKey||ev.metaKey)&&asmMode==='asm'&&same(path,AP)){
              const cur=asmLotIds(),ids=g.occ.map(o=>o.id),all=ids.every(x=>cur.indexOf(x)>=0);
              asmLotSet(all?cur.filter(x=>ids.indexOf(x)<0):cur.concat(ids.filter(x=>cur.indexOf(x)<0)),all?null:ids[ids.length-1]);
              return;
            }
            gt();
          },
          eye:()=>{asmPush('visibilité');const v=nh===g.occ.length;g.occ.forEach(o=>{o.visible=v;});asmNotify();renderTree();},
          dbl:()=>asmShow(path.concat(g.occ[0].id),'part')}});
      if(gopen)g.occ.forEach(o=>walk(o.comp,path.concat(o.id),lv+1));
    });
    stack.delete(cid);
  };
  const walk=(cid,path,lv)=>{
    const inst={path,comp:cid};
    const st=emit(inst,lv);if(!st)return;
    content(inst,st,lv+1);
    kids(cid,path,lv+1);
  };
  // racine : son propre contenu, puis Composants, puis Liaisons (comme la maquette)
  const root={path:[],comp:asm.root};
  const rs=emit(root,0);
  // contenu propre : modifiable si elle est active ; sinon, en lecture seule, et seulement
  // s'il existe (un assemblage pur n'a ni esquisse ni fonction)
  const RD=(rs&&rs.c&&rs.c.doc)||{};
  if(rs&&(rs.edit||(RD.features||[]).length||(RD.sketches||[]).length))content(root,Object.assign({},rs,{open:true}),1);
  const open0=asmTreeOpen||Q||n>0; // jamais replié sur la pièce qu'on modélise
  sec(1,open0,'📦','Composants <span style="color:var(--muted)">('+(all.length-1)+')</span>',
    (all.length-1)+' occurrence(s) de '+(asm.comps.length-1)+' composant(s) sous la racine',
    ()=>{if(n>0)return;asmTreeOpen=!asmTreeOpen;renderTree();});
  const nl=asmLinked().length;
  if(nl){
    const w=asmLinked().some(Q2=>Q2.link.st==='warn');
    L.push({lvl:2,cls:'tnode',style:{cursor:'pointer'},
      html:'<span>🔗</span><span class="nm">'+nl+' composant(s) lié(s)'+(w?' <span style="color:var(--warn)">⚠</span>':'')+'</span><span title="Vérifier les sources">🔄</span>',
      title:'Clic = vérifier les sources sur le disque (et autoriser l’accès au dossier de projets)',
      on:{click:()=>asmLinksCheck(true)}});
  }
  if(open0)kids(asm.root,[],2);
  treeJoints(L,all,1);
}
function treeOpenFeature(path,fid){
  // Modéliser le composant de l'instance, puis y sélectionner la fonction (double-clic en lecture seule)
  if(asmShow(path,'part')===false)return;
  const f=(doc.features||[]).find(x=>x.id===fid);if(!f)return;
  treeSel=[fid];sel={kind:'feature',id:fid};
  renderTree();renderProps();refreshParts();
}
function treeCompContent(L,inst,c,lv){
  // Contenu d'un composant NON édité : lecture seule, grisé ; double-clic = le modéliser
  const D=c.doc||{};
  const on={click:()=>{try{faceEl.textContent='Lecture seule : double-clic pour modéliser « '+(c.name||'')+' ».';}catch(e){}},dbl:()=>asmShow(inst.path,'part')};
  const ro=(d,icon,label,meta,sec,fid)=>L.push({lvl:lv+d,cls:'tnode'+(sec?' tsec':''),style:{opacity:'0.55'},
    html:'<span>'+icon+'</span><span class="nm">'+asmEsc(label)+(meta?' <span style="color:var(--muted)">'+asmEsc(meta)+'</span>':'')+'</span>',
    title:'Lecture seule — double-clic = modéliser « '+(c.name||'')+' »'+(fid?' et sélectionner cette fonction':''),
    on:fid?{click:on.click,dbl:()=>treeOpenFeature(inst.path,fid)}:on});
  ro(0,'⬒','Origine','',true);
  const CG=(D.cgeo||[]).filter(k=>k&&k.kind);
  if(CG.length)ro(0,'📐','Construction','('+CG.length+')',true);
  const F=D.features||[];
  const sks=(D.sketches||[]).filter(s=>!(F.some(f=>f.repeatId&&f.sketchId===s.id)&&!F.some(f=>!f.repeatId&&f.sketchId===s.id)));
  if(sks.length){ro(0,'✏️','Esquisses','('+sks.length+')',true);sks.forEach(s=>ro(1,'✏️',s.name));}
  const B=(D.bodies||[]).length?D.bodies:[{id:'b1',name:'Corps 1'}];
  const ids=B.map(b=>b.id),bOf=f=>ids.indexOf(f.body)>=0?f.body:ids[0];
  B.forEach(b=>{
    const k=F.filter(f=>!f.repeatId&&bOf(f)===b.id);
    ro(0,'🧱',b.name,'· '+k.length+' fonction(s)',true);
    k.forEach(f=>ro(1,featIconOf(f),f.name,'',false,f.id));
  });
}
/* ── dossier Liaisons ──
   Une ligne par occurrence placée par un alignement (o.align) : type (ASM_JOINTS, sans type =
   rigide), occurrence → cible (repère du porteur ou d'une autre occurrence), valeurs des
   degrés de liberté. Clic = la sélectionner en mode Placer dans son porteur (asmShow, comme
   un clic sur l'occurrence) : le panneau de placement (48) la pilote. */
function treeJoints(L,all,lv){
  const Q=!!treeQuery,AP=asm.path,seen=new Set(),J=[];
  const same=(a,b)=>a.length===b.length&&a.every((q,i)=>q===b[i]);
  all.forEach(inst=>{
    if(!inst.path.length)return;
    const id=inst.path[inst.path.length-1];if(seen.has(id))return;seen.add(id);
    const o=asmOcc(id);if(o&&o.align)J.push({o,owner:inst.path.slice(0,-1)});
  });
  if(!J.length)return;
  const open=treeJointsOpen||Q;
  L.push({lvl:lv,cls:'tnode tsec',
    html:'<span class="tri" title="Déplier / replier">'+(open?'▼':'▶')+'</span><span>⚙</span><span class="nm">Liaisons <span style="color:var(--muted)">('+J.length+')</span></span>',
    title:'Occurrences placées par une liaison ou un alignement · clic sur une ligne = la piloter (mode Placer)',
    on:{click:()=>{treeJointsOpen=!treeJointsOpen;renderTree();}}});
  if(!open)return;
  J.forEach(({o,owner})=>{
    const a=o.align,typed=!!(a.type&&ASM_JOINTS[a.type]);
    const lab=typed?ASM_JOINTS[a.type].lab:'Rigide';
    // cible : libellé du panneau de placement (48 : asmRelName) — chemin, repère ou point d'accroche
    const ownerC=(all.find(i=>same(i.path,owner))||{}).comp;
    const cible=a.rel?'telle que construite':(typeof asmRelName==='function'?asmRelName(ownerC,a.dst):'?');
    const dof=typed?asmDofs(a).map(k=>{const v=+((a.q||{})[k])||0;return k+' '+String(+v.toFixed(2)).replace('.',',')+(k[0]==='r'?'°':' mm');}).join(', '):'';
    const selOk=asmMode==='asm'&&asmLotHas(o.id)&&same(owner,AP);
    L.push({lvl:lv+1,cls:'tnode tjoint'+(selOk?' sel':''),
      html:'<span>⚙</span><span class="nm">'+asmEsc(lab)+' <span style="color:var(--muted)">'+asmEsc(o.name)+' → '+asmEsc(cible)+'</span></span>'+
        (o.st==='warn'?'<span class="tbadge w" title="'+asmEsc(o.msg)+'">⚠</span>':''),
      title:(typed?'Liaison ':'Alignement ')+lab+' de « '+o.name+' » → '+cible+(dof?' · '+dof:'')+' · clic = la piloter (mode Placer) · Ctrl+clic = ajouter au lot · Shift+clic = plage',
      on:{click:ev=>{
        if(asmMode==='asm'&&same(owner,AP)){if(asmSelClick(o.id,ev))return;asmSelId=o.id;asmPivot=null;asmDraw();renderTree();renderProps();}
        else asmShow(owner,'asm',o.id);
      }}});
  });
}

/* ── glisser-déposer ──
   Aucune logique nouvelle : une fonction déposée sur une autre fonction du MÊME corps avance
   par crans featMoveRaw (mêmes règles que ▲▼ et que le bandeau de timeline, 41) jusqu'à la
   place de la cible, une seule étape d'annulation ; un corps ou une esquisse déposé sur un
   composant = « Déplacer vers un composant » (asmCmdMoveTo, 48). */
let treeDrag=null; // {kind:'feature'|'sketch'|'body', id} pendant un glisser
function treeFeatMoveTo(id,targetId){
  featMoveWhy=null;
  const F=doc.features,f=F.find(x=>x.id===id),T=F.find(x=>x.id===targetId);
  if(!f||!T||f===T||f.repeatId||T.repeatId||f.body!==T.body)return false;
  const dir=F.indexOf(T)>F.indexOf(f)?1:-1;
  let A=F.slice(),refus=null;
  for(let n=0;n<F.length;n++){
    // on avance tant que la fonction n'a pas dépassé la cible (après elle en descendant,
    // avant elle en montant) ; un cran refusé (antériorité) annule tout le déplacement
    if(dir>0?A.indexOf(f)>A.indexOf(T):A.indexOf(f)<A.indexOf(T))break;
    const B=A.slice();if(!featMoveRaw(B,id,dir)){refus=featMoveWhy;break;}A=B;
  }
  if(refus){try{faceEl.textContent='⛔ Déplacement refusé : '+refus;}catch(e){}return false;}
  if(A.every((x,i)=>x===F[i]))return false;
  featMoveApply(A,'déplacement de « '+f.name+' »');
  return true;
}
// Fonction déposée sur l'en-tête d'un AUTRE corps : elle s'y applique désormais (f.body), à sa
// place dans l'ordre de rejeu ; une étape d'annulation. Seules les fonctions qui ne visent pas des
// faces ou arêtes précises de leur corps : extrusion, révolution, perçage (un congé, une
// dépouille, une coque, une répétition, une combinaison y perdraient leurs références).
const TREE_TO_BODY=['extrude','revolve','sweep','hole'];
function treeFeatToBody(id,bodyId){
  const f=doc.features.find(x=>x.id===id),b=(doc.bodies||[]).find(x=>x.id===bodyId);
  if(!f||!b||f.repeatId||f.body===bodyId)return false;
  if(TREE_TO_BODY.indexOf(f.type)<0){try{faceEl.textContent='« '+f.name+' » vise des faces ou arêtes de son corps : elle ne change pas de corps (seules extrusion, révolution et perçage le peuvent).';}catch(e){}return false;}
  docPushUndo('« '+f.name+' » vers « '+b.name+' »');
  f.body=bodyId;
  markDirty();rebuild();renderTree();renderProps();
  try{faceEl.textContent='« '+f.name+' » s’applique maintenant à « '+b.name+' ».';}catch(e){}
  return true;
}
function treeDropBody(bodyId){
  return {
    accept:D=>{if(D.kind!=='feature')return false;const f=doc.features.find(x=>x.id===D.id);return !!(f&&!f.repeatId&&f.body!==bodyId);},
    fn:D=>treeFeatToBody(D.id,bodyId)
  };
}
function treeDropFeat(targetId){
  return {
    accept:D=>{
      if(D.kind!=='feature'||D.id===targetId)return false;
      const a=doc.features.find(x=>x.id===D.id),b=doc.features.find(x=>x.id===targetId);
      return !!(a&&b&&!a.repeatId&&!b.repeatId&&a.body===b.body);
    },
    fn:D=>{if(!treeFeatMoveTo(D.id,targetId)&&!featMoveWhy){try{faceEl.textContent='Rien à déplacer.';}catch(e){}}} // refus : son message reste
  };
}
function treeDropComp(cid){
  return {
    accept:D=>(D.kind==='body'||D.kind==='sketch')&&!!asm&&cid!==asm.active&&asmMode!=='asm',
    fn:D=>asmCmdMoveTo(D.kind,D.id,cid)
  };
}

/* ── rendu ── */
const TREE_ACTS=['mv','tri','eye','pwr'];
function treeDispatch(r,ev){
  // une ligne = un gestionnaire : la classe de la cible choisit l'action
  const on=r.on||{},tg=ev&&ev.target,cl=tg&&tg.classList;
  for(const a of TREE_ACTS){
    if(on[a]&&cl&&cl.contains(a)){
      if(a==='mv'){
        let dd=0;
        try{dd=+(tg.dataset&&tg.dataset.d!=null?tg.dataset.d:tg.getAttribute('data-d'));}catch(e){}
        on.mv(dd);
      }else on[a](ev);
      return;
    }
  }
  if(on.click)on.click(ev);
}
function treeDraw(t,L,base){
  base=base||0;
  L.forEach(r=>{
    if(r.raw){
      if(!base){r.raw(t);return;}
      const w=document.createElement('div');w.style.marginLeft=(TREE_IND*base)+'px';r.raw(w);t.appendChild(w);return;
    }
    if(r.group){
      // bloc décalé (pièce active sous son instance) : mêmes lignes, dessinées dedans
      const w=document.createElement('div');w.className='tgroupbox';
      treeDraw(w,r.group,base+(r.lvlBase||0));t.appendChild(w);return;
    }
    const d=document.createElement('div');
    if(r.cls)d.className=r.cls;
    if(r.css)d.style.cssText=r.css;
    if(r.style)Object.keys(r.style).forEach(k=>{d.style[k]=r.style[k];});
    // retrait : TREE_IND px par niveau, avec un trait discret par niveau (span .tind)
    const lv=base+(r.lvl||0);
    const ind=lv>0&&r.cls&&(' '+r.cls+' ').indexOf(' tnode ')>=0?'<span class="tind" style="width:'+(TREE_IND*lv)+'px"></span>':'';
    // colonnes fixes (comme la maquette) : chaque ligne a sa case triangle, vide si besoin
    const col=ind!==''||(' '+(r.cls||'')+' ').indexOf(' tnode ')>=0;
    const tri=col&&r.html!=null&&r.html.indexOf('<span class="tri"')!==0?'<span class="tri"></span>':'';
    if(r.html!=null)d.innerHTML=ind+tri+r.html;else if(r.text!=null){if(ind)d.innerHTML=ind+'<span class="nm">'+String(r.text).replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</span>';else d.textContent=r.text;}
    (r.kids||[]).forEach(k=>{const e=document.createElement(k.tag);if(k.cls)e.className=k.cls;if(k.html!=null)e.innerHTML=k.html;else e.textContent=k.text;if(k.click)e.onclick=k.click;d.appendChild(e);});
    if(r.title!=null)d.title=r.title;
    if(r.on){
      if(r.on.click||TREE_ACTS.some(a=>r.on[a]))d.onclick=ev=>treeDispatch(r,ev);
      if(r.on.dbl)d.ondblclick=r.on.dbl;
      if(r.on.ctx)d.oncontextmenu=e=>{e.preventDefault();r.on.ctx(e);};
    }
    if(r.init)r.init(d);
    if(r.drag){
      d.draggable=true;
      d.ondragstart=e=>{treeDrag=r.drag;try{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',r.drag.kind+':'+r.drag.id);}catch(err){}};
      d.ondragend=()=>{treeDrag=null;};
    }
    if(r.drop){
      const ok=()=>!!treeDrag&&r.drop.accept(treeDrag);
      d.ondragover=e=>{if(!ok())return;e.preventDefault();try{e.dataTransfer.dropEffect='move';}catch(err){}if(d.classList)d.classList.add('tdrop');};
      d.ondragleave=()=>{if(d.classList)d.classList.remove('tdrop');};
      d.ondrop=e=>{e.preventDefault();if(d.classList)d.classList.remove('tdrop');const D=treeDrag;treeDrag=null;if(D&&r.drop.accept(D))r.drop.fn(D);};
    }
    t.appendChild(d);
  });
}
function treeRender(){
  const t=$('tree');t.innerHTML='';
  const L=treeModel();
  treeDraw(t,L);
  try{treeReveal(t);}catch(e){}
  if(asmMode==='asm'&&asm){try{renderTimeline();}catch(e){}return;}
  updateOriginPlanes();
  try{renderTimeline();}catch(e){}
}
// V0.23.26 : sélection changée (arbre, timeline ou face cliquée dans la vue) → la ligne choisie,
// si elle est hors de vue, est amenée au CENTRE de l'arbre. Seulement au changement : le
// défilement manuel de l'utilisateur n'est jamais repris à chaque re-rendu.
function selRevealKey(){return (sel.kind||'')+':'+(sel.id||'')+'|'+treeSel.join(',');}
function selRevealIn(box,el,horiz){
  // Centre el dans le conteneur défilant box (axe horizontal ou vertical) s'il n'est pas
  // entièrement visible. Retourne true si box a défilé.
  if(!box||!el)return false;
  const B=box.getBoundingClientRect(),E=el.getBoundingClientRect();
  if(horiz){
    if(!(box.scrollWidth>box.clientWidth)||(E.left>=B.left&&E.right<=B.right))return false;
    box.scrollLeft+=(E.left+E.width/2)-(B.left+B.width/2);
  }else{
    if(!(box.scrollHeight>box.clientHeight)||(E.top>=B.top&&E.bottom<=B.bottom))return false;
    box.scrollTop+=(E.top+E.height/2)-(B.top+B.height/2);
  }
  return true;
}
let treeRevealLast='';
function treeReveal(t){
  const k=selRevealKey();if(k===treeRevealLast)return;
  const el=t.querySelector('.tnode.sel');
  if(el&&!el.offsetParent)return; // arbre masqué : on montrera la ligne à sa réapparition
  treeRevealLast=k;if(!el)return;
  let box=t;while(box&&box!==document.body&&!(box.scrollHeight>box.clientHeight&&/(auto|scroll)/.test(getComputedStyle(box).overflowY)))box=box.parentElement;
  if(box&&box!==document.body)selRevealIn(box,el,false);
}
