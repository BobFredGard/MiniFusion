/* ----- congés 3D (arêtes verticales) : sélection en 3D, insertion paramétrique dans l'esquisse ----- */
function chainNodesOf(chain){
  const nodes=[chain[0].from];
  chain.forEach(st=>{const ed=st.ed;nodes.push(ed.a===st.from?ed.b:ed.a);});
  return nodes;
}
function pip(pt,ring){
  let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1];
    if(((yi>pt[1])!==(yj>pt[1]))&&(pt[0]<(xj-xi)*(pt[1]-yi)/(yj-yi)+xi))inside=!inside;
  }
  return inside;
}
let filSeq=1;
function insertSketchFillet(data,fx,fy,r,fxPid){
  // fxPid (id de point d'esquisse) = nommage persistant : le coin suit les éditions.
  // Sans pid (anciens projets), repli sur la proximité 0.5 mm.
  const tr=skLoopTrace(data);
  for(const L of tr.loops){
    const ch=L.chain,nodes=chainNodesOf(ch),m=nodes.length-1;
    if(m<2)continue;
    for(let i=0;i<m;i++){
      const pid=nodes[i],V=data.points[pid];
      if(!V)continue;
      if(fxPid){if(pid!==fxPid)continue;}
      else if(Math.hypot(V.x-fx,V.y-fy)>0.5)continue;
      const pPrev=nodes[(i-1+m)%m],pNext=nodes[(i+1)%m];
      const eIn=ch[(i-1+m)%m].ed,eOut=ch[i].ed;
      if(eIn.kind!=='line'||eOut.kind!=='line')return{ok:false,warn:'coin sur arc : ignoré'};
      const A=data.points[pPrev],B=data.points[pNext];
      // Même math que l'outil interactif (filletCornerGeom, 50) : un seul calcul de coin.
      const g=filletCornerGeom(A,V,B,r);
      if(!g.ok)return{ok:false,warn:g.warn};
      const rEff=g.rEff;
      const T1x=g.T1.x,T1y=g.T1.y,T2x=g.T2.x,T2y=g.T2.y;
      const C1=[g.C1.x,g.C1.y],C2=[g.C2.x,g.C2.y];
      const rings=tr.loops.map(c2=>chainNodesOf(c2.chain).slice(0,-1).map(p=>{const q=data.points[p];return[q.x,q.y];}));
      const in1=rings.reduce((s,rg)=>s+(pip(C1,rg)?1:0),0)%2===1;
      const in2=rings.reduce((s,rg)=>s+(pip(C2,rg)?1:0),0)%2===1;
      const C=in1?C1:(in2?C2:null);
      if(!C)return{ok:false,warn:'côté matière indéterminé'};
      const idT1='fc'+(filSeq++)+'a',idT2='fc'+(filSeq++)+'b',idC='fc'+(filSeq++)+'c',idA='fc'+(filSeq++)+'e';
      data.points[idT1]={x:T1x,y:T1y};data.points[idT2]={x:T2x,y:T2y};data.points[idC]={x:C[0],y:C[1]};
      const entIn=eIn.e,entOut=eOut.e;
      if(entIn.p1===pid)entIn.p1=idT1;else entIn.p2=idT1;
      if(entOut.p1===pid)entOut.p1=idT2;else entOut.p2=idT2;
      // arcAngles() renvoie toujours le CCW pa→pb : on ordonne pa/pb pour que
      // cet intervalle soit le petit arc (<180°, celui qui fait face au coin).
      // Sinon, selon le sens de la boucle (CW/CCW), on obtenait le grand arc
      // complémentaire (270° au lieu de 90°) : le « filet à l'envers ».
      let pa=idT1,pb=idT2;
      {
        const b1=Math.atan2(T1y-C[1],T1x-C[0]),b2=Math.atan2(T2y-C[1],T2x-C[0]);
        let d=(b2-b1)%(Math.PI*2);if(d<=0)d+=Math.PI*2;
        if(d>Math.PI){pa=idT2;pb=idT1;}
      }
      data.entities.push({id:idA,t:'arc',pc:idC,pa,pb,r:rEff});
      return{ok:true,rApplied:rEff};
    }
  }
  return{ok:false,warn:'arête introuvable (esquisse modifiée ?)'};
}
 function applyFilletsToSketch(sk,fils){
   const clone={points:JSON.parse(JSON.stringify(sk.points||{})),entities:JSON.parse(JSON.stringify(sk.entities||[])),
     plane:sk.plane,origin:sk.origin?[sk.origin[0],sk.origin[1],sk.origin[2]]:[0,0,0],
     axU:sk.axU&&sk.axU.slice(),axV:sk.axV&&sk.axV.slice(),axN:sk.axN&&sk.axN.slice()};
   const warnings=[],done=[];
   for(const f of fils){
     if(!(f.radius>0)){warnings.push('Congé : rayon invalide, ignoré.');continue;}
     for(const c of (f.corners||[])){
       // Rebranchement : ancien projet sans pid, ou pid orphelin (point GC) →
       // rattache le coin au point d'esquisse le plus proche (suit les cotes ensuite).
       if(!c.pid||!sk.points[c.pid]){
         let best=null,bd=1e9;
         Object.keys(sk.points||{}).forEach(pid=>{const p=sk.points[pid];if(!p)return;
           const d=Math.hypot(p.x-c.x,p.y-c.y);if(d<bd){bd=d;best=pid;}});
         if(best)c.pid=best;
       }
       if(c.pid&&done.some(a=>a.pid===c.pid))continue;
       if(!c.pid&&done.some(a=>Math.hypot(a.x-c.x,a.y-c.y)<0.5))continue;
       const res=insertSketchFillet(clone,c.x,c.y,f.radius,c.pid);
       if(res.ok){
         done.push({x:c.x,y:c.y,pid:c.pid,rApplied:res.rApplied||f.radius});
         if(res.rApplied&&res.rApplied<f.radius-1e-6)warnings.push('Congé R'+f.radius+' → R'+res.rApplied.toFixed(2)+' en ('+c.x+', '+c.y+') : rayon plafonné (coin presque tangent)');
       } else warnings.push('Congé R'+f.radius+' en ('+c.x+', '+c.y+') : '+res.warn);
     }
   }
   return{sk:clone,warnings,applied:done.length,radii:done};
 }
/* ================= noyau exact OCCT : prismes BRep + booléens + tessellation =================
   Validé par exécution : MakeEdge_3/ gp_Circ_2+MakeEdge_10 / MakeWire_1 / MakeFace_15 /
   MakePrism_1 / Fuse_3 / Cut_3 / MakeFillet+Add_2 / IncrementalMesh_2 / Triangulation. */
function occHas(){return occtReady&&occt;}
function occBinPush(bin,h){if(h)bin.push(h);return h;}
function occDispose(list){(list||[]).forEach(h=>{try{h.delete();}catch(e){}});}
function occW(sk,x,y){ // sketch 2D -> monde
  const{u,v,n,o}=sketchBasis(sk);
  return[o.x+u.x*x+v.x*y,o.y+u.y*x+v.y*y,o.z+u.z*x+v.z*y];
}
function occWireFromChain(sk,tr,chain,bin,z0){
  // Construit un TopoDS_Wire fermé en coords monde depuis une chaîne skLoopTrace.
  // Sens préservé (arcs CW via .Reversed()). Jette une Error en cas d'échec.
  // z0 = décalage du plan de construction le long de n (prisme décalé : plage [lo,hi]).
  const TAU=Math.PI*2,norm=t=>((t%TAU)+TAU)%TAU;
  const{u,v,n}=sketchBasis(sk);
  const dz=z0||0;
  const OP=w=>dz?[w[0]+n.x*dz,w[1]+n.y*dz,w[2]+n.z*dz]:w;
  const dir=occBinPush(bin,new occt.gp_Dir_4(n.x,n.y,n.z));
  const PW=(x,y)=>{const w=OP(occW(sk,x,y));return occBinPush(bin,new occt.gp_Pnt_3(w[0],w[1],w[2]));};
  const mkW=occBinPush(bin,new occt.BRepBuilderAPI_MakeWire_1());
  const nodes=chainNodesOf(chain);
  const projOnCirc=(Cw,r,a)=>{const w=OP(occW(sk,Cw.x+r*Math.cos(a),Cw.y+r*Math.sin(a)));return occBinPush(bin,new occt.gp_Pnt_3(w[0],w[1],w[2]));};
  for(let i=0;i<nodes.length-1;i++){
    const st=chain[i],ed=st.ed;
    const toId=(ed.a===st.from)?ed.b:ed.a;
    if(ed.kind==='line'){
      const A=tr.pts[st.from],B=tr.pts[toId];
      if(!A||!B)throw new Error('ligne incomplète');
      const me=occBinPush(bin,new occt.BRepBuilderAPI_MakeEdge_3(PW(A.x,A.y),PW(B.x,B.y)));
      me.Build();if(!me.IsDone())throw new Error('arête ligne impossible');
      mkW.Add_1(me.Edge());
    }else{
      const a=ed.e,Cc=tr.pts[a.pc];
      const an=arcAngles(sk,a);if(!an||!Cc)throw new Error('arc invalide');
      const Cw=OP(occW(sk,Cc.x,Cc.y));
      const ax=occBinPush(bin,new occt.gp_Ax2_3(occBinPush(bin,new occt.gp_Pnt_3(Cw[0],Cw[1],Cw[2])),dir));
      const circ=occBinPush(bin,new occt.gp_Circ_2(ax,a.r));
      const Pf=tr.pts[st.from],Pt=tr.pts[toId];
      const aF=Math.atan2(Pf.y-Cc.y,Pf.x-Cc.x),aT=Math.atan2(Pt.y-Cc.y,Pt.x-Cc.x);
      const dEnt=an.a2-an.a1;
      if(Math.abs(dEnt-TAU)<1e-6){ // cercle complet porté par un arc : 2 moitiés
        const P0=projOnCirc(Cc,a.r,0),P1=projOnCirc(Cc,a.r,Math.PI);
        const m1=occBinPush(bin,new occt.BRepBuilderAPI_MakeEdge_10(circ,P0,P1));m1.Build();
        const m2=occBinPush(bin,new occt.BRepBuilderAPI_MakeEdge_10(circ,P1,P0));m2.Build();
        if(!m1.IsDone()||!m2.IsDone())throw new Error('cercle complet impossible');
        mkW.Add_1(m1.Edge());mkW.Add_1(m2.Edge());
        continue;
      }
      // Sens réel : le départ coïncide-t-il avec a1 (sens CCW de l'entité) ou a2 (retour CW) ?
      // (Comparer des distances seules est ambigu pour les demi-cercles : π dans les 2 sens.)
      const dA1=Math.min(norm(aF-an.a1),TAU-norm(aF-an.a1));
      const dA2=Math.min(norm(aF-(an.a2-TAU)),TAU-norm(aF-(an.a2-TAU)));
      let ccw=dA1<=dA2;
      let P1,P2,rev=false;
      if(ccw){P1=projOnCirc(Cc,a.r,aF);P2=projOnCirc(Cc,a.r,aT);}
      else{P1=projOnCirc(Cc,a.r,aT);P2=projOnCirc(Cc,a.r,aF);rev=true;}
      const me=occBinPush(bin,new occt.BRepBuilderAPI_MakeEdge_10(circ,P1,P2));
      me.Build();if(!me.IsDone())throw new Error('arête arc impossible');
      // Note : .Reversed() rend un TopoDS_Shape -> recast obligatoire en TopoDS_Edge.
      let e=me.Edge();if(rev)e=occt.TopoDS.Edge_1(e.Reversed());
      mkW.Add_1(e);
    }
  }
  mkW.Build();if(!mkW.IsDone())throw new Error('contour non fermé (wire)');
  return mkW.Wire();
}
function occPrismOfChain(sk,tr,chain,distance,area,z0){
  // Face plane au plan z0 (contour CCW autour de +n) puis prisme de longueur distance
  // vers +n : distance>0 toujours (la plage [lo,hi] est gérée par z0=lo, longueur hi-lo).
  const bin=[];
  try{
    let w=occWireFromChain(sk,tr,chain,bin,z0);
    if(area<0)w=occt.TopoDS.Wire_1(w.Reversed());
    const fm=occBinPush(bin,new occt.BRepBuilderAPI_MakeFace_15(w,true));
    fm.Build();if(!fm.IsDone())throw new Error('face impossible');
    const{u,v,n}=sketchBasis(sk);
    const vec=occBinPush(bin,new occt.gp_Vec_4(n.x*distance,n.y*distance,n.z*distance));
    const pr=occBinPush(bin,new occt.BRepPrimAPI_MakePrism_1(fm.Face(),vec,false,true));
    pr.Build();if(!pr.IsDone())throw new Error('prisme impossible');
    const s=pr.Shape();
    try{w.delete();}catch(e){}
    return{shape:s,bin};
  }catch(err){occDispose(bin);throw err;}
}
function extrudeSpan(f){
  // Plage [lo,hi] le long de la normale d'esquisse (0 = plan). f.mid = symétrique/miroir
  // (distance = course TOTALE, prisme de -|d|/2 à +|d|/2) ; sinon distance signée classique.
  // far = sens de la flèche d'extrusion (1 = +n). Toute la géométrie (prismes, rims,
  // plans d'ancrage, hôtes de faces) passe par cette fonction.
  // A travers tout : l'outil ne couvre QUE l'étendue réelle du solide projetée sur l'axe
  // (pas tout l'espace) — repli sur une grande course si aucun solide n'est encore résolu.
  const THROUGH=1e4;
  if(f&&f.through){
    let r=null;
    if(f.sketchId){
      const sk=doc.sketches.find(s=>s.id===f.sketchId);
      if(sk){try{const B=sketchBasis(sk);r=throughPartRange(B);}catch(e){}}
    }
    if(r)return{lo:r.lo,hi:r.hi,far:1};
    const h=THROUGH/2;
    // unres : aucun solide disponible pour mesurer l'étendue réelle — les appelants qui
    // ANCRENT une géométrie (hôtes de faces) doivent alors NE PAS bouger (sinon l'origine
    // part à ±5000mm et le rejeu suivant la « répare » → rejeu imbriqué inutile).
    return{lo:-h,hi:h,far:1,unres:true};
  }
  const raw=(f&&f.distance!==undefined&&f.distance!==null&&isFinite(+f.distance))?+f.distance:10;
  if(f&&f.mid){const h=Math.abs(raw)/2;return{lo:-h,hi:h,far:raw<0?-1:1};}
  return{lo:Math.min(0,raw),hi:Math.max(0,raw),far:raw<0?-1:1};
}
let lastSolidBodies=[];
// Solide déjà reconstruit dans le rejeu EN COURS (voie exacte) : c'est la seule référence
// fide��le. Avant, l'étendue était mesurée sur les corps AFFICHÉS, c'est-à-dire ceux de
// l'ÉDITION PRÉCÉDENTE : après avoir changé la hauteur d'une base, l'outil d'une découpe
// « à travers tout » se retrouvait hors du solide et la découpe disparaissait (il fallait
// alors un « Hard » pour revenir — le réservoir vidé et le repli s activait).
let occThroughBase=null;
function occSpanFromShape(shape,B){
  // Boîte englobante du solide exact projetée sur l'axe de l'esquisse.
  if(!shape||!B)return null;
  try{
    const box=new occt.Bnd_Box_1();
    occt.BRepBndLib.Add(shape,box,true);
    const a=box.CornerMin(),b=box.CornerMax();
    const corners=[[a.X(),a.Y(),a.Z()],[b.X(),b.Y(),b.Z()]];
    let mn=Infinity,mx=-Infinity;
    for(const c of corners){
      const d=(c[0]-B.o.x)*B.n.x+(c[1]-B.o.y)*B.n.y+(c[2]-B.o.z)*B.n.z;
      if(d<mn)mn=d;if(d>mx)mx=d;
    }
    if(!(mx>mn&&isFinite(mn)&&isFinite(mx)))return null;
    const m=Math.max(1,(mx-mn)*0.01);
    return{lo:mn-m,hi:mx+m};
  }catch(e){return null;}
}
function throughPartRange(B){
  // Projection de la pièce sur l'axe de l'esquisse : le prisme « à travers tout » s'arrête
  // aux limites réelles du solide (+marge), il ne traverse plus tout l'espace disponible.
  // Corps affichés courants, puis corps du dernier rebuild réussi (les anciens meshes ne
  // sont libérés qu'après le commit du nouveau — leur lecture reste sûre pendant la
  // construction de la géométrie où bodies vient d'être vidé).
  if(!B)return null;
  // 1) le solide du rejeu en cours (fideèle, sans historique)
  const live=occSpanFromShape(occThroughBase,B);
  if(live)return live;
  // 2) repli : les corps affichés (repli du moteur maillage, sans BRep disponible)
  const pool=bodies&&bodies.length?bodies:lastSolidBodies;
  let mn=Infinity,mx=-Infinity;
  for(const b of pool){
    if(b.ghost||!b.mesh||!b.mesh.geometry)continue;
    const pos=b.mesh.geometry.attributes&&b.mesh.geometry.attributes.position;
    if(!pos||pos.count<3)continue;
    try{b.mesh.updateMatrixWorld();}catch(e){}
    const m=b.mesh.matrixWorld,e=m&&m.elements||null;
    for(let i=0;i<pos.count;i++){
      const vx=pos.getX(i),vy=pos.getY(i),vz=pos.getZ(i);
      let wx=vx,wy=vy,wz=vz;
      if(e){
        wx=e[12]+e[0]*vx+e[4]*vy+e[8]*vz;
        wy=e[13]+e[1]*vx+e[5]*vy+e[9]*vz;
        wz=e[14]+e[2]*vx+e[6]*vy+e[10]*vz;
      }
      const d=(wx-B.o.x)*B.n.x+(wy-B.o.y)*B.n.y+(wz-B.o.z)*B.n.z;
      if(d<mn)mn=d;if(d>mx)mx=d;
    }
  }
  if(!(mx>mn&&isFinite(mn)&&isFinite(mx)))return null;
  const m=Math.max(1,(mx-mn)*0.01);
  return{lo:mn-m,hi:mx+m};
}
function occSpanPrism(sk,tr,chain,sp,area){
  // Prisme UNIQUE sur la plage {lo,hi} : face construite au plan décalé z0=lo le long de n,
  // puis un seul prisme de longueur hi-lo vers +n. Pas de fusion de deux prismes → aucune
  // couture coplanaire au plan médian : en Extrusion Miroir chaque face verticale reste
  // UNE face (comme en un seul côté), et le trou/découpe en plage couvrante aussi.
  const len=sp.hi-sp.lo;
  if(!(len>1e-9))throw new Error('prisme vide (course nulle)');
  return occPrismOfChain(sk,tr,chain,len,area,sp.lo);
}
function occFuse(a,b){
  const f=new occt.BRepAlgoAPI_Fuse_3(a,b);
  f.Build();const ok=f.IsDone();const s=ok?f.Shape():null;
  try{f.delete();}catch(e){}
  if(!ok||!s)throw new Error('fusion impossible');
  return s;
}
function occCut(a,b){
  const c=new occt.BRepAlgoAPI_Cut_3(a,b);
  c.Build();const ok=c.IsDone();const s=ok?c.Shape():null;
  try{c.delete();}catch(e){}
  if(!ok||!s)throw new Error('découpe impossible');
  return s;
}
function occUnify(s){
  // Uniformise une fusion additive (ShapeUpgrade_UnifySameDomain) : les faces coplanaires
  // voisines sont recollées → plus de couture horizontale quand un solide est "Uni" par
  // l'option Additif (empilement de deux fonctions, pastilles jointives…). Idempotent,
  // n'efface les arêtes réelles que si elles sont superflues, jamais d'exception :
  // en cas d'échec la shape d'origine est rendue telle quelle. Sa propre shape (s) est
  // supprimée si l'unification en produit une nouvelle.
  if(!s||!occtReady||!occt||!occt.ShapeUpgrade_UnifySameDomain_2)return s;
  let u=null;
  try{
    u=new occt.ShapeUpgrade_UnifySameDomain_2(s,true,true,false);
    u.Build();
    const r=u.Shape();
    if(r&&r!==s){try{s.delete();}catch(e){}return r;}
    return s;
  }catch(e){
    return s;
  }finally{
    try{if(u)u.delete();}catch(e){}
  }
}

