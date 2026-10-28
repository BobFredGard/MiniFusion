/* ---------- coque / shell (évidage paroi mince) ----------
   But : transformer un volume plein en bac/boîtier — on choisit les FACES À RETIRER
   (les ouvertures, ex. le dessus) et une ÉPAISSEUR de paroi ; le noyau évide
   l'intérieur via BRepOffsetAPI_MakeThickSolid (occApplyCoque / occCoqueOnce,
   dans 20-noyau-et-operations-solides.js).

   Chaque face est mémorisée par sa RÉFÉRENCE DURABLE (centre + normale +
   dimensions, occFaceRef) et non par son numéro — même approche que le
   dépouillage (xdraft, 86) et le déplacement d'une face (xmove, 85).

   V0.15.4 : le même mode ÉDITE une « Suppression de face » (xdelface, drapeau `del`) —
   clic = ajouter / re-clic = retirer, plusieurs faces, Enregistrer / Échap. Faces
   mémorisées par référence GÉNÉRIQUE (occFaceRefAny : tores, surfaces libres compris),
   pas d'épaisseur ni d'aperçu (un rejeu de suppression complet à chaque clic serait
   trop lent sur une grosse pièce : la surbrillance rouge suffit). */
let coqueMode=null; // null | {faces:[ref], thick, editing:id|null, del?:true}
let coqueGroup=null; // surbrillance 3D (faces à retirer en rouge)
let coquePrevBody=null; // aperçu translucide du solide évidé (non validé)
function coqueCleanRef(r){
  // Copie validée d'une référence de face mémorisée (édition) : pos/n/dim complets ou
  // rien. Un `dim` manquant fait lever occFindFace au lieu de dégrader, et une exception
  // ici faisait avorter toute l'entrée en mode (état à moitié initialisé, aucun retour
  // visuel) — même cause, même remède que la dépouille (86).
  if(coqueMode&&coqueMode.del){ // suppression de face : référence générique (n facultative)
    if(!(r&&Array.isArray(r.pos)&&r.pos.length>=3&&Array.isArray(r.dim)&&r.dim.length>=3))return null;
    const o=JSON.parse(JSON.stringify(r));o._ord=-1;delete o._bid;
    return o;
  }
  if(!(r&&Array.isArray(r.pos)&&r.pos.length>=3&&Array.isArray(r.n)&&r.n.length>=3&&Array.isArray(r.dim)&&r.dim.length>=3))return null;
  const o={pos:r.pos.slice(),n:r.n.slice(),dim:r.dim.slice(),_ord:-1};
  if(typeof r._bid==='string')o._bid=r._bid;
  return o;
}

// Le bouton est créé ICI, dans les sources : la coque HTML est générée, jamais
// éditée à la main. Idempotent. Le regroupement par type (96-bandeau-groupes.js)
// le range ensuite dans « Modifier le solide / Faces ».
(function(){
  if(document.getElementById('btnCoque'))return;
  const after=document.getElementById('btnDraft')||document.getElementById('btnMoveFace')||document.getElementById('btnExtrude');
  if(!after||!after.parentNode)return;
  const b=document.createElement('button');
  b.id='btnCoque';
  b.textContent='⚙ Coque';
  b.title='Évider le solide (paroi mince) : retirez des faces, gardez une épaisseur.';
  after.parentNode.insertBefore(b,after.nextSibling);
})();

