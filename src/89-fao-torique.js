/* ================================================================
   ÉBAUCHE 3D — PASSE TORIQUE (2026-10-14-007)
   ----------------------------------------------------------------
   Demande : « si je mets 0 à la paroi, je ne suis pas à zéro sur les
   faces — le calcul ne prend pas en compte le rayon de la fraise
   torique » ; contrainte : le parcours 005 doit rester IDENTIQUE.
   Le moteur d'ébauche raisonne en fraise droite de rayon D/2 : sur une
   face inclinée, un outil à rayon de coin rc pourrait descendre plus
   près (cavité, torique D25 R2 : 1,08 mm d'écart moyen aux faces).
   Rien n'est changé dans le moteur : après chaque niveau on AJOUTE,
   là où l'outil réel peut s'approcher, une passe au contact exact :
   iso-ligne « pointe de l'outil réel = z » (descente outil, anneau de
   boules fin), gardée seulement où la fraise droite n'était pas déjà au
   contact. Entrée/sortie par le côté déjà usiné (pointe fraise droite
   <= z), liaison au contact seulement au pas, sinon remontée + rapide.
   ================================================================ */
function faoBullRingSetup(M,BB,D,rc,laisse,zoneAt){
  const R=D/2,g=0.5; // grille de repérage (1 mm : 92 % au contact au lieu de 96 %, cordes sur les courbes)
  const R0=Math.max(0,R-rc);
  // descente torique EXACTE (faoTorusDropper) : contact du vrai tore
  const dB=faoTorusDropper(M,D,rc,laisse);
  const dF=faoScDropper(M,'flat',D,0,laisse);
  const x0=BB.x0-R,y0=BB.y0-R,nx=Math.ceil((BB.x1+R-x0)/g)+1,ny=Math.ceil((BB.y1+R-y0)/g)+1;
  const tF=new Float64Array(nx*ny).fill(NaN),tB=new Float64Array(nx*ny).fill(NaN);
  const fAt=function(k){let v=tF[k];if(v!==v){const i=k%nx,j=(k-i)/nx;v=dF.tip(x0+i*g,y0+j*g);if(!(v>-1/0))v=-1e9;tF[k]=v;}return v;};
  const bAt=function(k){let v=tB[k];if(v!==v){const i=k%nx,j=(k-i)/nx;v=dB.tip(x0+i*g,y0+j*g);if(!(v>-1/0))v=-1e9;tB[k]=v;}return v;};
  const tipB=function(x,y){const v=dB.tip(x,y);return v>-1/0?v:-1e9;};
  const tipF=function(x,y){const v=dF.tip(x,y);return v>-1/0?v:-1e9;};
  return {g:g,x0:x0,y0:y0,nx:nx,ny:ny,rc:rc,D:D,fAt:fAt,bAt:bAt,tipB:tipB,tipF:tipF,zoneAt:zoneAt};
}
// Courbes « pointe outil réel = z » : morceaux où la fraise droite n'était PAS
// au contact (écart > 0,03 mm), orientés matière à droite si avalant.
function faoBullRingRuns(C,z,climb,all){
  const nx=C.nx,ny=C.ny,g=C.g,eps=1e-6;
  // faisable (pointe réelle <= z) ; la fraise droite borne : tB <= tF, tB >= tF − rc
  const feas=function(k){const f=C.fAt(k);if(f<=z+eps)return true;if(f-C.rc>z+eps)return false;return C.bAt(k)<=z+eps;};
  const P=function(k){const i=k%nx,j=(k-i)/nx;return [C.x0+i*g,C.y0+j*g];};
  const cut=new Map();
  const cross=function(a,b){ // a faisable, b non
    const key=a<b?a*67108864+b:b*67108864+a;
    let c=cut.get(key);if(c)return c;
    // fausse position (Illinois) sur la pointe exacte, bornée par les nœuds
    // (valeurs déjà calculées) : 4 à 6 évaluations au lieu de 14 dichotomies
    const A=P(a),B=P(b),zt=z-0.005; // marge 5 µm
    let lo=0,hi=1,flo=C.bAt(a)-zt,fhi=C.bAt(b)-zt,side=0;
    if(!(flo<=0))flo=-1e-6; if(!(fhi>0))fhi=1e-6;
    if(flo<-1e8)flo=-50; // pas de matière : borne grossière
    for(let it=0;it<8&&hi-lo>2e-4;it++){
      let m=(lo*fhi-hi*flo)/(fhi-flo);
      if(!(m>lo&&m<hi))m=(lo+hi)/2;
      const fm=C.tipB(A[0]+(B[0]-A[0])*m,A[1]+(B[1]-A[1])*m)-zt;
      if(fm<=0){lo=m;flo=fm;if(side===-1)fhi/=2;side=-1;}else{hi=m;fhi=fm;if(side===1)flo/=2;side=1;}
    }
    c={key:key,p:[A[0]+(B[0]-A[0])*lo,A[1]+(B[1]-A[1])*lo]};cut.set(key,c);return c;
  };
  const segs=[];
  const tri=function(a,b,c){
    const fa=feas(a),fb=feas(b),fc=feas(c);
    if(fa===fb&&fb===fc)return;
    const V=[[a,fa],[b,fb],[c,fc]],pts=[];
    for(let q=0;q<3;q++){const u=V[q],w=V[(q+1)%3];if(u[1]!==w[1])pts.push(u[1]?cross(u[0],w[0]):cross(w[0],u[0]));}
    if(pts.length===2)segs.push(pts);
  };
  // cellules utiles seulement : un nœud au moins dans la bande [z, z+rc] de la fraise droite
  for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){
    const a=j*nx+i,b=a+1,c=a+nx,d=c+1;
    const fa=C.fAt(a),fb=C.fAt(b),fc=C.fAt(c),fd=C.fAt(d);
    const lo=Math.min(fa,fb,fc,fd),hi=Math.max(fa,fb,fc,fd);
    if(hi<=z+eps||lo-C.rc>z+eps)continue;
    if(((i+j)&1)===0){tri(a,b,d);tri(a,d,c);}else{tri(a,b,c);tri(b,d,c);}
  }
  // chaînage par clés d'arête
  const adj=new Map();
  segs.forEach(function(s,i){[s[0].key,s[1].key].forEach(function(k){let l=adj.get(k);if(!l){l=[];adj.set(k,l);}l.push(i);});});
  const used=new Uint8Array(segs.length),chains=[];
  const walk=function(si,fromKey){
    const out=[];let cur=si,k=fromKey;
    while(cur>=0&&!used[cur]){used[cur]=1;const s=segs[cur];const nk=s[0].key===k?s[1]:s[0];out.push(nk.p);k=nk.key;
      const l=adj.get(k)||[];cur=-1;for(let q=0;q<l.length;q++)if(!used[l[q]]){cur=l[q];break;}}
    return {pts:out,endKey:k};
  };
  // chaînes ouvertes d'abord (bout de degré 1), puis boucles fermées
  for(let pass=0;pass<2;pass++)for(let i=0;i<segs.length;i++){
    if(used[i])continue;
    const s=segs[i];
    let sk;
    if(pass===0){
      if((adj.get(s[0].key)||[]).length===1)sk=s[0].key;
      else if((adj.get(s[1].key)||[]).length===1)sk=s[1].key;
      else continue;
    }else sk=s[0].key;
    const p0=(s[0].key===sk?s[0]:s[1]).p;
    const w=walk(i,sk);
    const pts=[p0].concat(w.pts);
    chains.push({pts:pts,closed:pass===1&&w.endKey===sk&&pts.length>3});
  }
  // garder où la fraise droite n'était pas au contact, dans la zone ; orienter
  const runs=[];
  chains.forEach(function(ch){
    let pts=ch.pts;
    if(pts.length<3)return;
    // orientation : matière (non faisable) à droite si avalant
    let bi=0,bl=0;for(let i=0;i+1<pts.length;i++){const l=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);if(l>bl){bl=l;bi=i;}}
    if(!(bl>1e-6))return;
    const ux=(pts[bi+1][0]-pts[bi][0])/bl,uy=(pts[bi+1][1]-pts[bi][1])/bl,mx=(pts[bi][0]+pts[bi+1][0])/2,my=(pts[bi][1]+pts[bi+1][1])/2;
    const matRight=C.tipB(mx+uy*0.3,my-ux*0.3)>z+eps;
    if(matRight!==!!climb)pts=pts.slice().reverse();
    // all : contour COMPLET (mini-passe remplacée) ; sinon seulement où la
    // fraise droite n'était pas déjà au contact
    const keep=function(p){return (all||C.tipF(p[0],p[1])>z+0.03)&&(!C.zoneAt||C.zoneAt(p[0],p[1]));};
    let cur=[];
    const flush=function(){
      if(cur.length>=2){let L=0;for(let i=1;i<cur.length;i++)L+=Math.hypot(cur[i][0]-cur[i-1][0],cur[i][1]-cur[i-1][1]);
        if(L>=2)runs.push({pts:faoSimplifyPts(cur,0.004),closed:false});}
      cur=[];
    };
    // contour FERMÉ entièrement dans la zone et utile quelque part : fait
    // d'un seul tenant (une entrée, pas de remontée entre morceaux ; repasse
    // à vide là où la fraise droite touchait déjà)
    if(ch.closed){
      // 2026-10-21-008 : « utile » et « dans la zone » évalués INDÉPENDAMMENT —
      // la boucle s'arrêtait au 1er point hors zone AVANT d'avoir vu un point
      // utile : un contour qui COMMENCE hors zone (flanc rouge, limite) était
      // jeté en entier au lieu d'être découpé (minipasses disparues sous la
      // 2e bande de Malaxeur Retard).
      let useful=!!all,inZ=true;
      for(let i=0;i<pts.length&&(inZ||!useful);i++){
        if(inZ&&C.zoneAt&&!C.zoneAt(pts[i][0],pts[i][1]))inZ=false;
        if(!useful&&C.tipF(pts[i][0],pts[i][1])>z+0.03)useful=true;
      }
      if(!useful)return;
      if(inZ){runs.push({pts:faoSimplifyPts(pts,0.004),closed:true});return;}
    }
    for(let i=0;i<pts.length;i++){if(keep(pts[i]))cur.push(pts[i]);else flush();}
    flush();
  });
  return runs;
}
// Émission des passes toriques d'un niveau à la suite des moves du moteur.
function faoBullRingLevel(C,z,moves,o){
  const runs=faoBullRingRuns(C,z,o.sens==='avalant',!!o.all);
  if(!runs.length)return 0;
  const secu=o.secu,tv=Math.min(secu,isFinite(+o.travelZ)?+o.travelZ:secu);
  const linkMax=o.linkMax;
  const rnd=function(v){return Math.round(v*1000)/1000;};
  const last=function(){return moves.length?moves[moves.length-1]:null;};
  // 2026-10-21-010 : entrées / sorties / liaisons dans la zone SÛRE (le vide
  // à côté du brut-corps est libre ; zoneAt = zone de coupe, matière comprise)
  const zSafe=C.zoneSafe||C.zoneAt;
  const cleared=function(x,y){return C.tipF(x,y)<=z+1e-6&&(!zSafe||zSafe(x,y));};
  const reach=function(x,y){return C.tipB(x,y)<=z+1e-6;};
  // point d'entrée côté usiné : décalé de la passe vers le côté libre
  const freePt=function(P,Q,atEnd){
    const dx=Q[0]-P[0],dy=Q[1]-P[1],L=Math.hypot(dx,dy);if(!(L>1e-9))return null;
    // matière à droite (avalant) ou à gauche : libre = côté opposé
    let nx=-dy/L,ny=dx/L; if(o.sens!=='avalant'){nx=-nx;ny=-ny;}
    const B=atEnd?Q:P;
    const offs=[1,1.5,2,3,4,6];
    for(let q=0;q<offs.length;q++){
      const E=[B[0]+nx*offs[q],B[1]+ny*offs[q]];
      if(!cleared(E[0],E[1]))continue;
      let ok=true;for(let s=1;s<8&&ok;s++){const t=s/8;if(!reach(E[0]+(B[0]-E[0])*t,E[1]+(B[1]-E[1])*t))ok=false;}
      if(ok)return E;
    }
    return null;
  };
  let n=0;
  runs.forEach(function(run){
    let pts=run.pts;
    if(pts.length<2)return;
    const p=last();
    let E=null,X=null;
    if(run.closed){
      // départ au plus près — 2026-10-22-005 : sinon au plus près parmi les
      // points d'où l'entrée est libre (contour fermé autour de la pièce dont
      // le point le plus proche tombe devant un flanc rouge : il était jeté)
      const P0=pts,nP=P0.length-1,px=p?p.x:P0[0][0],py=p?p.y:P0[0][1];
      const ord=[];for(let i=0;i<nP;i++)ord.push(i);
      ord.sort(function(a,b){return Math.hypot(P0[a][0]-px,P0[a][1]-py)-Math.hypot(P0[b][0]-px,P0[b][1]-py);});
      const tries=Math.min(ord.length,40),stepT=Math.max(1,Math.floor(ord.length/tries));
      for(let k=0;k<ord.length&&!E;k+=(k<4?1:stepT)){const bi=ord[k];
        const body=P0.slice(bi,nP).concat(P0.slice(0,bi));
        const cand=body.concat([[body[0][0],body[0][1]],body[1]?[body[1][0],body[1][1]]:[body[0][0],body[0][1]]]);
        const e=freePt(cand[0],cand[1],false),x=e?freePt(cand[cand.length-2],cand[cand.length-1],true):null;
        if(e&&x){E=e;X=x;pts=cand;}}
    }else{E=freePt(pts[0],pts[1],false);X=freePt(pts[pts.length-2],pts[pts.length-1],true);}
    // 2026-10-22-005 : sans sortie latérale libre (bout du contour contre un
    // flanc rouge, au bord de la zone), la sortie est la REMONTÉE verticale
    // depuis la dernière coupe — sûre : le corps d'outil occupe déjà la
    // colonne. La passe était jetée entière (« les minipasses ne traversent
    // pas la paroi rouge »). L'entrée, elle, exige toujours un point libre.
    if(E&&!X)X=pts[pts.length-1];
    if(!E||!X)return;
    // liaison : au contact seulement au pas et sur zone usinée, sinon remontée + rapide
    let stay=false;
    // 2026-10-21-013 : o.dzStay — enchaînement AU CONTACT d'une cote de
    // minipasse à la voisine (même endroit, écart de cote ≤ dzStay) au lieu de
    // remonter puis redescendre pour quelques mm (pointes de RETARD)
    const dzOk=(o.dzStay>0)?o.dzStay+1e-6:1e-6;
    if(p&&!p.r&&Math.abs(p.z-z)<dzOk){
      const L=Math.hypot(E[0]-p.x,E[1]-p.y);
      if(L<=linkMax){stay=true;for(let s=1;s<=Math.ceil(L/0.5)&&stay;s++){const t=s/Math.ceil(L/0.5);if(!cleared(p.x+(E[0]-p.x)*t,p.y+(E[1]-p.y)*t))stay=false;}}
    }
    // 2026-10-21-013 : morceau trop court pour valoir une remontée + descente
    // (« traits qui descendent pour rien ») — seulement avec brut-corps / rouge
    if(!stay&&o.minRun>0){let Lr=0;for(let i=1;i<pts.length;i++)Lr+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);if(Lr<o.minRun)return;}
    if(stay){if(Math.abs(p.z-z)>1e-6)moves.push({r:0,tr:1,x:rnd(p.x),y:rnd(p.y),z:z});moves.push({r:0,tr:1,x:rnd(E[0]),y:rnd(E[1]),z:z});}
    else{
      // hauteur de déplacement : tv seulement si l'outil y est libre sur tout
      // le trajet (pointe fraise droite <= tv − 0,5), sinon plan de sécurité
      let hz=tv;
      // 2026-10-21-010 : brut = corps — hors de la zone usinable de ce niveau
      // (faces rouges, zone, brut non atteint) de la matière du brut peut
      // rester au-dessus de tv : le trajet passe alors par le dégagement
      const blocked=function(x,y){
        if(C.tipF(x,y)>tv-0.5)return true;
        if(C.remAt&&C.remAt(x,y,tv))return true; // matière restante du brut (2026-10-21-010)
        return !!(C.stockTop&&C.zoneAt&&!C.zoneAt(x,y)&&C.stockTop(x,y)>tv-0.5);
      };
      if(p){const L=Math.hypot(E[0]-p.x,E[1]-p.y),ns=Math.max(1,Math.ceil(L));
        for(let q=0;q<=ns;q++){const t=q/ns;if(blocked(p.x+(E[0]-p.x)*t,p.y+(E[1]-p.y)*t)){hz=secu;break;}}}
      else hz=secu;
      if(p&&p.z<hz-1e-9)moves.push({r:1,x:p.x,y:p.y,z:hz});
      moves.push({r:1,x:rnd(E[0]),y:rnd(E[1]),z:hz});
      if(hz>z+1+1e-9)moves.push({r:1,x:rnd(E[0]),y:rnd(E[1]),z:z+1}); // colonne usinée au-dessus de E
      moves.push({r:0,ent:1,x:rnd(E[0]),y:rnd(E[1]),z:z});
    }
    moves.push({r:0,ent:1,x:rnd(pts[0][0]),y:rnd(pts[0][1]),z:z});
    for(let i=1;i<pts.length;i++)moves.push({r:0,x:rnd(pts[i][0]),y:rnd(pts[i][1]),z:z});
    moves.push({r:0,ent:1,x:rnd(X[0]),y:rnd(X[1]),z:z});
    n++;
  });
  return n;
}