// ---------- Coque (évidage paroi mince) ----------
// Évider = creuser le solide en ne gardant qu'une PAROI d'épaisseur donnée, en
// retirant les faces d'ouverture (ex. le dessus d'une boîte → un bac ouvert).
// Noyau : BRepOffsetAPI_MakeThickSolid(S, facesARetirer, -épaisseur, tol, …).
// L'ancienne version utilisait BRepBuilderAPI_MakeShell — qui assemble une coque
// à partir de FACES, pas la conversion solide→évidé : son ctor exigeait 2 params
// (« invalid number of parameters (1) ») et l'opération n'avait aucun sens ici.
function shellName(f){
  const t=String(Math.round((+f.thick||0)*100)/100).replace('.',',');
  return `Coque ${t} mm · ${(f.faces||[]).length} face(s) retirée(s)`;
}
function occCoqueOnce(result,faces,thick){
  // `faces` = handles OCCT déjà résolus (pas de refs durables ici), `thick` > 0 en
  // mm. Retourne {shape} — l'appelant libère `faces`, jamais le contraire.
  const bin=[];
  try{
    const L=occBinPush(bin,new occt.TopTools_ListOfShape_1());
    for(const f of faces)L.Append_1(occBinPush(bin,occt.TopoDS.Face_1(f)));
    const Arc=occt.GeomAbs_JoinType.GeomAbs_Arc;
    const mk=occBinPush(bin,new occt.BRepOffsetAPI_MakeThickSolid_2(
      result,L,-Math.abs(thick),0.01,Arc,false,false,Arc,false));
    mk.Build();
    let done=false;
    try{done=!!mk.IsDone();}catch(e){}
    if(!done)throw new Error('évidage refusé par le moteur (paroi trop épaisse ? ouverture mal placée ?)');
    const out=occShapeCopy(mk.Shape());
    if(!out||out.IsNull())throw new Error('solide évidé vide');
    return {shape:out};
  }finally{occDispose(bin);}
}
function occApplyCoque(result,f){
  // Rejoue l'évidage. Retourne {shape,warnings} comme occApplyDraft/occApplyMoveFace.
  // Les refs durables `f.faces` ne sont JAMAIS écrasées (même règle que le
  // dépouillage : des handles dans le document casseraient les rejeux suivants).
  const warnings=[];
  const t=+f.thick||0;
  if(!(t>1e-9))return{shape:result,warnings:['épaisseur nulle — aucune coque']};
  if(!(f.faces||[]).length)return{shape:result,warnings:['aucune face à retirer (ouverture) — la coque resterait fermée et invisible']};
  const total=(f.faces||[]).length;
  const got=(f.faces||[]).map(fr=>{try{return occFindFace(result,fr)||null;}catch(e){return null;}}).filter(Boolean);
  const miss=total-got.length;
  if(!got.length){
    f._m={m:0,t:total};
    return{shape:result,warnings:[`aucune des ${total} face(s) à retirer n'est retrouvée — la pièce a changé`]};
  }
  if(miss)warnings.push(`${miss} face(s) à retirer introuvable(s) sur la pièce courante`);
  f._m={m:got.length,t:total};
  const run=list=>{
    if(!list.length)throw new Error('aucune face retrouvable');
    return occCoqueOnce(result,list,t);
  };
  const dropShape=s=>{try{if(s&&s.shape)s.shape.delete();}catch(e){}};
  let r=null,echec=null;
  try{r=run(got);}catch(e){echec=e;}
  if(!r){
    // Isolation : comme le dépouillage, on cherche quelles faces le moteur refuse.
    const garde=[];
    for(const h of got){
      try{const tst=run(garde.concat([h]));dropShape(tst);garde.push(h);}catch(e2){/* écartée */}
    }
    if(!garde.length){
      got.forEach(g=>{try{g.delete();}catch(e){}});
      const m=echec&&echec.message||echec;
      return{shape:result,warnings:[`coque impossible — ${m}. Essayez une paroi plus fine ou une autre face d'ouverture.`],fatal:true};
    }
    r=run(garde);
    f._m={m:garde.length,t:total};
    warnings.push(`coque partielle : ${garde.length}/${total} face(s) retirée(s), `+
      `${total-garde.length} écartée(s) par le moteur`);
  }
  try{
    const s=r.shape;
    let out=s;
    try{out=occUnify(s);}catch(e){}
    if(out!==s){try{s.delete();}catch(e){}}
    got.forEach(g=>{try{g.delete();}catch(e){}});
    try{result.delete();}catch(e){}
    return{shape:out,warnings};
  }catch(e){
    got.forEach(g=>{try{g.delete();}catch(e2){}});
    return{shape:result,warnings:[`coque impossible (${(e&&e.message)||e})`],fatal:true};
  }
}
function occDiskPrism(sk,Cx,Cy,r,sp){
  // Pastille pleine (cercles isolés) : 2 demi-arcs -> wire -> face -> UN prisme.
  // sp = plage {lo,hi} (ou nombre pour compat) : cercle construit au plan décalé z0=lo,
  // prisme unique de longueur hi-lo → même plage que les contours, sans couture coplanaire.
  const bin=[];
  try{
    const lo=(sp&&typeof sp==='object')?sp.lo:Math.min(0,+sp||0);
    const hi=(sp&&typeof sp==='object')?sp.hi:Math.max(0,+sp||0);
    const len=hi-lo;
    if(!(len>1e-9))throw new Error('prisme pastille vide (course nulle)');
    const{u,v,n}=sketchBasis(sk);
    const OP=w=>lo?[w[0]+n.x*lo,w[1]+n.y*lo,w[2]+n.z*lo]:w;
    const Cw=OP(occW(sk,Cx,Cy));
    const dir=occBinPush(bin,new occt.gp_Dir_4(n.x,n.y,n.z));
    const ax=occBinPush(bin,new occt.gp_Ax2_3(occBinPush(bin,new occt.gp_Pnt_3(Cw[0],Cw[1],Cw[2])),dir));
    const circ=occBinPush(bin,new occt.gp_Circ_2(ax,r));
    const P0=occBinPush(bin,new occt.gp_Pnt_3(...OP(occW(sk,Cx+r,Cy)))),P1=occBinPush(bin,new occt.gp_Pnt_3(...OP(occW(sk,Cx-r,Cy))));
    const mkW=occBinPush(bin,new occt.BRepBuilderAPI_MakeWire_1());
    const m1=occBinPush(bin,new occt.BRepBuilderAPI_MakeEdge_10(circ,P0,P1));m1.Build();
    const m2=occBinPush(bin,new occt.BRepBuilderAPI_MakeEdge_10(circ,P1,P0));m2.Build();
    if(!m1.IsDone()||!m2.IsDone())throw new Error('pastille impossible');
    mkW.Add_1(m1.Edge());mkW.Add_1(m2.Edge());mkW.Build();
    if(!mkW.IsDone())throw new Error('pastille non fermée');
    const fm=occBinPush(bin,new occt.BRepBuilderAPI_MakeFace_15(mkW.Wire(),true));
    fm.Build();if(!fm.IsDone())throw new Error('face pastille impossible');
    const vec=occBinPush(bin,new occt.gp_Vec_4(n.x*len,n.y*len,n.z*len));
    const pr=occBinPush(bin,new occt.BRepPrimAPI_MakePrism_1(fm.Face(),vec,false,true));
    pr.Build();if(!pr.IsDone())throw new Error('prisme pastille impossible');
    const s=pr.Shape();
    return{shape:s,bin};
  }catch(err){occDispose(bin);throw err;}
}
function rimEdgeJobs(edges,o,n,d,rsTop,rsBot){
  // Arêtes de périmètre (haut/bas) du prisme — axe n depuis origine o, course d
  // (nombre signé OU plage {lo,hi} pour le mode symétrique).
  const jobs=[];
  if(!(rsTop>0||rsBot>0))return jobs;
  const tHi=(d&&typeof d==='object')?d.hi:Math.max(0,d);
  const tLo=(d&&typeof d==='object')?d.lo:Math.min(0,d);
  const tol=0.6;
  for(const e of edges){
    try{
      const p0=e.pts[0],p1=e.pts[e.pts.length-1];
      const ax=p1[0]-p0[0],ay=p1[1]-p0[1],az=p1[2]-p0[2];
      const tn=ax*n.x+ay*n.y+az*n.z,len2=ax*ax+ay*ay+az*az;
      if(len2>0&&Math.abs(tn)>Math.sqrt(len2)*0.7)continue; // arête le long de n (verticale)
      const m=e.mid;
      const t=(m[0]-o.x)*n.x+(m[1]-o.y)*n.y+(m[2]-o.z)*n.z;
      if(rsTop>0&&Math.abs(t-tHi)<tol){jobs.push({src:e.src,r:rsTop,mid:m&&m.slice()});continue;}
      if(rsBot>0&&Math.abs(t-tLo)<tol)jobs.push({src:e.src,r:rsBot,mid:m&&m.slice()});
    }catch(err){}
  }
  return jobs;
}
function xKindOf(f){return f&&f.chamfer?'chamfer':'fillet';}
function xIsChamfer(k){return k==='chamfer';}
function xLabel(k){return xIsChamfer(k)?'Chanfrein exact':'Congé exact';}
function xLabelLow(k){return xIsChamfer(k)?'chanfrein exact':'congé exact';}
function xIcon(k){return xIsChamfer(k)?'⟋':'⤢';}
function xDimPrefix(k){return xIsChamfer(k)?'D':'R';}
function xFeatName(f){return xLabel(xKindOf(f))+' ('+((f&&f.edges)||[]).length+' arête(s))';}
function occFilletRun(base,jobs,warns,chamfer){
  // Arrondi/chanfrein BRep : 1) le lot en une passe (rapide), 2) si Build échoue → ARÊTE PAR ARÊTE
  // sur la shape courante (chaque succès conservé — une arête capricieuse ne fait plus
  // tomber toutes les autres). Les srcs changent après chaque arrondi : relocalisation
  // par le milieu mémorisé (mid). Retourne null si rien n'a pu être arrondi.
  const kindLabel=chamfer?'chanfrein':'arrondi';
  const mk=(cur,js)=>{
    const bin=[];
    try{
      const want=new Map(js.map(j=>[j.src,j.r]));
      const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
      const ex=new occt.TopExp_Explorer_2(cur,occt.TopAbs_ShapeEnum.TopAbs_EDGE,SH);bin.push(ex);
      const hs=[];let k=0;
      while(ex.More()){if(want.has(k)){const h=occt.TopoDS.Edge_1(ex.Current());bin.push(h);hs.push({h,r:want.get(k)});}k++;ex.Next();}
      occDispose([ex]);
      if(!hs.length){occDispose(bin);return null;}
      if(chamfer&&!occt.BRepFilletAPI_MakeChamfer){occDispose(bin);return null;}
      const mf=chamfer?new occt.BRepFilletAPI_MakeChamfer(cur):new occt.BRepFilletAPI_MakeFillet(cur,0);bin.push(mf);
      hs.forEach(o=>mf.Add_2(o.r,o.h));
      let ok=false;try{mf.Build();ok=mf.IsDone();}catch(e){ok=false;}
      if(!ok){occDispose(bin);return null;}
      const s=mf.Shape();occDispose(bin);return s;
    }catch(e){occDispose(bin);return null;}
  };
  let s=mk(base,jobs);
  if(s)return s;
  let cur=base,done=0;
  for(const j of jobs){
    if(!j.mid||j.mid.length!==3){warns.push('arête sans repère — '+kindLabel+' abandonné');return cur===base?null:cur;}
    let edges=null;try{edges=occListEdges(cur);}catch(e){}
    const ed=(edges||[]).find(e=>Math.hypot(e.mid[0]-j.mid[0],e.mid[1]-j.mid[1],e.mid[2]-j.mid[2])<3.0);
    if(!ed){warns.push('arête introuvable ('+kindLabel+' isolé)');continue;}
    const one=mk(cur,[{src:ed.src,r:j.r}]);
    if(one){if(cur!==base){try{cur.delete();}catch(e){}}cur=one;done++;}
    else warns.push(kindLabel+' isolé impossible ('+(chamfer?'distance trop grande ?':'rayon trop grand ?')+')');
  }
  if(cur===base)return null;
  if(done<jobs.length)warns.push(kindLabel+' partiel : '+done+'/'+jobs.length);
  return cur;
}
function occRimFillets(base,o,n,d,rsTop,rsBot){
  // Congé du périmètre en exact (voie BRep) : arrondi des deux bords du prisme.
  // Échec isolé = jamais de crash : shape d'origine conservée + warning.
  const warns=[];
  if(!(rsTop>0||rsBot>0))return{shape:base,warnings:warns};
  let edges=[];try{edges=occListEdges(base);}catch(e){}
  const jobs=rimEdgeJobs(edges,o,n,d,rsTop,rsBot);
  if(!jobs.length){warns.push('périmètre : arête du contour introuvable');return{shape:base,warnings:warns};}
  const s=occFilletRun(base,jobs,warns);
  if(!s){warns.push('périmètre : arrondi impossible');return{shape:base,warnings:warns};}
  try{base.delete();}catch(e){}
  return{shape:s,warnings:warns};
}
function occShapeOfExtrude(f){
  // Solide BRep exact d'une extrusion (congés 2D pré-appliqués, trous = découpes).
  const sk=doc.sketches.find(s=>s.id===f.sketchId);
  if(!sk)throw new Error('esquisse introuvable');
  const fils=doc.features.filter(x=>x.type==='fillet'&&x.target===f.id&&x.visible!==false);
  let data=sk;const warns=[];
  let rsTop=0,rsBot=0;
  fils.forEach(fi=>{const rm=fi.rims||(fi.rimTop||fi.rimBot?{top:!!fi.rimTop,bottom:!!fi.rimBot}:null);if(!rm||!(fi.radius>0))return;if(rm.top&&fi.radius>rsTop)rsTop=fi.radius;if(rm.bottom&&fi.radius>rsBot)rsBot=fi.radius;});
  if(fils.length){
    const rf=applyFilletsToSketch(sk,fils);
    warns.push(...rf.warnings);data=rf.sk;
    if(!rf.applied&&!(fils.some(fi=>fi.rims&&(fi.rims.top||fi.rims.bottom)))){/* que des rims : rien en 2D */}
  }
  const tr=skLoopTrace(data);
  if(!tr.solids.length&&!tr.circlesOut.length){
    let m='profil non fermé';
    if(tr.opens&&tr.opens.length)m+=` (bout ouvert en ${tr.opens[0].x.toFixed(1)}, ${tr.opens[0].y.toFixed(1)})`;
    throw new Error(m);
  }
  const sp=extrudeSpan(f),bins=[];
  const bs=sketchBasis(data);
  const rimApply=(sh)=>{
    if(!(rsTop>0||rsBot>0))return sh;
    const rr=occRimFillets(sh,bs.o,bs.n,sp,rsTop,rsBot);
    warns.push(...rr.warnings);
    return rr.shape;
  };
  const keep=(r,what)=>{
    if(!r||!r.shape||!r.bin)throw new Error(`prisme vide (${what||'contour'} — arête dégénérée, arc aplati ou micro-segment ?)`);
    bins.push(...r.bin);return r.shape;
  };
  let shape=null;
  const fuseIn=(s)=>{if(!shape){shape=s;return;}const nx=occUnify(occFuse(shape,s));try{shape.delete();}catch(e){}try{s.delete();}catch(e){}shape=nx;};
  tr.solids.forEach((sol,si)=>{
    let s=keep(occSpanPrism(data,tr,sol.chain,sp,sol.area),'contour '+tr.solids.length);
    s=rimApply(s);
    (sol.holes||[]).forEach(h=>{
      const t=keep(occSpanPrism(data,tr,h,sp,1),'trou');
      const c=occCut(s,t);try{s.delete();}catch(e){}try{t.delete();}catch(e){}s=c;
    });
    tr.circleHoles.filter(ch=>ch.solid===si).forEach(ch=>{
      const Cc=data.points[ch.circle.pc];
      if(!Cc)throw new Error('pastille : centre introuvable');
      const t=keep(occDiskPrism(data,Cc.x,Cc.y,ch.circle.r,sp),'trou circulaire');
      const c=occCut(s,t);try{s.delete();}catch(e){}try{t.delete();}catch(e){}s=c;
    });
    fuseIn(s);
  });
  tr.circlesOut.forEach(cEnt=>{
    const Cc=data.points[cEnt.pc];
    if(!Cc)throw new Error('pastille : centre introuvable');
    fuseIn(rimApply(keep(occDiskPrism(data,Cc.x,Cc.y,cEnt.r,sp),'pastille')));
  });
  if(!shape){occDispose(bins);throw new Error('solide vide');}
  return{shape,bins,warnings:warns};
}
function smoothNormals(pos,creaseDeg){
  // Normales lissées sous seuil d'angle (style Fusion) : facettes tangentes interpolées,
  // arêtes vives (> seuil) conservées. Entrée : tableau xyz non indexé. Validé par exécution.
  const nTri=(pos.length/9)|0;
  const fnx=new Float64Array(nTri),fny=new Float64Array(nTri),fnz=new Float64Array(nTri);
  const fok=new Uint8Array(nTri);
  for(let t=0;t<nTri;t++){
    const o=t*9;
    const e1x=pos[o+3]-pos[o],e1y=pos[o+4]-pos[o+1],e1z=pos[o+5]-pos[o+2];
    const e2x=pos[o+6]-pos[o],e2y=pos[o+7]-pos[o+1],e2z=pos[o+8]-pos[o+2];
    const nx=e1y*e2z-e1z*e2y,ny=e1z*e2x-e1x*e2z,nz=e1x*e2y-e1y*e2x;
    const l=Math.hypot(nx,ny,nz);
    if(l>1e-18){fnx[t]=nx/l;fny[t]=ny/l;fnz[t]=nz/l;fok[t]=1;}
  }
  const map=new Map();
  for(let v=0;v<pos.length/3;v++){
    const k=pos[v*3]+','+pos[v*3+1]+','+pos[v*3+2];
    let a=map.get(k);if(!a){a=[];map.set(k,a);}
    a.push((v/3)|0);
  }
  const lim=Math.cos((creaseDeg||35)*Math.PI/180);
  const out=new Float32Array(pos.length);
  for(let t=0;t<nTri;t++)for(let k=0;k<3;k++){
    const v=t*3+k,kk=pos[v*3]+','+pos[v*3+1]+','+pos[v*3+2];
    let ax=0,ay=0,az=0;
    const inc=map.get(kk)||[t];
    for(const t2 of inc){
      if(!fok[t2])continue;
      if(!fok[t]||fnx[t2]*fnx[t]+fny[t2]*fny[t]+fnz[t2]*fnz[t]>=lim){ax+=fnx[t2];ay+=fny[t2];az+=fnz[t2];}
    }
    let l=Math.hypot(ax,ay,az);
    if(!(l>1e-12)){if(fok[t]){ax=fnx[t];ay=fny[t];az=fnz[t];}else{ax=0;ay=0;az=1;}l=1;}
    out[v*3]=ax/l;out[v*3+1]=ay/l;out[v*3+2]=az/l;
  }
  return out;
}
function occTessellate(shape,defl,ang){
  // BRep -> THREE.BufferGeometry (non indexé, normales plates). Validé par exécution.
  defl=defl||0.5;ang=ang||0.5;
  new occt.BRepMesh_IncrementalMesh_2(shape,defl,false,ang,false);
  const pos=[],groups=[];
  let faceOrd=0;
  const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
  const ex=new occt.TopExp_Explorer_2(shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);
  while(ex.More()){
    const f=occt.TopoDS.Face_1(ex.Current());
    const loc=new occt.TopLoc_Location_1();
    const triStart=pos.length/9;
    try{
      const h=occt.BRep_Tool.Triangulation(f,loc);
      if(h&&!h.IsNull()){
        const t=h.get(),nt=t.NbTriangles();
        // Orientation_1() rend un objet-enum (identité stricte, pas un nombre).
        // Sans ce flip, les faces REVERSED sont inversées = trous visuels.
        let rev=false;
        try{rev=(f.Orientation_1()===occt.TopAbs_Orientation.TopAbs_REVERSED);}catch(e){rev=false;}
        const trsf=loc.IsIdentity()?null:loc.Transformation();
        for(let i=1;i<=nt;i++){
          const tr=t.Triangle(i);
          let idx=[tr.Value(1),tr.Value(2),tr.Value(3)];
          if(rev)idx=[idx[0],idx[2],idx[1]];
          for(const k of idx){
            const p=t.Node(k);
            let x,y,z;
            if(trsf){const q=p.Transformed(trsf);x=q.X();y=q.Y();z=q.Z();}
            else{x=p.X();y=p.Y();z=p.Z();}
            pos.push(x,y,z);
          }
        }
      }
    }catch(e){}
    try{loc.delete();}catch(e){}
    const triCount=pos.length/9-triStart;
    if(triCount>0)groups.push({f:faceOrd,start:triStart,count:triCount});
    faceOrd++;
    ex.Next();
  }
  try{ex.delete();}catch(e){}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  try{g.setAttribute('normal',new THREE.Float32BufferAttribute(smoothNormals(pos,35),3));}
  catch(e){g.computeVertexNormals();}
  g.userData.occGroups=groups; // triangle -> face BRep (clic-face en mode exact)
  return g;
}
let occLive=null; // solide BRep affiché conservé pour le picking d'arêtes exact
function occDropLive(){if(occLive){try{occLive.shape.delete();}catch(e){}occLive=null;}}
/* ---------- déplacement d'une face (push/pull) ----------
   Principe retenu après mesure : on ne cherche pas la primitive « déplacement » du noyau
   (BRepFeat_MakeDPrism existe mais sa signature Web est ambiguë et son résultat peut être
   vide), on fait ce que fait l'utilisateur avec deux opérations que le moteur maîtrise déjà
   et qui sont vérifiées : extruder la face le long de sa normale SORTANTE, puis FUSIONNER
   (la face sort) ou SOUSTRAIRE (la face rentre). Mesuré sur une boîte 100x60x40 :
   +10 sur +X -> 110x60x40, -10 -> 90x60x40, +15 sur +Y -> 100x75x40. */

