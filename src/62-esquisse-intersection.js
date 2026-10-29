/* ============ Esquisse : Intersection (Créer > Projeter/Inclure > Intersection) ============
   Comme Fusion : courbes d'intersection entre le PLAN d'esquisse et des FACES choisies ou un
   CORPS entier. Noyau exact : BRepAlgoAPI_Section(solide | face, gp_Pln) ; chaque arête de
   section devient ligne / arc / cercle d'esquisse ; les autres courbes (ellipse, B-spline)
   une spline par points de passage aux n points d'un découpage régulier en paramètre (même
   découpage au rejeu) — une polyligne avant le lot 3 des splines.
   Entités de RÉFÉRENCE comme les projections : proj:true, construction par défaut (option
   « géométrie normale » pour s'en servir de profil), points fixés et partagés aux jonctions
   (contour fermé), nom « Intersection N ». La source est mémorisée sur chaque entité :
     e.isect = {mode:'body', pt:[x,y,z]|null}   corps le plus proche de pt (null = tous)
             | {mode:'faces', faces:[réf. de face]} réf. occFaceRefAny, retrouvée par occFindFaceAny
             | {mode:'mesh'}                       repli SANS noyau : section du maillage, figée
   Au rejeu, updateAssociativeProjections recalcule la section de la source (antériorité :
   solide vu par l'esquisse, comme les projections) et rebranche chaque entité sur la courbe
   de même type la plus proche de son milieu 3D mémorisé (srcMid ; centre pour un cercle). */
const ISECT_DENSE=256;   // échantillon dense (régulier en paramètre) des courbes libres
const ISECT_TOL=0.02;    // mm — écart corde / courbe visé pour la polyligne d'une courbe libre
let skIsectHover=null;   // {mode:'face'|'body', fk, solid, at:[x,y,z]|null} sous le curseur
let skIsectSel=[];       // faces retenues au Ctrl+clic : [{fk, ref}]
let skIsectReal=false;   // true = courbes créées en géométrie normale (profil) au lieu de construction
let _isectCands=null;    // {sk, list, mesh} : sections candidates de la session d'outil
let _isectLive=null;     // {shape, map} : cache des sources (esquisse non consommée → occLive)
const _isectPersist=new Map(); // cache des sources par préfixe de timeline (comme _projEdgePersist)

function skIsectReset(){skIsectHover=null;skIsectSel=[];_isectCands=null;}
function isectTo2(B,q){const dx=q[0]-B.o.x,dy=q[1]-B.o.y,dz=q[2]-B.o.z;return [dx*B.u.x+dy*B.u.y+dz*B.u.z,dx*B.v.x+dy*B.v.y+dz*B.v.z,dx*B.n.x+dy*B.n.y+dz*B.n.z];}

