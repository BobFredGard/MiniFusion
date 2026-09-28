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
  const o=scene.getObjectByName('filEdges');if(o)scene.remove(o);
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
  filModeX={sel:[],seeds:[],tangent:true,radius:2,edges:[],editing:editing?editing.id:null,kind:k};
  if(editing){
    // Édition : rejeu SANS la fonction (occSkipFeat) → les arêtes vives d'origine redeviennent
    // cliquables (l'arrondi appliqué les a remplacées par des surfaces tangentes).
    const seen=[];
    (editing.edges||[]).forEach(s=>{
      if(seen.some(u=>Math.abs((u.r||0)-(s.r||0))<1e-9&&Math.hypot(u.pos[0]-s.pos[0],u.pos[1]-s.pos[1],u.pos[2]-s.pos[2])<=0.75))return;
      seen.push(s);
      filModeX.sel.push({pos:s.pos.slice(),pos0:(s.pos0||s.pos).slice(),r:s.r||2,len:+(s.len||0)||0,anchor:s.anchor||null,name:s.name||null});
    });
    const rr=filModeX.sel.find(s=>s.r>0);if(rr)filModeX.radius=rr.r;
    occSkipFeat=editing.id;
    try{rebuild();}catch(e){}
    if(!occLive||!occLive.shape){occSkipFeat=null;filModeX=null;faceEl.textContent=label+' : recalcul impossible.';return;}
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
    (filModeX.sel||[]).forEach(s=>{
      const i=filModeX.edges.findIndex(e=>Math.hypot(e.mid[0]-s.pos[0],e.mid[1]-s.pos[1],e.mid[2]-s.pos[2])<0.75);
      if(i>=0)xSeedAdd(i);
    });
    filModeX.tangent=prevT;
  }
  buildExactOverlay();renderExactPanel();paintExact();
  if(!editing)xPreviewUpdate();
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
  const o=scene.getObjectByName('filEdges');if(o)scene.remove(o);
  if(wasEditing){markDirty();try{rebuild();}catch(e){}} // restaure la fonction (apply a déjà écrit les nouvelles arêtes)
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
    if(filModeX.tangent)occTangentChain(i).forEach(j=>{if(want.indexOf(j)<0)want.push(j);});
    else if(want.indexOf(i)<0)want.push(i);
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
/* ----- Aperçu rouge translucide du résultat AVANT validation (congé ET chanfrein) ----- */
let xPrevBody=null;
function xPrevRemove(){
  if(xPrevBody){
    if(xPrevBody.mesh){try{scene.remove(xPrevBody.mesh);xPrevBody.mesh.geometry.dispose();}catch(e){}}
    bodies=bodies.filter(b=>b!==xPrevBody);
    xPrevBody=null;
  }
  // on rend son opacité (et son écriture de profondeur) à la pièce réelle
  bodies.forEach(b=>{
    if(b._xSaved==null||!b.mesh||!b.mesh.material)return;
    b.mesh.material.opacity=b._xSaved;b.mesh.material.transparent=b._xTrans;
    if(b._xDW!==undefined)b.mesh.material.depthWrite=b._xDW;
    delete b._xSaved;delete b._xTrans;delete b._xDW;
  });
  try{refreshParts();}catch(e){}
}
function xPreviewUpdate(){
  try{
    if(!filModeX){xPrevRemove();return;}
    const sel=filModeX.sel.filter(s=>s.r>0);
    if(!sel.length||!occLive||!occLive.shape){xPrevRemove();return;}
    // rien à recalculer si la sélection et les rayons n'ont pas bougé
    const sig=sel.map(s=>s.pos.map(v=>v.toFixed(2)).join(',')+'/'+s.r).join('|')+(xIsChamfer(filModeX.kind)?'#c':'#f');
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
    const warns=[];
    const sh=occFilletRun(occLive.shape,jobs,warns,cham);
    if(!sh){xPrevRemove();return;}
    // On n'affiche QUE LA MODIFICATION, pas le solide entier repeint en rouge. Le sens de la
    // soustraction ne dépend PAS de l'opération mais de la géométrie : un congé sur un coin
    // CONVEXE ajoute de la matière (résultat \ base), sur un coin CONCAVE il en retire
    // (base \ résultat — mesuré : lèvre de rainure, résultat \ base vide, base \ résultat
    // = 1 solide / 9 faces). Un chanfrein retire toujours. On essaie donc les deux et on
    // affiche le patch non vide ; si les deux le sont (boucle mixte), on prend le plus grand.
    const diffOf=(A,B)=>{try{return occCut(A,B);}catch(e){return null;}};
    let dAdd=diffOf(sh,occLive.shape);   // matière AJOUTÉE
    let dRem=diffOf(occLive.shape,sh);   // matière RETIRÉE
    const nonVide=s=>{if(!s)return false;try{return occListEdges(s).length>0;}catch(e){return false;}};
    const aOk=nonVide(dAdd),rOk=nonVide(dRem);
    let shown=null,libelle='';
    if(aOk&&rOk){
      const ea=occListEdges(dAdd).length,er=occListEdges(dRem).length;
      shown=ea>=er?dAdd:dRem;libelle=(ea>=er?'ajoutée':'retirée');
    }else if(aOk){shown=dAdd;libelle='ajoutée';}
    else if(rOk){shown=dRem;libelle='retirée';}
    else{shown=sh;libelle='';} // repli : solide complet
    let g=null;
    try{g=occTessellate(shown,0.5);}catch(e){g=null;}
    try{sh.delete();}catch(e){}
    if(dAdd)try{dAdd.delete();}catch(e){}
    if(dRem)try{dRem.delete();}catch(e){}
    if(!g){xPrevRemove();return;}
    xPrevRemove();
    // la pièce s'estompe, le patch rouge passe devant
    bodies.forEach(b=>{
      if(b.ghost||!b.mesh||!b.mesh.material)return;
      b._xSaved=b.mesh.material.opacity;b._xTrans=b.mesh.material.transparent;
      b.mesh.material.opacity=0.28;b.mesh.material.transparent=true;b.mesh.material.depthWrite=false;
      b._xDW=b.mesh.material.depthWrite;
    });
    const mat=new THREE.MeshStandardMaterial({color:0xff453a,transparent:true,opacity:0.85,depthWrite:false,side:THREE.DoubleSide,roughness:0.35,metalness:0.05});
    const mesh=new THREE.Mesh(g,mat);mesh.name='xPreview';
    mesh.renderOrder=1000;
    mesh.userData.bid='x_preview';mesh.raycast=()=>{};
    scene.add(mesh);
    xPrevBody={id:'x_preview',name:libelle?('🔴 Matière '+libelle):'🔴 Aperçu (non validé)',mesh,color:0xff453a,visible:true,kind:'ghost',ref:null,ghost:true,preview:true};
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
    // chaque arête est une POLYLIGNE (13 points échantillonnés) : on émet TOUS ses
    // segments (sinon on ne dessine que le 1/12e de l'arête) + table seg→arête.
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
      if(hex===undefined)hex=cache[i]=xIsSeed(i)?0xffd60a:(xIsSel(i)?0xff453a:(xHover===i?0xffd60a:0x000000));
      c.setHex(hex);
      col.setXYZ(k*2,c.r,c.g,c.b);
      col.setXYZ(k*2+1,c.r,c.g,c.b);
    }
    col.needsUpdate=true;
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
function occFaceEdges(faceOrd){
  // Milieux des arêtes d'une face BRep (par rang, même ordre que la tessellation).
  const out=[],bin=[];
  try{
    const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
    const ex=new occt.TopExp_Explorer_2(occLive.shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);bin.push(ex);
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
  if(!pk||pk.mesh.userData.bid!=='occ_result')return false;
  const groups=pk.mesh.geometry.userData.occGroups||[];
  const g=groups.find(g=>pk.fi>=g.start&&pk.fi<g.start+g.count);
  if(!g)return false;
  const mids=occFaceEdges(g.f);
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
        (filModeX.tangent?' Les arêtes tangentes à celle cliquée sont ajoutées automatiquement.':' Une seule arête par clic.');
      return;
    }
    if(xIsSeed(i))xSeedDel(i);else xSeedAdd(i);
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
function occTangentChain(startIdx){
  const n=filModeX.edges.length;
  if(startIdx<0||startIdx>=n) return [startIdx];
  try{
    const vmap=new Map(); // vertex key -> [edgeIdx]
    const edgeKeys=[];
    for(let i=0;i<n;i++){
      const e=filModeX.edges[i];
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
      const e=filModeX.edges[ei];
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
  tc.title='Coché : les arêtes tangentes à celle cliquée sont ajoutées automatiquement. Décoché : une seule arête par clic.';
  tc.addEventListener('change',()=>{
    filModeX.tangent=tc.checked;
    xSelSync();paintExact();renderExactPanel();
    faceEl.textContent=`${xLabel(k)} : arêtes tangentes ${tc.checked?'ajoutées automatiquement (germes en jaune)':'désactivées (un clic = une arête)'} · ${filModeX.sel.length} arête(s).`;
  });
  tl.appendChild(tc);
  const tt=document.createElement('span');tt.textContent='🔗 Arêtes tangentes ajoutées automatiquement';
  tl.appendChild(tt);p.appendChild(tl);
  if(filModeX.sel.length){
    const nb=document.createElement('div');nb.className='note';
    nb.style.marginTop='4px';
    nb.textContent=(filModeX.seeds||[]).length+' arête(s) cliquée(s)'+
      (filModeX.tangent&&filModeX.sel.length>(filModeX.seeds||[]).length
        ?' → '+filModeX.sel.length+' retenues après propagation tangente.':' → aucune propagation.');
    p.appendChild(nb);
    const pv=document.createElement('div');pv.className='note';
    pv.style.marginTop='4px';
    pv.textContent=xPrevBody?'🔴 Aperçu affiché : seule la matière modifiée se voit en rouge sur la pièce translucide.'
                           :'🔴 Aperçu indisponible (noyau exact indisponible ou arête sans diagnostic).';
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
  const mkEdges=()=>filModeX.sel.map(s=>({pos:s.pos.slice(),pos0:(s.pos0||s.pos).slice(),r:s.r,len:+(s.len||0),anchor:s.anchor||null,name:s.name||entName('edge')}));
  if(filModeX.editing){
    // Édition en place : on met À JOUR la fonction existante (pas de 2ᵉ fonction).
    const f=doc.features.find(x=>x.id===filModeX.editing);
    if(f){f.edges=mkEdges();f.name=xFeatName(f);sel={kind:'feature',id:f.id};}
    exitFilletMode(true); // restaure le rejeu complet avec les arêtes mises à jour
    renderProps();
    faceEl.textContent=label+' : mise à jour enregistrée ('+(f?f.edges.length:0)+' arête(s)).';
    return;
  }
  const nf={id:uid('xf'),type:'xfillet',name:xLabel(k)+' ('+filModeX.sel.length+' arête(s))',edges:mkEdges(),visible:true};
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

