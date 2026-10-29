// Esquisse 2D (3/5) : accrochages, trim/split, congés/chanfreins d'angle, décalage, sélection.
/* ----- snaps / proximités ----- */
function nearestPoint(sk,x,y,maxD,exclude){
  let best=null,bd=maxD;
  Object.keys(skPts(sk)).forEach(pid=>{if(pid===exclude)return;const p=sk.points[pid];const d=Math.hypot(p.x-x,p.y-y);if(d<bd){bd=d;best=pid;}});
  return best;
}
function findSnap(sk,x,y,exclude){
  const pid=nearestPoint(sk,x,y,SK_SNAP,exclude);
  if(pid)return{kind:'point',pid,x:sk.points[pid].x,y:sk.points[pid].y};
  let bm=null,bd=SK_SNAP;
  sk.entities.forEach(e=>{if(e.t!=='line')return;const A=sk.points[e.p1],B=sk.points[e.p2];if(!A||!B)return;
    const mx=(A.x+B.x)/2,my=(A.y+B.y)/2,d=Math.hypot(mx-x,my-y);if(d<bd){bd=d;bm={kind:'mid',line:e.id,x:mx,y:my};}});
  if(bm)return bm;
  let bc=null;bd=SK_SNAP;
  sk.entities.forEach(e=>{if(e.t!=='circle'&&e.t!=='arc')return;const C=sk.points[e.pc];if(!C)return;
    const d=Math.hypot(C.x-x,C.y-y);if(d<bd){bd=d;bc=e.pc;}});
  if(bc)return{kind:'point',pid:bc,x:sk.points[bc].x,y:sk.points[bc].y};
  return null;
}
function skDragSnapFind(sk,x,y,pid){
  // V0.11.24 : accroche d'un POINT GLISSÉ (comme SolidCraft drag_snap) : autre point, milieu d'une ligne,
  // puis SUR une ligne ou un cercle — jamais les entités qui portent le point lui-même (l'autre bout de
  // sa ligne, son propre milieu). Le lâcher pose la contrainte correspondante (skDragRelease).
  const own=new Set();(sk.entities||[]).forEach(e=>{if(skEntPids(e).indexOf(pid)>=0){own.add(e.id);skEntPids(e).forEach(p=>{if(p)own.add(p);});}});
  let best=null,bd=SK_SNAP;
  Object.keys(skPts(sk)).forEach(q=>{if(q===pid||own.has(q))return;const p=sk.points[q];const d=Math.hypot(p.x-x,p.y-y);if(d<bd){bd=d;best={kind:'point',pid:q,x:p.x,y:p.y};}});
  if(best)return best;
  bd=SK_SNAP;
  (sk.entities||[]).forEach(e=>{if(e.t!=='line'||own.has(e.id))return;const A=sk.points[e.p1],B=sk.points[e.p2];if(!A||!B)return;
    const mx=(A.x+B.x)/2,my=(A.y+B.y)/2,d=Math.hypot(mx-x,my-y);if(d<bd){bd=d;best={kind:'mid',line:e.id,x:mx,y:my};}});
  if(best)return best;
  bd=SK_SNAP*0.6;
  (sk.entities||[]).forEach(e=>{
    if(own.has(e.id))return;
    if(e.t==='line'){const A=sk.points[e.p1],B=sk.points[e.p2];if(!A||!B)return;
      const dx=B.x-A.x,dy=B.y-A.y,L2=dx*dx+dy*dy;if(L2<1e-12)return;
      const t=((x-A.x)*dx+(y-A.y)*dy)/L2;if(t<=1e-3||t>=1-1e-3)return;
      const fx=A.x+t*dx,fy=A.y+t*dy,d=Math.hypot(fx-x,fy-y);if(d<bd){bd=d;best={kind:'on',line:e.id,x:fx,y:fy};}}
    else if(e.t==='circle'||e.t==='arc'){const C=sk.points[e.pc];if(!C||!(e.r>0))return;
      const dc=Math.hypot(x-C.x,y-C.y);if(dc<1e-9)return;const d=Math.abs(dc-e.r);
      if(d<bd){const ux=(x-C.x)/dc,uy=(y-C.y)/dc;const qx=C.x+ux*e.r,qy=C.y+uy*e.r;
        if(e.t==='arc'){const an=arcAngles(sk,e);if(an&&!angInArc(Math.atan2(uy,ux),an.a1,an.a2))return;}
        bd=d;best={kind:'oncircle',ent:e.id,x:qx,y:qy};}}
    else if(e.t==='spline'){const h=skSplineClosest(sk,e,x,y);if(h&&h.d<bd){bd=h.d;best={kind:'onspline',ent:e.id,x:h.x,y:h.y};}}
  });
  return best;
}
function skDragRelease(sk,pid,s){
  // V0.11.24 : au lâcher d'un point glissé sur une accroche, la contrainte est posée (coïncident, milieu,
  // sur la ligne, sur le cercle) — avant, deux points superposés restaient libres l'un de l'autre.
  if(!s||!pid||!sk.points[pid])return null;
  const has=f=>(sk.constraints||[]).some(f);
  let c=null,msg='';
  if(s.kind==='point'){if(!sk.points[s.pid]||skHasCoincident(sk,pid,s.pid))return null;c={id:skNewEid(sk),type:'coincident',a:pid,b:s.pid};msg='Points coïncidents ⌾ (lâcher sur un point).';}
  else if(s.kind==='mid'){if(has(x=>x.type==='midpoint'&&x.p===pid&&x.line===s.line))return null;c={id:skNewEid(sk),type:'midpoint',p:pid,line:s.line};msg='Point au milieu ⊕ de la ligne (lâcher sur le milieu).';}
  else if(s.kind==='on'){if(has(x=>x.type==='online'&&x.p===pid&&x.line===s.line))return null;c={id:skNewEid(sk),type:'online',p:pid,line:s.line};msg='Point sur la ligne (lâcher sur la ligne).';}
  else if(s.kind==='oncircle'){if(has(x=>x.type==='oncircle'&&x.p===pid&&x.ent===s.ent))return null;c={id:skNewEid(sk),type:'oncircle',p:pid,ent:s.ent};msg='Point sur le cercle (lâcher sur le cercle).';}
  else if(s.kind==='onspline'){if(has(x=>x.type==='onspline'&&x.p===pid&&x.ent===s.ent))return null;c={id:skNewEid(sk),type:'onspline',p:pid,ent:s.ent};msg='Point sur la spline (lâcher sur la spline).';}
  if(!c)return null;
  sk.constraints.push(c);
  solveSketch(sk);
  if(skResid(sk)>SK_OK_RES){ // la contrainte ne tient pas (déjà sur-contraint) : retirée, le glisser reste
    sk.constraints=sk.constraints.filter(k=>k!==c);solveSketch(sk);
    try{skStatus('Accroche impossible ici (contraintes en conflit) — point déplacé sans contrainte.');}catch(e){}
    return null;}
  try{skStatus(msg+' Ctrl+Z pour annuler.');}catch(e){}
  return c;
}
function snapNewPoint(sk,x,y){
  const s=findSnap(sk,x,y);
  if(s&&s.kind==='point')return s.pid;
  if(s&&s.kind==='mid'){const pid=addPoint(sk,s.x,s.y);
    if(!(sk.constraints||[]).some(c=>c.type==='midpoint'&&c.p===pid&&c.line===s.line))
      sk.constraints.push({id:skNewEid(sk),type:'midpoint',p:pid,line:s.line}); // point au centre — la ligne reste entière
    return pid;}
  if($('skSnap').checked){x=skSnapVal(x);y=skSnapVal(y);}
  return addPoint(sk,x,y);
}
/* ----- ré-acheminement des contraintes de LIGNE après trim/split : ne pas perdre les connexions ----- */
function lineConstrsOf(sk,id){ // toutes les contraintes « dédiées » à la ligne id (h/v/tangent/droite-droite/fix)
  return (sk.constraints||[]).filter(c=>{
    if(!c)return false;
    if(c.type==='h'||c.type==='v'||c.type==='tangent')return c.line===id;
    if(skPairLineType(c.type))return c.a===id||c.b===id||(c.type==='symmetric'&&c.mid===id);
    if(c.type==='midpoint')return c.line===id||c.a===id||c.b===id;
    if(c.type==='fix')return c.ent===id;
    return false;
  });
}
function tangentFootSegs(sk,c,newIds){ // segments dont le pied (projection du centre arc/cercle) tombe dans leur étendue
  const E=entById(sk,c.ent);if(!E||!E.pc)return[];
  const C=sk.points[E.pc];if(!C)return[];
  const out=[];
  newIds.forEach(nid=>{
    const L=entById(sk,nid);if(!L)return;
    const A=sk.points[L.p1],B=sk.points[L.p2];if(!A||!B)return;
    const dx=B.x-A.x,dy=B.y-A.y,len2=dx*dx+dy*dy;if(len2<1e-12)return;
    const t=((C.x-A.x)*dx+(C.y-A.y)*dy)/len2;
    if(t>=-5e-3&&t<=1+5e-3)out.push(nid);
  });
  return out;
}
function cloneLineConstraints(sk,oldId,newIds,drop){
  // recrée sur newIds une copie saine des liaisons de oldId, puis (drop) purge les refs mortes et cotes length
  lineConstrsOf(sk,oldId).forEach(c=>{
    newIds.forEach(nid=>{
      if(c.type==='h'||c.type==='v'){
        if(!hasHV(sk,nid,c.type))sk.constraints.push({id:skNewEid(sk),type:c.type,line:nid});
      }else if(c.type==='tangent'){
        if(tangentFootSegs(sk,c,[nid]).length&&!(sk.constraints||[]).some(x=>x.type==='tangent'&&x.line===nid&&x.ent===c.ent))
          sk.constraints.push({id:skNewEid(sk),type:'tangent',line:nid,ent:c.ent});
      }else if(c.type==='fix'){
        if(!(sk.constraints||[]).some(x=>x.type==='fix'&&x.ent===nid))
          sk.constraints.push({id:skNewEid(sk),type:'fix',ent:nid});
      }else if(skPairLineType(c.type)){
        const a=(c.a===oldId)?nid:c.a,b=(c.b===oldId)?nid:c.b,mid=(c.mid===oldId)?nid:c.mid;
        if(a!==b&&a!==mid&&b!==mid&&!(sk.constraints||[]).some(x=>x.type===c.type&&x.mid===c.mid&&((x.a===a&&x.b===b)||(c.type!=='parallel'&&x.a===b&&x.b===a))))
          sk.constraints.push(Object.assign({id:skNewEid(sk),type:c.type,a,b},c.mid?{mid}:{}));
      }
    });
  });
  if(drop){
    const dead=lineConstrsOf(sk,oldId);
    sk.constraints=(sk.constraints||[]).filter(c=>dead.indexOf(c)<0);
    sk.dims=(sk.dims||[]).filter(d=>!(d.type==='length'&&d.line===oldId));
  }
}
function splitLineAt(sk,lineId,pid){
  const l=entById(sk,lineId);if(!l||l.t!=='line')return;
  if(l.p1===pid||l.p2===pid)return;
  const nl={id:skNewEid(sk),t:'line',p1:pid,p2:l.p2};l.p2=pid;sk.entities.push(nl);
  // la moitié conservée garde ses contraintes ; la nouvelle moitié hérite des liaisons valides (h/v, //, ⟂, sym, fix)
  // et des tangences dont le pied tombe dans son étendue. La cote length de la moitié conservée suit sa longueur.
  cloneLineConstraints(sk,lineId,[nl.id],false);
  (sk.constraints||[]).filter(c=>c.type==='tangent'&&(c.line===lineId||c.line===nl.id)).forEach(c=>{
    const piedOld=tangentFootSegs(sk,c,[lineId]).length>0;
    const piedNew=tangentFootSegs(sk,c,[nl.id]).length>0;
    if(c.line===lineId&&!piedOld&&piedNew)sk.constraints=sk.constraints.filter(x=>x!==c);
    if((piedOld||piedNew)&&!sk.constraints.some(x=>x.type==='parallel'&&((x.a===lineId&&x.b===nl.id)||(x.a===nl.id&&x.b===lineId))))
      sk.constraints.push({id:skNewEid(sk),type:'parallel',a:lineId,b:nl.id});
  });
  const dd=(sk.dims||[]).find(d=>d.type==='length'&&d.line===lineId);
  if(dd){const A=sk.points[l.p1],B=sk.points[l.p2];dd.value=(A&&B)?dimMeasureOf(A,B,dd.orient):lineLen(sk,l);}
}
function mergePoints(sk,fromPid,toPid){
  if(!fromPid||!toPid||fromPid===toPid)return false;
  if(fromPid===SK_ORIGIN){const t=fromPid;fromPid=toPid;toPid=t;} // ne jamais supprimer l'origine
  if(toPid===SK_ORIGIN){ // fusion vers (0,0) : translation rigide du reste du dessin — tangences/∥/＝ inchangées
    const P=sk.points[fromPid],O=sk.points[SK_ORIGIN];
    if(P&&O&&(P.x!==O.x||P.y!==O.y)){const dx=O.x-P.x,dy=O.y-P.y;
      Object.keys(sk.points).forEach(k=>{if(k!==fromPid&&k!==SK_ORIGIN){const q=sk.points[k];q.x+=dx;q.y+=dy;}});}
  }
  sk.entities.forEach(e=>{['p1','p2','p','pc','pa','pb'].forEach(k=>{if(e[k]===fromPid)e[k]=toPid;});
    if(e.pts)e.pts=e.pts.map(p=>p===fromPid?toPid:p).filter((p,i,a)=>i===0||p!==a[i-1]);}); // spline : doublon voisin retiré
  (sk.dims||[]).forEach(d=>{if(d.a===fromPid)d.a=toPid;if(d.b===fromPid)d.b=toPid;if(d.p===fromPid)d.p=toPid;});
  (sk.constraints||[]).forEach(c=>{if(c.p===fromPid)c.p=toPid;if(c.a===fromPid&&c.type==='coincident')c.a=toPid;if(c.b===fromPid&&c.type==='coincident')c.b=toPid;});
  // ancrages de congé/chanfrein : une ancre type p visant le point fusionné doit suivre
  (doc.features||[]).forEach(f=>{if(!f||f.type!=='xfillet'||!f.edges)return;
    f.edges.forEach(en=>{const a=en&&en.anchor;if(a&&a.t==='p'&&a.sk===sk.id&&a.id===fromPid)a.id=toPid;});});
  delete sk.points[fromPid];return true;
}
function skCommitLine(sk,fromPid,snap,ex,ey,dimVal){
  skPushUndo(); // snapshot AVANT la fin de tracé : annuler retire proprement le point de fin
  let endPid=null;
  if(snap&&snap.kind==='point')endPid=snap.pid;
  else if(snap&&snap.kind==='mid'){endPid=addPoint(sk,snap.x,snap.y);
    if(!(sk.constraints||[]).some(c=>c.type==='midpoint'&&c.p===endPid&&c.line===snap.line))
      sk.constraints.push({id:skNewEid(sk),type:'midpoint',p:endPid,line:snap.line}); // sans scinder la ligne réceptrice
  }
  else endPid=addPoint(sk,ex,ey);
  if(!endPid||endPid===fromPid){skUndoStack.pop();skUndoBtn();return null;}
  const nl={id:skNewEid(sk),t:'line',p1:fromPid,p2:endPid};
  sk.entities.push(nl);
  if(skInfer&&skInfer.h&&!hasHV(sk,nl.id,'h'))sk.constraints.push({id:skNewEid(sk),type:'h',line:nl.id});
  if(skInfer&&skInfer.v&&!hasHV(sk,nl.id,'v'))sk.constraints.push({id:skNewEid(sk),type:'v',line:nl.id});
  // ─/│ prime sur ⟂ : si la nouvelle droite est H (resp. V) et la cible V (resp. H),
  // la perpendicularité est déjà acquise — on ne l'ajoute pas (cf. skPerpImplied).
  if(skInfer&&skInfer.perp&&!skHasPerp(sk,nl.id,skInfer.perp)&&!skPerpImplied(sk,nl.id,skInfer.perp))
    sk.constraints.push({id:skNewEid(sk),type:'perpendicular',a:nl.id,b:skInfer.perp});
  // V0.11.24 : ∥ inféré → contrainte parallèle ; prolongement inféré → extrémité posée SUR la droite (online, pied hors du segment)
  if(skInfer&&skInfer.par&&skInfer.par!==nl.id&&!skHasParallel(sk,nl.id,skInfer.par)&&entById(sk,skInfer.par))
    sk.constraints.push({id:skNewEid(sk),type:'parallel',a:nl.id,b:skInfer.par});
  if(skInfer&&skInfer.ext&&skInfer.ext!==nl.id&&entById(sk,skInfer.ext)&&!(sk.constraints||[]).some(c=>c.type==='online'&&c.p===endPid&&c.line===skInfer.ext))
    sk.constraints.push({id:skNewEid(sk),type:'online',p:endPid,line:skInfer.ext});
  if(skInfer&&skInfer.tan&&!(sk.constraints||[]).some(c=>c.type==='tangent'&&c.line===nl.id&&c.ent===skInfer.tan)){
    sk.constraints.push({id:skNewEid(sk),type:'tangent',line:nl.id,ent:skInfer.tan});
    skPinTangent(sk,nl.id,skInfer.tan);
  }
  // toute extrémité posée SUR une ligne/autre courbe (zone d'inférence) est épinglée dès la création
  [nl.p1,nl.p2].forEach(pid=>{const pp=sk.points[pid];if(pp)skAutoAttach(sk,pid,pp.x,pp.y);});
  if(dimVal>0)sk.dims.push({id:skNewEid(sk),type:'length',line:nl.id,value:+dimVal.toFixed(3),ox:0,oy:0});
  skChain=endPid;
  return nl;
}
function skDynCommit(){
  if(!skDyn||!skEdit||!skDown)return;
  const sk=skEdit, val=parseFloat(skDyn.buf);
  if(!isFinite(val)||val<=0){skStatus('Valeur invalide.');skDyn=null;drawSketch2D();return;}
  const D=(skDraft&&skDraft.t==='line')?skDraft:null;
  const ang=(skDyn.mode==='ang')?(val*Math.PI/180):(D?Math.atan2(D.y2-D.y1,D.x2-D.x1):0);
  let ex,ey,dimVal;
  if(skDyn.mode==='len'){ex=skDown.x+val*Math.cos(ang);ey=skDown.y+val*Math.sin(ang);dimVal=val;}
  else{
    const L=D?Math.hypot(D.x2-D.x1,D.y2-D.y1):0;
    if(L<4/skView.s){skStatus('Déplacez le curseur pour définir la longueur, puis tapez l’angle.');return;}
    ex=skDown.x+L*Math.cos(ang);ey=skDown.y+L*Math.sin(ang);dimVal=L;
  }
  const nl=skCommitLine(sk,skDown.pid,null,ex,ey,dimVal);
  skDyn=null;skDraft=null;skDown=null;skInfer=null;skSnapMk=null;
  if(nl){solveSketch(sk);cleanupSk(sk);drawSketch2D();renderSkPanel();skStatus('Ligne '+dimVal.toFixed(2)+' mm créée (cote dynamique).');}
  else{drawSketch2D();}
}
/* ----- congé / chanfrein d'angle 2D : 2 arêtes, tangences respectées ----- */
let skFilletR=5, skChamferD=5; // dernier rayon / retrait (session) — la cote créée reste l'éditeur durable
function filletCornerGeom(A,V,B,r){
  // Géométrie pure du congé entre 2 droites se coupant en V (A et B : un point
  // sur chaque côté, du côté matière). EXTRAITE de insertSketchFillet (20) pour
  // être partagée : outil interactif + congés d'extrusion — une seule math.
  const lIn=Math.hypot(V.x-A.x,V.y-A.y),lOut=Math.hypot(B.x-V.x,B.y-V.y);
  if(!(lIn>1e-9)||!(lOut>1e-9))return{ok:false,warn:'coin dégénéré'};
  const ux=(A.x-V.x)/lIn,uy=(A.y-V.y)/lIn,wx=(B.x-V.x)/lOut,wy=(B.y-V.y)/lOut;
  const cos=Math.min(1,Math.max(-1,ux*wx+uy*wy));
  const sinH=Math.sqrt(Math.max((1-cos)/2,1e-12)),cosH=Math.sqrt(Math.max((1+cos)/2,1e-12));
  const rEff=Math.min(r,0.49*Math.min(lIn,lOut)*sinH/Math.max(cosH,1e-12));
  if(!(rEff>1e-3))return{ok:false,warn:'coin trop tangent — pas de place pour le rayon'};
  const t=rEff*cosH/Math.max(sinH,1e-12);
  if(!(t>1e-9))return{ok:false,warn:'rayon invalide'};
  let bx=ux+wx,by=uy+wy;const bl=Math.hypot(bx,by);
  if(!(bl>1e-9))return{ok:false,warn:'coin droit (180°) — rien à arrondir'};
  bx/=bl;by/=bl;
  const off=rEff/Math.max(sinH,1e-12);
  return{ok:true,rEff,t,
    T1:{x:V.x+ux*t,y:V.y+uy*t},T2:{x:V.x+wx*t,y:V.y+wy*t},
    C1:{x:V.x+bx*off,y:V.y+by*off},C2:{x:V.x-bx*off,y:V.y-by*off}};
}
function filletCenterFor(T1,T2,V,C1,C2){
  // Quel centre ? Celui qui remplace la pointe : de l'autre côté de la corde
  // T1T2 par rapport à V (vaut aussi pour un profil ouvert, sans test d'inclusion).
  const sV=(T2.x-T1.x)*(V.y-T1.y)-(T2.y-T1.y)*(V.x-T1.x);
  const s1=(T2.x-T1.x)*(C1.y-T1.y)-(T2.y-T1.y)*(C1.x-T1.x);
  return (sV!==0&&s1*sV>=0)?C2:C1;
}
function skSharedCorner(sk,idA,idB){
  // Coin commun à 2 lignes : un pid partagé, référencé par ces 2 lignes seules
  // (hors construction/points) — sinon le congé casserait un joint existant.
  const A=entById(sk,idA),B=entById(sk,idB);
  if(!A||!B||A.t!=='line'||B.t!=='line')return{error:'Congé/chanfrein : sélectionnez 2 lignes droites.'};
  if(idA===idB)return{error:'Sélectionnez 2 lignes distinctes.'};
  const pid=[A.p1,A.p2].find(p=>p===B.p1||p===B.p2);
  if(!pid)return{error:'Les 2 lignes doivent se toucher (coin commun).'};
  const joint=(sk.entities||[]).some(e=>e!==A&&e!==B&&!e.construction&&e.t!=='cpoint'&&
    (e.p1===pid||e.p2===pid||e.pa===pid||e.pb===pid||e.p===pid));
  if(joint)return{error:'Coin partagé avec une autre entité — congé/chanfrein impossible ici.'};
  return{pid,A,B};
}
function skKeepVirtualSharp(sk,pid,idA,idB){
  // 2026-10-16-002 : le coin rogné par un congé / chanfrein était RÉFÉRENCÉ (accroché à
  // l'origine, coté…) → il reste un COIN VIRTUEL, sur les 2 droites : l'esquisse garde
  // son ancrage et ses cotes au coin (comme Fusion).
  const used=(sk.constraints||[]).some(c=>c&&(c.p===pid||c.a===pid||c.b===pid))||(sk.dims||[]).some(d=>d&&(d.a===pid||d.b===pid||d.p===pid));
  if(!used)return;
  [idA,idB].forEach(l=>{if(!(sk.constraints||[]).some(c=>c.type==='online'&&c.p===pid&&c.line===l))sk.constraints.push({id:skNewEid(sk),type:'online',p:pid,line:l});});
}
function skKeepOverallDims(sk,ids){
  // les côtés rognés ne sont plus symétriques en SEGMENT (un seul bout rogné) : leur
  // symétrie devient une symétrie de DROITES (rectangle par le centre + congés).
  (sk.constraints||[]).forEach(c=>{if(c.type==='symmetric'&&(ids.indexOf(c.a)>=0||ids.indexOf(c.b)>=0))c.inf=true;});
  // 2026-10-16-001 : « les cotes restent attachées à leur ligne alors que je préfère
  // garder la valeur totale du rectangle, congés compris ». Avant de rogner une ligne
  // (congé / chanfrein), sa cote de LONGUEUR devient une cote d'ENTRAXE entre ses deux
  // voisines si elles sont parallèles (côtés d'un rectangle) : même valeur, hors-tout.
  const P=sk.points;
  ids.forEach(id=>{
    const L=entById(sk,id);if(!L||L.t!=='line')return;
    const nb=pid=>(sk.entities||[]).find(e=>e&&e!==L&&e.t==='line'&&(e.p1===pid||e.p2===pid));
    const N1=nb(L.p1),N2=nb(L.p2);if(!N1||!N2||N1===N2)return;
    const v=e=>{const a=P[e.p1],b=P[e.p2];const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1;return{x:dx/l,y:dy/l};};
    const a=v(N1),b=v(N2);if(Math.abs(a.x*b.y-a.y*b.x)>1e-6)return; // pas parallèles
    (sk.dims||[]).forEach(d=>{
      if(d.type!=='length'||d.line!==id)return;
      const A1=P[N1.p1],B1=P[N2.p1];
      const g=Math.abs((B1.x-A1.x)*(-a.y)+(B1.y-A1.y)*a.x);
      d.type='gap';d.a=N1.id;d.b=N2.id;d.value=+g.toFixed(4);
      delete d.line;delete d.orient;delete d.w;delete d.sgn;
    });
  });
}
function skFilletCorner(sk,idA,idB,r){
  // Congé interactif : rogne les 2 lignes aux points de tangence, insère l'arc +
  // 2 contraintes de TANGENCE (ligne↔arc, respectées par le solveur) + cote R pilotée.
  // Pur (pas d'undo/dessin : l'appelant gère) — testable tel quel.
  const sc=skSharedCorner(sk,idA,idB);
  if(sc.error)return{ok:false,msg:sc.error};
  const P=sk.points,V=P[sc.pid];
  const Ao=P[sc.A.p1===sc.pid?sc.A.p2:sc.A.p1],Bo=P[sc.B.p1===sc.pid?sc.B.p2:sc.B.p1];
  if(!V||!Ao||!Bo)return{ok:false,msg:'Congé : coin illisible.'};
  const g=filletCornerGeom(Ao,V,Bo,r);
  if(!g.ok)return{ok:false,msg:'Congé : '+g.warn+(g.warn.indexOf('place')>=0?' — essayez un rayon plus petit.':'.')};
  skKeepOverallDims(sk,[sc.A.id,sc.B.id]); // cotes hors-tout conservées
  skKeepVirtualSharp(sk,sc.pid,sc.A.id,sc.B.id); // coin référencé → coin virtuel
  const capped=g.rEff<r-1e-6;
  const C=filletCenterFor(g.T1,g.T2,V,g.C1,g.C2);
  const idT1=addPoint(sk,g.T1.x,g.T1.y),idT2=addPoint(sk,g.T2.x,g.T2.y),idC=addPoint(sk,C.x,C.y);
  if(sc.A.p1===sc.pid)sc.A.p1=idT1;else sc.A.p2=idT1;
  if(sc.B.p1===sc.pid)sc.B.p1=idT2;else sc.B.p2=idT2;
  // petit arc face au coin (même convention que insertSketchFillet : CCW pa→pb < 180°)
  let pa=idT1,pb=idT2;
  {
    const b1=Math.atan2(g.T1.y-C.y,g.T1.x-C.x),b2=Math.atan2(g.T2.y-C.y,g.T2.x-C.x);
    let d=(b2-b1)%(Math.PI*2);if(d<=0)d+=Math.PI*2;
    if(d>Math.PI){pa=idT2;pb=idT1;}
  }
  const arcId=skNewEid(sk);
  sk.entities.push({id:arcId,t:'arc',pc:idC,pa,pb,r:g.rEff});
  if(!(sk.constraints||[]).some(c=>c.type==='tangent'&&c.line===sc.A.id&&c.ent===arcId))
    sk.constraints.push({id:skNewEid(sk),type:'tangent',line:sc.A.id,ent:arcId});
  if(!(sk.constraints||[]).some(c=>c.type==='tangent'&&c.line===sc.B.id&&c.ent===arcId))
    sk.constraints.push({id:skNewEid(sk),type:'tangent',line:sc.B.id,ent:arcId});
  skPinTangent(sk,sc.A.id,arcId);skPinTangent(sk,sc.B.id,arcId); // épinglage des points de contact (Fusion360)
  sk.dims.push({id:skNewEid(sk),type:'radius',ent:arcId,value:+g.rEff.toFixed(3),ox:0,oy:0});
  return{ok:true,arcId,msg:'Congé R'+g.rEff.toFixed(2)+(capped?' (plafonné pour tenir)':'')};
}
function skChamferCorner(sk,idA,idB,d){
  // Chanfrein interactif : rogne les 2 lignes à d mm du coin, relie par un segment
  // + cote de longueur pilotée (éditable). Joint structurel par points partagés.
  const sc=skSharedCorner(sk,idA,idB);
  if(sc.error)return{ok:false,msg:sc.error};
  const P=sk.points,V=P[sc.pid];
  const Ao=P[sc.A.p1===sc.pid?sc.A.p2:sc.A.p1],Bo=P[sc.B.p1===sc.pid?sc.B.p2:sc.B.p1];
  if(!V||!Ao||!Bo)return{ok:false,msg:'Chanfrein : coin illisible.'};
  const lA=Math.hypot(Ao.x-V.x,Ao.y-V.y),lB=Math.hypot(Bo.x-V.x,Bo.y-V.y);
  if(!(Math.min(lA,lB)>1))return{ok:false,msg:'Chanfrein : segment trop court.'};
  const dd=Math.min(d,0.95*Math.min(lA,lB));
  const capped=dd<d-1e-9;
  const P1={x:V.x+(Ao.x-V.x)/lA*dd,y:V.y+(Ao.y-V.y)/lA*dd};
  const P2={x:V.x+(Bo.x-V.x)/lB*dd,y:V.y+(Bo.y-V.y)/lB*dd};
  skKeepOverallDims(sk,[sc.A.id,sc.B.id]); // cotes hors-tout conservées
  skKeepVirtualSharp(sk,sc.pid,sc.A.id,sc.B.id);
  const idP1=addPoint(sk,P1.x,P1.y),idP2=addPoint(sk,P2.x,P2.y);
  if(sc.A.p1===sc.pid)sc.A.p1=idP1;else sc.A.p2=idP1;
  if(sc.B.p1===sc.pid)sc.B.p1=idP2;else sc.B.p2=idP2;
  const segId=skNewEid(sk);
  sk.entities.push({id:segId,t:'line',p1:idP1,p2:idP2});
  sk.dims.push({id:skNewEid(sk),type:'length',line:segId,value:+Math.hypot(P2.x-P1.x,P2.y-P1.y).toFixed(3),ox:0,oy:0});
  return{ok:true,segId,msg:'Chanfrein '+dd.toFixed(2)+' mm'+(capped?' (plafonné au segment)':'')};
}
function skApplyFilletSel(){
  // Depuis le menu contextuel : 2 lignes sélectionnées → congé au rayon courant.
  if(!skEdit)return;const sk=skEdit;
  // 2026-10-16-002 : 2 lignes OU plus (tous leurs coins communs) — UNE cote R pilote tous les congés
  const ls=skSelectedEnts().filter(e=>e.t==='line'&&!e.construction);
  const pairs=[];for(let i=0;i<ls.length;i++)for(let j=i+1;j<ls.length;j++){const a=ls[i],b=ls[j];if(a.p1===b.p1||a.p1===b.p2||a.p2===b.p1||a.p2===b.p2)pairs.push([a,b]);}
  if(!pairs.length){skStatus('Congé : sélectionnez des lignes qui forment un coin (2 ou plus).');return;}
  skPushUndo();
  const minL=Math.min(...ls.map(l=>lineLen(sk,l)));
  const R=Math.min(skFilletR,skNiceVal(0.2*minL)); // proportionné
  skFilletSess=null;let n=0,last=null;
  pairs.forEach(([a,b])=>{const r=skFilletCorner(sk,a.id,b.id,R);if(r.ok){skCornerLink(sk,true,r);n++;}last=r;});
  skFilletSess=null;
  if(!n){skUndoStack.pop();skUndoBtn();skStatus(last&&last.msg||'Congé impossible.');drawSketch2D();return;}
  afterEdit();skStatus(n+' congé(s) R'+R+' — une seule cote pilote (double-clic pour la modifier).');
}
function skApplyChamferSel(){
  // Depuis le menu contextuel : 2 lignes sélectionnées → chanfrein au retrait courant.
  if(!skEdit)return;const sk=skEdit;
  const ls=skSelectedEnts().filter(e=>e.t==='line');
  if(ls.length!==2){skStatus('Chanfrein : sélectionnez exactement 2 lignes.');return;}
  skPushUndo();
  const r=skChamferCorner(sk,ls[0].id,ls[1].id,Math.min(skChamferD,skNiceVal(0.2*Math.min(lineLen(sk,ls[0]),lineLen(sk,ls[1]))))); // proportionné
  if(!r.ok){skUndoStack.pop();skUndoBtn();skStatus(r.msg);drawSketch2D();return;}
  afterEdit();skStatus(r.msg+' — retrait modifiable (double-clic la cote).');
}
function segSegHit(a,b,c,d){
  const o=(p,q,r)=>Math.sign((q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x));
  const o1=o(a,b,c),o2=o(a,b,d),o3=o(c,d,a),o4=o(c,d,b);
  if(o1!==o2&&o3!==o4)return true;
  const on=(p,q,r)=>p.x<=Math.max(q.x,r.x)&&p.x>=Math.min(q.x,r.x)&&p.y<=Math.max(q.y,r.y)&&p.y>=Math.min(q.y,r.y);
  if(o1===0&&on(c,a,b))return true;if(o2===0&&on(d,a,b))return true;
  if(o3===0&&on(a,c,d))return true;if(o4===0&&on(b,c,d))return true;
  return false;
}
function skLeftNormal(A,B){const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy)||1e-9;return{x:-dy/L,y:dx/L};}
function segInter(P1,P2,P3,P4){
  const dx1=P2.x-P1.x,dy1=P2.y-P1.y,dx2=P4.x-P3.x,dy2=P4.y-P3.y;
  const den=dx1*dy2-dy1*dx2;
  if(Math.abs(den)<1e-12)return null;
  const t=((P3.x-P1.x)*dy2-(P3.y-P1.y)*dx2)/den;
  return{x:P1.x+dx1*t,y:P1.y+dy1*t};
}
function lineCircleInt(P,D,C,r){
  const fx=P.x-C.x,fy=P.y-C.y;
  const b=fx*D.x+fy*D.y,cc=fx*fx+fy*fy-r*r,disc=b*b-cc;
  if(disc<-1e-9)return[];
  const s=Math.sqrt(Math.max(disc,0));
  return[{x:P.x+D.x*(-b+s),y:P.y+D.y*(-b+s)},{x:P.x+D.x*(-b-s),y:P.y+D.y*(-b-s)}];
}
function circleCircleInt(C0,r0,C1,r1){
  const dx=C1.x-C0.x,dy=C1.y-C0.y,d=Math.hypot(dx,dy);
  if(!(d>1e-9)||d>r0+r1+1e-9||d<Math.abs(r0-r1)-1e-9)return[];
  const a=(r0*r0-r1*r1+d*d)/(2*d),h=Math.sqrt(Math.max(r0*r0-a*a,0));
  const xm=C0.x+dx*a/d,ym=C0.y+dy*a/d;
  return[{x:xm-dy*h/d,y:ym+dx*h/d},{x:xm+dy*h/d,y:ym-dx*h/d}];
}
function skEdgeEnds(e,fwd){
  if(e.t==='line')return fwd?[e.p1,e.p2]:[e.p2,e.p1];
  return fwd?[e.pa,e.pb]:[e.pb,e.pa];
}
function skOffsetChains(sk,ids){
  const set=new Set(ids);
  const ends=e=>e.t==='line'?[e.p1,e.p2]:(e.t==='arc'?[e.pa,e.pb]:[]);
  const cand=(sk.entities||[]).filter(e=>set.has(e.id)&&(e.t==='line'||e.t==='arc')&&!e.ref);
  const used=new Set(),chains=[];
  const hit=(e,p)=>ends(e).some(q=>skJointSame(sk,q,p)); // joint par pid fusionné, contrainte coincident OU superposition géométrique
  while(true){
    const start=cand.find(e=>!used.has(e.id));
    if(!start)break;
    const deg=p=>cand.filter(e=>!used.has(e.id)&&hit(e,p)).length;
    const[ss1,ss2]=ends(start);
    let entry=deg(ss1)<=1?ss1:ss2;
    const order=[{e:start,fwd:ends(start)[0]===entry}];
    used.add(start.id);
    let exit=ends(start)[order[0].fwd?1:0],closed=false;
    while(true){
      const nx=cand.find(e=>!used.has(e.id)&&hit(e,exit));
      if(!nx)break;
      const fwd=skJointSame(sk,ends(nx)[0],exit);
      order.push({e:nx,fwd});used.add(nx.id);
      exit=ends(nx)[fwd?1:0];
      if(skJointSame(sk,exit,entry)){closed=true;break;}
    }
    chains.push({order,closed});
  }
  return chains;
}
function skOffsetDistToSel(sk,ents,S){
  let best=1e9;const P=sk.points;
  ents.forEach(e=>{
    if(e.t==='line'){const A=P[e.p1],B=P[e.p2];if(A&&B)best=Math.min(best,distSeg(S.x,S.y,A,B));}
    else if(e.t==='circle'||e.t==='arc'){const C=P[e.pc];if(C&&e.r>0)best=Math.min(best,Math.abs(Math.hypot(S.x-C.x,S.y-C.y)-e.r));}
  });
  return best;
}
function skOffsetApply(sk,ids,D,S){
  ids=[...new Set(ids||[])];
  if(!(D>=0.001))return{ok:false,msg:'Décalage : distance ≥ 0,001 mm requise.'};
  const P=sk.points;
  const ents=ids.map(id=>entById(sk,id)).filter(e=>e&&(e.t==='line'||e.t==='circle'||e.t==='arc')&&!e.ref);
  if(!ents.length)return{ok:false,msg:'Décalage : sélectionnez lignes, cercles ou arcs.'};
  const chains=skOffsetChains(sk,ents.map(e=>e.id));
  const solo=ents.filter(e=>e.t==='circle');
  const cons0=(sk.constraints||[]).slice(),srcToCopy=new Map(); // V0.11.25 : contraintes de la source à recopier entre les copies
  const copies=[];let jointsBad=0,doneChains=0;
  const near=(pts,C)=>{let b=null,bd=1e9;pts.forEach(p=>{const d=Math.hypot(p.x-C.x,p.y-C.y);if(d<bd){bd=d;b=p;}});return b;};
  const offLine=(A,B,s)=>{const n=skLeftNormal(A,B);return[{x:A.x+s*D*n.x,y:A.y+s*D*n.y},{x:B.x+s*D*n.x,y:B.y+s*D*n.y}];};
  for(const ch of chains){
    const n=ch.order.length;
    let s=1,order=ch.order;
    const entryPid=skEdgeEnds(order[0].e,order[0].fwd)[0];
    if(ch.closed){
      const ring=ch.order.map(o=>{const[_,b]=skEdgeEnds(o.e,o.fwd);const q=P[b];return q?[q.x,q.y]:null;}).filter(Boolean);
      const area=ring.reduce((a,p,i)=>a+(p[0]*ring[(i+1)%ring.length][1]-ring[(i+1)%ring.length][0]*p[1]),0)/2;
      const inside=S?pip([S.x,S.y],ring):false;
      const ext=S?!inside:true;
      s=((area>0)===(ext?false:true))?1:-1;
    }else if(S){
      const e1=order[0].e,[pA,pB]=skEdgeEnds(e1,order[0].fwd);
      const U=P[pA],W=P[pB];
      if(U&&W){
        const cr=(W.x-U.x)*(S.y-U.y)-(W.y-U.y)*(S.x-U.x);
        if(cr<0)order=[...order].reverse().map(o=>({e:o.e,fwd:!o.fwd}));
      }
      s=1;
    }
    const jInfo=order.map((o,i)=>{ // joint : pid fusionné (forced=false) OU contrainte coincident (forced=true)
      if(i===n-1&&!ch.closed)return null;
      const nx=order[(i+1)%n];
      const la=skEdgeEnds(o.e,o.fwd),lb=skEdgeEnds(nx.e,nx.fwd);
      for(const p of la)for(const q of lb)if(p===q)return{pid:p,forced:false};
      for(const p of la)for(const q of lb)if(skSameEnd(sk,p,q))return{pid:p,forced:true};
      if(skJointSame(sk,la[1],lb[0]))return{pid:la[1],forced:false}; // jonction géométrique (projection) : C0 = extrémité sortante de la source, UN seul pid partagé sur les copies (fusion structurelle)
      return null;});
    const offLine=(A,B,s)=>{const n=skLeftNormal(A,B);return[{x:A.x+s*D*n.x,y:A.y+s*D*n.y},{x:B.x+s*D*n.x,y:B.y+s*D*n.y}];};
    const offs=[];let bad=false;
    for(const o of order){
      const[aPid,bPid]=skEdgeEnds(o.e,o.fwd);
      const A=P[aPid],B=P[bPid];
      if(!A||!B){bad=true;break;}
      if(o.e.t==='line'){const[Q1,Q2]=offLine(A,B,s);offs.push({o,A:Q1,B:Q2});}
      else{
        const C=P[o.e.pc];
        if(!C){bad=true;break;}
        const rr=o.e.r+s*D*(o.fwd?-1:1);
        if(!(rr>0.5)){bad=true;break;}
        offs.push({o,C:{x:C.x,y:C.y},r:rr});
      }
    }
    if(bad)continue;
    const newEnds=new Array(n);
    for(let i=0;i<n;i++){
      if(i===n-1&&!ch.closed)break;
      const nx=(i+1)%n,J0=jInfo[i],C0=J0?P[J0.pid]:null;
      const oi=offs[i],oj=offs[nx];
      let M=null;
      const lineOf=o=>{const d={x:o.B.x-o.A.x,y:o.B.y-o.A.y},L=Math.hypot(d.x,d.y)||1e-9;return{P:o.A,D:{x:d.x/L,y:d.y/L}};};
      if(oi.o.e.t==='line'&&oj.o.e.t==='line'){
        const a=lineOf(oi),b=lineOf(oj);
        M=segInter(a.P,{x:a.P.x+a.D.x,y:a.P.y+a.D.y},b.P,{x:b.P.x+b.D.x,y:b.P.y+b.D.y});
        if(!M&&C0){const n1=skLeftNormal(oi.A,oi.B);M={x:C0.x+s*D*n1.x,y:C0.y+s*D*n1.y};}
      }else if(oi.o.e.t==='line'||oj.o.e.t==='line'){
        const li=oi.o.e.t==='line'?oi:oj,ci=oi.o.e.t==='line'?oj:oi;
        const a=lineOf(li);
        M=near(lineCircleInt(a.P,a.D,ci.C,ci.r),C0||{x:0,y:0});
        if(!M&&C0){ // droite/cercle décalés disjoints (angle + gros décalage) → point commun approché, JAMAIS de trou
          const dx=li.B.x-li.A.x,dy=li.B.y-li.A.y,L=dx*dx+dy*dy||1e-12;
          const t=((C0.x-li.A.x)*dx+(C0.y-li.A.y)*dy)/L;
          const pL={x:li.A.x+dx*t,y:li.A.y+dy*t};
          const vx=C0.x-ci.C.x,vy=C0.y-ci.C.y,V=Math.hypot(vx,vy)||1e-12;
          const pC={x:ci.C.x+vx/V*ci.r,y:ci.C.y+vy/V*ci.r};
          M={x:(pL.x+pC.x)/2,y:(pL.y+pC.y)/2};
        }
      }else{
        M=near(circleCircleInt(oi.C,oi.r,oj.C,oj.r),C0||{x:0,y:0});
        if(!M&&C0){ // centres confondus (cercle dessiné en arcs concentriques) → les rayons décalés à l'angle du joint, JAMAIS de trou
          const vx=C0.x-oi.C.x,vy=C0.y-oi.C.y,V=Math.hypot(vx,vy)||1e-12;
          const p1={x:oi.C.x+vx/V*oi.r,y:oi.C.y+vy/V*oi.r};
          const p2={x:oj.C.x+vx/V*oj.r,y:oj.C.y+vy/V*oj.r};
          M={x:(p1.x+p2.x)/2,y:(p1.y+p2.y)/2};
        }
      }
      if(!M){jointsBad++;newEnds[i]={solo:true};continue;}
      if(J0&&J0.forced){ // source contrainte : deux points DISTINCTS au joint, liés par coincident
        newEnds[i]={pid:addPoint(sk,M.x,M.y),pid2:addPoint(sk,M.x,M.y),forced:true};
      }else{
        newEnds[i]={pid:addPoint(sk,M.x,M.y)};
      }
    }
    const copyIds=new Array(n),pairs=[]; // pairs : {a:source, b:copie, line} dans l'ordre de la chaîne
    for(let i=0;i<n;i++){
      const o=order[i],off=offs[i];
      const prevJ=ch.closed?newEnds[(i-1+n)%n]:(i===0?null:newEnds[i-1]);
      const nextJ=ch.closed?newEnds[i]:(i===n-1?null:newEnds[i]);
      const endFor=(side,endOff)=>{
        const J=side==='prev'?prevJ:nextJ;
        if(J&&J.pid){
          if(side==='prev'){
            // le côté « prev » porte le second point du couple : la contrainte
            // coincident de la source est recréée sur les copies (état identique)
            if(J.forced&&J.pid2&&!skHasCoincident(sk,J.pid,J.pid2))
              sk.constraints.push({id:skNewEid(sk),type:'coincident',a:J.pid,b:J.pid2});
            return J.pid2||J.pid;
          }
          return J.pid;
        }
        return addPoint(sk,endOff.x,endOff.y);
      };
      if(o.e.t==='line'){
        const p1=endFor('prev',off.A),p2=endFor('next',off.B);
        const nid=skNewEid(sk);
        const cp={id:nid,t:'line',p1,p2};if(o.e.construction)cp.construction=true;
        sk.entities.push(cp);
        if(!skHasParallel(sk,o.e.id,nid))sk.constraints.push({id:skNewEid(sk),type:'parallel',a:o.e.id,b:nid});
        pairs.push({a:o.e.id,b:nid,line:true});
        copies.push(nid);
        copyIds[i]=nid;
      }else{
        const pA=endFor('prev',{x:off.C.x,y:off.C.y}),pB=endFor('next',{x:off.C.x,y:off.C.y});
        const angOf=pt=>Math.atan2(pt.y-off.C.y,pt.x-off.C.x);
        const soloPrev=!prevJ||!prevJ.pid,soloNext=!nextJ||!nextJ.pid;
        if(soloPrev||soloNext){
          const A0=P[skEdgeEnds(o.e,o.fwd)[0]],B0=P[skEdgeEnds(o.e,o.fwd)[1]];
          const C0c=off.C;
          const put=(wantPid,ref)=>{
            const a=angOf(ref);
            const q={x:C0c.x+off.r*Math.cos(a),y:C0c.y+off.r*Math.sin(a)};
            const ex=P[wantPid];if(ex){ex.x=q.x;ex.y=q.y;}
          };
          if(soloPrev&&A0)put(pA,A0);
          if(soloNext&&B0)put(pB,B0);
        }
        const nid=skNewEid(sk);
        // V0.11.25 : pA/pB suivent le sens de PARCOURS de la chaîne ; l'arc, lui, va
        // toujours de pa à pb dans le sens trigonométrique. Chaîne parcourue à l'envers
        // (fwd=false, cas normal d'une chaîne fermée) → sans échange, la copie faisait
        // le TOUR COMPLÉMENTAIRE (270° au lieu de 90° : quasi-cercles aux coins arrondis).
        const cp={id:nid,t:'arc',pc:o.e.pc,pa:o.fwd?pA:pB,pb:o.fwd?pB:pA,r:off.r};if(o.e.construction)cp.construction=true;
        sk.entities.push(cp);
        pairs.push({a:o.e.id,b:nid,line:false});
        copies.push(nid);
        copyIds[i]=nid;
      }
    }
    // V0.11.25 : UNE cote par chaîne (entraxe sur la 1ʳᵉ paire ligne→copie ; rayon si la chaîne
    // n'a que des arcs). Les autres paires suivent par la contrainte « décalage égal » (offset) :
    // leur écart source→copie vaut celui de la paire cotée. Avant : une cote gap par ligne et une
    // cote radius par arc — autant de cotes à retoucher pour changer la distance du décalage.
    const refP=pairs.find(p=>p.line)||pairs[0];
    if(refP){
      if(refP.line)sk.dims.push({id:skNewEid(sk),type:'gap',a:refP.a,b:refP.b,value:+D.toFixed(3),ox:0,oy:0});
      else{const cpE=entById(sk,refP.b);sk.dims.push({id:skNewEid(sk),type:'radius',ent:refP.b,value:+(cpE?cpE.r:D).toFixed(3),ox:0,oy:0});}
      const sgnOf=p=>{const v=skOffsetVal(sk,p.a,p.b,1);return(v!=null&&v<0)?-1:1;};
      const sa=sgnOf(refP);
      pairs.forEach(p=>{if(p!==refP)sk.constraints.push({id:skNewEid(sk),type:'offset',a:refP.a,b:refP.b,c:p.a,d:p.b,sa,sb:sgnOf(p)});});
    }
    pairs.forEach(p=>srcToCopy.set(p.a,p.b));
    // Tangence de la source recréée entre les copies : si ligne et arc étaient
    // contraints tangents, leurs copies le sont aussi (le décalage préserve la
    // tangence géométriquement — la contrainte la maintient ensuite).
    for(let i=0;i<n;i++){
      if(!jInfo[i])continue;
      const ea=order[i].e,eb=order[(i+1)%n].e;
      if(!((ea.t==='line'&&eb.t==='arc')||(ea.t==='arc'&&eb.t==='line')))continue;
      const lid=(ea.t==='line')?copyIds[i]:copyIds[(i+1)%n];
      const eid=(ea.t==='arc')?copyIds[i]:copyIds[(i+1)%n];
      if(!lid||!eid)continue;
      if(skHasTangent(sk,ea.id,eb.id)&&!skHasTangent(sk,lid,eid))
        sk.constraints.push({id:skNewEid(sk),type:'tangent',line:lid,ent:eid});
    }
    doneChains++;
  }
  // V0.11.25 : contraintes de la source recopiées ENTRE les copies (─ │ ∥ ⟂ colinéaire) — la copie
  // garde sa forme sans cote supplémentaire (tangences et coïncidences : recréées plus haut).
  if(srcToCopy.size)cons0.forEach(c=>{
    if(!c)return;
    if((c.type==='h'||c.type==='v')&&srcToCopy.has(c.line)){const l=srcToCopy.get(c.line);if(!hasHV(sk,l,c.type))sk.constraints.push({id:skNewEid(sk),type:c.type,line:l});}
    else if((c.type==='parallel'||c.type==='perpendicular'||c.type==='collinear')&&srcToCopy.has(c.a)&&srcToCopy.has(c.b)){
      const a=srcToCopy.get(c.a),b=srcToCopy.get(c.b);
      if(!(sk.constraints||[]).some(k=>k.type===c.type&&((k.a===a&&k.b===b)||(k.a===b&&k.b===a))))sk.constraints.push({id:skNewEid(sk),type:c.type,a,b});
    }
  });
  for(const e of solo){
    const C=P[e.pc];if(!C)continue;
    let s=1;
    if(S)s=(Math.hypot(S.x-C.x,S.y-C.y)>=e.r)?1:-1;
    const rr=e.r+s*D;
    if(!(rr>0.5)){jointsBad++;continue;}
    const nid=skNewEid(sk);
    const cp={id:nid,t:'circle',pc:e.pc,r:rr};if(e.construction)cp.construction=true;
    sk.entities.push(cp);
    sk.dims.push({id:skNewEid(sk),type:'radius',ent:nid,value:+rr.toFixed(3),ox:0,oy:0});
    copies.push(nid);
  }
  if(!copies.length)return{ok:false,msg:'Décalage impossible (arcs trop petits ou joints non résolus).'};
  return{ok:true,copies,jointsBad,msg:'Décalage ±'+D.toFixed(2)+' mm : '+copies.length+' copiée(s)'+(doneChains>1?' en '+doneChains+' chaîne(s)':'')+(jointsBad?' — '+jointsBad+' joint(s) non raccordé(s)':'')+'.'};
}
function skBoxHits(box){
  const sk=skEdit,P=sk.points;
  const x0=Math.min(box.x0,box.x1),x1=Math.max(box.x0,box.x1),y0=Math.min(box.y0,box.y1),y1=Math.max(box.y0,box.y1);
  const fwd=box.x1>=box.x0; // gauche→droite : entièrement dedans · droite→gauche : croisé
  const inPt=(x,y)=>x>=x0&&x<=x1&&y>=y0&&y<=y1;
  const segIn=(a,b)=>{
    if(fwd)return inPt(a.x,a.y)&&inPt(b.x,b.y);
    if(inPt(a.x,a.y)||inPt(b.x,b.y))return true;
    const E=[[{x:x0,y:y0},{x:x1,y:y0}],[{x:x1,y:y0},{x:x1,y:y1}],[{x:x1,y:y1},{x:x0,y:y1}],[{x:x0,y:y1},{x:x0,y:y0}]];
    return E.some(e=>segSegHit(a,b,e[0],e[1]));
  };
  const hits=[];
  (sk.entities||[]).forEach(e=>{
    let sel=false;
    if(e.t==='line'){const A=P[e.p1],B=P[e.p2];if(A&&B)sel=segIn(A,B);}
    else if(e.t==='cpoint'){const Q=P[e.p];if(Q)sel=inPt(Q.x,Q.y);}
    else if(e.t==='spline'){const pl=skSplinePoly(sk,e,8)||[];
      sel=pl.length>1&&(fwd?pl.every(q=>inPt(q[0],q[1])):pl.some((q,i)=>i>0&&segIn({x:pl[i-1][0],y:pl[i-1][1]},{x:q[0],y:q[1]})));}
    else{const C=P[e.pc];if(C){
      if(fwd)sel=inPt(C.x,C.y);
      else sel=(C.x+e.r>=x0&&C.x-e.r<=x1&&C.y+e.r>=y0&&C.y-e.r<=y1);
      if(e.t==='arc'){const an=arcAngles(sk,e);
        if(an){const p1={x:C.x+e.r*Math.cos(an.a1),y:C.y+e.r*Math.sin(an.a1)},p2={x:C.x+e.r*Math.cos(an.a2),y:C.y+e.r*Math.sin(an.a2)};
          sel=sel||inPt(p1.x,p1.y)||inPt(p2.x,p2.y)||(fwd?false:segIn(p1,p2));}}
    }}
    if(sel)hits.push({kind:'ent',id:e.id});
  });
  Object.keys(skPts(sk)).forEach(pid=>{const p=P[pid];if(p&&inPt(p.x,p.y))hits.push({kind:'point',pid});});
  return hits;
}
function distSeg(px,py,A,B){const dx=B.x-A.x,dy=B.y-A.y,L2=dx*dx+dy*dy||1e-9;let t=((px-A.x)*dx+(py-A.y)*dy)/L2;t=Math.max(0,Math.min(1,t));return Math.hypot(px-(A.x+t*dx),py-(A.y+t*dy));}
function angInArc(a,a1,a2){const T=Math.PI*2;let d=(a2-a1)%T;if(d<0)d+=T;let r=(a-a1)%T;if(r<0)r+=T;return r<=d;}
function nearestEntity(sk,x,y,maxD,skipConstr){
  let best=null,bd=maxD;
  (sk.entities||[]).forEach(e=>{
    if(skipConstr&&e.construction)return; // outil Ajuster : la construction ne se coupe pas
    let d=1e9;const P=sk.points;
    if(e.t==='line'){const A=P[e.p1],B=P[e.p2];if(A&&B)d=distSeg(x,y,A,B);}
    if(e.t==='circle'){const C=P[e.pc];if(C)d=Math.abs(Math.hypot(x-C.x,y-C.y)-e.r);}
    if(e.t==='arc'){const C=P[e.pc];if(C){const an=arcAngles(sk,e);const dR=Math.abs(Math.hypot(x-C.x,y-C.y)-e.r);d=(an&&dR<maxD*1.5&&angInArc(Math.atan2(y-C.y,x-C.x),an.a1,an.a2))?dR:1e9;}}
    if(e.t==='cpoint'){const Q=P[e.p];if(Q)d=Math.hypot(x-Q.x,y-Q.y);}
    if(e.t==='spline'){const pl=skSplinePoly(sk,e);if(pl)d=skPolyDist(x,y,pl);}
    if(d<bd){bd=d;best=e;}
  });
  return best;
}
function nearestRef(sk,x,y,maxD){
  if(!sk||!sk._refs) return null;
  let best=null,bd=maxD;
  sk._refs.forEach((r,i)=>{
    const d=distSeg(x,y,{x:r.x1,y:r.y1},{x:r.x2,y:r.y2});
    if(d<bd){bd=d; best={ref:r, idx:i, x1:r.x1,y1:r.y1,x2:r.x2,y2:r.y2};}
  });
  return best;
}
function createRefLine(sk, ref){
  const id1=skNewPid(sk), id2=skNewPid(sk);
  sk.points[id1]={x:ref.x1,y:ref.y1}; sk.points[id2]={x:ref.x2,y:ref.y2};
  const eid=skNewEid(sk);
  sk.entities.push({id:eid,t:'line',p1:id1,p2:id2,ref:true});
  sk.constraints.push({id:skNewEid(sk),type:'fix',p:id1},{id:skNewEid(sk),type:'fix',p:id2});
  return eid;
}
