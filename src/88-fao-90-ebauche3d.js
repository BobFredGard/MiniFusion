/* ================= 3D : ébauche par tranches + finition iso-géodésique ================= */
// Maillage plan : {v:[[x,y,z]], t:[[a,b,c]]} — aucune dépendance THREE : tout ce
// bloc est pur et testé en Node sur maillages synthétiques. Le lien avec la
// scène (faoActiveMesh) est le seul point navigateur.
// Ébauche : tranches Z (faoLevels) + vidage scanline par tranche — pas de
// librairie de clipping : pour chaque ligne Y on intersecte la section (impair),
// on rétracte de r+laisse, on zigzague en continu (l'air coupé, jamais de rapide
// dans la matière ; les retracts inter-passes viendront en optimisation).
// Finition : champ de distances géodésiques approché (Dijkstra sur les arêtes)
// depuis le sommet + iso-courbes à pas 3D constant (feston régulier), sorties en
// centre outil (contact + normale×R). Approximation honnête : Dijkstra/arêtes,
// pas MMP/exact — largement suffisante en finition.

function faoMeshFromBody(b,maxTri){
  // BufferGeometry (indexée ou non) -> maillage plan soudé, en coordonnées pièce.
  try{
    if(!b||!b.mesh||!b.mesh.geometry)return null;
    const g=b.mesh.geometry, pos=g.attributes&&g.attributes.position;
    if(!pos||!pos.count||!pos.array)return null;
    const arr=pos.array, idx=g.index&&g.index.array?g.index.array:null;
    const m=b.mesh.matrixWorld, M=m&&m.elements?m.elements:null;
    const P=function(i){
      let x=arr[i*3],y=arr[i*3+1],z=arr[i*3+2];
      if(M){
        const nx=M[0]*x+M[4]*y+M[8]*z+M[12], ny=M[1]*x+M[5]*y+M[9]*z+M[13],
              nz=M[2]*x+M[6]*y+M[10]*z+M[14], w=M[3]*x+M[7]*y+M[11]*z+M[15]||1;
        x=nx/w; y=ny/w; z=nz/w;
      }
      return [x,y,z];
    };
    const ntri=idx?idx.length/3:pos.count/3;
    if(!(ntri>0)||ntri>(maxTri>0?maxTri:120000))return null; // garde-fou : trop lourd pour le navigateur
    const v=[], t=[], map={};
    const W=function(p){
      const k=p[0].toFixed(4)+','+p[1].toFixed(4)+','+p[2].toFixed(4);
      let j=map[k];
      if(j===undefined){ j=v.length; v.push(p); map[k]=j; }
      return j;
    };
    for(let k=0;k<ntri;k++){
      const a=idx?idx[k*3]:k*3, b2=idx?idx[k*3+1]:k*3+1, c=idx?idx[k*3+2]:k*3+2;
      t.push([W(P(a)),W(P(b2)),W(P(c))]);
    }
    if(!v.length||!t.length)return null;
    return {v:v,t:t};
  }catch(e){ return null; }
}
// 2026-10-14-009 : maillage FIN par corps (Finition), en cache comme l'autre.
let faoBodyMeshFineMap=null;
try{ faoBodyMeshFineMap=new WeakMap(); }catch(e){}
function faoMeshFromBodyFineCached(b){
  if(typeof faoMeshFromBodyFine!=='function')return null;
  if(faoBodyMeshFineMap){ const e=faoBodyMeshFineMap.get(b); if(e)return e; }
  let m=null;
  try{ m=faoMeshFromBodyFine(b); }catch(e){ m=null; }
  if(m&&faoBodyMeshFineMap){ try{ faoBodyMeshFineMap.set(b,m); }catch(e){} }
  return m;
}
// 2026-10-22-009 : maillage intermédiaire (ébauche 3D, contour profil)
let faoBodyMeshMidMap=null;
try{ faoBodyMeshMidMap=new WeakMap(); }catch(e){}
function faoMeshFromBodyMidCached(b){
  if(typeof faoMeshFromBodyMid!=='function')return null;
  if(faoBodyMeshMidMap){ const e=faoBodyMeshMidMap.get(b); if(e)return e; }
  let m=null;
  try{ m=faoMeshFromBodyMid(b); }catch(e){ m=null; }
  if(m&&faoBodyMeshMidMap){ try{ faoBodyMeshMidMap.set(b,m); }catch(e){} }
  return m;
}
function faoActiveMesh(setup,fine){
  // Fusion des corps du MODÈLE du posage (setup.bodies : 'all' ou [ids]).
  // fine (2026-10-14-009) : maillage FIN de finition (congés lisses), repli
  // sur le maillage d'outillage si indisponible.
  try{
    if(typeof bodies==='undefined'||!bodies||!bodies.length)return null;
    const only=(setup&&Array.isArray(setup.bodies))?setup.bodies:null;
    const V=[], T=[];
    let x0=1/0,y0=1/0,z0=1/0,x1=-1/0,y1=-1/0,z1=-1/0, n=0;
    for(let bi=0;bi<bodies.length;bi++){
      const b=bodies[bi];
      if(!b||b.ghost||b.visible===false)continue;
      if(only&&only.indexOf(b.id)<0)continue;
      // fine : true = fin (finition), 'mid' = intermédiaire (ébauche, profil)
      const mm=(fine==='mid'?faoMeshFromBodyMidCached(b):(fine&&faoMeshFromBodyFineCached(b)))||faoMeshFromBodyCached(b);
      if(!mm)continue;
      const off=V.length;
      for(let i=0;i<mm.v.length;i++){ const p=mm.v[i]; V.push(p);
        if(p[0]<x0)x0=p[0]; if(p[1]<y0)y0=p[1]; if(p[2]<z0)z0=p[2];
        if(p[0]>x1)x1=p[0]; if(p[1]>y1)y1=p[1]; if(p[2]>z1)z1=p[2]; }
      for(let i=0;i<mm.t.length;i++)T.push([mm.t[i][0]+off,mm.t[i][1]+off,mm.t[i][2]+off]);
      n++;
      if(T.length>(fine?600000:120000))return null;
    }
    if(!n||!V.length)return null;
    // 2026-10-16-019 : repère orienté du posage → maillage dans SES coordonnées
    const F=faoFrame(setup);
    if(!F.id){ const W=V.map(function(p){return faoToF(F,p);}); return {mesh:{v:W,t:T}, box:faoBoxOfVerts(W)}; }
    return {mesh:{v:V,t:T}, box:{x0:x0,y0:y0,z0:z0,x1:x1,y1:y1,z1:z1}};
  }catch(e){ return null; }
}
function faoMeshNormals(mesh){
  // Normales aux sommets, pondérées par l'aire (robuste aux soupes de triangles).
  const n=[]; let i;
  for(i=0;i<mesh.v.length;i++)n.push([0,0,0]);
  for(i=0;i<mesh.t.length;i++){
    const a=mesh.v[mesh.t[i][0]], b=mesh.v[mesh.t[i][1]], c=mesh.v[mesh.t[i][2]];
    const ux=b[0]-a[0], uy=b[1]-a[1], uz=b[2]-a[2], wx=c[0]-a[0], wy=c[1]-a[1], wz=c[2]-a[2];
    const nx=uy*wz-uz*wy, ny=uz*wx-ux*wz, nz=ux*wy-uy*wx;
    [[mesh.t[i][0]],[mesh.t[i][1]],[mesh.t[i][2]]].forEach(function(q){
      n[q[0]][0]+=nx; n[q[0]][1]+=ny; n[q[0]][2]+=nz; });
  }
  for(i=0;i<n.length;i++){
    const l=Math.hypot(n[i][0],n[i][1],n[i][2])||1;
    n[i]=[n[i][0]/l,n[i][1]/l,n[i][2]/l];
  }
  return n;
}
function faoSliceZ(mesh,z){
  // Intersection maillage/plan Z -> segments 2D [[x1,y1,x2,y2]].
  // Les deux sens de contact sommet/plan sont traités (un niveau pile sur un
  // plan de faces — fond de poche, embase — sortait vide avant : le brut
  // complet était alors usiné à travers la pièce).
  // 2026-10-13-002 : chemins scalaires sans tableaux intermédiaires ni
  // closures par face (règles strictement identiques : mêmes cas de contact,
  // mêmes tests, dédups < 1e-7) — cette fonction tourne ~160 fois par
  // colonne × dizaines de milliers de faces sur pièce réaliste.
  const segs=[], e=1e-9, T=mesh.t, V=mesh.v;
  let ax=0,ay=0,bx=0,by=0,n=0;
  const pushp=function(px,py){
    if(n===0){ax=px;ay=py;n=1;return;}
    if(n>1)return; // 3e point distinct : uq[2] inutilisé comme avant
    const dx=px-ax,dy=py-ay;
    if(dx*dx+dy*dy<1e-14)return; // doublon (hypot < 1e-7)
    bx=px;by=py;n=2;
  };
  // 2026-10-15-001 : SOMMET PILE SUR LE PLAN = « dessous » (section = limite
  // par AU-DESSUS, z+0). L'ancien traitement des deux sens de contact
  // produisait, au Z exact d'une face horizontale (épaulement à 26), des
  // segments en double qui INVERSAIENT la parité : le centre d'une poche
  // voisine devenait « matière » dans l'ombre et son fond (24) n'était jamais
  // usiné. Règle unique : 0 ou 2 croisements par triangle, section étanche ;
  // une face horizontale au plan n'est pas coupée (on lit juste au-dessus).
  for(let i=0;i<T.length;i++){
    const t=T[i], a=V[t[0]], b=V[t[1]], c=V[t[2]];
    let da=a[2]-z, db=b[2]-z, dc=c[2]-z;
    if(da<=e&&da>=-e)da=-e; if(db<=e&&db>=-e)db=-e; if(dc<=e&&dc>=-e)dc=-e;
    let s;
    n=0;
    if((da<0)!==(db<0)){ s=da/(da-db); pushp(a[0]+(b[0]-a[0])*s,a[1]+(b[1]-a[1])*s); }
    if((db<0)!==(dc<0)){ s=db/(db-dc); pushp(b[0]+(c[0]-b[0])*s,b[1]+(c[1]-b[1])*s); }
    if((dc<0)!==(da<0)){ s=dc/(dc-da); pushp(c[0]+(a[0]-c[0])*s,c[1]+(a[1]-c[1])*s); }
    if(n===2)segs.push([ax,ay,bx,by]);
  }
  return segs;
}
function faoScanIntervals(segs,y){
  // Ligne Y -> intervalles matière [xa,xb] (règle impair, tol 1e-7).
  // Décalage epsilon : une ligne passant EXACTEMENT par des sommets de section
  // compterait chaque contact double et annulerait les paires (cas systématique
  // en test : y=5 sur une boîte 0..10).
  const yy=y+1e-7, xs=[];
  for(let i=0;i<segs.length;i++){
    const s=segs[i];
    if((s[1]-yy)*(s[3]-yy)<=0&&s[1]!==s[3]){
      xs.push(s[0]+(s[2]-s[0])*(yy-s[1])/(s[3]-s[1]));
    }
  }
  xs.sort(function(a,b){return a-b;});
  const out=[];
  for(let i=0;i+1<xs.length;i+=2){
    if(xs[i+1]-xs[i]>1e-7)out.push([xs[i],xs[i+1]]);
  }
  return out;
}
/* ----- entrées douces : hélice (descente circulaire) ou rampe (biais) ----- */
// Jamais de plongée verticale dans la matière : l'hélice creuse sa place quand
// la largeur le permet, sinon la rampe descend en avançant (avance plongée).
// L'hélice attaque TOUJOURS hors matière, 2 mm au-dessus de la matière
// restante : faoHelixSpot (matière du maillage) + plancher hFloor côté
// ébauche 3D (face d'entrée de la passe + 2 mm — le maillage ne voit ni le
// brut ni la matière des passes précédentes).
let faoSliceCache=null;
function faoSliceZCached(mesh,z){
  // 2026-10-13-002 : slot AUTO-INITIÉ — hors du batch 2.5D (où faoSliceCache
  // est posé puis nullifié), la colonne de liaison de la CRÊTES CONSTANTES
  // recomposait jusqu'à ~160 tranches planes PAR HAUTEUR SANS JAMAIS CACHER :
  // 17 001 coupes pleines maillage = ~2 min sur une pièce 38k tris (faoSliceZ
  // est pur : mémoïsation strictement équivalente). Le slot unique saute de
  // lui-même dès qu'un autre maillage est utilisé (même forme qu'avant).
  const k=Math.round(z*1000)/1000;
  if(!faoSliceCache||faoSliceCache.mesh!==mesh)faoSliceCache={mesh:mesh,map:{}};
  const hit=faoSliceCache.map[k];
  if(hit)return hit;
  const s=faoSliceZ(mesh,z);
  faoSliceCache.map[k]=s;
  return s;
}
function faoSliceHit(segs,cx,cy,clear){
  // Le disque de dégagement [clear] autour du point touche-t-il la section ?
  for(let i=0;i<segs.length;i++){
    const s=segs[i];
    const dx=s[2]-s[0], dy=s[3]-s[1], l2=dx*dx+dy*dy;
    let t=l2>1e-12?((cx-s[0])*dx+(cy-s[1])*dy)/l2:0;
    t=Math.max(0,Math.min(1,t));
    if(Math.hypot(cx-(s[0]+dx*t),cy-(s[1]+dy*t))<clear)return true;
  }
  const xs=[];
  for(let i=0;i<segs.length;i++){
    const s=segs[i];
    if((s[1]-cy)*(s[3]-cy)<=0&&s[1]!==s[3])
      xs.push(s[0]+(s[2]-s[0])*(cy-s[1])/(s[3]-s[1]));
  }
  xs.sort(function(a,b){return a-b;});
  let left=0;
  for(let i=0;i<xs.length;i++)if(xs[i]<cx-1e-9)left++;
  return (left%2)===1;
}
/* Index (hash dense + tranches Y) mémoïsé par tableau de segments : le même
   `segsAll` (construit une fois par niveau) est interrogé 100 000 fois. */
const faoDiscIdxCache=(typeof WeakMap!=='undefined')?new WeakMap():null;
function faoDiscIdx(segs){
  if(!faoDiscIdxCache)return null;
  let idx=faoDiscIdxCache.get(segs);
  if(idx)return idx;
  const H=faoHashBuild(4);
  if(segs.length)faoHashSegs(H,segs);
  const step=1;
  let y0=1/0,y1=-1/0;
  for(let i=0;i<segs.length;i++){
    const a=segs[i][1],b=segs[i][3];
    if(a<y0)y0=a; if(b<y0)y0=b; if(a>y1)y1=a; if(b>y1)y1=b;
  }
  let rows=[],n=1;
  if(segs.length&&y1>=y0){
    n=Math.max(1,Math.ceil((y1-y0)/step)+1);
    rows=new Array(n);
    for(let i=0;i<segs.length;i++){
      const a=segs[i][1],b=segs[i][3];
      if(a===b)continue;
      let i0=Math.floor((Math.min(a,b)-y0)/step),i1=Math.floor((Math.max(a,b)-y0)/step);
      if(i0<0)i0=0; else if(i0>n-1)i0=n-1;
      if(i1<0)i1=0; else if(i1>n-1)i1=n-1;
      // pack 5 nombres (ax,ay,by,dx,dy) — voir faoDiscClear
      const sg=segs[i],ax=sg[0],ay=sg[1],by=sg[3],dx=sg[2]-sg[0],dy=by-ay;
      for(let k=i0;k<=i1;k++){let arr=rows[k];if(!arr)rows[k]=arr=[];arr.push(ax,ay,by,dx,dy);}
    }
    idx={H:H,rows:rows,n:n,y0:y0,step:step};
  }else idx={H:H,rows:rows,n:1,y0:0,step:step};
  faoDiscIdxCache.set(segs,idx);
  return idx;
}
function faoDiscClear(segs,cx,cy,hr,r){
  // Le disque d'hélice (centre,hr) évite-t-il la pièce (dedans ou à moins
  // de r) ? 8 échantillons sur le cercle, distance euclidienne au contour :
  // un échantillon juste hors matière (aucun croisement en Y) échappait à
  // la vérification et l'hélice plongeait dans la pièce.
  // Même sémantique qu'avant : parité (croisements comptés sur toute la
  // travée Y, sans tri) puis distance min < r-1e-9 — mais via les index.
  const idx=faoDiscIdx(segs);
  // 2026-10-13-002 : hr=0 -> les 8 échantillons du cercle COÏNCIDAIENT (même
  // point testé 8 fois) — une seule passe, strictement équivalente.
  const n8=hr>0?8:1;
  for(let k=0;k<n8;k++){
    const a=k/8*Math.PI*2, xx=cx+hr*Math.cos(a), yy=cy+hr*Math.sin(a);
    let len=0,left=0;
    if(idx&&idx.rows.length){
      let b=Math.floor((yy-idx.y0)/idx.step);
      if(b<0)b=0; else if(b>=idx.n)b=idx.n-1;
      // Lignes PACKÉES 5 nombres (ax,ay,by,dx,dy) : plus d'indirection
      // segs[idx] par croisement ; expression du croisement identique
      // (ordre d'évaluation `dx*(yy-ay)/dy` bit-à-bit comme l'original).
      const row=idx.rows[b];
      if(row)for(let t=0;t<row.length;t+=5){
        const ay=row[t+1],by=row[t+2];
        if((ay-yy)*(by-yy)<=0&&ay!==by){
          len++;
          if(row[t]+row[t+3]*(yy-ay)/(by-ay)<xx-1e-9)left++;
        }
      }
    }else{
      for(let i=0;i<segs.length;i++){
        const s=segs[i];
        if((s[1]-yy)*(s[3]-yy)<=0&&s[1]!==s[3]){
          len++;
          if(s[0]+(s[2]-s[0])*(yy-s[1])/(s[3]-s[1])<xx-1e-9)left++;
        }
      }
    }
    if(len%2)return false;
    if(left%2)return false;
    if(idx&&faoDistSeg(idx.H,xx,yy,r,r-1e-9)<r-1e-9)return false;
    if(!idx){
      let dmin=1/0;
      for(let i=0;i<segs.length;i++){
        const s=segs[i], ax=s[0], ay=s[1], dx=s[2]-s[0], dy=s[3]-s[1];
        const L2=dx*dx+dy*dy;
        let t=L2>0?((xx-ax)*dx+(yy-ay)*dy)/L2:0;
        if(t<0)t=0; else if(t>1)t=1;
        const px=ax+t*dx-xx, py=ay+t*dy-yy, d2=px*px+py*py;
        if(d2<dmin)dmin=d2;
      }
      if(dmin<(r-1e-9)*(r-1e-9))return false;
    }
  }
  return true;
}
function faoHelixSpot(mesh,cx,cy,hr,r,z,brutTop,planes){
  // Départ hélice = 2 mm au-dessus de la plus haute matière sous le disque.
  // Colonne vide : repli 2 mm au-dessus du NIVEAU (rainure ouverte) — le
  // plancher « face d'entrée de la passe + 2 mm » est posé par l'appelant
  // (hFloor, faoRoughAdaptiveLevel) : le maillage ne voit ni le brut ni la
  // matière enlevée par les passes précédentes.
  // Avec `planes` (Z vertex du maillage) : aucun voile fin manqué entre deux
  // pas de 1 mm ; sans : balayage historique au pas de 1 mm (morph/zigzag).
  const top=isFinite(+brutTop)?+brutTop:z;
  // 2026-10-15-001 : une section au plan zz est lue JUSTE AU-DESSUS de zz
  // (faoSliceZ) : la matière vue en zz monte jusqu'au plan suivant — le
  // départ se prend au-dessus de CE plan-là (sinon l'hélice démarrait sous
  // le dessus d'un bloc dont la face haute est pile sur un plan).
  if(Array.isArray(planes)&&planes.length){
    const ps=planes.filter(function(zz){return zz>z+1e-9&&zz<=top+1e-9;}).sort(function(a,b){return a-b;});
    for(let k=ps.length-1;k>=0;k--){
      if(faoSliceHit(faoSliceZCached(mesh,Math.round(ps[k]*1000)/1000),cx,cy,hr+r))
        return (k+1<ps.length?ps[k+1]:Math.max(top,ps[k]))+2;
    }
    // section au niveau même : matière entre z et le premier plan
    if(faoSliceHit(faoSliceZCached(mesh,Math.round(z*1000)/1000),cx,cy,hr+r))return (ps.length?ps[0]:top)+2;
    return z+2;
  }
  for(let zz=top;zz>z+1e-9;zz-=1){
    if(faoSliceHit(faoSliceZCached(mesh,zz),cx,cy,hr+r))return Math.min(top,zz+1)+2;
  }
  return z+2;
}
// Jeu latéral de l'hélice : le cercle de l'entrée reste à 2 mm de la face à
// usiner — la fraise ne la touche PAS au démarrage, l'hélice descend DANS LE
// VIDE puis les coupes prennent le relais. Sans ce jeu le disque était validé
// à marge = r exactement : bord de fraise tangent à la paroi (« on y rentre
// direct »).
const faoHelixJeu=2;
function faoHelixEntry(cx,cy,zFrom,zTo,radius,toolD){
  const drop=Math.max(0.5,(isFinite(+toolD)&&+toolD>0?+toolD:10)*0.1);
  const depth=Math.max(0.01,zFrom-zTo);
  const turns=Math.max(1,Math.ceil(depth/drop));
  const per=10, moves=[{r:1,x:cx+radius,y:cy,z:zFrom}];
  const total=turns*per;
  for(let i=1;i<=total;i++){
    const a=i/per*Math.PI*2;
    moves.push({r:0,ent:1,x:cx+radius*Math.cos(a),y:cy+radius*Math.sin(a),
      z:Math.round((zFrom-depth*i/total)*1000)/1000});
  }
  for(let i=1;i<=per;i++){ // tour de fond : palier propre
    const a=i/per*Math.PI*2;
    moves.push({r:0,ent:1,x:cx+radius*Math.cos(a),y:cy+radius*Math.sin(a),z:zTo});
  }
  return moves;
}
/* ----- ENTRÉE CIRCULAIRE (2026-10-08-004) : arc tangent à l'attaque -----
   u = direction de coupe en P, n = rot90(u). Côté CCW : centre C = P+ρn,
   départ S = C−ρu — l'arc G3 arrive en P tangent à u ; miroir (CW) pour
   l'autre côté. L'outil descend d'abord EN Z en S (dans la matière déjà
   enlevée : ancre), puis accoste en arc — jamais de plongée verticale dans
   la matière pleine. ρ = op.entryR (défaut Ø/4). */
