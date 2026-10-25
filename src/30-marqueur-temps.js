/* ---------- marqueur temps (timeline 360) : blocage du rejeu à une position ---------- */
let tlMark=null; // id de la PREMIÈRE fonction EXCLUE (ce qui précède reste actif) ; null = fin
function tlIdx(){ // index du marqueur dans doc.features, ou -1 (levé s'il a disparu)
  if(tlMark==null)return -1;
  const i=doc.features.findIndex(f=>f.id===tlMark);
  if(i<0){tlMark=null;return -1;}
  return i;
}
function tlActiveList(){ // fonctions rejouées (tout si pas de marqueur)
  const i=tlIdx();return i<0?doc.features:doc.features.slice(0,i);
}
function tlReplayCount(){ // nb de fonctions VISIBLES avant le marqueur (upto pour occFinalShape)
  const i=tlIdx();if(i<0)return null;
  return doc.features.slice(0,i).reduce((n,f)=>n+(f.visible!==false?1:0),0);
}
function tlSetPtr(f){ // bloque le temps juste AVANT la fonction f (null = rejouer tout)
  tlMark=f&&doc.features.some(x=>x.id===f.id)?f.id:null;
}
function tlEditLock(f){
  // Verrouille l'arbre sur la fonction en cours d'édition : seules les opérations qui
  // la précèdent restent visibles et rejouées. À appeler à l'entrée de chaque session
  // d'édition (esquisse, congé, dépouille, coque), avant son rebuild.
  if(!f||!doc.features.some(x=>x.id===f.id))return false;
  if(tlMark!==f.id){tlSetPtr(f);markDirty();}
  return true;
}
function tlEditUnlock(){
  // Lève le verrou : la fonction modifiée ET celles qui suivent sont régénérées au
  // rebuild suivant. À appeler à TOUTE sortie de session (validation comme annulation).
  if(tlMark==null)return false;
  tlSetPtr(null);markDirty();
  return true;
}
function tlHostFeatureOfSketch(sk){
  // Fonction « propriétaire » d'une esquisse : la première extrusion/révolution qui
  // l'utilise (ordre timeline), sinon l'hôte de face (esquisse posée sur face).
  if(!sk)return null;
  const users=doc.features.filter(f=>(f.type==='extrude'||f.type==='revolve'||f.type==='hole')&&f.sketchId===sk.id);
  if(users.length)return users.sort((a,b)=>doc.features.indexOf(a)-doc.features.indexOf(b))[0];
  if(sk.host&&sk.host.feat){const h=doc.features.find(f=>f.id===sk.host.feat);if(h)return h;}
  return null;
}
function tlLockedByIndex(i){const m=tlIdx();return m>=0&&i>=m;}
function tlLocked(f){return f&&tlLockedByIndex(doc.features.indexOf(f));}
function addFeature(f){ // insertion au niveau du marqueur si actif (nouveautés rejouées)
  // Point d'insertion UNIQUE de toute création de fonction (extrusion, révolution,
  // congé/chanfrein exact, répétition, et les fonctions 3D à venir) : c'est donc
  // ici que se prend l'instantané d'annulation. Une seule étape par création.
  // La fonction naît dans le corps ACTIF (sélectionné dans l'arbre) — jamais orpheline.
  if(f&&!f.body)try{f.body=ensureActiveBody();}catch(e){}
  docPushUndo('création de « '+(f.name||f.type)+' »');
  const i=tlIdx();
  if(i<0)doc.features.push(f);else doc.features.splice(i,0,f);
  return f;
}
// « fraîcheur » : dur par DEFAUT — chaque modification reconstruit le modèle depuis zéro
// (aucun sous-ensemble réutilisé). Passer à false active le rejeu rapide par points de contrôle.
let hardPh=null; // {rep,purge,rejeu,aff,hotes,replay,mesh,maillage,proj} — rempli pendant hardRefresh()
const phAdd=(k,ms)=>{if(hardPh)hardPh[k]=(hardPh[k]||0)+ms;}; // nul hors rafraîchissement dur
let freshHard=false; // REJEU RAPIDE toujours (2026-10-02-013 : le filet featSig -011 prouve que le
// rapide est aussi juste que le complet). V0.7.6 : la case ⚙ « Rafraîchissement dur à chaque
// modification » est supprimée — true ne sert plus qu'aux tests (comparaison au rejeu complet) ;
// le bouton ponctuel « Rafraîchissement dur » reste. L'ancienne préférence est effacée.
try{localStorage.removeItem('minifusion_freshHard');}catch(e){}
let rebuildDepth=0;
// 2026-10-15-009 : passes de régénération jusqu'à CONVERGENCE (projections → instances →
// faces porteuses → solide…). Une chaîne cote → face → projection → symétrie → face →
// poche demande plusieurs passes ; une seule était permise.
const REGEN_MAX_PASS=4;
function buildKeyUpToDate(){
  // Un affichage valide existe-t-il encore pour l'état courant du document ?
  return bodies.length>0&&builtVersion===_docVersion&&builtTl===tlMark&&builtSkip===occSkipFeat;
}
function buildDone(){
  // Fin de reconstruction : rejeu terminé. L'empreinte du document et le cache
  // d'affichage (copie de tous les sommets + IndexedDB) sont REPUSSES apres le rendu.
  builtVersion=_docVersion;builtTl=tlMark;builtSkip=occSkipFeat;
  // FAO : les limites « esquisse » sont re-extraites du document et les
  // limites « chaîne » re-suivies sur les arêtes du nouveau solide (état
  // dérivé : pas d'entrée d'annulation) ; sinon marquées obsolètes (stale).
  try{if(typeof faoSketchReplay==='function')faoSketchReplay();}catch(e){}
  try{if(typeof faoChainReplay==='function')faoChainReplay();}catch(e){}
  // Perçage : les trous sélectionnés suivent le modèle reconstruit (2026-10-15-011).
  try{if(typeof faoDrillReplay==='function')faoDrillReplay();}catch(e){}
  // Fonction Perçage : image du taraudage (hélice + Ø nominal) sur les trous taraudés.
  try{if(typeof holeThreadOverlay==='function')holeThreadOverlay();}catch(e){}
  // FAO : le solide vient d'être (re)construit — l'Ébauche 3D embarque son empreinte
  // dans sa clé de cache. Au F5 la 1re lecture a lieu sur le REPLI MAILLAGE, avant le
  // boot du noyau exact : clé fausse, entrée rejetée, triangle rouge qui ne retombait
  // JAMAIS (le Surfaçage, lui, ne dépend pas du solide — d'où « il passe toujours »).
  // Dès que l'empreinte change, on RELIT le cache : aucune recalculation.
  try{ if(typeof faoMovesSolidChanged==='function'&&faoMovesSolidChanged())faoMovesPreloadSoon(true); }catch(e){}
  // « Tout régénérer » pressé PENDANT le rejeu (corps encore en repli d'image) :
  // le solide est enfin là, on exécute maintenant (sinon la clé ecrirait sur le repli).
  try{ if(typeof faoRegenFlush==='function')faoRegenFlush(); }catch(e){}
  // Session d'esquisse ouverte : le rejeu régénère les matériaux — le fondu SK_FACE_ALPHA (et le
  // masquage des corps en mode fantôme) serait perdu. skApplyFade est inerte hors session.
  try{if(typeof skApplyFade==='function')skApplyFade();}catch(e){}
  // Géométrie de construction (79) : dessinée sur la pièce reconstruite (taille des plans)
  try{cgDraw();}catch(e){}
  // Assemblage (47) : instantané d'affichage de la pièce active + fantômes de contexte
  try{asmCaptureActive();}catch(e){}
  if(_postT)clearTimeout(_postT);
  _postT=setTimeout(()=>{_postT=null;
    try{builtHash=docHash();}catch(e){}
    try{saveViewCache();}catch(e){}
  },150);
}
function rebuild(pass){
  // Rejeu inutile : aucune modification depuis le dernier affichage valide, meme marqueur
  // temps → on ne refait pas la geometrie (les boutons qui TECLENT un rebuild sans changer
  // le document ne coutent plus rien).
  // 2026-10-16-008 : paramètres ƒx (cotes nommées, expressions des fonctions 3D) à jour AVANT le rejeu
  if(!pass){try{if(typeof parApplyAll==='function')parApplyAll();}catch(e){}}
  if(!pass&&buildKeyUpToDate())return;
  // Mode « fraîcheur » : on jette les points de contrôle AVANT le rejeu, donc chaque
  // modification reconstruit le modèle depuis zéro — aucun sous-ensemble n'est réemployé
  // d'une reconstruction à l'autre. (Les rejeux imbriqués des projections gardent le cache
  // du rejeu courant : sans effet sur le résultat, seulement sur la vitesse.)
  if(!pass&&freshHard){
    try{occCkClear();}catch(e){}
    builtVersion=-1;_hashMemo=null;_hashVer=-1;
  }
  // Filet de sécurité : une chaîne de rejeux qui ne converge pas (référence croisée cassée,
  // projection instable) ne doit JAMAIS figer l'interface. Deux niveaux imbriqués sont
  // autorisés (rebuild + passe de projections) ; au-delà, on arrête et on prévient.
  if(rebuildDepth>=REGEN_MAX_PASS+2){try{faceEl.textContent+=(faceEl.textContent?'\n':'')+'[Rejeu] reconstruction interrompue (rejeu non borné) — rechargez la page.';}catch(e){}return;}
  rebuildDepth++;
  const _pp=occProjPass;occProjPass=pass||0; // 0 = rejeu principal (pas de ck en mode frais)
  try{return rebuildInner(pass);}finally{rebuildDepth--;occProjPass=_pp;}
}
function rebuildInner(projPass){
  projPass=projPass||0;
  const _th=performance.now();
  try{importHydrate();}catch(e){} // imports STEP/STL : géométrie revivifiée si un instantané d'annulation l'a stripée
  try{ensureBodies();}catch(e){} // corps conteneurs : migration des anciens documents
  (doc.sketches||[]).forEach(migrateSketch); // compat anciens brouillons + verrouille le modèle points
  // « Vers un objet » : résolution de la distance (antériorité) AVANT les hôtes de faces.
  (doc.features||[]).forEach(f=>{if(f.type==='extrude'&&f.upto){try{resolveExtrudeUpto(f);}catch(e){}}});
  try{resolveAllSketchHosts();}catch(e){}
  // Géométrie de construction (78) : résolue dans l'ordre timeline, elle recopie sa base dans
  // les esquisses posées dessus — qui peuvent porter à leur tour des esquisses sur faces.
  try{if(typeof cgResolveAll==='function'&&cgResolveAll())resolveAllSketchHosts();}catch(e){}
  // 2026-10-15-009 : les INSTANCES de symétrie/répétition suivent leurs sources pendant
  // le rejeu (elles n'étaient régénérées qu'à l'édition manuelle de la source : une
  // source déplacée par une projection ou une face porteuse laissait la copie périmée).
  // Garde par signature : seules les répétitions dont une source a changé sont refaites.
  try{if(typeof repSyncStale==='function'&&repSyncStale())resolveAllSketchHosts();}catch(e){}
  phAdd('hotes',performance.now()-_th);
  // 2026-10-16-008 : projections associatives AVANT le rejeu principal (ordre timeline, hôtes
  // de faces et instances recalés au fil de l'eau) → le rejeu se fait UNE fois sur un modèle
  // déjà cohérent, au lieu de « rejeu → projections bougent → second rejeu ».
  if(!projPass){const _tq=performance.now();try{if(typeof projPreUpdate==='function')projPreUpdate();}catch(e){}phAdd('proj',performance.now()-_tq);}
  // Snapshot du dernier état valide : commit si le rebuild aboutit, rollback sinon.
  const prevBodies=bodies,prevLive=occLive;
  const prevSet=new Set(scene.children);
  // Snapshot des solides affichés pour « à travers tout » : les meshes précédents restent
  // vivants jusqu'au commit, extrudeSpan peut lire l'étendue réelle de la pièce pendant la
  // construction de la nouvelle géométrie (bodies vient d'être vidé un cran plus bas).
  lastSolidBodies=bodies.filter(b=>!b.ghost&&b.mesh&&b.mesh.geometry&&b.mesh.geometry.attributes&&b.mesh.geometry.attributes.position&&b.mesh.geometry.attributes.position.count>0);
  bodies=[];occLive=null;
  const commitPrev=()=>{
    // Un IMPORT n'est pas un corps reconstruit : son mesh (`f._mesh`) est RETENU entre
    // les rejeux et RÉAFFICHÉ tel quel par occRebuild. Le retirer de la scène + le
    // libérer le faisait disparaître dès le rejeu suivant (création d'une esquisse) alors
    // que `bodies` le contient toujours. On ne retire donc que ce qui n'est plus
    // affichable, et on ne libère que ce que la table d'imports n'entretient pas
    // (annuler/rétablir doit pouvoir le remettre en scène tel quel).
    const vivant=importMeshesOfDoc(),garde=importOwnedMeshes();
    for(const b of prevBodies){
      if(!b||!b.mesh||vivant.has(b.mesh))continue;
      try{scene.remove(b.mesh);}catch(e){}
      if(!garde.has(b.mesh)){try{if(b.mesh.geometry)b.mesh.geometry.dispose();}catch(e){}}
      try{if(b._faoGeo&&b._faoGeo.dispose)b._faoGeo.dispose();}catch(e){}
      try{if(b._faoGeoFine&&b._faoGeoFine.dispose)b._faoGeoFine.dispose();}catch(e){}
    }
    if(prevLive&&(!occLive||occLive.shape!==prevLive.shape)){try{prevLive.shape.delete();}catch(e){}}
  };
  const rollbackPrev=why=>{
    for(const o of [...scene.children]){if(!prevSet.has(o)){scene.remove(o);if(o.isMesh&&o.geometry){try{o.geometry.dispose();}catch(e){}}}}
    bodies=prevBodies;occLive=prevLive;
    try{drawSketchHelpers();}catch(e){}
    try{cgDraw();}catch(e){}
    if(filMode){try{buildFilletOverlay();}catch(e){}}
    else if(filModeX&&occLive&&occLive.shape){try{filEdgesReload();}catch(e){}try{buildExactOverlay();}catch(e){}}
    faceEl.textContent+=(faceEl.textContent?'\n':'')+'Rebuild interrompu ('+why+') — dernier état valide conservé.';
    builtHash=null;builtEngine=null;builtVersion=-1;
    refreshParts();renderTree();autosave();applyClip();occStatus();refreshMirror();buildEdgeOverlay();clearHover();
  };
  clearMeasure();if(selGroup){scene.remove(selGroup);selGroup=null;}selFaces=[];
  // nettoie prévisu esquisses 3D
  scene.children.filter(o=>o.name&&o.name.startsWith('sk_')).forEach(o=>scene.remove(o));
  drawSketchHelpers();
  try{
  let ci=0;const filWarn=[];
  // Opération additive / soustractive : migration des anciens projets (défaut = additif)
  (doc.features||[]).forEach(f=>{if(f.type==='extrude'&&!f.op)f.op='add';});
  // Voie exacte OCCT (prioritaire) : prismes BRep + Fuse/Cut + tessellation.
  if(occHas()){
    if(occRebuild()){occEngineMsg='exact OCCT';occStatus();refreshParts();renderTree();autosave();applyClip();if(filMode)buildFilletOverlay();else if(filModeX){if(occLive&&occLive.shape){try{filEdgesReload();}catch(e){}}buildExactOverlay();}buildEdgeOverlay();refreshMirror();commitPrev();builtEngine='exact';buildDone();projRefreshRerun(projPass);return;}
    occEngineMsg='maillage (repli exact impossible — voir Mesure)';
    faceEl.textContent+=(faceEl.textContent?'\n':'')+'OCCT : repli sur le moteur maillage pour ce rebuild.';
    if(bodies.length)clearBodies(); // sécurité : un repli partiel ne doit jamais doubler l'affichage
  }else occEngineMsg='maillage (OCCT absent)';
  const _tm=performance.now();
  const csgOK=(typeof CSG!=='undefined'&&CSG&&CSG.fromMesh&&CSG.toMesh);
  // Phase 1 : construit chaque prisme en coordonnées monde (sans l'afficher encore)
  const jobs=[]; // {f, geos:[BufferGeometry monde], ghost?:false}
  tlActiveList().filter(f=>f.visible!==false).forEach(f=>{
    if(f.type==='extrude'||f.type==='revolve'||f.type==='hole'){
      try{
        const geos=(f.type==='revolve')?legacyRevolveGeos(f,filWarn):(f.type==='hole'?legacyHoleGeos(f,filWarn):legacyPrismGeos(f,filWarn));
        if(geos.length)jobs.push({f,geos});
      }catch(e){
        const quoi=(f.type==='revolve')?'révolution impossible':'extrusion impossible';
        let msg=`${f.name} : ${quoi} — ${e.message}. Ouvrez l'esquisse : les bouts ouverts sont en rouge, bouton « Refermer ».`;
        faceEl.textContent+=(faceEl.textContent?'\n':'')+msg;
      }
    }
    if(f.type==='import'){
      // La géométrie d'un import n'est PAS persistée (comme serialise) : un retour
      // d'annulation peut donc remettre une fonction import sans _mesh vivant. On
      // l'ignore proprement au lieu de planter le rejeu (régression 30y/30z).
      if(f._mesh&&typeof f._mesh.updateMatrixWorld==='function'){
        try{
          f._mesh.updateMatrixWorld(true);
          const g=f._mesh.geometry.clone();g.applyMatrix4(f._mesh.matrixWorld);
          jobs.push({f,geos:[g],isImport:true});
        }catch(e){faceEl.textContent='Import illisible : '+e.message;}
      }else{
        faceEl.textContent+=(faceEl.textContent?'\n':'')+'Un corps importé a perdu sa géométrie au retour d\'annulation — réimportez le fichier.';
      }
    }
  });
  const hasCut=jobs.some(j=>(j.f.op||'add')==='cut'&&!j.isImport);
  if(hasCut&&csgOK){
    // Phase 2 : booléens séquentiels dans l'ordre de la timeline (add = union, cut = soustraction)
    let result=null;const ghosts=[];const boolWarn=[];
    jobs.forEach(j=>{
      const op=j.isImport?'add':(j.f.op||'add');
      j.geos.forEach(g=>{
        try{
          const probe=new THREE.Mesh(g);probe.updateMatrix();
          const c=CSG.fromMesh(probe);
          if(op==='cut'){
            if(!result){boolWarn.push(j.f.name+' : soustraction dans le vide — ignorée (ajoutez d\u2019abord un volume additif).');ghosts.push({g,orphan:true,fid:j.f.id});return;}
            result=result.subtract(c);
            ghosts.push({g,fid:j.f.id});
          }else{
            result=result?result.union(c):c;
          }
        }catch(e){boolWarn.push(j.f.name+' : booléen impossible ('+e.message+')');}
      });
    });
    if(boolWarn.length)faceEl.textContent+=(faceEl.textContent?'\n':'')+boolWarn.slice(0,3).join('\n');
    if(result&&result.polygons.length){
      try{
        const _ja=jobs.filter(j=>(j.f.op||'add')==='add'||j.isImport);
        // Le solide combiné appartient au corps de sa PREMIÈRE fonction additive :
        // c'est la fiche de ce corps qui porte sa couleur et sa transparence.
        const _jh=_ja.find(j=>!j.isImport)||_ja[0]||null;
        const csgId=_jh&&_jh.f&&_jh.f.body?_jh.f.body:null;
        const col=bodyColorOf(csgId);
        const mat=applyBodyStyle(new THREE.MeshStandardMaterial({metalness:.35,roughness:.4,clippingPlanes:clipPlane?[clipPlane]:null}),csgId);
        const mesh=CSG.toMesh(result,new THREE.Matrix4(),mat);
        mesh.userData.bid='csg_result';scene.add(mesh);
        const nA=_ja.length,nC=jobs.filter(j=>(j.f.op||'add')==='cut').length;
        bodies.push({id:'csg_result',name:`Solide combiné (${nA}➕ ${nC}➖)`,mesh,color:col,visible:true,kind:'boolean',ref:null,bodyId:csgId});ci++;
        // Les imports ont été FUSIONNÉS dans ce résultat : leur mesh ne doit pas rester
        // en scène (il y aurait la pièce deux fois). La table d'imports le conserve —
        // ni libéré ni retiré du document, seulement de l'affichage.
        jobs.forEach(j=>{if(j.isImport&&j.f._mesh){try{scene.remove(j.f._mesh);}catch(e){}}});
      }catch(e){faceEl.textContent+=(faceEl.textContent?'\n':'')+'Combiné impossible : '+e.message;}
    }else{
      faceEl.textContent+=(faceEl.textContent?'\n':'')+'Soustraction : le solide est vide (tout a été retiré).';
    }
    // Fantômes des outils de découpe (rouge translucide, exclus de l'export, masqués par défaut)
    ghosts.forEach((gh,i)=>{
      const mat=new THREE.MeshStandardMaterial({color:0xff453a,transparent:true,opacity:0.22,depthWrite:false});
      const mesh=new THREE.Mesh(gh.g,mat);mesh.userData.bid='ghost_'+i;mesh.raycast=()=>{};mesh.visible=false;
      scene.add(mesh);
      bodies.push({id:'ghost_'+i,name:'🔧 Outil '+(gh.orphan?'(orphelin)':'(découpe)'),mesh,color:0xff453a,visible:false,kind:'ghost',ref:gh.fid||null,ghost:true});
    });
  }else{
    if(hasCut&&!csgOK)faceEl.textContent+=(faceEl.textContent?'\n':'')+'Découpe demandée mais moteur CSG absent (threejs/CSG.js manquant).';
    // Sans découpe : affichage direct comme avant (rapide, sans BSP)
    jobs.forEach(j=>{
      if(j.isImport){
        const col=bodyColorOf(j.f.body); // l'import est rangé dans un corps : SA couleur, SA transparence
        j.f._mesh.material=applyBodyStyle(FreshMat(col),j.f.body);scene.add(j.f._mesh);
        bodies.push({id:j.f.id,name:j.f.name,mesh:j.f._mesh,color:col,visible:true,kind:'import',ref:j.f.id,bodyId:j.f.body||null});ci++;
        return;
      }
      const isCut=(j.f.op||'add')==='cut';
      j.geos.forEach((g,k)=>{
        const col=isCut?0xff453a:bodyColorOf(j.f.body);
        const mat=new THREE.MeshStandardMaterial({color:col,metalness:.35,roughness:.4,clippingPlanes:clipPlane?[clipPlane]:null,transparent:isCut,opacity:isCut?0.45:1});
        if(!isCut)applyBodyStyle(mat,j.f.body); // découpe : rouge translucide de fantôme, sémantique forcée
        const mesh=new THREE.Mesh(g,mat);
        mesh.userData.bid=j.f.id;
        scene.add(mesh);
        bodies.push({id:j.f.id+(j.geos.length>1?'#'+k:''),name:j.geos.length>1?`${j.f.name}[${k+1}]`:j.f.name,mesh,color:col,visible:true,kind:isCut?'ghost':'extrude',ref:j.f.id,bodyId:j.f.body||null,op:j.f.op||'add',ghost:isCut});
        ci++;
      });
    });
  }
  phAdd('maillage',performance.now()-_tm);
  refreshParts();renderTree();autosave();applyClip();
  occStatus();
  if(filWarn.length)faceEl.textContent+=(faceEl.textContent?'\n':'')+filWarn.slice(0,4).join('\n');
  if(filMode)buildFilletOverlay();
else if(filModeX){if(occLive&&occLive.shape){try{filEdgesReload();}catch(e){}}buildExactOverlay();}
  buildEdgeOverlay();refreshMirror();
  commitPrev();builtEngine='mesh';buildDone();projRefreshRerun(projPass);
  }catch(err){
    try{rollbackPrev(String((err&&err.message)||err));}catch(e2){faceEl.textContent+='\n[Rebuild] échec critique.';
      try{refreshParts();renderTree();applyClip();occStatus();}catch(e3){}}
    return;
  }
}
function FreshMat(c){return new THREE.MeshStandardMaterial({color:c,metalness:.35,roughness:.4,clippingPlanes:clipPlane?[clipPlane]:null});}
function skStrong3D(){try{return document.body.getAttribute('data-theme')==='clair'?0x2a2d33:0xffffff;}catch(e){return 0xffffff;}}
function drawSketchHelpers(){
  (doc.sketches||[]).forEach(sk=>{
    if(sk.visible===false)return;
    const P=sk.points||{};if(!P)return;
    const{u,v,n,o}=sketchBasis(sk);
    const grp=new THREE.Group();grp.name='sk_'+sk.id;
    // V0.2.2 : traits forts de l'esquisse en BLANC dans la vue 3D (gris foncé en thème Clair)
    const mat=new THREE.LineBasicMaterial({color:skStrong3D()});mat.userData.skStrong=true;
    // 2026-10-16-004 : CONSTRUCTION en pointillés (comme dans l'esquisse) ; axe de rotation
    // en tireté long orange. Tiret proportionné à l'esquisse (lisible petite ou grande pièce).
    let ext=0;Object.values(P).forEach(q=>{if(q)ext=Math.max(ext,Math.abs(q.x),Math.abs(q.y));});
    const dsh=Math.max(0.4,Math.min(6,ext/40));
    const matC=new THREE.LineDashedMaterial({color:0xffd60a,dashSize:dsh,gapSize:dsh*0.8,transparent:true,opacity:0.8});
    const matAx=new THREE.LineDashedMaterial({color:0xff9f0a,dashSize:dsh*3,gapSize:dsh*0.9});
    const mk=(pts,e)=>{const m=(e&&e.axis)?matAx:((e&&e.construction)?matC:mat);const L=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),m);if(m!==mat)L.computeLineDistances();return L;};
    const to3=(x,y)=>new THREE.Vector3().copy(o).addScaledVector(u,x).addScaledVector(v,y);
    (sk.entities||[]).forEach(e=>{
      if(e.t==='line'){const A=P[e.p1],B=P[e.p2];if(!A||!B)return;
        grp.add(mk([to3(A.x,A.y),to3(B.x,B.y)],e));}
      if(e.t==='circle'){const C=P[e.pc];if(!C||!(e.r>0))return;const pts=[];for(let i=0;i<=48;i++){const a=i/48*Math.PI*2;pts.push(to3(C.x+Math.cos(a)*e.r,C.y+Math.sin(a)*e.r));}grp.add(mk(pts,e));}
      if(e.t==='arc'){const C=P[e.pc];if(!C||!(e.r>0))return;const an=arcAngles(sk,e);if(!an)return;const pts=[];const d=an.a2-an.a1;const n2=Math.max(2,Math.ceil(d/(Math.PI*2)*48));for(let i=0;i<=n2;i++){const a=an.a1+d*i/n2;pts.push(to3(C.x+Math.cos(a)*e.r,C.y+Math.sin(a)*e.r));}grp.add(mk(pts,e));}
    });
    scene.add(grp);
  });
}

