// Espace PLAN — suite de la fonction englobante ouverte dans 98-mep-00-modele.js (état privé partagé, fermée dans 98-mep-95-export-init.js) : planches, état UI, palettes, cartouche, cotation auto des perçages et nomenclature.
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
    // V0.8.2 : accroche sur la surface VISIBLE de la pièce (asmBalloonVisible ; repli : centre de
    // sa boîte), bulles rangées sur un cadre autour de la vue, dans l'ordre du tour, écartées
    // d'au moins un diamètre et demi — plus de bulles empilées ni de traits qui se croisent
    const v=(sh.views||[]).find(x=>x.asm);if(!v)return 0;
    const rows=mepBomRows(sh);
    sh.balloons=[];
    const L=[];
    rows.forEach(r=>{
      let C=[];try{C=asmBalloonCands(r.ids[0],v,7);}catch(e){C=[];}
      if(!C.length){const p=asmBalloonAnchor(r.ids[0]);if(!p)return;C=[{p,d:0}];}
      L.push({r,C});
    });
    mepBalloonLayout(v,L).forEach(q=>{
      sh.balloons.push({id:'bl'+(sh.balloons.length+1),view:v.id,comp:q.r.ids[0],p:q.p,dx:+(q.B.x-q.A.x).toFixed(2),dy:+(q.B.y-q.A.y).toFixed(2)});
    });
    return sh.balloons.length;
  }
  function mepBalloonLayout(v,L){
    // Position des bulles sur un cadre à 9 mm de la boîte de la vue : direction centre → accroche,
    // puis tri le long du cadre et écart minimal (périmètre parcouru dans le sens horaire)
    let bb=mepViewSheetBBox(v)||{x:v.x-20,y:v.y-20,w:40,h:40},TT=null;
    try{const T=mepViewTitleGeo(v);if(T){TT={x0:T.x-T.w/2-1.5,x1:T.x+T.w/2+1.5,below:T.y>bb.y+bb.h/2}; // le titre de la vue (« Face », « COUPE A-A ») fait partie du cadre à éviter
      const tx0=Math.min(bb.x,T.x-T.w/2),ty0=Math.min(bb.y,T.y-T.h),tx1=Math.max(bb.x+bb.w,T.x+T.w/2),ty1=Math.max(bb.y+bb.h,T.y+0.8);
      bb={x:tx0,y:ty0,w:tx1-tx0,h:ty1-ty0};}}catch(e){}
    const G=9,x0=bb.x-G,y0=bb.y-G,W=bb.w+2*G,H=bb.h+2*G,P=2*(W+H);
    const C={x:bb.x+bb.w/2,y:bb.y+bb.h/2};
    const toS=(x,y)=>{ // point du cadre → abscisse le long du cadre
      if(Math.abs(y-y0)<1e-6)return x-x0;if(Math.abs(x-(x0+W))<1e-6)return W+(y-y0);
      if(Math.abs(y-(y0+H))<1e-6)return W+H+(x0+W-x);return 2*W+H+(y0+H-y);};
    const fromS=s=>{s=((s%P)+P)%P;if(s<W)return{x:x0+s,y:y0};s-=W;if(s<H)return{x:x0+W,y:y0+s};s-=H;if(s<W)return{x:x0+W-s,y:y0+H};s-=W;return{x:x0,y:y0+H-s};};
    L.forEach(q=>{
      // accroche (point visible de la pièce) et côté du cadre choisis ENSEMBLE : le trait le plus
      // court qui ne passe au-dessus d'aucune autre pièce (rayons le long du trait), puis le plus
      // proche du centre de la pièce ; le côté du titre est écarté quand le trait le traverserait
      const cid=q.r.ids[0];let best=null;
      (q.C||[]).forEach(K=>{
        const l=mepLocal(v,K.p),A=mepToSheet(v,l[0],l[1]);
        [[A.x,y0,A.y-y0,'t'],[x0+W,A.y,x0+W-A.x,'r'],[A.x,y0+H,y0+H-A.y,'b'],[x0,A.y,A.x-x0,'l']].forEach(c=>{
          if(TT&&c[3]===(TT.below?'b':'t')&&A.x>=TT.x0&&A.x<=TT.x1)return;
          const sc=c[2]+0.25*(K.d||0)*v.scale;
          if(best&&best.free&&sc>=best.sc)return;
          let free=true;
          for(let k=1;k<=8&&free;k++){const f=k/8,Q=mepFromSheet(v,A.x+(c[0]-A.x)*f,A.y+(c[1]-A.y)*f);
            let h=null;try{h=asmPlanHit(v.dir,v.u,v.v,Q.x,Q.y);}catch(e){}
            if(h&&h.comp!==cid)free=false;}
          if(!best||(free&&!best.free)||(free===best.free&&sc<best.sc))best={sc,free,A,p:K.p,c};
        });
      });
      if(!best){q.A={x:C.x,y:C.y};q.s=0;return;}
      q.A=best.A;q.p=best.p;
      q.s=toS(Math.min(x0+W,Math.max(x0,best.c[0])),Math.min(y0+H,Math.max(y0,best.c[1])));
    });
    L.sort((a,b)=>a.s-b.s);
    const gap=11; // 1,5 diamètre de bulle
    for(let k=1;k<L.length;k++)if(L[k].s<L[k-1].s+gap)L[k].s=L[k-1].s+gap;
    if(L.length*gap<=P&&L.length>1&&L[L.length-1].s>L[0].s+P-gap){ // le tour se referme : recentre
      const over=L[L.length-1].s-(L[0].s+P-gap);L.forEach(q=>{q.s-=over/2;});}
    L.forEach(q=>{q.B=fromS(q.s);});
    return L;
  }
  function mepBalloonAt(sh,x,y){
    // bulle dont le cercle contient le point (la dernière dessinée d'abord)
    const B=Array.isArray(sh.balloons)?sh.balloons:[];
    for(let k=B.length-1;k>=0;k--){const b=B[k],v=mepView(sh,b.view);if(!v)continue;
      const l=mepLocal(v,b.p),A=mepToSheet(v,l[0],l[1]);
      if(Math.hypot(x-(A.x+(+b.dx||0)),y-(A.y+(+b.dy||0)))<=4.4)return b;}
    return null;
  }
  function mepBalloonAddAt(sh,x,y){
    // V0.8.2 : outil « ＋ Bulle » — la pièce sous le clic (vue d'assemblage) reçoit une bulle
    const v=mepViewAt(sh,x,y);
    if(!v||!v.asm)return {ok:false,msg:'＋ Bulle : cliquez une pièce dans une vue « Assemblage ».'};
    const l=mepFromSheet(v,x,y),h=asmPlanHit(v.dir,v.u,v.v,l.x,l.y);
    if(!h||!h.comp)return {ok:false,msg:'＋ Bulle : aucune pièce de l’assemblage sous le clic.'};
    const row=mepBomRows(sh).find(r=>r.ids&&r.ids.indexOf(h.comp)>=0);
    if(!row)return {ok:false,msg:'＋ Bulle : cette pièce n’est pas dans la nomenclature (niveau choisi).'};
    if(!Array.isArray(sh.balloons))sh.balloons=[];
    let n=sh.balloons.length+1;while(sh.balloons.some(b=>b.id==='bl'+n))n++;
    const b={id:'bl'+n,view:v.id,comp:row.ids[0],p:h.p,dx:12,dy:-12};
    sh.balloons.push(b);
    return {ok:true,b,msg:'Bulle '+row.rep+' ('+row.name+') ajoutée — glissez-la pour la placer.'};
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
      const cB=mk('circle',{cx:B.x,cy:B.y,r:R,class:'mepTitleBlock'});
      if(mepSt.selBl===b.id)cB.setAttribute('style','stroke:#2f7ff0;stroke-width:.5'); // V0.8.2 : bulle sélectionnée
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
