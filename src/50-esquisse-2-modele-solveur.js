// Esquisse 2D (2/5) : modèle à points partagés, contraintes, solveurs (relaxation, moindres carrés LM).
/* ----- modèle points partagés (coïncidence structurelle) ----- */
function skPts(sk){return sk.points||(sk.points={});}
const SK_ORIGIN='O'; // point d'origine permanent (0,0) — toujours fixe, jamais supprimé ni GC
function ensureOrigin(sk){
  if(!sk)return;
  const P=skPts(sk);
  const O=P[SK_ORIGIN];
  if(!O){
    // Esquisse corrompue SANS origine : si UN point est déjà pile en (0,0), c'est l'ancien
    // faux-origine qui porte les droites dessinées « en 0 ». On le PROMOUVOIT en origine
    // (fusion des références, y compris ancrages de congé) plutôt que de créer un doublon
    // invisible à côté : l'origine garde son rôle, les attaches des lignes suivent.
    // Jamais un point FIXÉ (arête projetée calée en 0,0 : sa place lui appartient).
    const busy=new Set([skChain,skArcC,skCoinA,skPendPt,skDrag,skDown&&skDown.pid].filter(Boolean));
    const fk=skFixed(sk);
    const cand=Object.keys(P).find(pid=>!busy.has(pid)&&!fk.has(pid)&&Math.abs(P[pid].x)<=1e-6&&Math.abs(P[pid].y)<=1e-6);
    P[SK_ORIGIN]={x:0,y:0};
    if(cand&&cand!==SK_ORIGIN)mergePoints(sk,cand,SK_ORIGIN);
  }else if(O.x!==0||O.y!==0){
    O.x=0;O.y=0; // l'origine est (0,0) par définition : aucun réglage ne doit l'emmener
  }
}
function skNewPid(sk){sk.seq=sk.seq||1;return 'p'+(sk.seq++);}
function skNewEid(sk){sk.seq=sk.seq||1;return 'e'+(sk.seq++);}
function addPoint(sk,x,y){const id=skNewPid(sk);skPts(sk)[id]={x,y};return id;}
function pidAt(sk,x,y){let best=null,bd=0.01;Object.keys(skPts(sk)).forEach(pid=>{const p=sk.points[pid];const d=Math.hypot(p.x-x,p.y-y);if(d<bd){bd=d;best=pid;}});return best||addPoint(sk,x,y);}
// V0.7.1 : pendant une résolution (sklsSolveLM), les entités ne changent pas — index par id et
// points fixés calculés une fois (le résidu est évalué des milliers de fois). Hors résolution : recherche.
let skLmCtx=null; // {sk, ents:Map id→entité, fix:Set}
function entById(sk,id){
  if(skLmCtx&&skLmCtx.sk===sk){const e=skLmCtx.ents.get(id);if(e!==undefined)return e;}
  return (sk.entities||[]).find(e=>e.id===id);
}
// 2026-10-15-009 : CÔTÉ des cotes à distance perpendiculaire (entraxe, point ↔ ligne).
// Écrites (d² − w²)/2w, elles admettaient ±w : quand une référence bougeait (projection
// associative), le solveur pouvait rejoindre la solution MIROIR — « Cavité Usinage » :
// 50 → 55 → 50, une ligne cotée 3,26 SOUS l'arête projetée revenait 3,26 AU-DESSUS, et
// deux congés R7 devenaient impossibles. d.sgn mémorise le côté dès que l'esquisse est
// dans un état COHÉRENT (cote respectée), puis le solveur et l'audit l'imposent.
function skDimSignedOf(sk,d){
  const P=sk.points||{};
  const nrmOf=l=>{const A=P[l.p1],B=P[l.p2];if(!A||!B)return null;const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy);if(L<1e-9)return null;return{A,nx:-dy/L,ny:dx/L};};
  if(d.type==='gap'){const A=entById(sk,d.a),B=entById(sk,d.b);if(!A||!B||A.t!=='line'||B.t!=='line')return null;
    const n=nrmOf(A),B1=P[B.p1];if(!n||!B1)return null;return (B1.x-n.A.x)*n.nx+(B1.y-n.A.y)*n.ny;}
  if(d.type==='distline'){const l=entById(sk,d.line),Pt=P[d.p];if(!l||l.t!=='line'||!Pt)return null;
    const n=nrmOf(l);if(!n)return null;return (Pt.x-n.A.x)*n.nx+(Pt.y-n.A.y)*n.ny;}
  return null;
}
function skDimSides(sk){
  (sk.dims||[]).forEach(d=>{
    if((d.type!=='gap'&&d.type!=='distline')||d.sgn===1||d.sgn===-1)return;
    const w=Math.max(+d.value||0,0);if(!(w>1e-6))return;
    const sg=skDimSignedOf(sk,d);if(sg==null)return;
    if(Math.abs(Math.abs(sg)-w)<=Math.max(0.01,w*2e-3))d.sgn=sg>=0?1:-1;
  });
}
function migrateSketch(sk){
  if(!sk.points)sk.points={};if(!sk.constraints)sk.constraints=[];if(!sk.dims)sk.dims=[];if(!sk.seq)sk.seq=1;
  try{if(sk.entities)skDimSides(sk);}catch(e){}
  try{ensureSketchBasis(sk);}catch(e){}
  sk.dims.forEach(d=>{if(d.ox===undefined)d.ox=0;if(d.oy===undefined)d.oy=0;});
  sk.entities.forEach(e=>{
    if(!e.id)e.id=skNewEid(sk);
    if(e.t==='line'&&!e.p1){e.p1=addPoint(sk,e.x1,e.y1);e.p2=addPoint(sk,e.x2,e.y2);delete e.x1;delete e.y1;delete e.x2;delete e.y2;}
    if(e.t==='circle'&&!e.pc){e.pc=addPoint(sk,e.cx,e.cy);delete e.cx;delete e.cy;}
    if(e.t==='arc'&&!e.pa){const C=(sk.points[e.pc])||{x:0,y:0};
      e.pa=addPoint(sk,C.x+e.r*Math.cos(e.a1||0),C.y+e.r*Math.sin(e.a1||0));
      e.pb=addPoint(sk,C.x+e.r*Math.cos(e.a2||1),C.y+e.r*Math.sin(e.a2||1));
      delete e.a1;delete e.a2;}
    if(e.t==='rect'){
      const a=addPoint(sk,e.x,e.y),b=addPoint(sk,e.x+e.w,e.y),c=addPoint(sk,e.x+e.w,e.y+e.h),d=addPoint(sk,e.x,e.y+e.h);
      const l1={id:skNewEid(sk),t:'line',p1:a,p2:b},l2={id:skNewEid(sk),t:'line',p1:b,p2:c},l3={id:skNewEid(sk),t:'line',p1:c,p2:d},l4={id:skNewEid(sk),t:'line',p1:d,p2:a};
      sk.entities.push(l1,l2,l3,l4);
      sk.constraints.push({id:skNewEid(sk),type:'h',line:l1.id},{id:skNewEid(sk),type:'h',line:l3.id},{id:skNewEid(sk),type:'v',line:l2.id},{id:skNewEid(sk),type:'v',line:l4.id});
      e._dead=true;
    }
  });
  sk.entities=sk.entities.filter(e=>!e._dead);
  ensureOrigin(sk);
}
function cleanupSk(sk){
  ensureOrigin(sk); // origine permanente : rétablie si absente
  skGapToAngle(sk);
  skSplineCleanup(sk); // splines réduites / poignées orphelines (50-esquisse-6)
  const keep=new Set([skChain,skArcC,skCoinA,skPendPt,skDrag,skDown&&skDown.pid,SK_ORIGIN].filter(Boolean));
  const ref=new Set();
  (sk.entities||[]).forEach(e=>{['p1','p2','p','pc','pa','pb'].forEach(k=>{if(e[k])ref.add(e[k]);});if(e.pts)e.pts.forEach(p=>ref.add(p));});
  (sk.dims||[]).forEach(d=>{if(d.a)ref.add(d.a);if(d.b)ref.add(d.b);if(d.p)ref.add(d.p);});
  (sk.constraints||[]).forEach(c=>{if(c.p)ref.add(c.p);if(c.a)ref.add(c.a);if(c.b)ref.add(c.b);if(c.mid)ref.add(c.mid);});
  keep.forEach(k=>ref.add(k));
  // Ancrages de congés/chanfreins : un point d'esquisse visé par une ancre 'p' est une
  // RÉFÉRENCE, pas un résidu — il doit survivre au nettoyage de l'esquisse.
  (doc.features||[]).forEach(f=>{
    if(f.type!=='xfillet'||!f.edges)return;
    f.edges.forEach(e=>{const a=e.anchor;if(a&&a.t==='p'&&a.sk===sk.id&&a.id)ref.add(a.id);});
  });
  Object.keys(skPts(sk)).forEach(pid=>{if(!ref.has(pid))delete sk.points[pid];});
  const eids=new Set((sk.entities||[]).map(e=>e.id));
  sk.constraints=(sk.constraints||[]).filter(c=>{
    if(c.line&&!eids.has(c.line))return false;
    if(c.ent&&!eids.has(c.ent))return false;
    if(c.s&&!eids.has(c.s))return false; // tangence de spline : la spline
    if(c.p&&!sk.points[c.p])return false;
    if(c.type==='stangent'||c.type==='scurv'){const S=entById(sk,c.s),O=entById(sk,c.ent); // tangence / courbure de spline
      if(!S||S.t!=='spline'||S.pts.indexOf(c.p)<0||!skSplineTanPid(sk,S,c.p))return false;
      if(O&&O.t==='spline'&&!skSplineTanPid(sk,O,c.p))return false;
      if(c.type==='scurv'&&!(sk.constraints||[]).some(k=>k.type==='stangent'&&k.s===c.s&&k.p===c.p&&k.ent===c.ent))return false;} // G2 sans G1 : retirée
    if(c.type==='coincident')return(!c.a||!!sk.points[c.a])&&(!c.b||!!sk.points[c.b]); // a/b = POINTS
    if(c.type==='symmetric')return(!!eids.has(c.a)&&!!eids.has(c.b)&&!!eids.has(c.mid));
    if(c.type==='offset'&&!(eids.has(c.c)&&eids.has(c.d)))return false; // V0.11.25 : 2ᵉ paire (c/d) = entités
    if(c.a&&!eids.has(c.a))return false;
    if(c.b&&!eids.has(c.b))return false;
    if(c.mid&&!eids.has(c.mid))return false;
    return true;
  });
  sk.constraints=skDedupConstraints(sk); // doublons exacts + ⟂ implicite par ─/│ : ne sert à rien, on purge
  // cotes : distance/distline référencent des POINTS · gap/angle référencent des ENTITÉS (ligne)
  sk.dims=(sk.dims||[]).filter(d=>{
    if(d.line&&!eids.has(d.line))return false;
    if(d.ent&&!eids.has(d.ent))return false;
    if(d.type==='distance'||d.type==='distline'){
      if(d.a&&!sk.points[d.a])return false;
      if(d.b&&!sk.points[d.b])return false;
      if(d.p&&!sk.points[d.p])return false;
    }
    if(d.type==='gap'||d.type==='angle'){
      if(d.a&&!eids.has(d.a))return false;
      if(d.b&&!eids.has(d.b))return false;
    }
    return true;
  });
}
// 2026-10-23 : deux lignes sont « parallèles » pour une cote d'entraxe seulement si elles le
// sont VRAIMENT : contrainte ∥ / colinéaire, toutes deux ─ ou toutes deux │, ou écart < 0,5°.
// Avant, une tolérance de 3° faisait poser un entraxe (mm) entre deux lignes presque parallèles
// au moment du clic — l'utilisateur y tapait un angle (« 10 ») qui n'était jamais un angle.
const SK_PARALLEL_HARD=0.5*Math.PI/180;
function skParallelPair(sk,A,B){
  if(!A||!B)return false;
  if(skHasParallel(sk,A.id,B.id))return true;
  if((sk.constraints||[]).some(c=>c.type==='collinear'&&((c.a===A.id&&c.b===B.id)||(c.a===B.id&&c.b===A.id))))return true;
  if((hasHV(sk,A.id,'h')&&hasHV(sk,B.id,'h'))||(hasHV(sk,A.id,'v')&&hasHV(sk,B.id,'v')))return true;
  const va=skLinesAngle(sk,A,B);
  return va!==null&&va<SK_PARALLEL_HARD;
}
// un entraxe entre deux lignes NON parallèles n'a pas de sens (posé avec l'ancienne tolérance
// de 3°) → cote d'angle à la valeur mesurée : rien ne bouge, l'angle se règle ensuite
function skGapToAngle(sk){
  let n=0;
  try{(sk.dims||[]).forEach(d=>{
    if(d.type!=='gap')return;
    const A=entById(sk,d.a),B=entById(sk,d.b);if(!A||!B||A.t!=='line'||B.t!=='line')return;
    if(skParallelPair(sk,A,B))return;
    const fr=angleFrame(sk,{a:A.id,b:B.id});if(!fr)return;
    const ad=Math.abs(fr.delta);if(ad<0.03||Math.PI-ad<0.03)return;
    d.type='angle';d.value=+ad.toFixed(6);d.ccw=fr.delta>0?1:0;
    delete d.sgn;delete d.sl;delete d.orient;delete d.w;n++;
  });}catch(e){}
  return n;
}
function hasHV(sk,lineId,t){return (sk.constraints||[]).some(c=>c.type===t&&c.line===lineId);}
function skHasPerp(sk,aId,bId){return (sk.constraints||[]).some(c=>c.type==='perpendicular'&&((c.a===aId&&c.b===bId)||(c.a===bId&&c.b===aId)));}
function skHasParallel(sk,aId,bId){return (sk.constraints||[]).some(c=>c.type==='parallel'&&((c.a===aId&&c.b===bId)||(c.a===bId&&c.b===aId)));}
function skHasCoincident(sk,pa,pb){return (sk.constraints||[]).some(c=>c.type==='coincident'&&((c.a===pa&&c.b===pb)||(c.a===pb&&c.b===pa)));}
function skHasTangent(sk,l,e){return (sk.constraints||[]).some(c=>c.type==='tangent'&&((c.line===l&&c.ent===e)||(c.line===e&&c.ent===l)));}
function skSameEnd(sk,a,b){ // deux extrémités « jointes » : même point OU liées par une contrainte coincident
  if(a===b)return true;
  return !!a&&!!b&&skHasCoincident(sk,a,b);
}
function skJointSame(sk,a,b){ // joint de décalage : skSameEnd OU superposition géométrique (< 1e-6) — les projections créent leurs points DUPLICATA à chaque jonction (pids distincts, écarts ~2e-8, aucune contrainte)
  if(skSameEnd(sk,a,b))return true;
  if(!a||!b)return false;
  const pa=sk.points[a],pb=sk.points[b];
  return !!pa&&!!pb&&Math.hypot(pa.x-pb.x,pa.y-pb.y)<1e-6;
}
function skOffsetVal(sk,aId,bId,sgn){ // V0.11.25 : écart signé source→copie d'un décalage — lignes : distance ⟂ du p1 de la copie à la source (normale gauche) ; arcs/cercles : Δ rayon. null si non mesurable.
  const P=sk.points,A=entById(sk,aId),B=entById(sk,bId);if(!A||!B)return null;
  const s=sgn===-1?-1:1;
  if(A.t==='line'&&B.t==='line'){
    const A1=P[A.p1],A2=P[A.p2],B1=P[B.p1];if(!A1||!A2||!B1)return null;
    if(skForRank&&skRankDegen&&skRankDegen.has(A.id))return null; // ligne réduite à un point : pas de direction (cf. vec)
    const dx=A2.x-A1.x,dy=A2.y-A1.y,L=Math.hypot(dx,dy);if(!(L>1e-9))return null;
    return s*((B1.x-A1.x)*(-dy/L)+(B1.y-A1.y)*(dx/L));
  }
  if((A.t==='circle'||A.t==='arc')&&(B.t==='circle'||B.t==='arc'))return s*(B.r-A.r);
  return null;
}
function skPerpImplied(sk,aId,bId){
  // ⟂ IMPLICITE par ─/│ : une droite H et une droite V sont perpendiculaires par
  // construction — ajouter ⟂ ne sert à rien (que du sur-contrainte et du bruit).
  // Ne s'applique que si les deux directions sont explicites (contraintes posées),
  // jamais sur une simple proximité géométrique (qui, elle, doit rester pilotée).
  return (hasHV(sk,aId,'h')&&hasHV(sk,bId,'v'))||(hasHV(sk,aId,'v')&&hasHV(sk,bId,'h'));
}
function skConKey(c){
  // Clé canonique d'une contrainte (paires a/b triées) : deux contraintes de même
  // clé sont interchangeables — la seconde est un doublon. Type inconnu : jamais
  // dédupliqué (clé = id, conservatrice).
  if(!c||!c.type)return '';
  const pair=(x,y)=>[String(x),String(y)].sort().join('|');
  switch(c.type){
    case 'h': case 'v': return c.type+'@'+c.line;
    case 'fix': return 'fix@'+(c.p!=null?('p:'+c.p):('ent:'+c.ent));
    case 'tangent': return 'tangent@'+c.line+'|'+c.ent;
    case 'tangent2': return 'tangent2@'+pair(c.a,c.b);
    case 'parallel': case 'perpendicular': case 'equal': case 'collinear': return c.type+'@'+pair(c.a,c.b);
    case 'symmetric': return 'symmetric@'+pair(c.a,c.b)+'|'+c.mid;
    case 'coaxial': return 'coaxial@'+pair(c.a,c.b);
    case 'offset': return 'offset@'+c.a+'|'+c.b+'|'+c.c+'|'+c.d;
    case 'coincident': return 'coincident@'+pair(c.a,c.b);
    case 'midpoint': return c.p!=null?('midpoint@'+c.p+'|'+c.line):('midpoint@@'+pair(c.a,c.b));
    case 'online': return 'online@'+c.p+'|'+c.line;
    case 'oncircle': return 'oncircle@'+c.p+'|'+c.ent;
    case 'stangent': case 'scurv': return c.type+'@'+c.s+'|'+c.p+'|'+c.ent;
    case 'onspline': return 'onspline@'+c.p+'|'+c.ent;
    default: return c.type+'@'+(c.id||'');
  }
}
function skDedupConstraints(sk){
  // Purge les doublons exacts + les ⟂ implicites par ─/│ (même règle qu'à la
  // création). Appelée par cleanupSk : toute édition ré-équilibre la liste.
  const seen=new Set(),out=[];
  const coll=new Set((sk.constraints||[]).filter(c=>c&&c.type==='collinear').map(c=>[String(c.a),String(c.b)].sort().join('|')));
  (sk.constraints||[]).forEach(c=>{
    if(c.type==='perpendicular'&&skPerpImplied(sk,c.a,c.b))return;
    // Colinéaire ⇒ parallèle : la ∥ sur la même paire ne ferait que sur-contraindre.
    if(c.type==='parallel'&&coll.has([String(c.a),String(c.b)].sort().join('|')))return;
    const k=skConKey(c);
    if(seen.has(k))return;
    seen.add(k);out.push(c);
  });
  return out;
}

