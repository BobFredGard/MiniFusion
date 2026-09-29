/* ---------- esquisse 2D ---------- */
let skEdit=null, skAnteriorGhost=null;
function newSketch(preset){
  const isPlane=p=>typeof p==='string'&&['XY','XZ','YZ'].includes(p.toUpperCase());
  let pl=isPlane(preset)?preset.toUpperCase():((sel.kind==='plane'&&isPlane(sel.id))?sel.id:null);
  if(!pl)pl='XY'; // défaut plan XY (plus de prompt) — double-clic sur un plan de l'arborescence = esquisse dessus
  const sk={id:uid('sk'),name:'Esquisse '+(doc.sketches.length+1),plane:pl,entities:[],points:{},constraints:[],dims:[],seq:1,visible:true,origin:[0,0,0]};
  ensureSketchBasis(sk);
  doc.sketches.push(sk);markDirty();rebuild();openSketch(sk.id);
}
function sketchFaceLabel(sk){
  if(!sk)return '?';
  if(sk.plane==='FACE'&&sk.origin)return 'FACE @('+sk.origin.map(v=>(+v).toFixed(1)).join(', ')+')'+(sk.host&&sk.host.name?' · '+sk.host.name:'');
  return sk.plane;
}
function newSketchOnFace(){
  if(skEdit)return;
  // Priorité : face mesurée / sélectionnée, sinon pick au centre de l'écran
  let s=selFaces&&selFaces.length?selFaces[0]:null;
  if(!s){
    // tente un pick au centre du viewport
    const el=renderer.domElement,r=el.getBoundingClientRect();
    const fake={clientX:r.left+r.width/2,clientY:r.top+r.height/2};
    const h=pick(fake);
    if(h)s={mesh:h.object,point:h.point.clone(),faceIndex:h.faceIndex};
  }
  if(!s||!s.mesh){faceEl.textContent='Esquisse sur face : cliquez d\u2019abord une face (clic simple), puis re-cliquez « Esquisse ».';return;}
  const nrm=faceNormalWorld(s.mesh,s.faceIndex);
  if(!nrm){faceEl.textContent='Esquisse sur face : normale illisible.';return;}
  const pt=(s.point||new THREE.Vector3()).clone();
  const n=nrm.clone().normalize();
  // origine = repère global projeté sur le plan (raycast validé) → projections symétriques
  // (jamais le point de clic : voir faceSketchOrigin — centroïde de face en repli déterministe)
  const origin=faceSketchOrigin(s.mesh,n,pt,s.faceIndex);
  // axes alignés sur l'esquisse parallèle parente (sinon X global projeté)
  const{u,v}=basisOnFace(n,faceRefU(n));
  // host : face porteuse nommée (antériorité) — fait suivre l'esquisse quand la porteuse bouge
  // x/y stockés depuis l'origine (pas le point de clic) pour ne pas dériver
  const host=findHostForFace(origin,n);
  const sk={id:uid('sk'),name:'Esquisse '+(doc.sketches.length+1)+' (face)',plane:'FACE',
    entities:[],points:{},constraints:[],dims:[],seq:1,visible:true,
    origin:[+origin.x.toFixed(3),+origin.y.toFixed(3),+origin.z.toFixed(3)],
    axU:[u.x,u.y,u.z],axV:[v.x,v.y,v.z],axN:[n.x,n.y,n.z],
    host:host?Object.assign({feat:host.feat.id,tag:host.tag,x:host.x,y:host.y,name:entName('face')},(host.tag==='SIDE')?{edge:host.edge,h:host.h}:{}):null};
  doc.sketches.push(sk);markDirty();rebuild();openSketch(sk.id);
  faceEl.textContent='Esquisse '+sk.name+' posée sur '+(sk.host&&sk.host.name||'face')+' (normale '+n.x.toFixed(2)+','+n.y.toFixed(2)+','+n.z.toFixed(2)+') · origine '+sk.origin.join(', ')+' (repère projeté). Dessinez puis extrudez le long de la normale.';
}
function faceNormalWorld(mesh,fi){
  try{
    const g=mesh.geometry;if(!g||!g.attributes.position)return null;
    const p=g.attributes.position,a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
    if(g.index&&fi!==undefined){a.fromBufferAttribute(p,g.index.getX(fi*3));b.fromBufferAttribute(p,g.index.getX(fi*3+1));c.fromBufferAttribute(p,g.index.getX(fi*3+2));}
    else{ // non indexé : fi = n° triangle
      const t=(fi||0)*3;a.fromBufferAttribute(p,t);b.fromBufferAttribute(p,t+1);c.fromBufferAttribute(p,t+2);
    }
    const e1=new THREE.Vector3().subVectors(b,a),e2=new THREE.Vector3().subVectors(c,a);
    const nl=new THREE.Vector3().crossVectors(e1,e2);
    if(nl.length()<1e-12)return null;nl.normalize();
    // passage monde (normalMatrix)
    const nm=new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
    nl.applyMatrix3(nm).normalize();
    return nl;
  }catch(e){return null;}
}

