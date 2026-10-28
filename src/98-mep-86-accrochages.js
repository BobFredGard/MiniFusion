// Espace PLAN — suite de la fonction englobante ouverte dans 98-mep-00-modele.js (état privé partagé, fermée dans 98-mep-95-export-init.js) : accrochages imposés de l'outil Cote.
  /* ═══════════════ U2. accrochages imposés (menu contextuel de l'outil Cote) ═══════════════ */
  /* 2026-10-28 : « pouvoir coter entre points : extrémité d'arête, point maximum suivant X ou Y,
     milieu, intersection entre tout type de ligne ou cercle, via menu contextuel ; l'intersection
     peut être dans le vide (2 lignes prolongées, ligne et cercle prolongé) en bleu, comme les cotes ».
     mepSt.snapMode impose le type de point des clics de l'outil Cote (null = automatique) ; il vaut
     pour les 2 points de la cote en cours et revient à « Automatique » une fois la cote posée.
     Point d'intersection : q.hint={t:'int',e:[s1,s2]} — les 2 entités (repère de la vue) servent
     au suivi (géométrie exacte) et aux prolongements dessinés avec la cote. */
  const MEP_SNAP_MODES=[
    [null,'Automatique'],
    ['end','Extrémité'],
    ['mid','Milieu'],
    ['ctr','Centre'],
    ['maxx','Point extrême suivant X'],
    ['maxy','Point extrême suivant Y'],
    ['int','Intersection (même prolongée)']
  ];
  function mepSnapModeLabel(m){const r=MEP_SNAP_MODES.find(x=>x[0]===(m||null));return r?r[1]:'Automatique';}
  function mepSetSnapMode(m){
    mepSt.snapMode=m||null;mepSt.snapHov=null;mepSt.intPick=null;
    /* 2026-10-28 (2) : « coter un 1er élément, une droite, puis clic droit, et je choisis la 2nde entité
       (point, milieu, centre…) » — une droite seule pré-sélectionnée reste la 1ʳᵉ entité
       (mepSt.dimLine) : la cote ira du point imposé à cette droite, perpendiculairement. */
    const sel=mepSt.entSel||[],D0=mepSt.dim;
    if(m&&D0&&D0.kind==='len'&&sel.length===1&&sel[0].t==='L'){
      const sh=mepSheet(),r=sh&&mepEntRef(sh,sel[0]);
      if(r&&r.e.t==='L'){mepSt.dimLine={vid:r.v.id,i:r.i,e:mepSnapEntOf(r.e)};mepSt.dim=null;mepSt.hovEnt=null;}
    }
    if(!m&&mepSt.dimLine){mepSt.dimLine=null;mepDimRefreshDraft();} // retour à la longueur de la droite
    // une entité pré-sélectionnée (longueur, Ø…) laisse la place au point imposé
    if(m&&mepSt.dim&&!(mepSt.dim.kind==='dist'&&!mepSt.dim.b)){mepSt.dim=null;mepSt.entSel=[];mepSt.hovEnt=null;mepSt.dimLine=null;}
    const D=mepSt.dim,nth=(D||mepSt.dimLine||mepSt.chain)?'2ᵉ':'1ᵉʳ';
    mepStatus(m==='int'?('Intersection ('+nth+' point) : cliquez une ligne ou un cercle, puis une 2ᵉ (clic droit pour changer).')
      :m?('Accrochage '+mepSnapModeLabel(m).toLowerCase()+' : cliquez le '+nth+' point'+(mepSt.dimLine?' (cote perpendiculaire à la droite)':'')+' (clic droit pour changer).')
      :'Accrochage automatique.');
    mepRender();
  }
  /* point d'un clic en accrochage imposé (null : rien de pris, le statut le dit) */
  function mepSnapModeClick(sh,P){
    if(mepSt.snapMode==='int')return mepIntClick(sh,P);
    const S=mepSnapModePt(sh,P.x,P.y,mepSt.snapMode);
    if(!S)mepStatus('Accrochage '+mepSnapModeLabel(mepSt.snapMode).toLowerCase()+' : aucun point sous le curseur.');
    return S;
  }
  /* ── Intersection, sous-fonction en 2 clics (2026-10-28 (2)) ──
     « clic droit, Intersection : je clique une ligne, puis une autre, leur point d'intersection devient
     mon point à coter » ; aussi ligne × cercle (et cercle × cercle, arcs). mepSt.intPick garde la 1ʳᵉ
     entité ; de 2 intersections possibles on garde la plus proche du 2ᵉ clic. Échap n'annule que
     l'intersection en cours (retour au choix du point). */
  function mepIntPickHit(sh,P){
    const hit=mepHitViewEnt(sh,P.x,P.y,{axes:true});
    return hit&&(hit.e.t==='L'||hit.e.t==='C'||hit.e.t==='A')?hit:null;
  }
  // intersection de la 1ʳᵉ entité retenue (f) et de hit, la plus proche de P (mm papier)
  function mepIntPoint(sh,f,hit,P){
    if(!f||!hit||hit.vid!==f.vid||hit.i===f.i)return null;
    const v=mepView(sh,hit.vid);if(!v)return null;
    const ents=[f.s,mepSnapEntOf(hit.e)];
    let best=null,bd=Infinity;
    mepSnapInter(ents[0],ents[1]).forEach(p=>{
      const x=v.x+p.x*v.scale,y=v.y+p.y*v.scale,d=Math.hypot(x-P.x,y-P.y);
      if(d<bd){bd=d;best={x,y,vid:v.id,q:{x:p.x,y:p.y,hint:{t:'int',e:ents}},hint:null,ext:ents,mode:'int'};}
    });
    return best;
  }
  function mepIntClick(sh,P){
    const hit=mepIntPickHit(sh,P),f=mepSt.intPick;
    if(!f){
      if(!hit){mepStatus('Intersection : cliquez une ligne ou un cercle.');return null;}
      mepSt.intPick={vid:hit.vid,i:hit.i,s:mepSnapEntOf(hit.e)};
      mepStatus('Intersection : cliquez la 2ᵉ ligne ou le cercle (Échap annule l’intersection).');
      mepRender();
      return null;
    }
    if(!hit){mepStatus('Intersection : cliquez la 2ᵉ ligne ou le cercle (Échap annule l’intersection).');return null;}
    if(hit.vid!==f.vid){mepStatus('Intersection : les 2 entités doivent être dans la même vue.');return null;}
    if(hit.i===f.i){mepStatus('Intersection : cliquez une AUTRE ligne ou un cercle.');return null;}
    const S=mepIntPoint(sh,f,hit,P);
    if(!S){mepStatus('Intersection : ces 2 entités ne se coupent pas, même prolongées — cliquez-en une autre.');return null;}
    mepSt.intPick=null;mepSt.snapHov=null;
    return S;
  }
  function mepIntCancel(){
    mepSt.intPick=null;mepSt.snapHov=null;
    mepStatus('Intersection annulée : cliquez une ligne ou un cercle (clic droit pour un autre accrochage).');
    mepRender();
  }
  /* ── cote droite → point imposé : distance perpendiculaire ──
     droite horizontale → cote verticale (et inversement), pied borné sur l'arête (ligne de rappel
     depuis le trait) ; droite oblique → cote alignée sur la perpendiculaire (pied sur la droite prolongée). */
  function mepDimLineFoot(e,q){
    const dx=e.x2-e.x1,dy=e.y2-e.y1,L=Math.hypot(dx,dy);if(!(L>1e-12))return null;
    const hv=Math.abs(dy)/L<1e-4?'v':Math.abs(dx)/L<1e-4?'h':null; // horizontale → cote verticale
    let t=((q.x-e.x1)*dx+(q.y-e.y1)*dy)/(L*L);
    if(hv)t=t<0?0:(t>1?1:t);
    return{x:e.x1+dx*t,y:e.y1+dy*t,t,orient:hv||'a'};
  }
  function mepDimLineToPt(sh,S,P){
    const Lr=mepSt.dimLine,v=Lr&&mepView(sh,Lr.vid);
    if(!v){mepSt.dimLine=null;mepStatus('Cote annulée : vue supprimée.');mepRender();return false;}
    if(S.vid!==Lr.vid){mepStatus('Distance : la droite et le point doivent être dans la même vue.');return false;}
    const q=mepSnapModeQ(sh,S),F=mepDimLineFoot(Lr.e,q);
    if(!F)return false;
    const dn=F.orient==='v'?Math.abs(q.y-F.y):F.orient==='h'?Math.abs(q.x-F.x):Math.hypot(q.x-F.x,q.y-F.y);
    if(dn<1e-9){mepStatus('Distance : ce point est sur la droite — choisissez-en un autre.');return false;}
    const a={x:F.x,y:F.y};
    if(F.t>=-1e-9&&F.t<=1+1e-9)a.hint={t:'seg',i:Lr.i};
    mepSt.dim={kind:'dist',vid:v.id,a,b:q,off:8,orient:F.orient,__ghost:true,__orientLock:true,_pp:P};
    mepSt.dimLine=null;mepSt.entSel=[];mepSt.hovEnt=null;mepSt.snapHov=null;
    mepDimMoveTo(sh,mepSt.dim,P);
    mepStatus('Distance droite → point : cliquez pour placer la cote.');
    mepRender();
    return true;
  }
  // snapshot d'une entité (repère de la vue) : ce qui suffit à recalculer le point et ses prolongements
  function mepSnapEntOf(e){
    if(e.t==='L')return{t:'L',x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2,k:e.k};
    if(e.t==='A')return{t:'A',cx:e.cx,cy:e.cy,r:e.r,a0:e.a0,a1:e.a1};
    return{t:'C',cx:e.cx,cy:e.cy,r:e.r};
  }
  // entités cotables d'une vue : arêtes projetées + traits d'axe (i='ax:<clé>')
  function mepSnapEnts(sh,v){
    const out=[];
    (mepGeoOf(v).els||[]).forEach((e,i)=>{if(e.t==='L'||e.t==='C'||e.t==='A')out.push({e,i});});
    try{mepAxisLines(sh,v).forEach(p=>{if(p.t==='L'||p.t==='C')out.push({e:p,i:'ax:'+p.ak,ak:p.ak});});}catch(err){}
    return out;
  }
  function mepArcIn(e,a){ // angle a dans l'arc e (a0 → a1, sens de mepHitViewEnt)
    const lo=Math.min(e.a0,e.a1),hi=Math.max(e.a0,e.a1);
    let an=a;while(an<lo)an+=2*Math.PI;while(an-2*Math.PI>=lo)an-=2*Math.PI;
    return an<=hi+1e-9;
  }
  // intersections des supports (droites infinies, cercles complets) de 2 entités, repère local
  function mepSnapInter(a,b){
    const out=[];
    const isL=e=>e.t==='L';
    const lineLine=(p,q)=>{
      const dx1=p.x2-p.x1,dy1=p.y2-p.y1,dx2=q.x2-q.x1,dy2=q.y2-q.y1;
      const den=dx1*dy2-dy1*dx2,n=Math.hypot(dx1,dy1)*Math.hypot(dx2,dy2);
      if(!(n>1e-18)||Math.abs(den)/n<1e-6)return; // parallèles
      const t=((q.x1-p.x1)*dy2-(q.y1-p.y1)*dx2)/den;
      out.push({x:p.x1+dx1*t,y:p.y1+dy1*t});
    };
    const lineCirc=(p,c)=>{
      const dx=p.x2-p.x1,dy=p.y2-p.y1,L=Math.hypot(dx,dy);if(!(L>1e-12))return;
      const ux=dx/L,uy=dy/L,t0=(c.cx-p.x1)*ux+(c.cy-p.y1)*uy;
      const fx=p.x1+ux*t0,fy=p.y1+uy*t0,h=Math.hypot(c.cx-fx,c.cy-fy);
      if(h>c.r*(1+1e-9))return;
      const s=Math.sqrt(Math.max(0,c.r*c.r-h*h));
      out.push({x:fx+ux*s,y:fy+uy*s});if(s>1e-9)out.push({x:fx-ux*s,y:fy-uy*s});
    };
    const circCirc=(c1,c2)=>{
      const dx=c2.cx-c1.cx,dy=c2.cy-c1.cy,d=Math.hypot(dx,dy);
      if(!(d>1e-9)||d>c1.r+c2.r+1e-9||d<Math.abs(c1.r-c2.r)-1e-9)return;
      const a=(c1.r*c1.r-c2.r*c2.r+d*d)/(2*d),h=Math.sqrt(Math.max(0,c1.r*c1.r-a*a));
      const mx=c1.cx+dx*a/d,my=c1.cy+dy*a/d;
      out.push({x:mx-dy*h/d,y:my+dx*h/d});if(h>1e-9)out.push({x:mx+dy*h/d,y:my-dx*h/d});
    };
    if(isL(a)&&isL(b))lineLine(a,b);
    else if(isL(a))lineCirc(a,b);
    else if(isL(b))lineCirc(b,a);
    else circCirc(a,b);
    return out;
  }
  // le point q (local) est-il hors de l'entité réelle ? → prolongement à dessiner
  function mepSnapOutside(e,q){
    if(e.t==='L'){
      const dx=e.x2-e.x1,dy=e.y2-e.y1,L2=dx*dx+dy*dy;if(!(L2>1e-12))return false;
      const t=((q.x-e.x1)*dx+(q.y-e.y1)*dy)/L2,tol=1e-4/Math.sqrt(L2);
      return t<-tol||t>1+tol;
    }
    if(e.t==='A')return !mepArcIn(e,Math.atan2(q.y-e.cy,q.x-e.cx));
    return false;
  }
  /* Point imposé sous le curseur (mm papier sx,sy) → {x,y (papier), vid, q (local, hint), ext} ou null. */
  function mepSnapModePt(sh,sx,sy,mode){
    if(!sh||!mode)return null;
    const tol=8/mepSt.zoom;
    let best=null,bd=tol;
    const take=(v,lx,ly,hint,ext,score)=>{
      const x=v.x+lx*v.scale,y=v.y+ly*v.scale,d=score!=null?score:Math.hypot(x-sx,y-sy);
      if(d<bd){bd=d;best={x,y,vid:v.id,q:{x:lx,y:ly},hint:hint||null,ext:ext||null,mode};}
    };
    const views=sh.views.filter(v=>{const b=mepViewSheetBBox(v);return !b||(sx>=b.x-20&&sx<=b.x+b.w+20&&sy>=b.y-20&&sy<=b.y+b.h+20);});
    if(mode==='end'||mode==='mid'||mode==='ctr'){
      views.forEach(v=>mepSnapEnts(sh,v).forEach(({e,i,ak})=>{
        const h=t=>ak?{t:t==='end'?'axEnd':t==='mid'?'axMid':'ctr',vid:v.id,ak}:{t,vid:v.id,i};
        if(e.t==='L'){
          if(mode==='end'){take(v,e.x1,e.y1,h('end'));take(v,e.x2,e.y2,h('end'));}
          else if(mode==='mid')take(v,(e.x1+e.x2)/2,(e.y1+e.y2)/2,h('mid'));
        }else if(mode==='ctr')take(v,e.cx,e.cy,h('ctr'));
        else if(e.t==='A'){
          if(mode==='end'){take(v,e.cx+e.r*Math.cos(e.a0),e.cy+e.r*Math.sin(e.a0));take(v,e.cx+e.r*Math.cos(e.a1),e.cy+e.r*Math.sin(e.a1));}
          else if(mode==='mid'){const lo=Math.min(e.a0,e.a1),hi=Math.max(e.a0,e.a1),m=(lo+hi)/2;take(v,e.cx+e.r*Math.cos(m),e.cy+e.r*Math.sin(m));}
        }
      }));
      return best;
    }
    if(mode==='maxx'||mode==='maxy'){
      // l'entité visée (la plus proche) donne ses 2 points extrêmes dans la direction ; le plus proche du curseur
      const hit=mepHitViewEnt(sh,sx,sy,{axes:true});
      if(!hit)return null;
      const v=mepView(sh,hit.vid),e=hit.e;if(!v)return null;
      const pts=[];
      if(e.t==='L'){pts.push({x:e.x1,y:e.y1,end:1},{x:e.x2,y:e.y2,end:1});}
      else if(e.t==='C'||e.t==='A'){
        [0,0.5,1,1.5].forEach(k=>{const a=k*Math.PI;if(e.t==='C'||mepArcIn(e,a))pts.push({x:e.cx+e.r*Math.cos(a),y:e.cy+e.r*Math.sin(a)});});
        if(e.t==='A')[e.a0,e.a1].forEach(a=>pts.push({x:e.cx+e.r*Math.cos(a),y:e.cy+e.r*Math.sin(a)}));
      }
      if(!pts.length)return null;
      const k=mode==='maxx'?'x':'y';
      let lo=pts[0],hi=pts[0];
      pts.forEach(p=>{if(p[k]<lo[k]-1e-9)lo=p;if(p[k]>hi[k]+1e-9)hi=p;});
      bd=Infinity;
      [lo,hi].forEach(p=>take(v,p.x,p.y,p.end&&isFinite(hit.i)?{t:'end',vid:v.id,i:hit.i}:null));
      return best;
    }
    if(mode==='int'){
      // supports (droites infinies, cercles complets) passant près du curseur → intersections 2 à 2
      views.forEach(v=>{
        const lx=(sx-v.x)/v.scale,ly=(sy-v.y)/v.scale,tl=tol/v.scale;
        const cand=[];
        mepSnapEnts(sh,v).forEach(({e})=>{
          let d;
          if(e.t==='L'){
            const dx=e.x2-e.x1,dy=e.y2-e.y1,L=Math.hypot(dx,dy);if(!(L>1e-9))return;
            d=Math.abs((lx-e.x1)*dy-(ly-e.y1)*dx)/L;
          }else d=Math.abs(Math.hypot(lx-e.cx,ly-e.cy)-e.r);
          if(d<=tl*1.5)cand.push({e,d});
        });
        cand.sort((a,b)=>a.d-b.d);
        const c=cand.slice(0,24);
        for(let i=0;i<c.length;i++)for(let j=i+1;j<c.length;j++){
          mepSnapInter(c[i].e,c[j].e).forEach(p=>{
            const out=mepSnapOutside(c[i].e,p)||mepSnapOutside(c[j].e,p);
            // à égalité, l'intersection réelle passe avant celle des prolongements
            const sc=Math.hypot(v.x+p.x*v.scale-sx,v.y+p.y*v.scale-sy)+(out?0.15/mepSt.zoom:0);
            take(v,p.x,p.y,null,[mepSnapEntOf(c[i].e),mepSnapEntOf(c[j].e)],sc);
          });
        }
      });
      if(best&&best.ext){best.q.hint={t:'int',e:best.ext};}
      return best;
    }
    return null;
  }
  // point local d'une cote à partir du point imposé (référence durable si possible)
  function mepSnapModeQ(sh,S){
    const v=mepView(sh,S.vid);
    const q={x:S.q.x,y:S.q.y};
    if(S.q.hint)q.hint=S.q.hint;
    else if(S.hint&&v){const hh=mepSnapHint(sh,v,{hit:S.hint},q);if(hh)q.hint=hh;}
    return q;
  }
  /* suivi d'un point d'intersection : sur la géométrie exacte, chaque entité est retrouvée
     (droite parallèle la plus proche, cercle de même rayon) puis le point recalculé */
  function mepIntRefresh(v,q){
    const h=q&&q.hint;if(!h||h.t!=='int'||!Array.isArray(h.e)||h.e.length!==2||!v)return q;
    const g=mepGeoOf(v);if(!mepGeoExact(g))return q;
    const ne=h.e.map(s=>{
      if(s.t==='L'){const e=mepAxisTrackLine(g,s,null);return e?mepSnapEntOf(e):s;}
      let b=null,bc=Infinity;
      (g.els||[]).forEach(e=>{
        if(e.t!=='C'&&e.t!=='A')return;
        if(Math.abs(e.r-s.r)>Math.max(0.05,0.2*s.r))return;
        const c=Math.hypot(e.cx-s.cx,e.cy-s.cy)+Math.abs(e.r-s.r);if(c<bc){bc=c;b=e;}
      });
      return b&&bc<=Math.max(3,s.r)?mepSnapEntOf(b):s;
    });
    let p=null,bd=Infinity;
    mepSnapInter(ne[0],ne[1]).forEach(r=>{const d=Math.hypot(r.x-q.x,r.y-q.y);if(d<bd){bd=d;p=r;}});
    if(!p)return q; // plus d'intersection : dernière position connue
    h.e=ne;q.x=p.x;q.y=p.y;
    return q;
  }
  /* prolongements d'un point d'intersection hors des entités : du bout de l'arête (ou de l'arc)
     jusqu'au point, plus le dépassement des lignes de rappel — tracés avec la cote */
  function mepSnapExtPrims(v,q,ents){
    const res=[];if(!v||!q||!ents)return res;
    const ov=(MEP_DIM_STYLE.overrun||2)/v.scale; // mm papier → repère de la vue
    ents.forEach(e=>{
      if(!mepSnapOutside(e,q))return;
      if(e.t==='L'){
        const dx=e.x2-e.x1,dy=e.y2-e.y1,L=Math.hypot(dx,dy);if(!(L>1e-9))return;
        const t=((q.x-e.x1)*dx+(q.y-e.y1)*dy)/(L*L);
        const from=t<0?{x:e.x1,y:e.y1}:{x:e.x2,y:e.y2},s=t<0?-1:1;
        const A=mepToSheet(v,from.x,from.y),B=mepToSheet(v,q.x+s*dx/L*ov,q.y+s*dy/L*ov);
        res.push({tag:'line',x1:A.x,y1:A.y,x2:B.x,y2:B.y});
      }else if(e.t==='A'){
        // arc prolongé depuis le bout le plus proche (sens le plus court) jusqu'au point
        const a=Math.atan2(q.y-e.cy,q.x-e.cx),norm=x=>{while(x>Math.PI)x-=2*Math.PI;while(x<=-Math.PI)x+=2*Math.PI;return x;};
        const d0=norm(a-e.a0),d1=norm(a-e.a1),useA0=Math.abs(d0)<=Math.abs(d1),a0=useA0?e.a0:e.a1,dd=useA0?d0:d1;
        const dov=Math.sign(dd)*ov/Math.max(e.r,1e-9),a1=a0+dd+dov;
        const C=mepToSheet(v,e.cx,e.cy),r=e.r*v.scale,n=Math.max(4,Math.ceil(Math.abs(a1-a0)*r/2));
        for(let k=0;k<n;k++){
          const t0=a0+(a1-a0)*k/n,t1=a0+(a1-a0)*(k+1)/n;
          res.push({tag:'line',x1:C.x+r*Math.cos(t0),y1:C.y+r*Math.sin(t0),x2:C.x+r*Math.cos(t1),y2:C.y+r*Math.sin(t1)});
        }
      }
    });
    return res;
  }
  function mepDrawSnapExt(draw,L,v,q){
    if(!q||!q.hint||q.hint.t!=='int')return;
    mepSnapExtPrims(v,q,q.hint.e).forEach(p=>draw('line',Object.assign({x1:p.x1,y1:p.y1,x2:p.x2,y2:p.y2},L)));
  }
  /* repère du point imposé survolé (+ prolongements en aperçu) et du 1ᵉʳ point déjà choisi */
  function mepDrawSnapHov(mk){
    if(mepSt.tool!=='dim')return;
    const sh=mepSheet();if(!sh)return;
    const z=Math.max(1e-6,mepSt.zoom||1),s=3.2/z;
    const mark=(x,y,mode)=>{
      const c={class:'mepSnap'};
      if(mode==='end')mk('rect',Object.assign({x:x-s,y:y-s,width:2*s,height:2*s},c),mepGHlp);
      else if(mode==='mid')mk('path',Object.assign({d:'M'+x+','+(y-s*1.2)+' L'+(x+s*1.1)+','+(y+s*0.8)+' L'+(x-s*1.1)+','+(y+s*0.8)+' Z'},c),mepGHlp);
      else if(mode==='ctr')mk('circle',Object.assign({cx:x,cy:y,r:s},c),mepGHlp);
      else if(mode==='int'){mk('line',Object.assign({x1:x-s,y1:y-s,x2:x+s,y2:y+s},c),mepGHlp);mk('line',Object.assign({x1:x-s,y1:y+s,x2:x+s,y2:y-s},c),mepGHlp);}
      else mk('path',Object.assign({d:'M'+x+','+(y-s*1.2)+' L'+(x+s*1.2)+','+y+' L'+x+','+(y+s*1.2)+' L'+(x-s*1.2)+','+y+' Z'},c),mepGHlp);
    };
    const D=mepSt.dim;
    if(D&&D.kind==='dist'&&D.a&&!D.b){
      const v=mepView(sh,D.vid);
      if(v){
        const A=mepToSheet(v,D.a.x,D.a.y);
        mark(A.x,A.y,D.a.hint&&D.a.hint.t==='int'?'int':'end');
        mepSnapExtPrims(v,D.a,D.a.hint&&D.a.hint.t==='int'?D.a.hint.e:null)
          .forEach(p=>mk('line',{x1:p.x1,y1:p.y1,x2:p.x2,y2:p.y2,class:'mepDimL mepDimGhost'},mepGHlp));
        const H=mepSt.snapHov;
        if(H)mk('line',{x1:A.x,y1:A.y,x2:H.x,y2:H.y,class:'mepDraft'},mepGHlp);
      }
    }
    const H=mepSt.snapHov;
    if(!H)return;
    const Lr=mepSt.dimLine,vl=Lr&&H.vid===Lr.vid?mepView(sh,Lr.vid):null;
    if(vl){ // droite → point : trait d'aperçu du pied de la perpendiculaire au point visé
      const F=mepDimLineFoot(Lr.e,H.q);
      if(F){const A=mepToSheet(vl,F.x,F.y);mk('line',{x1:A.x,y1:A.y,x2:H.x,y2:H.y,class:'mepDraft'},mepGHlp);}
    }
    const v=mepView(sh,H.vid);
    if(v&&H.ext)mepSnapExtPrims(v,H.q,H.ext).forEach(p=>mk('line',{x1:p.x1,y1:p.y1,x2:p.x2,y2:p.y2,class:'mepDimL mepDimGhost'},mepGHlp));
    mark(H.x,H.y,H.mode);
  }
