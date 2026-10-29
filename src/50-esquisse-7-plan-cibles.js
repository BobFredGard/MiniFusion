// Esquisse (7/7) : arêtes et points du PLAN d'esquisse utilisables directement (V0.20.1).
// Les arêtes du solide qui sont DANS le plan, leurs extrémités, milieux, centres, leurs
// croisements, et les points où une arête traverse le plan s'allument au survol (orange) dans
// les outils de dessin et Cote. Au clic, l'entité est projetée en construction comme avec ⧉
// (associative : suit le solide au rejeu) — l'utilisateur n'a plus à projeter ce qui est déjà
// dans le plan. Les arêtes hors du plan restent l'affaire de ⧉.
const SK_PL_TOOLS=new Set(['line','rect','slot','circle','arc','cpoint','hpoint','spline','cspline','dim']);
const SK_PL_TOLZ=2e-3; // écart au plan toléré (mm) : arête « dans le plan »
let skPlHover=null; // cible sous le curseur {kind:'pt'|'edge',...} — transitoire, jamais sauvée
let _skPlCache=null; // {id,live,T} : cibles de l'esquisse ouverte (vidé par skBuildRefs)
function skPlShape(p2){
  // polyligne 2D d'une arête → {type:'line'|'circle'|'arc'|'curve',...} (mêmes seuils que ⧉)
  if(!p2||p2.length<2)return null;
  const A=p2[0],B=p2[p2.length-1];
  if(p2.length>=6){
    const p0=A,p1=p2[Math.floor(p2.length/3)],q2=p2[Math.floor(2*p2.length/3)];
    const d=2*(p0[0]*(p1[1]-q2[1])+p1[0]*(q2[1]-p0[1])+q2[0]*(p0[1]-p1[1]));
    if(Math.abs(d)>1e-9){
      const s0=p0[0]*p0[0]+p0[1]*p0[1],s1=p1[0]*p1[0]+p1[1]*p1[1],s2=q2[0]*q2[0]+q2[1]*q2[1];
      const cx=(s0*(p1[1]-q2[1])+s1*(q2[1]-p0[1])+s2*(p0[1]-p1[1]))/d,cy=(s0*(q2[0]-p1[0])+s1*(p0[0]-q2[0])+s2*(p1[0]-p0[0]))/d;
      const r=Math.hypot(p0[0]-cx,p0[1]-cy);
      if(r>0.5){let dev=0;for(const p of p2)dev=Math.max(dev,Math.abs(Math.hypot(p[0]-cx,p[1]-cy)-r));
        if(dev<0.35){
          if(Math.hypot(B[0]-A[0],B[1]-A[1])<0.5)return{type:'circle',cx,cy,r};
          const pm=p2[Math.floor(p2.length/2)],oa=arcOrient(cx,cy,A[0],A[1],B[0],B[1],pm[0],pm[1]);
          return{type:'arc',cx,cy,r,x1:oa[0],y1:oa[1],x2:oa[2],y2:oa[3]};
        }}
    }
  }
  const cl=Math.hypot(B[0]-A[0],B[1]-A[1]);if(cl<1e-6)return null;
  let dv=0;for(const p of p2)dv=Math.max(dv,Math.abs((p[0]-A[0])*(B[1]-A[1])-(p[1]-A[1])*(B[0]-A[0]))/cl);
  return dv>0.02?{type:'curve',pts:p2.map(p=>p.slice())}:{type:'line',x1:A[0],y1:A[1],x2:B[0],y2:B[1]};
}
function skPlTouches(sk,e3){
  // points 2D où une arête 3D (hors plan) rencontre le plan : traversées + bouts posés dessus
  const{u,v,n,o}=sketchBasis(sk),out=[];
  const z=p=>(p[0]-o.x)*n.x+(p[1]-o.y)*n.y+(p[2]-o.z)*n.z;
  const put=p=>out.push([(p[0]-o.x)*u.x+(p[1]-o.y)*u.y+(p[2]-o.z)*u.z,(p[0]-o.x)*v.x+(p[1]-o.y)*v.y+(p[2]-o.z)*v.z]);
  const P=e3.pts,Z=P.map(z);
  for(let i=0;i<P.length;i++){
    if(Math.abs(Z[i])<SK_PL_TOLZ){put(P[i]);continue;}
    if(i+1<P.length&&Math.abs(Z[i+1])>=SK_PL_TOLZ&&Z[i]*Z[i+1]<0){const t=Z[i]/(Z[i]-Z[i+1]);
      put([P[i][0]+(P[i+1][0]-P[i][0])*t,P[i][1]+(P[i+1][1]-P[i][1])*t,P[i][2]+(P[i+1][2]-P[i][2])*t]);}
  }
  return out;
}
function skPlIsect(a,b){
  // croisements 2D de deux arêtes du plan (ligne / cercle / arc) — points à l'intérieur des deux
  const on=(e,x,y)=>{
    if(e.type==='line'){const dx=e.x2-e.x1,dy=e.y2-e.y1,L2=dx*dx+dy*dy;if(L2<1e-12)return false;const t=((x-e.x1)*dx+(y-e.y1)*dy)/L2;return t>-1e-6&&t<1+1e-6;}
    if(e.type==='arc')return angInArc(Math.atan2(y-e.cy,x-e.cx),Math.atan2(e.y1-e.cy,e.x1-e.cx),Math.atan2(e.y2-e.cy,e.x2-e.cx));
    return true;
  };
  const C=e=>e.type==='circle'||e.type==='arc';
  let R=[];
  if(a.type==='line'&&b.type==='line'){
    const dx1=a.x2-a.x1,dy1=a.y2-a.y1,dx2=b.x2-b.x1,dy2=b.y2-b.y1,den=dx1*dy2-dy1*dx2;
    if(Math.abs(den)<1e-12)return[];
    const t=((b.x1-a.x1)*dy2-(b.y1-a.y1)*dx2)/den;R=[[a.x1+t*dx1,a.y1+t*dy1]];
  }else if(a.type==='line'&&C(b)||C(a)&&b.type==='line'){
    const L=a.type==='line'?a:b,K=a.type==='line'?b:a;
    const dx=L.x2-L.x1,dy=L.y2-L.y1,fx=L.x1-K.cx,fy=L.y1-K.cy,A2=dx*dx+dy*dy,B2=2*(fx*dx+fy*dy),C2=fx*fx+fy*fy-K.r*K.r,D=B2*B2-4*A2*C2;
    if(A2<1e-12||D<0)return[];
    const s=Math.sqrt(D);R=[(-B2-s)/(2*A2),(-B2+s)/(2*A2)].map(t=>[L.x1+t*dx,L.y1+t*dy]);
  }else if(C(a)&&C(b)){
    const dx=b.cx-a.cx,dy=b.cy-a.cy,d=Math.hypot(dx,dy);
    if(d<1e-9||d>a.r+b.r||d<Math.abs(a.r-b.r))return[];
    const l=(a.r*a.r-b.r*b.r+d*d)/(2*d),h=Math.sqrt(Math.max(0,a.r*a.r-l*l)),mx=a.cx+dx*l/d,my=a.cy+dy*l/d;
    R=[[mx-dy*h/d,my+dx*h/d],[mx+dy*h/d,my-dx*h/d]];
  }else return[];
  return R.filter(p=>on(a,p[0],p[1])&&on(b,p[0],p[1]));
}
function skPlBuild(sk){
  // arêtes du plan (E) et points remarquables (P) vus par l'esquisse (antériorité de ⧉)
  const E=[],P=[];
  let edges=null;try{edges=projEdgesFor(sk);}catch(e){edges=null;}
  const{u,v,n,o}=sketchBasis(sk);
  const z=p=>(p[0]-o.x)*n.x+(p[1]-o.y)*n.y+(p[2]-o.z)*n.z;
  const seen=new Set(),k=x=>(Math.round(x*1e4)/1e4).toFixed(4);
  const keyOf=s=>s.type==='circle'?'c'+k(s.cx)+k(s.cy)+k(s.r):s.type==='curve'?'s'+s.pts.map(p=>k(p[0])+k(p[1])).join():
    s.type+[k(s.x1)+','+k(s.y1),k(s.x2)+','+k(s.y2)].sort().join(';')+(s.type==='arc'?k(s.cx)+k(s.cy):'');
  const addE=s=>{if(!s)return;const key=keyOf(s);if(seen.has(key))return;seen.add(key);E.push(s);};
  const pierce=[];
  if(edges&&edges.length){
    for(const e of edges){
      if(!e||!e.pts||e.pts.length<2)continue;
      if(e.pts.every(p=>Math.abs(z(p))<SK_PL_TOLZ)){
        const s=skPlShape(e.pts.map(p=>[(p[0]-o.x)*u.x+(p[1]-o.y)*u.y+(p[2]-o.z)*u.z,(p[0]-o.x)*v.x+(p[1]-o.y)*v.y+(p[2]-o.z)*v.z]));
        if(s){if(e.mid)s.srcMid=e.mid.slice();addE(s);}
        continue;
      }
      skPlTouches(sk,e).forEach(q=>pierce.push({x:q[0],y:q[1],srcMid:e.mid?e.mid.slice():null}));
    }
  }else{
    // sans noyau : références du plan (sans lien de suivi — projections figées)
    (sk._refs||[]).forEach(r=>{
      if(r.type==='circle')addE({type:'circle',cx:r.cx,cy:r.cy,r:r.r});
      else if(r.type==='arc')addE({type:'arc',cx:r.cx,cy:r.cy,r:r.r,x1:r.cx+r.r*Math.cos(r.a1),y1:r.cy+r.r*Math.sin(r.a1),x2:r.cx+r.r*Math.cos(r.a2),y2:r.cy+r.r*Math.sin(r.a2)});
      else if(isFinite(r.x1))addE({type:'line',x1:r.x1,y1:r.y1,x2:r.x2,y2:r.y2});
    });
  }
  const near=(x,y)=>P.find(p=>Math.hypot(p.x-x,p.y-y)<1e-4);
  const addP=(kind,x,y,i)=>{const q=near(x,y);if(q){if(i!=null&&q.e.indexOf(i)<0)q.e.push(i);return;}P.push({kind,x,y,e:i!=null?[i]:[]});};
  E.forEach((s,i)=>{
    if(s.type==='line'){addP('end',s.x1,s.y1,i);addP('end',s.x2,s.y2,i);}
    else if(s.type==='arc'){addP('end',s.x1,s.y1,i);addP('end',s.x2,s.y2,i);}
    else if(s.type==='curve'){const a=s.pts[0],b=s.pts[s.pts.length-1];addP('end',a[0],a[1],i);addP('end',b[0],b[1],i);}
  });
  // centres et milieux APRÈS les sommets : un sommet confondu garde sa nature de sommet
  E.forEach((s,i)=>{
    if(s.type==='line'){if(!near((s.x1+s.x2)/2,(s.y1+s.y2)/2))P.push({kind:'mid',x:(s.x1+s.x2)/2,y:(s.y1+s.y2)/2,e:[i]});}
    else if(s.type!=='curve'&&!near(s.cx,s.cy))P.push({kind:'center',x:s.cx,y:s.cy,e:[i]});
  });
  if(E.length<=600)for(let i=0;i<E.length;i++)for(let j=i+1;j<E.length;j++)
    skPlIsect(E[i],E[j]).forEach(q=>{if(!near(q[0],q[1]))P.push({kind:'isect',x:q[0],y:q[1],e:[i,j]});});
  pierce.forEach(q=>{if(!near(q.x,q.y))P.push({kind:'pierce',x:q.x,y:q.y,e:[],srcMid:q.srcMid});});
  return{E,P};
}
function skPlTargets(sk){
  if(!sk)return null;
  const live=(typeof occLive!=='undefined'&&occLive)?occLive.shape:null;
  if(_skPlCache&&_skPlCache.id===sk.id&&_skPlCache.live===live)return _skPlCache.T;
  let T=null;try{T=skPlBuild(sk);}catch(e){T={E:[],P:[]};}
  _skPlCache={id:sk.id,live,T};
  return T;
}
function skPlFoot(s,x,y){
  // pied du curseur sur une arête du plan → {d,x,y}
  if(s.type==='line'){const dx=s.x2-s.x1,dy=s.y2-s.y1,L2=dx*dx+dy*dy||1e-12,t=Math.max(0,Math.min(1,((x-s.x1)*dx+(y-s.y1)*dy)/L2));
    const fx=s.x1+t*dx,fy=s.y1+t*dy;return{d:Math.hypot(x-fx,y-fy),x:fx,y:fy};}
  if(s.type==='circle'||s.type==='arc'){const dc=Math.hypot(x-s.cx,y-s.cy);if(dc<1e-9)return null;
    if(s.type==='arc'&&!angInArc(Math.atan2(y-s.cy,x-s.cx),Math.atan2(s.y1-s.cy,s.x1-s.cx),Math.atan2(s.y2-s.cy,s.x2-s.cx)))return null;
    return{d:Math.abs(dc-s.r),x:s.cx+(x-s.cx)/dc*s.r,y:s.cy+(y-s.cy)/dc*s.r};}
  return null; // courbe : seuls ses bouts sont des cibles
}
function skPlHit(sk,x,y){
  // cible du plan sous (x,y) : point remarquable d'abord, puis arête (pied)
  const T=skPlTargets(sk);if(!T||(!T.E.length&&!T.P.length))return null;
  let best=null,bd=SK_SNAP;
  T.P.forEach(p=>{const d=Math.hypot(p.x-x,p.y-y);if(d<bd){bd=d;best={kind:'pt',p,x:p.x,y:p.y};}});
  if(best)return best;
  bd=SK_PICK;
  T.E.forEach((s,i)=>{const f=skPlFoot(s,x,y);if(f&&f.d<bd){bd=f.d;best={kind:'edge',i,x:f.x,y:f.y};}});
  return best;
}
function skPlSnap(sk,x,y){
  // findSnap : accroche sur le plan, seulement dans les outils concernés
  if(!SK_PL_TOOLS.has(skTool))return null;
  const h=skPlHit(sk,x,y);
  skPlHover=h;
  return h?{kind:'plane',x:h.x,y:h.y,pl:h}:null;
}
function skPlSame(sk,en,s){
  // entité déjà présente sur l'arête s (projetée, ou dessinée pile dessus) ?
  const P=sk.points,eq=(p,x,y)=>p&&Math.hypot(p.x-x,p.y-y)<1e-4;
  if(s.type==='line'&&en.t==='line')return(eq(P[en.p1],s.x1,s.y1)&&eq(P[en.p2],s.x2,s.y2))||(eq(P[en.p1],s.x2,s.y2)&&eq(P[en.p2],s.x1,s.y1));
  if(s.type==='circle'&&en.t==='circle')return eq(P[en.pc],s.cx,s.cy)&&Math.abs(en.r-s.r)<1e-4;
  if(s.type==='arc'&&en.t==='arc')return eq(P[en.pc],s.cx,s.cy)&&Math.abs(en.r-s.r)<1e-4&&eq(P[en.pa],s.x1,s.y1)&&eq(P[en.pb],s.x2,s.y2);
  if(s.type==='curve'&&en.t==='spline'&&en.pts&&en.pts.length){const a=s.pts[0],b=s.pts[s.pts.length-1],A=P[en.pts[0]],B=P[en.pts[en.pts.length-1]];
    return(eq(A,a[0],a[1])&&eq(B,b[0],b[1]))||(eq(A,b[0],b[1])&&eq(B,a[0],a[1]));}
  return false;
}
function skProjectCreate(sk,pr){
  // entité projetée en construction (⧉ et usage direct du plan) → id, ou null
  if(pr.type==='circle'){
    const pc=addPoint(sk,pr.cx,pr.cy);
    sk.constraints.push({id:skNewEid(sk),type:'fix',p:pc});
    const eid=skNewEid(sk);
    sk.entities.push(Object.assign({id:eid,t:'circle',pc,r:pr.r,construction:true,proj:true},projNames(pr)));
    sk.constraints.push({id:skNewEid(sk),type:'fix',ent:eid});
    return eid;
  }
  if(pr.type==='arc'){
    const pc=addPoint(sk,pr.cx,pr.cy),pa=addPoint(sk,pr.x1,pr.y1),pb=addPoint(sk,pr.x2,pr.y2);
    sk.constraints.push({id:skNewEid(sk),type:'fix',p:pc},{id:skNewEid(sk),type:'fix',p:pa},{id:skNewEid(sk),type:'fix',p:pb});
    const eid=skNewEid(sk);
    sk.entities.push(Object.assign({id:eid,t:'arc',pc,pa,pb,r:pr.r,construction:true,proj:true},projNames(pr)));
    sk.constraints.push({id:skNewEid(sk),type:'fix',ent:eid});
    return eid;
  }
  if(pr.type==='curve'){ // lot 3 : arête courbe → spline par points de passage fixés (construction)
    const eid=skSplineProject(sk,pr.pts);if(!eid)return null;
    Object.assign(entById(sk,eid),{construction:true,proj:true},projNames(pr));
    return eid;
  }
  const p1=addPoint(sk,pr.x1,pr.y1),p2=addPoint(sk,pr.x2,pr.y2);
  const eid=skNewEid(sk);
  sk.entities.push(Object.assign({id:eid,t:'line',p1,p2,construction:true,proj:true},projNames(pr)));
  sk.constraints.push({id:skNewEid(sk),type:'fix',p:p1},{id:skNewEid(sk),type:'fix',p:p2});
  return eid;
}
function skPlEnsureEdge(sk,i){
  // l'arête du plan n° i comme entité d'esquisse (réutilisée si déjà là)
  const T=skPlTargets(sk),s=T&&T.E[i];if(!s)return null;
  const ex=(sk.entities||[]).find(en=>skPlSame(sk,en,s));
  if(ex)return ex;
  const eid=skProjectCreate(sk,s);
  return eid?entById(sk,eid):null;
}
function skPlPin(sk,pid,en){
  // point posé SUR une entité (ligne / cercle / arc / spline)
  const has=f=>(sk.constraints||[]).some(f);
  if(en.t==='line'){if(en.p1===pid||en.p2===pid||has(c=>c.type==='online'&&c.p===pid&&c.line===en.id))return;
    sk.constraints.push({id:skNewEid(sk),type:'online',p:pid,line:en.id});}
  else if(en.t==='circle'||en.t==='arc'){if(en.pa===pid||en.pb===pid||has(c=>c.type==='oncircle'&&c.p===pid&&c.ent===en.id))return;
    sk.constraints.push({id:skNewEid(sk),type:'oncircle',p:pid,ent:en.id});}
  else if(en.t==='spline'){if(has(c=>c.type==='onspline'&&c.p===pid&&c.ent===en.id))return;
    sk.constraints.push({id:skNewEid(sk),type:'onspline',p:pid,ent:en.id});}
}
function skPlMaterialize(sk,h){
  // cible du plan → id de point d'esquisse, entités projetées créées au besoin (associatives)
  const T=skPlTargets(sk);if(!T||!h)return null;
  if(h.kind==='edge'){const en=skPlEnsureEdge(sk,h.i);const pid=addPoint(sk,h.x,h.y);if(en)skPlPin(sk,pid,en);return pid;}
  const p=h.p,eq=(q,x,y)=>q&&Math.hypot(q.x-x,q.y-y)<1e-4;
  if(p.kind==='end'){
    // arête déjà projetée d'abord, sinon une ligne, sinon un arc (le sommet en est une extrémité)
    const rank=i=>{const s=T.E[i];return((sk.entities||[]).some(en=>skPlSame(sk,en,s))?0:10)+(s.type==='line'?0:s.type==='arc'?1:2);};
    const i=p.e.slice().sort((a,b)=>rank(a)-rank(b))[0];
    const en=skPlEnsureEdge(sk,i);
    if(en){const ends=en.t==='line'?[en.p1,en.p2]:en.t==='arc'?[en.pa,en.pb]:en.t==='spline'?[en.pts[0],en.pts[en.pts.length-1]]:[];
      const q=ends.find(id=>eq(sk.points[id],p.x,p.y));if(q)return q;}
    return addPoint(sk,p.x,p.y);
  }
  if(p.kind==='center'){const en=skPlEnsureEdge(sk,p.e[0]);return en&&en.pc?en.pc:addPoint(sk,p.x,p.y);}
  const pid=addPoint(sk,p.x,p.y);
  if(p.kind==='mid'){const en=skPlEnsureEdge(sk,p.e[0]);if(en&&en.t==='line')sk.constraints.push({id:skNewEid(sk),type:'midpoint',p:pid,line:en.id});}
  else if(p.kind==='isect')p.e.forEach(i=>{const en=skPlEnsureEdge(sk,i);if(en)skPlPin(sk,pid,en);});
  else if(p.kind==='pierce'){
    // arête qui traverse le plan : point de construction projeté, fixe, suivi au rejeu (srcMid)
    sk.constraints.push({id:skNewEid(sk),type:'fix',p:pid});
    sk.entities.push(Object.assign({id:skNewEid(sk),t:'cpoint',p:pid,construction:true,proj:true,pierce:true},projNames({srcMid:p.srcMid})));
  }
  return pid;
}
function skPlTrackPierce(sk,e,EO){
  // rejeu : le point de traversée suit son arête source (retrouvée par son milieu mémorisé)
  const Q=sk.points[e.p];if(!Q||!e.srcMid)return false;
  const edges=EO!==undefined?EO:projEdgesFor(sk);if(!edges||!edges.length)return false;
  let src=null,bd=Infinity;
  edges.forEach(ed=>{if(!ed.mid)return;const d=Math.hypot(ed.mid[0]-e.srcMid[0],ed.mid[1]-e.srcMid[1],ed.mid[2]-e.srcMid[2]);if(d<bd){bd=d;src=ed;}});
  if(!src)return false;
  e.srcMid=src.mid.slice();
  let q=null;bd=Infinity;
  skPlTouches(sk,src).forEach(t=>{const d=Math.hypot(t[0]-Q.x,t[1]-Q.y);if(d<bd){bd=d;q=t;}});
  if(!q||Math.hypot(q[0]-Q.x,q[1]-Q.y)<=0.02)return false;
  Q.x=q[0];Q.y=q[1];return true;
}
function skPlUndoIfPlane(sk,x,y){
  // 1er clic d'un outil sur une cible du plan : instantané d'annulation AVANT la projection
  if(!SK_PL_TOOLS.has(skTool))return;
  if(nearestPoint(sk,x,y,SK_SNAP))return;
  if(skPlHit(sk,x,y))skPushUndo();
}
function skPlDimPrep(sk,x,y){
  // outil Cote : une arête / un point du plan sous le clic devient une entité cotable
  if(nearestPoint(sk,x,y,SK_PT)||nearestEntity(sk,x,y,SK_PICK))return false;
  const h=skPlHit(sk,x,y);if(!h)return false;
  skPushUndo();
  if(h.kind==='edge')skPlEnsureEdge(sk,h.i);else skPlMaterialize(sk,h);
  skPlHover=null;
  return true;
}
function skPlDrawHover(sk){
  // surbrillance orange de la cible du plan survolée (arête(s) + point)
  const h=skPlHover;if(!h||!SK_PL_TOOLS.has(skTool))return;
  const T=skPlTargets(sk);if(!T)return;
  const C='#ff9f0a';
  const drawE=s=>{
    if(!s)return;
    if(s.type==='circle'){const[a,b]=w2s(s.cx,s.cy);skEl('circle',{cx:a,cy:b,r:s.r*skView.s,fill:'none',stroke:C,'stroke-width':3,opacity:0.9});}
    else if(s.type==='arc'){const a1=Math.atan2(s.y1-s.cy,s.x1-s.cx),a2=Math.atan2(s.y2-s.cy,s.x2-s.cx);let dd=a2-a1;while(dd<=0)dd+=Math.PI*2;
      const[a,b]=w2s(s.x1,s.y1),[c,d]=w2s(s.x2,s.y2);
      skEl('path',{d:`M ${a} ${b} A ${s.r*skView.s} ${s.r*skView.s} 0 ${dd>Math.PI?1:0} 0 ${c} ${d}`,fill:'none',stroke:C,'stroke-width':3,opacity:0.9});}
    else if(s.type==='curve')skEl('path',{d:'M '+s.pts.map(q=>{const w=w2s(q[0],q[1]);return w[0].toFixed(1)+' '+w[1].toFixed(1);}).join(' L '),fill:'none',stroke:C,'stroke-width':3,opacity:0.9});
    else{const[a,b]=w2s(s.x1,s.y1),[c,d]=w2s(s.x2,s.y2);skEl('line',{x1:a,y1:b,x2:c,y2:d,stroke:C,'stroke-width':3,opacity:0.9});}
  };
  if(h.kind==='edge')drawE(T.E[h.i]);
  else (h.p.e||[]).forEach(i=>drawE(T.E[i]));
  const[a,b]=w2s(h.x,h.y);
  if(h.kind==='pt'&&h.p.kind==='pierce')skEl('path',{d:`M ${a} ${b-6} L ${a+6} ${b} L ${a} ${b+6} L ${a-6} ${b} Z`,fill:C,stroke:'#101012','stroke-width':1});
  else skEl('circle',{cx:a,cy:b,r:h.kind==='pt'?5:3.5,fill:C,stroke:'#101012','stroke-width':1});
}
