/* ═══════════════════════════════════════════════════════════════════════════
   BALAYAGE — un profil d'esquisse (fermé) poussé le long d'un CHEMIN dessiné dans
   une AUTRE esquisse (lignes, arcs et splines bout à bout, ouvert ou fermé, ou un cercle seul).

   Cas d'école : le profil sur un plan de construction « normal à un axe » posé au bout
   du chemin (tube, main courante, joint torique, rainure qui suit un contour).

   Reflet de la révolution : mêmes boucles (skLoopTrace), mêmes décisions add/cut, même
   repli maillage. Le noyau exact utilise BRepOffsetAPI_MakePipeShell :
     · trièdre de Frenet CORRIGÉ (SetMode_1(false)) — le profil ne vrille pas ;
     · coins vifs du chemin en ONGLET (BRepBuilderAPI_RightCorner) — mesuré : chemin en L
       50+50, carré 10×10 → volume 10 000 exact et solide valide ; le mode par défaut
       (Transformed) donnait 4 000 et un solide invalide, MakePipe sur face 5 000 invalide.
   Le profil part de là où il est dessiné : s'il n'est pas au départ du chemin, le solide
   est décalé d'autant (signalé dans le panneau). Le chemin démarre à son extrémité la plus
   proche du profil.

   f = {type:'sweep', sketchId (profil), pathId (esquisse du chemin), op:'add'|'cut'}
   ═══════════════════════════════════════════════════════════════════════════ */

const TAU_SW=Math.PI*2;
let swNew=null; // balayage en cours de création (formulaire) : {sketchId,pathId,op}

function sweepName(f){
  if(!f)return'Balayage';
  return (f.op==='cut'?'Balayage (découpe) ':'Balayage ')+(skName?skName(f.sketchId):'')+
    (f.pathId?' le long de '+skName(f.pathId):'');
}

