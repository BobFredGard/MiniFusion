/* ═══════════════ src/98-mep-00-modele.js — Espace Plan : mise en plan 2D ═══════════════
   Espace « PLAN » (3ᵉ espace CAO / FAO / PLAN, overlay par-dessus la fenêtre 3D) :
   • planches multiples (A0→A4, portrait/paysage), cadre ISO + cartouche éditable ;
   • vues projetées PAR CORPS ou assemblée : face/dessus/côté/ISO/caméra, auxiliaires,
     en coupe (demi-espace OCCT exact + hachures 45°), de détail ;
   • toutes les arêtes (vives OCCT + tangentes + silhouettes de maillage), arêtes
     partiellement cachées rognées par recherche de bornes de visibilité, cercles
     reconnaissants (Ø réels) ;
   • cotation avec UN outil intelligent (longueur / distance / Ø / R / angle) et
     tolérances ISO (±, double, classes H7… s6 par plages Ø) ;
   • dessin 2D façon esquisse : ligne/rect/cercle/arc/point/ajuster + contraintes et
     solveur moindres carrés, ancrage des points sur la géométrie projetée ;
   • tout vit dans doc.mep → sauvegardé AVEC la pièce et la FAO (autosave, bundle
     .miniFusion, annuler/rétablir).
   Le module est réparti dans les fichiers 98-mep-*.js : la fonction englobante (et son
   « use strict ») ouverte ici se ferme à la fin de 98-mep-95-export-init.js. Ces fichiers
   ne se lisent qu'assemblés, comme le font déjà le build, le lint et les tests. */
