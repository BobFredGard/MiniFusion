/* ─────────────────────────────────────────────────────────────────────────────
   CRÊTES CONSTANTES « façon Fusion 360 » (2026-10-14-001) — trajectoire
   op.traj==='scallop' de la finition géodésique.

   Rétro-ingénierie de Exemples/cav.txt (Fusion 360, « Crêtes constantes »,
   boule D6, pas 1) sur la cavité de Exemples/Cavité Usinage.miniFusion :
     • 30 anneaux FERMÉS depuis le bord de l'îlot (fond plat, offsets exacts de
       1 mm : périmètre +2π par anneau), tous dans le même sens ;
     • 24 anneaux FERMÉS depuis le bord haut, vers le bas, sens inverse ;
     • 4 zones restantes (coins, entre les deux fronts) remplies de boucles
       concentriques en LENTILLE qui se resserrent (240 → 28 mm) ;
     • enchaînement d'un anneau au suivant par une liaison en S d'environ
       0,75·D au CONTACT (décalage d'un pas + avance dans le sens de coupe),
       entrées/sorties en quart de cercle vertical, sauts locaux (+5 mm) entre
       les blocs.
   Le côté déjà usiné est toujours à DROITE du sens d'avance (la matière
   restante à gauche) : d'où horaire depuis l'intérieur, anti-horaire depuis
   l'extérieur, anti-horaire dans les lentilles.

   ALGORITHME (général, toute forme) :
   1. Région usinable : sommets dont la position outil (contact + n·R) est dans
      la zone de l'op (limite ∧ ¬îlot), dans la fenêtre Z, normale non tournée
      vers le bas. Maillage RAFFINÉ (arêtes ≤ h ≈ pas) : l'iso-ligne est
      interpolée linéairement par triangle, un grand triangle de fond plat
      rendrait des polygones au lieu d'arcs.
   2. FRONTS = composantes connexes du bord de la région (bord coupé par
      dichotomie sur les arêtes, pas en marches d'escalier).
   3. Un champ de DISTANCE GÉODÉSIQUE par front (Fast Marching sur triangles :
      mise à jour en onde plane, sans l'anisotropie de Dijkstra sur arêtes).
   4. Fronts traités du plus BAS au plus haut : anneaux d = k·pas tant que
      l'iso est faite de boucles FERMÉES qui restent hors du territoire déjà
      usiné par les fronts précédents (et à distance des fronts suivants).
   5. Reste : champ d_L = min_k (d_k − couvert_k) ; boucles d_L = m·Δ avec
      Δ = Mx/(n+½) ≤ pas (Mx = profondeur max de la zone restante) — la crête
      au milieu de la lentille ne dépasse jamais le pas.
   6. Positions outil : XY = contact + n·R, Z = DESCENTE DE L'OUTIL (drop-cutter
      boule exacte ; torique échantillonné ; droite disque) sur le maillage
      d'origine : jamais de surcoupe, même en creux de rayon < R.
   7. Séquences : anneaux d'un même groupe à niveaux consécutifs et proches →
      liaison en S au contact (Z = descente outil) ; sinon sortie en arc
      vertical, saut local, entrée en arc vertical.
   ───────────────────────────────────────────────────────────────────────── */

// Raffinement conforme limité à la région : une arête > h est coupée en son
// milieu si l'un de ses bouts (ou son milieu) est dans la région ; chaque
// triangle est re-découpé selon ses arêtes coupées (1 → 2, 2 → 3, 3 → 4)
// jusqu'à stabilité. NORMALES PAR COIN DE TRIANGLE, lissées seulement dans
// une même nappe (arête vive > 35° = rupture) : un point ajouté au milieu d'une
// grande facette plane garde la normale exacte de la facette (l'interpolation
// des normales de sommet à travers une arête vive donnait 30° d'erreur sur
// le dessus de la pièce → région trouée près du bord).
// memb(p,n) : appartenance d'un point de contact à la région.
function faoScRefine(mesh,h,memb,maxTris){
  const V=mesh.v.map(function(p){return [p[0],p[1],p[2]];});
  let T=[];
  const fnOf=function(A,B,C){
    const ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2],wx=C[0]-A[0],wy=C[1]-A[1],wz=C[2]-A[2];
    const nx=uy*wz-uz*wy,ny=uz*wx-ux*wz,nz=ux*wy-uy*wx;
    const l=Math.hypot(nx,ny,nz);
    return l>1e-14?[nx/l,ny/l,nz/l,l*0.5]:null;
  };
  // normales de face + coins lissés par nappe
  const F=[];
  for(let i=0;i<mesh.t.length;i++){const t=mesh.t[i];
    const fn=fnOf(V[t[0]],V[t[1]],V[t[2]]);
    if(fn){T.push([t[0],t[1],t[2]]);F.push(fn);}}
  const vt0=[];for(let i=0;i<V.length;i++)vt0.push([]);
  for(let i=0;i<T.length;i++){vt0[T[i][0]].push(i);vt0[T[i][1]].push(i);vt0[T[i][2]].push(i);}
  const angAt=function(t,q){
    const P=V[t[q]],A=V[t[(q+1)%3]],B=V[t[(q+2)%3]];
    const ux=A[0]-P[0],uy=A[1]-P[1],uz=A[2]-P[2],wx=B[0]-P[0],wy=B[1]-P[1],wz=B[2]-P[2];
    const lu=Math.hypot(ux,uy,uz),lw=Math.hypot(wx,wy,wz);
    if(!(lu>0&&lw>0))return 0;
    return Math.acos(Math.max(-1,Math.min(1,(ux*wx+uy*wy+uz*wz)/(lu*lw))));
  };
  const COS=Math.cos(35*Math.PI/180);
  let CN=T.map(function(t,i){
    const fi=F[i];
    return [0,1,2].map(function(q){
      const v=t[q];let nx=0,ny=0,nz=0;
      const L=vt0[v];
      for(let k=0;k<L.length;k++){const j=L[k],fj=F[j];
        if(fi[0]*fj[0]+fi[1]*fj[1]+fi[2]*fj[2]<COS)continue;
        const tj=T[j],qj=tj[0]===v?0:(tj[1]===v?1:2);
        const w=angAt(tj,qj);
        nx+=fj[0]*w;ny+=fj[1]*w;nz+=fj[2]*w;}
      const l=Math.hypot(nx,ny,nz);
      return l>0?[nx/l,ny/l,nz/l]:[fi[0],fi[1],fi[2]];
    });
  });
  // normale de sommet = moyenne des coins (bissectrice aux arêtes vives)
  const vNorm=function(nV,TT,CC){
    const N=[];for(let i=0;i<nV;i++)N.push([0,0,0]);
    for(let i=0;i<TT.length;i++)for(let q=0;q<3;q++){const n=N[TT[i][q]],c=CC[i][q];n[0]+=c[0];n[1]+=c[1];n[2]+=c[2];}
    for(let i=0;i<nV;i++){const n=N[i],l=Math.hypot(n[0],n[1],n[2])||1;n[0]/=l;n[1]/=l;n[2]/=l;}
    return N;
  };
  let NV=vNorm(V.length,T,CN);
  const ins=[];for(let i=0;i<V.length;i++)ins.push(memb(V[i],NV[i])?1:0);
  // budget : surface des triangles touchant la région → h minimal admissible
  const cap=maxTris||220000;
  let area=0;
  for(let i=0;i<T.length;i++){const t=T[i];if(ins[t[0]]||ins[t[1]]||ins[t[2]])area+=F[i][3];}
  // (bissection des arêtes > h : ~16 triangles par h² mesuré)
  if(area*16/(h*h)>cap)h=Math.sqrt(area*16/cap);
  const h2=h*h;
  const ek=function(a,b){return a<b?a*4194304+b:b*4194304+a;};
  for(let pass=0;pass<40;pass++){
    const mid=new Map();
    let nSplit=0;
    for(let i=0;i<T.length;i++){
      const t=T[i];
      for(let e=0;e<3;e++){
        const a=t[e],b=t[(e+1)%3];
        const A=V[a],B=V[b];
        const dx=A[0]-B[0],dy=A[1]-B[1],dz=A[2]-B[2];
        if(dx*dx+dy*dy+dz*dz<=h2)continue;
        const k=ek(a,b);
        if(mid.has(k))continue;
        let want=ins[a]||ins[b];
        if(!want){
          const ca=CN[i][e],cb=CN[i][(e+1)%3];
          want=memb([(A[0]+B[0])/2,(A[1]+B[1])/2,(A[2]+B[2])/2],[ca[0]+cb[0],ca[1]+cb[1],ca[2]+cb[2]]);
        }
        if(want){mid.set(k,-1);nSplit++;}
      }
    }
    if(!nSplit)break;
    if(T.length>cap*3)break; // garde-fou absolu
    const T2=[],C2=[];
    const getMid=function(a,b,ca,cb){
      const k=ek(a,b);let j=mid.get(k);
      if(j===undefined)return undefined;
      if(j<0){
        const A=V[a],B=V[b];
        j=V.length;
        V.push([(A[0]+B[0])/2,(A[1]+B[1])/2,(A[2]+B[2])/2]);
        let nx=ca[0]+cb[0],ny=ca[1]+cb[1],nz=ca[2]+cb[2];
        const l=Math.hypot(nx,ny,nz)||1;
        ins.push(memb(V[j],[nx/l,ny/l,nz/l])?1:0);
        mid.set(k,j);
      }
      return j;
    };
    const nrm=function(a,b){const x=a[0]+b[0],y=a[1]+b[1],z=a[2]+b[2],l=Math.hypot(x,y,z)||1;return [x/l,y/l,z/l];};
    for(let i=0;i<T.length;i++){
      const t=T[i],c=CN[i];
      const m=[getMid(t[0],t[1],c[0],c[1]),getMid(t[1],t[2],c[1],c[2]),getMid(t[2],t[0],c[2],c[0])];
      const has=[m[0]!==undefined,m[1]!==undefined,m[2]!==undefined];
      const nc=(has[0]?1:0)+(has[1]?1:0)+(has[2]?1:0);
      if(nc===0){T2.push(t);C2.push(c);continue;}
      // normales des milieux propres à CE triangle (nappe du triangle)
      const cm=[nrm(c[0],c[1]),nrm(c[1],c[2]),nrm(c[2],c[0])];
      if(nc===3){
        T2.push([t[0],m[0],m[2]]);C2.push([c[0],cm[0],cm[2]]);
        T2.push([m[0],t[1],m[1]]);C2.push([cm[0],c[1],cm[1]]);
        T2.push([m[2],m[1],t[2]]);C2.push([cm[2],cm[1],c[2]]);
        T2.push([m[0],m[1],m[2]]);C2.push([cm[0],cm[1],cm[2]]);
        continue;
      }
      let r=0;
      if(nc===1){ r=has[0]?0:(has[1]?1:2); }
      else{ r=!has[0]?0:(!has[1]?1:2); }
      const v0=t[r],v1=t[(r+1)%3],v2=t[(r+2)%3];
      const n0=c[r],n1=c[(r+1)%3],n2=c[(r+2)%3];
      const m01=m[r],m12=m[(r+1)%3],m20=m[(r+2)%3];
      const k01=cm[r],k12=cm[(r+1)%3],k20=cm[(r+2)%3];
      if(nc===1){
        T2.push([v0,m01,v2]);C2.push([n0,k01,n2]);
        T2.push([m01,v1,v2]);C2.push([k01,n1,n2]);
      }else{
        T2.push([m12,v2,m20]);C2.push([k12,n2,k20]);
        const d1=Math.hypot(V[v0][0]-V[m12][0],V[v0][1]-V[m12][1],V[v0][2]-V[m12][2]);
        const d2=Math.hypot(V[v1][0]-V[m20][0],V[v1][1]-V[m20][1],V[v1][2]-V[m20][2]);
        if(d1<=d2){T2.push([v0,v1,m12]);C2.push([n0,n1,k12]);T2.push([v0,m12,m20]);C2.push([n0,k12,k20]);}
        else{T2.push([v0,v1,m20]);C2.push([n0,n1,k20]);T2.push([v1,m12,m20]);C2.push([n1,k12,k20]);}
      }
    }
    T=T2;CN=C2;
  }
  NV=vNorm(V.length,T,CN);
  return {v:V,n:NV,t:T,h:h};
}

