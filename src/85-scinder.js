/* ---------- scinder par un plan : faces ou corps (V0.11.5) ----------
   Le calcul est dans 20-noyau (splitPlaneOf / occApplySplit). Ici : la commande, le mode
   de saisie et les propriétés. Une seule fonction, deux modes, comme Scinder la face /
   Scinder le corps dans Fusion :
     • Faces : on clique les faces à couper ; chacune reçoit une arête le long du plan, le
       solide reste entier (utile pour une dépouille, un déplacement, une zone d'usinage) ;
     • Corps : on clique le corps (ou on le choisit) ; il est coupé en deux, le côté vers
       lequel pointe la normale du plan part dans un corps NEUF.
   Le plan : XY / XZ / YZ de l'origine, un plan de construction (suivi s'il bouge), ou une
   face plane cliquée (figée au clic) ; plus un décalage le long de la normale et Inverser.
   Les faces sont mémorisées par référence durable (occFaceRefAny), comme la suppression. */
let splitMode=null; // null | {mode,faces:[ref],body,pl,off,flip,pick:null|'plane',editing:id|null}
let splitGroup=null; // surbrillance 3D : faces visées + aperçu du plan

(function(){
  if(document.getElementById('btnSplit'))return;
  const after=document.getElementById('btnCoque')||document.getElementById('btnDraft')||document.getElementById('btnExtrude');
  if(!after||!after.parentNode)return;
  const b=document.createElement('button');
  b.id='btnSplit';
  b.textContent='✂ Scinder';
  b.title='Scinder par un plan : couper des faces (le solide reste entier) ou couper un corps en deux';
  b.onclick=()=>{if(splitMode)exitSplitMode();else enterSplitMode();};
  after.parentNode.insertBefore(b,after.nextSibling);
})();

function splitPlaneLabel(pl){
  const P=pl||{};
  if(P.src==='XY'||P.src==='XZ'||P.src==='YZ')return 'plan '+P.src;
  if(P.src==='cg'){const c=(doc.cgeo||[]).find(x=>x&&x.id===P.cg);return c?c.name:'plan de construction supprimé';}
  if(P.src==='face')return 'face plane';
  return 'plan ?';
}
function splitName(f){
  const d=+f.off||0;
  const off=d?' '+(d>0?'+':'')+String(Math.round(d*1000)/1000).replace('.',',')+' mm':'';
  if(f.mode==='body')return 'Scinder le corps · '+splitPlaneLabel(f.pl)+off;
  const n=(f.faces||[]).length;
  return 'Scinder '+(n>1?n+' faces':'la face')+' · '+splitPlaneLabel(f.pl)+off;
}
function splitBodyName(id){const e=(doc.bodies||[]).find(b=>b.id===id);return e?e.name:id;}

