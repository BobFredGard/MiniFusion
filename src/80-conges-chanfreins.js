/* ---------- congés : mode maillage (verticales + périmètres) + mode exact OCCT (toutes arêtes) ---------- */
let filMode=null,filHover=null;
let filModeX=null,xHover=null; // mode exact : sel=[{pos:[x,y,z],r}], edges=occListEdges, radius=défaut
let occSkipFeat=null; // id de fonction exclue du rejeu (édition de congé : revoir les arêtes vives AVANT elle)
function filEdgeKey(fp){return fp.x.toFixed(2)+','+fp.y.toFixed(2);}
function filletTarget(){
  if(sel.kind==='body'){const b=bodies.find(x=>x.id===sel.id);if(b&&b.kind==='extrude')return b.ref;}
  if(sel.kind==='feature'){const f=doc.features.find(x=>x.id===sel.id);if(f&&f.type==='extrude')return f.id;}
  const ex=doc.features.filter(f=>f.type==='extrude'&&f.visible!==false);
  if(ex.length===1)return ex[0].id;
  return null;
}
function enterFilletMode(){
  if(skEdit)return;
  if(occHas()&&occLive&&occLive.shape){enterExactFilletMode();return;}
  const tid=filletTarget();
  if(!tid){faceEl.textContent='Congé : sélectionnez d\u2019abord un corps extrudé (ou son extrusion dans l\u2019arbre).';return;}
  const F=doc.features.find(x=>x.id===tid);if(!F||F.type!=='extrude'){faceEl.textContent='Congé : extrusion introuvable.';return;}
  filMode={target:tid,sketchId:F.sketchId,sel:[],rims:{top:false,bottom:false},radius:2};
   buildFilletOverlay();renderFilletPanel();
   faceEl.textContent='Congé : cliquez N\u2019IMPORTE QUELLE arête — verticale = congé de coin, horizontale haut/bas = arrondi · clic face haute/basse = tout le périmètre · Échap = quitter.';
}
function exitFilletMode(silent){
  if(filModeX){exitExactFilletMode(silent);return;}
  if(!filMode)return;
  filMode=null;filHover=null;
  const o=scene.getObjectByName('filEdges');if(o)scene.remove(o);{const orb=scene.getObjectByName('filRibbons');if(orb)scene.remove(orb);}
  if(!silent)renderProps();
}
/* ----- mode exact : N'importe quelle arête du solide exact, rayon par arête ----- */
function enterExactFilletMode(editF,kind){
  if(skEdit)return;
  const editing=(editF&&editF.type==='xfillet')?editF:null;
  const k=editing?xKindOf(editing):(kind||'fillet');
  const label=xLabel(k);
  if(filModeX){
    if(editF&&filModeX.editing===editF.id)return; // déjà en édition de ce congé
    exitFilletMode(true); // quitte proprement (restaure un éventuel rejeu partiel)
  }
  if(!occLive||!occLive.shape){ // recalcul paresseux : le BRep n'existe que si besoin
    if(!occHas()){faceEl.textContent=label+' : solide exact indisponible (OCCT non chargé ou aucun volume).';return;}
    faceEl.textContent=label+' : recalcul du solide…';
    try{rebuild();}catch(e){}
    if(!occLive||!occLive.shape){faceEl.textContent=label+' : recalcul impossible.';return;}
  }
  if(filMode)exitFilletMode(true);
  // tangent : les arêtes tangentes à celle cliquée sont ajoutées automatiquement (coché par
  // défaut). Un clic = UNE arête ; plus de double-clic qui attrapait une chaîne entière.
  // En édition : la case reste sur l'état PERSISTÉ du congé (f.tangent) — elle ne se
  // remet plus « cochée » en dépit de l'utilisateur à chaque réédition.
  filModeX={sel:[],seeds:[],tangent:editing?(editing.tangent!==false):true,radius:xIsChamfer(k)?1:10,edges:[],editing:editing?editing.id:null,kind:k}; // défauts : congé 10, chanfrein 1
  if(editing){
    // Édition : rejeu SANS la fonction (occSkipFeat) → les arêtes vives d'origine redeviennent
    // cliquables (l'arrondi appliqué les a remplacées par des surfaces tangentes).
    const seen=[];
    (editing.edges||[]).forEach(s=>{
      if(seen.some(u=>Math.abs((u.r||0)-(s.r||0))<1e-9&&Math.hypot(u.pos[0]-s.pos[0],u.pos[1]-s.pos[1],u.pos[2]-s.pos[2])<=0.75))return;
      seen.push(s);
      filModeX.sel.push({pos:s.pos.slice(),pos0:(s.pos0||s.pos).slice(),r:s.r||2,len:+(s.len||0)||0,anchor:s.anchor||null,name:s.name||null,seed:s.seed?1:0});
    });
    const rr=filModeX.sel.find(s=>s.r>0);if(rr)filModeX.radius=rr.r;
    occSkipFeat=editing.id;
    tlEditLock(editing); // arbre bloqué sur le congé : seules les opérations précédentes rejouées
    try{rebuild();}catch(e){}
    if(!occLive||!occLive.shape){occSkipFeat=null;filModeX=null;if(tlMark===editing.id)tlSetPtr(null);faceEl.textContent=label+' : recalcul impossible.';return;}
  }
  try{filModeX.edges=occSharpEdges(occLive.shape).filter(e=>e.sharp);}
  catch(e){
    if(editing){occSkipFeat=null;filModeX=null;markDirty();try{rebuild();}catch(e2){}}
    faceEl.textContent=label+' : listage des arêtes impossible ('+e.message+').';return;
  }
  if(!filModeX.edges.length){exitFilletMode(true);faceEl.textContent=label+' : aucune arête vive (que du tangentiel lisse).';return;}
  // les arêtes déjà retenues par la fonction éditée deviennent des germes (en édition, pas
  // de re-déduction tangente : on ne veut pas élargir silencieusement une sélection existante)
  if(editing){
    const prevT=filModeX.tangent;filModeX.tangent=false;
    // Germes = les arêtes cliquées à la CRÉATION (f.edges[].seed persisté) : la tangence
    // se re-déduit d'elles au rejeu. Rétrocompat : documents antérieurs sans drapeau →
    // tout est germe (comportement d'avant : toutes les entrées = toutes les graines).
    const anySeed=(editing.edges||[]).some(o=>o.seed);
    (filModeX.sel||[]).forEach(s=>{
      const i=filModeX.edges.findIndex(e=>Math.hypot(e.mid[0]-s.pos[0],e.mid[1]-s.pos[1],e.mid[2]-s.pos[2])<0.75);
      if(i>=0&&(!anySeed||s.seed))xSeedAdd(i);
    });
    filModeX.tangent=prevT;
  }
  buildExactOverlay();renderExactPanel();paintExact();
  xPreviewUpdate(); // création comme édition : l'aperçu part dès l'entrée, sur la sélection chargée
  faceEl.textContent=editing
    ?`Édition « ${editing.name} » : ✕ ou clic sur une ligne de la liste = retirer · arête/face 3D = ajouter · ${filModeX.edges.length} arêtes · « Enregistrer » valide, Échap/Annuler restitue.`
    :`${label} : cliquez des arêtes vives (${filModeX.edges.length}, coutures lisses exclues) ou une face (toute sa boucle) · ${xIsChamfer(k)?'distance':'rayon'} par arête · aperçu rouge avant de valider · Échap = quitter.`;
}
function exitExactFilletMode(silent){
  if(!filModeX)return;
  const wasEditing=!!filModeX.editing;
  if(wasEditing)occSkipFeat=null;
  filModeX=null;xHover=null;
  try{xPrevRemove();}catch(e){}
  const o=scene.getObjectByName('filEdges');if(o)scene.remove(o);{const orb=scene.getObjectByName('filRibbons');if(orb)scene.remove(orb);}
  if(wasEditing){tlEditUnlock();markDirty();try{rebuild();}catch(e){}} // lève le verrou : la fonction modifiée ET celles qui suivent sont régénérées
  if(!silent)renderProps();
}
function xIsSel(i){
  if(!filModeX)return false;
  const m=filModeX.edges[i].mid;
  return filModeX.sel.some(s=>Math.hypot(s.pos[0]-m[0],s.pos[1]-m[1],s.pos[2]-m[2])<0.75);
}
function xIsSeed(i){return !!(filModeX&&filModeX.seeds&&filModeX.seeds.indexOf(i)>=0);}
function xSeedAdd(i){
  if(!filModeX||!filModeX.edges[i])return;
  if(!filModeX.seeds)filModeX.seeds=[];
  if(filModeX.seeds.indexOf(i)<0)filModeX.seeds.push(i);
}
function xSeedDel(i){
  if(!filModeX||!filModeX.seeds)return;
  const k=filModeX.seeds.indexOf(i);
  if(k>=0)filModeX.seeds.splice(k,1);
}
/* Sélection exacte : ce que l'UTILISATEUR a choisi = les « germes » (les arêtes
   réellement cliquées). La sélection affichée s'en déduit : avec l'option « arêtes
   tangentes », chaque germe entraîne sa chaîne tangente, sans que l'utilisateur ait à
   la trouver ni à la retenir. Sans l'option : exactement le germe, rien de plus.
   Un clic = UNE arête (plus de double-clic à chaîne, imprévisible : sur un congé déjà
   existant il attrapait toute la bande tangente). Les germes sont.enums en jaune, les
   tangentes déduites en rouge : on voit toujours d'où vient la sélection. */