// Calcule les propriétés géométriques d'une face (centre, normale, aire) pour le suivi d'identité
function getFaceProps(mesh,fi){
  try{
    const g=mesh.geometry;if(!g||!g.attributes.position)return null;
    const p=g.attributes.position,a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
    if(g.index&&fi!==undefined){a.fromBufferAttribute(p,g.index.getX(fi*3));b.fromBufferAttribute(p,g.index.getX(fi*3+1));c.fromBufferAttribute(p,g.index.getX(fi*3+2));}
    else{const t=(fi||0)*3;a.fromBufferAttribute(p,t);b.fromBufferAttribute(p,t+1);c.fromBufferAttribute(p,t+2);}
    const e1=new THREE.Vector3().subVectors(b,a),e2=new THREE.Vector3().subVectors(c,a);
    const nl=new THREE.Vector3().crossVectors(e1,e2);
    const area=nl.length()*0.5;if(area<1e-12)return null;
    nl.normalize();
    const nm=new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
    nl.applyMatrix3(nm).normalize();
    const center=new THREE.Vector3().addVectors(a,b).add(c).multiplyScalar(1/3);
    const centerWorld=center.clone().applyMatrix4(mesh.matrixWorld);
    return{center:centerWorld,normal:nl,area};
  }catch(e){return null;}
}
let skShowRefs=false; // B : violet masqué par défaut — fantôme gris 2D suffit (⧉ projette ce que tu veux)
function skBRepPlanarRefs(shape){
  // Vrais contours sur le plan (lignes + arcs/cercles) — pas de polyligne 12 pts
  try{
    if(!shape||!skEdit||!occHas())return null;
    const {u,v,n,o}=sketchBasis(skEdit);
    const out=[];
    const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
    const ex=new occt.TopExp_Explorer_2(shape, occt.TopAbs_ShapeEnum.TopAbs_EDGE, SH);
    while(ex.More() && out.length<4000){
      const e=occt.TopoDS.Edge_1(ex.Current());
      try{
        const ad=new occt.BRepAdaptor_Curve_2(e);
        const mid=ad.Value((ad.FirstParameter()+ad.LastParameter())/2);
        if(Math.abs((mid.X()-o.x)*n.x+(mid.Y()-o.y)*n.y+(mid.Z()-o.z)*n.z)>0.12){ ex.Next(); continue; }
        const p0=ad.Value(ad.FirstParameter()), p1=ad.Value(ad.LastParameter());
        if(Math.abs((p0.X()-o.x)*n.x+(p0.Y()-o.y)*n.y+(p0.Z()-o.z)*n.z)>0.15 || Math.abs((p1.X()-o.x)*n.x+(p1.Y()-o.y)*n.y+(p1.Z()-o.z)*n.z)>0.15){ ex.Next(); continue; }
        // projette les extrémités
        const ax=(p0.X()-o.x)*u.x+(p0.Y()-o.y)*u.y+(p0.Z()-o.z)*u.z, ay=(p0.X()-o.x)*v.x+(p0.Y()-o.y)*v.y+(p0.Z()-o.z)*v.z;
        const bx=(p1.X()-o.x)*u.x+(p1.Y()-o.y)*u.y+(p1.Z()-o.z)*u.z, by=(p1.X()-o.x)*v.x+(p1.Y()-o.y)*v.y+(p1.Z()-o.z)*v.z;
        // cercle / arc ?
        let isCirc=false, cx=0, cy=0, r=0, a1=0, a2=0;
        try{
          const c=ad.Circle(); r=c.Radius(); if(r>0.5){
            const loc=c.Location();
            cx=(loc.X()-o.x)*u.x+(loc.Y()-o.y)*u.y+(loc.Z()-o.z)*u.z;
            cy=(loc.X()-o.x)*v.x+(loc.Y()-o.y)*v.y+(loc.Z()-o.z)*v.z;
            const dir=c.Axis().Direction();
            if(Math.abs(Math.abs(dir.X()*n.x+dir.Y()*n.y+dir.Z()*n.z)-1)<0.02) isCirc=true;
          }
        }catch(e){}
        if(isCirc){
          // arc vs cercle complet : longueur vs circonférence
          const len=Math.hypot(bx-ax,by-ay);
          const circLen=2*Math.PI*r;
          if(Math.abs(len - circLen) < 1.0){
            out.push({type:'circle', cx, cy, r});
          }else{
            a1=Math.atan2(ay-cy,ax-cx); a2=Math.atan2(by-cy,bx-cx);
            out.push({type:'arc', cx, cy, r, a1, a2});
          }
        }else{
          out.push({x1:ax,y1:ay,x2:bx,y2:by});
        }
      }catch(e){}
      ex.Next();
    }
    try{ex.delete();}catch(e){}
    return out.length?out:null;
  }catch(e){return null;}
}
function findClosestProjectedEdge(sk,x,y,preferMid,wantType){
  // sans tolérance, cherche l'arête projetée la plus proche (antériorité).
  // preferMid : milieu 3D mémorisé à la projection — l'arête source d'origine prime
  // (si le solide bouge, on reste sur LA bonne arête et on rafraîchit le lien).
  // wantType : 'line'|'circle'|'arc' — la nature de l'entité projetée ne change jamais :
  // si le meilleur voisin général est d'un autre type, on prend le meilleur du type voulu.
  let best=null,bd=1e9, srcMid=null;
  let bTy=null,bTyd=1e9,bTySrc=null; // meilleur candidat EXIGÉ par le type de l'entité
  const basis=sketchBasis(sk),u=basis.u,v=basis.v,o=basis.o;
  let candShapes=[],FRk=null;
  try{
    const feats=(doc.features||[]).filter(f=>f.visible!==false);
    const idx=feats.findIndex(f=>f.type==='extrude'&&f.sketchId===sk.id);
    if(idx>=0&&occHas()){
      const FR=occFinalShape(idx);
      // Nettoyage DIFFÉRÉ (finally plus bas) : occCleanup(FR,null) supprime FR.shape —
      // le lire après = use-after-free → occListEdges échoue → projection jamais mise à jour.
      if(FR&&FR.shape){candShapes.push(FR.shape);FRk=FR;}
    } else if(occHas()&&occLive&&occLive.shape) candShapes.push(occLive.shape);
  }catch(e){}
  try{
  for(const sh of candShapes){
    try{
      const edges=occListEdges(sh);
      for(const e of edges){
        const pts2=e.pts.map(p=>[(p[0]-o.x)*u.x+(p[1]-o.y)*u.y+(p[2]-o.z)*u.z, (p[0]-o.x)*v.x+(p[1]-o.y)*v.y+(p[2]-o.z)*v.z]);
        let d=1e9;
        for(let i=0;i<pts2.length-1;i++) d=Math.min(d, (function(ax,ay,bx,by){ const apx=x-ax,apy=y-ay,abx=bx-ax,aby=by-ay; const t=Math.max(0,Math.min(1,(apx*abx+apy*aby)/(abx*abx+aby*aby||1))); const cx=ax+abx*t,cy=ay+aby*t; return Math.hypot(x-cx,y-cy);})(pts2[i][0],pts2[i][1],pts2[i+1][0],pts2[i+1][1]));
        let sc=d;
        // Identité dominante : le milieu mémorisé retrouve LA source même après un gros
        // déplacement (la simple distance au vieux point désignait le mauvais voisin).
        if(preferMid&&e.mid){const dm=Math.hypot(e.mid[0]-preferMid[0],e.mid[1]-preferMid[1],e.mid[2]-preferMid[2]);sc=dm*1000+d;}
        if(sc>bd&&(!wantType||sc>bTyd))continue;
        if(sc<bd||(wantType&&sc<bTyd)){
          // reconstruit pr comme projectEdgeAt mais sans tol
          let isCirc=false,cx=0,cy=0,r=0;
          if(pts2.length>=6){
            const p0=pts2[0],p1=pts2[Math.floor(pts2.length/2)],p2=pts2[pts2.length-1];
            const d2=2*(p0[0]*(p1[1]-p2[1])+p1[0]*(p2[1]-p0[1])+p2[0]*(p0[1]-p1[1]));
            if(Math.abs(d2)>1e-9){
              const sq0=p0[0]*p0[0]+p0[1]*p0[1],sq1=p1[0]*p1[0]+p1[1]*p1[1],sq2=p2[0]*p2[0]+p2[1]*p2[1];
              cx=(sq0*(p1[1]-p2[1])+sq1*(p2[1]-p0[1])+sq2*(p0[1]-p1[1]))/d2;
              cy=(sq0*(p2[0]-p1[0])+sq1*(p0[0]-p2[0])+sq2*(p1[0]-p0[0]))/d2;
              r=Math.hypot(p0[0]-cx,p0[1]-cy);
              if(r>0.5){ let dev=0; for(const p of pts2){const dd=Math.abs(Math.hypot(p[0]-cx,p[1]-cy)-r); if(dd>dev)dev=dd;} if(dev<0.4) isCirc=true; }
            }
          }
          let pr;
          if(isCirc){
            const isFull=Math.hypot(pts2[0][0]-pts2[pts2.length-1][0],pts2[0][1]-pts2[pts2.length-1][1])<0.5;
            if(isFull) pr={type:'circle',cx,cy,r};
            else pr={type:'arc',cx,cy,r,x1:pts2[0][0],y1:pts2[0][1],x2:pts2[pts2.length-1][0],y2:pts2[pts2.length-1][1]};
          } else pr={type:'line',x1:pts2[0][0],y1:pts2[0][1],x2:pts2[pts2.length-1][0],y2:pts2[pts2.length-1][1]};
          if(sc<bd){bd=sc;best=pr;srcMid=e.mid?e.mid.slice():null;}
          if(wantType&&pr.type===wantType&&sc<bTyd){bTyd=sc;bTy=pr;bTySrc=e.mid?e.mid.slice():null;}
        }
      }
    }catch(e){}
  }
  }finally{ if(FRk){try{occCleanup(FRk,null);}catch(e){} } }
  let res=best,resSrc=srcMid;
  if(wantType&&best&&best.type!==wantType&&bTy){res=bTy;resSrc=bTySrc;}
  if(res&&resSrc)res.srcMid=resSrc;
  return res;
}
function updateAssociativeProjections(sk){
  if(!sk||!sk.entities) return false;
  let changed=false;
  for(const e of sk.entities){
    if(!e.construction) continue;
    const isProj=e.proj||e.isProj|| (e.t==='line' && sk.constraints.some(c=>c.type==='fix'&&c.p===e.p1) && sk.constraints.some(c=>c.type==='fix'&&c.p===e.p2));
    if(!isProj) continue;
    if(e.t==='line'){
      const A=sk.points[e.p1], B=sk.points[e.p2]; if(!A||!B) continue;
      const mx=(A.x+B.x)/2, my=(A.y+B.y)/2;
      const pr=findClosestProjectedEdge(sk,mx,my,e.srcMid,'line');
      if(!pr||pr.type!=='line') continue;
      if(pr.srcMid)e.srcMid=pr.srcMid;
      const d1=Math.hypot(A.x-pr.x1,A.y-pr.y1)+Math.hypot(B.x-pr.x2,B.y-pr.y2);
      const d2=Math.hypot(A.x-pr.x2,A.y-pr.y2)+Math.hypot(B.x-pr.x1,B.y-pr.y1);
      if(d1>0.02||d2>0.02){
        if(d2<d1){ A.x=pr.x2; A.y=pr.y2; B.x=pr.x1; B.y=pr.y1; } else { A.x=pr.x1; A.y=pr.y1; B.x=pr.x2; B.y=pr.y2; }
        changed=true;
      }
    } else if(e.t==='circle'){
      const C=sk.points[e.pc]; if(!C) continue;
      const pr=findClosestProjectedEdge(sk,C.x,C.y,e.srcMid,'circle');
      if(!pr||pr.type!=='circle') continue;
      if(pr.srcMid)e.srcMid=pr.srcMid;
      if(Math.hypot(C.x-pr.cx,C.y-pr.cy)>0.02 || Math.abs(e.r-pr.r)>0.02){ C.x=pr.cx; C.y=pr.cy; e.r=pr.r; changed=true; }
    } else if(e.t==='arc'){
      const C=sk.points[e.pc], A=sk.points[e.pa], B=sk.points[e.pb]; if(!C||!A||!B) continue;
      const mx=(A.x+B.x)/2, my=(A.y+B.y)/2;
      const pr=findClosestProjectedEdge(sk,mx,my,e.srcMid,'arc');
      if(!pr||pr.type!=='arc') continue;
      if(pr.srcMid)e.srcMid=pr.srcMid;
      if(Math.hypot(C.x-pr.cx,C.y-pr.cy)>0.02 || Math.hypot(A.x-pr.x1,A.y-pr.y1)>0.02 || Math.hypot(B.x-pr.x2,B.y-pr.y2)>0.02 || Math.abs(e.r-pr.r)>0.02){
        C.x=pr.cx; C.y=pr.cy; A.x=pr.x1; A.y=pr.y1; B.x=pr.x2; B.y=pr.y2; e.r=pr.r; changed=true;
      }
    }
  }
  if(changed) try{solveSketch(sk);}catch(e){}
  return changed;
}
function updateAllProjections(){
  // true = au moins une esquisse a bougé → le solide doit être rejoué (projRefreshRerun).
  let changed=false;
  try{
    (doc.sketches||[]).forEach(sk=>{ if(sk.id===skEdit?.id)return; if(repCloneSkName(sk))return; try{ if(updateAssociativeProjections(sk))changed=true; }catch(e){} });
  }catch(e){}
  return changed;
}
function projectEdgeAt(sk,x,y){
  // Arête 3D la plus proche du clic, projetée dans le plan d'esquisse (antériorité).
  // Retourne {type:'line',x1,y1,x2,y2} ou {type:'circle',cx,cy,r}
  const tol=Math.max(4, 8/Math.max(1,skView.s));
  let best=null,bd=1e9,srcMid=null;
  const basis=sketchBasis(sk),u=basis.u,v=basis.v,n=basis.n,o=basis.o;
  const candShapes=[];let FRk=null;
  // 1) solide antérieur exact si esquisse consommée, sinon solide fini
  try{
    const feats=(doc.features||[]).filter(f=>f.visible!==false);
    const idx=feats.findIndex(f=>f.type==='extrude'&&f.sketchId===sk.id);
    if(idx>=0&&occHas()){
      const FR=occFinalShape(idx);
      // Nettoyage DIFFÉRÉ (try/finally en fin de fonction) : occCleanup(FR,null) supprime
      // FR.shape — le lire après = use-after-free → aucune arête détectée sur esquisse consommée.
      if(FR&&FR.shape){candShapes.push(FR.shape);FRk=FR;}
    }else if(occHas()&&occLive&&occLive.shape) candShapes.push(occLive.shape);
  }catch(e){}
  // 2) BRep exact : teste chaque arête sur le plan
  try{
  for(const sh of candShapes){
    try{
      const edges=occListEdges(sh);
      for(const e of edges){
        const pts2=e.pts.map(p=>[(p[0]-o.x)*u.x+(p[1]-o.y)*u.y+(p[2]-o.z)*u.z, (p[0]-o.x)*v.x+(p[1]-o.y)*v.y+(p[2]-o.z)*v.z]);
        // cercle ? (3 points → centre)
        let isCirc=false,cx=0,cy=0,r=0,arcA1=0,arcA2=0;
        if(pts2.length>=6){
          const p0=pts2[0],p1=pts2[Math.floor(pts2.length/2)],p2=pts2[pts2.length-1];
          const d=2*(p0[0]*(p1[1]-p2[1])+p1[0]*(p2[1]-p0[1])+p2[0]*(p0[1]-p1[1]));
          if(Math.abs(d)>1e-9){
            const sq0=p0[0]*p0[0]+p0[1]*p0[1],sq1=p1[0]*p1[0]+p1[1]*p1[1],sq2=p2[0]*p2[0]+p2[1]*p2[1];
            cx=(sq0*(p1[1]-p2[1])+sq1*(p2[1]-p0[1])+sq2*(p0[1]-p1[1]))/d;
            cy=(sq0*(p2[0]-p1[0])+sq1*(p0[0]-p2[0])+sq2*(p1[0]-p0[0]))/d;
            r=Math.hypot(p0[0]-cx,p0[1]-cy);
            if(r>0.5){
              let dev=0;
              for(const p of pts2){const dd=Math.abs(Math.hypot(p[0]-cx,p[1]-cy)-r); if(dd>dev)dev=dd;}
              if(dev<0.35){ isCirc=true; arcA1=Math.atan2(p0[1]-cy,p0[0]-cx); arcA2=Math.atan2(p2[1]-cy,p2[0]-cx); }
            }
          }
        }
        let d=1e9;
        if(isCirc){
          const span=Math.abs(((arcA2-arcA1)%(Math.PI*2)+Math.PI*2)%(Math.PI*2));
          const isFull = span>6.0 || Math.hypot(pts2[0][0]-pts2[pts2.length-1][0], pts2[0][1]-pts2[pts2.length-1][1])<0.5;
          if(isFull) d=Math.abs(Math.hypot(x-cx,y-cy)-r);
          else {
            let bestA=1e9;
            for(let i=0;i<pts2.length-1;i++) bestA=Math.min(bestA, distSeg2(x,y,pts2[i][0],pts2[i][1],pts2[i+1][0],pts2[i+1][1]));
            d=bestA;
          }
        } else for(let i=0;i<pts2.length-1;i++) d=Math.min(d,distSeg2(x,y,pts2[i][0],pts2[i][1],pts2[i+1][0],pts2[i+1][1]));
        if(d<bd&&d<tol){
          bd=d;
          srcMid=e.mid?e.mid.slice():null;
          if(isCirc){
            const span=Math.abs(((arcA2-arcA1)%(Math.PI*2)+Math.PI*2)%(Math.PI*2));
            const isFull = span>6.0 || Math.hypot(pts2[0][0]-pts2[pts2.length-1][0], pts2[0][1]-pts2[pts2.length-1][1])<0.5;
            if(isFull) best={type:'circle',cx,cy,r};
            else {
              const p0a=pts2[0], p1a=pts2[pts2.length-1];
              best={type:'arc',cx,cy,r, x1:p0a[0],y1:p0a[1],x2:p1a[0],y2:p1a[1]};
            }
          } else best={type:'line',x1:pts2[0][0],y1:pts2[0][1],x2:pts2[pts2.length-1][0],y2:pts2[pts2.length-1][1]};
        }
      }
      if(best){if(srcMid)best.srcMid=srcMid;return best;}
    }catch(e){}
  }
  // 3) repli violet (toujours dispo, même sans BRep)
  if(sk._refs&&sk._refs.length){
    for(const r of sk._refs){
      const d=distSeg2(x,y,r.x1,r.y1,r.x2,r.y2);
      if(d<bd&&d<tol){bd=d; best={type:'line',x1:r.x1,y1:r.y1,x2:r.x2,y2:r.y2};}
    }
  }
  if(best&&srcMid)best.srcMid=srcMid;
  return best;
  }finally{ if(FRk){try{occCleanup(FRk,null);}catch(e){} } }
}
function projNames(pr){
  // Noms persistants d'une projection : « Projetée N » + « Arête M » (arête source 3D
  // mémorisée via srcMid — rebranchée après rejeu par updateAssociativeProjections).
  const srcMid=(pr&&pr.srcMid&&pr.srcMid.length===3)?pr.srcMid.slice():null;
  return {projName:entName('proj'),srcName:srcMid?entName('edge'):null,srcMid};
}
function skRefMeshes(meshes){
  // 1) BRep exact si dispo (même tangents) — sinon 2) maillage
  try{
    if(skEdit&&skEdit.plane==='FACE'&&occHas()&&occLive&&occLive.shape){
      const br=skBRepPlanarRefs(occLive.shape);
      if(br&&br.length) return br;
    }
    // cas partiel (fantôme violet) : la forme partielle est dans meshes[0] si on vient de skBuildRefs
    if(skEdit&&meshes&&meshes.length===1&&meshes[0]&&meshes[0].geometry&&occHas()){
      // tente quand même le BRep du solide antérieur (occLive avant le fantôme)
      const br2=skBRepPlanarRefs(occLive?occLive.shape:null);
      if(br2&&br2.length) return br2;
    }
  }catch(e){}
  // repli maillage : arêtes vives seules (rapide)
  const{u,v,n,o}=sketchBasis(skEdit);
  const out=[];let count=0;
  const A=new THREE.Vector3(),B=new THREE.Vector3(),D=new THREE.Vector3();
  for(const m of meshes){
    const g=m.geometry;if(!g||!g.attributes.position)continue;
    const tris=(g.index?g.index.count:g.attributes.position.count)/3;
    if(tris>200000)continue; // trop lourd : ignoré
    m.updateMatrixWorld(true);
    const eg=new THREE.EdgesGeometry(g,25); // arêtes > 25° : contours + vives, pas les facettes
    const pos=eg.attributes.position;
    for(let i=0;i<pos.count&&count<8000;i+=2){
      A.fromBufferAttribute(pos,i).applyMatrix4(m.matrixWorld);
      B.fromBufferAttribute(pos,i+1).applyMatrix4(m.matrixWorld);
      D.subVectors(A,o);
      const x1=D.dot(u),y1=D.dot(v);
      D.subVectors(B,o);
      out.push({x1,y1,x2:D.dot(u),y2:D.dot(v)});
      count++;
    }
    eg.dispose();
  }
  return out;
}
function skBuildRefs(){
  // Références projetées à la BONNE antériorité (comme Fusion) : l'état du solide juste
  // AVANT la fonction qui consomme cette esquisse — pas la pièce finie.
  // Esquisse jamais consommée : solide fini.
  if(!skEdit){return;}
  skEdit._refs=[];skEdit._ghost=[];skEdit._refNote='';
  const feats=doc.features.filter(f=>f.visible!==false);
  const idx=feats.findIndex(f=>f.type==='extrude'&&f.sketchId===skEdit.id);
  const geomLater=arr=>arr.some(f=>f.type==='extrude'||f.type==='xfillet'||f.type==='fillet');
  if(idx<0){
    try{
      const br=skBRepPlanarRefs(occLive?occLive.shape:null);
      skEdit._refs=(br&&br.length)?br:skRefMeshes(bodies.filter(b=>!b.ghost).map(b=>b.mesh));
      skEdit._ghost=[]; // B : pas de wireframe 2D — on voit la 3D en fondu
    }catch(e){skEdit._refs=[]; skEdit._ghost=[];}
    skEdit._refNote='référence : solide fini (esquisse non consommée)';
    // B : 3D en fondu léger dans le plan (pas de traits)
    try{
      if(skAnteriorGhost){ try{scene.remove(skAnteriorGhost); skAnteriorGhost.geometry.dispose();}catch(e){} skAnteriorGhost=null; }
      bodies.forEach(b=>{ if(b._savedOpacity!=null&&b.mesh&&b.mesh.material){ b.mesh.material.opacity=b._savedOpacity; b.mesh.material.transparent=b._savedTransparent; delete b._savedOpacity; delete b._savedTransparent; }});
      bodies.forEach(b=>{
        if(!b.ghost&&b.mesh&&b.mesh.visible&&b.mesh.material){
          b._savedOpacity=b.mesh.material.opacity; b._savedTransparent=b.mesh.material.transparent;
          b.mesh.material.transparent=true; b.mesh.material.opacity=0.75; // pièce bien visible (couleur conservée), derrière la grille
        }
      });
      skEdit._ghost=[];
    }catch(e){}
    return;
  }
  if(!(geomLater(feats.slice(idx+1))&&occHas())){
    try{
      const br=skBRepPlanarRefs(occLive?occLive.shape:null);
      skEdit._refs=(br&&br.length)?br:skRefMeshes(bodies.filter(b=>!b.ghost).map(b=>b.mesh));
      skEdit._ghost=[];
      bodies.forEach(b=>{ if(b._savedOpacity!=null&&b.mesh&&b.mesh.material){ b.mesh.material.opacity=b._savedOpacity; b.mesh.material.transparent=b._savedTransparent; delete b._savedOpacity; delete b._savedTransparent; }});
      bodies.forEach(b=>{
        if(!b.ghost&&b.mesh&&b.mesh.visible&&b.mesh.material){
          b._savedOpacity=b.mesh.material.opacity; b._savedTransparent=b.mesh.material.transparent;
          b.mesh.material.transparent=true; b.mesh.material.opacity=0.75; // pièce bien visible (couleur conservée), derrière la grille
        }
      });
    }catch(e){skEdit._refs=[]; skEdit._ghost=[];}
    return; // 3D en fondu dans le plan, pas de wireframe
  }
  // Rejeu partiel exact jusqu'à la fonction consommatrice (exclue).
  skEdit._refNote=`référence : état avant « ${feats[idx].name} »`;
  // fantôme 3D antérieur : on masque le solide fini et on affiche l'état avant
  if(skAnteriorGhost){ try{scene.remove(skAnteriorGhost); skAnteriorGhost.geometry.dispose();}catch(e){} skAnteriorGhost=null; }
  bodies.forEach(b=>{
    if(b._savedOpacity!=null&&b.mesh&&b.mesh.material){ b.mesh.material.opacity=b._savedOpacity; b.mesh.material.transparent=b._savedTransparent; delete b._savedOpacity; delete b._savedTransparent; }
    if(!b.ghost) b.mesh.visible=false;
  });
  try{
    const FR=occFinalShape(idx);
    try{
      if(FR.shape){
        const br=skBRepPlanarRefs(FR.shape);
        if(br&&br.length) skEdit._refs=br;
        else {
          const g=occTessellate(FR.shape,0.5);
          const m=new THREE.Mesh(g);m.updateMatrixWorld(true);
          const pre=[m];
          feats.slice(0,idx).forEach(f=>{if(f.type==='import'&&f._mesh)pre.push(f._mesh);});
          skEdit._refs=skRefMeshes(pre);
          try{g.dispose();}catch(e){}
        }
        skEdit._ghost=[]; // pas de wireframe, 3D en fondu
        try{
        const g=occTessellate(FR.shape,0.5);
        const bcol=((bodies.find(b=>!b.ghost&&b.color)||{}).color)||0xccccd6;
        const mat=new THREE.MeshStandardMaterial({color:bcol,transparent:true,opacity:0.75,depthTest:true}); // couleur de la pièce, pas de gris fantôme
          skAnteriorGhost=new THREE.Mesh(g,mat); skAnteriorGhost.name='skAnteriorGhost'; scene.add(skAnteriorGhost);
        }catch(e){}
      }else {skEdit._refs=[]; skEdit._ghost=[];}
    }finally{occCleanup(FR,null);}
  }catch(e){
    try{skEdit._refs=skRefMeshes(bodies.filter(b=>!b.ghost).map(b=>b.mesh));}catch(e2){skEdit._refs=[];}
    skEdit._ghost=[];
    skEdit._refNote='référence : solide fini (rejeu partiel impossible)';
    bodies.forEach(b=>{ if(!b.ghost) b.mesh.visible=true; if(b._savedOpacity!=null&&b.mesh&&b.mesh.material){ b.mesh.material.opacity=b._savedOpacity; b.mesh.material.transparent=b._savedTransparent; delete b._savedOpacity; delete b._savedTransparent; }});
  }
}
function openSketch(id){
  skEdit=doc.sketches.find(s=>s.id===id);if(!skEdit)return;
  migrateSketch(skEdit);
  skBuildRefs();
  skTool='select';skChain=null;skArcC=null;skArcA1=null;skArcPa=null;skPendPt=null;skCoinA=null;skDraft=null;skDown=null;skDrag=null;skDragPushed=false;skDimDrag=null;skSel=null;skSelX=[];skMsg='';skDimLine=null;skDimRef=null;skBox=null;skDragEnt=null;skDyn=null;skInfer=null;skPan=null;skSnapMk=null;skDimPlace=null;skProjectHover=null;
  skUndoStack=[];skRedoStack=[];
  document.querySelectorAll('#skToolbar .tool').forEach(x=>x.classList.toggle('on',x.dataset.tool==='select'));
  $('skTitle').textContent='Esquisse — '+skEdit.name+' (plan '+sketchFaceLabel(skEdit)+')';
  $('sketchOverlay').classList.add('open');exitFilletMode(true);skRefreshHealth();skFitView();sketchAlignCamera();renderSkPanel();skUndoBtn();
  try{$('skStatWrap').style.display='block';}catch(e){}
}
function closeSketch(save){
  $('sketchOverlay').classList.remove('open');
  try{$('skStatWrap').style.display='none';}catch(e){}
  sketchRestoreCamera();
  if(skAnteriorGhost){ try{scene.remove(skAnteriorGhost); skAnteriorGhost.geometry.dispose();}catch(e){} skAnteriorGhost=null; }
  bodies.forEach(b=>{
    if(!b.ghost) b.mesh.visible=true;
    if(b._savedOpacity!=null&&b.mesh&&b.mesh.material){ b.mesh.material.opacity=b._savedOpacity; b.mesh.material.transparent=b._savedTransparent; delete b._savedOpacity; delete b._savedTransparent; }
  });
  if(save&&skEdit){solveSketch(skEdit);cleanupSk(skEdit);repSyncForSketch(skEdit.id);markDirty();rebuild();projRefreshRerun(0);sel={kind:'sketch',id:skEdit.id};renderTree();renderProps();}
  skEdit=null;skSel=null;skSelX=[];skChain=null;skArcC=null;skArcPa=null;skDraft=null;skDown=null;skDrag=null;skDimDrag=null;skDimLine=null;skDimRef=null;skBox=null;skDragEnt=null;skDyn=null;skInfer=null;skPan=null;skSnapMk=null;skDimPlace=null;skProjectHover=null;
}
const svg=$('skSvg');
const NS='http://www.w3.org/2000/svg';
function svgSize(){return{ W:svg.clientWidth||800,H:svg.clientHeight||500};}
function w2s(x,y){const{W,H}=svgSize();const s=skView.s;return[(W/2+(x-skView.cx)*s),(H/2-(y-skView.cy)*s)];}
function s2w(px,py){const{W,H}=svgSize();const s=skView.s;return[(skView.cx+(px-W/2)/s),(skView.cy-(py-H/2)/s)];}
let skView={s:2.2,cx:0,cy:0}; // vue 2D : échelle px/mm + centre monde (molette = zoom, clic-molette = pan)
function skUpdateTols(){SK_SNAP=10/skView.s;SK_PICK=8/skView.s;SK_INF=6/skView.s;}
function skSnapStep(){const stps=[0.1,0.2,0.5,1,2,5,10,20,50,100,200,500,1000];for(const st of stps){if(st*skView.s>=8)return st;}return 1000;}
function skSnapVal(v){const st=skSnapStep();return Math.round(v/st)*st;}
function skSetZoom(ns,fx,fy){
  const W=svgSize().W,H=svgSize().H,s0=skView.s;
  const s1=Math.max(0.15,Math.min(80,ns));if(s1===s0)return;
  const[wbx,wby]=s2w(fx,fy);skView.s=s1;
  skView.cx=wbx-(fx-W/2)/s1;skView.cy=wby+(fy-H/2)/s1; // le point sous le curseur reste sous le curseur
  skUpdateTols();if(skEdit)drawSketch2D();
}
function skFitView(){
  const P=skEdit?skEdit.points:null,ids=P?Object.keys(P).filter(pid=>pid!==SK_ORIGIN):[]; // l'origine n'entre pas dans le cadrage
  if(!ids.length){
    const refs=skEdit&&skEdit._refs;
    if(refs&&refs.length){ // esquisse vide : cadrer sur la pièce projetée
      let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
      refs.forEach(r=>{if(r.x1<x0)x0=r.x1;if(r.x1>x1)x1=r.x1;if(r.x2<x0)x0=r.x2;if(r.x2>x1)x1=r.x2;
        if(r.y1<y0)y0=r.y1;if(r.y1>y1)y1=r.y1;if(r.y2<y0)y0=r.y2;if(r.y2>y1)y1=r.y2;});
      const{W,H}=svgSize(),bw=Math.max(x1-x0,1),bh=Math.max(y1-y0,1);
      skView.s=Math.max(0.15,Math.min(30,Math.min(W/bw,H/bh)*0.7));
      skView.cx=(x0+x1)/2;skView.cy=(y0+y1)/2;
      skUpdateTols();if(skEdit)drawSketch2D();return;
    }
    skView={s:2.2,cx:0,cy:0};skUpdateTols();if(skEdit)drawSketch2D();return;}
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  ids.forEach(pid=>{const p=P[pid];if(p.x<x0)x0=p.x;if(p.x>x1)x1=p.x;if(p.y<y0)y0=p.y;if(p.y>y1)y1=p.y;});
  const{W,H}=svgSize(),bw=Math.max(x1-x0,1),bh=Math.max(y1-y0,1);
  skView.s=Math.max(0.15,Math.min(30,Math.min(W/bw,H/bh)*0.7));
  skView.cx=(x0+x1)/2;skView.cy=(y0+y1)/2;
  skUpdateTols();if(skEdit)drawSketch2D();
}
function evXY(e){const r=svg.getBoundingClientRect();return s2w(e.clientX-r.left,e.clientY-r.top);}
let SK_SNAP=5, SK_INF=2.5, SK_PICK=4;
skUpdateTols();
let skTool='select',skDraft=null,skMsg='';
let skDown=null,skChain=null,skInfer=null,skSnapMk=null,skSel=null,skSelX=[],skDrag=null,skDragMoved=false,skDragPushed=false,skDimDrag=null,skPan=null;
let skBox=null,skDragEnt=null,skDyn=null; // sélection rect · déplacement d'entité · saisie dynamique (longueur/angle)
let skDimPlace=null; // placement de cote : {id} → la cote suit le curseur jusqu'au clic
let skPendPt=null,skCoinA=null,skCornA=null,skArcC=null,skArcA1=null,skArcPa=null;
let skProjectHover=null; // ⧉ : arête projetable sous le curseur (preview orange)

/* ----- modèle points partagés (coïncidence structurelle) ----- */
function skPts(sk){return sk.points||(sk.points={});}
const SK_ORIGIN='O'; // point d'origine permanent (0,0) — toujours fixe, jamais supprimé ni GC
function ensureOrigin(sk){if(!sk)return;const P=skPts(sk);if(!P[SK_ORIGIN])P[SK_ORIGIN]={x:0,y:0};}
function skNewPid(sk){sk.seq=sk.seq||1;return 'p'+(sk.seq++);}
function skNewEid(sk){sk.seq=sk.seq||1;return 'e'+(sk.seq++);}
function addPoint(sk,x,y){const id=skNewPid(sk);skPts(sk)[id]={x,y};return id;}
function pidAt(sk,x,y){let best=null,bd=0.01;Object.keys(skPts(sk)).forEach(pid=>{const p=sk.points[pid];const d=Math.hypot(p.x-x,p.y-y);if(d<bd){bd=d;best=pid;}});return best||addPoint(sk,x,y);}
function entById(sk,id){return (sk.entities||[]).find(e=>e.id===id);}
function migrateSketch(sk){
  if(!sk.points)sk.points={};if(!sk.constraints)sk.constraints=[];if(!sk.dims)sk.dims=[];if(!sk.seq)sk.seq=1;
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
  const keep=new Set([skChain,skArcC,skCoinA,skPendPt,skDrag,skDown&&skDown.pid,SK_ORIGIN].filter(Boolean));
  const ref=new Set();
  (sk.entities||[]).forEach(e=>{['p1','p2','p','pc','pa','pb'].forEach(k=>{if(e[k])ref.add(e[k]);});});
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
    if(c.p&&!sk.points[c.p])return false;
    if(c.type==='coincident')return(!c.a||!!sk.points[c.a])&&(!c.b||!!sk.points[c.b]); // a/b = POINTS
    if(c.type==='symmetric')return(!!eids.has(c.a)&&!!eids.has(c.b)&&!!eids.has(c.mid));
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
function hasHV(sk,lineId,t){return (sk.constraints||[]).some(c=>c.type===t&&c.line===lineId);}
function skHasPerp(sk,aId,bId){return (sk.constraints||[]).some(c=>c.type==='perpendicular'&&((c.a===aId&&c.b===bId)||(c.a===bId&&c.b===aId)));}
function skHasParallel(sk,aId,bId){return (sk.constraints||[]).some(c=>c.type==='parallel'&&((c.a===aId&&c.b===bId)||(c.a===bId&&c.b===aId)));}
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
    case 'parallel': case 'perpendicular': case 'equal': return c.type+'@'+pair(c.a,c.b);
    case 'symmetric': return 'symmetric@'+pair(c.a,c.b)+'|'+c.mid;
    case 'coaxial': return 'coaxial@'+pair(c.a,c.b);
    case 'coincident': return 'coincident@'+pair(c.a,c.b);
    case 'midpoint': return c.p!=null?('midpoint@'+c.p+'|'+c.line):('midpoint@@'+pair(c.a,c.b));
    case 'online': return 'online@'+c.p+'|'+c.line;
    case 'oncircle': return 'oncircle@'+c.p+'|'+c.ent;
    default: return c.type+'@'+(c.id||'');
  }
}
function skDedupConstraints(sk){
  // Purge les doublons exacts + les ⟂ implicites par ─/│ (même règle qu'à la
  // création). Appelée par cleanupSk : toute édition ré-équilibre la liste.
  const seen=new Set(),out=[];
  (sk.constraints||[]).forEach(c=>{
    if(c.type==='perpendicular'&&skPerpImplied(sk,c.a,c.b))return;
    const k=skConKey(c);
    if(seen.has(k))return;
    seen.add(k);out.push(c);
  });
  return out;
}

