/* ---------- Thèmes de couleur + interface « Moderne » (V0.2.1) ----------
   • Thème (🎨, dans les DEUX interfaces) : Nuit (actuel), Graphite, Atelier, Clair, Contraste —
     variables CSS sur <body data-theme>, mémorisé (localStorage).
   • Interface (▦) : « Classique » = l'interface actuelle, intacte ; « Moderne » = espaces CAO / FAO,
     ruban d'outils (icône + libellé), recherche de commandes (Ctrl+K), barre rapide (annuler,
     rétablir, enregistrer), navigateur à onglets (Modèle / Usinage, onglets de posages), barre
     d'état en bas, cube de vue. Le mode moderne n'AJOUTE que des éléments et des règles CSS sous
     body.ui-modern : chaque bouton du ruban clique le bouton d'origine (même code, même effet) ;
     revenir en classique retire la classe — rien n'est déplacé ni détruit. */
const MF_THEMES=[['nuit','Nuit (actuel)'],['graphite','Graphite'],['atelier','Atelier'],['clair','Clair'],['contraste','Contraste élevé']];
function mfLS(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;}
const MF_3D={nuit:[0x1c1c1e,0x141519,'#141416'],graphite:[0x202124,0x17181a,'#18191b'],atelier:[0x1c1915,0x141210,'#15130f'],clair:[0xe9ecf1,0xd7dbe2,'#e4e7ec'],contraste:[0x000000,0x050505,'#000']};
function mf3D(t){
  // fond de la scène, sol miroir et fond du canevas assortis au thème (Clair = vue 3D claire)
  const c=MF_3D[t]||MF_3D.nuit;
  try{if(scene&&scene.background&&scene.background.set)scene.background.set(c[0]);}catch(e){}
  try{if(mirrorU&&mirrorU.color)mirrorU.color.value.set(c[1]);mirrorDirty=true;}catch(e){}
  try{const v=document.getElementById('viewport');if(v)v.style.background=c[2];}catch(e){}
  // traits forts des esquisses en 3D : blanc (gris foncé en Clair)
  try{const col=typeof skStrong3D==='function'?skStrong3D():0xffffff;scene.traverse(o=>{if(o.material&&o.material.userData&&o.material.userData.skStrong)o.material.color.set(col);});}catch(e){}
}
function mfTheme(t){
  t=MF_THEMES.some(x=>x[0]===t)?t:'nuit';
  try{document.body.setAttribute('data-theme',t);}catch(e){}
  mf3D(t);
  mfLS('minifusion_theme',t);
  try{document.querySelectorAll('.mfThemeOpt').forEach(b=>b.classList.toggle('on',b.dataset.t===t));}catch(e){}
  try{if(typeof window.mepThemeApply==='function')window.mepThemeApply();}catch(e){} // espace PLAN : fond, papier, accent
}
function mfUiMode(m){
  m=m==='moderne'?'moderne':'classique';
  try{document.body.classList.toggle('ui-modern',m==='moderne');}catch(e){}
  if(m!=='moderne')try{document.body.removeAttribute('data-ws');}catch(e){}
  mfLS('minifusion_ui',m);
  try{const b=document.getElementById('mfUiBtn');if(b)b.textContent=m==='moderne'?'▦ Moderne':'▦ Classique';}catch(e){}
  if(m==='moderne'){try{mfBuildModern();mfWs(mfLS('minifusion_ws')||'cao');}catch(e){}}
  try{mfSkLayout();}catch(e){}
  try{if(typeof onResize==='function')onResize();else window.dispatchEvent(new Event('resize'));}catch(e){}
}
function mfCss(){
  if(document.getElementById('mfCss'))return;
  const st=document.createElement('style');st.id='mfCss';
  st.textContent=[
  /* --- thèmes --- */
  'body[data-theme="graphite"]{--bg:#202124;--surface:rgba(46,47,50,.94);--primary:#8ab4f8;--glow:rgba(138,180,248,.3);--accent:#81c995;--text:#e8eaed;--muted:#9aa0a6;--border:rgba(255,255,255,.1)}',
  'body[data-theme="atelier"]{--bg:#1a1714;--surface:rgba(42,37,32,.92);--primary:#ff9f0a;--glow:rgba(255,159,10,.32);--accent:#ffd60a;--text:#f7f1e8;--muted:#a89f92;--border:rgba(255,200,140,.12)}',
  'body[data-theme="clair"]{--bg:#e9ecf1;--surface:rgba(255,255,255,.94);--primary:#0a6cff;--glow:rgba(10,108,255,.22);--accent:#1a9e46;--warn:#b07b00;--text:#1c1c1e;--muted:#5f6368;--border:rgba(0,0,0,.12)}',
  'body[data-theme="clair"] button,body[data-theme="clair"] select,body[data-theme="clair"] input{background:rgba(0,0,0,.035);border-color:rgba(0,0,0,.16);color:var(--text)}',
  'body[data-theme="clair"] button.primary{background:var(--primary);color:#fff}',
  'body[data-theme="clair"] .ddMenu,body[data-theme="clair"] .mfPop{background:rgba(255,255,255,.98)!important;color:var(--text)}',
  'body[data-theme="clair"] .ddMenu button:hover{color:#fff}',
  /* menus contextuels (arbre, pièce 3D, esquisse) : fond clair en Clair (texte sombre lisible) */
  'body[data-theme="clair"] #ctxMenu,body[data-theme="clair"] #ctxMenu3D,body[data-theme="clair"] #skCtxMenu{background:rgba(255,255,255,.98)!important;color:#1c1c1e;border-color:rgba(0,0,0,.14)!important;box-shadow:0 12px 32px rgba(0,0,0,.18)!important}',
  'body[data-theme="clair"] #ctxMenu button,body[data-theme="clair"] #ctxMenu3D button,body[data-theme="clair"] #skCtxMenu button{color:#1c1c1e;background:none}',
  'body[data-theme="clair"] #ctxMenu button:hover,body[data-theme="clair"] #ctxMenu3D button:hover,body[data-theme="clair"] #skCtxMenu button:hover{background:var(--primary);color:#fff}',
  'body[data-theme="clair"] #ctx3DTitle,body[data-theme="clair"] #skCtxTitle{color:#5f6368!important}',
  /* fiche FAO (à droite) et panneau Usinage en Clair : textes FAO codés clairs → sombres */
  'body[data-theme="clair"] :is(aside.right,#faoTreeWrap) :is(.fao-lab,.fao-tab,.fao-tip,.fao-help,.fao-empty,.fao-note){color:#5f6368!important}',
  'body[data-theme="clair"] :is(aside.right,#faoTreeWrap) :is(.fao-opnum,.fao-title,.fao-h,.fao-tab:hover){color:#1c1c1e!important}',
  'body[data-theme="clair"] :is(aside.right,#faoTreeWrap) .fao-tab.on{color:#fff!important;background:#0a6cff!important;border-color:#0a6cff!important}',
  ':is(aside.right,#faoTreeWrap) .fao-tabs .fao-tab.on{color:#fff!important;background:#0a84ff!important;border-color:#0a84ff!important;font-weight:700!important}',
  'body[data-theme="clair"] :is(aside.right,#faoTreeWrap) .fao-card{background:rgba(0,0,0,.025)!important;border-color:rgba(0,0,0,.12)!important;border-left-color:rgba(10,108,255,.7)!important}',
  'body[data-theme="clair"] :is(aside.right,#faoTreeWrap) .fao-op .badge{color:#0f7a5c!important}',
  'body[data-theme="clair"] :is(aside.right,#faoTreeWrap) .fao-op .hbtn.on{color:#9a6700!important}',
  'body[data-theme="clair"] :is(aside.right,#faoTreeWrap) .fao-alert{color:#b45f00!important}',
  'body[data-theme="clair"] :is(aside.right,#faoTreeWrap) :is(.fao-in,.fao-sel){background:#fff!important;color:#1c1c1e!important;border-color:rgba(0,0,0,.18)!important}',
  'body[data-theme="clair"] :is(aside.right,#faoTreeWrap) .fao-mini{background:rgba(0,0,0,.04)!important;color:#1c1c1e!important;border-color:rgba(0,0,0,.16)!important}',
  'body[data-theme="clair"] :is(aside.right,#faoTreeWrap) .fao-check{color:#1c1c1e!important}',
  'body[data-theme="clair"] .fao-ctx{background:rgba(255,255,255,.98)!important;color:#1c1c1e!important;border-color:rgba(0,0,0,.16)!important;box-shadow:0 12px 32px rgba(0,0,0,.18)!important}',
  'body[data-theme="clair"] kbd,body[data-theme="clair"] .hints span{background:rgba(0,0,0,.05)}',
  /* Clair : la vue 3D est claire, ses panneaux aussi (arbre, barre de vues, réglages, FAO, onglets) */
  'body[data-theme="clair"] #treeOverlay,body[data-theme="clair"] #treeToggle,body[data-theme="clair"] #viewbar,body[data-theme="clair"] #setMenu,body[data-theme="clair"] #faoTreeWrap .fao-cnt,body[data-theme="clair"] #faoToggle,body[data-theme="clair"] #faoAddBar,body[data-theme="clair"] #faoViewerBar,body[data-theme="clair"] #mfBrTabs{background:rgba(255,255,255,.9)!important;color:#1c1c1e!important;border-color:rgba(0,0,0,.14)!important;box-shadow:0 6px 20px rgba(0,0,0,.12)!important}',
  'body[data-theme="clair"] #treeOverlay .ovlTitle,body[data-theme="clair"] #treeOverlay .ovlNote,body[data-theme="clair"] #setMenu .ovlTitle,body[data-theme="clair"] #setMenu label,body[data-theme="clair"] #setMenu .ovlNote,body[data-theme="clair"] #mfBrTabs button{color:#1c1c1e!important}',
  'body[data-theme="clair"] #treeOverlay .tgroup{color:#9a6700!important}',
  'body[data-theme="clair"] #mfBrTabs button.on{color:#fff!important}',
  'body[data-theme="clair"] #vpwrap{box-shadow:0 10px 30px rgba(0,0,0,.12)}',
  /* esquisse : bandeau d'outils et barre d'état OPAQUES (tous thèmes), couleurs du thème */
  '#skToolbar{background:var(--bg);background-image:linear-gradient(var(--surface),var(--surface));box-shadow:0 2px 10px rgba(0,0,0,.25);position:relative;z-index:2}',
  '#skStatus{background:var(--bg);background-image:linear-gradient(var(--surface),var(--surface))}',
  'body[data-theme="clair"] #sketchOverlay{background:rgba(233,236,241,.6)}',
  'body[data-theme="clair"] #skSide{background:rgba(255,255,255,.97);color:#1c1c1e}',
  'body[data-theme="clair"] #skSide .li{background:rgba(0,0,0,.04)}',
  /* dessin d'esquisse (pensé pour fond sombre) : inversé en Clair, teintes gardées */
  'body[data-theme="clair"] #skSvg{filter:invert(1) hue-rotate(180deg)}',
  'body[data-theme="clair"] #skToolbar .con{color:#1a9e46}',
  'body[data-theme="clair"] #skToolbar .con[data-con="construction"]{color:#6b6b70}',
  'body[data-theme="clair"] #skToolbar .tool.on,body[data-theme="clair"] #skToolbar .con.on{color:#fff}',
  'body[data-theme="contraste"]{--bg:#000;--surface:#0b0b0b;--primary:#00a8ff;--glow:rgba(0,168,255,.45);--accent:#00e676;--warn:#ffea00;--text:#fff;--muted:#d0d0d0;--border:rgba(255,255,255,.4)}',
  'body[data-theme="contraste"] button,body[data-theme="contraste"] select{border-color:rgba(255,255,255,.55)}',
  'body[data-theme]{background:radial-gradient(1200px 500px at 50% -10%,var(--glow),transparent),var(--bg)}',
  /* --- boutons communs (thème, interface) --- */
  '.mfTop{display:flex;gap:6px;align-items:center}',
  '.mfTop>button{padding:5px 10px;font-size:.78rem}',
  '.mfPop{position:absolute;z-index:7000;min-width:200px;padding:5px;background:rgba(28,28,32,.97);border:1px solid var(--border);border-radius:10px;box-shadow:0 14px 36px rgba(0,0,0,.5)}',
  '.mfPop button{display:flex;gap:8px;align-items:center;width:100%;text-align:left;background:none;border:none;padding:7px 10px;border-radius:7px;font-size:.82rem;color:inherit}',
  '.mfPop button:hover,.mfPop button.on{background:var(--primary);color:#fff}',
  '.mfSw{width:14px;height:14px;border-radius:4px;border:1px solid rgba(128,128,128,.5);flex:none}',
  /* --- éléments du mode moderne : invisibles en classique --- */
  '.mfM{display:none!important}',
  '.mfPropsOff{display:none!important}',
  'body.ui-modern .mfM{display:flex!important}',
  'body.ui-modern .topbar>.tb,body.ui-modern .topbar>.hints{display:none!important}',
  'body.ui-modern .topbar{padding:6px 12px;margin-bottom:6px}',
  /* espaces CAO / FAO */
  '.mfWs{gap:2px;padding:2px;border-radius:9px;background:rgba(127,127,127,.12)}',
  '.mfWs button{padding:4px 14px;font-size:.78rem;border:none;background:none;border-radius:7px}',
  '.mfWs button.on{background:var(--primary);color:#fff}',
  '.mfQuick button{padding:4px 9px;font-size:.85rem;background:none;border:1px solid transparent}',
  '.mfQsep{width:1px;align-self:stretch;margin:3px 4px;background:var(--border)}',
  '.mfSearch{position:relative;flex:1;max-width:340px}',
  '.mfSearch input{width:100%;padding:6px 10px;border-radius:8px;font-size:.8rem;background:rgba(127,127,127,.12);border:1px solid var(--border);color:var(--text)}',
  '.mfRes{position:absolute;top:calc(100% + 4px);left:0;right:0;max-height:340px;overflow:auto}',
  /* ruban */
  '#mfRibbon{gap:2px;align-items:stretch;flex-wrap:wrap;row-gap:4px;padding:6px 8px;margin-bottom:8px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius)}',
  '.mfGrp{display:flex;flex-direction:column;align-items:stretch;padding:0 4px;flex:none;border-right:1px solid var(--border)}',
  '.mfGrp:last-child{border-right:none}',
  '.mfGrpB{display:flex;gap:2px;flex:1}',
  '.mfGrpT{font-size:.6rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);text-align:center;margin-top:2px}',
  '.mfRb{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;min-width:46px;padding:3px 4px;white-space:nowrap;border:1px solid transparent;background:none;border-radius:8px;font-size:.66rem;line-height:1.1}',
  '.mfRb i{font-style:normal;font-size:1.25rem;line-height:1;display:flex;height:24px;align-items:center;opacity:.92}',
  '.mfRb:hover i{color:var(--primary);opacity:1}',
  '.mfQuick button,#mfThemeBtn{display:inline-flex;align-items:center;justify-content:center}',
  '.mfRb:hover{background:rgba(127,127,127,.14)}',
  'body.ui-modern[data-ws="cao"] #mfRibbon .mfFao,body.ui-modern[data-ws="cao"] #mfRibbon .mfPlan,body.ui-modern[data-ws="fao"] #mfRibbon .mfCao,body.ui-modern[data-ws="fao"] #mfRibbon .mfPlan,body.ui-modern[data-ws="plan"] #mfRibbon .mfCao,body.ui-modern[data-ws="plan"] #mfRibbon .mfFao{display:none}',
  /* navigateur : Modèle (arbre) / Usinage (posages) à gauche de la vue */
  '#mfBrTabs{position:absolute;top:10px;left:4px;z-index:23;gap:2px;padding:2px;border-radius:9px;background:rgba(16,18,22,.82);border:1px solid var(--border)}',
  '#mfBrTabs button{padding:3px 12px;font-size:.74rem;border:none;background:none;border-radius:7px;color:#e9e9ec}',
  '#mfBrTabs button.on{background:var(--primary);color:#fff}',
  'body.ui-modern #viewbar{left:auto;right:92px}',
  'body.ui-modern #viewbar>button[data-view],body.ui-modern #viewbar>#btnFit{display:none}',
  /* arbre : juste sous les onglets Modèle / Usinage (la barre de vues est partie à droite) */
  'body.ui-modern #treeOverlay,body.ui-modern #treeToggle{margin-top:40px!important}',
  /* menu ⚙ : il s'ouvre sous le bouton, à droite */
  'body.ui-modern #setMenu{left:auto!important;right:92px}',
  'body.ui-modern[data-ws="fao"] #treeWrap{display:none!important}',
  'body.ui-modern[data-ws="cao"] #faoWrap,body.ui-modern[data-ws="cao"] #faoTreeWrap{display:none!important}',
  'body.ui-modern[data-ws="plan"] #treeWrap,body.ui-modern[data-ws="plan"] #faoWrap,body.ui-modern[data-ws="plan"] #faoTreeWrap,body.ui-modern[data-ws="plan"] #faoAddBar{display:none!important}',
  'body.ui-modern[data-ws="fao"] #faoAddBar{display:none!important}',
  'body.ui-modern[data-ws="fao"] #faoWrap{left:0!important;right:auto!important;top:40px!important;align-items:flex-start!important}',
  /* panneau Usinage à gauche : bouton de rabat COPIÉ de celui de l'arbre (bord gauche, même
     forme, même place) — le panneau reste collé à gauche, replié ou non */
  'body.ui-modern[data-ws="fao"] #faoTreeWrap{flex-direction:row!important;align-self:flex-start!important}',
  'body.ui-modern[data-ws="fao"] #faoToggle{margin:0 0 0 4px!important;min-width:20px;height:88px;border-radius:0 10px 10px 0;border-left:none;writing-mode:vertical-rl;padding:6px 2px;font-size:inherit}',
  'body.ui-modern[data-ws="fao"] #faoTreeWrap .fao-cnt{margin-left:4px}',
  '#mfPosTabs{display:flex;gap:3px;flex-wrap:wrap;margin:0 0 6px}',
  '#mfPosTabs button{padding:3px 10px;font-size:.72rem;border-radius:7px}',
  '#mfPosTabs button.on{background:var(--primary);border-color:var(--primary);color:#fff}',
  'body:not(.ui-modern) #mfPosTabs{display:none}',
  /* barre d'état */
  '#mfStatus{gap:16px;align-items:center;padding:5px 12px;margin-top:6px;font-size:.72rem;color:var(--muted);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);white-space:nowrap;overflow:hidden}',
  '#mfStatus b{color:var(--text);font-weight:600}',
  '#mfStatus .mfSp{flex:1}',
  '#mfStatus button{padding:2px 9px;font-size:.7rem}',
  '#mfStMeas{overflow:hidden;text-overflow:ellipsis;max-width:46vw}',
  'body.ui-modern aside.right>.panel.mfHideM{display:none}', /* Mesure et État : repérés par leur titre (voir mfBuildModern) */
  /* esquisse (moderne) : bandeau d'esquisse à la place du ruban, panneau latéral à droite */
  'body.ui-modern.mf-sk #mfRibbon{display:none!important}',
  '#mfSkBar{margin-bottom:8px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius)}',
  '#mfSkBar #skToolbar{border-bottom:none;box-shadow:none;background:none;padding:6px 10px}',
  '#mfSkSidePanel #skSide{width:auto;background:none;border:none;padding:0;max-height:none;overflow:visible}',
  /* bandeau d'esquisse (moderne) : icône + nom, comme les rubans CAO / FAO, sur une ligne */
  '.mfSkLab{display:none}',
  'body.ui-modern.mf-sk #skToolbar{flex-wrap:wrap;overflow:visible;gap:2px;align-items:stretch;row-gap:4px}',
  'body.ui-modern.mf-sk #skToolbar #skClear{margin-left:auto}',
  'body.ui-modern.mf-sk #skTitle{display:none}',
  'body.ui-modern.mf-sk #skToolbar .tool,body.ui-modern.mf-sk #skToolbar .con,body.ui-modern.mf-sk #skToolbar #skZoomIn,body.ui-modern.mf-sk #skToolbar #skZoomOut,body.ui-modern.mf-sk #skToolbar #skFit,body.ui-modern.mf-sk #skToolbar #skRefs,body.ui-modern.mf-sk #skToolbar #skParams,body.ui-modern.mf-sk #skToolbar #skUndo,body.ui-modern.mf-sk #skToolbar #skRedo{flex-direction:column;gap:3px;min-width:37px;padding:4px 2px 3px;line-height:1;border-color:transparent;background:none;flex:none}',
  'body.ui-modern.mf-sk #skToolbar .tool:hover,body.ui-modern.mf-sk #skToolbar .con:hover{background:rgba(127,127,127,.14)}',
  'body.ui-modern.mf-sk #skToolbar .tool.on{background:var(--primary)}',
  'body.ui-modern.mf-sk #skToolbar .con.on{background:#30d158}',
  'body.ui-modern.mf-sk .mfSkLab{display:block;font-size:.58rem;font-weight:500;line-height:1;white-space:nowrap;color:var(--text);opacity:.85}',
  'body.ui-modern.mf-sk #skToolbar .tool.on .mfSkLab,body.ui-modern.mf-sk #skToolbar .con.on .mfSkLab{color:#fff;opacity:1}',
  'body.ui-modern.mf-sk #skToolbar .sksep{align-self:stretch;width:1px;margin:0 3px;background:var(--border)}',
  'body.ui-modern.mf-sk #skToolbar label{font-size:.66rem;flex:none;white-space:nowrap}',
  'body.ui-modern.mf-sk #skToolbar #skClear,body.ui-modern.mf-sk #skToolbar #skCancel,body.ui-modern.mf-sk #skToolbar #skOk{flex:none;align-self:center;padding:6px 10px;font-size:.76rem}',
  /* --- bandeaux ADAPTATIFS à la largeur d'écran --- */
  '@media (max-width:1700px){.mfRb{min-width:42px;font-size:.62rem}.mfRb i svg{width:20px;height:20px}body.ui-modern.mf-sk #skToolbar .tool,body.ui-modern.mf-sk #skToolbar .con{min-width:33px!important}body.ui-modern.mf-sk .mfSkLab{font-size:.54rem}}',
  '@media (max-width:1500px){.mfGrpT{display:none}.mfRb{min-width:38px;padding:3px 2px}body.ui-modern.mf-sk .mfSkLab{display:none!important}body.ui-modern.mf-sk #skToolbar .tool,body.ui-modern.mf-sk #skToolbar .con,body.ui-modern.mf-sk #skToolbar #skZoomIn,body.ui-modern.mf-sk #skToolbar #skZoomOut,body.ui-modern.mf-sk #skToolbar #skFit,body.ui-modern.mf-sk #skToolbar #skRefs,body.ui-modern.mf-sk #skToolbar #skParams,body.ui-modern.mf-sk #skToolbar #skUndo,body.ui-modern.mf-sk #skToolbar #skRedo{min-width:32px!important;padding:5px 3px!important}}',
  '@media (max-width:1200px){.mfRb{font-size:0;min-width:34px;gap:0}.mfRb i{height:22px}.mfSearch{max-width:200px}.mfQuick button{padding:4px 6px}}',
  '@media (max-width:900px){.mfSearch{display:none!important}.mfWs button{padding:4px 9px}}',
  /* cube de vue */
  '#mfCube{position:absolute;top:4px;right:4px;z-index:24;width:80px;height:80px}',
  '#mfCubeHome{position:absolute;top:2px;left:-18px;width:16px;height:16px;padding:0;font-size:10px;line-height:14px;border-radius:4px;background:rgba(40,44,52,.88)}'
  ].join('\n');
  document.head.appendChild(st);
}
/* ---------- bandeau : 🎨 thème + ▦ interface (les deux modes) ---------- */
function mfCloseMenus(){
  document.querySelectorAll('.mfPop.mfTmp').forEach(p=>p.remove());
  document.querySelectorAll('.dd.open').forEach(d=>d.classList.remove('open'));
  ['ctxMenu','ctxMenu3D','skCtxMenu','mepCtx'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none';});
  const sm=document.getElementById('setMenu');if(sm)sm.classList.remove('open');
}
function mfSyncPropsHost(){
  const p=document.getElementById('props');if(!p)return;
  const panel=p.closest?p.closest('.panel'):p.parentNode;if(!panel)return;
  const hide=document.body.classList.contains('mf-sk')||
    (typeof mepIsOpen==='function'&&mepIsOpen());
  panel.classList.toggle('mfPropsOff',!!hide);
}
function mfPop(anchor,items){
  document.querySelectorAll('.mfPop.mfTmp').forEach(p=>p.remove());
  const p=document.createElement('div');p.className='mfPop mfTmp';
  items.forEach(it=>{const b=document.createElement('button');b.innerHTML=it.html;if(it.cls)b.className=it.cls;if(it.data)Object.assign(b.dataset,it.data);b.onclick=e=>{e.stopPropagation();p.remove();it.fn();};p.appendChild(b);});
  document.body.appendChild(p);
  const r=anchor.getBoundingClientRect();p.style.top=(r.bottom+6+window.scrollY)+'px';p.style.left=Math.max(6,Math.min(window.innerWidth-p.offsetWidth-8,r.right-p.offsetWidth))+'px';
  setTimeout(()=>{const off=ev=>{if(!p.contains(ev.target)){p.remove();document.removeEventListener('pointerdown',off,true);}};document.addEventListener('pointerdown',off,true);},0);
  return p;
}
function mfTopButtons(){
  const top=document.querySelector('.topbar');if(!top||document.getElementById('mfThemeBtn'))return;
  const box=document.createElement('div');box.className='mfTop';box.id='mfTopBox';
  const th=document.createElement('button');th.id='mfThemeBtn';th.innerHTML=mfI('theme',16);th.title='Couleurs de l’interface';
  const SW={nuit:['#1c1c1e','#0a84ff'],graphite:['#2e2f32','#8ab4f8'],atelier:['#2a2520','#ff9f0a'],clair:['#e9ecf1','#0a6cff'],contraste:['#000','#00a8ff']};
  th.onclick=e=>{e.stopPropagation();const cur=document.body.getAttribute('data-theme')||'nuit';
    mfPop(th,MF_THEMES.map(([k,l])=>({html:'<span class="mfSw" style="background:linear-gradient(135deg,'+SW[k][0]+' 55%,'+SW[k][1]+' 55%)"></span>'+l,cls:'mfThemeOpt'+(k===cur?' on':''),data:{t:k},fn:()=>mfTheme(k)})));};
  const ui=document.createElement('button');ui.id='mfUiBtn';ui.title='Interface : Classique (actuelle) ou Moderne (espaces CAO/FAO, ruban, recherche, barre d’état, cube de vue)';
  ui.textContent=document.body.classList.contains('ui-modern')?'▦ Moderne':'▦ Classique';
  ui.onclick=e=>{e.stopPropagation();const m=document.body.classList.contains('ui-modern');
    mfPop(ui,[{html:'▦ Classique (actuelle)',cls:m?'':'on',fn:()=>mfUiMode('classique')},{html:'▦ Moderne',cls:m?'on':'',fn:()=>mfUiMode('moderne')}]);};
  box.appendChild(th);box.appendChild(ui);
  const pv=document.getElementById('prodVer');
  if(pv&&pv.parentNode===top){top.insertBefore(box,pv.nextSibling);}else top.appendChild(box);
}
/* ---------- icônes au trait (SVG 24×24, couleur du thème) ---------- */
const MF_IC={
  sketch:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
  extrude:'<path d="M4 15l8 4 8-4M4 15v-4l8-4 8 4v4M12 19v-8M4 11l8 4 8-4"/><path d="M12 7V2M9.5 4.5L12 2l2.5 2.5"/>',
  revolve:'<path d="M12 2v20" stroke-dasharray="2 2"/><ellipse cx="12" cy="13" rx="8" ry="3.2"/><path d="M17.5 8.5l2.2 2.4-3 .9"/>',
  hole:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  body:'<path d="M12 3l8 4v10l-8 4-8-4V7z"/><path d="M4 7l8 4 8-4M12 11v10"/>',
  fillet:'<path d="M4 20V12a8 8 0 0 1 8-8h8"/><path d="M4 20h16V4" stroke-dasharray="2 2"/>',
  chamfer:'<path d="M4 20V10l6-6h10"/><path d="M4 20h16V4" stroke-dasharray="2 2"/>',
  face:'<path d="M3 8l6-3v12l-6 3z"/><path d="M12 11h9M18 8l3 3-3 3"/>',
  draft:'<path d="M8 4h8l4 16H4z"/><path d="M12 4v16" stroke-dasharray="2 2"/>',
  shell:'<path d="M3 6v14h18V6"/><path d="M7 6v10h10V6"/>',
  pattern:'<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/>',
  combine:'<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>',
  params:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  import:'<path d="M12 3v11M8 10l4 4 4-4"/><path d="M4 16v4h16v-4"/>',
  export:'<path d="M12 14V3M8 7l4-4 4 4"/><path d="M4 16v4h16v-4"/>',
  new:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M12 11v6M9 14h6"/>',
  open:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  saveas:'<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/><path d="M17 15l3 3"/>',
  save:'<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
  undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
  redo:'<path d="M15 14l5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>',
  setup:'<path d="M3 19h18M6 19v-4h12v4"/><path d="M9 15V9h6v6"/><path d="M12 9V4" stroke-dasharray="2 2"/>',
  tools:'<path d="M10 3h4v8l-1 2v8h-2v-8l-1-2z"/><path d="M10 6l4 1.5M10 9l4 1.5"/>',
  facing:'<path d="M3 6h18v4H3v4h18v4H3"/>',
  pocket:'<rect x="3" y="4" width="18" height="16" rx="3"/><rect x="7.5" y="8.5" width="9" height="7" rx="1.5"/>',
  contour:'<rect x="6" y="7" width="12" height="10" rx="2"/><rect x="2.5" y="3.5" width="19" height="17" rx="4" stroke-dasharray="2.5 2"/>',
  drill:'<path d="M10 3h4v9l-2 5-2-5z"/><path d="M10 6.5l4 1.5M10 9.5l4 1.5"/><path d="M5 21h14"/>',
  rough3d:'<path d="M3 19l5-8 4 5 3-4 6 7z"/><path d="M3 14h4M14 9h7" stroke-dasharray="2 2"/>',
  finish:'<path d="M3 15c2-5 4-5 6 0s4 5 6 0 4-5 6 0"/><path d="M3 9h18" stroke-dasharray="2 2"/>',
  /* 2026-10-21-003 : Géodésique — surface (triangle arrondi) et passes concentriques
     depuis ses bords, en bleu de l'appli (même dessin que l'icône Fusion 360) */
  geodesic:'<path d="M12 3.2c.95 0 1.8.5 2.3 1.35l6.35 11.15c.95 1.7-.25 3.8-2.2 3.8H5.55c-1.95 0-3.15-2.1-2.2-3.8L9.7 4.55C10.2 3.7 11.05 3.2 12 3.2z"/><path d="M12 7.4c.5 0 .95.27 1.2.7l3.85 6.85c.5.9-.15 2-1.2 2H8.15c-1.05 0-1.7-1.1-1.2-2L10.8 8.1c.25-.43.7-.7 1.2-.7z" stroke="#0a84ff"/><path d="M12 11.2l1.9 3.4h-3.8z" stroke="#0a84ff" fill="#0a84ff" fill-opacity=".35"/>',
  play:'<path d="M7 4l13 8-13 8z"/>',
  rapid:'<path d="M13 2L5 13h6l-1 9 8-12h-6z"/>',
  regen:'<path d="M20 11a8 8 0 0 0-14-5l-2 2M4 13a8 8 0 0 0 14 5l2-2"/><path d="M4 4v4h4M20 20v-4h-4"/>',
  gcode:'<path d="M6 3h9l3 3v15H6z"/><path d="M9 10h6M9 13h6M9 16h4"/>',
  recent:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 10h18"/>',
  theme:'<path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.8 2-2 0-1.3-1-1.6-1-2.6 0-1 .8-1.4 1.8-1.4H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
  /* PLAN (98) */
  plan:'<rect x="3" y="4" width="18" height="14" rx="1"/><path d="M3 15h18M7 18v2M17 18v2M6 8h6M6 11h9"/>',
  section:'<rect x="3" y="4" width="18" height="14" rx="1"/><path d="M3 11h18" stroke-dasharray="3 2"/><path d="M8 7h3M13 15h3"/>',
  detail:'<circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L21 21"/><circle cx="10" cy="10" r="2.5"/>',
  ruler:'<path d="M3 8h18v8H3z"/><path d="M7 8v3M11 8v4M15 8v3M19 8v4"/>',
  dim:'<path d="M4 12h16M4 9v6M20 9v6"/><path d="M8 10l-2 2 2 2M16 10l2 2-2 2"/>',
  print:'<path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2"/><rect x="6" y="14" width="12" height="7"/>',
  sheet:'<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4M8 12h8M8 16h5"/>',
  camera:'<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  aux:'<path d="M3 19l6-10 4 6 3-5 5 9z"/><path d="M3 5h18" stroke-dasharray="3 2"/>',
  pSheetNew:'<path d="M5 3h9l4 4v14H5z"/><path d="M14 3v4h4"/><path d="M11.5 11v6M8.5 14h6"/>',
  pSheetDup:'<path d="M9 3h7l4 4v11H9z"/><path d="M16 3v4h4"/><path d="M5 7v14h11"/>',
  pTitle:'<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 13h18M11 13v7M16 13v7M11 16.5h10"/>',
  pViewBase:'<rect x="9" y="5" width="12" height="14" rx="1"/><circle cx="15" cy="12" r="2.5"/><path d="M2 12h4.5M4.5 10l2 2-2 2"/>',
  pViewProj:'<rect x="3" y="3" width="9" height="9" rx="1"/><rect x="15" y="3" width="6" height="9" rx="1" stroke-dasharray="2 1.6"/><rect x="3" y="15" width="9" height="6" rx="1" stroke-dasharray="2 1.6"/><path d="M12.5 7.5h2M7.5 12.5v2"/>',
  pViewIso:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
  pViewAux:'<path d="M3 21V11h6l4 4v6z"/><path d="M14 10l4.5-4.5 3 3L17 13z" stroke-dasharray="2 1.6"/><path d="M10.5 12.5l3-3"/>',
  pViewSection:'<path d="M3 6.5h18" stroke-dasharray="5 1.5 1 1.5"/><path d="M3 4v5M21 4v5" stroke-width="2.4"/><rect x="5" y="11" width="14" height="9" rx="1"/><path d="M7 20l7-9M11 20l7-9M15 20l4-5"/>',
  pViewDetail:'<circle cx="7.5" cy="8" r="4.5" stroke-dasharray="2 1.6"/><circle cx="15.5" cy="15.5" r="6"/><path d="M11 11l1.5 1.5"/><path d="M13 17.5l2.5-4 2.5 4"/>',
  pLine:'<path d="M5 19L19 5"/><circle cx="5" cy="19" r="1.8"/><circle cx="19" cy="5" r="1.8"/>',
  pRect:'<rect x="4" y="6" width="16" height="12"/><circle cx="4" cy="6" r="1.4"/><circle cx="20" cy="18" r="1.4"/>',
  pCircle:'<circle cx="12" cy="12" r="8"/><path d="M12 12l5.6-5.6"/><circle cx="12" cy="12" r="1.2"/>',
  pArc:'<path d="M4 17a8 8 0 0 1 16 0"/><circle cx="12" cy="17" r="1.2"/><circle cx="4" cy="17" r="1.4"/><circle cx="20" cy="17" r="1.4"/>',
  pPoint:'<circle cx="12" cy="12" r="2.4"/><path d="M12 3v5M12 16v5M3 12h5M16 12h5"/>',
  pTrim:'<circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="M8.5 8.8L20 18M8.5 15.2L20 6"/>',
  pText:'<path d="M5 7V4h14v3M12 4v16M9 20h6"/>',
  pDim:'<path d="M4 6v12M20 6v12M4 12h16"/><path d="M7.5 10L4.5 12l3 2M16.5 10l3 2-3 2"/>',
  pHole:'<circle cx="8" cy="16" r="5"/><path d="M11.5 12.5L16 8h6"/><path d="M17 3.5l3 3"/><circle cx="18.5" cy="5" r="1.8"/>',
  pHoles:'<circle cx="6" cy="17" r="3"/><circle cx="14" cy="17" r="3"/><path d="M16.2 14.8L20 11h2"/><path d="M3 5h8M3 8.5h6"/><path d="M14 5h3"/>',
  pSvg:'<path d="M6 3h9l3 3v15H6z"/><text x="12" y="17.6" font-size="6.2" font-family="sans-serif" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none">SVG</text>',
  pDxf:'<path d="M6 3h9l3 3v15H6z"/><text x="12" y="17.6" font-size="6.2" font-family="sans-serif" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none">DXF</text>',
  pPdf:'<path d="M6 3h9l3 3v15H6z"/><text x="12" y="17.6" font-size="6.2" font-family="sans-serif" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none">PDF</text>'
};
function mfI(k,size){const p=MF_IC[k];if(!p)return null;return '<svg viewBox="0 0 24 24" width="'+(size||20)+'" height="'+(size||20)+'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';}
/* ---------- mode moderne ---------- */
let mfBuilt=false;
function mfClick(id){mfCloseMenus();const b=document.getElementById(id);if(b){b.click();return true;}try{faceEl.textContent='Commande indisponible ici ('+id+').';}catch(e){}return false;}
const MF_CAO=[
  ['Esquisse',[['sketch','Esquisse','btnSketch']]],
  ['Créer',[['extrude','Extrusion','btnExtrude'],['revolve','Révolution','btnRevolve'],['hole','Perçage','btnHole'],['body','Corps','btnBody']]],
  ['Modifier',[['fillet','Congé','btnFillet'],['chamfer','Chanfrein','btnChamfer'],['face','Face','btnMoveFace'],['draft','Dépouille','btnDraft'],['shell','Coque','btnCoque']]],
  ['Ensembles',[['pattern','Répétition','btnRepeat'],['combine','Combiner','btnCombine'],['params','Paramètres','btnParams']]],
  ['Fichier',[['import','Importer','btnImport'],['export','STEP','btnExportStep'],['export','STL','btnExportStl'],['export','OBJ','btnExportObj']]]
];
const MF_FAO_ICON={facing:'facing',pocket:'pocket',contour:'contour',drill:'drill',rough3d:'rough3d',geofinish:'finish',geodesic:'geodesic',pocket2:'pocket'};
function mfFaoAdd(type,nm){
  try{const op=faoOpDefaults(type);if(!op)return;const s=faoSetup();faoSnapshot('nouvelle opération « '+nm+' »');s.ops.push(op);faoChanged();faoSelectOp(s.id,op.id);}catch(e){}
}
function mfRibbon(){
  const rb=document.createElement('div');rb.id='mfRibbon';rb.className='mfM';
  const grp=(title,btns,cls)=>{const g=document.createElement('div');g.className='mfGrp '+cls;const bb=document.createElement('div');bb.className='mfGrpB';
    btns.forEach(([ic,lab,act,tip])=>{const b=document.createElement('button');b.className='mfRb';b.innerHTML='<i>'+(mfI(ic,22)||ic)+'</i>'+lab;
      const src=typeof act==='string'?document.getElementById(act):null;b.title=tip||(src&&src.title)||lab;
      b.onclick=()=>{mfCloseMenus();typeof act==='function'?act():mfClick(act);};bb.appendChild(b);});
    g.appendChild(bb);const t=document.createElement('div');t.className='mfGrpT';t.textContent=title;g.appendChild(t);rb.appendChild(g);};
  MF_CAO.forEach(([t,bs])=>grp(t,bs,'mfCao'));
  // FAO : posage, opérations (mêmes fiches que la barre « + Usinage »), simulation, calcul, export
  grp('Posage',[['setup','Posage',()=>{const b=Array.from(document.querySelectorAll('#faoTreeWrap button')).find(x=>/\+ Posage/.test(x.textContent));if(b)b.click();},'Ajouter un posage'],['tools','Outils','faoToolsBtn']],'mfFao');
  let ops=[];try{ops=faoAddOpsSpec();}catch(e){}
  grp('Opérations',ops.map(a=>{const nm=String(a[1]).replace(/^\+ /,'');return [MF_FAO_ICON[a[0]]||'pocket',nm,()=>mfFaoAdd(a[0],nm),'Ajouter « '+nm+' » au posage courant'];}),'mfFao');
  grp('Simulation',[['play','Usinage','faoVwBtn'],['rapid','Rapides','faoRapBtn']],'mfFao');
  grp('Calcul',[['regen','Régénérer','faoGenBtn','Tout régénérer']],'mfFao');
  grp('Export',[['gcode','G-code','faoExportBtn']],'mfFao');
  // PLAN : ruban dédié (icônes PLAN + actions mepSetTool/mep*)
  const mepTool=t=>{try{mepSetActive(true);mepSetTool(t);}catch(e){}};
  grp('Planches',[['pSheetNew','Nouvelle',()=>{try{mepAddSheet();}catch(e){}},'Ajouter une planche'],
    ['pSheetDup','Dupliquer',()=>{try{const bs=document.querySelectorAll('#mepTabs .mepAdd');if(bs[1])bs[1].click();}catch(e){}},'Dupliquer la planche'],
    ['pTitle','Cartouche',()=>{try{mepSetActive(true);mepTbEdit();}catch(e){}},'Dessiner / éditer le cartouche (esquisse contrainte, champs matière, TTS, TTH…)']],'mfPlan');
  grp('Vues',[['pViewBase','Face',()=>{try{mepSetActive(true);mepAddViewStd('front');}catch(e){}},'Vue de base (face)'],
    ['pViewProj','Projection',()=>{try{mepBeginProjCmd();}catch(e){}},'Projections de la vue sélectionnée : déplacez la souris (droite, gauche, dessus, dessous ; diagonale = ISO) et cliquez — enchaînable, Échap termine'],
    ['pViewIso','ISO',()=>{try{mepSetActive(true);mepAddViewStd('iso');}catch(e){}},'Axonométrie isométrique'],
    ['camera','Caméra',()=>{try{mepAddCameraViewCmd();}catch(e){}},'Vue depuis la caméra 3D actuelle'],
    ['pViewAux','Auxiliaire',()=>{try{mepBeginAuxCmd();}catch(e){}},'Vue auxiliaire : cliquez une arête inclinée, puis placez la vue perpendiculairement'],
    ['pViewSection','Coupe',()=>{try{mepSetActive(true);mepBeginSectionCmd();}catch(e){}},'Vue en coupe : points de la ligne sur une vue (2, ou plus pour une coupe brisée à l’équerre), ✓ / Entrée pour valider, ↶ / Retour arrière pour reculer, puis placez la vue (le côté donne le sens du regard)'],
    ['pViewDetail','Détail',()=>{try{mepSetActive(true);mepBeginDetailCmd();}catch(e){}},'Vue de détail : centre, rayon, puis placement']],'mfPlan');
  grp('Dessin',[['pLine','Ligne',()=>mepTool('line'),'Ligne enchaînée (Échap termine)'],['pRect','Rectangle',()=>mepTool('rect')],
    ['pCircle','Cercle',()=>mepTool('circle')],['pArc','Arc',()=>mepTool('arc'),'Arc : centre, départ, arrivée'],
    ['pPoint','Point',()=>mepTool('point')],['pTrim','Ajuster',()=>mepTool('trim')],['pText','Texte',()=>mepTool('text'),'Texte libre ou champ (matière, TTS, TTH…)']],'mfPlan');
  grp('Cotes',[['pDim','Cote',()=>mepTool('dim'),'Outil cote unique : Ø, longueur, distance, angle'],
    ['pHole','Perçage',()=>mepTool('hole'),'Cotation perçage : Ø, lamage, fraisure, taraudage'],
    ['pHoles','Perçages auto',()=>{try{mepSetActive(true);mepAutoHoles();}catch(e){}},'Coter toutes les fonctions Perçage (n× si plusieurs trous) — vue sélectionnée, sinon toute la planche']],'mfPlan');
  grp('Sortie',[['pSvg','SVG',()=>{try{mepExport();}catch(e){}},'Exporter la planche en SVG'],
    ['pDxf','DXF',()=>{try{mepExportDxf();}catch(e){}},'Exporter la planche en DXF R12 (calques CONTOUR, CACHE, AXE, COTES, CADRE…)'],
    ['pPdf','PDF',()=>{try{mepPrint(true);}catch(e){}},'PDF vectoriel au format exact de la planche (« Enregistrer au format PDF »)'],
    ['print','Imprimer',()=>{try{mepPrint();}catch(e){}},'Imprimer la planche']],'mfPlan');
  return rb;
}
let mfWsCur=null;
const mfWsSel={cao:null,fao:null};
function mfSpaceSelSnap(){
  return {
    sel:(typeof sel!=='undefined'&&sel&&sel.kind)?Object.assign({},sel):{kind:null,id:null},
    treeSel:(typeof treeSel!=='undefined'&&Array.isArray(treeSel))?treeSel.slice():[]
  };
}
function mfSpaceSelValid(w,s){
  if(!s||!s.kind)return false;
  if(w==='fao')return s.kind==='faoSetup'||s.kind==='faoOp';
  return s.kind!=='faoSetup'&&s.kind!=='faoOp';
}
function mfSpaceDefaultFao(){
  try{
    const r=faoRoot();
    const id=r.activeSetupId||(r.setups&&r.setups[0]&&r.setups[0].id);
    return id?{kind:'faoSetup',id:id}:null;
  }catch(e){return null;}
}
function mfSpaceRestore(w,snap){
  let s=(snap&&snap.sel)||null;
  if(!mfSpaceSelValid(w,s))s=(w==='fao')?mfSpaceDefaultFao():{kind:null,id:null};
  sel=s?Object.assign({},s):{kind:null,id:null};
  treeSel=(w!=='fao'&&snap&&Array.isArray(snap.treeSel))?snap.treeSel.slice():[];
  try{if(typeof renderTree==='function')renderTree();}catch(e){}
  try{if(typeof renderProps==='function')renderProps();}catch(e){}
  try{if(typeof refreshParts==='function')refreshParts();}catch(e){}
  try{if(typeof faoRenderTree==='function')faoRenderTree();}catch(e){}
}
function mfWs(w){
  mfCloseMenus();
  w=(w==='fao'||w==='plan')?w:'cao';
  let prev=mfWsCur;
  if(!prev)try{prev=document.body.getAttribute('data-ws');}catch(e){}
  const changed=prev!==w;
  if(changed&&(prev==='cao'||prev==='fao'))mfWsSel[prev]=mfSpaceSelSnap();
  try{document.body.setAttribute('data-ws',w);}catch(e){}
  mfLS('minifusion_ws',w);
  document.querySelectorAll('[data-mfws]').forEach(b=>b.classList.toggle('on',b.dataset.mfws===w));
  if(w==='fao'){try{const t=document.getElementById('faoToggle');const tw=document.getElementById('faoTreeWrap');if(tw&&tw.classList.contains('folded')&&t)t.click();}catch(e){}}
  // espace PLAN (98-mise-en-plan.js) : overlay sur la vue 3D
  try{if(typeof mepSetActive==='function')mepSetActive(w==='plan');}catch(e){}
  if(changed&&w!=='plan')mfSpaceRestore(w,mfWsSel[w]);
  mfWsCur=w;
  try{mfPosTabs();}catch(e){}
  try{mfSyncPropsHost();}catch(e){}
  try{viewCenterShift();}catch(e){} // V0.2.5 : le pivot suit la zone visible (espace CAO/FAO)
}
function mfCommands(){
  // registre de la recherche : boutons des menus, du ruban et des commandes FAO
  const out=[],seen=new Set();
  const add=(label,fn,hint)=>{const k=label.toLowerCase();if(!label||seen.has(k))return;seen.add(k);out.push({label,fn,hint:hint||''});};
  document.querySelectorAll('.ddMenu button').forEach(b=>{const l=(b.textContent||'').replace(/\s+/g,' ').trim();add(l,()=>b.click(),b.title);});
  document.querySelectorAll('#mfRibbon .mfFao .mfRb').forEach(b=>{const l=(b.textContent||'').trim();add('FAO · '+l,()=>b.click(),b.title);}); // CAO : déjà dans les menus
  [['Annuler','btnUndo'],['Rétablir','btnRedo'],['Enregistrer','btnSave'],['Régénérer le modèle','btnRebuild'],['Auto-tests','btnSelfTest'],['Tout afficher (cadrer)','btnFit'],['Réglages de visualisation','btnSettings']].forEach(([l,id])=>add(l,()=>mfClick(id)));
  [['Vue iso','iso'],['Vue de dessus','top'],['Vue de face','front'],['Vue de droite','right']].forEach(([l,v])=>add(l,()=>{try{setView(v);}catch(e){}}));
  [['Espace CAO','cao'],['Espace FAO','fao'],['Espace PLAN','plan']].forEach(([l,w])=>add(l,()=>mfWs(w)));
  MF_THEMES.forEach(([k,l])=>add('Thème : '+l,()=>mfTheme(k)));
  add('Interface classique',()=>mfUiMode('classique'));
  return out;
}
function mfSearchBox(){
  const box=document.createElement('div');box.className='mfSearch mfM';
  const inp=document.createElement('input');inp.id='mfSearch';inp.placeholder='Rechercher une commande…  Ctrl+K';
  let res=null,list=[],idx=0;
  const close=()=>{if(res){res.remove();res=null;}};
  const draw=()=>{
    const q=inp.value.trim().toLowerCase();close();if(!q)return;
    const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
    const nq=norm(q);
    list=mfCommands().filter(c=>norm(c.label).indexOf(nq)>=0||norm(c.hint).indexOf(nq)>=0).slice(0,12);
    if(!list.length)return;idx=Math.min(idx,list.length-1);
    res=document.createElement('div');res.className='mfPop mfRes';
    list.forEach((c,i)=>{const b=document.createElement('button');b.textContent=c.label;if(i===idx)b.className='on';b.title=c.hint;b.onmousedown=e=>{e.preventDefault();close();inp.value='';inp.blur();c.fn();};res.appendChild(b);});
    box.appendChild(res);
  };
  inp.oninput=()=>{idx=0;draw();};
  inp.onkeydown=e=>{
    if(e.key==='ArrowDown'){idx=Math.min(idx+1,list.length-1);draw();e.preventDefault();}
    else if(e.key==='ArrowUp'){idx=Math.max(idx-1,0);draw();e.preventDefault();}
    else if(e.key==='Enter'){const c=list[idx];close();inp.value='';inp.blur();if(c)c.fn();}
    else if(e.key==='Escape'){close();inp.value='';inp.blur();}
    e.stopPropagation();
  };
  inp.onblur=()=>setTimeout(close,150);
  box.appendChild(inp);
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&(e.key==='k'||e.key==='K')&&document.body.classList.contains('ui-modern')){e.preventDefault();inp.focus();inp.select();}},true);
  return box;
}
function mfPosTabs(){
  // onglets de posages, en tête du panneau Usinage
  const tw=document.getElementById('faoTreeWrap');if(!tw)return;
  let bar=document.getElementById('mfPosTabs');
  if(!bar){bar=document.createElement('div');bar.id='mfPosTabs';const tr=document.getElementById('faoTree');if(tr&&tr.parentNode)tr.parentNode.insertBefore(bar,tr);else tw.appendChild(bar);}
  let r=null;try{r=faoRoot();}catch(e){}if(!r)return;
  const sig=r.setups.map(s=>s.id+':'+s.name).join('|')+'#'+r.activeSetupId;
  if(bar.dataset.sig===sig)return;bar.dataset.sig=sig;bar.innerHTML='';
  r.setups.forEach(s=>{const b=document.createElement('button');b.textContent=s.name;b.title='Posage '+s.name+' — '+(s.machine||'');if(s.id===r.activeSetupId)b.className='on';b.onclick=()=>{try{faoSelectSetup(s.id);}catch(e){}mfPosTabs();};bar.appendChild(b);});
  const p=document.createElement('button');p.textContent='＋';p.title='Ajouter un posage';p.onclick=()=>{const b=Array.from(document.querySelectorAll('#faoTreeWrap button')).find(x=>/\+ Posage/.test(x.textContent));if(b)b.click();bar.dataset.sig='';mfPosTabs();};bar.appendChild(p);
}
function mfStatusBar(){
  const sb=document.createElement('div');sb.id='mfStatus';sb.className='mfM';
  sb.innerHTML='<span id="mfStEng">Noyau…</span><span id="mfStMeas"></span><span class="mfSp"></span><span id="mfStSave"></span><button id="mfStRegen" title="Régénérer tout le modèle">⟳ Régénérer</button><span>mm</span><b id="mfStVer"></b>';
  sb.querySelector('#mfStRegen').onclick=()=>mfClick('btnRebuild');
  const upd=()=>{
    if(!document.body.classList.contains('ui-modern'))return;
    try{
      const o=(document.getElementById('occtState')||{}).textContent||'';
      const eng=/prêt/i.test(o)?('Noyau prêt · '+((typeof builtEngine!=='undefined'&&builtEngine)||'')):(o.replace(/^OCCT\s*:\s*/,'').slice(0,60));
      document.getElementById('mfStEng').textContent=eng;
      const f=((typeof faceEl!=='undefined'&&faceEl&&faceEl.textContent)||'').split('\n')[0];
      document.getElementById('mfStMeas').textContent=f;
      const st=(document.getElementById('stats')||{}).textContent||'';
      document.getElementById('mfStSave').textContent=/non sauvé/.test(st)?'● non enregistré':(/sauvé/.test(st)?'✓ enregistré':'');
      document.getElementById('mfStVer').textContent=(typeof APP_VER!=='undefined'?APP_VER:'');
      mfPosTabs();
    }catch(e){}
  };
  setInterval(upd,500);
  return sb;
}
/* cube de vue : suit la caméra ; clic sur une face = vue depuis cette face */
function mfViewDir(n){
  try{
    const t=controls.target.clone(),d=camera.position.distanceTo(t)||150;
    camera.position.set(t.x+n[0]*d,t.y+n[1]*d,t.z+n[2]*d);
    if(Math.abs(n[2])>0.99)camera.position.y-=d*1e-4; // dessus / dessous : léger biais (pas de pôle)
    controls.update();
  }catch(e){}
}
function mfCube(){
  // petit rendu three.js séparé : cube étiqueté qui suit l'orientation de la caméra ; clic sur une face
  const vp=document.getElementById('vpwrap');if(!vp||document.getElementById('mfCube'))return;
  const c=document.createElement('div');c.id='mfCube';c.className='mfM';
  const cv=document.createElement('canvas');cv.width=160;cv.height=160;cv.style.cssText='width:80px;height:80px;cursor:pointer';c.appendChild(cv);
  const h=document.createElement('button');h.id='mfCubeHome';h.textContent='⌂';h.title='Vue iso (tout afficher)';h.onclick=()=>{try{setView('iso');}catch(e){}};c.appendChild(h);
  vp.appendChild(c);
  let rd=null;try{rd=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});rd.setPixelRatio(1);rd.setSize(160,160,false);}catch(e){return;}
  const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(28,1,0.1,50);
  // ordre des faces BoxGeometry : +X, −X, +Y, −Y, +Z, −Z ; rot = rotation du texte (Z monde vers le haut)
  const FACES=[['DROITE',[1,0,0],Math.PI/2],['GAUCHE',[-1,0,0],-Math.PI/2],['ARRIÈRE',[0,1,0],Math.PI],['FACE',[0,-1,0],0],['DESSUS',[0,0,1],0],['DESSOUS',[0,0,-1],Math.PI]];
  const mats=FACES.map(([l,,rot])=>{
    const k=document.createElement('canvas');k.width=k.height=128;const x=k.getContext('2d');
    x.fillStyle='#2c313a';x.fillRect(0,0,128,128);x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=6;x.strokeRect(3,3,122,122);
    x.fillStyle='#e9e9ec';x.font='700 '+(l.length>6?19:22)+'px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(l,64,64);
    const t=new THREE.CanvasTexture(k);t.center.set(0.5,0.5);t.rotation=rot;
    return new THREE.MeshBasicMaterial({map:t});
  });
  const cube=new THREE.Mesh(new THREE.BoxGeometry(2,2,2),mats);sc.add(cube);
  const ax=new THREE.AxesHelper(1.6);ax.position.set(-1.02,-1.02,-1.02);sc.add(ax);
  let hov=-1;
  const pickF=e=>{const r=cv.getBoundingClientRect();const v=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
    const rc=new THREE.Raycaster();rc.setFromCamera(v,cam);const hh=rc.intersectObject(cube,false);return hh.length?hh[0].face.materialIndex:-1;};
  cv.addEventListener('pointermove',e=>{hov=pickF(e);cv.title=hov>=0?'Vue '+FACES[hov][0].toLowerCase():'';});
  cv.addEventListener('pointerleave',()=>{hov=-1;});
  cv.addEventListener('click',e=>{const k=pickF(e);if(k>=0)mfViewDir(FACES[k][1]);});
  const loop=()=>{
    requestAnimationFrame(loop);
    if(!document.body.classList.contains('ui-modern'))return;
    try{
      const d=camera.position.clone().sub(controls.target).normalize().multiplyScalar(7.5);
      cam.position.copy(d);cam.up.copy(camera.up);cam.lookAt(0,0,0);
      mats.forEach((m,i)=>m.color.set(i===hov?0x5aa9ff:0xffffff));
      rd.render(sc,cam);
    }catch(e){}
  };
  loop();
}
/* ---------- esquisse en interface moderne : plus de place pour dessiner ----------
   À l'ouverture d'une esquisse : le bandeau d'outils d'esquisse prend la place du ruban de
   modélisation (sous le bandeau du haut) et le panneau latéral (santé, sélection, contraintes,
   cotes) passe dans le panneau de droite. Fermeture / retour en classique : tout revient à sa
   place d'origine (mêmes nœuds, déplacés — leurs gestionnaires restent attachés). */
