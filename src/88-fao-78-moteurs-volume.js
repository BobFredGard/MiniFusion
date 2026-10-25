/* ---------- Simulation : moteurs de matière « palier 3 » (V0.8.7, essai) ----------
   Deux moteurs à COMPARER avec les cartes de hauteurs (src/88-fao-77, défaut), choisis dans la
   barre de lecture (« moteur ») — on garde les trois avant d'en choisir un :
   • TRI-DEXEL : trois jeux de rayons parallèles à X, Y et Z ; chaque rayon garde ses INTERVALLES de
     matière. Taille exacte le long de chaque rayon, toutes orientations (contre-dépouilles, 3+2) —
     la représentation des simulateurs industriels. Outil vertical : la trace d'un outil de
     révolution sur un rayon horizontal est une « gélule » (disque balayé), calculée exactement ;
     outil incliné : intersection rayon / solide de révolution. Rendu : une facette par extrémité
     d'intervalle (instanciées), normales tirées des rayons voisins.
   • DISTANCE : champ de distance signée (tronqué) sur une grille 3D ; taille = max(d, −d_outil),
     d_outil tabulé dans le plan (ρ, h) du profil de l'outil ; surface extraite par « surface nets »
     par blocs (seuls les blocs touchés sont refaits), normales = gradient du champ : parois courbes
     sans escalier.
   Même outil que les cartes : rayon, arrondi d'arête, pointe (profil de révolution), axe du
   posage ou incliné (3+2). Le moteur ne change rien aux parcours ni au G-code. */
const FAO_ENGINES={cartes:'cartes',dexel:'tri-dexel',sdf:'distance'};
let faoSimEngine='cartes';
try{const k=localStorage.getItem('minifusion_faoMoteur');if(k&&FAO_ENGINES[k])faoSimEngine=k;}catch(e){}
let faoVwEngSel=null;
function faoEngWanted(){return faoSimEngine==='dexel'||faoSimEngine==='sdf';}
function faoEngineSet(k){
  if(!FAO_ENGINES[k])return;
  faoSimEngine=k;
  try{localStorage.setItem('minifusion_faoMoteur',k);}catch(e){}
  try{if(faoVwEngSel&&faoVwEngSel.value!==k)faoVwEngSel.value=k;}catch(e){}
  const vw=(typeof faoVw!=='undefined')?faoVw:null;
  if(vw&&vw.matterOn!==false){try{faoViewerMatterEnable(vw);}catch(e){}}
}
/* ── outil : profil de révolution ──
   hmin(ρ) : hauteur du dessous de l'outil au rayon ρ, depuis la pointe (fond plat 0, arrondi
   d'arête, cône de foret) ; rmax(h) : rayon de l'outil à la hauteur h (−1 sous la pointe). */