/* ----- noyau exact : section d'une forme par le plan d'esquisse ----- */
function occIsectEdgePrim(e,B){
  // Arête de section → primitive 2D {type:'line'|'circle'|'arc'|'curve', …, mid3, on3}.
  // mid3 = identité de suivi (centre pour un cercle complet : son point de départ peut
  // tourner d'un rejeu à l'autre) ; on3 = un point SUR la courbe (choix du corps).
  const bin=[];
  try{
    const ad=occBinPush(bin,new occt.BRepAdaptor_Curve_2(e));
    const u0=ad.FirstParameter(),u1=ad.LastParameter();
    if(!(u1>u0))return null;
    const P3=u=>{const p=ad.Value(u);const q=[p.X(),p.Y(),p.Z()];try{p.delete();}catch(er){}return q;};
    const a3=P3(u0),b3=P3(u1),m3=P3((u0+u1)/2);
    const a=isectTo2(B,a3),b=isectTo2(B,b3),m=isectTo2(B,m3);
    const T=occt.GeomAbs_CurveType,gt=ad.GetType();
    const closed=Math.hypot(a3[0]-b3[0],a3[1]-b3[1],a3[2]-b3[2])<1e-6;
    if(gt===T.GeomAbs_Line){
      if(Math.hypot(b[0]-a[0],b[1]-a[1])<1e-6)return null;
      return {type:'line',x1:a[0],y1:a[1],x2:b[0],y2:b[1],mid3:m3,on3:m3};
    }
    if(gt===T.GeomAbs_Circle){
      const c=occBinPush(bin,ad.Circle()),L=occBinPush(bin,c.Location());
      const C3=[L.X(),L.Y(),L.Z()],C=isectTo2(B,C3),r=c.Radius();
      if(closed)return {type:'circle',cx:C[0],cy:C[1],r,mid3:C3,on3:m3};
      const o=arcOrient(C[0],C[1],a[0],a[1],b[0],b[1],m[0],m[1]);
      return {type:'arc',cx:C[0],cy:C[1],r,x1:o[0],y1:o[1],x2:o[2],y2:o[3],mid3:m3,on3:m3,c3:C3};
    }
    // courbe libre : échantillon dense régulier + nombre de segments visé par la tolérance
    const dense=[];
    for(let i=0;i<=ISECT_DENSE;i++){const q=isectTo2(B,P3(u0+(u1-u0)*i/ISECT_DENSE));dense.push([q[0],q[1]]);}
    let n=8;try{n=occCurvePts(ad,u0,u1,ISECT_TOL,256).length-1;}catch(er){}
    n=Math.max(4,Math.min(128,n|0));
    return {type:'curve',dense,n,closed,mid3:m3,on3:m3};
  }catch(err){return null;}
  finally{occDispose(bin);}
}
function occIsectSection(target,B,withFaces){
  // Section exacte de `target` (solide, face…) par le plan de l'esquisse. withFaces : chaque
  // courbe reçoit la référence de sa face d'origine (ancêtre) — choix des faces au survol.
  const out=[],bin=[];
  try{
    const P=occBinPush(bin,new occt.gp_Pnt_3(B.o.x,B.o.y,B.o.z)),D=occBinPush(bin,new occt.gp_Dir_4(B.n.x,B.n.y,B.n.z));
    const pln=occBinPush(bin,new occt.gp_Pln_3(P,D));
    const sec=occBinPush(bin,new occt.BRepAlgoAPI_Section_5(target,pln,false));
    sec.Build();
    if(!sec.IsDone())return out;
    const r=occBinPush(bin,sec.Shape());
    const ex=occBinPush(bin,new occt.TopExp_Explorer_2(r,occt.TopAbs_ShapeEnum.TopAbs_EDGE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE));
    const fkOf=new Map();
    while(ex.More()){
      const e=occt.TopoDS.Edge_1(ex.Current());
      const pr=occIsectEdgePrim(e,B);
      if(pr&&withFaces){
        const f=new occt.TopoDS_Face();
        try{
          if(sec.HasAncestorFaceOn1(e,f)){
            const ref=occFaceRefAny(f);
            if(ref){const k=JSON.stringify(ref);if(!fkOf.has(k))fkOf.set(k,ref);pr.fk=k;pr.ref=fkOf.get(k);}
          }
        }catch(er){}
        try{f.delete();}catch(er){}
      }
      if(pr)out.push(pr);
      try{e.delete();}catch(er){}
      ex.Next();
    }
  }catch(e){}
  finally{occDispose(bin);}
  return isectMergeArcs(out);
}
function isectMergeArcs(list){
  // Un trou percé dans un bloc a une face cylindrique coupée en DEUX par sa couture : la
  // section donne deux demi-arcs. Comme Fusion, des arcs co-circulaires qui ferment le tour
  // deviennent UN cercle (ses faces d'origine restent toutes choisies ensemble : refs).
  const k=v=>(Math.round(v*1e5)/1e5).toFixed(5),G=new Map(),out=[];
  list.forEach(c=>{if(c.type!=='arc'){out.push(c);return;}const g=k(c.cx)+','+k(c.cy)+','+k(c.r);if(!G.has(g))G.set(g,[]);G.get(g).push(c);});
  G.forEach(arcs=>{
    let span=0;arcs.forEach(a=>{let d=Math.atan2(a.y2-a.cy,a.x2-a.cx)-Math.atan2(a.y1-a.cy,a.x1-a.cx);while(d<=0)d+=2*Math.PI;span+=d;});
    if(arcs.length<2||Math.abs(span-2*Math.PI)>1e-4){arcs.forEach(a=>out.push(a));return;}
    const a0=arcs[0],refs=[],fks=[];
    arcs.forEach(a=>{if(a.fk&&fks.indexOf(a.fk)<0){fks.push(a.fk);refs.push(a.ref);}});
    const c={type:'circle',cx:a0.cx,cy:a0.cy,r:a0.r,mid3:a0.c3?a0.c3.slice():a0.mid3,on3:a0.on3,solid:a0.solid};
    if(fks.length){c.fk=fks[0];c.ref=refs[0];c.fks=fks;c.refs=refs;}
    out.push(c);
  });
  return out;
}
function occIsectSolids(shape){
  // Solides d'une forme (multi-corps : le composé occLive / occFinalShape) ; à défaut la forme.
  const list=[];
  try{
    const ex=new occt.TopExp_Explorer_2(shape,occt.TopAbs_ShapeEnum.TopAbs_SOLID,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);
    while(ex.More()){list.push(occt.TopoDS.Solid_1(ex.Current()));ex.Next();}
    try{ex.delete();}catch(e){}
  }catch(e){}
  const own=list.length>0;
  return {list:own?list:[shape],free:()=>{if(own)occDispose(list);}};
}
function skIsectWithShape(sk,fn){
  // fn(forme vue par l'esquisse) — même antériorité que les projections (projEdgesFor) :
  // solide AVANT la fonction qui consomme l'esquisse, sinon le solide fini.
  if(!(typeof occHas==='function'&&occHas()))return null;
  let idx=-1;try{idx=skConsumerIdx(sk);}catch(e){idx=-1;}
  if(idx>=0){
    let FR=null;
    try{FR=occFinalShape(idx);return (FR&&FR.shape)?fn(FR.shape):null;}
    catch(e){return null;}
    finally{if(FR){try{occCleanup(FR,null);}catch(e){}}} // APRÈS lecture : occCleanup supprime FR.shape
  }
  if(occLive&&occLive.shape){try{return fn(occLive.shape);}catch(e){return null;}}
  return null;
}
function isectDistTo(c,x,y){
  // distance 2D d'un point à une primitive de section
  if(c.type==='line')return distSeg2(x,y,c.x1,c.y1,c.x2,c.y2);
  if(c.type==='circle')return Math.abs(Math.hypot(x-c.cx,y-c.cy)-c.r);
  if(c.type==='arc'){
    const a1=Math.atan2(c.y1-c.cy,c.x1-c.cx),a2=Math.atan2(c.y2-c.cy,c.x2-c.cx);
    if(angInArc(Math.atan2(y-c.cy,x-c.cx),a1,a2))return Math.abs(Math.hypot(x-c.cx,y-c.cy)-c.r);
    return Math.min(Math.hypot(x-c.x1,y-c.y1),Math.hypot(x-c.x2,y-c.y2));
  }
  const D=c.dense||[];let d=1e18;
  for(let i=0;i+1<D.length;i++)d=Math.min(d,distSeg2(x,y,D[i][0],D[i][1],D[i+1][0],D[i+1][1]));
  return d;
}
function isectDist3(B,c,pt){const q=isectTo2(B,pt);return Math.hypot(isectDistTo(c,q[0],q[1]),q[2]);}
function skIsectSourceCurves(sk,src){
  // Courbes de section d'une source ({mode,…}) + source REBRANCHÉE (réfs de faces et point
  // du corps mis à jour sur le solide courant) → {curves, src} ; null sans noyau / solide.
  if(!src||src.mode==='mesh')return null;
  const B=sketchBasis(sk);
  return skIsectWithShape(sk,shape=>{
    if(src.mode==='faces'){
      const faces=[],curves=[];
      for(const ref of (src.faces||[])){
        const r0=JSON.parse(JSON.stringify(ref));
        let f=null;try{f=occFindFaceAny(shape,r0);}catch(e){f=null;}
        if(!f){faces.push(ref);continue;} // face perdue : l'ancienne référence est gardée
        occIsectSection(f,B,false).forEach(c=>curves.push(c));
        const nr=occFaceRefAny(f);
        if(nr){if(r0.anchor)nr.anchor=r0.anchor;faces.push(nr);}else faces.push(ref);
        try{f.delete();}catch(e){}
      }
      return {curves:isectMergeArcs(curves),src:{mode:'faces',faces}};
    }
    // corps : le solide dont la section passe au plus près de pt (tous si pt null)
    const S=occIsectSolids(shape);
    let best=null,bd=1e18;const all=[];
    try{
      S.list.forEach(so=>{
        const cs=occIsectSection(so,B,false);if(!cs.length)return;
        if(!src.pt){cs.forEach(c=>all.push(c));return;}
        let d=1e18;cs.forEach(c=>{d=Math.min(d,isectDist3(B,c,src.pt));});
        if(d<bd){bd=d;best=cs;}
      });
    }finally{S.free();}
    const curves=src.pt?(best||[]):all;
    let pt=src.pt?src.pt.slice():null;
    if(pt&&curves.length){
      let bc=null,bdd=1e18;curves.forEach(c=>{const d=isectDist3(B,c,pt);if(d<bdd){bdd=d;bc=c;}});
      if(bc&&bc.on3)pt=bc.on3.slice();
    }
    return {curves,src:{mode:'body',pt}};
  });
}
function skIsectCurvesCached(sk,src){
  // Même logique de cache que les projections : par préfixe de timeline (esquisse consommée)
  // ou par solide fini courant (occLive) — clé = préfixe + plan + source.
  let idx=-1;try{idx=skConsumerIdx(sk);}catch(e){idx=-1;}
  const B=sketchBasis(sk);
  const bs=[B.o.x,B.o.y,B.o.z,B.u.x,B.u.y,B.u.z,B.n.x,B.n.y,B.n.z].map(v=>(+v).toFixed(6)).join(',');
  const live=idx<0;
  if(live&&!(occLive&&occLive.shape))return null;
  const pre=live?null:projPrefixSig(idx);
  const key=(live?'live':pre)+'#'+bs+'#'+JSON.stringify(src);
  if(!live&&pre!=null&&_isectPersist.has(key))return _isectPersist.get(key);
  if(live){
    if(!_isectLive||_isectLive.shape!==occLive.shape)_isectLive={shape:occLive.shape,map:new Map()};
    if(_isectLive.map.has(key))return _isectLive.map.get(key);
  }
  const r=skIsectSourceCurves(sk,src);
  if(live)_isectLive.map.set(key,r);
  else if(pre!=null&&r){_isectPersist.set(key,r);while(_isectPersist.size>48)_isectPersist.delete(_isectPersist.keys().next().value);}
  return r;
}
function isectSegs(c,n){
  // n segments réguliers (en paramètre) d'une courbe libre, lus sur son échantillon dense
  const D=c.dense,N=D.length-1;
  const at=t=>{const f=t*N,i=Math.min(N-1,Math.floor(f)),w=f-i;return [D[i][0]+(D[i+1][0]-D[i][0])*w,D[i][1]+(D[i+1][1]-D[i][1])*w];};
  const out=[];for(let i=0;i<n;i++)out.push([at(i/n),at((i+1)/n)]);
  return out;
}

