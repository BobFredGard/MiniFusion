// Esquisse 2D (6) : spline par points de passage — B-spline cubique exacte, poignées de tangence, tangences.
/* 2026-10-29 — Lot 1 de la spline 2D.
   Entité   {id,t:'spline',pts:[pid…],closed?:true} : la courbe PASSE par chaque point (points d'esquisse
            ordinaires : glisser, coïncidence, fixe, cotes entre points fonctionnent tels quels).
   Poignée  ligne de CONSTRUCTION {t:'line',construction:true,handle:<id spline>,p1:<point de passage>,p2:<bout>} :
            sa direction est la tangente de la courbe en p1, sa longueur la tension. Cotable (longueur, angle,
            H / V) comme toute ligne. Aux extrémités d'une spline ouverte, elle pointe VERS L'EXTÉRIEUR.
   Courbe   B-spline cubique bornée, non rationnelle ; paramètre = longueur de corde cumulée (mm).
            Nœud simple à un point de passage (C2), double à un point à poignée (C1). Conditions : passage par
            chaque point ; dérivée D = 3·(H−P)/Δ aux points à poignée (Δ : corde voisine, moyenne à l'intérieur) ;
            bout libre : dérivée seconde nulle ; fermée : C' et C'' égales aux deux bouts. Système carré
            résolu à chaque évaluation (quelques dizaines d'inconnues au plus).
   Le solveur ne voit QUE des points : la courbe n'entre dans aucun résidu. Tangence {type:'stangent',
   s:<spline>,p:<point de passage>,ent:<ligne | cercle | arc | spline>} : la poignée en p est alignée sur
   la tangente de l'autre courbe en p (p est commun aux deux, ou posé dessus).
   Le noyau reçoit les mêmes pôles et nœuds (Geom_BSplineCurve) : profil exact, pas une polyligne. */
