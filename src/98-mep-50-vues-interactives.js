// Espace PLAN — suite de la fonction englobante ouverte dans 98-mep-00-modele.js (état privé partagé, fermée dans 98-mep-95-export-init.js) : commandes de vues interactives, modèles de cartouche, panneaux, règles.
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
      if(G.which==='iso'){nv=mepAddView({kind:'base',vk:'iso',bodyId:par.bodyId,asm:!!par.asm,label:'',scale:par.scale,_keepScale:1,_at:G.at,
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
      bodyId:par.bodyId,asm:!!par.asm,mode:par.mode,tangent:par.tangent,hlrExact:par.hlrExact!==false,scale:par.scale,_keepScale:1,_at:at,
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
  /* ── modèle COMPLET d'un cartouche (V0.8.6) ──
     « l'export n'emporte pas les textes ni les images » : un modèle ne gardait que l'esquisse
     (traits, textes fixes, emplacements des champs). Il emporte désormais aussi le LOGO et les
     VALEURS des champs (projet, client, société, n° de plan, auteur, matière, TTS, TTH,
     tolérances, champs perso…), et le cartouche Standard s'enregistre comme les autres
     ({kind:'std'}). Rappeler un modèle remet tout ; la date et les champs calculés restent ceux
     de la planche. */
  function mepTbValKeys(){return ['projet','client','societe','quantite','nplan','auteur','verif','matiere','traitement','tth','tolgen','etat','masse','revFmt'];} // fonction : sûre même appelée avant cette ligne (nouvelle planche)
  function mepTbPack(sh,name){
    const tt=sh.title||{};
    const o=mepTbIsSk(sh)?mepClone(tt.tb):{kind:'std',revSt:tt.revSt?mepClone(tt.revSt):undefined};
    o.name=name||o.name||(o.kind==='std'?'Standard':'Cartouche');
    if(tt.logo)o.logo=tt.logo;else delete o.logo;
    const v={};mepTbValKeys().forEach(k=>{if(tt[k]!=null&&tt[k]!=='')v[k]=tt[k];});o.vals=v;
    if(tt.cust&&Object.keys(tt.cust).length)o.cust=mepClone(tt.cust);else delete o.cust;
    return o;
  }
  function mepTbOk(o){return !!o&&((o.kind==='sk'&&o.sk&&o.sk.pts)||o.kind==='std');}
  function mepTbUnpack(tt,o){
    // Applique le modèle o (paquet complet, ou ancien modèle sans valeurs) au titre tt → tt
    tt=tt||{};if(!mepTbOk(o))return tt;
    const tb=mepClone(o);delete tb.logo;delete tb.vals;delete tb.cust;
    if(o.kind==='std'){tt.tb=null;if(tb.revSt)tt.revSt=tb.revSt;}else tt.tb=tb;
    if(o.logo)tt.logo=o.logo;
    if(o.vals&&typeof o.vals==='object')mepTbValKeys().forEach(k=>{if(o.vals[k]!=null)tt[k]=o.vals[k];});
    if(o.cust&&typeof o.cust==='object')tt.cust=Object.assign({},tt.cust||{},mepClone(o.cust));
    return tt;
  }
  /* ── bibliothèque de modèles (locale à ce navigateur) ── */
  function mepTbLib(){try{const o=JSON.parse(localStorage.getItem('mep_tb_lib')||'{}');return o&&typeof o==='object'?o:{};}catch(e){return{};}}
  function mepTbLibSave(o){try{localStorage.setItem('mep_tb_lib',JSON.stringify(o));}catch(e){}}
  // sauvegarde externe des modèles : fichier JSON {format:'miniFusion-cartouches',v:1,tbs:{nom:modèle}}
  function mepTbExportFile(sh){
    const L=mepTbLib(),tbs={};Object.keys(L).forEach(n=>{tbs[n]=L[n];});
    if(sh){const n=(mepTbIsSk(sh)&&sh.title.tb.name)||'Cartouche de la planche';tbs[n]=mepTbPack(sh,n);} // complet : logo, valeurs
    const names=Object.keys(tbs);
    if(!names.length){mepStatus('Aucun cartouche à exporter.');return;}
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
        const tbs=o&&o.format==='miniFusion-cartouches'&&o.tbs?o.tbs:(mepTbOk(o)?{[o.name||f.name.replace(/\.[^.]+$/,'')]:o}:null);
        if(!tbs){mepStatus('Ce fichier ne contient pas de cartouche miniFusion.');return;}
        const L=mepTbLib();let n=0;
        Object.keys(tbs).forEach(k=>{const tb=tbs[k];if(!mepTbOk(tb))return;
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
    try{const n=localStorage.getItem('mep_tb_def'),L=mepTbLib();if(n&&mepTbOk(L[n]))return mepClone(L[n]);}catch(e){}
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
