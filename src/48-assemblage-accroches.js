/* ---------- points d'accroche (V0.7.2) ----------
   Aligner (et les liaisons) peuvent viser, en plus des repères (origine, repères de construction),
   un POINT D'ACCROCHE de la géométrie d'un composant, lu sur sa forme EXACTE (c._exact) :
     · face plane : centre (centre de surface) et points cardinaux du rectangle qui l'englobe
       dans son plan (nord, sud, est, ouest et les quatre coins) — Z = normale sortante ; vue
       de l'extérieur, face horizontale : est = +X du composant ; sinon nord = vers le haut ;
     · face cylindrique : début, milieu et fin de l'axe — Z = axe, orienté dans le sens positif
       du composant (début = bas, gauche ou arrière) ;
     · arêtes de la face : milieu et extrémités d'une arête droite (Z = normale de la face,
       X = l'arête), centre d'un cercle ou d'un arc (Z = son axe, du côté de la normale).
   L'origine de chaque composant reste proposée comme avant (triade).
   Référence durable, en coordonnées du composant visé : rel.sn = {f (signature de la face :
   type, centre, normale ou axe, rayon), w (quel point), e (signature de l'arête), fr (dernier
   repère calculé), name}. Après un rejeu du composant, la face est retrouvée par sa signature
   (même type, même orientation, centre le plus proche), le point recalculé et la signature
   mise à jour : l'occurrence alignée suit. Face introuvable → ⚠, position mémorisée. Sans
   noyau exact, le dernier repère calculé (fr) sert tel quel. */
