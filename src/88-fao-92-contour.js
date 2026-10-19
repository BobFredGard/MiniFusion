/* ===== LOT A — suivi de contour : sections, offset, validation exacte =====
 Chaque passe suit l'intersection modèle/plan OFFSETÉE à la distance d
 (r = D/2 + radial au plus près de la matière) : le centre d'outil reste à
 >= d partout (jamais de gouge), les familles de passes d = r + k*aeA
 parcourent la marge jusqu'aux coins de la boite, E0 referme la limite
 extérieure (x = B.x0-r …) exactement comme le complément scanline d'avant.
  - index de segments (hash) dedup entre plans, chaînes COMPLETES par plan
    pour la parité (trous = XOR par plan, recouvrements = OR entre plans) ;
  - offset : arc de rayon d sur les angles convexes (couverture <= 1,9 :
    un miter y depasserait), miter <= 3d sur les rentrants (sinon chanfrein),
    arêtes échantillonnées a 0,25 mm (fléchisse < 0,0015 -> gouge 5,49 tenue) ;
  - validation stricte de CHAQUE point : dans la boite [B.x0-r,B.x1+r]²,
    distance a TOUTES les sections >= d-1e-6, pas dedans (parite) ;
  - morceaux valides bornés par bissection ±1e-4 (aucun abandon global),
    simplification Douglas-Peucker 0,004, grille Y (B.y0-r + k*aeA) insérée
    APRES simplification — (25,0), (25,52,5), y=-10, y=38 des tests. */
/* Index spatial DENSE (tableau plaqué, bornes connues) : ni concaténation de
   clés string « ix:iy » ni lookups sur objet — le balayage d'un carré de
   rayon d (jusqu'à 25×25 cellules pour d=49) était le 1er coût du fichier. */
function faoHashBuild(cell){ return {cell:cell>0?cell:4,a:[],b:[],x0:0,y0:0,w:0,h:0}; }
function faoHashFit(H,ix0,iy0,ix1,iy1){
  if(ix1<ix0||iy1<iy0)return;
  let x0=H.x0,y0=H.y0,w=H.w,h=H.h;
  if(!w||!h){x0=ix0;y0=iy0;w=ix1-ix0+1;h=iy1-iy0+1;}
  else{
    if(ix0<x0){w+=x0-ix0;x0=ix0;}
    if(ix1>x0+w-1)w=ix1-x0+1;
    if(iy0<y0){h+=y0-iy0;y0=iy0;}
    if(iy1>y0+h-1)h=iy1-y0+1;
  }
  if(w===H.w&&h===H.h&&x0===H.x0&&y0===H.y0)return;
  // Les anciennes cellules doivent être RECALÉES (ox,oy) : si les bornes
  // s'étendent vers la gauche ou le haut, écrire en colonne 0 déplacerait
  // toute la grille d'une case et fausserait les distances.
  const ox=H.x0-x0,oy=H.y0-y0;
  const na=new Array(w*h),nb=new Array(w*h);
  for(let y=0;y<H.h;y++){const o=(y+oy)*w+ox,so=y*H.w;
    for(let x=0;x<H.w;x++){na[o+x]=H.a[so+x];nb[o+x]=H.b[so+x];}}
  H.a=na;H.b=nb;H.x0=x0;H.y0=y0;H.w=w;H.h=h;
}
function faoHashSegs(H,segs){
  const c=H.cell;
  let ix0=1/0,iy0=1/0,ix1=-1/0,iy1=-1/0;
  for(let i=0;i<segs.length;i++){
    const s=segs[i];
    const a=Math.floor(Math.min(s[0],s[2])/c),b=Math.floor(Math.max(s[0],s[2])/c);
    const d=Math.floor(Math.min(s[1],s[3])/c),e=Math.floor(Math.max(s[1],s[3])/c);
    if(a<ix0)ix0=a; if(b>ix1)ix1=b; if(d<iy0)iy0=d; if(e>iy1)iy1=e;
  }
  if(ix1<-1/0)return H;
  faoHashFit(H,ix0,iy0,ix1,iy1);
  const w=H.w,b=H.b;
  for(let i=0;i<segs.length;i++){
    const s=segs[i];
    const ix0=Math.floor(Math.min(s[0],s[2])/c),ix1=Math.floor(Math.max(s[0],s[2])/c);
    const iy0=Math.floor(Math.min(s[1],s[3])/c),iy1=Math.floor(Math.max(s[1],s[3])/c);
    // bbox du segment (une fois) pour l'union par cellule
    const ux0=s[0]<s[2]?s[0]:s[2],ux1=s[0]<s[2]?s[2]:s[0];
    const uy0=s[1]<s[3]?s[1]:s[3],uy1=s[1]<s[3]?s[3]:s[1];
    for(let iy=iy0;iy<=iy1;iy++){const o=(iy-H.y0)*w-H.x0;
      for(let ix=ix0;ix<=ix1;ix++){
        const p=o+ix; let a=H.a[p]; if(!a)a=H.a[p]=[]; a.push(s);
        const q=b[p];
        if(!q)b[p]=[ux0,uy0,ux1,uy1];
        else{ // union : sur-ensemble exact pour rejeter une cellule entière
          if(ux0<q[0])q[0]=ux0; if(uy0<q[1])q[1]=uy0;
          if(ux1>q[2])q[2]=ux1; if(uy1>q[3])q[3]=uy1;
        }
      }}
  }
  return H;
}
function faoDistXY(x,y,segs){
  let best=1/0;
  for(let i=0;i<segs.length;i++){
    const s=segs[i],dx=s[2]-s[0],dy=s[3]-s[1],L2=dx*dx+dy*dy;
    let t=L2>0?((x-s[0])*dx+(y-s[1])*dy)/L2:0;
    if(t<0)t=0;else if(t>1)t=1;
    const ex=s[0]+t*dx-x,ey=s[1]+t*dy-y,d2=ex*ex+ey*ey;
    if(d2<best)best=d2;
  }
  return best===1/0?1/0:Math.sqrt(best);
}
function faoDistSeg(H,x,y,dMax,tMax){
  // Distance au plus proche segment dans le carre [x,y]±dMax ; Infinity si rien
  // a portee — suffisant pour tout test « < seuil » avec seuil <= dMax (aucun
  // segment a portee = >= dMax >= seuil). `tMax` (optionnel) autorise une
  // sortie des que best < tMax^2 : le booléen du test est alors définitif.
  const c=H.cell,a=H.a,W=H.w,Hh=H.h;
  if(!W||!Hh)return 1/0;
  let ix0=Math.floor((x-dMax)/c),ix1=Math.floor((x+dMax)/c);
  let iy0=Math.floor((y-dMax)/c),iy1=Math.floor((y+dMax)/c);
  if(ix0<H.x0)ix0=H.x0; if(ix1>H.x0+W-1)ix1=H.x0+W-1;
  if(iy0<H.y0)iy0=H.y0; if(iy1>H.y0+Hh-1)iy1=H.y0+Hh-1;
  if(ix0>ix1||iy0>iy1)return 1/0;
  const lim=dMax*dMax;
  // tMax absent/inutilisable : -1 (best >= 0 toujours) = aucune sortie
  // anticipée. Piège : 1/0 rendrait `best<tm` vrai dès le 1er segment.
  const tm=(tMax===undefined||!(tMax<dMax))?-1:tMax*tMax;
  const useT=tm>=0, capT=useT?tm:lim, bb=H.b;
  let best=1/0;
  for(let iy=iy0;iy<=iy1;iy++){
    const ro=(iy-H.y0)*W-H.x0;
    for(let ix=ix0;ix<=ix1;ix++){
      const p=ro+ix;
      const arr=a[p]; if(!arr)continue;
      // 2026-10-09-004 — chemin tMax : la bbox UNION des segments de la
      // cellule est une borne inférieure de la distance de CHAQUE segment
      // (seg ⊆ union) : union >= tm ⟹ tous les segments >= tm ⟹ la cellule
      // ne peut contenir aucun < tm, ignorée. Si toutes le sont, le test
      // bolléen est faux — exact (sur-ensemble conservateur).
      if(useT&&bb){const q=bb[p];
        if(q){const qx=x<q[0]?q[0]-x:(x>q[2]?x-q[2]:0),qy=y<q[1]?q[1]-y:(y>q[3]?y-q[3]:0);
          if(qx*qx+qy*qy>=tm)continue;}
      }
      for(let k=0;k<arr.length;k++){
        const s=arr[k],ax=s[0],ay=s[1],bx=s[2],by=s[3];
        // rejet AABB (borne inferieure de la distance) : bien moins cher que
        // la projection sur le segment, et exact pour un seuil <= dMax.
        const x0=ax<bx?ax:bx,x1=ax<bx?bx:ax,y0=ay<by?ay:by,y1=ay<by?by:ay;
        const qx=x<x0?x0-x:(x>x1?x-x1:0),qy=y<y0?y0-y:(y>y1?y-y1:0);
        const cap=best<capT?best:capT;
        if(qx*qx+qy*qy>=cap)continue;
        const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;
        let t=L2>0?((x-ax)*dx+(y-ay)*dy)/L2:0;
        if(t<0)t=0;else if(t>1)t=1;
        const ex=ax+t*dx-x,ey=ay+t*dy-y,d2=ex*ex+ey*ey;
        if(d2<best){
          best=d2;
          if(best<=1e-18)return 0;
          if(best<tm)return Math.sqrt(best);
        }
      }
    }
  }
  return best===1/0?1/0:Math.sqrt(best);
}
function faoPointsKey(pts){
  const a=[];
  for(let i=0;i<pts.length;i++)a.push(Math.round(pts[i][0]*1000)+','+Math.round(pts[i][1]*1000));
  a.sort();
  return a.join(';');
}
function faoChainsClosed(segs){
  // Sections [x1,y1,x2,y2] -> chaînes FERMÉES {pts,bb} (fermeture forcée).
  const raw=faoChainSegs(segs.map(function(s){
    return [{p:[s[0],s[1],0]},{p:[s[2],s[3],0]}];
  }),1e-4);
  const out=[];
  raw.forEach(function(ch){
    const pts=[];
    ch.forEach(function(q){
      const p=q.p;
      if(!pts.length||Math.abs(pts[pts.length-1][0]-p[0])>1e-9||Math.abs(pts[pts.length-1][1]-p[1])>1e-9)
        pts.push([p[0],p[1]]);
    });
    while(pts.length>1&&Math.abs(pts[0][0]-pts[pts.length-1][0])<1e-9&&Math.abs(pts[0][1]-pts[pts.length-1][1])<1e-9)
      pts.pop();
    if(pts.length<3)return;
    pts.push([pts[0][0],pts[0][1]]);
    const bb=faoPtsBB(pts);
    out.push({pts:pts,bb:bb});
  });
  return out;
}
function faoPtsBB(pts){
  const bb=[1/0,1/0,-1/0,-1/0];
  for(let i=0;i<pts.length;i++){
    if(pts[i][0]<bb[0])bb[0]=pts[i][0];
    if(pts[i][1]<bb[1])bb[1]=pts[i][1];
    if(pts[i][0]>bb[2])bb[2]=pts[i][0];
    if(pts[i][1]>bb[3])bb[3]=pts[i][1];
  }
  return bb;
}
function faoShadowShape(mesh,planes,B,r,gstep){
  // Shape du niveau : sections par plan (parité), index global dedup (distance),
  // chaînes uniques (offset), boite de validation [B.*-r,B.*+r], pas de grille.
  const S={pl:[],hash:faoHashBuild(4),rect:[B.x0-r,B.y0-r,B.x1+r,B.y1+r],
    chains:[],keys:{},gstep:gstep>0?gstep:2,segs:[]};
  const seen={};
  planes.forEach(function(zz){
    const segs=faoSliceZCached(mesh,Math.round(zz*1000)/1000);
    if(!segs.length)return;
    const chains=faoChainsClosed(segs);
    if(!chains.length)return;
    const bb=[1/0,1/0,-1/0,-1/0];
    chains.forEach(function(ch){
      if(ch.bb[0]<bb[0])bb[0]=ch.bb[0];
      if(ch.bb[1]<bb[1])bb[1]=ch.bb[1];
      if(ch.bb[2]>bb[2])bb[2]=ch.bb[2];
      if(ch.bb[3]>bb[3])bb[3]=ch.bb[3];
      const k=faoPointsKey(ch.pts.slice(0,ch.pts.length-1));
      if(!S.keys[k]){S.keys[k]=1;S.chains.push(ch);}
    });
    S.pl.push({chains:chains,bb:bb});
    const hs=[];
    segs.forEach(function(s){
      const k=[Math.round(Math.min(s[0],s[2])*1e4)/1e4,Math.round(Math.min(s[1],s[3])*1e4)/1e4,
        Math.round(Math.max(s[0],s[2])*1e4)/1e4,Math.round(Math.max(s[1],s[3])*1e4)/1e4].join(',');
      if(seen[k])return;
      seen[k]=1;
      S.segs.push(s);
      hs.push(s);
    });
    if(hs.length)faoHashSegs(S.hash,hs);
  });
  return S;
}
/* Index Y par tranches (pas 1 mm) : la parité rayon +X ne dépend que des
   arêtes dont l'échantillon Y est inclus dans [min[,max[ ; balayer toute la
   chaîne (2 000 arêtes) 4,4 M de fois coûtait 89 s. Les tranches ne sont
   qu'une CANDIDATURE : la condition exacte est re-testée arête par arête. */
