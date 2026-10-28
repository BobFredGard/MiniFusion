// Espace PLAN — suite de la fonction englobante ouverte dans 98-mep-00-modele.js (état privé partagé, fermée dans 98-mep-95-export-init.js) : export SVG/DXF, impression, activation de l'espace et init.
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
  window.mepMergeCollinear=mepMergeCollinear;window.mepCylDiaBetween=mepCylDiaBetween;window.mepCylDiaSeg=mepCylDiaSeg;window.mepDimText=window.mepDimText||mepDimText;
  window.mepAngSector=mepAngSector;window.mepAngSectorAt=mepAngSectorAt;
  window.mepDimKindForEnt=mepDimKindForEnt;
  window.mepArrowGeom=mepArrowGeom;
  window.mepTolInfo=(cls,nom)=>mepTolRange(cls,nom);
  // fin de glissement : l'instantané undo a déjà été pris au premier mouvement
  window.mepViewDragCommit=()=>mepEdit('déplacement vue',()=>{},true);
  // après restauration d'un instantané documentaire : redessiner la planche
  window.mepRefresh=()=>{try{mepRender();}catch(e){}};
  window.mepDebugGeo=id=>{let v=null;((doc.mep&&doc.mep.sheets)||[]).forEach(s=>{v=v||(s.views||[]).find(x=>x.id===id);});return v?mepGeoOf(v):null;}; // diagnostic (console)
  window.mepSetTool=mepSetTool;
  window.mepImportDxf=mepImportDxf;
  window.mepSetAxisMode=mepSetAxisMode;
  // points d'entrée réservés aux tests automatisés (jamais activés dans l'app)
  if(window.__MEP_TEST_HOOKS__){
    window.__mepTest={
      bomRows:sh=>mepBomRows(sh),autoDia:(sh,d)=>mepDimAutoDia(sh,d),balloonsAuto:sh=>mepBalloonsAuto(sh),tbPack:(sh,n)=>mepTbPack(sh,n),tbUnpack:(tt,o)=>mepTbUnpack(tt,o),tbLib:()=>mepTbLib(),newSheet:n=>mepNewSheet(n),balloonAt:(x,y)=>mepBalloonAt(mepSheet(),x,y),viewBBox:v=>mepViewSheetBBox(v),balloonAdd:(x,y)=>mepBalloonAddAt(mepSheet(),x,y),hatchVar:(k,c)=>mepHatchVar(k,c),st:()=>mepSt,drawBalloons:(mk,sh)=>mepDrawBalloons(mk,sh),meshesOf:v=>mepMeshesOf(v),addView:o=>mepAddView(o),sheet:()=>mepSheet(),viewSig:v=>mepViewSig(v), // V0.6.7
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
      snapModePt:(x,y,m)=>mepSnapModePt(mepSheet(),x,y,m),setSnapMode:m=>mepSetSnapMode(m),snapMode:()=>mepSt.snapMode||null,dimClick:(P,c,s,a)=>mepDimClick(mepSheet(),P,!!c,!!s,!!a),snapInter:(a,b)=>mepSnapInter(a,b),snapExt:(v,q,e)=>mepSnapExtPrims(v,q,e),
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