function occFaceOutNormal(f){
  // Normale SORTANTE d'une face d'un solide. La normale géométrique de BRepAdaptor ne suffit
  // pas : sur une boîte, les deux faces opposées ont la MÊME normale géométrique, et c'est
  // l'orientation de la face qui dit laquelle pointe dehors. Orientation_1() renvoie un objet
  // enum : la comparaison doit être une identité stricte, pas une comparaison de texte.
  try{
    const ad=new occt.BRepAdaptor_Surface_2(f,true);
    let n=null;
    try{
      const gt=ad.GetType();
      if(gt===occt.GeomAbs_SurfaceType.GeomAbs_Plane){
        const d=ad.Plane().Axis().Direction();n=[d.X(),d.Y(),d.Z()];
      }else if(gt===occt.GeomAbs_SurfaceType.GeomAbs_Cylinder){
        const d=ad.Cylinder().Axis().Direction();n=[d.X(),d.Y(),d.Z()];
      }
    }catch(e){}
    if(!n){try{ad.delete();}catch(e){}return null;}
    let rev=false;
    try{rev=(f.Orientation_1()===occt.TopAbs_Orientation.TopAbs_REVERSED);}catch(e){}
    try{ad.delete();}catch(e){}
    const s=rev?-1:1;
    const L=Math.hypot(n[0],n[1],n[2]);
    if(!(L>1e-9))return null;
    return [n[0]*s/L,n[1]*s/L,n[2]*s/L];
  }catch(e){return null;}
}
function occFaceBox(f){
  // Centre et dimensions d'une face : la signature qui permet de la retrouver au rejeu.
  try{
    const b=new occt.Bnd_Box_1();
    occt.BRepBndLib.Add(f,b,true);
    const a=b.CornerMin(),z=b.CornerMax();
    const out={pos:[(a.X()+z.X())/2,(a.Y()+z.Y())/2,(a.Z()+z.Z())/2],dim:[z.X()-a.X(),z.Y()-a.Y(),z.Z()-a.Z()]};
    b.delete();return out;
  }catch(e){return null;}
}
function occFaceRef(f){
  const n=occFaceOutNormal(f),b=occFaceBox(f);
  if(!n||!b)return null;
  return {pos:b.pos.map(v=>+v.toFixed(3)),dim:b.dim.map(v=>+v.toFixed(3)),n:n.map(v=>+v.toFixed(4))};
}
function occFindFace(shape,ref){
  // Retrouve sur le solide courant la face décrite par ref (centre + normale + dimensions).
  // Une sélection d'une seule face se fait d'un clic : 2 mm suffisent à la délimiter, et la
  // normale doit rester compatible (sinon on déplacerait la face d'en face).
  if(!shape||!ref)return null;
  const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
  const ex=new occt.TopExp_Explorer_2(shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);
  let best=null,bn=-2;
  while(ex.More()){
    const f=occt.TopoDS.Face_1(ex.Current());
    const b=occFaceBox(f),n=occFaceOutNormal(f);
    if(b&&n){
      const d=Math.hypot(b.pos[0]-ref.pos[0],b.pos[1]-ref.pos[1],b.pos[2]-ref.pos[2]);
      const dot=n[0]*ref.n[0]+n[1]*ref.n[1]+n[2]*ref.n[2];
      const dd=Math.abs(b.dim[0]-ref.dim[0])+Math.abs(b.dim[1]-ref.dim[1])+Math.abs(b.dim[2]-ref.dim[2]);
      // pénalité de dimension : deux faces de même centre et même normale mais de tailles
      // différentes sont deux faces distinctes (un bossage, un méplat).
      const sc=dot>=0.9?d+0.1*dd:1e6+d;
      if(sc<bn||best===null){if(sc<1e5){bn=sc;best=f;}}
    }
    ex.Next();
  }
  try{ex.delete();}catch(e){}
  if(best&&bn>2.5)return null; // trop loin : on préfère échouer que viser une autre face
  return best;
}
function occMoveFaceOnce(shape,face,dist){
  // Déplace UNE face de `dist` mm le long de sa normale sortante.
  // dist > 0 : la matière est ajoutée au-delà (la face avance). dist < 0 : retirée en dessous.
  const n=occFaceOutNormal(face);
  if(!n)throw new Error('face non plane/cylindrique');
  const L=Math.abs(dist);
  if(!(L>1e-9))return occShapeCopy(shape);
  const bin=[];
  // Le prisme part du CÔTÉ DE LA DISTANCE : vers l'extérieur si la face avance, vers
  // l'intérieur si elle rentre. Extruder toujours vers l'extérieur et soustraire ne retire
  // aucune matière (le prisme est alors dans le vide) : le solide restait inchangé.
  const vec=new occt.gp_Vec_4(n[0]*dist,n[1]*dist,n[2]*dist);
  const pr=occBinPush(bin,new occt.BRepPrimAPI_MakePrism_1(face,vec,false,true));
  const ps=occBinPush(bin,pr.Shape());
  const out=dist>0?occFuse(shape,ps):occCut(shape,ps);
  // Un déplacement doit laisser UN corps, comme une addition : sans unification, la
  // fusion conserve les faces coplanaires du prisme et de la pièce d'origine (10 faces au
  // lieu de 6 sur une simple boîte), ce qui se voit : coutures, arêtes parasites, impression
  // de plusieurs morceaux. occUnify recolle les faces coplanaires — c'est déjà ce que fait
  // le chemin « add » d'une extrusion.
  let res=out;
  try{res=occUnify(out);}catch(e){}
  bin.forEach(b=>{try{b.delete();}catch(e){}});
  if(!res||res.IsNull())throw new Error('opération de déplacement impossible');
  return res;
}
function occApplyMoveFace(result,f){
  // Rejoue le déplacement d'une face. Retourne {shape,warnings} comme occApplyXFillets.
  const warnings=[];
  const dist=+f.dist||0;
  const face=occFindFace(result,f.ref);
  if(!face){return {shape:result,warnings:[`face introuvable près de (${(f.ref.pos||[]).map(v=>(+v).toFixed(1)).join(', ')}) — la pièce a changé`]};}
  if(!dist){return {shape:result,warnings:['distance nulle — aucun déplacement']};}
  try{
    const s=occMoveFaceOnce(result,face,dist);
    try{result.delete();}catch(e){}
    return {shape:s,warnings};
  }catch(e){
    return {shape:result,warnings:[`déplacement impossible (${(e&&e.message)||e})`],fatal:true};
  }
}
function occListEdges(shape){
  // Données pures par arête (pas de handles conservés) : mid, polyline pts, longueur, src (rang explorateur).
  const out=[],bin=[];
  const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
  const ex=new occt.TopExp_Explorer_2(shape,occt.TopAbs_ShapeEnum.TopAbs_EDGE,SH);bin.push(ex);
  let src=0;
  while(ex.More()){
    const e=occt.TopoDS.Edge_1(ex.Current());bin.push(e);
    try{
      const ad=new occt.BRepAdaptor_Curve_2(e);bin.push(ad);
      const u0=ad.FirstParameter(),u1=ad.LastParameter();
      if(u1>u0){
        const m=ad.Value((u0+u1)/2);bin.push(m);
        const pts=[],NP=10;
        for(let i=0;i<=NP;i++){const p=ad.Value(u0+(u1-u0)*i/NP);bin.push(p);pts.push([p.X(),p.Y(),p.Z()]);}
        let len=0;
        for(let i=1;i<pts.length;i++)len+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1],pts[i][2]-pts[i-1][2]);
        if(len>1e-6)out.push({mid:[m.X(),m.Y(),m.Z()],pts,len,src});
      }
    }catch(err){}
    src++;ex.Next();
  }
  occDispose(bin);
  const seen=new Set(),dedup=[]; // jumeaux exacts (splits) fusionnés
  out.forEach(o=>{const k=o.mid.map(v=>v.toFixed(2)).join(',');if(!seen.has(k)){seen.add(k);dedup.push(o);}});
  return dedup;
}
// ── affinage de la POLYLIGNE d'une arête (affichage seulement) ──────────────
// Les arêtes étaient échantillonnées à 12 points fixes : un cercle devenait un
// 12-gone, très lisible sur la silhouette d'une révolution (le polygone se voit).
// Ici on subdivise chaque intervalle tant que la COURBE ne s'écarte pas de sa
// corde de plus de EDGE_TOL : une droite tombe à 2 points, un cercle s'affine tout
// seul. L'IDENTITÉ des arêtes (mid + len) reste calculée à 12 points fixes — inchangée,
// donc aucun effet sur l'appariement des congés, les signatures ni le rejeu.
const EDGE_TOL=0.02; // mm — écart maximal entre la courbe et sa polyligne
function occCurvePts(ad,u0,u1,tol,cap){
  tol=tol>0?tol:EDGE_TOL;cap=cap||600;
  const at=u=>{
    const p=ad.Value(u);
    const q=[p.X(),p.Y(),p.Z()];
    try{p.delete();}catch(e){} // handle jetable : ad.Value en alloue un à chaque appel
    return q;
  };
  const sweep=u1-u0;
  // ── 1) cercle ou arc : le nombre de segments se CALCULE, pas subdivise à l'aveugle
  //    flèche d'une corde = R(1−cos(Δθ/2)) ≤ tol  ⇒  Δθ = 2·acos(1−tol/R)
  let R=-1;
  try{
    const c=ad.Circle(),ax=c.Axis().Direction();
    if(isFinite(ax.X())&&isFinite(ax.Y())&&isFinite(ax.Z()))R=c.Radius();
  }catch(e){}
  if(R>1e-6){
    let dth=2*Math.acos(Math.max(-1,Math.min(1,1-tol/R)));
    if(!(dth>1e-3))dth=1e-3;
    let n=Math.ceil(Math.abs(sweep)/dth);
    n=Math.max(4,Math.min(cap,Math.round(n)));
    const out=[];
    for(let i=0;i<=n;i++)out.push(at(u0+sweep*i/n));
    return out;
  }
  // ── 2) autres courbes (droites, B-splines…) : on subdivise tant que la courbe
  //    s'écarte de sa corde de plus de tol. Une droite tombe à 2 points du premier coup.
  const cache={};
  const atc=u=>{const k=u.toFixed(9);if(cache[k])return cache[k];return cache[k]=at(u);};
  const dev=(a,b)=>{
    const A=atc(a),B=atc(b),M=atc((a+b)/2);
    return Math.hypot(M[0]-(A[0]+B[0])/2,M[1]-(A[1]+B[1])/2,M[2]-(A[2]+B[2])/2);
  };
  const stack=[[u0,u1]],leaves=[];
  while(stack.length&&leaves.length<cap){
    const s=stack.pop();
    if(dev(s[0],s[1])>tol){const m=(s[0]+s[1])/2;stack.push([m,s[1]]);stack.push([s[0],m]);}
    else leaves.push(s);
  }
  leaves.sort((a,b)=>a[0]-b[0]);
  const us=[u0];
  leaves.forEach(l=>{const e=l[1];if(e>us[us.length-1]+1e-12)us.push(e);});
  return us.map(atc);
}
function occDraftOnce(result,refFace,faces,angle){
  const bin=[];
  try{
    const dir=occBinPush(bin,new occt.gp_Dir_4(refFace.n[0],refFace.n[1],refFace.n[2]));
    const P=occBinPush(bin,new occt.gp_Pnt_3(refFace.pos[0],refFace.pos[1],refFace.pos[2]));
    const pln=occBinPush(bin,new occt.gp_Pln_3(P,dir));
    const da=occBinPush(bin,new occt.BRepOffsetAPI_DraftAngle_2(result));
    const refused=[];
    let ok=0;
    for(const f of faces){
      // DownCast via le namespace TopoDS (TopoDS.Face_1) : la forme `TopoDS_Face_1`
      // avec underscore N'EXISTE PAS dans ce build (undefined → TypeError à chaque
      // Add → dépouille systématiquement « impossible », Pièce 7). Toutes les autres
      // fonctions utilisent déjà TopoDS.Face_1 / Edge_1.
      const fc=occBinPush(bin,occt.TopoDS.Face_1(f));
      try{da.Add(fc,dir,angle,pln,false);ok++;}
      catch(e){
        const b=occFaceBox(f);
        refused.push(b?b.pos.map(v=>+v.toFixed(1)):null);
      }
    }
    if(!ok)throw new Error(refused.length
      ?`aucune des ${faces.length} face(s) ne touche le plan neutre`
      :'aucune face à dépouiller');
    da.Build();
    let done=false;
    try{done=!!da.IsDone();}catch(e){}
    if(!done)throw new Error('dépouille refusée par le moteur');
    const out=occShapeCopy(da.Shape());
    if(!out||out.IsNull())throw new Error('solide dépouillé vide');
    return {shape:out,refused:refused};
  }finally{occDispose(bin);} // toujours : un `throw` en cours de boucle ne doit pas fuir de handles
}
function occSharpEdges(shape){
  // Arêtes uniques classées : sharp (noire, C0) vs tangente (grise, G1+). Validé par exécution.
  const out=[],bin=[];
  try{
    const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE,NP=12;
    const ekey=(m,l)=>m.map(v=>v.toFixed(2)).join(',')+'|'+l.toFixed(2);
    const sample=ad=>{
      const u0=ad.FirstParameter(),u1=ad.LastParameter(),pts=[];
      let len=0,px=null;
      for(let i=0;i<=NP;i++){
        const p=ad.Value(u0+(u1-u0)*i/NP);bin.push(p);
        const q=[p.X(),p.Y(),p.Z()];pts.push(q);
        if(px)len+=Math.hypot(q[0]-px[0],q[1]-px[1],q[2]-px[2]);
        px=q;
      }
      return{pts,len,u0,u1};
    };
    const faces=[];
    const fx=new occt.TopExp_Explorer_2(shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);bin.push(fx);
    while(fx.More()){const f=occt.TopoDS.Face_1(fx.Current());bin.push(f);faces.push(f);fx.Next();}
    const fmap=new Map();
    faces.forEach((f,fi)=>{
      const ee=new occt.TopExp_Explorer_2(f,occt.TopAbs_ShapeEnum.TopAbs_EDGE,SH);bin.push(ee);
      while(ee.More()){
        const e=occt.TopoDS.Edge_1(ee.Current());bin.push(e);
        try{
          const ad=new occt.BRepAdaptor_Curve_2(e);bin.push(ad);
          if(ad.LastParameter()>ad.FirstParameter()){
            const m=ad.Value((ad.FirstParameter()+ad.LastParameter())/2);bin.push(m);
            const s=sample(ad,ad.FirstParameter(),ad.LastParameter());
            if(s.len>1e-6){
              const k=ekey([m.X(),m.Y(),m.Z()],s.len);
              if(!fmap.has(k))fmap.set(k,[]);
              if(!fmap.get(k).includes(fi))fmap.get(k).push(fi);
            }
          }
        }catch(err){}
        ee.Next();
      }
    });
    const ex=new occt.TopExp_Explorer_2(shape,occt.TopAbs_ShapeEnum.TopAbs_EDGE,SH);bin.push(ex);
    const seen=new Set();
    while(ex.More()){
      const e=occt.TopoDS.Edge_1(ex.Current());bin.push(e);
      try{
        const ad=new occt.BRepAdaptor_Curve_2(e);bin.push(ad);
        const u0=ad.FirstParameter(),u1=ad.LastParameter();
        if(u1>u0){
          const m=ad.Value((u0+u1)/2);bin.push(m);
          const mid=[m.X(),m.Y(),m.Z()];
          const s=sample(ad,u0,u1);
          if(s.len>1e-6){
            const kk=ekey(mid,s.len);
            if(!seen.has(kk)){
              seen.add(kk);
              let sharp=true;
              const fl=fmap.get(kk)||[];
              if(fl.length>=2){
                try{sharp=(occt.BRep_Tool.Continuity_1(e,faces[fl[0]],faces[fl[1]])===occt.GeomAbs_Shape.GeomAbs_C0);}
                catch(err){sharp=true;}
              }else sharp=false;
              out.push({mid,pts:occCurvePts(ad,u0,u1),len:s.len,sharp});
            }
          }
        }
      }catch(err){}
      ex.Next();
    }
  }catch(e){}
  occDispose(bin);
  return out;
}
function occApplyDraft(result,f){
  const warnings=[];
  const ang=(+f.angle||0)*Math.PI/180;
  if(!(Math.abs(ang)>1e-9))return{shape:result,warnings:['angle nul — aucune dépouille']};
  if(!f.ref||!(f.faces||[]).length)return{shape:result,warnings:['face de référence ou faces à dépouiller manquantes']};
  const ref=occFindFace(result,f.ref);
  if(!ref){f._m={m:0,t:f.faces.length};return{shape:result,warnings:[`face de référence introuvable près de (${(f.ref.pos||[]).map(v=>(+v).toFixed(1)).join(', ')}) — la pièce a changé`]} };
  const rn=occFaceOutNormal(ref);
  if(!rn){try{ref.delete();}catch(e){}return{shape:result,warnings:['face de référence non plane/cylindrique']}};
  const rb=occFaceBox(ref);
  if(!rb){try{ref.delete();}catch(e){}return{shape:result,warnings:['face de référence illisible']}};
  // Résolution LOCALE : les handles OCCT retrouvés restent dans `got`, les références
  // durables `f.ref` / `f.faces` (pos/n/dim) ne sont JAMAIS écrasées. Les écraser avec
  // des handles rendait le document insérialisable et cassait tous les rejeux suivants
  // (occFindFace recevait un handle au lieu d'une ref → NaN → aucune face retrouvée).
  const total=(f.faces||[]).length;
  const hsAll=(f.faces||[]).map(fr=>{try{return occFindFace(result,fr)||null;}catch(e){return null;}});
  const got=hsAll.filter(Boolean);
  const miss=total-got.length;
  if(!got.length){
    try{ref.delete();}catch(e){}
    f._m={m:0,t:total};
    return{shape:result,warnings:[`aucune des ${total} face(s) visée(s) n'est retrouvée`]};
  }
  if(miss)warnings.push(`${miss} face(s) visée(s) introuvable(s) sur la pièce courante`);
  f._m={m:got.length,t:total};
  // `run` prend des handles DÉJÀ résolus (pas de double occFindFace) et ne les détruit
  // pas : c'est l'appelant qui libère `got`/`ref` une fois le solide de sortie construit.
  const run=list=>{
    if(!list.length)throw new Error('aucune face retrouvable');
    return occDraftOnce(result,{pos:rb.pos,n:rn},list,ang);
  };
  const dropShape=s=>{try{if(s&&s.shape)s.shape.delete();}catch(e){}};
  let r=null,echec=null;
  try{r=run(got);}catch(e){echec=e;}
  if(!r){
    const garde=[];
    for(const h of got){
      try{const t=run(garde.concat([h]));dropShape(t);garde.push(h);}catch(e2){/* cette face-là est écartée */}
    }
    if(!garde.length){
      got.forEach(g=>{try{g.delete();}catch(e){}});
      try{ref.delete();}catch(e2){}
      const m=echec&&echec.message||echec;
      const lisible=/^\d+$/.test(String(m))
        ?`le moteur de dépouille a refusé la géométrie (code ${m})`
        :m;
      return{shape:result,warnings:[`dépouille impossible — ${lisible}. Vérifiez que chaque face retenue touche encore le plan neutre.`],fatal:true};
    }
    r=run(garde);
    f._m={m:garde.length,t:total};
    warnings.push(`dépouillage partiel : ${garde.length}/${total} face(s) appliquée(s), `+
      `${total-garde.length} écartée(s) par le moteur`);
  }
  try{
    const s=r.shape;
    if(r.refused&&r.refused.length){
      const ou=r.refused.map(p=>p?'('+p.map(v=>v.toFixed(1)).join(' ; ')+') mm':'inconnue');
      warnings.push(`${r.refused.length} face(s) non dépouillée(s) — elle(s) ne touche(nt) pas le plan neutre : ${ou.slice(0,3).join(', ')}${r.refused.length>3?'…':''}`);
    }
    let out=s;
    try{out=occUnify(s);}catch(e){}
    if(out!==s){try{s.delete();}catch(e){} }
    got.forEach(g=>{try{g.delete();}catch(e){} });
    try{ref.delete();}catch(e){}
    try{result.delete();}catch(e){}
    return{shape:out,warnings};
  }catch(e){
    got.forEach(g=>{try{g.delete();}catch(e2){}});
    try{ref.delete();}catch(e2){}
    return{shape:result,warnings:[`dépouille impossible (${(e&&e.message)||e})`],fatal:true};
  }
}
let edgeMode='off'; // 'off' | 'on' : surlignage vives noires / tangentes grises
try{const em=localStorage.getItem('minifusion_edges');if(em==='on'||em==='off')edgeMode=em;}catch(e){}
function buildEdgeOverlay(){
  const old=scene.getObjectByName('edgeOverlay');if(old)scene.remove(old);
  if(edgeMode!=='on')return;
  const grp=new THREE.Group();grp.name='edgeOverlay';
  const occBody=bodies.find(b=>b.id==='occ_result'&&b.visible);
  if(occBody&&occLive&&occLive.shape){
    try{ // voie exacte : classement C0/G1 réel
      occSharpEdges(occLive.shape).forEach(e=>{
        const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(e.pts.map(p=>new THREE.Vector3(p[0],p[1],p[2]))),
          new THREE.LineBasicMaterial({color:e.sharp?0x000000:0x8e9399}));
        l.raycast=()=>{};grp.add(l);
      });
    }catch(e){}
  }else{
    bodies.forEach(b=>{ // repli maillage : vives seules (> 30°), noires
      if(!b.visible||b.ghost||!b.mesh||b.id==='occ_result')return;
      try{
        b.mesh.updateMatrixWorld(true);
        const eg=new THREE.EdgesGeometry(b.mesh.geometry,30);
        const p=eg.attributes.position,pts=[];
        const A=new THREE.Vector3(),B=new THREE.Vector3();
        for(let i=0;i<p.count;i+=2){
          A.fromBufferAttribute(p,i).applyMatrix4(b.mesh.matrixWorld);
          B.fromBufferAttribute(p,i+1).applyMatrix4(b.mesh.matrixWorld);
          pts.push(A.clone(),B.clone());
        }
        eg.dispose();
        if(!pts.length)return;
        const l=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.LineBasicMaterial({color:0x000000}));
        l.raycast=()=>{};grp.add(l);
      }catch(e){}
    });
  }
  scene.add(grp);
}
function distSeg2(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy||1e-18;let t=((px-ax)*dx+(py-ay)*dy)/L2;t=Math.max(0,Math.min(1,t));return Math.hypot(px-(ax+t*dx),py-(ay+t*dy));}
function rotP(Q,Cx,Cy,a){const dx=Q.x-Cx,dy=Q.y-Cy,c=Math.cos(a),s=Math.sin(a);Q.x=Cx+dx*c-dy*s;Q.y=Cy+dx*s+dy*c;}
function pairKey(a,b){return a<b?a+'_'+b:b+'_'+a;}
function xAnchorFor(m){
  // Nommage persistant d'une arête : ancre sketch (point ou entité) qui suit les éditions.
  // Le recalage se fait en 2D esquisse (insensible aux découpes qui scindent en hauteur).
  // m = milieu monde [x,y,z]. Retourne {t:'p'|'e',sk,id,z,side,far} ou null. side: 0=bas,1=haut (suit l'épaisseur).
  // Toutes les esquisses comptent (masquées = consommées : ce sont LEURS profils qui ont produit
  // les arêtes) et on garde la MEILLEURE candidature (2D d'abord, plan ensuite) — le premier
  // sketch trouvé revenait à ancrer une arête de découpe sur le profil de la plaque (ligne 2D
  // identique, autre plan) : l'ancre dérivait sur de mauvaises arêtes.
  // DEUXIÈME PASSE (RAD=8, ancre marquée far:1) : une arête née d'un CONGÉ/CHANFREIN n'est pas
  // sur l'esquisse — l'arc d'un rayon remplace le coin et se trouve à ~6 mm de toute entité 2D.
  // La passe stricte à 1 mm ne trouvait donc RIEN et l'ancre revenait null : l'arête retombait
  // sur le repli fragile position+longueur d'occApplyXFillets, puis perdait sa référence (⚠ dans
  // l'arbre) dès que le solide bougeait. Élargir seul confondait l'arc et son segment
  // colinéaire (8 sélections → 4 arêtes) : xAnchorMatch lève donc la tolérance 2D pour far:1
  // ET départage sur la position d'origine (pos0), qui est l'arête réellement cliquée.
  const scan=(RAD,far)=>{
    let best=null;
    const consider=(res,d2,w)=>{
      const sc=d2+0.25*Math.abs(w)+(res.t==='p'?-0.001:0); // plan proche avant, point avant ligne à égalité
      if(!best||sc<best.sc)best={sc,res};
    };
    for(const s of (doc.sketches||[])){
      if(!s)continue;
      let B;try{B=sketchBasis(s);}catch(e){continue;}
      const dx=m[0]-B.o.x,dy=m[1]-B.o.y,dz=m[2]-B.o.z;
      const x2=dx*B.u.x+dy*B.u.y+dz*B.u.z,y2=dx*B.v.x+dy*B.v.y+dz*B.v.z,z2=dx*B.n.x+dy*B.n.y+dz*B.n.z;
      let bestP=null,bdP=RAD;
      Object.keys(s.points||{}).forEach(pid=>{const p=s.points[pid];if(!p)return;const d=Math.hypot(p.x-x2,p.y-y2);if(d<bdP){bdP=d;bestP=pid;}});
      if(bestP)consider({t:'p',sk:s.id,id:bestP,far:far?1:0},bdP,z2);
      let bestE=null,bdE=RAD;
      (s.entities||[]).forEach(e=>{
        if(e.construction||e.ref)return; // ancre = géométrie de profil uniquement
        if(e.t==='line'){
          const A0=s.points[e.p1],B0=s.points[e.p2];if(!A0||!B0)return;
          const d=distSeg2(x2,y2,A0.x,A0.y,B0.x,B0.y);
          if(d<bdE){bdE=d;bestE=e;}
        }else if(e.t==='circle'||e.t==='arc'){
          const C=s.points[e.pc];if(!C||!(e.r>0))return;
          if(e.t==='arc'){
            const an=arcAngles(s,e);if(!an)return;
            const TAU=Math.PI*2;
            const rel=((Math.atan2(y2-C.y,x2-C.x)-an.a1)%TAU+TAU)%TAU;
            if(rel>an.a2-an.a1+0.05)return; // hors du span : pas cette entité
          }
          const d=Math.abs(Math.hypot(x2-C.x,y2-C.y)-e.r);
          if(d<bdE){bdE=d;bestE=e;}
        }
      });
      if(bestE){
        // side suit l'épaisseur : bas≈0, haut≈distance
        const dists=(doc.features||[]).filter(f=>f.type==='extrude'&&f.sketchId===s.id&&f.visible!==false).map(f=>extrudeSpan(f));
        let side=0; // 0=bas,1=haut
        if(dists.length){
          // Une découpe « à travers tout » a une étendue SENTINELLE (±5000) : ni lo ni hi ne
          // décrit un niveau réel, isBottom ET isTop sont donc FAUX, et le repli
          // « isBottom?0:1 » tombait toujours sur 1 (HAUT). Conséquence mesurée : les arcs du
          // BAS d'une poche se voyaient ancrer sur son échelle HAUT, le bas n'était jamais
          // adouci et les 4 sélections se regroupaient sur les mêmes arêtes. Sans étendue
          // exploitable, le seul repère restant est le plan de l'esquisse : au-dessus (ou
          // dessus) = haut, en dessous = bas.
          const sentinelle=dists.every(d=>!isFinite(d.lo)||!isFinite(d.hi)||Math.abs(d.lo)>1000||Math.abs(d.hi)>1000);
          if(sentinelle){
            side=(z2>=-0.5)?1:0;
          }else{
            const isBottom=dists.some(d=>Math.abs(z2 - d.lo)<1.0);
            const isTop=dists.some(d=>Math.abs(z2 - d.hi)<1.0);
            side=isBottom?0:1;
            if(isBottom&&isTop)side=Math.abs(z2)<1.0?0:1;
          }
        } else side=Math.abs(z2)<1.0?0:1;
        consider({t:'e',sk:s.id,id:bestE.id,z:+z2.toFixed(3),side,dist:dists[0]?dists[0].hi:0,far:far?1:0},bdE,z2);
      }
    }
    return best?best.res:null;
  };
  return scan(1.0,false)||scan(8.0,true);
}
function xAnchorMatch(se,edges){
  // Arêtes du solide courant correspondant à l'ancre (test géométrique en 2D esquisse).
  // 'p' : verticales passant par le point. 'e' : milieux sur l'entité courante, à même hauteur.
  // Règle : UNE sélection = UNE arête. On ne retient jamais plusieurs candidates, sinon le
  // chanfrein se disperse sur plusieurs arêtes (une échoue) et la position mémorisée part
  // sur l'arête voisine : la référence est perdue à jamais dès que le solide change.
  const out=[];
  if(!se||!se.anchor)return out;
  const a=se.anchor,s=doc.sketches.find(k=>k.id===a.sk);
  if(!s)return out;
  let B;try{B=sketchBasis(s);}catch(e){return out;}
  const proj=m=>{
    const dx=m[0]-B.o.x,dy=m[1]-B.o.y,dz=m[2]-B.o.z;
    return[dx*B.u.x+dy*B.u.y+dz*B.u.z,dx*B.v.x+dy*B.v.y+dz*B.v.z,dx*B.n.x+dy*B.n.y+dz*B.n.z];
  };
  // Hauteur de référence : la POSITION D'ORIGINE de la sélection (figée à la création,
  // conservée même quand se.pos est rafraîchi) plutôt que la position courante.
  // ⚠ pos0 est en coordonnées MONDE alors que q[2] est RELATIF au plan de l'esquisse : les
  // comparer tels quels inverse haut et bas (mesuré sur une poche traversed par une découpe
  // « à travers tout » : les arcs du BAS, pos0 z=0, se résolvaient sur les arêtes du HAUT
  // parce que q[2]=0 y désignait le niveau supérieur). On projette donc pos0 comme un point.
  const zRef=(se.pos0&&se.pos0.length===3)?proj(se.pos0)[2]:(a.z||0);
  if(a.t==='p'){
    const p=s.points[a.id];if(!p)return out;
    // Hauteurs « naturelles » du solide pour cette esquisse (bas/haut des volumes qu'elle
    // a produits) : un coin empilé a une verticale par niveau — on prend celle du bon niveau.
    const spans=(doc.features||[]).filter(f=>f.type==='extrude'&&f.sketchId===a.sk&&f.visible!==false).map(f=>extrudeSpan(f));
    const dzPref=q2=>{
      if(!spans.length)return Math.abs(q2-zRef);
      let m=1e9;for(const d of spans){m=Math.min(m,Math.abs(q2-d.lo),Math.abs(q2-d.hi));}
      return Math.min(m,Math.abs(q2-zRef)+2); // à défaut, la position d'origine
    };
    let best=null;
    edges.forEach((e,i)=>{
      const q=proj(e.mid);
      const d2=Math.hypot(q[0]-p.x,q[1]-p.y);
      if(d2>5.0)return;
      const P0=e.pts[0],P1=e.pts[e.pts.length-1],L=Math.hypot(P1[0]-P0[0],P1[1]-P0[1],P1[2]-P0[2]);
      if(L<1e-9)return;
      const du=Math.abs(((P1[0]-P0[0])*B.u.x+(P1[1]-P0[1])*B.u.y+(P1[2]-P0[2])*B.u.z)/L);
      const dv=Math.abs(((P1[0]-P0[0])*B.v.x+(P1[1]-P0[1])*B.v.y+(P1[2]-P0[2])*B.v.z)/L);
      if(Math.max(du,dv)>0.1)return; // pas verticale : pas notre coin
      const sc=d2+0.3*dzPref(q[2]);
      if(!best||sc<best.sc)best={i,sc};
    });
    if(best)out.push(best.i);
    // Repli : aucune verticale ne convient → on accepte la meilleure arête QUELCONQUE passant
    // par le point d'esquisse. Cas réel : les lignes de 60 mm d'un bord de découpe sont
    // ancrées sur un point mais sont HORIZONTALES ; le filtre « verticale » les écartait,
    // la passe 2 saute les arêtes à ancre point, et le congé partait en « arête introuvable »
    // alors que l'arête était toujours là. Le repli ne s'active qu'à défaut de verticale.
    if(best)return out;
    let bestH=null;
    edges.forEach((e,i)=>{
      const q=proj(e.mid);
      const d2=Math.hypot(q[0]-p.x,q[1]-p.y);
      if(d2>5.0)return;
      const sc=d2+0.3*dzPref(q[2]);
      if(!bestH||sc<bestH.sc)bestH={i,sc};
    });
    if(bestH)out.push(bestH.i);
    return out;
  }
  const e=(s.entities||[]).find(k=>k.id===a.id);if(!e)return out;
  if(e.construction||e.ref)return out;
  // épaisseur courante pour recaler haut/bas (le z absolu change avec distance)
  const curDists=(doc.features||[]).filter(f=>f.type==='extrude'&&f.sketchId===a.sk&&f.visible!==false).map(f=>extrudeSpan(f));
  const curSideZ=(side)=>{
    if(!curDists.length)return side===0?0:(a.dist||a.z||10);
    if(side===0)return curDists[0].lo;
    return curDists[0].hi;
  };
  // Une découpe « à travers tout » a une étendue SENTINELLE (±5000) : l'attendue vaut alors
  // 5000, son terme de hauteur noie tous les autres critères (0.2×5000 = 1000) et une arête
  // voisine à 6 mm passe devant l'arête visée. On retombe sur la position d'origine.
  const rawZ=(a.side!==undefined)?curSideZ(a.side):(Math.abs(a.z)<0.6?curSideZ(0):curSideZ(1));
  const expectedZ=(!isFinite(rawZ)||Math.abs(rawZ)>1000)?zRef:rawZ;
  // Trois niveaux de tolérance, du plus strict au plus large : la hauteur
  // tolérances emboîtées, de la plus stricte à la plus large : la hauteur
  // attendue d'abord ; sinon la candidate la plus proche en hauteur ; sinon la plus proche
  // en 2D (le solide a bougé en Z parce qu'une AUTRE fonction a changé de hauteur).
  let bA=[],bB=[],bC=[];
  edges.forEach((ed,i)=>{
    const q=proj(ed.mid);
    const P0=ed.pts[0],P1=ed.pts[ed.pts.length-1];
    const dz2=Math.abs(P1[2]-P0[2]),dxy2=Math.hypot(P1[0]-P0[0],P1[1]-P0[1]);
    const vert=dz2>dxy2;
    const ldiff=Math.abs((ed.len||0)-(se.len||0));
    let d2=null;
    if(e.t==='line'){
      const A0=s.points[e.p1],B0=s.points[e.p2];if(!A0||!B0)return;
      d2=distSeg2(q[0],q[1],A0.x,A0.y,B0.x,B0.y);
    }else if(e.t==='circle'||e.t==='arc'){
      const C=s.points[e.pc];if(!C||!(e.r>0))return;
      if(e.t==='arc'){
        const an=arcAngles(s,e);if(!an)return;
        const TAU=Math.PI*2;
        const rel=((Math.atan2(q[1]-C.y,q[0]-C.x)-an.a1)%TAU+TAU)%TAU;
        if(rel>an.a2-an.a1+0.05)return; // hors du span : pas cette entité
      }
      d2=Math.abs(Math.hypot(q[0]-C.x,q[1]-C.y)-e.r);
    } else return;
    // Ancre « far » (arête née d'un congé/chanfrein) : l'arc est à quelques mm de l'entité 2D
    // qui l'a produit → tolérance élargie, sinon plus aucune candidate et référence perdue.
    if(d2>(a.far?8.0:2.5))return;
    const zErr=Math.abs(q[2]-expectedZ);
    // DISTANCE À LA POSITION D'ORIGINE — terme UNIFORME, présent dans les deux branches.
    // pos0 est la donnée la plus durable qui soit (elle ne bouge jamais). Sans elle, deux
    // arêtes très proches en 2D se départagent au hasard, le mauvais choix est écrit dans
    // se.pos/se.len par take() et le treuil s'enclenche : à chaque rejeu l'erreur s'aggrave
    // (constaté : un congé R2 sur le bord d'une poche « à travers tout » dérivait sur la bande
    // de coin, puis le document devenait illisible). Plafonné à 60 mm : après un déplacement
    // volontaire du modèle le terme sature et la géométrie de l'esquisse reprend la main.
    const d0=(se.pos0&&se.pos0.length===3)
      ?Math.hypot(ed.mid[0]-se.pos0[0],ed.mid[1]-se.pos0[1],ed.mid[2]-se.pos0[2]):0;
    const p0t=0.6*Math.min(d0,60);
    const sc=vert?(d2+0.3*Math.min(ldiff,20)+0.2*Math.abs(q[2]-zRef)+p0t):(d2+0.3*Math.min(ldiff,30)+0.2*zErr+p0t);
    const row={i,sc,d0};
    if(zErr<=1.0)bA.push(row);
    else if(zErr<=8.0)bB.push(row);
    else bC.push(row);
  });
  // Une seule arête par sélection. Deux départages successifs, tous deux fondés sur pos0 :
  //  1) le score ci-dessus (qui punit l'écart à la position d'origine) ;
  //  2) à score géométrique équivalent (fenêtre de 6 mm) — c'est le cas de l'arc d'un congé
  //     et de son segment collinéaire, tous deux à moins de 8 mm de la MÊME entité 2D et dont
  //     le 2D ne peut pas les distinguer (le segment a même un d2 nul). Sans ce second
  //     départage, l'arc et le segment se rejoignent sur une arête et l'une des deux
  //     sélections est perdue. La fenêtre borne l'effet : au-delà de 6 mm, c'est la géométrie
  //     de l'esquisse qui fait foi (un déplacement volontaire d'esquisse reste suivi).
  const pick=(bk)=>{
    if(!bk.length)return null;
    bk.sort((x,y)=>x.sc-y.sc);
    const g0=bk[0].sc;
    const near=bk.filter(c=>c.sc<=g0+6);
    if(near.length<2)return bk[0].i;
    near.sort((x,y)=>x.d0-y.d0);
    return near[0].i;
  };
  const chosen=pick(bA);
  if(chosen!==null){out.push(chosen);return out;}
  const c2=pick(bB);
  if(c2!==null){out.push(c2);return out;}
  const c3=pick(bC);
  if(c3!==null)out.push(c3);
  return out;
}