function coqueKey(r){
  return (r.pos||[]).map(v=>(+v).toFixed(2)).join(',')+'|'+(r.n?r.n.map(v=>(+v).toFixed(3)).join(','):(r.st||''));
}
function coqueRefOf(face){
  // Référence d'une face : générique pour la suppression de face (toute surface).
  return (coqueMode&&coqueMode.del)?occFaceRefAny(face):occFaceRef(face);
}
/* ---------- surbrillance 3D (faces à retirer) ---------- */
function coqueClearHl(){
  if(!coqueGroup)return;
  coqueGroup.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});
  scene.remove(coqueGroup);coqueGroup=null;
}
function coquePaint(){
  coqueClearHl();
  if(!coqueMode||!(coqueMode.faces||[]).length)return;
  // Multi-corps : la surbrillance se peint sur chaque solide visible (ordinaux par
  // solide — une face ne se peint que sur son corps, `_bid`, ou partout si ancien
  // document sans `_bid`).
  const targets=bodies.filter(x=>x.kind==='body'&&x.visible!==false&&x.mesh&&x.mesh.visible!==false&&x.mesh.geometry);
  if(!targets.length)return;
  const pos=[],col=[],c=new THREE.Color();
  c.setHex(0xff453a);
  targets.forEach(b=>{
    const groups=(b.mesh.geometry.userData.occGroups)||[];
    if(!groups.length)return;
    const want=(coqueMode.faces||[]).filter(r=>r._ord!=null&&(r._bid==null||r._bid===b.id)).map(r=>r._ord);
    const kept=want.filter(o=>groups.some(g=>g.f===o));
    if(!kept.length)return;
    const a=b.mesh.geometry.attributes.position.array;
    kept.forEach(o=>{
      groups.forEach(gr=>{
        if(gr.f!==o)return;
        for(let t=gr.start;t<gr.start+gr.count;t++){
          // occGroups compte des TRIANGLES (géométrie non indexée) : 3 sommets = 9 flottants
          const i9=t*9;
          for(let k=0;k<9;k++)pos.push(a[i9+k]);
          col.push(c.r,c.g,c.b,c.r,c.g,c.b,c.r,c.g,c.b);
        }
      });
    });
  });
  if(!pos.length)return;
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.55,depthTest:false,side:THREE.DoubleSide}));
  m.raycast=()=>{};m.renderOrder=1002;
  coqueGroup=new THREE.Group();coqueGroup.name='coqueFaces';coqueGroup.add(m);
  scene.add(coqueGroup);
}
function coqueFaceUnder(e){
  // Face exacte sous le curseur (même chemin que dépouillage/déplacement —
  // résolu sur le SOLIDE DU CORPS cliqué, multi-corps).
  if(!occHas()||!occLive||!occLive.shape)return null;
  try{
    const h=pick(e);
    if(!h||!h.object||!h.object.geometry)return null;
    const hit=occFaceOfHit(h.object,h.faceIndex);
    if(!hit||!hit.face)return null;
    const ref=coqueRefOf(hit.face);
    try{hit.face.delete();}catch(e){}
    if(!ref)return null;
    ref._bid=hit.bd.id;
    // `_ord`/`_bid` = session (surbrillance seule), jamais persistés tels quels.
    return{ref:ref,ord:hit.ord};
  }catch(e){return null;}
}
let coqueOrdIdx=null; // le temps d'un marquage : solide → Map(clé de face → rang)
function coqueOrdOf(ref){
  // Multi-corps : on cherche sur TOUS les solides affichés, on mémorise le corps.
  // V0.15.7 : UN parcours des faces par solide (index clé → rang), partagé par toutes les
  // faces d'un marquage. Avant : occFaceAt(rang) reparcourait le solide depuis le début
  // pour CHAQUE face candidate, et pour chaque face mémorisée — O(faces²) par face, des
  // secondes à l'entrée en édition d'une sélection nombreuse sur une grosse pièce.
  const k=coqueKey(ref);
  for(const b of bodies){
    if(b.kind!=='body'||!b.mesh||!b.shape)continue;
    let idx=coqueOrdIdx&&coqueOrdIdx.get(b.shape);
    if(!idx){
      idx=new Map();
      const want=new Set(((b.mesh.geometry.userData.occGroups)||[]).map(g=>g.f));
      const ex=new occt.TopExp_Explorer_2(b.shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);
      let o=0;
      while(ex.More()){
        if(want.has(o)){
          let cur=null;
          try{cur=coqueRefOf(occt.TopoDS.Face_1(ex.Current()));}catch(e){}
          if(cur){const kk=coqueKey(cur);if(!idx.has(kk))idx.set(kk,o);} // 1ʳᵉ face de même clé, comme avant
        }
        o++;ex.Next();
      }
      try{ex.delete();}catch(e){}
      if(coqueOrdIdx)coqueOrdIdx.set(b.shape,idx);
    }
    const o=idx.get(k);
    if(o!==undefined){ref._bid=b.id;return o;}
  }
  return -1;
}
function coqueMarkByPosition(){
  // Re-fait correspondre chaque face mémorisée au solide courant, UNE PAR UNE : une face
  // illisible ne doit pas empêcher les autres d'être retrouvées — sinon, en édition,
  // une seule face problématique effaçait toute la surbrillance. Retourne le bilan.
  const st={ok:0,ko:0};
  if(!coqueMode||!occLive||!occLive.shape)return st;
  coqueOrdIdx=new Map();
  try{
    (coqueMode.faces||[]).forEach(r=>{
      try{r._ord=coqueOrdOf(r);}catch(e){r._ord=-1;}
      if(r._ord>=0)st.ok++;else st.ko++;
    });
  }finally{coqueOrdIdx=null;}
  return st;
}
/* ---------- aperçu vert translucide du solide évidé AVANT validation ----------
   Même pattern que les aperçus dépouille (bleu) et congé (rouge) : on rejoue l'évidage
   sur une copie du solide courant, on affiche le résultat en vert translucide et la
   pièce réelle s'estompe — on VOIT l'ouverture et la paroi avant d'appliquer.
   Noms de sauvegarde `_c*` distincts de `_d*`/`_x*` pour que les aperçus ne se
   marchent jamais dessus (les modes s'excluent déjà, ceinture + bretelles). */
