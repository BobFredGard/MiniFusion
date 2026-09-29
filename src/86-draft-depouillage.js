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
let draftMode=null; // null | {phase:'ref'|'faces', ref:ref|null, faces:[ref], angle, editing:id|null, tangent:bool}
let draftGroup=null; // surbrillance 3D (référence verte, faces retenues bleues, flèche de sens)
let draftPrevBody=null; // aperçu translucide du solide dépouillé (non validé)

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
  // Index BRep → couleur : référence en vert, faces retenues en bleu (comme Fusion).
  // Le reste est laissé tel quel (on ne repeint que ce qui change).
  const colOf={};
  colOf[draftMode.ref._ord]=0x30d158;
  (draftMode.faces||[]).forEach(r=>{colOf[r._ord]=0x2f7bff;});
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
  // Flèche du sens de démoulage (direction de dépouille = normale de la référence),
  // plantée au centre de la face de référence — comme la flèche blanche de Fusion.
  try{
    const rn=draftMode.ref.n||[0,0,1],rp=draftMode.ref.pos||[0,0,0];
    let len=40;
    try{
      const bb=new THREE.Box3().setFromObject(b.mesh);
      const d=bb.max.clone().sub(bb.min).length();
      if(isFinite(d)&&d>0)len=Math.max(8,d/5);
    }catch(e){}
    const ar=new THREE.ArrowHelper(new THREE.Vector3(rn[0],rn[1],rn[2]).normalize(),new THREE.Vector3(rp[0],rp[1],rp[2]),len,0xffe14d,len*0.28,len*0.14);
    ar.traverse(o=>{o.raycast=()=>{};});
    draftGroup.add(ar);
  }catch(e){}
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
function occTangentFaces(shape,ord){
  // Ordinaux des faces reliées à `ord` par des arêtes LISSES (G1+), en fermeture transitive.
  // `ord` = rang d'exploration TopExp (le même que occGroups[].f). Une arête vive arrête
  // la propagation — pendant « faces » de la chaîne tangente des congés, mais pour des faces.
  const res=[ord];
  const bin=[];
  try{
    if(!shape||!(ord>=0))return res;
    const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
    const key=p=>p.map(v=>(+v).toFixed(2)).join(',');
    // 1) milieux d'arêtes par face (même calcul que occSharpEdges : Value au paramètre médian)
    const perFace=[];
    const fx=new occt.TopExp_Explorer_2(shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);bin.push(fx);
    while(fx.More()){
      const mids=[];
      try{
        const fh=occt.TopoDS.Face_1(fx.Current());bin.push(fh);
        const ex=new occt.TopExp_Explorer_2(fh,occt.TopAbs_ShapeEnum.TopAbs_EDGE,SH);bin.push(ex);
        while(ex.More()){
          try{
            const eh=occt.TopoDS.Edge_1(ex.Current());bin.push(eh);
            const ad=new occt.BRepAdaptor_Curve_2(eh);bin.push(ad);
            const u0=ad.FirstParameter(),u1=ad.LastParameter();
            if(u1>u0){const m=ad.Value((u0+u1)/2);mids.push(key([m.X(),m.Y(),m.Z()]));try{m.delete();}catch(e){}}
          }catch(e){}
          ex.Next();
        }
      }catch(e){}
      perFace.push(mids);
      fx.Next();
    }
    if(ord>=perFace.length)return res;
    // 2) arête → faces qui la portent
    const owners=new Map();
    perFace.forEach((mids,fi)=>mids.forEach(k=>{if(!owners.has(k))owners.set(k,[]);if(owners.get(k).indexOf(fi)<0)owners.get(k).push(fi);}));
    // 3) lissité depuis occSharpEdges (même clé toFixed(2))
    const smooth=new Set();
    try{occSharpEdges(shape).forEach(e=>{if(!e.sharp&&e.mid)smooth.add(key(e.mid));});}catch(e){}
    // 4) fermeture transitive par les arêtes lisses
    const seen=new Set([ord]),pile=[ord];
    while(pile.length){
      const f=pile.pop();
      (perFace[f]||[]).forEach(k=>{
        if(!smooth.has(k))return;
        (owners.get(k)||[]).forEach(o=>{if(!seen.has(o)){seen.add(o);pile.push(o);}});
      });
    }
    return [...seen].sort((a,b)=>a-b);
  }catch(e){return res;}
  finally{try{occDispose(bin);}catch(e){}}
}
/* ---------- aperçu bleu translucide du solide dépouillé AVANT validation ----------
   Même pattern que l'aperçu rouge des congés (xPreviewUpdate) : on rejoue la dépouille
   sur une copie du solide courant, on affiche le résultat en bleu translucide et la
   pièce réelle s'estompe. Noms de sauvegarde `_d*` distincts de `_x*` pour que les deux
   aperçus ne se marchent jamais dessus (les modes s'excluent, mais la ceinture et les
   bretelles ne coûtent rien ici). */