/* ----- suivi au rejeu (appelé par updateAssociativeProjections0) ----- */
function skIsectTrack(sk,e){
  const src=e.isect;if(!src||src.mode==='mesh')return false;
  const res=skIsectCurvesCached(sk,src);
  if(!res||!res.curves||!res.curves.length)return false;
  e.isect=JSON.parse(JSON.stringify(res.src));
  const P=sk.points;
  const want=(e.seg||e.t==='spline')?'curve':e.t;
  const cands=res.curves.filter(c=>c.type===want);if(!cands.length)return false;
  // candidat : le plus proche du milieu 3D mémorisé (identité), sinon de la position 2D
  const here=()=>{
    if(e.t==='circle'){const C=P[e.pc];return C?[C.x,C.y]:null;}
    if(e.t==='spline'){const q=(e.pts||[]).map(p=>P[p]).filter(Boolean);return q.length?[q.reduce((s,v)=>s+v.x,0)/q.length,q.reduce((s,v)=>s+v.y,0)/q.length]:null;}
    const A=P[e.t==='arc'?e.pa:e.p1],Bp=P[e.t==='arc'?e.pb:e.p2];return (A&&Bp)?[(A.x+Bp.x)/2,(A.y+Bp.y)/2]:null;
  };
  const h=here();if(!h)return false;
  let best=null,bs=1e18;
  for(const c of cands){
    let s;
    if(e.srcMid&&c.mid3)s=Math.hypot(c.mid3[0]-e.srcMid[0],c.mid3[1]-e.srcMid[1],c.mid3[2]-e.srcMid[2]);
    else s=isectDistTo(c,h[0],h[1]);
    if(s<bs){bs=s;best=c;}
  }
  if(!best)return false;
  e.srcMid=best.mid3?best.mid3.slice():e.srcMid;
  let changed=false;
  const setLine=(x1,y1,x2,y2)=>{
    const A=P[e.p1],Bp=P[e.p2];if(!A||!Bp)return;
    const d1=Math.hypot(A.x-x1,A.y-y1)+Math.hypot(Bp.x-x2,Bp.y-y2),d2=Math.hypot(A.x-x2,A.y-y2)+Math.hypot(Bp.x-x1,Bp.y-y1);
    if(Math.min(d1,d2)>0.02){
      if(d2<d1){A.x=x2;A.y=y2;Bp.x=x1;Bp.y=y1;}else{A.x=x1;A.y=y1;Bp.x=x2;Bp.y=y2;}
      changed=true;
    }
  };
  if(e.seg){
    // segment de courbe libre : même découpage (n mémorisé), segment le plus proche
    const S=isectSegs(best,e.seg[1]);let bi=-1,bd=1e18;
    S.forEach((s,i)=>{const d=Math.hypot((s[0][0]+s[1][0])/2-h[0],(s[0][1]+s[1][1])/2-h[1]);if(d<bd){bd=d;bi=i;}});
    if(bi>=0){e.seg=[bi,e.seg[1]];setLine(S[bi][0][0],S[bi][0][1],S[bi][1][0],S[bi][1][1]);}
  }else if(e.t==='spline'&&e.isplN){ // spline de section : mêmes n points de passage, ordre conservé
    const S=isectSegs(best,e.isplN),Q=[S[0][0]].concat(S.map(s=>s[1]));if(e.closed)Q.pop();
    const cur=e.pts.map(p=>P[p]);if(Q.length!==cur.length||cur.some(q=>!q))return false;
    let dF=0,dR=0;cur.forEach((p,i)=>{const a=Q[i],b=Q[Q.length-1-i];dF+=Math.hypot(p.x-a[0],p.y-a[1]);dR+=Math.hypot(p.x-b[0],p.y-b[1]);});
    if(dR<dF)Q.reverse();
    cur.forEach((p,i)=>{if(Math.hypot(p.x-Q[i][0],p.y-Q[i][1])>1e-6){p.x=Q[i][0];p.y=Q[i][1];changed=true;}});
  }else if(e.t==='line')setLine(best.x1,best.y1,best.x2,best.y2);
  else if(e.t==='circle'){
    const C=P[e.pc];if(!C)return false;
    if(Math.hypot(C.x-best.cx,C.y-best.cy)>0.02||Math.abs(e.r-best.r)>0.02){C.x=best.cx;C.y=best.cy;e.r=best.r;changed=true;}
  }else if(e.t==='arc'){
    const C=P[e.pc],A=P[e.pa],Bp=P[e.pb];if(!C||!A||!Bp)return false;
    if(Math.hypot(C.x-best.cx,C.y-best.cy)>0.02||Math.hypot(A.x-best.x1,A.y-best.y1)>0.02||Math.hypot(Bp.x-best.x2,Bp.y-best.y2)>0.02||Math.abs(e.r-best.r)>0.02){
      C.x=best.cx;C.y=best.cy;A.x=best.x1;A.y=best.y1;Bp.x=best.x2;Bp.y=best.y2;e.r=best.r;changed=true;
    }
  }
  return changed;
}