/* ----- solveur par relaxation (contraintes + cotes pilotantes) ----- */
function skFixed(sk){
  const f=new Set();
  (sk.constraints||[]).forEach(c=>{
    if(c.type==='fix'&&c.p)f.add(c.p);
    if(c.type==='fix'&&c.ent){const e=entById(sk,c.ent);if(e&&(e.t==='circle'||e.t==='arc'||e.t==='cpoint')&&(e.pc||e.p))f.add(e.pc||e.p);}
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
        let err=Math.max(d.value,0)-Math.abs(signed);if(Math.abs(err)<1e-9)return;
        err*=0.5;
        const sgn=signed>=0?1:-1;
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
        const sgn=signed>=0?1:-1;
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
        if(aF&&!bF)B.y=A.y;else if(bF&&!aF)A.y=B.y;else{const m=(A.y+B.y)/2;A.y=m;B.y=m;}}
      if(c.type==='v'){const l=entById(sk,c.line);if(!l||l.t!=='line')return;const A=P[l.p1],B=P[l.p2];if(!A||!B)return;
        const aF=fix.has(l.p1),bF=fix.has(l.p2);
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
        const sgn=dist>=0?1:-1,Er=Math.abs(dist)-E.r,s=sgn*Er*0.5;
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
  return{pts,rad,r0,n:2*pts.length+rad.length};
}
function sklsApply(sk,B,x){
  B.pts.forEach((pid,i)=>{const p=sk.points[pid];if(p){p.x=x[2*i];p.y=x[2*i+1];}});
  B.rad.forEach((eid,j)=>{const e=entById(sk,eid);if(e)e.r=Math.max(x[2*B.pts.length+j],0.01);});
}
function sklsCollect(sk,out,B){
  // résidu vectoriel complet : cotes + contraintes + structure des arcs + ancrage des rayons libres.
  const P=sk.points;
  out.length=0;
  const push=f=>{if(f!=null&&isFinite(f))out.push(f);};
  const fix=skFixed(sk);
  const nrm=(l)=>{const A=P[l.p1],B=P[l.p2];if(!A||!B)return 0;return Math.hypot(B.x-A.x,B.y-A.y);};
  const vec=(l)=>{const A=P[l.p1],B=P[l.p2];if(!A||!B)return null;const L=Math.hypot(B.x-A.x,B.y-A.y)||1e-9;return{ux:(B.x-A.x)/L,uy:(B.y-A.y)/L,L};};
  // ── cotes ──
  (sk.dims||[]).forEach(d=>{
    if(d.type==='length'){const l=entById(sk,d.line);if(l&&l.t==='line'){
      if(d.orient==='h'||d.orient==='v'){const A=P[l.p1],B=P[l.p2];if(A&&B)push(dimMeasureOf(A,B,d.orient)-Math.max(d.value,0));}
      else push(nrm(l)-Math.max(d.value,0.1));}}
    if(d.type==='distance'){const A=P[d.a],B=P[d.b];if(A&&B)push(dimMeasureOf(A,B,d.orient)-Math.max(d.value,0));}
    if(d.type==='diameter'||d.type==='radius'){const e=entById(sk,d.ent);if(e&&(e.t==='circle'||e.t==='arc'))push(e.r-(d.type==='diameter'?d.value/2:d.value));}
    if(d.type==='angle'){
      const fr=angleFrame(sk,d);if(fr){
        const TAU=Math.PI*2,want=angleWant(d,fr.delta);
        let e=want-fr.delta;if(e>Math.PI)e-=TAU;else if(e<-Math.PI)e+=TAU;push(e);
      }
    }
    if(d.type==='gap'){
      const A=entById(sk,d.a),B=entById(sk,d.b);
      if(A&&B&&A.t==='line'&&B.t==='line'){
        const va=vec(A),vb=vec(B);if(va&&vb){const nx=-va.uy,ny=va.ux;
          const sA=P[A.p1],fB=P[B.p1];
          if(sA&&fB){const signed=(fB.x-sA.x)*nx+(fB.y-sA.y)*ny;
            const w=Math.max(d.value,0);push(w>0?(signed*signed-w*w)/(2*w):signed);}}
      }
    }
    if(d.type==='distline'){
      const l=entById(sk,d.line),Pt=P[d.p];
      if(l&&l.t==='line'&&Pt){const v=vec(l);if(v){const nx=-v.uy,ny=v.ux,A=P[l.p1];
        if(A){const signed=(Pt.x-A.x)*nx+(Pt.y-A.y)*ny;const w=Math.max(d.value,0);
          push(w>0?(signed*signed-w*w)/(2*w):signed);}}}
    }
  });
  // ── contraintes ──
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
    if(c.type==='equal'){
      const A=entById(sk,c.a),B=entById(sk,c.b);
      if(A&&B){if(A.t==='line'&&B.t==='line')push(nrm(A)-nrm(B));
        else if((A.t==='circle'||A.t==='arc')&&(B.t==='circle'||B.t==='arc'))push(A.r-B.r);}
    }
    if(c.type==='tangent'){
      const L=entById(sk,c.line),E=entById(sk,c.ent);
      if(L&&E&&L.t==='line'&&(E.t==='circle'||E.t==='arc')){
        const A=P[L.p1],B=P[L.p2],CC=P[E.pc];if(A&&B&&CC){
          const dx=B.x-A.x,dy=B.y-A.y,len=Math.hypot(dx,dy)||1e-9;
          const ux=dx/len,uy=dy/len;
          const d=(CC.x-A.x)*(-uy)+(CC.y-A.y)*(ux);
          // tangence lisse à la DROITE (condition de contact), linéarisée en mm :
          push((d*d-E.r*E.r)/Math.max(1e-6,Math.abs(d)+Math.abs(E.r)));
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
          const d1=Math.hypot(rA1.x-B1.x,rA1.y-B1.y)+Math.hypot(rA2.x-B2.x,rA2.y-B2.y);
          const d2=Math.hypot(rA1.x-B2.x,rA1.y-B2.y)+Math.hypot(rA2.x-B1.x,rA2.y-B1.y);
          if(d2<d1){push(rA1.x-B2.x);push(rA1.y-B2.y);push(rA2.x-B1.x);push(rA2.y-B1.y);}
          else{push(rA1.x-B1.x);push(rA1.y-B1.y);push(rA2.x-B2.x);push(rA2.y-B2.y);}
        }
      }
    }
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
  // ── ancrage doux : les rayons libres ne dérivent que si une vraie contrainte les tire (equal, tangent2) ──
  if(B&&B.rad){
    (B.rad||[]).forEach(eid=>{const e=entById(sk,eid);if(e&&B.r0&&B.r0[eid]!=null)push((e.r-B.r0[eid])*1.0);});
  }
  return out;
}
function sklsSolveLM(sk,B,x,iters){
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
  let lam=1e-3;
  for(let it=0;it<iters;it++){
    collect(f);
    const m=f.length;
    if(!m)return true;
    const J=new Float64Array(m*n);
    let nR=0;
    for(let j=0;j<n;j++){
      const xj=x[j],h=Math.max(1e-7,Math.abs(xj)*1e-6);
      x[j]=xj+h;apply();sklsCollect(sk,fph,B);const fp=[];for(let r=0;r<fph.length;r++)fp[r]=fph[r];
      x[j]=xj-h;apply();sklsCollect(sk,fmi,B);const fm=[];for(let r=0;r<fmi.length;r++)fm[r]=fmi[r];
      x[j]=xj;apply();
      nR=fp.length;
      for(let r=0;r<nR&&r<m;r++)J[r*n+j]=(fp[r]-fm[r])/(2*h);
    }
    if(nR!==m){break;} // structure instable : on garde le meilleur état atteint
    // g=JᵀF ; H≈JᵀJ
    const g=new Float64Array(n),H=new Float64Array(n*n);
    for(let i=0;i<n;i++){let s=0;for(let r=0;r<m;r++)s+=J[r*n+i]*f[r];g[i]=s;}
    for(let i=0;i<n;i++)for(let j=0;j<=i;j++){
      let s=0;for(let r=0;r<m;r++)s+=J[r*n+i]*J[r*n+j];
      H[i*n+j]=s;if(j<i)H[j*n+i]=s;
    }
    const A=new Float64Array(n*n);
    for(let i=0;i<n;i++)for(let j=0;j<n;j++)A[i*n+j]=H[i*n+j];
    for(let i=0;i<n;i++)A[i*n+i]+=lam*(Math.abs(H[i*n+i])+1e-6);
    const dg=new Float64Array(n);for(let i=0;i<n;i++)dg[i]=-g[i];
    if(!cholSolve(A,dg,n)){lam*=10;if(lam>1e12){restoreBest();break;}continue;}
    const xsv=new Float64Array(n);for(let i=0;i<n;i++)xsv[i]=x[i];
    for(let i=0;i<n;i++)x[i]+=dg[i];apply();
    const e2=saveBest();
    if(isFinite(e2)&&e2<=cur){
      const imp=cur-e2;
      cur=e2;
      lam=Math.max(lam*0.3,1e-8);
      if(imp<1e-10*Math.max(1e-12,cur)||cur<1e-14)break;
    }else{
      for(let i=0;i<n;i++)x[i]=xsv[i];apply();
      // refus : si l'écart n'est que du bruit (point déjà stationnaire) → convergence
      if(isFinite(e2)&&e2-cur<1e-10*Math.max(1e-12,cur))break;
      lam*=10;
      if(lam>1e12){restoreBest();break;}
    }
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
  const r0=skAudit(sk).residual||0;
  let best={r:r0,snap:snap0};
  skTangentExtend(sk,anchor);let rE=skAudit(sk).residual||0;
  if(rE<best.r-1e-9)best={r:rE,snap:skSnapCoords(sk)};
  skRestoreCoords(sk,snap0);
  skTangentSlide(sk,anchor);let rS=skAudit(sk).residual||0;
  if(rS<best.r-1e-9)best={r:rS,snap:skSnapCoords(sk)};
  skRestoreCoords(sk,snap0);
  skTangentExtend(sk,anchor);skTangentSlide(sk,anchor);
  const rES=skAudit(sk).residual||0;
  if(rES<best.r-1e-9)best={r:rES,snap:skSnapCoords(sk)};
  skRestoreCoords(sk,best.snap);
}
/* solveur principal : essaie le moindres carrés (LM) ET la relaxation, puis garde le meilleur
   des deux (mesuré par le résidu d'audit maximal). C'est le LM qui relève les systèmes
   bien posés ; la relaxation conserve les cas qu'elle résolvait déjà (sous/pluridéterminés). */
function solveSketch(sk,iters,anchor){
  if(!sk||!sk.points)return;iters=iters||120;
  const base=skSnapCoords(sk); // état de départ (avant tout essai)
  let lsSnap=null; // coordonnées atteintes par le LM
  let lsRes=Infinity;
  try{
    const fix=skFixed(sk);(anchor||[]).forEach(p=>fix.add(p));
    (sk.dims||[]).forEach(d=>{if(d.type==='diameter'||d.type==='radius'){const e=entById(sk,d.ent);if(e&&(e.t==='circle'||e.t==='arc'))e.r=Math.max(d.type==='diameter'?d.value/2:d.value,0.1);}});
    const B=sklsBuild(sk,fix);
    if(B.n>0&&B.n<=300){
      const x=new Float64Array(B.n);
      B.pts.forEach((pid,i)=>{const p=sk.points[pid];x[2*i]=p.x;x[2*i+1]=p.y;});
      B.rad.forEach((eid,j)=>{const e=entById(sk,eid);x[2*B.pts.length+j]=e?e.r:1;});
      sklsSolveLM(sk,B,x,iters);
      skSolveFinal(sk,anchor);
      try{const r=skAudit(sk).residual||0;if(isFinite(r)){lsSnap=skSnapCoords(sk);lsRes=r;}}catch(e){}
    }
  }catch(e){ /* LM en échec complet → compté comme résidu infini */ }
  // relaxation depuis l'état INITIAL
  skRestoreCoords(sk,base);
  solveSketchRelax(sk,iters,anchor);
  let relRes=Infinity;try{relRes=skAudit(sk).residual||0;}catch(e){relRes=Infinity;}
  // garder le meilleur des deux états
  if(isFinite(lsRes)&&isFinite(relRes)&&lsRes<relRes-1e-7&&lsSnap){
    skRestoreCoords(sk,lsSnap);
    skSolveFinal(sk,anchor);
  }else{
    skSolveFinal(sk,anchor); // sur l'état relaxation
  }
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
  return false;
}

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
    if(c.type==='parallel'||c.type==='perpendicular'||c.type==='symmetric')return c.a===id||c.b===id;
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
      }else if(c.type==='parallel'||c.type==='perpendicular'||c.type==='symmetric'){
        const a=(c.a===oldId)?nid:c.a,b=(c.b===oldId)?nid:c.b;
        if(a!==b&&!(sk.constraints||[]).some(x=>x.type===c.type&&((x.a===a&&x.b===b)||(c.type!=='parallel'&&x.a===b&&x.b===a))))
          sk.constraints.push({id:skNewEid(sk),type:c.type,a,b});
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
  sk.entities.forEach(e=>{['p1','p2','p','pc','pa','pb'].forEach(k=>{if(e[k]===fromPid)e[k]=toPid;});});
  (sk.dims||[]).forEach(d=>{if(d.a===fromPid)d.a=toPid;if(d.b===fromPid)d.b=toPid;if(d.p===fromPid)d.p=toPid;});
  (sk.constraints||[]).forEach(c=>{if(c.p===fromPid)c.p=toPid;if(c.a===fromPid&&c.type==='coincident')c.a=toPid;if(c.b===fromPid&&c.type==='coincident')c.b=toPid;});
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
    if(L<0.5){skStatus('Déplacez le curseur pour définir la longueur, puis tapez l’angle.');return;}
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
  const ls=skSelectedEnts().filter(e=>e.t==='line');
  if(ls.length!==2){skStatus('Congé : sélectionnez exactement 2 lignes.');return;}
  skPushUndo();
  const r=skFilletCorner(sk,ls[0].id,ls[1].id,skFilletR);
  if(!r.ok){skUndoStack.pop();skUndoBtn();skStatus(r.msg);drawSketch2D();return;}
  afterEdit();skStatus(r.msg+' — R modifiable (double-clic la cote).');
}
function skApplyChamferSel(){
  // Depuis le menu contextuel : 2 lignes sélectionnées → chanfrein au retrait courant.
  if(!skEdit)return;const sk=skEdit;
  const ls=skSelectedEnts().filter(e=>e.t==='line');
  if(ls.length!==2){skStatus('Chanfrein : sélectionnez exactement 2 lignes.');return;}
  skPushUndo();
  const r=skChamferCorner(sk,ls[0].id,ls[1].id,skChamferD);
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
  while(true){
    const start=cand.find(e=>!used.has(e.id));
    if(!start)break;
    const deg=p=>cand.filter(e=>!used.has(e.id)&&ends(e).includes(p)).length;
    const[ss1,ss2]=ends(start);
    let entry=deg(ss1)<=1?ss1:ss2;
    const order=[{e:start,fwd:ends(start)[0]===entry}];
    used.add(start.id);
    let exit=ends(start)[order[0].fwd?1:0],closed=false;
    while(true){
      const nx=cand.find(e=>!used.has(e.id)&&ends(e).includes(exit));
      if(!nx)break;
      const fwd=ends(nx)[0]===exit;
      order.push({e:nx,fwd});used.add(nx.id);
      exit=ends(nx)[fwd?1:0];
      if(exit===entry){closed=true;break;}
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
  if(!(D>=0.5))return{ok:false,msg:'Décalage : distance ≥ 0,5 mm requise.'};
  const P=sk.points;
  const ents=ids.map(id=>entById(sk,id)).filter(e=>e&&(e.t==='line'||e.t==='circle'||e.t==='arc')&&!e.ref);
  if(!ents.length)return{ok:false,msg:'Décalage : sélectionnez lignes, cercles ou arcs.'};
  const chains=skOffsetChains(sk,ents.map(e=>e.id));
  const solo=ents.filter(e=>e.t==='circle');
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
    const joints=ch.order.map((o,i)=>{const nx=ch.order[(i+1)%n];if(i===n-1&&!ch.closed)return null;
      const a=new Set(skEdgeEnds(o.e,o.fwd)),b=new Set(skEdgeEnds(nx.e,nx.fwd));
      for(const p of a)if(b.has(p))return p;return null;});
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
      const nx=(i+1)%n,C0=P[joints[i]];
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
        const hit=near(lineCircleInt(a.P,a.D,ci.C,ci.r),C0||{x:0,y:0});
        M=hit;
      }else{
        const hit=near(circleCircleInt(oi.C,oi.r,oj.C,oj.r),C0||{x:0,y:0});
        M=hit;
      }
      if(!M){jointsBad++;newEnds[i]={solo:true};continue;}
      const pid=addPoint(sk,M.x,M.y);
      newEnds[i]={pid};
    }
    for(let i=0;i<n;i++){
      const o=order[i],off=offs[i];
      const prevJ=ch.closed?newEnds[(i-1+n)%n]:(i===0?null:newEnds[i-1]);
      const nextJ=ch.closed?newEnds[i]:(i===n-1?null:newEnds[i]);
      const endFor=(side,endOff)=>{
        const J=side==='prev'?prevJ:nextJ;
        if(J&&J.pid)return J.pid;
        return addPoint(sk,endOff.x,endOff.y);
      };
      if(o.e.t==='line'){
        const p1=endFor('prev',off.A),p2=endFor('next',off.B);
        const nid=skNewEid(sk);
        const cp={id:nid,t:'line',p1,p2};if(o.e.construction)cp.construction=true;
        sk.entities.push(cp);
        if(!skHasParallel(sk,o.e.id,nid))sk.constraints.push({id:skNewEid(sk),type:'parallel',a:o.e.id,b:nid});
        sk.dims.push({id:skNewEid(sk),type:'gap',a:o.e.id,b:nid,value:+D.toFixed(3),ox:0,oy:0});
        copies.push(nid);
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
        const cp={id:nid,t:'arc',pc:o.e.pc,pa:pA,pb:pB,r:off.r};if(o.e.construction)cp.construction=true;
        sk.entities.push(cp);
        sk.dims.push({id:skNewEid(sk),type:'radius',ent:nid,value:+off.r.toFixed(3),ox:0,oy:0});
        copies.push(nid);
      }
    }
    doneChains++;
  }
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
    if(e.t==='arc'){const C=P[e.pc];if(C){const an=arcAngles(sk,e);const dR=Math.abs(Math.hypot(x-C.x,y-C.y)-e.r);d=(an&&dR<maxD+2&&angInArc(Math.atan2(y-C.y,x-C.x),an.a1,an.a2))?dR:1e9;}}
    if(e.t==='cpoint'){const Q=P[e.p];if(Q)d=Math.hypot(x-Q.x,y-Q.y);}
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

/* ----- dessin SVG ----- */
function skEl(n,attrs,parent){
  const el=document.createElementNS(NS,n);
  for(const k in attrs)el.setAttribute(k,attrs[k]);
  (parent||svg).appendChild(el);return el;
}
function drawSketch2D(){
  if(!skEdit)return;const sk=skEdit;
  const{W,H}=svgSize();svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.innerHTML='';
  const[gvx0,gvY1]=s2w(0,0),[gvx1,gvY0]=s2w(W,H); // grille adaptative à l'échelle
  let gstep=10;const gsteps=[0.5,1,2,5,10,20,50,100,200,500,1000,2000];
  for(const st of gsteps){if(st*skView.s>=16){gstep=st;break;}}
  const kx0=Math.floor(gvx0/gstep),kx1=Math.ceil(gvx1/gstep),ky0=Math.floor(gvY0/gstep),ky1=Math.ceil(gvY1/gstep);
  if(kx1-kx0<600)for(let k=kx0;k<=kx1;k++){const gx=k*gstep,isAx=Math.abs(gx)<1e-9;
    const[x1,y1]=w2s(gx,gvY0-gstep),[x2,y2]=w2s(gx,gvY1+gstep);
    skEl('line',{x1,y1,x2,y2,stroke:isAx?'#0a84ff':'#2a2a2e','stroke-width':isAx?1.5:1});}
  if(ky1-ky0<600)for(let k=ky0;k<=ky1;k++){const gy=k*gstep,isAx=Math.abs(gy)<1e-9;
    const[x1,y1]=w2s(gvx0-gstep,gy),[x2,y2]=w2s(gvx1+gstep,gy);
    skEl('line',{x1,y1,x2,y2,stroke:isAx?'#0a84ff':'#2a2a2e','stroke-width':isAx?1.5:1});}
  // Fantôme 2D orthographique (pièce derrière, sans perspective) — bouge avec le zoom/pan comme Fusion
  // B : violet supprimé, fantôme seul et plus contrasté pour bien voir la pièce
  if((sk._ghost||[]).length){
    for(const r of sk._ghost){
      if(r.type==='circle'){
        const[a,b]=w2s(r.cx,r.cy);
        skEl('circle',{cx:a,cy:b,r:r.r*skView.s,fill:'none',stroke:'#e6e6ee','stroke-width':1.15,opacity:0.42});
      } else if(r.type==='arc'){
        const[a,b]=w2s(r.x1,r.y1),[c,d]=w2s(r.x2,r.y2);
        let dd=r.a2-r.a1; while(dd<=0)dd+=Math.PI*2; while(dd>Math.PI*2)dd-=Math.PI*2;
        skEl('path',{d:`M ${a} ${b} A ${r.r*skView.s} ${r.r*skView.s} 0 ${dd>Math.PI?1:0} 0 ${c} ${d}`,fill:'none',stroke:'#e6e6ee','stroke-width':1.15,opacity:0.42});
      } else {
        const[a,b]=w2s(r.x1,r.y1),[c,d]=w2s(r.x2,r.y2);
        if((a<-100&&c<-100)||(a>W+100&&c>W+100)||(b<-100&&d<-100)||(b>H+100&&d>H+100))continue;
        skEl('line',{x1:a.toFixed(1),y1:b.toFixed(1),x2:c.toFixed(1),y2:d.toFixed(1),stroke:'#e6e6ee','stroke-width':1.15,opacity:0.42});
      }
    }
  }
  // Références : arêtes du solide projetées (fond violet, non éditable, jamais dans le profil)
  if(skShowRefs&&(sk._refs||[]).length){
    for(let i=0;i<sk._refs.length;i++){const r=sk._refs[i];
      if(r.type==='circle'){
        const[a,b]=w2s(r.cx,r.cy);
        skEl('circle',{cx:a,cy:b,r:r.r*skView.s,fill:'none',stroke:'#bf5af2','stroke-width':1,'stroke-dasharray':'5 4',opacity:0.5});
      } else if(r.type==='arc'){
        const[a,b]=w2s(r.cx+r.r*Math.cos(r.a1),r.cy+r.r*Math.sin(r.a1)),[c,d]=w2s(r.cx+r.r*Math.cos(r.a2),r.cy+r.r*Math.sin(r.a2));
        let dd=r.a2-r.a1; const TAU=Math.PI*2; dd=((dd%TAU)+TAU)%TAU; if(dd<1e-9)dd=TAU;
        skEl('path',{d:`M ${a} ${b} A ${r.r*skView.s} ${r.r*skView.s} 0 ${dd>Math.PI?1:0} 0 ${c} ${d}`,fill:'none',stroke:'#bf5af2','stroke-width':1,'stroke-dasharray':'5 4',opacity:0.5});
      } else {
        const[a,b]=w2s(r.x1,r.y1),[c,d]=w2s(r.x2,r.y2);
        if((a<-60&&c<-60)||(a>W+60&&c>W+60)||(b<-60&&d<-60)||(b>H+60&&d>H+60))continue;
        skEl('line',{x1:a.toFixed(1),y1:b.toFixed(1),x2:c.toFixed(1),y2:d.toFixed(1),stroke:'#bf5af2','stroke-width':1,'stroke-dasharray':'5 4',opacity:0.5});
      }
    }
  }
  // guides d'inférence H/V + ⟂/⦾
  if(skInfer){
    if(skInfer.v){const[x]=w2s(skInfer.x,0);skEl('line',{x1:x,y1:0,x2:x,y2:H,stroke:'#bf5af2','stroke-width':1,'stroke-dasharray':'6 4'});}
    if(skInfer.h){const[,y]=w2s(0,skInfer.y);skEl('line',{x1:0,y1:y,x2:W,y2:y,stroke:'#bf5af2','stroke-width':1,'stroke-dasharray':'6 4'});}
    if(skInfer.perp){const l=entById(sk,skInfer.perp);if(l&&l.t==='line'){const A=sk.points[l.p1],B=sk.points[l.p2];
      if(A&&B){const[a,b]=w2s(A.x,A.y),[c,d2]=w2s(B.x,B.y);skEl('line',{x1:a,y1:b,x2:c,y2:d2,stroke:'#ffd60a','stroke-width':3,opacity:0.9});}}}
    if(skInfer.tan){const c=entById(sk,skInfer.tan);if(c){const C=sk.points[c.pc];
      if(C){const[a,b]=w2s(C.x,C.y);skEl('circle',{cx:a,cy:b,r:c.r*skView.s,fill:'none',stroke:'#ffd60a','stroke-width':3});}}}
  }
  const fix=skFixed(sk);
  const showDof=skDof(sk)>0; // flèches DOF tant que sous-contrainte
  const selIds=new Set();if(skSel&&skSel.kind==='ent')selIds.add(skSel.id);skSelX.forEach(s=>{if(s.kind==='ent')selIds.add(s.id);});
  const col=e=>selIds.has(e.id)?'#ff9f0a':(entLocked(sk,e,fix)?'#e8e8ea':'#64d2ff');
  const wdt=e=>selIds.has(e.id)?3.5:2;
  const tangT=(e,C)=>{ // [{x,y}] : un sigle T par tangence, posé au point de contact sur le cercle/arc (Fusion360)
    const P=sk.points;
    const out=[];
    (sk.constraints||[]).forEach(k=>{
      if(k.type==='tangent'&&k.ent===e.id){
        const L=entById(sk,k.line);if(!L||L.t!=='line')return;
        const A2=P[L.p1],B2=P[L.p2];if(!A2||!B2)return;
        const ex=B2.x-A2.x,ey=B2.y-A2.y,el2=ex*ex+ey*ey;if(el2<1e-12)return;
        const t=((C.x-A2.x)*ex+(C.y-A2.y)*ey)/el2;
        const fx=A2.x+t*ex,fy=A2.y+t*ey,fd=Math.hypot(fx-C.x,fy-C.y)||1e-9;
        out.push({x:C.x+(fx-C.x)/fd*e.r,y:C.y+(fy-C.y)/fd*e.r});
      }else if(k.type==='tangent2'&&(k.a===e.id||k.b===e.id)){
        const O=entById(sk,k.a===e.id?k.b:k.a);if(!O||!P[O.pc])return;
        const OC=P[O.pc],dd=Math.hypot(OC.x-C.x,OC.y-C.y)||1e-9;
        out.push({x:C.x+(OC.x-C.x)/dd*e.r,y:C.y+(OC.y-C.y)/dd*e.r});
      }
    });
    return out;
  };
  const drawT=(q)=>{const[tx,ty]=w2s(q.x,q.y);
    const g=skEl('text',{x:tx+6,y:ty-6,fill:'#30d158','font-size':12,'font-weight':'bold'});g.textContent='T';};
  (sk.entities||[]).forEach(e=>{
    const P=sk.points;
    if(e.t==='line'){const A=P[e.p1],B=P[e.p2];if(!A||!B)return;
      const[a,b]=w2s(A.x,A.y),[c,d]=w2s(B.x,B.y);
      skEl('line',{x1:a,y1:b,x2:c,y2:d,stroke:col(e),'stroke-width':wdt(e),...(e.construction?{'stroke-dasharray':'7 5',opacity:.45}:{})});
      const hv=(sk.constraints||[]).filter(k=>(k.type==='h'||k.type==='v')&&k.line===e.id).map(k=>k.type.toUpperCase()).join('');
      const eq=(sk.constraints||[]).some(k=>k.type==='equal'&&(k.a===e.id||k.b===e.id));
      const tgL=(sk.constraints||[]).filter(k=>k.type==='tangent'&&k.line===e.id);
      const pp=(sk.constraints||[]).filter(k=>(k.type==='parallel'||k.type==='perpendicular')&&(k.a===e.id||k.b===e.id)).map(k=>k.type==='parallel'?'∥':'⟂').join('');
      const sy=(sk.constraints||[]).some(k=>k.type==='symmetric'&&(k.a===e.id||k.b===e.id||k.mid===e.id));
      if(hv||eq||tgL.length||pp||sy){const[mx,my]=w2s((A.x+B.x)/2,(A.y+B.y)/2);
        const t=skEl('text',{x:mx+8,y:my-8,fill:'#30d158','font-size':12,'font-weight':'bold'});t.textContent=hv+pp+(sy?'⇔':'')+(eq?'=':'');}
      // sigle T par tangence sur la ligne, au point de contact (l'autre sigle est sur le cercle/arc)
      if(tgL.length){const ddx=B.x-A.x,ddy=B.y-A.y,l2=ddx*ddx+ddy*ddy;
        tgL.forEach(k=>{const E=entById(sk,k.ent),Cc=E?P[E.pc]:null;if(!Cc||l2<1e-12)return;
          let t2=((Cc.x-A.x)*ddx+(Cc.y-A.y)*ddy)/l2;t2=Math.max(0,Math.min(1,t2));
          drawT({x:A.x+t2*ddx,y:A.y+t2*ddy});});}
    }
    if(e.t==='circle'){const C=P[e.pc];if(!C)return;const[a,b]=w2s(C.x,C.y);
      skEl('circle',{cx:a,cy:b,r:Math.abs(e.r)*skView.s,fill:e.construction?'none':'rgba(100,210,255,.07)',stroke:col(e),'stroke-width':wdt(e),...(e.construction?{'stroke-dasharray':'7 5',opacity:.45}:{})});
      const[px,py]=w2s(C.x,C.y);skEl('rect',{x:px-3,y:py-3,width:6,height:6,fill:fix.has(e.pc)?'#e8e8ea':'none',stroke:col(e)});
      tangT(e,C).forEach(drawT); // T au point de contact (un par tangence), pas au centre
      if((sk.constraints||[]).some(k=>k.type==='coaxial'&&(k.a===e.id||k.b===e.id))){
        const t=skEl('text',{x:px+7,y:py-7,fill:'#30d158','font-size':12,'font-weight':'bold'});t.textContent='◎';}
    }
    if(e.t==='arc'){const C=P[e.pc];if(!C)return;const an=arcAngles(sk,e);if(!an)return;
      const p1={x:C.x+e.r*Math.cos(an.a1),y:C.y+e.r*Math.sin(an.a1)},p2={x:C.x+e.r*Math.cos(an.a2),y:C.y+e.r*Math.sin(an.a2)};
      const[a,b]=w2s(p1.x,p1.y),[c,d]=w2s(p2.x,p2.y);
      const dd=an.a2-an.a1;
      skEl('path',{d:`M ${a} ${b} A ${e.r*skView.s} ${e.r*skView.s} 0 ${dd>Math.PI?1:0} 0 ${c} ${d}`,fill:'none',stroke:col(e),'stroke-width':wdt(e),...(e.construction?{'stroke-dasharray':'7 5',opacity:.45}:{})});
      const[px,py]=w2s(C.x,C.y);skEl('rect',{x:px-3,y:py-3,width:6,height:6,fill:'none',stroke:col(e)});
      tangT(e,C).forEach(drawT); // T au point de contact (un par tangence)
      if((sk.constraints||[]).some(k=>k.type==='coaxial'&&(k.a===e.id||k.b===e.id))){
        const t=skEl('text',{x:px+7,y:py-7,fill:'#30d158','font-size':12,'font-weight':'bold'});t.textContent='◎';}
    }
    if(e.t==='cpoint'){const Q=P[e.p];if(!Q)return;const[a,b]=w2s(Q.x,Q.y);
      skEl('path',{d:`M ${a-6} ${b} H ${a+6} M ${a} ${b-6} V ${b+6}`,stroke:col(e),'stroke-width':wdt(e)});}
  });
  // extrémités : carrés (plein = fixe) + pastille coïncident + flèche DOF · origine = pastille ronde permanente
  Object.keys(skPts(sk)).forEach(pid=>{
    const p=sk.points[pid];if(!p)return;const[a,b]=w2s(p.x,p.y);
    const isSel=(skSel&&skSel.kind==='point'&&skSel.pid===pid)||skSelX.some(s=>s.kind==='point'&&s.pid===pid);
    const isMark=(skCoinA===pid)||(skPendPt===pid);
    if(pid===SK_ORIGIN){
      let used=0;(sk.entities||[]).forEach(e=>{if(e.p1===pid||e.p2===pid||e.p===pid||e.pc===pid||e.pa===pid||e.pb===pid)used++;});
      const ring=used>=2?'#30d158':(isSel?'#ff9f0a':'#8e8e93');
      skEl('circle',{cx:a,cy:b,r:5,fill:isSel?'#ff9f0a':'#e8e8ea',stroke:isSel?'#ff9f0a':'#8e8e93','stroke-width':1.5});
      skEl('circle',{cx:a,cy:b,r:9,fill:'none',stroke:ring,'stroke-width':1.4,opacity:0.95});
      if(isMark)skEl('circle',{cx:a,cy:b,r:13,fill:'none',stroke:'#ff9f0a','stroke-width':2,opacity:0.9});
      return;
    }
    skEl('rect',{x:a-4,y:b-4,width:8,height:8,fill:fix.has(pid)?'#e8e8ea':(isSel||isMark?'#ff9f0a':'#101012'),stroke:isSel?'#ff9f0a':'#64d2ff','stroke-width':1.5});
    let used=0;(sk.entities||[]).forEach(e=>{if(e.p1===pid||e.p2===pid||e.p===pid||e.pc===pid||e.pa===pid||e.pb===pid)used++;});
    if(used>=2)skEl('circle',{cx:a,cy:b,r:6,fill:'none',stroke:'#30d158','stroke-width':1.2,opacity:0.9}); // coïncident
    if(showDof&&!fix.has(pid))skEl('path',{d:`M ${a+7} ${b-7} h 7 m -3.5 -3.5 l 3.5 3.5 l -3.5 3.5`,fill:'none',stroke:'#30d158','stroke-width':1.4,opacity:0.85}); // DOF
  });
  // santé : bouts ouverts (rouge + écart), auto-intersections (losanges orange)
  const HL=sk._health;
  if(HL){
    (HL.opens||[]).forEach(o=>{const[a,b]=w2s(o.x,o.y);
      skEl('circle',{cx:a,cy:b,r:7,fill:'none',stroke:'#ff453a','stroke-width':2.5});});
    if(HL.gapPair&&HL.gapD<25){const[a,b]=w2s(HL.gapPair[0].x,HL.gapPair[0].y),[c,e2]=w2s(HL.gapPair[1].x,HL.gapPair[1].y);
      skEl('line',{x1:a,y1:b,x2:c,y2:e2,stroke:'#ff453a','stroke-width':1.5,'stroke-dasharray':'4 3'});
      const t=skEl('text',{x:(a+c)/2,y:(b+e2)/2-8,fill:'#ff453a','font-size':12,'font-weight':'bold'});t.textContent='⚠ '+HL.gapD.toFixed(1);}
    (HL.selfints||[]).forEach(o=>{const[a,b]=w2s(o.x,o.y);
      skEl('path',{d:`M ${a} ${b-7} L ${a+7} ${b} L ${a} ${b+7} L ${a-7} ${b} Z`,fill:'none',stroke:'#ff9f0a','stroke-width':2});});
  }
  // marqueur de snap
  if(skSnapMk){const[a,b]=w2s(skSnapMk.x,skSnapMk.y);skEl('circle',{cx:a,cy:b,r:7,fill:'none',stroke:'#ffd60a','stroke-width':2});}
  // boîte de sélection rectangle
  if(skBox){
    const[a,b]=w2s(Math.min(skBox.x0,skBox.x1),Math.max(skBox.y0,skBox.y1));
    skEl('rect',{x:a,y:b,width:Math.abs(skBox.x1-skBox.x0)*skView.s,height:Math.abs(skBox.y1-skBox.y0)*skView.s,fill:'rgba(10,132,255,.08)',stroke:'#0a84ff','stroke-width':1,'stroke-dasharray':'4 3'});
  }
  // cotes
  drawSkDims(sk);
  // ⧉ hover : arête projetable sous le curseur (même hors plan) en orange — Fusion-like
  if(skTool==='project'&&skProjectHover){
    const pr=skProjectHover;
    if(pr.type==='circle'){
      const[a,b]=w2s(pr.cx,pr.cy);
      skEl('circle',{cx:a,cy:b,r:pr.r*skView.s,fill:'none',stroke:'#ff9f0a','stroke-width':3,opacity:0.95});
      skEl('circle',{cx:a,cy:b,r:4,fill:'#ff9f0a'});
    }else if(pr.type==='arc'){
      const a1=Math.atan2(pr.y1-pr.cy,pr.x1-pr.cx),a2=Math.atan2(pr.y2-pr.cy,pr.x2-pr.cx);
      let dd=a2-a1; while(dd<=0)dd+=Math.PI*2; while(dd>Math.PI*2)dd-=Math.PI*2;
      const[a,b]=w2s(pr.x1,pr.y1),[c,d]=w2s(pr.x2,pr.y2);
      skEl('path',{d:`M ${a} ${b} A ${pr.r*skView.s} ${pr.r*skView.s} 0 ${dd>Math.PI?1:0} 0 ${c} ${d}`,fill:'none',stroke:'#ff9f0a','stroke-width':3,opacity:0.95});
      const[ac,bc]=w2s(pr.cx,pr.cy); skEl('rect',{x:ac-3,y:bc-3,width:6,height:6,fill:'none',stroke:'#ff9f0a'});
    }else if(pr.type==='line'){
      const[a,b]=w2s(pr.x1,pr.y1),[c,d]=w2s(pr.x2,pr.y2);
      skEl('line',{x1:a,y1:b,x2:c,y2:d,stroke:'#ff9f0a','stroke-width':3,opacity:0.95});
      skEl('circle',{cx:a,cy:b,r:4,fill:'#ff9f0a'}); skEl('circle',{cx:c,cy:d,r:4,fill:'#ff9f0a'});
    }
  }
  // brouillon + cote live (longueur/angle comme Fusion)
  if(skDraft){
    const d=skDraft;
    if(d.t==='line'){const[a,b]=w2s(d.x1,d.y1),[c2,d2]=w2s(d.x2,d.y2);
      skEl('line',{x1:a,y1:b,x2:c2,y2:d2,stroke:'#fff','stroke-width':2,'stroke-dasharray':'5 3'});
      const L=Math.hypot(d.x2-d.x1,d.y2-d.y1);
      if(L>1e-6){
        const ang=(Math.atan2(d.y2-d.y1,d.x2-d.x1)*180/Math.PI+360)%360;
        const[mx,my]=w2s((d.x1+d.x2)/2,(d.y1+d.y2)/2);
        const t=skEl('text',{x:mx,y:my-14,fill:'#ffd60a','font-size':13,'font-weight':'bold','text-anchor':'middle'});
        t.textContent=L.toFixed(2)+' mm ∠ '+ang.toFixed(1)+'°';
        if(skInfer&&skInfer.perp){const g=skEl('text',{x:mx+18,y:my+4,fill:'#ffd60a','font-size':15,'font-weight':'bold'});g.textContent='⟂';}
        if(skInfer&&skInfer.tan){const g=skEl('text',{x:mx+18,y:my+4,fill:'#ffd60a','font-size':15,'font-weight':'bold'});g.textContent='⦾';}
      }}
    if(d.t==='slot'){
      const x0=Math.min(d.x1,d.x2),x1=Math.max(d.x1,d.x2),y0=Math.min(d.y1,d.y2),y1=Math.max(d.y1,d.y2),w=x1-x0,h=y1-y0;
      if(w>0.5&&h>0.5){
        if(w>h){const r=h/2,ym=(y0+y1)/2;const[a1,b1]=w2s(x0+r, y1),[c1,d1]=w2s(x1-r, y1),[a2,b2]=w2s(x0+r, y0),[c2,d2]=w2s(x1-r, y0);
          skEl('line',{x1:a1,y1:b1,x2:c1,y2:d1,stroke:'#fff','stroke-width':2,'stroke-dasharray':'5 3'});
          skEl('line',{x1:a2,y1:b2,x2:c2,y2:d2,stroke:'#fff','stroke-width':2,'stroke-dasharray':'5 3'});
          const[ac1,bc1]=w2s(x0+r, ym),[ac2,bc2]=w2s(x1-r, ym);
          skEl('path',{d:`M ${a1} ${b1} A ${r*skView.s} ${r*skView.s} 0 0 0 ${a2} ${b2}`,fill:'none',stroke:'#fff','stroke-width':2,'stroke-dasharray':'5 3'});
          skEl('path',{d:`M ${c1} ${d1} A ${r*skView.s} ${r*skView.s} 0 0 1 ${c2} ${d2}`,fill:'none',stroke:'#fff','stroke-width':2,'stroke-dasharray':'5 3'});
        } else {const r=w/2,xm=(x0+x1)/2;const[a1,b1]=w2s(x0, y0+r),[a2,b2]=w2s(x0, y1-r),[c1,d1]=w2s(x1, y0+r),[c2,d2]=w2s(x1, y1-r);
          skEl('line',{x1:a1,y1:b1,x2:a2,y2:b2,stroke:'#fff','stroke-width':2,'stroke-dasharray':'5 3'});
          skEl('line',{x1:c1,y1:d1,x2:c2,y2:d2,stroke:'#fff','stroke-width':2,'stroke-dasharray':'5 3'});
          const[ac1,bc1]=w2s(xm, y0+r),[ac2,bc2]=w2s(xm, y1-r);
          skEl('path',{d:`M ${a1} ${b1} A ${r*skView.s} ${r*skView.s} 0 0 0 ${c1} ${d1}`,fill:'none',stroke:'#fff','stroke-width':2,'stroke-dasharray':'5 3'});
          skEl('path',{d:`M ${a2} ${b2} A ${r*skView.s} ${r*skView.s} 0 0 1 ${c2} ${d2}`,fill:'none',stroke:'#fff','stroke-width':2,'stroke-dasharray':'5 3'});
        }
      }
    } else if(d.t==='rect'){const[a,b]=w2s(Math.min(d.x1,d.x2),Math.max(d.y1,d.y2));
      skEl('rect',{x:a,y:b,width:Math.abs(d.x2-d.x1)*skView.s,height:Math.abs(d.y2-d.y1)*skView.s,fill:'rgba(255,255,255,.06)',stroke:'#fff','stroke-dasharray':'5 3'});
      const t=skEl('text',{x:a+Math.abs(d.x2-d.x1)*skView.s/2,y:b+Math.abs(d.y2-d.y1)*skView.s/2,fill:'#ffd60a','font-size':13,'font-weight':'bold','text-anchor':'middle'});
      t.textContent=Math.abs(d.x2-d.x1).toFixed(1)+' × '+Math.abs(d.y2-d.y1).toFixed(1);}
    if(d.t==='circle'){const[a,b]=w2s(d.cx,d.cy);skEl('circle',{cx:a,cy:b,r:d.r*skView.s,fill:'none',stroke:'#fff','stroke-dasharray':'5 3'});
      const t=skEl('text',{x:a,y:b-d.r*skView.s-8,fill:'#ffd60a','font-size':13,'font-weight':'bold','text-anchor':'middle'});
      t.textContent='⌀'+(d.r*2).toFixed(2);}
    if(d.t==='arc'){const C=sk.points[d.pc];if(C){const p1={x:C.x+d.r*Math.cos(d.a1),y:C.y+d.r*Math.sin(d.a1)},p2={x:C.x+d.r*Math.cos(d.a2),y:C.y+d.r*Math.sin(d.a2)};
      const[a,b]=w2s(p1.x,p1.y),[c2,d2]=w2s(p2.x,p2.y);
      let dd=(d.a2-d.a1)%(Math.PI*2);if(dd<0)dd+=Math.PI*2;
      skEl('path',{d:`M ${a} ${b} A ${d.r*skView.s} ${d.r*skView.s} 0 ${dd>Math.PI?1:0} 0 ${c2} ${d2}`,fill:'none',stroke:'#fff','stroke-dasharray':'5 3'});}}
  }
  // saisie dynamique (tapez une longueur/angle puis Entrée)
  if(skDyn&&skDown){
    const anchor=(skDraft&&skDraft.t==='line')?{x:(skDraft.x1+skDraft.x2)/2,y:(skDraft.y1+skDraft.y2)/2}:{x:skDown.x,y:skDown.y};
    const[sx,sy]=w2s(anchor.x,anchor.y);
    const label=(skDyn.mode==='len'?'L = ':'∠ = ')+(skDyn.buf||'')+(skDyn.mode==='len'?' mm':'°');
    const wpx=Math.max(70,label.length*8+18);
    skEl('rect',{x:sx-wpx/2,y:sy-44,width:wpx,height:24,rx:5,fill:'#1e1e1e',stroke:'#0a84ff','stroke-width':1.5});
    const t=skEl('text',{x:sx,y:sy-27,fill:'#fff','font-size':14,'font-weight':'bold','text-anchor':'middle'});
    t.textContent=label;
    const h=skEl('text',{x:sx,y:sy-50,fill:'#8a8f99','font-size':11,'text-anchor':'middle'});
    h.textContent='Tab angle/longueur · Entrée OK · Échap annule';
  }
  if(_skPrevCam) sketchSyncCamera();
}
function dimById(sk,id){return (sk.dims||[]).find(d=>d.id===id);}
function angleArcInfo(sk,d){ // {V,rr,a1,dd} — secteur STOCKE (a1=rayon A, dd=±value), arc et texte toujours cohérents
  const fr=angleFrame(sk,d);if(!fr)return null;
  const rr=(d.w!=null&&isFinite(d.w))?Math.abs(d.w):14/skView.s;
  let ccw=d.ccw;
  if(ccw!==0&&ccw!==1)ccw=(fr.delta>=0)?1:0; // migration : signe courant (sans muter au rendu)
  const dd=(ccw?1:-1)*Math.max(0.02,Math.min(Math.PI-0.02,d.value||0));
  return{V:fr.V,rr,a1:fr.sA,dd};
}
function dimLabelPos(sk,d){ // position monde de l'étiquette, décalage utilisateur inclus (déplaçable)
  const P=sk.points,ox=d.ox||0,oy=d.oy||0;
  if(d.type==='length'||d.type==='distance'||d.type==='gap'||d.type==='distline'){const S=dimSeg(sk,d);if(!S)return null;
    return{x:(S.a.x+S.b.x)/2+ox,y:(S.a.y+S.b.y)/2+oy};}
  if(d.type==='diameter'||d.type==='radius'){const e=entById(sk,d.ent);if(!e)return null;const C=P[e.pc];if(!C)return null;return{x:C.x+e.r*0.7+ox,y:C.y+e.r*0.7+oy};}
  if(d.type==='angle'){const I=angleArcInfo(sk,d);if(!I)return null; // au milieu de l'arc, comme Fusion
    const am=I.a1+I.dd/2;return{x:I.V.x+I.rr*Math.cos(am)+ox,y:I.V.y+I.rr*Math.sin(am)+oy};}
  return null;
}
function dimSeg(sk,d){ // segment monde de la ligne de cote (offset perpendiculaire d.w / glissement d.sl / d.orient h|v|a)
  const P=sk.points;
  if(d.type==='length'){const l=entById(sk,d.line);if(!l)return null;const A=P[l.p1],B=P[l.p2];if(!A||!B)return null;
    const w=(d.w!=null&&isFinite(d.w))?d.w:5;
    const L=Math.hypot(B.x-A.x,B.y-A.y)||1e-9,nx=-(B.y-A.y)/L,ny=(B.x-A.x)/L;
    if(d.orient==='h'){const cy=(A.y+B.y)/2+w;return{a:{x:A.x,y:cy},b:{x:B.x,y:cy},A,B,nx:0,ny:1,w,hv:'h',cy};}
    if(d.orient==='v'){const cx=(A.x+B.x)/2+w;return{a:{x:cx,y:A.y},b:{x:cx,y:B.y},A,B,nx:1,ny:0,w,hv:'v',cx};}
    return{a:{x:A.x+nx*w,y:A.y+ny*w},b:{x:B.x+nx*w,y:B.y+ny*w},A,B,nx,ny,w};}
  if(d.type==='distance'){const A=P[d.a],B=P[d.b];if(!A||!B)return null;
    const w=(d.w!=null&&isFinite(d.w))?d.w:0;
    const L=Math.hypot(B.x-A.x,B.y-A.y)||1e-9,nx=-(B.y-A.y)/L,ny=(B.x-A.x)/L;
    if(d.orient==='h'){const cy=(A.y+B.y)/2+w;return{a:{x:A.x,y:cy},b:{x:B.x,y:cy},A,B,nx:0,ny:1,w,hv:'h',cy};}
    if(d.orient==='v'){const cx=(A.x+B.x)/2+w;return{a:{x:cx,y:A.y},b:{x:cx,y:B.y},A,B,nx:1,ny:0,w,hv:'v',cx};}
    return{a:{x:A.x+nx*w,y:A.y+ny*w},b:{x:B.x+nx*w,y:B.y+ny*w},A,B,nx,ny,w};}
  if(d.type==='gap'){const A=entById(sk,d.a),B=entById(sk,d.b);if(!A||!B)return null;
    const A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2];if(!A1||!A2||!B1||!B2)return null;
    const s=d.sl||0,dx=A2.x-A1.x,dy=A2.y-A1.y,L=Math.hypot(dx,dy)||1e-9,ux=dx/L,uy=dy/L;
    const nx=-uy,ny=ux;
    const Amx=(A1.x+A2.x)/2,Amy=(A1.y+A2.y)/2,Bmx=(B1.x+B2.x)/2,Bmy=(B1.y+B2.y)/2;
    const gap=(Bmx-Amx)*nx+(Bmy-Amy)*ny;
    return{a:{x:Amx+ux*s,y:Amy+uy*s},b:{x:Amx+ux*s+nx*gap,y:Amy+uy*s+ny*gap},ux,uy,nx,ny,gap,s};}
  if(d.type==='distline'){ // centre → pied de perpendiculaire sur la ligne (infinie, comme Fusion) + offset d.w
    const l=entById(sk,d.line),Pt=P[d.p];
    if(!l||l.t!=='line'||!Pt)return null;
    const A=P[l.p1],B=P[l.p2];if(!A||!B)return null;
    const dx=B.x-A.x,dy=B.y-A.y,L2=dx*dx+dy*dy||1e-9;
    const t=((Pt.x-A.x)*dx+(Pt.y-A.y)*dy)/L2;
    const F={x:A.x+dx*t,y:A.y+dy*t};
    const sx=F.x-Pt.x,sy=F.y-Pt.y,L=Math.hypot(sx,sy)||1e-9;
    let nx,ny;
    if(L>1e-9){nx=-sy/L;ny=sx/L;} // ⊥ au segment P→F (glissement le long de L)
    else{const Ln=Math.hypot(dx,dy)||1e-9;nx=dx/Ln;ny=dy/Ln;} // P sur la ligne : le long de L
    const w=(d.w!=null&&isFinite(d.w))?d.w:0;
    return{a:{x:Pt.x+nx*w,y:Pt.y+ny*w},b:{x:F.x+nx*w,y:F.y+ny*w},A:Pt,B:F,nx,ny,w};
  }
  return null;
}
function dimMeasureOf(A,B,o){ // mesure courante selon l'orientation de la cote (a=alignée, h, v)
  return o==='h'?Math.abs(B.x-A.x):o==='v'?Math.abs(B.y-A.y):Math.hypot(B.x-A.x,B.y-A.y);
}
function dimCurValue(sk,d){ // valeur courante (monde) d'une cote length/distance selon son orientation
  if(d.type==='length'){const l=entById(sk,d.line);if(!l)return null;const A=sk.points[l.p1],B=sk.points[l.p2];
    if(!A||!B)return null;return dimMeasureOf(A,B,d.orient);}
  if(d.type==='distance'){const A=sk.points[d.a],B=sk.points[d.b];if(!A||!B)return null;return dimMeasureOf(A,B,d.orient);}
  return null;
}
function skDimOrientAt(sk,dd,wx,wy){ // pose linéaire : H/V/aligné selon la position du curseur (direction de décalage la plus proche)
  const S=dimSeg(sk,dd);if(!S)return null;
  const A=S.A,B=S.B,M={x:(A.x+B.x)/2,y:(A.y+B.y)/2};
  const dx=B.x-A.x,dy=B.y-A.y;
  const rdx=wx-M.x,rdy=wy-M.y;
  let o=dd.orient||'a';
  if(Math.hypot(rdx,rdy)>1e-6){
    const beta=Math.atan2(dy,dx),phi=Math.atan2(rdy,rdx);
    const w180=a=>{a=(a*180/Math.PI)%180;if(a<0)a+=180;return a;};
    const dH=w180(phi-Math.PI/2),dV=w180(phi),dA=w180(phi-(beta+Math.PI/2));
    const cands=[{o:'h',d:dH,ok:Math.abs(dx)>1e-6},{o:'v',d:dV,ok:Math.abs(dy)>1e-6},{o:'a',d:dA,ok:true}];
    cands.sort((x,y)=>x.d-y.d);
    o=(cands.find(c=>c.ok)||cands[2]).o; // jamais de cote « 0 » sur une ligne purement V/H
  }
  dd.orient=o;
  const L=Math.hypot(dx,dy)||1e-9;
  if(o==='h'){dd.w=wy-M.y;dd.value=+Math.abs(dx).toFixed(2);}
  else if(o==='v'){dd.w=wx-M.x;dd.value=+Math.abs(dy).toFixed(2);}
  else{const nx=-dy/L,ny=dx/L;dd.w=rdx*nx+rdy*ny;dd.value=+Math.hypot(dx,dy).toFixed(2);}
  return o;
}
function skDimAngleAt(sk,dd,wx,wy){ // pose d'angle : naturel / complémentaire / complémentaire permuté selon le secteur du curseur
  const V=angleVertex(sk,dd);if(!V)return;
  dd.w=Math.max(1,Math.hypot(wx-V.x,wy-V.y));
  if(dd.oa===undefined||dd.oa===null){dd.oa=dd.a;dd.ob=dd.b;}
  const TAU=Math.PI*2,fr=angleFrame(sk,{a:dd.oa,b:dd.ob});if(!fr)return;
  const v=Math.abs(fr.delta),mu=Math.atan2(wy-V.y,wx-V.x);
  const inS=(start,sweep)=>{let r=(mu-start)%TAU;if(r<0)r+=TAU;return sweep>=0?r<=sweep+1e-9:r>=TAU+sweep-1e-9;};
  const comp=Math.PI-Math.max(0.02,Math.min(Math.PI-0.02,v)),sB=fr.sB;
  if(inS(fr.sA,fr.delta)){dd.a=dd.oa;dd.b=dd.ob;delete dd.comp;dd.ccw=fr.delta>0?1:0;dd.value=v;}
  else if(inS(fr.sA,fr.delta>0?-comp:comp)){dd.a=dd.oa;dd.b=dd.ob;dd.comp=1;dd.ccw=fr.delta>0?0:1;dd.value=comp;}
  else if(inS(sB,fr.delta>0?comp:-comp)){dd.a=dd.ob;dd.b=dd.oa;dd.comp=1;dd.ccw=fr.delta>0?1:0;dd.value=comp;}
}
function angleWant(d,delta){ // consigne signée d'une cote d'angle (naturelle, ou complémentaire π−v via d.comp)
  const v=Math.max(0.02,Math.min(Math.PI-0.02,d.value||0));
  if(d.comp)return (delta>=0?1:-1)*(Math.PI-v);
  const ccw=(d.ccw===0||d.ccw===1)?d.ccw:((delta>=0)?1:0);
  return (ccw?1:-1)*v;
}
function hitDimLine(sk,px,py){ // px,py pixels écran SVG → id de cote si le clic est sur la ligne de cote
  for(const d of (sk.dims||[])){
    if(d.type==='length'||d.type==='distance'||d.type==='gap'||d.type==='distline'){
      const S=dimSeg(sk,d);if(!S)continue;
      const[a,b]=w2s(S.a.x,S.a.y),[c,e2]=w2s(S.b.x,S.b.y);
      if(distSeg(px,py,{x:a,y:b},{x:c,y:e2})<7)return d.id;
    }
    if(d.type==='angle'){
      const I=angleArcInfo(sk,d);if(!I)continue;
      let near=false;
      for(let i=0;i<=16;i++){const an=I.a1+I.dd*i/16;const[sx,sy]=w2s(I.V.x+I.rr*Math.cos(an),I.V.y+I.rr*Math.sin(an));
        if(Math.hypot(sx-px,sy-py)<7){near=true;break;}}
      if(near)return d.id;
    }
  }
  return null;
}
function angleVertex(sk,d){ // sommet commun ou milieu du segment joignant les milieux
  const A=entById(sk,d.a),B=entById(sk,d.b);
  if(!A||!B||A.t!=='line'||B.t!=='line')return null;
  const P=sk.points;
  const sh=[A.p1,A.p2].find(p=>p===B.p1||p===B.p2);
  if(sh&&P[sh])return P[sh];
  const A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2];
  if(!A1||!A2||!B1||!B2)return null;
  return{x:((A1.x+A2.x)/2+(B1.x+B2.x)/2)/2,y:((A1.y+A2.y)/2+(B1.y+B2.y)/2)/2};
}
function hitDimLabel(sk,px,py){ // px,py en pixels écran SVG → id de cote ou null (boîte tournée pour les cotes linéaires)
  for(const d of (sk.dims||[])){
    const w=dimLabelPos(sk,d);if(!w)continue;
    const[sx,sy]=w2s(w.x,w.y);
    const isLin=(d.type==='length'||d.type==='distance'||d.type==='gap'||d.type==='distline');
    if(isLin){
      const S=dimSeg(sk,d);
      if(S){
        const[ax,ay]=w2s(S.a.x,S.a.y),[bx,by]=w2s(S.b.x,S.b.y);
        const deg=Math.atan2(by-ay,bx-ax);
        const dx=px-sx,dy=py-sy;
        const lx=dx*Math.cos(deg)+dy*Math.sin(deg);
        const ly=-dx*Math.sin(deg)+dy*Math.cos(deg);
        const half=(String(d.value).length*7.8+14)/2;
        if(Math.abs(lx)<half+14&&Math.abs(ly)<22)return d.id;
        if(Math.hypot(sx-px,sy-py)<60) return d.id;
        continue;
      }
    }
    if(Math.hypot(sx-px,sy-py)<60)return d.id;
  }
  return null;
}
function dimText(x,y,str,id){ // étiquette horizontale avec halo sombre (Ø/R)
  const[ax,ay]=w2s(x,y);
  const t=skEl('text',{x:ax,y:ay-8,fill:'#30d158','font-size':13,'font-weight':'bold',stroke:'#101012','stroke-width':3,'paint-order':'stroke',style:'cursor:move;pointer-events:all',title:'Glisser pour déplacer · double-clic pour modifier'});
  t.textContent=str;
  t.addEventListener('dblclick',ev=>{ev.stopPropagation();editDim(id);});
  return t;
}
function dimTextOnLine(S,str,id){ // étiquette posée SUR la ligne de cote, alignée avec elle (comme Fusion)
  const mx=(S.a.x+S.b.x)/2,my=(S.a.y+S.b.y)/2;
  const[ax,ay]=w2s(S.a.x,S.a.y),[bx,by]=w2s(S.b.x,S.b.y);
  const[sx,sy]=w2s(mx,my);
  if(!isFinite(sx)||!isFinite(sy))return null;
  let deg=Math.atan2(by-ay,bx-ax)*180/Math.PI;
  if(deg>90.01)deg-=180;else if(deg<-90.01)deg+=180; // toujours lisible
  const rot=`rotate(${deg.toFixed(2)} ${sx.toFixed(1)} ${sy.toFixed(1)})`;
  const wpx=str.length*7.8+10;
  const r=skEl('rect',{x:(sx-wpx/2).toFixed(1),y:(sy-11).toFixed(1),width:wpx,height:21,rx:2,fill:'#101012',transform:rot,style:'cursor:move',title:'Glisser = déplacer · double-clic = modifier'});
  const t=skEl('text',{x:sx.toFixed(1),y:(sy+4.5).toFixed(1),fill:'#30d158','font-size':13,'font-weight':'bold','text-anchor':'middle',transform:rot,style:'cursor:move;pointer-events:all'}); t.dataset.dim=id; r.dataset.dim=id;
  t.textContent=str;
  const ed=ev=>{ev.stopPropagation();editDim(id);};
  t.addEventListener('dblclick',ed);r.addEventListener('dblclick',ed);
  return t;
}
function dimArrow(x,y,ux,uy,st,size){ // pointe (x,y) écran, axe (ux,uy) écran unitaire pointant VERS la pointe
  size=size||9;
  if(!isFinite(x)||!isFinite(y)||!isFinite(ux)||!isFinite(uy))return;
  const L=Math.hypot(ux,uy)||1;ux/=L;uy/=L;
  const bx=-uy*size*0.32,by=ux*size*0.32;
  skEl('path',{d:`M ${x.toFixed(1)} ${y.toFixed(1)} L ${(x-ux*size+bx).toFixed(1)} ${(y-uy*size+by).toFixed(1)} L ${(x-ux*size-bx).toFixed(1)} ${(y-uy*size-by).toFixed(1)} Z`,fill:st,stroke:'none','pointer-events':'none'});
}
function drawSkDims(sk){
  (sk.dims||[]).forEach(d=>{
    const P=sk.points,w=dimLabelPos(sk,d);if(!w)return;
    const selD=skSel&&skSel.kind==='dim'&&skSel.id===d.id;
    const st=selD?'#ff9f0a':'#30d158';
    const over=10/skView.s; // dépassement des lignes de rappel
    if(d.type==='length'||d.type==='distance'){
      const S=dimSeg(sk,d);if(!S)return;
      const{A,B,nx,ny}=S,off=(d.w!=null&&isFinite(d.w))?d.w:(d.type==='length'?5:0);
      const sg=off>=0?1:-1;
      // 2 lignes de rappel (witness) : géométrie → au-delà de la ligne de cote
      let Aex,Bex;
      if(S.hv==='h'){ // cote horizontale : rappels verticaux
        const sA2=S.cy>=A.y?1:-1,sB2=S.cy>=B.y?1:-1;
        Aex={x:A.x,y:S.cy+over*sA2};Bex={x:B.x,y:S.cy+over*sB2};
      }else if(S.hv==='v'){ // cote verticale : rappels horizontaux
        const sA2=S.cx>=A.x?1:-1,sB2=S.cx>=B.x?1:-1;
        Aex={x:S.cx+over*sA2,y:A.y};Bex={x:S.cx+over*sB2,y:B.y};
      }else{
        Aex={x:A.x+nx*(off+over*sg),y:A.y+ny*(off+over*sg)},Bex={x:B.x+nx*(off+over*sg),y:B.y+ny*(off+over*sg)};
      }
      const[ax,ay]=w2s(A.x,A.y),[aex,aey]=w2s(Aex.x,Aex.y);
      const[bx2,by2]=w2s(B.x,B.y),[bex,bey]=w2s(Bex.x,Bex.y);
      skEl('line',{x1:ax,y1:ay,x2:aex,y2:aey,stroke:st,'stroke-width':1,opacity:.85,'pointer-events':'none'});
      skEl('line',{x1:bx2,y1:by2,x2:bex,y2:bey,stroke:st,'stroke-width':1,opacity:.85,'pointer-events':'none'});
      // ligne de cote + flèches en bout (pointes sur les rappels)
      const[p1x,p1y]=w2s(S.a.x,S.a.y),[p2x,p2y]=w2s(S.b.x,S.b.y);
      skEl('line',{x1:p1x,y1:p1y,x2:p2x,y2:p2y,stroke:st,'stroke-width':1.4,'pointer-events':'none'});
      dimArrow(p1x,p1y,p1x-p2x,p1y-p2y,st); // pointe extérieure en a
      dimArrow(p2x,p2y,p2x-p1x,p2y-p1y,st); // pointe extérieure en b
      // valeur alignée sur la ligne, fond opaque
      dimTextOnLine(S,d.value.toFixed(2),d.id);
    }
    if(d.type==='diameter'||d.type==='radius'){const e=entById(sk,d.ent);if(!e)return;const C=P[e.pc];if(!C)return;
      const[a,b]=w2s(C.x,C.y),[lx,ly]=w2s(w.x,w.y);
      skEl('line',{x1:a,y1:b,x2:lx,y2:ly,stroke:st,'stroke-width':1,'stroke-dasharray':'3 3','pointer-events':'none'});
      // flèche sur le cercle (extrémité du rayon)
      const dl=Math.hypot(lx-a,ly-b)||1;
      dimArrow(a,b,(a-lx)/dl,(b-ly)/dl,st);
      dimText(w.x,w.y,(d.type==='diameter'?'Ø':'R')+d.value.toFixed(2),d.id);}
    if(d.type==='angle'){
      const I=angleArcInfo(sk,d);if(!I)return;
      const{V,rr,a1,dd}=I;
      const p1={x:V.x+rr*Math.cos(a1),y:V.y+rr*Math.sin(a1)},p2={x:V.x+rr*Math.cos(a1+dd),y:V.y+rr*Math.sin(a1+dd)};
      const[a,b]=w2s(p1.x,p1.y),[c,e2]=w2s(p2.x,p2.y);
      const sg=dd>=0?1:-1; // svg (y inversé) : CCW math → sweep 0, CW → sweep 1
      skEl('path',{d:`M ${a} ${b} A ${rr*skView.s} ${rr*skView.s} 0 ${Math.abs(dd)>Math.PI?1:0} ${sg>=0?0:1} ${c} ${e2}`,fill:'none',stroke:st,'stroke-width':1.5,'pointer-events':'none'});
      // flèches tangentielles aux 2 extrémités de l'arc (pointes vers l'extérieur de l'arc)
      const t1={x:-Math.sin(a1),y:Math.cos(a1)},t2={x:-Math.sin(a1+dd),y:Math.cos(a1+dd)};
      dimArrow(a,b,-t1.x*sg,-t1.y*sg,st,8); // en a : sortie d'arc
      dimArrow(c,e2,t2.x*sg,t2.y*sg,st,8); // en b : sortie d'arc
      dimText(w.x,w.y,'∠'+(d.value*180/Math.PI).toFixed(1)+'°',d.id);
    }
    if(d.type==='gap'){
      const S=dimSeg(sk,d);if(!S)return;
      // ligne de cote prolongée des 2 côtés (les 2 lignes cotées sont les rappels)
      const dxs=S.b.x-S.a.x,dys=S.b.y-S.a.y,dl=Math.hypot(dxs,dys)||1;
      const ux=dxs/dl,uy=dys/dl;
      const A2={x:S.a.x-ux*over,y:S.a.y-uy*over},B2={x:S.b.x+ux*over,y:S.b.y+uy*over};
      const[a,b]=w2s(S.a.x,S.a.y),[c,e2]=w2s(S.b.x,S.b.y);
      const[a2x,a2y]=w2s(A2.x,A2.y),[b2x,b2y]=w2s(B2.x,B2.y);
      skEl('line',{x1:a2x,y1:a2y,x2:b2x,y2:b2y,stroke:st,'stroke-width':1.4,'pointer-events':'none'});
      // flèches aux 2 lignes (pointes sur les lignes cotées, pointant vers l'extérieur)
      dimArrow(a,b,a-c,b-e2,st,8);
      dimArrow(c,e2,c-a,e2-b,st,8);
      dimTextOnLine(S,d.value.toFixed(2),d.id);
    }
    if(d.type==='distline'){ // perpendiculaire centre ↔ ligne, offset d.w déplaçable
      const S=dimSeg(sk,d);if(!S)return;
      const dxs=S.b.x-S.a.x,dys=S.b.y-S.a.y,dl=Math.hypot(dxs,dys)||1;
      if(dl<1e-9)return;
      const ux=dxs/dl,uy=dys/dl; // de P (centre) vers F (pied)
      const off=(d.w!=null&&isFinite(d.w))?d.w:0;
      if(Math.abs(off)>0.5){ // rappels géométrie → au-delà de la ligne décalée
        const sg=off>=0?1:-1;
        const Aex={x:S.A.x+S.nx*(off+over*sg),y:S.A.y+S.ny*(off+over*sg)};
        const Bex={x:S.B.x+S.nx*(off+over*sg),y:S.B.y+S.ny*(off+over*sg)};
        const[ax,ay]=w2s(S.A.x,S.A.y),[aex,aey]=w2s(Aex.x,Aex.y);
        const[bx2,by2]=w2s(S.B.x,S.B.y),[bex,bey]=w2s(Bex.x,Bex.y);
        skEl('line',{x1:ax,y1:ay,x2:aex,y2:aey,stroke:st,'stroke-width':1,opacity:.85,'pointer-events':'none'});
        skEl('line',{x1:bx2,y1:by2,x2:bex,y2:bey,stroke:st,'stroke-width':1,opacity:.85,'pointer-events':'none'});
      }
      const P2={x:S.a.x-ux*over,y:S.a.y-uy*over}; // au-delà du centre
      const F2={x:S.b.x+ux*over,y:S.b.y+uy*over};  // au-delà du pied (traverse la ligne cotée)
      const[px,py]=w2s(S.a.x,S.a.y),[fx,fy]=w2s(S.b.x,S.b.y);
      const[p2x,p2y]=w2s(P2.x,P2.y),[f2x,f2y]=w2s(F2.x,F2.y);
      skEl('line',{x1:p2x,y1:p2y,x2:f2x,y2:f2y,stroke:st,'stroke-width':1.4,'pointer-events':'none'});
      dimArrow(px,py,px-fx,py-fy,st,8);  // pointe en P, vers l'extérieur
      dimArrow(fx,fy,fx-px,fy-py,st,8);  // pointe en F (sur la ligne), vers l'extérieur
      dimTextOnLine({a:{x:S.a.x,y:S.a.y},b:{x:S.b.x,y:S.b.y}},d.value.toFixed(2),d.id);
    }
  });
}
function editDim(id){
  const sk=skEdit;if(!sk)return;const d=(sk.dims||[]).find(x=>x.id===id);if(!d)return;
  const pos=dimLabelPos(sk,d); if(!pos) {
    const v=prompt(d.type==='angle'?'Nouvel angle (degrés, 1..179) :':'Nouvelle valeur (mm) :', d.type==='angle'?(d.value*180/Math.PI).toFixed(1):d.value);
    if(v===null) return;
    const f=parseFloat(String(v).replace(',','.'));
    if(!isFinite(f)||f<=0||(d.type==='angle'&&f>=180)){alert('Valeur invalide.');return;}
    skPushUndo(); d.value=d.type==='angle'?f*Math.PI/180:f; solveSketch(sk);drawSketch2D();renderSkPanel(); return;
  }
  const [sx,sy]=w2s(pos.x,pos.y);
  const r=svg.getBoundingClientRect();
  const inp=document.createElement('input');
  inp.type='text'; inp.inputMode='decimal';
  inp.value=d.type==='angle'?(d.value*180/Math.PI).toFixed(2):String(d.value);
  inp.style.cssText=`position:absolute;left:${r.left+sx-40}px;top:${r.top+sy-14}px;width:80px;height:22px;font-size:12px;text-align:center;border:1px solid #0a84ff;border-radius:6px;background:#1e1e1e;color:#fff;z-index:50`;
  document.body.appendChild(inp); inp.focus(); inp.select();
  let done=false;
  const commit=(cancel)=>{
    if(done) return; done=true;
    inp.remove();
    if(cancel) return;
    const f=parseFloat(String(inp.value).replace(',','.'));
    if(!isFinite(f)||f<=0||(d.type==='angle'&&f>=180)){ skStatus('Valeur invalide.'); return; }
    skPushUndo(); d.value=d.type==='angle'?f*Math.PI/180:f; solveSketch(sk);drawSketch2D();renderSkPanel();
  };
  inp.addEventListener('keydown',e=>{
    if(e.key==='Enter'){ commit(false); }
    if(e.key==='Escape'){ commit(true); }
    e.stopPropagation();
  });
  inp.addEventListener('blur',()=>commit(false));
}

