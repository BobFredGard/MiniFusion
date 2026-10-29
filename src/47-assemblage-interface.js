/* ---------- composants : affichage, navigation, arbre, panneau (V0.6.0 → V0.6.1) ----------
   Le modèle est dans 46-assemblage-modele.js. Deux modes pour le composant actif (celui de
   l'instance éditée, asm.path) :
     · MODÉLISER (asmMode 'part') : la scène de la pièce, inchangée ; le reste de l'arbre est
       dessiné autour (groupe asmCtx) : descendants du composant actif FIGÉS (pleins, non
       sélectionnables), le reste en fantômes ;
     · PLACER (asmMode 'asm') : scène SÉPARÉE asmScene (celle de la pièce n'est jamais touchée) ;
       la géométrie propre du composant actif est pleine, ses ENFANTS DIRECTS sont sélectionnables
       (un clic n'importe où dans le sous-arbre d'un enfant sélectionne cet enfant), le reste en
       fantômes. Manipulateur et Aligner (48) s'appliquent à ces enfants.
   Dans les deux modes, tout est dessiné dans le repère de l'instance éditée : la caméra ne
   saute pas d'un mode à l'autre. Instantanés : maillages de chaque composant (ses corps
   propres, géométries clonées en fin de rejeu), refaits seulement repli maillage → exact. */
