/* ═══════════════ src/98-mise-en-plan.js — Espace Plan : mise en plan 2D ═══════════════
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
     .miniFusion, annuler/rétablir). */
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
    .mepHidden{stroke:var(--mepHid,#59606a);stroke-width:var(--mepLwHid,.42);stroke-dasharray:3.5 2.5;stroke-linecap:butt}
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
    .mepLtHid{stroke-dasharray:3.5 2.5;stroke-linecap:butt}
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
    .mepAxisCross{fill:none;stroke:var(--mepAxisCol,#111);stroke-width:.62;stroke-linecap:butt;pointer-events:none}
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
  const MEP_STEPS=[3,6,10,18,30,50,80,120,180,250,315,400,500];
  const MEP_IT={6:[6,8,9,11,13,16,19,22,25,29,32,36,40],7:[10,12,15,18,21,25,30,35,40,46,52,57,63],
    8:[14,18,22,27,33,39,46,54,63,72,81,89,97],9:[25,30,36,43,52,62,74,87,100,115,130,140,155],
    11:[40,48,58,70,84,100,120,140,160,185,210,230,250]};
  /* déviations EI/ES des arbrets (ei, µm, négatif ou positif) par lettre */
  const MEP_DEV={g:[2,4,5,6,7,9,10,12,14,15,16,18,20],k:[0,1,1,1,2,2,2,3,3,4,4,4,5],
    m:[2,4,6,7,8,9,11,13,15,17,20,21,23],n:[4,8,10,12,15,17,20,23,27,31,33,36,40],
    p:[6,12,15,18,22,26,32,37,43,50,56,62,68],r:[10,19,23,28,34,41,48,58,68,79,88,98,108],
    s:[14,24,28,33,41,48,59,71,87,102,117,132,151]};
  const MEP_TOL_CLASSES=['','H7','H8','H9','H11','JS9','JS11','h6','h7','h8','g6','k6','m6','n6','p6','s6',
    'H7/g6','H7/h6','H7/js6','H7/k6','H7/n6','H7/p6','H7/s6','H8/h7','H9/h9','H11/h11'];
  function mepStepIdx(d){for(let i=0;i<MEP_STEPS.length;i++)if(d<=MEP_STEPS[i])return i;return MEP_STEPS.length-1;}
  function mepIt(grade,d){const a=MEP_IT[grade];return a?a[mepStepIdx(d)]:0;}
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
    const m=/^([A-Za-z]+)(\d+)$/.exec(cls);if(!m)return null;
    const L=m[1],g=+m[2],d=Math.abs(nom),i=mepStepIdx(d),IT=mepIt(g,d);
    if(L==='H')return{lo:0,hi:IT/1000};
    if(L==='h')return{lo:-IT/1000,hi:0};
    if(L==='JS'||L==='js')return{lo:-IT/2000,hi:IT/2000};
    const dev=MEP_DEV[L.toLowerCase()];
    if(!dev)return null;
    const dv=dev[i]/1000;
    // g/G : la déviation fondamentale est une MAGNITUDE : arbre g → es = −dv,
    // alésage G → EI = +dv (miroir). Les autres lettres k…s gardent ei = +dv.
    if(L==='g')return{lo:-dv-IT/1000,hi:-dv};
    if(L==='G')return{lo:dv,hi:dv+IT/1000};
    if(L===L.toLowerCase())return{lo:dv,hi:dv+IT/1000}; // minuscule = arbre, ei > 0
    return{lo:-dv-IT/1000,hi:-dv}; // majuscule K…S = alésage, ES = −ei de l'arbre
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
    return{id:'sh'+Date.now().toString(36)+Math.floor(Math.random()*1e4),name:'Planche '+n,
      format:'A3',orient:'landscape',views:[],dims:[],sk:null,
      title:{projet:'MiniFusion — Plan',auteur:'—',date:new Date().toLocaleDateString('fr-FR'),tb:mepTbDefault()},
      frame:mepFrameUserDef()||undefined,
      seq:1,dseq:1};
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
  const MEP_FRAME_KEYS=['l','r','t','b','lw','inner','centre','zones','trim','col','mcol'];
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
  /* ═══════════════ E. cache géométrie ═══════════════ */
  const mepGeoCache=new Map(); // viewId → {ver,sig,geo}
  function mepViewSig(v){
    let s=[v.kind==='dxf'?'dxf:'+((v.dxf&&v.dxf.rev)||0):'',mepRound(v.dir),mepRound(v.u),mepRound(v.v),v.bodyId||'',v.mode||'hide',v.tangent?1:0,
      v.hlrExact===false?'soft':'exact',v.shade?1:0,v.render3d?(v.mirror?'1m':1):0,
      v.section?mepRound(v.section.p)+mepRound(v.section.n)+(v.section.pts?JSON.stringify(v.section.pts):''):'',v.detail?v.detail.cx+','+v.detail.cy+','+v.detail.r:'',mepOblOf(v)?'obl:'+mepOblOf(v).a+','+mepOblOf(v).k:'',mepPerspOf(v)?'persp:'+mepPerspOf(v).fov:'',v.asm?'asm:'+asmPlanSig():''].join('|');
    /* l'ombrage et le rendu 3D dépendent de la couleur/opacité des corps :
       ces réglages ne changent pas _docVersion, donc on les met dans la clé
       de cache. Le thème influe aussi sur l'environnement du rendu 3D. */
    if(v.shade||v.render3d){
      try{
        s+='|'+mepMeshesOf(v).map(b=>{
          const st=mepBodyStyleOf(b);
          return (b.id||b.bodyId||'')+':'+st.col+':'+st.op;
        }).join(';');
      }catch(e){}
      if(v.render3d){
        try{s+='|th:'+(document.body.getAttribute('data-theme')||'');}catch(e){}
      }
    }
    return s;
  }
  function mepRound(a){return a?Array.from(a).map(x=>(+x).toFixed(3)).join(','):'';}
  /* 2026-10-22-008 : PROJECTION OBLIQUE (perspective cavalière) d'une vue principale
     (« vue caméra : vue non orthogonale avec réglage de la valeur de la fuyante ») —
     v.obl = {a: angle des fuyantes (°, depuis l'horizontale, vers le haut), k: coefficient
     de réduction}. Le plan de face reste en vraie grandeur ; la profondeur w (vers l'arrière)
     se dessine le long des fuyantes : papier = (P·u + k·w·cos a, P·v − k·w·sin a).
     Réalisé par un CISAILLEMENT exact de la forme (P' = P + k·w·(cos a·u − sin a·v), w = −P·dir)
     puis le HLR orthogonal habituel : arêtes cachées exactes pour la direction oblique. */
  function mepOblOf(v){
    const o=v&&v.kind==='base'&&!v.section&&!v.detail&&v.obl;
    if(!o)return null;
    const a=isFinite(+o.a)?Math.max(-180,Math.min(180,+o.a)):45;
    const k=(+o.k>0)?Math.min(2,+o.k):0.5;
    return{a,k};
  }
  function mepOblShear(sh,view){
    const O=mepOblOf(view);if(!O||!sh)return sh;
    const b=mepBasisOf(view),ca=Math.cos(O.a*Math.PI/180),sa=Math.sin(O.a*Math.PI/180);
    const sv=[O.k*(ca*b.u[0]-sa*b.v[0]),O.k*(ca*b.u[1]-sa*b.v[1]),O.k*(ca*b.u[2]-sa*b.v[2])];
    // M = I − s ⊗ dir  (w = −P·dir)
    const g=new occt.gp_GTrsf_1();
    for(let i=0;i<3;i++)for(let j=0;j<3;j++)g.SetValue(i+1,j+1,(i===j?1:0)-sv[i]*b.dir[j]);
    try{
      const t=new occt.BRepBuilderAPI_GTransform_2(sh,g,true);
      return t.IsDone()?t.Shape():sh;
    }catch(e){try{console.warn('mep oblique',e);}catch(e2){}return sh;}
  }
  /* 2026-10-22-010 : vue en PERSPECTIVE « comme la vue 3D » (retour : « pour la vue oblique je
     pensais plus comme la vue 3D ») — v.persp = {fov : angle de champ (°) = la « fuyante » :
     plus il est grand, plus les fuyantes convergent}. L'œil E est sur l'axe de la vue, à la
     distance qui fait tenir la pièce dans l'angle de champ ; le plan passant par le centre C
     de la pièce reste en VRAIE GRANDEUR : papier = C·(u,v) + (P−E)·(u,v) × dist / profondeur.
     Le noyau de ce build n'a pas de HLR perspective (HLRBRep_Algo absent) : arêtes EXACTES
     (occSharpEdges) + contours apparents du maillage vus depuis l'œil, visibilité par rayon
     œil → point sur le maillage. Rendu 3D : vraie caméra perspective, même cadre. */
  function mepPerspOf(v){
    const o=v&&v.kind==='base'&&!v.section&&!v.detail&&v.persp;
    if(!o)return null;
    return{fov:isFinite(+o.fov)?Math.max(5,Math.min(120,+o.fov)):35};
  }
  function mepPerspCam(view,list){
    const P=mepPerspOf(view);if(!P)return null;
    const b=mepBasisOf(view);
    let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9],n=0;
    (list||mepMeshesOf(view)).forEach(bd=>{
      try{const bb=new THREE.Box3().setFromObject(bd.mesh);if(bb.isEmpty())return;
        lo=[Math.min(lo[0],bb.min.x),Math.min(lo[1],bb.min.y),Math.min(lo[2],bb.min.z)];
        hi=[Math.max(hi[0],bb.max.x),Math.max(hi[1],bb.max.y),Math.max(hi[2],bb.max.z)];n++;}catch(e){}
    });
    if(!n)return null;
    const C=[(lo[0]+hi[0])/2,(lo[1]+hi[1])/2,(lo[2]+hi[2])/2];
    const S=Math.max(1,Math.hypot(hi[0]-lo[0],hi[1]-lo[1],hi[2]-lo[2]));
    const dist=(S/2)/Math.tan(P.fov*Math.PI/360)+S/2; // l'œil reste hors de la pièce
    const E=[C[0]+b.dir[0]*dist,C[1]+b.dir[1]*dist,C[2]+b.dir[2]*dist];
    const cu=mepDot(C,b.u),cv=mepDot(C,b.v);
    const proj=p=>{const q=[p[0]-E[0],p[1]-E[1],p[2]-E[2]],dep=Math.max(1e-6,-mepDot(q,b.dir)),f=dist/dep;
      return[cu+mepDot(q,b.u)*f,cv+mepDot(q,b.v)*f,dep];};
    return{fov:P.fov,E,C,S,dist,b,proj,cu,cv};
  }
  function mepPerspBuild(geo,view,list,shapes,exact,mode){
    const K=mepPerspCam(view,list);if(!K){geo.src='aucun corps';return geo;}
    const meshes=list.map(bd=>bd.mesh).filter(Boolean);
    meshes.forEach(m=>{try{m.updateMatrixWorld(true);}catch(e){}});
    const rc=new THREE.Raycaster(),tol=Math.max(0.05,K.S*0.004);
    const visible=p=>{
      if(mode==='wire'||!meshes.length)return true;
      const d=[p[0]-K.E[0],p[1]-K.E[1],p[2]-K.E[2]],L=Math.hypot(d[0],d[1],d[2]);if(!(L>1e-9))return true;
      rc.set(new THREE.Vector3(K.E[0],K.E[1],K.E[2]),new THREE.Vector3(d[0]/L,d[1]/L,d[2]/L));
      rc.far=L-tol;rc.near=0;
      try{return rc.intersectObjects(meshes,false).length===0;}catch(e){return true;}
    };
    const step=Math.max(0.3,K.S/120); // pas d'échantillonnage (mm modèle)
    const emit=(pts,kind)=>{
      // polyligne 3D → tronçons visibles (et cachés en mode pointillé), projetés en perspective
      const P=[];
      for(let i=0;i+1<pts.length;i++){
        const a=pts[i],c=pts[i+1],L=Math.hypot(c[0]-a[0],c[1]-a[1],c[2]-a[2]),n=Math.min(200,Math.max(1,Math.ceil(L/step)));
        for(let k=(i?1:0);k<=n;k++){const t=k/n;P.push([a[0]+(c[0]-a[0])*t,a[1]+(c[1]-a[1])*t,a[2]+(c[2]-a[2])*t]);}
      }
      if(P.length<2)return;
      const V=P.map(visible),Q=P.map(K.proj);
      for(let i=0;i+1<P.length;i++){
        const vis=V[i]&&V[i+1];
        if(!vis&&mode!=='dash')continue;
        const a=Q[i],c=Q[i+1];if(Math.hypot(c[0]-a[0],c[1]-a[1])<1e-6)continue;
        geo.els.push({t:'L',x1:a[0],y1:a[1],x2:c[0],y2:c[1],k:vis?kind:'hidden'});
      }
    };
    // arêtes exactes
    if(exact)shapes.forEach(sh=>{
      let edges=[];try{edges=occSharpEdges(sh)||[];}catch(e){edges=[];}
      edges.forEach(e=>{
        if(!e||!e.pts||e.pts.length<2)return;
        if(!e.sharp&&!view.tangent)return;
        emit(e.pts.map(p=>(p&&typeof p.x==='number')?[p.x,p.y,p.z]:p).filter(Boolean),e.sharp?'sharp':'tangent');
      });
    });
    // contours apparents vus de l'œil (faces lisses) + arêtes de maillage des corps sans solide exact
    list.forEach(bd=>{
      const g=bd.mesh&&bd.mesh.geometry;if(!g||!g.attributes||!g.attributes.position)return;
      const pos=g.attributes.position,idx=g.index,mw=bd.mesh.matrixWorld.elements;
      const nT=Math.min(120000,idx?idx.count/3:pos.count/3);
      const W=i=>{const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
        return[mw[0]*x+mw[4]*y+mw[8]*z+mw[12],mw[1]*x+mw[5]*y+mw[9]*z+mw[13],mw[2]*x+mw[6]*y+mw[10]*z+mw[14]];};
      const key=p=>p.map(x=>Math.round(x*1e3)).join(',');
      const emap=new Map();
      const hasExact=exact&&shapes.length&&!!mepExactOf(bd);
      for(let t=0;t<nT;t++){
        const ii=[idx?idx.getX(3*t):3*t,idx?idx.getX(3*t+1):3*t+1,idx?idx.getX(3*t+2):3*t+2],A=ii.map(W);
        const nn=mepCross([A[1][0]-A[0][0],A[1][1]-A[0][1],A[1][2]-A[0][2]],[A[2][0]-A[0][0],A[2][1]-A[0][1],A[2][2]-A[0][2]]);
        const nl=Math.hypot(nn[0],nn[1],nn[2]);if(!(nl>1e-12))continue;
        const N=[nn[0]/nl,nn[1]/nl,nn[2]/nl],m=[(A[0][0]+A[1][0]+A[2][0])/3,(A[0][1]+A[1][1]+A[2][1])/3,(A[0][2]+A[1][2]+A[2][2])/3];
        const front=mepDot(N,[K.E[0]-m[0],K.E[1]-m[1],K.E[2]-m[2]])>0;
        for(let k=0;k<3;k++){const a=A[k],c=A[(k+1)%3],ka=key(a),kc=key(c),kk=ka<kc?ka+'|'+kc:kc+'|'+ka;
          const r=emap.get(kk);if(r)r.f.push({front,N});else emap.set(kk,{a,c,f:[{front,N}]});}
      }
      emap.forEach(r=>{
        if(r.f.length===2){
          const s=mepDot(r.f[0].N,r.f[1].N);
          if(r.f[0].front!==r.f[1].front&&(s>0.85||!hasExact))emit([r.a,r.c],'sharp'); // contour apparent
          else if(!hasExact&&s<0.85&&(r.f[0].front||r.f[1].front))emit([r.a,r.c],'sharp'); // arête vive (maillage seul)
        }else if(r.f.length===1&&!hasExact)emit([r.a,r.c],'sharp');
      });
    });
    geo.src=exact?'OCCT (perspective)':'maillage (perspective)';
    view._persp={E:K.E,dist:K.dist,cu:K.cu,cv:K.cv};
    return geo;
  }
  function mepGeoOf(view){
    const c=mepGeoCache.get(view.id);
    const ver=(typeof _docVersion!=='undefined')?_docVersion:0;
    if(c&&c.ver===ver&&c.sig===mepViewSig(view))return c.geo;
    const geo=mepBuildGeo(view);
    mepGeoCache.set(view.id,{ver,sig:mepViewSig(view),geo});
    return geo;
  }
  /* ═══════════════ F. silhouette de maillage ═══════════════ */
  function mepSilhouettes(mesh,viewDir){
    const g=mesh&&mesh.geometry;if(!g||!g.attributes||!g.attributes.position)return[];
    const pos=g.attributes.position,idx=g.index;
    const nT=idx?idx.count/3:pos.count/3;
    if(!(nT>0)||nT>400000)return[];
    const side=new Int8Array(nT);
    const edgeMap=new Map(); // clé sommet quantisé → [tri…]
    const vi=(t,k)=>idx?idx.getX(t*3+k):t*3+k;
    // Les positions de géométrie sont locales au maillage : une pièce importée
    // peut avoir une matrice monde non identitaire. Sans cette transformation,
    // les silhouettes ne coïncident plus avec les arêtes OCCT projetées et les
    // tangentes extérieures restent grises.
    const mw=mesh.matrixWorld?mesh.matrixWorld.elements:null;
    const P=i=>{
      const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
      if(!mw)return[x,y,z];
      return[mw[0]*x+mw[4]*y+mw[8]*z+mw[12],
        mw[1]*x+mw[5]*y+mw[9]*z+mw[13],
        mw[2]*x+mw[6]*y+mw[10]*z+mw[14]];
    };
    const qp=p=>Math.round(p[0]*200)+','+Math.round(p[1]*200)+','+Math.round(p[2]*200);
    for(let t=0;t<nT;t++){
      const a=vi(t,0),b=vi(t,1),c=vi(t,2);
      const A=P(a),B=P(b),C=P(c);
      const e1=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],e2=[C[0]-A[0],C[1]-A[1],C[2]-A[2]];
      const n=mepCross(e1,e2);
      const f=mepDot(n,viewDir);
      side[t]=f>1e-9?1:(f<-1e-9?-1:1);
      [[A,B],[B,C],[C,A]].forEach(pr=>{
        const k=qp(pr[0])+';'+qp(pr[1]);
        const k2=qp(pr[1])+';'+qp(pr[0]);
        const key=edgeMap.has(k)?k:(edgeMap.has(k2)?k2:k);
        if(!edgeMap.has(key))edgeMap.set(key,[]);
        const arr=edgeMap.get(key);
        if(arr.length<2)arr.push(t);
      });
    }
    // reconstruit les coords exactes des deux sommets via le premier triangle
    const res=[];
    const done=new Set();
    edgeMap.forEach((tris,key)=>{
      if(tris.length<2||side[tris[0]]===side[tris[1]]||done.has(key))return;done.add(key);
      const t=tris[0];
      const A=P(vi(t,0)),B=P(vi(t,1)),C=P(vi(t,2));
      const parts=key.split(';');
      const findPt=qs=>{
        const cand=[A,B,C];
        for(let i=0;i<cand.length;i++){
          if(qp(cand[i])===qs)return cand[i];
        }
        const arr=qs.split(',').map(Number);
        return[arr[0]/200,arr[1]/200,arr[2]/200];
      };
      res.push([findPt(parts[0]),findPt(parts[1])]);
    });
    return res;
  }
  /* ═══════════════ G. HLR ═══════════════ */
  let mepRC=null;
  function mepMeshesOf(view){
    // vue « Assemblage » (V0.6.7) : corps du composant actif + ceux de ses instances (48-composants-plan)
    if(view&&view.asm&&asmPlanOn())return asmPlanBodies();
    const out=[];const list=(typeof bodies!=='undefined'&&bodies)||[];
    list.forEach(b=>{
      if(!b||b.ghost||b.kind==='ghost'||!b.mesh||b.mesh.visible===false)return;
      if(view.bodyId&&b.bodyId!==view.bodyId&&b.id!==view.bodyId)return;
      out.push(b);
    });
    return out;
  }
  /* style d'un corps pour l'ombrage PLAN : couleur + opacité réelles (3D) */
  function mepBodyStyleOf(b){
    let id=null;
    try{id=(typeof bodyIdOfRuntime==='function')?bodyIdOfRuntime(b):(b&&b.bodyId);}catch(e){}
    let col=(b&&b.color)||0x9a9aa0;
    try{if(id&&typeof bodyColorOf==='function')col=bodyColorOf(id)||col;}catch(e){}
    let op=1;
    const mm=b&&b.mesh&&b.mesh.material;
    const m=Array.isArray(mm)?mm[0]:mm;
    if(m&&m.transparent&&typeof m.opacity==='number')op=m.opacity;
    else{
      try{
        if(id&&typeof bodyOpOf==='function')op=bodyOpOf(id);
        if(id&&typeof bodyGlassOf==='function')op=Math.min(op,bodyGlassOf(id));
      }catch(e){}
    }
    if(!(op>0.05&&op<=1))op=1;
    return{id: id,col: col,op: op,transparent: op<0.999};
  }
  function mepShadeLights(view){
    const d=view.dir,u=view.u,v=view.v;
    return{
      L1:mepNorm([d[0]*0.50+u[0]*0.65-v[0]*0.35,
        d[1]*0.50+u[1]*0.65-v[1]*0.35,
        d[2]*0.50+u[2]*0.65-v[2]*0.35]),
      L2:mepNorm([d[0]*0.35-u[0]*0.60+v[0]*0.50,
        d[1]*0.35-u[1]*0.60+v[1]*0.50,
        d[2]*0.35-u[2]*0.60+v[2]*0.50])
    };
  }
  function mepShadeHex(c,k){
    const r=(c>>16)&255,g=(c>>8)&255,b=c&255;
    const sh=x=>Math.max(0,Math.min(255,Math.round(x*k+14)));
    return'#'+sh(r).toString(16).padStart(2,'0')+sh(g).toString(16).padStart(2,'0')+sh(b).toString(16).padStart(2,'0');
  }
  /* triangle monde → face ombrée projetée ; null si face arrière ou dégénérée */
  function mepShadeTri(view,A,B,C,col,op,lights){
    lights=lights||mepShadeLights(view);
    const e1=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],e2=[C[0]-A[0],C[1]-A[1],C[2]-A[2]];
    let n=mepCross(e1,e2);
    const nl=Math.hypot(n[0],n[1],n[2]);
    if(!(nl>1e-9))return null;
    n=[n[0]/nl,n[1]/nl,n[2]/nl];
    const d=view.dir,u=view.u,v=view.v;
    // vue oblique (cavalière) : projecteur q = dir + k(cos a·u − sin a·v), papier cisaillé
    const O=mepOblOf(view),kc=O?O.k*Math.cos(O.a*Math.PI/180):0,ks=O?O.k*Math.sin(O.a*Math.PI/180):0;
    const q=O?[d[0]+kc*u[0]-ks*v[0],d[1]+kc*u[1]-ks*v[1],d[2]+kc*u[2]-ks*v[2]]:d;
    const K=mepPerspOf(view)?(view._pk||(view._pk=mepPerspCam(view))):null; // perspective : vers l'œil
    if(K){if(mepDot(n,[K.E[0]-A[0],K.E[1]-A[1],K.E[2]-A[2]])<=1e-7)return null;}
    else if(mepDot(n,q)<=1e-7)return null;
    const P=K?(p=>{const r=K.proj(p);return[r[0],r[1],-r[2]];}):O?(p=>{const w=-mepDot(p,d);return[mepDot(p,u)+kc*w,mepDot(p,v)-ks*w,mepDot(p,d)];})
      :(p=>[mepDot(p,u),mepDot(p,v),mepDot(p,d)]);
    const a=P(A),b=P(B),c=P(C);
    const area=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
    if(Math.abs(area)<1e-6)return null;
    const k=Math.min(1.08,0.34+0.62*Math.max(0,mepDot(n,lights.L1))
      +0.22*Math.max(0,mepDot(n,lights.L2)));
    return{p:[a,b,c],c:mepShadeHex(col,k),o:op,d:(a[2]+b[2]+c[2])/3};
  }
  function mepShadedFaces(view){
    const faces=[];
    const list=mepMeshesOf(view);
    if(!list.length)return faces;
    const lights=mepShadeLights(view);
    view._pk=null; // caméra perspective recalculée pour ce jeu de faces
    const mwOf=b=>b.mesh&&b.mesh.matrixWorld;
    const wp=(pos,mw,i)=>{
      const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
      const e=mw&&mw.elements;
      if(!e)return[x,y,z];
      return[e[0]*x+e[4]*y+e[8]*z+e[12],
        e[1]*x+e[5]*y+e[9]*z+e[13],
        e[2]*x+e[6]*y+e[10]*z+e[14]];
    };
    list.forEach(bd=>{
      const g=bd.mesh&&bd.mesh.geometry;
      if(!g||!g.attributes||!g.attributes.position)return;
      const pos=g.attributes.position,idx=g.index;
      const nT=idx?idx.count/3:pos.count/3;
      if(!(nT>0)||nT>200000)return;
      try{bd.mesh.updateMatrixWorld();}catch(e){}
      const mw=mwOf(bd),st=mepBodyStyleOf(bd);
      const e=mw&&mw.elements;
      const det=e?(e[0]*(e[5]*e[10]-e[6]*e[9])-e[4]*(e[1]*e[10]-e[2]*e[9])+e[8]*(e[1]*e[6]-e[2]*e[5])):1;
      const flip=det<0;
      const maxT=Math.min(nT,160000);
      for(let t=0;t<maxT;t++){
        const i0=idx?idx.getX(t*3):t*3;
        const i1=idx?idx.getX(t*3+1):t*3+1;
        const i2=idx?idx.getX(t*3+2):t*3+2;
        const A=wp(pos,mw,i0),B=wp(pos,mw,i1),C=wp(pos,mw,i2);
        const f=mepShadeTri(view,A,flip?C:B,flip?B:C,
          st.col,st.op,lights);
        if(f)faces.push(f);
      }
    });
    faces.sort((a,b)=>a.d-b.d); // peintre : du plus loin au plus proche
    return faces;
  }
  /* filets cosmétiques en ombrage (2026-10-23) : l'hélice de la vue 3D, projetée comme les faces ;
     seuls les morceaux visibles (lancer de rayon vers l'observateur) sont gardés. En descendant
     dans le trou, un tour entièrement caché arrête l'hélice : plus bas, tout l'est aussi. */
  function mepThreadSegs(view){
    if(typeof holeThreadPaths!=='function')return[];
    const meshes=mepMeshesOf(view);if(!meshes.length)return[];
    const d=view.dir,u=view.u,v=view.v;
    const O=mepOblOf(view),kc=O?O.k*Math.cos(O.a*Math.PI/180):0,ks=O?O.k*Math.sin(O.a*Math.PI/180):0;
    const q=O?[d[0]+kc*u[0]-ks*v[0],d[1]+kc*u[1]-ks*v[1],d[2]+kc*u[2]-ks*v[2]]:d;
    const ql=Math.hypot(q[0],q[1],q[2])||1,qn=[q[0]/ql,q[1]/ql,q[2]/ql];
    const K=mepPerspOf(view)?(view._pk||(view._pk=mepPerspCam(view))):null;
    const P=K?(p=>K.proj(p)):O?(p=>{const w=-mepDot(p,d);return[mepDot(p,u)+kc*w,mepDot(p,v)-ks*w];}):(p=>[mepDot(p,u),mepDot(p,v)]);
    const toEye=p=>{if(!K)return qn;const e=[K.E[0]-p[0],K.E[1]-p[1],K.E[2]-p[2]],l=Math.hypot(e[0],e[1],e[2])||1;return[e[0]/l,e[1]/l,e[2]/l];};
    const vis=(a,b)=>{const m=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];return mepVisible(m,toEye(m),null,meshes);};
    const out=[];
    holeThreadPaths(16,0.12).forEach(T=>{ // 0,12 mm vers l'axe : hors des facettes de la paroi
      if(view.bodyId&&T.bodyId&&T.bodyId!==view.bodyId)return;
      const H=T.helix,per=Math.max(4,Math.round(T.spt||16));
      let hidRun=0;
      for(let i=1;i<H.length;i++){
        if(vis(H[i-1],H[i])){const a=P(H[i-1]),b=P(H[i]);out.push([a[0],a[1],b[0],b[1],0]);hidRun=0;}
        else if(++hidRun>=per&&i>per)break;
      }
      const R=T.ring;
      for(let i=1;i<R.length;i++)if(vis(R[i-1],R[i])){const a=P(R[i-1]),b=P(R[i]);out.push([a[0],a[1],b[0],b[1],1]);}
    });
    return out;
  }
  /* ═══════════════ D2. rendu 3D bitmap d'une vue ═══════════════ */
  /* Rendu orthographique hors écran, aligné sur la base papier de la vue :
    la caméra regarde le long de view.dir, avec up=-view.v. L'image obtenue
    couvre exactement le même cadre (u,v) que les arêtes et les cotes. */
  function mepRender3dImage(view){
    try{
      if(typeof THREE==='undefined'||typeof renderer==='undefined'||!renderer||
        typeof scene==='undefined'||!scene)return null;
      const list=mepMeshesOf(view);
      if(!list.length)return null;
      const b=mepBasisOf(view);view.dir=b.dir;view.u=b.u;view.v=b.v;
      // miroir (option de la vue) : reflet de la pièce seule sous son point le plus bas (Z monde),
      // estompé vers le bas sur 60 % de sa hauteur — ni sol ni ombre ; le reflet entre dans le cadre
      const mir=!!view.mirror;
      let fz=Infinity,tz=-Infinity;
      const u=b.u,vv=b.v,dir=b.dir;
      const O=mepOblOf(view),kc=O?O.k*Math.cos(O.a*Math.PI/180):0,ks=O?O.k*Math.sin(O.a*Math.PI/180):0;
      let minu=1e9,maxu=-1e9,minv=1e9,maxv=-1e9,mind=1e9,maxd=-1e9,n=0;
      let su0=1e9,su1=-1e9,sv0=1e9,sv1=-1e9; // cadre papier (cisaillé en oblique)
      const K=mepPerspOf(view)?mepPerspCam(view,list):null; // perspective : cadre projeté
      for(let bi=0;bi<list.length;bi++){
        const mesh=list[bi]&&list[bi].mesh;
        const g=mesh&&mesh.geometry;
        if(!g||!g.attributes||!g.attributes.position)continue;
        try{mesh.updateMatrixWorld(true);}catch(e){}
        const pos=g.attributes.position,idx=g.index;
        const mw=mesh.matrixWorld&&mesh.matrixWorld.elements;
        const count=idx?idx.count:pos.count;
        for(let i=0;i<count;i++){
          const j=idx?idx.getX(i):i;
          const x=pos.getX(j),y=pos.getY(j),z=pos.getZ(j);
          const px=mw?(mw[0]*x+mw[4]*y+mw[8]*z+mw[12]):x;
          const py=mw?(mw[1]*x+mw[5]*y+mw[9]*z+mw[13]):y;
          const pz=mw?(mw[2]*x+mw[6]*y+mw[10]*z+mw[14]):z;
          if(pz<fz)fz=pz;if(pz>tz)tz=pz;
          const du=px*u[0]+py*u[1]+pz*u[2];
          const dv=px*vv[0]+py*vv[1]+pz*vv[2];
          const dd=px*dir[0]+py*dir[1]+pz*dir[2];
          if(du<minu)minu=du;if(du>maxu)maxu=du;
          if(dv<minv)minv=dv;if(dv>maxv)maxv=dv;
          if(dd<mind)mind=dd;if(dd>maxd)maxd=dd;
          let su=du-kc*dd,sv=dv+ks*dd; // w = −dd
          if(K){const q=K.proj([px,py,pz]);su=q[0];sv=q[1];}
          if(su<su0)su0=su;if(su>su1)su1=su;if(sv<sv0)sv0=sv;if(sv>sv1)sv1=sv;
          n++;
        }
      }
      if(!n||!(maxu>minu)||!(maxv>minv))return null;
      const fadeL=Math.max(1,(tz-fz)*0.6);
      if(mir&&isFinite(fz)){ // 2e passe : sommets réfléchis (z -> 2 fz - z, bornés à la zone de fondu), cadre élargi au reflet
        for(let bi=0;bi<list.length;bi++){
          const mesh=list[bi]&&list[bi].mesh,g=mesh&&mesh.geometry;if(!g||!g.attributes||!g.attributes.position)continue;
          const pos=g.attributes.position,mw=mesh.matrixWorld&&mesh.matrixWorld.elements,st=Math.max(1,Math.floor(pos.count/20000));
          for(let j=0;j<pos.count;j+=st){
            const x=pos.getX(j),y=pos.getY(j),z=pos.getZ(j);
            const px=mw?(mw[0]*x+mw[4]*y+mw[8]*z+mw[12]):x,py=mw?(mw[1]*x+mw[5]*y+mw[9]*z+mw[13]):y;
            const pz=Math.max(fz-fadeL,2*fz-(mw?(mw[2]*x+mw[6]*y+mw[10]*z+mw[14]):z));
            const du=px*u[0]+py*u[1]+pz*u[2],dv=px*vv[0]+py*vv[1]+pz*vv[2],dd=px*dir[0]+py*dir[1]+pz*dir[2];
            if(du<minu)minu=du;if(du>maxu)maxu=du;if(dv<minv)minv=dv;if(dv>maxv)maxv=dv;if(dd<mind)mind=dd;if(dd>maxd)maxd=dd;
            let su=du-kc*dd,sv=dv+ks*dd;
            if(K){const q=K.proj([px,py,pz]);su=q[0];sv=q[1];}
            if(su<su0)su0=su;if(su>su1)su1=su;if(sv<sv0)sv0=sv;if(sv>sv1)sv1=sv;
          }
        }
      }
      const pad=Math.max(0.5,(maxu-minu+maxv-minv)*0.012);
      const l=su0-pad,r=su1+pad,t=sv0-pad,btm=sv1+pad;
      const aspect=(r-l)/Math.max(1e-9,btm-t);
      const LONG=1600;
      let W,H;
      if(aspect>=1){W=LONG;H=Math.max(64,Math.round(W/aspect));}
      else{H=LONG;W=Math.max(64,Math.round(H*aspect));}
      const cx=(minu+maxu)/2,cy=(minv+maxv)/2,cd=(mind+maxd)/2;
      const center=new THREE.Vector3(
        u[0]*cx+vv[0]*cy+dir[0]*cd,
        u[1]*cx+vv[1]*cy+dir[1]*cd,
        u[2]*cx+vv[2]*cy+dir[2]*cd);
      /* la caméra vise le centre : le frustum est exprimé dans SES coordonnées,
         donc relatif au centre (u,v), pas dans les coordonnées papier absolues. */
      const depth=Math.max(1,maxd-mind);
      const dist=depth*2+Math.max(10,(maxu-minu+maxv-minv));
      // centre papier (cisaillé) du point visé : le frustum est relatif à lui
      const cxs=cx-kc*cd,cys=cy+ks*cd;
      let cam;
      if(K){
        // vraie caméra perspective à l'œil, frustum décentré sur le cadre papier (plan de C en vraie grandeur)
        const near=Math.max(0.05,K.dist-K.S),far=K.dist+K.S*2;
        cam=new THREE.PerspectiveCamera(K.fov,1,near,far);
        cam.up.set(-vv[0],-vv[1],-vv[2]);
        cam.position.set(K.E[0],K.E[1],K.E[2]);
        cam.lookAt(new THREE.Vector3(K.C[0],K.C[1],K.C[2]));
        const f=near/K.dist;
        cam.projectionMatrix.makePerspective((l-K.cu)*f,(r-K.cu)*f,-(t-K.cv)*f,-(btm-K.cv)*f,near,far);
        if(cam.projectionMatrixInverse)cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
      }else{
      cam=new THREE.OrthographicCamera(l-cxs,r-cxs,cys-t,cys-btm,0.01,dist+depth*3+100);
      cam.up.set(-vv[0],-vv[1],-vv[2]);
      cam.position.set(center.x+dir[0]*dist,center.y+dir[1]*dist,center.z+dir[2]*dist);
      cam.lookAt(center);
      cam.updateProjectionMatrix();
      }
      if(O){
        // repère caméra : x = u, y = −v, z = dir ; profondeur relative (P−C)·dir = z + dist
        // x' = x − kc(z + dist), y' = y − ks(z + dist)  (cavalière, cf. mepOblShear)
        const S=new THREE.Matrix4().set(1,0,-kc,-kc*dist, 0,1,-ks,-ks*dist, 0,0,1,0, 0,0,0,1);
        cam.projectionMatrix.multiply(S);
        if(cam.projectionMatrixInverse)cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
      }
      cam.updateMatrixWorld(true);
      /* ne garder que les corps de la vue et les lumières : pas de sol,
         de repère, d'arêtes ni d'esquisse dans l'image. */
      const keep=new Set();
      list.forEach(bd=>{
        let o=bd.mesh;
        while(o){keep.add(o);o=o.parent;}
      });
      // filets cosmétiques des trous de la vue (comme la 3D) : groupe temporaire
      let thrGrp=null;
      try{
        if(typeof holeThreadPaths==='function'){
          const hel=[],rng=[],seg=(arr,pts)=>{for(let i=1;i<pts.length;i++){const p=pts[i-1],q=pts[i];arr.push(p[0],p[1],p[2],q[0],q[1],q[2]);}};
          holeThreadPaths().forEach(T=>{if(view.bodyId&&T.bodyId&&T.bodyId!==view.bodyId)return;seg(hel,T.helix);seg(rng,T.ring);});
          if(hel.length){
            thrGrp=new THREE.Group();
            const mkL=(arr,dash)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));
              const m=dash?new THREE.LineDashedMaterial({color:0xe8930c,dashSize:0.8,gapSize:0.6}):new THREE.LineBasicMaterial({color:0xe8930c});
              const l=new THREE.LineSegments(g,m);if(dash&&l.computeLineDistances)l.computeLineDistances();return l;};
            thrGrp.add(mkL(hel,false));if(rng.length)thrGrp.add(mkL(rng,true));
            scene.add(thrGrp);thrGrp.traverse(o=>keep.add(o));
          }
        }
      }catch(e){thrGrp=null;}
      scene.traverse(o=>{
        if(o&&o.isLight){let p=o;while(p){keep.add(p);p=p.parent;}}
      });
      const saved=[];
      scene.traverse(o=>{
        if(o!==scene&&!keep.has(o)){saved.push([o,o.visible]);o.visible=false;}
      });
      const oldTarget=renderer.getRenderTarget?renderer.getRenderTarget():null;
      const oldClear=renderer.getClearColor?renderer.getClearColor(new THREE.Color()):null;
      const oldAlpha=renderer.getClearAlpha?renderer.getClearAlpha():1;
      const oldAuto=renderer.autoClear;
      const oldVp=renderer.getViewport?renderer.getViewport(new THREE.Vector4()):null;
      const oldBg=scene.background;
      let rt=null;
      // reflet : copie symétrique de chaque corps (même géométrie), opacité décroissante vers le bas
      const mirObjs=[];
      if(mir&&isFinite(fz)){
        try{
          const M=new THREE.Matrix4().makeTranslation(0,0,fz).multiply(new THREE.Matrix4().makeScale(1,1,-1)).multiply(new THREE.Matrix4().makeTranslation(0,0,-fz));
          list.forEach(bd=>{
            const src=bd.mesh;if(!src||!src.geometry)return;
            const mats=(Array.isArray(src.material)?src.material:[src.material]).map(m0=>{
              const m=m0.clone();m.transparent=true;m.depthWrite=true;
              m.onBeforeCompile=sh=>{
                sh.uniforms.uFz={value:fz};sh.uniforms.uFl={value:fadeL};
                sh.vertexShader='varying float vMz;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vMz=(modelMatrix*vec4(transformed,1.0)).z;');
                sh.fragmentShader='uniform float uFz; uniform float uFl; varying float vMz;\n'+sh.fragmentShader.replace('#include <dithering_fragment>',
                  '#include <dithering_fragment>\n { float t=clamp((uFz-vMz)/uFl,0.0,1.0); gl_FragColor.a*=0.5*(1.0-t)*(1.0-t); }');
              };
              m.customProgramCacheKey=()=>'mepMirror';
              return m;});
            const o=new THREE.Mesh(src.geometry,Array.isArray(src.material)?mats:mats[0]);
            o.matrixAutoUpdate=false;o.matrix.copy(M).multiply(src.matrixWorld);o.matrixWorld.copy(o.matrix);o.renderOrder=-1;
            scene.add(o);keep.add(o);mirObjs.push(o);
          });
        }catch(e){}
      }
      try{
        scene.background=null;
        rt=new THREE.WebGLRenderTarget(W,H,{minFilter:THREE.LinearFilter,
          magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,
          type:THREE.UnsignedByteType,depthBuffer:true,stencilBuffer:false});
        renderer.setRenderTarget(rt);
        /* setViewport est exprimé en pixels CSS : Three le multiplie par le
           pixel ratio du renderer. Sans division, l'image 1600 px est rendue
           dans un viewport 1600×pr puis rognée/décalée. */
        const pr=(renderer.getPixelRatio?renderer.getPixelRatio():1)||1;
        if(renderer.setViewport)renderer.setViewport(0,0,W/pr,H/pr);
        renderer.setClearColor(0x000000,0);
        renderer.autoClear=true;
        renderer.render(scene,cam);
        if(typeof renderer.readRenderTargetPixels!=='function')return null;
        const buf=new Uint8Array(W*H*4);
        renderer.readRenderTargetPixels(rt,0,0,W,H,buf);
        const cv=document.createElement('canvas');cv.width=W;cv.height=H;
        const ctx=cv.getContext('2d');
        if(!ctx)return null;
        const img=ctx.createImageData(W,H);
        const row=W*4;
        for(let y=0;y<H;y++){
          const src=(H-1-y)*row;
          img.data.set(buf.subarray(src,src+row),y*row);
        }
        // fond transparent (0,0,0,0) : un pixel semi-transparent (reflet, bords lissés) est stocké
        // « couleur × alpha » — on rend la couleur vraie, sinon le PNG l'assombrit (reflet gris)
        const px=img.data;
        for(let i=0;i<px.length;i+=4){const a=px[i+3];if(a>0&&a<255){const k=255/a;
          px[i]=Math.min(255,px[i]*k);px[i+1]=Math.min(255,px[i+1]*k);px[i+2]=Math.min(255,px[i+2]*k);}}
        ctx.putImageData(img,0,0);
        const url=cv.toDataURL('image/png');
        if(!url||url.length<16)return null;
        /* placement en coordonnées locales : le déplacement/zoom de la vue
           réutilise l'image sans refaire le rendu WebGL ni le HLR. */
        return{url:url,lx:+l.toFixed(3),ly:+t.toFixed(3),
          lw:+(r-l).toFixed(3),lh:+(btm-t).toFixed(3)};
      }finally{
        for(let i=0;i<saved.length;i++)saved[i][0].visible=saved[i][1];
        if(thrGrp){try{scene.remove(thrGrp);thrGrp.traverse(o=>{try{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();}catch(e){}});}catch(e){}}
        mirObjs.forEach(o=>{try{scene.remove(o);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}catch(e){}});
        scene.background=oldBg;
        try{if(oldClear)renderer.setClearColor(oldClear,oldAlpha);}catch(e){}
        renderer.autoClear=oldAuto;
        try{renderer.setRenderTarget(oldTarget||null);}catch(e){}
        try{if(oldVp&&renderer.setViewport)renderer.setViewport(oldVp);}catch(e){}
        try{rt&&rt.dispose();}catch(e){}
      }
    }catch(e){return null;}
  }

  function mepVisible(p3,viewDir,sec,meshes){
    // true si le point n'est pas masqué ; sec = {p0,gaze} : seuls les occludeurs derrière le plan comptent
    meshes=meshes||[];
    if(!meshes.length)return true;
    try{
      if(!mepRC)mepRC=new THREE.Raycaster();
      const rc=mepRC;
      const start=new THREE.Vector3(p3[0]+viewDir[0]*3000,p3[1]+viewDir[1]*3000,p3[2]+viewDir[2]*3000);
      const dir=new THREE.Vector3(-viewDir[0],-viewDir[1],-viewDir[2]);
      rc.set(start,dir);
      rc.far=3000.5;
      const hits=rc.intersectObjects(meshes.map(b=>b.mesh),false);
      if(!hits||!hits.length)return true;
      const dToP=3000;
      for(let i=0;i<hits.length;i++){
        const h=hits[i];
        if(h.distance>=dToP-0.4)break;              // derrière le point : pas un ocoueur
        if(sec){
          const hp=[h.point.x,h.point.y,h.point.z];
          if(mepDot(mepSub(hp,sec.p0),sec.gaze)>0.02)continue; // matière côté coupé (déjà retirée)
        }
        return false;
      }
      return true;
    }catch(e){return true;}
  }
  function mepVisFn(view,meshes){
    const vd=view.dir,sec=view._sec||null;
    meshes=(meshes||mepMeshesOf(view)).filter(b=>b.mesh);
    return p=>mepVisible(p,vd,sec,meshes);
  }
  /* HLR par tampon de profondeur logiciel : une rasterisation des triangles
     projetés (garde la profondeur max = surface la plus proche de l'observateur),
     puis test d'occlusion O(1) par point. Bien plus rapide que le raycast. */
  function mepDepthVis(view,meshes){
    try{
      const W=2048,H=2048;
      const u=view.u,vv=view.v,dir=view.dir;
      let minu=1e9,maxu=-1e9,minv=1e9,maxv=-1e9,mind=1e9,maxd=-1e9;
      const flat=[]; // triangles plats [du,dv,dd × 3]
      const tmp=new THREE.Vector3();
      for(let bi=0;bi<meshes.length;bi++){
        const g=meshes[bi].mesh&&meshes[bi].mesh.geometry;
        if(!g||!g.attributes||!g.attributes.position)continue;
        try{meshes[bi].mesh.updateMatrixWorld();}catch(e){}
        const pos=g.attributes.position,idx=g.index;
        const nT=idx?idx.count/3:pos.count/3;
        const mw=meshes[bi].mesh.matrixWorld;
        const proj=i=>{
          tmp.set(pos.getX(i),pos.getY(i),pos.getZ(i));
          try{tmp.applyMatrix4(mw);}catch(e){}
          const du=tmp.x*u[0]+tmp.y*u[1]+tmp.z*u[2];
          const dv=tmp.x*vv[0]+tmp.y*vv[1]+tmp.z*vv[2];
          const dd=tmp.x*dir[0]+tmp.y*dir[1]+tmp.z*dir[2];
          if(du<minu)minu=du;if(du>maxu)maxu=du;
          if(dv<minv)minv=dv;if(dv>maxv)maxv=dv;
          if(dd<mind)mind=dd;if(dd>maxd)maxd=dd;
          return[du,dv,dd];
        };
        for(let t=0;t<nT&&flat.length<360000;t++){
          const i0=idx?idx.getX(t*3):t*3,i1=idx?idx.getX(t*3+1):t*3+1,i2=idx?idx.getX(t*3+2):t*3+2;
          const A=proj(i0),B=proj(i1),C=proj(i2);
          flat.push(A[0],A[1],A[2],B[0],B[1],B[2],C[0],C[1],C[2]);
        }
      }
      if(flat.length<9||!(maxu>minu)||!(maxv>minv))return null;
      const pad=(maxu-minu+maxv-minv)*0.02+1;
      minu-=pad;maxu+=pad;minv-=pad;maxv+=pad;
      const su=W/(maxu-minu),sv=H/(maxv-minv);
      const buf=new Float32Array(W*H).fill(-1e30);
      for(let i=0;i<flat.length;i+=9){
        const ax=(flat[i]-minu)*su,ay=(flat[i+1]-minv)*sv,ad=flat[i+2];
        const bx=(flat[i+3]-minu)*su,by=(flat[i+4]-minv)*sv,bd2=flat[i+5];
        const cx=(flat[i+6]-minu)*su,cy=(flat[i+7]-minv)*sv,cd=flat[i+8];
        const det=(bx-ax)*(cy-ay)-(by-ay)*(cx-ax);
        if(Math.abs(det)<1e-12)continue;
        let x0=Math.max(0,Math.floor(Math.min(ax,bx,cx))),x1=Math.min(W-1,Math.ceil(Math.max(ax,bx,cx)));
        let y0=Math.max(0,Math.floor(Math.min(ay,by,cy))),y1=Math.min(H-1,Math.ceil(Math.max(ay,cy,by)));
        const inv=1/det;
        for(let py=y0;py<=y1;py++){
          for(let px2=x0;px2<=x1;px2++){
            const lx=px2+0.5-ax,ly=py+0.5-ay;
            const w1=(lx*(cy-ay)-ly*(cx-ax))*inv;
            const w2=((bx-ax)*ly-(by-ay)*lx)*inv;
            const w0=1-w1-w2;
            if(w0<0||w1<0||w2<0)continue;
            const dd=w0*ad+w1*bd2+w2*cd;
            const o=py*W+px2;
            if(dd>buf[o])buf[o]=dd;
          }
        }
      }
      const eps=Math.max((maxu-minu)/W,(maxv-minv)/H)*2+(maxd-mind)*1e-5+0.01;
      // tolérance LOOSE pour les contours (rayons rasants) : couvre l'erreur de
      // corde du maillage (~0,3-0,6 mm) sans laisser passer un vrai ocoueur
      // (paroi de perçage : les générateurs internes doivent rester coupés)
      const eps2=eps+0.3+Math.min(0.6,(maxd-mind)*0.004);
      const fn=p=>{
        const du=p[0]*u[0]+p[1]*u[1]+p[2]*u[2];
        const dv=p[0]*vv[0]+p[1]*vv[1]+p[2]*vv[2];
        const dd=p[0]*dir[0]+p[1]*dir[1]+p[2]*dir[2];
        const iu=((du-minu)*su)|0,iv=((dv-minv)*sv)|0;
        if(iu<0||iv<0||iu>=W||iv>=H)return true;
        return buf[iv*W+iu]<=dd+eps; // buffer plus proche que le point → caché
      };
      fn.loose=p=>{
        const du=p[0]*u[0]+p[1]*u[1]+p[2]*u[2];
        const dv=p[0]*vv[0]+p[1]*vv[1]+p[2]*vv[2];
        const dd=p[0]*dir[0]+p[1]*dir[1]+p[2]*dir[2];
        const iu=((du-minu)*su)|0,iv=((dv-minv)*sv)|0;
        if(iu<0||iv<0||iu>=W||iv>=H)return true;
        return buf[iv*W+iu]<=dd+eps2;
      };
      return fn;
    }catch(e){return null;}
  }
  /* segment projeté avec découpe des parties cachées */
  function mepEmitSeg(out,added,A,B,vis,kind,view,hidKind){
    // A,B = points monde ; découpe en sous-segments visibles
    // hidKind : si défini, les tronçons cachés sont ÉMIS avec cette classe (pointillés) au lieu d'être jetés
    const pushSeg=(P0,P1,kk)=>{
      const l0=[mepDot(P0,view.u),mepDot(P0,view.v)],l1=[mepDot(P1,view.u),mepDot(P1,view.v)];
      const dx=l1[0]-l0[0],dy=l1[1]-l0[1];
      if(dx*dx+dy*dy<1e-8)return;
      const k=Math.round(l0[0]*100)+','+Math.round(l0[1]*100)+','+Math.round(l1[0]*100)+','+Math.round(l1[1]*100);
      const k2=Math.round(l1[0]*100)+','+Math.round(l1[1]*100)+','+Math.round(l0[0]*100)+','+Math.round(l0[1]*100);
      if(added.has(k)||added.has(k2))return;
      added.add(k);
      out.push({t:'L',x1:l0[0],y1:l0[1],x2:l1[0],y2:l1[1],k:kk||kind});
    };
    if(!vis){pushSeg(A,B);return;} // pas de HLR : segment complet
    const sub=(P0,P1,depth)=>{
      const v0=vis(P0),v1=vis(P1);
      if(v0&&v1){
        // deux extrémités visibles ne garantissent pas le MILIEU : une arête peut
        // traverser derrière un autre corps sans que ses bouts soient masqués.
        if(depth<5){
          const M=[(P0[0]+P1[0])/2,(P0[1]+P1[1])/2,(P0[2]+P1[2])/2];
          if(!vis(M)){sub(P0,M,depth+1);sub(M,P1,depth+1);return;}
        }
        pushSeg(P0,P1);return;
      }
      if(!v0&&!v1){
        if(depth>=5){if(hidKind)pushSeg(P0,P1,hidKind);return;}
        const M=[(P0[0]+P1[0])/2,(P0[1]+P1[1])/2,(P0[2]+P1[2])/2];
        if(vis(M)){
          const a=binSearch(P0,M,true),b=binSearch(M,P1,false);
          if(hidKind){pushSeg(P0,a,hidKind);pushSeg(b,P1,hidKind);}
          pushSeg(a,b);
        }else{sub(P0,M,depth+1);sub(M,P1,depth+1);}
        return;
      }
      if(depth>=5){if(v0)pushSeg(P0,P1);else if(hidKind)pushSeg(P0,P1,hidKind);return;}
      const M=[(P0[0]+P1[0])/2,(P0[1]+P1[1])/2,(P0[2]+P1[2])/2];
      sub(v0?P0:M,v0?M:P1,depth+1);
    };
    const binSearch=(hid,visSide)=>{
      let a=hid.slice(),b=visSide.slice();
      for(let i=0;i<6;i++){
        const m=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
        if(vis(m))b=m;else a=m;
      }
      return b;
    };
    sub(A,B,0);
  }
  /* cercle reconnaissants sur une suite de points projetés */
  function mepFitCircle(pts){
    if(!pts||pts.length<4)return null;
    // OCCT ferme les arêtes circulaires en répétant le premier point à la fin.
    // Avec le fit à 3 points (premier/milieu/dernier), ce doublon donne a === c
    // et un déterminant nul : tous les trous/cercles pleins étaient ratés.
    let p=pts,closed=false;
    const first=pts[0],last=pts[pts.length-1];
    if(Math.hypot(last[0]-first[0],last[1]-first[1])<1e-6){
      closed=true;
      p=pts.slice(0,-1);
    }
    if(p.length<4)return null;
    // Points de fit bien répartis : un doublon de fermeture rend le triangle
    // quasi dégénéré si l'on garde le point voisin du départ.
    const n=p.length;
    const ia=0,ib=closed?Math.floor(n/3):(n>>1),ic=closed?Math.floor(2*n/3):n-1;
    const a=p[ia],b=p[ib],c=p[ic];
    const d=2*(a[0]*(b[1]-c[1])+b[0]*(c[1]-a[1])+c[0]*(a[1]-b[1]));
    if(Math.abs(d)<1e-9)return null;
    const ux=((a[0]*a[0]+a[1]*a[1])*(b[1]-c[1])+(b[0]*b[0]+b[1]*b[1])*(c[1]-a[1])+(c[0]*c[0]+c[1]*c[1])*(a[1]-b[1]))/d;
    const uy=((a[0]*a[0]+a[1]*a[1])*(c[0]-b[0])+(b[0]*b[0]+b[1]*b[1])*(a[0]-c[0])+(c[0]*c[0]+c[1]*c[1])*(b[0]-a[0]))/d;
    const r=Math.hypot(a[0]-ux,a[1]-uy);
    if(!(r>0.05))return null;
    for(let i=0;i<p.length;i++){
      if(Math.abs(Math.hypot(p[i][0]-ux,p[i][1]-uy)-r)>0.03)return null;
    }
    /* sweep signé : somme des deltas angulaires consécutifs bornés ±π */
    const th=i=>Math.atan2(p[i][1]-uy,p[i][0]-ux);
    let sweep=0;
    for(let i=0;i+1<p.length;i++){
      let d=th(i+1)-th(i);
      while(d>Math.PI)d-=2*Math.PI;
      while(d<-Math.PI)d+=2*Math.PI;
      sweep+=d;
    }
    if(closed){
      // delta de fermeture (le point dupliqué a été retiré)
      let d=th(0)-th(p.length-1);
      while(d>Math.PI)d-=2*Math.PI;
      while(d<-Math.PI)d+=2*Math.PI;
      sweep+=d;
    }
    return{cx:ux,cy:uy,r,a0:th(0),a1:th(0)+sweep,sweep,
      full:(closed&&Math.abs(sweep)>=Math.PI*1.5)||Math.abs(sweep)>=2*Math.PI*0.97};
  }
  /* AABB locale d'une élément projeté (L / C / A) */
  function mepElAABB(e){
    if(e.t==='L')return{minx:Math.min(e.x1,e.x2),miny:Math.min(e.y1,e.y2),maxx:Math.max(e.x1,e.x2),maxy:Math.max(e.y1,e.y2)};
    if(e.t==='C')return{minx:e.cx-e.r,miny:e.cy-e.r,maxx:e.cx+e.r,maxy:e.cy+e.r};
    if(e.t==='A'){
      // extrémités + croisements d'axes dans la plage angulaire
      const pts=[[e.cx+e.r*Math.cos(e.a0),e.cy+e.r*Math.sin(e.a0)],[e.cx+e.r*Math.cos(e.a1),e.cy+e.r*Math.sin(e.a1)]];
      const lo=Math.min(e.a0,e.a1),hi=Math.max(e.a0,e.a1);
      for(let k=0;k<4;k++){
        const t=k*Math.PI/2;
        let tt=t;
        while(tt<lo)tt+=2*Math.PI;
        if(tt<=hi)pts.push([e.cx+e.r*Math.cos(tt),e.cy+e.r*Math.sin(tt)]);
      }
      let minx=1e9,miny=1e9,maxx=-1e9,maxy=-1e9;
      pts.forEach(p=>{minx=Math.min(minx,p[0]);maxx=Math.max(maxx,p[0]);miny=Math.min(miny,p[1]);maxy=Math.max(maxy,p[1]);});
      return{minx,miny,maxx,maxy};
    }
    if(e.t==='P'&&e.pts&&e.pts.length){
      let minx=1e9,miny=1e9,maxx=-1e9,maxy=-1e9;
      e.pts.forEach(p=>{minx=Math.min(minx,p[0]);maxx=Math.max(maxx,p[0]);miny=Math.min(miny,p[1]);maxy=Math.max(maxy,p[1]);});
      return{minx,miny,maxx,maxy};
    }
    return null;
  }
  /* ═══════════════ G2. HLR exact OCCT ═══════════════ */
  /* Les arêtes renvoyées par HLRAppli_ReflectLines sont DÉJÀ découpées
     visibles/cachées et projetées depuis la géométrie exacte. On ne refait
     donc ni test de profondeur ni découpe de segment : contrairement au HLR
     maillage, les contours de révolution et les occultations sont exacts. */
  function mepHlrAddEdge(geo,added,view,shape,kind){
    if(!shape)return 0;
    let n=0;
    const bin=[];
    try{
      const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
      const ex=new occt.TopExp_Explorer_2(shape,occt.TopAbs_ShapeEnum.TopAbs_EDGE,SH);bin.push(ex);
      while(ex.More()){
        const e=occt.TopoDS.Edge_1(ex.Current());bin.push(e);
        try{
          const ad=new occt.BRepAdaptor_Curve_2(e);bin.push(ad);
          const u0=ad.FirstParameter(),u1=ad.LastParameter();
          if(u1>u0){
            const pts=occCurvePts(ad,u0,u1,0.02,400);
            if(pts&&pts.length>1){
              const lp=pts.map(p=>[mepDot(p,view.u),mepDot(p,view.v)]);
              const cir=mepFitCircle(lp);
              if(cir){
                const kc='C'+Math.round(cir.cx*100)+','+Math.round(cir.cy*100)+','+Math.round(cir.r*100);
                const ka='A'+kc+','+Math.round(cir.a0*400)+','+Math.round(cir.a1*400);
                const kk=cir.full?kc:ka;
                if(!added.has(kk)){
                  added.add(kk);
                  geo.els.push(cir.full?{t:'C',cx:cir.cx,cy:cir.cy,r:cir.r,k:kind}:{t:'A',cx:cir.cx,cy:cir.cy,r:cir.r,a0:cir.a0,a1:cir.a1,k:kind});
                  n++;
                }
              }else{
                for(let i=0;i+1<lp.length;i++){
                  const A=lp[i],B=lp[i+1];
                  const dx=B[0]-A[0],dy=B[1]-A[1];
                  if(dx*dx+dy*dy<1e-8)continue;
                  const k=Math.round(A[0]*100)+','+Math.round(A[1]*100)+','+Math.round(B[0]*100)+','+Math.round(B[1]*100);
                  const k2=Math.round(B[0]*100)+','+Math.round(B[1]*100)+','+Math.round(A[0]*100)+','+Math.round(A[1]*100);
                  if(added.has(k)||added.has(k2))continue;
                  added.add(k);
                  geo.els.push({t:'L',x1:A[0],y1:A[1],x2:B[0],y2:B[1],k:kind});
                  n++;
                }
              }
            }
          }
        }catch(err){}
        ex.Next();
      }
    }catch(err){}
    occDispose(bin);
    try{shape.delete();}catch(e){}
    return n;
  }
  function mepHlrExact(geo,view,shapes,added){
    if(typeof occt==='undefined'||!occt)return false;
    if(!occt.HLRAppli_ReflectLines||!occt.HLRBRep_TypeOfResultingEdge)return false;
    let model=null,hlr=null,owned=false;
    try{
      model=occCompoundOf(shapes);
      if(!model)return false;
      owned=shapes.length>1;
      hlr=new occt.HLRAppli_ReflectLines(model);
      hlr.SetAxes(view.dir[0],view.dir[1],view.dir[2],0,0,0,view.u[0],view.u[1],view.u[2]);
      hlr.Perform();
      const T=occt.HLRBRep_TypeOfResultingEdge;
      const mode=view.mode||'hide';
      const kindV=view.section?'sect':'sharp';
      let n=0;
      n+=mepHlrAddEdge(geo,added,view,hlr.GetCompoundOf3dEdges(T.HLRBRep_Sharp,true,true),kindV);
      n+=mepHlrAddEdge(geo,added,view,hlr.GetCompoundOf3dEdges(T.HLRBRep_OutLine,true,true),kindV);
      if(view.tangent)n+=mepHlrAddEdge(geo,added,view,hlr.GetCompoundOf3dEdges(T.HLRBRep_Rg1Line,true,true),view.section?'sect':'tangent');
      if(mode==='dash'){
        n+=mepHlrAddEdge(geo,added,view,hlr.GetCompoundOf3dEdges(T.HLRBRep_Sharp,false,true),'hidden');
        n+=mepHlrAddEdge(geo,added,view,hlr.GetCompoundOf3dEdges(T.HLRBRep_OutLine,false,true),'hidden');
        if(view.tangent)n+=mepHlrAddEdge(geo,added,view,hlr.GetCompoundOf3dEdges(T.HLRBRep_Rg1Line,false,true),'hidden');
      }
      return n>0;
    }catch(e){return false;}
    finally{
      try{hlr&&hlr.delete();}catch(e){}
      if(owned){try{model&&model.delete();}catch(e){}}
    }
  }
  /* 2026-10-22-009 : REPRÉSENTATION DES FILETAGES (ISO 6410-1) des perçages taraudés
     (« les représentations de filetages ISO dans les vues ») — le trou est percé au Ø du
     foret (Ø mineur, tracé par le HLR) ; on ajoute la convention :
       • vue en bout, entrée vue : 3/4 de cercle (fond de filet) au Ø nominal, ouvert en haut à droite ;
       • coupe passant par l'axe : traits du fond de filet au Ø nominal sur la longueur filetée + trait FORT
         de fin de filetage (sauf filetage débouchant) ;
       • autres vues de côté : filet caché (traits interrompus fins), en mode « cachées en pointillé ».
     Fond de filet (k 'thread') : gris clair et plus fin que le trait fin (.mepThread).
     Filet modélisé (impression 3D) : sa géométrie réelle est déjà dessinée — rien d'ajouté.
     Vue oblique / perspective : rien (convention définie pour les vues orthogonales). Détail : comme sa
     vue mère (même base), rogné ensuite par le cercle du détail (mepFinishGeo). */
  function mepThreadEls(view){
    const out=[];
    if(!view||mepOblOf(view)||mepPerspOf(view)||typeof holeAxis!=='function'||typeof isoThread!=='function')return out;
    const b=mepBasisOf(view),dot=mepDot;
    const planes=view.section?((view._step&&view._step.planes)||[view.section.p]):null;
    const nS=view.section?mepNorm(view.section.n):null;
    (doc.features||[]).forEach(f=>{
      if(!f||f.type!=='hole'||f.visible===false||!f.thread||!f.thread.size||f.thread.model)return;
      if(view.bodyId&&f.bodyId&&f.bodyId!==view.bodyId)return;
      const T=isoThread(f.thread.size);if(!T)return;
      const sk=(doc.sketches||[]).find(q=>q.id===f.sketchId);if(!sk)return;
      let A=null,N=null;try{A=holeAxis(f,sk);N=holeNorm(f);}catch(e){return;}
      if(!A||!A.pts||!A.pts.length)return;
      const D=mepNorm([A.dir.x,A.dir.y,A.dir.z]),R=T[1]/2;
      const off=(N.kind==='cbore')?N.cbH:(N.kind==='csink'?Math.max(0,(N.csD-N.d)/2/Math.tan(N.csA*Math.PI/360)):0);
      const thru=(f.thread.lenMode||'len')==='through';
      const L=Math.max(0,+f._thLen||+f.thread.len||+N.depth||0);if(!(L>0))return;
      const facing=dot(D,b.dir);
      A.pts.forEach(P=>{
        const w=[P.x,P.y,P.z];
        const at=t=>{const q=[w[0]+D[0]*t,w[1]+D[1]*t,w[2]+D[2]*t];return[dot(q,b.u),dot(q,b.v)];};
        if(Math.abs(facing)>0.999){
          // en bout : entrée vue (perçage qui s'éloigne de l'observateur) ou filetage débouchant
          if(!(facing<0||thru||view.section))return;
          const c=at(0);
          out.push({t:'A',cx:c[0],cy:c[1],r:R,a0:0,a1:1.5*Math.PI,k:'thread'});
          return;
        }
        if(Math.abs(facing)>0.02)return; // axe oblique à la vue : pas de convention simple
        const d2=[dot(D,b.u),dot(D,b.v)],l2=Math.hypot(d2[0],d2[1])||1,nx=-d2[1]/l2,ny=d2[0]/l2;
        const inCut=!!(planes&&Math.abs(dot(nS,D))<0.02&&planes.some(p0=>Math.abs(dot(nS,[w[0]-p0[0],w[1]-p0[1],w[2]-p0[2]]))<R));
        if(!inCut&&view.mode!=='dash')return; // filet caché : seulement en « cachées en pointillé »
        const k=inCut?'thread':'threadH';
        const a=at(off),e=at(off+L);
        [-1,1].forEach(sg=>out.push({t:'L',x1:a[0]+nx*R*sg,y1:a[1]+ny*R*sg,x2:e[0]+nx*R*sg,y2:e[1]+ny*R*sg,k}));
        if(!thru)out.push({t:'L',x1:e[0]-nx*R,y1:e[1]-ny*R,x2:e[0]+nx*R,y2:e[1]+ny*R,k:inCut?'sharp':'threadH'}); // fin de filetage
      });
    });
    return out;
  }
  function mepFinishGeo(geo,view,cutShapes){
    try{const th=mepThreadEls(view);if(th.length)geo.els=geo.els.concat(th);}catch(e){try{console.warn('mep filetage',e);}catch(e2){}}
    if(view.render3d&&!view.section&&!view.detail){
      try{geo.img3d=mepRender3dImage(view);}catch(e){geo.img3d=null;}
    }
    if(view.shade&&!view.render3d&&!view.section&&!view.detail){
      try{geo.faces=mepShadedFaces(view);}catch(e){geo.faces=[];}
      try{geo.thr3d=mepThreadSegs(view);}catch(e){geo.thr3d=[];}
    }
    if(view.section&&cutShapes.length){
      const st=view._step;
      try{geo.hatch=mepHatchLoops(cutShapes,view,st?st.planes:view.section.p,view.section.n);}catch(e){}
      if(st)geo.els=mepDropStepEdges(geo.els,view,st);
    }
    if(view.detail&&view.parent){
      const par=mepView(mepSheet(),view.parent);
      if(par)geo.els=mepClipDetail(geo.els,view.detail);
    }
    return geo;
  }
  /* ═══════════════ H. construction d'une vue ═══════════════ */
  function mepBuildGeo(view){
    // vue DXF (2026-10-23) : géométrie importée telle quelle ; un détail pris dessus la rogne
    {const par=view.kind==='detail'&&view.parent?mepView(mepSheet(),view.parent):null,dv=view.kind==='dxf'?view:(par&&par.kind==='dxf'?par:null);
     if(dv){let els=((dv.dxf&&dv.dxf.els)||[]).map(e=>e.t==='P'?{t:'P',pts:e.pts.map(q=>q.slice()),k:e.k}:Object.assign({},e));
       if(view!==dv&&view.detail)els=mepClipDetail(els,view.detail);
       return{els,hatch:[],src:'dxf'};}}
    const geo={els:[],hatch:[],src:''};
    const b=mepBasisOf(view);view.dir=b.dir;view.u=b.u;view.v=b.v;
    const list=mepMeshesOf(view);
    if(!list.length){geo.src='aucun corps';return geo;}
    /* mode d'affichage : wire = tout noir ; hide = HLR, cachées supprimées ;
       dash = HLR, cachées en gris pointillé */
    const mode=view.mode||'hide';
    const added=new Set();
    const sty=new Map();
    list.forEach(bd=>sty.set(bd,mepBodyStyleOf(bd)));
    const shade=!!(view.shade||view.render3d)&&!view.section&&!view.detail;
    const occList=shade?list.filter(bd=>bd.mesh&&!sty.get(bd).transparent):list;
    /* — formes exactes et coupe AVANT le HLR : le HLR doit voir la matière
       réellement coupée, pas la pièce entière. — */
    let shapes=[],shapeBodies=[];
    // 2026-10-22-010 : un import STEP a AUSSI son solide exact (importGeom.brep) —
    // seul bd.shape était lu : la vue d'un STEP tombait sur le maillage
    // d'affichage et dessinait ses triangles (« la mise en plan est très
    // facétisée »). Le BRep importé est dans les coordonnées du maillage.
    list.forEach(bd=>{const sh=mepExactOf(bd);if(sh){shapes.push(sh);shapeBodies.push(bd);}});
    const exact=shapes.length&&typeof occSharpEdges==='function';
    let cutShapes=shapes;
    if(view.section&&shapes.length){
      view._sec={p0:view.section.p,gaze:mepNorm(view.section.n)};
      cutShapes=[];
      const st=mepSecStepped(view);view._step=st;
      shapes.forEach(sh=>{
        const cs=st?mepCutPrism(sh,st.poly,st.vec):mepCutHalfSpace(sh,view.section.p,view.section.n);
        if(cs)cutShapes.push(cs);else cutShapes.push(sh);
      });
    }else{view._sec=null;view._step=null;}
    if(mepOblOf(view)&&cutShapes.length)cutShapes=cutShapes.map(sh=>mepOblShear(sh,view)); // cavalière
    if(mepPerspOf(view)){mepPerspBuild(geo,view,list,cutShapes,exact,mode);return mepFinishGeo(geo,view,cutShapes);} // perspective
    /* — HLR exact OCCT (repli automatique sur l'ancien HLR si indisponible) — */
    if(mode!=='wire'&&exact&&view.hlrExact!==false&&cutShapes.length){
      const tr=shade&&shapeBodies.some(bd=>sty.get(bd).transparent);
      if(tr){
        const opq=[],trans=[];
        shapeBodies.forEach((bd,i)=>{
          if(!cutShapes[i])return;
          if(sty.get(bd).transparent)trans.push(cutShapes[i]);
          else opq.push(cutShapes[i]);
        });
        let ok=false;
        if(opq.length)ok=mepHlrExact(geo,view,opq,added)||ok;
        trans.forEach(sh=>{
          ok=mepHlrExact(geo,view,opq.concat([sh]),added)||ok;
        });
        if(ok){geo.src='OCCT HLR';return mepFinishGeo(geo,view,cutShapes);}
      }else if(mepHlrExact(geo,view,cutShapes,added)){
        geo.src='OCCT HLR';
        return mepFinishGeo(geo,view,cutShapes);
      }
    }
    let vis=null,hidKind=null;
    if(mode!=='wire'){
      if(view.section)vis=mepVisFn(view,occList); // coupe : raycast avec exclusion du demi-espace
      else{
        const mlist=occList.filter(b=>b.mesh);
        vis=mepDepthVis(view,mlist)||mepVisFn(view,mlist); // tampon de profondeur, repli raycast
      }
      if(vis&&mode==='dash')hidKind='hidden';
    }
    /* — silhouettes du maillage : contour extérieur + aide au noircissement — */
    const silSegs=[];
    const silGrid=new Map(); // cellule 3 mm → SEGMENTS de silhouette
    const silAddSeg=pr=>{
      const L=Math.hypot(pr[1][0]-pr[0][0],pr[1][1]-pr[0][1],pr[1][2]-pr[0][2]);
      const n=Math.max(1,Math.ceil(L));
      for(let i=0;i<=n;i++){
        const t=i/n;
        const p=[pr[0][0]+(pr[1][0]-pr[0][0])*t,pr[0][1]+(pr[1][1]-pr[0][1])*t,pr[0][2]+(pr[1][2]-pr[0][2])*t];
        const k=Math.floor(p[0]/3)+','+Math.floor(p[1]/3)+','+Math.floor(p[2]/3);
        if(!silGrid.has(k))silGrid.set(k,[]);
        const arr=silGrid.get(k);
        if(arr[arr.length-1]!==pr)arr.push(pr);
      }
    };
    list.forEach(bd=>{
      if(!bd.mesh)return;
      try{bd.mesh.updateMatrixWorld();}catch(e){}
      const segs=mepSilhouettes(bd.mesh,view.dir);
      segs.forEach(pr=>{silSegs.push(pr);silAddSeg(pr);});
    });
    const onSil=p=>{
      // distance point→segment (corde de maillage) : tolérance 2,2 mm
      const cx=Math.floor(p[0]/3),cy=Math.floor(p[1]/3),cz=Math.floor(p[2]/3);
      for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(let k=-1;k<=1;k++){
        const arr=silGrid.get((cx+i)+','+(cy+j)+','+(cz+k));
        if(!arr)continue;
        for(let m=0;m<arr.length;m++){
          const A=arr[m][0],B=arr[m][1];
          const ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2];
          const L2=ux*ux+uy*uy+uz*uz;
          let t=L2>1e-12?((p[0]-A[0])*ux+(p[1]-A[1])*uy+(p[2]-A[2])*uz)/L2:0;
          t=t<0?0:(t>1?1:t);
          const dx=p[0]-(A[0]+ux*t),dy=p[1]-(A[1]+uy*t),dz=p[2]-(A[2]+uz*t);
          if(dx*dx+dy*dy+dz*dz<4.84)return true;
        }
      }
      return false;
    };
    /* — forme exacte(s) — */
    /* — arêtes OCCT — */
    if(exact){
      geo.src='OCCT';
      cutShapes.forEach(sh=>{
        let edges=[];
        try{edges=occSharpEdges(sh)||[];}catch(e){edges=[];}
        edges.forEach(e=>{
          if(!e||!e.pts||e.pts.length<2)return;
          const wpts=[];
          for(let i=0;i<e.pts.length;i++){
            const p=e.pts[i];const w=(p&&typeof p.x==='number')?[p.x,p.y,p.z]:p;
            if(w)wpts.push(w);
          }
          if(wpts.length<2)return;
          let kind=e.sharp?'sharp':'tangent';
          let onContour=false;
          if(kind==='tangent'){
            // tangente SUR le contour extérieur (silhouette) → arête vive noire,
            // visibilité LOOSE (le strict la tue au rasant).
            // Les arêtes VIVES gardent le test strict : un cerclage de perçage
            // (sharp) ne doit jamais fuiler à travers une paroi.
            let hits=0,tested=0;
            for(let i=0;i<wpts.length;i++){
              tested++;if(onSil(wpts[i]))hits++;
            }
            if(tested&&hits*5>=tested*3){kind='sharp';onContour=true;} // ≥60 % des points sur le contour
          }
          if(kind==='tangent'&&!view.tangent)return;
          // visibilité LOOSE pour tout ce qui n'est PAS une arête vive d'origine :
          // contours promus ET tangentes de congés (posées SUR la face, tuées au
          // rasant par le strict à cause de l'erreur de rasterisation).
          // Les arêtes VIVES (cerclages de perçage) gardent le test strict —
          // un perçage arrière ne doit jamais fuiler à travers une paroi.
          const visE=(onContour||kind==='tangent')?(vis&&(vis.loose||vis)):vis;
          const lp=wpts.map(p=>[mepDot(p,view.u),mepDot(p,view.v)]);
          const cir=(kind==='sharp'||kind==='tangent')?mepFitCircle(lp):null;
          if(cir){
            // test de visibilité sur 6 points (pas 3) : un cerclage de perçage
            // partiellement masqué ne doit pas ressortir en noir complet
            const okV=()=>{
              if(!visE)return true;
              const n=wpts.length;
              for(let s=0;s<6;s++){
                const pt=wpts[Math.min(n-1,Math.round(s*(n-1)/5))];
                if(pt&&!visE(pt))return false;
              }
              return true;
            };
            if(okV()){
              const kc='C'+Math.round(cir.cx*100)+','+Math.round(cir.cy*100)+','+Math.round(cir.r*100);
              const ka='A'+kc+','+Math.round(cir.a0*400)+','+Math.round(cir.a1*400);
              const kk=cir.full?kc:ka;
              if(!added.has(kk)){added.add(kk);geo.els.push(cir.full?{t:'C',cx:cir.cx,cy:cir.cy,r:cir.r,k:view.section?'sect':kind}:{t:'A',cx:cir.cx,cy:cir.cy,r:cir.r,a0:cir.a0,a1:cir.a1,k:view.section?'sect':kind});}
              return;
            }
          }
          for(let i=0;i<wpts.length-1;i++)mepEmitSeg(geo.els,added,wpts[i],wpts[i+1],visE,view.section?'sect':(kind==='tangent'?'tangent':'sharp'),view,hidKind);
        });
      });
    }
    /* — arêtes de maillage (corps sans noyau exact) — */
    list.forEach(bd=>{
      if(exact&&shapeBodies.indexOf(bd)>=0)return; // déjà traité (solide exact, import compris)
      const g=bd.mesh&&bd.mesh.geometry;if(!g||!g.attributes||!g.attributes.position)return;
      try{bd.mesh.updateMatrixWorld();}catch(e){}
      const pos=g.attributes.position,idx=bd.mesh.geometry.index;
      const nT=idx?idx.count/3:pos.count/3;
      const mw=bd.mesh.matrixWorld;
      const wp=i=>{
        const v=new THREE.Vector3(pos.getX(i),pos.getY(i),pos.getZ(i));
        try{v.applyMatrix4(mw);}catch(e){}
        return[v.x,v.y,v.z];
      };
      const seenE=new Set();
      for(let t=0;t<nT&&t<120000;t++){
        const i0=idx?idx.getX(t*3):t*3,i1=idx?idx.getX(t*3+1):t*3+1,i2=idx?idx.getX(t*3+2):t*3+2;
        [[i0,i1],[i1,i2],[i2,i0]].forEach(pr=>{
          const kk=pr[0]<pr[1]?pr[0]+'_'+pr[1]:pr[1]+'_'+pr[0];
          if(seenE.has(kk))return;seenE.add(kk);
          mepEmitSeg(geo.els,added,wp(pr[0]),wp(pr[1]),vis,'sharp',view,hidKind);
        });
      }
      if(!exact)geo.src='maillage';
    });
    /* — silhouettes (générateurs de cylindres/sphères) :
       HLR en tolérance LOOSE : les contours rasants survivent à l'erreur de corde
       du maillage (~0,5 mm), mais un vrai ocoueur (paroi d'un perçage arrière)
       les coupe — les perçages ne doivent pas ressortir en noir. */
    const visSil=vis?(vis.loose||vis):null;
    silSegs.forEach(pr=>mepEmitSeg(geo.els,added,pr[0],pr[1],visSil,view.section?'sect':'sharp',view,hidKind));
    return mepFinishGeo(geo,view,cutShapes);
  }
  /* demi-espace : boîte orientée construite par prisme (API sondées) */
  /* 2026-10-22-013 : COUPE BRISÉE (ISO 128-44, plans parallèles) — section.pts =
     ligne de coupe en repère local de la vue mère, tronçons alternés à l'équerre.
     La matière ôtée est un prisme : profil = ligne brisée prolongée aux deux bouts
     et refermée côté regard (+n), extrudé le long du regard de la vue mère. */
  function mepSecStepped(view){
    const s=view&&view.section;
    if(!s||!Array.isArray(s.pts)||s.pts.length<3)return null;
    const sh=mepSheetOfView(view),par=sh&&mepView(sh,s.pid||view.parent);
    if(!par)return null;
    const pb=mepBasisOf(par),n=mepNorm(s.n);
    const W=(x,y)=>[pb.u[0]*x+pb.v[0]*y,pb.u[1]*x+pb.v[1]*y,pb.u[2]*x+pb.v[2]*y];
    let gx=mepDot(n,pb.u),gy=mepDot(n,pb.v);const gl=Math.hypot(gx,gy);
    if(gl<1e-6)return null;
    gx/=gl;gy/=gl;
    const P=s.pts.map(q=>({x:+q[0],y:+q[1]}));
    let tx=P[1].x-P[0].x,ty=P[1].y-P[0].y;const tl=Math.hypot(tx,ty);
    if(tl<1e-9)return null;
    tx/=tl;ty/=tl;
    const R=mepCutReach();
    const k=P.length-1;
    const poly2=[{x:P[0].x-tx*R,y:P[0].y-ty*R}].concat(P,[{x:P[k].x+tx*R,y:P[k].y+ty*R},
      {x:P[k].x+tx*R+gx*R,y:P[k].y+ty*R+gy*R},{x:P[0].x-tx*R+gx*R,y:P[0].y-ty*R+gy*R}]);
    const pd=mepNorm(pb.dir);
    const poly=poly2.map(q=>{const w=W(q.x,q.y);return[w[0]-pd[0]*R,w[1]-pd[1]*R,w[2]-pd[2]*R];});
    const planes=[],steps=[];
    for(let j=0;j<k;j++){
      if(j%2===0)planes.push(W(P[j].x,P[j].y));
      else steps.push({p:W(P[j].x,P[j].y),d:pd});
    }
    return{poly,vec:[pd[0]*2*R,pd[1]*2*R,pd[2]*2*R],planes,steps};
  }
  function mepCutReach(){
    // demi-taille englobant les corps visibles (et leur éloignement de l'origine)
    let R=0;
    try{
      const bb=new THREE.Box3();
      const list=(typeof bodies!=='undefined'&&bodies)||[];
      list.forEach(bd=>{if(bd&&bd.mesh&&bd.mesh.visible!==false&&!bd.ghost)bb.expandByObject(bd.mesh);});
      if(!bb.isEmpty()){
        const c=bb.getCenter(new THREE.Vector3());
        R=bb.getSize(new THREE.Vector3()).length()+c.length();
      }
    }catch(e){}
    return (R>1?R:400)+20;
  }
  function mepCutPrism(shape,poly,vec){
    if(typeof occt==='undefined'||!occt)return null;
    try{
      const pg=new occt.BRepBuilderAPI_MakePolygon_1();
      poly.forEach(q=>{const pt=new occt.gp_Pnt_3(q[0],q[1],q[2]);try{pg.Add_1(pt);}catch(e){try{pt.delete();}catch(e2){}}});
      try{pg.Close();}catch(e){}
      if(!pg.IsDone())return null;
      const fm=new occt.BRepBuilderAPI_MakeFace_15(pg.Wire(),true);
      fm.Build();
      if(!fm.IsDone())return null;
      const v=new occt.gp_Vec_4(vec[0],vec[1],vec[2]);
      const pr=new occt.BRepPrimAPI_MakePrism_1(fm.Face(),v,false,true);
      pr.Build();
      if(!pr.IsDone())return null;
      const cut=new occt.BRepAlgoAPI_Cut_3(shape,pr.Shape());
      let out=null;
      if(cut.IsDone&&cut.IsDone())out=cut.Shape();
      try{v.delete();}catch(e){}
      return out;
    }catch(e){return null;}
  }
  // ISO 128-44 : pas de trait dans la vue en coupe là où le plan change
  function mepDropStepEdges(els,view,st){
    if(!st||!st.steps.length)return els;
    const ln=st.steps.map(q=>{
      const px=mepDot(q.p,view.u),py=mepDot(q.p,view.v);
      let dx=mepDot(q.d,view.u),dy=mepDot(q.d,view.v);const L=Math.hypot(dx,dy);
      if(L<1e-6)return null;
      dx/=L;dy/=L;
      return{px,py,nx:-dy,ny:dx};
    }).filter(Boolean);
    const on=(x,y)=>ln.some(l=>Math.abs((x-l.px)*l.nx+(y-l.py)*l.ny)<0.01);
    return els.filter(e=>!(e.t==='L'&&on(e.x1,e.y1)&&on(e.x2,e.y2)
      &&ln.some(l=>Math.abs((e.x1-l.px)*l.nx+(e.y1-l.py)*l.ny)<0.01&&Math.abs((e.x2-l.px)*l.nx+(e.y2-l.py)*l.ny)<0.01)));
  }
  function mepCutHalfSpace(shape,p0,nrm){
    if(typeof occt==='undefined'||!occt)return null;
    try{
      const n=mepNorm(nrm),p=mepNorm(Math.abs(n[2])>0.9?[0,1,0]:[0,0,1]);
      let U=mepCross(n,p);const Lu=Math.hypot(U[0],U[1],U[2]);
      if(Lu<1e-6)return null;
      U=[U[0]/Lu,U[1]/Lu,U[2]/Lu];
      const V=mepCross(n,U);
      let diag=0;
      try{ // boîte englobante des corps visibles → demi-espace assez grand
        const bb=new THREE.Box3();
        const list=(typeof bodies!=='undefined'&&bodies)||[];
        list.forEach(bd=>{
          if(bd&&bd.mesh&&bd.mesh.visible!==false&&!bd.ghost){bb.expandByObject(bd.mesh);diag=Math.max(diag,bb.getSize(new THREE.Vector3()).length());}
        });
      }catch(e){}
      if(!(diag>1))diag=400;
      const A=diag/2+20;
      const cor=[[-A,-A],[A,-A],[A,A],[-A,A]].map(c=>[p0[0]+U[0]*c[0]+V[0]*c[1],p0[1]+U[1]*c[0]+V[1]*c[1],p0[2]+U[2]*c[0]+V[2]*c[1]]);
      const poly=new occt.BRepBuilderAPI_MakePolygon_1();
      cor.forEach(q=>{const pt=new occt.gp_Pnt_3(q[0],q[1],q[2]);try{poly.Add_1(pt);}catch(e){try{pt.delete();}catch(e2){}}});
      try{poly.Close();}catch(e){}
      if(!poly.IsDone())return null;
      const fm=new occt.BRepBuilderAPI_MakeFace_15(poly.Wire(),true);
      fm.Build();
      if(!fm.IsDone())return null;
      const dep=diag*2;
      const vec=new occt.gp_Vec_4(n[0]*dep,n[1]*dep,n[2]*dep);
      const pr=new occt.BRepPrimAPI_MakePrism_1(fm.Face(),vec,false,true);
      pr.Build();
      if(!pr.IsDone())return null;
      const cut=new occt.BRepAlgoAPI_Cut_3(shape,pr.Shape());
      let out=null;
      if(cut.IsDone&&cut.IsDone())out=cut.Shape();
      try{vec.delete();}catch(e){}
      return out;
    }catch(e){return null;}
  }
  /* hachures : faces planes du résultat de coupe posées sur le plan */
  function mepHatchLoops(shapes,view,p0,nrm){
    const n=mepNorm(nrm);
    const P0s=Array.isArray(p0[0])?p0:[p0]; // coupe brisée : un plan par tronçon
    const segs=[];
    shapes.forEach(sh=>{
      try{
        const fx=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);
        while(fx.More()){
          let keep=false;
          try{
            const f=occt.TopoDS.Face_1(fx.Current());
            const ad=new occt.BRepAdaptor_Surface_2(f,true);
            if(ad.GetType()===occt.GeomAbs_SurfaceType.GeomAbs_Plane){
              const pl=ad.Plane();
              const ax=pl.Axis();const d=ax.Direction();const loc=ax.Location();
              const dn=[d.X(),d.Y(),d.Z()],lp=[loc.X(),loc.Y(),loc.Z()];
              if(Math.abs(Math.abs(mepDot(dn,n))-1)<1e-3&&P0s.some(q=>Math.abs(mepDot(mepSub(lp,q),n))<0.05)){
                keep=true;
                const ee=new occt.TopExp_Explorer_2(f,occt.TopAbs_ShapeEnum.TopAbs_EDGE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);
                while(ee.More()){
                  try{
                    const e=occt.TopoDS.Edge_1(ee.Current());
                    const ca=new occt.BRepAdaptor_Curve_2(e);
                    const u0=ca.FirstParameter(),u1=ca.LastParameter();
                    if(u1>u0){
                      const N=8,pts=[];
                      for(let i=0;i<=N;i++){const q=ca.Value(u0+(u1-u0)*i/N);pts.push([q.X(),q.Y(),q.Z()]);}
                      for(let i=0;i<N;i++)segs.push([pts[i],pts[i+1]]);
                    }
                  }catch(err){}
                  ee.Next();
                }
              }
            }
          }catch(err){}
          fx.Next();
        }
      }catch(e){}
    });
    if(!segs.length)return[];
    /* projette + joint les segments en boucles */
    const ls=segs.map(pr=>[[mepDot(pr[0],view.u),mepDot(pr[0],view.v)],[mepDot(pr[1],view.u),mepDot(pr[1],view.v)]]);
    const loops=mepJoinLoops(ls);
    return loops;
  }
  function mepJoinLoops(segs){
    const q=p=>Math.round(p[0]*1000)+'_'+Math.round(p[1]*1000);
    const at=new Map();
    segs.forEach((s,i)=>{
      [0,1].forEach(k=>{
        const key=q(s[k]);
        if(!at.has(key))at.set(key,[]);
        at.get(key).push({i,k});
      });
    });
    const used=new Set(),loops=[];
    segs.forEach((s0,i0)=>{
      if(used.has(i0))return;
      const loop=[s0[0]];
      let cur=i0,curPt=s0[1],guard=0;
      used.add(i0);
      while(guard++<4000){
        loop.push(curPt);
        const cands=(at.get(q(curPt))||[]).filter(c=>!used.has(c.i));
        if(!cands.length)break;
        const c=cands[0];
        used.add(c.i);
        cur=c.i;
        curPt=segs[cur][1-c.k];
      }
      if(loop.length>2)loops.push(loop);
    });
    return loops.filter(l=>l.length>3);
  }
  /* détail : rogne la géométrie d'une vue au cercle (coords locales) */
  function mepClipDetail(els,det){
    const{cx,cy,r}=det,out=[];
    const inC=(x,y)=>Math.hypot(x-cx,y-cy)<=r-0.01;
    const clipSeg=(x1,y1,x2,y2)=>{
      const dx=x2-x1,dy=y2-y1,a=dx*dx+dy*dy;
      if(a<1e-12)return inC(x1,y1)?[[x1,y1,x2,y2]]:[];
      const bx=x1-cx,by=y1-cy;
      const bq=2*(bx*dx+by*dy),cq=bx*bx+by*by-r*r;
      const disc=bq*bq-4*a*cq;
      if(disc<0)return inC(x1,y1)?[[x1,y1,x2,y2]]:[];
      const sq=Math.sqrt(disc);
      let t0=(-bq-sq)/(2*a),t1=(-bq+sq)/(2*a);
      if(t0>t1){const t=t0;t0=t1;t1=t;}
      const segsOut=[];
      const inside0=inC(x1,y1),inside1=inC(x2,y2);
      if(inside0&&inside1)segsOut.push([x1,y1,x2,y2]);
      else if(inside0)segsOut.push([x1,y1,x1+dx*t1,y1+dy*t1]); // part de l'intérieur : sort au 2ᵉ croisement (t1 > 0)
      else if(inside1)segsOut.push([x1+dx*t0,y1+dy*t0,x2,y2]); // finit dedans : entre au 1er (t0 < 1)
      else if(t0>0&&t1<1)segsOut.push([x1+dx*t0,y1+dy*t0,x1+dx*t1,y1+dy*t1]);
      return segsOut;
    };
    els.forEach(e=>{
      if(e.t==='L'){
        clipSeg(e.x1,e.y1,e.x2,e.y2).forEach(s=>out.push({t:'L',x1:s[0],y1:s[1],x2:s[2],y2:s[3],k:e.k}));
      }else if(e.t==='C'){
        if(inC(e.cx,e.cy)&&e.r<=r-0.01)out.push(e);
        else{
          const d=Math.hypot(e.cx-cx,e.cy-cy);
          if(d>=e.r+r||d<=Math.abs(e.r-r))return;
          // cercle coupé : échantillonne l'arc intérieur
          const a0=Math.atan2(e.cy-cy,e.cx-cx);
          const cosA=(d*d+e.r*e.r-r*r)/(2*d*e.r);
          const da=Math.acos(Math.max(-1,Math.min(1,cosA)));
          const N=24,pts=[];
          for(let i=0;i<=N;i++){
            const t=a0-da+(2*da)*i/N;
            pts.push([e.cx+e.r*Math.cos(t),e.cy+e.r*Math.sin(t)]);
          }
          for(let i=0;i<N;i++)out.push({t:'L',x1:pts[i][0],y1:pts[i][1],x2:pts[i+1][0],y2:pts[i+1][1],k:e.k});
        }
      }else if(e.t==='A'){
        // arc : échantillonne puis rogne comme une polyligne
        const N=Math.max(8,Math.min(48,Math.round(Math.abs(e.a1-e.a0)*e.r*2)+4)),pts=[];
        for(let i=0;i<=N;i++){
          const t=e.a0+(e.a1-e.a0)*i/N;
          pts.push([e.cx+e.r*Math.cos(t),e.cy+e.r*Math.sin(t)]);
        }
        let run=[];
        const flush=()=>{for(let i=0;i+1<run.length;i++)out.push({t:'L',x1:run[i][0],y1:run[i][1],x2:run[i+1][0],y2:run[i+1][1],k:e.k});run=[];};
        for(let i=0;i<pts.length;i++){
          const p=pts[i];
          if(inC(p[0],p[1]))run.push(p);else flush();
        }
        flush();
      }else if(e.t==='P'&&e.pts){
        let run=[];
        const flush=()=>{for(let i=0;i+1<run.length;i++)out.push({t:'L',x1:run[i][0],y1:run[i][1],x2:run[i+1][0],y2:run[i+1][1],k:e.k});run=[];};
        for(let i=0;i<e.pts.length;i++){
          const p=e.pts[i];
          if(inC(p[0],p[1]))run.push(p);else flush();
        }
        flush();
      }
    });
    return out;
  }
  /* ═══════════════ I. création de vues ═══════════════ */
  function mepNextLabel(sh){
    const used=new Set(sh.views.map(v=>v.label).filter(Boolean));
    for(let i=0;i<26;i++){const L=String.fromCharCode(65+i);if(!used.has(L))return L;}
    return 'V'+sh.views.length;
  }
  /* AABB d'une géométrie projetée (els L/C/A) */
  function mepAABBOf(g){
    let minx=1e9,miny=1e9,maxx=-1e9,maxy=-1e9,any=false;
    g.els.forEach(e=>{
      const b=mepElAABB(e);if(!b)return;
      minx=Math.min(minx,b.minx);maxx=Math.max(maxx,b.maxx);
      miny=Math.min(miny,b.miny);maxy=Math.max(maxy,b.maxy);
      any=true;
    });
    return any?{minx,miny,maxx,maxy}:null;
  }
  function mepPlaceNear(sh,view,gx,gy){
    // évite la superposition : pousse la vue jusqu'à ce qu'elle soit libre
    const pad=18;
    const bbOf=v=>mepAABBOf(mepGeoOf(v));
    view.x=gx;view.y=gy;
    const b=bbOf(view);
    if(!b)return;
    for(let it=0;it<40;it++){
      let hit=false;
      sh.views.forEach(o=>{
        if(o===view)return;
        const ob=bbOf(o);if(!ob)return;
        const s1=mepToSheet(view,b.minx,b.miny),s2=mepToSheet(view,b.maxx,b.maxy);
        const o1=mepToSheet(o,ob.minx,ob.miny),o2=mepToSheet(o,ob.maxx,ob.maxy);
        if(s1.x<o2.x+pad&&s2.x+pad>o1.x&&s1.y<o2.y+pad&&s2.y+pad>o1.y){
          view.x+=(s2.x<o1.x+(o2.x-o1.x)/2?-(s2.x-o1.x+pad):(o2.x-s1.x+pad));
          hit=true;
        }
      });
      if(!hit)break;
    }
    const pd=mepPageDim(sh);
    view.x=Math.max(pd.ix+8,Math.min(pd.ix+pd.iw-8,view.x));
    view.y=Math.max(pd.iy+8,Math.min(pd.iy+pd.ih-8,view.y));
  }
  function mepAutoScale(sh,view){
    const b=mepAABBOf(mepGeoOf(view));
    if(!b)return;
    const{minx,miny,maxx,maxy}=b;
    const pd=mepPageDim(sh);
    const w=(maxx-minx)||1,h=(maxy-miny)||1;
    const s=Math.min(1,(pd.iw*0.42)/w,(pd.ih*0.8)/h);
    if(s>0&&s<1){
      const sc=MEP_SCALES.find(x=>x[0]<=s);
      view.scale=sc?sc[0]:Math.max(0.05,Math.round(s*20)/20);
    }
  }
  function mepAddView(opts){
    const sh=mepSheet();
    const view=Object.assign({id:mepUid('v'),kind:'base',vk:'front',bodyId:null,
      dir:[0,-1,0],u:[1,0,0],v:[0,0,-1],x:0,y:0,scale:1,mode:'hide',tangent:true,hlrExact:true,flip:false,
      label:'',parent:null,section:null,detail:null,autoAxes:false,autoPitch:false,axes:[]},opts||{});
    if(view.kind==='base'&&view.vk){
      const b=mepBasisOf(view);view.dir=b.dir;view.u=b.u;view.v=b.v;
    }
    const at=view._at,keep=view._keepScale;delete view._at;delete view._keepScale;
    mepEdit('nouvelle vue',()=>{
      sh.views.push(view);
      if(!keep)mepAutoScale(sh,view);
      if(at)mepViewCenterAt(view,at); // posée à la souris (commandes interactives)
      else{
        const pd=mepPageDim(sh);
        mepPlaceNear(sh,view,pd.ix+pd.iw*(0.28+0.16*(sh.views.length%3)),pd.iy+pd.ih*(view.kind==='detail'?0.3:0.45));
      }
    });
    mepSelect(view.id);
    return view;
  }
  /* ═══════════════ vue DXF importée (2026-10-23) ═══════════════
     Le DXF est lu par mepDxfParse (src/98-01-import-dxf.js) et rangé DANS la vue (doc.mep) :
     le projet reste autonome. Cotes, axes, accrochage et esquisse de planche s'y appliquent
     comme sur une vue projetée ; un détail peut y être pris. */
  function mepDxfPick(cb){
    const inp=document.createElement('input');inp.type='file';inp.accept='.dxf,application/dxf,image/vnd.dxf';
    inp.onchange=()=>{const f=inp.files&&inp.files[0];if(!f)return;
      const rd=new FileReader();
      rd.onload=()=>{let r=null;try{r=mepDxfParse(String(rd.result||''));}catch(e){r=null;}
        if(!r||!r.n){mepStatus('DXF : aucun élément géométrique lisible dans « '+f.name+' ».');return;}
        cb(r,f.name.replace(/\.[^.]+$/,''));};
      rd.readAsText(f);};
    inp.click();
  }
  function mepDxfSkipText(r){
    const k=Object.keys(r.skipped||{});
    return k.length?' — ignorés : '+k.map(t=>r.skipped[t]+' '+t).join(', '):'';
  }
  function mepDxfData(r,name,rev){return{name,els:r.els,n:r.n,bbox:r.bbox,units:r.units,skipped:r.skipped,rev};}
  // cotes DIMENSION du DXF → cotes natives (distance h / v / alignée, Ø, R accrochés au cercle)
  function mepDxfDims(sh,v,r){
    const out=[];let miss=0;
    const els=(v.dxf&&v.dxf.els)||[],S=q=>mepToSheet(v,q[0],q[1]);
    (r.dims||[]).forEach(D=>{
      if(D.kind==='lin'){
        const A=S(D.a),B=S(D.b),Pl=S(D.p);
        if(Math.hypot(B.x-A.x,B.y-A.y)<1e-9){miss++;return;}
        out.push({id:mepUid('d'),kind:'dist',vid:v.id,vid2:null,a:{x:D.a[0],y:D.a[1]},b:{x:D.b[0],y:D.b[1]},
          orient:D.orient,off:mepDimOffsetFromPts(A.x,A.y,B.x,B.y,D.orient,Pl),ref:false,tol:null});
      }else{
        const i=els.findIndex(e=>(e.t==='C'||e.t==='A')&&Math.hypot(e.cx-D.c[0],e.cy-D.c[1])<1e-3&&Math.abs(e.r-D.r)<1e-3);
        if(i<0){miss++;return;}
        out.push({id:mepUid('d'),kind:D.kind,vid:v.id,vid2:null,a:{x:els[i].cx,y:els[i].cy,hint:{t:'ctr',i}},b:{x:D.t[0],y:D.t[1]},ref:false,tol:null});
      }
    });
    if(out.length)mepEdit('cotes du DXF',()=>{out.forEach(d=>sh.dims.push(d));});
    return{n:out.length,miss};
  }
  function mepImportDxf(){
    mepDxfPick((r,name)=>{
      const sh=mepSheet();
      const v=mepAddView({kind:'dxf',vk:'',label:'',dxf:mepDxfData(r,name,1),mode:'wire',tangent:false,hlrExact:false});
      const cd=mepDxfDims(sh,v,r);
      mepStatus('DXF « '+name+' » importé : '+r.n+' élément(s), '+mepFmtNum(r.bbox.w,1)+' × '+mepFmtNum(r.bbox.h,1)+' mm'+
        (cd.n?' ; '+cd.n+' cote(s) reprise(s) en cotes du plan':'')+(cd.miss?' ('+cd.miss+' non reprise(s))':'')+mepDxfSkipText(r)+'.');
      mepSideShow();mepRender();return v;
    });
  }
  function mepDxfReplace(v){
    mepDxfPick((r,name)=>{
      mepEdit('DXF remplacé',()=>{v.dxf=mepDxfData(r,name,((v.dxf&&v.dxf.rev)||0)+1);});
      mepGeoCache.delete(v.id);
      mepStatus('DXF de la vue remplacé par « '+name+' » ('+r.n+' élément(s))'+mepDxfSkipText(r)+'. Les cotes gardent leurs n° d’éléments.');
      mepSideShow();mepRender();
    });
  }
  function mepSelect(id){mepSt.sel=id;mepSt.selDim=null;mepSt.selAxis=null;mepSideShow();}
  /* ═══════════════ J. commandes de vues ═══════════════ */
  function mepAddStandardView(vk,bodyId){
    const def=MEP_VIEWS[vk];if(!def)return null;
    return mepAddView({kind:'base',vk,bodyId:bodyId===undefined?null:bodyId,label:def.lab||''});
  }
  function mepAddCameraView(){
    let dir=[0,-1,0];
    try{
      const t=controls.target.clone(),d=camera.position.clone().sub(t);
      if(d.length()>1e-6){d.normalize();dir=[d.x,d.y,d.z];}
    }catch(e){}
    const b=mepBasisFromDir(dir);
    return mepAddView({kind:'base',vk:'',camera:true,dir:b.dir,u:b.u,v:b.v,label:''});
  }
  /* ═══════════════ J2. vues projetées (1er angle, méthode européenne) ═══════════════ */
  /* Règles 1er angle depuis la base du parent (d,u,v) :
     dessus    → dir=-v , u'=u   (placée SOUS la mère)
     dessous   → dir= v , u'=u   (placée SUR la mère)
     gauche    → dir=-u , u'=d   (placée à DROITE de la mère)
     droit     → dir= u , u'=-d  (placée à GAUCHE de la mère)
     Puis v'=u'×dir. L'axe libre du glissement est indiqué (axis). */
  const MEP_PROJ={
    top:   {dir:b=>[-b.v[0],-b.v[1],-b.v[2]],u:b=>b.u.slice(),lab:'Dessus',axis:'y'},
    bottom:{dir:b=>b.v.slice(),              u:b=>b.u.slice(),lab:'Dessous',axis:'y'},
    left:  {dir:b=>[-b.u[0],-b.u[1],-b.u[2]],u:b=>b.dir.slice(),lab:'Côté gauche',axis:'x'},
    right: {dir:b=>b.u.slice(),              u:b=>[-b.dir[0],-b.dir[1],-b.dir[2]],lab:'Côté droit',axis:'x'}
  };
  function mepProjFollow(sh,v,dx,dy){
    // les projections (et leurs sous-projections) suivent leur mère au glisser
    sh.views.forEach(c=>{
      if((c.kind==='proj'||c.align)&&c.parent===v.id){c.x+=dx;c.y+=dy;mepProjFollow(sh,c,dx,dy);}
    });
  }
  function mepAddProjected(par,which,at){
    const def=MEP_PROJ[which];
    if(!def){mepStatus('Projection inconnue : '+which);return null;}
    if(!par){mepStatus('Sélectionnez d’abord la vue mère à projeter.');return null;}
    const b=mepBasisOf(par);
    const dir=mepNorm(def.dir(b)),u=mepNorm(def.u(b));
    const v=mepNorm(mepCross(u,dir));
    const vObj=mepAddView(Object.assign({kind:'proj',vk:'',proj:which,dir,u,v,
      parent:par.id,label:mepNextLabel(mepSheet()),
      bodyId:par.bodyId,mode:par.mode,tangent:par.tangent,hlrExact:par.hlrExact!==false,scale:par.scale,
      autoAxes:!!par.autoAxes,autoPitch:!!par.autoPitch},at?{_keepScale:1,_at:at}:{}));
    // placement aligné 1er angle : l'axe commun est verrouillé sur la mère
    if(!at)mepEdit('placement vue projetée',()=>{
      vObj.scale=par.scale; // les vues liées partagent TOUJOURS l'échelle de la mère
      const off=mepViewSpan(par)+mepViewSpan(vObj)+30;
      if(which==='top'){vObj.x=par.x;vObj.y=par.y+off;}
      else if(which==='bottom'){vObj.x=par.x;vObj.y=par.y-off;}
      else if(which==='left'){vObj.x=par.x+off;vObj.y=par.y;}
      else{vObj.x=par.x-off;vObj.y=par.y;}
    });
    mepStatus('Vue projetée « '+def.lab+' » ('+vObj.label+') — 1er angle, alignée sur la mère.');
    return vObj;
  }
  function mepBeginAux(){
    const s=(typeof selFaces!=='undefined'&&selFaces||[])[0];
    if(!s||!s.mesh){mepStatus('Sélectionnez une FACE inclinée dans la 3D, puis retentez « Auxiliaire ».');return;}
    let n=null;
    try{
      const fn=(typeof faceNormalWorld==='function')?faceNormalWorld(s.mesh,s.faceIndex):null;
      if(fn)n=[fn.x,fn.y,fn.z];
    }catch(e){}
    if(!n){mepStatus('Normale de face illisible — retentez après sélection.');return;}
    // oriente la normale côté caméra
    try{
      const cp=camera.position;
      const pt=s.point||{x:0,y:0,z:0};
      const toCam=[cp.x-pt.x,cp.y-pt.y,cp.z-pt.z];
      if(mepDot(n,toCam)<0)n=[-n[0],-n[1],-n[2]];
    }catch(e){}
    const par=mepView(mepSheet(),mepSt.sel)||mepSheet().views[0];
    const b=mepBasisFromDir(n);
    const v=mepAddView({kind:'aux',vk:'',dir:b.dir,u:b.u,v:b.v,parent:par?par.id:null,label:mepNextLabel(mepSheet())});
    if(par){
      // décalage en alignement standard : direction de n projetée sur le papier du parent
      const dp=[mepDot(n,par.u),mepDot(n,par.v)];
      const L=Math.hypot(dp[0],dp[1]);
      if(L>0.2){
        const off=mepViewSpan(par)+60;
        mepEdit('placement vue auxiliaire',()=>{
          v.x=par.x+(dp[0]/L)*off*(Math.sign(dp[0])||1);
          v.y=par.y+(dp[1]/L)*off*(Math.sign(dp[1])||1);
        });
      }
    }
    mepStatus('Vue auxiliaire « '+v.label+' » créée — direction de la face sélectionnée.');
    return v;
  }
  function mepViewSpan(view){
    const g=mepGeoOf(view);
    let mx=10;
    g.els.forEach(e=>{
      const b=mepElAABB(e);if(!b)return;
      mx=Math.max(mx,Math.abs(b.minx),Math.abs(b.maxx),Math.abs(b.miny),Math.abs(b.maxy));
    });
    return mx*Math.max(0.2,view.scale);
  }
  function mepBeginSection(){mepVcmdStart('section');}
  function mepBeginSectionOld(){
    const par=mepView(mepSheet(),mepSt.sel);
    if(!par){mepStatus('Sélectionnez d’abord la vue parente de la coupe.');return;}
    mepSt.tool='cut2';mepSt.cutParent=par.id;mepSt.cutPts=[];
    mepStatus('Coupe : cliquez les DEUX points de la ligne de coupe sur la vue « '+(par.label||par.vk||'vue')+' ».');
  }
  function mepSectionFromPicks(par,A,B,opt){
    if(opt&&opt.s){
      // V0.3.13 : vue alignée sur la mère (base tournée comme une projection), sens = côté de la souris
      const L=Math.hypot(B.x-A.x,B.y-A.y);if(L<1e-6){mepStatus('Coupe : les deux points sont confondus.');return null;}
      const t={x:(B.x-A.x)/L,y:(B.y-A.y)/L},np={x:-t.y,y:t.x},Bs=mepPaperBasis(par,t,np,opt.s);
      const pb=mepBasisOf(par),wA=[pb.u[0]*A.x+pb.v[0]*A.y,pb.u[1]*A.x+pb.v[1]*A.y,pb.u[2]*A.x+pb.v[2]*A.y];
      const label=mepNextLabel(mepSheet());
      const v=mepAddView({kind:'section',vk:'',dir:Bs.dir,u:Bs.u,v:Bs.v,parent:par.id,label,
        bodyId:par.bodyId,mode:par.mode,tangent:par.tangent,hlrExact:par.hlrExact!==false,scale:par.scale,_keepScale:1,_at:opt.at,
        align:{x:np.x*opt.s,y:np.y*opt.s},autoAxes:!!par.autoAxes,autoPitch:!!par.autoPitch,
        section:Object.assign({p:wA,n:Bs.dir.slice(),a:[A.x,A.y],b:[B.x,B.y],pid:par.id,s:opt.s},
          opt.pts&&opt.pts.length>2?{pts:opt.pts.map(q=>[+(+q.x).toFixed(4),+(+q.y).toFixed(4)])}:{})});
      try{mepCutAutoRefs(mepSheet(),v);}catch(e){}
      mepStatus('Coupe '+label+'-'+label+' posée — glisser contraint sur sa ligne de rappel. Tirer sur la ligne de coupe la brise jusqu’au centre / à la ligne visé(e).');
      return v;
    }
    const dirA=mepNorm(par.dir);
    const wA=[par.u[0]*A.x+par.v[0]*A.y,par.u[1]*A.x+par.v[1]*A.y,par.u[2]*A.x+par.v[2]*A.y];
    const wB=[par.u[0]*B.x+par.v[0]*B.y,par.u[1]*B.x+par.v[1]*B.y,par.u[2]*B.x+par.v[2]*B.y];
    const d=mepSub(wB,wA);const L=Math.hypot(d[0],d[1],d[2]);
    if(L<1e-6){mepStatus('Coupe : les deux points sont confondus.');return null;}
    const dc=[d[0]/L,d[1]/L,d[2]/L];
    let n=mepCross(dirA,dc);
    const Ln=Math.hypot(n[0],n[1],n[2]);
    if(Ln<1e-6){mepStatus('Coupe : la ligne est parallèle au regard.');return null;}
    n=[n[0]/Ln,n[1]/Ln,n[2]/Ln];
    const label=mepNextLabel(mepSheet());
    const b=mepBasisFromDir(n);
    const v=mepAddView({kind:'section',vk:'',dir:b.dir,u:b.u,v:b.v,parent:par.id,label,
      autoAxes:!!par.autoAxes,autoPitch:!!par.autoPitch,
      section:{p:wA.slice(),n:n.slice(),a:[A.x,A.y],b:[B.x,B.y],pid:par.id}});
    // décalage le long de la ligne de coupe, sur le papier du parent
    mepEdit('placement vue en coupe',()=>{
      const span=mepViewSpan(par)+50;
      const dpx=B.x-A.x,py=B.y-A.y,dpl=Math.hypot(dpx,py)||1;
      v.x=par.x+(dpx/dpl)*span;
      v.y=par.y+(py/dpl)*span;
    });
    mepStatus('Coupe '+label+'-'+label+' créée.');
    return v;
  }
  function mepBeginDetail(){mepVcmdStart('detail');}
  function mepBeginDetailOld(){
    const par=mepView(mepSheet(),mepSt.sel);
    if(!par){mepStatus('Sélectionnez d’abord la vue parente du détail.');return;}
    mepSt.tool='det2';mepSt.cutParent=par.id;
    mepStatus('Détail : cliquez le CENTRE du cercle de détail, puis le rayon.');
  }
  function mepDetailFromPicks(par,C,R,opt){
    const label=mepNextLabel(mepSheet());
    const src=mepBasisOf(par);
    const v=mepAddView(Object.assign({kind:'detail',vk:'',dir:src.dir.slice(),u:src.u.slice(),v:src.v.slice(),
      parent:par.id,label,scale:opt&&opt.scale||2,detail:{cx:C.x,cy:C.y,r:R},bodyId:par.bodyId,mode:par.mode,tangent:par.tangent,hlrExact:par.hlrExact!==false,
      autoAxes:!!par.autoAxes,autoPitch:!!par.autoPitch},opt&&opt.at?{_keepScale:1,_at:opt.at}:{}));
    if(!(opt&&opt.at))mepEdit('placement vue de détail',()=>{
      const pd=mepPageDim(mepSheet());
      v.x=pd.ix+pd.iw*0.72;v.y=pd.iy+pd.ih*0.3;
      let s=2;
      const maxR=R*2.4;
      const target=Math.min(pd.iw*0.3,pd.ih*0.35);
      s=target/maxR;
      const sc=MEP_SCALES.find(x=>x[0]>=s);
      v.scale=sc?sc[0]:Math.max(0.5,Math.round(s*2)/2);
    });
    mepStatus('Détail '+label+' ('+mepFmtNum(R*2)+' Ø) créé.');
    return v;
  }
  function mepDelView(id){
    const sh=mepSheet();
    const v=mepView(sh,id);if(!v)return;
    mepEdit('suppression de vue',()=>{
      sh.views=sh.views.filter(x=>x.id!==id&&x.parent!==id);
      sh.dims=sh.dims.filter(d=>d.vid!==id&&d.vid2!==id);
      if(mepSt.sel===id)mepSt.sel=null;
    });
    mepSideShow();
  }
  function mepSegDist(p,e){
    // distance d'un point au segment L (x1,y1)-(x2,y2)
    const dx=e.x2-e.x1,dy=e.y2-e.y1,L2=dx*dx+dy*dy;
    let t=L2>0?((p.x-e.x1)*dx+(p.y-e.y1)*dy)/L2:0;t=t<0?0:(t>1?1:t);
    return Math.hypot(p.x-(e.x1+dx*t),p.y-(e.y1+dy*t));
  }
  function mepReproject(id){
    const sh=mepSheet();
    let list=id?[mepView(sh,id)]:sh.views;
    if(id&&list[0]){
      // cascade : rejeu aussi les filles (projections, coupes, détails) de cette vue
      const collect=par=>sh.views.filter(v=>v&&v.parent===par.id);
      const stack=[list[0]];
      while(stack.length){
        const cur=stack.pop();
        collect(cur).forEach(ch=>{if(list.indexOf(ch)<0){list.push(ch);stack.push(ch);}});
      }
    }
    mepEdit('rejeu des vues',()=>{
      // 2026-10-22-003 : entités visées par les cotes AVANT le rejeu — le re-ancrage
      // reprend le trait qui leur ressemble (au coin d'un rectangle, l'arête verticale
      // voisine était prise pour l'horizontale : cote de longueur 100 → 0)
      const before=new Map();
      sh.dims.forEach(d=>{
        const v1=mepView(sh,d.vid);if(!v1)return;
        const ent=(p,vw)=>{
          if(!p||!p.hint||typeof p.hint.i==='string'||!vw)return null;
          const e=mepEntByHint(vw,p.hint);if(!e)return null;
          // l'index doit bien désigner un trait passant par le point (sinon index périmé)
          if(e.t==='L'&&mepSegDist(p,e)<0.6)return e;
          if((e.t==='C'||e.t==='A')&&Math.hypot(e.cx-p.x,e.cy-p.y)<0.6)return e;
          return null;
        };
        before.set(d,{a:ent(d.a,v1),b:ent(d.b,d.vid2?mepView(sh,d.vid2):v1)});
      });
      list.forEach(v=>{
        if(!v)return;
        if(v.kind==='base'||v.kind==='aux'){
          if(v.vk&&MEP_VIEWS[v.vk]){const b=mepBasisOf(v);v.dir=b.dir;v.u=b.u;v.v=b.v;}
        }else if(v.kind==='proj'){
          // rejeu 1er angle : la base suit celle de la mère actuelle
          const par=mepView(sh,v.parent);
          const def=MEP_PROJ[v.proj||''];
          if(par&&def){
            const b=mepBasisOf(par);
            v.dir=mepNorm(def.dir(b));v.u=mepNorm(def.u(b));v.v=mepNorm(mepCross(v.u,v.dir));
            v.scale=par.scale;
          }
        }else if(v.kind==='section'&&v.section&&v.section.s){
          const par=mepView(sh,v.section.pid||v.parent);
          if(par){
            const A={x:v.section.a[0],y:v.section.a[1]},B={x:v.section.b[0],y:v.section.b[1]};
            const L=Math.hypot(B.x-A.x,B.y-A.y)||1,t={x:(B.x-A.x)/L,y:(B.y-A.y)/L},Bs=mepPaperBasis(par,t,{x:-t.y,y:t.x},v.section.s);
            const pb=mepBasisOf(par);
            v.section.p=[pb.u[0]*A.x+pb.v[0]*A.y,pb.u[1]*A.x+pb.v[1]*A.y,pb.u[2]*A.x+pb.v[2]*A.y];
            v.section.n=Bs.dir.slice();v.dir=Bs.dir;v.u=Bs.u;v.v=Bs.v;v.scale=par.scale;
          }
        }else if(v.kind==='aux'&&v.auxEdge){
          const par=mepView(sh,v.auxEdge.pid||v.parent);
          if(par){
            const a=v.auxEdge.a,b=v.auxEdge.b,L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,t={x:(b[0]-a[0])/L,y:(b[1]-a[1])/L};
            const Bs=mepPaperBasis(par,t,{x:-t.y,y:t.x},v.auxEdge.s);v.dir=Bs.dir;v.u=Bs.u;v.v=Bs.v;v.scale=par.scale;
          }
        }else if(v.kind==='section'&&v.section){
          const par=mepView(sh,v.section.pid||v.parent);
          if(par){
            const A={x:v.section.a[0],y:v.section.a[1]},B={x:v.section.b[0],y:v.section.b[1]};
            const wA=[par.u[0]*A.x+par.v[0]*A.y,par.u[1]*A.x+par.v[1]*A.y,par.u[2]*A.x+par.v[2]*A.y];
            const wB=[par.u[0]*B.x+par.v[0]*B.y,par.u[1]*B.x+par.v[1]*B.y,par.u[2]*B.x+par.v[2]*B.y];
            const d=mepSub(wB,wA),L=Math.hypot(d[0],d[1],d[2])||1;
            const dc=[d[0]/L,d[1]/L,d[2]/L];
            let n=mepCross(mepNorm(par.dir),dc);
            const Ln=Math.hypot(n[0],n[1],n[2])||1;
            n=[n[0]/Ln,n[1]/Ln,n[2]/Ln];
            if(v.flip)n=[-n[0],-n[1],-n[2]];
            v.section.p=wA;v.section.n=n;
            const b=mepBasisFromDir(n);
            v.dir=b.dir;v.u=b.u;v.v=b.v;
          }
        }
      });
      sh.dims.forEach(d=>{
        // re-ancrage des cotes sur la géométrie rejetée
        const v=mepView(sh,d.vid);if(!v)return;
        const old=before.get(d)||{};
        // forme du trait d'origine : extrémités (ou centre + rayon) ; une cote de longueur
        // sans entité connue se sert de ses deux points a → b
        const segMatch=(e,o)=>Math.min(
          Math.max(Math.hypot(e.x1-o.x1,e.y1-o.y1),Math.hypot(e.x2-o.x2,e.y2-o.y2)),
          Math.max(Math.hypot(e.x1-o.x2,e.y1-o.y2),Math.hypot(e.x2-o.x1,e.y2-o.y1)));
        const rebind=(a,vw,o)=>{
          if(!a||!a.hint)return a;
          if(typeof a.hint.i==='string')return a; // trait d'axe : clé stable, rien à re-ancrer
          const g=mepGeoOf(vw);
          if(!o&&a===d.a&&d.kind==='len'&&d.b&&!d.vid2)o={t:'L',x1:d.a.x,y1:d.a.y,x2:d.b.x,y2:d.b.y};
          let best=null,bs=Infinity;
          g.els.forEach((e,i)=>{
            if(a.hint.t==='seg'&&e.t==='L'){
              const d1=Math.hypot(e.x1-a.x,e.y1-a.y),d2=Math.hypot(e.x2-a.x,e.y2-a.y);
              const dmin=Math.min(d1,d2);
              // point à une extrémité : il s'y recale ; sinon il reste sur le trait
              const near=dmin<0.6?dmin:mepSegDist(a,e);
              if(!(near<0.6))return;
              const s=near+(o&&o.t==='L'?segMatch(e,o):0);
              if(s<bs){bs=s;best=dmin<0.6?(d1<d2?{x:e.x1,y:e.y1,hint:{t:'seg',i}}:{x:e.x2,y:e.y2,hint:{t:'seg',i}}):{x:a.x,y:a.y,hint:{t:'seg',i}};}
            }else if(a.hint.t==='ctr'&&(e.t==='C'||e.t==='A')){
              const dmin=Math.hypot(e.cx-a.x,e.cy-a.y);
              if(!(dmin<0.6))return;
              const s=dmin+(o&&(o.t==='C'||o.t==='A')?Math.abs(e.r-o.r):0);
              if(s<bs){bs=s;best={x:e.cx,y:e.cy,hint:{t:'ctr',i}};}
            }
          });
          return best||a;
        };
        const v2=d.vid2?mepView(sh,d.vid2):v;
        if(d.kind==='ord'){ // origine + points : chacun suit son entité
          d.o=rebind(d.o,v,null);d.a=d.b=d.o;
          d.pts=(d.pts||[]).map(q=>rebind(q,v,null));
          return;
        }
        d.a=rebind(d.a,v,old.a);
        if(d.b)d.b=rebind(d.b,v2||v,old.b);
      });
    });
  }
  /* ═══════════════ K. planches ═══════════════ */
  function mepAddSheetCmd(){
    mepEnsure();
    mepEdit('nouvelle planche',()=>{
      doc.mep.sheets.push(mepNewSheet(doc.mep.sheets.length+1));
      doc.mep.cur=doc.mep.sheets.length-1;
    });
    mepAfterSheetSwitch();
  }
  function mepDupSheetCmd(){
    const sh=mepSheet();
    mepEdit('duplication de planche',()=>{
      const c=JSON.parse(JSON.stringify({format:sh.format,orient:sh.orient,fw:sh.fw,fh:sh.fh,title:sh.title,views:sh.views,dims:sh.dims,sk:sh.sk,bom:sh.bom||null}));
      const ns=mepNewSheet(doc.mep.sheets.length+1);
      ns.format=c.format;ns.orient=c.orient;ns.title=c.title;if(c.bom)ns.bom=c.bom;
      if(c.format===FORMAT_MANUEL){ns.fw=c.fw;ns.fh=c.fh;}
      const idMap={};
      c.views.forEach(v=>{const nid=mepUid('v');idMap[v.id]=nid;v.id=nid;v.parent=v.parent?idMap[v.parent]||null:null;
        if(v.section)v.section.pid=idMap[v.section.pid]||null;});
      c.dims.forEach(d=>{d.id=mepUid('d');d.vid=idMap[d.vid]||d.vid;if(d.vid2)d.vid2=idMap[d.vid2]||d.vid2;});
      ns.views=c.views;ns.dims=c.dims;ns.sk=c.sk;
      doc.mep.sheets.splice(doc.mep.cur+1,0,ns);
      doc.mep.cur++;
    });
    mepAfterSheetSwitch();
  }
  function mepDelSheetCmd(){
    const sh=mepSheet();
    if(doc.mep.sheets.length<=1){mepStatus('Il faut garder au moins une planche.');return;}
    if(typeof mffAsk==='function'){
      mffAsk('Supprimer « '+sh.name+' » et toutes ses vues ?',[['Supprimer',true],['Annuler',false]]).then(ok=>{
        if(!ok)return;
        mepEdit('suppression de planche',()=>{doc.mep.sheets.splice(doc.mep.cur,1);doc.mep.cur=Math.max(0,doc.mep.cur-1);});
        mepAfterSheetSwitch();
      });
    }else if(confirm('Supprimer « '+sh.name+' » ?')){
      mepEdit('suppression de planche',()=>{doc.mep.sheets.splice(doc.mep.cur,1);doc.mep.cur=Math.max(0,doc.mep.cur-1);});
      mepAfterSheetSwitch();
    }
  }
  function mepAfterSheetSwitch(){
    mepSt.sel=null;mepSt.selDim=null;mepSt.tool='select';
    try{mepRender();}catch(e){}
    mepTabsRender();mepSideShow();mepToolSync();
    mepStatus('Ouverte : '+mepSheet().name);
  }
  /* ═══════════════ L. état UI ═══════════════ */
  const mepSt={open:false,sel:null,selDim:null,selAxis:null,tool:'select',axisMode:'hole',axisPick:[],axisFree:null,zoom:1,pan:{x:0,y:0},
    pick:null,dim:null,entSel:[],sk:null,cutParent:null,cutPts:[],detC:null,hovView:null,hovEnt:null,skSel:new Set()};
  try{if(localStorage.getItem('mep_rulers')==='0')mepSt.rulers=false;}catch(e){} // règles en mm (V0.3.11)
  try{ mepSt.zoomRev=localStorage.getItem('minifusion_mepZoomRev')==='1'; }catch(e){ mepSt.zoomRev=false; } // sens de la molette, mémorisé
  let mepWrapEl=null,mepSvgEl=null,mepSheetEl=null,mepSideEl=null,mepStatusEl=null,mepTabsEl=null;
  const mepDimHits=new Map();
  let mepToolbarEl=null,mepCtxEl=null,mepDefsEl=null;
  let mepGFrame=null,mepGSheet=null,mepGHlp=null,mepGridG=null;
  let mepPxMM=1; // mm papier par pixel écran (à recalculer au rendu)
  function mepStatus(msg){if(mepStatusEl)mepStatusEl.textContent=msg||'';try{if(msg)faceEl.textContent=String(msg).split('\n')[0];}catch(e){}}
  function mepPage(){
    const sh=mepSheet();const pd=mepPageDim(sh);
    const W=pd.W,H=pd.H;
    const w=W/mepSt.zoom,h=H/mepSt.zoom;
    return{W,H,pd,vb:[mepSt.pan.x,mepSt.pan.y,w,h]};
  }
  /* pointeur écran → mm papier */
  function mepPt(ev){
    const r=mepSvgEl.getBoundingClientRect();
    // V0.3.11 : matrice écran → planche du navigateur. Le viewBox garde les proportions de la
    // planche et est CENTRÉ (preserveAspectRatio « meet ») : fenêtre plus large que la planche
    // → bandes à gauche/droite ; l'ancien calcul (étirement sur toute la largeur) décalait X.
    try{
      const m=mepSvgEl.getScreenCTM&&mepSvgEl.getScreenCTM();
      if(m&&typeof DOMPoint==='function'){
        const q=new DOMPoint(ev.clientX,ev.clientY).matrixTransform(m.inverse());
        if(isFinite(q.x)&&isFinite(q.y))return{x:q.x,y:q.y,px:ev.clientX-r.left,py:ev.clientY-r.top};
      }
    }catch(e){}
    const vb=mepSvgViewBox();
    // repli (sans matrice) : même centrage « meet » calculé à la main
    const s=Math.min((r.width||1)/vb.width,(r.height||1)/vb.height)||1;
    const ox=((r.width||0)-vb.width*s)/2,oy=((r.height||0)-vb.height*s)/2;
    const px=ev.clientX-r.left,py=ev.clientY-r.top;
    return{x:vb.x+(px-ox)/s,y:vb.y+(py-oy)/s,px,py};
  }
  function mepSvgViewBox(){
    try{
      const b=mepSvgEl.viewBox&&mepSvgEl.viewBox.baseVal;
      if(b&&isFinite(b.width)&&b.width>0)return{x:b.x||0,y:b.y||0,width:b.width,height:b.height||1};
    }catch(e){}
    const pg=mepPage();
    return{x:pg.vb[0],y:pg.vb[1],width:pg.vb[2],height:pg.vb[3]};
  }
  function mepPxToMm(){
    try{
      const m=mepSvgEl.getScreenCTM&&mepSvgEl.getScreenCTM();
      if(m&&isFinite(m.a)&&m.a>0)return 1/m.a; // échelle réelle (centrage « meet » compris)
      const r=mepSvgEl.getBoundingClientRect();
      const vb=mepSvgViewBox();
      return Math.max(vb.width/(r.width||1),vb.height/(r.height||1));
    }catch(e){return 1;}
  }
  /* ═══════════════ palettes d'écran par thème (V0.3.11) ═══════════════
     Les couleurs du plan sont des variables CSS posées sur #mepWrap ; leurs valeurs PAR DÉFAUT
     (dans la feuille de style) sont la palette d'IMPRESSION noir sur blanc : l'export SVG et
     l'impression, hors de #mepWrap, retombent donc d'eux-mêmes sur le plan ISO.
     desk = fond autour de la planche ; papier « blanc » (défaut) ou « sombre » (confort écran). */
  const MEP_DESK={nuit:'#2b2e34',graphite:'#303236',atelier:'#2a2622',clair:'#c9ced6',contraste:'#000000'};
  const MEP_ACC_W={nuit:'#0a6fd8',graphite:'#1a73e8',atelier:'#c85f00',clair:'#0a6cff',contraste:'#0040ff'};
  const MEP_ACC_D={nuit:'#4da3ff',graphite:'#8ab4f8',atelier:'#ff9f0a',clair:'#4da3ff',contraste:'#00b4ff'};
  const MEP_PAPER={
    white:{mepPaper:'#ffffff',mepPaperEdge:'#b9c0c9',mepInk:'#151515',mepInk2:'#6a6f76',mepHid:'#59606a',mepFrameCol:'#222222',
      mepText:'#111111',mepGridCol:'#d8dde3',mepHatchCol:'#333333',mepThreadCol:'#a4a9b0',mepAxisCol:'#ff0000',mepSkFreeCol:'#0a84ff'},
    dark:{mepPaper:'#1e2126',mepPaperEdge:'#3a3f47',mepInk:'#e9eaec',mepInk2:'#9aa0a8',mepHid:'#8a9098',mepFrameCol:'#c9ccd1',
      mepText:'#e9eaec',mepGridCol:'#2c3038',mepHatchCol:'#b0b4ba',mepThreadCol:'#6c727a',mepAxisCol:'#ff0000',mepSkFreeCol:'#64d2ff'}
  };
  function mepPaperMode(){try{return localStorage.getItem('mep_paper')==='dark'?'dark':'white';}catch(e){return 'white';}}
  function mepThemeApply(){
    if(!mepWrapEl||!mepWrapEl.style)return;
    let th='nuit';try{th=document.body.getAttribute('data-theme')||'nuit';}catch(e){}
    const pm=mepPaperMode();
    const v=Object.assign({},MEP_PAPER[pm]);
    v.mepDesk=MEP_DESK[th]||MEP_DESK.nuit;
    v.mepAccent=(pm==='dark'?MEP_ACC_D:MEP_ACC_W)[th]||'#0a84ff';
    if(th==='contraste'&&pm==='dark'){v.mepPaper='#000000';v.mepPaperEdge='#5a5a5a';}
    const st=mepWrapEl.style;
    Object.keys(v).forEach(k=>{try{st.setProperty('--'+k,v[k]);}catch(e){st['--'+k]=v[k];}});
    // curseur en croix blanc si le fond de travail est sombre (tous thèmes sauf Clair)
    try{if(mepSheetEl&&mepSheetEl.classList)mepSheetEl.classList.toggle('mepCurInv',th!=='clair'||pm==='dark');}catch(e){}
  }
  function mepSetPaper(m){
    try{localStorage.setItem('mep_paper',m==='dark'?'dark':'white');}catch(e){}
    mepThemeApply();mepRender();
    mepStatus('Papier '+(m==='dark'?'sombre (écran seulement — export et impression sur papier blanc)':'blanc')+'.');
  }
  /* ═══════════════ cartouche enrichi (V0.3.11) ═══════════════
     Rangée 1 : PROJET | PLANCHE | ÉCHELLE | DATE | DESSINÉ PAR
     Rangée 2 : MATIÈRE | TRAITEMENT | TOL. GÉNÉRALES | INDICE
     Logo à gauche sur les deux rangées ; tableau des révisions posé au-dessus, à droite. */
  const MEP_TOL_GEN=['','ISO 2768-f','ISO 2768-m','ISO 2768-c','ISO 2768-v','ISO 2768-mK','ISO 2768-fH'];
  function mepRevs(sh){const t=sh.title||{};return Array.isArray(t.revs)?t.revs:[];}
  function mepDrawTitle(mk,sh,pd,ty){
    const tt=sh.title||{},H2=TITLE_H/2;
    const LW=tt.logo?32:0,x0=pd.ix+LW,iw=pd.iw-LW;
    if(LW){
      mk('line',{x1:x0,y1:ty,x2:x0,y2:ty+TITLE_H,class:'mepTitleBlock'});
      mk('image',{href:tt.logo,x:pd.ix+2,y:ty+2,width:LW-4,height:TITLE_H-4,preserveAspectRatio:'xMidYMid meet'});
    }
    mk('line',{x1:x0,y1:ty+H2,x2:pd.ix+pd.iw,y2:ty+H2,class:'mepTitleBlock'});
    const pw=Math.min(130,iw*0.4);
    const revs=mepRevs(sh),ind=revs.length?revs[revs.length-1].i:(tt.indice||'—');
    const row=(y,fields)=>fields.forEach((f,i)=>{
      const x=f[1];
      if(i>0)mk('line',{x1:x-2,y1:y,x2:x-2,y2:y+H2,class:'mepTitleBlock'});
      mk('text',{x,y:y+4.4,class:'mepTitleText'}).textContent=f[0];
      mk('text',{x,y:y+11,class:'mepTitleVal'}).textContent=String(f[3]||'').slice(0,Math.max(3,Math.floor(f[2]/2.1)));
    });
    const wLast=iw-pw-164;
    row(ty,[['PROJET',x0+4,pw,tt.projet],
      ['PLANCHE',x0+pw+6,44,(doc.mep.cur+1)+' / '+doc.mep.sheets.length],
      ['ÉCHELLE',x0+pw+54,40,mepSheetScaleLabel(sh)],
      ['DATE',x0+pw+98,56,tt.date],
      ['DESSINÉ PAR',x0+pw+158,wLast,tt.auteur]]);
    row(ty+H2,[['MATIÈRE',x0+4,pw,tt.matiere||'—'],
      ['TTS',x0+pw+6,44,tt.traitement||'—'],
      ['TTH',x0+pw+54,40,tt.tth||'—'],
      ['TOL. GÉNÉRALES',x0+pw+98,56,tt.tolgen||'—'],
      ['INDICE',x0+pw+158,wLast,ind]]);
  }
  /* réglages du tableau des révisions : largeur totale w (mm, 0 = auto), hauteur d'écriture h
     (ISO 3098), trait lw (mm). Rangés dans le modèle de cartouche dessiné (ils voyagent avec lui :
     bibliothèque, export .mfcartouche), sinon dans le cartouche de la planche. */
  const MEP_REV_DEF={w:0,h:2.5,lw:0.8};
  function mepRevStOwner(sh){const tt=sh.title||(sh.title={});return mepTbIsSk(sh)?tt.tb:tt;}
  function mepRevSt(sh){
    const tt=sh.title||{},o=Object.assign({},MEP_REV_DEF,tt.revSt||{},(mepTbIsSk(sh)&&tt.tb.revSt)||{});
    o.w=Math.max(0,+o.w||0);o.h=Math.min(10,Math.max(1.8,+o.h||MEP_REV_DEF.h));o.lw=Math.min(2,Math.max(0.1,+o.lw||MEP_REV_DEF.lw));
    return o;
  }
  // largeur du cartouche (pour aligner le tableau dessus) : esquisse = encombrement, sinon tout le cadre
  function mepTbW(sh,pd){
    if(mepTbIsSk(sh))return Math.max(0,-mepTbBBox(sh.title.tb.sk,mepTbLim(sh)).minx);
    return pd.iw;
  }
  // indice de la k-ième révision (k = 0…) : 'A' → A…Z, AA, AB… ; '0' → 0, 1… ; '1' → 1, 2…
  function mepRevIdx(fmt,k){
    if(fmt==='0'||fmt==='1')return String(k+(fmt==='1'?1:0));
    let s='',n=k+1;while(n>0){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26);}return s;
  }
  // indice suivant : suite du dernier s'il est dans le format (indice saisi à la main respecté), sinon le rang
  function mepRevNext(fmt,revs){
    const last=revs.length?String(revs[revs.length-1].i||'').trim():'';
    if(fmt==='0'||fmt==='1'){if(/^\d+$/.test(last))return String(+last+1);}
    else if(/^[A-Z]+$/.test(last)){let n=0;for(const c of last)n=n*26+(c.charCodeAt(0)-64);return mepRevIdx('A',n);}
    return mepRevIdx(fmt,revs.length);
  }
  function mepDrawRevs(mk,sh,pd,ty){
    // tableau des révisions : en-tête IND. | DATE | NOM | MODIFICATION en bas (contre le cartouche),
    // la plus récente en haut — comme la nomenclature
    const revs=mepRevs(sh);
    if(revs.length){
      const st=mepRevSt(sh),k=st.h/2.5,fs=mepFs(st.h),cw=fs*0.6; // cw ≈ largeur moyenne d'un caractère
      // IND. et DATE jamais tronqués : largeur au plus long texte de la colonne (marge 1,2 mm de chaque côté)
      const wTx=(l,f)=>revs.reduce((m,r)=>Math.max(m,String(r[f]||'').length),l.length)*cw+3;
      const RH=st.h+3,wI=Math.max(8,10*k,wTx('IND.','i')),wD=Math.max(18,22*k,wTx('DATE','d')),wN=Math.max(20,28*k);
      const Wd=wI+wD+wN+Math.min(110,pd.iw*0.45),W=Math.min(pd.iw,Math.max(wI+wD+wN+15,st.w>0?st.w:Wd));
      const wT=W-wI-wD-wN,xr=pd.ix+pd.iw-W;
      const n=Math.min(revs.length,8),y0=ty-RH*(n+1),ly=RH/2+st.h/2; // ligne de base centrée dans la rangée
      const L=(a)=>Object.assign(a,{class:'mepTitleBlock',style:'stroke-width:'+st.lw});
      const T=(x,y,t)=>{mk('text',{x,y,class:'mepRevText',style:'font-size:'+fs+'px'}).textContent=t;};
      mk('rect',L({x:xr,y:y0,width:W,height:RH*(n+1)}));
      const cols=[['IND.',xr,wI],['DATE',xr+wI,wD],['NOM',xr+wI+wD,wN],['MODIFICATION',xr+wI+wD+wN,wT]];
      const fit=(t,w)=>{t=String(t||'');const m=Math.max(1,Math.floor((w-2)/cw));return t.length>m?t.slice(0,Math.max(1,m-1))+'…':t;};
      cols.forEach(([l,x,w],c)=>{
        if(c)mk('line',L({x1:x,y1:y0,x2:x,y2:ty}));
        T(x+1.2,y0+RH*n+ly,fit(l,w));});
      revs.slice(-n).reverse().forEach((r,j)=>{
        const y=y0+RH*j;
        mk('line',L({x1:xr,y1:y+RH,x2:xr+W,y2:y+RH}));
        [r.i,r.d,r.n,r.t].forEach((v,c)=>T(cols[c][1]+1.2,y+ly,fit(v,cols[c][2])));
      });
    }
  }
  function mepLogoLoad(cb){
    // image réduite (≤ 240 px) en dataURL PNG : le plan reste léger dans le fichier .miniFusion
    const inp=document.createElement('input');inp.type='file';inp.accept='image/*';
    inp.onchange=()=>{const f=inp.files&&inp.files[0];if(!f)return;const rd=new FileReader();
      rd.onload=()=>{const im=new Image();im.onload=()=>{
        const k=Math.min(1,240/Math.max(im.width,im.height)),c=document.createElement('canvas');
        c.width=Math.max(1,Math.round(im.width*k));c.height=Math.max(1,Math.round(im.height*k));
        c.getContext('2d').drawImage(im,0,0,c.width,c.height);cb(c.toDataURL('image/png'));};im.src=rd.result;};
      rd.readAsDataURL(f);};
    inp.click();
  }
  /* ═══════════════ cotation automatique des perçages + nomenclature (V0.3.11) ═══════════════ */
  function mepAutoHoles(){
    // une étiquette par fonction Perçage et par vue où son axe est vu de bout ; « n× » si plusieurs trous ;
    // perçages déjà cotés laissés tels quels ; vue sélectionnée seulement, sinon toute la planche
    const sh=mepSheet();
    const views=mepSt.sel?[mepView(sh,mepSt.sel)].filter(Boolean):sh.views.slice();
    // famille : un perçage et ses répétitions (instances) ne font qu'une cote « n× »
    const fam0=d=>{const f=(doc.features||[]).find(x=>x.id===d.holeFid);return f?mepHoleFam(f):d.holeFid;};
    const done=new Set(sh.dims.filter(d=>d.kind==='hole'&&d.holeFid).map(fam0));
    const add=[];
    views.forEach(v=>{
      let g=null;try{g=mepGeoOf(v);}catch(e){return;}
      const byF=new Map();
      (g&&g.els||[]).forEach((e,i)=>{
        if(!e||e.t!=='C')return;
        let m=null;try{m=mepHoleAt(sh,v.id,e,i);}catch(err){}
        if(!m)return;
        const fam=mepHoleFam(m.f);if(done.has(fam))return;
        const key=[m.P.x,m.P.y,m.P.z].map(q=>(+q).toFixed(3)).join(',');
        let F=byF.get(fam);if(!F){F={f:m.f,fam,pts:new Map()};byF.set(fam,F);}
        const cur=F.pts.get(key),vis=e.k!=='hid';
        // par trou : un cercle vu de préférence, le plus grand (lamage / fraisure englobe)
        if(!cur||(vis&&!cur.vis)||(vis===cur.vis&&e.r>cur.e.r))F.pts.set(key,{e,i,vis});
      });
      byF.forEach(F=>{
        const list=[...F.pts.values()];
        // étiquette sur le trou le plus en haut à droite de la vue
        list.sort((p,q)=>(q.e.cx-q.e.cy)-(p.e.cx-p.e.cy));
        const t=list[0],e=t.e,k=e.r+9/Math.max(1e-9,v.scale||1);
        add.push({id:mepUid('d'),kind:'hole',vid:v.id,vid2:null,a:{x:e.cx,y:e.cy,hint:{t:'ctr',i:t.i}},
          b:{x:e.cx+k*0.75,y:e.cy-k*0.75},off:0,holeFid:F.f.id,holeText:mepHoleFeatureText(F.f),holeN:list.length,tol:null,ref:false});
        done.add(F.fam);
      });
    });
    if(!add.length){mepStatus('Perçages : rien à coter (aucun perçage vu de bout'+(mepSt.sel?' dans cette vue':'')+', ou déjà cotés).');return 0;}
    mepEdit('cotes de perçage auto',()=>{add.forEach(d=>sh.dims.push(d));});
    mepStatus(add.length+' cote(s) de perçage posée(s) — glissez une étiquette pour l’ajuster.');
    return add.length;
  }
  function mepBomRows(sh){
    // V0.6.7 : nomenclature des COMPOSANTS (premier niveau / tous niveaux / pièces seules)
    if(sh.bom&&sh.bom.lvl&&sh.bom.lvl!=='corps'&&asmPlanOn()){
      const bm=sh.bom.mat||{};
      return asmBomRows(sh.bom.lvl).map(r=>Object.assign(r,{mat:bm[r.ids[0]]||r.mat}));
    }
    // corps du document (visibles) ; quantité = corps de même nom et mêmes dimensions
    const rows=[],bm=(sh.bom&&sh.bom.mat)||{};
    const rt=typeof bodies!=='undefined'?bodies:[];
    (doc.bodies||[]).forEach(b=>{
      const r=rt.find(x=>x&&x.kind==='body'&&x.bodyId===b.id&&x.mesh);
      if(!r||r.visible===false)return;
      let dims='';
      try{const B=new THREE.Box3().setFromObject(r.mesh),S=B.getSize(new THREE.Vector3());
        dims=[S.x,S.y,S.z].map(v=>mepFmtNum(v,1)).join(' × ');}catch(e){}
      const name=b.name||b.id,mat=bm[b.id]||(sh.title&&sh.title.matiere)||'';
      const same=rows.find(q=>q.name===name&&q.dims===dims&&q.mat===mat);
      if(same)same.qty++;else rows.push({name,dims,mat,qty:1,ids:[b.id]});
    });
    rows.forEach((q,i)=>q.rep=i+1);
    return rows;
  }
  /* bulles (V0.6.7) : {view, comp, p (point 3D du composant actif), dx, dy (décalage papier)} ;
     le numéro est celui de la ligne du composant dans la nomenclature (renuméroté avec elle) */
  function mepBalloonsAuto(sh){
    const v=(sh.views||[]).find(x=>x.asm);if(!v)return 0;
    const rows=mepBomRows(sh);
    const c0=mepToSheet(v,0,0);
    sh.balloons=[];
    rows.forEach(r=>{
      const p=asmBalloonAnchor(r.ids[0]);if(!p)return;
      const l=mepLocal(v,p),A=mepToSheet(v,l[0],l[1]);
      let dx=A.x-c0.x,dy=A.y-c0.y;const n=Math.hypot(dx,dy);
      if(!(n>1)){dx=18;dy=-14;}else{dx=dx/n*18;dy=dy/n*18;} // accroche au centre de la vue : en haut à droite
      sh.balloons.push({id:'bl'+(sh.balloons.length+1),view:v.id,comp:r.ids[0],p,dx:+dx.toFixed(2),dy:+dy.toFixed(2)});
    });
    return sh.balloons.length;
  }
  function mepDrawBalloons(mk,sh){
    if(!Array.isArray(sh.balloons)||!sh.balloons.length)return;
    const rows=mepBomRows(sh);
    sh.balloons.forEach(b=>{
      const v=mepView(sh,b.view);if(!v)return;
      const row=rows.find(r=>r.ids&&r.ids[0]===b.comp);if(!row)return;
      const l=mepLocal(v,b.p),A=mepToSheet(v,l[0],l[1]),B={x:A.x+(+b.dx||0),y:A.y+(+b.dy||0)},R=3.6;
      const d=Math.hypot(B.x-A.x,B.y-A.y)||1,E={x:B.x-(B.x-A.x)/d*R,y:B.y-(B.y-A.y)/d*R};
      mk('line',{x1:A.x,y1:A.y,x2:E.x,y2:E.y,class:'mepTitleBlock'});
      mk('circle',{cx:A.x,cy:A.y,r:0.6,class:'mepTitleBlock',fill:'currentColor'});
      mk('circle',{cx:B.x,cy:B.y,r:R,class:'mepTitleBlock'});
      const tx=mk('text',{x:B.x,y:B.y+1.3,class:'mepRevText','text-anchor':'middle'});tx.textContent=String(row.rep);
    });
  }
  function mepDrawBom(mk,sh,pd,ty){
    if(!sh.bom||!sh.bom.on)return;
    const rows=mepBomRows(sh);if(!rows.length)return;
    const RH=5.5,cols=[['REP.',10],['QTÉ',10],['DÉSIGNATION',62],['MATIÈRE',40],['DIMENSIONS (mm)',42]];
    const W=cols.reduce((s,c)=>s+c[1],0),x0=pd.ix,n=Math.min(rows.length,12);
    // en bas à gauche du cadre, à côté du cartouche dessiné quand la place le permet ; sinon au-dessus
    const yF=pd.iy+pd.ih+pd.th;
    if(mepTbIsSk(sh)&&W<=pd.iw-mepTbW(sh,pd)-2)ty=yF;
    const y0=ty-RH*(n+1);
    mk('rect',{x:x0,y:y0,width:W,height:RH*(n+1),class:'mepTitleBlock'});
    // en-tête en bas (contre le cartouche), repère 1 juste au-dessus — usage des nomenclatures
    mk('line',{x1:x0,y1:ty-RH,x2:x0+W,y2:ty-RH,class:'mepTitleBlock'});
    let x=x0;
    cols.forEach(([l,w],k)=>{if(k)mk('line',{x1:x,y1:y0,x2:x,y2:ty,class:'mepTitleBlock'});
      mk('text',{x:x+1.5,y:ty-RH+3.9,class:'mepRevText'}).textContent=l;x+=w;});
    rows.slice(0,n).forEach((r,k)=>{
      const y=ty-RH*(k+2);
      if(k)mk('line',{x1:x0,y1:y+RH,x2:x0+W,y2:y+RH,class:'mepTitleBlock'});
      let xx=x0;[String(r.rep),String(r.qty),r.name,r.mat||'—',r.dims].forEach((t,c)=>{
        mk('text',{x:xx+1.5,y:y+4,class:'mepRevText'}).textContent=String(t).slice(0,Math.floor(cols[c][1]/1.7));xx+=cols[c][1];});
    });
  }
  /* ═══════════════ esquisse 2D contrainte + cartouche dessiné (V0.3.12) ═══════════════
     Deux esquisses partagent les mêmes outils :
       • l'esquisse de PLANCHE (sh.sk, mm papier) ;
       • l'esquisse du CARTOUCHE (sh.title.tb.sk), en édition (mepSt.tbEdit) : mm, origine « o »
         = coin bas-droit intérieur du cadre (ancrage ISO 7200), Y vers le bas comme la planche.
     Les textes de l'esquisse sont soit libres, soit des CHAMPS (matière, TTS, TTH…) dont la valeur
     vient de sh.title : changer de modèle de cartouche ne perd aucune saisie. */
  const MEP_TB_FIELDS={
    txt:{lab:'Texte libre'},
    projet:{lab:'PROJET',ed:'Projet',ph:'Nom du projet'},
    nplan:{lab:'N° DE PLAN',ed:'N° de plan',ph:'ex. MF-0012'},
    societe:{lab:'SOCIÉTÉ',ed:'Société',ph:''},
    client:{lab:'CLIENT',ed:'Client',ph:''},
    quantite:{lab:'QUANTITÉ',ed:'Quantité',ph:'ex. 10'},
    planche:{lab:'PLANCHE',auto:1},
    echelle:{lab:'ÉCHELLE',auto:1},
    format:{lab:'FORMAT',auto:1},
    date:{lab:'DATE',ed:'Date'},
    auteur:{lab:'DESSINÉ PAR',ed:'Dessiné par',ph:'—'},
    verif:{lab:'VÉRIFIÉ PAR',ed:'Vérifié par',ph:'—'},
    matiere:{lab:'MATIÈRE',ed:'Matière',ph:'ex. EN AW-2017 / S235',list:'mat'},
    traitement:{lab:'TTS',ed:'TTS (surface)',ph:'ex. anodisation noire',list:'tts'},
    tth:{lab:'TTH',ed:'TTH (thermique)',ph:'ex. trempe + revenu 45 HRC',list:'tth'},
    tolgen:{lab:'TOL. GÉNÉRALES',ed:'Tol. générales',sel:1},
    etat:{lab:'ÉTAT DE SURFACE',ed:'État de surface',ph:'ex. Ra 1,6',list:'ra'},
    masse:{lab:'MASSE',ed:'Masse',ph:'ex. 0,35 kg'},
    indice:{lab:'INDICE',auto:1},
    perso:{lab:'CHAMP PERSO',ed:''}
  };
  // listes de saisie : usages courants + valeurs déjà employées (mémorisées localement)
  const MEP_TB_LISTS={
    mat:['EN AW-2017 (AU4G)','EN AW-5083','EN AW-6082','EN AW-7075','S235JR','C45','42CrMo4','40CrMnMoS8-6 (40CMD8+S)','X5CrNi18-10 (304)','X2CrNiMo17-12-2 (316L)','CuZn39Pb3 (laiton)','POM-C','PA6','PEHD'],
    tts:['Anodisation naturelle','Anodisation noire','Anodisation dure','Zingage blanc','Zingage noir','Nickelage chimique','Brunissage','Peinture époxy','Passivation','Sans'],
    tth:['Trempe + revenu','Cémentation + trempe','Nitruration','Recuit de détente','Trempe par induction','Sans'],
    ra:['Ra 0,8','Ra 1,6','Ra 3,2','Ra 6,3']
  };
  const MEP_SK_TOOLS=['line','rect','circle','arc','point','trim','text','logo'];
  const mepClone=o=>JSON.parse(JSON.stringify(o));
  function mepTbIsSk(sh){const tb=sh&&sh.title&&sh.title.tb;return!!(tb&&tb.kind==='sk'&&tb.sk&&tb.sk.pts);}
  function mepTbAnchor(sh){const d=mepPageDim(sh);return{x:d.ix+d.iw,y:d.H-d.fr.b};}
  // lim (facultatif) : {w,h} du cadre — un point au-delà est « égaré » (solveur parti au loin)
  // et ne compte pas dans l'encombrement, sinon la planche n'a plus de place (révisions hors feuille)
  function mepTbBBox(sk,lim){
    let minx=0,miny=0;
    const out=p=>!!lim&&(p.x<-lim.w||p.y<-lim.h||p.x>1||p.y>1);
    const real=new Set(),cstP=new Set();
    (sk.ents||[]).forEach(e=>['p1','p2','pc','p'].forEach(k=>{if(e[k])(e.cst?cstP:real).add(e[k]);}));
    Object.keys(sk.pts||{}).forEach(k=>{const p=sk.pts[k];if(out(p)||(cstP.has(k)&&!real.has(k)))return;minx=Math.min(minx,p.x);miny=Math.min(miny,p.y);});
    (sk.ents||[]).forEach(e=>{if(e.t==='circle'&&!e.cst){const c=sk.pts[e.pc];if(c&&!out(c)){minx=Math.min(minx,c.x-e.r);miny=Math.min(miny,c.y-e.r);}}
      else if(e.t==='text'){const p=sk.pts[e.p];if(p&&!out(p))miny=Math.min(miny,p.y-0.75*(+e.h||3.5));}}); // hauteur des capitales ≈ 0,75 × corps
    return{minx,miny};
  }
  function mepTbLim(sh){const{W,H}=mepPageWH(sh),f=mepFrameOf(sh);return{w:W-f.l-f.r,h:H-f.t-f.b};}
  // points du cartouche hors du cadre (ex. ligne partie à y = −6 400 mm)
  function mepTbStray(sh){
    if(!mepTbIsSk(sh))return[];
    const L=mepTbLim(sh),pts=sh.title.tb.sk.pts;
    return Object.keys(pts).filter(k=>{const p=pts[k];return p.x<-L.w||p.y<-L.h||p.x>1||p.y>1;});
  }
  function mepTbH(sh){
    if(mepTbIsSk(sh)){const L=mepTbLim(sh);return Math.min(L.h*0.6,Math.max(0,-mepTbBBox(sh.title.tb.sk,L).miny));}
    return TITLE_H;
  }
  function mepSkCtx(sh,create){
    sh=sh||mepSheet();
    if(mepSt.tbEdit&&mepTbIsSk(sh)){const A=mepTbAnchor(sh);return{sk:sh.title.tb.sk,ox:A.x,oy:A.y,tb:true};}
    return{sk:create?mepSkEnsure(sh):(sh.sk||null),ox:0,oy:0,tb:false};
  }
  const mepSkS=(ctx,p)=>({x:p.x+ctx.ox,y:p.y+ctx.oy}); // local → planche
  function mepSkEditing(){return!!(mepSt.tbEdit||MEP_SK_TOOLS.indexOf(mepSt.tool)>=0||(mepSt.skSel&&mepSt.skSel.size));}
  // visibilité des aides d'édition (V0.4.x) : contraintes et cotes pilotantes, chacune masquable
  function mepSkVis(){
    if(!mepSt.skVis){let o={};try{o=JSON.parse(localStorage.getItem('mep_sk_vis')||'{}')||{};}catch(e){}
      mepSt.skVis={cons:o.cons!==false,dims:o.dims!==false,txt:o.txt===true};}
    return mepSt.skVis;
  }
  function mepSkTol(){return(mepPxMM||0.3)*7;}
  /* ── accrochage (outils de dessin) : points, milieux, sur ligne/cercle, puis géométrie des vues ── */
  function mepSkSnap(sh,P){
    const ctx=mepSkCtx(sh,false),sk=ctx.sk,tol=mepSkTol();
    let best=null,bd=tol;
    const consider=(x,y,o,bias)=>{const d=Math.hypot(x-P.x,y-P.y)+(bias||0);if(d<bd){bd=d;best=Object.assign({x,y},o);}};
    if(sk){
      Object.keys(sk.pts).forEach(pid=>{const p=mepSkS(ctx,sk.pts[pid]);consider(p.x,p.y,{pid},-tol*0.5);});
      sk.ents.forEach(e=>{
        if(e.t==='line'){
          const A=sk.pts[e.p1],B=sk.pts[e.p2];if(!A||!B)return;
          const a=mepSkS(ctx,A),b=mepSkS(ctx,B);
          consider((a.x+b.x)/2,(a.y+b.y)/2,{mid:{a:e.p1,b:e.p2}},-tol*0.2);
          const dx=b.x-a.x,dy=b.y-a.y,L2=dx*dx+dy*dy;
          if(L2>1e-12){const t=((P.x-a.x)*dx+(P.y-a.y)*dy)/L2;if(t>0&&t<1)consider(a.x+dx*t,a.y+dy*t,{on:{t:'line',id:e.id}},tol*0.3);}
        }else if(e.t==='circle'||e.t==='arc'){
          const C=sk.pts[e.pc];if(!C)return;const c=mepSkS(ctx,C);
          const ang=Math.atan2(P.y-c.y,P.x-c.x);
          consider(c.x+e.r*Math.cos(ang),c.y+e.r*Math.sin(ang),{on:{t:'circle',id:e.id}},tol*0.3);
        }
      });
    }
    if(best)return best;
    if(!ctx.tb){
      let s=mepSnapPt(P.x,P.y,sh);
      // « sur le trait / sur le cercle » près d'une extrémité, d'un milieu ou du centre : le point remarquable l'emporte
      const h=s.hit,v=h&&h.vid&&mepView(sh,h.vid),e=v&&(h.t==='onSeg'||h.t==='onC'||h.t==='onAx')?mepEntByHint(v,{i:h.ak!=null?'ax:'+h.ak:h.i}):null;
      if(e){
        const cand=e.t==='L'?[[e.x1,e.y1,'end'],[e.x2,e.y2,'end'],[(e.x1+e.x2)/2,(e.y1+e.y2)/2,'mid']]:(e.t==='C'||e.t==='A'?[[e.cx,e.cy,'ctr']]:[]);
        let bd=tol;cand.forEach(([x,y,t])=>{const q=mepToSheet(v,x,y),d=Math.hypot(q.x-P.x,q.y-P.y);
          if(d<bd){bd=d;s={x:q.x,y:q.y,hit:Object.assign({},h,{t:h.ak!=null&&t!=='ctr'?(t==='end'?'axEnd':'axMid'):t})};}});
      }
      const vw=mepSkLinkOfHit(sh,s);return vw?{x:s.x,y:s.y,vw}:{x:s.x,y:s.y};
    }
    return{x:P.x,y:P.y};
  }
  /* ── liens esquisse de planche → traits projetés des vues ────────────────────
     pt.lk = {vid, i (n° d'élément de la géométrie, ou « ax:clé » d'un trait d'axe), k, f|a, g}
     k : 'p1' | 'p2' | 'mid' | 'f' (fraction f le long du trait) | 'ctr' | 'ang' (angle a sur le cercle) ;
     g : dernière géométrie connue (repère vue) pour retrouver l'élément si la numérotation change.
     Le point est fixe pour le solveur et recalé sur la vue avant chaque rendu : l'esquisse suit. */
  function mepSkLinkGeo(e){return e.t==='L'?{t:'L',x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2}:{t:'C',cx:e.cx,cy:e.cy,r:e.r};}
  function mepSkLinkOfHit(sh,s){
    const h=s&&s.hit;if(!h||!h.vid)return null;
    const v=mepView(sh,h.vid);if(!v)return null;
    const i=h.ak!=null?'ax:'+h.ak:h.i;if(i==null)return null;
    const e=mepEntByHint(v,{i});if(!e||!(e.t==='L'||e.t==='C'||e.t==='A'))return null;
    const q=mepFromSheet(v,s.x,s.y),lk={vid:v.id,i};
    if(typeof i==='number')lk.g=mepSkLinkGeo(e);
    if(e.t==='L'){
      if(h.t==='mid'||h.t==='axMid')lk.k='mid';
      else{
        const d1=Math.hypot(q.x-e.x1,q.y-e.y1),d2=Math.hypot(q.x-e.x2,q.y-e.y2),L=Math.hypot(e.x2-e.x1,e.y2-e.y1)||1;
        if(Math.min(d1,d2)<L*1e-4)lk.k=d1<=d2?'p1':'p2';
        else{lk.k='f';lk.f=((q.x-e.x1)*(e.x2-e.x1)+(q.y-e.y1)*(e.y2-e.y1))/(L*L);}
      }
    }else if(h.t==='ctr')lk.k='ctr';
    else{lk.k='ang';lk.a=Math.atan2(q.y-e.cy,q.x-e.cx);}
    return lk;
  }
  function mepSkLinkEl(v,lk){
    if(typeof lk.i==='string')return mepEntByHint(v,{i:lk.i});
    const g=mepGeoOf(v);if(!mepGeoExact(g))return null; // jamais sur le maillage provisoire de l'ouverture
    const G=lk.g,fam=e=>e&&(e.t==='L'?'L':(e.t==='C'||e.t==='A'?'C':''));
    const dist=e=>{ // écart à la dernière géométrie connue (+ sens de parcours pour un trait)
      if(!G||fam(e)!==G.t)return{d:Infinity};
      if(G.t==='C')return{d:Math.hypot(e.cx-G.cx,e.cy-G.cy)+Math.abs(e.r-G.r)};
      const a=Math.hypot(e.x1-G.x1,e.y1-G.y1)+Math.hypot(e.x2-G.x2,e.y2-G.y2),b=Math.hypot(e.x1-G.x2,e.y1-G.y2)+Math.hypot(e.x2-G.x1,e.y2-G.y1);
      return a<=b?{d:a}:{d:b,sw:1};
    };
    let e=g.els[lk.i],r=dist(e);
    if(!G)return e||null;
    if(!(r.d<1e-3)){ // numérotation changée ou pièce modifiée : l'élément le plus proche de même nature
      let bi=-1,br={d:Infinity};
      g.els.forEach((x,j)=>{const q=dist(x);if(q.d<br.d){br=q;bi=j;}});
      if(bi<0||!(br.d<3))return null; // disparu : le point garde sa dernière position
      lk.i=bi;e=g.els[bi];r=br;
    }
    if(r.sw){if(lk.k==='p1')lk.k='p2';else if(lk.k==='p2')lk.k='p1';else if(lk.k==='f')lk.f=1-lk.f;}
    lk.g=mepSkLinkGeo(e);
    return e;
  }
  function mepSkLinkPos(sh,lk){
    const v=mepView(sh,lk.vid);if(!v)return null;
    const e=mepSkLinkEl(v,lk);if(!e)return null;
    let x,y;
    if(e.t==='L'){const f=lk.k==='p1'?0:lk.k==='p2'?1:lk.k==='mid'?0.5:(+lk.f||0);x=e.x1+(e.x2-e.x1)*f;y=e.y1+(e.y2-e.y1)*f;}
    else if(lk.k==='ang'){x=e.cx+e.r*Math.cos(+lk.a||0);y=e.cy+e.r*Math.sin(+lk.a||0);}
    else{x=e.cx;y=e.cy;}
    return isFinite(x)&&isFinite(y)?mepToSheet(v,x,y):null;
  }
  // recale les points liés de l'esquisse de planche ; résout si l'un d'eux a bougé
  function mepSkLinksRefresh(sh){
    const sk=sh&&sh.sk;if(!sk||!sk.pts)return;
    let moved=false;
    Object.keys(sk.pts).forEach(id=>{const p=sk.pts[id];if(!p.lk)return;
      let q=null;try{q=mepSkLinkPos(sh,p.lk);}catch(e){q=null;}
      if(q&&Math.hypot(q.x-p.x,q.y-p.y)>1e-6){p.x=q.x;p.y=q.y;moved=true;}});
    if(moved)mepSkSolve(sk,60);
  }
  /* ── création ── */
  function mepSkPtFrom(ctx,pt){
    const sk=ctx.sk;
    if(pt.pid&&sk.pts[pt.pid])return pt.pid;
    const id=mepSkPt(sk,pt.x-ctx.ox,pt.y-ctx.oy);
    if(pt.vw&&!ctx.tb){sk.pts[id].lk=pt.vw;return id;} // tenu par la vue : ni « sur ligne » ni « milieu »
    if(pt.on){mepSkCons(sk,pt.on.t==='line'?{type:'onLine',p:id,ent:pt.on.id}:{type:'onCircle',p:id,ent:pt.on.id});}
    else if(pt.mid&&sk.pts[pt.mid.a]&&sk.pts[pt.mid.b]){mepSkCons(sk,{type:'midpoint',p:id,a:pt.mid.a,b:pt.mid.b});}
    return id;
  }
  function mepSkAutoHV(sk,a,b){
    const A=sk.pts[a],B=sk.pts[b];if(!A||!B||(A.lk&&B.lk))return; // 2 points tenus par la vue : elle décide
    const dx=B.x-A.x,dy=B.y-A.y;if(Math.hypot(dx,dy)<1e-6)return;
    const ang=Math.abs(Math.atan2(dy,dx))*180/Math.PI;
    if(ang<3||ang>177)mepSkCons(sk,{type:'horizontal',a,b});
    else if(Math.abs(ang-90)<3)mepSkCons(sk,{type:'vertical',a,b});
  }
  /* style des nouveaux éléments (épaisseur, type, couleur) : réglé dans le panneau, mémorisé */
  function mepSkStyleCur(){
    if(!mepSt.skStyle){let o={};try{o=JSON.parse(localStorage.getItem('mep_sk_style')||'{}')||{};}catch(e){}mepSt.skStyle=o;}
    return mepSt.skStyle;
  }
  function mepSkStyled(e){
    const s=mepSkStyleCur();
    (e.t==='text'?['col']:['w','lw','lt','col','cst']).forEach(k=>{if(s[k]!==undefined&&s[k]!==null&&s[k]!=='')e[k]=s[k];});
    return e;
  }
  function mepSkAddLine(sh,A,B){
    const ctx=mepSkCtx(sh,true),sk=ctx.sk;
    const a=mepSkPtFrom(ctx,A),b=mepSkPtFrom(ctx,B);if(a===b)return null;
    const e=mepSkEnt(sk,mepSkStyled({t:'line',p1:a,p2:b}));
    mepSkAutoHV(sk,a,b);mepSkSolve(sk,40);
    return{e,a,b};
  }
  function mepSkAddRect(sh,A,B){
    const ctx=mepSkCtx(sh,true),sk=ctx.sk;
    const a=mepSkPtFrom(ctx,A),c=mepSkPtFrom(ctx,B);
    const pa=sk.pts[a],pc=sk.pts[c];
    const b=mepSkPt(sk,pc.x,pa.y),d=mepSkPt(sk,pa.x,pc.y);
    mepSkEnt(sk,mepSkStyled({t:'line',p1:a,p2:b}));mepSkEnt(sk,mepSkStyled({t:'line',p1:b,p2:c}));
    mepSkEnt(sk,mepSkStyled({t:'line',p1:c,p2:d}));mepSkEnt(sk,mepSkStyled({t:'line',p1:d,p2:a}));
    mepSkCons(sk,{type:'horizontal',a,b});mepSkCons(sk,{type:'vertical',a:b,b:c});
    mepSkCons(sk,{type:'horizontal',a:c,b:d});mepSkCons(sk,{type:'vertical',a:d,b:a});
    mepSkSolve(sk,40);
  }
  function mepSkAddCircle(sh,C,r){
    const ctx=mepSkCtx(sh,true),sk=ctx.sk;
    const c=mepSkPtFrom(ctx,C);
    return mepSkEnt(sk,mepSkStyled({t:'circle',pc:c,r:Math.max(0.1,r)}));
  }
  function mepSkAddArc(sh,C,A,B){
    const ctx=mepSkCtx(sh,true),sk=ctx.sk;
    const c=mepSkPtFrom(ctx,C),pc=sk.pts[c];
    const r=Math.max(0.1,Math.hypot(A.x-ctx.ox-pc.x,A.y-ctx.oy-pc.y));
    const a0=Math.atan2(A.y-ctx.oy-pc.y,A.x-ctx.ox-pc.x),a1=Math.atan2(B.y-ctx.oy-pc.y,B.x-ctx.ox-pc.x);
    const p1=mepSkPt(sk,pc.x+r*Math.cos(a0),pc.y+r*Math.sin(a0)),p2=mepSkPt(sk,pc.x+r*Math.cos(a1),pc.y+r*Math.sin(a1));
    const e=mepSkEnt(sk,mepSkStyled({t:'arc',pc:c,p1,p2,r,a0,a1}));
    mepSkCons(sk,{type:'onCircle',p:p1,ent:e.id});mepSkCons(sk,{type:'onCircle',p:p2,ent:e.id});
    return e;
  }
  function mepSkAddPt(sh,pt){const ctx=mepSkCtx(sh,true);return mepSkPtFrom(ctx,pt);}
  function mepSkAddText(sh,pt){
    const ctx=mepSkCtx(sh,true),sk=ctx.sk;
    const p=mepSkPtFrom(ctx,pt),f=mepSt.skTextF||'txt';
    const e={t:'text',p,f,h:mepFs(+mepSt.skTextH||MEP_TEXT_STYLE.noteH),st:f==='txt'?'lab':'val',al:'start'}; // e.h = corps ; mepSt.skTextH = majuscules (ISO 3098)
    if(f==='txt')e.s=mepSt.skTextS||'TEXTE';
    if(f==='perso'){e.k='c'+Date.now().toString(36);e.lab='CHAMP';}
    return mepSkEnt(sk,mepSkStyled(e));
  }
  function mepSkAddLogo(sh,A,B){
    const ctx=mepSkCtx(sh,true),sk=ctx.sk;
    const p1=mepSkPtFrom(ctx,{x:Math.min(A.x,B.x),y:Math.min(A.y,B.y)}),p2=mepSkPtFrom(ctx,{x:Math.max(A.x,B.x),y:Math.max(A.y,B.y)});
    return mepSkEnt(sk,{t:'logo',p1,p2});
  }
  function mepSkRmEnt(sk,eid){
    const e=sk.ents.find(x=>x.id===eid);if(!e)return;
    sk.ents=sk.ents.filter(x=>x.id!==eid);
    const used=new Set(['o']);
    sk.ents.forEach(x=>['p1','p2','pc','p'].forEach(k=>{if(x[k])used.add(x[k]);}));
    ['p1','p2','pc','p'].forEach(k=>{const pid=e[k];if(pid&&!used.has(pid))delete sk.pts[pid];});
    mepSkCleanCons(sk);
  }
  function mepSkCleanCons(sk){
    const has=id=>!!sk.pts[id]||sk.ents.some(x=>x.id===id);
    sk.cons=sk.cons.filter(c=>['a','b','p','ent'].every(k=>!c[k]||has(c[k])));
  }
  function mepSkMerge(sk,keep,drop){
    if(keep===drop||!sk.pts[keep]||!sk.pts[drop])return;
    if(drop==='o'){const t=keep;keep=drop;drop=t;}
    if(sk.pts[drop].lk&&!sk.pts[keep].lk&&keep!=='o')sk.pts[keep].lk=sk.pts[drop].lk;
    sk.ents.forEach(e=>['p1','p2','pc','p'].forEach(k=>{if(e[k]===drop)e[k]=keep;}));
    sk.cons.forEach(c=>['a','b','p'].forEach(k=>{if(c[k]===drop)c[k]=keep;}));
    delete sk.pts[drop];
    sk.ents=sk.ents.filter(e=>!(e.t==='line'&&e.p1===e.p2));
    sk.cons=sk.cons.filter(c=>!((c.type==='horizontal'||c.type==='vertical'||c.type==='dist'||c.type==='coincident')&&c.a===c.b));
    mepSkCleanCons(sk);
  }
  /* ── sélection : clés « p:pid », « e:eid », « c:cid » ── */
  let mepSkConHits=[];
  function mepSkHit(sh,P){
    const ctx=mepSkCtx(sh,false),sk=ctx.sk;if(!sk)return null;
    const tol=mepSkTol();
    if(mepSkEditing()){
      let best=null,bd=tol*0.8;
      // ancres de texte ignorées (le texte se sélectionne et se glisse lui-même) : collées à 2 mm des traits,
      // elles masquaient la ligne au clic
      const txt=new Set();sk.ents.forEach(e=>{if(e.t==='text')txt.add(e.p);});
      Object.keys(sk.pts).forEach(pid=>{if(txt.has(pid))return;const p=mepSkS(ctx,sk.pts[pid]);const d=Math.hypot(p.x-P.x,p.y-P.y);if(d<bd){bd=d;best='p:'+pid;}});
      if(best)return{key:best};
      for(const h of mepSkConHits)if(Math.abs(P.x-h.x)<=h.w/2+tol*0.2&&Math.abs(P.y-h.y)<=h.h/2+tol*0.2)return{key:'c:'+h.id};
    }
    // traits et cercles d'abord (tolérance 7 px) ; un texte ou le logo ne gagne que si aucun trait n'est
    // à portée — les textes couvrent presque toutes les cases du cartouche et masquaient leurs bords
    let best=null,bd=tol,bestT=null;
    sk.ents.forEach(e=>{
      let d=Infinity;
      if(e.t==='line'){const A=sk.pts[e.p1],B=sk.pts[e.p2];if(!A||!B)return;const a=mepSkS(ctx,A),b=mepSkS(ctx,B);
        const dx=b.x-a.x,dy=b.y-a.y,L2=dx*dx+dy*dy;const t=L2>1e-12?Math.max(0,Math.min(1,((P.x-a.x)*dx+(P.y-a.y)*dy)/L2)):0;
        d=Math.hypot(P.x-(a.x+dx*t),P.y-(a.y+dy*t));}
      else if(e.t==='circle'||e.t==='arc'){const C=sk.pts[e.pc];if(!C)return;const c=mepSkS(ctx,C);d=Math.abs(Math.hypot(P.x-c.x,P.y-c.y)-e.r);}
      else if(e.t==='text'){const p0=sk.pts[e.p];if(!p0)return;const p=mepSkS(ctx,p0),h=+e.h||3.5,w=Math.max(h,String(mepSkTextValue(sh,e,true)).length*h*0.56);
        const x0=e.al==='middle'?p.x-w/2:(e.al==='end'?p.x-w:p.x);
        if(P.x>=x0-0.5&&P.x<=x0+w+0.5&&P.y>=p.y-h-0.5&&P.y<=p.y+0.5&&!bestT)bestT='e:'+e.id;return;}
      else if(e.t==='logo'){const A=sk.pts[e.p1],B=sk.pts[e.p2];if(!A||!B)return;const a=mepSkS(ctx,A),b=mepSkS(ctx,B);
        if(P.x>=Math.min(a.x,b.x)&&P.x<=Math.max(a.x,b.x)&&P.y>=Math.min(a.y,b.y)&&P.y<=Math.max(a.y,b.y)&&!bestT)bestT='e:'+e.id;return;}
      if(d<bd){bd=d;best='e:'+e.id;}
    });
    best=best||bestT;
    return best?{key:best}:null;
  }
  function mepSkSelect(key,add){
    if(!mepSt.skSel)mepSt.skSel=new Set();
    if(add){if(mepSt.skSel.has(key))mepSt.skSel.delete(key);else mepSt.skSel.add(key);}
    else if(!mepSt.skSel.has(key))mepSt.skSel=new Set([key]);
    mepSt.sel=null;mepSt.selDim=null;mepSt.selAxis=null;mepSt.entSel=[];
  }
  function mepSkSelParts(sk){
    const P=[],L=[],C=[],T=[],K=[],O=[];
    [...(mepSt.skSel||[])].forEach(k=>{const id=k.slice(2);
      if(k[0]==='p'){if(sk.pts[id])P.push(id);}
      else if(k[0]==='e'){const e=sk.ents.find(x=>x.id===id);if(!e)return;
        if(e.t==='line')L.push(e);else if(e.t==='circle'||e.t==='arc')C.push(e);
        else if(e.t==='text'){T.push(e);P.push(e.p);}else O.push(e);}
      else if(k[0]==='c'){const c=sk.cons.find(x=>x.id===id);if(c)K.push(c);}});
    return{P,L,C,T,K,O};
  }
  function mepSkDimsOf(sk,s){
    const ids=new Set(s.P),own=new Set();
    s.L.forEach(l=>{ids.add(l.id);ids.add(l.p1);ids.add(l.p2);own.add(l.id);own.add(l.p1+'|'+l.p2);own.add(l.p2+'|'+l.p1);});
    s.C.forEach(c=>{ids.add(c.id);if(c.pc)ids.add(c.pc);own.add(c.id);});
    // placement des textes (2 / 4,4 / 11 mm du coin de case) : seulement si le texte est lui-même sélectionné
    const txt=new Set();sk.ents.forEach(e=>{if(e.t==='text'&&!s.T.includes(e))txt.add(e.p);});
    const D=sk.cons.filter(c=>c.val!=null&&c.type!=='fix'&&[c.a,c.b,c.p,c.ent].some(x=>x&&ids.has(x))&&![c.a,c.b,c.p].some(x=>x&&txt.has(x)));
    const mine=c=>own.has(c.a)||own.has(c.ent)||own.has(c.a+'|'+c.b);
    return D.filter(mine).concat(D.filter(c=>!mine(c)));
  }
  function mepSkDeleteSel(sh){
    const ctx=mepSkCtx(sh,false),sk=ctx.sk;if(!sk||!mepSt.skSel.size)return;
    mepEdit('suppression esquisse',()=>{mepSkDelRaw(sk);});
    mepSideShow();
  }
  /* ── contraintes : géométriques et cotes pilotantes, appliquées à la sélection ── */
  function mepSkMeasure(sk,c){
    const P=id=>sk.pts[id];
    const ent=id=>sk.ents.find(x=>x.id===id);
    if(c.type==='dist'){const a=P(c.a),b=P(c.b);return a&&b?Math.hypot(b.x-a.x,b.y-a.y):0;}
    if(c.type==='distX'){const a=P(c.a),b=P(c.b);return a&&b?b.x-a.x:0;}
    if(c.type==='distY'){const a=P(c.a),b=P(c.b);return a&&b?b.y-a.y:0;}
    if(c.type==='distPL'){const p=P(c.p),L=ent(c.ent);if(!p||!L)return 0;const a=P(L.p1),b=P(L.p2);const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1;return((p.x-a.x)*dy-(p.y-a.y)*dx)/l;}
    if(c.type==='radius'){const e=ent(c.a);return e?e.r:0;}
    if(c.type==='angle'){const A=ent(c.a),B=ent(c.b);if(!A||!B)return 0;const a1=P(A.p1),a2=P(A.p2),b1=P(B.p1),b2=P(B.p2);
      let d=Math.atan2(b2.y-b1.y,b2.x-b1.x)-Math.atan2(a2.y-a1.y,a2.x-a1.x);while(d<=-Math.PI)d+=2*Math.PI;while(d>Math.PI)d-=2*Math.PI;return d;}
    return 0;
  }
  const MEP_SK_CONS=[
    {id:'coincident',lab:'Coïncident',tip:'Fusionne 2 points',ok:s=>s.P.length===2&&!s.L.length&&!s.C.length,
      go:(sk,s)=>mepSkMerge(sk,s.P[0],s.P[1])},
    {id:'horizontal',lab:'Horizontal',tip:'Ligne(s) horizontale(s), ou 2 points à même hauteur',
      ok:s=>(s.L.length>=1&&!s.P.length&&!s.C.length)||(s.P.length===2&&!s.L.length),
      go:(sk,s)=>s.L.length?s.L.forEach(l=>mepSkCons(sk,{type:'horizontal',a:l.p1,b:l.p2})):mepSkCons(sk,{type:'horizontal',a:s.P[0],b:s.P[1]})},
    {id:'vertical',lab:'Vertical',tip:'Ligne(s) verticale(s), ou 2 points alignés verticalement',
      ok:s=>(s.L.length>=1&&!s.P.length&&!s.C.length)||(s.P.length===2&&!s.L.length),
      go:(sk,s)=>s.L.length?s.L.forEach(l=>mepSkCons(sk,{type:'vertical',a:l.p1,b:l.p2})):mepSkCons(sk,{type:'vertical',a:s.P[0],b:s.P[1]})},
    {id:'parallel',lab:'Parallèle',tip:'Lignes parallèles à la première sélectionnée',ok:s=>s.L.length>=2&&!s.P.length&&!s.C.length,
      go:(sk,s)=>s.L.slice(1).forEach(l=>mepSkCons(sk,{type:'parallel',a:s.L[0].id,b:l.id}))},
    {id:'perp',lab:'Perpendic.',tip:'2 lignes perpendiculaires',ok:s=>s.L.length===2&&!s.P.length&&!s.C.length,
      go:(sk,s)=>mepSkCons(sk,{type:'perp',a:s.L[0].id,b:s.L[1].id})},
    {id:'equal',lab:'Égal',tip:'Mêmes longueurs (lignes) ou mêmes rayons (cercles)',ok:s=>!s.P.length&&((s.L.length>=2&&!s.C.length)||(s.C.length>=2&&!s.L.length)),
      go:(sk,s)=>{const a=s.L.length?s.L:s.C;a.slice(1).forEach(x=>mepSkCons(sk,s.L.length?{type:'equal',a:a[0].id,b:x.id}:{type:'eqR',a:a[0].id,b:x.id}));}},
    {id:'midpoint',lab:'Milieu',tip:'Point au milieu de la ligne',ok:s=>s.P.length===1&&s.L.length===1&&!s.C.length,
      go:(sk,s)=>mepSkCons(sk,{type:'midpoint',p:s.P[0],a:s.L[0].p1,b:s.L[0].p2})},
    {id:'onLine',lab:'Sur ligne',tip:'Point(s) sur la ligne (prolongée)',ok:s=>s.P.length>=1&&s.L.length===1&&!s.C.length,
      go:(sk,s)=>s.P.forEach(p=>mepSkCons(sk,{type:'onLine',p,ent:s.L[0].id}))},
    {id:'onCircle',lab:'Sur cercle',tip:'Point(s) sur le cercle',ok:s=>s.P.length>=1&&s.C.length===1&&!s.L.length,
      go:(sk,s)=>s.P.forEach(p=>mepSkCons(sk,{type:'onCircle',p,ent:s.C[0].id}))},
    {id:'tangent',lab:'Tangent',tip:'Ligne tangente au cercle',ok:s=>s.L.length===1&&s.C.length===1&&!s.P.length,
      go:(sk,s)=>mepSkCons(sk,{type:'tangent',a:s.L[0].id,b:s.C[0].id})},
    {id:'concentric',lab:'Concentrique',tip:'Cercles de même centre',ok:s=>s.C.length>=2&&!s.L.length&&!s.P.length,
      go:(sk,s)=>s.C.slice(1).forEach(c=>mepSkMerge(sk,s.C[0].pc,c.pc))},
    {id:'fix',lab:'Fixe',tip:'Bloque les points sélectionnés à leur position',ok:s=>s.P.length+s.L.length+s.C.length+s.O.length>0,
      go:(sk,s)=>{const ps=new Set(s.P);s.L.concat(s.O).forEach(l=>{ps.add(l.p1);ps.add(l.p2);});s.C.forEach(c=>ps.add(c.pc));
        const fx=mepSkFixed(sk);ps.forEach(p=>{if(!fx.has(p))mepSkCons(sk,{type:'fix',p});});}},
    {id:'dist',lab:'Distance',dim:1,tip:'Cote pilotante : 2 points, longueur d’une ligne, point↔ligne ou 2 lignes parallèles',
      ok:s=>!s.C.length&&((s.P.length===2&&!s.L.length)||(s.L.length===1&&s.P.length<=1)||(s.L.length===2&&!s.P.length)),
      go:(sk,s)=>{
        if(s.P.length===2&&!s.L.length)return mepSkCons(sk,{type:'dist',a:s.P[0],b:s.P[1]});
        if(s.L.length===1&&!s.P.length)return mepSkCons(sk,{type:'dist',a:s.L[0].p1,b:s.L[0].p2});
        if(s.L.length===1)return mepSkCons(sk,{type:'distPL',p:s.P[0],ent:s.L[0].id});
        return mepSkCons(sk,{type:'distPL',p:s.L[1].p1,ent:s.L[0].id});}},
    {id:'distX',lab:'Dist. horiz.',dim:1,tip:'Cote pilotante horizontale (2 points ou une ligne)',ok:s=>!s.C.length&&((s.P.length===2&&!s.L.length)||(s.L.length===1&&!s.P.length)),
      go:(sk,s)=>s.L.length?mepSkCons(sk,{type:'distX',a:s.L[0].p1,b:s.L[0].p2}):mepSkCons(sk,{type:'distX',a:s.P[0],b:s.P[1]})},
    {id:'distY',lab:'Dist. vert.',dim:1,tip:'Cote pilotante verticale (2 points ou une ligne)',ok:s=>!s.C.length&&((s.P.length===2&&!s.L.length)||(s.L.length===1&&!s.P.length)),
      go:(sk,s)=>s.L.length?mepSkCons(sk,{type:'distY',a:s.L[0].p1,b:s.L[0].p2}):mepSkCons(sk,{type:'distY',a:s.P[0],b:s.P[1]})},
    {id:'radius',lab:'Rayon',dim:1,tip:'Cote pilotante de rayon',ok:s=>s.C.length===1&&!s.L.length&&!s.P.length,
      go:(sk,s)=>mepSkCons(sk,{type:'radius',a:s.C[0].id})},
    {id:'angle',lab:'Angle',dim:1,tip:'Cote pilotante d’angle entre 2 lignes',ok:s=>s.L.length===2&&!s.P.length&&!s.C.length,
      go:(sk,s)=>mepSkCons(sk,{type:'angle',a:s.L[0].id,b:s.L[1].id})}
  ];
  const MEP_SK_CON_NAMES={horizontal:'Horizontal',vertical:'Vertical',parallel:'Parallèle',perp:'Perpendiculaire',equal:'Égal',eqR:'Rayons égaux',
    midpoint:'Milieu',onLine:'Sur ligne',onCircle:'Sur cercle',tangent:'Tangent',fix:'Fixe',coincident:'Coïncident',
    dist:'Distance',distX:'Distance horizontale',distY:'Distance verticale',distPL:'Distance point–ligne',radius:'Rayon',angle:'Angle'};
  function mepSkSnapshot(sk){return JSON.stringify({pts:sk.pts,ents:sk.ents,cons:sk.cons,seq:sk.seq});}
  function mepSkRestore(sk,snap){const o=JSON.parse(snap);sk.pts=o.pts;sk.ents=o.ents;sk.cons=o.cons;sk.seq=o.seq;}
  function mepSkApply(sh,id){
    const ctx=mepSkCtx(sh,false),sk=ctx.sk;if(!sk)return;
    const D=MEP_SK_CONS.find(x=>x.id===id);if(!D)return;
    const s=mepSkSelParts(sk);if(!D.ok(s)){mepStatus('Contrainte « '+D.lab+' » : sélection inadaptée.');return;}
    let bad=false,created=null;
    mepEdit('contrainte '+D.lab,()=>{
      const snap=mepSkSnapshot(sk),n0=sk.cons.length;
      const r=D.go(sk,s);
      if(D.dim&&r&&r.type){r.val=mepSkMeasure(sk,r);created=r;} // cote posée à la valeur actuelle : rien ne bouge
      const err=mepSkSolve(sk,80);
      if(err>1e-3){mepSkRestore(sk,snap);bad=true;}
      else if(!created&&sk.cons.length>n0)created=sk.cons[sk.cons.length-1];
    });
    if(bad){mepStatus('Contrainte « '+D.lab+' » refusée : incompatible ou redondante avec les contraintes existantes.');mepRender();return;}
    if(created&&D.dim){mepSt.skSel=new Set(['c:'+created.id]);mepSt.skFocusVal=true;}
    mepStatus('Contrainte « '+D.lab+' » posée.');
    mepSideShow();mepRender();
  }
  function mepSkSetVal(sh,c,v){
    const ctx=mepSkCtx(sh,false),sk=ctx.sk;if(!sk||!isFinite(v))return;
    let bad=false;
    mepEdit('cote pilotante',()=>{
      const snap=mepSkSnapshot(sk);
      if(c.type==='angle')c.val=(Math.sign(c.val)||1)*Math.abs(v)*Math.PI/180;
      else if(c.type==='distX'||c.type==='distY'||c.type==='distPL')c.val=(Math.sign(c.val)||1)*Math.abs(v);
      else c.val=Math.abs(v);
      const err=mepSkSolve(sk,120);
      if(err>1e-3){mepSkRestore(sk,snap);bad=true;}
    });
    if(bad)mepStatus('Valeur impossible avec les autres contraintes — non appliquée.');
    mepSideShow();mepRender();
  }
  /* ── rendu ── */
  function mepSkTextValue(sh,e,edit){
    if(e.f==='txt')return e.s||'';
    const v=mepTbValue(sh,{f:e.f,k:e.k});
    if(edit&&(!v||v==='—'))return'{'+(e.f==='perso'?(e.lab||'CHAMP'):(MEP_TB_FIELDS[e.f]||{}).lab||e.f)+'}';
    return v;
  }
  function mepDrawSkCtx(mk,sh,ctx,mode){
    // mode : 'sheet' (esquisse de planche), 'tb' (cartouche affiché), 'tbEdit' (cartouche en édition)
    const sk=ctx.sk;if(!sk)return;
    const S=p=>mepSkS(ctx,p),sel=mepSt.skSel||new Set(),hov=mepSt.skHov;
    const editing=mode==='tbEdit'||(mode==='sheet'&&!mepSt.tbEdit&&mepSkEditing());
    // style par entité (V0.3.13) : e.w 'thin'|'thick' (défaut : épais sur la planche, fin au cartouche),
    // e.lw épaisseur libre (mm), e.lt 'hid'|'axis', e.col couleur (#rrggbb, classe mepUc → noir à l'export « Noir »)
    const wDef=mode==='sheet'?'thick':'thin';
    // e.cst : élément de construction — pointillé d'aide en édition (calque d'aide, jamais exporté), invisible sinon
    const lineCls=e=>{const w=e.w||wDef;
      if(e.cst)return'mepSkCst'+(sel.has('e:'+e.id)?' mepSkSelE':(hov==='e:'+e.id?' mepSkHovE':''));
      return (mode==='sheet'?'mepEnt mepSkFull'+(w==='thick'?' mepSkThick':' mepSkThin'):('mepTbLine'+(w==='thick'?' mepTbThick':'')))+
        (e.lt==='hid'?' mepLtHid':(e.lt==='axis'?' mepLtAxis':''))+(e.col?' mepUc':'')+(sel.has('e:'+e.id)&&editing?' mepSkSelE':(hov==='e:'+e.id&&editing?' mepSkHovE':''));};
    const lineAt=(e,o)=>{o.class=lineCls(e);if(e.cst)return o;const st=[];if(+e.lw>0)st.push('stroke-width:'+(+e.lw));if(e.col)st.push('stroke:'+e.col);if(st.length)o.style=st.join(';');return o;};
    sk.ents.forEach(e=>{
      const cst=!!e.cst&&(e.t==='line'||e.t==='circle'||e.t==='arc');
      if(cst&&!editing)return;
      const mkE=(tag,o)=>cst?mk(tag,o,mepGHlp):mk(tag,o);
      if(e.t==='line'){const A=sk.pts[e.p1],B=sk.pts[e.p2];if(!A||!B)return;const a=S(A),b=S(B);
        mkE('line',lineAt(e,{x1:a.x,y1:a.y,x2:b.x,y2:b.y}));}
      else if(e.t==='circle'){const C=sk.pts[e.pc];if(!C)return;const c=S(C);mkE('circle',lineAt(e,{cx:c.x,cy:c.y,r:e.r,fill:'none'}));}
      else if(e.t==='arc'){const C=sk.pts[e.pc],P1=sk.pts[e.p1],P2=sk.pts[e.p2];if(!C||!P1||!P2)return;
        const c=S(C),a0=Math.atan2(P1.y-C.y,P1.x-C.x),a1=Math.atan2(P2.y-C.y,P2.x-C.x);let da=a1-a0;while(da<=0)da+=2*Math.PI;
        const x1=c.x+e.r*Math.cos(a0),y1=c.y+e.r*Math.sin(a0),x2=c.x+e.r*Math.cos(a1),y2=c.y+e.r*Math.sin(a1);
        mkE('path',lineAt(e,{d:'M'+x1+','+y1+' A'+e.r+','+e.r+' 0 '+(da>Math.PI?1:0)+' 1 '+x2+','+y2,fill:'none'}));}
      else if(e.t==='text'){const P0=sk.pts[e.p];if(!P0)return;const p=S(P0);
        let val=String(mepSkTextValue(sh,e,editing)||'');if(!val)return;
        if(+e.mw>0){const nmax=Math.max(2,Math.floor(+e.mw/((+e.h||3.5)*0.56)));if(val.length>nmax)val=val.slice(0,nmax-1)+'…';}
        const t=mk('text',{x:p.x,y:p.y,class:(e.st==='val'?'mepTitleVal':'mepTitleText')+(e.col?' mepUc':'')+(sel.has('e:'+e.id)&&editing?' mepSkSelT':''),
          style:'font-size:'+(+e.h||3.5)+'px'+(e.b?';font-weight:700':'')+(e.al&&e.al!=='start'?';text-anchor:'+e.al:'')+(e.col?';fill:'+e.col:'')});
        t.textContent=val;}
      else if(e.t==='logo'){const A=sk.pts[e.p1],B=sk.pts[e.p2];if(!A||!B)return;const a=S(A),b=S(B);
        const x=Math.min(a.x,b.x),y=Math.min(a.y,b.y),w=Math.abs(b.x-a.x),h=Math.abs(b.y-a.y);
        const logo=sh.title&&sh.title.logo;
        if(logo)mk('image',{href:logo,x,y,width:w,height:h,preserveAspectRatio:'xMidYMid meet'});
        if(editing){mk('rect',{x,y,width:w,height:h,class:'mepSkCon'+(sel.has('e:'+e.id)?' mepSkConSel':''),fill:'none','stroke-dasharray':'1.5 1'},mepGHlp);
          if(!logo){const t=mk('text',{x:x+w/2,y:y+h/2+1,class:'mepSkConT','text-anchor':'middle'},mepGHlp);t.textContent='LOGO';}}}
    });
    if(!editing)return;
    mepSkConHits=[]; // une seule esquisse en édition par rendu : ses étiquettes repartent de zéro
    // points, glyphes de contraintes et cotes pilotantes : aide d'édition (jamais exportée)
    const fx=mepSkFixed(sk),z=Math.max(0.6,mepPxMM*3);
    Object.keys(sk.pts).forEach(pid=>{const p=S(sk.pts[pid]),on=sel.has('p:'+pid);
      mk('circle',{cx:p.x,cy:p.y,r:on?z*1.25:z*0.75,class:'mepSkPt'+(on?' mepSkPtSel':'')+(sk.pts[pid].lk?' mepSkPtLk':(fx.has(pid)?' mepSkPtFix':''))},mepGHlp);});
    if(ctx.tb){const o=S({x:0,y:0});mk('path',{d:'M'+(o.x-4)+' '+o.y+'H'+(o.x+4)+'M'+o.x+' '+(o.y-4)+'V'+(o.y+4),class:'mepSkCon'},mepGHlp);}
    const P=id=>sk.pts[id]?S(sk.pts[id]):null;
    const ent=id=>sk.ents.find(x=>x.id===id);
    const fs=Math.max(2.2,mepPxMM*11);
    const glyph=(c,x,y,txt)=>{
      const w=Math.max(fs*0.9,String(txt).length*fs*0.6)+1,h=fs+0.8,on=sel.has('c:'+c.id);
      // une étiquette n'en recouvre jamais une autre : décalée vers le bas jusqu'à une place libre
      for(let k=0;k<8&&mepSkConHits.some(o=>Math.abs(o.x-x)<(o.w+w)/2-0.05&&Math.abs(o.y-y)<(o.h+h)/2-0.05);k++)y+=h+0.2;
      mk('rect',{x:x-w/2,y:y-h/2,width:w,height:h,rx:0.8,class:'mepSkConBg'+(on?' mepSkConSel':'')},mepGHlp);
      const t=mk('text',{x,y:y+fs*0.36,class:'mepSkConT','text-anchor':'middle',style:'font-size:'+fs.toFixed(2)+'px'},mepGHlp);t.textContent=txt;
      mepSkConHits.push({id:c.id,x,y,w,h});
    };
    const midOfLine=(L,off)=>{const a=P(L.p1),b=P(L.p2);if(!a||!b)return null;const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1;
      return{x:(a.x+b.x)/2-dy/l*off,y:(a.y+b.y)/2+dx/l*off};};
    const lineOf=(a,b)=>sk.ents.find(e=>e.t==='line'&&((e.p1===a&&e.p2===b)||(e.p1===b&&e.p2===a)));
    const fmt=v=>mepFmtNum(Math.abs(v),2);
    const cnt={};
    const txtPt=new Map();sk.ents.forEach(e=>{if(e.t==='text')txtPt.set(e.p,e.id);});
    const vis=mepSkVis(),DIMS=new Set(['dist','distX','distY','distPL','radius','angle']);
    const touched=c=>sel.has('c:'+c.id)||[c.a,c.b,c.p].some(id=>id&&sel.has('p:'+id))||[c.a,c.b,c.ent].some(id=>id&&sel.has('e:'+id))
      ||sk.ents.some(e=>sel.has('e:'+e.id)&&e.t==='line'&&[c.a,c.b,c.p].some(id=>id===e.p1||id===e.p2));
    sk.cons.forEach(c=>{
      if(!vis[DIMS.has(c.type)?'dims':'cons']&&!touched(c))return; // masquée (l'élément sélectionné garde les siennes)
      const tp=[c.a,c.b,c.p].find(id=>id&&txtPt.has(id));
      if(tp&&!vis.txt&&!sel.has('e:'+txtPt.get(tp))&&!sel.has('p:'+tp)&&!sel.has('c:'+c.id))return; // placement d'un texte : affiché à sa sélection (ou option « Textes »)
      const k=(c.a||c.p||'')+'|'+(c.b||c.ent||'');const n=cnt[k]=(cnt[k]||0)+1;const sh2=(n-1)*fs*1.1;
      try{
        if(c.type==='horizontal'||c.type==='vertical'){
          const L=lineOf(c.a,c.b),m=L?midOfLine(L,fs*1.1+sh2):(()=>{const a=P(c.a),b=P(c.b);return a&&b?{x:(a.x+b.x)/2+fs,y:(a.y+b.y)/2-fs}:null;})();
          if(m)glyph(c,m.x,m.y,c.type==='horizontal'?'H':'V');
        }else if(c.type==='parallel'||c.type==='perp'||c.type==='equal'||c.type==='tangent'){
          const B=ent(c.b);const m=B&&B.t==='line'?midOfLine(B,-(fs*1.1+sh2)):null;
          const t={parallel:'∥',perp:'⊥',equal:'=',tangent:'T'}[c.type];
          if(m)glyph(c,m.x,m.y,t);
          if(c.type==='equal'){const A=ent(c.a);const m2=A&&A.t==='line'?midOfLine(A,-(fs*1.1)):null;if(m2)glyph(c,m2.x,m2.y,'=');}
        }else if(c.type==='eqR'){const A=ent(c.b),C=A&&P(A.pc);if(C)glyph(c,C.x+A.r*0.7,C.y-A.r*0.7,'=');}
        else if(c.type==='midpoint'){const p=P(c.p);if(p)glyph(c,p.x+fs,p.y+fs,'M');}
        else if(c.type==='fix'){const p=P(c.p);if(p)glyph(c,p.x-fs*0.9,p.y+fs*1.1,'⚓');}
        else if(c.type==='dist'||c.type==='distX'||c.type==='distY'){
          const a=P(c.a),b=P(c.b);if(!a||!b)return;
          // ligne de cote au niveau de l'élément coté (b), rappel pointillé depuis la référence (a) :
          // deux points cotés à la même abscisse sur deux rangées n'ont plus leurs cotes superposées
          let x1=a.x,y1=a.y,x2=b.x,y2=b.y;
          if(c.type==='distX'){y1=b.y;}else if(c.type==='distY'){x1=b.x;}
          mk('line',{x1,y1,x2,y2,class:'mepSkDimL'},mepGHlp);
          if(c.type!=='dist'&&(Math.abs(x1-a.x)>1e-6||Math.abs(y1-a.y)>1e-6))mk('line',{x1:a.x,y1:a.y,x2:x1,y2:y1,class:'mepSkDimL','stroke-dasharray':'0.8 0.8'},mepGHlp);
          // étiquette contre l'élément coté (extrémité b) : les cotes cumulées depuis un même point ne s'empilent pas
          const lw=String(fmt(c.val)).length*fs*0.3+fs*0.6;
          if(c.type==='distX')glyph(c,x2-Math.sign(x2-x1||1)*lw,y2-fs*0.9+sh2,fmt(c.val));
          else if(c.type==='distY')glyph(c,x2+lw+sh2,y2-Math.sign(y2-y1||1)*fs*0.9,fmt(c.val));
          else glyph(c,(x1+x2)/2,(y1+y2)/2-fs*0.9+sh2,fmt(c.val));
        }else if(c.type==='distPL'){
          const p=P(c.p),L=ent(c.ent);if(!p||!L)return;const a=P(L.p1),b=P(L.p2);if(!a||!b)return;
          const dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy||1,t=((p.x-a.x)*dx+(p.y-a.y)*dy)/l2,q={x:a.x+dx*t,y:a.y+dy*t};
          mk('line',{x1:p.x,y1:p.y,x2:q.x,y2:q.y,class:'mepSkDimL'},mepGHlp);
          glyph(c,(p.x+q.x)/2+fs*1.2,(p.y+q.y)/2,fmt(c.val));
        }else if(c.type==='radius'){const A=ent(c.a),C=A&&P(A.pc);if(C)glyph(c,C.x+A.r*0.71,C.y-A.r*0.71,'R'+fmt(c.val));}
        else if(c.type==='angle'){const B=ent(c.b);const m=B?midOfLine(B,fs*1.5):null;if(m)glyph(c,m.x,m.y,fmt(c.val*180/Math.PI)+'°');}
      }catch(e){}
    });
  }
  /* ── sélection au cadre (V0.3.12) ─────────────────────────────────────────────
     gauche → droite : FENÊTRE (cadre bleu plein) — seuls les éléments entièrement dedans ;
     droite → gauche : CAPTURE (cadre vert pointillé) — tout ce qui touche ou traverse le cadre.
     Planche : éléments d'esquisse + vues + cotes (lot) ; cartouche en édition : son esquisse. */
  function mepBoxRect(pk){return{x0:Math.min(pk.sx,pk.cur.x),x1:Math.max(pk.sx,pk.cur.x),y0:Math.min(pk.sy,pk.cur.y),y1:Math.max(pk.sy,pk.cur.y),cross:pk.cur.x<pk.sx};}
  function mepBoxHitPoly(B,pts,closed){
    // polyligne (mm planche) → 'in' (entièrement dans le cadre), 'touch' (en partie), null
    if(!pts||!pts.length)return null;
    const inside=p=>p.x>=B.x0&&p.x<=B.x1&&p.y>=B.y0&&p.y<=B.y1;
    const ins=pts.map(inside);
    if(ins.every(Boolean))return'in';
    if(ins.some(Boolean))return'touch';
    const o=(p,q,r)=>Math.sign((q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x));
    const segX=(a,b,c,d)=>o(a,b,c)!==o(a,b,d)&&o(c,d,a)!==o(c,d,b);
    const E=[[{x:B.x0,y:B.y0},{x:B.x1,y:B.y0}],[{x:B.x1,y:B.y0},{x:B.x1,y:B.y1}],[{x:B.x1,y:B.y1},{x:B.x0,y:B.y1}],[{x:B.x0,y:B.y1},{x:B.x0,y:B.y0}]];
    const n=pts.length-(closed?0:1);
    for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%pts.length];if(E.some(([c,d])=>segX(a,b,c,d)))return'touch';}
    return null;
  }
  function mepSkEntPoly(sh,ctx,e){
    const sk=ctx.sk,S=p=>mepSkS(ctx,p);
    if(e.t==='line'){const A=sk.pts[e.p1],B=sk.pts[e.p2];return A&&B?{pts:[S(A),S(B)]}:null;}
    if(e.t==='circle'||e.t==='arc'){
      const C=sk.pts[e.pc];if(!C)return null;const c=S(C);let a0=0,a1=2*Math.PI;
      if(e.t==='arc'){const P1=sk.pts[e.p1],P2=sk.pts[e.p2];if(!P1||!P2)return null;
        a0=Math.atan2(P1.y-C.y,P1.x-C.x);a1=Math.atan2(P2.y-C.y,P2.x-C.x);while(a1<=a0)a1+=2*Math.PI;}
      const n=e.t==='arc'?24:48,pts=[];
      for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;pts.push({x:c.x+e.r*Math.cos(a),y:c.y+e.r*Math.sin(a)});}
      return{pts,closed:e.t==='circle'};
    }
    if(e.t==='text'){
      const P0=sk.pts[e.p];if(!P0)return null;const p=S(P0),h=+e.h||3.5;
      let w=Math.max(h,String(mepSkTextValue(sh,e,true)).length*h*0.56);if(+e.mw>0)w=Math.min(w,+e.mw);
      const x0=e.al==='middle'?p.x-w/2:(e.al==='end'?p.x-w:p.x);
      return{pts:[{x:x0,y:p.y-h*0.75},{x:x0+w,y:p.y-h*0.75},{x:x0+w,y:p.y},{x:x0,y:p.y}],closed:true};
    }
    if(e.t==='logo'){const A=sk.pts[e.p1],B=sk.pts[e.p2];if(!A||!B)return null;const a=S(A),b=S(B);
      return{pts:[a,{x:b.x,y:a.y},b,{x:a.x,y:b.y}],closed:true};}
    return null;
  }
  function mepViewBoxHit(v,B){
    // fenêtre : boîte de la vue dans le cadre ; capture : un trait de la vue touche le cadre
    const b=mepViewSheetBBox(v);if(!b)return null;
    if(b.x>=B.x0&&b.x+b.w<=B.x1&&b.y>=B.y0&&b.y+b.h<=B.y1)return'in';
    if(!B.cross)return null;
    if(b.x>B.x1||b.x+b.w<B.x0||b.y>B.y1||b.y+b.h<B.y0)return null;
    const g=mepGeoOf(v);
    for(const e of g.els){
      let pts=null;
      if(e.t==='L')pts=[mepToSheet(v,e.x1,e.y1),mepToSheet(v,e.x2,e.y2)];
      else if(e.t==='C'||e.t==='A'){const a0=e.t==='A'?e.a0:0,a1=e.t==='A'?e.a1:2*Math.PI;pts=[];
        for(let i=0;i<=16;i++){const a=a0+(a1-a0)*i/16;pts.push(mepToSheet(v,e.cx+e.r*Math.cos(a),e.cy+e.r*Math.sin(a)));}}
      if(pts&&mepBoxHitPoly(B,pts,false))return'touch';
    }
    return null;
  }
  function mepBoxSelect(sh,pk,add){
    const B=mepBoxRect(pk),want=r=>B.cross?(r==='in'||r==='touch'):r==='in';
    if(!add){mepSt.skSel=new Set();mepSt.lot=null;mepSt.sel=null;mepSt.selDim=null;mepSt.selAxis=null;mepSt.entSel=[];}
    const ctx=mepSkCtx(sh,false),sk=ctx.sk;let n=0;
    if(sk){
      const used=new Set(['o']);
      sk.ents.forEach(e=>{
        ['p1','p2','pc','p'].forEach(k=>{if(e[k])used.add(e[k]);});
        const g=mepSkEntPoly(sh,ctx,e);
        if(g&&want(mepBoxHitPoly(B,g.pts,g.closed))&&!mepSt.skSel.has('e:'+e.id)){mepSt.skSel.add('e:'+e.id);n++;}
      });
      // points isolés (outil Point) : pris s'ils sont dans le cadre
      Object.keys(sk.pts).forEach(pid=>{if(used.has(pid))return;const p=mepSkS(ctx,sk.pts[pid]);
        if(p.x>=B.x0&&p.x<=B.x1&&p.y>=B.y0&&p.y<=B.y1&&!mepSt.skSel.has('p:'+pid)){mepSt.skSel.add('p:'+pid);n++;}});
    }
    if(!mepSt.tbEdit){
      const lot=mepSt.lot||{views:new Set(),dims:new Set()};
      sh.views.forEach(v=>{if(!lot.views.has(v.id)&&want(mepViewBoxHit(v,B))){lot.views.add(v.id);n++;}});
      sh.dims.forEach(d=>{
        if(lot.dims.has(d.id))return;
        const rs=(mepDimHits.get(d)||[]).map(q=>mepBoxHitPoly(B,[{x:q.x1,y:q.y1},{x:q.x2,y:q.y2}],false));
        let tp=null;try{tp=mepDimTextPos(sh,d);}catch(e){}
        const tin=!!tp&&tp.x>=B.x0&&tp.x<=B.x1&&tp.y>=B.y0&&tp.y<=B.y1;
        const all=rs.length>0&&rs.every(x=>x==='in')&&(!tp||tin),any=rs.some(x=>!!x)||tin;
        if(B.cross?any:all){lot.dims.add(d.id);n++;}
      });
      mepSt.lot=(lot.views.size||lot.dims.size)?lot:null;
    }
    return n;
  }
  function mepSkDelRaw(sk){
    [...mepSt.skSel].forEach(k=>{const id=k.slice(2);
      if(k[0]==='c')sk.cons=sk.cons.filter(c=>c.id!==id);
      else if(k[0]==='e')mepSkRmEnt(sk,id);
      else if(k[0]==='p'&&id!=='o'&&sk.pts[id]){
        sk.ents.filter(e=>['p1','p2','pc','p'].some(q=>e[q]===id)).forEach(e=>mepSkRmEnt(sk,e.id));
        delete sk.pts[id];mepSkCleanCons(sk);
      }});
    mepSt.skSel=new Set();
    mepSkSolve(sk,40);
  }
  function mepDeleteLot(sh){
    // suppression groupée (un seul pas d'annulation) : vues (+ filles, + leurs cotes), cotes, esquisse
    const lot=mepSt.lot,ctx=mepSkCtx(sh,false),sk=ctx.sk;
    const nv=lot?lot.views.size:0,nd=lot?lot.dims.size:0,ns=mepSt.skSel?mepSt.skSel.size:0;
    mepEdit('suppression de la sélection',()=>{
      if(lot){
        const gone=new Set(lot.views);let grew=true;
        while(grew){grew=false;sh.views.forEach(v=>{if(v.parent&&gone.has(v.parent)&&!gone.has(v.id)){gone.add(v.id);grew=true;}});}
        sh.views=sh.views.filter(v=>!gone.has(v.id));
        sh.dims=sh.dims.filter(d=>!lot.dims.has(d.id)&&!gone.has(d.vid)&&!gone.has(d.vid2));
      }
      if(sk&&ns)mepSkDelRaw(sk);
    });
    mepSt.lot=null;mepSt.sel=null;mepSt.selDim=null;mepSt.skSel=new Set();
    mepStatus('Supprimé : '+[nv?nv+' vue(s)':'',nd?nd+' cote(s)':'',ns?ns+' élément(s) d’esquisse':''].filter(Boolean).join(', ')+'.');
    mepSideShow();mepRender();
  }
  /* 2026-10-22-013 : ALIGNER des cotes sur une cote de référence (« un outil pour aligner les
     cotes sélectionnées à une cote de référence ») — chaque cote linéaire (longueur, distance)
     PARALLÈLE à la référence prend un décalage qui pose sa ligne de cote sur la ligne de la
     référence (en papier : marche aussi entre vues alignées). Les autres sont ignorées. */
  function mepDimAlignTo(sh,ref,ids){
    const gr=mepDimLine(sh,ref);if(!gr)return{n:0,skip:ids.length};
    let n=0,skip=0;
    ids.forEach(id=>{
      const d=sh.dims.find(x=>x.id===id);if(!d||d===ref)return;
      const gd=mepDimLine(sh,d),w=mepDimWorld(sh,d);
      if(!gd||!w||Math.abs(gr.ux*gd.uy-gr.uy*gd.ux)>0.02){skip++;return;}
      d.off=mepDimOffsetFromPts(w.a.x,w.a.y,w.b.x,w.b.y,d.orient||'a',gr.a1);
      n++;
    });
    return{n,skip};
  }
  function mepDimAlignStart(ids){
    if(!ids||!ids.length)return;
    mepSt.alignDims=ids.slice();
    mepStatus('Aligner '+ids.length+' cote(s) : cliquez la cote de RÉFÉRENCE (Échap pour annuler).');
  }
  function mepSideLot(root,sh){
    const K=mepPanelKit(root),lot=mepSt.lot||{views:new Set(),dims:new Set()},ns=mepSt.skSel?mepSt.skSel.size:0;
    K.h('Sélection');
    K.note([lot.views.size?lot.views.size+' vue(s)':'',lot.dims.size?lot.dims.size+' cote(s)':'',ns?ns+' élément(s) d’esquisse':''].filter(Boolean).join(' · ')||'—');
    const r=K.rowEl();
    K.btn(r,'Supprimer',()=>mepDeleteLot(sh),'Supprimer toute la sélection (Suppr)','danger');
    K.btn(r,'Désélectionner',()=>{mepSt.lot=null;mepSt.skSel=new Set();mepSideShow();mepRender();},'Échap');
    if(lot.dims.size){
      const r2=K.rowEl();
      K.btn(r2,'Aligner sur une cote…',()=>mepDimAlignStart([...lot.dims]),'Pose la ligne de chaque cote sélectionnée (parallèle) sur celle d’une cote de référence : cliquez-la ensuite');
    }
    K.note('Cadre de gauche à droite : éléments entièrement dedans. De droite à gauche : tout ce qui touche le cadre. Maj : ajouter. Maj/Ctrl + clic sur une cote : l’ajoute ou la retire.');
  }
  /* ═══════════════ commandes de vues interactives (V0.3.13) ═══════════════
     Projection, Coupe, Détail, Auxiliaire : un état mepSt.vcmd intercepte la souris.
       projection : vue mère → le curseur choisit le sens (1er angle) ; diagonale = ISO ; enchaînable.
       coupe      : 2 points sur la vue (accrochage + H/V) → la vue suit la souris, le côté choisit le regard.
       détail     : centre → rayon → placement libre.
       auxiliaire : clic sur une arête inclinée → vue perpendiculaire à l'arête, côté = curseur.
     Coupe et auxiliaire sont ALIGNÉES sur la mère (base tournée comme une projection) : glisser contraint. */
  function mepPaperBasis(par,t,np,s){
    // base d'une vue projetée perpendiculairement à la direction papier t de la mère, placée du côté s·np :
    // u' = tx·E + s·npx·Pd, v' = ty·E + s·npy·Pd (E = t dans le monde, Pd = regard de la mère), dir' = v'×u'
    const b=mepBasisOf(par);
    const E=mepNorm([b.u[0]*t.x+b.v[0]*t.y,b.u[1]*t.x+b.v[1]*t.y,b.u[2]*t.x+b.v[2]*t.y]);
    const Pd=mepNorm(b.dir);
    const u=mepNorm([t.x*E[0]+s*np.x*Pd[0],t.x*E[1]+s*np.x*Pd[1],t.x*E[2]+s*np.x*Pd[2]]);
    const v=mepNorm([t.y*E[0]+s*np.y*Pd[0],t.y*E[1]+s*np.y*Pd[1],t.y*E[2]+s*np.y*Pd[2]]);
    const dir=mepNorm(mepCross(v,u));
    return{dir,u,v,E};
  }
  function mepModelBoxIn(B,scale,bodyId){
    // boîte englobante des corps (monde) projetée sur la base (u,v) : taille et centre locaux × échelle
    try{
      const bb=new THREE.Box3();
      (typeof bodies!=='undefined'&&bodies||[]).forEach(bd=>{if(bd&&bd.mesh&&bd.kind==='body'&&bd.mesh.visible!==false&&(!bodyId||bd.bodyId===bodyId))bb.expandByObject(bd.mesh);});
      if(bb.isEmpty())return null;
      let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
      for(let i=0;i<8;i++){const p=[i&1?bb.max.x:bb.min.x,i&2?bb.max.y:bb.min.y,i&4?bb.max.z:bb.min.z];
        const a=mepDot(p,B.u),b=mepDot(p,B.v);x0=Math.min(x0,a);x1=Math.max(x1,a);y0=Math.min(y0,b);y1=Math.max(y1,b);}
      return{w:(x1-x0)*scale,h:(y1-y0)*scale};
    }catch(e){return null;}
  }
  function mepParBBC(par){const bb=mepViewSheetBBox(par);return bb?{x:bb.x+bb.w/2,y:bb.y+bb.h/2,w:bb.w,h:bb.h}:{x:par.x,y:par.y,w:40,h:40};}
  function mepViewCenterAt(view,at){
    // place la vue pour que le centre de sa géométrie tombe sur « at » (axes verrouillés éventuels)
    const b=mepAABBOf(mepGeoOf(view));
    const cx=b?(b.minx+b.maxx)/2:0,cy=b?(b.miny+b.maxy)/2:0;
    view.x=at.lockX!=null?at.lockX:at.x-cx*view.scale;
    view.y=at.lockY!=null?at.lockY:at.y-cy*view.scale;
  }
  function mepVcmdStart(kind){
    const sh=mepSheet();
    mepSetTool('select');
    const par=mepSt.sel?mepView(sh,mepSt.sel):null;
    mepSt.vcmd={kind,stage:0,par:par&&(kind!=='detail'||true)?par.id:null,cur:null};
    if(kind==='proj'&&par)mepSt.vcmd.stage=1;
    mepVcmdHint();mepRender();
  }
  function mepVcmdHint(){
    const c=mepSt.vcmd;if(!c)return;
    const m={
      proj:['Projection : cliquez la vue mère.','Projection : déplacez la souris autour de la vue (droite/gauche/dessus/dessous, diagonale = ISO) et cliquez. Échap termine.'],
      section:['Coupe : cliquez le 1er point de la ligne de coupe sur une vue.','Coupe : cliquez le point suivant (Maj = sans alignement H/V) — ✓ / Entrée valide la ligne, ↶ / Retour arrière enlève le dernier point.','Coupe : placez la vue — le côté de la souris donne le sens du regard. Échap annule.'],
      detail:['Détail : cliquez le centre de la zone à agrandir.','Détail : cliquez pour fixer le rayon.','Détail : placez la vue de détail.'],
      aux:['Auxiliaire : cliquez une arête inclinée d’une vue.','Auxiliaire : placez la vue de part ou d’autre de l’arête. Échap annule.']
    };
    mepStatus((m[c.kind]||[])[c.stage]||'');
  }
  function mepVcmdCancel(){if(!mepSt.vcmd)return false;mepSt.vcmd=null;mepSt.hovEnt=null;mepStatus('Commande annulée.');mepRender();return true;}
  function mepVcmdProjWhich(par,P){
    const c=mepParBBC(par),dx=P.x-c.x,dy=P.y-c.y,ax=Math.abs(dx)-c.w/2,ay=Math.abs(dy)-c.h/2;
    if(ax<4&&ay<4)return null;
    if(ax>4&&ay>4&&Math.min(ax,ay)>0.35*Math.max(ax,ay))return'iso';
    if(ax>ay)return dx>0?'left':'right'; // 1er angle : vue de gauche posée à droite
    return dy>0?'top':'bottom';           // vue de dessus posée dessous
  }
  function mepVcmdGeom(sh,P,shift){
    // état courant de la commande pour le point P (planche) : position, sens, aperçu
    const c=mepSt.vcmd,par=c.par?mepView(sh,c.par):null;
    if(c.kind==='proj'&&par){
      const w=mepVcmdProjWhich(par,P),bc=mepParBBC(par);
      if(!w)return null;
      if(w==='iso'){const ib=mepModelBoxIn(mepBasisFromDir(MEP_VIEWS.iso.dir),par.scale,par.bodyId)||{w:bc.w,h:bc.h};
        return{which:w,at:{x:P.x,y:P.y},box:{x:P.x,y:P.y,w:ib.w,h:ib.h}};}
      const lr=w==='left'||w==='right';
      const at=lr?{x:P.x,y:bc.y}:{x:bc.x,y:P.y};
      const pb=mepBasisOf(par),def=MEP_PROJ[w],du=mepNorm(def.u(pb)),dd=mepNorm(def.dir(pb));
      const gb=mepModelBoxIn({u:du,v:mepNorm(mepCross(du,dd))},par.scale,par.bodyId)||{w:bc.w,h:bc.h};
      return{which:w,at,lock:lr?{lockY:par.y}:{lockX:par.x},box:{x:at.x,y:at.y,w:gb.w,h:gb.h}};
    }
    if(c.kind==='section'&&par&&c.A){
      const pts=(c.pts||[c.A]).map(q=>mepToSheet(par,q.x,q.y));
      if(c.stage===1){
        // 2026-10-22-013 : ligne brisée — chaque point après le 2ᵉ part à l'équerre
        // du tronçon précédent ; les tronçons de coupe avancent dans le sens du 1er.
        const s=mepSnapPt(P.x,P.y,sh);let B={x:s.x,y:s.y};
        const A=pts[0],Lp=pts[pts.length-1];
        let ok=true;
        if(pts.length===1){
          // 2ᵉ point : alignement H/V automatique à ±8° (Maj : libre)
          if(!shift){const a=Math.abs(Math.atan2(B.y-A.y,B.x-A.x)*180/Math.PI);
            if(a<8||a>172)B.y=A.y;else if(Math.abs(a-90)<8)B.x=A.x;}
        }else{
          const Q=pts[pts.length-2],dl=Math.hypot(Lp.x-Q.x,Lp.y-Q.y)||1;
          const px=-(Lp.y-Q.y)/dl,py=(Lp.x-Q.x)/dl,k=(B.x-Lp.x)*px+(B.y-Lp.y)*py;
          B={x:Lp.x+px*k,y:Lp.y+py*k};
          if((pts.length-1)%2===0){ // tronçon de coupe : même sens que le 1er
            ok=(B.x-Lp.x)*(pts[1].x-A.x)+(B.y-Lp.y)*(pts[1].y-A.y)>0;
          }
        }
        if(Math.hypot(B.x-Lp.x,B.y-Lp.y)<2)ok=false;
        return{A,B,pts,ok};
      }
      const A=mepToSheet(par,c.A.x,c.A.y),B=mepToSheet(par,c.B.x,c.B.y);
      const L=Math.hypot(B.x-A.x,B.y-A.y)||1,t={x:(B.x-A.x)/L,y:(B.y-A.y)/L},np={x:-t.y,y:t.x};
      const M={x:(A.x+B.x)/2,y:(A.y+B.y)/2},side=((P.x-M.x)*np.x+(P.y-M.y)*np.y)>=0?1:-1;
      const bc=mepParBBC(par),d=(P.x-bc.x)*np.x+(P.y-bc.y)*np.y;
      const at={x:bc.x+np.x*d,y:bc.y+np.y*d};
      const gb=mepModelBoxIn(mepPaperBasis(par,t,np,side),par.scale,par.bodyId)||{w:bc.w,h:bc.h};
      return{A,B,pts,t,np,s:side,at,box:{x:at.x,y:at.y,w:gb.w,h:gb.h}};
    }
    if(c.kind==='detail'&&par&&c.C){
      const C=mepToSheet(par,c.C.x,c.C.y);
      if(c.stage===1)return{C,R:Math.hypot(P.x-C.x,P.y-C.y)};
      return{C,R:c.R*par.scale,at:{x:P.x,y:P.y},rr:c.R*c.scale};
    }
    if(c.kind==='aux'&&par&&c.edge){
      const e=c.edge,A=mepToSheet(par,e.x1,e.y1),B=mepToSheet(par,e.x2,e.y2);
      const L=Math.hypot(B.x-A.x,B.y-A.y)||1,t={x:(B.x-A.x)/L,y:(B.y-A.y)/L},np={x:-t.y,y:t.x};
      const M={x:(A.x+B.x)/2,y:(A.y+B.y)/2},side=((P.x-M.x)*np.x+(P.y-M.y)*np.y)>=0?1:-1;
      const d=(P.x-M.x)*np.x+(P.y-M.y)*np.y,at={x:M.x+np.x*d,y:M.y+np.y*d};
      const gb=mepModelBoxIn(mepPaperBasis(par,t,np,side),par.scale,par.bodyId)||{w:Math.max(L,20),h:20};
      // la vue s'écarte de l'arête : son bord proche ne recouvre pas la mère
      return{A,B,t,np,s:side,at,box:{x:at.x,y:at.y,w:gb.w,h:gb.h}};
    }
    return null;
  }
  function mepVcmdDraw(mk){
    const c=mepSt.vcmd;if(!c||!c.cur)return;
    const sh=mepSheet(),G=mepVcmdGeom(sh,c.cur,c.shift);
    const par=c.par?mepView(sh,c.par):null;
    if(par){const bb=mepViewSheetBBox(par);if(bb)mk('rect',{x:bb.x-4,y:bb.y-4,width:bb.w+8,height:bb.h+8,class:'mepVBSel'},mepGHlp);}
    if(c.kind==='section'&&c.stage<2){ // repère du point accroché (bout d'axe compris)
      const sn=mepSnapPt(c.cur.x,c.cur.y,sh);
      if(sn.hit){const z=mepSt.zoom||1,h=1.8/z;
        mk('rect',{x:sn.x-h,y:sn.y-h,width:2*h,height:2*h,class:'mepVcSnap'+(/^ax/.test(sn.hit.t)?' mepVcSnapAx':'')},mepGHlp);}
    }
    if(!G)return;
    const ghost=b=>mk('rect',{x:b.x-b.w/2,y:b.y-b.h/2,width:b.w,height:b.h,class:'mepVcGhost'},mepGHlp);
    if(G.box)ghost(G.box);
    if(c.kind==='proj'&&G.which){
      const t=mk('text',{x:c.cur.x+4,y:c.cur.y-4,class:'mepVcTxt'},mepGHlp);
      t.textContent={left:'Côté gauche',right:'Côté droit',top:'Dessus',bottom:'Dessous',iso:'ISO'}[G.which];
    }
    if(c.kind==='section'){
      const poly=c.stage===1?G.pts.concat([G.B]):G.pts;
      for(let i=0;i+1<poly.length;i++)mk('line',{x1:poly[i].x,y1:poly[i].y,x2:poly[i+1].x,y2:poly[i+1].y,
        class:'mepVcLine'+(c.stage===1&&i===poly.length-2&&!G.ok?' mepVcBad':'')},mepGHlp);
      if(G.np){[poly[0],poly[poly.length-1]].forEach(Q=>mk('line',{x1:Q.x,y1:Q.y,x2:Q.x+G.np.x*G.s*9,y2:Q.y+G.np.y*G.s*9,class:'mepVcLine','marker-end':'url(#mepArr)'},mepGHlp));}
      if(c.stage===1)mepSecBtnsDraw(mk,G.pts);
    }
    if(c.kind==='detail'){
      mk('circle',{cx:G.C.x,cy:G.C.y,r:Math.max(0.5,G.R),class:'mepVcLine'},mepGHlp);
      if(G.at)mk('circle',{cx:G.at.x,cy:G.at.y,r:G.rr,class:'mepVcGhost'},mepGHlp);
    }
    if(c.kind==='aux'){
      mk('line',{x1:G.A.x,y1:G.A.y,x2:G.B.x,y2:G.B.y,class:'mepVcLine'},mepGHlp);
      const M={x:(G.A.x+G.B.x)/2,y:(G.A.y+G.B.y)/2};
      mk('line',{x1:M.x,y1:M.y,x2:M.x+G.np.x*G.s*12,y2:M.y+G.np.y*G.s*12,class:'mepVcLine','marker-end':'url(#mepArr)'},mepGHlp);
    }
  }
  function mepVcmdMove(sh,P,ev){
    const c=mepSt.vcmd;c.cur={x:P.x,y:P.y};c.shift=!!(ev&&ev.shiftKey);
    if(c.kind==='aux'&&c.stage===0){
      const hit=mepHitViewEnt(sh,P.x,P.y);
      mepSt.hovEnt=hit&&hit.e.t==='L'?{vid:hit.vid,i:hit.i,sig:mepEntSig(hit.e)}:null;
    }
    mepRender();
  }
  /* 2026-10-22-013 : icônes ↶ (dernier point) et ✓ (valider) de la ligne de coupe,
     dessinées près du dernier point, à taille écran constante */
  function mepSecBtnRects(pts){
    const c=mepSt.vcmd;
    if(!c||c.kind!=='section'||c.stage!==1||!pts||!pts.length)return[];
    const z=mepSt.zoom||1,w=7/z,g=1.5/z,L=pts[pts.length-1];
    const x0=L.x+4/z,y0=L.y-4/z-w;
    const out=[{act:'undo',x:x0,y:y0,w,h:w,lab:'↶',tip:'Enlever le dernier point (Retour arrière)'}];
    if(pts.length>=2&&pts.length%2===0)out.push({act:'ok',x:x0+w+g,y:y0,w,h:w,lab:'✓',tip:'Valider la ligne de coupe (Entrée)'});
    return out;
  }
  function mepSecBtnsDraw(mk,pts){
    const z=mepSt.zoom||1;
    mepSecBtnRects(pts).forEach(b=>{
      const r=mk('rect',{x:b.x,y:b.y,width:b.w,height:b.h,rx:1.2/z,class:'mepSecBtn'+(b.act==='ok'?' mepSecBtnOk':'')},mepGHlp);
      const tt=document.createElementNS(NS,'title');tt.textContent=b.tip;r.appendChild(tt);
      const t=mk('text',{x:b.x+b.w/2,y:b.y+b.h*0.74,'text-anchor':'middle','font-size':b.h*0.75,class:'mepSecBtnTxt'},mepGHlp);
      t.textContent=b.lab;
    });
  }
  function mepSecBtnAt(P){
    const c=mepSt.vcmd;if(!c||c.kind!=='section'||c.stage!==1)return null;
    const par=c.par?mepView(mepSheet(),c.par):null;if(!par)return null;
    const pts=(c.pts||[]).map(q=>mepToSheet(par,q.x,q.y));
    const b=mepSecBtnRects(pts).find(r=>P.x>=r.x&&P.x<=r.x+r.w&&P.y>=r.y&&P.y<=r.y+r.h);
    return b?b.act:null;
  }
  function mepSecUndo(){
    const c=mepSt.vcmd;if(!c||c.kind!=='section'||c.stage!==1)return false;
    if(c.pts&&c.pts.length>1){c.pts.pop();mepStatus('Coupe : dernier point enlevé ('+c.pts.length+' restant'+(c.pts.length>1?'s':'')+').');}
    else{c.pts=[];c.A=null;c.stage=0;mepVcmdHint();}
    mepRender();return true;
  }
  function mepSecValidate(){
    const c=mepSt.vcmd;if(!c||c.kind!=='section'||c.stage!==1)return false;
    if(!c.pts||c.pts.length<2){mepStatus('Coupe : il faut au moins 2 points.');return true;}
    // une ligne brisée finit sur un tronçon de coupe (parallèle au 1er) : flèches à l'équerre
    if(c.pts.length%2){mepStatus('Coupe : la ligne doit finir par un tronçon parallèle au 1er — ajoutez un point (ou ↶).');return true;}
    c.A=c.pts[0];c.B=c.pts[1];c.stage=2;mepVcmdHint();mepRender();return true;
  }
  function mepVcmdDown(sh,P,ev){
    const c=mepSt.vcmd;c.cur={x:P.x,y:P.y};
    const parOf=()=>c.par?mepView(sh,c.par):null;
    if(c.kind==='proj'){
      if(c.stage===0){const v=mepViewAt(sh,P.x,P.y);if(!v){mepStatus('Projection : cliquez sur une vue.');return;}
        c.par=v.id;c.stage=1;mepSt.sel=v.id;mepVcmdHint();mepRender();return;}
      const par=parOf(),G=par&&mepVcmdGeom(sh,P);
      if(!G){mepStatus('Projection : éloignez la souris de la vue mère pour choisir le sens.');return;}
      let nv=null;
      if(G.which==='iso'){nv=mepAddView({kind:'base',vk:'iso',bodyId:par.bodyId,label:'',scale:par.scale,_keepScale:1,_at:G.at,
        mode:par.mode,tangent:par.tangent,hlrExact:par.hlrExact!==false});}
      else nv=mepAddProjected(par,G.which,Object.assign({},G.at,G.lock));
      mepSt.sel=par.id; // on reste sur la mère : projections enchaînées
      mepVcmdHint();mepRender();
      if(nv)mepStatus('Vue « '+(nv.label||'ISO')+' » posée — autre projection, ou Échap.');
      return;
    }
    if(c.kind==='section'){
      if(c.stage===0){
        // 2026-10-22-013 : un trait d'axe qui dépasse de la vue s'accroche aussi —
        // le point accroché désigne alors sa vue, même hors de son cadre
        const s=mepSnapPt(P.x,P.y,sh);
        const v=mepViewAt(sh,P.x,P.y)||(s.hit&&s.hit.vid?mepView(sh,s.hit.vid):null);
        if(!v){mepStatus('Coupe : cliquez sur une vue (ou un trait d’axe).');return;}
        if(v.kind==='detail'){mepStatus('Coupe : choisissez une vue complète (pas un détail).');return;}
        c.par=v.id;c.A=mepFromSheet(v,s.x,s.y);c.pts=[c.A];c.stage=1;mepVcmdHint();mepRender();return;
      }
      const par=parOf();if(!par)return mepVcmdCancel();
      if(c.stage===1){
        const btn=mepSecBtnAt(P);
        if(btn==='undo'){mepSecUndo();return;}
        if(btn==='ok'){mepSecValidate();return;}
        const G=mepVcmdGeom(sh,P,ev.shiftKey);
        if(!G.ok){mepStatus(G.pts.length>1&&(G.pts.length-1)%2===0
          ?'Coupe : le tronçon doit avancer dans le sens du 1er.':'Coupe : tronçon trop court.');return;}
        c.pts.push(mepFromSheet(par,G.B.x,G.B.y));
        mepStatus('Coupe : '+c.pts.length+' points — point suivant (à l’équerre), ✓ / Entrée valide, ↶ / Retour arrière.');
        mepRender();return;
      }
      const G=mepVcmdGeom(sh,P);
      mepSt.vcmd=null;
      mepSectionFromPicks(par,c.A,c.B,{s:G.s,at:G.at,pts:c.pts});
      return;
    }
    if(c.kind==='detail'){
      if(c.stage===0){
        const v=mepViewAt(sh,P.x,P.y);if(!v){mepStatus('Détail : cliquez dans une vue.');return;}
        c.par=v.id;c.C=mepFromSheet(v,P.x,P.y);c.stage=1;mepVcmdHint();mepRender();return;
      }
      const par=parOf();if(!par)return mepVcmdCancel();
      if(c.stage===1){
        const G=mepVcmdGeom(sh,P),R=G.R/par.scale;
        if(R<0.5){mepStatus('Détail : rayon trop petit.');return;}
        c.R=R;
        // échelle : ×2 la mère au minimum, et un diamètre d'environ 70 mm sur la planche
        const want=Math.max(par.scale*2,Math.min(par.scale*10,35/R));
        const S=MEP_SCALES.map(x=>x[0]).concat([10]).sort((a,b)=>a-b);
        c.scale=S.find(x=>x>=want-1e-9)||S[S.length-1];
        c.stage=2;mepVcmdHint();mepRender();return;
      }
      mepSt.vcmd=null;
      mepDetailFromPicks(par,c.C,c.R,{at:{x:P.x,y:P.y},scale:c.scale});
      return;
    }
    if(c.kind==='aux'){
      if(c.stage===0){
        const hit=mepHitViewEnt(sh,P.x,P.y);
        if(!hit||hit.e.t!=='L'){mepStatus('Auxiliaire : cliquez une ARÊTE droite (inclinée) d’une vue.');return;}
        const v=mepView(sh,hit.vid);
        c.par=v.id;c.edge={x1:hit.e.x1,y1:hit.e.y1,x2:hit.e.x2,y2:hit.e.y2};c.stage=1;mepSt.hovEnt=null;mepVcmdHint();mepRender();return;
      }
      const par=parOf();if(!par)return mepVcmdCancel();
      const G=mepVcmdGeom(sh,P);
      mepSt.vcmd=null;
      mepAddAuxFromEdge(par,c.edge,G.s,G.at);
      return;
    }
  }
  function mepAddAuxFromEdge(par,e,s,at){
    const L=Math.hypot(e.x2-e.x1,e.y2-e.y1)||1,t={x:(e.x2-e.x1)/L,y:(e.y2-e.y1)/L},np={x:-t.y,y:t.x};
    const B=mepPaperBasis(par,t,np,s);
    const v=mepAddView({kind:'aux',vk:'',dir:B.dir,u:B.u,v:B.v,parent:par.id,label:mepNextLabel(mepSheet()),
      bodyId:par.bodyId,mode:par.mode,tangent:par.tangent,hlrExact:par.hlrExact!==false,scale:par.scale,_keepScale:1,_at:at,
      align:{x:np.x*s,y:np.y*s},auxEdge:{a:[e.x1,e.y1],b:[e.x2,e.y2],s,pid:par.id},
      autoAxes:!!par.autoAxes,autoPitch:!!par.autoPitch});
    mepStatus('Vue auxiliaire « '+v.label+' » posée, perpendiculaire à l’arête — glisser contraint sur sa ligne de rappel.');
    return v;
  }
  function mepDrawSk(mk,sh){
    try{mepSkLinksRefresh(sh);}catch(e){}
    if(sh.sk)mepDrawSkCtx(mk,sh,{sk:sh.sk,ox:0,oy:0,tb:false},'sheet');
  }
  /* ── cartouche : modèle Standard → esquisse (point de départ de l'édition) ── */
  function mepTbFromStd(sh){
    const d=mepPageDim(sh),tt=sh.title||{};
    const W=d.iw,H=TITLE_H,H2=H/2,LW=tt.logo?32:0,pw=Math.min(130,(W-LW)*0.4);
    const sk=mepSkNew();sk.pts.o={x:0,y:0};
    const pt=(x,y)=>mepSkPt(sk,x,y),ln=(a,b,w)=>mepSkEnt(sk,{t:'line',p1:a,p2:b,w}),C=c=>mepSkCons(sk,c);
    const TL=pt(-W,-H),TR=pt(0,-H),BL=pt(-W,0);
    const top=ln(TL,TR,'thick'),right=ln(TR,'o','thick'),bot=ln(BL,'o','thick'),left=ln(TL,BL,'thick');
    C({type:'horizontal',a:TL,b:TR});C({type:'horizontal',a:BL,b:'o'});C({type:'vertical',a:TL,b:BL});C({type:'vertical',a:TR,b:'o'});
    C({type:'distX',a:BL,b:'o',val:W});C({type:'distY',a:TR,b:'o',val:H});
    // ligne médiane : du bord gauche (ou du trait du logo) au bord droit
    const M2=pt(0,-H2);C({type:'onLine',p:M2,ent:right.id});C({type:'distY',a:TR,b:M2,val:H2});
    let rowL,mid;
    if(LW){
      const a=pt(-W+LW,-H),b=pt(-W+LW,0),lg=ln(a,b);
      C({type:'onLine',p:a,ent:top.id});C({type:'onLine',p:b,ent:bot.id});C({type:'vertical',a,b});C({type:'distX',a:TL,b:a,val:LW});
      const m=pt(-W+LW,-H2);C({type:'onLine',p:m,ent:lg.id});
      mid=ln(m,M2);C({type:'horizontal',a:m,b:M2});
      const l1=pt(-W+2,-H+2),l2=pt(-W+LW-2,-2);mepSkEnt(sk,{t:'logo',p1:l1,p2:l2});
      C({type:'distX',a:TL,b:l1,val:2});C({type:'distY',a:TL,b:l1,val:2});C({type:'distX',a:l2,b:a,val:2});C({type:'distY',a:l2,b:b,val:2});
      rowL=[a,m];
    }else{
      const M1=pt(-W,-H2);C({type:'onLine',p:M1,ent:left.id});
      mid=ln(M1,M2);C({type:'horizontal',a:M1,b:M2});
      rowL=[TL,M1];
    }
    const x0=-W+LW;
    const rows=[
      {top:top,bot:mid,y:-H,cells:[['PROJET','projet'],['PLANCHE','planche'],['ÉCHELLE','echelle'],['DATE','date'],['DESSINÉ PAR','auteur']]},
      {top:mid,bot:bot,y:-H2,cells:[['MATIÈRE','matiere'],['TTS','traitement'],['TTH','tth'],['TOL. GÉNÉRALES','tolgen'],['INDICE','indice']]}];
    const seps=[pw+4,pw+52,pw+96,pw+156];
    rows.forEach((r,ri)=>{
      const lefts=[rowL[ri]];
      seps.forEach(sx=>{
        const a=pt(x0+sx,r.y),b=pt(x0+sx,r.y+H2);mepSkEnt(sk,{t:'line',p1:a,p2:b});
        C({type:'onLine',p:a,ent:r.top.id});C({type:'onLine',p:b,ent:r.bot.id});C({type:'vertical',a,b});
        C({type:'distX',a:TL,b:a,val:LW+sx});lefts.push(a);
      });
      const xs=[0].concat(seps).map(v=>x0+v),xr=[...seps.map(v=>x0+v),0];
      r.cells.forEach(([lab,f],ci)=>{
        const L=lefts[ci],Lp=sk.pts[L],cw=xr[ci]-(ci?xs[ci]:x0)-3;
        const pl=pt(Lp.x+2,r.y+4.4),pv=pt(Lp.x+2,r.y+11);
        mepSkEnt(sk,{t:'text',p:pl,f:'txt',s:lab,h:5,st:'lab',al:'start',mw:cw});
        mepSkEnt(sk,{t:'text',p:pv,f,h:7.5,st:'val',al:'start',mw:cw});
        C({type:'distX',a:L,b:pl,val:2});C({type:'distY',a:L,b:pl,val:4.4});
        C({type:'distX',a:L,b:pv,val:2});C({type:'distY',a:L,b:pv,val:11});
      });
    });
    mepSkSolve(sk,80);
    return{kind:'sk',name:'Standard (esquisse)',sk};
  }
  function mepTbEdit(on){
    const sh=mepSheet();
    if(on&&!mepTbIsSk(sh)){mepEdit('cartouche en esquisse',()=>{sh.title.tb=mepTbFromStd(sh);});}
    mepSt.tbEdit=!!on;mepSt.skSel=new Set();mepSt.pick=null;
    if(on){mepSt.sel=null;mepSt.selDim=null;mepSt.selAxis=null;if(MEP_SK_TOOLS.indexOf(mepSt.tool)<0)mepSt.tool='select';}
    else mepSt.tool='select';
    mepStatus(on?'Édition du cartouche : outils Ligne, Rectangle, Cercle, Arc, Texte/Champ ; sélectionnez pour contraindre. Échap ou « Terminer » pour sortir.':'Cartouche enregistré sur la planche.');
    mepSideShow();mepRender();
  }
  /* ── bibliothèque de modèles (locale à ce navigateur) ── */
  function mepTbLib(){try{const o=JSON.parse(localStorage.getItem('mep_tb_lib')||'{}');return o&&typeof o==='object'?o:{};}catch(e){return{};}}
  function mepTbLibSave(o){try{localStorage.setItem('mep_tb_lib',JSON.stringify(o));}catch(e){}}
  // sauvegarde externe des modèles : fichier JSON {format:'miniFusion-cartouches',v:1,tbs:{nom:modèle}}
  function mepTbExportFile(sh){
    const L=mepTbLib(),tbs={};Object.keys(L).forEach(n=>{tbs[n]=L[n];});
    if(sh&&mepTbIsSk(sh)){const n=sh.title.tb.name||'Cartouche de la planche';if(!tbs[n])tbs[n]=Object.assign(mepClone(sh.title.tb),{name:n});}
    const names=Object.keys(tbs);
    if(!names.length){mepStatus('Aucun cartouche personnalisé à exporter.');return;}
    const data=JSON.stringify({format:'miniFusion-cartouches',v:1,tbs},null,1);
    const fname=(names.length===1?names[0]:'cartouches').replace(/[\\/:*?"<>|]+/g,'-')+'.mfcartouche';
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.download=fname;
    document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2000);
    mepStatus(names.length+' cartouche(s) exporté(s) : '+fname);
  }
  function mepTbImportFile(){
    const inp=document.createElement('input');inp.type='file';inp.accept='.mfcartouche,.json,application/json';
    inp.onchange=()=>{const f=inp.files&&inp.files[0];if(!f)return;const rd=new FileReader();
      rd.onload=()=>{
        let o;try{o=JSON.parse(rd.result);}catch(e){mepStatus('Fichier de cartouches illisible.');return;}
        const tbs=o&&o.format==='miniFusion-cartouches'&&o.tbs?o.tbs:(o&&o.kind==='sk'&&o.sk?{[o.name||f.name.replace(/\.[^.]+$/,'')]:o}:null);
        if(!tbs){mepStatus('Ce fichier ne contient pas de cartouche miniFusion.');return;}
        const L=mepTbLib();let n=0;
        Object.keys(tbs).forEach(k=>{const tb=tbs[k];if(!tb||tb.kind!=='sk'||!tb.sk||!tb.sk.pts)return;
          let nm=k;if(L[nm]&&JSON.stringify(L[nm])!==JSON.stringify(Object.assign({},tb,{name:nm}))){let i=2;while(L[k+' ('+i+')'])i++;nm=k+' ('+i+')';}
          L[nm]=Object.assign(mepClone(tb),{name:nm});n++;});
        mepTbLibSave(L);mepStatus(n+' cartouche(s) importé(s) dans la bibliothèque.');mepSideShow();
      };rd.readAsText(f);};
    inp.click();
  }
  function mepTbDropStray(sh){
    const sk=sh.title.tb.sk,gone=new Set(mepTbStray(sh));if(!gone.size)return;
    sk.ents.filter(e=>['p1','p2','pc','p'].some(q=>gone.has(e[q]))).forEach(e=>mepSkRmEnt(sk,e.id));
    gone.forEach(k=>{delete sk.pts[k];});mepSkCleanCons(sk);
  }
  function mepTbDefault(){
    try{const n=localStorage.getItem('mep_tb_def'),L=mepTbLib();if(n&&L[n]&&L[n].sk)return mepClone(L[n]);}catch(e){}
    return null;
  }
  function mepTbRemember(list,v){
    v=String(v||'').trim();if(!v)return;
    try{const k='mep_tb_hist_'+list,a=JSON.parse(localStorage.getItem(k)||'[]').filter(x=>x!==v);a.unshift(v);localStorage.setItem(k,JSON.stringify(a.slice(0,20)));}catch(e){}
  }
  function mepTbDatalist(root,list){
    const id='mepTbList_'+list,old=document.getElementById(id);if(old)old.remove();
    const dl=document.createElement('datalist');dl.id=id;
    let hist=[];try{hist=JSON.parse(localStorage.getItem('mep_tb_hist_'+list)||'[]');}catch(e){}
    [...new Set(hist.concat(MEP_TB_LISTS[list]||[]))].forEach(v=>{const o=document.createElement('option');o.value=v;dl.appendChild(o);});
    root.appendChild(dl);
  }
  function mepTbValue(sh,c){
    const tt=sh.title||{};
    switch(c.f){
      case 'planche':return(doc.mep.cur+1)+' / '+doc.mep.sheets.length;
      case 'echelle':return mepSheetScaleLabel(sh);
      case 'format':return sh.format===FORMAT_MANUEL?mepFmtLabel(sh)+' mm':sh.format+(sh.orient==='landscape'?'-H':'-V'); // A3-H, A4-V…
      case 'indice':{const rv=mepRevs(sh);return rv.length?rv[rv.length-1].i:(tt.indice||'—');}
      case 'perso':return(tt.cust&&c.k&&tt.cust[c.k])||'';
      default:{const v=tt[c.f];return v!=null&&v!==''?v:(c.f==='projet'||c.f==='date'||c.f==='auteur'?'':'—');}
    }
  }
  /* ── panneaux ── */
  function mepPanelKit(root){
    const rowEl=()=>{const r=document.createElement('div');r.className='row';root.appendChild(r);return r;};
    const h=t=>{const e=document.createElement('h4');e.textContent=t;root.appendChild(e);};
    const btn=(r,lab,fn,tip,cls)=>{const b=document.createElement('button');b.textContent=lab;if(tip)b.title=tip;if(cls)b.className=cls;
      b.onclick=e=>{e.stopPropagation();fn();};r.appendChild(b);return b;};
    const lab=(r,t,flex)=>{const L=document.createElement('label');L.textContent=t;if(flex===false)L.style.flex='none';r.appendChild(L);return L;};
    const note=t=>{const n=document.createElement('div');n.className='note';n.textContent=t;root.appendChild(n);};
    return{rowEl,h,btn,lab,note};
  }
  /* cadre : trait (couleur réglable), liseré, repères de centrage, zones de repérage, coins de coupe.
     Une couleur imposée porte la classe mepUc : l'export « Noir » la remet en noir. */
  function mepDrawFrame(mk,pg,pd,fr){
    const fc=fr.col?';stroke:'+fr.col:'',mc=fr.mcol?';stroke:'+fr.mcol:'',uc=c=>c?' mepUc':'';
    const x0=pd.ix,y0=pd.iy,x1=pd.ix+pd.iw,y1=pd.iy+pd.ih+pd.th,cx=(x0+x1)/2,cy=(y0+y1)/2,mw=0.2;
    mk('rect',{x:x0,y:y0,width:x1-x0,height:y1-y0,class:'mepFrame'+uc(fc),style:'stroke-width:'+fr.lw+fc});
    if(fr.inner)mk('rect',{x:x0+3,y:y0+3,width:x1-x0-6,height:y1-y0-6,class:'mepFrame2'});
    const L=(a,b,c,d,w)=>mk('line',{x1:a,y1:b,x2:c,y2:d,class:'mepFrame'+uc(mc),style:'stroke-width:'+w+mc});
    if(fr.trim){ // coins de coupe : équerres de 15 mm sur les bords de la feuille
      const k=15,W=pg.W,H=pg.H;
      [[0,0,1,1],[W,0,-1,1],[0,H,1,-1],[W,H,-1,-1]].forEach(([x,y,sx,sy])=>{L(x,y,x+sx*k,y,mw*2);L(x,y,x,y+sy*k,mw*2);});
    }
    if(fr.zones){
      // bandes de 50 mm centrées sur le milieu du cadre ; traits de 5 mm vers l'extérieur
      const cuts=(a,b,c)=>{const o=[];for(let i=-20;i<=20;i++){const v=c+i*50;if(v>a+1&&v<b-1)o.push(v);}return o;};
      const xs=cuts(x0,x1,cx),ys=cuts(y0,y1,cy);
      xs.forEach(x=>{if(fr.centre&&Math.abs(x-cx)<1e-6)return;L(x,y0-5,x,y0,mw);L(x,y1,x,y1+5,mw);});
      ys.forEach(y=>{if(fr.centre&&Math.abs(y-cy)<1e-6)return;L(x0-5,y,x0,y,mw);L(x1,y,x1+5,y,mw);});
      const h=3,fs=mepFs(h),tf=fr.mcol?';fill:'+fr.mcol:'';
      const T=(x,y,t)=>{mk('text',{x,y:y+h/2,class:'mepFrameTxt'+uc(tf),'text-anchor':'middle',style:'font-size:'+fs+'px'+tf}).textContent=t;};
      const bx=[x0,...xs,x1],by=[y0,...ys,y1];
      for(let i=0;i+1<bx.length;i++){const m=(bx[i]+bx[i+1])/2;T(m,y0-2.5,String(i+1));T(m,y1+2.5,String(i+1));}
      for(let j=0;j+1<by.length;j++){const m=(by[j]+by[j+1])/2,c=String.fromCharCode(65+j);T(x0-2.5,m,c);T(x1+2.5,m,c);}
    }
    if(fr.centre){ // repères de centrage : à cheval sur le cadre (5 mm de part et d'autre)
      const w=fr.zones?mw:fr.lw,M=(a,b,c,d)=>mk('line',{x1:a,y1:b,x2:c,y2:d,class:'mepFrame'+uc(fr.zones?mc:fc),style:'stroke-width:'+w+(fr.zones?mc:fc)});
      M(cx,y0-5,cx,y0+5);M(cx,y1-5,cx,y1+5);M(x0-5,cy,x0+5,cy);M(x1-5,cy,x1+5,cy);
    }
  }
  /* liste déroulante des hauteurs d'écriture ISO 3098 (h = majuscules, mm papier) ;
     une valeur hors série reste affichée telle quelle */
  function mepIsoSelect(h,onPick){
    const sel=document.createElement('select');
    const vals=MEP_TEXT_STYLE.iso.slice();
    if(!mepIsoH(h))vals.push(+(+h).toFixed(2));
    vals.sort((a,b)=>a-b).forEach(x=>{
      const o=document.createElement('option');o.value=String(x);
      o.textContent=mepFmtNum(x,2).replace('.',',')+(mepIsoH(x)?(x<2.5?'  (A4 seulement)':''):'  (hors série)');
      sel.appendChild(o);
    });
    const cur=vals.find(x=>Math.abs(x-h)<0.06);sel.value=String(cur!==undefined?cur:vals[0]);
    sel.title='Hauteur des majuscules h, série ISO 3098 (rapport √2) — épaisseur du trait d’écriture ≈ h/10';
    sel.onchange=()=>onPick(+sel.value);
    return sel;
  }
  function mepSideSkTools(root,K,sh){
    // outils de dessin de l'esquisse active (planche ou cartouche)
    const tools=[['▲','select','Sélection / déplacement (Maj+clic : ajouter)'],['━','line','Ligne (enchaînée, Échap termine)'],['▭','rect','Rectangle'],
      ['○','circle','Cercle'],['◠','arc','Arc : centre, départ, arrivée'],['·','point','Point'],['✂','trim','Ajuster'],['T','text','Texte ou champ']];
    if(mepSt.tbEdit)tools.push(['🖼','logo','Zone du logo (2 coins)']);
    const r=K.rowEl();
    tools.forEach(([l,t,tip])=>{const b=K.btn(r,l,()=>mepSetTool(t),tip,mepSt.tool===t?'active':'');b.style.flex='1';});
    {const v=mepSkVis(),rv=K.rowEl();K.lab(rv,'Afficher');
     [['cons','Contraintes','Glyphes H, V, ∥, ⊥, =, M, ⚓…'],['dims','Cotes','Cotes pilotantes (distances, rayons, angles)'],
      ['txt','Textes','Cotes et contraintes de placement des textes (sinon visibles à la sélection du texte)']].forEach(([k,l,tip])=>
       K.btn(rv,l,()=>{v[k]=!v[k];try{localStorage.setItem('mep_sk_vis',JSON.stringify(v));}catch(e){}mepSideShow();mepRender();},
         (v[k]?'Masquer':'Afficher')+' : '+tip+' — un élément sélectionné garde les siennes',v[k]?'active':''));}
    if(mepSt.tool==='text'){
      const r2=K.rowEl();K.lab(r2,'Champ');
      const sel=document.createElement('select');
      Object.keys(MEP_TB_FIELDS).forEach(k=>{const o=document.createElement('option');o.value=k;o.textContent=k==='txt'?'Texte libre':(MEP_TB_FIELDS[k].ed||MEP_TB_FIELDS[k].lab)+(MEP_TB_FIELDS[k].auto?' (auto)':'');sel.appendChild(o);});
      sel.value=mepSt.skTextF||'txt';sel.onchange=()=>{mepSt.skTextF=sel.value;mepSideShow();};r2.appendChild(sel);
      if((mepSt.skTextF||'txt')==='txt'){const r3=K.rowEl();K.lab(r3,'Texte');const i=document.createElement('input');i.value=mepSt.skTextS||'TEXTE';i.oninput=()=>{mepSt.skTextS=i.value;};r3.appendChild(i);}
      const r4=K.rowEl();K.lab(r4,'Hauteur h (mm)');
      r4.appendChild(mepIsoSelect(+mepSt.skTextH||MEP_TEXT_STYLE.noteH,h=>{mepSt.skTextH=h;}));
      K.note('Cliquez pour poser le texte ; il s’accroche aux points et lignes, puis se contraint comme un point.');
    }
  }
  function mepSideSk(root,sh){
    const K=mepPanelKit(root),ctx=mepSkCtx(sh,false),sk=ctx.sk;
    K.h(ctx.tb?'Cartouche — esquisse':'Esquisse de planche');
    mepSideSkTools(root,K,sh);
    if(!sk){mepSideSkStyle(K,null,ctx.tb);return;}
    const s=mepSkSelParts(sk),n=mepSt.skSel.size;
    if(!n)mepSideSkStyle(K,null,ctx.tb);
    K.h('Sélection ('+n+')');
    const valIn=(r,c,id)=>{
      const i=document.createElement('input');i.type='number';i.step=c.type==='angle'?'0.5':'0.1';if(id)i.id=id;
      i.value=+(c.type==='angle'?Math.abs(c.val)*180/Math.PI:Math.abs(c.val)).toFixed(3);
      i.onchange=()=>mepSkSetVal(sh,c,+i.value);
      i.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();i.blur();}};
      r.appendChild(i);K.lab(r,c.type==='angle'?'°':'mm',false);
      return i;
    };
    // une contrainte seule : nom, valeur (si cote), suppression
    if(s.K.length===1&&n===1){
      const c=s.K[0],r=K.rowEl();K.lab(r,MEP_SK_CON_NAMES[c.type]||c.type);
      if(c.val!=null&&c.type!=='fix'){
        const i=valIn(r,c,'mepSkVal');
        if(mepSt.skFocusVal){mepSt.skFocusVal=false;setTimeout(()=>{try{i.focus();i.select();}catch(e){}},30);}
      }
    }
    // points tenus par une vue (accrochage persistant) : origine du lien, détacher
    {const ids=new Set(s.P);s.L.forEach(l=>{ids.add(l.p1);ids.add(l.p2);});s.C.forEach(c=>{if(c.pc)ids.add(c.pc);});
     const lk=[...ids].filter(id=>sk.pts[id]&&sk.pts[id].lk);
     if(lk.length){
       const nm={p1:'extrémité',p2:'extrémité',mid:'milieu',f:'point du trait',ctr:'centre',ang:'point du cercle'};
       K.h('Lié à la vue ('+lk.length+')');
       lk.slice(0,6).forEach(id=>{const L=sk.pts[id].lk,v=mepView(sh,L.vid);
         K.note((nm[L.k]||'point')+' — vue '+(v?(v.label||v.id):'supprimée')+(typeof L.i==='string'?' (trait d’axe)':''));});
       const r=K.rowEl();
       K.btn(r,'Détacher de la vue',()=>{mepEdit('esquisse : détacher de la vue',()=>lk.forEach(id=>{delete sk.pts[id].lk;}));mepSideShow();mepRender();},
         'Le point garde sa position mais ne suit plus la vue');
     }}
    // éléments sélectionnés déjà cotés : leurs cotes pilotantes, modifiables ici (accès direct)
    if(!s.K.length){
      const dims=mepSkDimsOf(sk,s);
      if(dims.length){
        K.h('Cotes ('+dims.length+')');
        dims.slice(0,10).forEach(c=>{const r=K.rowEl();K.lab(r,MEP_SK_CON_NAMES[c.type]||c.type);valIn(r,c);
          const b=K.btn(r,'↗',()=>{mepSt.skSel=new Set(['c:'+c.id]);mepSt.skFocusVal=true;mepSideShow();mepRender();},'Sélectionner cette cote');b.style.flex='0 0 auto';});
      }
    }
    // texte : champ, contenu, hauteur, style, alignement
    if(s.T.length===1&&n===1){
      const e=s.T[0];
      let r=K.rowEl();K.lab(r,'Champ');
      const sel=document.createElement('select');
      Object.keys(MEP_TB_FIELDS).forEach(k=>{const o=document.createElement('option');o.value=k;o.textContent=k==='txt'?'Texte libre':(MEP_TB_FIELDS[k].ed||MEP_TB_FIELDS[k].lab);sel.appendChild(o);});
      sel.value=e.f||'txt';sel.onchange=()=>{mepEdit('texte',()=>{e.f=sel.value;if(e.f==='txt'&&!e.s)e.s='TEXTE';if(e.f==='perso'&&!e.k){e.k='c'+Date.now().toString(36);e.lab='CHAMP';}});mepSideShow();};r.appendChild(sel);
      if(e.f==='txt'){r=K.rowEl();K.lab(r,'Texte');const i=document.createElement('input');i.value=e.s||'';i.onchange=()=>mepEdit('texte',()=>{e.s=i.value;});r.appendChild(i);}
      if(e.f==='perso'){r=K.rowEl();K.lab(r,'Nom du champ');const i=document.createElement('input');i.value=e.lab||'';i.onchange=()=>{mepEdit('texte',()=>{e.lab=i.value;});mepSideShow();};r.appendChild(i);}
      r=K.rowEl();K.lab(r,'Hauteur h (mm)');
      r.appendChild(mepIsoSelect(mepCapH(+e.h||3.5),h=>{mepEdit('texte',()=>{e.h=mepFs(h);});mepSideShow();}));
      r=K.rowEl();K.lab(r,'Largeur maxi (mm)');const mw=document.createElement('input');mw.type='number';mw.step='1';mw.min='0';mw.value=+e.mw||0;mw.title='Largeur maximale (mm) — 0 = libre ; au-delà, le texte est tronqué (…)';
      mw.onchange=()=>mepEdit('texte',()=>{e.mw=Math.max(0,+mw.value||0)||undefined;});r.appendChild(mw);
      r=K.rowEl();K.lab(r,'Graisse');
      [['lab','Libellé'],['val','Valeur']].forEach(([v,l])=>K.btn(r,l,()=>{mepEdit('texte',()=>{e.st=v;});mepSideShow();},v==='lab'?'Texte maigre':'Texte gras',(e.st||'lab')===v?'active':''));
      r=K.rowEl();K.lab(r,'Ancrage');
      [['start','⇤'],['middle','↔'],['end','⇥']].forEach(([v,l])=>K.btn(r,l,()=>{mepEdit('texte',()=>{e.al=v;});mepSideShow();},'Ancrage : '+({start:'début',middle:'centre',end:'fin'})[v],(e.al||'start')===v?'active':''));
    }
    if(s.L.length||s.C.length||s.T.length)mepSideSkStyle(K,[...s.L,...s.C,...s.T],ctx.tb);
    // contraintes applicables
    K.h('Contraintes');
    let r=K.rowEl();
    MEP_SK_CONS.filter(D=>!D.dim).forEach(D=>{const b=K.btn(r,D.lab,()=>mepSkApply(sh,D.id),D.tip);b.disabled=!D.ok(s);if(b.disabled)b.style.opacity='.4';});
    K.h('Cotes pilotantes');
    r=K.rowEl();
    MEP_SK_CONS.filter(D=>D.dim).forEach(D=>{const b=K.btn(r,D.lab,()=>mepSkApply(sh,D.id),D.tip);b.disabled=!D.ok(s);if(b.disabled)b.style.opacity='.4';});
    r=K.rowEl();
    K.btn(r,'Supprimer',()=>mepSkDeleteSel(sh),'Supprimer la sélection (Suppr)','danger');
    K.btn(r,'Désélectionner',()=>{mepSt.skSel=new Set();mepSideShow();mepRender();},'Échap');
    if(ctx.tb){r=K.rowEl();K.btn(r,'Terminer l’édition du cartouche',()=>mepTbEdit(false),'Échap');}
    K.note('Maj+clic : ajouter à la sélection. Glisser un point ou un trait : l’esquisse suit ses contraintes. Une cote se pose à la valeur actuelle, puis se modifie ici.');
  }
  function mepSideSkStyle(K,ents,tb){
    // épaisseur, type de trait et couleur : des éléments sélectionnés, sinon des prochains éléments créés
    const cur=!ents,S=cur?[mepSkStyleCur()]:ents,wDef=tb?'thin':'thick';
    const strokes=cur?S:S.filter(x=>x.t!=='text');
    K.h(cur?'Style des nouveaux éléments':'Style ('+S.length+')');
    const set=fn=>{
      if(cur){fn(S[0]);try{localStorage.setItem('mep_sk_style',JSON.stringify(S[0]));}catch(e){}}
      else mepEdit('style du trait',()=>S.forEach(fn));
      mepSideShow();
    };
    const same=f=>{const v=S.map(f);return v.every(x=>x===v[0])?v[0]:null;};
    if(strokes.length){
      let r=K.rowEl();K.lab(r,'Épaisseur');
      [['thin','Fin'],['thick','Épais']].forEach(([v,l])=>K.btn(r,l,()=>set(x=>{if(x.t==='text')return;x.w=v;delete x.lw;}),
        'Trait '+(v==='thick'?'épais':'fin')+' de la planche (réglages « Traits »)',strokes.every(x=>!(+x.lw>0)&&(x.w||wDef)===v)?'active':''));
      r=K.rowEl();K.lab(r,'Épaisseur (mm)');
      const lw=document.createElement('input');lw.type='number';lw.step='0.05';lw.min='0';lw.max='3';lw.placeholder='auto';
      const lv=same(x=>+x.lw>0?+x.lw:0);lw.value=lv?lv:'';lw.title='Épaisseur libre en mm papier — vide : Fin / Épais';
      lw.onchange=()=>{const v=+lw.value;set(x=>{if(x.t==='text')return;if(v>0)x.lw=Math.min(3,Math.max(0.05,v));else delete x.lw;});};
      r.appendChild(lw);
      r=K.rowEl();K.lab(r,'Type');
      [['','Continu'],['hid','Interrompu'],['axis','Mixte']].forEach(([v,l])=>K.btn(r,l,()=>set(x=>{if(x.t==='text')return;if(v)x.lt=v;else delete x.lt;}),
        v==='hid'?'Trait interrompu (caché)':(v==='axis'?'Trait mixte (axe)':'Trait continu'),strokes.every(x=>(x.lt||'')===v)?'active':''));
      const geo=strokes.filter(x=>cur||x.t==='line'||x.t==='circle'||x.t==='arc');
      if(geo.length){
        r=K.rowEl();K.lab(r,'Construction');const on=geo.every(x=>!!x.cst);
        K.btn(r,on?'Oui':'Non',()=>set(x=>{if(!cur&&!(x.t==='line'||x.t==='circle'||x.t==='arc'))return;if(on)delete x.cst;else x.cst=true;}),
          'Élément de construction : pointillé en édition, invisible sur la planche, à l’impression et à l’export',on?'active':'');
      }
    }
    const r=K.rowEl();K.lab(r,'Couleur');
    const c=document.createElement('input');c.type='color';const cv=same(x=>x.col||'');c.value=cv||'#151515';
    c.title='Couleur du trait (et des textes) — gardée à l’export PDF / SVG en mode « Couleur »';
    c.onchange=()=>set(x=>{x.col=c.value;});
    r.appendChild(c);
    K.btn(r,'Auto',()=>set(x=>{delete x.col;}),'Couleur du thème (encre de la planche)',S.every(x=>!x.col)?'active':'');
  }
  function mepSideTbEdit(root,sh){
    const K=mepPanelKit(root);
    K.h('Édition du cartouche');
    mepSideSkTools(root,K,sh);
    mepSideSkStyle(K,null,true);
    const tb=sh.title.tb,sk=tb.sk;
    const H=mepTbH(sh),bb=mepTbBBox(sk);
    K.note('Origine (croix) = coin bas-droit intérieur du cadre : le cartouche garde ses cotes sur tous les formats. Hauteur actuelle : '+mepFmtNum(H,1)+' mm, largeur : '+mepFmtNum(-bb.minx,1)+' mm.');
    K.note(sk.cons.length+' contrainte(s), '+sk.ents.length+' élément(s). Cliquez un élément pour le contraindre ; les champs ({MATIÈRE}, {TTS}, {TTH}…) prennent les valeurs de la planche.');
    let r=K.rowEl();
    K.btn(r,'Terminer',()=>mepTbEdit(false),'Quitter l’édition (Échap)','active');
    K.btn(r,'Repartir du Standard',()=>{if(!confirm('Remplacer le cartouche par le modèle Standard (annulable) ?'))return;mepEdit('cartouche standard',()=>{sh.title.tb=mepTbFromStd(Object.assign({},sh,{title:Object.assign({},sh.title,{tb:null})}));});mepSideShow();},'Recrée l’esquisse du cartouche Standard');
  }
  /* ═══════════════ règles mm, coordonnées, épaisseurs de trait (V0.3.11) ═══════════════ */
  const MEP_RULER=16; // px
  let mepRulerCv=null,mepCoordEl=null;
  function mepRulers(){
    // règles graduées en mm papier (haut et gauche), alignées sur la planche quel que soit le zoom
    try{
      if(!mepSheetEl||!mepSvgEl)return;
      if(!mepRulerCv){
        mepRulerCv=document.createElement('canvas');mepRulerCv.id='mepRulers';
        mepRulerCv.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:2';
        mepSheetEl.appendChild(mepRulerCv);
        mepCoordEl=document.createElement('div');mepCoordEl.id='mepCoord';
        mepCoordEl.style.cssText='position:absolute;right:8px;bottom:6px;z-index:3;pointer-events:none;font:600 .7rem monospace;padding:2px 7px;border-radius:6px;background:rgba(0,0,0,.45);color:#fff';
        mepSheetEl.appendChild(mepCoordEl);
      }
      const R=mepSheetEl.getBoundingClientRect();if(!(R.width>0))return;
      const dpr=window.devicePixelRatio||1;
      mepRulerCv.width=Math.round(R.width*dpr);mepRulerCv.height=Math.round(R.height*dpr);
      const g=mepRulerCv.getContext('2d');if(!g)return;
      g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,R.width,R.height);
      if(mepSt.rulers===false)return;
      const m=mepSvgEl.getScreenCTM&&mepSvgEl.getScreenCTM();if(!m)return;
      const S=m.a,ox=m.e-R.left,oy=m.f-R.top; // écran = S·mm + o (relatif à la zone)
      const pg=mepPage();
      let dk=false;try{dk=(document.body.getAttribute('data-theme')||'nuit')!=='clair';}catch(e){}
      const bg=dk?'rgba(24,26,30,.92)':'rgba(240,242,246,.94)',fg=dk?'#c9ccd1':'#3a3f47',ac=dk?'#4da3ff':'#0a6cff';
      g.fillStyle=bg;g.fillRect(0,0,R.width,MEP_RULER);g.fillRect(0,0,MEP_RULER,R.height);
      // pas des graduations selon le zoom : ≥ 6 px entre petites graduations
      const steps=[1,2,5,10,20,50,100,200];let st=steps.find(v=>v*S>=6)||200;
      const big=st<=2?10:(st<=10?50:(st<=50?100:500));
      g.strokeStyle=fg;g.fillStyle=fg;g.lineWidth=1;g.font='9px sans-serif';
      g.beginPath();
      for(let x=0;x<=pg.W+1e-6;x+=st){const X=ox+x*S;if(X<MEP_RULER||X>R.width)continue;const M=Math.abs(x%big)<1e-6;const h=M?MEP_RULER:(Math.abs(x%(st*5))<1e-6?9:5);g.moveTo(X+.5,MEP_RULER-h);g.lineTo(X+.5,MEP_RULER);if(M)g.fillText(String(x),X+2,9);}
      for(let y=0;y<=pg.H+1e-6;y+=st){ // Y graduée depuis le BAS de la planche (convention du dessin)
        const Y=oy+(pg.H-y)*S;if(Y<MEP_RULER||Y>R.height)continue;const M=Math.abs(y%big)<1e-6;const h=M?MEP_RULER:(Math.abs(y%(st*5))<1e-6?9:5);g.moveTo(MEP_RULER-h,Y+.5);g.lineTo(MEP_RULER,Y+.5);
        if(M){g.save();g.translate(9,Y-2);g.rotate(-Math.PI/2);g.fillText(String(y),0,0);g.restore();}}
      g.stroke();
      // repère du curseur
      if(mepSt.cursorMm){const cx=ox+mepSt.cursorMm.x*S,cy=oy+mepSt.cursorMm.y*S;g.strokeStyle=ac;g.lineWidth=1.5;g.beginPath();g.moveTo(cx+.5,0);g.lineTo(cx+.5,MEP_RULER);g.moveTo(0,cy+.5);g.lineTo(MEP_RULER,cy+.5);g.stroke();}
      g.fillStyle=bg;g.fillRect(0,0,MEP_RULER,MEP_RULER);
    }catch(e){}
  }
  function mepCoordShow(P){
    try{
      if(!mepCoordEl)return;
      if(!P){mepCoordEl.style.display='none';mepSt.cursorMm=null;mepRulers();return;}
      const pg=mepPage();
      mepSt.cursorMm={x:P.x,y:P.y};
      mepCoordEl.style.display='';
      mepCoordEl.textContent='X '+P.x.toFixed(1)+'  Y '+(pg.H-P.y).toFixed(1)+' mm';
      mepRulers();
    }catch(e){}
  }
  /* épaisseurs de trait (mm papier) : préréglages ISO 128 ; posées sur le SVG → gardées à l'export */
  const MEP_LW_PRESETS={ecran:{lab:'Écran (fin)',thick:.72,thin:.42,hid:.42,dim:.55},iso7:{lab:'ISO 128 — 0,7 / 0,35',thick:.7,thin:.35,hid:.35,dim:.35},iso5:{lab:'ISO 128 — 0,5 / 0,25',thick:.5,thin:.25,hid:.25,dim:.25}};
  function mepLwGet(){try{const o=JSON.parse(localStorage.getItem('mep_lw')||'null');if(o&&isFinite(o.thick))return o;}catch(e){}return Object.assign({preset:'ecran'},MEP_LW_PRESETS.ecran);}
  function mepLwApply(){
    try{
      const o=mepLwGet(),st=mepSvgEl&&mepSvgEl.style;if(!st)return;
      const set=(k,v)=>{try{st.setProperty(k,v);}catch(e){st[k]=v;}};
      set('--mepLwThick',String(o.thick));set('--mepLwThin',String(o.thin));set('--mepLwHid',String(o.hid));
      set('--mepLwDim',String(o.dim));set('--mepLwHatch',String(o.thin));set('--mepLwAxis',String(o.thin));
    }catch(e){}
  }
  function mepLwSet(o){try{localStorage.setItem('mep_lw',JSON.stringify(o));}catch(e){}mepLwApply();mepRender();}
  /* ═══════════════ M. construction UI ═══════════════ */
  function mepBuildMarkers(){
    if(!mepDefsEl)return;
    while(mepDefsEl.firstChild)mepDefsEl.removeChild(mepDefsEl.firstChild);
    const mkMarker=(id,dir,color)=>{
      const a=mepArrowGeom();
      const mkr=document.createElementNS(NS,'marker');
      mkr.setAttribute('id',id);mkr.setAttribute('markerWidth',a.len);mkr.setAttribute('markerHeight',a.h*2);
      // pointe exactement sur l'extrémité du trait (pas de jeu avant/après la flèche)
      mkr.setAttribute('refX',dir>0?a.len:0);mkr.setAttribute('refY',a.h);mkr.setAttribute('orient','auto');
      const p=document.createElementNS(NS,'path');
      p.setAttribute('d',dir>0
        ?'M0,0 L'+a.len+','+a.h+' L0,'+(a.h*2)+' z'
        :'M'+a.len+',0 L0,'+a.h+' L'+a.len+','+(a.h*2)+' z');
      // couleur = variable des cotes (noir à l'export) ; flèches de coupe toujours noires
      p.setAttribute('class',color==='sel'?'mepArrowSel':color==='ink'?'mepArrowK':'mepArrowM');
      mkr.appendChild(p);mepDefsEl.appendChild(mkr);
    };
    mkMarker('mepArr',1,'dim');mkMarker('mepArrS',-1,'dim');
    mkMarker('mepArrK',1,'ink');
    mkMarker('mepArrSel',1,'sel');mkMarker('mepArrSSel',-1,'sel');
  }
  function mepBuildUI(){
    if(mepWrapEl&&mepWrapEl.parentNode)return;
    mepDimStyleLoad();
    const host=document.getElementById('vpwrap')||document.body;
    mepWrapEl=document.createElement('div');mepWrapEl.id='mepWrap';
    // construction explicite (pas d'innerHTML : le harnais de test ne parse pas)
    const tabs=document.createElement('div');tabs.id='mepTabs';
    const tb=document.createElement('div');tb.id='mepToolbar';
    const body=document.createElement('div');body.id='mepBody';
    const sheet=document.createElement('div');sheet.id='mepSheet';
    const svg=document.createElementNS(NS,'svg');svg.id='mepSvg';
    const defs=document.createElementNS(NS,'defs');mepDefsEl=defs;
    svg.appendChild(defs);
    const gSheet=document.createElementNS(NS,'g');gSheet.id='mepGSheet';
    const gHlp=document.createElementNS(NS,'g');gHlp.id='mepGHlp';
    svg.appendChild(gSheet);svg.appendChild(gHlp);
    sheet.appendChild(svg);
    const side=document.createElement('div');side.id='mepSide';
    body.appendChild(sheet);body.appendChild(side);
    const st=document.createElement('div');st.id='mepStatus';
    mepWrapEl.appendChild(tabs);mepWrapEl.appendChild(tb);mepWrapEl.appendChild(body);mepWrapEl.appendChild(st);
    host.appendChild(mepWrapEl);
    mepSvgEl=svg;
    mepSheetEl=sheet;
    mepApplyDimStyle();
    mepThemeApply();
    mepLwApply();
    // la fenêtre change de taille : règles redessinées (la planche se recadre d'elle-même)
    try{new ResizeObserver(()=>{if(mepSt.open)mepRulers();}).observe(sheet);}catch(e){}

    mepSideEl=side;
    mepStatusEl=st;
    mepTabsEl=tabs;
    mepGSheet=gSheet;
    mepGHlp=gHlp;
    mepToolbarEl=tb;
    mepBuildToolbar();
    mepSvgEl.addEventListener('pointerdown',mepOnDown);
    mepSvgEl.addEventListener('pointermove',mepOnMove);
    mepSvgEl.addEventListener('pointerup',mepOnUp);
    mepSvgEl.addEventListener('pointerleave',()=>{mepSt.hovView=null;mepSt.hovEnt=null;mepSt.skHov=null;mepCoordShow(null);try{mepRender();}catch(e){}});
    mepSvgEl.addEventListener('wheel',mepOnWheel,{passive:false});
    mepSvgEl.addEventListener('dblclick',mepOnDbl);
    mepSvgEl.addEventListener('contextmenu',mepOnContext);
    window.addEventListener('keydown',mepOnKey,true);
    window.addEventListener('resize',()=>{try{mepRender();}catch(e){}});
  }
  function mepBuildToolbar(){
    /* la barre d'outils interne est retirée : ruban (bandeau) + panneau latéral suffisent */
    mepToolSync();
  }
  /* code = 'A3H', 'A4V'… ou FORMAT_MANUEL ; le manuel part des dimensions de la planche actuelle */
  function mepSetFormat(code){
    const sh=mepSheet();
    mepEdit('format',()=>{
      if(code===FORMAT_MANUEL){
        if(sh.format!==FORMAT_MANUEL){const{W,H}=mepPageWH(sh);sh.fw=W;sh.fh=H;sh.format=FORMAT_MANUEL;}
      }else{sh.format=code.slice(0,-1);sh.orient=code.slice(-1)==='H'?'landscape':'portrait';delete sh.fw;delete sh.fh;}
    });
    mepTabsRender();
  }
  function mepSetFormatWH(w,h){
    const sh=mepSheet();
    mepEdit('format manuel',()=>{
      sh.format=FORMAT_MANUEL;
      sh.fw=Math.min(5000,Math.max(50,+w||sh.fw||420));sh.fh=Math.min(5000,Math.max(50,+h||sh.fh||297));
      sh.orient=sh.fw>=sh.fh?'landscape':'portrait';
    });
    mepTabsRender();
  }
  function mepZoomBy(k){
    const pg=mepPage();
    const cx=pg.vb[0]+pg.vb[2]/2,cy=pg.vb[1]+pg.vb[3]/2;
    mepSt.zoom=Math.min(20,Math.max(0.08,mepSt.zoom*k));
    const w=pg.W/mepSt.zoom,h=pg.H/mepSt.zoom;
    mepSt.pan.x=cx-w/2;mepSt.pan.y=cy-h/2;
    mepRender();
  }
  function mepFitSheet(){mepSt.zoom=1;mepSt.pan={x:0,y:0};}
  function mepFitViewContent(view){
    const b=mepAABBOf(mepGeoOf(view));
    if(!b)return;
    const s1=mepToSheet(view,b.minx,b.miny),s2=mepToSheet(view,b.maxx,b.maxy);
    const pg=mepPage(),pad=14;
    const w=(s2.x-s1.x)+pad*2,h=(s2.y-s1.y)+pad*2;
    mepSt.zoom=Math.min(20,Math.max(0.08,Math.min(pg.W/w,pg.H/h)));
    mepSt.pan.x=(s1.x+s2.x)/2-pg.W/(2*mepSt.zoom);
    mepSt.pan.y=(s1.y+s2.y)/2-pg.H/(2*mepSt.zoom);
    mepRender();
  }
  function mepTabsRender(){
    if(!mepTabsEl)return;
    mepEnsure();
    mepTabsEl.innerHTML='';
    doc.mep.sheets.forEach((sh,i)=>{
      const b=document.createElement('button');
      b.textContent=sh.name+' · '+mepFmtCode(sh);
      if(i===doc.mep.cur)b.className='on';
      b.onclick=()=>{doc.mep.cur=i;mepAfterSheetSwitch();};
      b.ondblclick=()=>{
        const n=prompt('Nom de la planche :',sh.name);
        if(n){mepEdit('renommer planche',()=>{sh.name=n;});mepTabsRender();}
      };
      mepTabsEl.appendChild(b);
    });
    const add=document.createElement('button');
    add.className='mepAdd';add.textContent='＋';add.title='Ajouter une planche';
    add.onclick=()=>mepAddSheetCmd();
    mepTabsEl.appendChild(add);
    const dup=document.createElement('button');dup.className='mepAdd';dup.textContent='⧉';dup.title='Dupliquer la planche';
    dup.onclick=()=>mepDupSheetCmd();mepTabsEl.appendChild(dup);
    const del=document.createElement('button');del.className='mepAdd';del.textContent='🗑';del.title='Supprimer la planche';
    del.onclick=()=>mepDelSheetCmd();mepTabsEl.appendChild(del);
    const fmt=document.createElement('span');
    fmt.style.cssText='font-size:.68rem;color:var(--muted);margin-left:8px';
    const sh=mepSheet();
    fmt.textContent=sh.format===FORMAT_MANUEL?mepFmtLabel(sh)+' mm':sh.format+' '+(sh.orient==='landscape'?'paysage':'portrait');
    mepTabsEl.appendChild(fmt);
  }
  function mepSelView(){const sh=mepSheet();return mepSt.sel?mepView(sh,mepSt.sel):null;}
  /* ═══════════════ N. rendu ═══════════════ */
  /* ═══════════════ paramètres PLAN : session + projet + fichier ═══════════════
     Les réglages (écriture ISO, cotes, traits, export, papier, cadre et cartouche par défaut…)
     vivent dans localStorage (= la session de ce navigateur) ET dans doc.mep.prefs (= le projet,
     enregistré dans le .miniFusion). À l'ouverture d'un projet, ses réglages remplacent ceux
     de la session ; tout changement ensuite est recopié dans le projet. */
  const MEP_PREF_KEYS=['minifusion_mepDimStyle','mep_lw','mep_exp_bw','mep_paper','mep_rulers','minifusion_mepZoomRev','mep_frame_def','mep_tb_def','mep_sk_style'];
  let mepPrefsMep=null;
  function mepPrefsCollect(){
    const ls={};MEP_PREF_KEYS.forEach(k=>{let v=null;try{v=localStorage.getItem(k);}catch(e){}if(v!==null)ls[k]=v;});
    return{v:1,ls};
  }
  function mepPrefsApply(pr){
    if(!pr||!pr.ls||typeof pr.ls!=='object')return false;
    MEP_PREF_KEYS.forEach(k=>{try{const v=pr.ls[k];if(typeof v==='string')localStorage.setItem(k,v);else localStorage.removeItem(k);}catch(e){}});
    Object.assign(MEP_DIM_STYLE,MEP_DIM_STYLE_DEF);Object.assign(MEP_TEXT_STYLE,MEP_TEXT_STYLE_DEF);mepTextStyleSync();
    mepDimStyleLoaded=false;mepDimStyleLoad();
    try{mepSt.rulers=localStorage.getItem('mep_rulers')!=='0';mepSt.zoomRev=localStorage.getItem('minifusion_mepZoomRev')==='1';}catch(e){}
    try{mepApplyDimStyle();mepLwApply();mepThemeApply();mepRulers();}catch(e){}
    return true;
  }
  function mepPrefsSync(){
    const m=doc.mep;if(!m)return;
    const cur=mepPrefsCollect(),js=JSON.stringify(cur);
    if(m!==mepPrefsMep){ // projet ouvert (ou plan remplacé par annuler / rétablir)
      mepPrefsMep=m;
      if(m.prefs&&m.prefs.ls){if(JSON.stringify(m.prefs)!==js){mepPrefsApply(m.prefs);try{mepSideShow();}catch(e){}}}
      else m.prefs=cur; // ancien projet : il adopte les réglages de la session
      return;
    }
    if(JSON.stringify(m.prefs||null)!==js){ // réglage changé : recopié dans le projet
      m.prefs=cur;try{dirty=true;}catch(e){}
      if(mepAutoT)clearTimeout(mepAutoT);
      mepAutoT=setTimeout(()=>{try{autosave();}catch(e){}},900);
    }
  }
  function mepPrefsExport(){
    const data=JSON.stringify({format:'miniFusion-plan-params',v:1,prefs:mepPrefsCollect(),tbLib:mepTbLib()},null,1);
    const nm=String((typeof doc!=='undefined'&&doc.name)||'plan').replace(/[\\/:*?"<>|]+/g,'-')+' - paramètres plan.mfplan';
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.download=nm;
    document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2000);
    mepStatus('Paramètres plan exportés : '+nm);
  }
  function mepPrefsImport(){
    const inp=document.createElement('input');inp.type='file';inp.accept='.mfplan,.json,application/json';
    inp.onchange=()=>{const f=inp.files&&inp.files[0];if(!f)return;const rd=new FileReader();
      rd.onload=()=>{
        let o;try{o=JSON.parse(rd.result);}catch(e){mepStatus('Fichier de paramètres illisible.');return;}
        if(!o||o.format!=='miniFusion-plan-params'||!o.prefs){mepStatus('Ce fichier ne contient pas de paramètres plan miniFusion.');return;}
        mepPrefsApply(o.prefs);
        let n=0;if(o.tbLib&&typeof o.tbLib==='object'){const L=mepTbLib();Object.keys(o.tbLib).forEach(k=>{const tb=o.tbLib[k];if(tb&&tb.kind==='sk'&&tb.sk&&!L[k]){L[k]=tb;n++;}});mepTbLibSave(L);}
        mepSideShow();mepRender();
        mepStatus('Paramètres plan importés'+(n?' (+ '+n+' cartouche(s) dans la bibliothèque)':'')+' — appliqués à ce projet et à la session.');
      };rd.readAsText(f);};
    inp.click();
  }
  function mepRender(){
    if(!mepWrapEl||!mepSt.open)return;
    mepEnsure();
    mepPrefsSync();
    try{mepCutFollowAll(mepSheet());}catch(e){}
    mepAxGen++; // traits d'axe recalculés à chaque rendu
    const sh=mepSheet();
    const pg=mepPage();
    mepDimHits.clear();
    mepSkConHits=[]; // une seule esquisse en édition à la fois (planche OU cartouche)
    if(mepSt.tbEdit&&!mepTbIsSk(sh))mepSt.tbEdit=false; // autre planche : pas de cartouche dessiné
    mepThemeApply();
    mepSvgEl.setAttribute('viewBox',pg.vb.map(v=>+v.toFixed(3)).join(' '));
    mepPxMM=mepPxToMm();
    mepGSheet.innerHTML='';
    mepGHlp.innerHTML='';
    const mk=(tag,attrs,parent)=>{
      const el=document.createElementNS(NS,tag);
      if(attrs)for(const k in attrs)el.setAttribute(k,attrs[k]);
      (parent||mepGSheet).appendChild(el);
      return el;
    };
    /* feuille + cadre + cartouche */
    mk('rect',{x:0,y:0,width:pg.W,height:pg.H,class:'mepPage'});
    const pd=pg.pd;
    const fr=pd.fr||MEP_FRAME_DEF;
    mepDrawFrame(mk,pg,pd,fr);
    const ty=pg.H-fr.b-pd.th;
    if(mepTbIsSk(sh)){
      // cartouche dessiné : esquisse ancrée au coin bas-droit intérieur du cadre
      const A=mepTbAnchor(sh);
      mepDrawSkCtx(mk,sh,{sk:sh.title.tb.sk,ox:A.x,oy:A.y,tb:true},mepSt.tbEdit?'tbEdit':'tb');
    }else{
      mk('rect',{x:pd.ix,y:ty,width:pd.iw,height:pd.th,class:'mepTitleBlock'});
      mk('line',{x1:pd.ix,y1:ty,x2:pd.ix+pd.iw,y2:ty,class:'mepTitleBlock'});
      mepDrawTitle(mk,sh,pd,ty);
    }
    try{mepDrawRevs(mk,sh,pd,ty);}catch(e){}
    try{mepDrawBom(mk,sh,pd,ty);}catch(e){}
    /* grille */
    if(mepSt.grid){
      for(let x=0;x<=pg.W;x+=10)mk('line',{x1:x,y1:0,x2:x,y2:pg.H,class:'mepGrid'});
      for(let y=0;y<=pg.H;y+=10)mk('line',{x1:0,y1:y,x2:pg.W,y2:y,class:'mepGrid'});
    }
    /* vues */
    sh.views.forEach(v=>{
      try{mepDrawView(mk,v,sh);}catch(e){try{console.warn('vue',e);}catch(e2){}}
    });
    /* cotes */
    sh.dims.forEach(d=>{
      try{mepDrawDim(mk,d,sh);}catch(e){}
    });
    try{mepDrawBalloons(mk,sh);}catch(e){} // bulles de nomenclature (V0.6.7)
    /* cote en cours de placement : aperçu vivant (suit la souris) */
    if(mepSt.dim&&mepSt.dim.__ghost!==false&&!(mepSt.dim.kind==='dist'&&!mepSt.dim.b)){
      try{mepDrawDim(mk,mepSt.dim,sh);}catch(e){}
    }
    /* esquisse de planche */
    if(sh.sk){
      try{mepDrawSk(mk,sh);}catch(e){} // (V0.3.12 : la planche, et non sh.sk — l'esquisse n'était jamais dessinée)
    }
    /* cadre bleu : sélection (plein) + survol (pointillé) */
    const drawVB=(id,cls)=>{
      const v=mepView(sh,id);
      if(!v)return;
      const b=mepViewSheetBBox(v);
      if(b)mk('rect',{x:b.x-4,y:b.y-4,width:b.w+8,height:b.h+8,class:cls},mepGHlp);
    };
    if(mepSt.sel)drawVB(mepSt.sel,'mepVBSel');
    if(mepSt.lot)mepSt.lot.views.forEach(id=>drawVB(id,'mepVBSel'));
    if(mepSt.hovView)drawVB(mepSt.hovView,'mepVB');
    /* brouillons d'interaction */
    try{mepDrawDraft(mk);}catch(e){}
    try{mepVcmdDraw(mk);}catch(e){}
    mepToolSync();
    mepRulers();
  }
  function mepSheetScaleLabel(sh){
    const vals=sh.views.filter(v=>v.scale!==1&&v.kind!=='detail').map(v=>v.scale); // un détail porte sa propre échelle
    if(!vals.length)return '1:1';
    const s=vals[0];
    if(s>=1)return mepFmtNum(s,2).replace(',0','')+':1';
    return '1:'+mepFmtNum(1/s,2);
  }
  function mepViewSheetBBox(v){
    const b=mepAABBOf(mepGeoOf(v));
    let minx=b?b.minx:1e9,miny=b?b.miny:1e9,maxx=b?b.maxx:-1e9,maxy=b?b.maxy:-1e9,any=!!b;
    if(v.detail){minx=Math.min(minx,v.detail.cx-v.detail.r);maxx=Math.max(maxx,v.detail.cx+v.detail.r);miny=Math.min(miny,v.detail.cy-v.detail.r);maxy=Math.max(maxy,v.detail.cy+v.detail.r);any=true;}
    if(!any)return null;
    const s1=mepToSheet(v,minx,miny),s2=mepToSheet(v,maxx,maxy);
    return{x:s1.x,y:s1.y,w:s2.x-s1.x,h:s2.y-s1.y};
  }
  function mepDrawFaces(mk,faces,v){
    faces.forEach(f=>{
      const p=f.p.map(q=>[+(v.x+q[0]*v.scale).toFixed(3),+(v.y+q[1]*v.scale).toFixed(3)]);
      if(p.length<3)return;
      const a={d:'M'+p.map(q=>q[0]+' '+q[1]).join(' L')+' Z',class:'mepFace',
        fill:f.c,stroke:f.c,'stroke-width':0.12};
      if(f.o<0.999){
        a['fill-opacity']=f.o;
        a.stroke='none';
      }
      mk('path',a);
    });
  }
  function mepImg3dRect(v,img){
    const sc=(+v.scale>0)?+v.scale:1;
    return{x:+(v.x+img.lx*sc).toFixed(3),y:+(v.y+img.ly*sc).toFixed(3),
      w:+(img.lw*sc).toFixed(3),h:+(img.lh*sc).toFixed(3)};
  }
  function mepDrawAxisPrim(mk,p,v,extra){
    const X=lx=>+(v.x+lx*v.scale).toFixed(3),Y=ly=>+(v.y+ly*v.scale).toFixed(3);
    const cls=(p.cls||'mepAxis')+(extra?' '+extra:'');
    if(p.t==='L')mk('line',{x1:X(p.x1),y1:Y(p.y1),x2:X(p.x2),y2:Y(p.y2),class:cls});
    else if(p.t==='C')mk('circle',{cx:X(p.cx),cy:Y(p.cy),r:+(p.r*v.scale).toFixed(3),class:cls});
  }
  function mepDrawAxes(mk,v,sh){
    const sa=mepSt.selAxis&&mepSt.selAxis.vid===v.id?mepSt.selAxis:null;
    const hs=2.2/(mepSt.zoom||1),ends=[];
    const entCls=ak=>(mepSt.entSel||[]).some(s=>s.vid===v.id&&s.i==='ax:'+ak)?' mepSelEnt'
      :(mepSt.hovEnt&&mepSt.hovEnt.vid===v.id&&mepSt.hovEnt.i==='ax:'+ak?' mepHovEnt':'');
    mepAxisLines(sh,v).forEach(p=>{
      // axe manuel : tout l'axe est sélectionné ; axe auto : le seul trait cliqué
      const sel=!!sa&&(p.ann?sa.id===p.ann.id:sa.ak===p.ak);
      const cls=(p.ann?'mepAxisManual':'mepAxisAuto')+(sel?' mepAxisSel':'')+entCls(p.ak);
      mepDrawAxisPrim(mk,p,v,cls);
      // 2026-10-22-013 : poignées d'extrémité sur tout trait d'axe sélectionné
      if(sel&&p.t==='L')ends.push({x:p.x1,y:p.y1},{x:p.x2,y:p.y2});
    });
    ends.forEach(q=>mk('rect',{x:v.x+q.x*v.scale-hs,y:v.y+q.y*v.scale-hs,width:2*hs,height:2*hs,
      fill:'#fff',stroke:'#0a84ff','stroke-width':0.6/(mepSt.zoom||1),class:'mepAxisHandle'}));
  }
  function mepDrawView(mk,v,sh){
    const g=mepGeoOf(v);
    const X=lx=>v.x+lx*v.scale,Y=ly=>v.y+ly*v.scale;
    /* rendu 3D bitmap derrière les arêtes */
    if(v.render3d&&g.img3d&&g.img3d.url){
      const ir=mepImg3dRect(v,g.img3d);
      mk('image',{x:ir.x,y:ir.y,width:ir.w,height:ir.h,
        href:g.img3d.url,preserveAspectRatio:'none','pointer-events':'none',
        class:'mepRender3d'});
    }
    /* faces ombrées derrière les arêtes */
    if(g.faces&&g.faces.length)mepDrawFaces(mk,g.faces,v);
    if(g.thr3d&&g.thr3d.length)g.thr3d.forEach(t=>mk('line',{x1:+X(t[0]).toFixed(3),y1:+Y(t[1]).toFixed(3),x2:+X(t[2]).toFixed(3),y2:+Y(t[3]).toFixed(3),
      class:'mepThr3d'+(t[4]?' mepThr3dRing':'')}));
    mepDrawAxes(mk,v,sh);
    /* la vue sélectionnée garde ses couleurs : seul le cadre bleu la signale */
    const selEnt=(e,ei)=>mepSt.entSel&&mepSt.entSel.some(s=>
      s.vid===v.id&&s.i===ei&&(!s.sig||s.sig===mepEntSig(e)));
    const hovEnt=(e,ei)=>mepSt.hovEnt&&mepSt.hovEnt.vid===v.id&&mepSt.hovEnt.i===ei
      &&(!mepSt.hovEnt.sig||mepSt.hovEnt.sig===mepEntSig(e));
    const cls=(e,ei)=>(e.k==='hidden'||e.k==='threadH'?'mepEnt mepHidden':e.k==='thread'?'mepEnt mepThread':e.k==='tangent'?'mepEnt mepTangent':e.k==='sect'?'mepEnt mepSect':'mepEnt mepSharp')
      +(selEnt(e,ei)?' mepSelEnt':(hovEnt(e,ei)?' mepHovEnt':''));
    g.els.forEach((e,ei)=>{
      if(e.t==='L')mk('line',{x1:+X(e.x1).toFixed(3),y1:+Y(e.y1).toFixed(3),x2:+X(e.x2).toFixed(3),y2:+Y(e.y2).toFixed(3),class:cls(e,ei)});
      else if(e.t==='C')mk('circle',{cx:+X(e.cx).toFixed(3),cy:+Y(e.cy).toFixed(3),r:+(e.r*v.scale).toFixed(3),class:cls(e,ei)});
      else if(e.t==='A'){
        const x0=+X(e.cx+e.r*Math.cos(e.a0)).toFixed(3),y0=+Y(e.cy+e.r*Math.sin(e.a0)).toFixed(3);
        const x1=+X(e.cx+e.r*Math.cos(e.a1)).toFixed(3),y1=+Y(e.cy+e.r*Math.sin(e.a1)).toFixed(3);
        const rr=+(e.r*v.scale).toFixed(3);
        const la=Math.abs(e.a1-e.a0)>Math.PI?1:0,sw=e.a1>e.a0?1:0;
        mk('path',{d:'M'+x0+' '+y0+' A'+rr+' '+rr+' 0 '+la+' '+sw+' '+x1+' '+y1,class:cls(e,ei)});
      }
      else if(e.t==='P'&&e.pts&&e.pts.length>1){
        for(let k=0;k+1<e.pts.length;k++)
          mk('line',{x1:+X(e.pts[k][0]).toFixed(3),y1:+Y(e.pts[k][1]).toFixed(3),x2:+X(e.pts[k+1][0]).toFixed(3),y2:+Y(e.pts[k+1][1]).toFixed(3),class:cls(e,ei)});
      }
    });
    /* hachures */
    if(g.hatch&&g.hatch.length)mepDrawHatch(mk,g.hatch,v);
    /* ligne de coupe sur le parent (ISO 128-44) : trait mixte fin, extrémités épaisses, flèches = sens du regard, lettres */
    if(v.section&&v.section.a&&v.section.pid){
      const par=mepView(sh,v.section.pid);
      if(par){
        const A=mepToSheet(par,v.section.a[0],v.section.a[1]);
        const B0=mepToSheet(par,v.section.b[0],v.section.b[1]);
        // coupe brisée : polyligne, gros traits aux bouts ET aux changements de plan
        const SP=(Array.isArray(v.section.pts)&&v.section.pts.length>2)?v.section.pts.map(q=>mepToSheet(par,q[0],q[1])):null;
        const B=SP?SP[SP.length-1]:B0;
        // sens du regard, trait fort, flèche et lettre : mepCutEnds
        if(SP){
          for(let i=0;i+1<SP.length;i++)mk('line',{x1:SP[i].x,y1:SP[i].y,x2:SP[i+1].x,y2:SP[i+1].y,class:'mepCutLine'});
          for(let i=1;i+1<SP.length;i++){ // coude : deux bras épais de 4 mm
            [SP[i-1],SP[i+1]].forEach(Q=>{const qx=Q.x-SP[i].x,qy=Q.y-SP[i].y,ql=Math.hypot(qx,qy)||1,m=Math.min(4,ql/2);
              mk('line',{x1:SP[i].x,y1:SP[i].y,x2:SP[i].x+qx/ql*m,y2:SP[i].y+qy/ql*m,class:'mepCutEnd'});});
          }
        }else mk('line',{x1:A.x,y1:A.y,x2:B.x,y2:B.y,class:'mepCutLine'});
        {const pk=mepSt.pick;
         if(pk&&pk.kind==='cutSeg'&&pk.vid===v.id&&pk.prev&&pk.M){
           const M=JSON.parse(JSON.stringify(pk.M)),q=pk.prev;
           if(q.kind==='step')M.steps[q.k]=q.s;
           else if(q.kind==='plane')M.c[q.m]=q.c;
           else{const lo=q.m?M.steps[q.m-1]:M.s0,hi=q.m===M.c.length-1?M.sE:M.steps[q.m];
             if((pk.sG-lo)*(hi-pk.sG)>0){M.steps.splice(q.m,0,pk.sG);M.c.splice(q.m+1,0,q.c);}}
           const Q=(sv,cv)=>mepToSheet(par,M.t.x*sv+M.n.x*cv,M.t.y*sv+M.n.y*cv);
           const pts=[Q(M.s0,M.c[0])];M.steps.forEach((sv,k)=>{pts.push(Q(sv,M.c[k]),Q(sv,M.c[k+1]));});pts.push(Q(M.sE,M.c[M.c.length-1]));
           mk('polyline',{points:pts.map(p=>p.x+','+p.y).join(' '),class:'mepCutPrev'});
         }}
        mepCutEnds(sh,v).forEach(E=>{
          // bout déplacé vers l'extérieur : le trait mixte fin se prolonge jusqu'au trait fort
          if(E.s>0)mk('line',{x1:E.P.x,y1:E.P.y,x2:E.Q.x,y2:E.Q.y,class:'mepCutLine'});
          mk('line',{x1:E.o.x,y1:E.o.y,x2:E.i.x,y2:E.i.y,class:'mepCutEnd'});
          // flèche à l'équerre venant de l'arrière, pointe au milieu du trait fort (sens du regard),
          // lettre posée sur la flèche, côté extérieur
          const hot=mepSt.cutHov&&mepSt.cutHov.vid===v.id&&mepSt.cutHov.end===E.end;
          mk('line',{x1:E.tail.x,y1:E.tail.y,x2:E.M.x,y2:E.M.y,class:'mepCutArr'+(hot?' mepCutHot':''),'marker-end':'url(#mepArrK)'});
          if(v.label)mk('text',{x:E.lbl.x,y:E.lbl.y+MEP_TEXT_STYLE.lblH/2,class:'mepLbl mepCutLbl','text-anchor':'middle'}).textContent=v.label;
        });
      }
    }
    /* contour de la vue de détail */
    if(v.detail){
      const C=mepToSheet(v,v.detail.cx,v.detail.cy);
      mk('circle',{cx:C.x,cy:C.y,r:v.detail.r*v.scale,class:'mepDetailB'});
    }
    /* marqueur détail sur le parent */
    if(v.detail&&v.parent){
      const par=mepView(sh,v.parent);
      if(par){
        const C=mepToSheet(par,v.detail.cx,v.detail.cy);
        const rr=v.detail.r*par.scale;
        mk('circle',{cx:C.x,cy:C.y,r:rr,class:'mepDetailC'});
        if(v.label)mk('text',{x:C.x+rr*0.75+2,y:C.y-rr*0.75-2,class:'mepLbl','text-anchor':'start'}).textContent=v.label;
      }
    }
        {const tg=mepViewTitleGeo(v);
         if(tg){
           if(mepSt.ttlHov===v.id||(mepSt.pick&&mepSt.pick.kind==='ttlDrag'&&mepSt.pick.vid===v.id))
             mk('rect',{x:tg.x-tg.w/2-1,y:tg.y-tg.h-1,width:tg.w+2,height:tg.h+2.2,class:'mepTtlHov'});
           mk('text',{x:tg.x,y:tg.y,class:'mepLbl','text-anchor':'middle'}).textContent=tg.txt;
         }}
  }
  /* bouts de la ligne de coupe (sur la vue mère) : trait fort, flèche, lettre.
     v.section.sh = [décalage bout A, bout B] en mm papier le long du trait (>0 : vers l'extérieur),
     réglé en tirant sur la flèche. Le trait fort va de +3 à −5 mm autour du bout ; la flèche
     pointe sur son milieu. */
  function mepCutEnds(sh,v){
    const par=v.section&&v.section.a&&v.section.pid?mepView(sh,v.section.pid):null;if(!par)return[];
    const A=mepToSheet(par,v.section.a[0],v.section.a[1]),B0=mepToSheet(par,v.section.b[0],v.section.b[1]);
    const dx=B0.x-A.x,dy=B0.y-A.y,L=Math.hypot(dx,dy)||1,tx=dx/L,ty=dy/L;
    const SP=(Array.isArray(v.section.pts)&&v.section.pts.length>2)?v.section.pts.map(q=>mepToSheet(par,q[0],q[1])):null;
    const B=SP?SP[SP.length-1]:B0;
    const pb=mepBasisOf(par),nd=v.section.n||v.dir;
    let ax=-mepDot(nd,pb.u),ay=-mepDot(nd,pb.v);const La=Math.hypot(ax,ay);
    if(La<1e-6){ax=-ty;ay=tx;}else{ax/=La;ay/=La;}
    const shf=Array.isArray(v.section.sh)?v.section.sh:[0,0],lh=MEP_TEXT_STYLE.lblH,off=lh/2+1.6;
    return[[A,-1,0],[B,1,1]].map(([P,sg,end])=>{
      const s0=+shf[end]||0,ux=tx*sg,uy=ty*sg,Q={x:P.x+ux*s0,y:P.y+uy*s0};
      const o={x:Q.x+ux*3,y:Q.y+uy*3},i={x:Q.x-ux*5,y:Q.y-uy*5},M={x:Q.x-ux,y:Q.y-uy};
      const tail={x:M.x-ax*10,y:M.y-ay*10},lbl={x:M.x-ax*6+ux*off,y:M.y-ay*6+uy*off};
      return{end,P,Q,o,i,M,tail,lbl,s:s0,u:{x:ux,y:uy},a:{x:ax,y:ay},L};
    });
  }
  /* ── édition de la ligne de coupe (brisures) ──
     Points en repère local de la vue mère ; tronçons pairs = plans de coupe (parallèles au 1er),
     impairs = marches à l'équerre. Ajouter une brisure : marche au milieu du dernier plan, la fin
     décalée ; retirer : la dernière marche disparaît, la fin revient sur le plan précédent. */
  function mepCutPts(v){
    const s=v.section;if(!s)return null;
    if(Array.isArray(s.pts)&&s.pts.length>2)return s.pts.map(q=>({x:+q[0],y:+q[1]}));
    return[{x:+s.a[0],y:+s.a[1]},{x:+s.b[0],y:+s.b[1]}];
  }
  function mepCutSetPts(sh,v,P){
    const s=v.section,par=mepView(sh,s.pid);if(!par||P.length<2)return;
    const r4=q=>[+(+q.x).toFixed(4),+(+q.y).toFixed(4)];
    s.a=r4(P[0]);s.b=r4(P[1]);
    if(P.length>2)s.pts=P.map(r4);else delete s.pts;
    const pb=mepBasisOf(par),x=s.a[0],y=s.a[1];
    s.p=[pb.u[0]*x+pb.v[0]*y,pb.u[1]*x+pb.v[1]*y,pb.u[2]*x+pb.v[2]*y]; // plan du 1er tronçon
  }
  /* modèle d'une ligne de coupe : repère (t = sens du 1er tronçon, n = normale), plans de coupe
     c[m] (cote le long de n), marches steps[k] (abscisse le long de t), bouts s0 / sE.
     v.section.refs[m] = lien du plan m : {t:'hole',fid,pid} (axe d'un perçage), {t:'ax',ak}
     (trait d'axe), {t:'edge',c} (arête parallèle, suivie au plus près) — la ligne suit la pièce. */
  function mepCutModel(v){
    const P=mepCutPts(v);if(!P||P.length<2)return null;
    const tl=Math.hypot(P[1].x-P[0].x,P[1].y-P[0].y);if(tl<1e-9)return null;
    const t={x:(P[1].x-P[0].x)/tl,y:(P[1].y-P[0].y)/tl},n={x:-t.y,y:t.x};
    const S=q=>q.x*t.x+q.y*t.y,C=q=>q.x*n.x+q.y*n.y,c=[],steps=[];
    for(let j=0;j+1<P.length;j+=2)c.push(C(P[j]));
    for(let j=1;j+1<P.length;j+=2)steps.push(S(P[j]));
    const refs=Array.isArray(v.section.refs)?v.section.refs.slice(0,c.length):[];
    while(refs.length<c.length)refs.push(null);
    return{t,n,s0:S(P[0]),sE:S(P[P.length-1]),c,steps,refs};
  }
  function mepCutFromModel(sh,v,M){
    const Q=(sv,cv)=>({x:M.t.x*sv+M.n.x*cv,y:M.t.y*sv+M.n.y*cv});
    const P=[Q(M.s0,M.c[0])];
    M.steps.forEach((sv,k)=>{P.push(Q(sv,M.c[k]));P.push(Q(sv,M.c[k+1]));});
    P.push(Q(M.sE,M.c[M.c.length-1]));
    mepCutSetPts(sh,v,P);
    v.section.refs=M.refs.map(r=>r||null);
    if(!v.section.refs.some(Boolean))delete v.section.refs;
  }
  function mepCutBreaks(v){const P=mepCutPts(v);return P?Math.max(0,(P.length-2)/2):0;}
  // repère 3D de la normale n (papier de la vue mère) : sert à savoir si un axe de perçage est dans le plan
  function mepCutN3(par,n){const b=mepBasisOf(par);return[b.u[0]*n.x+b.v[0]*n.y,b.u[1]*n.x+b.v[1]*n.y,b.u[2]*n.x+b.v[2]*n.y];}
  // candidats de lien d'un plan : centres de perçage, traits d'axe, arêtes parallèles à t → {ref,c}
  function mepCutCands(sh,par,M){
    const out=[],b=mepBasisOf(par),n3=mepCutN3(par,M.n);
    if(typeof holeAxis==='function')(doc.features||[]).forEach(f=>{
      if(!f||f.type!=='hole'||f.visible===false)return;
      const sk=(doc.sketches||[]).find(q=>q.id===f.sketchId);if(!sk)return;
      let A=null;try{A=holeAxis(f,sk);}catch(e){return;}
      if(!A||!A.pts||Math.abs(mepDot([A.dir.x,A.dir.y,A.dir.z],n3))>1e-3)return; // axe dans le plan de coupe possible
      A.pts.forEach(P=>{const w=[P.x,P.y,P.z],lx=mepDot(w,b.u),ly=mepDot(w,b.v);
        out.push({ref:{t:'hole',fid:f.id,pid:P.id},c:lx*M.n.x+ly*M.n.y,s:lx*M.t.x+ly*M.t.y});});
    });
    try{mepAxisLines(sh,par).forEach(e=>{if(e.t!=='L'||!e.ak)return;const dx=e.x2-e.x1,dy=e.y2-e.y1,l=Math.hypot(dx,dy)||1;
      if(Math.abs((dx*M.n.x+dy*M.n.y)/l)>1e-3)return;
      out.push({ref:{t:'ax',ak:e.ak},c:e.x1*M.n.x+e.y1*M.n.y});});}catch(e){}
    try{(mepGeoOf(par).els||[]).forEach(e=>{if(!e||e.t!=='L')return;const dx=e.x2-e.x1,dy=e.y2-e.y1,l=Math.hypot(dx,dy)||1;
      if(Math.abs((dx*M.n.x+dy*M.n.y)/l)>1e-3)return;
      const cv=e.x1*M.n.x+e.y1*M.n.y;out.push({ref:{t:'edge',c:+cv.toFixed(4)},c:cv});});}catch(e){}
    return out;
  }
  // cote actuelle d'un lien (null : introuvable — le plan garde sa place)
  function mepCutRefC(sh,par,M,r){
    if(!r)return null;
    if(r.t==='hole'){
      const f=(doc.features||[]).find(x=>x.id===r.fid);if(!f||typeof holeAxis!=='function')return null;
      const sk=(doc.sketches||[]).find(q=>q.id===f.sketchId);if(!sk)return null;
      let A=null;try{A=holeAxis(f,sk);}catch(e){return null;}
      const P=A&&A.pts&&A.pts.find(q=>q.id===r.pid);if(!P)return null;
      const b=mepBasisOf(par),w=[P.x,P.y,P.z];
      return mepDot(w,b.u)*M.n.x+mepDot(w,b.v)*M.n.y;
    }
    if(r.t==='ax'){const e=mepAxisLineByKey(sh,par,r.ak);return e&&e.t==='L'?e.x1*M.n.x+e.y1*M.n.y:null;}
    if(r.t==='edge'){ // arête : la plus proche parallèle (5 mm au plus) — suit les petits déplacements
      let best=null;mepCutCands(sh,par,M).forEach(q=>{if(q.ref.t!=='edge')return;const d=Math.abs(q.c-r.c);if(d<5&&(!best||d<best.d))best={d,c:q.c};});
      return best?best.c:null;
    }
    return null;
  }
  // lien posé sur un plan qui passe déjà par un centre / un axe / une arête (création, glissement)
  function mepCutAutoRefs(sh,v){
    const par=mepView(sh,v.section&&v.section.pid),M=par&&mepCutModel(v);if(!M)return;
    let cands=null;
    M.c.forEach((cv,m)=>{
      if(M.refs[m])return;
      cands=cands||mepCutCands(sh,par,M);
      const lo=m===0?M.s0:M.steps[m-1],hi=m===M.c.length-1?M.sE:M.steps[m],a=Math.min(lo,hi),b=Math.max(lo,hi);
      const on=cands.filter(q=>Math.abs(q.c-cv)<0.05);
      const pick=on.find(q=>q.ref.t==='hole'&&q.s>=a-0.05&&q.s<=b+0.05)||on.find(q=>q.ref.t==='hole')||on.find(q=>q.ref.t==='ax')||on.find(q=>q.ref.t==='edge');
      if(pick)M.refs[m]=pick.ref;
    });
    mepCutFromModel(sh,v,M);
  }
  // la ligne suit ses liens (perçage déplacé, esquisse modifiée…) — appelé à chaque rendu
  function mepCutFollowAll(sh){
    sh.views.forEach(v=>{
      if(v.kind!=='section'||!v.section||!Array.isArray(v.section.refs))return;
      const par=mepView(sh,v.section.pid),M=par&&mepCutModel(v);if(!M)return;
      let ch=false;
      M.refs.forEach((r,m)=>{const cv=mepCutRefC(sh,par,M,r);if(cv!=null&&Math.abs(cv-M.c[m])>1e-4){M.c[m]=cv;ch=true;if(r.t==='edge')r.c=+cv.toFixed(4);}});
      if(ch)mepCutFromModel(sh,v,M);
    });
  }
  function mepCutAddBreak(sh,v){
    const M=mepCutModel(v);if(!M)return false;
    const m=M.c.length-1,lo=m?M.steps[m-1]:M.s0,L=Math.abs(M.sE-lo);if(L<1e-6)return false;
    M.steps.push((lo+M.sE)/2);M.c.push(M.c[m]+Math.max(2,L/4));M.refs.push(null);
    mepCutFromModel(sh,v,M);mepCutAutoRefs(sh,v);
    return true;
  }
  function mepCutDelBreak(sh,v){
    const M=mepCutModel(v);if(!M||!M.steps.length)return false;
    M.steps.pop();M.c.pop();M.refs.pop();
    mepCutFromModel(sh,v,M);
    return true;
  }
  // brisure en tirant : le morceau du plan m situé après sG part sur le plan cNew (lien ref)
  function mepCutBreakAt(sh,v,m,sG,cNew,ref){
    const M=mepCutModel(v);if(!M)return false;
    const lo=m?M.steps[m-1]:M.s0,hi=m===M.c.length-1?M.sE:M.steps[m];
    if((sG-lo)*(hi-sG)<=0||Math.abs(cNew-M.c[m])<1e-6)return false;
    M.steps.splice(m,0,sG);M.c.splice(m+1,0,cNew);M.refs.splice(m+1,0,ref||null);
    mepCutFromModel(sh,v,M);
    return true;
  }
  /* 2026-10-22-006 : souris inversée sur la ligne de coupe (« quand j'attrape, je déplace ;
     Ctrl + clic je brise ; Maj + clic j'enlève une brisure à la position du curseur »).
     Ctrl + clic sans tirer : le morceau après le curseur part d'un décalage par défaut. */
  function mepCutBreakClick(sh,v,m,sG){
    const M=mepCutModel(v),par=mepView(sh,v.section&&v.section.pid);if(!M||!par)return false;
    const hi=m===M.c.length-1?M.sE:M.steps[m];
    const L=Math.abs(hi-sG),dc=Math.max(2,Math.min(10/par.scale,L/2));
    return mepCutBreakAt(sh,v,m,sG,M.c[m]+dc,null);
  }
  // retire la brisure (marche) la plus proche du curseur : j = tronçon cliqué, sG = abscisse du clic
  function mepCutDelBreakAt(sh,v,j,sG){
    const M=mepCutModel(v);if(!M||!M.steps.length)return false;
    let k,keepAfter;
    if(j%2){k=(j-1)/2;keepAfter=false;} // marche cliquée : le plan d'avant continue
    else{
      const m=j/2,kb=m-1,ka=m; // marches avant / après le plan cliqué
      const db=kb>=0?Math.abs(M.steps[kb]-sG):Infinity,da=ka<M.steps.length?Math.abs(M.steps[ka]-sG):Infinity;
      if(db<=da){k=kb;keepAfter=true;}else{k=ka;keepAfter=false;} // le plan cliqué reste
    }
    if(!(k>=0&&k<M.steps.length))return false;
    const drop=keepAfter?k:k+1;
    M.steps.splice(k,1);M.c.splice(drop,1);M.refs.splice(drop,1);
    mepCutFromModel(sh,v,M);
    return true;
  }
  // tronçon de ligne de coupe sous le pointeur (vue mère) : {v,j,par} — j pair = plan, impair = marche
  function mepCutSegAt(sh,px,py){
    const tol=1.5/(mepSt.zoom||1)+0.4;
    for(let k=sh.views.length-1;k>=0;k--){const v=sh.views[k];
      if(v.kind!=='section'||!v.section||!v.section.pid)continue;
      const par=mepView(sh,v.section.pid),P=par&&mepCutPts(v);if(!P)continue;
      const S=P.map(q=>mepToSheet(par,q.x,q.y));
      for(let j=0;j+1<S.length;j++){
        const ax=S[j].x,ay=S[j].y,vx=S[j+1].x-ax,vy=S[j+1].y-ay,l2=vx*vx+vy*vy||1;
        const t=Math.max(0,Math.min(1,((px-ax)*vx+(py-ay)*vy)/l2));
        if(Math.hypot(px-(ax+vx*t),py-(ay+vy*t))<=tol)return{v,j,par};
      }}
    return null;
  }
  function mepCutArrowAt(sh,px,py){
    const tol=2/(mepSt.zoom||1)+0.6;
    for(let k=sh.views.length-1;k>=0;k--){const v=sh.views[k];if(v.kind!=='section'||!v.section)continue;
      for(const E of mepCutEnds(sh,v)){
        const vx=E.M.x-E.tail.x,vy=E.M.y-E.tail.y,l2=vx*vx+vy*vy||1,t=Math.max(0,Math.min(1,((px-E.tail.x)*vx+(py-E.tail.y)*vy)/l2));
        const dS=Math.hypot(px-(E.tail.x+vx*t),py-(E.tail.y+vy*t)),dL=Math.hypot(px-E.lbl.x,py-E.lbl.y);
        if(dS<=tol||dL<=MEP_TEXT_STYLE.lblH*0.8)return{v,end:E.end,E};
      }}
    return null;
  }
  /* titre de vue (COUPE A-A, DÉTAIL B…) : centré sur l'axe vertical de la vue (milieu de
     son encombrement), dessous ou dessus ; seul l'écart se règle à la souris (v.ttl). */
  function mepViewTitleText(v){
    if(!v.label)return '';
    if(v.kind==='section')return 'COUPE '+v.label+'-'+v.label;
    if(v.kind==='detail'){
      const s=v.scale>=1?(mepFmtNum(v.scale,2)+':1'):('1:'+mepFmtNum(1/v.scale,2));
      return 'DÉTAIL '+v.label+' ('+s+')';
    }
    return v.label;
  }
  function mepViewTitleGeo(v){
    const txt=mepViewTitleText(v);if(!txt)return null;
    const bb=mepViewSheetBBox(v);if(!bb)return null;
    const lh=MEP_TEXT_STYLE.lblH,t=v.ttl||{},gap=Number.isFinite(+t.gap)?+t.gap:5;
    const x=bb.x+bb.w/2,y=t.side==='above'?bb.y-gap:bb.y+bb.h+gap+lh; // y = ligne de base
    return{x,y,w:txt.length*mepFs(lh)*0.64,h:lh,txt,bb};
  }
  function mepViewTitleAt(sh,px,py){
    const tol=1.5/(mepSt.zoom||1);
    for(let i=sh.views.length-1;i>=0;i--){const v=sh.views[i],g=mepViewTitleGeo(v);
      if(g&&Math.abs(px-g.x)<=g.w/2+tol&&py>=g.y-g.h-tol&&py<=g.y+tol+0.8)return v;}
    return null;
  }
  /* 2026-10-22-005 : HACHURES réglables (« en double-cliquant sur une hachure, une fenêtre
     propose d'autres hachures, angle, échelle et couleur ; à la validation toutes les coupes
     changent ») — doc.mep.hatch = {pat, ang, sc, col}, commun à TOUTES les coupes du document.
     Motifs : familles de traits [décalage d'angle °, × pas, phase (fraction du pas), tireté
     (mm papier) | null] ; pas de base 2,5 mm papier × échelle. Défaut = ISO 128-50 général
     45° : rendu identique à l'historique. */
  const MEP_HATCH_PATS=[
    ['iso','Usage général (ISO 128-50)',[[0,1,0,null]]],
    ['acier','Acier — traits doubles',[[0,2,0,null],[0,2,0.2,null]]],
    ['cuivre','Cuivre, bronze — trait + tireté',[[0,2,0,null],[0,2,0.5,'1.6 0.8']]],
    ['alu','Alliages légers — quadrillé',[[0,1,0,null],[90,1,0,null]]],
    ['plast','Plastique, caoutchouc — tireté',[[0,1,0,'2 1']]],
    ['plein','Plein (section mince)',null]];
  function mepHatchCfg(){
    const h=(doc.mep&&doc.mep.hatch)||{};
    const pat=MEP_HATCH_PATS.some(p=>p[0]===h.pat)?h.pat:'iso';
    const ang=isFinite(+h.ang)&&h.ang!==null&&h.ang!==''?((+h.ang%180)+180)%180:45;
    const sc=(+h.sc>0)?Math.min(10,Math.max(0.1,+h.sc)):1;
    const col=(typeof h.col==='string'&&/^#[0-9a-f]{6}$/i.test(h.col))?h.col:'';
    return{pat,ang,sc,col};
  }
  function mepHatchLines(loops,deg,sp,phase){
    /* rotation puis scanline pair-impair (trous inclus) */
    const t=deg*Math.PI/180,c=Math.cos(t),s=Math.sin(t);
    const rot=p=>[p[0]*c-p[1]*s,p[0]*s+p[1]*c];
    const unrot=q=>[q[0]*c+q[1]*s,-q[0]*s+q[1]*c];
    const RL=loops.map(l=>l.map(rot));
    let miny=1e9,maxy=-1e9;
    RL.forEach(l=>l.forEach(p=>{miny=Math.min(miny,p[1]);maxy=Math.max(maxy,p[1]);}));
    const lines=[],ph=(phase||0)*sp;
    for(let y=Math.ceil((miny-ph)/sp)*sp+ph;y<=maxy;y+=sp){
      const xs=[];
      RL.forEach(l=>{
        for(let i=0;i<l.length;i++){
          const a=l[i],b=l[(i+1)%l.length];
          if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y)){
            xs.push(a[0]+(y-a[1])/(b[1]-a[1])*(b[0]-a[0]));
          }
        }
      });
      xs.sort((p,q)=>p-q);
      for(let i=0;i+1<xs.length;i+=2){
        if(xs[i+1]-xs[i]>0.2)lines.push([unrot([xs[i],y]),unrot([xs[i+1],y])]);
      }
    }
    return lines;
  }
  function mepDrawHatch(mk,loops,v,cfg){
    if(!loops.length)return;
    const H=cfg||mepHatchCfg();
    const st=H.col?(H.pat==='plein'?'fill:':'stroke:')+H.col:null;
    const P=MEP_HATCH_PATS.find(p=>p[0]===H.pat)||MEP_HATCH_PATS[0];
    if(!P[2]){ // plein : boucles remplies (pair-impair, trous inclus)
      const d=loops.map(l=>'M'+l.map(p=>(+(v.x+p[0]*v.scale).toFixed(3))+' '+(+(v.y+p[1]*v.scale).toFixed(3))).join(' L')+' Z').join(' ');
      const at={d:d,'fill-rule':'evenodd',class:'mepHatch mepHatchFill'};if(st)at.style=st;
      mk('path',at);return;
    }
    const sp0=2.5*H.sc/v.scale; // 2,5 mm papier × échelle
    P[2].forEach(F=>{
      mepHatchLines(loops,H.ang+F[0],sp0*F[1],F[2]).forEach(ln=>{
        const at={x1:+(v.x+ln[0][0]*v.scale).toFixed(3),y1:+(v.y+ln[0][1]*v.scale).toFixed(3),
          x2:+(v.x+ln[1][0]*v.scale).toFixed(3),y2:+(v.y+ln[1][1]*v.scale).toFixed(3),class:'mepHatch'};
        if(F[3])at['stroke-dasharray']=F[3];
        if(st)at.style=st;
        mk('line',at);
      });
    });
  }
  function mepHatchAt(sh,px,py){
    // vue en coupe dont une zone hachurée contient le point (pair-impair sur les boucles)
    for(let k=sh.views.length-1;k>=0;k--){
      const v=sh.views[k];if(!v||!v.section)continue;
      let g=null;try{g=mepGeoOf(v);}catch(e){}
      if(!g||!g.hatch||!g.hatch.length)continue;
      const x=(px-v.x)/v.scale,y=(py-v.y)/v.scale;
      let inside=false;
      g.hatch.forEach(l=>{for(let i=0,j=l.length-1;i<l.length;j=i++){
        const a=l[i],b=l[j];
        if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}});
      if(inside)return v;
    }
    return null;
  }
  let mepHatchDlgEl=null;
  function mepHatchDialog(){
    // fenêtre : motif, angle, échelle, couleur — aperçu en direct, validé pour TOUTES les coupes
    if(mepHatchDlgEl){try{mepHatchDlgEl.remove();}catch(e){}}
    const w=Object.assign({},mepHatchCfg());
    const box=document.createElement('div');mepHatchDlgEl=box;box.id='mepHatchDlg';
    box.style.cssText='position:fixed;z-index:10001;left:50%;top:50%;transform:translate(-50%,-50%);width:320px;padding:12px 14px;'
      +'border:1px solid var(--border,#3a3a3e);border-radius:10px;background:var(--surface,#222);color:var(--text,#eee);'
      +'box-shadow:0 12px 32px rgba(0,0,0,.5);font:12px sans-serif';
    const h=document.createElement('div');h.textContent='Hachures des coupes';h.style.cssText='font-weight:600;font-size:13px;margin-bottom:8px';box.appendChild(h);
    const NS='http://www.w3.org/2000/svg';
    const prev=document.createElementNS(NS,'svg');prev.setAttribute('viewBox','0 0 60 30');
    prev.style.cssText='width:100%;height:90px;background:#fff;border-radius:6px;margin-bottom:8px;display:block';
    box.appendChild(prev);
    const draw=()=>{
      while(prev.firstChild)prev.removeChild(prev.firstChild);
      const mk=(tag,at)=>{const el=document.createElementNS(NS,tag);for(const k in at)el.setAttribute(k,at[k]);
        if(!at.style)el.setAttribute('style',tag==='path'?'fill:#333':'stroke:#333');
        if(tag==='line')el.setAttribute('stroke-width','0.35');prev.appendChild(el);return el;};
      const loop=[[2,2],[58,2],[58,28],[2,28]],hole=[[22,9],[38,9],[38,21],[22,21]];
      mepDrawHatch(mk,[loop,hole],{x:0,y:0,scale:1},w);
      const fr=document.createElementNS(NS,'path');fr.setAttribute('d','M2 2 H58 V28 H2 Z M22 9 H38 V21 H22 Z');
      fr.setAttribute('style','fill:none;stroke:#111;stroke-width:.7');prev.appendChild(fr);
    };
    const row=(lab,el)=>{const r=document.createElement('label');r.style.cssText='display:flex;align-items:center;gap:8px;margin:5px 0';
      const s=document.createElement('span');s.textContent=lab;s.style.cssText='width:70px;color:var(--muted,#aaa)';r.appendChild(s);
      el.style.flex='1';r.appendChild(el);box.appendChild(r);return el;};
    const sP=document.createElement('select');sP.id='mepHatchPat';
    MEP_HATCH_PATS.forEach(p=>{const o=document.createElement('option');o.value=p[0];o.textContent=p[1];sP.appendChild(o);});
    sP.value=w.pat;sP.onchange=()=>{w.pat=sP.value;draw();};row('Motif',sP);
    const num=(id,val,step,fn)=>{const i=document.createElement('input');i.type='number';i.id=id;i.value=String(val);i.step=String(step);
      i.oninput=()=>{const v=parseFloat(i.value);if(isFinite(v))fn(v);draw();};return i;};
    row('Angle (°)',num('mepHatchAng',w.ang,15,v=>{w.ang=v;}));
    row('Échelle',num('mepHatchSc',w.sc,0.25,v=>{if(v>0)w.sc=Math.min(10,Math.max(0.1,v));}));
    const cw=document.createElement('div');cw.style.cssText='display:flex;align-items:center;gap:6px';
    const cI=document.createElement('input');cI.type='color';cI.id='mepHatchCol';cI.value=w.col||'#333333';cI.style.cssText='width:40px;height:22px;padding:0;border:0;background:none';
    const cD=document.createElement('label');const cB=document.createElement('input');cB.type='checkbox';cB.id='mepHatchColDef';cB.checked=!w.col;
    cD.appendChild(cB);cD.appendChild(document.createTextNode(' couleur du thème'));
    cI.oninput=()=>{w.col=cI.value;cB.checked=false;draw();};
    cB.onchange=()=>{w.col=cB.checked?'':cI.value;draw();};
    cw.appendChild(cI);cw.appendChild(cD);row('Couleur',cw);
    const bt=document.createElement('div');bt.style.cssText='display:flex;justify-content:flex-end;gap:8px;margin-top:10px';
    const close=()=>{try{box.remove();}catch(e){}if(mepHatchDlgEl===box)mepHatchDlgEl=null;};
    const bC=document.createElement('button');bC.type='button';bC.textContent='Annuler';bC.onclick=close;
    const bO=document.createElement('button');bO.type='button';bO.id='mepHatchOk';bO.textContent='Valider';
    bO.onclick=()=>{close();mepHatchApply(w);};
    bt.appendChild(bC);bt.appendChild(bO);box.appendChild(bt);
    box.addEventListener('keydown',e=>{if(e.key==='Escape'){close();e.stopPropagation();}else if(e.key==='Enter'){bO.click();e.preventDefault();}});
    document.body.appendChild(box);draw();try{sP.focus();}catch(e){}
    return box;
  }
  function mepHatchApply(cfg){
    mepEnsure();
    mepEdit('hachures',()=>{doc.mep.hatch={pat:cfg.pat,ang:cfg.ang,sc:cfg.sc,col:cfg.col||''};});
    const H=mepHatchCfg(),P=MEP_HATCH_PATS.find(p=>p[0]===H.pat);
    mepStatus('Hachures : '+(P?P[1]:H.pat)+(H.pat==='plein'?'':' · '+H.ang+'° · échelle '+H.sc)+' — toutes les coupes.');
    mepRender();
  }
  /* ═══════════════ O. cotes : mesure, texte, rendu ═══════════════ */
  /* 2026-10-22-019 : « les cotes, normales et d'ordonnées, ne suivent pas les axes (alignement),
     elles perdent leurs références » — un point accroché à un trait d'axe garde la référence
     {t:'axp', ak, f} (clé de l'axe, position le long de son trait d'origine) ou {t:'axc', ak}
     (centre d'un cercle de perçage) ; il est recalculé à chaque dessin. Un point SANS référence
     posé pile sur un axe manuel de la bonne direction s'y rattache (cotes d'avant V0.3.29). */
  function mepAxisRefOf(sh,v,q,ak){
    const e=mepAxisLineByKey(sh,v,ak);if(!e)return null;
    if(e.t==='C'||e.t==='A')return{t:'axc',ak};
    const x1=e.bx1!=null?e.bx1:e.x1,y1=e.by1!=null?e.by1:e.y1,x2=e.bx2!=null?e.bx2:e.x2,y2=e.by2!=null?e.by2:e.y2;
    const dx=x2-x1,dy=y2-y1,L2=dx*dx+dy*dy;if(!(L2>1e-12))return null;
    return{t:'axp',ak,f:((q.x-x1)*dx+(q.y-y1)*dy)/L2};
  }
  const mepNoAx=new WeakSet();
  function mepPtRefresh(sh,v,q,pref){
    // pref : 'v' (axe vertical voulu), 'h' (horizontal), null (indifférent) — pour la migration
    if(!q||!v)return q;
    const h=q.hint;
    if(h&&h.t==='eln'&&h.l){
      const g=mepGeoOf(v);if(!mepGeoExact(g))return q; // jamais sur le maillage de l'ouverture
      const e=mepAxisTrackLine(g,h.l,null);if(!e)return q;
      h.l={x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2,k:e.k};
      q.x=e.x1+(e.x2-e.x1)*h.f;q.y=e.y1+(e.y2-e.y1)*h.f;
      return q;
    }
    if(h&&(h.t==='axp'||h.t==='axc')){
      const e=mepAxisLineByKey(sh,v,h.ak);if(!e)return q; // axe disparu : dernière position connue
      if(h.t==='axc'){if(e.cx!=null){q.x=e.cx;q.y=e.cy;}return q;}
      const x1=e.bx1!=null?e.bx1:e.x1,y1=e.by1!=null?e.by1:e.y1,x2=e.bx2!=null?e.bx2:e.x2,y2=e.by2!=null?e.by2:e.y2;
      q.x=x1+(x2-x1)*h.f;q.y=y1+(y2-y1)*h.f;
      return q;
    }
    if(h||mepNoAx.has(q)||!mepGeoExact(mepGeoOf(v)))return q;
    // migration : point libre posé pile sur un axe MANUEL (clé « m… », stable) ou une arête de la
    // pièce, de la bonne direction — d'abord ce qui passe PAR le point (sur le trait), le plus long
    const dirOk=(dx,dy)=>!(pref==='v'&&Math.abs(dx)>Math.abs(dy)*0.05)&&!(pref==='h'&&Math.abs(dy)>Math.abs(dx)*0.05);
    const on=(e,dx,dy,L)=>{
      if(Math.abs((q.x-e.x1)*dy-(q.y-e.y1)*dx)/L>=0.02)return -1;
      const f=((q.x-e.x1)*dx+(q.y-e.y1)*dy)/(L*L);return f>=-0.02&&f<=1.02?2:1; // 2 = sur le trait
    };
    let best=null,bs=-1;
    mepAxisLines(sh,v).forEach(e=>{
      if(!e.ak||e.ak[0]!=='m')return;
      if(e.t==='C'){if(!pref&&Math.hypot(q.x-e.cx,q.y-e.cy)<0.02&&bs<3){bs=3;best=mepAxisRefOf(sh,v,q,e.ak);}return;}
      if(e.t!=='L')return;
      const dx=e.x2-e.x1,dy=e.y2-e.y1,L=Math.hypot(dx,dy);if(!(L>1e-9)||!dirOk(dx,dy))return;
      const k=on(e,dx,dy,L);if(k<0)return;
      const sc=k+Math.min(0.9,L/1000); // sur le trait d'abord, puis le plus long
      if(sc>bs){bs=sc;best=mepAxisRefOf(sh,v,q,e.ak);}
    });
    if(!best){ // arête de la pièce (suivie comme les droites d'un axe de symétrie)
      let be=null,bl=0;
      (mepGeoOf(v).els||[]).forEach(e=>{
        if(e.t!=='L')return;
        const dx=e.x2-e.x1,dy=e.y2-e.y1,L=Math.hypot(dx,dy);if(!(L>1e-6)||!dirOk(dx,dy))return;
        if(on(e,dx,dy,L)===2&&L>bl){bl=L;be=e;}
      });
      if(be)best=mepEdgeRefOf(be,q);
    }
    if(best)q.hint=best;else mepNoAx.add(q); // une seule recherche par point (mémoire, jamais enregistré)
    return q;
  }
  function mepEdgeRefOf(e,q){
    const dx=e.x2-e.x1,dy=e.y2-e.y1,L2=dx*dx+dy*dy;
    return{t:'eln',l:{x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2,k:e.k},f:L2>1e-12?((q.x-e.x1)*dx+(q.y-e.y1)*dy)/L2:0};
  }
  function mepDimPtsRefresh(sh,d){
    const v1=mepView(sh,d.vid);if(!v1)return;
    if(d.kind==='ord'){
      const pr=d.axis==='y'?'h':'v';
      mepPtRefresh(sh,v1,d.o,pr);d.a=d.b=d.o;(d.pts||[]).forEach(q=>mepPtRefresh(sh,v1,q,pr));
      return;
    }
    if(d.kind!=='dist'&&d.kind!=='note')return;
    const pr=d.kind==='dist'?(d.orient==='h'?'v':(d.orient==='v'?'h':null)):null;
    if(d.kind==='dist'&&!pr)return; // distance oblique : pas de migration ambiguë (les références posées restent suivies)
    mepPtRefresh(sh,v1,d.a,pr);
    if(d.kind==='dist'&&d.b)mepPtRefresh(sh,d.vid2?mepView(sh,d.vid2):v1,d.b,pr);
  }
  function mepDimWorld(sh,d){
    // ancrages → mm papier
    const v1=mepView(sh,d.vid);
    if(!v1)return null;
    try{mepDimPtsRefresh(sh,d);}catch(e){} // points accrochés aux traits d'axe : suivent l'axe
    // longueur d'un trait d'axe : suit son allongement (2026-10-22-013)
    if(d.kind==='len'&&!d.vid2&&d.a&&d.a.hint&&typeof d.a.hint.i==='string'){
      const e=mepEntByHint(v1,d.a.hint);
      if(e&&e.t==='L'){d.a={x:e.x1,y:e.y1,hint:d.a.hint};d.b={x:e.x2,y:e.y2};}
    }
    const a=mepToSheet(v1,d.a.x,d.a.y);
    let b=a;
    if(d.vid2){
      const v2=mepView(sh,d.vid2);
      if(!v2)return null;
      b=mepToSheet(v2,d.b.x,d.b.y);
    }else b=mepToSheet(v1,d.b?d.b.x:d.a.x,d.b?d.b.y:d.a.y);
    return{a,b,v1,v2:d.vid2?mepView(sh,d.vid2):null};
  }
  // Angle (degrés) entre deux directions, dans [0,180] — même valeur que l'arc dessiné
  // par mepDrawDim (dd normalisé sur (−π,π]). Ne PAS replier à 90° : un angle obtus
  // (p. ex. 120°) doit s'afficher 120°, pas 60°.
  function mepAngleDeg(d1,d2){
    let a=Math.abs((d2-d1)*180/Math.PI)%360;
    if(a>180)a=360-a;
    return a;
  }
  function mepDimMeasure(sh,d){
    // Valeurs en mm MODÈLE : les ancres (d.a/d.b) sont déjà en coordonnées modèle,
    // et les éléments de géométrie le sont aussi. Ne PAS multiplier par view.scale
    // (ce serait des mm papier → cote fausse dès que l'échelle ≠ 1:1).
    const w=mepDimWorld(sh,d);
    if(!w)return 0;
    const o=d.orient||'a';
    const oriented=(A,B)=>o==='h'?Math.abs(B.x-A.x):o==='v'?Math.abs(B.y-A.y):Math.hypot(B.x-A.x,B.y-A.y);
    const modelDist=()=>d.b?oriented(d.a,d.b):0;
    switch(d.kind){
      case 'len':{
        const e=mepEntByHint(w.v1,d.a.hint);
        if(e&&e.t==='L')return oriented({x:e.x1,y:e.y1},{x:e.x2,y:e.y2});
        return modelDist();
      }
      case 'dist':return modelDist();
      case 'rad':{const e=mepEntByHint(w.v1,d.a.hint);return e&&(e.t==='C'||e.t==='A')?e.r:modelDist();}
      case 'dia':{const e=mepEntByHint(w.v1,d.a.hint);return e&&(e.t==='C'||e.t==='A')?2*e.r:2*modelDist();}
      case 'ang':{
        const e1=d.a.hint?mepEntByHint(w.v1,d.a.hint):null;
        const e2=d.b&&d.b.hint?mepEntByHint(d.vid2?w.v2:w.v1,d.b.hint):null;
        if(e1&&e1.t==='L'&&e2&&e2.t==='L'){
          const d1=Math.atan2(e1.y2-e1.y1,e1.x2-e1.x1),d2=Math.atan2(e2.y2-e2.y1,e2.x2-e2.x1);
          return mepAngleDeg(d1,d2);
        }
        const a1=Math.atan2(w.a.y-(w.b?w.b.y:w.a.y),w.a.x-(w.b?w.b.x:w.a.x));
        return Math.abs(a1*180/Math.PI);
      }
      default:return Math.hypot(w.b.x-w.a.x,w.b.y-w.a.y);
    }
  }
  function mepEntByHint(view,hint){
    if(!view||!hint)return null;
    if(typeof hint.i==='string'&&hint.i.indexOf('ax:')===0){ // trait d'axe (2026-10-22-013)
      const sh=mepSheetOfView(view);
      return sh?mepAxisLineByKey(sh,view,hint.i.slice(3)):null;
    }
    const g=mepGeoOf(view);
    return g.els[hint.i]||null;
  }
  function mepHoleFeatureText(f){
    if(!f||f.type!=='hole'||typeof holeNorm!=='function')return '';
    const N=holeNorm(f);
    const fr=v=>mepFmtNum(v,2);
    const sk=(typeof doc!=='undefined'&&doc.sketches)?doc.sketches.find(s=>s.id===f.sketchId):null;
    let A=null;
    try{if(sk&&typeof holeAxis==='function')A=holeAxis(f,sk);}catch(e){A=null;}
    const P=A&&A.pts&&A.pts[0]?A.pts[0]:null;
    const holeDepth=()=>{
      if(N.end==='through'||N.end==='next')return'déb.';
      if(N.end==='upto'){
        if(P&&A&&typeof holePlaneDist==='function'){
          const t=holePlaneDist(f.uptoPlane,P,A.dir);
          if(t!=null&&isFinite(t))return'↧'+fr(t);
        }
        return'↧ face';
      }
      return'↧'+fr(N.depth);
    };
    const threadDepth=()=>{
      const m=f.thread.lenMode||'len';
      const eff=+f._thLen||+f.thread.len||0;
      if(m==='through')return'déb.';
      if(m==='next')return'déb.';
      if(m==='upto'){
        if(P&&A&&typeof holePlaneDist==='function'){
          const t=holePlaneDist(f.thread.uptoPlane,P,A.dir);
          if(t!=null&&isFinite(t))return'↧'+fr(t);
        }
        return'↧ face';
      }
      return'↧'+fr(eff||N.depth);
    };
    const lines=[];
    if(f.thread&&f.thread.size){
      lines.push(holeThreadLabel(f.thread)+' '+threadDepth());
      lines.push('Ø'+fr(N.d)+' '+holeDepth());
    }else{
      lines.push('Ø'+fr(N.d)+' '+holeDepth());
    }
    if(N.kind==='cbore')lines.push('Lamage Ø'+fr(N.cbD)+' ↧'+fr(N.cbH));
    if(N.kind==='csink')lines.push('Fraisure Ø'+fr(N.csD)+' x '+fr(N.csA)+'°');
    return lines.join('\n');
  }
  function mepHoleAt(sh,vid,e,i){
    if(!e||e.t!=='C')return null;
    const v=mepView(sh,vid);if(!v)return null;
    if(typeof holeAxis!=='function'||typeof holeNorm!=='function'||typeof doc==='undefined')return null;
    const b=mepBasisOf(v),u=b.u,vv=b.v,dir=b.dir;
    let best=null;
    (doc.features||[]).forEach(f=>{
      if(!f||f.type!=='hole'||f.visible===false)return;
      const sk=(doc.sketches||[]).find(s=>s.id===f.sketchId);if(!sk)return;
      let A=null,N=null;
      try{A=holeAxis(f,sk);N=holeNorm(f);}catch(err){return;}
      if(!A||!A.pts||!A.pts.length||!A.dir)return;
      const ad=[A.dir.x,A.dir.y,A.dir.z];
      if(Math.abs(mepDot(ad,dir))<0.999)return;
      const rs=[N.d/2];
      if(N.kind==='cbore')rs.push(N.cbD/2);
      if(N.kind==='csink')rs.push(N.csD/2);
      if(f.thread&&f.thread.model&&typeof isoHoleThread==='function'){
        const th=isoHoleThread(f.thread.size,f.thread.p,f.thread.clear);
        if(th)rs.push(th.D/2,th.D1/2+th.c);
      }
      const rTol=Math.max(0.18,e.r*0.03);
      if(!rs.some(r=>Math.abs(e.r-r)<=rTol))return;
      A.pts.forEach(P=>{
        const wp=[P.x,P.y,P.z];
        const lx=mepDot(wp,u),ly=mepDot(wp,vv);
        const dc=Math.hypot(lx-e.cx,ly-e.cy);
        if(dc>0.4)return;
        const dr=Math.min.apply(null,rs.map(r=>Math.abs(e.r-r)));
        const score=dc+dr*0.5;
        if(!best||score<best.score)best={f:f,N:N,A:A,P:P,view:v,i:i,score:score};
      });
    });
    return best;
  }
  // famille d'un perçage : la fonction elle-même, ou sa répétition (base + instances) à
  // spécification égale — les instances d'une répétition sont des fonctions Perçage à part
  function mepHoleFam(f){
    if(!f)return '';
    const rp=(doc.features||[]).find(r=>r&&r.type==='repeat'&&(f.repeatId===r.id||(r.base||[]).indexOf(f.id)>=0));
    return rp?'rp:'+rp.id+'|'+mepHoleFeatureText(f):f.id;
  }
  // nombre de trous de la famille vus de bout dans la vue (un par axe, cercles de lamage /
  // fraisure / filetage confondus) ; mémorisé par géométrie de vue
  const mepHoleNCache=new WeakMap();
  function mepHoleCount(sh,v,fam){
    let g=null;try{g=mepGeoOf(v);}catch(e){return 0;}
    if(!g||!g.els)return 0;
    let C=mepHoleNCache.get(g);if(!C){C=new Map();mepHoleNCache.set(g,C);}
    if(C.has(fam))return C.get(fam);
    const pts=new Set();
    g.els.forEach((e,i)=>{
      if(!e||e.t!=='C')return;
      let m=null;try{m=mepHoleAt(sh,v.id,e,i);}catch(err){}
      if(m&&mepHoleFam(m.f)===fam)pts.add([m.P.x,m.P.y,m.P.z].map(q=>(+q).toFixed(3)).join(','));
    });
    C.set(fam,pts.size);
    return pts.size;
  }
  function mepHoleDraft(sh,vid,e,i,lx,ly){
    const m=mepHoleAt(sh,vid,e,i);
    if(!m)return null;
    const hn=mepHoleCount(sh,m.view,mepHoleFam(m.f));
    const b={x:e.cx+e.r*0.9,y:e.cy-e.r*0.9};
    if(lx!=null&&ly!=null)b={x:lx,y:ly};
    return{kind:'hole',vid:vid,vid2:null,a:{x:e.cx,y:e.cy,hint:{t:'ctr',i:i}},
      b:b,off:0,holeFid:m.f.id,holeText:mepHoleFeatureText(m.f),holeN:hn>1?hn:undefined,__ghost:true,tol:null};
  }
  function mepAxisScale(v){return Math.max(1e-9,(v&&+v.scale>0)?+v.scale:1);}
  function mepAxisKey(h){const id=(h&&h.fid||'')+'|'+(h&&h.pid||'');return id!=='|'?id:(+h.x).toFixed(3)+','+(+h.y).toFixed(3);}
  function mepAxisSameDia(a,b){const tol=Math.max(0.05,Math.max(a.r,b.r)*0.05);return Math.abs(a.r-b.r)<=tol;}
  function mepAxisFitCircle(pts){
    if(!pts||pts.length<3)return null;
    let n=0,sx=0,sy=0,sxx=0,syy=0,sxy=0,sx3=0,sy3=0,s2=0;
    pts.forEach(p=>{
      const x=+p.x,y=+p.y;if(!Number.isFinite(x)||!Number.isFinite(y))return;
      n++;sx+=x;sy+=y;sxx+=x*x;syy+=y*y;sxy+=x*y;
      sx3+=x*(x*x+y*y);sy3+=y*(x*x+y*y);s2+=x*x+y*y;
    });
    if(n<3)return null;
    const m=[[sxx,sxy,sx],[sxy,syy,sy],[sx,sy,n]];
    const det=a=>a[0][0]*(a[1][1]*a[2][2]-a[1][2]*a[2][1])
      -a[0][1]*(a[1][0]*a[2][2]-a[1][2]*a[2][0])
      +a[0][2]*(a[1][0]*a[2][1]-a[1][1]*a[2][0]);
    const D=det(m);if(Math.abs(D)<1e-9)return null;
    const col=(i,val)=>m.map((row,r)=>row.map((x,c)=>c===i?val[r]:x));
    const b=[-sx3,-sy3,-s2];
    const A=det(col(0,b))/D,B=det(col(1,b))/D,C=det(col(2,b))/D;
    const cx=-A/2,cy=-B/2,r2=cx*cx+cy*cy-C;
    if(!(r2>1e-9))return null;
    return{cx,cy,r:Math.sqrt(r2)};
  }
  function mepAxisCircle3(a,b,c){
    const ax=+a.x,ay=+a.y,bx=+b.x,by=+b.y,cx=+c.x,cy=+c.y;
    const d=2*(ax*(by-cy)+bx*(cy-ay)+cx*(ay-by));
    if(Math.abs(d)<1e-9)return null;
    const a2=ax*ax+ay*ay,b2=bx*bx+by*by,c2=cx*cx+cy*cy;
    const ux=(a2*(by-cy)+b2*(cy-ay)+c2*(ay-by))/d;
    const uy=(a2*(cx-bx)+b2*(ax-cx)+c2*(bx-ax))/d;
    const r=Math.hypot(ax-ux,ay-uy);
    return r>0.05?{cx:ux,cy:uy,r}:null;
  }
  function mepAxisResidual(hs,C){
    let m=0;(hs||[]).forEach(h=>{m=Math.max(m,Math.abs(Math.hypot(h.x-C.cx,h.y-C.cy)-C.r));});
    return m;
  }
  function mepAxisCollinear(hs,tol){
    if(!hs||hs.length<2)return false;
    let A=hs[0],B=hs[hs.length-1],best=-1;
    for(let i=0;i<hs.length;i++)for(let j=i+1;j<hs.length;j++){
      const d=(hs[i].x-hs[j].x)**2+(hs[i].y-hs[j].y)**2;
      if(d>best){best=d;A=hs[i];B=hs[j];}
    }
    const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy);
    if(L<1e-9)return false;
    return hs.every(h=>Math.abs((h.x-A.x)*dy-(h.y-A.y)*dx)/L<=tol);
  }
  function mepAxisEqualSpacing(hs,C){
    const n=hs.length;if(n<3)return false;
    const a=hs.map(h=>Math.atan2(h.y-C.cy,h.x-C.cx)).sort((x,y)=>x-y);
    const gap=[];
    for(let i=0;i<n;i++){
      let g=a[(i+1)%n]-a[i];
      if(i===n-1)g+=2*Math.PI;
      gap.push(g);
    }
    const ideal=2*Math.PI/n;
    return gap.every(g=>Math.abs(g-ideal)<=Math.max(0.12*ideal,0.08));
  }
  function mepAxisPitchGroups(holes,v){
    const hs=(holes||[]).filter(h=>h&&Number.isFinite(+h.x)&&Number.isFinite(+h.y));
    if(hs.length<3)return[];
    const tol=Math.max(0.05,MEP_AXIS.tol/mepAxisScale(v));
    const cand=[];
    for(let i=0;i<hs.length;i++)for(let j=i+1;j<hs.length;j++)for(let k=j+1;k<hs.length;k++){
      if(!mepAxisSameDia(hs[i],hs[j])||!mepAxisSameDia(hs[i],hs[k]))continue;
      const C=mepAxisCircle3(hs[i],hs[j],hs[k]);if(!C)continue;
      const pts=hs.filter(h=>mepAxisSameDia(h,hs[i])
        &&Math.abs(Math.hypot(h.x-C.cx,h.y-C.cy)-C.r)<=tol);
      if(pts.length<MEP_AXIS.minPitch||!mepAxisEqualSpacing(pts,C))continue;
      cand.push({C,pts});
    }
    cand.sort((a,b)=>b.pts.length-a.pts.length||a.C.r-b.C.r);
    const used=new Set(),out=[];
    cand.forEach(c=>{
      if(c.pts.some(h=>used.has(mepAxisKey(h))))return;
      c.pts.forEach(h=>used.add(mepAxisKey(h)));
      out.push(c);
    });
    return out;
  }
  function mepAxisLineGroups(holes,v){
    const hs=(holes||[]).filter(h=>h&&Number.isFinite(+h.x)&&Number.isFinite(+h.y));
    if(hs.length<MEP_AXIS.minAlign)return[];
    const tol=Math.max(0.05,MEP_AXIS.tol/mepAxisScale(v));
    const cand=[];
    for(let i=0;i<hs.length;i++)for(let j=i+1;j<hs.length;j++){
      const dx=hs[j].x-hs[i].x,dy=hs[j].y-hs[i].y,L=Math.hypot(dx,dy);
      if(L<1e-9)continue;
      const ux=dx/L,uy=dy/L;
      const pts=hs.filter(h=>Math.abs((h.x-hs[i].x)*uy-(h.y-hs[i].y)*ux)<=tol);
      if(pts.length>=MEP_AXIS.minAlign)cand.push({pts,ux,uy});
    }
    cand.sort((a,b)=>b.pts.length-a.pts.length);
    const used=new Set(),out=[];
    cand.forEach(c=>{
      if(c.pts.some(h=>used.has(mepAxisKey(h))))return;
      c.pts.forEach(h=>used.add(mepAxisKey(h)));
      out.push(c);
    });
    return out;
  }
  function mepAxisCrossPrims(x,y,r,v,cls){
    const over=MEP_AXIS.overrun/mepAxisScale(v);
    const L=Math.max(r+over,1.5/mepAxisScale(v));
    const k=cls||'mepAxisCross';
    return[{t:'L',x1:x-L,y1:y,x2:x+L,y2:y,cls:k},
      {t:'L',x1:x,y1:y-L,x2:x,y2:y+L,cls:k}];
  }
  function mepAxisCenterCross(x,y,L,cls){
    const k=cls||'mepAxis';
    return[{t:'L',x1:x-L,y1:y,x2:x+L,y2:y,cls:k},
      {t:'L',x1:x,y1:y-L,x2:x,y2:y+L,cls:k}];
  }
  function mepAxisSpanBox(P,d,bb){
    let t0=-1e9,t1=1e9;
    const axes=[[d[0],P.x,bb.minx,bb.maxx],[d[1],P.y,bb.miny,bb.maxy]];
    for(const [dd,p,lo,hi] of axes){
      if(Math.abs(dd)<1e-9){if(p<lo||p>hi)return null;continue;}
      let a=(lo-p)/dd,b=(hi-p)/dd;
      if(a>b){const t=a;a=b;b=t;}
      t0=Math.max(t0,a);t1=Math.min(t1,b);
    }
    return t1>t0?[t0,t1]:null;
  }
  function mepAxisSideLine(h,v,g){
    const dx=h.dir2?h.dir2[0]:0,dy=h.dir2?h.dir2[1]:0,L=Math.hypot(dx,dy);
    if(L<0.5)return[];
    const ux=dx/L,uy=dy/L,P={x:h.x,y:h.y};
    const over=MEP_AXIS.overrun/mepAxisScale(v);
    if(h.N&&h.N.end==='blind'){
      const len=Math.max(0.5,+h.N.depth||0);
      return[{t:'L',x1:P.x,y1:P.y,x2:P.x+ux*(len+over),y2:P.y+uy*(len+over),cls:'mepAxis'}];
    }
    const bb=g?mepAABBOf(g):null;
    const sp=bb?mepAxisSpanBox(P,[ux,uy],bb):null;
    if(!sp)return[];
    const t0=sp[0]-over,t1=sp[1]+over;
    if(t1-t0<1)return[];
    return[{t:'L',x1:P.x+ux*t0,y1:P.y+uy*t0,x2:P.x+ux*t1,y2:P.y+uy*t1,cls:'mepAxis'}];
  }
  function mepAxisHoleOfFeature(f,N,A,P,b){
    const d=mepNorm(A.dir);
    const r=Math.max(N.d/2,N.kind==='cbore'?N.cbD/2:0,N.kind==='csink'?N.csD/2:0);
    return{fid:f.id,pid:P.id,f,N,A,P,
      x:mepDot([P.x,P.y,P.z],b.u),y:mepDot([P.x,P.y,P.z],b.v),r,
      facing:mepDot(d,b.dir),dir2:[mepDot(d,b.u),mepDot(d,b.v)]};
  }
  function mepAxisFeatureHoles(sh,v){
    const b=mepBasisOf(v),out=[];
    (doc.features||[]).forEach(f=>{
      if(!f||f.type!=='hole'||f.visible===false)return;
      const sk=(doc.sketches||[]).find(s=>s.id===f.sketchId);if(!sk)return;
      let A=null,N=null;
      try{A=holeAxis(f,sk);N=holeNorm(f);}catch(e){return;}
      if(!A||!A.pts||!A.pts.length||!A.dir)return;
      A.pts.forEach(P=>out.push(mepAxisHoleOfFeature(f,N,A,P,b)));
    });
    return out;
  }
  function mepAxisFaceHoles(sh,v){
    const g=mepGeoOf(v),b=mepBasisOf(v),out=[],seen=new Set();
    g.els.forEach((e,i)=>{
      if(e.t!=='C')return;
      const m=mepHoleAt(sh,v.id,e,i);if(!m)return;
      const key=m.f.id+'|'+m.P.id;
      if(seen.has(key))return;
      seen.add(key);
      out.push(mepAxisHoleOfFeature(m.f,m.N,m.A,m.P,b));
    });
    return out;
  }
  function mepAxisPitchPrims(C,hs,v){
    const out=[{t:'C',cx:C.cx,cy:C.cy,r:C.r,cls:'mepAxis'}];
    const over=MEP_AXIS.overrun/mepAxisScale(v);
    (hs||[]).forEach(h=>{
      const dx=h.x-C.cx,dy=h.y-C.cy,L=Math.hypot(dx,dy)||1;
      const end=C.r+h.r+over;
      out.push({t:'L',x1:C.cx,y1:C.cy,x2:C.cx+dx/L*end,y2:C.cy+dy/L*end,cls:'mepAxis'});
    });
    out.push(...mepAxisCenterCross(C.cx,C.cy,6/mepAxisScale(v),'mepAxis'));
    return out;
  }
  function mepAxisAlignPrims(hs,v,marks){
    if(!hs||hs.length<2)return[];
    let A=hs[0],B=hs[hs.length-1],best=-1;
    for(let i=0;i<hs.length;i++)for(let j=i+1;j<hs.length;j++){
      const d=(hs[i].x-hs[j].x)**2+(hs[i].y-hs[j].y)**2;
      if(d>best){best=d;A=hs[i];B=hs[j];}
    }
    const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy);
    if(L<1e-9)return[];
    const ux=dx/L,uy=dy/L,over=MEP_AXIS.overrun/mepAxisScale(v);
    const ts=hs.map(h=>(h.x-A.x)*ux+(h.y-A.y)*uy);
    const t0=Math.min(...ts)-over,t1=Math.max(...ts)+over;
    const out=[{t:'L',x1:A.x+ux*t0,y1:A.y+uy*t0,x2:A.x+ux*t1,y2:A.y+uy*t1,cls:'mepAxis'}];
    if(marks!==false)hs.forEach(h=>out.push(...mepAxisCrossPrims(h.x,h.y,h.r,v,'mepAxisCross')));
    return out;
  }
  function mepAxisRefGeom(sh,v,ref){
    if(!ref)return null;
    const f=(doc.features||[]).find(x=>x&&x.id===ref.fid);if(!f)return null;
    const sk=(doc.sketches||[]).find(s=>s.id===f.sketchId);if(!sk)return null;
    const b=mepBasisOf(v);
    let A=null,N=null;
    try{A=holeAxis(f,sk);N=holeNorm(f);}catch(e){return null;}
    if(!A||!A.pts||!A.dir)return null;
    const P=A.pts.find(p=>p.id===ref.pid);if(!P)return null;
    return mepAxisHoleOfFeature(f,N,A,P,b);
  }
  function mepAxisManualGeom(sh,v,ann){
    if(!ann)return[];
    if(ann.kind==='free'&&ann.sym&&ann.a&&ann.b)mepAxisSymMigrate(v,ann); // ancien axe de symétrie figé
    if(ann.kind==='free'){
      if(!ann.a||!ann.b)return[];
      return[{t:'L',x1:ann.a.x,y1:ann.a.y,x2:ann.b.x,y2:ann.b.y,cls:'mepAxis'}];
    }
    if(ann.kind==='sym'){ // axe de symétrie ASSOCIATIF : suit ses 2 droites
      const G=mepAxisSymTrack(v,ann);
      return G?[{t:'L',x1:G.a.x,y1:G.a.y,x2:G.b.x,y2:G.b.y,cls:'mepAxis'}]:[];
    }
    if(ann.kind==='hole'){
      const h=mepAxisRefGeom(sh,v,ann.ref);if(!h)return[];
      if(Math.abs(h.facing)>0.999)return mepAxisCrossPrims(h.x,h.y,h.r,v,'mepAxisCross');
      if(Math.abs(h.facing)<0.02)return mepAxisSideLine(h,v,mepGeoOf(v));
      return mepAxisCrossPrims(h.x,h.y,h.r,v,'mepAxisCross');
    }
    const hs=(ann.refs||[]).map(r=>mepAxisRefGeom(sh,v,r)).filter(Boolean);
    if(ann.kind==='align')return mepAxisAlignPrims(hs,v,true);
    if(ann.kind==='pitch'){
      if(hs.length<3)return[];
      const C=mepAxisFitCircle(hs);if(!C)return[];
      return mepAxisPitchPrims(C,hs,v);
    }
    return[];
  }
  /* 2026-10-22-012 : AXES DES CYLINDRES D'UN STEP (« les traits d'axes doivent
     être possibles sur un cylindre venant d'un STEP ») — un import n'a pas de
     fonction Perçage : les axes viennent des faces cylindriques de son solide
     exact (importGeom.brep). Faces coaxiales regroupées (tronçons, demi-
     cylindres) ; un groupe qui couvre moins d'un demi-tour (congé) est ignoré.
     Vue en bout : croix de centre ; vue de côté : trait d'axe sur la longueur. */
  function mepExactOf(bd){
    if(!bd)return null;
    if(bd.shape)return bd.shape;
    try{if(bd.kind==='import'&&typeof importGeom!=='undefined'){const e=importGeom.get(bd.ref||bd.id);if(e&&e.brep)return e.brep;}}catch(e){}
    return null;
  }
  const mepCylCache=new Map(); // id d'import → {shape, list}
  function mepShapeCyls(bd){
    const sh=mepExactOf(bd);if(!sh||typeof occt==='undefined'||!occt)return[];
    const k=bd.ref||bd.id,c=mepCylCache.get(k);
    if(c&&c.shape===sh)return c.list;
    const groups=new Map();
    let ex=null;
    try{ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);}catch(e){return[];}
    const T=occt.GeomAbs_SurfaceType;
    while(ex.More()){
      let ad=null;
      try{
        const f=occt.TopoDS.Face_1(ex.Current());
        ad=new occt.BRepAdaptor_Surface_2(f,true);
        if(ad.GetType()===T.GeomAbs_Cylinder){
          const cy=ad.Cylinder(),ax=cy.Axis(),L=ax.Location(),Dd=ax.Direction();
          let d=[Dd.X(),Dd.Y(),Dd.Z()];
          const sgn=Math.abs(d[0])>1e-6?Math.sign(d[0]):(Math.abs(d[1])>1e-6?Math.sign(d[1]):(Math.sign(d[2])||1));
          const flip=sgn<0;if(flip)d=d.map(x=>-x);
          const l=[L.X(),L.Y(),L.Z()],ld=mepDot(l,d);
          const o=[l[0]-d[0]*ld,l[1]-d[1]*ld,l[2]-d[2]*ld]; // pied de l'axe (plan normal passant par 0)
          const v0=ad.FirstVParameter(),v1=ad.LastVParameter();
          const t0=ld+(flip?-v1:v0),t1=ld+(flip?-v0:v1);
          const axk=o.map(x=>x.toFixed(2)).join(',')+'|'+d.map(x=>x.toFixed(3)).join(',');
          const key=axk+'|'+cy.Radius().toFixed(2); // par axe ET rayon : moyeu, alésage, bouts séparés
          let g=groups.get(key);
          if(!g){g={o,d,axk,t0:Math.min(t0,t1),t1:Math.max(t0,t1),r:0,u:0};groups.set(key,g);}
          g.t0=Math.min(g.t0,t0,t1);g.t1=Math.max(g.t1,t0,t1);
          g.r=Math.max(g.r,cy.Radius());g.u+=Math.abs(ad.LastUParameter()-ad.FirstUParameter());
        }
      }catch(e){}
      try{if(ad)ad.delete();}catch(e){}
      ex.Next();
    }
    try{ex.delete();}catch(e){}
    // un rayon qui ne fait pas un demi-tour (congé, arc de contour) ne porte pas d'axe ;
    // les rayons retenus d'un même axe fusionnent : un trait, une croix (plus grand rayon)
    const byAx=new Map();
    [...groups.values()].filter(g=>g.u>=Math.PI*0.95&&g.t1-g.t0>1e-3).forEach(g=>{
      const a=byAx.get(g.axk);
      if(!a)byAx.set(g.axk,{o:g.o,d:g.d,t0:g.t0,t1:g.t1,r:g.r,u:g.u});
      else{a.t0=Math.min(a.t0,g.t0);a.t1=Math.max(a.t1,g.t1);a.r=Math.max(a.r,g.r);}
    });
    const list=[...byAx.values()];
    mepCylCache.set(k,{shape:sh,list});
    return list;
  }
  function mepAxisCylPrims(sh,v){
    const out=[],b=mepBasisOf(v),over=MEP_AXIS.overrun/mepAxisScale(v);
    mepMeshesOf(v).forEach(bd=>{
      if(bd.kind!=='import')return; // corps modélisés : axes des fonctions Perçage
      mepShapeCyls(bd).forEach(g=>{
        const facing=mepDot(g.d,b.dir);
        const P=t=>[g.o[0]+g.d[0]*t,g.o[1]+g.d[1]*t,g.o[2]+g.d[2]*t];
        if(Math.abs(facing)>0.999){
          const c=P(g.t0);out.push(...mepAxisCrossPrims(mepDot(c,b.u),mepDot(c,b.v),g.r,v,'mepAxisCross'));
        }else if(Math.abs(facing)<0.02){
          const A=P(g.t0),B=P(g.t1);
          const ax=mepDot(A,b.u),ay=mepDot(A,b.v),bx=mepDot(B,b.u),by=mepDot(B,b.v);
          const L=Math.hypot(bx-ax,by-ay);if(L<1e-6)return;
          const ux=(bx-ax)/L,uy=(by-ay)/L;
          out.push({t:'L',x1:ax-ux*over,y1:ay-uy*over,x2:bx+ux*over,y2:by+uy*over,cls:'mepAxis'});
        }
      });
    });
    return out;
  }
  function mepAxisAutoGeom(sh,v){
    const out=[];
    if(!v||(!v.autoAxes&&!v.autoPitch)||mepOblOf(v)||mepPerspOf(v))return out;
    const manual=new Set();
    (v.axes||[]).forEach(a=>{
      const rs=a&&a.kind==='hole'?[a.ref]:(a&&a.refs)||[];
      rs.forEach(r=>{if(r)manual.add((r.fid||'')+'|'+(r.pid||''));});
    });
    const face=mepAxisFaceHoles(sh,v).filter(h=>!manual.has(mepAxisKey(h)));
    const inPitch=new Set();
    if(v.autoPitch){
      mepAxisPitchGroups(face,v).forEach(g=>{
        g.pts.forEach(h=>inPitch.add(mepAxisKey(h)));
        out.push(...mepAxisPitchPrims(g.C,g.pts,v));
      });
    }
    if(v.autoAxes){
      face.forEach(h=>{
        if(!inPitch.has(mepAxisKey(h)))out.push(...mepAxisCrossPrims(h.x,h.y,h.r,v,'mepAxisCross'));
      });
      const rest=face.filter(h=>!inPitch.has(mepAxisKey(h)));
      mepAxisLineGroups(rest,v).forEach(g=>out.push(...mepAxisAlignPrims(g.pts,v,false)));
      const g=mepGeoOf(v);
      mepAxisFeatureHoles(sh,v).forEach(h=>{
        if(!manual.has(mepAxisKey(h))&&Math.abs(h.facing)<0.02)out.push(...mepAxisSideLine(h,v,g));
      });
      try{out.push(...mepAxisCylPrims(sh,v));}catch(e){} // 2026-10-22-012 : cylindres d'un STEP
    }
    return out;
  }
  /* 2026-10-22-013 : TOUS LES TRAITS D'AXE D'UNE VUE (auto + manuels), chacun
     avec une clé stable « ak » : « m<id>.<n> » pour un axe manuel, « a<géométrie> »
     pour un axe automatique. v.axExt[ak]=[e1,e2] allonge (ou raccourcit) le trait
     à ses deux bouts (mm modèle) — « étirer n'importe quel trait d'axe créé ».
     Les extrémités servent à l'accrochage (flèches de coupe, esquisse) et les
     traits aux cotes (hint {t:'seg',i:'ax:<ak>'}). bx1..by2 = trait d'origine. */
  const mepAxLinesCache=new Map(); // vue → {gen, list}
  var mepAxGen=0;
  function mepAxisLines(sh,v,autoTest){
    if(!v)return[];
    const c=mepAxLinesCache.get(v),geo=mepGeoOf(v);
    if(!autoTest&&c&&c.gen===mepAxGen&&c.geo===geo)return c.list;
    const out=[],ext=v.axExt||{};
    const add=(p,ak,ann)=>{
      const q=Object.assign({},p,{ak,ann:ann||null});
      if(p.t==='L'){
        q.bx1=p.x1;q.by1=p.y1;q.bx2=p.x2;q.by2=p.y2;
        const e=ext[ak],L=Math.hypot(p.x2-p.x1,p.y2-p.y1);
        if(e&&L>1e-9&&!(ann&&ann.kind==='free')){
          const ux=(p.x2-p.x1)/L,uy=(p.y2-p.y1)/L,e1=+e[0]||0,e2=+e[1]||0;
          q.x1=p.x1-ux*e1;q.y1=p.y1-uy*e1;q.x2=p.x2+ux*e2;q.y2=p.y2+uy*e2;
          // une croix de centre allongée devient un vrai trait d'axe : fin, mixte (ISO 128-2 04.1)
          if(e1>1e-6||e2>1e-6)q.cls='mepAxis';
        }
      }
      out.push(q);
    };
    const r2=x=>(+x).toFixed(2);
    let auto=[];
    try{auto=autoTest||mepAxisAutoGeom(sh,v);}catch(e){}
    const seen=new Map();
    auto.forEach(p=>{
      let k='a'+(p.t==='L'?[p.x1,p.y1,p.x2,p.y2]:[p.cx,p.cy,p.r]).map(r2).join(',');
      const n=seen.get(k)||0;seen.set(k,n+1);if(n)k+='#'+n;
      add(p,k,null);
    });
    (v.axes||[]).forEach(ann=>{
      let ps=[];
      try{ps=mepAxisManualGeom(sh,v,ann);}catch(e){}
      ps.forEach((p,i)=>add(p,'m'+ann.id+'.'+i,ann));
    });
    if(!autoTest)mepAxLinesCache.set(v,{gen:mepAxGen,geo,list:out});
    return out;
  }
  function mepAxisLineByKey(sh,v,ak){
    return mepAxisLines(sh,v).find(p=>p.ak===ak)||null;
  }
  function mepSheetOfView(v){
    try{return (doc.mep.sheets||[]).find(s=>s.views.indexOf(v)>=0)||mepSheet();}catch(e){return null;}
  }
  function mepAxisAt(sh,sx,sy){
    const tol=5/mepSt.zoom;
    let best=null,bd=tol;
    sh.views.forEach(v=>{
      mepAxisLines(sh,v).forEach(p=>{
        let d=1e9,end=null;
        if(p.t==='L'){
          const ax=v.x+p.x1*v.scale,ay=v.y+p.y1*v.scale;
          const bx=v.x+p.x2*v.scale,by=v.y+p.y2*v.scale;
          const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;
          const t=L2>1e-12?Math.max(0,Math.min(1,((sx-ax)*dx+(sy-ay)*dy)/L2)):0;
          d=Math.hypot(sx-(ax+dx*t),sy-(ay+dy*t));
          const d1=Math.hypot(sx-ax,sy-ay),d2=Math.hypot(sx-bx,sy-by);
          if(Math.min(d1,d2)<=6/(mepSt.zoom||1))end=d1<=d2?1:2;
        }else if(p.t==='C'){
          const cx=v.x+p.cx*v.scale,cy=v.y+p.cy*v.scale;
          d=Math.abs(Math.hypot(sx-cx,sy-cy)-p.r*v.scale);
        }
        if(end)d=Math.hypot(sx-(end===1?v.x+p.x1*v.scale:v.x+p.x2*v.scale),sy-(end===1?v.y+p.y1*v.scale:v.y+p.y2*v.scale))-tol; // une extrémité l'emporte toujours sur un trait qui passe (croix sur un alignement)
        if(d<bd){bd=d;best={vid:v.id,id:p.ann?p.ann.id:null,ann:p.ann,ak:p.ak,p,end};}
      });
    });
    return best;
  }
  function mepAxisHoleAt(sh,sx,sy){
    const hit=mepHitViewEnt(sh,sx,sy);
    if(hit&&hit.e&&hit.e.t==='C'){
      const m=mepHoleAt(sh,hit.vid,hit.e,hit.i);
      if(m)return{vid:hit.vid,fid:m.f.id,pid:m.P.id};
    }
    const v0=mepViewAt(sh,sx,sy);
    const views=v0?[v0]:sh.views;
    let best=null,bd=8/mepSt.zoom;
    views.forEach(v=>{
      mepAxisFeatureHoles(sh,v).forEach(h=>{
        const d=Math.hypot(v.x+h.x*v.scale-sx,v.y+h.y*v.scale-sy);
        if(d<bd){bd=d;best={vid:v.id,fid:h.fid,pid:h.pid};}
      });
    });
    return best;
  }
  function mepSignedTol(v){
    const n=+v||0;
    return (n<0?'−':'+')+mepFmtNum(Math.abs(n),3);
  }
  function mepDimTextParts(d,value){
    const pre=d.pre?String(d.pre).trim():'',post=d.post?String(d.post).trim():'';
    const join=(a,b)=>a&&b?a+' '+b:(a||b);
    const wrap=s=>join(join(pre,s),post);
    if(d.kind==='hole')return{main:wrap((d.holeN>1&&!d.txt?d.holeN+'× ':'')+(d.txt||d.holeText||'')),up:'',lo:'',sym:''};
    if(d.txt)return{main:wrap(d.txt),up:'',lo:'',sym:''};
    const unit=d.kind==='ang'?'°':'';
    const base=mepFmtNum(value,d.kind==='ang'?1:2)+unit;
    const t=d.tol||{};
    if(t.m==='pm'&&t.s>0){
      const sym='±'+mepFmtNum(t.s,3)+(post?' '+post:'');
      return{main:join(pre,base),sym,up:'',lo:''};
    }
    if(t.m==='dbl')return{main:wrap(base),up:mepSignedTol(t.hi),lo:mepSignedTol(t.lo),sym:''};
    if(t.m==='cls'&&t.cls){
      // 2026-10-22-007 : classe ISO 286 suivie de ses écarts entre parenthèses, empilés comme
      // une tolérance bilatérale (même place, même hauteur) — « Ø20 H7 (+0,021 / 0) ».
      // Ajustement (H7/g6) : la classe seule (deux plages, pas un écart sur la cote).
      const r=String(t.cls).indexOf('/')<0?mepTolRange(t.cls,Math.abs(value)):null;
      if(r)return{main:join(pre,base+' '+t.cls),up:mepSignedTol0(r.hi),lo:mepSignedTol0(r.lo),sym:'',par:true,post};
      return{main:wrap(base+' '+t.cls),up:'',lo:'',sym:''};
    }
    return{main:wrap(base),up:'',lo:'',sym:''};
  }
  // écart ISO : 0 sans signe (ISO 286), sinon signé
  function mepSignedTol0(v){return Math.abs(+v||0)<1e-9?'0':mepSignedTol(v);}
  function mepDimSymbolParts(d,value,sym){
    const pre=d.pre?String(d.pre).trim():'',post=d.post?String(d.post).trim():'';
    const p=mepDimTextParts(Object.assign({},d,{pre:'',post:''}),value);
    const join=(a,b)=>a&&b?a+' '+b:(a||b);
    const main=join(pre,sym+p.main);
    if(p.sym)return Object.assign({},p,{main,sym:join(p.sym,post)});
    if(p.par)return Object.assign({},p,{main,post}); // suffixe après la parenthèse des écarts
    return Object.assign({},p,{main:join(main,post)});
  }
  function mepDimText(d,value){
    const p=(d.kind==='dia'||d.kind==='rad')
      ?mepDimSymbolParts(d,value,d.kind==='dia'?'Ø':'R')
      :mepDimTextParts(d,value);
    const main=p.sym?p.main+' '+p.sym:p.main;
    if(d.kind==='hole'&&d.tol&&!d.txt)return mepTolMarks(mepHoleTolText(main,d.tol));
    if(p.par)return main+' ('+p.up+' / '+p.lo+')'+(p.post?' '+p.post:'');
    return p.up||p.lo?main+' '+p.up+' / '+p.lo:main;
  }
  function mepDimTolLineH(){
    const th=MEP_DIM_STYLE.textHeight||7;
    const sub=Math.max(2.8,th*0.68);
    return Math.max(1.8,sub*0.72+0.45);
  }
  // largeur de la pile des écarts (parenthèses et suffixe compris), mm papier
  function mepDimStackW(up,lo,par,post){
    const th=MEP_DIM_STYLE.textHeight||7,sub=Math.max(2.8,th*0.68),lh=mepDimTolLineH();
    const pw=par?sub*0.55:0,tw=Math.max(String(up||'').length,String(lo||'').length)*sub*0.54;
    const cw=par?(sub+lh)*0.4+(post?(String(post).length+1)*sub*0.54:0):0;
    return pw+tw+cw;
  }
  function mepDimStackGap(){return Math.max(1.2,(MEP_DIM_STYLE.textHeight||7)*0.22);}
  function mepDimDrawText(mk,T,main,up,lo,x,y,anchor,transform,flip,sym,par,post){
    // 2026-10-22-011 : texte calé à DROITE (leader à droite) — la pile des écarts tient AVANT
    // le point d'attache : tout le groupe recule (la pile ne déborde plus sur le leader)
    const shiftEnd=(anchor==='end'&&(up||lo))?mepDimStackGap()+mepDimStackW(up,lo,par,post):0;
    const attrs={x:x-shiftEnd,y,'text-anchor':anchor};
    if(transform)attrs.transform=transform;
    const t=mk('text',Object.assign(attrs,T));
    t.textContent=main;
    if(sym){
      const ts=document.createElementNS(NS,'tspan');
      ts.setAttribute('font-size',String((MEP_DIM_STYLE.textHeight||7)*0.85));
      ts.textContent=' '+sym;
      t.appendChild(ts);
    }
    if(!up&&!lo)return t;
    const th=MEP_DIM_STYLE.textHeight||7;
    const sub=Math.max(2.8,th*0.68),gap=mepDimStackGap();
    const lh=mepDimTolLineH();
    const mw=Math.max(7,String(main).length*th*0.62);
    // calé à gauche : la pile suit la largeur MESURÉE du texte (celle du souligné des Ø/R)
    const sx=anchor==='middle'?x+mw/2+gap:(anchor==='end'?x-shiftEnd+gap:x+mepTxtW(t,main,th)+gap);
    const st=Object.assign({},T,{x:sx,'text-anchor':'start',
      style:'font-size:'+sub+'px;stroke-width:1'});
    if(transform)st.transform=transform;
    // écarts d'une classe ISO : parenthèses hautes autour de la pile (même place qu'en bilatéral)
    const pw=par?sub*0.55:0;
    const tw=Math.max(String(up||'').length,String(lo||'').length)*sub*0.54;
    const tu=mk('text',Object.assign({},st,{x:sx+pw,y:flip?y+lh:y-lh}));
    tu.textContent=up||'';
    const tl=mk('text',Object.assign({},st,{x:sx+pw,y:y}));
    tl.textContent=lo||'';
    if(par){
      const ph=sub+lh,py=flip?y+lh*0.5+ph*0.32:y-lh*0.5+ph*0.32;
      const sp=Object.assign({},st,{y:py,style:'font-size:'+ph.toFixed(2)+'px;stroke-width:1'});
      const p0=mk('text',Object.assign({},sp,{x:sx}));p0.textContent='(';
      const p1=mk('text',Object.assign({},sp,{x:sx+pw+tw}));p1.textContent=')'+(post?' '+post:'');
    }
    return t;
  }
  function mepDimHasStack(d){
    return !d.txt&&d.tol&&(d.tol.m==='dbl'||(d.tol.m==='cls'&&d.tol.cls&&String(d.tol.cls).indexOf('/')<0));
  }
  function mepDimLabelHalf(d,value){
    const p=mepDimTextParts(d,value);
    const th=MEP_DIM_STYLE.textHeight||7;
    const main=d.ref?'('+p.main+')':p.main;
    const mainHalf=Math.max(7,String(main).length*th*0.62)/2;
    if(p.sym)return mainHalf+Math.max(1.2,th*0.14)+String(p.sym).length*th*0.85*0.54;
    if(!p.up&&!p.lo)return mainHalf;
    const sub=Math.max(2.8,th*0.68),gap=Math.max(1,th*0.15);
    const tolW=Math.max(String(p.up||'').length,String(p.lo||'').length)*sub*0.54+(p.par?sub*0.55+(1+(p.post?String(p.post).length+1:0))*(sub+mepDimTolLineH())*0.4:0);
    return mainHalf+gap+tolW;
  }
  function mepDimTextAnchorPos(g,d){
    const th=MEP_DIM_STYLE.textHeight||7;
    const toff=+d.txtOff||0;
    const vertical=Math.abs(g.ux)<1e-6;
    let x=(g.a1.x+g.b1.x)/2+g.ux*toff;
    let y=(g.a1.y+g.b1.y)/2+g.uy*toff;
    if(vertical){
      x-=Math.max(2,th*0.28);
    }else if(mepDimHasStack(d)){
      y-=mepDimTolLineH();
    }else{
      y-=2;
    }
    return{x,y,vertical,toff};
  }
  function mepDimLineExtent(g,d,value){
    const half=g.L/2,toff=+d.txtOff||0;
    const lh=mepDimLabelHalf(d,value);
    if(Math.abs(toff)<1e-9)return{start:-half,end:half,half};
    return{start:Math.min(-half,toff-lh),end:Math.max(half,toff+lh),half};
  }
  function mepDimTxtOffSnap(sh,d,v,g){
    v=+v||0;
    g=g||mepDimLine(sh,d);
    if(!g||!g.L)return v;
    const value=d.value!=null?d.value:mepDimMeasure(sh,d);
    const lim=Math.max(0,g.L/2-mepDimLabelHalf(d,value));
    return Math.abs(v)<=lim?0:v;
  }
  /* largeur d'un texte de cote (mm papier) : mesurée sur le SVG quand il est affiché,
     sinon estimée d'après le corps de la police (chiffres et capitales ≈ 0,6 corps, graisse 600) */
  function mepTxtW(el,str,fs){
    try{if(el&&typeof el.getComputedTextLength==='function'){const w=el.getComputedTextLength();if(w>0)return w;}}catch(e){}
    return String(str||'').length*fs*0.6;
  }
  function mepDimUnderOff(h){return 0.3*h+0.9;} // ligne de rappel soulignée : écart sous la ligne de base
  /* 2026-10-22-017 : tolérance d'une cotation de perçage — posée juste après le 1er « Ø… » de
     l'étiquette (le Ø du trou ; pour un taraudage, la ligne du foret), écarts en petit corps
     (balises \u0001…\u0002 → tspan réduit) : « Ø8 H7 (+0,015 / 0) ↧12 ». */
  function mepHoleTolText(txt,tol){
    if(!tol||!tol.m)return txt;
    const m=/Ø\s?([0-9]+(?:[.,][0-9]+)?)/.exec(String(txt||''));if(!m)return txt;
    const nom=parseFloat(m[1].replace(',','.'));if(!(nom>0))return txt;
    const p=mepDimTextParts({kind:'dia',tol},nom);let add='';
    if(tol.m==='pm'&&tol.s>0)add='\u0001'+p.sym+'\u0002';
    else if(tol.m==='dbl')add='\u0001'+p.up+' / '+p.lo+'\u0002';
    else if(tol.m==='cls'&&tol.cls)add=tol.cls+(p.par?' (\u0001'+p.up+' / '+p.lo+'\u0002)':'');
    if(!add)return txt;
    const e=m.index+m[0].length;
    return txt.slice(0,e)+' '+add+txt.slice(e);
  }
  const mepTolMarks=s=>String(s||'').replace(/[\u0001\u0002]/g,'');
  function mepHoleCallout(cx,cy,rr,px,py,txt){
    let ux=px-cx,uy=py-cy,ul=Math.hypot(ux,uy);
    if(ul<1e-6){ux=1;uy=0;ul=1;}
    ux/=ul;uy/=ul;
    const ang=Math.atan2(uy,ux);
    const ex=cx+rr*Math.cos(ang),ey=cy+rr*Math.sin(ang);
    const lines=String(txt||'').split('\n');
    // interligne, souligné et largeur suivent la hauteur d'écriture des cotes
    const fs=MEP_DIM_STYLE.textHeight||7,h=MEP_TEXT_STYLE.dimH;
    const lh=fs*1.2,n=lines.length,mid=py+h*0.4;
    const y0=mid-(n-1)*lh/2;
    const tx=px,anchor=ux<0?'end':'start';
    const tw=Math.max(h,...lines.map(s=>mepTxtW(null,mepTolMarks(s),fs)));
    const u0=anchor==='end'?tx-tw:tx,u1=anchor==='end'?tx:tx+tw;
    // souligné sous les jambages (ISO 3098 : 0,3 h) + le halo blanc du texte : sinon il touche le Ø
    const lineY=y0+(n-1)*lh+mepDimUnderOff(h);
    return{ex,ey,lines,lh,y0,tx,anchor,u0,u1,lineY};
  }
  /* 2026-10-22-015 : NOTE À FLÈCHE (« zone texte avec flèche comme pour les cotations de perçage,
     texte libre ») — d.kind 'note' : a = pointe de la flèche, b = départ du texte souligné (mm
     locaux de la vue), d.txt multiligne ; dessin et glisser = ceux de l'étiquette de perçage.
     COTATION D'ORDONNÉES (ISO 129-1) — d.kind 'ord' : d.o = origine « 0 », d.axis 'x' | 'y',
     d.pts = points cotés, d.off = position commune (mm papier depuis l'origine, perpendiculaire à
     l'axe) : toutes les valeurs sont alignées et se déplacent ENSEMBLE (un seul objet). Les
     valeurs s'écrivent le long des lignes d'attache, au bout ; les points gardent leur
     accrochage (re-ancrés au rejeu comme les autres cotes). */
  let mepTxtDlgEl=null;
  function mepTextDialog(title,init,cb){
    if(mepTxtDlgEl){try{mepTxtDlgEl.remove();}catch(e){}}
    const box=document.createElement('div');mepTxtDlgEl=box;box.id='mepTxtDlg';
    box.style.cssText='position:fixed;z-index:10001;left:50%;top:40%;transform:translate(-50%,-50%);width:300px;padding:12px 14px;'
      +'border:1px solid var(--border,#3a3a3e);border-radius:10px;background:var(--surface,#222);color:var(--text,#eee);'
      +'box-shadow:0 12px 32px rgba(0,0,0,.5);font:12px sans-serif';
    const h=document.createElement('div');h.textContent=title;h.style.cssText='font-weight:600;font-size:13px;margin-bottom:8px';box.appendChild(h);
    const ta=document.createElement('textarea');ta.id='mepTxtDlgTa';ta.rows=3;ta.value=init||'';
    ta.style.cssText='width:100%;box-sizing:border-box;resize:vertical;font:13px sans-serif';box.appendChild(ta);
    const n=document.createElement('div');n.textContent='Entrée : valider · Maj + Entrée : nouvelle ligne · Échap : annuler';
    n.style.cssText='color:var(--muted,#aaa);font-size:11px;margin:6px 0';box.appendChild(n);
    const bt=document.createElement('div');bt.style.cssText='display:flex;justify-content:flex-end;gap:8px';
    const close=()=>{try{box.remove();}catch(e){}if(mepTxtDlgEl===box)mepTxtDlgEl=null;};
    const bC=document.createElement('button');bC.type='button';bC.textContent='Annuler';bC.onclick=()=>{close();cb(null);};
    const bO=document.createElement('button');bO.type='button';bO.id='mepTxtDlgOk';bO.textContent='Valider';bO.onclick=()=>{close();cb(ta.value);};
    bt.appendChild(bC);bt.appendChild(bO);box.appendChild(bt);
    ta.addEventListener('keydown',e=>{e.stopPropagation();
      if(e.key==='Escape'){bC.click();}else if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();bO.click();}});
    document.body.appendChild(box);try{ta.focus();ta.select();}catch(e){}
    return box;
  }
  function mepNoteEdit(sh,d){
    mepTextDialog('Note',d.txt||'',t=>{
      if(t===null)return;
      const v=String(t).replace(/\r/g,'').replace(/\s+$/,'');
      mepEdit('texte de note',()=>{if(v)d.txt=v;else sh.dims=sh.dims.filter(x=>x!==d);});
      mepSideShow();mepRender();
    });
  }
  // accrochage → point local d'une vue + indice d'entité (re-ancrage au rejeu)
  function mepSnapHint(sh,v,sn,q){
    // référence durable d'un point accroché : trait d'axe (suivi à chaque dessin) ou entité (re-ancrage au rejeu)
    const h=sn&&sn.hit;if(!h)return null;
    if(h.ak&&(h.t==='axEnd'||h.t==='axMid'||h.t==='onAx'||h.t==='ctr'))return mepAxisRefOf(sh,v,q,h.ak);
    if(isFinite(h.i)){if(h.t==='end')return{t:'seg',i:h.i};if(h.t==='ctr')return{t:'ctr',i:h.i};
      if(h.t==='mid'||h.t==='onSeg'){const g=mepGeoOf(v),e=g&&g.els[h.i];if(e&&e.t==='L'&&mepGeoExact(g))return mepEdgeRefOf(e,q);}}
    return null;
  }
  function mepSnapLocal(sh,P){
    const sn=mepSnapPt(P.x,P.y,sh),v=sn.hit?mepView(sh,sn.hit.vid):mepViewAt(sh,sn.x,sn.y);
    if(!v)return null;
    const q={x:(sn.x-v.x)/v.scale,y:(sn.y-v.y)/v.scale};
    const hh=mepSnapHint(sh,v,sn,q);if(hh)q.hint=hh;
    return{v,q};
  }
  function mepOrdDefaultOff(v,axis,o){
    const bb=mepAABBOf(mepGeoOf(v)),oS=mepToSheet(v,o.x,o.y);
    if(!bb)return -10;
    return axis==='y'?(v.x+bb.minx*v.scale)-10-oS.x:(v.y+bb.miny*v.scale)-10-oS.y;
  }
  function mepOrdClick(sh,P,axis){
    const cur=mepSt.ord?sh.dims.find(x=>x.id===mepSt.ord):null;
    const S=mepSnapLocal(sh,P);
    if(!S){mepStatus('Ordonnées : cliquez dans une vue.');return;}
    if(!cur){
      const o=S.q,d={id:mepUid('d'),kind:'ord',axis,vid:S.v.id,vid2:null,o,a:o,b:o,pts:[],off:mepOrdDefaultOff(S.v,axis,o),ref:false,tol:null};
      mepEdit('cotation d’ordonnées',()=>{sh.dims.push(d);});
      mepSt.ord=d.id;mepSt.selDim=d.id;
      mepStatus('Ordonnées '+axis.toUpperCase()+' : origine « 0 » posée — cliquez les points à coter (Entrée ou Échap pour terminer).');
    }else{
      if(S.v.id!==cur.vid){mepStatus('Ordonnées : les points doivent être dans la vue de l’origine.');return;}
      mepEdit('point d’ordonnée',()=>{cur.pts.push(S.q);});
      mepStatus('Ordonnées '+cur.axis.toUpperCase()+' : '+cur.pts.length+' point(s) — Entrée ou Échap pour terminer.');
    }
    mepSideShow();mepRender();
  }
  // 2026-10-22-016 : « je dois pouvoir supprimer une cote parmi les ordonnées » — le clic désigne
  // la valeur la plus proche (le long de l'axe) ; Suppr ou « Supprimer ce point » la retire
  function mepOrdPtAt(sh,d,P){
    const v=mepView(sh,d.vid);if(!v)return -1;
    let best=-1,bd=Infinity;
    [d.o].concat(d.pts||[]).forEach((q,k)=>{const S=mepToSheet(v,q.x,q.y),j=(+q.jog||0)*v.scale,e=d.axis==='y'?Math.abs(S.y+j-P.y):Math.abs(S.x+j-P.x);if(e<bd){bd=e;best=k-1;}});
    return best;
  }
  function mepOrdDelPt(sh,d,i){
    if(!d||!(i>=0)||!d.pts||i>=d.pts.length)return false;
    mepEdit('point d’ordonnée supprimé',()=>{d.pts.splice(i,1);});
    mepSt.ordPt=null;
    mepStatus('Point d’ordonnée supprimé ('+d.pts.length+' restant(s)).');
    mepSideShow();mepRender();
    return true;
  }
  function mepOrdValue(d,p){
    // mm modèle depuis l'origine, signé : X vers la droite, Y vers le haut (v papier = vers le bas) ;
    // l'affichage en prend la valeur absolue
    return d.axis==='y'?(d.o.y-p.y):(p.x-d.o.x);
  }
  function mepDrawOrd(draw,d,sh,L,T){
    const v=mepView(sh,d.vid);if(!v||!d.o)return;
    try{mepDimPtsRefresh(sh,d);}catch(e){}
    const hh=MEP_TEXT_STYLE.dimH,gap=Math.max(0.8,MEP_DIM_STYLE.gap||1),oS=mepToSheet(v,d.o.x,d.o.y);
    const line=d.axis==='y'?oS.x+(+d.off||0):oS.y+(+d.off||0);
    const hi=(mepSt.ordPt&&mepSt.ordPt.id===d.id)?mepSt.ordPt.i:null;
    // une valeur désignée : elle seule en rouge (le reste du groupe en couleur normale), Suppr la retire
    if(hi!==null){const un=c=>String(c||'').replace(/\s*mepDimSel\b/g,'');L=Object.assign({},L,{class:un(L.class)});T=Object.assign({},T,{class:un(T.class)});}
    const Ls=Object.assign({},L,{class:L.class+' mepDimSel'}),Ts=Object.assign({},T,{class:T.class+' mepDimSel'});
    [d.o].concat(d.pts||[]).forEach((p,k)=>{
      const on=hi!==null&&k-1===hi,L1=on?Ls:L,T1=on?Ts:T;
      // valeur toujours POSITIVE (distance à l'origine) — points des deux côtés du « 0 » compris
      const P=mepToSheet(v,p.x,p.y),val=Math.abs(mepOrdValue(d,p));
      const s=mepFmtNum(val<1e-9?0:val,2);
      const pp=(k>0&&p.tol)?mepDimTextParts({kind:'len',tol:p.tol},val<1e-9?0:val):null; // tolérance de CE point
      const put=(x,y,anchor,tr)=>{
        if(!pp){const a={x,y,'text-anchor':anchor};if(tr)a.transform=tr;draw('text',Object.assign(a,T1)).textContent=s;return;}
        mepDimDrawText(draw,T1,pp.main,pp.up,pp.lo,x,y,anchor,tr,false,pp.sym,pp.par,pp.post);
      };
      // cassure (2026-10-23) : rappel droit, coude oblique sur 3 mm, puis droit jusqu'à la ligne des valeurs
      const J=(k>0&&+p.jog)?+p.jog*v.scale:0;
      if(d.axis==='y'){
        const sg=line<P.x?-1:1,y2=P.y+J;
        if(J&&Math.abs(line-P.x)>8){const b1=line-sg*7,b2=line-sg*4;
          draw('line',Object.assign({x1:P.x+sg*gap,y1:P.y,x2:b1,y2:P.y},L1));draw('line',Object.assign({x1:b1,y1:P.y,x2:b2,y2:y2},L1));
          draw('line',Object.assign({x1:b2,y1:y2,x2:line,y2:y2},L1));}
        else draw('line',Object.assign({x1:P.x+sg*gap,y1:P.y,x2:line,y2:P.y},L1));
        put(line+sg*1,(J&&Math.abs(line-P.x)>8?y2:P.y)+hh*0.5,sg<0?'end':'start',null);
      }else{
        const sg=line<P.y?-1:1,x2=P.x+J,ok=J&&Math.abs(line-P.y)>8,xt=(ok?x2:P.x)+hh*0.5,y=line+sg*1;
        if(ok){const b1=line-sg*7,b2=line-sg*4;
          draw('line',Object.assign({x1:P.x,y1:P.y+sg*gap,x2:P.x,y2:b1},L1));draw('line',Object.assign({x1:P.x,y1:b1,x2:x2,y2:b2},L1));
          draw('line',Object.assign({x1:x2,y1:b2,x2:x2,y2:line},L1));}
        else draw('line',Object.assign({x1:P.x,y1:P.y+sg*gap,x2:P.x,y2:line},L1));
        put(xt,y,sg<0?'start':'end','rotate(-90 '+xt.toFixed(3)+' '+y.toFixed(3)+')');
      }
    });
  }
  function mepDrawDim(mk,d,sh){
    const w=mepDimWorld(sh,d);
    if(!w)return;
    const val=d.value!=null?d.value:mepDimMeasure(sh,d);
    let txt=mepDimText(d,val);
    const sel=mepSt.selDim===d.id||!!(mepSt.lot&&mepSt.lot.dims.has(d.id));
    const ghost=!!d.__ghost;
    const col=sel?COL.sel:(d.ref?null:'#0a84ff');
    const L={class:'mepDimL'+(sel?' mepDimSel':'')+(ghost?' mepDimGhost':'')};
    const T={class:'mepDimT'+(sel?' mepDimSel':'')+(d.ref?' mepDimRef':'')+(ghost?' mepDimGhost':'')};
    const AR=sel?'url(#mepArrSel)':'url(#mepArr)';
    const ARS=sel?'url(#mepArrSSel)':'url(#mepArrS)';
    const hit=[];
    mepDimHits.set(d,hit);
    const draw=(tag,attrs)=>{
      if(tag==='line'){
        const x1=+(attrs&&attrs.x1),y1=+(attrs&&attrs.y1),x2=+(attrs&&attrs.x2),y2=+(attrs&&attrs.y2);
        if([x1,y1,x2,y2].every(Number.isFinite))hit.push({x1,y1,x2,y2});
      }
      return mk(tag,attrs);
    };
    if(d.kind==='ord'){mepDrawOrd(draw,d,sh,L,T);return;}
    if(d.kind==='note')txt=d.txt||'Texte';
    if(d.kind==='hole'||d.kind==='note'){
      if(d.kind==='hole'&&d.holeFid&&typeof doc!=='undefined'){
        const f=(doc.features||[]).find(x=>x.id===d.holeFid);
        if(f){
          d.holeText=mepHoleFeatureText(f);
          // nombre tenu à jour (répétition modifiée, trous ajoutés à l'esquisse…)
          const hn=mepHoleCount(sh,w.v1,mepHoleFam(f));if(hn>0)d.holeN=hn;
          txt=d.txt||((d.holeN>1?d.holeN+'× ':'')+d.holeText);
        }
      }
      if(d.kind==='hole'&&d.tol&&!d.txt)txt=mepHoleTolText(txt,d.tol);
      const e=mepEntByHint(w.v1,d.a.hint);
      let cx=w.a.x,cy=w.a.y,rr=0;
      if(e&&(e.t==='C'||e.t==='A')){
        const v=w.v1,cS=mepToSheet(v,e.cx,e.cy);
        rr=e.r*v.scale;cx=cS.x;cy=cS.y;
      }
      const g=mepHoleCallout(cx,cy,rr,w.b.x,w.b.y,txt);
      draw('line',Object.assign({x1:g.tx,y1:g.lineY,x2:g.ex,y2:g.ey,'marker-end':AR},L));
      const t=draw('text',Object.assign({x:g.tx,y:g.y0,'text-anchor':g.anchor},T));
      let twM=0;
      g.lines.forEach((s,k)=>{
        const ts=document.createElementNS(NS,'tspan');
        ts.setAttribute('x',String(g.tx));ts.setAttribute('y',String(g.y0+k*g.lh));
        if(s.indexOf('\u0001')<0)ts.textContent=s;
        else s.split(/(\u0001[^\u0002]*\u0002)/).forEach(seg=>{ // écarts de tolérance en petit corps
          if(!seg)return;
          const sub=document.createElementNS(NS,'tspan');
          if(seg[0]==='\u0001'){sub.setAttribute('font-size',String(Math.max(2.8,(MEP_DIM_STYLE.textHeight||7)*0.68)));sub.textContent=mepTolMarks(seg);}
          else sub.textContent=seg;
          ts.appendChild(sub);
        });
        t.appendChild(ts);
        twM=Math.max(twM,mepTxtW(ts,s,MEP_DIM_STYLE.textHeight||7));
      });
      // souligné à la longueur réelle du texte (police et hauteur réglées)
      const u0=twM>0?(g.anchor==='end'?g.tx-twM:g.tx):g.u0,u1=twM>0?(g.anchor==='end'?g.tx:g.tx+twM):g.u1;
      draw('line',Object.assign({x1:u0,y1:g.lineY,x2:u1,y2:g.lineY},L));
      return;
    }
    if(d.kind==='dia'||d.kind==='rad'){
      // b = position du texte choisie par l'utilisateur ; le leader pointe la
      // circonférence dans cette direction (déplaçable au glisser).
      const e=mepEntByHint(w.v1,d.a.hint);
      let cx=w.a.x,cy=w.a.y,rr=0;
      if(e&&(e.t==='C'||e.t==='A')){
        const v=w.v1,cS=mepToSheet(v,e.cx,e.cy);
        rr=e.r*v.scale;cx=cS.x;cy=cS.y;
      }
      const px=w.b.x,py=w.b.y;
      let ux=px-cx,uy=py-cy,ul=Math.hypot(ux,uy);
      if(ul<1e-6){ux=1;uy=0;ul=1;}
      ux/=ul;uy/=ul;
      let ang=Math.atan2(uy,ux);
      if(e&&e.t==='A'){
        const lo=Math.min(e.a0,e.a1),hi=Math.max(e.a0,e.a1);
        let an=ang;while(an<lo)an+=2*Math.PI;
        if(an>hi){
          const d0=Math.abs(ang-e.a0),d1=Math.abs(ang-e.a1);
          ang=d0<d1?e.a0:e.a1;
        }else ang=an;
      }
      const ex=cx+rr*Math.cos(ang),ey=cy+rr*Math.sin(ang);
      const pp=mepDimSymbolParts(d,val,d.kind==='dia'?'Ø':'R');
      const str=pp.main;
      // texte sur un trait souligné : le leader part de dessous l'étiquette
      // (plus de vide entre le texte et la flèche).
      const fs=MEP_DIM_STYLE.textHeight||7,hh=MEP_TEXT_STYLE.dimH,uOff=mepDimUnderOff(hh);
      const tx=px,ty=py+hh*0.4;
      // leader du texte vers la circonférence, flèche sur l'arête
      draw('line',Object.assign({x1:tx,y1:ty+uOff,x2:ex,y2:ey,'marker-end':AR},L));
      if(d.kind==='dia'){
        // trait de diamètre : part du bord (côté texte) après un vide, traverse
        // le centre et flèche le bord opposé - il ne part plus du centre.
        const lg=Math.min(MEP_DIM_STYLE.leaderGap,rr*0.45);
        draw('line',Object.assign({x1:ex-ux*lg,y1:ey-uy*lg,
          x2:cx-rr*Math.cos(ang),y2:cy-rr*Math.sin(ang),'marker-end':ARS},L));
      }
      // trait sous la valeur R/Ø : longueur du texte réel (symbole et tolérances compris)
      const tEl=mepDimDrawText(draw,T,str,pp.up,pp.lo,tx,ty,ux<0?'end':'start',null,false,pp.sym,pp.par,pp.post);
      let tw=mepTxtW(tEl,str+(pp.sym?' '+pp.sym:''),fs);
      if(pp.up||pp.lo)tw+=mepDimStackGap()+mepDimStackW(pp.up,pp.lo,pp.par,pp.post); // pile des écarts comprise
      tw=Math.max(hh,tw);
      const u0=ux<0?tx-tw:tx,u1=ux<0?tx:tx+tw;
      draw('line',Object.assign({x1:u0,y1:ty+uOff,x2:u1,y2:ty+uOff},L));
      return;
    }
    if(d.kind==='ang'){
      const g=mepAngGeom(sh,d);
      if(!g)return;
      const O=g.O,r=mepAngRadius(d);
      let aa=g.a1,bb=g.a2,dd=bb-aa;
      while(dd<=-Math.PI)dd+=2*Math.PI;
      while(dd>Math.PI)dd-=2*Math.PI;
      const sweep=dd>0?1:0;
      const x1=O.x+r*Math.cos(aa),y1=O.y+r*Math.sin(aa);
      const x2=O.x+r*Math.cos(bb),y2=O.y+r*Math.sin(bb);
      // rappels : prolongent chaque arête jusqu'à l'arc (vide au départ, dépassement après l'arc)
      if(g.ext)[[aa,g.ext[0]],[bb,g.ext[1]]].forEach(([a,e])=>{
        const ux=Math.cos(a),uy=Math.sin(a),gap=MEP_DIM_STYLE.gap,ov=MEP_DIM_STYLE.overrun;
        let s0=null,s1=null;
        if(r>e[1]+0.05){s0=e[1]+gap;s1=r+ov;}
        else if(r<e[0]-0.05){s0=e[0]-gap;s1=r-ov;}
        if(s0!==null&&Math.abs(s1-s0)>0.2)draw('line',Object.assign({x1:O.x+ux*s0,y1:O.y+uy*s0,x2:O.x+ux*s1,y2:O.y+uy*s1},L));
      });
      // arc fléché aux deux bouts (pointes sur les rappels)
      draw('path',Object.assign({d:'M'+x1+','+y1+' A'+r+','+r+' 0 0 '+sweep+' '+x2+','+y2,'marker-start':ARS,'marker-end':AR},L));
      const nSeg=Math.max(6,Math.ceil(Math.abs(dd)*r/3));
      for(let k=0;k<nSeg;k++){
        const t0=aa+dd*k/nSeg,t1=aa+dd*(k+1)/nSeg;
        hit.push({x1:O.x+r*Math.cos(t0),y1:O.y+r*Math.sin(t0),
          x2:O.x+r*Math.cos(t1),y2:O.y+r*Math.sin(t1)});
      }
      const mx=O.x+(r+7)*Math.cos(aa+dd/2),my=O.y+(r+7)*Math.sin(aa+dd/2);
      const pp=mepDimTextParts(d,val);
      mepDimDrawText(draw,T,pp.main,pp.up,pp.lo,mx,my+2,'middle',null,false,pp.sym,pp.par,pp.post);
      return;
    }
    /* linear (len / dist) */
    const g=mepDimLine(sh,d,w);
    if(!g)return;
    const {a1,b1,sa,sb,ea,eb}=g;
    // rappels : perpendiculaires au trait, avec un vide de `gap` au départ de
    // la pièce et un dépassement `over` après la ligne de cote (paramètres).
    draw('line',Object.assign({x1:sa.x,y1:sa.y,x2:ea.x,y2:ea.y},L));
    draw('line',Object.assign({x1:sb.x,y1:sb.y,x2:eb.x,y2:eb.y},L));
    // ligne de cote fléchée
    if(d.arr==='out'){
      const ext=Math.max(2,MEP_DIM_STYLE.arrowLen);
      draw('line',Object.assign({x1:a1.x-g.ux*ext,y1:a1.y-g.uy*ext,
        x2:a1.x,y2:a1.y,'marker-end':AR},L));
      draw('line',Object.assign({x1:b1.x,y1:b1.y,
        x2:b1.x+g.ux*ext,y2:b1.y+g.uy*ext,'marker-start':ARS},L));
      draw('line',Object.assign({x1:a1.x,y1:a1.y,x2:b1.x,y2:b1.y},L));
    }else{
      draw('line',Object.assign({x1:a1.x,y1:a1.y,x2:b1.x,y2:b1.y,'marker-start':ARS,'marker-end':AR},L));
    }
    const ext=mepDimLineExtent(g,d,val);
    const midX=(a1.x+b1.x)/2,midY=(a1.y+b1.y)/2;
    if(ext.end>ext.half+1e-9){
      draw('line',Object.assign({x1:b1.x,y1:b1.y,
        x2:midX+g.ux*ext.end,y2:midY+g.uy*ext.end},L));
    }
    if(ext.start<-ext.half-1e-9){
      draw('line',Object.assign({x1:midX+g.ux*ext.start,y1:midY+g.uy*ext.start,
        x2:a1.x,y2:a1.y},L));
    }
    const ap=mepDimTextAnchorPos(g,d);
    const mx=ap.x,my=ap.y;
    let ang=Math.atan2(g.dy,g.dx)*180/Math.PI;
    let flip=ang>90||ang<-90;
    if(ap.vertical){ang=-90;flip=false;}
    const tr=flip?'rotate('+(ang+180)+' '+mx+' '+my+')':'rotate('+ang+' '+mx+' '+my+')';
    const pp=mepDimTextParts(d,val);
    const main=d.ref?'('+pp.main+')':pp.main;
    mepDimDrawText(draw,T,main,pp.up,pp.lo,mx,my,'middle',tr,flip,pp.sym,pp.par,pp.post);
  }
  /* ═══════════════ P. mini-solveur LM autonome (pas de lien skEdit) ═══════════════
     Points variables (x,y) ; contraintes résiduelles + jacobien numérique.
     Assez pour ligne/rect/cercle/arc + horiz/vert/paral/perp/égale/distance/rayon/angle. */
  function mepSkNew(){return{pts:{},ents:[],cons:[],seq:1};}
  function mepSkPid(sk){return 'p'+(sk.seq++);}
  function mepSkPt(sk,x,y){
    const id=mepSkPid(sk);
    sk.pts[id]={x:+x,y:+y};
    return id;
  }
  function mepSkEnt(sk,e){
    e.id='e'+(sk.seq++);
    sk.ents.push(e);
    return e;
  }
  function mepSkCons(sk,c){
    c.id='c'+(sk.seq++);
    sk.cons.push(c);
    return c;
  }
  /* résidus : r(c)→[num] ; on minimise Σ r² par Gauss-Newton (jacobien numérique) */
  function mepSkResidual(sk,c){
    const P=sk.pts;
    const pt=id=>P[id];
    const ent=id=>sk.ents.find(x=>x.id===id);
    try{
      switch(c.type){
        case 'coincident':{
          const a=pt(c.a),b=pt(c.b);if(!a||!b)return[];
          return[a.x-b.x,a.y-b.y];
        }
        case 'horizontal':{
          const a=pt(c.a),b=pt(c.b);if(!a||!b)return[];
          return[a.y-b.y];
        }
        case 'vertical':{
          const a=pt(c.a),b=pt(c.b);if(!a||!b)return[];
          return[a.x-b.x];
        }
        case 'parallel':{
          const A=ent(c.a),B=ent(c.b);if(!A||!B)return[];
          const a1=pt(A.p1),a2=pt(A.p2),b1=pt(B.p1),b2=pt(B.p2);
          if(!a1||!a2||!b1||!b2)return[];
          const d1x=a2.x-a1.x,d1y=a2.y-a1.y,d2x=b2.x-b1.x,d2y=b2.y-b1.y;
          return[d1x*d2y-d1y*d2x];
        }
        case 'perp':{
          const A=ent(c.a),B=ent(c.b);if(!A||!B)return[];
          const a1=pt(A.p1),a2=pt(A.p2),b1=pt(B.p1),b2=pt(B.p2);
          if(!a1||!a2||!b1||!b2)return[];
          return[(a2.x-a1.x)*(b2.x-b1.x)+(a2.y-a1.y)*(b2.y-b1.y)];
        }
        case 'tangent':{
          const L=ent(c.a),C=ent(c.b);
          if(L&&C&&L.t==='line'&&(C.t==='circle'||C.t==='arc')){
            const a=pt(L.p1),b=pt(L.p2),cc=pt(C.pc);
            if(!a||!b||!cc)return[];
            const dx=b.x-a.x,dy=b.y-a.y,L2=Math.hypot(dx,dy)||1;
            return[Math.abs((cc.x-a.x)*dy-(cc.y-a.y)*dx)/L2-C.r];
          }
          if(C&&L&&C.t==='line'&&(L.t==='circle'||L.t==='arc')){
            const t=c.a;c.a=c.b;c.b=t;
            return mepSkResidual(sk,c);
          }
          return[];
        }
        case 'equal':{
          const A=ent(c.a),B=ent(c.b);if(!A||!B)return[];
          const la=mepSkLen(A),lb=mepSkLen(B);
          if(la==null||lb==null)return[];
          return[la-lb];
        }
        case 'dist':{
          const a=pt(c.a),b=pt(c.b);if(!a||!b)return[];
          return[Math.hypot(b.x-a.x,b.y-a.y)-(c.val||0)];
        }
        case 'radius':{
          const C=ent(c.a);if(!C||(C.t!=='circle'&&C.t!=='arc'))return[];
          return[C.r-(c.val||0)];
        }
        case 'angle':{
          const A=ent(c.a),B=ent(c.b);if(!A||!B)return[];
          const a1=pt(A.p1),a2=pt(A.p2),b1=pt(B.p1),b2=pt(B.p2);
          if(!a1||!a2||!b1||!b2)return[];
          const a=Math.atan2(a2.y-a1.y,a2.x-a1.x),b=Math.atan2(b2.y-b1.y,b2.x-b1.x);
          let d=b-a;
          while(d<=-Math.PI)d+=2*Math.PI;
          while(d>Math.PI)d-=2*Math.PI;
          return[d-(c.val||0)];
        }
        case 'onLine':{
          const p=pt(c.p),L=ent(c.ent);if(!p||!L||L.t!=='line')return[];
          const a=pt(L.p1),b=pt(L.p2);if(!a||!b)return[];
          const dx=b.x-a.x,dy=b.y-a.y,L2=Math.hypot(dx,dy)||1;
          return[((p.x-a.x)*dy-(p.y-a.y)*dx)/L2];
        }
        case 'onCircle':{
          const p=pt(c.p),C=ent(c.ent);if(!p||!C||(C.t!=='circle'&&C.t!=='arc'))return[];
          const cc=pt(C.pc);if(!cc)return[];
          return[Math.hypot(p.x-cc.x,p.y-cc.y)-C.r];
        }
        case 'midpoint':{
          const m=pt(c.p),a=pt(c.a),b=pt(c.b);if(!m||!a||!b)return[];
          return[m.x-(a.x+b.x)/2,m.y-(a.y+b.y)/2];
        }
        case 'distX':{const a=pt(c.a),b=pt(c.b);if(!a||!b)return[];return[(b.x-a.x)-(c.val||0)];}
        case 'distY':{const a=pt(c.a),b=pt(c.b);if(!a||!b)return[];return[(b.y-a.y)-(c.val||0)];}
        case 'distPL':{
          const p=pt(c.p),L=ent(c.ent);if(!p||!L||L.t!=='line')return[];
          const a=pt(L.p1),b=pt(L.p2);if(!a||!b)return[];
          const dx=b.x-a.x,dy=b.y-a.y,L2=Math.hypot(dx,dy)||1;
          return[((p.x-a.x)*dy-(p.y-a.y)*dx)/L2-(c.val||0)];
        }
        case 'eqR':{const A=ent(c.a),B=ent(c.b);if(!A||!B||A.r==null||B.r==null)return[];return[A.r-B.r];}
        default:return[];
      }
    }catch(e){return[];}
  }
  function mepSkLen(E){
    if(!E)return null;
    if(E.t==='line'){
      const A=mepSkPtOf(E,'p1'),B=mepSkPtOf(E,'p2');
      if(!A||!B)return null;
      return Math.hypot(B.x-A.x,B.y-A.y);
    }
    if(E.t==='circle')return 2*Math.PI*E.r;
    if(E.t==='arc')return null;
    return null;
  }
  /* points d'une entité via closure sur sk (set par mepSkSolve) */
  let _mepSkCur=null;
  function mepSkPtOf(E,k){const sk=_mepSkCur;return sk&&E[k]?sk.pts[E[k]]:null;}
  /* solveur (V0.3.12) : Levenberg-Marquardt sur les seules variables touchées par une contrainte,
     jacobien numérique CREUX (chaque contrainte ne dérive que ses points/rayons) ;
     points fixes (contrainte « fix », origine « o » du cartouche, points tenus pendant un glisser)
     exclus des variables. Renvoie le plus grand résidu (≈ 0 : esquisse cohérente). */
  function mepSkFixed(sk){
    const s=new Set();if(sk.pts&&sk.pts.o)s.add('o');
    (sk.cons||[]).forEach(c=>{if(c.type==='fix'&&c.p)s.add(c.p);});
    Object.keys(sk.pts||{}).forEach(id=>{if(sk.pts[id].lk)s.add(id);});
    return s;
  }
  function mepSkConRefs(sk,c){
    const P=new Set(),R=new Set();
    const addE=id=>{const e=sk.ents.find(x=>x.id===id);if(!e)return;
      ['p1','p2','pc','p'].forEach(k=>{if(e[k])P.add(e[k]);});
      if(e.t==='circle'||e.t==='arc')R.add(e.id);};
    ['a','b','p'].forEach(k=>{const v=c[k];if(!v)return;if(sk.pts[v])P.add(v);else addE(v);});
    if(c.ent)addE(c.ent);
    return{P,R};
  }
  function mepSolveDense(A,g,n){
    const M=new Float64Array(A),b=new Float64Array(g);
    for(let col=0;col<n;col++){
      let piv=col;for(let r=col+1;r<n;r++)if(Math.abs(M[r*n+col])>Math.abs(M[piv*n+col]))piv=r;
      if(Math.abs(M[piv*n+col])<1e-14)return null;
      if(piv!==col){for(let c=0;c<n;c++){const t=M[piv*n+c];M[piv*n+c]=M[col*n+c];M[col*n+c]=t;}const t=b[piv];b[piv]=b[col];b[col]=t;}
      const d=M[col*n+col];
      for(let r=col+1;r<n;r++){const f=M[r*n+col]/d;if(!f)continue;for(let c=col;c<n;c++)M[r*n+c]-=f*M[col*n+c];b[r]-=f*b[col];}
    }
    const x=new Float64Array(n);
    for(let i=n-1;i>=0;i--){let s=b[i];for(let j=i+1;j<n;j++)s-=M[i*n+j]*x[j];x[i]=s/M[i*n+i];}
    return x;
  }
  function mepSkErr(sk,cons){
    let m=0;cons.forEach(c=>mepSkResidual(sk,c).forEach(v=>{if(isFinite(v))m=Math.max(m,Math.abs(v));}));return m;
  }
  function mepSkSS(sk,cons){
    let s=0;cons.forEach(c=>mepSkResidual(sk,c).forEach(v=>{if(isFinite(v))s+=v*v;}));return s;
  }
  function mepSkSolve(sk,iters,anchors){
    if(!sk||!sk.cons||!sk.cons.length)return 0;
    _mepSkCur=sk;
    const fixed=mepSkFixed(sk);(anchors||[]).forEach(p=>fixed.add(p));
    const cons=sk.cons.filter(c=>c.type!=='fix');
    const refs=cons.map(c=>mepSkConRefs(sk,c));
    const vIdx=new Map(),vars=[];
    const addPv=pid=>{if(fixed.has(pid)||vIdx.has('p'+pid)||!sk.pts[pid])return;vIdx.set('p'+pid,vars.length);
      const p=sk.pts[pid];vars.push({get:()=>p.x,set:v=>{p.x=v;}});vars.push({get:()=>p.y,set:v=>{p.y=v;}});};
    const addRv=eid=>{if(vIdx.has('r'+eid))return;const e=sk.ents.find(x=>x.id===eid);if(!e)return;
      vIdx.set('r'+eid,vars.length);vars.push({get:()=>e.r,set:v=>{e.r=Math.max(0.01,v);}});};
    refs.forEach(r=>{r.P.forEach(addPv);r.R.forEach(addRv);});
    const cols=refs.map(r=>{const a=[];r.P.forEach(pid=>{const i=vIdx.get('p'+pid);if(i!=null)a.push(i,i+1);});
      r.R.forEach(eid=>{const i=vIdx.get('r'+eid);if(i!=null)a.push(i);});return a;});
    const n=vars.length;
    let ss=mepSkSS(sk,cons),lam=1e-3;
    for(let it=0;it<(iters||60)&&n&&ss>1e-16;it++){
      const A=new Float64Array(n*n),g=new Float64Array(n),eps=1e-6;
      cons.forEach((c,ci)=>{
        const cs=cols[ci];if(!cs.length)return;
        const r0=mepSkResidual(sk,c);if(!r0.length)return;
        const J=cs.map(j=>{const x0=vars[j].get();vars[j].set(x0+eps);const r1=mepSkResidual(sk,c);vars[j].set(x0);
          return r0.map((v,q)=>(isFinite(v)&&isFinite(r1[q]))?(r1[q]-v)/eps:0);});
        for(let q=0;q<r0.length;q++){if(!isFinite(r0[q]))continue;
          for(let a=0;a<cs.length;a++){const ja=J[a][q];if(!ja)continue;g[cs[a]]+=ja*r0[q];
            for(let b=0;b<cs.length;b++){const jb=J[b][q];if(jb)A[cs[a]*n+cs[b]]+=ja*jb;}}}
      });
      const save=vars.map(v=>v.get());
      let ok=false;
      for(let tries=0;tries<6&&!ok;tries++){
        const M=new Float64Array(A);for(let i=0;i<n;i++)M[i*n+i]+=lam*(1+A[i*n+i]);
        const dx=mepSolveDense(M,g,n);if(!dx){lam*=10;continue;}
        for(let j=0;j<n;j++)vars[j].set(save[j]-dx[j]);
        const s2=mepSkSS(sk,cons);
        if(s2<ss||s2<1e-18){ss=s2;lam=Math.max(1e-9,lam/4);ok=true;}
        else{for(let j=0;j<n;j++)vars[j].set(save[j]);lam*=8;}
      }
      if(!ok)break;
    }
    const err=mepSkErr(sk,cons);
    _mepSkCur=null;
    return err;
  }
  /* ═══════════════ Q. esquisse de planche : outils de dessin ═══════════════ */
  function mepSkEnsure(sh){
    if(!sh.sk)sh.sk=mepSkNew();
    if(!sh.sk.pts)sh.sk.pts={};
    if(!sh.sk.ents)sh.sk.ents=[];
    if(!sh.sk.cons)sh.sk.cons=[];
    if(!sh.sk.seq)sh.sk.seq=1;
    return sh.sk;
  }
  /* snap sur géométrie projetée (toutes vues) + points d'esquisse */
  function mepSnapPt(sx,sy,sh,opt){
    sh=sh||mepSheet();
    const tol=6/mepSt.zoom; // 6 mm papier écran
    let best={x:sx,y:sy,hit:null};
    let bd=tol;
    const consider=(x,y,hit)=>{
      const d=Math.hypot(x-sx,y-sy);
      if(d<bd){bd=d;best={x,y,hit};}
    };
    sh.views.forEach(v=>{
      const g=mepGeoOf(v);
      g.els.forEach((e,i)=>{
        if(e.t==='L'){
          consider(v.x+e.x1*v.scale,v.y+e.y1*v.scale,{t:'end',vid:v.id,i});
          consider(v.x+e.x2*v.scale,v.y+e.y2*v.scale,{t:'end',vid:v.id,i});
          // milieu de segment
          consider(v.x+(e.x1+e.x2)/2*v.scale,v.y+(e.y1+e.y2)/2*v.scale,{t:'mid',vid:v.id,i});
          // projection sur le segment
          const ax=v.x+e.x1*v.scale,ay=v.y+e.y1*v.scale,bx=v.x+e.x2*v.scale,by=v.y+e.y2*v.scale;
          const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;
          if(L2>1e-12){
            const t=Math.max(0,Math.min(1,((sx-ax)*dx+(sy-ay)*dy)/L2));
            consider(ax+dx*t,ay+dy*t,{t:'onSeg',vid:v.id,i});
          }
        }else if(e.t==='C'||e.t==='A'){
          const cx=v.x+e.cx*v.scale,cy=v.y+e.cy*v.scale,r=e.r*v.scale;
          if(e.t==='C'){
            consider(cx,cy,{t:'ctr',vid:v.id,i});
            const a=Math.atan2(sy-cy,sx-cx);
            consider(cx+r*Math.cos(a),cy+r*Math.sin(a),{t:'onC',vid:v.id,i});
          }else{
            consider(cx,cy,{t:'ctr',vid:v.id,i});
            const a=Math.atan2(sy-cy,sx-cx);
            // borne l'angle à l'arc : projection sur l'arc sinon extrémité la plus proche
            let aa=a;
            const lo=Math.min(e.a0,e.a1),hi=Math.max(e.a0,e.a1);
            let an=a;
            while(an<lo)an+=2*Math.PI;
            if(an>hi){
              const d0=Math.abs(a-e.a0),d1=Math.abs(a-e.a1);
              aa=d0<d1?e.a0:e.a1;
            }else aa=an;
            consider(cx+r*Math.cos(aa),cy+r*Math.sin(aa),{t:'onC',vid:v.id,i});
          }
        }
      });
    });
    // 2026-10-22-013 : traits d'axe — extrémités, milieux, centres, et le trait lui-même
    if(!(opt&&opt.noAxes))sh.views.forEach(v=>{
      mepAxisLines(sh,v).forEach(p=>{
        if(p.t==='L'){
          const ax=v.x+p.x1*v.scale,ay=v.y+p.y1*v.scale,bx=v.x+p.x2*v.scale,by=v.y+p.y2*v.scale;
          // extrémités prioritaires (sinon le croisement d'arêtes voisines les masque)
          const pull=0.6;
          [[ax,ay],[bx,by]].forEach(([x,y])=>{const d=Math.hypot(x-sx,y-sy)*pull;
            if(d<bd){bd=d;best={x,y,hit:{t:'axEnd',vid:v.id,ak:p.ak}};}});
          consider((ax+bx)/2,(ay+by)/2,{t:'axMid',vid:v.id,ak:p.ak});
          const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;
          if(L2>1e-12){
            const t=Math.max(0,Math.min(1,((sx-ax)*dx+(sy-ay)*dy)/L2));
            consider(ax+dx*t,ay+dy*t,{t:'onAx',vid:v.id,ak:p.ak});
          }
        }else if(p.t==='C'){
          const cx=v.x+p.cx*v.scale,cy=v.y+p.cy*v.scale,r=p.r*v.scale;
          consider(cx,cy,{t:'ctr',vid:v.id,ak:p.ak});
          const a=Math.atan2(sy-cy,sx-cx);
          consider(cx+r*Math.cos(a),cy+r*Math.sin(a),{t:'onAx',vid:v.id,ak:p.ak});
        }
      });
    });
    // points d'esquisse
    const sk=sh.sk;
    if(sk)Object.keys(sk.pts).forEach(pid=>{
      const p=sk.pts[pid];
      consider(vxOf(p),vyOf(p),{t:'skPt',pid});
    });
    function vxOf(p){return p.x;} // pts déjà en mm papier
    function vyOf(p){return p.y;}
    return best;
  }
  /* mm papier → coordonnées locales d'une vue (pour création de cote) */
  function mepHitViewEnt(sh,sx,sy,opt){
    // → {vid,i,e,lx,ly} entité projetée la plus proche
    // opt.axes : les traits d'axe comptent aussi (cotes) — i='ax:<clé>'
    let best=null,bd=4/mepSt.zoom;
    sh.views.forEach(v=>{
      if(!(opt&&opt.axes))return;
      const lx=(sx-v.x)/v.scale,ly=(sy-v.y)/v.scale;
      mepAxisLines(sh,v).forEach(p=>{
        let d;
        if(p.t==='L'){
          const dx=p.x2-p.x1,dy=p.y2-p.y1,L2=dx*dx+dy*dy;
          const t=L2>1e-12?Math.max(0,Math.min(1,((lx-p.x1)*dx+(ly-p.y1)*dy)/L2)):0;
          d=Math.hypot(lx-(p.x1+dx*t),ly-(p.y1+dy*t))*v.scale;
        }else if(p.t==='C')d=Math.abs(Math.hypot(lx-p.cx,ly-p.cy)-p.r)*v.scale;
        else return;
        if(d<bd){bd=d;best={vid:v.id,i:'ax:'+p.ak,e:p,lx,ly};}
      });
    });
    if(best)bd*=1.001; // à égalité, l’arête réelle l’emporte
    sh.views.forEach(v=>{
      const g=mepGeoOf(v);
      g.els.forEach((e,i)=>{
        const lx=(sx-v.x)/v.scale,ly=(sy-v.y)/v.scale;
        if(e.t==='L'){
          const ax=e.x1,ay=e.y1,bx=e.x2,by=e.y2;
          const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;
          let d;
          if(L2<1e-12)d=Math.hypot(lx-ax,ly-ay);
          else{
            const t=Math.max(0,Math.min(1,((lx-ax)*dx+(ly-ay)*dy)/L2));
            d=Math.hypot(lx-(ax+dx*t),ly-(ay+dy*t));
          }
          const dp=d*v.scale;
          if(dp<bd){bd=dp;best={vid:v.id,i,e,lx,ly};}
        }else if(e.t==='C'||e.t==='A'){
          let d;
          if(e.t==='C')d=Math.abs(Math.hypot(lx-e.cx,ly-e.cy)-e.r)*v.scale;
          else{
            const dx=lx-e.cx,dy=ly-e.cy,dh=Math.hypot(dx,dy);
            const a=Math.atan2(dy,dx);
            const lo=Math.min(e.a0,e.a1),hi=Math.max(e.a0,e.a1);
            let an=a;while(an<lo)an+=2*Math.PI;
            if(dh<1e-9||an>hi){
              // hors plage angulaire : distance à l'extrémité la plus proche
              const p0=[e.cx+e.r*Math.cos(e.a0),e.cy+e.r*Math.sin(e.a0)],p1=[e.cx+e.r*Math.cos(e.a1),e.cy+e.r*Math.sin(e.a1)];
              d=Math.min(Math.hypot(lx-p0[0],ly-p0[1]),Math.hypot(lx-p1[0],ly-p1[1]))*v.scale;
            }else d=Math.abs(dh-e.r)*v.scale;
          }
          if(d<bd){bd=d;best={vid:v.id,i,e,lx,ly};}
        }
      });
    });
    return best;
  }
  /* ═══════════════ R. dessin 2D (esquisse de planche) ═══════════════ */
  /* ajuster (trim) : retire le tronçon entre 2 intersections */
  function mepSkTrim(sh,sx,sy){
    // Ajuster (comme Fusion) : le tronçon cliqué, entre les intersections voisines, disparaît ;
    // sans intersection, toute la ligne. Intersections avec les SEGMENTS, cercles et arcs (pas les
    // droites prolongées) ; les morceaux gardent leurs extrémités (liaisons et contraintes), les points
    // de coupe restent sur l'élément coupant, l'horizontale / verticale d'origine est reportée.
    const ctx=mepSkCtx(sh,true),sk=ctx.sk; // esquisse de planche ou cartouche en édition
    sx-=ctx.ox;sy-=ctx.oy;
    let best=null,bd=Math.max(1.5,mepSkTol());
    sk.ents.forEach(e=>{
      if(e.t!=='line')return;
      const A=sk.pts[e.p1],B=sk.pts[e.p2];if(!A||!B)return;
      const dx=B.x-A.x,dy=B.y-A.y,L2=dx*dx+dy*dy;
      if(L2<1e-12)return;
      const t=Math.max(0,Math.min(1,((sx-A.x)*dx+(sy-A.y)*dy)/L2));
      const d=Math.hypot(sx-(A.x+dx*t),sy-(A.y+dy*t));
      if(d<bd){bd=d;best={e,t,A,B};}
    });
    if(!best){mepStatus('Ajuster : cliquez le tronçon de ligne à retirer.');return false;}
    const{e,t,A,B}=best,L=Math.hypot(B.x-A.x,B.y-A.y),eps=1e-4/Math.max(L,1e-9)+1e-6;
    const xs=[]; // {t, ent}
    const onArc=(o,C,x,y)=>{if(o.t!=='arc')return true;
      const P1=sk.pts[o.p1],P2=sk.pts[o.p2];if(!P1||!P2)return true;
      const a0=Math.atan2(P1.y-C.y,P1.x-C.x),a1=Math.atan2(P2.y-C.y,P2.x-C.x),a=Math.atan2(y-C.y,x-C.x);
      const n=v=>{while(v<0)v+=2*Math.PI;while(v>=2*Math.PI)v-=2*Math.PI;return v;};
      return n(a-a0)<=n(a1-a0)+1e-6;};
    sk.ents.forEach(o=>{
      if(o===e||o.cst&&!e.cst)return; // une construction ne coupe pas un trait réel
      if(o.t==='line'){
        const C=sk.pts[o.p1],D=sk.pts[o.p2];if(!C||!D)return;
        const ip=interLineLine(A,B,C,D);
        if(ip&&ip.u>=-1e-6&&ip.u<=1+1e-6&&ip.t>eps&&ip.t<1-eps)xs.push({t:ip.t,o});
      }else if(o.t==='circle'||o.t==='arc'){
        const cc=sk.pts[o.pc];if(!cc)return;
        interLineCircle(A,B,cc,o.r).forEach(q=>{if(q.t>eps&&q.t<1-eps&&onArc(o,cc,q.x,q.y))xs.push({t:q.t,o});});
      }
    });
    let lo=null,hi=null;
    xs.forEach(q=>{if(q.t<t){if(!lo||q.t>lo.t)lo=q;}else if(!hi||q.t<hi.t)hi=q;});
    const hv=sk.cons.find(c=>(c.type==='horizontal'||c.type==='vertical')&&((c.a===e.p1&&c.b===e.p2)||(c.a===e.p2&&c.b===e.p1)));
    const style=n=>{['w','lw','lt','col','cst'].forEach(k=>{if(e[k]!==undefined)n[k]=e[k];});return n;};
    const cut=q=>{const id=mepSkPt(sk,A.x+(B.x-A.x)*q.t,A.y+(B.y-A.y)*q.t);
      mepSkCons(sk,q.o.t==='line'?{type:'onLine',p:id,ent:q.o.id}:{type:'onCircle',p:id,ent:q.o.id});return id;};
    const piece=(a,b)=>{mepSkEnt(sk,style({t:'line',p1:a,p2:b}));if(hv)mepSkCons(sk,{type:hv.type,a,b});};
    if(lo)piece(e.p1,cut(lo));
    if(hi)piece(cut(hi),e.p2);
    mepSkRmEnt(sk,e.id);
    mepSkCleanCons(sk);
    mepSkSolve(sk,60);
    mepStatus(lo||hi?'Ajuster : tronçon retiré.':'Ajuster : aucune intersection — ligne entière retirée.');
    return true;
  }
  /* ═══════════════ S. rendu esquisse + brouillons ═══════════════ */
  function mepDrawAxisDraft(mk){
    const sh=mepSheet();
    if(mepSt.axisFree&&mepSt.axisFree.a){
      const a=mepSt.axisFree.a,c=mepSt.axisFree.cur;
      if(c)mk('line',{x1:a.x,y1:a.y,x2:c.x,y2:c.y,class:'mepDraft'});
      return;
    }
    const refs=mepSt.axisPick||[];
    if(!refs.length)return;
    const v=mepView(sh,refs[0].vid);if(!v)return;
    const hs=refs.map(r=>mepAxisRefGeom(sh,v,r)).filter(Boolean);
    hs.forEach(h=>{
      mk('circle',{cx:+(v.x+h.x*v.scale).toFixed(3),cy:+(v.y+h.y*v.scale).toFixed(3),
        r:+(3/mepSt.zoom).toFixed(3),class:'mepAxisPick'});
    });
    if(mepSt.axisMode==='align'&&hs.length>=2){
      mepAxisAlignPrims(hs,v,false).forEach(p=>mepDrawAxisPrim(mk,p,v,'mepDraft'));
    }else if(mepSt.axisMode==='pitch'&&hs.length>=3){
      const C=mepAxisFitCircle(hs);
      if(C)mk('circle',{cx:+(v.x+C.cx*v.scale).toFixed(3),cy:+(v.y+C.cy*v.scale).toFixed(3),
        r:+(C.r*v.scale).toFixed(3),class:'mepDraft'});
    }
  }
  function mepDrawDraft(mk){
    if(mepSt.tool==='axis'){mepDrawAxisDraft(mk);return;}
    const P=mepSt.pick;
    if(!P)return;
    if(P.kind==='box'){
      if(!P.drag)return;
      const B=mepBoxRect(P);
      mk('rect',{x:B.x0,y:B.y0,width:B.x1-B.x0,height:B.y1-B.y0,class:B.cross?'mepBoxCross':'mepBoxWin'},mepGHlp);
      return;
    }
    const dashed={class:'mepDraft'};
    if(P.kind==='viewDrag'){
      // rien de spécial (la vue suit déjà)
    }else if(P.kind==='line'||P.kind==='rect'||P.kind==='logo'){
      const s=P.start,c=P.cur;
      if(P.kind==='line')mk('line',Object.assign({x1:s.x,y1:s.y,x2:c.x,y2:c.y},dashed));
      else mk('rect',Object.assign({x:Math.min(s.x,c.x),y:Math.min(s.y,c.y),width:Math.abs(c.x-s.x),height:Math.abs(c.y-s.y)},dashed));
    }else if(P.kind==='circle'){
      const r=Math.hypot(P.cur.x-P.start.x,P.cur.y-P.start.y);
      mk('circle',Object.assign({cx:P.start.x,cy:P.start.y,r},dashed));
    }else if(P.kind==='arc'){
      mk('circle',Object.assign({cx:P.start.x,cy:P.start.y,r:P.r||0},dashed));
    }else if(P.kind==='cut2'&&P.pts&&P.pts.length){
      const pts=P.pts.concat([P.cur]).filter(Boolean);
      if(pts.length>=2)mk('line',Object.assign({x1:pts[0].x,y1:pts[0].y,x2:pts[pts.length-1].x,y2:pts[pts.length-1].y,class:'mepCut','stroke-dasharray':'6 2'}));
    }else if(P.kind==='det2'){
      if(P.cur&&P.start)mk('circle',Object.assign({cx:P.start.x,cy:P.start.y,r:Math.hypot(P.cur.x-P.start.x,P.cur.y-P.start.y),class:'mepEnt mepSel','stroke-dasharray':'3 2'}));
    }else if(P.kind==='dim'){
      // rappel visuel entre les 2 points
      const a=P.a,b=P.cur;
      if(a&&b)mk('line',Object.assign({x1:a.x,y1:a.y,x2:b.x,y2:b.y},dashed));
    }
  }
  /* ═══════════════ T. interactions souris ═══════════════ */
  function mepSetTool(t){
    mepCtxHide();
    try{if(typeof mfCloseMenus==='function')mfCloseMenus();}catch(e){}
    const next=t||'select';
    // 2026-10-22-018 : groupe d'ordonnées sélectionné + outil Ordonnées du même axe → on y AJOUTE des points
    let ordKeep=null;
    if(next==='ordx'||next==='ordy'){
      const sh0=mepSheet(),g0=sh0&&mepSt.selDim?sh0.dims.find(x=>x.id===mepSt.selDim):null;
      if(g0&&g0.kind==='ord'&&(g0.axis==='y')===(next==='ordy'))ordKeep=g0.id;
    }
    if(next!=='select'&&next!==mepSt.tool){mepSt.sel=null;mepSt.selDim=null;mepSt.selAxis=null;}
    mepSt.tool=next;
    if(next==='select')mepSt.entSel=[];
    mepSt.pick=null;mepSt.dim=null;mepSt.cutPts=[];mepSt.detC=null;mepSt.hovEnt=null;mepSt.skSel=new Set();mepSt.lot=null;mepSt.vcmd=null;
    mepSt.axisPick=[];mepSt.axisFree=null;mepSt.ord=null;mepSt.ordPt=null;
    if(ordKeep){mepSt.ord=ordKeep;mepSt.selDim=ordKeep;mepStatus('Ordonnées : cliquez les points à AJOUTER au groupe sélectionné (Entrée ou Échap pour terminer).');}
    mepToolSync();
    try{mepSideShow();}catch(e){}
    if(mepSt.tool==='dim'&&mepSt.entSel&&mepSt.entSel.length){
      const d=mepDimDraftFromSel();
      if(d){
        d.__sel=false;
        mepSt.dim=d;mepRender();
        mepStatus(mepSt.entSel.length>=2
          ?'2 entités — cliquez pour poser la cote (clic droit : R/Ø, Échap annule).'
          :'Cote : cliquez une 2ᵉ entité ou posez la cote (clic droit : R/Ø, Échap annule).');
        return;
      }
      mepRender();
      mepStatus('Cote : sélectionnez 1 arête/cercle (ou 2 pour angle/entraxe).');
      return;
    }
    if(mepSt.tool==='hole'&&mepSt.entSel&&mepSt.entSel.length===1){
      const sh=mepSheet(),s=mepSt.entSel[0],ref=mepEntRef(sh,s);
      if(ref&&ref.e.t==='C'){
        const d=mepHoleDraft(sh,ref.v.id,ref.e,ref.i);
        if(d){
          d.__sel=false;
          mepSt.dim=d;mepRender();
          mepStatus('Perçage : cliquez pour placer l’étiquette (Échap annule).');
          return;
        }
      }
      mepStatus('Perçage : ce cercle ne correspond pas à une fonction Perçage.');
      mepRender();
      return;
    }
    const msg={
      select:'Sélection : clic = entité · clic sur cote = la déplacer · glisser = déplacer la vue · Suppr = effacer',
      line:'Ligne : cliquez le départ, puis l’arrivée (snap auto). Échap pour annuler.',
      rect:'Rectangle : clic 1 = coin, clic 2 = opposé.',
      circle:'Cercle : centre + un point du rayon.',
      arc:'Arc 3 points : centre, départ, arrivée.',
      point:'Point : cliquez pour placer.',
      trim:'Ajuster : cliquez le tronçon à couper entre 2 intersections.',
      dim:'Cote : cliquez une arête/cercle · 2ᵉ entité pour distance/angle · cliquez pour poser · glissez un trait rouge pour déplacer',
      hole:'Perçage : cliquez un cercle de perçage, puis posez l’étiquette.',
      axis:'Axes : cliquez un trou (ou utilisez Alignement / Cercle / Libre dans le panneau).',
      cut2:'Coupe : 2 clics sur la ligne de coupe.',
      det2:'Détail : centre + rayon.'
    }[t]||'';
    if(msg)mepStatus(msg);
    mepRender();
  }
  function mepAxisModeStatus(){
    const m=mepSt.axisMode||'hole',n=(mepSt.axisPick||[]).length;
    if(m==='align')return 'Alignement : '+n+' trou(s) sélectionné(s) — cliquez encore ou Entrée pour créer.';
    if(m==='pitch')return 'Cercle de perçage : '+n+' trou(s) sélectionné(s) — cliquez encore ou Entrée pour créer.';
    if(m==='free')return 'Axe libre : cliquez le départ puis l’arrivée.';
    if(m==='sym')return mepSt.axisSym?'Axe de symétrie : cliquez la 2ᵉ droite.':'Axe de symétrie : cliquez 2 droites (parallèles : axe médian ; sécantes : bissectrice).';
    return 'Axe de trou : cliquez un trou.';
  }
  function mepSetAxisMode(m){
    mepSt.axisMode=m||'hole';mepSt.axisSym=null;
    mepSetTool('axis');
    mepStatus(mepAxisModeStatus());
    try{mepSideShow();}catch(e){}
  }
  function mepAxisCommitPattern(){
    const mode=mepSt.axisMode||'hole';
    const picks=(mepSt.axisPick||[]).slice();
    if(!picks.length)return false;
    const sh=mepSheet(),v=mepView(sh,picks[0].vid);
    if(!v){mepStatus('Axe : vue introuvable.');return false;}
    if(picks.some(r=>r.vid!==v.id)){mepStatus('Axe : sélectionnez les trous dans la même vue.');return false;}
    const hs=picks.map(r=>mepAxisRefGeom(sh,v,r)).filter(Boolean);
    const tol=MEP_AXIS.tol/mepAxisScale(v);
    if(mode==='align'){
      if(hs.length<2){mepStatus('Alignement : sélectionnez au moins 2 trous.');return false;}
      if(!mepAxisCollinear(hs,tol)){mepStatus('Alignement : les centres ne sont pas alignés.');return false;}
      mepSt.axisPick=[];
      mepEdit('axe aligné',()=>{v.axes.push({id:mepUid('ax'),kind:'align',refs:picks});});
      mepStatus('Axe commun créé sur '+hs.length+' trous.');
      return true;
    }
    if(mode==='pitch'){
      if(hs.length<3){mepStatus('Cercle de perçage : sélectionnez au moins 3 trous.');return false;}
      const C=mepAxisFitCircle(hs);
      if(!C||mepAxisResidual(hs,C)>Math.max(0.1,tol*2)){mepStatus('Cercle de perçage : les centres ne sont pas sur un même cercle.');return false;}
      mepSt.axisPick=[];
      mepEdit('cercle de perçage',()=>{v.axes.push({id:mepUid('ax'),kind:'pitch',refs:picks});});
      mepStatus('Cercle de perçage créé sur '+hs.length+' trous.');
      return true;
    }
    return false;
  }
  function mepAxisCommitFree(a,b){
    if(!a||!b||a.vid!==b.vid)return false;
    const sh=mepSheet(),v=mepView(sh,a.vid);
    if(!v)return false;
    const A={x:(a.x-v.x)/v.scale,y:(a.y-v.y)/v.scale};
    const B={x:(b.x-v.x)/v.scale,y:(b.y-v.y)/v.scale};
    if(Math.hypot(B.x-A.x,B.y-A.y)<0.2){mepStatus('Axe libre : points confondus.');return false;}
    mepSt.axisFree=null;
    mepEdit('axe libre',()=>{v.axes.push({id:mepUid('ax'),kind:'free',a:A,b:B});});
    mepStatus('Axe libre créé.');
    return true;
  }
  /* 2026-10-22-012 : AXE DE SYMÉTRIE entre 2 droites d'une vue (« je dois pouvoir
     faire un axe symétrique à 2 droites ») — parallèles : axe médian ; sécantes :
     bissectrice de l'angle qui les contient. Longueur = étendue des 2 droites
     sur l'axe + dépassement normalisé ; enregistré comme axe libre (a, b) : ses
     extrémités se tirent à la souris. */
  function mepAxisSymGeom(e1,e2,v){
    const A1=[e1.x1,e1.y1],B1=[e1.x2,e1.y2],A2=[e2.x1,e2.y1],B2=[e2.x2,e2.y2];
    const nrm=d=>{const L=Math.hypot(d[0],d[1]);return L>1e-12?[d[0]/L,d[1]/L]:null;};
    let d1=nrm([B1[0]-A1[0],B1[1]-A1[1]]),d2=nrm([B2[0]-A2[0],B2[1]-A2[1]]);
    if(!d1||!d2)return null;
    const pts=[A1,B1,A2,B2],over=MEP_AXIS.overrun/mepAxisScale(v);
    const cr=d1[0]*d2[1]-d1[1]*d2[0];
    let O,u;
    if(Math.abs(cr)<0.02){ // parallèles : médiane
      if(d1[0]*d2[0]+d1[1]*d2[1]<0)d2=[-d2[0],-d2[1]];
      u=nrm([d1[0]+d2[0],d1[1]+d2[1]]);
      O=[(A1[0]+B1[0]+A2[0]+B2[0])/4,(A1[1]+B1[1]+A2[1]+B2[1])/4];
    }else{ // sécantes : bissectrice depuis l'intersection X
      const t=((A2[0]-A1[0])*d2[1]-(A2[1]-A1[1])*d2[0])/cr;
      const X=[A1[0]+d1[0]*t,A1[1]+d1[1]*t];
      const away=(A,B,d)=>{const far=Math.hypot(A[0]-X[0],A[1]-X[1])>Math.hypot(B[0]-X[0],B[1]-X[1])?A:B;
        return (far[0]-X[0])*d[0]+(far[1]-X[1])*d[1]<0?[-d[0],-d[1]]:d;};
      d1=away(A1,B1,d1);d2=away(A2,B2,d2);
      u=nrm([d1[0]+d2[0],d1[1]+d2[1]]);if(!u)return null;
      O=X;
    }
    const ts=pts.map(p=>(p[0]-O[0])*u[0]+(p[1]-O[1])*u[1]);
    const t0=Math.min(...ts)-over,t1=Math.max(...ts)+over;
    return{a:{x:O[0]+u[0]*t0,y:O[1]+u[1]*t0},b:{x:O[0]+u[0]*t1,y:O[1]+u[1]*t1}};
  }
  /* 2026-10-22-004 : l'axe de symétrie SUIT ses arêtes (« la fonction Axes (Symétrie)
     doit suivre ses arêtes si elles bougent ») — ann {kind:'sym', l1, l2} garde les 2
     droites sources (mm modèle de la vue). À chaque géométrie neuve de la vue, chacune
     est retrouvée : même direction (± 2°), puis le trait le plus proche en position et
     en longueur ; l1/l2 sont mis à jour (suivi pas à pas des modifications). Aucune
     droite parallèle trouvée : la dernière position connue est gardée. */
  // coût d'appariement d'un trait e avec un trait mémorisé L (même direction, même nature de trait)
  function mepAxisTrackCost(L,e){
    const dx=L.x2-L.x1,dy=L.y2-L.y1,len=Math.hypot(dx,dy);if(!(len>1e-9)||e.t!=='L')return Infinity;
    if(L.k&&e.k&&L.k!==e.k)return Infinity; // caché ≠ vu ≠ filetage
    if(!L.k&&(e.k==='thread'||e.k==='threadH'))return Infinity; // ancienne référence : jamais un trait de filetage
    const ex=e.x2-e.x1,ey=e.y2-e.y1,el=Math.hypot(ex,ey);if(!(el>1e-9))return Infinity;
    const ux=dx/len,uy=dy/len;
    if(Math.abs(ux*ey/el-uy*ex/el)>0.035)return Infinity;
    const cx=(e.x1+e.x2)/2-(L.x1+L.x2)/2,cy=(e.y1+e.y2)/2-(L.y1+L.y2)/2;
    return Math.abs(cx*uy-cy*ux)+0.5*Math.abs(cx*ux+cy*uy)+0.5*Math.abs(el-len);
  }
  /* les 2 droites d'un axe de symétrie suivies ENSEMBLE : même nature, même ordre, écartement
     non effondré (> 30 % de l'original — un trait coupé en deux n'est pas une paire), somme des
     déplacements + variation d'écartement minimale — suivies séparément, chacune sautait sur la
     droite voisine la plus proche (un trait de filetage, l'autre bord du trou…) */
  function mepAxisTrackPair(geo,l1,l2){
    const els=((geo&&geo.els)||[]).filter(e=>e.t==='L');
    const dx=l1.x2-l1.x1,dy=l1.y2-l1.y1,len=Math.hypot(dx,dy);if(!(len>1e-9))return null;
    const nx=-dy/len,ny=dx/len,off=e=>((e.x1+e.x2)/2)*nx+((e.y1+e.y2)/2)*ny,sep0=off(l2)-off(l1);
    const c1=els.map(e=>[e,mepAxisTrackCost(l1,e)]).filter(a=>a[1]<Infinity);
    const c2=els.map(e=>[e,mepAxisTrackCost(l2,e)]).filter(a=>a[1]<Infinity);
    let best=null,bc=Infinity;
    c1.forEach(([a,ca])=>c2.forEach(([b,cb])=>{
      if(a===b||(a.k||'')!==(b.k||''))return; // les 2 droites d'une paire sont de même nature
      const sep=off(b)-off(a);
      if(sep*sep0<=0||Math.abs(sep)<0.3*Math.abs(sep0))return;
      const lim=Math.max(3,0.6*len,0.6*Math.abs(sep0));if(ca>lim||cb>lim)return;
      const c=ca+cb+Math.abs(sep-sep0);if(c<bc){bc=c;best=[a,b];}
    }));
    return best;
  }
  function mepAxisTrackLine(geo,L,skip){
    const dx=L.x2-L.x1,dy=L.y2-L.y1,len=Math.hypot(dx,dy);if(!(len>1e-9))return null;
    const ux=dx/len,uy=dy/len,mx=(L.x1+L.x2)/2,my=(L.y1+L.y2)/2;
    let best=null,bc=Infinity;
    ((geo&&geo.els)||[]).forEach(e=>{
      if(e.t!=='L'||e===skip)return;
      if(L.k&&e.k&&L.k!==e.k)return; // même nature de trait
      const ex=e.x2-e.x1,ey=e.y2-e.y1,el=Math.hypot(ex,ey);if(!(el>1e-9))return;
      if(Math.abs(ux*ey/el-uy*ex/el)>0.035)return; // pas parallèle
      const cx=(e.x1+e.x2)/2-mx,cy=(e.y1+e.y2)/2-my;
      const perp=Math.abs(cx*uy-cy*ux),along=Math.abs(cx*ux+cy*uy);
      const c=perp+0.5*along+0.5*Math.abs(el-len);
      if(c<bc){bc=c;best=e;}
    });
    // 2026-10-22-019 : trop différent → pas retrouvé (on garde la dernière position connue)
    return bc<=Math.max(3,0.6*len)?best:null;
  }
  // géométrie exacte (noyau) : la seule sur laquelle des références peuvent être MISES À JOUR —
  // à l'ouverture, les vues passent d'abord par le maillage (arêtes de triangles)
  function mepGeoExact(g){return !!(g&&(/^OCCT/.test(g.src||'')||g.src==='dxf'));} // DXF : géométrie exacte et figée
  function mepAxisSymMigrate(v,ann){
    // axe de symétrie d'avant V0.3.28 (figé : a, b) → 2 droites parallèles symétriques autour de lui
    const g=mepGeoOf(v);if(!mepGeoExact(g))return;
    const dx=ann.b.x-ann.a.x,dy=ann.b.y-ann.a.y,L=Math.hypot(dx,dy);if(!(L>1e-9))return;
    const ux=dx/L,uy=dy/L,sd=e=>{const mx=(e.x1+e.x2)/2-ann.a.x,my=(e.y1+e.y2)/2-ann.a.y;return mx*uy-my*ux;};
    const par=g.els.filter(e=>{if(e.t!=='L'||e.k==='thread'||e.k==='threadH')return false;const ex=e.x2-e.x1,ey=e.y2-e.y1,el=Math.hypot(ex,ey);
      return el>1e-6&&Math.abs(ux*ey/el-uy*ex/el)<0.02&&Math.abs(sd(e))>0.01;});
    let best=null,bd=Infinity;
    for(let i=0;i<par.length;i++)for(let j=0;j<par.length;j++){
      const a=par[i],b=par[j],da=sd(a),db=sd(b);
      if(da<=0||db>=0||Math.abs(da+db)>0.02||(a.k||'')!==(b.k||''))continue;
      const la=Math.hypot(a.x2-a.x1,a.y2-a.y1),lb=Math.hypot(b.x2-b.x1,b.y2-b.y1);
      if(Math.abs(la-lb)>0.05)continue;
      if(da<bd){bd=da;best=[a,b];}
    }
    if(!best)return;
    const ln=e=>({x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2,k:e.k});
    ann.kind='sym';ann.l1=ln(best[0]);ann.l2=ln(best[1]);delete ann.a;delete ann.b;delete ann.sym;
  }
  function mepAxisSymTrack(v,ann){
    if(!ann.l1||!ann.l2)return null;
    const geo=mepGeoOf(v);
    const pr=mepAxisTrackPair(geo,ann.l1,ann.l2),e1=pr?pr[0]:null,e2=pr?pr[1]:null;
    const ln=e=>({x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2,k:e.k});
    // « les axes de symétrie ne gardent pas leurs références » : à l'ouverture la vue est d'abord
    // calculée sur le MAILLAGE, et le suivi réécrivait l1/l2 sur des arêtes de triangles.
    // Mise à jour seulement sur la géométrie exacte, et sur deux traits retrouvés.
    if(e1&&e2&&mepGeoExact(geo)){ann.l1=ln(e1);ann.l2=ln(e2);} // dérivé de la géométrie : pas d'étape d'annulation
    if(!mepGeoExact(geo))return mepAxisSymGeom(ann.l1,ann.l2,v);
    return mepAxisSymGeom(e1||ann.l1,e2||ann.l2,v);
  }
  function mepAxisClick(sh,P){
    const mode=mepSt.axisMode||'hole';
    if(mode==='sym'){
      const hit=mepHitViewEnt(sh,P.x,P.y);
      if(!hit||!hit.e||hit.e.t!=='L'){mepStatus('Axe de symétrie : cliquez une droite d’une vue.');return;}
      if(!mepSt.axisSym){mepSt.axisSym={vid:hit.vid,e:hit.e};mepStatus(mepAxisModeStatus());mepRender();return;}
      const f=mepSt.axisSym;mepSt.axisSym=null;
      if(f.vid!==hit.vid){mepStatus('Axe de symétrie : les 2 droites doivent être dans la même vue.');return;}
      if(f.e===hit.e){mepStatus('Axe de symétrie : cliquez une AUTRE droite.');mepSt.axisSym=f;return;}
      const v=mepView(sh,hit.vid);if(!v)return;
      const G=mepAxisSymGeom(f.e,hit.e,v);
      if(!G){mepStatus('Axe de symétrie : droites dégénérées.');return;}
      if(!Array.isArray(v.axes))v.axes=[];
      const ln=e=>({x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2,k:e.k});
      mepEdit('axe de symétrie',()=>{v.axes.push({id:mepUid('ax'),kind:'sym',l1:ln(f.e),l2:ln(hit.e)});});
      mepStatus('Axe de symétrie créé — tirez ses extrémités pour l’allonger.');
      return;
    }
    if(mode==='free'){
      const snap=mepSnapPt(P.x,P.y,sh),v=mepViewAt(sh,snap.x,snap.y);
      if(!v){mepStatus('Axe libre : cliquez dans une vue.');return;}
      if(!mepSt.axisFree){
        mepSt.axisFree={a:{x:snap.x,y:snap.y,vid:v.id},cur:{x:snap.x,y:snap.y}};
        mepStatus('Axe libre : cliquez le 2ᵉ point.');
        mepRender();return;
      }
      const a=mepSt.axisFree.a;
      if(v.id!==a.vid){mepStatus('Axe libre : les 2 points doivent être dans la même vue.');return;}
      mepAxisCommitFree(a,{x:snap.x,y:snap.y,vid:v.id});
      return;
    }
    const ref=mepAxisHoleAt(sh,P.x,P.y);
    if(!ref){mepStatus('Axe : cliquez un trou.');return;}
    const v=mepView(sh,ref.vid);if(!v)return;
    if(mode==='hole'){
      if(!Array.isArray(v.axes))v.axes=[];
      mepEdit('axe de perçage',()=>{v.axes.push({id:mepUid('ax'),kind:'hole',ref});});
      mepStatus('Axe de trou créé.');
      return;
    }
    if(!Array.isArray(mepSt.axisPick))mepSt.axisPick=[];
    if(mepSt.axisPick.length&&mepSt.axisPick[0].vid!==ref.vid){
      mepStatus('Axe : sélectionnez les trous dans la même vue.');return;
    }
    const ix=mepSt.axisPick.findIndex(r=>r.fid===ref.fid&&r.pid===ref.pid);
    if(ix>=0)mepSt.axisPick.splice(ix,1);else mepSt.axisPick.push(ref);
    mepStatus(mepAxisModeStatus());
    mepRender();
  }
  function mepToolSync(){/* plus de barre d'outils interne — le panneau latéral gère l'outil actif */}
  function mepDimDragStart(sh,P,dim,ev){
    mepSt.selDim=dim.id;mepSt.sel=null;mepSt.entSel=[];
    mepSt.ordPt=dim.kind==='ord'?{id:dim.id,i:mepOrdPtAt(sh,dim,P)}:null;
    // ordonnée + Ctrl : cassure — glisser décale la valeur le long de l'axe (ligne de rappel coudée),
    // Ctrl + clic sans glisser la retire
    if(dim.kind==='ord'&&ev&&(ev.ctrlKey||ev.metaKey)&&mepSt.ordPt.i>=0){
      const q=dim.pts[mepSt.ordPt.i];
      mepSt.pick={kind:'dimDrag',id:dim.id,sx:P.x,sy:P.y,px0:P.px,py0:P.py,jog:{i:mepSt.ordPt.i,j0:+q.jog||0},moved:false,undoPushed:false};
      mepStatus('Cassure : glissez pour dégager la valeur (Ctrl + clic sans glisser : la retire).');
      mepSideShow();mepRender();return;
    }
    const w=mepDimWorld(sh,dim);
    const tp=mepDimTextPos(sh,dim);
    const labelHit=!!tp&&Math.hypot(P.x-tp.x,P.y-tp.y)<=18/(mepSt.zoom||1);
    mepSt.pick={kind:'dimDrag',id:dim.id,sx:P.x,sy:P.y,px0:P.px,py0:P.py,
      cx:w?w.b.x:null,cy:w?w.b.y:null,off0:dim.off,txtOff0:+dim.txtOff||0,labelHit,moved:false,undoPushed:false};
    mepSideShow();mepRender();
  }
  function mepOnDown(ev){
    if(ev.button===1){ // double-clic molette = planche entière
      const now=Date.now();
      if(mepSt.lastMid&&now-mepSt.lastMid<380){mepSt.lastMid=0;mepFitSheet();mepRender();mepStatus('Planche entière.');ev.preventDefault();return;}
      mepSt.lastMid=now;
    }
    if(ev.button===1||(ev.button===0&&ev.altKey)){ // middle / alt = pan
      mepSt.pick={kind:'pan',sx:ev.clientX,sy:ev.clientY,px:mepSt.pan.x,py:mepSt.pan.y};
      mepSvgEl.setPointerCapture(ev.pointerId);
      ev.preventDefault();
      return;
    }
    if(ev.button!==0)return;
    mepSvgEl.setPointerCapture(ev.pointerId);
    const P=mepPt(ev);
    const sh=mepSheet();
    if(mepSt.vcmd){mepVcmdDown(sh,P,ev);return;}
    const tool=mepSt.tool;
    if(tool==='select'){
      if(mepSt.alignDims){ // outil Aligner : ce clic désigne la cote de référence
        const ref=mepDimAt(sh,P.x,P.y),ids=mepSt.alignDims;
        if(!ref){mepStatus('Aligner : cliquez une COTE de référence (Échap pour annuler).');return;}
        mepSt.alignDims=null;
        let res=null;mepEdit('alignement de cotes',()=>{res=mepDimAlignTo(sh,ref,ids);});
        mepStatus(res&&res.n?res.n+' cote(s) alignée(s) sur la référence'+(res.skip?' ; '+res.skip+' ignorée(s) (non parallèle(s))':'')+'.'
          :'Aligner : aucune cote parallèle à la référence.');
        mepSt.selDim=ref.id;mepSideShow();mepRender();return;
      }
      {let dA=(ev.shiftKey||ev.ctrlKey||ev.metaKey)?mepDimAt(sh,P.x,P.y):null;
       if(dA&&dA.kind==='ord'&&(ev.ctrlKey||ev.metaKey)&&!ev.shiftKey){mepDimDragStart(sh,P,dA,ev);return;} // Ctrl : cassure d'ordonnée
       if(dA){ // Maj/Ctrl + clic sur une cote : sélection multiple (la cote déjà active y entre aussi)
         const lot=mepSt.lot||{views:new Set(),dims:new Set()};
         if(mepSt.selDim&&mepSt.selDim!==dA.id&&!lot.dims.size)lot.dims.add(mepSt.selDim);
         if(lot.dims.has(dA.id))lot.dims.delete(dA.id);else lot.dims.add(dA.id);
         mepSt.lot=(lot.views.size||lot.dims.size)?lot:null;mepSt.selDim=null;mepSt.sel=null;
         mepStatus((mepSt.lot?mepSt.lot.dims.size:0)+' cote(s) sélectionnée(s).');
         mepSideShow();mepRender();return;}}
      if(!(ev.shiftKey||ev.ctrlKey||ev.metaKey))mepSt.lot=null;
      // esquisse (planche, ou cartouche en édition) : sélection, Maj = ajout, glisser = déplacer sous contraintes
      {const hk=mepSkHit(sh,P);
       if(hk){
         const add=ev.shiftKey||ev.ctrlKey||ev.metaKey;
         // texte non sélectionné : clic = le sélectionner, glisser = cadre de sélection
         // (les textes couvrent presque tout le cartouche) ; texte déjà sélectionné : glisser = déplacer
         if(hk.key[0]==='e'&&!(mepSt.skSel&&mepSt.skSel.has(hk.key))){
           const c0=mepSkCtx(sh,false),e0=c0.sk&&c0.sk.ents.find(x=>x.id===hk.key.slice(2));
           if(e0&&e0.t==='text'){mepSt.pick={kind:'box',sx:P.x,sy:P.y,cur:{x:P.x,y:P.y},px0:P.px,py0:P.py,add,clickKey:hk.key};return;}
         }
         mepSkSelect(hk.key,add);
         if(!add&&hk.key[0]!=='c'){const ctx=mepSkCtx(sh,false);
           mepSt.pick={kind:'skDrag',key:hk.key,sx:P.x,sy:P.y,px0:P.px,py0:P.py,base:mepSkSnapshot(ctx.sk),moved:false,undoPushed:false};}
         mepSideShow();mepRender();return;
       }
       const addK=ev.shiftKey||ev.ctrlKey||ev.metaKey;
       if(mepSt.tbEdit){mepSt.pick={kind:'box',sx:P.x,sy:P.y,cur:{x:P.x,y:P.y},px0:P.px,py0:P.py,add:addK};return;}
       if(!addK){if(mepSt.skSel&&mepSt.skSel.size)mepSt.skSel=new Set();mepSt.lot=null;}}
      // flèche de coupe ? → glisser le bout (trait fort + flèche + lettre) le long de la ligne de coupe
      {const ca=mepCutArrowAt(sh,P.x,P.y);
       if(ca){const shf=Array.isArray(ca.v.section.sh)?ca.v.section.sh:[0,0];
         mepSt.sel=ca.v.id;mepSt.selDim=null;mepSt.selAxis=null;
         mepSt.pick={kind:'cutDrag',vid:ca.v.id,end:ca.end,s0:+shf[ca.end]||0,sx:P.x,sy:P.y,px0:P.px,py0:P.py,moved:false,undoPushed:false};
         mepSideShow();mepRender();return;}}
      // tronçon d'une coupe brisée ? → glisser perpendiculairement à lui-même
      {const cs=mepCutSegAt(sh,P.x,P.y);
       if(cs){
         mepSt.sel=cs.v.id;mepSt.selDim=null;mepSt.selAxis=null;
         const M=mepCutModel(cs.v),G=mepFromSheet(cs.par,P.x,P.y),sG=M?G.x*M.t.x+G.y*M.t.y:0;
         if(ev.shiftKey){ // Maj + clic : enlève la brisure la plus proche du curseur
           let ok=false;mepEdit('ligne de coupe : brisure retirée',()=>{ok=mepCutDelBreakAt(sh,cs.v,cs.j,sG);});
           mepStatus(ok?'Ligne de coupe '+(cs.v.label||'')+' : brisure retirée.':'Ligne de coupe : aucune brisure à retirer.');
           mepSideShow();mepRender();return;}
         mepSt.pick={kind:'cutSeg',vid:cs.v.id,j:cs.j,M,sG,brk:ev.ctrlKey||ev.metaKey,px0:P.px,py0:P.py};
         mepSideShow();mepRender();return;}}
      // titre de vue ? → glisser le long de l'axe de la vue
      {const tv=mepViewTitleAt(sh,P.x,P.y);
       if(tv){const g=mepViewTitleGeo(tv);
         mepSt.sel=tv.id;mepSt.selDim=null;mepSt.selAxis=null;
         mepSt.pick={kind:'ttlDrag',vid:tv.id,dy:P.y-(g.y-g.h/2),px0:P.px,py0:P.py,moved:false,undoPushed:false};
         mepSideShow();mepRender();return;}}
      // cote ? → sélection + glisser pour la déplacer (2ᵉ appui rapproché = double-clic)
      if(mepDimPressDbl(sh,P,ev))return;
      const dim=mepDimAt(sh,P.x,P.y);
      if(dim){mepDimDragStart(sh,P,dim,ev);return;}
      const axis=mepAxisAt(sh,P.x,P.y);
      if(axis){
        mepSt.selAxis={vid:axis.vid,id:axis.id,ak:axis.ak};mepSt.sel=null;mepSt.selDim=null;mepSt.entSel=[];
        // 2026-10-22-012/013 : saisi près d'une extrémité → on la tire (tout trait d'axe)
        const av=mepView(sh,axis.vid),an=axis.ann;
        if(av&&an&&an.kind==='free'&&an.a&&an.b){
          const tolE=6/(mepSt.zoom||1);
          const dA=Math.hypot(av.x+an.a.x*av.scale-P.x,av.y+an.a.y*av.scale-P.y);
          const dB=Math.hypot(av.x+an.b.x*av.scale-P.x,av.y+an.b.y*av.scale-P.y);
          if(Math.min(dA,dB)<=tolE)mepSt.pick={kind:'axisEnd',vid:av.id,id:an.id,end:dA<=dB?'a':'b',px0:P.px,py0:P.py,moved:false,undoPushed:false};
        }else if(av&&axis.end&&axis.p&&axis.p.t==='L'){
          mepSt.pick={kind:'axisEnd',vid:av.id,ak:axis.ak,end:axis.end,px0:P.px,py0:P.py,moved:false,undoPushed:false};
        }
        mepSideShow();mepRender();return;
      }
      // double-clic sur une hachure, détecté à l'APPUI : le 1er clic sélectionne la vue et
      // redessine la planche, le navigateur n'émet alors plus de dblclick
      if(mepHatchAt(sh,P.x,P.y)){
        const now=Date.now(),lh=mepSt.hatchDown;
        if(lh&&now-lh.t<450&&Math.hypot(P.px-lh.px,P.py-lh.py)<6){mepSt.hatchDown=null;mepSt.pick=null;mepHatchDialog();return;}
        mepSt.hatchDown={t:now,px:P.px,py:P.py};
      }else mepSt.hatchDown=null;
      const v=mepViewAt(sh,P.x,P.y);
      if(v){
        mepSt.sel=v.id;mepSt.selDim=null;mepSt.selAxis=null;
        mepSt.pick={kind:'viewDrag',vid:v.id,ox:P.x-v.x,oy:P.y-v.y,moved:false,undoPushed:false,
          px0:P.px,py0:P.py,add:ev.ctrlKey||ev.metaKey||ev.shiftKey};
        mepSideShow();mepRender();
      }else{
        // fond de planche : sélection au cadre (fenêtre / capture)
        const addK=ev.shiftKey||ev.ctrlKey||ev.metaKey;
        if(!addK){mepSt.sel=null;mepSt.selDim=null;mepSt.selAxis=null;mepSt.entSel=[];}
        mepSt.pick={kind:'box',sx:P.x,sy:P.y,cur:{x:P.x,y:P.y},px0:P.px,py0:P.py,add:addK};
        mepSideShow();mepRender();
      }
      return;
    }
    if(tool==='cut2'){
      const v=mepViewAt(sh,P.x,P.y);
      if(!v){mepStatus('Coupe : cliquez sur la vue parente.');return;}
      const lx=(P.x-v.x)/v.scale,ly=(P.y-v.y)/v.scale;
      mepSt.cutPts.push({x:lx,y:ly,vid:v.id});
      if(mepSt.cutPts.length===1){mepStatus('Coupe : 2ᵉ point de la ligne de coupe.');return;}
      const A=mepSt.cutPts[0],B=mepSt.cutPts[1];
      const par=mepView(sh,A.vid);
      if(!par){mepSt.cutPts=[];return;}
      mepSt.tool='select';mepSt.cutPts=[];
      mepSectionFromPicks(par,A,B);
      mepToolSync();
      return;
    }
    if(tool==='det2'){
      const v=mepViewAt(sh,P.x,P.y);
      if(!v){mepStatus('Détail : cliquez sur la vue parente.');return;}
      const lx=(P.x-v.x)/v.scale,ly=(P.y-v.y)/v.scale;
      if(!mepSt.detC){
        mepSt.detC={x:lx,y:ly,vid:v.id};
        mepStatus('Détail : cliquez un 2ᵉ point pour le rayon.');
        return;
      }
      const C=mepSt.detC;
      const par=mepView(sh,C.vid);
      const R=Math.hypot(lx-C.x,ly-C.y);
      mepSt.detC=null;mepSt.tool='select';
      if(par&&R>0.5)mepDetailFromPicks(par,C,R);
      else mepStatus('Détail : rayon trop petit.');
      mepToolSync();
      return;
    }
    if(tool==='dim'){
      // une cote déjà posée reste attrapable : n'importe quel trait rouge
      // (ligne, rappel, leader, arc) démarre son déplacement.
      if(!mepSt.dim){
        if(mepDimPressDbl(sh,P,ev))return;
        const dim=mepDimAt(sh,P.x,P.y);
        if(dim){mepDimDragStart(sh,P,dim,ev);return;}
      }
      // distance point→point en cours : on garde le flux 2 points + placement
      if(mepSt.dim&&mepSt.dim.kind==='dist'&&!mepSt.dim.b){
        mepDimClick(sh,P,ev.ctrlKey||ev.metaKey,ev.shiftKey,ev.altKey);return;
      }
      if(mepSt.dim&&mepSt.dim.kind==='dist'&&mepSt.dim._pp){
        mepDimClick(sh,P,ev.ctrlKey||ev.metaKey,ev.shiftKey,ev.altKey);return;
      }
      const hit=mepHitViewEnt(sh,P.x,P.y,{axes:true});
      if(mepSt.dim){
        // une seule entité déjà choisie : un clic sur une AUTRE entité ajoute
        // la 2ᵉ (distance/angle) au lieu de poser immédiatement la cote.
        if(hit&&(mepSt.entSel||[]).length===1&&!mepSameEntSel(hit)
          &&(hit.e.t==='L'||hit.e.t==='C'||hit.e.t==='A')){
          mepDimAddEnt(hit);return;
        }
        // clic dans le vide (ou sur la même entité) : pose de la cote
        mepDimCommitDraft(sh,P,ev.shiftKey);return;
      }
      mepDimClick(sh,P,ev.ctrlKey||ev.metaKey,ev.shiftKey,ev.altKey);
      return;
    }
    if(tool==='hole'){
      if(mepSt.dim){mepDimCommitDraft(sh,P,ev.shiftKey);return;}
      const hit=mepHitViewEnt(sh,P.x,P.y);
      const d=hit?mepHoleDraft(sh,hit.vid,hit.e,hit.i):null;
      if(!d){
        mepStatus('Perçage : cliquez un cercle projeté correspondant à une fonction Perçage.');
        return;
      }
      mepSt.selDim=null;
      mepSt.dim=d;
      mepStatus('Perçage : cliquez pour placer l’étiquette (Échap annule).');
      mepRender();
      return;
    }
    if(tool==='axis'){mepAxisClick(sh,P);return;}
    if(tool==='ordx'||tool==='ordy'){mepOrdClick(sh,P,tool==='ordy'?'y':'x');return;}
    if(tool==='note'){
      if(mepSt.dim&&mepSt.dim.kind==='note'){ // 2ᵉ clic : place le texte, puis le saisit
        mepDimCommitDraft(sh,P);
        const d=sh.dims.find(x=>x.id===mepSt.selDim);
        if(d)mepNoteEdit(sh,d);
        return;
      }
      const S=mepSnapLocal(sh,P);
      if(!S){mepStatus('Note : cliquez la pointe de la flèche dans une vue.');return;}
      mepSt.selDim=null;
      mepSt.dim={kind:'note',vid:S.v.id,vid2:null,a:S.q,b:{x:S.q.x+8/S.v.scale,y:S.q.y-8/S.v.scale},off:0,txt:'Texte',__ghost:true};
      mepStatus('Note : cliquez pour placer le texte (Échap annule).');
      mepRender();return;
    }
    /* outils de dessin 2D (esquisse de planche, ou cartouche en édition) */
    const pt=mepSkSnap(sh,P);
    if(tool==='line'||tool==='rect'||tool==='circle'||tool==='arc'||tool==='logo'){
      const pk=mepSt.pick;
      if(!pk||!pk.start){
        mepSt.pick={kind:tool,start:pt,cur:pt,pts:[pt]};
        mepStatus(tool==='arc'?'Arc : cliquez le point de départ.':tool==='line'?'Ligne : cliquez le point suivant.':'Cliquez le 2ᵉ point.');
        return;
      }
      if(tool==='line'){
        let res=null;
        mepEdit('ligne',()=>{res=mepSkAddLine(sh,pk.start,pt);});
        mepSt.pick=res?{kind:'line',start:{x:pt.x,y:pt.y,pid:res.b},cur:pt,pts:[]}:pk;
        mepStatus('Ligne enchaînée — clic suivant, ou Échap / clic droit pour terminer.');
        mepRender();return;
      }
      if(tool==='arc'){
        pk.pts.push(pt);
        if(pk.pts.length<3){mepStatus('Arc : cliquez le point d’arrivée.');return;}
        mepEdit('arc',()=>{mepSkAddArc(sh,pk.pts[0],pk.pts[1],pk.pts[2]);});
        mepSt.pick=null;return;
      }
      mepEdit(tool==='rect'?'rectangle':tool==='circle'?'cercle':'zone logo',()=>{
        if(tool==='rect')mepSkAddRect(sh,pk.start,pt);
        else if(tool==='circle')mepSkAddCircle(sh,pk.start,Math.hypot(pt.x-pk.start.x,pt.y-pk.start.y));
        else mepSkAddLogo(sh,pk.start,pt);
      });
      mepSt.pick=null;return;
    }
    if(tool==='point'){mepEdit('point',()=>{mepSkAddPt(sh,pt);});return;}
    if(tool==='text'){
      let e=null;mepEdit('texte',()=>{e=mepSkAddText(sh,pt);});
      if(e){mepSt.skSel=new Set(['e:'+e.id]);mepSideShow();mepRender();}
      return;
    }
    if(tool==='trim'){
      mepEdit('ajuster',()=>{mepSkTrim(sh,P.x,P.y);});
      return;
    }
  }
  function mepOnMove(ev){
    const P=mepPt(ev);
    mepCoordShow(P);
    const sh=mepSheet();
    if(mepSt.vcmd&&!(mepSt.pick&&mepSt.pick.kind==='pan')){mepVcmdMove(sh,P,ev);return;}
    const pk=mepSt.pick;
    if(pk){
      if(pk.kind==='pan'){
        mepSt.pan.x=pk.px-(ev.clientX-pk.sx)*mepPxToMm();
        mepSt.pan.y=pk.py-(ev.clientY-pk.sy)*mepPxToMm();
        mepRender();
        return;
      }
      if(pk.kind==='box'){
        pk.cur={x:P.x,y:P.y};
        if(!pk.drag&&Math.hypot(P.px-pk.px0,P.py-pk.py0)>=3)pk.drag=true;
        if(pk.drag)mepRender();
        return;
      }
      if(pk.kind==='skDrag'){
        // glisser un point / trait / texte : position imposée, le solveur fait suivre le reste
        if(!pk.dragStarted){if(Math.hypot(P.px-pk.px0,P.py-pk.py0)<3)return;pk.dragStarted=true;}
        const ctx=mepSkCtx(sh,false),sk=ctx.sk;if(!sk)return;
        if(!pk.undoPushed){try{docPushUndo('Plan : déplacement esquisse');}catch(e){}pk.undoPushed=true;}
        mepSkRestore(sk,pk.base);
        const dx=P.x-pk.sx,dy=P.y-pk.sy,id=pk.key.slice(2),fx=mepSkFixed(sk),anch=[];
        const mv=pid=>{if(!pid||fx.has(pid)||!sk.pts[pid]||anch.indexOf(pid)>=0)return;sk.pts[pid].x+=dx;sk.pts[pid].y+=dy;anch.push(pid);};
        if(pk.key[0]==='p')mv(id);
        else{
          const e=sk.ents.find(x=>x.id===id);
          if(e&&(e.t==='circle'||e.t==='arc')){const c=sk.pts[e.pc];if(c){e.r=Math.max(0.1,Math.hypot(P.x-ctx.ox-c.x,P.y-ctx.oy-c.y));anch.push(e.pc);}}
          else if(e)['p1','p2','pc','p'].forEach(k=>mv(e[k]));
        }
        // position impossible (élément coté / fixé) : les contraintes l'emportent, rien ne se déforme
        if(mepSkSolve(sk,30,anch)>1e-4){
          mepSkSolve(sk,80);
          if(!pk.warned){pk.warned=true;mepStatus('Élément tenu par ses cotes ou ses fixations : modifiez la cote (sélectionnez-la) pour le déplacer.');}
        }
        pk.moved=true;
        mepRender();return;
      }
      if(pk.kind==='cutSeg'){
        const v=mepView(sh,pk.vid),par=v&&v.section&&mepView(sh,v.section.pid),M=pk.M;
        if(par&&M){
          if(!pk.dragStarted){if(Math.hypot(P.px-pk.px0,P.py-pk.py0)<3)return;pk.dragStarted=true;}
          const L=mepFromSheet(par,P.x,P.y);
          if(pk.j%2){ // marche : glisse le long du 1er tronçon, entre ses voisines
            const k=(pk.j-1)/2,lo=k?M.steps[k-1]:M.s0,hi=k===M.steps.length-1?M.sE:M.steps[k+1];
            let sv=L.x*M.t.x+L.y*M.t.y;const a=Math.min(lo,hi)+0.5,b=Math.max(lo,hi)-0.5;sv=Math.max(a,Math.min(b,Math.round(sv*2)/2));
            pk.prev={kind:'step',k,s:sv};
            mepStatus('Ligne de coupe '+(v.label||'')+' : marche déplacée.');
          }else{ // plan : brisure au point saisi, le morceau suivant s'accroche au centre / à la ligne visé(e)
            const cv=L.x*M.n.x+L.y*M.n.y,tol=4/(mepSt.zoom||1)/par.scale;
            let best=null;mepCutCands(sh,par,M).forEach(q=>{const d=Math.abs(q.c-cv);if(d<=tol&&(!best||d<best.d||(d===best.d&&q.ref.t==='hole')))best=Object.assign({d},q);});
            pk.prev={kind:pk.brk?'break':'plane',m:pk.j/2,c:best?best.c:Math.round(cv*2)/2,ref:best?best.ref:null};
            mepStatus('Ligne de coupe '+(v.label||'')+' : '+(best?('accrochée '+({hole:'au centre du perçage',ax:'au trait d’axe',edge:'à l’arête'})[best.ref.t]):'position libre (aucun centre ni ligne visé)')
              +(pk.brk?' — relâchez pour briser (Ctrl).':' — tronçon déplacé.'));
          }
          mepRender();
        }
        return;
      }
      if(pk.kind==='cutDrag'){
        const v=mepView(sh,pk.vid),E=v&&mepCutEnds(sh,v)[pk.end];
        if(E){
          if(!pk.dragStarted){if(Math.hypot(P.px-pk.px0,P.py-pk.py0)<3)return;pk.dragStarted=true;}
          // seule la composante le long du trait compte (verticale pour une coupe verticale…)
          let sv=pk.s0+(P.x-pk.sx)*E.u.x+(P.y-pk.sy)*E.u.y;
          sv=Math.round(Math.max(-(E.L/2-6),Math.min(150,sv))*2)/2;
          const shf=Array.isArray(v.section.sh)?v.section.sh.slice():[0,0];
          if(shf[pk.end]!==sv){
            if(!pk.undoPushed){try{docPushUndo('Plan : flèche de coupe');}catch(e){}pk.undoPushed=true;}
            shf[pk.end]=sv;v.section.sh=shf;pk.moved=true;
            mepStatus('Flèche de coupe '+(v.label||'')+' : décalage '+mepFmtNum(sv,1)+' mm le long du trait.');
            mepRender();
          }
        }
        return;
      }
      if(pk.kind==='ttlDrag'){
        const v=mepView(sh,pk.vid),g=v&&mepViewTitleGeo(v);
        if(g){
          if(!pk.dragStarted){if(Math.hypot(P.px-pk.px0,P.py-pk.py0)<3)return;pk.dragStarted=true;}
          // centre du titre voulu ; x reste sur l'axe de la vue
          const tc=P.y-pk.dy,bb=g.bb,lh=g.h,above=tc<bb.y+bb.h/2;
          const gap=Math.max(1,Math.round((above?bb.y-tc-lh/2:tc-bb.y-bb.h-lh/2)*2)/2);
          const old=v.ttl||{};
          if(old.gap!==gap||(old.side||'below')!==(above?'above':'below')){
            if(!pk.undoPushed){try{docPushUndo('Plan : titre de vue');}catch(e){}pk.undoPushed=true;}
            v.ttl={side:above?'above':'below',gap};pk.moved=true;
            mepStatus('Titre de vue : '+(above?'au-dessus':'dessous')+', écart '+mepFmtNum(gap,1)+' mm (centré sur l’axe de la vue).');
            mepRender();
          }
        }
        return;
      }
      if(pk.kind==='viewDrag'){
        const v=mepView(sh,pk.vid);
        if(v){
          // seuil de 3 px : un clic (sans glissement) doit sélectionner, pas déplacer
          if(!pk.dragStarted){
            if(Math.hypot(P.px-pk.px0,P.py-pk.py0)<3)return;
            pk.dragStarted=true;
          }
          let nx=P.x-pk.ox,ny=P.y-pk.oy;
          if(v.align&&v.kind!=='proj'){
            // coupe / auxiliaire alignées : glissement sur la ligne de rappel
            const t=(nx-v.x)*v.align.x+(ny-v.y)*v.align.y;nx=v.x+t*v.align.x;ny=v.y+t*v.align.y;
          }
          if(v.kind==='proj'){
            // vue projetée : glissement contraint sur l'axe libre ; l'axe commun reste verrouillé sur la mère
            const par=mepView(sh,v.parent);
            const axis=(MEP_PROJ[v.proj||'']||{}).axis||'x';
            if(par){
              if(axis==='x')ny=par.y; // côté gauche/droit : hauteur = mère, x libre
              else nx=par.x;          // dessus/dessous : x = mère, distance libre
            }
          }
          const dx=nx-v.x,dy=ny-v.y;
          const bouge=Math.abs(dx)>1e-9||Math.abs(dy)>1e-9;
          // Instantané AVANT la première mutation : sinon l'undo mémorise la position
          // déjà déplacée et ne restaure rien. Les projections suivent dans le même geste.
          if(bouge&&!pk.undoPushed){try{docPushUndo('Plan : déplacement vue');}catch(e){}pk.undoPushed=true;}
          v.x=nx;v.y=ny;if(bouge)pk.moved=true;
          if(bouge)mepProjFollow(sh,v,dx,dy);
          mepRender();
        }
        return;
      }
      if(pk.kind==='axisEnd'&&pk.ak){ // 2026-10-22-013 : tout trait d'axe — allongement mémorisé par bout
        const v=mepView(sh,pk.vid),p=v&&mepAxisLineByKey(sh,v,pk.ak);
        if(p&&p.t==='L'){
          if(!pk.dragStarted){if(Math.hypot(P.px-pk.px0,P.py-pk.py0)<3)return;pk.dragStarted=true;}
          const L=Math.hypot(p.bx2-p.bx1,p.by2-p.by1);
          if(L>1e-9){
            const ux=(p.bx2-p.bx1)/L,uy=(p.by2-p.by1)/L;
            // accrochage sur la géométrie (hors traits d'axe), projeté sur le trait
            const sn=mepSnapPt(P.x,P.y,sh,{noAxes:true});
            const q=sn.hit?sn:P,lx=(q.x-v.x)/v.scale,ly=(q.y-v.y)/v.scale;
            const cur=(v.axExt&&v.axExt[pk.ak])||[0,0];
            let e1=+cur[0]||0,e2=+cur[1]||0;
            if(pk.end===1)e1=-((lx-p.bx1)*ux+(ly-p.by1)*uy);
            else e2=(lx-p.bx2)*ux+(ly-p.by2)*uy;
            const mn=0.5/v.scale; // jamais moins de 0,5 mm papier
            if(L+e1+e2<mn){if(pk.end===1)e1=mn-L-e2;else e2=mn-L-e1;}
            if(!pk.undoPushed){try{docPushUndo('Plan : longueur axe');}catch(e){}pk.undoPushed=true;}
            if(!v.axExt||typeof v.axExt!=='object')v.axExt={};
            v.axExt[pk.ak]=[+e1.toFixed(4),+e2.toFixed(4)];pk.moved=true;
            mepAxGen++;
          }
          mepRender();
        }
        return;
      }
      if(pk.kind==='axisEnd'){ // 2026-10-22-012 : allonger / raccourcir l'axe, direction conservée
        const v=mepView(sh,pk.vid),an=v&&(v.axes||[]).find(x=>x.id===pk.id);
        if(an&&an.a&&an.b){
          if(!pk.dragStarted){if(Math.hypot(P.px-pk.px0,P.py-pk.py0)<3)return;pk.dragStarted=true;}
          const fix=pk.end==='a'?an.b:an.a,mov=an[pk.end];
          const dx=mov.x-fix.x,dy=mov.y-fix.y,L=Math.hypot(dx,dy);
          if(L>1e-9){
            const ux=dx/L,uy=dy/L,lx=(P.x-v.x)/v.scale,ly=(P.y-v.y)/v.scale;
            const t=Math.max(0.5,(lx-fix.x)*ux+(ly-fix.y)*uy);
            if(!pk.undoPushed){try{docPushUndo('Plan : longueur axe');}catch(e){}pk.undoPushed=true;}
            an[pk.end]={x:fix.x+ux*t,y:fix.y+uy*t};pk.moved=true;
          }
          mepRender();
        }
        return;
      }
      if(pk.kind==='dimDrag'){
        const d=sh.dims.find(x=>x.id===pk.id);
        if(d){
          if(!pk.dragStarted){
            if(Math.hypot(P.px-pk.px0,P.py-pk.py0)<3)return;
            pk.dragStarted=true;
          }
          if(!pk.undoPushed&&(Math.abs(P.x-pk.sx)>1e-9||Math.abs(P.y-pk.sy)>1e-9)){
            try{docPushUndo('Plan : déplacement cote');}catch(e){}
            pk.undoPushed=true;
          }
          if(pk.undoPushed&&mepDimMoveTo(sh,d,P,pk)){
            pk.moved=true;
            mepRender();
          }
        }
        return;
      }
      if(pk.start!==undefined||pk.kind==='cut2'||pk.kind==='det2'){
        if(MEP_SK_TOOLS.indexOf(pk.kind)>=0){pk.cur=mepSkSnap(sh,P);mepRender();return;}
        const snap=mepSnapPt(P.x,P.y,sh);
        pk.cur={x:snap.x,y:snap.y,snap:snap.hit};
        mepRender();
        return;
      }
    }
    if(mepSt.tool==='note'&&mepSt.dim){if(mepDimMoveTo(sh,mepSt.dim,P))mepRender();return;}
    if(mepSt.tool==='dim'||mepSt.tool==='hole'){
      // survol des arêtes/cercis : feedback avant les 2 clics de sélection
      const hit=mepHitViewEnt(sh,P.x,P.y,{axes:mepSt.tool==='dim'});
      const hov=hit?{vid:hit.vid,i:hit.i,sig:mepEntSig(hit.e)}:null;
      let need=false;
      if(!mepSameHovEnt(hov,mepSt.hovEnt)){mepSt.hovEnt=hov;need=true;}
      // la cote en cours suit la souris (sauf distance point→point sans 2ᵉ point)
      if(mepSt.dim&&!(mepSt.dim.kind==='dist'&&!mepSt.dim.b)){
        if(mepDimMoveTo(sh,mepSt.dim,P))need=true;
      }
      if(need)mepRender();
      return;
    }
    if(mepSt.tool==='axis'){
      if(mepSt.axisFree&&mepSt.axisFree.a){
        const snap=mepSnapPt(P.x,P.y,sh);
        const c=mepSt.axisFree.cur;
        if(!c||Math.abs(c.x-snap.x)>1e-6||Math.abs(c.y-snap.y)>1e-6){
          mepSt.axisFree.cur={x:snap.x,y:snap.y};
          mepRender();
        }
      }
      return;
    }
    // survol d'esquisse (cartouche en édition, ou esquisse de planche active) : élément visé surligné
    if(mepSt.tool==='select'&&(mepSt.tbEdit||(mepSt.skSel&&mepSt.skSel.size))){
      const hk=mepSkHit(sh,P),key=hk?hk.key:null;
      if(key!==mepSt.skHov){mepSt.skHov=key;try{mepRender();}catch(e){}}
      if(mepSt.tbEdit)return;
    }else if(mepSt.skHov){mepSt.skHov=null;try{mepRender();}catch(e){}}
    // survol titre de vue (cadre pointillé) puis vue (feedback)
    {const tv=mepViewTitleAt(sh,P.x,P.y),tid=tv?tv.id:null;
     if(tid!==mepSt.ttlHov){mepSt.ttlHov=tid;try{mepRender();}catch(e){}}
     const ca=mepCutArrowAt(sh,P.x,P.y),ck=ca?{vid:ca.v.id,end:ca.end}:null,o=mepSt.cutHov;
     if((ck&&(!o||o.vid!==ck.vid||o.end!==ck.end))||(!ck&&o)){mepSt.cutHov=ck;try{mepRender();}catch(e){}}}
    const v=mepViewAt(sh,P.x,P.y);
    const id=v?v.id:null;
    if(id!==mepSt.hovView){mepSt.hovView=id;try{mepRender();}catch(e){}}
  }
  function mepOnUp(ev){
    const pk=mepSt.pick;
    if(!pk)return;
    if(pk.kind==='axisEnd'){
      if(pk.moved)mepEdit('longueur axe',()=>{},true);
      mepSt.pick=null;
      return;
    }
    if(pk.kind==='dimDrag'){
      if(pk.moved)mepEdit(pk.jog?'cassure d’ordonnée':'déplacement cote',()=>{},true);
      else if(pk.jog){ // Ctrl + clic sans glisser : cassure retirée
        const sh=mepSheet(),d=sh.dims.find(x=>x.id===pk.id),q=d&&d.pts&&d.pts[pk.jog.i];
        if(q&&q.jog){mepEdit('cassure retirée',()=>{delete q.jog;});mepStatus('Cassure retirée.');}
      }
      mepSt.pick=null;
      return;
    }
    if(pk.kind==='cutSeg'){
      const sh=mepSheet(),v=mepView(sh,pk.vid),q=pk.prev;mepSt.pick=null;
      if(v&&!q&&pk.M&&pk.brk&&!(pk.j%2)){
        let ok=false;mepEdit('ligne de coupe : brisure',()=>{ok=mepCutBreakClick(sh,v,pk.j/2,pk.sG);});
        mepStatus(ok?'Ligne de coupe '+(v.label||'')+' : brisure ajoutée — tirez le morceau pour le placer.':'Ligne de coupe : rien à briser ici.');
        mepSideShow();
      }
      if(v&&q&&pk.M){
        if(q.kind==='step')mepEdit('ligne de coupe : marche',()=>{const M=mepCutModel(v);M.steps[q.k]=q.s;mepCutFromModel(sh,v,M);});
        else if(q.kind==='plane')mepEdit('ligne de coupe : tronçon',()=>{const M=mepCutModel(v);M.c[q.m]=q.c;M.refs[q.m]=q.ref;mepCutFromModel(sh,v,M);});
        else mepEdit('ligne de coupe : brisure',()=>{if(!mepCutBreakAt(sh,v,q.m,pk.sG,q.c,q.ref))mepStatus('Ligne de coupe : rien à briser ici.');});
        mepSideShow();
      }
      mepRender();
      return;
    }
    if(pk.kind==='cutDrag'){
      if(pk.moved)mepEdit('flèche de coupe',()=>{},true);
      mepSt.pick=null;mepRender();
      return;
    }
    if(pk.kind==='ttlDrag'){
      if(pk.moved)mepEdit('titre de vue',()=>{},true);
      mepSt.pick=null;mepRender();
      return;
    }
    if(pk.kind==='box'){
      mepSt.pick=null;
      const sh=mepSheet();
      if(pk.drag){
        const n=mepBoxSelect(sh,pk,pk.add);
        mepStatus((mepBoxRect(pk).cross?'Capture':'Fenêtre')+' : '+n+' élément(s) ajouté(s) à la sélection.');
      }else if(pk.clickKey)mepSkSelect(pk.clickKey,pk.add);
      else if(!pk.add){mepSt.skSel=new Set();mepSt.lot=null;}
      mepSideShow();mepRender();
      return;
    }
    if(pk.kind==='skDrag'){
      if(pk.moved)mepEdit('déplacement esquisse',()=>{},true);
      mepSt.pick=null;mepSideShow();
      return;
    }
    if(pk.kind==='viewDrag'){
      if(pk.moved){
        // L'undo a été empilé au premier mouvement ; on finalise sans re-snapshot.
        mepEdit('déplacement vue',()=>{},true);
      }else{
        // clic sans déplacement : la vue reste sélectionnée ; aucune arête n'est
        // pré-sélectionnée hors d'une fonction (la cotation sélectionne elle-même).
        mepSt.entSel=[];mepSt.hovEnt=null;
        mepSideShow();mepRender();
      }
      mepSt.pick=null;
      return;
    }
    if(pk.kind==='pan'){mepSt.pick=null;return;}
    // tracé en cours (ligne, rectangle, cercle, arc, logo) : il continue au clic suivant
    // (V0.3.12 : auparavant effacé au relâchement — le dessin en 2 clics n'aboutissait jamais)
    if(MEP_SK_TOOLS.indexOf(pk.kind)>=0||pk.kind==='cut2'||pk.kind==='det2')return;
    mepSt.pick=null;
  }
  function mepOnWheel(ev){
    ev.preventDefault();
    const P=mepPt(ev);
    // sens de la molette inversable (paramètre Vue) : deltaY<0 (molette vers le haut)
    // = zoom avant par défaut ; zoomRev intervertit avant/arrière.
    const up=ev.deltaY<0;
    const k=(mepSt.zoomRev?!up:up)?1.12:1/1.12;
    const z0=mepSt.zoom;
    const z1=Math.min(20,Math.max(0.08,z0*k));
    if(z1===z0)return;
    // zoom autour du pointeur : le point P reste fixe à l'écran
    const vb=mepSvgViewBox();
    const ratio=z1/z0;
    mepSt.pan.x=P.x-(P.x-mepSt.pan.x)/ratio;
    mepSt.pan.y=P.y-(P.y-mepSt.pan.y)/ratio;
    mepSt.zoom=z1;
    mepRender();
  }
  // double-clic sur une cote (true si traité) : flèche → inversion des deux flèches ;
  // cote linéaire → inversion des flèches ; Alt (ou autre cote) → texte personnalisé
  function mepDimDblAction(sh,P,alt){
    const da=mepDimArrowAt(sh,P.x,P.y);
    if(da){mepDimToggleArrows(da);return true;}
    const d=mepDimAt(sh,P.x,P.y);
    if(!d)return false;
    if(d.kind==='note'){mepNoteEdit(sh,d);return true;}
    if(d.kind==='ord')return true;
    if((d.kind==='len'||d.kind==='dist')&&!alt){mepDimToggleArrows(d);return true;}
    const t=prompt('Texte de cote (vide = calculé) :',d.txt||'');
    if(t!==null){mepEdit('texte cote',()=>{d.txt=t||undefined;});}
    return true;
  }
  /* 2026-10-22-014 : double-clic détecté à l'APPUI (« le double clic sur la cote devrait inverser
     le sens des flèches, mais pas tout le temps ») — le 1er clic sélectionne la cote et redessine
     la planche : l'élément sous la souris est remplacé et le navigateur perd souvent le dblclick.
     Le dblclick natif qui arrive quand même est ignoré (sinon il ré-inverserait). */
  function mepDimPressDbl(sh,P,ev){
    const hit=mepDimArrowAt(sh,P.x,P.y)||mepDimAt(sh,P.x,P.y);
    const now=Date.now(),lp=mepSt.dimDown;
    if(!hit){mepSt.dimDown=null;return false;}
    if(lp&&lp.id===hit.id&&now-lp.t<450&&Math.hypot(P.px-lp.px,P.py-lp.py)<6){
      mepSt.dimDown=null;mepSt.pick=null;mepSt.dblDoneT=now;
      mepDimDblAction(sh,P,ev.altKey);
      return true;
    }
    mepSt.dimDown={id:hit.id,t:now,px:P.px,py:P.py};
    return false;
  }
  function mepOnDbl(ev){
    const P=mepPt(ev);
    const sh=mepSheet();
    if(mepSt.dblDoneT&&Date.now()-mepSt.dblDoneT<700){mepSt.dblDoneT=0;return;} // déjà traité à l'appui
    if(mepDimDblAction(sh,P,ev.altKey))return;
    // double-clic sur une hachure → motif, angle, échelle, couleur (toutes les coupes)
    if(mepHatchAt(sh,P.x,P.y)){if(!mepHatchDlgEl)mepHatchDialog();return;}
    // double-clic sur étiquette de vue → renommer
    const v=mepViewAt(sh,P.x,P.y);
    if(v){
      const n=prompt('Libellé de la vue :',v.label||'');
      if(n!==null){mepEdit('libellé vue',()=>{v.label=n;});}
      return;
    }
  }
  function mepOnKey(ev){
    if(!mepSt.open)return;
    const t=ev.target;
    if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
    const k=ev.key;
    if(k==='Escape'&&mepCtxEl&&mepCtxEl.style.display!=='none'){
      mepCtxHide();ev.preventDefault();ev.stopPropagation();return;
    }
    if((k==='Escape'||k==='Enter')&&mepSt.ord){mepSt.ord=null;mepSetTool('select');mepStatus('Cotation d’ordonnées terminée.');ev.preventDefault();ev.stopPropagation();return;}
    if(k==='Escape'){
      if(mepSt.alignDims){mepSt.alignDims=null;mepStatus('Alignement annulé.');ev.preventDefault();ev.stopPropagation();return;}
      if(mepSt.vcmd){mepVcmdCancel();ev.preventDefault();ev.stopPropagation();return;}
      if(mepSt.pick&&MEP_SK_TOOLS.indexOf(mepSt.pick.kind)>=0){mepSt.pick=null;mepRender();ev.preventDefault();ev.stopPropagation();return;}
      if((mepSt.skSel&&mepSt.skSel.size)||mepSt.lot){mepSt.skSel=new Set();mepSt.lot=null;mepSideShow();mepRender();ev.preventDefault();ev.stopPropagation();return;}
      if(mepSt.tbEdit){if(mepSt.tool!=='select')mepSetTool('select');else mepTbEdit(false);ev.preventDefault();ev.stopPropagation();return;}
      if(mepSt.pick||mepSt.tool!=='select'||mepSt.dim||mepSt.cutPts.length||mepSt.detC
        ||mepSt.selAxis||(mepSt.axisPick&&mepSt.axisPick.length)||mepSt.axisFree){
        const pk0=mepSt.pick;
        if(pk0&&pk0.moved){
          if(pk0.kind==='viewDrag')mepEdit('déplacement vue',()=>{},true);
          else if(pk0.kind==='dimDrag')mepEdit('déplacement cote',()=>{},true);
        }
        mepSt.pick=null;mepSt.dim=null;mepSt.cutPts=[];mepSt.detC=null;
        mepSt.selAxis=null;mepSt.axisPick=[];mepSt.axisFree=null;mepSt.axisSym=null;
        mepSetTool('select');
        mepRender();
        ev.preventDefault();ev.stopPropagation();
      }
      return;
    }
    if(mepSt.vcmd&&mepSt.vcmd.kind==='section'&&mepSt.vcmd.stage===1&&(k==='Enter'||k==='Backspace')){
      if(k==='Enter')mepSecValidate();else mepSecUndo();
      ev.preventDefault();ev.stopPropagation();return;
    }
    if(k==='Enter'&&mepSt.tool==='axis'){
      if(mepSt.axisMode==='align'||mepSt.axisMode==='pitch')mepAxisCommitPattern();
      ev.preventDefault();ev.stopPropagation();
      return;
    }
    if(k==='Delete'||k==='Backspace'){
      const sh=mepSheet();
      if(mepSt.lot){mepDeleteLot(sh);ev.preventDefault();ev.stopPropagation();return;}
      if(mepSt.skSel&&mepSt.skSel.size){mepSkDeleteSel(sh);ev.preventDefault();ev.stopPropagation();return;}
      if(mepSt.selDim&&mepSt.ordPt&&mepSt.ordPt.id===mepSt.selDim&&mepSt.ordPt.i>=0){
        mepOrdDelPt(sh,sh.dims.find(d=>d.id===mepSt.selDim),mepSt.ordPt.i);
        ev.preventDefault();ev.stopPropagation();return;
      }
      if(mepSt.selDim){
        mepEdit('suppression cote',()=>{sh.dims=sh.dims.filter(d=>d.id!==mepSt.selDim);mepSt.selDim=null;});
        mepSideShow();
        ev.preventDefault();ev.stopPropagation();
        return;
      }
      if(mepSt.selAxis){
        const sel=mepSt.selAxis,v=mepView(sh,sel.vid);
        if(!sel.id){ // axe automatique : Suppr lui rend sa longueur d'origine
          if(v&&v.axExt&&v.axExt[sel.ak])mepEdit('longueur axe d’origine',()=>{delete v.axExt[sel.ak];});
          mepSideShow();ev.preventDefault();ev.stopPropagation();return;
        }
        mepEdit('suppression axe',()=>{
          if(v){v.axes=(v.axes||[]).filter(a=>a.id!==sel.id);mepAxisExtDrop(v,sel.id);}
          mepSt.selAxis=null;
        });
        mepSideShow();
        ev.preventDefault();ev.stopPropagation();
        return;
      }
      if(mepSt.entSel&&mepSt.entSel.length){
        mepSt.entSel=[];mepStatus('Sélection vide.');mepRender();
        ev.preventDefault();ev.stopPropagation();
        return;
      }
      if(mepSt.sel){
        mepDelView(mepSt.sel);
        ev.preventDefault();ev.stopPropagation();
        return;
      }
      return;
    }
    const ctrl=ev.ctrlKey||ev.metaKey;
    if(ctrl&&!ev.altKey){
      const kk=k.toLowerCase();
      if(kk==='z'&&!ev.shiftKey){if(typeof docUndo==='function')docUndo();ev.preventDefault();ev.stopPropagation();return;}
      if(kk==='y'||(kk==='z'&&ev.shiftKey)){if(typeof docRedo==='function')docRedo();ev.preventDefault();ev.stopPropagation();return;}
      return; // ne pas voler le reste
    }
    if(k==='F'){try{mepFitSheet();mepRender();}catch(e){}}
    if((k==='x'||k==='X')&&mepSt.skSel&&mepSt.skSel.size){ // X : lignes / cercles / arcs sélectionnés ↔ construction
      const sh=mepSheet(),ctx=mepSkCtx(sh,false),sk=ctx.sk;
      const es=sk?mepSkSelParts(sk):null,G=es?es.L.concat(es.C):[];
      if(G.length){const on=!G.every(e=>!!e.cst);
        mepEdit(on?'construction':'trait normal',()=>G.forEach(e=>{if(on)e.cst=true;else delete e.cst;}));
        mepStatus(G.length+' élément(s) '+(on?'en construction (invisibles hors édition)':'redevenu(s) normal(aux)')+'.');
        mepSideShow();mepRender();}
      ev.preventDefault();ev.stopPropagation();return;
    }
    if(k==='v'||k==='V')mepSetTool('select');
    if(k==='l'||k==='L')mepSetTool('line');
    if(k==='r'||k==='R')mepSetTool(ev.shiftKey?'rect':'dim'); // R seul = outil cote (rayon via clic)
    if(k==='c'||k==='C')mepSetTool('circle');
    if(k==='a'||k==='A')mepSetTool('arc');
    if(k==='p'||k==='P')mepSetTool('point');
    if(k==='t'||k==='T')mepSetTool('trim');
    if(k==='d'||k==='D')mepSetTool('dim');
    if(k==='h'||k==='H')mepSetTool('hole');
    if(k==='x'||k==='X')mepSetTool('axis');
  }
  function mepViewAt(sh,sx,sy){
    // vue dont la bbox (papier) contient le point ; priorité à la plus « petite »
    let best=null,bw=1e18,byArea=1e18;
    sh.views.forEach(v=>{
      const bb=mepViewSheetBBox(v);if(!bb)return;
      const pad=2;
      if(sx>=bb.x-pad&&sx<=bb.x+bb.w+pad&&sy>=bb.y-pad&&sy<=bb.y+bb.h+pad){
        const area=(bb.w+pad*2)*(bb.h+pad*2);
        if(area<byArea){byArea=area;best=v;}
      }
    });
    return best;
  }
  // Géométrie d'une cote angulaire : sommet (intersection des 2 droites) + directions.
  function mepAngGeom(sh,d){
    const w=mepDimWorld(sh,d);if(!w)return null;
    const e1=d.a&&d.a.hint?mepEntByHint(w.v1,d.a.hint):null;
    const e2=d.b&&d.b.hint?mepEntByHint(d.vid2?w.v2:w.v1,d.b.hint):null;
    if(!(e1&&e1.t==='L'&&e2&&e2.t==='L'))return null;
    const ax=e1.x2-e1.x1,ay=e1.y2-e1.y1,bx=e2.x2-e2.x1,by=e2.y2-e2.y1;
    const a1=Math.atan2(ay,ax),a2=Math.atan2(by,bx);
    // vues différentes : coordonnées non comparables → arc centré sur la ligne A
    if(d.vid2&&d.vid2!==d.vid)return{O:w.a,a1,a2,w};
    const den=ax*by-ay*bx;
    let ox=e1.x1,oy=e1.y1;
    if(Math.abs(den)>1e-9){
      const t=((e2.x1-e1.x1)*by-(e2.y1-e1.y1)*bx)/den;
      ox=e1.x1+ax*t;oy=e1.y1+ay*t;
    }
    // chaque côté de l'angle part du sommet VERS son arête (et non selon le sens de
    // saisie du segment) ; ext = portée de l'arête le long du côté (mm papier), pour les rappels
    const ray=e=>{let dx=(e.x1+e.x2)/2-ox,dy=(e.y1+e.y2)/2-oy;if(Math.hypot(dx,dy)<1e-9){dx=e.x2-e.x1;dy=e.y2-e.y1;}
      const l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,s1=(e.x1-ox)*ux+(e.y1-oy)*uy,s2=(e.x2-ox)*ux+(e.y2-oy)*uy;
      return{a:Math.atan2(uy,ux),ext:[Math.min(s1,s2)*w.v1.scale,Math.max(s1,s2)*w.v1.scale]};};
    const r1=ray(e1),r2=ray(e2);
    return{O:mepToSheet(w.v1,ox,oy),a1:r1.a,a2:r2.a,ext:[r1.ext,r2.ext],w};
  }
  function mepAngRadius(d){return Math.max(6,Math.min(80,d.off==null?14:d.off));}
  // Trait de cote linéaire : a1/b1 = extrémités décalées, u = direction de la cote,
  // v = normale (côté de la cote). Sert au rendu, au texte et au hit-test, pour
  // que les rappels restent perpendiculaires au trait (pas de trapèze).
  function mepDimLine(sh,d,w){
    w=w||mepDimWorld(sh,d);if(!w)return null;
    if(d.kind!=='len'&&d.kind!=='dist')return null;
    const orient=d.orient||'a';
    let dx=w.b.x-w.a.x,dy=w.b.y-w.a.y,ux,uy,vx,vy,a1,b1;
    const off=(d.off==null?8:d.off);
    if(orient==='h'){
      dy=0;
      if(Math.abs(dx)<1e-9)return null;
      ux=dx>0?1:-1;uy=0;vx=0;vy=1;
      const cy=(w.a.y+w.b.y)/2+off;
      a1={x:w.a.x,y:cy};b1={x:w.b.x,y:cy};
    }else if(orient==='v'){
      dx=0;
      if(Math.abs(dy)<1e-9)return null;
      ux=0;uy=dy>0?1:-1;vx=1;vy=0;
      const cx=(w.a.x+w.b.x)/2+off;
      a1={x:cx,y:w.a.y};b1={x:cx,y:w.b.y};
    }else{
      const L0=Math.hypot(dx,dy);
      if(L0<1e-9)return null;
      ux=dx/L0;uy=dy/L0;vx=-uy;vy=ux;
      a1={x:w.a.x+vx*off,y:w.a.y+vy*off};
      b1={x:w.b.x+vx*off,y:w.b.y+vy*off};
    }
    const L=Math.hypot(dx,dy);
    const gap=MEP_DIM_STYLE.gap,over=MEP_DIM_STYLE.overrun,dir=off>=0?1:-1;
    // Distance entre DEUX droites parallèles : partir du coin de l'arête situé du
    // côté de la ligne de cote. Sinon le départ du rappel est au milieu de l'arête :
    // le vide de `gap` tombe le long de la pièce et devient invisible (la cote
    // semble « collée » à la pièce). On ne déplace que le DÉBUT du rappel, pas les
    // ancres de mesure ni la ligne de cote.
    let sa={x:w.a.x+vx*gap*dir,y:w.a.y+vy*gap*dir};
    let sb={x:w.b.x+vx*gap*dir,y:w.b.y+vy*gap*dir};
    if(d.kind==='dist'&&d.a&&d.a.hint&&d.a.hint.t==='seg'
      &&d.b&&d.b.hint&&d.b.hint.t==='seg'){
      const eA=mepEntByHint(w.v1,d.a.hint),eB=mepEntByHint(w.v1,d.b.hint);
      const parallelTo=(e)=>{
        if(!e||e.t!=='L')return false;
        const lx=e.x2-e.x1,ly=e.y2-e.y1,ll=Math.hypot(lx,ly)||1;
        return Math.abs((lx*vx+ly*vy)/ll)>0.999;
      };
      if(eA&&eB&&parallelTo(eA)&&parallelTo(eB)){
        const start=(e,ax,ay)=>{
          const p1=mepToSheet(w.v1,e.x1,e.y1),p2=mepToSheet(w.v1,e.x2,e.y2);
          const d1=(p1.x-ax)*vx*dir+(p1.y-ay)*vy*dir;
          const d2=(p2.x-ax)*vx*dir+(p2.y-ay)*vy*dir;
          const p=d1>=d2?p1:p2;
          return{x:p.x+vx*gap*dir,y:p.y+vy*gap*dir};
        };
        sa=start(eA,w.a.x,w.a.y);
        sb=start(eB,w.b.x,w.b.y);
      }
    }
    return{world:w,a:w.a,b:w.b,dx,dy,L,ux,uy,vx,vy,off,gap,over,dir,orient,
      a1,b1,
      sa,sb,
      ea:{x:a1.x+vx*over*dir,y:a1.y+vy*over*dir},
      eb:{x:b1.x+vx*over*dir,y:b1.y+vy*over*dir}};
  }
  /* orientation d'une cote linéaire : alignée (a), horizontale X (h), verticale Y (v).
     Même logique que l'esquisse 2D : le secteur du curseur autour du milieu choisit
     la direction de décalage la plus proche. */
  function mepDimOrientFromPts(ax,ay,bx,by,P){
    const dx=bx-ax,dy=by-ay;
    const mx=(ax+bx)/2,my=(ay+by)/2;
    const rdx=P.x-mx,rdy=P.y-my;
    if(Math.hypot(rdx,rdy)<=1e-6)return 'a';
    const beta=Math.atan2(dy,dx),phi=Math.atan2(rdy,rdx);
    const w180=a=>{a=(a*180/Math.PI)%180;if(a<0)a+=180;return a;};
    const dH=w180(phi-Math.PI/2),dV=w180(phi),dA=w180(phi-(beta+Math.PI/2));
    const cands=[{o:'h',d:dH,ok:Math.abs(dx)>1e-6},
      {o:'v',d:dV,ok:Math.abs(dy)>1e-6},{o:'a',d:dA,ok:true}];
    cands.sort((p,q)=>p.d-q.d);
    return (cands.find(c=>c.ok)||cands[2]).o;
  }
  function mepDimOrientAt(sh,d,P){
    const w=mepDimWorld(sh,d);if(!w||!d.b)return d.orient||'a';
    d.orient=mepDimOrientFromPts(w.a.x,w.a.y,w.b.x,w.b.y,P);
    return d.orient;
  }
  function mepDimOffsetFromPts(ax,ay,bx,by,o,P){
    if(o==='h')return P.y-(ay+by)/2;
    if(o==='v')return P.x-(ax+bx)/2;
    const dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy)||1;
    return (P.x-ax)*(-dy/L)+(P.y-ay)*(dx/L);
  }
  function mepDimClampOff(off,min){
    const m=Math.abs(min||0);
    if(off>0)return Math.max(m,off);
    if(off<0)return -Math.max(m,-off);
    return m;
  }
  // Position (mm papier) de l'étiquette d'une cote — sert au rendu et au clic/glisser.
  function mepDimTextPos(sh,d){
    const w=mepDimWorld(sh,d);if(!w)return null;
    if(d.kind==='dia'||d.kind==='rad'||d.kind==='hole'||d.kind==='note')return{x:w.b.x,y:w.b.y};
    if(d.kind==='ord'){ // valeur de l'origine, sur la ligne commune
      const v=mepView(sh,d.vid),oS=v?mepToSheet(v,d.o.x,d.o.y):w.a;
      return d.axis==='y'?{x:oS.x+(+d.off||0),y:oS.y}:{x:oS.x,y:oS.y+(+d.off||0)};
    }
    if(d.kind==='ang'){
      const g=mepAngGeom(sh,d);if(!g)return{x:w.b.x,y:w.b.y};
      let dd=g.a2-g.a1;
      while(dd<=-Math.PI)dd+=2*Math.PI;
      while(dd>Math.PI)dd-=2*Math.PI;
      const r=mepAngRadius(d);
      return{x:g.O.x+(r+7)*Math.cos(g.a1+dd/2),y:g.O.y+(r+7)*Math.sin(g.a1+dd/2)};
    }
    const g=mepDimLine(sh,d,w);
    return g?mepDimTextAnchorPos(g,d):{x:w.a.x,y:w.a.y};
  }
  function mepDimToggleArrows(d){
    const out=d.arr!=='out';
    mepEdit('sens des flèches',()=>{d.arr=out?'out':'in';});
    mepSt.selDim=d.id;mepSt.sel=null;mepSt.entSel=[];
    mepSideShow();mepRender();
    mepStatus(out?'Flèches vers l\'extérieur.':'Flèches vers l\'intérieur.');
    return out;
  }
  function mepDimArrowAt(sh,sx,sy){
    let best=null,bd=8/(mepSt.zoom||1);
    sh.dims.forEach(d=>{
      if(d.kind!=='len'&&d.kind!=='dist')return;
      const w=mepDimWorld(sh,d);if(!w)return;
      const g=mepDimLine(sh,d,w);if(!g)return;
      const dist=Math.min(Math.hypot(sx-g.a1.x,sy-g.a1.y),
        Math.hypot(sx-g.b1.x,sy-g.b1.y));
      if(dist<bd){bd=dist;best=d;}
    });
    return best;
  }
  function mepDimAt(sh,sx,sy){
    let best=null,bestScore=1e18;
    const bd=6/mepSt.zoom,bdTxt=18/mepSt.zoom;
    const segDist=(s,x1,y1,x2,y2)=>{
      const dx=x2-x1,dy=y2-y1,L2=dx*dx+dy*dy;
      let t=0;
      if(L2>1e-12)t=Math.max(0,Math.min(1,((s.x-x1)*dx+(s.y-y1)*dy)/L2));
      return Math.hypot(s.x-(x1+dx*t),s.y-(y1+dy*t));
    };
    const P={x:sx,y:sy};
    sh.dims.forEach(d=>{
      const w=mepDimWorld(sh,d);if(!w)return;
      // Tous les traits réellement dessinés (ligne, rappels, leader, arc) sont
      // enregistrés au rendu : on peut attraper n'importe lequel pour déplacer.
      let d1=1e9;
      const segs=mepDimHits.get(d);
      if(segs&&segs.length){
        segs.forEach(s=>{d1=Math.min(d1,segDist(P,s.x1,s.y1,s.x2,s.y2));});
      }else{
        const g=mepDimLine(sh,d,w);
        if(g)d1=segDist(P,g.a1.x,g.a1.y,g.b1.x,g.b1.y);
      }
      const tp=mepDimTextPos(sh,d);
      const d2=tp?Math.hypot(sx-tp.x,sy-tp.y):1e9;
      if(d1<bd||d2<bdTxt){
        const score=Math.min(d1/bd,d2/bdTxt);
        if(score<bestScore){bestScore=score;best=d;}
      }
    });
    return best;
  }
  /* menu contextuel R/Ø (clic droit sur une cote ou pendant le placement) */
  function mepCtxHide(){if(mepCtxEl)mepCtxEl.style.display='none';}
  function mepDimSetKind(d,nk,draft){
    if(!d||(d.kind!=='dia'&&d.kind!=='rad')||(nk!=='dia'&&nk!=='rad')||d.kind===nk)return;
    const label='Cote '+(nk==='dia'?'diamètre':'rayon');
    if(draft){
      d.kind=nk;delete d.txt;mepRender();
      mepStatus((nk==='dia'?'Cote Ø':'Cote R')+' : cliquez pour poser.');
      return;
    }
    mepEdit(label,()=>{d.kind=nk;delete d.txt;});
    mepSt.selDim=d.id;mepSt.sel=null;mepRender();mepSideShow();
    mepStatus(label+' — clic droit pour passer en '+(nk==='dia'?'R':'Ø')+'.');
  }
  function mepDimSetOrient(d,o,draft){
    if(!d||(d.kind!=='len'&&d.kind!=='dist'))return;
    const label=o==='h'?'Cote horizontale (X)':o==='v'?'Cote verticale (Y)':'Cote alignée';
    if(draft)d.__orientLock=true;
    if((d.orient||'a')===o){
      if(draft){mepRender();mepStatus(label+' : cliquez pour poser.');}
      return;
    }
    const apply=()=>{
      const sh=mepSheet();
      const tp=mepDimTextPos(sh,d); // position actuelle, avant de changer d'axe
      d.orient=o;
      if(tp){
        const w=mepDimWorld(sh,d);
        if(w)d.off=mepDimOffsetFromPts(w.a.x,w.a.y,w.b.x,w.b.y,o,tp);
      }
    };
    if(draft){
      apply();mepRender();
      mepStatus(label+' : cliquez pour poser.');
      return;
    }
    mepEdit(label,apply);
    mepSt.selDim=d.id;mepSt.sel=null;mepRender();mepSideShow();
    mepStatus(label+' — clic droit pour changer l’orientation.');
  }
  function mepCtxShow(x,y,d,draft){
    if(!mepCtxEl){
      mepCtxEl=document.createElement('div');
      mepCtxEl.id='mepCtx';
      mepCtxEl.style.cssText='display:none;position:fixed;z-index:10000;min-width:170px;padding:5px;'
        +'border:1px solid var(--border,#3a3a3e);border-radius:8px;background:var(--surface,#222);'
        +'box-shadow:0 8px 24px rgba(0,0,0,.45);font:12px sans-serif;color:var(--text,#eee)';
      document.body.appendChild(mepCtxEl);
      window.addEventListener('pointerdown',e=>{
        if(mepCtxEl&&mepCtxEl.style.display!=='none'&&!mepCtxEl.contains(e.target))mepCtxHide();
      },true);
    }
    mepCtxEl.innerHTML='';
    const title=document.createElement('div');
    title.textContent=draft?'Cote en cours':'Cote';
    title.style.cssText='padding:3px 8px 5px;color:var(--muted,#999);font-size:.7rem';
    mepCtxEl.appendChild(title);
    const add=(label,cur,on)=>{
      const b=document.createElement('button');
      b.type='button';b.textContent=(cur?'✓ ':'   ')+label;
      b.style.cssText='display:block;width:100%;text-align:left;padding:5px 8px;border:0;border-radius:5px;'
        +'background:none;color:inherit;font:inherit;cursor:pointer';
      b.onmouseenter=()=>{b.style.background='var(--primary,#0a84ff)';b.style.color='#fff';};
      b.onmouseleave=()=>{b.style.background='none';b.style.color='inherit';};
      b.onclick=()=>{mepCtxHide();on();};
      mepCtxEl.appendChild(b);
    };
    if(d.kind==='dia'||d.kind==='rad'){
      add('Rayon (R)',d.kind==='rad',()=>mepDimSetKind(d,'rad',!!draft));
      add('Diamètre (Ø)',d.kind==='dia',()=>mepDimSetKind(d,'dia',!!draft));
    }
    if(d.kind==='len'||d.kind==='dist'){
      const o=d.orient||'a';
      add('Alignée (A)',o==='a',()=>mepDimSetOrient(d,'a',!!draft));
      add('Horizontale (X)',o==='h',()=>mepDimSetOrient(d,'h',!!draft));
      add('Verticale (Y)',o==='v',()=>mepDimSetOrient(d,'v',!!draft));
    }
    mepCtxEl.style.display='block';
    mepCtxEl.style.left='0px';mepCtxEl.style.top='0px';
    const r=mepCtxEl.getBoundingClientRect();
    const vw=window.innerWidth||1200,vh=window.innerHeight||800;
    mepCtxEl.style.left=Math.max(4,Math.min(x,vw-r.width-4))+'px';
    mepCtxEl.style.top=Math.max(4,Math.min(y,vh-r.height-4))+'px';
  }
  function mepOnContext(ev){
    ev.preventDefault();
    if(mepSt.vcmd){mepVcmdCancel();return;}
    if(mepSt.pick&&MEP_SK_TOOLS.indexOf(mepSt.pick.kind)>=0){mepSt.pick=null;mepRender();mepStatus('Tracé terminé.');return;}
    const sh=mepSheet();if(!sh)return;
    const canCtx=d=>d&&(d.kind==='dia'||d.kind==='rad'||d.kind==='len'||d.kind==='dist');
    if(mepSt.dim&&canCtx(mepSt.dim)){
      mepCtxShow(ev.clientX,ev.clientY,mepSt.dim,true);
      return;
    }
    const P=mepPt(ev),d=mepDimAt(sh,P.x,P.y);
    if(canCtx(d)){
      mepSt.selDim=d.id;mepSt.sel=null;mepSt.entSel=[];
      mepRender();
      mepCtxShow(ev.clientX,ev.clientY,d,false);
      return;
    }
    mepCtxHide();
  }
  /* ═══════════════ U. outil cote unique ═══════════════ */
  /* pré-sélection : clic dans le vide = désélection ; clic sur arête/cercle = (dé)sélection */
  function mepEntSig(e){
    if(!e)return '';
    if(e.ak)return 'X'+e.ak; // trait d'axe : sa clé (il s'allonge sans changer d'identité)
    if(e.t==='L')return 'L'+[e.x1,e.y1,e.x2,e.y2].map(x=>(+x).toFixed(3)).join(',');
    if(e.t==='C')return 'C'+[e.cx,e.cy,e.r].map(x=>(+x).toFixed(3)).join(',');
    if(e.t==='A')return 'A'+[e.cx,e.cy,e.r,e.a0,e.a1].map(x=>(+x).toFixed(4)).join(',');
    return e.t||'?';
  }
  function mepSameHovEnt(a,b){
    if(!a||!b)return a===b;
    return a.vid===b.vid&&a.i===b.i&&a.sig===b.sig;
  }
  function mepSameEntSel(hit){
    return !!(hit&&(mepSt.entSel||[]).some(s=>s.vid===hit.vid&&s.i===hit.i
      &&(!s.sig||s.sig===mepEntSig(hit.e))));
  }
  function mepDimRefreshDraft(){
    const d=mepDimDraftFromSel();
    if(!d)return null;
    d.__sel=false;
    mepSt.dim=d;
    return d;
  }
  function mepDimSelectEnt(hit,alt){
    if(!hit||!hit.e)return false;
    const t=hit.e.t;
    if(t!=='L'&&t!=='C'&&t!=='A')return false;
    mepSt.sel=null;mepSt.selDim=null;
    mepSt.entSel=[{vid:hit.vid,i:hit.i,t,sig:mepEntSig(hit.e),lx:hit.lx,ly:hit.ly}];
    const d=mepDimRefreshDraft();
    if(!d){
      mepSt.entSel=[];
      mepStatus('Cote : cette entité ne peut pas être cotée seule.');
      mepRender();
      return false;
    }
    if(t==='C'||t==='A')d.kind=mepDimKindForEnt(t,!!alt);
    mepSt.hovEnt={vid:hit.vid,i:hit.i,sig:mepEntSig(hit.e)};
    const label=t==='L'?'Longueur':d.kind==='dia'?'Cote Ø':'Cote R';
    mepStatus(label+' : cliquez une 2ᵉ entité ou posez la cote (Échap annule).');
    mepRender();
    return true;
  }
  function mepDimAddEnt(hit){
    const before=(mepSt.entSel||[]).slice();
    mepEntSelToggle(hit,true);
    const d=mepDimRefreshDraft();
    if(!d){
      mepSt.entSel=before;
      mepStatus('Cote : ces 2 entités ne peuvent pas être cotées ensemble.');
      mepRender();
      return false;
    }
    mepSt.hovEnt={vid:hit.vid,i:hit.i,sig:mepEntSig(hit.e)};
    mepStatus('2 entités — cliquez pour poser la cote (clic droit : R/Ø).');
    mepRender();
    return true;
  }
  function mepEntSelToggle(hit,add){
    if(!hit)return;
    if(!mepSt.entSel)mepSt.entSel=[];
    const i=mepSt.entSel.findIndex(s=>s.vid===hit.vid&&s.i===hit.i);
    if(i>=0)mepSt.entSel.splice(i,1);
    else{
      if(mepSt.entSel.length>=2){
        if(add){mepStatus('2 entités maximum pour une cote.');return;}
        mepSt.entSel=[];
      }
      mepSt.entSel.push({vid:hit.vid,i:hit.i,t:hit.e.t,sig:mepEntSig(hit.e),lx:hit.lx,ly:hit.ly});
    }
    if(mepSt.entSel.length){mepSt.sel=null;mepSt.selDim=null;}
    const n=mepSt.entSel.length;
    mepStatus(n?('Sélection : '+n+' entité(s) — bouton Cote pour coter.'):'Sélection vide.');
  }
  function mepEntRef(sh,s){
    const v=mepView(sh,s.vid);if(!v)return null;
    const e=mepEntByHint(v,{i:s.i});
    if(!e)return null;
    if(s.sig&&s.sig!==mepEntSig(e))return null;
    return{v,e,i:s.i};
  }
  // type par défaut : un arc se cote en R, un cercle complet en Ø (Alt inverse,
  // le menu contextuel permet de revenir à l'autre type après coup).
  function mepDimKindForEnt(t,alt){return t==='A'?(alt?'dia':'rad'):(alt?'rad':'dia');}
  function mepSnapSeg(e,lx,ly,tol){
    const dx=e.x2-e.x1,dy=e.y2-e.y1,L2=dx*dx+dy*dy;
    let t=L2>1e-12?((lx-e.x1)*dx+(ly-e.y1)*dy)/L2:0;
    t=t<0?0:(t>1?1:t);
    if(tol>0){
      const d0=Math.hypot(lx-e.x1,ly-e.y1),d1=Math.hypot(lx-e.x2,ly-e.y2);
      if(d0<=tol&&d0<=d1)t=0;
      else if(d1<=tol)t=1;
    }
    return{t:t,x:e.x1+dx*t,y:e.y1+dy*t};
  }
  /* Construit la cote à partir de la pré-sélection (1 ou 2 entités projetées). */
  function mepDimDraftFromSel(){
    const sh=mepSheet();if(!sh)return null;
    const sel=(mepSt.entSel||[]).slice();
    const A=sel[0]?mepEntRef(sh,sel[0]):null;
    if(!A)return null;
    const base={off:10,tol:null,__ghost:true,__sel:true};
    if(sel.length===1){
      const{v,e,i}=A;
      if(e.t==='L')return Object.assign(base,{kind:'len',vid:v.id,vid2:null,
        a:{x:e.x1,y:e.y1,hint:{t:'seg',i}},b:{x:e.x2,y:e.y2}});
      if(e.t==='C'||e.t==='A'){
        return Object.assign(base,{kind:mepDimKindForEnt(e.t,false),vid:v.id,vid2:null,
          a:{x:e.cx,y:e.cy,hint:{t:'ctr',i}},b:{x:e.cx+e.r,y:e.cy}});
      }
      return null;
    }
    if(sel.length!==2)return null;
    const B=mepEntRef(sh,sel[1]);if(!B)return null;
    const Av=A.v,Ae=A.e,Ai=A.i,Bv=B.v,Be=B.e,Bi=B.i;
    const isL=x=>x.t==='L',isC=x=>x.t==='C'||x.t==='A';
    if(isL(Ae)&&isL(Be)){
      const ax=Ae.x2-Ae.x1,ay=Ae.y2-Ae.y1,bx=Be.x2-Be.x1,by=Be.y2-Be.y1;
      const la=Math.hypot(ax,ay)||1,lb=Math.hypot(bx,by)||1;
      const par=Math.abs(ax*by-ay*bx)/(la*lb)<1e-4;
      if(par&&Av.id===Bv.id){
        // droites parallèles : distance perpendiculaire. On ancre la cote au
        // milieu des deux points cliqués (borné sur A) puis on projette ce
        // point sur B : les extrémités et le dégagement restent ceux de la
        // géométrie, pas le milieu arbitraire du segment.
        const sA=sel[0],sB=sel[1];
        const snapTol=Math.max(0.15,Math.min(2,1.5/Math.max(Av.scale,1e-9)));
        const pA=(sA&&sA.lx!=null)?mepSnapSeg(Ae,sA.lx,sA.ly,snapTol)
          :{t:0.5,x:Ae.x1+ax*0.5,y:Ae.y1+ay*0.5};
        const pB=(sB&&sB.lx!=null)?mepSnapSeg(Be,sB.lx,sB.ly,snapTol)
          :{t:0.5,x:Be.x1+bx*0.5,y:Be.y1+by*0.5};
        const tA=pA.t;
        const tB=((pB.x-Ae.x1)*ax+(pB.y-Ae.y1)*ay)/(la*la);
        let t=(tA+tB)/2;t=t<0?0:(t>1?1:t);
        const ax0=Ae.x1+ax*t,ay0=Ae.y1+ay*t;
        let tb=((ax0-Be.x1)*bx+(ay0-Be.y1)*by)/(lb*lb);
        tb=tb<0?0:(tb>1?1:tb);
        return Object.assign(base,{kind:'dist',vid:Av.id,vid2:null,
          a:{x:ax0,y:ay0,hint:{t:'seg',i:Ai}},
          b:{x:Be.x1+bx*tb,y:Be.y1+by*tb,hint:{t:'seg',i:Bi}}});

      }
      return Object.assign(base,{kind:'ang',off:14,vid:Av.id,vid2:Bv.id,
        a:{x:Ae.x1,y:Ae.y1,hint:{t:'seg',i:Ai}},
        b:{x:Be.x1,y:Be.y1,hint:{t:'seg',i:Bi}}});
    }
    if(isC(Ae)&&isC(Be)){
      // entraxe : les deux centres doivent être dans la même vue (repère commun)
      if(Av.id!==Bv.id)return null;
      return Object.assign(base,{kind:'dist',vid:Av.id,vid2:null,
        a:{x:Ae.cx,y:Ae.cy},b:{x:Be.cx,y:Be.cy}});
    }
    // cercle + droite : distance centre ↔ droite (pied de perpendiculaire)
    const line=isL(Ae)?Ae:(isL(Be)?Be:null),circ=isC(Ae)?Ae:(isC(Be)?Be:null);
    if(line&&circ){
      const lv=isL(Ae)?Av:Bv,cv=isL(Ae)?Bv:Av;
      if(lv.id!==cv.id)return null;
      const ax=line.x2-line.x1,ay=line.y2-line.y1,la=Math.hypot(ax,ay)||1;
      let t=((circ.cx-line.x1)*ax+(circ.cy-line.y1)*ay)/(la*la);
      t=t<0?0:(t>1?1:t);
      return Object.assign(base,{kind:'dist',vid:lv.id,vid2:null,
        a:{x:line.x1+ax*t,y:line.y1+ay*t},b:{x:circ.cx,y:circ.cy}});
    }
    return null;
  }
  /* Met la cote (brouillon ou existante) sous le curseur. */
  function mepDimMoveTo(sh,d,P,pk){
    if(!d)return false;
    const w=mepDimWorld(sh,d);if(!w)return false;
    if(d.kind==='len'||d.kind==='dist'){
      if(!d.b)return false;
      // Une cote en cours de pose choisit son axe au curseur ; une cote déjà
      // posée garde son orientation quand on déplace son étiquette.
      if(d.__ghost&&!d.__orientLock)mepDimOrientAt(sh,d,P);
      const o=d.orient||'a';
      const w2=mepDimWorld(sh,d);if(!w2)return false;
      // 2026-10-22-012 : cote POSÉE saisie (ligne ou valeur) — le geste la déplace à la fois le long
      // des lignes de rappel (décalage) et le long de sa ligne (valeur), en relatif : rien ne saute
      if(pk&&pk.off0!=null&&pk.sx!=null){
        const offAt=Q=>{
          if(o==='h'||o==='v')return mepDimOffsetFromPts(w2.a.x,w2.a.y,w2.b.x,w2.b.y,o,Q);
          const dx=w2.b.x-w2.a.x,dy=w2.b.y-w2.a.y,L=Math.hypot(dx,dy);
          return L<1e-9?0:(Q.x-w2.a.x)*(-dy/L)+(Q.y-w2.a.y)*(dx/L);
        };
        const S={x:pk.sx,y:pk.sy};
        d.off=(+pk.off0||0)+offAt(P)-offAt(S);
        const g=mepDimLine(sh,d,mepDimWorld(sh,d));
        if(g){
          const to=(+pk.txtOff0||0)+(P.x-S.x)*g.ux+(P.y-S.y)*g.uy;
          d.txtOff=mepDimTxtOffSnap(sh,d,to,g);
        }
        return true;
      }
      if(!(pk&&pk.labelHit)){
        if(o==='h'||o==='v'){
          d.off=mepDimOffsetFromPts(w2.a.x,w2.a.y,w2.b.x,w2.b.y,o,P);
        }else{
          const dx=w2.b.x-w2.a.x,dy=w2.b.y-w2.a.y,L=Math.hypot(dx,dy);
          if(L<1e-9)return false;
          d.off=(P.x-w2.a.x)*(-dy/L)+(P.y-w2.a.y)*(dx/L);
        }
      }
      if(pk&&pk.labelHit){
        const g=mepDimLine(sh,d,w2);
        if(g){
          const mx=(g.a1.x+g.b1.x)/2,my=(g.a1.y+g.b1.y)/2;
          const to=(P.x-mx)*g.ux+(P.y-my)*g.uy;
          d.txtOff=mepDimTxtOffSnap(sh,d,to,g);
        }
      }
      return true;
    }
    // angle : le curseur règle le rayon de l'arc (centré sur le sommet réel).
    if(d.kind==='ang'){
      const g=mepAngGeom(sh,d);
      if(!g)return false;
      // l'étiquette est à r+7 : le curseur doit la suivre, pas l'arc
      d.off=Math.max(6,Math.min(80,Math.hypot(P.x-g.O.x,P.y-g.O.y)-7));
      return true;
    }
    // Ø/R : translation du point d'ancrage (si on a saisi l'étiquette, on
    // conserve le décalage main→étiquette au lieu de la coller sous le doigt).
    const v=mepView(sh,d.vid);
    if(!v)return false;
    let sx=P.x,sy=P.y;
    if(pk&&pk.cx!=null){sx=pk.cx+(P.x-pk.sx);sy=pk.cy+(P.y-pk.sy);}
    if(d.kind==='dia'||d.kind==='rad'||d.kind==='hole'||d.kind==='note'){
      d.b={x:(sx-v.x)/v.scale,y:(sy-v.y)/v.scale};
      return true;
    }
    if(d.kind==='ord'&&pk&&pk.jog){ // cassure : la valeur glisse le long de l'axe
      const q=d.pts&&d.pts[pk.jog.i];if(!q)return false;
      const v1=mepView(sh,d.vid),sc=(v1&&v1.scale)||1;
      q.jog=+(pk.jog.j0+(d.axis==='y'?P.y-pk.sy:P.x-pk.sx)/sc).toFixed(3); // mm vue (suit l'échelle)
      if(Math.abs(q.jog)<1e-3)delete q.jog;
      return true;
    }
    if(d.kind==='ord'&&pk&&pk.off0!=null){ // tout le groupe glisse perpendiculairement à l'axe
      d.off=(+pk.off0||0)+(d.axis==='y'?P.x-pk.sx:P.y-pk.sy);
      return true;
    }
    return false;
  }
  function mepDimClearSelection(){
    mepSt.dim=null;mepSt.entSel=[];mepSt.hovEnt=null;
  }
  function mepDimCommitDraft(sh,P,ref){
    const D=mepSt.dim;if(!D)return;
    if(!mepDimWorld(sh,D)){
      mepDimClearSelection();mepRender();
      mepStatus('Cote annulée : vue supprimée.');
      return;
    }
    mepDimMoveTo(sh,D,P);
    const id=mepUid('d');
    const d=Object.assign({},D,{id,ref:!!ref,tol:D.tol||null});
    delete d.__ghost;delete d.__sel;delete d.__orientLock;
    // retirer le fantôme AVANT le rendu de mepEdit (sinon il reste affiché)
    mepDimClearSelection();
    mepSt.selDim=id;mepSt.sel=null;
    mepEdit('cote '+(d.kind==='hole'?'perçage':d.kind==='dia'?'Ø':d.kind==='rad'?'R':d.kind==='ang'?'angle':d.kind==='len'?'longueur':'distance'),()=>{
      sh.dims.push(d);
    });
    mepSideShow();
    mepStatus('Cote posée — glissez n’importe quel trait rouge ou l’étiquette pour la déplacer.');
  }
  function mepDimClick(sh,P,ctrl,shift,alt){
    const tool=mepSt.dim; // état en cours : {kind,a,vid,ent}
    if(!tool){
      // 1ᵉʳ clic : sélection d'une entité, sans poser la cote. Un 2ᵉ clic sur
      // une autre entité construit distance/angle ; sinon le clic suivant pose.
      const hit=mepHitViewEnt(sh,P.x,P.y,{axes:true});
      if(hit&&mepDimSelectEnt(hit,alt))return;
      // sinon : point libre (distance)
      const snap=mepSnapPt(P.x,P.y,sh);
      const v=mepViewAt(sh,snap.x,snap.y);
      const lx=v?(snap.x-v.x)/v.scale:0,ly=v?(snap.y-v.y)/v.scale:0;
      if(!v){mepStatus('Cote : cliquez une arête ou un cercle projeté.');return;}
      const qa={x:lx,y:ly};{const hh=(snap.hit&&snap.hit.vid===v.id)?mepSnapHint(sh,v,snap,qa):null;if(hh&&(hh.t==='axp'||hh.t==='axc'||hh.t==='eln'))qa.hint=hh;}
      mepSt.dim={kind:'dist',a:qa,vid:v.id,off:8,__ghost:true};
      mepStatus('Distance : cliquez le 2ᵉ point.');
      return;
    }
    /* 2ᵉ clic */
    const D=mepSt.dim;
    const sh2=sh;
    if(D.kind==='dist'&&!D.b){
      const snap=mepSnapPt(P.x,P.y,sh2);
      const v=mepView(sh2,D.vid);
      if(!v){mepSt.dim=null;return;}
      const lx=(snap.x-v.x)/v.scale,ly=(snap.y-v.y)/v.scale;
      D.b={x:lx,y:ly};{const hh=(snap.hit&&snap.hit.vid===v.id)?mepSnapHint(sh2,v,snap,D.b):null;if(hh&&(hh.t==='axp'||hh.t==='axc'||hh.t==='eln'))D.b.hint=hh;}
      D._pp=P; // position papier du 2ᵉ clic → futur placement
      mepStatus('Distance : encore un clic pour placer la cote.');
      return;
    }
    if(D.kind==='dist'&&D.b&&D._pp){
      // placement final
      const a=D.a,b=D.b,vid=D.vid;
      mepDimMoveTo(sh2,D,P);
      const off=D.off,orient=D.orient||'a';
      mepEdit('cote distance',()=>{
        sh2.dims.push({id:mepUid('d'),kind:'dist',vid,vid2:null,a,b,off,orient,ref:shift,tol:null});
      });
      mepDimClearSelection();mepSt.selDim=null;mepSt.sel=null;mepRender();
      mepStatus('Cote posée.');
      return;
    }
    if(D.kind==='len'){
      // Ctrl + 2ᵉ segment → angle
      if(ctrl){
        const hit=mepHitViewEnt(sh2,P.x,P.y,{axes:true});
        if(hit&&hit.e.t==='L'){
          mepEdit('cote angle',()=>{
            sh2.dims.push({id:mepUid('d'),kind:'ang',vid:D.vid,vid2:hit.vid,
              a:D.a,b:{x:hit.lx,y:hit.ly,hint:{t:'seg',i:hit.i}},off:10,ref:shift,tol:null});
          });
          mepDimClearSelection();mepSt.selDim=null;mepSt.sel=null;mepRender();
          mepStatus('Cote angulaire posée.');
          return;
        }
      }
      // placement : la cote porte sur les DEUX extrémités de l'arête (point cliqué ≠ cote)
      const v=mepView(sh2,D.vid);
      if(v){
        // orienter l'offset perpendiculairement au segment
        const e=D.a.hint?mepEntByHint(v,D.a.hint):null;
        let A={x:D.a.x,y:D.a.y},B={x:D.a.x,y:D.a.y};
        if(e&&e.t==='L'){A={x:e.x1,y:e.y1};B={x:e.x2,y:e.y2};}
        const ax=v.x+A.x*v.scale,ay=v.y+A.y*v.scale;
        const bx=v.x+B.x*v.scale,by=v.y+B.y*v.scale;
        const orient=mepDimOrientFromPts(ax,ay,bx,by,P);
        const off=mepDimClampOff(mepDimOffsetFromPts(ax,ay,bx,by,orient,P),6);
        mepEdit('cote longueur',()=>{
          sh2.dims.push({id:mepUid('d'),kind:'len',vid:D.vid,vid2:null,a:A,b:B,off,orient,ref:shift,tol:null});
        });
      }
      mepDimClearSelection();mepSt.selDim=null;mepSt.sel=null;mepRender();
      mepStatus('Cote posée.');
      return;
    }
    if(D.kind==='dia'||D.kind==='rad'){
      const off=mepDimOff(D.a,{x:D.a.x+0.001,y:D.a.y},P);
      // b = point direction du leader
      const v=mepView(sh2,D.vid);
      let bx=D.a.x,by=D.a.y-1;
      if(v){
        bx=(P.x-v.x)/D.a.x!==0?(P.x-v.x)/v.scale:D.a.x;
        bx=(P.x-v.x)/v.scale;by=(P.y-v.y)/v.scale;
      }
      mepEdit('cote '+(D.kind==='dia'?'Ø':'R'),()=>{
        sh2.dims.push({id:mepUid('d'),kind:D.kind,vid:D.vid,vid2:null,
          a:D.a,b:{x:bx,y:by},off:0,ref:shift,tol:null});
      });
      mepDimClearSelection();mepSt.selDim=null;mepSt.sel=null;mepRender();
      mepStatus('Cote posée.');
      return;
    }
    // repli
    mepDimClearSelection();mepRender();
  }
  function mepDimOff(a,b,P){
    const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1;
    const nx=-dy/L,ny=dx/L;
    return Math.abs((P.x-a.x)*nx+(P.y-a.y)*ny)||8;
  }
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
     sel.onchange=()=>{const P=MEP_LW_PRESETS[sel.value];if(P){mepLwSet({preset:sel.value,thick:P.thick,thin:P.thin,hid:P.hid,dim:P.dim});mepSideShow();}};
     r.appendChild(sel);}
    {const cur=mepLwGet();
     // une valeur par ligne (libellé à gauche, saisie à droite) comme le reste du panneau
     [['Trait épais (mm)','thick'],['Trait fin (mm)','thin'],['Trait caché (mm)','hid'],['Cotes (mm)','dim']].forEach(([lab,k])=>{
       r=rowEl();
       const L=document.createElement('label');L.textContent=lab;r.appendChild(L);
       const i=document.createElement('input');i.type='number';i.step='0.05';i.min='0.1';i.max='2';i.value=cur[k];i.title=lab;
       i.onchange=()=>{const v=Math.min(2,Math.max(.1,+i.value||cur[k]));const o=Object.assign({},mepLwGet(),{preset:'perso'});o[k]=v;mepLwSet(o);mepSideShow();};
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
     sel.value=cur;
     sel.onchange=()=>{const v=sel.value;if(v==='cur')return;
       mepEdit('modèle de cartouche',()=>{tt.tb=v==='std'?null:mepClone(mepTbLib()[v.slice(2)]);});mepSideShow();};
     r.appendChild(sel);}
    r=rowEl();
    rb('Exporter…',()=>mepTbExportFile(sh),'Enregistrer les modèles de cartouche (bibliothèque + celui de cette planche) dans un fichier .mfcartouche');
    rb('Importer…',()=>mepTbImportFile(),'Charger des modèles de cartouche depuis un fichier .mfcartouche (ajoutés à la bibliothèque)');
    {const st=mepTbStray(sh);
     if(st.length){
       const n=document.createElement('div');n.className='note';n.style.color='#ff9f0a';
       n.textContent='⚠ '+st.length+' point(s) du cartouche sont hors de la feuille (solveur parti au loin) : ils sont ignorés pour la hauteur du cartouche.';
       root.appendChild(n);r=rowEl();
       rb('Supprimer les éléments hors feuille',()=>{mepEdit('cartouche : éléments hors feuille',()=>mepTbDropStray(sh));mepSideShow();},'Supprime ces points, leurs lignes et leurs contraintes (annulable)');
     }}
    r=rowEl();
    rb(mepTbIsSk(sh)?'Éditer le cartouche…':'Dessiner le cartouche…',()=>mepTbEdit(true),'Lignes, rectangles, textes et champs (matière, TTS, TTH…), contraintes et cotes pilotantes');
    if(mepTbIsSk(sh)){
      rb('Enregistrer…',()=>{
        const n=(prompt('Nom du modèle de cartouche (bibliothèque de ce navigateur) :',tt.tb.name||'Mon cartouche')||'').trim();if(!n)return;
        const L=mepTbLib();L[n]=Object.assign(mepClone(tt.tb),{name:n});mepTbLibSave(L);
        mepEdit('modèle de cartouche',()=>{tt.tb.name=n;});mepStatus('Modèle « '+n+' » enregistré.');mepSideShow();},
        'Ajouter ce cartouche à la bibliothèque : réutilisable dans toutes les pièces');
      const lib=mepTbLib();
      if(tt.tb.name&&lib[tt.tb.name]){
        let def='';try{def=localStorage.getItem('mep_tb_def')||'';}catch(e){}
        r=rowEl();
        rb(def===tt.tb.name?'✓ Par défaut':'Par défaut',()=>{try{if(def===tt.tb.name)localStorage.removeItem('mep_tb_def');else localStorage.setItem('mep_tb_def',tt.tb.name);}catch(e){}mepSideShow();},'Modèle des nouvelles planches');
        rb('Retirer de la bibliothèque',()=>{
          if(!confirm('Retirer « '+tt.tb.name+' » de la bibliothèque ? La planche garde son cartouche.'))return;
          const L=mepTbLib();delete L[tt.tb.name];mepTbLibSave(L);
          try{if(localStorage.getItem('mep_tb_def')===tt.tb.name)localStorage.removeItem('mep_tb_def');}catch(e){}
          mepSideShow();});
      }
    }
    /* — révisions (indice = dernière révision) — */
    const revs=Array.isArray(tt.revs)?tt.revs:[];
    r=rowEl();{const L=document.createElement('label');L.textContent='Révisions';L.style.fontWeight='600';r.appendChild(L);
     // indices : lettres (A, B, C…) ou chiffres (0, 1, 2… / 1, 2, 3…) ; changer renumérote les révisions existantes
     const fs=document.createElement('select');fs.id='mepRevFmt';fs.title='Indices des révisions : lettres ou chiffres (renumérote les révisions existantes)';
     [['A','A, B, C…'],['0','0, 1, 2…'],['1','1, 2, 3…']].forEach(([v,l])=>{const o=document.createElement('option');o.value=v;o.textContent=l;fs.appendChild(o);});
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
     n.textContent='Tous les réglages du plan (écriture, cotes, traits, export, papier, cadre et cartouche par défaut) sont enregistrés avec la pièce (.miniFusion) et gardés pour la session. Ouvrir une pièce reprend ses réglages.';
     root.appendChild(n);}
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
      let chkShade,chk3d;
      chkShade=mkChk('Ombrage (faces)','shade','mepChkShade',on=>{
        if(on){v.render3d=false;if(chk3d)chk3d.checked=false;setTimeout(()=>{try{mepSideShow();}catch(e){}},0);}
      });
      chk3d=mkChk('Rendu 3D (image)','render3d','mepChkRender3d',on=>{
        if(on){v.shade=false;if(chkShade)chkShade.checked=false;}
        setTimeout(()=>{try{mepSideShow();}catch(e){}},0); // case « Miroir » : seulement en rendu 3D
      });
      chk3d.title='Rendu de la vue depuis la 3D (couleurs et transparence des corps)';
      if(v.render3d){const cm=mkChk('Miroir','mirror','mepChkMirror');cm.title='Reflet de la pièce sous elle-même, estompé vers le bas (sans sol ni ombre)';}
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
    if(v.render3d&&v.kind!=='section'&&v.kind!=='detail')
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
  /* ═══════════════ W. export SVG / impression ═══════════════ */
  function mepExportBW(){try{return localStorage.getItem('mep_exp_bw')==='1';}catch(e){return false;}}
  function mepExportPrep(clone,bw){
    // Couleur (défaut) : palette papier blanc + accent du thème → cotes, axes et traits colorés gardés.
    // Noir : tout en noir sur blanc (ISO), couleurs d'entités comprises. Renvoie le CSS à ajouter.
    if(bw===undefined)bw=mepExportBW();
    // 2026-10-22-012 : les poignées d'axe (interface) ne sortent jamais
    try{clone.querySelectorAll('.mepAxisHandle').forEach(e=>e.parentNode&&e.parentNode.removeChild(e));}catch(e){}
    const st=clone.style,set=(k,v)=>{try{st.setProperty(k,v);}catch(e){st[k]=v;}};
    if(bw){
      try{st.removeProperty('--mepDimCol');}catch(e){delete st['--mepDimCol'];}
      return 'line.mepUc,circle.mepUc,path.mepUc,rect.mepUc{stroke:#111!important}text.mepUc{fill:#111!important}';
    }
    let th='nuit';try{th=document.body.getAttribute('data-theme')||'nuit';}catch(e){}
    const v=MEP_PAPER.white;Object.keys(v).forEach(k=>set('--'+k,v[k]));
    set('--mepAccent',MEP_ACC_W[th]||'#0a84ff');
    return '';
  }
  function mepSetExportBW(on){
    try{localStorage.setItem('mep_exp_bw',on?'1':'0');}catch(e){}
    mepStatus('Export PDF / SVG / impression : '+(on?'noir sur blanc.':'en couleur (cotes, axes et traits colorés gardés).'));
  }
  function mepExportSvg(){
    try{
      const sh=mepSheet();
      const pg=mepPage();
      const clone=mepSvgEl.cloneNode(true);
      clone.removeAttribute('id'); // ne pas laisser la règle UI #mepSvg{css} écraser les mm
      const xcss=mepExportPrep(clone); // couleur (défaut) ou noir
      clone.setAttribute('xmlns',NS);
      clone.setAttribute('viewBox','0 0 '+pg.W+' '+pg.H);
      clone.setAttribute('width',pg.W+'mm');
      clone.setAttribute('height',pg.H+'mm');
      // strip UI helpers
      clone.querySelectorAll('#mepGHlp,.mepDraft').forEach(n=>n.parentNode&&n.parentNode.removeChild(n));
      clone.querySelectorAll('.mepSkSelE,.mepSkSelT,.mepSkHovE').forEach(n=>{n.classList.remove('mepSkSelE');n.classList.remove('mepSkSelT');n.classList.remove('mepSkHovE');});
      // les éléments ne portent que des classes : embarquer la feuille de style PLAN
      const st=document.createElementNS(NS,'style');
      st.textContent=css.textContent+xcss;
      clone.insertBefore(st,clone.firstChild);
      const xml='<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(clone);
      const blob=new Blob([xml],{type:'image/svg+xml'});
      const a=document.createElement('a');
      a.href=URL.createObjectURL(blob);
      a.download=(doc.name||'plan').replace(/[^\w.-]+/g,'_')+'_'+sh.name.replace(/\s+/g,'')+'.svg';
      document.body.appendChild(a);
      a.click();
      setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},400);
      mepStatus('SVG exporté : '+a.download);
    }catch(e){mepStatus('Export SVG impossible : '+e.message);}
  }
  /* ═══════════════ export DXF R12 (V0.3.11) ═══════════════
     Lu sur le SVG VIVANT : chaque élément est ramené en mm papier par sa matrice écran
     (getScreenCTM · inverse de celle du SVG) — vues, coupes, cotes, cartouche compris.
     Calques par classe ; Y vers le haut (origine en bas à gauche de la planche) ;
     cercles exacts, chemins droits exacts, courbes échantillonnées (≤ 0,25 mm),
     flèches en SOLID, textes en TEXT (accents en \U+XXXX). */
  const MEP_DXF_LAYERS=[['CONTOUR',7,'CONTINUOUS'],['TANGENTE',9,'CONTINUOUS'],['CACHE',3,'DASHED'],['AXE',1,'CENTER'],
    ['COTES',4,'CONTINUOUS'],['HACHURES',8,'CONTINUOUS'],['CADRE',7,'CONTINUOUS'],['CARTOUCHE',7,'CONTINUOUS'],
    ['TEXTE',7,'CONTINUOUS'],['ESQUISSE',5,'CONTINUOUS'],['FILETAGE',7,'CONTINUOUS']];
  const MEP_DXF_SKIP=['mepPage','mepGrid','mepVB','mepVBSel','mepSnap','mepAxisPick','mepDraft','mepDimGhost','mepFace'];
  function mepDxfLayer(el){
    const c=el.classList||{contains:()=>false},has=k=>c.contains(k);
    if(has('mepHidden'))return 'CACHE';
    if(has('mepCutLine')||has('mepCutEnd')||has('mepCutArr')||has('mepDetailC')||has('mepDetailB'))return 'AXE';
    if(has('mepAxis')||has('mepAxisCross'))return 'AXE';
    if(has('mepDimL')||has('mepDimT')||has('mepDimRef'))return 'COTES';
    if(has('mepHatch'))return 'HACHURES';
    if(has('mepTangent'))return 'TANGENTE';
    if(has('mepThread'))return 'FILETAGE'; // traits fins ISO 6410
    if(has('mepTitleText')||has('mepTitleVal')||has('mepRevText'))return 'CARTOUCHE';
    if(has('mepTitleBlock'))return 'CARTOUCHE';
    if(has('mepTbLine'))return 'CARTOUCHE';
    if(has('mepFrame')||has('mepFrame2'))return 'CADRE';
    if(has('mepSkFree'))return 'ESQUISSE';
    if(has('mepLbl'))return 'TEXTE';
    if(el.tagName==='text')return 'TEXTE';
    return 'CONTOUR';
  }
  function mepDxfBuild(){
    const pg=mepPage(),out=[];
    const R=v=>(Math.round(v*1e4)/1e4).toString();
    const g=(c,v)=>{out.push(String(c));out.push(String(v));};
    const enc=t=>String(t).replace(/[^\x20-\x7e]/g,ch=>'\\U+'+ch.charCodeAt(0).toString(16).toUpperCase().padStart(4,'0'));
    const M0=mepSvgEl.getScreenCTM().inverse();
    const mat=el=>{const m=el.getScreenCTM();return m?M0.multiply(m):null;};
    const P=(m,x,y)=>({x:m.a*x+m.c*y+m.e,y:pg.H-(m.b*x+m.d*y+m.f)}); // mm papier, Y vers le haut
    const ents=[];
    const line=(L,a,b)=>{if(Math.hypot(b.x-a.x,b.y-a.y)<1e-6)return;ents.push(['LINE',L,a,b]);};
    const poly=(L,pts,closed)=>{if(pts.length<2)return;if(pts.length===2&&!closed)return line(L,pts[0],pts[1]);ents.push(['POLY',L,pts,!!closed]);};
    let tmpSvg=null;
    const tmpPath=d=>{
      if(!tmpSvg){tmpSvg=document.createElementNS(NS,'svg');tmpSvg.setAttribute('style','position:absolute;width:0;height:0;overflow:hidden;visibility:hidden');document.body.appendChild(tmpSvg);}
      const t=document.createElementNS(NS,'path');t.setAttribute('d',d);tmpSvg.appendChild(t);return t;
    };
    const arrow=(L,tip,dir,sw,startBody)=>{
      // tip/dir en coordonnées locales SVG (Y bas), transformées ensuite
      const a=mepArrowGeom(),len=a.len*sw,h=a.h*sw,l=Math.hypot(dir.x,dir.y)||1,ux=dir.x/l,uy=dir.y/l,s=startBody?1:-1;
      const bx=tip.x+s*ux*len,by=tip.y+s*uy*len,nx=-uy*h,ny=ux*h;
      return [tip,{x:bx+nx,y:by+ny},{x:bx-nx,y:by-ny}];
    };
    const hidden=el=>{for(let n=el;n&&n!==mepSvgEl;n=n.parentNode){
      if(n.nodeType!==1)continue;if(n.tagName==='defs'||n.tagName==='marker'||n.id==='mepGHlp')return true;
      const cs=getComputedStyle(n);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0)return true;
      if(n.classList&&MEP_DXF_SKIP.some(k=>n.classList.contains(k)))return true;}return false;};
    mepSvgEl.querySelectorAll('line,rect,circle,ellipse,path,polyline,polygon,text').forEach(el=>{
      try{
        if(hidden(el))return;
        const m=mat(el);if(!m)return;
        const L=mepDxfLayer(el),cs=getComputedStyle(el),tag=el.tagName;
        if(tag==='text'){
          const txt=(el.textContent||'').trim();if(!txt)return;
          const fs=parseFloat(cs.fontSize)||5,k=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))||1;
          // chaque tspan positionné séparément (tolérances empilées…), sinon le texte entier
          const parts=[];const kids=[...el.querySelectorAll('tspan')].filter(t=>(t.textContent||'').trim());
          if(kids.length){let idx=0;el.childNodes.forEach(n=>{const tx=n.textContent||'';if(n.nodeType===1&&tx.trim())parts.push([idx,tx,parseFloat(getComputedStyle(n).fontSize)||fs]);idx+=tx.length;});}
          else parts.push([0,el.textContent,fs]);
          const ang=-Math.atan2(m.b,m.a)*180/Math.PI;
          parts.forEach(([i0,tx,f])=>{
            let q;try{q=el.getStartPositionOfChar(i0+(tx.length-tx.trimStart().length));}catch(e){q={x:+el.getAttribute('x')||0,y:+el.getAttribute('y')||0};}
            ents.push(['TEXT',L,P(m,q.x,q.y),f*k*MEP_TEXT_STYLE.capRatio,tx.trim(),ang]);
          });
          return;
        }
        const stroke=cs.stroke;if(!stroke||stroke==='none'||+cs.strokeOpacity===0||!(parseFloat(cs.strokeWidth)>0))return;
        const sw=parseFloat(cs.strokeWidth)||0.5;
        const n=k=>+el.getAttribute(k)||0;
        let a0=null,a1=null; // extrémités et directions locales pour les flèches
        if(tag==='line'){
          const A={x:n('x1'),y:n('y1')},B={x:n('x2'),y:n('y2')};line(L,P(m,A.x,A.y),P(m,B.x,B.y));
          a0={p:A,d:{x:B.x-A.x,y:B.y-A.y}};a1={p:B,d:{x:B.x-A.x,y:B.y-A.y}};
        }else if(tag==='rect'){
          const x=n('x'),y=n('y'),w=n('width'),h=n('height');if(!(w>0&&h>0))return;
          poly(L,[P(m,x,y),P(m,x+w,y),P(m,x+w,y+h),P(m,x,y+h)],true);
        }else if(tag==='circle'){
          const k=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c));ents.push(['CIRCLE',L,P(m,n('cx'),n('cy')),n('r')*k]);
        }else if(tag==='polyline'||tag==='polygon'){
          const v=(el.getAttribute('points')||'').trim().split(/[\s,]+/).map(Number);const pts=[];
          for(let i=0;i+1<v.length;i+=2)pts.push(P(m,v[i],v[i+1]));poly(L,pts,tag==='polygon');
        }else{ // path, ellipse
          const d=tag==='path'?(el.getAttribute('d')||''):null;
          if(d&&/^[\sMLHVZmlhvz0-9.,eE+-]*$/.test(d)&&!/[a-z]/.test(d.replace(/e/g,''))){
            // chemin droit absolu : sommets exacts
            const tk=d.match(/[MLHVZ]|-?[\d.]+(?:e[+-]?\d+)?/gi)||[];let i=0,cmd='M',cx=0,cy=0,sx=0,sy=0,cur=[];
            const flush=cl=>{if(cur.length>1)poly(L,cur.map(q=>P(m,q.x,q.y)),cl);cur=[];};
            while(i<tk.length){const t=tk[i];if(/^[MLHVZ]$/i.test(t)){cmd=t.toUpperCase();i++;if(cmd==='Z'){flush(true);cx=sx;cy=sy;}continue;}
              if(cmd==='M'){flush(false);cx=+tk[i];cy=+tk[i+1];i+=2;sx=cx;sy=cy;cur.push({x:cx,y:cy});cmd='L';}
              else if(cmd==='L'){cx=+tk[i];cy=+tk[i+1];i+=2;cur.push({x:cx,y:cy});}
              else if(cmd==='H'){cx=+tk[i];i++;cur.push({x:cx,y:cy});}
              else if(cmd==='V'){cy=+tk[i];i++;cur.push({x:cx,y:cy});}
              else i++;}
            flush(false);
          }else{
            // courbes : échantillonnage par sous-chemin (pas de trait de liaison entre sous-chemins)
            const subs=d?(/[a-z]/.test(d.replace(/e/g,''))?[d]:d.split(/(?=M)/)):[null];
            subs.forEach(sd=>{
              const t=sd?tmpPath(sd):el;const Lt=t.getTotalLength();if(!(Lt>0))return;
              const kk=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))||1,N=Math.min(720,Math.max(2,Math.ceil(Lt*kk/0.25)));
              let pts=[],prev=null;
              for(let j=0;j<=N;j++){const q=t.getPointAtLength(Lt*j/N);
                if(prev&&Math.hypot(q.x-prev.x,q.y-prev.y)>3*Lt/N+0.5){poly(L,pts,false);pts=[];} // saut (m relatif)
                pts.push(P(m,q.x,q.y));prev=q;}
              const cl=sd&&/z\s*$/i.test(sd);poly(L,pts,cl);
              if(sd)t.remove();
            });
          }
          if(d){try{const Lt=el.getTotalLength(),e=Math.min(.05,Lt/10);const q0=el.getPointAtLength(0),q1=el.getPointAtLength(e),r0=el.getPointAtLength(Lt-e),r1=el.getPointAtLength(Lt);
            a0={p:q0,d:{x:q1.x-q0.x,y:q1.y-q0.y}};a1={p:r1,d:{x:r1.x-r0.x,y:r1.y-r0.y}};}catch(e){}}
        }
        // flèches (marqueurs)
        [['marker-start',a0],['marker-end',a1]].forEach(([att,e])=>{
          const u=el.getAttribute(att);if(!u||!e)return;const id=(u.match(/#([\w-]+)/)||[])[1]||'';
          const tri=arrow(L,e.p,e.d,sw,/^mepArrS/.test(id));ents.push(['SOLID',L,tri.map(q=>P(m,q.x,q.y))]);
        });
      }catch(e){}
    });
    if(tmpSvg)tmpSvg.remove();
    // en-tête, tables, entités
    g(0,'SECTION');g(2,'HEADER');g(9,'$ACADVER');g(1,'AC1009');g(9,'$DWGCODEPAGE');g(3,'ANSI_1252');g(9,'$INSUNITS');g(70,4);
    g(9,'$EXTMIN');g(10,0);g(20,0);g(9,'$EXTMAX');g(10,R(pg.W));g(20,R(pg.H));
    g(9,'$LIMMIN');g(10,0);g(20,0);g(9,'$LIMMAX');g(10,R(pg.W));g(20,R(pg.H));g(0,'ENDSEC');
    g(0,'SECTION');g(2,'TABLES');
    g(0,'TABLE');g(2,'LTYPE');g(70,3);
    [['CONTINUOUS','Solid line',[]],['DASHED','__ __ __',[3.5,-2.5]],['CENTER','____ _ ____',[8,-2,1.5,-2]]].forEach(([nm,ds,pat])=>{
      g(0,'LTYPE');g(2,nm);g(70,0);g(3,ds);g(72,65);g(73,pat.length);g(40,R(pat.reduce((s,v)=>s+Math.abs(v),0)));pat.forEach(v=>g(49,R(v)));});
    g(0,'ENDTAB');
    g(0,'TABLE');g(2,'LAYER');g(70,MEP_DXF_LAYERS.length);
    MEP_DXF_LAYERS.forEach(([nm,col,lt])=>{g(0,'LAYER');g(2,nm);g(70,0);g(62,col);g(6,lt);});
    g(0,'ENDTAB');g(0,'ENDSEC');
    g(0,'SECTION');g(2,'ENTITIES');
    const cnt={};
    ents.forEach(e=>{
      const [ty,L]=e;cnt[ty]=(cnt[ty]||0)+1;
      if(ty==='LINE'){g(0,'LINE');g(8,L);g(10,R(e[2].x));g(20,R(e[2].y));g(11,R(e[3].x));g(21,R(e[3].y));}
      else if(ty==='POLY'){g(0,'POLYLINE');g(8,L);g(66,1);g(10,0);g(20,0);g(70,e[3]?1:0);
        e[2].forEach(q=>{g(0,'VERTEX');g(8,L);g(10,R(q.x));g(20,R(q.y));});g(0,'SEQEND');g(8,L);}
      else if(ty==='CIRCLE'){g(0,'CIRCLE');g(8,L);g(10,R(e[2].x));g(20,R(e[2].y));g(40,R(e[3]));}
      else if(ty==='SOLID'){const t=e[2];g(0,'SOLID');g(8,L);g(10,R(t[0].x));g(20,R(t[0].y));g(11,R(t[1].x));g(21,R(t[1].y));g(12,R(t[2].x));g(22,R(t[2].y));g(13,R(t[2].x));g(23,R(t[2].y));}
      else if(ty==='TEXT'){g(0,'TEXT');g(8,L);g(10,R(e[2].x));g(20,R(e[2].y));g(40,R(e[3]));g(1,enc(e[4]));if(Math.abs(e[5])>0.01)g(50,R(e[5]));}
    });
    g(0,'ENDSEC');g(0,'EOF');
    return{text:out.join('\r\n')+'\r\n',count:cnt,ents};
  }
  function mepExportDxf(){
    try{
      const sh=mepSheet();const r=mepDxfBuild();
      const blob=new Blob([r.text],{type:'application/dxf'});
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);
      a.download=(doc.name||'plan').replace(/[^\w.-]+/g,'_')+'_'+sh.name.replace(/\s+/g,'')+'.dxf';
      document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},400);
      mepStatus('DXF exporté : '+a.download+' ('+r.ents.length+' entités, calques CONTOUR/CACHE/AXE/COTES…)');
    }catch(e){mepStatus('Export DXF impossible : '+e.message);}
  }
  function mepPrint(pdf){
    try{
      const sh=mepSheet();
      const pg=mepPage();
      const clone=mepSvgEl.cloneNode(true);
      clone.removeAttribute('id'); // idem export : la règle #mepSvg ne doit pas s'appliquer
      const xcss=mepExportPrep(clone);
      clone.setAttribute('xmlns',NS);
      clone.setAttribute('viewBox','0 0 '+pg.W+' '+pg.H);
      clone.setAttribute('width',pg.W+'mm');clone.setAttribute('height',pg.H+'mm');
      clone.querySelectorAll('#mepGHlp,.mepDraft').forEach(n=>n.parentNode&&n.parentNode.removeChild(n));
      clone.querySelectorAll('.mepSkSelE,.mepSkSelT,.mepSkHovE').forEach(n=>{n.classList.remove('mepSkSelE');n.classList.remove('mepSkSelT');n.classList.remove('mepSkHovE');});
      const w=window.open('','_blank');
      if(!w){mepStatus('Popup bloquée — autorisez les popups pour imprimer.');return;}
      w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>'+sh.name+'</title>'+
        // page = format exact de la planche, sans marge : impression / PDF à l'échelle 1:1 réelle
        '<style>@page{size:'+pg.W+'mm '+pg.H+'mm;margin:0}'+
        'html,body{margin:0;padding:0}svg{display:block;width:'+pg.W+'mm;height:'+pg.H+'mm}'+
        // couleurs imprimées telles quelles (sinon Chrome peut les éclaircir)
        'svg{-webkit-print-color-adjust:exact;print-color-adjust:exact}'+css.textContent+xcss+'</style></head><body>'+
        new XMLSerializer().serializeToString(clone)+'</body></html>');
      w.document.close();
      setTimeout(()=>{try{w.focus();w.print();}catch(e){}},250);
      mepStatus(pdf===true?'PDF : choisissez « Enregistrer au format PDF » comme imprimante (format '+mepFmtLabel(sh)+', marges : aucune).':'Impression ouverte.');
    }catch(e){mepStatus('Impression impossible : '+e.message);}
  }
  /* ═══════════════ X. activation espace + init ═══════════════ */
  function mepAutoViews(){
    // à l'ouverture : planche vide + corps → Face + Dessus/Côté droit en PROJECTIONS 1er angle
    const sh=mepSheet();
    if(sh.views.length)return; // planche déjà peuplée : ne rien toucher
    const has=typeof bodies!=='undefined'&&bodies.some(b=>b&&!b.ghost&&b.kind!=='ghost'&&b.mesh&&b.mesh.visible!==false);
    if(!has)return;
    try{
      const front=mepAddStandardView('front');
      mepAddProjected(front,'top');   // dessous de la mère, alignée en x
      mepAddProjected(front,'right'); // à gauche de la mère, alignée en hauteur
      mepGeoCache.clear();
      mepRender();
    }catch(e){try{console.warn('mepAutoViews',e);}catch(e2){}}
  }
  function mepSetActive(on){
    if(on)mepEnsure();
    if(on){
      const was=mepSt.open; // les boutons du ruban repassent par ici : le zoom en cours est gardé
      mepBuildUI();
      mepSt.open=true;
      mepWrapEl.classList.add('open');
      mepTabsRender();
      mepSideShow();
      if(!was)mepFitSheet();
      try{if(typeof mfSyncPropsHost==='function')mfSyncPropsHost();}catch(e){}
      try{mepRender();}catch(e){console.warn(e);}
      mepStatus('Espace PLAN — planches, vues, cotes. '+mepSheet().name);
      // masque les commandes CAO/FAO du ruban via data-ws
      try{document.body.setAttribute('data-ws','plan');}catch(e){}
      // vues standards auto si planche vide et corps présents
      mepAutoViews();
    }else{
      mepSt.open=false;
      // La sélection PLAN est conservée : au retour dans l'espace, la vue/cote
      // active et son panneau réapparaissent tels quels.
      if(mepWrapEl)mepWrapEl.classList.remove('open');
      mepSideEject();
      try{if(typeof mfSyncPropsHost==='function')mfSyncPropsHost();}catch(e){}
      /* data-ws géré par mfWs (97) - ne pas écraser ici */
    }
    try{if(typeof mfWs==='function'&&on){/* mfWs('plan') géré par 97 */}}catch(e){}
  }
  function mepReset(){
    // docResetEmpty() : ferme l'espace SANS recréer doc.mep (doc.mep=null déjà posé par l'appelant)
    mepSt.open=false;mepSt.sel=null;mepSt.selDim=null;mepSt.tool='select';
    mepGeoCache.clear();
    if(mepWrapEl)mepWrapEl.classList.remove('open');
    mepSideEject();
    try{if(typeof mfSyncPropsHost==='function')mfSyncPropsHost();}catch(e){}
    try{document.body.setAttribute('data-ws','cao');}catch(e){}
  }
  function mepInit(){
    mepEnsure();
    // raccourci global Ctrl+P dans le plan
    window.addEventListener('keydown',e=>{
      if(!mepSt.open)return;
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='p'){e.preventDefault();mepPrint();}
    },true);
  }
  /* hooks documentaires : doc.mep doit exister partout (voir aussi 00/90/95) */
  try{
    if(typeof doc!=='undefined'&&!doc.mep)doc.mep=null;
  }catch(e){}
  // exports publics
  window.mepSetActive=mepSetActive;
  window.mepThemeApply=()=>{try{mepThemeApply();if(mepSt.open)mepRender();}catch(e){}};
  window.mepSetPaper=mepSetPaper;
  window.mepInit=mepInit;
  window.mepReset=mepReset;
  window.mepIsOpen=()=>mepSt.open;
  window.mepAddSheet=mepAddSheetCmd;
  window.mepExport=mepExportSvg;
  window.mepPrint=mepPrint;
  window.mepExportDxf=mepExportDxf;
  window.mepAutoHoles=mepAutoHoles;
  window.mepTbEdit=on=>{try{mepTbEdit(on===undefined?!mepSt.tbEdit:!!on);}catch(e){}};
  window.mepDxfBuild=()=>mepDxfBuild(); // texte DXF + entités (sans téléchargement)
  window.mepReprojectAll=()=>mepReproject(null);
  window.mepReprojectView=id=>{mepSetActive(true);return mepReproject(id||mepSt.sel);};
  // valeur (mm modèle) d'une cote, indépendante de l'échelle de la vue
  window.mepDimValue=d=>{const sh=mepSheet();return sh?mepDimMeasure(sh,d):0;};
  window.mepDimTextPos=d=>{const sh=mepSheet();return sh?mepDimTextPos(sh,d):null;};
  window.mepDimLine=d=>{const sh=mepSheet();return sh?mepDimLine(sh,d):null;};
  window.mepDimMoveTo=(d,P,pk)=>{const sh=mepSheet();return sh?mepDimMoveTo(sh,d,P,pk):false;};
  window.mepAngleDeg=mepAngleDeg;
  window.mepDimKindForEnt=mepDimKindForEnt;
  window.mepArrowGeom=mepArrowGeom;
  window.mepTolInfo=(cls,nom)=>mepTolRange(cls,nom);
  // fin de glissement : l'instantané undo a déjà été pris au premier mouvement
  window.mepViewDragCommit=()=>mepEdit('déplacement vue',()=>{},true);
  // après restauration d'un instantané documentaire : redessiner la planche
  window.mepRefresh=()=>{try{mepRender();}catch(e){}};
  window.mepSetTool=mepSetTool;
  window.mepImportDxf=mepImportDxf;
  window.mepSetAxisMode=mepSetAxisMode;
  // points d'entrée réservés aux tests automatisés (jamais activés dans l'app)
  if(window.__MEP_TEST_HOOKS__){
    window.__mepTest={
      bomRows:sh=>mepBomRows(sh),balloonsAuto:sh=>mepBalloonsAuto(sh),drawBalloons:(mk,sh)=>mepDrawBalloons(mk,sh),meshesOf:v=>mepMeshesOf(v),addView:o=>mepAddView(o),sheet:()=>mepSheet(),viewSig:v=>mepViewSig(v), // V0.6.7
      drawRevs:(mk,sh,pd,ty)=>mepDrawRevs(mk,sh,pd,ty),holeFam:f=>mepHoleFam(f),cutAddBreak:(sh,v)=>mepCutAddBreak(sh,v),cutBreakAt:(sh,v,m,sG,c,r)=>mepCutBreakAt(sh,v,m,sG,c,r),cutFollow:sh=>mepCutFollowAll(sh),cutAutoRefs:(sh,v)=>mepCutAutoRefs(sh,v),cutDelBreak:(sh,v)=>mepCutDelBreak(sh,v),cutDelBreakAt:(sh,v,j,sG)=>mepCutDelBreakAt(sh,v,j,sG),cutBreakClick:(sh,v,m,sG)=>mepCutBreakClick(sh,v,m,sG),cutModel:v=>mepCutModel(v),prefsCollect:()=>mepPrefsCollect(),prefsApply:p=>mepPrefsApply(p),pageDim:sh=>mepPageDim(sh),
      titleTexts:sh=>{const t=[];const mk=(tag)=>{const o={textContent:''};if(tag==='text')t.push(o);return o;};mepDrawTitle(mk,sh,mepPage().pd,100);mepDrawRevs(mk,sh,mepPage().pd,100);mepDrawBom(mk,sh,mepPage().pd,100);return t.map(o=>o.textContent);},
      sk:{fromStd:sh=>mepTbFromStd(sh),solve:(sk,a)=>mepSkSolve(sk,80,a),residual:(sk,c)=>mepSkResidual(sk,c),
        apply:(sh,id,keys)=>{mepSt.skSel=new Set(keys);mepSkApply(sh,id);},setVal:(sh,c,v)=>mepSkSetVal(sh,c,v),
        tbH:sh=>mepTbH(sh),tbEdit:on=>mepTbEdit(on),ctx:sh=>mepSkCtx(sh,true),addLine:(sh,a,b)=>mepSkAddLine(sh,a,b),trim:(sh,x,y)=>mepSkTrim(sh,x,y),clipDetail:(els,det)=>mepClipDetail(els,det),revIdx:(f,k)=>mepRevIdx(f,k),revNext:(f,r)=>mepRevNext(f,r),hit:(sh,x,y)=>{const h=mepSkHit(sh,{x,y});return h?h.key:null;},
        addRect:(sh,a,b)=>mepSkAddRect(sh,a,b),addText:(sh,p)=>mepSkAddText(sh,p),textValue:(sh,e)=>mepSkTextValue(sh,e,false),
        merge:(sk,a,b)=>mepSkMerge(sk,a,b),
        box:(sh,x0,y0,x1,y1,add)=>mepBoxSelect(sh,{sx:x0,sy:y0,cur:{x:x1,y:y1}},add),sel:()=>[...mepSt.skSel],
        lot:()=>mepSt.lot?{views:[...mepSt.lot.views],dims:[...mepSt.lot.dims]}:null,
        style:o=>{if(o)mepSt.skStyle=o;return mepSkStyleCur();},
        draw:sh=>{const r=[];mepDrawSkCtx((tag,a)=>{if(a)r.push(Object.assign({tag},a));return{textContent:''};},sh,{sk:sh.sk,ox:0,oy:0,tb:false},'sheet');return r;}},
      exportPrep:(clone,bw)=>mepExportPrep(clone,bw),
      paperBasis:(par,t,np,sg)=>mepPaperBasis(par,t,np,sg),projWhich:(par,P)=>mepVcmdProjWhich(par,P),
      fitCircle:mepFitCircle,
      axisFitCircle:mepAxisFitCircle,
      axisPitchGroups:(holes,view)=>mepAxisPitchGroups(holes,view||{scale:1}),
      axisLineGroups:(holes,view)=>mepAxisLineGroups(holes,view||{scale:1}),
      axisAuto:view=>mepAxisAutoGeom(mepSheet(),view),
      axisSym:(e1,e2,view)=>mepAxisSymGeom(e1,e2,view||{scale:1}),
      shapeCyls:bd=>mepShapeCyls(bd),
      axisManual:(view,ann)=>mepAxisManualGeom(mepSheet(),view,ann),
      axisAt:(x,y)=>mepAxisAt(mepSheet(),x,y),
      axisLines:(view,auto)=>{if(auto){mepAxGen++;const l=mepAxisLines(mepSheet(),view,auto);mepAxLinesCache.set(view,{gen:mepAxGen,geo:mepGeoOf(view),list:l});return l;}return mepAxisLines(mepSheet(),view);},
      snapPt:(x,y,o)=>mepSnapPt(x,y,mepSheet(),o),
      vcmd:()=>mepSt.vcmd,
      secStepped:view=>mepSecStepped(view),cutPrism:(s,p,v)=>mepCutPrism(s,p,v),hatchLoops:(sh,v,p,n)=>mepHatchLoops(sh,v,p,n),hatchCfg:()=>mepHatchCfg(),drawHatch:(mk,l,v,c)=>mepDrawHatch(mk,l,v,c),hatchApply:c=>mepHatchApply(c),hatchAt:(x,y)=>mepHatchAt(mepSheet(),x,y),hatchDialog:()=>mepHatchDialog(),reproject:id=>mepReproject(id||null),axisSymTrack:(v,a)=>mepAxisSymTrack(v,a),
      hitEnt:(x,y,o)=>mepHitViewEnt(mepSheet(),x,y,o),
      entByHint:(view,h)=>mepEntByHint(view,h),
      axisMode:()=>mepSt.axisMode,
      axisPick:()=>Array.isArray(mepSt.axisPick)?mepSt.axisPick.slice():[],
      setAxisMode:m=>{mepSetAxisMode(m);},
      holeText:mepHoleFeatureText,
      holeCallout:mepHoleCallout,
      fmt:mepFmtNum,
      geo:view=>mepGeoOf(view),geoClear:()=>mepGeoCache.clear(),dxfView:(txt,name)=>{const r=mepDxfParse(txt);const v=mepAddView({kind:'dxf',vk:'',label:'',dxf:mepDxfData(r,name||'t',1),mode:'wire'});v._dims=mepDxfDims(mepSheet(),v,r);return v;},dimMeasure:d=>mepDimMeasure(mepSheet(),d),ptRefresh:(v,q,pr)=>mepPtRefresh(mepSheet(),v,q,pr),dimPts:d=>mepDimPtsRefresh(mepSheet(),d),ordClick:(P,ax)=>mepOrdClick(mepSheet(),P,ax),ordEnd:()=>{mepSt.ord=null;},ordPick:(d,i)=>{mepSt.selDim=d?d.id:null;mepSt.ordPt=d?{id:d.id,i}:null;},selDim:id=>{mepSt.selDim=id;},holeTolText:(t,tol)=>mepTolMarks(mepHoleTolText(t,tol)),dimText:d=>mepDimText(d,mepDimMeasure(mepSheet(),d)),ordPtAt:(d,P)=>mepOrdPtAt(mepSheet(),d,P),ordDelPt:(d,i)=>mepOrdDelPt(mepSheet(),d,i),ordValue:(d,p)=>mepOrdValue(d,p),drawDim:(mk,d)=>mepDrawDim(mk,d,mepSheet()),dimPressDbl:(P,ev)=>mepDimPressDbl(mepSheet(),P,ev||{}),dimAlignTo:(ref,ids)=>mepDimAlignTo(mepSheet(),ref,ids),perspCam:v=>mepPerspCam(v),threadEls:v=>mepThreadEls(v),oblShear:(sh,v)=>mepOblShear(sh,v),
      imgRect:(view,img)=>mepImg3dRect(view,img),
      shadeTri:(view,A,B,C,col,op)=>mepShadeTri(view,A,B,C,col,op),
      shadeFaces:view=>mepShadedFaces(view),
      shadeLights:view=>mepShadeLights(view),
      sil:(mesh,dir)=>mepSilhouettes(mesh,dir),
      dimDraftFromSel:()=>mepDimDraftFromSel(),
      dimAt:(x,y)=>mepDimAt(mepSheet(),x,y),
      viewBox:()=>mepSvgViewBox(),
      dimPaperDown:(x,y)=>{
        const vb=mepSvgViewBox();
        // inverse exact de mepPt (zone 800×600 du harnais, planche centrée « meet »)
        const r=mepSvgEl.getBoundingClientRect(),W=r.width||800,H=r.height||600;
        const k=Math.min(W/vb.width,H/vb.height)||1,ox=(W-vb.width*k)/2,oy=(H-vb.height*k)/2;
        mepOnDown({button:0,clientX:(r.left||0)+ox+(x-vb.x)*k,
          clientY:(r.top||0)+oy+(y-vb.y)*k,altKey:false,pointerId:1,preventDefault(){}});
      },
      dimTextParts:(d,v)=>mepDimTextParts(d,v),
      dimSymbolParts:(d,v,s)=>mepDimSymbolParts(d,v,s||'Ø'),dimDrawText:(mk,T,m,u,l,x,y,a,tr,f,sy,par,post)=>mepDimDrawText(mk,T,m,u,l,x,y,a,tr,f,sy,par,post),dimStackW:(u,l,p,po)=>mepDimStackW(u,l,p,po),
      dimLabelHalf:(d,v)=>mepDimLabelHalf(d,v),
      dimTolLineH:()=>mepDimTolLineH(),
      dimExtent:(d,v)=>{
        const sh=mepSheet();if(!sh)return null;
        const g=mepDimLine(sh,d);if(!g)return null;
        return mepDimLineExtent(g,d,v==null?mepDimMeasure(sh,d):v);
      },
      dimArrowAt:(x,y)=>mepDimArrowAt(mepSheet(),x,y),
      dimToggleArrows:d=>mepDimToggleArrows(d),
      setOrient:(d,o,draft)=>mepDimSetOrient(d,o,draft),
      setEntSel:a=>{mepSt.entSel=Array.isArray(a)?a.slice():[];},
      entSel:()=>Array.isArray(mepSt.entSel)?mepSt.entSel.slice():[],
      hovEnt:()=>mepSt.hovEnt||null,
      tool:()=>mepSt.tool,
      pick:()=>mepSt.pick?{kind:mepSt.pick.kind,id:mepSt.pick.id||null}:null,
      clearPick:()=>{mepSt.pick=null;},
      dimDraft:()=>mepSt.dim?{kind:mepSt.dim.kind,orient:mepSt.dim.orient||'a',off:typeof mepSt.dim.off==='number'?mepSt.dim.off:null,ghost:!!mepSt.dim.__ghost,lock:!!mepSt.dim.__orientLock}:null,
      setViewGeo:(v,geo)=>{mepGeoCache.set(v.id,{
        ver:(typeof _docVersion!=='undefined')?_docVersion:0,sig:mepViewSig(v),geo});},
      viewSel:()=>mepSt.sel,
      setViewSel:id=>{mepSt.sel=id;mepSt.selDim=null;try{mepSideShow();mepRender();}catch(e){}},
      entSig:mepEntSig,
      clearDim:()=>{mepDimClearSelection();mepRender();},
      dimStyle:()=>({textHeight:MEP_DIM_STYLE.textHeight,dimH:MEP_TEXT_STYLE.dimH,lblH:MEP_TEXT_STYLE.lblH,noteH:MEP_TEXT_STYLE.noteH,color:MEP_DIM_STYLE.color,
        arrowAngle:MEP_DIM_STYLE.arrowAngle,arrowLen:MEP_DIM_STYLE.arrowLen}),
      setDimStyle:o=>{
        if(o&&typeof o==='object'){
          [['arrowAngle',10,90],['arrowLen',2,30]].forEach(([k,min,max])=>{
            const v=+o[k];
            if(Number.isFinite(v))MEP_DIM_STYLE[k]=Math.min(max,Math.max(min,v));
          });
          ['dimH','lblH','noteH'].forEach(k=>{const v=+o[k];if(Number.isFinite(v)&&v>0)MEP_TEXT_STYLE[k]=Math.min(20,Math.max(1.8,v));});
          if(o.color==='theme'||(typeof o.color==='string'&&/^#[0-9a-f]{6}$/i.test(o.color)))MEP_DIM_STYLE.color=o.color;
        }
        mepDimStyleSave();mepApplyDimStyle();mepRender();
      },
      resetDimStyle:()=>{mepDimStyleReset();mepRender();},
      dimSideControls:()=>{
        const res={num:[],color:[],check:[]};
        const walk=n=>{
          (n&&n.children||[]).forEach(c=>{
            if(String(c.tagName||'').toUpperCase()==='INPUT'){
              const t=String(c.type||'').toLowerCase();
              if(t==='number')res.num.push(+c.value);
              else if(t==='color')res.color.push(String(c.value));
              else if(t==='checkbox')res.check.push(String(c.id||''));
            }
            walk(c);
          });
        };
        walk(mepSideEl);
        return res;
      },
      cssVar:k=>{
        try{
          const st=mepSvgEl&&mepSvgEl.style;if(!st)return null;
          if(typeof st.getPropertyValue==='function')return st.getPropertyValue(k);
          return st[k]||null;
        }catch(e){return null;}
      }
    };
  }
  window.mepAddViewStd=vk=>{mepSetActive(true);return mepAddStandardView(vk);};
  window.mepAddCameraViewCmd=()=>{mepSetActive(true);return mepAddCameraView();};
  window.mepBeginAuxCmd=()=>{mepSetActive(true);mepVcmdStart('aux');};
  window.mepBeginProjCmd=()=>{mepSetActive(true);mepVcmdStart('proj');};
  window.mepProjectView=(which,parent)=>{mepSetActive(true);return mepAddProjected(parent||mepView(mepSheet(),mepSt.sel),which);};
  window.mepBeginSectionCmd=()=>{mepSetActive(true);mepBeginSection();};
  window.mepBeginDetailCmd=()=>{mepSetActive(true);mepBeginDetail();};
  // auto-init une fois le DOM prêt
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{try{mepInit();}catch(e){}});
  else try{mepInit();}catch(e){}
})();
