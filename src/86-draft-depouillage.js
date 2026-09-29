/* ---------- dépouillage / draft (angle de démoulage) ----------
   But : rendre une pièce « démontable » d'un moule. On choisit une FACE DE RÉFÉRENCE
   (le plan neutre, qui reste fixe) et un lot de faces à décaler ; ces faces sont
   pivotées d'un ANGLE autour de leur ligne d'intersection avec le plan neutre.

   En pratique : on clique la face de référence, puis les faces à dépouiller, puis on
   saisit l'angle et on applique. OCCT fait le reste via BRepOffsetAPI_DraftAngle
   (occApplyDraft / occDraftOnce, dans 20-noyau-et-operations-solides.js).

   Chaque face est mémorisée par sa RÉFÉRENCE DURABLE (centre + normale + dimensions,
   occFaceRef) et non par son numéro : celui-ci change dès qu'une autre opération ajoute
   une face, et le rejeu ne retrouverait plus rien. Même approche que le déplacement
   d'une face (xmove, 85). */
let draftMode=null; // null | {phase:'ref'|'faces', ref:ref|null, faces:[ref], angle, editing:id|null}
let draftGroup=null; // surbrillance 3D (référence verte, faces retenues ambre)

// Le bouton est créé ICI, dans les sources, comme « Déplacer une face » : la coque HTML
// est générée, jamais éditée à la main. Idempotent. Le regroupement par type
// (96-bandeau-groupes.js) le range ensuite dans « Modifier le solide / Faces ».
(function(){
  if(document.getElementById('btnDraft'))return;
  const after=document.getElementById('btnMoveFace')||document.getElementById('btnExtrude');
  if(!after||!after.parentNode)return;
  const b=document.createElement('button');
  b.id='btnDraft';
  b.textContent='\u{1F6E1} Dépouillage';
  b.title='Dépouiller des faces autour d\'un plan de référence (angle de démoulage)';
  after.parentNode.insertBefore(b,after.nextSibling);
})();

function draftName(f){
  const a=+f.angle||0;
  const d=String(Math.round(a*100)/100).replace('.',',');
  return `Dépouillage ${d}° · ${(f.faces||[]).length} face(s)`;
}
function draftKey(r){
  return (r.pos||[]).map(v=>(+v).toFixed(2)).join(',')+'|'+(r.n||[]).map(v=>(+v).toFixed(3)).join(',');
}
/* ---------- surbrillance 3D ----------
   On repeint les triangles à la main : le maillage exact porte dans
   geometry.userData.occGroups l'association triangle → index de face BRep, ce qui évite
   de reconstruire un maillage par face retenue. */