function faoSidesCirc(Px,Py,ux,uy,rho){
  const L=Math.hypot(ux,uy);
  if(!(L>1e-9)||!(rho>1e-9))return null;
  ux/=L; uy/=L;
  const nx=-uy, ny=ux;
  return [
    {sx:Px+rho*nx-rho*ux, sy:Py+rho*ny-rho*uy, cx:Px+rho*nx, cy:Py+rho*ny, cw:false},
    {sx:Px-rho*nx-rho*ux, sy:Py-rho*ny-rho*uy, cx:Px-rho*nx, cy:Py-rho*ny, cw:true}
  ];
}
function faoCircArcPts(s,Px,Py){
  // Points (x,y) de l'arc S -> P (extrémités incluses), ~13 échantillons.
  const dx0=s.sx-s.cx, dy0=s.sy-s.cy, R=Math.hypot(dx0,dy0);
  if(!(R>1e-9))return null;
  const a0=Math.atan2(dy0,dx0), a1=Math.atan2(Py-s.cy,Px-s.cx);
  let da=a1-a0;
  if(s.cw){ if(da>0)da-=2*Math.PI; }else if(da<0)da+=2*Math.PI;
  const out=[];
  for(let k=0;k<=12;k++){
    const a=a0+da*k/12;
    out.push([s.cx+R*Math.cos(a), s.cy+R*Math.sin(a)]);
  }
  return out;
}
function faoCircAnchor(moves,Sx,Sy,z,D){
  // Matière déjà enlevée près de S : un tracé de coupe (jamais un rapide) à
  // cote ≤ z passe à ≤ D/2·0,98 de S — l'empreinte du disque outil couvre le
  // point de descente : la plongée verticale en S se fait dans le vide.
  // Coupe à cote ≤ z = niveau courant déjà attaqué (mini-passes : pelage du
  // niveau principal sous le plan mini-passe — matière ouverte sur place).
  const lim=(D/2)*0.98, lim2=lim*lim;
  const sd=function(ax,ay,bx,by){
    const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;
    let t=L2>0?((Sx-ax)*dx+(Sy-ay)*dy)/L2:0;
    if(t<0)t=0; else if(t>1)t=1;
    const qx=ax+t*dx-Sx, qy=ay+t*dy-Sy;
    return qx*qx+qy*qy;
  };
  const seg=function(a,b){
    if(a.z>z+1e-9||b.z>z+1e-9)return false;
    if(b.arc){
      const pts=faoArcSegs(a,b);
      if(pts&&pts.length){
        if(sd(a.x,a.y,pts[0][0],pts[0][1])<=lim2)return true;
        for(let k=1;k<pts.length;k++)
          if(sd(pts[k-1][0],pts[k-1][1],pts[k][0],pts[k][1])<=lim2)return true;
      }
      return sd(a.x,a.y,b.x,b.y)<=lim2;
    }
    return sd(a.x,a.y,b.x,b.y)<=lim2;
  };
  for(let i=1;i<moves.length;i++){
    const a=moves[i-1],b=moves[i];
    if(a.r||b.r)continue;
    if(seg(a,b))return true;
  }
  if(moves.length&&!moves[0].r&&moves[0].z<=z+1e-9){
    const qx=moves[0].x-Sx,qy=moves[0].y-Sy;
    if(qx*qx+qy*qy<=lim2)return true;
  }
  return false;
}
/* Index incrémental par tableau `moves` (2026-10-09-004) : les coupes
   émises ne font que GRANDIR (push) — les segments (arcs développés,
   zmax des extrémités) et les points !r sont indexés UNE fois ; chaque
   requête ne traite que la queue nouvelle puis ne lit que les cellules
   dans son rayon. Sur-ensemble exact des balayages O(n) historiques :
   mêmes tests, même sortie anticipée, même premier point — seul l'ordre
   de balayage change (cov = union, idempotent). */
const fmiCache=(typeof WeakMap!=='undefined')?new WeakMap():null;
const fmiSC=6, fmiPC=8; // cellules mm : segments / points
function fmiK(ix,iy){ return ix*262144+iy; } // |iy| < 262144 (coords ±1,5 M mm)
function fmiSeg(g,ax,ay,bx,by,zm){
  const c=fmiSC;
  const ix0=Math.floor((ax<bx?ax:bx)/c),ix1=Math.floor((ax<bx?bx:ax)/c);
  const iy0=Math.floor((ay<by?ay:by)/c),iy1=Math.floor((ay<by?by:ay)/c);
  if((ix1-ix0+1)*(iy1-iy0+1)>4096){g.osg.push([ax,ay,bx,by,zm]);return;}
  // bbox du segment : tête de cellule (4 nombres) = union des bboxes —
  // borne inférieure de la distance à tout segment de la cellule (seg ⊆
  // union) pour rejeter la cellule entière avant tout testSeg.
  const ux0=ax<bx?ax:bx,ux1=ax<bx?bx:ax,uy0=ay<by?ay:by,uy1=ay<by?by:ay;
  for(let iy=iy0;iy<=iy1;iy++)for(let ix=ix0;ix<=ix1;ix++){
    const k=fmiK(ix,iy);
    let arr=g.seg.get(k);
    if(!arr){arr=[ux0,uy0,ux1,uy1];g.seg.set(k,arr);}
    else{
      if(ux0<arr[0])arr[0]=ux0; if(uy0<arr[1])arr[1]=uy0;
      if(ux1>arr[2])arr[2]=ux1; if(uy1>arr[3])arr[3]=uy1;
    }
    arr.push(ax,ay,bx,by,zm); // aplati : 5 nombres par segment (décalé de 4)
  }
}
function fmiIdx(moves){
  if(!fmiCache)return null;
  let g=fmiCache.get(moves);
  if(!g){g={np:0,nq:0,seg:new Map(),pt:new Map(),osg:[],fst:null,fstD:0};fmiCache.set(moves,g);}
  const L=moves.length;
  if(globalThis.__st){const S=globalThis.__st;S.fi++;const old=g.np;S.npTail+=Math.max(0,(L>1?L-1:0)-old);}
  if(L&&!g.fstD){g.fstD=1;const m0=moves[0];
    g.fst=(m0.r||m0.x===undefined)?null:{x:m0.x,y:m0.y,z:m0.z};}
  for(let j=g.np;j<L-1;j++){
    const a=moves[j],b=moves[j+1];
    if(a.r||b.r)continue;
    const zm=a.z>b.z?a.z:b.z; // rejet original a.z>zz+1e-9||b.z>zz+1e-9 ⟺ zm>zz+1e-9
    if(b.arc){
      const pts=faoArcSegs(a,b);
      if(pts&&pts.length){
        let px=a.x,py=a.y;
        for(let k=0;k<pts.length;k++){fmiSeg(g,px,py,pts[k][0],pts[k][1],zm);px=pts[k][0];py=pts[k][1];}
      }else fmiSeg(g,a.x,a.y,b.x,b.y,zm); // repli corde (inchangé)
    }else fmiSeg(g,a.x,a.y,b.x,b.y,zm);
  }
  g.np=L>1?L-1:0;
  for(let i=g.nq;i<L;i++){
    const m=moves[i];
    if(!m.r&&m.x!==undefined){
      // 2026-10-09-004 : points TRIPT par tranche z µm — la requête
      // (|m.z-z|<1e-9) ne lit que les 3 tranches voisines (sur-ensemble
      // exact : deux valeurs à <1e-9 s'écartent d'au plus 1 en µm).
      const zk=Math.round(m.z*1e6);
      let zb=g.pt.get(zk); if(!zb){zb=new Map();g.pt.set(zk,zb);}
      const k=fmiK(Math.floor(m.x/fmiPC),Math.floor(m.y/fmiPC));
      let arr=zb.get(k); if(!arr){arr=[];zb.set(k,arr);}
      arr.push(m);
    }
  }
  g.nq=L;
  return g;
}
function faoPlungeClear(Sx,Sy,moves,z,D,airAt){
  if(globalThis.__st)globalThis.__st.pc++;
  // 2026-10-08-005 : la plongée en S exige la fraise TOTALEMENT hors matière
  // restante — le disque de rayon D/2 autour de S doit être entièrement balayé
  // par des coupes antérieures (empreinte de coupe à cote ≤ z) ou en air
  // (airAt : hors de la matière brute/poche/colonne). Échantillons : centre +
  // cercle D/2 échantillonné à ~1 mm (K ≈ π·D). Sinon : repli hélice/rampe —
  // jamais de plongée qui mord la matière restante. (L'ancre ponctuelle
  // 2026-10-08-004 est un cas particulier — centre couvert — remplacée ici.)
  // 2026-10-09-004 : interrogation via l'index incrémental fmi (même
  // sémantique, O(cellules proches) au lieu de O(tous les moves)).
  const R=D/2, lim=R+1e-9, lim2=lim*lim, near=(R+lim), near2=near*near;
  const K=Math.max(16,Math.min(64,Math.ceil(Math.PI*D)));
  const qx=[Sx],qy=[Sy];
  for(let k=0;k<K;k++){const a=k/K*2*Math.PI;qx.push(Sx+R*Math.cos(a));qy.push(Sy+R*Math.sin(a));}
  const cov=new Uint8Array(qx.length);
  let left=qx.length;
  const d2=function(ax,ay,bx,by,px,py){
    const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;
    let t=L2>0?((px-ax)*dx+(py-ay)*dy)/L2:0;
    if(t<0)t=0; else if(t>1)t=1;
    const ex=ax+t*dx-px, ey=ay+t*dy-py;
    return ex*ex+ey*ey;
  };
  // 2026-10-09-004 : boucle échantillons SIMPLE — la variante « cellules
  // indexées » (grille dense / Map) mesurée PLUS LENTE (mémoire dispersée,
  // 4 floors + clamp par appel ≈ 124 s supplémentaires sur 300 M testSeg).
  // Ici : rejet d'abord (d2 vers S), puis cov d'abord (Uint8Array L1) —
  // sortie immédiate dès left==0.
  const testSeg=function(ax,ay,bx,by){
    if(d2(ax,ay,bx,by,Sx,Sy)>near2)return;
    for(let k=0;k<qx.length&&left>0;k++){
      if(!cov[k]&&d2(ax,ay,bx,by,qx[k],qy[k])<=lim2){cov[k]=1;left--;}
    }
  };
  const g=fmiIdx(moves);
  if(g){
    const c=fmiSC;
    const ix0=Math.floor((Sx-near)/c),ix1=Math.floor((Sx+near)/c);
    const iy0=Math.floor((Sy-near)/c),iy1=Math.floor((Sy+near)/c);
    const cx=Math.floor(Sx/c),cy=Math.floor(Sy/c);
    const rMax=Math.max(cx-ix0,ix1-cx,cy-iy0,iy1-cy);
    // 2026-10-09-004 : scan en COURONNES autour du puits (les cellules
    // proches couvrent d'abord le centre → left tombe plus vite) + rejet
    // de cellule entière si la union des bboxes est à > near de S (tous
    // ses segments échoueraient au testSeg premier). Ordre sans effet
    // sémantique (cov = union idempotente, sortie identique à left==0).
    for(let ring=0;ring<=rMax&&left>0;ring++){
      const b0x=cx-ring<ix0?ix0:cx-ring, b1x=cx+ring>ix1?ix1:cx+ring;
      const b0y=cy-ring<iy0?iy0:cy-ring, b1y=cy+ring>iy1?iy1:cy+ring;
      for(let iy=b0y;iy<=b1y&&left>0;iy++)for(let ix=b0x;ix<=b1x&&left>0;ix++){
        const dx=ix>cx?ix-cx:cx-ix, dy=iy>cy?iy-cy:cy-iy;
        if((dx>dy?dx:dy)!==ring)continue;
        const arr=g.seg.get(fmiK(ix,iy)); if(!arr)continue;
        const qx=Sx<arr[0]?arr[0]-Sx:(Sx>arr[2]?Sx-arr[2]:0);
        const qy=Sy<arr[1]?arr[1]-Sy:(Sy>arr[3]?Sy-arr[3]:0);
        if(qx*qx+qy*qy>near2)continue; // union > near ⟹ tout seg > near
        for(let t=4;t<arr.length&&left>0;t+=5){
          if(arr[t+4]>z+1e-9)continue; // a.z>z+1e-9||b.z>z+1e-9 ⟺ max>z+1e-9
          testSeg(arr[t],arr[t+1],arr[t+2],arr[t+3]);
        }
      }
    }
    if(left>0)for(let t=0;t<g.osg.length&&left>0;t++){
      const s=g.osg[t];
      if(s[4]>z+1e-9)continue;
      testSeg(s[0],s[1],s[2],s[3]);
    }
    if(left>0&&g.fst&&g.fst.z<=z+1e-9)testSeg(g.fst.x,g.fst.y,g.fst.x,g.fst.y);
  }else{
    for(let i=1;i<moves.length&&left>0;i++){
      const a=moves[i-1],b=moves[i];
      if(a.r||b.r)continue;
      if(a.z>z+1e-9||b.z>z+1e-9)continue;
      if(b.arc){
        const pts=faoArcSegs(a,b);
        if(pts&&pts.length){
          let px=a.x,py=a.y;
          for(let k=0;k<pts.length;k++){testSeg(px,py,pts[k][0],pts[k][1]);px=pts[k][0];py=pts[k][1];}
        }else testSeg(a.x,a.y,b.x,b.y);
      }else testSeg(a.x,a.y,b.x,b.y);
    }
    if(moves.length&&!moves[0].r&&moves[0].z<=z+1e-9)testSeg(moves[0].x,moves[0].y,moves[0].x,moves[0].y);
  }
  for(let k=0;k<qx.length;k++)if(!cov[k]&&!(airAt&&airAt(qx[k],qy[k])))return false;
  return true;
}
function faoCircRhos(D,ae,entryR){
  // Candidats de rayon (croissants, 2026-10-08-005) : le rayon demandé
  // (entryR, défaut Ø/4), puis Ø/2, le pas ae et Ø — un rayon plus large
  // recule le point de plongée S dans la zone déjà usinée pour que le disque
  // entier de la fraise y trouve de l'air. Premier candidat faisant passer
  // toutes les conditions (S, arc, disque) gagne ; sinon repli hélice/rampe.
  // 2026-10-08-009 (constat) : les ρ plus petits (D/16, D/10, D/6) testés en
  // tête n'ont rien amélioré — aux positions de ré-entrée, l'ancre sort de la
  // région à tout ρ ≥ D/4, et aux ρ serrés l'arc traverserait la matière
  // (okA=false). Les 3 hélices de ces couches (pôle + 2 points d'attaque)
  // sont GÉOMÉTRIQUEMENT NÉCESSAIRES pour ne jamais plonger à plat ; elles
  // sont conservées telles quelles (cf. tests 007 : 0 plongée non couverte).
  const r0=(isFinite(+entryR)&&+entryR>0)?+entryR:+(D/4).toFixed(2);
  const out=[];
  const add=function(v){ if(v>1e-9&&!out.some(function(w){return Math.abs(w-v)<1e-9;}))out.push(v); };
  add(r0); add(D/2); add(isFinite(+ae)&&+ae>0?+ae:0); add(D);
  out.sort(function(a,b){return a-b;});
  return out;
}
function faoCircEval(Px,Py,ux,uy,rho,valid,moves,z,D,needAnchor,airAt){
  // Premier côté PASSANT : S légal, arc entier légal. `rho` peut être une
  // liste de rayons croissants (faoCircRhos — 2026-10-08-005).
  // 2026-10-08-010 : ancre = test PONCTUEL (air ou déjà-usiné) + non pas
  // disque entier — l'entrée est TANGENTIELLE (on arrive latéralement par
  // l'arc, pas en plongée verticale) : il suffit que le centre de S soit
  // dans un zone déjà ouverte. `needAnchor===false` (contour externe) :
  // S tombe déjà à ≥ r hors pièce, tout le disque est dans l'air.
  const RH=Array.isArray(rho)?rho:[rho];
  for(let ri=0;ri<RH.length;ri++){
    const sides=faoSidesCirc(Px,Py,ux,uy,RH[ri]);
    if(!sides)continue;
    for(let i=0;i<sides.length;i++){
      const s=sides[i];
      if(!valid(s.sx,s.sy))continue;
      const pts=faoCircArcPts(s,Px,Py);
      if(!pts)continue;
      let ok=true;
      for(let k=0;k<pts.length;k++)if(!valid(pts[k][0],pts[k][1])){ok=false;break;}
      if(!ok)continue;
      if(needAnchor!==false&&!airAt(s.sx,s.sy)&&!faoCircAnchor(moves,s.sx,s.sy,z,D))continue;
      return s;
    }
  }
  return null;
}
/* ----- ESCARGOT (2026-10-07-005) : pelage en spirale centre -> faces -----
   Le niveau part du CENTRE de la région (bbox des intervalles d'ombre du
   niveau — au mieux le centre de la pièce) et s'en éloigne en spirale
   ARCHIMÉDIEN : chaque tour gagne `ae` en rayon (le stepover = distance
   entre deux tours), jusqu'aux faces — le tour extérieur s'arrête à
   r = D/2 + Parois des parois (mêmes intervalles d'ombre que le
   conventionnel : ni gouge, même laisse, « finir au mieux » au mur).
   Le polygone de la région n'est jamais construit : chaque échantillon est
   testé par faoShadowIntervals (colonne atteignable depuis le dessus,
   matière dilatée de r) — un passage hors région est simplement sauté
   (rapide + ré-entrée), un passage dedans est coupé en G1 ; la liaison
   directe est validée par segClear (repli = ré-entrée).
    Toute ENTRÉE en matière descend en HÉLICE (obligation « 1re face », utile
    à tous les niveaux) — 008 : sauf entrée CIRCULAIRE, où l'hélice se fait
    sur l'ANCRE de l'arc (pass 2) puis l'arc tangent accoste le tracé ;
    même spot, même plancher hFloor = min(secu, zFrom+2) et faoHelixEntry
    qu'en conventionnel ; repli plongée sûre uniquement si aucun rayon
    d'hélice ne passe (colonne d'ombre garantie).
   Mini-passes et finition : inchangées (ringOnly conventionnel).
   */
