/* ─────────────────────────────────────────────────────────────────────────────
   GÉODÉSIQUE (2026-10-21-001) — opération op.type==='geodesic'.

   Rétro-ingénierie de la Géodésique 3 axes de Fusion 360 (RETARD.step, boule
   D30, Exemples hors dépôt : 1001.nc, post Fagor) : passes à distance
   GÉODÉSIQUE constante mesurée SUR les faces pilotes (pas max 0,8 : 0,69–0,80
   réels), sens alterné, ordre extérieur → centre, liaisons en arc vertical de
   ~15 mm, coups courts aux pointes reliés DANS LE VIDE (23 % de l'avance G1
   hors matière). Ici, à la demande :
     • décalages depuis les BORDS de l'ensemble de faces (fronts qui se
       rejoignent au milieu) ;
     • passe suivante rejointe en GLISSANT AU CONTACT (≤ 1,5 pas), jamais par
       un aller-retour en l'air ; les passes ouvertes s'enchaînent en zigzag.

   Différence avec les Crêtes constantes (89-fao-cretes.js) : le champ de
   distance n'est pas calculé sur la surface outil vue de dessus (grille XY,
   écrasée sur les parois quasi verticales) mais sur le maillage des FACES
   CHOISIES elles-mêmes ; seuls les points réellement touchables en 3 axes
   (boule posée au contact sans être relevée par le reste de la pièce)
   forment la zone.

   ALGORITHME
   1. Maillage pilote : triangles des faces choisies (maillage fin de
      finition, repère du posage), normales lissées, raffiné par bissection
      jusqu'à des arêtes ≤ h ≈ 0,75·pas.
   2. Zone : sommet gardé si la normale ne plonge pas et si la descente outil
      au centre (contact + R·n) retrouve la cote du contact (pas d'ombre).
   3. Distance géodésique depuis le bord de la zone (Fast Marching).
   4. Passes = iso-lignes d = (k+½)·pas, orientées côté usiné à droite.
   5. Position outil : XY du centre (contact + R·n), Z = descente outil sur
      toute la pièce (aucune pénétration possible), cordes contrôlées.
   6. Enchaînement du bord vers le centre : glissement au contact vers la
      passe voisine, sinon sortie en arc vertical, saut local, entrée en arc.
   ───────────────────────────────────────────────────────────────────────── */

// Normales aux sommets (aire), restreintes aux triangles donnés.
function faoGeoNormals(V,T){
  const N=new Array(V.length);
  for(let i=0;i<V.length;i++)N[i]=[0,0,0];
  for(let i=0;i<T.length;i++){
    const t=T[i],A=V[t[0]],B=V[t[1]],C=V[t[2]];
    const ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2],wx=C[0]-A[0],wy=C[1]-A[1],wz=C[2]-A[2];
    const nx=uy*wz-uz*wy,ny=uz*wx-ux*wz,nz=ux*wy-uy*wx;
    for(let k=0;k<3;k++){const n=N[t[k]];n[0]+=nx;n[1]+=ny;n[2]+=nz;}
  }
  for(let i=0;i<N.length;i++){const n=N[i],l=Math.hypot(n[0],n[1],n[2]);
    if(l>1e-300){n[0]/=l;n[1]/=l;n[2]/=l;}else{n[0]=0;n[1]=0;n[2]=1;}}
  return N;
}

// Raffinement conforme : toute arête plus longue que h est coupée en son
// milieu (sommet partagé par les deux triangles voisins), triangles redécoupés
// en 2, 3 ou 4 ; on recommence jusqu'à ce qu'aucune arête ne dépasse h.
// Normale du milieu = moyenne normalisée des deux extrémités (la surface
// courbe reste lisse pour la conversion contact → centre outil).
function faoGeoRefine(V,N,T,h,budget){
  V=V.slice();N=N.slice();T=T.slice();
  const h2=h*h;
  for(let pass=0;pass<12;pass++){
    const mid=new Map();
    const mk=function(a,b){
      const k=a<b?a*4194304+b:b*4194304+a;
      let m=mid.get(k);
      if(m===undefined){
        const A=V[a],B=V[b],NA=N[a],NB=N[b];
        m=V.length;
        V.push([(A[0]+B[0])/2,(A[1]+B[1])/2,(A[2]+B[2])/2]);
        const nx=NA[0]+NB[0],ny=NA[1]+NB[1],nz=NA[2]+NB[2],l=Math.hypot(nx,ny,nz)||1;
        N.push([nx/l,ny/l,nz/l]);
        mid.set(k,m);
      }
      return m;
    };
    const long=function(a,b){const A=V[a],B=V[b];
      const dx=A[0]-B[0],dy=A[1]-B[1],dz=A[2]-B[2];return dx*dx+dy*dy+dz*dz>h2;};
    // marquage global d'abord (deux triangles voisins voient la même arête)
    let any=false;
    const mark=new Set();
    for(let i=0;i<T.length;i++){const t=T[i];
      for(let e=0;e<3;e++){const a=t[e],b=t[(e+1)%3];
        if(long(a,b)){mark.add(a<b?a*4194304+b:b*4194304+a);any=true;}}}
    if(!any)break;
    if(T.length*4>budget)break;
    const isM=function(a,b){return mark.has(a<b?a*4194304+b:b*4194304+a);};
    const out=[];
    for(let i=0;i<T.length;i++){
      const t=T[i];
      const m0=isM(t[0],t[1]),m1=isM(t[1],t[2]),m2=isM(t[2],t[0]);
      const n=(m0?1:0)+(m1?1:0)+(m2?1:0);
      if(!n){out.push(t);continue;}
      if(n===3){
        const a=mk(t[0],t[1]),b=mk(t[1],t[2]),c=mk(t[2],t[0]);
        out.push([t[0],a,c],[a,t[1],b],[c,b,t[2]],[a,b,c]);
        continue;
      }
      // rotation : la première arête marquée devient (p0,p1)
      let r=0;
      if(n===1){r=m0?0:(m1?1:2);}
      else{r=!m0?1:(!m1?2:0);} // deux arêtes : (p0,p1) et (p1,p2) marquées
      const p0=t[r],p1=t[(r+1)%3],p2=t[(r+2)%3];
      if(n===1){const a=mk(p0,p1);out.push([p0,a,p2],[a,p1,p2]);}
      else{const a=mk(p0,p1),b=mk(p1,p2);out.push([p0,a,p2],[a,p1,b],[a,b,p2]);}
    }
    T=out;
  }
  return {v:V,n:N,t:T};
}

