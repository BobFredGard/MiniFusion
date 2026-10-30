// Espace PLAN — suite de la fonction englobante ouverte dans 98-mep-00-modele.js (état privé partagé, fermée dans 98-mep-95-export-init.js) : esquisse 2D de planche : accrochage, liens, création, sélection, contraintes, rendu.
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
    perso:{lab:'CHAMP PERSO',ed:''},
    // case du tableau des révisions DESSINÉ dans le cartouche (V0.22.7) : e.r = rang (0 = 1re révision,
    // en bas), e.k = colonne i|d|a|t|n|v|p (indice, date, note, modification, dessiné, vérifié, approuvé)
    rev:{lab:'RÉV',auto:1,hide:1}
  };
  const MEP_REV_COLS={a:'Note appl.',v:'Vérifié',p:'Approuvé'}; // colonnes en plus de i, d, n, t
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
    // hRes : hauteur réservée imposée par le modèle (un trait de toute la hauteur, ex. bande de
    // confidentialité le long du cadre, ne doit pas réserver toute la feuille)
    if(mepTbIsSk(sh)&&+sh.title.tb.hRes>0)return Math.min(mepTbLim(sh).h*0.6,+sh.title.tb.hRes);
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
    const v=mepTbValue(sh,{f:e.f,k:e.k,r:e.r});
    if(edit&&(!v||v==='—'))return'{'+(e.f==='perso'?(e.lab||'CHAMP'):e.f==='rev'?e.k+(+e.r+1):(MEP_TB_FIELDS[e.f]||{}).lab||e.f)+'}';
    return e.nd&&v==='—'?'':v; // nd : case laissée vide plutôt que « — »
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
        if(+e.rot)t.setAttribute('transform','rotate('+(-e.rot)+' '+p.x+' '+p.y+')'); // degrés, sens trigo (Y papier vers le bas)
        t.textContent=val;
        // fit : largeur disponible (mm) — un texte plus long est resserré pour tenir dans sa case (cartouche
        // repris d'un DXF dont la police est plus étroite) ; mesure du navigateur, sinon estimation
        if(+e.fit>0){let L=0;try{L=t.getComputedTextLength();}catch(er){}if(!(L>0))L=val.length*(+e.h||3.5)*0.55;
          if(L>+e.fit){t.setAttribute('textLength',(+e.fit).toFixed(2));t.setAttribute('lengthAdjust','spacingAndGlyphs');}}}
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