function faoChainYB(ch){
  if(ch.yb)return ch.yb;
  const step=1,pts=ch.pts,y0=ch.bb[1],y1=ch.bb[3];
  const n=Math.max(1,Math.ceil((y1-y0)/step)+1);
  const rows=new Array(n);
  for(let i=0;i+1<pts.length;i++){
    const a=pts[i][1],b=pts[i+1][1];
    if(a===b)continue;
    let i0=Math.floor((Math.min(a,b)-y0)/step),i1=Math.floor((Math.max(a,b)-y0)/step);
    if(i0<0)i0=0; else if(i0>n-1)i0=n-1;
    if(i1<0)i1=0; else if(i1>n-1)i1=n-1;
    for(let k=i0;k<=i1;k++){let arr=rows[k];if(!arr)rows[k]=arr=[];arr.push(i);}
  }
  ch.yb={y0:y0,step:step,rows:rows,n:n};
  return ch.yb;
}
function faoChainParity(ch,x,y){
  // Parité impair (rayon +X) de la chaîne fermée — un seul croisement => dedans.
  if(y<ch.bb[1]||y>ch.bb[3])return 0;
  const yb=faoChainYB(ch);
  let b=Math.floor((y-yb.y0)/yb.step);
  if(b<0)b=0; else if(b>=yb.n)b=yb.n-1;
  const row=yb.rows[b];
  if(!row)return 0;
  const pts=ch.pts;
  let c=0;
  for(let t=0;t<row.length;t++){
    const i=row[t],a=pts[i],b2=pts[i+1];
    if((a[1]>y)!==(b2[1]>y)){
      const tt=(y-a[1])/(b2[1]-a[1]);
      if(a[0]+tt*(b2[0]-a[0])>x)c++;
    }
  }
  return c&1;
}
/* Index Y fusionné PAR PLAN (pas 0,5 mm) : la parité du plan est le XOR des
   parités de toutes ses chaînes = parité du TOTAL des croisements (algèbre
   XOR), donc une seule passe sur les arêtes de la tranche remplace une passe
   par chaîne — exact, la condition d'arête est re-testée mot pour mot. */
function faoPlaneYB(P){
  if(P.yb)return P.yb;
  const step=0.5,chs=P.chains,E=[];
  let y0=1/0,y1=-1/0;
  for(let k=0;k<chs.length;k++){
    const pts=chs[k].pts;
    for(let i=0;i+1<pts.length;i++){
      const a=pts[i],b=pts[i+1];
      E.push(a[0],a[1],b[0],b[1]);
      const ya=a[1],yb2=b[1];
      if(ya<y0)y0=ya; if(yb2<y0)y0=yb2;
      if(ya>y1)y1=ya; if(yb2>y1)y1=yb2;
    }
  }
  let rows=[],n=1;
  if(E.length&&y1>=y0){
    n=Math.max(1,Math.ceil((y1-y0)/step)+1);
    rows=new Array(n);
    for(let i=0;i<E.length;i+=4){
      const ya=E[i+1],yb2=E[i+3];
      if(ya===yb2)continue;
      let i0=Math.floor((Math.min(ya,yb2)-y0)/step),i1=Math.floor((Math.max(ya,yb2)-y0)/step);
      if(i0<0)i0=0; else if(i0>n-1)i0=n-1;
      if(i1<0)i1=0; else if(i1>n-1)i1=n-1;
      for(let t=i0;t<=i1;t++){let arr=rows[t];if(!arr)rows[t]=arr=[];arr.push(i);}
    }
  }
  P.yb={y0:y0,step:step,rows:rows,n:n,E:E};
  return P.yb;
}
/* Grille exacte de parité (2026-10-09-004) : une cellule jamais traversée
   par une arête de plan a une parité CONSTANTE (connexité 4 : aucune
   frontière entre deux cellules voisines non marquées) — valeur calculée
   UNE fois au centre d'une cellule de chaque composante ; cellules-
   frontière → test exact inchangé (faoShapeInsideRaw). Marqueur 3×3
   autour du DDA conservatif (toute arête traversant une cellule la marque).
   Planchers/tables (sauts y hors [bb1,bb3]) : prouvé qu'une cellule non
   marquée straddlant bb ne peut porter la parité 1 de part et d'autre. */
const fsgCache=(typeof WeakMap!=='undefined')?new WeakMap():null;
function fsgGrid(S){
  if(!fsgCache)return null;
  let g=fsgCache.get(S);
  if(g!==undefined)return g;
  g=null;
  const R=S.rect;
  if(R&&R[2]>R[0]&&R[3]>R[1]){
    const sizes=[1,2,4,8];
    for(let si=0;si<sizes.length&&!g;si++){
      const cs=sizes[si];
      const ix0=Math.floor(R[0]/cs),ix1=Math.floor(R[2]/cs);
      const iy0=Math.floor(R[1]/cs),iy1=Math.floor(R[3]/cs);
      const W=ix1-ix0+1,Hh=iy1-iy0+1;
      if(W<1||Hh<1||W*Hh>400000)continue;
      const bnd=new Uint8Array(W*Hh);
      for(let pi=0;pi<S.pl.length;pi++){
        const E=faoPlaneYB(S.pl[pi]).E;
        for(let i=0;i+3<E.length;i+=4){
          const ax=E[i],ay=E[i+1],bx=E[i+2],by=E[i+3];
          const st=Math.max(1,Math.ceil(Math.max(Math.abs(bx-ax),Math.abs(by-ay))/(cs*0.5)));
          for(let t=0;t<=st;t++){
            const ccx=Math.floor((ax+(bx-ax)*(t/st))/cs),ccy=Math.floor((ay+(by-ay)*(t/st))/cs);
            for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){
              const gx=ccx+ox-ix0,gy=ccy+oy-iy0;
              if(gx>=0&&gx<W&&gy>=0&&gy<Hh)bnd[gy*W+gx]=1;
            }
          }
        }
      }
      const comp=new Int32Array(W*Hh); comp.fill(-1);
      const stack=new Int32Array(W*Hh);
      const vals=[];
      let ncomp=0;
      for(let i=0;i<W*Hh;i++){
        if(bnd[i]||comp[i]!==-1)continue;
        let sp=0; stack[sp++]=i; comp[i]=ncomp;
        while(sp){
          const p=stack[--sp];
          const px=p%W,py=(p-px)/W;
          if(px>0&&!bnd[p-1]&&comp[p-1]===-1){comp[p-1]=ncomp;stack[sp++]=p-1;}
          if(px<W-1&&!bnd[p+1]&&comp[p+1]===-1){comp[p+1]=ncomp;stack[sp++]=p+1;}
          if(py>0&&!bnd[p-W]&&comp[p-W]===-1){comp[p-W]=ncomp;stack[sp++]=p-W;}
          if(py<Hh-1&&!bnd[p+W]&&comp[p+W]===-1){comp[p+W]=ncomp;stack[sp++]=p+W;}
        }
        const gx=i%W,gy=(i-gx)/W;
        vals.push(faoShapeInsideRaw(S,(gx+ix0+0.5)*cs,(gy+iy0+0.5)*cs)?1:0);
        ncomp++;
      }
      g={cs:cs,ix0:ix0,iy0:iy0,W:W,H:Hh,comp:comp,vals:vals};
    }
  }
  fsgCache.set(S,g);
  return g;
}
function faoShapeInside(S,x,y){
  const g=fsgGrid(S);
  if(g){
    const gx=Math.floor(x/g.cs)-g.ix0,gy=Math.floor(y/g.cs)-g.iy0;
    if(gx>=0&&gx<g.W&&gy>=0&&gy<g.H){
      const c=g.comp[gy*g.W+gx];
      if(c>=0)return !!g.vals[c];
    }
  }
  return faoShapeInsideRaw(S,x,y);
}
function faoShapeInsideRaw(S,x,y){
  // OR des parités XOR par plan : trous gérés au plan, union entre plans
  // (matiere au-dessus = colonne interdite, meme regle que l'ombre).
  for(let i=0;i<S.pl.length;i++){
    const P=S.pl[i];
    if(y<P.bb[1]||y>P.bb[3])continue;
    const yb=faoPlaneYB(P);
    if(!yb.E.length)continue;
    let b=Math.floor((y-yb.y0)/yb.step);
    if(b<0)b=0; else if(b>=yb.n)b=yb.n-1;
    const row=yb.rows[b];
    if(!row)continue;
    const E=yb.E;
    let c=0;
    for(let t=0;t<row.length;t++){
      const i=row[t],ax=E[i],ay=E[i+1],bx=E[i+2],by=E[i+3];
      if((ay>y)!==(by>y)){
        const tt=(y-ay)/(by-ay);
        if(ax+tt*(bx-ax)>x)c^=1;
      }
    }
    if(c)return true;
  }
  return false;
}
function faoShapeValid(S,x,y,d){
  const R=S.rect;
  if(x<R[0]-1e-9||y<R[1]-1e-9||x>R[2]+1e-9||y>R[3]+1e-9)return false;
  // 2026-10-09-004 : parité d'abord (grille O(1)) — un point DANS la
  // matière est rejeté sans balayer le hash de distance ; ET logique
  // (les deux tests doivent échouer) : l'ordre ne change pas le résultat.
  if(faoShapeInside(S,x,y))return false;
  if(faoDistSeg(S.hash,x,y,d,d-1e-6)<d-1e-6)return false;
  return true;
}
function faoChainSide(ch,S){
  // Sens de l'offset : probe d'interiorite a ±1e-3 de l'arête (cote NON
  // matiere = sortant) — indispensable pour les chaines de trous (offset DANS
  // le trou). Repli : vote multi-arêtes, puis shoelace.
  const pts=ch.pts,n=pts.length-1;
  if(n<1)return 1;
  const order=[];
  for(let i=0;i<n;i++){
    const dx=pts[i+1][0]-pts[i][0],dy=pts[i+1][1]-pts[i][1];
    order.push([dx*dx+dy*dy,i]);
  }
  order.sort(function(a,b){return b[0]-a[0];});
  let vr=0,vl=0;
  for(let k=0;k<Math.min(5,order.length);k++){
    const i=order[k][1];
    let ux=pts[i+1][0]-pts[i][0],uy=pts[i+1][1]-pts[i][1];
    const L=Math.hypot(ux,uy); if(!(L>1e-9))continue;
    ux/=L;uy/=L;
    const mx=(pts[i][0]+pts[i+1][0])/2,my=(pts[i][1]+pts[i+1][1])/2;
    const nx=uy,ny=-ux; // perp droite
    if(faoShapeInside(S,mx+nx*1e-3,my+ny*1e-3))vr++;
    else if(faoShapeInside(S,mx-nx*1e-3,my-ny*1e-3))vl++;
  }
  if(vr>vl)return -1;
  if(vl>vr)return 1;
  let a2=0;
  for(let i=0;i<n;i++)a2+=pts[i][0]*pts[i+1][1]-pts[i+1][0]*pts[i][1];
  return a2>0?1:-1;
}
function faoOffsetChain(pts,d,side){
  // Offset fermé a distance d du cote « sortant » (side=+1 : normale perp
  // droite de la marche). Convexe -> arc (pas angulaire <= 0.25/d, cap 0.2) ;
  // rentrant -> miter (intersection des deux droites offset) si <= 3d, sinon
  // chanfrein tronqué a 3d. Retourne le polygone CYCLIQUE (dernier point
  // adjacent au premier), ou null si degenere.
  const n=pts.length-1;
  if(n<3||!(d>0))return null;
  const dir=[],nor=[];
  for(let i=0;i<n;i++){
    let dx=pts[i+1][0]-pts[i][0],dy=pts[i+1][1]-pts[i][1];
    const L=Math.hypot(dx,dy);
    if(!(L>1e-9))return null;
    dx/=L;dy/=L;
    dir.push([dx,dy]);
    nor.push(side>0?[dy,-dx]:[-dy,dx]);
  }
  const cr2=function(a,b){return a[0]*b[1]-a[1]*b[0];};
  const V=[];
  for(let i=0;i<n;i++){
    const ip=(i-1+n)%n,u=dir[ip],v=dir[i],P=pts[i];
    const cr=cr2(u,v);
    const Sp=[P[0]+d*nor[ip][0],P[1]+d*nor[ip][1]];
    const Ep=[P[0]+d*nor[i][0],P[1]+d*nor[i][1]];
    const it={u:u,v:v,P:P,cr:cr,S:Sp,E:Ep,conv:cr*side>1e-12,list:null,entry:null,exit:null};
    if(it.conv){
      const list=[[Sp[0],Sp[1]]];
      const a0=Math.atan2(Sp[1]-P[1],Sp[0]-P[0]);
      let a1=Math.atan2(Ep[1]-P[1],Ep[0]-P[0]);
      let da=a1-a0;
      while(da<=-Math.PI)da+=2*Math.PI;
      while(da>Math.PI)da-=2*Math.PI;
      if(Math.abs(da)>1e-12){
        const stp=Math.min(0.2,0.25/d);
        const k=Math.max(1,Math.ceil(Math.abs(da)/stp));
        for(let t=1;t<k;t++){
          const a=a0+da*t/k;
          list.push([P[0]+d*Math.cos(a),P[1]+d*Math.sin(a)]);
        }
      }
      list.push([Ep[0],Ep[1]]);
      it.list=list;
      it.entry=list[0];
      it.exit=list[list.length-1];
    }else if(Math.abs(cr)>1e-9){
      const t=cr2([Ep[0]-Sp[0],Ep[1]-Sp[1]],v)/cr;
      const M=[Sp[0]+t*u[0],Sp[1]+t*u[1]];
      const dm=Math.hypot(M[0]-P[0],M[1]-P[1]);
      if(dm<=3*d){
        it.list=[[M[0],M[1]]];
        it.entry=it.list[0];
        it.exit=it.list[0];
      }else{
        const lim=d*Math.sqrt(8); // distance ligne offset telle que |A-P| = 3d
        const sgn=t>=0?1:-1;
        const A=[Sp[0]+sgn*lim*u[0],Sp[1]+sgn*lim*u[1]];
        const s2=cr2([Ep[0]-Sp[0],Ep[1]-Sp[1]],u)/cr;
        const sgn2=s2>=0?1:-1;
        const C=[Ep[0]+sgn2*lim*v[0],Ep[1]+sgn2*lim*v[1]];
        it.list=[[A[0],A[1]],[C[0],C[1]]];
        it.entry=it.list[0];
        it.exit=it.list[1];
      }
    }else{
      it.list=[[Sp[0],Sp[1]],[Ep[0],Ep[1]]];
      it.entry=it.list[0];
      it.exit=it.list[1];
    }
    V.push(it);
  }
  const out=[];
  const put=function(x,y){
    if(out.length&&Math.abs(out[out.length-1][0]-x)<1e-9&&Math.abs(out[out.length-1][1]-y)<1e-9)return;
    out.push([x,y]);
  };
  const sample=function(A,B){
    const dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy);
    if(!(L>1e-9))return;
    const k=Math.ceil(L/0.25);
    for(let t=1;t<k;t++)put(A[0]+dx*t/k,A[1]+dy*t/k);
  };
  for(let i=0;i<n;i++){
    const it=V[i];
    for(let k=0;k<it.list.length;k++)put(it.list[k][0],it.list[k][1]);
    const nx=V[(i+1)%n];
    sample(it.exit,nx.entry);
  }
  return out.length>=3?out:null;
}
function faoBisectValid(a,b,isValid){
  // Frontiere valid/invalide : renvoie TOUJOURS un point du cote VALIDE.
  const vA=isValid(a),vB=isValid(b);
  if(vA&&vB)return b;
  if(!vA&&!vB)return null;
  let A=vA?b:a, B=vA?a:b; // A = cote invalide, B = cote valide
  for(let i=0;i<40&&Math.hypot(B[0]-A[0],B[1]-A[1])>1e-4;i++){
    const m=[(A[0]+B[0])/2,(A[1]+B[1])/2];
    if(isValid(m))B=m;else A=m;
  }
  return B;
}
function faoSplitValid(pts,isValid){
  // Polygone cyclique -> morceaux valides, bornes affinées par bissection
  // (±1e-4) : aucun morceau n'est abandonné en bloc.
  const n=pts.length;
  if(n<3)return [];
  const v=new Array(n);
  let all=true;
  for(let i=0;i<n;i++){v[i]=!!isValid(pts[i]);if(!v[i])all=false;}
  if(all)return [pts];
  let k=0;
  while(k<n&&v[k])k++;
  if(k>=n)return [];
  const L=n,rot=new Array(L),rv=new Array(L);
  for(let i=0;i<L;i++){rot[i]=pts[(k+i)%L];rv[i]=v[(k+i)%L];}
  const out=[];
  let i=1;
  while(i<L){
    if(!rv[i]){i++;continue;}
    let j=i;
    while(j+1<L&&rv[j+1])j++;
    const b0=faoBisectValid(rot[i-1],rot[i],isValid);
    const b1=faoBisectValid(rot[j],rot[(j+1)%L],isValid);
    const run=[];
    if(b0)run.push(b0);
    for(let t=i;t<=j;t++)run.push(rot[t]);
    if(b1)run.push(b1);
    if(run.length>=2)out.push(run);
    i=j+2;
  }
  return out;
}
function faoSimplifyPts(pts,tol){
  // Douglas-Peucker iteratif : ne garde QUE des points d'origine (distances
  // deja validées intacts), ecart max tol.
  const n=pts.length;
  if(n<3)return pts.slice();
  const keep=new Array(n).fill(false);
  keep[0]=keep[n-1]=true;
  const st=[[0,n-1]];
  while(st.length){
    const seg=st.pop(),a=seg[0],b=seg[1];
    if(b-a<2)continue;
    const A=pts[a],B=pts[b];
    const dx=B[0]-A[0],dy=B[1]-A[1],L2=dx*dx+dy*dy;
    let md=-1,mi=-1;
    for(let q=a+1;q<b;q++){
      const P=pts[q];
      let dd;
      if(L2<1e-18)dd=Math.hypot(P[0]-A[0],P[1]-A[1]);
      else{
        let t=((P[0]-A[0])*dx+(P[1]-A[1])*dy)/L2;
        if(t<0)t=0;else if(t>1)t=1;
        dd=Math.hypot(P[0]-(A[0]+dx*t),P[1]-(A[1]+dy*t));
      }
      if(dd>md){md=dd;mi=q;}
    }
    if(md>tol){keep[mi]=true;st.push([a,mi],[mi,b]);}
  }
  const out=[];
  for(let q=0;q<n;q++)if(keep[q])out.push(pts[q]);
  return out;
}
function faoInsertGridY(pts,y0,step,closed,isValid){
  // Grille Y (y0 + k*step) : insertion APRÈS simplification — (25,0),
  // (25,52,5), y=-10, y=38 des tests sortent la ligne verticale exacte.
  if(!(step>0)||pts.length<2)return pts;
  const out=[],n=pts.length;
  const segs=closed?n:n-1;
  for(let i=0;i<segs;i++){
    const A=pts[i],B=pts[(i+1)%n];
    out.push(A);
    const dy=B[1]-A[1];
    if(Math.abs(dy)<1e-12)continue;
    const ylo=Math.min(A[1],B[1]),yhi=Math.max(A[1],B[1]);
    const k0=Math.ceil((ylo-y0)/step-1e-9),k1=Math.floor((yhi-y0)/step+1e-9);
    // Ordre du TRAJET : croissant si le segment monte, decroissant s'il descend
    // (sinon la grille intervertit les points et dessine un zigzag).
    const g0=dy>0?k0:k1, g1=dy>0?k1:k0, gs=dy>0?1:-1;
    for(let g=g0;gs>0?g<=g1:g>=g1;g+=gs){
      const yG=y0+g*step;
      if(yG<=ylo+1e-9||yG>=yhi-1e-9)continue;
      const t=(yG-A[1])/dy;
      const p=[A[0]+t*(B[0]-A[0]),yG];
      if(isValid&&!isValid(p))continue;
      out.push(p);
    }
  }
  if(!closed)out.push(pts[n-1]);
  return out;
}
function faoEmitRuns(S,raw,valid,out){
  // Valide -> morceaux (bissection) -> simplifie -> grille Y -> dedup/drop.
  if(!out.dedup)out.dedup={};
  const runs=faoSplitValid(raw,valid);
  for(let ri=0;ri<runs.length;ri++){
    const run=runs[ri];
    if(run.length<2)continue;
    const simp=faoSimplifyPts(run,0.004);
    const closed=(run===raw);
    const grd=faoInsertGridY(simp,S.rect[1],S.gstep,closed,valid);
    if(grd.length<2)continue;
    const bb=faoPtsBB(grd);
    if(Math.max(bb[2]-bb[0],bb[3]-bb[1])<0.1)continue;
    const k=faoPointsKey(grd);
    if(out.dedup[k])continue;
    out.dedup[k]=1;
    out.push({pts:grd,closed:closed,bb:bb});
  }
  return out;
}
function faoRectRaw(x0,y0,x1,y1){
  // Rectangle échantillonné a 0,25 mm (E0/E-k : memes regles de validation).
  const c=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
  const raw=[];
  for(let i=0;i<4;i++){
    const A=c[i],B=c[(i+1)%4];
    const L=Math.hypot(B[0]-A[0],B[1]-A[1]);
    const k=Math.max(1,Math.ceil(L/0.25));
    for(let t=0;t<k;t++){
      const p=[A[0]+(B[0]-A[0])*t/k,A[1]+(B[1]-A[1])*t/k];
      if(!raw.length||Math.abs(raw[raw.length-1][0]-p[0])>1e-9||Math.abs(raw[raw.length-1][1]-p[1])>1e-9)
        raw.push(p);
    }
  }
  return raw;
}
function faoOffsetRuns(S,d){
  // Toutes les chaines du niveau offsetées a d -> morceaux valides.
  const out=[];
  const valid=function(p){return faoShapeValid(S,p[0],p[1],d);};
  for(let ci=0;ci<S.chains.length;ci++){
    const ch=S.chains[ci];
    if(!ch.side)ch.side=faoChainSide(ch,S);
    const raw=faoOffsetChain(ch.pts,d,ch.side);
    if(!raw)continue;
    faoEmitRuns(S,raw,valid,out);
  }
  return out;
}
function faoRectRuns(S,inset,d){
  // E0 (inset=0) : le tour de la boite de validation, valide a d (= r).
  // E-k (inset=k*aeA) : cadres imbriqués pour les niveaux vides (surfaçage).
  const R=S.rect;
  const x0=R[0]+inset,x1=R[2]-inset,y0=R[1]+inset,y1=R[3]-inset;
  if(!(x1-x0>0.2&&y1-y0>0.2))return [];
  const out=[];
  const valid=function(p){return faoShapeValid(S,p[0],p[1],d);};
  faoEmitRuns(S,faoRectRaw(x0,y0,x1,y1),valid,out);
  return out;
}