// Faces pilotes de l'opération -> {v,t,n} dans le repère du posage.
// op.faces = [{b:id du corps, f:rang de la face BRep (occGroups)}].
function faoGeoDrive(job,op){
  try{
    const sel=Array.isArray(op&&op.faces)?op.faces:[];
    if(!sel.length||typeof bodies==='undefined'||!bodies)return null;
    const want=new Map();
    sel.forEach(function(s){if(!s)return;const k=String(s.b);if(!want.has(k))want.set(k,new Set());want.get(k).add(+s.f);});
    const F=faoFrame(job);
    const V=[],T=[];
    for(let bi=0;bi<bodies.length;bi++){
      const b=bodies[bi];
      if(!b||b.ghost||b.visible===false)continue;
      const fs=want.get(String(b.id));if(!fs)continue;
      const g=(typeof faoFineGeo==='function')?faoFineGeo(b):null;
      const mm=faoMeshFromBodyFineCached(b);
      if(!g||!mm)continue;
      const groups=(g.userData&&g.userData.occGroups)||[];
      const remap=new Map();
      const W=function(i){let j=remap.get(i);if(j===undefined){j=V.length;const p=mm.v[i];V.push(F.id?p.slice():faoToF(F,p));remap.set(i,j);}return j;};
      for(let q=0;q<groups.length;q++){
        const gr=groups[q];if(!fs.has(gr.f))continue;
        for(let k=gr.start;k<gr.start+gr.count&&k<mm.t.length;k++){const t=mm.t[k];
          if(t[0]===t[1]||t[1]===t[2]||t[0]===t[2])continue;
          T.push([W(t[0]),W(t[1]),W(t[2])]);}
      }
    }
    if(!T.length)return null;
    return {v:V,t:T,n:faoGeoNormals(V,T)};
  }catch(e){return null;}
}

// Faces TANGENTES : propagation depuis les faces graines à travers les arêtes
// où les normales des deux faces coïncident (≤ angDeg) — « ensemble de faces
// tangentes » de Fusion. Rend les rangs de faces du corps.
function faoGeoTangentFaces(b,seeds,angDeg){
  try{
    const g=(typeof faoFineGeo==='function')?faoFineGeo(b):null;
    const mm=faoMeshFromBodyFineCached(b);
    if(!g||!mm)return seeds.slice();
    const groups=(g.userData&&g.userData.occGroups)||[];
    const fo=new Int32Array(mm.t.length).fill(-1);
    groups.forEach(function(gr){for(let k=gr.start;k<gr.start+gr.count&&k<fo.length;k++)fo[k]=gr.f;});
    // normale par (sommet, face)
    const NF=new Map();
    const add=function(v,f,n){const k=v*65536+f;let a=NF.get(k);if(!a){a=[0,0,0];NF.set(k,a);}a[0]+=n[0];a[1]+=n[1];a[2]+=n[2];};
    const E=new Map(); // arête -> faces
    for(let i=0;i<mm.t.length;i++){
      const t=mm.t[i],f=fo[i];if(f<0)continue;
      const A=mm.v[t[0]],B=mm.v[t[1]],C=mm.v[t[2]];
      const ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2],wx=C[0]-A[0],wy=C[1]-A[1],wz=C[2]-A[2];
      const n=[uy*wz-uz*wy,uz*wx-ux*wz,ux*wy-uy*wx];
      for(let e=0;e<3;e++){add(t[e],f,n);
        const a=t[e],c=t[(e+1)%3],k=a<c?a*4194304+c:c*4194304+a;
        let s=E.get(k);if(!s){s=[];E.set(k,s);}if(s.indexOf(f)<0)s.push(f);}
    }
    const cosT=Math.cos((isFinite(+angDeg)?+angDeg:8)*Math.PI/180);
    const nrm=function(v,f){const a=NF.get(v*65536+f);if(!a)return null;const l=Math.hypot(a[0],a[1],a[2]);return l>0?[a[0]/l,a[1]/l,a[2]/l]:null;};
    const adj=new Map(); // face -> Set(faces tangentes)
    const link=function(a,c){if(!adj.has(a))adj.set(a,new Set());adj.get(a).add(c);};
    E.forEach(function(fs,k){
      if(fs.length<2)return;
      const a=Math.floor(k/4194304),c=k%4194304;
      for(let i=0;i<fs.length;i++)for(let j=i+1;j<fs.length;j++){
        let ok=true;
        for(const v of [a,c]){const p=nrm(v,fs[i]),q=nrm(v,fs[j]);
          if(!p||!q||p[0]*q[0]+p[1]*q[1]+p[2]*q[2]<cosT){ok=false;break;}}
        if(ok){link(fs[i],fs[j]);link(fs[j],fs[i]);}
      }
    });
    const seen=new Set(seeds.map(Number)),st=seeds.map(Number);
    while(st.length){const f=st.pop();const s=adj.get(f);if(!s)continue;s.forEach(function(q){if(!seen.has(q)){seen.add(q);st.push(q);}});}
    return Array.from(seen).sort(function(x,y){return x-y;});
  }catch(e){return seeds.slice();}
}