function xSelSync(){
  if(!filModeX)return;
  const want=[];
  (filModeX.seeds||[]).forEach(i=>{
    if(!filModeX.edges[i])return;
    // 2026-10-16-015 : la sélection (et l'arbre) = EXACTEMENT les arêtes cliquées, cochée ou
    // non ; la case « tangentes » ne dit qu'au calcul de suivre la chaîne tangente (f.tangent).
    if(want.indexOf(i)<0)want.push(i);
  });
  const kept=[];
  want.forEach(i=>{
    const e=filModeX.edges[i];if(!e)return;
    const m=e.mid;
    if(kept.some(u=>Math.hypot(u.pos[0]-m[0],u.pos[1]-m[1],u.pos[2]-m[2])<0.75))return;
    let anchor=null;try{anchor=xAnchorFor(m);}catch(err){anchor=null;}
    kept.push({pos:m.slice(),r:filModeX.radius,len:+((e.len||0).toFixed(3)),anchor,name:entName('edge')});
  });
  // un rayon saisi arête par arête survit à un changement de sélection
  filModeX.sel.forEach(s=>{
    const k=kept.findIndex(u=>Math.hypot(u.pos[0]-s.pos[0],u.pos[1]-s.pos[1],u.pos[2]-s.pos[2])<0.75);
    if(k>=0)kept[k].r=s.r;
  });
  filModeX.sel=kept;
  xPreviewUpdate();
}
/* ----- Aperçu rouge translucide du résultat AVANT validation (congé ET chanfrein) -----
   On montre le SOLIDE COMPLET avec congé/chanfrein, comme les aperçus dépouille (bleu)
   et coque (vert) : les 2 booléens de diff « matière ajoutée / retirée » coûtaient plus
   cher que le congé lui-même, pour un patch dont le choix ajout/retrait était fragile
   (boucle mixte). Même langage visuel partout, moitié moins de booléens par recalcule. */