/* ----- solveur par relaxation (contraintes + cotes pilotantes) ----- */
function skFixed(sk){
  if(skLmCtx&&skLmCtx.sk===sk)return new Set(skLmCtx.fix);
  const f=new Set();
  (sk.constraints||[]).forEach(c=>{
    if(c.type==='fix'&&c.p)f.add(c.p);
    if(c.type==='fix'&&c.ent){const e=entById(sk,c.ent);if(e&&(e.t==='circle'||e.t==='arc'||e.t==='cpoint')&&(e.pc||e.p))f.add(e.pc||e.p);
      if(e&&e.t==='spline')skSplineAllPids(sk,e).forEach(p=>f.add(p));} // spline fixe : points de passage et poignées
  });
  if((sk.points||{})[SK_ORIGIN])f.add(SK_ORIGIN);
  return f;
}
function lineLen(sk,l){const P=sk.points,A=P[l.p1],B=P[l.p2];if(!A||!B)return 0;return Math.hypot(B.x-A.x,B.y-A.y);}
function syncLineDims(sk,lineId){ // après ajout d'une ligne, recale ses cotes length sur la mesure courante (selon orientation)
  (sk.dims||[]).forEach(d=>{if(d.type==='length'&&d.line===lineId){const v=dimCurValue(sk,d);if(v!=null)d.value=v;}});
}
function scaleLineDist(sk,l,target,fix){
  // cote length sur une ligne DE CONSTRUCTION (ex. entraxe de l'oblong) :
  // étire TOUTE la composante connexe le long de l'axe (accordéon), en conservant
  // les écarts perpendiculaires → rayons/tangences inchangés, seule la longueur pilote.
  const P=sk.points,A=P[l.p1],B=P[l.p2];if(!A||!B)return;
  const dx=B.x-A.x,dy=B.y-A.y,len=Math.hypot(dx,dy);if(!(len>1e-6))return;
  const k=target/len;
  const ux=dx/len,uy=dy/len;
  const aF=fix.has(l.p1),bF=fix.has(l.p2);
  let rx,ry;
  if(aF&&!bF){rx=A.x;ry=A.y;}
  else if(bF&&!aF){rx=B.x;ry=B.y;}
  else{rx=(A.x+B.x)/2;ry=(A.y+B.y)/2;}
  const pc=skDragComp(sk,skEntPids(l)).pids;
  for(const pid of pc){if(fix.has(pid))continue;
    const Q=P[pid];if(!Q)continue;
    const t=(Q.x-rx)*ux+(Q.y-ry)*uy;
    Q.x+=ux*t*(k-1);Q.y+=uy*t*(k-1);
  }
}
function scaleLine(sk,l,target,fix){
  const P=sk.points,A=P[l.p1],B=P[l.p2];if(!A||!B)return;
  const dx=B.x-A.x,dy=B.y-A.y,len=Math.hypot(dx,dy);if(!(len>1e-6))return;
  const k=target/len;
  const aF=fix.has(l.p1),bF=fix.has(l.p2);
  if(aF&&!bF){B.x=A.x+dx*k;B.y=A.y+dy*k;}
  else if(bF&&!aF){A.x=B.x-dx*k;A.y=B.y-dy*k;}
  else{const mx=(A.x+B.x)/2,my=(A.y+B.y)/2;
    if(!aF){A.x=mx-dx*k/2;A.y=my-dy*k/2;}
    if(!bF){B.x=mx+dx*k/2;B.y=my+dy*k/2;}}
}
function scaleAxisPts(sk,pa,pb,val,axis,fix){ // étire |Δaxis| (0=x,1=y) vers val sans toucher l'autre composante
  const P=sk.points,A=P[pa],B=P[pb];if(!A||!B)return;
  const av=axis?A.y:A.x,bv=axis?B.y:B.x;
  const dd=bv-av;if(!(Math.abs(dd)>1e-9))return;
  const k=Math.max(val,0)/Math.abs(dd);
  const aF=fix.has(pa),bF=fix.has(pb);
  if(aF&&!bF){if(axis)B.y=av+dd*k;else B.x=av+dd*k;}
  else if(bF&&!aF){if(axis)A.y=bv-dd*k;else A.x=bv-dd*k;}
  else if(!aF&&!bF){const m=(av+bv)/2;
    if(axis){A.y=m-dd*k/2;B.y=m+dd*k/2;}else{A.x=m-dd*k/2;B.x=m+dd*k/2;}}
}
function solveSketchRelax(sk,iters,anchor){
  if(!sk||!sk.points)return;iters=iters||120;
  for(let it=0;it<iters;it++){
    const fix=skFixed(sk);
    if(anchor&&anchor.length)for(let i=0;i<anchor.length;i++)fix.add(anchor[i]); // pids ancrés (drag) = fixes pendant la passe
    (sk.dims||[]).forEach(d=>{
      if(d.ref)return; // cote de RÉFÉRENCE (sur-contrainte) : mesurée, jamais imposée
      if(d.type==='length'){const l=entById(sk,d.line);if(l&&l.t==='line'){
        if(d.orient==='h')scaleAxisPts(sk,l.p1,l.p2,d.value,0,fix);
        else if(d.orient==='v')scaleAxisPts(sk,l.p1,l.p2,d.value,1,fix);
        else if(l.construction)scaleLineDist(sk,l,Math.max(d.value,0.1),fix);
        else scaleLine(sk,l,Math.max(d.value,0.1),fix);}}
      if(d.type==='distance'){
        if(d.orient==='h')scaleAxisPts(sk,d.a,d.b,d.value,0,fix);
        else if(d.orient==='v')scaleAxisPts(sk,d.a,d.b,d.value,1,fix);
        else{const P=sk.points,A=P[d.a],B=P[d.b];if(!A||!B)return;
        const dx=B.x-A.x,dy=B.y-A.y,len=Math.hypot(dx,dy);if(!(len>1e-6))return; // garde-fou : évite k=∞ (catapulte) si les points se superposent
        const k=Math.max(d.value,0)/len;
        const aF=fix.has(d.a),bF=fix.has(d.b);
        if(aF&&!bF){B.x=A.x+dx*k;B.y=A.y+dy*k;}
        else if(bF&&!aF){A.x=B.x-dx*k;A.y=B.y-dy*k;}
        else if(!aF&&!bF){const mx=(A.x+B.x)/2,my=(A.y+B.y)/2;A.x=mx-dx*k/2;A.y=my-dy*k/2;B.x=mx+dx*k/2;B.y=my+dy*k/2;}}}
      if(d.type==='diameter'||d.type==='radius'){const e=entById(sk,d.ent);if(e&&(e.t==='circle'||e.t==='arc'))e.r=Math.max(d.type==='diameter'?d.value/2:d.value,0.1);}
      if(d.type==='angle'){ // 2 lignes : angle ORIENTÉ A→B ∈ (-π,π] (ccw=secteur), piloté par rotation
        const A=entById(sk,d.a),B=entById(sk,d.b);if(!A||!B||A.t!=='line'||B.t!=='line')return;
        const P=sk.points,A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2];
        if(!A1||!A2||!B1||!B2)return;
        const TAU=Math.PI*2;
        const fr=angleFrame(sk,d);if(!fr)return;
        if(d.ccw!==0&&d.ccw!==1)d.ccw=(fr.delta>=0)?1:0; // migration : signe courant, valeur inchangée (pas de saut)
        const want=angleWant(d,fr.delta);
        let e=want-fr.delta;
        if(e>Math.PI)e-=TAU;else if(e<-Math.PI)e+=TAU;
        if(Math.abs(e)<1e-9)return;
        const shared=[A.p1,A.p2].find(p=>p===B.p1||p===B.p2);
        const aFL=fix.has(A.p1)&&fix.has(A.p2),bFL=fix.has(B.p1)&&fix.has(B.p2);
        if(aFL&&bFL)return;
        if(shared){
          const V=P[shared];
          const Ao=A.p1===shared?A2:A1,Bo=B.p1===shared?B2:B1;
          const aFree=!fix.has(A.p1===shared?A.p2:A.p1),bFree=!fix.has(B.p1===shared?B.p2:B.p1);
          if(aFree&&bFree){rotP(Ao,V.x,V.y,-e*0.25);rotP(Bo,V.x,V.y,+e*0.25);}
          else if(aFree&&!bFree)rotP(Ao,V.x,V.y,-e*0.5);
          else if(bFree&&!aFree)rotP(Bo,V.x,V.y,+e*0.5);
        }else{ // disjointes : pivote sur les milieux (positions préservées)
          const mAx=(A1.x+A2.x)/2,mAy=(A1.y+A2.y)/2,mBx=(B1.x+B2.x)/2,mBy=(B1.y+B2.y)/2;
          if(!aFL){rotP(A1,mAx,mAy,-e*0.25);rotP(A2,mAx,mAy,-e*0.25);}
          if(!bFL){rotP(B1,mBx,mBy,+e*0.25);rotP(B2,mBx,mBy,+e*0.25);}
        }
      }
      if(d.type==='gap'){ // 2 lignes // parallèles : distance ⊥ pilotée par translation rigide
        const A=entById(sk,d.a),B=entById(sk,d.b);if(!A||!B||A.t!=='line'||B.t!=='line')return;
        const P=sk.points,A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2];
        if(!A1||!A2||!B1||!B2)return;
        const dx=A2.x-A1.x,dy=A2.y-A1.y,L=Math.hypot(dx,dy)||1e-9;
        const nx=-dy/L,ny=dx/L;
        const signed=(B1.x-A1.x)*nx+(B1.y-A1.y)*ny;
        const sgn=(d.sgn===1||d.sgn===-1)?d.sgn:(signed>=0?1:-1); // côté mémorisé (jamais la solution miroir)
        let err=sgn*(sgn*Math.max(d.value,0)-signed);if(Math.abs(err)<1e-9)return;
        err*=0.5;
        const aFree=!fix.has(A.p1)&&!fix.has(A.p2),bFree=!fix.has(B.p1)&&!fix.has(B.p2);
        if(!aFree&&!bFree)return;
        if(aFree&&!bFree){A1.x-=nx*sgn*err*2;A1.y-=ny*sgn*err*2;A2.x-=nx*sgn*err*2;A2.y-=ny*sgn*err*2;}
        else if(bFree&&!aFree){B1.x+=nx*sgn*err*2;B1.y+=ny*sgn*err*2;B2.x+=nx*sgn*err*2;B2.y+=ny*sgn*err*2;}
        else{A1.x-=nx*sgn*err;A1.y-=ny*sgn*err;A2.x-=nx*sgn*err;A2.y-=ny*sgn*err;
          B1.x+=nx*sgn*err;B1.y+=ny*sgn*err;B2.x+=nx*sgn*err;B2.y+=ny*sgn*err;}
      }
      if(d.type==='distline'){ // centre (point) ↔ ligne : distance perpendiculaire (comme Fusion)
        const l=entById(sk,d.line);if(!l||l.t!=='line')return;
        const P=sk.points,Pt=P[d.p];if(!Pt)return;
        const A=P[l.p1],B=P[l.p2];if(!A||!B)return;
        const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy)||1e-9;
        const nx=-dy/L,ny=dx/L;
        const signed=(Pt.x-A.x)*nx+(Pt.y-A.y)*ny;
        const sgn=(d.sgn===1||d.sgn===-1)?d.sgn:(signed>=0?1:-1); // côté mémorisé
        const err=sgn*d.value-signed;if(Math.abs(err)<1e-9)return;
        const pF=fix.has(d.p),lF=fix.has(l.p1)&&fix.has(l.p2);
        if(pF&&lF)return;
        if(pF){A.x-=nx*err;A.y-=ny*err;B.x-=nx*err;B.y-=ny*err;} // ligne fixe → la ligne suit toute seule (translation)
        else if(lF){Pt.x+=nx*err;Pt.y+=ny*err;}
        else if(!fix.has(l.p1)&&!fix.has(l.p2)){const h=err*0.5; // partagé 50/50
          Pt.x+=nx*h;Pt.y+=ny*h;A.x-=nx*h;A.y-=ny*h;B.x-=nx*h;B.y-=ny*h;}
        else{Pt.x+=nx*err;Pt.y+=ny*err;} // 1 extrémité fixe → le point absorbe
      }
    });
    (sk.constraints||[]).forEach(c=>{
      const P=sk.points;
      if(c.type==='coincident'){ // 2 points réunis (dont centre ↔ origine)
        const A=P[c.a],B=P[c.b];if(!A||!B)return;
        const aF=fix.has(c.a),bF=fix.has(c.b);
        if(aF&&bF)return;
        const dx=B.x-A.x,dy=B.y-A.y;
        if(aF){B.x=A.x;B.y=A.y;}
        else if(bF){A.x=B.x;A.y=B.y;}
        else{A.x+=dx*0.5;A.y+=dy*0.5;B.x-=dx*0.5;B.y-=dy*0.5;}
      }
      if(c.type==='oncircle'){ // point épinglé sur cercle/arc : ramené radialement sur la courbe
        const Pt=P[c.p],E=entById(sk,c.ent);
        if(!Pt||!E||(E.t!=='circle'&&E.t!=='arc'))return;
        const CC=P[E.pc];if(!CC)return;
        const dx=Pt.x-CC.x,dy=Pt.y-CC.y,d=Math.hypot(dx,dy)||1e-9;
        const err=E.r-d;if(Math.abs(err)<1e-9)return;
        if(!fix.has(c.p)){Pt.x+=dx/d*err*0.5;Pt.y+=dy/d*err*0.5;}
        else if(!fix.has(E.pc)){CC.x-=dx/d*err*0.5;CC.y-=dy/d*err*0.5;} // point figé → le centre suit
      }
      if(c.type==='stangent')skStanRelax(sk,c,fix); // tangence de spline : la poignée tourne vers la tangente
      if(c.type==='onspline')skOnSplRelax(sk,c,fix); // point sur spline : à mi-chemin du pied
      if(c.type==='online'){ // point sur ligne : perpendiculaire à moitié ; point figé → la ligne suit
        const Pt=P[c.p],l=entById(sk,c.line);
        if(!Pt||!l||l.t!=='line')return;
        const A=P[l.p1],B=P[l.p2];if(!A||!B)return;
        const dx=B.x-A.x,dy=B.y-A.y,L2=dx*dx+dy*dy;if(L2<1e-12)return;
        const L=Math.sqrt(L2),nx=-dy/L,ny=dx/L;
        const signed=(Pt.x-A.x)*nx+(Pt.y-A.y)*ny;
        if(Math.abs(signed)<1e-9)return;
        if(!fix.has(c.p)){
          const t=((Pt.x-A.x)*dx+(Pt.y-A.y)*dy)/L2;
          const fx=A.x+Math.max(0,Math.min(1,t))*dx,fy=A.y+Math.max(0,Math.min(1,t))*dy;
          Pt.x+=(fx-Pt.x)*0.5;Pt.y+=(fy-Pt.y)*0.5;
        }else{
          const sh=-signed*0.5,aF=fix.has(l.p1),bF=fix.has(l.p2);
          if(aF&&!bF){B.x+=nx*sh;B.y+=ny*sh;}
          else if(bF&&!aF){A.x+=nx*sh;A.y+=ny*sh;}
          else if(!aF&&!bF){A.x+=nx*sh;A.y+=ny*sh;B.x+=nx*sh;B.y+=ny*sh;}
        }
      }
      if(c.type==='midpoint'){ // point au centre d'une ligne (sans la scinder) ou milieux de 2 lignes coïncidents
        if(c.p!=null){
          const Pt=P[c.p],l=entById(sk,c.line);
          if(!Pt||!l||l.t!=='line')return;
          const A=P[l.p1],B=P[l.p2];if(!A||!B)return;
          const ex=(A.x+B.x)/2-Pt.x,ey=(A.y+B.y)/2-Pt.y; // écart milieu ↔ point
          if(Math.abs(ex)<1e-9&&Math.abs(ey)<1e-9)return;
          if(!fix.has(c.p)){Pt.x+=ex*0.5;Pt.y+=ey*0.5;} // point libre → il va à moitié vers le milieu
          else{ // point figé → la ligne se recentre sur lui (mi-demi : chaque pas corrige la moitié)
            const aF=fix.has(l.p1),bF=fix.has(l.p2);
            if(aF&&bF)return;
            if(aF||bF){ // 1 extrémité libre : elle bouge de ex (le milieu rejoint d'un demi-pas)
              if(!aF){A.x-=ex;A.y-=ey;}else{B.x-=ex;B.y-=ey;}
            }else{A.x-=ex*0.5;A.y-=ey*0.5;B.x-=ex*0.5;B.y-=ey*0.5;}
          }
        }else if(c.a&&c.b){
          const la=entById(sk,c.a),lb=entById(sk,c.b);
          if(!la||!lb||la.t!=='line'||lb.t!=='line')return;
          const A1=P[la.p1],A2=P[la.p2],B1=P[lb.p1],B2=P[lb.p2];
          if(!A1||!A2||!B1||!B2)return;
          const fa=[fix.has(la.p1)?null:A1,fix.has(la.p2)?null:A2].filter(Boolean);
          const fb=[fix.has(lb.p1)?null:B1,fix.has(lb.p2)?null:B2].filter(Boolean);
          if(!fa.length&&!fb.length)return;
          const gx=((B1.x+B2.x)-(A1.x+A2.x))/2,gy=((B1.y+B2.y)-(A1.y+A2.y))/2; // mB − mA
          if(Math.abs(gx)<1e-9&&Math.abs(gy)<1e-9)return;
          const ka=fa.length?(fb.length?0.5:1):0, kb=fb.length?(fa.length?0.5:1):0; // partagé sauf si seul mobile
          if(fa.length){const hx=gx*ka/fa.length,hy=gy*ka/fa.length;fa.forEach(p=>{p.x+=hx;p.y+=hy;});}
          if(fb.length){const hx=-gx*kb/fb.length,hy=-gy*kb/fb.length;fb.forEach(p=>{p.x+=hx;p.y+=hy;});}
        }
      }
      if(c.type==='h'){const l=entById(sk,c.line);if(!l||l.t!=='line')return;const A=P[l.p1],B=P[l.p2];if(!A||!B)return;
        const aF=fix.has(l.p1),bF=fix.has(l.p2);
        if(aF&&bF)return; // les deux figés (fixé + ancre de glisser) : ne rien bouger — l'ancre cède, le garde-fou re-sout sans elle
        if(aF&&!bF)B.y=A.y;else if(bF&&!aF)A.y=B.y;else{const m=(A.y+B.y)/2;A.y=m;B.y=m;}}
      if(c.type==='v'){const l=entById(sk,c.line);if(!l||l.t!=='line')return;const A=P[l.p1],B=P[l.p2];if(!A||!B)return;
        const aF=fix.has(l.p1),bF=fix.has(l.p2);
        if(aF&&bF)return; // idem : aucune moyenne sur un point fixé (O ou contrainte fix)
        if(aF&&!bF)B.x=A.x;else if(bF&&!aF)A.x=B.x;else{const m=(A.x+B.x)/2;A.x=m;B.x=m;}}
      if(c.type==='parallel' || c.type==='perpendicular'){
        const A=entById(sk,c.a),B=entById(sk,c.b);if(!A||!B||A.t!=='line'||B.t!=='line')return;
        const T=c.type==='parallel'?0:Math.PI/2;
        const sAng=(x1,y1,x2,y2)=>Math.atan2(y2-y1,x2-x1);
        const ugap=(a,b)=>{const x=((b-a)%Math.PI+Math.PI)%Math.PI;return Math.min(x,Math.PI-x);}; // lignes non orientées
        const P=sk.points,A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2];if(!A1||!A2||!B1||!B2)return;
        const sA=sAng(A1.x,A1.y,A2.x,A2.y), sB=sAng(B1.x,B1.y,B2.x,B2.y);
        const e=T-ugap(sA,sB); if(Math.abs(e)<1e-9) return;
        const h=0.02, sgn=(Math.abs(ugap(sA+h,sB-h)-T)<Math.abs(ugap(sA-h,sB+h)-T))?1:-1;
        const shared=[A.p1,A.p2].find(p=>p===B.p1||p===B.p2);
        const aFL=fix.has(A.p1)&&fix.has(A.p2),bFL=fix.has(B.p1)&&fix.has(B.p2);
        if(aFL&&bFL) return;
        if(shared){
          const V=P[shared], Ao=A.p1===shared?A2:A1, Bo=B.p1===shared?B2:B1;
          const aFree=!fix.has(A.p1===shared?A.p2:A.p1), bFree=!fix.has(B.p1===shared?B.p2:B.p1);
          const m=Math.abs(e);
          if(aFree&&bFree){rotP(Ao,V.x,V.y,sgn*m*0.25);rotP(Bo,V.x,V.y,-sgn*m*0.25);}
          else if(aFree&&!bFree)rotP(Ao,V.x,V.y,sgn*m*0.5);
          else if(bFree&&!aFree)rotP(Bo,V.x,V.y,-sgn*m*0.5);
        } else {
          const mAx=(A1.x+A2.x)/2,mAy=(A1.y+A2.y)/2,mBx=(B1.x+B2.x)/2,mBy=(B1.y+B2.y)/2;
          const m=Math.abs(e);
          if(!aFL){rotP(A1,mAx,mAy,sgn*m*0.25);rotP(A2,mAx,mAy,sgn*m*0.25);}
          if(!bFL){rotP(B1,mBx,mBy,-sgn*m*0.25);rotP(B2,mBx,mBy,-sgn*m*0.25);}
        }
      }
      if(c.type==='equal'){
        const A=entById(sk,c.a),B=entById(sk,c.b);if(!A||!B)return;
        if(A.t==='line'&&B.t==='line'){const t=(lineLen(sk,A)+lineLen(sk,B))/2;scaleLine(sk,A,t,fix);scaleLine(sk,B,t,fix);}
        else if((A.t==='circle'||A.t==='arc')&&(B.t==='circle'||B.t==='arc')){
          const la=rLocked(sk,A),lb=rLocked(sk,B);
          if(la&&!lb)B.r=Math.max(A.r,.1);            // A piloté (cote/fix) → B suit, la cote n'est jamais écrasée
          else if(lb&&!la)A.r=Math.max(B.r,.1);       // B piloté → A suit
          else{const t=Math.max((A.r+B.r)/2,.1);A.r=t;B.r=t;}
        }
      }
      if(c.type==='tangent'){ // ligne ↔ cercle/arc : distance centre→ligne = R
        const L=entById(sk,c.line),E=entById(sk,c.ent);
        if(!L||!E||L.t!=='line'||(E.t!=='circle'&&E.t!=='arc'))return;
        const A=P[L.p1],B=P[L.p2],CC=P[E.pc];if(!A||!B||!CC)return;
        const dx=B.x-A.x,dy=B.y-A.y,len=Math.hypot(dx,dy)||1e-9;
        const nx=-dy/len,ny=dx/len;
        const ux=dx/len,uy=dy/len;
        const dist=(CC.x-A.x)*nx+(CC.y-A.y)*ny;
        const side=SK_TAN_SIDE.get(c);
        const sgn=side||(dist>=0?1:-1),Er=sgn*dist-E.r,s=sgn*Er*0.5; // côté imposé s'il est connu
        const aF=fix.has(L.p1),bF=fix.has(L.p2),cF=fix.has(E.pc);
        const overLine=(sk.dims||[]).some(d=>d.type==='length'&&d.line===L.id);
        const shareP=pid=>(sk.entities||[]).some(e=>e&&e!==L&&skEntPids(e).indexOf(pid)>=0);
        if(Math.abs(Er)>=1e-9){
          // loi : |dist centre→ligne| = R. On distribue la correction entre les DOF libres
          // (bouts de ligne + centre), sous-relaxée, pour rester stable avec les autres contraintes.
          if(aF&&bF&&cF){if(!rLocked(sk,E)){E.r=Math.max(Math.abs(dist),0.1);}return;}
          const gLine=(!aF&&!bF)?0.5:0.85, gCtr=((!aF||!bF)&&!cF)?0.5:1.0;
          if(!aF&&!bF){A.x+=nx*s*gLine;A.y+=ny*s*gLine;B.x+=nx*s*gLine;B.y+=ny*s*gLine;}
          else if(!aF){A.x+=nx*s*2*gLine;A.y+=ny*s*2*gLine;}
          else if(!bF){B.x+=nx*s*2*gLine;B.y+=ny*s*2*gLine;}
          if(!cF){CC.x-=nx*s*2*gCtr;CC.y-=ny*s*2*gCtr;}
        }
        // La tangente doit toucher le SEGMENT visible : si le pied (projection du centre)
        // déborde d'une extrémité LIBRE, on étend le segment le long de la ligne jusqu'au
        // point de contact → plus de « jeu » entre la ligne et le cercle/arc à l'écran.
        if(!overLine){
          const t=((CC.x-A.x)*ux+(CC.y-A.y)*uy)/len;
          if(t<0&&!aF&&!shareP(L.p1)){const d=-t*len+Math.max(0.5,len*1e-3);A.x-=ux*d;A.y-=uy*d;}
          else if(t>1&&!bF&&!shareP(L.p2)){const d=(t-1)*len+Math.max(0.5,len*1e-3);B.x+=ux*d;B.y+=uy*d;}
        }
      }
      if(c.type==='symmetric'){ // 2 lignes miroir par axe : A ↔ B réfléchi
        const A=entById(sk,c.a),B=entById(sk,c.b),M=entById(sk,c.mid);
        if(!A||!B||!M||A.t!=='line'||B.t!=='line'||M.t!=='line')return;
        const A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2],M1=P[M.p1],M2=P[M.p2];
        if(!A1||!A2||!B1||!B2||!M1||!M2)return;
        const mx=M2.x-M1.x,my=M2.y-M1.y,ml=Math.hypot(mx,my)||1e-9,ux=mx/ml,uy=my/ml;
        if(c.inf){ // symétrie des DROITES : le reflet de A est porté par la droite B
          const rf=(Q)=>{const wx=Q.x-M1.x,wy=Q.y-M1.y,pr=wx*ux+wy*uy;return{x:2*(M1.x+ux*pr)-Q.x,y:2*(M1.y+uy*pr)-Q.y};};
          const bx=B2.x-B1.x,by=B2.y-B1.y,bl=Math.hypot(bx,by)||1e-9,nx=-by/bl,ny=bx/bl;
          const vr=(vx,vy)=>{const d=vx*ux+vy*uy;return{x:2*d*ux-vx,y:2*d*uy-vy};}; // reflet d'un vecteur
          [[A1,A.p1],[A2,A.p2]].forEach(([Q,pid])=>{
            const r=rf(Q),err=(r.x-B1.x)*nx+(r.y-B1.y)*ny;if(Math.abs(err)<1e-12)return;
            const bF=fix.has(B.p1)||fix.has(B.p2),aF=fix.has(pid);
            const kA=aF?0:(bF?1:0.5),kB=bF?0:(aF?1:0.5);
            if(kB){B1.x+=nx*err*kB*0.5;B1.y+=ny*err*kB*0.5;B2.x+=nx*err*kB*0.5;B2.y+=ny*err*kB*0.5;}
            if(kA){const v=vr(-nx*err*kA,-ny*err*kA);Q.x+=v.x;Q.y+=v.y;}
          });
          return;
        }
        const refl=(Px,Py)=>{
          const wx=Px-M1.x,wy=Py-M1.y;
          const proj=wx*ux+wy*uy;
          const px=M1.x+ux*proj,py=M1.y+uy*proj;
          return{x:2*px-Px, y:2*py-Py};
        };
        const RA1=refl(A1.x,A1.y),RA2=refl(A2.x,A2.y), RB1=refl(B1.x,B1.y),RB2=refl(B2.x,B2.y);
        // appariement le moins coûteux (orientation indifférente)
        const d1=Math.hypot(RA1.x-B1.x,RA1.y-B1.y)+Math.hypot(RA2.x-B2.x,RA2.y-B2.y);
        const d2=Math.hypot(RA1.x-B2.x,RA1.y-B2.y)+Math.hypot(RA2.x-B1.x,RA2.y-B1.y);
        const swap=d2<d1;
        const pairs=swap?[[A1,B2,RA1,RB2],[A2,B1,RA2,RB1]]:[[A1,B1,RA1,RB1],[A2,B2,RA2,RB2]];
        const aFL=fix.has(A.p1)&&fix.has(A.p2), bFL=fix.has(B.p1)&&fix.has(B.p2);
        if(aFL&&bFL)return;
        for(const[PA,PB,RA,RB] of pairs){
          const aFree=!fix.has(PA===A1?A.p1:PA===A2?A.p2:null);
          const bFree=!fix.has(PB===B1?B.p1:PB===B2?B.p2:null);
          // on corrige chaque extrémité vers le réfléchi de l'autre
          if(aFree&&bFree){
            const ex=(RB.x-PA.x)*0.25, ey=(RB.y-PA.y)*0.25, fx=(RA.x-PB.x)*0.25, fy=(RA.y-PB.y)*0.25;
            PA.x+=ex;PA.y+=ey;PB.x+=fx;PB.y+=fy;
          }else if(aFree&&!bFree){
            PA.x=RB.x;PA.y=RB.y;
          }else if(bFree&&!aFree){
            PB.x=RA.x;PB.y=RA.y;
          }
        }
      }
      if(c.type==='tangent2'){ // cercle ↔ cercle (tangence extérieure) : |C1C2| = R1+R2
        const A=entById(sk,c.a),B=entById(sk,c.b);if(!A||!B)return;
        if((A.t!=='circle'&&A.t!=='arc')||(B.t!=='circle'&&B.t!=='arc'))return;
        const CA=P[A.pc],CB=P[B.pc];if(!CA||!CB)return;
        const dx=CB.x-CA.x,dy=CB.y-CA.y,d=Math.hypot(dx,dy)||1e-9;
        const err=d-(A.r+B.r);if(Math.abs(err)<1e-9)return;
        const ux=dx/d,uy=dy/d;
        const aF=fix.has(A.pc),bF=fix.has(B.pc);
        if(!aF&&!bF){CA.x+=ux*err*0.25;CA.y+=uy*err*0.25;CB.x-=ux*err*0.25;CB.y-=uy*err*0.25;}
        else if(!aF){CA.x+=ux*err*0.5;CA.y+=uy*err*0.5;}
        else if(!bF){CB.x-=ux*err*0.5;CB.y-=uy*err*0.5;}
      }
      if(c.type==='collinear'){ // 2 lignes sur la MÊME droite : chaque extrémité libre rejoint la droite de l'autre
        const la=entById(sk,c.a),lb=entById(sk,c.b);
        if(!la||!lb||la.t!=='line'||lb.t!=='line')return;
        const A1=P[la.p1],A2=P[la.p2],B1=P[lb.p1],B2=P[lb.p2];if(!A1||!A2||!B1||!B2)return;
        const aFL=fix.has(la.p1)&&fix.has(la.p2),bFL=fix.has(lb.p1)&&fix.has(lb.p2);
        if(aFL&&bFL)return;
        const toward=(Q,qid,U1,U2,k)=>{ // pied de Q sur la droite (U1,U2), fraction k
          if(fix.has(qid))return;
          const dx=U2.x-U1.x,dy=U2.y-U1.y,L2=dx*dx+dy*dy;if(L2<1e-12)return;
          const t=((Q.x-U1.x)*dx+(Q.y-U1.y)*dy)/L2;
          Q.x+=(U1.x+t*dx-Q.x)*k;Q.y+=(U1.y+t*dy-Q.y)*k;
        };
        const kb=aFL?1:(bFL?0:0.5),ka=bFL?1:(aFL?0:0.5);
        if(kb>0){toward(B1,lb.p1,A1,A2,kb*0.5);toward(B2,lb.p2,A1,A2,kb*0.5);}
        if(ka>0){toward(A1,la.p1,B1,B2,ka*0.5);toward(A2,la.p2,B1,B2,ka*0.5);}
      }
      if(c.type==='coaxial'){ // mêmes centres (concentriques) : rapprochement vers le milieu
        const A=entById(sk,c.a),B=entById(sk,c.b);if(!A||!B)return;
        if((A.t!=='circle'&&A.t!=='arc')||(B.t!=='circle'&&B.t!=='arc'))return;
        const CA=P[A.pc],CB=P[B.pc];if(!CA||!CB)return;
        const aF=fix.has(A.pc),bF=fix.has(B.pc);
        if(aF&&bF)return;
        const mx=(CA.x+CB.x)/2,my=(CA.y+CB.y)/2;
        if(!aF){CA.x+=(mx-CA.x)*0.5;CA.y+=(my-CA.y)*0.5;}
        if(!bF){CB.x+=(mx-CB.x)*0.5;CB.y+=(my-CB.y)*0.5;}
      }
    });
    // arcs : pa pilote le rayon (sauf cote/pilotage) ; les bouts non fixés sont ramenés
    // sur le cercle (même partagés : la ligne attachée suit et la jonction se referme)
    const Ps=sk.points;
    (sk.entities||[]).forEach(e=>{
      if(e.t!=='arc')return;
      const C=Ps[e.pc],A=Ps[e.pa],B=Ps[e.pb];if(!C||!A||!B)return;
      const lock=rLocked(sk,e);
      if(!lock){const ra=Math.hypot(A.x-C.x,A.y-C.y);if(ra>1e-9)e.r=ra;}
      const rr=Math.max(e.r,1e-9);
      const proj=Pp=>{const aa=Math.atan2(Pp.y-C.y,Pp.x-C.x);Pp.x+=(C.x+rr*Math.cos(aa)-Pp.x)*0.5;Pp.y+=(C.y+rr*Math.sin(aa)-Pp.y)*0.5;};
      if(!fix.has(e.pa))proj(A);
      if(!fix.has(e.pb))proj(B);
    });
  }
}
/* ============================================================================================
   SOLVEUR MOINDRES CARRÉS (Levenberg–Marquardt)
   Variables : chaque point non fixé non ancré = 2 DOF (x,y) ; chaque rayon non verrouillé = 1 DOF.
   Résidus : toutes les cotes et contraintes linéarisées douces (distance au carré pour les
   valeurs absolues → différentiable partout). Jacobien numérique par différences finies.
   Le LM part de l'état courant (esquisse déjà presque contrainte) et sépare la convergence.
   La relaxation (solveSketchRelax) reste en repli si le LSQ diverge ou stagne.
============================================================================================ */
function skSnapCoords(sk){
  const P={};Object.keys(sk.points||{}).forEach(pid=>{const p=sk.points[pid];P[pid]={x:p.x,y:p.y};});
  const R={};(sk.entities||[]).forEach(e=>{if(e.t==='circle'||e.t==='arc')R[e.id]=e.r;});
  return{P,R};
}
function skRestoreCoords(sk,snap){
  Object.keys(snap.P).forEach(pid=>{const p=sk.points[pid];if(p){p.x=snap.P[pid].x;p.y=snap.P[pid].y;}});
  (sk.entities||[]).forEach(e=>{if((e.t==='circle'||e.t==='arc')&&snap.R[e.id]!=null)e.r=snap.R[e.id];});
}
function sklsBuild(sk,fix){
  const pts=[],rad=[],r0={};
  Object.keys(sk.points).forEach(pid=>{if(fix.has(pid))return;pts.push(pid);});
  (sk.entities||[]).forEach(e=>{if((e.t==='circle'||e.t==='arc')&&!rLocked(sk,e)){rad.push(e.id);r0[e.id]=e.r;}});
  // V0.7.1 : points tenus sur une courbe (sur ligne / sur cercle) — moins chers à déplacer :
  // ils GLISSENT sur la courbe au lieu d'entraîner les extrémités de celle-ci
  const slide=new Set();(sk.constraints||[]).forEach(c=>{if(c&&(c.type==='online'||c.type==='oncircle'||c.type==='onspline')&&c.p)slide.add(c.p);});
  return{pts,rad,r0,slide,n:2*pts.length+rad.length};
}
function sklsApply(sk,B,x){
  B.pts.forEach((pid,i)=>{const p=sk.points[pid];if(p){p.x=x[2*i];p.y=x[2*i+1];}});
  B.rad.forEach((eid,j)=>{const e=entById(sk,eid);if(e)e.r=Math.max(x[2*B.pts.length+j],0.01);});
}
const SK_GEO_W=300; // poids des contraintes géométriques face aux cotes (LM)
const SK_SLIDE_W=0.01; // coût relatif du déplacement d'un point tenu sur une courbe (LM)
// structure du Jacobien creux, par esquisse (WeakMap : jamais enregistrée dans le fichier)
const SK_JPAT=new WeakMap();
function sklsSig(sk,B,m){ // signature de la structure : inconnues, lignes, contraintes et cotes
  return m+'|'+B.pts.join(',')+'|'+B.rad.join(',')+'|'+(sk.constraints||[]).map(c=>c&&c.id).join(',')+'|'+(sk.dims||[]).map(d=>d.id+(d.ref?'r':'')).join(',');
}
let skForRank=false; // analyse de rang seulement : équations implicites ajoutées (pied des congés)
let skRankDegen=null; // analyse de rang : lignes réduites à un point (relevées une fois, avant les différences finies)
function sklsCollect(sk,out,B){
  // résidu vectoriel complet : cotes + contraintes + structure des arcs + ancrage des rayons libres.
  const P=sk.points;
  out.length=0;
  const push=f=>{if(f!=null&&isFinite(f))out.push(f);};
  const fix=skFixed(sk);
  const nrm=(l)=>{const A=P[l.p1],B=P[l.p2];if(!A||!B)return 0;return Math.hypot(B.x-A.x,B.y-A.y);};
  // V0.11.13 : en analyse de rang, une ligne réduite à un point n'a pas de direction — ses ∥ / ⟂ /
  // colinéaire / entraxe sont écartés (dérivées ~1e6 qui faussaient tout le rang : 3 cotes passées
  // en référence avec 7 DDL libres, « test esquisse »).
  const vec=(l)=>{const A=P[l.p1],B=P[l.p2];if(!A||!B)return null;const L0=Math.hypot(B.x-A.x,B.y-A.y);if(skForRank&&skRankDegen&&skRankDegen.has(l.id))return null;const L=L0||1e-9;return{ux:(B.x-A.x)/L,uy:(B.y-A.y)/L,L};};
  // ── cotes ── (les cotes de référence ne pilotent rien)
  (sk.dims||[]).forEach(d=>{
    if(d.ref)return;
    if(d.type==='length'){const l=entById(sk,d.line);if(l&&l.t==='line'){
      if(d.orient==='h'||d.orient==='v'){const A=P[l.p1],B=P[l.p2];if(A&&B)push(dimMeasureOf(A,B,d.orient)-Math.max(d.value,0));}
      else push(nrm(l)-Math.max(d.value,0.1));}}
    if(d.type==='distance'){const A=P[d.a],B=P[d.b];if(A&&B)push(dimMeasureOf(A,B,d.orient)-Math.max(d.value,0));}
    if(d.type==='diameter'||d.type==='radius'){const e=entById(sk,d.ent);if(e&&(e.t==='circle'||e.t==='arc'))push(e.r-(d.type==='diameter'?d.value/2:d.value));}
    if(d.type==='angle'){
      const fr=angleFrame(sk,d);if(fr){
        const TAU=Math.PI*2,want=angleWant(d,fr.delta);
        let e=want-fr.delta;if(e>Math.PI)e-=TAU;else if(e<-Math.PI)e+=TAU;
        // V0.7.1 : résidu en mm (arc au plus long rayon, skAngScale) — en radians il ne pesait rien face aux mm
        push(e*skAngScale(fr));
      }
    }
    if(d.type==='gap'){
      const A=entById(sk,d.a),B=entById(sk,d.b);
      if(A&&B&&A.t==='line'&&B.t==='line'){
        const va=vec(A),vb=vec(B);if(va&&vb){const nx=-va.uy,ny=va.ux;
          const sA=P[A.p1],fB=P[B.p1];
          if(sA&&fB){const signed=(fB.x-sA.x)*nx+(fB.y-sA.y)*ny;
            const w=Math.max(d.value,0);
            push((d.sgn===1||d.sgn===-1)?(signed-d.sgn*w):(w>0?(signed*signed-w*w)/(2*w):signed));}}
      }
    }
    if(d.type==='distline'){
      const l=entById(sk,d.line),Pt=P[d.p];
      if(l&&l.t==='line'&&Pt){const v=vec(l);if(v){const nx=-v.uy,ny=v.ux,A=P[l.p1];
        if(A){const signed=(Pt.x-A.x)*nx+(Pt.y-A.y)*ny;const w=Math.max(d.value,0);
          push((d.sgn===1||d.sgn===-1)?(signed-d.sgn*w):(w>0?(signed*signed-w*w)/(2*w):signed));}}}
    }
  });
  // ── contraintes ── 2026-10-16-001 : PONDÉRÉES ×SK_GEO_W — en cas de conflit (cotes
  // incompatibles), ce sont les COTES qui cèdent, jamais H / V / tangence / parallèle…
  // (avant : 2,5 mm d'erreur répartis, les côtés « verticaux » penchaient).
  const g0=out.length;
  (sk.constraints||[]).forEach(c=>{
    if(!c)return;
    if(c.type==='h'){const l=entById(sk,c.line);if(l&&l.t==='line'&&P[l.p1]&&P[l.p2])push(P[l.p1].y-P[l.p2].y);}
    if(c.type==='v'){const l=entById(sk,c.line);if(l&&l.t==='line'&&P[l.p1]&&P[l.p2])push(P[l.p1].x-P[l.p2].x);}
    if(c.type==='coincident'){const A=P[c.a],B=P[c.b];if(A&&B){push(A.x-B.x);push(A.y-B.y);}}
    if(c.type==='oncircle'){ // point sur cercle/arc : |P−C| = R (épingle du point de tangence/ coupe)
      const Pt=P[c.p],E=entById(sk,c.ent);
      if(Pt&&E&&(E.t==='circle'||E.t==='arc')){const CC=P[E.pc];
        if(CC)push(Math.hypot(Pt.x-CC.x,Pt.y-CC.y)-E.r);}
    }
    if(c.type==='online'){ // point sur ligne : distance signée perpendiculaire (mm)
      const Pt=P[c.p],l=entById(sk,c.line);
      if(Pt&&l&&l.t==='line'){const A=P[l.p1],B=P[l.p2];
        if(A&&B){const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy);
          if(L>1e-9)push((Pt.x-A.x)*(-dy/L)+(Pt.y-A.y)*(dx/L));}}
    }
    if(c.type==='midpoint'){ // milieu : 2 résidus (dx, dy)
      if(c.p!=null){
        const Pt=P[c.p],l=entById(sk,c.line);
        if(Pt&&l&&l.t==='line'){const A=P[l.p1],B=P[l.p2];
          if(A&&B){push(Pt.x-(A.x+B.x)/2);push(Pt.y-(A.y+B.y)/2);}}
      }else if(c.a&&c.b){
        const A=entById(sk,c.a),B=entById(sk,c.b);
        if(A&&B&&A.t==='line'&&B.t==='line'){
          const A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2];
          if(A1&&A2&&B1&&B2){push((A1.x+A2.x)/2-(B1.x+B2.x)/2);push((A1.y+A2.y)/2-(B1.y+B2.y)/2);}}
      }
    }
    if(c.type==='parallel'||c.type==='perpendicular'){
      const A=entById(sk,c.a),B=entById(sk,c.b);
      if(A&&B&&A.t==='line'&&B.t==='line'){const va=vec(A),vb=vec(B);
        if(va&&vb){if(c.type==='parallel')push((va.ux*vb.uy-va.uy*vb.ux));else push((va.ux*vb.ux+va.uy*vb.uy));}}
    }
    if(c.type==='collinear'){ // 2 résidus : extrémités de B sur la droite portée par A (mm)
      const A=entById(sk,c.a),B=entById(sk,c.b);
      if(A&&B&&A.t==='line'&&B.t==='line'){const va=vec(A),A1=P[A.p1],B1=P[B.p1],B2=P[B.p2];
        if(va&&A1&&B1&&B2){const nx=-va.uy,ny=va.ux;
          push((B1.x-A1.x)*nx+(B1.y-A1.y)*ny);push((B2.x-A1.x)*nx+(B2.y-A1.y)*ny);}}
    }
    if(c.type==='equal'){
      const A=entById(sk,c.a),B=entById(sk,c.b);
      if(A&&B){if(A.t==='line'&&B.t==='line')push(nrm(A)-nrm(B));
        else if((A.t==='circle'||A.t==='arc')&&(B.t==='circle'||B.t==='arc'))push(A.r-B.r);}
    }
    if(c.type==='offset'){ // V0.11.25 : décalage égal — l'écart (c→d) vaut l'écart (a→b), celui de la cote unique du décalage (rayons des copies : sans ancre, cf. plus bas)
      const v1=skOffsetVal(sk,c.a,c.b,c.sa),v2=skOffsetVal(sk,c.c,c.d,c.sb);
      if(v1!=null&&v2!=null)push(v2-v1);
    }
    if(c.type==='tangent'){
      const L=entById(sk,c.line),E=entById(sk,c.ent);
      if(L&&E&&L.t==='line'&&(E.t==='circle'||E.t==='arc')){
        const A=P[L.p1],B=P[L.p2],CC=P[E.pc];if(A&&B&&CC&&!(skForRank&&skRankDegen&&skRankDegen.has(L.id))){
          const dx=B.x-A.x,dy=B.y-A.y,len=Math.hypot(dx,dy)||1e-9;
          const ux=dx/len,uy=dy/len;
          const d=(CC.x-A.x)*(-uy)+(CC.y-A.y)*(ux);
          // tangence lisse à la DROITE (condition de contact), linéarisée en mm ;
          // côté connu (état résolu précédent) → résidu SIGNÉ : le centre ne traverse pas
          const side=SK_TAN_SIDE.get(c);
          if(side)push(d-side*E.r);
          else push((d*d-E.r*E.r)/Math.max(1e-6,Math.abs(d)+Math.abs(E.r)));
          // bout d'arc posé sur la ligne (congé) : c'est le PIED du centre. Au contact,
          // « point sur l'arc » + « tangence » sont dégénérés au 1er ordre (le point glisse
          // le long de la ligne sans résidu) → rang faux (+2 DDL fantômes par congé).
          if(skForRank&&E.t==='arc')[E.pa,E.pb].forEach(pe=>{if(pe&&(pe===L.p1||pe===L.p2)){const Q=P[pe];if(Q)push((CC.x-Q.x)*ux+(CC.y-Q.y)*uy);}});
        }
      }
    }
    if(c.type==='tangent2'){
      const A=entById(sk,c.a),B=entById(sk,c.b);
      if(A&&B&&(A.t==='circle'||A.t==='arc')&&(B.t==='circle'||B.t==='arc')){
        const CA=P[A.pc],CB=P[B.pc];if(CA&&CB)push(Math.hypot(CB.x-CA.x,CB.y-CA.y)-(A.r+B.r));
      }
    }
    if(c.type==='coaxial'){ // mêmes centres : 2 résidus (dx, dy)
      const A=entById(sk,c.a),B=entById(sk,c.b);
      if(A&&B&&(A.t==='circle'||A.t==='arc')&&(B.t==='circle'||B.t==='arc')){
        const CA=P[A.pc],CB=P[B.pc];if(CA&&CB){push(CA.x-CB.x);push(CA.y-CB.y);}
      }
    }
    if(c.type==='symmetric'){
      const A=entById(sk,c.a),B=entById(sk,c.b),M=entById(sk,c.mid);
      if(A&&B&&M&&A.t==='line'&&B.t==='line'&&M.t==='line'){
        const A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2],M1=P[M.p1],M2=P[M.p2];
        if(A1&&A2&&B1&&B2&&M1&&M2){
          const mx=M2.x-M1.x,my=M2.y-M1.y,ml=Math.hypot(mx,my)||1e-9,ux=mx/ml,uy=my/ml;
          const refl=(Px,Py)=>{const wx=Px-M1.x,wy=Py-M1.y,pr=wx*ux+wy*uy;return{x:2*(M1.x+ux*pr)-Px,y:2*(M1.y+uy*pr)-Py};};
          const rA1=refl(A1.x,A1.y),rA2=refl(A2.x,A2.y);
          if(c.inf){const bx=B2.x-B1.x,by=B2.y-B1.y,bl=Math.hypot(bx,by)||1e-9,nx=-by/bl,ny=bx/bl;
            push((rA1.x-B1.x)*nx+(rA1.y-B1.y)*ny);push((rA2.x-B1.x)*nx+(rA2.y-B1.y)*ny);}
          else{
          const d1=Math.hypot(rA1.x-B1.x,rA1.y-B1.y)+Math.hypot(rA2.x-B2.x,rA2.y-B2.y);
          const d2=Math.hypot(rA1.x-B2.x,rA1.y-B2.y)+Math.hypot(rA2.x-B1.x,rA2.y-B1.y);
          if(d2<d1){push(rA1.x-B2.x);push(rA1.y-B2.y);push(rA2.x-B1.x);push(rA2.y-B1.y);}
          else{push(rA1.x-B1.x);push(rA1.y-B1.y);push(rA2.x-B2.x);push(rA2.y-B2.y);}
          }
        }
      }
    }
    if(c.type==='stangent'){const r=skStanResid(sk,c);if(r!=null)push(r);} // poignée de spline alignée sur la tangente (mm)
    if(c.type==='scurv'){const r=skCurvResid(sk,c);if(r!=null)push(r);}   // courbures égales au raccord (G2, ramené en mm)
    if(c.type==='onspline'){const r=skOnSplResid(sk,c);if(r!=null)push(r);} // point sur spline : distance signée au pied (mm)
    if(c.type==='fix'){ /* exclus des variables → pas de résidu */ }
  });
  // ── structure des arcs : les extrémités restent sur le cercle (sauf point fixé) ──
  (sk.entities||[]).forEach(e=>{
    if(e.t!=='arc')return;
    const C=P[e.pc];
    if(!C)return;
    const onC=Pp=>Pp?(Math.hypot(Pp.x-C.x,Pp.y-C.y)-e.r):null;
    if(P[e.pa]&&!fix.has(e.pa))push(onC(P[e.pa]));
    if(P[e.pb]&&!fix.has(e.pb))push(onC(P[e.pb]));
  });
  for(let gi=g0;gi<out.length;gi++)out[gi]*=SK_GEO_W;
  // ── ancrage doux : les rayons libres ne dérivent que si une vraie contrainte les tire (equal, tangent2) ──
  if(B&&B.rad){
    // 2026-10-16-002 : pas d'ancrage pour un rayon « égal » à un rayon COTÉ (congés multi-coins :
    // une seule cote R) — l'ancre retenait les suivants (écart ~1e-5 sur « égal »).
    const dimR=new Set((sk.dims||[]).filter(d=>!d.ref&&(d.type==='radius'||d.type==='diameter')).map(d=>d.ent));
    const driven=new Set();let grow=true;
    while(grow){grow=false;(sk.constraints||[]).forEach(c=>{if(c.type!=='equal')return;
      const a=dimR.has(c.a)||driven.has(c.a),b=dimR.has(c.b)||driven.has(c.b);
      if(a&&!b&&!driven.has(c.b)){driven.add(c.b);grow=true;}if(b&&!a&&!driven.has(c.a)){driven.add(c.a);grow=true;}});}
    // V0.11.25 : rayon d'une copie de décalage « égal » (offset) : piloté par l'écart de la paire
    // cotée (Δr = entraxe) — l'ancre le retenait à sa valeur, la cote unique ne convergeait qu'à
    // 1e-5 près par règlement (compromis ancre / relation, résidu 1,2 mm après 20 itérations).
    (sk.constraints||[]).forEach(c=>{if(c&&c.type==='offset'&&c.d)driven.add(c.d);});
    (B.rad||[]).forEach(eid=>{if(driven.has(eid))return;const e=entById(sk,eid);if(e&&B.r0&&B.r0[eid]!=null)push((e.r-B.r0[eid])*1.0);});
  }
  return out;
}
function sklsSolveLM(sk,B,x,iters,deadline){
  const prev=skLmCtx,fix=skFixed(sk),ents=new Map();
  (sk.entities||[]).forEach(e=>{if(e&&!ents.has(e.id))ents.set(e.id,e);}); // 1re occurrence, comme find
  skLmCtx={sk,ents,fix};
  try{return sklsSolveLMCore(sk,B,x,iters,deadline);}finally{skLmCtx=prev;}
}
function sklsSolveLMCore(sk,B,x,iters,deadline){
  // Levenberg–Marquardt numérique sur le résidu vectoriel F (construit par sklsCollect).
  // Minimise ‖F‖². Jacobien J colonne par colonne (différences finies centrées),
  // système normal (JᵀJ+λ·diag)·δ = −JᵀF résolu par Cholesky.
  // x reste toujours dans un état appliqué au sketch ; le meilleur état rencontre est conservé.
  // Ne retourne false que si la résolution dégrade l'objectif.
  const n=x.length;
  if(n<=0)return false;
  const f=[],fph=[],fmi=[];
  const apply=()=>sklsApply(sk,B,x);
  const collect=(out)=>{sklsCollect(sk,out,B);let s=0;for(let i=0;i<out.length;i++)s+=out[i]*out[i];return s;};
  // mémorise le meilleur état (copie de x) et son objectif
  const what=new Float64Array(n);
  let bestCur=Infinity,hasBest=false;
  const saveBest=()=>{const c=collect(f);if(c<bestCur){bestCur=c;hasBest=true;for(let i=0;i<n;i++)what[i]=x[i];}return c;};
  const restoreBest=()=>{if(!hasBest)return;for(let i=0;i<n;i++)x[i]=what[i];apply();};
  // objectif initial
  apply();let cur=saveBest();
  if(!isFinite(cur)||cur>1e15){restoreBest();return false;} // état initial aberrant
  // V0.7.1 : amortissement au MOINDRE DÉPLACEMENT (λ·W, W = 1 par inconnue) et non par la
  // diagonale de JᵀJ (Marquardt) : parmi les pas qui réduisent autant le résidu, le plus court
  // en mm. Avec la diagonale, une inconnue que les résidus « voient peu » était bon marché :
  // un point tenu sur une ligne faisait pivoter l'autre bout de la ligne au lieu de glisser.
  // Un point sur courbe coûte SK_SLIDE_W fois moins : c'est lui qui glisse.
  const W=new Float64Array(n).fill(1);
  if(B.slide&&B.slide.size)B.pts.forEach((pid,i)=>{if(B.slide.has(pid)){W[2*i]=SK_SLIDE_W;W[2*i+1]=SK_SLIDE_W;}});
  let lam=1e-3;
  // V0.7.1 : JACOBIEN CREUX par colonnes groupées (Curtis–Powell–Reid). Une contrainte ne lit que
  // 2 à 6 inconnues : les colonnes qui n'ont AUCUNE ligne en commun sont décalées ensemble, et
  // chaque ligne n'y voit bouger que sa propre inconnue — même dérivée qu'une par une, pour
  // 2·(nombre de groupes) évaluations du résidu au lieu de 2n. La structure (lignes non nulles de
  // chaque colonne) est relevée sur un Jacobien complet, gardée par esquisse tant que sa
  // signature ne change pas. Avant de s'arrêter SANS avoir convergé après des itérations creuses,
  // un Jacobien complet est recalculé et réuni à la structure (une dérivée nulle par hasard au
  // relevé y entre) : l'arrêt est décidé sur un Jacobien complet, comme avant.
  let pat=null,groups=null,sig=null,needFull=false,sparseUsed=false;
  const regroup=()=>{
    const order=[...Array(n).keys()].sort((a,b)=>pat[b].length-pat[a].length);
    const used=[];groups=[];
    order.forEach(j=>{let g=0;
      for(;g<groups.length;g++){const u=used[g];if(pat[j].every(r=>!u[r]))break;}
      if(g===groups.length){groups.push([]);used.push(new Uint8Array(f.length));}
      groups[g].push(j);pat[j].forEach(r=>{used[g][r]=1;});});
    SK_JPAT.set(sk,{sig,pat});
  };
  for(let it=0;it<iters;it++){
    if(deadline&&it>0&&Date.now()>deadline)break; // budget de temps (prolongation)
    collect(f);
    const m=f.length;
    if(!m)return true;
    if(cur<1e-24)break; // déjà résolue (‖F‖ < 1e-12) : aucun Jacobien à calculer
    if(sig===null){sig=sklsSig(sk,B,m);const c=SK_JPAT.get(sk);if(c&&c.sig===sig){pat=c.pat.map(a=>a.slice());regroup();}}
    const J=new Float64Array(m*n);
    let nR=m;
    const full=!pat||needFull;needFull=false;
    if(full){
      sparseUsed=false;
      for(let j=0;j<n;j++){
        const xj=x[j],h=Math.max(1e-7,Math.abs(xj)*1e-6);
        x[j]=xj+h;apply();sklsCollect(sk,fph,B);const fp=fph.slice();
        x[j]=xj-h;apply();sklsCollect(sk,fmi,B);const fm=fmi.slice();
        x[j]=xj;apply();
        nR=fp.length;if(fm.length!==nR)nR=-1;
        for(let r=0;r<nR&&r<m;r++)J[r*n+j]=(fp[r]-fm[r])/(2*h);
      }
      if(nR===m){
        const np=[];for(let j=0;j<n;j++){const s=new Set(pat?pat[j]:[]);for(let r=0;r<m;r++)if(J[r*n+j]!==0)s.add(r);np.push([...s].sort((a,b)=>a-b));}
        pat=np;regroup();
      }
    }else{
      sparseUsed=true;
      const x0=x.slice(),hs=new Float64Array(n);for(let j=0;j<n;j++)hs[j]=Math.max(1e-7,Math.abs(x0[j])*1e-6);
      for(const G of groups){
        for(const j of G)x[j]=x0[j]+hs[j];apply();sklsCollect(sk,fph,B);
        for(const j of G)x[j]=x0[j]-hs[j];apply();sklsCollect(sk,fmi,B);
        for(const j of G)x[j]=x0[j];
        if(fph.length!==m||fmi.length!==m){nR=-1;break;}
        for(const j of G){const h2=2*hs[j];for(const r of pat[j])J[r*n+j]=(fph[r]-fmi[r])/h2;}
      }
      apply();
      if(nR!==m){pat=null;SK_JPAT.delete(sk);it--;continue;} // structure changée : Jacobien complet
    }
    if(nR!==m){break;} // structure instable : on garde le meilleur état atteint
    // g=JᵀF ; H≈JᵀJ
    // ligne par ligne sur les seules dérivées non nulles (2 à 6 par ligne) : m·k² au lieu de n²·m
    const g=new Float64Array(n),H=new Float64Array(n*n),nzi=new Int32Array(n),nzv=new Float64Array(n);
    for(let r=0;r<m;r++){
      let k=0;const o=r*n,fr=f[r];
      for(let j=0;j<n;j++){const v=J[o+j];if(v!==0){nzi[k]=j;nzv[k]=v;k++;}}
      for(let a=0;a<k;a++){const i=nzi[a],va=nzv[a];g[i]+=va*fr;const oi=i*n;for(let b=0;b<k;b++)H[oi+nzi[b]]+=va*nzv[b];}
    }
    // V0.7.1 : un pas refusé est REDEMANDÉ avec un amortissement plus fort sur le MÊME Jacobien
    // (le point n'a pas bougé) — avant, chaque refus recalculait les 2n évaluations du résidu.
    const A=new Float64Array(n*n),dg=new Float64Array(n),xsv=new Float64Array(n);
    let accepted=false,stop=false;
    while(!accepted&&!stop){
      for(let i=0;i<n*n;i++)A[i]=H[i];
      for(let i=0;i<n;i++)A[i*n+i]+=lam*W[i]+1e-9;
      for(let i=0;i<n;i++)dg[i]=-g[i];
      if(!cholSolve(A,dg,n)){lam*=10;if(lam>1e12){restoreBest();stop=true;}continue;}
      for(let i=0;i<n;i++)xsv[i]=x[i];
      for(let i=0;i<n;i++)x[i]+=dg[i];apply();
      const e2=saveBest();
      if(isFinite(e2)&&e2<=cur){
        const imp=cur-e2;
        cur=e2;accepted=true;
        lam=Math.max(lam*0.3,1e-8);
        if(imp<1e-10*Math.max(1e-12,cur)||cur<1e-14)stop=true;
      }else{
        for(let i=0;i<n;i++)x[i]=xsv[i];apply();
        // refus : si l'écart n'est que du bruit (point déjà stationnaire) → convergence
        if(isFinite(e2)&&e2-cur<1e-10*Math.max(1e-12,cur)){stop=true;break;}
        lam*=10;
        if(lam>1e12){restoreBest();stop=true;}
      }
    }
    if(stop&&sparseUsed&&cur>=1e-14){needFull=true;lam=Math.min(lam,1e-3);continue;} // pas convergé : vérifier sur un Jacobien complet
    if(stop)break;
  }
  restoreBest();
  return true;
}
function skTangentExtend(sk,anchor){
  // après résolution : les tangentes doivent toucher le SEGMENT visible (pied de projection)
  // — étend les extrémités libres (ni fixées, ni partagées, ni avec cote length) vers le contact.
  const fix=skFixed(sk);(anchor||[]).forEach(p=>fix.add(p));
  (sk.constraints||[]).forEach(c=>{
    if(!c||c.type!=='tangent')return;
    const L=entById(sk,c.line),E=entById(sk,c.ent);
    if(!L||!E||L.t!=='line'||(E.t!=='circle'&&E.t!=='arc'))return;
    const P=sk.points,A=P[L.p1],B=P[L.p2],CC=P[E.pc];if(!A||!B||!CC)return;
    const dx=B.x-A.x,dy=B.y-A.y,len=Math.hypot(dx,dy)||1e-9,ux=dx/len,uy=dy/len;
    const overLine=(sk.dims||[]).some(d=>d.type==='length'&&d.line===L.id);
    if(overLine)return;
    const shareP=pid=>(sk.entities||[]).some(e=>e&&e!==L&&skEntPids(e).indexOf(pid)>=0);
    const t=((CC.x-A.x)*ux+(CC.y-A.y)*uy)/len;
    if(t<0&&!fix.has(L.p1)&&!shareP(L.p1)){const d=-t*len+Math.max(0.5,len*1e-3);A.x-=ux*d;A.y-=uy*d;}
    else if(t>1&&!fix.has(L.p2)&&!shareP(L.p2)){const d=(t-1)*len+Math.max(0.5,len*1e-3);B.x+=ux*d;B.y+=uy*d;}
  });
}
function skTangentSlide(sk,anchor){
  // passe finale : si le pied (projection du centre sur la ligne) déborde du segment et que la
  // ligne ne peut pas être étendue (extrémité fixée/partagée ou cote length), on FAIT GLISSER le
  // cercle/arc PARALLÈLEMENT à sa tangente : la distance centre→droite reste exactement R
  // (la tangence est conservée), seul le pied se déplace pour rentrer dans le segment visible.
  const fix=skFixed(sk);(anchor||[]).forEach(p=>fix.add(p));
  (sk.constraints||[]).forEach(c=>{
    if(!c||c.type!=='tangent')return;
    const L=entById(sk,c.line),E=entById(sk,c.ent);
    if(!L||!E||L.t!=='line'||(E.t!=='circle'&&E.t!=='arc'))return;
    const P=sk.points,A=P[L.p1],B=P[L.p2],CC=P[E.pc];if(!A||!B||!CC)return;
    if(fix.has(E.pc))return; // centre verrouillé : on ne peut pas glisser
    const dx=B.x-A.x,dy=B.y-A.y,len=Math.hypot(dx,dy)||1e-9,ux=dx/len,uy=dy/len;
    const t=((CC.x-A.x)*ux+(CC.y-A.y)*uy)/len;
    if(t>=-1e-4&&t<=1+1e-4)return; // pied déjà dedans
    // déplacement du centre le long de la droite : recalcule le pied → ramène à [0,1]
    const t0=Math.max(0,Math.min(1,t));
    const dSh=(t0-t)*len;
    CC.x+=ux*dSh;CC.y+=uy*dSh;
  });
}
function skSolveFinal(sk,anchor){
  // nettoie la tangence visible : teste étendre les segments puis glisser les cercles le long
  // de leur tangente, et ne conserve que l'état de plus petit résidu maximal → jamais d'audit pire.
  const snap0=skSnapCoords(sk);
  const r0=skAudit(sk).score||0;
  let best={r:r0,snap:snap0};
  skTangentExtend(sk,anchor);let rE=skAudit(sk).score||0;
  if(rE<best.r-1e-9)best={r:rE,snap:skSnapCoords(sk)};
  skRestoreCoords(sk,snap0);
  skTangentSlide(sk,anchor);let rS=skAudit(sk).score||0;
  if(rS<best.r-1e-9)best={r:rS,snap:skSnapCoords(sk)};
  skRestoreCoords(sk,snap0);
  skTangentExtend(sk,anchor);skTangentSlide(sk,anchor);
  const rES=skAudit(sk).score||0;
  if(rES<best.r-1e-9)best={r:rES,snap:skSnapCoords(sk)};
  skRestoreCoords(sk,best.snap);
}
// V0.7.1 : une esquisse est RÉSOLUE quand aucune cote ni contrainte n'est violée de plus que le
// seuil d'alerte de l'audit (lignes rouges, 0,05 mm).
const SK_OK_RES=0.05;
function skResid(sk){try{const r=skAudit(sk).residual;return isFinite(r)?r:Infinity;}catch(e){return Infinity;}}
function skWorstViol(sk){
  // les éléments en défaut (3 au plus, du plus grand écart au plus petit) : le conflit en a au moins deux
  try{const a=(skAudit(sk).all||[]).filter(o=>o.viol>SK_OK_RES).sort((p,q)=>q.viol-p.viol).slice(0,3);
    return a.map(w=>w.desc+' en défaut de '+(w.viol<100?w.viol.toFixed(2):'plus de 100')+' mm').join(', ');}catch(e){return '';}
}
function skSolveOrRevert(sk,label){
  // V0.7.1 : ÉCHEC = RETOUR ARRIÈRE. Après une modification précédée de skPushUndo : résout ;
  // si l'esquisse était résolue avant et ne l'est plus, la modification est annulée et
  // l'esquisse revient EXACTEMENT à son état précédent (au lieu de garder la « moins mauvaise »
  // solution, souvent déformée ou retournée). Une esquisse déjà en défaut n'est pas bloquée.
  const before=skUndoStack[skUndoStack.length-1];
  solveSketch(sk);
  if(sk!==skEdit||!before)return true;
  // V0.11.13 : une ligne RÉDUITE À UN POINT par la résolution = contraintes en conflit « résolues »
  // en écrasant la ligne (─ sur une ligne ⟂ à une autre ─ : « test esquisse », e17) → refusé.
  const bP=before.points||{},crushed=(sk.entities||[]).find(e=>{if(e.t!=='line')return false;
    const A=sk.points[e.p1],B=sk.points[e.p2],A0=bP[e.p1],B0=bP[e.p2];
    return A&&B&&A0&&B0&&Math.hypot(B.x-A.x,B.y-A.y)<1e-4&&Math.hypot(B0.x-A0.x,B0.y-A0.y)>1e-3;});
  if(crushed)return skRevertTo(sk,before,label,'la ligne '+crushed.id+' serait réduite à un point — contraintes en conflit');
  if(skResid(sk)<=SK_OK_RES)return true;
  if(skResid({points:before.points,entities:before.entities,constraints:before.constraints,dims:before.dims})>SK_OK_RES)return true;
  return skRevertTo(sk,before,label,skWorstViol(sk));
}
function skRevertTo(sk,before,label,why){
  // restauration SANS nouvelle résolution (skRestore résout) : coordonnées exactement celles d'avant
  skUndoStack.pop();
  skEdit.points=before.points;skEdit.entities=before.entities;skEdit.constraints=before.constraints;skEdit.dims=before.dims;
  try{skRefreshHealth();}catch(e){}
  skUndoBtn();
  try{if(typeof parApplyAll==='function')parApplyAll();}catch(e){}
  skMsg='⛔ '+label+' impossible'+(why?' ('+why+')':'')+' : esquisse laissée telle quelle.';skStatus(skMsg);
  return false;
}
/* solveur principal : essaie le moindres carrés (LM) ET la relaxation, puis garde le meilleur
   des deux (mesuré par le résidu d'audit maximal). C'est le LM qui relève les systèmes
   bien posés ; la relaxation conserve les cas qu'elle résolvait déjà (sous/pluridéterminés). */