function faoRoughAdaptiveLevel(mesh,B,z,D,r,secu,zFrom,ae,entryMode,brutTop,zt,moves,opt){
  // Une tranche façon Adaptive : pelage au petit pas (aeA ≤ 0.25*D) dans le
  // vide RESTANT (ombre des niveaux supérieurs), entrée hélice multi-spots /
  // rampe X ou Y / micro-hélice, liaisons G1 sans retrait dans la région,
  // trochoïdes G2/G3 dans les goulets (largeur < 2.5*D).
  const segs=faoSliceZCached(mesh,z);
  const top=isFinite(+zt)?+zt:z;
  const aeA=Math.max(0.5,Math.min(isFinite(+ae)&&+ae>0?+ae:D*0.2,D*0.25));
  // 2026-10-14-005 : GLISSEMENT (liaison G1 à la cote) SEULEMENT pour passer
  // à la passe voisine — longueur <= 1,5 × pas latéral (demande : « je ne
  // veux des glissements que quand on change d'un pas. Après c'est du
  // rapide ! Sinon, on fait des traces involontaires »). Au-delà : lever +
  // rapide + entrée (remplace la règle des 30 mm, faoRapideMin).
  const linkMax=Math.max(0.5,1.5*aeA);
  const linkNear=function(ax,ay,bx,by){const dx=bx-ax,dy=by-ay;return dx*dx+dy*dy<=linkMax*linkMax+1e-9;};
  // Plans partagés du niveau : ombre + colonnes d'hélice lisent les mêmes
  // Z vertex (aucun voile fin manqué, slices en cache).
  const planes=faoShadowPlanes(mesh,z,Math.max(top,isFinite(+brutTop)?+brutTop:z));
  // Entrée : le corps de l'outil monte jusqu'au brut — le disque se vérifie
  // sur TOUTES les sections du niveau (l'ombre), pas seulement à z : un
  // voile fin au-dessus n'apparaît pas dans la slice à z et l'hélice le
  // traversait en descendant.
  let segsAll=segs.slice();
  for(let pi=0;pi<planes.length;pi++){
    if(planes[pi]>z+1e-9)segsAll=segsAll.concat(faoSliceZCached(mesh,planes[pi]));
  }
  const ys=[]; let y=B.y0-r, g=0;
  while(y<=B.y1+r+1e-9&&g++<100000){
    // lignes purement hors brut (disque tangent sans coupe) : ignorees
    if(!(y+r<=B.y0+1e-9||y-r>=B.y1-1e-9))ys.push(y);
    y+=aeA;
  }
  if(!ys.length)return;
  const lines=[];
  const seenY={};
  ys.forEach(function(yy){
    let ivs=faoShadowIntervals(mesh,B,yy,z,top,r,aeA,planes);
    if(!ivs.length)return;
    // Bornage exact au RAYON sur les murs en Y (retour 4/10) : l'existence
    // lisait y±aeA (aeA<r) et laissait passer jusqu'à mur∓aeA au lieu de
    // mur∓r (gradins sur les faces horizontales). Si le disque traverse une
    // paroi, la ligne est bornée au voisin sûr (paroi∓r) au lieu d'être
    // laissée ; sans voisin sûr elle est abandonnée — jamais de coupe sous
    // paroi. Dédup après clamp + tri (le clamp peut réordonner).
    let yc=yy;
    const c0=faoYCands(mesh,planes,z,top,yy,r,ivs);
    if(c0.length){
      // Descente corrigée (ROUGE 026) : la liste des croisements
      // restants pouvait avancer de quelques µm par palier (paroi vue
      // différente à chaque ré-échantillon x) et la garde 12 abandonnait la
      // ligne → rayé non usiné le long du mur. On prend le sens du premier
      // candidat sûr (le plus proche), on remonte la grille aeA jusqu'au
      // premier point PROPRE (aucun croisement sur son ombre), puis
      // bissection entre le dernier point sale et le premier propre : borne
      // exacte (±1e-4), convergence garantie, garde-fou inchangé (ligne
      // réellement inaccessible → abandon). Candidat purement hors brut
      // ignoré (même règle que la boucle ys) : jamais de ligne inventée
      // au-delà de la marge.
      const can=[];
      for(let ci=0;ci<c0.length;ci++){
        const t=c0[ci];
        if(t+r<=B.y0+1e-9||t-r>=B.y1-1e-9)continue;
        can.push(t);
      }
      let ok=null;
      if(can.length){
        const up=can[0]>yy;
        for(let pass=0;pass<2&&ok===null;pass++){
          const dir=pass? !up:up;
          let sale=yy, propre=null;
          for(let k=1;k<100000;k++){
            const y=dir? yy+k*aeA : yy-k*aeA;
            if(y+r<=B.y0+1e-9||y-r>=B.y1-1e-9)break;
            const iv2=faoShadowIntervals(mesh,B,y,z,top,r,aeA,planes);
            if(iv2.length&&!faoYCands(mesh,planes,z,top,y,r,iv2).length){propre=y;break;}
            sale=y;
          }
          if(propre===null)continue;
          for(let i=0;i<40&&Math.abs(propre-sale)>1e-4;i++){
            const m=(sale+propre)/2;
            const iv2=faoShadowIntervals(mesh,B,m,z,top,r,aeA,planes);
            if(iv2.length&&!faoYCands(mesh,planes,z,top,m,r,iv2).length)propre=m;
            else sale=m;
          }
          ok=propre;
        }
      }
      if(ok===null)return;
      const ivOk=faoShadowIntervals(mesh,B,ok,z,top,r,aeA,planes);
      if(!ivOk.length)return;
      ivs=ivOk;
      yc=ok;
    }
    if(seenY[yc])return;
    seenY[yy]=1; seenY[yc]=1;
    lines.push({y:yc,ivs:ivs});
  });
  lines.sort(function(p,q){return p.y-q.y;});
  if(!lines.length)return;
  const regs=faoRoughRegions(lines);
  // --- SUIVI DE CONTOUR (lot B) : les passes sont les chaines du niveau
  // offsetees a d = r + k*aeA + les cadres E-k de la boite. Le centre d'outil
  // reste donc a >= d de la MATIERE partout (aucun gouge), la marge est
  // parcourue jusqu'aux coins, les goulets (largeur < 2.5*D) prennent des
  // trochoïdes G2/G3, les morceaux sont chaines par un tour greedy
  // stay-down (liaison G1 sûre = coupe directe, sinon retrait vertical).
  const rnd=function(v){return Math.round(v*1000)/1000;};
  const isRing=!!(opt&&opt.ringOnly);
  // Fix 2 (2026-10-10-001) : limite d'op injectée EN GÉNÉRATION — toutes les
  // validations de coupe (segments, liaisons, bandes, trochoïdes, morceaux)
  // exigent en plus d'être DANS la zone : le clip final ne sert plus qu'à
  // raffiner la frontière (filet), plus à jeter 43 % du tracé.
  const zoneAt=(opt&&typeof opt.zoneAt==='function')?opt.zoneAt:null;
  const tz=(opt&&isFinite(+opt.travelZ))?Math.min(secu,+opt.travelZ):null;
  const zTopSafe=Math.max(top,isFinite(+brutTop)?+brutTop:top);
  const pathOK=function(p,q){
    if(tz&&tz>=zTopSafe-1e-9)return true;
    const dx=q.x-p.x,dy=q.y-p.y,L=Math.sqrt(dx*dx+dy*dy);
    const n=Math.max(1,Math.ceil(L));
    const rr=Math.max(0.01,r-1e-3);
    for(let i=0;i<=n;i++){
      const t=i/n;
      if(!faoDiscClear(segsAll,p.x+dx*t,p.y+dy*t,0,rr))return false;
    }
    return true;
  };
  const gotoXY=function(px,py){
    px=rnd(px); py=rnd(py);
    if(!moves.length){moves.push({r:1,x:px,y:py,z:secu});return secu;}
    const prev=moves[moves.length-1];
    const zGo=(tz&&pathOK(prev,{x:px,y:py}))?tz:secu;
    if(Math.abs(prev.z-zGo)>1e-9)moves.push({r:1,x:prev.x,y:prev.y,z:zGo});
    moves.push({r:1,x:px,y:py,z:zGo});
    return zGo;
  };
  const sortie=function(p){
    moves.push({r:1,x:p.x,y:p.y,z:tz||secu});
  };
  // Coupe G1 sûre : centre a >= r-0.005 de la matiere sur tout le trajet
  // (marge = tolerance des tests de gouge, echantillon <= 0.25 mm).
  const rrSafe=Math.max(0.01,r-0.005);
  const segClear=function(ax,ay,bx,by){
    const dx=bx-ax,dy=by-ay,L=Math.sqrt(dx*dx+dy*dy);
    const n=Math.max(1,Math.ceil(L/0.25));
    for(let i=0;i<=n;i++){
      const t=i/n;
      const qx=ax+dx*t,qy=ay+dy*t;
      if(!faoDiscClear(segsAll,qx,qy,0,rrSafe))return false;
      if(zoneAt&&!zoneAt(qx,qy))return false; // Fix 2 : jamais de coupe hors zone
    }
    return true;
  };
  // 006 : liaison de COUPE (reste sur le plan) — la matière À z sous le
  // disque est ce qu'on vient enlever (ouverture de poche, étagère déjà en
  // cours) ; seule l'OMBRE du niveau (S = ombre des plans supérieurs) compte
  // : même critère que les bandes (safeRun) — porte-à-faux / voile fin /
  // surplomb restent interdits (faoShapeValid rejette l'intérieur de S).
  const linkCutOK=function(ax,ay,bx,by){
    const dx=bx-ax,dy=by-ay,L=Math.sqrt(dx*dx+dy*dy);
    const n=Math.max(1,Math.ceil(L/0.25));
    for(let i=0;i<=n;i++){
      const t=i/n;
      const qx=ax+dx*t,qy=ay+dy*t;
      if(!faoShapeValid(S,qx,qy,rrSafe))return false;
      if(zoneAt&&!zoneAt(qx,qy))return false; // Fix 2 : jamais de coupe hors zone
    }
    return true;
  };
  // Liaison vers un morceau : translation en l'air (l'appelant plonge ensuite,
  // disque contrôlé par l'appelant) — SAUF liaison courte (< faoRapideMin) et
  // sûre : G1 à la cote, aucun lever (renvoie false, l'appelant émet le G1).
  // 10-09-002 : on ne saute en rapide que si le trajet vaut le coup (>= 30 mm).
  const linkTo=function(px,py){
    const prev=moves.length?moves[moves.length-1]:null;
    const dx=px-(prev?prev.x:0), dy=py-(prev?prev.y:0);
    if(prev&&!prev.r&&Math.abs(prev.z-z)<1e-9&&
       dx*dx+dy*dy<linkMax*linkMax&&
       segClear(prev.x,prev.y,px,py))return false;
    gotoXY(px,py);
    return true;
  };
  const pushCut=function(x,y){
    const nx=rnd(x),ny=rnd(y),prev=moves[moves.length-1];
    if(prev&&!prev.r&&Math.abs(prev.x-nx)<1e-9&&Math.abs(prev.y-ny)<1e-9)return;
    moves.push({r:0,x:nx,y:ny,z:z});
  };
  // --- passes : chaines offsetees + cadres imbriques (E0/E-k)
  const S=faoShadowShape(mesh,planes,B,r,aeA);
  // 008 : bbox 2D de la pièce — ancre d'arc hors silhouette = pas de hélice
  // (les chaînes du cadre E0 en marge entreraient par un ressort dans l'air).
  const mBB=[1/0,1/0,-1/0,-1/0];
  for(let vi=0;vi<mesh.v.length;vi++){const vv=mesh.v[vi];
    if(vv[0]<mBB[0])mBB[0]=vv[0]; if(vv[1]<mBB[1])mBB[1]=vv[1];
    if(vv[0]>mBB[2])mBB[2]=vv[0]; if(vv[1]>mBB[3])mBB[3]=vv[1];}
  const insideSil=function(x,y){return x>=mBB[0]-1e-9&&x<=mBB[2]+1e-9&&y>=mBB[1]-1e-9&&y<=mBB[3]+1e-9;};
  const chunks=[];
  // Chaque morceau porte son k de priorité : 0 = bords (mur, marge, cadre
  // E0, goulet), croissant = vers l'intérieur de la zone. Le tour épuise le
  // k plus grand d'abord (retour 3) : du MILIEU vers les BORDS.
  // Chaîne offsetée vers l'EXTÉRIEUR (bande de marge, tour de boîte) : son k
  // croissant s'éloigne de la matière — k inversé en 0, elle finit la passe.
  let outerCh=null;
  S.chains.forEach(function(ch){
    const A=(ch.bb[2]-ch.bb[0])*(ch.bb[3]-ch.bb[1]);
    const B2=outerCh?(outerCh.bb[2]-outerCh.bb[0])*(outerCh.bb[3]-outerCh.bb[1]):-1;
    if(A>B2)outerCh=ch;
  });
  const kTag=function(chunk,k){
    if(k>0&&outerCh){
      const p=chunk.pts&&chunk.pts[0];
      if(p&&!faoPointInPoly(p[0],p[1],outerCh.pts))return 0;
    }
    return k;
  };
  for(let k=0;k<200;k++){
    const inset=k*aeA, d=r+k*aeA;
    let any=false;
    // 006 : chaînes offsetées k=0..2 = SUIVI DES FACES (mur + 2 anneaux de
    // délestage radial) ; au-delà le MILIEU est ouvert en bandes PARALLELES
    // (voir plus bas) — pas d'anneaux concentriques lointains.
    if(k<=2){
      const ro=faoOffsetRuns(S,d);
      for(let i=0;i<ro.length;i++)if(ro[i].pts&&ro[i].pts.length>=2){ro[i].k=kTag(ro[i],k);chunks.push(ro[i]);any=true;}
    }
    // Cadres E-k : E0 (tour de boîte) toujours ; E-k>=1 = affrontement de la
    // MARGE (cadres imbriqués, jamais dans la matière — la validité d= r+k*aeA
    // les tue au contact de l'ombre) — UNIQUEMENT s'il reste de la matière
    // (niveau vide : les bandes pleine largeur couvrent tout, pas de double
    // passe). Arrêt dès qu'un palier ne produit plus rien.
    const fr=(k===0||S.chains.length)?faoRectRuns(S,inset,d):[];
    for(let i=0;i<fr.length;i++)if(fr[i].pts&&fr[i].pts.length>=2){fr[i].k=kTag(fr[i],k);chunks.push(fr[i]);any=true;}
    if(isRing)break; // mini-passes/finition : k=0 seulement (comme avant)
    if(k>0&&!any)break;
  }
  // --- goulets : trochoïdes G2/G3 par region etroite (un morceau par region,
  // jamais reverse : les arcs G2/G3 sont orientes).
  // Controle 2D (retour 6/10) : faoShadowIntervals ne garantit que la LIGNE
  // de la region, pas l'excursion ±Rt du trochoide — chaque point emis (arcs
  // echantillonnes a 0,25 mm + liaisons) doit rester a >= rrSafe. Goulet non
  // valide : chute sur des sous-lignes valides point par point (ni abandon,
  // ni gouge).
  const mvSafe=function(list){
    let px=null,py=null;
    for(let k=0;k<list.length;k++){
      const m=list[k];
      if(!faoShapeValid(S,m.x,m.y,rrSafe))return false;
      if(zoneAt&&!zoneAt(m.x,m.y))return false;
      if(px!==null){
        if(m.arc){
          const cx=px+m.arc.i,cy=py+m.arc.j,Rr=Math.hypot(m.arc.i,m.arc.j);
          if(Rr>1e-9){
            const a0=Math.atan2(py-cy,px-cx),a1=Math.atan2(m.y-cy,m.x-cx);
            let da=a1-a0;
            if(m.arc.cw){ if(da>0)da-=2*Math.PI; }else if(da<0)da+=2*Math.PI;
            const n=Math.max(4,Math.ceil(Math.abs(da)*Rr/0.25));
            for(let s=1;s<n;s++){
              const a=a0+da*s/n;
              if(!faoShapeValid(S,cx+Rr*Math.cos(a),cy+Rr*Math.sin(a),rrSafe))return false;
              if(zoneAt&&!zoneAt(cx+Rr*Math.cos(a),cy+Rr*Math.sin(a)))return false;
            }
          }
        }else{
          const dx=m.x-px,dy=m.y-py,L=Math.hypot(dx,dy);
          const n=Math.max(1,Math.ceil(L/0.25));
          for(let s=1;s<n;s++){
            if(!faoShapeValid(S,px+dx*s/n,py+dy*s/n,rrSafe))return false;
            if(zoneAt&&!zoneAt(px+dx*s/n,py+dy*s/n))return false;
          }
        }
      }
      px=m.x;py=m.y;
    }
    return true;
  };
  const safeRun=function(xa,xb,y){
    const out=[];let cur=null;
    const n=Math.max(1,Math.ceil((xb-xa)/0.25));
    for(let i=0;i<=n;i++){
      const x=xa+(xb-xa)*i/n;
      if(faoShapeValid(S,x,y,rrSafe)&&(!zoneAt||zoneAt(x,y))){
        if(!cur)cur=[];
        cur.push({r:0,x:rnd(x),y:rnd(y),z:z});
      }else if(cur){ if(cur.length>=2)out.push({mv:cur}); cur=null; }
    }
    if(cur&&cur.length>=2)out.push({mv:cur});
    return out;
  };
  // --- BANDES PARALLÈLES (006) : le milieu du niveau s'ouvre en lignes
  // droites depuis le centre jusqu'aux faces (« des lignes bien droites
  // depuis le centre jusqu'au moment où tu rejoins les faces, et là tu
  // commences à les suivre »). Une seule entrée (circ/hélice) a ouvert la
  // zone : les bandes se chaînent ensuite en G1 À LA CÔTE (liaison de
  // coupe — linkIn 006 : « pas la peine de sortir et de re-rentrer »).
  // Les régions étroites (goulets) restent aux trochoïdes (bloc suivant).
  if(!isRing){
    const trochIVs=new Set();
    regs.forEach(function(R){
      let ml=0;
      R.forEach(function(q){ ml=Math.max(ml,q.iv.b-q.iv.a); });
      if(ml<2.5*D&&R.length>=2)R.forEach(function(q){ trochIVs.add(q.iv); });
    });
    for(let li=0;li<lines.length;li++){
      const L=lines[li];
      for(let ii=0;ii<L.ivs.length;ii++){
        const iv=L.ivs[ii];
        if(trochIVs.has(iv))continue;
        const runs=safeRun(iv.a,iv.b,L.y);
        if(!runs.length)continue;
        // Serpentin (2026-10-10-001, Fix 1) : lignes impaires inversées ET
        // poussées en ORDRE INVERSE — la création suit le vrai enjambement
        // (ligne paire G->D, ligne impaire D->G, runs dans le sens du
        // balayage). Le tour consomme ensuite les bandes dans cet ordre de
        // CRÉATION au lieu du greedy « plus proche » (voir plus bas).
        if(li%2===1){
          for(let rj=runs.length-1;rj>=0;rj--){
            runs[rj].mv.reverse();
            runs[rj].k=1000; // priorité MAX : bandes avant tout le reste
            runs[rj].band=1; // marqueur de séquence (tour ordonné)
            chunks.push(runs[rj]);
          }
        }else{
          for(let rj=0;rj<runs.length;rj++){
            runs[rj].k=1000;
            runs[rj].band=1;
            chunks.push(runs[rj]);
          }
        }
      }
    }
  }
  if(!isRing){
    regs.forEach(function(R){
      let ml=0;
      R.forEach(function(q){ ml=Math.max(ml,q.iv.b-q.iv.a); });
      if(!(ml<2.5*D&&R.length>=2))return;
      let yLo=1/0,yHi=-1/0;
      R.forEach(function(q){ if(q.y<yLo)yLo=q.y; if(q.y>yHi)yHi=q.y; });
      const mv=[];
      R.forEach(function(q){ faoTrochSlot(mv,q.iv.a,q.iv.b,q.y,z,D,aeA,yLo,yHi); });
      if(mv.length>=2&&mvSafe(mv)){ chunks.push({mv:mv,k:0}); return; }
      R.forEach(function(q){
        const rs=safeRun(q.iv.a,q.iv.b,q.y);
        for(let i=0;i<rs.length;i++){rs[i].k=0;chunks.push(rs[i]);}
      });
    });
  }
  // Fix 2 (2026-10-10-001) : les morceaux (chaines offsetees + cadres) sont
  // decoupes des la creation a la FRONTIERE de zone : la piece reelle
  // generait 142 459 points dont 43 % etaient jetes ensuite par
  // faoClipMovesPoly (61 276 moves + 9,2 s de clipPoly + 5,9 s de zoneCuts).
  // `any` de la boucle k a ete calcule AVANT ce filtre (semantique d'arret
  // identique) ; les rapides (travels) ne sont pas concernes (franchissement
  // libre de la zone) ; les bandes deja filtrees par safeRun ne bougent pas.
  if(zoneAt){
    const zs=[];
    for(let ci=0;ci<chunks.length;ci++){
      const chZ=chunks[ci];
      const P=chZ.pts;
      if(!P||!P.length){zs.push(chZ);continue;} // morceaux mv (trochoïdes) : pas de pts
      let run=null, split=false;
      for(let pi=0;pi<P.length;pi++){
        if(zoneAt(P[pi][0],P[pi][1])){
          if(!run)run=[];
          run.push(P[pi]);
        }else{
          split=true;
          if(run&&run.length>=2)zs.push({pts:run,closed:false,bb:faoPtsBB(run),k:chZ.k});
          run=null;
        }
      }
      if(!split){zs.push(chZ);continue;} // tout dedans : morceau d'origine (closed conserve)
      if(run&&run.length>=2)zs.push({pts:run,closed:false,bb:faoPtsBB(run),k:chZ.k});
    }
    chunks.length=0;
    for(let ci=0;ci<zs.length;ci++)chunks.push(zs[ci]);
  }
  if(!chunks.length)return;
  // --- entree (UNE par niveau) : meme contrat qu'avant (tangente / helice
  // multi-spots / rampe X ou Y / micro-helice / plongee sûre).
  const flat=[];
  lines.forEach(function(L){ L.ivs.forEach(function(iv){ flat.push({y:L.y,iv:iv}); }); });
  if(!flat.length)return;
  let hasTroch=false;
  regs.forEach(function(R){
    let ml=0;
    R.forEach(function(q){ ml=Math.max(ml,q.iv.b-q.iv.a); });
    if(ml<2.5*D&&R.length>=2)hasTroch=true;
  });
  let E=flat[0];
  for(let i=1;i<flat.length;i++)if(flat[i].iv.b-flat[i].iv.a>E.iv.b-E.iv.a)E=flat[i];
  const elen=E.iv.b-E.iv.a;
  let ixA=1/0, ixB=-1/0;
  flat.forEach(function(f){ ixA=Math.min(ixA,f.iv.a); ixB=Math.max(ixB,f.iv.b); });
  const yRun=(ixB-ixA>0.2)?(flat[flat.length-1].y-flat[0].y):0;
  let cx0=0, cy0=0;
  lines.forEach(function(L){ cx0+=(L.ivs[0].a+L.ivs[0].b)/2; cy0+=L.y; });
  cx0/=lines.length; cy0/=lines.length;
  let tang=null;
  if(isRing&&lines.length>=2){
    const a0=lines[0].ivs[0].a, b0=lines[0].ivs[0].b;
    const p0x=(a0+b0)/2, p0y=lines[0].y;
    const LN=Math.min(2*D,(b0-a0)/2-1);
    if(LN>=1){
      const sx=p0x+LN, sy=p0y;
      if(faoDiscClear(segsAll,sx,sy,0,r)&&
         faoDiscClear(segsAll,(sx+p0x)/2,sy,0,r)&&
         (!zoneAt||zoneAt(sx,sy))&&(!zoneAt||zoneAt(p0x,p0y))) // Fix 2
        tang={sx:sx,sy:sy,px:p0x,py:p0y};
    }
  }
  const byW=flat.slice().sort(function(a,b){
    return (b.iv.b-b.iv.a)-(a.iv.b-a.iv.a); });
  const forced=(entryMode||'auto')==='helix'?'helix':(entryMode||'auto')==='ramp'?'ramp':'auto';
  const fmode=forced!=='auto'?forced:(hasTroch?'helix':'auto');
  let hx=null, hr=0, hStart=zFrom, hy=0;
  // Face d'ENTREE de la passe = z+ap (zFrom = zt pour la 1re passe) : le
  // depart d'helice ne descend jamais sous cette face + 2 mm. Sans ce
  // plancher faoHelixSpot retombe sur z+2 (face obtenue + 2) : ap=5 ->
  // spirale attaquant 3 mm DANS la matiere (document reel : 47 face a 50).
  const hFloor=Math.min(secu,zFrom+2);
  if(!tang&&fmode!=='ramp'){
    const cands=[];
    if(!isRing){
      // Zone intérieure (murs des DEUX côtés, wl&&wr) la plus large, au
      // milieu en Y (retour 1) : la bande de marge (aucun mur) est toujours
      // la plus large en largeur absolue et capte l'entrée — on veut entrer
      // au centre de la ZONE à usiner, d'où part le premier (et plus grand)
      // k, puis on descend vers les bords (retour 3).
      let bIf=null,bw=-1,yS=0,nI=0;
      flat.forEach(function(f){
        if(!(f.iv.wl&&f.iv.wr))return;
        yS+=f.y;nI++;
        const w=f.iv.b-f.iv.a;
        if(w>bw){bw=w;bIf=f;}
      });
      if(bIf){
        const cyI=yS/nI;
        let bJ=bIf,by=Math.abs(bIf.y-cyI);
        flat.forEach(function(f){
          if(!(f.iv.wl&&f.iv.wr))return;
          if(Math.abs((f.iv.b-f.iv.a)-bw)>1e-9)return;
          const dy=Math.abs(f.y-cyI);
          if(dy<by){by=dy;bJ=f;}
        });
        cands.push({x:(bJ.iv.a+bJ.iv.b)/2,y:bJ.y,elen:bw});
      }
      // centre de la boîte de validation : niveau sans aucune zone à deux
      // murs (surfaçage pleine plaque) — rejeté par la parité si matière.
      cands.push({x:(B.x0+B.x1)/2,y:(B.y0+B.y1)/2,elen:0});
    }
    byW.slice(0,3).forEach(function(f){
      cands.push({x:(f.iv.a+f.iv.b)/2,y:f.y,elen:f.iv.b-f.iv.a});
    });
    cands.push({x:cx0,y:cy0,elen:0});
    let fbHx=null; // 006 : meilleur spot « qui mord » (aucun disque balayé)
    for(let ci=0;ci<cands.length&&!hx;ci++){
      const c=cands[ci];
      const hrr=c.elen>0?Math.max(1,Math.min(D*0.4,c.elen/2-1)):Math.max(0.5,D*0.2);
      if(!(c.elen>0?c.elen>=2*D:true))continue;
      if(fmode==='auto'&&!(c.elen>=2*D))continue;
      if(zoneAt&&!zoneAt(c.x,c.y))continue; // Fix 2 : ancre hélice hors zone
      // 2026-10-14-004 : centre DANS la matière (îlot plus large que le
      // disque de l'hélice : aucun mur ne le coupe, faoDiscClear le croyait
      // libre) -> l'hélice forait l'îlot. Parité de l'ombre d'abord.
      if(faoShapeInside(S,c.x,c.y))continue;
      // jeu 2 mm si possible, sinon ancien comportement (jeu 0) : surtout ne
      // pas rejeter l'helice serree au profit de la micro-helice de secours.
      const disq=(!faoDiscClear(segsAll,c.x,c.y,hrr,r+faoHelixJeu)&&
                  !faoDiscClear(segsAll,c.x,c.y,hrr,r));
      if(disq){
        // 006 : AUCUNE tache dégagée sur ce candidat — la 1ʳᵉ hélice du
        // niveau a le droit de MORDRE (« Oui, hélice autorisée à mordre ») :
        // on le garde en repli plutôt que de tomber sur la rampe. Le
        // candidat est le MEILLEUR spot (zone intérieure la plus large en
        // premier) — il ouvre la poche d'où partiront les bandes parallèles.
        // Garde ombre : JAMAIS sous un porte-à-faux/voile (centre + orbite
        // hors de S, comme les bandes) — la matière mordue est la matière
        // restante EXPOSÉE depuis le dessus.
        let okS=faoShapeValid(S,c.x,c.y,rrSafe)&&(!zoneAt||zoneAt(c.x,c.y));
        if(okS)for(let a2=0;a2<8;a2++){
          const t2=a2/8*2*Math.PI;
          if(!faoShapeValid(S,c.x+hrr*Math.cos(t2),c.y+hrr*Math.sin(t2),rrSafe)){okS=false;break;}
        }
        if(okS&&!fbHx)fbHx={x:c.x,y:c.y,hrr:hrr};
        continue;
      }
      hx=c.x; hy=c.y; hr=hrr;
      // spot = 2 mm au-dessus de la matiere RESTANTE : jamais sous hFloor
      // (face d'entree de la passe + 2 mm), sinon la spirale attaque dedans.
      hStart=Math.max(faoHelixSpot(mesh,c.x,c.y,hrr,r,z,brutTop,planes),hFloor);
    }
    if(!hx&&fbHx){
      hx=fbHx.x; hy=fbHx.y; hr=fbHx.hrr;
      hStart=Math.max(faoHelixSpot(mesh,hx,hy,hr,r,z,brutTop,planes),hFloor);
    }
  }
  let ramp=null;
  if(!tang&&(fmode!=='helix'||hasTroch)&&!hx){
    if(elen>=yRun&&elen>0.2)ramp={x0:E.iv.a,y0:E.y,x1:E.iv.a+Math.min(elen,2*D),y1:E.y};
    else if(yRun>0.2){
      const xm=(ixA+ixB)/2;
      const rp={x0:xm,y0:flat[0].y,x1:xm,y1:flat[0].y+Math.min(yRun,2*D)};
      // Rampe verticale : validee sur tout le segment (le milieu de la boite
      // peut tomber dans la matiere sur cette ligne), sinon repli horizontal.
      if(segClear(rp.x0,rp.y0,rp.x1,rp.y1))ramp=rp;
      else if(elen>0.2)ramp={x0:E.iv.a,y0:E.y,x1:E.iv.a+Math.min(elen,2*D),y1:E.y};
    }
  }
  // --- tour des morceaux : greedy (le plus proche dont la liaison est sûre)
  const segDist=function(ax,ay,bx,by,px,py){
    const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;
    let t=L2>0?((px-ax)*dx+(py-ay)*dy)/L2:0;
    if(t<0)t=0;else if(t>1)t=1;
    const qx=px-(ax+t*dx),qy=py-(ay+t*dy);
    return Math.sqrt(qx*qx+qy*qy);
  };
  const polyDist=function(ch,px,py){
    let d=1/0;
    if(ch.mv){
      for(let i=0;i+1<ch.mv.length;i++){
        const a=ch.mv[i],b=ch.mv[i+1];
        const dd=segDist(a.x,a.y,b.x,b.y,px,py);
        if(dd<d)d=dd;
      }
      return d;
    }
    const P=ch.pts,n=P.length,segsN=ch.closed?n:n-1;
    for(let i=0;i<segsN;i++){
      const a=P[i],b=P[(i+1)%n];
      const dd=segDist(a[0],a[1],b[0],b[1],px,py);
      if(dd<d)d=dd;
    }
    return d;
  };
  // Point d'entree : vertex le plus proche (ferme), extremite la plus
  // proche (ouvert, reversible), toujours en avant (morceau trochoïdal).
  // 2026-10-08-003 — sens 'avalant' : AUCUN retournement de chaine ouverte —
  // la passe suit toujours le meme sens d'avance (sens de coupe constant,
  // les dents attaquent la matiere de la meme facon quels que soient le
  // morceau et son voisin). Les anneaux fermes ne sont que ROTATIONNES
  // (depart au plus proche, orientation de coupe inchangee). Absent/'bidir' :
  // retournement vers l'extremite la plus proche, strictement l'ancien code.
  const avalant=!!(opt&&opt.sens==='avalant');
  const ordered=function(ch,px,py){
    if(ch.mv)return ch.mv;
    const P=ch.pts;
    if(ch.closed){
      let bi=0,bd=1/0;
      for(let i=0;i<P.length;i++){
        const dx=P[i][0]-px,dy=P[i][1]-py,dd=dx*dx+dy*dy;
        if(dd<bd){bd=dd;bi=i;}
      }
      return P.slice(bi).concat(P.slice(0,bi));
    }
    if(avalant)return P; // sens unique : on garde l'ordre naturel de la chaine
    const f=P[0],l=P[P.length-1];
    const df=(f[0]-px)*(f[0]-px)+(f[1]-py)*(f[1]-py);
    const dl=(l[0]-px)*(l[0]-px)+(l[1]-py)*(l[1]-py);
    if(dl<df){
      const rev=new Array(P.length);
      for(let i=0;i<P.length;i++)rev[i]=P[P.length-1-i];
      return rev;
    }
    return P;
  };
  // 006 : l'entrée du niveau est émise — les liaisons suivantes restent sur
  // le plan (coupe latérale) au lieu de sortir et de re-rentrer en hélice.
  let entered=false;
  const emitChunk=function(ch,px,py){
    // Liaison d'entrée (10-09-002) : liaison courte (< faoRapideMin) sûre =
    // G1 à la cote (aucun lever) ; sinon ARC CONCAVE sûr en priorité
    // (arcEnter — vers l'intérieur, chaque point validé à rrSafe), sinon
    // SEGMENT DROIT vers le milieu M du 1er segment (midEnter), sinon rapide
    // + plongée plate si le disque est déjà balayé/en air réel (hors brut),
    // 007 : sinon RAMPE LE LONG DU MORCEAU (la fraise descend en coupant,
    // jamais à plat sur du brut restant). Renvoie l'index du 1er point du
    // morceau restant à émettre.
    const linkIn=function(seq,ax,ay,ux,uy){
      const prev=moves[moves.length-1];
      if(prev&&!prev.r&&Math.abs(prev.x-ax)<1e-9&&Math.abs(prev.y-ay)<1e-9)return 1; // déjà sur place
      // 10-09-002 : liaison courte (< faoRapideMin) et sûre = G1 à la cote
      // (pas de lever pour un rayon à l'autre) ; au-delà : LIAISON DROITE +
      // plongée/vide sûre vers M (midEnter), sinon plongée plate, sinon ramp.
      if(prev&&!prev.r&&Math.abs(prev.z-z)<1e-9&&
         (ax-prev.x)*(ax-prev.x)+(ay-prev.y)*(ay-prev.y)<linkMax*linkMax&&
         segClear(prev.x,prev.y,ax,ay)){ pushCut(ax,ay); return 1; }
      // 006 : après l'entrée du niveau, TOUT reste sur le plan — la liaison
      // EST de la coupe (ouverture de poche de l'intérieur vers l'extérieur :
      // « pas la peine de sortir et de re-rentrer en hélice »). Test :
      // chemin hors de l'OMBRE du niveau (porte-à-faux/voile/surplomb =
      // interdit, même critère que les bandes) — la matière à z sous le
      // disque est le travail. Repli sur l'ancien cascade sinon.
      if(!isRing&&entered&&prev&&Math.abs(prev.z-z)<1e-9&&linkNear(prev.x,prev.y,ax,ay)){
        if(linkCutOK(prev.x,prev.y,ax,ay)){ pushCut(ax,ay); return 1; }
        // 006 : chemin en L (un coude) quand le direct coupe un coin d'ombre
        // — les bandes serpentin passent souvent par le coude.
        if(linkCutOK(prev.x,prev.y,ax,prev.y)&&linkCutOK(ax,prev.y,ax,ay)){
          pushCut(ax,prev.y); pushCut(ax,ay); return 1;
        }
        if(linkCutOK(prev.x,prev.y,prev.x,ay)&&linkCutOK(prev.x,ay,ax,ay)){
          pushCut(prev.x,ay); pushCut(ax,ay); return 1;
        }
      }
      // 2026-10-10-001 : ARC CONCAVE SÛR D'ABORD (retour « je ne vois aucune
      // entrée en cercles tangents ») — le cercle tangent sûr (arcEnter) est
      // essayé avant la ligne droite ; si l'arc est impossible (ancre/points
      // trop près de la matière ou hors zone), midEnter prend le relais.
      if(arcEnter(seq,ch,ax,ay))return 1;
      if(midEnter(seq,ch,ax,ay))return 1;
      if(faoPlungeClear(ax,ay,moves,z,D,airCv)){ gotoXY(ax,ay); moves.push({r:0,ent:1,x:rnd(ax),y:rnd(ay),z:z}); return 1; }
      // 007 : RAMPE le long du morceau — descente répartie (~2 mm par point,
      // bornée aux points disponibles) ; les morceaux ch.mv gardent leurs arcs
      // (interpolation hélicoïdale G2/G3 en descente = légal).
      gotoXY(ax,ay);
      // 10-09-002 : ancre HORS la boîte brute ET disque entièrement dégagé
      // (balayé, hors boîte ou hors silhouette — la matière ne peut pas
      // exister hors silhouette) : descente plate directe. Une ramp
      // remonterait au-dessus du brut après l'engagement (hélice fente) ;
      // un disque qui mord encore la matière reste interdit (007).
      if(airCv(ax,ay)&&faoPlungeClear(ax,ay,moves,z,D,
         function(sx2,sy2){return airCv(sx2,sy2)||!insideSil(sx2,sy2);})){
        moves.push({r:0,ent:1,x:rnd(ax),y:rnd(ay),z:z}); return 1;
      }
      // 10-09-003 : mini-passes — JAMAIS de rampe : dernier repli = position
      // dans le vide (Q clair à portée de l'ancre) puis liaison à cote z.
      // L'entrée n'a pas d'arc (géométrie refusée plus haut), mais elle se
      // fait entièrement en matière déjà enlevée — aucune descente en brut.
      if(isRing){
        const Qv=voidWayC(ax,ay);
        if(Qv){ arriveVoidC(Qv.x,Qv.y); pushCut(ax,ay); return 1; }
      }
      const hS=Math.max(faoHelixSpot(mesh,ax,ay,0,r,z,brutTop,planes),hFloor);
      if(Math.abs(hS-z)>1e-9)moves.push({r:0,ent:1,x:rnd(ax),y:rnd(ay),z:hS});
      const nUse=Math.max(1,Math.min(seq.length-1,Math.ceil((hS-z)/2)));
      const dz=(hS-z)/nUse;
      for(let i=1;i<=nUse;i++){
        const q=seq[i];
        const m={r:0,ent:1,x:rnd(ch.mv?q.x:q[0]),y:rnd(ch.mv?q.y:q[1]),
                 z:Math.round((hS-dz*i)*1000)/1000};
        if(ch.mv&&q.arc)m.arc=q.arc;
        moves.push(m);
      }
      return nUse+1;
    };
    if(ch.mv){
      const seq=ch.mv;
      let ux=0,uy=0;
      if(seq.length>1){ux=seq[1].x-seq[0].x;uy=seq[1].y-seq[0].y;}
      const i0=linkIn(seq,seq[0].x,seq[0].y,ux,uy);
      for(let i=i0;i<seq.length;i++){
        const q=seq[i],prev=moves[moves.length-1];
        if(!q.arc&&!prev.r&&Math.abs(prev.x-q.x)<1e-9&&Math.abs(prev.y-q.y)<1e-9&&Math.abs(prev.z-q.z)<1e-9)continue;
        moves.push(q);
      }
      return;
    }
    const seq=ordered(ch,px,py);
    let ux=0,uy=0;
    if(seq.length>1){ux=seq[1][0]-seq[0][0];uy=seq[1][1]-seq[0][1];}
    const i0=linkIn(seq,seq[0][0],seq[0][1],ux,uy);
    for(let i=i0;i<seq.length;i++)pushCut(seq[i][0],seq[i][1]);
    if(ch.closed)pushCut(seq[0][0],seq[0][1]);
  };
  // --- tour des morceaux (retour 3/3) : du MILIEU vers les BORDS.
  // Hors mini-passes : on épuise d'abord le k le plus grand (intérieur de la
  // zone), puis on descend jusqu'au k=0 (murs, cadre E0, goulets) — la der-
  // nière passe suit les faces. Au sein d'un même k : distance croissante,
  // liaison sûre d'abord (repli = le plus proche du groupe). Mini-passes
  // (ringOnly, un seul k) : greedy historique strictement inchangé.
  // 2026-10-10-002 (demande 2) : les BANDES (k=1000) sont consommées UN CÔTÉ
  // À LA FOIS — on finit d'abord le côté +Y (du CENTRE vers le bord), PUIS on
  // revient et on finit le côté −Y (du centre vers l'autre bord). L'ordre
  // alterné (cB, cB+1, cB−1, …) faisait traverser le centre à chaque bande ;
  // on garde le serpentin (transitions courtes intra-côté) et le démarrage au
  // centre, on ne change que l'ordre des côtés : une seule longue transition
  // (du bord atteint au 1er band de l'autre côté), les deux sweeps restent
  // monotones. Si le lien vers la suivante n'est pas sûr (segClear/coude
  // 006), repli greedy sur le groupe puis la suite reprend au prochain tour.
  // Les morceaux non-bandes (k<1000) et les mini-passes gardent le greedy.
  const remaining=chunks.slice();
  let bandOrder=null, bandIdx=0;
  const safePick=function(list,px,py){
    const order=[];
    for(let i=0;i<list.length;i++)order.push({i:i,d:polyDist(list[i],px,py)});
    order.sort(function(a,b){return a.d-b.d;});
    for(let t=0;t<order.length;t++){
      const ch=list[order[t].i];
      const seq=ordered(ch,px,py);
      const qx=ch.mv?seq[0].x:seq[0][0], qy=ch.mv?seq[0].y:seq[0][1];
      if(segClear(px,py,qx,qy))return order[t].i;
    }
    return order.length?order[0].i:-1;
  };
  // 2026-10-10-001 (007b) : ARCCONCAVE DE REPLI(« cerclesconcaves, vers
  // l'intérieur de la pièce ») — le SEGMENT DROIT (midEnter) resteprioritaire ;
  // quand il est impossible,on réintroduit l'arctangentmais avec la règle de
  // sûreté :CHAQUE point de l'arc (le centre outilsuit l'arc) doit resterà
  // >= rrSafe del'ombre (validXY = S + rrSafe + limite d'op) — l'arc « tourne
  // versl'intérieur » car tout arc sortant de lapièce/de la zone est rejeté
  // par validXY. L'ancien passe-droit insideSil (bbox) des mini-passesétait
  // la cause du gouge 4,7 mm : il disparaît.
  const arcEnter=function(seq,ch,ax,ay){
    if(!seq||seq.length<2)return false;
    const g=function(i){return ch.mv?[seq[i].x,seq[i].y]:[seq[i][0],seq[i][1]];};
    const Q=g(1);
    const ux=Q[0]-ax, uy=Q[1]-ay;
    if(!(ux*ux+uy*uy>1e-12))return false;
    const emitArc=function(s){
      moves.push({r:0,ent:1,x:rnd(ax),y:rnd(ay),z:z,
        arc:{i:s.cx-s.sx,j:s.cy-s.sy,cw:s.cw}});
    };
    for(let ri=0;ri<rhoCirc.length;ri++){
      const sides=faoSidesCirc(ax,ay,ux,uy,rhoCirc[ri]);
      if(!sides)continue;
      for(let i=0;i<sides.length;i++){
        const s=sides[i];
        // Ancre de tangence : centre outil à >= rrSafe de l'ombre + dans la
        // limite (validXY) — jamais insideSil.
        if(!validXY(s.sx,s.sy))continue;
        const pts2=faoCircArcPts(s,ax,ay);
        if(!pts2)continue;
        let okA=true;
        for(let k=0;k<pts2.length;k++)if(!validXY(pts2[k][0],pts2[k][1])){okA=false;break;}
        if(!okA)continue;
        const prev=moves.length?moves[moves.length-1]:null;
        const atZ=!!(prev&&!prev.r&&Math.abs(prev.z-z)<1e-9);
        // (1) déjà à la cote : accostage de coupe jusqu'à l'ancre de l'arc.
        if(atZ&&linkNear(prev.x,prev.y,s.sx,s.sy)&&segClear(prev.x,prev.y,s.sx,s.sy)){ pushCut(s.sx,s.sy); emitArc(s); return true; }
        // (2) plongée sûre sur l'ancre (007) puis arc — la descente n'est
        // admise que si le disque est déjà dégagé/en air.
        if(faoPlungeClear(s.sx,s.sy,moves,z,D,airCv)){
          const zG=gotoXY(s.sx,s.sy);
          if(Math.abs(zG-z)>1e-9)moves.push({r:0,ent:1,x:rnd(s.sx),y:rnd(s.sy),z:z});
          emitArc(s);
          return true;
        }
        // (3) mini-passes : VIDE D'ABORD (intérieur usiné par le plan
        // profond) — plongée plate sur Q, accostage de l'ancre, puis arc.
        if(isRing){
          const Qs=voidWayC(s.sx,s.sy);
          if(Qs){ arriveVoidC(Qs.x,Qs.y); pushCut(s.sx,s.sy); emitArc(s); return true; }
        }
        // (4) hélice à orbite légale sur l'ancre (008) puis le MÊME arc.
        let hrH=0;
        const hc=[D*0.4,D*0.2,1,0.5];
        for(let hi=0;hi<hc.length;hi++){
          if(hc[hi]>=0.5&&(faoDiscClear(segsAll,s.sx,s.sy,hc[hi],r+faoHelixJeu)||
             faoDiscClear(segsAll,s.sx,s.sy,hc[hi],r))){hrH=hc[hi];break;}
        }
        if(!(hrH>0)){
          hrH=Math.max(1,D*0.2);
          const okS=function(h){
            for(let k=0;k<8;k++){const a=k/8*2*Math.PI;if(!validXY(s.sx+h*Math.cos(a),s.sy+h*Math.sin(a)))return false;}
            return true;
          };
          while(hrH>0.5&&!okS(hrH))hrH-=0.5;
          if(!(hrH>0.5&&okS(hrH)))continue;
        }
        const zG2=gotoXY(s.sx,s.sy);
        const hS=Math.max(faoHelixSpot(mesh,s.sx,s.sy,hrH,r,z,brutTop,planes),hFloor);
        if(Math.abs(zG2-hS)>1e-9)moves.push({r:0,ent:1,x:rnd(s.sx),y:rnd(s.sy),z:hS});
        faoHelixEntry(s.sx,s.sy,hS,z,hrH,D).slice(1).forEach(function(m){moves.push(m);});
        pushCut(s.sx,s.sy);
        emitArc(s);
        return true;
      }
    }
    return false;
  };
  // --- ENTRÉE DU NIVEAU (UNE) : émission ici, après les helpers — le tour
  // fournit la cible ; priorité au SEGMENT DROIT (midEnter), repli ARC
  // CONCAVE sûr (arcEnter, 2026-10-10-001).
  const rhoCirc=faoCircRhos(D,ae,opt.entryR);
  // 2026-10-08-007 : air = hors du BRUT (la boîte de stock), plus « hors de la
  // pièce » — l'extérieur d'un bossage et le vide de poche sont du brut à
  // enlever, pas de l'air (ancres/plongées acceptées au cœur du brut non
  // usiné = « fraise à cheval » après les passes).
  const airCv=function(x,y){
    return x<B.x0-1e-9||x>B.x1+1e-9||y<B.y0-1e-9||y>B.y1+1e-9;
  };
  const validXY=function(x,y){ return faoShapeValid(S,x,y,rrSafe)&&(!zoneAt||zoneAt(x,y)); };
  // 10-09-003 : VIDE D'ABORD (mini-passes — copie conforme du 011 spirale,
  // sans garde sweptNow : en mini-passes la 1re attaque du plan est FRANCHE,
  // le vide vient du plan plus profond z' <= z). Avant toute plongée/hélice/
  // rampe en matière, on cherche un point Q à portée de la cible où le
  // disque D/2 est ENTIÈREMENT balayé (ou en air) ; on y PLONGE À PLAT
  // (faoPlungeClear = test 007), on accoste la cible à cote z (liaison
  // latérale à travers le déjà-usiné), l'arc tangent vient depuis le vide.
  const voidWayC=function(tx,ty){
    const step=Math.max(2,D*0.12),Rmax=Math.min(45,Math.max(18,D*1.6));
    const maxK=Math.ceil(Rmax/step);
    for(let k=1;k<=maxK;k++){
      const rad=k*step;
      const n=Math.max(6,Math.ceil(2*Math.PI*rad/step));
      for(let j=0;j<n;j++){
        const a=j/n*2*Math.PI;
        const qx=tx+rad*Math.cos(a),qy=ty+rad*Math.sin(a);
        if(!validXY(qx,qy))continue;
        if(!segClear(qx,qy,tx,ty))continue;
        if(!faoPlungeClear(qx,qy,moves,z,D,airCv))continue;
        return {x:qx,y:qy};
      }
    }
    return null;
  };
  // 10-09-003 : arrivée sur le vide — rapide en hauteur au-dessus de Q puis
  // PLONGÉE À PLAT sur Q (disque clair par construction de voidWayC) ; la
  // liaison courte sûre (< faoRapideMin) reste un G1 à plat sans lever.
  const arriveVoidC=function(qx,qy){
    const prev=moves.length?moves[moves.length-1]:null;
    const ddx=qx-(prev?prev.x:0), ddy=qy-(prev?prev.y:0);
    if(prev&&!prev.r&&Math.abs(prev.z-z)<1e-9&&
       ddx*ddx+ddy*ddy<linkMax*linkMax&&
       segClear(prev.x,prev.y,qx,qy)){ pushCut(qx,qy); return; }
    const zG=gotoXY(qx,qy);
    if(Math.abs(zG-z)>1e-9)moves.push({r:0,ent:1,x:rnd(qx),y:rnd(qy),z:z});
  };
  // --- ENTRÉE EN LIGNE DROITE VERS LE MILIEU DU 1er SEGMENT (2026-10-10-001,
  // Fix 3). Les entrées en ARC TANGENT amenaient le CENTRE plus près que r de
  // la paroi : mesuré sur la pièce réelle Ø25 (outil T6) = 26 arcs dont 14
  // GOUGES (minD < 12,5, pire 7,79 mm — la fraise entrait 4,7 mm dans la
  // matière) + 12 arcs mangeant la laisse de 0,5 (tous aux mini-passes),
  // plainte « usinage de la matière qu'il ne faut pas toucher » + escargot
  // « rayons d'entrée tangents ». On entre au MILIEU M du premier segment de
  // la cible avec la cascade sûre existante (liaison de coupe / plongée 007 /
  // vide 10-09-003 / repli hélice de l'appelant), puis on accoste M -> seq[0]
  // (demi-segment retaillé) : TOUTE l'entrée est désormais en droites
  // validées (segClear / linkCutOK / faoPlungeClear — centre toujours à
  // >= rrSafe de la matière), couverture complète (chaîne fermée : la boucle
  // referme sur M ; ouverte : back-cut M->seq[0]). false = repli de
  // l'appelant (chaîne d'entrée hélice/rampe, ou la cascade de linkIn sur
  // seq[0]).
  const midEnter=function(seq,ch,ax,ay){
    if(!seq||seq.length<2)return false;
    const g=function(i){return ch.mv?[seq[i].x,seq[i].y]:[seq[i][0],seq[i][1]];};
    const A=g(0),Q=g(1);
    const Mx=(A[0]+Q[0])/2, My=(A[1]+Q[1])/2;
    // Demi-segment d'accostage M -> seq[0] : non sur -> on laisse l'appelant
    // entrer directement sur seq[0] (cascade historique, jamais d'arc).
    if(!segClear(Mx,My,ax,ay))return false;
    const prev=moves.length?moves[moves.length-1]:null;
    const atZ=!!(prev&&!prev.r&&Math.abs(prev.z-z)<1e-9);
    // (1) déjà à la cote : droite de coupe validée jusqu'à M (aucun lever,
    // aucun arc) puis demi-segment — liaison courte historique généralisée.
    if(atZ&&linkNear(prev.x,prev.y,Mx,My)&&segClear(prev.x,prev.y,Mx,My)){ pushCut(Mx,My); pushCut(ax,ay); return 1; }
    // (2) après l'entrée du niveau (hors mini-passes) : LIAISON DE COUPE sur
    // le plan (même critère que les bandes) — le bout de chaîne seq[0] (un
    // coin d'ombre parfois) n'est pas franchissable en direct, M l'est.
    if(!isRing&&entered&&atZ&&linkNear(prev.x,prev.y,Mx,My)&&linkCutOK(prev.x,prev.y,Mx,My)){
      pushCut(Mx,My); pushCut(ax,ay); return 1;
    }
    // (3) plongée sûre sur M (007 : disque D/2 déjà balayé ou en air réel) —
    // descente verticale sur place, puis accostage à cote.
    if(faoPlungeClear(Mx,My,moves,z,D,airCv)){
      gotoXY(Mx,My);
      moves.push({r:0,ent:1,x:rnd(Mx),y:rnd(My),z:z});
      pushCut(ax,ay); return 1;
    }
    // (4) ancre en AIR (hors boîte de brut) : plongée plate admise (repli
    // 10-09-002 : le vide ne peut pas mordre).
    if(airCv(Mx,My)&&faoPlungeClear(Mx,My,moves,z,D,
       function(sx2,sy2){return airCv(sx2,sy2)||!insideSil(sx2,sy2);})){
      gotoXY(Mx,My);
      moves.push({r:0,ent:1,x:rnd(Mx),y:rnd(My),z:z});
      pushCut(ax,ay); return 1;
    }
    // (5) mini-passes : VIDE D'ABORD — plongée plate sur Q (intérieur déjà
    // balayé par le plan plus profond), accostage à cote vers M puis demi-
    // segment ; jamais de rampe en mini-passes (repli = l'appelant).
    if(isRing){
      const Qm=voidWayC(Mx,My);
      if(Qm){ arriveVoidC(Qm.x,Qm.y); pushCut(Mx,My); pushCut(ax,ay); return 1; }
    }
    return false;
  };
  // Première cible = le morceau que le tour épuisera en premier (même règle).
  let entOK=false;
  // 10-09-003 -> 2026-10-10-001 : l'entrée du niveau (mini-passes OU
  // entryMode 'circ') cherche d'abord l'ARC CONCAVE SÛR (arcEnter), puis la
  // LIAISON DROITE vers le milieu M du 1er segment (midEnter) — le gate suit
  // le même choix que linkIn.
  if((entryMode==='circ'||isRing)&&remaining.length){
    const px0=moves.length?moves[moves.length-1].x:cx0;
    const py0=moves.length?moves[moves.length-1].y:cy0;
    if(isRing){
      const pk0=safePick(remaining,px0,py0);
      const ch0=remaining[pk0];
      if(ch0){
        const s0=ordered(ch0,px0,py0);
        const ax0=ch0.mv?s0[0].x:s0[0][0], ay0=ch0.mv?s0[0].y:s0[0][1];
        entOK=!!arcEnter(s0,ch0,ax0,ay0)||!!midEnter(s0,ch0,ax0,ay0);
      }
    }else{
      let kTop=-1;
      for(let i=0;i<remaining.length;i++)if((remaining[i].k||0)>kTop)kTop=remaining[i].k||0;
      const grp=[];
      for(let i=0;i<remaining.length;i++)if((remaining[i].k||0)===kTop)grp.push(remaining[i]);
      // 006 : le 1er morceau du tour est une BANDE (k=1000) — son point de
      // départ n'accepte pas toujours l'entrée (trop près d'une ombre). On
      // essaie les plus proches jusqu'à ce que midEnter accepte ; sinon la
      // chaîne d'entrée classique (tang/hélice/rampe) reste le repli.
      const cand=grp.map(function(ch){
        const s0=ordered(ch,px0,py0);
        const ax=ch.mv?s0[0].x:s0[0][0], ay=ch.mv?s0[0].y:s0[0][1];
        return {ch:ch,seq:s0,ax:ax,ay:ay,d:(ax-px0)*(ax-px0)+(ay-py0)*(ay-py0)};
      });
      cand.sort(function(a,b){return a.d-b.d;});
      for(let gi=0;gi<cand.length&&gi<8&&!entOK;gi++){
        if(arcEnter(cand[gi].seq,cand[gi].ch,cand[gi].ax,cand[gi].ay)||
           midEnter(cand[gi].seq,cand[gi].ch,cand[gi].ax,cand[gi].ay))entOK=true;
      }
    }
  }
  if(entOK){
    // entrée en ligne droite émise — le tour enchaîne en liaison directe.
  }else if(tang){
    const zG=gotoXY(tang.sx,tang.sy);
    const hs=Math.max(faoHelixSpot(mesh,tang.sx,tang.sy,0,r,z,brutTop,planes),hFloor);
    if(Math.abs(zG-hs)>1e-9)moves.push({r:0,x:rnd(tang.sx),y:rnd(tang.sy),z:hs});
    moves.push({r:0,x:rnd(tang.px),y:rnd(tang.py),z:z});
  }else if(hx!==null){
    const zG=gotoXY(hx,hy);
    if(Math.abs(zG-hStart)>1e-9)moves.push({r:0,x:rnd(hx),y:rnd(hy),z:hStart});
    faoHelixEntry(hx,hy,hStart,z,hr,D).slice(1).forEach(function(m){moves.push(m);});
  }else if(ramp&&(fmode==='ramp'||(!hasTroch&&Math.max(elen,yRun)>=D*0.5))){
    gotoXY(ramp.x0,ramp.y0);
    // 2026-10-08-005 : la rampe G1 d'attaque (coupe diagonale en biseau) est
    // une entrée — étiquetée ent (tracé bleu, comme l'hélice et l'arc circ).
    moves.push({r:0,ent:1,x:rnd(ramp.x1),y:rnd(ramp.y1),z:z});
  }else{
    // 2026-10-08-006 : première attaque sans région ouverte — JAMAIS de
    // plongée à plat dans la matière (fraise à cheval sur la phase) : hélice
    // de descente depuis le spot, orbite réduite jusqu'à rester dans la
    // région légale (sinon surcoupe du mur en orbite) ; aucune orbite
    // tenable -> liaison + coupe (centre légal, repli historique).
    const run=Math.max(elen,yRun);
    const mhr=Math.max(0.5,run/2-0.2);
    const mx=ramp?ramp.x0:(E.iv.a+E.iv.b)/2, my=ramp?ramp.y0:E.y;
    // 008 : JAMAIS d'hélice dans l'AIR — boîte de brut ∩ hors pièce = rien à
    // enlever sous la colonne (le cadre E0 en marge et les intervalles d'ombre
    // hors boîte entreraient par un ressort dans le vide). Sous le vide de
    // poche, la MATIÈRE BRUT est bien là (hors pièce dans la boîte) : hélice.
    const surMatiere=(mx>=B.x0-1e-9&&mx<=B.x1+1e-9&&my>=B.y0-1e-9&&my<=B.y1+1e-9)&&
      !faoShapeInside(S,mx,my)&&(!zoneAt||zoneAt(mx,my)); // Fix 2 : hors zone = vide
    if(!surMatiere){
      // rien à enlever ici : le 1er morceau (linkIn 007) ramp/linkpe depuis
      // la position précédente.
    }else{
    let hrH=(fmode!=='ramp'&&run>0.5&&
      (faoDiscClear(segsAll,mx,my,mhr,r+faoHelixJeu)||
       faoDiscClear(segsAll,mx,my,mhr,r)))?mhr:Math.max(1,D*0.2);
    const okOrb=function(h){
      for(let k=0;k<8;k++){const a=k/8*2*Math.PI;if(!validXY(mx+h*Math.cos(a),my+h*Math.sin(a)))return false;}
      return true;
    };
    while(hrH>0.5&&!okOrb(hrH))hrH-=0.5;
    if(hrH>0.5&&okOrb(hrH)){
      const ms=Math.max(faoHelixSpot(mesh,mx,my,hrH,r,z,brutTop,planes),hFloor);
      const zG=gotoXY(mx,my);
      if(Math.abs(zG-ms)>1e-9)moves.push({r:0,x:rnd(mx),y:rnd(my),z:ms});
      faoHelixEntry(mx,my,ms,z,hrH,D).slice(1).forEach(function(m){moves.push(m);});
      pushCut(mx,my);
    }else if(faoPlungeClear(mx,my,moves,z,D,airCv)){
      // 2026-10-08-007 : plongée à plat admise UNIQUEMENT si le disque est
      // déjà balayé ou en air réel (hors brut) — sinon on n'émet rien : le
      // 1er morceau du tour ramp le long de sa chaîne (linkIn 007).
      // 10-09-002 : liaison courte sûre = G1 à la cote (pushCut) ; au-delà,
      // lever + rapide puis plongée plate.
      if(linkTo(mx,my))moves.push({r:0,ent:1,x:rnd(mx),y:rnd(my),z:z});
      else pushCut(mx,my);
    }
    }
  }
  // 006 -> 2026-10-10-001 : rien n'a été émis à la cote (entrée droite
  // refusée partout, pas de tang / hélice / rampe) — au moins une cible du
  // tour accepte l'entrée (midEnter) : le tour y vient en liaison de coupe.
  // Sans cela, linkIn finissait en descente hélice de secours à ras de paroi
  // (faux « niveaux » z intermédiaires). Ne touche pas aux niveaux où la
  // chaîne d'entrée a déjà émis à z.
  const pmE=moves.length?moves[moves.length-1]:null;
  if((!pmE||pmE.z>z+1e-9)&&!isRing&&remaining.length){
    const ex0=pmE?pmE.x:cx0, ey0=pmE?pmE.y:cy0;
    const cE=remaining.map(function(ch){
      const s0=ordered(ch,ex0,ey0);
      const ax=ch.mv?s0[0].x:s0[0][0], ay=ch.mv?s0[0].y:s0[0][1];
      return {ch:ch,seq:s0,ax:ax,ay:ay,d:(ax-ex0)*(ax-ex0)+(ay-ey0)*(ay-ey0)};
    });
    cE.sort(function(a,b){return a.d-b.d;});
    for(let ei=0;ei<cE.length&&ei<40&&!entOK;ei++){
      if(arcEnter(cE[ei].seq,cE[ei].ch,cE[ei].ax,cE[ei].ay)||
         midEnter(cE[ei].seq,cE[ei].ch,cE[ei].ax,cE[ei].ay))entOK=true;
    }
  }
  // 006 : l'entrée du niveau est émise (ou rien n'est utile ici) — les
  // liaisons du tour restent désormais sur le plan (linkIn 006) quand la
  // géométrie le permet ; la cascade circ/plongée/rampe reste le repli
  // (prev.z≈z fait la séparation : secu → premier morceau = ancien chemin).
  entered=true;
  // 10-09-002 : mini-passes — un tour fait, la fraise est passée partout :
  // un morceau dont CHAQUE point a son disque D/2 entièrement balayé à la
  // cote (même test que la plongée sûre 007) est déjà usiné. Le refaire =
  // vitesse travail dans le vide (parfois même avant la fin du tour, le
  // greedy saisit un morceau déjà couvert entre deux morceaux vierges). On
  // le DROPE sans bouger ; la couverture est réévaluée à chaque choix (le
  // tour couvre au fur et à mesure). Actif uniquement en ringOnly (mini-
  // passes ET finition conventionnelle) : les passes normales gardent leur
  // parcours historique. Deux temps : (1) filtre rapide — chaque point doit
  // avoir une coupe à la MÊME cote à ≤ r, sinon non couvert (on ne saute
  // jamais une bague utile) ; (2) test disque complet faoPlungeClear.
  const chunkCovered=function(ch){
    // 2026-10-09-004 : index incrémental (points !r par cellule, queue
    // seule) — plus de reconstruction zc O(moves) par candidat ni de
    // balayage O(zc) par point ; filtre z exact conservé à la requête.
    const g=fmiIdx(moves);
    const r2=rrSafe*rrSafe;
    const near=function(x,y){
      if(!g){
        for(let i=0;i<moves.length;i++){const m=moves[i];
          if(!m.r&&Math.abs(m.z-z)<1e-9){
            const dx=m.x-x,dy=m.y-y;
            if(dx*dx+dy*dy<=r2)return true;}}
        return false;
      }
      const c=fmiPC;
      const ix0=Math.floor((x-rrSafe)/c),ix1=Math.floor((x+rrSafe)/c);
      const iy0=Math.floor((y-rrSafe)/c),iy1=Math.floor((y+rrSafe)/c);
      const z0=Math.round(z*1e6);
      for(let dz=-1;dz<=1;dz++){
        const zb=g.pt.get(z0+dz); if(!zb)continue;
        for(let iy=iy0;iy<=iy1;iy++)for(let ix=ix0;ix<=ix1;ix++){
          const arr=zb.get(fmiK(ix,iy)); if(!arr)continue;
          for(let k=0;k<arr.length;k++){
            const m=arr[k];
            if(Math.abs(m.z-z)<1e-9){
              const dx=m.x-x,dy=m.y-y;
              if(dx*dx+dy*dy<=r2)return true;
            }
          }
        }
      }
      return false;
    };
    const P=ch.mv?null:ch.pts, n=ch.mv?ch.mv.length:(P?P.length:0);
    if(!n)return false;
    for(let i=0;i<n;i++){
      const x=ch.mv?ch.mv[i].x:P[i][0], y=ch.mv?ch.mv[i].y:P[i][1];
      if(!near(x,y))return false;
      if(!faoPlungeClear(x,y,moves,z,D,airCv))return false;
    }
    return true;
  };
  while(remaining.length){
    const P=moves.length?moves[moves.length-1]:null,px=P?P.x:cx0,py=P?P.y:cy0;
    let pick=-1;
    if(isRing){
      pick=safePick(remaining,px,py);
    }else{
      let kTop=-1;
      for(let i=0;i<remaining.length;i++)if((remaining[i].k||0)>kTop)kTop=remaining[i].k||0;
      const grp=[];
      for(let i=0;i<remaining.length;i++)if((remaining[i].k||0)===kTop)grp.push(remaining[i]);
      if(kTop>=1000&&grp[0]&&grp[0].band){
        // Fix 1 (2026-10-10-001) : bandes en ORDRE DE CRÉATION (serpentin
        // li%2, jamais greedy) mais démarrées du CENTRE du niveau et
        // rayonnant vers les DEUX bords (deux-pointeurs sur les y) — le
        // « milieu d'abord » (RETOUR 3, canari escargot) reste vrai, les
        // transitions restent courtes (1 à 2 pas de pas de bande) et les
        // lignes hors poche (les bords) ferment le niveau.
        // 2026-10-10-002 (demande 2) : UN CÔTÉ À LA FOIS — on épuise d'abord
        // le côté +Y (du centre vers le bord), puis on revient et on épuise le
        // côté −Y (du centre vers l'autre bord). Le rayonnement alterné (cB,
        // cB+1, cB−1, …) faisait traverser le centre à chaque bande ; on garde
        // le serpentin (transitions courtes intra-côté) et le démarrage au
        // centre, on ne change que l'ordre des côtés : une seule longue
        // transition au retournement, les deux sweeps restent monotones.
        if(!bandOrder){
          const seenY={},ysB=[];
          for(let i=0;i<grp.length;i++){
            const yv=+((grp[i].mv?grp[i].mv[0].y:grp[i].pts[0][1]).toFixed(3));
            if(!seenY[yv]){seenY[yv]=1;ysB.push(yv);}
          }
          ysB.sort(function(a,b){return a-b;});
          let cB=0,bd=1/0;
          for(let i=0;i<ysB.length;i++){
            const d=Math.abs(ysB[i]-cy0);
            if(d<bd){bd=d;cB=i;}
          }
          const ordY=[];
          for(let i=cB;i<ysB.length;i++)ordY.push(i);   // côté +Y : du centre au bord
          for(let i=cB-1;i>=0;i--)ordY.push(i);         // côté −Y : du centre à l'autre bord
          bandOrder=[];
          for(let oi=0;oi<ordY.length;oi++){
            const yv=ysB[ordY[oi]];
            for(let i=0;i<grp.length;i++){
              const gy=+((grp[i].mv?grp[i].mv[0].y:grp[i].pts[0][1]).toFixed(3));
              if(gy===yv)bandOrder.push(grp[i]);
            }
          }
          bandIdx=0;
        }
        while(bandIdx<bandOrder.length){
          const chB=bandOrder[bandIdx];
          const jb=remaining.indexOf(chB);
          if(jb<0){bandIdx++;continue;} // déjà prise via le repli greedy
          const sq=ordered(chB,px,py);
          const qx=chB.mv?sq[0].x:sq[0][0], qy=chB.mv?sq[0].y:sq[0][1];
          if(segClear(px,py,qx,qy)){pick=jb;bandIdx++;break;}
          // coude 006 : la transition serpentin longe la face — le direct
          // peut mordre un coin d'ombre, le coude (L) reste clair : on garde
          // l'ordre de création. Repli greedy seulement si ni direct ni coude.
          if(linkCutOK(px,py,qx,py)||linkCutOK(px,py,px,qy)){pick=jb;bandIdx++;break;}
          break; // ni direct ni coude -> repli greedy ci-dessous (suite retestée)
        }
      }
      if(pick<0){
        const gp=safePick(grp,px,py);
        pick=remaining.indexOf(grp[gp]);
        // Resynchronisation (Fix 1) : un repli greedy consomme une bande
        // hors séquence — sans cette ligne, bandIdx restait bloqué sur la
        // bande ratée et CHAQUE transition suivante re-échouait (cascade =
        // quasi tout le niveau retombait en greedy).
        if(bandOrder&&grp[gp]&&grp[gp].band){
          const bj=bandOrder.indexOf(grp[gp]);
          if(bj>=0)bandIdx=bj+1;
        }
      }
    }
    const ch=remaining[pick];
    remaining.splice(pick,1);
    if(isRing&&chunkCovered(ch))continue; // 10-09-002 : déjà usiné — pas de coupe dans le vide
    emitChunk(ch,px,py);
  }
  sortie(moves[moves.length-1]);
}