const faoEngToolCache=new Map();
function faoEngTool(r,cr,tp){
  r=+r||5;
  const CR=(isFinite(+cr)&&+cr>0)?Math.min(+cr,r):0,TP=(tp&&tp.length>1)?tp:null;
  const key=r.toFixed(4)+'|'+CR.toFixed(4)+'|'+(TP?faoTipSig(TP):'');
  let T=faoEngToolCache.get(key);if(T)return T;
  const N=48,hs=new Float64Array(N+1),rc=r-CR;
  for(let i=0;i<=N;i++){const rho=r*i/N;let h=0;
    if(TP)h=faoTipZAt(TP,rho);else if(CR>0&&rho>rc){const e=Math.min(rho-rc,CR);h=CR-Math.sqrt(Math.max(0,CR*CR-e*e));}
    hs[i]=i?Math.max(hs[i-1],h):h;}
  T={r,N,hs,h0:hs[0],htop:hs[N],key,sdfT:null,
    hmin(rho){if(rho>r)return Infinity;const f=rho/r*N,i=Math.min(N-1,Math.floor(f)),t=f-i;return hs[i]+(hs[i+1]-hs[i])*t;},
    rmax(h){if(h<hs[0])return -1;if(h>=hs[N])return r;let lo=0,hi=N;while(hi-lo>1){const m=(lo+hi)>>1;if(hs[m]<=h)lo=m;else hi=m;}
      const d=hs[hi]-hs[lo];return r*(lo+(d>1e-12?(h-hs[lo])/d:1))/N;}};
  if(faoEngToolCache.size>64)faoEngToolCache.clear();
  faoEngToolCache.set(key,T);return T;
}
/* ── géométrie partagée ── */
function faoEngSegD2(px,py,ax,ay,bx,by){
  const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;let t=L2>0?((px-ax)*dx+(py-ay)*dy)/L2:0;t=t<0?0:(t>1?1:t);
  const qx=ax+dx*t-px,qy=ay+dy*t-py;return qx*qx+qy*qy;
}
function faoStadX(ax,ay,bx,by,R,y,out){
  // Gélule (segment (a, b) épaissi de R, dans le plan (x, y)) ∩ droite y = cte → out = [x0, x1] ; false si vide
  let lo=Infinity,hi=-Infinity,d=R*R-(y-ay)*(y-ay);
  if(d>=0){const s=Math.sqrt(d);lo=ax-s;hi=ax+s;}
  d=R*R-(y-by)*(y-by);if(d>=0){const s=Math.sqrt(d);if(bx-s<lo)lo=bx-s;if(bx+s>hi)hi=bx+s;}
  const dx=bx-ax,dy=by-ay,L=Math.sqrt(dx*dx+dy*dy);
  if(L>1e-12){
    const ux=dx/L,uy=dy/L;let x0=-Infinity,x1=Infinity;
    // |(x−ax)·uy − (y−ay)·ux| ≤ R  et  0 ≤ (x−ax)·ux + (y−ay)·uy ≤ L
    if(Math.abs(uy)>1e-12){const k=-ax*uy-(y-ay)*ux;let p=(-R-k)/uy,q=(R-k)/uy;if(p>q){const s=p;p=q;q=s;}x0=p;x1=q;}
    else if(Math.abs(y-ay)>R)x0=Infinity;
    if(Math.abs(ux)>1e-12){const k=-ax*ux+(y-ay)*uy;let p=-k/ux,q=(L-k)/ux;if(p>q){const s=p;p=q;q=s;}if(p>x0)x0=p;if(q<x1)x1=q;}
    else{const k=(y-ay)*uy;if(k<0||k>L)x0=Infinity;}
    if(x0<=x1){if(x0<lo)lo=x0;if(x1>hi)hi=x1;}
  }
  if(!(lo<=hi))return false;
  out[0]=lo;out[1]=hi;return true;
}
function faoEngExitH(s,P,A,r){
  // longueur du corps d'outil utile : jusqu'à la sortie de la boîte du brut le long de A
  let H=0;const X=[+s.x0,+s.x1],Y=[+s.y0,+s.y1],Z=[+s.z0,+s.z1];
  for(let i=0;i<8;i++){const q=[X[i&1],Y[(i>>1)&1],Z[(i>>2)&1]];H=Math.max(H,(q[0]-P[0])*A[0]+(q[1]-P[1])*A[1]+(q[2]-P[2])*A[2]);}
  return H+r;
}
function faoEngSegments(vw,from,cb){
  // Segments de coupe joués entre l'état mémorisé (from : {i,x,y,z} ou null = depuis 0) et vw.t ;
  // cb(a, b, r, cr, tp, ax) — même découpage que faoMatterCarveTo / faoMatterCarveRange
  const pts=vw.pts,dd=vw.dd,times=vw.times,t=vw.t,crs=vw.exact?vw.cr:null,tps=vw.exact?vw.tp:null;
  if(!pts||pts.length<2)return;
  const seg=(i,a,b)=>{const r=((isFinite(dd[i+1])&&dd[i+1]>0)?dd[i+1]:10)/2;
    cb(a,b,r,(crs&&isFinite(+crs[i+1]))?+crs[i+1]:0,tps&&tps[i+1],pts[i+1]&&pts[i+1].ax);};
  if(!from){
    if(!(t>0))return;
    for(let i=0;i<pts.length-1;i++){
      if(times[i]>t)break;if(pts[i+1].r)continue;
      let a=pts[i],b=pts[i+1];
      if(times[i+1]>t){const t0=times[i],t1=times[i+1],f=(t1>t0)?Math.max(0,Math.min(1,(t-t0)/(t1-t0))):0;b={x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f,z:a.z+(b.z-a.z)*f};}
      seg(i,a,b);
    }
    return;
  }
  const p=from.p;let i=Math.max(0,Math.min(from.i|0,pts.length-2));
  const last=Math.max(i,Math.min(Math.round(+p.i),pts.length-2));
  let a={x:+from.x,y:+from.y,z:+from.z};
  for(;i<=last;i++){const dst=(i===last)?p:pts[i+1];if(!dst)break;
    if(dst.r){a={x:dst.x,y:dst.y,z:dst.z};continue;}
    const b={x:+dst.x,y:+dst.y,z:+dst.z};seg(i,a,b);a=b;}
}
function faoEngAxis(ax){
  // outil parallèle à un axe ? → {w : indice de l'axe, sg : sens du corps} ; sinon null (oblique)
  if(!ax)return {w:2,sg:1};
  const L=Math.hypot(ax[0],ax[1],ax[2])||1;
  for(let w=0;w<3;w++)if(Math.abs(ax[w]/L)>0.99999)return {w,sg:ax[w]>0?1:-1};
  return null;
}
function faoEngCarve(E,a,b,r,cr,tp,ax){
  // Un segment de coupe, quel que soit le moteur. Outil parallèle à un axe (vertical, ou 3+2 à 90°) :
  // calcul exact dans le repère permuté de l'outil, par pas « à hauteur constante » le long de l'axe ;
  // outil oblique : positions échantillonnées le long du segment.
  const T=faoEngTool(r,cr,tp),al=faoEngAxis(ax);
  if(al){
    const w=al.w,U=FAO_DEX_UV[w][0],V=FAO_DEX_UV[w][1],ca=[a.x,a.y,a.z],cb=[b.x,b.y,b.z];
    const dw=Math.abs(cb[w]-ca[w]),st=Math.max(0.02,E.p/4),n=dw>st?Math.min(400,Math.ceil(dw/st)):1;
    for(let s=0;s<n;s++){const t0=s/n,t1=(s+1)/n;
      const u0=ca[U]+(cb[U]-ca[U])*t0,v0=ca[V]+(cb[V]-ca[V])*t0,w0=ca[w]+(cb[w]-ca[w])*t0;
      const u1=ca[U]+(cb[U]-ca[U])*t1,v1=ca[V]+(cb[V]-ca[V])*t1,w1=ca[w]+(cb[w]-ca[w])*t1;
      E.flat(w,al.sg,u0,v0,u1,v1,al.sg>0?Math.min(w0,w1):Math.max(w0,w1),T);}
    return;
  }
  let A=ax.slice();const L=Math.hypot(A[0],A[1],A[2])||1;A=A.map(q=>q/L);
  const d=[b.x-a.x,b.y-a.y,b.z-a.z],dl=Math.hypot(d[0],d[1],d[2]),da=dl>1e-12?(d[0]*A[0]+d[1]*A[1]+d[2]*A[2])/dl:1;
  if(dl<1e-9||Math.abs(Math.abs(da)-1)<1e-9){const P=da>=0?[a.x,a.y,a.z]:[b.x,b.y,b.z];E.tilt(P,A,T);return;} // plongée : le bout le plus profond
  const n=Math.max(1,Math.min(400,Math.ceil(dl/Math.max(0.05,E.p*0.5))));
  for(let s=0;s<=n;s++){const f=s/n;E.tilt([a.x+d[0]*f,a.y+d[1]*f,a.z+d[2]*f],A,T);}
}
/* ═══════════════ TRI-DEXEL ═══════════════ */
const FAO_DEX_UV=[[1,2],[0,2],[0,1]]; // axes de la grille de chaque famille de rayons (k = 0 : le long de X…)
function faoEngStockIv(s,k,u,v,cu,cv,p){
  // intervalles de matière du brut le long du rayon k passant par (cu, cv) — boîte, cylindre, corps
  const lo=[+s.x0,+s.y0,+s.z0],hi=[+s.x1,+s.y1,+s.z1];
  if(cu<lo[u]||cu>hi[u]||cv<lo[v]||cv>hi[v])return [];
  let a=lo[k],b=hi[k];
  const C=s.cyl;
  if(C&&C.r>0&&Array.isArray(C.c)){
    const ai={x:0,y:1,z:2}[C.axis];
    if(ai!=null){
      const c=[+C.c[0]||0,+C.c[1]||0,+C.c[2]||0];
      if(ai===k){const d2=(cu-c[u])*(cu-c[u])+(cv-c[v])*(cv-c[v]);if(d2>C.r*C.r)return [];}
      else{const m=(u===ai)?v:u,cm=(m===u)?cu:cv,q=C.r*C.r-(cm-c[m])*(cm-c[m]);if(q<0)return [];
        const sq=Math.sqrt(q);a=Math.max(a,c[k]-sq);b=Math.min(b,c[k]+sq);if(a>=b)return [];}
    }
  }
  const top=s._top;
  if(top){
    if(k===2){b=Math.min(b,top(cu,cv));return b>a?[a,b]:[];}
    const out=[],st=Math.max(0.05,p/2);let inn=false,s0=a;
    for(let x=a;x<=b+1e-9;x+=st){const X=k===0?x:cu,Y=k===1?x:cu,ok=cv<=top(X,Y);
      if(ok&&!inn){inn=true;s0=x;}else if(!ok&&inn){inn=false;out.push(s0,x);}}
    if(inn)out.push(s0,b);
    return out;
  }
  return [a,b];
}
function faoEngStockTop(s,p){
  try{const T=(s&&s.solid!=null&&typeof faoStockTop==='function')?faoStockTop(faoSetup(),Math.max(0.5,p*0.5)):null;
    if(T)return (x,y)=>{const t=T.at(x,y);return t>-1/0?t:+s.z0;};}catch(e){}
  return null;
}
function faoDexCreate(s,p){
  const lo=[+s.x0,+s.y0,+s.z0],hi=[+s.x1,+s.y1,+s.z1];
  const n=[0,1,2].map(i=>Math.max(1,Math.ceil((hi[i]-lo[i])/p-1e-9)));
  const sx=Object.assign({},s,{_top:faoEngStockTop(s,p)});
  const D={kind:'dexel',p,lo,hi,n,L:[null,null,null],ver:0,rays:0};
  for(let k=0;k<3;k++){
    const u=FAO_DEX_UV[k][0],v=FAO_DEX_UV[k][1],nu=n[u],nv=n[v],A=new Array(nu*nv);
    for(let jv=0;jv<nv;jv++)for(let iu=0;iu<nu;iu++)A[jv*nu+iu]=faoEngStockIv(sx,k,u,v,lo[u]+(iu+0.5)*p,lo[v]+(jv+0.5)*p,p);
    D.L[k]=A;D.rays+=A.length;
  }
  D.flat=(w,sg,au,av,bu,bv,tc,T)=>faoDexCarveFlat(D,w,sg,au,av,bu,bv,tc,T);
  D.tilt=(P,A,T)=>faoDexCarveTilt(D,s,P,A,T);
  return D;
}
function faoDexSub(arr,a,b){
  // retire [a, b] des intervalles triés arr → nouveau tableau, ou arr inchangé
  const n=arr.length;if(!n||b<=arr[0]||a>=arr[n-1]||b-a<1e-9)return arr;
  let ch=false;const out=[];
  for(let i=0;i<n;i+=2){const s=arr[i],e=arr[i+1];
    if(e<=a||s>=b){out.push(s,e);continue;}
    ch=true;if(s<a-1e-6)out.push(s,a);if(e>b+1e-6)out.push(b,e);}
  return ch?out:arr;
}
function faoDexRange(lo,p,n,a,b){ // cellules dont le centre est dans [a, b]
  let i0=Math.ceil((a-lo)/p-0.5),i1=Math.floor((b-lo)/p-0.5);if(i0<0)i0=0;if(i1>n-1)i1=n-1;return [i0,i1];
}
function faoDexCarveFlat(D,w,sg,au,av,bu,bv,tc,T){
  // outil parallèle à l'axe w (corps du côté sg), pointe à la cote tc, déplacé de (au, av) à (bu, bv)
  // dans le plan (U, V) des deux autres axes. Rayons le long de w : dessous de l'outil au rayon ρ ;
  // rayons le long de U ou V : gélule de rayon rmax(h) à chaque couche h.
  const p=D.p,lo=D.lo,n=D.n,r=T.r,BIG=1e9,U=FAO_DEX_UV[w][0],V=FAO_DEX_UV[w][1];let ch=false;
  const ur=faoDexRange(lo[U],p,n[U],Math.min(au,bu)-r,Math.max(au,bu)+r),vr=faoDexRange(lo[V],p,n[V],Math.min(av,bv)-r,Math.max(av,bv)+r);
  if(ur[0]>ur[1]||vr[0]>vr[1])return;
  const ii=[0,0,0],idx=k=>{const q=FAO_DEX_UV[k];return ii[q[1]]*n[q[0]]+ii[q[0]];};
  // rayons le long de l'axe de l'outil
  const LW=D.L[w];let ext=sg>0?-Infinity:Infinity; // matière la plus haute (côté corps) sous l'outil : borne des couches
  for(let j=vr[0];j<=vr[1];j++){const cv=lo[V]+(j+0.5)*p;ii[V]=j;
    for(let i=ur[0];i<=ur[1];i++){const cu=lo[U]+(i+0.5)*p,d2=faoEngSegD2(cu,cv,au,av,bu,bv);if(d2>r*r)continue;ii[U]=i;
      const c=idx(w),o=LW[c];if(!o.length)continue;const hm=T.hmin(Math.sqrt(d2));
      if(sg>0){if(o[o.length-1]>ext)ext=o[o.length-1];}else if(o[0]<ext)ext=o[0];
      const nw=sg>0?faoDexSub(o,tc+hm,BIG):faoDexSub(o,-BIG,tc-hm);if(nw!==o){LW[c]=nw;ch=true;}}}
  // couches le long de w (du côté du corps)
  if(ext===Infinity||ext===-Infinity){if(ch)D.ver++;return;} // plus de matière sous l'outil
  const wr=sg>0?faoDexRange(lo[w],p,n[w],tc+T.h0,ext+p):faoDexRange(lo[w],p,n[w],ext-p,tc-T.h0);
  if(wr[0]<=wr[1]){
    const LU=D.L[U],LV=D.L[V],cU=[0,0],cV=[0,0];
    // au-dessus du profil de pointe, le rayon est r à toutes les couches : cordes calculées une fois
    const fullU=new Array(vr[1]-vr[0]+1),fullV=new Array(ur[1]-ur[0]+1);
    for(let j=vr[0];j<=vr[1];j++){const c=[0,0];fullU[j-vr[0]]=faoStadX(au,av,bu,bv,r,lo[V]+(j+0.5)*p,c)?c:null;}
    for(let i=ur[0];i<=ur[1];i++){const c=[0,0];fullV[i-ur[0]]=faoStadX(av,au,bv,bu,r,lo[U]+(i+0.5)*p,c)?c:null;}
    for(let l=wr[0];l<=wr[1];l++){const h=sg*(lo[w]+(l+0.5)*p-tc),R=T.rmax(h);if(R<0)continue;ii[w]=l;const top=h>=T.htop;
      for(let j=vr[0];j<=vr[1];j++){ii[V]=j;const c=idx(U),o=LU[c];if(!o.length)continue;
        let ck=null;if(top)ck=fullU[j-vr[0]];else if(faoStadX(au,av,bu,bv,R,lo[V]+(j+0.5)*p,cU))ck=cU;if(!ck)continue;
        const nw=faoDexSub(o,ck[0],ck[1]);if(nw!==o){LU[c]=nw;ch=true;}}
      for(let i=ur[0];i<=ur[1];i++){ii[U]=i;const c=idx(V),o=LV[c];if(!o.length)continue;
        let ck=null;if(top)ck=fullV[i-ur[0]];else if(faoStadX(av,au,bv,bu,R,lo[U]+(i+0.5)*p,cV))ck=cV;if(!ck)continue;
        const nw=faoDexSub(o,ck[0],ck[1]);if(nw!==o){LV[c]=nw;ch=true;}}
    }
  }
  if(ch)D.ver++;
}
function faoEngRayTool(k,u,v,cu,cv,P,A,T,H){
  // rayon le long de l'axe k (coordonnée s), passant par (cu, cv) ∩ outil (pointe P, axe A, corps H)
  // → [s0, s1] ou null. L'outil est convexe : l'intersection est un seul intervalle.
  const w=[0,0,0];w[k]=-P[k];w[u]=cu-P[u];w[v]=cv-P[v];
  const ak=A[k],h0=w[0]*A[0]+w[1]*A[1]+w[2]*A[2],ww=w[0]*w[0]+w[1]*w[1]+w[2]*w[2],r=T.r;
  const qa=1-ak*ak;
  if(qa<1e-9){const rho=Math.sqrt(Math.max(0,ww-h0*h0));if(rho>r)return null;
    let sa=(T.hmin(rho)-h0)/ak,sb=(H-h0)/ak;if(sa>sb){const t=sa;sa=sb;sb=t;}return sa<sb?[sa,sb]:null;}
  const qb=2*(w[k]-h0*ak),qc=ww-h0*h0-r*r,disc=qb*qb-4*qa*qc;if(disc<0)return null;
  const sq=Math.sqrt(disc);let s0=(-qb-sq)/(2*qa),s1=(-qb+sq)/(2*qa);
  if(Math.abs(ak)>1e-12){const sh=(H-h0)/ak;if(ak>0){if(sh<s1)s1=sh;}else if(sh>s0)s0=sh;}else if(h0>H)return null;
  if(!(s1>s0))return null;
  const g=s=>{const h=h0+s*ak,r2=ww+2*s*w[k]+s*s-h*h;return h-T.hmin(Math.sqrt(r2>0?r2:0));};
  let best=-Infinity,sb=s0;
  for(let i=0;i<=16;i++){const s=s0+(s1-s0)*i/16,gv=g(s);if(gv>best){best=gv;sb=s;}}
  if(best<0)return null;
  let L=s0,R=s1;
  if(g(s0)<0){let a=s0,b=sb;for(let i=0;i<14;i++){const m=(a+b)/2;if(g(m)>=0)b=m;else a=m;}L=b;}
  if(g(s1)<0){let a=sb,b=s1;for(let i=0;i<14;i++){const m=(a+b)/2;if(g(m)>=0)a=m;else b=m;}R=a;}
  return R>L?[L,R]:null;
}
function faoDexCarveTilt(D,s,P,A,T){
  // outil incliné (3+2) : une position de l'outil (pointe P, axe A), corps jusqu'à la sortie du brut
  const p=D.p,lo=D.lo,n=D.n,r=T.r,H=faoEngExitH(s,P,A,r);
  const Q=[P[0]+A[0]*H,P[1]+A[1]*H,P[2]+A[2]*H],bmin=[0,1,2].map(i=>Math.min(P[i],Q[i])-r),bmax=[0,1,2].map(i=>Math.max(P[i],Q[i])+r);
  let ch=false;
  for(let k=0;k<3;k++){const u=FAO_DEX_UV[k][0],v=FAO_DEX_UV[k][1],Lk=D.L[k];
    const ur=faoDexRange(lo[u],p,n[u],bmin[u],bmax[u]),vr=faoDexRange(lo[v],p,n[v],bmin[v],bmax[v]);
    for(let jv=vr[0];jv<=vr[1];jv++){const cv=lo[v]+(jv+0.5)*p;
      for(let iu=ur[0];iu<=ur[1];iu++){const cu=lo[u]+(iu+0.5)*p,c=jv*n[u]+iu,o=Lk[c];if(!o.length)continue;
        const I=faoEngRayTool(k,u,v,cu,cv,P,A,T,H);if(!I)continue;
        const nw=faoDexSub(o,I[0],I[1]);if(nw!==o){Lk[c]=nw;ch=true;}}}}
  if(ch)D.ver++;
}
function faoDexVolume(D,k){
  // volume de matière vu par la famille k (mm³) — contrôle et comparaison des moteurs
  k=k==null?2:k;let s=0;const L=D.L[k];
  for(let i=0;i<L.length;i++){const a=L[i];for(let j=0;j<a.length;j+=2)s+=a[j+1]-a[j];}
  return s*D.p*D.p;
}
/* rendu : une facette carrée (côté p) par extrémité d'intervalle, normale lissée par les voisins */
const FAO_DEX_VS=[
  'attribute vec3 iPos; attribute vec3 iNrm; attribute float iK; uniform float dexP;',
  'vec3 dP; vec3 dN;',
  'void faoDexQ(){',
  '  int k=int(iK+0.5); float sg=1.0; if(k>2){k-=3; sg=-1.0;}',
  '  vec3 eu=(k==0)?vec3(0.0,1.0,0.0):vec3(1.0,0.0,0.0); vec3 ev=(k==2)?vec3(0.0,1.0,0.0):vec3(0.0,0.0,1.0);',
  '  float f=((k==1)?-1.0:1.0)*sg;',
  '  dP=iPos+(position.x*f*eu+position.y*ev)*dexP*1.04; dN=iNrm;',
  '}'].join('\n');