function solveSketch(sk,iters,anchor){
  if(!sk||!sk.points)return;iters=iters||120;
  ensureOrigin(sk); // origine clouée (0,0) AVANT tout essai : réglage autour du vrai repère
  try{skDimSides(sk);}catch(e){} // côté des entraxes / point↔ligne lu sur l'état cohérent courant
  const base=skSnapCoords(sk); // état de départ (avant tout essai)
  let lsSnap=null; // coordonnées atteintes par le LM
  let lsRes=Infinity;
  try{
    const fix=skFixed(sk);(anchor||[]).forEach(p=>fix.add(p));
    (sk.dims||[]).forEach(d=>{if(d.ref)return;if(d.type==='diameter'||d.type==='radius'){const e=entById(sk,d.ent);if(e&&(e.t==='circle'||e.t==='arc'))e.r=Math.max(d.type==='diameter'?d.value/2:d.value,0.1);}});
    const B=sklsBuild(sk,fix);
    if(B.n>0&&B.n<=300){
      const x=new Float64Array(B.n);
      B.pts.forEach((pid,i)=>{const p=sk.points[pid];x[2*i]=p.x;x[2*i+1]=p.y;});
      B.rad.forEach((eid,j)=>{const e=entById(sk,eid);x[2*B.pts.length+j]=e?e.r:1;});
      sklsSolveLM(sk,B,x,iters);
      // V0.7.1 : pas encore convergé (système mal conditionné : congés égaux, tangences ×300 face
      // aux cotes) → on PROLONGE depuis le point atteint, jusqu'à 8× le budget et 400 ms au plus
      // (pas pendant un glisser, dont les pas à 40 itérations doivent rester rapides).
      // Ex. Cavité Usinage, esquisse 11 : angle de 24° résolu en ~500 itérations, pas en 120.
      {const fr=[];sklsCollect(sk,fr,B);let mx=0;for(let i=0;i<fr.length;i++)mx=Math.max(mx,Math.abs(fr[i]));
        if(mx>1e-6&&iters>=100){B.pts.forEach((pid,i)=>{const p=sk.points[pid];x[2*i]=p.x;x[2*i+1]=p.y;});B.rad.forEach((eid,j)=>{const e=entById(sk,eid);x[2*B.pts.length+j]=e?e.r:1;});
          sklsSolveLM(sk,B,x,iters*8,Date.now()+400);}}
      skSolveFinal(sk,anchor);
      try{const r=skAudit(sk).score||0;if(isFinite(r)){lsSnap=skSnapCoords(sk);lsRes=r;}}catch(e){}
    }
  }catch(e){ /* LM en échec complet → compté comme résidu infini */ }
  // relaxation depuis l'état INITIAL
  skRestoreCoords(sk,base);
  solveSketchRelax(sk,iters,anchor);
  let relRes=Infinity;try{relRes=skAudit(sk).score||0;}catch(e){relRes=Infinity;}
  // garder le meilleur des deux états
  if(isFinite(lsRes)&&isFinite(relRes)&&lsRes<relRes-1e-7&&lsSnap){
    skRestoreCoords(sk,lsSnap);
    skSolveFinal(sk,anchor);
  }else{
    skSolveFinal(sk,anchor); // sur l'état relaxation
  }
  // Garde-fou « saisie ancrée » : pendant un glisser le point pris à la souris est figé,
  // ce qui peut RIVALISER avec une contrainte (milieu sur arête projetée figée, extrémité
  // coincée sur une ligne fixe, cote incompatible…). L'état ancré est alors rejeté : on
  // resout SANS ancre (les contraintes gagnent) et on ne garde ce second essai que s'il
  // abaisse vraiment le résidu → aucune contrainte ne reste violée après un glisser.
  // Recursion bornée : l'appel récursif passe anchor=undefined donc le garde-fou ne se
  // redéclenche pas.
  if(anchor&&anchor.length){
    let rA=0;try{rA=skAudit(sk).score||0;}catch(e){rA=0;}
    if(rA>1e-4){ // ≫ bruit numérique, ≪ le seuil d'alerte d'audit (0,05 mm)
      const snapA=skSnapCoords(sk);
      let rB=Infinity;
      try{solveSketch(sk,iters);rB=skAudit(sk).score||0;}catch(e){rB=Infinity;}
      if(!(rB<rA-1e-9))skRestoreCoords(sk,snapA); // pas de gain → on garde l'état ancré
    }
  }
  const Of=(sk.points||{})[SK_ORIGIN];
  if(Of&&(Of.x!==0||Of.y!==0)){Of.x=0;Of.y=0;} // filet de sortie : aucune passe n'emmène l'origine
  skTanSideRec(sk);
}
// 2026-10-16-001 : CÔTÉ des tangences ligne ↔ cercle/arc. « |distance| = R » laisse le
// centre traverser la droite (congé retourné en grand arc quand on glisse son centre).
// Le côté est relevé sur chaque état RÉSOLU et imposé ensuite (résidu signé).
// WeakMap : jamais enregistré dans le fichier ; une copie de contrainte repart libre.
const SK_TAN_SIDE=new WeakMap();
function skTanSigned(sk,c){
  const L=entById(sk,c.line),E=entById(sk,c.ent);
  if(!L||!E||L.t!=='line'||(E.t!=='circle'&&E.t!=='arc'))return null;
  const P=sk.points,A=P[L.p1],B=P[L.p2],CC=P[E.pc];if(!A||!B||!CC)return null;
  const dx=B.x-A.x,dy=B.y-A.y,len=Math.hypot(dx,dy)||1e-9;
  return{d:(CC.x-A.x)*(-dy/len)+(CC.y-A.y)*(dx/len),r:E.r};
}
function skTanSideRec(sk){
  (sk.constraints||[]).forEach(c=>{
    if(c.type!=='tangent')return;
    const t=skTanSigned(sk,c);if(!t||!(t.r>0))return;
    if(Math.abs(Math.abs(t.d)-t.r)<1e-3*Math.max(1,t.r)&&Math.abs(t.d)>1e-6)SK_TAN_SIDE.set(c,t.d>0?1:-1);
  });
}
/* resolveur linéaire : Cholesky A·x=b (A SPD en place) */
function cholSolve(A,b,n){
  // factorisation LDLᵀ : triangle inférieur = L (diagonale implicite 1), A[i,i]=1/D_i.
  // Résout A_orig·x=b (A en entrée = matrice symétrique complète, modifiée en place).
  // Retourne false si non-définie positive (pivot ≤ 1e-14 ou NaN).
  for(let j=0;j<n;j++){
    let d=A[j*n+j];
    for(let k=0;k<j;k++)d-=A[j*n+k]*A[j*n+k]/A[k*n+k];
    if(!(d>1e-14))return false;
    for(let i=j+1;i<n;i++){
      let s=A[i*n+j];
      for(let k=0;k<j;k++)s-=A[i*n+k]*A[j*n+k]/A[k*n+k];
      A[i*n+j]=s/d;
    }
    A[j*n+j]=1/d;
  }
  for(let j=0;j<n;j++)for(let i=j+1;i<n;i++)b[i]-=A[i*n+j]*b[j];
  for(let j=0;j<n;j++)b[j]*=A[j*n+j];
  for(let j=n-1;j>=0;j--)for(let i=j+1;i<n;i++)b[j]-=A[i*n+j]*b[i];
  return true;
}
function arcAngles(sk,e){ // angles dérivés des points d'extrémité (e.pa/e.pb), delta CCW > 0
  const P=sk.points,C=P[e.pc],A=P[e.pa],B=P[e.pb];
  if(!C||!A||!B)return null;
  const a1=Math.atan2(A.y-C.y,A.x-C.x);
  if(e.pa===e.pb)return{a1,a2:a1+Math.PI*2};
  const a2=Math.atan2(B.y-C.y,B.x-C.x);
  let d=(a2-a1)%(Math.PI*2);if(d<=0)d+=Math.PI*2;
  return{a1,a2:a1+d};
}
function rLocked(sk,e){
  return (sk.constraints||[]).some(c=>c.type==='fix'&&c.ent===e.id)||(sk.dims||[]).some(d=>d.ent===e.id&&(d.type==='diameter'||d.type==='radius'));
}
function entLocked(sk,e,fix){
  fix=fix||skFixed(sk);
  if(e.t==='line')return fix.has(e.p1)&&fix.has(e.p2);
  if(e.t==='cpoint')return fix.has(e.p);
  if(e.t==='circle'||e.t==='arc')return fix.has(e.pc)&&rLocked(sk,e);
  if(e.t==='spline')return skSplineAllPids(sk,e).every(p=>fix.has(p));
  return false;
}