function occApplyXFillets(base,xfils){
  // Congés/chanfreins exacts : 1) ancre esquisse recalculée (suit les éditions), 2) repli position+longueur.
  // Add_2 par arête, échec isolé (jamais de crash app).
  const warns=[];
  const chamfer=(xfils||[]).some(x=>x&&x.chamfer);
  const lab=xLabelLow(chamfer?'chamfer':'fillet');
  const dp=chamfer?'D':'R';
  const edges=occListEdges(base);
  if(!edges.length){warns.push(lab+' : aucune arête détectée');return{shape:base,warnings:warns};}
  // Anciennes sélections corrompues (anciennes passes multi-candidats) : positions en double →
  // fusion des jumeaux AVANT le réappariement. ATTENTION : trois arêtes distinctes d'une bande
  // de coin (coincidence de deux congé/chanfrein) ont le MÊME milieu — les fusionner sur la
  // seule position détruit la sélection (constaté : « 8 doublon(s) fusionné(s) », 4 arêtes
  // perdues). On exige donc aussi la même longueur : deux vraies arêtes jumelles se
  // ressemblent jusque dans leur longueur ; deux arêtes d'un coin, non. La fusion exacte est
  // garantie plus bas, sur l'index d'arête réellement résolu.
  xfils.forEach(xf=>{
    const uniq=[];let nd=0;
    (xf.edges||[]).forEach(se=>{
      if(uniq.some(u=>Math.abs((u.r||0)-(se.r||0))<1e-9
        &&Math.abs((u.len||0)-(se.len||0))<=Math.max(0.01,0.02*(se.len||0))
        &&Math.hypot(u.pos[0]-se.pos[0],u.pos[1]-se.pos[1],u.pos[2]-se.pos[2])<=0.75)){nd++;return;}
      uniq.push(se);
    });
    if(nd){xf.edges=uniq;warns.push(`${xf.name||lab} : ${nd} doublon(s) fusionné(s)`);}
  });
  const near=(a,b,tol)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])<tol;
  const xNum=v=>String(+(+v).toFixed(2)).replace('.',','); // rayon/longueur : 16 et non 16,0
  const jobs=[],matchedSe=new Set();
  const take=(bi,r,se)=>{
    if(se){matchedSe.add(se);if(!se.pos0)se.pos0=se.pos.slice(); // POSITION D'ORIGINE figée : c'est elle la référence durable
      se.pos=edges[bi].mid.slice();se.len=+edges[bi].len.toFixed(3);} // snapshot rafraîchi (repli plus tard)
    const dup=jobs.find(j=>j.bi===bi);
    if(dup)dup.r=Math.max(dup.r,r);else jobs.push({bi,r});
  };
  xfils.forEach(xf=>{
    (xf.edges||[]).forEach(se=>{
      if(!(se.r>0))return;
      // Passe 0 : ancre absente (anciens projets avant persistance anchor) → recalée sur se.pos.
      // XY inchangé (changement de hauteur) : retrouve point/entité → passe 1 suit la cote/distance.
      if(!se.anchor){try{const a0=xAnchorFor(se.pos);if(a0)se.anchor=a0;}catch(e){}}
      // Passe 1 : ancre esquisse (test géométrique en 2D : suit points/lignes/cercles
      // déplacés + arêtes scindées en hauteur par les découpes).
      // La POSITION D'ORIGINE (pos0 = point cliqué) est la référence la plus fiable : une
      // sélection d'arête se fait d'un clic, donc à 0,75 mm près. On s'en sert pour RECADRER
      // les candidats de l'ancre : sans ce contrôle, une ancre d'esquisse qui dérive (mauvaise
      // entité, sketch rejoué sur un autre corps) fait Applying un congé sur une arête à
      // 15+ mm du clic, en silence (constaté : arête de 20 mm sélectionnée → arrondi tenté
      // sur une arête de 28,9 mm à 17,6 mm, le R demandé refusé à tort). On garde
      // l'ANCRAGE quand même (une arête peut légitimement s'être déplacée avec son sketch :
      // c'est tout l'intérêt de l'ancre), mais on refuse un candidat d'ancre qui est à plus de
      // 2 mm du clic ET dont la longueur s'écarte — sauf si c'est le SEUL candidat.
      const anchored=xAnchorMatch(se,edges);
      if(anchored.length){
        const ref=se.pos0&&se.pos0.length===3?se.pos0:se.pos;
        const dRef=i=>{const e=edges[i];return Math.hypot(e.mid[0]-ref[0],e.mid[1]-ref[1],e.mid[2]-ref[2]);};
        let best=-1,bd=1e9;
        anchored.forEach(i=>{const d=dRef(i);if(d<bd){bd=d;best=i;}});
        // Ancre « saine » : le meilleur candidat est au droit du clic.
        if(bd<=2.0){anchored.forEach(i=>take(i,se.r,se));return;}
        // Ancre « divergente » : l'arête est-elle encore là où l'utilisateur a cliqué ?
        // (On ne se fie PAS à se.len : ce champ est réécrit à chaque réappariement, il a donc
        //  pu hériter de la longueur d'une mauvaise arête — le critère fiable est la distance
        //  au clic, une sélection d'arête se fait à 0,75 mm près.)
        const born=[];
        edges.forEach((e,i)=>{if(dRef(i)<=2.0)born.push(i);});
        if(born.length){ // l'arête sélectionnée existe toujours → l'ancre a divergé, on l'ignore
          born.sort((a,b)=>dRef(a)-dRef(b));
          take(born[0],se.r,se);
          // Une seule ligne par divergence (le rejeu passe à chaque édition : inutile de
          // répéter le même avertissement 20 fois dans le journal).
          const clef=+bd.toFixed(1);
          if(se._div!==clef){se._div=clef;
            warns.push(`congé ${dp}${xNum(se.r)} : ancre d'esquisse divergente ignorée (pointait ${xNum(bd)} mm du clic) — arête sélectionnée rétablie`);}
          return;
        }
        anchored.forEach(bi=>take(bi,se.r,se));return;
      }
      // Passe 2 : MEILLEUR candidat unique (une sélection = UNE arête ; hit multiples →
      // positions réécrites en doublons + arêtes étrangères dans le lot d'arrondi).
      // Verticale : MÊME coin en XY (tol 3 mm — ignore Z/longueur : suit épaisseur).
      // Horizontale : plan Z de référence + longueur proche (avant : 10 mm XY + Z optionnel
      // acceptait les arêtes latérales du canal — cas « Sans titre »).
      const cands=[];
      edges.forEach((e,i)=>{
        const xyd=Math.hypot(e.mid[0]-se.pos[0],e.mid[1]-se.pos[1]);
        if(xyd>10.0)return; // préfilter local
        const p0=e.pts[0],p1=e.pts[e.pts.length-1];
        const dz=Math.abs(p1[2]-p0[2]),dxy=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]);
        if(dz>dxy){
          if(xyd>3.0)return;
          cands.push({i,s:xyd+0.2*Math.min(Math.abs(e.mid[2]-se.pos[2]),10)+0.15*Math.min(Math.abs(e.len-se.len),20)});
          return;
        }
        let zref=se.pos[2];
        if(se.anchor&&se.anchor.t==='e'){
          const curDists=(doc.features||[]).filter(f=>f.type==='extrude'&&f.sketchId===se.anchor.sk&&f.visible!==false).map(f=>extrudeSpan(f));
          const zr=(se.anchor.z!==undefined&&se.anchor.z!==null)?se.anchor.z:se.pos[2];
          const cd=curDists[0]||{lo:0,hi:0};
          zref=(se.anchor.side!==undefined)?(se.anchor.side===0?cd.lo:cd.hi):(Math.abs(zr)<0.6?cd.lo:cd.hi);
        } else if(se.anchor&&se.anchor.t==='p'){
          return; // ancre point = verticales (passée 1)
        }
        if(Math.abs(e.mid[2]-zref)>1.5)return;
        if(se.len>0&&Math.abs(e.len-se.len)>Math.max(1.5,0.25*se.len))return;
        cands.push({i,s:xyd+0.2*Math.abs(e.mid[2]-zref)+0.15*Math.abs(e.len-se.len)});
      });
      if(cands.length){cands.sort((a,b)=>a.s-b.s);take(cands[0].i,se.r,se);}
    });
  });
  // Passe 3 : signature de groupe pour orphelins (anciennes sélections déplacées).
  // Sûr : applique seulement si #candidats == #orphelins du groupe (bijection, même R).
  const orphans=[];
  xfils.forEach(xf=>(xf.edges||[]).forEach(se=>{if(se.r>0&&!matchedSe.has(se))orphans.push({se,xf});}));
  const groups=new Map();
  orphans.forEach(o=>{
    const k=Math.round(o.se.pos[2]*2)/2+'|'+o.se.r;
    if(!groups.has(k))groups.set(k,[]);
    groups.get(k).push(o);
  });
  groups.forEach(list=>{
    if(!list.length)return;
    const zref=list[0].se.pos[2],rr=list[0].se.r;
    const taken=new Set(jobs.map(j=>j.bi));
    const cands=[];
    // z tol large pour suivre l'épaisseur (haut/bas déplacés)
    const zTol=25;
    edges.forEach((e,i)=>{
      if(taken.has(i))return;
      if(Math.abs(e.mid[2]-zref)>zTol+10)return;
      cands.push(i);
    });
    if(cands.length===list.length&&cands.length>0){
      cands.forEach((bi,k)=>take(bi,list[k].se.r,list[k].se));
      warns.push(`boucle de ${cands.length} arête(s) retrouvée par signature (z≈${zref.toFixed(1)}, ${dp}${rr})`);
    }else{
      list.forEach(o=>warns.push(`${chamfer?'chanfrein':'congé'} ${dp}${o.se.r} : arête introuvable près de (${o.se.pos.map(v=>v.toFixed(1)).join(', ')}) — géométrie modifiée ? (re-sélectionnez la boucle)`));
    }
  });
  xfils.forEach(xf=>{
    const es=(xf.edges||[]).filter(se=>se.r>0);
    xf._m={m:es.filter(se=>matchedSe.has(se)).length,t:es.length};
    // position des arêtes PERDUES (non retrouvées dans la géométrie actuelle) : sans
    //elles, le panneau ne pouvait dire que « 6/8 » sans indiquer lesquelles.
    const manque=es.filter(se=>!matchedSe.has(se));
    if(manque.length)xf._miss=manque.map(se=>se.pos.map(v=>+v.toFixed(2)));
    else delete xf._miss;
  });
  if(!jobs.length)return{shape:base,warnings:warns};
  const js=jobs.map(j=>({src:edges[j.bi].src,r:j.r,mid:edges[j.bi].mid.slice()}));
  const s=occFilletRun(base,js,warns,chamfer);
  if(!s){
    // ÉCHEC : l'appli ne peut pas appliquer la fonction, mais « rouge + refus muet » est le
    // pire des messages. On cherche le plus grand rayon qui MARCHE (échelle descendante, chemin
    // d'échec rare) pour proposer une correction VÉRIFIÉE au lieu d'un « rayon trop grand ? ».
    const rMax=Math.min.apply(null,js.map(j=>j.r));
    const lMin=Math.min.apply(null,jobs.map(j=>edges[j.bi].len||0));
    const dl=lMin>0?` sur une arête de ${xNum(lMin)} mm`:'';
    let ok=null;
    for(const k of [0.7,0.5,0.4,0.3,0.2]){
      const r2=Math.max(0.5,+(rMax*k).toFixed(2));
      const w2=[];
      const t=occFilletRun(occShapeCopy(base),js.map(j=>({src:j.src,r:r2,mid:j.mid.slice()})),w2,chamfer);
      if(t){ok=r2;try{t.delete();}catch(e){}break;}
    }
    const why=chamfer?'distance trop grande':'rayon trop grand';
    warns.push(`${lab} ${dp}${xNum(rMax)} impossible sur ${js.length} arête(s)${dl} — ${why} ou faces déjà consommées par un autre congé ?`+(ok?` ESSAYEZ ${dp}${xNum(ok)} (vérifié)`:' — arête trop courte, aucun rayon testé ne passe'));
    const conseil=ok?`${dp}${xNum(rMax)} impossible${dl} — essayez ${dp}${xNum(ok)} (vérifié)`
      :`${dp}${xNum(rMax)} impossible${dl} — arête trop courte ou faces déjà consommées par un autre congé`;
    xfils.forEach(xf=>{xf._err=conseil;});
    return{shape:base,warnings:warns};
  }
  xfils.forEach(xf=>{delete xf._err;}); // plus d'erreur : le rayon courant passe
  try{base.delete();}catch(e){}
  return{shape:s,warnings:warns};
}
function occXDefl(){
  // Finesse adaptative : les petits rayons exigent une déflection fine pour un aspect lisse.
  let mr=1e9;
  doc.features.filter(x=>x.type==='xfillet'&&x.visible!==false).forEach(xf=>(xf.edges||[]).forEach(se=>{if(se.r>0&&se.r<mr)mr=se.r;}));
  if(!(mr<1e9))return{lin:0.5,ang:0.5};
  return{lin:Math.min(0.5,Math.max(0.04,mr/10)),ang:0.25};
}
function occCleanup(FR,keepShape){
  if(!FR)return;
  occDispose(FR.bin);
  (FR.itemShapes||[]).forEach(s=>{if(s!==keepShape){try{s.delete();}catch(e){}}});
  if(FR.shape&&FR.shape!==keepShape){try{FR.shape.delete();}catch(e){}}
}
/* ---------- cache de rejeu : solide accumulé en « points de contrôle » ----------
   Mesuré sur le noyau exact : une fusion costs 67-170 ms, une COPIE du solide
   accumulé 1-4 ms (30 a 80x moins cher). On memorise donc le solide tel qu'il est
   apres chaque fonction. Si le DEBUT de la timeline est inchange, on repart de la
   derniere copie correspondante et on ne refait QUE les fusions a partir de la
   modification — exactement le principe « reconstruire a partir de la modification ».
   Les cles sont des signatures de prefixe cumulatives : un seul octet de difference
   invalide tout ce qui suit, donc aucune geometrie perimee ne peut etre reutilisee. */