let faoDexMat=null,faoDexU=null;
function faoDexMaterial(){
  if(faoDexMat)return faoDexMat;
  faoDexU={dexP:{value:0.4}};const U=faoDexU;
  const mat=faoMatterStyle(new THREE.MeshPhongMaterial({color:0x9c846a,side:THREE.FrontSide}));
  mat.onBeforeCompile=function(sh){Object.assign(sh.uniforms,U);
    sh.vertexShader=FAO_DEX_VS+'\n'+sh.vertexShader.replace('#include <beginnormal_vertex>','faoDexQ();\n vec3 objectNormal = dN;').replace('#include <begin_vertex>','vec3 transformed = dP;');};
  mat.customProgramCacheKey=function(){return 'faoDex';};
  faoDexMat=mat;return mat;
}
function faoDexNear(arr,e,sg,p){
  // extrémité de même sens la plus proche de e dans un rayon voisin (à moins de 2 p), ou NaN
  if(!arr||!arr.length)return NaN;let best=NaN,bd=2*p;
  for(let j=(sg>0?1:0);j<arr.length;j+=2){const d=Math.abs(arr[j]-e);if(d<bd){bd=d;best=arr[j];}}
  return best;
}
function faoDexArrays(D){
  // tableaux d'instances : position, normale, famille (+3 = entrée de matière)
  const p=D.p,lo=D.lo,n=D.n;let cnt=0;
  for(let k=0;k<3;k++){const L=D.L[k];for(let i=0;i<L.length;i++)cnt+=L[i].length;}
  const pos=new Float32Array(cnt*3),nrm=new Float32Array(cnt*3),kk=new Float32Array(cnt);let o=0;
  for(let k=0;k<3;k++){const u=FAO_DEX_UV[k][0],v=FAO_DEX_UV[k][1],nu=n[u],nv=n[v],L=D.L[k];
    for(let jv=0;jv<nv;jv++)for(let iu=0;iu<nu;iu++){const a=L[jv*nu+iu];if(!a.length)continue;
      const cu=lo[u]+(iu+0.5)*p,cv=lo[v]+(jv+0.5)*p;
      const Lm=iu>0?L[jv*nu+iu-1]:null,Lp=iu<nu-1?L[jv*nu+iu+1]:null,Lb=jv>0?L[(jv-1)*nu+iu]:null,Lt=jv<nv-1?L[(jv+1)*nu+iu]:null;
      for(let j=0;j<a.length;j++){const e=a[j],sg=(j&1)?1:-1;
        // pente le long de u et de v (différences centrées, sinon d'un côté)
        const em=faoDexNear(Lm,e,sg,p),ep=faoDexNear(Lp,e,sg,p),eb=faoDexNear(Lb,e,sg,p),et=faoDexNear(Lt,e,sg,p);
        let du=0,dv=0;
        if(ep===ep&&em===em)du=(ep-em)/(2*p);else if(ep===ep)du=(ep-e)/p;else if(em===em)du=(e-em)/p;
        if(et===et&&eb===eb)dv=(et-eb)/(2*p);else if(et===et)dv=(et-e)/p;else if(eb===eb)dv=(e-eb)/p;
        const N=[0,0,0];N[u]=-du*sg;N[v]=-dv*sg;N[k]=sg;const l=Math.hypot(N[0],N[1],N[2])||1;
        const P=[0,0,0];P[u]=cu;P[v]=cv;P[k]=e;
        pos[o*3]=P[0];pos[o*3+1]=P[1];pos[o*3+2]=P[2];nrm[o*3]=N[0]/l;nrm[o*3+1]=N[1]/l;nrm[o*3+2]=N[2]/l;kk[o]=k+(sg<0?3:0);o++;}
    }}
  return {pos,nrm,kk,count:o};
}
function faoDexMeshBuild(E){
  const D=E.D,A=faoDexArrays(D);
  const geo=new THREE.InstancedBufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,-.5,0,.5,.5,0,-.5,.5,0]),3));
  geo.setAttribute('iPos',new THREE.InstancedBufferAttribute(A.pos,3));
  geo.setAttribute('iNrm',new THREE.InstancedBufferAttribute(A.nrm,3));
  geo.setAttribute('iK',new THREE.InstancedBufferAttribute(A.kk,1));
  geo.instanceCount=A.count;
  const mat=faoDexMaterial();faoDexU.dexP.value=D.p;
  const mesh=new THREE.Mesh(geo,mat);mesh.name='faoMatterDexel';mesh.raycast=function(){};mesh.frustumCulled=false;
  E.facets=A.count;
  return mesh;
}
/* ═══════════════ CHAMP DE DISTANCE ═══════════════ */
const FAO_SDF_C=16; // cellules par bloc et par axe (maillage refait par blocs)
function faoSdfCreate(s,p){
  const m=2,lo=[+s.x0-m*p,+s.y0-m*p,+s.z0-m*p],hi=[+s.x1+m*p,+s.y1+m*p,+s.z1+m*p];
  const n=[0,1,2].map(i=>Math.max(2,Math.ceil((hi[i]-lo[i])/p)+1));
  const N=n[0]*n[1]*n[2],F=new Float32Array(N),TR=4*p;
  const c=[(+s.x0+ +s.x1)/2,(+s.y0+ +s.y1)/2,(+s.z0+ +s.z1)/2],hh=[(+s.x1- +s.x0)/2,(+s.y1- +s.y0)/2,(+s.z1- +s.z0)/2];
  const top=faoEngStockTop(s,p),C=s.cyl,ai=C&&C.r>0&&Array.isArray(C.c)?{x:0,y:1,z:2}[C.axis]:null;
  const cc=ai!=null?[+C.c[0]||0,+C.c[1]||0,+C.c[2]||0]:null;
  for(let k=0;k<n[2];k++){const z=lo[2]+k*p;for(let j=0;j<n[1];j++){const y=lo[1]+j*p;for(let i=0;i<n[0];i++){const x=lo[0]+i*p;
    const qx=Math.abs(x-c[0])-hh[0],qy=Math.abs(y-c[1])-hh[1],qz=Math.abs(z-c[2])-hh[2];
    let d=Math.hypot(Math.max(qx,0),Math.max(qy,0),Math.max(qz,0))+Math.min(Math.max(qx,qy,qz),0);
    if(cc){const P=[x,y,z],a=(ai+1)%3,b=(ai+2)%3;d=Math.max(d,Math.hypot(P[a]-cc[a],P[b]-cc[b])-C.r);}
    if(top)d=Math.max(d,z-top(x,y));
    F[(k*n[1]+j)*n[0]+i]=d>TR?TR:(d<-TR?-TR:d);}}}
  const S={kind:'sdf',p,lo,hi,n,F,TR,ver:0,nch:[0,1,2].map(i=>Math.ceil((n[i]-1)/FAO_SDF_C)),dirty:new Set(),all:true};
  S.flat=(w,sg,au,av,bu,bv,tc,T)=>faoSdfCarveFlat(S,w,sg,au,av,bu,bv,tc,T);
  S.tilt=(P,A,T)=>faoSdfCarveTilt(S,s,P,A,T);
  return S;
}
function faoSdfToolTable(T,p,TR){
  // distance signée au profil de l'outil dans le plan (ρ, h), tabulée au pas p/4 (négative dedans)
  if(T.sdfT&&T.sdfT.p===p)return T.sdfT;
  const q=p/4,R=T.r,nr=Math.ceil((R+TR)/q)+2,h0=-TR,nh=Math.ceil((T.htop+2*TR)/q)+2,tab=new Float32Array(nr*nh);
  const pts=[];for(let i=0;i<=T.N;i++)pts.push([R*i/T.N,T.hs[i]]);pts.push([R,T.htop+1e6]); // dessous puis paroi
  for(let jh=0;jh<nh;jh++){const h=h0+jh*q;for(let ir=0;ir<nr;ir++){const rho=ir*q;
    let dm=Infinity;
    for(let m=0;m<pts.length-1;m++){const a=pts[m],b=pts[m+1],dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy;
      let t=L2>0?((rho-a[0])*dx+(h-a[1])*dy)/L2:0;t=t<0?0:(t>1?1:t);const ex=a[0]+dx*t-rho,ey=a[1]+dy*t-h,d=ex*ex+ey*ey;if(d<dm)dm=d;}
    dm=Math.sqrt(dm);const inside=rho<=R&&h>=T.hmin(rho);tab[jh*nr+ir]=inside?-dm:dm;}}
  T.sdfT={p,q,nr,nh,h0,tab,R,htop:T.htop};return T.sdfT;
}
function faoSdfToolD(S,rho,h,TR){
  const q=S.q;if(rho>S.R+TR||h<S.h0)return TR;
  if(h>S.htop+TR){const d=rho-S.R;return d>TR?TR:d;}
  const fr=rho/q,fh=(h-S.h0)/q,ir=Math.min(S.nr-2,Math.floor(fr)),jh=Math.min(S.nh-2,Math.floor(fh)),tr=fr-ir,th=fh-jh,t=S.tab,o=jh*S.nr+ir;
  return (t[o]*(1-tr)+t[o+1]*tr)*(1-th)+(t[o+S.nr]*(1-tr)+t[o+S.nr+1]*tr)*th;
}
function faoSdfMark(S,i0,i1,j0,j1,k0,k1){
  // blocs dont le maillage doit être refait (un échantillon de marge : cellules et arêtes voisines)
  const C=FAO_SDF_C,f=(a,m)=>Math.max(0,Math.min(m-1,Math.floor(a/C)));
  const a0=f(i0-1,S.nch[0]),a1=f(i1+1,S.nch[0]),b0=f(j0-1,S.nch[1]),b1=f(j1+1,S.nch[1]),c0=f(k0-1,S.nch[2]),c1=f(k1+1,S.nch[2]);
  for(let c=c0;c<=c1;c++)for(let b=b0;b<=b1;b++)for(let a=a0;a<=a1;a++)S.dirty.add((c*S.nch[1]+b)*S.nch[0]+a);
}
function faoSdfCarveFlat(S,w,sg,au,av,bu,bv,tc,T){
  // outil parallèle à l'axe w (corps du côté sg) : distance au profil évaluée en (ρ dans le plan (U, V), h le long de w)
  const p=S.p,lo=S.lo,n=S.n,F=S.F,TR=S.TR,r=T.r,tt=faoSdfToolTable(T,p,TR),e=r+TR,U=FAO_DEX_UV[w][0],V=FAO_DEX_UV[w][1];
  const st=[1,n[0],n[0]*n[1]];
  const rg=(ax,a,b)=>[Math.max(0,Math.floor((a-lo[ax])/p)),Math.min(n[ax]-1,Math.ceil((b-lo[ax])/p))];
  const I=rg(U,Math.min(au,bu)-e,Math.max(au,bu)+e),J=rg(V,Math.min(av,bv)-e,Math.max(av,bv)+e);
  const K=sg>0?rg(w,tc+T.h0-TR,1e9):rg(w,-1e9,tc-T.h0+TR);
  if(I[0]>I[1]||J[0]>J[1]||K[0]>K[1])return;
  let ch=false;
  for(let j=J[0];j<=J[1];j++){const cv=lo[V]+j*p;for(let i=I[0];i<=I[1];i++){const cu=lo[U]+i*p,rho=Math.sqrt(faoEngSegD2(cu,cv,au,av,bu,bv));
    if(rho>e)continue;let o=i*st[U]+j*st[V]+K[0]*st[w];
    for(let k=K[0];k<=K[1];k++,o+=st[w]){const dt=faoSdfToolD(tt,rho,sg*(lo[w]+k*p-tc),TR);if(dt>=TR)continue;
      const nd=-dt;if(nd>F[o]){F[o]=nd>TR?TR:nd;ch=true;}}}}
  if(ch){S.ver++;const b=[[0,0],[0,0],[0,0]];b[U]=I;b[V]=J;b[w]=K;faoSdfMark(S,b[0][0],b[0][1],b[1][0],b[1][1],b[2][0],b[2][1]);}
}
function faoSdfCarveTilt(S,s,P,A,T){
  const p=S.p,lo=S.lo,n=S.n,F=S.F,TR=S.TR,r=T.r,tt=faoSdfToolTable(T,p,TR),H=faoEngExitH(s,P,A,r),e=r+TR;
  const Q=[P[0]+A[0]*H,P[1]+A[1]*H,P[2]+A[2]*H];
  const rg=i=>[Math.max(0,Math.floor((Math.min(P[i],Q[i])-e-lo[i])/p)),Math.min(n[i]-1,Math.ceil((Math.max(P[i],Q[i])+e-lo[i])/p))];
  const I=rg(0),J=rg(1),K=rg(2);if(I[0]>I[1]||J[0]>J[1]||K[0]>K[1])return;
  let ch=false;
  for(let k=K[0];k<=K[1];k++){const wz=lo[2]+k*p-P[2];for(let j=J[0];j<=J[1];j++){const wy=lo[1]+j*p-P[1];let o=(k*n[1]+j)*n[0]+I[0];
    for(let i=I[0];i<=I[1];i++,o++){const wx=lo[0]+i*p-P[0],h=wx*A[0]+wy*A[1]+wz*A[2];if(h>H+TR)continue;
      const r2=wx*wx+wy*wy+wz*wz-h*h,rho=Math.sqrt(r2>0?r2:0);if(rho>e)continue;
      const dt=faoSdfToolD(tt,rho,h,TR);if(dt>=TR)continue;const nd=-dt;if(nd>F[o]){F[o]=nd>TR?TR:nd;ch=true;}}}}
  if(ch){S.ver++;faoSdfMark(S,I[0],I[1],J[0],J[1],K[0],K[1]);}
}
function faoSdfVolume(S){
  // volume de matière (mm³) : fraction pleine de chaque échantillon d'après la distance
  let v=0;const F=S.F,p=S.p;for(let i=0;i<F.length;i++){const f=0.5-F[i]/p;v+=f<0?0:(f>1?1:f);}return v*p*p*p;
}
function faoSdfChunk(S,ca,cb,cc){
  // « surface nets » sur un bloc : un sommet par cellule traversée (moyenne des points de passage
  // sur ses arêtes), un quadrilatère par arête d'échantillons qui change de signe
  const C=FAO_SDF_C,n=S.n,F=S.F,p=S.p,lo=S.lo,nx=n[0],nxy=n[0]*n[1];
  const i0=ca*C,i1=Math.min((ca+1)*C,n[0]-1),j0=cb*C,j1=Math.min((cb+1)*C,n[1]-1),k0=cc*C,k1=Math.min((cc+1)*C,n[2]-1);
  const vmap=new Map(),pos=[],nrm=[],idx=[];
  const val=(i,j,k)=>F[(k*n[1]+j)*nx+i];
  const vert=(i,j,k)=>{ // sommet de la cellule (i, j, k) — cellules 0 … n−2
    if(i<0||j<0||k<0||i>n[0]-2||j>n[1]-2||k>n[2]-2)return -1;
    const key=(k*n[1]+j)*nx+i;let id=vmap.get(key);if(id!==undefined)return id;
    const v=[];for(let c=0;c<8;c++)v.push(val(i+(c&1),j+((c>>1)&1),k+((c>>2)&1)));
    let sx=0,sy=0,sz=0,cnt=0;
    const E=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
    for(let e=0;e<12;e++){const a=E[e][0],b=E[e][1],va=v[a],vb=v[b];if((va<0)===(vb<0))continue;
      const t=va/(va-vb);sx+=(a&1)+((b&1)-(a&1))*t;sy+=((a>>1)&1)+(((b>>1)&1)-((a>>1)&1))*t;sz+=((a>>2)&1)+(((b>>2)&1)-((a>>2)&1))*t;cnt++;}
    if(!cnt){vmap.set(key,-1);return -1;}
    id=pos.length/3;pos.push(lo[0]+(i+sx/cnt)*p,lo[1]+(j+sy/cnt)*p,lo[2]+(k+sz/cnt)*p);
    const gx=(v[1]+v[3]+v[5]+v[7])-(v[0]+v[2]+v[4]+v[6]),gy=(v[2]+v[3]+v[6]+v[7])-(v[0]+v[1]+v[4]+v[5]),gz=(v[4]+v[5]+v[6]+v[7])-(v[0]+v[1]+v[2]+v[3]);
    const l=Math.hypot(gx,gy,gz)||1;nrm.push(gx/l,gy/l,gz/l);vmap.set(key,id);return id;};
  const quad=(a,b,c,d,flip)=>{if(a<0||b<0||c<0||d<0)return;if(flip)idx.push(a,d,c,a,c,b);else idx.push(a,b,c,a,c,d);};
  for(let k=k0;k<k1;k++)for(let j=j0;j<j1;j++)for(let i=i0;i<i1;i++){
    const f0=val(i,j,k),in0=f0<0;
    if(i+1<n[0]&&j>0&&k>0&&((val(i+1,j,k)<0)!==in0))quad(vert(i,j-1,k-1),vert(i,j,k-1),vert(i,j,k),vert(i,j-1,k),!in0);
    if(j+1<n[1]&&i>0&&k>0&&((val(i,j+1,k)<0)!==in0))quad(vert(i-1,j,k-1),vert(i-1,j,k),vert(i,j,k),vert(i,j,k-1),!in0);
    if(k+1<n[2]&&i>0&&j>0&&((val(i,j,k+1)<0)!==in0))quad(vert(i-1,j-1,k),vert(i,j-1,k),vert(i,j,k),vert(i-1,j,k),!in0);
  }
  return {pos,nrm,idx};
}
let faoSdfMat=null;
function faoSdfMaterial(){if(!faoSdfMat)faoSdfMat=faoMatterStyle(new THREE.MeshPhongMaterial({color:0x9c846a,side:THREE.FrontSide}));return faoSdfMat;}
function faoSdfMeshSync(E){
  // blocs sales refaits (tous au premier passage) dans le groupe E.group
  const S=E.D,list=S.all?null:[...S.dirty];S.all=false;S.dirty.clear();
  const todo=list||(()=>{const a=[];for(let c=0;c<S.nch[2];c++)for(let b=0;b<S.nch[1];b++)for(let q=0;q<S.nch[0];q++)a.push((c*S.nch[1]+b)*S.nch[0]+q);return a;})();
  const mat=faoSdfMaterial();
  todo.forEach(id=>{
    const ca=id%S.nch[0],cb=Math.floor(id/S.nch[0])%S.nch[1],cc=Math.floor(id/(S.nch[0]*S.nch[1]));
    const R=faoSdfChunk(S,ca,cb,cc),old=E.chunks.get(id);
    if(old){E.group.remove(old);try{old.geometry.dispose();}catch(e){}E.chunks.delete(id);E.tris-=old.userData.tris||0;}
    if(!R.idx.length)return;
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(R.pos),3));
    g.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(R.nrm),3));
    g.setIndex(new THREE.BufferAttribute(R.pos.length/3>65535?new Uint32Array(R.idx):new Uint16Array(R.idx),1));
    const m=new THREE.Mesh(g,mat);m.raycast=function(){};m.frustumCulled=false;m.userData.tris=R.idx.length/3;
    E.group.add(m);E.chunks.set(id,m);E.tris+=m.userData.tris;
  });
}
/* ═══════════════ branchement dans la simulation ═══════════════ */
function faoEngPas(s){
  const cfg=(typeof faoDetailCfg!=='undefined'&&faoDetailCfg[faoViewerDetail])||{B:200000,F:0.4};
  const X=s.x1-s.x0,Y=s.y1-s.y0,Z=s.z1-s.z0,lv=+faoViewerDetail||0;
  if(faoSimEngine==='dexel'){const B=cfg.B*4,F=cfg.F*0.5;return Math.max(F,Math.sqrt((X*Y)/B));}
  const V=[1.5e6,6e6,14e6][Math.max(0,Math.min(2,lv))];return Math.max(cfg.F*0.5,Math.cbrt((X+0.8)*(Y+0.8)*(Z+0.8)/V));
}
function faoEngEnable(vw){
  // construit le moteur choisi, rattrape 0 → t, monte le maillage ; → nombre d'éléments suivis
  const s=faoStock();if(!faoStockValid(s))return 0;
  const t0=(typeof performance!=='undefined'?performance:Date).now();
  const p=faoEngPas(s),D=faoSimEngine==='dexel'?faoDexCreate(s,p):faoSdfCreate(s,p);
  const E={kind:D.kind,D,p,stock:s,group:null,mesh:null,chunks:new Map(),tris:0,facets:0,shown:-1,timer:null,stats:{}};
  vw.eng=E;vw.vox=false;vw.cav=null;
  if(vw.t>0)faoEngSegments(vw,null,(a,b,r,cr,tp,ax)=>faoEngCarve(D,a,b,r,cr,tp,ax));
  const t1=(typeof performance!=='undefined'?performance:Date).now();
  faoEngRefresh(vw,true);
  const t2=(typeof performance!=='undefined'?performance:Date).now();
  E.stats={pas:p,carveMs:Math.round(t1-t0),meshMs:Math.round(t2-t1),
    cells:D.kind==='dexel'?D.rays:D.n[0]*D.n[1]*D.n[2],elems:D.kind==='dexel'?E.facets:E.tris,
    mo:Math.round((D.kind==='dexel'?E.facets*28+D.rays*40:D.F.length*4+E.tris*30)/1e6)};
  vw.mPos=null;
  faoViewerMatterHideBodies(vw);
  try{faoViewerMsg('Simulation, moteur '+FAO_ENGINES[faoSimEngine]+' : pas '+p.toFixed(2)+' mm, '+(E.stats.cells/1000).toFixed(0)+' k '+(D.kind==='dexel'?'rayons':'échantillons')+
    ', '+(E.stats.elems/1000).toFixed(0)+' k '+(D.kind==='dexel'?'facettes':'triangles')+', taille '+(E.stats.carveMs/1000).toFixed(1)+' s + maillage '+(E.stats.meshMs/1000).toFixed(1)+' s, ~'+E.stats.mo+' Mo.');}catch(e){}
  return E.stats.cells;
}
function faoEngRefresh(vw,force){
  // maillage remis à jour — au plus ~7 fois par seconde pendant la lecture, toujours à la fin
  const E=vw&&vw.eng;if(!E||typeof THREE==='undefined')return;
  const now=(typeof performance!=='undefined'?performance:Date).now();
  if(!force&&E.last&&now-E.last<140){if(!E.timer)E.timer=setTimeout(()=>{E.timer=null;faoEngRefresh(vw,true);},150);return;}
  E.last=now;
  try{
    if(E.kind==='dexel'){
      if(E.shown===E.D.ver&&E.mesh)return;
      const m=faoDexMeshBuild(E);
      if(E.mesh){try{faoDel3D(E.mesh);E.mesh.geometry.dispose();}catch(e){}}
      E.mesh=m;E.shown=E.D.ver;if(typeof scene!=='undefined'&&scene)faoAdd3D(m);vw.matter=m;
    }else{
      if(!E.group){E.group=new THREE.Group();E.group.name='faoMatterSdf';if(typeof scene!=='undefined'&&scene)faoAdd3D(E.group);vw.matter=E.group;}
      if(E.D.all||E.D.dirty.size)faoSdfMeshSync(E);
    }
  }catch(e){try{console.warn('moteur de simulation',e);}catch(e2){}}
}
function faoEngStep(vw,p){
  const E=vw.eng;if(!E)return;
  const mi=(vw.mPos&&isFinite(+vw.mPos.i))?Math.round(+vw.mPos.i):-1;
  const cut=(a,b,r,cr,tp,ax)=>faoEngCarve(E.D,a,b,r,cr,tp,ax);
  if(mi>=0&&mi<=p.i)faoEngSegments(vw,{i:mi,x:vw.mPos.x,y:vw.mPos.y,z:vw.mPos.z,p},cut);
  else if(mi<0)faoEngSegments(vw,null,cut);
  vw.mPos={x:p.x,y:p.y,z:p.z,i:p.i};
  faoEngRefresh(vw,false);
}
function faoEngDispose(vw){
  const E=vw&&vw.eng;if(!E)return;
  try{if(E.timer)clearTimeout(E.timer);}catch(e){}
  try{if(E.mesh){faoDel3D(E.mesh);E.mesh.geometry.dispose();}}catch(e){}
  try{if(E.group){faoDel3D(E.group);E.chunks.forEach(m=>{try{m.geometry.dispose();}catch(e){}});}}catch(e){}
  if(vw.matter===E.mesh||vw.matter===E.group)vw.matter=null;
  vw.eng=null;
}
