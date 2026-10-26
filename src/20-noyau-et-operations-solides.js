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
  // Repère droit ou MIRROIR (gaucher) ? Une esquisse miroir (symétrie) garde les mêmes
  // coords 2D mais son repère est gaucher : axU×axV opposé à +n. Le sens trigo 2D y
  // tourne alors à l'envers autour de +n — il faut en tenir compte pour les arcs.
  let gaucher=false;
  try{
    const cx=u.y*v.z-u.z*v.y,cy=u.z*v.x-u.x*v.z,cz=u.x*v.y-u.y*v.x;
    gaucher=(cx*n.x+cy*n.y+cz*n.z)<0;
  }catch(e){}
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
      // Sens du cercle : en repère gaucher (esquisse miroir), le trigo 2D tourne à
      // l'envers autour de +n. Construire le cercle autour de +n y faisait passer les
      // arcs du mauvais côté (constaté : slot miroir amputé de ses extrémités R4 —
      // outil large de 52 au lieu de 60). On oriente donc le cercle selon le repère.
      const dirC=gaucher?occBinPush(bin,new occt.gp_Dir_4(-n.x,-n.y,-n.z)):dir;
      const ax=occBinPush(bin,new occt.gp_Ax2_3(occBinPush(bin,new occt.gp_Pnt_3(Cw[0],Cw[1],Cw[2])),dirC));
      const circ=occBinPush(bin,new occt.gp_Circ_2(ax,a.r));
      const Pf=tr.pts[st.from],Pt=tr.pts[toId];
      const aF=Math.atan2(Pf.y-Cc.y,Pf.x-Cc.x),aT=Math.atan2(Pt.y-Cc.y,Pt.x-Cc.x);
      const dEnt=an.a2-an.a1;
      if(Math.abs(dEnt-TAU)<1e-6){
        // V0.11.5 : cercle complet = UNE arête fermée (et non 2 moitiés) → le prisme a UN
        // cylindre, sans arête de jonction ; sa projection en esquisse est un seul cercle.
        const m1=occBinPush(bin,new occt.BRepBuilderAPI_MakeEdge_8(circ));m1.Build();
        if(!m1.IsDone())throw new Error('cercle complet impossible');
        mkW.Add_1(m1.Edge());
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
  // (même miroir f.flip que ci-dessous — factorisé pour ne pas diverger)
  const flipSp=(r,unres)=>{
    let sp={lo:r.lo,hi:r.hi,far:1};
    if(unres)sp.unres=true;
    if(f&&f.flip)sp={lo:-sp.hi,hi:-sp.lo,far:-sp.far,unres:sp.unres};
    return sp;
  };
  if(f&&f.through){
    let r=null;
    if(f.sketchId){
      const sk=doc.sketches.find(s=>s.id===f.sketchId);
      if(sk){try{const B=sketchBasis(sk);r=throughPartRange(B);}catch(e){}}
    }
    if(r)return flipSp(r);
    const h=THROUGH/2;
    // unres : aucun solide disponible pour mesurer l'étendue réelle — les appelants qui
    // ANCRENT une géométrie (hôtes de faces) doivent alors NE PAS bouger (sinon l'origine
    // part à ±5000mm et le rejeu suivant la « répare » → rejeu imbriqué inutile).
    return flipSp({lo:-h,hi:h},true);
  }
  const raw=(f&&f.distance!==undefined&&f.distance!==null&&isFinite(+f.distance))?+f.distance:10;
  let sp;
  if(f&&f.mid){const h=Math.abs(raw)/2;sp={lo:-h,hi:h,far:raw<0?-1:1};}
  else sp={lo:Math.min(0,raw),hi:Math.max(0,raw),far:raw<0?-1:1};
  // Inversion du sens (f.flip) : miroir géométrique pur de la course par rapport au plan
  // d'esquisse — l'opération (Plot = ajout, Poche = retrait) est INCHANGÉE, seul le côté
  // change. Tout passe par ici (prismes, rims, ancrages, hôtes), donc tout suit ensemble.
  if(f&&f.flip)sp={lo:-sp.hi,hi:-sp.lo,far:-sp.far};
  return sp;
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
function occCommon(a,b){
  const c=new occt.BRepAlgoAPI_Common_3(a,b);
  c.Build();const ok=c.IsDone();const s=ok?c.Shape():null;
  try{c.delete();}catch(e){}
  if(!ok||!s)throw new Error('intersection impossible');
  return s;
}
// 2026-10-16-009 : COMBINER des corps (union / soustraction / intersection), comme Fusion.
function occBodyOfFeat(f){return (f&&f.body&&doc.bodies.some(e=>e.id===f.body))?f.body:(doc.bodies[0]&&doc.bodies[0].id);}
function occSplitNewBody(f){
  // Corps NEUF né d'une scission de corps (xsplit mode 'body'), ou null : la fonction est
  // rejouée dans son corps (côté gardé) ET en tête du corps neuf (l'autre côté).
  if(!f||f.type!=='xsplit'||f.mode!=='body'||!f.newBody)return null;
  return (f.newBody!==occBodyOfFeat(f)&&doc.bodies.some(e=>e.id===f.newBody))?f.newBody:null;
}
function occCombinePrefix(f,tb){
  // fonctions du corps outil tb AVANT la combinaison f (timeline visible)
  const vis=doc.features.filter(x=>x.visible!==false&&!(occSkipFeat&&x.id===occSkipFeat));
  const i=vis.indexOf(f);
  return vis.slice(0,i<0?vis.length:i).filter(x=>x.type!=='repeat'&&(occBodyOfFeat(x)===tb||occSplitNewBody(x)===tb));
}
function occCombineTool(f,tb,bin){
  const list=occCombinePrefix(f,tb);if(!list.length)return null;
  const r=occReplayBody(tb,list);
  bin.push(...(r.bin||[]));(r.itemShapes||[]).forEach(s=>{if(s&&s!==r.shape)bin.push(s);});
  return r.shape||null;
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
function occCoqueThick(result,faces,thick,join,inter){
  // Cœur MakeThickSolid partagé par toutes les recettes : join/inter paramétrables
  // (Arc direct, Intersection, …). `faces` = handles OCCT résolus, `thick` > 0 en mm.
  const bin=[];
  try{
    const L=occBinPush(bin,new occt.TopTools_ListOfShape_1());
    for(const f of faces)L.Append_1(occBinPush(bin,occt.TopoDS.Face_1(f)));
    const mk=occBinPush(bin,new occt.BRepOffsetAPI_MakeThickSolid_2(
      result,L,-Math.abs(thick),0.01,join,inter,false,join,false));
    mk.Build();
    let done=false;
    try{done=!!mk.IsDone();}catch(e){}
    if(!done)throw new Error('évidage refusé par le moteur (paroi trop épaisse ? ouverture mal placée ?)');
    const out=occShapeCopy(mk.Shape());
    if(!out||out.IsNull()){try{if(out)out.delete();}catch(e){}throw new Error('solide évidé vide');}
    return out;
  }finally{occDispose(bin);}
}
function occCoqueOnce(result,faces,thick){
  // Recette « directe » (Arc) seule — aperçus et cas simples. Les appels qui
  // doivent supporter dépouille/congés passent par occCoqueRecettes (chaîne).
  return {shape:occCoqueThick(result,faces,thick,occt.GeomAbs_JoinType.GeomAbs_Arc,false)};
}
function occCoqueBBox(sh){
  // AddOptimal = boîte PRÉCISE (le Add conservateur gonfle les pôles BSpline et
  // ferait passer des junk pour du gabarit). Filet d'échec conservateur si indispo.
  const b=new occt.Bnd_Box_1();
  try{occt.BRepBndLib.AddOptimal(sh,b,true,false);}
  catch(e){try{occt.BRepBndLib.AddOptimal(sh,b);}catch(e2){try{b.delete();}catch(e){}return null;}}
  try{
    const a=b.CornerMin(),z=b.CornerMax();
    const o=[a.X(),a.Y(),a.Z(),z.X(),z.Y(),z.Z()];
    try{b.delete();}catch(e){}
    return o;
  }catch(e){try{b.delete();}catch(e2){}return null;}
}
function occCoqueVolume(sh){
  try{
    const G=new occt.GProp_GProps_1();
    occt.BRepGProp.VolumeProperties_1(sh,G,false,false,false);
    const v=G.Mass();
    try{G.delete();}catch(e){}
    return v;
  }catch(e){return null;}
}
function occCoqueNFaces(sh){
  let n=0;
  try{
    const x=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);
    while(x.More()){n++;x.Next();}
    x.delete();
  }catch(e){}
  return n;
}
function occCoqueEvidage(base,out,thick){
  // Vrai évidage ? Le moteur rend parfois IsDone=true avec un résultat NON
  // évidé (dessus conservé, face parasite qui explose hors gabarit) — c'était le
  // bug « la coque ne marche pas toujours ». Trois critères mesurés (sondages) :
  //  · bbox serrée autour de la base, ±(2+2×paroi) — attrape le junk hors gabarit ;
  //  · ≥ +2 faces — l'évidage crée parois internes + rebord (un junk n'en crée pas) ;
  //  · volume < 0.5×base — junk ≈ 105 % de la base, évidage « partiel » ≈ 72 %,
  //    évidage réel 7..13 % : 0.5 discrimine nettement les trois familles.
  try{
    const b=occCoqueBBox(base),o=occCoqueBBox(out);
    if(!b||!o)return false;
    const m=2+2*Math.abs(+thick||0);
    for(let i=0;i<3;i++)if(o[i]<b[i]-m)return false;
    for(let i=3;i<6;i++)if(o[i]>b[i]+m)return false;
    if(occCoqueNFaces(out)-occCoqueNFaces(base)<2)return false;
    const v0=occCoqueVolume(base),v1=occCoqueVolume(out);
    if(!(typeof v0==="number"&&typeof v1==="number"))return false;
    return v1>0&&v1<v0*0.5;
  }catch(e){return false;}
}
function occCoqueValide(sh){
  try{
    const a=new occt.BRepCheck_Analyzer(sh,true);
    const v=a.IsValid_1(sh);
    try{a.delete();}catch(e){}
    return !!v;
  }catch(e){return false;}
}
function occCoqueRepare(sh){
  // ShapeFix : le résultat de conversion Arc peut être GÉOMÉTRIQUEMENT juste et
  // topologiquement invalide (3 faces/35) — le fix répare sans bouger les cotes.
  try{
    const h=new occt.Handle_Message_ProgressIndicator_1();
    const fx=new occt.ShapeFix_Shape_2(sh);
    fx.Perform(h);
    const s2=fx.Shape();
    let c=null;
    if(s2&&!s2.IsNull())c=occShapeCopy(s2);
    try{fx.delete();}catch(e){}
    try{h.delete();}catch(e){}
    return c;
  }catch(e){return null;}
}
function occCoqueRecettes(result,entries,thick){
  // Chaîne de recettes d'évidage, acceptées UNIQUEMENT après validation :
  //   1. Arc direct            — cas simples (boîte, dépouille nulle) : inchangé ;
  //   2. Intersection (jI)     — dépouille simple sans congé ;
  //   3. ConvertToBSpline+Arc  — arcs non maniables sur les surfaces de dépouille
  //      (convertir les extrusions en BSpline rend l'offset Arc calculable),
  //      suivie de ShapeFix si la topologie ressort invalide.
  // entries = [{fr,h}] : refs durables (recette 3 re-résout les refs sur la forme
  // convertie — les handles de `result` n'y sont pas valables) + handles résolus.
  const Arc=occt.GeomAbs_JoinType.GeomAbs_Arc;
  const I=occt.GeomAbs_JoinType.GeomAbs_Intersection;
  const essai=(shape,faces,join,inter)=>{
    const out=occCoqueThick(shape,faces,thick,join,inter);
    if(!occCoqueEvidage(result,out,thick)){try{out.delete();}catch(e){}return null;}
    if(occCoqueValide(out))return out;
    const fix=occCoqueRepare(out);
    if(fix&&occCoqueValide(fix)&&occCoqueEvidage(result,fix,thick)){
      try{out.delete();}catch(e){}
      return fix;
    }
    try{if(fix)fix.delete();}catch(e){}
    return out;
  };
  const hs=entries.map(e=>e.h).filter(Boolean);
  let errA=null;
  try{
    const r=essai(result,hs,Arc,false);
    if(r)return{shape:r};
  }catch(e){errA=e;}
  try{
    const r=essai(result,hs,I,true);
    if(r)return{shape:r};
  }catch(e){if(!errA)errA=e;}
  try{
    if(occt.ShapeCustom&&occt.ShapeCustom.ConvertToBSpline){
      const cv=occt.ShapeCustom.ConvertToBSpline(result,true,false,false,false);
      if(cv&&!cv.IsNull()){
        try{
          const fc=[];
          for(const e of entries){
            try{const h=occFindFace(cv,e.fr);if(h)fc.push(h);}catch(e2){}
          }
          if(fc.length){
            try{
              const r=essai(cv,fc,Arc,false);
              if(r)return{shape:r};
            }finally{fc.forEach(g=>{try{g.delete();}catch(e2){}});}
          }
        }finally{try{cv.delete();}catch(e){}}
      }else{try{if(cv)cv.delete();}catch(e){}}
    }
  }catch(e){if(!errA)errA=e;}
  throw errA||new Error('évidage refusé par le moteur (paroi trop épaisse ? ouverture mal placée ?)');
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
  const entries=(f.faces||[]).map(fr=>{try{const h=occFindFace(result,fr);return h?{fr:fr,h:h}:null;}catch(e){return null;}}).filter(Boolean);
  const miss=total-entries.length;
  if(!entries.length){
    f._m={m:0,t:total};
    return{shape:result,warnings:[`aucune des ${total} face(s) à retirer n'est retrouvée — la pièce a changé`]};
  }
  if(miss)warnings.push(`${miss} face(s) à retirer introuvable(s) sur la pièce courante`);
  f._m={m:entries.length,t:total};
  const freeHs=list=>list.forEach(e=>{try{if(e&&e.h)e.h.delete();}catch(e2){}});
  const run=list=>{
    if(!list.length)throw new Error('aucune face retrouvable');
    return occCoqueRecettes(result,list,t);
  };
  const dropShape=s=>{try{if(s&&s.shape)s.shape.delete();}catch(e){}};
  let r=null,echec=null;
  try{r=run(entries);}catch(e){echec=e;}
  if(!r){
    // Isolation : comme le dépouillage, on cherche quelles faces le moteur refuse.
    const garde=[];
    for(const e of entries){
      try{const tst=run(garde.concat([e]));dropShape(tst);garde.push(e);}catch(e2){/* écartée */}
    }
    if(!garde.length){
      freeHs(entries);
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
    freeHs(entries);
    try{result.delete();}catch(e){}
    return{shape:out,warnings};
  }catch(e){
    freeHs(entries);
    return{shape:result,warnings:[`coque impossible (${(e&&e.message)||e})`],fatal:true};
  }
}

function occDiskPrism(sk,Cx,Cy,r,sp){
  // Pastille pleine (cercles isolés) : cercle -> wire -> face -> UN prisme.
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
    const mkW=occBinPush(bin,new occt.BRepBuilderAPI_MakeWire_1());
    // V0.11.5 : UNE arête de cercle fermée (plus 2 demi-arcs) → un seul cylindre, sans jonction
    const m1=occBinPush(bin,new occt.BRepBuilderAPI_MakeEdge_8(circ));m1.Build();
    if(!m1.IsDone())throw new Error('pastille impossible');
    mkW.Add_1(m1.Edge());mkW.Build();
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
// 2026-10-16-015 : congé / chanfrein d'UNE arête SANS suivre la chaîne tangente (OCCT la suit
// toujours) — arête DROITE et CONVEXE entre deux faces : le secteur de matière est mesuré au
// classificateur, l'outil (triangle du coin − disque du congé, ou triangle seul pour un
// chanfrein) est extrudé le long de l'arête en DÉBORDANT devant et derrière, puis soustrait.
function occSingleEdgeTool(shape,pts,r,chamfer){
  if(!pts||pts.length<2||!(r>0))return null;
  const A=pts[0],B=pts[pts.length-1];
  const sub=(p,q)=>[p[0]-q[0],p[1]-q[1],p[2]-q[2]],add=(p,q)=>[p[0]+q[0],p[1]+q[1],p[2]+q[2]],mul=(p,k)=>[p[0]*k,p[1]*k,p[2]*k];
  const dot=(p,q)=>p[0]*q[0]+p[1]*q[1]+p[2]*q[2],len=p=>Math.hypot(p[0],p[1],p[2]),nrm=p=>{const l=len(p)||1;return mul(p,1/l);};
  const cross=(p,q)=>[p[1]*q[2]-p[2]*q[1],p[2]*q[0]-p[0]*q[2],p[0]*q[1]-p[1]*q[0]];
  const L=len(sub(B,A));if(L<1e-6)return null;
  const t=nrm(sub(B,A));
  for(const p of pts){const w=sub(p,A),d=dot(w,t);if(len(sub(w,mul(t,d)))>1e-4*Math.max(1,L))return null;} // arête droite seulement
  const M=mul(add(A,B),0.5);
  const a0=Math.abs(t[0])<0.9?[1,0,0]:[0,1,0];
  const u=nrm(sub(a0,mul(t,dot(a0,t)))),v=cross(t,u);
  const dir=th=>add(mul(u,Math.cos(th)),mul(v,Math.sin(th)));
  const bin=[];
  try{
    const cl=new occt.BRepClass3d_SolidClassifier_2(shape);bin.push(cl);
    const IN=occt.TopAbs_State.TopAbs_IN;
    const eps=Math.max(1e-3,Math.min(0.05,r*0.05));
    const inAt=th=>{const q=add(M,mul(dir(th),eps));const P=new occt.gp_Pnt_3(q[0],q[1],q[2]);cl.Perform(P,1e-7);const s=cl.State();try{P.delete();}catch(e){}return s===IN;};
    const N=180,S=[];for(let k=0;k<N;k++)S.push(inAt(2*Math.PI*k/N));
    const starts=[];for(let k=0;k<N;k++)if(S[k]&&!S[(k+N-1)%N])starts.push(k);
    if(starts.length!==1)return null; // pas une arête simple entre 2 faces
    let k1=starts[0],k2=k1;while(S[(k2+1)%N]&&((k2+1)%N)!==k1)k2=(k2+1)%N;
    const bis=(lo,hi,want)=>{for(let i=0;i<14;i++){const m=(lo+hi)/2;if(inAt(m)===want)hi=m;else lo=m;}return(lo+hi)/2;};
    const st=2*Math.PI/N;
    const th1=bis(2*Math.PI*k1/N-st,2*Math.PI*k1/N,true); // passage dehors → dedans
    const th2=bis(2*Math.PI*(k2+1)/N,2*Math.PI*k2/N,true); // passage dedans → dehors (côté fin)
    let al=th2-th1;while(al<0)al+=2*Math.PI;while(al>2*Math.PI)al-=2*Math.PI;
    if(!(al>0.05&&al<Math.PI-0.02))return null; // arête concave (ou plate) : repli OCCT
    const d1=dir(th1),d2=dir(th2),b=nrm(add(d1,d2));
    const s=chamfer?r:r/Math.tan(al/2);
    const T1=add(M,mul(d1,s)),T2=add(M,mul(d2,s));
    const Eo=sub(M,mul(b,0.5*s+0.5)); // sommet du triangle repoussé HORS matière (pas de face coplanaire)
    const o=Math.max(2*r,2),half=L/2+o;
    const at0=p=>sub(p,mul(t,half));
    const P=p=>{const q=new occt.gp_Pnt_3(p[0],p[1],p[2]);bin.push(q);return q;};
    const poly=new occt.BRepBuilderAPI_MakePolygon_3(P(at0(Eo)),P(at0(T1)),P(at0(T2)),true);bin.push(poly);
    if(!poly.IsDone())return null;
    const fm=new occt.BRepBuilderAPI_MakeFace_15(poly.Wire(),true);bin.push(fm);if(!fm.IsDone())return null;
    const vec=new occt.gp_Vec_4(t[0]*2*half,t[1]*2*half,t[2]*2*half);bin.push(vec);
    const pr=new occt.BRepPrimAPI_MakePrism_1(fm.Face(),vec,false,true);bin.push(pr);pr.Build();if(!pr.IsDone())return null;
    let tool=pr.Shape();
    if(!chamfer){
      const h=r/Math.sin(al/2),C=add(M,mul(b,h)),C0=sub(C,mul(t,half+1));
      const dd=new occt.gp_Dir_4(t[0],t[1],t[2]);bin.push(dd);
      const ax=new occt.gp_Ax2_3(P(C0),dd);bin.push(ax);
      const cy=new occt.BRepPrimAPI_MakeCylinder_3(ax,r,2*half+2);bin.push(cy);
      tool=occCut(tool,cy.Shape());
    }
    return tool;
  }catch(e){return null;}
  finally{occDispose(bin);}
}
function occFilletRun(base,jobs,warns,chamfer,opts){
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
  if(opts&&opts.single){
    // case « tangentes » DÉCOCHÉE : chaque arête seule, sans chaîne tangente
    let cur=base,done=0;
    for(const j of jobs){
      let E=null;try{E=occListEdges(cur);}catch(e){}
      const ed=(E||[]).find(e=>cur===base?e.src===j.src:(j.mid&&Math.hypot(e.mid[0]-j.mid[0],e.mid[1]-j.mid[1],e.mid[2]-j.mid[2])<3));
      let nx=null;
      const tool=ed?occSingleEdgeTool(cur,ed.pts,j.r,chamfer):null;
      if(tool){try{nx=occCut(cur,tool);}catch(e){nx=null;}try{tool.delete();}catch(e){}}
      if(!nx&&ed){nx=mk(cur,[{src:ed.src,r:j.r}]);if(nx)warns.push(kindLabel+' : arête courbe ou concave — suivi de la chaîne tangente (noyau)');}
      if(nx){if(cur!==base){try{cur.delete();}catch(e){}}cur=nx;done++;}
      else warns.push(kindLabel+' isolé impossible ('+(chamfer?'distance trop grande ?':'rayon trop grand ?')+')');
    }
    return cur===base?null:cur;
  }
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
  // Dépouille d'extrusion (f.draft, degrés signés / plan d'esquisse) : inclinaison des
  // parois de l'outil COMPLET (trous percés, contours fusionnés), pivotée sur le plan
  // d'esquisse — le profil y est exact, il s'évase ou se rétrécit selon le signe.
  // Échec (angle trop fort, parois non adjacentes au plan) : extrusion droite conservée
  // + avertissement, jamais de timeline cassée.
  if(Math.abs(+f.draft||0)>1e-9){
    try{
      const r=occExtrudeDraft(shape,bs,sp,+f.draft);
      shape=r.shape;warns.push(...r.warnings);
    }catch(e){warns.push('dépouille '+f.draft+'° impossible ('+String((e&&e.message)||e).slice(0,120)+') : extrusion droite conservée');}
  }
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
  const T=occTriPos(shape,defl,ang),pos=T.pos;
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  try{g.setAttribute('normal',new THREE.Float32BufferAttribute(smoothNormals(pos,35),3));}
  catch(e){g.computeVertexNormals();}
  g.userData.occGroups=T.groups; // triangle -> face BRep (clic-face en mode exact)
  return g;
}
function occTriPos(shape,defl,ang){
  // BRep -> triangles bruts {pos:[x,y,z × 3 par triangle], groups:[{f,start,count}]} (V0.8.2 :
  // aussi pour les rayons des bulles de la mise en plan, qui n'ont pas besoin de THREE)
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
  return {pos,groups};
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
function faceAnchorScore(c,ref){
  // Cohérence d'une face candidate avec l'ancre d'esquisse mémorisée : la face est-elle
  // (encore) celle que l'ancre désigne ? Test en 2D esquisse (insensible aux découpes
  // qui scindent en hauteur), comme xAnchorMatch — mais pour un CENTRE DE FACE, pas un
  // milieu d'arête. Score (plus petit = mieux) ou null si incohérent.
  try{
    const a=ref.anchor;if(!a)return null;
    const s=doc.sketches.find(k=>k.id===a.sk);if(!s)return null;
    let B;try{B=sketchBasis(s);}catch(e){return null;}
    const dx=c.b.pos[0]-B.o.x,dy=c.b.pos[1]-B.o.y,dz=c.b.pos[2]-B.o.z;
    const q=[dx*B.u.x+dy*B.u.y+dz*B.u.z,dx*B.v.x+dy*B.v.y+dz*B.v.z,dx*B.n.x+dy*B.n.y+dz*B.n.z];
    // Antériorité : la face doit appartenir à la tranche COURANTE de son extrusion
    // (suit les changements de hauteur — c'est tout l'objet de cette passe).
    const spans=(doc.features||[]).filter(f=>f.type==='extrude'&&f.sketchId===a.sk&&f.visible!==false).map(f=>extrudeSpan(f));
    if(spans.length&&!spans.some(d=>q[2]>=d.lo-1.5&&q[2]<=d.hi+1.5))return null;
    const P=s.points||{};
    if(a.t==='p'){
      const p=P[a.id];if(!p)return null;
      if(Math.hypot(q[0]-p.x,q[1]-p.y)>5.0)return null;
    }else{
      const e=(s.entities||[]).find(k=>k.id===a.id);
      if(!e||e.construction||e.ref)return null;
      let d2=1e18;
      if(e.t==='line'){const A0=P[e.p1],B0=P[e.p2];if(!A0||!B0)return null;d2=distSeg2(q[0],q[1],A0.x,A0.y,B0.x,B0.y);}
      else if(e.t==='circle'||e.t==='arc'){
        const C=P[e.pc];if(!C||!(e.r>0))return null;
        if(e.t==='arc'){const an=arcAngles(s,e);if(!an)return null;
          const TAU=Math.PI*2,rel=((Math.atan2(q[1]-C.y,q[0]-C.x)-an.a1)%TAU+TAU)%TAU;
          if(rel>an.a2-an.a1+0.05)return null;}
        d2=Math.abs(Math.hypot(q[0]-C.x,q[1]-C.y)-e.r);
      }else return null;
      if(d2>5.0)return null;
    }
    const dd=Math.abs(c.b.dim[0]-ref.dim[0])+Math.abs(c.b.dim[1]-ref.dim[1])+Math.abs(c.b.dim[2]-ref.dim[2]);
    if(dd>Math.max(2.0,0.35*(Math.abs(ref.dim[0])+Math.abs(ref.dim[1])+Math.abs(ref.dim[2]))))return null;
    const d=Math.hypot(c.b.pos[0]-ref.pos[0],c.b.pos[1]-ref.pos[1],c.b.pos[2]-ref.pos[2]);
    return 0.15*dd+0.02*d;
  }catch(e){return null;}
}
function occFindFace(shape,ref){
  // Retrouve sur le solide courant la face décrite par ref (centre + normale + dimensions).
  // Une sélection d'une seule face se fait d'un clic : 2 mm suffisent à la délimiter, et la
  // normale doit rester compatible (sinon on déplacerait la face d'en face).
  // Comme les congés : 2 passes avant de conclure (le triangle ⚠ n'arrive qu'après).
  // Passe 0 : ancre absente (anciens projets) → recalée sur ref.pos, comme les congés.
  // Passe 1 (antériorité/suivi) : cohérence d'ancre, puis identité normale+dims sans
  //   ambiguïté — suit les éditions amont (ex. hauteur d'extrusion changée) même quand
  //   le centre a bougé de loin.
  // Passe 2 (proximité) : comportement historique, couperet 2,5 mm.
  if(!shape||!ref)return null;
  if(!ref.anchor){try{const a0=xAnchorFor(ref.pos);if(a0)ref.anchor=a0;}catch(e){}}
  const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
  const ex=new occt.TopExp_Explorer_2(shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);
  const cands=[];
  while(ex.More()){
    const f=occt.TopoDS.Face_1(ex.Current());
    const b=occFaceBox(f),n=occFaceOutNormal(f);
    if(b&&n){
      const dot=n[0]*ref.n[0]+n[1]*ref.n[1]+n[2]*ref.n[2];
      if(dot>=0.9)cands.push({f,b,n});
      else{try{f.delete();}catch(e){}}
    }
    ex.Next();
  }
  try{ex.delete();}catch(e){}
  const drop=c=>{try{c.f.delete();}catch(e){}};
  const ddOf=c=>Math.abs(c.b.dim[0]-ref.dim[0])+Math.abs(c.b.dim[1]-ref.dim[1])+Math.abs(c.b.dim[2]-ref.dim[2]);
  // Passe 1a : cohérence d'ancre (précis, suit les esquisses).
  if(ref.anchor){
    let best=null,bs=1e18;
    for(const c of cands){
      const s=faceAnchorScore(c,ref);
      if(s==null)continue;
      if(s<bs){bs=s;best=c;}
    }
    if(best){cands.forEach(c=>{if(c!==best)drop(c);});return best.f;}
  }
  // Passe 1b : identité sans ambiguïté (normale déjà filtrée + dims proches + un seul
  // candidat) — couvre les grandes faces loin de toute entité d'esquisse, dont l'ancre
  // est introuvable, après de gros déplacements.
  {
    const uniq=cands.filter(c=>{
      for(let i=0;i<3;i++){if(Math.abs(c.b.dim[i]-ref.dim[i])>Math.max(1.5,0.25*Math.abs(ref.dim[i])))return false;}
      return true;
    });
    if(uniq.length===1){const w=uniq[0];cands.forEach(c=>{if(c!==w)drop(c);});return w.f;}
  }
  // Passe 2 (proximité, comportement historique inchangé).
  let best=null,bn=-2;
  for(const c of cands){
    const d=Math.hypot(c.b.pos[0]-ref.pos[0],c.b.pos[1]-ref.pos[1],c.b.pos[2]-ref.pos[2]);
    const sc=d+0.1*ddOf(c);
    if(sc<bn||best===null){if(sc<1e5){bn=sc;best=c;}}
  }
  cands.forEach(c=>{if(!best||c!==best)drop(c);});
  if(best&&bn>2.5){drop(best);return null;} // trop loin : on préfère échouer que viser une autre face
  return best?best.f:null;
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
/* ---------- suppression de faces (touche Suppr, façon Fusion) ----------
   BRepAlgoAPI_Defeaturing retire les faces visées et PROLONGE les faces voisines jusqu'à
   ce qu'elles se rejoignent : un congé supprimé redonne l'arête vive, un trou supprimé
   rebouche la face qui le portait. Mesuré : boîte 100x60x40 congée R10 sur une arête
   verticale, congé supprimé → 6 faces, 240 000 mm³ (la boîte d'origine, au mm³ près). */
function occSurfKind(f){
  try{
    const ad=new occt.BRepAdaptor_Surface_2(f,true);
    const gt=ad.GetType();try{ad.delete();}catch(e){}
    const T=occt.GeomAbs_SurfaceType;
    for(const k in T){if(T[k]===gt)return k.replace('GeomAbs_','');}
  }catch(e){}
  return '?';
}
function occFaceRefAny(f){
  // Référence durable de N'IMPORTE quelle face : celle du déplacement (plan/cylindre :
  // centre + normale + dimensions, suivie par les ancres d'esquisse), sinon centre +
  // dimensions + type de surface (tores et surfaces libres des congés de coin).
  const r=occFaceRef(f);if(r){r.st=occSurfKind(f);return r;}
  const b=occFaceBox(f);if(!b)return null;
  return {pos:b.pos.map(v=>+v.toFixed(3)),dim:b.dim.map(v=>+v.toFixed(3)),st:occSurfKind(f)};
}
function occFindFaceAny(shape,ref){
  if(!shape||!ref)return null;
  if(ref.n){
    const h=occFindFace(shape,ref);
    if(h||!ref.anchor)return h;
    // Repli : une extrusion amont a changé de hauteur, la face visée a donc changé de
    // dimensions et occFindFace la refuse. L'ancre d'esquisse suffit alors : même type de
    // surface, même normale, la face la mieux placée par rapport à son entité d'esquisse
    // (les dimensions de la candidate remplacent celles mémorisées).
    const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
    const ex=new occt.TopExp_Explorer_2(shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);
    let best=null,bs=1e18;
    while(ex.More()){
      const f=occt.TopoDS.Face_1(ex.Current());
      let keep=false;
      try{
        const n=occFaceOutNormal(f),b=occFaceBox(f);
        if(n&&b&&(!ref.st||occSurfKind(f)===ref.st)&&n[0]*ref.n[0]+n[1]*ref.n[1]+n[2]*ref.n[2]>=0.9){
          const s=faceAnchorScore({f,b,n},Object.assign({},ref,{dim:b.dim}));
          if(s!=null&&s<bs){if(best)try{best.delete();}catch(e){}best=f;bs=s;keep=true;}
        }
      }catch(e){}
      if(!keep)try{f.delete();}catch(e){}
      ex.Next();
    }
    try{ex.delete();}catch(e){}
    return best;
  }
  // Face courbe quelconque : même type de surface, la plus proche (centre + dimensions),
  // à 2,5 mm au plus — on préfère échouer que retirer une autre face.
  const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
  const ex=new occt.TopExp_Explorer_2(shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);
  let best=null,bs=1e18;
  while(ex.More()){
    const f=occt.TopoDS.Face_1(ex.Current());
    let keep=false;
    if(!ref.st||occSurfKind(f)===ref.st){
      const b=occFaceBox(f);
      if(b){
        const d=Math.hypot(b.pos[0]-ref.pos[0],b.pos[1]-ref.pos[1],b.pos[2]-ref.pos[2]);
        const dd=Math.abs(b.dim[0]-ref.dim[0])+Math.abs(b.dim[1]-ref.dim[1])+Math.abs(b.dim[2]-ref.dim[2]);
        const sc=d+0.1*dd;
        if(sc<bs){if(best)try{best.delete();}catch(e){}best=f;bs=sc;keep=true;}
      }
    }
    if(!keep)try{f.delete();}catch(e){}
    ex.Next();
  }
  try{ex.delete();}catch(e){}
  if(best&&bs>2.5){try{best.delete();}catch(e){}return null;}
  return best;
}
function occDeleteFacesOnce(shape,faces){
  // Retire `faces` (handles sur `shape`) et referme le solide par prolongement des voisines.
  if(!occt.BRepAlgoAPI_Defeaturing)throw new Error('suppression de face absente de ce noyau');
  const d=new occt.BRepAlgoAPI_Defeaturing();
  try{
    d.SetShape(shape);
    faces.forEach(h=>d.AddFaceToRemove(h));
    try{d.SetToFillHistory(false);}catch(e){}
    d.Build();
    if(!d.IsDone())throw new Error('les faces voisines ne se rejoignent pas');
    let r=d.Shape();
    if(!r||r.IsNull())throw new Error('résultat vide');
    // Une face que le noyau ne sait pas retirer est GARDÉE sans erreur (IsDone reste vrai) :
    // on vérifie qu'aucune face visée ne subsiste, sinon l'isolation la désignera.
    const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
    const ex=new occt.TopExp_Explorer_2(r,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);
    let reste=false;
    while(ex.More()&&!reste){const c=ex.Current();if(faces.some(h=>c.IsSame(h)))reste=true;ex.Next();}
    try{ex.delete();}catch(e){}
    if(reste){try{r.delete();}catch(e){}throw new Error('les faces voisines ne se rejoignent pas');}
    r=occUnify(r);
    if(!occCoqueValide(r)){try{r.delete();}catch(e){}throw new Error('solide résultant invalide');}
    return r;
  }finally{try{d.delete();}catch(e){}}
}
function occApplyDeleteFaces(result,f){
  // Rejoue la suppression. Retourne {shape,warnings} comme occApplyCoque : les faces sont
  // retrouvées par référence durable, et celles que le noyau refuse sont écartées une à
  // une (isolation) plutôt que de tout perdre.
  const warnings=[];
  const total=(f.faces||[]).length;
  if(!total)return{shape:result,warnings:['aucune face à supprimer']};
  const hs=(f.faces||[]).map(fr=>{try{return occFindFaceAny(result,fr);}catch(e){return null;}}).filter(Boolean);
  const free=()=>hs.forEach(h=>{try{h.delete();}catch(e){}});
  f._m={m:hs.length,t:total};
  if(!hs.length)return{shape:result,warnings:[`aucune des ${total} face(s) n'est retrouvée — la pièce a changé`]};
  if(hs.length<total)warnings.push(`${total-hs.length} face(s) introuvable(s) sur la pièce courante`);
  let r=null,echec=null;
  try{r=occDeleteFacesOnce(result,hs);}catch(e){echec=e;}
  if(!r&&hs.length>1){
    const garde=[];
    for(const h of hs){
      try{const t=occDeleteFacesOnce(result,garde.concat([h]));try{t.delete();}catch(e){}garde.push(h);}catch(e){}
    }
    if(garde.length){
      try{r=occDeleteFacesOnce(result,garde);}catch(e){echec=e;}
      if(r){f._m={m:garde.length,t:total};warnings.push(`suppression partielle : ${garde.length}/${total} face(s), ${hs.length-garde.length} refusée(s) par le noyau`);}
    }
  }
  free();
  if(!r){
    const m=(echec&&echec.message)||echec;
    f._m={m:0,t:total};
    return{shape:result,warnings:[`suppression impossible — ${m}`],fatal:true};
  }
  try{result.delete();}catch(e){}
  return{shape:r,warnings};
}
/* ---------- scinder par un plan : faces ou corps (V0.11.5) ----------
   {type:'xsplit', mode:'face'|'body', body, pl:{src,cg?,o?,n?}, off, flip, faces?, newBody?}
   • Faces : chaque face visée (référence durable occFaceRefAny) est coupée par sa ligne
     d'intersection avec le plan (BRepAlgoAPI_Section) ; le Splitter imprime ces arêtes
     sur le solide, qui reste UN solide (faces voisines recousues, volume inchangé).
   • Corps : le Splitter coupe le solide par une grande face plane ; les morceaux du côté
     opposé à la normale restent dans le corps, ceux du côté de la normale vont dans le
     corps neuf `newBody` (« Inverser » échange les côtés). Mesuré : boîte 100x60x40
     coupée à X=30 → 72 000 + 168 000 mm³. */
function splitPlaneOf(f){
  // Plan résolu {o,n} (monde) : origine, plan de construction (repère persistant) ou face
  // figée au clic ; décalage le long de la normale ; flip retourne la normale.
  const P=f.pl||{};let o=[0,0,0],n=[0,0,1];
  if(P.src==='XZ')n=[0,1,0];
  else if(P.src==='YZ')n=[1,0,0];
  else if(P.src==='cg'){
    const c=(doc.cgeo||[]).find(x=>x&&x.id===P.cg);
    if(c&&c.fr&&c.fr.o&&c.fr.z){o=c.fr.o.slice();n=c.fr.z.slice();}
    else if(P.o&&P.n){o=P.o.slice();n=P.n.slice();}
  }else if(P.src==='face'&&P.o&&P.n){o=P.o.slice();n=P.n.slice();}
  const l=Math.hypot(n[0],n[1],n[2])||1;n=n.map(v=>v/l);
  const d=+f.off||0;o=[o[0]+n[0]*d,o[1]+n[1]*d,o[2]+n[2]*d];
  if(f.flip)n=n.map(v=>-v);
  return{o,n};
}
function splitCutPlanes(){
  // Plans des scissions de FACES actives (visibles, non sautées en édition) : leurs arêtes
  // de coupe sont affichées vives (occSharpEdges), même entre faces tangentes.
  const out=[];
  try{(doc.features||[]).forEach(f=>{if(f&&f.type==='xsplit'&&f.mode!=='body'&&f.visible!==false&&!(occSkipFeat&&f.id===occSkipFeat))out.push(splitPlaneOf(f));});}catch(e){}
  return out;
}
function occSplitPln(P){return new occt.gp_Pln_3(new occt.gp_Pnt_3(P.o[0],P.o[1],P.o[2]),new occt.gp_Dir_4(P.n[0],P.n[1],P.n[2]));}
function occSplitRun(shape,tools){
  // Splitter : `shape` découpé par `tools` (liste de shapes). Rend le résultat brut.
  const sp=new occt.BRepAlgoAPI_Splitter_1();
  const la=new occt.TopTools_ListOfShape_1(),lt=new occt.TopTools_ListOfShape_1();
  try{
    la.Append_1(shape);tools.forEach(t=>lt.Append_1(t));
    sp.SetArguments(la);sp.SetTools(lt);sp.Build();
    if(!sp.IsDone())throw new Error('découpe refusée par le noyau');
    const r=sp.Shape();if(!r||r.IsNull())throw new Error('résultat vide');
    return r;
  }finally{try{sp.delete();}catch(e){}try{la.delete();}catch(e){}try{lt.delete();}catch(e){}}
}
function occSolidsOf(shape){
  const out=[],SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
  const ex=new occt.TopExp_Explorer_2(shape,occt.TopAbs_ShapeEnum.TopAbs_SOLID,SH);
  while(ex.More()){out.push(occt.TopoDS.Solid_1(ex.Current()));ex.Next();}
  try{ex.delete();}catch(e){}
  return out;
}
function occSplitFacesOnce(shape,faces,P){
  // Coupe les faces visées par le plan ; le solide reste entier. → {shape, cut:nb de faces coupées}
  const pln=occSplitPln(P),secs=[];let cut=0;
  try{
    faces.forEach(h=>{
      const s=new occt.BRepAlgoAPI_Section_5(h,pln,false);
      try{
        s.Build();if(!s.IsDone())return;
        const r=s.Shape();
        const ex=new occt.TopExp_Explorer_2(r,occt.TopAbs_ShapeEnum.TopAbs_EDGE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);
        const has=ex.More();try{ex.delete();}catch(e){}
        if(has){secs.push(r);cut++;}else try{r.delete();}catch(e){}
      }finally{try{s.delete();}catch(e){}}
    });
    if(!secs.length)return{shape:null,cut:0};
    const r=occSplitRun(shape,secs);
    const so=occSolidsOf(r);
    if(so.length===1){try{r.delete();}catch(e){}return{shape:so[0],cut};}
    so.forEach(s=>{try{s.delete();}catch(e){}});
    return{shape:r,cut};
  }finally{try{pln.delete();}catch(e){}secs.forEach(s=>{try{s.delete();}catch(e){}});}
}
function occSplitBodyOnce(shape,P){
  // Coupe le solide en deux côtés. → {neg, pos} (null si vide de ce côté)
  const b=occSolidBox(shape);if(!b)throw new Error('boîte du solide illisible');
  const c=b.c,k=(c[0]-P.o[0])*P.n[0]+(c[1]-P.o[1])*P.n[1]+(c[2]-P.o[2])*P.n[2];
  // face de coupe centrée sur la projection du centre, débordant largement du solide
  const q={o:[c[0]-k*P.n[0],c[1]-k*P.n[1],c[2]-k*P.n[2]],n:P.n};
  const R=b.dg+10,pln=occSplitPln(q);
  let face=null,r=null;
  try{
    const mf=new occt.BRepBuilderAPI_MakeFace_9(pln,-R,R,-R,R);
    try{if(!mf.IsDone())throw new Error('plan de coupe invalide');face=mf.Face();}finally{try{mf.delete();}catch(e){}}
    r=occSplitRun(shape,[face]);
  }finally{try{pln.delete();}catch(e){}if(face)try{face.delete();}catch(e){}}
  const neg=[],pos=[];
  occSolidsOf(r).forEach(s=>{
    let ct=null;
    try{const p=new occt.GProp_GProps_1();occt.BRepGProp.VolumeProperties_1(s,p,false,false,false);const m=p.CentreOfMass();ct=[m.X(),m.Y(),m.Z()];try{m.delete();}catch(e){}try{p.delete();}catch(e){}}catch(e){}
    if(!ct){try{s.delete();}catch(e){}return;}
    const d=(ct[0]-P.o[0])*P.n[0]+(ct[1]-P.o[1])*P.n[1]+(ct[2]-P.o[2])*P.n[2];
    (d>0?pos:neg).push(s);
  });
  try{r.delete();}catch(e){}
  const pack=L=>!L.length?null:(L.length===1?L[0]:occCompoundOf(L));
  return{neg:pack(neg),pos:pack(pos),nNeg:neg.length,nPos:pos.length};
}
function occApplySplit(result,f,side){
  // Rejoue la scission. side : 'neg' (corps d'origine) | 'pos' (corps neuf, mode corps).
  // Retourne {shape,warnings} comme occApplyDeleteFaces.
  const warnings=[];const P=splitPlaneOf(f);
  if(f.mode==='body'){
    let s=null;
    try{s=occSplitBodyOnce(result,P);}
    catch(e){return{shape:side==='pos'?null:result,warnings:[`scission impossible — ${(e&&e.message)||e}`],fatal:true};}
    f._m={m:(s.nNeg&&s.nPos)?1:0,t:1};
    if(!s.neg||!s.pos){
      // le plan ne traverse pas le corps : tout reste dans le corps d'origine
      if(s.neg)try{s.neg.delete();}catch(e){}if(s.pos)try{s.pos.delete();}catch(e){}
      return{shape:side==='pos'?null:result,warnings:['le plan ne coupe pas le corps']};
    }
    try{result.delete();}catch(e){}
    if(side==='pos'){try{s.neg.delete();}catch(e){}return{shape:s.pos,warnings};}
    try{s.pos.delete();}catch(e){}
    return{shape:s.neg,warnings};
  }
  const total=(f.faces||[]).length;
  if(!total)return{shape:result,warnings:['aucune face à scinder']};
  const hs=(f.faces||[]).map(fr=>{try{return occFindFaceAny(result,fr);}catch(e){return null;}}).filter(Boolean);
  f._m={m:hs.length,t:total};
  if(!hs.length)return{shape:result,warnings:[`aucune des ${total} face(s) n'est retrouvée — la pièce a changé`]};
  if(hs.length<total)warnings.push(`${total-hs.length} face(s) introuvable(s) sur la pièce courante`);
  let r=null;
  try{r=occSplitFacesOnce(result,hs,P);}
  catch(e){r=null;warnings.push(`scission impossible — ${(e&&e.message)||e}`);}
  finally{hs.forEach(h=>{try{h.delete();}catch(e){}});}
  if(!r||!r.shape){
    f._m={m:0,t:total};
    if(r&&!r.cut)warnings.push('le plan ne coupe aucune des faces choisies');
    return{shape:result,warnings,fatal:true};
  }
  if(r.cut<hs.length){f._m={m:r.cut,t:total};warnings.push(`${hs.length-r.cut} face(s) non traversée(s) par le plan`);}
  try{result.delete();}catch(e){}
  return{shape:r.shape,warnings};
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
function occExtrudeDraft(shape,bs,sp,angleDeg){
  // Dépouille d'un OUTIL d'extrusion, pivotée sur le plan d'esquisse : les parois
  // latérales (tout sauf les deux calottes aux extrémités lo/hi) sont inclinées de
  // l'angle SIGNÉ, direction +n. Le signe donne le sens : l'angle est passé tel quel
  // à DraftAngle. Les faces qui refusent (pas de contact avec le plan neutre, p.ex.
  // raccords de pourtour) sont sautées et signalées — jamais d'exception silencieuse.
  // En cas d'échec global, on lève : l'appelant conserve l'extrusion droite + avertit.
  const warnings=[];
  const ang=(+angleDeg||0)*Math.PI/180;
  if(!(Math.abs(ang)>1e-9))return{shape,warnings};
  const n=[bs.n.x,bs.n.y,bs.n.z],o=[bs.o.x,bs.o.y,bs.o.z];
  const len=Math.abs(sp.hi-sp.lo)||1;
  const tol=Math.max(0.02,len*1e-4);
  const sides=[],bin=[];
  try{
    const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
    const ex=new occt.TopExp_Explorer_2(shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);bin.push(ex);
    while(ex.More()){
      const fc=occt.TopoDS.Face_1(ex.Current());bin.push(fc);
      let cap=false;
      try{
        const ad=new occt.BRepAdaptor_Surface_2(fc,true);bin.push(ad);
        if(ad.GetType()===occt.GeomAbs_SurfaceType.GeomAbs_Plane){
          const d=ad.Plane().Axis().Direction();
          let nx=d.X(),ny=d.Y(),nz=d.Z();
          try{if(fc.Orientation_1()===occt.TopAbs_Orientation.TopAbs_REVERSED){nx=-nx;ny=-ny;nz=-nz;}}catch(e){}
          if(Math.abs(nx*n[0]+ny*n[1]+nz*n[2])>0.999){
            const Lp=ad.Plane().Location();
            const off=(Lp.X()-o[0])*n[0]+(Lp.Y()-o[1])*n[1]+(Lp.Z()-o[2])*n[2];
            if(Math.abs(off-sp.lo)<tol||Math.abs(off-sp.hi)<tol)cap=true;
          }
        }
      }catch(e){}
      if(!cap)sides.push(fc);
      ex.Next();
    }
    if(!sides.length)throw new Error('aucune paroi latérale à dépouiller');
    // occDraftOnce copie les handles (TopoDS.Face_1) dans son propre bin : les nôtres
    // restent valides pendant l'appel et sont libérés avec `bin` ci-dessous.
    const r=occDraftOnce(shape,{pos:o,n:n},sides,ang);
    if(r.refused&&r.refused.length)warnings.push(r.refused.length+' face(s) ne touchent pas le plan d\u2019esquisse — non dépouillées');
    try{shape.delete();}catch(e){}
    return{shape:r.shape,warnings};
  }finally{occDispose(bin);}
}
function occSurfNormalAt(surf,u,v){
  // Normale de surface en (u,v) : [x,y,z] NON orientée (donne min(θ,π−θ) par produit
  // scalaire) ou null si la surface ne la définit pas. Utilisée uniquement pour
  // trancher un conflit drapeau/géométrie (congé sur congé) : coût faible.
  try{
    const pr=new occt.GeomLProp_SLProps_1(surf,u,v,1,1e-6);
    let r=null;
    if(pr.IsNormalDefined()){
      const N=pr.Normal();r=[N.X(),N.Y(),N.Z()];N.delete();
    }
    pr.delete();
    return r;
  }catch(err){return null;}
}
function occSharpEdges(shape){
  // Arêtes uniques classées : sharp (noire, C0) vs tangente (grise, G1+). Validé par exécution.
  const out=[],bin=[];
  // V0.11.5 : arêtes de COUPE d'une scission de faces (xsplit) — entre les deux moitiés d'un
  // congé, la continuité est G1 et l'arête serait grise ; c'est une limite voulue : noire.
  const cuts=splitCutPlanes();
  const onCut=pts=>cuts.some(P=>pts.every(q=>Math.abs((q[0]-P.o[0])*P.n[0]+(q[1]-P.o[1])*P.n[1]+(q[2]-P.o[2])*P.n[2])<1e-3));
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
    // 2026-10-23 : COUTURES — une face de révolution (cylindre, cône…) est bordée deux fois par
    // la même arête (sa couture) : vue deux fois DANS LA MÊME FACE. Ce n'est pas une arête de la
    // pièce : ni tracée ni sélectionnable. Idem pour la jonction de deux morceaux du MÊME
    // cylindre (perçage repassé, découpe coaxiale) : un seul cylindre à l'écran.
    const seam=new Set(),cyl=faces.map(f=>{
      try{const ad=new occt.BRepAdaptor_Surface_2(f,true);bin.push(ad);
        if(ad.GetType()!==occt.GeomAbs_SurfaceType.GeomAbs_Cylinder)return null;
        const C=ad.Cylinder(),A=C.Axis(),d=A.Direction(),o=A.Location();
        return{r:C.Radius(),d:[d.X(),d.Y(),d.Z()],o:[o.X(),o.Y(),o.Z()]};
      }catch(err){return null;}
    });
    const sameCyl=fl=>{
      if(fl.length!==2)return false;const a=cyl[fl[0]],b=cyl[fl[1]];if(!a||!b)return false;
      if(Math.abs(a.r-b.r)>1e-6)return false;
      const c=a.d[0]*b.d[0]+a.d[1]*b.d[1]+a.d[2]*b.d[2];if(Math.abs(Math.abs(c)-1)>1e-9)return false;
      const w=[b.o[0]-a.o[0],b.o[1]-a.o[1],b.o[2]-a.o[2]],t=w[0]*a.d[0]+w[1]*a.d[1]+w[2]*a.d[2];
      return Math.hypot(w[0]-t*a.d[0],w[1]-t*a.d[1],w[2]-t*a.d[2])<1e-6; // même axe
    };
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
              if(!fmap.get(k).includes(fi))fmap.get(k).push(fi);else seam.add(k); // 2ᵉ passage dans la même face
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
              const onC=cuts.length>0&&onCut(s.pts); // arête de coupe d'une scission : toujours tracée
              if(!onC&&((seam.has(kk)&&fl.length<=1)||sameCyl(fl))){ex.Next();continue;} // couture : pas une arête
              if(fl.length>=2){
                try{sharp=(occt.BRep_Tool.Continuity_1(e,faces[fl[0]],faces[fl[1]])===occt.GeomAbs_Shape.GeomAbs_C0);}
                catch(err){sharp=true;}
              }else sharp=false;
              // 2026-10-18 V0.2.5 : congé SUR congé — le noyau ne pose PAS le drapeau G1
              // sur la jonction des deux congés : BRep_Tool répond C0 alors que les
              // surfaces sont TANGENTES (mesuré sur la pédale : 4 fragments noirs de 2 à
              // 7 mm, dihédrale mesurée 0.0°, pendant que toutes les vraies arêtes vives
              // font ≥ 24°). Si le drapeau dit « vive », on INTERROGE la géométrie :
              // pcurve de l'arête dans chaque face → UV → normale (SLProps) à 3 stations
              // (25/50/75 %) ; dès QU'UN échantillon dépasse le seuil, on garde « vive »
              // (test MAX : un congé avec raccord non tangent quelque part reste noir).
              if(sharp&&fl.length>=2){
                // le drapeau OCCT dit « vive » : on le MET À L'ÉPREUVE du point de
                // vue géométrique avant de l'accepter (toutes les paires de faces).
                let mesure=false,maxA=0;
                test_paires:
                for(let i=0;i<fl.length;i++){
                  for(let j=i+1;j<fl.length;j++){
                    const E1=faces[fl[i]],E2=faces[fl[j]];
                    try{
                      const g1=new occt.BRepAdaptor_Curve2d_2(e,E1);bin.push(g1);
                      const g2=new occt.BRepAdaptor_Curve2d_2(e,E2);bin.push(g2);
                      const w0=g1.FirstParameter(),w1=g1.LastParameter();
                      if(!(w1>w0))continue; // arête vue comme point dans ce couple : rien à mesurer ici
                      const s1=occt.BRep_Tool.Surface_1(E1,new occt.TopLoc_Location_1());bin.push(s1);
                      const s2=occt.BRep_Tool.Surface_1(E2,new occt.TopLoc_Location_1());bin.push(s2);
                      for(const p of [0.25,0.5,0.75]){
                        const q1=g1.Value(w0+(w1-w0)*p),q2=g2.Value(w0+(w1-w0)*p);
                        bin.push(q1);bin.push(q2);
                        const n1=occSurfNormalAt(s1,q1.X(),q1.Y()),n2=occSurfNormalAt(s2,q2.X(),q2.Y());
                        if(!n1||!n2){mesure=false;break test_paires;} // mesure indisponible : verdict OCCT conservé
                        mesure=true;
                        const d=(n1[0]*n2[0]+n1[1]*n2[1]+n1[2]*n2[2])/(Math.hypot(n1[0],n1[1],n1[2])||1)/(Math.hypot(n2[0],n2[1],n2[2])||1);
                        const th=Math.acos(Math.max(-1,Math.min(1,d)))*180/Math.PI;
                        const dev=Math.min(th,180-th);
                        if(dev>maxA)maxA=dev;
                      }
                    }catch(err){mesure=false;break test_paires;}
                  }
                }
                if(mesure&&maxA<3)sharp=false; // G1 confirmé sur toute l'arête : TANGENTE (grise)
              }
              const cut=!sharp&&onC;
              out.push(cut?{mid,pts:occCurvePts(ad,u0,u1),len:s.len,sharp:true,split:true}:{mid,pts:occCurvePts(ad,u0,u1),len:s.len,sharp});
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
  if(!ref){f._m={m:0,t:f.faces.length};return{shape:result,warnings:[`face de référence introuvable près de (${(f.ref.pos||[]).map(v=>(+v).toFixed(1)).join(', ')}) — ni suivi d'ancre, ni proximité : re-sélectionnez-la (bouton « Changer la référence »)`]} };
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
// V0.11.7 : UN SEUL test « ce corps est-il montré ? » — peau, arêtes, survol et choix d'arêtes,
// congés : tout lit ici. Cacher un corps (œil, clic droit, brut FAO) cache donc tout ce qui en dépend.
function bodyShown(b){return !!(b&&b.visible!==false&&!b.ghost&&b.mesh&&b.mesh.visible!==false);}
// Arêtes classées des corps exacts MONTRÉS. Tous montrés → le composé occLive (inchangé) ;
// sinon, corps par corps (sous-solide b.shape), mémorisé tant que ce sous-solide est le même :
// cacher / montrer ne relance pas la classification.
const bodyEdgeMemo=new Map(); // id du corps → {shape, edges}
function occVisibleSharpEdges(){
  if(!(occLive&&occLive.shape))return [];
  const ex=bodies.filter(b=>b&&b.kind==='body'&&!b.ghost);
  if(ex.every(bodyShown)||ex.some(b=>!b.shape))return occSharpEdges(occLive.shape);
  const out=[];
  ex.forEach(b=>{
    if(!bodyShown(b))return;
    let m=bodyEdgeMemo.get(b.id);
    if(!m||m.shape!==b.shape){m={shape:b.shape,edges:occSharpEdges(b.shape)||[]};bodyEdgeMemo.set(b.id,m);}
    out.push.apply(out,m.edges);
  });
  for(const [id,m] of bodyEdgeMemo)if(!ex.some(b=>b.id===id&&b.shape===m.shape))bodyEdgeMemo.delete(id); // sous-solides libérés
  return out;
}
// Signature de visibilité au moment du dernier overlay : refreshParts() le reconstruit dès
// qu'elle change, quel que soit le chemin qui a caché / montré le corps.
let edgeOverlayVisSig=null;
function bodyVisSig(){return bodies.filter(b=>b&&!b.ghost).map(b=>b.id+(bodyShown(b)?'+':'-')).join(',');}
function edgeOverlayData(){
  // POLYLIGNES de l'overlay « Arêtes » : {pts:[[x,y,z]…], sharp, mw?}.
  // • corps exacts → classification C0/G1 RÉELLE sur le composé occLive (inchangé) ;
  // • IMPORTS → arêtes classées À L'IMPORT, tant que le shape BRep vivait (après
  //   shape.delete() la continuité des faces n'est plus consultable : c'est ce qui
  //   faisait qu'un STEP n'avait AUCUNE arête à côté d'une pièce native) ;
  // • repli maillage (arêtes > 30°, tout noir) : STL, imports sans classification,
  //   ou document sans corps exact — comportement d'origine, inchangé.
  const out=[];
  if(edgeMode!=='on')return out;
  const vis=bodyShown;
  const exact=!!(occLive&&occLive.shape&&bodies.some(b=>b.kind==='body'&&vis(b)));
  if(exact){
    try{occVisibleSharpEdges().forEach(e=>{if(e&&e.pts&&e.pts.length>1)out.push({pts:e.pts,sharp:!!e.sharp});});}catch(e){}
  }
  bodies.forEach(b=>{
    if(!vis(b))return;
    if(b.kind==='import'){
      let ent=null;
      try{ent=importGeom.get(b.ref||b.id);}catch(e){ent=null;}
      if(ent&&ent.edges&&ent.edges.length){
        ent.edges.forEach(e=>{if(e&&e.pts&&e.pts.length>1)out.push({pts:e.pts,sharp:!!e.sharp,mw:(b.mesh&&b.mesh.matrixWorld)||null});});
        return;
      } // STL / import sans classification → repli maillage ci-dessous
    }else if(exact)return; // corps exacts déjà couverts par le composé occLive
    try{out.push.apply(out,edgeOverlayFromMesh(b));}catch(e){}
  });
  return out;
}
function edgeOverlayFromMesh(b){
  // Repli maillage (ancien comportement, bit à bit) : arêtes vives > 30°, noires.
  const res=[];
  b.mesh.updateMatrixWorld(true);
  const eg=new THREE.EdgesGeometry(b.mesh.geometry,30);
  const p=eg&&eg.attributes&&eg.attributes.position;
  if(!p){try{if(eg&&eg.dispose)eg.dispose();}catch(e){}return res;}
  const A=new THREE.Vector3(),B=new THREE.Vector3(),mw=b.mesh.matrixWorld||null;
  for(let i=0;i<p.count;i+=2){
    A.fromBufferAttribute(p,i).applyMatrix4(mw);
    B.fromBufferAttribute(p,i+1).applyMatrix4(mw);
    res.push({pts:[[A.x,A.y,A.z],[B.x,B.y,B.z]],sharp:true});
  }
  try{eg.dispose();}catch(e){}
  return res;
}
// 2026-10-16-010 : corps en TRANSPARENCE vraie — passe « profondeur seule » dessinée APRÈS sa
// couleur : les arêtes cachées derrière la face avant ne sont plus tracées net (seul le voile,
// peint avant les solides, les laisse deviner à travers la matière), les parois intérieures
// restent visibles (la couleur a été dessinée avant le masque).
// 2026-10-16-012 : rendu TRANSPARENT en 3 passes (un seul maillage = ordre des triangles
// quelconque : une paroi de perçage dessinée APRÈS la face avant se mélangeait par-dessus →
// formes intérieures visibles trop tôt) :
//   1) profondeur seule (surface la plus proche) · 2) INTÉRIEUR seul (derrière cette surface),
//   intensité qui monte lentement avec la transparence · 3) surface avant (le maillage lui-même,
//   depthFunc ≤ → jamais recouverte par l'intérieur). Les arêtes cachées échouent sur la passe 1.
function glassDepthMask(b){
  if(!b||!b.mesh)return;
  const me=b.mesh,mat=me.material,ge=(mat&&mat.userData&&mat.userData.glass)||1;
  me.userData=me.userData||{};
  const drop=k=>{const o=me.userData[k];if(o){me.remove(o);try{o.material.dispose();}catch(e){}me.userData[k]=null;}};
  // pas transparent du tout → aucune passe ; « Intensité » seule → passe de profondeur (la pièce
  // s'estompe sur le FOND sans montrer l'intérieur) ; « Transparence » → + passe intérieure.
  if(!(mat&&mat.transparent)||b.ghost){drop('glassMask');drop('glassIn');me.renderOrder=0;if(mat)mat.depthFunc=THREE.LessEqualDepth;return;}
  const po={polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1};
  let pre=me.userData.glassMask,inn=me.userData.glassIn;
  if(!pre||pre.geometry!==me.geometry){drop('glassMask');
    pre=new THREE.Mesh(me.geometry,new THREE.MeshBasicMaterial(Object.assign({colorWrite:false,depthWrite:true,depthTest:true,transparent:true},po)));
    pre.renderOrder=1;pre.raycast=()=>{};pre.name='glassPre';me.add(pre);me.userData.glassMask=pre;}
  // V0.7.6 : la passe de profondeur MARQUE (stencil = 1) les pixels où cette pièce est devant
  // tout ce qui est déjà dessiné ; la passe intérieure (profondeur « plus loin ») ne dessine que
  // là. Sans cela, une pièce transparente placée DANS une pièce opaque (assemblage, ou deux corps)
  // se voyait à travers elle : « plus loin que la profondeur » valait aussi derrière l'autre pièce.
  try{const pm=pre.material;pm.stencilWrite=true;pm.stencilRef=1;pm.stencilFunc=THREE.AlwaysStencilFunc;
    pm.stencilZPass=THREE.ReplaceStencilOp;pm.stencilFail=THREE.KeepStencilOp;pm.stencilZFail=THREE.KeepStencilOp;}catch(e){}
  if(!(ge<0.999)){drop('glassIn');try{pre.material.clippingPlanes=mat.clippingPlanes||null;}catch(e){}mat.depthFunc=THREE.LessEqualDepth;me.renderOrder=3;return;}
  if(!inn||inn.geometry!==me.geometry){drop('glassIn');
    inn=new THREE.Mesh(me.geometry,new THREE.MeshStandardMaterial(Object.assign({transparent:true,depthWrite:false,depthTest:true,depthFunc:THREE.GreaterDepth},po)));
    inn.renderOrder=2;inn.raycast=()=>{};inn.name='glassIn';me.add(inn);me.userData.glassIn=inn;}
  // 2026-10-16-013 : TOUT devient transparent en même temps, petit à petit — l'intérieur prend
  // la même opacité que la surface (poids visible = ge·(1−ge) : 30 % → 0,13 · 90 % → 0,19)
  const aIn=ge;
  const im=inn.material;
  try{im.stencilWrite=true;im.stencilRef=1;im.stencilFunc=THREE.EqualStencilFunc; // seulement là où la pièce est devant
    im.stencilZPass=THREE.KeepStencilOp;im.stencilFail=THREE.KeepStencilOp;im.stencilZFail=THREE.KeepStencilOp;}catch(e){}
  try{im.color.copy(mat.color);im.emissive.copy(mat.emissive);im.roughness=mat.roughness;im.metalness=mat.metalness;}catch(e){}
  try{const cp=mat.clippingPlanes||null;im.clippingPlanes=cp;pre.material.clippingPlanes=cp;}catch(e){} // plan de coupe respecté
  im.opacity=aIn;inn.visible=aIn>0.004;im.needsUpdate=true;
  mat.depthFunc=THREE.LessEqualDepth;me.renderOrder=3; // surface avant, après l'intérieur
}
let edgeOverlayErr=null; // dernière erreur (diagnostic)
function buildEdgeOverlay(){
  const old=scene.getObjectByName('edgeOverlay');
  if(old){
    scene.remove(old);
    try{old.traverse(o=>{if(o&&o.geometry&&o.geometry.dispose)o.geometry.dispose();});}catch(e){}
  }
  try{(typeof bodies!=='undefined'?bodies:[]).forEach(b=>glassDepthMask(b));}catch(e){} // passes de transparence (arêtes affichées ou non)
  try{edgeOverlayVisSig=bodyVisSig();}catch(e){}
  if(edgeMode!=='on')return;
  // 2026-10-16-001 : arêtes RENTRANTES (épaulement, fond de poche) invisibles — dans le creux,
  // les 2 faces voisines sont à la même profondeur que le trait et le masquent. On recule
  // légèrement les FACES des corps (polygonOffset : ne touche que les polygones, pas les traits).
  try{(typeof bodies!=='undefined'?bodies:[]).forEach(b=>{const m=b&&b.mesh&&b.mesh.material;
    (Array.isArray(m)?m:[m]).forEach(x=>{if(x&&!x.polygonOffset){x.polygonOffset=true;x.polygonOffsetFactor=1;x.polygonOffsetUnits=1;x.needsUpdate=true;}});
    });}catch(e){}
  const data=edgeOverlayData();
  if(!data.length)return;
  // UN SEUL set de sommets, DEUX passes (les arêtes derrière le solide s'atténuent) :
  //   • VOILE (renderOrder -10, depthTest off) : peint AVANT les solides. Un corps
  //     translucide se dessine dessus en le laissant paraître à (1 - opacité) → les
  //     arêtes du fond apparaissent VERSETÉS, jamais crues ; un corps opaque le
  //     recouvre entièrement → comportement d'origine, strictement identique.
  //   • NET (depthTest on, après les corps) : là où le depth buffer le permet,
  //     c'est-à-dire devant le solide — vives noires, tangentes grises, pleines.
  // Un seul draw call partagé : l'overlay ne coûte pas plus cher qu'avant.
  const pos=[],col=[];
  for(const d of data){
    const pts=d&&d.pts;if(!pts||pts.length<2)continue;
    // vive → noire ; tangente → grise douce (plus lisible sur fond sombre)
    const c=d.sharp?[0.02,0.02,0.025]:[0x9a/255,0x9f/255,0xa6/255];
    const M=(d.mw&&d.mw.elements)||null;
    const put=p=>{
      let x=+p[0],y=+p[1],z=+p[2];
      if(M){const X=x,Y=y,Z=z;x=M[0]*X+M[4]*Y+M[8]*Z+M[12];y=M[1]*X+M[5]*Y+M[9]*Z+M[13];z=M[2]*X+M[6]*Y+M[10]*Z+M[14];}
      pos.push(x,y,z);col.push(c[0],c[1],c[2]);
    };
    for(let i=0;i+1<pts.length;i++){put(pts[i]);put(pts[i+1]);}
  }
  if(!pos.length)return;
  try{
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    const grp=new THREE.Group();grp.name='edgeOverlay'; // un seul nom : clearBodies() retire les DEUX passes
    // 2026-10-16-011 : arêtes ARRIÈRE en GRIS doux (plus en noir plein) — vues à travers un corps
    // transparent, elles restent estompées ; sous un corps opaque, toujours invisibles.
    // 2026-10-16-013 : le voile passe APRÈS les objets opaques (sol, pièces opaques) et AVANT la
    // pièce transparente (passes 1-3) : peint en premier, il était effacé par le SOL (filigrane
    // visible seulement par-dessous) ; avec le test de profondeur, une pièce opaque le masque.
    const veil=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x7d828a,transparent:true,opacity:0.9,depthTest:true,depthWrite:false}));
    veil.raycast=()=>{};veil.renderOrder=0.5;
    // 2026-10-16-013 : arêtes ARRIÈRE uniquement s'il y a un corps en TRANSPARENCE (filigrane) —
    // en opaque comme avec la seule « Intensité », plus aucune arête arrière.
    veil.visible=(typeof bodies!=='undefined'?bodies:[]).some(b=>bodyShown(b)&&b.mesh.material&&b.mesh.material.userData&&typeof b.mesh.material.userData.glass==='number'&&b.mesh.material.userData.glass<0.999);
    const net=new THREE.LineSegments(g,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,depthWrite:false}));
    net.raycast=()=>{};net.renderOrder=990;
    grp.add(veil);grp.add(net);
    scene.add(grp); // jamais pris par le picking (raycast neutre sur les deux passes)
    try{if(typeof skEdit!=='undefined'&&skEdit&&skEdit._fade)grp.visible=false;}catch(e){} // esquisse ouverte : arêtes propres (skEdgesSync)
  }catch(e){ edgeOverlayErr=e; /* aucun overlay vaut mieux qu'un rendu cassé */ }
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
      // z = NIVEAU du clic (repère de l'esquisse, voyage avec l'origine) : sans lui une
      // ancre point n'a AUCUNE information de hauteur — xAnchorMatch ne peut pas distinguer
      // le fond, le rebord et la couture d'une poche qui projetent tous sur ce point.
      if(bestP)consider({t:'p',sk:s.id,id:bestP,z:+z2.toFixed(3),far:far?1:0},bdP,z2);
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
  // Hauteur de référence : le NIVEAU ENREGISTRÉ À LA CRÉATION (ancre z, repère local qui
  // suit l'origine de l'esquisse) plutôt que la position courante. ⚠ pos0 est figé en
  // coordonnées MONDE : une poche qui suit la face porteuse glisse de 20 mm et
  // proj(se.pos0) devient périmé (−32 au lieu de −12, mesuré) — l'ancre, elle, reste juste.
  // repli (anciens documents sans z) : projeter pos0 comme un point (q[2] est RELATIF au
  // plan ; comparer tel quels inversait haut et bas) — corrigé pour 'p' par a.z (B).
  const zRef=(a.z!==undefined&&a.z!==null&&isFinite(+a.z))?+a.z
    :((se.pos0&&se.pos0.length===3)?proj(se.pos0)[2]:(a.z||0));
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
    // CANDIDATURES UNIFIÉES (toutes orientations) + NIVEAU + POS0. Les trois arêtes d'une
    // poche //XZ (fond, rebord, couture verticale) projetent au MÊME point d'esquisse et
    // dzPref les égalise (lo/hi du même prisme) : sans niveau ni distance au clic elles se
    // départageaient au PREMIER RENCONTRÉ — le premier loop n'acceptait que les verticales
    // et rendait aussitôt (la couture gagnait quoi que soit l'ordre), le repli sans pos0
    // prenait tout autre chose au hasard. L'ordre d'énumération d'OCCT, bouleversé par
    // toute édition amont, faisait donc basculer le congé sur l'arête extérieure (retour
    // utilisateur). On reprend la mécanique de la branche 'e' : buckets de NIVEAU (zRef =
    // niveau du clic), score avec distance au clic (pos0, plafonnée 60 mm), départage par
    // pos0 à score équivalent — sans orientation forcée, sans dépendance à l'ordre.
    const rows=[];
    edges.forEach((e,i)=>{
      const q=proj(e.mid);
      const d2=Math.hypot(q[0]-p.x,q[1]-p.y);
      if(d2>5.0)return;
      const P0=e.pts[0],P1=e.pts[e.pts.length-1],L=Math.hypot(P1[0]-P0[0],P1[1]-P0[1],P1[2]-P0[2]);
      if(L<1e-9)return;
      const d0=(se.pos0&&se.pos0.length===3)
        ?Math.hypot(e.mid[0]-se.pos0[0],e.mid[1]-se.pos0[1],e.mid[2]-se.pos0[2]):0;
      const lvl=Math.abs(q[2]-zRef);
      const sc=d2+0.3*dzPref(q[2])+0.6*Math.min(d0,60);
      rows.push({i,sc,lvl,d0});
    });
    const pick=bk=>{
      if(!bk.length)return null;
      bk.sort((x,y)=>x.sc-y.sc);
      const g0=bk[0].sc;
      const near=bk.filter(c=>c.sc<=g0+6);
      if(near.length<2)return near[0].i;
      near.sort((x,y)=>x.d0-y.d0); // à score équivalent : l'arête du CLIQUE l'emporte
      return near[0].i;
    };
    let c=pick(rows.filter(r=>r.lvl<=2.0));
    if(c===null)c=pick(rows.filter(r=>r.lvl<=8.0));
    if(c===null)c=pick(rows);
    if(c!==null)out.push(c);
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
    // Buckets : le niveau ATTENDU (épaisseur courante) OU le niveau du CLIQUE (zRef, figé
    // à la création) — le min ne peut qu'AJOUTER la candidate au niveau du clic, jamais
    // écarter celle attendue : une ancre de côté faux ne peut plus faire partir le clic.
    const zErr=Math.min(Math.abs(q[2]-expectedZ),Math.abs(q[2]-zRef));
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
  // 2026-10-16-015 : migration — les entrées « tangente » ajoutées par d'anciens rejeux sont
  // retirées (la chaîne se re-déduit au calcul) dès qu'il reste au moins une arête CLIQUÉE.
  (xfils||[]).forEach(xf=>{if(xf&&Array.isArray(xf.edges)&&xf.edges.some(e=>e&&e.name!=='tangente'))xf.edges=xf.edges.filter(e=>!e||e.name!=='tangente');});
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
  const jobs=[],matchedSe=new Set(),seBi=new Map();
  const take=(bi,r,se)=>{
    if(se){matchedSe.add(se);seBi.set(se,bi);if(!se.pos0)se.pos0=se.pos.slice(); // POSITION D'ORIGINE figée : c'est elle la référence durable
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
  // Passe 2b : congé à TANGENCE PERSISTÉE (f.tangent) — UNE arête germe suffit : à chaque
  // rejeu la chaîne tangente est recalculée sur les arêtes du solide ACTUEL, exactement
  // comme xSelSync le fait à la création, mais rejouée. Une entrée déduite perdue se
  // rattache à la chaîne (par sa position d'origine), une arête APPARUE après édition amont
  // rejoint la bande avec le RAYON DU GERME : « tangence cochée sur une seule arête = toute
  // la chaîne, à chaque fois ». Les entrées sans drapeau seed (documents antérieurs) ne
  // déduisent rien : passe 1/2/3 se comportent comme avant.
  xfils.forEach(xf=>{
    if(!xf.tangent)return;
    const es=(xf.edges||[]).filter(se=>se.r>0);
    if(!es.length)return;
    const seeded=es.filter(se=>se.seed);
    const roots=(seeded.length?seeded:es).filter(se=>matchedSe.has(se)); // rétrocompat sans drapeau
    if(!roots.length)return;
    const chain=new Set();
    roots.forEach(se=>{const bi=seBi.get(se);if(bi==null)return;
      xTangentChainOf(edges,bi).forEach(j=>chain.add(j));});
    if(!chain.size)return;
    const hasJob=j=>jobs.some(job=>job.bi===j);
    // 1) entrées PERDUES se rattachent à la chaîne (ancre pos0, tol 60 mm — comme p0t)
    es.forEach(se=>{
      if(matchedSe.has(se))return;
      const ref=se.pos0&&se.pos0.length===3?se.pos0:se.pos;
      let best=-1,bd=60;
      chain.forEach(j=>{
        if(hasJob(j))return;
        const m=edges[j].mid;
        const d=Math.hypot(m[0]-ref[0],m[1]-ref[1],m[2]-ref[2]);
        if(d<bd){bd=d;best=j;}
      });
      if(best>=0)take(best,se.r,se);
    });
    // 2) arêtes de la chaîne SANS entrée → ajoutées AU CALCUL seulement, avec le rayon du germe
    //    le plus proche. 2026-10-16-015 : plus jamais enregistrées dans la fonction (avant :
    //    entrées « tangente » qui gonflaient la liste — une arête cliquée suffit).
    chain.forEach(j=>{
      if(hasJob(j))return;
      const m=edges[j].mid;
      const at=ref=>Math.hypot(ref[0]-m[0],ref[1]-m[1],ref[2]-m[2]);
      if(es.some(se=>at(se.pos0&&se.pos0.length===3?se.pos0:se.pos)<0.75))return; // doublon d'une entrée
      let bs=null,bd=1e9;
      roots.forEach(se=>{const d=at(se.pos0&&se.pos0.length===3?se.pos0:se.pos);if(d<bd){bd=d;bs=se;}});
      if(!bs)return;
      take(j,bs.r,null);
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
  const single=(xfils||[]).length>0&&(xfils||[]).every(x=>x&&x.tangent===false); // case décochée : arête seule
  const wA=[];
  // reprise déjà calculée sur ce même solide (rejeu puis affichage) : le calcul exact, qui
  // échouerait encore, n'est pas retenté (~0,3 s par congé)
  let rN=occNurbsMemoGet(occNurbsMemoKey(js,chamfer,single,edges));
  let s=rN?null:occFilletRun(base,js,wA,chamfer,{single});
  if(!s&&!rN)rN=occFilletNurbs(base,js,chamfer,single,edges);
  if(rN){
    s=rN.shape;
    // les refus « isolé impossible » de la voie analytique ne concernent plus le résultat
    const qui=`${xfils.map(x=>x.name||lab).join(', ')} : ${lab} ${dp}${xNum(Math.min.apply(null,js.map(j=>j.r)))} refusé par le noyau sur les surfaces exactes — calculé en NURBS`;
    warns.push(rN.local
      ?`${qui} dans un bloc autour des arêtes, recollé au corps (faces de ce bloc en NURBS et scindées à son bord : esquisse sur ces faces et reconnaissance FAO peuvent en souffrir)`
      :`${qui} sur une copie du corps entier (faces de ce corps en NURBS à partir d'ici : esquisse sur face plane, reconnaissance FAO et cotes de cercles en aval peuvent ne plus fonctionner)`);
  }else warns.push(...wA);
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
      const t=occFilletRun(occShapeCopy(base),js.map(j=>({src:j.src,r:r2,mid:j.mid.slice()})),w2,chamfer,{single});
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
function occFilletNurbs(base,js,chamfer,single,edges){
  // REPRISE DE DERNIER RECOURS (2026-10-26) : le même arrondi sur des surfaces converties en
  // NURBS (BRepBuilderAPI_NurbsConvert). Cavité Test : le congé R3,3 au pied de la nervure
  // ne passait qu'à la longueur 80 du bloc — 70, 79, 81, 100, même RETOUR à 80 : exception dans
  // BRepFilletAPI_MakeFillet. Les deux solides découpés autour de la nervure étaient identiques
  // à 1e-8 mm (sommets, arêtes, tolérances) : seul le PARAMÉTRAGE des surfaces analytiques
  // diffère (origine du cylindre R10 qui suit le bout de poche). ShapeFix, UnifySameDomain,
  // tolérances, régularité, forme de congé, SetParams, germe, rayon ±1e-5..0,6 : rien n'y fait ;
  // en NURBS l'arrondi passe partout.
  // 1) LOCALE : seul un bloc autour de la chaîne (boîte des arêtes + R + 1 mm) est converti et
  //    arrondi, puis recollé au reste du corps resté analytique (fusion en mode collage). Le corps
  //    entier en NURBS coûtait 6,8 s de conversion par congé (rejeu Cavité Test 2,9 → 12..20 s) ;
  //    ici ~0,8 s, volume ajouté 38,58 mm³ contre 38,66 pour le congé exact à 80. Garde-fous :
  //    les faces de coupe du bloc doivent sortir intactes de l'arrondi (sinon il a débordé du
  //    bloc), le recollage doit rendre un solide valide, de même nombre de solides, au bilan de
  //    faces exact (voir plus bas).
  // 2) CORPS ENTIER si la reprise locale échoue (lent, tout le corps reste NURBS en aval) —
  //    Cavité Test à 70 : le bloc englobe les raccords BSpline des coins de poche et le découpage
  //    échoue quelle que soit la marge (r+1, r+1,37, r+2,13 essayées).
  // Mesures Cavité Test (rejeu après la cote) : exact à 80 ≈ 3 s ; reprise locale ≈ 7 s puis
  // 2,5 s (mémoire) ; corps entier ≈ 18 s.
  // → {shape,local} ou null. Arêtes relocalisées par leur milieu (index changés par la conversion).
  const nSol=sh=>{let n=0;try{const x=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_SOLID,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);while(x.More()){n++;x.Next();}x.delete();}catch(e){}return n;};
  const del=(...l)=>l.forEach(h=>{try{if(h)h.delete();}catch(e){}});
  const filletNurbs=sh=>{
    let nb=null;
    try{
      const nc=new occt.BRepBuilderAPI_NurbsConvert_2(sh,false);
      try{nb=occShapeCopy(nc.Shape());}finally{del(nc);}
      if(!nb||nb.IsNull())return null;
      const E=occListEdges(nb),js2=[];
      for(const j of js){
        let b=null,bd=1e-3;
        E.forEach(e=>{const d=Math.hypot(e.mid[0]-j.mid[0],e.mid[1]-j.mid[1],e.mid[2]-j.mid[2]);if(d<bd){bd=d;b=e;}});
        if(!b){del(nb);return null;}
        js2.push({src:b.src,r:j.r,mid:j.mid.slice()});
      }
      const w=[];
      const s=occFilletRun(nb,js2,w,chamfer,{single});
      // résultat PARTIEL (arête par arête) refusé : la reprise doit rendre la fonction entière
      if(!s||w.some(m=>/partiel|impossible|introuvable/.test(m))){if(s&&s!==nb)del(s);del(nb);return null;}
      if(s!==nb)del(nb);
      return s;
    }catch(e){del(nb);return null;}
  };
  const local=()=>{
    const bin=[];
    try{
      const lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];
      js.forEach(j=>{const e=(edges||[]).find(x=>x.src===j.src);(e?e.pts:[j.mid]).forEach(q=>{for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],q[k]);hi[k]=Math.max(hi[k],q[k]);}});});
      const m=Math.max.apply(null,js.map(j=>j.r))+1;
      for(let k=0;k<3;k++){lo[k]-=m;hi[k]+=m;}
      const bx=occBinPush(bin,new occt.BRepPrimAPI_MakeBox_3(occBinPush(bin,new occt.gp_Pnt_3(lo[0],lo[1],lo[2])),occBinPush(bin,new occt.gp_Pnt_3(hi[0],hi[1],hi[2])))).Shape();
      // UNE passe (Splitter : corps coupé par le bloc, solides triés dedans / dehors) au lieu de
      // Common + Cut — deux booléens sur le corps entier, ~0,6 s chacun
      let loc=null,rest=null;const tri=Math.min(0.5,m/4);
      try{
        const L1=occBinPush(bin,new occt.TopTools_ListOfShape_1());L1.Append_1(base);
        const L2=occBinPush(bin,new occt.TopTools_ListOfShape_1());L2.Append_1(bx);
        const SP=occBinPush(bin,new occt.BRepAlgoAPI_Splitter_1());SP.SetArguments(L1);SP.SetTools(L2);
        try{SP.Build();}catch(e){SP.Build(new occt.Message_ProgressRange());}
        if(SP.IsDone()){
          const ins=[],out=[];
          const x=occBinPush(bin,new occt.TopExp_Explorer_2(SP.Shape(),occt.TopAbs_ShapeEnum.TopAbs_SOLID,occt.TopAbs_ShapeEnum.TopAbs_SHAPE));
          while(x.More()){const so=x.Current();const bb=new occt.Bnd_Box_1();occt.BRepBndLib.Add(so,bb,false);
            const q=bb.CornerMin(),z=bb.CornerMax(),A=[q.X(),q.Y(),q.Z()],Z=[z.X(),z.Y(),z.Z()];bb.delete();
            // boîte OCCT gonflée (tolérances, pôles des BSplines) : marge de tri m/4 — un solide
            // du dehors déborde du bloc de toute la taille du corps, pas de quelques dixièmes
            ([0,1,2].every(k=>A[k]>=lo[k]-tri&&Z[k]<=hi[k]+tri)?ins:out).push(occBinPush(bin,occShapeCopy(so)));x.Next();}
          if(ins.length&&out.length){loc=occCompoundOf(ins);rest=occCompoundOf(out);if(ins.length>1)bin.push(loc);if(out.length>1)bin.push(rest);}
        }
      }catch(e){loc=rest=null;}
      if(!loc||!rest){loc=occBinPush(bin,occCommon(base,bx));rest=occBinPush(bin,occCut(base,bx));}
      // aire des faces posées sur les plans du bloc (faces de coupe) : l'arrondi ne doit pas les toucher
      const coupe=sh=>{let a=0;const x=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);
        while(x.More()){const f=occt.TopoDS.Face_1(x.Current());const G=new occt.GProp_GProps_1();occt.BRepGProp.SurfaceProperties_1(f,G,false,false);
          const c=G.CentreOfMass(),q=[c.X(),c.Y(),c.Z()];
          if([0,1,2].some(k=>Math.abs(q[k]-lo[k])<1e-6||Math.abs(q[k]-hi[k])<1e-6))a+=G.Mass();
          G.delete();x.Next();}
        x.delete();return a;};
      const f=filletNurbs(loc);if(!f)return null;bin.push(f);
      const a0=coupe(loc),a1=coupe(f);
      if(!(Math.abs(a1-a0)<=1e-6*Math.max(1,a0)))return null; // l'arrondi a débordé du bloc
      let g=null;
      try{
        const L1=occBinPush(bin,new occt.TopTools_ListOfShape_1());L1.Append_1(rest);
        const L2=occBinPush(bin,new occt.TopTools_ListOfShape_1());L2.Append_1(f);
        const F=occBinPush(bin,new occt.BRepAlgoAPI_Fuse_1());F.SetArguments(L1);F.SetTools(L2);
        F.SetGlue(occt.BOPAlgo_GlueEnum.BOPAlgo_GlueShift); // le bloc et le reste ne se touchent que par les faces de coupe
        try{F.Build();}catch(e){F.Build(new occt.Message_ProgressRange());}
        if(F.IsDone())g=occShapeCopy(F.Shape());
      }catch(e){g=null;}
      // BILAN DE FACES : en collage, recollé = reste + bloc − faces de coupe (des deux côtés).
      // Marge large mesurée : 49 faces au lieu de 53 et +2 375 mm³ d'un solide pourtant « valide ».
      // Pas de bilan de volume (intégrer le corps entier coûtait 7 s par rejeu) ni d'unification
      // (UnifySameDomain a déformé un recollage : +1,19 mm³) — faces scindées au bord du bloc.
      const nF=sh=>{let n=0;const x=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);while(x.More()){n++;x.Next();}x.delete();return n;};
      const nCaps=sh=>{let n=0;const x=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);
        while(x.More()){const bb=new occt.Bnd_Box_1();occt.BRepBndLib.Add(x.Current(),bb,false);const q=bb.CornerMin(),z=bb.CornerMax(),A=[q.X(),q.Y(),q.Z()],Z=[z.X(),z.Y(),z.Z()];
          if([0,1,2].some(k=>[lo[k],hi[k]].some(c=>Math.abs(A[k]-c)<1e-4&&Math.abs(Z[k]-c)<1e-4)))n++;
          bb.delete();x.Next();}
        x.delete();return n;};
      const sain=sh=>!!sh&&nF(sh)===nF(rest)+nF(f)-nCaps(rest)-nCaps(f)&&nSol(sh)===nSol(base)&&occCoqueValide(sh);
      if(sain(g))return g;
      // collage refusé (Cavité Test à 70 : 2 solides, invalide) → fusion ordinaire
      del(g);g=null;try{g=occFuse(rest,f);}catch(e){g=null;}
      if(sain(g))return g;
      del(g);return null;
    }catch(e){return null;}finally{occDispose(bin);}
  };
  // MÉMOIRE : le rejeu puis l'affichage (occFinalShape) rejouent le même congé sur le même
  // solide — chaque reprise (~1,5 s) était payée deux fois. Clé : arêtes demandées (milieu,
  // rayon), nombre d'arêtes du corps et somme de leurs longueurs ; résultat rendu en copie.
  const key=occNurbsMemoKey(js,chamfer,single,edges);
  const hit=occNurbsMemoGet(key);if(hit)return hit;
  const g=local();
  const r=g?{shape:g,local:true}:(()=>{const s=filletNurbs(base);return s?{shape:s,local:false}:null;})();
  if(r){const c=occShapeCopy(r.shape);if(c){OCC_NURBS_MEMO.unshift({key,shape:c,local:r.local});
    while(OCC_NURBS_MEMO.length>8){const o=OCC_NURBS_MEMO.pop();try{o.shape.delete();}catch(e){}}}}
  return r;
}
const OCC_NURBS_MEMO=[]; // reprises NURBS récentes {key, shape, local} (voir occFilletNurbs)
function occNurbsMemoKey(js,chamfer,single,edges){
  return (chamfer?'C':'F')+(single?'1':'t')+'|'+(edges||[]).length+'|'+(edges||[]).reduce((a,e)=>a+e.len,0).toFixed(6)
    +'|'+js.map(j=>j.mid.map(v=>v.toFixed(5)).join(',')+'@'+j.r).join(';');
}
function occNurbsMemoGet(key){
  const hit=OCC_NURBS_MEMO.find(o=>o.key===key);if(!hit)return null;
  const c=occShapeCopy(hit.shape);return c?{shape:c,local:hit.local}:null;
}
function occXDefl(){
  // Finesse adaptative : les petits rayons exigent une déflection fine pour un aspect lisse.
  let mr=1e9;
  doc.features.filter(x=>x.type==='xfillet'&&x.visible!==false).forEach(xf=>(xf.edges||[]).forEach(se=>{if(se.r>0&&se.r<mr)mr=se.r;}));
  if(!(mr<1e9))return{lin:0.5,ang:0.5};
  return{lin:Math.min(0.5,Math.max(0.04,mr/10)),ang:0.25};
}
const OCC_DISPLAY_TRIS=400000; // budget de triangles d'AFFICHAGE (la FAO a les siens)
function occDisplayDefl(shape){
  // Déflection d'AFFICHAGE, commune au natif et aux imports : même maillage ⇒ même
  // normales lissées (smoothNormals 35°) ⇒ même ombrage faces/surfaces des deux côtés.
  // • linéaire proportionnel à la taille de la pièce (0,05 à 0,35 mm) : la finesse ne
  //   dépend plus de la présence d'un congé, elle suit l'objet réel ;
  // • angulaire 0,2 rad (~11°) au lieu de 0,5 rad (~29°) : les cercles/cylindres
  //   cessent d'être des polygones visibles.
  // CALIBRÉ sur le banc d'attente (bench_phase5, three.js réel, pièce 10 fonctions) :
  //   0,3/0,25 (avant) 5 300 tris / 176 ms  ·  0,1/0,2 8 500 tris / 242 ms
  //   0,04/0,2 12 100 tris / 300 ms  →  dg/1600 plafonne le surcoût de rejeu à ~+60 ms
  //   (+12 % de l'attente après modification) pour un gain net : cercles lisses et
  //   congés 3× plus fins qu'auparavant. Plus fin que dg/1600 coûte le double pour
  //   presque plus rien à l'écran.
  // NE PAS UTILISER pour l'outillage : occXDefl() reste la référence FAO (inchangée).
  let dg=100;
  try{const b=occSolidBox(shape);if(b&&b.dg>0)dg=b.dg;}catch(e){}
  return{lin:Math.min(0.35,Math.max(0.05,dg/1600)),ang:0.2};
}
function occTessellateBudget(shape,D,maxTris,countFn){
  // Tessellation d'affichage BORNÉE : si la définition voulue sortir trop de triangles,
  // on repasse en grossier (au plus deux paliers, D muté pour la suite du rejeu) - le
  // temps d'attente après modification reste prévisible quel que soit le fichier.
  // countFn : sonde optionnelle de comptage (le harnais Node n'a pas de compteurs
  // d'attributs THREE) ; par défaut on lit g.attributes.position.count.
  let g=null;
  for(let k=0;k<3;k++){
    try{g=occTessellate(shape,D.lin,D.ang);}catch(e){return null;}
    let n=0;
    if(typeof countFn==='function'){try{n=+countFn(g)||0;}catch(e){n=0;}}
    else{try{n=(g&&g.attributes&&g.attributes.position)?(Number(g.attributes.position.count)||0):0;}catch(e){n=0;}}
    if(!maxTris||n/3<=maxTris)return g;
    try{if(g&&g.dispose)g.dispose();}catch(e){}
    g=null;
    D.lin=Math.min(0.5,D.lin*4);D.ang=Math.min(0.6,D.ang*2);
    if(D.lin>=0.5&&D.ang>=0.6)break;
  }
  return g;
}
function occCleanup(FR,keepShape){
  if(!FR)return;
  occDispose(FR.bin);
  (FR.itemShapes||[]).forEach(s=>{if(s!==keepShape){try{s.delete();}catch(e){}}});
  if(FR.shape&&FR.shape!==keepShape){try{FR.shape.delete();}catch(e){}}
  // Rejeux jetables (projections, export : keepShape==null) : les solides par corps
  // partent aussi, sinon chaque passe upto fuit ses solides. Au rebuild (keep = occLive),
  // ce sont eux qui sont AFFICHÉS : on n'y touche jamais (b.shape les référence).
  if(!keepShape)(FR.perBody||[]).forEach(p=>{try{if(p.shape&&p.shape!==FR.shape)p.shape.delete();}catch(e){}});
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
let occProjPass=0; // 0 = rejeu principal ; >=1 = passe de projection imbriquée (rebuild(pass))
// Limite adaptative : 8 points de contrôle sur une timeline de 13 fonctions évacuaient les
// prÉfixes (les projections upto<13 ne trouvaient JAMAIS leur point de contrôle → rejeu
// complet 4 fois par reconstruction). On couvre toute la timeline, bornée pour la mémoire.
function occCkMax(){
  const n=(((typeof doc!=='undefined')&&doc&&doc.features)?doc.features.length:0)+2;
  // 2026-10-16-003 : 3 × la timeline (bornée) — après une modification, l'ancien ET le nouveau
  // préfixe coexistent pendant les passes de projection ; à 1 × ils s'évinçaient mutuellement.
  return Math.max(8,Math.min(3*n,120));
}
function occShapeCopy(sh){
  try{return new occt.BRepBuilderAPI_Copy_2(sh,true,true).Shape();}catch(e){return null;}
}
// 2026-10-16-003 : cache des OUTILS (prisme d'extrusion / révolution / perçage) par clé de
// préfixe — la même que les points de contrôle. Sur un point de contrôle trouvé, l'outil
// était quand même reconstruit (fusion des profils ≈ 45 % d'un rejeu « sans changement »).
let occToolCk=new Map(); // ckKey → {shape, warnings}
function occToolCkGet(key){
  if(freshHard&&!(occProjPass>=1))return null;
  const t=occToolCk.get(key);if(!t)return null;
  occToolCk.delete(key);occToolCk.set(key,t); // fraîcheur
  const sh=occShapeCopy(t.shape);return sh?{shape:sh,bins:[],warnings:t.warnings.slice()}:null;
}
function occToolCkPut(key,r){
  if(freshHard&&!(occProjPass>=1))return;
  if(!r||!r.shape||occToolCk.has(key))return;
  const cp=occShapeCopy(r.shape);if(!cp)return;
  occToolCk.set(key,{shape:cp,warnings:(r.warnings||[]).slice()});
  while(occToolCk.size>occCkMax()){const k=occToolCk.keys().next().value;const o=occToolCk.get(k);occToolCk.delete(k);try{o.shape.delete();}catch(e){}}
}
function occCkClear(){
  for(const c of occCk){try{c.shape.delete();}catch(e){}}
  occCk=[];occCkWarn={};
  occToolCk.forEach(o=>{try{o.shape.delete();}catch(e){}});occToolCk=new Map();
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
  // flip (sens inversé) et draft (dépouille d'extrusion) modifient le prisme : sans eux
  // dans la signature, basculer le sens ou l'angle réutiliserait le solide périmé.
  let s=f.type+'|'+(f.op||'add')+'|'+(+f.distance||0)+'|'+(f.mid?1:0)+'|'+(f.visible!==false?1:0)+'|'+(f.through?1:0)+'|'+(f.upto?JSON.stringify(f.upto):'')+'|'+(f.flip?1:0)+'|'+(+f.draft||0)+'|b'+(f.body||'');
  if(f.type==='hole'){
    // Perçage : esquisse (centres) + tous les paramètres qui façonnent l'outil de découpe.
    const skH=doc.sketches.find(x=>x.id===f.sketchId);
    s+='|'+f.sketchId+'|'+(skH?skSig(skH):'?')+'|'+JSON.stringify([f.kind,f.d,f.thread||null,f.cbD,f.cbH,f.csD,f.csA,f.end,f.depth,f.tip,!!f.flip,f.uptoPlane||null]);
    if(skH)(skH.entities||[]).forEach(e=>{if(e&&e.t==='cpoint'&&e.hole){const Q=skH.points[e.p];if(Q)s+=';h'+Q.x.toFixed(4)+','+Q.y.toFixed(4);}});
  }
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
    // tangent (chaîne déduite à chaque rejeu) et seed (arête germe) changent la GÉOMÉTRIE
    // appliquée : les mettre dans la signature force le cache à rejouer quand on décoche
    // « arêtes tangentes » ou qu'on change de germe — sinon le solide périmé persiste.
    s+='|'+(f.chamfer?1:0)+'|'+(f.tangent?1:0)+'|'+((f.edges||[]).map(e=>
      // 2026-10-16-008 : position d'ORIGINE figée (pos0) et non le relevé pos/len rafraîchi à
      // chaque appariement — sinon la signature changeait APRÈS chaque rejeu (point de contrôle
      // jamais retrouvé). Un changement en amont change déjà le préfixe : aucune fraîcheur perdue.
      (+e.r||0)+(e.seed?'s':'')+'@'+(e.pos0||e.pos||[]).map(x=>(+x).toFixed(3)).join(',')
      +((e.anchor)?('#'+e.anchor.t+(e.anchor.sk||'')+(e.anchor.id||'')+'z'+(e.anchor.z||0)+'s'+(e.anchor.side||0)+'d'+(e.anchor.dist||0)+'f'+(e.anchor.far||0)):'')).join(';'));
  }else if(f.type==='combine'){
    // mode + historique COMPLET des corps outils jusqu'à la combinaison
    s+='|'+(f.mode||'union')+'|'+(f.keep?1:0)+'|'+(f.tools||[]).map(t=>t+':'+occCombinePrefix(f,t).map(featSig).join(',')).join('/');
  }else if(f.type==='xmove'){
    // La DISTANCE fait partie de la géométrie, et la face visée par sa référence durable
    // (centre + normale + dimensions) : sans elle, changer la distance d'un déplacement
    // laisserait la signature inchangée et le point de contrôle réappliquerait l'ancien.
    s+='|d'+(+f.dist||0)+'@'+JSON.stringify(f.ref||null);
  }else if(f.type==='bmove'){
    // Déplacer un corps : ses étapes (translations, rotations, point à point) font la géométrie
    s+='|'+JSON.stringify(f.steps||[]);
  }else if(f.type==='xdelface'){
    s+='|'+((f.faces||[]).map(r=>JSON.stringify([r.pos,r.n||r.st,r.dim])).join(';'));
  }else if(f.type==='xsplit'){
    // Plan RÉSOLU (un plan de construction peut bouger sans que la fonction change) et,
    // pour le corps neuf, l'historique du corps source jusqu'à la scission (comme combine).
    const P=splitPlaneOf(f);
    s+='|'+P.o.map(v=>(+v).toFixed(4)).join(',')+'/'+P.n.map(v=>(+v).toFixed(6)).join(',');
    if(occSplitNewBody(f))s+='|src:'+occCombinePrefix(f,occBodyOfFeat(f)).map(featSig).join(',');
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
    s+='|'+(f.base||[]).join(',')+'|'+(+f.copies||1)+'|'+(+f.dist||0)+'|'+(+f.angle||0)+'|'+(f.axis||f.plane||'')+'|'+JSON.stringify(f.planeN||null)+'|'+(f.plane2||'')+'|'+JSON.stringify(f.planeN2||null)
      +'|'+JSON.stringify(f.dir||null)+'|'+(f.lin2?[f.axis2,JSON.stringify(f.dir2||null),+f.copies2||1,+f.dist2||0].join(','):''); // 2ᵉ direction (grille)
  }
  // Filet (2026-10-02-011) : la fonction ENTIÈRE entre dans la signature — toute
  // propriété, connue ou future, invalide le suffixe dès qu'elle bouge, donc jamais
  // de solide périmé réutilisé si un champ se rajoute au moteur. Exclus :
  // _mesh/_m (état dérivé vivant, non géométrique — _mesh est une référence THREE
  // non sérialisable), name/open (affichage pur : replier un nœud ou renommer ne
  // change pas le solide et invaliderait tout).
  const jf={};for(const k in f){if(k==='name'||k==='open'||k==='_m'||k==='_mesh')continue;jf[k]=f[k];}
  s+='|j'+JSON.stringify(jf);
  return s;
}
function occCkGet(key){
  for(let i=occCk.length-1;i>=0;i--)if(occCk[i].key===key)return occCk[i].shape;
  return null;
}
function occCkPut(key,mkShape){
  // Mode frais (2026-10-02-014) : le rejeu principal (pass 0) ne MÉMORISE rien —
  // fraîcheur absolue et copie BRep (1 à 4 ms) économisée à chaque fonction. Seules
  // les passes de projection imbriquées (rebuild(pass>=1)) posent leurs points de
  // contrôle : elles rejouent un préfixe déjà stabilisé par le rejeu courant.
  if(freshHard&&!(occProjPass>=1))return;
  const mk=(typeof mkShape==='function')?mkShape:null;
  const i=occCk.findIndex(c=>c.key===key);
  if(i>=0){
    // Déjà mémorisé : on GARDE l'existant, on remonte sa fraîcheur (fin de file = à évacuer
    // en dernier). (Ne comparer qu'à la dernière clé laissait les doublons gonfler la file
    // et évacuer les vrais points de contrôle.) La copie n'est même plus fabriquée.
    const old=occCk[i];occCk.splice(i,1);occCk.push(old);
    if(!mk&&mkShape){try{mkShape.delete();}catch(e){}}
    return;
  }
  const shape=mk?mk():mkShape;
  if(!shape)return;
  occCk.push({key,shape});
  while(occCk.length>occCkMax()){const old=occCk.shift();try{old.shape.delete();}catch(e){}}
}
function occReplayBody(bid,list){
  // Rejeu ISOLÉ d'un corps : mêmes règles que l'ancien rejeu global (ordre timeline,
  // Fuse/Cut, congés/déplacements/dépouilles/coques entrelacés, cache par points de
  // contrôle), mais l'accumulateur ne voit QUE les fonctions du corps — une découpe du
  // corps A ne retire jamais de matière au corps B (Fusion). Les clés de cache sont
  // préfixées du corps : deux corps aux signatures identiques ne se partagent rien.
  const bin=[],itemShapes=[],imports=[];let result=null;const msgs=[],ghostShapes=[];
  let ckKey=asmCkPrefix()+bid+'|'+(occSkipFeat||'')+'|'; // signature cumulée du préfixe — SANS marqueur upto :
  // ALL et UPn parcourent les MÊMES préfixes cumulatifs ; un marqueur dans la clé privait
  // les projections (upto<n) de tous les points de contrôle posés par le rejeu complet.
  const items=[]; // extrudes réussies, dans l'ordre (affichage nA/nC)
  // Un import SEUL reste affiché comme avant (son mesh, son nom dans Pièces) ;
  // dès qu'AU MOINS une autre fonction coexiste dans le corps, il entre dans la
  // chaîne exacte et devient le volume à unir / soustraire.
  const importSeul=!list.some(f=>f&&f.type!=='import');
  list.forEach(f=>{
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
      occCkPut(ckKey,()=>occShapeCopy(result));
      return;
    }
    if(f.type==='xmove'||f.type==='xdelface'||f.type==='bmove'){
      if(!result){msgs.push(`${f.name} : aucun volume à `+(f.type==='bmove'?'déplacer':'déformer')+` — ignoré`);return;}
      const ckM=occCkGet(ckKey);
      const cpM=ckM?occShapeCopy(ckM):null;
      if(cpM){
        try{result.delete();}catch(e){}result=cpM;
        const w=occCkWarn[ckKey];if(w&&w.length)msgs.push(...w.map(x=>`${f.name} : ${x}`));
        return;
      }
      const r=f.type==='xmove'?occApplyMoveFace(result,f):f.type==='bmove'?occApplyBodyMove(result,f):occApplyDeleteFaces(result,f); // bmove : 85-deplacer-corps
      result=r.shape;msgs.push(...r.warnings.map(w=>`${f.name} : ${w}`));
      if(r.warnings.length)occCkWarn[ckKey]=r.warnings.slice();else delete occCkWarn[ckKey];
      occCkPut(ckKey,()=>occShapeCopy(result));
      return;
    }
    if(f.type==='xsplit'){
      // Scinder : côté gardé dans le corps de la fonction ; en tête du corps NEUF (mode
      // corps), l'autre côté du corps source tel qu'il est à cet endroit de la timeline.
      const neuf=occSplitNewBody(f)===bid;
      const ckP=occCkGet(ckKey);
      const cpP=ckP?occShapeCopy(ckP):null;
      if(cpP){
        if(result)try{result.delete();}catch(e){}result=cpP;
        const w=occCkWarn[ckKey];if(w&&w.length)msgs.push(...w.map(x=>`${f.name} : ${x}`));
        return;
      }
      let src=result;
      if(neuf){
        if(result){msgs.push(`${f.name} : fonctions du corps neuf placées avant la scission — ignorées`);try{result.delete();}catch(e){}result=null;}
        try{src=occCombineTool(f,occBodyOfFeat(f),bin);}catch(err){src=null;msgs.push(`${f.name} : corps source illisible (${err.message})`);}
      }
      if(!src){if(!neuf)msgs.push(`${f.name} : aucun volume à scinder — ignoré`);return;}
      const r=occApplySplit(src,f,neuf?'pos':'neg');
      result=r.shape;
      const w=neuf?(r.fatal?r.warnings:[]):r.warnings; // le corps d'origine porte déjà les avertissements
      msgs.push(...w.map(x=>`${f.name} : ${x}`));
      if(w.length)occCkWarn[ckKey]=w.slice();else delete occCkWarn[ckKey];
      if(result)occCkPut(ckKey,()=>occShapeCopy(result));
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
      occCkPut(ckKey,()=>occShapeCopy(result));
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
      occCkPut(ckKey,()=>occShapeCopy(result));
      return;
    }
    let shape=null;
    if(f.type==='import'){
      // UNI / SOUSTRACTION avec un STEP importé : la voie exacte ne rejouait que
      // extrude/revolve — le STEP n'entraît JAMAIS dans l'accumulateur, donc
      // « Uni » restait deux pièces affichées côte à côte et « Soustraction »
      // tombait dans le vide (« découpe dans le vide — ignorée »).
      if(importSeul)return; // seul : affichage d'origine (mesh + nom du fichier)
      const e=(typeof importGeom!=='undefined')?importGeom.get(f.id):null;
      const bp=e&&e.brep;
      if(!bp){
        // 2026-10-26 : la clé des points de contrôle ne disait pas si le STEP était là. Au
        // rechargement (Ctrl+R), le noyau rejoue AVANT importRestorePending : les points
        // mémorisés SANS le STEP étaient ensuite repris tels quels, une fois le STEP
        // restauré → seule l'opération restait affichée. Marque d'absence dans la clé.
        ckKey+='!'+f.id+';';
        msgs.push(`${f.name} : `+(f.src&&f.src.fmt==='step'?'STEP en cours de restauration':'solide exact indisponible (import STL) — combinaison réservée au repli maillage'));
        return;
      }
      shape=occShapeCopy(bp); // COPIE : la table reste propriétaire de son BRep
      if(!shape){msgs.push(`${f.name} : copie exacte impossible — ignoré`);return;}
      imports.push(f.id);
      if(!result){result=shape;occCkPut(ckKey,()=>occShapeCopy(result));return;}
      // Mêmes règles qu'une fonction additive (ci-dessous) : point de contrôle
      // avant de refaire la fusion la plus coûteuse.
      const ckI=occCkGet(ckKey);
      const cpI=ckI?occShapeCopy(ckI):null;
      if(cpI){try{result.delete();}catch(e2){}try{shape.delete();}catch(e2){}result=cpI;return;}
      const uI=occUnify(occFuse(result,shape));
      try{result.delete();}catch(e2){}try{shape.delete();}catch(e2){}
      result=uI;
      occCkPut(ckKey,()=>occShapeCopy(result));
      return;
    }
    if(f.type==='combine'){
      if(!result){msgs.push(`${f.name} : corps cible vide — ignoré`);return;}
      const ckB=occCkGet(ckKey);const cpB=ckB?occShapeCopy(ckB):null;
      if(cpB){try{result.delete();}catch(e){}result=cpB;return;}
      let r2=result;
      (f.tools||[]).forEach(tb=>{
        if(tb===bid)return;
        let ts=null;try{ts=occCombineTool(f,tb,bin);}catch(err){msgs.push(`${f.name} : corps outil illisible (${err.message})`);}
        if(!ts){msgs.push(`${f.name} : corps outil vide à cet endroit de la timeline`);return;}
        try{
          const n=f.mode==='cut'?occCut(r2,ts):(f.mode==='intersect'?occCommon(r2,ts):occUnify(occFuse(r2,ts)));
          try{r2.delete();}catch(e){}r2=n;
        }catch(err){msgs.push(`${f.name} : ${err.message}`);}
        try{ts.delete();}catch(e){}
      });
      result=r2;
      occCkPut(ckKey,()=>occShapeCopy(result));
      return;
    }
    if(f.type!=='extrude'&&f.type!=='revolve'&&f.type!=='hole')return; // hole : fonction Perçage (src/76), toujours une découpe
    // Pour une découpe « à travers tout », l'étendue se mesure sur le solide DÉJÀ reconstruit
    // (tout ce qui précède dans la timeline) — jamais sur l'affichage de l'édition précédente.
    occThroughBase=(((f.type==='extrude'&&f.through)||f.type==='hole')&&result)?result:null; // perçage : débouchant / prochaine face
    try{
      let r=occToolCkGet(ckKey);
      if(!r){r=(f.type==='revolve')?occShapeOfRevolve(f):(f.type==='hole'?occShapeOfHole(f):occShapeOfExtrude(f));occToolCkPut(ckKey,r);}
      bin.push(...r.bins);itemShapes.push(r.shape);
      if(r.warnings.length)msgs.push(...r.warnings.map(w=>`${f.name} : ${w}`));
      shape=r.shape;items.push({f,shape});
    }catch(err){
      // Isolation : UNE esquisse fautive ne fait plus basculer tout le solide en maillage.
      msgs.push(`${f.name} : exclu de l'exact (${err.message})`);
      try{
        const gl=(f.type==='revolve')?legacyRevolveGeos(f,msgs):(f.type==='hole'?legacyHoleGeos(f,msgs):legacyPrismGeos(f,msgs));
        gl.forEach(g=>ghostShapes.push({geo:g,orphan:true,inexact:f.name,fid:f.id}));
      }catch(e2){msgs.push(`${f.name} : même le maillage échoue (${e2.message})`);}
      return;
    }
    const op=(f.type==='hole')?'cut':(f.op||'add');
    if(op==='cut'){
      // Fantôme tessellé AVANT delete (use-after-delete = crash + repli fantôme).
      // Filet hélicoïdal : le fantôme est un simple aperçu → maillage plus grossier
      // (2× plus rapide), la géométrie exacte et le solide final ne changent pas.
      const ghostGeo=(()=>{try{return f.type==='hole'?occTessellate(shape,1,0.8):occTessellate(shape,0.5);}catch(e){msgs.push(`${f.name} : outil illisible`);return null;}})();
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
      if(!result){result=shape;occCkPut(ckKey,()=>occShapeCopy(result));return;}
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
    occCkPut(ckKey,()=>occShapeCopy(result)); // point de contrôle pour le rejeu suivant
  });
  return{shape:result,ghostShapes,msgs,bin,itemShapes,items,imports};
}
function occFinalShape(upto){
  // Partition par corps (ordre de première apparition dans la timeline), rejeu isolé
  // par corps, puis composé GRATUIT pour occLive (picking, ancrages, overlay, aperçu
  // et export continuent de voir l'ensemble, inchangés).
  // upto = indice exclusif (rejeu partiel pour références d'esquisse) ; null = tout.
  // Retourne {shape, perBody:[{bodyId,shape}], ghostShapes, msgs, bin, itemShapes, items}.
  ensureBodies();
  const feats=doc.features.filter(f=>f.visible!==false);
  const list=(upto==null?feats:feats.slice(0,upto)).filter(f=>!(occSkipFeat&&f.id===occSkipFeat));
  const order=[],byBody={};
  list.forEach(f=>{
    const b=(f.body&&doc.bodies.some(e=>e.id===f.body))?f.body:doc.bodies[0].id;
    if(!byBody[b]){byBody[b]=[];order.push(b);}
    byBody[b].push(f);
    const nb=occSplitNewBody(f); // scission de corps : l'autre côté naît dans le corps neuf
    if(nb){if(!byBody[nb]){byBody[nb]=[];order.push(nb);}byBody[nb].push(f);}
  });
  const perBody=[],bin=[],itemShapes=[],ghostShapes=[],msgs=[],items=[],imports=[];
  // corps OUTILS consommés par une combinaison (sans « garder ») : plus affichés
  const consumed=new Set();list.forEach(f=>{if(f.type==='combine'&&!f.keep)(f.tools||[]).forEach(t=>consumed.add(t));});
  order.forEach(bid=>{
    if(consumed.has(bid))return;
    const r=occReplayBody(bid,byBody[bid]);
    if(r.shape){
      let sh=r.shape;
      // 2026-10-19 : quand un congé/chanfrein exact a été appliqué, recoudre les faces de MÊME
      // surface qu'il a pu scinder (surtout via le repli ARÊTE PAR ARÊTE quand le lot OCCT
      // échoue) : une face voisine — ou le congé — restait coupée en DEUX par une couture
      // parasite. occUnify est celui des fusions additives. PAS d'unify sans congé : les
      // coutures d'esquisse (scission d'une face à un point du profil) restent cliquables —
      // notamment comme ancre d'un congé (cf. test_conge_fond_poche).
      // Une face SCINDÉE (xsplit 'face') serait recousue : pas d'unify dans ce corps.
      if((byBody[bid]||[]).some(f=>f.type==='xfillet')&&!(byBody[bid]||[]).some(f=>f.type==='xsplit'&&f.mode!=='body')){
        try{const u=occUnify(occShapeCopy(sh));if(u&&u!==sh){try{sh.delete();}catch(e){}sh=u;}}catch(e){}
      }
      perBody.push({bodyId:bid,shape:sh});
    }
    bin.push(...r.bin);itemShapes.push(...r.itemShapes);
    ghostShapes.push(...r.ghostShapes);msgs.push(...r.msgs);items.push(...r.items);
    imports.push(...r.imports); // imports entrés dans la chaîne exacte (affichés par le corps)
  });
  const shape=occCompoundOf(perBody.map(p=>p.shape));
  return{shape,perBody,ghostShapes,msgs,bin,itemShapes,items,imports};
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
  const sp=Object.assign({},extrudeSpan(f));
  // V0.9.3 : DÉCOUPE EN MAILLAGE — l'outil posé pile sur la face hôte (esquisse sur la
  // face du dessus) a des faces coplanaires à celles du corps : le CSG (BSP) ne sait pas
  // trancher et rend un solide cassé (Cavité Test en file:// : bloc absent, parois de
  // poche seules). L'outil dépasse de 0,01 mm du côté du plan d'esquisse ; la profondeur
  // de la découpe est inchangée.
  if((f.op||'add')==='cut'){const eps=0.01;if(Math.abs(sp.hi)<1e-9)sp.hi=eps;if(Math.abs(sp.lo)<1e-9)sp.lo=-eps;}
  const len=Math.max(1e-6,sp.hi-sp.lo);
  if(bevelR>0){bevelR=Math.min(bevelR,len/2.2,8);if(bevelR<0.05)bevelR=0;}
  const geos=[];
  // V0.9.3 : CONTOUR NETTOYÉ — le dernier point d'un contour arc/droite retombait à
  // ~1e-15 mm du premier (Cavité Test, coins R8) : 8 triangles d'aire nulle dans le
  // prisme, sur lesquels le CSG (BSP) se perd — découpe rendue comme un solide cassé.
  // Points consécutifs confondus (< 1e-6 mm) retirés, contour et trous redessinés en
  // polylignes à la même finesse que ExtrudeGeometry (curveSegments 48).
  const clean=function(pts){
    const out=[];
    for(const q of pts)if(!out.length||Math.hypot(q.x-out[out.length-1].x,q.y-out[out.length-1].y)>1e-6)out.push(q);
    while(out.length>2&&Math.hypot(out[0].x-out[out.length-1].x,out[0].y-out[out.length-1].y)<=1e-6)out.pop();
    return out;};
  built.shapes=built.shapes.map(function(s0){
    if(typeof s0.extractPoints!=='function')return s0; // stub du banc VM
    const ex=s0.extractPoints(48),s=new THREE.Shape(clean(ex.shape));
    ex.holes.forEach(function(h){s.holes.push(new THREE.Path(clean(h)));});
    return s;});
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
function occSolidBox(sh){
  // Boîte + diagonale d'un solide (pour les tolérances relatives), ou null.
  try{
    const box=new occt.Bnd_Box_1();occt.BRepBndLib.Add(sh,box,true);
    const a=box.CornerMin(),b=box.CornerMax();
    const r={c:[(a.X()+b.X())/2,(a.Y()+b.Y())/2,(a.Z()+b.Z())/2],
      dg:Math.hypot(b.X()-a.X(),b.Y()-a.Y(),b.Z()-a.Z())};
    try{box.delete();}catch(e){}
    return r;
  }catch(e){return null;}
}
function occBodyOfMesh(mesh){
  // Corps exact affiché par son mesh (multi-corps : chaque mesh a ses propres
  // ordinaux de faces — on résout toujours sur le SOLIDE DU CORPS, jamais sur
  // le composé occLive dont les ordinaux globaux diffèrent dès qu'il y a 2 corps).
  if(!mesh)return null;
  const bd=bodies.find(b=>b.mesh===mesh);
  return (bd&&bd.kind==='body'&&bd.shape)?bd:null;
}
function occFaceOfHit(mesh,fi){
  // Face BRep d'un triangle cliqué : {face, ord, bd}. La face retournée est un
  // handle neuf — à l'appelant de la supprimer après occFaceRef (comme occFaceAt).
  const bd=occBodyOfMesh(mesh);
  if(!bd||fi===undefined||fi===null)return null;
  try{
    const groups=mesh.geometry.userData.occGroups||[];
    const g=groups.find(g=>fi>=g.start&&fi<g.start+g.count);
    if(!g)return null;
    const face=occFaceAt(bd.shape,g.f);
    if(!face)return null;
    return {face:face,ord:g.f,bd:bd};
  }catch(e){return null;}
}
function bodyEntry(id){
  // Fiche persistée d'un corps (nom/couleur/centroïde) : la créer si besoin.
  if(!doc.bodies)doc.bodies=[];
  let e=doc.bodies.find(x=>x.id===id);
  if(!e){e={id:id,name:id,c:null};doc.bodies.push(e);}
  return e;
}
function ensureBodies(){
  // Normalise les corps CONTENEURS (vrais conteneurs façon Fusion, pas des étiquettes
  // dérivées) : au moins un corps, compteur et actif valides, chaque fonction rangée
  // dans un corps existant. Idempotent — appelé au rebuild et au chargement, donc les
  // anciens documents (sans corps ni f.body) migrent tout seuls vers « Corps 1 ».
  if(!doc.bodies)doc.bodies=[];
  doc.bodies=doc.bodies.filter(e=>e&&typeof e.id==='string');
  if(!(doc.bodySeq>0)){
    let mx=0;
    doc.bodies.forEach(e=>{const m=/^b(\d+)$/.exec(e.id||'');if(m)mx=Math.max(mx,+m[1]);});
    (doc.features||[]).forEach(f=>{const m=/^b(\d+)$/.exec(f.body||'');if(m)mx=Math.max(mx,+m[1]);});
    doc.bodySeq=mx+1;
  }
  if(!doc.bodies.length){
    const n=doc.bodySeq++;
    doc.bodies.push({id:'b'+n,name:'Corps '+n,c:null});
  }
  const ids=new Set(doc.bodies.map(e=>e.id));
  (doc.features||[]).forEach(f=>{if(!f||typeof f!=='object')return;if(!ids.has(f.body))f.body=doc.bodies[0].id;});
  if(!ids.has(doc.activeBody))doc.activeBody=doc.bodies[0].id;
  // Migration « la couleur et la transparence vivent dans le CORPS » : l'ancien
  // modèle portait f.color / f.opacity sur la FONCTION (+ une teinte pièce globale).
  // On les reporte sur la fiche du corps puis on les SUPPRIME — une seule source
  // pour le panneau du corps, le clic-droit et le rendu, quel que soit le moteur
  // (exact ou maillage). Idempotent : rejoué à chaque rejeu, sans effet ensuite.
  try{
    (doc.features||[]).forEach(f=>{
      if(!f)return;
      if(f.color>0||(f.opacity>0&&f.opacity<1)){
        const e=bodyEntry(ids.has(f.body)?f.body:doc.bodies[0].id);
        if(e){
          if(f.color>0&&!(e.color>0))e.color=f.color;
          if(f.opacity>0&&f.opacity<1&&!(e.op>0))e.op=Math.round(f.opacity*1000)/1000;
        }
      }
      if(f.color>0)delete f.color;
      if(f.opacity!==undefined)delete f.opacity;
    });
    if(doc.tint>0){ // teinte pièce : reportée sur chaque corps déjà colorié, puis retirée
      const t=doc.tint;
      doc.bodies.forEach(e=>{if(e&&!(e.color>0))e.color=t;});
      delete doc.tint;
    }
  }catch(err){}
  return doc.bodies;
}
function ensureActiveBody(){
  // Corps de destination des NOUVELLES fonctions : l'actif s'il existe, sinon le
  // premier (jamais de fonction orpheline, même après un undo exotique).
  try{
    ensureBodies();
    if(doc.bodies.some(e=>e.id===doc.activeBody))return doc.activeBody;
    doc.activeBody=doc.bodies[0].id;
    return doc.activeBody;
  }catch(e){return 'b1';}
}
function occCompoundOf(shapes){
  // Composé SANS booléen (gratuit : ~0 ms contre ~100 ms par fuse) pour occLive :
  // picking d'arêtes, ancrages, overlay et aperçu continuent de voir l'ensemble.
  // Les handles partagent les TShapes (compteur OCCT) : suppression habituelle.
  const list=(shapes||[]).filter(Boolean);
  if(!list.length)return null;
  if(list.length===1)return list[0];
  try{
    const comp=new occt.TopoDS_Compound();
    const bd=new occt.TopoDS_Builder();
    bd.MakeCompound(comp);
    list.forEach(s=>{try{bd.Add(comp,s);}catch(e){}});
    try{bd.delete();}catch(e){}
    return comp;
  }catch(e){}
  // Repli : fusions en chaîne (une union de disjoints rend le même composé).
  try{
    let acc=occShapeCopy(list[0]);
    for(let i=1;i<list.length;i++){const u=occFuse(acc,list[i]);try{acc.delete();}catch(e){}acc=u;}
    return acc;
  }catch(e){return list[0];}
}
function occRebuild(){
  // Retourne true si la voie exacte a abouti (même partiellement), false pour repli maillage.
  occDropLive();
  let FR=null;
  try{
    const _tr=performance.now();
    FR=occFinalShape(tlReplayCount());
    phAdd('replay',performance.now()-_tr);
    const _ts=performance.now();
    // UN mesh PAR CORPS, rejoué isolément : l'id affiché EST l'id du corps (stable,
    // persisté - plus aucun rapprochement par centroïdes). occLive garde le COMPOSÉ :
    // congés, ancrages, picking d'arêtes, overlay et cache voient l'ensemble, inchangés.
    const parts=(FR.perBody||[]).filter(p=>p&&p.shape);
    // Déflection d'AFFICHAGE commune au natif et aux imports (même ombrage) et bornée
    // en triangles : occXDefl() — la référence FAO — n'intervient PAS ici, intentionnellement.
    const D=occDisplayDefl(FR.shape||(parts[0]&&parts[0].shape)||null);
    let trisTot=0;
    if(parts.length){
      parts.forEach(p=>{
        const e=bodyEntry(p.bodyId);
        let g=null;
        try{
          g=occTessellateBudget(p.shape,D,Math.max(1,OCC_DISPLAY_TRIS-trisTot));
          if(!g)g=occTessellate(p.shape,D.lin,D.ang);
        }catch(err){FR.msgs.push(e.name+' : maillage impossible, ignoré');return;}
        // Compteur d'attributs parfois illisible (harnais Node, geometry exotique) :
        // ce n'est PAS une géométrie vide — on affiche quand même, plutôt que de
        // faire échouer tout le rebuild exact et de basculer sur le moteur maillage.
        let tris=0,lit=true;
        try{tris=(g.attributes.position.count/3)|0;}catch(err){lit=false;}
        trisTot+=lit?tris:0; // budget global : dépassement ⇒ D muté grossier pour les corps suivants
        if(lit&&!(tris>0)){try{g.dispose&&g.dispose();}catch(err){}return;}
        try{const info=occSolidBox(p.shape);if(info)e.c=info.c;}catch(err){}
        const col=bodyColorOf(e.id); // fiche du corps : couleur unique (plus de couleur par fonction)
        const mat=new THREE.MeshStandardMaterial({color:col,metalness:.35,roughness:.4,clippingPlanes:clipPlane?[clipPlane]:null});
        applyBodyStyle(mat,e.id); // + transparence du corps (100 % = opaque, inchangé)
        const mesh=new THREE.Mesh(g,mat);mesh.userData.bid=e.id;scene.add(mesh);
        const vis=!doc.bodyVis||!Object.prototype.hasOwnProperty.call(doc.bodyVis,e.id)?true:!!doc.bodyVis[e.id];
        mesh.visible=vis;
        bodies.push({id:e.id,name:e.name+' · '+(lit?tris.toLocaleString('fr'):'?')+' tris',mesh,color:col,visible:vis,kind:'body',ref:null,bodyId:e.id,shape:p.shape});
      });
      if(!bodies.some(b=>b.kind==='body'))faceEl.textContent+=(faceEl.textContent?'\n':'')+'Solide exact vide (tout a été découpé).';
      if(FR.shape){occLive={shape:FR.shape};FR.shape=null;} // conservé pour le picking d'arêtes
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
      }catch(e){FR.msgs.push('fantôme illisible, ignoré');}
    });
    // Imports mesh : affichés tels quels SAUF s'ils sont entrés dans la chaîne exacte
    // (ils SONT alors le corps : un second affichage montrerait le solide deux fois).
    const consommes=new Set(FR.imports||[]);
    doc.features.filter(f=>f.visible!==false&&f.type==='import'&&f._mesh).forEach(f=>{
      if(consommes.has(f.id)){try{scene.remove(f._mesh);}catch(e){}return;}
      const col=bodyColorOf(f.body); // l'import appartient à un corps : SA couleur
      f._mesh.material=applyBodyStyle(FreshMat(col),f.body);scene.add(f._mesh);
      bodies.push({id:f.id,name:f.name,mesh:f._mesh,color:col,visible:true,kind:'import',ref:f.id,bodyId:f.body||null});
    });
    occCleanup(FR,(occLive&&occLive.shape)||null);
    if(FR.msgs.length)faceEl.textContent+=(faceEl.textContent?'\n':'')+FR.msgs.slice(0,4).join('\n');
    phAdd('mesh',performance.now()-_ts);
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
  const _tp=performance.now();
  try{ch=updateAllProjections();}catch(e){}
  phAdd('proj',performance.now()-_tp);
  if(!ch)return false;
  if(sigOf()===s0){
    // Projeté recalé sans effet sur le profil : on ne rejoue pas, mais on persiste les
    // nouvelles coordonnées et on redessine l'esquisse ouverte (tracé 2D non rafraîchi).
    try{autosave();}catch(e){}
    try{if(typeof skEdit!=='undefined'&&skEdit)drawSketch2D();}catch(e){}
    return false;
  }
  if((pass||0)<REGEN_MAX_PASS){ try{rebuild((pass||0)+1);}catch(e){} return true; }
  try{autosave();}catch(e){} // coordonnées déjà écrites : au moins les persister
  try{faceEl.textContent+=(faceEl.textContent?'\n':'')+'⚠ Régénération : le modèle ne s’est pas stabilisé en '+REGEN_MAX_PASS+' passes (référence circulaire ?).';}catch(e){}
  return false;
}
