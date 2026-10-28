// Espace PLAN — suite de la fonction englobante ouverte dans 98-mep-00-modele.js (état privé partagé, fermée dans 98-mep-95-export-init.js) : construction UI, paramètres PLAN, édition de la ligne de coupe.
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
    try{mepDrawSnapHov(mk);}catch(e){}
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
    if(g.hatchG&&g.hatchG.length>1&&mepHatchCfg().parts)g.hatchG.forEach(G=>mepDrawHatch(mk,G.loops,v,mepHatchVar(G.k))); // V0.8.2 : par pièce
    else if(g.hatch&&g.hatch.length)mepDrawHatch(mk,g.hatch,v);
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
    return{pat,ang,sc,col,parts:h.parts!==false};
  }
  function mepHatchVar(k,cfg){
    // V0.8.2 : variante de la k-ième pièce d'une coupe — angle alterné (45° / 135°), puis pas
    // élargi, puis resserré : deux pièces voisines ne se confondent pas
    const H=Object.assign({},cfg||mepHatchCfg());
    H.ang=((H.ang+(k%2?90:0))%180+180)%180;
    H.sc=H.sc*[1,1,1.6,1.6,0.65,0.65][k%6];
    return H;
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
    // V0.8.2 : une hachure par pièce dans les coupes d'assemblage (et de pièces multicorps)
    const pL=document.createElement('label');pL.style.cssText='display:flex;align-items:center;gap:6px;margin:6px 0 0';
    const pB=document.createElement('input');pB.type='checkbox';pB.id='mepHatchParts';pB.checked=w.parts!==false;
    pB.onchange=()=>{w.parts=pB.checked;};pL.appendChild(pB);pL.appendChild(document.createTextNode(' Une hachure par pièce (angle alterné)'));box.appendChild(pL);
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
    mepEdit('hachures',()=>{doc.mep.hatch={pat:cfg.pat,ang:cfg.ang,sc:cfg.sc,col:cfg.col||''};if(cfg.parts===false)doc.mep.hatch.parts=false;});
    const H=mepHatchCfg(),P=MEP_HATCH_PATS.find(p=>p[0]===H.pat);
    mepStatus('Hachures : '+(P?P[1]:H.pat)+(H.pat==='plein'?'':' · '+H.ang+'° · échelle '+H.sc)+' — toutes les coupes.');
    mepRender();
  }