// ── le CHEMIN, dans le plan de son esquisse ─────────────────────────────────
// Toutes les lignes / arcs / splines hors construction de l'esquisse, qui doivent former UNE chaîne
// sans embranchement ; ou un cercle seul (chemin fermé). near = point MONDE {x,y,z} (centre
// du profil) : la chaîne démarre à l'extrémité la plus proche.
// → {chain, pts, closed, len, n} | {circle, closed:true, len} | {err}
function sweepPath2D(sk,near){
  if(!sk)return{err:'esquisse du chemin introuvable'};
  const P=sk.points||{},TAU=Math.PI*2;
  const ents=(sk.entities||[]).filter(e=>e&&!e.construction&&!e.ref&&(e.t==='line'||e.t==='arc'||e.t==='circle'||e.t==='spline'));
  if(!ents.length)return{err:'le chemin est vide (aucune ligne, arc ni spline hors construction dans « '+sk.name+' »)'};
  const full=e=>e.t==='circle'||(e.t==='arc'&&e.pa===e.pb);
  if(ents.some(full)){
    if(ents.length>1)return{err:'un cercle ne sert de chemin que seul dans son esquisse'};
    const c=ents[0];
    if(!P[c.pc]||!(c.r>1e-9))return{err:'chemin : cercle dégénéré'};
    return{circle:c,closed:true,len:TAU*c.r,n:1};
  }
  // nœuds fusionnés à 1 µm, comme skLoopTrace
  const pts={},ids=[];
  const node=q=>{
    for(const id of ids)if(Math.hypot(pts[id].x-q.x,pts[id].y-q.y)<1e-3)return id;
    const id='__w'+ids.length;pts[id]={x:q.x,y:q.y};ids.push(id);return id;
  };
  const edges=[];
  ents.forEach(e=>{
    if(e.t==='line'){
      const A=P[e.p1],B=P[e.p2];
      if(!A||!B||Math.hypot(B.x-A.x,B.y-A.y)<1e-9)return;
      edges.push({a:node(A),b:node(B),e:e,kind:'line',len:Math.hypot(B.x-A.x,B.y-A.y)});
    }else if(e.t==='spline'){
      // B-spline exacte (50-esquisse-6), coupée comme dans skLoopTrace : aux bouts des autres traits posés
      // dessus (jonction en T → refusée plus bas comme fourche) ; fermée = 2 moitiés, donc une boucle
      const cands=[];ents.forEach(o=>{if(o===e)return;
        (o.t==='line'?[o.p1,o.p2]:o.t==='arc'?[o.pa,o.pb]:o.t==='spline'&&o.pts.length?[o.pts[0],o.pts[o.pts.length-1]]:[]).forEach(p=>cands.push(p));});
      skSplineEdges(sk,e,skSplineCutsFor(sk,e,cands)).forEach(se=>{
        const pl=se.poly||[];if(pl.length<2)return;
        let L=0;for(let k=1;k<pl.length;k++)L+=Math.hypot(pl[k][0]-pl[k-1][0],pl[k][1]-pl[k-1][1]);
        if(!(L>1e-9))return;
        edges.push({a:node({x:pl[0][0],y:pl[0][1]}),b:node({x:pl[pl.length-1][0],y:pl[pl.length-1][1]}),e:e,kind:'spline',
          bs:se.bs,poly:pl,o:se.o,i:se.i,len:L});
      });
    }else{
      const C=P[e.pc],an=arcAngles(sk,e);
      if(!C||!an||!(e.r>1e-9))return;
      edges.push({a:node({x:C.x+e.r*Math.cos(an.a1),y:C.y+e.r*Math.sin(an.a1)}),
        b:node({x:C.x+e.r*Math.cos(an.a2),y:C.y+e.r*Math.sin(an.a2)}),e:e,kind:'arc',len:e.r*(an.a2-an.a1)});
    }
  });
  if(!edges.length)return{err:'chemin : lignes, arcs ou splines dégénérés'};
  const deg={};edges.forEach(d=>{deg[d.a]=(deg[d.a]||0)+1;deg[d.b]=(deg[d.b]||0)+1;});
  const fourche=ids.find(id=>deg[id]>2);
  if(fourche)return{err:'le chemin se ramifie en ('+pts[fourche].x.toFixed(1)+' ; '+pts[fourche].y.toFixed(1)+') — il faut UNE chaîne continue, sans embranchement'};
  const ends=ids.filter(id=>deg[id]===1);
  if(ends.length>2)return{err:'le chemin est en '+(ends.length/2)+' morceaux — reliez les bouts (coïncidence) ou passez les autres traits en construction'};
  const closed=!ends.length;
  // départ : l'extrémité (ou, fermé, le nœud) la plus proche du profil
  let cands=closed?ids:ends,start=cands[0];
  if(near){
    let best=1e18;
    cands.forEach(id=>{const w=occW(sk,pts[id].x,pts[id].y),d=Math.hypot(w[0]-near.x,w[1]-near.y,w[2]-near.z);if(d<best-1e-9){best=d;start=id;}});
  }
  const used=new Set(),chain=[];let cur=start,len=0;
  for(;;){
    const i=edges.findIndex((d,k)=>!used.has(k)&&(d.a===cur||d.b===cur));
    if(i<0)break;
    used.add(i);const d=edges[i];chain.push({from:cur,ed:d});len+=d.len;
    cur=d.a===cur?d.b:d.a;
  }
  if(used.size<edges.length)return{err:'le chemin est en plusieurs morceaux ('+(edges.length-used.size)+' trait(s) non relié(s))'};
  return{chain,pts,closed,len,n:edges.length};
}
// départ du chemin en MONDE : point S et tangente unitaire T (sens de parcours)
function sweepStart3(sk,p){
  const B=sketchBasis(sk);
  const to3=(x,y)=>({x:B.u.x*x+B.v.x*y,y:B.u.y*x+B.v.y*y,z:B.u.z*x+B.v.z*y});
  let s2,t2;
  if(p.circle){
    const C=sk.points[p.circle.pc];
    s2={x:C.x+p.circle.r,y:C.y};t2={x:0,y:1};
  }else{
    const st=p.chain[0],ed=st.ed,A=p.pts[st.from],Bp=p.pts[ed.a===st.from?ed.b:ed.a];
    s2=A;
    if(ed.kind==='line')t2={x:Bp.x-A.x,y:Bp.y-A.y};
    else if(ed.kind==='spline')t2=ed.a===st.from?{x:Math.cos(ed.o),y:Math.sin(ed.o)}:{x:-Math.cos(ed.i),y:-Math.sin(ed.i)}; // tangente de bout de la courbe
    else{
      // même lecture du sens que occWireFromChain : départ sur a1 → sens trigo
      const C=sk.points[ed.e.pc],an=arcAngles(sk,ed.e),a=Math.atan2(A.y-C.y,A.x-C.x);
      const TAU=Math.PI*2,nm=t=>((t%TAU)+TAU)%TAU;
      const ccw=Math.min(nm(a-an.a1),TAU-nm(a-an.a1))<=Math.min(nm(a-an.a2),TAU-nm(a-an.a2));
      t2=ccw?{x:-Math.sin(a),y:Math.cos(a)}:{x:Math.sin(a),y:-Math.cos(a)};
    }
  }
  const w=occW(sk,s2.x,s2.y),T=to3(t2.x,t2.y),L=Math.hypot(T.x,T.y,T.z)||1;
  return{S:{x:w[0],y:w[1],z:w[2]},T:{x:T.x/L,y:T.y/L,z:T.z/L}};
}
// centre (moyenne des sommets) du profil, en monde
function sweepProfileCenter(sk){
  const P=sk.points||{};let x=0,y=0,n=0;
  (sk.entities||[]).forEach(e=>{if(!e||e.construction||e.ref)return;
    [e.t==='circle'?e.pc:null,e.p1,e.p2,e.pa,e.pb].forEach(id=>{const q=id&&P[id];if(q){x+=q.x;y+=q.y;n++;}});});
  if(!n)return null;
  const w=occW(sk,x/n,y/n);return{x:w[0],y:w[1],z:w[2]};
}
// Diagnostic commun (panneau, création, noyau) → {ok, msg, warn, path, tr, start}
function sweepCheck(f){
  const sk=doc.sketches.find(s=>s.id===f.sketchId);
  if(!sk)return{ok:false,msg:'esquisse du profil introuvable'};
  if(!f.pathId)return{ok:false,msg:'aucun chemin choisi'};
  if(f.pathId===f.sketchId)return{ok:false,msg:'le chemin doit être dans une AUTRE esquisse que le profil'};
  const pk=doc.sketches.find(s=>s.id===f.pathId);
  if(!pk)return{ok:false,msg:'esquisse du chemin introuvable'};
  const tr=skLoopTrace(sk);
  if(!tr.solids.length&&!tr.circlesOut.length)return{ok:false,msg:'profil non fermé (bouts ouverts en rouge dans l’esquisse)'};
  const c=sweepProfileCenter(sk);
  const path=sweepPath2D(pk,c);
  if(path.err)return{ok:false,msg:path.err};
  const st=sweepStart3(pk,path),n=sketchBasis(sk).n;
  const cos=Math.abs(n.x*st.T.x+n.y*st.T.y+n.z*st.T.z);
  if(cos<0.02)return{ok:false,msg:'le chemin part DANS le plan du profil — dessinez le profil sur un plan qui coupe le chemin (plan de construction « normal à un axe » au bout du chemin, par exemple)'};
  let warn='';
  if(c){
    const d=Math.hypot(c.x-st.S.x,c.y-st.S.y,c.z-st.S.z);
    // écart au départ : on compare au plan du profil (le centre peut être hors chemin pour un profil excentré voulu)
    const B=sketchBasis(sk),dz=Math.abs((st.S.x-B.o.x)*n.x+(st.S.y-B.o.y)*n.y+(st.S.z-B.o.z)*n.z);
    if(dz>0.01)warn='le départ du chemin est à '+dz.toFixed(2)+' mm du plan du profil : le solide part du profil, décalé d’autant';
    else if(d>1e3)warn='le profil est loin du chemin ('+d.toFixed(0)+' mm)';
  }
  if(cos<0.5&&!warn)warn='le chemin coupe le profil très en biais ('+(Math.acos(cos)*180/Math.PI).toFixed(0)+'° de la normale) : section écrasée';
  return{ok:true,msg:'',warn,path,tr,sk,pk,start:st};
}