let xPrevBody=null;
function xPrevRemove(){
  if(xPrevBody){
    if(xPrevBody.mesh){try{scene.remove(xPrevBody.mesh);xPrevBody.mesh.geometry.dispose();}catch(e){}}
    bodies=bodies.filter(b=>b!==xPrevBody);
    xPrevBody=null;
  }
  // la pièce réelle réapparaît telle quelle (l'aperçu la remplaçait)
  bodies.forEach(b=>{
    if(b._xSaved==null||!b.mesh)return;
    b.mesh.visible=b._xVis!==false;
    delete b._xSaved;delete b._xVis;
  });
  try{refreshParts();}catch(e){}
}
// 2026-10-16-015 : signatures géométriques des faces (plan : normale + distance ; cylindre :
// axe + rayon ; autre : type + centre) — une face du RÉSULTAT sans équivalent dans le solide
// de départ est une face NOUVELLE (congé / chanfrein) → surlignée dans l'aperçu.
function occFaceKeys(shape){
  const keys=[];const r=v=>Math.round(v*200)/200;
  const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
  const ex=new occt.TopExp_Explorer_2(shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);
  const T=occt.GeomAbs_SurfaceType;
  while(ex.More()){
    let k='?';
    try{
      const f=occt.TopoDS.Face_1(ex.Current());
      const s=new occt.BRepAdaptor_Surface_2(f,true);const ty=s.GetType();
      if(ty===T.GeomAbs_Plane){
        const pl=s.Plane(),ax=pl.Axis(),d=ax.Direction(),p=ax.Location();
        let n=[d.X(),d.Y(),d.Z()];const sg=(Math.abs(n[0])>1e-9?n[0]:(Math.abs(n[1])>1e-9?n[1]:n[2]))<0?-1:1;n=n.map(v=>v*sg);
        k='P'+n.map(r).join(',')+'|'+r(n[0]*p.X()+n[1]*p.Y()+n[2]*p.Z());
      }else if(ty===T.GeomAbs_Cylinder){
        const cy=s.Cylinder(),ax=cy.Axis(),d=ax.Direction(),p=ax.Location();
        let n=[d.X(),d.Y(),d.Z()];const sg=(Math.abs(n[0])>1e-9?n[0]:(Math.abs(n[1])>1e-9?n[1]:n[2]))<0?-1:1;n=n.map(v=>v*sg);
        const t=n[0]*p.X()+n[1]*p.Y()+n[2]*p.Z(),q=[p.X()-n[0]*t,p.Y()-n[1]*t,p.Z()-n[2]*t];
        k='C'+n.map(r).join(',')+'|'+q.map(r).join(',')+'|'+r(cy.Radius());
      }else{
        const u=(s.FirstUParameter()+s.LastUParameter())/2,v=(s.FirstVParameter()+s.LastVParameter())/2,m=s.Value(u,v);
        k='S'+String(ty&&ty.value!==undefined?ty.value:ty)+'|'+[m.X(),m.Y(),m.Z()].map(r).join(',');
      }
      try{s.delete();}catch(e){}
    }catch(e){k='?';}
    keys.push(k);ex.Next();
  }
  try{ex.delete();}catch(e){}
  return keys;
}
let xBaseKeys={shape:null,keys:null};
function xNewFaces(base,res){
  if(xBaseKeys.shape!==base){xBaseKeys={shape:base,keys:new Set(occFaceKeys(base))};}
  return occFaceKeys(res).map(k=>k==='?'||!xBaseKeys.keys.has(k));
}
function xPreviewShape(base,jobs,cham){
  // Forme montrée par l'aperçu : le SOLIDE COMPLET avec congé/chanfrein appliqué, ou
  // null si impossible. Extraite pour être testée telle quelle (test_apercu_diff.cjs),
  // pas recopiée dans le test — la copie dérive, la fonction non.
  if(!base||!jobs||!jobs.length)return null;
  const warns=[];
  let sh=null;
  try{sh=occFilletRun(base,jobs,warns,cham,{single:!!(filModeX&&filModeX.tangent===false)});}catch(e){sh=null;}
  return sh?{shape:sh}:null;
}
function xPreviewUpdate(){
  try{
    if(!filModeX){xPrevRemove();return;}
    const sel=filModeX.sel.filter(s=>s.r>0);
    if(!sel.length||!occLive||!occLive.shape){xPrevRemove();return;}
    // rien à recalculer si la sélection et les rayons n'ont pas bougé
    const sig=sel.map(s=>s.pos.map(v=>v.toFixed(2)).join(',')+'/'+s.r).join('|')+(xIsChamfer(filModeX.kind)?'#c':'#f')+(filModeX.tangent===false?'#1':'#t');
    if(filModeX._prevSig===sig)return;
    const cham=xIsChamfer(filModeX.kind);
    const E=occListEdges(occLive.shape);
    const jobs=[];
    sel.forEach(s=>{
      let bi=-1,bd=1e9;
      E.forEach((e,i)=>{const d=Math.hypot(e.mid[0]-s.pos[0],e.mid[1]-s.pos[1],e.mid[2]-s.pos[2]);if(d<bd){bd=d;bi=i;}});
      if(bi>=0&&bd<1.5)jobs.push({src:E[bi].src,r:s.r,mid:E[bi].mid});
    });
    if(!jobs.length){xPrevRemove();return;}
    const pv=xPreviewShape(occLive.shape,jobs,cham);
    if(!pv||!pv.shape){xPrevRemove();return;}
    const sh=pv.shape;
    let g=null,isNew=null;
    try{g=occTessellate(sh,0.5);}catch(e){g=null;}
    try{isNew=xNewFaces(occLive.shape,sh);}catch(e){isNew=null;}
    try{sh.delete();}catch(e){}
    if(!g){xPrevRemove();return;}
    xPrevRemove();
    // 2026-10-16-015 : APERÇU = le résultat lui-même, dans la couleur de la pièce, opaque, À LA
    // PLACE de la pièce ; seules les faces NOUVELLES (congé / chanfrein) sont en orange.
    // (avant : solide rouge translucide sur une pièce estompée, peu lisible)
    let col=0x0a84ff;
    bodies.forEach(b=>{
      if(b.ghost||!b.mesh||!b.mesh.material||b.preview)return;
      try{if(b.mesh.material.color)col=b.mesh.material.color.getHex();}catch(e){}
      b._xSaved=1;b._xVis=b.mesh.visible;b.mesh.visible=false;
    });
    g.clearGroups();
    (g.userData.occGroups||[]).forEach(o=>g.addGroup(o.start*3,o.count*3,(isNew&&isNew[o.f])?1:0));
    const matBase=new THREE.MeshStandardMaterial({color:col,roughness:0.4,metalness:0.35,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
    const matNew=new THREE.MeshStandardMaterial({color:0xff7a1f,emissive:0x5a2000,roughness:0.3,metalness:0.1,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
    const mesh=new THREE.Mesh(g,[matBase,matNew]);mesh.name='xPreview';
    mesh.renderOrder=0;
    mesh.userData.bid='x_preview';mesh.raycast=()=>{};
    scene.add(mesh);
    xPrevBody={id:'x_preview',name:'🟠 Aperçu (non validé)',mesh,color:0xff7a1f,visible:true,kind:'ghost',ref:null,ghost:true,preview:true};
    bodies.push(xPrevBody);
    filModeX._prevSig=sig;
    try{refreshParts();}catch(e){}
  }catch(e){xPrevRemove();}
}
  function buildExactOverlay(){
    try{
    const old=scene.getObjectByName('filEdges');
    if(old)scene.remove(old);
    if(!filModeX)return;
     // une seule LineSegments pour toutes les arêtes : 1 draw-call, couleur par sommet.
     // chaque arête est une POLYLIGNE à NOMBRE DE POINTS VARIABLE (affinage 30m : 2 points
     // pour une droite, ~40-60 pour un cercle) : on émet TOUS ses segments (sinon on ne
     // dessine qu'une fraction de l'arête et les arcs sont amputés) + table seg→arête.
    const positions=[];
    const colors=[];
    const segEdge=[];
    filModeX.edges.forEach((e,i)=>{
      const p=e.pts;
      for(let k=0;k+1<p.length;k++){
        positions.push(p[k][0],p[k][1],p[k][2],p[k+1][0],p[k+1][1],p[k+1][2]);
        colors.push(0,0,0,0,0,0);
        segEdge.push(i);
      }
    });
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    const mat=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0.95,depthTest:true});
    const l=new THREE.LineSegments(geo,mat);
    l.renderOrder=999;
    l.userData.segEdge=segEdge;
    const grp=new THREE.Group();grp.name='filEdges';grp.add(l);
    scene.add(grp);
    paintExact();
    }catch(e){faceEl.textContent=xLabel(filModeX&&filModeX.kind)+' : affichage impossible ('+e.message+').';}
  }

  function paintExact(){
    const grp=scene.getObjectByName('filEdges');if(!grp||!filModeX)return;
    const l=grp.children[0];if(!l||!l.geometry||!l.geometry.attributes.color)return;
    const col=l.geometry.attributes.color;
    const segEdge=l.userData.segEdge;if(!segEdge)return;
    const c=new THREE.Color(),cache={};
    // défaut = noir · survol = jaune · germe = jaune · arête retenue = rouge (par ARÊTE)
    for(let k=0;k<segEdge.length;k++){
      const i=segEdge[k];
      let hex=cache[i];
      if(hex===undefined)hex=cache[i]=0x000000; // trait de base noir, comme la vue 3D
      c.setHex(hex);
      col.setXYZ(k*2,c.r,c.g,c.b);
      col.setXYZ(k*2+1,c.r,c.g,c.b);
    }
    col.needsUpdate=true;
    // 2026-10-16-015 : MÊME code que la vue 3D sans fonction active — survol = ruban orange
    // sanguine, arête retenue (cliquée ou tangente déduite) = ruban orange, 1,6 px.
    try{
      let rg=scene.getObjectByName('filRibbons');
      if(rg){scene.remove(rg);rg.traverse(o=>{try{o.geometry&&o.geometry.dispose();o.material&&o.material.dispose();}catch(e){}});}
      rg=new THREE.Group();rg.name='filRibbons';
      (filModeX.edges||[]).forEach((e,i)=>{
        if(!e||!e.pts||e.pts.length<2)return;
        if(xIsSel(i)||xIsSeed(i))edgeHoverDraw(e.pts,rg,0xff9f0a);
        else if(xHover===i)edgeHoverDraw(e.pts,rg,0xff5a1f);
      });
      scene.add(rg);
    }catch(e){}
  }

function exactPick(e){
  const grp=scene.getObjectByName('filEdges');if(!grp)return null;
  const r=renderer.domElement.getBoundingClientRect();
  const ndc=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
  rayc.setFromCamera(ndc,camera);
  rayc.params.Line.threshold=2;
  const hits=rayc.intersectObjects(grp.children,false);
  if(!hits.length)return null;
  const segEdge=hits[0].object.userData.segEdge;
  if(!segEdge)return null;
  // LineSegments non indexé : l'index rendu est le sommet de départ (0,2,4…) → seg = index/2
  const i=segEdge[Math.round(hits[0].index/2)];
  return (i!==undefined&&i>=0&&filModeX&&i<filModeX.edges.length)?i:null;
}
function occFaceEdges(faceOrd,shape){
  // Milieux des arêtes d'une face BRep (par rang, même ordre que la tessellation).
  // Multi-corps : `shape` = solide du corps cliqué (ordinaux par solide) ; à défaut
  // le composé occLive (ancien comportement, 1 seul corps).
  const out=[],bin=[];
  try{
    const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
    const ex=new occt.TopExp_Explorer_2(shape||occLive.shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);bin.push(ex);
    let k=0,face=null;
    while(ex.More()){if(k===faceOrd){face=occt.TopoDS.Face_1(ex.Current());bin.push(face);break;}k++;ex.Next();}
    if(!face)return out;
    const ee=new occt.TopExp_Explorer_2(face,occt.TopAbs_ShapeEnum.TopAbs_EDGE,SH);bin.push(ee);
    while(ee.More()){
      const e=occt.TopoDS.Edge_1(ee.Current());bin.push(e);
      try{
        const ad=new occt.BRepAdaptor_Curve_2(e);bin.push(ad);
        const u0=ad.FirstParameter(),u1=ad.LastParameter();
        if(u1>u0){const m=ad.Value((u0+u1)/2);bin.push(m);out.push([m.X(),m.Y(),m.Z()]);}
      }catch(err){}
      ee.Next();
    }
  }catch(e){}
  occDispose(bin);
  return out;
}
function exactFaceToggle(e){
  // Clic sur une face = (dé)sélectionne toute sa boucle d'arêtes (ex : fond de poche, face supérieure).
  if(!filModeX||!occLive||!occLive.shape)return false;
  const pk=pickFace(e);
  if(!pk||!pk.mesh)return false;
  const bd=bodies.find(b=>b.mesh===pk.mesh);
  if(!bd||bd.kind!=='body')return false;
  const groups=pk.mesh.geometry.userData.occGroups||[];
  const g=groups.find(g=>pk.fi>=g.start&&pk.fi<g.start+g.count);
  if(!g)return false;
  const mids=occFaceEdges(g.f,bd.shape||occLive.shape);
  if(!mids.length)return false;
  const idx=mids.map(m=>{
    let bi=-1,bd=0.75;
    filModeX.edges.forEach((e,i)=>{const d=Math.hypot(e.mid[0]-m[0],e.mid[1]-m[1],e.mid[2]-m[2]);if(d<bd){bd=d;bi=i;}});
    return bi;
  });
  const hasSharp=idx.some(i=>i>=0);
  if(hasSharp){
    const valid=idx.filter(i=>i>=0);
    const allIn=valid.every(i=>xIsSel(i));
    valid.forEach(i=>{
      if(allIn)xSeedDel(i);else xSeedAdd(i);
    });
    xSelSync();
    paintExact();renderExactPanel();
    faceEl.textContent=`${xLabel(filModeX.kind)} : boucle de ${valid.length} arête(s) ${allIn?'retirée':'ajoutée'} · ${filModeX.sel.length} au total.`;
    return true;
  }
  // Fallback : face sans arête vive (ex : périmètre déjà adouci) — on ne peut pas indexer
  // ses arêtes : on conserve ces positions comme germes « libres » (hors.edges).
  const allIn2=mids.every(m=>filModeX.sel.some(s=>Math.hypot(s.pos[0]-m[0],s.pos[1]-m[1],s.pos[2]-m[2])<0.75));
  mids.forEach(m=>{
    const k=filModeX.sel.findIndex(s=>Math.hypot(s.pos[0]-m[0],s.pos[1]-m[1],s.pos[2]-m[2])<0.75);
    if(allIn2){if(k>=0)filModeX.sel.splice(k,1);}
    else if(k<0){
      let anchor=null;try{anchor=xAnchorFor(m);}catch(err){anchor=null;}
      filModeX.sel.push({pos:m.slice(),r:filModeX.radius,len:0,anchor,name:entName('edge')});
    }
  });
  paintExact();renderExactPanel();
  xPreviewUpdate();
  faceEl.textContent=`${xLabel(filModeX.kind)} : boucle de ${mids.length} arête(s) ${allIn2?'retirée':'ajoutée'} (géométrique) · ${filModeX.sel.length} au total.`;
  return true;
}
function xSelAdd(i){
  // Ajoute l'arête i comme germe, puis recalcule la sélection (éventuellement + tangentes).
  xSeedAdd(i);xSelSync();
}
function exactToggle(e){
  try{
    if(!filModeX||!filModeX.edges)return;
    const i=exactPick(e);
    if(i===null||i===undefined||!filModeX.edges[i]){
      if(exactFaceToggle(e))return;
      faceEl.textContent=xLabel(filModeX.kind)+' : cliquez une arête bleue (ou une face = toute sa boucle).'+
        (filModeX.tangent?' Les arêtes tangentes à celle cliquée sont ajoutées automatiquement.':' Clic = cette arête · Ctrl/Cmd+clic = ajouter / retirer.');
      return;
    }
    // 2026-10-16-015 : clic = CETTE arête seule (remplace la sélection) ; Ctrl/Cmd+clic = ajouter /
    // retirer. Avec « arêtes tangentes », chaque arête choisie entraîne sa chaîne tangente.
    const multi=!!(e&&(e.ctrlKey||e.metaKey));
    if(multi){if(xIsSeed(i))xSeedDel(i);else xSeedAdd(i);}
    else if(filModeX.editing){if(xIsSeed(i))xSeedDel(i);else xSeedAdd(i);} // édition : on complète la sélection chargée
    else{const only=(filModeX.seeds||[]).length===1&&xIsSeed(i);filModeX.seeds=only?[]:[i];}
    xSelSync();
    paintExact();renderExactPanel();
    const extra=(filModeX.tangent&&filModeX.sel.length>(filModeX.seeds||[]).length)
      ?' ('+filModeX.sel.length+' retenues dont '+(filModeX.seeds||[]).length+' cliquée(s) + tangentes)':'';
    faceEl.textContent=`${xLabel(filModeX.kind)} : ${filModeX.sel.length} arête(s) sélectionnée(s)${extra}.`;
  }catch(err){faceEl.textContent=xLabel(filModeX&&filModeX.kind)+' : sélection impossible ('+err.message+').';}
}
function exactTangentToggle(startIdx){
  // Conservé pour la compatibilité (plus de double-clic) : bascule l'état de l'option
  // « arêtes tangentes » et recalcule la sélection à partir des germes.
  if(!filModeX)return;
  filModeX.tangent=!filModeX.tangent;
  xSelSync();paintExact();renderExactPanel();
  xPreviewUpdate();
  faceEl.textContent=`${xLabel(filModeX.kind)} : arêtes tangentes ${filModeX.tangent?'ajoutées automatiquement':'désactivées'} · ${filModeX.sel.length} arête(s).`;
}
function xTangentChainOf(list,startIdx){
  // Chaîne tangente sur une LISTE d'arêtes arbitraire. Extrait d'occTangentChain (qui ne
  // marche que sur filModeX.edges, indisponible pendant un rejeu) : src/20 en a besoin
  // pour rejouer une tangence persistée directement sur les arêtes du solide actuel.
  const n=list.length;
  if(startIdx<0||startIdx>=n) return [startIdx];
  try{
    const vmap=new Map(); // vertex key -> [edgeIdx]
    const edgeKeys=[];
    for(let i=0;i<n;i++){
      const e=list[i];
      const pts=e.pts||[];
      if(pts.length<2) continue;
      const norm=v=> (Math.abs(v)<0.0005?0:v).toFixed(3);
      const p0=pts[0], p1=pts[pts.length-1];
      const k0=p0.map(norm).join(',');
      const k1=p1.map(norm).join(',');
      edgeKeys[i]=[k0,k1];
      if(!vmap.has(k0)) vmap.set(k0,[]);
      if(!vmap.has(k1)) vmap.set(k1,[]);
      vmap.get(k0).push(i);
      vmap.get(k1).push(i);
    }
    const getTan=(ei, atEnd)=>{
      const e=list[ei];
      const pts=e.pts||[];
      if(pts.length<2) return null;
      const a=atEnd ? pts[pts.length-2] : pts[0];
      const b=atEnd ? pts[pts.length-1] : pts[1];
      return [b[0]-a[0], b[1]-a[1], b[2]-a[2]];
    };
    const isTangent=(aIdx,bIdx,sharedKey)=>{
      try{
        const aKeys=edgeKeys[aIdx], bKeys=edgeKeys[bIdx];
        if(!aKeys||!bKeys) return false;
        const aAtStart = aKeys[0]===sharedKey;
        const bAtStart = bKeys[0]===sharedKey;
        const ta=getTan(aIdx, !aAtStart);
        const tb=getTan(bIdx, !bAtStart);
        if(!ta||!tb) return false;
        const la=Math.hypot(...ta), lb=Math.hypot(...tb);
        if(la<1e-9||lb<1e-9) return false;
        const dot=(ta[0]*tb[0]+ta[1]*tb[1]+ta[2]*tb[2])/(la*lb);
        return Math.abs(dot) > 0.985;
      }catch(_){ return false; }
    };
    const visited=new Set([startIdx]);
    const queue=[startIdx];
    while(queue.length){
      const cur=queue.shift();
      const keys=edgeKeys[cur]||[];
      for(const k of keys){
        const neigh=vmap.get(k)||[];
        for(const nb of neigh){
          if(visited.has(nb)) continue;
          if(isTangent(cur, nb, k)){
            visited.add(nb);
            queue.push(nb);
          }
        }
      }
    }
    return Array.from(visited);
  }catch(e){ return [startIdx]; }
}
function occTangentChain(startIdx){return xTangentChainOf(filModeX.edges,startIdx);}
function renderExactPanel(){
  if(!filModeX)return;
  const p=$('props');p.innerHTML='';
  const ed=filModeX.editing?doc.features.find(x=>x.id===filModeX.editing):null;
  const k=filModeX.kind||xKindOf(ed);
  const dp=xDimPrefix(k);
  const h=document.createElement('div');h.style.fontSize='.83rem';
  h.innerHTML=ed
    ?`<b>✏️ Édition — ${ed.name||xLabel(k)}</b><br><span class="note">${filModeX.sel.length} arête(s) retenue(s) · ${filModeX.edges.length} arêtes vivides · ✕ ou clic d'une ligne = retirer, arête/face 3D = ajouter.</span>`
    :`<b>${xIcon(k)} ${xLabel(k)} OCCT</b> <span class="note">(surfaces analytiques, lisses)</span><br><span class="note">${filModeX.sel.length?filModeX.sel.length+' arête(s) ✅':'Cliquez une arête en 3D (noir · jaune au survol).'} · ${filModeX.edges.length} arêtes détectées.</span>`;
  p.appendChild(h);
  const lab=document.createElement('label');lab.textContent=(xIsChamfer(k)?'Distance':'Rayon')+' par défaut (mm)';
  const inp=document.createElement('input');inp.type='text';inp.inputMode='decimal';inp.value=filModeX.radius;inp.style.width='80px';
  inp.addEventListener('input',()=>{const v=parseFloat(String(inp.value).replace(',','.'));if(v>0&&isFinite(v))filModeX.radius=v;});
  inp.addEventListener('click',e=>e.stopPropagation());
  inp.addEventListener('keydown',e=>e.stopPropagation());
  p.appendChild(lab);p.appendChild(inp);
  // Option « arêtes tangentes » : cochée, chaque arête cliquée entraîne sa chaîne tangente
  // (déduite, pas retenue par l'utilisateur) ; décochée, une arête par clic, rien de plus.
  const tl=document.createElement('label');
  tl.style.cssText='display:flex;align-items:center;gap:6px;margin-top:8px;font-size:.83rem;cursor:pointer';
  const tc=document.createElement('input');tc.type='checkbox';tc.checked=filModeX.tangent!==false;
  tc.title='Coché : le calcul suit la chaîne tangente de chaque arête choisie. Décoché : pas de recherche de tangences. Dans les 2 cas, seules les arêtes cliquées sont sélectionnées (Ctrl/Cmd+clic pour plusieurs).';
  tc.addEventListener('change',()=>{
    filModeX.tangent=tc.checked;
    xSelSync();paintExact();renderExactPanel();
    faceEl.textContent=`${xLabel(k)} : arêtes tangentes ${tc.checked?'ajoutées automatiquement (germes en jaune)':'désactivées (clic = une arête · Ctrl/Cmd+clic = plusieurs)'} · ${filModeX.sel.length} arête(s).`;
  });
  tl.appendChild(tc);
  const tt=document.createElement('span');tt.textContent='🔗 Arêtes tangentes ajoutées automatiquement';
  tl.appendChild(tt);p.appendChild(tl);
  {const nt=document.createElement('div');nt.className='note';nt.style.marginTop='3px';
   nt.textContent=filModeX.tangent!==false
     ?'Clic = une arête (le '+(xIsChamfer(k)?'chanfrein':'congé')+' suit sa chaîne tangente) · Ctrl/Cmd+clic = en ajouter / retirer.'
     :'Clic = une arête, sans recherche de tangences · Ctrl/Cmd+clic = en ajouter / retirer. Note : le noyau prolonge toujours un '+(xIsChamfer(k)?'chanfrein':'congé')+' le long d’arêtes en continuité tangente (limite OCCT).';
   p.appendChild(nt);}
  if(filModeX.sel.length){
    const nb=document.createElement('div');nb.className='note';
    nb.style.marginTop='4px';
    nb.textContent=(filModeX.seeds||[]).length+' arête(s) cliquée(s)'+
      (filModeX.tangent&&filModeX.sel.length>(filModeX.seeds||[]).length
        ?' → '+filModeX.sel.length+' retenues après propagation tangente.':' → aucune propagation.');
    p.appendChild(nb);
    const pv=document.createElement('div');pv.className='note';
    pv.style.marginTop='4px';
    pv.textContent=xPrevBody?'🟠 Aperçu : la pièce telle qu’elle sera, les nouvelles faces en orange.'
                           :'🟠 Aperçu indisponible (noyau exact indisponible ou arête sans diagnostic).';
    p.appendChild(pv);
  }
  const lst=document.createElement('div');lst.className='col';lst.style.marginTop='6px';lst.style.maxHeight='220px';lst.style.overflow='auto';
  if(!filModeX.sel.length)lst.innerHTML='<span class="note">Arêtes issues des découpes incluses — tout est cliquable.</span>';
  filModeX.sel.forEach((s,i)=>{
    const r=document.createElement('div');r.className='tnode';
    const eLen=(filModeX.edges.find(e=>Math.hypot(e.mid[0]-s.pos[0],e.mid[1]-s.pos[1],e.mid[2]-s.pos[2])<0.75)||{len:0}).len;
    r.innerHTML=`<span>${xIcon(k)}</span><span class="nm">${s.name?`<b>${s.name}</b> · `:''}${dp} <b>${s.r}</b> · L${eLen.toFixed(1)}${s.anchor?' · ⌖':''} · (${s.pos.map(v=>v.toFixed(1)).join(', ')})</span><span title="Retirer">✕</span>`;
    const num=document.createElement('input');num.type='text';num.inputMode='decimal';num.value=s.r;num.style.width='56px';
    num.onclick=ev=>ev.stopPropagation();
    const ce=()=>{
      const v=parseFloat(String(num.value).replace(',','.'));
      if(v>0&&isFinite(v)){s.r=v;renderExactPanel();xPreviewUpdate();}
    };
    num.addEventListener('change',ce);
    num.addEventListener('blur',ce);
    num.addEventListener('keydown',e=>{if(e.key==='Enter'){ce();num.blur();} e.stopPropagation();});
    r.appendChild(num);
    r.onclick=()=>{
      // retirer une arête = retirer son germe (et ce que sa chaîne avait apporté)
      const ei=filModeX.edges.findIndex(e=>Math.hypot(e.mid[0]-s.pos[0],e.mid[1]-s.pos[1],e.mid[2]-s.pos[2])<0.75);
      if(ei>=0)xSeedDel(ei);else filModeX.sel.splice(i,1);
      xSelSync();paintExact();renderExactPanel();
    };
    lst.appendChild(r);
  });
  p.appendChild(lst);
  const row=document.createElement('div');row.className='row';row.style.marginTop='8px';
  const ok=document.createElement('button');ok.className='primary';ok.textContent=ed?'✔ Enregistrer':'✔ Appliquer';
  ok.onclick=applyExactFillet;row.appendChild(ok);
  const q=document.createElement('button');q.textContent=ed?'✖ Annuler':'Quitter';q.onclick=()=>exitFilletMode();
  row.appendChild(q);p.appendChild(row);
}
function applyExactFillet(){
  if(!filModeX)return;
  const ed=filModeX.editing?doc.features.find(x=>x.id===filModeX.editing):null;
  const k=filModeX.kind||xKindOf(ed);
  const label=xLabel(k);
  const r=parseFloat(filModeX.radius);
  if(!filModeX.sel.length){faceEl.textContent=label+' : sélectionnez au moins une arête.';return;}
  if(!(r>0)&&filModeX.sel.some(s=>!(s.r>0))){faceEl.textContent=label+' : '+(xIsChamfer(k)?'distance':'rayon')+' invalide.';return;}
  // pos0 = position d'origine figée à la sélection : c'est elle la référence durable (celle que
  // xAnchorMatch relit pour départager un arc de congé de son segment colinéaire, et celle qui
  // permet de suivre l'arête quand le solide change de hauteur). Conservée en édition.
  // seed = arête GERME (cliquée) : re-marquée depuis filModeX.seeds (indices stables dans la
  // session), c'est elle qui ancre la propagation tangente à chaque rejeu (passe 2b).
  const mkEdges=()=>filModeX.sel.map(s=>{
    const e={pos:s.pos.slice(),pos0:(s.pos0||s.pos).slice(),r:s.r,len:+(s.len||0),anchor:s.anchor||null,name:s.name||entName('edge')};
    const ei=filModeX.edges.findIndex(x=>x&&Math.hypot(x.mid[0]-s.pos[0],x.mid[1]-s.pos[1],x.mid[2]-s.pos[2])<0.75);
    if((ei>=0&&(filModeX.seeds||[]).indexOf(ei)>=0)||s.seed)e.seed=1;
    return e;
  });
  if(filModeX.editing){
    // Édition en place : on met À JOUR la fonction existante (pas de 2ᵉ fonction).
    const f=doc.features.find(x=>x.id===filModeX.editing);
    if(f){f.edges=mkEdges();f.tangent=filModeX.tangent!==false;f.name=xFeatName(f);repSyncForFeature(f);sel={kind:'feature',id:f.id};}
    exitExactFilletMode(true); // restaure le rejeu complet avec les arêtes mises à jour
    renderProps();
    faceEl.textContent=label+' : mise à jour enregistrée ('+(f?f.edges.length:0)+' arête(s)).';
    return;
  }
  const nf={id:uid('xf'),type:'xfillet',name:xLabel(k)+' ('+filModeX.sel.length+' arête(s))',edges:mkEdges(),visible:true,tangent:filModeX.tangent!==false};
  if(xIsChamfer(k))nf.chamfer=true;
  addFeature(nf);
  sel={kind:'feature',id:nf.id};
  exitFilletMode(true);markDirty();rebuild();renderProps();
}
 function buildFilletOverlay(){
  const old=scene.getObjectByName('filEdges');if(old)scene.remove(old);
  if(!filMode)return;
  const F=doc.features.find(x=>x.id===filMode.target);if(!F||F.type!=='extrude')return;
  const sk=doc.sketches.find(s=>s.id===F.sketchId);if(!sk)return;
  const{u,v,n,o}=sketchBasis(sk);
  const m=new THREE.Matrix4().makeBasis(u,v,n);m.setPosition(o);
  const spF=extrudeSpan(F),z0=spF.lo,z1=spF.hi;
  const grp=new THREE.Group();grp.name='filEdges';
  const toW=(x,y,z)=>new THREE.Vector3(x,y,z).applyMatrix4(m);
  const addSeg=(a,b,edge)=>{
    const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),
      new THREE.LineBasicMaterial({color:0x8a8f99,transparent:true,opacity:0.95,depthTest:true}));
    l.renderOrder=999;l.userData.edge=edge;grp.add(l);
  };
  // Toutes les arêtes analytiques du prisme : verticales (coins) + périmètres haut/bas.
  // C'est exhaustif pour un extrudé : n'importe quelle arête est sélectionnable.
  const tr=skLoopTrace(sk);
  tr.loops.forEach(L=>{
    const ch=L.chain,nodes=chainNodesOf(ch);
    const ring=[];const s0=sk.points[ch[0].from];if(!s0)return;ring.push({x:s0.x,y:s0.y});
    ch.forEach(st=>{
      const ed=st.ed;
      if(ed.kind==='line'){const q=sk.points[(ed.a===st.from)?ed.b:ed.a];if(q)ring.push({x:q.x,y:q.y});}
      else{const a=ed.e,C=sk.points[a.pc],an=arcAngles(sk,a);if(!an||!C)return;
        const fwd=(ed.a===st.from),aS=fwd?an.a1:an.a2;let aE=fwd?an.a2:an.a1;
        let dd=aE-aS;const T=Math.PI*2;dd=((dd%T)+T)%T;if(dd<1e-9)dd=T;
        const n2=Math.max(2,Math.ceil(dd/T*12));
        for(let i=1;i<=n2;i++){const t=aS+dd*i/n2;ring.push({x:C.x+a.r*Math.cos(t),y:C.y+a.r*Math.sin(t)});}}
    });
    const seen=new Set();
    nodes.forEach(pid=>{
      if(typeof pid!=='string'||pid.startsWith('__a')||seen.has(pid))return;seen.add(pid);
      const q=sk.points[pid];if(!q)return;
      const fp={x:+q.x.toFixed(2),y:+q.y.toFixed(2)};
      addSeg(toW(q.x,q.y,z0),toW(q.x,q.y,z1),{fp,kind:'v',corner:{x:fp.x,y:fp.y,pid}});
    });
    for(let i=0;i<ring.length-1;i++){
      const A=ring[i],B=ring[i+1];
      if(Math.hypot(B.x-A.x,B.y-A.y)<0.5)continue; // ignore micro-facettes
      const fp={x:+((A.x+B.x)/2).toFixed(2),y:+((A.y+B.y)/2).toFixed(2)};
      addSeg(toW(A.x,A.y,z0),toW(B.x,B.y,z0),{fp,kind:'rim-bot',isTop:false});
      addSeg(toW(A.x,A.y,z1),toW(B.x,B.y,z1),{fp,kind:'rim-top',isTop:true});
    }
  });
  scene.add(grp);paintFilletEdges();
}
function filEdgeSelected(ed){
  if(!filMode||!ed)return false;
  if(ed.kind==='v'&&ed.corner)return filMode.sel.some(s=>filEdgeKey(s)===filEdgeKey(ed.corner));
  if(ed.kind==='rim-top')return !!(filMode.rims&&filMode.rims.top);
  if(ed.kind==='rim-bot')return !!(filMode.rims&&filMode.rims.bottom);
  return false;
}
function filEdgeHoverKey(ed){
  if(!ed)return null;
  if(ed.kind==='v'&&ed.corner)return 'v:'+filEdgeKey(ed.corner);
  if(ed.kind==='rim-top')return 'rim-top';
  if(ed.kind==='rim-bot')return 'rim-bot';
  return null;
}
  function paintFilletEdges(){
    const grp=scene.getObjectByName('filEdges');if(!grp||!filMode)return;
    grp.children.forEach(l=>{
      const e=l.userData.edge;let c=0x3a3a40;
      if(e){
        if(filEdgeSelected(e))c=0xff453a;
        else if(filHover&&filHover===filEdgeHoverKey(e))c=0xffd60a;
        else if(e.kind&&e.kind.indexOf('rim')===0)c=0x64d2ff; // périmètres en bleu = cliquables
        else c=0x8a8f99;
      }
      l.material.color.setHex(c);
    });
  }