function faoSpiralLevel(mesh,B,z,D,r,secu,zFrom,ae,entryMode,brutTop,zt,moves,opt){
  const segs=faoSliceZCached(mesh,z);
  const top=isFinite(+zt)?+zt:z;
  const aeA=Math.max(0.5,Math.min(isFinite(+ae)&&+ae>0?+ae:D*0.2,D*0.25));
  // 2026-10-14-005 : GLISSEMENT (liaison G1 à la cote) SEULEMENT pour passer
  // à la passe voisine — longueur <= 1,5 × pas latéral (demande : « je ne
  // veux des glissements que quand on change d'un pas. Après c'est du
  // rapide ! Sinon, on fait des traces involontaires »). Au-delà : lever +
  // rapide + entrée (remplace la règle des 30 mm, faoRapideMin).
  const linkMax=Math.max(0.5,1.5*Math.max(aeA,isFinite(+ae)&&+ae>0?+ae:D*0.5)); // escargot : pas = pas de spirale
  const linkNear=function(ax,ay,bx,by){const dx=bx-ax,dy=by-ay;return dx*dx+dy*dy<=linkMax*linkMax+1e-9;};
  const planes=faoShadowPlanes(mesh,z,Math.max(top,isFinite(+brutTop)?+brutTop:z));
  let segsAll=segs.slice();
  for(let pi=0;pi<planes.length;pi++){
    if(planes[pi]>z+1e-9)segsAll=segsAll.concat(faoSliceZCached(mesh,planes[pi]));
  }
  const rnd=function(v){return Math.round(v*1000)/1000;};
  const tz=(opt&&isFinite(+opt.travelZ))?Math.min(secu,+opt.travelZ):null;
  // 2026-10-10-004 : limite d'op injectée EN GÉNÉRATION (comme le conventionnel
  // Fix 2) — toute coupe (spirale, masque, liaisons de coupe) exige d'être dans
  // la zone de la chaîne d'arêtes sélectionnée ; les rapides (pathOK) traversent
  // librement, comme au conventionnel.
  const zoneAt=(opt&&typeof opt.zoneAt==='function')?opt.zoneAt:null;
  const pitch=Math.max(0.1,isFinite(+ae)&&+ae>0?+ae:D*0.5);
  // --- ZONE DU NIVEAU (retour 1/3) : le centre doit être le POLE
  // d'inaccessibilité des cases usinables (case légale la plus loin d'une
  // case illégale), pas le centre de la bbox des intervalles — sur une pièce
  // à poche décalée la bbox tombe au centre de la BOÎTE, hors zone, et la
  // 1re coupe se pique contre un bord de face (mesuré : 20,85 mm du centre de
  // zone). Cases = même membership que la spirale, transformée de distance
  // chanfrein 2 passes (distance aux cases illégales + au bord de boîte).
  const S=faoShadowShape(mesh,planes,B,r,aeA);
  const rrM=Math.max(0.01,r-0.005);
  // 008 : bbox 2D de la pièce — ancre d'arc hors silhouette = pas de hélice
  // (les chaînes du cadre E0 en marge entreraient par un ressort dans l'air).
  const mBB=[1/0,1/0,-1/0,-1/0];
  for(let vi=0;vi<mesh.v.length;vi++){const vv=mesh.v[vi];
    if(vv[0]<mBB[0])mBB[0]=vv[0]; if(vv[1]<mBB[1])mBB[1]=vv[1];
    if(vv[0]>mBB[2])mBB[2]=vv[0]; if(vv[1]>mBB[3])mBB[3]=vv[1];}
  const insideSil=function(x,y){return x>=mBB[0]-1e-9&&x<=mBB[2]+1e-9&&y>=mBB[1]-1e-9&&y<=mBB[3]+1e-9;};
  const inside=function(x,y){return faoShapeValid(S,x,y,rrM)&&(!zoneAt||zoneAt(x,y));};
  const gx0=S.rect[0],gy0=S.rect[1];
  const extX=S.rect[2]-S.rect[0],extY=S.rect[3]-S.rect[1];
  if(!(extX>0&&extY>0))return;
  let h=Math.min(1.5,Math.max(0.5,pitch*0.25));
  h=Math.max(h,Math.max(extX,extY)/400); // garde-fou : <= 401² cases
  const nx=Math.max(2,Math.floor(extX/h)+1),ny=Math.max(2,Math.floor(extY/h)+1);
  const mask=new Uint8Array(nx*ny);
  let rx0=1/0,rx1=-1/0,ry0=1/0,ry1=-1/0,nL=0;
  for(let j=0;j<ny;j++){
    const y=gy0+j*h;
    for(let i=0;i<nx;i++){
      const x=gx0+i*h;
      if(!faoShapeValid(S,x,y,rrM)||(zoneAt&&!zoneAt(x,y)))continue;
      mask[j*nx+i]=1;nL++;
      if(x<rx0)rx0=x; if(x>rx1)rx1=x;
      if(y<ry0)ry0=y; if(y>ry1)ry1=y;
    }
  }
  if(!nL)return;
  const D1=1,D2=Math.SQRT2,INF=1e18;
  const dist=new Float64Array(nx*ny);
  for(let p=0;p<nx*ny;p++)dist[p]=mask[p]?INF:0;
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
    const p=j*nx+i;let d=dist[p];
    if(i>0)d=Math.min(d,dist[p-1]+D1);
    if(j>0)d=Math.min(d,dist[p-nx]+D1);
    if(i>0&&j>0)d=Math.min(d,dist[p-nx-1]+D2);
    if(i<nx-1&&j>0)d=Math.min(d,dist[p-nx+1]+D2);
    dist[p]=d;
  }
  for(let j=ny-1;j>=0;j--)for(let i=nx-1;i>=0;i--){
    const p=j*nx+i;let d=dist[p];
    if(i<nx-1)d=Math.min(d,dist[p+1]+D1);
    if(j<ny-1)d=Math.min(d,dist[p+nx]+D1);
    if(i<nx-1&&j<ny-1)d=Math.min(d,dist[p+nx+1]+D2);
    if(i>0&&j<ny-1)d=Math.min(d,dist[p+nx-1]+D2);
    dist[p]=d;
  }
  // pôle : case la plus éloignée ; le maximum est souvent un PLATEAU de
  // cases égales (rectangle érodé) — moyenne des cases liées, sinon la
  // première case du balayage (coin haut-gauche du plateau) décale le centre.
  let bd=-1,pxs=0,pys=0,nPk=0;
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
    const p=j*nx+i;
    if(!mask[p])continue;
    // distance au bord de boîte (cases) : un niveau sans aucune matière illé-
    // gale (poche entièrement ouverte) prend le CENTRE de la zone, pas un coin.
    const sc=Math.min(dist[p],Math.min(i,nx-1-i,j,ny-1-j));
    if(sc>bd+1e-9){bd=sc;pxs=i;pys=j;nPk=1;}
    else if(sc>=bd-1e-9){pxs+=i;pys+=j;nPk++;}
  }
  const cxP=gx0+(pxs/nPk)*h, cyP=gy0+(pys/nPk)*h;
  // 2026-10-10-004 (demande « l'entrée des 1ères passes doit se trouver au
  // centre de la pièce sauf, vraiment, si pas de place ») : le CENTRE
  // GÉOMÉTRIQUE du solide (mBB — le centre du maillage, pas le pôle) devient
  // le centre de la spirale, donc le point d'attaque (hélice/plongée/arc) de
  // CHAQUE passe — il coïncide avec le 1er échantillon R=0 de la spirale.
  // « Pas de place » = centre illégal : hors zone, contre une paroi (marge
  // outil rrM) ou hors l'étendue du masque — alors on garde le pôle
  // d'inaccessibilité (case légale la plus éloignée des murs), comportement
  // antérieur. Le reste (Rmax/Rcent/clearArcs) suit le centre choisi.
  const gcx=(mBB[0]+mBB[2])/2, gcy=(mBB[1]+mBB[3])/2;
  const gcOK=inside(gcx,gcy)&&gcx>=rx0&&gcx<=rx1&&gcy>=ry0&&gcy<=ry1;
  const cx=gcOK?gcx:cxP, cy=gcOK?gcy:cyP;
  const Rmax=Math.max(
    Math.hypot(rx0-cx,ry0-cy),Math.hypot(rx1-cx,ry0-cy),
    Math.hypot(rx0-cx,ry1-cy),Math.hypot(rx1-cx,ry1-cy))+2*pitch;
  // 2026-10-10-004 (un côté puis l'autre) : la spirale n'ouvre plus que le
  // centre jusqu'aux MURS PROCHES (rayon = distance du centre au bord de
  // région le plus proche), pas jusqu'à Rmax. La matière restante (les
  // extrémités le long de l'axe long) est éclaircie ensuite par clearArcs
  // (demi-anneaux circulaires par côté — 2026-10-11-001).
  const Rcent=Math.min(cx-rx0,rx1-cx,cy-ry0,ry1-cy)+pitch;
  // --- liaisons (copie conventionnelle) : G1 sûre ou translation à vide
  const zTopSafe=Math.max(top,isFinite(+brutTop)?+brutTop:top);
  // 2026-10-21-010 : BRUT = CORPS — hors de la zone usinable de ce niveau
  // (faces rouges, zone, brut non atteint), la matière du brut peut rester
  // au-dessus de tz : un trajet qui la croise passe par le dégagement.
  const sTop=(opt&&typeof opt.stockTop==='function')?opt.stockTop:null;
  // 2026-10-21-012 : MATIÈRE RESTANTE connue (brut-corps / rouge) — le départ des
  // entrées descend à 1 mm au-dessus de la matière réelle (plus du dessus de la
  // BOÎTE) et la descente dans le vide se fait en rapide (2 m de plongée lente
  // dans l'air sur Malaxeur Retard). Sans carte : comportement historique.
  const remTop=(opt&&typeof opt.remTopAt==='function')?opt.remTopAt:null;
  const remAdj=function(x,y,h){if(!remTop)return h;const t=remTop(x,y);return t>-1/0?Math.min(h,Math.max(t+1,z)):Math.min(h,z+1);};
  const descend=function(x,y,zFrom,zTo){
    if(Math.abs(zFrom-zTo)<=1e-9)return;
    const fast=!!(remTop&&zTo<zFrom&&!(remTop(x,y)>zTo-0.5));
    moves.push(fast?{r:1,x:rnd(x),y:rnd(y),z:zTo}:{r:0,x:rnd(x),y:rnd(y),z:zTo});
  };
  const stockBlock=function(p,q){
    if(!sTop||!zoneAt||!tz)return false;
    const dx=q.x-p.x,dy=q.y-p.y,L=Math.sqrt(dx*dx+dy*dy),n=Math.max(1,Math.ceil(L));
    for(let i=0;i<=n;i++){const t=i/n,x=p.x+dx*t,y=p.y+dy*t;if(!zoneAt(x,y)&&sTop(x,y)>tz-0.5)return true;}
    return false;
  };
  const pathOK=function(p,q){
    if(tz&&tz>=zTopSafe-1e-9)return true;
    const dx=q.x-p.x,dy=q.y-p.y,L=Math.sqrt(dx*dx+dy*dy);
    const n=Math.max(1,Math.ceil(L));
    const rr=Math.max(0.01,r-1e-3);
    for(let i=0;i<=n;i++){
      const t=i/n;
      // parité + disque : un segment droit traversant une bande matière LARGE
      // (≥ r de chaque bord) restait « sûr » à faoDiscClear seul.
      if(!faoShapeValid(S,p.x+dx*t,p.y+dy*t,rr))return false;
    }
    return true;
  };
  // 2026-10-11-001 (demande) : liaison entre passes NON continues ni
  // tangentes = rapide à +5 mm au-dessus du plan de travail actif (tz =
  // bande+5), JAMAIS le plan de retrait sauf nécessité de dégagement :
  // hauteur de matière le long du chemin (même modèle que faoHelixSpot —
  // le maillage = vérité pièce, le brut restant est couvert par tz) bornée
  // par secu. Échantillonnage ≤ 2 mm, disque de rayon r+1 à chaque
  // échantillon (couvre l'écart) ; colonne vide → z+2 → max(tz,…) = tz.
  const pathMatTop=function(p,q){
    if(!mesh||!mesh.v||!planes||!planes.length)return null;
    const dx=q.x-p.x,dy=q.y-p.y,L=Math.sqrt(dx*dx+dy*dy);
    const n=Math.min(512,Math.max(1,Math.ceil(L/2)));
    const effR=r+1;
    let top=z+2;
    for(let i=0;i<=n;i++){
      const t=i/n;
      const sp=faoHelixSpot(mesh,p.x+dx*t,p.y+dy*t,0,effR,z,brutTop,planes);
      if(sp>top)top=sp;
    }
    return top+3; // faoHelixSpot = matière+2 → +5 total
  };
  const gotoXY=function(px,py){
    px=rnd(px); py=rnd(py);
    if(!moves.length){moves.push({r:1,x:px,y:py,z:secu});return secu;}
    const prev=moves[moves.length-1];
    let zGo=secu;
    if(tz&&((opt&&opt.remBlocked&&opt.remBlocked(prev,{x:px,y:py},tz))||stockBlock(prev,{x:px,y:py}))){
      zGo=secu; // 2026-10-21-010 : brut-corps resté hors zone au-dessus de tz
    }else if(tz&&pathOK(prev,{x:px,y:py})){
      zGo=tz;
    }else if(tz){
      const zN=pathMatTop(prev,{x:px,y:py});
      zGo=(zN!==null)?Math.max(tz,Math.min(secu,zN)):secu;
    }
    if(Math.abs(prev.z-zGo)>1e-9)moves.push({r:1,x:prev.x,y:prev.y,z:zGo});
    moves.push({r:1,x:px,y:py,z:zGo});
    return zGo;
  };
  const rrSafe=Math.max(0.01,r-0.005);
  const segClear=function(ax,ay,bx,by){
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
  // 011 : VIDE D'ABORD — vraie coupe déjà émise à cote z dans CE niveau (le
  // tableau moves est partagé entre niveaux : le drapeau est local à
  // faoSpiralLevel). Tant qu'il est faux (1re attaque du niveau), rien n'a
  // encore été balayé à cette cote : inutile de chercher du vide.
  let sweptNow=false;
  const pushCut=function(x,y){
    const nx=rnd(x),ny=rnd(y),prev=moves[moves.length-1];
    if(prev&&!prev.r&&Math.abs(prev.x-nx)<1e-9&&Math.abs(prev.y-ny)<1e-9)return;
    moves.push({r:0,x:nx,y:ny,z:z});
    sweptNow=true;
  };
  // --- ENTRÉE HÉLICE (obligation 1re face) : spot = 2 mm au-dessus de la
  // matière restante sous le disque, plancher hFloor = min(secu, zFrom+2)
  // (le maillage ne voit ni le brut ni les passes précédentes).
  const hFloor=Math.min(secu,zFrom+2);
  const pickHr=function(x,y){
    const cands=[D*0.4,D*0.2,1,0.5];
    for(let i=0;i<cands.length;i++){
      const hr=cands[i];
      if(!(hr>=0.5))continue;
      if(faoDiscClear(segsAll,x,y,hr,r+faoHelixJeu)||faoDiscClear(segsAll,x,y,hr,r))return hr;
    }
    return 0; // aucun rayon : plongée sûre (colonne d'ombre garantie par le membership)
  };
  // 008 : orbite légale (8 points dans la région) autour d'un point quelconque.
  const okOrbPt=function(px,py,h){
    for(let k=0;k<8;k++){const a=k/8*2*Math.PI;if(!inside(px+h*Math.cos(a),py+h*Math.sin(a)))return false;}
    return true;
  };
  // 2026-10-08-007 : air = hors du BRUT (la boîte de stock), plus « hors de la
  // pièce » — pendant l'ébauche le vide de poche (et l'extérieur d'un bossage)
  // n'est PAS de l'air, c'est du brut à enlever : `!faoShapeInside` acceptait
  // des ancres/plongées au cœur du brut non usiné (« fraise à cheval après la
  // spirale »). Hors boîte = seul endroit réellement vide.
  const airSp=function(x,y){
    return x<B.x0-1e-9||x>B.x1+1e-9||y<B.y0-1e-9||y>B.y1+1e-9;
  };
  // 2026-10-22-003 : ENTRÉE PAR L'EXTÉRIEUR (« quand on peut rentrer par
  // l'extérieur, en cercle à plat, c'est préférable à l'hélice ») — brut-corps
  // ou faces rouges : la carte de matière restante dit si le disque d'outil
  // est hors matière à cette cote ; on y descend alors en rapide jusqu'à
  // 1 mm, puis à plat, et l'arc tangent entre dans la matière. Sans carte :
  // inchangé (plongée seulement sur du déjà-balayé ou hors de la boîte).
  const remPt=(opt&&typeof opt.remPtAt==='function')?opt.remPtAt:null;
  const airHere=function(x,y){return !!(remPt&&remPt(x,y)<=z+1e-6);};
  const plungeOK=function(x,y){return airHere(x,y)||faoPlungeClear(x,y,moves,z,D,airSp);};
  const zoneSafeL=(opt&&typeof opt.zoneSafe==='function')?opt.zoneSafe:null;
  const airIn=function(x,y){return faoShapeValid(S,x,y,rrM)&&(zoneSafeL?zoneSafeL(x,y):(!zoneAt||zoneAt(x,y)));};
  const segAir=function(ax,ay,bx,by){
    const L=Math.hypot(bx-ax,by-ay),n=Math.max(1,Math.ceil(L/0.25));
    for(let i=0;i<=n;i++){const t=i/n,qx=ax+(bx-ax)*t,qy=ay+(by-ay)*t;
      if(!faoShapeValid(S,qx,qy,rrSafe))return false;
      if(airHere(qx,qy)){if(zoneSafeL&&!zoneSafeL(qx,qy))return false;}
      else if(zoneAt&&!zoneAt(qx,qy))return false;}
    return true;
  };
  const dropAir=function(x,y,zG){
    if(airHere(x,y)&&zG>z+1+1e-9)moves.push({r:1,x:rnd(x),y:rnd(y),z:rnd(z+1)});
  };
  // 011 : VIDE D'ABORD (feedback « après la spirale tu rentres en pleine
  // matière en rampe circulaire alors qu'il y a plein de vide avant ») —
  // après la spirale tout le plancher du niveau est du vide : avant toute
  // hélice/rampe en matière, on cherche un point Q à portée de la cible où
  // le disque D/2 est ENTIÈREMENT balayé (ou en air), ON Y PLONGE À PLAT
  // (sûr par construction : faoPlungeClear, test 007), puis on accoste la
  // cible à cote z (liaison latérale à travers le déjà-usiné, centre
  // toujours dans la région = aucun gouge). L'entrée circulaire (arc
  // tangent) vient ensuite, depuis le vide. Rejeté si le vide n'est pas
  // joignable à cote (mur entre Q et la cible = gouge) : repli hélice /
  // rampe inchangé (marge E0, 1re attaque).
  const voidWay=function(tx,ty){
    if(!sweptNow&&!remPt)return null;
    const step=Math.max(2,D*0.12),Rmax=Math.min(45,Math.max(18,D*1.6));
    const maxK=Math.ceil(Rmax/step);
    for(let k=1;k<=maxK;k++){
      const rad=k*step;
      const n=Math.max(6,Math.ceil(2*Math.PI*rad/step));
      for(let j=0;j<n;j++){
        const a=j/n*2*Math.PI;
        const qx=tx+rad*Math.cos(a),qy=ty+rad*Math.sin(a);
        // 2026-10-22-003 : Q dans l'AIR (hors brut-corps) — admis hors de la
        // zone « avec brut » (zoneSafe : limite + rouge seulement)
        const qa=airHere(qx,qy);
        if(qa){if(!airIn(qx,qy)||!segAir(qx,qy,tx,ty))continue;}
        else{if(!inside(qx,qy))continue;
          if(!segClear(qx,qy,tx,ty))continue;
          if(!plungeOK(qx,qy))continue;}
        return {x:qx,y:qy};
      }
    }
    return null;
  };
  // 011 : arrivée sur le vide — rapide en hauteur au-dessus de Q puis
  // PLONGÉE À PLAT sur Q (disque clair par construction de voidWay).
  // 10-09-002 : lever + rapide (« au plus vite en l'air ») SAUF liaison
  // courte (< faoRapideMin) et sûre : G1 à plat dans le vide (sauter pour
  // un hop de quelques centimètres à chaque anneau, c'est n'importe quoi).
  const arriveVoid=function(qx,qy){
    const prev=moves.length?moves[moves.length-1]:null;
    const ddx=qx-(prev?prev.x:0), ddy=qy-(prev?prev.y:0);
    if(prev&&!prev.r&&Math.abs(prev.z-z)<1e-9&&
       ddx*ddx+ddy*ddy<linkMax*linkMax&&
       (segClear(prev.x,prev.y,qx,qy)||(remPt&&segAir(prev.x,prev.y,qx,qy)))){ pushCut(qx,qy); return; }
    const zG=gotoXY(qx,qy);
    dropAir(qx,qy,zG);
    if(Math.abs(zG-z)>1e-9)moves.push({r:0,ent:1,x:rnd(qx),y:rnd(qy),z:z});
  };
  // 2026-10-10-001 (retour « je ne vois aucune entrée en cercles tangents ») :
  // ARC CONCAVE SÛR en tête de l'entrée escargot — même règle que arcEnter
  // (adaptatif) : ancre ET chaque point de l'arc (centre outil suivi) à
  // >= rrM de l'ombre (inside), accès par accostage de coupe / plongée 007 /
  // vide 011 / hélice 008 sur l'ancre, puis MÊME arc tangent vers l'intérieur.
  // false = cascade sûre de entryTo (plongée/vide/hélice sur la cible, rampe
  // de l'appelant). Aucune morsure de paroi : le croissant est refusé par
  // inside (le gouge 006 venait du passe-droit insideSil).
  const rhoCircS=faoCircRhos(D,ae,(opt&&opt.entryR));
  const arcEntry=function(x,y,ux,uy){
    if(!(ux*ux+uy*uy>1e-12))return false;
    const emitArc=function(s){
      moves.push({r:0,ent:1,x:rnd(x),y:rnd(y),z:z,
        arc:{i:s.cx-s.sx,j:s.cy-s.sy,cw:s.cw}});
    };
    for(let ri=0;ri<rhoCircS.length;ri++){
      const sides=faoSidesCirc(x,y,ux,uy,rhoCircS[ri]);
      if(!sides)continue;
      for(let i=0;i<sides.length;i++){
        const s=sides[i];
        if(!inside(s.sx,s.sy))continue;
        const pts2=faoCircArcPts(s,x,y);
        if(!pts2)continue;
        let okA=true;
        for(let k=0;k<pts2.length;k++)if(!inside(pts2[k][0],pts2[k][1])){okA=false;break;}
        if(!okA)continue;
        const prev=moves.length?moves[moves.length-1]:null;
        const atZ=!!(prev&&!prev.r&&Math.abs(prev.z-z)<1e-9);
        // (1) déjà à la cote : accostage de coupe jusqu'à l'ancre, puis arc.
        if(atZ&&linkNear(prev.x,prev.y,s.sx,s.sy)&&segClear(prev.x,prev.y,s.sx,s.sy)){ pushCut(s.sx,s.sy); emitArc(s); return true; }
        // (2) plongée sûre sur l'ancre (007 : disque déjà balayé/en air).
        if(plungeOK(s.sx,s.sy)){
          const zG=gotoXY(s.sx,s.sy);
          dropAir(s.sx,s.sy,zG);
          if(Math.abs(zG-z)>1e-9)moves.push({r:0,ent:1,x:rnd(s.sx),y:rnd(s.sy),z:z});
          emitArc(s);
          return true;
        }
        // (3) vide d'abord (011) : plongée plate sur Q, accostage, arc.
        if(sweptNow||remPt){
          const Qs=voidWay(s.sx,s.sy);
          if(Qs){ arriveVoid(Qs.x,Qs.y); pushCut(s.sx,s.sy); emitArc(s); return true; }
        }
        // (4) hélice à orbite légale sur l'ancre (008) — émission seulement
        // si le spot est légal (aucun rapide orphelin si l'appelant rampe).
        if(!insideSil(s.sx,s.sy))continue;
        const hr=pickHr(s.sx,s.sy);
        let hUse=hr;
        if(!(hUse>0)){
          hUse=Math.max(1,D*0.2);
          while(hUse>0.5&&!okOrbPt(s.sx,s.sy,hUse))hUse-=0.5;
          if(!(hUse>0.5&&okOrbPt(s.sx,s.sy,hUse)))continue;
        }
        const zG2=gotoXY(s.sx,s.sy);
        const hS=remAdj(s.sx,s.sy,Math.max(faoHelixSpot(mesh,s.sx,s.sy,hUse,r,z,brutTop,planes),hFloor));
        descend(s.sx,s.sy,zG2,hS);
        faoHelixEntry(s.sx,s.sy,hS,z,hUse,D).slice(1).forEach(function(m){moves.push(m);});
        pushCut(s.sx,s.sy);
        emitArc(s);
        return true;
      }
    }
    return false;
  };
  // 007 : hauteur de départ communiquée au RAMPAGE quand entryTo renvoie false.
  let rampZ0=0;
  const entryTo=function(x,y,ux,uy){
    // 2026-10-10-001 (retour cercles tangents) : ARC CONCAVE SÛR D'ABORD
    // (arcEntry — ancre/points >= rrM de l'ombre, accès sûrs 007/011/008) ;
    // la cascade sûre historique reste le repli : plongée 007 sur la cible /
    // vide 011 / hélice à orbite légale / repli RAMPE le long du chemin
    // (descente en avançant, jamais à plat sur du brut restant). renvoie
    // true = entrée sûre émise ; false = l'APPELANT RAMPE (rampZ0 = hauteur
    // déjà émise).
    if(arcEntry(x,y,ux,uy))return true;
    // 011 : VIDE D'ABORD (repli générique — auto, ou circ sans ancre) — le
    // disque de la cible est déjà entièrement balayé ou en air : plongée à
    // plat directement, AVANT toute hélice. Après la spirale le plancher du
    // niveau est du vide partout : une hélice ici serait exactement le
    // « rampe circulaire en pleine matière » du feedback.
    if(plungeOK(x,y)){
      const zG=gotoXY(x,y);
      dropAir(x,y,zG);
      if(Math.abs(zG-z)>1e-9)moves.push({r:0,ent:1,x:rnd(x),y:rnd(y),z:z});
      pushCut(x,y);
      return true;
    }
    // 011 : sinon le vide est peut-être joignable À CÔTÉ : Q où le disque est
    // clair, plongée plate sur Q, puis accoste la cible à cote z.
    const Qw=voidWay(x,y);
    if(Qw){
      arriveVoid(Qw.x,Qw.y);
      pushCut(x,y);
      return true;
    }
    // 008 : hélice de descente au point d'attaque UNIQUEMENT dans la
    // silhouette de la pièce (centre de poche : direction dégénérée au pôle,
    // pas d'arc possible) — hors silhouette (cadre E0, marge) : aucun
    // ressort dans l'air, l'appelant ramp le long du chemin.
    const zG=gotoXY(x,y);
    if(insideSil(x,y)){
      const hr=pickHr(x,y);
      const hStart=remAdj(x,y,Math.max(faoHelixSpot(mesh,x,y,hr>0?hr:0,r,z,brutTop,planes),hFloor));
      descend(x,y,zG,hStart);
      if(hr>0){
        faoHelixEntry(x,y,hStart,z,hr,D).slice(1).forEach(function(m){moves.push(m);});
        pushCut(x,y);
        return true;
      }
      let hrF=Math.max(1,D*0.2);
      while(hrF>0.5&&!okOrbPt(x,y,hrF))hrF-=0.5;
      if(hrF>0.5&&okOrbPt(x,y,hrF)){
        faoHelixEntry(x,y,hStart,z,hrF,D).slice(1).forEach(function(m){moves.push(m);});
        pushCut(x,y);
        return true;
      }
    }
    const hStart2=remAdj(x,y,Math.max(faoHelixSpot(mesh,x,y,0,r,z,brutTop,planes),hFloor));
    descend(x,y,zG,hStart2);
    rampZ0=hStart2; // l'air vers hStart2 est déjà émis : le rampage continue à z
    return false;
  };
  // --- spirale : R(θ) = pitch·θ/2π, échantillonnage à corde s (borné),
  // pas angulaire borné à π/6 près du centre.
  const s=Math.max(0.5,Math.min(Math.max(pitch,D*0.25),D*0.5));
  const thMax=2*Math.PI*(Math.ceil(Rcent/pitch)+1);
  let th=0,guard=0,atCut=false,prevIn=false,px=cx,py=cy;
  // 007 : descente répartie le long de la spirale (rampL>0 = rampage actif)
  let rampL=0,rampK=0,rampTot=0;
  // 2026-10-21-004 : FIN DE RAMPAGE ANTICIPÉE — un rampage ne continue QUE
  // vers un point CONTIGU (échantillon précédent légal) et dégagé (segClear).
  // Avant : après un trou (la spirale / le demi-anneau passe sous la pièce,
  // hors zone légale) le rampage reliait l'échantillon légal suivant EN LIGNE
  // DROITE — à travers la pièce (RETARD : allers-retours x −14 ↔ 60 sous la
  // lentille, jusqu'à 115 mm de corps d'outil dans la matière). La descente
  // est close au dernier point légal (micro-hélice, sinon plongée claire,
  // sinon cote atteinte, sûre) et le point suivant reçoit une vraie entrée.
  const finishRamp=function(){
    if(rampL>0){
      const zLast=moves.length?moves[moves.length-1].z:z;
      if(zLast>z+1e-9){
        let orbOk=true;
        for(let k=0;k<8;k++){const a=k/8*2*Math.PI;if(!inside(px+0.5*Math.cos(a),py+0.5*Math.sin(a))){orbOk=false;break;}}
        if(orbOk)faoHelixEntry(px,py,zLast,z,0.5,D).slice(1).forEach(function(m){moves.push(m);});
        else if(plungeOK(px,py))moves.push({r:0,x:rnd(px),y:rnd(py),z:z});
      }
    }
    rampL=0;
  };
  while(th<=thMax&&guard++<400000){
    const R=pitch*th/(2*Math.PI);
    const x=cx+R*Math.cos(th), y=cy+R*Math.sin(th);
    if(inside(x,y)){
      // Direction d'attaque = tangente CCW de la spirale en (x,y) — l'arc
      // circulaire arrive en tangence sur le sens de coupe ; centre exact
      // (R=0) : repli sur le pas de l'échantillon.
      let ex=-(y-cy), ey=(x-cx);
      if(Math.hypot(ex,ey)<1e-9){ ex=x-px; ey=y-py; }
      if(rampL>0&&!(prevIn&&segClear(px,py,x,y)))finishRamp(); // 2026-10-21-004 : jamais de pont
      if(rampL>0){
        // 007 : on CONTINUE le rampage — la fraise descend en avançant sur la
        // spirale (coupe progressive du croissant non balayé, centre légal).
        rampK++;
        const zr=Math.max(z,Math.round((rampZ0+(z-rampZ0)*rampK/rampTot)*1000)/1000);
        moves.push({r:0,ent:1,x:rnd(x),y:rnd(y),z:zr});
        rampL--;
      }else if(!atCut||!prevIn||!segClear(px,py,x,y)){
        if(!entryTo(x,y,ex,ey)){
          // 007 : aucune entrée sûre ici (pas d'ancre balayée, pas d'orbite
          // tenable) -> RAMPAGE le long de la spirale : la fraise découpe en
          // progressant, jamais à plat sur le brut restant.
          rampTot=Math.max(2,Math.ceil((rampZ0-z)/2));
          rampK=1; rampL=rampTot-1;
          const zr=Math.max(z,Math.round((rampZ0+(z-rampZ0)*rampK/rampTot)*1000)/1000);
          moves.push({r:0,ent:1,x:rnd(x),y:rnd(y),z:zr});
        }
      }
      else pushCut(x,y);
      atCut=true; prevIn=true; px=x; py=y;
    }else prevIn=false;
    th+=(R>1e-9)?Math.min(s/R,Math.PI/6):Math.PI/6;
  }
  // 007 : fin de spirale pendant un rampage : on termine la descente au
  // dernier point légal — hélice micro-orbite si elle tient, sinon plongée
  // claire (disque déjà balayé), sinon on garde la cote atteinte (sûr).
  finishRamp();
  // --- CÔTÉS (2026-10-11-001) : ARCS CONCENTRIQUES par côté — remplace le
  // zigzag DROIT de la 004 (demande « les passes après la spirale étaient de
  // type circulaire avant et maintenant elles sont droites — cela ne me plaît
  // pas ; le parcours circulaire se rapproche du trochoïdal »). La spirale
  // centrale (Rcent = murs proches) a ouvert le disque ; la matière restante
  // — les extrémités le long de X interne (SENS LONG force l'axe long en X,
  // remis en place à la sortie) — s'éclaircit par DEMI-ANNEAUX en « D »
  // centrés sur (cx,cy) : rayons de Rsp (dernier tour de spirale) jusqu'à
  // Rmax, pas radial = pitch, échantillonnage angulaire identique à la
  // spirale (corde s, Δθ ≤ π/6), plage bornée au demi-plan du côté — LE PLAN
  // MÉDIAN x=cx EST UNE LIMITE TEMPORAIRE : aucun arc ne le dépasse. Côté de
  // DÉPART = côté de la fin de spirale (le levier du dernier tour), l'autre
  // côté ensuite — UN SEUL croisement : le pont rejoint l'extrémité du
  // demi-anneau voisin posée SUR le plan médian (G1 sûr dans le déjà usiné,
  // sinon une unique entrée/rapide). Sérpentin par rayon (alternance de sens,
  // lien radial court = pitch validé segClear, repli entryTo) — aucun G0
  // radiating entre les deux bouts ; aucune ligne droite : parcours circulaire
  // (pré-trochoïdal) comme avant la 004. AVALANT (demande « quand Avalant est
  // sélectionné, il faut travailler toujours dans le même sens ! ») : les
  // demi-anneaux sont alors TOUS parcourus dans le MÊME sens angulaire (comme
  // la spirale, CCW) — pas de sérpentin ; les retours de rayon se font par la
  // corde le long du plan médian (G1 à la cote dans le déjà usiné) et le
  // croisement entre côtés longe aussi le plan. Bidir (défaut sans champ) :
  // sérpentin (retournement vers l'extrémité la plus proche), inchangé.
  const avalant=!!(opt&&opt.sens==='avalant');
  const clearArcs=function(side,pyRef){
    const thA=side>0?-Math.PI/2:Math.PI/2;
    const thB=side>0?Math.PI/2:3*Math.PI/2;
    // 1er rayon commencé par l'extrémité du demi-anneau la plus proche du
    // point d'arrivée (fin de spirale pour le 1er côté, fin du côté précédent
    // pour le 2nd) : le pont devient un court G1, pas une rapide longue.
    // avalant : sens unique — début toujours à thA (aucun retournement).
    let rev=avalant?false:((side>0)?(pyRef>=cy):(pyRef<cy));
    const Rsp=pitch*(Math.ceil(Rcent/pitch)+1); // rayon atteint par la spirale (thMax)
    let nEm=0,ag=0;
    for(let R=Rsp;R<=Rmax+1e-9;R+=pitch){
      const dth=Math.min(s/Math.max(R,0.5),Math.PI/6);
      const samp=[];
      for(let th=thA;th<=thB+1e-12;th+=dth){
        const x=cx+R*Math.cos(th),y=cy+R*Math.sin(th);
        samp.push([th,x,y,inside(x,y)]);
      }
      if(rev)samp.reverse();
      let had=false;
      for(let i=0;i<samp.length&&ag++<500000;i++){
        const sm=samp[i];
        if(!sm[3]){prevIn=false;continue;}
        had=true;
        const th=sm[0],x=sm[1],y=sm[2];
        const sg=rev?-1:1;
        let ex=-Math.sin(th)*sg, ey=Math.cos(th)*sg;
        if(Math.hypot(ex,ey)<1e-9){ex=x-px;ey=y-py;}
        if(rampL>0&&!(prevIn&&segClear(px,py,x,y)))finishRamp(); // 2026-10-21-004 : jamais de pont
        if(rampL>0){
          rampK++;
          const zr=Math.max(z,Math.round((rampZ0+(z-rampZ0)*rampK/rampTot)*1000)/1000);
          moves.push({r:0,ent:1,x:rnd(x),y:rnd(y),z:zr});
          rampL--;
        }else if(!atCut||!prevIn||!segClear(px,py,x,y)){
          if(!entryTo(x,y,ex,ey)){
            rampTot=Math.max(2,Math.ceil((rampZ0-z)/2));
            rampK=1; rampL=rampTot-1;
            const zr=Math.max(z,Math.round((rampZ0+(z-rampZ0)*rampK/rampTot)*1000)/1000);
            moves.push({r:0,ent:1,x:rnd(x),y:rnd(y),z:zr});
          }
        }
        else pushCut(x,y);
        atCut=true; prevIn=true; px=x; py=y;
        nEm++;
      }
      if(had&&!avalant)rev=!rev; // sérpentin (bidir) : rayon suivant inversé
    }
    return nEm;
  };
  // 007 : la descente éventuellement active est terminée par le bloc « fin de
  // spirale pendant un rampage » ci-dessus — état clos avant les côtés.
  rampL=0;
  // état réel au début des côtés : à cote z (sinon entryTo gère l'accostage
  // depuis la cote restante — même garde que la passe de faces, note 011).
  {
    const P=moves.length?moves[moves.length-1]:null;
    atCut=!!(P&&!P.r&&Math.abs(P.z-z)<1e-9);
    prevIn=atCut;
  }
  const side0=(px>=cx)?1:-1; // côté où la spirale s'est arrêtée : d'abord là
  clearArcs(side0,py);
  clearArcs(-side0,py); // py = dernier point du côté précédent (mis à jour)
  // --- DERNIÈRE PASSE : les FACES du solide (retour 2/3). Mêmes chaînes que
  // le conventionnel k=0 : chaines du niveau offsetées à r (la laisse de
  // l'outil suit exactement les parois) + cadre E0 de la boîte. Chaîne la plus
  // proche d'abord ; liaison G1 sûre sinon entrée (hélice si le disque passe,
  // sinon plongée sûre au point — un helix tangent au mur est hors zone, et le
  // dernier tour de spirale est déjà à proximité quasi systématique).
  // 2026-10-14-010 : outil à rayon de coin — la passe de FACES (le tour qui
  // finit le niveau après le débourrage) suit les contours au CONTACT RÉEL
  // de l'outil (opt.bullFaces) au lieu des chaînes décalées de r : plus de
  // passe torique ajoutée en fin d'opération, une passe gagnée par niveau.
  const bullF=(opt&&typeof opt.bullFaces==='function')?opt.bullFaces(z):null;
  const wallRuns=bullF?bullF.map(function(c){let p=c.pts;
      if(c.closed&&p.length>2&&Math.abs(p[0][0]-p[p.length-1][0])<1e-9&&Math.abs(p[0][1]-p[p.length-1][1])<1e-9)p=p.slice(0,-1);
      return {pts:p,closed:!!c.closed,bb:faoPtsBB(p)};})
    :faoOffsetRuns(S,r);
  // liaison de coupe vers un contour torique : validée sur l'outil réel
  const linkOK=(bullF&&typeof opt.bullOK==='function')
    ?function(ax,ay,bx,by){const L=Math.hypot(bx-ax,by-ay),n=Math.max(1,Math.ceil(L/0.25));
        for(let i=0;i<=n;i++){const t=i/n;if(!opt.bullOK(ax+(bx-ax)*t,ay+(by-ay)*t,z))return false;}return true;}
    :segClear;
  const rem=wallRuns.concat(faoRectRuns(S,0,r)).filter(function(c){
    return c.pts&&c.pts.length>=2&&Math.max(c.bb[2]-c.bb[0],c.bb[3]-c.bb[1])>=0.1;
  });
  // 2026-10-10-004 : les chaines de FACES (parois du solide) sont egalement
  // decoupees des la creation a la FRONTIERE de zone — meme filet Fix 2 du
  // conventionnel (2026-10-10-001). Sans ce filtre, la passe de faces suivait
  // les parois de tout le solide : 82 788 coupes hors zone etaient generatees
  // puis jetees en silence par faoClipMovesPoly (le filet final ne faisait que
  // cacher la violation en generation). Les runs hors zone disparaissent, les
  // runs dedans deviennent des chaines ouvertes (comme au conventionnel) ;
  // les rapides franchissent librement.
  if(zoneAt){
    const zs=[];
    // 2026-10-21-007 : zone « 3D » (faces rouges) — une chaîne de cadre n'a que
    // ses SOMMETS testés : une arête droite de 274 mm le long d'un flanc rouge
    // traversait le volume interdit entre deux sommets autorisés. Densifiée à
    // ≤ 1 mm avant le filtre (seulement avec du rouge : parcours inchangés sinon).
    const dens=function(P,closed){
      if(!(opt&&opt.zoneDense))return P;
      const out=[];const n=P.length,m=closed?n:n-1;
      for(let i=0;i<m;i++){const a=P[i],b=P[(i+1)%n];out.push(a);
        const L=Math.hypot(b[0]-a[0],b[1]-a[1]),k=Math.ceil(L/1);
        for(let q=1;q<k;q++)out.push([a[0]+(b[0]-a[0])*q/k,a[1]+(b[1]-a[1])*q/k]);}
      if(!closed)out.push(P[n-1]);
      return out;
    };
    for(let ci=0;ci<rem.length;ci++){
      const chZ=rem[ci],P=dens(rem[ci].pts,!!rem[ci].closed);
      let run=null,split=false;
      for(let pi=0;pi<P.length;pi++){
        if(zoneAt(P[pi][0],P[pi][1])){
          if(!run)run=[];
          run.push(P[pi]);
        }else{
          split=true;
          if(run&&run.length>=2)zs.push({pts:run,closed:false,bb:faoPtsBB(run)});
          run=null;
        }
      }
      if(!split){zs.push(chZ);continue;} // tout dedans : chaine d'origine (closed conserve)
      // (chaîne fermée densifiée coupée : le morceau de fin rejoint le début)
      if(run&&run.length>=2)zs.push({pts:run,closed:false,bb:faoPtsBB(run)});
    }
    rem.length=0;
    for(let ci=0;ci<zs.length;ci++)rem.push(zs[ci]);
  }
  const cpd=function(ch,px,py){
    const P=ch.pts,n=P.length,segsN=ch.closed?n:n-1;
    let d=1/0;
    for(let i=0;i<segsN;i++){
      const a=P[i],b=P[(i+1)%n];
      const dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy;
      let t=L2>0?((px-a[0])*dx+(py-a[1])*dy)/L2:0;
      if(t<0)t=0;else if(t>1)t=1;
      const qx=px-(a[0]+t*dx),qy=py-(a[1]+t*dy),dd=Math.sqrt(qx*qx+qy*qy);
      if(dd<d)d=dd;
    }
    return d;
  };
  // 2026-10-08-003 — sens 'avalant' : comme ordered() du conventionnel, les
  // chaines de faces ne sont JAMAIS retournees (sens de coupe constant) ;
  // les anneaux fermes restent simplement tournes vers le depart le plus
  // proche. Absent/'bidir' : retournement libre, code historique.
  // (avalant est declare plus haut, avant clearArcs — 2026-10-11-001.)
  const cord=function(ch,px,py){
    const P=ch.pts;
    if(ch.closed){
      let bi=0,bd2=1/0;
      for(let i=0;i<P.length;i++){
        const dx=P[i][0]-px,dy=P[i][1]-py,dd=dx*dx+dy*dy;
        if(dd<bd2){bd2=dd;bi=i;}
      }
      return P.slice(bi).concat(P.slice(0,bi));
    }
    if(avalant)return P; // sens unique : ordre naturel de la chaine
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
  while(rem.length){
    const P=moves.length?moves[moves.length-1]:null;
    const sx0=rem[0].pts[0][0],sy0=rem[0].pts[0][1];
    const px=P?P.x:sx0, py=P?P.y:sy0;
    let bi2=0,bd2=1/0;
    for(let i=0;i<rem.length;i++){
      const dd=cpd(rem[i],px,py);
      if(dd<bd2){bd2=dd;bi2=i;}
    }
    const ch=rem.splice(bi2,1)[0];
    const seq=cord(ch,px,py);
    const sx=seq[0][0],sy=seq[0][1];
    // Direction d'attaque = premier maillon de la chaîne (sens de coupe).
    const ex2=(seq.length>1)?seq[1][0]-seq[0][0]:0;
    const ey2=(seq.length>1)?seq[1][1]-seq[0][1]:0;
    let i0=1;
    // 011 : P.z > z = fin de spiral en cours de rampage sans être redescendu
    // à la cote — ne JAMAIS accoster la chaîne depuis cette cote (une poussée
    // directe serait une plongée verticale non contrôlée) : entryTo (vide
    // d'abord) ou ramp depuis rampZ0.
    // 10-09-002 : liaison courte (< faoRapideMin) et sûre = G1 à la cote
    // (déjà sur place : aucun trajet) — pas de lever pour un hop de quelques
    // centimètres ; au-delà : rapide en l'air (mode circ : cercle d'entrée,
    // sinon plongée plate sûre 007) ; repli ramp le long de la chaîne.
    const ici=P&&!P.r&&Math.abs(P.z-z)<1e-9;
    const here=ici&&Math.abs(P.x-sx)<1e-9&&Math.abs(P.y-sy)<1e-9;
    const linkable=ici&&(sx-P.x)*(sx-P.x)+(sy-P.y)*(sy-P.y)<linkMax*linkMax&&linkOK(P.x,P.y,sx,sy);
    // 2026-10-21-013 : chaîne de moins de 5 mm qui exigerait une entrée (remontée
    // + descente) : ignorée — seulement avec la matière suivie (brut-corps / rouge)
    if(!here&&!linkable&&remTop){let Lc=0;for(let q=1;q<seq.length;q++)Lc+=Math.hypot(seq[q][0]-seq[q-1][0],seq[q][1]-seq[q-1][1]);if(ch.closed&&seq.length>1)Lc+=Math.hypot(seq[0][0]-seq[seq.length-1][0],seq[0][1]-seq[seq.length-1][1]);if(Lc<5)continue;}
    if(here){
      pushCut(sx,sy);
    }else if(linkable){
      pushCut(sx,sy);
    }else if(!entryTo(sx,sy,ex2,ey2)){
      // 2026-10-08-007 : RAMPE le long de la chaîne de faces — la fraise
      // descend EN COUPANT le croissant non balayé le long du mur (paliers
      // bornés à ~2 mm, répartis sur les points disponibles), centre
      // toujours à r du mur : aucune plongée à plat sur le brut restant,
      // aucun gouge.
      const nUse=Math.max(1,Math.min(seq.length-1,Math.ceil((rampZ0-z)/2)));
      const dz=(rampZ0-z)/nUse;
      for(let i=1;i<=nUse;i++){
        moves.push({r:0,ent:1,x:rnd(seq[i][0]),y:rnd(seq[i][1]),
          z:Math.round((rampZ0-dz*i)*1000)/1000});
      }
      i0=nUse+1;
    }
    for(let i=i0;i<seq.length;i++)pushCut(seq[i][0],seq[i][1]);
    if(ch.closed)pushCut(seq[0][0],seq[0][1]);
  }
}
// 2026-10-15-001 : un fond (face horizontale vers le haut à la cote f) est-il
// DANS la zone de l'opération ? (Finir le fond : pas de passe sur un
// épaulement hors de la poche.) Sans zone : oui.
function faoFloorInZone(mesh,f,zoneAt){
  if(typeof zoneAt!=='function')return true;
  const V=mesh.v,T=mesh.t;
  for(let i=0;i<T.length;i++){
    const a=V[T[i][0]],b=V[T[i][1]],c=V[T[i][2]];
    if(Math.abs(a[2]-f)>1e-6||Math.abs(b[2]-f)>1e-6||Math.abs(c[2]-f)>1e-6)continue;
    // centre et milieux d'arêtes : un grand triangle peut déborder de la zone
    const pts=[[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3],[(a[0]+b[0])/2,(a[1]+b[1])/2],[(b[0]+c[0])/2,(b[1]+c[1])/2],[(c[0]+a[0])/2,(c[1]+a[1])/2]];
    for(let k=0;k<pts.length;k++)if(zoneAt(pts[k][0],pts[k][1]))return true;
  }
  return false;
}
function faoUpFloors(mesh,z0,z1){
  // FONDS RÉELS du maillage (7/10) : faces horizontales avec matière EN
  // DESSOUS et vide au-dessus — plancher de poche, sommet de bossage — dans
  // [z0,z1]. Candidats = faces planes horizontales (les deux orientations de
  // triangulation), décision par PARITÉ exacte de l'app (faoScanIntervals)
  // juste en dessous / au-dessus : ni dépendance au sens des triangles, ni
  // faux positif sur une voûte (face tournée vers le bas) ni sur une interface
  // interne. Aires groupées par cote quantifiée à 0,001 ; seuil 0,01 mm²
  // (slivers de tessellation ignorés).
  const res=[];
  if(!mesh||!mesh.v||!mesh.v.length||!mesh.t||!mesh.t.length)return res;
  const cands={};
  for(let i=0;i<mesh.t.length;i++){
    const tr=mesh.t[i],a=mesh.v[tr[0]],b=mesh.v[tr[1]],c=mesh.v[tr[2]];
    if(!a||!b||!c)continue;
    const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2];
    const vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
    const len=Math.sqrt(nx*nx+ny*ny+nz*nz);
    if(!(len>0)||Math.abs(nz)/len<0.999)continue; // pas horizontal (> ~2,5°)
    const z=Math.round(a[2]*1000)/1000;
    if(!(z>=z0-1e-9&&z<=z1+1e-9))continue;
    const k=String(z);
    if(!cands[k])cands[k]=[];
    cands[k].push({x:(a[0]+b[0]+c[0])/3,y:(a[1]+b[1]+c[1])/3,a:0.5*len});
  }
  const inside=function(segs,x,y){
    const ivs=faoScanIntervals(segs,y);
    for(let i=0;i<ivs.length;i++)if(x>ivs[i][0]+1e-7&&x<ivs[i][1]-1e-7)return true;
    return false;
  };
  for(const k in cands){
    const z=+k, list=cands[k];
    const below=faoSliceZ(mesh,z-0.001), above=faoSliceZ(mesh,z+0.001);
    let ar=0;
    for(let i=0;i<list.length;i++){
      const p=list[i];
      if(inside(below,p.x,p.y)&&!inside(above,p.x,p.y))ar+=p.a;
    }
    if(ar>=0.01)res.push(z);
  }
  res.sort(function(p,q){return q-p;});
  return res;
}
// 2026-10-11-005 — ORIENTATION DU PARCOURS = LA MATIÈRE À USINER (demande :
// « Peu importe la position de la pièce : si le sens long est sur Y, tu
// travailles en Y ; s'il est à 38,5°, tu suis cet angle »). PCA des sommets
// de la chaîne -> axe LONG de la poche :
//   null          = pas de préférence (absent, <3 pts, quasi-carré) : la
//                   boîte du brut fait foi (SENS LONG historique) ;
//   0             = axe sur X (pochage paysage) : repère = la pièce, AUCUNE
//                   transformation (la zone commande, pas la boîte) ;
//   π/2           = axe sur Y (pochage portrait) ;
//   autre         = oblique (35°, 38,5°…) : rotation du repère sur l'axe.
// Tolérance 2° (snap sur 0/90°) + ratio d'étendues ≥ 1,3 (carré = arbitraire).
function faoLoopAxis(loop){
  if(!loop||loop.length<3)return null;
  let n=0,sx=0,sy=0,sxx=0,syy=0,sxy=0;
  for(let i=0;i<loop.length;i++){
    const x=+loop[i][0], y=+loop[i][1];
    if(!isFinite(x)||!isFinite(y))continue;
    n++; sx+=x; sy+=y; sxx+=x*x; syy+=y*y; sxy+=x*y;
  }
  if(n<3)return null;
  const cx=sx/n, cy=sy/n;
  const a=sxx/n-cx*cx, b=sxy/n-cx*cy, c=syy/n-cy*cy;
  let th=0.5*Math.atan2(2*b, a-c);          // vecteur propre principal (PCA)
  if(!isFinite(th))return null;
  if(th>Math.PI/2)th-=Math.PI;              // normalisation (−90°,90°]
  else if(th<=-Math.PI/2)th+=Math.PI;
  // Étendues le long / perp de l'axe : sans préférence nette (carré, quasi-
  // carré : L < 1,3*W) l'orientation serait arbitraire -> boîte du brut.
  const cs=Math.cos(th), sn=Math.sin(th);
  let u0=1/0,u1=-1/0,v0=1/0,v1=-1/0;
  for(let i=0;i<loop.length;i++){
    const x=+loop[i][0], y=+loop[i][1];
    if(!isFinite(x)||!isFinite(y))continue;
    const u=x*cs+y*sn, v=-x*sn+y*cs;
    if(u<u0)u0=u; if(u>u1)u1=u; if(v<v0)v0=v; if(v>v1)v1=v;
  }
  const L=Math.max(u1-u0,1e-9), W=Math.max(v1-v0,1e-9);
  if(L<1.3*W)return null;
  const TOL=2*Math.PI/180;                  // 2° : aligné -> exact 0 ou π/2
  if(Math.abs(th)<=TOL)return 0;
  if(Math.abs(th-Math.PI/2)<=TOL||Math.abs(th+Math.PI/2)<=TOL)return Math.PI/2;
  return th;
}
// 2026-10-09-005 : le corps est un GÉNÉRATEUR (faoGenRough3DIt) qui « cède le
// fil » après chaque niveau/mini-passe/finition (yield moves) — l'aperçu
// dessine les courbes au fur et à mesure (faoOpMovesStream). L'appel classique
// faoGenRough3D() reste SYNCHRONE (drain complet, résultat strictement
// identique) : tests, G-code, estimation et le rendu canonique l'utilisent.
function* faoGenRough3DIt(mesh,box,ztop,zbot,o){
  // Ébauche 3D en MODE TROCOÏDAL UNIQUE (lot 2026-10-03-004) : pelage à ap
  // constant (ae ≤ 0.25*D), trochoïdes G2/G3 clampées en Y dans les goulets,
  // liaisons sans retrait, ombre EXACTE aux plans vertex = brut restant sans
  // voile manqué, entrées multi-spots hélice/rampe X-Y/micro-hélice avec
  // colonnes exactes, ordre de pelage selon l'ouverture.
  // Les anciennes stratégies (morph/zigzag/adaptive) et les passes fines ap2
  // ont été supprimées : `o.strategy`/`o.ap2` sont ignorés (documents migrés
  // à la lecture par faoSanitiseOps) — le petit ae suit les marches.
  // Niveaux vides (brut au-dessus de la pièce) : surfaçage pleine largeur.
  o=o||{};
  if(!mesh||!mesh.v||!mesh.v.length)return [];
  const D=isFinite(+o.toolD)&&+o.toolD>0?+o.toolD:10;
  const RA=faoRA(o);
  const secu=isFinite(+o.secu)?+o.secu:(+zbot+5);
  const zt=+ztop; // le brut au-dessus de la pièce se surfaçe (niveaux vides) :
  // jamais de clamp au sommet pièce, sinon le dessus du brut serait oublié.
  const zBot=+zbot+RA.axial;
  const ap=isFinite(+o.ap)&&+o.ap>0?+o.ap:2;
  const ae=isFinite(+o.ae)&&+o.ae>0?+o.ae:D*0.6;
  const entryMode=o.entry||'auto';
  const B=box||{x0:0,y0:0,x1:100,y1:80};
  // SENS LONG (retour utilisateur) : brut plus haut que large -> pelage le
  // long de Y : on transpose x<->y du maillage et de la boite (hauteurs
  // d'outillage identiques), puis chaque move est remis en place a la
  // sortie (miroir y=x : IJK echanges, sens cw inverse). Carres et
  // paysages : inchanges.
  // 2026-10-11-005 — LA ZONE DÉCIDE DE L'ORIENTATION (faoLoopAxis, cf. plus
  // haut) : axe paysage (0) -> repère = la pièce, AUCUNE transformation (le
  // parcours se dessine sur la pièce dans sa position) ; axe portrait (π/2)
  // ou oblique (35°, 38,5°…) -> rotation −th du maillage/boîte sur l'axe de
  // la poche, sortie +th (isométrie : cw/IJK exacts). SANS ZONE (thL=null) :
  // SENS LONG historique inchangé (miroir si le brut est plus haut que large).
  const thL=faoLoopAxis(o&&o.limit&&o.limit.loop);
  let th=0, swapped=false, M=mesh, BB=B;
  // 2026-10-21-002 : BRUT PLUS LARGE QUE LA PIÈCE — le domaine des centres
  // d'outil était la boîte de la PIÈCE ± r : un brut qui déborde (corps brut
  // RETARD : +2,25 mm sur les flancs plats) laissait une bande jamais usinée le
  // long des flancs (centres à 58,7 exactement = bande de largeur nulle), que
  // les rapides de liaison à +5 mm traversaient en pleine matière (40 rapides,
  // 5,8 m). La boîte du brut (o.stockBox, repère du posage) ÉLARGIT le domaine ;
  // l'orientation (sens long, axe de zone) reste décidée sur la pièce.
  // 2026-10-21-003 : INTOUCHABLES — la zone devient « 3D » : un centre d'outil
  // n'est admis au niveau courant (zCur) que si l'outil gonflé de la marge y
  // reste au-dessus du rouge (o.protectTip = cote de pointe minimale). Posé
  // AVANT les transformations de repère (la zone voyage avec elle).
  let zCur=1/0;
  // 2026-10-21-010 : BRUT = CORPS — o.stockTopAt(x,y) = dessus du brut dilaté
  // du rayon d'outil : un centre n'est admis que s'il reste de la matière du
  // brut sous le disque AU-DESSUS de la cote (sinon : usinage dans le vide).
  if(typeof o.protectTip==='function'||typeof o.stockTopAt==='function'){
    const pT=(typeof o.protectTip==='function')?o.protectTip:null,sT=(typeof o.stockTopAt==='function')?o.stockTopAt:null;
    const zB=(typeof o.zoneAt==='function')?o.zoneAt:null;
    // zoneSafe : où l'outil a le DROIT d'être (zone de l'op, rouge) — les points
    // d'entrée / sortie / liaison dans le vide à côté du brut sont libres ;
    // zoneAt : où l'on COUPE (en plus : matière du brut sous l'outil)
    const safe=function(x,y){
      if(zB&&!zB(x,y))return false;
      if(pT&&pT(x,y)>zCur+1e-6)return false;
      return true;};
    o=Object.assign({},o,{zoneSafe:safe,zoneAt:function(x,y){
      if(!safe(x,y))return false;
      if(sT&&zCur<1/0&&!(sT(x,y)>zCur+0.01))return false;
      return true;}});
  }
  const SB=o.stockBox&&isFinite(+o.stockBox.x0)&&isFinite(+o.stockBox.x1)&&isFinite(+o.stockBox.y0)&&isFinite(+o.stockBox.y1)?o.stockBox:null;
  if(thL!==null&&thL!==0){
    th=thL;
    const cs=Math.cos(th), sn=Math.sin(th); // matrice repère = R(−th)
    const v2=new Array(mesh.v.length);
    let x0=1/0,y0=1/0,x1=-1/0,y1=-1/0;
    for(let i=0;i<mesh.v.length;i++){
      const p=mesh.v[i];
      const X=p[0]*cs+p[1]*sn, Y=p[1]*cs-p[0]*sn;
      v2[i]=[X,Y,p[2]];
      if(X<x0)x0=X; if(X>x1)x1=X; if(Y<y0)y0=Y; if(Y>y1)y1=Y;
    }
    M={v:v2,t:mesh.t};
    BB={x0:x0,y0:y0,x1:x1,y1:y1,z0:B.z0,z1:B.z1};
    if(SB)[[SB.x0,SB.y0],[SB.x1,SB.y0],[SB.x0,SB.y1],[SB.x1,SB.y1]].forEach(function(c){
      const X=c[0]*cs+c[1]*sn, Y=c[1]*cs-c[0]*sn;
      if(X<BB.x0)BB.x0=X; if(X>BB.x1)BB.x1=X; if(Y<BB.y0)BB.y0=Y; if(Y>BB.y1)BB.y1=Y;});
  }else if(thL===null&&(B.y1-B.y0)>(B.x1-B.x0)){
    swapped=true;
    M={v:mesh.v.map(function(p){return [p[1],p[0],p[2]];}),t:mesh.t};
    BB={x0:B.y0,y0:B.x0,x1:B.y1,y1:B.x1};
    if(SB)BB={x0:Math.min(BB.x0,+SB.y0),y0:Math.min(BB.y0,+SB.x0),x1:Math.max(BB.x1,+SB.y1),y1:Math.max(BB.y1,+SB.x1)};
  }else if(SB){
    BB=Object.assign({},B,{x0:Math.min(B.x0,+SB.x0),y0:Math.min(B.y0,+SB.y0),x1:Math.max(B.x1,+SB.x1),y1:Math.max(B.y1,+SB.y1)});
  }
  // 2026-10-11-005 — LA ZONE PART DANS LE REPERE AUSSI : `o.zoneAt` est un
  // prédicat MONDE ; livré tel quel dans un repère transposé/pendant, il
  // « tournait » de 90° (Cavité inverse : |y| du parcours bloqué à 42,5 au
  // lieu de 72,5 — les extrémités de la poche n'étaient JAMAIS usinées).
  // 2026-10-21-010 : dessus du brut-corps dans le repère interne (liaisons toriques)
  let stockTopF=(typeof o.stockTopAt==='function')?o.stockTopAt:null;
  let stockRawF=(typeof o.stockRawAt==='function')?o.stockRawAt:null; // 2026-10-22-003 : non dilaté
  if(stockRawF&&(th!==0||swapped)){
    const sR=stockRawF;
    if(th!==0){const cs=Math.cos(th),sn=Math.sin(th);stockRawF=function(x,y){return sR(x*cs-y*sn,x*sn+y*cs);};}
    else stockRawF=function(x,y){return sR(y,x);};
  }
  if(stockTopF&&(th!==0||swapped)){
    const sW=stockTopF;
    if(th!==0){const cs=Math.cos(th),sn=Math.sin(th);stockTopF=function(x,y){return sW(x*cs-y*sn,x*sn+y*cs);};}
    else stockTopF=function(x,y){return sW(y,x);};
  }
  if(typeof o.zoneAt==='function'&&(th!==0||swapped)){
    const zW=o.zoneAt,zS=(typeof o.zoneSafe==='function')?o.zoneSafe:null;
    if(th!==0){
      const cs=Math.cos(th), sn=Math.sin(th); // R(+th) : repère -> monde
      o=Object.assign({},o,{zoneAt:function(x,y){ return zW(x*cs-y*sn, x*sn+y*cs); },
        zoneSafe:zS?function(x,y){ return zS(x*cs-y*sn, x*sn+y*cs); }:null});
    }else{
      o=Object.assign({},o,{zoneAt:function(x,y){ return zW(y,x); },zoneSafe:zS?function(x,y){ return zS(y,x); }:null});
    }
  }
  // 2026-10-11-005 — APERÇU PROVISOIRE DANS LA POSITION DE LA PIÈCE : pendant
  // la génération, les yields livraient les moves DANS LE REPÈRE INTERNE — le
  // tracé se dessinait à 90° (brut portrait) puis « sautait » à la fin. Chaque
  // yield livre désormais une COPIE transformée repère -> pièce (l'entrée
  // finale reste la vraie, transformée in place, strictement identique).
  let xf=null; // move -> coordonnées pièce (null = repère = pièce)
  if(th!==0){
    const cs=Math.cos(th), sn=Math.sin(th); // R(+th)
    xf=function(m){
      const x=m.x, y=m.y;
      m.x=x*cs-y*sn; m.y=x*sn+y*cs;
      if(m.arc){const ii=m.arc.i, jj=m.arc.j;
        m.arc.i=ii*cs-jj*sn; m.arc.j=ii*sn+jj*cs;}
    };
  }else if(swapped){
    xf=function(m){
      const x=m.x;
      m.x=m.y; m.y=x;
      if(m.arc){const ii=m.arc.i; m.arc.i=m.arc.j; m.arc.j=ii; m.arc.cw=!m.arc.cw;}
    };
  }
  const frameYield=function(){
    if(!xf)return moves;
    const out=new Array(moves.length);
    for(let i=0;i<moves.length;i++){
      const s=moves[i];
      const m=Object.assign({},s);
      if(s.arc)m.arc=Object.assign({},s.arc);
      xf(m);
      out[i]=m;
    }
    return out;
  };
  // ESCARGOT (2026-10-07-005) : pelage en spirale depuis le centre vers les
  // faces (faoSpiralLevel), entrées obligatoires en hélice. `o.mode` posé par
  // le dispatch ; sans mode (documents existants) le parcours conventionnel
  // reste STRICTEMENT identique.
  // 2026-10-08-001 : le mode trocoïdal (poche d'entrée o.poly, phases A/B)
  // a été supprimé — il ne reste que ces deux modes.
  const esc=(o.mode==='escargot');
  // PLANCHER RÉEL (7/10) : la grille `ap` est ancrée sur `Haut` et ne se pose
  // sur le fond de la poche que si `Bas` vaut ce fond (ou y tombe par hasard).
  // Sinon le dernier niveau utile laisse jusqu'à `ap` de matière sur le
  // plancher ET `Fond` ne décale que le bas de zone — le fond n'est jamais
  // fini (Fond=0 comme Fond=0,5, sondes A/B). Pour CHAQUE fond : la laisse
  // `Fond` devient un niveau à `fond+Fond` — et tout niveau de grille tombant
  // dans [fond, fond+Fond[ est RETIRÉ (8/10 : ap aligné pile sur le fond —
  // réel ap=5, fond 20 — le niveau 20 mangeait la laisse 0,5 et allait « au
  // fond malgré le 0,5 »). Aucun ajout quand la grille pose déjà à
  // fond+Fond (coût nul, documents non alignés inchangés).
  // Fonds calculés UNE fois (réutilisés par la finition : niveau cible).
  const zoneOk=isFinite(zt)&&isFinite(+zbot)&&zt>+zbot;
  const floorsUp=zoneOk?faoUpFloors(M,Math.min(+zbot,zt),Math.max(+zbot,zt)):[];
  // Construction d'une grille (niveaux + poses de fond).
  const mkPlan=function(apx){
    const p=faoLevels(zt,zBot,apx).map(function(z){ return {z:z,radial:RA.radial}; });
    if(zoneOk){
      for(let i=0;i<floorsUp.length;i++){
        const f=floorsUp[i];
        if(f<+zbot-1e-9||f>=zt-1e-9)continue;   // hors zone (`Bas`) ou au niveau `Haut`
        const target=Math.round((f+RA.axial)*1000)/1000; // fond + Fond
        let atT=false;
        for(let j=p.length-1;j>=0;j--){
          const z=p[j].z;
          if(z>=f-1e-9&&z<target-1e-9)p.splice(j,1);   // coupait dans la laisse
          else if(Math.abs(z-target)<=1e-9)atT=true;
        }
        if(!atT)p.push({z:target,radial:RA.radial});    // haut de laisse exact
        // 2026-10-15-001 : FINIR LE FOND — avec une surépaisseur Fond > 0, une
        // passe à la cote EXACTE du fond enlève la laisse ; la finition des
        // parois (dernière passe latérale) se fait alors à cette hauteur.
        if(o.finitFond&&RA.axial>1e-9&&faoFloorInZone(M,f,o.zoneAt)){const zf=Math.round(f*1000)/1000;
          if(!p.some(function(q){return Math.abs(q.z-zf)<1e-9;}))p.push({z:zf,radial:RA.radial,fond:1});}
      }
      p.sort(function(a,b){return b.z-a.z;});
    }
    return p;
  };
  const plan=mkPlan(ap);                    // niveaux + poses de fond
  const moves=[];
  const nb=isFinite(+o.minipasses)&&+o.minipasses>0?Math.min(50,Math.round(+o.minipasses)):0;
  // FINITION DES PAROIS (8/10) : N contours sur la DERNIÈRE passe en
  // profondeur, offsets radial*(nf-k)/nf → 0 (k=1..nf), le dernier à la cote
  // théorique ; finitProf = cotes vers le haut (1 = dent haute, N = mur à
  // N étages). OFF par défaut (aucun document existant ne bouge) ; exige une
  // laisse radiale > 0 (sinon l'ébauche est déjà au mur). Même contrat que
  // les mini-passes (ringOnly, entrée depuis le plan du dessus) mais décalage
  // DÉCROISSANT.
  const nf=(o.finitParois&&RA.radial>0)
    ?Math.max(1,Math.min(9,Math.round(isFinite(+o.finitN)?+o.finitN:1))):0;
  // Niveau cible de la finition : le plus PROFOND >= plancher detecte (fonds
  // calcules ci-dessus). Sondes : Bas=0 descend sous la poche -> le dernier
  // niveau du plan est le fond de ZONE (0), inutile ; sans plancher utile ->
  // dernier du plan (comportement anterieur conserve).
  let finIdx=plan.length-1;
  if(nf&&floorsUp.length){
    let zFloor=null;
    for(let i=0;i<floorsUp.length;i++){
      const f=floorsUp[i];
      if(f>=+zbot-1e-9&&f<zt-1e-9&&(zFloor===null||f<zFloor))zFloor=f;
    }
    if(zFloor!==null){
      for(let i=plan.length-1;i>=0;i--)
        if(plan[i].z>=zFloor-1e-9){finIdx=i;break;}
    }
  }
  faoSliceCache={mesh:M,map:{}};
  // 2026-10-21-010 : MATIÈRE RESTANTE (brut-corps ou faces rouges) — carte des
  // hauteurs du brut (pas 1 mm, repère interne) abaissée par les passes émises
  // à chaque niveau ; les rapides de liaison (spirale, toriques) y sont
  // contrôlés : la matière laissée hors zone ou non atteinte n'est plus
  // traversée. Sans brut-corps ni rouge : absente (parcours inchangés).
  let rem=null;
  if(stockTopF||typeof o.protectTip==='function'){
    const g=1,pad=D;
    const rx0=BB.x0-pad,ry0=BB.y0-pad,rnx=Math.ceil((BB.x1-BB.x0+2*pad)/g)+1,rny=Math.ceil((BB.y1-BB.y0+2*pad)/g)+1;
    const top=new Float32Array(rnx*rny),raw=new Float32Array(rnx*rny);
    const bt=isFinite(+o.brutTop)?+o.brutTop:zt;
    const SBr=o.stockBox&&isFinite(+o.stockBox.x0)?o.stockBox:null;
    for(let j=0;j<rny;j++)for(let i=0;i<rnx;i++){const x=rx0+i*g,y=ry0+j*g;
      top[j*rnx+i]=stockTopF?Math.min(bt,stockTopF(x,y)):bt;
      // brut non dilaté : corps (repère interne) ; sinon boîte du brut
      raw[j*rnx+i]=stockRawF?Math.min(bt,stockRawF(x,y))
        :(SBr&&!(th!==0||swapped)?((x>=+SBr.x0&&x<=+SBr.x1&&y>=+SBr.y0&&y<=+SBr.y1)?bt:-1/0):bt);}
    const rcut=Math.max(0.5,D/2-0.3*(isFinite(+o.cornerR)?+o.cornerR:0));
    let done=0;
    const carve=function(){
      for(let k=Math.max(1,done);k<moves.length;k++){const a=moves[k-1],b=moves[k];if(b.r||a.r)continue;
        const L=Math.hypot(b.x-a.x,b.y-a.y),ns=Math.max(1,Math.ceil(L));
        for(let s=0;s<=ns;s++){const t=s/ns,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t,z=Math.max(a.z,b.z);
          const n=Math.ceil(rcut/g),ci=Math.round((x-rx0)/g),cj=Math.round((y-ry0)/g);
          for(let dj=-n;dj<=n;dj++)for(let di=-n;di<=n;di++){if((di*di+dj*dj)*g*g>rcut*rcut)continue;
            const ii=ci+di,jj=cj+dj;if(ii<0||jj<0||ii>=rnx||jj>=rny)continue;const q=jj*rnx+ii;if(z<top[q])top[q]=z;if(z<raw[q])raw[q]=z;}}}
      done=moves.length;
    };
    const rb=D/2+0.5,nb=Math.ceil(rb/g);
    const blockedAt=function(x,y,zt2){const ci=Math.round((x-rx0)/g),cj=Math.round((y-ry0)/g);
      for(let dj=-nb;dj<=nb;dj++)for(let di=-nb;di<=nb;di++){if((di*di+dj*dj)*g*g>rb*rb)continue;
        const ii=ci+di,jj=cj+dj;if(ii<0||jj<0||ii>=rnx||jj>=rny)continue;if(top[jj*rnx+ii]>zt2-0.5)return true;}
      return false;};
    const blocked=function(p,q,zt2){const L=Math.hypot(q.x-p.x,q.y-p.y),n=Math.max(1,Math.ceil(L));
      for(let i=0;i<=n;i++){const t=i/n;if(blockedAt(p.x+(q.x-p.x)*t,p.y+(q.y-p.y)*t,zt2))return true;}return false;};
    const topAt=function(x,y){let m=-1/0;const ci=Math.round((x-rx0)/g),cj=Math.round((y-ry0)/g);
      for(let dj=-nb;dj<=nb;dj++)for(let di=-nb;di<=nb;di++){if((di*di+dj*dj)*g*g>rb*rb)continue;
        const ii=ci+di,jj=cj+dj;if(ii<0||jj<0||ii>=rnx||jj>=rny)continue;const v=top[jj*rnx+ii];if(v>m)m=v;}
      return m;};
    // 2026-10-22-003 : ptAt — brut restant le plus haut SOUS LE DISQUE d'outil
    // (carte NON dilatée du corps-brut, abaissée par les mêmes passes) ;
    // ≤ z : la fraise est dans l'air à cette cote (entrée par l'extérieur).
    const ptAt=function(x,y){let m=-1/0;const ci=Math.round((x-rx0)/g),cj=Math.round((y-ry0)/g);
      for(let dj=-nb;dj<=nb;dj++)for(let di=-nb;di<=nb;di++){if((di*di+dj*dj)*g*g>rb*rb)continue;
        const ii=ci+di,jj=cj+dj;if(ii<0||jj<0||ii>=rnx||jj>=rny)continue;const v=raw[jj*rnx+ii];if(v>m)m=v;}
      return m;};
    rem={carve:carve,blocked:blocked,blockedAt:blockedAt,topAt:topAt,ptAt:ptAt};
  }
  // 2026-10-14-007 : PASSE TORIQUE (src/89-fao-torique.js) — outil à rayon de
  // coin (torique : cornerR ; boule : D/2) : après chaque niveau du moteur
  // (inchangé), passe AJOUTÉE au contact exact de l'outil réel là où la
  // fraise droite du calcul restait à distance des faces inclinées.
  const rcT=o.kind==='ball'?D/2:(o.kind==='bull'?Math.min(D/2,+o.cornerR||0):0);
  const bullC=(rcT>1e-3&&typeof faoBullRingSetup==='function')?{}:null;
  const bullCtx=function(lai){const k=(+lai||0).toFixed(4);if(!bullC[k]){bullC[k]=faoBullRingSetup(M,BB,D,rcT,+lai||0,o.zoneAt);bullC[k].stockTop=stockTopF;bullC[k].zoneSafe=o.zoneSafe||null;bullC[k].remAt=rem?rem.blockedAt:null;bullC[k].brutTop=o.brutTop;bullC[k].zTop=zt;}return bullC[k];};
  const bullLink=1.5*(esc?Math.max(0.5,ae):Math.max(0.5,Math.min(ae,D*0.25)));
  // passes toriques émises APRÈS tout le moteur : le parcours 005 reste
  // strictement identique (insérées entre niveaux, elles déplaçaient le point
  // de départ du niveau suivant : +56 remontées mesurées sur la cavité)
  const bullJobs=[];
  // forEach -> for (yield interdit dans une closure) : chaque itération de
  // niveau cède le fil au flux via yield moves (dessin progressif 005).
  const chunkAt=[]; // 2026-10-22-001 : début de chaque niveau dans moves (ordre par région)
  for(let li=0;li<plan.length;li++){
    const L=plan[li];
    chunkAt.push(moves.length);
    // Entrée depuis z+pas (rainure du dessus déjà ouverte, descente en avance
    // plongée) : l'hélice ne refait jamais toute la hauteur depuis la sécu.
    const zFrom=Math.min(secu,L.z+ap);
    // Retour 6/10 : LIAISON BASSE — après chaque région (parent OU mini), on
    // revient à 5 mm au-dessus de la matière (à vide, hors gouttière) au lieu
    // de la tour rouge jusqu'à secu, avec inset vers l'intérieur ouvert.
    // 2026-10-08-002 : remontées réglables — mode 'min5' (défaut) = local à
    // 5 mm au-dessus de la bande (was 2 mm) borné par secu ; mode 'plan' =
    // toujours le plan de retrait (secu porte déjà le plan).
    const bandTop=li>0?plan[li-1].z:zt;
    const tvZ=o.remPlan?secu:Math.min(secu,bandTop+5);
    zCur=L.z;
    // ESCARGOT : spirale centre -> faces sur le meme plan/levels, memes
    // entrees/travel ; mini-passes et finition restent conventionnelles.
    // 2026-10-08-003 : sens (avalant = sens de coupe constant) porte par opt.
    if(esc)faoSpiralLevel(M,BB,L.z,D,D/2+L.radial,secu,zFrom,ae,entryMode,o.brutTop,zt,moves,{travelZ:tvZ,sens:o.sens,entryR:o.entryR,zoneAt:o.zoneAt,zoneDense:typeof o.protectTip==='function',stockTop:stockTopF,remBlocked:rem?rem.blocked:null,remTopAt:rem?rem.topAt:null,remPtAt:rem?rem.ptAt:null,zoneSafe:o.zoneSafe||null,
      bullFaces:bullC?function(zz){return faoBullRingRuns(bullCtx(L.radial),zz,o.sens==='avalant',true);}:null,
      bullOK:bullC?function(x,y,zz){return bullCtx(L.radial).tipB(x,y)<=zz+1e-6;}:null});
    else faoRoughAdaptiveLevel(M,BB,L.z,D,D/2+L.radial,secu,zFrom,ae,entryMode,o.brutTop,zt,moves,{travelZ:tvZ,sens:o.sens,entryR:o.entryR,zoneAt:o.zoneAt});
    if(rem)rem.carve();
    if(bullC&&!esc)bullJobs.push([L.radial,L.z,tvZ]); // conventionnel : contour ajouté en fin d'opération
    yield frameYield(); // dessin progressif 005 : pelage du niveau fini
    // MINI-PASSES (retour 4/10) : après le pelage du niveau, contour des parois
    // entre ce plan et le plan du dessus : profondeurs k*h/(nb+1) sous le plan
    // du dessus (strictement entre les deux, jamais dessus), décalage radial
    // ENTIER (= marge finale de paroi — s=0 laissait le contour collé à la
    // cote théorique : gouge sur les parois inclinées, cf. A3).
    if(nb){
      const h=bandTop-L.z;
      if(h>1e-9)for(let k=1;k<=nb;k++){
        const zm=Math.round((bandTop-k*h/(nb+1))*1000)/1000;
        const s=RA.radial;
        zCur=zm;
        // 2026-10-14-008 : outil à rayon de coin — la mini-passe (contour de
        // paroi) est calculée au CONTACT RÉEL de l'outil (laisse Parois), à la
        // même place du parcours, au lieu du calcul fraise droite (~1 mm de
        // trop sur les faces inclinées, torique D25 R2).
        if(bullC)faoBullRingLevel(bullCtx(s),zm,moves,{sens:o.sens,secu:secu,travelZ:tvZ,linkMax:bullLink,minRun:rem?5:0,dzStay:rem?h:0,all:true});
        else faoRoughAdaptiveLevel(M,BB,zm,D,D/2+s,secu,Math.min(secu,bandTop),ae,entryMode,o.brutTop,zt,moves,{ringOnly:true,travelZ:tvZ,sens:o.sens,entryR:o.entryR,zoneAt:o.zoneAt});
        if(rem)rem.carve();
        yield frameYield(); // dessin progressif 005 : mini-passe k
      }
    }
    // FINITION DES PAROIS (8/10) : UNIQUEMENT sur `finIdx` = niveau le plus
    // PROFOND >= plancher detecte (Bas=0 descend sous la poche : le dernier du
    // plan ne la touche pas ; sans plancher utile -> dernier du plan),
    // repetee sur `finitProf` cotes vers le haut quand la dent est plus courte
    // que le mur : j=0 pile au niveau bas, ecart = (haut-bas)/profondeurs
    // cotes suivantes strictement sous `zt` (jamais sur le plan de bord, cas
    // limite de la parite). Entree/travel de chaque cote = niveau
    // STRICTEMENT au-dessus (au niveau bas = bandTop, identique a l'appel
    // unique d'avant) : zFrom=zA, travel=zA+2 comme tvZ.
    // Bande INVISIBLE du maillage (r se mesure au mur theorique) : l'anneau a
    // D/2+off l'attaque par l'exterieur, dernier au contact exact. Risque A3
    // (paroi inclinee / fraise a coin) : case off par defaut.
    if(nf&&li===finIdx){
      const zLow=L.z, zHigh=zt, range=Math.max(0,zHigh-zLow);
      const np=(range>1e-9&&isFinite(+o.finitProf))
        ?Math.max(1,Math.min(9,Math.round(+o.finitProf))):1;
      for(let j=0;j<np;j++){
        const zj=(j===0)?zLow:Math.round((zLow+range*j/np)*1000)/1000;
        zCur=zj;
        let zA=null;
        for(let i=0;i<plan.length;i++)
          if(plan[i].z>zj+1e-9&&(zA===null||plan[i].z<zA))zA=plan[i].z;
        if(zA===null)zA=zt;
        const zF=Math.min(secu,zA),
          tvJ=o.remPlan?secu:Math.min(secu,zA+5); // 2026-10-08-002 : 5 mm (was 2)
        for(let k=1;k<=nf;k++){
          const off=RA.radial*(nf-k)/nf;
          // 2026-10-14-010 : outil à rayon de coin — anneau au contact réel, en place
          if(bullC)faoBullRingLevel(bullCtx(off),zj,moves,{sens:o.sens,secu:secu,travelZ:tvJ,linkMax:bullLink,minRun:rem?5:0,all:true});
          else faoRoughAdaptiveLevel(M,BB,zj,D,D/2+off,secu,zF,ae,entryMode,o.brutTop,zt,moves,{ringOnly:true,travelZ:tvJ,sens:o.sens,entryR:o.entryR,zoneAt:o.zoneAt});
          yield frameYield(); // dessin progressif 005 : finition k
        }
      }
    }
  }
  if(bullC){
    for(let q=0;q<bullJobs.length;q++){const J=bullJobs[q];
      chunkAt.push(moves.length);
      zCur=J[1];
      faoBullRingLevel(bullCtx(J[0]),J[1],moves,{sens:o.sens,secu:secu,travelZ:J[2],linkMax:bullLink,minRun:rem?5:0});
      if(rem)rem.carve();}
    if(bullJobs.length){const lm=moves[moves.length-1];if(lm&&lm.z<secu-1e-9)moves.push({r:1,x:lm.x,y:lm.y,z:secu});}
    yield frameYield();
  }
  faoSliceCache=null;
  // 2026-10-22-001 : FINIR UNE RÉGION AVANT L'AUTRE (« au lieu de passer d'un
  // côté à l'autre ») — réordonnancement des blocs du parcours, voir
  // faoRegionOrder. Case de la fiche (op.parRegion) ; absente = ordre des
  // niveaux (documents existants inchangés).
  if(o.parRegion){
    const bt=isFinite(+o.brutTop)?+o.brutTop:zt;
    const nm=faoRegionOrder(moves,chunkAt,D,secu,function(x,y){return stockTopF?Math.min(bt,stockTopF(x,y)):bt;},
      Math.max(0.5,D/2-0.3*(isFinite(+o.cornerR)?+o.cornerR:0)),BB);
    if(nm!==moves){moves.length=0;for(let i=0;i<nm.length;i++)moves.push(nm[i]);}
  }
  // Retour repère -> pièce : même xf que les yields (source unique) — rotation
  // R(+th) si la zone a tourné le repère, miroir SENS LONG si brut portrait
  // sans zone ; in place, strictement équivalent à l'entrée du flux.
  if(xf)for(let i=0;i<moves.length;i++)xf(moves[i]);
  return moves;
}
// 2026-10-22-001 : ORDRE PAR RÉGION. Le parcours (niveaux du haut vers le bas)
// est coupé en BLOCS aux liaisons qui remontent (suites de rapides avec une
// montée). Empreinte d'un bloc = cases (2 mm) balayées par l'outil (+1 mm).
// Deux blocs qui partagent une case dépendent l'un de l'autre (l'un enlève la
// matière au-dessus de l'autre) ; deux régions sans case commune sont
// indépendantes. RÈGLE : on prend les blocs du niveau le plus haut restant ;
// dès que les blocs restants se séparent en régions disjointes, on finit
// chaque région jusqu'en bas (même règle, récursive) avant la suivante —
// dans l'ordre de première apparition. L'ordre des niveaux est conservé dans
// chaque région. Liaisons : l'originale si elle suit le même bloc qu'avant et
// reste au-dessus de la matière restante (carte 1 mm abaissée bloc par bloc,
// dans le NOUVEL ordre) ; sinon remontée verticale, rapide droit à 2 mm
// au-dessus de la matière restante sous l'outil (plafonné au plan de
// sécurité), descente au point d'entrée d'origine.
function faoRegionOrder(moves,chunkAt,D,secu,topInit,rcut,BB){
  const n=moves.length;
  if(n<4||!chunkAt||chunkAt.length<2)return moves;
  const isTr=new Uint8Array(n);isTr[0]=1;
  for(let i=1;i<n;){
    if(!moves[i].r){i++;continue;}
    let j=i,up=false;
    while(j<n&&moves[j].r){if(moves[j].z>moves[j-1].z+1e-9)up=true;j++;}
    if(up)for(let k=i;k<j;k++)isTr[k]=1;
    i=j;
  }
  const blocks=[];
  for(let i=0;i<n;){
    if(isTr[i]){i++;continue;}
    let j=i;while(j<n&&!isTr[j])j++;
    let ts=i;while(ts>0&&isTr[ts-1])ts--;
    blocks.push({s:i,e:j,ts:ts});i=j;
  }
  const nbk=blocks.length;
  if(nbk<3)return moves;
  let ci=0;
  for(const b of blocks){while(ci+1<chunkAt.length&&chunkAt[ci+1]<=b.s)ci++;b.c=ci;}
  // empreintes -> graphe des blocs (voisins consécutifs par case : suffisant,
  // les sous-ensembles explorés sont des suffixes de niveaux d'une région)
  const g=2,rr=D/2+1,nr=Math.ceil(rr/g)+1;
  const x0=BB.x0-D-4,y0=BB.y0-D-4,nx=Math.ceil((BB.x1-BB.x0+2*D+8)/g)+1,ny=Math.ceil((BB.y1-BB.y0+2*D+8)/g)+1;
  const last=new Int32Array(nx*ny).fill(-1);
  const adj=blocks.map(function(){return new Set();});
  const disc=[];for(let dj=-nr;dj<=nr;dj++)for(let di=-nr;di<=nr;di++)if((di*di+dj*dj)*g*g<=(rr+g*0.71)*(rr+g*0.71))disc.push([di,dj]);
  for(let bi=0;bi<nbk;bi++){const b=blocks[bi];const line=new Set();
    const mark=function(x,y){const i=Math.round((x-x0)/g),j=Math.round((y-y0)/g);if(i>=0&&j>=0&&i<nx&&j<ny)line.add(j*nx+i);};
    for(let k=b.s;k<b.e;k++){const a=moves[k-1],q=moves[k];const L=Math.hypot(q.x-a.x,q.y-a.y),ns=Math.max(1,Math.ceil(L/g));
      for(let t=0;t<=ns;t++)mark(a.x+(q.x-a.x)*t/ns,a.y+(q.y-a.y)*t/ns);}
    const fp=new Set();
    line.forEach(function(c){const i=c%nx,j=(c-i)/nx;for(const d of disc){const ii=i+d[0],jj=j+d[1];if(ii>=0&&jj>=0&&ii<nx&&jj<ny)fp.add(jj*nx+ii);}});
    fp.forEach(function(c){const p=last[c];if(p>=0&&p!==bi){adj[p].add(bi);adj[bi].add(p);}last[c]=bi;});
  }
  // ordre récursif (pile : régions dans l'ordre de première apparition)
  const order=[];const inS=new Uint8Array(nbk);
  const comps=function(S){S.forEach(function(b){inS[b]=1;});const seen=new Uint8Array(nbk);const out=[];
    for(const b0 of S){if(seen[b0])continue;const C=[];const st=[b0];seen[b0]=1;
      while(st.length){const b=st.pop();C.push(b);adj[b].forEach(function(q){if(inS[q]&&!seen[q]){seen[q]=1;st.push(q);}});}
      C.sort(function(a,b){return a-b;});out.push(C);}
    S.forEach(function(b){inS[b]=0;});return out;};
  const stack=[[]];for(let b=0;b<nbk;b++)stack[0].push(b);
  while(stack.length){const S=stack.pop();if(!S.length)continue;
    const C=comps(S);
    if(C.length>1){for(let k=C.length-1;k>=0;k--)stack.push(C[k]);continue;}
    const c0=blocks[S[0]].c;const tail=[];
    for(const b of S){if(blocks[b].c===c0)order.push(b);else tail.push(b);}
    if(tail.length)stack.push(tail);
  }
  let same=true;for(let k=0;k<nbk;k++)if(order[k]!==k){same=false;break;}
  if(same)return moves;
  // carte de la matière restante (1 mm), abaissée dans le nouvel ordre
  const h=1,rb=D/2+0.5,nh=Math.ceil(rb/h);
  const hx0=BB.x0-D-2,hy0=BB.y0-D-2,hnx=Math.ceil((BB.x1-BB.x0+2*D+4)/h)+1,hny=Math.ceil((BB.y1-BB.y0+2*D+4)/h)+1;
  const top=new Float32Array(hnx*hny);
  for(let j=0;j<hny;j++)for(let i=0;i<hnx;i++)top[j*hnx+i]=topInit(hx0+i*h,hy0+j*h);
  const nc=Math.ceil(rcut/h);
  const carve=function(a,b){const L=Math.hypot(b.x-a.x,b.y-a.y),ns=Math.max(1,Math.ceil(L/h)),z=Math.max(a.z,b.z);
    for(let s=0;s<=ns;s++){const x=a.x+(b.x-a.x)*s/ns,y=a.y+(b.y-a.y)*s/ns,ci=Math.round((x-hx0)/h),cj=Math.round((y-hy0)/h);
      for(let dj=-nc;dj<=nc;dj++)for(let di=-nc;di<=nc;di++){if((di*di+dj*dj)*h*h>rcut*rcut)continue;
        const ii=ci+di,jj=cj+dj;if(ii<0||jj<0||ii>=hnx||jj>=hny)continue;const q=jj*hnx+ii;if(z<top[q])top[q]=z;}}};
  const topAt=function(x,y){let m=-1/0;const ci=Math.round((x-hx0)/h),cj=Math.round((y-hy0)/h);
    for(let dj=-nh;dj<=nh;dj++)for(let di=-nh;di<=nh;di++){if((di*di+dj*dj)*h*h>rb*rb)continue;
      const ii=ci+di,jj=cj+dj;if(ii<0||jj<0||ii>=hnx||jj>=hny)continue;const v=top[jj*hnx+ii];if(v>m)m=v;}
    return m;};
  const lineTop=function(a,b){const L=Math.hypot(b.x-a.x,b.y-a.y),ns=Math.max(1,Math.ceil(L/h));let m=-1/0;
    for(let s=0;s<=ns;s++){const v=topAt(a.x+(b.x-a.x)*s/ns,a.y+(b.y-a.y)*s/ns);if(v>m)m=v;}return m;};
  const segOK=function(a,b){const L=Math.hypot(b.x-a.x,b.y-a.y),ns=Math.max(1,Math.ceil(L/h));
    for(let s=0;s<=ns;s++){const t=s/ns;if(topAt(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t)>a.z+(b.z-a.z)*t-0.5)return false;}return true;};
  const out=[];for(let k=0;k<blocks[0].ts;k++)out.push(moves[k]);
  if(!out.length)out.push(moves[0]);
  let prev=-1;
  for(const bi of order){const b=blocks[bi];const cur=out[out.length-1];
    let keep=(bi===prev+1);
    if(keep&&bi>0)for(let k=b.ts;k<b.s;k++)if(!segOK(moves[k-1],moves[k])){keep=false;break;}
    if(keep){for(let k=(bi===0?Math.max(1,out.length):b.ts);k<b.s;k++)out.push(moves[k]);}
    else{const P=moves[b.s-1];
      let H=Math.max(cur.z,P.z,lineTop(cur,P)+2);if(H>secu)H=Math.max(secu,cur.z,P.z);
      if(H>cur.z+1e-9)out.push({r:1,x:cur.x,y:cur.y,z:H});
      if(Math.hypot(P.x-cur.x,P.y-cur.y)>1e-9)out.push({r:1,x:P.x,y:P.y,z:H});
      if(H>P.z+1e-9)out.push(Object.assign({},P,{r:1}));}
    for(let k=b.s;k<b.e;k++){out.push(moves[k]);if(!moves[k].r&&!moves[k-1].r)carve(moves[k-1],moves[k]);}
    prev=bi;
  }
  if(order[nbk-1]===nbk-1)for(let k=blocks[nbk-1].e;k<n;k++)out.push(moves[k]);
  else{const lm=out[out.length-1],zEnd=moves[n-1].z;if(lm.z<zEnd-1e-9)out.push({r:1,x:lm.x,y:lm.y,z:zEnd});}
  return out;
}
function faoGenRough3D(mesh,box,ztop,zbot,o){
  // Appel SYNCHRONE (identique à l'ancienne fonction) : draine le générateur
  // jusqu'au bout. Le flux progressif 005 passe par faoGenRough3DIt via
  // faoOpMovesIt (yield*).
  const it=faoGenRough3DIt(mesh,box,ztop,zbot,o);
  let r; while(!(r=it.next()).done){}
  return r.value;
}
function faoTrochSlot(moves,xa,xb,y,z,D,aeA,yMin,yMax){
  // Trochoïde en VRAIS arcs G2/G3 le long d'un goulet : chaque boucle = 4
  // quarts à 90° (< 180°, IJK incrémental, centre = départ + IJK comme les CN),
  // émis CCW (G3). Engagement d'un seul côté, pas d'arrêt en fond de
  // rainure. Reste dans [xa,xb], Z constant. L'excursion en Y (±Rt) est
  // clampée à la bande balayée (lignes extrêmes ± aeA/2 : au-delà, on ne sait
  // pas que c'est du vide) ; sans place pour un rayon ≥ 0.5 : passe droite.
  const W=xb-xa;
  if(!(W>0.5))return;
  const Y=Math.round(y*1000)/1000;
  const edge=(isFinite(yMin)&&isFinite(yMax))
    ?Math.max(0,Math.min(y-yMin,yMax-y)+Math.max(0.5,isFinite(+aeA)&&+aeA>0?+aeA:2)*0.5)
    :1/0;
  const Rt0=Math.min(D*0.3,aeA*1.5,W/2-0.2,edge);
  if(!(Rt0>=0.5)){
    moves.push({r:0,x:Math.round(xa*1000)/1000,y:Y,z:z});
    moves.push({r:0,x:Math.round(xb*1000)/1000,y:Y,z:z});
    return;
  }
  const Rt=Math.round(Rt0*1000)/1000;
  const pitch=Math.max(0.5,Math.min(aeA,D*0.2));
  moves.push({r:0,x:Math.round((xa+Rt)*1000)/1000,y:Y,z:z});
  let cx=xa+Rt, guard=0;
  while(cx<xb-Rt-1e-9&&guard++<10000){
    const X=Math.round(cx*1000)/1000;
    const xE=Math.round((cx+Rt)*1000)/1000, xW=Math.round((cx-Rt)*1000)/1000;
    const yN=Math.round((y+Rt)*1000)/1000, yS=Math.round((y-Rt)*1000)/1000;
    // E -> N -> W -> S -> E autour de (X,Y), CCW : i,j = centre - départ.
    moves.push({r:0,x:X,y:yN,z:z,arc:{i:Math.round((X-xE)*1000)/1000,j:0,cw:false,troch:true}});
    moves.push({r:0,x:xW,y:Y,z:z,arc:{i:0,j:Math.round((Y-yN)*1000)/1000,cw:false,troch:true}});
    moves.push({r:0,x:X,y:yS,z:z,arc:{i:Math.round((X-xW)*1000)/1000,j:0,cw:false,troch:true}});
    moves.push({r:0,x:xE,y:Y,z:z,arc:{i:0,j:Math.round((Y-yS)*1000)/1000,cw:false,troch:true}});
    cx+=pitch;
  }
  moves.push({r:0,x:Math.round(xb*1000)/1000,y:Y,z:z});
}
// Z vertex triés/dédups/cap 160, mémoïsés par maillage (2026-10-13-002) —
// extrait de faoShadowPlanes : le tri + dédups du maillage (O(N log N)) était
// refait À CHAQUE appel (~1 s de cumul sur 387 appels × 19k vertex).
const faoZvCache=new WeakMap();
function faoZvOf(mesh){
  let zv=faoZvCache.get(mesh);
  if(zv!==undefined)return zv;
  zv=null;
  try{
    const zs=[];
    for(let k=0;k<mesh.v.length;k++){ const q=mesh.v[k][2]; if(isFinite(q))zs.push(q); }
    zs.sort(function(a,b){return a-b;});
    zv=[];
    for(let k=0;k<zs.length;k++)if(!zv.length||zs[k]-zv[zv.length-1]>1e-6)zv.push(zs[k]);
    if(zv.length>160){
      const thin=[zv[0]], st=(zv.length-1)/159;
      for(let k=1;k<159;k++)thin.push(zv[Math.round(k*st)]);
      thin.push(zv[zv.length-1]); zv=thin;
    }
  }catch(e){ zv=null; }
  faoZvCache.set(mesh,zv);
  return zv;
}
function faoShadowPlanes(mesh,z,zt){
  // Plans Z où lire l'ombre : les Z vertex du maillage entre z et zt
  // (dédup 1 µm, cap 160 avec sous-échantillonnage régulier en repli).
  // EXACTITUDE : tout voile horizontal, si fin soit-il, a ses faces haute et
  // basse à des Z vertex — aucun ne peut se cacher entre deux plans
  // (les croisements variant linéairement, l'union des emprises est atteinte
  // aux plans vertex). Sans vertex : grille historique au pas ≤ 2 mm.
  const pls=[Math.round(z*1000)/1000];
  const zv=faoZvOf(mesh);
  if(zv&&zv.length){
    zv.forEach(function(zz){
      if(zz>z+1e-9&&zz<=zt+1e-9)pls.push(Math.round(zz*1000)/1000);
    });
  }else{
    const H=Math.max(0,zt-z), n=Math.max(1,Math.ceil(H/2));
    for(let k=1;k<=n;k++)pls.push(Math.round((z+H*k/n)*1000)/1000);
  }
  const seen={}, out=[];
  pls.forEach(function(zz){ const k=String(zz); if(!seen[k]){seen[k]=1;out.push(zz);} });
  return out;
}
function faoShadowIntervals(mesh,B,y,z,zt,r,aeA,planes){
  // `planes` optionnel : plans pré-calculés du niveau (partagés avec
  // l'hélice) ; sinon calcul local via faoShadowPlanes.
  // Vide à z avec BRUT RESTANT : l'outil vertical n'atteint que ce qui est
  // libre depuis le dessus — union des sections aux plans vertex entre z et
  // zt (faoShadowPlanes : aucun voile fin manqué), dilatées de r, puis
  // complément dans le brut. Les porte-à-faux sont exclus : jamais de plongée
  // sous un surplomb. Matière lue sur 3 lignes (y±aeA) : une ligne pile sur
  // une arête (epsilon scanline) verrait un vide plein large et fraiserait le
  // flanc — les voisines rattrapent le bord. Vide sur les 3 : distance à
  // l'emprise du niveau (voir plus bas).
  // L'outil peut sortir d'un rayon du brut en X : la marge/congé périphérique
  // doit être usiné (centre toléré jusqu'à B.x0-r / B.x1+r, disque tangent
  // au mur — cf. facedep=r+sortie côté facing).
  const lo=B.x0-r, hi=B.x1+r;
  const out=[];
  if(!(hi-lo>0.2))return out;
  const stepY=Math.max(0.5,isFinite(+aeA)&&+aeA>0?+aeA:2);
  const forb=[];
  let hasMat=false; // matière sur un plan/section du niveau (quel que soit y)
  let yLo=1/0, yHi=-1/0; // emprise Y de la matière entre z et zt
  let pls=null;
  const near=[]; // segs (tous plans) à portée du disque en Y : vérification
  // perpendiculaire des bouts d'intervalle (retour 6/10).
  if(Array.isArray(planes)&&planes.length){
    const seen={}, tmp=[];
    planes.forEach(function(zz){
      if(zz>=z-1e-9&&zz<=zt+1e-9){
        const q=Math.round(zz*1000)/1000, k=String(q);
        if(!seen[k]){seen[k]=1;tmp.push(q);}
      }
    });
    pls=tmp.length?tmp:faoShadowPlanes(mesh,z,zt);
  }else pls=faoShadowPlanes(mesh,z,zt);
  pls.forEach(function(zz){
    const segs=faoSliceZCached(mesh,zz);
    if(segs.length)hasMat=true;
    for(let i=0;i<segs.length;i++){
      const s=segs[i];
      if(s[1]<yLo)yLo=s[1];
      if(s[1]>yHi)yHi=s[1];
      if(s[3]<yLo)yLo=s[3];
      if(s[3]>yHi)yHi=s[3];
      if(Math.max(s[1],s[3])>=y-r-1&&Math.min(s[1],s[3])<=y+r+1)near.push(s);
    }
    [y-stepY,y,y+stepY].forEach(function(yy){
      faoScanIntervals(segs,yy).forEach(function(iv){
        const a=Math.max(lo,iv[0]-r), b=Math.min(hi,iv[1]+r);
        if(b-a>-1e-9)forb.push([a,b]);
      });
    });
  });
  if(!forb.length){
    // Ligne qui ne voit rien sur les 3 lectures :
    //  - niveau vide (brut au-dessus de la pièce) : surfaçage pleine largeur ;
    //  - matière à >= r en Y (hors emprise + outil tangent au mur) : colonne
    //    dégagée sur toute la largeur — on vide la marge/le congé, même si la
    //    ligne ne lit de la matière sur aucun plan (c'était la manchette
    //    laissée par l'ancien complément borné à la boîte) ;
    //  - sinon (matière proche non vue : arête pile sur une lecture) :
    //    conservatif, rien — jamais de plongée sous un relief.
    if(!hasMat)return [{a:lo,b:hi,wl:false,wr:false}];
    const d=y<yLo?yLo-y:(y>yHi?y-yHi:0);
    if(d>=r-1e-9)return [{a:lo,b:hi,wl:false,wr:false}];
    return out;
  }
  forb.sort(function(p,q){return p[0]-q[0];});
  const mg=[forb[0].slice()];
  for(let k=1;k<forb.length;k++){
    const last=mg[mg.length-1];
    if(forb[k][0]<=last[1]+1e-9)last[1]=Math.max(last[1],forb[k][1]);
    else mg.push(forb[k].slice());
  }
  let cur=lo;
  mg.forEach(function(f){
    if(f[0]-cur>0.2)out.push({a:cur,b:f[0],wl:cur>lo+1e-9,wr:true});
    if(f[1]>cur)cur=f[1];
  });
  if(hi-cur>0.2)out.push({a:cur,b:hi,wl:cur>lo+1e-9,wr:false});
  // Retour 6/10 — abouts à la DISTANCE PERPENDICULAIRE (laisse 0,5 partout) :
  // l'offset en X (iv±r) donne r·cosθ sur un mur incliné en plan (gouge du
  // −0,14 mesuré) et l'union des 3 lectures y±aeA recule les bouts de
  // aeA·tanθ (1ʳᵉ passe décalée, paliers, faces non usinées). On rapproche /
  // écarte chaque bout jusqu'à dist((x,y),segs)=r (bissection ±1e-3) ; bords
  // de boîte lo/hi intacts (marge/congé périphérique borné par la boîte),
  // puis fusion si deux bouts sont passés à travers un bloc devenu libre.
  if(near.length&&out.length){
    const dAt=function(px){
      let m=1/0;
      for(let i=0;i<near.length;i++){
        const s=near[i],dx=s[2]-s[0],dy=s[3]-s[1],L2=dx*dx+dy*dy;
        let t=L2>0?((px-s[0])*dx+(y-s[1])*dy)/L2:0;
        if(t<0)t=0;else if(t>1)t=1;
        const ex=s[0]+t*dx-px,ey=s[1]+t*dy-y,d2=ex*ex+ey*ey;
        if(d2<m)m=d2;
      }
      return Math.sqrt(m);
    };
    const EPS=1e-3;
    const adj=function(x,dir){ // dir=-1 : bout gauche (extérieur = x croît vers le bas) ; +1 : droit
      if(x<=lo+1e-9||x>=hi-1e-9)return x;
      const d=dAt(x);
      if(Math.abs(d-r)<=EPS)return x;
      let i,safe,unsafe;
      if(d>r){
        // Trop reculé (union y±aeA) : s'approcher jusqu'à dist = r.
        safe=x;unsafe=null;
        for(i=1;i<=64;i*=2){
          const px=x+dir*i,dd=dAt(px);
          if(dd<r-EPS){unsafe=px;break;}
          safe=px;
          if(px<=lo+1e-9||px>=hi-1e-9){unsafe=px;break;}
        }
        if(unsafe===null)return safe;
        for(i=0;i<14;i++){const m=(safe+unsafe)/2;if(dAt(m)>=r-EPS)safe=m;else unsafe=m;}
        return safe;
      }
      // Trop près (dilatation horizontale sur mur incliné) : reculer vers
      // l'intérieur de l'intervalle jusqu'à dist = r.
      unsafe=x;safe=null;
      for(i=1;i<=64;i*=2){
        const px=x-dir*i,dd=dAt(px);
        if(dd>=r-EPS){safe=px;break;}
        if(px<=lo+1e-9||px>=hi-1e-9)break;
        unsafe=px;
      }
      if(safe===null)return x;
      for(i=0;i<14;i++){const m=(safe+unsafe)/2;if(dAt(m)>=r-EPS)safe=m;else unsafe=m;}
      return safe;
    };
    for(let k=0;k<out.length;k++){
      // Clamp [lo,hi] : une bissection qui ne trouve jamais dist < r (marge
      // sans matière) ne doit pas sortir de la boîte±r.
      out[k].a=Math.max(lo,adj(out[k].a,-1));
      out[k].b=Math.min(hi,adj(out[k].b,1));
    }
    out.sort(function(p,q){return p.a-q.a;});
    const mg2=[out[0]];
    for(let k=1;k<out.length;k++){
      const last=mg2[mg2.length-1];
      if(out[k].a<last.b-1e-9)last.b=Math.max(last.b,out[k].b);
      else mg2.push(out[k]);
    }
    out.length=0;
    mg2.forEach(function(iv){if(iv.b-iv.a>0.2)out.push(iv);});
  }
  return out;
}
/* Buckets X par tableau de segments (2026-10-09-004) : faoSliceZCached
   retourne le MÊME tableau — les deux tests de faoYCands ne dépendent
   que de x : croisement vertical ⟸ cellule(x) ; hit perpendiculaire
   (dd<r ⇒ point le plus proche dans l'AABB x ∩ [x±r]) ⟸ cellules
   [x±r]. Sur-ensemble exact ; les candidats sont rejoués dans l'ordre
   d'index d'origine (ordre, ties et hit identiques). */