// Imbrication des cercles pleins du profil → [{c, depth, parent}] (parent = cercle contenant le plus petit)
function sweepCircleNest(sk,circles){
  const P=sk.points||{};
  const inside=(a,b)=>{const A=P[a.pc],B=P[b.pc];return A&&B&&a!==b&&b.r>a.r&&Math.hypot(A.x-B.x,A.y-B.y)+a.r<b.r-1e-6;};
  const N=circles.map(c=>({c,depth:0,parent:null}));
  N.forEach(n=>{
    const out=N.filter(m=>inside(n.c,m.c));
    n.depth=out.length;
    out.forEach(m=>{if(!n.parent||m.c.r<n.parent.c.r)n.parent=m;});
  });
  return N;
}
// ── solide EXACT (noyau OCCT) ───────────────────────────────────────────────
function occShapeOfSweep(f){
  const ck=sweepCheck(f);
  if(!ck.ok)throw new Error(ck.msg);
  const sk=ck.sk,pk=ck.pk,path=ck.path,tr=ck.tr;
  const bins=[],warns=[];
  if(ck.warn)warns.push(ck.warn);
  // fil du chemin (ouvert ou fermé) : occWireFromChain ne lit que tr.pts et la chaîne
  let spine;
  if(path.circle){
    const C=pk.points[path.circle.pc],w=occW(pk,C.x,C.y),n=sketchBasis(pk).n;
    const ax=occBinPush(bins,new occt.gp_Ax2_3(occBinPush(bins,new occt.gp_Pnt_3(w[0],w[1],w[2])),occBinPush(bins,new occt.gp_Dir_4(n.x,n.y,n.z))));
    const me=occBinPush(bins,new occt.BRepBuilderAPI_MakeEdge_8(occBinPush(bins,new occt.gp_Circ_2(ax,path.circle.r))));
    me.Build();if(!me.IsDone())throw new Error('chemin circulaire impossible');
    const mw=occBinPush(bins,new occt.BRepBuilderAPI_MakeWire_1());mw.Add_1(me.Edge());mw.Build();
    spine=mw.Wire();
  }else{
    try{spine=occWireFromChain(pk,{pts:Object.assign({},pk.points,path.pts)},path.chain,bins,0);}
    catch(e){occDispose(bins);throw new Error('chemin : '+e.message);}
  }
  const vol=s=>{let v=0;try{const G=new occt.GProp_GProps_1();occt.BRepGProp.VolumeProperties_1(s,G,false,false,false);v=G.Mass();G.delete();}catch(e){}return v;};
  // chemin à spline : binormale FIXE = normale de son esquisse (repère à rotation minimale d'une courbe plane).
  // Le Frenet corrigé ne rend jamais la main sur une B-spline (mesuré, OCCT wasm) ; le Frenet pur vrille aux inflexions.
  const binorm=!path.circle&&path.chain.some(st=>st.ed.kind==='spline')?sketchBasis(pk).n:null;
  const pipe=w=>{
    const ps=occBinPush(bins,new occt.BRepOffsetAPI_MakePipeShell(spine));
    if(binorm)ps.SetMode_3(occBinPush(bins,new occt.gp_Dir_4(binorm.x,binorm.y,binorm.z)));
    else try{ps.SetMode_1(false);}catch(e){}
    try{ps.SetTransitionMode(occt.BRepBuilderAPI_TransitionMode.BRepBuilderAPI_RightCorner);}catch(e){}
    ps.Add_1(w,false,false);
    ps.Build();
    if(!ps.IsDone())throw new Error('balayage impossible (rayon du chemin plus petit que le profil ?)');
    let ok=false;try{ok=ps.MakeSolid();}catch(e){}
    if(!ok)throw new Error('balayage : le solide ne se ferme pas');
    let s=ps.Shape();
    if(vol(s)<0)s=s.Reversed(); // fil du profil à l'envers : solide retourné
    return s;
  };
  // fil d'une boucle du profil, ou d'un cercle plein (même recette que diskOf de la révolution)
  const wireOf=chain=>occWireFromChain(sk,tr,chain,bins,0);
  const circWire=c=>{
    const C=sk.points[c.pc];if(!C)throw new Error('pastille : centre introuvable');
    const n=sketchBasis(sk).n,w=occW(sk,C.x,C.y);
    const ax=occBinPush(bins,new occt.gp_Ax2_3(occBinPush(bins,new occt.gp_Pnt_3(w[0],w[1],w[2])),occBinPush(bins,new occt.gp_Dir_4(n.x,n.y,n.z))));
    const me=occBinPush(bins,new occt.BRepBuilderAPI_MakeEdge_8(occBinPush(bins,new occt.gp_Circ_2(ax,c.r))));
    me.Build();if(!me.IsDone())throw new Error('cercle du profil impossible');
    const mw=occBinPush(bins,new occt.BRepBuilderAPI_MakeWire_1());mw.Add_1(me.Edge());mw.Build();
    return mw.Wire();
  };
  let shape=null;
  const fuseIn=s=>{if(!shape){shape=s;return;}const nx=occUnify(occFuse(shape,s));try{shape.delete();}catch(e){}try{s.delete();}catch(e){}shape=nx;};
  try{
    // même déduplication que la révolution : skLoopTrace peut rendre deux fois la même boucle
    const vus=new Set();
    const boucleKey=ch=>(ch||[]).map(x=>(x.ed&&x.ed.e&&x.ed.e.id)||(x.ed&&x.ed.a+'>'+x.ed.b)).sort().join('|');
    tr.solids.forEach((sol,si)=>{
      const k=boucleKey(sol.chain);if(vus.has(k))return;vus.add(k);
      let s=pipe(wireOf(sol.chain));
      (sol.holes||[]).forEach(h=>{const t=pipe(wireOf(h));const c=occCut(s,t);try{s.delete();}catch(e){}try{t.delete();}catch(e){}s=c;});
      tr.circleHoles.filter(ch=>ch.solid===si).forEach(ch=>{const t=pipe(circWire(ch.circle));const c=occCut(s,t);try{s.delete();}catch(e){}try{t.delete();}catch(e){}s=c;});
      fuseIn(s);
    });
    // Cercles imbriqués (skLoopTrace les rend tous « pastilles ») : profondeur paire = matière,
    // impaire = trou de son cercle parent — deux cercles concentriques font un TUBE creux.
    const nest=sweepCircleNest(sk,tr.circlesOut);
    nest.forEach(n=>{
      if(n.depth%2)return;
      let s=pipe(circWire(n.c));
      nest.filter(h=>h.parent===n).forEach(h=>{const t=pipe(circWire(h.c));const c=occCut(s,t);try{s.delete();}catch(e){}try{t.delete();}catch(e){}s=c;});
      fuseIn(s);
    });
  }catch(err){occDispose(bins);throw err;}
  if(!shape){occDispose(bins);throw new Error('solide vide');}
  try{const an=new occt.BRepCheck_Analyzer(shape,true);if(!an.IsValid_2())warns.push('solide douteux : le profil se recoupe le long du chemin (virage trop serré ?)');an.delete();}catch(e){}
  return{shape,bins,warnings:warns};
}

