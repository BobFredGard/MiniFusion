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
    #mepSheet{flex:1;position:relative;overflow:hidden;background:#8e949e;cursor:url("data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'17'%20height%3D'17'%3E%3Cpath%20d%3D'M8.5%200v17M0%208.5h17'%20stroke%3D'%23000'%20stroke-width%3D'1.5'%2F%3E%3C%2Fsvg%3E") 8 8,crosshair;min-width:0}
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
    .mepPage{fill:#fff;stroke:#b9c0c9;stroke-width:.5}
    .mepFrame{stroke:#222;stroke-width:.9;fill:none}
    .mepFrame2{stroke:#222;stroke-width:.45;fill:none;stroke-dasharray:1.5 2.5;opacity:.6}
    .mepTitleBlock{stroke:#222;stroke-width:.8;fill:#fff}
    .mepTitleText{font:6.5px sans-serif;fill:#111}
    .mepTitleVal{font:7.5px sans-serif;fill:#111;font-weight:600}
    .mepGrid{stroke:#d8dde3;stroke-width:.4}
    .mepEnt{fill:none;stroke-linecap:round;stroke-linejoin:round;shape-rendering:geometricPrecision}
    .mepFace{shape-rendering:geometricPrecision;stroke-linejoin:round}
    .mepSharp{stroke:#151515;stroke-width:.72}
    .mepTangent{stroke:#7a8088;stroke-width:.42;stroke-opacity:.92}
    .mepHidden{stroke:#59606a;stroke-width:.42;stroke-dasharray:3.5 2.5;stroke-linecap:butt}
    .mepSect{stroke:#151515;stroke-width:.88}
    .mepHatch{stroke:#333;stroke-width:.35}
    .mepSel{stroke:#0a84ff!important;stroke-width:1.6!important}
    .mepSelEnt{stroke:#ffd60a!important;stroke-width:1.2!important}
    .mepHovEnt{stroke:#00b8ff!important;stroke-width:1.4!important}
    .mepDimGhost{opacity:.85;stroke-dasharray:3 2}
    .mepVB{fill:rgba(10,132,255,.04);stroke:#0a84ff;stroke-width:.8;stroke-dasharray:4 2.5;pointer-events:none}
    .mepVBSel{fill:none;stroke:#0a84ff;stroke-width:1;pointer-events:none}
    .mepDimL{stroke:var(--mepDimCol,#0a84ff);stroke-width:.55;fill:none}
    .mepDimT{font-family:sans-serif;font-size:var(--mepDimH,7px);fill:var(--mepDimCol,#0a84ff);font-weight:600;paint-order:stroke;stroke:#fff;stroke-width:1.5;stroke-linejoin:round}
    .mepDimRef{fill:#7a7f86}
    .mepDimL.mepDimSel{stroke:#ff3b30!important}
    .mepDimT.mepDimSel{fill:#ff3b30!important}
    .mepLbl{font:8px sans-serif;fill:#111;font-weight:700;paint-order:stroke;stroke:#fff;stroke-width:1.6;stroke-linejoin:round}
    #mepSvg,#mepSvg *{-webkit-user-select:none;-moz-user-select:none;user-select:none}
    .mepLbl,.mepDimT{pointer-events:none}
    .mepCut{stroke:#0a84ff;stroke-width:1.1;fill:none}
    .mepCutS{stroke:#0a84ff;stroke-width:.5;fill:none}
    .mepSk{fill:none;stroke-linecap:round}
    .mepSkPt{fill:#fff;stroke-width:.9}
    .mepDraft{stroke:#ffd60a;stroke-width:.7;stroke-dasharray:3 2;fill:none}
    .mepSnap{fill:none;stroke:#ffd60a;stroke-width:.9}
    .mepArrowM{fill:#0a84ff}
    .mepAxis{fill:none;stroke:#e60000;stroke-width:.35;stroke-dasharray:8 2 1.5 2;stroke-linecap:butt;stroke-linejoin:round;pointer-events:none}
    .mepAxisCross{fill:none;stroke:#e60000;stroke-width:.62;stroke-linecap:butt;pointer-events:none}
    .mepAxisSel{stroke:#0066ff!important;stroke-width:1.1!important}
    .mepAxisPick{fill:none;stroke:#ffd60a;stroke-width:1.1;pointer-events:none}
  `;
  document.head.appendChild(css);

  /* ═══════════════ B. constantes ═══════════════ */
  const NS='http://www.w3.org/2000/svg';
  const FORMATS={A0:[841,1189],A1:[594,841],A2:[420,594],A3:[297,420],A4:[210,297]};
  const FORMAT_ORDER=['A0','A1','A2','A3','A4'];
  const MARGIN=12,TITLE_H=26;
  const MEP_SCALES=[[1,'1:1'],[2,'2:1'],[5,'5:1'],[0.5,'1:2'],[0.2,'1:5'],[2.5,'5:2'],[0.25,'1:4'],[0.1,'1:10'],[1.25,'5:4'],[0.4,'2:5']];
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
      num('textHeight',2,30);
      num('arrowAngle',10,90);
      num('arrowLen',2,30);
      if(typeof o.color==='string'&&/^#[0-9a-f]{6}$/i.test(o.color))MEP_DIM_STYLE.color=o.color;
    }catch(e){}
  }
  function mepDimStyleSave(){
    try{
      localStorage.setItem(MEP_DIM_STYLE_KEY,JSON.stringify({
        textHeight:MEP_DIM_STYLE.textHeight,
        color:MEP_DIM_STYLE.color,
        arrowAngle:MEP_DIM_STYLE.arrowAngle,
        arrowLen:MEP_DIM_STYLE.arrowLen
      }));
    }catch(e){}
  }
  function mepDimStyleReset(){
    Object.assign(MEP_DIM_STYLE,MEP_DIM_STYLE_DEF);
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
        set('--mepDimCol',MEP_DIM_STYLE.color||'#0a84ff');
        set('--mepDimH',(MEP_DIM_STYLE.textHeight||7)+'px');
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
    sh.format=FORMATS[sh.format]?sh.format:'A3';
    sh.orient=sh.orient==='portrait'?'portrait':'landscape';
    sh.views=Array.isArray(sh.views)?sh.views:[];
    sh.views.forEach(v=>{
      if(!v)return;
      v.axes=Array.isArray(v.axes)?v.axes:[];
      v.autoAxes=!!v.autoAxes;
      v.autoPitch=!!v.autoPitch;
    });
    sh.dims=Array.isArray(sh.dims)?sh.dims:[];
    sh.title=sh.title&&typeof sh.title==='object'?sh.title:{};
    sh.seq=sh.seq>0?sh.seq:1;sh.dseq=sh.dseq>0?sh.dseq:1;
    if(!sh.sk)sh.sk=null;
  }
  function mepNewSheet(n){
    return{id:'sh'+Date.now().toString(36)+Math.floor(Math.random()*1e4),name:'Planche '+n,
      format:'A3',orient:'landscape',views:[],dims:[],sk:null,
      title:{projet:'MiniFusion — Plan',auteur:'—',date:new Date().toLocaleDateString('fr-FR')},
      seq:1,dseq:1};
  }
  function mepSheet(){const m=mepEnsure();return m.sheets[m.cur];}
  function mepPageDim(sh){
    sh=sh||mepSheet();const s=FORMATS[sh.format];
    const W=sh.orient==='landscape'?s[1]:s[0],H=sh.orient==='landscape'?s[0]:s[1];
    return{W,H,ix:MARGIN,iy:MARGIN,iw:W-2*MARGIN,ih:H-2*MARGIN-TITLE_H};
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
    let s=[mepRound(v.dir),mepRound(v.u),mepRound(v.v),v.bodyId||'',v.mode||'hide',v.tangent?1:0,
      v.hlrExact===false?'soft':'exact',v.shade?1:0,v.render3d?1:0,
      v.section?mepRound(v.section.p)+mepRound(v.section.n):'',v.detail?v.detail.cx+','+v.detail.cy+','+v.detail.r:''].join('|');
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
    if(mepDot(n,d)<=1e-7)return null;
    const P=p=>[mepDot(p,u),mepDot(p,v),mepDot(p,d)];
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
      const u=b.u,vv=b.v,dir=b.dir;
      let minu=1e9,maxu=-1e9,minv=1e9,maxv=-1e9,mind=1e9,maxd=-1e9,n=0;
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
          const du=px*u[0]+py*u[1]+pz*u[2];
          const dv=px*vv[0]+py*vv[1]+pz*vv[2];
          const dd=px*dir[0]+py*dir[1]+pz*dir[2];
          if(du<minu)minu=du;if(du>maxu)maxu=du;
          if(dv<minv)minv=dv;if(dv>maxv)maxv=dv;
          if(dd<mind)mind=dd;if(dd>maxd)maxd=dd;
          n++;
        }
      }
      if(!n||!(maxu>minu)||!(maxv>minv))return null;
      const pad=Math.max(0.5,(maxu-minu+maxv-minv)*0.012);
      const l=minu-pad,r=maxu+pad,t=minv-pad,btm=maxv+pad;
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
      const hw=(r-l)/2,hh=(btm-t)/2;
      const depth=Math.max(1,maxd-mind);
      const dist=depth*2+Math.max(10,(maxu-minu+maxv-minv));
      const cam=new THREE.OrthographicCamera(-hw,hw,hh,-hh,0.01,dist+depth*3+100);
      cam.up.set(-vv[0],-vv[1],-vv[2]);
      cam.position.set(center.x+dir[0]*dist,center.y+dir[1]*dist,center.z+dir[2]*dist);
      cam.lookAt(center);
      cam.updateProjectionMatrix();
      cam.updateMatrixWorld(true);
      /* ne garder que les corps de la vue et les lumières : pas de sol,
         de repère, d'arêtes ni d'esquisse dans l'image. */
      const keep=new Set();
      list.forEach(bd=>{
        let o=bd.mesh;
        while(o){keep.add(o);o=o.parent;}
      });
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
        ctx.putImageData(img,0,0);
        const url=cv.toDataURL('image/png');
        if(!url||url.length<16)return null;
        /* placement en coordonnées locales : le déplacement/zoom de la vue
           réutilise l'image sans refaire le rendu WebGL ni le HLR. */
        return{url:url,lx:+l.toFixed(3),ly:+t.toFixed(3),
          lw:+(r-l).toFixed(3),lh:+(btm-t).toFixed(3)};
      }finally{
        for(let i=0;i<saved.length;i++)saved[i][0].visible=saved[i][1];
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
  function mepFinishGeo(geo,view,cutShapes){
    if(view.render3d&&!view.section&&!view.detail){
      try{geo.img3d=mepRender3dImage(view);}catch(e){geo.img3d=null;}
    }
    if(view.shade&&!view.render3d&&!view.section&&!view.detail){
      try{geo.faces=mepShadedFaces(view);}catch(e){geo.faces=[];}
    }
    if(view.section&&cutShapes.length){
      try{geo.hatch=mepHatchLoops(cutShapes,view,view.section.p,view.section.n);}catch(e){}
    }
    if(view.detail&&view.parent){
      const par=mepView(mepSheet(),view.parent);
      if(par)geo.els=mepClipDetail(geo.els,view.detail);
    }
    return geo;
  }
  /* ═══════════════ H. construction d'une vue ═══════════════ */
  function mepBuildGeo(view){
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
    list.forEach(bd=>{if(bd.shape){shapes.push(bd.shape);shapeBodies.push(bd);}});
    const exact=shapes.length&&typeof occSharpEdges==='function';
    let cutShapes=shapes;
    if(view.section&&shapes.length){
      view._sec={p0:view.section.p,gaze:mepNorm(view.section.n)};
      cutShapes=[];
      shapes.forEach(sh=>{
        const cs=mepCutHalfSpace(sh,view.section.p,view.section.n);
        if(cs)cutShapes.push(cs);else cutShapes.push(sh);
      });
    }else view._sec=null;
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
      if(bd.shape&&exact)return; // déjà traité
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
              if(Math.abs(Math.abs(mepDot(dn,n))-1)<1e-3&&Math.abs(mepDot(mepSub(lp,p0),n))<0.05){
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
      else if(inside0)segsOut.push([x1,y1,x1+dx*t0,y1+dy*t0]);
      else if(inside1)segsOut.push([x1+dx*t1,y1+dy*t1,x2,y2]);
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
    mepEdit('nouvelle vue',()=>{
      sh.views.push(view);
      mepAutoScale(sh,view);
      const pd=mepPageDim(sh);
      mepPlaceNear(sh,view,pd.ix+pd.iw*(0.28+0.16*(sh.views.length%3)),pd.iy+pd.ih*(view.kind==='detail'?0.3:0.45));
    });
    mepSelect(view.id);
    return view;
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
      if(c.kind==='proj'&&c.parent===v.id){c.x+=dx;c.y+=dy;mepProjFollow(sh,c,dx,dy);}
    });
  }
  function mepAddProjected(par,which){
    const def=MEP_PROJ[which];
    if(!def){mepStatus('Projection inconnue : '+which);return null;}
    if(!par){mepStatus('Sélectionnez d’abord la vue mère à projeter.');return null;}
    const b=mepBasisOf(par);
    const dir=mepNorm(def.dir(b)),u=mepNorm(def.u(b));
    const v=mepNorm(mepCross(u,dir));
    const vObj=mepAddView({kind:'proj',vk:'',proj:which,dir,u,v,
      parent:par.id,label:mepNextLabel(mepSheet()),
      bodyId:par.bodyId,mode:par.mode,tangent:par.tangent,hlrExact:par.hlrExact!==false,scale:par.scale,
      autoAxes:!!par.autoAxes,autoPitch:!!par.autoPitch});
    // placement aligné 1er angle : l'axe commun est verrouillé sur la mère
    mepEdit('placement vue projetée',()=>{
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
  function mepBeginSection(){
    const par=mepView(mepSheet(),mepSt.sel);
    if(!par){mepStatus('Sélectionnez d’abord la vue parente de la coupe.');return;}
    mepSt.tool='cut2';mepSt.cutParent=par.id;mepSt.cutPts=[];
    mepStatus('Coupe : cliquez les DEUX points de la ligne de coupe sur la vue « '+(par.label||par.vk||'vue')+' ».');
  }
  function mepSectionFromPicks(par,A,B){
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
  function mepBeginDetail(){
    const par=mepView(mepSheet(),mepSt.sel);
    if(!par){mepStatus('Sélectionnez d’abord la vue parente du détail.');return;}
    mepSt.tool='det2';mepSt.cutParent=par.id;
    mepStatus('Détail : cliquez le CENTRE du cercle de détail, puis le rayon.');
  }
  function mepDetailFromPicks(par,C,R){
    const label=mepNextLabel(mepSheet());
    const src=mepBasisOf(par);
    const v=mepAddView({kind:'detail',vk:'',dir:src.dir.slice(),u:src.u.slice(),v:src.v.slice(),
      parent:par.id,label,scale:2,detail:{cx:C.x,cy:C.y,r:R},bodyId:par.bodyId,mode:par.mode,tangent:par.tangent,hlrExact:par.hlrExact!==false,
      autoAxes:!!par.autoAxes,autoPitch:!!par.autoPitch});
    mepEdit('placement vue de détail',()=>{
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
        const g=mepGeoOf(v);
        const rebind=a=>{
          if(!a||!a.hint)return a;
          let best=null,bd=0.6;
          g.els.forEach((e,i)=>{
            if(a.hint.t==='seg'&&e.t==='L'){
              const d1=Math.hypot(e.x1-a.x,e.y1-a.y),d2=Math.hypot(e.x2-a.x,e.y2-a.y);
              const dmin=Math.min(d1,d2);
              if(dmin<bd){bd=dmin;best=d1<d2?{x:e.x1,y:e.y1,hint:{t:'seg',i}}:{x:e.x2,y:e.y2,hint:{t:'seg',i}};}
            }else if(a.hint.t==='ctr'&&(e.t==='C'||e.t==='A')){
              const dmin=Math.hypot(e.cx-a.x,e.cy-a.y);
              if(dmin<bd){bd=dmin;best={x:e.cx,y:e.cy,hint:{t:'ctr',i}};}
            }
          });
          return best||a;
        };
        d.a=rebind(d.a);
        if(d.b)d.b=rebind(d.b);
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
      const c=JSON.parse(JSON.stringify({format:sh.format,orient:sh.orient,title:sh.title,views:sh.views,dims:sh.dims,sk:sh.sk}));
      const ns=mepNewSheet(doc.mep.sheets.length+1);
      ns.format=c.format;ns.orient=c.orient;ns.title=c.title;
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
    const vb=mepSvgViewBox();
    const px=(ev.clientX-r.left)/(r.width||1),py=(ev.clientY-r.top)/(r.height||1);
    return{x:vb.x+px*vb.width,y:vb.y+py*vb.height,px:ev.clientX-r.left,py:ev.clientY-r.top};
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
      const r=mepSvgEl.getBoundingClientRect();
      const vb=mepSvgViewBox();
      return vb.width/(r.width||1);
    }catch(e){return 1;}
  }
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
      p.setAttribute('fill',color);
      mkr.appendChild(p);mepDefsEl.appendChild(mkr);
    };
    const col=MEP_DIM_STYLE.color||'#0a84ff';
    mkMarker('mepArr',1,col);mkMarker('mepArrS',-1,col);
    mkMarker('mepArrSel',1,'#ff3b30');mkMarker('mepArrSSel',-1,'#ff3b30');
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
    mepSvgEl.addEventListener('pointerleave',()=>{mepSt.hovView=null;mepSt.hovEnt=null;try{mepRender();}catch(e){}});
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
  function mepCycleFormat(){
    const sh=mepSheet();
    mepEdit('format',()=>{
      const i=FORMAT_ORDER.indexOf(sh.format);
      sh.format=FORMAT_ORDER[(i+1)%FORMAT_ORDER.length];
    });
    mepTabsRender();
  }
  function mepCycleOrient(){
    const sh=mepSheet();
    mepEdit('orientation',()=>{sh.orient=sh.orient==='landscape'?'portrait':'landscape';});
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
      b.textContent=sh.name+' · '+sh.format;
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
    fmt.textContent=sh.format+' '+(sh.orient==='landscape'?'paysage':'portrait');
    mepTabsEl.appendChild(fmt);
  }
  function mepSelView(){const sh=mepSheet();return mepSt.sel?mepView(sh,mepSt.sel):null;}
  /* ═══════════════ N. rendu ═══════════════ */
  function mepRender(){
    if(!mepWrapEl||!mepSt.open)return;
    mepEnsure();
    const sh=mepSheet();
    const pg=mepPage();
    mepDimHits.clear();
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
    mk('rect',{x:pd.ix,y:pd.iy,width:pd.iw,height:pd.ih+TITLE_H,class:'mepFrame'});
    mk('rect',{x:pd.ix+3,y:pd.iy+3,width:pd.iw-6,height:pd.ih+TITLE_H-6,class:'mepFrame2'});
    const ty=pg.H-MARGIN-TITLE_H;
    mk('rect',{x:pd.ix,y:ty,width:pd.iw,height:TITLE_H,class:'mepTitleBlock'});
    mk('line',{x1:pd.ix,y1:ty,x2:pd.ix+pd.iw,y2:ty,class:'mepTitleBlock'});
    const fields=[
      ['PROJET',sh.title.projet||'','x',pd.ix+4,'w',Math.min(130,pd.iw*0.4)],
      ['PLANCHE',(doc.mep.cur+1)+' / '+doc.mep.sheets.length,'x',pd.ix+Math.min(130,pd.iw*0.4)+6,'w',44],
      ['ÉCHELLE',mepSheetScaleLabel(sh),'x',pd.ix+Math.min(130,pd.iw*0.4)+54,'w',40],
      ['DATE',sh.title.date||'','x',pd.ix+Math.min(130,pd.iw*0.4)+98,'w',56],
      ['DESSINÉ PAR',sh.title.auteur||'','x',pd.ix+Math.min(130,pd.iw*0.4)+158,'w',pd.iw-Math.min(130,pd.iw*0.4)-164]
    ];
    let lastX=pd.ix;
    fields.forEach((f,i)=>{
      const x=f[3];
      if(i>0)mk('line',{x1:x-2,y1:ty,x2:x-2,y2:ty+TITLE_H,class:'mepTitleBlock'});
      mk('text',{x,y:ty+7,class:'mepTitleText'}).textContent=f[0];
      const t=mk('text',{x,y:ty+16,class:'mepTitleVal'});
      t.textContent=String(f[1]||'').slice(0,f[5]>0?Math.floor(f[5]/2.1):24);
      lastX=x;
    });
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
    /* cote en cours de placement : aperçu vivant (suit la souris) */
    if(mepSt.dim&&mepSt.dim.__ghost!==false&&!(mepSt.dim.kind==='dist'&&!mepSt.dim.b)){
      try{mepDrawDim(mk,mepSt.dim,sh);}catch(e){}
    }
    /* esquisse de planche */
    if(sh.sk){
      try{mepDrawSk(mk,sh.sk);}catch(e){}
    }
    /* cadre bleu : sélection (plein) + survol (pointillé) */
    const drawVB=(id,cls)=>{
      const v=mepView(sh,id);
      if(!v)return;
      const b=mepViewSheetBBox(v);
      if(b)mk('rect',{x:b.x-4,y:b.y-4,width:b.w+8,height:b.h+8,class:cls},mepGHlp);
    };
    if(mepSt.sel)drawVB(mepSt.sel,'mepVBSel');
    if(mepSt.hovView)drawVB(mepSt.hovView,'mepVB');
    /* brouillons d'interaction */
    try{mepDrawDraft(mk);}catch(e){}
    mepToolSync();
  }
  function mepSheetScaleLabel(sh){
    const vals=sh.views.filter(v=>v.scale!==1).map(v=>v.scale);
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
    let auto=[];
    try{auto=mepAxisAutoGeom(sh,v);}catch(e){}
    auto.forEach(p=>mepDrawAxisPrim(mk,p,v,'mepAxisAuto'));
    (v.axes||[]).forEach(ann=>{
      let ps=[];
      try{ps=mepAxisManualGeom(sh,v,ann);}catch(e){}
      const sel=mepSt.selAxis&&mepSt.selAxis.vid===v.id&&mepSt.selAxis.id===ann.id;
      ps.forEach(p=>mepDrawAxisPrim(mk,p,v,'mepAxisManual'+(sel?' mepAxisSel':'')));
    });
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
    mepDrawAxes(mk,v,sh);
    /* la vue sélectionnée garde ses couleurs : seul le cadre bleu la signale */
    const selEnt=(e,ei)=>mepSt.entSel&&mepSt.entSel.some(s=>
      s.vid===v.id&&s.i===ei&&(!s.sig||s.sig===mepEntSig(e)));
    const hovEnt=(e,ei)=>mepSt.hovEnt&&mepSt.hovEnt.vid===v.id&&mepSt.hovEnt.i===ei
      &&(!mepSt.hovEnt.sig||mepSt.hovEnt.sig===mepEntSig(e));
    const cls=(e,ei)=>(e.k==='hidden'?'mepEnt mepHidden':e.k==='tangent'?'mepEnt mepTangent':e.k==='sect'?'mepEnt mepSect':'mepEnt mepSharp')
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
    /* ligne de coupe sur le parent */
    if(v.section&&v.section.a&&v.section.pid){
      const par=mepView(sh,v.section.pid);
      if(par){
        const A=mepToSheet(par,v.section.a[0],v.section.a[1]);
        const B=mepToSheet(par,v.section.b[0],v.section.b[1]);
        mk('line',{x1:A.x,y1:A.y,x2:B.x,y2:B.y,class:'mepCut','stroke-dasharray':'8 2 1.5 2'});
        const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy)||1;
        const nx=-dy/L*6,ny=dx/L*6;
        [[A,B,1],[B,A,-1]].forEach(([P,Q,s])=>{
          const ex=P.x+dx/L*7*s,ey=P.y+dy/L*7*s;
          mk('line',{x1:P.x+nx,y1:P.y+ny,x2:ex,y2:ey,class:'mepCutS','marker-end':'url(#mepArr)'});
          mk('line',{x1:P.x-nx,y1:P.y-ny,x2:ex,y2:ey,class:'mepCutS','marker-end':'url(#mepArr)'});
        });
        if(v.label){
          mk('text',{x:(A.x+B.x)/2+nx*1.8,y:(A.y+B.y)/2+ny*1.8+2,class:'mepLbl','text-anchor':'middle'}).textContent=v.label;
        }
      }
    }
    /* marqueur détail sur le parent */
    if(v.detail&&v.parent){
      const par=mepView(sh,v.parent);
      if(par){
        const C=mepToSheet(par,v.detail.cx,v.detail.cy);
        mk('circle',{cx:C.x,cy:C.y,r:v.detail.r*par.scale,class:'mepEnt mepSel','stroke-dasharray':'4 2'});
        if(v.label)mk('text',{x:C.x,y:C.y-v.detail.r*par.scale-2,class:'mepLbl','text-anchor':'middle'}).textContent=v.label;
      }
    }
        if(v.label){
          const bb=mepViewSheetBBox(v);
          if(bb){
            let txt=v.label;
            if(v.kind==='section')txt='COUPE '+v.label+'-'+v.label;
            else if(v.kind==='detail'){
              const s=v.scale>=1?(mepFmtNum(v.scale,2)+':1'):('1:'+mepFmtNum(1/v.scale,2));
              txt='DÉTAIL '+v.label+' ('+s+')';
            }
            mk('text',{x:bb.x+bb.w/2,y:bb.y+bb.h+11,class:'mepLbl','text-anchor':'middle'}).textContent=txt;
          }
        }
  }
  function mepDrawHatch(mk,loops,v){
    if(!loops.length)return;
    const sp=2.5/v.scale; // 2,5 mm papier
    /* rotation 45° puis scanline pair-impair (trous inclus) */
    const c=Math.SQRT1_2,s=Math.SQRT1_2;
    const rot=p=>[p[0]*c-p[1]*s,p[0]*s+p[1]*c];
    const unrot=q=>[q[0]*c+q[1]*s,-q[0]*s+q[1]*c];
    const RL=loops.map(l=>l.map(rot));
    let miny=1e9,maxy=-1e9;
    RL.forEach(l=>l.forEach(p=>{miny=Math.min(miny,p[1]);maxy=Math.max(maxy,p[1]);}));
    const lines=[];
    for(let y=Math.ceil(miny/sp)*sp;y<=maxy;y+=sp){
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
    lines.forEach(ln=>{
      mk('line',{x1:+(v.x+ln[0][0]*v.scale).toFixed(3),y1:+(v.y+ln[0][1]*v.scale).toFixed(3),
        x2:+(v.x+ln[1][0]*v.scale).toFixed(3),y2:+(v.y+ln[1][1]*v.scale).toFixed(3),class:'mepHatch'});
    });
  }
  /* ═══════════════ O. cotes : mesure, texte, rendu ═══════════════ */
  function mepDimWorld(sh,d){
    // ancrages → mm papier
    const v1=mepView(sh,d.vid);
    if(!v1)return null;
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
  function mepHoleDraft(sh,vid,e,i,lx,ly){
    const m=mepHoleAt(sh,vid,e,i);
    if(!m)return null;
    const b={x:e.cx+e.r*0.9,y:e.cy-e.r*0.9};
    if(lx!=null&&ly!=null)b={x:lx,y:ly};
    return{kind:'hole',vid:vid,vid2:null,a:{x:e.cx,y:e.cy,hint:{t:'ctr',i:i}},
      b:b,off:0,holeFid:m.f.id,holeText:mepHoleFeatureText(m.f),__ghost:true,tol:null};
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
    if(ann.kind==='free'){
      if(!ann.a||!ann.b)return[];
      return[{t:'L',x1:ann.a.x,y1:ann.a.y,x2:ann.b.x,y2:ann.b.y,cls:'mepAxis'}];
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
  function mepAxisAutoGeom(sh,v){
    const out=[];
    if(!v||(!v.autoAxes&&!v.autoPitch))return out;
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
    }
    return out;
  }
  function mepAxisAt(sh,sx,sy){
    const tol=5/mepSt.zoom;
    let best=null,bd=tol;
    sh.views.forEach(v=>{
      (v.axes||[]).forEach(ann=>{
        let ps=[];
        try{ps=mepAxisManualGeom(sh,v,ann);}catch(e){}
        ps.forEach(p=>{
          let d=1e9;
          if(p.t==='L'){
            const ax=v.x+p.x1*v.scale,ay=v.y+p.y1*v.scale;
            const bx=v.x+p.x2*v.scale,by=v.y+p.y2*v.scale;
            const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;
            const t=L2>1e-12?Math.max(0,Math.min(1,((sx-ax)*dx+(sy-ay)*dy)/L2)):0;
            d=Math.hypot(sx-(ax+dx*t),sy-(ay+dy*t));
          }else if(p.t==='C'){
            const cx=v.x+p.cx*v.scale,cy=v.y+p.cy*v.scale;
            d=Math.abs(Math.hypot(sx-cx,sy-cy)-p.r*v.scale);
          }
          if(d<bd){bd=d;best={vid:v.id,id:ann.id,ann};}
        });
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
    if(d.kind==='hole')return{main:wrap(d.txt||d.holeText||''),up:'',lo:'',sym:''};
    if(d.txt)return{main:wrap(d.txt),up:'',lo:'',sym:''};
    const unit=d.kind==='ang'?'°':'';
    const base=mepFmtNum(value,d.kind==='ang'?1:2)+unit;
    const t=d.tol||{};
    if(t.m==='pm'&&t.s>0){
      const sym='±'+mepFmtNum(t.s,3)+(post?' '+post:'');
      return{main:join(pre,base),sym,up:'',lo:''};
    }
    if(t.m==='dbl')return{main:wrap(base),up:mepSignedTol(t.hi),lo:mepSignedTol(t.lo),sym:''};
    if(t.m==='cls'&&t.cls)return{main:wrap(base+' '+t.cls),up:'',lo:'',sym:''};
    return{main:wrap(base),up:'',lo:'',sym:''};
  }
  function mepDimSymbolParts(d,value,sym){
    const pre=d.pre?String(d.pre).trim():'',post=d.post?String(d.post).trim():'';
    const p=mepDimTextParts(Object.assign({},d,{pre:'',post:''}),value);
    const join=(a,b)=>a&&b?a+' '+b:(a||b);
    const main=join(pre,sym+p.main);
    if(p.sym)return Object.assign({},p,{main,sym:join(p.sym,post)});
    return Object.assign({},p,{main:join(main,post)});
  }
  function mepDimText(d,value){
    const p=(d.kind==='dia'||d.kind==='rad')
      ?mepDimSymbolParts(d,value,d.kind==='dia'?'Ø':'R')
      :mepDimTextParts(d,value);
    const main=p.sym?p.main+' '+p.sym:p.main;
    return p.up||p.lo?main+' '+p.up+' / '+p.lo:main;
  }
  function mepDimTolLineH(){
    const th=MEP_DIM_STYLE.textHeight||7;
    const sub=Math.max(2.8,th*0.68);
    return Math.max(1.8,sub*0.72+0.45);
  }
  function mepDimDrawText(mk,T,main,up,lo,x,y,anchor,transform,flip,sym){
    const attrs={x,y,'text-anchor':anchor};
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
    const sub=Math.max(2.8,th*0.68),gap=Math.max(1.2,th*0.22);
    const lh=mepDimTolLineH();
    const mw=Math.max(7,String(main).length*th*0.62);
    const sx=anchor==='middle'?x+mw/2+gap:(anchor==='end'?x+gap:x+mw+gap);
    const st=Object.assign({},T,{x:sx,'text-anchor':'start',
      style:'font-size:'+sub+'px;stroke-width:1'});
    if(transform)st.transform=transform;
    const tu=mk('text',Object.assign({},st,{y:flip?y+lh:y-lh}));
    tu.textContent=up||'';
    const tl=mk('text',Object.assign({},st,{y:y}));
    tl.textContent=lo||'';
    return t;
  }
  function mepDimHasStack(d){
    return !d.txt&&d.tol&&d.tol.m==='dbl';
  }
  function mepDimLabelHalf(d,value){
    const p=mepDimTextParts(d,value);
    const th=MEP_DIM_STYLE.textHeight||7;
    const main=d.ref?'('+p.main+')':p.main;
    const mainHalf=Math.max(7,String(main).length*th*0.62)/2;
    if(p.sym)return mainHalf+Math.max(1.2,th*0.14)+String(p.sym).length*th*0.85*0.54;
    if(!p.up&&!p.lo)return mainHalf;
    const sub=Math.max(2.8,th*0.68),gap=Math.max(1,th*0.15);
    const tolW=Math.max(String(p.up||'').length,String(p.lo||'').length)*sub*0.54;
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
  function mepHoleCallout(cx,cy,rr,px,py,txt){
    let ux=px-cx,uy=py-cy,ul=Math.hypot(ux,uy);
    if(ul<1e-6){ux=1;uy=0;ul=1;}
    ux/=ul;uy/=ul;
    const ang=Math.atan2(uy,ux);
    const ex=cx+rr*Math.cos(ang),ey=cy+rr*Math.sin(ang);
    const lines=String(txt||'').split('\n');
    const lh=8.2,n=lines.length,mid=py+2;
    const y0=mid-(n-1)*lh/2;
    const tx=px,anchor=ux<0?'end':'start';
    const tw=Math.max(6.5,...lines.map(s=>Math.max(6.5,s.length*3.8)));
    const u0=anchor==='end'?tx-tw:tx,u1=anchor==='end'?tx:tx+tw;
    const lineY=y0+(n-1)*lh+2.2;
    return{ex,ey,lines,lh,y0,tx,anchor,u0,u1,lineY};
  }
  function mepDrawDim(mk,d,sh){
    const w=mepDimWorld(sh,d);
    if(!w)return;
    const val=d.value!=null?d.value:mepDimMeasure(sh,d);
    let txt=mepDimText(d,val);
    const sel=mepSt.selDim===d.id;
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
    if(d.kind==='hole'){
      if(d.holeFid&&typeof doc!=='undefined'){
        const f=(doc.features||[]).find(x=>x.id===d.holeFid);
        if(f){d.holeText=mepHoleFeatureText(f);txt=d.txt||d.holeText;}
      }
      const e=mepEntByHint(w.v1,d.a.hint);
      let cx=w.a.x,cy=w.a.y,rr=0;
      if(e&&(e.t==='C'||e.t==='A')){
        const v=w.v1,cS=mepToSheet(v,e.cx,e.cy);
        rr=e.r*v.scale;cx=cS.x;cy=cS.y;
      }
      const g=mepHoleCallout(cx,cy,rr,w.b.x,w.b.y,txt);
      draw('line',Object.assign({x1:g.tx,y1:g.lineY,x2:g.ex,y2:g.ey,'marker-end':AR},L));
      const t=draw('text',Object.assign({x:g.tx,y:g.y0,'text-anchor':g.anchor},T));
      g.lines.forEach((s,k)=>{
        const ts=document.createElementNS(NS,'tspan');
        ts.setAttribute('x',String(g.tx));ts.setAttribute('y',String(g.y0+k*g.lh));
        ts.textContent=s;t.appendChild(ts);
      });
      draw('line',Object.assign({x1:g.u0,y1:g.lineY,x2:g.u1,y2:g.lineY},L));
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
      const tx=px,ty=py+2;
      const symW=pp.sym?(pp.sym.length+1)*(MEP_DIM_STYLE.textHeight||7)*0.85*0.54:0;
      const tw=Math.max(6.5,str.length*3.8+symW);
      const u0=ux<0?tx-tw:tx,u1=ux<0?tx:tx+tw;
      // leader du texte vers la circonférence, flèche sur l'arête
      draw('line',Object.assign({x1:tx,y1:ty+1.6,x2:ex,y2:ey,'marker-end':AR},L));
      if(d.kind==='dia'){
        // trait de diamètre : part du bord (côté texte) après un vide, traverse
        // le centre et flèche le bord opposé - il ne part plus du centre.
        const lg=Math.min(MEP_DIM_STYLE.leaderGap,rr*0.45);
        draw('line',Object.assign({x1:ex-ux*lg,y1:ey-uy*lg,
          x2:cx-rr*Math.cos(ang),y2:cy-rr*Math.sin(ang),'marker-end':ARS},L));
      }
      // trait sous la valeur R/Ø
      draw('line',Object.assign({x1:u0,y1:ty+1.6,x2:u1,y2:ty+1.6},L));
      mepDimDrawText(draw,T,str,pp.up,pp.lo,tx,ty,ux<0?'end':'start',null,false,pp.sym);
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
      draw('path',Object.assign({d:'M'+x1+','+y1+' A'+r+','+r+' 0 0 '+sweep+' '+x2+','+y2},L));
      const nSeg=Math.max(6,Math.ceil(Math.abs(dd)*r/3));
      for(let k=0;k<nSeg;k++){
        const t0=aa+dd*k/nSeg,t1=aa+dd*(k+1)/nSeg;
        hit.push({x1:O.x+r*Math.cos(t0),y1:O.y+r*Math.sin(t0),
          x2:O.x+r*Math.cos(t1),y2:O.y+r*Math.sin(t1)});
      }
      const mx=O.x+(r+7)*Math.cos(aa+dd/2),my=O.y+(r+7)*Math.sin(aa+dd/2);
      const pp=mepDimTextParts(d,val);
      mepDimDrawText(draw,T,pp.main,pp.up,pp.lo,mx,my+2,'middle',null,false,pp.sym);
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
    mepDimDrawText(draw,T,main,pp.up,pp.lo,mx,my,'middle',tr,flip,pp.sym);
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
  function mepSkRmEnt(sk,eid){
    const e=sk.ents.find(x=>x.id===eid);if(!e)return;
    sk.ents=sk.ents.filter(x=>x.id!==eid);
    const used=new Set();
    sk.ents.forEach(x=>{if(x.p1)used.add(x.p1);if(x.p2)used.add(x.p2);if(x.pc)used.add(x.pc);});
    Object.keys(sk.pts).forEach(pid=>{if(!used.has(pid))delete sk.pts[pid];});
    sk.cons=sk.cons.filter(c=>{
      if(c.ent===eid||c.a===eid||c.b===eid)return false;
      if(c.p&&!sk.pts[c.p])return false;
      if(c.a&&c.b&&!sk.pts[c.a]&&!sk.pts[c.b]&&!sk.ents.some(x=>x.id===c.a)&&!sk.ents.some(x=>x.id===c.b))return false;
      return true;
    });
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
          if(L&&C&&L.t==='line'&&C.t==='circle'){
            const a=pt(L.p1),b=pt(L.p2),cc=pt(C.pc);
            if(!a||!b||!cc)return[];
            const dx=b.x-a.x,dy=b.y-a.y,L2=Math.hypot(dx,dy)||1;
            return[Math.abs((cc.x-a.x)*dy-(cc.y-a.y)*dx)/L2-C.r];
          }
          if(C&&L&&C.t==='line'&&L.t==='circle'){
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
          const C=ent(c.a);if(!C||C.t!=='circle')return[];
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
          const p=pt(c.p),C=ent(c.ent);if(!p||!C||C.t!=='circle')return[];
          const cc=pt(C.pc);if(!cc)return[];
          return[Math.hypot(p.x-cc.x,p.y-cc.y)-C.r];
        }
        case 'midpoint':{
          const m=pt(c.p),a=pt(c.a),b=pt(c.b);if(!m||!a||!b)return[];
          return[m.x-(a.x+b.x)/2,m.y-(a.y+b.y)/2];
        }
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
  function mepVars(sk){
    // variables = points (x,y) + rayons des cercles/arcs
    const vars=[];
    Object.keys(sk.pts).forEach(pid=>{
      vars.push({get:()=>sk.pts[pid].x,set:v=>{sk.pts[pid].x=v;}});
      vars.push({get:()=>sk.pts[pid].y,set:v=>{sk.pts[pid].y=v;}});
    });
    sk.ents.forEach(e=>{
      if(e.t==='circle'||e.t==='arc')vars.push({get:()=>e.r,set:v=>{e.r=Math.max(0.01,v);}});
    });
    return vars;
  }
  function mepSkSolve(sk,iters){
    if(!sk||!sk.ents.length&&!sk.cons.length)return;
    _mepSkCur=sk;
    iters=iters||40;
    const vars=mepVars(sk);
    const n=vars.length;if(!n)return;
    for(let it=0;it<iters;it++){
      // collecte résidus actifs
      const rows=[];
      sk.cons.forEach(c=>{
        const r=mepSkResidual(sk,c);
        r.forEach(v=>{if(isFinite(v))rows.push({c,v});});
      });
      if(!rows.length)break;
      // jacobien numérique + GN step
      const m=rows.length;
      const J=new Float64Array(m*n);
      const R=new Float64Array(m);
      rows.forEach((row,i)=>{R[i]=row.v;});
      const eps=1e-4;
      for(let j=0;j<n;j++){
        const x0=vars[j].get();
        vars[j].set(x0+eps);
        sk.cons.forEach(()=>{}); // recalc ci-dessous
        let k=0;
        for(let ri=0;ri<sk.cons.length;ri++){
          const r=mepSkResidual(sk,sk.cons[ri]);
          for(let q=0;q<r.length;q++){
            if(k>=m)break;
            if(isFinite(r[q]))J[k*n+j]=(r[q]-R[k])/eps;
            k++;
          }
        }
        vars[j].set(x0);
      }
      // (JtJ + λI) δ = -JtR  — λ léger pour stabilité
      const A=[];
      for(let i=0;i<n;i++)A.push(new Float64Array(n+1));
      const lam=1e-3;
      for(let i=0;i<n;i++){
        for(let j=0;j<n;j++){
          let s=0;
          for(let k=0;k<m;k++)s+=J[k*n+i]*J[k*n+j];
          A[i][j]=s+(i===j?lam:0);
        }
        let s=0;
        for(let k=0;k<m;k++)s+=J[k*n+i]*R[k];
        A[i][n]=-s;
      }
      // élimination de Gauss
      let ok=true;
      for(let col=0;col<n;col++){
        let piv=col;
        for(let r2=col+1;r2<n;r2++)if(Math.abs(A[r2][col])>Math.abs(A[piv][col]))piv=r2;
        if(Math.abs(A[piv][col])<1e-12){ok=false;break;}
        if(piv!==col){const t=A[piv];A[piv]=A[col];A[col]=t;}
        for(let r2=col+1;r2<n;r2++){
          const f=A[r2][col]/A[col][col];
          if(!f)continue;
          for(let c2=col;c2<=n;c2++)A[r2][c2]-=f*A[col][c2];
        }
      }
      if(!ok)break;
      const dx=new Float64Array(n);
      for(let i=n-1;i>=0;i--){
        let s=A[i][n];
        for(let j=i+1;j<n;j++)s-=A[i][j]*dx[j];
        dx[i]=s/A[i][i];
      }
      let moved=0;
      for(let j=0;j<n;j++){vars[j].set(vars[j].get()+dx[j]);moved+=Math.abs(dx[j]);}
      if(moved<1e-6)break;
    }
    _mepSkCur=null;
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
  function mepSnapPt(sx,sy,sh){
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
  function mepHitViewEnt(sh,sx,sy){
    // → {vid,i,e,lx,ly} entité projetée la plus proche
    let best=null,bd=4/mepSt.zoom;
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
  function mepSkAddLine(sh,x1,y1,x2,y2){
    const sk=mepSkEnsure(sh);
    const a=mepSkPt(sk,x1,y1),b=mepSkPt(sk,x2,y2);
    mepSkEnt(sk,{t:'line',p1:a,p2:b});
  }
  function mepSkAddRect(sh,x1,y1,x2,y2){
    const sk=mepSkEnsure(sh);
    const a=mepSkPt(sk,x1,y1),b=mepSkPt(sk,x2,y1),c=mepSkPt(sk,x2,y2),d=mepSkPt(sk,x1,y2);
    const e1=mepSkEnt(sk,{t:'line',p1:a,p2:b});
    const e2=mepSkEnt(sk,{t:'line',p1:b,p2:c});
    const e3=mepSkEnt(sk,{t:'line',p1:c,p2:d});
    const e4=mepSkEnt(sk,{t:'line',p1:d,p2:a});
    mepSkCons(sk,{type:'horizontal',a,b});
    mepSkCons(sk,{type:'vertical',a,d});
    mepSkCons(sk,{type:'horizontal',c,d});
    mepSkCons(sk,{type:'vertical',b,c});
    mepSkSolve(sk,20);
  }
  function mepSkAddCircle(sh,cx,cy,r){
    const sk=mepSkEnsure(sh);
    const c=mepSkPt(sk,cx,cy);
    mepSkEnt(sk,{t:'circle',pc:c,r:Math.max(0.1,r)});
  }
  function mepSkAddArc(sh,cx,cy,r,a0,a1){
    const sk=mepSkEnsure(sh);
    const c=mepSkPt(sk,cx,cy);
    const p1=mepSkPt(sk,cx+r*Math.cos(a0),cy+r*Math.sin(a0));
    const p2=mepSkPt(sk,cx+r*Math.cos(a1),cy+r*Math.sin(a1));
    mepSkEnt(sk,{t:'arc',pc:c,p1,p2,r:Math.max(0.1,r),a0,a1});
  }
  function mepSkAddPt(sh,x,y){
    const sk=mepSkEnsure(sh);
    mepSkPt(sk,x,y);
  }
  /* ajuster (trim) : retire le tronçon entre 2 intersections */
  function mepSkTrim(sh,sx,sy){
    const sk=mepSkEnsure(sh);
    const hit=mepHitViewEnt(sh,sx,sy); // non : chercher dans l'esquisse
    // chercher segment d'esquisse
    let best=null,bd=4/mepSt.zoom;
    sk.ents.forEach(e=>{
      if(e.t!=='line')return;
      const A=sk.pts[e.p1],B=sk.pts[e.p2];if(!A||!B)return;
      const dx=B.x-A.x,dy=B.y-A.y,L2=dx*dx+dy*dy;
      if(L2<1e-12)return;
      const t=Math.max(0,Math.min(1,((sx-A.x)*dx+(sy-A.y)*dy)/L2));
      const px=A.x+dx*t,py=A.y+dy*t;
      const d=Math.hypot(sx-px,sy-py);
      if(d<bd){bd=d;best={e,t,A,B};}
    });
    if(!best)return false;
    const{e,t,A,B}=best;
    // intersections avec les autres entités
    const xs=[];
    sk.ents.forEach(o=>{
      if(o===e)return;
      if(o.t==='line'){
        const C=sk.pts[o.p1],D=sk.pts[o.p2];if(!C||!D)return;
        const ip=(typeof interLineLine==='function')?interLineLine(A,B,C,D):null;
        if(ip&&ip.t>0.001&&ip.t<0.999)xs.push(ip.t);
      }else if(o.t==='circle'){
        const cc=sk.pts[o.pc];if(!cc)return;
        const pts=(typeof interLineCircle==='function')?interLineCircle(A,B,cc,o.r):[];
        pts.forEach(p=>{if(p.t>0.001&&p.t<0.999)xs.push(p.t);});
      }
    });
    xs.sort((a,b)=>a-b);
    if(xs.length<2){mepStatus('Ajuster : aucune intersection de part et d’autre du tronçon.');return false;}
    // tronçon cliqué = entre les 2 intersections bornant t
    let lo=-0.01,hi=1.01;
    xs.forEach(v=>{if(v<t)lo=Math.max(lo,v);else hi=Math.min(hi,v);});
    if(hi-lo<1e-4)return false;
    // remplace la ligne par 2 sous-lignes
    const mk=(t0,t1)=>{
      if(t1-t0<1e-4)return;
      const x1=A.x+(B.x-A.x)*t0,y1=A.y+(B.y-A.y)*t0;
      const x2=A.x+(B.x-A.x)*t1,y2=A.y+(B.y-A.y)*t1;
      const pa=mepSkPt(sk,x1,y1),pb=mepSkPt(sk,x2,y2);
      mepSkEnt(sk,{t:'line',p1:pa,p2:pb});
    };
    mk(0,lo);mk(hi,1);
    mepSkRmEnt(sk,e.id);
    return true;
  }
  /* ═══════════════ S. rendu esquisse + brouillons ═══════════════ */
  function mepDrawSk(mk,sh){
    const sk=sh.sk;if(!sk)return;
    const drawEnt=(e,col,w)=>{
      const cls='mepEnt '+(col||'mepSharp');
      const st=col==='mepSkFree'?COL.skFree:COL.skFull;
      const attr={class:cls,stroke:st,'stroke-width':w||0.9};
      if(e.t==='line'){
        const A=sk.pts[e.p1],B=sk.pts[e.p2];if(!A||!B)return;
        mk('line',Object.assign({x1:A.x,y1:A.y,x2:B.x,y2:B.y},attr));
      }else if(e.t==='circle'){
        const C=sk.pts[e.pc];if(!C)return;
        mk('circle',Object.assign({cx:C.x,cy:C.y,r:e.r},attr));
      }else if(e.t==='arc'){
        const C=sk.pts[e.pc],P1=sk.pts[e.p1],P2=sk.pts[e.p2];
        if(!C||!P1||!P2)return;
        const a0=Math.atan2(P1.y-C.y,P1.x-C.x),a1=Math.atan2(P2.y-C.y,P2.x-C.x);
        let da=a1-a0;
        while(da<=0)da+=2*Math.PI;
        const large=da>Math.PI?1:0;
        const x1=C.x+e.r*Math.cos(a0),y1=C.y+e.r*Math.sin(a0);
        const x2=C.x+e.r*Math.cos(a1),y2=C.y+e.r*Math.sin(a1);
        mk('path',Object.assign({d:'M'+x1+','+y1+' A'+e.r+','+e.r+' 0 '+large+' 1 '+x2+','+y2,fill:'none'},attr));
      }
    };
    sk.ents.forEach(e=>drawEnt(e,'mepSkFull',1));
    // points
    Object.keys(sk.pts).forEach(pid=>{
      const p=sk.pts[pid];
      const sel=mepSt.skSel&&mepSt.skSel.has(pid);
      mk('circle',{cx:p.x,cy:p.y,r:sel?2.2:1.4,class:'mepSkPt',stroke:sel?COL.sel:'#64d2ff',fill:'#fff'});
    });
  }
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
    const dashed={class:'mepDraft'};
    if(P.kind==='viewDrag'){
      // rien de spécial (la vue suit déjà)
    }else if(P.kind==='line'||P.kind==='rect'){
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
    if(next!=='select'&&next!==mepSt.tool){mepSt.sel=null;mepSt.selDim=null;mepSt.selAxis=null;}
    mepSt.tool=next;
    if(next==='select')mepSt.entSel=[];
    mepSt.pick=null;mepSt.dim=null;mepSt.cutPts=[];mepSt.detC=null;mepSt.hovEnt=null;mepSt.skSel=new Set();
    mepSt.axisPick=[];mepSt.axisFree=null;
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
    return 'Axe de trou : cliquez un trou.';
  }
  function mepSetAxisMode(m){
    mepSt.axisMode=m||'hole';
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
  function mepAxisClick(sh,P){
    const mode=mepSt.axisMode||'hole';
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
  function mepDimDragStart(sh,P,dim){
    mepSt.selDim=dim.id;mepSt.sel=null;mepSt.entSel=[];
    const w=mepDimWorld(sh,dim);
    const tp=mepDimTextPos(sh,dim);
    const labelHit=!!tp&&Math.hypot(P.x-tp.x,P.y-tp.y)<=18/(mepSt.zoom||1);
    mepSt.pick={kind:'dimDrag',id:dim.id,sx:P.x,sy:P.y,px0:P.px,py0:P.py,
      cx:w?w.b.x:null,cy:w?w.b.y:null,off0:dim.off,labelHit,moved:false,undoPushed:false};
    mepSideShow();mepRender();
  }
  function mepOnDown(ev){
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
    const tool=mepSt.tool;
    if(tool==='select'){
      // cote ? → sélection + glisser pour la déplacer
      const dim=mepDimAt(sh,P.x,P.y);
      if(dim){mepDimDragStart(sh,P,dim);return;}
      const axis=mepAxisAt(sh,P.x,P.y);
      if(axis){
        mepSt.selAxis={vid:axis.vid,id:axis.id};mepSt.sel=null;mepSt.selDim=null;mepSt.entSel=[];
        mepSideShow();mepRender();return;
      }
      const v=mepViewAt(sh,P.x,P.y);
      if(v){
        mepSt.sel=v.id;mepSt.selDim=null;mepSt.selAxis=null;
        mepSt.pick={kind:'viewDrag',vid:v.id,ox:P.x-v.x,oy:P.y-v.y,moved:false,undoPushed:false,
          px0:P.px,py0:P.py,add:ev.ctrlKey||ev.metaKey||ev.shiftKey};
        mepSideShow();mepRender();
      }else{
        mepSt.sel=null;mepSt.selDim=null;mepSt.selAxis=null;mepSt.entSel=[];mepSideShow();mepRender();
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
        const dim=mepDimAt(sh,P.x,P.y);
        if(dim){mepDimDragStart(sh,P,dim);return;}
      }
      // distance point→point en cours : on garde le flux 2 points + placement
      if(mepSt.dim&&mepSt.dim.kind==='dist'&&!mepSt.dim.b){
        mepDimClick(sh,P,ev.ctrlKey||ev.metaKey,ev.shiftKey,ev.altKey);return;
      }
      if(mepSt.dim&&mepSt.dim.kind==='dist'&&mepSt.dim._pp){
        mepDimClick(sh,P,ev.ctrlKey||ev.metaKey,ev.shiftKey,ev.altKey);return;
      }
      const hit=mepHitViewEnt(sh,P.x,P.y);
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
    /* outils de dessin 2D */
    const snap=mepSnapPt(P.x,P.y,sh);
    const pt={x:snap.x,y:snap.y,snap:snap.hit};
    if(tool==='line'||tool==='rect'||tool==='circle'||tool==='arc'){
      if(!mepSt.pick||!mepSt.pick.start){
        mepSt.pick={kind:tool,start:pt,cur:pt,pts:[pt]};
      }else{
        // 2ᵉ (ou 3ᵉ) clic
        const P0=mepSt.pick;
        mepEdit('dessin '+tool,()=>{
          if(tool==='line')mepSkAddLine(sh,P0.start.x,P0.start.y,pt.x,pt.y);
          else if(tool==='rect')mepSkAddRect(sh,P0.start.x,P0.start.y,pt.x,pt.y);
          else if(tool==='circle'){
            const r=Math.hypot(pt.x-P0.start.x,pt.y-P0.start.y);
            mepSkAddCircle(sh,P0.start.x,P0.start.y,r);
          }else if(tool==='arc'){
            // arc 3 points : centre + départ + arrivée
            P0.pts.push(pt);
            if(P0.pts.length>=3){
              const[C,A,B]=P0.pts;
              const r=Math.hypot(A.x-C.x,A.y-C.y);
              mepSkAddArc(sh,C.x,C.y,r,Math.atan2(A.y-C.y,A.x-C.x),Math.atan2(B.y-C.y,B.x-C.x));
            }else return; // attend le 3ᵉ
          }
        });
        mepSt.pick=null; // on reste dans l'outil pour enchaîner
        mepStatus('Dessin OK — un nouveau clic redémarre.');
      }
      return;
    }
    if(tool==='point'){
      mepEdit('point',()=>mepSkAddPt(sh,pt.x,pt.y));
      return;
    }
    if(tool==='trim'){
      mepEdit('ajuster',()=>{mepSkTrim(sh,P.x,P.y);});
      return;
    }
  }
  function mepOnMove(ev){
    const P=mepPt(ev);
    const sh=mepSheet();
    const pk=mepSt.pick;
    if(pk){
      if(pk.kind==='pan'){
        mepSt.pan.x=pk.px-(ev.clientX-pk.sx)*mepPxToMm();
        mepSt.pan.y=pk.py-(ev.clientY-pk.sy)*mepPxToMm();
        mepRender();
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
        const snap=mepSnapPt(P.x,P.y,sh);
        pk.cur={x:snap.x,y:snap.y,snap:snap.hit};
        mepRender();
        return;
      }
    }
    if(mepSt.tool==='dim'||mepSt.tool==='hole'){
      // survol des arêtes/cercis : feedback avant les 2 clics de sélection
      const hit=mepHitViewEnt(sh,P.x,P.y);
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
    // survol vue (feedback)
    const v=mepViewAt(sh,P.x,P.y);
    const id=v?v.id:null;
    if(id!==mepSt.hovView){mepSt.hovView=id;try{mepRender();}catch(e){}}
  }
  function mepOnUp(ev){
    const pk=mepSt.pick;
    if(!pk)return;
    if(pk.kind==='dimDrag'){
      if(pk.moved)mepEdit('déplacement cote',()=>{},true);
      mepSt.pick=null;
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
  function mepOnDbl(ev){
    const P=mepPt(ev);
    const sh=mepSheet();
    // double-clic sur une flèche → inversion des deux flèches
    const da=mepDimArrowAt(sh,P.x,P.y);
    if(da){mepDimToggleArrows(da);return;}
    // double-clic sur une cote linéaire → inversion des flèches.
    // Alt+double-clic conserve l'édition du texte personnalisé.
    const d=mepDimAt(sh,P.x,P.y);
    if(d){
      if((d.kind==='len'||d.kind==='dist')&&!ev.altKey){
        mepDimToggleArrows(d);return;
      }
      const t=prompt('Texte de cote (vide = calculé) :',d.txt||'');
      if(t!==null){mepEdit('texte cote',()=>{d.txt=t||undefined;});}
      return;
    }
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
    if(k==='Escape'){
      if(mepSt.pick||mepSt.tool!=='select'||mepSt.dim||mepSt.cutPts.length||mepSt.detC
        ||mepSt.selAxis||(mepSt.axisPick&&mepSt.axisPick.length)||mepSt.axisFree){
        const pk0=mepSt.pick;
        if(pk0&&pk0.moved){
          if(pk0.kind==='viewDrag')mepEdit('déplacement vue',()=>{},true);
          else if(pk0.kind==='dimDrag')mepEdit('déplacement cote',()=>{},true);
        }
        mepSt.pick=null;mepSt.dim=null;mepSt.cutPts=[];mepSt.detC=null;
        mepSt.selAxis=null;mepSt.axisPick=[];mepSt.axisFree=null;
        mepSetTool('select');
        mepRender();
        ev.preventDefault();ev.stopPropagation();
      }
      return;
    }
    if(k==='Enter'&&mepSt.tool==='axis'){
      if(mepSt.axisMode==='align'||mepSt.axisMode==='pitch')mepAxisCommitPattern();
      ev.preventDefault();ev.stopPropagation();
      return;
    }
    if(k==='Delete'||k==='Backspace'){
      const sh=mepSheet();
      if(mepSt.selDim){
        mepEdit('suppression cote',()=>{sh.dims=sh.dims.filter(d=>d.id!==mepSt.selDim);mepSt.selDim=null;});
        mepSideShow();
        ev.preventDefault();ev.stopPropagation();
        return;
      }
      if(mepSt.selAxis){
        const sel=mepSt.selAxis,v=mepView(sh,sel.vid);
        mepEdit('suppression axe',()=>{
          if(v)v.axes=(v.axes||[]).filter(a=>a.id!==sel.id);
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
      // esquisse
      if(mepSt.tool==='select'&&sh.sk&&mepSt.skSel.size){
        mepEdit('suppression esquisse',()=>{
          Array.from(mepSt.skSel).forEach(eid=>mepSkRmEnt(sh.sk,eid));
          mepSt.skSel=new Set();
        });
        ev.preventDefault();ev.stopPropagation();
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
    return{O:mepToSheet(w.v1,ox,oy),a1,a2,w};
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
    if(d.kind==='dia'||d.kind==='rad'||d.kind==='hole')return{x:w.b.x,y:w.b.y};
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
    const g=mepGeoOf(v);const e=g.els[s.i];
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
    if(d.kind==='dia'||d.kind==='rad'||d.kind==='hole'){
      d.b={x:(sx-v.x)/v.scale,y:(sy-v.y)/v.scale};
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
      const hit=mepHitViewEnt(sh,P.x,P.y);
      if(hit&&mepDimSelectEnt(hit,alt))return;
      // sinon : point libre (distance)
      const snap=mepSnapPt(P.x,P.y,sh);
      const v=mepViewAt(sh,snap.x,snap.y);
      const lx=v?(snap.x-v.x)/v.scale:0,ly=v?(snap.y-v.y)/v.scale:0;
      if(!v){mepStatus('Cote : cliquez une arête ou un cercle projeté.');return;}
      mepSt.dim={kind:'dist',a:{x:lx,y:ly},vid:v.id,off:8,__ghost:true};
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
      D.b={x:lx,y:ly};
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
        const hit=mepHitViewEnt(sh2,P.x,P.y);
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
        const g=mepGeoOf(v);
        const e=g.els[D.a.hint?D.a.hint.i:null];
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
    if(v)mepSideView(mepSideEl,v,sh);
    else if(a)mepSideAxis(mepSideEl,av,a,sh);
    else if(d)mepSideDim(mepSideEl,d,sh);
    else mepSideHome(mepSideEl,sh);
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
    const bFmt=mkBtn(sh.format+' ⌄',mepCycleFormat,'Format de la planche (A0…A4)');
    bFmt.style.flex='1';
    const bOri=mkBtn(sh.orient==='landscape'?'⇄':'↕',mepCycleOrient,'Portrait / paysage');
    bOri.style.flex='1';
    /* — cartouche (projet / auteur / date) — */
    const tt=sh.title||(sh.title={});
    const tit=(lab,key,ph)=>{
      const i=document.createElement('input');
      i.value=tt[key]!==undefined?tt[key]:'';i.placeholder=ph||'';
      i.onchange=()=>{mepEdit('cartouche',()=>{tt[key]=i.value;});};
      r=rowEl();
      const L=document.createElement('label');L.textContent=lab;
      r.appendChild(L);r.appendChild(i);
    };
    tit('Projet','projet','Nom du projet');
    tit('Auteur','auteur','—');
    tit('Date','date',new Date().toLocaleDateString('fr-FR'));
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
    [['✂','trim','Ajuster (trim)'],['📏','dim','Cote (outil unique)'],['Perçage','hole','Cotation perçage (Ø, lamage, fraisure, taraudage)'],['Axes','axis','Traits d’axe (trou, alignement, cercle, libre)']].forEach(([lab,t,tip])=>{
      const b=mkBtn(lab,()=>mepSetTool(t),tip);
      b.className=mepSt.tool===t?'active':'';
      b.style.flex='1';
    });
    h('Axes');
    r=rowEl();
    [['Trou','hole'],['Alignement','align'],['Cercle','pitch'],['Libre','free']].forEach(([lab,m])=>{
      const b=document.createElement('button');
      b.textContent=lab;
      b.className=(mepSt.tool==='axis'&&mepSt.axisMode===m)?'active':'';
      b.onclick=e=>{e.stopPropagation();mepSetAxisMode(m);};
      b.style.flex='1';
      r.appendChild(b);
    });
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
    dimNum('Hauteur du texte','textHeight',2,30,0.5,'mm');
    const dimCol=document.createElement('input');
    dimCol.type='color';dimCol.value=MEP_DIM_STYLE.color;
    const onCol=()=>{
      MEP_DIM_STYLE.color=dimCol.value;
      mepDimStyleSave();mepApplyDimStyle();mepRender();
    };
    dimCol.oninput=onCol;dimCol.onchange=onCol;
    dimRow('Couleur',dimCol);
    dimNum('Angle des flèches','arrowAngle',10,90,1,'°');
    dimNum('Longueur des flèches','arrowLen',2,30,0.5,'mm');
    r=rowEl();
    const bDimReset=mkBtn('Réinitialiser',()=>{
      mepDimStyleReset();mepSideShow();mepRender();
      mepStatus('Style de cotation réinitialisé.');
    },'Rétablir la hauteur, la couleur et les flèches par défaut');
    bDimReset.style.flex='1';
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
    const note=document.createElement('div');
    note.className='note';
    note.textContent=sh.views.length+' vue(s) · '+sh.dims.length+' cote(s) · outil actif : '+
      ({select:'sélection',line:'ligne',rect:'rectangle',circle:'cercle',arc:'arc',point:'point',trim:'ajuster',dim:'cote',hole:'cotation perçage',axis:'axes ('+(mepSt.axisMode||'hole')+')'}[mepSt.tool]||mepSt.tool);
    root.appendChild(note);
  }
  function mepSideView(root,v,sh){
    const h=document.createElement('h4');
    h.textContent=v.kind==='section'?'Coupe '+(v.label||''):(v.kind==='detail'?'Détail '+(v.label||''):
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
    // échelle
    const sel=document.createElement('select');
    MEP_SCALES.forEach(([s,lab])=>{
      const o=document.createElement('option');
      o.value=s;o.textContent=lab;
      if(Math.abs(s-v.scale)<1e-6)o.selected=true;
      sel.appendChild(o);
    });
    sel.onchange=()=>{mepEdit('échelle',()=>{v.scale=+sel.value;});};
    row('Échelle',sel);
    // corps
    const body=document.createElement('select');
    const o0=document.createElement('option');o0.value='';o0.textContent='Assemblée';
    body.appendChild(o0);
    try{
      (doc.bodies||[]).forEach(b=>{
        const o=document.createElement('option');
        o.value=b.id;o.textContent=b.name||b.id;
        if(v.bodyId===b.id)o.selected=true;
        body.appendChild(o);
      });
    }catch(e){}
    body.onchange=()=>{mepEdit('corps',()=>{v.bodyId=body.value||null;});};
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
        if(on){v.render3d=false;if(chk3d)chk3d.checked=false;}
      });
      chk3d=mkChk('Rendu 3D (image)','render3d','mepChkRender3d',on=>{
        if(on){v.shade=false;if(chkShade)chkShade.checked=false;}
      });
      chk3d.title='Rendu de la vue depuis la 3D (couleurs et transparence des corps)';
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
    // projections 1er angle (depuis une vue quelconque sauf coupe/détail)
    if(v.kind==='base'||v.kind==='aux'||v.kind==='proj'){
      const pr=document.createElement('div');pr.className='row';
      [['Dessus','top'],['Dessous','bottom'],['Gauche','left'],['Droit','right']].forEach(([lab,k])=>{
        const b=document.createElement('button');
        b.textContent=lab;b.title='Vue projetée (1er angle) : '+MEP_PROJ[k].lab;
        b.style.flex='1';
        b.onclick=()=>{mepAddProjected(v,k);};
        pr.appendChild(b);
      });
      row('Projection',pr);
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
  function mepSideAxis(root,v,a,sh){
    const h=document.createElement('h4');
    h.textContent={hole:'Axe de trou',align:'Axe commun',pitch:'Cercle de perçage',free:'Axe libre'}[a.kind]||'Axe';
    root.appendChild(h);
    const note=document.createElement('div');
    note.className='note';
    const n=a.kind==='hole'?1:(a.refs||[]).length;
    note.textContent=(a.kind==='free'?'Tracé libre':n+' trou(s)')+' · norme ISO 128-2 (04.1)';
    root.appendChild(note);
    const act=document.createElement('div');act.className='row';
    const bDel=document.createElement('button');bDel.textContent='Supprimer';bDel.className='danger';
    bDel.onclick=()=>{
      mepEdit('suppression axe',()=>{
        v.axes=(v.axes||[]).filter(x=>x.id!==a.id);
        mepSt.selAxis=null;
      });
      mepSideShow();
    };
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
  function mepSideDim(root,d,sh){
    const h=document.createElement('h4');
    h.textContent={len:'Longueur',dist:'Distance',rad:'Rayon',dia:'Diamètre',ang:'Angle',hole:'Cotation perçage'}[d.kind]||'Cote';
    root.appendChild(h);
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
    if(d.kind!=='hole'){
    // mode tolérance
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
  function mepExportSvg(){
    try{
      const sh=mepSheet();
      const pg=mepPage();
      const clone=mepSvgEl.cloneNode(true);
      clone.removeAttribute('id'); // ne pas laisser la règle UI #mepSvg{css} écraser les mm
      clone.setAttribute('xmlns',NS);
      clone.setAttribute('viewBox','0 0 '+pg.W+' '+pg.H);
      clone.setAttribute('width',pg.W+'mm');
      clone.setAttribute('height',pg.H+'mm');
      // strip UI helpers
      clone.querySelectorAll('#mepGHlp,.mepDraft').forEach(n=>n.parentNode&&n.parentNode.removeChild(n));
      // les éléments ne portent que des classes : embarquer la feuille de style PLAN
      const st=document.createElementNS(NS,'style');
      st.textContent=css.textContent;
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
  function mepPrint(){
    try{
      const sh=mepSheet();
      const pg=mepPage();
      const clone=mepSvgEl.cloneNode(true);
      clone.removeAttribute('id'); // idem export : la règle #mepSvg ne doit pas s'appliquer
      clone.setAttribute('xmlns',NS);
      clone.setAttribute('viewBox','0 0 '+pg.W+' '+pg.H);
      clone.style.width='100%';clone.style.height='100%';
      clone.querySelectorAll('#mepGHlp,.mepDraft').forEach(n=>n.parentNode&&n.parentNode.removeChild(n));
      const w=window.open('','_blank');
      if(!w){mepStatus('Popup bloquée — autorisez les popups pour imprimer.');return;}
      w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>'+sh.name+'</title>'+
        '<style>@page{size:'+(sh.orient==='landscape'?'landscape':'portrait')+' margin:8mm}'+
        'html,body{margin:0;padding:0;height:100%}svg{width:100%;height:100%}'+
        css.textContent+'</style></head><body>'+
        new XMLSerializer().serializeToString(clone)+'</body></html>');
      w.document.close();
      setTimeout(()=>{try{w.focus();w.print();}catch(e){}},250);
      mepStatus('Impression ouverte.');
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
      mepBuildUI();
      mepSt.open=true;
      mepWrapEl.classList.add('open');
      mepTabsRender();
      mepSideShow();
      mepFitSheet();
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
  window.mepInit=mepInit;
  window.mepReset=mepReset;
  window.mepIsOpen=()=>mepSt.open;
  window.mepAddSheet=mepAddSheetCmd;
  window.mepExport=mepExportSvg;
  window.mepPrint=mepPrint;
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
  // points d'entrée réservés aux tests automatisés (jamais activés dans l'app)
  if(window.__MEP_TEST_HOOKS__){
    window.__mepTest={
      fitCircle:mepFitCircle,
      axisFitCircle:mepAxisFitCircle,
      axisPitchGroups:(holes,view)=>mepAxisPitchGroups(holes,view||{scale:1}),
      axisLineGroups:(holes,view)=>mepAxisLineGroups(holes,view||{scale:1}),
      axisAuto:view=>mepAxisAutoGeom(mepSheet(),view),
      axisManual:(view,ann)=>mepAxisManualGeom(mepSheet(),view,ann),
      axisAt:(x,y)=>mepAxisAt(mepSheet(),x,y),
      axisMode:()=>mepSt.axisMode,
      axisPick:()=>Array.isArray(mepSt.axisPick)?mepSt.axisPick.slice():[],
      setAxisMode:m=>{mepSetAxisMode(m);},
      holeText:mepHoleFeatureText,
      holeCallout:mepHoleCallout,
      fmt:mepFmtNum,
      geo:view=>mepGeoOf(view),
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
        mepOnDown({button:0,clientX:(x-vb.x)/vb.width*800,
          clientY:(y-vb.y)/vb.height*600,altKey:false,pointerId:1,preventDefault(){}});
      },
      dimTextParts:(d,v)=>mepDimTextParts(d,v),
      dimSymbolParts:(d,v,s)=>mepDimSymbolParts(d,v,s||'Ø'),
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
      dimStyle:()=>({textHeight:MEP_DIM_STYLE.textHeight,color:MEP_DIM_STYLE.color,
        arrowAngle:MEP_DIM_STYLE.arrowAngle,arrowLen:MEP_DIM_STYLE.arrowLen}),
      setDimStyle:o=>{
        if(o&&typeof o==='object'){
          [['textHeight',2,30],['arrowAngle',10,90],['arrowLen',2,30]].forEach(([k,min,max])=>{
            const v=+o[k];
            if(Number.isFinite(v))MEP_DIM_STYLE[k]=Math.min(max,Math.max(min,v));
          });
          if(typeof o.color==='string'&&/^#[0-9a-f]{6}$/i.test(o.color))MEP_DIM_STYLE.color=o.color;
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
  window.mepBeginAuxCmd=()=>{mepSetActive(true);mepBeginAux();};
  window.mepProjectView=(which,parent)=>{mepSetActive(true);return mepAddProjected(parent||mepView(mepSheet(),mepSt.sel),which);};
  window.mepBeginSectionCmd=()=>{mepSetActive(true);mepBeginSection();};
  window.mepBeginDetailCmd=()=>{mepSetActive(true);mepBeginDetail();};
  // auto-init une fois le DOM prêt
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{try{mepInit();}catch(e){}});
  else try{mepInit();}catch(e){}
})();