function faoRoughRegions(lines){
  // Regroupe les intervalles en régions connexes en Y (recouvrement X) :
  // une nervure/îlot = une région, suivie pour elle-même (morph).
  const parent={};
  const id=function(li,ii){ return li+':'+ii; };
  const find=function(a){ while(parent[a]!==a)a=parent[a]; return a; };
  const uni=function(a,b){ a=find(a); b=find(b); if(a!==b)parent[a]=b; };
  lines.forEach(function(L,li){ L.ivs.forEach(function(iv,ii){ parent[id(li,ii)]=id(li,ii); }); });
  for(let li=1;li<lines.length;li++){
    // Union UNIQUEMENT si le recouvrement est 1:1 des deux côtés : une ligne
    // pleine (marge hors matière) recouvre toutes les colonnes — les fusionner
    // donnerait un pelage en travers des plots. Elle reste région à part.
    const prev=lines[li-1], cur=lines[li];
    const ovC=[], ovP=new Array(prev.ivs.length).fill(0);
    for(let ii=0;ii<cur.ivs.length;ii++){
      ovC[ii]=[];
      for(let pj=0;pj<prev.ivs.length;pj++){
        if(cur.ivs[ii].a<prev.ivs[pj].b&&prev.ivs[pj].a<cur.ivs[ii].b){
          ovC[ii].push(pj); ovP[pj]++;
        }
      }
    }
    for(let ii=0;ii<cur.ivs.length;ii++){
      if(ovC[ii].length===1&&ovP[ovC[ii][0]]===1)uni(id(li,ii),id(li-1,ovC[ii][0]));
    }
  }
  const groups={};
  lines.forEach(function(L,li){
    L.ivs.forEach(function(iv,ii){
      const r=find(id(li,ii));
      (groups[r]=groups[r]||[]).push({y:L.y,iv:iv});
    });
  });
  return Object.keys(groups).map(function(k){return groups[k];});
}