// Fast Marching sur maillage triangulé (distance géodésique, vitesse 1).
// dist : Float64Array pré-remplie (graines finies, le reste Infinity) ;
// ok : Uint8Array des sommets autorisés ; vt : triangles incidents par sommet.
function faoScFMM(V,T,vt,dist,ok){
  const n=V.length;
  const state=new Uint8Array(n); // 0 loin, 1 essai, 2 accepté
  const HK=[],HV=[];
  const push=function(k,v){ HK.push(k);HV.push(v);let i=HK.length-1;
    while(i>0){const p=(i-1)>>1;if(HK[p]<=k)break;HK[i]=HK[p];HV[i]=HV[p];i=p;}
    HK[i]=k;HV[i]=v; };
  const pop=function(){ const top=HV[0];const lk=HK.pop(),lv=HV.pop();
    if(HK.length){HK[0]=lk;HV[0]=lv;let i=0;
      for(;;){const l=i*2+1,r=l+1;let m=i;
        if(l<HK.length&&HK[l]<HK[m])m=l;if(r<HK.length&&HK[r]<HK[m])m=r;
        if(m===i)break;
        const tk=HK[i];HK[i]=HK[m];HK[m]=tk;const tv=HV[i];HV[i]=HV[m];HV[m]=tv;i=m;}}
    return top; };
  for(let i=0;i<n;i++)if(ok[i]&&dist[i]<1/0){state[i]=1;push(dist[i],i);}
  // Mise à jour de C depuis A,B acceptés (onde plane dans le plan du triangle).
  const upd=function(c,a,b){
    const C=V[c],A=V[a],B=V[b];
    const ux=A[0]-C[0],uy=A[1]-C[1],uz=A[2]-C[2];
    const wx=B[0]-C[0],wy=B[1]-C[1],wz=B[2]-C[2];
    const lu=Math.sqrt(ux*ux+uy*uy+uz*uz), lw=Math.sqrt(wx*wx+wy*wy+wz*wz);
    const ta=dist[a],tb=dist[b];
    let best=Math.min(ta+lu,tb+lw);
    const g11=ux*ux+uy*uy+uz*uz,g12=ux*wx+uy*wy+uz*wz,g22=wx*wx+wy*wy+wz*wz;
    const det=g11*g22-g12*g12;
    // angle en C aigu OU DROIT (≥ 90° exclu) : onde plane possible — l'angle
    // droit est fréquent (grilles, raffinement par bissection) ; l'exclure
    // ramenait la distance aux arêtes (+41 % en diagonale)
    if(det>1e-14*g11*g22&&g12>=-1e-12*Math.sqrt(g11*g22)){
      const q11=g22/det,q12=-g12/det,q22=g11/det;
      // (a−Te)ᵀQ(a−Te)=1
      const eQe=q11+2*q12+q22;
      const eQa=(q11+q12)*ta+(q12+q22)*tb;
      const aQa=q11*ta*ta+2*q12*ta*tb+q22*tb*tb;
      const disc=eQa*eQa-eQe*(aQa-1);
      if(disc>=0&&eQe>0){
        const T0=(eQa+Math.sqrt(disc))/eQe;
        if(T0>=Math.max(ta,tb)){
          const r1=ta-T0,r2=tb-T0;
          const al=q11*r1+q12*r2, be=q12*r1+q22*r2;
          if(al<=1e-12&&be<=1e-12&&T0<best)best=T0;
        }
      }
    }
    return best;
  };
  while(HK.length){
    const u=pop();
    if(state[u]===2)continue;
    state[u]=2;
    const tl=vt[u];
    for(let k=0;k<tl.length;k++){
      const t=T[tl[k]];
      for(let e=0;e<3;e++){
        const c=t[e];
        if(c===u||state[c]===2||!ok[c])continue;
        const o=t[0]!==u&&t[0]!==c?t[0]:(t[1]!==u&&t[1]!==c?t[1]:t[2]);
        let nd;
        if(ok[o]&&state[o]===2)nd=upd(c,u,o);
        else{const P=V[u],Q=V[c],ex=P[0]-Q[0],ey=P[1]-Q[1],ez=P[2]-Q[2];nd=dist[u]+Math.sqrt(ex*ex+ey*ey+ez*ez);}
        if(nd<dist[c]){dist[c]=nd;state[c]=1;push(nd,c);}
      }
    }
  }
  return dist;
}

