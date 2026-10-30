// Espace PLAN — suite de la fonction englobante ouverte dans 98-mep-00-modele.js (état privé partagé, fermée dans 98-mep-95-export-init.js) : panneau propriétés.
  /* ═══════════════ V. panneau propriétés ═══════════════ */
  function mepSideShow(){
    if(!mepSideEl)return;
    const sh=mepSheet();
    const v=mepSt.sel?mepView(sh,mepSt.sel):null;
    const d=mepSt.selDim?sh.dims.find(x=>x.id===mepSt.selDim):null;
    const av=mepSt.selAxis?mepView(sh,mepSt.selAxis.vid):null;
    const a=av&&mepSt.selAxis?(av.axes||[]).find(x=>x.id===mepSt.selAxis.id):null;
    mepSideEl.classList.add('open');
    mepSideEl.innerHTML='';
    let key='home';
    if(mepSt.lot){key='lot';mepSideLot(mepSideEl,sh);}
    else if(mepSt.skSel&&mepSt.skSel.size){key='sk';mepSideSk(mepSideEl,sh);}
    else if(mepSt.tbEdit&&mepTbIsSk(sh)){key='tb';mepSideTbEdit(mepSideEl,sh);}
    else if(MEP_SK_TOOLS.indexOf(mepSt.tool)>=0&&mepSt.tool!=='trim'&&mepSt.tool!=='logo'){key='sk';mepSideSk(mepSideEl,sh);} // outil de dessin : style des nouveaux éléments
    else if(v){key='view';mepSideView(mepSideEl,v,sh);}
    else if(a){key='axis';mepSideAxis(mepSideEl,av,a,sh);}
    else if(av&&mepSt.selAxis.ak){key='axis';mepSideAxisAuto(mepSideEl,av,mepSt.selAxis.ak,sh);}
    else if(d){key='dim';mepSideDim(mepSideEl,d,sh);}
    else mepSideHome(mepSideEl,sh);
    // 2026-10-22-011 : onglets (comme la FAO) — sauf esquisse / cartouche : tout empilé, plus simple à lire
    if(key!=='sk'&&key!=='tb')mepSideTabs(mepSideEl,key);
    mepSideInject();
  }
  /* injecte #mepSide dans aside.right (Paramètres) — sinon repli sur le plan */
  let mepSideHost=null,mepSideNext=null;
  function mepSideInject(){
    try{
      const right=document.querySelector('aside.right');
      if(!right)return;
      if(mepSideEl.parentNode===right)return; // déjà injecté
      if(!mepSideHost){
        mepSideHost=document.createElement('div');
        mepSideHost.className='panel';
        mepSideHost.id='mepSidePanel';
        const ttl=document.createElement('p');
        ttl.className='panel-title';
        ttl.textContent='Paramètres — Plan';
        mepSideHost.appendChild(ttl);
      }
      mepSideNext=mepSideEl.nextSibling;
      mepSideHost.appendChild(mepSideEl);
      right.insertBefore(mepSideHost,right.firstChild);
      try{window.dispatchEvent(new Event('resize'));}catch(e){}
    }catch(e){}
  }
  function mepSideEject(){
    try{
      if(mepSideEl&&mepSideEl.parentNode!==document.getElementById('mepBody')){
        const body=document.getElementById('mepBody');
        if(body)body.appendChild(mepSideEl);
      }
      if(mepSideHost&&mepSideHost.parentNode)mepSideHost.parentNode.removeChild(mepSideHost);
      try{window.dispatchEvent(new Event('resize'));}catch(e){}
    }catch(e){}
  }
  /* panneau par défaut : création de vues + outils + planche */
  /* 2026-10-22-011 : ONGLETS du panneau (« le menu Mise en plan est à modifier
     avec des onglets aussi ») — une section (titre h4) = un onglet, même style
     que les fiches FAO (.fao-tabs/.fao-tab) ; ce qui précède le 1er titre reste
     en tête. À partir de 3 sections ; onglet choisi mémorisé par panneau. */
  const mepSideTabSel={};
  function mepSideTabs(root,key){
    const kids=[...root.children];
    const hs=kids.filter(e=>e.tagName==='H4');
    if(hs.length<3)return;
    const names=[],groups={};let cur=null;
    kids.forEach(el=>{
      if(el.tagName==='H4'){cur=el.textContent.trim()||('Section '+(names.length+1));if(!groups[cur]){groups[cur]=[];names.push(cur);}}
      if(cur)groups[cur].push(el);
    });
    const first=hs[0];
    const bar=document.createElement('div');bar.className='fao-tabs mep-tabs';
    root.insertBefore(bar,first);
    const panes={},btns={};
    const show=n=>{names.forEach(k=>{panes[k].style.display=k===n?'':'none';btns[k].className='fao-tab'+(k===n?' on':'');});mepSideTabSel[key]=n;};
    names.forEach(n=>{
      const b=document.createElement('button');b.className='fao-tab';b.textContent=n;
      b.onclick=e=>{e.stopPropagation();show(n);};
      bar.appendChild(b);btns[n]=b;
      const pn=document.createElement('div');pn.className='mep-pane';
      groups[n].forEach(el=>pn.appendChild(el));
      root.appendChild(pn);panes[n]=pn;
    });
    show(names.indexOf(mepSideTabSel[key])>=0?mepSideTabSel[key]:names[0]);
  }
  function mepSideHome(root,sh){
    const mkBtn=(lab,fn,tip)=>{
      const b=document.createElement('button');
      b.textContent=lab;if(tip)b.title=tip;
      b.onclick=e=>{e.stopPropagation();fn();};
      root.appendChild(b);
      return b;
    };
    const rowEl=()=>{const r=document.createElement('div');r.className='row';root.appendChild(r);return r;};
    const h=el=>{
      const t=document.createElement('h4');
      t.textContent=el;
      root.appendChild(t);
    };
    /* — planche — */
    h('Planche');
    let r=rowEl();
    {const L=document.createElement('label');L.textContent='Format';r.appendChild(L);
     const s=document.createElement('select');s.title='Format de la planche : H = horizontal (paysage), V = vertical (portrait)';
     FORMAT_LIST.concat(FORMAT_MANUEL).forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;s.appendChild(o);});
     s.value=mepFmtCode(sh);
     s.onchange=()=>{mepSetFormat(s.value);mepSideShow();};
     r.appendChild(s);}
    if(sh.format===FORMAT_MANUEL){
      [['Largeur (mm)','fw'],['Hauteur (mm)','fh']].forEach(([lab,k])=>{
        r=rowEl();const L=document.createElement('label');L.textContent=lab;r.appendChild(L);
        const i=document.createElement('input');i.type='number';i.step='1';i.min='50';i.max='5000';i.value=sh[k];
        i.onchange=()=>{mepSetFormatWH(k==='fw'?+i.value:sh.fw,k==='fh'?+i.value:sh.fh);mepSideShow();};
        r.appendChild(i);});
    }
    {const f=mepFrameOf(sh),setF=(o,lab)=>{mepEdit(lab||'cadre',()=>{sh.frame=Object.assign(mepFrameOf(sh),o);});mepSideShow();};
     r=rowEl();
     {const L=document.createElement('label');L.textContent='Cadre';r.appendChild(L);
      const is=P=>MEP_FRAME_KEYS.every(k=>f[k]===P[k]);
      r.appendChild(mkBtn('Justet',()=>setF(MEP_FRAME_JUSTET,'cadre Justet'),'Comme SIRAP-13-001 : marges 20 / 10 mm, trait 1 mm bleu-gris #6B6BA1, zones 1…8 / A…F, centrage, coins de coupe')).className=is(MEP_FRAME_JUSTET)?'active':'';
      r.appendChild(mkBtn('ISO 5457',()=>setF(MEP_FRAME_ISO,'cadre ISO 5457'),'Marge 20 mm à gauche (reliure), 10 mm ailleurs, trait 0,7 mm, zones, centrage, coins de coupe')).className=is(MEP_FRAME_ISO)?'active':'';
      r.appendChild(mkBtn('Classique',()=>setF(MEP_FRAME_DEF,'cadre classique'),'Marges 12 mm, liseré intérieur')).className=is(MEP_FRAME_DEF)?'active':'';}
     [['Marge gauche (mm)','l'],['Marge droite (mm)','r'],['Marge haute (mm)','t'],['Marge basse (mm)','b'],['Trait du cadre (mm)','lw']].forEach(([lab,k])=>{
       r=rowEl();const L=document.createElement('label');L.textContent=lab;r.appendChild(L);
       const i=document.createElement('input');i.type='number';i.step=k==='lw'?'0.05':'1';i.min=k==='lw'?'0.1':'0';i.max=k==='lw'?'2':'40';i.value=f[k];
       i.onchange=()=>setF({[k]:+i.value});r.appendChild(i);});
     [['Liseré intérieur','inner'],['Repères de centrage','centre'],['Zones de repérage','zones'],['Coins de coupe','trim']].forEach(([lab,k])=>{
       r=rowEl();const L=document.createElement('label');L.textContent=lab;r.appendChild(L);
       const cb=document.createElement('input');cb.type='checkbox';cb.checked=!!f[k];cb.onchange=()=>setF({[k]:cb.checked});r.appendChild(cb);});
     [['Couleur du cadre','col','#6b6ba1'],['Couleur des repères','mcol','#3e2b2c']].forEach(([lab,k,dv])=>{
       r=rowEl();const L=document.createElement('label');L.textContent=lab;r.appendChild(L);
       const c=document.createElement('input');c.type='color';c.value=f[k]||dv;c.disabled=!f[k];c.onchange=()=>setF({[k]:c.value});r.appendChild(c);
       const a=document.createElement('label');a.style.cssText='flex:none;display:flex;gap:4px;align-items:center';
       const cb=document.createElement('input');cb.type='checkbox';cb.checked=!f[k];cb.title='Encre de la planche';
       cb.onchange=()=>setF({[k]:cb.checked?'':c.value});a.appendChild(cb);a.appendChild(document.createTextNode('encre'));r.appendChild(a);});
     r=rowEl();
     {const def=mepFrameUserDef(),same=!!def&&MEP_FRAME_KEYS.every(k=>(def[k]===undefined?MEP_FRAME_DEF[k]:def[k])===f[k]);
      r.appendChild(mkBtn(same?'✓ Cadre par défaut':'Cadre par défaut',()=>{
        try{if(same)localStorage.removeItem('mep_frame_def');else{const o={};MEP_FRAME_KEYS.forEach(k=>{o[k]=f[k];});localStorage.setItem('mep_frame_def',JSON.stringify(o));}}catch(e){}
        mepStatus(same?'Cadre par défaut retiré.':'Ce cadre sera celui des nouvelles planches.');mepSideShow();},
        'Utiliser ce cadre pour les nouvelles planches (ce navigateur)')).style.flex='1';}}
    r=rowEl();
    {const L=document.createElement('label');L.textContent='Papier (écran)';r.appendChild(L);
     const pm=mepPaperMode();
     [['white','Blanc'],['dark','Sombre']].forEach(([m,l])=>{const b=document.createElement('button');b.textContent=l;b.className=pm===m?'active':'';
       b.title=m==='dark'?'Planche sombre et traits clairs pour le confort à l’écran — export et impression restent sur papier blanc':'Planche blanche';
       b.onclick=e=>{e.stopPropagation();mepSetPaper(m);mepSideShow();};r.appendChild(b);});}
    r=rowEl();
    {const L=document.createElement('label');L.textContent='Export PDF / SVG';r.appendChild(L);
     const bw=mepExportBW();
     [[false,'Couleur'],[true,'Noir']].forEach(([v,l])=>{const b=document.createElement('button');b.textContent=l;b.className=bw===v?'active':'';b.id=v?'mepExpBW':'mepExpCol';
       b.title=v?'Tout en noir sur blanc (ISO), couleurs d’entités comprises':'Garder les couleurs : cotes, axes, traits colorés (papier blanc)';
       b.onclick=e=>{e.stopPropagation();mepSetExportBW(v);mepSideShow();};r.appendChild(b);});}
    r=rowEl();
    {const L=document.createElement('label');L.textContent='Règles en mm';r.appendChild(L);
     const cb=document.createElement('input');cb.type='checkbox';cb.id='mepRulersOn';cb.checked=mepSt.rulers!==false;
     cb.onchange=()=>{mepSt.rulers=cb.checked;try{localStorage.setItem('mep_rulers',cb.checked?'1':'0');}catch(e){}mepRulers();};r.appendChild(cb);}
    r=rowEl();
    {const L=document.createElement('label');L.textContent='Traits';r.appendChild(L);
     const sel=document.createElement('select');sel.id='mepLwPreset';const cur=mepLwGet();
     Object.keys(MEP_LW_PRESETS).forEach(k=>{const o=document.createElement('option');o.value=k;o.textContent=MEP_LW_PRESETS[k].lab;sel.appendChild(o);});
     const oc=document.createElement('option');oc.value='perso';oc.textContent='Personnalisé';sel.appendChild(oc);
     sel.value=cur.preset&&MEP_LW_PRESETS[cur.preset]?cur.preset:'perso';
     sel.onchange=()=>{const P=MEP_LW_PRESETS[sel.value];if(P){const c=mepLwGet();mepLwSet(Object.assign({preset:sel.value,thick:P.thick,thin:P.thin,hid:P.hid,dim:P.dim},c.axis>0?{axis:c.axis}:{},c.ext>0?{ext:c.ext}:{}));mepSideShow();}};
     r.appendChild(sel);}
    {const cur=mepLwGet();
     // une valeur par ligne (libellé à gauche, saisie à droite) comme le reste du panneau
     [['Trait épais (mm)','thick'],['Trait fin (mm)','thin'],['Trait caché (mm)','hid'],['Lignes de cote (mm)','dim']].forEach(([lab,k])=>{
       r=rowEl();
       const L=document.createElement('label');L.textContent=lab;r.appendChild(L);
       const i=document.createElement('input');i.type='number';i.step='0.05';i.min='0.1';i.max='2';i.value=cur[k];i.title=lab;
       i.onchange=()=>{const v=Math.min(2,Math.max(.1,+i.value||cur[k]));const o=Object.assign({},mepLwGet(),{preset:'perso'});o[k]=v;mepLwSet(o);mepSideShow();};
       r.appendChild(i);});
     // lignes de rappel, axes de trous (lignes d'axe et croix de centre) : réglages propres, gardés quand le préréglage change
     [['Lignes de rappel (mm)','ext','mepLwExtIn','dim','Épaisseur des lignes de rappel (et d’attache des cotes ordonnées) — vide : comme les lignes de cote'],
      ['Axes de trous (mm)','axis','mepLwAxisIn','thin','Épaisseur des axes et des croix de centre des trous — vide : trait fin (croix 0,62)']].forEach(([lab,k,id,dk,tip])=>{
       r=rowEl();
       const L=document.createElement('label');L.textContent=lab;r.appendChild(L);
       const i=document.createElement('input');i.type='number';i.id=id;i.step='0.05';i.min='0.1';i.max='2';i.value=cur[k]>0?cur[k]:cur[dk];i.title=tip;
       i.onchange=()=>{const o=Object.assign({},mepLwGet());if(i.value==='')delete o[k];else o[k]=Math.min(2,Math.max(.1,+i.value||o[dk]));mepLwSet(o);mepSideShow();};
       r.appendChild(i);});}
    /* — cartouche (projet / auteur / date) — */
    const tt=sh.title||(sh.title={});
    const tit=(lab,key,ph,list)=>{
      const i=document.createElement('input');
      i.value=tt[key]!==undefined?tt[key]:'';i.placeholder=ph||'';
      i.onchange=()=>{if(list)mepTbRemember(list,i.value);mepEdit('cartouche',()=>{tt[key]=i.value;});};
      if(list){i.setAttribute('list','mepTbList_'+list);mepTbDatalist(root,list);}
      r=rowEl();
      const L=document.createElement('label');L.textContent=lab;
      r.appendChild(L);r.appendChild(i);
    };
    h('Cartouche'); // 2026-10-22-011 : onglet à part (la planche était très longue)
    tit('Projet','projet','Nom du projet');
    tit('Client','client','');
    tit('Société','societe','');
    tit('Quantité','quantite','ex. 10');
    tit('N° de plan','nplan','ex. MF-0012');
    tit('Auteur','auteur','—');
    tit('Date','date',new Date().toLocaleDateString('fr-FR'));
    const rb=(...a)=>r.appendChild(mkBtn(...a)); // bouton dans la rangée courante
    tit('Matière','matiere','ex. EN AW-2017 / S235','mat');
    tit('TTS (surface)','traitement','ex. anodisation noire','tts');
    tit('TTH (thermique)','tth','ex. trempe + revenu 45 HRC','tth');
    // champs supplémentaires utilisés par un cartouche dessiné (n° de plan, société, champs perso…)
    if(mepTbIsSk(sh)){
      const seen=new Set(['projet','client','societe','quantite','nplan','auteur','date','matiere','traitement','tth','tolgen']);
      tt.tb.sk.ents.forEach(e=>{
        if(e.t!=='text'||!e.f||e.f==='txt')return;const F=MEP_TB_FIELDS[e.f];if(!F||F.auto)return;
        const key=e.f==='perso'?'cust:'+e.k:e.f;if(seen.has(key))return;seen.add(key);
        if(e.f==='perso'){
          r=rowEl();const L=document.createElement('label');L.textContent=e.lab||'Champ';r.appendChild(L);
          const i=document.createElement('input');i.value=(tt.cust&&tt.cust[e.k])||'';
          i.onchange=()=>mepEdit('cartouche',()=>{if(!tt.cust)tt.cust={};tt.cust[e.k]=i.value;});r.appendChild(i);
        }else tit(F.ed,e.f,F.ph,F.list);
      });
    }
    r=rowEl();
    {const L=document.createElement('label');L.textContent='Tol. générales';r.appendChild(L);
     const sel=document.createElement('select');sel.id='mepTolGen';
     MEP_TOL_GEN.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v||'—';sel.appendChild(o);});
     sel.value=MEP_TOL_GEN.indexOf(tt.tolgen||'')>=0?(tt.tolgen||''):'';
     sel.onchange=()=>mepEdit('tolérances générales',()=>{tt.tolgen=sel.value;});r.appendChild(sel);}
    r=rowEl();
    {const L=document.createElement('label');L.textContent='Logo';r.appendChild(L);
     rb(tt.logo?'Changer…':'Choisir…',()=>mepLogoLoad(u=>{mepEdit('logo',()=>{tt.logo=u;});mepSideShow();}),'Image du cartouche (réduite à 240 px)');
     if(tt.logo)rb('Retirer',()=>{mepEdit('logo',()=>{delete tt.logo;});mepSideShow();},'Retirer le logo');}
    /* — modèle de cartouche : Standard, ou esquisse personnalisée (bibliothèque de ce navigateur) — */
    r=rowEl();
    {const L=document.createElement('label');L.textContent='Modèle';r.appendChild(L);
     const sel=document.createElement('select');sel.id='mepTbModel';
     const add=(v,t)=>{const o=document.createElement('option');o.value=v;o.textContent=t;sel.appendChild(o);};
     const lib=mepTbLib();
     add('std','Standard');Object.keys(lib).forEach(n=>add('l:'+n,'★ '+n));
     let cur='std';
     if(mepTbIsSk(sh)){cur=tt.tb.name&&lib[tt.tb.name]?'l:'+tt.tb.name:'cur';if(cur==='cur')add('cur',(tt.tb.name||'Personnalisé')+' (cette planche)');}
     else if(tt.tbName&&lib[tt.tbName]&&lib[tt.tbName].kind==='std')cur='l:'+tt.tbName;
     sel.value=cur;
     sel.onchange=()=>{const v=sel.value;if(v==='cur')return;
       mepEdit('modèle de cartouche',()=>{if(v==='std'){tt.tb=null;delete tt.tbName;}else mepTbApply(sh,mepTbLib()[v.slice(2)]);});mepAfterSheetSwitch();};
     r.appendChild(sel);}
    r=rowEl();
    rb('Charger un cartouche…',()=>mepTbImportFile(),'Charger un cartouche extérieur (fichier .mfcartouche, ex. un dossier partagé) : ajouté à la bibliothèque et appliqué à cette planche — un modèle du même nom est remplacé');
    rb('Exporter…',()=>mepTbExportFile(sh),'Enregistrer les modèles de cartouche (bibliothèque + celui de cette planche) dans un fichier .mfcartouche');
    {const st=mepTbStray(sh);
     if(st.length){
       const n=document.createElement('div');n.className='note';n.style.color='#ff9f0a';
       n.textContent='⚠ '+st.length+' point(s) du cartouche sont hors de la feuille (solveur parti au loin) : ils sont ignorés pour la hauteur du cartouche.';
       root.appendChild(n);r=rowEl();
       rb('Supprimer les éléments hors feuille',()=>{mepEdit('cartouche : éléments hors feuille',()=>mepTbDropStray(sh));mepSideShow();},'Supprime ces points, leurs lignes et leurs contraintes (annulable)');
     }}
    r=rowEl();
    rb(mepTbIsSk(sh)?'Éditer le cartouche…':'Dessiner le cartouche…',()=>mepTbEdit(true),'Lignes, rectangles, textes et champs (matière, TTS, TTH…), contraintes et cotes pilotantes');
    {
      const curName=mepTbIsSk(sh)?tt.tb.name:tt.tbName;
      rb('Enregistrer…',()=>{
        const n=(prompt('Nom du modèle de cartouche (bibliothèque de ce navigateur) :',curName||'Mon cartouche')||'').trim();if(!n)return;
        const L=mepTbLib();L[n]=mepTbPack(sh,n);mepTbLibSave(L);
        mepEdit('modèle de cartouche',()=>{if(mepTbIsSk(sh))tt.tb.name=n;else tt.tbName=n;});
        mepStatus('Modèle « '+n+' » enregistré (traits, textes, logo et valeurs des champs).');mepSideShow();},
        'Ajouter ce cartouche à la bibliothèque — traits, textes, logo et valeurs des champs : réutilisable dans toutes les pièces');
      const lib=mepTbLib();
      if(curName&&lib[curName]){
        const tbN=curName;
        let def='';try{def=localStorage.getItem('mep_tb_def')||'';}catch(e){}
        r=rowEl();
        rb(def===tbN?'✓ Par défaut':'Par défaut',()=>{try{if(def===tbN)localStorage.removeItem('mep_tb_def');else localStorage.setItem('mep_tb_def',tbN);}catch(e){}mepSideShow();},'Modèle des nouvelles planches');
        rb('Retirer de la bibliothèque',()=>{
          if(!confirm('Retirer « '+tbN+' » de la bibliothèque ? La planche garde son cartouche.'))return;
          const L=mepTbLib();delete L[tbN];mepTbLibSave(L);
          try{if(localStorage.getItem('mep_tb_def')===tbN)localStorage.removeItem('mep_tb_def');}catch(e){}
          mepSideShow();});
      }
    }
    /* — révisions (indice = dernière révision) — */
    const revs=Array.isArray(tt.revs)?tt.revs:[],revCols=mepTbRevCols(sh);
    r=rowEl();{const L=document.createElement('label');L.textContent='Révisions';L.style.fontWeight='600';r.appendChild(L);
     // indices : lettres (A, B, C…) ou chiffres (0, 1, 2… / 1, 2, 3…) ; changer renumérote les révisions existantes
     const fs=document.createElement('select');fs.id='mepRevFmt';fs.title='Indices des révisions : lettres ou chiffres (renumérote les révisions existantes)';
     [['A','A, B, C…'],['O','O, A, B…'],['0','0, 1, 2…'],['1','1, 2, 3…']].forEach(([v,l])=>{const o=document.createElement('option');o.value=v;o.textContent=l;fs.appendChild(o);});
     fs.value=tt.revFmt||'A';
     fs.onchange=()=>{mepEdit('indices des révisions',()=>{tt.revFmt=fs.value;(tt.revs||[]).forEach((rv,k)=>{rv.i=mepRevIdx(fs.value,k);});});mepSideShow();};
     r.appendChild(fs);}
    revs.forEach((rv,k)=>{
      // 2 lignes par révision : indice + date (+ suppression), puis nom + modification
      const inp=(key,ph,w,tip)=>{const i=document.createElement('input');i.value=rv[key]||'';i.placeholder=ph;i.title=tip;if(w)i.style.maxWidth=w;
        i.onchange=()=>{if(key==='n'){try{localStorage.setItem('mep_rev_nom',i.value);}catch(e){}}mepEdit('révision',()=>{rv[key]=i.value;});};r.appendChild(i);return i;};
      r=rowEl();inp('i','Ind.','34px','Indice');inp('d','Date','86px','Date');
      rb('×',()=>{mepEdit('révision',()=>{tt.revs.splice(k,1);});mepSideShow();},'Supprimer la révision');
      r=rowEl();inp('n','Nom','86px','Nom de la personne qui a modifié le plan');inp('t','Modification','','Modification');
      // colonnes en plus prévues par le tableau dessiné du cartouche (note d'application, vérifié, approuvé)
      const xc=Object.keys(MEP_REV_COLS).filter(c=>revCols.has(c));
      if(xc.length){r=rowEl();xc.forEach(c=>inp(c,MEP_REV_COLS[c],c==='a'?'60px':'',MEP_REV_COLS[c]));}
    });
    r=rowEl();
    rb('+ Révision',()=>{mepEdit('révision',()=>{
      if(!Array.isArray(tt.revs))tt.revs=[];
      const nx=mepRevNext(tt.revFmt||'A',tt.revs);
      let nom='';try{nom=localStorage.getItem('mep_rev_nom')||'';}catch(e){}
      if(!nom&&tt.auteur&&tt.auteur!=='—')nom=tt.auteur;
      tt.revs.push({i:nx,d:new Date().toLocaleDateString('fr-FR'),n:nom,t:''});});mepSideShow();},'Ajouter une ligne au tableau des révisions');
    {const st=mepRevSt(sh),setR=(o,lab)=>{mepEdit(lab||'tableau des révisions',()=>{const ow=mepRevStOwner(sh);ow.revSt=Object.assign({},ow.revSt||{},o);});mepSideShow();};
     r=rowEl();{const L=document.createElement('label');L.textContent='Largeur totale (mm)';r.appendChild(L);
      const i=document.createElement('input');i.type='number';i.step='0.5';i.min='0';i.max='800';i.value=st.w||'';i.placeholder='auto';
      i.title='Largeur totale du tableau des révisions — vide : automatique';i.onchange=()=>setR({w:Math.max(0,+i.value||0)});r.appendChild(i);
      rb('= cartouche',()=>setR({w:+mepTbW(sh,mepPageDim(sh)).toFixed(2)},'révisions alignées sur le cartouche'),'Même largeur que le cartouche (aligné à droite sur le cadre)');}
     r=rowEl();{const L=document.createElement('label');L.textContent='Hauteur h (mm)';r.appendChild(L);
      r.appendChild(mepIsoSelect(st.h,v=>setR({h:v})));}
     r=rowEl();{const L=document.createElement('label');L.textContent='Trait (mm)';r.appendChild(L);
      const i=document.createElement('input');i.type='number';i.step='0.05';i.min='0.1';i.max='2';i.value=st.lw;
      i.title='Épaisseur des traits du tableau des révisions';i.onchange=()=>setR({lw:Math.min(2,Math.max(0.1,+i.value||MEP_REV_DEF.lw))});r.appendChild(i);}}
    /* — nomenclature (corps visibles ; matière par corps, sinon celle du cartouche) — */
    r=rowEl();
    {const L=document.createElement('label');L.textContent='Nomenclature';r.appendChild(L);
     const cb=document.createElement('input');cb.type='checkbox';cb.id='mepBomOn';cb.checked=!!(sh.bom&&sh.bom.on);
     cb.onchange=()=>{mepEdit('nomenclature',()=>{sh.bom=Object.assign({mat:{}},sh.bom||{},{on:cb.checked});});mepSideShow();};r.appendChild(cb);}
    if(sh.bom&&sh.bom.on&&(asmPlanOn()||(sh.bom.lvl&&sh.bom.lvl!=='corps'))){
      r=rowEl();
      const L=document.createElement('label');L.textContent='Contenu';r.appendChild(L);
      const s=document.createElement('select');
      [['corps','Corps du composant'],['comp1','Composants (1er niveau)'],['all','Composants (tous niveaux)'],['parts','Pièces seules']].forEach(([k,l])=>{
        const o=document.createElement('option');o.value=k;o.textContent=l;if((sh.bom.lvl||'corps')===k)o.selected=true;s.appendChild(o);});
      s.onchange=()=>{mepEdit('nomenclature',()=>{sh.bom.lvl=s.value;});mepSideShow();};r.appendChild(s);
      if(sh.bom.lvl&&sh.bom.lvl!=='corps'){
        r=rowEl();
        mkBtn('Bulles automatiques',()=>{mepEdit('bulles',()=>{mepBalloonsAuto(sh);});mepSideShow();},'Une bulle par ligne de la nomenclature, sur la première vue « Assemblage » de la planche');
        mkBtn('Effacer les bulles',()=>{mepEdit('bulles',()=>{sh.balloons=[];});mepSideShow();},'Retire toutes les bulles de la planche');
        mkBtn(mepSt.blAdd?'＋ Bulle (actif)':'＋ Bulle',()=>{mepSt.blAdd=!mepSt.blAdd;
          mepStatus(mepSt.blAdd?'＋ Bulle : cliquez une pièce dans une vue « Assemblage » (Échap pour finir).':'＋ Bulle terminé.');mepSideShow();},
          'Ajoute une bulle sur la pièce cliquée ; une bulle se glisse, Suppr la retire');
      }
    }
    if(sh.bom&&sh.bom.on){
      mepBomRows(sh).forEach(q=>{
        r=rowEl();
        const L=document.createElement('label');L.textContent=q.rep+'. '+q.name+(q.qty>1?' ×'+q.qty:'');r.appendChild(L);
        const i=document.createElement('input');i.placeholder='Matière';i.value=(sh.bom.mat&&sh.bom.mat[q.ids[0]])||'';
        i.onchange=()=>mepEdit('nomenclature',()=>{if(!sh.bom.mat)sh.bom.mat={};sh.bom.mat[q.ids[0]]=i.value;});r.appendChild(i);
      });
    }
    /* — dessin — */
    h('Dessin 2D');
    r=rowEl();
    [['▲','select','Sélection / déplacement'],['━','line','Ligne'],['▭','rect','Rectangle'],
     ['○','circle','Cercle'],['◠','arc','Arc (3 points)'],['·','point','Point']].forEach(([lab,t,tip])=>{
      const b=mkBtn(lab,()=>mepSetTool(t),tip);
      b.className=mepSt.tool===t?'active':'';
      b.style.flex='1';
    });
    r=rowEl();
    [['✂','trim','Ajuster (trim)'],['T','text','Texte ou champ'],['📏','dim','Cote (outil unique)'],['Perçage','hole','Cotation perçage (Ø, lamage, fraisure, taraudage)'],['Axes','axis','Traits d’axe (trou, alignement, cercle, libre)'],['Note','note','Note à flèche : pointe, puis texte libre souligné'],['Ord. X','ordx','Cotation d’ordonnées suivant X : origine « 0 » puis les points'],['Ord. Y','ordy','Cotation d’ordonnées suivant Y : origine « 0 » puis les points']].forEach(([lab,t,tip])=>{
      const b=mkBtn(lab,()=>mepSetTool(t),tip);
      b.className=mepSt.tool===t?'active':'';
      b.style.flex='1';
    });
    r=rowEl();
    {const b=mkBtn('Coter les perçages',()=>{mepAutoHoles();mepSideShow();},'Étiquette automatique de chaque fonction Perçage (n× si plusieurs trous) — vue sélectionnée, sinon toute la planche');b.style.flex='1';r.appendChild(b);}
    h('Axes');
    r=rowEl();
    [['Trou','hole'],['Alignement','align'],['Cercle','pitch'],['Libre','free'],['Symétrie','sym']].forEach(([lab,m])=>{
      const b=document.createElement('button');
      b.textContent=lab;
      b.className=(mepSt.tool==='axis'&&mepSt.axisMode===m)?'active':'';
      b.onclick=e=>{e.stopPropagation();mepSetAxisMode(m);};
      b.style.flex='1';
      r.appendChild(b);
    });
    /* — écriture (ISO 3098) — */
    h('Écriture (ISO 3098)');
    [['Cotes','dimH'],['Repères, titres de vue','lblH'],['Nouveaux textes','noteH']].forEach(([lab,k])=>{
      r=rowEl();const L=document.createElement('label');L.textContent=lab+' h (mm)';r.appendChild(L);
      r.appendChild(mepIsoSelect(MEP_TEXT_STYLE[k],v=>{
        MEP_TEXT_STYLE[k]=v;mepDimStyleSave();mepApplyDimStyle();mepRender();
        mepStatus('Écriture : '+lab.toLowerCase()+' h = '+mepFmtNum(v,2).replace('.',',')+' mm');
      }));
    });
    r=rowEl();
    {const b=mkBtn('Valeurs ISO (3,5 / 5 / 3,5)',()=>{
      MEP_TEXT_STYLE.dimH=3.5;MEP_TEXT_STYLE.lblH=5;MEP_TEXT_STYLE.noteH=3.5;
      mepDimStyleSave();mepApplyDimStyle();mepSideShow();mepRender();mepStatus('Écriture : valeurs ISO usuelles.');
    },'Cotes et textes 3,5 mm, repères et titres de vue 5 mm');b.style.flex='1';r.appendChild(b);}
    {const n=document.createElement('div');n.className='note';
     n.textContent='h = hauteur des majuscules. Série ISO 3098 : 1,8 · 2,5 · 3,5 · 5 · 7 · 10 · 14 · 20 (rapport √2). Cotes et notes : 3,5 usuel, 2,5 mini (1,8 toléré en A4). Repères de coupe et titres de vue : un cran au-dessus. Même hauteur pour toutes les cotes d’un dessin.';
     root.appendChild(n);}
    /* — cotation — */
    h('Cotation');
    const dimRow=(lab,el)=>{
      r=rowEl();
      const L=document.createElement('label');L.textContent=lab;
      r.appendChild(L);r.appendChild(el);
      return r;
    };
    const dimNum=(lab,key,min,max,step,unit)=>{
      const i=document.createElement('input');
      i.type='number';i.min=min;i.max=max;i.step=step;
      i.value=MEP_DIM_STYLE[key];
      i.onchange=()=>{
        let v=parseFloat(i.value);
        if(!Number.isFinite(v))v=MEP_DIM_STYLE[key];
        v=Math.min(max,Math.max(min,v));
        MEP_DIM_STYLE[key]=v;i.value=v;
        mepDimStyleSave();mepApplyDimStyle();mepRender();
        mepStatus('Cotes : '+lab.toLowerCase()+' = '+mepFmtNum(v,2)+(unit||''));
      };
      dimRow(lab+(unit?' ('+unit+')':''),i);
    };
    // couleur des cotes : celle du thème (défaut) ou une couleur libre ; l'export et
    // l'impression la gardent (option « Export PDF / SVG : Noir » pour le plan ISO noir)
    const thm=!MEP_DIM_STYLE.color||MEP_DIM_STYLE.color==='theme';
    const dimTh=document.createElement('input');dimTh.type='checkbox';dimTh.id='mepDimColTheme';dimTh.checked=thm;
    const dimCol=document.createElement('input');
    dimCol.type='color';dimCol.value=thm?'#0a84ff':MEP_DIM_STYLE.color;dimCol.disabled=thm;
    const onCol=()=>{
      MEP_DIM_STYLE.color=dimTh.checked?'theme':dimCol.value;dimCol.disabled=dimTh.checked;
      mepDimStyleSave();mepApplyDimStyle();mepRender();
    };
    dimCol.oninput=onCol;dimCol.onchange=onCol;dimTh.onchange=onCol;
    const thL=document.createElement('label');thL.style.cssText='flex:none;display:flex;gap:4px;align-items:center';
    thL.appendChild(dimTh);thL.appendChild(document.createTextNode('thème'));
    const colRow=dimRow('Couleur',dimCol);colRow.appendChild(thL);
    { // hauteur du texte des cotes (V0.23.5) : valeur libre, la même que « Écriture → Cotes h » (liste ISO)
      const i=document.createElement('input');i.type='number';i.id='mepDimHIn';i.min=1.8;i.max=20;i.step=0.1;i.value=MEP_TEXT_STYLE.dimH;
      i.title='Hauteur des majuscules des cotes (mm) — série ISO 3098 : 2,5 · 3,5 · 5 · 7 ; toute valeur de 1,8 à 20 est acceptée';
      i.onchange=()=>{
        let v=parseFloat(String(i.value).replace(',','.'));
        if(!Number.isFinite(v))v=MEP_TEXT_STYLE.dimH;
        v=Math.round(Math.min(20,Math.max(1.8,v))*100)/100;
        MEP_TEXT_STYLE.dimH=v;mepTextStyleSync();
        mepDimStyleSave();mepApplyDimStyle();mepSideShow();mepRender();
        mepStatus('Cotes : hauteur du texte = '+mepFmtNum(v,2).replace('.',',')+' mm');
      };
      dimRow('Hauteur du texte (mm)',i);
    }
    dimNum('Angle des flèches','arrowAngle',10,90,1,'°');
    dimNum('Longueur des flèches','arrowLen',2,30,0.5,'mm');
    r=rowEl();
    const bDimReset=mkBtn('Réinitialiser',()=>{
      mepDimStyleReset();mepSideShow();mepRender();
      mepStatus('Style de cotation réinitialisé.');
    },'Rétablir la hauteur, la couleur et les flèches par défaut');
    bDimReset.style.flex='1';
    /* — paramètres (projet + session + fichier) — */
    h('Paramètres');
    {const n=document.createElement('div');n.className='note';
     n.textContent='Tous les réglages du plan (écriture, cotes, traits, export, papier, cadre et cartouche par défaut) sont enregistrés avec la pièce (.miniFusion) et gardés pour la session. Ouvrir une pièce reprend ses réglages. « Sauvegarder par défaut » : ces réglages sont repris à chaque nouvelle session et par chaque nouveau plan (une pièce qui a déjà les siens les garde).';
     root.appendChild(n);}
    r=rowEl();
    r.appendChild(mkBtn('Sauvegarder par défaut',()=>{mepPrefsDefSave();mepSideShow();},'Mémoriser tous les réglages actuels du plan comme réglages par défaut de ce navigateur : nouvelles sessions et nouveaux plans')).style.flex='1';
    {const b=mkBtn('Appliquer les défauts',()=>{if(mepPrefsDefApply()){mepSideShow();mepRender();mepStatus('Réglages par défaut appliqués à ce plan.');}},'Remplacer les réglages de ce plan par les réglages par défaut');
     b.style.flex='1';if(!mepPrefsDefGet()){b.disabled=true;b.title='Aucun réglage par défaut enregistré';}r.appendChild(b);}
    r=rowEl();
    r.appendChild(mkBtn('Exporter…',mepPrefsExport,'Sauvegarder les paramètres plan (+ bibliothèque de cartouches) dans un fichier .mfplan')).style.flex='1';
    r.appendChild(mkBtn('Importer…',mepPrefsImport,'Charger des paramètres plan depuis un fichier .mfplan (appliqués au projet et à la session)')).style.flex='1';
    /* — vue — */
    h('Vue');

    r=rowEl();
    const bGrid=mkBtn((mepSt.grid?'▣':'▢')+' grille',()=>{mepSt.grid=!mepSt.grid;mepSideShow();mepRender();},'Grille 10 mm');
    bGrid.style.flex='1';
    const bZRev=mkBtn((mepSt.zoomRev?'▣':'▢')+' zoom ↕',()=>{
      mepSt.zoomRev=!mepSt.zoomRev;
      try{ localStorage.setItem('minifusion_mepZoomRev',mepSt.zoomRev?'1':'0'); }catch(e){}
      mepSideShow();
    },'Inverser le sens du zoom de la molette (haut = avant ou arrière)');
    bZRev.style.flex='1';
    mkBtn('−',()=>mepZoomBy(1/1.3),'Zoom arrière').style.flex='1';
    mkBtn('Ajuster',()=>{mepFitSheet();mepRender();},'Tout la feuille').style.flex='1';
    mkBtn('+',()=>mepZoomBy(1.3),'Zoom avant').style.flex='1';
    /* — sorties — */
    h('Sortie');
    r=rowEl();
    mkBtn('⟳ Rejeter',()=>{mepReproject(null);mepStatus('Toutes les vues rejetées.');},'Rejeter toutes les vues').style.flex='1';
    mkBtn('SVG',mepExportSvg,'Exporter la planche en SVG').style.flex='1';
    mkBtn('🖨',mepPrint,'Imprimer la planche').style.flex='1';
    mkBtn('PDF',()=>mepPrint(true),'PDF vectoriel au format exact de la planche (via « Enregistrer au format PDF »)').style.flex='1';
    mkBtn('DXF',mepExportDxf,'Exporter la planche en DXF R12 (calques CONTOUR, CACHE, AXE, COTES, CADRE…)').style.flex='1';
    const note=document.createElement('div');
    note.className='note';
    note.textContent=sh.views.length+' vue(s) · '+sh.dims.length+' cote(s) · outil actif : '+
      ({select:'sélection',line:'ligne',rect:'rectangle',circle:'cercle',arc:'arc',point:'point',trim:'ajuster',dim:'cote',hole:'cotation perçage',axis:'axes ('+(mepSt.axisMode||'hole')+')'}[mepSt.tool]||mepSt.tool);
    root.appendChild(note);
  }
  function mepSideView(root,v,sh){
    const h=document.createElement('h4');
    h.textContent=v.kind==='dxf'?'Vue DXF « '+((v.dxf&&v.dxf.name)||'?')+' »':v.kind==='section'?'Coupe '+(v.label||''):(v.kind==='detail'?'Détail '+(v.label||''):
      (v.kind==='proj'?'Projection '+(v.label||'')+' ('+((MEP_PROJ[v.proj||'']||{}).lab||'?')+')':'Vue '+(v.label||v.vk||'')));
    root.appendChild(h);
    const row=(lab,el)=>{
      const r=document.createElement('div');r.className='row';
      const L=document.createElement('label');L.textContent=lab;
      r.appendChild(L);if(el)r.appendChild(el);
      root.appendChild(r);
      return r;
    };
    // libellé
    const inp=document.createElement('input');
    inp.value=v.label||'';
    inp.onchange=()=>{mepEdit('libellé',()=>{v.label=inp.value;});};
    row('Libellé',inp);
    if(v.kind==='section'&&v.section&&v.section.pid){
      const nb=mepCutBreaks(v),r=row('Brisures ('+nb+')');
      const bA=document.createElement('button');bA.textContent='+ Brisure';bA.title='Ajoute une marche à l’équerre au milieu du dernier tronçon (la fin de la ligne est décalée)';
      bA.onclick=e=>{e.stopPropagation();mepEdit('brisure ajoutée',()=>mepCutAddBreak(sh,v));mepSideShow();};r.appendChild(bA);
      const bD=document.createElement('button');bD.textContent='− Brisure';bD.disabled=!nb;bD.title='Retire la dernière marche : la fin revient sur le plan précédent';
      bD.onclick=e=>{e.stopPropagation();mepEdit('brisure retirée',()=>mepCutDelBreak(sh,v));mepSideShow();};r.appendChild(bD);
      {const M=mepCutModel(v),nl=M?M.refs.filter(Boolean).length:0;
       const n=document.createElement('div');n.className='note';
       n.textContent='Liens : '+nl+' / '+(M?M.c.length:0)+' plan(s) accroché(s) à un centre de perçage, un trait d’axe ou une arête — la ligne suit la pièce. '
         +'Tirer sur un tronçon le déplace (il s’accroche au centre ou à la ligne visé(e)). Ctrl + clic : brise au curseur (Ctrl + tirer : place le morceau). Maj + clic : enlève la brisure la plus proche. Une marche glisse le long de la ligne.';
       root.appendChild(n);}
    }
    // échelle
    const sel=document.createElement('select');
    MEP_SCALES.slice().sort((a,b)=>b[0]-a[0]).forEach(([s,lab])=>{ // de 5:1 à 1:10
      const o=document.createElement('option');
      o.value=s;o.textContent=lab;
      if(Math.abs(s-v.scale)<1e-6)o.selected=true;
      sel.appendChild(o);
    });
    sel.onchange=()=>{mepEdit('échelle',()=>{v.scale=+sel.value;});};
    row('Échelle',sel);
    if(v.kind==='dxf'){
      const D=v.dxf||{},act=document.createElement('div');act.className='row';
      const bR=document.createElement('button');bR.textContent='Remplacer le DXF…';bR.title='Charger un autre DXF dans cette vue (cotes et position gardées)';bR.onclick=()=>mepDxfReplace(v);
      const bF=document.createElement('button');bF.textContent='Cadrer';bF.onclick=()=>mepFitViewContent(v);
      const bD=document.createElement('button');bD.textContent='Supprimer';bD.className='danger';bD.onclick=()=>mepDelView(v.id);
      [bR,bF,bD].forEach(b=>act.appendChild(b));root.appendChild(act);
      const n=document.createElement('div');n.className='note';
      n.textContent=(D.n||0)+' élément(s), '+mepFmtNum((D.bbox&&D.bbox.w)||0,1)+' × '+mepFmtNum((D.bbox&&D.bbox.h)||0,1)+' mm (vraie grandeur)'+
        mepDxfSkipText(D)+'. Cotes, axes, perçages et esquisse de planche (lignes, cercles…) s’y accrochent comme sur une vue projetée ; Détail possible.';
      root.appendChild(n);
      return;
    }
    // corps
    const body=document.createElement('select');
    const o0=document.createElement('option');o0.value='';o0.textContent='Assemblée';
    body.appendChild(o0);
    if(asmPlanOn()||v.asm){const oa=document.createElement('option');oa.value='__asm';oa.textContent='🧩 Assemblage (avec les composants)';if(v.asm)oa.selected=true;body.appendChild(oa);}
    try{
      (doc.bodies||[]).forEach(b=>{
        const o=document.createElement('option');
        o.value=b.id;o.textContent=b.name||b.id;
        if(v.bodyId===b.id)o.selected=true;
        body.appendChild(o);
      });
    }catch(e){}
    body.onchange=()=>{mepEdit('corps',()=>{v.asm=body.value==='__asm';v.bodyId=v.asm?null:(body.value||null);});};
    row('Corps',body);
    // cases
    const mkChk=(lab,key,id,after)=>{
      const c=document.createElement('input');c.type='checkbox';c.checked=!!v[key];
      if(id)c.id=id;
      c.onchange=()=>{mepEdit(lab,()=>{v[key]=c.checked;if(after)after(c.checked);});};
      row(lab,c);
      return c;
    };
    // rendu : fil de fer / cachées supprimées (défaut) / cachées en pointillé
    const modeSel=document.createElement('select');
    [['wire','Fil de fer (tout)'],['hide','Cachées supprimées'],['dash','Cachées en pointillé']].forEach(([k,l])=>{
      const o=document.createElement('option');
      o.value=k;o.textContent=l;
      if((v.mode||'hide')===k)o.selected=true;
      modeSel.appendChild(o);
    });
    modeSel.onchange=()=>{mepEdit('rendu',()=>{v.mode=modeSel.value;});};
    row('Rendu',modeSel);
    if(v.kind!=='section'&&v.kind!=='detail'){
      // ombrage, rendu 3D, rendu réaliste : une seule à la fois ; la case « Miroir » suit les rendus 3D
      const only=k=>on=>{if(on)['shade','render3d','real'].forEach(x=>{if(x!==k)v[x]=false;});setTimeout(()=>{try{mepSideShow();}catch(e){}},0);};
      mkChk('Ombrage (faces)','shade','mepChkShade',only('shade'));
      const chk3d=mkChk('Rendu 3D (image)','render3d','mepChkRender3d',only('render3d'));
      chk3d.title='Rendu de la vue depuis la 3D (couleurs et transparence des corps)';
      const chkR=mkChk('Rendu réaliste','real','mepChkReal',only('real'));
      chkR.title='Image de la vue comme le Rendu direct : ambiance et reflets de la fenêtre RENDU, matériau de rendu de chaque pièce (clic droit sur une pièce en 3D) — arêtes par-dessus';
      if(v.render3d||v.real){const cm=mkChk('Miroir','mirror','mepChkMirror');cm.title='Reflet de la pièce sous elle-même, estompé vers le bas (sans sol ni ombre)';}
    }
    // coupes locales (V0.23.7) : une ligne par coupe — changer l'arête du plan, supprimer
    (v.locals||[]).forEach((l,k)=>{
      const r=document.createElement('div');r.style.cssText='display:flex;gap:4px;align-items:center;flex:1';
      const t=document.createElement('span');t.style.flex='1';
      t.textContent='n° '+(k+1)+(l.lost?' ⚠':'');
      t.title='Plan de coupe parallèle à la vue, à la profondeur de l’arête choisie'+(Number.isFinite(l.ref&&l.ref.w)?' ('+mepFmtNum(l.ref.w,2)+' mm le long de la direction de vue)':'');
      if(l.lost)t.title='L’arête du plan n’est plus retrouvée : le dernier plan connu est gardé — « Arête… » pour en choisir une autre';
      const b=document.createElement('button');b.textContent='Arête…';b.title='Choisir une autre arête pour placer le plan de coupe';
      b.onclick=e=>{e.stopPropagation();mepBeginLocal(l.id);};
      const d=document.createElement('button');d.textContent='✕';d.title='Supprimer cette coupe locale';
      d.onclick=e=>{e.stopPropagation();mepEdit('suppression coupe locale',()=>{v.locals=v.locals.filter(q=>q!==l);if(!v.locals.length)delete v.locals;});mepRender();mepSideShow();};
      r.appendChild(t);r.appendChild(b);r.appendChild(d);row(k?'':'Coupes locales',r);
    });
    if(v.kind==='base'&&MEP_BASE_ORIENTS.indexOf(v.vk)>=0){
      // orientation : la vue principale peut regarder de droite, de gauche, de dessus… — les projections suivent
      const oSel=document.createElement('select');oSel.id='mepOrientSel';
      MEP_BASE_ORIENTS.forEach(k=>{const o=document.createElement('option');o.value=k;o.textContent=MEP_VIEWS[k].lab;oSel.appendChild(o);});
      oSel.value=v.vk;
      oSel.title='Direction d’observation de la vue principale ; ses projections (dessus, côtés…) sont recalculées et replacées';
      oSel.onchange=()=>{mepSetBaseOrient(v,oSel.value);mepSideShow();};
      row('Orientation',oSel);
    }
    if(v.kind==='base'){
      // projection oblique (cavalière) : angle et coefficient des fuyantes
      const pSel=document.createElement('select');pSel.id='mepOblSel';
      [['','Orthogonale'],['persp','Perspective (comme la 3D)'],['obl','Oblique (cavalière)']].forEach(([k,l])=>{const o=document.createElement('option');o.value=k;o.textContent=l;pSel.appendChild(o);});
      pSel.value=v.persp?'persp':(v.obl?'obl':'');
      pSel.onchange=()=>{mepEdit('projection',()=>{
        delete v.obl;delete v.persp;
        if(pSel.value==='obl')v.obl={a:45,k:0.5};
        if(pSel.value==='persp'){let f=35;try{if(camera&&camera.isPerspectiveCamera&&camera.fov>0)f=Math.round(camera.fov);}catch(e){}v.persp={fov:f};}
      });mepSideShow();};
      row('Projection',pSel);
      if(v.persp){
        const P=mepPerspOf(v),i=document.createElement('input');i.type='number';i.id='mepPerspFov';i.step='5';i.min='5';i.max='120';i.value=String(P.fov);
        i.title='Angle de champ de la perspective (°) : plus il est grand, plus les fuyantes convergent (la vue 3D : '+(()=>{try{return Math.round(camera.fov)+'°';}catch(e){return '?';}})()+')';
        i.onchange=()=>{const x=parseFloat(i.value);if(isFinite(x))mepEdit('fuyante',()=>{v.persp.fov=Math.max(5,Math.min(120,x));});};
        row('Fuyante (angle °)',i);
        const n=document.createElement('div');n.className='note';
        n.textContent='Perspective comme la vue 3D : le plan passant par le centre de la pièce reste en vraie grandeur. Arêtes exactes, parties cachées calculées sur le maillage ; les axes automatiques et les filetages conventionnels ne s’appliquent pas.';
        root.appendChild(n);
      }
      if(v.obl){
        const O=mepOblOf(v);
        const num=(id,val,step,title,fn)=>{const i=document.createElement('input');i.type='number';i.id=id;i.step=String(step);i.value=String(val);i.title=title;
          i.onchange=()=>{const x=parseFloat(i.value);if(isFinite(x))mepEdit('fuyante',()=>fn(x));};return i;};
        row('Angle fuyante (°)',num('mepOblA',O.a,15,'Angle des fuyantes depuis l’horizontale (cavalière : 45° ; 30° ou 60° possibles)',x=>{v.obl.a=x;}));
        row('Coef. fuyante',num('mepOblK',O.k,0.05,'Coefficient de réduction des fuyantes (0,5 usuel ; 1 = cavalière vraie grandeur)',x=>{if(x>0)v.obl.k=Math.min(2,x);}));
        const n=document.createElement('div');n.className='note';
        n.textContent='Plan de face en vraie grandeur, profondeur le long des fuyantes. HLR exact OCCT requis ; ombrage et rendu 3D suivent la projection ; les axes automatiques ne s’appliquent pas.';
        root.appendChild(n);
      }
    }
    mkChk('Arêtes tangentielles','tangent');
    const hlrChk=document.createElement('input');hlrChk.type='checkbox';
    hlrChk.checked=v.hlrExact!==false;
    hlrChk.onchange=()=>{mepEdit('HLR exact',()=>{v.hlrExact=hlrChk.checked;});};
    row('HLR exact OCCT',hlrChk);
    mkChk('Inverser (flip)','flip');
    const chkAxes=mkChk('Axes des perçages','autoAxes','mepChkAutoAxes');
    chkAxes.title='Croix ISO 15786 dans les trous vus de dessus, axes 04.1 et alignements';
    const chkPitch=mkChk('Cercles de perçage','autoPitch','mepChkAutoPitch');
    chkPitch.title='Cercle primitif 04.1 et axes radiaux des répartitions circulaires';
    if((v.axes||[]).length){
      const b=document.createElement('button');
      b.textContent='Effacer les axes manuels ('+v.axes.length+')';
      b.onclick=()=>{mepEdit('suppression axes manuels',()=>{v.axes=[];mepSt.selAxis=null;});mepSideShow();};
      row('Axes manuels',b);
    }
    // vue alignée sur sa mère (coupe, auxiliaire) : glissement contraint, déliable
    if(v.align||v._alignOff){
      const cb=document.createElement('input');cb.type='checkbox';cb.checked=!!v.align;
      cb.onchange=()=>{mepEdit('alignement vue',()=>{if(cb.checked){v.align=v._alignOff;delete v._alignOff;}else{v._alignOff=v.align;v.align=null;}});mepSideShow();};
      row('Alignée sur la mère',cb);
    }
    // actions
    const act=document.createElement('div');act.className='row';
    const bFit=document.createElement('button');bFit.textContent='Cadrer';
    bFit.onclick=()=>mepFitViewContent(v);
    const bRep=document.createElement('button');bRep.textContent='Rejeter';
    bRep.onclick=()=>{mepReproject(v.id);mepStatus('Vue rejetée.');};
    const bDel=document.createElement('button');bDel.textContent='Supprimer';bDel.className='danger';
    bDel.onclick=()=>mepDelView(v.id);
    [bFit,bRep,bDel].forEach(b=>act.appendChild(b));
    root.appendChild(act);
    const note=document.createElement('div');
    note.className='note';
    note.textContent=v.section?'Plan de coupe : normale '+mepRound(v.section.n):(v.kind==='detail'?'Détail ×'+mepFmtNum(v.scale,2):
      (v.kind==='proj'?'1er angle — glissement contraint, échelle liée à la mère':'dir '+mepRound(v.dir)));
    if(v.real&&v.kind!=='section'&&v.kind!=='detail')
      note.textContent+=' · rendu réaliste : image du Rendu direct (réglages RENDU) + arêtes';
    else if(v.render3d&&v.kind!=='section'&&v.kind!=='detail')
      note.textContent+=' · rendu 3D : image de la vue + arêtes, transparence par corps';
    else if(v.shade&&v.kind!=='section'&&v.kind!=='detail')
      note.textContent+=' · ombrage : couleur et transparence des corps reprises';
    root.appendChild(note);
  }
  function mepAxisExtDrop(v,id){
    if(v&&v.axExt)Object.keys(v.axExt).forEach(k=>{if(k.indexOf('m'+id+'.')===0)delete v.axExt[k];});
  }
  function mepSideAxisAuto(root,v,ak,sh){
    const h=document.createElement('h4');h.textContent='Axe automatique';root.appendChild(h);
    const note=document.createElement('div');note.className='note';
    note.textContent='Tirez une extrémité pour l’allonger ou le raccourcir · norme ISO 128-2 (04.1)';
    root.appendChild(note);
    const act=document.createElement('div');act.className='row';
    const b=document.createElement('button');b.textContent='Longueur d’origine';
    b.disabled=!(v.axExt&&v.axExt[ak]);
    b.onclick=()=>{mepEdit('longueur axe d’origine',()=>{if(v.axExt)delete v.axExt[ak];});mepSideShow();};
    act.appendChild(b);root.appendChild(act);
  }
  function mepSideAxis(root,v,a,sh){
    const h=document.createElement('h4');
    h.textContent={hole:'Axe de trou',align:'Axe commun',pitch:'Cercle de perçage',free:a.sym?'Axe de symétrie (figé)':'Axe libre',sym:'Axe de symétrie'}[a.kind]||'Axe';
    root.appendChild(h);
    const note=document.createElement('div');
    note.className='note';
    const n=a.kind==='hole'?1:(a.refs||[]).length;
    note.textContent=(a.kind==='free'?'Tracé libre':a.kind==='sym'?'Entre 2 droites — suit leurs déplacements':n+' trou(s)')+' · norme ISO 128-2 (04.1)';
    root.appendChild(note);
    const act=document.createElement('div');act.className='row';
    const bDel=document.createElement('button');bDel.textContent='Supprimer';bDel.className='danger';
    bDel.onclick=()=>{
      mepEdit('suppression axe',()=>{
        v.axes=(v.axes||[]).filter(x=>x.id!==a.id);mepAxisExtDrop(v,a.id);
        mepSt.selAxis=null;
      });
      mepSideShow();
    };
    if(a.kind!=='free'&&v.axExt&&Object.keys(v.axExt).some(k=>k.indexOf('m'+a.id+'.')===0)){
      const bOr=document.createElement('button');bOr.textContent='Longueur d’origine';
      bOr.title='Annule l’allongement des traits de cet axe';
      bOr.onclick=()=>{mepEdit('longueur axe d’origine',()=>mepAxisExtDrop(v,a.id));mepSideShow();};
      act.appendChild(bOr);
    }
    const bAll=document.createElement('button');bAll.textContent='Tous les axes manuels';
    bAll.onclick=()=>{
      mepEdit('suppression axes manuels',()=>{
        v.axes=[];
        mepSt.selAxis=null;
      });
      mepSideShow();
    };
    [bDel,bAll].forEach(b=>act.appendChild(b));
    root.appendChild(act);
  }
  /* éditeur de tolérance d'un objet porteur de .tol (cote, point d'ordonnée) — row(lab, el) */
  function mepTolEditor(row,d){
    const sel=document.createElement('select');
    [['','—'],['pm','± symétrique'],['dbl','Double'],['cls','Classe ISO 286']].forEach(([k,l])=>{
      const o=document.createElement('option');o.value=k;o.textContent=l;
      if((d.tol&&d.tol.m)===k||(k===''&&!d.tol))o.selected=true;
      sel.appendChild(o);
    });
    sel.onchange=()=>{
      mepEdit('tolérance',()=>{
        const m=sel.value;
        if(!m){d.tol=null;return;}
        d.tol={m,s:0.1,hi:0.1,lo:-0.1,cls:''};
      });
      mepSideShow();
    };
    row('Tolérance',sel);
    if(d.tol&&d.tol.m==='pm'){
      const s=document.createElement('input');s.type='number';s.step='0.01';s.value=d.tol.s;
      s.onchange=()=>{mepEdit('±',()=>{d.tol.s=+s.value||0;});};
      row('± mm',s);
    }
    if(d.tol&&d.tol.m==='dbl'){
      const hi=document.createElement('input');hi.type='number';hi.step='0.01';hi.value=d.tol.hi;
      hi.onchange=()=>{mepEdit('+',()=>{d.tol.hi=+hi.value||0;});};
      const lo=document.createElement('input');lo.type='number';lo.step='0.01';lo.value=d.tol.lo;
      lo.onchange=()=>{mepEdit('−',()=>{d.tol.lo=+lo.value||0;});};
      row('+',hi);row('−',lo);
    }
    if(d.tol&&d.tol.m==='cls'){
      const c=document.createElement('select');
      MEP_TOL_CLASSES.forEach(cl=>{
        const o=document.createElement('option');o.value=cl;o.textContent=cl||'—';
        if(d.tol.cls===cl)o.selected=true;
        c.appendChild(o);
      });
      c.onchange=()=>{mepEdit('classe',()=>{d.tol.cls=c.value;});};
      row('Classe',c);
    }
  }
  function mepSideDim(root,d,sh){
    const h=document.createElement('h4');
    h.textContent={len:'Longueur',dist:'Distance',rad:'Rayon',dia:'Diamètre',ang:'Angle',hole:'Cotation perçage',note:'Note',ord:'Cotation d’ordonnées '+String(d.axis||'x').toUpperCase()}[d.kind]||'Cote';
    root.appendChild(h);
    if(d.kind==='note'||d.kind==='ord'){
      const n=document.createElement('div');n.className='note';n.style.whiteSpace='pre-line';
      const r=document.createElement('div');r.className='row';
      const mk=(lab,fn,tip,cls)=>{const b=document.createElement('button');b.textContent=lab;b.title=tip||'';if(cls)b.className=cls;b.onclick=e=>{e.stopPropagation();fn();};r.appendChild(b);return b;};
      if(d.kind==='note'){
        n.textContent=(d.txt||'')+'\nDouble-clic ou « Texte… » pour le modifier ; glisser pour déplacer le texte.';
        mk('Texte…',()=>mepNoteEdit(sh,d),'Modifier le texte (plusieurs lignes possibles)');
      }else{
        n.textContent=(d.pts||[]).length+' point(s) depuis l’origine « 0 ». Glisser une valeur ou un trait : tout le groupe se déplace ; cliquer une valeur la désigne.';
        mk('+ Points',()=>{mepSt.selDim=d.id;mepSetTool(d.axis==='y'?'ordy':'ordx');},'Ajouter des valeurs à ce groupe : cliquez les points, Entrée termine (aussi : groupe sélectionné + outil Ordonnées)');
        const bU=mk('− Dernier',()=>{mepEdit('point d’ordonnée retiré',()=>{d.pts.pop();});mepSideShow();mepRender();},'Retirer le dernier point coté');bU.disabled=!(d.pts||[]).length;
        const op=mepSt.ordPt&&mepSt.ordPt.id===d.id?mepSt.ordPt.i:null;
        if(op!==null&&op>=0&&op<(d.pts||[]).length){
          const v=mepView(sh,d.vid);
          n.textContent+='\nPoint désigné : '+mepFmtNum(Math.abs(mepOrdValue(d,d.pts[op])),2)+' (Suppr pour le retirer).';
          mk('Supprimer ce point',()=>mepOrdDelPt(sh,d,op),'Retire la valeur désignée du groupe (Suppr)','danger');
          // tolérance de CETTE valeur seulement (2026-10-22-017)
          const tolBox=document.createElement('div');
          mepTolEditor((lab,el)=>{const rr=document.createElement('div');rr.className='row';const L=document.createElement('label');L.textContent=lab;rr.appendChild(L);if(el)rr.appendChild(el);tolBox.appendChild(rr);return rr;},d.pts[op]);
          root.appendChild(n);root.appendChild(tolBox);n.__done=1;
        }else if(op===-1)n.textContent+='\nOrigine « 0 » désignée : supprimez le groupe pour la retirer.';
      }
      if(!n.__done)root.appendChild(n);
      mk('Supprimer',()=>{mepEdit('suppression cote',()=>{sh.dims=sh.dims.filter(x=>x.id!==d.id);mepSt.selDim=null;});mepSideShow();},'','danger');
      root.appendChild(r);
      return;
    }
    const row=(lab,el)=>{
      const r=document.createElement('div');r.className='row';
      const L=document.createElement('label');L.textContent=lab;
      r.appendChild(L);if(el)r.appendChild(el);
      root.appendChild(r);
      return r;
    };
    const val=mepDimMeasure(sh,d);
    const read=document.createElement('div');
    read.className='note';
    read.style.whiteSpace='pre-line';
    read.textContent=mepDimText(d,val);
    root.appendChild(read);
    const pre=document.createElement('input');
    pre.type='text';pre.value=d.pre||'';pre.placeholder='ex. 2x';
    pre.onchange=()=>{mepEdit('texte avant',()=>{d.pre=pre.value.trim()||undefined;});};
    row('Texte avant',pre);
    const post=document.createElement('input');
    post.type='text';post.value=d.post||'';post.placeholder='ex. THRU';
    post.onchange=()=>{mepEdit('texte après',()=>{d.post=post.value.trim()||undefined;});};
    row('Texte après',post);
    mepTolEditor(row,d); // tolérance (aussi pour les perçages)
    if(d.kind!=='hole'){
    // référence
    const ref=document.createElement('input');ref.type='checkbox';ref.checked=!!d.ref;
    ref.onchange=()=>{mepEdit('référence',()=>{d.ref=ref.checked;});};
    row('Cote de référence',ref);
    }
    if(d.kind==='ang'){ // texte collé à l'arc : décalage le long de l'arc depuis le milieu
      const to=document.createElement('input');
      to.type='number';to.step='1';to.value=Math.round((+d.txtOff||0)*100)/100;
      to.onchange=()=>{
        let v=+to.value;if(!Number.isFinite(v))v=0;
        v=mepAngTxtOffSnap(v);
        mepEdit('décalage texte',()=>{d.txtOff=v||undefined;});
      };
      row('Décalage texte (mm)',to);
      const bc=document.createElement('button');bc.textContent='Centrer';
      bc.onclick=()=>{mepEdit('centrage texte',()=>{d.txtOff=undefined;});mepSideShow();mepRender();};
      row('',bc);
    }
    if(d.kind==='len'||d.kind==='dist'){
      const ba=document.createElement('button');
      ba.textContent=d.arr==='out'?'Flèches intérieures':'Flèches extérieures';
      ba.onclick=()=>{
        mepEdit('sens des flèches',()=>{d.arr=d.arr==='out'?'in':'out';});
        mepSideShow();mepRender();
      };
      row('Flèches',ba);
      const to=document.createElement('input');
      to.type='number';to.step='1';to.value=Math.round((+d.txtOff||0)*100)/100;
      to.onchange=()=>{
        let v=+to.value;
        if(!Number.isFinite(v))v=0;
        v=mepDimTxtOffSnap(sh,d,v);
        mepEdit('décalage texte',()=>{d.txtOff=v||undefined;});
      };
      row('Décalage texte (mm)',to);
      const bc=document.createElement('button');bc.textContent='Centrer';
      bc.onclick=()=>{
        mepEdit('centrage texte',()=>{d.txtOff=undefined;});
        mepSideShow();mepRender();
      };
      row('',bc);
    }
    const act=document.createElement('div');act.className='row';
    const bDel=document.createElement('button');bDel.textContent='Supprimer';bDel.className='danger';
    bDel.onclick=()=>{
      mepEdit('suppression cote',()=>{sh.dims=sh.dims.filter(x=>x.id!==d.id);mepSt.selDim=null;});
      mepSideShow();
    };
    act.appendChild(bDel);
    root.appendChild(act);
  }