function filletPick(e){
  const grp=scene.getObjectByName('filEdges');if(!grp)return null;
  const r=renderer.domElement.getBoundingClientRect();
  const ndc=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
  rayc.setFromCamera(ndc,camera);
  rayc.params.Line.threshold=2;
  const hits=rayc.intersectObjects(grp.children,false);
  return hits.length?hits[0].object.userData.edge:null;
}
 function filletToggle(e){
   const ed=filletPick(e);
   if(ed&&ed.kind==='v'&&ed.corner){
    const k=filEdgeKey(ed.corner);
    const i=filMode.sel.findIndex(s=>filEdgeKey(s)===k);
    if(i>=0)filMode.sel.splice(i,1);
    else filMode.sel.push({x:ed.corner.x,y:ed.corner.y,pid:ed.corner.pid});
     paintFilletEdges();renderFilletPanel();
     faceEl.textContent='Congé : '+filMode.sel.length+' arête(s) verticale(s) + périmètre '+(filMode.rims.top?'haut ✓ ':'')+(filMode.rims.bottom?'bas ✓':'')+'.';
     return;
   }
   if(ed&&(ed.kind==='rim-top'||ed.kind==='rim-bot')){
     if(ed.kind==='rim-top')filMode.rims.top=!filMode.rims.top;
     else filMode.rims.bottom=!filMode.rims.bottom;
     paintFilletEdges();renderFilletPanel();
     faceEl.textContent='Congé : périmètre '+(ed.kind==='rim-top'?'haut':'bas')+' '+(filEdgeSelected(ed)?'sélectionné':'retiré')+' (arrondi bevel).';
     return;
   }
   // Clic face : intelligente — dessus/dessous = périmètre, côté = coins de cette face
   const picked=pickFace(e);
   if(!picked)return;
   if(picked.bid!==filMode.target&&picked.mesh.userData.bid!==filMode.target){faceEl.textContent='Congé : cette face n\'appartient pas au corps sélectionné.';return;}
   const F=doc.features.find(x=>x.id===filMode.target);
   const sk=doc.sketches.find(s=>s.id===(F?F.sketchId:filMode.sketchId));if(!sk)return;
   const{u,v,n}=sketchBasis(sk);
   const fn=faceNormalWorld(picked.mesh,picked.fi);
    if(fn){
      const dTop=Math.abs(fn.dot(n));
      if(dTop>0.9){ // face de dessus / dessous → périmètre seul de cette face (indépendant)
        const isTop=fn.dot(n)>0;
        if(isTop)filMode.rims.top=!filMode.rims.top;
        else filMode.rims.bottom=!filMode.rims.bottom;
        paintFilletEdges();renderFilletPanel();
        const selTop=filMode.rims.top,selBot=filMode.rims.bottom;
        faceEl.textContent='Congé : face '+(isTop?'haute':'basse')+' → périmètre '+(isTop?'haut':'bas')+' '+( (isTop?selTop:selBot) ?'sélectionné':'retiré') + (selTop&&selBot?' (haut+bas)':'') + ' · exact = arêtes vives, maillage = bevel symétrique si les deux.';
        return;
     }
   }
   // Face latérale → tous les coins verticaux (comportement historique)
   const tr=skLoopTrace(sk);
   const seen=new Set();let added=0;
   tr.loops.forEach(L=>{chainNodesOf(L.chain).forEach(pid=>{
     if(typeof pid!=='string'||pid.startsWith('__a'))return;
     const q=sk.points[pid];if(!q)return;
     const k=q.x.toFixed(2)+','+q.y.toFixed(2);
     if(!seen.has(k)){seen.add(k);if(!filMode.sel.some(s=>filEdgeKey(s)===k)){filMode.sel.push({x:+q.x.toFixed(2),y:+q.y.toFixed(2),pid});added++;}}
});});
    paintFilletEdges();renderFilletPanel();
   faceEl.textContent='Congé : '+added+' coin(s) ajouté(s) via la face latérale.';
 }
