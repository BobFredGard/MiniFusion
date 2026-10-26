// Espace PLAN — suite de la fonction englobante ouverte dans 98-mep-00-modele.js (état privé partagé, fermée dans 98-mep-95-export-init.js) : mini-solveur LM, outils et rendu de l'esquisse de planche.
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