// ── repli MAILLAGE (sans noyau) ─────────────────────────────────────────────
// Le contour extérieur du profil est transporté le long du chemin échantillonné (rotation
// minimale d'une tangente à la suivante, pivot aux coins) ; les trous ne sont pas creusés.
function sweepChainPts2D(sk,pts,chain){
  const out=[],TAU=Math.PI*2,nm=t=>((t%TAU)+TAU)%TAU;
  (chain||[]).forEach(st=>{
    const ed=st.ed,A=pts[st.from],B=pts[ed.a===st.from?ed.b:ed.a];
    if(!A||!B)return;
    if(ed.kind==='line'){if(!out.length)out.push(A);out.push(B);return;}
    if(ed.kind==='spline'){const pl=skEdgePoly(ed,st.from);for(let k=out.length?1:0;k<pl.length;k++)out.push({x:pl[k][0],y:pl[k][1]});return;} // profil à spline
    const e=ed.e,C=sk.points[e.pc],an=arcAngles(sk,e);if(!C||!an)return;
    const aF=Math.atan2(A.y-C.y,A.x-C.x),dA=an.a2-an.a1;
    const ccw=Math.min(nm(aF-an.a1),TAU-nm(aF-an.a1))<=Math.min(nm(aF-an.a2),TAU-nm(aF-an.a2));
    const n=Math.max(4,Math.ceil(dA*e.r/0.8));
    for(let k=out.length?1:0;k<=n;k++){const t=aF+(ccw?1:-1)*dA*k/n;out.push({x:C.x+e.r*Math.cos(t),y:C.y+e.r*Math.sin(t)});}
  });
  return out;
}
function legacySweepGeos(f,warnArr){
  const ck=sweepCheck(f);
  if(!ck.ok)throw new Error(ck.msg);
  const sk=ck.sk,pk=ck.pk,path=ck.path,tr=ck.tr;
  // calcul en tableaux [x,y,z] : rien d'autre de THREE que la géométrie finale
  const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const unit=a=>{const l=Math.hypot(a[0],a[1],a[2]);return l>1e-12?[a[0]/l,a[1]/l,a[2]/l]:null;};
  const mul=(M,a)=>[dot(M[0],a),dot(M[1],a),dot(M[2],a)];
  const mm=(A,B)=>A.map(r=>[0,1,2].map(j=>r[0]*B[0][j]+r[1]*B[1][j]+r[2]*B[2][j]));
  // rotation minimale qui amène a sur b (Rodrigues), a et b unitaires
  const rotAB=(a,b)=>{
    const v=cross(a,b),c=dot(a,b);
    if(c<-0.999999){const p=unit(cross(a,Math.abs(a[0])<0.9?[1,0,0]:[0,1,0]));return [0,1,2].map(i=>[0,1,2].map(j=>2*p[i]*p[j]-(i===j?1:0)));}
    const K=[[0,-v[2],v[1]],[v[2],0,-v[0]],[-v[1],v[0],0]],K2=mm(K,K),s=1/(1+c);
    return [0,1,2].map(i=>[0,1,2].map(j=>(i===j?1:0)+K[i][j]+K2[i][j]*s));
  };
  // chemin en monde
  let P2;
  if(path.circle){
    const C=pk.points[path.circle.pc],r=path.circle.r,n=Math.max(48,Math.ceil(TAU_SW*r/0.8));
    P2=[];for(let k=0;k<=n;k++){const t=TAU_SW*k/n;P2.push({x:C.x+r*Math.cos(t),y:C.y+r*Math.sin(t)});}
  }else{
    P2=sweepChainPts2D(pk,Object.assign({},pk.points,path.pts),path.chain);
    if(path.closed&&P2.length)P2.push(P2[0]);
  }
  const Q=P2.map(p=>occW(pk,p.x,p.y));
  if(Q.length<2)throw new Error('chemin trop court');
  const seg=[];for(let i=0;i<Q.length-1;i++)seg.push(unit(sub(Q[i+1],Q[i])));
  for(let i=seg.length-1;i>=0;i--)if(!seg[i])seg[i]=seg[i+1]||[1,0,0];
  // tangente au sommet i : bissectrice des segments voisins (onglet approché, sans élargissement)
  const tan=Q.map((q,i)=>{
    const a=(path.closed&&i===0)?seg[seg.length-1]:seg[Math.max(0,i-1)],b=(path.closed&&i===Q.length-1)?seg[0]:seg[Math.min(seg.length-1,i)];
    return unit([a[0]+b[0],a[1]+b[1],a[2]+b[2]])||b;
  });
  const S=Q[0],rot=[];let R=[[1,0,0],[0,1,0],[0,0,1]],prev=[ck.start.T.x,ck.start.T.y,ck.start.T.z];
  tan.forEach(t=>{R=mm(rotAB(prev,t),R);rot.push(R);prev=t;});
  const geos=[];
  const tube=prof2=>{
    if(prof2.length<3)return;
    const ring=prof2.map(p=>sub(occW(sk,p.x,p.y),S)),m=ring.length,pos=[],idx=[];
    Q.forEach((c,i)=>ring.forEach(r=>{const w=mul(rot[i],r);pos.push(w[0]+c[0],w[1]+c[1],w[2]+c[2]);}));
    for(let i=0;i<Q.length-1;i++)for(let j=0;j<m;j++){
      const a=i*m+j,b=i*m+(j+1)%m,c=(i+1)*m+j,d=(i+1)*m+(j+1)%m;idx.push(a,b,d,a,d,c);
    }
    if(!path.closed){
      let tri;
      try{tri=THREE.ShapeUtils.triangulateShape(prof2.map(p=>new THREE.Vector2(p.x,p.y)),[]);}catch(e){tri=null;}
      if(!Array.isArray(tri)){tri=[];for(let j=1;j<m-1;j++)tri.push([0,j,j+1]);} // éventail (profil convexe)
      const last=(Q.length-1)*m;
      tri.forEach(t=>{idx.push(t[2],t[1],t[0]);idx.push(last+t[0],last+t[1],last+t[2]);});
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
    geos.push(g);
  };
  tr.solids.forEach(sol=>{
    const pr=sweepChainPts2D(sk,tr.pts,sol.chain);
    if(pr.length>1&&Math.hypot(pr[0].x-pr[pr.length-1].x,pr[0].y-pr[pr.length-1].y)<1e-6)pr.pop();
    tube(pr);
    if((sol.holes||[]).length&&warnArr)warnArr.push(f.name+' : aperçu maillage sans les trous du profil');
  });
  sweepCircleNest(sk,tr.circlesOut).filter(n=>!(n.depth%2)).map(n=>n.c).forEach(c=>{const C=sk.points[c.pc];if(!C)return;const pr=[];for(let k=0;k<32;k++){const t=TAU_SW*k/32;pr.push({x:C.x+c.r*Math.cos(t),y:C.y+c.r*Math.sin(t)});}tube(pr);});
  if(!geos.length)throw new Error('balayage vide');
  return geos;
}
// ── CRÉATION ────────────────────────────────────────────────────────────────
// Profil : l'esquisse sélectionnée, sinon la dernière à profil fermé. Chemin : la plus récente
// des AUTRES esquisses dont le chemin est lisible. Les deux valables → la fonction naît tout de
// suite (fenêtre dynamique, OK / Annuler) ; sinon le formulaire dit ce qui manque.
function sweepSketches(){return doc.sketches.filter(s=>!repCloneSkName(s));}
function sweepDefaultPath(profId){
  const S=sweepSketches();
  for(let i=S.length-1;i>=0;i--){
    if(S[i].id===profId)continue;
    if(sweepCheck({sketchId:profId,pathId:S[i].id}).ok)return S[i].id;
  }
  for(let i=S.length-1;i>=0;i--)if(S[i].id!==profId&&!sweepPath2D(S[i],null).err)return S[i].id;
  return null;
}
function askSweep(presetSketchId){
  const S=sweepSketches();
  if(S.length<2){alert('Balayage : il faut deux esquisses — le PROFIL (fermé) et le CHEMIN (lignes, arcs et splines bout à bout), sur des plans différents.');return;}
  let prof=presetSketchId;
  if(!prof){
    for(let i=S.length-1;i>=0&&!prof;i--){const tr=skLoopTrace(S[i]);if(tr.solids.length||tr.circlesOut.length)prof=S[i].id;}
    prof=prof||S[S.length-1].id;
  }
  const pathId=sweepDefaultPath(prof);
  if(pathId&&sweepCheck({sketchId:prof,pathId}).ok){
    const snap=docSnap(),len=docUndoStack.length;
    const nf={id:uid('sw'),type:'sweep',name:'',sketchId:prof,pathId:pathId,op:'add',visible:true};
    nf.name=sweepName(nf);
    addFeature(nf);
    [prof,pathId].forEach(id=>{const s=doc.sketches.find(x=>x.id===id);if(s&&s.visible!==false)s.visible=false;});
    sel={kind:'feature',id:nf.id};
    fdynStart(nf,snap,len);
    markDirty();rebuild();renderTree();renderProps();
    try{faceEl.textContent='Balayage : vérifiez le profil et le chemin, puis OK (Échap = annuler).';}catch(e){}
    return;
  }
  swNew={sketchId:prof,pathId:pathId,op:'add'};
  sel={kind:null,id:null};
  renderNewSweep();
}
function sweepSkSelect(val,onSet,exclude){
  const s=document.createElement('select');
  sweepSketches().forEach(k=>{const o=document.createElement('option');o.value=k.id;o.textContent=k.name+(k.id===exclude?' (profil)':'');s.appendChild(o);});
  if(!val){const o=document.createElement('option');o.value='';o.textContent='— choisir —';s.insertBefore(o,s.firstChild);}
  s.value=val||'';
  s.onchange=()=>{if(s.value)onSet(s.value);};
  return s;
}
function sweepNote(f){
  const n=document.createElement('div');n.className='pnl-note';n.style.marginTop='6px';
  const ck=sweepCheck(f);
  if(!ck.ok)n.textContent='⚠ '+ck.msg;
  else{
    const p=ck.path;
    n.textContent='✓ chemin '+(p.circle?'circulaire':(p.closed?'fermé':'ouvert')+' de '+p.n+' trait(s)')+', longueur '+p.len.toFixed(1)+' mm'+
      (ck.warn?' — ⚠ '+ck.warn:'');
  }
  return n;
}
function renderNewSweep(){
  if(!swNew)return;
  const p=$('props');p.innerHTML='';
  const h=document.createElement('div');h.className='pnl-h';h.textContent='〰 Balayage';p.appendChild(h);
  const row=(lab,el)=>{const r=document.createElement('div');r.className='pnl-row';const l=document.createElement('label');l.textContent=lab;r.appendChild(l);r.appendChild(el);p.appendChild(r);};
  const s1=document.createElement('select');
  s1.innerHTML='<option value="add">➕ Plot — ajoute de la matière</option><option value="cut">➖ Poche — retire de la matière</option>';
  s1.value=swNew.op;s1.onchange=()=>{swNew.op=s1.value;};
  row('Opération',s1);
  row('Profil (fermé)',sweepSkSelect(swNew.sketchId,v=>{swNew.sketchId=v;if(swNew.pathId===v)swNew.pathId=sweepDefaultPath(v);renderNewSweep();}));
  row('Chemin',sweepSkSelect(swNew.pathId,v=>{swNew.pathId=v;renderNewSweep();},swNew.sketchId));
  p.appendChild(sweepNote(swNew));
  const b=document.createElement('div');b.className='pnl-btns';b.style.marginTop='8px';
  const ok=document.createElement('button');ok.className='primary';ok.textContent='✔ Créer';ok.onclick=swNewOk;b.appendChild(ok);
  const no=document.createElement('button');no.textContent='✖ Annuler';no.onclick=swNewCancel;b.appendChild(no);
  p.appendChild(b);
}
function swNewOk(){
  if(!swNew)return;
  const ck=sweepCheck(swNew);
  if(!ck.ok){faceEl.textContent='Balayage : '+ck.msg;return;}
  const nf={id:uid('sw'),type:'sweep',name:'',sketchId:swNew.sketchId,pathId:swNew.pathId,op:swNew.op,visible:true};
  nf.name=sweepName(nf);
  addFeature(nf);
  [nf.sketchId,nf.pathId].forEach(id=>{const s=doc.sketches.find(x=>x.id===id);if(s&&s.visible!==false)s.visible=false;});
  swNew=null;
  ghostHide=(nf.op==='cut')?nf.id:null;
  sel={kind:'feature',id:nf.id};
  markDirty();rebuild();renderTree();renderProps();
  faceEl.textContent='Balayage créé : '+nf.name;
}
function swNewCancel(){swNew=null;sel={kind:null,id:null};renderProps();}

// ── PANNEAU d'un balayage existant (fenêtre dynamique : OK / Annuler) ───────
function sweepPanel(p,f){
  fdynEnsure(f);
  if(fdyn&&fdyn.isNew){const n=document.createElement('div');n.className='pnl-note';n.textContent='Aperçu : la pièce montrée EST le résultat. Changez le profil, le chemin ou l’opération au besoin.';p.appendChild(n);}
  fdynSec(p,'Opération',extSeg([['add','➕','Plot','Ajoute de la matière'],['cut','➖','Poche','Retire de la matière']],f.op||'add',
    v=>fdynSet('opération de « '+f.name+' »',g=>{g.op=v;ghostHide=(v==='cut')?g.id:null;})));
  const hide=id=>{const s=doc.sketches.find(x=>x.id===id);if(s&&s.visible!==false)s.visible=false;};
  fdynSec(p,'Profil (fermé)',sweepSkSelect(f.sketchId,v=>fdynSet('profil de « '+f.name+' »',g=>{g.sketchId=v;hide(v);})));
  fdynSec(p,'Chemin',sweepSkSelect(f.pathId,v=>fdynSet('chemin de « '+f.name+' »',g=>{g.pathId=v;hide(v);}),f.sketchId));
  p.appendChild(sweepNote(f));
  fdynFoot(p,f);
}