function pickFace(e){
  const r=renderer.domElement.getBoundingClientRect();
  const ndc=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
  rayc.setFromCamera(ndc,camera);
  const hits=rayc.intersectObjects(bodies.filter(b=>b.visible).map(b=>b.mesh),false);
  if(!hits.length)return null;
  const mesh=hits[0].object;const bid=mesh.userData.bid;
  if(!bid)return null;
  const fi=hits[0].faceIndex;
  const props=getFaceProps(mesh,fi);
  return{bid,mesh,fi,props};
}
function renderFilletPanel(){
  if(!filMode)return;
  if(!filMode.rims)filMode.rims={top:false,bottom:false};
  const p=$('props');p.innerHTML='';
  const F=doc.features.find(x=>x.id===filMode.target);
   const h=document.createElement('div');h.style.fontSize='.83rem';
    const nV=filMode.sel.length,hasR=filMode.rims.top||filMode.rims.bottom;
    h.innerHTML=`<b>⤢ Congé</b> sur <b>${F?F.name:''}</b><br><span class="note">${nV?nV+' verticale(s) ✅ ':''}${hasR?('périmètre '+(filMode.rims.top?'haut ✓ ':'')+(filMode.rims.bottom?'bas ✓':'')+' (arrondi)'):''}${(!nV&&!hasR)?'Cliquez N\u2019importe quelle arête en 3D.':''}<br> verticales = congé esquisse · horizontales = arrondi bevel (haut+bas liés).</span>`;
    p.appendChild(h);
    const lab=document.createElement('label');lab.textContent='Rayon (mm)';
    const inp=document.createElement('input');inp.type='text';inp.inputMode='decimal';inp.value=filMode.radius;inp.style.width='80px';
    inp.addEventListener('input',()=>{const v=parseFloat(String(inp.value).replace(',','.'));if(v>0&&isFinite(v))filMode.radius=v;});
    inp.addEventListener('click',e=>e.stopPropagation());
    inp.addEventListener('keydown',e=>e.stopPropagation());
    p.appendChild(lab);p.appendChild(inp);
    const lst=document.createElement('div');lst.className='col';lst.style.marginTop='6px';
    if(!filMode.sel.length&&!hasR)lst.innerHTML='<span class="note">Cliquez des arêtes ou une face dans la vue 3D.</span>';
    filMode.sel.forEach((s,i)=>{
      const r=document.createElement('div');r.className='tnode';
      r.innerHTML=`<span>⤢</span><span class="nm">Verticale (${s.x}, ${s.y})</span><span title="Retirer">✕</span>`;
      r.onclick=()=>{filMode.sel.splice(i,1);paintFilletEdges();renderFilletPanel();};
      lst.appendChild(r);
    });
    if(hasR){
      const r=document.createElement('div');r.className='tnode';
      r.innerHTML=`<span>⤢</span><span class="nm">Périmètre ${filMode.rims.top&&filMode.rims.bottom?'haut+bas':(filMode.rims.top?'haut':'bas')} (arrondi R${filMode.radius})</span><span title="Retirer">✕</span>`;
      r.onclick=()=>{filMode.rims.top=false;filMode.rims.bottom=false;paintFilletEdges();renderFilletPanel();};
      lst.appendChild(r);
    }
    p.appendChild(lst);
    const row=document.createElement('div');row.className='row';row.style.marginTop='8px';
  const ok=document.createElement('button');ok.className='primary';ok.textContent='✔ Appliquer';
  ok.onclick=applyFillet;row.appendChild(ok);
  const q=document.createElement('button');q.textContent='Quitter';q.onclick=()=>exitFilletMode();
  row.appendChild(q);p.appendChild(row);
}
 function applyFillet(){
   if(!filMode)return;
   if(!filMode.rims)filMode.rims={top:false,bottom:false};
   const F=doc.features.find(x=>x.id===filMode.target);if(!F){exitFilletMode();return;}
   const sk=doc.sketches.find(s=>s.id===F.sketchId);if(!sk){faceEl.textContent='Congé : esquisse introuvable.';return;}
   const r=parseFloat(filMode.radius);
   if(!(r>0)){faceEl.textContent='Congé : rayon invalide.';return;}
   const hasV=filMode.sel.length>0,hasR=filMode.rims.top||filMode.rims.bottom;
   if(!hasV&&!hasR){faceEl.textContent='Congé : sélectionnez au moins une arête (verticale ou périmètre haut/bas).';return;}
   let rf={applied:0,warnings:[],radii:[]};
   if(hasV){
     rf=applyFilletsToSketch(sk,[{corners:filMode.sel,radius:r}]);
     if(!rf.applied){faceEl.textContent='Congé impossible : '+(rf.warnings[0]||'profil non fermé après congé.');return;}
     const built=sketchShape(rf.sk);
     if(!built.shapes.length){
       let m='Congé impossible : le profil ne se referme pas.';
       if(built.opens&&built.opens.length)m+=` Bout ouvert en (${built.opens[0].x.toFixed(1)}, ${built.opens[0].y.toFixed(1)}).`;
       faceEl.textContent=m;return;
     }
   }
   const nTot=(rf.applied||0)+(hasR?((filMode.rims.top?1:0)+(filMode.rims.bottom?1:0)):0);
   const nf={id:uid('fi'),type:'fillet',name:`Congé R${r} (${nTot} arête(s)${hasR?' dont périmètre':''})`,target:F.id,radius:r,corners:filMode.sel.map(c=>({x:c.x,y:c.y,pid:c.pid||undefined})),rims:{top:!!filMode.rims.top,bottom:!!filMode.rims.bottom},rimTop:!!filMode.rims.top,rimBot:!!filMode.rims.bottom,visible:true,radii:rf.radii};
   addFeature(nf);
   if(rf.warnings.length)faceEl.textContent='Congé appliqué : '+rf.warnings.join(' · ');
   else faceEl.textContent='Congé R'+r+' appliqué sur '+rf.applied+' arête(s).';
   sel={kind:'feature',id:nf.id};
   exitFilletMode(true);markDirty();rebuild();renderProps();
 }