const MF_SK_LAB={select:'Sélection',line:'Ligne',rect:'Rectangle',slot:'Oblong',circle:'Cercle',arc:'Arc',cpoint:'Point',hpoint:'Perçage',project:'Projeter',dim:'Cote',coincident:'Coïncident',trim:'Ajuster',offset:'Décalage',chamfer:'Chanfrein',fillet:'Congé',
  h:'Horizontal',v:'Vertical',parallel:'Parallèle',perpendicular:'Perpend.',collinear:'Colinéaire',equal:'Égal',symmetric:'Symétrie',fix:'Fixe',tangent:'Tangence',coaxial:'Coaxial',midpoint:'Milieu',construction:'Constr.',
  skZoomIn:'Zoom +',skZoomOut:'Zoom −',skFit:'Cadrer',skRefs:'Arêtes',skParams:'Param.',skUndo:'Annuler',skRedo:'Rétablir'};
function mfSkLabels(){
  // libellé sous chaque icône (visible seulement dans le bandeau moderne) — icônes et couleurs inchangées
  document.querySelectorAll('#skToolbar button').forEach(b=>{
    const k=(b.dataset&&(b.dataset.tool||b.dataset.con))||b.id;const l=MF_SK_LAB[k];
    if(!l||b.querySelector('.mfSkLab'))return;
    const sp=document.createElement('span');sp.className='mfSkLab';sp.textContent=l;b.appendChild(sp);
  });
}
let mfSkMoved=null;
function mfSkLayout(){
  const ov=document.getElementById('sketchOverlay');if(!ov)return;
  const want=document.body.classList.contains('ui-modern')&&ov.classList.contains('open');
  const tb=document.getElementById('skToolbar'),side=document.getElementById('skSide');
  if(want&&!mfSkMoved&&tb&&side){
    mfSkMoved={tbP:tb.parentNode,tbN:tb.nextSibling,sdP:side.parentNode,sdN:side.nextSibling};
    const rb=document.getElementById('mfRibbon');
    const host=document.createElement('div');host.id='mfSkBar';
    (rb&&rb.parentNode?rb.parentNode:document.body).insertBefore(host,rb?rb.nextSibling:null);
    host.appendChild(tb);
    mfSkLabels();
    const right=document.querySelector('aside.right');
    const pnl=document.createElement('div');pnl.className='panel';pnl.id='mfSkSidePanel';
    const ttl=document.createElement('p');ttl.className='panel-title';ttl.textContent=((document.getElementById('skTitle')||{}).textContent||'Esquisse');pnl.appendChild(ttl);
    pnl.appendChild(side);
    if(right)right.insertBefore(pnl,right.firstChild);
    document.body.classList.add('mf-sk');
    try{mfSyncPropsHost();}catch(e){}
    try{window.dispatchEvent(new Event('resize'));}catch(e){}
  }else if(!want&&mfSkMoved){
    const m=mfSkMoved;mfSkMoved=null;
    try{m.tbP.insertBefore(tb,m.tbN&&m.tbN.parentNode===m.tbP?m.tbN:null);}catch(e){m.tbP.appendChild(tb);}
    try{m.sdP.insertBefore(side,m.sdN&&m.sdN.parentNode===m.sdP?m.sdN:null);}catch(e){m.sdP.appendChild(side);}
    const h=document.getElementById('mfSkBar');if(h)h.parentNode.removeChild(h);
    const pn=document.getElementById('mfSkSidePanel');if(pn)pn.parentNode.removeChild(pn);
    document.body.classList.remove('mf-sk');
    try{mfSyncPropsHost();}catch(e){}
    try{window.dispatchEvent(new Event('resize'));}catch(e){}
  }
}
function mfSkWatch(){
  const ov=document.getElementById('sketchOverlay');if(!ov||ov._mfObs)return;
  try{const o=new MutationObserver(()=>mfSkLayout());o.observe(ov,{attributes:true,attributeFilter:['class']});ov._mfObs=o;}catch(e){}
}
function mfBuildModern(){
  if(mfBuilt)return;mfBuilt=true;
  const top=document.querySelector('.topbar');if(!top)return;
  const brand=top.querySelector('.brand');
  // espaces + barre rapide + recherche, juste après le logo
  const ws=document.createElement('div');ws.className='mfWs mfM';
  [['cao','CAO','Modélisation : esquisses, solides'],['fao','FAO','Usinage : posages, opérations, simulation, G-code'],['plan','PLAN','Mise en plan : planches, vues projetées, cotes, dessin 2D']].forEach(([k,l,t])=>{const b=document.createElement('button');b.textContent=l;b.title=t;b.dataset.mfws=k;b.onclick=()=>mfWs(k);ws.appendChild(b);});
  const q=document.createElement('div');q.className='mfQuick mfM';
  [['undo','Annuler (Ctrl+Z)','btnUndo'],['redo','Rétablir (Ctrl+Y)','btnRedo']].forEach(([ic,t,id])=>{const b=document.createElement('button');b.innerHTML=mfI(ic,18);b.title=t;b.onclick=()=>mfClick(id);q.appendChild(b);});
  // V0.2.3 : TOUS les boutons de fichier à côté d'« Enregistrer » (src/97-fichiers-projets.js)
  const sp=document.createElement('span');sp.className='mfQsep';q.appendChild(sp);
  [['new','Nouveau projet',()=>mffNew()],['open','Ouvrir… (Ctrl+O)',()=>mffOpen()],['recent','Ouvrir récent',e=>mffRecentMenu(e.currentTarget)],
   ['save','Enregistrer (Ctrl+S)',()=>mffSave()],['saveas','Enregistrer sous… (Ctrl+Maj+S)',()=>mffSaveAs()],['folder','Dossier de projets',()=>mffFolderPanel()]].forEach(([ic,t,fn])=>{
    const b=document.createElement('button');b.innerHTML=mfI(ic,18);b.title=t;b.onclick=e=>{e.stopPropagation();fn(e);};q.appendChild(b);});
  const sx=mfSearchBox();
  const after=brand?brand.nextSibling:top.firstChild;
  [ws,q,sx].forEach(n=>top.insertBefore(n,after));
  // ruban sous le bandeau, barre d'état en bas
  top.parentNode.insertBefore(mfRibbon(),top.nextSibling);
  const lay=document.querySelector('.layout');
  if(lay&&lay.parentNode)lay.parentNode.insertBefore(mfStatusBar(),lay.nextSibling);
  // onglets du navigateur sur la vue
  const vp=document.getElementById('vpwrap');
  if(vp){const bt=document.createElement('div');bt.id='mfBrTabs';bt.className='mfM';
    [['cao','Modèle'],['fao','Usinage'],['plan','Plan']].forEach(([k,l])=>{const b=document.createElement('button');b.textContent=l;b.dataset.mfws=k;b.onclick=()=>mfWs(k);bt.appendChild(b);});
    vp.appendChild(bt);}
  mfCube();
  mfSkWatch();
  // panneaux « Mesure » et « État » (remplacés par la barre d'état) repérés par leur titre
  document.querySelectorAll('aside.right>.panel').forEach(pn=>{const t=pn.querySelector('.panel-title');if(t&&/^(Mesure|État)$/i.test(t.textContent.trim()))pn.classList.add('mfHideM');});
}
(function(){
  try{
    mfCss();
    mfTheme(mfLS('minifusion_theme')||'nuit');
    // la scène 3D naît plus tard (src/10, à l'init) : elle appelle mf3D elle-même une fois créée
    mfTopButtons();
    if(mfLS('minifusion_ui')==='moderne')mfUiMode('moderne');
  }catch(e){}
})();