// Générateur : model = maillage complet (descente outil), drive = {v,t,n}.
// o : {step, toolD, kind, cornerR, laisse, secu, sens, tol, h, budget}.
function* faoGenGeodesicIt(model,drive,o){
  o=o||{};
  const moves=[];
  const diag={tris:0,region:0,dmax:0,loops:0,slides:0,lifts:0,zig:0,ms:0};
  try{moves.diag=diag;}catch(e){}
  if(!model||!model.v||!model.v.length||!drive||!drive.t||!drive.t.length)return moves;
  const t0=Date.now();
  // la main n'est rendue à l'interface qu'au plus toutes les 150 ms : un
  // onglet masqué espace chaque reprise d'au moins 1 s
  let tY=t0;const due=function(){const t=Date.now();if(t-tY<150)return false;tY=t;return true;};
  const D=isFinite(+o.toolD)&&+o.toolD>0?+o.toolD:8;
  const kind=o.kind||'ball';
  if(kind==='flat'){diag.flat=1;return moves;} // contact ponctuel exigé (boule / torique)
  const Rt=D/2;
  const L=isFinite(+o.laisse)&&+o.laisse>0?+o.laisse:0;
  const secu=isFinite(+o.secu)?+o.secu:5;
  const step=isFinite(+o.step)&&+o.step>0?+o.step:1;
  const tol=isFinite(+o.tol)&&+o.tol>0?+o.tol:0.005;
  const drop0=faoScDropper(model,kind,D,o.cornerR,L);
  // 2026-10-21-003 : faces / solides intouchables — l'outil gonflé de la marge
  // ne doit jamais les toucher : la descente prend le max des deux (les points
  // relevés par le rouge sortent de la zone touchable, les liaisons passent
  // au-dessus avec la marge)
  // o.protectFn (x,y) -> cote de pointe minimale imposée par le rouge (marge
  // comprise, volume avant seulement devant les flancs) — 2026-10-21-013 ;
  // o.protect (maillage) : forme historique.
  const dropR=(typeof o.protectFn==='function')?{tip:o.protectFn}
    :((o.protect&&o.protect.t&&o.protect.t.length)?faoScDropper(o.protect,kind,D,o.cornerR,L+(isFinite(+o.protectM)?+o.protectM:0.5)):null);
  const drop=dropR?{r:drop0.r,Rt:drop0.Rt,L:drop0.L,tip:function(x,y){const a=drop0.tip(x,y),b=dropR.tip(x,y);return b>a?b:a;}}:drop0;
  // centre de la partie sphérique en contact : boule = Rt ; torique = rayon de coin
  const rC=drop.r>0?drop.r:Rt;
  // --- 1. maillage pilote raffiné ------------------------------------------
  let area=0;
  for(let i=0;i<drive.t.length;i++){const t=drive.t[i],A=drive.v[t[0]],B=drive.v[t[1]],C=drive.v[t[2]];
    const ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2],wx=C[0]-A[0],wy=C[1]-A[1],wz=C[2]-A[2];
    area+=Math.hypot(uy*wz-uz*wy,uz*wx-ux*wz,ux*wy-uy*wx)/2;}
  const budget=isFinite(+o.budget)?+o.budget:400000;
  let h=isFinite(+o.h)&&+o.h>0?+o.h:Math.max(0.3,Math.min(2,step*0.75));
  if(area/(0.433*h*h)>budget)h=Math.sqrt(area/(0.433*budget));
  const RM=faoGeoRefine(drive.v,drive.n||faoGeoNormals(drive.v,drive.t),drive.t,h,budget*1.2);
  const V=RM.v,N=RM.n,T=RM.t,nv=V.length;
  diag.tris=T.length;diag.h=+h.toFixed(3);
  yield moves;
  // --- 2. zone touchable en 3 axes -----------------------------------------
  // centre outil au contact : p + (r+L)·n (partie sphérique de rayon rC) ;
  // pointe attendue = centre − rC (boule) ; la descente outil doit la retrouver
  const C=new Array(nv),reach=new Uint8Array(nv);
  const tolR=0.03;
  for(let i=0;i<nv;i++){
    const p=V[i],n=N[i];
    if(n[2]<-0.02){C[i]=null;continue;}
    const cx=p[0]+(rC+L)*n[0],cy=p[1]+(rC+L)*n[1],cz=p[2]+(rC+L)*n[2];
    // torique : le centre de coin est à (Rt−r) de l'axe, côté opposé à la normale
    let ax=cx,ay=cy;
    if(rC<Rt-1e-9){const gl=Math.hypot(n[0],n[1]);if(gl>1e-9){ax=cx-(Rt-rC)*n[0]/gl;ay=cy-(Rt-rC)*n[1]/gl;}}
    const zExp=cz-rC;
    const zd=drop.tip(ax,ay);
    C[i]=[ax,ay,zExp];
    reach[i]=(zd>-1/0&&zd<=zExp+tolR)?1:0;
    if((i&8191)===8191&&due())yield moves;
  }
  // triangles de la zone : 3 sommets touchables ; sommets de zone = leurs sommets
  const inT=new Uint8Array(T.length),ok=new Uint8Array(nv);
  const TZ=[];
  for(let i=0;i<T.length;i++){const t=T[i];if(reach[t[0]]&&reach[t[1]]&&reach[t[2]]){inT[i]=1;TZ.push(t);ok[t[0]]=1;ok[t[1]]=1;ok[t[2]]=1;}}
  diag.region=TZ.length;
  if(!TZ.length){diag.ms=Date.now()-t0;return moves;}
  // bord de la zone : arêtes d'un seul triangle de zone
  const ecount=new Map();
  for(let i=0;i<TZ.length;i++){const t=TZ[i];for(let e=0;e<3;e++){const a=t[e],b=t[(e+1)%3],k=a<b?a*4194304+b:b*4194304+a;ecount.set(k,(ecount.get(k)||0)+1);}}
  const dist=new Float64Array(nv).fill(1/0);
  ecount.forEach(function(c,k){if(c===1){dist[Math.floor(k/4194304)]=0;dist[k%4194304]=0;}});
  // --- 3. distance géodésique au bord ---------------------------------------
  const vt=[];for(let i=0;i<nv;i++)vt.push([]);
  for(let i=0;i<TZ.length;i++){const t=TZ[i];vt[t[0]].push(i);vt[t[1]].push(i);vt[t[2]].push(i);}
  faoScFMM(V,TZ,vt,dist,ok);
  let dmax=0;for(let i=0;i<nv;i++)if(ok[i]&&dist[i]<1/0&&dist[i]>dmax)dmax=dist[i];
  for(let i=0;i<nv;i++)if(!ok[i])dist[i]=1/0;
  diag.dmax=+dmax.toFixed(3);
  yield moves;
  // --- 4. iso-lignes ---------------------------------------------------------
  const cand=faoScBuckets(TZ,dist,step);
  const toolPt=function(q){
    // q = point d'iso {p,n} : centre au contact, Z = descente outil
    const p=q.p;let n=q.n;const l=Math.hypot(n[0],n[1],n[2])||1;n=[n[0]/l,n[1]/l,n[2]/l];
    let x=p[0]+(rC+L)*n[0],y=p[1]+(rC+L)*n[1];const zc=p[2]+(rC+L)*n[2]-rC;
    if(rC<Rt-1e-9){const gl=Math.hypot(n[0],n[1]);if(gl>1e-9){x-=(Rt-rC)*n[0]/gl;y-=(Rt-rC)*n[1]/gl;}}
    let z=drop.tip(x,y);if(!(z>-1/0))z=zc;
    return {x:x,y:y,z:z};
  };
  const zOf=function(x,y,zf){const z=drop.tip(x,y);return z>-1/0?z:zf;};
  // Douglas-Peucker 3D (tolérance de corde)
  const simplify=function(P,eps){
    if(P.length<3)return P.slice();
    const keep=new Uint8Array(P.length);keep[0]=1;keep[P.length-1]=1;
    const st=[[0,P.length-1]];
    while(st.length){const s=st.pop(),a=s[0],b=s[1];if(b-a<2)continue;
      const A=P[a],B=P[b],ex=B.x-A.x,ey=B.y-A.y,ez=B.z-A.z,l2=ex*ex+ey*ey+ez*ez;
      let bi=-1,bd=eps*eps;
      for(let i=a+1;i<b;i++){const Q=P[i];let t=l2>0?((Q.x-A.x)*ex+(Q.y-A.y)*ey+(Q.z-A.z)*ez)/l2:0;if(t<0)t=0;else if(t>1)t=1;
        const dx=A.x+ex*t-Q.x,dy=A.y+ey*t-Q.y,dz=A.z+ez*t-Q.z,d=dx*dx+dy*dy+dz*dz;if(d>bd){bd=d;bi=i;}}
      if(bi>=0){keep[bi]=1;st.push([a,bi],[bi,b]);}}
    const out=[];for(let i=0;i<P.length;i++)if(keep[i])out.push(P[i]);
    return out;
  };
  // cordes conformes : un segment qui passe sous la descente outil est recoupé
  const conform=function(P){
    if(!P||P.length<2)return P;
    const out=[P[0]];
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
  const loops=[];
  // contacts des passes posées (germes du champ de couverture des restes)
  const cover=new Float64Array(nv).fill(1/0);
  const seedCover=function(a,p){const q=V[a],d=Math.hypot(q[0]-p[0],q[1]-p[1],q[2]-p[2]);if(d<cover[a])cover[a]=d;};
  // Lissage gaussien LE LONG de la passe (abscisse curviligne, boucle fermée
  // repliée) : normales (σn) et contacts (σp). Le centre outil est à 15 mm
  // (boule D30) du contact le long de la normale : 1° d'erreur de normale
  // interpolée = 0,26 mm de déport — d'où des passes qui tremblaient (angle
  // médian 3°, segments de 0,4 mm). Z reste la descente outil (aucune surcoupe).
  const sigN=Math.max(1,2*h),sigP=Math.max(0.3,h*0.5);
  const smoothPts=function(pts,closed){
    const n=closed?pts.length-1:pts.length;if(n<3)return pts;
    const s=new Float64Array(n+1);
    for(let i=1;i<=n;i++){const a=pts[i-1].p,b=pts[i%pts.length].p;s[i]=s[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);}
    const Ltot=closed?s[n]:s[n-1];
    const out=new Array(n);
    for(let i=0;i<n;i++){
      let wn=0,wp=0;const an=[0,0,0],ap=[0,0,0];
      for(let dir=-1;dir<=1;dir+=2){
        for(let k=(dir<0?0:1);;k++){
          let j=i+dir*k;
          if(closed){j=((j%n)+n)%n;}else if(j<0||j>=n)break;
          let ds=Math.abs(s[j]-s[i]);if(closed&&ds>Ltot/2)ds=Ltot-ds;
          if(k>0&&ds>3*sigN)break;
          if(k>n)break;
          const q=pts[j],gn=Math.exp(-ds*ds/(2*sigN*sigN)),gp=ds<=3*sigP?Math.exp(-ds*ds/(2*sigP*sigP)):0;
          an[0]+=gn*q.n[0];an[1]+=gn*q.n[1];an[2]+=gn*q.n[2];wn+=gn;
          if(gp>0){ap[0]+=gp*q.p[0];ap[1]+=gp*q.p[1];ap[2]+=gp*q.p[2];wp+=gp;}
          if(k===0&&dir>0)break;
        }
      }
      out[i]={p:[ap[0]/wp,ap[1]/wp,ap[2]/wp],n:[an[0]/wn,an[1]/wn,an[2]/wn],a:pts[i].a,b:pts[i].b};
    }
    if(!closed){out[0].p=pts[0].p;out[n-1].p=pts[n-1].p;}
    if(closed)out.push(out[0]);
    return out;
  };
  const addPass=function(pts,closed,lvl){
    let P=smoothPts(pts,closed).map(toolPt);
    if(closed)P[P.length-1]={x:P[0].x,y:P[0].y,z:P[0].z};
    let len=0;for(let i=1;i<P.length;i++)len+=Math.hypot(P[i].x-P[i-1].x,P[i].y-P[i-1].y,P[i].z-P[i-1].z);
    if(len<Math.max(0.5,step*0.5))return false; // miette
    const tp=conform(simplify(P,tol));
    loops.push({lvl:lvl,closed:!!closed,tp:tp,len:len});
    return true;
  };
  for(let k=0;;k++){
    const iso=step*(k+0.5);
    if(iso>=dmax)break;
    const ch=faoScIso(V,N,TZ,dist,iso,cand(iso));
    for(let c=0;c<ch.length;c++){
      const pts=ch[c].pts;if(pts.length<2)continue;
      if(addPass(pts,ch[c].closed,k))for(let i=0;i<pts.length;i++){const q=pts[i];seedCover(q.a,q.p);seedCover(q.b,q.p);}
    }
    if(due())yield moves;
  }
  // --- 4b. RESTES : là où deux fronts se rejoignent (crête) ou dans un coin
  // aigu, l'écart à la passe la plus proche peut dépasser ½ pas. Champ de
  // couverture (distance géodésique aux contacts posés) ; chaque composante
  // non couverte donne son plus long chemin (double balayage de Dijkstra) ;
  // les morceaux voisins (crête discrétisée en pointillés) sont RECOLLÉS bout
  // à bout en une passe ouverte ; on recommence (3 tours au plus).
  // seuil 0,6 pas : au-dessus de l'erreur du champ discret (~½ pas + quelques
  // %), sous les vrais trous (crête : jusqu'à 1 pas, coin aigu : davantage)
  const tau=step*0.6;
  const REST_LVL=1e6;
  const joinMax=Math.max(3,step*4);
  const nbr=[];for(let i=0;i<nv;i++)nbr.push([]);
  ecount.forEach(function(c,k){const a=Math.floor(k/4194304),b=k%4194304;nbr[a].push(b);nbr[b].push(a);});
  const elen=function(a,b){const A=V[a],B=V[b];return Math.hypot(A[0]-B[0],A[1]-B[1],A[2]-B[2]);};
  const coverPath=function(path){
    for(const v of path)if(cover[v]>0)cover[v]=Math.min(cover[v],0);
    for(let i=1;i<path.length;i++){const p=V[path[i-1]],q=V[path[i]];
      for(let s=0;s<=4;s++){const t=s/4,x=[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t];seedCover(path[i-1],x);seedCover(path[i],x);}}
  };
  diag.rest=0;
  for(let round=0;round<3;round++){
    const dc=Float64Array.from(cover);
    faoScFMM(V,TZ,vt,dc,ok);
    const res=new Uint8Array(nv);let nres=0;
    for(let i=0;i<nv;i++)if(ok[i]&&dc[i]>tau){res[i]=1;nres++;}
    if(!nres)break;
    const comp=new Int32Array(nv).fill(-1);
    const frags=[];
    for(let s0=0;s0<nv;s0++){
      if(!res[s0]||comp[s0]>=0)continue;
      const mem=[s0];comp[s0]=s0;
      for(let q=0;q<mem.length;q++){const u=mem[q];for(const w of nbr[u])if(res[w]&&comp[w]<0){comp[w]=s0;mem.push(w);}}
      if(mem.length===1){frags.push([s0]);continue;}
      // Dijkstra restreint à la composante : (distances, prédécesseurs)
      const dj=function(src){
        const dd=new Map(),pr=new Map();dd.set(src,0);
        const HK=[0],HV=[src];
        const pop=function(){const tv=HV[0],tk=HK[0];const lk=HK.pop(),lv=HV.pop();
          if(HK.length){HK[0]=lk;HV[0]=lv;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;
            if(l<HK.length&&HK[l]<HK[m])m=l;if(r<HK.length&&HK[r]<HK[m])m=r;if(m===i)break;
            const a=HK[i];HK[i]=HK[m];HK[m]=a;const b=HV[i];HV[i]=HV[m];HV[m]=b;i=m;}}return [tk,tv];};
        const push=function(k,v){HK.push(k);HV.push(v);let i=HK.length-1;
          while(i>0){const p=(i-1)>>1;if(HK[p]<=k)break;HK[i]=HK[p];HV[i]=HV[p];i=p;}HK[i]=k;HV[i]=v;};
        while(HK.length){const [d,u]=pop();if(d>dd.get(u))continue;
          for(const w of nbr[u]){if(comp[w]!==s0)continue;const nd=d+elen(u,w);if(!(dd.get(w)<=nd)){dd.set(w,nd);pr.set(w,u);push(nd,w);}}}
        let far=src,fd=0;dd.forEach(function(d,v){if(d>fd){fd=d;far=v;}});
        return {far:far,pr:pr};
      };
      const a=dj(mem[0]).far, B=dj(a);
      const path=[B.far];while(path[path.length-1]!==a){const p=B.pr.get(path[path.length-1]);if(p===undefined)break;path.push(p);}
      frags.push(path);
    }
    // recollage glouton : on prolonge une chaîne par l'extrémité libre la
    // plus proche (≤ joinMax), aux deux bouts
    const fu=new Uint8Array(frags.length);
    const dv=function(a,b){return elen(a,b);};
    let added=0;
    for(let f0=0;f0<frags.length;f0++){
      if(fu[f0])continue;fu[f0]=1;
      let chain=frags[f0].slice();
      for(let side=0;side<2;side++){
        for(;;){
          const end=chain[chain.length-1];let bj=-1,bd=joinMax,brev=false;
          for(let j=0;j<frags.length;j++){if(fu[j])continue;const F2=frags[j];
            const d0=dv(end,F2[0]),d1=dv(end,F2[F2.length-1]);
            if(d0<bd){bd=d0;bj=j;brev=false;}if(d1<bd){bd=d1;bj=j;brev=true;}}
          if(bj<0)break;
          fu[bj]=1;chain=chain.concat(brev?frags[bj].slice().reverse():frags[bj]);
        }
        chain.reverse();
      }
      const pts=chain.map(function(v){return {p:V[v],n:N[v]};});
      // reste : APRÈS tous les anneaux (niveau hors échelle) — placé entre
      // deux anneaux, il cassait leur enchaînement au contact
      if(pts.length>=2&&addPass(pts,false,REST_LVL)){loops[loops.length-1].rest=1;added++;diag.rest++;}
      coverPath(chain); // une miette est réputée couverte
    }
    if(!added)break;
    yield moves;
  }
  diag.loops=loops.length;
  diag.levels=loops.reduce(function(m,l){return l.rest?m:Math.max(m,l.lvl+1);},0);
  yield moves;
  // --- 5. enchaînement -------------------------------------------------------
  const near=function(tp,P){
    let bi=0,bd=1/0,bs=0;
    for(let i=0;i<tp.length-1;i++){const A=tp[i],B=tp[i+1];
      const ex=B.x-A.x,ey=B.y-A.y,ez=B.z-A.z,l2=ex*ex+ey*ey+ez*ez;
      let t=l2>0?((P.x-A.x)*ex+(P.y-A.y)*ey+(P.z-A.z)*ez)/l2:0;if(t<0)t=0;else if(t>1)t=1;
      const dx=A.x+ex*t-P.x,dy=A.y+ey*t-P.y,dz=A.z+ez*t-P.z,d=dx*dx+dy*dy+dz*dz;
      if(d<bd){bd=d;bi=i;bs=t*Math.sqrt(l2);}}
    return {i:bi,d:Math.sqrt(bd),s:bs};
  };
  // parenté : une passe n'est disponible qu'une fois faites ses mères (niveau
  // précédent, à moins de 2,5 pas + R/2) — on vide un nid avant d'aller ailleurs
  const parents=loops.map(function(){return [];});
  {
    const byL=new Map();
    loops.forEach(function(lp,i){(byL.get(lp.lvl)||byL.set(lp.lvl,[]).get(lp.lvl)).push(i);});
    const thr=step*2.5+Rt*0.5;
    loops.forEach(function(lp,i){
      if(lp.rest)return;
      const Lp=byL.get(lp.lvl-1);if(!Lp)return;
      const stp=Math.max(1,Math.floor(lp.tp.length/60));
      Lp.forEach(function(j){let dmin=1/0;
        for(let q=0;q<lp.tp.length;q+=stp){const r=near(loops[j].tp,lp.tp[q]);if(r.d<dmin)dmin=r.d;if(dmin<=thr)break;}
        if(dmin<=thr)parents[i].push(j);});
    });
  }
  const bidir=(o.sens==='bidir');
  const rE=Math.max(1,Math.min(5,D*0.8));   // rayon des arcs verticaux entrée/sortie
  const adv=Math.max(step,Math.min(D*0.75,step*4)); // avance de la liaison au contact
  const linkStep=step*1.5;
  const dropZ=function(x,y,zMin){let z=drop.tip(x,y);if(!(z>-1/0))z=zMin;return Math.max(z,zMin);};
  const used=new Uint8Array(loops.length);
  const rotate=function(tp,i,s){
    // boucle fermée (dernier = premier) : départ à l'abscisse s depuis le sommet i
    const n=tp.length-1;
    if(n<2)return tp.slice();
    let k=i,acc=0,pt=null;
    for(let g=0;g<n;g++){
      const a=tp[k],b=tp[k+1];
      const sl=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z);
      if(acc+sl>=s){const u=sl>0?(s-acc)/sl:0;
        pt={x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u,z:a.z+(b.z-a.z)*u};
        pt.z=dropZ(pt.x,pt.y,pt.z);
        k=(k+1)%n;break;}
      acc+=sl;k=(k+1)%n;
    }
    if(!pt){pt={x:tp[i].x,y:tp[i].y,z:tp[i].z};k=(i+1)%n;}
    const out=[pt];
    for(let g=0;g<n;g++)out.push(tp[(k+g)%n]);
    out.push({x:pt.x,y:pt.y,z:pt.z});
    return out;
  };
  const tangentAt=function(P,i){
    const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)];
    const l=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z)||1;
    return {x:(b.x-a.x)/l,y:(b.y-a.y)/l,z:(b.z-a.z)/l};
  };
  const push=function(m){moves.push(m);};
  const leadIn=function(S,Tn){
    const lh=Math.hypot(Tn.x,Tn.y)||1,ux=Tn.x/lh,uy=Tn.y/lh;
    const pts=[];const nA=Math.max(8,Math.min(32,Math.ceil(rE*3)));
    for(let k=0;k<=nA;k++){const th=(k/nA)*Math.PI/2;
      const x=S.x-rE*Math.cos(th)*ux,y=S.y-rE*Math.cos(th)*uy,z=S.z+rE-rE*Math.sin(th);
      pts.push({x:x,y:y,z:k===nA?S.z:dropZ(x,y,z)});}
    pts[nA]={x:S.x,y:S.y,z:S.z};
    return pts;
  };
  const leadOut=function(E,Tn){
    const lh=Math.hypot(Tn.x,Tn.y)||1,ux=Tn.x/lh,uy=Tn.y/lh;
    const pts=[];const nA=Math.max(8,Math.min(32,Math.ceil(rE*3)));
    for(let k=1;k<=nA;k++){const th=(k/nA)*Math.PI/2;
      const x=E.x+rE*Math.sin(th)*ux,y=E.y+rE*Math.sin(th)*uy,z=E.z+rE-rE*Math.cos(th);
      pts.push({x:x,y:y,z:dropZ(x,y,z)});}
    return pts;
  };
  const hopZ=function(A,B){
    const dl=Math.hypot(B.x-A.x,B.y-A.y),n=Math.max(1,Math.ceil(dl/1));
    let zm=Math.max(A.z,B.z);
    for(let k=0;k<=n;k++){const z=drop.tip(A.x+(B.x-A.x)*k/n,A.y+(B.y-A.y)*k/n);if(z>zm)zm=z;}
    return Math.max(zm+1,Math.min(secu,zm+5));
  };
  // glissement au contact A→B : Hermite XY tangent aux deux passes, Z =
  // descente outil (pas 0,4 mm), segment recoupé s'il passe sous la surface
  const slidePts=function(A,TA,B,TB){
    const chord=Math.hypot(B.x-A.x,B.y-A.y),k0=chord*0.8;
    const lt0=Math.hypot(TA.x,TA.y)||1,lt1=Math.hypot(TB.x,TB.y)||1;
    const sp=faoSplinePts({x:A.x,y:A.y,z:A.z},{x:TA.x/lt0*k0,y:TA.y/lt0*k0,z:0},{x:B.x,y:B.y,z:B.z},{x:TB.x/lt1*k0,y:TB.y/lt1*k0,z:0},Math.max(2,Math.ceil(chord/0.4)));
    const P=[];
    for(let q=1;q<sp.length;q++){const last=q===sp.length-1;
      P.push(last?{x:B.x,y:B.y,z:B.z}:{x:sp[q].x,y:sp[q].y,z:zOf(sp[q].x,sp[q].y,A.z+(B.z-A.z)*q/(sp.length-1))});}
    return conform([{x:A.x,y:A.y,z:A.z}].concat(P)).slice(1);
  };
  const emit=function(tp){for(let i=1;i<tp.length;i++)push({r:0,x:tp[i].x,y:tp[i].y,z:tp[i].z});};
  let cur=null,curT=null,first=true,sense=1,seq=0;
  // prochaine passe au contact : niveau suivant (ou même niveau pour une passe
  // ouverte), à ≤ 1,5 pas de la position courante
  const nextNear=function(lvl){
    let nb=-1,nd=1/0,nr=null,rev=false;
    for(let i=0;i<loops.length;i++){
      if(used[i])continue;const lp=loops[i];
      if(lp.lvl!==lvl+1&&!(lp.lvl===lvl&&!lp.closed))continue;
      let av=true;for(let q=0;q<parents[i].length;q++)if(!used[parents[i][q]]){av=false;break;}
      if(!av)continue;
      if(lp.closed){const r=near(lp.tp,cur);if(r.d<nd){nd=r.d;nb=i;nr=r;rev=false;}}
      else{ // passe ouverte : entrée par l'extrémité la plus proche (zigzag)
        const a=lp.tp[0],b=lp.tp[lp.tp.length-1];
        const da=Math.hypot(a.x-cur.x,a.y-cur.y,a.z-cur.z),db=Math.hypot(b.x-cur.x,b.y-cur.y,b.z-cur.z);
        if(da<nd){nd=da;nb=i;nr=null;rev=false;}
        if(db<nd){nd=db;nb=i;nr=null;rev=true;}
      }
    }
    return nd<=linkStep?{i:nb,r:nr,rev:rev}:null;
  };
  for(;;){
    // départ de séquence : plus petit niveau restant, passe disponible la plus
    // proche de la position courante
    let lmin=1/0;for(let i=0;i<loops.length;i++)if(!used[i]&&loops[i].lvl<lmin)lmin=loops[i].lvl;
    if(lmin===1/0)break;
    let bi=-1,bd=1/0;
    for(let i=0;i<loops.length;i++){
      if(used[i]||loops[i].lvl!==lmin)continue;
      let av=true;for(let q=0;q<parents[i].length;q++)if(!used[parents[i][q]]){av=false;break;}
      if(!av)continue;
      const d=cur?near(loops[i].tp,cur).d:0;
      if(d<bd){bd=d;bi=i;}
    }
    if(bi<0){for(let i=0;i<loops.length;i++)if(!used[i]&&loops[i].lvl===lmin){bi=i;break;}}
    let lp=loops[bi];used[bi]=1;
    let tp=lp.tp;
    sense=1;
    if(lp.closed){
      // départ : proche de la position courante et de la passe suivante
      const nxt=loops.filter(function(q,i){return !used[i]&&q.lvl===lp.lvl+1;});
      let si=0,best=1/0;const stp=Math.max(1,Math.floor(tp.length/400));
      for(let i=0;i<tp.length-1;i+=stp){
        let c=cur?Math.hypot(tp[i].x-cur.x,tp[i].y-cur.y,tp[i].z-cur.z):0;
        if(nxt.length){let dn=1/0;for(let k=0;k<nxt.length;k++){const r=near(nxt[k].tp,tp[i]);if(r.d<dn)dn=r.d;}c+=3*dn;}
        if(c<best){best=c;si=i;}
      }
      tp=rotate(tp,si,0);
    }else if(cur){
      const a=tp[0],b=tp[tp.length-1];
      if(Math.hypot(b.x-cur.x,b.y-cur.y,b.z-cur.z)<Math.hypot(a.x-cur.x,a.y-cur.y,a.z-cur.z))tp=tp.slice().reverse();
    }
    const S=tp[0],TS=tangentAt(tp,0);
    const lin=conform(leadIn(S,TS));
    if(first){push({r:1,x:lin[0].x,y:lin[0].y,z:secu});first=false;}
    else{
      const lo=conform([cur].concat(leadOut(cur,curT))).slice(1);
      lo.forEach(function(p){push({r:0,ent:1,x:p.x,y:p.y,z:p.z});});
      const E=lo[lo.length-1];
      const H=hopZ(E,lin[0]);
      if(H>E.z+1e-9)push({r:1,x:E.x,y:E.y,z:H});
      push({r:1,x:lin[0].x,y:lin[0].y,z:H});
      diag.lifts++;
    }
    push({r:1,x:lin[0].x,y:lin[0].y,z:lin[0].z+0.5});
    for(let k=0;k<lin.length;k++)push({r:0,ent:1,x:lin[k].x,y:lin[k].y,z:lin[k].z});
    emit(tp);
    cur=tp[tp.length-1];curT=tangentAt(tp,tp.length-1);
    seq++;
    for(;;){
      const nx=nextNear(lp.lvl);
      if(!nx)break;
      const q=loops[nx.i];used[nx.i]=1;
      let tr;
      if(q.closed){
        let tq=q.tp,r=nx.r;
        if(bidir){sense=-sense;if(sense<0){tq=tq.slice().reverse();r=near(tq,cur);}}
        tr=rotate(tq,r.i,r.s+Math.min(adv,q.len*0.2));
      }else{tr=nx.rev?q.tp.slice().reverse():q.tp;diag.zig++;}
      const S2=tr[0],T2=tangentAt(tr,0);
      const sp=slidePts(cur,curT,S2,T2);
      for(let k=0;k<sp.length;k++)push({r:0,tr:1,x:sp[k].x,y:sp[k].y,z:sp[k].z});
      diag.slides++;
      emit(tr);
      cur=tr[tr.length-1];curT=tangentAt(tr,tr.length-1);
      lp=q;
      if(due())yield moves;
    }
    if(due())yield moves;
  }
  if(cur){
    const lo=conform([cur].concat(leadOut(cur,curT))).slice(1);
    lo.forEach(function(p){push({r:0,ent:1,x:p.x,y:p.y,z:p.z});});
    const E=lo[lo.length-1];
    if(E.z<secu)push({r:1,x:E.x,y:E.y,z:secu});
  }
  diag.seq=seq;
  diag.ms=Date.now()-t0;
  return moves;
}
function faoGenGeodesic(model,drive,o){
  const it=faoGenGeodesicIt(model,drive,o);
  let r;while(!(r=it.next()).done){}
  return r.value;
}