function draftPreviewRemove(){
  if(draftPrevBody){
    if(draftPrevBody.mesh){try{scene.remove(draftPrevBody.mesh);draftPrevBody.mesh.geometry.dispose();}catch(e){}}
    bodies=bodies.filter(b=>b!==draftPrevBody);
    draftPrevBody=null;
  }
  bodies.forEach(b=>{
    if(b._dSaved==null||!b.mesh||!b.mesh.material)return;
    b.mesh.material.opacity=b._dSaved;b.mesh.material.transparent=b._dTrans;
    if(b._dDW!==undefined)b.mesh.material.depthWrite=b._dDW;
    delete b._dSaved;delete b._dTrans;delete b._dDW;
  });
  try{refreshParts();}catch(e){}
}
function draftPreviewUpdate(){
  try{
    if(!draftMode){draftPreviewRemove();return;}
    const faces=draftMode.faces||[];
    if(!draftMode.ref||!faces.length||!occLive||!occLive.shape){draftPreviewRemove();return;}
    // rien à recalculer si la sélection, la référence et l'angle n'ont pas bougé
    const sig=draftKey(draftMode.ref)+'|'+faces.map(draftKey).join(';')+'|'+draftMode.angle;
    if(draftMode._prevSig===sig)return;
    draftMode._prevSig=sig;
    const got=[];
    faces.forEach(r=>{try{const h=occFindFace(occLive.shape,r);if(h)got.push(h);}catch(e){}});
    if(!got.length){draftPreviewRemove();return;}
    let r=null;
    try{r=occDraftOnce(occLive.shape,{pos:draftMode.ref.pos,n:draftMode.ref.n},got,+draftMode.angle*Math.PI/180);}
    finally{got.forEach(g=>{try{g.delete();}catch(e){}});}
    if(!r||!r.shape){draftPreviewRemove();return;}
    let sh=r.shape;
    try{const u=occUnify(sh);if(u!==sh){try{sh.delete();}catch(e){}sh=u;}}catch(e){}
    let g=null;
    try{g=occTessellate(sh,0.5);}catch(e){g=null;}
    try{sh.delete();}catch(e){}
    if(!g){draftPreviewRemove();return;}
    draftPreviewRemove();
    bodies.forEach(b=>{
      if(b.ghost||!b.mesh||!b.mesh.material)return;
      b._dSaved=b.mesh.material.opacity;b._dTrans=b.mesh.material.transparent;
      b.mesh.material.opacity=0.28;b.mesh.material.transparent=true;
      b._dDW=b.mesh.material.depthWrite;b.mesh.material.depthWrite=false;
    });
    const mat=new THREE.MeshStandardMaterial({color:0x2f7bff,transparent:true,opacity:0.55,depthWrite:false,side:THREE.DoubleSide,roughness:0.4,metalness:0.05});
    const mesh=new THREE.Mesh(g,mat);mesh.name='draftPreview';
    mesh.renderOrder=1000;
    mesh.userData.bid='draft_preview';mesh.raycast=()=>{};
    scene.add(mesh);
    draftPrevBody={id:'draft_preview',name:'🔵 Aperçu dépouille (non validé)',mesh,color:0x2f7bff,visible:true,kind:'ghost',ref:null,ghost:true,preview:true};
    bodies.push(draftPrevBody);
    try{refreshParts();}catch(e){}
  }catch(e){draftPreviewRemove();}
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
  if(typeof coqueMode!=='undefined'&&coqueMode)exitCoqueMode(true);
  draftMode={phase:'ref',ref:null,faces:[],angle:5,editing:editing?editing.id:null,tangent:true};
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
  draftMode=null;draftClearHl();draftPreviewRemove();
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
  let tangentes=0,ignorees=0;
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
    // Chaîne tangente (cochée par défaut, comme le congé) : les voisines reliées à la
    // face cliquée par des arêtes lisses suivent d'un coup. Mêmes règles que le clic
    // (référence et faces parallèles au neutre exclues) ; re-clic = retrait simple.
    if(draftMode.tangent!==false&&hit.ord>=0&&occLive&&occLive.shape){
      try{
        occTangentFaces(occLive.shape,hit.ord).forEach(o=>{
          if(o===hit.ord)return;
          let r=null;
          try{
            const f=occFaceAt(occLive.shape,o);
            if(f){r=occFaceRef(f);try{f.delete();}catch(e){}}
          }catch(e){}
          if(!r){ignorees++;return;}
          const kk=draftKey(r);
          if(kk===draftKey(draftMode.ref)){ignorees++;return;}
          if(draftMode.faces.some(x=>draftKey(x)===kk))return;
          if(draftMode.ref){
            const d=r.n[0]*draftMode.ref.n[0]+r.n[1]*draftMode.ref.n[1]+r.n[2]*draftMode.ref.n[2];
            if(Math.abs(d)>0.999){ignorees++;return;}
          }
          r._ord=o;draftMode.faces.push(r);tangentes++;
        });
      }catch(e){}
    }
  }
  draftPaint();draftPreviewUpdate();renderDraftPanel();
  const nf=draftMode.faces.length;
  faceEl.textContent=nf?`${nf} face(s) à dépouiller retenue(s)${tangentes?` (dont ${tangentes} tangente(s))`:''}${ignorees?` — ${ignorees} voisine(s) écartée(s) (référence ou parallèle au neutre)`:''} — saisissez l'angle puis <b>Appliquer</b>.`
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
  // Chaîne tangente : coché par défaut, comme le congé exact.
  const trow=document.createElement('div');trow.className='row';
  const tcb=document.createElement('input');tcb.type='checkbox';tcb.checked=draftMode.tangent!==false;
  tcb.title='En cliquant une face, ajouter aussi ses voisines reliées par des arêtes lisses';
  const tlab=document.createElement('span');tlab.textContent=' 🔗 Chaîne tangente';
  trow.appendChild(tcb);trow.appendChild(tlab);p.appendChild(trow);
  tcb.onchange=()=>{draftMode.tangent=tcb.checked;};
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
      draftPreviewRemove();
      return;
    }
    draftMode.angle=v;inp.value=String(v).replace('.',',');
    draftPreviewUpdate();
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
