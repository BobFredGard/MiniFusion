/* ---------- FAO : fraisage 2.5D + post-processeurs CN ---------- */
// Module mené EN PARALLÈLE de la partie dessin : il ne touche à aucune géométrie.
// Il lit les corps affichés (bbox), génère des parcours outil (ébauche/finition
// 2.5D : surfaçage, poche, contour, perçage) et post-processe en
// G-code pour Siemens SINUMERIK 840D (variantes 630 / 1520, cf. PostPro/*.cps)
// et Fagor 8065 (cf. PostPro/fagor-8065.cps).
//
// Référence atelier CAV-75-25.mpf (T6 D=25 CR=2, S8000, F5000/6000, ZMIN=-24.108)
// — parcours détaillé conservé dans le changelog. L'ancienne opération
// « Débourrage » (`pocket3d`) a été SUPPRIMÉE : les anciens documents sont
// nettoyés à l'ouverture par `faoSanitiseOps` (aucune op orpheline).
//
// Conventions reprises des .cps de référence :
//  - Siemens : `; %_N_NOM_MPF`, G71/G17/G90/G94, G54, `T.. D..` + M6, S/M3,
//    arrosage M7 (général) / M8 (broche) / M9 (arrêt), rétraction
//    `G0 SUPA Z600 D0` + parc X machine (630 : X-200, 1520 : X-430),
//    perçages MCALL CYCLE81/83/84 (phase 2 — le MVP déroule en G0/G1), fin M30,
//    pas de numéros de séquence.
//  - Fagor 8065 : commentaires `( ... )`, `G71/G17/G90/G94`, G54,
//    `T.. D.. M06`, S/M03, arrosage M08/M09, plans inclinés `#CS` (phase 2 —
//    le MVP reste 3 axes outil vertical), fin M30, séquences N10 pas de 5.
// Les cycles et CYCLE800/#CS arrivent en phase 2, une fois les mouvements validés.
// Les arcs sont en IJK incrémental départ (accepté par 840D comme 8065, <180°).
//
// État : `doc.fao` (persisté via serialise/deserialise, voir
// 90-picking-mesure-import.js) — les modifications FAO ne touchent JAMAIS à
// _docVersion, donc aucun rejeu géométrique n'est déclenché (travail parallèle
// sans interférence avec la partie dessin).
// Moves : [{r:0|1, x, y, z}] — r=1 rapide (G0), r=0 usinage (G1) ; arc:{i,j,cw} -> G2/G3.

const FAO_VER='32j';

// 10-09-002 : distance minimale (mm) pour sauter en RAPIDE (lever + G0) —
// en deçà, la liaison reste un G1 à la cote (segClear). Sauter à chaque
// anneau pour quelques centimètres « c'est n'importe quoi » : on ne lève
// que si le trajet vaut vraiment le coup (>= 30 mm — 2026-10-11-001 :
// règle 50 → 30 à la demande : lever l'outil entre 2 entrées au-delà de 30).
const faoRapideMin=30;

/* ================= styles des panneaux FAO (injectés) =================
   La coque HTML/CSS du livrable généré n'est jamais éditée à la main — même
   discipline que cssRepSrc / cssTreeBody (40-interface-arbre-props.js). */