// Descente d'un outil TORIQUE (ou boule : R0 = 0) exacte : pointe la plus basse
// sans pénétration. Disque plat de rayon R0 + tore (cercle des centres R0,
// rayon de coin rc, laisse L = outil gonflé). Sommets et points d'arêtes (pas
// 0,2 mm : écart < 0,003 mm) en formule fermée, facettes inclinées en
// formule fermée (point de contact du tore sur le plan), facettes
// horizontales sous le disque. Cellules de 2 mm triées par Z décroissant
// (arrêt dès qu'un point ne peut plus relever la pointe).
function faoTorusDropper(mesh,D,rc,laisse){
  const L=isFinite(+laisse)&&+laisse>0?+laisse:0;
  const R0=Math.max(0,D/2-rc),rL=rc+L,reach=R0+rL+1e-6,cs=2;
  const V=mesh.v,T=mesh.t;
  let x0=1/0,y0=1/0,x1=-1/0,y1=-1/0;
  for(let i=0;i<V.length;i++){const p=V[i];if(p[0]<x0)x0=p[0];if(p[0]>x1)x1=p[0];if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1];}
  const ox=x0-reach,oy=y0-reach,nx=Math.ceil((x1-x0+2*reach)/cs)+1,ny=Math.ceil((y1-y0+2*reach)/cs)+1;
  // points : sommets + échantillons d'arêtes
  const PX=[],PY=[],PZ=[];
  const seen=new Set();
  for(let i=0;i<V.length;i++){PX.push(V[i][0]);PY.push(V[i][1]);PZ.push(V[i][2]);}
  const FA=[];
  for(let i=0;i<T.length;i++){
    const t=T[i],A=V[t[0]],B=V[t[1]],C=V[t[2]];
    for(let e=0;e<3;e++){const p=t[e],q=t[(e+1)%3],k=p<q?p*4194304+q:q*4194304+p;
      if(seen.has(k))continue;seen.add(k);
      const P=V[p],Q=V[q],l=Math.hypot(Q[0]-P[0],Q[1]-P[1],Q[2]-P[2]),n=Math.ceil(l/0.2);
      for(let s=1;s<n;s++){const u=s/n;PX.push(P[0]+(Q[0]-P[0])*u);PY.push(P[1]+(Q[1]-P[1])*u);PZ.push(P[2]+(Q[2]-P[2])*u);}}
    const ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2],wx=C[0]-A[0],wy=C[1]-A[1],wz=C[2]-A[2];
    let fx=uy*wz-uz*wy,fy=uz*wx-ux*wz,fz=ux*wy-uy*wx;const fl=Math.hypot(fx,fy,fz);
    if(!(fl>1e-12))continue;fx/=fl;fy/=fl;fz/=fl;if(fz<0){fx=-fx;fy=-fy;fz=-fz;}
    if(fz<1e-6)continue; // verticale : sommets/arêtes suffisent
    FA.push(A[0],A[1],A[2],B[0],B[1],B[2],C[0],C[1],C[2],fx,fy,fz,Math.max(A[2],B[2],C[2]));
  }
  const nP=PX.length,nF=FA.length/13;
  const cellsP=new Array(nx*ny);
  for(let i=0;i<nP;i++){const ci=Math.floor((PX[i]-ox)/cs),cj=Math.floor((PY[i]-oy)/cs);const k=cj*nx+ci;(cellsP[k]||(cellsP[k]=[])).push(i);}
  for(let k=0;k<cellsP.length;k++)if(cellsP[k]){cellsP[k].sort(function(a,b){return PZ[b]-PZ[a];});cellsP[k]=Int32Array.from(cellsP[k]);}
  // facettes : par cellule (boîte élargie de la portée), Z max décroissant
  const cellsF=new Array(nx*ny);
  for(let f=0;f<nF;f++){const o=f*13;
    const bx0=Math.min(FA[o],FA[o+3],FA[o+6])-reach,bx1=Math.max(FA[o],FA[o+3],FA[o+6])+reach;
    const by0=Math.min(FA[o+1],FA[o+4],FA[o+7])-reach,by1=Math.max(FA[o+1],FA[o+4],FA[o+7])+reach;
    for(let j=Math.max(0,Math.floor((by0-oy)/cs));j<=Math.min(ny-1,Math.floor((by1-oy)/cs));j++)
      for(let i=Math.max(0,Math.floor((bx0-ox)/cs));i<=Math.min(nx-1,Math.floor((bx1-ox)/cs));i++){const k=j*nx+i;(cellsF[k]||(cellsF[k]=[])).push(f);}}
  for(let k=0;k<cellsF.length;k++)if(cellsF[k]){cellsF[k].sort(function(a,b){return FA[b*13+12]-FA[a*13+12];});cellsF[k]=Int32Array.from(cellsF[k]);}
  const inTri=function(o,px,py){
    const ax=FA[o],ay=FA[o+1],bx=FA[o+3],by=FA[o+4],cx=FA[o+6],cy=FA[o+7];
    const d1=(px-bx)*(ay-by)-(ax-bx)*(py-by),d2=(px-cx)*(by-cy)-(bx-cx)*(py-cy),d3=(px-ax)*(cy-ay)-(cx-ax)*(py-ay);
    return !(((d1<0)||(d2<0)||(d3<0))&&((d1>0)||(d2>0)||(d3>0)));
  };
  const distTri=function(o,px,py){ // distance XY point–triangle (0 dedans)
    if(inTri(o,px,py))return 0;
    let m=1/0;for(let e=0;e<3;e++){const ax=FA[o+e*3],ay=FA[o+e*3+1],bx=FA[o+((e+1)%3)*3],by=FA[o+((e+1)%3)*3+1];
      const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy;let t=l2>0?((px-ax)*dx+(py-ay)*dy)/l2:0;t=t<0?0:t>1?1:t;
      const qx=ax+dx*t-px,qy=ay+dy*t-py,d=qx*qx+qy*qy;if(d<m)m=d;}
    return Math.sqrt(m);
  };
  const r2=reach*reach;
  const tip=function(x,y){
    let h=-1/0;
    const ci=Math.floor((x-ox)/cs),cj=Math.floor((y-oy)/cs),cr=Math.ceil(reach/cs);
    if(ci<-cr||cj<-cr||ci>=nx+cr||cj>=ny+cr)return h;
    for(let j=Math.max(0,cj-cr);j<=Math.min(ny-1,cj+cr);j++)for(let i=Math.max(0,ci-cr);i<=Math.min(nx-1,ci+cr);i++){
      const l=cellsP[j*nx+i];if(!l)continue;
      for(let q=0;q<l.length;q++){const p=l[q],pz=PZ[p];
        if(pz+L<=h)break; // ne peut plus relever la pointe
        const dx=PX[p]-x,dy=PY[p]-y,d2=dx*dx+dy*dy;if(d2>r2)continue;
        const d=Math.sqrt(d2);let z;
        if(d<=R0)z=pz+L;else{const u=d-R0;z=pz+Math.sqrt(Math.max(0,rL*rL-u*u))-rc;}
        if(z>h)h=z;}
    }
    const lf=(ci>=0&&cj>=0&&ci<nx&&cj<ny)?cellsF[cj*nx+ci]:null;
    if(lf)for(let q=0;q<lf.length;q++){const o=lf[q]*13;
      if(FA[o+12]+L<=h)break;
      const fx=FA[o+9],fy=FA[o+10],fz=FA[o+11],nh=Math.hypot(fx,fy);
      if(nh<1e-6){ // horizontale : sous le disque plat (rayon R0, ou R0+rL au contact du tore)
        if(distTri(o,x,y)<=R0+1e-9){const z=FA[o+2]+L;if(z>h)h=z;}
        continue;}
      // point de contact du tore sur le plan
      const k=R0/nh+rL,px=x-k*fx,py=y-k*fy;
      if(!inTri(o,px,py))continue;
      const pz=FA[o+2]-(fx*(px-FA[o])+fy*(py-FA[o+1]))/fz;
      const z=pz-rc+rL*fz;
      if(z>h)h=z;
    }
    return h;
  };
  return {tip:tip,R0:R0,rc:rc,L:L};
}