/* ---------- surbrillance : faces visées (orange) + plan de coupe (bleu translucide) ---------- */
function splitClearHl(){
  if(!splitGroup)return;
  splitGroup.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});
  scene.remove(splitGroup);splitGroup=null;
}
function splitPaint(){
  splitClearHl();
  if(!splitMode)return;
  splitGroup=new THREE.Group();splitGroup.name='splitHl';
  const targets=bodies.filter(x=>x.kind==='body'&&x.visible!==false&&x.mesh&&x.mesh.geometry);
  // faces visées (mode faces)
  if(splitMode.mode==='face'&&splitMode.faces.length){
    const pos=[];
    targets.forEach(b=>{
      const groups=(b.mesh.geometry.userData.occGroups)||[];
      const want=splitMode.faces.filter(r=>r._ord>=0&&r._bid===b.bodyId).map(r=>r._ord);
      if(!want.length)return;
      const a=b.mesh.geometry.attributes.position.array;
      groups.forEach(gr=>{
        if(want.indexOf(gr.f)<0)return;
        for(let t=gr.start;t<gr.start+gr.count;t++){const i9=t*9;for(let k=0;k<9;k++)pos.push(a[i9+k]);} // groupes en TRIANGLES (non indexé)
      });
    });
    if(pos.length){
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
      const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0xff9f0a,transparent:true,opacity:.55,depthTest:false,side:THREE.DoubleSide}));
      m.raycast=()=>{};m.renderOrder=1002;splitGroup.add(m);
    }
  }
  // plan de coupe : carré centré sur la projection du centre des corps
  try{
    const box=new THREE.Box3();
    targets.forEach(b=>{if(splitMode.mode==='body'&&splitMode.body&&b.bodyId!==splitMode.body)return;box.expandByObject(b.mesh);});
    if(!box.isEmpty()){
      const P=splitPlaneOf(splitMode);
      const c=box.getCenter(new THREE.Vector3()),n=new THREE.Vector3(P.n[0],P.n[1],P.n[2]).normalize();
      const k=(c.x-P.o[0])*n.x+(c.y-P.o[1])*n.y+(c.z-P.o[2])*n.z;
      const q=c.clone().addScaledVector(n,-k);
      const s=box.getSize(new THREE.Vector3()).length()*0.75+4;
      const g=new THREE.PlaneGeometry(s,s);
      const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x0a84ff,transparent:true,opacity:.18,depthWrite:false,side:THREE.DoubleSide}));
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),n);m.position.copy(q);
      m.raycast=()=>{};m.renderOrder=1001;splitGroup.add(m);
      const eg=new THREE.EdgesGeometry(g);
      const l=new THREE.LineSegments(eg,new THREE.LineBasicMaterial({color:0x0a84ff,transparent:true,opacity:.9}));
      l.quaternion.copy(m.quaternion);l.position.copy(q);l.raycast=()=>{};l.renderOrder=1001;splitGroup.add(l);
      // flèche de normale : le côté qui part dans le corps neuf (mode corps)
      if(splitMode.mode==='body'&&THREE.ArrowHelper){
        const ar=new THREE.ArrowHelper(n,q,s*0.25,0x0a84ff,s*0.06,s*0.03);
        ar.traverse(o=>{o.raycast=()=>{};o.renderOrder=1003;if(o.material){o.material.depthTest=false;o.material.transparent=true;}});splitGroup.add(ar);
      }
    }
  }catch(e){}
  scene.add(splitGroup);
}
/* ---------- saisie ---------- */
function splitFaceKey(r){return (r.pos||[]).map(v=>(+v).toFixed(2)).join(',')+'|'+(r.dim||[]).map(v=>(+v).toFixed(2)).join(',')+'|'+(r.st||'');}
function splitHitUnder(e){
  // Face exacte sous le curseur : {ref (occFaceRefAny), ord, bid, plane:{o,n}|null}
  if(!occHas()||!occLive||!occLive.shape)return null;
  try{
    const h=pick(e);
    if(!h||!h.object)return null;
    const hit=occFaceOfHit(h.object,h.faceIndex);
    if(!hit||!hit.face)return null;
    let ref=null,plane=null;
    try{
      ref=occFaceRefAny(hit.face);
      if(ref&&ref.n&&ref.st==='Plane')plane={o:ref.pos.slice(),n:ref.n.slice()};
    }finally{try{hit.face.delete();}catch(e2){}}
    if(!ref)return null;
    return{ref,ord:hit.ord,bid:hit.bd.bodyId,plane};
  }catch(err){return null;}
}
function splitOrdOf(ref){
  // Édition : retrouve la face mémorisée sur les solides affichés (surbrillance).
  const k=splitFaceKey(ref);
  for(const b of bodies){
    if(b.kind!=='body'||!b.mesh||!b.shape)continue;
    if(ref._bid&&b.bodyId!==ref._bid)continue;
    const groups=(b.mesh.geometry.userData.occGroups)||[];
    for(const g of groups){
      let f=null,cur=null;
      try{f=occFaceAt(b.shape,g.f);if(f)cur=occFaceRefAny(f);}catch(e){}
      try{if(f)f.delete();}catch(e){}
      if(cur&&splitFaceKey(cur)===k){ref._bid=b.bodyId;return g.f;}
    }
  }
  return -1;
}
function enterSplitMode(editF){
  if(skEdit)return;
  const editing=(editF&&editF.type==='xsplit')?editF:null;
  if(splitMode){if(editing&&splitMode.editing===editing.id)return;exitSplitMode(true);}
  if(!occHas()){faceEl.textContent='Scinder : solide exact indisponible (OCCT non chargé).';return;}
  try{if(filMode||filModeX)exitFilletMode(true);}catch(e){}
  try{if(mvMode)exitMoveFaceMode(true);}catch(e){}
  try{if(draftMode)exitDraftMode(true);}catch(e){}
  try{if(coqueMode)exitCoqueMode(true);}catch(e){}
  let b0=null;try{b0=ensureActiveBody();}catch(e){}
  splitMode={mode:'face',faces:[],body:b0,pl:{src:'XY'},off:0,flip:false,pick:null,editing:editing?editing.id:null};
  if(editing){
    // Édition : rejeu SANS la fonction (occSkipFeat) → les faces d'origine redeviennent cliquables.
    splitMode.mode=editing.mode==='body'?'body':'face';
    splitMode.body=editing.body;
    splitMode.pl=JSON.parse(JSON.stringify(editing.pl||{src:'XY'}));
    splitMode.off=+editing.off||0;splitMode.flip=!!editing.flip;
    splitMode.faces=(editing.faces||[]).map(r=>JSON.parse(JSON.stringify(r)));
    splitMode.faces.forEach(r=>{if(!r._bid)r._bid=editing.body;});
    occSkipFeat=editing.id;
    tlEditLock(editing);
    try{rebuild();}catch(e){}
    splitMode.faces.forEach(r=>{try{r._ord=splitOrdOf(r);}catch(e){r._ord=-1;}});
  }else if(!occLive||!occLive.shape){
    try{rebuild();}catch(e){}
  }
  splitPaint();renderSplitPanel();splitHelp();
}
function splitHelp(){
  if(!splitMode)return;
  const ed=splitMode.editing?'<b>✂ Édition de la scission</b>':'<b>✂ Scinder</b>';
  faceEl.innerHTML=ed+'<br><span class="note">'+(splitMode.pick==='plane'
    ?'Cliquez une <b>face plane</b> : elle devient le plan de coupe.'
    :splitMode.mode==='face'
      ?'Cliquez les <b>faces à couper</b> (re-clic = retirer), choisissez le plan, puis <b>Appliquer</b> (<b>Entrée</b>).'
      :'Cliquez le <b>corps à couper</b> (ou choisissez-le), choisissez le plan, puis <b>Appliquer</b> (<b>Entrée</b>).')
    +' <b>Échap</b> annule.</span>';
}
function exitSplitMode(silent){
  if(!splitMode)return;
  const wasEditing=!!splitMode.editing;
  splitMode=null;splitClearHl();
  if(wasEditing){occSkipFeat=null;tlEditUnlock();markDirty();try{rebuild();}catch(e){}}
  if(!silent)renderProps();
}
function splitClick(e){
  if(!splitMode)return;
  const hit=splitHitUnder(e);
  if(!hit){faceEl.textContent='Scinder : cliquez une face du solide exact.';return;}
  if(splitMode.pick==='plane'){
    if(!hit.plane){faceEl.textContent='Scinder : cette face n\'est pas plane — choisissez une face plane pour le plan de coupe.';return;}
    splitMode.pl={src:'face',o:hit.plane.o,n:hit.plane.n};splitMode.off=0;splitMode.pick=null;
    splitPaint();renderSplitPanel();splitHelp();
    return;
  }
  if(splitMode.mode==='body'){
    splitMode.body=hit.bid;splitPaint();renderSplitPanel();
    faceEl.textContent='Corps à couper : '+splitBodyName(hit.bid)+'. Choisissez le plan puis Appliquer.';
    return;
  }
  // mode faces : un seul corps par scission (la fonction vit dans ce corps)
  if(splitMode.faces.length&&splitMode.faces[0]._bid!==hit.bid){
    splitMode.faces=[];faceEl.textContent='Faces d\'un autre corps : la sélection repart de ce corps.';
  }
  splitMode.body=hit.bid;
  hit.ref._ord=hit.ord;hit.ref._bid=hit.bid;
  const k=splitFaceKey(hit.ref),i=splitMode.faces.findIndex(r=>splitFaceKey(r)===k);
  if(i>=0)splitMode.faces.splice(i,1);else splitMode.faces.push(hit.ref);
  splitPaint();renderSplitPanel();
}
function splitHover(){if(splitMode)renderer.domElement.style.cursor=splitMode.pick==='plane'?'crosshair':'pointer';}
/* ---------- panneau ---------- */
function splitPlaneOptions(){
  const o=[['XY','Plan XY (origine)'],['XZ','Plan XZ (origine)'],['YZ','Plan YZ (origine)']];
  (doc.cgeo||[]).forEach(c=>{if(c&&c.kind==='plane'&&c.fr)o.push(['cg:'+c.id,'▱ '+c.name]);});
  o.push(['face','Face plane (cliquée)']);
  return o;
}
function splitPlaneValue(pl){const P=pl||{};return P.src==='cg'?'cg:'+P.cg:(P.src||'XY');}
function splitPlaneFrom(v,cur){
  if(v==='face')return (cur&&cur.src==='face'&&cur.o)?cur:null; // il faut cliquer la face
  if(/^cg:/.test(v)){const id=v.slice(3),c=(doc.cgeo||[]).find(x=>x&&x.id===id);return{src:'cg',cg:id,o:c&&c.fr?c.fr.o.slice():null,n:c&&c.fr?c.fr.z.slice():null};}
  return{src:v};
}
function splitNumIn(val,fn){
  const i=document.createElement('input');i.type='text';i.inputMode='decimal';
  i.value=String(val).replace('.',',');
  i.onchange=()=>{const v=parseFloat(String(i.value).replace(',','.').replace(/\s/g,''));if(!isFinite(v)){i.value=String(val).replace('.',',');return;}fn(v);};
  return i;
}
function renderSplitPanel(){
  const p=document.getElementById('props');if(!p)return;
  p.innerHTML='';if(!splitMode)return;
  const S=splitMode;
  const row=(lab,el)=>{const r=document.createElement('div');r.className='pnl-row';const L=document.createElement('label');L.textContent=lab;r.appendChild(L);if(el)r.appendChild(el);p.appendChild(r);return r;};
  const note=t=>{const n=document.createElement('div');n.className='pnl-note';n.textContent=t;p.appendChild(n);return n;};
  const h=document.createElement('div');h.className='pnl-h';h.textContent=S.editing?'✂ Édition de la scission':'✂ Scinder par un plan';p.appendChild(h);
  // mode
  const md=document.createElement('div');md.className='pnl-btns';
  [['face','▦ Faces','Couper des faces : le solide reste entier'],['body','◧ Corps','Couper un corps en deux corps']].forEach(([v,t,tip])=>{
    const b=document.createElement('button');b.textContent=t;b.title=tip;if(S.mode===v)b.className='primary';
    b.onclick=()=>{if(S.mode===v)return;S.mode=v;S.pick=null;splitPaint();renderSplitPanel();splitHelp();};
    md.appendChild(b);
  });
  p.appendChild(md);
  // cible
  if(S.mode==='face'){
    if(S.faces.length){
      const lst=document.createElement('div');lst.className='lst';
      S.faces.forEach((r,i)=>{
        const it=document.createElement('div');it.className='item';
        const s=document.createElement('span');
        s.textContent=(r._ord>=0?'✅ ':'⚠ ')+'▸ '+(r.st==='Plane'?'face plane':'face '+(r.st||'')).trim()+' ('+r.pos.map(v=>(+v).toFixed(1)).join(' ; ')+')';
        it.appendChild(s);
        const x=document.createElement('button');x.textContent='✕';x.title='Retirer cette face';
        x.onclick=()=>{S.faces.splice(i,1);splitPaint();renderSplitPanel();};
        it.appendChild(x);lst.appendChild(it);
      });
      p.appendChild(lst);
      note('Corps : '+splitBodyName(S.body));
    }else note('Cliquez dans la vue 3D les faces à couper (toutes sur le même corps).');
  }else{
    const sb=document.createElement('select');
    (doc.bodies||[]).forEach(b=>{const o=document.createElement('option');o.value=b.id;o.textContent=b.name;sb.appendChild(o);});
    if(S.body)sb.value=S.body;
    sb.onchange=()=>{S.body=sb.value;splitPaint();};
    row('Corps à couper',sb);
  }
  // plan
  const sp=document.createElement('select');
  splitPlaneOptions().forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;sp.appendChild(o);});
  sp.value=splitPlaneValue(S.pl);
  sp.onchange=()=>{
    const pl=splitPlaneFrom(sp.value,S.pl);
    if(!pl){S.pick='plane';splitHelp();renderSplitPanel();return;}
    S.pl=pl;S.pick=null;splitPaint();splitHelp();
  };
  row('Plan',sp);
  const pk=document.createElement('div');pk.className='pnl-btns';
  const bp=document.createElement('button');bp.textContent=S.pick==='plane'?'⊙ Cliquez une face plane…':'⊙ Choisir une face plane';
  if(S.pick==='plane')bp.className='primary';
  bp.onclick=()=>{S.pick=S.pick==='plane'?null:'plane';renderSplitPanel();splitHelp();};
  pk.appendChild(bp);p.appendChild(pk);
  row('Décalage (mm)',splitNumIn(S.off,v=>{S.off=v;splitPaint();}));
  const fl=document.createElement('input');fl.type='checkbox';fl.checked=!!S.flip;fl.onchange=()=>{S.flip=fl.checked;splitPaint();};
  row('Inverser',fl);
  if(S.mode==='body')note('Le côté vers lequel pointe la flèche bleue part dans un corps neuf ; l\'autre reste dans '+splitBodyName(S.body)+'.');
  else note('Chaque face reçoit une arête le long du plan ; le solide reste entier.');
  const btns=document.createElement('div');btns.className='pnl-btns';btns.style.marginTop='8px';
  const ok=document.createElement('button');ok.className='primary';ok.textContent=S.editing?'✔ Enregistrer':'✔ Appliquer';ok.onclick=splitApply;btns.appendChild(ok);
  const q=document.createElement('button');q.textContent=S.editing?'✖ Annuler':'Quitter';q.onclick=()=>exitSplitMode();btns.appendChild(q);
  p.appendChild(btns);
}
function splitApply(){
  const S=splitMode;if(!S)return;
  if(S.mode==='face'&&!S.faces.length){faceEl.textContent='Scinder : cliquez au moins une face à couper.';return;}
  if(S.mode==='body'&&!(doc.bodies||[]).some(b=>b.id===S.body)){faceEl.textContent='Scinder : choisissez le corps à couper.';return;}
  if(!S.pl||(S.pl.src==='face'&&!(S.pl.o&&S.pl.n))){faceEl.textContent='Scinder : choisissez le plan de coupe.';return;}
  const clean=r=>{const o={pos:r.pos.slice(),dim:r.dim.slice()};if(r.n)o.n=r.n.slice();if(r.st)o.st=r.st;return o;};
  const pl=JSON.parse(JSON.stringify(S.pl));
  if(S.editing){
    const f=doc.features.find(x=>x.id===S.editing&&x.type==='xsplit');
    if(f){
      docPushUndo('édition de « '+f.name+' »');
      const wasBody=f.mode==='body';
      f.mode=S.mode;f.pl=pl;f.off=+S.off||0;f.flip=!!S.flip;
      if(S.mode==='face'){f.faces=S.faces.map(clean);f.body=S.body||f.body;}
      else{delete f.faces;f.body=S.body;}
      if(S.mode==='body'&&!wasBody&&!f.newBody)f.newBody=splitNewBodyFor(f.body);
      if(S.mode==='face'&&wasBody&&f.newBody){const nb=f.newBody;delete f.newBody;splitOnDelete({type:'xsplit',newBody:nb});}
      f.name=splitName(f);sel={kind:'feature',id:f.id};
    }
    exitSplitMode(true);
    markDirty();rebuild();renderTree();renderProps();
    if(f)faceEl.textContent='Scission mise à jour : '+f.name+'.';
    return;
  }
  const nf={id:uid('sp'),type:'xsplit',name:'',mode:S.mode,body:S.body,pl,off:+S.off||0,flip:!!S.flip,visible:true};
  if(S.mode==='face')nf.faces=S.faces.map(clean);
  else nf.newBody=splitNewBodyFor(S.body);
  nf.name=splitName(nf);
  addFeature(nf);
  sel={kind:'feature',id:nf.id};
  exitSplitMode(true);
  markDirty();rebuild();renderTree();renderProps();
  const bad=nf._err||(nf._m&&nf._m.m<nf._m.t);
  faceEl.textContent=bad?'Scinder : le plan ne coupe pas ce qui est visé — voir ⚠ dans l\'arbre (Ctrl+Z pour annuler).'
    :(nf.mode==='body'?'Corps scindé : l\'autre côté est dans « '+splitBodyName(nf.newBody)+' ».':nf.name+' : faces coupées.');
}
function splitNewBodyFor(src){
  // Corps neuf, nommé d'après le corps coupé (le corps actif reste inchangé)
  try{ensureBodies();}catch(e){}
  const n=doc.bodySeq++;
  const e={id:'b'+n,name:splitBodyName(src)+' (2)',c:null};
  doc.bodies.push(e);return e.id;
}
function splitOnDelete(f){
  // Suppression de la fonction : le corps neuf part avec elle s'il ne porte rien d'autre.
  const nb=f&&f.type==='xsplit'&&f.newBody;
  if(!nb||doc.features.some(x=>x.body===nb||(x.type==='combine'&&(x.tools||[]).indexOf(nb)>=0)||(x!==f&&x.newBody===nb)))return;
  doc.bodies=(doc.bodies||[]).filter(b=>b.id!==nb);
  if(doc.activeBody===nb&&doc.bodies.length)doc.activeBody=doc.bodies[0].id;
}
/* ---------- propriétés d'une scission ---------- */
function splitProps(p,f){
  const pH=t=>{const h=document.createElement('div');h.className='pnl-h';h.textContent=t;p.appendChild(h);};
  const pRow=(lab,el)=>{const r=document.createElement('div');r.className='pnl-row';const L=document.createElement('label');L.textContent=lab;r.appendChild(L);if(el)r.appendChild(el);p.appendChild(r);};
  const pInfo=h=>{const d=document.createElement('div');d.className='pnl-note';d.innerHTML=h;p.appendChild(d);};
  const set=(lab,fn)=>{docPushUndo(lab);fn();f.name=splitName(f);markDirty();rebuild();renderTree();renderProps();};
  pH(f.mode==='body'?'Scinder le corps':'Scinder des faces');
  pInfo('<b>'+f.name+'</b>');
  if(f._m&&f._m.t&&f._m.m<f._m.t)pInfo('<span style="color:var(--warn)">⚠ '+(f.mode==='body'?'le plan ne coupe pas le corps':(f._m.m+'/'+f._m.t+' face(s) coupée(s)'))+'</span>');
  if(f.mode==='body')pInfo('Corps coupé : <b>'+splitBodyName(f.body)+'</b> · autre côté : <b>'+splitBodyName(f.newBody)+'</b>');
  else pInfo((f.faces||[]).length+' face(s) de <b>'+splitBodyName(f.body)+'</b>');
  const sp=document.createElement('select');
  splitPlaneOptions().forEach(([v,t])=>{if(v==='face'&&!(f.pl&&f.pl.src==='face'))return;const o=document.createElement('option');o.value=v;o.textContent=t;sp.appendChild(o);});
  sp.value=splitPlaneValue(f.pl);
  sp.onchange=()=>{const pl=splitPlaneFrom(sp.value,f.pl);if(pl)set('plan de « '+f.name+' »',()=>{f.pl=pl;});};
  pRow('Plan',sp);
  pRow('Décalage (mm)',splitNumIn(+f.off||0,v=>{if(v!==(+f.off||0))set('décalage de « '+f.name+' »',()=>{f.off=v;});}));
  const fl=document.createElement('input');fl.type='checkbox';fl.checked=!!f.flip;
  fl.onchange=()=>set('inversion de « '+f.name+' »',()=>{f.flip=fl.checked;});
  pRow('Inverser',fl);
  const d=document.createElement('div');d.className='pnl-btns';
  const b=document.createElement('button');b.textContent='✂ Modifier (faces, corps, plan)';
  b.onclick=()=>{exitSplitMode(true);enterSplitMode(f);};
  d.appendChild(b);p.appendChild(d);
}
// Entrée applique, comme Échap annule (le champ Décalage valide d'abord sa saisie).
window.addEventListener('keydown',e=>{
  if(e.key!=='Enter'||!splitMode)return;
  const t=e.target;
  if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable)){try{t.blur();}catch(err){}}
  e.preventDefault();splitApply();
});