// Descente de l'outil sur le maillage d'origine (drop-cutter) : renvoie la cote
// de la POINTE en (x,y) — contact sans surcoupe. Boule exacte (sommets, arêtes,
// facettes), torique = boules de rayon r aux points du cercle (D/2−r) + disque
// plat central, droite = disque (sommets, arêtes, facette au centre).
function faoScDropper(mesh,kind,D,cornerR,laisse){
  const L=isFinite(+laisse)&&+laisse>0?+laisse:0;
  const Rt=D/2;
  const r=kind==='flat'?0:(kind==='bull'?Math.min(Rt,isFinite(+cornerR)?+cornerR:Rt):Rt);
  const reach=Rt+L+1e-6;
  // grille XY des triangles
  let x0=1/0,y0=1/0,x1=-1/0,y1=-1/0;
  for(let i=0;i<mesh.v.length;i++){const p=mesh.v[i];
    if(p[0]<x0)x0=p[0];if(p[0]>x1)x1=p[0];if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1];}
  const cs=Math.max(1,Rt);
  const nx=Math.max(1,Math.ceil((x1-x0)/cs)+1),ny=Math.max(1,Math.ceil((y1-y0)/cs)+1);
  const grid=new Array(nx*ny);
  const tris=[];
  for(let i=0;i<mesh.t.length;i++){
    const t=mesh.t[i],A=mesh.v[t[0]],B=mesh.v[t[1]],C=mesh.v[t[2]];
    const ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2],wx=C[0]-A[0],wy=C[1]-A[1],wz=C[2]-A[2];
    let fx=uy*wz-uz*wy,fy=uz*wx-ux*wz,fz=ux*wy-uy*wx;
    const l=Math.hypot(fx,fy,fz);
    if(!(l>1e-12))continue;
    fx/=l;fy/=l;fz/=l;
    if(fz<0){fx=-fx;fy=-fy;fz=-fz;} // facette vue d'en haut (l'outil vient de +Z)
    const id=tris.length;
    tris.push({A:A,B:B,C:C,n:[fx,fy,fz],zt:Math.max(A[2],B[2],C[2]),
      x0:Math.min(A[0],B[0],C[0]),x1:Math.max(A[0],B[0],C[0]),
      y0:Math.min(A[1],B[1],C[1]),y1:Math.max(A[1],B[1],C[1])});
    const bx0=Math.min(A[0],B[0],C[0])-reach,bx1=Math.max(A[0],B[0],C[0])+reach;
    const by0=Math.min(A[1],B[1],C[1])-reach,by1=Math.max(A[1],B[1],C[1])+reach;
    const i0=Math.max(0,Math.floor((bx0-x0)/cs)),i1=Math.min(nx-1,Math.floor((bx1-x0)/cs));
    const j0=Math.max(0,Math.floor((by0-y0)/cs)),j1=Math.min(ny-1,Math.floor((by1-y0)/cs));
    for(let ii=i0;ii<=i1;ii++)for(let jj=j0;jj<=j1;jj++){
      const k=jj*nx+ii;(grid[k]||(grid[k]=[])).push(id);
    }
  }
  for(let k=0;k<grid.length;k++)if(grid[k])grid[k].sort(function(a,b){return tris[b].zt-tris[a].zt;});
  const cellOf=function(x,y){
    const i=Math.floor((x-x0)/cs),j=Math.floor((y-y0)/cs);
    if(i<0||j<0||i>=nx||j>=ny)return null;
    return grid[j*nx+i]||null;
  };
  const inTri=function(px,py,A,B,C){
    const d1=(px-B[0])*(A[1]-B[1])-(A[0]-B[0])*(py-B[1]);
    const d2=(px-C[0])*(B[1]-C[1])-(B[0]-C[0])*(py-C[1]);
    const d3=(px-A[0])*(C[1]-A[1])-(C[0]-A[0])*(py-A[1]);
    const neg=(d1<0)||(d2<0)||(d3<0),pos=(d1>0)||(d2>0)||(d3>0);
    return !(neg&&pos);
  };
  // Boule de rayon rr centrée en (x,y,h) : h minimal sans pénétration → centre.
  const ballCenter=function(x,y,rr,list){
    let h=-1/0;
    const r2=rr*rr;
    for(let k=0;k<list.length;k++){
      const T=tris[list[k]];
      // listes triées par Z max décroissant : plus rien ne peut relever h
      if(T.zt+rr<=h)break;
      if(x<T.x0-rr||x>T.x1+rr||y<T.y0-rr||y>T.y1+rr)continue;
      const P=[T.A,T.B,T.C];
      // sommets
      for(let q=0;q<3;q++){
        const p=P[q],dx=x-p[0],dy=y-p[1],d2=dx*dx+dy*dy;
        if(d2<=r2){const z=p[2]+Math.sqrt(r2-d2);if(z>h)h=z;}
      }
      // facette
      const n=T.n;
      if(n[2]>1e-9){
        const cx=x-n[0]*rr,cy=y-n[1]*rr; // point de contact XY
        if(inTri(cx,cy,T.A,T.B,T.C)){
          const A=T.A;
          // plan : n·(X−A)=0 → z du plan en (cx,cy)
          const zc=A[2]-(n[0]*(cx-A[0])+n[1]*(cy-A[1]))/n[2];
          const z=zc+n[2]*rr;
          if(z>h)h=z;
        }
      }
      // arêtes
      for(let q=0;q<3;q++){
        const p=P[q],s=P[(q+1)%3];
        const ex=s[0]-p[0],ey=s[1]-p[1],ez=s[2]-p[2];
        const el=Math.sqrt(ex*ex+ey*ey+ez*ez);
        if(!(el>1e-12))continue;
        const ux=ex/el,uy=ey/el,uz=ez/el;
        const ax=x-p[0],ay=y-p[1],az=-p[2];
        // (a+hk)×u = A + hB
        const Ax=ay*uz-az*uy,Ay=az*ux-ax*uz,Az=ax*uy-ay*ux;
        const Bx=-uy,By=ux; // k×u = (−uy, ux, 0)
        const bb=Bx*Bx+By*By;
        if(bb<1e-12)continue;
        const ab=Ax*Bx+Ay*By;
        const aa=Ax*Ax+Ay*Ay+Az*Az;
        const disc=ab*ab-bb*(aa-r2);
        if(disc<0)continue;
        const hz=(-ab+Math.sqrt(disc))/bb;
        const t=ax*ux+ay*uy+(hz+az)*uz;
        if(t>=0&&t<=el&&hz>h)h=hz;
      }
    }
    return h;
  };
  // Disque plat de rayon rd à la cote de la pointe : cote max de la matière
  // sous le disque (sommets, arêtes coupées par le cercle, facette au centre).
  const discTip=function(x,y,rd,list){
    let h=-1/0;
    const r2=rd*rd;
    for(let k=0;k<list.length;k++){
      const T=tris[list[k]];
      if(T.zt<=h)break;
      if(x<T.x0-rd||x>T.x1+rd||y<T.y0-rd||y>T.y1+rd)continue;
      const P=[T.A,T.B,T.C];
      for(let q=0;q<3;q++){const p=P[q],dx=x-p[0],dy=y-p[1];if(dx*dx+dy*dy<=r2&&p[2]>h)h=p[2];}
      for(let q=0;q<3;q++){
        const p=P[q],s=P[(q+1)%3];
        const ex=s[0]-p[0],ey=s[1]-p[1];
        const a=ex*ex+ey*ey;if(a<1e-12)continue;
        const fx=p[0]-x,fy=p[1]-y;
        const b=2*(fx*ex+fy*ey),c=fx*fx+fy*fy-r2;
        const disc=b*b-4*a*c;if(disc<0)continue;
        const sq=Math.sqrt(disc);
        for(const t of [(-b-sq)/(2*a),(-b+sq)/(2*a)]){
          if(t>=0&&t<=1){const z=p[2]+(s[2]-p[2])*t;if(z>h)h=z;}
        }
        // portion intérieure : extrémités déjà vues (sommets dans le disque)
      }
      const n=T.n;
      if(n[2]>1e-9){
        // point le plus haut du plan dans le disque, s'il est dans la facette
        const gl=Math.hypot(n[0],n[1]);
        const px=gl>1e-12?x-n[0]/gl*rd:x, py=gl>1e-12?y-n[1]/gl*rd:y;
        for(const q of [[x,y],[px,py]]){
          if(inTri(q[0],q[1],T.A,T.B,T.C)){
            const A=T.A;const z=A[2]-(n[0]*(q[0]-A[0])+n[1]*(q[1]-A[1]))/n[2];
            if(z>h)h=z;
          }
        }
      }
    }
    return h;
  };
  const NS=24;
  const tip=function(x,y){
    const list=cellOf(x,y);
    if(!list||!list.length)return -1/0;
    if(kind==='flat')return discTip(x,y,Rt+L,list);
    if(kind==='bull'&&r<Rt-1e-9){
      // torique : anneau de boules (rayon r+L) au rayon Rt−r + disque central
      let h=discTip(x,y,Rt-r,list)-0; // pointe posée à plat
      const rc=Rt-r;
      for(let s=0;s<NS;s++){
        const a=2*Math.PI*s/NS;
        const c=ballCenter(x+rc*Math.cos(a),y+rc*Math.sin(a),r+L,list);
        if(c-r>h)h=c-r;
      }
      return h;
    }
    const c=ballCenter(x,y,Rt+L,list);
    return c===-1/0?-1/0:c-Rt;
  };
  return {tip:tip,r:r,Rt:Rt,L:L};
}

