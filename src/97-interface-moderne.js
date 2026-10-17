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
}
function mfTheme(t){
  t=MF_THEMES.some(x=>x[0]===t)?t:'nuit';
  try{document.body.setAttribute('data-theme',t);}catch(e){}
  mf3D(t);
  mfLS('minifusion_theme',t);
  try{document.querySelectorAll('.mfThemeOpt').forEach(b=>b.classList.toggle('on',b.dataset.t===t));}catch(e){}
}
function mfUiMode(m){
  m=m==='moderne'?'moderne':'classique';
  try{document.body.classList.toggle('ui-modern',m==='moderne');}catch(e){}
  mfLS('minifusion_ui',m);
  try{const b=document.getElementById('mfUiBtn');if(b)b.textContent=m==='moderne'?'▦ Moderne':'▦ Classique';}catch(e){}
  if(m==='moderne'){try{mfBuildModern();mfWs(mfLS('minifusion_ws')||'cao');}catch(e){}}
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
  'body.ui-modern .mfM{display:flex!important}',
  'body.ui-modern .topbar>.tb,body.ui-modern .topbar>.hints{display:none!important}',
  'body.ui-modern .topbar{padding:6px 12px;margin-bottom:6px}',
  /* espaces CAO / FAO */
  '.mfWs{gap:2px;padding:2px;border-radius:9px;background:rgba(127,127,127,.12)}',
  '.mfWs button{padding:4px 14px;font-size:.78rem;border:none;background:none;border-radius:7px}',
  '.mfWs button.on{background:var(--primary);color:#fff}',
  '.mfQuick button{padding:4px 9px;font-size:.85rem;background:none;border:1px solid transparent}',
  '.mfSearch{position:relative;flex:1;max-width:340px}',
  '.mfSearch input{width:100%;padding:6px 10px;border-radius:8px;font-size:.8rem;background:rgba(127,127,127,.12);border:1px solid var(--border);color:var(--text)}',
  '.mfRes{position:absolute;top:calc(100% + 4px);left:0;right:0;max-height:340px;overflow:auto}',
  /* ruban */
  '#mfRibbon{gap:2px;align-items:stretch;flex-wrap:nowrap;overflow-x:auto;padding:6px 8px;margin-bottom:8px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius)}',
  '.mfGrp{display:flex;flex-direction:column;align-items:stretch;padding:0 4px;flex:none;border-right:1px solid var(--border)}',
  '.mfGrp:last-child{border-right:none}',
  '.mfGrpB{display:flex;gap:2px;flex:1}',
  '.mfGrpT{font-size:.6rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);text-align:center;margin-top:2px}',
  '.mfRb{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;min-width:46px;padding:3px 4px;white-space:nowrap;border:1px solid transparent;background:none;border-radius:8px;font-size:.66rem;line-height:1.1}',
  '.mfRb i{font-style:normal;font-size:1.25rem;line-height:1;display:flex;height:24px;align-items:center;opacity:.92}',
  '.mfRb:hover i{color:var(--primary);opacity:1}',
  '.mfQuick button,#mfThemeBtn{display:inline-flex;align-items:center;justify-content:center}',
  '.mfRb:hover{background:rgba(127,127,127,.14)}',
  'body.ui-modern[data-ws="cao"] #mfRibbon .mfFao,body.ui-modern[data-ws="fao"] #mfRibbon .mfCao{display:none}',
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
  'body.ui-modern[data-ws="fao"] #faoAddBar{display:none!important}',
  'body.ui-modern[data-ws="fao"] #faoWrap{left:4px!important;right:auto!important;top:40px!important;align-items:flex-start!important}',
  /* panneau Usinage à gauche : bouton de rabat sur son bord gauche, comme l'arbre */
  'body.ui-modern[data-ws="fao"] #faoTreeWrap{flex-direction:row!important}',
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
  'body.ui-modern aside.right>.panel:nth-child(2),body.ui-modern aside.right>.panel:nth-child(3){display:none}',
  /* cube de vue */
  '#mfCube{position:absolute;top:4px;right:4px;z-index:24;width:80px;height:80px}',
  '#mfCubeHome{position:absolute;top:2px;left:-18px;width:16px;height:16px;padding:0;font-size:10px;line-height:14px;border-radius:4px;background:rgba(40,44,52,.88)}'
  ].join('\n');
  document.head.appendChild(st);
}
/* ---------- bandeau : 🎨 thème + ▦ interface (les deux modes) ---------- */
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
  play:'<path d="M7 4l13 8-13 8z"/>',
  rapid:'<path d="M13 2L5 13h6l-1 9 8-12h-6z"/>',
  regen:'<path d="M20 11a8 8 0 0 0-14-5l-2 2M4 13a8 8 0 0 0 14 5l2-2"/><path d="M4 4v4h4M20 20v-4h-4"/>',
  gcode:'<path d="M6 3h9l3 3v15H6z"/><path d="M9 10h6M9 13h6M9 16h4"/>',
  theme:'<path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.8 2-2 0-1.3-1-1.6-1-2.6 0-1 .8-1.4 1.8-1.4H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>'
};
function mfI(k,size){const p=MF_IC[k];if(!p)return null;return '<svg viewBox="0 0 24 24" width="'+(size||20)+'" height="'+(size||20)+'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';}
/* ---------- mode moderne ---------- */
let mfBuilt=false;
function mfClick(id){const b=document.getElementById(id);if(b){b.click();return true;}try{faceEl.textContent='Commande indisponible ici ('+id+').';}catch(e){}return false;}
const MF_CAO=[
  ['Esquisse',[['sketch','Esquisse','btnSketch']]],
  ['Créer',[['extrude','Extrusion','btnExtrude'],['revolve','Révolution','btnRevolve'],['hole','Perçage','btnHole'],['body','Corps','btnBody']]],
  ['Modifier',[['fillet','Congé','btnFillet'],['chamfer','Chanfrein','btnChamfer'],['face','Face','btnMoveFace'],['draft','Dépouille','btnDraft'],['shell','Coque','btnCoque']]],
  ['Ensembles',[['pattern','Répétition','btnRepeat'],['combine','Combiner','btnCombine'],['params','Paramètres','btnParams']]],
  ['Fichier',[['import','Importer','btnImport'],['export','STEP','btnExportStep'],['export','STL','btnExportStl'],['export','OBJ','btnExportObj']]],
  ['Projet',[['new','Nouveau','btnNew'],['open','Ouvrir','btnLoad'],['saveas','Sous…','btnSaveAs']]]
];
const MF_FAO_ICON={facing:'facing',pocket:'pocket',contour:'contour',drill:'drill',rough3d:'rough3d',geofinish:'finish',pocket2:'pocket'};
function mfFaoAdd(type,nm){
  try{const op=faoOpDefaults(type);if(!op)return;const s=faoSetup();faoSnapshot('nouvelle opération « '+nm+' »');s.ops.push(op);faoChanged();faoSelectOp(s.id,op.id);}catch(e){}
}
function mfRibbon(){
  const rb=document.createElement('div');rb.id='mfRibbon';rb.className='mfM';
  const grp=(title,btns,cls)=>{const g=document.createElement('div');g.className='mfGrp '+cls;const bb=document.createElement('div');bb.className='mfGrpB';
    btns.forEach(([ic,lab,act,tip])=>{const b=document.createElement('button');b.className='mfRb';b.innerHTML='<i>'+(mfI(ic,22)||ic)+'</i>'+lab;
      const src=typeof act==='string'?document.getElementById(act):null;b.title=tip||(src&&src.title)||lab;
      b.onclick=()=>{typeof act==='function'?act():mfClick(act);};bb.appendChild(b);});
    g.appendChild(bb);const t=document.createElement('div');t.className='mfGrpT';t.textContent=title;g.appendChild(t);rb.appendChild(g);};
  MF_CAO.forEach(([t,bs])=>grp(t,bs,'mfCao'));
  // FAO : posage, opérations (mêmes fiches que la barre « + Usinage »), simulation, calcul, export
  grp('Posage',[['setup','Posage',()=>{const b=Array.from(document.querySelectorAll('#faoTreeWrap button')).find(x=>/\+ Posage/.test(x.textContent));if(b)b.click();},'Ajouter un posage'],['tools','Outils','faoToolsBtn']],'mfFao');
  let ops=[];try{ops=faoAddOpsSpec();}catch(e){}
  grp('Opérations',ops.map(a=>{const nm=String(a[1]).replace(/^\+ /,'');return [MF_FAO_ICON[a[0]]||'pocket',nm,()=>mfFaoAdd(a[0],nm),'Ajouter « '+nm+' » au posage courant'];}),'mfFao');
  grp('Simulation',[['play','Usinage','faoVwBtn'],['rapid','Rapides','faoRapBtn']],'mfFao');
  grp('Calcul',[['regen','Régénérer','faoGenBtn','Tout régénérer']],'mfFao');
  grp('Export',[['gcode','G-code','faoExportBtn']],'mfFao');
  return rb;
}
function mfWs(w){
  w=w==='fao'?'fao':'cao';
  try{document.body.setAttribute('data-ws',w);}catch(e){}
  mfLS('minifusion_ws',w);
  document.querySelectorAll('[data-mfws]').forEach(b=>b.classList.toggle('on',b.dataset.mfws===w));
  if(w==='fao'){try{const t=document.getElementById('faoToggle');const tw=document.getElementById('faoTreeWrap');if(tw&&tw.classList.contains('folded')&&t)t.click();}catch(e){}}
  try{mfPosTabs();}catch(e){}
}
function mfCommands(){
  // registre de la recherche : boutons des menus, du ruban et des commandes FAO
  const out=[],seen=new Set();
  const add=(label,fn,hint)=>{const k=label.toLowerCase();if(!label||seen.has(k))return;seen.add(k);out.push({label,fn,hint:hint||''});};
  document.querySelectorAll('.ddMenu button').forEach(b=>{const l=(b.textContent||'').replace(/\s+/g,' ').trim();add(l,()=>b.click(),b.title);});
  document.querySelectorAll('#mfRibbon .mfFao .mfRb').forEach(b=>{const l=(b.textContent||'').trim();add('FAO · '+l,()=>b.click(),b.title);}); // CAO : déjà dans les menus
  [['Annuler','btnUndo'],['Rétablir','btnRedo'],['Enregistrer','btnSave'],['Régénérer le modèle','btnRebuild'],['Auto-tests','btnSelfTest'],['Tout afficher (cadrer)','btnFit'],['Réglages de visualisation','btnSettings']].forEach(([l,id])=>add(l,()=>mfClick(id)));
  [['Vue iso','iso'],['Vue de dessus','top'],['Vue de face','front'],['Vue de droite','right']].forEach(([l,v])=>add(l,()=>{try{setView(v);}catch(e){}}));
  [['Espace CAO','cao'],['Espace FAO','fao']].forEach(([l,w])=>add(l,()=>mfWs(w)));
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
function mfBuildModern(){
  if(mfBuilt)return;mfBuilt=true;
  const top=document.querySelector('.topbar');if(!top)return;
  const brand=top.querySelector('.brand');
  // espaces + barre rapide + recherche, juste après le logo
  const ws=document.createElement('div');ws.className='mfWs mfM';
  [['cao','CAO','Modélisation : esquisses, solides'],['fao','FAO','Usinage : posages, opérations, simulation, G-code']].forEach(([k,l,t])=>{const b=document.createElement('button');b.textContent=l;b.title=t;b.dataset.mfws=k;b.onclick=()=>mfWs(k);ws.appendChild(b);});
  const q=document.createElement('div');q.className='mfQuick mfM';
  [['undo','Annuler (Ctrl+Z)','btnUndo'],['redo','Rétablir (Ctrl+Y)','btnRedo'],['save','Enregistrer','btnSave']].forEach(([ic,t,id])=>{const b=document.createElement('button');b.innerHTML=mfI(ic,18);b.title=t;b.onclick=()=>mfClick(id);q.appendChild(b);});
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
    [['cao','Modèle'],['fao','Usinage']].forEach(([k,l])=>{const b=document.createElement('button');b.textContent=l;b.dataset.mfws=k;b.onclick=()=>mfWs(k);bt.appendChild(b);});
    vp.appendChild(bt);}
  mfCube();
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