let occCk=[]; // [{key,shape}] du plus ancien au plus recent
let occCkWarn={}; // avertissements de congé par point de contrôle (mêmes entrées = mêmes messages)
// Limite adaptative : 8 points de contrôle sur une timeline de 13 fonctions évacuaient les
// prÉfixes (les projections upto<13 ne trouvaient JAMAIS leur point de contrôle → rejeu
// complet 4 fois par reconstruction). On couvre toute la timeline, bornée pour la mémoire.
function occCkMax(){
  const n=(((typeof doc!=='undefined')&&doc&&doc.features)?doc.features.length:0)+2;
  return n<8?8:(n>48?48:n);
}
function occShapeCopy(sh){
  try{return new occt.BRepBuilderAPI_Copy_2(sh,true,true).Shape();}catch(e){return null;}
}
function occCkClear(){
  for(const c of occCk){try{c.shape.delete();}catch(e){}}
  occCk=[];occCkWarn={};
}
function skSig(sk){
  // Signature numerique d'une esquisse : base (position + axes), points, entites,
  // contraintes, cotes. MarcheArithmetique directe — pas de JSON.stringify (40x moins cher).
  let h=2166136261;
  const mix=v=>{h^=(+v||0)|0;h=Math.imul(h,16777619);};
  mix(sk.seq);
  const u=sk.axU||[1,0,0],v=sk.axV||[0,1,0],w=sk.axN||[0,0,1],o=sk.origin||[0,0,0];
  for(let i=0;i<3;i++){mix((+u[i]*1e6)|0);mix((+v[i]*1e6)|0);mix((+w[i]*1e6)|0);mix((+o[i]*1e6)|0);}
  // Seul le PROFIL compte : construction et références 3D ne participent jamais au solide
  // (extrusion, ancrages) — les projeter ne doit donc pas invalider les points de contrôle.
  const C=sk.constraints||[],D=sk.dims||[],P=sk.points||{};
  const E=(sk.entities||[]).filter(e=>!e.construction&&!e.ref);
  const used=new Set();
  for(const e of E){used.add(e.p1);used.add(e.p2);used.add(e.pc);used.add(e.pa);used.add(e.pb);used.add(e.p);}
  mix(E.length);mix(C.length);mix(D.length);
  const K=Object.keys(P).filter(k=>used.has(k));mix(K.length);
  for(const k of K){
    for(let i=0;i<k.length;i++)mix(k.charCodeAt(i));
    const p=P[k]||{};mix((+p.x*1000)|0);mix((+p.y*1000)|0);
  }
  for(const e of E){mix(e.t?e.t.length:0);mix((+e.r*1000)|0);mix(e.p1?e.p1.length:0);mix(e.p2?e.p2.length:0);}
  for(const c of C)mix(c.type?c.type.length:0);
  return (h>>>0).toString(36);
}
function featSig(f){
  // Signature COMPLÈTE des entrées dont dépend le solide : toute propriété lue par
  // extrudeSpan / occShapeOfExtrude / occApplyXFillets doit y figurer, sinon le cache
  // pourrait réutiliser un solide périmé.(paramètres d'extrusion, à travers tout, congés
  // et rims 2D rattachés, arêtes et rayon des chanfreins/congés exacts, répétitions).
  let s=f.type+'|'+(f.op||'add')+'|'+(+f.distance||0)+'|'+(f.mid?1:0)+'|'+(f.visible!==false?1:0)+'|'+(f.through?1:0)+'|'+(f.upto?JSON.stringify(f.upto):'');
  if(f.type==='extrude'||f.type==='revolve'){
    s+='|'+f.sketchId;
    const sk=doc.sketches.find(x=>x.id===f.sketchId);s+='|'+(sk?skSig(sk):'?');
    if(f.type==='revolve')s+='|ax'+JSON.stringify(f.axis||null)+'|an'+(+f.angle||360);
    // Congés 2D et rims rattachés à CETTE extrusion (ils modifient son prisme)
    (doc.features||[]).forEach(x=>{
      if(x.type!=='fillet'||x.target!==f.id||x.visible===false)return;
      s+=';fill'+(+x.radius||0)+(x.rimTop?1:0)+(x.rimBot?1:0)+JSON.stringify(x.rims||null);
    });
  }else if(f.type==='xfillet'){
    // Le RAYON et l'ANCRE font partie de la géométrie : sans eux, changer le rayon d'un
    // congé laissait la signature inchangée et le point de contrôle réappliquait l'ancien
    // solide (le congé nouveau n'apparaissait pas). `pos`/`len` sont rafraîchis par
    // occApplyXFillets à chaque appariage réussi, donc ils décrivent l'arête réellement
    // résolue ; l'ancre décrit le ciblage (même position, arête voisine possible).
    s+='|'+(f.chamfer?1:0)+'|'+((f.edges||[]).map(e=>
      (+e.r||0)+'/'+(+e.len||0)+'@'+(e.pos||[]).map(x=>(+x).toFixed(3)).join(',')
      +((e.anchor)?('#'+e.anchor.t+(e.anchor.sk||'')+(e.anchor.id||'')+'z'+(e.anchor.z||0)+'s'+(e.anchor.side||0)+'d'+(e.anchor.dist||0)+'f'+(e.anchor.far||0)):'')).join(';'));
  }else if(f.type==='xmove'){
    // La DISTANCE fait partie de la géométrie, et la face visée par sa référence durable
    // (centre + normale + dimensions) : sans elle, changer la distance d'un déplacement
    // laisserait la signature inchangée et le point de contrôle réappliquerait l'ancien.
    s+='|d'+(+f.dist||0)+'@'+JSON.stringify(f.ref||null);
  }else if(f.type==='xdraft'){
    // L'ANGLE fait partie de la géométrie, ainsi que la face de référence (plan neutre)
    // et les faces visées (références durables pos/n/dim). Sans elles, changer l'angle
    // laissait la signature inchangée et le point de contrôle réappliquait l'ancien
    // solide — la dépouille semblait « valide » mais restait invisible (Pièce 7).
    const q=r=>r?((r.pos||[]).map(v=>(+v).toFixed(2)).join(',')+'/'+(r.n||[]).map(v=>(+v).toFixed(3)).join(',')+'/'+(r.dim||[]).map(v=>(+v).toFixed(2)).join(',')):'?';
    s+='|a'+(+f.angle||0)+'@'+q(f.ref)+'|'+((f.faces||[]).map(q).join(';'));
  }else if(f.type==='xshell'){
    // L'ÉPAISSEUR et les faces RETIRÉES (ouvertures) font partie de la géométrie :
    // sans elles le cache réappliquerait l'ancien évidage après un changement.
    const q=r=>r?((r.pos||[]).map(v=>(+v).toFixed(2)).join(',')+'/'+(r.n||[]).map(v=>(+v).toFixed(3)).join(',')+'/'+(r.dim||[]).map(v=>(+v).toFixed(2)).join(',')):'?';
    s+='|t'+(+f.thick||0)+'|'+((f.faces||[]).map(q).join(';'));
  }else if(f.type==='repeat'){
    s+='|'+(f.base||[]).join(',')+'|'+(+f.copies||1)+'|'+(+f.dist||0)+'|'+(+f.angle||0)+'|'+(f.axis||f.plane||'');
  }
  return s;
}
function occCkGet(key){
  for(let i=occCk.length-1;i>=0;i--)if(occCk[i].key===key)return occCk[i].shape;
  return null;
}
function occCkPut(key,shape){
  if(!shape)return;
  const i=occCk.findIndex(c=>c.key===key);
  if(i>=0){
    // Déjà mémorisé : on GARDE l'existant, on remonte sa fraîcheur (fin de file = à évacuer
    // en dernier) et on jette la copie surnuméraire. (Ne comparer qu'à la dernière clé
    // laissait les doublons gonfler la file et évacuer les vrais points de contrôle.)
    const old=occCk[i];occCk.splice(i,1);occCk.push(old);
    try{shape.delete();}catch(e){}
    return;
  }
  occCk.push({key,shape});
  while(occCk.length>occCkMax()){const old=occCk.shift();try{old.shape.delete();}catch(e){}}
}
function occFinalShape(upto){
  // Rejeu STRICT dans l'ordre timeline (antériorité) : extrudes add/cut ET congés exacts
  // entrelacés. Un congé placé avant une découpe est traversé par elle (comme Fusion),
  // un congé placé après arrondit aussi les arêtes nées de la découpe.
  // upto = indice exclusif (rejeu partiel pour références d'esquisse) ; null = tout.
  // Retourne {shape, ghostShapes, msgs, bin, itemShapes, items} — l'appelant nettoie sauf shape conservée.
  const bin=[],itemShapes=[];let result=null;const msgs=[],ghostShapes=[];
  let ckKey=(occSkipFeat||'')+'|'; // signature cumulée du préfixe — SANS marqueur upto :
  // ALL et UPn parcourent les MÊMES préfixes cumulatifs ; un marqueur dans la clé privait
  // les projections (upto<n) de tous les points de contrôle posés par le rejeu complet.
  const items=[]; // extrudes réussies, dans l'ordre (affichage nA/nC)
  const feats=doc.features.filter(f=>f.visible!==false);
  (upto==null?feats:feats.slice(0,upto)).forEach(f=>{
    if(occSkipFeat&&f.id===occSkipFeat)return; // édition de congé : rejeu SANS cette fonction
    ckKey+=featSig(f)+';';
    if(f.type==='xfillet'){
      if(!result){msgs.push(`${f.name} : aucun volume à congédier — ignoré`);return;}
      // Préfixe inchangé : ce congé exact est déjà appliqué dans la copie mémorisée —
      // solide ET avertissements réutilisés sans rejouer l'opération (6 congés ≈ 30 ms/pièce).
      const ckX=occCkGet(ckKey);
      const cpX=ckX?occShapeCopy(ckX):null;
      if(cpX){
        try{result.delete();}catch(e){}result=cpX;
        const w=occCkWarn[ckKey];if(w&&w.length)msgs.push(...w.map(x=>`${f.name} : ${x}`));
        return;
      }
      const r=occApplyXFillets(result,[f]);
      result=r.shape;msgs.push(...r.warnings.map(w=>`${f.name} : ${w}`));
      if(r.warnings.length)occCkWarn[ckKey]=r.warnings.slice();else delete occCkWarn[ckKey];
      occCkPut(ckKey,occShapeCopy(result));
      return;
    }
    if(f.type==='xmove'){
      if(!result){msgs.push(`${f.name} : aucun volume à déformer — ignoré`);return;}
      const ckM=occCkGet(ckKey);
      const cpM=ckM?occShapeCopy(ckM):null;
      if(cpM){
        try{result.delete();}catch(e){}result=cpM;
        const w=occCkWarn[ckKey];if(w&&w.length)msgs.push(...w.map(x=>`${f.name} : ${x}`));
        return;
      }
      const r=occApplyMoveFace(result,f);
      result=r.shape;msgs.push(...r.warnings.map(w=>`${f.name} : ${w}`));
      if(r.warnings.length)occCkWarn[ckKey]=r.warnings.slice();else delete occCkWarn[ckKey];
      occCkPut(ckKey,occShapeCopy(result));
      return;
    }
    if(f.type==='xdraft'){
      // Dépouillage (angle de démoulage) : sans cette branche la fonction était
      // silencieusement SAUTÉE par le `return` générique ci-dessous — l'arbre
      // l'affichait « valide » (4 faces, pas d'erreur) mais le solide restait
      // inchangé (Pièce 7). Même pattern que xmove : cache + warnings.
      if(!result){msgs.push(`${f.name} : aucun volume à dépouiller — ignoré`);return;}
      const ckD=occCkGet(ckKey);
      const cpD=ckD?occShapeCopy(ckD):null;
      if(cpD){
        try{result.delete();}catch(e){}result=cpD;
        const w=occCkWarn[ckKey];if(w&&w.length)msgs.push(...w.map(x=>`${f.name} : ${x}`));
        return;
      }
      const r=occApplyDraft(result,f);
      result=r.shape;msgs.push(...r.warnings.map(w=>`${f.name} : ${w}`));
      if(r.warnings.length)occCkWarn[ckKey]=r.warnings.slice();else delete occCkWarn[ckKey];
      occCkPut(ckKey,occShapeCopy(result));
      return;
    }
    if(f.type==='xshell'){
      // Coque (évidage paroi mince) : même pattern que dépouillage/déplacement —
      // cache par point de contrôle + warnings. Sans cette branche la fonction
      // serait silencieusement sautée par le `return` générique ci-dessous.
      if(!result){msgs.push(`${f.name} : aucun volume à évider — ignoré`);return;}
      const ckS=occCkGet(ckKey);
      const cpS=ckS?occShapeCopy(ckS):null;
      if(cpS){
        try{result.delete();}catch(e){}result=cpS;
        const w=occCkWarn[ckKey];if(w&&w.length)msgs.push(...w.map(x=>`${f.name} : ${x}`));
        return;
      }
      const r=occApplyCoque(result,f);
      result=r.shape;msgs.push(...r.warnings.map(w=>`${f.name} : ${w}`));
      if(r.warnings.length)occCkWarn[ckKey]=r.warnings.slice();else delete occCkWarn[ckKey];
      occCkPut(ckKey,occShapeCopy(result));
      return;
    }
    if(f.type!=='extrude'&&f.type!=='revolve')return;
    // Pour une découpe « à travers tout », l'étendue se mesure sur le solide DÉJÀ reconstruit
    // (tout ce qui précède dans la timeline) — jamais sur l'affichage de l'édition précédente.
    occThroughBase=(f.type==='extrude'&&f.through&&result)?result:null;
    let shape=null;
    try{
      const r=(f.type==='revolve')?occShapeOfRevolve(f):occShapeOfExtrude(f);
      bin.push(...r.bins);itemShapes.push(r.shape);
      if(r.warnings.length)msgs.push(...r.warnings.map(w=>`${f.name} : ${w}`));
      shape=r.shape;items.push({f,shape});
    }catch(err){
      // Isolation : UNE esquisse fautive ne fait plus basculer tout le solide en maillage.
      msgs.push(`${f.name} : exclu de l'exact (${err.message})`);
      try{
        const gl=(f.type==='revolve')?legacyRevolveGeos(f,msgs):legacyPrismGeos(f,msgs);
        gl.forEach(g=>ghostShapes.push({geo:g,orphan:true,inexact:f.name,fid:f.id}));
      }catch(e2){msgs.push(`${f.name} : même le maillage échoue (${e2.message})`);}
      return;
    }
    const op=f.op||'add';
    if(op==='cut'){
      // Fantôme tessellé AVANT delete (use-after-delete = crash + repli fantôme).
      const ghostGeo=(()=>{try{return occTessellate(shape,0.5);}catch(e){msgs.push(`${f.name} : outil illisible`);return null;}})();
      if(!result){msgs.push(`${f.name} : découpe dans le vide — ignorée`);if(ghostGeo)ghostShapes.push({geo:ghostGeo,orphan:true,fid:f.id});return;}
      if(ghostGeo)ghostShapes.push({geo:ghostGeo,orphan:false,fid:f.id});
      // Préfixe inchangé : le solide accumulé contient DÉJÀ cette découpe → on saute le
      // booléen (le plus coûteux) et on adopte la copie mémorisée.
      const ckC=occCkGet(ckKey);
      const cpC=ckC?occShapeCopy(ckC):null;
      if(cpC){try{result.delete();}catch(e){}result=cpC;return;}
      const c=occCut(result,shape);
      try{result.delete();}catch(e){}try{shape.delete();}catch(e){}
      result=c;
    }else{
      if(!result){result=shape;occCkPut(ckKey,occShapeCopy(result));return;}
      // Préfixe inchangé : la fusion est déjà faite dans la copie mémorisée.
      const ckA=occCkGet(ckKey);
      const cpA=ckA?occShapeCopy(ckA):null;
      if(cpA){try{result.delete();}catch(e){}result=cpA;return;}
      // Union additive "Uni" : unification des faces coplanaires (pas de couture au
      // passage d'une fonction à l'autre — face verticale = UNE face, pas 2).
      const u=occUnify(occFuse(result,shape));
      try{result.delete();}catch(e){}try{shape.delete();}catch(e){}
      result=u;
    }
    occCkPut(ckKey,occShapeCopy(result)); // point de contrôle pour le rejeu suivant
  });
  return{shape:result,ghostShapes,msgs,bin,itemShapes,items};
}
function legacyPrismGeos(f,warnArr){
  // Prisme maillage (monde) d'une extrusion — même construction que la voie repli. Jette si profil vide.
  const sk=doc.sketches.find(s=>s.id===f.sketchId);if(!sk)throw new Error('esquisse introuvable');
  const fils=doc.features.filter(x=>x.type==='fillet'&&x.target===f.id&&x.visible!==false);
  let built=sketchShape(sk);
  if(fils.length){
    const rf=applyFilletsToSketch(sk,fils);
    if(warnArr)warnArr.push(...rf.warnings.map(w=>`${f.name} : ${w}`));
    built=sketchShape(rf.sk);
  }
  if(!built.shapes.length){
    let m=`Esquisse ${sk.name} : contour non fermé`;
    const ends=(built.opens||[]).slice(0,3).map(o=>`(${o.x.toFixed(1)}, ${o.y.toFixed(1)})`);
    if(ends.length)m+=` — bouts ouverts : ${ends.join(' · ')}`;
    throw new Error(m);
  }
  const{u,v,n,o}=sketchBasis(sk);
  const m=new THREE.Matrix4().makeBasis(u,v,n);m.setPosition(o);
  let bevelR=0;fils.forEach(fi=>{const r=fi.rims||(fi.rimTop||fi.rimBot?{top:!!fi.rimTop,bottom:!!fi.rimBot}:null);if(r&&(r.top&&r.bottom)&&fi.radius>bevelR)bevelR=fi.radius;});
  // simple face = pas de bevel symétrique : l'indépendant haut OU bas se fait en exact OCCT (⤢)
  const sp=extrudeSpan(f),len=Math.max(1e-6,sp.hi-sp.lo);
  if(bevelR>0){bevelR=Math.min(bevelR,len/2.2,8);if(bevelR<0.05)bevelR=0;}
  const geos=[];
  built.shapes.forEach(shape=>{
    const g=bevelR>0
      ?new THREE.ExtrudeGeometry(shape,{depth:Math.max(0.5,len-bevelR),bevelEnabled:true,bevelThickness:bevelR,bevelSize:Math.max(0.05,bevelR*0.9),bevelSegments:4,curveSegments:48})
      :new THREE.ExtrudeGeometry(shape,{depth:len,bevelEnabled:false,curveSegments:48});
    g.translate(0,0,sp.lo); // plage [lo,hi] (symétrique = -h..+h ; négatif = lo<0, hi=0)
    g.applyMatrix4(m);
    geos.push(g);
  });
  return geos;
}
function occRebuild(){
  // Retourne true si la voie exacte a abouti (même partiellement), false pour repli maillage.
  occDropLive();
  let FR=null;
  try{
    FR=occFinalShape(tlReplayCount());
    const D=occXDefl();
    if(FR.shape){
      const g=occTessellate(FR.shape,D.lin,D.ang);
      const tris=(g.attributes.position.count/3)|0;
      if(tris>0){
        const _fa=FR.items.filter(j=>(j.f.op||'add')==='add');
        const _ff=_fa.map(j=>j.f).find(f=>f.color>0)||_fa.map(j=>j.f)[0];
        const col=partTint()||(_ff?featColor(_ff,autoCol(0)):autoCol(0));
        const mat=applyFeatOp(new THREE.MeshStandardMaterial({color:col,metalness:.35,roughness:.4,clippingPlanes:clipPlane?[clipPlane]:null}),_ff);
        const mesh=new THREE.Mesh(g,mat);mesh.userData.bid='occ_result';scene.add(mesh);
        const nA=FR.items.filter(j=>(j.f.op||'add')==='add').length,nC=FR.items.filter(j=>(j.f.op||'add')==='cut').length;
        const nX=tlActiveList().filter(x=>x.type==='xfillet'&&x.visible!==false).reduce((a,x)=>a+((x.edges||[]).length),0);
        bodies.push({id:'occ_result',name:`Solide exact OCCT (${nA}➕ ${nC}➖${nX?` ${nX}⤢`:''} · ${tris.toLocaleString('fr')} tris)`,mesh,color:col,visible:true,kind:'boolean',ref:null});
        occLive={shape:FR.shape};FR.shape=null; // conservé pour le picking d'arêtes
      }else faceEl.textContent+=(faceEl.textContent?'\n':'')+'Solide exact vide (tout a été découpé).';
    }
    FR.ghostShapes.forEach((gh,i)=>{
      try{
        if(!gh.geo)return;
        const mat=new THREE.MeshStandardMaterial({color:gh.inexact?0xff9f0a:0xff453a,transparent:true,opacity:0.22,depthWrite:false});
        const mesh=new THREE.Mesh(gh.geo,mat);mesh.userData.bid='occghost_'+i;mesh.raycast=()=>{};mesh.visible=false;
        scene.add(mesh);
        // Fantôme masqué par défaut (sinon il dépasse là où un congé a rajouté de la matière).
        // Visible quand sa découpe est sélectionnée, ou via 👁 dans Pièces.
        bodies.push({id:'occghost_'+i,name:gh.inexact?`⚠ ${gh.inexact} (maillage — exclu de l'exact)`:'🔧 Outil '+(gh.orphan?'(orphelin)':'(découpe)'),mesh,color:0xff453a,visible:false,kind:'ghost',ref:gh.fid||null,ghost:true});
      }catch(e){msgs.push('fantôme illisible, ignoré');}
    });
    // Imports mesh : affichés tels quels (non fusionnés au BRep dans ce MVP)
    doc.features.filter(f=>f.visible!==false&&f.type==='import'&&f._mesh).forEach(f=>{
      const col=partTint()||featColor(f,autoCol(1));
      f._mesh.material=applyFeatOp(FreshMat(col),f);scene.add(f._mesh);
      bodies.push({id:f.id,name:f.name,mesh:f._mesh,color:col,visible:true,kind:'import',ref:f.id});
    });
    occCleanup(FR,(occLive&&occLive.shape)||null);
    if(FR.msgs.length)faceEl.textContent+=(faceEl.textContent?'\n':'')+FR.msgs.slice(0,4).join('\n');
    return true;
  }catch(e){
    try{if(FR)occCleanup(FR,null);}catch(_){}
    occDropLive();
    faceEl.textContent+=(faceEl.textContent?'\n':'')+'OCCT : '+e.message;
    return false;
  }
}
function projRefreshRerun(pass){
  // Projections associatives : si une esquisse a bougé après rejeu, le solide est rejoué
  // aussitôt (garde : une seule passe imbriquée — jamais de récursion infinie).
  // AVANT de rejouer : les projections ne déplacent que des entités de CONSTRUCTION (hors
  // profil) — on compare donc les entrées du solide. Signature identique = le second rejeu
  // reconstruirait exactement le même volume : c'était ~la moitié du temps de rebuild.
  const sigOf=()=>{let s='';const F=(doc&&doc.features)||[];for(let i=0;i<F.length;i++){if(F[i].visible!==false)s+=featSig(F[i])+';';}return s;};
  const s0=sigOf();
  let ch=false;
  try{ch=updateAllProjections();}catch(e){}
  if(!ch)return false;
  if(sigOf()===s0){
    // Projeté recalé sans effet sur le profil : on ne rejoue pas, mais on persiste les
    // nouvelles coordonnées et on redessine l'esquisse ouverte (tracé 2D non rafraîchi).
    try{autosave();}catch(e){}
    try{if(typeof skEdit!=='undefined'&&skEdit)drawSketch2D();}catch(e){}
    return false;
  }
  if(!(pass>=1)){ try{rebuild(pass+1);}catch(e){} return true; }
  try{autosave();}catch(e){} // coordonnées déjà écrites : au moins les persister
  return false;
}