const ASM_SNAP_FACE=[['c','centre'],['n','nord'],['s','sud'],['e','est'],['o','ouest'],['ne','nord-est'],['no','nord-ouest'],['se','sud-est'],['so','sud-ouest']];
const ASM_SNAP_CYL=[['a0','début de l’axe'],['am','milieu de l’axe'],['a1','fin de l’axe']];
const asmV={
  add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],
  mul:(a,s)=>[a[0]*s,a[1]*s,a[2]*s],dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
  cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  len:a=>Math.hypot(a[0],a[1],a[2]),unit:a=>{const l=Math.hypot(a[0],a[1],a[2]);return l>1e-12?[a[0]/l,a[1]/l,a[2]/l]:null;}
};
function asmSnapFr(o,z,x){
  // Repère orthonormé : origine o, Z = z, X = x projeté dans le plan ⟂ z (ou un axe quelconque)
  const Z=asmV.unit(z)||[0,0,1];
  let X=x?asmV.unit(asmV.sub(x,asmV.mul(Z,asmV.dot(x,Z)))):null;
  if(!X){const t=Math.abs(Z[0])<0.9?[1,0,0]:[0,1,0];X=asmV.unit(asmV.sub(t,asmV.mul(Z,asmV.dot(t,Z))));}
  return {o:o.slice(),x:X,y:asmV.cross(Z,X),z:Z};
}
function asmSnapEdgeInfo(e){
  // Arête : {k:'line', p0, p1, m, d} | {k:'circ', c, n, x, r, full} | {k:'other', pts}
  let ad=null;const out={pts:[]};
  try{
    ad=new occt.BRepAdaptor_Curve_2(e);
    const u0=ad.FirstParameter(),u1=ad.LastParameter(),at=u=>{const p=ad.Value(u);const q=[p.X(),p.Y(),p.Z()];try{p.delete();}catch(err){}return q;};
    for(let i=0;i<=12;i++)out.pts.push(at(u0+(u1-u0)*i/12));
    const T=occt.GeomAbs_CurveType,gt=ad.GetType();
    if(gt===T.GeomAbs_Line){out.k='line';out.p0=out.pts[0];out.p1=out.pts[12];out.m=at((u0+u1)/2);out.d=asmV.unit(asmV.sub(out.p1,out.p0));}
    else if(gt===T.GeomAbs_Circle){
      const C=ad.Circle(),L=C.Location(),N=C.Axis().Direction(),X=C.XAxis().Direction();
      out.k='circ';out.c=[L.X(),L.Y(),L.Z()];out.n=[N.X(),N.Y(),N.Z()];out.x=[X.X(),X.Y(),X.Z()];out.r=C.Radius();
      out.full=Math.abs(Math.abs(u1-u0)-2*Math.PI)<1e-6;
    }else out.k='other';
  }catch(err){out.k=out.k||'other';}
  try{if(ad)ad.delete();}catch(err){}
  return out;
}
function asmSnapExtract(shapes){
  // Faces planes et cylindriques des solides (coordonnées du composant), avec leurs arêtes
  const faces=[];
  const T=occt.GeomAbs_SurfaceType,FACE=occt.TopAbs_ShapeEnum.TopAbs_FACE,EDGE=occt.TopAbs_ShapeEnum.TopAbs_EDGE,SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
  (shapes||[]).forEach(sh=>{
    if(!sh)return;
    const ex=new occt.TopExp_Explorer_2(sh,FACE,SH);
    while(ex.More()){
      const f=occt.TopoDS.Face_1(ex.Current());
      try{
        const ad=new occt.BRepAdaptor_Surface_2(f,true);const gt=ad.GetType();
        let F=null;
        if(gt===T.GeomAbs_Plane){F={k:'plane',n:occFaceOutNormal(f)};}
        else if(gt===T.GeomAbs_Cylinder){
          const cy=ad.Cylinder(),ax=cy.Axis(),L=ax.Location(),D=ax.Direction(),X=cy.Position().XDirection();
          F={k:'cyl',l:[L.X(),L.Y(),L.Z()],n:[D.X(),D.Y(),D.Z()],x:[X.X(),X.Y(),X.Z()],r:cy.Radius()};
          // sens de l'axe fixé (OCCT le donne au hasard du tracé) : sa plus grande composante
          // positive — « début de l'axe » est alors le bas / la gauche / l'arrière
          const big=[0,1,2].reduce((b,i)=>Math.abs(F.n[i])>Math.abs(F.n[b])?i:b,0);
          if(F.n[big]<0){F.n=asmV.mul(F.n,-1);F.x=asmV.mul(F.x,-1);}
        }
        try{ad.delete();}catch(err){}
        if(F&&F.n){
          // arêtes de la face, échantillonnées (rectangle englobant, extrémités de l'axe)
          F.edges=[];const pts=[];
          const ee=new occt.TopExp_Explorer_2(f,EDGE,SH);
          while(ee.More()){const info=asmSnapEdgeInfo(occt.TopoDS.Edge_1(ee.Current()));F.edges.push(info);info.pts.forEach(p=>pts.push(p));ee.Next();}
          try{ee.delete();}catch(err){}
          const G=new occt.GProp_GProps_1();
          try{occt.BRepGProp.SurfaceProperties_1(f,G,false,false);const c=G.CentreOfMass();F.c=[c.X(),c.Y(),c.Z()];F.area=G.Mass();try{c.delete();}catch(err){}}
          finally{try{G.delete();}catch(err){}}
          if(F.k==='plane'){
            // orientation des points cardinaux, vue de l'extérieur de la face : face horizontale →
            // est = +X du composant (nord = +Y dessus) ; sinon nord = vers le haut (+Z), est = à droite
            const dir=Math.abs(F.n[2])>0.999?[1,0,0]:asmV.cross([0,0,1],F.n);
            const fr=asmSnapFr(F.c,F.n,dir);F.x=fr.x;F.y=fr.y;
            let u0=1e18,u1=-1e18,v0=1e18,v1=-1e18;
            pts.forEach(p=>{const q=asmV.sub(p,F.c),u=asmV.dot(q,fr.x),v=asmV.dot(q,fr.y);u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v);});
            F.rect=[u0,u1,v0,v1];
          }else{
            let t0=1e18,t1=-1e18;pts.forEach(p=>{const t=asmV.dot(asmV.sub(p,F.l),F.n);t0=Math.min(t0,t);t1=Math.max(t1,t);});
            F.t=[t0,t1];F.c=asmV.add(F.l,asmV.mul(F.n,(t0+t1)/2)); // milieu de l'axe (le centre de surface est hors axe)
          }
          F.edges.forEach(e=>{delete e.pts;});
          if(F.c)faces.push(F);
        }
      }catch(err){}
      ex.Next();
    }
    try{ex.delete();}catch(err){}
  });
  return {faces};
}
function asmSnapItems(F){
  // Points d'accroche d'une face : [{w, name, fr, e?}] (repères dans le composant)
  const out=[],seen=new Set();
  const push=(w,name,fr,e)=>{const k=fr.o.map(v=>v.toFixed(4)).join(',')+'|'+fr.z.map(v=>v.toFixed(3)).join(',');
    if(seen.has(k))return;seen.add(k);out.push({w,name,fr,e});};
  if(F.k==='plane'){
    const [u0,u1,v0,v1]=F.rect,uc=(u0+u1)/2,vc=(v0+v1)/2,hu=(u1-u0)/2,hv=(v1-v0)/2;
    const at=(su,sv)=>asmV.add(F.c,asmV.add(asmV.mul(F.x,uc+su*hu),asmV.mul(F.y,vc+sv*hv)));
    const S={n:[0,1],s:[0,-1],e:[1,0],o:[-1,0],ne:[1,1],no:[-1,1],se:[1,-1],so:[-1,-1]};
    ASM_SNAP_FACE.forEach(([w,name])=>push(w,name,asmSnapFr(w==='c'?F.c:at(S[w][0],S[w][1]),F.n,F.x)));
  }else{
    const [t0,t1]=F.t;
    ASM_SNAP_CYL.forEach(([w,name])=>{const t=w==='a0'?t0:w==='a1'?t1:(t0+t1)/2;push(w,name,asmSnapFr(asmV.add(F.l,asmV.mul(F.n,t)),F.n,F.x));});
  }
  // un cercle d'esquisse devient souvent DEUX demi-arcs : même centre, même rayon → « cercle »
  const ck=e=>e.c.map(v=>v.toFixed(4)).join(',')+'|'+e.r.toFixed(4),nArc={};
  F.edges.forEach(e=>{if(e.k==='circ')nArc[ck(e)]=(nArc[ck(e)]||0)+1;});
  F.edges.forEach(e=>{
    if(e.k==='line'&&F.k==='plane'){
      const sig={k:'line',m:e.m};
      push('em','milieu d’arête',asmSnapFr(e.m,F.n,e.d),sig);
      push('ep','extrémité d’arête',asmSnapFr(e.p0,F.n,e.d),sig);
      push('ep','extrémité d’arête',asmSnapFr(e.p1,F.n,e.d),sig);
    }else if(e.k==='circ'){
      const z=asmV.dot(e.n,F.n)<0?asmV.mul(e.n,-1):e.n;
      push('ec',(e.full||nArc[ck(e)]>1?'centre du cercle':'centre de l’arc')+' Ø'+(+(2*e.r).toFixed(3)),asmSnapFr(e.c,z,e.x),{k:'circ',m:e.c,r:e.r});
    }
  });
  return out;
}
function asmSnapFaceName(F){
  return F.k==='plane'?'Face plane':'Cylindre Ø'+(+(2*F.r).toFixed(3));
}
function asmSnapSig(F){return {k:F.k,c:F.c.map(v=>+v.toFixed(6)),n:F.n.map(v=>+v.toFixed(6)),r:F.k==='cyl'?+F.r.toFixed(6):undefined};}
function asmSnapRef(F,it){
  // Référence durable d'un point d'accroche (rel.sn)
  const sn={f:asmSnapSig(F),w:it.w,fr:asmRound(it.fr),name:asmSnapFaceName(F)+' · '+it.name};
  if(it.e)sn.e={k:it.e.k,m:it.e.m.map(v=>+v.toFixed(6)),r:it.e.r!=null?+it.e.r.toFixed(6):undefined};
  return sn;
}
function asmSnapKey(sn){return sn?[sn.w,sn.f&&sn.f.c&&sn.f.c.join(','),sn.e&&sn.e.m&&sn.e.m.join(','),sn.fr&&sn.fr.o.join(',')].join('~'):'';}
function asmSnapFind(G,sn){
  // Face de même type et même orientation, centre le plus proche ; puis le point → {F, it} | null
  if(!G||!sn||!sn.f)return null;
  let best=null;
  G.faces.forEach(F=>{
    if(F.k!==sn.f.k)return;
    const d=asmV.dot(F.n,sn.f.n);
    if(F.k==='plane'?d<0.999:Math.abs(d)<0.999)return; // un cylindre peut avoir son axe retourné
    let s=asmV.len(asmV.sub(F.c,sn.f.c));
    if(F.k==='cyl')s+=10*Math.abs(F.r-(sn.f.r||0));
    if(!best||s<best.s)best={F,s};
  });
  if(!best)return null;
  const items=asmSnapItems(best.F);
  let it=null;
  if(sn.e){
    let bd=Infinity;
    items.forEach(q=>{if(!q.e||q.e.k!==sn.e.k||q.w!==sn.w)return;
      // extrémité : celle qui est la plus proche du point précédent
      const ref=sn.w==='ep'&&sn.fr?sn.fr.o:sn.e.m;
      const d=asmV.len(asmV.sub(sn.w==='ep'?q.fr.o:q.e.m,ref))+(q.e.r!=null&&sn.e.r!=null?10*Math.abs(q.e.r-sn.e.r):0);
      if(d<bd){bd=d;it=q;}});
  }else it=items.find(q=>q.w===sn.w&&!q.e)||null;
  return it?{F:best.F,it}:null;
}
function asmSnapFresh(c){return !!(c&&c._snapG&&c._snap&&c._snapG.h===c._snap.hash&&!c._stale);}
function asmSnapGeomOf(c){
  // Faces d'accroche d'un composant, en cache tant que son instantané ne change pas (rejeu
  // silencieux du composant si besoin, comme la mise en plan)
  if(!c||!c._snap||typeof occHas!=='function'||!occHas())return null;
  if(asmSnapFresh(c))return c._snapG.g;
  let g=null;
  try{g=asmSnapExtract(asmExactOfQuiet(c).map(b=>b.shape));}catch(e){g=null;}
  c._snapG={h:c._snap.hash,g};
  return g;
}
function asmSnapFrame(cid,sn){
  // Repère du point d'accroche dans le composant cid. Géométrie à jour en cache : recalculé (et
  // la référence suit la face) ; sinon le dernier repère calculé. null : face introuvable.
  const c=asmComp(cid);
  if(asmSnapFresh(c)&&c._snapG.g){
    const r=asmSnapFind(c._snapG.g,sn);
    if(!r){sn.miss=true;return null;}
    delete sn.miss;
    const nw=asmSnapRef(r.F,r.it);sn.f=nw.f;if(nw.e)sn.e=nw.e;sn.fr=nw.fr;
  }
  if(sn.miss&&!asmSnapFresh(c))return null;
  const f=sn.fr;return f?{o:f.o.slice(),x:f.x.slice(),y:f.y.slice(),z:f.z.slice()}:null;
}
function asmSnapUses(){
  // Points d'accroche utilisés par les alignements : [{comp (composant visé), sn}]
  const out=[];if(!asm)return out;
  asm.comps.forEach(owner=>owner.occ.forEach(o=>{const a=o.align;if(!a)return;
    if(a.src&&a.src.sn){const r=asmPathFrame(o.comp,a.src.path);if(r)out.push({comp:r.comp,sn:a.src.sn});}
    if(a.dst&&a.dst.sn){const r=asmPathFrame(owner.id,a.dst.path);if(r)out.push({comp:r.comp,sn:a.dst.sn});}
  }));
  return out;
}
let asmSnapBusy=false;
function asmSnapSync(){
  // Composants visés dont la géométrie a changé : faces relues, alignements recalculés.
  // → 0 rien à relire, 1 relu sans mouvement, 2 des occurrences ont bougé
  if(!asm||asmSnapBusy)return 0;
  const uses=asmSnapUses().filter(u=>!asmSnapFresh(asmComp(u.comp)));
  if(!uses.length)return 0;
  asmSnapBusy=true;
  try{
    const fr0=JSON.stringify(asm.comps.map(c=>c.occ.map(o=>o.fr)));
    new Set(uses.map(u=>u.comp)).forEach(id=>{try{asmSnapGeomOf(asmComp(id));}catch(e){}});
    asmResolve();
    return JSON.stringify(asm.comps.map(c=>c.occ.map(o=>o.fr)))!==fr0?2:1;
  }finally{asmSnapBusy=false;}
}
function asmSnapSyncSoon(){
  if(asmSnapBusy||!asm)return;
  try{setTimeout(()=>{try{const r=asmSnapSync();if(r)asmNotify(r===1);}catch(e){}},0);}catch(e){}
}
/* ── interface : clic sur une face pendant Aligner ── */
function asmSnapHitFace(G,p,n){
  // Face d'accroche sous un point de la vue (coordonnées du composant), normale du maillage n
  let best=null;
  (G&&G.faces||[]).forEach(F=>{
    let s;
    if(F.k==='plane'){
      if(n&&asmV.dot(n,F.n)<0.8)return;
      const q=asmV.sub(p,F.c),d=Math.abs(asmV.dot(q,F.n));if(d>0.6)return;
      const u=asmV.dot(q,F.x),v=asmV.dot(q,F.y),[u0,u1,v0,v1]=F.rect;
      if(u<u0-0.6||u>u1+0.6||v<v0-0.6||v>v1+0.6)return;
      s=d;
    }else{
      const q=asmV.sub(p,F.l),t=asmV.dot(q,F.n),rad=asmV.len(asmV.sub(q,asmV.mul(F.n,t)));
      if(t<F.t[0]-0.6||t>F.t[1]+0.6)return;
      s=Math.abs(rad-F.r);if(s>0.6)return;
    }
    if(!best||s<best.s)best={F,s};
  });
  return best&&best.F;
}
function asmSnapPick(e){
  // Clic sur une face d'une instance admissible pendant Aligner → asmAlign.face (points proposés)
  const A=asmAlign;if(!A)return false;
  const S=asmSceneGet(),G=S.getObjectByName('asmOcc');if(!G)return false;
  const me=asmOcc(A.occ);if(!me)return false;
  const P=asm.path,n=P.length,mine=P.concat(me.id);
  const ms=[];G.traverse(m=>{if(m.isMesh&&m.parent&&Array.isArray(m.parent.userData.path))ms.push(m);});
  rayc.ray.copy(asmRay(e));
  const hits=[];ms.forEach(m=>{try{THREE.Mesh.prototype.raycast.call(m,rayc,hits);}catch(err){}});
  hits.sort((a,b)=>a.distance-b.distance);
  for(const h of hits){
    const path=h.object.parent.userData.path;
    if(path.length<n||!P.every((q,i)=>path[i]===q))continue; // hors du composant actif
    const inMe=path.length>n&&path[n]===me.id;
    if((A.step==='src')!==inMe)continue; // à poser : l'occurrence ; cible : le reste
    const cid=asmPathComp(path),c=asmComp(cid);if(!c)continue;
    const Gs=asmSnapGeomOf(c);
    if(!Gs){try{faceEl.textContent='Points d’accroche : noyau exact indisponible.';}catch(err){}return true;}
    const inv=new THREE.Matrix4().copy(h.object.matrixWorld).invert();
    const pl=h.point.clone().applyMatrix4(inv),nl=h.face?h.face.normal.clone():null;
    const F=asmSnapHitFace(Gs,[pl.x,pl.y,pl.z],nl?[nl.x,nl.y,nl.z]:null);
    if(!F){try{faceEl.textContent='Cette face n’a pas de points d’accroche (ni plane, ni cylindrique) — utilisez une arête circulaire voisine ou un repère.';}catch(err){}return true;}
    A.face={side:A.step,path:path.slice(A.step==='src'?n+1:n),abs:path.slice(),comp:cid,F,items:asmSnapItems(F)};
    asmAlignRefresh();
    try{faceEl.textContent=asmSnapFaceName(F)+' : '+A.face.items.length+' points d’accroche — cliquez-en un (ou dans le panneau).';}catch(err){}
    return true;
  }
  return false;
}
function asmSnapChoose(i){
  const A=asmAlign,f=A&&A.face,it=f&&f.items[i];if(!it)return;
  const rel={path:f.path.slice(),cg:null,sn:asmSnapRef(f.F,it)};
  A.face=null;
  if(f.side==='src')asmAlignSetSrc(rel);else asmAlignSetDst(rel);
}
function asmSnapMarks(put,G){
  // Points de la face choisie : petites sphères cliquables (repère : triade du point retenu)
  const A=asmAlign,f=A&&A.face;if(!f)return;
  const W=asmWorld(asm.path)||asmFr0(),V=asmInverse(W),Fi=asmCompose(V,asmWorld(f.abs)||asmFr0());
  let size=1;try{const c=asmComp(f.comp),b=asmSnapBox(c._snap);size=Math.max(0.4,0.012*b.getSize(new THREE.Vector3()).length());}catch(e){}
  f.items.forEach((it,i)=>{
    const Fw=asmCompose(Fi,it.fr);
    const s=new THREE.Mesh(new THREE.SphereGeometry(size,14,10),new THREE.MeshBasicMaterial({color:it.e?0xffb020:0x30d158,depthTest:false,transparent:true,opacity:0.95}));
    s.position.set(Fw.o[0],Fw.o[1],Fw.o[2]);s.renderOrder=995;s.userData.am='p'+i;G.add(s);
  });
}