/* ----- création des entités ----- */
function skIsectEmit(sk,curves,src,real){
  // Une passe = un lot d'entités : points PARTAGÉS aux jonctions (contour fermé si la
  // section l'est), tous fixés comme ceux d'une projection. → nombre d'entités créées.
  const made=[];const pts=[];
  const pid=(x,y)=>{
    for(const q of pts)if(Math.hypot(q.x-x,q.y-y)<1e-5)return q.pid;
    const p=addPoint(sk,x,y);pts.push({x,y,pid:p});
    sk.constraints.push({id:skNewEid(sk),type:'fix',p});
    return p;
  };
  const nf=src.mode==='faces'?(src.faces||[]).length:0;
  const srcName=src.mode==='faces'?(nf+' face'+(nf>1?'s':'')):(src.mode==='mesh'?'maillage (figé)':(src.pt?'corps entier':'tous les corps'));
  const base=c=>{
    const o={proj:true,isect:JSON.parse(JSON.stringify(src)),projName:entName('isect'),srcName,srcMid:c.mid3?c.mid3.slice():null};
    if(!real)o.construction=true;
    return o;
  };
  for(const c of curves){
    if(c.type==='line'){
      const p1=pid(c.x1,c.y1),p2=pid(c.x2,c.y2);if(p1===p2)continue;
      const id=skNewEid(sk);sk.entities.push(Object.assign({id,t:'line',p1,p2},base(c)));made.push(id);
    }else if(c.type==='circle'){
      const pc=pid(c.cx,c.cy),id=skNewEid(sk);
      sk.entities.push(Object.assign({id,t:'circle',pc,r:c.r},base(c)));
      sk.constraints.push({id:skNewEid(sk),type:'fix',ent:id});made.push(id);
    }else if(c.type==='arc'){
      const pc=pid(c.cx,c.cy),pa=pid(c.x1,c.y1),pb=pid(c.x2,c.y2),id=skNewEid(sk);
      sk.entities.push(Object.assign({id,t:'arc',pc,pa,pb,r:c.r},base(c)));
      sk.constraints.push({id:skNewEid(sk),type:'fix',ent:id});made.push(id);
    }else if(c.type==='curve'){
      // V0.19.5 (lot 3 spline) : courbe libre (ellipse, B-spline…) → SPLINE par points de passage fixés,
      // aux n points du découpage régulier (une courbe lisse au lieu d'une polyligne de n segments)
      const S=isectSegs(c,c.n),ids=[pid(S[0][0][0],S[0][0][1])];
      S.forEach(s=>{const q=pid(s[1][0],s[1][1]);if(q!==ids[ids.length-1])ids.push(q);});
      const closed=ids.length>3&&ids[0]===ids[ids.length-1];if(closed)ids.pop();
      if(ids.length<2)continue;
      const id=skNewEid(sk);sk.entities.push(Object.assign({id,t:'spline',pts:ids,isplN:c.n},closed?{closed:true}:{},base(c)));
      sk.constraints.push({id:skNewEid(sk),type:'fix',ent:id});made.push(id);
    }
  }
  return made.length;
}
function skIsectApply(sk,src,curves){
  // Création en UNE étape d'annulation. curves fourni (repli maillage) ou calculé (noyau).
  if(!sk)return 0;
  let cs=curves,s2=src;
  if(!cs){const r=skIsectSourceCurves(sk,src);if(r){cs=r.curves;s2=r.src;}}
  if(!cs||!cs.length){skStatus('Intersection ⨯ : la sélection ne coupe pas le plan d’esquisse.');return 0;}
  skPushUndo();
  const n=skIsectEmit(sk,cs,s2,skIsectReal);
  if(!n){skUndoStack.pop();skUndoBtn();skStatus('Intersection ⨯ : aucune courbe exploitable.');return 0;}
  skIsectSel=[];skIsectHover=null;
  afterEdit();
  skStatus('Intersection ⨯ : '+n+' courbe'+(n>1?'s':'')+' créée'+(n>1?'s':'')+(skIsectReal?' (géométrie normale)':' en construction')+
    (s2.mode==='mesh'?' — section du MAILLAGE (sans noyau exact : approchée, ne suit pas le modèle).':' — elles suivent le modèle au rejeu.'));
  return n;
}

