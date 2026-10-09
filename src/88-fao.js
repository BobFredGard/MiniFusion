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
// que si le trajet vaut vraiment le coup (>= 50 mm).
const faoRapideMin=50;

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
      /* --- rangées de champs --- */
      +'.fao-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:4px 0}'
      +'.fao-lab{color:rgba(255,255,255,.62);font-size:.72rem;white-space:nowrap}'
      /* --- champs de saisie --- */
      +'.fao-in,.fao-sel{background:rgba(0,0,0,.34);border:1px solid rgba(255,255,255,.13);'
      +'border-radius:7px;color:#f5f5f7;font-size:.75rem;padding:4px 7px;min-width:0}'
      +'.fao-in:focus,.fao-sel:focus{outline:none;border-color:#0a84ff;'
      +'box-shadow:0 0 0 3px rgba(10,132,255,.25)}'
      +'.fao-in:disabled{opacity:.5}'
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

/* ----- formats numériques (point décimal, comme les .cps : ascii) ----- */
function faoFmtXYZ(n){ const v=isFinite(+n)?+n:0; return (Math.round(v*1000)/1000).toFixed(3); }
function faoFmtF(n){ const v=isFinite(+n)&&+n>0?+n:100; return (Math.round(v*10)/10).toFixed(1); }
function faoFmtS(n){ const v=isFinite(+n)&&+n>0?+n:1000; return String(Math.round(v)); }
function faoProgName(s){
  // Nom de programme : majuscules, sans espaces (Siemens : 2 lettres mini).
  let t=String(s||'PIECE').toUpperCase().replace(/[^A-Z0-9_]/g,'_').replace(/^_+/,'');
  if(!/^[A-Z_]/.test(t))t='P_'+t;
  if(t.length<2)t=(t+'_X').slice(0,2);
  return t.slice(0,24);
}

/* ----- état : posages (persistés dans doc.fao) ----- */
// Un posage = machine + repère + modèle + brut + bridage + opérations, comme le
// SETUP Fusion (img1). Les outils vivent dans le posage (bibliothèque locale).
// Migration : job plat 31t/31u (name,post,tools,stock,ops) -> posage unique.
function faoStockDefault(){ return {x0:0,y0:0,z0:0,x1:100,y1:80,z1:25}; }
function faoDefaultTools(){
  // Bibliothèque initiale : cylindrique (ébauche/finition 2.5D), boule et
  // torique (finition 3D — rayon de coin stocké). T6 = fraise de la gamme
  // CAV-75-25 (D25 CR2 torique, S8000 F5000/6000) — la gamme de l'atelier
  // (référence CAV-75-25.mpf, hélice R10 = 0.4*D, ap 1-2, ae 8-10).
  return [
    {id:'T1',num:1,name:'Fraise D10',kind:'flat',d:10,cornerR:0,flutes:2,vc:250,fz:0.06},
    {id:'T2',num:2,name:'Fraise D6',kind:'flat',d:6,cornerR:0,flutes:2,vc:250,fz:0.04},
    {id:'T3',num:3,name:'Boule D8',kind:'ball',d:8,cornerR:4,flutes:2,vc:200,fz:0.04},
    {id:'T6',num:6,name:'Torique D25 R2',kind:'bull',d:25,cornerR:2,flutes:2,vc:628,fz:0.18}
  ];
}
let faoUidN=0;
const faoNewId=function(p){ return p+'_'+(++faoUidN)+'_'+Date.now().toString(36); };
function faoDefaultSetup(){
  return {
    id:faoNewId('setup'), name:'POSAGE1', machine:'siemens630', wcs:'G54',
    origin:{preset:'top-X0Y0'}, // préréglages point de bloc ; point pièce cliqué = phase suivante
    bodies:'all', // 'all' ou [ids de corps]
    tools:faoDefaultTools(),
    fixture:{note:'', radial:5, axial:5}, // mémorisé ; non pris en compte dans les parcours (phase suivante)
    coolant:'flood', secu:5, marge:5,
    rapide:5000, // vitesse des G0 (mm/min) — estimation + référence machine
    plungePct:30, // % de l'avance de coupe appliqué à la plongée (F de plongée)
    accel:1000, // accélération machine (mm/s²) — temps rapide réel d/v + v/A
    toolChg:30, // durée d'un changement d'outil (s) ajoutée à l'estimation
    orient:{b:0, c:0}, // indexation 3+2 : B (basculer Y) / C (tourner Z), degrés
    stock:faoStockDefault(), ops:[]
  };
}
function faoDefaultJob(){ return faoDefaultSetup(); } // alias historique (tests)
function faoMigrateSetup(flat){
  // Job plat 31t/31u -> posage : post->machine, outil unique->biblio, ops repris.
  const s=faoDefaultSetup();
  ['name','wcs','coolant','secu','marge','stock','rapide','plungePct'].forEach(function(k){
    if(flat&&flat[k]!==undefined)s[k]=flat[k];
  });
  if(flat&&(flat.machine||flat.post))s.machine=flat.machine||flat.post;
  if(flat&&flat.origin&&flat.origin.preset)s.origin={preset:flat.origin.preset};
  if(flat&&flat.bodies!==undefined)s.bodies=flat.bodies;
  if(flat&&flat.fixture)s.fixture=flat.fixture;
  if(Array.isArray(flat.tools)&&flat.tools.length)s.tools=flat.tools;
  else if(flat&&flat.tool&&isFinite(+flat.tool.d))s.tools=
    [{id:'T1',num:1,name:'Fraise D'+flat.tool.d,kind:'flat',d:+flat.tool.d,cornerR:0,flutes:2,vc:250,fz:0.06}];
  s.ops=Array.isArray(flat.ops)?flat.ops:[];
  faoSanitiseOps(s);
  return s;
}
function faoSanitiseOps(s){
  // 2026-10-06-004 : « Débourrage » (pocket3d) SUPPRIMÉ de l'application —
  // les anciennes opérations sont retirées du document à la lecture (migration,
  // comme `strategie`/`laisse`) : plus de fiche, plus de bouton, plus de
  // parcours orphelin dans l'aperçu et le G-code. Suppression EN PLACE :
  // faoRoot() relance cette fonction à chaque appel, un tableau remplacé
  // laisserait les références déjà saisies (opérations, undo) pointer ailleurs.
  const ops=s.ops;
  if(Array.isArray(ops))
    for(let i=ops.length-1;i>=0;i--)
      if(ops[i]&&ops[i].type==='pocket3d')ops.splice(i,1);
  // 2026-10-08-002 : plans de dégagement/retrait (référence + décalage).
  // Forme normalisée sinon SUPPRIMÉE (repli legacy safeZ/retract) ; le mode
  // des remontées n'accepte que 'min5' (défaut) ou 'plan'.
  if(s.planes&&typeof s.planes==='object'){
    const P=s.planes, out={};
    const c=faoPlaneClean(P.clear,'clear'); if(c)out.clear=c;
    const r=faoPlaneClean(P.retr,'retr'); if(r)out.retr=r;
    if(P.mode==='plan'||P.mode==='min5')out.mode=P.mode;
    if(out.clear||out.retr||out.mode)s.planes=out; else delete s.planes;
  }else if(s.planes!==undefined)delete s.planes;
  if(s.fixture&&typeof s.fixture==='object'){
    if(!isFinite(+s.fixture.z0))delete s.fixture.z0;
    if(!isFinite(+s.fixture.z1))delete s.fixture.z1;
  }
  (s.ops||[]).forEach(function(op){
    if(!op.id)op.id=faoNewId('op');
    if(op.on===undefined)op.on=true;
    if(!op.toolId||!(s.tools||[]).some(function(t){return t.id===op.toolId;}))
      op.toolId=(s.tools&&s.tools[0]&&s.tools[0].id)||'T1';
    // 31z : laisse unique -> surépaisseurs radiale (XY) + axiale (fond/Z).
    // La géodésique garde `laisse` (le long de la normale, ni radial ni axial).
    if(op.type!=='geofinish'&&isFinite(+op.laisse)&&(op.radial===undefined&&op.axial===undefined)){
      op.radial=+op.laisse; op.axial=+op.laisse;
    }
    if(op.type!=='geofinish')delete op.laisse;
    if(op.limit&&op.limit.mode!=='rect'&&op.limit.mode!=='chain')delete op.limit;
    // 2026-10-08-003 : zone INTERIEURE (ilot a ne pas toucher) — meme forme
    // que la zone exterieure, sinon supprimee. Rect : coins reordonnes (jamais
    // d'ilot silencieusement ignore) ; chaine : cote 'out' FORCE (regle outil
    // de l'ilot : dilate de r+marge, on garde le complement).
    if(op.limit2){
      if(op.limit2.mode!=='rect'&&op.limit2.mode!=='chain')delete op.limit2;
      else if(op.limit2.mode==='rect'){
        const T=op.limit2, a=+T.x0, b=+T.x1, c=+T.y0, d=+T.y1;
        if(!(isFinite(a)&&isFinite(b)&&isFinite(c)&&isFinite(d)))delete op.limit2;
        else{ T.x0=Math.min(a,b); T.x1=Math.max(a,b); T.y0=Math.min(c,d); T.y1=Math.max(c,d);
              if(!isFinite(+T.extra))T.extra=0; }
      }else{
        if(!isFinite(+op.limit2.extra))op.limit2.extra=0;
        op.limit2.side='out';
      }
    }
    if(op.zlim&&!(op.zlim.anchors&&op.zlim.anchors.length))delete op.zlim;
    // 2026-10-08-002 : plans de l'opération (héritage posage) — forme
    // normalisée, sinon vide -> champ supprimé (héritage retrouvé).
    if(op.planes&&typeof op.planes==='object'){
      const P=op.planes, out={};
      const c=faoPlaneClean(P.clear,'clear'); if(c)out.clear=c;
      const r=faoPlaneClean(P.retr,'retr'); if(r)out.retr=r;
      if(out.clear||out.retr)op.planes=out; else delete op.planes;
    }else if(op.planes!==undefined)delete op.planes;
    // 2026-10-08-004 : mode d'entrée de coupe — seuls auto/helix/ramp/circ
    // survivent (valeur inconnue supprimée → repli du défaut) ; rayon d'entrée
    // invalide supprimé (le défaut Ø/4 est retrouvé à la génération).
    if(op.entry!==undefined&&['auto','helix','ramp','circ'].indexOf(op.entry)<0)delete op.entry;
    if(op.entryR!==undefined){
      if(isFinite(+op.entryR)&&+op.entryR>0)op.entryR=+op.entryR;
      else delete op.entryR;
    }
    // 2026-10-03-004 : mode trocoïdal unique — anciennes stratégies et passes
    // fines ap2 retirées du document à la lecture (migration, comme la laisse).
    delete op.strategy; delete op.ap2; delete op.radial2; delete op.axial2;
    // 2026-10-04-002 : mini-passes Z de l'ebauche (0 = off). Valeur nettoyee.
    // 2026-10-07-003 : plafond 9 -> 50 (le generateur plafonne aussi a 50).
    if(op.type==='rough3d'){const mp=+op.minipasses;op.minipasses=isFinite(mp)&&mp>0?Math.min(50,Math.round(mp)):0;
      // 2026-10-07-001/002 : finition des parois (N contours « Parois » -> 0,
      // sur la DERNIERE passe en profondeur, finitProf cotes vers le haut) —
      // OFF par defaut : ni champ ni effet tant que la case n'est pas cochee
      // (les documents existants restent strictement identiques, sig compris).
      if(op.finitParois){op.finitParois=true;
        const fn=Math.round(+op.finitN);op.finitN=isFinite(fn)&&fn>0?Math.min(9,fn):1;
        const fp=Math.round(+op.finitProf);op.finitProf=isFinite(fp)&&fp>0?Math.min(9,fp):1;}
      else{delete op.finitParois;delete op.finitN;delete op.finitProf;}
      // 2026-10-07-005 : 'escargot' (spirale centre -> faces) conserve ;
      // tout autre mode inconnu est purge (absent = conventionnel).
      // 2026-10-08-001 : mode trocoïdal SUPPRIME (tracé peu satisfaisant) :
      // seul 'escargot' subsiste a cote du conventionnel ; un document 'troco'
      // bascule en conventionnel (sig bouge -> regen de l'op seule). La poche
      // d'entree (esquisse) part avec le mode : champ retire partout (les sigs
      // qui la portaient bougent aussi).
      if(op.mode!=='escargot')delete op.mode;
      delete op.entree;
      }
    // 2026-10-08-003 : sens de passe — seuls 'avalant' et 'bidir' survivent,
    // et seulement sur l'Ebauche 3D (hors de la, le champ n'a pas de sens).
    if(op.type!=='rough3d'||(op.sens!=='avalant'&&op.sens!=='bidir'))delete op.sens;
    // 2026-10-04-004 : finition géodésique — limites Z héritées du brut,
    // garde-fou fraise droite recalculée à chaque dispatch (jamais stockée).
    if(op.type==='geofinish'){
      if(!isFinite(+op.ztop))op.ztop=faoStock().z1;
      if(!isFinite(+op.zbot))op.zbot=faoStock().z0;
      delete op.geoBlocked;
    }
  });
}
// radial/axial effectifs d'une op (compat 31v : `laisse` vaut les deux).
function faoRA(o){
  const leg=isFinite(+o.laisse)?+o.laisse:0;
  return {
    radial:isFinite(+o.radial)?+o.radial:leg,
    axial:isFinite(+o.axial)?+o.axial:leg
  };
}
function faoRoot(){
  // Racine {setups, activeSetupId} — crée + migre au besoin.
  try{
    if(typeof doc==='undefined')return {setups:[],activeSetupId:null};
    let r=doc.fao;
    if(!r||typeof r!=='object')r={};
    if(!Array.isArray(r.setups)){
      const s=(r.ops||r.stock)?faoMigrateSetup(r):faoDefaultSetup();
      r={setups:[s],activeSetupId:s.id};
      doc.fao=r;
    }
    if(!r.setups.length){
      const s=faoDefaultSetup(); r.setups.push(s); r.activeSetupId=s.id;
    }
    if(!r.activeSetupId||!r.setups.some(function(s){return s.id===r.activeSetupId;}))
      r.activeSetupId=r.setups[0].id;
    r.setups.forEach(faoSanitiseOps);
    return r;
  }catch(e){ return {setups:[faoDefaultSetup()],activeSetupId:null}; }
}
function faoSetup(id){
  const r=faoRoot();
  for(let i=0;i<r.setups.length;i++)if(r.setups[i].id===(id||r.activeSetupId))return r.setups[i];
  return r.setups[0];
}
function faoDoc(){ return faoSetup(); } // compat : l'ancien "job" = le posage actif
function faoTouch(){
  // Sale MAIS sans rejeu : dirty pour l'autosave, _docVersion inchangé.
  try{ dirty=true; }catch(e){}
  try{ if(typeof refreshParts==='function')refreshParts(); }catch(e){}
  try{ faoRenderTree(); }catch(e){}
}

/* ----- bibliothèque d'outils : Vc/fz -> S/F ----- */
function faoRapide(job){
  // Vitesse des G0 du posage (mm/min) — défaut machine 5000.
  return (job&&isFinite(+job.rapide)&&+job.rapide>0)?+job.rapide:5000;
}
function faoPlungePct(job){
  // % de l'avance de coupe appliqué à la plongée (défaut 30).
  return (job&&isFinite(+job.plungePct)&&+job.plungePct>0)?Math.min(100,+job.plungePct):30;
}
function faoAccel(job){
  // Accélération machine (mm/s²) — défaut 1000. Sert au temps rapide réel.
  return (job&&isFinite(+job.accel)&&+job.accel>0)?+job.accel:1000;
}
function faoToolChg(job){
  // Durée d'un changement d'outil (s) — défaut 30, ajoutée à chaque changement.
  return (job&&isFinite(+job.toolChg)&&+job.toolChg>=0)?+job.toolChg:30;
}
function faoOrient(job){
  // Indexation 3+2 du posage : B = bascule autour de Y, C = rotation autour de Z
  // (cinématique table C + B). {0,0} = usinage 3 axes strictement inchangé.
  const o=(job&&job.orient)||{};
  const b=isFinite(+o.b)?+o.b:0, c=isFinite(+o.c)?+o.c:0;
  return {b:Math.round(b*1000)/1000, c:Math.round(c*1000)/1000};
}
function faoOrientOn(job){ const o=faoOrient(job); return o.b!==0||o.c!==0; }
function faoOrientFromNormal(nx,ny,nz){
  // Normale de face cliquée (repère pièce) -> angles d'indexation table C+B.
  // Chaîne cinématique : M = Ry(B)·Rz(C) applique la normale à (0,0,1) (outil
  // vertical). Règle de la main droite ; B ∈ [−90,0] pour une face sortante
  // ascendante — l'utilisateur ajuste les signes si sa machine diffère.
  const l=Math.hypot(+nx,+ny,+nz)||1;
  nx=+nx/l; ny=+ny/l; nz=+nz/l;
  const r=Math.hypot(nx,ny);
  const rnd=function(v){ return Math.round(v*100)/100; };
  return {
    b:rnd(Math.atan2(-r,nz)*180/Math.PI),
    c:rnd(Math.atan2(-ny,nx)*180/Math.PI),
    down:nz<-1e-6 // face tournée vers le bas : pièce à retourner
  };
}
function faoToolById(job,id){
  const ts=(job&&job.tools)||[];
  for(let i=0;i<ts.length;i++)if(ts[i].id===id)return ts[i];
  if(ts.length)return ts[0];
  return {id:'T1',num:1,name:'Fraise D10',kind:'flat',d:10,cornerR:0,flutes:2,vc:250,fz:0.06};
}
function faoToolSF(t,setup){
  // S = Vc*1000/(pi*D) ; F = fz*z*S ; plongée = plungePct % de F (posage, défaut 30 %).
  const D=isFinite(+t.d)&&+t.d>0?+t.d:10;
  const vc=isFinite(+t.vc)&&+t.vc>0?+t.vc:250;
  const fz=isFinite(+t.fz)&&+t.fz>0?+t.fz:0.05;
  const z=isFinite(+t.flutes)&&+t.flutes>0?Math.round(+t.flutes):2;
  const s=Math.max(1,Math.round(vc*1000/(Math.PI*D)));
  const f=Math.max(1,Math.round(fz*z*s));
  return {s:s, f:f, plunge:Math.max(1,Math.round(f*faoPlungePct(setup)/100))};
}
function faoKindLabel(k){ return k==='ball'?'Boule':(k==='bull'?'Torique':'Cylindrique'); }

/* ----- brut : 3 sources — tous les corps (défaut), corps choisi, manuel ----- */
function faoStockValid(s){
  return !!(s&&[s.x0,s.y0,s.z0,s.x1,s.y1,s.z1].every(isFinite)&&s.x1>s.x0&&s.y1>s.y0&&s.z1>s.z0);
}
function faoStock(){
  const job=faoDoc();
  const mode=(job.stockSrc==='body'||job.stockSrc==='manual')?job.stockSrc:'bodies';
  if(mode==='manual'){
    // Boîte saisie à la main : jamais recalculée (repli défaut si invalide).
    if(!faoStockValid(job.stock))job.stock=faoStockDefault();
    return job.stock;
  }
  let box=null;
  try{
    if(typeof THREE!=='undefined'&&typeof bodies!=='undefined'&&bodies&&bodies.length){
      box=new THREE.Box3(); let n=0;
      const want=(mode==='body')?job.stockBody:null;
      bodies.forEach(function(b){
        if(!b||b.ghost||!b.mesh)return;
        // Corps choisi : bbox MÊME masqué (le masquage auto ne doit pas figer le
        // brut) ; mode « tous les corps » : corps visibles seulement (historique).
        if(want!=null){ if(b.id!==want)return; }
        else if(b.visible===false)return;
        try{ box.expandByObject(b.mesh); n++; }catch(e){}
      });
      if(!n)box=null;
      else{
        try{ if(box.isEmpty())box=null; }catch(e){ box=null; }
      }
    }
  }catch(e){ box=null; }
  const m=isFinite(+job.marge)&&+job.marge>=0?+job.marge:5;
  if(box){
    try{
      const a=box.min,b=box.max;
      if([a.x,a.y,a.z,b.x,b.y,b.z].every(isFinite)&&b.x>a.x&&b.y>a.y&&b.z>a.z){
        job.stock={x0:a.x-m, y0:a.y-m, z0:a.z, x1:b.x+m, y1:b.y+m, z1:b.z};
        return job.stock;
      }
    }catch(e){}
  }
  // Repli : brut mémorisé s'il est valide (corps choisi introuvable…), sinon défaut.
  if(faoStockValid(job.stock))return job.stock;
  job.stock=faoStockDefault();
  return job.stock;
}

/* ----- corps-brut : désignation (fiche posage, liste « Source ») + masquage auto ----- */
// Dès qu'un corps est CHOISI comme brut (mode « corps choisi »), il devient
// invisible dans la vue — via doc.bodyVis[id]=false (le corps RESTE dans
// `bodies`, mesh présent : la bbox du brut suit sa géométrie, seule sa vue est
// off). L'œil 👁 de l'en-tête corps dans l'arbre le re-rend visible
// (bodyToggleVis = vue seule, ça ne change rien au rejeu). On ne défait QUE ce
// qu'on a fait : si le corps était déjà masqué avant le choix, il le reste après
// le retrait (stockBodyHid).
function faoStockBodyRestore(setup){
  setup=setup||faoSetup();
  const id=setup.stockBody;
  if(id!=null&&setup.stockBodyHid){
    try{doc.bodyVis=doc.bodyVis||{};delete doc.bodyVis[id];}catch(e){}
    try{
      const bl=(typeof bodies!=='undefined'&&bodies)?bodies:[];
      bl.forEach(function(b){ if(b&&b.id===id){ b.visible=true; if(b.mesh)b.mesh.visible=true; } });
    }catch(e){}
    try{markDirty();}catch(e){}
  }
  setup.stockBodyHid=false;
}
function faoStockBodyHide_(setup,id){
  try{
    const bl=(typeof bodies!=='undefined'&&bodies)?bodies:[];
    const bd=bl.filter(function(b){return b&&b.id===id;})[0];
    if(!bd||bd.visible===false){ setup.stockBodyHid=false; return; } // absent/déjà masqué : pas à nous
    const others=bl.filter(function(b){return b&&!b.ghost&&b.id!==id&&b.visible!==false&&b.mesh;});
    if(!others.length){ setup.stockBodyHid=false; return; } // seul corps visible : ne JAMAIS vider la vue
    doc.bodyVis=doc.bodyVis||{}; doc.bodyVis[id]=false;
    bd.visible=false; if(bd.mesh)bd.mesh.visible=false;
    setup.stockBodyHid=true;
    markDirty();
  }catch(e){ setup.stockBodyHid=false; }
}
function faoStockBodySet(bodyId,setup){
  // Désigne (bodyId) ou retire (null) le corps-brut — depuis la fiche posage
  // (selects « Source » / « Brut = »). Effet : masquage/restauration en vue 3D + mode.
  setup=setup||faoSetup();
  try{ faoSnapshot('corps choisi comme brut'); }catch(e){}
  const prev=(setup.stockSrc==='body'&&setup.stockBody!=null)?setup.stockBody:null;
  const same=(prev!=null&&prev===bodyId);
  if(!same)faoStockBodyRestore(setup);
  if(bodyId==null||bodyId===''){
    if(setup.stockSrc==='body')setup.stockSrc='bodies';
    delete setup.stockBody;
    setup.stockBodyHid=false;
  }else{
    setup.stockSrc='body';
    setup.stockBody=bodyId;
    if(!same)faoStockBodyHide_(setup,bodyId);
  }
  try{ faoChanged(); }catch(e){}
}

/* ----- niveaux Z (ébauche par passes ap, finition = dernier niveau) ----- */
function faoFacingAe(stock,D,np){
  // Écart (ae) pour usiner EXACTEMENT np passes sur la largeur du brut + Ø.
  const d=(isFinite(+D)&&+D>0)?+D:10;
  const H=(+stock.y1-+stock.y0)+d;
  if(!(np>=2)||!(H>0))return null;
  return Math.round((H/(np-1))*1000)/1000;
}
function faoFacingYs(stock,r,ae){
  // Extrêmes du zigzag : la 1ʳᵉ (et la dernière) ligne MORDE dans la matière de la
  // valeur d'écart (plafonnée au rayon) — plus tangente à l'arête du brut.
  const a=(isFinite(+ae)&&+ae>0)?+ae:1;
  const m=Math.min(a,r);
  let yA=+stock.y0-r+m, yB=+stock.y1+r-m;
  if(!(yB>yA)){ yA=+stock.y0-r; yB=+stock.y1+r; } // span < 2m : sans mordant
  return {yA:yA,yB:yB};
}
function faoFacingCount(stock,D,ae){
  // Nombre de lignes que le zigzag produit (même logique que faoGenFacing).
  const d=(isFinite(+D)&&+D>0)?+D:10;
  const r=d/2;
  const a=(isFinite(+ae)&&+ae>0)?+ae:d*0.6;
  const Y=faoFacingYs(stock,r,a);
  let y=Y.yA,n=1,guard=0;
  while(y<Y.yB-1e-9&&guard++<100000){ y=Math.min(y+a,Y.yB); n++; }
  return n;
}
function faoFacingAp(stock,z,npz){
  // Pas en Z calculé du surfaçage : ébauche du dessus du brut (z1) à la cote z
  // en npz passes égales → ap=(z1−z)/npz. npz<2 ou z≥z1 → null (1 passe).
  if(!(npz>=2))return null;
  const zTop=isFinite(+stock.z1)?+stock.z1:null;
  if(zTop==null||!(zTop-(+z)>1e-9))return null;
  return Math.round(((zTop-(+z))/npz)*1000)/1000;
}
function faoLevels(zTop,zBot,ap){
  const p=isFinite(+ap)&&+ap>0?+ap:5;
  const lo=Math.min(+zTop,+zBot), hi=Math.max(+zTop,+zBot);
  const out=[]; let z=hi-p;
  if(!(isFinite(lo)&&isFinite(hi)))return [];
  while(z>lo+1e-9){ out.push(Math.round(z*1000)/1000); z-=p; }
  out.push(Math.round(lo*1000)/1000);
  return out;
}

/* ----- générateurs : surfaçage (zigzag, passe d'ébauche ou finition) ----- */
function faoGenFacing(stock,o){
  o=o||{};
  const D=isFinite(+o.toolD)&&+o.toolD>0?+o.toolD:10;
  const r=D/2;
  let ae=isFinite(+o.ae)&&+o.ae>0?+o.ae:D*0.6;
  const z=isFinite(+o.z)?+o.z:stock.z1;
  const secu=isFinite(+o.secu)?+o.secu:z+5;
  // Dépassement XY : l'outil sort de la matière de `sortie` mm (champ « Sortie »,
  // défaut 5 — historique 2) AVANT son demi-tour en bout de ligne.
  const dep=r+(isFinite(+o.sortie)&&+o.sortie>=0?+o.sortie:2);
  const yA0=stock.y0-r, yB0=stock.y1+r;
  // Passes pilotées (op.np ≥ 2) : écart exact H/(np−1) → couverture totale
  // garantie, dernier aligné sur la lisière. np absent/null → pilotage par ae.
  const np=isFinite(+o.np)?Math.floor(+o.np):0;
  if(np>=2&&yB0>yA0)ae=Math.max(0.01,(yB0-yA0)/(np-1));
  // Extrêmes avec mordant (l'écart morde dans la matière, plafonné au rayon).
  const Y=faoFacingYs(stock,r,ae), yA=Y.yA, yB=Y.yB;
  // Passes en Z (op.npz ≥ 2) : l'ébauche descend du dessus du brut (z1) jusqu'à
  // la cote z en npz passes égales → ap = (z1−z)/npz, dernière passe = cote.
  // npz absent/1, ou z ≥ z1 (rien à enlever) → une seule passe (historique).
  const npz=(isFinite(+o.npz)&&+o.npz>=2)?Math.floor(+o.npz):1;
  const zTop=isFinite(+stock.z1)?+stock.z1:z;
  const zs=[];
  if(npz>=2&&zTop>z+1e-9){
    const ap=(zTop-z)/npz;
    for(let k=1;k<=npz;k++)zs.push(k<npz?Math.round((zTop-k*ap)*1000)/1000:z);
  }else zs.push(z);
  const moves=[{r:1,x:stock.x0-dep,y:yA,z:secu}];
  let sens=1, garde=0;
  zs.forEach(function(lv,i){
    // niveaux pairs montent en Y (yA→yB), impairs descendent (yB→yA) : le
    // boustrophédon se poursuit d'un niveau au suivant, plongée hors matière.
    const yDown=(i%2===1);
    let y=yDown?yB:yA;
    if(i===0){
      moves.push({r:1,x:stock.x0-dep,y:yA,z:lv});
      moves.push({r:0,x:stock.x0-dep,y:yA,z:lv});
    }else{
      // même XY qu'on quitte (extrémité en dépassement, lisière en Y) : simple
      // changement de niveau Z — jamais de traversée en diagonale dans la matière.
      moves.push({r:0,x:moves[moves.length-1].x,y:moves[moves.length-1].y,z:lv});
    }
    // 2026-10-04-005 : la ligne est sillonnée AVANT le test de lisière — la
    // dernière passe devait finir le travail (l'alignement de bord manquait).
    while(garde++<100000){
      const xT=sens>0?stock.x1+dep:stock.x0-dep;
      moves.push({r:0,x:xT,y:y,z:lv});            // ligne : toute la largeur
      sens=-sens;                                  // prochaine ligne : l'autre côté
      if(yDown?y<=yA+1e-9:y>=yB-1e-9)break;        // lisière atteinte : tout est fait
      y=yDown?Math.max(y-ae,yA):Math.min(y+ae,yB);
      moves.push({r:0,x:xT,y:y,z:lv});            // transposition verticale (hors matière)
    }
  });
  moves.push({r:1,x:moves[moves.length-1].x,y:moves[moves.length-1].y,z:secu});
  return moves;
}

/* ----- poche rectangulaire (ébauche : offsets concentriques par niveau) ----- */
// radial : surépaisseur sur parois (XY) ; axial : surépaisseur sur le fond (Z).
function faoGenPocket(rect,zTop,zBot,o){
  o=o||{};
  const D=isFinite(+o.toolD)&&+o.toolD>0?+o.toolD:10;
  const r=D/2, ae=isFinite(+o.ae)&&+o.ae>0?+o.ae:D*0.5;
  const RA=faoRA(o);
  const secu=isFinite(+o.secu)?+o.secu:+zTop+5;
  const R={x0:rect.x0+RA.radial, y0:rect.y0+RA.radial, x1:rect.x1-RA.radial, y1:rect.y1-RA.radial};
  const zb=+zBot+RA.axial;
  if(R.x1-R.x0<0.05||R.y1-R.y0<0.05)return [];
  // 2026-10-08-004 : entrée circulaire — centre d'outil légal = boîte de la
  // poche retirée de r (jamais dans la paroi).
  const entryMode=o.entry||'auto';
  const rhoCirc=faoCircRhos(D,ae,o.entryR);
  // 2026-10-08-005 : air = hors de la boîte de poche (matière restante =
  // intérieur du rectangle usiné).
  const airPk=function(x,y){ return x<R.x0-1e-9||x>R.x1+1e-9||y<R.y0-1e-9||y>R.y1+1e-9; };
  const pocketOK=function(x,y){
    return x>=R.x0+r-1e-9&&x<=R.x1-r+1e-9&&y>=R.y0+r-1e-9&&y<=R.y1-r+1e-9;
  };
  const moves=[];
  const zs=faoLevels(+zTop,zb,isFinite(+o.ap)?+o.ap:5);
  zs.forEach(function(z,li){
    // Contours concentriques depuis la paroi (r) vers le centre.
    const insets=[]; let k=r;
    const cx=(R.x0+R.x1)/2, cy=(R.y0+R.y1)/2;
    while(k<=Math.min(R.x1-R.x0,R.y1-R.y0)/2+1e-9){ insets.push(k); k+=ae; }
    if(!insets.length)insets.push(Math.min(R.x1-R.x0,R.y1-R.y0)/2);
    insets.forEach(function(ins,idx){
      const ax=R.x0+ins, bx=R.x1-ins, ay=R.y0+ins, by=R.y1-ins;
      if(bx-ax<0.02||by-ay<0.02){ // fond étroit : une passe centrale
        moves.push({r:1,x:cx,y:cy,z:secu});
        moves.push({r:1,x:cx,y:cy,z:z});
        return;
      }
      // 2026-10-08-004 : ENTRÉE CIRCULAIRE — un arc tangent attaque l'anneau
      // depuis l'anneau précédent, G1 à Z de coupe (aucune remontée) quand la
      // bande est déjà ouverte ; premier anneau d'un niveau = aucune ancre ->
      // repli 006 : hélice de descente à l'angle (jamais de plongée à plat).
      let side=null;
      if(entryMode==='circ')side=faoCircEval(ax,ay,1,0,rhoCirc,pocketOK,moves,z,D,true,airPk);
      if(!side&&entryMode==='circ'){
        // 008 : 1re ATTAQUE du niveau — l'ancre échoue (rien n'est coupé à z).
        // On garde le MÊME arc tangent et on descend sur place en HÉLICE
        // (orbite tenue par l'écart analytic à la paroi) : entrée circulaire
        // à chaque niveau, jamais de plongée à plat sur du brut.
        for(let ri=0;ri<rhoCirc.length&&!side;ri++){
          const sides=faoSidesCirc(ax,ay,1,0,rhoCirc[ri]);
          if(!sides)continue;
          for(let i=0;i<sides.length;i++){
            const s2=sides[i];
            if(!pocketOK(s2.sx,s2.sy))continue;
            const pts2=faoCircArcPts(s2,ax,ay);
            if(!pts2)continue;
            let okA=true;
            for(let k=0;k<pts2.length;k++)if(!pocketOK(pts2[k][0],pts2[k][1])){okA=false;break;}
            if(!okA)continue;
            const cl=Math.min(s2.sx-R.x0,R.x1-s2.sx,s2.sy-R.y0,R.y1-s2.sy)-r;
            const hrH=Math.min(D*0.4,cl);
            if(!(hrH>=0.5))continue;
            const hFrom=(li>0)?zs[li-1]:+zTop;
            const hS=(hFrom>z+1e-9)?hFrom:secu;
            const last=moves.length?moves[moves.length-1]:null;
            if(!last||Math.abs(last.x-s2.sx)>1e-9||Math.abs(last.y-s2.sy)>1e-9||Math.abs(last.z-secu)>1e-9){
              if(last)moves.push({r:1,x:last.x,y:last.y,z:secu});
              moves.push({r:1,x:s2.sx,y:s2.sy,z:secu});
            }
            moves.push({r:0,ent:1,x:s2.sx,y:s2.sy,z:hS});
            faoHelixEntry(s2.sx,s2.sy,hS,z,hrH,D).slice(1).forEach(function(m){moves.push(m);});
            moves.push({r:0,x:s2.sx,y:s2.sy,z:z});
            moves.push({r:0,ent:1,x:ax,y:ay,z:z,
              arc:{i:s2.cx-s2.sx,j:s2.cy-s2.sy,cw:s2.cw}});
            s2.h008=true; side=s2;
            break;
          }
        }
      }
      if(side&&side.h008){
        // 008 : hélice + arc déjà émis ci-dessus.
      }else if(side){
        const prev=moves[moves.length-1];
        if(prev&&!prev.r&&Math.abs(prev.z-z)<1e-9){
          moves.push({r:0,ent:1,x:side.sx,y:side.sy,z:z});
        }else{
          if(prev)moves.push({r:1,x:prev.x,y:prev.y,z:secu});
          moves.push({r:1,x:side.sx,y:side.sy,z:secu});
          moves.push({r:0,ent:1,x:side.sx,y:side.sy,z:z});
        }
        moves.push({r:0,ent:1,x:ax,y:ay,z:z,
          arc:{i:side.cx-side.sx,j:side.cy-side.sy,cw:side.cw}});
      }else{
        // 2026-10-08-006 : 1re phase du niveau — JAMAIS de plongée à plat
        // dans la matière pleine (fraise à cheval, Ø25 en tête) et jamais
        // d'orbite (déborderait le coin légal -> surcoupe du mur) : RAMPE le
        // long du 1er côté de l'anneau — la fraise descend EN SE DEPLACANT,
        // centre exactement sur l'anneau (aucune surcoupe). hFrom = face
        // déjà usinée du niveau précédent (sinon zTop).
        const hFrom=(li>0)?zs[li-1]:+zTop;
        const z0=(hFrom>z+1e-9)?hFrom:secu;
        const last=moves.length?moves[moves.length-1]:null;
        if(!last||Math.abs(last.x-ax)>1e-9||Math.abs(last.y-ay)>1e-9||Math.abs(last.z-secu)>1e-9){
          if(last)moves.push({r:1,x:last.x,y:last.y,z:secu});
          moves.push({r:1,x:ax,y:ay,z:secu});
        }
        // 2 côtés depuis le coin : le plus long porte la rampe (paliers <= 2 mm).
        let rx=bx-ax,ry=0;
        if(Math.abs(rx)<2&&Math.abs(by-ay)>=2){ rx=0; ry=by-ay; }
        const L=Math.hypot(rx,ry);
        if(z0>z+1e-9)moves.push({r:0,ent:1,x:ax,y:ay,z:z0}); // air jusqu'a la face
        if(L>=2&&z0>z+1e-9){
          const nR=Math.max(2,Math.ceil((z0-z)/2));
          for(let s=1;s<=nR;s++){
            const f=s/nR;
            moves.push({r:0,ent:1,x:ax+rx*f,y:ay+ry*f,z:z0+(z-z0)*f});
          }
        }else{
          moves.push({r:0,ent:1,x:ax,y:ay,z:z0});
          moves.push({r:0,x:ax,y:ay,z:z});
        }
      }
      moves.push({r:0,x:bx,y:ay,z:z});
      moves.push({r:0,x:bx,y:by,z:z});
      moves.push({r:0,x:ax,y:by,z:z});
      moves.push({r:0,x:ax,y:ay,z:z});
    });
  });
  const last=moves.length?moves[moves.length-1]:{x:rect.x0,y:rect.y0};
  moves.push({r:1,x:last.x,y:last.y,z:secu});
  return moves;
}

/* ----- contour extérieur (finition : périmètre compensé du rayon outil) ----- */
function faoGenContour(rect,zTop,zBot,o){
  o=o||{};
  const D=isFinite(+o.toolD)&&+o.toolD>0?+o.toolD:10;
  const r=D/2;
  const RA=faoRA(o);
  const secu=isFinite(+o.secu)?+o.secu:+zTop+5;
  const ax=rect.x0-r-RA.radial, bx=rect.x1+r+RA.radial, ay=rect.y0-r-RA.radial, by=rect.y1+r+RA.radial;
  const moves=[];
  const zs=faoLevels(+zTop,+zBot+RA.axial,isFinite(+o.ap)?+o.ap:5);
  // Approche tangentielle : entrée à 45° depuis l'extérieur.
  const ex=ax-(r+3), ey=ay-(r+3);
  // 2026-10-08-004 : ENTRÉE CIRCULAIRE — contour EXTERNE : le centre d'outil
  // reste dehors à ≥ r de la pièce (ancre inutile, tout se passe en air) ;
  // rapide sur place, descente en Z à S, arc tangent sur le début de passe.
  // 2026-10-08-007 : l'extérieur d'un bossage n'est PAS de l'air — c'est du
  // brut (à moins qu'une ébauche ne l'ait déjà enlevé, que le contour ne
  // voit pas). La « descente à S » devient une RAMPE le long de l'arc tangent
  // (interpolation hélicoïdale répartie en paliers ≤ 2 mm) : la fraise
  // découpe le brut en progressant, jamais à plat dessus. Le repli historique
  // (sans cercle) ramp le long du 1er côté du rectangle, comme la poche 006.
  const entryMode=o.entry||'auto';
  const rhoCirc=faoCircRhos(D,0,o.entryR);
  const outsideOK=function(x,y){
    const dx=Math.max(rect.x0-x,0,x-rect.x1);
    const dy=Math.max(rect.y0-y,0,y-rect.y1);
    return Math.hypot(dx,dy)>=r-1e-9;
  };
  const sideC=(entryMode==='circ')?faoCircEval(ax,ay,1,0,rhoCirc,outsideOK,moves,zTop,D,false):null;
  zs.forEach(function(z,li){
    if(sideC){
      moves.push({r:1,x:sideC.sx,y:sideC.sy,z:secu});
      // 007 : arc tangent RAMPE — descente répartie le long de l'arc (chaque
      // sous-arc garde son centre IJK ; G2/G3 hélicoïdal = légal).
      const Rr=Math.hypot(sideC.sx-sideC.cx,sideC.sy-sideC.cy);
      let a0=Math.atan2(sideC.sy-sideC.cy,sideC.sx-sideC.cx);
      let a1=Math.atan2(ay-sideC.cy,ax-sideC.cx);
      let da=a1-a0;
      if(sideC.cw){if(da>0)da-=2*Math.PI;}else if(da<0)da+=2*Math.PI;
      const nR=Math.max(2,Math.ceil((zTop-z)/2));
      let ppx=sideC.sx,ppy=sideC.sy;
      for(let s=1;s<=nR;s++){
        const f=s/nR,a=a0+da*f;
        const xx=sideC.cx+Rr*Math.cos(a),yy=sideC.cy+Rr*Math.sin(a);
        moves.push({r:0,ent:1,x:xx,y:yy,
          z:Math.round((zTop+(z-zTop)*f)*1000)/1000,
          arc:{i:sideC.cx-ppx,j:sideC.cy-ppy,cw:sideC.cw}});
        ppx=xx;ppy=yy;
      }
    }else{
      // 007 : repli = RAMPE le long du 1er côté (descente en coupant le brut,
      // paliers ≤ 2 mm) — jamais de plongée/rapide à plat dans le brut.
      const z0=(li>0)?zs[li-1]:+zTop;
      moves.push({r:1,x:ex,y:ey,z:secu});
      moves.push({r:1,x:ax,y:ay,z:secu});
      if(z0>z+1e-9)moves.push({r:0,ent:1,x:ax,y:ay,z:z0});
      const nR=Math.max(2,Math.ceil((z0-z)/2));
      for(let s=1;s<=nR;s++){
        const f=s/nR;
        moves.push({r:0,ent:1,x:ax+(bx-ax)*f,y:ay,
          z:Math.round((z0+(z-z0)*f)*1000)/1000});
      }
    }
    moves.push({r:0,x:bx,y:ay,z:z});
    moves.push({r:0,x:bx,y:by,z:z});
    moves.push({r:0,x:ax,y:by,z:z});
    moves.push({r:0,x:ax,y:ay,z:z});
  });
  moves.push({r:1,x:ax,y:ay,z:secu});
  return moves;
}

/* ----- perçage (déroulé G0/G1 en MVP ; CYCLE81/G81 en phase 2) ----- */
function faoGenDrill(pts,zTop,zBot,secu){
  const s=isFinite(+secu)?+secu:+zTop+5;
  const moves=[];
  (pts||[]).forEach(function(p){
    moves.push({r:1,x:+p[0],y:+p[1],z:s});
    moves.push({r:1,x:+p[0],y:+p[1],z:+zTop});
    moves.push({r:0,x:+p[0],y:+p[1],z:+zBot});
    moves.push({r:1,x:+p[0],y:+p[1],z:s});
  });
  return moves;
}

/* ----- limite d'usinage rectangulaire + règle outil ----- */
// op.limit = null (tout usiner) ou {mode:'rect',x0,y0,x1,y1,
//   side:'center'|'in'|'out', extra}. Règle outil (comme Fusion) :
//   'in' = outil contenu dans la limite (zone rétractée de r),
//   'out' = la limite est entièrement couverte (zone dilatée de r),
//   'center' = le centre reste dans la limite. `extra` = décalage supp. (mm).
function faoEffLimit(op,toolD){
  const L=op&&op.limit;
  if(!L||L.mode!=='rect')return null;
  const r=(isFinite(+toolD)&&+toolD>0?+toolD:10)/2;
  const ex=isFinite(+L.extra)?+L.extra:0;
  const k=(L.side==='out'?r:L.side==='in'?-r:0)+ex;
  const R={x0:+L.x0-k, y0:+L.y0-k, x1:+L.x1+k, y1:+L.y1+k};
  if(!(R.x1>R.x0&&R.y1>R.y0))return null;
  return R;
}
// 2026-10-08-003 : zone INTERIEURE (îlot à préserver) — le COMPLÉMENT de ce
// rectangle dilaté de r+extra est la zone usinable (règle outil fixée « hors
// de l'îlot », la marge ajoute de la distance). Dégénéré (extra très négatif)
// : planter sur 0,01 mm plutôt que d'ignorer l'îlot en silence (on ne usine
// JAMAIS l'îlot par défaut).
function faoLimit2R(lim2,toolD){
  if(!lim2||lim2.mode!=='rect')return null;
  const r=(isFinite(+toolD)&&+toolD>0?+toolD:10)/2;
  const ex=isFinite(+lim2.extra)?+lim2.extra:0;
  const k=Math.max(0.01,r+ex);
  const R={x0:+lim2.x0-k, y0:+lim2.y0-k, x1:+lim2.x1+k, y1:+lim2.y1+k};
  if(!(R.x1>R.x0&&R.y1>R.y0))return null;
  return R;
}
function faoLimitDrillPts(op,toolD){
  const pts=(op&&op.pts)||[];
  const lim=op&&op.limit;
  if(lim&&lim.mode==='chain'&&lim.loop&&lim.loop.length>=3)
    return pts.filter(function(p){ return faoLimInside(+p[0],+p[1],lim,0); });
  const R=faoEffLimit(op,toolD);
  let out=R?pts.filter(function(p){ return +p[0]>=R.x0&&+p[0]<=R.x1&&+p[1]>=R.y0&&+p[1]<=R.y1; }):pts;
  // 2026-10-08-003 : l'îlot intérieur exclut aussi les perçages — avec le
  // RAYON de l'outil (le centre seul ne suffit pas : la fraise mordrait l'îlot).
  const L2=op&&op.limit2;
  if(L2&&L2.mode==='rect'){
    const R2=faoLimit2R(L2,toolD);
    if(R2)out=out.filter(function(p){
      return !(+p[0]>=R2.x0&&+p[0]<=R2.x1&&+p[1]>=R2.y0&&+p[1]<=R2.y1); });
  }else if(L2&&L2.mode==='chain'&&L2.loop&&L2.loop.length>=3){
    const r=(isFinite(+toolD)&&+toolD>0?+toolD:10)/2;
    out=out.filter(function(p){ return !faoLimInside(+p[0],+p[1],L2,r); });
  }
  return out;
}
function faoClipLB(p0,p1,R){
  // Liang-Barsky : fraction [t0,t1] du segment dans R, ou null.
  let t0=0, t1=1;
  const dx=p1.x-p0.x, dy=p1.y-p0.y, e=1e-12;
  const P=[-dx,dx,-dy,dy], Q=[p0.x-R.x0,R.x1-p0.x,p0.y-R.y0,R.y1-p0.y];
  for(let k=0;k<4;k++){
    if(Math.abs(P[k])<e){ if(Q[k]<0)return null; }
    else{ const t=Q[k]/P[k];
      if(P[k]<0){ if(t>t0)t0=t; } else if(t<t1)t1=t; }
  }
  return t0<=t1?[t0,t1]:null;
}
function faoClipMovesXY(moves,R,secuZ,invert){
  // Ne garde que la coupe dans R (invert = DEHORS, 2026-10-08-003 : complément
  // de la zone intérieure/îlot — 0, 1 ou 2 morceaux par segment). Ré-entrée
  // sécurisée : remontée sécu, rapide XY, plongée — jamais de G0 dans la matière.
  const out=[]; let px=null, py=null, pz=null, inside=false;
  const inR=function(x,y){ return x>=R.x0&&x<=R.x1&&y>=R.y0&&y<=R.y1; };
  const keep=function(x,y){ return invert?!inR(x,y):inR(x,y); };
  moves.forEach(function(m){
    if(m.r){ out.push(m); px=m.x; py=m.y; pz=m.z; inside=keep(m.x,m.y); return; }
    if(m.arc){ out.push(m); px=m.x; py=m.y; pz=m.z; inside=keep(m.x,m.y); return; }
    if(px===null){ px=m.x; py=m.y; pz=m.z; inside=keep(m.x,m.y); }
    const seg=faoClipLB({x:px,y:py},{x:m.x,y:m.y},R);
    if(!invert){
      if(!seg){ inside=false; }
      else{
        const ax=px+(m.x-px)*seg[0], ay=py+(m.y-py)*seg[0], az=pz+(m.z-pz)*seg[0];
        const bx=px+(m.x-px)*seg[1], by=py+(m.y-py)*seg[1], bz=pz+(m.z-pz)*seg[1];
        if(!inside||Math.hypot(ax-px,ay-py)>1e-6){
          out.push({r:1,x:px,y:py,z:secuZ});
          out.push({r:1,x:ax,y:ay,z:secuZ});
          out.push({r:1,x:ax,y:ay,z:az});
        }
        out.push({r:0,x:bx,y:by,z:bz});
        inside=true;
      }
      px=m.x; py=m.y; pz=m.z;
      return;
    }
    // invert : morceaux [0,t0] et [t1,1] (segment hors R = tout garder).
    const pieces=[];
    if(!seg)pieces.push([0,1]);
    else{
      if(seg[0]>1e-9)pieces.push([0,seg[0]]);
      if(seg[1]<1-1e-9)pieces.push([seg[1],1]);
    }
    if(!pieces.length){ inside=false; px=m.x; py=m.y; pz=m.z; return; }
    pieces.forEach(function(pc){
      const ax=px+(m.x-px)*pc[0], ay=py+(m.y-py)*pc[0], az=pz+(m.z-pz)*pc[0];
      const bx=px+(m.x-px)*pc[1], by=py+(m.y-py)*pc[1], bz=pz+(m.z-pz)*pc[1];
      if(!inside||Math.hypot(ax-px,ay-py)>1e-6){
        out.push({r:1,x:px,y:py,z:secuZ});
        out.push({r:1,x:ax,y:ay,z:secuZ});
        out.push({r:1,x:ax,y:ay,z:az});
      }
      out.push({r:0,x:bx,y:by,z:bz});
      inside=true;
    });
    px=m.x; py=m.y; pz=m.z;
  });
  return out;
}

/* ----- limite par chaîne d'arêtes : boucle XY + clip polygone ----- */
// La chaîne est SNAPSHOTÉE à la sélection (pts 3D -> boucle XY) + les ancres des
// germes (milieu 3D + longueur) sont conservées : à chaque fin de rejeu,
// faoChainReplay re-suit la boucle sur les arêtes du nouveau solide (rejeu auto) ;
// si les arêtes ont trop bougé, la boucle figée reste et l'op passe en « stale ».
// op.limit = {mode:'chain', loop:[[x,y]...], closed, nEdges, tangent, side, extra,
//             anchors:[{m:[x,y,z],len}...], stale}.
function faoTangentSet(edges,seeds){
  // BFS tangentiel (même règle que les congés : |dot| > 0.985 aux sommets).
  const norm=function(v){ return (Math.abs(v)<0.0005?0:v).toFixed(3); };
  const vmap=new Map(), keys=[];
  edges.forEach(function(e,i){
    const p=e.pts||[];
    if(p.length<2)return;
    const k0=p[0].map(norm).join(','), k1=p[p.length-1].map(norm).join(',');
    keys[i]=[k0,k1];
    if(!vmap.has(k0))vmap.set(k0,[]);
    if(!vmap.has(k1))vmap.set(k1,[]);
    vmap.get(k0).push(i); vmap.get(k1).push(i);
  });
  const getTan=function(ei,atEnd){
    const p=(edges[ei]&&edges[ei].pts)||[];
    if(p.length<2)return null;
    const a=atEnd?p[p.length-2]:p[0], b=atEnd?p[p.length-1]:p[1];
    return [b[0]-a[0],b[1]-a[1],b[2]-a[2]];
  };
  const tang=function(a,b,sk){
    try{
      const ka=keys[a], kb=keys[b];
      if(!ka||!kb)return false;
      const ta=getTan(a,ka[0]!==sk), tb=getTan(b,kb[0]!==sk);
      if(!ta||!tb)return false;
      const la=Math.hypot(ta[0],ta[1],ta[2]), lb=Math.hypot(tb[0],tb[1],tb[2]);
      if(la<1e-9||lb<1e-9)return false;
      return Math.abs((ta[0]*tb[0]+ta[1]*tb[1]+ta[2]*tb[2])/(la*lb))>0.985;
    }catch(e){ return false; }
  };
  const seen=new Set(), queue=(seeds||[]).filter(function(i){return i>=0&&i<edges.length;});
  queue.forEach(function(i){seen.add(i);});
  while(queue.length){
    const cur=queue.shift();
    (keys[cur]||[]).forEach(function(k){
      (vmap.get(k)||[]).forEach(function(nb){
        if(seen.has(nb))return;
        if(tang(cur,nb,k)){ seen.add(nb); queue.push(nb); }
      });
    });
  }
  return Array.from(seen);
}
function faoOrderEdges(edges,idx){
  // Ordonne des indices d'arêtes en chemin(s) par extrémités proches (3D).
  // Chaque maillon est {i,rev} : une arête est INVERSÉE quand c'est son ARRIVÉE
  // qui touche la pointe de la chaîne. Sans cette inversion la boucle XY perd le
  // côté correspondant et gagne une corde parasite (clip de chaîne trop étroit →
  // une bande entière de matière n'est jamais atteinte).
  const tol=1e-4, chains=[], used=new Set();
  const ends=function(i){
    const p=edges[i].pts;
    return [p[0],p[p.length-1]];
  };
  const near=function(a,b){
    const dx=a[0]-b[0], dy=a[1]-b[1], dz=a[2]-b[2];
    return dx*dx+dy*dy+dz*dz<tol*tol;
  };
  (idx||[]).forEach(function(s){
    if(used.has(s)||!edges[s]||!edges[s].pts||edges[s].pts.length<2)return;
    used.add(s);
    let chain=[{i:s,rev:false}], grew=true, guard=0;
    while(grew&&guard++<10000){
      grew=false;
      const first=chain[0], last=chain[chain.length-1];
      const ef=ends(first.i), el=ends(last.i);
      const head=first.rev?ef[1]:ef[0]; // départ du chemin
      const tail=last.rev?el[0]:el[1];  // arrivée du chemin
      for(let k=0;k<idx.length;k++){
        const j=idx[k];
        if(used.has(j)||!edges[j]||!edges[j].pts||edges[j].pts.length<2)continue;
        const e=ends(j);
        if(near(tail,e[0])){chain.push({i:j,rev:false});used.add(j);grew=true;break;}
        if(near(tail,e[1])){chain.push({i:j,rev:true});used.add(j);grew=true;break;}
        if(near(head,e[1])){chain.unshift({i:j,rev:false});used.add(j);grew=true;break;}
        if(near(head,e[0])){chain.unshift({i:j,rev:true});used.add(j);grew=true;break;}
      }
    }
    chains.push(chain);
  });
  return chains;
}
function faoLoopFromChains(edges,chains){
  // Chaînes 3D -> boucle XY (projection, dédupliquée, refermée d'office).
  // Maillon {i,rev} : arête parcourue à l'envers si rev. Le 1er point de chaque
  // arête est conservé : la déduplication juste en dessous enlève les doublons.
  let pts=[];
  (chains||[]).forEach(function(ch){
    ch.forEach(function(link){
      const i=(link&&typeof link==='object')?link.i:link;
      const rev=!!(link&&typeof link==='object'&&link.rev);
      const p=(edges[i]&&edges[i].pts)||[];
      for(let k=0;k<p.length;k++){
        const q=p[rev?(p.length-1-k):k];
        pts.push([q[0],q[1]]);
      }
    });
  });
  pts=pts.filter(function(q,i){
    if(!i)return true;
    const a=pts[i-1];
    return Math.hypot(q[0]-a[0],q[1]-a[1])>1e-4;
  });
  if(pts.length<3)return {loop:[],closed:false};
  const closed=Math.hypot(pts[0][0]-pts[pts.length-1][0],pts[0][1]-pts[pts.length-1][1])<0.5;
  if(!closed)pts.push([pts[0][0],pts[0][1]]); // chaîne ouverte : refermée d'office
  return {loop:pts.map(function(q){return [Math.round(q[0]*1000)/1000,Math.round(q[1]*1000)/1000];}),closed:closed};
}
function faoLoopArea(loop){
  let a=0;
  for(let i=0;i+1<loop.length;i++)a+=loop[i][0]*loop[i+1][1]-loop[i+1][0]*loop[i][1];
  return Math.abs(a/2);
}
function faoLoopDistTo(loop,xy){
  // Distance XY d'un point à la polyligne de boucle (garde-fou d'intégrité).
  if(!loop||loop.length<2||!xy)return Infinity;
  let best=Infinity;
  for(let i=0;i+1<loop.length;i++){
    const a=loop[i], b=loop[i+1];
    const dx=b[0]-a[0], dy=b[1]-a[1], l2=dx*dx+dy*dy;
    let t=l2>1e-12?((xy[0]-a[0])*dx+(xy[1]-a[1])*dy)/l2:0;
    t=t<0?0:(t>1?1:t);
    const qx=a[0]+dx*t-xy[0], qy=a[1]+dy*t-xy[1];
    const d=qx*qx+qy*qy;
    if(d<best)best=d;
  }
  return Math.sqrt(best);
}

/* ----- rejeu auto : la limite « chaîne » suit le modèle ----- */
// Chaque validation mémorise milieu 3D + longueur de chaque GERME (ancres figées).
// À chaque fin de rejeu (buildDone → faoChainReplay), si chaque ancre retrouve « son »
// arête sur le nouveau solide (tolérance XY, Z libre pour un changement de profondeur,
// dérive de longueur ≤ 50 %), la boucle est RECONSTRUITE automatiquement (tangentes
// re-déduites depuis les germes). Sinon la boucle figée est conservée et l'op passe en
// « stale » : alerte dans la fiche + ATTENTION à l'export (repli = l'ancien
// « modèle modifié -> re-sélectionner », mais signalé au lieu d'être silencieux).
const FAO_CHAIN_TOL=10; // mm — distance XY max acceptée entre une ancre et son arête
function faoEdgeAnchor(e){
  // {m:[x,y,z], len} d'une arête : milieu OCCT si présent, sinon milieu du polyline.
  if(!e)return null;
  const p=e.pts||[];
  const m=(e.mid&&isFinite(e.mid[0]))?e.mid:(p.length>=2?p[Math.floor((p.length-1)/2)]:null);
  if(!m||!isFinite(m[0]))return null;
  return {m:[m[0],m[1],isFinite(+m[2])?+m[2]:0],len:isFinite(+e.len)?+e.len:0};
}
function faoChainLoopCap(res){
  // Cap 2000 pts (clip en O(n)) : les très longues chaînes sont sous-échantillonnées.
  if(!res||!res.loop||res.loop.length<=2000)return res;
  const stride=Math.ceil(res.loop.length/2000), thin=[];
  for(let i=0;i<res.loop.length;i+=stride)thin.push(res.loop[i]);
  if(thin[thin.length-1]!==res.loop[res.loop.length-1])thin.push(res.loop[res.loop.length-1]);
  return {loop:thin,closed:res.closed};
}
function faoChainRematch(op,edges,field){
  // Reconstruit la boucle si les ances des germes retrouvent leurs arêtes.
  // Retour {changed, stale, matched, nSel, skipped?} — état dérivé : JAMAIS de
  // snapshot (comme les projections associatives), l'annulation reste au rejeu modèle.
  // 2026-10-08-003 : field ('limit' par défaut, ou 'limit2') — la zone
  // intérieure se re-branche avec exactement les mêmes règes d'ancres.
  const L=op&&op[field||'limit'];
  if(!L||L.mode!=='chain')return {changed:false,skipped:true};
  if(!(L.anchors&&L.anchors.length))return {changed:false,skipped:true}; // ancien document
  if(!edges||!edges.length)return {changed:false,skipped:true};
  const fail=function(nSel){
    const ch=!L.stale;
    L.stale=true;
    return {changed:!!ch,stale:true,matched:0,nSel:nSel||0};
  };
  // 1) appariement injectif ancre -> arête (meilleur score, tous les germes requis)
  const used=new Set(), seeds=[];
  for(let a=0;a<L.anchors.length;a++){
    const A=L.anchors[a];
    if(!A||!A.m||!isFinite(A.m[0]))return fail();
    let best=-1,bestD=Infinity,bestS=Infinity;
    for(let i=0;i<edges.length;i++){
      if(used.has(i))continue;
      const e=edges[i];
      if(!e||!e.pts||e.pts.length<2)continue;
      const m=(e.mid&&isFinite(e.mid[0]))?e.mid:null;
      if(!m)continue;
      const dxy=Math.hypot(m[0]-A.m[0],m[1]-A.m[1]);
      if(dxy>FAO_CHAIN_TOL)continue; // tolérance sèche sur XY (le Z n'est pas borné)
      const dz=Math.abs((isFinite(+m[2])?+m[2]:0)-(isFinite(+A.m[2])?+A.m[2]:0));
      const len=+e.len||0;
      const dl=A.len>1?Math.abs(len-A.len)/A.len:0;
      if(dl>0.5)continue; // même position mais taille fondu : plus la même arête
      const s=dxy+0.1*dz+5*dl;
      if(s<bestS){bestS=s;best=i;bestD=dxy;}
    }
    if(best<0||bestD>FAO_CHAIN_TOL)return fail();
    used.add(best); seeds.push(best);
  }
  // 2) re-déduction des tangentes depuis les germes appariés (même règle qu'à la saisie)
  let sel=seeds.slice();
  if(L.tangent){
    const all=[];
    seeds.forEach(function(s){
      faoTangentSet(edges,[s]).forEach(function(j){ if(all.indexOf(j)<0)all.push(j); });
    });
    sel=all;
  }
  // 3) reconstruction de la boucle XY (ordre, clip de longueur, validation)
  let res=faoLoopFromChains(edges,faoOrderEdges(edges,sel));
  if(!res.loop.length||res.loop.length<3||faoLoopArea(res.loop)<1e-6)return fail(sel.length);
  // Intégrité : chaque arête retenue doit avoir ses points SUR la boucle. Une
  // arête mal orientée à l'assemblage est partiellement sautée → son milieu
  // s'éloigne et la boucle gagne une corde parasite : le clip exclurait alors une
  // bande entière de matière. Stale (⚠ + export) plutôt qu'un usinage incomplet.
  for(let k=0;k<sel.length;k++){
    const e=edges[sel[k]];
    if(!e||!e.pts||e.pts.length<2)continue;
    const p=e.pts;
    let mx=(e.mid&&isFinite(e.mid[0]))?e.mid[0]:(p[0][0]+p[p.length-1][0])/2;
    let my=(e.mid&&isFinite(e.mid[1]))?e.mid[1]:(p[0][1]+p[p.length-1][1])/2;
    if(faoLoopDistTo(res.loop,[mx,my])>3)return fail(sel.length);
  }
  res=faoChainLoopCap(res);
  const wasStale=!!L.stale;
  const loopChanged=JSON.stringify(L.loop||[])!==JSON.stringify(res.loop);
  L.loop=res.loop; L.closed=res.closed; L.nEdges=sel.length; L.stale=false;
  return {changed:loopChanged||wasStale,stale:false,matched:seeds.length,nSel:sel.length};
}
function faoZlimFromEdges(edges,idxs){
  // Limite Z par arêtes : ancre par germe + Zmax/Zmin sur les arêtes retenues.
  // {ztop,zbot,anchors} ou null si sélection invalide (faut ztop > zbot).
  const anchors=[]; let ztop=-Infinity,zbot=Infinity;
  for(let k=0;k<(idxs||[]).length;k++){
    const e=edges&&edges[idxs[k]];
    if(!e||!e.pts||e.pts.length<2)continue;
    const A=faoEdgeAnchor(e); if(!A)return null;
    anchors.push(A);
    for(let i=0;i<e.pts.length;i++){
      const z=+e.pts[i][2];
      if(isFinite(z)){ if(z>ztop)ztop=z; if(z<zbot)zbot=z; }
    }
  }
  if(!anchors.length||!(ztop>zbot))return null;
  return {ztop:Math.round(ztop*1000)/1000,zbot:Math.round(zbot*1000)/1000,anchors:anchors};
}
function faoZlimRematch(op,edges){
  // Re-branche la limite Z (ancres figées des germes) à chaque fin de rejeu :
  // état dérivé comme les chaînes — Z recalculé sur les arêtes appariées (tol
  // 3D), stale si introuvable/hors tolérance : valeurs figées conservées +
  // alerte en fiche (re-sélectionner les arêtes).
  const L=op&&op.zlim;
  if(!L)return {changed:false,skipped:true};
  if(!(L.anchors&&L.anchors.length))return {changed:false,skipped:true}; // ancien document
  if(!edges||!edges.length)return {changed:false,skipped:true};
  const fail=function(){
    const ch=!L.stale;
    L.stale=true;
    return {changed:!!ch,stale:true,matched:0};
  };
  // 1) appariement injectif ancre -> arête (meilleur score, toutes exigées)
  const used=new Set(); const got=[];
  for(let a=0;a<L.anchors.length;a++){
    const A=L.anchors[a];
    if(!A||!A.m||!isFinite(A.m[0]))return fail();
    let best=-1,bestS=Infinity;
    for(let i=0;i<edges.length;i++){
      if(used.has(i))continue;
      const e=edges[i];
      if(!e||!e.pts||e.pts.length<2)continue;
      const m=(e.mid&&isFinite(e.mid[0]))?e.mid:null;
      if(!m)continue;
      const dz=Math.abs((isFinite(+m[2])?+m[2]:0)-(isFinite(+A.m[2])?+A.m[2]:0));
      const d3=Math.hypot(m[0]-A.m[0],m[1]-A.m[1],dz);
      if(d3>FAO_CHAIN_TOL)continue; // tolérance 3D (XY + Z)
      const len=+e.len||0;
      const dl=A.len>1?Math.abs(len-A.len)/A.len:0;
      if(dl>0.5)continue; // même position mais taille fondu : plus la même arête
      const s=d3+5*dl;
      if(s<bestS){bestS=s;best=i;}
    }
    if(best<0)return fail();
    used.add(best); got.push(edges[best]);
  }
  // 2) Zmax/Zmin sur les arêtes appariées (source de vérité : le modèle)
  let ztop=-Infinity,zbot=Infinity;
  got.forEach(function(e){
    (e.pts||[]).forEach(function(p){
      const z=+p[2];
      if(isFinite(z)){ if(z>ztop)ztop=z; if(z<zbot)zbot=z; }
    });
  });
  if(!(ztop>zbot))return fail();
  ztop=Math.round(ztop*1000)/1000; zbot=Math.round(zbot*1000)/1000;
  const wasStale=!!L.stale;
  const changed=wasStale||ztop!==+op.ztop||zbot!==+op.zbot;
  L.nEdges=got.length; L.stale=false;
  op.ztop=ztop; op.zbot=zbot;
  return {changed:changed,stale:false,matched:got.length};
}
function faoZlimBreak(op){
  // Édition manuelle d'un champ Haut/Bas : casse le lien avec les arêtes
  // (valeurs conservées) — les champs repassent en saisie libre.
  if(op&&op.zlim)delete op.zlim;
}
function faoRematchAll(setups,edges){
  // Fin de rejeu : une seule passe re-branche chaînes XY (zones ext et
  // intérieure) ET limites Z.
  let n=0;
  ((setups)||[]).forEach(function(st){
    ((st&&st.ops)||[]).forEach(function(op){
      const r=faoChainRematch(op,edges);
      const r2=faoChainRematch(op,edges,'limit2');
      const rz=faoZlimRematch(op,edges);
      if((r&&r.changed)||(r2&&r2.changed)||(rz&&rz.changed))n++;
    });
  });
  return n;
}
function faoChainReplay(){
  // Fin de rejeu (buildDone) : re-suit toutes les limites chaîne du document sur les
  // arêtes du nouveau solide. Repli silencieux partout où l'on ne peut pas juger :
  // sélection en cours, OCCT absent, solide exact illisible, aucune ancre.
  try{
    if(typeof faoChainMode!=='undefined'&&faoChainMode)return 0;
    const F=(doc&&doc.fao&&doc.fao.setups)||[];
    let any=false;
    for(let i=0;i<F.length&&!any;i++){
      const ops=(F[i]&&F[i].ops)||[];
      for(let k=0;k<ops.length;k++){
        const o=ops[k]||{};
        const L=o.limit, L2=o.limit2, Z=o.zlim;
        if((L&&L.mode==='chain'&&L.anchors&&L.anchors.length)||
           (L2&&L2.mode==='chain'&&L2.anchors&&L2.anchors.length)||
           (Z&&Z.anchors&&Z.anchors.length)){any=true;break;}
      }
    }
    if(!any)return 0;
    if(typeof occHas==='function'&&!occHas())return 0;
    if(!occLive||!occLive.shape)return 0;
    const edges=occSharpEdges(occLive.shape);
    if(!edges.length)return 0;
    const n=faoRematchAll(F,edges);
    if(n)faoChanged();
    return n;
  }catch(e){ return 0; }
}
function faoPointInPoly(x,y,loop){
  // Impair : dedans <=> nombre impair de croisements.
  let inside=false;
  for(let i=0,j=loop.length-1;i<loop.length;j=i++){
    const xi=loop[i][0], yi=loop[i][1], xj=loop[j][0], yj=loop[j][1];
    if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))inside=!inside;
  }
  return inside;
}
function faoDistToPoly(x,y,loop){
  let m=1/0;
  for(let i=0;i+1<loop.length;i++){
    const ax=loop[i][0], ay=loop[i][1], bx=loop[i+1][0], by=loop[i+1][1];
    const dx=bx-ax, dy=by-ay, l2=dx*dx+dy*dy;
    let t=l2>1e-12?((x-ax)*dx+(y-ay)*dy)/l2:0;
    t=Math.max(0,Math.min(1,t));
    const d=Math.hypot(x-(ax+dx*t),y-(ay+dy*t));
    if(d<m)m=d;
  }
  return m;
}
function faoLimInside(x,y,lim,r){
  // Règle outil (comme Fusion) SANS offsetter le polygone : on teste le point
  // avec marge. side in : érodé de r ; out : dilaté de r ; center : tel quel.
  // extra (décalage supp.) dilate toujours la zone utile.
  const loop=lim&&lim.loop;
  if(!loop||loop.length<3)return true;
  const rr=isFinite(+r)&&+r>0?+r:0, ex=isFinite(+lim.extra)?+lim.extra:0;
  const in0=faoPointInPoly(x,y,loop), d=faoDistToPoly(x,y,loop);
  const side=lim.side||'center';
  if(side==='in')return in0&&(d+ex>=rr);
  if(side==='out')return in0||(d<=rr+ex);
  return in0||(d<=ex);
}
function faoClipMovesPoly(moves,lim,r,secuZ,sub,atFn){
  // Clip impair : on subdivise (pas `sub`, 2 mm défaut) et on ne garde que les
  // passages dedans, croisement affiné par dichotomie (0,1 mm). Ré-entrée
  // sécurisée comme en rect : remontée sécu, jamais de G0 dans la matière.
  // 2026-10-08-003 : atFn (optionnel) remplace la règle lim/r — utilisé pour
  // l'îlot intérieur (on garde le COMPLÉMENT : atFn = !faoLimInside).
  const step=isFinite(+sub)&&+sub>0?+sub:2;
  const out=[]; let px=null, py=null, pz=null, inside=false;
  const at=(typeof atFn==='function')?atFn:function(x,y){ return faoLimInside(x,y,lim,r); };
  const cross=function(ax,ay,bx,by,ain){
    // Dichotomie du point de croisement (sortie à 0,1 mm).
    let t0=0, t1=1;
    for(let k=0;k<30;k++){
      const tm=(t0+t1)/2;
      const insideMid=at(ax+(bx-ax)*tm,ay+(by-ay)*tm);
      if(insideMid===ain)t0=tm; else t1=tm;
      if(Math.hypot((bx-ax)*(t1-t0),(by-ay)*(t1-t0))<0.1)break;
    }
    const t=t0; // côté ain : sortie DEDANS, entrée DEHORS — jamais au-delà
    return [ax+(bx-ax)*t,ay+(by-ay)*t];
  };
  const zAt=function(ax,ay,az,bx,by,bz,cx,cy){
    // Z interpolé au point (cx,cy) sur le segment a->b.
    const dx=bx-ax, dy=by-ay, l2=dx*dx+dy*dy;
    const f=l2>1e-12?((cx-ax)*dx+(cy-ay)*dy)/l2:0;
    return az+(bz-az)*Math.max(0,Math.min(1,f));
  };
  const enter=function(x,y,z){
    out.push({r:1,x:px,y:py,z:secuZ});
    out.push({r:1,x:x,y:y,z:secuZ});
    out.push({r:1,x:x,y:y,z:z});
  };
  moves.forEach(function(m){
    if(m.r){ out.push(m); px=m.x; py=m.y; pz=m.z; inside=at(m.x,m.y); return; }
    if(m.arc){ out.push(m); px=m.x; py=m.y; pz=m.z; inside=at(m.x,m.y); return; }
    if(px===null){ px=m.x; py=m.y; pz=m.z; inside=at(m.x,m.y); }
    const len=Math.hypot(m.x-px,m.y-py);
    const n=Math.max(1,Math.ceil(len/step));
    let cx=px, cy=py, cz=pz, cin=inside;
    for(let i=1;i<=n;i++){
      const nx=px+(m.x-px)*i/n, ny=py+(m.y-py)*i/n, nz=pz+(m.z-pz)*i/n;
      const nin=at(nx,ny);
      if(nin&&!cin){
        const c=cross(cx,cy,nx,ny,false);
        const zc=zAt(cx,cy,cz,nx,ny,nz,c[0],c[1]);
        enter(c[0],c[1],zc);
        out.push({r:0,x:nx,y:ny,z:nz});
      }else if(nin&&cin){
        out.push({r:0,x:nx,y:ny,z:nz});
      }else if(!nin&&cin){
        const c=cross(cx,cy,nx,ny,true);
        out.push({r:0,x:c[0],y:c[1],z:zAt(cx,cy,cz,nx,ny,nz,c[0],c[1])});
      }
      cx=nx; cy=ny; cz=nz; cin=nin;
    }
    px=m.x; py=m.y; pz=m.z; inside=cin;
  });
  return out;
}

/* ----- ZONE = mur vertical inviolable ---------------------------------------
   Règle d'atelier (affinée jusqu'à la capture) : la zone est un MUR. Rien ne
   s'y usine dehors, et les G0 ne font plus de TOUR « dans le vide » : on ne la
   franchit que pour l'ENGAGEMENT (retour d'outil en tête d'opération), la
   SORTIE, le CHANGEMENT D'OUTIL ou le POINT DE REPOS — les trois dernières
   raisons étant le fait de la séquence/post, jamais d'une opération isolée.
   Trois garde-fous, du plus tôt au plus tard :
   · `faoZoneStrip`   — les séries de G0 hors zone sont retirées à la
     GÉNÉRATION (dans faoZoneCuts) et à la LECTURE (faoOpMoves +
     faoOpMovesTry) : un tracé déjà en cache est purgé sans régénération ;
   · `faoZoneCuts`    — appelé en DERNIER dans faoOpMoves, après faoRoundMoves
     (les arrondis d'angle sont créés après le clip : leurs arcs peuvent
     dépasser la frontière — ils sont alors aplatis puis recoupés) ;
   · `faoSegClipper`  — filet de sécurité à l'AFFICHAGE, sur les seuls segments
     de coupe (un aperçu ne montre donc jamais de coupe hors zone, même avec
     un tracé en cache ancien). */
function faoZoneCtx(op,job){
  // -> {lim, lim2, D, chain, R?, R2?, at(x,y), cross(a,b)} pour l'opération,
  //    ou null (aucune zone exploitable : la règle ne s'applique pas à cette op).
  // 2026-10-08-003 : la zone INTERIEURE (îlot) se compose — on garde ce qui
  // est dedans (lim) ET hors de l'îlot (lim2). at/cross deviennent le ET / le
  // OU des deux frontières ; la coupe finale se refait en deux temps dans
  // faoZoneCuts (clip extérieur exact, puis clip îlot).
  const lim=op&&op.limit, lim2=op&&op.limit2;
  if(!lim&&!lim2)return null;
  const tool=faoToolById(job,op&&op.toolId);
  const D=(tool&&+tool.d>0)?+tool.d:10;
  let at=null, cross=null, R=null, chain=false, limOK=null;
  if(lim&&lim.mode==='chain'&&lim.loop&&lim.loop.length>=3){
    limOK=lim; chain=true;
    const loop=lim.loop, r=D/2;
    at=function(x,y){ return faoLimInside(x,y,lim,r); };
    cross=function(a,b){ return faoPolyCross(a.x,a.y,b.x,b.y,loop); };
  }else if(lim&&lim.mode==='rect'){
    const R0=faoEffLimit(op,D);
    if(R0){
      limOK=lim; R=R0;
      at=function(x,y){ return x>=R.x0&&x<=R.x1&&y>=R.y0&&y<=R.y1; };
      cross=function(a,b){
        const s=faoClipLB({x:a.x,y:a.y},{x:b.x,y:b.y},R);
        return !s||s[0]>1e-9||s[1]<1-1e-9; };
    }
  }
  // --- îlot intérieur : la zone usinable est le COMPLÉMENT de l'îlot dilaté.
  let R2=null, lim2OK=null;
  if(lim2&&lim2.mode==='rect'){
    R2=faoLimit2R(lim2,D);
    if(!R2)R2=null; else lim2OK=lim2;
  }else if(lim2&&lim2.mode==='chain'&&lim2.loop&&lim2.loop.length>=3){
    lim2OK=lim2;
  }
  if(!limOK&&!lim2OK)return null;
  if(lim2OK){
    const r2=D/2;
    const at2=R2
      ?function(x,y){ return !(x>=R2.x0&&x<=R2.x1&&y>=R2.y0&&y<=R2.y1); }
      :function(x,y){ return !faoLimInside(x,y,lim2OK,r2); };
    const cross2=R2
      // Chevauchement avec l'îlot (et non « pas entièrement dedans ») :
      // ligne AVOID l'îlot -> false (raccourci autorisé, coupe jugée propre),
      // ligne qui l'entrechevauche -> true (pas de raccourci à travers).
      ?function(a,b){ return !!faoClipLB({x:a.x,y:a.y},{x:b.x,y:b.y},R2); }
      :function(a,b){ return faoPolyCross(a.x,a.y,b.x,b.y,lim2OK.loop); };
    const at1=at, cross1=cross;
    at=at1?function(x,y){ return at1(x,y)&&at2(x,y); }:at2;
    cross=cross1?function(a,b){ return cross1(a,b)||cross2(a,b); }:cross2;
  }
  return {lim:limOK,lim2:lim2OK,D:D,chain:chain,R:R,R2:R2,at:at,cross:cross};
}
/* ===================== PLANS : DÉGAGEMENT / RETRAIT ===================== */
// 2026-10-08-002 : plans façon Fusion360, PAR OPÉRATION (héritage posage ->
// op). Un plan = {ref, dz} : valeur = Z de la référence + décalage, en
// coordonnées MONDE (repère pièce). `ref` ∈ FAO_PLANE_REFS ; 'max'/'min'
// portent deux sous-plans {s1,s2} (sous-références de base seulement) ;
// 'face' porte `fz` = Z mesuré au clic. Le plan 'retrait' n'est chaîné que
// DANS le plan de dégagement (déGagement = retrait + 10 par défaut) — la
// chaîne est bornée à 2 maillons (nettoyage + garde `dep`), jamais de cycle.
// Les plans alimentent : translations rapides XY (dégagement), remontées des
// G0 (retrait, selon `planes.mode`), retrait inter-outils et fin de parcours.
const FAO_PLANE_REFS=[
  ['brutHaut','Haut du brut'],
  ['brutBas','Fond du brut'],
  ['modeleHaut','Haut du modèle'],
  ['modeleBas','Bas du modèle'],
  ['bridageHaut','Haut du bridage'],
  ['bridageBas','Bas du bridage'],
  ['face','Sélection (face)'],
  ['origine','Origine (absolue)'],
  ['max','Le plus élevé des deux'],
  ['min','Le plus bas des deux']
];
function faoModelZBox(job){
  // bbox des corps du modèle (sans marge) — Z « Haut/Bas du modèle ».
  // Repli : Z du brut (le brut suit le modèle en source corps).
  try{
    if(typeof THREE!=='undefined'&&typeof bodies!=='undefined'&&bodies&&bodies.length){
      const box=new THREE.Box3(); let n=0;
      const want=(job&&job.stockSrc==='body')?job.stockBody:null;
      bodies.forEach(function(b){
        if(!b||b.ghost||!b.mesh)return;
        if(want!=null){ if(b.id!==want)return; }
        else if(b.visible===false)return;
        try{ box.expandByObject(b.mesh); n++; }catch(e){}
      });
      if(n&&!box.isEmpty()&&isFinite(box.min.z)&&isFinite(box.max.z))
        return {z0:box.min.z,z1:box.max.z};
    }
  }catch(e){}
  const s=faoStock(); return {z0:s.z0,z1:s.z1};
}
function faoPlaneZ(pl,op,job,dep){
  // Résolution ABSOLUE d'un plan. NaN = plan illisible (repli côté appelant).
  dep=dep||0;
  if(!pl||typeof pl!=='object'||!pl.ref||dep>4)return NaN;
  const st=(job&&job.stock&&isFinite(+job.stock.z1))?job.stock:faoStockDefault();
  const z1=isFinite(+st.z1)?+st.z1:0, z0=isFinite(+st.z0)?+st.z0:0;
  let z=NaN;
  switch(pl.ref){
    case 'brutHaut': z=z1; break;
    case 'brutBas': z=z0; break;
    case 'modeleHaut': case 'modeleBas':{
      const mb=faoModelZBox(job);
      z=(pl.ref==='modeleHaut')?mb.z1:mb.z0; break;
    }
    case 'bridageHaut':{ const f=job&&job.fixture;
      z=(f&&isFinite(+f.z1))?+f.z1:z1; break; }
    case 'bridageBas':{ const f=job&&job.fixture;
      z=(f&&isFinite(+f.z0))?+f.z0:z0; break; }
    case 'face': z=isFinite(+pl.fz)?+pl.fz:z1; break;
    case 'origine': z=0; break;
    case 'retrait': // chaîne unique : dégagement depuis le retrait
      if(dep>=3)return NaN;
      z=faoRetractAbs(op,job); break;
    case 'max': case 'min':{
      const a=faoPlaneZ(pl.s1,op,job,dep+1), b=faoPlaneZ(pl.s2,op,job,dep+1);
      if(!isFinite(a)&&!isFinite(b))return NaN;
      if(!isFinite(a))return b;
      if(!isFinite(b))return a;
      return (pl.ref==='max')?Math.max(a,b):Math.min(a,b);
    }
    default: return NaN;
  }
  if(!isFinite(z))return NaN;
  return z+(isFinite(+pl.dz)?+pl.dz:0);
}
function faoClearAbs(op,job){
  // Plan de dégagement ABSOLU de l'opération (héritage op > posage > legacy).
  const pl=(op&&op.planes&&op.planes.clear)?op.planes.clear:
    (job&&job.planes&&job.planes.clear)?job.planes.clear:null;
  if(pl){ const z=faoPlaneZ(pl,op,job,0); if(isFinite(z))return z; }
  return faoSafeZ(job);
}
function faoRetractAbs(op,job){
  // Plan de retrait ABSOLU de l'opération (héritage op > posage > legacy).
  const pl=(op&&op.planes&&op.planes.retr)?op.planes.retr:
    (job&&job.planes&&job.planes.retr)?job.planes.retr:null;
  if(pl){ const z=faoPlaneZ(pl,op,job,0); if(isFinite(z))return z; }
  return faoRetractZ(job);
}
function faoZoneSecu(op,job){
  // Plan des RAPIDES internes de l'opération (absolu, jamais sous le brut) :
  //  - mode 'plan' (remontées « toujours au plan de retrait ») : le plan de
  //    retrait lui-même, ramené au-dessus du brut ;
  //  - mode 'min5' (défaut, « plan de retrait ou minimum +5 mm ») : le plan
  //    de retrait BORNÉ par dessus brut + Sortie (5 par défaut) — c'est
  //    l'ancien secu absolu quand le retrait vaut brut+25 (héritage).
  const top=(job&&job.stock&&isFinite(+job.stock.z1))?+job.stock.z1:
    (op&&isFinite(+op.z))?+op.z:(op&&isFinite(+op.ztop))?+op.ztop:0;
  const retr=Math.max(faoRetractAbs(op,job),top); // jamais sous le dessus du brut
  const mode=(job&&job.planes&&job.planes.mode)||'min5';
  if(mode==='plan')return retr;
  const ceil=top+((job&&isFinite(+job.secu))?+job.secu:5); // Sortie
  return Math.min(retr,ceil);
}
/* ----- nettoyage (sanitise) : forme normalisée, sinon null (repli legacy) ----- */
function faoPlaneSlotClean(s){
  if(!s||typeof s!=='object')return null;
  let ok=false;
  for(let i=0;i<FAO_PLANE_REFS.length;i++){
    const r=FAO_PLANE_REFS[i][0];
    if(r===s.ref&&r!=='max'&&r!=='min'&&r!=='retrait'){ok=true;break;}
  }
  if(!ok)return null;
  const o={ref:s.ref,dz:isFinite(+s.dz)?+s.dz:0};
  if(s.ref==='face'){ if(!isFinite(+s.fz))return null; o.fz=+s.fz; }
  return o;
}
function faoPlaneClean(pl,role){
  // role='clear' : accepte la chaîne 'retrait' ; role='retr' : jamais.
  if(!pl||typeof pl!=='object')return null;
  if(pl.ref==='max'||pl.ref==='min'){
    const s1=faoPlaneSlotClean(pl.s1), s2=faoPlaneSlotClean(pl.s2);
    return (s1&&s2)?{ref:pl.ref,s1:s1,s2:s2}:null;
  }
  if(pl.ref==='retrait')return (role==='clear')?{ref:'retrait',dz:isFinite(+pl.dz)?+pl.dz:0}:null;
  return faoPlaneSlotClean(pl);
}
function faoPlaneEff(job,op){
  // Valeurs EFFECTIVES montrées à l'écran (héritage op > posage > legacy).
  // Le legacy traduit les anciens champs absolus en références : Auto =
  // brut+100 (dégagement) / brut+25 (retrait), valeur forcée = origine+val.
  const P=(job&&job.planes)||{}, O=(op&&op.planes)||{};
  const clear=O.clear||P.clear||
    (job&&isFinite(+job.safeZ)?{ref:'origine',dz:+job.safeZ}:{ref:'brutHaut',dz:100});
  const retr=O.retr||P.retr||
    (job&&isFinite(+job.retract)?{ref:'origine',dz:+job.retract}:{ref:'brutHaut',dz:25});
  return {clear:clear,retr:retr,mode:P.mode==='plan'?'plan':'min5',
    ownClear:!!O.clear,ownRetr:!!O.retr};
}
function faoZoneStrip(moves,ctx,secu){
  // Retire les SÉRIES de rapides hors zone : la coupe a déjà été clipée avant,
  // ces G0 ne font que se rendre « dans le vide » (tour du cadre de validation,
  // liaison au ras du brut, plongée déportée hors mur). Ils ne sont gardés que
  // s'ils ouvrent l'opération (engagement, retour d'outil) ou si la jonction
  // directe prev->next traverserait elle la frontière : on ne fabrique JAMAIS
  // un franchissement nouveau. Rend le MÊME tableau si rien ne sort.
  if(!ctx||!moves||!moves.length)return moves;
  const at=ctx.at;
  const runs=[]; let k=0;
  while(k<moves.length){
    const m=moves[k];
    if(m.r&&!at(m.x,m.y)){
      let j=k;
      while(j<moves.length&&moves[j].r&&!at(moves[j].x,moves[j].y))j++;
      runs.push([k,j-1]); k=j;
    }else k++;
  }
  if(!runs.length)return moves;
  const drop=runs.map(function(r){
    const a=r[0], b=r[1];
    const prev=a>0?moves[a-1]:null, next=b+1<moves.length?moves[b+1]:null;
    if(!prev)return false;                       // tête d'op : engagement
    if(next&&ctx.cross(prev,next))return false;  // franchissement nécessaire
    return true;
  });
  if(!drop.some(function(d){ return d; }))return moves;
  const out=[]; let u=0;
  for(let i=0;i<moves.length;i++){
    if(u<runs.length&&i===runs[u][0]){
      const a=runs[u][0], b=runs[u][1];
      const prev=a>0?moves[a-1]:null, next=b+1<moves.length?moves[b+1]:null;
      u++;
      if(!drop[u-1]){ for(let t=a;t<=b;t++)out.push(moves[t]); i=b; continue; }
      // jonction : jamais de G0 à z de coupe (retrait puis liaison en sécurité)
      if(prev&&prev.r===0)out.push({r:1,x:prev.x,y:prev.y,z:secu});
      if(next&&next.r===0)out.push({r:1,x:next.x,y:next.y,z:secu});
      i=b; continue;
    }
    out.push(moves[i]);
  }
  return out;
}
function faoZoneServe(ch,op,job,secu){
  // Lecture d'un tracé en cache : la purge des excursions est appliquée UNE fois
  // puis rangée dans l'entrée mémoire — pas de rejeu, clé de cache inchangée.
  if(!ch||!Array.isArray(ch.mv))return ch?ch.mv:null;
  const ctx=faoZoneCtx(op,job);
  if(!ctx)return ch.mv;
  const mv=faoZoneStrip(ch.mv,ctx,secu);
  if(mv!==ch.mv)ch.mv=mv;
  return ch.mv;
}
function faoZoneCuts(moves,op,job,secu){
  // 0) purge des excursions de G0 (le diagnostic verrait un rapide dehors comme
  //    un débordement de coupe) ; 1) la coupe est-elle entière dans la zone ?
  //    Si un seul point déborde (extrémité, croisement, arc d'arrondi) :
  //    2) réparation — arcs -> polygone, puis re-clip des SEULS segments de
  //    coupe (les rapides restent ce qu'ils sont, hors les séries retirées).
  const ctx=faoZoneCtx(op,job);
  if(!ctx||!moves||!moves.length)return moves;
  const at=ctx.at;
  const depasse=function(a,b,m){
    // Extrémité de coupe hors zone, ou segment/arc qui traverse la frontière.
    if(!at(m.x,m.y))return true;
    if(m.arc){
      const pts=faoArcSegs(a,m);
      for(let k=0;k<pts.length;k++)if(!at(pts[k][0],pts[k][1]))return true;
      return false;
    }
    return ctx.cross(a,b);
  };
  const m0=faoZoneStrip(moves,ctx,secu);
  // --- 1) diagnostic : la coupe est-elle entièrement dedans ?
  let prev=null, bust=false;
  for(let i=0;i<m0.length&&!bust;i++){
    const m=m0[i];
    if(m.r){ prev=m; continue; }   // rapides : le droit de traverser
    if(prev&&depasse(prev,m,m))bust=true;
    if(!prev&&!at(m.x,m.y))bust=true;
    prev=m;
  }
  if(!bust)return m0;          // RAS : on ne touche à rien d'autre
  // --- 2) réparation
  const flat=[]; prev=null;
  for(let i=0;i<m0.length;i++){
    const m=m0[i];
    if(m.r){ flat.push(m); prev=m; continue; }
    if(m.arc&&prev){
      const pts=faoArcSegs(prev,m); let ok=at(m.x,m.y);
      for(let k=0;k<pts.length&&ok;k++)if(!at(pts[k][0],pts[k][1]))ok=false;
      if(ok){ flat.push(m); prev=m; continue; }
      for(let k=0;k<pts.length;k++)flat.push({r:0,x:pts[k][0],y:pts[k][1],z:pts[k][2]});
      prev=flat[flat.length-1];
      continue;
    }
    flat.push(m); prev=m;
  }
  let cut=flat;
  if(ctx.chain)cut=faoClipMovesPoly(cut,ctx.lim,ctx.D/2,secu,2);
  else if(ctx.R)cut=faoClipMovesXY(cut,ctx.R,secu);
  // 2026-10-08-003 : puis le COMPLÉMENT de l'îlot intérieur (deuxième passe :
  // les deux clips se composent — intersection des zones usinables).
  if(ctx.R2)cut=faoClipMovesXY(cut,ctx.R2,secu,true);
  else if(ctx.lim2)
    cut=faoClipMovesPoly(cut,ctx.lim2,ctx.D/2,secu,2,
      function(x,y){ return !faoLimInside(x,y,ctx.lim2,ctx.D/2); });
  return faoZoneStrip(cut,ctx,secu);
}
/* ----- affichage : la COUPE ne sort jamais de la zone (l'aperçu le garantit)
   même sur un tracé en cache. Les rapides, eux, sont dessinés tels quels —
   engagés en tête d'opération ou franchissements de la séquence. */
function faoPolyCross(ax,ay,bx,by,loop){
  const dx=bx-ax, dy=by-ay;
  for(let i=0,j=loop.length-1;i<loop.length;j=i++){
    const cx1=loop[j][0],cy1=loop[j][1],cx2=loop[i][0],cy2=loop[i][1];
    const ex=cx2-cx1, ey=cy2-cy1;
    const den=dx*ey-dy*ex;
    if(Math.abs(den)<1e-12)continue;
    const t=((cx1-ax)*ey-(cy1-ay)*ex)/den;
    const u=((cx1-ax)*dy-(cy1-ay)*dx)/den;
    if(t>1e-9&&t<1-1e-9&&u>1e-9&&u<1-1e-9)return true;
  }
  return false;
}
function faoSegClipper(op,job){
  // -> fn(ax,ay,az,bx,by,bz,push) qui ne pousse que la partie DANS la zone,
  //    ou null : opération sans zone (affichage inchangé, cas par défaut).
  // Usage réservé aux segments de COUPE (cf. faoRefreshPreview) : un rapide
  // a le droit de traverser la frontière.
  // 2026-10-08-003 : zone intérieure (îlot) — ctx composé (ET des deux zones).
  const ctx=faoZoneCtx(op,job);
  if(!ctx)return null;
  if(!ctx.lim2){
    // --- extérieur seul : chemins historiques EXACTS (inchangés) ---
    if(ctx.chain){
      const at=ctx.at;
      return function(ax,ay,az,bx,by,bz,push){
        const ain=at(ax,ay), bin=at(bx,by);
        const cross=ctx.cross({x:ax,y:ay},{x:bx,y:by});
        if(ain&&bin&&!cross){ push(ax,ay,az,bx,by,bz); return; } // cas courant : 1 test
        if(!ain&&!bin&&!cross)return;                            // tout dehors : rien
        const n=Math.max(1,Math.ceil(Math.hypot(bx-ax,by-ay)));  // subdivision 1 mm
        let px=ax,py=ay,pz=az,pin=ain;
        for(let i=1;i<=n;i++){
          const t=i/n, cx=ax+(bx-ax)*t, cy=ay+(by-ay)*t, cz=az+(bz-az)*t, cin=at(cx,cy);
          if(cin&&pin)push(px,py,pz,cx,cy,cz);
          px=cx;py=cy;pz=cz;pin=cin;
        }
      };
    }
    if(ctx.R){
      const R=ctx.R;
      return function(ax,ay,az,bx,by,bz,push){
        const s=faoClipLB({x:ax,y:ay},{x:bx,y:by},R);
        if(!s)return;
        push(ax+(bx-ax)*s[0],ay+(by-ay)*s[0],az+(bz-az)*s[0],
             ax+(bx-ax)*s[1],ay+(by-ay)*s[1],az+(bz-az)*s[1]);
      };
    }
    return null;
  }
  // --- composé (limite + îlot) : at = ET, cross = OU, marche 1 mm ---
  const at=ctx.at;
  return function(ax,ay,az,bx,by,bz,push){
    const ain=at(ax,ay), bin=at(bx,by);
    const cr=ctx.cross({x:ax,y:ay},{x:bx,y:by});
    if(ain&&bin&&!cr){ push(ax,ay,az,bx,by,bz); return; }
    if(!ain&&!bin&&!cr)return;
    const n=Math.max(1,Math.ceil(Math.hypot(bx-ax,by-ay)));
    let px=ax,py=ay,pz=az,pin=ain;
    for(let i=1;i<=n;i++){
      const t=i/n, cx=ax+(bx-ax)*t, cy=ay+(by-ay)*t, cz=az+(bz-az)*t, cin=at(cx,cy);
      if(cin&&pin)push(px,py,pz,cx,cy,cz);
      px=cx;py=cy;pz=cz;pin=cin;
    }
  };
}

/* ----- cache de parcours + de maillage -----
   Une même opération était recalculée 6 à 8 fois PAR INTERACTION souris
   (arbre, aperçu, fiche, stats, temps, viewer…) — pour l'ébauche 3D cela
   coûtait 6 × 76 s de gel. Le maillage OCCT et les moves sont donc mis en
   cache, invalidés par la clé ci-dessous.
   Clé = génér. de corps maillés + opération + posage, SANS les champs
   purement UI (hidden / on / geoBlocked / limit.stale / open) : replier,
   sélectionner, afficher/masquer une trace = HIT instantané. */
let faoOpMovesMap=null, faoBodyMeshMap=null, faoBodyMeshFn=null, faoBodyGen=0;
function faoOpMovesHit(op){ try{ return faoOpMovesMap?faoOpMovesMap.get(op):null; }catch(e){ return null; } }
function faoOpMovesStore(op,key,mv){
  try{ if(!faoOpMovesMap)faoOpMovesMap=new WeakMap();
       faoOpMovesMap.set(op,{key:key,mv:mv}); }catch(e){}
}
function faoOpSig(op){
  const o={};
  const skip={hidden:1,on:1,geoBlocked:1,stale:1};
  try{
    for(const k in op){
      if(!Object.prototype.hasOwnProperty.call(op,k)||skip[k])continue;
      const v=op[k];
      if(k==='limit'&&v&&typeof v==='object'){
        const L={};
        for(const kk in v) if(Object.prototype.hasOwnProperty.call(v,kk)&&kk!=='stale'&&kk!=='missing')L[kk]=v[kk];
        o.limit=L;
      }else if(k==='limit2'&&v&&typeof v==='object'){
        // 2026-10-08-003 : zone interieure — mêmes règles que la zone
        // extérieure : les drapeaux transitaires ne changent jamais la clé.
        const L2={};
        for(const kk in v) if(Object.prototype.hasOwnProperty.call(v,kk)&&kk!=='stale'&&kk!=='missing')L2[kk]=v[kk];
        o.limit2=L2;
      }else o[k]=v;
    }
  }catch(e){ return op; }
  return o;
}
let faoMovesFpMap=null;
let faoFpParts=''; // derniere liste hachee par faoSetupFp : id:empreinte_nb par corps // WeakMap (maillage deja memoise) -> empreinte du contenu
function faoMeshFp(mm){
  // Empreinte CONTENUE du maillage d'un corps — identique d'une session a l'autre,
  // contrairement a faoBodyGen (compteur de session, repasse a 0 au F5). Quantification
  // a 0,001 mm : absorbe les ecarts d'arrondi entre deux executions du meme solide.
  // INDEPENDANTE DE L'ORDRE : deux rejeux du meme solide enumerent les faces autrement
  // (les positions de reference des filtres derivent de 1e-9 entre deux enregistrements
  //  -> meme contour, autre ordre de triangles). Hacher la sequence classait les memes
  // points dans un autre ordre = autre cle = « cache perdu a chaque rafraichissement »
  // alors que le solide ne bougeait pas d'un cheveu (sonde : empreinte TRIEE identique
  // sur les deux etats, empreinte sequentielle differente).
  if(!mm||!mm.v||!mm.v.length)return '0';
  if(!faoMovesFpMap){ try{ faoMovesFpMap=new WeakMap(); }catch(e){ faoMovesFpMap=null; } }
  if(faoMovesFpMap){ const e=faoMovesFpMap.get(mm); if(e)return e; }
  const v=mm.v, t=new Array(v.length);
  for(let i=0;i<v.length;i++){
    const p=v[i];
    t[i]=(Math.round(((p&&+p[0])||0)*1000)|0)+','+(Math.round(((p&&+p[1])||0)*1000)|0)+','+(Math.round(((p&&+p[2])||0)*1000)|0);
  }
  t.sort();
  const s=t.join('|');
  let h=2166136261;
  for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); }
  const fp=(h>>>0).toString(36)+'_'+v.length;
  if(faoMovesFpMap){ try{ faoMovesFpMap.set(mm,fp); }catch(e){} }
  return fp;
}
function faoSetupFp(job){
  // Solide machine par CE posage (corps reels du document, filtres comme faoActiveMesh).
  // 'nb' = pas encore de maillage (document non reconstruit) : la lecture differee
  // reessaiera plutot que de memoriser une cle fausse.
  try{
    if(typeof bodies==='undefined'||!bodies||!bodies.length)return 'nb';
    const only=(job&&Array.isArray(job.bodies))?job.bodies:null;
    const parts=[],diag=[];
    for(let bi=0;bi<bodies.length;bi++){
      const b=bodies[bi];
      if(!b||b.ghost||b.visible===false)continue;
      if(only&&only.indexOf(b.id)<0)continue;
      const mm=faoMeshFromBodyCached(b);
      if(!mm)continue;
      // Le hash porte la GEOMETRIE seule : l'identite du corps n'entre dans aucune
      // trajectoire (faoActiveMesh fusionne les maillages visibles, sans id). Un id
      // qui bouge entre deux sessions rendait la cle fausse alors que le solide et
      // le parcours étaient identiques. L'id reste dans la liste DIAGNOSTIC.
      const fp=faoMeshFp(mm);
      parts.push(fp);
      diag.push(String(b.id)+':'+fp);
    }
    if(!parts.length){ faoFpParts=''; return 'nb'; }
    const str=parts.join('|');
    faoFpParts=diag.join('|');
    let h=2166136261;
    for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}
    return (h>>>0).toString(36)+'_'+parts.length;
  }catch(e){ return 'x'; }
}
function faoOpMovesKey(op,job){
  try{
    // Normalisation AVANT hachage : faoRoot() le fait a chaque acces, mais une
    // cle calculee hors de cette voie (migration, appel direct) voyait un op
    // SANS minipasses/laisse puis un op AVEC -> « cle differente » a chaque
    // ouverture alors que RIEN n'avait bouge. Idempotent : aucun effet de bord.
    if(job&&Array.isArray(job.ops))faoSanitiseOps(job);
    const js={};
    for(const k in job){
      if(!Object.prototype.hasOwnProperty.call(job,k)||k==='ops'||k==='open')continue;
      if(k==='name'||k==='id')continue; // libelle / identifiant : jamais une trajectoire
      js[k]=job[k];
    }
    // Seul l'outil de CETTE operation influence ses parcours : modifier T3 ne
    // doit pas rendre perimes les traces des operations qui tournent en T1.
    if(js&&js.tools)js.tools=[faoToolById(job,op&&op.toolId)];
    // Une operation ne depend QUE d'elle-meme, de son outil, du brut/du maillage
    // (faoBodyGen) — ET, pour la GEOFINITION uniquement, des operations qui la
    // PRECEDENT (faoGeoHasRrough lit leur type et leur etat actif). Tout le reste
    // ne change rien a SES tracés : modifier une autre operation ne la marquait
    // deja pas ... sauf avant, ou la cle embarquait la signature de TOUTES les
    // operations — d'ou un triangle sur tout le posage pour une seule modif.
    let dep=null;
    if(op&&op.type==='geofinish'){
      const ops=(job&&job.ops)||[];
      let idx=-1;
      for(let i=0;i<ops.length;i++){ const q=ops[i];
        if(q===op||(op.id&&q&&q.id===op.id)){ idx=i; break; } }
      dep=idx<0?['absent']:ops.slice(0,idx+1).map(function(q){
        return [q&&q.id,q&&q.type,q&&q.on!==false?1:0];
      });
    }
    let body='0'; // hors ebauche 3D/geofinition : aucun dependence au solide
    if(op&&(op.type==='rough3d'||op.type==='geofinish')){
      const fp=faoSetupFp(job);
      // Solide pas encore construit ('nb') ou ilegitime ('x') : AUCUNE cle possible.
      // Une clé « nb|… » ne pouvait matcher aucune entrée (la lecture l'écartait déjà)
      // mais elle rendait st true -> triangle rouge pose DES l'ouverture, avant meme
      // que le solide existe — et il ne retombait jamais.
      if(fp==='nb'||fp==='x')return null;
      body=fp;
    }
    return body+'|'+JSON.stringify([faoOpSig(op),js,dep]);
  }catch(e){ return null; } // non sérialisable -> pas de cache (toujours juste)
}
function faoMeshFromBodyCached(b){
  if(faoBodyMeshFn!==faoMeshFromBody){
    faoBodyMeshFn=faoMeshFromBody;
    try{ faoBodyMeshMap=new WeakMap(); }catch(e){ faoBodyMeshMap=null; }
    faoBodyGen++;
  }
  if(faoBodyMeshMap){ const e=faoBodyMeshMap.get(b); if(e)return e; }
  let m=null;
  try{ m=faoMeshFromBody(b); }catch(e){ m=null; }
  if(m&&faoBodyMeshMap){ try{ faoBodyMeshMap.set(b,m); faoBodyGen++; }catch(e){} }
  return m;
}
/* ----- cache persistant des parcours (IndexedDB) -----
   Objectif : ne plus RECALCULER les trajectoires a chaque ouverture (l'ebauche 3D
   du document reel coute ~90 s). On ne met PAS les parcours dans le MODÈLE
   (71 Ko) : 286 000 points = 7,9 Mo, et l'autosave tient dans 5 Mo de localStorage.
   Une entree PAR operation, reecrite a chaque generation -> stockage borne.
   L'entree n'est servie que si sa cle est EXACTEMENT celle du moment present et si
   la VERSION DU CODE est la meme : sinon on recalcule, comme avant. */
let faoMovesWritten=null; // Set idbKey|cle -> deja ecrit dans cette session
let faoMovesWhy=null;     // Map idbKey -> {why:'absente'|'format'|'version'|'cle',...}
let faoBundleWantReport=false; // un .miniFusion vient d'etre ouvert : dire ce qu'il contient
function faoKeyDiff(a,b){
  // Deux cles de parcours differentes : POURQUOI ? « cle differente » ne disait
  // rien (solide ? outil ? parametres ?) et la moitie du diagnostic restait a
  // faire a la main. Compare d'abord l'empreinte du solide, puis chaque
  // composante du JSON : le motif remonte mot pour mot dans l'infobulle du ⚠.
  try{
    if(a===b)return '';
    const pa=String(a==null?'':a).split('|'), pb=String(b==null?'':b).split('|');
    const fa=pa.shift(), fb=pb.shift();
    if(fa!==fb)return 'empreinte du SOLIDE differente ('+(fa||'vide')+' -> '+(fb||'vide')+')';
    let ja=null,jb=null;
    try{ ja=JSON.parse(pa.join('|')); }catch(e){}
    try{ jb=JSON.parse(pb.join('|')); }catch(e){}
    if(!Array.isArray(ja)||!Array.isArray(jb))return 'cle differente';
    const d=[];
    const one=function(x,y,lab){
      if(JSON.stringify(x)===JSON.stringify(y))return;
      if(!x||!y||typeof x!=='object'||typeof y!=='object'){ d.push(lab); return; }
      const ks={};
      Object.keys(x).forEach(function(k){ks[k]=1;});
      Object.keys(y).forEach(function(k){ks[k]=1;});
      Object.keys(ks).forEach(function(k){
        let sx='',sy='';
        try{ sx=JSON.stringify(x[k]); }catch(e){ sx='?'; }
        try{ sy=JSON.stringify(y[k]); }catch(e){ sy='?'; }
        if(sx!==sy)d.push(lab+k);
      });
    };
    one(ja[0],jb[0],'operation.');
    one(ja[1],jb[1],'posage.');
    one(ja[2],jb[2],'dependance.');
    if(!d.length)return 'cle differente';
    return d.slice(0,6).join(', ')+(d.length>6?' …':'');
  }catch(e){ return 'cle differente'; }
}
function faoPartsDiff(a,b){
  // Compare la liste des corps haches, corps par corps : « empreinte du solide
  // differente » ne disait pas SIQUEL corps ni SI c'etaient les memes sommets.
  // meme nombre de sommets + autre hash => les coordonnees ont bouge (matrixWorld,
  // rejeu, jitter OCCT) ; nombre different => le maillage lui-meme a change.
  try{
    if(!a||!b)return '';
    const M=function(s){
      const m={};
      String(s).split('|').forEach(function(p){
        const i=p.indexOf(':'); if(i<0)return;
        const id=p.slice(0,i), fp=p.slice(i+1), j=fp.lastIndexOf('_');
        m[id]={fp:fp,n:j<0?0:+fp.slice(j+1)};
      });
      return m;
    };
    const X=M(a), Y=M(b), d=[];
    for(const id in X){
      if(!(id in Y)){ d.push('corps '+id+' disparu'); continue; }
      if(X[id].fp===Y[id].fp)continue;
      if(X[id].n&&Y[id].n&&X[id].n!==Y[id].n)
        d.push('corps '+id+' : '+X[id].n+' -> '+Y[id].n+' sommets');
      else
        d.push('corps '+id+' : memes sommets, coordonnees differentes ('
          +X[id].fp.split('_')[0]+' -> '+Y[id].fp.split('_')[0]+')');
    }
    for(const id in Y){ if(!(id in X))d.push('corps '+id+' apparue'); }
    if(!d.length)return '';
    return d.slice(0,3).join(' ; ')+(d.length>3?' …':'');
  }catch(e){ return ''; }
}
function faoMovesWhySet(k,why,info){
  // Pourquoi une entree du cache a-t-elle ete REJETEE a la lecture ? Sans cela,
  // « 1 operation sans parcours en memoire » ne dit jamais si la trace n'existe
  // pas, si elle vient d'un ancien moteur, ou si sa cle (donc le SOLIDE) a bouge.
  try{
    if(!k)return;
    if(!faoMovesWhy)faoMovesWhy=new Map();
    if(!why){ faoMovesWhy.delete(k); return; }
    const e={why:why};
    if(info)for(const kk in info)e[kk]=info[kk];
    faoMovesWhy.set(k,e);
  }catch(e){}
}
function faoMovesWhyGet(job,op){
  try{ return (faoMovesWhy&&faoMovesWhy.get(faoMovesIdbKey(job,op)))||null; }
  catch(e){ return null; }
}
function faoMovesWhyShort(job,op){
  // Forme COURTE, pour la barre d'etat (le detail complet est dans l'infobulle du ⚠).
  const w=faoMovesWhyGet(job,op);
  if(!w)return '';
  if(w.why==='version')return 'trace ecrite par un ancien moteur ('+w.ver+')';
  if(w.why==='cle')return w.d||'cle differente : outil / parametres / SOLIDE modifies';
  if(w.why==='absente')return 'jamais generate ici (ou cache purge)';
  if(w.why==='format')return 'entree de cache illisible';
  return '';
}
let faoMovesPreloading=false, faoMovesPreloaded=false;
// Reessais : a l'ouverture le solide n'existe pas encore (restoreViewCache +
// rejeu exact). Sans reprise automatique, la lecture s'arretait sur « nb » et le
// premier clic recyclait tout le calcul (90 s) alors que rien n'etait perime.
let faoMovesRetry=0, faoMovesRetryT=null;
function faoMovesIdbKey(job,op){
  return 'faoMoves:'+((job&&job.id)||'_')+':'+((op&&op.id)||'_');
}
function faoSolidSettled(){
  // Le corps affiche vient-il du REJEU exact, ou du REPLI D'IMAGE ?
  // restoreViewCache() remet des corps « cached » SANS shape : la FAO lit alors le
  // maillage d'affichage (l'interception « corps blindés » exige b.shape). Le rejeu
  // exact remplace ensuite ces corps par des corps kind:'body' AVEC shape ->
  // AUTRE source, AUTRE empreinte. Generer pendant cette fenetre ecrivait une entree
  // maudite : valable 3 secondes, rouge des l'ouverture suivante — cas exact de
  // « l'Ébauche 3D perd son cache a chaque refresh ».
  // Tant que c'est faux : on ne lit pas, on n'ecrit pas, on ne genere pas.
  try{
    if(typeof bodies==='undefined'||!bodies||!bodies.length)return true;
    for(let i=0;i<bodies.length;i++){
      const b=bodies[i];
      if(!b||b.ghost||b.visible===false)continue;
      if(b.cached===true&&!b.shape)return false;
    }
    return true;
  }catch(e){ return true; }
}
let faoRegenWhenSettled=false; // « Tout régénérer » pressé pendant le rejeu
function faoRegenFlush(){
  try{
    if(!faoRegenWhenSettled)return;
    if(!faoSolidSettled())return;
    faoRegenWhenSettled=false;
    faoPreviewGenerate();
  }catch(e){}
}
function faoMovesReady(){
  // Hors navigateur (harnais de tests) ou IDB indisponible : simplemente desactive.
  try{ return !!(typeof indexedDB!=='undefined'&&indexedDB&&
                 typeof idbSet==='function'&&typeof idbGet==='function'); }
  catch(e){ return false; }
}
function faoMovesReset(){
  // Nouveau document : l'ecriture doit repartir, et la lecture differeree aussi.
  try{ if(faoMovesWritten&&faoMovesWritten.clear)faoMovesWritten.clear(); }catch(e){}
  try{ if(faoMovesWhy&&faoMovesWhy.clear)faoMovesWhy.clear(); }catch(e){}
  try{ if(faoMovesRetryT){ clearTimeout(faoMovesRetryT); faoMovesRetryT=null; } }catch(e){}
  faoMovesPreloading=false;
  faoMovesPreloaded=false;
  faoMovesRetry=0;
  faoMovesFpSeen=null; // aucun solide lu pour ce document : la prochaine lecture compte
}
function faoMovesEngSig(job){
  // Ce qui NE se voit pas dans la cle mais change l'empreinte du solide : le
  // moteur (exact vs repli maillage), l'identite et le TYPE des corps visibles
  // (kind:'body' -> geometrie d'outillage occXDefl, sinon maillage d'affichage).
  // Rangee dans l'entree, elle permet de dire « le solide a change de source »
  // plutot que « cle differente » quand c'est exactement le cas.
  try{
    if(typeof bodies==='undefined'||!bodies)return '';
    const only=(job&&Array.isArray(job.bodies))?job.bodies:null;
    const L=[];
    for(let i=0;i<bodies.length;i++){
      const b=bodies[i];
      if(!b||b.ghost||b.visible===false)continue;
      if(only&&only.indexOf(b.id)<0)continue;
      L.push(b.id+'#'+(b.kind||'?')+(b._faoGeo?'*':''));
    }
    return (typeof builtEngine==='string'?builtEngine:'?')+'|'+L.join(',');
  }catch(e){ return ''; }
}
function faoMovesSave(job,op,key,mv){
  // Ecriture ASYNCHRONE et sans effet de bord : une panne d'IndexedDB ne bloque
  // ni l'apercu ni l'export (on recalcule simplement, comme aujourd'hui).
  try{
    if(!faoMovesReady()||!key||!mv)return;
    if(!faoSolidSettled())return; // clé calculée sur le repli : elle ne vaudra plus
    if(!faoMovesWritten)faoMovesWritten=new Set();
    const k=faoMovesIdbKey(job,op);
    const tag=k+'|'+key;
    if(faoMovesWritten.has(tag))return;
    faoMovesWritten.add(tag);
    Promise.resolve(idbSet(k,{v:1,ver:CACHE_VER,k:key,n:mv.length,at:Date.now(),
      e:faoMovesEngSig(job),p:faoFpParts,mv:mv}))
      .catch(function(){});
  }catch(e){}
}
/* ----- le solide bouge : les CLES de l'ebauche 3D bougent avec lui -----
   Seules les operations rough3d/geofinish embarquent faoSetupFp dans leur cle —
   d'ou « le Surfaçage passe toujours, l'Ébauche 3D jamais ». Au F5 la premiere
   lecture se fait sur le REPLI MAILLAGE (le noyau OCCT exact n'a pas encore boote) :
   autre empreinte, entree rejetee, triangle rouge. Quand le solide exact arrive,
   il faut RELIRE — sans quoi la lecture, deja « prete », ne regardait plus rien. */
let faoMovesFpSeen=null; // {posageId: faoSetupFp} du solide utilise a la derniere lecture
function faoMovesSolidFp(){
  // Empreinte des solides qui entrent dans une CLE de parcours (seuls ces types
  // dependent du maillage : le Surfaçage, lui, ne voit jamais bouger sa clé).
  const o={};
  try{
    const r=faoRoot();
    ((r&&r.setups)||[]).forEach(function(s){
      if(!s)return;
      const ops=s.ops||[];
      for(let i=0;i<ops.length;i++){
        const t=ops[i]&&ops[i].type;
        if(t==='rough3d'||t==='geofinish'){ o[s.id]=faoSetupFp(s); return; }
      }
    });
  }catch(e){}
  return o;
}
function faoMovesFpDiffers(snap){
  try{
    const cur=faoMovesSolidFp();
    for(const id in cur){ if(!snap||snap[id]!==cur[id])return true; }
    for(const id in snap){ if(!(id in cur))return true; }
  }catch(e){}
  return false;
}
function faoMovesSolidChanged(){
  // Depuis la derniere lecture, le solide a change (repli maillage -> OCCT exact,
  // import, edition du parametrique) : les cles de l'ebauche 3D ne valent plus.
  try{ if(!faoMovesReady())return false; return faoMovesFpDiffers(faoMovesFpSeen); }
  catch(e){ return false; }
}
async function faoMovesPreload(){
  // Rechauffe le cache MEMOIRE depuis IndexedDB : les parcours deja calcules par la
  // meme version sont SERVIS, pas recalcules. Renvoie le nombre d'operations restaurees.
  let n=0, pending=false;
  const snap=faoMovesSolidFp(); // solide tel qu'il est QUAND ON COMMENCE a lire
  try{
    if(!faoMovesReady())return 0;
    if(!faoSolidSettled())return 0; // rejeu en cours : on relira quand le solide sera la
    const r=faoRoot(); const setups=(r&&r.setups)||[];
    for(let si=0;si<setups.length;si++){
      const s=setups[si]; if(!s)continue;
      const ops=s.ops||[];
      for(let oi=0;oi<ops.length;oi++){
        const op=ops[oi]; if(!op)continue;
        if(op.type==='rough3d'||op.type==='geofinish'){
          try{ faoActiveMesh(s); }catch(e){}
          // Solide pas encore construit : on ne valide RIEN et on reessiera plus tard.
          if(faoSetupFp(s)==='nb'){ pending=true; continue; }
        }
        const ck=faoOpMovesKey(op,s); if(!ck)continue;
        const curParts=faoFpParts; // figee tout de suite : l'await plus bas cede le fil
        const idk=faoMovesIdbKey(s,op);
        const ch=faoOpMovesHit(op);
        if(ch&&ch.key===ck){ faoMovesWhySet(idk,null); continue; } // deja en memoire
        let val=null;
        try{ val=await idbGet(idk); }catch(e){ val=null; }
        if(!val){ faoMovesWhySet(idk,'absente'); continue; }
        const nb=(val.n||(val.mv&&val.mv.length)||0);
        if(val.v!==1){ faoMovesWhySet(idk,'format',{ver:val.ver}); continue; }
        if(!cacheVerOK(val.ver)){ faoMovesWhySet(idk,'version',{ver:val.ver,n:nb}); continue; }
        if(!Array.isArray(val.mv)){ faoMovesWhySet(idk,'format',{ver:val.ver,n:nb}); continue; }
        if(val.k!==ck){
          const eng=faoMovesEngSig(s);
          let d=faoKeyDiff(val.k,ck);
          const per=val.p?faoPartsDiff(val.p,curParts):'';
          if(per)d=per+' ; '+d;
          if(val.e&&eng&&val.e!==eng)d='source du solide changee ('
            +val.e+' -> '+eng+') ; '+d;
          d+=' | corps actuels : '+(curParts||'?')+' ; ecrits : '+(val.p||'sans detail');
          faoMovesWhySet(idk,'cle',{ver:val.ver,k:val.k,n:nb,e:val.e,d:d}); continue; }
        faoMovesWhySet(idk,null);
        faoOpMovesStore(op,ck,val.mv); n++;
      }
    }
    if(!pending){
      faoMovesFpSeen=snap;
      faoMovesPreloaded=true; faoMovesRetry=0; faoMovesDone();
      // Le solide a bouge PENDANT la lecture : les cles utilisees ne valent plus —
      // on relit une fois (plutot que de laisser un triangle rouge injustifie).
      try{
        if(faoMovesFpDiffers(snap))
          setTimeout(function(){ try{ faoMovesPreloadSoon(true); }catch(e){} },0);
      }catch(e){}
    }
  }catch(e){}
  return n;
}
function faoMovesPending(){
  // Lecture IndexedDB en cours : un AFFICHAGE (nb de points, temps, stats) ne doit
  // JAMAIS servir de pretexte a un calcul — on attend, on n'invente pas.
  try{ return !!(faoMovesReady()&&!faoMovesPreloaded); }catch(e){ return false; }
}
function faoActiveOps(job){
  // Operations qui comptent : desactivees (on=false) exclues, partout
  // (apercu, stats, validation) — un lanceur desactive n'a pas de parcours a servir.
  return ((job&&job.ops)||[]).filter(function(o){return o&&o.on!==false;});
}
function faoMovesAllReady(job){
  // Vrai seulement si CHAQUE operation active a sa trace EN MEMOIRE avec sa cle
  // exacte (outil + parametres + brut + maillage) : l'apercu peut alors etre dessine
  // et VALIDE sans le moindre calcul. 0 operation = rien a valider (faux).
  try{
    const ops=faoActiveOps(job);
    if(!ops.length)return false;
    for(let i=0;i<ops.length;i++){
      const o=ops[i];
      if(o.type==='rough3d'||o.type==='geofinish'){ try{ faoActiveMesh(job); }catch(e){} }
      const ck=faoOpMovesKey(o,job);
      if(ck===null)return false;              // solide pas encore construit
      const ch=faoOpMovesHit(o);
      if(!(ch&&ch.key===ck))return false;
    }
    return true;
  }catch(e){ return false; }
}
function faoMovesDone(){
  // Fin de lecture : 1) ACCES IMMEDIAT — si CHAQUE parcours est deja en memoire
  // (ouverture d'un fichier bien genere), on DESSINE tout de suite et l'apercu est
  // VALIDE : le bouton passe au vert sans rien presser et l'export s'ouvre. Aucun
  // calcul : le cache est lu, jamais recalcule. 2) Les modifications arrivees
  // PENDANT l'attente sont tranchees ici (l'oeil « Masquer » n'en est pas une).
  try{
    const w=faoPrevWanted; faoPrevWanted=false;
    const job=faoDoc();
    const nops=faoActiveOps(job).length;
    if(!w){
      if(nops)try{ faoStaleScan(); }catch(e){}  // qui est servi par la memoire ?
      const pret=nops?faoMovesAllReady(job):true;
      // On DESSINE des le premier dessin disponible, meme partiel : à l'ouverture
      // les traces presents doivent apparaitre tout de suite, sinon chaque ligne
      // dit « Masquer » alors que RIEN n'est affiche. Les absentes sont comptees
      // (faoPrevMissing) et l'apercu reste non valide tant qu'une seule manque.
      if(nops&&faoPrevOn)try{ faoRefreshPreview(); }catch(e){}
      faoPrevStale=!pret;                      // 0 operation : rien a valider
      try{ faoStaleUI(); }catch(e){}
    }else if(w==='full'){
      try{ faoStaleScan(); }catch(e){}
      try{ faoRefreshPreview(); }catch(e){}
      faoPrevStale=true;                       // une modif a eu lieu pendant l'attente
      try{ faoStaleUI(); }catch(e){}
    }else if(w==='lecture'){
      try{ faoRefreshPreview(true); }catch(e){}
    }
    if(faoBundleWantReport&&faoMovesReady()&&!faoMovesPending()){
      faoBundleWantReport=false;
      try{ if(typeof bundleReport==='function')bundleReport(); }catch(e){}
    }
    try{ faoRegenFlush(); }catch(e){}
    const a=(typeof document!=='undefined'&&document)?document.activeElement:null;
    if(a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.isContentEditable))return;
    if(typeof sel==='undefined'||!sel||!(sel.kind==='faoOp'||sel.kind==='faoSetup'))return;
    if(typeof renderProps==='function')renderProps();
    if(typeof faoRefreshFaoUI==='function')faoRefreshFaoUI();
  }catch(e){}
}
function faoMovesPreloadSoon(force){
  // Declencheur foin-et-oubli (l'init, l'ouverture de document) : une seule course
  // a la fois, et on RESSAIE toutes les 400 ms tant que le solide n'existe pas —
  // sans quoi la lecture s'arretait sur « nb » et le 1er clic recalculait tout.
  // force = le solide vient d'etre construit : repartir meme si on avait abandonne.
  try{
    if(!faoMovesReady())return;
    if(force){ try{ if(faoMovesRetryT){ clearTimeout(faoMovesRetryT); faoMovesRetryT=null; } }catch(e){}
      faoMovesPreloading=false; faoMovesPreloaded=false; faoMovesRetry=0; }
    if(faoMovesPreloading||faoMovesPreloaded)return;
    if(faoMovesRetryT)return; // une reprise est deja programmee
    faoMovesPreloading=true;
    Promise.resolve(faoMovesPreload()).then(function(){
      faoMovesPreloading=false;
      if(faoMovesPreloaded){ faoMovesRetry=0; return; } // faoMovesDone : fait par le prechargeur
      // Solide pas encore la : on retente, jusqu'a ce que les maillages arrivent.
      if(faoMovesRetry<75){ faoMovesRetry++;
        faoMovesRetryT=setTimeout(function(){
          try{ faoMovesRetryT=null; }catch(e){}
          faoMovesPreloadSoon();
        },400);
      }else{ faoMovesPreloaded=true; faoMovesRetry=0; faoMovesDone(); } // on n'attend plus
    }, function(){ faoMovesPreloading=false; });
  }catch(e){ faoMovesPreloading=false; }
}
/* ----- lecture SANS calcul : affichage = cache uniquement -----
   Un affichage (nombre de points, temps, stats, stats du posage) ne doit jamais
   declencher une regeneration : tant que le cache IndexedDB est en lecture on
   renvoie « rien » et le panneau affiche « … » — il se remplit tout seul. */
function faoOpMovesTry(op,job){
  try{
    if(op&&(op.type==='rough3d'||op.type==='geofinish')){ try{ faoActiveMesh(job); }catch(e){} }
    const ck=faoOpMovesKey(op,job);
    if(ck===null)return null;
    const ch=faoOpMovesHit(op);
    const secu=faoZoneSecu(op,job);
    if(ch&&ch.key===ck)return faoZoneServe(ch,op,job,secu);
    if(ch&&op&&op.stale===true)return faoZoneServe(ch,op,job,secu); // perime : on affiche l'ancien trace
    return null;
  }catch(e){ return null; }
}
function faoMovesStat(op,job){
  // 1) trace deja en memoire -> tel quel. 2) lecture en cours -> null (« … »).
  // 3) cache persistant DISPONIBLE mais entree absente -> null : on ne recalcule
  //    PAS au passage. Cliquer sur le nom d'une operation n'est pas un ordre de
  //    generation : l'etat le dit (« pas de parcours ») et le bouton ⚠ / « Générer
  //    + aperçu » produit. 4) aucun cache du tout (IndexedDB absent) : on calcule,
  //    comme avant — il n'y a rien d'autre pour servir l'affichage.
  const mv=faoOpMovesTry(op,job);
  if(mv)return mv;
  if(faoMovesPending())return null;
  if(faoMovesReady())return null;
  return faoOpMoves(op,job);
}

/* ----- dispatch : une op -> moves (outil de sa fiche + limite rect) ----- */
function faoOpMoves(op,job){
  // Prime le maillage AVANT la clé : faoSetupFp lit les maillages des corps, il
  // faut qu'ils existent avant de calculer la clé (sinon 'nb' = clé fausse).
  if(op&&(op.type==='rough3d'||op.type==='geofinish')){ try{ faoActiveMesh(job); }catch(e){} }
  // secu = dégagement RELATIF au-dessus du brut (jamais dans la matière).
  // Calculé AVANT les retours cache : la purge des excursions hors zone
  // (faoZoneServe) en a besoin pour rebrancher les jonctions.
  const secu=faoZoneSecu(op,job);
  const ck=faoOpMovesKey(op,job);
  if(ck!==null){
    const ch=faoOpMovesHit(op);
    if(ch&&ch.key===ck)return faoZoneServe(ch,op,job,secu);
    // PERIME : on sert l'ancien trace tant que « Generer + apercu » n'a pas ete
    // presse — une modification ne bouge RIEN a l'ecran d'elle-meme.
    if(ch&&op&&op.stale===true)return faoZoneServe(ch,op,job,secu);
  }
  const tool=faoToolById(job,op&&op.toolId);
  const D=isFinite(+tool.d)&&+tool.d>0?+tool.d:10;
  const sortie=(isFinite(+((job||{}).secu))?+job.secu:5);
  const base={toolD:D, secu:secu, sortie:sortie};
  const RA=faoRA(op||{});
  let mv=[];
  if(!op||!op.type)return [];
  if(op.type==='facing')mv=faoGenFacing(job.stock||faoStockDefault(),
    {toolD:D, ae:isFinite(+op.ae)?+op.ae:D*0.6, np:isFinite(+op.np)?+op.np:0,
     npz:isFinite(+op.npz)?+op.npz:0, sortie:sortie,
     z:(isFinite(+op.z)?+op.z:(job.stock||{}).z1)+RA.axial, secu:secu});
  else if(op.type==='pocket')mv=faoGenPocket({x0:+op.x0,y0:+op.y0,x1:+op.x1,y1:+op.y1},
    +op.ztop,+op.zbot,Object.assign({},base,{ap:+op.ap,ae:isFinite(+op.ae)?+op.ae:D*0.5,
      radial:RA.radial,axial:RA.axial,
      // 2026-10-08-004 : entrée circulaire par défaut (rayon d'entrée op.).
      entry:op.entry||'circ',entryR:op.entryR}));
  else if(op.type==='contour')mv=faoGenContour({x0:+op.x0,y0:+op.y0,x1:+op.x1,y1:+op.y1},
    +op.ztop,+op.zbot,Object.assign({},base,{ap:+op.ap,radial:RA.radial,axial:RA.axial,
      entry:op.entry||'circ',entryR:op.entryR}));
  else if(op.type==='drill')mv=faoGenDrill(faoLimitDrillPts(op,D),+op.ztop,+op.zbot,secu);
  else if(op.type==='rough3d'){
    let am=null;
    try{ am=faoActiveMesh(job); }catch(e){ am=null; }
    // bulge supprimé : la sonde (A/B) montrait une garde identique avec ou
    // sans compensation parent — l'arrondi tangent reste hors mur (≥0.48).
    const brutTop=(job&&job.stock&&isFinite(+job.stock.z1))?+job.stock.z1:null;
    if(am&&am.mesh)mv=faoGenRough3D(am.mesh,am.box,+op.ztop,+op.zbot,
      {ap:+op.ap,ae:isFinite(+op.ae)?+op.ae:D*0.6,toolD:D,
       radial:RA.radial,axial:RA.axial,
       minipasses:isFinite(+op.minipasses)?+op.minipasses:0,
       finitParois:!!op.finitParois,finitN:op.finitN,finitProf:op.finitProf,
        // 2026-10-08-004 : entrée CIRC par défaut (doc sans champ = arc
        // tangent, repli hélice/rampe si pas d'ancre ; 'auto' = legacy).
        entry:op.entry||'circ',entryR:op.entryR,brutTop:brutTop,secu:secu,
        // 2026-10-07-005 : mode de vidage — 'escargot' = spirale centre ->
        // faces (faoSpiralLevel) ; absent = conventionnel (documents anciens).
        // 2026-10-08-001 : la poche d'entree (o.poly) a disparu avec le mode
        // trocoïdal.
        // 2026-10-08-002 : remPlan = remontées « toujours plan de retrait »
        // (posage.planes.mode) : les liaisons tiennent secu (le plan) au lieu
        // de remonter à 5 mm au-dessus de la matière (mode 'min5').
        remPlan:!!(job&&job.planes&&job.planes.mode==='plan'),
        mode:op.mode,
        // 2026-10-08-003 : sens de passe — 'avalant' = sens de coupe constant
        // (aucune chaine retournee) ; absent/'bidir' = legacy (retournement
        // vers l'extremite la plus proche).
        sens:op.sens});
  }
  else if(op.type==='geofinish'){
    let am=null;
    try{ am=faoActiveMesh(job); }catch(e){ am=null; }
    if(am&&am.mesh){
      const tool=faoToolById(job,op.toolId);
      mv=faoGenGeoFinish(am.mesh,
        {step:isFinite(+op.step)?+op.step:1,toolD:D,kind:tool.kind,
         cornerR:tool.cornerR,laisse:+op.laisse||0,secu:secu,seed:op.seed||'top',
         ztop:op.ztop,zbot:op.zbot,
         // 2026-10-08-004 : entrée CIRC par défaut (doc sans champ = arc tangent ;
         // sans ébauche 3D amont, faoGeoEntryMode retombe sur la rampe).
         entry:op.entry||'circ',entryR:op.entryR,hasRrough:faoGeoHasRrough(job,op)});
      op.geoBlocked=(tool.kind==='flat'&&!mv.length);
    }else op.geoBlocked=false;
  }
  // Limite : rect (Liang-Barsky rapide) ou chaîne d'arêtes (clip impair).
  // Phase suivante : chaîne d'arêtes multiples, faces.
  const lim=op.limit;
  // 2026-10-08-003 : zone intérieure (îlot) — clip en COMPLÉMENT, après
  // l'extérieur (les deux se composent en intersection).
  const lim2=op.limit2;
  if(lim&&lim.mode==='rect'&&mv.length){
    const R=faoEffLimit(op,D);
    if(R)mv=faoClipMovesXY(mv,R,secu);
  }else if(lim&&lim.mode==='chain'&&lim.loop&&lim.loop.length>=3&&mv.length){
    mv=faoClipMovesPoly(mv,lim,D/2,secu,2);
  }
  if(lim2&&mv.length){
    if(lim2.mode==='rect'){
      const R2=faoLimit2R(lim2,D);
      if(R2)mv=faoClipMovesXY(mv,R2,secu,true);
    }else if(lim2.mode==='chain'&&lim2.loop&&lim2.loop.length>=3){
      mv=faoClipMovesPoly(mv,lim2,D/2,secu,2,
        function(x,y){ return !faoLimInside(x,y,lim2,D/2); });
    }
  }
  // Arrondi des coins (trajectoires circulaires) : ébauche 3D + 2.5D
  // (surfaçage/poche/contour). 0 = angles vifs.
  if(op&&isFinite(+op.arrondi)&&+op.arrondi>0&&mv.length&&
     (op.type==='rough3d'||op.type==='facing'||op.type==='pocket'||op.type==='contour'))
    mv=faoRoundMoves(mv,+op.arrondi);
  // ZONE = frontière inviolable pendant le travail : garde-fou de coupe posé
  // EN DERNIER (faoRoundMoves crée ses arcs APRÈS le clip — un arrondi pouvait
  // dépasser la frontière). Les rapides, eux, traversent librement.
  // 2026-10-08-003 : l'îlot intérieur compte comme une zone (ctx composé).
  if((lim||lim2)&&mv.length)mv=faoZoneCuts(mv,op,job,secu);
  if(ck!==null)faoOpMovesStore(op,ck,mv);
  if(ck!==null)faoMovesSave(job,op,ck,mv); // persistance : prochaine ouverture = lecture
  if(op){ try{ op.stale=false; }catch(e){} } // generation fraiche
  return mv;
}
function faoJobMoves(job){
  // Regroupe par outil (changement d'outil si l'id change). Les ops
  // désactivées (on=false) sont ignorées partout (aperçu, temps, G-code).
  const out=[]; let cur=null;
  ((job&&job.ops)||[]).forEach(function(op){
    if(op&&op.on===false)return;
    const tool=faoToolById(job,op&&op.toolId);
    const sf=faoToolSF(tool,job);
    const key=tool.id+'|'+tool.d;
    if(!cur||cur.key!==key){
      cur={key:key, tool:{id:tool.id,num:tool.num,name:tool.name,d:tool.d,
        s:sf.s, f:sf.f, plunge:sf.plunge}, blocks:[]};
      out.push(cur);
    }
    cur.blocks.push({op:op,moves:faoOpMoves(op,job)});
  });
  return out;
}

/* ----- estimation : longueurs + temps ----- */
/* ----- arcs G2/G3 : longueur, subdivision (aperçu), arrondi des coins ----- */
// Move circulaire : {r:0, x,y,z, arc:{i,j,cw}} — i,j = centre RELATIF au point
// de départ (IJK incrémental, accepté par 840D comme 8065, balayage < 180°).
function faoSegLen(p0,m){
  if(!m.arc)return Math.hypot(m.x-p0.x,m.y-p0.y,m.z-p0.z);
  const r=Math.hypot(m.arc.i,m.arc.j);
  if(!(r>1e-9))return Math.hypot(m.x-p0.x,m.y-p0.y,m.z-p0.z);
  // Centre = point de DÉPART + IJK (incrémental départ, comme les CN).
  const cx=p0.x+m.arc.i, cy=p0.y+m.arc.j;
  let a0=Math.atan2(p0.y-cy,p0.x-cx);
  let a1=Math.atan2(m.y-cy,m.x-cx);
  let sw=a1-a0;
  if(m.arc.cw){ while(sw>=0)sw-=2*Math.PI; }
  else{ while(sw<=0)sw+=2*Math.PI; }
  return Math.abs(sw)*r;
}
function faoArcSegs(p0,m,maxStep){
  // Subdivision d'arc pour l'aperçu/visionneuse : ADAPTATIVE (sagitta
  // ≤ 0.05 mm) — un grand rayon est découpé bien au-delà de 5° pour que
  // le cercle reste un cercle à l'écran ; les petits rayons gardent 5°.
  const pts=[];
  if(!m.arc)return pts;
  const r=Math.hypot(m.arc.i,m.arc.j);
  if(!(r>1e-9))return pts;
  const cx=p0.x+m.arc.i, cy=p0.y+m.arc.j;
  let a0=Math.atan2(p0.y-cy,p0.x-cx), a1=Math.atan2(m.y-cy,m.x-cx);
  let sw=a1-a0;
  if(m.arc.cw){ while(sw>=0)sw-=2*Math.PI; }
  else{ while(sw<=0)sw+=2*Math.PI; }
  const sag=0.05; // écart de corde max (mm)
  const dth0=Math.PI/36; // 5° : plafond angulaire historique
  let dth=dth0;
  if(r>sag){
    const c=1-sag/r;
    const d=2*Math.acos(c>1?1:(c<-1?-1:c)); // sagitta : dth = 2·acos(1−sag/r)
    if(isFinite(d)&&d>0&&d<dth)dth=d;
  }
  const n=Math.max(2,Math.min(1024,Math.ceil(Math.abs(sw)/dth)));  for(let i=1;i<=n;i++){
    const a=a0+sw*i/n;
    pts.push([cx+r*Math.cos(a),cy+r*Math.sin(a),p0.z+(m.z-p0.z)*i/n]);
  }
  return pts;
}
function faoRoundPath(pts,radius){
  // Remplace chaque coin (changement de direction 1°..179°) par un arc
  // tangent de rayon donné. Retourne des moves {r:0} (droites + arcs).
  const out=[];
  const R=isFinite(+radius)&&+radius>0?+radius:0;
  if(!(R>0)||!pts||pts.length<3)return (pts||[]).map(function(p){return {r:0,x:p.x,y:p.y,z:p.z};});
  const P=pts.map(function(p){return {x:+p.x,y:+p.y,z:+p.z};});
  out.push({r:0,x:P[0].x,y:P[0].y,z:P[0].z});
  for(let i=1;i+1<P.length;i++){
    const a=P[i-1], b=P[i], c=P[i+1];
    if(Math.abs(b.z-a.z)>1e-9||Math.abs(c.z-b.z)>1e-9){
      out.push({r:0,x:b.x,y:b.y,z:b.z}); // pas d'arc hors plan : on garde le coin
      continue;
    }
    const vix=b.x-a.x, viy=b.y-a.y, li=Math.hypot(vix,viy);
    const vox=c.x-b.x, voy=c.y-b.y, lo=Math.hypot(vox, voy);
    if(li<1e-9||lo<1e-9){ out.push({r:0,x:b.x,y:b.y,z:b.z}); continue; }
    const ux=vix/li, uy=viy/li, vx=vox/lo, vy=voy/lo;
    const dot=Math.max(-1,Math.min(1,ux*vx+uy*vy));
    const theta=Math.acos(dot); // angle de braquage
    if(!(theta>0.017&&theta<3.124)){ out.push({r:0,x:b.x,y:b.y,z:b.z}); continue; }
    let t=R*Math.tan(theta/2); // distance tangente : R·tan(θ/2)
    t=Math.min(t,li/2,lo/2);
    const rr=t/Math.tan(theta/2); // rayon effectif ≤ R (exact si non clampé)
    const ax=b.x-ux*t, ay=b.y-uy*t, bx=b.x+vx*t, by=b.y+vy*t;
    const cross=ux*vy-uy*vx;
    const sgn=cross>0?1:-1; // virage à gauche (CCW) : centre à gauche
    let nx=-uy*sgn, ny=ux*sgn;
    const cx=ax+nx*rr, cy=ay+ny*rr;
    // Vérifie la tangence à la sortie (garde contre les cas limites).
    if(Math.abs(Math.hypot(bx-cx,by-cy)-rr)>Math.max(1e-6,rr*1e-3)){
      out.push({r:0,x:b.x,y:b.y,z:b.z}); continue;
    }
    out.push({r:0,x:ax,y:ay,z:b.z});
    out.push({r:0,x:bx,y:by,z:b.z,arc:{i:cx-ax,j:cy-ay,cw:sgn<0}});
  }
  const last=P[P.length-1];
  out.push({r:0,x:last.x,y:last.y,z:last.z});
  return out;
}
function faoRoundMoves(moves,radius){
  // Arrondit les passages coupés, passe par passe (les rapides coupent).
  const R=isFinite(+radius)&&+radius>0?+radius:0;
  if(!(R>0))return moves;
  const out=[]; let run=[];
  const flush=function(){
    if(run.length>=3){
      const rounded=faoRoundPath(run,R);
      // Le 1er point est déjà la position courante : on l'omet.
      for(let i=1;i<rounded.length;i++)out.push(rounded[i]);
    }else{
      run.forEach(function(p){out.push({r:0,x:p.x,y:p.y,z:p.z});});
    }
    run=[];
  };
  (moves||[]).forEach(function(m){
    if(m.r||m.arc){ flush(); out.push(m); return; }
    run.push({x:m.x,y:m.y,z:m.z});
  });
  flush();
  return out;
}
function faoEstimate(moves,fCut,fRap,accel){
  const fc=isFinite(+fCut)&&+fCut>0?+fCut:1200;
  const fr=isFinite(+fRap)&&+fRap>0?+fRap:5000;
  const A=isFinite(+accel)&&+accel>0?+accel:1000;
  let cut=0, rap=0, nr=0, prev=null;
  (moves||[]).forEach(function(m){
    if(prev!==null){
      const d=faoSegLen(prev,m);
      if(m.r){ rap+=d; nr++; } else cut+=d;
    }
    prev=m;
  });
  // Temps rapide réel : d/v + v/A (trapèze : la décélération « paie » l'accélération).
  // v en mm/s = fr/60, A en mm/s² -> v/A en secondes, converti en minutes.
  const tmin=cut/fc+rap/fr+nr*(fr/60)/A/60;
  return {cut:cut, rap:rap, nr:nr, tmin:tmin};
}

/* ----- origine pièce (point de bloc sur le brut, préréglages) ----- */
// Le G-code est exprimé RELATIF à ce point (= position du G54 sur la machine).
// Phase suivante : point pièce cliqué + orientation (3+2).
function faoOriginPoint(setup){
  const s=(setup&&setup.stock)||faoStockDefault();
  const pr=(setup&&setup.origin&&setup.origin.preset)||'top-X0Y0';
  if(pr==='top-X1Y1')return [s.x1,s.y1,s.z1];
  if(pr==='top-C')return [(s.x0+s.x1)/2,(s.y0+s.y1)/2,s.z1];
  if(pr==='bot-X0Y0')return [s.x0,s.y0,s.z0];
  return [s.x0,s.y0,s.z1]; // 'top-X0Y0' : dessus, coin X0 Y0 (défaut atelier)
}
function faoOriginLabel(setup){
  const pr=(setup&&setup.origin&&setup.origin.preset)||'top-X0Y0';
  return pr==='top-X1Y1'?'dessus coin X1Y1':pr==='top-C'?'dessus centre':
    pr==='bot-X0Y0'?'dessous coin X0Y0':'dessus coin X0Y0';
}
/* ----- plans : retrait (absolu, auto = dessus + 25) ----- */
// 2026-10-08-002 : le plan de dégagement/retrait se règle par RÉFÉRENCE
// (`setup.planes` / `op.planes`) ; les anciens champs absolus `retract` /
// `safeZ` restent le repli des documents qui n'ont jamais touché les plans.
function faoRetractZ(setup){
  if(setup&&setup.planes&&setup.planes.retr){
    const z=faoPlaneZ(setup.planes.retr,null,setup,0);
    if(isFinite(z))return z;
  }
  if(setup&&isFinite(+setup.retract))return +setup.retract;
  const s=(setup&&setup.stock)||faoStockDefault();
  return (isFinite(+s.z1)?+s.z1:0)+25;
}
/* ----- plan de sécurité / dégagement : 100 mm au-dessus de la pièce ----- */
// Tout RAPIDE qui translate en XY passe par ce plan : on remonte d'abord, on
// traverse au plan, puis on plonge. Jamais de translation en Z bas (l'outil
// ne doit pas traverser la matière en G0).
function faoSafeZ(job){
  if(job&&job.planes&&job.planes.clear){
    const z=faoPlaneZ(job.planes.clear,null,job,0);
    if(isFinite(z))return z;
  }
  if(job&&isFinite(+job.safeZ)&&+job.safeZ>-1e9)return +job.safeZ;
  const s=(job&&job.stock)||faoStockDefault();
  return (isFinite(+s.z1)?+s.z1:0)+100; // le brut contient la pièce
}
function faoSafeAhead(prev,m,safe){
  // Points à inserrer AVANT le rapide m (m est ensuite émis tel quel : il devient
  // la plongée verticale au bon XY). null = m peut partir directement.
  if(!m||!m.r)return null;
  if(!prev)return (m.z<safe-1e-9)?[{r:1,x:m.x,y:m.y,z:safe}]:null;
  if(Math.hypot(m.x-prev.x,m.y-prev.y)<=1e-9)return null; // pur axe Z : retrait déjà fait
  if(prev.z>=safe-1e-9&&m.z>=safe-1e-9)return null;       // tout se passe au plan
  const ins=[];
  if(prev.z<safe-1e-9)ins.push({r:1,x:prev.x,y:prev.y,z:safe}); // retrait sur place
  if(m.z<safe-1e-9)ins.push({r:1,x:m.x,y:m.y,z:safe});          // translation au plan
  return ins;
}
function faoSeqSafe(job,seule){
  // Séquence complète du posage [{op,moves}] avec rapides normalisés au plan de
  // sécurité DE CHAQUE OPÉRATION (2026-10-08-002 : plans par opération, hérités
  // du posage). Source unique partagée par l'aperçu, le visionneuse et le G-code.
  // seule=true : LECTURE SEULE — un parcours absent de la memoire est IGNORE
  // (absent:true), jamais calcule : afficher/masquer une trace ne regenerate rien.
  const res=[]; let prev=null;
  ((job&&job.ops)||[]).forEach(function(op){
    if(!op||op.on===false)return;
    const safe=faoClearAbs(op,job); // plan de dégagement de CETTE opération
    let mv=null;
    if(seule){
      mv=faoOpMovesTry(op,job);
      if(mv===null){ res.push({op:op,moves:[],absent:true}); return; }
    }else mv=faoOpMoves(op,job)||[];
    const out=[];
    for(let i=0;i<mv.length;i++){
      const m=mv[i];
      const ins=faoSafeAhead(prev,m,safe);
      if(ins)for(let k=0;k<ins.length;k++)out.push(ins[k]);
      out.push(m);
      prev=m;
    }
    // Perçage émis en cycle dialecte : la machine repose au plan du cycle
    // (plan de retrait de l'opération = RTP), sous le plan de sécurité.
    if(op.type==='drill'&&mv.length){
      prev={x:mv[mv.length-1].x,y:mv[mv.length-1].y,z:faoZoneSecu(op,job)};
    }
    res.push({op:op,moves:out});
  });
  return res;
}
/* ================= post-processeurs ================= */
// Table des machines : `kind` porte le dialecte (commentaires, numérotation,
// fin de programme) — le corps du programme est commun aux dialectes.
const FAO_POSTS={
  siemens630:{label:'Siemens 840D · 630', ext:'mpf', parkX:'X-200', kind:'siemens'},
  siemens1520:{label:'Siemens 840D · 1520', ext:'mpf', parkX:'X-430', kind:'siemens'},
  fagor8065:{label:'Fagor 8065', ext:'nc', kind:'fagor'}
};
function faoToday(){ try{ return new Date().toISOString().slice(0,10); }catch(e){ return ''; } }

function faoArcWords(m,ox,oy,oz){
  // Bloc G2/G3 complet, IJK incrémental (centre relatif au départ).
  return (m.arc.cw?'G2 ':'G3 ')+'X'+faoFmtXYZ(m.x-ox)+' Y'+faoFmtXYZ(m.y-oy)+
    ' Z'+faoFmtXYZ(m.z-oz)+' I'+faoFmtXYZ(m.arc.i)+' J'+faoFmtXYZ(m.arc.j);
}
/* ----- cycle de perçage dialecte (P1-a) -----
   Mêmes valeurs que le déroulé G0/G1 (retrait = plan d'usinage de l'opération
   depuis 2026-10-08-002, plan de référence = ztop, profondeur = zbot) : la
   prévisualisation, l'estimation et le garde-fou « sous le brut » restent
   calés sur le déroulé.
   Siemens 840D : CYCLE81(RTP,RFP,SDIS,DP) / CYCLE83 (broche à va-et-vient,
   paramètres alignés sur PostPro/630-5axes.cps).
   Fagor 8065    : `G98 G81 X Y Z I F` / `G98 G83 X Y Z I J F` (aligné sur
   PostPro/fagor-8065.cps) + annulation `G80` (cycles modaux). */
function faoDrillCycle(op,job,oz){
  if(!op||op.type!=='drill')return null;
  const tool=faoToolById(job,op.toolId)||{};
  const pts=faoLimitDrillPts(op,+tool.d);
  const zt=+op.ztop, zb=+op.zbot;
  if(!pts||!pts.length||!isFinite(zt)||!isFinite(zb))return null;
  // 2026-10-08-002 : retrait du cycle = plan d'usinage de l'opération (T) —
  // identique à l'ancien top+secu en mode 'min5' sans plan personnalisé.
  const secuAbs=faoZoneSecu(op,job);
  const RFP=zt-oz, RTP=secuAbs-oz, SDIS=RTP-RFP, DP=zb-oz;
  let peck=isFinite(+op.peck)?+op.peck:0;
  const span=zt-zb;
  if(!(peck>0&&span>peck))peck=0;
  return {pts:pts,RTP:RTP,RFP:RFP,SDIS:SDIS,DP:DP,peck:peck,span:span};
}
// Post unifié : un seul corps de programme, dialecte réduit à la tête/pied + style de ligne.
//  - Siemens 840D : lignes brutes, commentaires `;`, fin SUPA Z600 + parc machine
//  - Fagor 8065    : lignes numérotées `N##` (+5), commentaires `( … )`, retrait Z classique
// Plongée : le F de plongée ne s'applique qu'à la première plongée Z après un rapide —
// un pur déplacement XY garde l'avance de coupe (correctif du bug Fagor).
function faoPost(job,postId){
  const id=postId||(job&&(job.machine||job.post))||'siemens630';
  const post=FAO_POSTS[id]||FAO_POSTS.siemens630;
  const fag=post.kind==='fagor';
  const name=faoProgName(job.name);
  const wcs=job.wcs||'G54';
  const OG=faoOriginPoint(job), ox=OG[0], oy=OG[1], oz=OG[2];
  // Repli : plan de retrait du posage (aucune op ON -> groupe sans bloc).
  const retr=faoRetractZ(job);
  let retrPrev=retr; // plan de retrait du groupe précédent (retrait inter-outils)
  // Indexation 3+2 (table C + B) : {0,0} = 3 axes strictement inchangé.
  const ORI=faoOrient(job), ori32=(ORI.b!==0||ORI.c!==0);
  const groups=faoJobMoves(job);
  const SEQ=faoSeqSafe(job); // rapids normalisés au plan de sécurité
  const safe=faoSafeZ(job);
  // Garde-fou : aucun move de coupe (G1/G2/G3) sous le fond du brut — signalé en
  // tête de programme (le opérateur le voit) et remonté dans le résultat (warns).
  const z0=(job&&job.stock&&isFinite(+job.stock.z0))?+job.stock.z0:0;
  let sousBrut=0, zMin=Infinity;
  groups.forEach(function(g){ g.blocks.forEach(function(b){ b.moves.forEach(function(m){
    if(!m.r&&isFinite(+m.z)&&+m.z<z0-1e-6){ sousBrut++; if(+m.z<zMin)zMin=+m.z; }
  });}); });
  const warns=[];
  if(sousBrut)warns.push(sousBrut+' move(s) de coupe sous le brut (Zmin '+
    faoFmtXYZ(zMin)+' < fond du brut '+faoFmtXYZ(z0)+')');
  if(ori32&&fag)warns.push('3+2 (B'+ORI.b+' C'+ORI.c+') : Fagor 8065 = machine 3 axes — indexation '+
    'IGNORÉE : B/C non commandés, programme émis en 3 axes (la pièce ne sera PAS inclinée). '+
    'Remettre 3 axes ou exporter sur Siemens.');
  const staleCh=(job.ops||[]).filter(function(o){
    return o&&o.on!==false&&((o.limit&&o.limit.mode==='chain'&&o.limit.stale)||
      (o.limit2&&o.limit2.mode==='chain'&&o.limit2.stale)||(o.zlim&&o.zlim.stale));
  }).length;
  if(staleCh)warns.push(staleCh+' opération(s) : limite « chaîne »/îlot/Z obsolète (arêtes du modèle '+
    'non retrouvées) — re-sélectionner les arêtes avant export');
  const L=[]; let n=10;
  const nc=function(s){ if(fag){ L.push('N'+n+' '+s); n+=5; } else L.push(s); };
  const cmt=function(s){ L.push(fag?('( '+s+' )'):('; '+s)); };
  const cool=fag?((job.coolant==='off')?null:'M08')
                :((job.coolant==='off')?'M9':(job.coolant==='through'?'M8':'M7'));
  // G40 (annule la compensation d'outil) + G80 (annule les cycles en canneau) en
  // entête : programme démarré proprement, jamais laissé d'un usage précédent.
  if(fag){
    L.push('('+name+' - MiniFusion FAO '+FAO_VER+' - '+post.label+' - '+faoToday()+')');
    L.push('('+faoOriginLabel(job)+' - origine '+wcs+')');
    if(warns.length)cmt('ATTENTION : '+warns.join(' ; '));
    nc('G71 G40 G80 G17 G90 G94 '+wcs);
  }else{
    L.push('; %_N_'+name+'_MPF');
    L.push('; MiniFusion FAO '+FAO_VER+' — '+post.label+' — '+faoToday());
    L.push('; Origine '+wcs+' : '+faoOriginLabel(job)+
      ' ('+faoFmtXYZ(ox)+','+faoFmtXYZ(oy)+','+faoFmtXYZ(oz)+')');
    if(warns.length)cmt('ATTENTION : '+warns.join(' ; '));
    nc('G71');
    nc('G40 G80 G17 G90 G94 '+wcs);
  }
  // 3+2 : indexation de table AVANT tout usinage. Siemens : TRAORI(1) — le
  // contrôleur transforme XYZ (arcs et cycles restent dans le repère pièce).
  // Fagor 8065 = machine 3 AXES uniquement : aucun axe rotatif — ne JAMAIS
  // commander B/C (alarme CN) ni laisser croire à une inclinaison : à plat.
  if(ori32){
    if(fag){
      cmt('3+2 : B'+faoFmtXYZ(ORI.b)+' C'+faoFmtXYZ(ORI.c)+
        ' demandé — machine 3 axes : B/C NON commandés, usinage à plat (voir avertissement)');
    }else{
      nc('TRAORI(1)');
      nc('G0 B'+faoFmtXYZ(ORI.b)+' C'+faoFmtXYZ(ORI.c));
    }
  }
  nc('G0 Z'+faoFmtXYZ(safe-oz)); // plan de sécurité : Z seul avant tout déplacement XY
  let qi=0, prev=null;
  groups.forEach(function(g,gi){
    const t=g.tool;
    const S=faoFmtS(t.s), F=faoFmtF(t.f), FP=faoFmtF(t.plunge);
    // Plan de retrait du groupe en cours = plan de sa 1re opération (hérité
    // du posage sinon) — 2026-10-08-002, plans par opération.
    let retrCur=retr;
    for(let bi=0;bi<(g.blocks||[]).length;bi++){
      const qb=g.blocks[bi]&&g.blocks[bi].op;
      if(qb&&qb.on!==false){ retrCur=faoRetractAbs(qb,job); break; }
    }
    if(gi>0){ nc(fag?'M09':'M9'); nc('G0 Z'+faoFmtXYZ(retrPrev-oz)); }
    retrPrev=retrCur;
    cmt('OUTIL T'+(t.num||1)+' '+faoKindLabel((faoToolById(job,t.id)||{}).kind)+
      ' D'+faoFmtXYZ(t.d)+' S'+S+' F'+F);
    if(fag){ nc('T'+(t.num||1)+' D1 M06'); }else{ nc('T'+(t.num||1)+' D1'); nc('M6'); }
    nc('S'+S+(fag?' M03':' M3'));
    if(cool&&cool!=='M9')nc(cool);
    g.blocks.forEach(function(b){
      cmt(faoOpLabel(b.op,job));
      const sq=SEQ[qi++]||{moves:b.moves};
      // Plan de dégagement de CETTE opération (hérité du posage sinon) —
      // 2026-10-08-002 : la plongée/translation passe par son propre plan.
      const safeB=faoClearAbs(b.op,job);
      // P1-a : perçage émis en cycle dialecte — le déroulé G0/G1 reste la
      // source prévisualisation/estimation/garde-fou mais n'est pas écrit ici.
      const DC=faoDrillCycle(b.op,job,oz);
      if(DC){
        DC.pts.forEach(function(p){
          const X='X'+faoFmtXYZ(+p[0]-ox), Y='Y'+faoFmtXYZ(+p[1]-oy);
          if(fag){
            if(DC.peck){
              const pl=Math.max(Math.floor(DC.span/DC.peck),1);
              const inc=-(DC.span/pl);
              nc('G98 G83 '+X+' '+Y+' Z'+faoFmtXYZ(DC.RTP)+
                ' I'+faoFmtXYZ(inc)+' J'+pl+' F'+FP);
            }else{
              nc('G98 G81 '+X+' '+Y+' Z'+faoFmtXYZ(DC.RTP)+
                ' I'+faoFmtXYZ(DC.DP)+' F'+FP);
            }
          }else{
            // F de plongée sur chaque G0 : séquence d'avances identique au Fagor.
            nc('G0 '+X+' '+Y+' Z'+faoFmtXYZ(DC.RTP)+' F'+FP);
            nc(DC.peck
              ? 'CYCLE83('+faoFmtXYZ(DC.RTP)+', '+faoFmtXYZ(DC.RFP)+', '+
                faoFmtXYZ(DC.SDIS)+', '+faoFmtXYZ(DC.DP)+', , '+
                faoFmtXYZ(DC.RFP-DC.peck)+', , 0, , , 1, 1, , '+
                faoFmtXYZ(DC.peck)+', 0, 0, 0)'
              : 'CYCLE81('+faoFmtXYZ(DC.RTP)+', '+faoFmtXYZ(DC.RFP)+', '+
                faoFmtXYZ(DC.SDIS)+', '+faoFmtXYZ(DC.DP)+', )');
          }
        });
        if(fag)nc('G80'); // Fagor : les cycles sont modaux, annulation obligatoire
        // La machine repose au plan du cycle (dessus + sortie) sur le dernier trou.
        if(DC.pts.length){
          const lp=DC.pts[DC.pts.length-1];
          prev={x:+lp[0],y:+lp[1],z:faoZoneSecu(b.op,job)};
        }
        return;
      }
      let first=true;
      sq.moves.forEach(function(m){
        // Plan de sécurité : retrait sur place -> translation au plan -> plongée.
        const ins=faoSafeAhead(prev,m,safeB);
        if(ins)for(let q=0;q<ins.length;q++){
          const J=ins[q];
          nc('G0 X'+faoFmtXYZ(J.x-ox)+' Y'+faoFmtXYZ(J.y-oy)+' Z'+faoFmtXYZ(J.z-oz));
          first=true;
        }
        const X='X'+faoFmtXYZ(m.x-ox), Y='Y'+faoFmtXYZ(m.y-oy), Z='Z'+faoFmtXYZ(m.z-oz);
        if(m.r){ nc('G0 '+X+' '+Y+' '+Z); first=true; }
        else if(m.arc){ nc(faoArcWords(m,ox,oy,oz)+' F'+F); first=false; }
        else{
          // première plongée après un rapide : avance de plongée, sinon avance de coupe.
          const plunge=first&&/Z/.test(Z);
          nc('G1 '+X+' '+Y+' '+Z+' F'+(plunge?FP:F));
          first=false;
        }
        prev=m;
      });
    });
  });
  // 3+2 : annuler la transformation AVANT les coordonnées machine de fin (SUPA/park).
  if(ori32&&!fag)nc('TRAFOOF');
  if(fag){
    nc('M09');
    nc('G0 Z'+faoFmtXYZ(retrPrev-oz));
  }else{
    nc('M9');
    nc('G0 SUPA Z600 D0');
    nc('G0 '+post.parkX);
  }
  nc('M30');
  return {code:L.join('\n')+'\n', ext:post.ext, warns:warns};
}

function faoOpLabel(op,job){
  if(!op)return '?';
  const t=op.type;
  const tool=job?faoToolById(job,op.toolId):null;
  const tag=tool?(' [T'+tool.num+' D'+tool.d+']'):'';
  const off=(op&&op.on===false)?' (désactivée)':'';
  const RA=faoRA(op||{});
  const ra=((op&&(op.type==='pocket'||op.type==='contour'||op.type==='rough3d'||op.type==='facing'))&&(RA.radial>0||RA.axial>0))?(' R'+RA.radial+' A'+RA.axial):'';
  const lim=((op&&op.limit&&(op.limit.mode==='rect'||(op.limit.mode==='chain'&&(op.limit.loop||[]).length>=3)))
    ?' [limite]'+(op.limit.stale?'⚠':''):'')
    +((op&&op.limit2&&(op.limit2.mode==='rect'||(op.limit2.mode==='chain'&&(op.limit2.loop||[]).length>=3)))
    ?' [îlot]'+(op.limit2.stale?'⚠':''):'')
    +((op&&op.zlim)?' [Z]'+(op.zlim.stale?'⚠':''):'');
  if(t==='facing')return 'Surfaçage Z='+op.z+tag+off+ra+lim;
  if(t==='pocket')return 'Poche ['+op.x0+','+op.y0+' -> '+op.x1+','+op.y1+'] '+op.ztop+' -> '+op.zbot+ra+tag+off+lim;
  if(t==='contour')return 'Contour ['+op.x0+','+op.y0+' -> '+op.x1+','+op.y1+'] '+op.ztop+' -> '+op.zbot+ra+tag+off+lim;
  if(t==='drill')return 'Perçage '+(op.pts||[]).length+' trou(s) '+op.ztop+' -> '+op.zbot+((+op.peck)>0?' Q'+op.peck:'')+tag+off+lim;
  if(t==='rough3d')return 'Ébauche 3D '+op.ztop+' -> '+op.zbot+' ap '+op.ap+ra+tag+off+lim;
  if(t==='geofinish')return 'Finition géodésique pas '+op.step+tag+off+lim;
  return t;
}

/* ================= prévisualisation 3D (décor, jamais de rejeu) ================= */
let faoPrevGroup=null, faoPrevOn=true;
let faoPrevStale=false; // « calculer puis valider » : vrai = aperçu/programme périmé
let faoPrevWanted=false; // 'full'/'lecture' : travail reporte jusqu'a la fin de la lecture du cache
let faoGenBtnEl=null;   // refs RÉELLES des boutons (lecture par id ambiguë sous stub)
let faoExportBtnEl=null;
function faoClearPreview(){
  try{
    if(faoPrevGroup&&typeof scene!=='undefined'&&scene){
      scene.remove(faoPrevGroup);
      try{ faoPrevGroup.traverse(function(o){ if(o.geometry&&o.geometry.dispose)o.geometry.dispose(); }); }catch(e){}
    }
  }catch(e){}
  faoPrevGroup=null;
}
let faoPrevMissing=0; // ops sans parcours en memoire lors du dernier redraw en LECTURE
function faoSegSplit(moves,clip){
  // Segments par PAIRE CONSECUTIVE de la séquence réelle : coupe->coupe en
  // vert, tout passage par un rapide en rouge. Aucune liaison fantôme.
  // `clip` (zone de l'opération) ne borne QUE la coupe : la zone est une
  // frontière inviolable pendant le travail, mais un G0 a le droit de la
  // traverser — retour chercher un outil, liaison entre opérations.
  // 2026-10-08-004 : PLOONGÉES en bleu — un G1 strictement vertical qui
  // descend (plongée d'outil) sort du vert coupe ; les G0 restent rouges.
  // -> {cut:[x,y,z,...], rap:[x,y,z,...], plg:[x,y,z,...]}
  const out={cut:[],rap:[],plg:[]};
  if(!moves||!moves.length)return out;
  let prev=null;
  const seg=function(arr,ax,ay,az,bx,by,bz,coupe){
    if(!clip||!coupe){ arr.push(ax,ay,az,bx,by,bz); return; }
    clip(ax,ay,az,bx,by,bz,function(x1,y1,z1,x2,y2,z2){ arr.push(x1,y1,z1,x2,y2,z2); });
  };
  moves.forEach(function(m){
    if(prev!==null){
      // plongée = G1 vertical descendant (mêmes XY, Z qui baisse) — bleu.
      const plg=!m.r&&!m.arc&&Math.abs(m.x-prev.x)<1e-9&&Math.abs(m.y-prev.y)<1e-9&&m.z<prev.z-1e-9;
      // 2026-10-08-005 : les moves étiquetés ent (hélice, rampe, arc circ,
      // descente d'entrée) sont regroupés en « plongée » pour le tracé bleu.
      const arr=(m.r)?out.rap:((plg||m.ent)?out.plg:out.cut); // le segment prend la commande de SA destination (G0 -> rouge)
      const coupe=!m.r;
      if(m.arc&&!prev.r){
        let pp={x:prev.x,y:prev.y,z:prev.z};
        faoArcSegs(prev,m).forEach(function(q){
          seg(arr,pp.x,pp.y,pp.z,q[0],q[1],q[2],coupe); pp={x:q[0],y:q[1],z:q[2]};
        });
      }else{
        seg(arr,prev.x,prev.y,prev.z,m.x,m.y,m.z,coupe);
      }
    }
    prev=m;
  });
  return out;
}
function faoRefreshPreview(mode){
  // mode='calcule' : SEUL cas ou l'on PRODUIT les parcours absents — réservé à
  // « Tout régénérer ». Défaut (et mode=true) : LECTURE SEULE — on dessine ce
  // qui existe déjà en mémoire. Un affichage (ouverture, œil Masquer, repli de
  // l'arbre, modification, annuler/rétablir) ne doit jamais régénérer : sans
  // entrée en base, il laisserait simplement un trou (faoPrevMissing).
  const seule=(mode!=='calcule');
  faoClearPreview();
  if(!faoPrevOn)return 0;
  const job=faoDoc(); let total=0; faoPrevMissing=0;
  try{
    if(typeof THREE==='undefined'||typeof scene==='undefined'||!scene)return 0;
    faoPrevGroup=new THREE.Group(); faoPrevGroup.name='faoPreview';
    const mk=function(moves,clip){
      // Coupe en vert, rapides en rouge — faoSegSplit borne la coupe à la zone
      // et laisse les G0 traverser librement (cf. faoSegSplit).
      if(!moves||!moves.length)return;
      try{
        const sp=faoSegSplit(moves,clip);
        const cut=sp.cut, rap=sp.rap;
        const add=function(arr,color,alpha){
          if(arr.length<6)return;
          const g=new THREE.BufferGeometry();
          g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(arr),3));
          const mat=new THREE.LineBasicMaterial({color:color});
          // Rapides en transparence : ils ne doivent pas masquer le parcours vert.
          if(alpha!==undefined&&alpha<1){ mat.transparent=true; mat.opacity=alpha; mat.depthWrite=false; }
          faoPrevGroup.add(new THREE.LineSegments(g,mat));
        };
        add(cut,0x30d158);
        add(rap,0xff453a,0.3);
        // 2026-10-08-004 : plongées (G1 vertical descendant) en BLEU — rouge
        // = rapide, vert = usinage, bleu = plongée d'outil.
        add(sp.plg||[],0x0a84ff);
      }catch(e){}
    };
    faoSeqSafe(job,seule).forEach(function(b){
      const op=b.op;
      if(op&&op.hidden===true)return; // traces masquées dans la vue (op.hidden) — le G-code, lui, les garde
      if(b.absent){ faoPrevMissing++; return; } // pas de parcours en memoire : on n'invente rien
      const mv=b.moves; total+=mv.length;
      mk(mv,faoSegClipper(op,job));
    });
    scene.add(faoPrevGroup);
    if(typeof faoVw!=='undefined'&&faoVw)faoPrevGroup.visible=false; // viewer : traces restent cachées
  }catch(e){}
  return total;
}
function faoPreviewGenerate(){
  // « Tout régénérer » = TOUT, à la demande : on purge le cache (chaque opération
  // est recalculée, même celles à jour), puis on ré-affiche TOUTES les traces.
  // Les traces masquées à la main (op.hidden) le RESTENT : le masquage se fait
  // ligne par ligne, jamais remis à zéro en cachette. Le triangle ⚠ d'une ligne,
  // lui, ne régénère QUE son opération.
  faoPrevOn=true;
  if(!faoSolidSettled()){
    // Generer maintenant produirait une trajectoire (et une cle) sur le MAILLAGE DE
    // REPLI : elle serait rejetee des la fin du rejeu. On diffère, on le dit.
    faoRegenWhenSettled=true;
    try{ if(typeof faceEl!=='undefined'&&faceEl)faceEl.textContent='FAO : le solide exact n\'est pas encore en place (rejeu en cours) — régénération automatique à la fin du rejeu.'; }catch(e){}
    return 0;
  }
  faoOpMovesPurge();
  faoStaleClear();
  const n=faoRefreshPreview('calcule');
  faoTouch();
  faoPrevStale=false; faoStaleUI();
  try{ if(typeof faceEl!=='undefined'&&faceEl)faceEl.textContent='FAO : '+n+' points de parcours.'+(n?'':' Aucune trajectoire.'); }catch(e){}
  return n;
}

/* ================= viewer d'usinage (brut + outil, ▶ lecture / ⏸ pause / ⏹ stop) =================
   Cache les traces, fait apparaître la boîte du brut (+ le corps-brut masqué s'il y en a un),
   anime l'outil le long du parcours et dessine un BOUT de trace qui suit la fraise
   puis disparaît au fur et à mesure derrière elle (fenêtre glissante). */
let faoVw=null, faoVwBar=null, faoVwBarT=null, faoVwBtn=null, faoVwMatterBtn=null, faoVwEsc=false;
function faoViewerMsg(t){
  // Retour utilisateur (jamais silencieux) : barre d'état + console.
  try{ if(typeof faceEl!=='undefined'&&faceEl)faceEl.textContent=t; }catch(e){}
  try{ if(typeof console!=='undefined'&&console&&console.log)console.log(t); }catch(e){}
}
function faoViewerBtnUpdate(){
  // Le bouton « Usinage » de la fiche bascule : OUVRIR le mode lecture / en SORTIR.
  try{
    if(!faoVwBtn)return;
    faoVwBtn.textContent=faoVw?'■ Quitter l\'usinage':'▶ Usinage';
    faoVwBtn.title=faoVw
      ?'Mode lecture usinage actif : sortir du mode (aussi Échap ou ✕ de la barre) — ré-affiche les traces, retire l\'outil, le brut et la matière.'
      :'Viewer d\'usinage : cache les traces, fait apparaître le brut, anime l\'outil le long du parcours — barre ▶ ⏸ ⏹ ✕ en bas de la vue (Échap pour sortir).';
  }catch(e){}
}

function faoViewerBuild(setup){
  // Séquence complète du posage : points (arcs développés), Ø outil par point,
  // temps cumulé réel (coupe = feed outil, rapide = G0) — pur, testable sans scène.
  // 2026-10-08-004 : DÉBUT/FIN — l'outil VIENT de la zone de retrait et y
  // retourne, uniquement en Z : un point d'ancrage au même XY encadre le
  // parcours (aucun déplacement XY inventé en tête/queue de séquence).
  const chunks=[]; // par opération : {op, ext, f, d} — saut inter-ops sans temps (historique)
  faoSeqSafe(setup).forEach(function(S){
    const op=S.op;
    const tool=faoToolById(setup,op.toolId);
    const d=(tool&&isFinite(+tool.d)&&+tool.d>0)?+tool.d:10;
    const sf=tool?faoToolSF(tool,setup):null;
    const f=(sf&&isFinite(+sf.f)&&+sf.f>0)?+sf.f:1000;
    const mv=S.moves;
    const ext=[]; let pv=null; // arcs développés (tracé lisse)
    mv.forEach(function(m){
      let dev=false;
      if(pv&&!pv.r&&m.arc){
        try{
          const SA=faoArcSegs(pv,m);
          // 2026-10-08-005 : un arc développé d'entrée (ent) garde l'étiquette
          // sur ses échantillons — le tracé bleu suit l'arc entier.
          if(SA&&SA.length){ SA.forEach(function(q){ ext.push({x:q[0],y:q[1],z:q[2],r:0,ent:m.ent?1:0}); }); dev=true; }
        }catch(e){}
      }
      // Un arc développé ne repousse PAS son move original : ce doublon `.arc` ferait
      // recalculer faoSegLen depuis le bout du développé (i/j relatifs au VRAI départ →
      // centre faux → angle ≈ 2π → temps fictif = gel de ~3-5 s après chaque arc).
      ext.push(dev?{x:m.x,y:m.y,z:m.z,r:m.r?1:0,ent:m.ent?1:0}:m);
      pv=m;
    });
    if(ext.length)chunks.push({op:op,ext:ext,f:f,d:d});
  });
  // Encadrement « zone de retrait » (2026-10-08-004) : en tête, l'outil vient
  // de la zone de retrait ; en queue, il y retourne — dans les DEUX cas un
  // rapide vertical au même XY (le segment prend la commande de sa destination,
  // comme partout ailleurs). Segments plus courts que le retrait : inchangé.
  if(chunks.length){
    const r0=faoRetractAbs(chunks[0].op,setup);
    const rN=faoRetractAbs(chunks[chunks.length-1].op,setup);
    const e0=chunks[0].ext;
    if(isFinite(r0)&&r0>e0[0].z+1e-9)e0.unshift({x:e0[0].x,y:e0[0].y,z:r0,r:1});
    const eN=chunks[chunks.length-1].ext, lN=eN[eN.length-1];
    if(isFinite(rN)&&rN>lN.z+1e-9)eN.push({x:lN.x,y:lN.y,z:rN,r:1});
  }
  const pts=[], dd=[], times=[], lens=[]; // times[i] = temps cumulé EN ARRIVANT au point i
  let total=0, cum=0; // cum = longueur cumulée (fenêtre de trace qui suit la fraise)
  chunks.forEach(function(C){
    let prev=null;
    C.ext.forEach(function(m){
      pts.push({x:+m.x||0, y:+m.y||0, z:+m.z||0, r:m.r?1:0, ent:m.ent?1:0});
      dd.push(C.d);
      if(prev){
        const len=faoSegLen(prev,m);
        const v=m.r?faoRapide(setup):C.f;
        total+=len/((isFinite(v)&&v>0?v:600)/60);
        cum+=len;
      }
      times.push(total);
      lens.push(cum);
      prev=m;
    });
  });
  return {pts:pts, dd:dd, times:times, lens:lens, T:total};
}
function faoViewerSeek(vw,t){
  // Position à l'instant t (linéaire entre les points, idx incrémental + retour arrière).
  const n=vw.pts.length;
  if(!n)return null;
  let i=Math.min(vw.idx||0, n-1);
  while(i<n-1&&vw.times[i+1]<=t)i++;
  while(i>0&&vw.times[i]>t)i--;
  vw.idx=i;
  if(t>=vw.T){ const p=vw.pts[n-1]; return {i:n-1,f:0,x:p.x,y:p.y,z:p.z,r:p.r,d:vw.dd[n-1],done:true}; }
  if(t<=0){ const p=vw.pts[0]; return {i:0,f:0,x:p.x,y:p.y,z:p.z,r:p.r,d:vw.dd[0],done:false}; }
  const t0=vw.times[i], t1=vw.times[i+1];
  const f=(t1>t0)?Math.max(0,Math.min(1,(t-t0)/(t1-t0))):0;
  const a=vw.pts[i], b=vw.pts[i+1];
  return {i:i,f:f,x:a.x+(b.x-a.x)*f, y:a.y+(b.y-a.y)*f, z:a.z+(b.z-a.z)*f, r:b.r, d:vw.dd[i+1], done:false};
}
function faoTraceWindow(lens,i,f){
  // Début de la fenêtre de trace : seul un BOUT (~40 mm) du trajet reste
  // visible derrière la fraise — le reste disparaît au fur et à mesure.
  // Pur (sans scène, testable) ; sans lens : 0 = repli historique complet.
  if(!lens||!lens.length)return 0;
  const n=lens.length;
  const k=Math.max(0,Math.min(n-1,i|0));
  const Le=lens[k]+((k+1<n)?(lens[k+1]-lens[k])*(+f||0):0);
  let from=k;
  while(from>0&&lens[from]>Le-40)from--;
  return from;
}
function faoViewerApply(){
  const vw=faoVw; if(!vw)return;
  const p=faoViewerSeek(vw,vw.t);
  if(!p)return;
  vw.drawn=Math.min(p.i+2,vw.pts.length); // points atteints (la fenêtre le resserre plus bas)
  if(vw.tool){
    vw.tool.position.x=p.x; vw.tool.position.y=p.y; vw.tool.position.z=p.z;
    const d=(isFinite(p.d)&&p.d>0)?p.d:10;
    if(vw.toolBody){ vw.toolBody.scale.x=d; vw.toolBody.scale.z=d; }   // Ø réel
    if(vw.toolHold){ vw.toolHold.scale.x=d*1.6; vw.toolHold.scale.z=d*1.6; }
  }
  if(vw.line){ // trace qui SUIT la fenêtre : ~40 mm de trajet derrière l'outil
    const i=p.i;
    const from=faoTraceWindow(vw.lens,p.i,p.f);
    const to=Math.min(i+2,vw.pts.length);
    vw.drawn=Math.max(0,to-from);
    try{
      const pos=vw.line.geometry&&vw.line.geometry.attributes&&vw.line.geometry.attributes.position;
      const arr=pos&&pos.array;
      if(arr&&arr.length>0&&arr.length>=6){
        arr[3*i]=vw.pts[i].x; arr[3*i+1]=vw.pts[i].y; arr[3*i+2]=vw.pts[i].z;
        if(i+1<vw.pts.length){ arr[3*i+3]=p.x; arr[3*i+4]=p.y; arr[3*i+5]=p.z; }
        pos.needsUpdate=true;
        vw.line.geometry.setDrawRange(from,vw.drawn);
      }
    }catch(e){}
  }
  try{ faoViewerMatterStep(vw,p); }catch(e){} // matière usinée qui disparaît
}
function faoViewerToolCreate(){
  // Groupe outil : fraisier Ø1×H1 (axe local Y, rotation 90° → vertical) + mandrin.
  // La base du fraisier (= pointe) est au z=0 du groupe → on pose le groupe au point.
  const H=30;
  const g=new THREE.Group(); g.name='faoViewerTool';
  let body=null, hold=null;
  try{
    body=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,1,20),
      new THREE.MeshPhongMaterial({color:0x9ad1ff,flatShading:true,emissive:0x112f4d}));
    body.raycast=function(){};
    body.rotation.x=Math.PI/2;
    body.scale.x=10; body.scale.y=H; body.scale.z=10;
    body.position.z=H/2;
    g.add(body);
    hold=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,1,16),
      new THREE.MeshPhongMaterial({color:0x676c75,flatShading:true}));
    hold.raycast=function(){};
    hold.rotation.x=Math.PI/2;
    hold.scale.x=16; hold.scale.y=12; hold.scale.z=16;
    hold.position.z=H+6;
    g.add(hold);
  }catch(e){}
  return {group:g, body:body, hold:hold, H:H};
}
function faoViewerStockCreate(){
  // Boîte du brut (semi-transparente + arêtes) : la bbox sert de « pièce à usiner ».
  const s=faoStock();
  if(!faoStockValid(s))return null;
  const g=new THREE.Group(); g.name='faoViewerStock';
  try{
    const bg=new THREE.BoxGeometry(s.x1-s.x0, s.y1-s.y0, s.z1-s.z0);
    const mat=function(){ return new THREE.MeshBasicMaterial({color:0xffd60a,transparent:true,opacity:.12,depthWrite:false}); };
    const box=new THREE.Mesh(bg,mat());
    box.raycast=function(){};
    box.position.x=(s.x0+s.x1)/2; box.position.y=(s.y0+s.y1)/2; box.position.z=(s.z0+s.z1)/2;
    g.add(box);
    try{
      const e=new THREE.LineSegments(new THREE.EdgesGeometry(bg),new THREE.LineBasicMaterial({color:0xffd60a}));
      e.position.x=box.position.x; e.position.y=box.position.y; e.position.z=box.position.z;
      g.add(e);
    }catch(e2){}
  }catch(e){}
  return g;
}
function faoViewerLineCreate(vw){
  // Polyline continue, couleur par vertex : vert = coupe, rouge = rapide,
  // bleu = plongée (G1 vertical descendant — 2026-10-08-004) ou entrée
  // étiquetée ent (hélice, rampe, arc circ, descente d'entrée — 005).
  const pos=[], col=[];
  vw.pts.forEach(function(p,i){
    pos.push(p.x,p.y,p.z);
    const q=(i>0)?vw.pts[i-1]:null;
    const plg=p.ent|| (q&&!p.r&&!q.r&&Math.abs(p.x-q.x)<1e-9&&Math.abs(p.y-q.y)<1e-9&&p.z<q.z-1e-9);
    const c=(i>0&&p.r)?0xff453a:(plg?0x0a84ff:0x30d158);
    col.push(((c>>16)&255)/255, ((c>>8)&255)/255, (c&255)/255);
  });
  try{
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pos),3));
    g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(col),3));
    const l=new THREE.Line(g,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.95}));
    l.name='faoViewerLine'; l.raycast=function(){};
    return l;
  }catch(e){ return null; }
}
/* ---- matière usinée (surface Z-map) : elle disparaît sous l'outil ----
   Logique pure (grille + carve) : testable sans scène ; THREE reste derrière
   des try/catch. Grille ≈ 40k voxels max sur la bbox du brut. */
function faoMatterGrid(s,pas){
  if(!s||!(s.x1>s.x0)||!(s.y1>s.y0)||!(s.z1>s.z0))return null;
  let p=+pas;
  let nx=0,ny=0,nz=0,n=0,it=0,pz=0;
  if(p>0){
    // pas fourni = strict (tests) : isotrope historique, plafond 200k voxels.
    do{
      p=(it===0)?+pas:p;
      nx=Math.max(1,Math.ceil((s.x1-s.x0)/p));
      ny=Math.max(1,Math.ceil((s.y1-s.y0)/p));
      nz=Math.max(1,Math.ceil((s.z1-s.z0)/p));
      n=nx*ny*nz; it++;
      if(n>200000)p*=1.6;
    }while(n>200000&&it<6);
    pz=p;
  }else{
    // DEFaut (rendu) : grille ANISOTROPE (retour 4/10) — maille XY fine pour
    // l'emprise visuelle (colonnes jointives), couches Z grossieres : le rendu
    // lit la Z-map continue h[], seule la maille XY compte a l'ecran. Budget
    // 60000 colonnes (plancher 0,5 mm), 32 couches Z max (n <= 1,92M).
    const X=s.x1-s.x0, Y=s.y1-s.y0, H=s.z1-s.z0;
    p=Math.max(0.5,Math.sqrt((X*Y)/60000));
    nx=Math.max(1,Math.ceil(X/p)); ny=Math.max(1,Math.ceil(Y/p));
    it=0;
    while(nx*ny>60000&&it++<8){ p*=1.1; nx=Math.max(1,Math.ceil(X/p)); ny=Math.max(1,Math.ceil(Y/p)); }
    nz=Math.max(1,Math.min(32,Math.ceil(H/Math.max(p,1e-6))));
    n=nx*ny*nz;
    pz=H/nz;
  }
  const alive=new Uint8Array(n);
  for(let i=0;i<n;i++)alive[i]=1;
  // Z-map : une hauteur continue PAR COLONNE (= cote de coupe exacte, non quantifiée
  // au voxel) — mise à jour par CarveSeg, lue par colTop pour le rendu.
  const nc=nx*ny;
  const h=new Float32Array(nc);
  // Extents RÉELS du brut (nx*pas peut dépasser x1 d'ici, d'un seul côté — le
  // rendu et la hauteur init sont calés sur x1/y1/z1 exacts, jamais sur la grille).
  const sx1=+s.x1, sy1=+s.y1, sz1=+s.z1;
  const full=sz1;
  for(let i=0;i<nc;i++)h[i]=full;
  return {pas:p,pz:pz,nx:nx,ny:ny,nz:nz,n:n,ox:s.x0,oy:s.y0,oz:s.z0,alive:alive,h:h,
          sx1:sx1,sy1:sy1,sz1:sz1,full:full};
}
function faoMatterIdx(g,ix,iy,iz){ return (iz*g.ny+iy)*g.nx+ix; }
function faoMatterCarveSeg(g,ax,ay,az,bx,by,bz,r,outCols){
  // Enlève les voxels dont le CENTRE est à distance ≤ r du segment XY (2D)
  // et z ≥ min(az,bz)−pas/2 : la matière SOUS la pointe reste. Retourne les indices tués.
  // Z-map : la hauteur de colonne descend à la cote de coupe EXACTE min(az,bz).
  // outCols (optionnel) : reçoit les colonnes TOUCHÉES en XY, tuées ou non — le mesh
  // doit être réécrit pour elles même quand aucun voxel ne meurt (cote entre deux
  // centres : c'était le gel « la passe suivante n'enlève rien à l'écran »).
  const out=[];
  if(!g||!(r>0))return out;
  const zc=Math.min(az,bz);
  const pzv=g.pz||g.pas;
  const zmin=zc-pzv/2;
  const x0=Math.min(ax,bx)-r, x1=Math.max(ax,bx)+r;
  const y0=Math.min(ay,by)-r, y1=Math.max(ay,by)+r;
  if(x1<g.ox||x0>g.ox+g.nx*g.pas||y1<g.oy||y0>g.oy+g.ny*g.pas)return out;
  const i0=Math.max(0,Math.floor((x0-g.ox)/g.pas)), i1=Math.min(g.nx-1,Math.floor((x1-g.ox)/g.pas));
  const j0=Math.max(0,Math.floor((y0-g.oy)/g.pas)), j1=Math.min(g.ny-1,Math.floor((y1-g.oy)/g.pas));
  const k0=Math.max(0,Math.floor((zmin-g.oz)/pzv)), k1=g.nz-1;
  const dx=bx-ax, dy=by-ay, L2=dx*dx+dy*dy, r2=r*r;
  const nc=g.nx*g.ny;
  const tc=(g.h||outCols)?new Uint8Array(nc):null;
  const z2=g.h?(zc>g.oz?zc:g.oz):0;
  // Test XY UNE fois par colonne (le segment balaye toute la hauteur de la colonne).
  for(let j=j0;j<=j1;j++){
    const py=g.oy+(j+0.5)*g.pas;
    for(let i=i0;i<=i1;i++){
      const px=g.ox+(i+0.5)*g.pas;
      let t=L2>0?((px-ax)*dx+(py-ay)*dy)/L2:0;
      t=t<0?0:(t>1?1:t);
      const qx=ax+dx*t, qy=ay+dy*t;
      const d2=(px-qx)*(px-qx)+(py-qy)*(py-qy);
      if(d2>r2)continue;
      // Colonne touchée en XY : la Z-map descend à la cote de coupe MÊME si aucun
      // voxel vivant n'est tué (cote entre deux centres de voxels, ou colonne déjà
      // vidée par la passe précédente) — c'était le gel « certaines passes
      // n'enlèvent rien » (alternance OK/KO au fil des passes).
      if(tc){ const c=j*g.nx+i; if(!tc[c]){ tc[c]=1; if(g.h&&z2<g.h[c])g.h[c]=z2; if(outCols)outCols.push(c); } }
      for(let k=k0;k<=k1;k++){
        const zcell=g.oz+(k+0.5)*pzv;
        if(zcell<zmin)continue;
        const idx=faoMatterIdx(g,i,j,k);
        if(!g.alive[idx])continue;
        g.alive[idx]=0; out.push(idx);
      }
    }
  }
  return out;
}
function faoMatterCarveTo(g,pts,dd,times,t,outCols){
  // Rattrapage 0 → t : segments complets + segment en cours interpolé (points d'arrivée en coupe).
  const out=[];
  if(!g||!pts||pts.length<2||!(t>0))return out; // t<=0 : rien n'a été joué, rien à rattraper
  for(let i=0;i<pts.length-1;i++){
    if(times[i]>t)break;
    if(pts[i+1].r)continue;
    let a=pts[i], b=pts[i+1];
    if(times[i+1]>t){
      const t0=times[i], t1=times[i+1];
      const f=(t1>t0)?Math.max(0,Math.min(1,(t-t0)/(t1-t0))):0;
      b={x:a.x+(b.x-a.x)*f, y:a.y+(b.y-a.y)*f, z:a.z+(b.z-a.z)*f};
    }
    const r=((isFinite(dd[i+1])&&dd[i+1]>0)?dd[i+1]:10)/2;
    const k=faoMatterCarveSeg(g,a.x,a.y,a.z,b.x,b.y,b.z,r,outCols);
    for(let m=0;m<k.length;m++)out.push(k[m]);
  }
  return out;
}
function faoViewerMatterHideBodies(vw){
  // Corps 3D masqués pendant la matière (refs locales, doc.bodyVis jamais touché).
  // Ne JAMAIS réinitialiser le tableau : après un rebuild (Stop), les corps sont
  // déjà masqués — leurs refs doivent survivre pour être restaurables au close.
  if(!vw.hideBodies)vw.hideBodies=[];
  try{
    const bs=(typeof bodies!=='undefined'&&bodies)?bodies:[];
    bs.forEach(function(b){
      if(b&&b.mesh&&b.mesh.visible!==false&&vw.hideBodies.indexOf(b)<0){ b.mesh.visible=false; vw.hideBodies.push(b); }
    });
  }catch(e){}
}
function faoViewerMatterShowBodies(vw){
  // Restaure en respectant doc.bodyVis (le corps-brut v009 doit rester masqué).
  try{
    (vw.hideBodies||[]).forEach(function(b){
      if(b&&b.mesh)b.mesh.visible=!(doc&&doc.bodyVis&&doc.bodyVis[b.id]===false)&&(b.visible!==false);
    });
  }catch(e){}
  vw.hideBodies=[];
}
function faoViewerMatterDispose(vw){
  try{ if(vw.matter&&typeof scene!=='undefined'&&scene)scene.remove(vw.matter); }catch(e){}
  try{ if(vw.matter&&vw.matter.geometry&&vw.matter.geometry.dispose)vw.matter.geometry.dispose(); }catch(e){}
  vw.matter=null; vw.matterGrid=null; vw.mKills=[]; vw.mPos=null; vw.mTops=null; vw.mArr=null;
}
function faoMatterColTop(g,c){
  // Hauteur de surface de la colonne c (= iy*nx+ix) : Z-map continue (cote exacte),
  // repli sur le scan alive[] si la grille n'a pas de h.
  if(g.h)return g.h[c];
  const L=g.nx*g.ny;
  for(let k=g.nz-1;k>=0;k--){ if(g.alive[k*L+c])return g.oz+(k+1)*(g.pz||g.pas); }
  return g.oz;
}
function faoMatterPut(a,o,x,y,z){ a[o]=x; a[o+1]=y; a[o+2]=z; return o+3; }
function faoMatterMark(rw,list,c){ if(c<0||c>=rw.length||rw[c])return; rw[c]=1; list.push(c); }
function faoViewerMatterWriteCol(vw,c){
  // 30 verts (top 2 tri + 4 côtés) de la colonne c écrits dans vw.mArr (diff seul).
  const g=vw.matterGrid, a=vw.mArr, T=vw.mTops;
  if(!g||!a||!T)return;
  const nx=g.nx, ny=g.ny, pas=g.pas, ox=g.ox, oy=g.oy, oz=g.oz;
  const sx1=(g.sx1!=null)?g.sx1:ox+nx*pas, sy1=(g.sy1!=null)?g.sy1:oy+ny*pas;
  const ix=c%nx, iy=(c/nx)|0;
  const x0=ox+ix*pas, x1=Math.min(x0+pas,sx1), y0=oy+iy*pas, y1=Math.min(y0+pas,sy1);
  if(!(x1>x0)||!(y1>y0))return; // colonne au-delà des extents réels (ne rien écrire)
  const zt=T[c];
  // côté replié (z2=zt → quad nul) si le voisin est plus haut : jamais deux faces coplanaires
  const zN=(iy>0?T[c-nx]:oz); const n2=zN<zt?zN:zt;
  const zS=(iy<ny-1?T[c+nx]:oz); const s2=zS<zt?zS:zt;
  const zW=(ix>0?T[c-1]:oz); const w2=zW<zt?zW:zt;
  const zE=(ix<nx-1?T[c+1]:oz); const e2=zE<zt?zE:zt;
  let o=c*90;
  // top
  o=faoMatterPut(a,o,x0,y0,zt); o=faoMatterPut(a,o,x1,y0,zt); o=faoMatterPut(a,o,x1,y1,zt);
  o=faoMatterPut(a,o,x0,y0,zt); o=faoMatterPut(a,o,x1,y1,zt); o=faoMatterPut(a,o,x0,y1,zt);
  // côté -Y
  o=faoMatterPut(a,o,x0,y0,n2); o=faoMatterPut(a,o,x0,y0,zt); o=faoMatterPut(a,o,x1,y0,zt);
  o=faoMatterPut(a,o,x0,y0,n2); o=faoMatterPut(a,o,x1,y0,zt); o=faoMatterPut(a,o,x1,y0,n2);
  // côté +Y
  o=faoMatterPut(a,o,x0,y1,s2); o=faoMatterPut(a,o,x1,y1,s2); o=faoMatterPut(a,o,x1,y1,zt);
  o=faoMatterPut(a,o,x0,y1,s2); o=faoMatterPut(a,o,x1,y1,zt); o=faoMatterPut(a,o,x0,y1,zt);
  // côté -X
  o=faoMatterPut(a,o,x0,y0,w2); o=faoMatterPut(a,o,x0,y0,zt); o=faoMatterPut(a,o,x0,y1,zt);
  o=faoMatterPut(a,o,x0,y0,w2); o=faoMatterPut(a,o,x0,y1,zt); o=faoMatterPut(a,o,x0,y1,w2);
  // côté +X
  o=faoMatterPut(a,o,x1,y0,e2); o=faoMatterPut(a,o,x1,y1,e2); o=faoMatterPut(a,o,x1,y1,zt);
  o=faoMatterPut(a,o,x1,y0,e2); o=faoMatterPut(a,o,x1,y1,zt); o=faoMatterPut(a,o,x1,y0,zt);
}
function faoViewerMatterWriteAll(vw){
  const g=vw.matterGrid; if(!g||!vw.mArr||!vw.mTops)return;
  const nc=g.nx*g.ny;
  for(let c=0;c<nc;c++)faoViewerMatterWriteCol(vw,c);
  // fond plein du brut (6 verts, statique) — clampé aux extents réels du brut
  const a=vw.mArr, oz=g.oz;
  const X0=g.ox, X1=(g.sx1!=null)?g.sx1:g.ox+g.nx*g.pas, Y0=g.oy, Y1=(g.sy1!=null)?g.sy1:g.oy+g.ny*g.pas;
  let o=nc*90;
  o=faoMatterPut(a,o,X0,Y0,oz); o=faoMatterPut(a,o,X1,Y0,oz); o=faoMatterPut(a,o,X1,Y1,oz);
  o=faoMatterPut(a,o,X0,Y0,oz); o=faoMatterPut(a,o,X1,Y1,oz); o=faoMatterPut(a,o,X0,Y1,oz);
}
function faoViewerMatterEnable(vw){
  // (Re)construit la surface Z-map pleine du brut (colonnes jointives, un seul mesh)
  // + rattrapage 0 → t courant. Retourne le nb de voxels suivis.
  faoViewerMatterDispose(vw);
  if(!vw||vw.matterOn===false)return 0;
  const s=faoStock(); if(!faoStockValid(s))return 0;
  const g=faoMatterGrid(s); if(!g)return 0;
  const nc=g.nx*g.ny;
  let mesh=null, arr=null;
  try{
    arr=new Float32Array((nc*30+6)*3);
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(arr,3));
    const mat=new THREE.MeshPhongMaterial({color:0x9c846a,flatShading:true,side:THREE.DoubleSide});
    mesh=new THREE.Mesh(geo,mat);
    mesh.name='faoMatter';
    mesh.raycast=function(){};
    mesh.frustumCulled=false;
    if(typeof scene!=='undefined'&&scene)scene.add(mesh);
  }catch(e){ return 0; }
  const tops=new Float32Array(nc);
  const full=(g.full!=null)?g.full:(g.sz1!=null?g.sz1:g.oz+g.nz*(g.pz||g.pas));
  for(let c=0;c<nc;c++)tops[c]=full;
  vw.matter=mesh; vw.matterGrid=g; vw.mTops=tops; vw.mArr=arr; vw.mKills=[]; vw.mPos=null;
  try{ faoViewerMatterWriteAll(vw); }catch(e){ faoViewerMatterDispose(vw); try{ if(mesh&&scene)scene.remove(mesh); }catch(e2){} return 0; }
  if(vw.t>0){
    const tcols=[];
    const ks=faoMatterCarveTo(g,vw.pts,vw.dd,vw.times,vw.t,tcols);
    faoViewerMatterKill(vw,ks,tcols);
  }
  faoViewerMatterHideBodies(vw); // la surface remplace les corps visibles
  return g.n;
}
function faoViewerMatterKill(vw,ks,cols){
  // Diff seul : recalcule la hauteur des colonnes TOUCHÉES (voxels tués + colonnes
  // dont la Z-map a baissé sans kill), réécrit leurs verts + ceux des 4 voisins.
  if(!vw||!vw.matter||!vw.matterGrid||!vw.mTops||!vw.mArr)return;
  if((!ks||!ks.length)&&(!cols||!cols.length))return;
  const g=vw.matterGrid, nc=g.nx*g.ny, T=vw.mTops;
  const seen=new Uint8Array(nc), chg=[];
  const mark=function(c){
    if(c<0||c>=nc||seen[c])return;
    seen[c]=1;
    const t=faoMatterColTop(g,c);
    if(t!==T[c]){ T[c]=t; chg.push(c); }
  };
  if(ks){
    for(let n=0;n<ks.length;n++){
      const idx=ks[n];
      if(idx<0||idx>=g.n)continue;
      mark(idx%nc);
    }
  }
  if(cols){
    for(let n=0;n<cols.length;n++)mark(cols[n]);
  }
  if(!chg.length)return;
  const rw=new Uint8Array(nc), list=[];
  for(let m=0;m<chg.length;m++){
    const c=chg[m], ix=c%g.nx;
    faoMatterMark(rw,list,c);
    if(ix>0)faoMatterMark(rw,list,c-1);
    if(ix<g.nx-1)faoMatterMark(rw,list,c+1);
    if(c>=g.nx)faoMatterMark(rw,list,c-g.nx);
    if(c+g.nx<nc)faoMatterMark(rw,list,c+g.nx);
  }
  for(let m=0;m<list.length;m++)faoViewerMatterWriteCol(vw,list[m]);
  try{ vw.matter.geometry.attributes.position.needsUpdate=true; }catch(e){}
}
function faoMatterCarveRange(g,pts,dd,times,t,i0,x0,y0,z0,p,outCols){
  // INCREMENTAL : taille uniquement depuis le DERNIER point joue (x0,y0,z0,
  // segment i0) jusqu'a la position p (index p.i). Rappatrier 0 -> t a chaque
  // frame coutait O(i) : a 80 000 points d'ebauche 3D, la lecture devenait
  // intenable — le surfaçage (30 points) passait inapercu.
  const out=[];
  if(!g||!pts||pts.length<2)return out;
  let i=Math.max(0,Math.min(i0|0,pts.length-2));
  const lastRaw=(p&&isFinite(+p.i))?Math.round(+p.i):i;
  const last=Math.max(i,Math.min(lastRaw,pts.length-2));
  let a={x:+x0,y:+y0,z:+z0};
  for(;i<=last;i++){
    const dst=(i===last)?p:pts[i+1];
    if(!dst)break;
    if(dst.r){ a={x:dst.x,y:dst.y,z:dst.z}; continue; } // G0 : rien a tailler
    const b={x:+dst.x,y:+dst.y,z:+dst.z};
    const r=((isFinite(dd[i+1])&&dd[i+1]>0)?dd[i+1]:10)/2;
    const k=faoMatterCarveSeg(g,a.x,a.y,a.z,b.x,b.y,b.z,r,outCols);
    for(let m=0;m<k.length;m++)out.push(k[m]);
    a=b;
  }
  return out;
}
function faoViewerMatterStep(vw,p){
  // À chaque frame : enleve la matière du segment balayé (ou rattrapage si saut).
  // INCREMENTAL : on ne repart JAMAIS de 0 sauf au tout premier appel.
  if(!vw||vw.matterOn===false||!vw.matterGrid||!vw.matter)return;
  const g=vw.matterGrid;
  let ks=null;
  const cols=[];
  const mi=(vw.mPos&&isFinite(+vw.mPos.i))?Math.round(+vw.mPos.i):-1;
  if(mi>=0&&mi<=p.i){
    ks=faoMatterCarveRange(g,vw.pts,vw.dd,vw.times,vw.t,mi,
                           vw.mPos.x,vw.mPos.y,vw.mPos.z,p,cols);
  }else if(mi>p.i){
    ks=null; // retour arriere : la matiere enlevee n'est jamais restituee
  }else{
    ks=faoMatterCarveTo(g,vw.pts,vw.dd,vw.times,vw.t,cols);
  }
  vw.mPos={x:p.x,y:p.y,z:p.z,i:p.i};
  // Tués OU colonnes touchées : la Z-map descend aussi quand aucun voxel ne meurt,
  // le mesh doit suivre à chaque passe (sinon la matière ré-apparaît au pass suivant).
  if((ks&&ks.length)||cols.length)faoViewerMatterKill(vw,ks,cols);
}
function faoViewerMatterToggle(){
  const vw=faoVw; if(!vw)return;
  vw.matterOn=!(vw.matterOn!==false);
  if(vw.matterOn===false){ faoViewerMatterShowBodies(vw); faoViewerMatterDispose(vw); }
  else faoViewerMatterEnable(vw);
  faoViewerMatterBarUpdate();
}
function faoViewerMatterBarUpdate(){
  try{
    if(faoVwMatterBtn&&faoVw)faoVwMatterBtn.textContent=(faoVw.matterOn!==false)?'◼ matière':'◻ matière';
  }catch(e){}
}
function faoViewerOpen(){
  if(faoVw)return true;
  try{
    const b=faoViewerBuild(faoSetup());
    if(!b.pts.length||!(b.T>0)){
      faoViewerMsg('FAO : aucune trajectoire à jouer — vérifiez le brut et activez au moins une opération.');
      return false; // aucune opération jouable (jamais silencieux)
    }
    const vw={pts:b.pts, dd:b.dd, times:b.times, lens:b.lens, T:b.T, t:0, idx:0, drawn:0,
      playing:false, speed:1, prevVis:true, body:null, tool:null, toolBody:null,
      toolHold:null, line:null, stock:null, toolH:30, _last:0, _looping:false,
      matterOn:true, matter:null, matterGrid:null, mKills:[], mPos:null, mTops:null, mArr:null, hideBodies:[]};
    faoVw=vw;
    // 1) traces cachées (non destructif : juste .visible=false)
    try{ if(faoPrevGroup){ vw.prevVis=faoPrevGroup.visible!==false; faoPrevGroup.visible=false; } }catch(e){}
    // 2) le brut apparaît : box du stock + corps-brut masqué (v009) ré-affiché
    try{ vw.stock=faoViewerStockCreate(); if(vw.stock)scene.add(vw.stock); }catch(e){}
    try{
      const fs=faoSetup();
      if(fs&&fs.stockSrc==='body'&&fs.stockBody!=null){
        const b2=(typeof bodies!=='undefined'&&bodies?bodies:[]).filter(function(x){return x&&x.id===fs.stockBody;})[0];
        if(b2&&b2.mesh&&b2.mesh.visible===false&&doc.bodyVis&&doc.bodyVis[b2.id]===false){
          vw.body=b2; b2.visible=true; b2.mesh.visible=true;
        }
      }
    }catch(e){}
    // 3) outil + trace progressive
    try{
      const T=faoViewerToolCreate();
      vw.tool=T.group; vw.toolBody=T.body; vw.toolHold=T.hold; vw.toolH=T.H;
      if(vw.tool)scene.add(vw.tool);
    }catch(e){}
    try{ vw.line=faoViewerLineCreate(vw); if(vw.line)scene.add(vw.line); }catch(e){}
    // 4) matière usinée : surface Z-map pleine (colonnes jointives, un seul mesh)
    try{ faoViewerMatterEnable(vw); }catch(e){}
    // 5) barre transporteur ▶ ⏸ ⏹ ✕ + matière
    try{ faoViewerBarShow(); }catch(e){}
    try{ faoViewerApply(); }catch(e){}
    try{ faoViewerBarUpdate(); }catch(e){}
    faoViewerBtnUpdate();
    faoViewerMatterBarUpdate();
    return true;
  }catch(e){
    // Rollback complet : JAMAIS d'état « mi-ouvert » bloqué (aucune trace, aucun ✕).
    try{ faoViewerClose(); }catch(e2){}
    faoViewerMsg('Usinage : ouverture impossible ('+((e&&e.message)||e)+')');
    return false;
  }
}
function faoViewerClose(){
  // Sortie du mode lecture : ENLEVE l'outil, le brut, la matière, ré-affiche les traces.
  const vw=faoVw;
  faoVw=null;
  if(vw){
    try{ if(faoPrevGroup)faoPrevGroup.visible=(faoPrevOn!==false); }catch(e){}
    try{ faoViewerMatterShowBodies(vw); }catch(e){}
    try{ faoViewerMatterDispose(vw); }catch(e){}
    try{ // le corps-brut masqué redevient invisible (on ne défait que ce qu'on a fait)
      if(vw.body&&doc.bodyVis&&doc.bodyVis[vw.body.id]===false){ vw.body.visible=false; vw.body.mesh.visible=false; }
    }catch(e){}
    try{ if(vw.stock)scene.remove(vw.stock); }catch(e){}
    try{ if(vw.tool)scene.remove(vw.tool); }catch(e){}
    try{ if(vw.line)scene.remove(vw.line); }catch(e){}
  }
  try{ if(faoVwBar)faoVwBar.style.display='none'; }catch(e){}
  faoViewerBtnUpdate();
}
function faoViewerStart(){
  if(faoVw&&faoVw.playing)return true;
  if(!faoVw&&!faoViewerOpen())return false;
  return faoViewerPlay();
}
function faoViewerToggle(){
  // Bascule du bouton « ▶ Usinage » : OUVRIR le mode lecture / en SORTIR nettoyé.
  try{
    if(faoVw){
      faoViewerClose();
      faoViewerMsg('FAO : mode lecture usinage quitté — traces ré-affichées, outil et brut retirés.');
      return false;
    }
    if(faoViewerStart()){ faoViewerMsg('FAO : lecture usinage en cours (Échap ou ✕ pour sortir).'); return true; }
    faoViewerMsg('FAO : aucune trajectoire à jouer — vérifiez le brut et activez au moins une opération.');
  }catch(e){
    faoViewerMsg('Usinage : '+((e&&e.message)||e));
  }
  return false;
}
function faoViewerPlay(){
  const vw=faoVw; if(!vw)return false;
  if(vw.t>=vw.T)vw.t=0;
  vw.playing=true; vw._last=0;
  if(!vw._looping){ vw._looping=true; faoViewerLoop(); }
  faoViewerBarUpdate();
  return true;
}
function faoViewerPause(){
  if(!faoVw)return;
  faoVw.playing=false;
  faoViewerBarUpdate();
}
function faoViewerStop(){
  const vw=faoVw; if(!vw)return;
  vw.t=0; vw.idx=0; vw.playing=false; vw.mPos=null;
  try{ if(vw.matterOn!==false)faoViewerMatterEnable(vw); }catch(e){} // matière restaurée en entier
  faoViewerApply();
  faoViewerBarUpdate();
}
function faoViewerAdvance(dt){
  // Avance logique : secondes réelles × vitesse — pur (rAF + tests).
  const vw=faoVw;
  if(!vw||!vw.playing)return false;
  const d=+dt;
  if(isFinite(d)&&d>0)vw.t+=d*(vw.speed||1);
  if(vw.t>=vw.T){ vw.t=vw.T; vw.playing=false; }
  faoViewerApply();
  faoViewerBarUpdate();
  return true;
}
function faoViewerLoop(){
  const vw=faoVw;
  if(!vw){ return; }
  if(!vw.playing){ vw._looping=false; return; }
  let now=0;
  try{ now=(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now(); }catch(e){ now=Date.now(); }
  const dt=vw._last?Math.min(0.25,(now-vw._last)/1000):0;
  vw._last=now;
  faoViewerAdvance(dt);
  if(faoVw&&faoVw.playing&&typeof requestAnimationFrame==='function')requestAnimationFrame(faoViewerLoop);
  else if(faoVw)vw._looping=false;
}
function faoViewerFmt(sec){
  const s=Math.max(0,Math.floor(+sec||0));
  const m=Math.floor(s/60);
  return (m<10?'0':'')+m+':'+((s%60)<10?'0':'')+(s%60);
}
function faoViewerBarShow(){
  if(faoVwBar){ faoVwBar.style.display='flex'; return; }
  try{
    const mk=function(t,title,fn){
      const b=document.createElement('button'); b.textContent=t;
      b.style.fontSize='.85rem'; b.title=title;
      if(fn)b.onclick=fn;
      return b;
    };
    const bar=document.createElement('div'); bar.id='faoViewerBar';
    bar.style.cssText='position:absolute;bottom:14px;left:50%;transform:translateX(-50%);display:flex;gap:6px;align-items:center;'
      +'background:rgba(18,20,24,.94);border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:6px 10px;'
      +'z-index:30;font-size:.78rem;color:#fff;box-shadow:0 4px 18px rgba(0,0,0,.45);';
    bar.appendChild(mk('▶','Lecture — en fin de parcours : pause automatique',function(){ faoViewerPlay(); }));
    bar.appendChild(mk('⏸','Pause',function(){ faoViewerPause(); }));
    bar.appendChild(mk('⏹','Stop : revient au début du parcours',function(){ faoViewerStop(); }));
    bar.appendChild(mk('✕','Quitter le mode lecture : ré-affiche les traces, retire l\'outil, le brut et la matière (Échap aussi)',function(){ faoViewerClose(); faoViewerMsg('FAO : mode lecture usinage quitté.'); }));
    const mb=mk('◼ matière','Matière usinée ON : la matière disparaît sous l\'outil (toggle)',function(){ faoViewerMatterToggle(); });
    bar.appendChild(mb); faoVwMatterBtn=mb;
    const t=document.createElement('span');
    t.style.cssText='font-family:monospace;min-width:118px;text-align:center;color:rgba(255,255,255,.85);';
    t.textContent='00:00 / 00:00';
    bar.appendChild(t); faoVwBarT=t;
    const sp=document.createElement('select');
    sp.title='Vitesse de lecture (× temps réel)';
    sp.style.fontSize='.75rem';
    [[1,'×1'],[2,'×2'],[5,'×5'],[10,'×10'],[20,'×20']].forEach(function(o){
      const op=document.createElement('option'); op.value=o[0]; op.textContent=o[1]; sp.appendChild(op);
    });
    sp.onchange=function(){ if(faoVw)faoVw.speed=(+sp.value>0)?+sp.value:1; };
    bar.appendChild(sp);
    const host=document.getElementById('vpwrap')||document.body;
    host.appendChild(bar);
    faoVwBar=bar;
    faoViewerMatterBarUpdate();
  }catch(e){}
}
function faoViewerBarUpdate(){
  try{
    if(!faoVwBar)return;
    if(!faoVw){ faoVwBar.style.display='none'; return; }
    faoVwBar.style.display='flex';
    if(faoVwBarT){
      const pct=faoVw.T>0?Math.round(100*faoVw.t/faoVw.T):100;
      faoVwBarT.textContent=faoViewerFmt(faoVw.t)+' / '+faoViewerFmt(faoVw.T)+' · '+pct+'%';
    }
  }catch(e){}
}

/* ================= interface (bouton + panneau flottant) ================= */
function faoOpDefaults(type){
  const s=faoStock(); const job=faoDoc();
  const tool=(job.tools&&job.tools[0])||{id:'T1',d:10};
  const cx=(s.x0+s.x1)/2, cy=(s.y0+s.y1)/2;
  const base={id:faoNewId('op'), on:true, toolId:tool.id, radial:0, axial:0};
  const D=isFinite(+tool.d)?+tool.d:10;
  if(type==='facing')return Object.assign({},base,{type:'facing', z:s.z1, ae:+(D*0.6).toFixed(2), arrondi:0});
  if(type==='pocket')return Object.assign({},base,{type:'pocket',
    x0:+(s.x0+job.marge).toFixed(2), y0:+(s.y0+job.marge).toFixed(2),
    x1:+(s.x1-job.marge).toFixed(2), y1:+(s.y1-job.marge).toFixed(2),
    ztop:s.z1, zbot:s.z0, ap:5, ae:+(D*0.5).toFixed(2), radial:0.5, axial:0.5, arrondi:0});
  if(type==='contour')return Object.assign({},base,{type:'contour',
    x0:s.x0, y0:s.y0, x1:s.x1, y1:s.y1, ztop:s.z1, zbot:s.z0, ap:5, radial:0.5, axial:0.5, arrondi:0});
  if(type==='drill')return Object.assign({},base,{type:'drill',
    pts:[[+cx.toFixed(2),+cy.toFixed(2)]], ztop:s.z1, zbot:s.z0, peck:0});
  if(type==='rough3d')return Object.assign({},base,{type:'rough3d',
    ztop:s.z1, zbot:s.z0, ap:5, ae:+(D*0.6).toFixed(2),
    radial:0.5, axial:0.5,
    // 2026-10-08-004 : entrée circulaire (arc tangent) par défaut à la
    // création — 'auto' garde l'hélice/plongée historique des anciens docs.
    entry:'circ', minipasses:0,
    // 2026-10-07-005 : l'ESCARGOT est la 1re selection a la creation
    // (les documents anciens sans mode restent conventionnels).
    mode:'escargot',
    // 2026-10-08-003 : sens de passe — 'avalant' (defaut a la creation) =
    // sens de coupe CONSTANT : aucune chaine retournee, la passe suit toujours
    // le meme sens d'avance (les dents attaquent la matiere de la meme facon,
    // cf. sens de rotation de la fraise). Absent = legacy 'bidir' (retournement
    // vers l'extremite la plus proche, documents anteriurs inchanges).
    sens:'avalant',
    arrondi:+(Math.min(2,D*0.25)).toFixed(2)});
  if(type==='geofinish')return Object.assign({},base,{type:'geofinish',
    step:1, laisse:0, seed:'top', entry:'circ', ztop:s.z1, zbot:s.z0});
  // Type retiré (2026-10-06-004 : pocket3d) ou inconnu -> null : pas de fiche,
  // pas d'opération fantôme. Seule la barre « + Usinage » crée des opérations.
  if(['facing','pocket','contour','drill','rough3d','geofinish'].indexOf(type)<0)return null;
  return Object.assign({},base,{type:type});
}
// Les 6 usinages et leur libellé court — source unique des boutons « + » de
// l'arbre FAO (l'ordre est contractuel : les tests cliquent par index).
function faoAddOpsSpec(){
  return [['facing','+ Surfaçage'],['pocket','+ Poche'],['contour','+ Contour'],
    ['drill','+ Perçage'],['rough3d','+ Ébauche 3D'],['geofinish','+ Finition']];
}
/* ================= interface FAO : arbre + fiches panneau droit ================= */
// Arbre FAO dédié (overlay dans la vue 3D) : posages > opérations, état on/off,
// badge outil. La fiche du posage / de l'op sélectionnée s'affiche dans le
// panneau droit (#props), comme toute fonction dessin (hook dans renderProps).
function faoH(t){ const h=document.createElement('div');
  h.className='fao-h'; h.textContent=t; return h; }
function faoRow(){ const d=document.createElement('div');
  d.className='fao-row'; return d; }
function faoLab(t){ const s=document.createElement('span');
  s.className='fao-lab'; s.textContent=t; return s; }
function faoSnapshot(title){
  // Instantané du document AVANT mutation — même discipline que le modèle dessin
  // (45-annuler-document.js) : Ctrl+Z revient à l'état FAO précédent. Le titre du
  // widget (infobulle) devient le libellé dans le bouton « Annuler ».
  try{
    if(typeof docPushUndo==='function')
      docPushUndo('FAO : '+(title?String(title).slice(0,48):'modification'));
  }catch(e){}
}
function faoAllOps(){
  // Toutes les operations de TOUS les posages (modifier un outil peut perimier
  // les parcours d'un posage qui n'est pas actif).
  try{
    const r=faoRoot(), out=[];
    (r.setups||[]).forEach(function(s){ ((s&&s.ops)||[]).forEach(function(o){ if(o)out.push(o); }); });
    return out;
  }catch(e){ return []; }
}
function faoStaleCount(){ let n=0; faoAllOps().forEach(function(o){ if(o&&o.stale===true)n++; }); return n; }
function faoStaleScan(){
  // EXACT : une operation est "a regenerer" quand sa cle de cache ne correspond
  // plus a l'entree memorisee (outil, parametres, brut, maillage). C'est ce test
  // qui empeche la regeneration eager : tant qu'une operation est perimee,
  // faoOpMoves renvoie l'ancien trace et l'icone ! s'affiche dans l'arbre.
  let n=0;
  try{
    const r=faoRoot();
    (r.setups||[]).forEach(function(s){
      ((s&&s.ops)||[]).forEach(function(o){
        if(!o)return;
        // Prima le maillage AVANT la cle (comme faoOpMoves) : la 1re lecture
        // d'une ebauche 3D incremente faoBodyGen.
        if(o.type==='rough3d'||o.type==='geofinish'){ try{ faoActiveMesh(s); }catch(e){} }
        const ck=faoOpMovesKey(o,s), ch=faoOpMovesHit(o);
        const st=(ck!==null)&&!(ch&&ch.key===ck);
        o.stale=st;
        if(st)n++;
      });
    });
  }catch(e){}
  return n;
}
function faoStaleClear(){ faoAllOps().forEach(function(o){ if(o&&o.stale===true)o.stale=false; }); }
function faoStaleWhy(op,job){
  // Pourquoi CETTE ligne est-elle marquée ⚠ ? Trois causes tres differentes
  // (aucune trace / tampon d'ancien moteur / autre cle = le SOLIDE a bouge), et
  // sans cela l'utilisateur ne peut pas trancher — « 1 operation sans parcours »
  // ne dit pas SI la trace existe dans le cache.
  try{
    if(!faoSolidSettled())return 'Rejeu exact en cours : le corps affiche vient du cache local (sans solide). La lecture et la generation attendent la fin du rejeu — quelques secondes.';
    if(faoMovesPending())return 'Lecture du cache en cours : la reponse s affiche dans un instant.';
    const ck=faoOpMovesKey(op,job);
    if(ck===null)return 'Solide ou maillage indisponible : aucune cle de cache possible pour l instant.';
    const ch=faoOpMovesHit(op);
    if(!ch){
      const w=faoMovesWhyGet(job,op);
      if(w&&w.why==='version')return 'Trace conservee mais ecrite par une version ANTERIEURE du moteur ('+w.ver+') : a regenerer une fois, puis re-enregistrer.';
      if(w&&w.why==='cle')return 'Trace conservee sous une AUTRE cle ('+(w.n||0)+' points) : '
        +(w.d||'outil, parametres ou SOLIDE modifies depuis la generation.')
        +' Cette operation n a pas pu etre servie telle quelle depuis le cache.'
        +' Remede : « Tout regenerer » une fois, puis re-enregistrer le fichier'
        +' — la trace reste ensuite valable tant que le solide ne change pas.';
      if(w&&w.why==='absente')return 'Aucune trace enregistree pour cette operation (jamais generate ici, ou cache purge).';
      if(w&&w.why==='format')return 'Entree de cache illisible : a regenerer une fois.';
      return 'Aucune trace enregistree pour cette operation sur cette machine (jamais generate ici).';
    }
    if(ch.key!==ck)return 'Trace en memoire sous une autre cle : '+faoKeyDiff(ch.key,ck)+'.';
    return '';
  }catch(e){ return ''; }
}
function faoOpMovesPurge(){
  // Purge COMPLETE du cache : la prochaine lecture recalcule CHAQUE operation.
  try{ faoOpMovesMap=new WeakMap(); }catch(e){}
}
function faoRegenOp(setupId,opId){
  // Clic sur le triangle ⚠ (arbre OU fiche) : régénérer CETTE opération
  // uniquement — les autres gardent leur tracé, qu'elles soient à jour ou non.
  try{
    const r=faoRoot(); let s=null,o=null;
    (r.setups||[]).forEach(function(x){
      ((x&&x.ops)||[]).forEach(function(q){ if(q&&q.id===opId){ s=x; o=q; } });
    });
    if(!o)return 0;
    o.stale=false;             // débloque le recalcul (clé ≠ cache)
    const mv=faoOpMoves(o,s);
    faoRefreshPreview();       // redessine : cette op est fraîche, les autres servent l'ancien tracé
    if(faoStaleCount()===0)faoPrevStale=false;
    faoRefreshFaoUI();         // arbre (triangle retiré) + fiche + bouton
    return mv?mv.length:0;
  }catch(e){ return 0; }
}
function faoStaleUI(){
  // Reflète faoPrevStale sur le bouton « Tout régénérer » et sur l'export.
  try{
    let bg=faoGenBtnEl;
    if(!bg&&(typeof document!=='undefined'&&document))bg=document.getElementById('faoGenBtn');
    if(bg){
      const n=faoStaleCount();
      bg.textContent=faoPrevStale
        ? (String.fromCharCode(0x26a0)+' Tout régénérer'+(n?' ('+n+')':''))
        : 'Tout régénérer';
      if(bg.classList&&bg.classList.toggle)bg.classList.toggle('fao-stale',!!faoPrevStale);
      bg.title=faoPrevStale
        ? ((n?(n+' opération(s) à régénérer — son triangle ⚠ ne régénère qu’elle. ')
             :'')
           +'Ce bouton régénère TOUTES les opérations puis ré-affiche les traces'
           +' (les traces masquées ligne par ligne le RESTENT).')
        : ('Régénère TOUTES les opérations (même celles à jour) puis RÉ-AFFICHE toutes'
           +' les traces — les traces masquées ligne par ligne ne le sont pas :'
           +' masquez-les à la main, ligne par ligne.');
    }
    let be=faoExportBtnEl;
    if(!be&&(typeof document!=='undefined'&&document))be=document.getElementById('faoExportBtn');
    if(be){
      be.disabled=!!faoPrevStale;
      be.title=faoPrevStale
        ?'Export bloqué : aperçu périmé. Cliquez d’abord sur « Tout régénérer ».'
        :'Exporte le programme du posage courant : G-code Siemens 840D ou Fagor 8065 (.mpf / .nc).';
    }
  }catch(e){}
}
function faoChanged(){
  // Pendant la lecture du cache, aucun verdict n'est fiable : la memoire est vide,
  // tout parait « perime » alors que rien ne l'est (et l'apercu recalculerait tout).
  // On tranchera apres la lecture — cf. faoMovesDone().
  const attend=faoMovesPending();
  if(attend)faoPrevWanted='full';
  else faoStaleScan();            // 1) qui doit être regeneré -> icônes !
  faoTouch();
  if(!attend)faoRefreshPreview(); // 2) redraw : sert l'ancien trace pour les perimes
  faoRefreshFaoUI();
  faoPrevStale=true;
  faoStaleUI();
}
function faoVisibleChanged(){
  // OEIL « Masquer / Afficher » : champ PUREMENT AFFICHAGE (ignore par faoOpSig, le
  // G-code ne change pas, l'export reste valide, aucun triangle). On DESSINE ce qui
  // est deja en memoire : ouvrir un document puis masquer une operation ne doit
  // JAMAIS declencher la regeneration des trajectoires (~90 s sur l'ebauche 3D).
  faoTouch();
  if(faoMovesPending()){
    if(!faoPrevWanted)faoPrevWanted='lecture'; // redraw en fin de lecture
    faoRefreshFaoUI();
    return;
  }
  const n=faoRefreshPreview(true);
  faoRefreshFaoUI();
  try{
    if(faoPrevMissing>0&&typeof faceEl!=='undefined'&&faceEl){
      let why='';
      try{
        const job=faoDoc();
        const ops=faoActiveOps(job).filter(function(o){ return !o||!o.hidden; });
        for(let i=0;i<ops.length;i++){
          const ck=faoOpMovesKey(ops[i],job), ch=faoOpMovesHit(ops[i]);
          if(ck!==null&&!(ch&&ch.key===ck)){ why=faoMovesWhyShort(job,ops[i]); if(why)break; }
        }
      }catch(e){}
      faceEl.textContent='FAO : '+faoPrevMissing+' operation(s) sans parcours en memoire'
        +' ('+n+' points affiches)'
        +(why?' — '+why:'')
        +' — « Tout régénérer » pour les produire.';
    }
    else if(n>0&&typeof faceEl!=='undefined'&&faceEl)
      faceEl.textContent='FAO : '+n+' points de parcours.';
  }catch(e){}
}
function faoReset(){
  // « Nouveau modèle » : la FAO repart de zéro — mode lecture fermé, fenêtre outils
  // fermée, traces retirées de la scène, posages et opérations remis au défaut.
  try{ if(typeof faoVw!=='undefined'&&faoVw)faoViewerClose(); }catch(e){}
  try{ if(typeof faoToolsWin!=='undefined'&&faoToolsWin)faoToolsWindowClose(); }catch(e){}
  try{ if(typeof doc!=='undefined'&&doc)delete doc.fao; }catch(e){} // faoRoot() recrée un posage propre
  try{ if(typeof sel!=='undefined'&&sel&&(sel.kind==='faoSetup'||sel.kind==='faoOp'))sel={kind:null,id:null}; }catch(e){}
  try{ faoViewerBtnUpdate(); }catch(e){}
  try{ faoChanged(); }catch(e){} // traces (0 pt désormais) + arbre + fiche
  // Rien à valider : sans opération active, un bouton « ⚠ Tout régénérer » ment
  // (il n'y a rien à générer) — le bouton revient au vert dès l'ouverture.
  try{
    if(!faoActiveOps(faoDoc()).length){ faoPrevStale=false; faoStaleUI(); }
  }catch(e){}
}
function faoNum(val,fn,w,step,title){
  const i=document.createElement('input'); i.type='number'; i.className='fao-in';
  i.value=val; i.style.width=(w||60)+'px';
  if(step)i.step=step;
  if(title)i.title=title;
  i.onchange=function(){ const v=parseFloat(i.value); if(isFinite(v)){ faoSnapshot(title); fn(v); faoChanged(); } };
  return i; }
function faoTxt(val,fn,w,title){
  const i=document.createElement('input'); i.type='text'; i.className='fao-in';
  i.value=val; i.style.width=(w||120)+'px';
  if(title)i.title=title;
  i.onchange=function(){ faoSnapshot(title); fn(i.value); faoChanged(); };
  return i; }
function faoSel(opts,val,fn,title){
  const s=document.createElement('select'); s.className='fao-sel';
  opts.forEach(function(o){ const op=document.createElement('option');
    op.value=o[0]; op.textContent=o[1]; if(o[2])op.title=o[2]; s.appendChild(op); });
  s.value=val;
  if(title)s.title=title;
  s.onchange=function(){ faoSnapshot(title); fn(s.value); faoChanged(); };
  return s; }
function faoMini(t,fn,title){
  const b=document.createElement('button'); b.className='fao-mini'; b.textContent=t;
  if(title)b.title=title;
  b.onclick=function(){ faoSnapshot(title||('bouton « '+t+' »')); fn(); faoChanged(); };
  return b; }
function faoHelp(t){
  // Ligne d'aide sous un groupe de champs (néophytes : quoi mettre et pourquoi).
  const n=document.createElement('div');
  n.className='fao-help';
  n.textContent=t; return n; }
/* 2026-10-08-004 : lignes « Entrée » + « R entrée » communes aux fiches
   Poche / Contour / Ébauche 3D / Finition : sélection du mode (circ par
   défaut) et rayon du cercle d'entrée (défaut Ø/4). */
function faoEntryRows(rp,op,D){
  rp.appendChild(faoLab('Entrée'));
  rp.appendChild(faoSel([
    ['circ','Cercle · arc tangent','Rapide sur place, descente en Z à l\'ancre, arc tangent sur la passe — défaut.'],
    ['auto','Auto · hélice si possible','Hélice quand le vide fait ≥ 2×Ø, sinon rampe.'],
    ['helix','Hélice · descente circulaire','Creuse sa place en tournant : il faut un vide d\'au moins 2×Ø.'],
    ['ramp','Rampe · descente en biais','Descend en avançant le long de la passe : passe partout, plus lent.']],
    op.entry||'circ',function(v){op.entry=v;},
    'Manière de plonger dans la matière — jamais de plongée verticale.'));
  const dE=(isFinite(+D)&&+D>0)?+D:10;
  rp.appendChild(faoLab('R entrée'));
  rp.appendChild(faoNum(isFinite(+op.entryR)&&+op.entryR>0?+op.entryR:+(dE/4).toFixed(2),function(v){
    if(isFinite(v)&&v>0)op.entryR=v; else delete op.entryR;
  },44,0.1,
  'Rayon du cercle d\'entrée (mm) : le centre du cercle se place à ce rayon de l\'ancre, l\'arc arrive en tangence sur la passe. Défaut Ø/4 de l\'outil ; 0 = défaut.'));
}
/* 2026-10-08-003 : infos de mode en menu CONTEXTUEL — la fiche reste lisible
   (les blocs d'aide « trop en place » ont été retirés) : clic droit sur le
   select Mode de l'Ébauche 3D = popup avec le texte du mode CHOISI. Fermeture
   sur clic extérieur, Échap, ou changement de mode (voir le wrapper du select). */
let faoInfoBox=null, faoInfoOff=null;
function faoModeInfoClose(){
  if(faoInfoOff){ try{faoInfoOff();}catch(e){} faoInfoOff=null; }
  if(faoInfoBox){
    try{ faoInfoBox.remove(); }catch(e){}
    // Le harnais de test stub remove() : on désactive aussi la classe pour que
    // « popup fermé » soit observable partout (inoffensif côté navigateur).
    try{ faoInfoBox.className='fao-ctx-off'; }catch(e){}
    faoInfoBox=null;
  }
}
function faoModeInfoShow(x,y,text){
  faoModeInfoClose();
  const b=document.createElement('div');
  b.className='fao-ctx';
  b.textContent=text;
  try{ b.style.left=Math.max(4,x)+'px'; b.style.top=Math.max(4,y)+'px'; }catch(e){}
  try{ document.body.appendChild(b); }catch(e){ return; }
  faoInfoBox=b;
  try{
    const away=function(e){
      if(faoInfoBox&&e&&e.target&&faoInfoBox.contains&&faoInfoBox.contains(e.target))return;
      faoModeInfoClose();
    };
    const key=function(e){ if(!e||e.key==='Escape'||e.keyCode===27)faoModeInfoClose(); };
    window.addEventListener('pointerdown',away);
    window.addEventListener('keydown',key);
    faoInfoOff=function(){
      try{ window.removeEventListener('pointerdown',away); }catch(e){}
      try{ window.removeEventListener('keydown',key); }catch(e){}
    };
  }catch(e){}
}
function faoCard(){
  const d=document.createElement('div');
  d.className='fao-card';
  return d; }
function faoRefreshFaoUI(){
  try{ faoRenderTree(); }catch(e){}
  try{
    if(typeof sel!=='undefined'&&sel&&sel.kind&&(sel.kind==='faoSetup'||sel.kind==='faoOp')
      &&typeof renderProps==='function')renderProps();
  }catch(e){}
  faoStaleUI();
}
let faoTreeWrapEl=null; // ref réelle du panneau arbre FAO (la lecture par id est ambiguë sous stub)
let faoAddBarEl=null;   // barre des 7 +usinage posée sur la vue 3D
let faoWrapEl=null;     // colonne de droite #faoWrap : barre des +usinage + panneau FAO
let faoFolded=false;    // panneau FAO rabattu sur sa droite (persisté en localStorage)
let faoCntEl=null;      // contenu .fao-cnt (ref réelle pour le repli programmatique)
let faoTogEl=null;      // onglet #faoToggle (ref réelle : lecture par id ambiguë sous stub)
function faoFoldSet(f){ // replier/déplier SANS toucher à localStorage (clic manuel = persistance)
  if(!faoTreeWrapEl||!faoCntEl||!faoTogEl)return;
  faoFolded=!!f;
  try{faoCntEl.style.display=faoFolded?'none':'';}catch(e){}
  try{faoTreeWrapEl.classList.toggle('folded',faoFolded);}catch(e){}
  faoTogEl.textContent=faoFolded?'❮':'❯';
  faoTogEl.title=faoFolded?'Déplier le panneau FAO':'Rabattre le panneau FAO sur la droite';
  if(faoAddBarEl)faoAddBarEl.style.display=faoFolded?'none':'';
}
function faoInitUI(){
  if(typeof document==='undefined')return;
  try{
    if(typeof window!=='undefined'&&window.addEventListener&&!faoVwEsc){
      faoVwEsc=true; // une seule fois
      window.addEventListener('keydown',function(e){
        if(e.key!=='Escape')return;
        if(faoToolsWin){ faoToolsWindowClose(); return; } // fenêtre outils d'abord
        if(faoVw){
          faoViewerClose();
          faoViewerMsg('FAO : mode lecture usinage quitté (Échap) — traces ré-affichées.');
        }
      });
    }
    // 7 boutons d'ajout : sur la vue 3D (même pilule que #viewbar), posés sur la
    // colonne de droite AU-DESSUS du panneau FAO — masqués dès que ce panneau est
    // rabattu. Le panneau FAO coule lui-même sous la barre dans la même colonne.
    if(!faoAddBarEl){
      const barHost=document.getElementById('vpwrap')||document.body;
      if(barHost){
        // colonne de droite #faoWrap : barre des +usinage puis panneau FAO
        let col=null;
        const sib=barHost.children||[];
        for(let i=0;i<sib.length;i++){ if(sib[i]&&sib[i].id==='faoWrap'){col=sib[i];break;} }
        if(!col){ col=document.createElement('div'); col.id='faoWrap'; barHost.appendChild(col); }
        faoWrapEl=col;
        const bar=document.createElement('div');
        bar.id='faoAddBar';
        bar.className='fao-addbar'; // pilule : meme panneau que #viewbar (faoUiCss)
        const lab=document.createElement('span');
        lab.className='fao-addlab';
        lab.textContent='+ Usinage';
        lab.title='Ajouter une opération d’usinage au posage courant — sa fiche s’ouvre dans le panneau de droite.';
        bar.appendChild(lab);
        faoAddOpsSpec().forEach(function(a){
          const nm=a[1].replace(/^\+ /,'');
          const b=document.createElement('button');
          b.textContent=nm;
          b.title='Ajouter une opération « '+nm+' » au posage courant (puis sa fiche s’ouvre à droite)';
          b.onclick=function(){
            try{
              const op=faoOpDefaults(a[0]);
              if(!op)return;
              const s=faoSetup();
              faoSnapshot('nouvelle opération « '+nm+' »');
              s.ops.push(op);
              faoChanged();
              faoSelectOp(s.id,op.id);
            }catch(e){}
          };
          bar.appendChild(b);
        });
        col.appendChild(bar);
        faoAddBarEl=bar;
      }
    }
    if(!faoTreeWrapEl){
      const host=faoWrapEl||document.getElementById('vpwrap')||document.body;
      const w=document.createElement('div');
      w.id='faoTreeWrap'; // habillage entièrement en CSS injecté (faoUiCss)
      // onglet de repli — procédé identique à l'arbre des corps (src/95-toolbar.js)
      const tog=document.createElement('button');
      tog.id='faoToggle';
      tog.textContent='❯';
      tog.title='Rabattre le panneau FAO sur la droite';
      w.appendChild(tog);
      const cnt=document.createElement('div');
      cnt.className='fao-cnt';
      w.appendChild(cnt);
      const t=document.createElement('div');
      t.className='fao-title';
      t.textContent='FAO · posages';
      cnt.appendChild(t);
      const tree=document.createElement('div'); tree.id='faoTree'; cnt.appendChild(tree);
      const grp=function(label){ const g=document.createElement('div'); g.className='fao-h'; g.textContent=label; return g; };
      const row=function(){ const d=document.createElement('div'); d.className='fao-actions'; return d; };
      // Les 7 +usinage vivent sur la vue 3D (faoAddBar) ; ici les ACTIONS du
      // posage, regroupées sous un libellé qui dit ce que le bouton fait.
      cnt.appendChild(grp('Posage'));
      const r1=row();
      const add=document.createElement('button'); add.textContent='+ Posage';
      add.title='Nouveau posage (machine, origine, brut propres).';
      add.onclick=function(){
        try{
          const r=faoRoot();
          faoSnapshot('nouveau posage');
          const s=faoDefaultSetup(); s.name='POSAGE'+(r.setups.length+1);
          r.setups.push(s); r.activeSetupId=s.id;
          faoChanged();
        }catch(e){}
      };
      r1.appendChild(add);
      const tw=document.createElement('button'); tw.id='faoToolsBtn'; tw.textContent='Outils';
      tw.title='Bibliothèque d\'outils du posage : fenêtre flottante (Échap ou ✕ pour fermer).';
      tw.onclick=function(){ faoToolsWindowToggle(); };
      r1.appendChild(tw);
      cnt.appendChild(r1);
      cnt.appendChild(grp('Exécution'));
      const r2=row();
      const bvw=document.createElement('button'); bvw.id='faoVwBtn';
      bvw.textContent=faoVw?'■ Quitter l\'usinage':'▶ Usinage';
      bvw.title='Viewer d\'usinage : cache les traces, anime l\'outil le long du parcours (Échap pour sortir).';
      bvw.onclick=function(){ faoViewerToggle(); };
      faoVwBtn=bvw;
      r2.appendChild(bvw);
      cnt.appendChild(r2);
      // Tout régénérer : en bas d'Exécution, toujours visible — régénère TOUTES
      // les trajectoires ; les traces masquées ligne par ligne le RESTENT masquées.
      const bg=document.createElement('button'); bg.id='faoGenBtn'; faoGenBtnEl=bg;
      bg.className='fao-gen';
      bg.textContent='Tout régénérer';
      bg.title='Régénère TOUTES les trajectoires (même celles à jour). Les traces'
        +' masquées ligne par ligne le restent — masquez-les à la main.';
      bg.onclick=function(){
        faoPreviewGenerate();
        try{ faoRefreshFaoUI(); }catch(e){}
      };
      cnt.appendChild(bg);
      cnt.appendChild(grp('Export'));
      const r4=row();
      const be=document.createElement('button'); be.id='faoExportBtn'; faoExportBtnEl=be; be.className='primary'; be.textContent='Exporter G-code';
      be.title='Exporte le programme du posage courant : G-code Siemens 840D ou Fagor 8065 (.mpf / .nc).';
      be.onclick=function(){ faoExport(); };
      r4.appendChild(be);
      cnt.appendChild(r4);
      faoViewerBtnUpdate();
      // Refs du repli programmatique (session d'esquisse) posées AVANT la
      // restauration initiale, qui passe par fold() → faoFoldSet.
      faoTreeWrapEl=w;faoCntEl=cnt;faoTogEl=tog;
      // Repli : contenu masqué, onglet seul au bord droit, barre 3D masquée —
      // état persisté comme l'arbre des corps (clic de l'onglet seul).
      const fold=function(){
        faoFoldSet(!faoFolded);
        try{ localStorage.setItem('minifusion_faoFolded',faoFolded?'1':'0'); }catch(e){}
      };
      tog.onclick=fold;
      try{ if(localStorage.getItem('minifusion_faoFolded')==='1')fold(); }catch(e){}
      host.appendChild(w);
    }
    faoRenderTree();
  }catch(e){}
}
function faoRenderTree(){
  let tree=null;
  try{ tree=document.getElementById('faoTree'); }catch(e){ return; }
  if(!tree)return;
  try{
    tree.innerHTML='';
    const r=faoRoot();
    const isSel=function(kind,id){ try{
      return typeof sel!=='undefined'&&sel&&sel.kind===kind&&sel.id===id;
    }catch(e){ return false; } };
    r.setups.forEach(function(s,si){
      const h=document.createElement('div');
      h.className='fao-setup'+(isSel('faoSetup',s.id)?' sel':'');
      // ▼/▶ : replie les opérations de CE posage — l'état (s.open) est dans le
      // document, donc enregistré/chargé avec la sauvegarde. Déplié par défaut.
      const open=s.open!==false;
      const tri=document.createElement('span');
      tri.className='fao-tri';
      tri.textContent=open?'▼':'▶';
      tri.title=open?'Replier les opérations de ce posage':'Déplier les opérations de ce posage';
      tri.onclick=function(ev){
        try{ if(ev&&ev.stopPropagation)ev.stopPropagation(); }catch(e){}
        s.open=!open;
        faoTouch(); // champ purement UI : persiste dans doc.fao + re-rend l'arbre, sans rien recalculer
      };
      h.appendChild(tri);
      const sl=document.createElement('span');
      sl.textContent='▤ '+s.name+' · '+(FAO_POSTS[s.machine||s.post]?FAO_POSTS[s.machine||s.post].label:s.machine)
        +(faoOrientOn(s)?(' · 3+2 B'+faoOrient(s).b+' C'+faoOrient(s).c):'');
      h.appendChild(sl);
      h.title='Clic = fiche du posage dans le panneau droit'
        +(open?'':' · opérations repliées (clic sur la flèche pour les rouvrir)');
      h.onclick=function(){ faoSelectSetup(s.id); };
      tree.appendChild(h);
      if(open)(s.ops||[]).forEach(function(op,i){
        // ●/○ = ACTIVÉE (entre dans le G-code) — indépendant de « Masquer » : une
        // opération désactivée est absente du programme, une opération masquée
        // est dans le programme mais ses TRACES ne s'affichent pas en 3D.
        const hid=op.hidden===true;
        const off=op.on===false;
        const d=document.createElement('div');
        d.className='fao-op'+(isSel('faoOp',op.id)?' sel':'')
          +(off?' isoff':'')+(hid?' ishid':'');
        d.title='Clic = fiche dans le panneau droit'
          +(hid?' — traces masquées dans la 3D (opération toujours active)':'');
        const eye=document.createElement('span');
        eye.textContent=off?'○':'●';
        eye.className='eye '+(off?'off':'on');
        eye.title='Activer / désactiver (entre dans le G-code)';
        eye.onclick=function(ev){ try{ if(ev&&ev.stopPropagation)ev.stopPropagation(); }catch(e){}
          faoSnapshot('activer/désactiver « '+faoOpShortLabel(op)+' »');
          op.on=!(op.on!==false); faoChanged(); };
        const lb=document.createElement('span'); lb.className='lb';
        lb.textContent=(i+1)+'. '+faoOpShortLabel(op);
        const tool=faoToolById(s,op.toolId);
        const badge=document.createElement('span');
        badge.className='badge';
        badge.textContent='[T'+(tool.num||'?')+']';
        // Masquer / Afficher : traces d'UNE opération, à l'extrême droite (l'œil
        // d'activation reste le premier enfant : ordre contractuel des tests).
        const mb=document.createElement('span');
        mb.className='hbtn'+(hid?' on':'');
        mb.textContent=hid?'Afficher':'Masquer';
        mb.title=hid
          ?'Ré-afficher les traces de cette opération dans la 3D (le G-code n a jamais changé)'
          :'Masquer UNIQUEMENT les traces de cette opération dans la 3D — l opération reste active et exportée';
        mb.onclick=function(ev){ try{ if(ev&&ev.stopPropagation)ev.stopPropagation(); }catch(e){}
          faoSnapshot((hid?'ré-afficher':'masquer')+' les traces de « '+faoOpShortLabel(op)+' »');
          op.hidden=!hid; faoVisibleChanged(); };
        d.appendChild(eye); d.appendChild(lb); d.appendChild(badge);
        if(op.stale===true){
          const sk=document.createElement('span');
          sk.className='stalei';
          sk.textContent=String.fromCharCode(0x26a0);
          const why=faoStaleWhy(op,s);
          sk.title='Parcours à régénérer : CETTE opération a changé. Clic = ne régénérer'
            +' que cette opération (le bouton « Tout régénérer » régénère tout).'
            +(why?(' '+why):'');
          sk.onclick=function(ev){
            try{ if(ev&&ev.stopPropagation)ev.stopPropagation(); }catch(e){}
            faoRegenOp(s.id,op.id);
          };
          d.appendChild(sk);
        }
        d.appendChild(mb);
        d.onclick=function(){ faoSelectOp(s.id,op.id); };
        tree.appendChild(d);
      });
    });
  }catch(e){}
}
function faoOpShortLabel(op){
  const n={facing:'Surfaçage',pocket:'Poche',contour:'Contour',drill:'Perçage',
    rough3d:'Ébauche 3D',geofinish:'Finition géod.'}[op.type]||op.type;
  if(op.type==='drill')return n+' ('+(op.pts||[]).length+')';
  return n;
}
function faoSelectSetup(id){
  try{
    const r=faoRoot(); r.activeSetupId=id;
    sel={kind:'faoSetup',id:id};
    if(typeof renderTree==='function')renderTree();
    if(typeof renderProps==='function')renderProps();
    faoRenderTree();
  }catch(e){}
}
function faoSelectOp(setupId,opId){
  try{
    const r=faoRoot(); r.activeSetupId=setupId;
    sel={kind:'faoOp',id:opId,setup:setupId};
    if(typeof renderTree==='function')renderTree();
    if(typeof renderProps==='function')renderProps();
    faoRenderTree();
  }catch(e){}
}
/* ----- bibliothèque d'outils (élément réutilisable) ----- */
function faoToolsElement(setup){
  const wrap=document.createElement('div');
  const H=faoH('Outils ('+(setup.tools||[]).length+') · Vc/fz → S/F auto');
  wrap.appendChild(H);
  (setup.tools||[]).forEach(function(t,ti){
    const sf=faoToolSF(t,setup);
    const d=faoCard();
    const r=faoRow();
    r.appendChild(faoLab('T'+t.num));
    r.appendChild(faoTxt(t.name,function(v){ t.name=String(v||t.name).slice(0,24); },92));
    r.appendChild(faoSel([['flat','Cylindrique'],['bull','Torique'],['ball','Boule']],t.kind||'flat',
      function(v){ t.kind=v; if(v==='ball')t.cornerR=t.d/2; }));
    r.appendChild(faoMini('✕',function(){
      if(setup.tools.length<=1)return;
      setup.tools.splice(ti,1);
      setup.tools.forEach(function(k,i){ k.num=i+1; });
    }));
    d.appendChild(r);
    const r2=faoRow();
    r2.appendChild(faoLab('D')); r2.appendChild(faoNum(t.d,function(v){ t.d=Math.max(0.5,v);
      if(t.kind==='ball')t.cornerR=t.d/2; },52));
    if(t.kind==='bull'){ r2.appendChild(faoLab('r')); r2.appendChild(faoNum(t.cornerR||0,function(v){ t.cornerR=Math.max(0,v); },44)); }
    r2.appendChild(faoLab('dents')); r2.appendChild(faoNum(t.flutes,function(v){ t.flutes=Math.max(1,Math.round(v)); },40));
    d.appendChild(r2);
    const r3=faoRow();
    r3.appendChild(faoLab('Vc')); r3.appendChild(faoNum(t.vc,function(v){ t.vc=Math.max(1,v); },56));
    r3.appendChild(faoLab('fz')); r3.appendChild(faoNum(t.fz,function(v){ t.fz=Math.max(0.005,v); },52,0.01));
    const s=document.createElement('span');
    s.style.cssText='font-family:monospace;font-size:.72rem;color:#7ee0c0;';
    s.textContent='→ S'+sf.s+' F'+sf.f+' (plongée '+sf.plunge+')';
    r3.appendChild(s);
    d.appendChild(r3);
    wrap.appendChild(d);
  });
  const rT=faoRow();
  const bT=document.createElement('button'); bT.textContent='+ Outil'; bT.style.fontSize='.72rem';
  bT.onclick=function(){
    faoSnapshot('nouvel outil');
    const n=(setup.tools||[]).length+1;
    setup.tools.push({id:'T'+n+'_'+Date.now().toString(36),num:n,name:'Fraise D10',kind:'flat',
      d:10,cornerR:0,flutes:2,vc:250,fz:0.06});
    faoChanged();
  };
  rT.appendChild(bT); wrap.appendChild(rT);
  return wrap;
}
/* ----- fenêtre flottante : bibliothèque d'outils du posage actif ----- */
let faoToolsWin=null, faoToolsWinX=null, faoToolsWinBody=null, faoToolsWinT=null;
function faoToolsWindowOpen(){
  // Fenêtre dédiée (au lieu de faire défiler la fiche posage) : créée à la volée,
  // contenu RECONSTRUIT à chaque ouverture (setup actif du moment), fermable ✕ / Échap.
  // Refs globales (pattern viewer) — jamais de relecture par id.
  try{
    if(!faoToolsWin){
      const host=(document.getElementById('vpwrap')||document.body);
      const w=document.createElement('div'); w.id='faoToolsWin';
      w.className='fao-win'; // position + habillage via la feuille faoUiCss
      const h=document.createElement('div');
      h.className='fao-win-h';
      const ht=document.createElement('div'); ht.id='faoToolsWinT';
      ht.className='fao-win-t';
      h.appendChild(ht);
      const xb=document.createElement('button'); xb.id='faoToolsWinX'; xb.textContent='✕';
      xb.className='fao-win-x'; xb.title='Fermer la fenêtre (Échap aussi)';
      xb.onclick=function(){ faoToolsWindowClose(); };
      h.appendChild(xb);
      w.appendChild(h);
      const body=document.createElement('div'); body.id='faoToolsWinBody';
      w.appendChild(body);
      host.appendChild(w);
      faoToolsWin=w; faoToolsWinX=xb; faoToolsWinBody=body; faoToolsWinT=ht;
    }
    const setup=faoSetup();
    if(faoToolsWinT)faoToolsWinT.textContent='Outils · '+((setup&&setup.name)||'posage');
    if(faoToolsWinBody){ faoToolsWinBody.innerHTML=''; faoToolsWinBody.appendChild(faoToolsElement(setup)); }
    faoToolsWin.style.display='block';
    return true;
  }catch(e){ faoViewerMsg('Outils : '+((e&&e.message)||e)); return false; }
}
function faoToolsWindowClose(){
  const w=faoToolsWin;
  try{ if(w&&w.parentNode)w.parentNode.removeChild(w); }catch(e){}
  try{ if(w)w.style.display='none'; }catch(e){}
  faoToolsWin=null; faoToolsWinX=null; faoToolsWinBody=null; faoToolsWinT=null;
}
function faoToolsWindowToggle(){
  if(faoToolsWin){ faoToolsWindowClose(); return false; }
  return faoToolsWindowOpen();
}
/* ----- fiche d'opération (élément réutilisable) ----- */
function faoToolOpts(setup){
  return (setup.tools||[]).map(function(t){
    const sf=faoToolSF(t,setup);
    return [t.id,'T'+t.num+' '+t.name+' (S'+sf.s+' F'+sf.f+')']; });
}
/* ----- plans de dégagement/retrait : rangées « référence + décalage » ----- */
// 2026-10-08-002 — composants partagés fiche posage / fiche opération.
function faoPlaneRefOpts(allowRetract,allowMM){
  const o=[];
  if(allowRetract)o.push(['retrait','Hauteur de retrait']);
  for(let i=0;i<FAO_PLANE_REFS.length;i++){
    const r=FAO_PLANE_REFS[i][0];
    if(!allowMM&&(r==='max'||r==='min'))continue;
    o.push([FAO_PLANE_REFS[i][0],FAO_PLANE_REFS[i][1]]);
  }
  return o;
}
function faoPlaneSet(owner,which,pl){
  // Écrit SEULEMENT le plan touché (l'autre reste hérité du posage). Écriture
  // pure : le widget appelant (faoSel/faoNum/faoMini) prend déjà le snapshot
  // d'annulation et appelle faoChanged(). Sur le posage, l'ancien champ
  // absolu (safeZ/retract) devient redondant : supprimé (une seule source).
  owner.planes=owner.planes||{};
  owner.planes[which]=pl;
  if(owner.ops!==undefined&&owner.stock!==undefined){
    if(which==='clear')delete owner.safeZ;
    if(which==='retr')delete owner.retract;
  }
}
function faoPlaneRow(which,label,pl,job,op,tgt){
  // tgt={setupId,opId} pour le picking « face ». Conteneur = ligne principale
  // (+ 2 lignes de sous-références pour max/min) + valeur résolue à droite.
  const owner=op||job;
  const isMM=(pl.ref==='max'||pl.ref==='min');
  const set=function(np){ faoPlaneSet(owner,which,np); };
  const z=faoPlaneZ(pl,op,job,0);
  const tip='Référence « '+label+' » : valeur = Z de la référence + décalage '+
    '(mm), toujours ramenée au-dessus du dessus du brut.';
  const box=document.createElement('div');
  const row=faoRow();
  row.appendChild(faoLab(label));
  row.appendChild(faoSel(faoPlaneRefOpts(which==='clear',true),pl.ref,function(v){
    if(v===pl.ref)return;
    if(v==='max'||v==='min'){
      const s1=(pl.ref==='max'||pl.ref==='min')?pl.s1:
        {ref:pl.ref,dz:isFinite(+pl.dz)?+pl.dz:0,fz:pl.fz};
      const s2=(pl.ref==='max'||pl.ref==='min')?pl.s2:{ref:'brutHaut',dz:0};
      set({ref:v,s1:s1,s2:s2});
    }else{
      const s=(pl.ref==='max'||pl.ref==='min')?(pl.s1||{ref:'brutHaut',dz:0}):pl;
      const np={ref:v,dz:isFinite(+s.dz)?+s.dz:0};
      if(v==='face')np.fz=isFinite(+s.fz)?+s.fz:
        (isFinite(z)?Math.round((z-np.dz)*100)/100:0);
      set(np);
    }
  },tip));
  if(!isMM){
    row.appendChild(faoNum(isFinite(+pl.dz)?+pl.dz:0,function(v){
      set(Object.assign({},pl,{dz:v}));
    },48,0.5,'Décalage « '+label+' » (mm, ±) ajouté à la référence.'));
    if(pl.ref==='face')row.appendChild(faoMini('Sélect.',function(){
      faoZPlaneStart({setupId:tgt.setupId,opId:tgt.opId,which:which,slot:null});
    },'Cliquer la face de référence dans la vue 3D (Échap annule).'));
  }
  row.appendChild(faoLab('= '+(isFinite(z)?z.toFixed(2):'—')));
  box.appendChild(row);
  if(isMM){
    [[1,pl.s1||{ref:'brutHaut',dz:0}],[2,pl.s2||{ref:'brutHaut',dz:0}]].forEach(function(pr){
      const slot=pr[0], s=pr[1];
      const r2=faoRow();
      r2.appendChild(faoLab('· '+(slot===1?'1re':'2e')));
      r2.appendChild(faoSel(faoPlaneRefOpts(false,false),s.ref,function(v){
        if(v===s.ref)return;
        const ns={ref:v,dz:isFinite(+s.dz)?+s.dz:0};
        if(v==='face')ns.fz=isFinite(+s.fz)?+s.fz:0;
        const np=Object.assign({},pl);
        np[slot===1?'s1':'s2']=ns;
        set(np);
      },'Sous-référence '+(slot===1?'1re':'2e')+' « '+label+' » (base du plus/bas des deux).'));
      r2.appendChild(faoNum(isFinite(+s.dz)?+s.dz:0,function(v){
        const np=Object.assign({},pl);
        np[slot===1?'s1':'s2']=Object.assign({},s,{dz:v});
        set(np);
      },48,0.5,'Décalage de la sous-référence.'));
      if(s.ref==='face')r2.appendChild(faoMini('Sélect.',function(){
        faoZPlaneStart({setupId:tgt.setupId,opId:tgt.opId,which:which,slot:slot});
      },'Cliquer la face de référence (Échap annule).'));
      box.appendChild(r2);
    });
  }
  return box;
}
function faoPlanesCard(setup,op){
  // Section « Plans » de la fiche opération : héritage posage > op > legacy.
  const box=document.createElement('div');
  box.appendChild(faoH('Plans'));
  const eff=faoPlaneEff(setup,op);
  const tgt={setupId:setup.id,opId:op.id};
  box.appendChild(faoPlaneRow('clear','Dégagement',eff.clear,setup,op,tgt));
  box.appendChild(faoPlaneRow('retr','Retrait',eff.retr,setup,op,tgt));
  if(eff.ownClear||eff.ownRetr){
    const rh=faoRow();
    rh.appendChild(faoMini('Hériter du posage',function(){
      if(!op.planes)return;
      delete op.planes.clear; delete op.planes.retr;
      if(!op.planes.clear&&!op.planes.retr)delete op.planes;
    },'Revenir aux plans du posage pour cette opération.'));
    box.appendChild(rh);
  }
  box.appendChild(faoHelp(
    'Dégagement = plan des translations rapides XY ; Retrait = plan des remontées '+
    '(mode « Remontées » du posage). Hérités du posage tant que non modifiés — '+
    'tout plan reste au-dessus du dessus du brut.'));
  return box;
}
function faoOpCardElement(setup,op,i){
  const d=faoCard();
  if(op.on===false)d.style.opacity='0.55';
  const typeName={facing:'Surfaçage',pocket:'Poche',contour:'Contour',drill:'Perçage',
    rough3d:'Ébauche 3D',geofinish:'Finition géod.'};
  const r=faoRow();
  const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=op.on!==false;
  cb.title='Décocher = ignorer cette opération (aperçu, temps, G-code)';
  cb.onchange=function(){ faoSnapshot('activer/désactiver « '+(typeName[op.type]||op.type)+' »');
    op.on=cb.checked; faoChanged(); };
  r.appendChild(cb);
  const tt=document.createElement('span');
  tt.className='fao-opnum';
  tt.textContent=(i+1)+'. '+(typeName[op.type]||op.type);
  r.appendChild(tt);
  r.appendChild(faoSel(faoToolOpts(setup),op.toolId,function(v){ op.toolId=v; },
    'Outil de cette opération (vitesse et avance calculées depuis sa fiche)'));
  if(op.stale===true){
    const w=document.createElement('span');
    w.textContent=String.fromCharCode(0x26a0);
    w.style.cssText='color:#ff453a;font-weight:700;cursor:pointer;';
    const why=faoStaleWhy(op,setup);
    w.title='Parcours à régénérer : CETTE opération a changé. Clic = ne régénérer'
      +' que cette opération (le bouton « Tout régénérer » régénère tout).'
      +(why?(' '+why):'');
    w.onclick=function(){ faoRegenOp(setup.id,op.id); };
    r.appendChild(w);
  }
  r.appendChild(faoMini('↑',function(){ if(i>0){ setup.ops.splice(i,1); setup.ops.splice(i-1,0,op); } },
    'Remonter cette opération (usinée plus tôt)'));
  r.appendChild(faoMini('↓',function(){ if(i<setup.ops.length-1){ setup.ops.splice(i,1); setup.ops.splice(i+1,0,op); } },
    'Descendre cette opération (usinée plus tard)'));
  r.appendChild(faoMini('✕',function(){ setup.ops.splice(i,1); },'Supprimer cette opération'));
  d.appendChild(r);
  const rp=faoRow();
  let geoNote=null;
  const rect4=function(){
    rp.appendChild(faoLab('X')); rp.appendChild(faoNum(op.x0,function(v){op.x0=v;},56));
    rp.appendChild(faoLab('Y')); rp.appendChild(faoNum(op.y0,function(v){op.y0=v;},56));
    rp.appendChild(faoLab('→')); rp.appendChild(faoNum(op.x1,function(v){op.x1=v;},56));
    rp.appendChild(faoNum(op.y1,function(v){op.y1=v;},56));
  };
  const zz=function(){
    rp.appendChild(faoLab('Zhaut')); rp.appendChild(faoNum(op.ztop,function(v){op.ztop=v;},56));
    rp.appendChild(faoLab('Zbas')); rp.appendChild(faoNum(op.zbot,function(v){op.zbot=v;},56));
  };
  if(op.type==='facing'){
    rp.appendChild(faoLab('Z')); rp.appendChild(faoNum(op.z,function(v){op.z=v;},60));
    // SEUL paramètre de recouvrement XY : l'écart (ae). Le nombre de lignes est
    // affiché en lecture seule à droite. Un ancien document piloté par « Passes »
    // (np≥2) est lu tel quel (écart affiché = H/(np−1)) ; saisir l'écart bascule
    // définitivement en pilotage par écart (op.np=null).
    const stF=faoStock();
    const tF=faoToolById(setup,op.toolId);
    const dF=(tF&&isFinite(+tF.d)&&+tF.d>0)?+tF.d:10;
    const npOn=isFinite(+op.np)&&+op.np>=2;
    const aeShow=npOn?(faoFacingAe(stF,dF,+op.np)||op.ae):op.ae;
    const nbShow=npOn?Math.round(+op.np):faoFacingCount(stF,dF,op.ae);
    rp.appendChild(faoLab('écart'));
    rp.appendChild(faoNum(isFinite(+aeShow)?Math.round(+aeShow*1000)/1000:aeShow,function(v){
      op.ae=Math.max(0.5,v);
      op.np=null; // ancien doc « Passes » → bascule en pilotage par écart
    },48,0.5,'Recouvrement du fraiseur : distance entre deux passes — SEUL paramètre de recouvrement XY (le nombre de lignes résultant est affiché en lecture seule à droite). Sur un ancien document piloté par « Passes », saisir l\'écart bascule définitivement en pilotage par écart.'));
    rp.appendChild(faoLab(nbShow+' ligne'+(nbShow>1?'s':'')));
    // Passes en Z (par brut) : ébauche du dessus du brut (Z1) à la cote Z en N
    // passes égales — l'ap est CALCULÉ (Z1−Z)/N et affiché en lecture seule.
    const npzShow=(isFinite(+op.npz)&&+op.npz>=2)?Math.round(+op.npz):1;
    const apZShow=faoFacingAp(stF,(isFinite(+op.z)?+op.z:stF.z1)+faoRA(op).axial,npzShow);
    rp.appendChild(faoLab('pz'));
    rp.appendChild(faoNum(npzShow,function(v){
      const n=Math.round(v);
      op.npz=(n>=2)?n:null; // 1 passe = mode historique (coupe unique à la cote Z)
    },40,1,'Passes en Z du surfaçage : l\'ébauche descend du dessus du brut (Z1) jusqu\'à la cote Z en N passes égales, le pas ap = (Z1−Z)/N est calculé automatiquement. 1 = passe unique (mode historique).'));
    rp.appendChild(faoLab(apZShow!=null?('ap '+apZShow):'ap —'));
    rp.appendChild(faoLab('laisse Z')); rp.appendChild(faoNum(faoRA(op).axial,function(v){op.axial=Math.max(0,v);},48,0.1));
    rp.appendChild(faoLab('Arrondi')); rp.appendChild(faoNum(isFinite(+op.arrondi)?+op.arrondi:0,function(v){op.arrondi=Math.max(0,v);},48,0.5));
    // Rappel du réglage de POSAGE « Sortie » (même champ que la fiche du posage) :
    // on le voit et le règle là où l'on paramètre la passe — dépassement XY du
    // demi-tour + retrait Z (voir infobulle).
    rp.appendChild(faoLab('Sortie'));
    rp.appendChild(faoNum(isFinite(+setup.secu)?+setup.secu:5,function(v){ setup.secu=Math.max(0,v); },44,0.5,
      'Sortie de pièce (mm hors matière — réglage du POSAGE, commun à toutes les opérations) : (1) dépassement XY en bout de ligne — l’outil sort de la pièce avant son demi-tour, (2) plafond des remontées locales du mode « Remontées : plan retrait ou +5 mm ». Généralement 5 à 10.'));
  }else if(op.type==='pocket'||op.type==='contour'){
    rect4(); zz();
    rp.appendChild(faoLab('ap')); rp.appendChild(faoNum(op.ap,function(v){op.ap=Math.max(0.5,v);},48));
    if(op.type==='pocket'){ rp.appendChild(faoLab('pas')); rp.appendChild(faoNum(op.ae,function(v){op.ae=Math.max(0.5,v);},48)); }
    rp.appendChild(faoLab('R')); rp.appendChild(faoNum(faoRA(op).radial,function(v){op.radial=Math.max(0,v);},44,0.1));
    rp.appendChild(faoLab('A')); rp.appendChild(faoNum(faoRA(op).axial,function(v){op.axial=Math.max(0,v);},44,0.1));
    rp.appendChild(faoLab('Arrondi')); rp.appendChild(faoNum(isFinite(+op.arrondi)?+op.arrondi:0,function(v){op.arrondi=Math.max(0,v);},48,0.5));
    faoEntryRows(rp,op,(function(){const t=faoToolById(setup,op.toolId);
      return t&&+t.d>0?+t.d:10;})());
  }else if(op.type==='rough3d'){
    // --- fiche Ébauche 3D : sections titrées pour les néophytes.
    // Chaque champ porte son nom complet + infobulle ; le mode unique et
    // l'entrée sont expliqués en une ligne, avec garde-fous chiffrés.
    const toolD=(function(){ const t=faoToolById(setup,op.toolId);
      return (isFinite(+t.d)&&+t.d>0)?+t.d:10; })();
    const aeNow=isFinite(+op.ae)&&+op.ae>0?+op.ae:toolD*0.6;
    const apNow=isFinite(+op.ap)&&+op.ap>0?+op.ap:5;
    d.appendChild(faoH('Hauteurs à usiner (mm)'));
    const rZ=faoRow();
    rZ.appendChild(faoLab('Haut')); rZ.appendChild(faoNum(op.ztop,function(v){faoZlimBreak(op);op.ztop=v;},56,
      null,'Niveau le plus haut usiné — en général le dessus du brut. Édité à la main : casse le lien avec les arêtes.'));
    rZ.appendChild(faoLab('Bas')); rZ.appendChild(faoNum(op.zbot,function(v){faoZlimBreak(op);op.zbot=v;},56,
      null,'Niveau le plus bas — fond de la zone à ébaucher (hors surépaisseur). Édité à la main : casse le lien avec les arêtes.'));
    if(op.zlim){
      const bz=document.createElement('span'); bz.className='fao-meta';
      bz.textContent='lié à '+(op.zlim.nEdges||'?')+' arête(s)'+(op.zlim.stale?' ⚠':'');
      bz.title='Haut/Bas suivent ces arêtes à chaque rejeu du modèle.';
      rZ.appendChild(bz);
      const br=document.createElement('button'); br.textContent='Retirer'; br.style.fontSize='.72rem';
      br.title='Retirer le lien avec les arêtes (valeurs conservées, redeviennent éditables).';
      br.onclick=function(){ faoZlimBreak(op); faoChanged();
        try{ if(typeof renderProps==='function')renderProps(); }catch(e){} };
      rZ.appendChild(br);
    }else{
      const bl=document.createElement('button'); bl.textContent='Limiter Z (arêtes)'; bl.style.fontSize='.72rem';
      bl.title='Sélectionner des arêtes du modèle pour fixer le haut et le bas de la zone à ébaucher.';
      bl.onclick=function(){ faoZlimStart(setup.id,op.id); };
      rZ.appendChild(bl);
    }
    d.appendChild(rZ);
    if(op.zlim&&op.zlim.stale){
      const wz=document.createElement('div'); wz.className='fao-note';
      wz.textContent='⚠ Modèle modifié : arêtes de limite Z non retrouvées — valeurs inchangées. Re-sélectionnez les arêtes.';
      d.appendChild(wz);
    }
    d.appendChild(faoH('Vidage'));
    const rM=faoRow();
    rM.appendChild(faoLab('Mode'));
    const modeSel=faoSel([
      ['escargot','Escargot · du centre vers les faces','Pelage en spirale depuis le pôle de la zone à usiner : chaque tour s’éloigne de ae, entrée en hélice obligatoire, les faces sont finies en dernier (2026-10-07-005, mode par défaut à la création).'],
      ['conv','Conventionnel','Pelage à ap constant (champ ap) : du milieu de la zone vers les bords, entrées hélice/rampe, trochoïdes automatiques dans les goulets.']],
      op.mode||'conv',function(v){
        if(v==='escargot')op.mode='escargot'; else delete op.mode;
      },'Mode de vidage — escargot par défaut à la création, absent = conventionnel (mode trocoïdal supprimé en 2026-10-08-001). Clic droit : infos sur ce mode.');
    // 2026-10-08-003 : les aides « trop en place » partent en menu contextuel
    // (clic droit sur ce select) — la fiche garde la place pour les vrais
    // réglages. Contenu = texte du mode ACTUELLEMENT choisi.
    const modeTexts={
      escargot:'Escargot : pelage en spirale depuis le centre de la zone à usiner (pôle d’inaccessibilité, pas le '+
        'centre de la boîte — la 1re coupe n’attaque plus un bord de face) vers les faces, tours espacés de ae, '+
        'toutes les entrées en matière sont des hélices (jamais de plongée directe). '+
        'Dernière passe de chaque niveau : contour des faces du solide au ras (laisse outil). '+
        'Mini-passes, plafond/fond et finition inchangés — ae pilote la distance entre deux tours.',
      conv:'Pelage à ap constant avec entrées hélice/rampe et trochoïdes automatiques dans les goulets : '+
        'on enlève le MILIEU de la zone avant les bords (les bords et la marge finient la passe), '+
        'gardez ae petit (≤ ¼ du Ø outil) et ap profond (≈ 1×Ø). L’outil ne s’enterre jamais.'
    };
    modeSel.addEventListener('contextmenu',function(e){
      try{ e.preventDefault(); }catch(err){}
      faoModeInfoShow((e&&isFinite(+e.clientX))?+e.clientX+8:60,
                      (e&&isFinite(+e.clientY))?+e.clientY+8:60,
                      modeTexts[op.mode==='escargot'?'escargot':'conv']);
    });
    const modePrevOnchange=modeSel.onchange;
    modeSel.onchange=function(){ faoModeInfoClose(); modePrevOnchange(); };
    rM.appendChild(modeSel);
    d.appendChild(rM);
    // 2026-10-08-003 : SENS DE PASSE — 'avalant' = sens de coupe constant
    // (aucune chaine retournée : les dents attaquent la matière de la même
    // façon sur tous les morceaux — sens de rotation de la fraise) ; défaut à
    // la création. 'bidir' = ancien comportement (retournement vers
    // l'extrémité la plus proche, triangles courts en fin de passe).
    // Document ancien sans champ = effectivement bidirectionnel → on affiche
    // 'bidir' (la valeur réelle) plutôt que le défaut d'usine.
    const rS=faoRow();
    rS.appendChild(faoLab('Sens'));
    rS.appendChild(faoSel([
      ['avalant','Sens unique · avalant','Toutes les passes coupent vers le même côté (dents attaquant la matière du même sens, comme la rotation de la fraise) : enchaînement au plus proche SANS retournement, retour rapide à vide en fin de passe. Défaut à la création (2026-10-08-003).'],
      ['bidir','Bidirectionnel','Chaque passe retourne vers l’extrémité la plus proche de la précédente (moins de trajet à vide, mais le sens de coupe alterne — lecture des documents antérieurs, comportement historique).']],
      (op.sens==='avalant')?'avalant':'bidir',
      function(v){ if(v==='avalant')op.sens='avalant'; else op.sens='bidir'; },
      'Sens de passe de l’ébauche 3D — avalant (sens de coupe constant) ou bidirectionnel (retournement vers l’extrémité la plus proche).'));
    d.appendChild(rS);
    d.appendChild(faoH('Passes (mm)'));
    const rP=faoRow();
    rP.appendChild(faoLab('ap')); rP.appendChild(faoNum(op.ap,function(v){op.ap=Math.max(0.5,v);},48,0.5,
      'Descente : hauteur usinée par niveau (Maximum Stepdown).'));
    rP.appendChild(faoLab('ae')); rP.appendChild(faoNum(op.ae,function(v){op.ae=Math.max(0.5,v);},48,
      'Pas latéral : distance entre deux passes voisines (Stepover).'));
    rP.appendChild(faoLab('mini')); rP.appendChild(faoNum(op.minipasses||0,function(v){op.minipasses=Math.max(0,Math.min(50,Math.round(v)));},40,1,
      'Mini-passes Z par niveau : contour des parois entre deux plans (0 = off, 1 à 50). Profondeur k·ap/(nb+1) sous le plan du dessus, décalage radial décroissant.'));
    d.appendChild(rP);
    d.appendChild(faoHelp(
      'ae = '+(aeNow/toolD).toFixed(2)+'×Ø, ap = '+(apNow/toolD).toFixed(2)+'×Ø (outil Ø '+toolD+').'));
    d.appendChild(faoH('Matière à laisser (mm)'));
    const rR=faoRow();
    rR.appendChild(faoLab('Parois')); rR.appendChild(faoNum(faoRA(op).radial,function(v){op.radial=Math.max(0,v);},44,0.1,
      'Surépaisseur sur les côtés : l’ébauche s’arrête à cette distance des parois (la finition l’enlèvera).'));
    rR.appendChild(faoLab('Fond')); rR.appendChild(faoNum(faoRA(op).axial,function(v){op.axial=Math.max(0,v);},44,0.1,
      'Surépaisseur sur le fond : l’ébauche s’arrête à cette hauteur au-dessus du fond.'));
    d.appendChild(rR);
    // 2026-10-07-001 : FINITION DES PAROIS — N contours « Parois » → 0 par
    // niveau. Case OFF par défaut : aucun document existant ne bouge ; tant que
    // la case est cochée, le sig de l'op change → parcours périmé → rejeu.
    const rFi=faoRow();
    const cbFi=document.createElement('input'); cbFi.type='checkbox'; cbFi.checked=!!op.finitParois;
    cbFi.title='Finir les parois : sur la dernière passe en profondeur, N contours enlèvent la matière laissée « Parois » jusqu’à 0 (dernier à la cote théorique). Décochée = ébauche seule.';
    cbFi.onchange=function(){ faoSnapshot('finir les parois');
      if(cbFi.checked){ op.finitParois=true; if(!isFinite(+op.finitN))op.finitN=1;
        if(!isFinite(+op.finitProf))op.finitProf=1; }
      else{ delete op.finitParois; delete op.finitN; delete op.finitProf; }
      faoChanged(); };
    rFi.appendChild(cbFi);
    rFi.appendChild(faoLab('Finir parois'));
    const numFi=faoNum(isFinite(+op.finitN)?Math.round(+op.finitN):1,function(v){
      op.finitN=Math.max(1,Math.min(9,Math.round(v)));},36,1,
      'Passes de finition des parois : de « Parois » à 0, réparties régulièrement (1 = directement à 0).');
    numFi.disabled=!op.finitParois;
    numFi.title='Nombre de contours de finition — cochez « Finir parois » pour le régler.';
    rFi.appendChild(numFi);
    rFi.appendChild(faoLab('passes'));
    d.appendChild(rFi);
    // 2026-10-07-002 : PROFONDEURS DE FINITION — la « dernière passe » ne
    // racle la colonne que sur la hauteur de DENT ; mur > dent = N cotes
    // (haut-bas)/N vers le haut. 1 par defaut = comportement unique (documents
    // existants inchangés). Grise tant que Finir parois est décochée.
    const rZp=faoRow();
    rZp.appendChild(faoLab('Profondeurs'));
    const numZp=faoNum(isFinite(+op.finitProf)?Math.round(+op.finitProf):1,function(v){
      op.finitProf=Math.max(1,Math.min(9,Math.round(v)));},36,1,
      'Profondeurs de finition : 1 = dernière passe seule (fraise à dent haute), N = la séquence se répète vers le haut, écartés de hauteur du mur / N (dent ≥ écart).');
    numZp.disabled=!op.finitParois;
    rZp.appendChild(numZp);
    rZp.appendChild(faoLab('cotes'));
    d.appendChild(rZp);
    const npz=isFinite(+op.finitProf)?Math.max(1,Math.min(9,Math.round(+op.finitProf))):1;
    if(op.finitParois)d.appendChild(faoHelp(
      'Finition : '+Math.round(op.finitN)+' contour(s) × '+npz+' profondeur(s) sur la DERNIÈRE passe en profondeur '+
      '(écart = hauteur du mur / '+npz+' — dent ≥ écart ; 1 = la dent couvre le mur seule) — '+
      Math.round(op.finitN)+'×'+npz+'× plus de calcul de région sur ces cotes seulement.'));
    d.appendChild(faoH('Trajectoire'));
    const rT2=faoRow();
    rT2.appendChild(faoLab('Arrondi')); rT2.appendChild(faoNum(isFinite(+op.arrondi)?+op.arrondi:0,function(v){op.arrondi=Math.max(0,v);},48,0.5,
      'Rayon d’arrondi des angles vifs (sort en G2/G3, trajectoire fluide). 0 = angles vifs.'));
    faoEntryRows(rT2,op,toolD);
    d.appendChild(rT2);
  }else if(op.type==='geofinish'){
    rp.appendChild(faoLab('pas 3D')); rp.appendChild(faoNum(op.step,function(v){op.step=Math.max(0.2,v);},52,0.5));
    rp.appendChild(faoLab('laisse')); rp.appendChild(faoNum(op.laisse,function(v){op.laisse=Math.max(0,v);},48,0.1));
    rp.appendChild(faoLab('départ'));
    rp.appendChild(faoSel([['top','Sommet'],['bottom','Fond']],op.seed||'top',function(v){op.seed=v;}));
    // 2026-10-04-009 : entrée identique à l'ébauche 3D — hélice réservée si un
    // ébauche 3D est active avant (sinon rampe). 2026-10-08-004 : circ par
    // défaut (même règle : sans ébauche avant, faoGeoEntryMode retombe rampe).
    faoEntryRows(rp,op,(function(){const t=faoToolById(setup,op.toolId);
      return t&&+t.d>0?+t.d:8;})());
    // 2026-10-04-004 : limites Z (au-delà, relief non fini) + garde-fou fraise droite.
    zz();
    const tG=faoToolById(setup,op.toolId);
    if(tG&&tG.kind==='flat'){
      geoNote=document.createElement('div'); geoNote.className='fao-note';
      geoNote.textContent=op.geoBlocked
        ? '⚠ Fraise droite refusée : le modèle n\'est pas horizontal (pente > 8°). Utilisez une boule ou une torique.'
        : 'Fraise droite : finition réservée aux faces horizontales — le reste du modèle n\'est pas usiné.';
    }
  }else if(op.type==='drill'){
    zz();
    const pts=(op.pts||[]).map(function(q){return (+q[0])+','+(+q[1]);}).join('; ');
    rp.appendChild(faoLab('XY'));
    rp.appendChild(faoTxt(pts,function(v){
      const lst=String(v).split(';').map(function(s){
        const q=s.split(',').map(function(x){return parseFloat(x);});
        return (q.length>=2&&isFinite(q[0])&&isFinite(q[1]))?[q[0],q[1]]:null;
      }).filter(function(q){return q;});
      if(lst.length)op.pts=lst;
    },150));
    rp.appendChild(faoLab('Q pas'));
    rp.appendChild(faoNum((+op.peck)||0,function(v){op.peck=Math.max(0,v);},52,0.5,
      'Profondeur de chaque plongée (mm). 0 = perçage simple (CYCLE81 / G81), sinon broche à va-et-vient (CYCLE83 / G83).'));
  }
  if(rp.children.length)d.appendChild(rp); // vide pour l'Ébauche 3D (sections propres)
  if(geoNote)d.appendChild(geoNote);
  // 2026-10-08-002 : plans de l'opération (dégagement / retrait), hérités du
  // posage tant que non modifiés — avant la zone (les plans cadrent tout).
  d.appendChild(faoPlanesCard(setup,op));
  // Limite d'usinage (tout, rectangle, ou chaîne d'arêtes).
  const rl=faoRow();
  const limMode=op.limit?(op.limit.mode||'all'):'all';
  rl.appendChild(faoLab('Zone'));
  rl.appendChild(faoSel([['all','Tout usiner'],['rect','Rectangle'],['chain','Chaîne d\'arêtes']],limMode,function(v){
    if(v==='rect'){
      const s=faoStock();
      op.limit={mode:'rect',x0:s.x0,y0:s.y0,x1:s.x1,y1:s.y1,side:'center',extra:0};
    }else if(v==='chain'){
      const old=op.limit&&op.limit.mode==='chain'?op.limit:null;
      op.limit=old||{mode:'chain',loop:[],closed:false,nEdges:0,tangent:true,side:'center',extra:0};
      faoChainStart(setup.id,op.id);
    }else delete op.limit;
  },'Zone usinée : tout le brut, un rectangle, ou l’intérieur d’une chaîne d’arêtes.'));
  if(limMode==='rect'&&op.limit){
    const L=op.limit;
    rl.appendChild(faoNum(L.x0,function(v){L.x0=v;},52,null,'Rectangle : coin X mini (mm)'));
    rl.appendChild(faoNum(L.y0,function(v){L.y0=v;},52,null,'Rectangle : coin Y mini (mm)'));
    rl.appendChild(faoNum(L.x1,function(v){L.x1=v;},52,null,'Rectangle : coin X maxi (mm)'));
    rl.appendChild(faoNum(L.y1,function(v){L.y1=v;},52,null,'Rectangle : coin Y maxi (mm)'));
  }
  d.appendChild(rl);
  if(limMode==='chain'&&op.limit){
    const rc=faoRow();
    const hasLoop=(op.limit.loop||[]).length>=3;
    const info=document.createElement('span');
    info.className='fao-meta';
    info.textContent=hasLoop
      ?(op.limit.nEdges||'?')+' arêtes, boucle '+(op.limit.closed?'fermée':'refermée')
        +(op.limit.tangent?' (tangentes)':'')+' · '+op.limit.loop.length+' pts'
      :'aucune boucle — sélectionnez des arêtes';
    rc.appendChild(info);
    const bs=document.createElement('button'); bs.textContent=hasLoop?'Re-sélectionner':'Sélectionner';
    bs.style.fontSize='.72rem';
    bs.onclick=function(){ faoChainStart(setup.id,op.id); };
    rc.appendChild(bs);
    d.appendChild(rc);
    if(op.limit.stale){
      const ws=document.createElement('div');
      ws.className='fao-alert';
      ws.textContent='⚠ Modèle modifié : arêtes non retrouvées — boucle inchangée (obsolète), re-sélectionnez la chaîne.';
      d.appendChild(ws);
    }
  }
  if((limMode==='rect'||limMode==='chain')&&op.limit){
    const rs=faoRow();
    rs.appendChild(faoLab('Outil'));
    rs.appendChild(faoSel([
      ['center','Centre dedans','Le centre de l’outil reste dans la zone.'],
      ['in','Outil dedans','L’outil entier reste dans la zone (retrait d’un rayon).'],
      ['out','Tout couvrir','La zone est entièrement balayée, l’outil déborde d’un rayon.']],
      op.limit.side||'center',function(v){op.limit.side=v;},
      'Position de l’outil par rapport au bord de la zone.'));
    rs.appendChild(faoLab('Marge'));
    rs.appendChild(faoNum(op.limit.extra||0,function(v){op.limit.extra=v;},44,0.5,
      'Élargit (+) ou rétrécit (−) la zone en mm.'));
    d.appendChild(rs);
  }
  // 2026-10-08-003 : ZONE INTÉRIEURE (îlot à préserver) — on usine ENTRE la
  // zone extérieure et cet îlot. Règle outil fixée « hors de l'îlot » (side
  // 'out' interne) : la Marge ajoute de la distance entre l'outil et l'îlot.
  const rl2=faoRow();
  const lim2Mode=op.limit2?(op.limit2.mode||'rect'):'none';
  rl2.appendChild(faoLab('Zone int.'));
  rl2.appendChild(faoSel([
    ['none','Aucune','Pas de zone intérieure : toute la matière de la zone extérieure est usinée.'],
    ['rect','Rectangle (îlot)','Rectangle à NE PAS usiner — l\'outil reste à un rayon + marge du contour.'],
    ['chain','Chaîne d\'arêtes','Îlot délimité par des arêtes du modèle — même règle outil, re-suivi à chaque rejeu.']],
    lim2Mode,function(v){
      if(v==='rect'){
        const s=faoStock();
        const cx=((+s.x0)+(+s.x1))/2, cy=((+s.y0)+(+s.y1))/2;
        const w=Math.max(2,Math.min((+s.x1)-(+s.x0),(+s.y1)-(+s.y0))*0.15);
        op.limit2={mode:'rect',x0:Math.round((cx-w)*100)/100,y0:Math.round((cy-w)*100)/100,
          x1:Math.round((cx+w)*100)/100,y1:Math.round((cy+w)*100)/100,extra:0};
      }else if(v==='chain'){
        const old=op.limit2&&op.limit2.mode==='chain'?op.limit2:null;
        op.limit2=old||{mode:'chain',loop:[],closed:false,nEdges:0,tangent:true,side:'out',extra:0};
        faoChainStart(setup.id,op.id,'chain2');
      }else delete op.limit2;
    },
    'Zone intérieure (îlot) : matière à NE PAS toucher — l\'ébauche usine entre les deux zones.'));
  if(lim2Mode==='rect'&&op.limit2){
    const L2=op.limit2;
    rl2.appendChild(faoNum(L2.x0,function(v){L2.x0=v;},52,null,'Îlot : coin X mini (mm)'));
    rl2.appendChild(faoNum(L2.y0,function(v){L2.y0=v;},52,null,'Îlot : coin Y mini (mm)'));
    rl2.appendChild(faoNum(L2.x1,function(v){L2.x1=v;},52,null,'Îlot : coin X maxi (mm)'));
    rl2.appendChild(faoNum(L2.y1,function(v){L2.y1=v;},52,null,'Îlot : coin Y maxi (mm)'));
  }
  d.appendChild(rl2);
  if(lim2Mode==='chain'&&op.limit2){
    const rc2=document.createElement('div');
    rc2.className='fao-row';
    const hasLoop2=(op.limit2.loop||[]).length>=3;
    const info2=document.createElement('span');
    info2.className='fao-meta';
    info2.textContent=hasLoop2
      ?('îlot : '+(op.limit2.nEdges||'?')+' arêtes, boucle '+(op.limit2.closed?'fermée':'refermée')
        +' · '+op.limit2.loop.length+' pts')
      :'aucune boucle — sélectionnez les arêtes de l\'îlot';
    rc2.appendChild(info2);
    const bs2=document.createElement('button'); bs2.textContent=hasLoop2?'Re-sélectionner':'Sélectionner';
    bs2.style.fontSize='.72rem';
    bs2.onclick=function(){ faoChainStart(setup.id,op.id,'chain2'); };
    rc2.appendChild(bs2);
    d.appendChild(rc2);
    if(op.limit2.stale){
      const ws2=document.createElement('div');
      ws2.className='fao-alert';
      ws2.textContent='⚠ Modèle modifié : arêtes de l\'îlot non retrouvées — boucle inchangée (obsolète), re-sélectionnez.';
      d.appendChild(ws2);
    }
  }
  if(op.limit2&&lim2Mode!=='none'){
    const rs2=faoRow();
    rs2.appendChild(faoLab('Marge'));
    rs2.appendChild(faoNum(op.limit2.extra||0,function(v){op.limit2.extra=v;},44,0.5,
      'Distance supplémentaire (+) entre l\'outil et l\'îlot, en mm.'));
    d.appendChild(rs2);
  }
  const sf=faoToolSF(faoToolById(setup,op.toolId),setup);
  const rr=faoRow();
  const rs=document.createElement('span');
  rs.className='fao-meta';
  // Ouvrir une operation ne doit PAS la recalculer : le cache est lu (IDB ou
  // memoire). Lecture en cours -> « … » qui se remplit tout seul ; cache lu mais
  // parcours absent -> on le DIT, on ne lance pas ~90 s derriere un clic de fiche.
  const mv=faoMovesStat(op,setup);
  if(!mv){
    if(faoMovesPending()){
      rs.textContent='S'+sf.s+' F'+sf.f+' · chargement du parcours…';
      faoMovesPreloadSoon();
    }else{
      rs.textContent='S'+sf.s+' F'+sf.f+' · pas de parcours en mémoire — « Tout régénérer »';
    }
  }else{
    const ee=faoEstimate(mv,sf.f,faoRapide(setup),faoAccel(setup));
    rs.textContent='S'+sf.s+' F'+sf.f+' · '+mv.length+' pts · ≈'+ee.tmin.toFixed(1)+' min';
  }
  rr.appendChild(rs);
  d.appendChild(rr);
  return d;
}
/* ----- fiche du posage ----- */
function faoSetupFiche(p,setup){
  const stock=faoStock();
  p.appendChild(faoH('Posage · '+setup.name));
  const rN=faoRow();
  rN.appendChild(faoLab('Nom'));
  rN.appendChild(faoTxt(setup.name,function(v){ setup.name=faoProgName(v)||setup.name; },120));
  if(faoRoot().setups.length>1)
    rN.appendChild(faoMini('Supprimer',function(){
      const r=faoRoot();
      r.setups=r.setups.filter(function(s){return s.id!==setup.id;});
      r.activeSetupId=(r.setups[0]||{}).id||null;
      try{ sel={kind:null,id:null}; }catch(e){}
    }));
  p.appendChild(rN);
  const rM=faoRow();
  rM.appendChild(faoLab('Machine'));
  rM.appendChild(faoSel(Object.keys(FAO_POSTS).map(function(k){return [k,FAO_POSTS[k].label];}),
    setup.machine||'siemens630',function(v){ setup.machine=v; }));
  rM.appendChild(faoLab('Origine '+(setup.wcs||'G54')));
  rM.appendChild(faoSel([['G54','G54'],['G55','G55'],['G56','G56'],['G57','G57'],['G58','G58'],['G59','G59']],
    setup.wcs||'G54',function(v){ setup.wcs=v; }));
  p.appendChild(rM);
  const rO=faoRow();
  rO.appendChild(faoLab('Point de bloc'));
  rO.appendChild(faoSel([['top-X0Y0','Dessus coin X0Y0'],['top-X1Y1','Dessus coin X1Y1'],
    ['top-C','Dessus centre'],['bot-X0Y0','Dessous coin X0Y0']],
    (setup.origin&&setup.origin.preset)||'top-X0Y0',function(v){ setup.origin={preset:v}; }));
  p.appendChild(rO);
  // Indexation 3+2 (table C + B) — {0,0} = usinage 3 axes strictement inchangé.
  const r32=faoRow();
  const O=faoOrient(setup);
  r32.appendChild(faoLab('3+2 B'));
  r32.appendChild(faoNum(O.b,function(v){ setup.orient={b:Math.round(v*1000)/1000,c:faoOrient(setup).c}; },
    44,5,"Bascule de table autour de Y (degrés). 0 = usinage 3 axes. Non nul : Siemens = TRAORI(1) + positionnement B/C (XYZ restent repère pièce) ; Fagor 8065 = machine 3 axes : indexation ignorée à l'export (aucun B/C, alerte)."));
  r32.appendChild(faoLab('C'));
  r32.appendChild(faoNum(O.c,function(v){ setup.orient={b:faoOrient(setup).b,c:Math.round(v*1000)/1000}; },
    44,5,"Rotation de table autour de Z (degrés) — indexation de la pièce dans le plan d'usinage."));
  r32.appendChild(faoLab('°'));
  r32.appendChild(faoMini('3 axes',function(){ setup.orient={b:0,c:0}; },
    'Remise à plat : annule l\'indexation 3+2 (B=0, C=0).'));
  r32.appendChild(faoMini('Sur la pièce',function(){ faoPlaneStart(setup.id); },
    'Cliquez une face sortante du modèle : les angles B/C sont calculés automatiquement depuis la normale de la face (vérifiez les sens de rotation).'));
  p.appendChild(r32);
  if((FAO_POSTS[setup.machine||setup.post]||{}).kind==='fagor'&&(O.b!==0||O.c!==0)){
    const w32=document.createElement('div');
    w32.className='fao-alert';
    w32.textContent='⚠ Fagor 8065 = machine 3 axes : cette indexation 3+2 sera IGNORÉE à l\'export (programme émis à plat, aucun B/C).';
    p.appendChild(w32);
  }
  // Modèle : corps à usiner
  p.appendChild(faoH('Modèle à usiner'));
  const rB=faoRow();
  let bl=[];
  try{ bl=(typeof bodies!=='undefined'&&bodies?bodies:[]).filter(function(b){return b&&!b.ghost;}); }catch(e){}
  if(!bl.length)rB.appendChild(faoLab('Aucun corps (tout le brut).'));
  else{
    const all=setup.bodies==='all';
    bl.forEach(function(b){
      const cb=document.createElement('input'); cb.type='checkbox';
      cb.checked=all||(Array.isArray(setup.bodies)&&setup.bodies.indexOf(b.id)>=0);
      const nm=(b.name||b.id)+'';
      const lb=document.createElement('label');
      lb.className='fao-check';
      lb.appendChild(cb);
      lb.appendChild(document.createTextNode(nm));
      cb.onchange=function(){
        faoSnapshot('corps modélisés du posage');
        const checked=[];
        try{
          Array.from(rB.querySelectorAll('input[type=checkbox]')).forEach(function(x,i){
            if(x.checked&&bl[i])checked.push(bl[i].id); });
        }catch(e){}
        setup.bodies=(checked.length===bl.length)?'all':checked;
        faoChanged();
      };
      rB.appendChild(lb);
    });
  }
  p.appendChild(rB);
  // Brut + bridage
  p.appendChild(faoH('Brut · bridage'));
  // Source de la boîte : tous les corps (défaut), un seul corps, ou saisie manuelle.
  const modeS=(setup.stockSrc==='body'||setup.stockSrc==='manual')?setup.stockSrc:'bodies';
  const rSrc=faoRow();
  rSrc.appendChild(faoLab('Source'));
  rSrc.appendChild(faoSel([['bodies','Tous les corps'],['body','Corps choisi'],['manual','Manuel']],
    modeS,function(v){
      if(v==='manual'){ faoStock(); faoStockBodyRestore(setup); setup.stockSrc='manual'; } // fige la boîte courante
      else if(v==='body'){
        let id=setup.stockBody;
        if(id==null){
          const first=(typeof bodies!=='undefined'&&bodies?bodies:[])
            .filter(function(b){return b&&!b.ghost&&b.mesh;})[0];
          id=first?first.id:null;
        }
        if(id!=null)faoStockBodySet(id,setup); // désigne + masque le corps choisi
        else{ setup.stockSrc='body'; setup.stockBody=null; faoStock(); }
      }
      else{ // bodies
        faoStockBodyRestore(setup); // ré-affiche le corps qu'on avait masqué
        setup.stockSrc='bodies';
        faoStock();
      }
      if(typeof renderProps==='function')renderProps();
    },
    'D’où vient la boîte du brut : bbox des corps visibles (défaut), bbox d’un seul corps (barreau importé à côté du brut — masqué dans la vue dès choisi, l’œil de l’arbre le réaffiche) ou boîte saisie à la main.'));
  p.appendChild(rSrc);
  if(modeS==='body'){
    const rBd=faoRow();
    rBd.appendChild(faoLab('Brut ='));
    const bList=(typeof bodies!=='undefined'&&bodies?bodies:[])
      .filter(function(b){return b&&!b.ghost&&b.mesh;});
    if(bList.length){
      rBd.appendChild(faoSel(bList.map(function(b){return [b.id,String(b.name||b.id)];}),
        setup.stockBody!=null?setup.stockBody:bList[0].id,
        function(v){ faoStockBodySet(v,setup); },
        'Corps dont la boîte englobante (+ marge) sert de brut. Dès choisi, il est masqué dans la vue (œil de l’arbre pour le revoir).'));
    }else{
      const nb=document.createElement('span');
      nb.className='fao-empty';
      nb.textContent='aucun corps visible — brut resté par défaut';
      rBd.appendChild(nb);
    }
    p.appendChild(rBd);
  }
  if(modeS==='manual'){
    const sM=(setup.stock&&[setup.stock.x0,setup.stock.y0,setup.stock.z0,
      setup.stock.x1,setup.stock.y1,setup.stock.z1].every(isFinite))?setup.stock:faoStock();
    const rM1=faoRow(), rM2=faoRow();
    const mkM=function(k,lab,rr){
      rr.appendChild(faoLab(lab));
      rr.appendChild(faoNum(isFinite(+sM[k])?+sM[k]:0,function(v){
        setup.stock=setup.stock||{}; setup.stock[k]=v;
      },44));
    };
    mkM('x0','X0',rM1); mkM('y0','Y0',rM1); mkM('z0','Z0',rM1);
    mkM('x1','X1',rM2); mkM('y1','Y1',rM2); mkM('z1','Z1',rM2);
    p.appendChild(rM1); p.appendChild(rM2);
    const nM=document.createElement('div');
    nM.className='fao-help';
    nM.textContent='Boîte manuelle (repère monde) — jamais recalculée automatiquement.';
    p.appendChild(nM);
  }
  const rS=faoRow();
  rS.appendChild(faoLab('Brut '+stock.x0.toFixed(0)+','+stock.y0.toFixed(0)+','+stock.z0.toFixed(0)
    +' → '+stock.x1.toFixed(0)+','+stock.y1.toFixed(0)+','+stock.z1.toFixed(0)+' · marge'));
  rS.appendChild(faoNum(setup.marge,function(v){ setup.marge=Math.max(0,v); faoStock(); },48));
  if(modeS!=='manual')rS.appendChild(faoMini('MAJ brut',function(){ faoStock(); }));
  p.appendChild(rS);
  const rF=faoRow();
  rF.appendChild(faoLab('Bridage'));
  rF.appendChild(faoTxt((setup.fixture&&setup.fixture.note)||'',function(v){
    setup.fixture=setup.fixture||{}; setup.fixture.note=String(v).slice(0,80); },110));
  rF.appendChild(faoLab('dég.rad.'));
  rF.appendChild(faoNum(setup.fixture?setup.fixture.radial:5,function(v){
    setup.fixture=setup.fixture||{}; setup.fixture.radial=Math.max(0,v); },44));
  rF.appendChild(faoLab('ax.'));
  rF.appendChild(faoNum(setup.fixture?setup.fixture.axial:5,function(v){
    setup.fixture=setup.fixture||{}; setup.fixture.axial=Math.max(0,v); },44));
  p.appendChild(rF);
  // Bornes Z du bridage : références « Haut/Bas du bridage » des plans
  // (2026-10-08-002). Défaut = fond/dessus du brut (non stocké tant qu'édité).
  const rFZ=faoRow();
  rFZ.appendChild(faoLab('Br. Z0'));
  rFZ.appendChild(faoNum(isFinite(+setup.fixture.z0)?+setup.fixture.z0:stock.z0,function(v){
    setup.fixture=setup.fixture||{}; setup.fixture.z0=v; },44,1,
    'Bas du bridage (mm, repère monde) — référence « Bas du bridage » des plans. Défaut = fond du brut.'));
  rFZ.appendChild(faoLab('Z1'));
  rFZ.appendChild(faoNum(isFinite(+setup.fixture.z1)?+setup.fixture.z1:stock.z1,function(v){
    setup.fixture=setup.fixture||{}; setup.fixture.z1=v; },44,1,
    'Haut du bridage (mm, repère monde) — référence « Haut du bridage » des plans. Défaut = dessus du brut.'));
  p.appendChild(rFZ);
  const nF=document.createElement('div');
  nF.className='fao-help';
  nF.textContent='Bridage mémorisé (phase suivante : évitement dans les parcours).';
  p.appendChild(nF);
  const rC=faoRow();
  rC.appendChild(faoLab('Sortie'));
  rC.appendChild(faoNum(setup.secu,function(v){ setup.secu=Math.max(0,v); },48,0.5,
    "Sortie de pièce (mm hors matière) : (1) dépassement XY en bout de ligne — l'outil sort de la pièce de cette valeur avant son demi-tour, (2) plafond des remontées locales du mode « Remontées : plan retrait ou +5 mm ». Généralement 5 à 10."));
  rC.appendChild(faoLab('Arrosage'));
  rC.appendChild(faoSel([['flood','M7/M08'],['through','M8'],['off','arrêt']],setup.coolant||'flood',
    function(v){ setup.coolant=v; }));
  p.appendChild(rC);
  // 2026-10-08-002 : plans de référence (Fusion360) + mode des remontées —
  // remplace les anciens champs absolus « Retrait » et « Plan Z ».
  const effP=faoPlaneEff(setup,null);
  const tgtP={setupId:setup.id,opId:null};
  p.appendChild(faoPlaneRow('clear','Dégagement',effP.clear,setup,null,tgtP));
  p.appendChild(faoPlaneRow('retr','Retrait',effP.retr,setup,null,tgtP));
  const rMd=faoRow();
  rMd.appendChild(faoLab('Remontées'));
  rMd.appendChild(faoSel([
    ['min5','Plan retrait ou +5 mm','Défaut : les G0 remontent localement à 5 mm au-dessus de la matière, sans jamais dépasser le plan de retrait (Sortie en borne le plafond).'],
    ['plan','Toujours plan de retrait','Toutes les remontées montent au plan de retrait — liaisons plus hautes, plus lentes, mais dégagement maximal.']],
    effP.mode,function(v){ setup.planes=setup.planes||{}; setup.planes.mode=v; },
    'Remontées (liaisons G0) : toujours le plan de retrait, OU remontée locale minimum 5 mm bornée par le plan de retrait.'));
  p.appendChild(rMd);
  p.appendChild(faoHelp(
    'Plans en mm par référence (« depuis ») + décalage : dégagement = plan des translations rapides XY, '+
    'retrait = plan des remontées et des changements d\'outil. Opérations : héritent de ces valeurs '+
    'tant qu\'elles ne les touchent pas ; tout plan reste ≥ dessus du brut.'));
  const rV=faoRow();
  rV.appendChild(faoLab('Rapide G0'));
  rV.appendChild(faoNum(faoRapide(setup),function(v){ setup.rapide=Math.max(1,Math.round(v)); },
    56,100,'Vitesse des déplacements en mode rapide (mm/min) — employée pour l\'estimation des temps.'));
  rV.appendChild(faoLab('Plongée'));
  rV.appendChild(faoNum(faoPlungePct(setup),function(v){ setup.plungePct=Math.min(100,Math.max(1,v)); },
    36,100,"Pourcentage de l'avance de coupe appliqué à la plongée (F de plongée des G1 Z)."));
  rV.appendChild(faoLab('% de F'));
  const rA=faoRow();
  rA.appendChild(faoLab('Accél.'));
  rA.appendChild(faoNum(faoAccel(setup),function(v){ setup.accel=Math.max(100,Math.round(v)); },
    44,100,"Accélération de la machine (mm/s²) — le temps des rapides vaut d/v + v/A, un rapide court coûte plus que sa longueur."));
  rA.appendChild(faoLab('mm/s²'));
  rA.appendChild(faoLab('Ch. outil'));
  rA.appendChild(faoNum(faoToolChg(setup),function(v){ setup.toolChg=Math.max(0,Math.round(v)); },
    40,5,"Durée d'un changement d'outil (secondes) ajoutée à l'estimation pour chaque changement de groupe outil."));
  rA.appendChild(faoLab('s'));
  p.appendChild(rV);
  p.appendChild(rA);
  // La fiche reste LA configuration du posage. Les usinages, l'export, les
  // outils, + Posage, ▶ Usinage et « Tout régénérer » vivent dans l'arbre FAO
  // (faoInitUI) : on ne promène plus la même action à deux endroits.
  const st=document.createElement('div');
  st.className='fao-stats';
  st.textContent=faoStatsText();
  p.appendChild(st);
  const note=document.createElement('div');
  note.className='fao-note';
  note.textContent='3 axes : G0/G1, G2/G3 (arrondis) + cycles de perçage (CYCLE81/G81). Validez toujours le 1er programme en simulation / à vide sur la CN.';
  p.appendChild(note);
}
/* ----- dispatcher panneau droit ----- */
function faoRenderProps(p,s){
  try{ faoMovesPreloadSoon(); }catch(e){} // foin-et-oubli : le cache se remplit pendant qu'on regarde
  try{
    p.innerHTML='';
    try{ p.className='col fao-panel'; }catch(e){}
    const r=faoRoot();
    let setup=null, op=null, idx=-1;
    if(s.kind==='faoSetup'){
      setup=r.setups.filter(function(x){return x.id===s.id;})[0]||null;
    }else{
      setup=r.setups.filter(function(x){return x.id===(s.setup||r.activeSetupId);})[0]||faoSetup();
      if(setup)(setup.ops||[]).forEach(function(o,i){ if(o.id===s.id){op=o;idx=i;} });
    }
    if(!setup){ const d=document.createElement('div'); d.textContent='Posage introuvable.'; p.appendChild(d); return; }
    if(typeof faoChainMode!=='undefined'&&faoChainMode&&op&&
       faoChainMode.setupId===setup.id&&faoChainMode.opId===op.id){
      faoChainPanel(p,setup,op);
      return;
    }
    if(op){
      p.appendChild(faoH('Opération · '+setup.name));
      p.appendChild(faoOpCardElement(setup,op,idx));
      const back=faoRow();
      const bb=document.createElement('button'); bb.textContent='← Posage '+setup.name; bb.style.fontSize='.72rem';
      bb.onclick=function(){ faoSelectSetup(setup.id); };
      back.appendChild(bb);
      p.appendChild(back);
    }else{
      faoSetupFiche(p,setup);
    }
  }catch(e){}
}

function faoStatsGroups(job){
  // Groupes d'outils SANS toucher aux parcours : faoJobMoves() calcule les absents,
  // et une estimation affichée n'a pas le droit de produire une trajectoire.
  let groups=0, prev=null;
  try{
    faoActiveOps(job).forEach(function(op){
      const t=faoToolById(job,op.toolId)||{};
      const k=String(t.id)+'|'+String(t.d);
      if(k!==prev){ groups++; prev=k; }
    });
  }catch(e){ groups=0; }
  return groups;
}
function faoStats(job){
  // Estimation complète du posage : temps de coupe + rapides (accélération
  // machine) + changements d'outil (nb de groupes outil - 1) × durée unitaire.
  let cut=0, rap=0, tm=0, n=0, wait=false, missing=0;
  faoActiveOps(job).forEach(function(op){
    const sf=faoToolSF(faoToolById(job,op.toolId),job);
    const mv=faoMovesStat(op,job); // lecture d'abord : une stats ne recalcule rien
    if(!mv){ if(faoMovesPending())wait=true; else missing++; return; }
    const e=faoEstimate(mv,sf.f,faoRapide(job),faoAccel(job));
    cut+=e.cut; rap+=e.rap; tm+=e.tmin; n++;
  });
  if(wait)return {n:0, cut:0, rap:0, groups:0, tchg:0, tmin:0, pending:true};
  const groups=faoStatsGroups(job);
  const tchg=Math.max(0,groups-1)*(faoToolChg(job)/60);
  return {n:n, cut:cut, rap:rap, groups:groups, tchg:tchg, tmin:tm+tchg, missing:missing};
}
function faoStatsText(){
  try{
    const s=faoStats(faoDoc());
    if(s.pending)return 'Estimation : chargement du parcours…';
    const base=s.n+' op · coupe '+(s.cut/1000).toFixed(1)+' m · rapides '
      +(s.rap/1000).toFixed(1)+' m · ≈'+s.tmin.toFixed(1)+' min';
    if(s.missing){
      let why='';
      try{
        const job=faoDoc();
        const ops=faoActiveOps(job).filter(function(o){ return !o||!o.hidden; });
        for(let i=0;i<ops.length;i++){
          const ck=faoOpMovesKey(ops[i],job), ch=faoOpMovesHit(ops[i]);
          if(ck!==null&&!(ch&&ch.key===ck)){ why=faoMovesWhyShort(job,ops[i]); if(why)break; }
        }
      }catch(e){}
      return 'Estimation partielle : '+base+' — '+s.missing
        +' opération(s) sans parcours en mémoire'+(why?' ('+why+')':'')
        +', « Tout régénérer » pour les produire.';
    }
    return base;
  }catch(e){ return ''; }
}
function faoExport(){
  try{
    if(faoPrevStale){
      try{ faceEl.textContent='FAO : export bloqu\u00e9 — aper\u00e7u p\u00e9rim\u00e9, cliquez \u00ab Tout r\u00e9g\u00e9rer \u00bb d\u2019abord.'; }catch(e){}
      try{ if(typeof console!=='undefined'&&console&&console.warn)console.warn('FAO : export bloqu\u00e9 — aper\u00e7u p\u00e9rim\u00e9.'); }catch(e){}
      faoStaleUI();
      return;
    }
    const job=faoDoc();
    const actives=(job.ops||[]).filter(function(o){return !o||o.on!==false;});
    if(!actives.length){ try{ faceEl.textContent='FAO : aucune opération active à exporter.'; }catch(e){} return; }
    const r=faoPost(job);
    const name=faoProgName(job.name)+'.'+r.ext;
    const blob=new Blob([r.code],{type:'text/plain'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob); a.download=name;
    document.body.appendChild(a); a.click();
    setTimeout(function(){ try{ URL.revokeObjectURL(a.href); a.remove(); }catch(e){} },500);
    try{ faceEl.textContent='FAO : '+name+' exporté ('+r.code.split('\n').length+' blocs).'
      +(r.warns&&r.warns.length?(' ⚠ '+r.warns.join(' ; ')):''); }catch(e){}
  }catch(e){}
}

/* ================= 3D : ébauche par tranches + finition iso-géodésique ================= */
// Maillage plan : {v:[[x,y,z]], t:[[a,b,c]]} — aucune dépendance THREE : tout ce
// bloc est pur et testé en Node sur maillages synthétiques. Le lien avec la
// scène (faoActiveMesh) est le seul point navigateur.
// Ébauche : tranches Z (faoLevels) + vidage scanline par tranche — pas de
// librairie de clipping : pour chaque ligne Y on intersecte la section (impair),
// on rétracte de r+laisse, on zigzague en continu (l'air coupé, jamais de rapide
// dans la matière ; les retracts inter-passes viendront en optimisation).
// Finition : champ de distances géodésiques approché (Dijkstra sur les arêtes)
// depuis le sommet + iso-courbes à pas 3D constant (feston régulier), sorties en
// centre outil (contact + normale×R). Approximation honnête : Dijkstra/arêtes,
// pas MMP/exact — largement suffisante en finition.

function faoMeshFromBody(b){
  // BufferGeometry (indexée ou non) -> maillage plan soudé, en coordonnées pièce.
  try{
    if(!b||!b.mesh||!b.mesh.geometry)return null;
    const g=b.mesh.geometry, pos=g.attributes&&g.attributes.position;
    if(!pos||!pos.count||!pos.array)return null;
    const arr=pos.array, idx=g.index&&g.index.array?g.index.array:null;
    const m=b.mesh.matrixWorld, M=m&&m.elements?m.elements:null;
    const P=function(i){
      let x=arr[i*3],y=arr[i*3+1],z=arr[i*3+2];
      if(M){
        const nx=M[0]*x+M[4]*y+M[8]*z+M[12], ny=M[1]*x+M[5]*y+M[9]*z+M[13],
              nz=M[2]*x+M[6]*y+M[10]*z+M[14], w=M[3]*x+M[7]*y+M[11]*z+M[15]||1;
        x=nx/w; y=ny/w; z=nz/w;
      }
      return [x,y,z];
    };
    const ntri=idx?idx.length/3:pos.count/3;
    if(!(ntri>0)||ntri>120000)return null; // garde-fou : trop lourd pour le navigateur
    const v=[], t=[], map={};
    const W=function(p){
      const k=p[0].toFixed(4)+','+p[1].toFixed(4)+','+p[2].toFixed(4);
      let j=map[k];
      if(j===undefined){ j=v.length; v.push(p); map[k]=j; }
      return j;
    };
    for(let k=0;k<ntri;k++){
      const a=idx?idx[k*3]:k*3, b2=idx?idx[k*3+1]:k*3+1, c=idx?idx[k*3+2]:k*3+2;
      t.push([W(P(a)),W(P(b2)),W(P(c))]);
    }
    if(!v.length||!t.length)return null;
    return {v:v,t:t};
  }catch(e){ return null; }
}
function faoActiveMesh(setup){
  // Fusion des corps du MODÈLE du posage (setup.bodies : 'all' ou [ids]).
  try{
    if(typeof bodies==='undefined'||!bodies||!bodies.length)return null;
    const only=(setup&&Array.isArray(setup.bodies))?setup.bodies:null;
    const V=[], T=[];
    let x0=1/0,y0=1/0,z0=1/0,x1=-1/0,y1=-1/0,z1=-1/0, n=0;
    for(let bi=0;bi<bodies.length;bi++){
      const b=bodies[bi];
      if(!b||b.ghost||b.visible===false)continue;
      if(only&&only.indexOf(b.id)<0)continue;
      const mm=faoMeshFromBodyCached(b);
      if(!mm)continue;
      const off=V.length;
      for(let i=0;i<mm.v.length;i++){ const p=mm.v[i]; V.push(p);
        if(p[0]<x0)x0=p[0]; if(p[1]<y0)y0=p[1]; if(p[2]<z0)z0=p[2];
        if(p[0]>x1)x1=p[0]; if(p[1]>y1)y1=p[1]; if(p[2]>z1)z1=p[2]; }
      for(let i=0;i<mm.t.length;i++)T.push([mm.t[i][0]+off,mm.t[i][1]+off,mm.t[i][2]+off]);
      n++;
      if(T.length>120000)return null;
    }
    if(!n||!V.length)return null;
    return {mesh:{v:V,t:T}, box:{x0:x0,y0:y0,z0:z0,x1:x1,y1:y1,z1:z1}};
  }catch(e){ return null; }
}
function faoMeshNormals(mesh){
  // Normales aux sommets, pondérées par l'aire (robuste aux soupes de triangles).
  const n=[]; let i;
  for(i=0;i<mesh.v.length;i++)n.push([0,0,0]);
  for(i=0;i<mesh.t.length;i++){
    const a=mesh.v[mesh.t[i][0]], b=mesh.v[mesh.t[i][1]], c=mesh.v[mesh.t[i][2]];
    const ux=b[0]-a[0], uy=b[1]-a[1], uz=b[2]-a[2], wx=c[0]-a[0], wy=c[1]-a[1], wz=c[2]-a[2];
    const nx=uy*wz-uz*wy, ny=uz*wx-ux*wz, nz=ux*wy-uy*wx;
    [[mesh.t[i][0]],[mesh.t[i][1]],[mesh.t[i][2]]].forEach(function(q){
      n[q[0]][0]+=nx; n[q[0]][1]+=ny; n[q[0]][2]+=nz; });
  }
  for(i=0;i<n.length;i++){
    const l=Math.hypot(n[i][0],n[i][1],n[i][2])||1;
    n[i]=[n[i][0]/l,n[i][1]/l,n[i][2]/l];
  }
  return n;
}
function faoSliceZ(mesh,z){
  // Intersection maillage/plan Z -> segments 2D [[x1,y1,x2,y2]].
  // Les deux sens de contact sommet/plan sont traités (un niveau pile sur un
  // plan de faces — fond de poche, embase — sortait vide avant : le brut
  // complet était alors usiné à travers la pièce).
  const segs=[], e=1e-9; let i;
  for(i=0;i<mesh.t.length;i++){
    const P=[mesh.v[mesh.t[i][0]],mesh.v[mesh.t[i][1]],mesh.v[mesh.t[i][2]]];
    const d=[P[0][2]-z,P[1][2]-z,P[2][2]-z];
    const pts=[];
    for(let k=0;k<3;k++){
      const a=P[k], b=P[(k+1)%3], da=d[k], db=d[(k+1)%3];
      if((da<-e&&db>e)||(da>e&&db<-e)){
        const s=da/(da-db);
        pts.push([a[0]+(b[0]-a[0])*s, a[1]+(b[1]-a[1])*s]);
      }else if(Math.abs(da)<=e&&Math.abs(db)>e){
        pts.push([a[0],a[1]]);
      }else if(Math.abs(db)<=e&&Math.abs(da)>e){
        pts.push([b[0],b[1]]);
      }
    }
    const uq=[];
    pts.forEach(function(p){
      if(!uq.some(function(q){return Math.hypot(q[0]-p[0],q[1]-p[1])<1e-7;}))uq.push(p);
    });
    if(uq.length>=2)segs.push([uq[0][0],uq[0][1],uq[1][0],uq[1][1]]);
  }
  return segs;
}
function faoScanIntervals(segs,y){
  // Ligne Y -> intervalles matière [xa,xb] (règle impair, tol 1e-7).
  // Décalage epsilon : une ligne passant EXACTEMENT par des sommets de section
  // compterait chaque contact double et annulerait les paires (cas systématique
  // en test : y=5 sur une boîte 0..10).
  const yy=y+1e-7, xs=[];
  for(let i=0;i<segs.length;i++){
    const s=segs[i];
    if((s[1]-yy)*(s[3]-yy)<=0&&s[1]!==s[3]){
      xs.push(s[0]+(s[2]-s[0])*(yy-s[1])/(s[3]-s[1]));
    }
  }
  xs.sort(function(a,b){return a-b;});
  const out=[];
  for(let i=0;i+1<xs.length;i+=2){
    if(xs[i+1]-xs[i]>1e-7)out.push([xs[i],xs[i+1]]);
  }
  return out;
}
/* ----- entrées douces : hélice (descente circulaire) ou rampe (biais) ----- */
// Jamais de plongée verticale dans la matière : l'hélice creuse sa place quand
// la largeur le permet, sinon la rampe descend en avançant (avance plongée).
// L'hélice attaque TOUJOURS hors matière, 2 mm au-dessus de la matière
// restante : faoHelixSpot (matière du maillage) + plancher hFloor côté
// ébauche 3D (face d'entrée de la passe + 2 mm — le maillage ne voit ni le
// brut ni la matière des passes précédentes).
let faoSliceCache=null;
function faoSliceZCached(mesh,z){
  const k=Math.round(z*1000)/1000;
  if(faoSliceCache&&faoSliceCache.mesh===mesh&&faoSliceCache.map[k])return faoSliceCache.map[k];
  const s=faoSliceZ(mesh,z);
  if(faoSliceCache&&faoSliceCache.mesh===mesh)faoSliceCache.map[k]=s;
  return s;
}
function faoSliceHit(segs,cx,cy,clear){
  // Le disque de dégagement [clear] autour du point touche-t-il la section ?
  for(let i=0;i<segs.length;i++){
    const s=segs[i];
    const dx=s[2]-s[0], dy=s[3]-s[1], l2=dx*dx+dy*dy;
    let t=l2>1e-12?((cx-s[0])*dx+(cy-s[1])*dy)/l2:0;
    t=Math.max(0,Math.min(1,t));
    if(Math.hypot(cx-(s[0]+dx*t),cy-(s[1]+dy*t))<clear)return true;
  }
  const xs=[];
  for(let i=0;i<segs.length;i++){
    const s=segs[i];
    if((s[1]-cy)*(s[3]-cy)<=0&&s[1]!==s[3])
      xs.push(s[0]+(s[2]-s[0])*(cy-s[1])/(s[3]-s[1]));
  }
  xs.sort(function(a,b){return a-b;});
  let left=0;
  for(let i=0;i<xs.length;i++)if(xs[i]<cx-1e-9)left++;
  return (left%2)===1;
}
/* Index (hash dense + tranches Y) mémoïsé par tableau de segments : le même
   `segsAll` (construit une fois par niveau) est interrogé 100 000 fois. */
const faoDiscIdxCache=(typeof WeakMap!=='undefined')?new WeakMap():null;
function faoDiscIdx(segs){
  if(!faoDiscIdxCache)return null;
  let idx=faoDiscIdxCache.get(segs);
  if(idx)return idx;
  const H=faoHashBuild(4);
  if(segs.length)faoHashSegs(H,segs);
  const step=1;
  let y0=1/0,y1=-1/0;
  for(let i=0;i<segs.length;i++){
    const a=segs[i][1],b=segs[i][3];
    if(a<y0)y0=a; if(b<y0)y0=b; if(a>y1)y1=a; if(b>y1)y1=b;
  }
  let rows=[],n=1;
  if(segs.length&&y1>=y0){
    n=Math.max(1,Math.ceil((y1-y0)/step)+1);
    rows=new Array(n);
    for(let i=0;i<segs.length;i++){
      const a=segs[i][1],b=segs[i][3];
      if(a===b)continue;
      let i0=Math.floor((Math.min(a,b)-y0)/step),i1=Math.floor((Math.max(a,b)-y0)/step);
      if(i0<0)i0=0; else if(i0>n-1)i0=n-1;
      if(i1<0)i1=0; else if(i1>n-1)i1=n-1;
      for(let k=i0;k<=i1;k++){let arr=rows[k];if(!arr)rows[k]=arr=[];arr.push(i);}
    }
    idx={H:H,rows:rows,n:n,y0:y0,step:step};
  }else idx={H:H,rows:rows,n:1,y0:0,step:step};
  faoDiscIdxCache.set(segs,idx);
  return idx;
}
function faoDiscClear(segs,cx,cy,hr,r){
  // Le disque d'hélice (centre,hr) évite-t-il la pièce (dedans ou à moins
  // de r) ? 8 échantillons sur le cercle, distance euclidienne au contour :
  // un échantillon juste hors matière (aucun croisement en Y) échappait à
  // la vérification et l'hélice plongeait dans la pièce.
  // Même sémantique qu'avant : parité (croisements comptés sur toute la
  // travée Y, sans tri) puis distance min < r-1e-9 — mais via les index.
  const idx=faoDiscIdx(segs);
  for(let k=0;k<8;k++){
    const a=k/8*Math.PI*2, xx=cx+hr*Math.cos(a), yy=cy+hr*Math.sin(a);
    let len=0,left=0;
    if(idx&&idx.rows.length){
      let b=Math.floor((yy-idx.y0)/idx.step);
      if(b<0)b=0; else if(b>=idx.n)b=idx.n-1;
      const row=idx.rows[b];
      if(row)for(let t=0;t<row.length;t++){
        const s=segs[row[t]];
        if((s[1]-yy)*(s[3]-yy)<=0&&s[1]!==s[3]){
          len++;
          if(s[0]+(s[2]-s[0])*(yy-s[1])/(s[3]-s[1])<xx-1e-9)left++;
        }
      }
    }else{
      for(let i=0;i<segs.length;i++){
        const s=segs[i];
        if((s[1]-yy)*(s[3]-yy)<=0&&s[1]!==s[3]){
          len++;
          if(s[0]+(s[2]-s[0])*(yy-s[1])/(s[3]-s[1])<xx-1e-9)left++;
        }
      }
    }
    if(len%2)return false;
    if(left%2)return false;
    if(idx&&faoDistSeg(idx.H,xx,yy,r)<r-1e-9)return false;
    if(!idx){
      let dmin=1/0;
      for(let i=0;i<segs.length;i++){
        const s=segs[i], ax=s[0], ay=s[1], dx=s[2]-s[0], dy=s[3]-s[1];
        const L2=dx*dx+dy*dy;
        let t=L2>0?((xx-ax)*dx+(yy-ay)*dy)/L2:0;
        if(t<0)t=0; else if(t>1)t=1;
        const px=ax+t*dx-xx, py=ay+t*dy-yy, d2=px*px+py*py;
        if(d2<dmin)dmin=d2;
      }
      if(dmin<(r-1e-9)*(r-1e-9))return false;
    }
  }
  return true;
}
function faoHelixSpot(mesh,cx,cy,hr,r,z,brutTop,planes){
  // Départ hélice = 2 mm au-dessus de la plus haute matière sous le disque.
  // Colonne vide : repli 2 mm au-dessus du NIVEAU (rainure ouverte) — le
  // plancher « face d'entrée de la passe + 2 mm » est posé par l'appelant
  // (hFloor, faoRoughAdaptiveLevel) : le maillage ne voit ni le brut ni la
  // matière enlevée par les passes précédentes.
  // Avec `planes` (Z vertex du maillage) : aucun voile fin manqué entre deux
  // pas de 1 mm ; sans : balayage historique au pas de 1 mm (morph/zigzag).
  const top=isFinite(+brutTop)?+brutTop:z;
  if(Array.isArray(planes)&&planes.length){
    for(let k=planes.length-1;k>=0;k--){
      const zz=planes[k];
      if(!(zz>z+1e-9&&zz<=top+1e-9))continue;
      if(faoSliceHit(faoSliceZCached(mesh,Math.round(zz*1000)/1000),cx,cy,hr+r))return zz+2;
    }
    return z+2;
  }
  for(let zz=top;zz>z+1e-9;zz-=1){
    if(faoSliceHit(faoSliceZCached(mesh,zz),cx,cy,hr+r))return zz+2;
  }
  return z+2;
}
// Jeu latéral de l'hélice : le cercle de l'entrée reste à 2 mm de la face à
// usiner — la fraise ne la touche PAS au démarrage, l'hélice descend DANS LE
// VIDE puis les coupes prennent le relais. Sans ce jeu le disque était validé
// à marge = r exactement : bord de fraise tangent à la paroi (« on y rentre
// direct »).
const faoHelixJeu=2;
function faoHelixEntry(cx,cy,zFrom,zTo,radius,toolD){
  const drop=Math.max(0.5,(isFinite(+toolD)&&+toolD>0?+toolD:10)*0.1);
  const depth=Math.max(0.01,zFrom-zTo);
  const turns=Math.max(1,Math.ceil(depth/drop));
  const per=10, moves=[{r:1,x:cx+radius,y:cy,z:zFrom}];
  const total=turns*per;
  for(let i=1;i<=total;i++){
    const a=i/per*Math.PI*2;
    moves.push({r:0,ent:1,x:cx+radius*Math.cos(a),y:cy+radius*Math.sin(a),
      z:Math.round((zFrom-depth*i/total)*1000)/1000});
  }
  for(let i=1;i<=per;i++){ // tour de fond : palier propre
    const a=i/per*Math.PI*2;
    moves.push({r:0,ent:1,x:cx+radius*Math.cos(a),y:cy+radius*Math.sin(a),z:zTo});
  }
  return moves;
}
/* ----- ENTRÉE CIRCULAIRE (2026-10-08-004) : arc tangent à l'attaque -----
   u = direction de coupe en P, n = rot90(u). Côté CCW : centre C = P+ρn,
   départ S = C−ρu — l'arc G3 arrive en P tangent à u ; miroir (CW) pour
   l'autre côté. L'outil descend d'abord EN Z en S (dans la matière déjà
   enlevée : ancre), puis accoste en arc — jamais de plongée verticale dans
   la matière pleine. ρ = op.entryR (défaut Ø/4). */
function faoSidesCirc(Px,Py,ux,uy,rho){
  const L=Math.hypot(ux,uy);
  if(!(L>1e-9)||!(rho>1e-9))return null;
  ux/=L; uy/=L;
  const nx=-uy, ny=ux;
  return [
    {sx:Px+rho*nx-rho*ux, sy:Py+rho*ny-rho*uy, cx:Px+rho*nx, cy:Py+rho*ny, cw:false},
    {sx:Px-rho*nx-rho*ux, sy:Py-rho*ny-rho*uy, cx:Px-rho*nx, cy:Py-rho*ny, cw:true}
  ];
}
function faoCircArcPts(s,Px,Py){
  // Points (x,y) de l'arc S -> P (extrémités incluses), ~13 échantillons.
  const dx0=s.sx-s.cx, dy0=s.sy-s.cy, R=Math.hypot(dx0,dy0);
  if(!(R>1e-9))return null;
  const a0=Math.atan2(dy0,dx0), a1=Math.atan2(Py-s.cy,Px-s.cx);
  let da=a1-a0;
  if(s.cw){ if(da>0)da-=2*Math.PI; }else if(da<0)da+=2*Math.PI;
  const out=[];
  for(let k=0;k<=12;k++){
    const a=a0+da*k/12;
    out.push([s.cx+R*Math.cos(a), s.cy+R*Math.sin(a)]);
  }
  return out;
}
function faoCircAnchor(moves,Sx,Sy,z,D){
  // Matière déjà enlevée près de S : un tracé de coupe (jamais un rapide) à
  // cote ≤ z passe à ≤ D/2·0,98 de S — l'empreinte du disque outil couvre le
  // point de descente : la plongée verticale en S se fait dans le vide.
  // Coupe à cote ≤ z = niveau courant déjà attaqué (mini-passes : pelage du
  // niveau principal sous le plan mini-passe — matière ouverte sur place).
  const lim=(D/2)*0.98, lim2=lim*lim;
  const sd=function(ax,ay,bx,by){
    const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;
    let t=L2>0?((Sx-ax)*dx+(Sy-ay)*dy)/L2:0;
    if(t<0)t=0; else if(t>1)t=1;
    const qx=ax+t*dx-Sx, qy=ay+t*dy-Sy;
    return qx*qx+qy*qy;
  };
  const seg=function(a,b){
    if(a.z>z+1e-9||b.z>z+1e-9)return false;
    if(b.arc){
      const pts=faoArcSegs(a,b);
      if(pts&&pts.length){
        if(sd(a.x,a.y,pts[0][0],pts[0][1])<=lim2)return true;
        for(let k=1;k<pts.length;k++)
          if(sd(pts[k-1][0],pts[k-1][1],pts[k][0],pts[k][1])<=lim2)return true;
      }
      return sd(a.x,a.y,b.x,b.y)<=lim2;
    }
    return sd(a.x,a.y,b.x,b.y)<=lim2;
  };
  for(let i=1;i<moves.length;i++){
    const a=moves[i-1],b=moves[i];
    if(a.r||b.r)continue;
    if(seg(a,b))return true;
  }
  if(moves.length&&!moves[0].r&&moves[0].z<=z+1e-9){
    const qx=moves[0].x-Sx,qy=moves[0].y-Sy;
    if(qx*qx+qy*qy<=lim2)return true;
  }
  return false;
}
function faoPlungeClear(Sx,Sy,moves,z,D,airAt){
  // 2026-10-08-005 : la plongée en S exige la fraise TOTALEMENT hors matière
  // restante — le disque de rayon D/2 autour de S doit être entièrement balayé
  // par des coupes antérieures (empreinte de coupe à cote ≤ z) ou en air
  // (airAt : hors de la matière brute/poche/colonne). Échantillons : centre +
  // cercle D/2 échantillonné à ~1 mm (K ≈ π·D). Sinon : repli hélice/rampe —
  // jamais de plongée qui mord la matière restante. (L'ancre ponctuelle
  // 2026-10-08-004 est un cas particulier — centre couvert — remplacée ici.)
  const R=D/2, lim=R+1e-9, lim2=lim*lim, near=(R+lim);
  const K=Math.max(16,Math.min(64,Math.ceil(Math.PI*D)));
  const qx=[Sx],qy=[Sy];
  for(let k=0;k<K;k++){const a=k/K*2*Math.PI;qx.push(Sx+R*Math.cos(a));qy.push(Sy+R*Math.sin(a));}
  const cov=new Uint8Array(qx.length);
  let left=qx.length;
  const d2=function(ax,ay,bx,by,px,py){
    const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;
    let t=L2>0?((px-ax)*dx+(py-ay)*dy)/L2:0;
    if(t<0)t=0; else if(t>1)t=1;
    const ex=ax+t*dx-px, ey=ay+t*dy-py;
    return ex*ex+ey*ey;
  };
  const testSeg=function(ax,ay,bx,by){
    if(d2(ax,ay,bx,by,Sx,Sy)>near*near)return; // trop loin de S : aucun échantillon
    for(let k=0;k<qx.length;k++)
      if(!cov[k]&&d2(ax,ay,bx,by,qx[k],qy[k])<=lim2){cov[k]=1;left--;}
  };
  for(let i=1;i<moves.length&&left>0;i++){
    const a=moves[i-1],b=moves[i];
    if(a.r||b.r)continue;
    if(a.z>z+1e-9||b.z>z+1e-9)continue;
    if(b.arc){
      const pts=faoArcSegs(a,b);
      if(pts&&pts.length){
        let px=a.x,py=a.y;
        for(let k=0;k<pts.length;k++){testSeg(px,py,pts[k][0],pts[k][1]);px=pts[k][0];py=pts[k][1];}
      }else testSeg(a.x,a.y,b.x,b.y);
    }else testSeg(a.x,a.y,b.x,b.y);
  }
  if(moves.length&&!moves[0].r&&moves[0].z<=z+1e-9)testSeg(moves[0].x,moves[0].y,moves[0].x,moves[0].y);
  for(let k=0;k<qx.length;k++)if(!cov[k]&&!(airAt&&airAt(qx[k],qy[k])))return false;
  return true;
}
function faoCircRhos(D,ae,entryR){
  // Candidats de rayon (croissants, 2026-10-08-005) : le rayon demandé
  // (entryR, défaut Ø/4), puis Ø/2, le pas ae et Ø — un rayon plus large
  // recule le point de plongée S dans la zone déjà usinée pour que le disque
  // entier de la fraise y trouve de l'air. Premier candidat faisant passer
  // toutes les conditions (S, arc, disque) gagne ; sinon repli hélice/rampe.
  // 2026-10-08-009 (constat) : les ρ plus petits (D/16, D/10, D/6) testés en
  // tête n'ont rien amélioré — aux positions de ré-entrée, l'ancre sort de la
  // région à tout ρ ≥ D/4, et aux ρ serrés l'arc traverserait la matière
  // (okA=false). Les 3 hélices de ces couches (pôle + 2 points d'attaque)
  // sont GÉOMÉTRIQUEMENT NÉCESSAIRES pour ne jamais plonger à plat ; elles
  // sont conservées telles quelles (cf. tests 007 : 0 plongée non couverte).
  const r0=(isFinite(+entryR)&&+entryR>0)?+entryR:+(D/4).toFixed(2);
  const out=[];
  const add=function(v){ if(v>1e-9&&!out.some(function(w){return Math.abs(w-v)<1e-9;}))out.push(v); };
  add(r0); add(D/2); add(isFinite(+ae)&&+ae>0?+ae:0); add(D);
  out.sort(function(a,b){return a-b;});
  return out;
}
function faoCircEval(Px,Py,ux,uy,rho,valid,moves,z,D,needAnchor,airAt){
  // Premier côté PASSANT : S légal, arc entier légal. `rho` peut être une
  // liste de rayons croissants (faoCircRhos — 2026-10-08-005).
  // 2026-10-08-010 : ancre = test PONCTUEL (air ou déjà-usiné) + non pas
  // disque entier — l'entrée est TANGENTIELLE (on arrive latéralement par
  // l'arc, pas en plongée verticale) : il suffit que le centre de S soit
  // dans un zone déjà ouverte. `needAnchor===false` (contour externe) :
  // S tombe déjà à ≥ r hors pièce, tout le disque est dans l'air.
  const RH=Array.isArray(rho)?rho:[rho];
  for(let ri=0;ri<RH.length;ri++){
    const sides=faoSidesCirc(Px,Py,ux,uy,RH[ri]);
    if(!sides)continue;
    for(let i=0;i<sides.length;i++){
      const s=sides[i];
      if(!valid(s.sx,s.sy))continue;
      const pts=faoCircArcPts(s,Px,Py);
      if(!pts)continue;
      let ok=true;
      for(let k=0;k<pts.length;k++)if(!valid(pts[k][0],pts[k][1])){ok=false;break;}
      if(!ok)continue;
      if(needAnchor!==false&&!airAt(s.sx,s.sy)&&!faoCircAnchor(moves,s.sx,s.sy,z,D))continue;
      return s;
    }
  }
  return null;
}
/* ----- ESCARGOT (2026-10-07-005) : pelage en spirale centre -> faces -----
   Le niveau part du CENTRE de la région (bbox des intervalles d'ombre du
   niveau — au mieux le centre de la pièce) et s'en éloigne en spirale
   ARCHIMÉDIEN : chaque tour gagne `ae` en rayon (le stepover = distance
   entre deux tours), jusqu'aux faces — le tour extérieur s'arrête à
   r = D/2 + Parois des parois (mêmes intervalles d'ombre que le
   conventionnel : ni gouge, même laisse, « finir au mieux » au mur).
   Le polygone de la région n'est jamais construit : chaque échantillon est
   testé par faoShadowIntervals (colonne atteignable depuis le dessus,
   matière dilatée de r) — un passage hors région est simplement sauté
   (rapide + ré-entrée), un passage dedans est coupé en G1 ; la liaison
   directe est validée par segClear (repli = ré-entrée).
    Toute ENTRÉE en matière descend en HÉLICE (obligation « 1re face », utile
    à tous les niveaux) — 008 : sauf entrée CIRCULAIRE, où l'hélice se fait
    sur l'ANCRE de l'arc (pass 2) puis l'arc tangent accoste le tracé ;
    même spot, même plancher hFloor = min(secu, zFrom+2) et faoHelixEntry
    qu'en conventionnel ; repli plongée sûre uniquement si aucun rayon
    d'hélice ne passe (colonne d'ombre garantie).
   Mini-passes et finition : inchangées (ringOnly conventionnel).
   */
function faoSpiralLevel(mesh,B,z,D,r,secu,zFrom,ae,entryMode,brutTop,zt,moves,opt){
  const segs=faoSliceZCached(mesh,z);
  const top=isFinite(+zt)?+zt:z;
  const aeA=Math.max(0.5,Math.min(isFinite(+ae)&&+ae>0?+ae:D*0.2,D*0.25));
  const planes=faoShadowPlanes(mesh,z,Math.max(top,isFinite(+brutTop)?+brutTop:z));
  let segsAll=segs.slice();
  for(let pi=0;pi<planes.length;pi++){
    if(planes[pi]>z+1e-9)segsAll=segsAll.concat(faoSliceZCached(mesh,planes[pi]));
  }
  const rnd=function(v){return Math.round(v*1000)/1000;};
  const tz=(opt&&isFinite(+opt.travelZ))?Math.min(secu,+opt.travelZ):null;
  const pitch=Math.max(0.1,isFinite(+ae)&&+ae>0?+ae:D*0.5);
  // --- ZONE DU NIVEAU (retour 1/3) : le centre doit être le POLE
  // d'inaccessibilité des cases usinables (case légale la plus loin d'une
  // case illégale), pas le centre de la bbox des intervalles — sur une pièce
  // à poche décalée la bbox tombe au centre de la BOÎTE, hors zone, et la
  // 1re coupe se pique contre un bord de face (mesuré : 20,85 mm du centre de
  // zone). Cases = même membership que la spirale, transformée de distance
  // chanfrein 2 passes (distance aux cases illégales + au bord de boîte).
  const S=faoShadowShape(mesh,planes,B,r,aeA);
  const rrM=Math.max(0.01,r-0.005);
  // 008 : bbox 2D de la pièce — ancre d'arc hors silhouette = pas de hélice
  // (les chaînes du cadre E0 en marge entreraient par un ressort dans l'air).
  const mBB=[1/0,1/0,-1/0,-1/0];
  for(let vi=0;vi<mesh.v.length;vi++){const vv=mesh.v[vi];
    if(vv[0]<mBB[0])mBB[0]=vv[0]; if(vv[1]<mBB[1])mBB[1]=vv[1];
    if(vv[0]>mBB[2])mBB[2]=vv[0]; if(vv[1]>mBB[3])mBB[3]=vv[1];}
  const insideSil=function(x,y){return x>=mBB[0]-1e-9&&x<=mBB[2]+1e-9&&y>=mBB[1]-1e-9&&y<=mBB[3]+1e-9;};
  const inside=function(x,y){return faoShapeValid(S,x,y,rrM);};
  const gx0=S.rect[0],gy0=S.rect[1];
  const extX=S.rect[2]-S.rect[0],extY=S.rect[3]-S.rect[1];
  if(!(extX>0&&extY>0))return;
  let h=Math.min(1.5,Math.max(0.5,pitch*0.25));
  h=Math.max(h,Math.max(extX,extY)/400); // garde-fou : <= 401² cases
  const nx=Math.max(2,Math.floor(extX/h)+1),ny=Math.max(2,Math.floor(extY/h)+1);
  const mask=new Uint8Array(nx*ny);
  let rx0=1/0,rx1=-1/0,ry0=1/0,ry1=-1/0,nL=0;
  for(let j=0;j<ny;j++){
    const y=gy0+j*h;
    for(let i=0;i<nx;i++){
      const x=gx0+i*h;
      if(!faoShapeValid(S,x,y,rrM))continue;
      mask[j*nx+i]=1;nL++;
      if(x<rx0)rx0=x; if(x>rx1)rx1=x;
      if(y<ry0)ry0=y; if(y>ry1)ry1=y;
    }
  }
  if(!nL)return;
  const D1=1,D2=Math.SQRT2,INF=1e18;
  const dist=new Float64Array(nx*ny);
  for(let p=0;p<nx*ny;p++)dist[p]=mask[p]?INF:0;
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
    const p=j*nx+i;let d=dist[p];
    if(i>0)d=Math.min(d,dist[p-1]+D1);
    if(j>0)d=Math.min(d,dist[p-nx]+D1);
    if(i>0&&j>0)d=Math.min(d,dist[p-nx-1]+D2);
    if(i<nx-1&&j>0)d=Math.min(d,dist[p-nx+1]+D2);
    dist[p]=d;
  }
  for(let j=ny-1;j>=0;j--)for(let i=nx-1;i>=0;i--){
    const p=j*nx+i;let d=dist[p];
    if(i<nx-1)d=Math.min(d,dist[p+1]+D1);
    if(j<ny-1)d=Math.min(d,dist[p+nx]+D1);
    if(i<nx-1&&j<ny-1)d=Math.min(d,dist[p+nx+1]+D2);
    if(i>0&&j<ny-1)d=Math.min(d,dist[p+nx-1]+D2);
    dist[p]=d;
  }
  // pôle : case la plus éloignée ; le maximum est souvent un PLATEAU de
  // cases égales (rectangle érodé) — moyenne des cases liées, sinon la
  // première case du balayage (coin haut-gauche du plateau) décale le centre.
  let bd=-1,pxs=0,pys=0,nPk=0;
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
    const p=j*nx+i;
    if(!mask[p])continue;
    // distance au bord de boîte (cases) : un niveau sans aucune matière illé-
    // gale (poche entièrement ouverte) prend le CENTRE de la zone, pas un coin.
    const sc=Math.min(dist[p],Math.min(i,nx-1-i,j,ny-1-j));
    if(sc>bd+1e-9){bd=sc;pxs=i;pys=j;nPk=1;}
    else if(sc>=bd-1e-9){pxs+=i;pys+=j;nPk++;}
  }
  const cx=gx0+(pxs/nPk)*h, cy=gy0+(pys/nPk)*h;
  const Rmax=Math.max(
    Math.hypot(rx0-cx,ry0-cy),Math.hypot(rx1-cx,ry0-cy),
    Math.hypot(rx0-cx,ry1-cy),Math.hypot(rx1-cx,ry1-cy))+2*pitch;
  // --- liaisons (copie conventionnelle) : G1 sûre ou translation à vide
  const zTopSafe=Math.max(top,isFinite(+brutTop)?+brutTop:top);
  const pathOK=function(p,q){
    if(tz&&tz>=zTopSafe-1e-9)return true;
    const dx=q.x-p.x,dy=q.y-p.y,L=Math.sqrt(dx*dx+dy*dy);
    const n=Math.max(1,Math.ceil(L));
    const rr=Math.max(0.01,r-1e-3);
    for(let i=0;i<=n;i++){
      const t=i/n;
      // parité + disque : un segment droit traversant une bande matière LARGE
      // (≥ r de chaque bord) restait « sûr » à faoDiscClear seul.
      if(!faoShapeValid(S,p.x+dx*t,p.y+dy*t,rr))return false;
    }
    return true;
  };
  const gotoXY=function(px,py){
    px=rnd(px); py=rnd(py);
    if(!moves.length){moves.push({r:1,x:px,y:py,z:secu});return secu;}
    const prev=moves[moves.length-1];
    const zGo=(tz&&pathOK(prev,{x:px,y:py}))?tz:secu;
    if(Math.abs(prev.z-zGo)>1e-9)moves.push({r:1,x:prev.x,y:prev.y,z:zGo});
    moves.push({r:1,x:px,y:py,z:zGo});
    return zGo;
  };
  const rrSafe=Math.max(0.01,r-0.005);
  const segClear=function(ax,ay,bx,by){
    const dx=bx-ax,dy=by-ay,L=Math.sqrt(dx*dx+dy*dy);
    const n=Math.max(1,Math.ceil(L/0.25));
    for(let i=0;i<=n;i++){
      const t=i/n;
      if(!faoShapeValid(S,ax+dx*t,ay+dy*t,rrSafe))return false;
    }
    return true;
  };
  // 011 : VIDE D'ABORD — vraie coupe déjà émise à cote z dans CE niveau (le
  // tableau moves est partagé entre niveaux : le drapeau est local à
  // faoSpiralLevel). Tant qu'il est faux (1re attaque du niveau), rien n'a
  // encore été balayé à cette cote : inutile de chercher du vide.
  let sweptNow=false;
  const pushCut=function(x,y){
    const nx=rnd(x),ny=rnd(y),prev=moves[moves.length-1];
    if(prev&&!prev.r&&Math.abs(prev.x-nx)<1e-9&&Math.abs(prev.y-ny)<1e-9)return;
    moves.push({r:0,x:nx,y:ny,z:z});
    sweptNow=true;
  };
  // --- ENTRÉE HÉLICE (obligation 1re face) : spot = 2 mm au-dessus de la
  // matière restante sous le disque, plancher hFloor = min(secu, zFrom+2)
  // (le maillage ne voit ni le brut ni les passes précédentes).
  const hFloor=Math.min(secu,zFrom+2);
  const pickHr=function(x,y){
    const cands=[D*0.4,D*0.2,1,0.5];
    for(let i=0;i<cands.length;i++){
      const hr=cands[i];
      if(!(hr>=0.5))continue;
      if(faoDiscClear(segsAll,x,y,hr,r+faoHelixJeu)||faoDiscClear(segsAll,x,y,hr,r))return hr;
    }
    return 0; // aucun rayon : plongée sûre (colonne d'ombre garantie par le membership)
  };
  // 008 : orbite légale (8 points dans la région) autour d'un point quelconque.
  const okOrbPt=function(px,py,h){
    for(let k=0;k<8;k++){const a=k/8*2*Math.PI;if(!inside(px+h*Math.cos(a),py+h*Math.sin(a)))return false;}
    return true;
  };
  const rhoCirc=faoCircRhos(D,ae,opt.entryR);
  // 2026-10-08-007 : air = hors du BRUT (la boîte de stock), plus « hors de la
  // pièce » — pendant l'ébauche le vide de poche (et l'extérieur d'un bossage)
  // n'est PAS de l'air, c'est du brut à enlever : `!faoShapeInside` acceptait
  // des ancres/plongées au cœur du brut non usiné (« fraise à cheval après la
  // spirale »). Hors boîte = seul endroit réellement vide.
  const airSp=function(x,y){
    return x<B.x0-1e-9||x>B.x1+1e-9||y<B.y0-1e-9||y>B.y1+1e-9;
  };
  // 011 : VIDE D'ABORD (feedback « après la spirale tu rentres en pleine
  // matière en rampe circulaire alors qu'il y a plein de vide avant ») —
  // après la spirale tout le plancher du niveau est du vide : avant toute
  // hélice/rampe en matière, on cherche un point Q à portée de la cible où
  // le disque D/2 est ENTIÈREMENT balayé (ou en air), ON Y PLONGE À PLAT
  // (sûr par construction : faoPlungeClear, test 007), puis on accoste la
  // cible à cote z (liaison latérale à travers le déjà-usiné, centre
  // toujours dans la région = aucun gouge). L'entrée circulaire (arc
  // tangent) vient ensuite, depuis le vide. Rejeté si le vide n'est pas
  // joignable à cote (mur entre Q et la cible = gouge) : repli hélice /
  // rampe inchangé (marge E0, 1re attaque).
  const voidWay=function(tx,ty){
    if(!sweptNow)return null;
    const step=Math.max(2,D*0.12),Rmax=Math.min(45,Math.max(18,D*1.6));
    const maxK=Math.ceil(Rmax/step);
    for(let k=1;k<=maxK;k++){
      const rad=k*step;
      const n=Math.max(6,Math.ceil(2*Math.PI*rad/step));
      for(let j=0;j<n;j++){
        const a=j/n*2*Math.PI;
        const qx=tx+rad*Math.cos(a),qy=ty+rad*Math.sin(a);
        if(!inside(qx,qy))continue;
        if(!segClear(qx,qy,tx,ty))continue;
        if(!faoPlungeClear(qx,qy,moves,z,D,airSp))continue;
        return {x:qx,y:qy};
      }
    }
    return null;
  };
  // 011 : arrivée sur le vide — rapide en hauteur au-dessus de Q puis
  // PLONGÉE À PLAT sur Q (disque clair par construction de voidWay).
  // 10-09-002 : lever + rapide (« au plus vite en l'air ») SAUF liaison
  // courte (< faoRapideMin) et sûre : G1 à plat dans le vide (sauter pour
  // un hop de quelques centimètres à chaque anneau, c'est n'importe quoi).
  const arriveVoid=function(qx,qy){
    const prev=moves.length?moves[moves.length-1]:null;
    const ddx=qx-(prev?prev.x:0), ddy=qy-(prev?prev.y:0);
    if(prev&&!prev.r&&Math.abs(prev.z-z)<1e-9&&
       ddx*ddx+ddy*ddy<faoRapideMin*faoRapideMin&&
       segClear(prev.x,prev.y,qx,qy)){ pushCut(qx,qy); return; }
    const zG=gotoXY(qx,qy);
    if(Math.abs(zG-z)>1e-9)moves.push({r:0,ent:1,x:rnd(qx),y:rnd(qy),z:z});
  };
  // 007 : hauteur de départ communiquée au RAMPAGE quand entryTo renvoie false.
  let rampZ0=0;
  const entryTo=function(x,y,ux,uy){
    // 2026-10-08-004 : ENTRÉE CIRCULAIRE — si de la matière est déjà enlevée
    // près du départ (ancre), on descend en Z sur place puis on accoste en
    // arc tangent ; sinon repli hélice/plongée sûre (1re attaque du niveau).
    // 2026-10-08-005 : rayons candidats + disque outil entièrement en air.
    // 2026-10-08-007 : renvoie true = entrée sûre émise ; false = ni ancre
    // (faoPlungeClear), ni hélice tenable -> l'APPELANT RAMPE le long du
    // chemin (descente en avançant, jamais à plat sur du brut restant).
    if(entryMode==='circ'){
      // pass 1 (005/007/010) : ancre DÉJÀ balayée (ré-entrée) -> entrée
      // TANGENTIELLE. Si le disque entier est dégagé (faoPlungeClear) :
      // descente verticale + arc à plat. Sinon (ancre à la limite du
      // déjà-usiné) : RAMPE le long de l'arc depuis zG — la descente se fait
      // EN COUPANT sur l'arc tangent, jamais à plat sur du brut restant.
      const side=faoCircEval(x,y,ux||0,uy||0,rhoCirc,inside,moves,z,D,true,airSp);
      if(side){
        if(faoPlungeClear(side.sx,side.sy,moves,z,D,airSp)){
          const zG=gotoXY(side.sx,side.sy);
          if(Math.abs(zG-z)>1e-9)moves.push({r:0,ent:1,x:rnd(side.sx),y:rnd(side.sy),z:z});
          moves.push({r:0,ent:1,x:rnd(x),y:rnd(y),z:z,
            arc:{i:side.cx-side.sx,j:side.cy-side.sy,cw:side.cw}});
          return true;
        }
        // 011 : VIDE D'ABORD — l'ancre est à la limite du déjà-usiné mais le
        // vide est joignable à proximité : on plonge À PLAT sur Q (clair),
        // on accoste l'ancre à cote z, puis l'arc tangent accoste la cible
        // — l'entrée circulaire depuis le vide, jamais une rampe en matière.
        const Qs=voidWay(side.sx,side.sy);
        if(Qs){
          arriveVoid(Qs.x,Qs.y);
          pushCut(side.sx,side.sy);
          moves.push({r:0,ent:1,x:rnd(x),y:rnd(y),z:z,
            arc:{i:side.cx-side.sx,j:side.cy-side.sy,cw:side.cw}});
          return true;
        }
        // 010 : AUCUN vide joignable (ex. ancre en marge, mur entre le vide et
        // la cible) -> ramp le long de l'arc S -> P (descente en coupant,
        // paliers ≤ 2 mm) : la descente se fait EN COUPANT sur l'arc tangent,
        // jamais à plat sur du brut restant.
        {
          const zG=gotoXY(side.sx,side.sy);
          const Rr=Math.hypot(side.sx-side.cx,side.sy-side.cy);
          let a0=Math.atan2(side.sy-side.cy,side.sx-side.cx);
          let a1=Math.atan2(y-side.cy,x-side.cx);
          let da=a1-a0;
          if(side.cw){if(da>0)da-=2*Math.PI;}else if(da<0)da+=2*Math.PI;
          const nR=Math.max(2,Math.ceil((zG-z)/2));
          let ppx=side.sx,ppy=side.sy;
          for(let s=1;s<=nR;s++){
            const f=s/nR,a=a0+da*f;
            const xx=side.cx+Rr*Math.cos(a),yy=side.cy+Rr*Math.sin(a);
            moves.push({r:0,ent:1,x:rnd(xx),y:rnd(yy),
              z:Math.round((zG+(z-zG)*f)*1000)/1000,
              arc:{i:side.cx-ppx,j:side.cy-ppy,cw:side.cw}});
            ppx=xx;ppy=yy;
          }
        }
        return true;
      }
      // pass 2 (008) : 1re ATTAQUE du niveau — la matière à z n'est pas encore
      // coupée, l'ancre échoue inévitablement au disque. On garde le MÊME arc
      // tangent et on descend sur place en HÉLICE à orbite légale (engagement
      // progressif, orbite tenue dans la région = jamais à cheval) : les
      // entrées circulaires redeviennent la norme au début de chaque niveau.
      for(let ri=0;ri<rhoCirc.length;ri++){
        const sides=faoSidesCirc(x,y,ux||0,uy||0,rhoCirc[ri]);
        if(!sides)continue;
        for(let i=0;i<sides.length;i++){
          const s2=sides[i];
          if(!inside(s2.sx,s2.sy))continue;
          if(!insideSil(s2.sx,s2.sy))continue; // 008 : ancre hors silhouette = pas de ressort dans l'air
          const pts2=faoCircArcPts(s2,x,y);
          if(!pts2)continue;
          let okA=true;
          for(let k=0;k<pts2.length;k++)if(!inside(pts2[k][0],pts2[k][1])){okA=false;break;}
          if(!okA)continue;
          if(faoPlungeClear(s2.sx,s2.sy,moves,z,D,airSp)){
            // 009 : ancre déjà enlevée (ré-entrée de spirale) -> descente
            // verticale sûre, puis l'arc tangent accoste le tracé.
            const zG=gotoXY(s2.sx,s2.sy);
            if(Math.abs(zG-z)>1e-9)moves.push({r:0,ent:1,x:rnd(s2.sx),y:rnd(s2.sy),z:z});
          }else{
            // 011 : VIDE D'ABORD — l'ancre n'est pas entièrement dégagée mais
            // le vide est joignable : plongée plate sur Q + liaison à cote,
            // l'arc tangent vient depuis le vide (pas d'hélice en matière).
            const Q2=voidWay(s2.sx,s2.sy);
            if(Q2){
              arriveVoid(Q2.x,Q2.y);
            }else{
              const zG=gotoXY(s2.sx,s2.sy);
              // 008/009 : 1re attaque (matière pleine) -> hélice à orbite
              // légale sur l'ancre, engagement progressif, jamais à plat.
              let hrH=pickHr(s2.sx,s2.sy);
              if(!(hrH>0)){
                hrH=Math.max(1,D*0.2);
                while(hrH>0.5&&!okOrbPt(s2.sx,s2.sy,hrH))hrH-=0.5;
                if(!(hrH>0.5&&okOrbPt(s2.sx,s2.sy,hrH)))continue;
              }
              const hS=Math.max(faoHelixSpot(mesh,s2.sx,s2.sy,hrH,r,z,brutTop,planes),hFloor);
              if(Math.abs(zG-hS)>1e-9)moves.push({r:0,ent:1,x:rnd(s2.sx),y:rnd(s2.sy),z:hS});
              faoHelixEntry(s2.sx,s2.sy,hS,z,hrH,D).slice(1).forEach(function(m){moves.push(m);});
            }
          }
          pushCut(s2.sx,s2.sy);
          moves.push({r:0,ent:1,x:rnd(x),y:rnd(y),z:z,
            arc:{i:s2.cx-s2.sx,j:s2.cy-s2.sy,cw:s2.cw}});
          return true;
        }
      }
    }
    // 011 : VIDE D'ABORD (repli générique — auto, ou circ sans ancre) — le
    // disque de la cible est déjà entièrement balayé ou en air : plongée à
    // plat directement, AVANT toute hélice. Après la spirale le plancher du
    // niveau est du vide partout : une hélice ici serait exactement le
    // « rampe circulaire en pleine matière » du feedback.
    if(faoPlungeClear(x,y,moves,z,D,airSp)){
      const zG=gotoXY(x,y);
      if(Math.abs(zG-z)>1e-9)moves.push({r:0,ent:1,x:rnd(x),y:rnd(y),z:z});
      pushCut(x,y);
      return true;
    }
    // 011 : sinon le vide est peut-être joignable À CÔTÉ : Q où le disque est
    // clair, plongée plate sur Q, puis accoste la cible à cote z.
    const Qw=voidWay(x,y);
    if(Qw){
      arriveVoid(Qw.x,Qw.y);
      pushCut(x,y);
      return true;
    }
    // 008 : hélice de descente au point d'attaque UNIQUEMENT dans la
    // silhouette de la pièce (centre de poche : direction dégénérée au pôle,
    // pas d'arc possible) — hors silhouette (cadre E0, marge) : aucun
    // ressort dans l'air, l'appelant ramp le long du chemin.
    const zG=gotoXY(x,y);
    if(insideSil(x,y)){
      const hr=pickHr(x,y);
      const hStart=Math.max(faoHelixSpot(mesh,x,y,hr>0?hr:0,r,z,brutTop,planes),hFloor);
      if(Math.abs(zG-hStart)>1e-9)moves.push({r:0,x:rnd(x),y:rnd(y),z:hStart});
      if(hr>0){
        faoHelixEntry(x,y,hStart,z,hr,D).slice(1).forEach(function(m){moves.push(m);});
        pushCut(x,y);
        return true;
      }
      let hrF=Math.max(1,D*0.2);
      while(hrF>0.5&&!okOrbPt(x,y,hrF))hrF-=0.5;
      if(hrF>0.5&&okOrbPt(x,y,hrF)){
        faoHelixEntry(x,y,hStart,z,hrF,D).slice(1).forEach(function(m){moves.push(m);});
        pushCut(x,y);
        return true;
      }
    }
    const hStart2=Math.max(faoHelixSpot(mesh,x,y,0,r,z,brutTop,planes),hFloor);
    if(Math.abs(zG-hStart2)>1e-9)moves.push({r:0,x:rnd(x),y:rnd(y),z:hStart2});
    rampZ0=hStart2; // l'air vers hStart2 est déjà émis : le rampage continue à z
    return false;
  };
  // --- spirale : R(θ) = pitch·θ/2π, échantillonnage à corde s (borné),
  // pas angulaire borné à π/6 près du centre.
  const s=Math.max(0.5,Math.min(Math.max(pitch,D*0.25),D*0.5));
  const thMax=2*Math.PI*(Math.ceil(Rmax/pitch)+1);
  let th=0,guard=0,atCut=false,prevIn=false,px=cx,py=cy;
  // 007 : descente répartie le long de la spirale (rampL>0 = rampage actif)
  let rampL=0,rampK=0,rampTot=0;
  while(th<=thMax&&guard++<400000){
    const R=pitch*th/(2*Math.PI);
    const x=cx+R*Math.cos(th), y=cy+R*Math.sin(th);
    if(inside(x,y)){
      // Direction d'attaque = tangente CCW de la spirale en (x,y) — l'arc
      // circulaire arrive en tangence sur le sens de coupe ; centre exact
      // (R=0) : repli sur le pas de l'échantillon.
      let ex=-(y-cy), ey=(x-cx);
      if(Math.hypot(ex,ey)<1e-9){ ex=x-px; ey=y-py; }
      if(rampL>0){
        // 007 : on CONTINUE le rampage — la fraise descend en avançant sur la
        // spirale (coupe progressive du croissant non balayé, centre légal).
        rampK++;
        const zr=Math.max(z,Math.round((rampZ0+(z-rampZ0)*rampK/rampTot)*1000)/1000);
        moves.push({r:0,ent:1,x:rnd(x),y:rnd(y),z:zr});
        rampL--;
      }else if(!atCut||!prevIn||!segClear(px,py,x,y)){
        if(!entryTo(x,y,ex,ey)){
          // 007 : aucune entrée sûre ici (pas d'ancre balayée, pas d'orbite
          // tenable) -> RAMPAGE le long de la spirale : la fraise découpe en
          // progressant, jamais à plat sur le brut restant.
          rampTot=Math.max(2,Math.ceil((rampZ0-z)/2));
          rampK=1; rampL=rampTot-1;
          const zr=Math.max(z,Math.round((rampZ0+(z-rampZ0)*rampK/rampTot)*1000)/1000);
          moves.push({r:0,ent:1,x:rnd(x),y:rnd(y),z:zr});
        }
      }
      else pushCut(x,y);
      atCut=true; prevIn=true; px=x; py=y;
    }else prevIn=false;
    th+=(R>1e-9)?Math.min(s/R,Math.PI/6):Math.PI/6;
  }
  // 007 : fin de spirale pendant un rampage : on termine la descente au
  // dernier point légal — hélice micro-orbite si elle tient, sinon plongée
  // claire (disque déjà balayé), sinon on garde la cote atteinte (sûr).
  if(rampL>0){
    const zLast=moves.length?moves[moves.length-1].z:z;
    if(zLast>z+1e-9){
      let orbOk=true;
      for(let k=0;k<8;k++){const a=k/8*2*Math.PI;if(!inside(px+0.5*Math.cos(a),py+0.5*Math.sin(a))){orbOk=false;break;}}
      if(orbOk)faoHelixEntry(px,py,zLast,z,0.5,D).slice(1).forEach(function(m){moves.push(m);});
      else if(faoPlungeClear(px,py,moves,z,D,airSp))moves.push({r:0,x:rnd(px),y:rnd(py),z:z});
    }
  }
  // --- DERNIÈRE PASSE : les FACES du solide (retour 2/3). Mêmes chaînes que
  // le conventionnel k=0 : chaines du niveau offsetées à r (la laisse de
  // l'outil suit exactement les parois) + cadre E0 de la boîte. Chaîne la plus
  // proche d'abord ; liaison G1 sûre sinon entrée (hélice si le disque passe,
  // sinon plongée sûre au point — un helix tangent au mur est hors zone, et le
  // dernier tour de spirale est déjà à proximité quasi systématique).
  const rem=faoOffsetRuns(S,r).concat(faoRectRuns(S,0,r)).filter(function(c){
    return c.pts&&c.pts.length>=2&&Math.max(c.bb[2]-c.bb[0],c.bb[3]-c.bb[1])>=0.1;
  });
  const cpd=function(ch,px,py){
    const P=ch.pts,n=P.length,segsN=ch.closed?n:n-1;
    let d=1/0;
    for(let i=0;i<segsN;i++){
      const a=P[i],b=P[(i+1)%n];
      const dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy;
      let t=L2>0?((px-a[0])*dx+(py-a[1])*dy)/L2:0;
      if(t<0)t=0;else if(t>1)t=1;
      const qx=px-(a[0]+t*dx),qy=py-(a[1]+t*dy),dd=Math.sqrt(qx*qx+qy*qy);
      if(dd<d)d=dd;
    }
    return d;
  };
  // 2026-10-08-003 — sens 'avalant' : comme ordered() du conventionnel, les
  // chaines de faces ne sont JAMAIS retournees (sens de coupe constant) ;
  // les anneaux fermes restent simplement tournes vers le depart le plus
  // proche. Absent/'bidir' : retournement libre, code historique.
  const avalant=!!(opt&&opt.sens==='avalant');
  const cord=function(ch,px,py){
    const P=ch.pts;
    if(ch.closed){
      let bi=0,bd2=1/0;
      for(let i=0;i<P.length;i++){
        const dx=P[i][0]-px,dy=P[i][1]-py,dd=dx*dx+dy*dy;
        if(dd<bd2){bd2=dd;bi=i;}
      }
      return P.slice(bi).concat(P.slice(0,bi));
    }
    if(avalant)return P; // sens unique : ordre naturel de la chaine
    const f=P[0],l=P[P.length-1];
    const df=(f[0]-px)*(f[0]-px)+(f[1]-py)*(f[1]-py);
    const dl=(l[0]-px)*(l[0]-px)+(l[1]-py)*(l[1]-py);
    if(dl<df){
      const rev=new Array(P.length);
      for(let i=0;i<P.length;i++)rev[i]=P[P.length-1-i];
      return rev;
    }
    return P;
  };
  while(rem.length){
    const P=moves.length?moves[moves.length-1]:null;
    const sx0=rem[0].pts[0][0],sy0=rem[0].pts[0][1];
    const px=P?P.x:sx0, py=P?P.y:sy0;
    let bi2=0,bd2=1/0;
    for(let i=0;i<rem.length;i++){
      const dd=cpd(rem[i],px,py);
      if(dd<bd2){bd2=dd;bi2=i;}
    }
    const ch=rem.splice(bi2,1)[0];
    const seq=cord(ch,px,py);
    const sx=seq[0][0],sy=seq[0][1];
    // Direction d'attaque = premier maillon de la chaîne (sens de coupe).
    const ex2=(seq.length>1)?seq[1][0]-seq[0][0]:0;
    const ey2=(seq.length>1)?seq[1][1]-seq[0][1]:0;
    let i0=1;
    // 011 : P.z > z = fin de spiral en cours de rampage sans être redescendu
    // à la cote — ne JAMAIS accoster la chaîne depuis cette cote (une poussée
    // directe serait une plongée verticale non contrôlée) : entryTo (vide
    // d'abord) ou ramp depuis rampZ0.
    // 10-09-002 : liaison courte (< faoRapideMin) et sûre = G1 à la cote
    // (déjà sur place : aucun trajet) — pas de lever pour un hop de quelques
    // centimètres ; au-delà : rapide en l'air (mode circ : cercle d'entrée,
    // sinon plongée plate sûre 007) ; repli ramp le long de la chaîne.
    const ici=P&&!P.r&&Math.abs(P.z-z)<1e-9;
    const here=ici&&Math.abs(P.x-sx)<1e-9&&Math.abs(P.y-sy)<1e-9;
    if(here){
      pushCut(sx,sy);
    }else if(ici&&(sx-P.x)*(sx-P.x)+(sy-P.y)*(sy-P.y)<faoRapideMin*faoRapideMin&&
             segClear(P.x,P.y,sx,sy)){
      pushCut(sx,sy);
    }else if(!entryTo(sx,sy,ex2,ey2)){
      // 2026-10-08-007 : RAMPE le long de la chaîne de faces — la fraise
      // descend EN COUPANT le croissant non balayé le long du mur (paliers
      // bornés à ~2 mm, répartis sur les points disponibles), centre
      // toujours à r du mur : aucune plongée à plat sur le brut restant,
      // aucun gouge.
      const nUse=Math.max(1,Math.min(seq.length-1,Math.ceil((rampZ0-z)/2)));
      const dz=(rampZ0-z)/nUse;
      for(let i=1;i<=nUse;i++){
        moves.push({r:0,ent:1,x:rnd(seq[i][0]),y:rnd(seq[i][1]),
          z:Math.round((rampZ0-dz*i)*1000)/1000});
      }
      i0=nUse+1;
    }
    for(let i=i0;i<seq.length;i++)pushCut(seq[i][0],seq[i][1]);
    if(ch.closed)pushCut(seq[0][0],seq[0][1]);
  }
}
function faoUpFloors(mesh,z0,z1){
  // FONDS RÉELS du maillage (7/10) : faces horizontales avec matière EN
  // DESSOUS et vide au-dessus — plancher de poche, sommet de bossage — dans
  // [z0,z1]. Candidats = faces planes horizontales (les deux orientations de
  // triangulation), décision par PARITÉ exacte de l'app (faoScanIntervals)
  // juste en dessous / au-dessus : ni dépendance au sens des triangles, ni
  // faux positif sur une voûte (face tournée vers le bas) ni sur une interface
  // interne. Aires groupées par cote quantifiée à 0,001 ; seuil 0,01 mm²
  // (slivers de tessellation ignorés).
  const res=[];
  if(!mesh||!mesh.v||!mesh.v.length||!mesh.t||!mesh.t.length)return res;
  const cands={};
  for(let i=0;i<mesh.t.length;i++){
    const tr=mesh.t[i],a=mesh.v[tr[0]],b=mesh.v[tr[1]],c=mesh.v[tr[2]];
    if(!a||!b||!c)continue;
    const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2];
    const vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
    const len=Math.sqrt(nx*nx+ny*ny+nz*nz);
    if(!(len>0)||Math.abs(nz)/len<0.999)continue; // pas horizontal (> ~2,5°)
    const z=Math.round(a[2]*1000)/1000;
    if(!(z>=z0-1e-9&&z<=z1+1e-9))continue;
    const k=String(z);
    if(!cands[k])cands[k]=[];
    cands[k].push({x:(a[0]+b[0]+c[0])/3,y:(a[1]+b[1]+c[1])/3,a:0.5*len});
  }
  const inside=function(segs,x,y){
    const ivs=faoScanIntervals(segs,y);
    for(let i=0;i<ivs.length;i++)if(x>ivs[i][0]+1e-7&&x<ivs[i][1]-1e-7)return true;
    return false;
  };
  for(const k in cands){
    const z=+k, list=cands[k];
    const below=faoSliceZ(mesh,z-0.001), above=faoSliceZ(mesh,z+0.001);
    let ar=0;
    for(let i=0;i<list.length;i++){
      const p=list[i];
      if(inside(below,p.x,p.y)&&!inside(above,p.x,p.y))ar+=p.a;
    }
    if(ar>=0.01)res.push(z);
  }
  res.sort(function(p,q){return q-p;});
  return res;
}
function faoGenRough3D(mesh,box,ztop,zbot,o){
  // Ébauche 3D en MODE TROCOÏDAL UNIQUE (lot 2026-10-03-004) : pelage à ap
  // constant (ae ≤ 0.25*D), trochoïdes G2/G3 clampées en Y dans les goulets,
  // liaisons sans retrait, ombre EXACTE aux plans vertex = brut restant sans
  // voile manqué, entrées multi-spots hélice/rampe X-Y/micro-hélice avec
  // colonnes exactes, ordre de pelage selon l'ouverture.
  // Les anciennes stratégies (morph/zigzag/adaptive) et les passes fines ap2
  // ont été supprimées : `o.strategy`/`o.ap2` sont ignorés (documents migrés
  // à la lecture par faoSanitiseOps) — le petit ae suit les marches.
  // Niveaux vides (brut au-dessus de la pièce) : surfaçage pleine largeur.
  o=o||{};
  if(!mesh||!mesh.v||!mesh.v.length)return [];
  const D=isFinite(+o.toolD)&&+o.toolD>0?+o.toolD:10;
  const RA=faoRA(o);
  const secu=isFinite(+o.secu)?+o.secu:(+zbot+5);
  const zt=+ztop; // le brut au-dessus de la pièce se surfaçe (niveaux vides) :
  // jamais de clamp au sommet pièce, sinon le dessus du brut serait oublié.
  const zBot=+zbot+RA.axial;
  const ap=isFinite(+o.ap)&&+o.ap>0?+o.ap:2;
  const ae=isFinite(+o.ae)&&+o.ae>0?+o.ae:D*0.6;
  const entryMode=o.entry||'auto';
  const B=box||{x0:0,y0:0,x1:100,y1:80};
  // SENS LONG (retour utilisateur) : brut plus haut que large -> pelage le
  // long de Y : on transpose x<->y du maillage et de la boite (hauteurs
  // d'outillage identiques), puis chaque move est remis en place a la
  // sortie (miroir y=x : IJK echanges, sens cw inverse). Carres et
  // paysages : inchanges.
  let swapped=false, M=mesh, BB=B;
  if((B.y1-B.y0)>(B.x1-B.x0)){
    swapped=true;
    M={v:mesh.v.map(function(p){return [p[1],p[0],p[2]];}),t:mesh.t};
    BB={x0:B.y0,y0:B.x0,x1:B.y1,y1:B.x1};
  }
  // ESCARGOT (2026-10-07-005) : pelage en spirale depuis le centre vers les
  // faces (faoSpiralLevel), entrées obligatoires en hélice. `o.mode` posé par
  // le dispatch ; sans mode (documents existants) le parcours conventionnel
  // reste STRICTEMENT identique.
  // 2026-10-08-001 : le mode trocoïdal (poche d'entrée o.poly, phases A/B)
  // a été supprimé — il ne reste que ces deux modes.
  const esc=(o.mode==='escargot');
  // PLANCHER RÉEL (7/10) : la grille `ap` est ancrée sur `Haut` et ne se pose
  // sur le fond de la poche que si `Bas` vaut ce fond (ou y tombe par hasard).
  // Sinon le dernier niveau utile laisse jusqu'à `ap` de matière sur le
  // plancher ET `Fond` ne décale que le bas de zone — le fond n'est jamais
  // fini (Fond=0 comme Fond=0,5, sondes A/B). Pour CHAQUE fond : la laisse
  // `Fond` devient un niveau à `fond+Fond` — et tout niveau de grille tombant
  // dans [fond, fond+Fond[ est RETIRÉ (8/10 : ap aligné pile sur le fond —
  // réel ap=5, fond 20 — le niveau 20 mangeait la laisse 0,5 et allait « au
  // fond malgré le 0,5 »). Aucun ajout quand la grille pose déjà à
  // fond+Fond (coût nul, documents non alignés inchangés).
  // Fonds calculés UNE fois (réutilisés par la finition : niveau cible).
  const zoneOk=isFinite(zt)&&isFinite(+zbot)&&zt>+zbot;
  const floorsUp=zoneOk?faoUpFloors(M,Math.min(+zbot,zt),Math.max(+zbot,zt)):[];
  // Construction d'une grille (niveaux + poses de fond).
  const mkPlan=function(apx){
    const p=faoLevels(zt,zBot,apx).map(function(z){ return {z:z,radial:RA.radial}; });
    if(zoneOk){
      for(let i=0;i<floorsUp.length;i++){
        const f=floorsUp[i];
        if(f<+zbot-1e-9||f>=zt-1e-9)continue;   // hors zone (`Bas`) ou au niveau `Haut`
        const target=Math.round((f+RA.axial)*1000)/1000; // fond + Fond
        let atT=false;
        for(let j=p.length-1;j>=0;j--){
          const z=p[j].z;
          if(z>=f-1e-9&&z<target-1e-9)p.splice(j,1);   // coupait dans la laisse
          else if(Math.abs(z-target)<=1e-9)atT=true;
        }
        if(!atT)p.push({z:target,radial:RA.radial});    // haut de laisse exact
      }
      p.sort(function(a,b){return b.z-a.z;});
    }
    return p;
  };
  const plan=mkPlan(ap);                    // niveaux + poses de fond
  const moves=[];
  const nb=isFinite(+o.minipasses)&&+o.minipasses>0?Math.min(50,Math.round(+o.minipasses)):0;
  // FINITION DES PAROIS (8/10) : N contours sur la DERNIÈRE passe en
  // profondeur, offsets radial*(nf-k)/nf → 0 (k=1..nf), le dernier à la cote
  // théorique ; finitProf = cotes vers le haut (1 = dent haute, N = mur à
  // N étages). OFF par défaut (aucun document existant ne bouge) ; exige une
  // laisse radiale > 0 (sinon l'ébauche est déjà au mur). Même contrat que
  // les mini-passes (ringOnly, entrée depuis le plan du dessus) mais décalage
  // DÉCROISSANT.
  const nf=(o.finitParois&&RA.radial>0)
    ?Math.max(1,Math.min(9,Math.round(isFinite(+o.finitN)?+o.finitN:1))):0;
  // Niveau cible de la finition : le plus PROFOND >= plancher detecte (fonds
  // calcules ci-dessus). Sondes : Bas=0 descend sous la poche -> le dernier
  // niveau du plan est le fond de ZONE (0), inutile ; sans plancher utile ->
  // dernier du plan (comportement anterieur conserve).
  let finIdx=plan.length-1;
  if(nf&&floorsUp.length){
    let zFloor=null;
    for(let i=0;i<floorsUp.length;i++){
      const f=floorsUp[i];
      if(f>=+zbot-1e-9&&f<zt-1e-9&&(zFloor===null||f<zFloor))zFloor=f;
    }
    if(zFloor!==null){
      for(let i=plan.length-1;i>=0;i--)
        if(plan[i].z>=zFloor-1e-9){finIdx=i;break;}
    }
  }
  faoSliceCache={mesh:M,map:{}};
  plan.forEach(function(L,li){
    // Entrée depuis z+pas (rainure du dessus déjà ouverte, descente en avance
    // plongée) : l'hélice ne refait jamais toute la hauteur depuis la sécu.
    const zFrom=Math.min(secu,L.z+ap);
    // Retour 6/10 : LIAISON BASSE — après chaque région (parent OU mini), on
    // revient à 5 mm au-dessus de la matière (à vide, hors gouttière) au lieu
    // de la tour rouge jusqu'à secu, avec inset vers l'intérieur ouvert.
    // 2026-10-08-002 : remontées réglables — mode 'min5' (défaut) = local à
    // 5 mm au-dessus de la bande (was 2 mm) borné par secu ; mode 'plan' =
    // toujours le plan de retrait (secu porte déjà le plan).
    const bandTop=li>0?plan[li-1].z:zt;
    const tvZ=o.remPlan?secu:Math.min(secu,bandTop+5);
    // ESCARGOT : spirale centre -> faces sur le meme plan/levels, memes
    // entrees/travel ; mini-passes et finition restent conventionnelles.
    // 2026-10-08-003 : sens (avalant = sens de coupe constant) porte par opt.
    if(esc)faoSpiralLevel(M,BB,L.z,D,D/2+L.radial,secu,zFrom,ae,entryMode,o.brutTop,zt,moves,{travelZ:tvZ,sens:o.sens,entryR:o.entryR});
    else faoRoughAdaptiveLevel(M,BB,L.z,D,D/2+L.radial,secu,zFrom,ae,entryMode,o.brutTop,zt,moves,{travelZ:tvZ,sens:o.sens,entryR:o.entryR});
    // MINI-PASSES (retour 4/10) : après le pelage du niveau, contour des parois
    // entre ce plan et le plan du dessus : profondeurs k*h/(nb+1) sous le plan
    // du dessus (strictement entre les deux, jamais dessus), décalage radial
    // ENTIER (= marge finale de paroi — s=0 laissait le contour collé à la
    // cote théorique : gouge sur les parois inclinées, cf. A3).
    if(nb){
      const h=bandTop-L.z;
      if(h>1e-9)for(let k=1;k<=nb;k++){
        const zm=Math.round((bandTop-k*h/(nb+1))*1000)/1000;
        const s=RA.radial;
        faoRoughAdaptiveLevel(M,BB,zm,D,D/2+s,secu,Math.min(secu,bandTop),ae,entryMode,o.brutTop,zt,moves,{ringOnly:true,travelZ:tvZ,sens:o.sens,entryR:o.entryR});
      }
    }
    // FINITION DES PAROIS (8/10) : UNIQUEMENT sur `finIdx` = niveau le plus
    // PROFOND >= plancher detecte (Bas=0 descend sous la poche : le dernier du
    // plan ne la touche pas ; sans plancher utile -> dernier du plan),
    // repetee sur `finitProf` cotes vers le haut quand la dent est plus courte
    // que le mur : j=0 pile au niveau bas, ecart = (haut-bas)/profondeurs
    // cotes suivantes strictement sous `zt` (jamais sur le plan de bord, cas
    // limite de la parite). Entree/travel de chaque cote = niveau
    // STRICTEMENT au-dessus (au niveau bas = bandTop, identique a l'appel
    // unique d'avant) : zFrom=zA, travel=zA+2 comme tvZ.
    // Bande INVISIBLE du maillage (r se mesure au mur theorique) : l'anneau a
    // D/2+off l'attaque par l'exterieur, dernier au contact exact. Risque A3
    // (paroi inclinee / fraise a coin) : case off par defaut.
    if(nf&&li===finIdx){
      const zLow=L.z, zHigh=zt, range=Math.max(0,zHigh-zLow);
      const np=(range>1e-9&&isFinite(+o.finitProf))
        ?Math.max(1,Math.min(9,Math.round(+o.finitProf))):1;
      for(let j=0;j<np;j++){
        const zj=(j===0)?zLow:Math.round((zLow+range*j/np)*1000)/1000;
        let zA=null;
        for(let i=0;i<plan.length;i++)
          if(plan[i].z>zj+1e-9&&(zA===null||plan[i].z<zA))zA=plan[i].z;
        if(zA===null)zA=zt;
        const zF=Math.min(secu,zA),
          tvJ=o.remPlan?secu:Math.min(secu,zA+5); // 2026-10-08-002 : 5 mm (was 2)
        for(let k=1;k<=nf;k++){
          const off=RA.radial*(nf-k)/nf;
          faoRoughAdaptiveLevel(M,BB,zj,D,D/2+off,secu,zF,ae,entryMode,o.brutTop,zt,moves,{ringOnly:true,travelZ:tvJ,sens:o.sens,entryR:o.entryR});
        }
      }
    }
  });
  faoSliceCache=null;
  if(swapped){
    for(let i=0;i<moves.length;i++){
      const m=moves[i], x=m.x;
      m.x=m.y; m.y=x;
      if(m.arc){const ii=m.arc.i; m.arc.i=m.arc.j; m.arc.j=ii; m.arc.cw=!m.arc.cw;}
    }
  }
  return moves;
}
function faoTrochSlot(moves,xa,xb,y,z,D,aeA,yMin,yMax){
  // Trochoïde en VRAIS arcs G2/G3 le long d'un goulet : chaque boucle = 4
  // quarts à 90° (< 180°, IJK incrémental, centre = départ + IJK comme les CN),
  // émis CCW (G3). Engagement d'un seul côté, pas d'arrêt en fond de
  // rainure. Reste dans [xa,xb], Z constant. L'excursion en Y (±Rt) est
  // clampée à la bande balayée (lignes extrêmes ± aeA/2 : au-delà, on ne sait
  // pas que c'est du vide) ; sans place pour un rayon ≥ 0.5 : passe droite.
  const W=xb-xa;
  if(!(W>0.5))return;
  const Y=Math.round(y*1000)/1000;
  const edge=(isFinite(yMin)&&isFinite(yMax))
    ?Math.max(0,Math.min(y-yMin,yMax-y)+Math.max(0.5,isFinite(+aeA)&&+aeA>0?+aeA:2)*0.5)
    :1/0;
  const Rt0=Math.min(D*0.3,aeA*1.5,W/2-0.2,edge);
  if(!(Rt0>=0.5)){
    moves.push({r:0,x:Math.round(xa*1000)/1000,y:Y,z:z});
    moves.push({r:0,x:Math.round(xb*1000)/1000,y:Y,z:z});
    return;
  }
  const Rt=Math.round(Rt0*1000)/1000;
  const pitch=Math.max(0.5,Math.min(aeA,D*0.2));
  moves.push({r:0,x:Math.round((xa+Rt)*1000)/1000,y:Y,z:z});
  let cx=xa+Rt, guard=0;
  while(cx<xb-Rt-1e-9&&guard++<10000){
    const X=Math.round(cx*1000)/1000;
    const xE=Math.round((cx+Rt)*1000)/1000, xW=Math.round((cx-Rt)*1000)/1000;
    const yN=Math.round((y+Rt)*1000)/1000, yS=Math.round((y-Rt)*1000)/1000;
    // E -> N -> W -> S -> E autour de (X,Y), CCW : i,j = centre - départ.
    moves.push({r:0,x:X,y:yN,z:z,arc:{i:Math.round((X-xE)*1000)/1000,j:0,cw:false,troch:true}});
    moves.push({r:0,x:xW,y:Y,z:z,arc:{i:0,j:Math.round((Y-yN)*1000)/1000,cw:false,troch:true}});
    moves.push({r:0,x:X,y:yS,z:z,arc:{i:Math.round((X-xW)*1000)/1000,j:0,cw:false,troch:true}});
    moves.push({r:0,x:xE,y:Y,z:z,arc:{i:0,j:Math.round((Y-yS)*1000)/1000,cw:false,troch:true}});
    cx+=pitch;
  }
  moves.push({r:0,x:Math.round(xb*1000)/1000,y:Y,z:z});
}
function faoShadowPlanes(mesh,z,zt){
  // Plans Z où lire l'ombre : les Z vertex du maillage entre z et zt
  // (dédup 1 µm, cap 160 avec sous-échantillonnage régulier en repli).
  // EXACTITUDE : tout voile horizontal, si fin soit-il, a ses faces haute et
  // basse à des Z vertex — aucun ne peut se cacher entre deux plans
  // (les croisements variant linéairement, l'union des emprises est atteinte
  // aux plans vertex). Sans vertex : grille historique au pas ≤ 2 mm.
  const pls=[Math.round(z*1000)/1000];
  let zv=null;
  try{
    const zs=[];
    for(let k=0;k<mesh.v.length;k++){ const q=mesh.v[k][2]; if(isFinite(q))zs.push(q); }
    zs.sort(function(a,b){return a-b;});
    zv=[];
    for(let k=0;k<zs.length;k++)if(!zv.length||zs[k]-zv[zv.length-1]>1e-6)zv.push(zs[k]);
    if(zv.length>160){
      const thin=[zv[0]], st=(zv.length-1)/159;
      for(let k=1;k<159;k++)thin.push(zv[Math.round(k*st)]);
      thin.push(zv[zv.length-1]); zv=thin;
    }
  }catch(e){ zv=null; }
  if(zv&&zv.length){
    zv.forEach(function(zz){
      if(zz>z+1e-9&&zz<=zt+1e-9)pls.push(Math.round(zz*1000)/1000);
    });
  }else{
    const H=Math.max(0,zt-z), n=Math.max(1,Math.ceil(H/2));
    for(let k=1;k<=n;k++)pls.push(Math.round((z+H*k/n)*1000)/1000);
  }
  const seen={}, out=[];
  pls.forEach(function(zz){ const k=String(zz); if(!seen[k]){seen[k]=1;out.push(zz);} });
  return out;
}
function faoShadowIntervals(mesh,B,y,z,zt,r,aeA,planes){
  // `planes` optionnel : plans pré-calculés du niveau (partagés avec
  // l'hélice) ; sinon calcul local via faoShadowPlanes.
  // Vide à z avec BRUT RESTANT : l'outil vertical n'atteint que ce qui est
  // libre depuis le dessus — union des sections aux plans vertex entre z et
  // zt (faoShadowPlanes : aucun voile fin manqué), dilatées de r, puis
  // complément dans le brut. Les porte-à-faux sont exclus : jamais de plongée
  // sous un surplomb. Matière lue sur 3 lignes (y±aeA) : une ligne pile sur
  // une arête (epsilon scanline) verrait un vide plein large et fraiserait le
  // flanc — les voisines rattrapent le bord. Vide sur les 3 : distance à
  // l'emprise du niveau (voir plus bas).
  // L'outil peut sortir d'un rayon du brut en X : la marge/congé périphérique
  // doit être usiné (centre toléré jusqu'à B.x0-r / B.x1+r, disque tangent
  // au mur — cf. facedep=r+sortie côté facing).
  const lo=B.x0-r, hi=B.x1+r;
  const out=[];
  if(!(hi-lo>0.2))return out;
  const stepY=Math.max(0.5,isFinite(+aeA)&&+aeA>0?+aeA:2);
  const forb=[];
  let hasMat=false; // matière sur un plan/section du niveau (quel que soit y)
  let yLo=1/0, yHi=-1/0; // emprise Y de la matière entre z et zt
  let pls=null;
  const near=[]; // segs (tous plans) à portée du disque en Y : vérification
  // perpendiculaire des bouts d'intervalle (retour 6/10).
  if(Array.isArray(planes)&&planes.length){
    const seen={}, tmp=[];
    planes.forEach(function(zz){
      if(zz>=z-1e-9&&zz<=zt+1e-9){
        const q=Math.round(zz*1000)/1000, k=String(q);
        if(!seen[k]){seen[k]=1;tmp.push(q);}
      }
    });
    pls=tmp.length?tmp:faoShadowPlanes(mesh,z,zt);
  }else pls=faoShadowPlanes(mesh,z,zt);
  pls.forEach(function(zz){
    const segs=faoSliceZCached(mesh,zz);
    if(segs.length)hasMat=true;
    for(let i=0;i<segs.length;i++){
      const s=segs[i];
      if(s[1]<yLo)yLo=s[1];
      if(s[1]>yHi)yHi=s[1];
      if(s[3]<yLo)yLo=s[3];
      if(s[3]>yHi)yHi=s[3];
      if(Math.max(s[1],s[3])>=y-r-1&&Math.min(s[1],s[3])<=y+r+1)near.push(s);
    }
    [y-stepY,y,y+stepY].forEach(function(yy){
      faoScanIntervals(segs,yy).forEach(function(iv){
        const a=Math.max(lo,iv[0]-r), b=Math.min(hi,iv[1]+r);
        if(b-a>-1e-9)forb.push([a,b]);
      });
    });
  });
  if(!forb.length){
    // Ligne qui ne voit rien sur les 3 lectures :
    //  - niveau vide (brut au-dessus de la pièce) : surfaçage pleine largeur ;
    //  - matière à >= r en Y (hors emprise + outil tangent au mur) : colonne
    //    dégagée sur toute la largeur — on vide la marge/le congé, même si la
    //    ligne ne lit de la matière sur aucun plan (c'était la manchette
    //    laissée par l'ancien complément borné à la boîte) ;
    //  - sinon (matière proche non vue : arête pile sur une lecture) :
    //    conservatif, rien — jamais de plongée sous un relief.
    if(!hasMat)return [{a:lo,b:hi,wl:false,wr:false}];
    const d=y<yLo?yLo-y:(y>yHi?y-yHi:0);
    if(d>=r-1e-9)return [{a:lo,b:hi,wl:false,wr:false}];
    return out;
  }
  forb.sort(function(p,q){return p[0]-q[0];});
  const mg=[forb[0].slice()];
  for(let k=1;k<forb.length;k++){
    const last=mg[mg.length-1];
    if(forb[k][0]<=last[1]+1e-9)last[1]=Math.max(last[1],forb[k][1]);
    else mg.push(forb[k].slice());
  }
  let cur=lo;
  mg.forEach(function(f){
    if(f[0]-cur>0.2)out.push({a:cur,b:f[0],wl:cur>lo+1e-9,wr:true});
    if(f[1]>cur)cur=f[1];
  });
  if(hi-cur>0.2)out.push({a:cur,b:hi,wl:cur>lo+1e-9,wr:false});
  // Retour 6/10 — abouts à la DISTANCE PERPENDICULAIRE (laisse 0,5 partout) :
  // l'offset en X (iv±r) donne r·cosθ sur un mur incliné en plan (gouge du
  // −0,14 mesuré) et l'union des 3 lectures y±aeA recule les bouts de
  // aeA·tanθ (1ʳᵉ passe décalée, paliers, faces non usinées). On rapproche /
  // écarte chaque bout jusqu'à dist((x,y),segs)=r (bissection ±1e-3) ; bords
  // de boîte lo/hi intacts (marge/congé périphérique borné par la boîte),
  // puis fusion si deux bouts sont passés à travers un bloc devenu libre.
  if(near.length&&out.length){
    const dAt=function(px){
      let m=1/0;
      for(let i=0;i<near.length;i++){
        const s=near[i],dx=s[2]-s[0],dy=s[3]-s[1],L2=dx*dx+dy*dy;
        let t=L2>0?((px-s[0])*dx+(y-s[1])*dy)/L2:0;
        if(t<0)t=0;else if(t>1)t=1;
        const ex=s[0]+t*dx-px,ey=s[1]+t*dy-y,d2=ex*ex+ey*ey;
        if(d2<m)m=d2;
      }
      return Math.sqrt(m);
    };
    const EPS=1e-3;
    const adj=function(x,dir){ // dir=-1 : bout gauche (extérieur = x croît vers le bas) ; +1 : droit
      if(x<=lo+1e-9||x>=hi-1e-9)return x;
      const d=dAt(x);
      if(Math.abs(d-r)<=EPS)return x;
      let i,safe,unsafe;
      if(d>r){
        // Trop reculé (union y±aeA) : s'approcher jusqu'à dist = r.
        safe=x;unsafe=null;
        for(i=1;i<=64;i*=2){
          const px=x+dir*i,dd=dAt(px);
          if(dd<r-EPS){unsafe=px;break;}
          safe=px;
          if(px<=lo+1e-9||px>=hi-1e-9){unsafe=px;break;}
        }
        if(unsafe===null)return safe;
        for(i=0;i<14;i++){const m=(safe+unsafe)/2;if(dAt(m)>=r-EPS)safe=m;else unsafe=m;}
        return safe;
      }
      // Trop près (dilatation horizontale sur mur incliné) : reculer vers
      // l'intérieur de l'intervalle jusqu'à dist = r.
      unsafe=x;safe=null;
      for(i=1;i<=64;i*=2){
        const px=x-dir*i,dd=dAt(px);
        if(dd>=r-EPS){safe=px;break;}
        if(px<=lo+1e-9||px>=hi-1e-9)break;
        unsafe=px;
      }
      if(safe===null)return x;
      for(i=0;i<14;i++){const m=(safe+unsafe)/2;if(dAt(m)>=r-EPS)safe=m;else unsafe=m;}
      return safe;
    };
    for(let k=0;k<out.length;k++){
      // Clamp [lo,hi] : une bissection qui ne trouve jamais dist < r (marge
      // sans matière) ne doit pas sortir de la boîte±r.
      out[k].a=Math.max(lo,adj(out[k].a,-1));
      out[k].b=Math.min(hi,adj(out[k].b,1));
    }
    out.sort(function(p,q){return p.a-q.a;});
    const mg2=[out[0]];
    for(let k=1;k<out.length;k++){
      const last=mg2[mg2.length-1];
      if(out[k].a<last.b-1e-9)last.b=Math.max(last.b,out[k].b);
      else mg2.push(out[k]);
    }
    out.length=0;
    mg2.forEach(function(iv){if(iv.b-iv.a>0.2)out.push(iv);});
  }
  return out;
}
function faoYCands(mesh,planes,z,zt,y,r,ivs){
  // Y sûrs les plus proches d'abord pour une ligne dont le disque
  // [y-r,y+r] traverserait une paroi en Y sur ses intervalles ; [] = aucun
  // croisement. Lecture verticale exacte : croisements X des segs de la
  // section à chaque plan vertex du niveau (mêmes plans que l'ombre) aux
  // échantillons x de chaque intervalle, appariés 0-1, 2-3 (even-odd).
  // Règle : recouvrement > 1 µm — la tangence (y+r==v0 ou y-r==v1, ulps
  // compris) reste admise : lignes de marge d>=r et disques tangents.
  // Candidats par arête traversée [v0,v1] : v0-r (dessous), v1+r (dessus).
  const pls=[], seen={};
  for(let i=0;i<planes.length;i++){
    const zz=planes[i];
    if(zz>=z-1e-9&&zz<=zt+1e-9){
      const q=Math.round(zz*1000)/1000,k=String(q);
      if(!seen[k]){seen[k]=1;pls.push(q);}
    }
  }
  if(!pls.length)return [];
  const cross=[];
  for(let i=0;i<ivs.length;i++){
    const a=ivs[i].a,b=ivs[i].b,w=b-a;
    if(!(w>0.05))continue;
    const d=Math.min(1,w/8);
    const xs=[a+d,(a+b)/2,b-d];
    for(let si=0;si<xs.length;si++){
      const x=xs[si];
      for(let pi=0;pi<pls.length;pi++){
        const segs=faoSliceZCached(mesh,pls[pi]);
        const ys=[];
        let hit=null; // seg le plus proche si distance perpendiculaire < r
        for(let k=0;k<segs.length;k++){
          const s=segs[k];
          if((s[0]<x&&x<s[2])||(s[2]<x&&x<s[0])){
            const t=(x-s[0])/(s[2]-s[0]);
            ys.push(s[1]+t*(s[3]-s[1]));
          }
          if(Math.max(s[1],s[3])<y-r-1||Math.min(s[1],s[3])>y+r+1)continue;
          const dx=s[2]-s[0],dy=s[3]-s[1],L2=dx*dx+dy*dy;
          let t=L2>0?((x-s[0])*dx+(y-s[1])*dy)/L2:0;
          if(t<0)t=0;else if(t>1)t=1;
          const ex=s[0]+t*dx-x,ey=s[1]+t*dy-y;
          const dd=Math.sqrt(ex*ex+ey*ey);
          if(dd<r-1e-3&&(!hit||dd<hit.d))hit={d:dd,ny:s[1]+t*dy};
        }
        ys.sort(function(p,q){return p-q;});
        for(let k=0;k+1<ys.length;k+=2){
          const v0=ys[k],v1=ys[k+1];
          // Recouvrement > 1 µm seulement : la tangence — et les ulps du
          // calcul de v1+r — ne sont pas un croisement (candidat tangent
          // accepté au re-test, dédup au µm des jumeaux).
          const ov=Math.min(y+r,v1)-Math.max(y-r,v0);
          if(ov>1e-6)cross.push(Math.round((v0-r)*1e6)/1e6,Math.round((v1+r)*1e6)/1e6);
        }
        if(hit){
          // Retour 6/10 : mur incliné à distance perpendiculaire < r alors
          // que le recouvrement vertical est nul (r·cosθ — le gouge −0,14
          // mesuré sur les parois à ~25°). Candidat = sortir
          // perpendiculairement, du côté opposé au mur ; la descente 007
          // confirme ensuite au re-test (clean = distance ≥ r exacte).
          if(y>hit.ny)cross.push(Math.round((y+(r+0.5))*1e6)/1e6);
          else if(y<hit.ny)cross.push(Math.round((y-(r+0.5))*1e6)/1e6);
          else{cross.push(Math.round((y+(r+0.5))*1e6)/1e6,Math.round((y-(r+0.5))*1e6)/1e6);}
        }
      }
    }
  }
  if(!cross.length)return [];
  cross.sort(function(p,q){return Math.abs(p-y)-Math.abs(q-y)||p-q;});
  const out=[];
  for(let i=0;i<cross.length;i++){
    if(!out.length||out[out.length-1]!==cross[i])out.push(cross[i]);
  }
  return out;
}

/* ===== LOT A — suivi de contour : sections, offset, validation exacte =====
 Chaque passe suit l'intersection modèle/plan OFFSETÉE à la distance d
 (r = D/2 + radial au plus près de la matière) : le centre d'outil reste à
 >= d partout (jamais de gouge), les familles de passes d = r + k*aeA
 parcourent la marge jusqu'aux coins de la boite, E0 referme la limite
 extérieure (x = B.x0-r …) exactement comme le complément scanline d'avant.
  - index de segments (hash) dedup entre plans, chaînes COMPLETES par plan
    pour la parité (trous = XOR par plan, recouvrements = OR entre plans) ;
  - offset : arc de rayon d sur les angles convexes (couverture <= 1,9 :
    un miter y depasserait), miter <= 3d sur les rentrants (sinon chanfrein),
    arêtes échantillonnées a 0,25 mm (fléchisse < 0,0015 -> gouge 5,49 tenue) ;
  - validation stricte de CHAQUE point : dans la boite [B.x0-r,B.x1+r]²,
    distance a TOUTES les sections >= d-1e-6, pas dedans (parite) ;
  - morceaux valides bornés par bissection ±1e-4 (aucun abandon global),
    simplification Douglas-Peucker 0,004, grille Y (B.y0-r + k*aeA) insérée
    APRES simplification — (25,0), (25,52,5), y=-10, y=38 des tests. */
/* Index spatial DENSE (tableau plaqué, bornes connues) : ni concaténation de
   clés string « ix:iy » ni lookups sur objet — le balayage d'un carré de
   rayon d (jusqu'à 25×25 cellules pour d=49) était le 1er coût du fichier. */
function faoHashBuild(cell){ return {cell:cell>0?cell:4,a:[],x0:0,y0:0,w:0,h:0}; }
function faoHashFit(H,ix0,iy0,ix1,iy1){
  if(ix1<ix0||iy1<iy0)return;
  let x0=H.x0,y0=H.y0,w=H.w,h=H.h;
  if(!w||!h){x0=ix0;y0=iy0;w=ix1-ix0+1;h=iy1-iy0+1;}
  else{
    if(ix0<x0){w+=x0-ix0;x0=ix0;}
    if(ix1>x0+w-1)w=ix1-x0+1;
    if(iy0<y0){h+=y0-iy0;y0=iy0;}
    if(iy1>y0+h-1)h=iy1-y0+1;
  }
  if(w===H.w&&h===H.h&&x0===H.x0&&y0===H.y0)return;
  // Les anciennes cellules doivent être RECALÉES (ox,oy) : si les bornes
  // s'étendent vers la gauche ou le haut, écrire en colonne 0 déplacerait
  // toute la grille d'une case et fausserait les distances.
  const ox=H.x0-x0,oy=H.y0-y0;
  const na=new Array(w*h);
  for(let y=0;y<H.h;y++){const o=(y+oy)*w+ox,so=y*H.w;for(let x=0;x<H.w;x++)na[o+x]=H.a[so+x];}
  H.a=na;H.x0=x0;H.y0=y0;H.w=w;H.h=h;
}
function faoHashSegs(H,segs){
  const c=H.cell;
  let ix0=1/0,iy0=1/0,ix1=-1/0,iy1=-1/0;
  for(let i=0;i<segs.length;i++){
    const s=segs[i];
    const a=Math.floor(Math.min(s[0],s[2])/c),b=Math.floor(Math.max(s[0],s[2])/c);
    const d=Math.floor(Math.min(s[1],s[3])/c),e=Math.floor(Math.max(s[1],s[3])/c);
    if(a<ix0)ix0=a; if(b>ix1)ix1=b; if(d<iy0)iy0=d; if(e>iy1)iy1=e;
  }
  if(ix1<-1/0)return H;
  faoHashFit(H,ix0,iy0,ix1,iy1);
  const w=H.w;
  for(let i=0;i<segs.length;i++){
    const s=segs[i];
    const ix0=Math.floor(Math.min(s[0],s[2])/c),ix1=Math.floor(Math.max(s[0],s[2])/c);
    const iy0=Math.floor(Math.min(s[1],s[3])/c),iy1=Math.floor(Math.max(s[1],s[3])/c);
    for(let iy=iy0;iy<=iy1;iy++){const o=(iy-H.y0)*w-H.x0;
      for(let ix=ix0;ix<=ix1;ix++){
        const p=o+ix; let a=H.a[p]; if(!a)a=H.a[p]=[]; a.push(s);
      }}
  }
  return H;
}
function faoDistXY(x,y,segs){
  let best=1/0;
  for(let i=0;i<segs.length;i++){
    const s=segs[i],dx=s[2]-s[0],dy=s[3]-s[1],L2=dx*dx+dy*dy;
    let t=L2>0?((x-s[0])*dx+(y-s[1])*dy)/L2:0;
    if(t<0)t=0;else if(t>1)t=1;
    const ex=s[0]+t*dx-x,ey=s[1]+t*dy-y,d2=ex*ex+ey*ey;
    if(d2<best)best=d2;
  }
  return best===1/0?1/0:Math.sqrt(best);
}
function faoDistSeg(H,x,y,dMax,tMax){
  // Distance au plus proche segment dans le carre [x,y]±dMax ; Infinity si rien
  // a portee — suffisant pour tout test « < seuil » avec seuil <= dMax (aucun
  // segment a portee = >= dMax >= seuil). `tMax` (optionnel) autorise une
  // sortie des que best < tMax^2 : le booléen du test est alors définitif.
  const c=H.cell,a=H.a,W=H.w,Hh=H.h;
  if(!W||!Hh)return 1/0;
  let ix0=Math.floor((x-dMax)/c),ix1=Math.floor((x+dMax)/c);
  let iy0=Math.floor((y-dMax)/c),iy1=Math.floor((y+dMax)/c);
  if(ix0<H.x0)ix0=H.x0; if(ix1>H.x0+W-1)ix1=H.x0+W-1;
  if(iy0<H.y0)iy0=H.y0; if(iy1>H.y0+Hh-1)iy1=H.y0+Hh-1;
  if(ix0>ix1||iy0>iy1)return 1/0;
  const lim=dMax*dMax;
  // tMax absent/inutilisable : -1 (best >= 0 toujours) = aucune sortie
  // anticipée. Piège : 1/0 rendrait `best<tm` vrai dès le 1er segment.
  const tm=(tMax===undefined||!(tMax<dMax))?-1:tMax*tMax;
  let best=1/0;
  for(let iy=iy0;iy<=iy1;iy++){
    const ro=(iy-H.y0)*W-H.x0;
    for(let ix=ix0;ix<=ix1;ix++){
      const arr=a[ro+ix]; if(!arr)continue;
      for(let k=0;k<arr.length;k++){
        const s=arr[k],ax=s[0],ay=s[1],bx=s[2],by=s[3];
        // rejet AABB (borne inferieure de la distance) : bien moins cher que
        // la projection sur le segment, et exact pour un seuil <= dMax.
        const x0=ax<bx?ax:bx,x1=ax<bx?bx:ax,y0=ay<by?ay:by,y1=ay<by?by:ay;
        const qx=x<x0?x0-x:(x>x1?x-x1:0),qy=y<y0?y0-y:(y>y1?y-y1:0);
        const cap=best<lim?best:lim;
        if(qx*qx+qy*qy>=cap)continue;
        const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;
        let t=L2>0?((x-ax)*dx+(y-ay)*dy)/L2:0;
        if(t<0)t=0;else if(t>1)t=1;
        const ex=ax+t*dx-x,ey=ay+t*dy-y,d2=ex*ex+ey*ey;
        if(d2<best){
          best=d2;
          if(best<=1e-18)return 0;
          if(best<tm)return Math.sqrt(best);
        }
      }
    }
  }
  return best===1/0?1/0:Math.sqrt(best);
}
function faoPointsKey(pts){
  const a=[];
  for(let i=0;i<pts.length;i++)a.push(Math.round(pts[i][0]*1000)+','+Math.round(pts[i][1]*1000));
  a.sort();
  return a.join(';');
}
function faoChainsClosed(segs){
  // Sections [x1,y1,x2,y2] -> chaînes FERMÉES {pts,bb} (fermeture forcée).
  const raw=faoChainSegs(segs.map(function(s){
    return [{p:[s[0],s[1],0]},{p:[s[2],s[3],0]}];
  }),1e-4);
  const out=[];
  raw.forEach(function(ch){
    const pts=[];
    ch.forEach(function(q){
      const p=q.p;
      if(!pts.length||Math.abs(pts[pts.length-1][0]-p[0])>1e-9||Math.abs(pts[pts.length-1][1]-p[1])>1e-9)
        pts.push([p[0],p[1]]);
    });
    while(pts.length>1&&Math.abs(pts[0][0]-pts[pts.length-1][0])<1e-9&&Math.abs(pts[0][1]-pts[pts.length-1][1])<1e-9)
      pts.pop();
    if(pts.length<3)return;
    pts.push([pts[0][0],pts[0][1]]);
    const bb=faoPtsBB(pts);
    out.push({pts:pts,bb:bb});
  });
  return out;
}
function faoPtsBB(pts){
  const bb=[1/0,1/0,-1/0,-1/0];
  for(let i=0;i<pts.length;i++){
    if(pts[i][0]<bb[0])bb[0]=pts[i][0];
    if(pts[i][1]<bb[1])bb[1]=pts[i][1];
    if(pts[i][0]>bb[2])bb[2]=pts[i][0];
    if(pts[i][1]>bb[3])bb[3]=pts[i][1];
  }
  return bb;
}
function faoShadowShape(mesh,planes,B,r,gstep){
  // Shape du niveau : sections par plan (parité), index global dedup (distance),
  // chaînes uniques (offset), boite de validation [B.*-r,B.*+r], pas de grille.
  const S={pl:[],hash:faoHashBuild(4),rect:[B.x0-r,B.y0-r,B.x1+r,B.y1+r],
    chains:[],keys:{},gstep:gstep>0?gstep:2,segs:[]};
  const seen={};
  planes.forEach(function(zz){
    const segs=faoSliceZCached(mesh,Math.round(zz*1000)/1000);
    if(!segs.length)return;
    const chains=faoChainsClosed(segs);
    if(!chains.length)return;
    const bb=[1/0,1/0,-1/0,-1/0];
    chains.forEach(function(ch){
      if(ch.bb[0]<bb[0])bb[0]=ch.bb[0];
      if(ch.bb[1]<bb[1])bb[1]=ch.bb[1];
      if(ch.bb[2]>bb[2])bb[2]=ch.bb[2];
      if(ch.bb[3]>bb[3])bb[3]=ch.bb[3];
      const k=faoPointsKey(ch.pts.slice(0,ch.pts.length-1));
      if(!S.keys[k]){S.keys[k]=1;S.chains.push(ch);}
    });
    S.pl.push({chains:chains,bb:bb});
    const hs=[];
    segs.forEach(function(s){
      const k=[Math.round(Math.min(s[0],s[2])*1e4)/1e4,Math.round(Math.min(s[1],s[3])*1e4)/1e4,
        Math.round(Math.max(s[0],s[2])*1e4)/1e4,Math.round(Math.max(s[1],s[3])*1e4)/1e4].join(',');
      if(seen[k])return;
      seen[k]=1;
      S.segs.push(s);
      hs.push(s);
    });
    if(hs.length)faoHashSegs(S.hash,hs);
  });
  return S;
}
/* Index Y par tranches (pas 1 mm) : la parité rayon +X ne dépend que des
   arêtes dont l'échantillon Y est inclus dans [min[,max[ ; balayer toute la
   chaîne (2 000 arêtes) 4,4 M de fois coûtait 89 s. Les tranches ne sont
   qu'une CANDIDATURE : la condition exacte est re-testée arête par arête. */
function faoChainYB(ch){
  if(ch.yb)return ch.yb;
  const step=1,pts=ch.pts,y0=ch.bb[1],y1=ch.bb[3];
  const n=Math.max(1,Math.ceil((y1-y0)/step)+1);
  const rows=new Array(n);
  for(let i=0;i+1<pts.length;i++){
    const a=pts[i][1],b=pts[i+1][1];
    if(a===b)continue;
    let i0=Math.floor((Math.min(a,b)-y0)/step),i1=Math.floor((Math.max(a,b)-y0)/step);
    if(i0<0)i0=0; else if(i0>n-1)i0=n-1;
    if(i1<0)i1=0; else if(i1>n-1)i1=n-1;
    for(let k=i0;k<=i1;k++){let arr=rows[k];if(!arr)rows[k]=arr=[];arr.push(i);}
  }
  ch.yb={y0:y0,step:step,rows:rows,n:n};
  return ch.yb;
}
function faoChainParity(ch,x,y){
  // Parité impair (rayon +X) de la chaîne fermée — un seul croisement => dedans.
  if(y<ch.bb[1]||y>ch.bb[3])return 0;
  const yb=faoChainYB(ch);
  let b=Math.floor((y-yb.y0)/yb.step);
  if(b<0)b=0; else if(b>=yb.n)b=yb.n-1;
  const row=yb.rows[b];
  if(!row)return 0;
  const pts=ch.pts;
  let c=0;
  for(let t=0;t<row.length;t++){
    const i=row[t],a=pts[i],b2=pts[i+1];
    if((a[1]>y)!==(b2[1]>y)){
      const tt=(y-a[1])/(b2[1]-a[1]);
      if(a[0]+tt*(b2[0]-a[0])>x)c++;
    }
  }
  return c&1;
}
/* Index Y fusionné PAR PLAN (pas 0,5 mm) : la parité du plan est le XOR des
   parités de toutes ses chaînes = parité du TOTAL des croisements (algèbre
   XOR), donc une seule passe sur les arêtes de la tranche remplace une passe
   par chaîne — exact, la condition d'arête est re-testée mot pour mot. */
function faoPlaneYB(P){
  if(P.yb)return P.yb;
  const step=0.5,chs=P.chains,E=[];
  let y0=1/0,y1=-1/0;
  for(let k=0;k<chs.length;k++){
    const pts=chs[k].pts;
    for(let i=0;i+1<pts.length;i++){
      const a=pts[i],b=pts[i+1];
      E.push(a[0],a[1],b[0],b[1]);
      const ya=a[1],yb2=b[1];
      if(ya<y0)y0=ya; if(yb2<y0)y0=yb2;
      if(ya>y1)y1=ya; if(yb2>y1)y1=yb2;
    }
  }
  let rows=[],n=1;
  if(E.length&&y1>=y0){
    n=Math.max(1,Math.ceil((y1-y0)/step)+1);
    rows=new Array(n);
    for(let i=0;i<E.length;i+=4){
      const ya=E[i+1],yb2=E[i+3];
      if(ya===yb2)continue;
      let i0=Math.floor((Math.min(ya,yb2)-y0)/step),i1=Math.floor((Math.max(ya,yb2)-y0)/step);
      if(i0<0)i0=0; else if(i0>n-1)i0=n-1;
      if(i1<0)i1=0; else if(i1>n-1)i1=n-1;
      for(let t=i0;t<=i1;t++){let arr=rows[t];if(!arr)rows[t]=arr=[];arr.push(i);}
    }
  }
  P.yb={y0:y0,step:step,rows:rows,n:n,E:E};
  return P.yb;
}
function faoShapeInside(S,x,y){
  // OR des parités XOR par plan : trous gérés au plan, union entre plans
  // (matiere au-dessus = colonne interdite, meme regle que l'ombre).
  for(let i=0;i<S.pl.length;i++){
    const P=S.pl[i];
    if(y<P.bb[1]||y>P.bb[3])continue;
    const yb=faoPlaneYB(P);
    if(!yb.E.length)continue;
    let b=Math.floor((y-yb.y0)/yb.step);
    if(b<0)b=0; else if(b>=yb.n)b=yb.n-1;
    const row=yb.rows[b];
    if(!row)continue;
    const E=yb.E;
    let c=0;
    for(let t=0;t<row.length;t++){
      const i=row[t],ax=E[i],ay=E[i+1],bx=E[i+2],by=E[i+3];
      if((ay>y)!==(by>y)){
        const tt=(y-ay)/(by-ay);
        if(ax+tt*(bx-ax)>x)c^=1;
      }
    }
    if(c)return true;
  }
  return false;
}
function faoShapeValid(S,x,y,d){
  const R=S.rect;
  if(x<R[0]-1e-9||y<R[1]-1e-9||x>R[2]+1e-9||y>R[3]+1e-9)return false;
  if(faoDistSeg(S.hash,x,y,d,d-1e-6)<d-1e-6)return false;
  if(faoShapeInside(S,x,y))return false;
  return true;
}
function faoChainSide(ch,S){
  // Sens de l'offset : probe d'interiorite a ±1e-3 de l'arête (cote NON
  // matiere = sortant) — indispensable pour les chaines de trous (offset DANS
  // le trou). Repli : vote multi-arêtes, puis shoelace.
  const pts=ch.pts,n=pts.length-1;
  if(n<1)return 1;
  const order=[];
  for(let i=0;i<n;i++){
    const dx=pts[i+1][0]-pts[i][0],dy=pts[i+1][1]-pts[i][1];
    order.push([dx*dx+dy*dy,i]);
  }
  order.sort(function(a,b){return b[0]-a[0];});
  let vr=0,vl=0;
  for(let k=0;k<Math.min(5,order.length);k++){
    const i=order[k][1];
    let ux=pts[i+1][0]-pts[i][0],uy=pts[i+1][1]-pts[i][1];
    const L=Math.hypot(ux,uy); if(!(L>1e-9))continue;
    ux/=L;uy/=L;
    const mx=(pts[i][0]+pts[i+1][0])/2,my=(pts[i][1]+pts[i+1][1])/2;
    const nx=uy,ny=-ux; // perp droite
    if(faoShapeInside(S,mx+nx*1e-3,my+ny*1e-3))vr++;
    else if(faoShapeInside(S,mx-nx*1e-3,my-ny*1e-3))vl++;
  }
  if(vr>vl)return -1;
  if(vl>vr)return 1;
  let a2=0;
  for(let i=0;i<n;i++)a2+=pts[i][0]*pts[i+1][1]-pts[i+1][0]*pts[i][1];
  return a2>0?1:-1;
}
function faoOffsetChain(pts,d,side){
  // Offset fermé a distance d du cote « sortant » (side=+1 : normale perp
  // droite de la marche). Convexe -> arc (pas angulaire <= 0.25/d, cap 0.2) ;
  // rentrant -> miter (intersection des deux droites offset) si <= 3d, sinon
  // chanfrein tronqué a 3d. Retourne le polygone CYCLIQUE (dernier point
  // adjacent au premier), ou null si degenere.
  const n=pts.length-1;
  if(n<3||!(d>0))return null;
  const dir=[],nor=[];
  for(let i=0;i<n;i++){
    let dx=pts[i+1][0]-pts[i][0],dy=pts[i+1][1]-pts[i][1];
    const L=Math.hypot(dx,dy);
    if(!(L>1e-9))return null;
    dx/=L;dy/=L;
    dir.push([dx,dy]);
    nor.push(side>0?[dy,-dx]:[-dy,dx]);
  }
  const cr2=function(a,b){return a[0]*b[1]-a[1]*b[0];};
  const V=[];
  for(let i=0;i<n;i++){
    const ip=(i-1+n)%n,u=dir[ip],v=dir[i],P=pts[i];
    const cr=cr2(u,v);
    const Sp=[P[0]+d*nor[ip][0],P[1]+d*nor[ip][1]];
    const Ep=[P[0]+d*nor[i][0],P[1]+d*nor[i][1]];
    const it={u:u,v:v,P:P,cr:cr,S:Sp,E:Ep,conv:cr*side>1e-12,list:null,entry:null,exit:null};
    if(it.conv){
      const list=[[Sp[0],Sp[1]]];
      const a0=Math.atan2(Sp[1]-P[1],Sp[0]-P[0]);
      let a1=Math.atan2(Ep[1]-P[1],Ep[0]-P[0]);
      let da=a1-a0;
      while(da<=-Math.PI)da+=2*Math.PI;
      while(da>Math.PI)da-=2*Math.PI;
      if(Math.abs(da)>1e-12){
        const stp=Math.min(0.2,0.25/d);
        const k=Math.max(1,Math.ceil(Math.abs(da)/stp));
        for(let t=1;t<k;t++){
          const a=a0+da*t/k;
          list.push([P[0]+d*Math.cos(a),P[1]+d*Math.sin(a)]);
        }
      }
      list.push([Ep[0],Ep[1]]);
      it.list=list;
      it.entry=list[0];
      it.exit=list[list.length-1];
    }else if(Math.abs(cr)>1e-9){
      const t=cr2([Ep[0]-Sp[0],Ep[1]-Sp[1]],v)/cr;
      const M=[Sp[0]+t*u[0],Sp[1]+t*u[1]];
      const dm=Math.hypot(M[0]-P[0],M[1]-P[1]);
      if(dm<=3*d){
        it.list=[[M[0],M[1]]];
        it.entry=it.list[0];
        it.exit=it.list[0];
      }else{
        const lim=d*Math.sqrt(8); // distance ligne offset telle que |A-P| = 3d
        const sgn=t>=0?1:-1;
        const A=[Sp[0]+sgn*lim*u[0],Sp[1]+sgn*lim*u[1]];
        const s2=cr2([Ep[0]-Sp[0],Ep[1]-Sp[1]],u)/cr;
        const sgn2=s2>=0?1:-1;
        const C=[Ep[0]+sgn2*lim*v[0],Ep[1]+sgn2*lim*v[1]];
        it.list=[[A[0],A[1]],[C[0],C[1]]];
        it.entry=it.list[0];
        it.exit=it.list[1];
      }
    }else{
      it.list=[[Sp[0],Sp[1]],[Ep[0],Ep[1]]];
      it.entry=it.list[0];
      it.exit=it.list[1];
    }
    V.push(it);
  }
  const out=[];
  const put=function(x,y){
    if(out.length&&Math.abs(out[out.length-1][0]-x)<1e-9&&Math.abs(out[out.length-1][1]-y)<1e-9)return;
    out.push([x,y]);
  };
  const sample=function(A,B){
    const dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy);
    if(!(L>1e-9))return;
    const k=Math.ceil(L/0.25);
    for(let t=1;t<k;t++)put(A[0]+dx*t/k,A[1]+dy*t/k);
  };
  for(let i=0;i<n;i++){
    const it=V[i];
    for(let k=0;k<it.list.length;k++)put(it.list[k][0],it.list[k][1]);
    const nx=V[(i+1)%n];
    sample(it.exit,nx.entry);
  }
  return out.length>=3?out:null;
}
function faoBisectValid(a,b,isValid){
  // Frontiere valid/invalide : renvoie TOUJOURS un point du cote VALIDE.
  const vA=isValid(a),vB=isValid(b);
  if(vA&&vB)return b;
  if(!vA&&!vB)return null;
  let A=vA?b:a, B=vA?a:b; // A = cote invalide, B = cote valide
  for(let i=0;i<40&&Math.hypot(B[0]-A[0],B[1]-A[1])>1e-4;i++){
    const m=[(A[0]+B[0])/2,(A[1]+B[1])/2];
    if(isValid(m))B=m;else A=m;
  }
  return B;
}
function faoSplitValid(pts,isValid){
  // Polygone cyclique -> morceaux valides, bornes affinées par bissection
  // (±1e-4) : aucun morceau n'est abandonné en bloc.
  const n=pts.length;
  if(n<3)return [];
  const v=new Array(n);
  let all=true;
  for(let i=0;i<n;i++){v[i]=!!isValid(pts[i]);if(!v[i])all=false;}
  if(all)return [pts];
  let k=0;
  while(k<n&&v[k])k++;
  if(k>=n)return [];
  const L=n,rot=new Array(L),rv=new Array(L);
  for(let i=0;i<L;i++){rot[i]=pts[(k+i)%L];rv[i]=v[(k+i)%L];}
  const out=[];
  let i=1;
  while(i<L){
    if(!rv[i]){i++;continue;}
    let j=i;
    while(j+1<L&&rv[j+1])j++;
    const b0=faoBisectValid(rot[i-1],rot[i],isValid);
    const b1=faoBisectValid(rot[j],rot[(j+1)%L],isValid);
    const run=[];
    if(b0)run.push(b0);
    for(let t=i;t<=j;t++)run.push(rot[t]);
    if(b1)run.push(b1);
    if(run.length>=2)out.push(run);
    i=j+2;
  }
  return out;
}
function faoSimplifyPts(pts,tol){
  // Douglas-Peucker iteratif : ne garde QUE des points d'origine (distances
  // deja validées intacts), ecart max tol.
  const n=pts.length;
  if(n<3)return pts.slice();
  const keep=new Array(n).fill(false);
  keep[0]=keep[n-1]=true;
  const st=[[0,n-1]];
  while(st.length){
    const seg=st.pop(),a=seg[0],b=seg[1];
    if(b-a<2)continue;
    const A=pts[a],B=pts[b];
    const dx=B[0]-A[0],dy=B[1]-A[1],L2=dx*dx+dy*dy;
    let md=-1,mi=-1;
    for(let q=a+1;q<b;q++){
      const P=pts[q];
      let dd;
      if(L2<1e-18)dd=Math.hypot(P[0]-A[0],P[1]-A[1]);
      else{
        let t=((P[0]-A[0])*dx+(P[1]-A[1])*dy)/L2;
        if(t<0)t=0;else if(t>1)t=1;
        dd=Math.hypot(P[0]-(A[0]+dx*t),P[1]-(A[1]+dy*t));
      }
      if(dd>md){md=dd;mi=q;}
    }
    if(md>tol){keep[mi]=true;st.push([a,mi],[mi,b]);}
  }
  const out=[];
  for(let q=0;q<n;q++)if(keep[q])out.push(pts[q]);
  return out;
}
function faoInsertGridY(pts,y0,step,closed,isValid){
  // Grille Y (y0 + k*step) : insertion APRÈS simplification — (25,0),
  // (25,52,5), y=-10, y=38 des tests sortent la ligne verticale exacte.
  if(!(step>0)||pts.length<2)return pts;
  const out=[],n=pts.length;
  const segs=closed?n:n-1;
  for(let i=0;i<segs;i++){
    const A=pts[i],B=pts[(i+1)%n];
    out.push(A);
    const dy=B[1]-A[1];
    if(Math.abs(dy)<1e-12)continue;
    const ylo=Math.min(A[1],B[1]),yhi=Math.max(A[1],B[1]);
    const k0=Math.ceil((ylo-y0)/step-1e-9),k1=Math.floor((yhi-y0)/step+1e-9);
    // Ordre du TRAJET : croissant si le segment monte, decroissant s'il descend
    // (sinon la grille intervertit les points et dessine un zigzag).
    const g0=dy>0?k0:k1, g1=dy>0?k1:k0, gs=dy>0?1:-1;
    for(let g=g0;gs>0?g<=g1:g>=g1;g+=gs){
      const yG=y0+g*step;
      if(yG<=ylo+1e-9||yG>=yhi-1e-9)continue;
      const t=(yG-A[1])/dy;
      const p=[A[0]+t*(B[0]-A[0]),yG];
      if(isValid&&!isValid(p))continue;
      out.push(p);
    }
  }
  if(!closed)out.push(pts[n-1]);
  return out;
}
function faoEmitRuns(S,raw,valid,out){
  // Valide -> morceaux (bissection) -> simplifie -> grille Y -> dedup/drop.
  if(!out.dedup)out.dedup={};
  const runs=faoSplitValid(raw,valid);
  for(let ri=0;ri<runs.length;ri++){
    const run=runs[ri];
    if(run.length<2)continue;
    const simp=faoSimplifyPts(run,0.004);
    const closed=(run===raw);
    const grd=faoInsertGridY(simp,S.rect[1],S.gstep,closed,valid);
    if(grd.length<2)continue;
    const bb=faoPtsBB(grd);
    if(Math.max(bb[2]-bb[0],bb[3]-bb[1])<0.1)continue;
    const k=faoPointsKey(grd);
    if(out.dedup[k])continue;
    out.dedup[k]=1;
    out.push({pts:grd,closed:closed,bb:bb});
  }
  return out;
}
function faoRectRaw(x0,y0,x1,y1){
  // Rectangle échantillonné a 0,25 mm (E0/E-k : memes regles de validation).
  const c=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
  const raw=[];
  for(let i=0;i<4;i++){
    const A=c[i],B=c[(i+1)%4];
    const L=Math.hypot(B[0]-A[0],B[1]-A[1]);
    const k=Math.max(1,Math.ceil(L/0.25));
    for(let t=0;t<k;t++){
      const p=[A[0]+(B[0]-A[0])*t/k,A[1]+(B[1]-A[1])*t/k];
      if(!raw.length||Math.abs(raw[raw.length-1][0]-p[0])>1e-9||Math.abs(raw[raw.length-1][1]-p[1])>1e-9)
        raw.push(p);
    }
  }
  return raw;
}
function faoOffsetRuns(S,d){
  // Toutes les chaines du niveau offsetées a d -> morceaux valides.
  const out=[];
  const valid=function(p){return faoShapeValid(S,p[0],p[1],d);};
  for(let ci=0;ci<S.chains.length;ci++){
    const ch=S.chains[ci];
    if(!ch.side)ch.side=faoChainSide(ch,S);
    const raw=faoOffsetChain(ch.pts,d,ch.side);
    if(!raw)continue;
    faoEmitRuns(S,raw,valid,out);
  }
  return out;
}
function faoRectRuns(S,inset,d){
  // E0 (inset=0) : le tour de la boite de validation, valide a d (= r).
  // E-k (inset=k*aeA) : cadres imbriqués pour les niveaux vides (surfaçage).
  const R=S.rect;
  const x0=R[0]+inset,x1=R[2]-inset,y0=R[1]+inset,y1=R[3]-inset;
  if(!(x1-x0>0.2&&y1-y0>0.2))return [];
  const out=[];
  const valid=function(p){return faoShapeValid(S,p[0],p[1],d);};
  faoEmitRuns(S,faoRectRaw(x0,y0,x1,y1),valid,out);
  return out;
}

function faoRoughAdaptiveLevel(mesh,B,z,D,r,secu,zFrom,ae,entryMode,brutTop,zt,moves,opt){
  // Une tranche façon Adaptive : pelage au petit pas (aeA ≤ 0.25*D) dans le
  // vide RESTANT (ombre des niveaux supérieurs), entrée hélice multi-spots /
  // rampe X ou Y / micro-hélice, liaisons G1 sans retrait dans la région,
  // trochoïdes G2/G3 dans les goulets (largeur < 2.5*D).
  const segs=faoSliceZCached(mesh,z);
  const top=isFinite(+zt)?+zt:z;
  const aeA=Math.max(0.5,Math.min(isFinite(+ae)&&+ae>0?+ae:D*0.2,D*0.25));
  // Plans partagés du niveau : ombre + colonnes d'hélice lisent les mêmes
  // Z vertex (aucun voile fin manqué, slices en cache).
  const planes=faoShadowPlanes(mesh,z,Math.max(top,isFinite(+brutTop)?+brutTop:z));
  // Entrée : le corps de l'outil monte jusqu'au brut — le disque se vérifie
  // sur TOUTES les sections du niveau (l'ombre), pas seulement à z : un
  // voile fin au-dessus n'apparaît pas dans la slice à z et l'hélice le
  // traversait en descendant.
  let segsAll=segs.slice();
  for(let pi=0;pi<planes.length;pi++){
    if(planes[pi]>z+1e-9)segsAll=segsAll.concat(faoSliceZCached(mesh,planes[pi]));
  }
  const ys=[]; let y=B.y0-r, g=0;
  while(y<=B.y1+r+1e-9&&g++<100000){
    // lignes purement hors brut (disque tangent sans coupe) : ignorees
    if(!(y+r<=B.y0+1e-9||y-r>=B.y1-1e-9))ys.push(y);
    y+=aeA;
  }
  if(!ys.length)return;
  const lines=[];
  const seenY={};
  ys.forEach(function(yy){
    let ivs=faoShadowIntervals(mesh,B,yy,z,top,r,aeA,planes);
    if(!ivs.length)return;
    // Bornage exact au RAYON sur les murs en Y (retour 4/10) : l'existence
    // lisait y±aeA (aeA<r) et laissait passer jusqu'à mur∓aeA au lieu de
    // mur∓r (gradins sur les faces horizontales). Si le disque traverse une
    // paroi, la ligne est bornée au voisin sûr (paroi∓r) au lieu d'être
    // laissée ; sans voisin sûr elle est abandonnée — jamais de coupe sous
    // paroi. Dédup après clamp + tri (le clamp peut réordonner).
    let yc=yy;
    const c0=faoYCands(mesh,planes,z,top,yy,r,ivs);
    if(c0.length){
      // Descente corrigée (ROUGE 026) : la liste des croisements
      // restants pouvait avancer de quelques µm par palier (paroi vue
      // différente à chaque ré-échantillon x) et la garde 12 abandonnait la
      // ligne → rayé non usiné le long du mur. On prend le sens du premier
      // candidat sûr (le plus proche), on remonte la grille aeA jusqu'au
      // premier point PROPRE (aucun croisement sur son ombre), puis
      // bissection entre le dernier point sale et le premier propre : borne
      // exacte (±1e-4), convergence garantie, garde-fou inchangé (ligne
      // réellement inaccessible → abandon). Candidat purement hors brut
      // ignoré (même règle que la boucle ys) : jamais de ligne inventée
      // au-delà de la marge.
      const can=[];
      for(let ci=0;ci<c0.length;ci++){
        const t=c0[ci];
        if(t+r<=B.y0+1e-9||t-r>=B.y1-1e-9)continue;
        can.push(t);
      }
      let ok=null;
      if(can.length){
        const up=can[0]>yy;
        for(let pass=0;pass<2&&ok===null;pass++){
          const dir=pass? !up:up;
          let sale=yy, propre=null;
          for(let k=1;k<100000;k++){
            const y=dir? yy+k*aeA : yy-k*aeA;
            if(y+r<=B.y0+1e-9||y-r>=B.y1-1e-9)break;
            const iv2=faoShadowIntervals(mesh,B,y,z,top,r,aeA,planes);
            if(iv2.length&&!faoYCands(mesh,planes,z,top,y,r,iv2).length){propre=y;break;}
            sale=y;
          }
          if(propre===null)continue;
          for(let i=0;i<40&&Math.abs(propre-sale)>1e-4;i++){
            const m=(sale+propre)/2;
            const iv2=faoShadowIntervals(mesh,B,m,z,top,r,aeA,planes);
            if(iv2.length&&!faoYCands(mesh,planes,z,top,m,r,iv2).length)propre=m;
            else sale=m;
          }
          ok=propre;
        }
      }
      if(ok===null)return;
      const ivOk=faoShadowIntervals(mesh,B,ok,z,top,r,aeA,planes);
      if(!ivOk.length)return;
      ivs=ivOk;
      yc=ok;
    }
    if(seenY[yc])return;
    seenY[yy]=1; seenY[yc]=1;
    lines.push({y:yc,ivs:ivs});
  });
  lines.sort(function(p,q){return p.y-q.y;});
  if(!lines.length)return;
  const regs=faoRoughRegions(lines);
  // --- SUIVI DE CONTOUR (lot B) : les passes sont les chaines du niveau
  // offsetees a d = r + k*aeA + les cadres E-k de la boite. Le centre d'outil
  // reste donc a >= d de la MATIERE partout (aucun gouge), la marge est
  // parcourue jusqu'aux coins, les goulets (largeur < 2.5*D) prennent des
  // trochoïdes G2/G3, les morceaux sont chaines par un tour greedy
  // stay-down (liaison G1 sûre = coupe directe, sinon retrait vertical).
  const rnd=function(v){return Math.round(v*1000)/1000;};
  const isRing=!!(opt&&opt.ringOnly);
  const tz=(opt&&isFinite(+opt.travelZ))?Math.min(secu,+opt.travelZ):null;
  const zTopSafe=Math.max(top,isFinite(+brutTop)?+brutTop:top);
  const pathOK=function(p,q){
    if(tz&&tz>=zTopSafe-1e-9)return true;
    const dx=q.x-p.x,dy=q.y-p.y,L=Math.sqrt(dx*dx+dy*dy);
    const n=Math.max(1,Math.ceil(L));
    const rr=Math.max(0.01,r-1e-3);
    for(let i=0;i<=n;i++){
      const t=i/n;
      if(!faoDiscClear(segsAll,p.x+dx*t,p.y+dy*t,0,rr))return false;
    }
    return true;
  };
  const gotoXY=function(px,py){
    px=rnd(px); py=rnd(py);
    if(!moves.length){moves.push({r:1,x:px,y:py,z:secu});return secu;}
    const prev=moves[moves.length-1];
    const zGo=(tz&&pathOK(prev,{x:px,y:py}))?tz:secu;
    if(Math.abs(prev.z-zGo)>1e-9)moves.push({r:1,x:prev.x,y:prev.y,z:zGo});
    moves.push({r:1,x:px,y:py,z:zGo});
    return zGo;
  };
  const sortie=function(p){
    moves.push({r:1,x:p.x,y:p.y,z:tz||secu});
  };
  // Coupe G1 sûre : centre a >= r-0.005 de la matiere sur tout le trajet
  // (marge = tolerance des tests de gouge, echantillon <= 0.25 mm).
  const rrSafe=Math.max(0.01,r-0.005);
  const segClear=function(ax,ay,bx,by){
    const dx=bx-ax,dy=by-ay,L=Math.sqrt(dx*dx+dy*dy);
    const n=Math.max(1,Math.ceil(L/0.25));
    for(let i=0;i<=n;i++){
      const t=i/n;
      if(!faoDiscClear(segsAll,ax+dx*t,ay+dy*t,0,rrSafe))return false;
    }
    return true;
  };
  // Liaison vers un morceau : translation en l'air (l'appelant plonge ensuite,
  // disque contrôlé par l'appelant) — SAUF liaison courte (< faoRapideMin) et
  // sûre : G1 à la cote, aucun lever (renvoie false, l'appelant émet le G1).
  // 10-09-002 : on ne saute en rapide que si le trajet vaut le coup (>= 50 mm).
  const linkTo=function(px,py){
    const prev=moves.length?moves[moves.length-1]:null;
    const dx=px-(prev?prev.x:0), dy=py-(prev?prev.y:0);
    if(prev&&!prev.r&&Math.abs(prev.z-z)<1e-9&&
       dx*dx+dy*dy<faoRapideMin*faoRapideMin&&
       segClear(prev.x,prev.y,px,py))return false;
    gotoXY(px,py);
    return true;
  };
  const pushCut=function(x,y){
    const nx=rnd(x),ny=rnd(y),prev=moves[moves.length-1];
    if(prev&&!prev.r&&Math.abs(prev.x-nx)<1e-9&&Math.abs(prev.y-ny)<1e-9)return;
    moves.push({r:0,x:nx,y:ny,z:z});
  };
  // --- passes : chaines offsetees + cadres imbriques (E0/E-k)
  const S=faoShadowShape(mesh,planes,B,r,aeA);
  // 008 : bbox 2D de la pièce — ancre d'arc hors silhouette = pas de hélice
  // (les chaînes du cadre E0 en marge entreraient par un ressort dans l'air).
  const mBB=[1/0,1/0,-1/0,-1/0];
  for(let vi=0;vi<mesh.v.length;vi++){const vv=mesh.v[vi];
    if(vv[0]<mBB[0])mBB[0]=vv[0]; if(vv[1]<mBB[1])mBB[1]=vv[1];
    if(vv[0]>mBB[2])mBB[2]=vv[0]; if(vv[1]>mBB[3])mBB[3]=vv[1];}
  const insideSil=function(x,y){return x>=mBB[0]-1e-9&&x<=mBB[2]+1e-9&&y>=mBB[1]-1e-9&&y<=mBB[3]+1e-9;};
  const chunks=[];
  // Chaque morceau porte son k de priorité : 0 = bords (mur, marge, cadre
  // E0, goulet), croissant = vers l'intérieur de la zone. Le tour épuise le
  // k plus grand d'abord (retour 3) : du MILIEU vers les BORDS.
  // Chaîne offsetée vers l'EXTÉRIEUR (bande de marge, tour de boîte) : son k
  // croissant s'éloigne de la matière — k inversé en 0, elle finit la passe.
  let outerCh=null;
  S.chains.forEach(function(ch){
    const A=(ch.bb[2]-ch.bb[0])*(ch.bb[3]-ch.bb[1]);
    const B2=outerCh?(outerCh.bb[2]-outerCh.bb[0])*(outerCh.bb[3]-outerCh.bb[1]):-1;
    if(A>B2)outerCh=ch;
  });
  const kTag=function(chunk,k){
    if(k>0&&outerCh){
      const p=chunk.pts&&chunk.pts[0];
      if(p&&!faoPointInPoly(p[0],p[1],outerCh.pts))return 0;
    }
    return k;
  };
  for(let k=0;k<200;k++){
    const inset=k*aeA, d=r+k*aeA;
    const ro=faoOffsetRuns(S,d);
    const fr=faoRectRuns(S,inset,d);
    for(let i=0;i<ro.length;i++)if(ro[i].pts&&ro[i].pts.length>=2){ro[i].k=kTag(ro[i],k);chunks.push(ro[i]);}
    for(let i=0;i<fr.length;i++)if(fr[i].pts&&fr[i].pts.length>=2){fr[i].k=kTag(fr[i],k);chunks.push(fr[i]);}
    if(isRing)break;
    if(!ro.length&&!fr.length)break;
  }
  // --- goulets : trochoïdes G2/G3 par region etroite (un morceau par region,
  // jamais reverse : les arcs G2/G3 sont orientes).
  // Controle 2D (retour 6/10) : faoShadowIntervals ne garantit que la LIGNE
  // de la region, pas l'excursion ±Rt du trochoide — chaque point emis (arcs
  // echantillonnes a 0,25 mm + liaisons) doit rester a >= rrSafe. Goulet non
  // valide : chute sur des sous-lignes valides point par point (ni abandon,
  // ni gouge).
  const mvSafe=function(list){
    let px=null,py=null;
    for(let k=0;k<list.length;k++){
      const m=list[k];
      if(!faoShapeValid(S,m.x,m.y,rrSafe))return false;
      if(px!==null){
        if(m.arc){
          const cx=px+m.arc.i,cy=py+m.arc.j,Rr=Math.hypot(m.arc.i,m.arc.j);
          if(Rr>1e-9){
            const a0=Math.atan2(py-cy,px-cx),a1=Math.atan2(m.y-cy,m.x-cx);
            let da=a1-a0;
            if(m.arc.cw){ if(da>0)da-=2*Math.PI; }else if(da<0)da+=2*Math.PI;
            const n=Math.max(4,Math.ceil(Math.abs(da)*Rr/0.25));
            for(let s=1;s<n;s++){
              const a=a0+da*s/n;
              if(!faoShapeValid(S,cx+Rr*Math.cos(a),cy+Rr*Math.sin(a),rrSafe))return false;
            }
          }
        }else{
          const dx=m.x-px,dy=m.y-py,L=Math.hypot(dx,dy);
          const n=Math.max(1,Math.ceil(L/0.25));
          for(let s=1;s<n;s++){
            if(!faoShapeValid(S,px+dx*s/n,py+dy*s/n,rrSafe))return false;
          }
        }
      }
      px=m.x;py=m.y;
    }
    return true;
  };
  const safeRun=function(xa,xb,y){
    const out=[];let cur=null;
    const n=Math.max(1,Math.ceil((xb-xa)/0.25));
    for(let i=0;i<=n;i++){
      const x=xa+(xb-xa)*i/n;
      if(faoShapeValid(S,x,y,rrSafe)){
        if(!cur)cur=[];
        cur.push({r:0,x:rnd(x),y:rnd(y),z:z});
      }else if(cur){ if(cur.length>=2)out.push({mv:cur}); cur=null; }
    }
    if(cur&&cur.length>=2)out.push({mv:cur});
    return out;
  };
  if(!isRing){
    regs.forEach(function(R){
      let ml=0;
      R.forEach(function(q){ ml=Math.max(ml,q.iv.b-q.iv.a); });
      if(!(ml<2.5*D&&R.length>=2))return;
      let yLo=1/0,yHi=-1/0;
      R.forEach(function(q){ if(q.y<yLo)yLo=q.y; if(q.y>yHi)yHi=q.y; });
      const mv=[];
      R.forEach(function(q){ faoTrochSlot(mv,q.iv.a,q.iv.b,q.y,z,D,aeA,yLo,yHi); });
      if(mv.length>=2&&mvSafe(mv)){ chunks.push({mv:mv,k:0}); return; }
      R.forEach(function(q){
        const rs=safeRun(q.iv.a,q.iv.b,q.y);
        for(let i=0;i<rs.length;i++){rs[i].k=0;chunks.push(rs[i]);}
      });
    });
  }
  if(!chunks.length)return;
  // --- entree (UNE par niveau) : meme contrat qu'avant (tangente / helice
  // multi-spots / rampe X ou Y / micro-helice / plongee sûre).
  const flat=[];
  lines.forEach(function(L){ L.ivs.forEach(function(iv){ flat.push({y:L.y,iv:iv}); }); });
  if(!flat.length)return;
  let hasTroch=false;
  regs.forEach(function(R){
    let ml=0;
    R.forEach(function(q){ ml=Math.max(ml,q.iv.b-q.iv.a); });
    if(ml<2.5*D&&R.length>=2)hasTroch=true;
  });
  let E=flat[0];
  for(let i=1;i<flat.length;i++)if(flat[i].iv.b-flat[i].iv.a>E.iv.b-E.iv.a)E=flat[i];
  const elen=E.iv.b-E.iv.a;
  let ixA=1/0, ixB=-1/0;
  flat.forEach(function(f){ ixA=Math.min(ixA,f.iv.a); ixB=Math.max(ixB,f.iv.b); });
  const yRun=(ixB-ixA>0.2)?(flat[flat.length-1].y-flat[0].y):0;
  let cx0=0, cy0=0;
  lines.forEach(function(L){ cx0+=(L.ivs[0].a+L.ivs[0].b)/2; cy0+=L.y; });
  cx0/=lines.length; cy0/=lines.length;
  let tang=null;
  if(isRing&&lines.length>=2){
    const a0=lines[0].ivs[0].a, b0=lines[0].ivs[0].b;
    const p0x=(a0+b0)/2, p0y=lines[0].y;
    const LN=Math.min(2*D,(b0-a0)/2-1);
    if(LN>=1){
      const sx=p0x+LN, sy=p0y;
      if(faoDiscClear(segsAll,sx,sy,0,r)&&
         faoDiscClear(segsAll,(sx+p0x)/2,sy,0,r))
        tang={sx:sx,sy:sy,px:p0x,py:p0y};
    }
  }
  const byW=flat.slice().sort(function(a,b){
    return (b.iv.b-b.iv.a)-(a.iv.b-a.iv.a); });
  const forced=(entryMode||'auto')==='helix'?'helix':(entryMode||'auto')==='ramp'?'ramp':'auto';
  const fmode=forced!=='auto'?forced:(hasTroch?'helix':'auto');
  let hx=null, hr=0, hStart=zFrom, hy=0;
  // Face d'ENTREE de la passe = z+ap (zFrom = zt pour la 1re passe) : le
  // depart d'helice ne descend jamais sous cette face + 2 mm. Sans ce
  // plancher faoHelixSpot retombe sur z+2 (face obtenue + 2) : ap=5 ->
  // spirale attaquant 3 mm DANS la matiere (document reel : 47 face a 50).
  const hFloor=Math.min(secu,zFrom+2);
  if(!tang&&fmode!=='ramp'){
    const cands=[];
    if(!isRing){
      // Zone intérieure (murs des DEUX côtés, wl&&wr) la plus large, au
      // milieu en Y (retour 1) : la bande de marge (aucun mur) est toujours
      // la plus large en largeur absolue et capte l'entrée — on veut entrer
      // au centre de la ZONE à usiner, d'où part le premier (et plus grand)
      // k, puis on descend vers les bords (retour 3).
      let bIf=null,bw=-1,yS=0,nI=0;
      flat.forEach(function(f){
        if(!(f.iv.wl&&f.iv.wr))return;
        yS+=f.y;nI++;
        const w=f.iv.b-f.iv.a;
        if(w>bw){bw=w;bIf=f;}
      });
      if(bIf){
        const cyI=yS/nI;
        let bJ=bIf,by=Math.abs(bIf.y-cyI);
        flat.forEach(function(f){
          if(!(f.iv.wl&&f.iv.wr))return;
          if(Math.abs((f.iv.b-f.iv.a)-bw)>1e-9)return;
          const dy=Math.abs(f.y-cyI);
          if(dy<by){by=dy;bJ=f;}
        });
        cands.push({x:(bJ.iv.a+bJ.iv.b)/2,y:bJ.y,elen:bw});
      }
      // centre de la boîte de validation : niveau sans aucune zone à deux
      // murs (surfaçage pleine plaque) — rejeté par la parité si matière.
      cands.push({x:(B.x0+B.x1)/2,y:(B.y0+B.y1)/2,elen:0});
    }
    byW.slice(0,3).forEach(function(f){
      cands.push({x:(f.iv.a+f.iv.b)/2,y:f.y,elen:f.iv.b-f.iv.a});
    });
    cands.push({x:cx0,y:cy0,elen:0});
    for(let ci=0;ci<cands.length&&!hx;ci++){
      const c=cands[ci];
      const hrr=c.elen>0?Math.max(1,Math.min(D*0.4,c.elen/2-1)):Math.max(0.5,D*0.2);
      if(!(c.elen>0?c.elen>=2*D:true))continue;
      if(fmode==='auto'&&!(c.elen>=2*D))continue;
      // jeu 2 mm si possible, sinon ancien comportement (jeu 0) : surtout ne
      // pas rejeter l'helice serree au profit de la micro-helice de secours.
      if(!faoDiscClear(segsAll,c.x,c.y,hrr,r+faoHelixJeu)&&
         !faoDiscClear(segsAll,c.x,c.y,hrr,r))continue;
      hx=c.x; hy=c.y; hr=hrr;
      // spot = 2 mm au-dessus de la matiere RESTANTE : jamais sous hFloor
      // (face d'entree de la passe + 2 mm), sinon la spirale attaque dedans.
      hStart=Math.max(faoHelixSpot(mesh,c.x,c.y,hrr,r,z,brutTop,planes),hFloor);
    }
  }
  let ramp=null;
  if(!tang&&(fmode!=='helix'||hasTroch)&&!hx){
    if(elen>=yRun&&elen>0.2)ramp={x0:E.iv.a,y0:E.y,x1:E.iv.a+Math.min(elen,2*D),y1:E.y};
    else if(yRun>0.2){
      const xm=(ixA+ixB)/2;
      const rp={x0:xm,y0:flat[0].y,x1:xm,y1:flat[0].y+Math.min(yRun,2*D)};
      // Rampe verticale : validee sur tout le segment (le milieu de la boite
      // peut tomber dans la matiere sur cette ligne), sinon repli horizontal.
      if(segClear(rp.x0,rp.y0,rp.x1,rp.y1))ramp=rp;
      else if(elen>0.2)ramp={x0:E.iv.a,y0:E.y,x1:E.iv.a+Math.min(elen,2*D),y1:E.y};
    }
  }
  // --- tour des morceaux : greedy (le plus proche dont la liaison est sûre)
  const segDist=function(ax,ay,bx,by,px,py){
    const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;
    let t=L2>0?((px-ax)*dx+(py-ay)*dy)/L2:0;
    if(t<0)t=0;else if(t>1)t=1;
    const qx=px-(ax+t*dx),qy=py-(ay+t*dy);
    return Math.sqrt(qx*qx+qy*qy);
  };
  const polyDist=function(ch,px,py){
    let d=1/0;
    if(ch.mv){
      for(let i=0;i+1<ch.mv.length;i++){
        const a=ch.mv[i],b=ch.mv[i+1];
        const dd=segDist(a.x,a.y,b.x,b.y,px,py);
        if(dd<d)d=dd;
      }
      return d;
    }
    const P=ch.pts,n=P.length,segsN=ch.closed?n:n-1;
    for(let i=0;i<segsN;i++){
      const a=P[i],b=P[(i+1)%n];
      const dd=segDist(a[0],a[1],b[0],b[1],px,py);
      if(dd<d)d=dd;
    }
    return d;
  };
  // Point d'entree : vertex le plus proche (ferme), extremite la plus
  // proche (ouvert, reversible), toujours en avant (morceau trochoïdal).
  // 2026-10-08-003 — sens 'avalant' : AUCUN retournement de chaine ouverte —
  // la passe suit toujours le meme sens d'avance (sens de coupe constant,
  // les dents attaquent la matiere de la meme facon quels que soient le
  // morceau et son voisin). Les anneaux fermes ne sont que ROTATIONNES
  // (depart au plus proche, orientation de coupe inchangee). Absent/'bidir' :
  // retournement vers l'extremite la plus proche, strictement l'ancien code.
  const avalant=!!(opt&&opt.sens==='avalant');
  const ordered=function(ch,px,py){
    if(ch.mv)return ch.mv;
    const P=ch.pts;
    if(ch.closed){
      let bi=0,bd=1/0;
      for(let i=0;i<P.length;i++){
        const dx=P[i][0]-px,dy=P[i][1]-py,dd=dx*dx+dy*dy;
        if(dd<bd){bd=dd;bi=i;}
      }
      return P.slice(bi).concat(P.slice(0,bi));
    }
    if(avalant)return P; // sens unique : on garde l'ordre naturel de la chaine
    const f=P[0],l=P[P.length-1];
    const df=(f[0]-px)*(f[0]-px)+(f[1]-py)*(f[1]-py);
    const dl=(l[0]-px)*(l[0]-px)+(l[1]-py)*(l[1]-py);
    if(dl<df){
      const rev=new Array(P.length);
      for(let i=0;i<P.length;i++)rev[i]=P[P.length-1-i];
      return rev;
    }
    return P;
  };
  const emitChunk=function(ch,px,py){
    // Liaison d'entrée (10-09-002) : liaison courte (< faoRapideMin) sûre =
    // G1 à la cote (aucun lever) ; sinon ENTRÉE CIRCULAIRE (2026-10-08-004,
    // toutes mini-passes comprises), sinon rapide + plongée plate si le
    // disque est déjà balayé/en air réel (hors brut), 007 : sinon RAMPE LE
    // LONG DU MORCEAU (la fraise descend en coupant, jamais à plat sur du
    // brut restant). Renvoie l'index du 1er point du morceau restant à
    // émettre.
    const linkIn=function(seq,ax,ay,ux,uy){
      const prev=moves[moves.length-1];
      if(prev&&!prev.r&&Math.abs(prev.x-ax)<1e-9&&Math.abs(prev.y-ay)<1e-9)return 1; // déjà sur place
      // 10-09-002 : liaison courte (< faoRapideMin) et sûre = G1 à la cote
      // (pas de lever pour un rayon à l'autre) ; au-delà : ENTRÉE CIRCULAIRE
      // (toutes mini-passes comprises), sinon plongée plate sûre, sinon ramp.
      if(prev&&!prev.r&&Math.abs(prev.z-z)<1e-9&&
         (ax-prev.x)*(ax-prev.x)+(ay-prev.y)*(ay-prev.y)<faoRapideMin*faoRapideMin&&
         segClear(prev.x,prev.y,ax,ay)){ pushCut(ax,ay); return 1; }
      if(circEnter(ax,ay,ux,uy))return 1;
      if(faoPlungeClear(ax,ay,moves,z,D,airCv)){ gotoXY(ax,ay); moves.push({r:0,ent:1,x:rnd(ax),y:rnd(ay),z:z}); return 1; }
      // 007 : RAMPE le long du morceau — descente répartie (~2 mm par point,
      // bornée aux points disponibles) ; les morceaux ch.mv gardent leurs arcs
      // (interpolation hélicoïdale G2/G3 en descente = légal).
      gotoXY(ax,ay);
      // 10-09-002 : ancre HORS la boîte brute ET disque entièrement dégagé
      // (balayé, hors boîte ou hors silhouette — la matière ne peut pas
      // exister hors silhouette) : descente plate directe. Une ramp
      // remonterait au-dessus du brut après l'engagement (hélice fente) ;
      // un disque qui mord encore la matière reste interdit (007).
      if(airCv(ax,ay)&&faoPlungeClear(ax,ay,moves,z,D,
         function(sx2,sy2){return airCv(sx2,sy2)||!insideSil(sx2,sy2);})){
        moves.push({r:0,ent:1,x:rnd(ax),y:rnd(ay),z:z}); return 1;
      }
      const hS=Math.max(faoHelixSpot(mesh,ax,ay,0,r,z,brutTop,planes),hFloor);
      if(Math.abs(hS-z)>1e-9)moves.push({r:0,ent:1,x:rnd(ax),y:rnd(ay),z:hS});
      const nUse=Math.max(1,Math.min(seq.length-1,Math.ceil((hS-z)/2)));
      const dz=(hS-z)/nUse;
      for(let i=1;i<=nUse;i++){
        const q=seq[i];
        const m={r:0,ent:1,x:rnd(ch.mv?q.x:q[0]),y:rnd(ch.mv?q.y:q[1]),
                 z:Math.round((hS-dz*i)*1000)/1000};
        if(ch.mv&&q.arc)m.arc=q.arc;
        moves.push(m);
      }
      return nUse+1;
    };
    if(ch.mv){
      const seq=ch.mv;
      let ux=0,uy=0;
      if(seq.length>1){ux=seq[1].x-seq[0].x;uy=seq[1].y-seq[0].y;}
      const i0=linkIn(seq,seq[0].x,seq[0].y,ux,uy);
      for(let i=i0;i<seq.length;i++){
        const q=seq[i],prev=moves[moves.length-1];
        if(!q.arc&&!prev.r&&Math.abs(prev.x-q.x)<1e-9&&Math.abs(prev.y-q.y)<1e-9&&Math.abs(prev.z-q.z)<1e-9)continue;
        moves.push(q);
      }
      return;
    }
    const seq=ordered(ch,px,py);
    let ux=0,uy=0;
    if(seq.length>1){ux=seq[1][0]-seq[0][0];uy=seq[1][1]-seq[0][1];}
    const i0=linkIn(seq,seq[0][0],seq[0][1],ux,uy);
    for(let i=i0;i<seq.length;i++)pushCut(seq[i][0],seq[i][1]);
    if(ch.closed)pushCut(seq[0][0],seq[0][1]);
  };
  // --- tour des morceaux (retour 3/3) : du MILIEU vers les BORDS.
  // Hors mini-passes : on épuise d'abord le k le plus grand (intérieur de la
  // zone), puis on descend jusqu'au k=0 (murs, cadre E0, goulets) — la der-
  // nière passe suit les faces. Au sein d'un même k : distance croissante,
  // liaison sûre d'abord (repli = le plus proche du groupe). Mini-passes
  // (ringOnly, un seul k) : greedy historique strictement inchangé.
  const remaining=chunks.slice();
  const safePick=function(list,px,py){
    const order=[];
    for(let i=0;i<list.length;i++)order.push({i:i,d:polyDist(list[i],px,py)});
    order.sort(function(a,b){return a.d-b.d;});
    for(let t=0;t<order.length;t++){
      const ch=list[order[t].i];
      const seq=ordered(ch,px,py);
      const qx=ch.mv?seq[0].x:seq[0][0], qy=ch.mv?seq[0].y:seq[0][1];
      if(segClear(px,py,qx,qy))return order[t].i;
    }
    return order.length?order[0].i:-1;
  };
  // --- ENTRÉE DU NIVEAU (UNE) : émission ici, après les helpers — le tour
  // fournit la cible à l'entrée circulaire (2026-10-08-004).
  const rhoCirc=faoCircRhos(D,ae,opt.entryR);
  // 2026-10-08-007 : air = hors du BRUT (la boîte de stock), plus « hors de la
  // pièce » — l'extérieur d'un bossage et le vide de poche sont du brut à
  // enlever, pas de l'air (ancres/plongées acceptées au cœur du brut non
  // usiné = « fraise à cheval » après les passes).
  const airCv=function(x,y){
    return x<B.x0-1e-9||x>B.x1+1e-9||y<B.y0-1e-9||y>B.y1+1e-9;
  };
  const validXY=function(x,y){ return faoShapeValid(S,x,y,rrSafe); };
  const circEnter=function(Px,Py,ux,uy){
    // Arc tangent : rapide vers S, descente en Z, arc jusqu'au point d'attaque.
    // 005 : ancre déjà balayée (ré-entrée) -> descente verticale. 008 : 1re
    // attaque — ancre non balayée inévitable -> descente en HÉLICE sur place à
    // orbite légale, puis le MÊME arc tangent (les entrées circulaires ne sont
    // plus abandonnées faute de matière déjà coupée). false = repli.
    if(entryMode!=='circ')return false;
    const emitArc=function(s){
      moves.push({r:0,ent:1,x:rnd(Px),y:rnd(Py),z:z,
        arc:{i:s.cx-s.sx,j:s.cy-s.sy,cw:s.cw}});
    };
    const side=faoCircEval(Px,Py,ux,uy,rhoCirc,validXY,moves,z,D,true,airCv);
    // 10-09-002 : l'entrée circulaire s'applique à toutes les liaisons
    // assez longues (>= faoRapideMin, mini-passes comprises) — la descente
    // sur l'ancre n'est admise QUE si le disque est déjà dégagé (007 : le
    // test ponctuel de faoCircEval ne suffit pas pour PLONGER) ; sinon on
    // retombe sur l'hélice de la pass 2 qui amène le MÊME arc tangent.
    if(side&&faoPlungeClear(side.sx,side.sy,moves,z,D,airCv)){
      const zG=gotoXY(side.sx,side.sy);
      if(Math.abs(zG-z)>1e-9)moves.push({r:0,ent:1,x:rnd(side.sx),y:rnd(side.sy),z:z});
      emitArc(side);
      return true;
    }
    for(let ri=0;ri<rhoCirc.length;ri++){
      const sides=faoSidesCirc(Px,Py,ux,uy,rhoCirc[ri]);
      if(!sides)continue;
      for(let i=0;i<sides.length;i++){
        const s2=sides[i];
        if(!validXY(s2.sx,s2.sy))continue;
        if(!insideSil(s2.sx,s2.sy))continue; // 008 : ancre hors silhouette = pas de ressort dans l'air
        const pts2=faoCircArcPts(s2,Px,Py);
        if(!pts2)continue;
        let okA=true;
        for(let k=0;k<pts2.length;k++)if(!validXY(pts2[k][0],pts2[k][1])){okA=false;break;}
        if(!okA)continue;
        let hrH=0;
        const hc=[D*0.4,D*0.2,1,0.5];
        for(let hi=0;hi<hc.length;hi++){
          if(hc[hi]>=0.5&&(faoDiscClear(segsAll,s2.sx,s2.sy,hc[hi],r+faoHelixJeu)||
             faoDiscClear(segsAll,s2.sx,s2.sy,hc[hi],r))){hrH=hc[hi];break;}
        }
        if(!(hrH>0)){
          hrH=Math.max(1,D*0.2);
          const okS=function(h){
            for(let k=0;k<8;k++){const a=k/8*2*Math.PI;if(!validXY(s2.sx+h*Math.cos(a),s2.sy+h*Math.sin(a)))return false;}
            return true;
          };
          while(hrH>0.5&&!okS(hrH))hrH-=0.5;
          if(!(hrH>0.5&&okS(hrH)))continue;
        }
        const zG=gotoXY(s2.sx,s2.sy);
        const hS=Math.max(faoHelixSpot(mesh,s2.sx,s2.sy,hrH,r,z,brutTop,planes),hFloor);
        if(Math.abs(zG-hS)>1e-9)moves.push({r:0,ent:1,x:rnd(s2.sx),y:rnd(s2.sy),z:hS});
        faoHelixEntry(s2.sx,s2.sy,hS,z,hrH,D).slice(1).forEach(function(m){moves.push(m);});
        pushCut(s2.sx,s2.sy);
        emitArc(s2);
        return true;
      }
    }
    return false;
  };
  // Première cible = le morceau que le tour épuisera en premier (même règle).
  let circOK=false;
  if(entryMode==='circ'&&remaining.length){
    const px0=moves.length?moves[moves.length-1].x:cx0;
    const py0=moves.length?moves[moves.length-1].y:cy0;
    let pk0=-1;
    if(isRing)pk0=safePick(remaining,px0,py0);
    else{
      let kTop=-1;
      for(let i=0;i<remaining.length;i++)if((remaining[i].k||0)>kTop)kTop=remaining[i].k||0;
      const grp=[];
      for(let i=0;i<remaining.length;i++)if((remaining[i].k||0)===kTop)grp.push(remaining[i]);
      pk0=remaining.indexOf(grp[safePick(grp,px0,py0)]);
    }
    const ch0=remaining[pk0];
    if(ch0){
      const s0=ordered(ch0,px0,py0);
      const ax0=ch0.mv?s0[0].x:s0[0][0], ay0=ch0.mv?s0[0].y:s0[0][1];
      let ux0=0,uy0=0;
      if(s0.length>1){
        ux0=ch0.mv?s0[1].x-s0[0].x:s0[1][0]-s0[0][0];
        uy0=ch0.mv?s0[1].y-s0[0].y:s0[1][1]-s0[0][1];
      }
      circOK=circEnter(ax0,ay0,ux0,uy0);
    }
  }
  if(circOK){
    // entrée circulaire émise — le tour enchaîne en liaison directe.
  }else if(tang){
    const zG=gotoXY(tang.sx,tang.sy);
    const hs=Math.max(faoHelixSpot(mesh,tang.sx,tang.sy,0,r,z,brutTop,planes),hFloor);
    if(Math.abs(zG-hs)>1e-9)moves.push({r:0,x:rnd(tang.sx),y:rnd(tang.sy),z:hs});
    moves.push({r:0,x:rnd(tang.px),y:rnd(tang.py),z:z});
  }else if(hx!==null){
    const zG=gotoXY(hx,hy);
    if(Math.abs(zG-hStart)>1e-9)moves.push({r:0,x:rnd(hx),y:rnd(hy),z:hStart});
    faoHelixEntry(hx,hy,hStart,z,hr,D).slice(1).forEach(function(m){moves.push(m);});
  }else if(ramp&&(fmode==='ramp'||(!hasTroch&&Math.max(elen,yRun)>=D*0.5))){
    gotoXY(ramp.x0,ramp.y0);
    // 2026-10-08-005 : la rampe G1 d'attaque (coupe diagonale en biseau) est
    // une entrée — étiquetée ent (tracé bleu, comme l'hélice et l'arc circ).
    moves.push({r:0,ent:1,x:rnd(ramp.x1),y:rnd(ramp.y1),z:z});
  }else{
    // 2026-10-08-006 : première attaque sans région ouverte — JAMAIS de
    // plongée à plat dans la matière (fraise à cheval sur la phase) : hélice
    // de descente depuis le spot, orbite réduite jusqu'à rester dans la
    // région légale (sinon surcoupe du mur en orbite) ; aucune orbite
    // tenable -> liaison + coupe (centre légal, repli historique).
    const run=Math.max(elen,yRun);
    const mhr=Math.max(0.5,run/2-0.2);
    const mx=ramp?ramp.x0:(E.iv.a+E.iv.b)/2, my=ramp?ramp.y0:E.y;
    // 008 : JAMAIS d'hélice dans l'AIR — boîte de brut ∩ hors pièce = rien à
    // enlever sous la colonne (le cadre E0 en marge et les intervalles d'ombre
    // hors boîte entreraient par un ressort dans le vide). Sous le vide de
    // poche, la MATIÈRE BRUT est bien là (hors pièce dans la boîte) : hélice.
    const surMatiere=(mx>=B.x0-1e-9&&mx<=B.x1+1e-9&&my>=B.y0-1e-9&&my<=B.y1+1e-9)&&
      !faoShapeInside(S,mx,my);
    if(!surMatiere){
      // rien à enlever ici : le 1er morceau (linkIn 007) ramp/linkpe depuis
      // la position précédente.
    }else{
    let hrH=(fmode!=='ramp'&&run>0.5&&
      (faoDiscClear(segsAll,mx,my,mhr,r+faoHelixJeu)||
       faoDiscClear(segsAll,mx,my,mhr,r)))?mhr:Math.max(1,D*0.2);
    const okOrb=function(h){
      for(let k=0;k<8;k++){const a=k/8*2*Math.PI;if(!validXY(mx+h*Math.cos(a),my+h*Math.sin(a)))return false;}
      return true;
    };
    while(hrH>0.5&&!okOrb(hrH))hrH-=0.5;
    if(hrH>0.5&&okOrb(hrH)){
      const ms=Math.max(faoHelixSpot(mesh,mx,my,hrH,r,z,brutTop,planes),hFloor);
      const zG=gotoXY(mx,my);
      if(Math.abs(zG-ms)>1e-9)moves.push({r:0,x:rnd(mx),y:rnd(my),z:ms});
      faoHelixEntry(mx,my,ms,z,hrH,D).slice(1).forEach(function(m){moves.push(m);});
      pushCut(mx,my);
    }else if(faoPlungeClear(mx,my,moves,z,D,airCv)){
      // 2026-10-08-007 : plongée à plat admise UNIQUEMENT si le disque est
      // déjà balayé ou en air réel (hors brut) — sinon on n'émet rien : le
      // 1er morceau du tour ramp le long de sa chaîne (linkIn 007).
      // 10-09-002 : liaison courte sûre = G1 à la cote (pushCut) ; au-delà,
      // lever + rapide puis plongée plate.
      if(linkTo(mx,my))moves.push({r:0,ent:1,x:rnd(mx),y:rnd(my),z:z});
      else pushCut(mx,my);
    }
    }
  }
  // 10-09-002 : mini-passes — un tour fait, la fraise est passée partout :
  // un morceau dont CHAQUE point a son disque D/2 entièrement balayé à la
  // cote (même test que la plongée sûre 007) est déjà usiné. Le refaire =
  // vitesse travail dans le vide (parfois même avant la fin du tour, le
  // greedy saisit un morceau déjà couvert entre deux morceaux vierges). On
  // le DROPE sans bouger ; la couverture est réévaluée à chaque choix (le
  // tour couvre au fur et à mesure). Actif uniquement en ringOnly (mini-
  // passes ET finition conventionnelle) : les passes normales gardent leur
  // parcours historique. Deux temps : (1) filtre rapide — chaque point doit
  // avoir une coupe à la MÊME cote à ≤ r, sinon non couvert (on ne saute
  // jamais une bague utile) ; (2) test disque complet faoPlungeClear.
  const chunkCovered=function(ch){
    const zc=[];
    for(let i=0;i<moves.length;i++){const m=moves[i];
      if(!m.r&&Math.abs(m.z-z)<1e-9)zc.push(m);}
    if(!zc.length)return false;
    const r2=rrSafe*rrSafe;
    const near=function(x,y){
      for(let k=0;k<zc.length;k++){
        const dx=zc[k].x-x,dy=zc[k].y-y;
        if(dx*dx+dy*dy<=r2)return true;
      }
      return false;
    };
    const P=ch.mv?null:ch.pts, n=ch.mv?ch.mv.length:(P?P.length:0);
    if(!n)return false;
    for(let i=0;i<n;i++){
      const x=ch.mv?ch.mv[i].x:P[i][0], y=ch.mv?ch.mv[i].y:P[i][1];
      if(!near(x,y))return false;
      if(!faoPlungeClear(x,y,moves,z,D,airCv))return false;
    }
    return true;
  };
  while(remaining.length){
    const P=moves.length?moves[moves.length-1]:null,px=P?P.x:cx0,py=P?P.y:cy0;
    let pick=-1;
    if(isRing){
      pick=safePick(remaining,px,py);
    }else{
      let kTop=-1;
      for(let i=0;i<remaining.length;i++)if((remaining[i].k||0)>kTop)kTop=remaining[i].k||0;
      const grp=[];
      for(let i=0;i<remaining.length;i++)if((remaining[i].k||0)===kTop)grp.push(remaining[i]);
      pick=remaining.indexOf(grp[safePick(grp,px,py)]);
    }
    const ch=remaining[pick];
    remaining.splice(pick,1);
    if(isRing&&chunkCovered(ch))continue; // 10-09-002 : déjà usiné — pas de coupe dans le vide
    emitChunk(ch,px,py);
  }
  sortie(moves[moves.length-1]);
}

function faoRoughRegions(lines){
  // Regroupe les intervalles en régions connexes en Y (recouvrement X) :
  // une nervure/îlot = une région, suivie pour elle-même (morph).
  const parent={};
  const id=function(li,ii){ return li+':'+ii; };
  const find=function(a){ while(parent[a]!==a)a=parent[a]; return a; };
  const uni=function(a,b){ a=find(a); b=find(b); if(a!==b)parent[a]=b; };
  lines.forEach(function(L,li){ L.ivs.forEach(function(iv,ii){ parent[id(li,ii)]=id(li,ii); }); });
  for(let li=1;li<lines.length;li++){
    // Union UNIQUEMENT si le recouvrement est 1:1 des deux côtés : une ligne
    // pleine (marge hors matière) recouvre toutes les colonnes — les fusionner
    // donnerait un pelage en travers des plots. Elle reste région à part.
    const prev=lines[li-1], cur=lines[li];
    const ovC=[], ovP=new Array(prev.ivs.length).fill(0);
    for(let ii=0;ii<cur.ivs.length;ii++){
      ovC[ii]=[];
      for(let pj=0;pj<prev.ivs.length;pj++){
        if(cur.ivs[ii].a<prev.ivs[pj].b&&prev.ivs[pj].a<cur.ivs[ii].b){
          ovC[ii].push(pj); ovP[pj]++;
        }
      }
    }
    for(let ii=0;ii<cur.ivs.length;ii++){
      if(ovC[ii].length===1&&ovP[ovC[ii][0]]===1)uni(id(li,ii),id(li-1,ovC[ii][0]));
    }
  }
  const groups={};
  lines.forEach(function(L,li){
    L.ivs.forEach(function(iv,ii){
      const r=find(id(li,ii));
      (groups[r]=groups[r]||[]).push({y:L.y,iv:iv});
    });
  });
  return Object.keys(groups).map(function(k){return groups[k];});
}
/* ----- entrée en arc tangent sur une paroi (mène à la passe) ----- */
// Quart de cercle S->W tangent à la direction de paroi (+Y) en W, avec
// S sur la ligne vidée à ≤10 mm de W (rayon capé à 5). G2 à gauche,
// G3 à droite — tangence prouvée par test.
function faoLeadArc(Mx,My,Wx,Wy,leftWall,z){
  const dir=leftWall?1:-1;
  if((Mx-Wx)*dir<=0)return null; // M du mauvais côté : pas d'arc
  const rLead=Math.min(Math.abs(Mx-Wx)/2,5);
  if(!(rLead>=0.5))return null;
  const Sx=Wx+dir*2*rLead, cx=Wx+dir*rLead;
  return {sx:Sx, move:{r:0,x:Wx,y:Wy,z:z,arc:{i:cx-Sx,j:0,cw:leftWall}}};
}

function faoAdjacency(mesh){
  const adj=[]; let i;
  for(i=0;i<mesh.v.length;i++)adj.push([]);
  const link=function(a,b){ if(adj[a].indexOf(b)<0)adj[a].push(b); };
  for(i=0;i<mesh.t.length;i++){
    const t=mesh.t[i];
    link(t[0],t[1]); link(t[1],t[0]); link(t[1],t[2]); link(t[2],t[1]); link(t[2],t[0]); link(t[0],t[2]);
  }
  return adj;
}
function faoDijkstra(mesh,seed){
  // Tas binaire : V=50k sans broncher dans le navigateur.
  const n=mesh.v.length, dist=new Array(n).fill(1/0);
  const adj=faoAdjacency(mesh);
  dist[seed]=0;
  const HK=[], HV=[];
  const push=function(k,v){ HK.push(k); HV.push(v); let i=HK.length-1;
    while(i>0){ const p=(i-1)>>1; if(HK[p]<=k)break; HK[i]=HK[p]; HV[i]=HV[p]; i=p; }
    HK[i]=k; HV[i]=v; };
  const pop=function(){ const top=HV[0];
    const lk=HK.pop(), lv=HV.pop();
    if(HK.length){
      HK[0]=lk; HV[0]=lv; // le dernier prend la racine, puis on le fait descendre
      let i=0;
      for(;;){ const l=i*2+1, r=l+1; let m=i;
        if(l<HK.length&&HK[l]<HK[m])m=l; if(r<HK.length&&HK[r]<HK[m])m=r;
        if(m===i)break;
        const tk=HK[i];HK[i]=HK[m];HK[m]=tk;
        const tv=HV[i];HV[i]=HV[m];HV[m]=tv; i=m; }
    }
    return top; };
  push(0,seed);
  const done=new Array(n).fill(false);
  while(HK.length){
    const u=pop();
    if(done[u])continue; done[u]=true;
    const du=dist[u], pu=mesh.v[u], nb=adj[u];
    for(let i=0;i<nb.length;i++){
      const w=nb[i], pw=mesh.v[w];
      const nd=du+Math.hypot(pw[0]-pu[0],pw[1]-pu[1],pw[2]-pu[2]);
      if(nd<dist[w]){ dist[w]=nd; push(nd,w); }
    }
  }
  return dist;
}
function faoSeedTop(mesh){
  let bi=0, bm=-1/0;
  for(let i=0;i<mesh.v.length;i++)if(mesh.v[i][2]>bm){bm=mesh.v[i][2];bi=i;}
  return bi;
}
function faoIsoSegs(mesh,normals,dist,iso,flags,want){
  // Marching-triangles : segments 3D + normales interpolées (points de contact).
  // 2026-10-04-004 : flags/want — masque optionnel des familles plate/inclinée
  // (iso-Z sur les faces en pente, anneaux géodésiques sur les plateaux).
  const segs=[];
  for(let i=0;i<mesh.t.length;i++){
    if(flags&&flags[i]!==want)continue;
    const ti=mesh.t[i];
    const P=[mesh.v[ti[0]],mesh.v[ti[1]],mesh.v[ti[2]]];
    const N=[normals[ti[0]],normals[ti[1]],normals[ti[2]]];
    const d=[dist[ti[0]]-iso,dist[ti[1]]-iso,dist[ti[2]]-iso];
    const pts=[];
    for(let k=0;k<3;k++){
      const da=d[k], db=d[(k+1)%3];
      if((da<0&&db>=0)||(da>=0&&db<0)){
        const s=Math.abs(db-da)>1e-12?da/(da-db):0;
        const A=P[k], B=P[(k+1)%3], NA=N[k], NB=N[(k+1)%3];
        pts.push({
          p:[A[0]+(B[0]-A[0])*s,A[1]+(B[1]-A[1])*s,A[2]+(B[2]-A[2])*s],
          n:[NA[0]+(NB[0]-NA[0])*s,NA[1]+(NB[1]-NA[1])*s,NA[2]+(NB[2]-NA[2])*s]
        });
      }
    }
    if(pts.length>=2)segs.push([pts[0],pts[1]]);
  }
  return segs;
}
function faoChainSegs(segs,tol){
  // Chaînage glouton par extrémités proches (points iso coïncidents aux arêtes).
  const t2=(tol||1e-4), chains=[];
  const used=new Array(segs.length).fill(false);
  const key=function(p){return p.p;};
  const deq=function(a,b){ const dx=a[0]-b[0],dy=a[1]-b[1],dz=a[2]-b[2];
    return dx*dx+dy*dy+dz*dz<t2*t2; };
  for(let s=0;s<segs.length;s++){
    if(used[s])continue;
    used[s]=true;
    const chain=[segs[s][0],segs[s][1]];
    let grew=true, guard=0;
    while(grew&&guard++<100000){
      grew=false;
      for(let k=0;k<segs.length;k++){
        if(used[k])continue;
        const A=segs[k][0], B=segs[k][1];
        if(deq(key(chain[chain.length-1]),key(A))){chain.push(B);used[k]=true;grew=true;break;}
        if(deq(key(chain[chain.length-1]),key(B))){chain.push(A);used[k]=true;grew=true;break;}
        if(deq(key(chain[0]),key(B))){chain.unshift(A);used[k]=true;grew=true;break;}
        if(deq(key(chain[0]),key(A))){chain.unshift(B);used[k]=true;grew=true;break;}
      }
    }
    chains.push(chain);
  }
  return chains;
}
function faoGeoFlags(mesh,zb,zt){
  // 2026-10-04-004 : partition des faces — plate = normale quasi verticale
  // (nz ≥ 0,99 ≈ 8°, marge de tessellation), sinon inclinée/mur. flags limite
  // l'extraction à une famille ; un plateau n'est retenu que dans [zb,zt]
  // (limites Z) ; anySlope (toutes faces, hors limites) pilote le garde-fou
  // de la fraise droite.
  const flags=new Uint8Array(mesh.t.length);
  let anySlope=false, hasFlat=false;
  for(let i=0;i<mesh.t.length;i++){
    const t=mesh.t[i],A=mesh.v[t[0]],B=mesh.v[t[1]],C=mesh.v[t[2]];
    const ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2];
    const wx=C[0]-A[0],wy=C[1]-A[1],wz=C[2]-A[2];
    const nx=uy*wz-uz*wy, ny=uz*wx-ux*wz, nz=ux*wy-uy*wx;
    const l=Math.hypot(nx,ny,nz)||1;
    if(nz/l>=0.99){
      const zc=(A[2]+B[2]+C[2])/3;
      if(zc>=zb-1e-9&&zc<=zt+1e-9){flags[i]=1;hasFlat=true;}
    }else anySlope=true;
  }
  return {flags:flags,anySlope:anySlope,hasFlat:hasFlat};
}
function faoGeoEntryMode(entry,hasRrough){
  // 2026-10-04-009 : mode d'entrée de la géofinition. L'hélice creuse sa place
  // en tournant — INTERDITE sans ébauche 3D active AVANT cette finition
  // (sinon elle plongerait dans la matière pleine) : on retombe sur la rampe,
  // qui descend en biais sur l'air au-dessus de la trajectoire. L'arc circ
  // (2026-10-08-004) suit la même règle : sans ébauche, il n'y a pas d'ancre
  // (matière déjà ouverte) → rampe.
  const m=(entry==='ramp'||entry==='helix'||entry==='circ')?entry:'auto';
  if(m==='ramp')return 'ramp';
  if(!hasRrough)return 'ramp';
  return m;
}
function faoGeoHasRrough(job,op){
  // Ébauche 3D (rough3d) active AVANT cette opération dans le même posage ?
  // Op introuvable -> false (jamais d'hélice au doute). L'ancien « Débourrage »
  // (pocket3d) ayant été supprimé, il ne compte plus comme débourrage.
  const ops=(job&&job.ops)||[];
  let i=-1;
  for(let k=0;k<ops.length;k++){
    if(ops[k]===op||(op&&op.id&&ops[k]&&ops[k].id===op.id)){i=k;break;}
  }
  if(i<0)return false;
  for(let k=0;k<i;k++){
    const q=ops[k];
    if(!q||q.on===false)continue;
    if(q.type==='rough3d')return true;
  }
  return false;
}
function faoGenGeoFinish(mesh,o){
  // Finition iso (retour 4/10) : (1) passes horizontales iso-Z sur les faces
  // en pente — chaque liaison part à Z constant ; (2) anneaux géodésiques sur
  // les seules faces horizontales (couverture des plateaux). Sorties centre
  // outil (contact + normale×Rc, Rc = rayon actif : boule D/2, torique r
  // coin, droite 0). Limites ztop/zbot (défaut : étendue du maillage).
  o=o||{};
  if(!mesh||!mesh.v||!mesh.v.length)return [];
  const D=isFinite(+o.toolD)&&+o.toolD>0?+o.toolD:8;
  const kind=o.kind||'ball';
  const Rc=kind==='flat'?0:(kind==='bull'?Math.min(D/2,isFinite(+o.cornerR)?+o.cornerR:D/2):D/2);
  const L=isFinite(+o.laisse)&&+o.laisse>0?+o.laisse:0;
  const R=Rc+L;
  const secu=isFinite(+o.secu)?+o.secu:5;
  const step=isFinite(+o.step)&&+o.step>0?+o.step:1;
  const normals=faoMeshNormals(mesh);
  let zmax=-1/0, zmin=1/0;
  for(let i=0;i<mesh.v.length;i++){ const z=mesh.v[i][2]; if(z>zmax)zmax=z; if(z<zmin)zmin=z; }
  const zt=Math.min(isFinite(+o.ztop)?+o.ztop:zmax, zmax);
  const zb=Math.max(isFinite(+o.zbot)?+o.zbot:zmin, zmin);
  const G=faoGeoFlags(mesh,zb,zt);
  // Garde-fou fraise droite (point 2) : sans rayon actif, une pente même
  // légère laisse une arête non finie — on refuse plutot que de mentir.
  if(kind==='flat'&&G.anySlope)return [];
  const seed=(o.seed==='bottom')?faoSeedBottom(mesh):faoSeedTop(mesh);
  const dist=faoDijkstra(mesh,seed);
  let dmax=0;
  for(let i=0;i<dist.length;i++)if(dist[i]<1/0&&dist[i]>dmax)dmax=dist[i];
  if(!(dmax>0))return [];
  const moves=[];
  const zf=new Float64Array(mesh.v.length);
  for(let i=0;i<mesh.v.length;i++)zf[i]=mesh.v[i][2];
  // 2026-10-04-009 : collecte par ZONE (un niveau = une zone regroupant toutes
  // ses chaînes), puis émission groupée : 2 rapides à secu par zone (entrée +
  // sortie) au lieu d'un couple à secu par chaîne — les chaînes d'un même
  // niveau se relient à la Z de liaison (colonne vérifiée), sinon via secu.
  const mode=faoGeoEntryMode(o.entry,o.hasRrough);
  const zones=[];
  const level=function(field,iso,flat){
    const segs=faoIsoSegs(mesh,normals,field,iso,G.flags,flat);
    if(!segs.length)return;
    const chains=faoChainSegs(segs,Math.max(1e-4,step*0.02));
    const zcs=[];
    let zmaxZ=-1/0;
    chains.forEach(function(ch){
      if(ch.length<2)return;
      const cen=ch.map(function(q){
        const l=Math.hypot(q.n[0],q.n[1],q.n[2])||1;
        return {x:q.p[0]+q.n[0]/l*R, y:q.p[1]+q.n[1]/l*R, z:q.p[2]+q.n[2]/l*R};
      });
      const nl=Math.hypot(ch[0].n[0],ch[0].n[1],ch[0].n[2])||1;
      let cz=-1/0;
      cen.forEach(function(p){ if(p.z>cz)cz=p.z; });
      if(cz>zmaxZ)zmaxZ=cz;
      zcs.push({pts:cen,n0:[ch[0].n[0]/nl,ch[0].n[1]/nl,ch[0].n[2]/nl]});
    });
    if(zcs.length)zones.push({chains:zcs,zmax:zmaxZ});
  };
  // (1) Iso-Z sur les faces en pente : niveaux ancrés au plafond, descendant
  // (seed top) ou ascendant (seed bottom), bornes ztop/zbot.
  if(G.anySlope){
    const zlv=[];
    for(let k=1;;k++){ const z=zt-k*step; if(!(z>zb+1e-9))break; zlv.push(z); }
    if(o.seed==='bottom')zlv.reverse();
    for(let i=0;i<zlv.length;i++)level(zf,zlv[i],0);
  }
  // (2) Anneaux géodésiques sur les seuls plateaux (dans les limites Z).
  if(G.hasFlat)for(let iso=step;iso<dmax;iso+=step)level(dist,iso,1);
  // --- phase d'émission : une entrée + une sortie par zone -----------------
  const margin=Math.max(1,D*0.2);
  zones.forEach(function(Z){
    // Z de liaison : au-dessus des coupes de la zone, sous secu quand possible.
    const travel=Math.max(Z.zmax,Math.min(secu,Z.zmax+margin));
    let segsLink=null;
    const linkSegs=function(){
      if(!segsLink){
        // Colonne de la liaison : de travel-R (portée du métal sous le centre)
        // au sommet du maillage — tout voile/ressaut y est vu (plans vertex).
        segsLink=[];
        const pls=faoShadowPlanes(mesh,travel-R,zmax);
        for(let k=0;k<pls.length;k++){
          const s=faoSliceZCached(mesh,pls[k]);
          if(s.length)segsLink=segsLink.concat(s);
        }
      }
      return segsLink;
    };
    // Distance XY d'un point au matériau de la colonne (0 = dedans) — miroir
    // de faoDiscClear avec hr=0 (parité + distance au contour).
    const ptDist=function(x,y){
      const segs=linkSegs();
      const xs=[];
      for(let i=0;i<segs.length;i++){const s=segs[i];
        if((s[1]-y)*(s[3]-y)<=0&&s[1]!==s[3])
          xs.push(s[0]+(s[2]-s[0])*(y-s[1])/(s[3]-s[1]));}
      xs.sort(function(a,b){return a-b;});
      let left=0;
      for(let i=0;i<xs.length;i++)if(xs[i]<x-1e-9)left++;
      if((left%2)===1)return 0;
      let dmin=1/0;
      for(let i=0;i<segs.length;i++){const s=segs[i];
        const ax=s[0],ay=s[1],ex=s[2]-s[0],ey=s[3]-s[1],L2=ex*ex+ey*ey;
        let u=L2>0?((x-ax)*ex+(y-ay)*ey)/L2:0; if(u<0)u=0; else if(u>1)u=1;
        const px=ax+u*ex-x,py=ay+u*ey-y,d2=px*px+py*py;
        if(d2<dmin)dmin=d2;}
      return Math.sqrt(dmin);
    };
    const pathOK=function(p,q){
      const segs=linkSegs();
      // La liaison ne doit jamais être PIÈRE que les points de coupe qu'elle
      // relie (offsets en normales de sommet fondues : le liseré peut situer
      // sous l'enveloppe) : seuil = min(R, distance réelle des extrémités).
      const d0=ptDist(p.x,p.y), d1=ptDist(q.x,q.y);
      if(!(d0>1e-6&&d1>1e-6))return false;
      const rr=Math.max(0.01,Math.min(R,d0,d1)-1e-3);
      const dx=q.x-p.x,dy=q.y-p.y,Ln=Math.sqrt(dx*dx+dy*dy);
      const n=Math.max(1,Math.ceil(Ln));
      for(let i=0;i<=n;i++){
        const t=i/n;
        if(!faoDiscClear(segs,p.x+dx*t,p.y+dy*t,0,rr))return false;
      }
      return true;
    };
    const chainTol=Math.max(1e-4,step*0.02);
    // Point visé par l'approche d'une chaîne : centre d'hélice (si autorisé) ou
    // point ~2D le long du tracé — la rampe descend ensuite en diagonale de pk
    // jusqu'au début (jamais de plongée verticale).
    const candLink=function(pts,n0){
      const here=pts[0];
      let pk=0,acc=0;
      for(let i=1;i<pts.length;i++){
        acc+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y);
        if(acc>=2*D){pk=i;break;}
        pk=i;
      }
      let hx=null,hr=0,planesE=null;
      if(mode!=='ramp'&&n0[2]<=0.5&&Math.hypot(n0[0],n0[1])>0.05){
        hr=Math.max(0.5,Math.min(D*0.4,3));
        const nlxy=Math.hypot(n0[0],n0[1]);
        const off=hr+R+0.5;
        const cx=here.x+n0[0]/nlxy*off, cy=here.y+n0[1]/nlxy*off;
        planesE=faoShadowPlanes(mesh,here.z-R,zmax);
        const segsE=[];
        for(let k=0;k<planesE.length;k++){
          const s=faoSliceZCached(mesh,planesE[k]);
          if(s.length)segsE.push.apply(segsE,s);
        }
        if(faoDiscClear(segsE,cx,cy,hr,R))hx={x:cx,y:cy};
      }
      return {pts:pts,pk:pk,hx:hx,hr:hr,planesE:planesE,
              pt:hx?hx:{x:pts[pk].x,y:pts[pk].y}};
    };
    Z.chains.forEach(function(C,ci){
      if(ci>0){
        // Chaîne (fermée : tous les démarrages × 2 sens ; ouverte : droit ou
        // inversé) choisie pour QUE la liaison depuis la chaîne précédente
        // reste dans le vide : tous les candidats évalués au pathOK, on garde
        // un passage bas (sinon le plus court — repli via secu émis plus bas).
        const prev=Z.chains[ci-1],from=prev.pts[prev.pts.length-1];
        const n0=C.n0,pts0=C.pts;
        const closed=pts0.length>3&&
          Math.hypot(pts0[0].x-pts0[pts0.length-1].x,pts0[0].y-pts0[pts0.length-1].y,pts0[0].z-pts0[pts0.length-1].z)<chainTol;
        const cands=[];
        if(closed){for(let k=0;k<pts0.length-1;k++){cands.push([k,1]);cands.push([k,-1]);}}
        else{cands.push([0,1]);cands.push([0,-1]);}
        let best=null;
        for(let t=0;t<cands.length;t++){
          const c=cands[t];
          let pts;
          if(c[1]===1)pts=c[0]>0?pts0.slice(c[0]).concat(pts0.slice(1,c[0])):pts0.slice();
          else{const rv=pts0.slice().reverse();pts=c[0]>0?rv.slice(c[0]).concat(rv.slice(1,c[0])):rv;}
          const I=candLink(pts,n0);
          const ok=pathOK(from,I.pt);
          const len=Math.hypot(I.pt.x-from.x,I.pt.y-from.y);
          if(!best||((ok?0:1)<(best.ok?0:1))||(ok===best.ok&&len<best.len))
            best={pts:pts,ok:ok,len:len};
        }
        if(best)C.pts=best.pts;
      }
      const I=candLink(C.pts,C.n0);
      const pts=I.pts,here=pts[0],pk=I.pk,hx=I.hx,hr=I.hr,planesE=I.planesE;
      // 2026-10-08-004 : ENTRÉE CIRCULAIRE — arc tangent au début de chaîne.
      // Validité : le centre reste sur l'air de la colonne (matière à ≥ R-0.5,
      // miroir du contrôle des liaisons) ; ancre exigée (coupe antérieure à
      // ≤ D/2 de S) pour que la descente verticale soit dans le vide. Échec →
      // repli historique (hélice si slot, rampe, plongeon le long du tracé).
      let circ=null;
      if(mode==='circ'&&pts.length>1){
        // 2026-10-08-005 : rayons candidats (pas des iso = candidat) + disque
        // outil entièrement hors matière restante (air = ptDist > 0 ;
        // couverture par les passes iso antérieures à cote ≤ z sinon repli).
        const rhoG=faoCircRhos(D,step,o.entryR);
        const need=Math.max(0.01,R-0.5);
        circ=faoCircEval(here.x,here.y,pts[1].x-here.x,pts[1].y-here.y,rhoG,
          function(x,y){ return ptDist(x,y)>=need; },
          moves,here.z,D,true,
          function(x,y){ return ptDist(x,y)>1e-9; });
      }
      const ax=circ?circ.sx:(hx?hx.x:pts[pk].x), ay=circ?circ.sy:(hx?hx.y:pts[pk].y);
      let startZ;
      if(ci===0){
        // Zone suivante (sortie précédente déjà à secu) ou début de programme.
        moves.push({r:1,x:ax,y:ay,z:secu});
        startZ=secu;
      }else{
        // Liaison intra-zone : lift sur place, XY à la Z de liaison si la
        // colonne reste claire — sinon passage par secu (jamais de traversée
        // de la pièce à basse altitude entre deux chaînes).
        const prev=Z.chains[ci-1],from=prev.pts[prev.pts.length-1];
        const liftZ=pathOK(from,{x:ax,y:ay})?travel:secu;
        if(Math.abs(from.z-liftZ)>1e-9)moves.push({r:1,x:from.x,y:from.y,z:liftZ});
        moves.push({r:1,x:ax,y:ay,z:liftZ});
        startZ=liftZ;
      }
      let skip0=false, ramp0=false;
      if(circ){
        // Rapide arrivé à S (secu/travel), descente en Z à S, arc tangent.
        // 2026-10-08-005 : descente + arc étiquetés ent (tracé bleu).
        if(Math.abs(startZ-here.z)>1e-9)moves.push({r:0,ent:1,x:circ.sx,y:circ.sy,z:here.z});
        moves.push({r:0,ent:1,x:here.x,y:here.y,z:here.z,
          arc:{i:circ.cx-circ.sx,j:circ.cy-circ.sy,cw:circ.cw}});
        skip0=true;
      }else if(hx){
        // Hélice : descente d'air jusqu'au spot, spirale, G1 au début de chaîne.
        const spot=faoHelixSpot(mesh,hx.x,hx.y,hr,R,here.z,zmax,planesE);
        const hStart=Math.min(startZ,spot);
        if(Math.abs(startZ-hStart)>1e-9)moves.push({r:0,x:hx.x,y:hx.y,z:hStart});
        const hel=faoHelixEntry(hx.x,hx.y,hStart,here.z,hr,D);
        for(let i=1;i<hel.length;i++)moves.push(hel[i]);
        moves.push({r:0,x:here.x,y:here.y,z:here.z});
      }else if(pk<1){
        // 2026-10-08-006 : JAMAIS de plongée à plat sur le début de chaîne
        // (fraise à cheval sur le mur) — RAMPE le long du 1er tronçon : la
        // fraise descend EN SE DÉPLAÇANT sur la chaîne (centre légal
        // préservé ; aucune orbite possible sans surcoupe du mur).
        ramp0=true;
      }else{
        // Rampe : diagonale en AIR au-dessus du tracé (pk -> début), z au
        // moins égale au contact local — rapide (aucune coupe) et sûre.
        for(let i=pk-1;i>=0;i--){
          const f=(pk-i)/pk;
          const lin=startZ+(here.z-startZ)*f;
          const zz=Math.max(lin,pts[i].z);
          moves.push({r:1,x:pts[i].x,y:pts[i].y,z:zz});
        }
      }
      for(let i=skip0?1:0;i<pts.length;i++){
        // 006 : 1er tronçon rampe (pk<1) — descente répartie le long du
        // segment, puis la chaîne suit à z de coupe.
        if(i===1&&ramp0&&pts.length>1&&startZ>here.z+1e-9){
          const nR=Math.max(2,Math.ceil((startZ-here.z)/2));
          for(let s=1;s<=nR;s++){
            const f=s/nR;
            moves.push({r:0,x:here.x+(pts[1].x-here.x)*f,
                              y:here.y+(pts[1].y-here.y)*f,
                              z:startZ+(here.z-startZ)*f});
          }
        }else moves.push({r:0,x:pts[i].x,y:pts[i].y,z:pts[i].z});
      }
    });
    // Sortie de zone : retrait vertical sur place à secu (2e rapide de la zone).
    const lc=Z.chains[Z.chains.length-1],lp=lc.pts[lc.pts.length-1];
    moves.push({r:1,x:lp.x,y:lp.y,z:secu});
  });
  return moves;
}
function faoSeedBottom(mesh){
  let bi=0, bm=1/0;
  for(let i=0;i<mesh.v.length;i++)if(mesh.v[i][2]<bm){bm=mesh.v[i][2];bi=i;}
  return bi;
}

/* ----- mode sélection : plan de travail 3+2 sur la pièce ----- */
// Clic sur une face sortante : la normale (repère pièce) devient l'orientation
// B/C de la table via faoOrientFromNormal ; une face tournée vers le bas est
// refusée (pièce à retourner). One-shot : sortie auto après application.
let faoPlanePick=null;
function faoPlaneStart(setupId){
  try{
    if(typeof skEdit!=='undefined'&&skEdit){faceEl.textContent='Plan : fermez l\'esquisse d\'abord.';return;}
    if((typeof filMode!=='undefined'&&filMode)||(typeof filModeX!=='undefined'&&filModeX)||
       (typeof mvMode!=='undefined'&&mvMode)||(typeof draftMode!=='undefined'&&draftMode)||
       (typeof coqueMode!=='undefined'&&coqueMode)||(typeof extPickFace!=='undefined'&&extPickFace)||
       (typeof faoChainMode!=='undefined'&&faoChainMode)){
      faceEl.textContent='Plan : quittez le mode en cours d\'abord.';return;
    }
    const bl=(typeof bodies!=='undefined'&&bodies)?bodies.filter(function(b){return b&&!b.ghost&&b.mesh;}):[];
    if(!bl.length){faceEl.textContent='Plan : aucun corps à cliquer.';return;}
    const setup=faoSetup(setupId);
    if(!setup){faceEl.textContent='Plan : poste introuvable.';return;}
    faoPlanePick={setupId:setup.id};
    try{renderer.domElement.style.cursor='crosshair';}catch(e){}
    faceEl.textContent='Plan 3+2 : cliquez une FACE SORTANTE de la pièce (Échap annule).';
    if(typeof renderProps==='function')renderProps();
  }catch(e){ try{faceEl.textContent='Plan : impossible ('+e.message+').';}catch(e2){} }
}
function faoPlaneCancel(silent){
  faoPlanePick=null;
  try{renderer.domElement.style.cursor='default';}catch(e){}
  if(!silent){ try{ if(typeof renderProps==='function')renderProps(); }catch(e){} }
}
function faoPlaneCommit(e){
  try{
    if(!faoPlanePick)return;
    const r=renderer.domElement.getBoundingClientRect();
    const ndc=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
    rayc.setFromCamera(ndc,camera);
    const objs=bodies.filter(function(b){return b&&!b.ghost&&b.visible!==false&&b.mesh;})
      .map(function(b){return b.mesh;});
    const hits=objs.length?rayc.intersectObjects(objs,false):[];
    if(!hits.length){faceEl.textContent='Plan : aucune face touchée, réessayez.';return;}
    const h=hits[0];
    const n=h.face&&h.face.normal;
    if(!n){faceEl.textContent='Plan : face illisible, réessayez.';return;}
    let nx=n.x,ny=n.y,nz=n.z;
    try{
      const v=new THREE.Vector3(n.x,n.y,n.z).transformDirection(h.object.matrixWorld);
      nx=v.x;ny=v.y;nz=v.z;
    }catch(e2){}
    const o=faoOrientFromNormal(nx,ny,nz);
    if(o.down){faceEl.textContent='Plan : face tournée vers le BAS — pièce à retourner (non appliquée).';return;}
    const setup=faoSetup(faoPlanePick.setupId);
    if(!setup){faceEl.textContent='Plan : poste introuvable, annulé.';faoPlaneCancel(true);return;}
    faoSnapshot('plan sur la pièce');
    setup.orient={b:o.b,c:o.c};
    faoPlaneCancel(true);
    faoChanged();
    faceEl.textContent='Plan : B '+o.b+'° · C '+o.c+'° appliqués — vérifiez le sens de rotation de votre machine.';
  }catch(err){ try{faceEl.textContent='Plan : impossible ('+err.message+').';}catch(e2){} }
}

/* ----- picking « face » des plans (2026-10-08-002) ----- */
// Le clic sur une face fige son Z (`fz`) dans le plan choisi (référence
// « Sélection ») — même garde-fous de modes que le picking 3+2 (faoPlaneStart).
let faoZPlanePick=null;
function faoZPlaneStart(t){
  // t={setupId,opId,which:'clear'|'retr',slot:1|2|null}
  try{
    if(typeof skEdit!=='undefined'&&skEdit){faceEl.textContent='Plan : fermez l\'esquisse d\'abord.';return;}
    if((typeof filMode!=='undefined'&&filMode)||(typeof filModeX!=='undefined'&&filModeX)||
       (typeof mvMode!=='undefined'&&mvMode)||(typeof draftMode!=='undefined'&&draftMode)||
       (typeof coqueMode!=='undefined'&&coqueMode)||(typeof extPickFace!=='undefined'&&extPickFace)||
       (typeof faoPlanePick!=='undefined'&&faoPlanePick)||(typeof faoChainMode!=='undefined'&&faoChainMode)){
      faceEl.textContent='Plan : quittez le mode en cours d\'abord.';return;
    }
    const bl=(typeof bodies!=='undefined'&&bodies)?bodies.filter(function(b){return b&&!b.ghost&&b.mesh;}):[];
    if(!bl.length){faceEl.textContent='Plan : aucun corps à cliquer.';return;}
    if(!faoSetup(t.setupId)){faceEl.textContent='Plan : poste introuvable.';return;}
    faoZPlanePick=t;
    try{renderer.domElement.style.cursor='crosshair';}catch(e){}
    faceEl.textContent='Plan : cliquez la FACE de référence (Z retenu = point cliqué, Échap annule).';
    if(typeof renderProps==='function')renderProps();
  }catch(e){ try{faceEl.textContent='Plan : impossible ('+e.message+').';}catch(e2){} }
}
function faoZPlaneCancel(silent){
  faoZPlanePick=null;
  try{renderer.domElement.style.cursor='default';}catch(e){}
  if(!silent){ try{ if(typeof renderProps==='function')renderProps(); }catch(e){} }
}
function faoZPlaneCommit(e){
  try{
    if(!faoZPlanePick)return;
    const t=faoZPlanePick;
    const r=renderer.domElement.getBoundingClientRect();
    const ndc=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
    rayc.setFromCamera(ndc,camera);
    const objs=bodies.filter(function(b){return b&&!b.ghost&&b.visible!==false&&b.mesh;})
      .map(function(b){return b.mesh;});
    const hits=objs.length?rayc.intersectObjects(objs,false):[];
    if(!hits.length){faceEl.textContent='Plan : aucune face touchée, réessayez.';return;}
    const z=Math.round(hits[0].point.z*100)/100;
    const setup=faoSetup(t.setupId);
    if(!setup){faceEl.textContent='Plan : poste introuvable, annulé.';faoZPlaneCancel(true);return;}
    let owner=setup, op=null;
    if(t.opId){
      const ops=setup.ops||[];
      for(let i=0;i<ops.length;i++)if(ops[i]&&ops[i].id===t.opId){op=ops[i];break;}
      if(!op){faceEl.textContent='Plan : opération introuvable, annulé.';faoZPlaneCancel(true);return;}
      owner=op;
    }
    const eff=faoPlaneEff(setup,op);
    const base=(t.which==='clear'?eff.clear:eff.retr)||{ref:'brutHaut',dz:0};
    const mm=(base.ref==='max'||base.ref==='min');
    let pl;
    if(t.slot&&mm){
      const cur=(t.slot===1?base.s1:base.s2)||{ref:'brutHaut',dz:0};
      const slot={ref:'face',dz:isFinite(+cur.dz)?+cur.dz:0,fz:z};
      pl=Object.assign({},base);
      pl[t.slot===1?'s1':'s2']=slot;
    }else{
      pl=Object.assign({},base,{ref:'face',fz:z});
    }
    faoSnapshot('plan face (Z '+z.toFixed(2)+')');
    faoPlaneSet(owner,t.which,pl);
    faoZPlaneCancel(true);
    faoChanged();
    faceEl.textContent='Plan : face retenue à Z '+z.toFixed(2)+' mm — valeur résolue à jour dans la fiche.';
  }catch(err){ try{faceEl.textContent='Plan : impossible ('+err.message+').';}catch(e2){} }
}

/* ----- mode sélection : chaîne d'arêtes pour limite d'usinage ----- */
// Germes cliqués (jaune) + tangentes déduites (rouge), comme les congés.
// À la validation on SNAPSHOTE la boucle XY dans op.limit + les ancres des germes :
// la limite survit au rejeu (re-suie auto par faoChainReplay) et à la sauvegarde
// sans OCCT ; arêtes trop déplacées -> stale (alerte) -> re-sélectionner.
let faoChainMode=null, faoChainHover=null;
function faoChainStart(setupId,opId,kind){
  // kind : 'chain' (zone extérieure, défaut) · 'chain2' (zone intérieure,
  // îlot 2026-10-08-003) · 'z' (limite Z d'ébauche 3D).
  try{
    const is2=(kind==='chain2');
    const PRE=(kind==='z')?'Limite Z':(is2?'Chaîne (îlot)':'Chaîne');
    if(typeof skEdit!=='undefined'&&skEdit){faceEl.textContent=PRE+' : fermez l\'esquisse d\'abord.';return;}
    if((typeof filMode!=='undefined'&&filMode)||(typeof filModeX!=='undefined'&&filModeX)||
       (typeof mvMode!=='undefined'&&mvMode)||(typeof draftMode!=='undefined'&&draftMode)||
       (typeof coqueMode!=='undefined'&&coqueMode)||(typeof extPickFace!=='undefined'&&extPickFace)||
       (typeof faoPlanePick!=='undefined'&&faoPlanePick)){
      faceEl.textContent=PRE+' : quittez le mode en cours d\'abord.';return;
    }
    if(!occLive||!occLive.shape){
      if(typeof occHas==='function'&&!occHas()){faceEl.textContent=PRE+' : solide exact indisponible (OCCT non chargé ou aucun volume).';return;}
      try{rebuild();}catch(e){}
      if(!occLive||!occLive.shape){faceEl.textContent=PRE+' : recalcul impossible.';return;}
    }
    let edges=[];
    try{ edges=occSharpEdges(occLive.shape); }catch(e){ edges=[]; }
    if(!edges.length){faceEl.textContent=PRE+' : aucune arête listable.';return;}
    const setup=faoSetup(setupId);
    const op=(setup.ops||[]).filter(function(o){return o.id===opId;})[0];
    if(!op){faceEl.textContent=PRE+' : opération introuvable.';return;}
    const isZ=(kind==='z');
    const old=is2
      ?(op.limit2&&op.limit2.mode==='chain'?op.limit2:null)
      :(op.limit&&op.limit.mode==='chain'?op.limit:null);
    faoChainMode={setupId:setup.id,opId:op.id,edges:edges,seeds:[],
      tangent:isZ?false:(old?!!old.tangent:true),sel:[],
      kind:isZ?'z':(is2?'chain2':'chain')};
    faoChainHover=null;
    faoChainBuildOverlay();
    if(typeof renderProps==='function')renderProps();
    faceEl.textContent=isZ
      ?('Limite Z : cliquez les arêtes des hauteurs ('+edges.length+' listées) · OK valide, Échap annule.')
      :(PRE+' : cliquez des arêtes ('+edges.length+' listées) · tangentes auto '+
        (faoChainMode.tangent?'ON':'OFF')+' · OK valide, Échap annule.');
  }catch(e){ try{faceEl.textContent='Chaîne : impossible ('+e.message+').';}catch(e2){} }
}
function faoZlimStart(setupId,opId){
  // Sélection d'arêtes au service des hauteurs Haut/Bas de l'ébauche 3D.
  faoChainStart(setupId,opId,'z');
}
function faoChainExit(silent){
  try{
    faoChainMode=null; faoChainHover=null;
    if(typeof scene!=='undefined'&&scene){
      const o=scene.getObjectByName('faoChainEdges');
      if(o)scene.remove(o);
    }
    try{renderer.domElement.style.cursor='default';}catch(e){}
    if(!silent){
      faoRefreshFaoUI();
      try{ if(typeof renderProps==='function')renderProps(); }catch(e){}
    }
  }catch(e){}
}
function faoChainBuildOverlay(){
  try{
    if(!faoChainMode)return;
    const old=scene.getObjectByName('faoChainEdges');
    if(old)scene.remove(old);
    const positions=[], colors=[], segEdge=[];
    faoChainMode.edges.forEach(function(e,i){
      const p=e.pts||[];
      for(let k=0;k+1<p.length;k++){
        positions.push(p[k][0],p[k][1],p[k][2],p[k+1][0],p[k+1][1],p[k+1][2]);
        colors.push(0,0,0,0,0,0);
        segEdge.push(i);
      }
    });
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    const mat=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0.95,depthTest:true});
    const l=new THREE.LineSegments(geo,mat);
    l.renderOrder=999;
    l.userData.segEdge=segEdge;
    const grp=new THREE.Group(); grp.name='faoChainEdges'; grp.add(l);
    scene.add(grp);
    faoChainPaint();
  }catch(e){ try{faceEl.textContent='Chaîne : affichage impossible ('+e.message+').';}catch(e2){} }
}
function faoChainIsSeed(i){
  return !!(faoChainMode&&faoChainMode.seeds&&faoChainMode.seeds.indexOf(i)>=0);
}
function faoChainIsSel(i){
  if(!faoChainMode)return false;
  return faoChainMode.sel.indexOf(i)>=0;
}
function faoChainPaint(){
  try{
    const grp=scene.getObjectByName('faoChainEdges');
    if(!grp||!faoChainMode)return;
    const l=grp.children[0];
    if(!l||!l.geometry||!l.geometry.attributes.color)return;
    const col=l.geometry.attributes.color, segEdge=l.userData.segEdge;
    if(!segEdge)return;
    const c=new THREE.Color(), cache={};
    for(let k=0;k<segEdge.length;k++){
      const i=segEdge[k];
      let hex=cache[i];
      if(hex===undefined)hex=cache[i]=faoChainIsSeed(i)?0xffd60a:(faoChainIsSel(i)?0xff453a:(faoChainHover===i?0xffd60a:0x0a84ff));
      c.setHex(hex);
      col.setXYZ(k*2,c.r,c.g,c.b);
      col.setXYZ(k*2+1,c.r,c.g,c.b);
    }
    col.needsUpdate=true;
  }catch(e){}
}
function faoChainPick(e){
  try{
    const grp=scene.getObjectByName('faoChainEdges');
    if(!grp||!faoChainMode)return null;
    const r=renderer.domElement.getBoundingClientRect();
    const ndc=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
    rayc.setFromCamera(ndc,camera);
    rayc.params.Line.threshold=2;
    const hits=rayc.intersectObjects(grp.children,false);
    if(!hits.length)return null;
    const segEdge=hits[0].object.userData.segEdge;
    if(!segEdge)return null;
    const i=segEdge[Math.round(hits[0].index/2)];
    return (i!==undefined&&i>=0&&i<faoChainMode.edges.length)?i:null;
  }catch(e){ return null; }
}
function faoChainSync(){
  if(!faoChainMode)return;
  if(faoChainMode.tangent){
    const all=[];
    (faoChainMode.seeds||[]).forEach(function(s){
      faoTangentSet(faoChainMode.edges,[s]).forEach(function(j){ if(all.indexOf(j)<0)all.push(j); });
    });
    faoChainMode.sel=all;
  }else{
    faoChainMode.sel=(faoChainMode.seeds||[]).slice();
  }
}
function faoChainToggle(e){
  try{
    if(!faoChainMode||!faoChainMode.edges)return;
    const i=faoChainPick(e);
    const PRE=(faoChainMode.kind==='z')?'Limite Z':(faoChainMode.kind==='chain2'?'Chaîne (îlot)':'Chaîne');
    if(i===null||i===undefined||!faoChainMode.edges[i]){
      faceEl.textContent=PRE+' : cliquez une arête bleue.'+
        (faoChainMode.tangent?' Les tangentes sont ajoutées automatiquement.':' Une seule arête par clic.');
      return;
    }
    const k=faoChainMode.seeds.indexOf(i);
    if(k>=0)faoChainMode.seeds.splice(k,1);
    else faoChainMode.seeds.push(i);
    faoChainSync();
    faoChainPaint();
    if(typeof renderProps==='function')renderProps();
    const extra=(faoChainMode.tangent&&faoChainMode.sel.length>faoChainMode.seeds.length)
      ?' ('+faoChainMode.sel.length+' retenues dont '+faoChainMode.seeds.length+' cliquée(s) + tangentes)':'';
    faceEl.textContent=((faoChainMode.kind==='z')?'Limite Z'
      :(faoChainMode.kind==='chain2'?'Chaîne (îlot)':'Chaîne'))+' : '+
      faoChainMode.sel.length+' arête(s)'+extra+'.';
  }catch(err){ try{faceEl.textContent='Sélection impossible ('+err.message+').';}catch(e2){} }
}
function faoChainPanel(p,setup,op){
  const isZ=(faoChainMode.kind==='z');
  const is2=(faoChainMode.kind==='chain2');
  p.appendChild(faoH(isZ?'Limite Z : sélection d\'arêtes'
    :(is2?'Zone intérieure : chaîne d\'arêtes (îlot)':'Limite : chaîne d\'arêtes')));
  const n=faoChainMode.sel.length, ns=(faoChainMode.seeds||[]).length;
  const info=document.createElement('div');
  info.className='fao-meta';
  info.textContent=isZ
    ?(n+' arête(s) — une ou plusieurs en haut, une ou plusieurs en bas : Ztop = Zmax, Zbot = Zmin.')
    :(n+' arête(s) retenue(s)'+(faoChainMode.tangent?' dont '+ns+' cliquée(s) + tangentes':'')+'.');
  p.appendChild(info);
  if(!isZ){
    const r=faoRow();
    const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=!!faoChainMode.tangent;
    cb.onchange=function(){ faoChainMode.tangent=cb.checked; faoChainSync(); faoChainPaint(); faoRefreshFaoUI(); };
    r.appendChild(cb);
    const lb=document.createElement('span'); lb.textContent='Arêtes tangentes auto';
    lb.className='fao-lab'; r.appendChild(lb);
    p.appendChild(r);
  }
  const r2=faoRow();
  const ok=document.createElement('button');
  ok.textContent=isZ?'OK · appliquer la limite Z'
    :(is2?'OK · utiliser comme îlot':'OK · utiliser comme limite');
  ok.style.fontSize='.78rem';
  ok.onclick=function(){ faoChainOk(); };
  const no=document.createElement('button'); no.textContent='Annuler'; no.style.fontSize='.72rem';
  no.onclick=function(){ faoChainExit(); faceEl.textContent=(isZ?'Limite Z':(is2?'Chaîne (îlot)':'Chaîne'))+' : annulée, limite inchangée.'; };
  const clr=document.createElement('button'); clr.textContent='Effacer'; clr.style.fontSize='.72rem';
  clr.onclick=function(){ faoChainMode.seeds=[]; faoChainMode.sel=[]; faoChainPaint(); faoRefreshFaoUI(); };
  r2.appendChild(ok); r2.appendChild(no); r2.appendChild(clr);
  p.appendChild(r2);
  const note=document.createElement('div');
  note.className='fao-note';
  note.textContent=isZ
    ?'Haut et bas sont re-suivis à chaque rejeu (ancres des germes) ; éditer un champ casse le lien, une arête perdue met la fiche en alerte (valeurs gardées).'
    :(is2
      ?'Îlot à préserver : l\'ébauche usine HORS de cette boucle (outil au moins à un rayon + marge du contour — règle outil fixée, pas de choix de côté). Re-suivi automatique à chaque rejeu comme la zone extérieure.'
      :'La boucle est re-suie automatiquement à chaque rejeu (ancres des germes) ; si les arêtes ont trop bougé, la fiche passe en alerte. Chaîne ouverte : refermée d\'office en segment droit.');
  p.appendChild(note);
}
function faoChainOk(){
  try{
    if(!faoChainMode)return;
    const setup=faoSetup(faoChainMode.setupId);
    const op=(setup.ops||[]).filter(function(o){return o.id===faoChainMode.opId;})[0];
    const isZ=(faoChainMode.kind==='z');
    const is2=(faoChainMode.kind==='chain2');
    const PRE=isZ?'Limite Z':(is2?'Chaîne (îlot)':'Chaîne');
    if(!op){faceEl.textContent=PRE+' : opération introuvable.';faoChainExit();return;}
    if(!faoChainMode.sel.length){faceEl.textContent=PRE+' : aucune arête — limite inchangée.';faoChainExit();return;}
    if(isZ){
      // --- Limite Z par arêtes : Zmax/Zmin sur la sélection + ancre par germe.
      const nSel=faoChainMode.sel.length;
      const Z=faoZlimFromEdges(faoChainMode.edges,faoChainMode.sel);
      if(!Z){faoChainExit();faceEl.textContent='Limite Z : sélection invalide (haut > bas requis) — inchangée.';return;}
      faoSnapshot('limite Z par arêtes');
      op.ztop=Z.ztop; op.zbot=Z.zbot;
      // Lien suivi à chaque rejeu (faoZlimRematch) ; éditer un champ casse le
      // lien (faoZlimBreak) ; arête perdue -> stale + alerte, valeurs gardées.
      op.zlim={anchors:Z.anchors,nEdges:nSel,stale:false};
      faoChainExit();
      faoChanged();
      faceEl.textContent='Limite Z : haut '+Z.ztop+' → bas '+Z.zbot+' ('+nSel+' arêtes) enregistrée.';
      return;
    }
    const chains=faoOrderEdges(faoChainMode.edges,faoChainMode.sel);
    let res=faoLoopFromChains(faoChainMode.edges,chains);
    if(!res.loop.length||faoLoopArea(res.loop)<1e-6){
      faceEl.textContent=PRE+' : boucle dégénérée — limite inchangée.';return;
    }
    // Cap : les très longues chaînes sont sous-échantillonnées (clip en O(n)).
    res=faoChainLoopCap(res);
    const nEdges=faoChainMode.sel.length, wasTangent=!!faoChainMode.tangent;
    const old=is2
      ?(op.limit2&&op.limit2.mode==='chain'?op.limit2:null)
      :(op.limit&&op.limit.mode==='chain'?op.limit:null);
    faoSnapshot(is2?'zone intérieure en chaîne':'limite en chaîne');
    const L={mode:'chain',loop:res.loop,closed:res.closed,
      nEdges:nEdges,tangent:wasTangent,
      // Ancres des germes (figées) : permettent à faoChainReplay de re-suivre la
      // boucle à chaque fin de rejeu, et de passer en stale si plus retrouvable.
      anchors:(faoChainMode.seeds||[]).map(function(i){return faoEdgeAnchor(faoChainMode.edges[i]);}).filter(Boolean),
      stale:false,
      side:(old&&old.side)||'center',extra:(old&&isFinite(+old.extra))?+old.extra:0};
    // 2026-10-08-003 : l'îlot intérieur impose la règle outil « out » (dilaté
    // de r+marge, on garde le complément) — pas de choix de côté à l'écran.
    if(is2)L.side='out';
    if(is2)op.limit2=L; else op.limit=L;
    faoChainExit();
    faoChanged();
    faceEl.textContent=PRE+' : '+(is2?'îlot ':'limite ')+(res.closed?'fermée':'refermée')+' ('+
      nEdges+' arêtes) enregistrée.';
  }catch(e){ try{faceEl.textContent=PRE+' : validation impossible ('+e.message+').';}catch(e2){} }
}
try{ faoInitUI(); }catch(e){}