// Marching triangles orientés : segments (A→B) avec la valeur HAUTE à gauche
// (vu depuis l'extérieur de la surface). Les points portent la clé de l'arête
// coupée → chaînage exact O(n). Renvoie des chaînes {pts,closed} où chaque
// point = {p,n,e:[a,b,t]} (sommets de l'arête et paramètre).
function faoScIso(V,N,T,F,iso,cand){
  const segs=[];
  const above=function(v){return v>=iso;};
  const mk=function(a,b){
    const fa=F[a],fb=F[b];
    const t=(iso-fa)/(fb-fa);
    const A=V[a],B=V[b],NA=N[a],NB=N[b];
    return {k:a<b?a*4194304+b:b*4194304+a,a:a,b:b,t:t,
      p:[A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t],
      n:[NA[0]+(NB[0]-NA[0])*t,NA[1]+(NB[1]-NA[1])*t,NA[2]+(NB[2]-NA[2])*t]};
  };
  const nT=cand?cand.length:T.length;
  for(let ci=0;ci<nT;ci++){
    const i=cand?cand[ci]:ci;
    const t=T[i];
    const f0=F[t[0]],f1=F[t[1]],f2=F[t[2]];
    if(!(f0<1/0&&f1<1/0&&f2<1/0)||!(f0>-1/0&&f1>-1/0&&f2>-1/0))continue;
    const s0=above(f0),s1=above(f1),s2=above(f2);
    if(s0===s1&&s1===s2)continue;
    // sommet isolé (seul de son côté) : l'iso coupe ses deux arêtes
    let lone,o1,o2;
    if(s0!==s1&&s0!==s2){lone=0;}else if(s1!==s0&&s1!==s2){lone=1;}else{lone=2;}
    const vl=t[lone],va=t[(lone+1)%3],vb=t[(lone+2)%3];
    const P=mk(vl,va),Q=mk(vl,vb);
    // orientation : triangle (vl,va,vb) CCW vu de l'extérieur. Si vl est HAUT,
    // il doit être à gauche de P→Q ; P sur vl-va, Q sur vl-vb : vl à gauche de
    // P→Q ⇔ ordre Q→P (vl,va,vb CCW). Vérifié par produit mixte.
    const A=V[vl],B=V[va],C=V[vb];
    const nx=(B[1]-A[1])*(C[2]-A[2])-(B[2]-A[2])*(C[1]-A[1]);
    const ny=(B[2]-A[2])*(C[0]-A[0])-(B[0]-A[0])*(C[2]-A[2]);
    const nz=(B[0]-A[0])*(C[1]-A[1])-(B[1]-A[1])*(C[0]-A[0]);
    const dx=Q.p[0]-P.p[0],dy=Q.p[1]-P.p[1],dz=Q.p[2]-P.p[2];
    const hx=A[0]-P.p[0],hy=A[1]-P.p[1],hz=A[2]-P.p[2];
    // (d × h)·n > 0 ⇔ vl à gauche de P→Q
    const cx=dy*hz-dz*hy,cy=dz*hx-dx*hz,cz=dx*hy-dy*hx;
    let left=cx*nx+cy*ny+cz*nz>0;
    const highLone=above(F[vl]);
    if(left===highLone)segs.push([P,Q]); else segs.push([Q,P]);
  }
  // chaînage par clé d'arête
  const byStart=new Map();
  for(let i=0;i<segs.length;i++){
    const k=segs[i][0].k;
    if(!byStart.has(k))byStart.set(k,i);
  }
  const used=new Uint8Array(segs.length);
  const hasEnd=new Set();
  for(let i=0;i<segs.length;i++)hasEnd.add(segs[i][1].k);
  const chains=[];
  const walk=function(s0){
    const pts=[segs[s0][0]];
    let s=s0,closed=false,guard=0;
    while(s!==undefined&&!used[s]&&guard++<1e7){
      used[s]=1;
      pts.push(segs[s][1]);
      const nk=segs[s][1].k;
      if(nk===segs[s0][0].k){closed=true;break;}
      s=byStart.get(nk);
    }
    return {pts:pts,closed:closed};
  };
  // d'abord les chaînes OUVERTES (départ sans prédécesseur), puis les boucles
  for(let i=0;i<segs.length;i++)if(!used[i]&&!hasEnd.has(segs[i][0].k))chains.push(walk(i));
  for(let i=0;i<segs.length;i++)if(!used[i])chains.push(walk(i));
  return chains;
}