/* ----- repli sans noyau : section du maillage affiché ----- */
function skIsectMeshCurves(sk,onlyMesh){
  // Triangles des corps visibles ∩ plan → segments chaînés → polylignes simplifiées
  // (points alignés fusionnés) → lignes. solid = rang du corps (choix au survol).
  const out=[];
  if(typeof bodies==='undefined')return out;
  const B=sketchBasis(sk);
  const list=bodies.filter(b=>b&&!b.ghost&&b.mesh&&b.mesh.geometry&&(!onlyMesh||b.mesh===onlyMesh));
  list.forEach((b,k)=>{
    try{
      const g=b.mesh.geometry,pos=g.attributes&&g.attributes.position;if(!pos)return;
      const nt=(g.index?g.index.count:pos.count)/3;if(nt>300000)return;
      try{b.mesh.updateMatrixWorld(true);}catch(e){}
      const M=(b.mesh.matrixWorld&&b.mesh.matrixWorld.elements)||null;
      const W=i=>{
        let x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
        if(M){const X=x,Y=y,Z=z;x=M[0]*X+M[4]*Y+M[8]*Z+M[12];y=M[1]*X+M[5]*Y+M[9]*Z+M[13];z=M[2]*X+M[6]*Y+M[10]*Z+M[14];}
        return isectTo2(B,[x,y,z]);
      };
      const segs=[];
      for(let t=0;t<nt;t++){
        const I=[0,1,2].map(j=>g.index?g.index.getX(3*t+j):3*t+j);
        const Q=I.map(W),cut=[];
        for(let j=0;j<3;j++){
          const p=Q[j],q=Q[(j+1)%3];
          if((p[2]>0)!==(q[2]>0)){const w=p[2]/(p[2]-q[2]);cut.push([p[0]+(q[0]-p[0])*w,p[1]+(q[1]-p[1])*w]);}
        }
        if(cut.length===2&&Math.hypot(cut[1][0]-cut[0][0],cut[1][1]-cut[0][1])>1e-7)segs.push(cut);
      }
      // chaînage par extrémités (clé arrondie au 1/10 000 mm)
      const key=p=>(Math.round(p[0]*1e4))+','+(Math.round(p[1]*1e4));
      const adj=new Map();
      segs.forEach((s,i)=>{[0,1].forEach(j=>{const kk=key(s[j]);if(!adj.has(kk))adj.set(kk,[]);adj.get(kk).push(i);});});
      const used=new Uint8Array(segs.length);
      for(let i=0;i<segs.length;i++){
        if(used[i])continue;used[i]=1;
        const chain=[segs[i][0],segs[i][1]];
        for(const dir of [1,0]){
          for(;;){
            const end=dir?chain[chain.length-1]:chain[0];
            const nx=(adj.get(key(end))||[]).find(j=>!used[j]);if(nx===undefined)break;
            used[nx]=1;const s=segs[nx],other=key(s[0])===key(end)?s[1]:s[0];
            if(dir)chain.push(other);else chain.unshift(other);
          }
        }
        // simplification : retire les points intermédiaires alignés (écart < 0,005 mm)
        const simp=[chain[0]];
        for(let j=1;j<chain.length-1;j++){
          const a=simp[simp.length-1],c=chain[j+1];
          if(distSeg2(chain[j][0],chain[j][1],a[0],a[1],c[0],c[1])>0.005)simp.push(chain[j]);
        }
        simp.push(chain[chain.length-1]);
        for(let j=0;j+1<simp.length;j++){
          const a=simp[j],c=simp[j+1];if(Math.hypot(c[0]-a[0],c[1]-a[1])<1e-4)continue;
          out.push({type:'line',x1:a[0],y1:a[1],x2:c[0],y2:c[1],mid3:null,on3:null,solid:k,mesh:b.mesh});
        }
      }
    }catch(e){}
  });
  return out;
}