function coquePreviewRemove(){
  if(coquePrevBody){
    if(coquePrevBody.mesh){try{scene.remove(coquePrevBody.mesh);coquePrevBody.mesh.geometry.dispose();}catch(e){}}
    bodies=bodies.filter(b=>b!==coquePrevBody);
    coquePrevBody=null;
  }
  bodies.forEach(b=>{
    if(b._cSaved==null||!b.mesh||!b.mesh.material)return;
    b.mesh.material.opacity=b._cSaved;b.mesh.material.transparent=b._cTrans;
    if(b._cDW!==undefined)b.mesh.material.depthWrite=b._cDW;
    delete b._cSaved;delete b._cTrans;delete b._cDW;
  });
  try{refreshParts();}catch(e){}
}
function coquePreviewUpdate(){
  try{
    if(!coqueMode||coqueMode.del){coquePreviewRemove();return;}
    const faces=coqueMode.faces||[];
    const t=+coqueMode.thick||0;
    if(!faces.length||!(t>0)||!occLive||!occLive.shape){coquePreviewRemove();return;}
    // rien à recalculer si la sélection et l'épaisseur n'ont pas bougé
    const sig=faces.map(coqueKey).join(';')+'|'+t;
    if(coqueMode._prevSig===sig)return;
    coqueMode._prevSig=sig;
    const got=[];
    faces.forEach(r=>{try{const h=occFindFace(occLive.shape,r);if(h)got.push({fr:r,h:h});}catch(e){}});
    if(!got.length){coquePreviewRemove();return;}
    let r=null;
    // Chaîne de recettes + validation (même cœur que le rejeu) : l'aperçu vert
    // doit montrer le VRAI évidage, pas le junk « IsDone=true » des dépouilles.
    try{r=occCoqueRecettes(occLive.shape,got,t);}
    finally{got.forEach(g=>{try{g.h.delete();}catch(e){}});}
    if(!r||!r.shape){coquePreviewRemove();return;}
    const sh=r.shape;
    let g=null;
    try{g=occTessellate(sh,0.5);}catch(e){g=null;}
    try{sh.delete();}catch(e){}
    if(!g){coquePreviewRemove();return;}
    coquePreviewRemove();
    bodies.forEach(b=>{
      if(b.ghost||!b.mesh||!b.mesh.material)return;
      b._cSaved=b.mesh.material.opacity;b._cTrans=b.mesh.material.transparent;
      b.mesh.material.opacity=0.28;b.mesh.material.transparent=true;
      b._cDW=b.mesh.material.depthWrite;b.mesh.material.depthWrite=false;
    });
    const mat=new THREE.MeshStandardMaterial({color:0x30d158,transparent:true,opacity:0.45,depthWrite:false,side:THREE.DoubleSide,roughness:0.4,metalness:0.05});
    const mesh=new THREE.Mesh(g,mat);mesh.name='coquePreview';
    mesh.renderOrder=1000;
    mesh.userData.bid='coque_preview';mesh.raycast=()=>{};
    scene.add(mesh);
    coquePrevBody={id:'coque_preview',name:'🟢 Aperçu coque (non validé)',mesh,color:0x30d158,visible:true,kind:'ghost',ref:null,ghost:true,preview:true};
    bodies.push(coquePrevBody);
    try{refreshParts();}catch(e){}
  }catch(e){coquePreviewRemove();}
}
function enterCoqueMode(editF){
  if(skEdit)return;
  const editing=(editF&&(editF.type==='xshell'||editF.type==='xdelface'))?editF:null;
  const del=!!(editing&&editing.type==='xdelface');
  if(coqueMode){if(editing&&coqueMode.editing===editing.id)return;exitCoqueMode(true);}
  if(!occLive||!occLive.shape){
    if(!occHas()){faceEl.textContent='Coque : solide exact indisponible (OCCT non chargé ou aucun volume).';return;}
    faceEl.textContent='Coque : recalcul du solide…';
    if(!occExactForTool()){faceEl.textContent='Coque : recalcul impossible.';return;} // STEP seul compris
  }
  if(filMode)exitFilletMode(true);
  if(filModeX)exitExactFilletMode(true);
  if(mvMode)exitMoveFaceMode(true);
  if(draftMode)exitDraftMode(true);
  coqueMode={faces:[],thick:2,editing:editing?editing.id:null};
  if(del)coqueMode.del=true;
  if(editing){
    // Édition : rejeu SANS la fonction (occSkipFeat) → les faces d'origine
    // redeviennent cliquables. Même stratégie que congé/dépouillage.
    // Chargement VALIDÉ (coqueCleanRef) : une référence malformée est écartée et
    // comptée au lieu de faire avorter toute l'entrée en mode.
    const avant=(editing.faces||[]).length;
    coqueMode.faces=(editing.faces||[]).map(coqueCleanRef).filter(Boolean);
    coqueMode._ecartees=avant-coqueMode.faces.length;
    if(!del){coqueMode.thick=(+editing.thick>0)?+editing.thick:2;parFxFrom(editing,coqueMode,['thick']);}
    occSkipFeat=editing.id;
    tlEditLock(editing); // arbre bloqué sur la coque : seules les opérations précédentes rejouées
    if(!occExactForTool(true)){occSkipFeat=null;coqueMode=null;tlEditUnlock();faceEl.textContent=(del?'Suppression de face':'Coque')+' : recalcul impossible.';return;} // rejeu sans la fonction (un STEP resté seul compris)
    coqueMode._stats=coqueMarkByPosition();
  }
  coquePaint();coquePreviewUpdate();renderCoquePanel();
  if(del){
    faceEl.innerHTML='<b>⌫ Édition « '+editing.name+' »</b><br><span class="note">Cliquez d\'autres faces à '+
      'supprimer (re-clic = retirer), puis <b>Enregistrer</b> (<b>Entrée</b>). <b>Échap</b> annule.</span>';
    return;
  }
  faceEl.innerHTML=editing
    ?'<b>⚙ Édition « '+shellName(editing)+' »</b><br><span class="note">Re-cliquez les faces à '+
     'retirer pour en ajouter ou en retirer, ajustez l\'épaisseur, puis <b>Enregistrer</b>. <b>Échap</b> annule.</span>'
    :'<b>⚙ Coque (évidage)</b><br><span class="note">Cliquez les <b>faces à retirer</b> '+
     '(les ouvertures — re-clic = retirer), saisissez l\'<b>épaisseur</b> de paroi puis <b>Appliquer</b> '+
     '(<b>Entrée</b>). <b>Échap</b> annule.</span>';
}
function exitCoqueMode(silent){
  if(!coqueMode)return;
  const wasEditing=!!coqueMode.editing;
  coqueMode=null;coqueClearHl();coquePreviewRemove();
  if(wasEditing){occSkipFeat=null;tlEditUnlock();markDirty();try{rebuild();}catch(e){}}
  occStepForceEnd();
  if(!silent)renderProps();
}
function coqueToggle(e){
  if(!coqueMode)return;
  const hit=coqueFaceUnder(e);
  if(!hit){faceEl.textContent=(coqueMode.del?'Suppression de face':'Coque')+' : cliquez une face du solide exact.';return;}
  hit.ref._ord=hit.ord;
  const k=coqueKey(hit.ref);
  const i=coqueMode.faces.findIndex(r=>coqueKey(r)===k);
  if(i>=0){coqueMode.faces.splice(i,1);}
  else coqueMode.faces.push(hit.ref);
  // _ord des nouvelles venues : position connue (clic), pas besoin de re-match global.
  // L'aperçu se recalcule (signature : sélection + épaisseur).
  coquePaint();coquePreviewUpdate();renderCoquePanel();
  const nf=coqueMode.faces.length;
  if(coqueMode.del){faceEl.textContent=nf?`${nf} face(s) à supprimer — Enregistrer (Entrée) ou Échap.`:'Aucune face retenue : cliquez les faces à supprimer, ou Échap pour annuler.';return;}
  faceEl.textContent=nf?`${nf} face(s) à retirer retenue(s) — saisissez l'épaisseur puis Appliquer.`
    :'Aucune face retenue : cliquez les faces à retirer (les ouvertures), ou Échap pour annuler.';
}
function coqueHover(e){
  if(!coqueMode)return;
  renderer.domElement.style.cursor='pointer';
}
/* ---------- panneau ---------- */
function renderCoquePanel(){
  const p=document.getElementById('props');if(!p)return;
  p.innerHTML='';if(!coqueMode)return;
  const ed=coqueMode.editing;
  const h=document.createElement('div');h.className='pnl-h';
  const del=!!coqueMode.del;
  h.innerHTML=del?'⌫ Édition de la suppression de face':ed?'⚙ Édition de la coque':'⚙ Coque (évidage paroi mince)';
  p.appendChild(h);
  const nf=(coqueMode.faces||[]).length;
  if(nf){
    const st=coqueMode._stats;
    if(st&&st.ko>0){
      const n=document.createElement('span');n.className='note';
      n.textContent=`⚠ ${st.ok}/${st.ok+st.ko} face(s) retrouvée(s) sur le solide actuel — les ⚠ ci-dessous n'y sont plus, re-cliquez-les.`;
      p.appendChild(n);
    }
    const lst=document.createElement('div');lst.className='lst';
    coqueMode.faces.forEach((fr,i)=>{
      const r2=document.createElement('div');r2.className='item';
      const s=document.createElement('span');
      s.textContent=(fr._ord>=0?'✅ ':'⚠ ')+'▸ centre ('+fr.pos.map(v=>(+v).toFixed(1)).join(' ; ')+') mm — '+(del?'sera supprimée':'sera retirée (ouverture)');
      r2.appendChild(s);
      const x=document.createElement('button');x.textContent='✕';x.title='Retirer cette face';
      x.onclick=()=>{coqueMode.faces.splice(i,1);coquePaint();coquePreviewUpdate();renderCoquePanel();};
      r2.appendChild(x);lst.appendChild(r2);
    });
    p.appendChild(lst);
  }else{
    const n=document.createElement('span');n.className='note';
    n.textContent=del?'Cliquez les faces à supprimer dans la vue 3D.':'Cliquez les faces à retirer dans la vue 3D : ce sont les ouvertures du bac/boîtier.';
    p.appendChild(n);
  }
  if(coqueMode._ecartees>0){
    const n=document.createElement('span');n.className='note';
    n.textContent='⚠ '+coqueMode._ecartees+' face(s) mémorisée(s) illisible(s) écartée(s) au chargement.';
    p.appendChild(n);
  }
  if(del){
    const b2=document.createElement('div');b2.className='pnl-btns';b2.style.marginTop='8px';
    const ok2=document.createElement('button');ok2.className='primary';ok2.textContent='✔ Enregistrer';ok2.onclick=coqueApply;b2.appendChild(ok2);
    const q2=document.createElement('button');q2.textContent='✖ Annuler';q2.onclick=()=>exitCoqueMode();b2.appendChild(q2);
    p.appendChild(b2);
    const n3=document.createElement('span');n3.className='note';
    n3.textContent='Les faces voisines sont prolongées jusqu\'à se rejoindre. Si elles partent hors de la pièce, ajoutez aussi ces voisines à la suppression.';
    p.appendChild(n3);
    return;
  }
  // Épaisseur : > 0, et inférieure à la plus petite dimension utile (le moteur refuse sinon).
  const row=document.createElement('div');row.className='pnl-row';row.style.marginTop='8px';
  const lab=document.createElement('label');lab.textContent='Paroi (mm)';row.appendChild(lab);
  const inp=document.createElement('input');inp.type='text';inp.inputMode='decimal';
  inp.id='coqueThickIn';inp.value=String(coqueMode.thick).replace('.',',');
  parFx(inp,coqueMode,'thick');
  inp.onchange=()=>{
    const v=parseFloat(String(inp.value).replace(',','.').replace(/\s/g,''));
    if(!isFinite(v)||v<=0){
      inp.value=String(coqueMode.thick).replace('.',',');
      faceEl.textContent='Épaisseur invalide : strictement positive (ex. 2).';
      coquePreviewRemove();
      return;
    }
    coqueMode.thick=v;inp.value=String(v).replace('.',',');
    coquePreviewUpdate();
  };
  row.appendChild(inp);p.appendChild(row);
  const btns=document.createElement('div');btns.className='pnl-btns';btns.style.marginTop='8px';
  const ok=document.createElement('button');ok.className='primary';
  ok.textContent=ed?'✔ Enregistrer':'✔ Appliquer';ok.onclick=coqueApply;btns.appendChild(ok);
  const q=document.createElement('button');q.textContent=ed?'✖ Annuler':'Quitter';q.onclick=()=>exitCoqueMode();
  btns.appendChild(q);p.appendChild(btns);
  const n2=document.createElement('span');n2.className='note';
  n2.textContent='L\'intérieur est creusé de cette épaisseur sous chaque face conservée. '+
    'Une paroi plus épaisse que la plus petite dimension de la pièce est refusée par le moteur.';
  p.appendChild(n2);
}
function coqueApply(){
  if(!coqueMode)return;
  if(coqueMode.del){delFaceApply();return;}
  if(!(coqueMode.faces||[]).length){faceEl.textContent='Coque : retenez au moins une face à retirer (l\'ouverture).';return;}
  const t=+coqueMode.thick||0;
  if(!(t>0)){faceEl.textContent='Coque : épaisseur hors bornes (> 0).';return;}
  // On retire `_ord` (index BRep de la session) : surbrillance seule, rien pour le rejeu.
  const clean=r=>{const o={pos:r.pos.slice(),dim:r.dim.slice(),n:r.n.slice()};if(typeof r._bid==='string')o._bid=r._bid;return o;};
  const faces=coqueMode.faces.map(clean);
  if(coqueMode.editing){
    // Édition EN PLACE (une seule fonction, comme congé/dépouillage).
    const f=doc.features.find(x=>x.id===coqueMode.editing&&x.type==='xshell');
    if(f){
      docPushUndo('édition de « '+shellName(f)+' »');
      f.faces=faces;f.thick=t;parFxCopy(coqueMode,f,['thick']);f.name=shellName(f);
      repSyncForFeature(f); // les instances de la répétition suivent la nouvelle épaisseur
      sel={kind:'feature',id:f.id};
    }
    exitCoqueMode(true);
    markDirty();rebuild();renderTree();renderProps();
    faceEl.textContent='Coque mise à jour : '+shellName(f)+'.';
    return;
  }
  const nf={id:uid('sh'),type:'xshell',name:shellName({thick:t,faces:faces}),faces,thick:t,visible:true};
  parFxCopy(coqueMode,nf,['thick']);
  addFeature(nf); // instantané d'annulation + insertion au marqueur temps
  sel={kind:'feature',id:nf.id};
  exitCoqueMode(true);
  markDirty();rebuild();renderTree();renderProps();
  faceEl.textContent='Coque créée : '+nf.name+'. Épaisseur modifiable dans ses propriétés, ou re-sélectionnez les faces.';
}
function delFaceApply(){
  // Édition EN PLACE d'une « Suppression de face » : nouvelles faces, même fonction.
  if(!(coqueMode.faces||[]).length){faceEl.textContent='Suppression de face : retenez au moins une face (ou supprimez la fonction dans l\'arbre).';return;}
  const f=doc.features.find(x=>x.id===coqueMode.editing&&x.type==='xdelface');
  const faces=coqueMode.faces.map(r=>{const o=JSON.parse(JSON.stringify(r));delete o._ord;delete o._bid;return o;});
  if(f){
    docPushUndo('édition de « '+f.name+' »');
    f.faces=faces;f.name=delFaceName(faces.length);delete f._m;delete f._err;
    repSyncForFeature(f);
    sel={kind:'feature',id:f.id};
  }
  exitCoqueMode(true);
  markDirty();rebuild();renderTree();renderProps();
  const bad=f&&(f._err||(f._m&&f._m.m<f._m.t));
  faceEl.textContent=f?(bad?'Suppression de face : le noyau n\'a pas pu refermer le solide — voir ⚠ dans l\'arbre (Ctrl+Z pour annuler).':f.name+' : mise à jour enregistrée.'):'Suppression de face : fonction introuvable.';
}