(function(){
  try{
    if(typeof document==='undefined'||document.getElementById('faoUiCss'))return;
    const st=document.createElement('style');st.id='faoUiCss';
    st.textContent=
      /* --- titres de section : trait qui court jusqu'au bord --- */
      '.fao-h{display:flex;align-items:center;gap:8px;font-weight:700;font-size:.7rem;'
      +'text-transform:uppercase;letter-spacing:.07em;color:#8e8e93;margin:14px 0 7px;'
      +'padding-bottom:5px;border-bottom:1px solid rgba(255,255,255,.1)}'
      +'.fao-h::after{content:"";flex:1;height:1px;'
      +'background:linear-gradient(90deg,rgba(255,255,255,.16),transparent)}'
      /* --- rangées de champs : label à gauche, contrôle à droite (style PLAN) --- */
      +'.fao-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:4px 0}'
      +'.fao-lab{flex:0 0 auto;color:var(--muted);font-size:.72rem;white-space:nowrap}'
      +'.fao-row>.fao-lab:first-child{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}'
      /* --- champs de saisie --- */
      +'.fao-in,.fao-sel{background:rgba(0,0,0,.34);border:1px solid rgba(255,255,255,.13);'
      +'border-radius:7px;color:#f5f5f7;font-size:.75rem;padding:4px 7px;min-width:0;'
      +'max-width:130px;box-sizing:border-box}'
      +'.fao-in:focus,.fao-sel:focus{outline:none;border-color:#0a84ff;'
      +'box-shadow:0 0 0 3px rgba(10,132,255,.25)}'
      +'.fao-in:disabled{opacity:.5}'
      /* --- 2026-10-14-011 : champs numériques SANS flèches (illisibles), valeur à droite --- */
      +'.fao-in[type=number]{-moz-appearance:textfield;appearance:textfield;text-align:right}'
      +'.fao-in[type=number]::-webkit-inner-spin-button,.fao-in[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}'
      /* --- onglets de la fiche d'opération --- */
      +'.fao-tabs{display:flex;flex-wrap:wrap;gap:2px;margin:8px 0 6px;border-bottom:1px solid rgba(255,255,255,.12)}'
      +'.fao-tab{background:none;border:none;border-bottom:2px solid transparent;color:rgba(255,255,255,.6);'
      +'font-size:.74rem;padding:5px 8px;cursor:pointer;border-radius:0}'
      +'.fao-tab:hover{color:#f5f5f7}'
      +'.fao-tab.on{color:#f5f5f7;border-bottom-color:#0a84ff}'
      // 2026-10-21-014 : onglet ACTIF lisible (retour : « illisible ») — fond plein
      // bleu, texte blanc gras ; prioritaire sur l'habillage des boutons du thème
      +'.fao-tabs .fao-tab.on,.fao-tabs .fao-tab.on:hover{background:#0a84ff!important;border-color:#0a84ff!important;color:#fff!important;font-weight:700!important;box-shadow:0 0 0 1px rgba(10,132,255,.55),0 0 8px rgba(10,132,255,.45)!important}'
      +'.fao-pair{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}'
      +'.fao-tip{font-size:.7rem;color:rgba(255,255,255,.58);line-height:1.4;margin-top:8px;'
      +'padding:6px 8px;border-radius:7px;background:rgba(255,255,255,.04);min-height:1.4em}'
      /* --- boutons compacts --- */
      +'.fao-mini{font-size:.7rem;padding:4px 9px;border-radius:7px;'
      +'border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.07);color:#f5f5f7}'
      +'.fao-mini:hover{border-color:#0a84ff;background:rgba(10,132,255,.2)}'
      /* --- texte d'aide sous un groupe de champs --- */
      +'.fao-help{font-size:.68rem;color:rgba(255,255,255,.5);line-height:1.35;'
      +'flex-basis:100%;margin-top:2px}'
      /* --- popup d'infos (clic droit sur le select Mode de l'Ébauche 3D) --- */
      +'.fao-ctx{position:fixed;z-index:60;max-width:340px;padding:8px 10px;'
      +'border-radius:9px;background:rgba(16,18,22,.97);border:1px solid rgba(255,255,255,.2);'
      +'color:#e9e9ec;font-size:.7rem;line-height:1.45;'
      +'box-shadow:0 12px 34px rgba(0,0,0,.55);cursor:default}'
      /* --- cartes (opérations, blocs d'information) --- */
      +'.fao-card{display:flex;flex-direction:column;gap:6px;'
      +'background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.028));'
      +'border:1px solid rgba(255,255,255,.1);border-left:3px solid rgba(10,132,255,.6);'
      +'border-radius:9px;padding:8px 9px;margin:6px 0}'
      +'.fao-card:hover{border-color:rgba(255,255,255,.18)}'
      /* --- alertes (alerte orange, faible densité, jamais brut) --- */
      +'.fao-alert{font-size:.7rem;color:#ff9f0a;line-height:1.4;padding:5px 8px;'
      +'border-radius:7px;background:rgba(255,159,10,.1);border:1px solid rgba(255,159,10,.35);margin:5px 0}'
      /* --- méta-info monospace (estimation, curseur outil) --- */
      +'.fao-meta{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.7rem;'
      +'color:rgba(255,255,255,.58)}'
      /* --- pastille cochable (modèle à usiner) --- */
      +'.fao-check{font-size:.74rem;display:inline-flex;gap:5px;align-items:center;cursor:pointer;'
      +'padding:3px 8px;border-radius:6px;background:rgba(255,255,255,.05);'
      +'border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.85)}'
      +'.fao-check:hover{border-color:rgba(10,132,255,.55);background:rgba(10,132,255,.14)}'
      /* --- absence d'info --- */
      +'.fao-empty{font-size:.72rem;color:rgba(255,255,255,.5);font-style:italic}'
      +'.fao-opnum{font-weight:700;font-size:.76rem;flex:1;color:#e9e9ec}'
      /* --- fenêtre flottante « Outils » --- */
      +'.fao-win{position:absolute;top:76px;left:50%;transform:translateX(-50%);z-index:40;'
      +'width:440px;max-height:72%;overflow-y:auto;padding:13px 15px;border-radius:13px;'
      +'background:rgba(16,18,22,.97);border:1px solid rgba(255,255,255,.18);color:#e9e9ec;'
      +'font-size:.78rem;box-shadow:0 18px 46px rgba(0,0,0,.6);backdrop-filter:blur(9px)}'
      +'.fao-win-h{display:flex;align-items:center;justify-content:space-between;gap:8px;'
      +'margin:0 0 8px;padding-bottom:7px;border-bottom:1px solid rgba(255,255,255,.1)}'
      +'.fao-win-t{font-weight:700;font-size:.8rem;color:#fff;letter-spacing:.03em}'
      +'.fao-win-x{font-size:.85rem;padding:1px 7px;border-radius:6px;background:transparent;'
      +'border:1px solid rgba(255,255,255,.18);color:rgba(255,255,255,.75);cursor:pointer}'
      +'.fao-win-x:hover{border-color:rgba(255,95,87,.7);color:#ff5f57;background:rgba(255,95,87,.16)}'
      /* --- bibliothèque d'outils (2026-10-15-010) --- */
      +'.fao-win.fao-toolwin{width:min(1040px,95%);max-height:88%;top:60px}'
      +'.fao-tl{display:flex;gap:14px;align-items:flex-start}'
      +'.fao-tl-left{width:240px;flex:none;display:flex;flex-direction:column;gap:8px}'
      +'.fao-tl-list{display:flex;flex-direction:column;gap:4px;max-height:60vh;overflow-y:auto}'
      +'.fao-tl-it{padding:7px 9px;border-radius:8px;cursor:pointer;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03)}'
      +'.fao-tl-it:hover{border-color:rgba(10,132,255,.5)}'
      +'.fao-tl-it.on{background:rgba(10,132,255,.2);border-color:#0a84ff}'
      +'.fao-tl-n{font-weight:700;font-size:.78rem;color:#fff}'
      +'.fao-tl-s{font-size:.68rem;color:rgba(255,255,255,.6);margin-top:2px}'
      +'.fao-tl-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px}'
      +'.fao-tl-body{flex:1;display:flex;gap:12px;align-items:flex-start;min-width:0}'
      +'.fao-tl-detail{flex:1;min-width:0}'
      +'.fao-tl-pic{flex:none;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:4px}'
      +'.fao-tl-h{font-weight:700;font-size:.74rem;color:#64d2ff;margin:10px 0 5px;letter-spacing:.02em}'
      +'.fao-tl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:5px 12px}'
      +'.fao-tl-f{display:flex;align-items:center;gap:6px;font-size:.74rem;color:rgba(255,255,255,.85)}'
      +'.fao-tl-f span{flex:1;white-space:nowrap}'
      +'.fao-tl-f input,.fao-tl-f select{flex:0 1 auto;min-width:0}'
      +'.fao-tl-f.wide input,.fao-tl-f.wide select{flex:1 1 140px}'
      +'.fao-tl-f em{font-style:normal;font-size:.64rem;color:rgba(255,255,255,.5);flex:none}'
      +'.fao-tl-f.def input{color:rgba(255,255,255,.5)}'
      /* --- arbre FAO --- */
      +'.fao-setup{font-weight:700;font-size:.76rem;margin:7px 0 3px;cursor:pointer;'
      +'padding:4px 7px;border-radius:7px;display:flex;gap:6px;align-items:center}'
      +'.fao-setup:hover{background:rgba(255,255,255,.07)}'
      +'.fao-setup .fao-tri{cursor:pointer;user-select:none;opacity:.72;font-size:.58rem;'
      +'padding:0 3px;border-radius:4px}'
      +'.fao-setup .fao-tri:hover{background:rgba(255,255,255,.12);opacity:1}'
      +'.fao-op{display:flex;gap:6px;align-items:center;padding:4px 7px 4px 14px;'
      +'border-radius:7px;cursor:pointer;font-size:.76rem}'
      +'.fao-op:hover{background:rgba(255,255,255,.07)}'
      +'.fao-op .lb{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
      +'.fao-op .eye{cursor:pointer;user-select:none}'
      +'.fao-op .badge{font-size:.68rem;color:#7ee0c0;font-weight:700}'
      /* parcours a regenerer : outil/parametre modifie depuis la derniere generation */
      +'.fao-op .stalei{font-size:.74rem;color:#ff453a;font-weight:700;cursor:pointer;'
      +'animation:faoStalePulse 1.8s ease-in-out infinite}'
      +'.fao-op .hbtn{font-size:.66rem;padding:1px 6px;border-radius:5px;cursor:pointer;'
      +'user-select:none;border:1px solid rgba(255,255,255,.14);color:rgba(255,255,255,.62)}'
      +'.fao-op .hbtn:hover{border-color:#0a84ff;background:rgba(10,132,255,.18)}'
      +'.fao-op .hbtn.on{border-color:rgba(255,214,10,.55);color:#ffd60a}'
      +'.fao-op.sel,.fao-setup.sel{background:rgba(10,132,255,.4)}'
      +'.fao-op .eye.on{color:#30d158}'
      +'.fao-op .eye.off{color:#98989d}'
      /* états combinables : hors rejeu (●), traces masquées (Masquer) */
      +'.fao-op.isoff{opacity:.5}'
      +'.fao-op.ishid{opacity:.62}'
      +'.fao-op.isoff.ishid{opacity:.42}'
      /* --- barre d'actions de l'arbre FAO --- */
      +'.fao-actions{display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin-top:8px}'
      +'.fao-actions button{flex:1 1 auto;font-size:.72rem;padding:5px 7px;white-space:nowrap}'
      +'.fao-actions button.primary{background:#0a84ff;border-color:#0a84ff;color:#fff;font-weight:600}'
      +'.fao-gen{display:block;width:100%;margin-top:6px;font-size:.74rem;'
      +'background:#0a84ff;border-color:#0a84ff;color:#fff;font-weight:600}'
      /* « calculer puis valider » : l'aperçu/programme est périmé tant qu'on n'a
         pas relancé « Tout régénérer » — le bouton le signale et l'export
         est bloqué. */
      +'.fao-gen.fao-stale{background:#7a2a12;border-color:#ff453a;color:#ffd7d3;'
      +'animation:faoStalePulse 1.8s ease-in-out infinite}'
      +'@keyframes faoStalePulse{0%,100%{box-shadow:0 0 0 0 rgba(255,69,58,0)}'
      +'50%{box-shadow:0 0 0 4px rgba(255,69,58,.32)}}'
      +'.fao-cnt button:disabled{opacity:.5;cursor:not-allowed;filter:grayscale(.35)}'
      /* --- colonne de droite : la barre des 7 +usinage repose AU-DESSUS du panneau
             FAO, sur sa propre pilule (meme decor ET meme HAUTEUR que #viewbar :
             34px = bouton 24px + padding 4px 6px + bordure). Largeur bornee par
             #faoWrap pour ne jamais recouvrir #viewbar (a gauche) ; la barre ne se
             plie JAMAIS (nowrap + scroll horizontal invisible) pour rester sur une
             seule ligne = hauteur identique a #viewbar, meme sur petit ecran. --- */
      +'#faoWrap{position:absolute;top:10px;right:10px;min-width:270px;max-width:calc(100% - 384px);'
      +'z-index:20;display:flex;flex-direction:column;align-items:flex-end;gap:8px;pointer-events:none}'
      +'#faoWrap>*{pointer-events:auto}'
      +'.fao-addbar{display:flex;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;'
      +'gap:4px;align-items:center;'
      +'width:100%;padding:4px 6px;border-radius:10px;'
      +'background:rgba(16,18,22,.78);border:1px solid rgba(255,255,255,.13);'
      +'backdrop-filter:blur(7px)}'
      +'.fao-addbar::-webkit-scrollbar{display:none}'
      +'.fao-addbar .fao-addlab{font-size:.66rem;font-weight:700;letter-spacing:.04em;'
      +'text-transform:uppercase;color:#fff;opacity:.85;padding:0 2px;white-space:nowrap}'
      +'.fao-addbar button{padding:4px 6px;font-size:.76rem;white-space:nowrap}'
      +'.fao-addbar button:hover{border-color:#0a84ff;background:rgba(10,132,255,.2)}'
      /* --- panneau flottant de l'arbre FAO : contenu + onglet de repli (procédé
             identique à l'arbre des corps — le panneau se rabat sur sa droite) ;
             il coule SOUS la barre au sein de #faoWrap (align-self, plus de top) --- */
      +'#faoTreeWrap{align-self:flex-end;display:flex;'
      +'flex-direction:row-reverse;align-items:flex-start;font-size:.78rem}'
      +'#faoTreeWrap .fao-cnt{width:244px;max-height:calc(100vh - 190px);overflow-y:auto;'
      +'padding:10px 11px;border-radius:13px;background:rgba(16,18,22,.9);'
      +'border:1px solid rgba(255,255,255,.14);color:#e9e9ec;'
      +'backdrop-filter:blur(9px);box-shadow:0 16px 38px rgba(0,0,0,.5)}'
      +'#faoToggle{min-width:22px;height:62px;margin:10px 0 0 4px;padding:0 3px;'
      +'font-size:.8rem;border-radius:0 10px 10px 0;background:rgba(16,18,22,.9);'
      +'border:1px solid rgba(255,255,255,.13);color:#e9e9ec}'
      +'#faoToggle:hover{background:rgba(10,132,255,.3)}'
      +'#faoTreeWrap.folded .fao-cnt{display:none}'
      +'.fao-title{display:flex;align-items:center;gap:7px;margin:0 0 7px;font-size:.72rem;'
      +'font-weight:700;color:#fff;letter-spacing:.05em;text-transform:uppercase}'
      +'.fao-title::before{content:"";width:6px;height:6px;border-radius:50%;background:#0a84ff;'
      +'box-shadow:0 0 8px rgba(10,132,255,.9)}'
      /* --- panneau props en mode FAO --- */
      +'.fao-panel .fao-stats{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;'
      +'font-size:.7rem;color:rgba(255,255,255,.7);white-space:pre-wrap;margin-top:8px}'
      +'.fao-panel .fao-note{font-size:.68rem;color:rgba(255,255,255,.5);line-height:1.35;margin-top:6px}';
    (document.head||document.body||document.documentElement).appendChild(st);
  }catch(e){}
})();
