/* ─────────────────────────────────────────────────────────────────────────────
   CRÊTES CONSTANTES « façon Fusion 360 » (2026-10-14-001, refonte -002) — trajectoire
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

   ALGORITHME (général, toute forme) — 2026-10-14-002 : tout se calcule sur
   la SURFACE OUTIL (cote de la pointe par descente outil sur une grille XY),
   pas sur la pièce : pas de pli dans les creux plus serrés que l'outil (la
   conversion contact + normale·R s'y repliait → passes entassées puis
   manque au pied des parois), pas d'arête vive, pas de bruit de normale.
   1. Grille XY (~0,7·pas, ≤ 300 000 nœuds dans la zone), Z = descente outil
      (boule exacte ; torique : anneau de boules + disque ; droite : disque) ;
      région = nœuds dont la POSITION OUTIL est dans la zone de l'op
      (limite ∧ ¬îlot) et dans la fenêtre Z.
   2. FRONTS = composantes connexes du bord de la région (coupé par
      dichotomie sur les arêtes, pas en marches d'escalier).
   3. Un champ de DISTANCE GÉODÉSIQUE par front sur la surface outil (Fast
      Marching : onde plane par triangle) — c'est la métrique de Fusion.
   4. Fronts du plus BAS au plus haut : anneaux d = k·pas tant que l'iso est
      faite de boucles FERMÉES restant dans le TERRITOIRE du front (plus près
      de son bord que des autres) : les fronts se rencontrent à mi-chemin.
   5. Reste : d_L = min_k (d_k − couvert_k), iso EXACTE du minimum par
      triangle (faoScIsoMin) à m·Δ, Δ = Mx/(n+½) ≤ pas.
   6. Positions outil : XY du point d'iso, Z = descente outil exacte (recul
      vers le bas de la maille sur une falaise) ; lissage gaussien XY.
   7. Séquences : anneaux d'un même groupe à niveaux consécutifs et proches →
      liaison en S au contact (Z = descente outil) ; sinon sortie en arc
      vertical, saut local, entrée en arc vertical.
   ───────────────────────────────────────────────────────────────────────── */

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
function faoScDropper(mesh,kind,D,cornerR,laisse,nsRing){
  const L=isFinite(+laisse)&&+laisse>0?+laisse:0;
  const Rt=D/2;
  const r=kind==='flat'?0:(kind==='bull'?Math.min(Rt,isFinite(+cornerR)?+cornerR:Rt):Rt);
  const reach=Rt+L+1e-6;
  // Primitives UNIQUES à plat (sommets, arêtes, facettes) : une arête n'est
  // testée qu'une fois (et non par chacun de ses deux triangles), aucune
  // allocation par requête ; listes par cellule triées par Z max décroissant
  // (arrêt dès qu'aucune primitive ne peut plus relever la pointe).
  const Vm=mesh.v;
  let x0=1/0,y0=1/0,x1=-1/0,y1=-1/0;
  for(let i=0;i<Vm.length;i++){const p=Vm[i];
    if(p[0]<x0)x0=p[0];if(p[0]>x1)x1=p[0];if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1];}
  const cs=Math.max(0.5,Rt/2);
  const nx=Math.max(1,Math.ceil((x1-x0+2*reach)/cs)+1),ny=Math.max(1,Math.ceil((y1-y0+2*reach)/cs)+1);
  const ox=x0-reach,oy=y0-reach;
  const VX=new Float64Array(Vm.length*3);
  for(let i=0;i<Vm.length;i++){VX[i*3]=Vm[i][0];VX[i*3+1]=Vm[i][1];VX[i*3+2]=Vm[i][2];}
  const usedV=new Uint8Array(Vm.length);
  const E=[],F=[]; // arêtes : [x,y,z,ux,uy,uz,len,zt] ; facettes : [9 coords, n(3), zt]
  const eseen=new Set();
  for(let i=0;i<mesh.t.length;i++){
    const t=mesh.t[i],A=Vm[t[0]],B=Vm[t[1]],C=Vm[t[2]];
    const ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2],wx=C[0]-A[0],wy=C[1]-A[1],wz=C[2]-A[2];
    let fx=uy*wz-uz*wy,fy=uz*wx-ux*wz,fz=ux*wy-uy*wx;
    const l=Math.sqrt(fx*fx+fy*fy+fz*fz);
    if(!(l>1e-12))continue;
    fx/=l;fy/=l;fz/=l;
    if(fz<0){fx=-fx;fy=-fy;fz=-fz;} // facette vue d'en haut
    usedV[t[0]]=1;usedV[t[1]]=1;usedV[t[2]]=1;
    if(fz>1e-9)F.push(A[0],A[1],A[2],B[0],B[1],B[2],C[0],C[1],C[2],fx,fy,fz,Math.max(A[2],B[2],C[2]));
    for(let e=0;e<3;e++){
      const p=t[e],q=t[(e+1)%3],k=p<q?p*4194304+q:q*4194304+p;
      if(eseen.has(k))continue;eseen.add(k);
      const P=Vm[p],Q=Vm[q];
      const ex=Q[0]-P[0],ey=Q[1]-P[1],ez=Q[2]-P[2],el=Math.sqrt(ex*ex+ey*ey+ez*ez);
      if(!(el>1e-12))continue;
      E.push(P[0],P[1],P[2],ex/el,ey/el,ez/el,el,Math.max(P[2],Q[2]));
    }
  }
  const nE=E.length/8,nF=F.length/13;
  const EA=Float64Array.from(E),FA=Float64Array.from(F);
  // listes par cellule (boîte XY élargie de la portée outil), triées Z max ↓
  const build=function(count,bbox,ztOf){
    const lists=new Array(nx*ny);
    for(let id=0;id<count;id++){
      const bb=bbox(id);
      const i0=Math.max(0,Math.floor((bb[0]-reach-ox)/cs)),i1=Math.min(nx-1,Math.floor((bb[1]+reach-ox)/cs));
      const j0=Math.max(0,Math.floor((bb[2]-reach-oy)/cs)),j1=Math.min(ny-1,Math.floor((bb[3]+reach-oy)/cs));
      for(let jj=j0;jj<=j1;jj++)for(let ii=i0;ii<=i1;ii++){const k=jj*nx+ii;(lists[k]||(lists[k]=[])).push(id);}
    }
    const out=new Array(nx*ny);
    for(let k=0;k<lists.length;k++)if(lists[k]){
      lists[k].sort(function(p,q){return ztOf(q)-ztOf(p);});
      out[k]=Int32Array.from(lists[k]);
    }
    return out;
  };
  const vIds=[];for(let i=0;i<Vm.length;i++)if(usedV[i])vIds.push(i);
  const VI=Int32Array.from(vIds);
  const GV=build(vIds.length,function(id){const i=vIds[id];return [VX[i*3],VX[i*3],VX[i*3+1],VX[i*3+1]];},function(id){return VX[vIds[id]*3+2];});
  const GE=build(nE,function(id){const o=id*8,x=EA[o],y=EA[o+1],x2=x+EA[o+3]*EA[o+6],y2=y+EA[o+4]*EA[o+6];
    return [Math.min(x,x2),Math.max(x,x2),Math.min(y,y2),Math.max(y,y2)];},function(id){return EA[id*8+7];});
  const GF=build(nF,function(id){const o=id*13;
    return [Math.min(FA[o],FA[o+3],FA[o+6]),Math.max(FA[o],FA[o+3],FA[o+6]),Math.min(FA[o+1],FA[o+4],FA[o+7]),Math.max(FA[o+1],FA[o+4],FA[o+7])];},
    function(id){return FA[id*13+12];});
  const cell=function(x,y){
    const i=Math.floor((x-ox)/cs),j=Math.floor((y-oy)/cs);
    if(i<0||j<0||i>=nx||j>=ny)return -1;
    return j*nx+i;
  };
  const inTriF=function(o,px,py){
    const ax=FA[o],ay=FA[o+1],bx=FA[o+3],by=FA[o+4],cx=FA[o+6],cy=FA[o+7];
    const d1=(px-bx)*(ay-by)-(ax-bx)*(py-by);
    const d2=(px-cx)*(by-cy)-(bx-cx)*(py-cy);
    const d3=(px-ax)*(cy-ay)-(cx-ax)*(py-ay);
    const neg=(d1<0)||(d2<0)||(d3<0),pos=(d1>0)||(d2>0)||(d3>0);
    return !(neg&&pos);
  };
  // Boule de rayon rr : cote minimale du CENTRE sans pénétration (−∞ si rien)
  const ballCenter=function(x,y,rr,k){
    let h=-1/0;
    const r2=rr*rr;
    const lv=GV[k];
    if(lv)for(let q=0;q<lv.length;q++){
      const i=VI[lv[q]]*3,pz=VX[i+2];
      if(pz+rr<=h)break;
      const dx=x-VX[i],dy=y-VX[i+1],d2=dx*dx+dy*dy;
      if(d2<=r2){const z=pz+Math.sqrt(r2-d2);if(z>h)h=z;}
    }
    const lf=GF[k];
    if(lf)for(let q=0;q<lf.length;q++){
      const o=lf[q]*13;
      if(FA[o+12]+rr<=h)break;
      const nxx=FA[o+9],nyy=FA[o+10],nzz=FA[o+11];
      const cx=x-nxx*rr,cy=y-nyy*rr;
      if(!inTriF(o,cx,cy))continue;
      const zc=FA[o+2]-(nxx*(cx-FA[o])+nyy*(cy-FA[o+1]))/nzz;
      const z=zc+nzz*rr;
      if(z>h)h=z;
    }
    const le=GE[k];
    if(le)for(let q=0;q<le.length;q++){
      const o=le[q]*8;
      if(EA[o+7]+rr<=h)break;
      const ux=EA[o+3],uy=EA[o+4],uz=EA[o+5];
      const bb=uy*uy+ux*ux;
      if(bb<1e-12)continue;
      const ax=x-EA[o],ay=y-EA[o+1],az=-EA[o+2];
      // (a+h·k)×u = A + h·B, B = k×u = (−uy, ux, 0)
      const Ax=ay*uz-az*uy,Ay=az*ux-ax*uz,Az=ax*uy-ay*ux;
      const ab=-Ax*uy+Ay*ux;
      const aa=Ax*Ax+Ay*Ay+Az*Az;
      const disc=ab*ab-bb*(aa-r2);
      if(disc<0)continue;
      const hz=(-ab+Math.sqrt(disc))/bb;
      if(hz<=h)continue;
      const t=ax*ux+ay*uy+(hz+az)*uz;
      if(t>=0&&t<=EA[o+6])h=hz;
    }
    return h;
  };
  // Disque plat de rayon rd posé à la pointe : cote max de la matière dessous
  const discTip=function(x,y,rd,k){
    let h=-1/0;
    const r2=rd*rd;
    const lv=GV[k];
    if(lv)for(let q=0;q<lv.length;q++){
      const i=VI[lv[q]]*3,pz=VX[i+2];
      if(pz<=h)break;
      const dx=x-VX[i],dy=y-VX[i+1];
      if(dx*dx+dy*dy<=r2)h=pz;
    }
    const le=GE[k];
    if(le)for(let q=0;q<le.length;q++){
      const o=le[q]*8;
      if(EA[o+7]<=h)break;
      const px=EA[o],py=EA[o+1],pz=EA[o+2],el=EA[o+6];
      const ex=EA[o+3]*el,ey=EA[o+4]*el,ez=EA[o+5]*el;
      const a=ex*ex+ey*ey;if(a<1e-12)continue;
      const fx=px-x,fy=py-y;
      const b=2*(fx*ex+fy*ey),c=fx*fx+fy*fy-r2;
      const disc=b*b-4*a*c;if(disc<0)continue;
      const sq=Math.sqrt(disc);
      const t1=(-b-sq)/(2*a),t2=(-b+sq)/(2*a);
      if(t1>=0&&t1<=1){const z=pz+ez*t1;if(z>h)h=z;}
      if(t2>=0&&t2<=1){const z=pz+ez*t2;if(z>h)h=z;}
    }
    const lf=GF[k];
    if(lf)for(let q=0;q<lf.length;q++){
      const o=lf[q]*13;
      if(FA[o+12]<=h)break;
      const nxx=FA[o+9],nyy=FA[o+10],nzz=FA[o+11];
      const gl=Math.sqrt(nxx*nxx+nyy*nyy);
      const px=gl>1e-12?x-nxx/gl*rd:x,py=gl>1e-12?y-nyy/gl*rd:y;
      for(let w=0;w<2;w++){
        const qx=w?px:x,qy=w?py:y;
        if(inTriF(o,qx,qy)){const z=FA[o+2]-(nxx*(qx-FA[o])+nyy*(qy-FA[o+1]))/nzz;if(z>h)h=z;}
      }
    }
    return h;
  };
  // anneau de boules du torique : 24 (Finition, inchangé) ; nsRing = plus fin
  // (passe torique d'ébauche 2026-10-14-007 : boule tous les ~0,5 mm)
  const NS=(nsRing>24)?Math.round(nsRing):24;
  const tip=function(x,y){
    const k=cell(x,y);
    if(k<0)return -1/0;
    if(kind==='flat')return discTip(x,y,Rt+L,k);
    if(kind==='bull'&&r<Rt-1e-9){
      // torique : anneau de boules (rayon r+L) au rayon Rt−r + disque central
      let h=discTip(x,y,Rt-r,k);
      const rc=Rt-r;
      for(let s=0;s<NS;s++){
        const an=2*Math.PI*s/NS,px=x+rc*Math.cos(an),py=y+rc*Math.sin(an);
        const kk=cell(px,py);if(kk<0)continue;
        const c=ballCenter(px,py,r+L,kk);
        if(c-r>h)h=c-r;
      }
      return h;
    }
    const c=ballCenter(x,y,Rt+L,k);
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
    let lone;
    if(s0!==s1&&s0!==s2){lone=0;}else if(s1!==s0&&s1!==s2){lone=1;}else{lone=2;}
    const vl=t[lone],va=t[(lone+1)%3],vb=t[(lone+2)%3];
    const P=mk(vl,va),Q=mk(vl,vb);
    // orientation TOPOLOGIQUE : triangle (vl,va,vb) dans le sens direct vu de
    // l'extérieur, P sur vl-va, Q sur vl-vb ⇒ vl est à GAUCHE de P→Q. Valeur
    // haute à gauche : P→Q si vl est haut, Q→P sinon. (Un test géométrique
    // échouait sur les segments de longueur nulle — iso passant pile par un
    // nœud, fréquent sur grille régulière — et rompait le chaînage.)
    if(above(F[vl]))segs.push([P,Q]); else segs.push([Q,P]);
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

// Iso-ligne EXACTE du MINIMUM de plusieurs champs linéaires par triangle
// (zones restantes : d_L = min_k(d_k − couvert_k)). Interpoler le minimum
// aux nœuds écrase son pli (milieu entre deux fronts) : sur une paroi raide
// une bande de 0,85 mm sur la surface ne fait que 0,36 mm en XY, son pic
// tombe entre les nœuds et la boucle de reste disparaissait (manque). Ici :
// chaque triangle est découpé en CELLULES (un seul champ actif, polygone
// convexe), l'iso de chaque cellule est un segment ; raccords exacts par
// clés (crossing d'arête = enveloppe le long de l'arête, identique pour les
// deux triangles voisins ; point de pli = clé locale au triangle).
// Fs : tableaux de champs (déjà décalés). Sortie : chaînes comme faoScIso,
// points {p,n,a,b,t,tri}.
function faoScIsoMin(V,T,Fs,iso,cand){
  const K=Fs.length;
  const above=function(v){return v>=iso;};
  const edgeCache=new Map();
  // croisements de l'enveloppe le long d'une arête (sens canonique a<b)
  const edgeX=function(a,b){
    const A=a<b?a:b,B=a<b?b:a,key=A*4194304+B;
    let L=edgeCache.get(key);
    if(L)return L;
    L=[];
    const act=[];
    for(let k=0;k<K;k++){const fa=Fs[k][A],fb=Fs[k][B];if(fa<1/0&&fb<1/0&&fa>-1/0&&fb>-1/0)act.push(k);}
    if(act.length){
      const br=[0,1];
      for(let i=0;i<act.length;i++)for(let j=i+1;j<act.length;j++){
        const ki=act[i],kj=act[j];
        const di=Fs[ki][B]-Fs[ki][A],dj=Fs[kj][B]-Fs[kj][A];
        const den=di-dj;if(Math.abs(den)<1e-14)continue;
        const sx=(Fs[kj][A]-Fs[ki][A])/den;if(sx>0&&sx<1)br.push(sx);
      }
      br.sort(function(x,y){return x-y;});
      const env=function(sv){let m=1/0;for(let q=0;q<act.length;q++){const k=act[q];const v=Fs[k][A]+(Fs[k][B]-Fs[k][A])*sv;if(v<m)m=v;}return m;};
      let idx=0;
      for(let q=0;q+1<br.length;q++){
        const s0=br[q],s1=br[q+1];if(s1-s0<1e-12)continue;
        const m0=env(s0),m1=env(s1);
        if(above(m0)!==above(m1)){
          // fonction linéaire sur [s0,s1] : celle qui réalise le min au milieu
          const sm=(s0+s1)/2;let kk=act[0],mv=1/0;
          for(let r=0;r<act.length;r++){const k=act[r];const v=Fs[k][A]+(Fs[k][B]-Fs[k][A])*sm;if(v<mv){mv=v;kk=k;}}
          const fa=Fs[kk][A],fb=Fs[kk][B];
          let sv=Math.abs(fb-fa)>1e-14?(iso-fa)/(fb-fa):s0;
          if(sv<s0)sv=s0;if(sv>s1)sv=s1;
          const PA=V[A],PB=V[B];
          L.push({s:sv,k:key*8+(idx++),a:A,b:B,t:sv,
            p:[PA[0]+(PB[0]-PA[0])*sv,PA[1]+(PB[1]-PA[1])*sv,PA[2]+(PB[2]-PA[2])*sv],n:[0,0,1]});
        }
      }
    }
    edgeCache.set(key,L);
    return L;
  };
  const segs=[];
  const nT=cand?cand.length:T.length;
  for(let ci=0;ci<nT;ci++){
    const ti=cand?cand[ci]:ci;
    const t=T[ti];
    const act=[];
    for(let k=0;k<K;k++){let ok=true;for(let q=0;q<3;q++){const v=Fs[k][t[q]];if(!(v<1/0&&v>-1/0)){ok=false;break;}}if(ok)act.push(k);}
    if(!act.length)continue;
    // polygone initial = triangle ; sommets {p, f[], e: index d'arête du côté (i → i+1)}
    const base=[0,1,2].map(function(q){const v=t[q];return {p:V[v].slice(),f:act.map(function(k){return Fs[k][v];}),side:q};});
    for(let ai=0;ai<act.length;ai++){
      // cellule du champ act[ai] : Fai ≤ Fj pour tout j
      let poly=base.map(function(u){return {p:u.p,f:u.f,side:u.side};});
      for(let aj=0;aj<act.length&&poly.length;aj++){
        if(aj===ai)continue;
        const out=[];
        const g=function(u){return u.f[ai]-u.f[aj];};
        for(let q=0;q<poly.length;q++){
          const u=poly[q],w=poly[(q+1)%poly.length];
          const gu=g(u),gw=g(w);
          const iu=gu<=0,iw=gw<=0;
          if(iu)out.push(u);
          if(iu!==iw){
            const r=gu/(gu-gw);
            const np={p:[u.p[0]+(w.p[0]-u.p[0])*r,u.p[1]+(w.p[1]-u.p[1])*r,u.p[2]+(w.p[2]-u.p[2])*r],
              f:u.f.map(function(v,ix){return v+(w.f[ix]-v)*r;})};
            // côté sortant : si on entre (iu faux → iw vrai) le côté qui suit
            // est celui de l'arête (u,w) ; si on sort, côté = ligne de coupe
            np.side=iu?('c'+Math.min(act[ai],act[aj])+'_'+Math.max(act[ai],act[aj])):u.side;
            out.push(np);
          }
        }
        poly=out;
      }
      if(poly.length<3)continue;
      // iso de act[ai] dans la cellule
      const k=act[ai];
      let P=null,Q=null;
      for(let q=0;q<poly.length;q++){
        const u=poly[q],w=poly[(q+1)%poly.length];
        const au=above(u.f[ai]),aw=above(w.f[ai]);
        if(au===aw)continue;
        const side=u.side;
        let pt;
        if(typeof side==='number'){
          // côté du triangle : croisement d'enveloppe de l'arête (clé partagée)
          const ea=t[side],eb=t[(side+1)%3];
          const L=edgeX(ea,eb);
          if(!L.length)continue;
          const r0=(iso-u.f[ai])/((w.f[ai]-u.f[ai])||1e-30);
          const px=u.p[0]+(w.p[0]-u.p[0])*r0,py=u.p[1]+(w.p[1]-u.p[1])*r0,pz=u.p[2]+(w.p[2]-u.p[2])*r0;
          let best=null,bd=1/0;
          for(let m=0;m<L.length;m++){const c=L[m];const d=(c.p[0]-px)*(c.p[0]-px)+(c.p[1]-py)*(c.p[1]-py)+(c.p[2]-pz)*(c.p[2]-pz);if(d<bd){bd=d;best=c;}}
          pt=best;
        }else{
          // point de pli (deux champs égaux à iso) : clé locale au triangle
          const r0=(iso-u.f[ai])/((w.f[ai]-u.f[ai])||1e-30);
          const lo=t[0];
          pt={k:'i'+ti+side,
            p:[u.p[0]+(w.p[0]-u.p[0])*r0,u.p[1]+(w.p[1]-u.p[1])*r0,u.p[2]+(w.p[2]-u.p[2])*r0],
            n:[0,0,1],a:lo,b:lo,t:0,kink:1};
        }
        if(au&&!aw)P=pt; else Q=pt;
      }
      if(P&&Q&&P!==Q)segs.push([P,Q]);
    }
  }
  // chaînage par clé (comme faoScIso)
  const byStart=new Map();
  for(let i=0;i<segs.length;i++){const k=segs[i][0].k;if(!byStart.has(k))byStart.set(k,i);}
  const used=new Uint8Array(segs.length);
  const hasEnd=new Set();for(let i=0;i<segs.length;i++)hasEnd.add(segs[i][1].k);
  const chains=[];
  const walk=function(s0){
    const pts=[segs[s0][0]];let sI=s0,closed=false,guard=0;
    while(sI!==undefined&&!used[sI]&&guard++<1e7){
      used[sI]=1;pts.push(segs[sI][1]);
      const nk=segs[sI][1].k;
      if(nk===segs[s0][0].k){closed=true;break;}
      sI=byStart.get(nk);
    }
    return {pts:pts,closed:closed};
  };
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
  // --- 1. SURFACE OUTIL : grille XY, Z = descente de l'outil ---------------
  // Tout le calcul se fait sur la surface décrite par la POINTE de l'outil
  // (z = descente outil en x,y) : c'est la métrique de Fusion (écart mesuré
  // sur la surface de l'outil, bord haut 49,86 → 49,41 → 48,69 …). Elle n'a
  // ni pli (un creux plus serré que l'outil y est ponté, alors que la
  // conversion contact + normale×R s'y repliait : passes entassées puis
  // MANQUE au pied des parois), ni arête vive (la boule arrondit tout), ni
  // bruit de normale ; et la zone s'applique directement à la position outil.
  let bx0=1/0,by0=1/0,bx1=-1/0,by1=-1/0;
  for(let i=0;i<mesh.v.length;i++){const p=mesh.v[i];
    if(p[0]<bx0)bx0=p[0];if(p[0]>bx1)bx1=p[0];if(p[1]<by0)by0=p[1];if(p[1]>by1)by1=p[1];}
  const Rt=D/2;
  bx0-=Rt;by0-=Rt;bx1+=Rt;by1+=Rt;
  // pas de grille : ~pas/2 (0,2 … 1 mm), borné à ~350 000 nœuds DANS la zone
  let g=Math.max(0.25,Math.min(1.2,step*0.7));
  {
    let nIn=0,nTot=0;const gs=2;
    for(let y=by0;y<=by1;y+=gs)for(let x=bx0;x<=bx1;x+=gs){nTot++;if(!zoneAt||zoneAt(x,y))nIn++;}
    const areaZ=(bx1-bx0)*(by1-by0)*(nTot?nIn/nTot:1)+1;
    const NB=isFinite(+o.gridBudget)?+o.gridBudget:300000;
    if(areaZ/(g*g)>NB)g=Math.sqrt(areaZ/NB);
  }
  const nx=Math.max(2,Math.ceil((bx1-bx0)/g)+1),ny=Math.max(2,Math.ceil((by1-by0)/g)+1);
  const nv=nx*ny;
  const zin=new Uint8Array(nv);
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const x=bx0+i*g,y=by0+j*g;zin[j*nx+i]=(!zoneAt||zoneAt(x,y))?1:0;}
  const V=new Array(nv);
  const inside=new Uint8Array(nv);
  const inWin=function(z){return z>-1/0&&z>=zb&&z<=zt;};
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
    const k=j*nx+i,x=bx0+i*g,y=by0+j*g;
    // descente seulement dans la zone et sur un anneau d'un nœud autour
    let need=zin[k];
    if(!need)for(let dj=-1;dj<=1&&!need;dj++)for(let di=-1;di<=1;di++){
      const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=nx||jj>=ny)continue;if(zin[jj*nx+ii]){need=1;break;}}
    const z=need?drop.tip(x,y):-1/0;
    V[k]=[x,y,z];
    inside[k]=(zin[k]&&inWin(z))?1:0;
  }
  // triangles : cellules dont les 4 nœuds ont une cote (diagonales alternées)
  const T=[];
  for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){
    const a=j*nx+i,b=a+1,c=a+nx,d=c+1;
    if(!(V[a][2]>-1/0&&V[b][2]>-1/0&&V[c][2]>-1/0&&V[d][2]>-1/0))continue;
    if(((i+j)&1)===0){T.push([a,b,d]);T.push([a,d,c]);}
    else{T.push([a,b,c]);T.push([b,d,c]);}
  }
  const zAt=function(x,y){return drop.tip(x,y);};
  const UP=[0,0,1];
  const N=new Array(nv);for(let i=0;i<nv;i++)N[i]=UP;
  diag.tris=T.length;
  yield moves;
  // fenêtre Z sans effet dans la zone (cas courant) : le bord ne dépend que
  // de la zone → pas de descente outil pendant la dichotomie
  let winCuts=false;
  for(let k=0;k<nv&&!winCuts;k++)if(zin[k]&&V[k][2]>-1/0&&!inWin(V[k][2]))winCuts=true;
  const membAt=function(x,y){
    if(zoneAt&&!zoneAt(x,y))return false;
    return winCuts?inWin(drop.tip(x,y)):true;
  };
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
    const A=V[ia],B=V[ob];
    let lo=0,hi=1;
    for(let it=0;it<10;it++){
      const m=(lo+hi)/2;
      if(membAt(A[0]+(B[0]-A[0])*m,A[1]+(B[1]-A[1])*m))lo=m; else hi=m;
    }
    const x=A[0]+(B[0]-A[0])*lo,y=A[1]+(B[1]-A[1])*lo;
    let z=drop.tip(x,y);if(!(z>-1/0))z=A[2];
    c={k:k,p:[x,y,z]};
    cut.set(k,c);
    return c;
  };
  // segments de bord (dans chaque triangle mixte) + bords de la grille
  const bsegs=[]; // {a:point de coupure, b:point de coupure, tri, mb?:[arête de bord]}
  const ecount=new Map();
  for(let i=0;i<T.length;i++){const t=T[i];
    if(!inside[t[0]]&&!inside[t[1]]&&!inside[t[2]])continue;
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
      for(let e=0;e<3;e++){
        const a=t[e],b=t[(e+1)%3];
        if(ecount.get(ekey(a,b))===1){
          bsegs.push({a:{k:-1-a,p:V[a]},b:{k:-1-b,p:V[b]},tri:i,mb:[a,b]});
        }
      }
    }
  }
  if(!bsegs.length){diag.ms=Date.now()-t0;return moves;}
  // --- composantes du bord = fronts (union-find par clés partagées) ------
  const par=new Map();
  const find=function(k){let r=k;while(par.get(r)!==r)r=par.get(r);
    let x=k;while(par.get(x)!==r){const nx2=par.get(x);par.set(x,r);x=nx2;}return r;};
  const uni=function(a,b){if(!par.has(a))par.set(a,a);if(!par.has(b))par.set(b,b);
    const ra=find(a),rb=find(b);if(ra!==rb)par.set(ra,rb);};
  bsegs.forEach(function(s){uni(s.a.k,s.b.k);});
  const frontOf=new Map();let nF=0;
  const fseg=[];
  bsegs.forEach(function(s){const r=find(s.a.k);
    if(!frontOf.has(r)){frontOf.set(r,nF++);fseg.push([]);}
    fseg[frontOf.get(r)].push(s);});
  // fronts minuscules (îlots de quelques cellules : bruit) écartés
  const flen=fseg.map(function(ss){let l=0;ss.forEach(function(s){l+=Math.hypot(s.a.p[0]-s.b.p[0],s.a.p[1]-s.b.p[1],s.a.p[2]-s.b.p[2]);});return l;});
  let fronts=[];
  for(let f=0;f<nF;f++)if(flen[f]>=Math.max(2*step,D*0.5))fronts.push(f);
  if(fronts.length>12){
    fronts.sort(function(a,b){return flen[b]-flen[a];});
    fronts=fronts.slice(0,12);
  }
  // ordre : du plus bas au plus haut (cote moyenne du bord)
  const fz={};
  fronts.forEach(function(f){let s=0,n=0;fseg[f].forEach(function(gg){s+=gg.a.p[2]+gg.b.p[2];n+=2;});fz[f]=s/Math.max(1,n);});
  fronts.sort(function(a,b){return fz[a]-fz[b];});
  diag.fronts=fronts.length;
  // --- 3. champs de distance (FMM) par front, sur la surface outil --------
  const ptSeg=function(P,A,B){
    const ex=B[0]-A[0],ey=B[1]-A[1],ez=B[2]-A[2];
    const l2=ex*ex+ey*ey+ez*ez;
    let u=l2>0?((P[0]-A[0])*ex+(P[1]-A[1])*ey+(P[2]-A[2])*ez)/l2:0;
    if(u<0)u=0;else if(u>1)u=1;
    return Math.hypot(A[0]+ex*u-P[0],A[1]+ey*u-P[1],A[2]+ez*u-P[2]);
  };
  const fields=[];
  for(let fi=0;fi<fronts.length;fi++){
    const f=fronts[fi];
    const d=new Float64Array(nv).fill(1/0);
    fseg[f].forEach(function(s){
      const t=T[s.tri];
      for(let q=0;q<3;q++){
        const v=t[q];
        if(!inside[v])continue;
        const dd=ptSeg(V[v],s.a.p,s.b.p);
        if(dd<d[v])d[v]=dd;
      }
    });
    fseg[f].forEach(function(s){if(s.mb){d[s.mb[0]]=0;d[s.mb[1]]=0;}});
    faoScFMM(V,T,vt,d,inside);
    // nœuds extérieurs des triangles mixtes de CE front : valeur négative
    // (le champ traverse le bord → l'iso 0 = le bord lui-même)
    const neg=new Map();
    fseg[f].forEach(function(s){
      if(s.mb)return;
      const t=T[s.tri];
      for(let q=0;q<3;q++){
        const v=t[q];
        if(inside[v])continue;
        const dd=ptSeg(V[v],s.a.p,s.b.p);
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
  let FsRest=null; // champs des restes (d_k − couvert_k), pour les pointes
  const loops=[]; // {g groupe, lvl niveau, iso, pts:[points de contact], closed, rest?}
  const interp=function(F,pt){const fa=F[pt.a],fb=F[pt.b];
    if(!(fa<1/0)||!(fb<1/0))return 1/0;
    return fa+(fb-fa)*pt.t;};
  const lenOf=function(pts){let l=0;for(let i=1;i<pts.length;i++)l+=Math.hypot(pts[i].p[0]-pts[i-1].p[0],pts[i].p[1]-pts[i-1].p[1],pts[i].p[2]-pts[i-1].p[2]);return l;};
  // fragments d'iso plus courts que ça (miettes de grille au ras d'un bord)
  // ignorés : une miette ouverte invalidait tout l'anneau (front arrêté)
  const minLoop=Math.max(step*3,2);
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
      const ch=faoScIso(V,N,T,F,iso,bk(iso)).filter(function(c){return lenOf(c.pts)>=minLoop;});
      if(!ch.length)break;
      let valid=true,why=null;
      for(let c=0;c<ch.length&&valid;c++){
        if(!ch[c].closed){valid=false;why=['ouvert'];break;}
        const pts=ch[c].pts;
        for(let j=0;j<pts.length&&valid;j+=2){
          // TERRITOIRE (Voronoi géodésique) : l'anneau reste plus près de
          // son bord que de tout autre — les fronts se rencontrent au milieu.
          for(let gi=0;gi<fronts.length;gi++){
            if(gi===fi)continue;
            const dg=interp(fields[gi],pts[j]);
            if(dg<iso-tolV||dg<margin){valid=false;why=['territoire'];break;}
          }
          if(valid&&!inside[pts[j].a]&&!inside[pts[j].b]&&k>0){valid=false;why=['hors'];}
        }
      }
      // diag : niveau et motif d'arrêt du front
      if(!valid){(diag.stop=diag.stop||[]).push([k,why[0]]);break;}
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
      // champs décalés (une copie par front) pour l'iso EXACTE du minimum
      const Fs=FsRest=fields.map(function(F,fi){const c=covered[fi]<0?0:covered[fi];
        const G=new Float64Array(nv);for(let i=0;i<nv;i++)G[i]=F[i]-c;return G;});
      // index : le min exact dans un triangle est dans [min des nœuds de dL,
      // min_k max des nœuds de F_k] (il peut DÉPASSER les valeurs aux nœuds)
      const BK=new Map();
      for(let ti=0;ti<T.length;ti++){
        const t=T[ti];
        let lo=Math.min(dL[t[0]],dL[t[1]],dL[t[2]]),hi=1/0;
        for(let k=0;k<Fs.length;k++){const m=Math.max(Fs[k][t[0]],Fs[k][t[1]],Fs[k][t[2]]);if(m<hi)hi=m;}
        if(!(hi<1/0)||!(lo>-1/0))continue;
        if(hi<=0)continue;
        const k0=Math.floor(Math.max(0,lo)/step),k1=Math.floor(hi/step);
        for(let k=k0;k<=k1;k++){let L=BK.get(k);if(!L){L=[];BK.set(k,L);}L.push(ti);}
      }
      const compOf=function(pts){
        for(let i=0;i<pts.length;i+=3){const q=pts[i];
          if(comp[q.a]>=0)return comp[q.a];if(comp[q.b]>=0)return comp[q.b];}
        return -1;
      };
      for(let q=0;q<isoList.length;q++){
        const it=isoList[q];
        const ch=faoScIsoMin(V,T,Fs,it.iso,BK.get(Math.floor(it.iso/step))||[]);
        ch.forEach(function(c){
          // micro-boucles (bosse de champ < quelques mm) : bruit, couvert par
          // les passes voisines — écartées
          if(!c.closed||lenOf(c.pts)<Math.max(4*step,2))return;
          const z=compOf(c.pts);
          if(z>=0&&!it.zones.has(z))return;
          loops.push({g:fronts.length+(z>=0?z:Mx.length),lvl:it.m,iso:it.iso,dl:it.iso/it.m,pts:c.pts,closed:true,rest:1});
          diag.rest++;
        });
        if(q%6===5)yield moves;
      }
    }
  }
  // --- 6. positions outil -------------------------------------------------
  // Point d'iso (sur la surface outil interpolée) → position outil : Z =
  // descente outil exacte au XY du point (la corde de grille passe sous une
  // surface convexe, au-dessus d'une concave). FALAISE (paroi quasi
  // verticale coupée en une seule maille) : la descente au XY interpolé
  // vaut le HAUT de la falaise — on recule alors vers le nœud bas de l'arête
  // jusqu'à ce que l'outil tienne à la cote du point (outil contre la paroi).
  const toolPt=function(q){
    const x=q.p[0],y=q.p[1],zi=q.p[2];
    // maille douce : le point d'iso est déjà sur la surface interpolée
    {const A=V[q.a],B=V[q.b],h=Math.hypot(B[0]-A[0],B[1]-A[1]);
      if(Math.abs(B[2]-A[2])<=4*Math.max(h,g*0.5))return {x:x,y:y,z:zAt(x,y)};}
    const zd=drop.tip(x,y);
    if(!(zd>-1/0))return {x:x,y:y,z:zi};
    if(zd<=zi+0.05)return {x:x,y:y,z:zd};
    const A=V[q.a],B=V[q.b],lo=A[2]<=B[2]?A:B;
    let s0=0,s1=1;
    for(let it=0;it<12;it++){const m=(s0+s1)/2;
      if(drop.tip(x+(lo[0]-x)*m,y+(lo[1]-y)*m)<=zi+0.01)s1=m;else s0=m;}
    const xm=x+(lo[0]-x)*s1,ym=y+(lo[1]-y)*s1;
    return {x:xm,y:ym,z:Math.max(zi,drop.tip(xm,ym)),cliff:1};
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
      let z=zAt(x,y);if(!(z>-1/0))z=R2[j].z;
      out.push({x:x,y:y,z:z});}
    out.push({x:out[0].x,y:out[0].y,z:out[0].z});
    return out;
  };
  // POINTES des restes (façon Fusion : « finir plus pointu »). Une lentille
  // se termine en coin aigu entre deux fronts ; l'offset intérieur d'un coin
  // de demi-angle α recule de Δ/sin α — la boucle n'atteint pas la pointe et
  // laisse un triangle non fini (écart > pas/2 au-delà de pas/(2 sin α)). À
  // chaque coin de la boucle, l'outil file le long de la CRÊTE du champ de
  // reste (ligne de partage, max transverse de d_L) jusqu'à d_L = iso − Δ/2
  // (zone déjà à moins de Δ/2 de la passe extérieure), puis revient : aller-
  // retour pointu, Z = descente outil (jamais de surcoupe).
  const fAt=function(A,x,y){
    const fx=(x-bx0)/g,fy=(y-by0)/g,i=Math.floor(fx),j=Math.floor(fy);
    if(i<0||j<0||i>=nx-1||j>=ny-1)return 1/0;
    const u=fx-i,v=fy-j,a=A[j*nx+i],b=A[j*nx+i+1],c=A[(j+1)*nx+i],d=A[(j+1)*nx+i+1];
    if(((i+j)&1)===0)return u>=v?a+u*(b-a)+v*(d-b):a+v*(c-a)+u*(d-c);
    return u+v<=1?a+u*(b-a)+v*(c-a):d+(1-u)*(c-d)+(1-v)*(b-d);
  };
  const dLAt=function(x,y){
    if(zoneAt&&!zoneAt(x,y))return -1/0;
    const k=Math.round((y-by0)/g)*nx+Math.round((x-bx0)/g);
    if(!(k>=0&&k<nv)||!inside[k])return -1/0;
    let m=1/0;for(let q=0;q<FsRest.length;q++){const v=fAt(FsRest[q],x,y);if(v<m)m=v;}
    return m;
  };
  const spikes=function(P,lp){
    const n=P.length-1;
    if(!FsRest||n<12)return P;
    let Lp=0;for(let i=1;i<=n;i++)Lp+=Math.hypot(P[i].x-P[i-1].x,P[i].y-P[i-1].y);
    const w=Math.max(2,Math.round(1/(Lp/n)));
    const at=function(i){return P[((i%n)+n)%n];};
    const turn=new Float64Array(n);
    for(let i=0;i<n;i++){const a=at(i-w),b=at(i),c=at(i+w);
      const ux=b.x-a.x,uy=b.y-a.y,vx=c.x-b.x,vy=c.y-b.y;
      const lu=Math.hypot(ux,uy),lv=Math.hypot(vx,vy);
      turn[i]=lu>1e-9&&lv>1e-9?Math.acos(Math.max(-1,Math.min(1,(ux*vx+uy*vy)/(lu*lv)))):0;}
    const target=lp.iso-lp.dl*0.5,hs=Math.min(0.15,g*0.5),maxL=Math.max(6,lp.dl*12);
    const ins=new Map();
    for(let i=0;i<n;i++){
      if(turn[i]<1.5)continue; // coin < ~86° de déviation : boucle arrondie, pas une pointe
      let mx=true;for(let q=-w;q<=w;q++)if(q&&turn[((i+q)%n+n)%n]>turn[i]){mx=false;break;}
      if(!mx)continue;
      const a=at(i-w),b=at(i),c=at(i+w);
      const l1=Math.hypot(b.x-a.x,b.y-a.y),l2=Math.hypot(c.x-b.x,c.y-b.y);
      let ux=(b.x-a.x)/l1-(c.x-b.x)/l2,uy=(b.y-a.y)/l1-(c.y-b.y)/l2;
      const lu=Math.hypot(ux,uy);if(!(lu>1e-9))continue;ux/=lu;uy/=lu;
      let X=b.x,Y=b.y,cur=dLAt(X,Y);
      if(!(cur>target))continue;
      const out=[];let len=0;
      while(len<maxL){
        const nxx=-uy,nyy=ux;let bv=-1/0,bx=0,by=0;
        for(let q=-2;q<=2;q++){const x=X+ux*hs+nxx*q*hs*0.6,y=Y+uy*hs+nyy*q*hs*0.6;
          const v=dLAt(x,y);if(v>bv){bv=v;bx=x;by=y;}}
        if(!(bv>-1/0)||bv>cur+0.02)break; // hors zone, ou la crête remonte
        const dx=bx-X,dy=by-Y,dl=Math.hypot(dx,dy);
        ux=0.6*ux+0.4*dx/dl;uy=0.6*uy+0.4*dy/dl;const l3=Math.hypot(ux,uy);ux/=l3;uy/=l3;
        X=bx;Y=by;cur=bv;len+=dl;
        out.push([X,Y]);
        if(cur<=target)break;
      }
      if(len<Math.max(0.3,lp.dl*0.5))continue;
      // aller-retour : points tous les ~0,4 mm, Z descente outil
      const sp=[];
      for(let q=2;q<out.length;q+=3)sp.push(out[q]);
      if(sp[sp.length-1]!==out[out.length-1])sp.push(out[out.length-1]);
      const go=sp.map(function(p){let z=zAt(p[0],p[1]);if(!(z>-1/0))z=b.z;return {x:p[0],y:p[1],z:z};});
      ins.set(i,go.concat(go.slice(0,-1).reverse()).concat([{x:b.x,y:b.y,z:b.z}]));
      diag.tips=(diag.tips||0)+1;
    }
    if(!ins.size)return P;
    const R=[];
    for(let i=0;i<=n;i++){R.push(P[i]);const sp=i<n?ins.get(i):null;if(sp)for(let q=0;q<sp.length;q++)R.push(sp[q]);}
    return R;
  };
  // 2026-10-14-012 : CORDES CONFORMES — les points sont sur la surface outil,
  // mais sur une zone convexe (flancs d'une bosse) la corde entre deux points
  // à 0,4 mm passait SOUS la surface (jusqu'à 0,015 mm sur la pointe, 0,024 mm
  // sur la pièce : creux vus en simulation). Chaque segment est contrôlé au
  // quart, à la moitié et aux trois quarts ; il est recoupé tant qu'un point
  // passe sous la descente outil de plus de 2 µm.
  const conform=function(P){
    if(!P||P.length<2)return P;
    const out=[P[0]];
    const zOf=function(x,y,zf){const z=drop.tip(x,y);return z>-1/0?z:zf;};
    const seg=function(a,b,dep){
      let bad=false;
      for(let q=1;q<4&&!bad;q++){const t=q/4,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;
        if(zOf(x,y,-1/0)>a.z+(b.z-a.z)*t+0.002)bad=true;}
      if(bad&&dep<6){const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
        const m={x:mx,y:my,z:Math.max(zOf(mx,my,(a.z+b.z)/2),(a.z+b.z)/2)};
        seg(a,m,dep+1);seg(m,b,dep+1);return;}
      out.push(b);
    };
    for(let i=1;i<P.length;i++)seg(P[i-1],P[i],0);
    return out;
  };
  loops.forEach(function(lp){
    let P=lp.pts.map(toolPt);
    // boucle fermée : dernier = premier exactement, puis lissage (sauf boucle
    // qui longe une falaise : sa position est imposée par la paroi)
    if(lp.closed){P[P.length-1]={x:P[0].x,y:P[0].y,z:P[0].z};
      let cl=false;for(let i=0;i<P.length;i++)if(P[i].cliff){cl=true;break;}
      if(!cl)P=smoothLoop(P);
      if(lp.rest)P=spikes(P,lp);}
    // sous-échantillonnage de sécurité : segments ≤ 2 mm (Z suit la descente)
    const Q=[P[0]];
    for(let i=1;i<P.length;i++){
      const a=Q[Q.length-1],b=P[i];
      const dl=Math.hypot(b.x-a.x,b.y-a.y);
      if(dl>2){const ns=Math.ceil(dl/1);
        for(let s=1;s<ns;s++){const x=a.x+(b.x-a.x)*s/ns,y=a.y+(b.y-a.y)*s/ns;
          let z=zAt(x,y);if(!(z>-1/0))z=a.z+(b.z-a.z)*s/ns;Q.push({x:x,y:y,z:z});}}
      Q.push(b);
    }
    lp.tp=conform(simplify(Q,tol));
    let l=0;for(let i=1;i<lp.tp.length;i++)l+=Math.hypot(lp.tp[i].x-lp.tp[i-1].x,lp.tp[i].y-lp.tp[i-1].y,lp.tp[i].z-lp.tp[i-1].z);
    lp.len=l;
  });
  yield moves;
  // distance au SEGMENT le plus proche (2026-10-14-006 : la distance au
  // sommet le plus proche voyait à 4,5 mm un anneau à 1 mm — Douglas-Peucker
  // ne laisse que les extrémités des droites) ; s = abscisse du projeté
  // depuis le sommet i.
  const near=function(lp,P){
    let bi=0,bd=1/0,bs=0;const tp=lp.tp;
    for(let i=0;i<tp.length-1;i++){const A=tp[i],B=tp[i+1];
      const ex=B.x-A.x,ey=B.y-A.y,ez=B.z-A.z,l2=ex*ex+ey*ey+ez*ez;
      let t=l2>0?((P.x-A.x)*ex+(P.y-A.y)*ey+(P.z-A.z)*ez)/l2:0;if(t<0)t=0;else if(t>1)t=1;
      const dx=A.x+ex*t-P.x,dy=A.y+ey*t-P.y,dz=A.z+ez*t-P.z,d=dx*dx+dy*dy+dz*dz;
      if(d<bd){bd=d;bi=i;bs=t*Math.sqrt(l2);}}
    return {i:bi,d:Math.sqrt(bd),s:bs};
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
  // TRANSITION au contact entre deux traces (2026-10-14-006, demande : « les
  // transitions sont entre 2 traces égales au pas défini, pas plus ! » — le
  // glissement A* du 003 traversait la pièce et laissait des traces) : une
  // fin de séquence ne glisse vers le départ de la suivante que si celui-ci
  // est à <= 1,5 pas et en ligne directe dans la région ; sinon sortie en
  // arc, remontée Z rapide, rapide vers la nouvelle entrée.
  const linkStep=step*1.5;
  const inReg=function(x,y){
    const i=Math.round((x-bx0)/g),j=Math.round((y-by0)/g);
    if(i<0||j<0||i>=nx||j>=ny||!inside[j*nx+i])return false;
    return !zoneAt||zoneAt(x,y);
  };
  const segIn=function(a,b){
    const l=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(l/(g*0.5)));
    for(let k=1;k<n;k++)if(!inReg(a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n))return false;
    return true;
  };
  // points 3D d'un tracé XY : pas 0,4 mm, Z = descente outil ; un segment
  // dont le milieu passe sous la surface est recoupé (falaise : montée
  // quasi verticale, jamais de corde dans la matière)
  const surfPts=function(xy,z0,z1){
    const out=[];
    const zOf=function(x,y,zf){let z=drop.tip(x,y);return z>-1/0?z:zf;};
    const seg=function(a,b,dep){
      const mx=(a.x+b.x)/2,my=(a.y+b.y)/2,zm=zOf(mx,my,(a.z+b.z)/2);
      let over=zm>(a.z+b.z)/2+0.002;
      for(let q=1;q<4&&!over;q+=2){const t=q/4;
        if(zOf(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,a.z)>a.z+(b.z-a.z)*t+0.002)over=true;}
      if(over){
        if(dep<5){const m={x:mx,y:my,z:zm};seg(a,m,dep+1);seg(m,b,dep+1);return;}
        if(b.z>a.z)out.push({x:a.x,y:a.y,z:Math.max(b.z,zm)});
        else out.push({x:b.x,y:b.y,z:Math.max(a.z,zm)});
      }
      out.push(b);
    };
    let prev={x:xy[0][0],y:xy[0][1],z:z0};
    for(let i=1;i<xy.length;i++){
      const a=xy[i-1],b=xy[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(l/0.4));
      for(let k=1;k<=n;k++){const x=a[0]+(b[0]-a[0])*k/n,y=a[1]+(b[1]-a[1])*k/n;
        const last=(i===xy.length-1&&k===n);
        const p={x:x,y:y,z:last?z1:zOf(x,y,prev.z)};
        seg(prev,p,0);prev=p;}
    }
    return out;
  };
  const slide=function(A,TA,B,TB){
    if(Math.hypot(B.x-A.x,B.y-A.y,B.z-A.z)>linkStep)return null;
    if(!segIn([A.x,A.y],[B.x,B.y]))return null;
    const dAB=Math.hypot(B.x-A.x,B.y-A.y);
    let xy=[[A.x,A.y],[B.x,B.y]];
    // raccord tangent (Hermite XY) quand il reste dans la région
    const k0=dAB*0.8;
    const lt0=Math.hypot(TA.x,TA.y)||1,lt1=Math.hypot(TB.x,TB.y)||1;
    const sp=faoSplinePts({x:A.x,y:A.y,z:0},{x:TA.x/lt0*k0,y:TA.y/lt0*k0,z:0},{x:B.x,y:B.y,z:0},{x:TB.x/lt1*k0,y:TB.y/lt1*k0,z:0},Math.max(2,Math.ceil(dAB/0.4)));
    const xs=sp.map(function(p){return [p.x,p.y];});
    let ok=true;for(let q=1;q<xs.length&&ok;q++)if(!inReg(xs[q][0],xs[q][1]))ok=false;
    if(ok)xy=xs;
    return surfPts(xy,A.z,B.z);
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
    const lin=conform(leadIn(S,TS)); // cordes de l'arc contrôlées (2026-10-14-012)
    const sl=first?null:slide(cur,curT,S,TS);
    if(sl){
      for(let k=0;k<sl.length;k++)push({r:0,tr:1,x:sl[k].x,y:sl[k].y,z:sl[k].z});
      diag.slides=(diag.slides||0)+1;
    }else{
      if(first){
        push({r:1,x:lin[0].x,y:lin[0].y,z:secu});
        first=false;
      }else{
        // sortie de la séquence précédente puis saut local
        const lo=conform([cur].concat(leadOut(cur,curT))).slice(1);
        lo.forEach(function(p){push({r:0,ent:1,x:p.x,y:p.y,z:p.z});});
        const E=lo[lo.length-1];
        const H=hopZ(E,lin[0]);
        if(H>E.z+1e-9)push({r:1,x:E.x,y:E.y,z:H});
        push({r:1,x:lin[0].x,y:lin[0].y,z:H});
        diag.lifts=(diag.lifts||0)+1;
      }
      // descente rapide jusqu'au-dessus de l'arc d'entrée (0,5 mm), puis arc
      const zA=lin[0].z;
      push({r:1,x:lin[0].x,y:lin[0].y,z:zA+0.5});
      for(let k=0;k<lin.length;k++)push({r:0,ent:1,x:lin[k].x,y:lin[k].y,z:lin[k].z});
    }
    emitLoop(tp);
    cur=tp[tp.length-1];curT=tangentAt(tp,tp.length-1);
    seqCount++;
    // enchaînement : niveau suivant du même groupe, proche → liaison en S
    for(;;){
      let nb=-1,nd=1/0,ni=0,ns=0;
      for(let i=0;i<loops.length;i++){
        if(used[i]||loops[i].g!==lp.g||loops[i].lvl!==lp.lvl+1)continue;
        const r=near(loops[i],cur);if(r.d<nd){nd=r.d;nb=i;ni=r.i;ns=r.s;}
      }
      // 2026-10-14-006 : transition seulement vers la trace au pas (<= 1,5 pas)
      if(nb<0||nd>linkStep)break;
      const nx=loops[nb];used[nb]=1;
      let tq=nx.tp;
      if(bidir){lastSense=-lastSense;
        if(lastSense<0){tq=tq.slice().reverse();const rr=near({tp:tq},cur);ni=rr.i;ns=rr.s;}}
      const a2=Math.min(adv,nx.len*0.2);
      const tr=rotate(tq,ni,ns+a2);
      const S2=tr[0],T2=tangentAt(tr,0);
      // liaison Hermite XY (tangentes aux 2 boucles), Z = descente outil
      const chord=Math.hypot(S2.x-cur.x,S2.y-cur.y);
      const k0=chord*0.8;
      const P0={x:cur.x,y:cur.y,z:cur.z},P1={x:S2.x,y:S2.y,z:S2.z};
      const lt0=Math.hypot(curT.x,curT.y)||1,lt1=Math.hypot(T2.x,T2.y)||1;
      const sp=faoSplinePts(P0,{x:curT.x/lt0*k0,y:curT.y/lt0*k0,z:0},P1,{x:T2.x/lt1*k0,y:T2.y/lt1*k0,z:0},Math.ceil(chord/0.4));
      const sz=surfPts(sp.map(function(s){return [s.x,s.y];}),P0.z,S2.z);
      for(let k=0;k<sz.length;k++)push({r:0,tr:1,x:sz[k].x,y:sz[k].y,z:sz[k].z});
      emitLoop(tr);
      cur=tr[tr.length-1];curT=tangentAt(tr,tr.length-1);
      lp=nx;
      if(moves.length%4000<200)yield moves;
    }
    yield moves;
  }
  if(cur){
    const lo=conform([cur].concat(leadOut(cur,curT))).slice(1);
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