// Index des triangles par tranche de valeur du champ (largeur w) : l'iso v
// ne lit que les triangles de la tranche floor(v/w) — au lieu de tout le
// maillage à chaque niveau.
function faoScBuckets(T,F,w){
  const B=new Map();
  for(let i=0;i<T.length;i++){
    const t=T[i];
    const a=F[t[0]],b=F[t[1]],c=F[t[2]];
    if(!(a<1/0&&b<1/0&&c<1/0))continue;
    const lo=Math.min(a,b,c),hi=Math.max(a,b,c);
    const k0=Math.floor(lo/w),k1=Math.floor(hi/w);
    for(let k=k0;k<=k1;k++){let L=B.get(k);if(!L){L=[];B.set(k,L);}L.push(i);}
  }
  return function(v){return B.get(Math.floor(v/w))||[];};
}
function* faoGenScallopIt(mesh,o){
  o=o||{};
  if(!mesh||!mesh.v||!mesh.v.length)return [];
  const t0=Date.now();
  const D=isFinite(+o.toolD)&&+o.toolD>0?+o.toolD:8;
  const kind=o.kind||'ball';
  const Rc=kind==='flat'?0:(kind==='bull'?Math.min(D/2,isFinite(+o.cornerR)?+o.cornerR:D/2):D/2);
  const L=isFinite(+o.laisse)&&+o.laisse>0?+o.laisse:0;
  const R=Rc+L;
  const secu=isFinite(+o.secu)?+o.secu:5;
  const step=isFinite(+o.step)&&+o.step>0?+o.step:1;
  const zoneAt0=(typeof o.zoneAt==='function')?o.zoneAt:null;
  // Cache en grille (1 mm) du test de zone : une cellule dont les 4 coins
  // ont la même réponse est réputée uniforme ; sinon test exact.
  const zoneAt=zoneAt0?(function(){
    const g=1,cells=new Map(),corner=new Map();
    const cz=function(i,j){const k=i*131071+j;let v=corner.get(k);
      if(v===undefined){v=zoneAt0(i*g,j*g)?1:0;corner.set(k,v);}return v;};
    return function(x,y){
      const i=Math.floor(x/g),j=Math.floor(y/g),k=i*131071+j;
      let c=cells.get(k);
      if(c===undefined){const a=cz(i,j),b=cz(i+1,j),d=cz(i,j+1),e=cz(i+1,j+1);
        c=(a===b&&b===d&&d===e)?a:2;cells.set(k,c);}
      return c===2?zoneAt0(x,y):c===1;
    };
  })():null;
  let zmax=-1/0,zmin=1/0;
  for(let i=0;i<mesh.v.length;i++){const z=mesh.v[i][2];if(z>zmax)zmax=z;if(z<zmin)zmin=z;}
  const zt=Math.min(isFinite(+o.ztop)?+o.ztop:zmax,zmax)+1e-6;
  const zb=Math.max(isFinite(+o.zbot)?+o.zbot:zmin,zmin)-1e-6;
  const moves=[];
  const diag={fronts:0,rings:[],rest:0,tris:0,ms:0};
  try{moves.diag=diag;}catch(e){}
  // fraise droite : pas de pente (contrat historique de la finition géodésique)
  if(kind==='flat'){
    const G=faoGeoFlags(mesh,zb,zt);
    if(G.anySlope)return moves;
  }
  const drop=faoScDropper(mesh,kind,D,Rc,L);
  // --- 1. région : appartenance d'un point de contact (p, n) --------------
  // Axe outil pour un contact (p, n) : centre du tore/de la boule = p + n·r
  // (r = rayon de coin + laisse), puis axe décalé de (D/2 − r) dans la
  // direction horizontale de la normale (torique / fraise droite ; boule : 0).
  const Rt=D/2,ax0=Math.max(0,Rt-Rc);
  const toolXY=function(p,n){
    const l=Math.hypot(n[0],n[1],n[2])||1;
    let x=p[0]+n[0]/l*R,y=p[1]+n[1]/l*R;
    if(ax0>1e-9){const h=Math.hypot(n[0],n[1]);if(h>1e-6){x+=n[0]/h*ax0;y+=n[1]/h*ax0;}}
    return [x,y];
  };
  // Centre outil 3D (surface décrite par le centre de la boule / du tore) :
  // MÉTRIQUE des distances. Fusion mesure l'écart des passes sur cette
  // surface décalée et non sur la pièce : sur un arrondi convexe de petit
  // rayon, 1 mm de pièce = un grand balayage de l'outil (cav.txt : 49,86 →
  // 49,41 → 48,69 au bord ; mesuré sur la pièce on sautait à 47,69).
  const toolC=function(p,n){
    const l=Math.hypot(n[0],n[1],n[2])||1;
    const xy=toolXY(p,n);
    return [xy[0],xy[1],p[2]+n[2]/l*R];
  };
  const NZMIN=-0.05;
  const memb=function(p,n){
    const l=Math.hypot(n[0],n[1],n[2])||1;
    const nz=n[2]/l;
    if(nz<NZMIN)return false;
    if(p[2]<zb||p[2]>zt)return false;
    if(zoneAt){
      // tolérance 0,05 mm : une limite tracée PILE sur une arête vive (bord
      // de cavité) rend le bord de région instable (dents de scie) ; dilatée
      // de 0,05 elle se pose proprement sur la face voisine.
      const xy=toolXY(p,n),x=xy[0],y=xy[1],e=0.05;
      if(!zoneAt(x,y)&&!zoneAt(x+e,y)&&!zoneAt(x-e,y)&&!zoneAt(x,y+e)&&!zoneAt(x,y-e))return false;
    }
    return true;
  };
  const h=Math.max(0.35,Math.min(2,step*1.0));
  const M=faoScRefine(mesh,h,memb,160000);
  const V=M.v,N=M.n,T=M.t,nv=V.length;
  diag.tris=T.length;
  yield moves;
  const inside=new Uint8Array(nv);
  for(let i=0;i<nv;i++)inside[i]=memb(V[i],N[i])?1:0;
  const vt=[];for(let i=0;i<nv;i++)vt.push([]);
  for(let i=0;i<T.length;i++){const t=T[i];vt[t[0]].push(i);vt[t[1]].push(i);vt[t[2]].push(i);}
  // --- 2. bord de la région : points de coupure par dichotomie ------------
  const cut=new Map(); // clé arête → {k,p}
  const ekey=function(a,b){return a<b?a*4194304+b:b*4194304+a;};
  const cutOf=function(a,b){
    const k=ekey(a,b);
    let c=cut.get(k);
    if(c)return c;
    // a dedans, b dehors
    const ia=inside[a]?a:b, ob=inside[a]?b:a;
    const A=V[ia],B=V[ob],NA=N[ia],NB=N[ob];
    let lo=0,hi=1;
    for(let it=0;it<9;it++){
      const m=(lo+hi)/2;
      const p=[A[0]+(B[0]-A[0])*m,A[1]+(B[1]-A[1])*m,A[2]+(B[2]-A[2])*m];
      const n=[NA[0]+(NB[0]-NA[0])*m,NA[1]+(NB[1]-NA[1])*m,NA[2]+(NB[2]-NA[2])*m];
      if(memb(p,n))lo=m; else hi=m;
    }
    const m=(lo+hi)/2;
    const pm=[A[0]+(B[0]-A[0])*m,A[1]+(B[1]-A[1])*m,A[2]+(B[2]-A[2])*m];
    c={k:k,p:pm,c:toolC(pm,[NA[0]+(NB[0]-NA[0])*m,NA[1]+(NB[1]-NA[1])*m,NA[2]+(NB[2]-NA[2])*m])};
    cut.set(k,c);
    return c;
  };
  // segments de bord (dans chaque triangle mixte) + bords du maillage
  const bsegs=[]; // {a:point de coupure, b:point de coupure, tri, mb?:[arête bord maillage]}
  const ecount=new Map();
  for(let i=0;i<T.length;i++){const t=T[i];
    for(let e=0;e<3;e++){const k=ekey(t[e],t[(e+1)%3]);ecount.set(k,(ecount.get(k)||0)+1);}}
  for(let i=0;i<T.length;i++){
    const t=T[i];
    const s=[inside[t[0]],inside[t[1]],inside[t[2]]];
    const ni=s[0]+s[1]+s[2];
    if(ni===0)continue;
    if(ni<3){
      let lone;
      if(ni===1)lone=s[0]?0:(s[1]?1:2); else lone=!s[0]?0:(!s[1]?1:2);
      const vl=t[lone],va=t[(lone+1)%3],vb=t[(lone+2)%3];
      const P=cutOf(vl,va),Q=cutOf(vl,vb);
      bsegs.push({a:P,b:Q,tri:i});
    }else{
      // arête frontière du maillage (1 seule face) dans la région
      for(let e=0;e<3;e++){
        const a=t[e],b=t[(e+1)%3];
        if(ecount.get(ekey(a,b))===1){
          const ka=-1-a,kb=-1-b;
          bsegs.push({a:{k:ka,p:V[a],c:toolC(V[a],N[a])},b:{k:kb,p:V[b],c:toolC(V[b],N[b])},tri:i,mb:[a,b]});
        }
      }
    }
  }
  if(!bsegs.length){diag.ms=Date.now()-t0;return moves;}
  // --- composantes du bord = fronts (union-find par clés partagées) ------
  const par=new Map();
  const find=function(k){let r=k;while(par.get(r)!==r)r=par.get(r);
    let x=k;while(par.get(x)!==r){const nx=par.get(x);par.set(x,r);x=nx;}return r;};
  const uni=function(a,b){if(!par.has(a))par.set(a,a);if(!par.has(b))par.set(b,b);
    const ra=find(a),rb=find(b);if(ra!==rb)par.set(ra,rb);};
  bsegs.forEach(function(s){uni(s.a.k,s.b.k);});
  const frontOf=new Map();let nF=0;
  const fseg=[];
  bsegs.forEach(function(s){const r=find(s.a.k);
    if(!frontOf.has(r)){frontOf.set(r,nF++);fseg.push([]);}
    fseg[frontOf.get(r)].push(s);});
  // fronts minuscules (îlots de quelques triangles : bruit) écartés
  const flen=fseg.map(function(ss){let l=0;ss.forEach(function(s){l+=Math.hypot(s.a.p[0]-s.b.p[0],s.a.p[1]-s.b.p[1],s.a.p[2]-s.b.p[2]);});return l;});
  let fronts=[];
  for(let f=0;f<nF;f++)if(flen[f]>=Math.max(2*step,D*0.5))fronts.push(f);
  if(fronts.length>12){
    fronts.sort(function(a,b){return flen[b]-flen[a];});
    fronts=fronts.slice(0,12);
  }
  // ordre : du plus bas au plus haut (cote moyenne du bord)
  const fz={};
  fronts.forEach(function(f){let s=0,n=0;fseg[f].forEach(function(g){s+=g.a.p[2]+g.b.p[2];n+=2;});fz[f]=s/Math.max(1,n);});
  fronts.sort(function(a,b){return fz[a]-fz[b];});
  diag.fronts=fronts.length;
  // --- 3. champs de distance (FMM) par front ------------------------------
  const ptSeg=function(P,A,B){
    const ex=B[0]-A[0],ey=B[1]-A[1],ez=B[2]-A[2];
    const l2=ex*ex+ey*ey+ez*ez;
    let u=l2>0?((P[0]-A[0])*ex+(P[1]-A[1])*ey+(P[2]-A[2])*ez)/l2:0;
    if(u<0)u=0;else if(u>1)u=1;
    return Math.hypot(A[0]+ex*u-P[0],A[1]+ey*u-P[1],A[2]+ez*u-P[2]);
  };
  const okV=inside;
  const VC=new Array(nv);for(let i=0;i<nv;i++)VC[i]=toolC(V[i],N[i]);
  const fields=[];
  for(let fi=0;fi<fronts.length;fi++){
    const f=fronts[fi];
    const d=new Float64Array(nv).fill(1/0);
    fseg[f].forEach(function(s){
      const t=T[s.tri];
      for(let q=0;q<3;q++){
        const v=t[q];
        const dd=ptSeg(VC[v],s.a.c,s.b.c);
        if(inside[v]){if(dd<d[v])d[v]=dd;}
      }
    });
    // bord du maillage : sommets du bord à 0
    fseg[f].forEach(function(s){if(s.mb){d[s.mb[0]]=0;d[s.mb[1]]=0;}});
    faoScFMM(VC,T,vt,d,okV);
    // sommets extérieurs des triangles mixtes de CE front : valeur négative
    // (le champ traverse le bord → l'iso 0 = le bord lui-même)
    const neg=new Map();
    fseg[f].forEach(function(s){
      if(s.mb)return;
      const t=T[s.tri];
      for(let q=0;q<3;q++){
        const v=t[q];
        if(inside[v])continue;
        const dd=ptSeg(VC[v],s.a.c,s.b.c);
        const o2=neg.get(v);
        if(o2===undefined||dd<o2)neg.set(v,dd);
      }
    });
    neg.forEach(function(dd,v){d[v]=-dd;});
    fields.push(d);
    yield moves;
  }
  // --- 4. anneaux par front -------------------------------------------------
  const margin=step*0.5;
  const covered=new Array(fronts.length).fill(-1); // niveau couvert (mm)
  const loops=[]; // {g groupe, lvl niveau, iso, pts:[points de contact], closed, rest?}
  const interp=function(F,pt){const fa=F[pt.a],fb=F[pt.b];
    if(!(fa<1/0)||!(fb<1/0))return 1/0;
    return fa+(fb-fa)*pt.t;};
  const lenOf=function(pts){let l=0;for(let i=1;i<pts.length;i++)l+=Math.hypot(pts[i].p[0]-pts[i-1].p[0],pts[i].p[1]-pts[i-1].p[1],pts[i].p[2]-pts[i-1].p[2]);return l;};
  const minLoop=Math.max(step*1.5,0.5);
  const tolV=step*0.25;
  for(let fi=0;fi<fronts.length;fi++){
    const F=fields[fi];
    const bk=faoScBuckets(T,F,step);
    let fmax=0;for(let i=0;i<nv;i++)if(inside[i]&&F[i]<1/0&&F[i]>fmax)fmax=F[i];
    let ringCount=0;
    for(let k=0;;k++){
      // anneau 0 à 0,1 mm du bord : absorbe les écarts d'interpolation (normale,
      // corde) qui le feraient sortir de la zone de quelques centièmes
      const iso=k===0?Math.min(0.1,step*0.1):k*step;
      if(iso>fmax+1e-9)break;
      const ch=faoScIso(V,N,T,F,iso,bk(iso)).filter(function(c){return lenOf(c.pts)>=minLoop*(c.closed?1:0.25);});
      if(!ch.length)break;
      let valid=true;
      for(let c=0;c<ch.length&&valid;c++){
        if(!ch[c].closed){valid=false;break;}
        const pts=ch[c].pts;
        for(let j=0;j<pts.length&&valid;j+=2){
          // TERRITOIRE (Voronoi géodésique) : l'anneau reste plus près de
          // son bord que de tout autre — les fronts se rencontrent au milieu.
          for(let gi=0;gi<fronts.length;gi++){
            if(gi===fi)continue;
            const dg=interp(fields[gi],pts[j]);
            if(dg<iso-tolV||dg<margin){valid=false;break;}
          }
          if(!inside[pts[j].a]&&!inside[pts[j].b]&&k>0)valid=false;
        }
      }
      if(!valid)break;
      ch.forEach(function(c){loops.push({g:fi,lvl:k,iso:iso,pts:c.pts,closed:true});});
      covered[fi]=k*step;
      ringCount++;
      if(ringCount%8===0)yield moves;
    }
    diag.rings.push(ringCount);
  }
  // --- 5. zones restantes : lentilles concentriques ----------------------
  {
    const dL=new Float64Array(nv).fill(1/0);
    let any=false;
    for(let i=0;i<nv;i++){
      let m=1/0;
      for(let fi=0;fi<fronts.length;fi++){
        const c=covered[fi]<0?0:covered[fi];
        const v=fields[fi][i]-c;
        if(v<m)m=v;
      }
      dL[i]=m;
      if(inside[i]&&m>0&&m<1/0)any=true;
    }
    if(any){
      // composantes connexes des sommets restants (dL>0) pour Mx par zone
      const comp=new Int32Array(nv).fill(-1);
      const Mx=[];
      for(let i=0;i<nv;i++){
        if(comp[i]>=0||!inside[i]||!(dL[i]>0)||!(dL[i]<1/0))continue;
        const id=Mx.length;Mx.push(0);
        const st=[i];comp[i]=id;
        while(st.length){
          const u=st.pop();
          if(dL[u]>Mx[id])Mx[id]=dL[u];
          const tl=vt[u];
          for(let k=0;k<tl.length;k++){const t=T[tl[k]];
            for(let q=0;q<3;q++){const w=t[q];
              if(comp[w]<0&&inside[w]&&dL[w]>0&&dL[w]<1/0){comp[w]=id;st.push(w);}}}
        }
      }
      // niveaux par zone : Δ = Mx/(n+½), n = ceil(Mx/pas − ½)
      const lv=new Map();
      Mx.forEach(function(mx,id){
        const n=Math.ceil(mx/step-0.5);
        if(n<1)return;
        const dl=mx/(n+0.5);
        for(let m=1;m<=n;m++){const key=(m*dl).toFixed(6);
          if(!lv.has(key))lv.set(key,{iso:m*dl,m:m,zones:new Set()});
          lv.get(key).zones.add(id);}
      });
      const isoList=Array.from(lv.values()).sort(function(a,b){return a.iso-b.iso;});
      const bkL=faoScBuckets(T,dL,step);
      for(let q=0;q<isoList.length;q++){
        const it=isoList[q];
        const ch=faoScIso(V,N,T,dL,it.iso,bkL(it.iso));
        ch.forEach(function(c){
          // micro-boucles (bosse de champ < quelques mm) : bruit, couvert par
          // les passes voisines — écartées
          if(!c.closed||lenOf(c.pts)<Math.max(4*step,D))return;
          const p0=c.pts[0];
          const z=comp[inside[p0.a]?p0.a:p0.b];
          if(z<0||!it.zones.has(z))return;
          loops.push({g:fronts.length+z,lvl:it.m,iso:it.iso,pts:c.pts,closed:true,rest:1});
          diag.rest++;
        });
        if(q%6===5)yield moves;
      }
    }
  }
  // --- 6. positions outil -------------------------------------------------
  const toolPt=function(q,noDrop){
    const l=Math.hypot(q.n[0],q.n[1],q.n[2])||1;
    const xy=toolXY(q.p,q.n),x=xy[0],y=xy[1];
    let z=noDrop?-1/0:drop.tip(x,y);
    if(!(z>-1/0))z=q.p[2]+q.n[2]/l*R-Rc;
    return {x:x,y:y,z:z};
  };
  const simplify=function(P,tol){
    // Douglas-Peucker itératif 3D (boucle fermée : extrémités fixes)
    if(P.length<4)return P;
    const keep=new Uint8Array(P.length);keep[0]=1;keep[P.length-1]=1;
    const st=[[0,P.length-1]];
    while(st.length){
      const s=st.pop(),a=s[0],b=s[1];
      if(b<=a+1)continue;
      const A=P[a],B=P[b];
      const ex=B.x-A.x,ey=B.y-A.y,ez=B.z-A.z,l2=ex*ex+ey*ey+ez*ez;
      let dm=-1,im=-1;
      for(let i=a+1;i<b;i++){const p=P[i];
        let u=l2>0?((p.x-A.x)*ex+(p.y-A.y)*ey+(p.z-A.z)*ez)/l2:0;if(u<0)u=0;else if(u>1)u=1;
        const d=Math.hypot(A.x+ex*u-p.x,A.y+ey*u-p.y,A.z+ez*u-p.z);
        if(d>dm){dm=d;im=i;}}
      if(dm>tol){keep[im]=1;st.push([a,im],[im,b]);}
    }
    const out=[];for(let i=0;i<P.length;i++)if(keep[i])out.push(P[i]);
    return out;
  };
  const tol=0.003;
  // Lissage XY d'une boucle fermée : ré-échantillonnage 0,4 mm puis noyau
  // gaussien σ ≈ 0,8 mm (bruit d'interpolation à l'échelle du maillage
  // raffiné, ±0,1-0,3 mm) — la forme (rayon ≫ σ) est conservée ; Z recalculé
  // par descente outil ensuite (jamais de surcoupe).
  const smoothLoop=function(P){
    const n0=P.length-1;
    if(n0<4)return P;
    let Ltot=0;const cum=[0];
    for(let i=1;i<=n0;i++){Ltot+=Math.hypot(P[i].x-P[i-1].x,P[i].y-P[i-1].y);cum.push(Ltot);}
    if(!(Ltot>3))return P;
    const ds=0.4,n=Math.max(8,Math.round(Ltot/ds));
    const R2=[];let k=0;
    for(let j=0;j<n;j++){const sv=Ltot*j/n;
      while(k<n0-1&&cum[k+1]<sv)k++;
      const sl=cum[k+1]-cum[k],u=sl>0?(sv-cum[k])/sl:0;
      R2.push({x:P[k].x+(P[k+1].x-P[k].x)*u,y:P[k].y+(P[k+1].y-P[k].y)*u,z:P[k].z+(P[k+1].z-P[k].z)*u});}
    const dsr=Ltot/n;
    const gauss=function(sigMM){
      const sig=sigMM/dsr,W=Math.min(Math.floor(n/2)-1,Math.ceil(sig*2.5)),w=[];let ws=0;
      for(let q=-W;q<=W;q++){const v=Math.exp(-0.5*q*q/(sig*sig));w.push(v);ws+=v;}
      const o2=new Array(n);
      for(let j=0;j<n;j++){let x=0,y=0;
        for(let q=-W;q<=W;q++){const p=R2[((j+q)%n+n)%n],v=w[q+W];x+=p.x*v;y+=p.y*v;}
        o2[j]={x:x/ws,y:y/ws};}
      return o2;
    };
    const A=gauss(0.8);
    // Lissage ADAPTATIF : une boucle posée sur une arête vive convexe (bord de
    // cavité) voit sa position outil osciller (±0,4 mm, période ~5 mm — un
    // contact sur l'arête = tout un éventail de normales). Là où le bruit
    // résiduel |brut − A| moyen sur ±2 mm dépasse 0,05 mm, on bascule
    // progressivement vers un noyau large (σ 2 mm).
    const res=new Float64Array(n);for(let j=0;j<n;j++)res[j]=Math.hypot(R2[j].x-A[j].x,R2[j].y-A[j].y);
    const Wm=Math.max(1,Math.round(2/dsr));
    const rm=new Float64Array(n);{let acc=0;for(let q=-Wm;q<=Wm;q++)acc+=res[((q%n)+n)%n];
      for(let j=0;j<n;j++){rm[j]=acc/(2*Wm+1);acc+=res[(j+Wm+1)%n]-res[((j-Wm)%n+n)%n];}}
    let noisy=false;for(let j=0;j<n;j++)if(rm[j]>0.05){noisy=true;break;}
    const B=noisy?gauss(2.0):null;
    const out=[];
    for(let j=0;j<n;j++){let x=A[j].x,y=A[j].y;
      if(B){const wB=Math.max(0,Math.min(1,(rm[j]-0.05)/0.1));x=x*(1-wB)+B[j].x*wB;y=y*(1-wB)+B[j].y*wB;}
      // le lissage contracte la boucle vers son centre de courbure : un
      // anneau qui longe un îlot pourrait y entrer — point brut dans ce cas
      if(zoneAt&&!zoneAt(x,y)&&!zoneAt(x+0.05,y)&&!zoneAt(x-0.05,y)&&!zoneAt(x,y+0.05)&&!zoneAt(x,y-0.05)){x=R2[j].x;y=R2[j].y;}
      let z=drop.tip(x,y);if(!(z>-1/0))z=R2[j].z;
      out.push({x:x,y:y,z:z});}
    out.push({x:out[0].x,y:out[0].y,z:out[0].z});
    return out;
  };
  loops.forEach(function(lp){
    let P=lp.pts.map(function(q){return toolPt(q,lp.closed);});
    // boucle fermée : dernier = premier exactement, puis lissage
    if(lp.closed){P[P.length-1]={x:P[0].x,y:P[0].y,z:P[0].z};P=smoothLoop(P);}
    // sous-échantillonnage de sécurité : segments ≤ 2 mm (Z suit la descente)
    const Q=[P[0]];
    for(let i=1;i<P.length;i++){
      const a=Q[Q.length-1],b=P[i];
      const dl=Math.hypot(b.x-a.x,b.y-a.y);
      if(dl>2){const ns=Math.ceil(dl/1);
        for(let s=1;s<ns;s++){const x=a.x+(b.x-a.x)*s/ns,y=a.y+(b.y-a.y)*s/ns;
          let z=drop.tip(x,y);if(!(z>-1/0))z=a.z+(b.z-a.z)*s/ns;Q.push({x:x,y:y,z:z});}}
      Q.push(b);
    }
    lp.tp=simplify(Q,tol);
    let l=0;for(let i=1;i<lp.tp.length;i++)l+=Math.hypot(lp.tp[i].x-lp.tp[i-1].x,lp.tp[i].y-lp.tp[i-1].y,lp.tp[i].z-lp.tp[i-1].z);
    lp.len=l;
  });
  yield moves;
  const near=function(lp,P){
    let bi=0,bd=1/0;const tp=lp.tp;
    for(let i=0;i<tp.length-1;i++){const dx=tp[i].x-P.x,dy=tp[i].y-P.y,dz=tp[i].z-P.z,d=dx*dx+dy*dy+dz*dz;if(d<bd){bd=d;bi=i;}}
    return {i:bi,d:Math.sqrt(bd)};
  };
  // Parenté des boucles : B (niveau m+1) est fille de A (niveau m, même
  // groupe) si elle passe à moins de 2,5 pas + R/2 de A. Une boucle n'est
  // DISPONIBLE que si toutes ses mères sont faites : on vide un nid (lentille,
  // anneaux) avant d'aller ailleurs, comme Fusion.
  const parents=loops.map(function(){return [];});
  {
    const byGL=new Map();
    loops.forEach(function(lp,i){const k=lp.g+'|'+lp.lvl;(byGL.get(k)||byGL.set(k,[]).get(k)).push(i);});
    const thr=step*2.5+R*0.5;
    loops.forEach(function(lp,i){
      const L=byGL.get(lp.g+'|'+(lp.lvl-1));if(!L)return;
      const stp=Math.max(1,Math.floor(lp.tp.length/60));
      L.forEach(function(j){
        const A=loops[j];let dmin=1/0;
        for(let q=0;q<lp.tp.length;q+=stp){const r=near(A,lp.tp[q]);if(r.d<dmin)dmin=r.d;if(dmin<=thr)break;}
        if(dmin<=thr)parents[i].push(j);
      });
    });
  }
  // sens : côté usiné à DROITE ; « bidir » alterne d'un anneau à l'autre
  const bidir=(o.sens==='bidir');
  // --- 7. séquences et liaisons ------------------------------------------
  const rE=Math.max(1,Math.min(5,D*0.8)); // rayon des arcs verticaux entrée/sortie
  const adv=Math.max(step,D*0.75);        // avance de la liaison en S
  const dropZ=function(x,y,zMin){let z=drop.tip(x,y);if(!(z>-1/0))z=zMin;return Math.max(z,zMin);};
  const used=new Uint8Array(loops.length);
  // rotation d'une boucle fermée (dernier = premier) : départ à l'abscisse s
  // comptée depuis l'indice i dans le sens de parcours.
  const rotate=function(tp,i,s){
    const n=tp.length-1;
    if(n<2)return tp.slice();
    const out=[];
    if(!(s>0)){
      out.push({x:tp[i].x,y:tp[i].y,z:tp[i].z});
      for(let g=1;g<n;g++)out.push(tp[(i+g)%n]);
      out.push({x:tp[i].x,y:tp[i].y,z:tp[i].z});
      return out;
    }
    let k=i,acc=0,pt=null;
    for(let g=0;g<n;g++){
      const a=tp[k],b=tp[k+1];
      const sl=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z);
      if(acc+sl>=s){const u=sl>0?(s-acc)/sl:0;
        pt={x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u,z:a.z+(b.z-a.z)*u};
        // point interpolé sur une corde : relevé par la descente outil (une
        // corde passe sous une surface convexe)
        pt.z=dropZ(pt.x,pt.y,pt.z);
        k=(k+1)%n;break;}
      acc+=sl;k=(k+1)%n;
    }
    if(!pt){pt={x:tp[i].x,y:tp[i].y,z:tp[i].z};k=(i+1)%n;}
    out.push(pt);
    for(let g=0;g<n;g++)out.push(tp[(k+g)%n]);
    out.push({x:pt.x,y:pt.y,z:pt.z});
    return out;
  };
  const tangentAt=function(P,i){
    const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)];
    const l=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z)||1;
    return {x:(b.x-a.x)/l,y:(b.y-a.y)/l,z:(b.z-a.z)/l};
  };
  let cur=null;      // position courante
  let curT=null;     // tangente courante
  let first=true;
  const push=function(m){moves.push(m);};
  // arc vertical (quart de cercle) depuis le haut jusqu'au point S, tangent à T
  const leadIn=function(S,Tn){
    const lh=Math.hypot(Tn.x,Tn.y)||1,ux=Tn.x/lh,uy=Tn.y/lh;
    const pts=[];
    const nA=Math.max(8,Math.min(32,Math.ceil(rE*3)));
    for(let k=0;k<=nA;k++){
      const th=(k/nA)*Math.PI/2;
      const x=S.x-rE*Math.cos(th)*ux,y=S.y-rE*Math.cos(th)*uy;
      const z=S.z+rE-rE*Math.sin(th);
      pts.push({x:x,y:y,z:k===nA?S.z:dropZ(x,y,z)});
    }
    pts[nA]={x:S.x,y:S.y,z:S.z};
    return pts;
  };
  const leadOut=function(E,Tn){
    const lh=Math.hypot(Tn.x,Tn.y)||1,ux=Tn.x/lh,uy=Tn.y/lh;
    const pts=[];
    const nA=Math.max(8,Math.min(32,Math.ceil(rE*3)));
    for(let k=1;k<=nA;k++){
      const th=(k/nA)*Math.PI/2;
      const x=E.x+rE*Math.sin(th)*ux,y=E.y+rE*Math.sin(th)*uy;
      const z=E.z+rE-rE*Math.cos(th);
      pts.push({x:x,y:y,z:dropZ(x,y,z)});
    }
    return pts;
  };
  const hopZ=function(A,B){
    // cote de saut local : max de la descente outil sur la droite AB + 5
    const dl=Math.hypot(B.x-A.x,B.y-A.y);
    const n=Math.max(1,Math.ceil(dl/1));
    let zm=Math.max(A.z,B.z);
    for(let k=0;k<=n;k++){const x=A.x+(B.x-A.x)*k/n,y=A.y+(B.y-A.y)*k/n;
      const z=drop.tip(x,y);if(z>zm)zm=z;}
    return Math.max(zm+1,Math.min(secu,zm+5));
  };
  const emitLoop=function(tp){
    for(let i=1;i<tp.length;i++)push({r:0,x:tp[i].x,y:tp[i].y,z:tp[i].z});
  };
  // orientation : côté usiné (champ bas) à droite ⇒ la boucle iso est
  // orientée « haut à gauche » par faoScIso : sens naturel = bon sens.
  let lastSense=1;
  let seqCount=0;
  for(;;){
    // départ d'une séquence : groupe le plus petit restant (fronts du bas
    // vers le haut, puis restes), parmi ses boucles DISPONIBLES (mères
    // faites) : la plus proche de la position courante (au départ du
    // programme : le niveau le plus bas)
    let gmin=1/0;
    for(let i=0;i<loops.length;i++)if(!used[i]&&loops[i].g<gmin)gmin=loops[i].g;
    if(gmin===1/0)break;
    let bi=-1,bd=1/0;
    for(let i=0;i<loops.length;i++){
      if(used[i]||loops[i].g!==gmin)continue;
      let av=true;for(let q=0;q<parents[i].length;q++)if(!used[parents[i][q]]){av=false;break;}
      if(!av)continue;
      const d=cur?near(loops[i],cur).d:loops[i].lvl;
      if(d<bd){bd=d;bi=i;}
    }
    if(bi<0){for(let i=0;i<loops.length;i++)if(!used[i]&&loops[i].g===gmin){bi=i;break;}}
    let lp=loops[bi];used[bi]=1;
    let tp=lp.tp;
    lastSense=1;
    // point de départ : proche de la position courante ET du niveau suivant
    // (une pointe de lentille éloignerait la liaison vers l'anneau suivant)
    let si=0;
    {
      let nxt=null;
      for(let i=0;i<loops.length;i++)if(!used[i]&&loops[i].g===lp.g&&loops[i].lvl===lp.lvl+1){
        if(!nxt)nxt=[];nxt.push(loops[i]);}
      let best=1/0;
      const stp=Math.max(1,Math.floor(tp.length/400));
      for(let i=0;i<tp.length-1;i+=stp){
        let c=cur?Math.hypot(tp[i].x-cur.x,tp[i].y-cur.y,tp[i].z-cur.z):0;
        if(nxt){let dn=1/0;for(let k=0;k<nxt.length;k++){const r=near(nxt[k],tp[i]);if(r.d<dn)dn=r.d;}
          c+=3*dn;}
        if(c<best){best=c;si=i;}
      }
    }
    tp=rotate(tp,si,0);
    const S=tp[0];
    const TS=tangentAt(tp,0);
    const lin=leadIn(S,TS);
    if(first){
      push({r:1,x:lin[0].x,y:lin[0].y,z:secu});
      first=false;
    }else{
      // sortie de la séquence précédente puis saut local
      const lo=leadOut(cur,curT);
      lo.forEach(function(p){push({r:0,ent:1,x:p.x,y:p.y,z:p.z});});
      const E=lo[lo.length-1];
      const H=hopZ(E,lin[0]);
      if(H>E.z+1e-9)push({r:1,x:E.x,y:E.y,z:H});
      push({r:1,x:lin[0].x,y:lin[0].y,z:H});
    }
    // descente rapide jusqu'au-dessus de l'arc d'entrée (0,5 mm), puis arc
    const zA=lin[0].z;
    push({r:1,x:lin[0].x,y:lin[0].y,z:zA+0.5});
    for(let k=0;k<lin.length;k++)push({r:0,ent:1,x:lin[k].x,y:lin[k].y,z:lin[k].z});
    emitLoop(tp);
    cur=tp[tp.length-1];curT=tangentAt(tp,tp.length-1);
    seqCount++;
    // enchaînement : niveau suivant du même groupe, proche → liaison en S
    for(;;){
      let nb=-1,nd=1/0,ni=0;
      for(let i=0;i<loops.length;i++){
        if(used[i]||loops[i].g!==lp.g||loops[i].lvl!==lp.lvl+1)continue;
        const r=near(loops[i],cur);if(r.d<nd){nd=r.d;nb=i;ni=r.i;}
      }
      if(nb<0||nd>step*2.5+R*0.5)break;
      const nx=loops[nb];used[nb]=1;
      let tq=nx.tp;
      if(bidir){lastSense=-lastSense;
        if(lastSense<0){tq=tq.slice().reverse();ni=near({tp:tq},cur).i;}}
      const a2=Math.min(adv,nx.len*0.2);
      const tr=rotate(tq,ni,a2);
      const S2=tr[0],T2=tangentAt(tr,0);
      // liaison Hermite XY (tangentes aux 2 boucles), Z = descente outil
      const chord=Math.hypot(S2.x-cur.x,S2.y-cur.y);
      const k0=chord*0.8;
      const P0={x:cur.x,y:cur.y,z:cur.z},P1={x:S2.x,y:S2.y,z:S2.z};
      const lt0=Math.hypot(curT.x,curT.y)||1,lt1=Math.hypot(T2.x,T2.y)||1;
      const sp=faoSplinePts(P0,{x:curT.x/lt0*k0,y:curT.y/lt0*k0,z:0},P1,{x:T2.x/lt1*k0,y:T2.y/lt1*k0,z:0},Math.ceil(chord/0.4));
      for(let k=1;k<sp.length;k++){
        const s=sp[k];
        const z=k===sp.length-1?S2.z:dropZ(s.x,s.y,Math.min(P0.z,P1.z)-50);
        push({r:0,tr:1,x:s.x,y:s.y,z:z});
      }
      emitLoop(tr);
      cur=tr[tr.length-1];curT=tangentAt(tr,tr.length-1);
      lp=nx;
      if(moves.length%4000<200)yield moves;
    }
    yield moves;
  }
  if(cur){
    const lo=leadOut(cur,curT);
    lo.forEach(function(p){push({r:0,ent:1,x:p.x,y:p.y,z:p.z});});
    const E=lo[lo.length-1];
    if(E.z<secu)push({r:1,x:E.x,y:E.y,z:secu});
  }
  diag.seq=seqCount;
  diag.loops=loops.length;
  diag.ms=Date.now()-t0;
  return moves;
}
function faoGenScallop(mesh,o){
  const it=faoGenScallopIt(mesh,o);
  let r;while(!(r=it.next()).done){}
  return r.value;
}