/* ----- fiche (les faces bleues / rouges : src/89-fao-faces.js) ----- */
// Fiche : passes, matière, diagnostic
function faoGeoFiche(d,setup,op){
  d.appendChild(faoH('Passes'));
  const gP=faoRow();
  gP.appendChild(faoLab('Pas'));
  gP.appendChild(faoNum(op.step,function(v){op.step=Math.max(0.05,v);},52,0.1,'Écart entre deux passes voisines, mesuré sur la surface (mm). Hauteur de crête ≈ pas²/(8·R).'));
  gP.appendChild(faoLab('Sens'));
  gP.appendChild(faoSel([
    ['avalant','Sens unique · avalant','Toutes les boucles dans le même sens (côté déjà usiné à droite).'],
    ['bidir','Alterné','Le sens s’inverse d’une boucle à la suivante (comme la Géodésique de Fusion 360).']],
    op.sens==='bidir'?'bidir':'avalant',function(v){op.sens=(v==='bidir')?'bidir':'avalant';},
    'Sens de coupe des boucles.'));
  d.appendChild(gP);
  d.appendChild(faoH('Matière à laisser (mm)'));
  const gM=faoRow();
  gM.appendChild(faoLab('Surépaisseur'));
  gM.appendChild(faoNum(op.laisse,function(v){op.laisse=Math.max(0,v);},48,0.1,'Matière laissée sur les faces choisies (mm). 0 = à la cote.'));
  d.appendChild(gM);
  const tG=faoToolById(setup,op.toolId);
  if(tG&&tG.kind==='flat'){
    const n=document.createElement('div');n.className='fao-note';
    n.textContent='⚠ Fraise droite refusée : la géodésique demande une fraise boule ou torique (contact ponctuel).';
    d.appendChild(n);
  }
  if(op.geoDiag){
    const gd=op.geoDiag,m=document.createElement('div');m.className='fao-meta';
    m.textContent=gd.nofaces?'Diag : aucune face exploitable (faces à choisir, ou modèle absent).'
      :('Diag : '+(gd.levels||0)+' niveau(x) · '+(gd.loops||0)+' passe(s) dont '+(gd.rest||0)+' de reste · '+(gd.slides||0)+' glissement(s) au contact · '+(gd.lifts||0)+' remontée(s) · '+(gd.ms||0)+' ms');
    d.appendChild(m);
  }
}