(function(){
  'use strict';

  /* ═══════════════ A. CSS ═══════════════ */
  const css=document.createElement('style');css.id='mepCss';
  css.textContent=`
    #mepWrap{position:absolute;inset:0;z-index:50;display:none;flex-direction:column;background:var(--bg);color:var(--text);font-family:inherit}
    #mepWrap.open{display:flex}
    #mepTabs{display:flex;gap:3px;align-items:center;padding:5px 8px 0;flex:none;overflow-x:auto}
    #mepTabs button{padding:3px 10px;font-size:.72rem;border:1px solid var(--border);background:none;color:var(--text);border-radius:7px 7px 0 0;cursor:pointer;white-space:nowrap}
    #mepTabs button.on{background:var(--surface);border-bottom-color:var(--surface);color:var(--primary);font-weight:600}
    #mepTabs .mepAdd{border-style:dashed;padding:3px 8px}
    #mepToolbar{display:none}
    #mepBody{flex:1;display:flex;min-height:0}
    #mepSheet{flex:1;position:relative;overflow:hidden;background:var(--mepDesk,#8e949e);cursor:url("data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'23'%20height%3D'23'%3E%3Cpath%20d%3D'M11.5%200v23M0%2011.5h23'%20stroke%3D'%23fff'%20stroke-width%3D'4'%2F%3E%3Cpath%20d%3D'M11.5%200.8v21.4M0.8%2011.5h21.4'%20stroke%3D'%23000'%20stroke-width%3D'1.6'%2F%3E%3C%2Fsvg%3E") 11 11,crosshair;min-width:0}
    #mepSvg{position:absolute;left:0;top:0;display:block;width:100%;height:100%}
    #mepSide{width:260px;flex:none;border-left:1px solid var(--border);background:var(--surface);overflow-y:auto;padding:8px;font-size:.74rem;display:block}
    #mepSidePanel #mepSide{width:100%;border-left:none;background:transparent}
    #mepSide h4{margin:8px 0 4px;font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
    #mepSide .row{display:flex;gap:5px;align-items:center;margin:4px 0;flex-wrap:wrap}
    #mepSide label{flex:1;min-width:0;color:var(--muted)}
    #mepSide input,#mepSide select{max-width:118px;padding:3px 6px;font-size:.72rem;border:1px solid var(--border);border-radius:5px;background:var(--bg);color:var(--text)}
    #mepSide input[type=checkbox]{max-width:none;flex:none}
    #mepSide button{padding:3px 8px;font-size:.71rem;border:1px solid var(--border);background:none;color:var(--text);border-radius:6px;cursor:pointer}
    #mepSide button:hover{border-color:var(--primary)}
    #mepSide button.active{background:var(--primary);border-color:var(--primary);color:#fff}
    #mepSide button.danger{border-color:#ff453a;color:#ff453a}
    #mepSide .note{color:var(--muted);font-size:.68rem;margin:4px 0}
    #mepStatus{flex:none;padding:4px 10px;font-size:.7rem;color:var(--muted);border-top:1px solid var(--border);background:var(--surface);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .mepPage{fill:var(--mepPaper,#fff);stroke:var(--mepPaperEdge,#b9c0c9);stroke-width:.5}
    #mepSvg .mepPage{filter:drop-shadow(0 1.5px 4px rgba(0,0,0,.35))}
    #mepSheet.mepCurInv{cursor:url("data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'23'%20height%3D'23'%3E%3Cpath%20d%3D'M11.5%200v23M0%2011.5h23'%20stroke%3D'%23000'%20stroke-width%3D'4'%2F%3E%3Cpath%20d%3D'M11.5%200.8v21.4M0.8%2011.5h21.4'%20stroke%3D'%23fff'%20stroke-width%3D'1.6'%2F%3E%3C%2Fsvg%3E") 11 11,crosshair}
    .mepFrame{stroke:var(--mepFrameCol,#222);stroke-width:.9;fill:none}
    .mepFrame2{stroke:var(--mepFrameCol,#222);stroke-width:.45;fill:none;stroke-dasharray:1.5 2.5;opacity:.6}
    .mepTitleBlock{stroke:var(--mepFrameCol,#222);stroke-width:.8;fill:var(--mepPaper,#fff)}
    .mepTitleText{font:5px sans-serif;fill:var(--mepText,#111)}
    .mepTitleVal{font:7.5px sans-serif;fill:var(--mepText,#111);font-weight:600}
    .mepRevText{font:3.6px sans-serif;fill:var(--mepText,#111)}
    .mepGrid{stroke:var(--mepGridCol,#d8dde3);stroke-width:.4}
    .mepEnt{fill:none;stroke-linecap:round;stroke-linejoin:round;shape-rendering:geometricPrecision}
    .mepFace{shape-rendering:geometricPrecision;stroke-linejoin:round}
    .mepSharp{stroke:var(--mepInk,#151515);stroke-width:var(--mepLwThick,.72)}
    .mepTangent{stroke:var(--mepInk2,#7a8088);stroke-width:var(--mepLwThin,.42);stroke-opacity:.92}
    .mepBrk{stroke:var(--mepInk,#151515);stroke-width:var(--mepLwThin,.42);fill:none;stroke-linejoin:round} /* limite de coupe locale (trait fin continu) */
    .mepHidden{stroke:var(--mepHid,#59606a);stroke-width:var(--mepLwHid,.42);stroke-dasharray:2 1.2;stroke-linecap:butt}
    .mepSect{stroke:var(--mepInk,#151515);stroke-width:calc(var(--mepLwThick,.72) * 1.22)}
    .mepThread{fill:none;stroke:var(--mepThreadCol,#a4a9b0);stroke-width:calc(var(--mepLwThin,.42) * 0.7)} /* fond de filet ISO 6410 : gris clair, plus fin */
    .mepHatch{stroke:var(--mepHatchCol,#333);stroke-width:var(--mepLwHatch,.35)}
    .mepHatch.mepHatchFill{fill:var(--mepHatchCol,#333);stroke:none}
    .mepSel{stroke:#0a84ff!important;stroke-width:1.6!important}
    .mepSelEnt{stroke:#ffd60a!important;stroke-width:1.2!important}
    .mepHovEnt{stroke:#00b8ff!important;stroke-width:1.4!important}
    .mepDimGhost{opacity:.85;stroke-dasharray:3 2}
    .mepVB{fill:rgba(10,132,255,.04);stroke:#0a84ff;stroke-width:.8;stroke-dasharray:4 2.5;pointer-events:none}
    .mepVBSel{fill:none;stroke:#0a84ff;stroke-width:1;pointer-events:none}
    .mepDimL{stroke:var(--mepDimCol,#111);stroke-width:var(--mepLwDim,.55);fill:none}
    .mepDimL.mepDimX{stroke-width:var(--mepLwExt,var(--mepLwDim,.55))}
    .mepDimT{font-family:sans-serif;font-size:var(--mepDimH,7px);fill:var(--mepDimCol,#111);font-weight:600;paint-order:stroke;stroke:var(--mepPaper,#fff);stroke-width:1.5;stroke-linejoin:round}
    .mepDimRef{fill:var(--mepHid,#7a7f86)}
    .mepDimL.mepDimSel{stroke:#ff3b30!important}
    .mepDimT.mepDimSel{fill:#ff3b30!important}
    .mepLbl{font-family:sans-serif;font-size:var(--mepLblH,7px);fill:var(--mepText,#111);font-weight:700;paint-order:stroke;stroke:var(--mepPaper,#fff);stroke-width:1.6;stroke-linejoin:round}
    #mepSvg,#mepSvg *{-webkit-user-select:none;-moz-user-select:none;user-select:none}
    .mepLbl,.mepDimT{pointer-events:none}
    .mepCut{stroke:#0a84ff;stroke-width:1.1;fill:none}
    .mepCutLine{stroke:var(--mepInk,#151515);stroke-width:var(--mepLwThin,.42);stroke-dasharray:10 2 1.5 2;fill:none}
    .mepCutEnd{stroke:var(--mepInk,#151515);stroke-width:var(--mepLwThick,.72);fill:none;stroke-linecap:butt}
    .mepCutArr{stroke:var(--mepInk,#151515);stroke-width:var(--mepLwThin,.42);fill:none}
    .mepCutLbl{fill:var(--mepInk,#151515)}
    .mepFrameTxt{font-family:sans-serif;fill:var(--mepText,#111)}
    .mepCutPrev{fill:none;stroke:#0a84ff;stroke-width:.6;stroke-dasharray:3 1.5;pointer-events:none}
    .mepCutHot{stroke:#0a84ff!important;stroke-width:.8!important}
    .mepTtlHov{fill:rgba(10,132,255,.12);stroke:#0a84ff;stroke-width:.3;stroke-dasharray:1 1;pointer-events:none}
    .mepDetailC{stroke:var(--mepInk,#151515);stroke-width:var(--mepLwThin,.42);fill:none}
    .mepDetailB{stroke:var(--mepInk,#151515);stroke-width:var(--mepLwThin,.42);fill:none;stroke-dasharray:6 1.5 1 1.5}
    .mepVcGhost{fill:rgba(10,132,255,.06);stroke:#0a84ff;stroke-width:1;stroke-dasharray:5 3;vector-effect:non-scaling-stroke}
    .mepVcLine{stroke:#0a84ff;stroke-width:1.4;fill:none;vector-effect:non-scaling-stroke}
    .mepVcBad{stroke:#ff3b30!important;stroke-dasharray:4 3}
    .mepVcSnap{fill:none;stroke:#0a84ff;stroke-width:1.2;vector-effect:non-scaling-stroke;pointer-events:none}
    .mepVcSnapAx{stroke:#ff9500}
    .mepSecBtn{fill:#fff;stroke:#0a84ff;stroke-width:1.2;vector-effect:non-scaling-stroke;cursor:pointer}
    .mepSecBtnOk{fill:#0a84ff}
    .mepSecBtnTxt{fill:#0a84ff;font-weight:700;pointer-events:none;font-family:system-ui,sans-serif}
    .mepSecBtnOk+.mepSecBtnTxt{fill:#fff}
    .mepVcTxt{fill:#0a84ff;font:700 4px sans-serif}
    .mepCutS{stroke:#0a84ff;stroke-width:.5;fill:none}
    .mepSk{fill:none;stroke-linecap:round}
    .mepSkPt{fill:var(--mepPaper,#fff);stroke:#64d2ff;stroke-width:1.2;vector-effect:non-scaling-stroke}
    .mepSkPtSel{stroke:#ff9f0a;fill:#ff9f0a}
    .mepSkPtFix{stroke:#ff453a}
    .mepSkCst{fill:none;stroke:#ff9f0a;stroke-width:1;stroke-dasharray:4 3;vector-effect:non-scaling-stroke}
    .mepSkPtLk{stroke:#bf5af2;stroke-width:1.6}
    .mepTbLine{stroke:var(--mepFrameCol,#222);stroke-width:var(--mepLwThin,.42);fill:none;stroke-linecap:square}
    .mepTbThick{stroke-width:var(--mepLwThick,.72)}
    .mepSkThick{stroke-width:var(--mepLwThick,.72)}
    .mepSkThin{stroke-width:var(--mepLwThin,.42)}
    .mepLtHid{stroke-dasharray:2 1.2;stroke-linecap:butt}
    .mepLtAxis{stroke-dasharray:8 2 1.5 2;stroke-linecap:butt}
    .mepSkSelE{stroke:#ff9f0a!important}
    .mepSkHovE{stroke:#0a84ff!important;stroke-width:.6!important}
    .mepSkSelT{fill:#ff9f0a!important}
    .mepSkCon{stroke:#0a84ff;fill:none;stroke-width:1;vector-effect:non-scaling-stroke}
    .mepSkConBg{fill:rgba(10,132,255,.14);stroke:#0a84ff;stroke-width:.8;vector-effect:non-scaling-stroke}
    .mepSkConBg.mepSkConSel,.mepSkCon.mepSkConSel{stroke:#ff9f0a;fill:rgba(255,159,10,.25)}
    .mepSkConT{fill:#0a84ff;font-family:sans-serif;font-weight:700;font-size:3px}
    .mepBoxWin{fill:rgba(10,132,255,.08);stroke:#0a84ff;stroke-width:1;vector-effect:non-scaling-stroke}
    .mepBoxCross{fill:rgba(48,209,88,.08);stroke:#30d158;stroke-width:1;stroke-dasharray:5 3;vector-effect:non-scaling-stroke}
    .mepSkDimL{stroke:#0a84ff;stroke-width:1;vector-effect:non-scaling-stroke;fill:none}
    .mepSkFull{stroke:var(--mepInk,#151515)}
    .mepSkFree{stroke:var(--mepSkFreeCol,#0a84ff)}
    .mepDraft{stroke:#ffd60a;stroke-width:.7;stroke-dasharray:3 2;fill:none}
    .mepSnap{fill:none;stroke:#ffd60a;stroke-width:.9}
    .mepArrowM{fill:var(--mepDimCol,#111)}
    .mepArrowSel{fill:#ff3b30}
    .mepArrowK{fill:var(--mepInk,#151515)}
    .mepAxis{fill:none;stroke:var(--mepAxisCol,#111);stroke-width:var(--mepLwAxis,.35);stroke-dasharray:8 2 1.5 2;stroke-linecap:butt;stroke-linejoin:round;pointer-events:none}
    .mepThr3d{stroke:#e8930c;stroke-width:.16;fill:none;stroke-linecap:round;pointer-events:none}
    .mepThr3dRing{stroke-dasharray:.8 .6}
    .mepAxisCross{fill:none;stroke:var(--mepAxisCol,#111);stroke-width:var(--mepLwAxisX,.62);stroke-linecap:butt;pointer-events:none}
    .mepAxisSel{stroke:#0066ff!important;stroke-width:1.1!important}
    .mepAxisPick{fill:none;stroke:#ffd60a;stroke-width:1.1;pointer-events:none}
  `;
  document.head.appendChild(css);

  /* ═══════════════ B. constantes ═══════════════ */
  const NS='http://www.w3.org/2000/svg';
  const FORMATS={A0:[841,1189],A1:[594,841],A2:[420,594],A3:[297,420],A4:[210,297]};
  // liste unique du panneau : A4H, A4V … A0H, A0V (H = paysage, V = portrait) + format manuel (sh.fw × sh.fh mm)
  const FORMAT_LIST=['A4','A3','A2','A1','A0'].flatMap(f=>[f+'H',f+'V']);
  const FORMAT_MANUEL='Manuel';
  function mepFmtCode(sh){return sh.format===FORMAT_MANUEL?FORMAT_MANUEL:sh.format+(sh.orient==='landscape'?'H':'V');}
  function mepFmtLabel(sh){return sh.format===FORMAT_MANUEL?mepFmtNum(sh.fw,1)+' × '+mepFmtNum(sh.fh,1):mepFmtCode(sh);}
  const MARGIN=12,TITLE_H=26;
  const MEP_SCALES=[[1,'1:1'],[2,'2:1'],[5,'5:1'],[0.5,'1:2'],[0.2,'1:5'],[2.5,'5:2'],[0.25,'1:4'],[0.1,'1:10'],[1.25,'5:4'],[0.4,'2:5'],[0.75,'3:4']];
  const COL={sharp:'#1a1a1a',tangent:'#6a6f76',hidden:'#8a9098',sect:'#1a1a1a',
    skFree:'#64d2ff',skFull:'#e8e8ea',sel:'#ff9f0a',ok:'#30d158',err:'#ff453a',snap:'#ffd60a',ref:'#bf5af2'};
  /* vues standard : dir = DE la pièce VERS l'observateur ; u = droite papier ; v = bas papier */
  const MEP_VIEWS={
    front:{dir:[0,-1,0],u:[1,0,0],v:[0,0,-1],lab:'Face'},
    top:{dir:[0,0,1],u:[1,0,0],v:[0,-1,0],lab:'Dessus'},
    bottom:{dir:[0,0,-1],u:[1,0,0],v:[0,1,0],lab:'Dessous'},
    right:{dir:[1,0,0],u:[0,1,0],v:[0,0,-1],lab:'Côté droit'},
    left:{dir:[-1,0,0],u:[0,-1,0],v:[0,0,-1],lab:'Côté gauche'},
    rear:{dir:[0,1,0],u:[-1,0,0],v:[0,0,-1],lab:'Arrière'},
    iso:{dir:[0.62,-0.62,0.48],u:null,v:null,lab:'ISO'}
  };
  /* ═══════════════ tolérances ISO 2768-mK + ISO 286 (µm) ═══════════════ */
  // V0.24.0 : table ISO 286 complète (A … ZC, a … zc, IT01 … IT18) partagée — src/05-iso286.js.
  // Liste courte du sélecteur : ajustements usuels (toutes les classes restent saisissables).
  const MEP_TOL_FITS=['H7/g6','H7/h6','H7/js6','H7/k6','H7/m6','H7/n6','H7/p6','H7/r6','H7/s6','H8/f7','H8/h7','H8/e8',
    'H9/d9','H9/h9','H11/c11','H11/h11','G7/h6','F8/h7','K7/h6','N7/h6','P7/h6'];
  // classe simple (H7) ou ajustement (H7/g6) valide ? → nom normalisé, sinon ''
  function mepTolClsNorm(cls){
    const s=String(cls||'').replace(/\s+/g,'');
    const q=s.split('/');
    if(q.length===1)return iso286Parse(q[0])?q[0]:'';
    if(q.length===2){const a=iso286Parse(q[0]),b=iso286Parse(q[1]);return (a&&b&&a.hole&&!b.hole)?q[0]+'/'+q[1]:'';}
    return '';
  }
  /* plage de tolérance pour une classe et un Ø nominal → {lo,hi} en mm (écart sur la cote) */
  function mepTolRange(cls,nom){
    if(!cls||!nom||nom<=0)return null;
    // Ajustement (H7/g6) : on renvoie les deux plages — alésage et arbre.
    const parts=String(cls).indexOf('/')>=0?String(cls).split('/'):null;
    if(parts){
      if(parts.length!==2||!parts[0]||!parts[1])return null;
      const hole=mepTolRange(parts[0],nom),shaft=mepTolRange(parts[1],nom);
      if(!hole||!shaft)return null;
      return{lo:hole.lo,hi:hole.hi,fit:{hole,shaft,holeCls:parts[0],shaftCls:parts[1]}};
    }
    return iso286Range(cls,nom);
  }
  function mepFmtNum(v,dp){
    if(!isFinite(v))return '—';
    let s=(+v).toFixed(dp===undefined?(Math.abs(v)>=10?1:(Math.abs(v)>=1?2:3)):dp);
    s=s.replace(/\.?0+$/,'');
    return s==='-0'?'0':s;
  }
  /* ═══════════════ C. modèle doc.mep ═══════════════ */
  // géométrie de la pointe de flèche, pilotée par MEP_DIM_STYLE (98-00-style-plan.js)
  function mepArrowGeom(){
    const len=MEP_DIM_STYLE.arrowLen;
    const h=len*Math.tan(MEP_DIM_STYLE.arrowAngle*Math.PI/360);
    return{len,h,total:MEP_DIM_STYLE.arrowAngle};
  }
  /* style de cotation : valeurs par défaut du fichier, surchargées par les
     réglages « Paramètres — Plan » et mémorisées dans localStorage. */
  const MEP_AXIS={overrun:3,tol:0.2,minAlign:3,minPitch:3};
  const MEP_DIM_STYLE_KEY='minifusion_mepDimStyle';
  const MEP_DIM_STYLE_DEF=Object.assign({},MEP_DIM_STYLE);
  const MEP_TEXT_STYLE_DEF=Object.assign({},MEP_TEXT_STYLE);
  // écriture ISO 3098 : hauteur des majuscules h (mm papier) ↔ corps de la police (font-size)
  function mepFs(h){return +((+h||MEP_TEXT_STYLE.noteH)/MEP_TEXT_STYLE.capRatio).toFixed(3);}
  function mepCapH(fs){return +((+fs||0)*MEP_TEXT_STYLE.capRatio).toFixed(2);}
  function mepIsoH(h){return MEP_TEXT_STYLE.iso.some(x=>Math.abs(x-h)<0.06);}
  function mepTextStyleSync(){MEP_DIM_STYLE.textHeight=mepFs(MEP_TEXT_STYLE.dimH);}
  let mepDimStyleLoaded=false;
  function mepDimStyleLoad(){
    if(mepDimStyleLoaded)return;
    mepDimStyleLoaded=true;
    try{
      const raw=localStorage.getItem(MEP_DIM_STYLE_KEY);
      if(!raw)return;
      const o=JSON.parse(raw)||{};
      const num=(k,min,max)=>{
        if(o[k]===undefined||o[k]===null||o[k]==='')return;
        const v=+o[k];
        if(Number.isFinite(v))MEP_DIM_STYLE[k]=Math.min(max,Math.max(min,v));
      };
      const hNum=(k)=>{const v=+o[k];if(o[k]!==undefined&&o[k]!==null&&o[k]!==''&&Number.isFinite(v))MEP_TEXT_STYLE[k]=Math.min(20,Math.max(1.8,v));};
      hNum('dimH');hNum('lblH');hNum('noteH');
      // ancien réglage : textHeight = corps de la police → hauteur des majuscules (7 → 5)
      if(o.dimH===undefined&&Number.isFinite(+o.textHeight)&&+o.textHeight>0)
        MEP_TEXT_STYLE.dimH=Math.min(20,Math.max(1.8,Math.round(+o.textHeight*MEP_TEXT_STYLE.capRatio*10)/10));
      mepTextStyleSync();
      num('arrowAngle',10,90);
      num('arrowLen',2,30);
      if(o.color==='theme'||(typeof o.color==='string'&&/^#0a84ff$/i.test(o.color)))MEP_DIM_STYLE.color='theme'; // ancien défaut bleu → couleur du thème
      else if(typeof o.color==='string'&&/^#[0-9a-f]{6}$/i.test(o.color))MEP_DIM_STYLE.color=o.color;
    }catch(e){}
  }
  function mepDimStyleSave(){
    try{
      localStorage.setItem(MEP_DIM_STYLE_KEY,JSON.stringify({
        dimH:MEP_TEXT_STYLE.dimH,lblH:MEP_TEXT_STYLE.lblH,noteH:MEP_TEXT_STYLE.noteH,
        color:MEP_DIM_STYLE.color,
        arrowAngle:MEP_DIM_STYLE.arrowAngle,
        arrowLen:MEP_DIM_STYLE.arrowLen
      }));
    }catch(e){}
  }
  function mepDimStyleReset(){
    Object.assign(MEP_DIM_STYLE,MEP_DIM_STYLE_DEF);
    Object.assign(MEP_TEXT_STYLE,MEP_TEXT_STYLE_DEF);mepTextStyleSync();
    mepDimStyleSave();
    mepApplyDimStyle();
  }
  function mepApplyDimStyle(){
    try{
      const st=mepSvgEl&&mepSvgEl.style;
      if(st){
        const set=(k,v)=>{
          try{ if(typeof st.setProperty==='function')st.setProperty(k,v); else st[k]=v; }
          catch(e){ st[k]=v; }
        };
        const c=MEP_DIM_STYLE.color;
        set('--mepDimCol',(!c||c==='theme')?'var(--mepAccent,#0a84ff)':c); // écran et export « Couleur » ; export « Noir » : noir (ISO)
        mepTextStyleSync();
        set('--mepDimH',MEP_DIM_STYLE.textHeight+'px');
        set('--mepLblH',mepFs(MEP_TEXT_STYLE.lblH)+'px');
      }
    }catch(e){}
    try{mepBuildMarkers();}catch(e){}
  }

  function mepEnsure(){
    if(!doc.mep||typeof doc.mep!=='object')doc.mep={cur:0,sheets:[]};
    if(!Array.isArray(doc.mep.sheets))doc.mep.sheets=[];
    if(!doc.mep.sheets.length)doc.mep.sheets.push(mepNewSheet(1));
    if(!(doc.mep.cur>=0&&doc.mep.cur<doc.mep.sheets.length))doc.mep.cur=0;
    doc.mep.sheets.forEach(mepNormSheet);
    // migration unique : les caméras enregistrées avant la correction de base
    // (Z monde vers le haut papier) sont reconnues pour être réorientées.
    if(doc.mep.camBasisV!==2){
      doc.mep.sheets.forEach(sh=>{
        (sh.views||[]).forEach(v=>{
          if(v&&v.kind==='base'&&!v.vk&&v.dir)v.camera=true;
        });
      });
      doc.mep.camBasisV=2;
    }
    return doc.mep;
  }
  function mepNormSheet(sh){
    sh.id=sh.id||('sh'+Math.random().toString(36).slice(2,9));
    sh.name=sh.name||'Planche';
    sh.format=FORMATS[sh.format]||sh.format===FORMAT_MANUEL?sh.format:'A3';
    sh.orient=sh.orient==='portrait'?'portrait':'landscape';
    if(sh.format===FORMAT_MANUEL){
      sh.fw=Math.min(5000,Math.max(50,+sh.fw||420));sh.fh=Math.min(5000,Math.max(50,+sh.fh||297));
      sh.orient=sh.fw>=sh.fh?'landscape':'portrait';
    }
    sh.views=Array.isArray(sh.views)?sh.views:[];
    sh.views.forEach(v=>{
      if(!v)return;
      v.axes=Array.isArray(v.axes)?v.axes:[];
      v.autoAxes=!!v.autoAxes;
      v.autoPitch=!!v.autoPitch;
      if(v.axExt&&typeof v.axExt!=='object')delete v.axExt;
    });
    sh.dims=Array.isArray(sh.dims)?sh.dims:[];
    sh.title=sh.title&&typeof sh.title==='object'?sh.title:{};
    sh.seq=sh.seq>0?sh.seq:1;sh.dseq=sh.dseq>0?sh.dseq:1;
    if(!sh.sk)sh.sk=null;
  }
  function mepNewSheet(n){
    const sh={id:'sh'+Date.now().toString(36)+Math.floor(Math.random()*1e4),name:'Planche '+n,
      format:'A3',orient:'landscape',views:[],dims:[],sk:null,
      title:{projet:'MiniFusion — Plan',auteur:'—',date:new Date().toLocaleDateString('fr-FR'),tb:null},
      frame:mepFrameUserDef()||undefined,
      seq:1,dseq:1};
    const def=mepTbDefault();if(def)mepTbApply(sh,def); // format et cadre du modèle par défaut aussi
    return sh;
  }
  function mepSheet(){const m=mepEnsure();return m.sheets[m.cur];}
  /* cadre de la planche : marges (mm, bord de feuille → trait du cadre), épaisseur,
     liseré intérieur, repères de centrage. ISO 5457 : 20 mm à gauche (reliure), 10 ailleurs,
     trait ≥ 0,7 mm, repères de centrage au milieu des 4 côtés. */
  // zones : repérage 1…n / A…n en bandes de 50 mm centrées ; trim : coins de coupe (15 mm) ;
  // col / mcol : couleur du cadre / des repères ('' = encre de la planche)
  const MEP_FRAME_DEF={l:MARGIN,r:MARGIN,t:MARGIN,b:MARGIN,lw:0.9,inner:true,centre:false,zones:false,trim:false,col:'',mcol:''};
  const MEP_FRAME_ISO={l:20,r:10,t:10,b:10,lw:0.7,inner:false,centre:true,zones:true,trim:true,col:'',mcol:''};
  // relevé sur SIRAP-13-001.pdf (plan maison Justet) : trait 1 mm #6B6BA1, repères fins #3E2B2C
  const MEP_FRAME_JUSTET={l:20,r:10,t:10,b:10,lw:1,inner:false,centre:true,zones:true,trim:true,col:'#6b6ba1',mcol:'#3e2b2c'};
  const MEP_FRAME_KEYS=['l','r','t','b','lw','inner','centre','zones','trim','col','mcol','zw','zh','zx0','zy0'];
  function mepFrameUserDef(){try{const o=JSON.parse(localStorage.getItem('mep_frame_def')||'null');return o&&typeof o==='object'?o:null;}catch(e){return null;}}
  function mepFrameOf(sh){
    const f=Object.assign({},MEP_FRAME_DEF,(sh&&sh.frame)||{});
    ['col','mcol'].forEach(k=>{f[k]=/^#[0-9a-f]{6}$/i.test(f[k]||'')?f[k]:'';});
    ['l','r','t','b'].forEach(k=>{f[k]=Math.min(40,Math.max(0,+f[k]||0));});
    f.lw=Math.min(2,Math.max(0.1,+f.lw||MEP_FRAME_DEF.lw));
    return f;
  }
  function mepPageWH(sh){
    if(sh.format===FORMAT_MANUEL)return{W:+sh.fw||420,H:+sh.fh||297};
    const s=FORMATS[sh.format]||FORMATS.A3;return sh.orient==='landscape'?{W:s[1],H:s[0]}:{W:s[0],H:s[1]};}
  function mepPageDim(sh){
    sh=sh||mepSheet();const{W,H}=mepPageWH(sh),f=mepFrameOf(sh);
    const th=mepTbH(sh);
    return{W,H,ix:f.l,iy:f.t,iw:W-f.l-f.r,ih:H-f.t-f.b-th,th,fr:f};
  }
  let mepSeq=0;
  function mepUid(p){return p+(++mepSeq)+'_'+Date.now().toString(36);}
  function mepView(sh,id){return sh.views.find(v=>v.id===id)||null;}
  /* mutation documentaire : snapshot + dirty + rendu + autosave différé.
     Le plan ne change JAMAIS la géométrie 3D : on marque sale sans incrémenter
     _docVersion, sinon chaque pose de cote / glissement de vue jetterait le cache
     HLR et forcerait un rejeu complet (latence de 50-100 ms après le geste).
     Les vues dont la signature change (corps, mode, direction, coupe, détail,
     ombrage/couleur/opacité) sont réinjectées par mepViewSig ; une modification
     du modèle, elle, passe par markDirty() ailleurs et invalide le cache par _docVersion. */
  let mepAutoT=null;
  function mepEdit(label,fn,noUndo){
    // noUndo : l'instantané a déjà été pris au début d'un geste continu (glissement de
    // vue) — le reprendre à la fin écraserait l'état d'avant par l'état d'après.
    if(!noUndo){try{docPushUndo('Plan : '+label);}catch(e){}}
    let r=null;
    try{r=fn();}catch(e){try{console.warn('mep',e);}catch(e2){}}
    try{dirty=true;}catch(e){}
    try{mepRender();}catch(e){}

    if(mepAutoT)clearTimeout(mepAutoT);
    mepAutoT=setTimeout(()=>{try{autosave();}catch(e){}},900); // le plan vit dans doc.mep : brouillon = pièce
    return r;
  }
  /* ═══════════════ D. géométrie : bases, vecteurs ═══════════════ */
  function mepNorm(a){const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];}
  function mepDot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
  function mepCross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
  function mepSub(a,b){return[a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
  function mepBasisFromDir(dir,upHint){
    const d=mepNorm(dir);
    let up=(upHint&&Math.abs(mepDot(upHint,d))<0.98)?upHint:[0,0,1];
    if(Math.abs(mepDot(up,d))>0.98)up=Math.abs(d[2])>0.9?[0,1,0]:[0,0,1];
    const u=mepNorm(mepCross(up,d));           // droite papier
    const v=mepNorm(mepCross(u,d));            // bas papier (opposé à la verticale monde)
    return{dir:d,u,v};
  }
  function mepBasisOf(view){
    if(view.kind==='base'&&MEP_VIEWS[view.vk]){
      const b=MEP_VIEWS[view.vk];
      const r=b.u?{dir:b.dir.slice(),u:b.u.slice(),v:b.v.slice()}:mepBasisFromDir(b.dir);
      if(view.flip)r.v=[-r.v[0],-r.v[1],-r.v[2]];
      return r;
    }
    // caméra : la base est TOUJOURS recalculée depuis la direction (Z monde vers
    // le haut papier), y compris pour les vues déjà enregistrées avec l'ancienne
    // base « tête en bas ».
    if(view.kind==='base'&&view.camera&&view.dir){
      const r=mepBasisFromDir(view.dir);
      if(view.flip)r.v=[-r.v[0],-r.v[1],-r.v[2]];
      return r;
    }
    const u=mepNorm(view.u||[1,0,0]);
    const d=mepNorm(view.dir||[0,-1,0]);
    let v=mepCross(u,d);const L=Math.hypot(v[0],v[1],v[2]);
    if(L<1e-6)return mepBasisFromDir(d);
    v=[v[0]/L,v[1]/L,v[2]/L];
    if(view.flip)v=[-v[0],-v[1],-v[2]];
    return{dir:d,u,v};
  }
  function mepOrtho(view){const b=mepBasisOf(view);view.dir=b.dir;view.u=b.u;view.v=b.v;}
  /* local (mm modèle) d'un point monde ; papier = ancre + local×échelle */
  function mepLocal(view,p){return[mepDot(p,view.u),mepDot(p,view.v)];}
  function mepToSheet(view,lx,ly){return{x:view.x+lx*view.scale,y:view.y+ly*view.scale};}
  function mepFromSheet(view,sx,sy){return{x:(sx-view.x)/view.scale,y:(sy-view.y)/view.scale};}