const SK_SPL_DEG=3;
function bsSpan(n,p,u,U){ // n = nombre de pôles − 1 ; intervalle [U[s],U[s+1]) qui contient u (le dernier à droite)
  if(u>=U[n+1])return n;
  if(u<=U[p])return p;
  let lo=p,hi=n+1,mid=(lo+hi)>>1;
  while(u<U[mid]||u>=U[mid+1]){if(u<U[mid])hi=mid;else lo=mid;mid=(lo+hi)>>1;}
  return mid;
}
function bsDersBasis(i,u,p,nd,U){ // fonctions de base non nulles et dérivées (Piegl & Tiller, A2.3) : ders[k][j] = N⁽ᵏ⁾ de i−p+j
  const ndu=[],left=new Array(p+1).fill(0),right=new Array(p+1).fill(0);
  for(let j=0;j<=p;j++)ndu.push(new Array(p+1).fill(0));
  ndu[0][0]=1;
  for(let j=1;j<=p;j++){
    left[j]=u-U[i+1-j];right[j]=U[i+j]-u;let saved=0;
    for(let r=0;r<j;r++){ndu[j][r]=right[r+1]+left[j-r];const t=ndu[r][j-1]/ndu[j][r];ndu[r][j]=saved+right[r+1]*t;saved=left[j-r]*t;}
    ndu[j][j]=saved;
  }
  const ders=[];for(let k=0;k<=nd;k++)ders.push(new Array(p+1).fill(0));
  for(let j=0;j<=p;j++)ders[0][j]=ndu[j][p];
  const a=[new Array(p+1).fill(0),new Array(p+1).fill(0)];
  for(let r=0;r<=p;r++){
    let s1=0,s2=1;a[0][0]=1;
    for(let k=1;k<=nd;k++){
      let d=0;const rk=r-k,pk=p-k;
      if(r>=k){a[s2][0]=a[s1][0]/ndu[pk+1][rk];d=a[s2][0]*ndu[rk][pk];}
      const j1=rk>=-1?1:-rk,j2=(r-1<=pk)?k-1:p-r;
      for(let j=j1;j<=j2;j++){a[s2][j]=(a[s1][j]-a[s1][j-1])/ndu[pk+1][rk+j];d+=a[s2][j]*ndu[rk+j][pk];}
      if(r<=pk){a[s2][k]=-a[s1][k-1]/ndu[pk+1][r];d+=a[s2][k]*ndu[r][pk];}
      ders[k][r]=d;const t=s1;s1=s2;s2=t;
    }
  }
  let f=p;for(let k=1;k<=nd;k++){for(let j=0;j<=p;j++)ders[k][j]*=f;f*=(p-k);}
  return ders;
}
function bsEval(bs,u,nd){ // [C, C′, C″…] en u (nd dérivées ; au-delà du degré : nulles)
  const p=bs.p||SK_SPL_DEG,n=bs.P.length-1,nw=nd||0,nk=Math.min(nw,p);
  const s=bsSpan(n,p,u,bs.U),D=bsDersBasis(s,u,p,nk,bs.U),out=[];
  for(let k=0;k<=nk;k++){let x=0,y=0;for(let j=0;j<=p;j++){const q=bs.P[s-p+j];x+=D[k][j]*q[0];y+=D[k][j]*q[1];}out.push([x,y]);}
  while(out.length<=nw)out.push([0,0]);
  return out;
}
function bsSolve(A,bx,by){ // élimination de Gauss à pivot partiel (A carrée, deux seconds membres) ; null si singulière
  const n=A.length;
  for(let c=0;c<n;c++){
    let b=c,bv=Math.abs(A[c][c]);for(let r=c+1;r<n;r++){const v=Math.abs(A[r][c]);if(v>bv){bv=v;b=r;}}
    if(!(bv>1e-14))return null;
    if(b!==c){let t=A[b];A[b]=A[c];A[c]=t;t=bx[b];bx[b]=bx[c];bx[c]=t;t=by[b];by[b]=by[c];by[c]=t;}
    for(let r=c+1;r<n;r++){const f=A[r][c]/A[c][c];if(!f)continue;for(let k=c;k<n;k++)A[r][k]-=f*A[c][k];bx[r]-=f*bx[c];by[r]-=f*by[c];}
  }
  const x=new Array(n),y=new Array(n);
  for(let r=n-1;r>=0;r--){let sx=bx[r],sy=by[r];for(let k=r+1;k<n;k++){sx-=A[r][k]*x[k];sy-=A[r][k]*y[k];}x[r]=sx/A[r][r];y[r]=sy/A[r][r];}
  return x.map((v,i)=>[v,y[i]]);
}
function skSplineHandles(sk,e){ // point de passage → bout de sa poignée
  const m={};
  (sk.entities||[]).forEach(l=>{if(l&&l.t==='line'&&l.handle===e.id&&l.p1&&l.p2)m[l.p1]=l.p2;});
  return m;
}
function skSplineHandleLine(sk,e,pid){return (sk.entities||[]).find(l=>l&&l.t==='line'&&l.handle===e.id&&l.p1===pid)||null;}
function bsInterpolate(Q,H,closed){
  // Q : points de passage [[x,y]…] ; H : bout de poignée par point ([x,y] ou null) ; closed : boucle (Q[0] n'est pas répété)
  const m=Q.length;if(m<2)return null;
  const X=closed?Q.concat([Q[0]]):Q.slice(),HH=closed?H.concat([H[0]]):H.slice(),n=X.length-1;
  const d=[0];for(let k=1;k<=n;k++)d.push(Math.max(Math.hypot(X[k][0]-X[k-1][0],X[k][1]-X[k-1][1]),1e-6));
  const u=[0];for(let k=1;k<=n;k++)u.push(u[k-1]+d[k]);
  const deriv=k=>{ // dérivée imposée par la poignée du point k (null : pas de poignée)
    const h=HH[k];if(!h)return null;const P=X[k],vx=h[0]-P[0],vy=h[1]-P[1];
    if(!closed&&k===0)return[-3*vx/d[1],-3*vy/d[1]];
    if(!closed&&k===n)return[3*vx/d[n],3*vy/d[n]];
    const dp=k>0?d[k]:d[n],dn=k<n?d[k+1]:d[1],a=(dp+dn)/2;return[3*vx/a,3*vy/a];
  };
  const p=SK_SPL_DEG,U=[u[0],u[0],u[0],u[0]];
  for(let k=1;k<n;k++){U.push(u[k]);if(HH[k])U.push(u[k]);}
  U.push(u[n],u[n],u[n],u[n]);
  const nP=U.length-p-1,rows=[],bx=[],by=[];
  const row=(t,o,rx,ry,sub)=>{ // équation : dérivée o en t (− dérivée o en sub si sub fourni) = (rx, ry)
    const r=new Array(nP).fill(0);
    const add=(tt,sg)=>{const s=bsSpan(nP-1,p,tt,U),D=bsDersBasis(s,tt,p,o,U);for(let j=0;j<=p;j++)r[s-p+j]+=sg*D[o][j];};
    add(t,1);if(sub!=null)add(sub,-1);rows.push(r);bx.push(rx);by.push(ry);
  };
  for(let k=0;k<=n;k++)row(u[k],0,X[k][0],X[k][1]);
  for(let k=1;k<n;k++){const D=deriv(k);if(D)row(u[k],1,D[0],D[1]);}
  if(closed){
    const D=deriv(0);
    if(D){row(u[0],1,D[0],D[1]);row(u[n],1,D[0],D[1]);}
    else{row(u[0],1,0,0,u[n]);row(u[0],2,0,0,u[n]);}
  }else{
    const D0=deriv(0),Dn=deriv(n);
    if(D0)row(u[0],1,D0[0],D0[1]);else row(u[0],2,0,0);
    if(Dn)row(u[n],1,Dn[0],Dn[1]);else row(u[n],2,0,0);
  }
  if(rows.length!==nP)return null;
  const P=bsSolve(rows,bx,by);if(!P)return null;
  P[0]=X[0].slice();P[nP-1]=X[n].slice(); // bouts exacts : jonctions bit à bit avec les lignes voisines
  return{U,P,u,d,closed:!!closed,n,p,a:U[0],b:U[U.length-1]};
}
function bsControl(Q,closed){
  // spline par POINTS DE CONTRÔLE : les points d'esquisse sont les pôles. Ouverte : B-spline bornée à nœuds
  // uniformes (passe par le 1er et le dernier pôle, tangente aux côtés extrêmes du polygone), degré 3 ou
  // moins s'il y a peu de pôles. Fermée : périodique uniforme (pôles repris en boucle), domaine [a, b].
  const m=Q.length;
  if(!closed){
    const p=Math.min(SK_SPL_DEG,m-1);if(p<1)return null;
    const n=m-1,U=[];for(let i=0;i<=p;i++)U.push(0);for(let k=1;k<=n-p;k++)U.push(k);for(let i=0;i<=p;i++)U.push(n-p+1);
    return{U,P:Q.map(q=>q.slice()),p,ctrl:true,closed:false,a:0,b:n-p+1};
  }
  const p=Math.min(SK_SPL_DEG,m-1);if(m<3)return null;
  const P=Q.concat(Q.slice(0,p)).map(q=>q.slice()),U=[];for(let i=0;i<P.length+p+1;i++)U.push(i);
  return{U,P,p,ctrl:true,closed:true,a:U[p],b:U[P.length]};
}
function bsRange(bs,u0,u1,P0,P1){ // morceau [u0, u1] d'une B-spline, rendu borné (bouts exacts P0 / P1 si fournis)
  const p=bs.p||SK_SPL_DEG,U=bs.U,a=U[p],b=U[bs.P.length],L=U.length-1;
  let c={U,P:bs.P,p};
  if(u0>a+1e-12||U[0]!==U[p])c=bsSplit(c,u0,P0)[1];          // périodique : bornée par insertion de nœuds
  if(u1<b-1e-12||U[L]!==U[L-p])c=bsSplit(c,u1,P1)[0];
  return c;
}
const SK_SPL_CACHE=new WeakMap(); // entité → {key, fit} (jamais enregistré)
function skSplineFit(sk,e){
  if(!e||e.t!=='spline'||!sk)return null;
  const Pp=sk.points||{},ids=e.pts||[];if(ids.length<2)return null;
  const ctrl=e.mode==='ctrl',hm=ctrl?{}:skSplineHandles(sk,e),Q=[],H=[];let key=(e.closed?'c':'o')+(ctrl?'k':'');
  for(const id of ids){const q=Pp[id];if(!q)return null;Q.push([q.x,q.y]);key+='|'+q.x+','+q.y;
    const h=hm[id]&&Pp[hm[id]];H.push(h?[h.x,h.y]:null);if(h)key+='h'+h.x+','+h.y;}
  const c=SK_SPL_CACHE.get(e);if(c&&c.key===key)return c.fit;
  const closed=!!e.closed&&ids.length>=3;
  let fit=null;try{fit=ctrl?bsControl(Q,closed):bsInterpolate(Q,H,closed);}catch(err){fit=null;}
  SK_SPL_CACHE.set(e,{key,fit});
  return fit;
}
function bsSample(bs,u0,u1,per){ // polyligne de u0 à u1, « per » pas par intervalle de nœuds
  const out=[],U=bs.U,knots=[];
  for(let i=0;i<U.length;i++){const v=U[i];if(v>u0+1e-12&&v<u1-1e-12&&knots.indexOf(v)<0)knots.push(v);}
  const br=[u0].concat(knots,[u1]);
  for(let i=0;i+1<br.length;i++){const a=br[i],b=br[i+1];for(let k=(i?1:0);k<=per;k++){const c=bsEval(bs,a+(b-a)*k/per,0)[0];out.push([c[0],c[1]]);}}
  return out;
}
function skSplinePoly(sk,e,per){ // polyligne complète (premier point → dernier, refermée si fermée)
  const f=skSplineFit(sk,e);if(!f)return null;
  return bsSample(f,f.a,f.b,per||16);
}
function skSplineParam(sk,e,pid){
  // paramètre de la courbe au point pid : point de passage (interpolée) ; 1er / dernier pôle d'une spline
  // ouverte par points de contrôle (les autres pôles ne sont pas sur la courbe) ; null sinon
  const f=skSplineFit(sk,e),k=skSplineIndex(e,pid);if(!f||k<0)return null;
  if(!f.ctrl)return f.u[k];
  if(f.closed)return null;
  return k===0?f.a:(k===e.pts.length-1?f.b:null);
}
function skSplineTanPid(sk,e,pid){
  // point qui donne la tangente en pid : bout de la poignée (interpolée), pôle voisin (points de contrôle)
  if(!e||e.t!=='spline')return null;
  if(e.mode==='ctrl'){if(e.closed)return null;const n=e.pts.length-1;return pid===e.pts[0]?e.pts[1]:(pid===e.pts[n]?e.pts[n-1]:null);}
  const l=skSplineHandleLine(sk,e,pid);return l?l.p2:null;
}
function skSplineCurvature(sk,e,pid){ // courbure signée en pid (sens de parcours) + tangente unitaire
  const u=skSplineParam(sk,e,pid),f=skSplineFit(sk,e);if(u==null||!f)return null;
  const D=bsEval(f,u,2),d1=D[1],d2=D[2],L=Math.hypot(d1[0],d1[1]);if(!(L>1e-12))return null;
  return{k:(d1[0]*d2[1]-d1[1]*d2[0])/(L*L*L),tx:d1[0]/L,ty:d1[1]/L};
}
function bsInsertKnot(bs,u){ // Boehm : insère u une fois
  const p=bs.p||SK_SPL_DEG,U=bs.U,P=bs.P,n=P.length-1,k=bsSpan(n,p,u,U);
  const NU=U.slice(0,k+1).concat([u],U.slice(k+1)),NP=[];
  for(let i=0;i<=n+1;i++){
    if(i<=k-p)NP.push(P[i]);
    else if(i>k)NP.push(P[i-1]);
    else{const a=(u-U[i])/(U[i+p]-U[i]);NP.push([(1-a)*P[i-1][0]+a*P[i][0],(1-a)*P[i-1][1]+a*P[i][1]]);}
  }
  return{U:NU,P:NP,p};
}
function bsSplit(bs,u,Pu){ // coupe en u (intérieur) → [gauche, droite], deux B-splines bornées à droite / à gauche ; Pu : point exact en u
  const p=bs.p||SK_SPL_DEG;let c={U:bs.U.slice(),P:bs.P.map(q=>q.slice()),p};
  let s=c.U.filter(v=>v===u).length;
  while(s<p){c=bsInsertKnot(c,u);s++;}
  const r=c.U.indexOf(u);
  if(Pu)c.P[r-1]=Pu.slice();
  const L={U:c.U.slice(0,r+p).concat([u]),P:c.P.slice(0,r),p};
  const R={U:[u].concat(c.U.slice(r)),P:c.P.slice(r-1),p};
  return[L,R];
}
function skBsKnotMults(U){ // nœuds distincts + multiplicités (format OCCT)
  const k=[],m=[];U.forEach(v=>{if(k.length&&k[k.length-1]===v)m[m.length-1]++;else{k.push(v);m.push(1);}});
  return{k,m};
}
function skSplineEdges(sk,e){
  // arêtes de profil d'une spline : une seule (ouverte), deux moitiés coupées à un point de passage (fermée)
  // — jamais une arête qui revient sur son propre nœud. {a,b,bs,poly,o,i} : o / i = angle de départ / d'arrivée.
  // Spline fermée par points de contrôle : ses deux nœuds ne sont pas des points d'esquisse (la courbe ne
  // passe par aucun pôle) — nœuds virtuels « __s… », coordonnées dans virt, comme les bouts d'arc « __a… ».
  const f=skSplineFit(sk,e);if(!f)return[];
  const ids=e.pts,p=f.p||SK_SPL_DEG;
  const mk=(a,b,bs,virt)=>{
    const s=bs.U[0],t=bs.U[bs.U.length-1],d0=bsEval(bs,s,1)[1],d1=bsEval(bs,t,1)[1];
    return{a,b,bs,poly:bsSample(bs,s,t,16),o:Math.atan2(d0[1],d0[0]),i:Math.atan2(d1[1],d1[0]),virt:virt||null};
  };
  if(f.ctrl&&f.closed){
    const um=(f.a+f.b)/2,C0=bsEval(f,f.a,0)[0],Cm=bsEval(f,um,0)[0],va='__s'+e.id+'a',vb='__s'+e.id+'b';
    const L=bsRange(f,f.a,um,C0,Cm),R=bsRange(f,um,f.b,Cm,C0),virt={};virt[va]=C0;virt[vb]=Cm;
    return[mk(va,vb,L,virt),mk(vb,va,R,virt)];
  }
  const loop=!!e.closed||ids[0]===ids[ids.length-1];
  if(!loop)return[mk(ids[0],ids[ids.length-1],{U:f.U,P:f.P,p})];
  if(f.ctrl){ // 1er et dernier pôles confondus : coupée au milieu de son domaine (nœud virtuel)
    const um=(f.a+f.b)/2,Cm=bsEval(f,um,0)[0],vb='__s'+e.id+'b',virt={};virt[vb]=Cm;
    const[L,R]=bsSplit({U:f.U,P:f.P,p},um,Cm);return[mk(ids[0],vb,L,virt),mk(vb,ids[0],R,virt)];
  }
  const m=Math.max(1,Math.floor(ids.length/2)),um=f.u[m],Pm=sk.points[ids[m]];
  if(!(um>f.a&&um<f.b)||!Pm)return[];
  const[L,R]=bsSplit({U:f.U,P:f.P,p},um,[Pm.x,Pm.y]);
  return[mk(ids[0],ids[m],L),mk(ids[m],ids[0],R)];
}
function skEdgePoly(ed,from){ // polyligne d'une arête spline parcourue depuis le nœud « from »
  const pl=ed.poly||[];return ed.a===from?pl:pl.slice().reverse();
}
function skSplineIndex(e,pid){return e&&e.t==='spline'?(e.pts||[]).indexOf(pid):-1;}
function skSplineTangent(sk,e,pid){
  // tangente unitaire de la courbe au point de passage pid, dans le sens de parcours (premier → dernier point)
  const f=skSplineFit(sk,e),u=skSplineParam(sk,e,pid);if(!f||u==null)return null;
  const d=bsEval(f,u,1)[1],L=Math.hypot(d[0],d[1]);
  return L>1e-12?{x:d[0]/L,y:d[1]/L,speed:L}:null;
}
function skSplineOutward(sk,e,pid){
  // direction « vers l'extérieur » de la poignée : sens de parcours, sauf au 1er point d'une spline ouverte
  const t=skSplineTangent(sk,e,pid);if(!t)return null;
  const k=skSplineIndex(e,pid);
  return(!e.closed&&k===0)?{x:-t.x,y:-t.y,speed:t.speed}:t;
}
function skSplineAddHandle(sk,e,pid){
  // pose une poignée en pid SANS changer la courbe : bout placé sur la tangente courante, longueur
  // telle que la dérivée imposée soit celle de la courbe actuelle (la courbe en C2 vérifie déjà les
  // nouvelles conditions, et la solution du système carré est unique).
  if(e.mode==='ctrl')return null; // points de contrôle : la tangente est portée par le pôle voisin
  const ex=skSplineHandleLine(sk,e,pid);if(ex)return ex;
  const f=skSplineFit(sk,e),k=skSplineIndex(e,pid),P=sk.points[pid];if(!f||k<0||!P)return null;
  const n=f.n,der=bsEval({U:f.U,P:f.P},f.u[k],1)[1];
  let dl;
  if(!e.closed&&k===0)dl=-f.d[1]/3;
  else if(!e.closed&&k===n)dl=f.d[n]/3;
  else{const dp=k>0?f.d[k]:f.d[n],dn=k<n?f.d[k+1]:f.d[1];dl=(dp+dn)/6;}
  let hx=P.x+der[0]*dl,hy=P.y+der[1]*dl;
  if(!(Math.hypot(hx-P.x,hy-P.y)>1e-6)){hx=P.x+1;hy=P.y;}
  const hp=addPoint(sk,hx,hy),l={id:skNewEid(sk),t:'line',p1:pid,p2:hp,construction:true,handle:e.id};
  sk.entities.push(l);
  return l;
}
function skSplineRemoveHandle(sk,e,pid){
  const l=skSplineHandleLine(sk,e,pid);if(!l)return false;
  sk.entities=sk.entities.filter(x=>x!==l);
  sk.constraints=(sk.constraints||[]).filter(c=>!(c.type==='stangent'&&((c.s===e.id&&c.p===pid)||(c.ent===e.id&&c.p===pid))));
  return true;
}
function skCurveIntoDir(sk,ent,pid){
  // direction unitaire qui part de pid VERS l'intérieur de l'entité (pid en est une extrémité) ; null sinon
  const P=sk.points,Q=P[pid];if(!ent||!Q)return null;
  const unit=(x,y)=>{const L=Math.hypot(x,y);return L>1e-12?{x:x/L,y:y/L}:null;};
  if(ent.t==='line'){const o=ent.p1===pid?P[ent.p2]:(ent.p2===pid?P[ent.p1]:null);return o?unit(o.x-Q.x,o.y-Q.y):null;}
  if(ent.t==='arc'){const C=P[ent.pc];if(!C)return null;const rx=Q.x-C.x,ry=Q.y-C.y;
    if(ent.pa===pid)return unit(-ry,rx);if(ent.pb===pid)return unit(ry,-rx);return null;}
  if(ent.t==='spline'){const k=skSplineIndex(ent,pid);if(k<0||ent.closed)return null;const t=skSplineTangent(sk,ent,pid);if(!t)return null;
    if(k===0)return{x:t.x,y:t.y};if(k===ent.pts.length-1)return{x:-t.x,y:-t.y};return null;}
  return null;
}
function skStanResid(sk,c){
  // résidu (mm) d'une tangence spline : écart de la poignée à la tangente de l'autre courbe en p
  const P=sk.points,S=entById(sk,c.s),O=entById(sk,c.ent),Pt=P[c.p];
  if(!S||S.t!=='spline'||!O||!Pt)return null;
  const hp=skSplineTanPid(sk,S,c.p),H=hp&&P[hp];if(!H)return null;
  const hx=H.x-Pt.x,hy=H.y-Pt.y;
  if(O.t==='line'){const A=P[O.p1],B=P[O.p2];if(!A||!B)return null;const L=Math.hypot(B.x-A.x,B.y-A.y);if(!(L>1e-9))return null;
    return(hx*(B.y-A.y)-hy*(B.x-A.x))/L;}
  if(O.t==='circle'||O.t==='arc'){const C=P[O.pc];if(!C)return null;const R=Math.hypot(Pt.x-C.x,Pt.y-C.y);if(!(R>1e-9))return null;
    return(hx*(Pt.x-C.x)+hy*(Pt.y-C.y))/R;}
  if(O.t==='spline'){const h2=skSplineTanPid(sk,O,c.p),H2=h2&&P[h2];if(!H2)return null;
    const vx=H2.x-Pt.x,vy=H2.y-Pt.y,L=Math.hypot(vx,vy);if(!(L>1e-9))return null;return(hx*vy-hy*vx)/L;}
  return null;
}
function skStanRelax(sk,c,fix){
  // relaxation : la poignée tourne autour de p de la moitié de l'écart vers la tangente voulue
  const P=sk.points,S=entById(sk,c.s),O=entById(sk,c.ent),Pt=P[c.p];if(!S||!O||!Pt)return;
  const hp=skSplineTanPid(sk,S,c.p);if(!hp||fix.has(hp))return;const H=P[hp];if(!H)return;
  let tx=null,ty=null;
  if(O.t==='line'){const A=P[O.p1],B=P[O.p2];if(!A||!B)return;tx=B.x-A.x;ty=B.y-A.y;}
  else if(O.t==='circle'||O.t==='arc'){const C=P[O.pc];if(!C)return;tx=-(Pt.y-C.y);ty=Pt.x-C.x;}
  else if(O.t==='spline'){const h2=skSplineTanPid(sk,O,c.p),H2=h2&&P[h2];if(!H2)return;tx=H2.x-Pt.x;ty=H2.y-Pt.y;}
  const L=Math.hypot(tx,ty),hx=H.x-Pt.x,hy=H.y-Pt.y,hl2=Math.hypot(hx,hy);if(!(L>1e-12)||!(hl2>1e-12))return;
  let ux=tx/L,uy=ty/L;if(hx*ux+hy*uy<0){ux=-ux;uy=-uy;}
  const qx=Pt.x+ux*hl2,qy=Pt.y+uy*hl2;H.x+=(qx-H.x)*0.5;H.y+=(qy-H.y)*0.5;
}
function skCurvResid(sk,c){
  // résidu d'une contrainte de courbure (G2) au raccord : courbure de la spline − courbure de l'autre courbe,
  // toutes deux prises dans le sens de parcours de la spline, ramené en mm (× longueur de la poignée²)
  const P=sk.points,S=entById(sk,c.s),O=entById(sk,c.ent),Pt=P[c.p];if(!S||!O||!Pt)return null;
  const a=skSplineCurvature(sk,S,c.p);if(!a)return null;
  let k2;
  if(O.t==='line')k2=0;
  else if(O.t==='circle'||O.t==='arc'){const C=P[O.pc];if(!C||!(O.r>0))return null;const tx=-(Pt.y-C.y),ty=Pt.x-C.x;k2=(tx*a.tx+ty*a.ty>=0?1:-1)/O.r;}
  else if(O.t==='spline'){const b=skSplineCurvature(sk,O,c.p);if(!b)return null;k2=(b.tx*a.tx+b.ty*a.ty>=0?1:-1)*b.k;}
  else return null;
  const hp=skSplineTanPid(sk,S,c.p),H=hp&&P[hp],L=H?Math.max(Math.hypot(H.x-Pt.x,H.y-Pt.y),1e-3):1;
  return(a.k-k2)*L*L;
}
function skSplineCurvTo(sk,S,O,pid){
  // courbure continue (G2) entre la spline S et O en pid : la tangence (G1) est posée d'abord si besoin
  if((sk.constraints||[]).some(c=>c.type==='scurv'&&c.s===S.id&&c.p===pid&&c.ent===O.id))return 'Courbure (G2) déjà posée.';
  if(!(sk.constraints||[]).some(c=>c.type==='stangent'&&c.s===S.id&&c.p===pid&&c.ent===O.id)){
    const r=skSplineTangentTo(sk,S,O,pid);if(typeof r==='string')return r;}
  const c={id:skNewEid(sk),type:'scurv',s:S.id,p:pid,ent:O.id};
  sk.constraints.push(c);
  return c;
}
const skComb=new Set(); // splines dont le peigne de courbure est affiché (session, jamais enregistré)
function skSplineComb(sk,e,n){
  // peigne de courbure : en chaque échantillon, une dent le long de la normale, longue de k × échelle (côté
  // opposé au centre de courbure) ; échelle telle que la plus longue dent fasse 20 % de l'encombrement
  const f=skSplineFit(sk,e);if(!f)return null;
  const N=n||120,S=[];let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity,km=0;
  for(let i=0;i<=N;i++){const u=f.a+(f.b-f.a)*i/N,D=bsEval(f,u,2),L=Math.hypot(D[1][0],D[1][1]);if(!(L>1e-12))continue;
    const k=(D[1][0]*D[2][1]-D[1][1]*D[2][0])/(L*L*L),nx=-D[1][1]/L,ny=D[1][0]/L;
    S.push({x:D[0][0],y:D[0][1],k,nx,ny});km=Math.max(km,Math.abs(k));
    x0=Math.min(x0,D[0][0]);x1=Math.max(x1,D[0][0]);y0=Math.min(y0,D[0][1]);y1=Math.max(y1,D[0][1]);}
  const sc=km>1e-12?0.2*Math.max(Math.hypot(x1-x0,y1-y0),1e-6)/km:0;
  return S.map(q=>({x:q.x,y:q.y,qx:q.x-q.nx*q.k*sc,qy:q.y-q.ny*q.k*sc}));
}
function skSplineTangentTo(sk,S,O,pid){
  // pose la tangence de la spline S à l'entité O au point pid (point de passage de S) : poignée(s) créée(s),
  // point posé sur O s'il n'en est pas une extrémité. Retourne la contrainte, ou un message d'erreur (chaîne).
  if(!S||S.t!=='spline'||!O||O.id===S.id)return 'Tangence spline : choisissez une autre courbe.';
  if(skSplineIndex(S,pid)<0)return 'Tangence spline : le point n’est pas un point de passage de la spline.';
  const endOnly='Spline par points de contrôle : tangence à son premier ou dernier pôle seulement (les autres ne sont pas sur la courbe).';
  if(S.mode==='ctrl'&&skSplineParam(sk,S,pid)==null)return endOnly;
  if((sk.constraints||[]).some(c=>c.type==='stangent'&&c.s===S.id&&c.p===pid&&c.ent===O.id))return 'Tangence déjà posée.';
  const Q=sk.points[pid];
  if(O.t==='spline'){if(skSplineIndex(O,pid)<0)return 'Tangence entre splines : elles doivent partager ce point (joignez-les d’abord, F1).';
    if(O.mode==='ctrl'&&skSplineParam(sk,O,pid)==null)return endOnly;
    skSplineAddHandle(sk,O,pid);}
  else if(O.t==='line'){if(O.p1!==pid&&O.p2!==pid&&!(sk.constraints||[]).some(c=>c.type==='online'&&c.p===pid&&c.line===O.id))
    sk.constraints.push({id:skNewEid(sk),type:'online',p:pid,line:O.id});}
  else if(O.t==='circle'||O.t==='arc'){if(O.pa!==pid&&O.pb!==pid&&!(sk.constraints||[]).some(c=>c.type==='oncircle'&&c.p===pid&&c.ent===O.id))
    sk.constraints.push({id:skNewEid(sk),type:'oncircle',p:pid,ent:O.id});}
  else return 'Tangence spline : ligne, cercle, arc ou spline.';
  skSplineAddHandle(sk,S,pid);if(!skSplineTanPid(sk,S,pid)||!Q)return 'Tangence spline : poignée impossible.';
  const c={id:skNewEid(sk),type:'stangent',s:S.id,p:pid,ent:O.id};
  sk.constraints.push(c);
  return c;
}
function skSplineJoint(sk,S,O){
  // point de passage de S où poser la tangence avec O : extrémité partagée d'abord, sinon le bout de S le plus proche de O
  const ends=S.closed?S.pts.slice():[S.pts[0],S.pts[S.pts.length-1]];
  const shared=ends.find(p=>skEntPids(O).indexOf(p)>=0)||S.pts.find(p=>skEntPids(O).indexOf(p)>=0);
  if(shared)return shared;
  const P=sk.points;let best=null,bd=Infinity;
  ends.forEach(p=>{const q=P[p];if(!q)return;let d=Infinity;
    if(O.t==='line'){const A=P[O.p1],B=P[O.p2];if(A&&B)d=distSeg(q.x,q.y,A,B);}
    else if(O.t==='circle'||O.t==='arc'){const C=P[O.pc];if(C)d=Math.abs(Math.hypot(q.x-C.x,q.y-C.y)-O.r);}
    if(d<bd){bd=d;best=p;}});
  return O.t==='spline'?null:best;
}
function skSplineAutoTangent(sk,S){
  // à la création : un bout posé sur l'extrémité d'une ligne / d'un arc / d'une spline et parti dans son
  // prolongement (moins de 20°) devient tangent — comme l'inférence de tangence des lignes
  if(!S||S.closed)return 0;let n=0;
  [S.pts[0],S.pts[S.pts.length-1]].forEach(pid=>{
    const out=skSplineOutward(sk,S,pid);if(!out)return;
    const L=Math.hypot(out.x,out.y)||1,ox=out.x/L,oy=out.y/L;
    let best=null,bc=Math.cos(20*Math.PI/180);
    (sk.entities||[]).forEach(o=>{
      if(!o||o.id===S.id||o.construction||o.handle)return;
      const v=skCurveIntoDir(sk,o,pid);if(!v)return;
      const c=ox*v.x+oy*v.y;if(c>bc){bc=c;best=o;}
    });
    if(best){const r=skSplineTangentTo(sk,S,best,pid);if(r&&typeof r==='object')n++;}
  });
  return n;
}
function skSplineCommit(sk,draft,closed,mode){
  // crée la spline à partir des clics du brouillon ({x,y,snap}) ; null si trop peu de points distincts
  // mode 'ctrl' : les clics sont des pôles (spline par points de contrôle)
  const pids=[],free=[],ctrl=mode==='ctrl';
  draft.forEach(q=>{
    const snapped=!!(q.snap&&q.snap.kind==='point'&&sk.points[q.snap.pid]);
    const pid=snapped?q.snap.pid:(ctrl?addPoint(sk,q.x,q.y):snapNewPoint(sk,q.x,q.y)); // pôle : jamais posé sur un milieu
    if(!pids.length||pids[pids.length-1]!==pid){pids.push(pid);if(!snapped)free.push(pid);}
  });
  if(closed&&pids.length>1&&pids[pids.length-1]===pids[0])pids.pop();
  if(pids.length<2||(closed&&pids.length<3))return null;
  const e={id:skNewEid(sk),t:'spline',pts:pids};if(ctrl)e.mode='ctrl';if(closed)e.closed=true;
  sk.entities.push(e);
  // pôles intérieurs : hors de la courbe, jamais attachés à une ligne / un cercle
  (ctrl?free.filter(p=>p===pids[0]||p===pids[pids.length-1]):free).forEach(pid=>{const q=sk.points[pid];if(q)skAutoAttach(sk,pid,q.x,q.y);}); // point nouveau sur une ligne / un cercle : posé dessus
  skSplineAutoTangent(sk,e);
  return e;
}
function skSplineDraftPoly(draft,cur,closed,ctrl){ // aperçu pendant le tracé (pas d'entité) : clics + curseur
  const Q=draft.map(q=>[q.x,q.y]);if(cur)Q.push([cur.x,cur.y]);
  const U=[];Q.forEach(q=>{if(!U.length||Math.hypot(q[0]-U[U.length-1][0],q[1]-U[U.length-1][1])>1e-9)U.push(q);});
  if(U.length<2)return null;
  const cl=!!closed&&U.length>=3,f=ctrl?bsControl(U,cl):bsInterpolate(U,U.map(()=>null),cl);if(!f)return null;
  return bsSample(f,f.a,f.b,16);
}
function skSplMode(){return skTool==='cspline'?'ctrl':'fit';}
function skSplFinish(closed){
  // fin du tracé (double-clic, Entrée, clic droit, clic sur le 1er point = fermée) : la spline est créée
  const sk=skEdit,d=skSpl,mode=skSplMode();skSpl=null;skDraft=null;skSnapMk=null;
  if(!sk)return;
  const what=mode==='ctrl'?'pôles':'points de passage';
  if(!d||d.pts.length<2){drawSketch2D();skStatus('Spline : cliquez au moins 2 '+what+'.');return;}
  skPushUndo();
  const e=skSplineCommit(sk,d.pts,closed,mode);
  if(!e){skUndoStack.pop();skUndoBtn();drawSketch2D();skStatus('Spline : points confondus — rien de créé.');return;}
  const nT=(sk.constraints||[]).filter(c=>c.type==='stangent'&&c.s===e.id).length;
  afterEdit();
  skStatus('Spline '+(closed?'fermée ':'')+'créée ('+e.pts.length+' '+what+')'+(nT?' — '+nT+' bout(s) tangent(s) ⦾':'')+
    (mode==='ctrl'?'. Glissez les pôles pour modeler la courbe.':'. Glissez les points ; clic droit sur un point : poignée de tangence.')+' Cliquez pour une nouvelle spline.');
}
function skSplClick(sk,wx,wy,e){
  // outils Spline : un clic = un point de passage (ou un pôle)
  const s=findSnap(sk,wx,wy);let x=wx,y=wy;
  if(s){x=s.x;y=s.y;}else if($('skSnap').checked){x=skSnapVal(x);y=skSnapVal(y);}
  if(!skSpl)skSpl={pts:[]};
  const S=skSpl.pts,tol=6/skView.s,ctrl=skSplMode()==='ctrl';
  if(S.length>=3&&Math.hypot(x-S[0].x,y-S[0].y)<tol){skSplFinish(true);return;}
  if(S.length&&(e.detail>=2||Math.hypot(x-S[S.length-1].x,y-S[S.length-1].y)<tol)){skSplFinish(false);return;}
  S.push({x,y,snap:s&&s.kind==='point'?s:null});
  skDraft={t:'spline',ctrl,pts:S,poly:skSplineDraftPoly(S,null,false,ctrl)};
  drawSketch2D();
  skStatus('Spline : '+S.length+(ctrl?' pôle(s)':' point(s)')+' — clic = suivant · double-clic / Entrée / clic droit = fin · clic sur le 1er = fermée.');
}
function skSplMove(sk,wx,wy){
  const s=findSnap(sk,wx,wy);let x=wx,y=wy;
  if(s){x=s.x;y=s.y;skSnapMk={x,y};}else{skSnapMk=null;if($('skSnap').checked){x=skSnapVal(x);y=skSnapVal(y);}}
  if(skSpl&&skSpl.pts.length){
    const S=skSpl.pts,close=S.length>=3&&Math.hypot(x-S[0].x,y-S[0].y)<6/skView.s,ctrl=skSplMode()==='ctrl';
    skDraft={t:'spline',ctrl,pts:S,cur:close?null:{x,y},closeHint:close,poly:skSplineDraftPoly(S,close?null:{x,y},close,ctrl)};
  }
  drawSketch2D();
}
function skPolyDist(x,y,pl){let m=Infinity;for(let i=0;i+1<pl.length;i++){const d=distSeg(x,y,{x:pl[i][0],y:pl[i][1]},{x:pl[i+1][0],y:pl[i+1][1]});if(d<m)m=d;}return m;}
function skSplineAllPids(sk,e){ // points de passage + bouts de poignée (pour le « entièrement contrainte »)
  const hm=skSplineHandles(sk,e);return (e.pts||[]).concat(Object.keys(hm).map(k=>hm[k]));
}
function skSplineCleanup(sk){
  // poignées orphelines (spline supprimée, ou point de passage retiré) → retirées ; spline réduite à < 2 points → retirée
  const byId=new Map();(sk.entities||[]).forEach(e=>{if(e&&e.t==='spline')byId.set(e.id,e);});
  (sk.entities||[]).forEach(e=>{if(e&&e.t==='spline'){e.pts=(e.pts||[]).filter(p=>sk.points[p]);if(e.closed&&e.pts.length<3)delete e.closed;}});
  sk.entities=(sk.entities||[]).filter(e=>{
    if(e&&e.t==='spline')return e.pts.length>=2;
    if(e&&e.t==='line'&&e.handle){const S=byId.get(e.handle);return !!S&&S.pts.length>=2&&S.pts.indexOf(e.p1)>=0;}
    return true;
  });
}
