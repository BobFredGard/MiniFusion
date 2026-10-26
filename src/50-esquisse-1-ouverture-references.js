// Esquisse 2D (1/5) : création, références projetées, ouverture/fermeture, vue SVG, état d'édition.
/* ---------- esquisse 2D ---------- */
let skEdit=null, skAnteriorGhost=null;
let skTreeFoldSave=null; // arborescence : état avant l'ouverture (null = rien à restaurer)
let skFaoFoldSave=null;  // menu FAO : ouvert avant l'entrée ? (null = rien à restaurer)
function newSketch(preset){
  // élément de construction sélectionné (plan, plan d'un repère) : l'esquisse se pose dessus
  if(preset==null&&sel&&sel.kind==='cg'&&cgGet(sel.id)){newSketchOnCg(sel.id,sel.sub||null);return;}
  const isPlane=p=>typeof p==='string'&&['XY','XZ','YZ'].includes(p.toUpperCase());
  let pl=isPlane(preset)?preset.toUpperCase():((sel.kind==='plane'&&isPlane(sel.id))?sel.id:null);
  if(!pl)pl='XY'; // défaut plan XY (plus de prompt) — double-clic sur un plan de l'arborescence = esquisse dessus
  const sk={id:uid('sk'),name:'Esquisse '+(doc.sketches.length+1),plane:pl,entities:[],points:{},constraints:[],dims:[],seq:1,visible:true,origin:[0,0,0]};
  ensureSketchBasis(sk);
  doc.sketches.push(sk);markDirty();rebuild();openSketch(sk.id);
}
function sketchFaceLabel(sk){
  if(!sk)return '?';
  if(sk.plane==='CG'){const el=sk.cg&&cgGet(sk.cg.id);return (el?el.name:'construction ?')+(sk.cg&&sk.cg.sub?' · '+sk.cg.sub:'');}
  if(sk.plane==='FACE'&&sk.origin)return 'FACE @('+sk.origin.map(v=>(+v).toFixed(1)).join(', ')+')'+(sk.host&&sk.host.name?' · '+sk.host.name:'');
  return sk.plane;
}
function newSketchOnCg(id,sub){
  // Esquisse sur un plan de construction, ou sur un plan (XY, XZ, YZ) d'un repère de construction.
  // plane:'CG' : origin/axU/axV/axN sont recopiés de l'élément à chaque rejeu (cgSyncSketch) —
  // l'esquisse suit le plan quand il bouge. Le reste du code ne voit qu'une base, comme une face.
  if(skEdit)return;
  const el=cgGet(id);if(!el)return;
  if(el.kind==='frame'&&!(sub&&CG_O_PLANES[sub]))sub='XY';
  if(el.kind!=='plane'&&el.kind!=='frame'){try{faceEl.textContent='Esquisse : choisissez un plan (ou un plan de repère), pas un '+cgKindLabel(el).toLowerCase()+'.';}catch(e){}return;}
  if(el.kind==='plane')sub=null;
  const sk={id:uid('sk'),name:'Esquisse '+(doc.sketches.length+1),plane:'CG',cg:sub?{id,sub}:{id},
    entities:[],points:{},constraints:[],dims:[],seq:1,visible:true,origin:[0,0,0]};
  cgSyncSketch(sk);
  if(!sk.axN){try{faceEl.textContent='Esquisse : « '+el.name+' » n’est pas résolu ('+(el.msg||'référence perdue')+').';}catch(e){}return;}
  doc.sketches.push(sk);markDirty();rebuild();openSketch(sk.id);
  try{faceEl.textContent='Esquisse '+sk.name+' posée sur '+sketchFaceLabel(sk)+' — elle suivra le plan s’il bouge.';}catch(e){}
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
  // face verticale / inclinée : v vers le HAUT (Z du monde) — sinon l'esquisse s'ouvrait à l'envers
  // (face arrière, face −X…). Demi-tour dans le plan : u reste aligné sur le repère parent.
  if(Math.abs(n.z)<0.95&&v.z<-1e-6){u.negate();v.negate();}
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
// Grille d'esquisse : masquée par défaut (les axes d'origine restent), état mémorisé d'une esquisse à l'autre
let skShowGrid=false;
try{skShowGrid=localStorage.getItem('minifusion_skGrid')==='1';}catch(e){}
function skConsumerIdx(sk){
  // Index (dans les fonctions visibles) de l'extrusion OU de la révolution qui
  // consomme l'esquisse, sinon -1. Le consommateur détermine l'antériorité des
  // références et des projections — révolution comprise (tlHostFeatureOfSketch
  // l'incluait déjà, la détection ne suivait pas).
  if(!sk)return -1;
  return (doc.features||[]).filter(f=>f.visible!==false)
    .findIndex(f=>(f.type==='extrude'||f.type==='revolve'||f.type==='hole')&&f.sketchId===sk.id);
}
function skFadeSaveRestore(){
  // Remet les opacités d'origine mémorisées par skApplyFade (idempotent).
  bodies.forEach(b=>{
    if(b._savedOpacity!=null&&b.mesh&&b.mesh.material){
      b.mesh.material.opacity=b._savedOpacity; b.mesh.material.transparent=b._savedTransparent;
      delete b._savedOpacity; delete b._savedTransparent;
    }
  });
}
function skApplyFade(){
  // (Re)pose le fondu de la session d'esquisse sur l'état ACTUELLEMENT affiché.
  // skEdit._fade : 'bodies' = corps en fondu SK_FACE_ALPHA · 'ghost' = corps masqués +
  // fantôme antérieur · null = rien (hors session). Re-appelé après chaque rebuild :
  // le rejeu régénère les matériaux et volerait sinon le fondu.
  if(!skEdit)return;
  skFadeSaveRestore();
  if(skEdit._fade==='bodies'){
    bodies.forEach(b=>{
      if(!b.ghost&&b.mesh&&b.mesh.visible&&b.mesh.material){
        b._savedOpacity=b.mesh.material.opacity; b._savedTransparent=b.mesh.material.transparent;
        // Fondu via la MÊME écriture que la slider du corps : la pièce reste lisible
        // (éclat compensé), et un corps déjà translucide devient plus voilé, pas plus sombre.
        // Faces TRÈS atténuées : ce sont les arêtes (skEdgesSync) qui montrent la pièce.
        setMatAlpha(b.mesh.material,Math.min(bodyOpOf(b.bodyId||b.id),SK_FACE_ALPHA));
      }
    });
  }else if(skEdit._fade==='ghost'){
    bodies.forEach(b=>{ if(!b.ghost&&b.mesh) b.mesh.visible=false; });
  }
  skEdgesSync();
}
// Pièce dans l'esquisse « comme en 3D, en transparence » : faces à peine teintées, TOUTES les
// arêtes tracées — nettes devant, estompées derrière (vues à travers la matière). Arêtes du
// solide affiché (mode 'bodies') ou de l'état antérieur rejoué (mode 'ghost', skAnteriorEdges, hors du document : jamais sauvé).
const SK_FACE_ALPHA=0.2;
let skAnteriorEdges=null;
function skEdgesDrop(){
  const g=scene.getObjectByName('skEdges');
  if(g){scene.remove(g);try{g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});}catch(e){}}
}
function skEdgesSync(){
  skEdgesDrop();
  if(!skEdit||!skEdit._fade)return;
  let data=skEdit._fade==='ghost'?(skAnteriorEdges||[]):null;
  if(!data){const em=edgeMode;edgeMode='on';try{data=edgeOverlayData()||[];}catch(e){data=[];}finally{edgeMode=em;}}
  const pos=[];
  for(const d of data){
    const pts=d&&d.pts;if(!pts||pts.length<2)continue;
    const M=(d.mw&&d.mw.elements)||null;
    const put=p=>{let x=+p[0],y=+p[1],z=+p[2];
      if(M){const X=x,Y=y,Z=z;x=M[0]*X+M[4]*Y+M[8]*Z+M[12];y=M[1]*X+M[5]*Y+M[9]*Z+M[13];z=M[2]*X+M[6]*Y+M[10]*Z+M[14];}
      pos.push(x,y,z);};
    for(let i=0;i+1<pts.length;i++){put(pts[i]);put(pts[i+1]);}
  }
  if(!pos.length)return;
  try{
    const clair=document.body&&document.body.getAttribute('data-theme')==='clair';
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    const grp=new THREE.Group();grp.name='skEdges';
    // gris doux (le blanc pur écrasait l'esquisse) : arêtes vues gris clair, arêtes cachées gris plus sombre
    const back=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:clair?0xa3a9b2:0x5a616c,transparent:true,opacity:0.5,depthTest:false,depthWrite:false}));
    const front=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:clair?0x4a5059:0xa4abb5,transparent:true,opacity:0.9,depthTest:true,depthWrite:false}));
    back.renderOrder=989;front.renderOrder=990;back.raycast=()=>{};front.raycast=()=>{};
    grp.add(back);grp.add(front);scene.add(grp);
  }catch(e){}
  const eo=scene.getObjectByName('edgeOverlay');if(eo)eo.visible=false; // pas de doublon avec les arêtes 3D
}
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
          // 2026-10-16-007 : cercle complet = arête FERMÉE (début = fin) ; arc orienté par son
          // vrai MILIEU (l'arête OCCT peut être parcourue en sens horaire → sans cela on
          // dessinait le COMPLÉMENT : arcs de congé concaves affichés en quasi-cercles).
          const mx=(mid.X()-o.x)*u.x+(mid.Y()-o.y)*u.y+(mid.Z()-o.z)*u.z, my=(mid.X()-o.x)*v.x+(mid.Y()-o.y)*v.y+(mid.Z()-o.z)*v.z;
          out.push(skArcRef(cx,cy,r,ax,ay,bx,by,mx,my));
        }else{
          out.push({x1:ax,y1:ay,x2:bx,y2:by});
        }
      }catch(e){}
      ex.Next();
    }
    try{ex.delete();}catch(e){}
    // une arête est visitée une fois PAR FACE adjacente : références dédoublonnées
    const seen=new Set(),uniq=[];const k=v=>(Math.round(v*1e4)/1e4).toFixed(4);
    out.forEach(r=>{let key;
      if(r.type==='circle')key='c'+k(r.cx)+','+k(r.cy)+','+k(r.r);
      else if(r.type==='arc')key='a'+k(r.cx)+','+k(r.cy)+','+k(r.r)+','+k(Math.cos(r.a1))+','+k(Math.sin(r.a1))+','+k(Math.cos(r.a2))+','+k(Math.sin(r.a2));
      else{const p=[k(r.x1)+','+k(r.y1),k(r.x2)+','+k(r.y2)].sort();key='l'+p.join(';');}
      if(!seen.has(key)){seen.add(key);uniq.push(r);}});
    return uniq.length?uniq:null;
  }catch(e){return null;}
}
function skArcRef(cx,cy,r,ax,ay,bx,by,mx,my){
  // Référence projetée d'une arête circulaire : cercle si fermée, sinon arc {a1,a2} tracé
  // en sens trigonométrique de a1 à a2 ET contenant le milieu réel (mx,my) de l'arête.
  if(Math.hypot(bx-ax,by-ay)<Math.max(1e-6,r*1e-6))return{type:'circle',cx,cy,r};
  let a1=Math.atan2(ay-cy,ax-cx),a2=Math.atan2(by-cy,bx-cx);
  if(isFinite(mx)&&isFinite(my)&&!angInArc(Math.atan2(my-cy,mx-cx),a1,a2)){const t=a1;a1=a2;a2=t;}
  return{type:'arc',cx,cy,r,a1,a2};
}
function arcOrient(cx,cy,x1,y1,x2,y2,mx,my){
  // L'arc entité va TOUJOURS de pa à pb dans le sens trigonométrique (arcAngles), mais
  // l'arête OCCT source peut être parcourue « à l'envers » : sans cet échange on projeterait
  // le COMPLÉMENT de l'arête (l'inverse). On ordonne les extrémités pour que le secteur CCW
  // contienne le milieu réel de l'arête (jamais son complément).
  if(!isFinite(mx)||!isFinite(my))return[x1,y1,x2,y2];
  const a1=Math.atan2(y1-cy,x1-cx),a2=Math.atan2(y2-cy,x2-cx),am=Math.atan2(my-cy,mx-cx);
  if(angInArc(am,a1,a2))return[x1,y1,x2,y2];
  return[x2,y2,x1,y1];
}
// 2026-10-16-003 : cache des arêtes candidates PENDANT une passe de mise à jour des
// projections. Avant : chaque entité projetée rejouait le solide jusqu'à la fonction
// consommatrice (occFinalShape) puis relisait toutes ses arêtes — « Cavité Usinage » :
// 26 s pour modifier la 1re extrusion, dont 55 s CPU cumulés ici. Le solide ne change
// pas pendant la passe : une seule lecture par fonction consommatrice.
let _projEdgeCache=null;
// cache PERSISTANT (entre reconstructions) : clé = signature du préfixe de timeline vu par
// l'esquisse — un préfixe inchangé redonne les mêmes arêtes sans rejouer le solide.
const _projEdgePersist=new Map();
function projPrefixSig(idx){
  try{const F=(doc.features||[]).filter(f=>f.visible!==false).slice(0,idx);let s=(typeof occSkipFeat!=='undefined'&&occSkipFeat)||'';for(const f of F)s+=featSig(f)+';';return s;}catch(e){return null;}
}
function projEdgesFor(sk){
  // → tableau d'arêtes {pts,mid} (repère monde) du solide vu par l'esquisse, ou null
  let idx=-1;try{idx=skConsumerIdx(sk);}catch(e){idx=-1;}
  const key=(idx>=0&&occHas())?'f'+idx:((occHas()&&occLive&&occLive.shape)?'live':null);
  if(!key)return null;
  if(_projEdgeCache&&_projEdgeCache.has(key))return _projEdgeCache.get(key);
  const pk=key==='live'?null:projPrefixSig(idx);
  if(pk!=null&&_projEdgePersist.has(pk)){const ed=_projEdgePersist.get(pk);if(_projEdgeCache)_projEdgeCache.set(key,ed);return ed;}
  let edges=null;
  if(key==='live'){try{edges=occListEdges(occLive.shape);}catch(e){edges=null;}}
  else{
    let FR=null;
    try{FR=occFinalShape(idx);if(FR&&FR.shape)edges=occListEdges(FR.shape);}catch(e){edges=null;}
    // nettoyage APRÈS lecture (occCleanup supprime FR.shape)
    finally{if(FR){try{occCleanup(FR,null);}catch(e){}}}
  }
  if(_projEdgeCache)_projEdgeCache.set(key,edges);
  if(pk!=null&&edges){_projEdgePersist.set(pk,edges);while(_projEdgePersist.size>24)_projEdgePersist.delete(_projEdgePersist.keys().next().value);}
  return edges;
}
function findClosestProjectedEdge(sk,x,y,preferMid,wantType,edgesOver){
  // sans tolérance, cherche l'arête projetée la plus proche (antériorité).
  // preferMid : milieu 3D mémorisé à la projection — l'arête source d'origine prime
  // (si le solide bouge, on reste sur LA bonne arête et on rafraîchit le lien).
  // wantType : 'line'|'circle'|'arc' — la nature de l'entité projetée ne change jamais :
  // si le meilleur voisin général est d'un autre type, on prend le meilleur du type voulu.
  let best=null,bd=1e9, srcMid=null;
  let bTy=null,bTyd=1e9,bTySrc=null; // meilleur candidat EXIGÉ par le type de l'entité
  const basis=sketchBasis(sk),u=basis.u,v=basis.v,o=basis.o;
  const edgesAll=edgesOver!==undefined?edgesOver:projEdgesFor(sk); // V0.8.1 : arêtes d'un autre composant
  {
  for(const edges of (edgesAll?[edgesAll]:[])){
    try{
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
            // 0, 1/3, 2/3 : un cercle complet a son dernier point sur le premier (V0.8.1 : donnait une ligne nulle)
            const p0=pts2[0],p1=pts2[Math.floor(pts2.length/3)],p2=pts2[Math.floor(2*pts2.length/3)];
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
            else {const pm=pts2[Math.floor(pts2.length/2)];const oa=arcOrient(cx,cy,pts2[0][0],pts2[0][1],pts2[pts2.length-1][0],pts2[pts2.length-1][1],pm[0],pm[1]);pr={type:'arc',cx,cy,r,x1:oa[0],y1:oa[1],x2:oa[2],y2:oa[3]};}
          } else pr={type:'line',x1:pts2[0][0],y1:pts2[0][1],x2:pts2[pts2.length-1][0],y2:pts2[pts2.length-1][1]};
          if(sc<bd){bd=sc;best=pr;srcMid=e.mid?e.mid.slice():null;}
          if(wantType&&pr.type===wantType&&sc<bTyd){bTyd=sc;bTy=pr;bTySrc=e.mid?e.mid.slice():null;}
        }
      }
    }catch(e){}
  }
  }
  let res=best,resSrc=srcMid;
  if(wantType&&best&&best.type!==wantType&&bTy){res=bTy;resSrc=bTySrc;}
  if(res&&resSrc)res.srcMid=resSrc;
  return res;
}
function updateAssociativeProjections(sk){
  if(!sk||!sk.entities) return false;
  const own=!_projEdgeCache;if(own)_projEdgeCache=new Map(); // cache local si appel isolé
  try{return updateAssociativeProjections0(sk);}finally{if(own)_projEdgeCache=null;}
}
function updateAssociativeProjections0(sk){
  let changed=false;
  for(const e of sk.entities){
    // 2026-10-15-009 : une arête PROJETÉE reste associative même passée en PROFIL
    // (on projette pour s'en servir dans le contour, comme Fusion). Avant, seules les
    // projetées « construction » suivaient : une projetée de profil restait figée à
    // l'ancienne cote et toute la chaîne aval (symétrie, esquisse sur sa face, poche)
    // décrochait — « Cavité Usinage » : 50 → 55, le fond suivait, pas la poche.
    // Le repli « ligne aux 2 bouts fixes » ne vaut QUE pour la construction (une ligne
    // de profil fixée par l'utilisateur n'est pas une projection).
    // Intersection ⨯ (62-esquisse-intersection.js) : section de sa source, recalculée
    if(e.isect){if(typeof skIsectTrack==='function'&&skIsectTrack(sk,e))changed=true;continue;}
    const isProj=e.proj||e.isProj||(e.construction&&e.t==='line'&&sk.constraints.some(c=>c.type==='fix'&&c.p===e.p1)&&sk.constraints.some(c=>c.type==='fix'&&c.p===e.p2));
    if(!isProj) continue;
    // V0.8.1 : arête d'un autre composant — ses arêtes, vues depuis ce composant
    let EO;
    if(e.ext){
      if(typeof asmSkExtEdges!=='function')continue;
      EO=asmSkExtEdges(e.ext);if(!EO)continue;
      const sg=asmSkExtSig(e.ext);if(sg!=null)e.ext.sig=sg;
    }
    if(e.t==='line'){
      const A=sk.points[e.p1], B=sk.points[e.p2]; if(!A||!B) continue;
      const mx=(A.x+B.x)/2, my=(A.y+B.y)/2;
      const pr=findClosestProjectedEdge(sk,mx,my,e.srcMid,'line',EO);
      if(!pr||pr.type!=='line') continue;
      if(pr.srcMid)e.srcMid=pr.srcMid;
      const d1=Math.hypot(A.x-pr.x1,A.y-pr.y1)+Math.hypot(B.x-pr.x2,B.y-pr.y2);
      const d2=Math.hypot(A.x-pr.x2,A.y-pr.y2)+Math.hypot(B.x-pr.x1,B.y-pr.y1);
      // 2026-10-16-003 : « d1>0.02||d2>0.02 » était TOUJOURS vrai (l'un des 2 sens de
      // parcours est forcément loin) → chaque projetée « changeait » à chaque passe et la
      // régénération rejouait tout jusqu'à REGEN_MAX_PASS (Cavité Usinage : 16 s au lieu de 2).
      if(Math.min(d1,d2)>0.02){
        if(d2<d1){ A.x=pr.x2; A.y=pr.y2; B.x=pr.x1; B.y=pr.y1; } else { A.x=pr.x1; A.y=pr.y1; B.x=pr.x2; B.y=pr.y2; }
        changed=true;
      }
    } else if(e.t==='circle'){
      const C=sk.points[e.pc]; if(!C) continue;
      const pr=findClosestProjectedEdge(sk,C.x,C.y,e.srcMid,'circle',EO);
      if(!pr||pr.type!=='circle') continue;
      if(pr.srcMid)e.srcMid=pr.srcMid;
      if(Math.hypot(C.x-pr.cx,C.y-pr.cy)>0.02 || Math.abs(e.r-pr.r)>0.02){ C.x=pr.cx; C.y=pr.cy; e.r=pr.r; changed=true; }
    } else if(e.t==='arc'){
      const C=sk.points[e.pc], A=sk.points[e.pa], B=sk.points[e.pb]; if(!C||!A||!B) continue;
      const mx=(A.x+B.x)/2, my=(A.y+B.y)/2;
      const pr=findClosestProjectedEdge(sk,mx,my,e.srcMid,'arc',EO);
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
  const own=!_projEdgeCache;if(own)_projEdgeCache=new Map(); // une lecture par fonction consommatrice pour TOUTE la passe
  try{
    // 2026-10-16-003 : ordre de la TIMELINE (fonction consommatrice croissante). Quand une
    // esquisse bouge, le solide vu par les suivantes est relu aussitôt (cache invalidé
    // au-delà) : toute une chaîne (extrusion → esquisse sur face → symétrie → esquisse →
    // limite…) se règle en UNE passe au lieu d'une passe complète par maillon.
    const L=[];
    (doc.sketches||[]).forEach(sk=>{ if(sk.id===skEdit?.id)return; if(repCloneSkName(sk))return; let k=-1;try{k=skConsumerIdx(sk);}catch(e){} L.push({sk,k:k>=0?k:1e9}); });
    L.sort((a,b)=>a.k-b.k);
    L.forEach(({sk,k})=>{ try{ if(updateAssociativeProjections(sk)){changed=true;
      if(_projEdgeCache)[..._projEdgeCache.keys()].forEach(key=>{const n=key[0]==='f'?+key.slice(1):1e9;if(n>k)_projEdgeCache.delete(key);});
      // la chaîne aval suit AUSSITÔT : esquisses posées sur faces + instances de répétition
      try{resolveAllSketchHosts();}catch(e){}
      try{if(typeof repSyncStale==='function'&&repSyncStale())resolveAllSketchHosts();}catch(e){}
    } }catch(e){} });
  }catch(e){}
  finally{if(own)_projEdgeCache=null;}
  return changed;
}
function projPreUpdate(){
  // Avant le rejeu principal : seulement si le noyau exact est prêt et qu'au moins une
  // esquisse porte des projections associatives (sinon : rien à faire, aucun coût).
  const ext=(doc.sketches||[]).some(sk=>(sk.entities||[]).some(e=>e&&e.proj&&e.ext)); // V0.8.1 : sans noyau, des instantanés
  if(!(typeof occHas==='function'&&occHas())&&!ext)return false;
  const any=ext||(doc.sketches||[]).some(sk=>(sk.entities||[]).some(e=>e&&(e.proj||e.isProj)));
  if(!any)return false;
  return updateAllProjections();
}
function projectEdgeAt(sk,x,y){
  // Arête 3D la plus proche du clic, projetée dans le plan d'esquisse (antériorité).
  // Retourne {type:'line',x1,y1,x2,y2} ou {type:'circle',cx,cy,r}
  const tol=Math.max(4, 8/Math.max(1,skView.s));
  let best=null,bd=1e9,srcMid=null;
  const basis=sketchBasis(sk),u=basis.u,v=basis.v,n=basis.n,o=basis.o;
  const candShapes=[];let FRk=null;
  const candExt=(typeof asmSkExtLists==='function')?(()=>{try{return asmSkExtLists();}catch(e){return [];}})():[]; // V0.8.1
  // 1) solide antérieur exact si esquisse consommée, sinon solide fini
  try{
    const idx=skConsumerIdx(sk);
    if(idx>=0&&occHas()){
      const FR=occFinalShape(idx);
      // Nettoyage DIFFÉRÉ (try/finally en fin de fonction) : occCleanup(FR,null) supprime
      // FR.shape — le lire après = use-after-free → aucune arête détectée sur esquisse consommée.
      if(FR&&FR.shape){candShapes.push(FR.shape);FRk=FR;}
    }else if(occHas()&&occLive&&occLive.shape) candShapes.push(occLive.shape);
  }catch(e){}
  // 2) BRep exact : teste chaque arête sur le plan
  try{
  for(const sh of candShapes.concat(candExt)){
    try{
      const edges=sh&&sh.edges?sh.edges:occListEdges(sh);
      for(const e of edges){
        const pts2=e.pts.map(p=>[(p[0]-o.x)*u.x+(p[1]-o.y)*u.y+(p[2]-o.z)*u.z, (p[0]-o.x)*v.x+(p[1]-o.y)*v.y+(p[2]-o.z)*v.z]);
        // cercle ? (3 points → centre)
        let isCirc=false,cx=0,cy=0,r=0,arcA1=0,arcA2=0;
        if(pts2.length>=6){
          // 0, 1/3, 2/3 : un cercle complet a son dernier point sur le premier (V0.8.1)
          const p0=pts2[0],p1=pts2[Math.floor(pts2.length/3)],p2=pts2[Math.floor(2*pts2.length/3)];
          const d=2*(p0[0]*(p1[1]-p2[1])+p1[0]*(p2[1]-p0[1])+p2[0]*(p0[1]-p1[1]));
          if(Math.abs(d)>1e-9){
            const sq0=p0[0]*p0[0]+p0[1]*p0[1],sq1=p1[0]*p1[0]+p1[1]*p1[1],sq2=p2[0]*p2[0]+p2[1]*p2[1];
            cx=(sq0*(p1[1]-p2[1])+sq1*(p2[1]-p0[1])+sq2*(p0[1]-p1[1]))/d;
            cy=(sq0*(p2[0]-p1[0])+sq1*(p0[0]-p2[0])+sq2*(p1[0]-p0[0]))/d;
            r=Math.hypot(p0[0]-cx,p0[1]-cy);
            if(r>0.5){
              let dev=0;
              for(const p of pts2){const dd=Math.abs(Math.hypot(p[0]-cx,p[1]-cy)-r); if(dd>dev)dev=dd;}
              if(dev<0.35){ isCirc=true; arcA1=Math.atan2(p0[1]-cy,p0[0]-cx); arcA2=Math.atan2(pts2[pts2.length-1][1]-cy,pts2[pts2.length-1][0]-cx); }
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
        // Départage par l'écart au plan d'esquisse : deux arêtes peuvent se superposer
        // exactement en 2D (bloc avant / bloc arrière) — l'arête du plan projeté gagne.
        let dz=0;
        try{
          dz=1e9;
          for(const p of e.pts){ const t=Math.abs((p[0]-o.x)*n.x+(p[1]-o.y)*n.y+(p[2]-o.z)*n.z); if(t<dz)dz=t; }
          if(dz>1e8)dz=0;
        }catch(err){dz=0;}
        if(d<tol&&d+0.25*dz<bd){
          bd=d+0.25*dz;
          srcMid=e.mid?e.mid.slice():null;
          if(isCirc){
            const span=Math.abs(((arcA2-arcA1)%(Math.PI*2)+Math.PI*2)%(Math.PI*2));
            const isFull = span>6.0 || Math.hypot(pts2[0][0]-pts2[pts2.length-1][0], pts2[0][1]-pts2[pts2.length-1][1])<0.5;
            if(isFull) best={type:'circle',cx,cy,r};
            else {
              const p0a=pts2[0], p1a=pts2[pts2.length-1], pma=pts2[Math.floor(pts2.length/2)];
              const oa=arcOrient(cx,cy,p0a[0],p0a[1],p1a[0],p1a[1],pma[0],pma[1]);
              best={type:'arc',cx,cy,r, x1:oa[0],y1:oa[1],x2:oa[2],y2:oa[3]};
            }
          } else best={type:'line',x1:pts2[0][0],y1:pts2[0][1],x2:pts2[pts2.length-1][0],y2:pts2[pts2.length-1][1]};
        }
      }
      if(best){if(srcMid)best.srcMid=srcMid;if(sh&&sh.ext){best.ext={ctx:sh.ext.ctx.slice(),path:sh.ext.path.slice()};best.extName=sh.name;}return best;}
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
  const o={projName:entName('proj'),srcName:srcMid?entName('edge'):null,srcMid};
  if(pr&&pr.ext){o.ext={ctx:pr.ext.ctx.slice(),path:pr.ext.path.slice()};try{o.ext.sig=asmSkExtSig(o.ext);}catch(e){}} // V0.8.1
  return o;
}
function skRefMeshes(meshes){
  // 1) BRep exact si dispo (même tangents) — sinon 2) maillage
  try{
    if(skEdit&&(skEdit.plane==='FACE'||skEdit.plane==='CG')&&occHas()&&occLive&&occLive.shape){
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
  skEdit._refs=[];skEdit._ghost=[];skEdit._refNote='';skEdit._fade=null;skAnteriorEdges=null;
  const feats=doc.features.filter(f=>f.visible!==false);
  const idx=skConsumerIdx(skEdit);
  const geomLater=arr=>arr.some(f=>f.type==='extrude'||f.type==='revolve'||f.type==='xfillet'||f.type==='fillet');
  const dropGhost=()=>{ if(skAnteriorGhost){ try{scene.remove(skAnteriorGhost); skAnteriorGhost.geometry.dispose();}catch(e){} skAnteriorGhost=null; } };
  if(idx<0){
    try{
      const br=skBRepPlanarRefs(occLive?occLive.shape:null);
      skEdit._refs=(br&&br.length)?br:skRefMeshes(bodies.filter(b=>!b.ghost).map(b=>b.mesh));
      skEdit._ghost=[]; // B : pas de wireframe 2D — on voit la 3D en fondu
    }catch(e){skEdit._refs=[]; skEdit._ghost=[];}
    skEdit._refNote='référence : solide fini (esquisse non consommée)';
    dropGhost();
    // B : 3D en fondu léger dans le plan (pas de traits)
    skEdit._fade='bodies'; try{skApplyFade();}catch(e){}
    return;
  }
  if(!(geomLater(feats.slice(idx+1))&&occHas())){
    try{
      const br=skBRepPlanarRefs(occLive?occLive.shape:null);
      skEdit._refs=(br&&br.length)?br:skRefMeshes(bodies.filter(b=>!b.ghost).map(b=>b.mesh));
      skEdit._ghost=[];
    }catch(e){skEdit._refs=[]; skEdit._ghost=[];}
    dropGhost();
    skEdit._fade='bodies'; try{skApplyFade();}catch(e){}
    return; // 3D en fondu dans le plan, pas de wireframe
  }
  // Rejeu partiel exact jusqu'à la fonction consommatrice (exclue).
  skEdit._refNote=`référence : état avant « ${feats[idx].name} »`;
  dropGhost();
  let ok=false;
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
        const mat=new THREE.MeshStandardMaterial({color:bcol,transparent:true,opacity:SK_FACE_ALPHA,depthTest:true,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1}); // couleur de la pièce, faces très atténuées
          skAnteriorGhost=new THREE.Mesh(g,mat); skAnteriorGhost.name='skAnteriorGhost'; scene.add(skAnteriorGhost);
        }catch(e){}
        try{skAnteriorEdges=occSharpEdges(FR.shape)||[];}catch(e){skAnteriorEdges=[];} // arêtes de l'état antérieur (copiées : survivent à occCleanup)
        ok=true;
      }
    }finally{occCleanup(FR,null);}
  }catch(e){ok=false;}
  if(ok){
    // corps masqués seulement si le fantôme antérieur a réellement été monté — sinon on
    // garde les corps affichés en fondu (même géométrie, jamais d'écran vide).
    skEdit._fade=skAnteriorGhost?'ghost':'bodies';
  }else{
    // Rejeu impossible / aucun solide : on garde les corps affichés en fondu plutôt
    // que de tout masquer (écran vide = ce qu'on corrige).
    try{skEdit._refs=skRefMeshes(bodies.filter(b=>!b.ghost).map(b=>b.mesh));}catch(e2){skEdit._refs=[];}
    skEdit._ghost=[];
    skEdit._refNote='référence : solide fini (rejeu partiel impossible)';
    bodies.forEach(b=>{ if(!b.ghost) b.mesh.visible=true; });
    skEdit._fade='bodies';
  }
  try{skApplyFade();}catch(e){}
}
let skOpenAt=0; // instant d'ouverture : sketchCamTick recadre si la mise en page bouge juste après
function openSketch(id){
  try{docCheckpoint();}catch(e){} // filet d'annulation (45) : ce qui précède l'esquisse est relevé à part
  try{const sg=doc.sketches.find(x=>x.id===id);const ng=sg?skGapToAngle(sg):0;
    if(ng)setTimeout(()=>{try{skStatus(ng+' cote(s) d’entraxe entre lignes non parallèles changée(s) en cote(s) d’angle (valeur mesurée).');}catch(e){}},0);}catch(e){}
  // 2026-10-16-006 : nouvelle mise en page des cotes R/Ø — les anciens décalages (calés sur
  // l'étiquette à 45°) sont remis à zéro UNE fois par esquisse.
  try{const s1=doc.sketches.find(x=>x.id===id);if(s1&&!s1.rdV){(s1.dims||[]).forEach(d=>{if(d.type==='radius'||d.type==='diameter'){delete d.ox;delete d.oy;}});s1.rdV=1;}}catch(e){}
  try{const s0=doc.sketches.find(x=>x.id===id);if(s0)(s0.dims||[]).forEach(d=>{
    // référence posée par la 1re version (rayons mal analysés) : réévaluée
    if(d.ref&&!d.refV){delete d.ref;delete d.chk;return;}
    if(!d.chk)d.chk=1;});
    // 2026-10-16-001 : symétrie de côtés déjà rognés par un congé/chanfrein → symétrie de DROITES
    if(s0){const arcPts=new Set();(s0.entities||[]).forEach(e=>{if(e&&e.t==='arc'){arcPts.add(e.pa);arcPts.add(e.pb);}});
      (s0.constraints||[]).forEach(c=>{if(c.type!=='symmetric'||c.inf)return;
        if([c.a,c.b].some(id=>{const l=entById(s0,id);return l&&(arcPts.has(l.p1)||arcPts.has(l.p2));}))c.inf=true;});}
    // 2026-10-16-001 : une référence qui n'est plus en trop (esquisse modifiée depuis) redevient pilotante
    if(s0)(s0.dims||[]).forEach(d=>{if(d.ref&&skDimCanDrive(s0,d)){const mv=skDimMeasure(s0,d);if(mv!=null&&isFinite(mv))d.value=mv;delete d.ref;delete d.refV;}});
    if(s0&&(s0.dims||[]).some(d=>!d.chk))skCheckNewDims(s0);}catch(e){}
  skEdit=doc.sketches.find(s=>s.id===id);if(!skEdit)return;
  migrateSketch(skEdit);
  // 1) VERROU puis REBUILD puis REFS (l'ordre compte) : skBuildRefs pose le fondu SK_FACE_ALPHA et
  // les références sur les meshes — avant, il s'appuyait sur l'ancien état (matériaux neufs
  // ensuite → corps opaque) et sur des corps encore en état final (écran vide).
  //   · esquisse consommée  : verrou avant la consommatrice (état qui la précède, Fusion) ;
  //   · esquisse sur face NON consommée : aucun verrou (modèle complet) — la porteuse est
  //     antérieure donc toujours rejouée ; verrouiller après elle excluait les fonctions
  //     suivantes : congés absents de la référence, seul le rectangle restait (test.json) ;
  //   · esquisse libre      : aucun verrou (modèle complet).
  let locked=false;
  const ci=skConsumerIdx(skEdit);
  if(ci>=0){ locked=tlEditLock(doc.features.filter(f=>f.visible!==false)[ci]); }
  if(locked){try{rebuild();}catch(e){}}
  skBuildRefs();
  skTool='select';skChain=null;skArcC=null;skArcA1=null;skArcPa=null;skPendPt=null;skCoinA=null;skDraft=null;skDown=null;skDrag=null;skDragPushed=false;skDimDrag=null;skSel=null;skSelX=[];skMsg='';skDimLine=null;skDimRef=null;skBox=null;skDragEnt=null;skDyn=null;skInfer=null;skPan=null;skSnapMk=null;skDimPlace=null;skProjectHover=null;
  skUndoStack=[];skRedoStack=[];
  document.querySelectorAll('#skToolbar .tool').forEach(x=>x.classList.toggle('on',x.dataset.tool==='select'));
  $('skTitle').textContent='Esquisse — '+skEdit.name+' (plan '+sketchFaceLabel(skEdit)+')';
  skOpenAt=performance.now();
  $('sketchOverlay').classList.add('open');exitFilletMode(true);skRefreshHealth();skFitView();sketchAlignCamera();renderSkPanel();skUndoBtn();
  try{$('skStatWrap').style.display='block';}catch(e){}
  // Arborescence (menu des corps) RABATTUE pendant l'édition : le voile de
  // l'esquisse la laisse transparaître et encombre le plan de travail.
  // Restaurée à la sortie — état antérieur respecté (nesting = sans effet).
  try{if(skTreeFoldSave===null)skTreeFoldSave=treeFolded;if(!treeFolded)treeFoldSet(true);}catch(e){}
  // Menu FAO (colonne #faoWrap : « + Usinage » + posages) : caché pendant l'édition,
  // réouvert à la sortie s'il était ouvert avant — déjà replié : on n'y touche pas.
  // Mêmes règles que l'arborescence : localStorage jamais réécrit en édition.
  try{if(skFaoFoldSave===null)skFaoFoldSave=faoFolded;if(!faoFolded)faoFoldSet(true);}catch(e){}
  // Les mises à niveau ci-dessus (rdV, chk, audit) ne sont pas une modification : la référence du
  // filet les inclut, sans quoi ouvrir puis fermer une esquisse laissait une étape « vide »
  try{docBaseSync();}catch(e){}
}
function closeSketch(save){
  skOpenAt=0;
  $('sketchOverlay').classList.remove('open');
  try{$('skStatWrap').style.display='none';}catch(e){}
  sketchRestoreCamera();
  if(skAnteriorGhost){ try{scene.remove(skAnteriorGhost); skAnteriorGhost.geometry.dispose();}catch(e){} skAnteriorGhost=null; }
  bodies.forEach(b=>{
    if(!b.ghost) b.mesh.visible=true;
    if(b._savedOpacity!=null&&b.mesh&&b.mesh.material){ b.mesh.material.opacity=b._savedOpacity; b.mesh.material.transparent=b._savedTransparent; delete b._savedOpacity; delete b._savedTransparent; }
  });
  // Mode de fondu effacé AVANT le rebuild de sortie : sinon buildDone→skApplyFade
  // repose le fondu SK_FACE_ALPHA après restauration et la pièce resterait translucide.
  if(skEdit)skEdit._fade=null;
  skAnteriorEdges=null;
  try{skEdgesDrop();const eo=scene.getObjectByName('edgeOverlay');if(eo)eo.visible=true;}catch(e){}
  // Sortie : le verrou est TOUJOURS levé (validation comme annulation) pour régénérer
  // la fonction modifiée et celles qui suivent ; sans rebuild de sortie, un verrou posé
  // à l'ouverture laisserait l'arbre bloqué.
  if(skEdit)tlEditUnlock();
  if(save&&skEdit){try{parApplyAll();}catch(e){}solveSketch(skEdit);cleanupSk(skEdit);repSyncForSketch(skEdit.id);markDirty();rebuild();projRefreshRerun(0);sel={kind:'sketch',id:skEdit.id};renderTree();renderProps();}
  else if(skEdit){markDirty();try{rebuild();}catch(e){}renderTree();renderProps();}
  const skNm=skEdit&&skEdit.name;
  skEdit=null;try{docUndoUI();}catch(e){} // V0.7.6 : les flèches du haut reviennent au document
  // Toute la session d'esquisse = UNE étape d'annulation du document (filet, 45)
  try{undoActLabel='esquisse « '+(skNm||'')+' »';undoActT=Date.now();docCheckpoint();}catch(e){}
  skSel=null;skSelX=[];skChain=null;skArcC=null;skArcPa=null;skDraft=null;skDown=null;skDrag=null;skDimDrag=null;skDimLine=null;skDimRef=null;skBox=null;skDragEnt=null;skDyn=null;skInfer=null;skPan=null;skSnapMk=null;skDimPlace=null;skProjectHover=null;
  // Arborescence re-dépliée à la sortie, sauf si l'état antérieur était
  // rabattu (choix manuel de l'utilisateur conservé).
  try{if(skTreeFoldSave===false)treeFoldSet(false);skTreeFoldSave=null;}catch(e){}
  try{if(skFaoFoldSave===false)faoFoldSet(false);skFaoFoldSave=null;}catch(e){}
}
const svg=$('skSvg');
const NS='http://www.w3.org/2000/svg';
function svgSize(){return{ W:svg.clientWidth||800,H:svg.clientHeight||500};}
function w2s(x,y){const{W,H}=svgSize();const s=skView.s;return[(W/2+(x-skView.cx)*s),(H/2-(y-skView.cy)*s)];}
function s2w(px,py){const{W,H}=svgSize();const s=skView.s;return[(skView.cx+(px-W/2)/s),(skView.cy-(py-H/2)/s)];}
let skView={s:2.2,cx:0,cy:0}; // vue 2D : échelle px/mm + centre monde (molette = zoom, clic droit glissé = pan, clic-molette glissé = orbite)
// 2026-10-15-008 : TOUTES les tolérances de pointage sont en PIXELS ÉCRAN (divisées par
// l'échelle px/mm). Avant, plusieurs appels ajoutaient des mm fixes (SK_PICK+2, +3) :
// zoomé fort sur une petite pièce, « +2 mm » valait 80 px et la zone des extrémités
// couvrait toute la ligne — on ne pouvait plus prendre que les points.
//   SK_PICK 8 px (entité) · SK_PT 10 px (point, prioritaire) · SK_PICKX 12 px (congé,
//   chanfrein, ajuster) · SK_SNAP 10 px (accroche) · SK_INF 6 px (inférences H/V).
const SK_SCALE_MIN=0.15, SK_SCALE_MAX=600; // px/mm : de ~5 m à ~1 mm à l'écran
const SK_DEF_SPAN=130; // mm visibles par défaut sur le petit côté (pièces ~100 mm)
function skUpdateTols(){SK_SNAP=10/skView.s;SK_PICK=8/skView.s;SK_PT=10/skView.s;SK_PICKX=12/skView.s;SK_INF=6/skView.s;}
function skSnapStep(){const stps=[0.001,0.002,0.005,0.01,0.02,0.05,0.1,0.2,0.5,1,2,5,10,20,50,100,200,500,1000];for(const st of stps){if(st*skView.s>=8)return st;}return 1000;}
function skSnapVal(v){const st=skSnapStep();return Math.round(v/st)*st;}
function skSetZoom(ns,fx,fy){
  const W=svgSize().W,H=svgSize().H,s0=skView.s;
  const s1=Math.max(SK_SCALE_MIN,Math.min(SK_SCALE_MAX,ns));if(s1===s0)return;
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
      refs.forEach(r=>{
        if(r.type==='circle'&&isFinite(r.cx)&&r.r>0){x0=Math.min(x0,r.cx-r.r);x1=Math.max(x1,r.cx+r.r);y0=Math.min(y0,r.cy-r.r);y1=Math.max(y1,r.cy+r.r);return;} // cercle : pas de x1/x2
        if(r.x1<x0)x0=r.x1;if(r.x1>x1)x1=r.x1;if(r.x2<x0)x0=r.x2;if(r.x2>x1)x1=r.x2;
        if(r.y1<y0)y0=r.y1;if(r.y1>y1)y1=r.y1;if(r.y2<y0)y0=r.y2;if(r.y2>y1)y1=r.y2;});
      if(!(x1>x0)&&!(y1>y0)){x0=-SK_DEF_SPAN/2;x1=SK_DEF_SPAN/2;y0=-SK_DEF_SPAN/2;y1=SK_DEF_SPAN/2;} // références sans étendue lisible
      const{W,H}=svgSize(),bw=Math.max(x1-x0,1),bh=Math.max(y1-y0,1);
      skView.s=Math.max(SK_SCALE_MIN,Math.min(SK_SCALE_MAX,Math.min(W/bw,H/bh)*0.7));
      skView.cx=(x0+x1)/2;skView.cy=(y0+y1)/2;
      skUpdateTols();if(skEdit)drawSketch2D();return;
    }
    {const{W,H}=svgSize();skView={s:Math.max(SK_SCALE_MIN,Math.min(W,H)/SK_DEF_SPAN),cx:0,cy:0};} // esquisse vide : ~130 mm visibles
    skUpdateTols();if(skEdit)drawSketch2D();return;}
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  ids.forEach(pid=>{const p=P[pid];if(p.x<x0)x0=p.x;if(p.x>x1)x1=p.x;if(p.y<y0)y0=p.y;if(p.y>y1)y1=p.y;});
  // bw/bh plancher 0,01 mm (était 1 mm : une esquisse de 0,5 mm cadrait comme 1 mm)
  const{W,H}=svgSize(),bw=Math.max(x1-x0,0.01),bh=Math.max(y1-y0,0.01);
  skView.s=Math.max(SK_SCALE_MIN,Math.min(SK_SCALE_MAX,Math.min(W/bw,H/bh)*0.7));
  skView.cx=(x0+x1)/2;skView.cy=(y0+y1)/2;
  skUpdateTols();if(skEdit)drawSketch2D();
}
function evXY(e){const r=svg.getBoundingClientRect();return s2w(e.clientX-r.left,e.clientY-r.top);}
// Événement souris ramené à la « vue normale » : en orbite, clientX/clientY sont remplacés par
// le point du plan sous le curseur (application affine inverse). Les gestionnaires du SVG
// (positions ET écarts de glisser) n'ont donc pas à connaître l'angle de vue.
function skEv(e){
  if(!skOrbOn()||!e)return e;
  const r=svg.getBoundingClientRect(),[x,y]=skOrbInv(e.clientX-r.left,e.clientY-r.top),cx=r.left+x,cy=r.top+y;
  return new Proxy(e,{get(t,k){if(k==='clientX')return cx;if(k==='clientY')return cy;const v=t[k];return typeof v==='function'?v.bind(t):v;}});
}
let SK_SNAP=5, SK_INF=2.5, SK_PICK=4, SK_PT=5, SK_PICKX=6;
skUpdateTols();
let skTool='select',skDraft=null,skMsg='',skOffArm=null;
let skDown=null,skChain=null,skInfer=null,skSnapMk=null,skSel=null,skSelX=[],skDrag=null,skDragMoved=false,skDragPushed=false,skDimDrag=null,skPan=null;
let skBox=null,skDragEnt=null,skDyn=null; // sélection rect · déplacement d'entité · saisie dynamique (longueur/angle)
let skOffsetD=5; // distance « auto » du menu ⇄ Décaler (contexte) : déclarée ici car le menu la lit AVANT tout usage de l'outil — sinon ReferenceError et menu jamais affiché
let skDimPlace=null; // placement de cote : {id} → la cote suit le curseur jusqu'au clic
let skPendPt=null,skCoinA=null,skCornA=null,skArcC=null,skArcA1=null,skArcPa=null;
let skProjectHover=null; // ⧉ : arête projetable sous le curseur (preview orange)