/* ----- panneau latéral esquisse ----- */
function skStatus(msg){skMsg=msg||'';const el=$('skStatus');if(el)el.textContent=skMsg||skDefaultStatus();}
function skDefaultStatus(){
  if(!skEdit)return '';
  const sk=skEdit,fix=skFixed(sk);
  const freeP=Object.keys(skPts(sk)).filter(p=>!fix.has(p)).length;
  const freeR=(sk.entities||[]).filter(e=>(e.t==='circle'||e.t==='arc')&&!rLocked(sk,e)).length;
  const locked=(freeP===0&&freeR===0&&Object.keys(skPts(sk)).length>0);
  void locked;
  const dof=skDof(sk),Au=sk._audit||{residual:0};
  let s;
  if(Au.residual>0.05&&dof<=0)s=`⚠ Sur-contrainte probable (résidu ${Au.residual.toFixed(2)} mm — voir lignes rouges)`;
  else if(Au.residual>0.05)s=`🔵 Sous-contrainte · résidu ${Au.residual.toFixed(2)} mm`;
  else s=(dof<=0&&Object.keys(skPts(sk)).length>0)?'⚫ Entièrement contrainte':`🔵 Sous-contrainte (${Math.max(dof,0)} libertés)`;
  s+=` · ${sk.entities.length} entités · ${sk.constraints.length} contraintes · ${sk.dims.length} cotes`;
  const H=sk._health;
  if(H)s+=H.opens.length?` · ⚠ ${H.opens.length} bout(s) ouvert(s)`:` · ✓ ${H.loops} contour(s)${H.holes?` · ${H.holes} trou(s)`:''}`;
  return s;
}
function conDesc(sk,c){
  const nm=id=>{const e=entById(sk,id);return e?({line:'ligne',circle:'cercle',arc:'arc',cpoint:'point'}[e.t]||'?')+'…'+String(id).slice(-3):'?';};
  if(c.type==='h')return'─ Horizontal '+nm(c.line);
  if(c.type==='v')return'│ Vertical '+nm(c.line);
  if(c.type==='parallel')return'∥ Parallèle '+nm(c.a)+' / '+nm(c.b);
  if(c.type==='perpendicular')return'⟂ Perpendiculaire '+nm(c.a)+' / '+nm(c.b);
  if(c.type==='equal')return'＝ Égal '+nm(c.a)+' / '+nm(c.b);
  if(c.type==='fix')return'📌 Fixe '+(c.p?('pt…'+String(c.p).slice(-3)):nm(c.ent));
  if(c.type==='tangent')return'⦾ Tangent '+nm(c.line)+' / '+nm(c.ent);
  if(c.type==='tangent2')return'⦾ Tangent '+nm(c.a)+' / '+nm(c.b);
  if(c.type==='coaxial')return'◎ Coaxial '+nm(c.a)+' / '+nm(c.b);
  if(c.type==='symmetric')return'⇔ Symétrie '+nm(c.a)+' / '+nm(c.b)+' | '+nm(c.mid);
  if(c.type==='symmetric')return'⇔ Symétrie '+nm(c.a)+' / '+nm(c.b)+' Δ '+nm(c.mid);
  if(c.type==='coincident')return'⌾ Coïncident pt…'+String(c.a).slice(-3)+' / pt…'+String(c.b).slice(-3)+(c.a===SK_ORIGIN||c.b===SK_ORIGIN?' (origine)':'');
  if(c.type==='oncircle')return'⊙ Point sur '+nm(c.ent)+' pt…'+String(c.p).slice(-3);
  if(c.type==='online')return'∈ Point sur '+nm(c.line)+' pt…'+String(c.p).slice(-3);
  if(c.type==='midpoint')return c.p?('⊕ Milieu pt…'+String(c.p).slice(-3)+' au centre de '+nm(c.line)):('⊕ Milieux égaux '+nm(c.a)+' / '+nm(c.b));
  return c.type;
}
function dimDesc(sk,d){
  if(d.type==='length')return'⟷ Longueur = '+d.value.toFixed(2);
  if(d.type==='distance')return'⟷ Distance = '+d.value.toFixed(2);
  if(d.type==='diameter')return'Ø = '+d.value.toFixed(2);
  if(d.type==='radius')return'R = '+d.value.toFixed(2);
  if(d.type==='angle')return'∠ = '+(d.value*180/Math.PI).toFixed(1)+'°';
  if(d.type==='gap')return'⇔ entraxe = '+d.value.toFixed(2);
  if(d.type==='distline')return'⟂ centre↔ligne = '+d.value.toFixed(2);
  return d.type;
}
function renderSkPanel(){
  if(!skEdit)return;const sk=skEdit;
  $('skStat').textContent=skDefaultStatus()+(sk._refNote?` · ${sk._refNote}`:'');
  if(!skMsg)$('skStatus').textContent=skDefaultStatus();
  // sélection → champs numériques
  const box=$('skSelBox');box.innerHTML='';
  const mkRow=(lab,val,fn)=>{
    const r=document.createElement('div');r.className='skrow';
    const l=document.createElement('label');l.textContent=lab;r.appendChild(l);
    const i=document.createElement('input');i.type='number';i.step='0.5';i.value=(+val).toFixed(2);
    i.onchange=()=>{const f=parseFloat(i.value);if(isFinite(f)){skPushUndo();fn(f);solveSketch(sk);drawSketch2D();renderSkPanel();}};
    r.appendChild(i);box.appendChild(r);
  };
  const addBtn=(label,fn)=>{
    const b=document.createElement('button');b.className='skbtn';b.textContent=label;b.onclick=fn;box.appendChild(b);return b;
  };
  const note=t=>{const s=document.createElement('span');s.className='note';s.textContent=t;box.appendChild(s);};
  if(skSel&&skSel.kind==='ent'){
    const e=entById(sk,skSel.id);
    const pn=e&&e.projName?(e.projName+(e.srcName?' ← '+e.srcName:'')+' · '):'';
    if(!e){skSel=null;note('Entité supprimée.');}
    else if(e.t==='line'){const A=sk.points[e.p1],B=sk.points[e.p2];
      note(`${pn}Ligne${e.ref?' (référence 3D)':(e.construction?' (construction)':'')} · L=${lineLen(sk,e).toFixed(2)} mm`);mkRow('x1',A.x,v=>A.x=v);mkRow('y1',A.y,v=>A.y=v);mkRow('x2',B.x,v=>B.x=v);mkRow('y2',B.y,v=>B.y=v);}
    else if(e.t==='circle'){const C=sk.points[e.pc];note(`${pn}Cercle`+(e.construction?' (construction)':'')+' · Ø='+(e.r*2).toFixed(2)+' mm');mkRow('cx',C.x,v=>C.x=v);mkRow('cy',C.y,v=>C.y=v);mkRow('r',e.r,v=>e.r=Math.max(v,.1));}
    else if(e.t==='arc'){const C=sk.points[e.pc],an=arcAngles(sk,e);note(`${pn}Arc`+(e.construction?' (construction)':'')+' · R='+e.r.toFixed(2)+' mm');mkRow('cx',C.x,v=>C.x=v);mkRow('cy',C.y,v=>C.y=v);mkRow('r',e.r,v=>{e.r=Math.max(v,.1);});if(an){const d1=an.a1*180/Math.PI,d2=an.a2*180/Math.PI;mkRow('a1°',d1,v=>{const a=v*Math.PI/180,A=sk.points[e.pa];A.x=C.x+e.r*Math.cos(a);A.y=C.y+e.r*Math.sin(a);});mkRow('a2°',d2,v=>{const a=v*Math.PI/180,B=sk.points[e.pb];B.x=C.x+e.r*Math.cos(a);B.y=C.y+e.r*Math.sin(a);});}}
    else if(e.t==='cpoint'){const Q=sk.points[e.p];note('Point de construction');mkRow('x',Q.x,v=>Q.x=v);mkRow('y',Q.y,v=>Q.y=v);}
    addBtn('🗑 Supprimer',deleteSkSel);
  }else if(skSel&&skSel.kind==='point'){
    const p=sk.points[skSel.pid];
    if(!p){skSel=null;note('Point supprimé.');}
    else if(skSel.pid===SK_ORIGIN)note('Origine (0,0) — point fixe permanent ⌖ (ancre de cotes et de centres).');
    else{note('Point'+(skFixed(sk).has(skSel.pid)?' 🔒 fixe':''));mkRow('x',p.x,v=>p.x=v);mkRow('y',p.y,v=>p.y=v);addBtn('🗑 Supprimer',deleteSkSel);}
  }else if(skSel&&(skSel.kind==='con'||skSel.kind==='dim')){
    note('Voir listes ci-dessous (✕ pour retirer).');addBtn('🗑 Supprimer',deleteSkSel);
  }else note('Cliquez une entité (outil ➤). Shift = multi-sélection.');
  // santé / docteur : chaque problème a son bouton de réparation
  const hl=$('skHealth');hl.innerHTML='';
  const H0=sk._health;
  const hrow=(txt,btn,fn)=>{
    const d=document.createElement('div');d.className='li';
    const s=document.createElement('span');s.textContent=txt;s.style.flex='1';d.appendChild(s);
    if(btn){const b=document.createElement('button');b.className='skbtn';b.textContent=btn;b.onclick=fn;d.appendChild(b);}
    hl.appendChild(d);
  };
  if(!H0)hrow('—');
  else{
    hrow(`Contours : ${H0.loops}`+(H0.holes?` · trous : ${H0.holes}`:'')+(H0.opens.length?` · ⚠ ${H0.opens.length} bout(s) ouvert(s)`:''),H0.opens.length?'Voir':null,()=>{if(H0.gapPair){skView.cx=(H0.gapPair[0].x+H0.gapPair[1].x)/2;skView.cy=(H0.gapPair[0].y+H0.gapPair[1].y)/2;drawSketch2D();}});
    if(H0.gapPair&&H0.gapD<5)hrow(`Écart ${H0.gapD.toFixed(2)} mm en (${H0.gapPair[0].x.toFixed(1)}, ${H0.gapPair[0].y.toFixed(1)})`,'Refermer',()=>skCloseGap());
    if(H0.dupes.length)hrow(`${H0.dupes.length} point(s) quasi-dupliqué(s)`,'Fusionner',()=>{skPushUndo();H0.dupes.forEach(([a,b])=>{if(sk.points[a]&&sk.points[b])mergePoints(sk,b,a);});afterEdit();});
    if(H0.degen.length)hrow(`${H0.degen.length} entité(s) dégénérée(s)`,'Supprimer',()=>{skPushUndo();sk.entities=sk.entities.filter(e=>!H0.degen.includes(e.id));if(skSel&&H0.degen.includes(skSel.id))skSel=null;afterEdit();});
    H0.selfints.slice(0,5).forEach(p=>hrow(`Croisement en (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`,'Voir',()=>{skView.cx=p.x;skView.cy=p.y;drawSketch2D();}));
  }
  // contraintes
  const cl=$('skConsList');cl.innerHTML='';
  if(!sk.constraints.length)cl.innerHTML='<span class="note">Aucune.</span>';
  sk.constraints.forEach(c=>{
    const d=document.createElement('div');d.className='li'+(skSel&&skSel.kind==='con'&&skSel.id===c.id?' sel':'');
    const wA=((sk._audit||{}).all||[]).find(o=>o.id===c.id);
    const bad=wA&&wA.viol>0.05;
    const s=document.createElement('span');s.textContent=conDesc(sk,c)+(bad?`  ⚠±${wA.viol.toFixed(2)}`:'');d.appendChild(s);
    if(bad)d.style.borderColor='#ff453a';
    const x=document.createElement('span');x.className='x';x.textContent='✕';x.title='Retirer';
    x.onclick=ev=>{ev.stopPropagation();skPushUndo();sk.constraints=sk.constraints.filter(k=>k.id!==c.id);if(skSel&&skSel.id===c.id)skSel=null;solveSketch(sk);drawSketch2D();renderSkPanel();};
    d.appendChild(x);d.onclick=()=>{skSel={kind:'con',id:c.id};drawSketch2D();renderSkPanel();};cl.appendChild(d);
  });
  // cotes
  const dl=$('skDimsList');dl.innerHTML='';
  if(!sk.dims.length)dl.innerHTML='<span class="note">Aucune — outil 📐.</span>';
  sk.dims.forEach(d=>{
    const r=document.createElement('div');r.className='li'+(skSel&&skSel.kind==='dim'&&skSel.id===d.id?' sel':'');
    const wD=((sk._audit||{}).all||[]).find(o=>o.id===d.id);
    const badD=wD&&wD.viol>0.05;
    const s=document.createElement('span');s.textContent=dimDesc(sk,d)+(badD?`  ⚠±${wD.viol.toFixed(2)}`:'');s.style.flex='1';r.appendChild(s);
    if(badD)r.style.borderColor='#ff453a';
    const x=document.createElement('span');x.className='x';x.textContent='✕';x.title='Retirer';
    x.onclick=ev=>{ev.stopPropagation();skPushUndo();sk.dims=sk.dims.filter(k=>k.id!==d.id);if(skSel&&skSel.id===d.id)skSel=null;drawSketch2D();renderSkPanel();};
    r.appendChild(x);
    r.onclick=()=>{skSel={kind:'dim',id:d.id};drawSketch2D();renderSkPanel();};
    r.ondblclick=()=>editDim(d.id);dl.appendChild(r);
  });
}
function skSelectedEnts(){
  const out=[];if(!skEdit)return out;
  if(skSel&&skSel.kind==='ent'){const e=entById(skEdit,skSel.id);if(e)out.push(e);}
  skSelX.forEach(s=>{if(s.kind==='ent'){const e=entById(skEdit,s.id);if(e&&!out.includes(e))out.push(e);}});
  return out;
}
function toggleConstr(){
  if(!skEdit)return;
  const ents=skSelectedEnts().filter(e=>e.t==='line'||e.t==='circle'||e.t==='arc');
  if(!ents.length){skStatus('Sélectionnez une ligne, un cercle ou un arc (➤), puis basculez en construction (X).');return;}
  skPushUndo();
  const toCon=!ents.some(e=>e.construction);
  ents.forEach(e=>{if(toCon)e.construction=true;else delete e.construction;});
  afterEdit();
  skStatus(toCon?'Géométrie de construction ⇄ — trait discontinu, hors profil.':'Géométrie normale ⇄ — participe au profil.');
}
function applyCon(type){
  if(!skEdit)return;const sk=skEdit,ents=skSelectedEnts();
  if(type==='construction'){toggleConstr();return;}
  const lines=ents.filter(e=>e.t==='line');
  if(type==='h'||type==='v'){
    if(!lines.length){skStatus('Sélectionnez d’abord une ou plusieurs lignes (outil ➤).');return;}
    skPushUndo();
    lines.forEach(l=>{if(!hasHV(sk,l.id,type))sk.constraints.push({id:skNewEid(sk),type,line:l.id});});
  }
  if(type==='equal'){
    if(ents.length!==2){skStatus('Égal : sélectionnez exactement 2 lignes ou 2 cercles/arcs.');return;}
    const[a,b]=ents;
    const ok=(a.t==='line'&&b.t==='line')||((a.t==='circle'||a.t==='arc')&&(b.t==='circle'||b.t==='arc'));
    if(!ok){skStatus('Égal : types incompatibles.');return;}
    skPushUndo();
    sk.constraints.push({id:skNewEid(sk),type:'equal',a:a.id,b:b.id});
  }
  if(type==='tangent'){
    if(ents.length!==2){skStatus('Tangence : sélectionnez 1 ligne + 1 cercle/arc (ou 2 cercles).');return;}
    const[a,b]=ents,isL=e=>e.t==='line',isC=e=>e.t==='circle'||e.t==='arc';
    if(isL(a)&&isC(b)){skPushUndo();sk.constraints.push({id:skNewEid(sk),type:'tangent',line:a.id,ent:b.id});skPinTangent(sk,a.id,b.id);}
    else if(isL(b)&&isC(a)){sk.constraints.push({id:skNewEid(sk),type:'tangent',line:b.id,ent:a.id});skPinTangent(sk,b.id,a.id);}
    else if(isC(a)&&isC(b))sk.constraints.push({id:skNewEid(sk),type:'tangent2',a:a.id,b:b.id});
    else{skStatus('Tangence : ligne↔cercle ou cercle↔cercle uniquement.');return;}
  }
  if(type==='coaxial'){
    const curves=ents.filter(e=>e.t==='circle'||e.t==='arc');
    if(ents.length!==2||curves.length!==2){skStatus('Coaxial : sélectionnez exactement 2 cercles ou arcs.');return;}
    const[a,b]=curves;
    if(a.id===b.id||a.pc===b.pc){skStatus('Ces deux courbes ont déjà le même centre (coaxiales ⌾).');return;}
    if((sk.constraints||[]).some(c=>c.type==='coaxial'&&((c.a===a.id&&c.b===b.id)||(c.a===b.id&&c.b===a.id)))){skStatus('Coaxialité déjà posée.');return;}
    skPushUndo();
    sk.constraints.push({id:skNewEid(sk),type:'coaxial',a:a.id,b:b.id});
  }
  if(type==='parallel' || type==='perpendicular'){
    if(lines.length!==2){skStatus((type==='parallel'?'Parallèle':'Perpendiculaire')+' : sélectionnez exactement 2 lignes.');return;}
    const[a,b]=[lines[0].id,lines[1].id];
    // Doublon exact : déjà posée (dans un sens ou dans l'autre) → rien à faire.
    if(type==='parallel'&&skHasParallel(sk,a,b)){skStatus('Parallèle déjà posée ∥.');return;}
    if(type==='perpendicular'&&skHasPerp(sk,a,b)){skStatus('Perpendiculaire déjà posée ⟂.');return;}
    // ─/│ prime sur ⟂ (comme à la création) : H×V implique ⟂, l'ajouter ne sert à rien.
    if(type==='perpendicular'&&skPerpImplied(sk,a,b)){skStatus('⟂ implicite par ─/│ : non ajoutée (déjà acquise).');return;}
    skPushUndo();
    sk.constraints.push({id:skNewEid(sk),type:type,a:lines[0].id,b:lines[1].id});
  }
  if(type==='symmetric'){
    if(lines.length!==3){skStatus('Symétrie : sélectionnez 3 lignes — 2 à symétriser + l’axe en dernier (ex : clic axe en dernier).');return;}
    const a=lines[0],b=lines[1],mid=lines[2];
    if(new Set([a.id,b.id,mid.id]).size!==3){skStatus('Symétrie : 3 lignes distinctes requises.');return;}
    if((sk.constraints||[]).some(c=>c.type==='symmetric'&&((c.a===a.id&&c.b===b.id)||(c.a===b.id&&c.b===a.id))&&c.mid===mid.id)){skStatus('Symétrie déjà posée.');return;}
    skPushUndo();
    sk.constraints.push({id:skNewEid(sk),type:'symmetric',a:a.id,b:b.id,mid:mid.id});
  }
  if(type==='fix'){
    const pts=[];if(skSel&&skSel.kind==='point')pts.push(skSel.pid);
    skSelX.forEach(s=>{if(s.kind==='point'&&!pts.includes(s.pid))pts.push(s.pid);});
    const circ=ents.filter(e=>e.t==='circle'||e.t==='arc');
    const fixAll=new Set([...pts,...lines.flatMap(l=>[l.p1,l.p2])].filter(p=>p!==SK_ORIGIN));
    if(!fixAll.size&&!circ.length){skStatus(pts.includes(SK_ORIGIN)&&!pts.some(p=>p!==SK_ORIGIN)?'Origine (0,0) : déjà fixe.':'Fixe : sélectionnez un point, une ligne ou un cercle.');return;}
    skPushUndo();
    fixAll.forEach(p=>sk.constraints.push({id:skNewEid(sk),type:'fix',p}));
    circ.forEach(e=>sk.constraints.push({id:skNewEid(sk),type:'fix',ent:e.id}));
  }
  if(type==='midpoint'){
    const pts=[];if(skSel&&skSel.kind==='point')pts.push(skSel.pid);
    skSelX.forEach(s=>{if(s.kind==='point'&&!pts.includes(s.pid))pts.push(s.pid);});
    const finish=()=>{skMsg='';solveSketch(sk);drawSketch2D();renderSkPanel();};
    if(lines.length===2&&pts.length===0){
      const[a,b]=lines;
      if(a.id===b.id){skStatus('Milieu : sélectionnez 2 lignes distinctes.');return;}
      if((sk.constraints||[]).some(c=>c.type==='midpoint'&&((c.a===a.id&&c.b===b.id)||(c.a===b.id&&c.b===a.id)))){skStatus('Milieux égaux déjà posés ⊕.');return;}
      skPushUndo();
      sk.constraints.push({id:skNewEid(sk),type:'midpoint',a:a.id,b:b.id});
      finish();skStatus('Milieux égaux ⊕ — les 2 lignes se centrent l\u2019une sur l\u2019autre.');
    }else if(lines.length===1&&pts.length===1){
      if((sk.constraints||[]).some(c=>c.type==='midpoint'&&c.p===pts[0]&&c.line===lines[0].id)){skStatus('Point au milieu déjà posé ⊕.');return;}
      skPushUndo();
      sk.constraints.push({id:skNewEid(sk),type:'midpoint',p:pts[0],line:lines[0].id});
      finish();skStatus('Point au milieu de la ligne ⊕ — la ligne reste entière.');
    }else{
      skStatus('Milieu ⊕ : sélectionnez 2 lignes (milieux égaux) ou 1 point + 1 ligne (point au centre).');
    }
    return;
  }
  skMsg='';solveSketch(sk);drawSketch2D();renderSkPanel();
}
function deleteSkSel(){
  // Supprime la sélection SIMPLE ou MULTIPLE (fenêtre, Shift+clic) : entités, points
  // (+ leurs entités attachées), contraintes et cotes. Un seul undo pour tout le lot.
  if(!skEdit)return;const sk=skEdit;
  const killEnts=new Set(),killPts=new Set(),killCons=new Set(),killDims=new Set();
  const take=s=>{
    if(!s)return;
    if(s.kind==='ent')killEnts.add(s.id);
    else if(s.kind==='point')killPts.add(s.pid);
    else if(s.kind==='con')killCons.add(s.id);
    else if(s.kind==='dim')killDims.add(s.id);
  };
  take(skSel);(skSelX||[]).forEach(take);
  if(!killEnts.size&&!killPts.size&&!killCons.size&&!killDims.size){skStatus('Rien à supprimer — sélectionnez (fenêtre, Shift+clic).');return;}
  const blockedOrigin=killPts.has(SK_ORIGIN);
  if(blockedOrigin)killPts.delete(SK_ORIGIN);
  skPushUndo();
  if(killEnts.size)sk.entities=sk.entities.filter(x=>!killEnts.has(x.id));
  if(killPts.size)sk.entities=sk.entities.filter(x=>!(x.t==='line'&&(killPts.has(x.p1)||killPts.has(x.p2)))&&!((x.t==='circle'||x.t==='arc')&&killPts.has(x.pc))&&!(x.t==='arc'&&(killPts.has(x.pa)||killPts.has(x.pb)))&&!(x.t==='cpoint'&&killPts.has(x.p)));
  if(killCons.size)sk.constraints=sk.constraints.filter(c=>!killCons.has(c.id));
  if(killDims.size)sk.dims=sk.dims.filter(d=>!killDims.has(d.id));
  const n=killEnts.size+killPts.size+killCons.size+killDims.size;
  skSel=null;skSelX=[];cleanupSk(sk);solveSketch(sk); // orphelins + cotes orphelines nettoyés
  skStatus((blockedOrigin?'L’origine (0,0) est permanente — gardée. ':'')+n+' élément(s) supprimé(s) — Ctrl+Z pour annuler.');
  drawSketch2D();renderSkPanel();
}
/* ----- transactions (undo/redo) : chaque action = snapshot, rien n'est destructeur ----- */
let skUndoStack=[],skRedoStack=[];
function skSnap(){return JSON.parse(JSON.stringify({points:skEdit.points,entities:skEdit.entities,constraints:skEdit.constraints,dims:skEdit.dims}));}
function skPushUndo(){if(!skEdit)return;skUndoStack.push(skSnap());if(skUndoStack.length>100)skUndoStack.shift();skRedoStack=[];skUndoBtn();}
function skRestore(s){skEdit.points=s.points;skEdit.entities=s.entities;skEdit.constraints=s.constraints;skEdit.dims=s.dims;solveSketch(skEdit);cleanupSk(skEdit);skRefreshHealth();drawSketch2D();renderSkPanel();skUndoBtn();}
function skUndoTrans(){if(!skEdit||!skUndoStack.length){skStatus('Rien à annuler.');return;}skRedoStack.push(skSnap());skRestore(skUndoStack.pop());skStatus('Annulé ↩.');}
function skRedoTrans(){if(!skEdit||!skRedoStack.length){skStatus('Rien à rétablir.');return;}skUndoStack.push(skSnap());skRestore(skRedoStack.pop());skStatus('Rétabli ↪.');}
function skUndoBtn(){const u=$('skUndo'),r=$('skRedo');if(u)u.disabled=!skUndoStack.length;if(r)r.disabled=!skRedoStack.length;}
/* ----- santé d'esquisse (docteur) : bouts ouverts, doublons, dégénérés, croisements ----- */
function skRefreshHealth(){if(skEdit){skEdit._health=skHealth(skEdit);skEdit._audit=skAudit(skEdit);}}
/* ----- audit du solveur : résidu mesuré + libertés comptées + pires violations ----- */
function skAudit(sk){
  const P=sk.points||{},out=[];
  const push=(id,desc,viol)=>{out.push({id,desc,viol});};
  (sk.dims||[]).forEach(d=>{
    if(d.type==='length'){const l=entById(sk,d.line);if(l&&l.t==='line'){
      const A=P[l.p1],B=P[l.p2];
      const cur=(d.orient==='h'||d.orient==='v')&&A&&B?dimMeasureOf(A,B,d.orient):lineLen(sk,l);
      push(d.id,'longueur',Math.abs(cur-d.value));}}
    if(d.type==='distance'){const A=P[d.a],B=P[d.b];if(A&&B)push(d.id,'distance',Math.abs(dimMeasureOf(A,B,d.orient)-d.value));}
    if(d.type==='diameter'||d.type==='radius'){const e=entById(sk,d.ent);if(e&&(e.t==='circle'||e.t==='arc'))push(d.id,d.type,Math.abs((d.type==='diameter'?e.r*2:e.r)-d.value));}
    if(d.type==='angle'){const fr=angleFrame(sk,d);
      if(fr){const TAU=Math.PI*2;
        const want=angleWant(d,fr.delta);
        let e=want-fr.delta;
        if(e>Math.PI)e-=TAU;else if(e<-Math.PI)e+=TAU;
        push(d.id,'angle',Math.abs(e));}}
    if(d.type==='gap'){const A=entById(sk,d.a),B=entById(sk,d.b);
      if(A&&B&&A.t==='line'&&B.t==='line'){const P0=sk.points;
        const A1=P0[A.p1],A2=P0[A.p2],B1=P0[B.p1],B2=P0[B.p2];
        if(A1&&A2&&B1&&B2){const dx=A2.x-A1.x,dy=A2.y-A1.y,L=Math.hypot(dx,dy)||1e-9;
          push(d.id,'entraxe',Math.abs(Math.abs((B1.x-A1.x)*(-dy/L)+(B1.y-A1.y)*(dx/L))-d.value));}}}
    if(d.type==='distline'){const l=entById(sk,d.line),Pt=P[d.p];
      if(l&&l.t==='line'&&Pt){const A=P[l.p1],B=P[l.p2];
        if(A&&B){const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy)||1e-9;
          push(d.id,'⟂ centre↔ligne',Math.abs(Math.abs((Pt.x-A.x)*(-dy/L)+(Pt.y-A.y)*(dx/L))-d.value));}}}
  });
  (sk.constraints||[]).forEach(c=>{
    if(c.type==='h'||c.type==='v'){const l=entById(sk,c.line);if(l&&l.t==='line'){const A=P[l.p1],B=P[l.p2];if(A&&B)push(c.id,c.type,Math.abs(c.type==='h'?A.y-B.y:A.x-B.x));}}
    if(c.type==='equal'){const A=entById(sk,c.a),B=entById(sk,c.b);
      if(A&&B){if(A.t==='line'&&B.t==='line')push(c.id,'égal',Math.abs(lineLen(sk,A)-lineLen(sk,B)));
        else if((A.t==='circle'||A.t==='arc')&&(B.t==='circle'||B.t==='arc'))push(c.id,'égal',Math.abs(A.r-B.r));}}
    if(c.type==='tangent'){const L=entById(sk,c.line),E=entById(sk,c.ent);
      if(L&&E&&L.t==='line'&&(E.t==='circle'||E.t==='arc')){const A=P[L.p1],B=P[L.p2],CC=P[E.pc];
        if(A&&B&&CC){const dx=B.x-A.x,dy=B.y-A.y,Ln=Math.hypot(dx,dy)||1e-9;
          const t=((CC.x-A.x)*dx+(CC.y-A.y)*dy)/(Ln*Ln);
          // distance au SEGMENT : le pied (projection du centre) doit rester dans le segment,
          // sinon le cercle semble décollé à l'écran même si la droite infinie est tangente
          let seg;
          if(t<0)seg=Math.hypot(CC.x-A.x,CC.y-A.y);
          else if(t>1)seg=Math.hypot(CC.x-B.x,CC.y-B.y);
          else seg=Math.abs((CC.x-A.x)*(-dy/Ln)+(CC.y-A.y)*(dx/Ln));
          push(c.id,'tangence',Math.abs(seg-E.r));}}}
    if(c.type==='symmetric'){
      const A=entById(sk,c.a),B=entById(sk,c.b),M=entById(sk,c.mid);
      if(A&&B&&M&&A.t==='line'&&B.t==='line'&&M.t==='line'){
        const P0=sk.points,A1=P0[A.p1],A2=P0[A.p2],B1=P0[B.p1],B2=P0[B.p2],M1=P0[M.p1],M2=P0[M.p2];
        if(A1&&A2&&B1&&B2&&M1&&M2){
          const mx=M2.x-M1.x,my=M2.y-M1.y,ml=Math.hypot(mx,my)||1e-9,ux=mx/ml,uy=my/ml;
          const mp=(Px,Py)=>{const wx=Px-M1.x,wy=Py-M1.y,pr=wx*ux+wy*uy;return{x:M1.x+ux*pr,y:M1.y+uy*pr};}
          const ra1=(()=>{const p=mp(A1.x,A1.y);return{x:2*p.x-A1.x,y:2*p.y-A1.y};})();
          const ra2=(()=>{const p=mp(A2.x,A2.y);return{x:2*p.x-A2.x,y:2*p.y-A2.y};})();
          const d=Math.min(Math.hypot(ra1.x-B1.x,ra1.y-B1.y)+Math.hypot(ra2.x-B2.x,ra2.y-B2.y),
                           Math.hypot(ra1.x-B2.x,ra1.y-B2.y)+Math.hypot(ra2.x-B1.x,ra2.y-B1.y));
          push(c.id,'symétrie',d);
        }
      }
    }
    if(c.type==='tangent2'){const A=entById(sk,c.a),B=entById(sk,c.b);
      if(A&&B){const CA=P[A.pc],CB=P[B.pc];
        if(CA&&CB)push(c.id,'tangence',Math.abs(Math.hypot(CB.x-CA.x,CB.y-CA.y)-(A.r+B.r)));}}
    if(c.type==='coaxial'){const A=entById(sk,c.a),B=entById(sk,c.b);
      if(A&&B&&(A.t==='circle'||A.t==='arc')&&(B.t==='circle'||B.t==='arc')){const CA=P[A.pc],CB=P[B.pc];
        if(CA&&CB)push(c.id,'coaxiaux',Math.hypot(CB.x-CA.x,CB.y-CA.y));}}
    if(c.type==='coincident'){const A=P[c.a],B=P[c.b];
      if(A&&B)push(c.id,'coïncident',Math.hypot(B.x-A.x,B.y-A.y));}
    if(c.type==='oncircle'){const Pt=P[c.p],E=entById(sk,c.ent);
      if(Pt&&E&&(E.t==='circle'||E.t==='arc')){const CC=P[E.pc];
        if(CC)push(c.id,'point sur '+({circle:'cercle',arc:'arc'}[E.t]),Math.abs(Math.hypot(Pt.x-CC.x,Pt.y-CC.y)-E.r));}}
    if(c.type==='online'){const Pt=P[c.p],l=entById(sk,c.line);
      if(Pt&&l&&l.t==='line'){const A=P[l.p1],B=P[l.p2];
        if(A&&B){const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy);
          if(L>1e-9)push(c.id,'point sur ligne',Math.abs((Pt.x-A.x)*(-dy/L)+(Pt.y-A.y)*(dx/L)));}}}
    if(c.type==='midpoint'){
      if(c.p!=null){const Pt=P[c.p],l=entById(sk,c.line);
        if(Pt&&l&&l.t==='line'){const A=P[l.p1],B=P[l.p2];
          if(A&&B)push(c.id,'milieu',Math.hypot(Pt.x-(A.x+B.x)/2,Pt.y-(A.y+B.y)/2));}}
      else if(c.a&&c.b){const A=entById(sk,c.a),B=entById(sk,c.b);
        if(A&&B&&A.t==='line'&&B.t==='line'){const A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2];
          if(A1&&A2&&B1&&B2)push(c.id,'milieux égaux',Math.hypot((A1.x+A2.x)/2-(B1.x+B2.x)/2,(A1.y+A2.y)/2-(B1.y+B2.y)/2));}}
    }
  });
  let res=0;out.forEach(o=>{if(o.viol>res)res=o.viol;});
  out.sort((a,b)=>b.viol-a.viol);
  return{residual:res,all:out};
}
function skDof(sk){
  const P=sk.points||{};
  const nR=(sk.entities||[]).filter(e=>e.t==='circle'||e.t==='arc').length;
  const nO=P[SK_ORIGIN]?2:0; // l'origine est toujours fixe (2 DOF en moins)
  let eq=0;
  (sk.constraints||[]).forEach(c=>{eq+=(c.type==='fix'?(c.ent?3:2):(c.type==='symmetric'?4:((c.type==='coincident'||c.type==='coaxial'||c.type==='midpoint')?2:1)));});
  eq+=(sk.dims||[]).length;
  return 2*Object.keys(P).length+nR-eq-nO;
}
function pidNear(sk,x,y,maxD){let best=null,bd=maxD;Object.keys(skPts(sk)).forEach(pid=>{const p=sk.points[pid];const d=Math.hypot(p.x-x,p.y-y);if(d<bd){bd=d;best=pid;}});return best;}
function skHealth(sk){
  const tr=skLoopTrace(sk),P=sk.points||{};
  const ends=tr.opens;
  let gapPair=null,gapD=1e9;
  for(let i=0;i<ends.length;i++)for(let j=i+1;j<ends.length;j++){
    const d=Math.hypot(ends[i].x-ends[j].x,ends[i].y-ends[j].y);
    if(d<gapD){gapD=d;gapPair=[ends[i],ends[j]];}
  }
  const pids=Object.keys(P),dupes=[];
  const coinc=new Set(); // points volontairement coïncidents (contrainte) → pas doublon
  (sk.constraints||[]).forEach(c=>{if(c.type==='coincident'){if(c.a)coinc.add(c.a);if(c.b)coinc.add(c.b);}});
  for(let i=0;i<pids.length;i++)for(let j=i+1;j<pids.length;j++){
    if(pids[i]===SK_ORIGIN||pids[j]===SK_ORIGIN)continue; // l'origine n'est jamais un « doublon »
    if(coinc.has(pids[i])&&coinc.has(pids[j]))continue;
    const A=P[pids[i]],B=P[pids[j]];
    if(Math.hypot(A.x-B.x,A.y-B.y)<1e-3)dupes.push([pids[i],pids[j]]);
  }
  const degen=[];
  (sk.entities||[]).forEach(e=>{
    if(e.construction||e.ref)return; // hors profil : pas d'alerte
    if(e.t==='line'){const A=P[e.p1],B=P[e.p2];if(A&&B&&Math.hypot(B.x-A.x,B.y-A.y)<1e-6)degen.push(e.id);}
    if((e.t==='circle'||e.t==='arc')&&!(e.r>1e-6))degen.push(e.id);
  });
  const segs=(sk.entities||[]).filter(e=>e.t==='line'&&!e.construction&&!e.ref&&P[e.p1]&&P[e.p2]).map(e=>({id:e.id,A:P[e.p1],B:P[e.p2]}));
  const selfints=[];
  for(let i=0;i<segs.length;i++)for(let j=i+1;j<segs.length;j++){
    const s1=segs[i],s2=segs[j];
    if(s1.A===s2.A||s1.A===s2.B||s1.B===s2.A||s1.B===s2.B)continue; // jonction structurelle normale
    const h=interLineLine(s1.A,s1.B,s2.A,s2.B);
    if(h&&h.t>1e-6&&h.t<1-1e-6&&h.u>1e-6&&h.u<1-1e-6)selfints.push({x:h.x,y:h.y});
  }
  let nH=0;tr.solids.forEach(s=>nH+=(s.holes||[]).length);nH+=tr.circleHoles.length;
  return{loops:tr.solids.length+tr.circlesOut.length,holes:nH,opens:ends,gapPair,gapD,dupes,degen,selfints};
}
function skCloseGap(){
  if(!skEdit)return;const H=skEdit._health;
  if(!H||!H.gapPair){skStatus('Rien à refermer.');return;}
  const[a,b]=H.gapPair;
  const pa=pidNear(skEdit,a.x,a.y,50),pb=pidNear(skEdit,b.x,b.y,50);
  if(!pa||!pb||pa===pb){skStatus('Refermer : points introuvables.');return;}
  skPushUndo();mergePoints(skEdit,pb,pa);afterEdit();skStatus('Bouts refermés ⌖.');
}
function afterEdit(){if(!skEdit)return;solveSketch(skEdit);cleanupSk(skEdit);skRefreshHealth();drawSketch2D();renderSkPanel();}
function skClearAll(){if(!skEdit||!confirm('Tout effacer ?'))return;skPushUndo();skEdit.entities=[];skEdit.points={};skEdit.constraints=[];skEdit.dims=[];ensureOrigin(skEdit);skSel=null;skSelX=[];skChain=null;drawSketch2D();renderSkPanel();}
let skDimLine=null, skDimRef=null; // 1re ligne armée (Shift+clic) pour cote paire angle/entraxe (sketch ou 3D ref)
function lineAngle(sk,A,B){
  const P=sk.points,A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2];
  if(!A1||!A2||!B1||!B2)return 0;
  const sA=Math.atan2(A2.y-A1.y,A2.x-A1.x),sB=Math.atan2(B2.y-B1.y,B2.x-B1.x);
  const x=((sB-sA)%Math.PI+Math.PI)%Math.PI;
  return Math.min(x,Math.PI-x); // angle entre lignes non orientées ∈ [0,π/2] — indépendant de l'ordre
}
function angleFrame(sk,d){
  // Secteur : V = sommet partagé (stable) ou pseudo-sommet ; sA/sB = rayons V→extrémités
  // lointaines (toujours du bon côté, indépendant de l'ordre p1/p2) ; delta ∈ (-π,π].
  const A=entById(sk,d.a),B=entById(sk,d.b);
  if(!A||!B||A.t!=='line'||B.t!=='line')return null;
  const P=sk.points,A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2];
  if(!A1||!A2||!B1||!B2)return null;
  const V=angleVertex(sk,d);if(!V)return null;
  const fA=(Math.hypot(A1.x-V.x,A1.y-V.y)>Math.hypot(A2.x-V.x,A2.y-V.y))?A1:A2;
  const fB=(Math.hypot(B1.x-V.x,B1.y-V.y)>Math.hypot(B2.x-V.x,B2.y-V.y))?B1:B2;
  const sA=Math.atan2(fA.y-V.y,fA.x-V.x),sB=Math.atan2(fB.y-V.y,fB.x-V.x);
  const TAU=Math.PI*2;
  let delta=(sB-sA)%TAU;if(delta<=-Math.PI)delta+=TAU;else if(delta>Math.PI)delta-=TAU;
  return{V,sA,sB,delta};
}
function createAngleDim(sk,A,B){ // cote d'angle depuis le secteur RÉEL |delta|∈(0,π) — jamais l'angle aigu lineAngle (=renversement)
  if(!sk||!A||!B||A.t!=='line'||B.t!=='line')return null;
  const fr=angleFrame(sk,{a:A.id,b:B.id});
  const ad=fr?Math.abs(fr.delta):0;
  if(!fr||ad<0.03||Math.PI-ad<0.03)return null; // trop proche de 0°/180° : non cotable
  const dup=findDupDim(sk,{type:'angle',a:A.id,b:B.id});
  if(dup)return dup.id;
  skPushUndo();
  const id=skNewEid(sk);
  sk.dims.push({id,type:'angle',a:A.id,b:B.id,value:+ad.toFixed(4),ccw:fr.delta>0?1:0,ox:0,oy:0});
  return id;
}
function lineGap(sk,A,B){
  const P=sk.points,A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2];
  if(!A1||!A2||!B1)return 0;
  const dx=A2.x-A1.x,dy=A2.y-A1.y,L=Math.hypot(dx,dy)||1e-9;
  // Distance perpendiculaire moyenne : identique de part et d'autre pour deux droites
  // exactement parallèles, et bien plus juste que le seul point B1 quand elles ne le sont
  // qu'approximativement (esquisse sous-contrainte).
  if(!B2)return Math.abs((B1.x-A1.x)*(-dy/L)+(B1.y-A1.y)*(dx/L));
  const d1=Math.abs((B1.x-A1.x)*(-dy/L)+(B1.y-A1.y)*(dx/L));
  const d2=Math.abs((B2.x-A1.x)*(-dy/L)+(B2.y-A1.y)*(dx/L));
  return (d1+d2)/2;
}
// Angle entre les DEUX DROITES, en radians ∈ [0, π/2] — calculé sur les VECTEURS DE
// DIRECTION, donc exact, indépendant de l'ordre des extrémités et surtout indépendant de
// l'existence d'un sommet commun.
// POURQUOI : le test « parallèles ? » se faisait sur angleFrame(), qui part d'un SOMMET.
// Or deux lignes parallèles distinctes (côté d'une rainure, deux lignes de construction
// distantes) n'ont AUCUN sommet commun : angleVertex() renvoie alors un pseudo-sommet
// (milieu du segment joignant les milieux des deux lignes) et l'angle mesuré est alors
// ARBITRAIRE. Constaté sur le fichier réel de l'utilisateur (Esquisse 5) : deux lignes
// horizontales avec une contrainte « parallel » entre elles, écartées de 3.037 mm, étaient
// classées « angle » à 175,74° — parce que |π − 175.74°| = 4.26° dépassait la tolérance de
// 1.7°. Le même coup par chance marchait pour deux lignes verticales (179.81° ≤ 1.7° de
// π). Le comportement dépendait donc de l'orientation, pas de la géométrie.
function skLinesAngle(sk,A,B){
  const P=sk.points,A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2];
  if(!A1||!A2||!B1||!B2)return null;
  const ax=A2.x-A1.x,ay=A2.y-A1.y,bx=B2.x-B1.x,by=B2.y-B1.y;
  const la=Math.hypot(ax,ay),lb=Math.hypot(bx,by);
  if(la<1e-9||lb<1e-9)return null;               // ligne dégénérée
  return Math.atan2(Math.abs(ax*by-ay*bx)/(la*lb),Math.abs(ax*bx+ay*by)/(la*lb));
}
// Partagent-elles un sommet commun (donc un angle réellement interprétable) ?
function skShareVertex(sk,A,B){
  return !!(A&&B&&(A.p1===B.p1||A.p1===B.p2||A.p2===B.p1||A.p2===B.p2));
}
// Angle à afficher pour une cote d'angle : sommet commun → secteur réel (angleFrame) ;
// lignes disjointes → angle entre les directions, seul sens défini (le pseudo-sommet
// d'angleFrame donnerait un nombre arbitraire).
function skAngleForDim(sk,A,B){
  if(skShareVertex(sk,A,B)){
    const fr=angleFrame(sk,{a:A.id,b:B.id});
    if(fr)return Math.abs(fr.delta);
  }
  const v=skLinesAngle(sk,A,B);
  if(v===null)return 0;
  if(skShareVertex(sk,A,B))return v;
  // disjointes : le sens est celui des extrémités p1→p2 (le seul dessinable)
  const P=sk.points,A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2];
  const ax=A2.x-A1.x,ay=A2.y-A1.y,bx=B2.x-B1.x,by=B2.y-B1.y;
  const cr=ax*by-ay*bx,dt=ax*bx+ay*by;
  return Math.abs(Math.atan2(cr,dt));            // |δ| ∈ [0, π]
}
// Tolérance de parallélisme : 3°. Un angle entre deux droites inférieur à 3° est un cas
// dégénéré, alors que des lignes « parallel » sous-contraintes peuvent traîner à 1-2°.
// Au-dessus, on bascule en entraxe — le sens le plus utile, et jamais un angle de 0,05°.
const SK_PARALLEL_TOL=3*Math.PI/180;
function tryExtendDim(dd,ent,pid){ // pose type Fusion : pendant qu'une cote vit, cliquer une 2ᵉ entité la convertit
  const sk=skEdit;if(!sk||!dd)return false;
  const toDistLine=(ptId,lineId)=>{
    const Pt=sk.points[ptId],l=entById(sk,lineId);
    if(!Pt||!l||l.t!=='line')return false;
    const A=sk.points[l.p1],B=sk.points[l.p2];if(!A||!B)return false;
    const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy)||1e-9;
    const v=Math.abs((Pt.x-A.x)*(-dy/L)+(Pt.y-A.y)*(dx/L));
    skPushUndo();
    dd.type='distline';dd.p=ptId;dd.line=lineId;delete dd.ent;delete dd.w;delete dd.sl;
    dd.value=+Math.max(v,0.01).toFixed(2);
    afterEdit();skStatus('Converti en ⟂ centre↔ligne = '+dd.value.toFixed(2)+' — cliquez (vide) pour poser.');
    return true;
  };
  if(dd.type==='length'){
    const src=entById(sk,dd.line);if(!src)return false;
    if(ent&&ent.t==='line'&&ent.id!==dd.line){ // 2ᵉ ligne → entraxe (//) ou angle (sécantes)
      skPushUndo();
      // Parallélisme décidé sur les VECTEURS DE DIRECTION (skLinesAngle), pas sur un
      // sommet : voir le commentaire de skLinesAngle — avec le sommet, deux lignes
      // parallèles sans sommet commun étaient classées « angle » (Esquisse 5 : 175.74°
      // au lieu d'un entraxe de 3.037 mm).
      const va=skLinesAngle(sk,src,ent);
      const par=(va!==null&&va<SK_PARALLEL_TOL);
      if(par){
        dd.type='gap';dd.a=src.id;dd.b=ent.id;delete dd.line;delete dd.w;
        dd.value=+lineGap(sk,src,ent).toFixed(2);
        afterEdit();skStatus('Converti en entraxe ⇔ '+dd.value.toFixed(2)+' (lignes '+
          (va*180/Math.PI).toFixed(2)+'° d\'écart) — cliquez pour poser.');
      }else{
        const ad=skAngleForDim(sk,src,ent);
        dd.type='angle';dd.a=src.id;dd.b=ent.id;delete dd.line;delete dd.w;
        dd.value=+ad.toFixed(4);
        dd.ccw=skShareVertex(sk,src,ent)?(angleFrame(sk,{a:src.id,b:ent.id})||{delta:0}).delta>0?1:0:0;
        afterEdit();skStatus('Converti en angle ∠'+(ad*180/Math.PI).toFixed(1)+'° — déplacez (rayon) puis cliquez.');
      }
      return true;
    }
    if(ent&&(ent.t==='circle'||ent.t==='arc')&&ent.pc)return toDistLine(ent.pc,dd.line); // cercle → centre↔ligne
    if(pid&&!(ent&&ent.id===dd.line))return toDistLine(pid,dd.line); // point/cpoint → centre↔ligne
    return false;
  }
  if(dd.type==='diameter'||dd.type==='radius'){
    const src=entById(sk,dd.ent);if(!src||!src.pc)return false;
    if(ent&&(ent.t==='circle'||ent.t==='arc')&&ent.id!==dd.ent&&ent.pc){ // 2ᵉ cercle → entraxe centres
      const A=sk.points[src.pc],B=sk.points[ent.pc];if(!A||!B)return false;
      skPushUndo();
      dd.type='distance';dd.a=src.pc;dd.b=ent.pc;delete dd.ent;delete dd.w;delete dd.sl;
      dd.value=+Math.hypot(B.x-A.x,B.y-A.y).toFixed(2);
      afterEdit();skStatus('Converti en entraxe centres ⟷ '+dd.value.toFixed(2)+' — cliquez pour poser.');
      return true;
    }
    if(ent&&ent.t==='line')return toDistLine(src.pc,ent.id); // ligne → centre du cercle ↔ ligne
    if(pid&&!(ent&&(ent.id===dd.ent||ent.pc===src.pc))){ // point (dont origine) → distance centres
      const A=sk.points[src.pc],B=sk.points[pid];
      if(A&&B){skPushUndo();
        dd.type='distance';dd.a=src.pc;dd.b=pid;delete dd.ent;delete dd.w;delete dd.sl;
        dd.value=+Math.hypot(B.x-A.x,B.y-A.y).toFixed(2);
        afterEdit();skStatus('Converti en distance centres ⟷ '+dd.value.toFixed(2)+' — cliquez pour poser.');
        return true;}
    }
    return false;
  }
  return false; // distline/gap/angle/distance : déjà combinée → le clic suivant pose
}
function samePair(x,y,a,b){return(x===a&&y===b)||(x===b&&y===a);}
function findDupDim(sk,spec){
  // true doublon (même type, mêmes refs, ordre indifférent) ou null. Jamais de cote en double.
  return (sk.dims||[]).find(d=>{
    if(!d||d.type!==spec.type)return false;
    if(spec.type==='length')return d.line===spec.line;
    if(spec.type==='diameter'||spec.type==='radius')return d.ent===spec.ent;
    if(spec.type==='distance')return samePair(d.a,d.b,spec.a,spec.b);
    if(spec.type==='distline')return d.line===spec.line&&d.p===spec.p;
    if(spec.type==='gap'||spec.type==='angle')return samePair(d.a,d.b,spec.a,spec.b);
    return false;
  })||null;
}
function reuseDim(dup){
  if(!skEdit||!dup)return false;
  skSel={kind:'dim',id:dup.id};skSelX=[];
  skStatus('Cote déjà existante — sélectionnée (pas de doublon).');
  drawSketch2D();renderSkPanel();
  return true;
}
function dimClick(x,y,shift){
  const sk=skEdit;if(!sk)return;
  const ent0=nearestEntity(sk,x,y,SK_PICK);
  const ref0=nearestRef(sk,x,y,SK_PICK);
  const pick0=ent0||ref0;
  if(shift&&pick0){
    const isRef0=!!ref0 && !ent0;
    const id0=isRef0 ? `ref_${ref0.idx}` : ent0.id;
    // si 1re pick déjà armée
    if((skDimLine||skDimRef) && (skDimLine!==id0 && skDimRef!==ref0?.idx)){
      let A,B, aIsRef=false, bIsRef=isRef0;
      if(skDimRef!==null){
        const r=sk._refs[skDimRef];
        const tmpId=createRefLine(sk, r);
        A=entById(sk,tmpId); aIsRef=true;
      } else A=entById(sk,skDimLine);
      if(isRef0){
        const tmpId=createRefLine(sk, ref0.ref);
        B=entById(sk,tmpId); bIsRef=true;
      } else B=ent0;
      if(A&&B){
        // même règle qu'au clic simple : parallélisme sur les DIRECTIONS, angle sur le
        // secteur réel quand les lignes partagent un sommet.
        const va=skLinesAngle(sk,A,B);
        const par=(va!==null&&va<SK_PARALLEL_TOL);
        let newId=null;
        if(par){
          const dup=findDupDim(sk,{type:'gap',a:A.id,b:B.id});
          if(dup){skDimLine=null;skDimRef=null;reuseDim(dup);return;}
          skPushUndo();
          const g=lineGap(sk,A,B);
          newId=skNewEid(sk);
          sk.dims.push({id:newId,type:'gap',a:A.id,b:B.id,value:+g.toFixed(2),ox:0,oy:0});
          skStatus('Cote entraxe créée'+(aIsRef||bIsRef?' (dont 3D)':'')+' — déplacez puis cliquez pour poser.');
        }else{
          const ad=skAngleForDim(sk,A,B);
          const ccw=skShareVertex(sk,A,B)?((angleFrame(sk,{a:A.id,b:B.id})||{delta:0}).delta>0?1:0):0;
          const dup=findDupDim(sk,{type:'angle',a:A.id,b:B.id});
          if(dup){skDimLine=null;skDimRef=null;reuseDim(dup);return;}
          skPushUndo();
          newId=skNewEid(sk);
          sk.dims.push({id:newId,type:'angle',a:A.id,b:B.id,value:+ad.toFixed(4),ccw,ox:0,oy:0});
          skStatus('Cote angle créée ∠'+(ad*180/Math.PI).toFixed(1)+'° — déplacez (rayon) puis cliquez pour poser.');
        }
        skDimLine=null; skDimRef=null; skDimPlace={id:newId}; afterEdit();return;
      }
    }
    if(isRef0){ skDimRef=ref0.idx; skDimLine=null; skStatus('Cote paire : 1re ligne 3D sélectionnée (violet) → cliquez la 2ᵉ ligne.'); }
    else { skDimLine=ent0.id; skDimRef=null; skStatus('Cote paire : cliquez la 2ᵉ ligne (angle si sécantes, entraxe si //). Re-clic = longueur.'); }
    drawSketch2D();return;
  }
  if(skPendPt){
    const pid=nearestPoint(sk,x,y,SK_SNAP);
    const ent=nearestEntity(sk,x,y,SK_PICK);
    const other=pid||(ent&&ent.t==='cpoint'?ent.p:null);
    if(other&&other!==skPendPt){
      const A=sk.points[skPendPt],B=sk.points[other];
      if(A&&B){skPushUndo();const newId=skNewEid(sk);
        sk.dims.push({id:newId,type:'distance',a:skPendPt,b:other,value:+Math.hypot(B.x-A.x,B.y-A.y).toFixed(2)});
        skDimPlace={id:newId};skStatus('Cote distance — déplacez puis cliquez pour poser.');}
    }
    skPendPt=null;afterEdit();return;
  }
  const ent=nearestEntity(sk,x,y,SK_PICK);
  if(ent&&ent.t==='line'){skDimLine=null;skDimRef=null;skPushUndo();const newId=skNewEid(sk);
    sk.dims.push({id:newId,type:'length',line:ent.id,value:+lineLen(sk,ent).toFixed(2)});
    skDimPlace={id:newId};skStatus('Cote longueur — déplacez puis cliquez pour poser.');afterEdit();return;}
  if(ent&&ent.t==='circle'){const newId=skNewEid(sk);skPushUndo();
    sk.dims.push({id:newId,type:'diameter',ent:ent.id,value:+(ent.r*2).toFixed(2)});
    skDimPlace={id:newId};skStatus('Cote Ø — cliquez un 2ᵉ cercle (entraxe) ou une ligne (dist. centre), ou posez (vide).');afterEdit();return;}
  if(ent&&ent.t==='arc'){const newId=skNewEid(sk);skPushUndo();
    sk.dims.push({id:newId,type:'radius',ent:ent.id,value:+ent.r.toFixed(2)});
    skDimPlace={id:newId};skStatus('Cote R — cliquez un 2ᵉ cercle (entraxe) ou une ligne (dist. centre), ou posez (vide).');afterEdit();return;}
  const ref=nearestRef(sk,x,y,SK_PICK);
  if(ref){
    skPushUndo();
    const nid=createRefLine(sk, ref.ref);
    skStatus('Référence 3D projetée → ligne de construction créée (fixe). Sélectionnez-la pour coter (Shift+2 lignes).');
    afterEdit();return;
  }
  const pid=nearestPoint(sk,x,y,SK_SNAP);
  const p0=pid||(ent&&ent.t==='cpoint'?ent.p:null);
  if(p0){skPendPt=p0;skStatus('Cote distance : cliquez un second point.');drawSketch2D();return;}
  skStatus('Cote : ligne=longueur, cercle=Ø, arc=R, 2 points=distance · Shift+clic 2 lignes = angle/entraxe · étiquettes déplaçables au glisser.');
}