/* ----- interface : candidats, survol, clic, menu ----- */
function skIsectCandidates(sk){
  // Toutes les courbes de section du solide vu par l'esquisse, rangées par corps (solid)
  // et par face d'origine (fk) — calculées une fois par session d'outil.
  if(_isectCands&&_isectCands.sk===sk.id)return _isectCands.list;
  const B=sketchBasis(sk);
  let list=skIsectWithShape(sk,shape=>{
    const L=[],S=occIsectSolids(shape);
    try{S.list.forEach((so,k)=>{occIsectSection(so,B,true).forEach(c=>{c.solid=k;L.push(c);});});}finally{S.free();}
    return L;
  });
  let mesh=false;
  if(!list){list=skIsectMeshCurves(sk);mesh=true;}
  _isectCands={sk:sk.id,list:list||[],mesh};
  return _isectCands.list;
}
function skIsectPick(sk,x,y,wantBody){
  const L=skIsectCandidates(sk),tol=10/Math.max(1e-9,skView.s);
  let best=null,bd=tol;
  for(const c of L){const d=isectDistTo(c,x,y);if(d<bd){bd=d;best=c;}}
  if(!best)return null;
  const body=wantBody||_isectCands.mesh||!best.fk;
  return {mode:body?'body':'face',fk:body?null:best.fk,ref:body?null:best.ref,refs:body?null:(best.refs||[best.ref]),fks:body?null:(best.fks||[best.fk]),solid:best.solid,at:best.on3?best.on3.slice():null,mesh:best.mesh||null};
}
function skIsectGroup(h){
  // courbes candidates d'un survol / d'une sélection
  if(!h||!_isectCands)return [];
  return _isectCands.list.filter(c=>h.mode==='body'?c.solid===h.solid:(c.fk===h.fk||(c.fks&&c.fks.indexOf(h.fk)>=0)));
}
function skIsectHoverAt(sk,x,y,shift){
  const h=skIsectPick(sk,x,y,shift);
  const k=h?(h.mode+'|'+h.fk+'|'+h.solid):'',ko=skIsectHover?(skIsectHover.mode+'|'+skIsectHover.fk+'|'+skIsectHover.solid):'';
  skIsectHover=h;
  if(k!==ko)drawSketch2D();
  const ns=skIsectSel.length;
  if(!_isectCands||!_isectCands.list.length)skStatus('⨯ Intersection : aucun corps ne coupe ce plan'+((typeof occHas==='function'&&occHas())?'.':' (sans noyau exact : section du maillage affiché).'));
  else if(!h)skStatus('⨯ Intersection : survolez une courbe de section (bleu clair) — clic : la face · Maj+clic : le corps entier · Ctrl+clic : plusieurs faces'+(ns?' ('+ns+' retenue'+(ns>1?'s':'')+', Entrée valide)':'')+'.');
  else if(h.mode==='body')skStatus('⨯ Corps entier'+(_isectCands.mesh?' (maillage, sans noyau)':'')+' — clic pour créer ses courbes d’intersection avec le plan.');
  else skStatus('⨯ Face'+(h.ref&&h.ref.st?' ('+h.ref.st+')':'')+' — clic : intersection de '+(ns?'la sélection + cette face':'cette face')+' · Ctrl+clic : ajouter/retirer · Maj : corps entier.');
}
function skIsectSrcOfSel(){return {mode:'faces',faces:skIsectSel.map(s=>JSON.parse(JSON.stringify(s.ref)))};}
function skIsectMeshApply(sk,h){
  const cs=skIsectGroup(h);
  return skIsectApply(sk,{mode:'mesh'},cs.map(c=>({type:'line',x1:c.x1,y1:c.y1,x2:c.x2,y2:c.y2,mid3:null})));
}
function skIsectClickAt(sk,x,y,e){
  const h=skIsectPick(sk,x,y,!!(e&&e.shiftKey));
  if(!h){skStatus('⨯ Intersection : aucune courbe de section ici — survolez le trait bleu clair d’une face qui coupe le plan.');return;}
  if(_isectCands&&_isectCands.mesh){skIsectMeshApply(sk,h);return;}
  if(h.mode==='body'){skIsectApply(sk,{mode:'body',pt:h.at});return;}
  const i=skIsectSel.findIndex(s=>s.fk===h.fk);
  const addH=()=>h.fks.forEach((fk,j)=>{if(!skIsectSel.some(s=>s.fk===fk))skIsectSel.push({fk,ref:h.refs[j]});});
  if(skMulti(e)){
    if(i>=0)skIsectSel=skIsectSel.filter(s=>h.fks.indexOf(s.fk)<0);else addH();
    drawSketch2D();
    skStatus('⨯ Intersection : '+skIsectSel.length+' face'+(skIsectSel.length>1?'s':'')+' retenue'+(skIsectSel.length>1?'s':'')+' — Entrée (ou clic simple) pour créer, Échap annule.');
    return;
  }
  if(i<0)addH();
  skIsectApply(sk,skIsectSrcOfSel());
}
function skIsectValidate(){
  if(!skEdit)return;
  if(!skIsectSel.length){skStatus('⨯ Intersection : aucune face retenue (Ctrl+clic sur les courbes de section).');return;}
  skIsectApply(skEdit,skIsectSrcOfSel());
}
function skIsectAllBodies(){
  // Menu : tous les corps coupés par le plan (pt null), ou le maillage sans noyau
  if(!skEdit)return;
  skIsectCandidates(skEdit);
  if(_isectCands&&_isectCands.mesh){
    const cs=_isectCands.list;
    skIsectApply(skEdit,{mode:'mesh'},cs.map(c=>({type:'line',x1:c.x1,y1:c.y1,x2:c.x2,y2:c.y2,mid3:null})));
    return;
  }
  skIsectApply(skEdit,{mode:'body',pt:null});
}
function skIsectFromBody(bid){
  // Arbre : clic sur un corps pendant l'outil ⨯ → son intersection entière avec le plan.
  if(!skEdit)return false;
  const sk=skEdit,bd=(typeof bodies!=='undefined'?bodies:[]).find(b=>b.kind==='body'&&b.id===bid);
  if(!bd){skStatus('⨯ Intersection : corps introuvable dans la vue.');return true;}
  if(typeof occHas==='function'&&occHas()&&bd.shape){
    const cs=occIsectSection(bd.shape,sketchBasis(sk),false);
    const p=cs.find(c=>c.on3);
    if(!p){skStatus('⨯ Intersection : ce corps ne coupe pas le plan d’esquisse.');return true;}
    skIsectApply(sk,{mode:'body',pt:p.on3.slice()});
    return true;
  }
  const cs=bd.mesh?skIsectMeshCurves(sk,bd.mesh):[];
  if(!cs.length){skStatus('⨯ Intersection : ce corps ne coupe pas le plan d’esquisse.');return true;}
  skIsectApply(sk,{mode:'mesh'},cs.map(c=>({type:'line',x1:c.x1,y1:c.y1,x2:c.x2,y2:c.y2,mid3:null})));
  return true;
}
function skIsectCtx(x,y){
  // Menu contextuel de l'outil ⨯ (clic droit pendant l'outil)
  const m=$('skCtxMenu');if(!m||!skEdit)return;
  m.innerHTML='<div style="font-size:.72rem;color:var(--muted);padding:4px 8px">Intersection ⨯</div>';
  const add=(label,fn)=>{
    const b=document.createElement('button');
    b.style.cssText='display:flex;align-items:center;gap:8px;width:100%;text-align:left;padding:6px 10px;background:none;border:none;color:#fff;cursor:pointer;font-size:.82rem';
    b.textContent=label;
    b.onmouseenter=()=>b.style.background='rgba(255,255,255,.08)';b.onmouseleave=()=>b.style.background='none';
    b.onclick=()=>{hideSkCtx();fn();};m.appendChild(b);
  };
  const n=skIsectSel.length;
  if(n)add('✓ Créer l’intersection des '+n+' face'+(n>1?'s':'')+' retenue'+(n>1?'s':'')+' (Entrée)',()=>skIsectValidate());
  const h=skIsectHover;
  if(h)add('⨯ Corps entier sous le curseur',()=>{
    if(_isectCands&&_isectCands.mesh)skIsectMeshApply(skEdit,Object.assign({},h,{mode:'body'}));
    else skIsectApply(skEdit,{mode:'body',pt:h.at});
  });
  add('⨯ Tous les corps coupés par le plan',()=>skIsectAllBodies());
  add((skIsectReal?'☑':'☐')+' Créer en géométrie normale (profil)',()=>{skIsectReal=!skIsectReal;skStatus('Intersection ⨯ : courbes créées en '+(skIsectReal?'géométrie normale (profil).':'construction.'));});
  if(n)add('✕ Vider la sélection',()=>{skIsectSel=[];drawSketch2D();});
  m.style.left=x+'px';m.style.top=y+'px';m.style.display='block';
}
function skIsectDrawPrim(c,attrs){
  if(c.type==='line'){const[a,b]=w2s(c.x1,c.y1),[p,q]=w2s(c.x2,c.y2);skEl('line',Object.assign({x1:a,y1:b,x2:p,y2:q},attrs));return;}
  if(c.type==='circle'){const[a,b]=w2s(c.cx,c.cy);skEl('circle',Object.assign({cx:a,cy:b,r:c.r*skView.s,fill:'none'},attrs));return;}
  if(c.type==='arc'){
    const a1=Math.atan2(c.y1-c.cy,c.x1-c.cx),a2=Math.atan2(c.y2-c.cy,c.x2-c.cx);
    let dd=a2-a1;while(dd<=0)dd+=Math.PI*2;while(dd>Math.PI*2)dd-=Math.PI*2;
    const[a,b]=w2s(c.x1,c.y1),[p,q]=w2s(c.x2,c.y2);
    skEl('path',Object.assign({d:`M ${a} ${b} A ${c.r*skView.s} ${c.r*skView.s} 0 ${dd>Math.PI?1:0} 0 ${p} ${q}`,fill:'none'},attrs));return;
  }
  const D=c.dense||[];if(D.length<2)return;
  skEl('path',Object.assign({d:D.map((p,i)=>{const s=w2s(p[0],p[1]);return (i?'L ':'M ')+s[0]+' '+s[1];}).join(' '),fill:'none'},attrs));
}
function skIsectDraw(sk){
  // candidats (bleu clair pointillé), faces retenues (bleu), survol (orange)
  const L=skIsectCandidates(sk);if(!L.length)return;
  L.forEach(c=>skIsectDrawPrim(c,{stroke:'#64d2ff','stroke-width':1.5,'stroke-dasharray':'5 3',opacity:0.7}));
  const selK=new Set(skIsectSel.map(s=>s.fk));
  L.forEach(c=>{if((c.fks||[c.fk]).some(k=>k&&selK.has(k)))skIsectDrawPrim(c,{stroke:'#0a84ff','stroke-width':3,opacity:0.95});});
  skIsectGroup(skIsectHover).forEach(c=>skIsectDrawPrim(c,{stroke:'#ff9f0a','stroke-width':3,opacity:0.95}));
}
// Bouton de la barre d'esquisse, juste après ⧉ Projeter (raccourci I)
(function(){
  const bar=document.getElementById('skToolbar');if(!bar||bar.querySelector('[data-tool="isect"]'))return;
  const title='Intersection (I) : courbes du plan d’esquisse avec des faces (clic, Ctrl+clic = plusieurs) ou un corps entier (Maj+clic, ou corps dans l’arbre) — suivent le modèle';
  const b=document.createElement('button');b.className='tool';b.dataset.tool='isect';b.title=title;
  if(typeof SK_ICONS!=='undefined'&&SK_ICONS.isect)b.innerHTML=skIcon('isect',20);else b.textContent='⨯';
  b.onclick=()=>{skCancelDraft();skTool='isect';document.querySelectorAll('#skToolbar .tool').forEach(x=>x.classList.toggle('on',x===b));if(skEdit){skStatus(title);drawSketch2D();}};
  const pj=bar.querySelector('[data-tool="project"]');
  if(pj&&pj.parentNode)pj.parentNode.insertBefore(b,pj.nextSibling);else bar.appendChild(b);
})();