function draftClearHl(){
  if(!draftGroup)return;
  draftGroup.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});
  scene.remove(draftGroup);draftGroup=null;
}
function draftPaint(){
  draftClearHl();
  if(!draftMode||!draftMode.ref)return;
  const b=bodies.find(x=>x.id==='occ_result');
  const src=b&&b.mesh?b.mesh.geometry:null;
  const groups=(src&&src.userData.occGroups)||[];
  if(!groups.length)return;
  // Index BRep → couleur : référence en vert, faces retenues en ambre. Le reste est
  // laissé tel quel (on ne repeint que ce qui change).
  const colOf={};
  colOf[draftMode.ref._ord]=0x30d158;
  (draftMode.faces||[]).forEach(r=>{colOf[r._ord]=0xff9f0a;});
  const kept=Object.keys(colOf).map(Number).filter(o=>groups.some(g=>g.f===o));
  if(!kept.length)return;
  const g=new THREE.BufferGeometry();
  const pos=[],col=[],a=src.attributes.position.array,c=new THREE.Color();
  kept.forEach(o=>{
    c.setHex(colOf[o]);
    groups.forEach(gr=>{
      if(gr.f!==o)return;
      for(let t=gr.start;t<gr.start+gr.count;t++){
        const i3=t*3;
        pos.push(a[i3],a[i3+1],a[i3+2]);
        col.push(c.r,c.g,c.b);
      }
    });
  });
  if(!pos.length)return;
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.55,depthTest:false,side:THREE.DoubleSide}));
  m.raycast=()=>{};m.renderOrder=996;
  draftGroup=new THREE.Group();draftGroup.name='draftFaces';draftGroup.add(m);
  scene.add(draftGroup);
}
function draftFaceUnder(e){
  // Face exacte sous le curseur (même chemin que le déplacement d'une face, 85).
  if(!occHas()||!occLive||!occLive.shape)return null;
  try{
    const h=pick(e);
    if(!h||!h.object||!h.object.geometry)return null;
    if(h.object.userData.bid!=='occ_result')return null;
    if(h.faceIndex===undefined||h.faceIndex===null)return null;
    const groups=h.object.geometry.userData.occGroups||[];
    const g=groups.find(g=>h.faceIndex>=g.start&&h.faceIndex<g.start+g.count);
    if(!g)return null;
    const f=occFaceAt(occLive.shape,g.f);
    if(!f)return null;
    const ref=occFaceRef(f);
    if(!ref)return null;
    // `_ord` n'est PAS stockée dans le document : c'est l'index BRep de la session, utile
    // uniquement pour repeindre la surbrillance. occFaceRef reste pur (pos/dim/n).
    return{ref:ref,ord:g.f};
  }catch(e){return null;}
}
// Retrouve l'index BRep d'une face mémorisée, en la re-faisant correspondre par
// position + normale sur le solide courant. C'est ce qui permet de repeindre la
// surbrillance APRÈS un rejeu : les index BRep ont bougé, la position est notre seule
// référence stable (c'est aussi celle que le rejeu utilise, via occFindFace).
function draftOrdOf(ref){
  const b=bodies.find(x=>x.id==='occ_result');
  const groups=(b&&b.mesh&&b.mesh.geometry.userData.occGroups)||[];
  const k=draftKey(ref);
  for(const g of groups){
    const f=occFaceAt(occLive.shape,g.f);
    if(!f)continue;
    const cur=occFaceRef(f);
    if(cur&&draftKey(cur)===k)return g.f;
  }
  return -1;
}
function draftMarkByPosition(){
  if(!draftMode||!occLive||!occLive.shape)return;
  if(draftMode.ref)draftMode.ref._ord=draftOrdOf(draftMode.ref);
  (draftMode.faces||[]).forEach(r=>{r._ord=draftOrdOf(r);});
}
function enterDraftMode(editF){
  if(skEdit)return;
  const editing=(editF&&editF.type==='xdraft')?editF:null;
  if(draftMode){if(editing&&draftMode.editing===editing.id)return;exitDraftMode(true);}
  if(!occLive||!occLive.shape){
    if(!occHas()){faceEl.textContent='Dépouillage : solide exact indisponible (OCCT non chargé ou aucun volume).';return;}
    faceEl.textContent='Dépouillage : recalcul du solide…';
    try{rebuild();}catch(e){}
    if(!occLive||!occLive.shape){faceEl.textContent='Dépouillage : recalcul impossible.';return;}
  }
  if(filMode)exitFilletMode(true);
  if(filModeX)exitExactFilletMode(true);
  if(mvMode)exitMoveFaceMode(true);
  draftMode={phase:'ref',ref:null,faces:[],angle:5,editing:editing?editing.id:null};
  if(editing){
    // Édition : rejeu SANS la fonction (occSkipFeat) → les faces à dépouiller redeviennent
    // celles d'origine, cliquables. Exactement la stratégie de l'édition d'un congé exact.
    draftMode.ref=editing.ref?{pos:editing.ref.pos.slice(),n:editing.ref.n.slice(),dim:editing.ref.dim.slice(),_ord:-1}:null;
    draftMode.faces=(editing.faces||[]).map(r=>({pos:r.pos.slice(),n:r.n.slice(),dim:r.dim.slice(),_ord:-1}));
    draftMode.phase=draftMode.ref?'faces':'ref';
    draftMode.angle=+editing.angle||5;
    occSkipFeat=editing.id;
    try{rebuild();}catch(e){}
    if(!occLive||!occLive.shape){occSkipFeat=null;draftMode=null;faceEl.textContent='Dépouillage : recalcul impossible.';return;}
    draftMarkByPosition(); // le solide vient d'être reconstruit : les index ont bougé
  }
  draftPaint();renderDraftPanel();
  faceEl.innerHTML=editing
    ?'<b>📐 Édition « '+draftName(editing)+' »</b><br><span class="note">Re-cliquez les faces à '+
     'dépouiller pour en ajouter ou en retirer, puis <b>Enregistrer</b>. <b>Échap</b> annule.</span>'
    :'<b>📐 Dépouillage</b><br><span class="note"><b>1)</b> cliquez la <b>face de référence</b> (le plan '+
     'neutre, qui reste fixe). <b>2)</b> Puis les <b>faces à dépouiller</b> (re-clic = retirer). '+
     '<b>3)</b> Saisissez l\'angle puis <b>Appliquer</b> (<b>Entrée</b>). <b>Échap</b> annule.</span>';
}
function exitDraftMode(silent){
  if(!draftMode)return;
  const wasEditing=!!draftMode.editing;
  draftMode=null;draftClearHl();
  if(wasEditing){occSkipFeat=null;markDirty();try{rebuild();}catch(e){}}
  if(!silent)renderProps();
}
function draftToggle(e){
  if(!draftMode)return;
  const hit=draftFaceUnder(e);
  if(!hit){faceEl.textContent='Dépouillage : cliquez une face du solide exact.';return;}
  hit.ref._ord=hit.ord;
  if(draftMode.phase==='ref'){
    draftMode.ref=hit.ref;draftMode.phase='faces';
    draftPaint();renderDraftPanel();
    faceEl.innerHTML='<b>📐 Dépouillage</b> : face de référence posée. Cliquez maintenant les <b>faces à '+
      'dépouiller</b> (re-clic = retirer) · <b>Entrée</b> = appliquer · <b>Échap</b> annule.';
    return;
  }
  const k=draftKey(hit.ref);
  const i=draftMode.faces.findIndex(r=>draftKey(r)===k);
  if(i>=0){draftMode.faces.splice(i,1);}
  else{
    // La face de référence elle-même n'a rien à faire : elle définit le plan neutre.
    if(k===draftKey(draftMode.ref)){faceEl.textContent='C\'est déjà la face de référence : elle reste fixe.';return;}
    // Une face PARALLÈLE au plan neutre ne peut pas être dépouillée : la face opposée
    // ne le touche pas (ligne d'intersection absente), la référence est déjà traitée
    // juste au-dessus. Vérifié face par face sur OCCT : ce sont les seules refusées.
    if(draftMode.ref){
      const d=hit.ref.n[0]*draftMode.ref.n[0]+hit.ref.n[1]*draftMode.ref.n[1]+hit.ref.n[2]*draftMode.ref.n[2];
      if(Math.abs(d)>0.999){
        faceEl.textContent='Cette face est parallèle au plan neutre et ne le touche pas : le dépouillage y serait dégénéré. Choisissez une face qui part du plan de référence.';
        return;
      }
    }
    draftMode.faces.push(hit.ref);
  }
  draftPaint();renderDraftPanel();
  const nf=draftMode.faces.length;
  faceEl.textContent=nf?`${nf} face(s) à dépouiller retenue(s) — saisissez l'angle puis <b>Appliquer</b>.`
    :'Aucune face retenue : cliquez les faces à dépouiller, ou <b>Échap</b> pour annuler.';
}
function draftHover(e){
  if(!draftMode)return;
  renderer.domElement.style.cursor='pointer';
}
/* ---------- panneau (même construction DOM que le panneau de congé exact) ---------- */
function renderDraftPanel(){
  const p=document.getElementById('props');if(!p)return;
  p.innerHTML='';if(!draftMode)return;
  const ed=draftMode.editing;
  const h=document.createElement('div');
  h.innerHTML=ed?'<b>📐 Édition du dépouillage</b>':'<b>📐 Dépouillage (angle de démoulage)</b>';
  p.appendChild(h);
  if(draftMode.phase==='ref'){
    const n=document.createElement('span');n.className='note';
    n.textContent='Cliquez la face de référence dans la vue 3D : c\'est le plan neutre, la seule qui ne bouge pas.';
    p.appendChild(n);return;
  }
  const r=draftMode.ref;
  if(r){
    const n=document.createElement('span');n.className='note';
    n.textContent='Plan neutre (face de référence) : centre ('+r.pos.map(v=>(+v).toFixed(1)).join(' ; ')+
      ') mm, normale ('+r.n.map(v=>(+v).toFixed(2)).join(' ; ')+').';
    p.appendChild(n);
  }
  // Liste des faces retenues : les voir, et pouvoir en retirer une sans la re-cliquer.
  const nf=(draftMode.faces||[]).length;
  if(nf){
    const lst=document.createElement('div');lst.className='lst';
    draftMode.faces.forEach((fr,i)=>{
      const r2=document.createElement('div');r2.className='item';
      const s=document.createElement('span');
      s.textContent='▸ centre ('+fr.pos.map(v=>(+v).toFixed(1)).join(' ; ')+') mm';
      r2.appendChild(s);
      const x=document.createElement('button');x.textContent='✕';x.title='Retirer cette face';
      x.onclick=()=>{draftMode.faces.splice(i,1);draftPaint();renderDraftPanel();};
      r2.appendChild(x);lst.appendChild(r2);
    });
    p.appendChild(lst);
  }
  // Angle : 0 < a < 90, au-delà le dépouillage perd son sens géométrique.
  const row=document.createElement('div');row.className='row';row.style.marginTop='8px';
  const lab=document.createElement('label');lab.textContent=' Angle (°) ';
  const inp=document.createElement('input');inp.type='text';inp.inputMode='decimal';
  inp.id='draftAngleIn';inp.style.width='80px';inp.value=String(draftMode.angle).replace('.',',');
  inp.onchange=()=>{
    const v=parseFloat(String(inp.value).replace(',','.').replace(/\s/g,''));
    if(!isFinite(v)||v<=0||v>=90){
      inp.value=String(draftMode.angle).replace('.',',');
      faceEl.textContent='Angle invalide : il doit être compris entre 0 et 90° (exclus).';
      return;
    }
    draftMode.angle=v;inp.value=String(v).replace('.',',');
  };
  row.appendChild(lab);row.appendChild(inp);
  const ok=document.createElement('button');ok.className='primary';
  ok.textContent=ed?'✔ Enregistrer':'✔ Appliquer';ok.onclick=draftApply;row.appendChild(ok);
  const q=document.createElement('button');q.textContent=ed?'✖ Annuler':'Quitter';q.onclick=()=>exitDraftMode();
  row.appendChild(q);p.appendChild(row);
  const n2=document.createElement('span');n2.className='note';
  n2.textContent='Chaque face retenue doit TOUCHER le plan neutre : elle pivote de cet angle autour de sa '+
    'ligne d\'intersection avec lui, pour ne plus coincer au démontage du moule. Une face parallèle au '+
    'plan neutre est refusée (pivot dégénéré).';
  p.appendChild(n2);
}
function draftApply(){
  if(!draftMode)return;
  if(draftMode.phase==='ref'){faceEl.textContent='Dépouillage : cliquez d\'abord la face de référence.';return;}
  if(!(draftMode.faces||[]).length){faceEl.textContent='Dépouillage : retenez au moins une face à dépouiller.';return;}
  const a=+draftMode.angle||0;
  if(!(a>0&&a<90)){faceEl.textContent='Dépouillage : angle hors bornes (0 ; 90).';return;}
  // On retire `_ord` (index BRep de la session) : il n'a de sens que pour la surbrillance et
  // il ferait grossir le document sans rien apporter au rejeu.
  const clean=r=>({pos:r.pos.slice(),dim:r.dim.slice(),n:r.n.slice()});
  const ref=clean(draftMode.ref);
  const faces=draftMode.faces.map(clean);
  if(draftMode.editing){
    // Édition EN PLACE (une seule fonction, comme l'édition d'un congé) : on écrit les
    // nouvelles faces puis on restaure le rejeu complet.
    const f=doc.features.find(x=>x.id===draftMode.editing&&x.type==='xdraft');
    if(f){
      docPushUndo('édition de « '+draftName(f)+' »');
      f.ref=ref;f.faces=faces;f.angle=a;f.name=draftName(f);
      sel={kind:'feature',id:f.id};
    }
    exitDraftMode(true);
    markDirty();rebuild();renderTree();renderProps();
    faceEl.textContent='Dépouillage mis à jour : '+draftName(f)+'.';
    return;
  }
  const nf={id:uid('dr'),type:'xdraft',name:draftName({angle:a,faces:faces}),ref,faces,angle:a,visible:true};
  addFeature(nf); // instantané d'annulation + insertion au marqueur temps
  sel={kind:'feature',id:nf.id};
  exitDraftMode(true);
  markDirty();rebuild();renderTree();renderProps();
  faceEl.textContent='Dépouillage créé : '+nf.name+'. Modifiez l\'angle dans ses propriétés, ou re-sélectionnez les faces.';
}