const fxbCache=(typeof WeakMap!=='undefined')?new WeakMap():null;
const fxbC=4, fxbMax=64; // cellules mm ; > 256 mm d'AABB → liste permanente
function fxbIdx(segs){
  if(!fxbCache)return null;
  let g=fxbCache.get(segs);
  if(g)return g;
  g={bk:new Map(),ov:[],st:new Int32Array(segs.length),stp:0};
  for(let i=0;i<segs.length;i++){
    const s=segs[i];
    const ix0=Math.floor(Math.min(s[0],s[2])/fxbC),ix1=Math.floor(Math.max(s[0],s[2])/fxbC);
    if(ix1-ix0+1>fxbMax){g.ov.push(i);continue;}
    for(let ix=ix0;ix<=ix1;ix++){
      let a=g.bk.get(ix); if(!a){a=[];g.bk.set(ix,a);}
      a.push(i);
    }
  }
  fxbCache.set(segs,g);
  return g;
}
function faoXBCand(segs,x,r){
  const g=fxbIdx(segs);
  if(!g){ // repli sans WeakMap : tous les index, ordre croissant (identique)
    const out=new Array(segs.length);
    for(let i=0;i<segs.length;i++)out[i]=i;
    return out;
  }
  const st=++g.stp;
  const out=[];
  const r0=Math.floor((x-r)/fxbC),r1=Math.floor((x+r)/fxbC);
  for(let ix=r0;ix<=r1;ix++){
    const a=g.bk.get(ix); if(!a)continue;
    for(let t=0;t<a.length;t++){const i=a[t];
      if(g.st[i]!==st){g.st[i]=st;out.push(i);}}
  }
  for(let t=0;t<g.ov.length;t++){const i=g.ov[t];
    if(g.st[i]!==st){g.st[i]=st;out.push(i);}}
  out.sort(function(a,b){return a-b;});
  return out;
}
function faoYCands(mesh,planes,z,zt,y,r,ivs){
  // Y sûrs les plus proches d'abord pour une ligne dont le disque
  // [y-r,y+r] traverserait une paroi en Y sur ses intervalles ; [] = aucun
  // croisement. Lecture verticale exacte : croisements X des segs de la
  // section à chaque plan vertex du niveau (mêmes plans que l'ombre) aux
  // échantillons x de chaque intervalle, appariés 0-1, 2-3 (even-odd).
  // Règle : recouvrement > 1 µm — la tangence (y+r==v0 ou y-r==v1, ulps
  // compris) reste admise : lignes de marge d>=r et disques tangents.
  // Candidats par arête traversée [v0,v1] : v0-r (dessous), v1+r (dessus).
  const pls=[], seen={};
  for(let i=0;i<planes.length;i++){
    const zz=planes[i];
    if(zz>=z-1e-9&&zz<=zt+1e-9){
      const q=Math.round(zz*1000)/1000,k=String(q);
      if(!seen[k]){seen[k]=1;pls.push(q);}
    }
  }
  if(!pls.length)return [];
  const cross=[];
  for(let i=0;i<ivs.length;i++){
    const a=ivs[i].a,b=ivs[i].b,w=b-a;
    if(!(w>0.05))continue;
    const d=Math.min(1,w/8);
    const xs=[a+d,(a+b)/2,b-d];
    for(let si=0;si<xs.length;si++){
      const x=xs[si];
      for(let pi=0;pi<pls.length;pi++){
        const segs=faoSliceZCached(mesh,pls[pi]);
        const ys=[];
        let hit=null; // seg le plus proche si distance perpendiculaire < r
        const cand=faoXBCand(segs,x,r); // 2026-10-09-004 : cellules X utiles
        for(let ci=0;ci<cand.length;ci++){
          const s=segs[cand[ci]];
          if((s[0]<x&&x<s[2])||(s[2]<x&&x<s[0])){
            const t=(x-s[0])/(s[2]-s[0]);
            ys.push(s[1]+t*(s[3]-s[1]));
          }
          if(Math.max(s[1],s[3])<y-r-1||Math.min(s[1],s[3])>y+r+1)continue;
          const dx=s[2]-s[0],dy=s[3]-s[1],L2=dx*dx+dy*dy;
          let t=L2>0?((x-s[0])*dx+(y-s[1])*dy)/L2:0;
          if(t<0)t=0;else if(t>1)t=1;
          const ex=s[0]+t*dx-x,ey=s[1]+t*dy-y;
          const dd=Math.sqrt(ex*ex+ey*ey);
          if(dd<r-1e-3&&(!hit||dd<hit.d))hit={d:dd,ny:s[1]+t*dy};
        }
        ys.sort(function(p,q){return p-q;});
        for(let k=0;k+1<ys.length;k+=2){
          const v0=ys[k],v1=ys[k+1];
          // Recouvrement > 1 µm seulement : la tangence — et les ulps du
          // calcul de v1+r — ne sont pas un croisement (candidat tangent
          // accepté au re-test, dédup au µm des jumeaux).
          const ov=Math.min(y+r,v1)-Math.max(y-r,v0);
          if(ov>1e-6)cross.push(Math.round((v0-r)*1e6)/1e6,Math.round((v1+r)*1e6)/1e6);
        }
        if(hit){
          // Retour 6/10 : mur incliné à distance perpendiculaire < r alors
          // que le recouvrement vertical est nul (r·cosθ — le gouge −0,14
          // mesuré sur les parois à ~25°). Candidat = sortir
          // perpendiculairement, du côté opposé au mur ; la descente 007
          // confirme ensuite au re-test (clean = distance ≥ r exacte).
          if(y>hit.ny)cross.push(Math.round((y+(r+0.5))*1e6)/1e6);
          else if(y<hit.ny)cross.push(Math.round((y-(r+0.5))*1e6)/1e6);
          else{cross.push(Math.round((y+(r+0.5))*1e6)/1e6,Math.round((y-(r+0.5))*1e6)/1e6);}
        }
      }
    }
  }
  if(!cross.length)return [];
  cross.sort(function(p,q){return Math.abs(p-y)-Math.abs(q-y)||p-q;});
  const out=[];
  for(let i=0;i<cross.length;i++){
    if(!out.length||out[out.length-1]!==cross[i])out.push(cross[i]);
  }
  return out;
}