let asmScene=null,asmTri=null;
let asmSelId=null;      // occurrence sélectionnée (mode Placer) : enfant direct du composant actif
let asmPivot=null;      // V0.7.4 : repère choisi dans l'arbre comme centre de rotation {cg|null, name}
let asmBuilding=false;  // instantanés en cours : pas de dessin intermédiaire
let asmTreeOpen=true;   // section « Composants » de l'arbre dépliée
const ASM_SEL_COL=0x0a84ff;
function asmOn(){return !!asm&&asm.comps.some(c=>c.occ.length>0);}
function asmSceneGet(){
  if(asmScene)return asmScene;
  asmScene=new THREE.Scene();
  asmScene.add(new THREE.HemisphereLight(0xffffff,0x444444,0.75));
  const key=new THREE.DirectionalLight(0xffffff,1.0);key.position.set(60,-40,120);asmScene.add(key);
  try{asmTri=triadMake({name:'asmTri',px:90,planes:false});asmScene.add(asmTri);}catch(e){}
  const g=new THREE.Group();g.name='asmOcc';asmScene.add(g);
  return asmScene;
}
function asmRenderScene(){
  // Scène à rendre (animate) : mode Placer → asmScene, sinon la pièce
  if(asmMode==='asm'&&asmScene){asmScene.background=scene.background;return asmScene;}
  return scene;
}
function asmMat4(F){
  const m=new THREE.Matrix4();
  m.makeBasis(new THREE.Vector3(F.x[0],F.x[1],F.x[2]),new THREE.Vector3(F.y[0],F.y[1],F.y[2]),new THREE.Vector3(F.z[0],F.z[1],F.z[2]));
  m.setPosition(F.o[0],F.o[1],F.o[2]);
  return m;
}
const asmEsc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
/* ── instantanés d'affichage ── */
function asmCaptureActive(){
  // Fin de rejeu (buildDone) : maillages du composant actif, clonés (le rejeu suivant libère
  // les originaux). Seulement avec des composants — une pièce seule ne paie rien.
  if(!asm||(!asmOn()&&!asm._force))return;
  const c=asmActiveComp();if(!c)return;
  const items=[];
  (bodies||[]).forEach(b=>{
    if(!b||b.ghost||!b.mesh||!b.mesh.geometry||b.visible===false)return;
    try{
      b.mesh.updateMatrixWorld(true);
      const g=b.mesh.geometry.clone();g.applyMatrix4(b.mesh.matrixWorld);
      const m=b.mesh.material||{};
      // intensité et transparence du CORPS (fiche doc.bodies), pas l'opacité calculée de sa matière
      const bid=bodyIdOfRuntime(b);
      items.push({geo:g,color:(m.color&&m.color.getHex)?m.color.getHex():0x9a9aa0,bid:bid||null,op:bid?bodyOpOf(bid):1,gl:bid?bodyGlassEff(bid):1,rl:bid?renderLookOf(bid):null,cm:bid?bodyMatOf(bid):null}); // rl : apparence de RENDU (atelier) ; cm : matériau CAO (vue) — 12-materiaux, V0.10.0
    }catch(e){}
  });
  if(c._snap)asmSnapFree(c._snap);
  const edges=asmEdgeCapture(); // arêtes pour le mode Placer (48-assemblage-apparence)
  const pedges=asmSkCaptureEdges(); // V0.8.1 : arêtes exactes, projetables dans les esquisses des autres (46)
  const pfaces=asmSkCaptureFaces(); // faces planes / cylindriques : références de construction des autres (46)
  c._snap={items,edges,pedges,pfaces,exact:builtEngine==='exact',hash:(()=>{try{return docHash();}catch(e){return '';}})()};
  delete c._stale;
  // le composant vient d'être rejoué : ses repères ont pu bouger → les alignements suivent
  try{if(asmResolve()){dirty=true;autosave();}}catch(e){}
  asmExtSyncSoon(); // ce composant a pu bouger des éléments visés par d'autres (46)
  asmSnapSyncSoon(); // … ou des faces visées par des points d'accroche (48)
  if(!asmBuilding){try{asmCtxDraw();}catch(e){}if(asmMode==='asm'){try{asmDraw();}catch(e){}}}
}
function asmSnapFree(s){(s&&s.items||[]).forEach(it=>{try{it.geo.dispose();}catch(e){}});try{if(s&&s.edges)s.edges.dispose();}catch(e){}}
function asmBuildSnapshots(){
  // Rejoue chaque composant sans instantané (ou en repli maillage alors que le noyau exact est
  // prêt), puis revient au composant actif. Synchrone : rebuild() construit et capture
  // (buildDone) avant de rendre la main.
  if(!asm)return;
  const back=asm.active,backPath=asm.path.slice(),exact=typeof occHas==='function'&&occHas();
  const need=c=>!c._snap||c._stale||(exact&&!c._snap.exact); // _stale : document changé de l'extérieur (48)
  let n=0;
  asmBuilding=true;
  try{
    for(const c of asm.comps.slice()){if(c.id!==back&&need(c)){asmActivate(c.id);n++;}}
    if(n)asmActivate(back,backPath);
    else{const a=asmActiveComp();if(a&&need(a)){builtVersion=-1;try{rebuild();}catch(e){}}}
  }finally{asmBuilding=false;}
  try{asmCtxDraw();}catch(e){}
  if(asmMode==='asm'){try{asmDraw();}catch(e){}}
}
/* ── dessin : l'arbre entier, dans le repère de l'instance éditée ── */
function asmClear(G){for(const o of [...G.children]){G.remove(o);o.traverse(m=>{try{if(m.material)m.material.dispose();}catch(e){}});}}
function asmFill(G,placer){
  // placer : mode Placer (enfants directs sélectionnables) ; sinon contexte du mode Modéliser
  if(!asm)return;
  const P=asm.path,n=P.length;
  const V=asmInverse(asmWorld(P)||asmFr0());
  const hidden=path=>{let c=asmRoot();for(const id of path){const o=c&&c.occ.find(q=>q.id===id);if(!o||o.visible===false)return true;c=asmComp(o.comp);}return false;};
  asmInstances(asm.root).forEach(inst=>{
    const c=asmComp(inst.comp);if(!c||!c._snap||!c._snap.items.length||hidden(inst.path))return;
    const mine=inst.path.length>=n&&P.every((id,i)=>inst.path[i]===id); // dans le sous-arbre actif
    const self=mine&&inst.path.length===n;
    if(self&&!placer)return; // le composant actif EST la scène de la pièce
    const key=mine&&!self?inst.path[n]:null; // enfant direct auquel appartient l'instance
    // V0.7.5 : en mode Modéliser, le reste de l'assemblage est dessiné comme en mode Placer (arêtes,
    // apparence de l'occurrence), non sélectionnable ; en Placer, hors du sous-arbre actif : fantôme
    const kind=!mine&&placer?'ghost':(self||!placer)?'solid':'pick';
    const g=new THREE.Group();g.matrixAutoUpdate=false;g.matrix.copy(asmMat4(asmCompose(V,inst.F)));
    g.userData.path=inst.path; // chemin absolu : points d'accroche (48-assemblage-accroches)
    g.userData.kind=kind;      // centre de rotation : les fantômes ne comptent pas (asmOrbitPivot)
    if(kind==='pick'){g.userData.occ=key;g.name='occ_'+key;}
    const on=kind==='pick'&&asmSelId===key;
    // apparence de l'occurrence (intensité, transparence, arêtes — 48-assemblage-apparence),
    // la même en mode Placer et en mode Modéliser (V0.7.5)
    const look=asmLookOf(inst.path);
    c._snap.items.forEach(it=>{
      let mat;
      if(kind==='ghost')mat=new THREE.MeshStandardMaterial({color:it.color,transparent:true,opacity:0.18,depthWrite:false,metalness:.2,roughness:.6});
      else mat=asmLookMat(it,look,on); // couleur des corps, intensité, transparence (48-assemblage-apparence)
      const m=new THREE.Mesh(it.geo,mat);const ro=it.bid?asmOccRenduOf(inst.path,it.bid):null; // apparence de rendu choisie dans le rendu d'assemblage (occurrence)
      m.userData.rd={mat:ro?ro.mat:(it.rl?it.rl.mat:null),color:ro?ro.col:(it.rl?it.rl.color:it.color),rel:ro?ro.rel:(it.rl?it.rl.rel:null),cmat:it.cm||null,ccol:it.color,ghost:kind==='ghost',
        bid:it.bid||null,comp:inst.comp,occ:inst.path.length?inst.path[inst.path.length-1]:null}; // apparence de rendu (98-rendu, 98-rendu-vue)
      if(kind==='pick')m.userData.occ=key;else{m.raycast=()=>{};if(kind==='ghost')m.renderOrder=-1;}
      g.add(m);
      if(kind!=='ghost'){try{glassDepthMask({mesh:m});}catch(e){}} // passes de verre, comme une pièce
    });
    if(kind!=='ghost'&&c._snap.edges&&asmEdgesShown(look))
      g.add(asmEdgeLines(c._snap.edges,c._snap.items.some(it=>(look.gl!=null?look.gl:(it.gl||1))<0.999)));
    G.add(g);
  });
  G.updateMatrixWorld(true);
}
function asmDraw(){
  const S=asmSceneGet(),G=S.getObjectByName('asmOcc');
  asmClear(G);
  if(!asm)return;
  asmFill(G,true);
  try{asmGizmoDraw();}catch(e){} // manipulateur de l'occurrence sélectionnée (48)
}
function asmCtxDraw(){
  // Mode Modéliser : le reste de l'arbre autour de la pièce, dessiné comme en mode Placer (V0.7.5)
  if(typeof scene==='undefined'||!scene)return;
  let G=scene.getObjectByName('asmCtx');
  if(G)asmClear(G);
  if(!asmOn()||asmMode==='asm')return;
  if(!G){G=new THREE.Group();G.name='asmCtx';scene.add(G);}
  asmFill(G,false);
  try{refreshMirror();}catch(e){} // V0.7.5 : le sol passe sous les composants affichés autour de la pièce
}
function asmOrbitPivot(){
  // V0.7.4 — centre de rotation en mode Placer, comme en Modéliser (face choisie, sinon les pièces) :
  // repère choisi dans l'arbre (origine ou repère de construction du composant actif), sinon
  // l'occurrence sélectionnée, sinon le centre de ce qui est placé (fantômes exclus)
  if(asmMode!=='asm'||!asm)return null;
  if(asmPivot){const F=asmPivot.cg?asmCompFrame(asm.active,asmPivot.cg):asmFr0();if(F)return new THREE.Vector3(F.o[0],F.o[1],F.o[2]);}
  const G=asmSceneGet().getObjectByName('asmOcc');if(!G)return null;
  const box=new THREE.Box3();
  const take=g=>g.traverse(m=>{if(m.isMesh&&m.geometry)box.expandByObject(m);});
  if(asmSelId){const g=G.children.find(x=>x.userData&&x.userData.occ===asmSelId);if(g)take(g);}
  if(box.isEmpty())G.children.forEach(g=>{if(g.userData&&g.userData.kind!=='ghost')take(g);});
  return box.isEmpty()?null:box.getCenter(new THREE.Vector3());
}
function asmPivotPick(cg,name){
  // Clic sur un repère de l'arbre : il devient (ou cesse d'être) le centre de rotation
  const same=asmPivot&&(asmPivot.cg||null)===(cg||null);
  asmPivot=same?null:{cg:cg||null,name};
  if(asmPivot)asmSelId=null;
  try{faceEl.textContent=asmPivot?'Rotation de la vue autour de « '+name+' » (clic à nouveau ou Échap : autour des pièces).':'Rotation de la vue autour des pièces.';}catch(e){}
  try{asmDraw();renderTree();renderProps();}catch(e){}
}
function asmFit(){
  const S=asmSceneGet(),box=new THREE.Box3();
  S.getObjectByName('asmOcc').traverse(m=>{if(m.isMesh)box.expandByObject(m);});
  try{viewUpReset();}catch(e){}
  if(box.isEmpty()){camera.position.set(90,-90,90);controls.target.set(0,0,0);}
  else{const c=box.getCenter(new THREE.Vector3()),r=box.getSize(new THREE.Vector3()).length()||50;
    controls.target.copy(c);camera.position.copy(c).add(new THREE.Vector3(r*.7,-r*.6,r*.7));}
  controls.update();
}
/* ── navigation ── */
function asmShow(path,mode,selId){
  // Va à l'instance (chemin absolu), en mode 'part' (Modéliser) ou 'asm' (Placer)
  if(typeof skEdit!=='undefined'&&skEdit){try{faceEl.textContent='Fermez d’abord l’esquisse.';}catch(e){}return false;}
  asmEnsure();
  try{asmInspectClear();}catch(e){} // résultats d'inspection : propres à une vue (48)
  asmPivot=null; // repère choisi comme centre de rotation : propre au composant quitté
  const p=asmPathOK(path)?path.slice():[];
  const moved=p.join('/')!==asm.path.join('/');
  if(mode==='asm'){
    asmLeavePart();
    if(asmPathComp(p)!==asm.active||moved)asmActivatePath(p);
    if(!asmActiveComp()._snap){
      // composant jamais capturé (pièce seule jusqu'ici) : on force la capture
      asm._force=true;builtVersion=-1;try{rebuild();}catch(e){}asm._force=false;
    }
    asmBuildSnapshots();
    asmResolve();
    const first=asmMode!=='asm';
    asmMode='asm';
    try{document.body.setAttribute('data-asm','1');}catch(e){}
    const kids=asmActiveComp().occ;
    asmSelId=selId&&kids.some(o=>o.id===selId)?selId:(asmSelId&&kids.some(o=>o.id===asmSelId)?asmSelId:null);
    asmDraw();asmCtxDraw();
    if(first||moved)asmFit();
    try{renderTree();renderProps();docUndoUI();}catch(e){}
    const c=asmActiveComp();
    try{faceEl.textContent='Placer les composants de « '+c.name+' » : clic = sélectionner · double-clic = modéliser'+(asm.path.length?' · Échap = remonter':'')+'.';}catch(e){}
  }else{
    asmMode='part';
    try{document.body.removeAttribute('data-asm');}catch(e){}
    asmActivatePath(p);
    asmCtxDraw();
    try{renderTree();renderProps();docUndoUI();if(moved)showAll();}catch(e){}
    const c=asmActiveComp(),o=asmOcc(asm.path[asm.path.length-1]);
    try{faceEl.textContent='Modéliser « '+c.name+' »'+(o?' ('+o.name+')':'')+(asmOn()?' · le reste de l’assemblage est autour. « Placer » pour déplacer ses composants.':'');}catch(e){}
  }
  return true;
}
function asmEnter(){
  // Mode Placer. Un composant sans enfants n'a rien à placer : on remonte à son porteur,
  // l'occurrence d'où l'on vient sélectionnée (le « retour à l'assemblage » de V0.6.0).
  asmEnsure();
  const c=asmActiveComp();
  if(c&&!c.occ.length&&asm.path.length)return asmShow(asm.path.slice(0,-1),'asm',asm.path[asm.path.length-1]);
  return asmShow(asm.path,'asm');
}
function asmExit(occId){
  // Mode Modéliser : un enfant direct (occId), sinon le composant actif
  if(!asm)return;
  const c=asmActiveComp(),o=occId&&c&&c.occ.find(q=>q.id===occId);
  asmShow(o?asm.path.concat(o.id):asm.path,'part');
}
function asmUp(){
  // Remonte au porteur, en mode Placer, l'occurrence d'où l'on vient sélectionnée
  if(!asm||!asm.path.length)return false;
  return asmShow(asm.path.slice(0,-1),'asm',asm.path[asm.path.length-1]);
}
function asmToggle(){if(asmMode==='asm')asmExit();else asmEnter();}
function asmOnChange(viewOnly){
  // Appelé par le modèle (46) après toute modification de l'assemblage (viewOnly : bascule)
  if(!viewOnly){try{dirty=true;autosave();}catch(e){}asmExtSyncSoon();} // références externes (46)
  if(asmBuilding)return;
  // chaque étape protégée à part : un dessin raté ne doit pas laisser l'arbre périmé
  if(asmMode==='asm'){try{asmDraw();}catch(e){}try{renderTree();}catch(e){}try{renderProps();}catch(e){}}
  else{try{asmCtxDraw();}catch(e){}}
}
/* ── sélection en mode Placer ── */
function asmPickAt(e){
  const S=asmSceneGet();
  const r=renderer.domElement.getBoundingClientRect();
  const ndc=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
  rayc.setFromCamera(ndc,camera);
  const ms=[];S.getObjectByName('asmOcc').traverse(m=>{if(m.isMesh&&m.userData.occ)ms.push(m);});
  const h=rayc.intersectObjects(ms,false)[0];
  return h?h.object.userData.occ:null;
}
function asmClick(e){
  if(asmAlignPickAt(e))return; // commande Aligner : clic = repère (48)
  if(stdHolePickAt(e))return; // composants normalisés : pose sur des trous (48)
  const id=asmPickAt(e);
  asmSelId=id;if(id)asmPivot=null; // une pièce cliquée redevient le centre de rotation
  asmDraw();renderTree();renderProps();
  const o=asmOcc(id);
  try{faceEl.textContent=o?(o.name+' — composant « '+((asmComp(o.comp)||{}).name||'')+' »'+(o.fixed?' · fixée':'')+(o.align?' · alignée':'')+'\nDouble-clic = modéliser ce composant.'):'Aucun composant ici.';}catch(err){}
}
function asmDblClick(e){
  const id=asmPickAt(e);if(id)asmExit(id);
}
function asmKey(e){
  // Clavier en mode Placer → true si consommé
  if(asmMode!=='asm')return false;
  const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return false;
  const ctrl=e.ctrlKey||e.metaKey,k=String(e.key||'').toLowerCase();
  if(ctrl&&(k==='z'||k==='y'))return false; // routage unique en capture (undoDispatch, 45)
  if((e.key==='Delete'||e.key==='Backspace')&&asmSelId){e.preventDefault();asmAskDelete(asmSelId);return true;}
  if(e.key==='Escape'&&asmAlign){asmAlignCancel();return true;}
  if(e.key==='Escape'&&stdHolePick){stdHoleCancel();return true;}
  if(e.key==='Escape'&&asmAnim){asmAnimStop();return true;} // animation d'une liaison (48)
  if(e.key==='Escape'){
    if(asmSelId){asmSelId=null;asmDraw();renderTree();renderProps();}
    else if(asmPivot){asmPivotPick(asmPivot.cg,asmPivot.name);}
    else asmUp();
    return true;
  }
  return false;
}
/* ── commandes ── */
function asmCmdNewComp(){
  // Nouveau composant, enfant du composant actif ; on entre aussitôt dedans
  if(typeof skEdit!=='undefined'&&skEdit){try{faceEl.textContent='Fermez d’abord l’esquisse.';}catch(e){}return;}
  asmEnsure();asmLeavePart();
  const r=asmNewComp();if(!r)return;
  asmShow(asm.path.concat(r.occ.id),'part');
  try{faceEl.textContent='Nouveau composant « '+r.comp.name+' » dans « '+r.owner.name+' » : créez une esquisse. « Placer » pour le positionner.';}catch(e){}
}
function asmCmdNewOcc(){
  const src=asmOcc(asmSelId);
  if(!src){try{faceEl.textContent='Nouvelle occurrence : sélectionnez d’abord le composant à répéter (mode Placer).';}catch(e){}return;}
  const fr=JSON.parse(JSON.stringify(src.fr));
  const c=asmComp(src.comp),b=c&&c._snap?asmSnapBox(c._snap):null;
  fr.o[0]+=b?Math.max(10,1.2*(b.max.x-b.min.x)):50; // décalée le long de X pour qu'on la voie
  const o=asmAddOcc(src.comp,fr);if(!o)return;
  asmSelId=o.id;asmNotify();
  try{faceEl.textContent='Occurrence '+o.name+' ajoutée (décalée en X). Placez-la, ou alignez un repère.';}catch(e){}
}
function asmSnapBox(s){const b=new THREE.Box3();s.items.forEach(it=>{try{it.geo.computeBoundingBox();b.union(it.geo.boundingBox);}catch(e){}});return b;}
function asmToggleFixed(id){
  const o=asmOcc(id);if(!o)return;
  asmPush(o.fixed?'libérer':'fixer');o.fixed=!o.fixed;asmNotify();
}
function asmAskDelete(id){
  const o=asmOcc(id);if(!o)return;
  const c=asmComp(o.comp),seule=asmCompOccs(o.comp).length===1;
  if(!confirm('Supprimer l’occurrence « '+o.name+' » ?'+(seule?'\nC’est la dernière du composant « '+((c||{}).name||'')+' » : il sera supprimé avec ses sous-composants (Ctrl+Z pour annuler).':'')))return;
  asmDeleteOcc(id);if(asmSelId===id)asmSelId=null;asmNotify();
}
function asmRename(id){
  const o=asmOcc(id);if(!o)return;
  const c=asmComp(o.comp);
  const n=prompt('Nom du composant (toutes ses occurrences) :',c?c.name:'');if(!n||!c)return;
  asmPush('renommer');const old=c.name;c.name=n;
  asmCompOccs(c.id).forEach(q=>{q.name=q.name.replace(new RegExp('^'+old.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),n);});
  if(c.doc)c.doc.name=n;
  asmNotify();
}
/* ── arbre ── */
function asmNamesSync(){
  // V0.7.5 : un composant porte le nom de son document. Celui-ci change sans passer par
  // « Renommer » (ouverture, « Enregistrer sous », champ « Nom du document ») : la racine restait
  // « Sans titre » dans un fichier « Test Assemblage ». Les occurrences suivent, comme asmRename.
  if(!asm)return;
  asm.comps.forEach(c=>{
    const n=c&&c.doc&&typeof c.doc.name==='string'?c.doc.name.trim():'';
    if(!n||n===c.name)return;
    const old=c.name;c.name=n;
    if(old)asmCompOccs(c.id).forEach(q=>{q.name=q.name.replace(new RegExp('^'+old.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),n);});
  });
}
function asmBreadcrumb(t){
  // En tête de l'arbre (les deux modes) : fil d'Ariane et boutons Modéliser / Placer ; la
  // hiérarchie des composants est dessinée par l'arbre (42 : treeComps)
  if(!asmOn())return;
  asmNamesSync();
  const d=document.createElement('div');d.className='tnode asmCrumb';d.style.cssText='font-weight:600;flex-wrap:wrap;gap:2px';
  const seg=(txt,path,next,on)=>{const s=document.createElement('span');s.className='nm';s.textContent=txt;
    // V0.7.5 : un clic remonte à ce composant DANS LE MODE EN COURS (on sort de l'édition de la
    // pièce sans basculer en mode Placer) ; les boutons Modéliser / Placer changent de mode
    s.style.cssText='cursor:pointer;flex:none'+(on?';color:var(--primary)':'');
    s.title=on?'Composant actif':(asmMode==='asm'?'Placer les composants de « '+txt+' »':'Modéliser « '+txt+' » (sortir de l’édition de la pièce)');
    s.onclick=ev=>{ev.stopPropagation();if(!on)asmShow(path,asmMode==='asm'?'asm':'part',next);};return s;};
  const ic=document.createElement('span');ic.textContent='🧩';d.appendChild(ic);
  let c=asmRoot();
  d.appendChild(seg(c.name,[],asm.path[0],!asm.path.length));
  asm.path.forEach((id,i)=>{
    const o=c.occ.find(q=>q.id===id);if(!o)return;c=asmComp(o.comp);
    const sp=document.createElement('span');sp.textContent='›';sp.style.color='var(--muted)';d.appendChild(sp);
    d.appendChild(seg(c.name,asm.path.slice(0,i+1),asm.path[i+1],i===asm.path.length-1));
  });
  // V0.7.5 : les deux modes du composant actif, en boutons (était un simple libellé)
  const sw=document.createElement('span');sw.className='asmModeSw';sw.style.cssText='margin-left:auto;display:flex;gap:2px;font-weight:400';
  [['part','✏️ Modéliser','Modéliser la pièce : esquisses, fonctions, corps (en mode Placer : la pièce sélectionnée)'],['asm','🧩 Assembler','Placer les pièces dans l’assemblage : déplacer, aligner, liaisons (depuis une pièce sans sous-composants : l’assemblage qui la contient, elle sélectionnée)']].forEach(([k,lab,tip])=>{
    const b=document.createElement('button');b.className='mini asmModeBtn';b.dataset.mode=k;b.textContent=lab;b.title=tip;
    b.style.cssText='padding:0 6px;height:18px;min-height:0;line-height:16px;font-size:11px;border-radius:5px'; // fins : ils tiennent dans la ligne du fil d'Ariane
    const on=asmMode===k;if(on){b.style.outline='2px solid var(--accent, #0a84ff)';b.style.color='var(--primary)';}
    // aller-retour sans quitter la pièce : Placer depuis une pièce sans sous-composants → l'assemblage
    // qui la contient, elle sélectionnée ; Modéliser depuis Placer → la pièce sélectionnée
    b.onclick=ev=>{ev.stopPropagation();if(on)return;
      const P=asm.path.slice();
      if(k==='asm'){if(!asmActiveComp().occ.length&&P.length)asmShow(P.slice(0,-1),'asm',P[P.length-1]);else asmShow(P,'asm');}
      else asmShow(asmSelId?P.concat(asmSelId):P,'part');};
    sw.appendChild(b);});
  d.appendChild(sw);
  t.appendChild(d);
}
function asmTreeRender(t){
  // Mode Placer d'un assemblage encore SANS occurrence (sinon : 42, treePlacer sous le composant actif)
  asmBreadcrumb(t);
  const c=asmActiveComp();
  const row=(html,cls,title)=>{const d=document.createElement('div');d.className=cls;d.innerHTML=html;if(title)d.title=title;t.appendChild(d);return d;};
  row('<span>🧩 '+asmEsc(c.name)+' · placer ses composants</span>','tgroup');
  // V0.7.4 : un clic sur un repère en fait le centre de rotation de la vue
  const piv=(cg,name,r)=>{r.style.cursor='pointer';if(asmPivot&&(asmPivot.cg||null)===(cg||null))r.className+=' sel';r.onclick=()=>asmPivotPick(cg,name);};
  const on='Origine de « '+c.name+' »';
  piv(null,on,row('<span class="pdot" style="background:#fff;box-shadow:0 0 0 2px #1c1c1e inset"></span><span class="nm">'+asmEsc(on)+'</span>','tnode','Repère du composant : cible d’un alignement · clic = la vue tourne autour'));
  (c.doc.cgeo||[]).forEach(k=>{if(k&&k.kind==='frame')piv(k.id,k.name,row('<span>⌖</span><span class="nm">'+asmEsc(k.name)+'</span>','tnode','Repère de construction du composant : cible d’un alignement · clic = la vue tourne autour'));});
  if(!c.occ.length)row('<span class="nm" style="color:var(--muted)">Aucun composant : « Nouveau composant » ou « Insérer ».</span>','tnode');
}
/* ── panneau ── */
function asmRenderProps(p){
  const mk=(tag,cls,txt)=>{const d=document.createElement(tag);if(cls)d.className=cls;if(txt!=null)d.textContent=txt;return d;};
  const H=t=>p.appendChild(mk('div','pnl-h',t));
  const Note=t=>p.appendChild(mk('div','pnl-note',t));
  const Btns=list=>{const d=mk('div','pnl-btns');list.forEach(([t,fn,cls])=>{const b=mk('button',cls||null,t);b.onclick=fn;d.appendChild(b);});p.appendChild(d);return d;};
  if(typeof asmAlign!=='undefined'&&asmAlign){asmAlignProps(p);return;} // commande Aligner (48)
  const c=asmActiveComp();
  const o=asmOcc(asmSelId);
  if(!o||!c.occ.includes(o)){
    H('🧩 '+c.name);
    Note(c.occ.length+' composant(s) placé(s) ici, '+asm.comps.length+' composant(s) dans le fichier. Cliquez un composant (vue ou arbre) ; double-clic = le modéliser.');
    const l=[['➕ Nouveau composant',asmCmdNewComp,'primary'],['📥 Insérer…',asmCmdInsert],['🔩 Normalisés…',()=>stdDlg()],['✏️ Modéliser « '+c.name+' »',()=>asmExit()]];
    if(asm.path.length)l.push(['↑ Remonter',asmUp]);
    Btns(l);
    asmJointsProps(p); // piloter les liaisons (48)
    return;
  }
  const cc=asmComp(o.comp)||{};
  H('📦 '+o.name);
  Note('Composant « '+cc.name+' » · '+asmCompOccs(o.comp).length+' occurrence(s)'+(cc.occ&&cc.occ.length?' · '+cc.occ.length+' sous-composant(s)':''));
  if(cc.link)Note('🔗 Lié à '+(cc.link.rel||cc.link.name)+(asmLinkDirty(cc)?' · ✎ modifié ici (écrit à l’enregistrement)':'')+(cc.link.st==='warn'?' · ⚠ '+cc.link.msg:''));
  else if(cc.of)Note('🔗 Fait partie d’un composant lié.');
  if(o.st==='warn')Note('⚠ '+o.msg);
  const f=v=>v.map(x=>(+x).toFixed(2).replace('.',',')).join(' ; ');
  Note('Position : '+f(o.fr.o)+' · Z : '+f(o.fr.z));
  {const g=globalThis.asmPlacementProps;if(typeof g==='function')g(p,o);} // placement (48)
  const l=[['✏️ Modéliser',()=>asmExit(o.id),'primary']];
  if(cc.occ&&cc.occ.length)l.push(['🧩 Placer ses composants',()=>asmShow(asm.path.concat(o.id),'asm')]);
  if(cc.doc&&cc.doc.std)l.push(['🔩 Modifier…',()=>stdDlg({occ:o.id})]); // pièce normalisée (48)
  l.push(['➕ Occurrence',asmCmdNewOcc],[o.fixed?'📌 Libérer':'📌 Fixer',()=>asmToggleFixed(o.id)],['🗑 Supprimer',()=>asmAskDelete(o.id),'danger']);
  Btns(l);
  {const lm=asmLinkMenu(cc);if(lm.length)Btns(lm.map(x=>[x.html,x.fn]));}
}
function asmAfterLoad(){
  // Fin d'ouverture (deserialise) : instantanés des composants, puis mode Placer si le
  // fichier a été enregistré dedans ; sinon le reste de l'arbre autour du composant actif
  try{document.body.removeAttribute('data-asm');}catch(e){}
  asmSelId=null;
  if(!asmOn()){try{asmCtxDraw();}catch(e){}return;}
  const want=!!asm._wantAsm;asm._wantAsm=false;
  setTimeout(()=>{
    try{asmBuildSnapshots();}catch(e){}
    // asmEnter : un composant sans enfants (fichier V0.6.0 : la pièce active) → son porteur
    if(want){try{asmEnter();}catch(e){}}else{try{asmCtxDraw();renderTree();}catch(e){}}
    // composants liés : sources vérifiées sans rien demander (l'autorisation demande un clic)
    if(asmLinked().length){try{asmLinkRebase();asmLinksCheck(false);}catch(e){}}
    try{asmSnapSyncSoon();}catch(e){} // points d'accroche : faces relues sur la forme exacte
  },0);
}
/* ── insérer un fichier .miniFusion (copie : il devient un composant du composant actif) ── */
async function asmCmdInsert(){
  if(asmMode!=='asm')asmEnter();
  if(MFF_FS)return asmCmdLinkInsert(); // Chrome / Edge : Lier ou Copier (47-composants-lies)
  let txt=null,name='';
  try{
    if(MFF_FS){
      const o={types:MFF_TYPES,multiple:false};if(mffFolder)o.startIn=mffFolder;
      const [h]=await window.showOpenFilePicker(o);if(!h)return;
      const f=await h.getFile();txt=await f.text();name=f.name;
    }else{
      const f=await new Promise(res=>{const i=document.createElement('input');i.type='file';i.accept='.miniFusion,.json';i.onchange=()=>res(i.files&&i.files[0]);i.click();});
      if(!f)return;txt=await f.text();name=f.name;
    }
  }catch(e){if(!(e&&e.name==='AbortError'))alert('Lecture impossible : '+(e&&e.message||e));return;}
  if(txt!=null)await asmInsertText(txt,name);
}
function asmTreeOfFile(top){
  // Arbre de composants d'un fichier (pièce seule, V0.6.0 ou V0.6.1), sans toucher à l'état
  const topDoc=docFromSerial(top);
  const t=top.asm?asmTreeFromSerial(top.asm,topDoc):null;
  return t||{name:top.name,root:'_r',comps:[{id:'_r',kind:'comp',name:String(top.name||'Composant'),doc:topDoc,occ:[],link:null}],active:'_r'};
}
async function asmInsertText(txt,name){
  // Copie un projet (pièce seule ou assemblage) : sa racine devient un composant enfant du
  // composant actif, avec sa géométrie ; ses sous-composants restent imbriqués, ses
  // alignements internes suivent (identifiants renouvelés).
  let b;try{b=JSON.parse(txt);}catch(e){alert('Fichier illisible.');return false;}
  const top=(b&&b.bundle===1&&b.doc)?b.doc:b; // ancien .minifusion.json : document nu
  if(!top||!Array.isArray(top.features)){alert('Ce n’est pas un projet MiniFusion.');return false;}
  const t=asmTreeOfFile(top);
  // Déjà inséré ? Mêmes identifiants de fonctions qu'un composant présent : les caches FAO
  // (clés par posage / opération) seraient partagés entre deux composants indépendants.
  const ids=new Set();t.comps.forEach(c=>(c.doc.features||[]).forEach(f=>{if(f&&f.id)ids.add(f.id);}));
  asmEnsure();
  const dup=ids.size&&asm.comps.some(c=>(c.doc.features||[]).some(f=>ids.has(f.id)));
  if(dup&&!confirm('Ce fichier semble déjà présent dans l’assemblage (mêmes fonctions).\nLe réinsérer crée un composant INDÉPENDANT, dont les parcours FAO partagent leur cache avec l’autre.\nPour répéter le même composant, utilisez plutôt « Occurrence ».\n\nInsérer quand même ?'))return false;
  if(b&&b.bundle===1){try{await bundleStoreCaches(b);}catch(e){}}
  const owner=asmActiveComp();
  asmPush('insérer « '+(name||top.name||'fichier')+' »');
  const base=String(name||top.name||'Composant').replace(/\.(miniFusion|minifusion|json)$/,'').replace(/\.minifusion$/i,'');
  // identifiants neufs : composants, occurrences, chemins des alignements
  const cm={},om={};
  t.comps.forEach(c=>{cm[c.id]=uid('cp');c.occ.forEach(o=>{om[o.id]=uid('oc');});});
  const rp=path=>(path||[]).map(id=>om[id]||id);
  const neufs=t.comps.map(c=>{
    const nm=c.id===t.root?base:c.name;c.doc.name=nm;
    return {id:cm[c.id],kind:'comp',name:nm,doc:c.doc,link:null,occ:c.occ.map(o=>Object.assign({},o,{id:om[o.id],comp:cm[o.comp],
      align:o.align?Object.assign({},o.align,{src:{path:rp(o.align.src.path),cg:o.align.src.cg},dst:{path:rp(o.align.dst.path),cg:o.align.dst.cg}}):null}))};
  });
  {const L=asmLinkOwner(owner);if(L)neufs.forEach(c=>{c.of=L.id;});} // inséré dans un composant lié : il en fait partie
  neufs.forEach(c=>asm.comps.push(c));
  // à droite de ce qui est déjà affiché
  let dx=0;try{const box=new THREE.Box3();asmSceneGet().getObjectByName('asmOcc').traverse(m=>{if(m.isMesh)box.expandByObject(m);});if(!box.isEmpty())dx=box.max.x+20;}catch(e){}
  const o=asmNewOccObj(cm[t.root],base+':1',{o:[dx,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]});
  owner.occ.push(o);
  try{asmBuildSnapshots();}catch(e){}
  asmResolve();
  asmSelId=o.id;
  asmNotify();
  try{faceEl.textContent='Inséré : « '+base+' » ('+neufs.length+' composant(s)) dans « '+owner.name+' ». Placez-le ou alignez un repère.';}catch(e){}
  return true;
}
