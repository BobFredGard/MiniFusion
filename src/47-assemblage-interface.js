/* ---------- assemblage : affichage, navigation, arbre, panneau (V0.6.0) ----------
   Le modèle est dans 46-assemblage-modele.js. Ici :
     · asmScene       scène SÉPARÉE de la vue d'assemblage : la scène de la pièce n'est pas
                      touchée (rien à masquer ni à restaurer) ; animate() rend l'une ou l'autre ;
     · instantanés    maillages de chaque pièce (géométries clonées en fin de rejeu), affichés
                      par occurrence avec sa matrice ; une pièce inactive ne change pas, son
                      instantané reste valable (refait seulement repli maillage → exact) ;
     · contexte       en mode pièce, les autres occurrences en fantômes non sélectionnables,
                      placées par rapport à l'occurrence éditée (la pièce reste dans son repère) ;
     · navigation     entrer / sortir de l'assemblage, éditer une pièce (double-clic) ;
     · arbre, panneau occurrences, fixer, nouvelle pièce, nouvelle occurrence, supprimer. */
let asmScene=null,asmTri=null;
let asmSelId=null;      // occurrence sélectionnée (vue d'assemblage)
let asmEditOcc=null;    // occurrence par laquelle on est entré dans la pièce (contexte)
let asmBuilding=false;  // instantanés en cours : pas de dessin intermédiaire
const ASM_SEL_COL=0x0a84ff;
function asmOn(){return !!asm&&(asm.parts.length>1||asm.occ.length>1);}
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
  // Scène à rendre (animate) : l'assemblage en vue d'assemblage, sinon la pièce
  if(asmMode==='asm'&&asmScene){asmScene.background=scene.background;return asmScene;}
  return scene;
}
function asmMat4(F){
  const m=new THREE.Matrix4();
  m.makeBasis(new THREE.Vector3(F.x[0],F.x[1],F.x[2]),new THREE.Vector3(F.y[0],F.y[1],F.y[2]),new THREE.Vector3(F.z[0],F.z[1],F.z[2]));
  m.setPosition(F.o[0],F.o[1],F.o[2]);
  return m;
}
/* ── instantanés d'affichage ── */
function asmCaptureActive(){
  // Fin de rejeu (buildDone) : maillages de la pièce active, clonés (le rejeu suivant libère
  // les originaux). Seulement en assemblage — une pièce seule ne paie rien.
  if(!asm||(!asmOn()&&!asm._force))return;
  const p=asmActivePart();if(!p)return;
  const items=[];
  (bodies||[]).forEach(b=>{
    if(!b||b.ghost||!b.mesh||!b.mesh.geometry||b.visible===false)return;
    try{
      b.mesh.updateMatrixWorld(true);
      const g=b.mesh.geometry.clone();g.applyMatrix4(b.mesh.matrixWorld);
      const m=b.mesh.material||{};
      items.push({geo:g,color:(m.color&&m.color.getHex)?m.color.getHex():0x9a9aa0,op:(m.transparent&&m.opacity<1)?m.opacity:1});
    }catch(e){}
  });
  if(p._snap)asmSnapFree(p._snap);
  p._snap={items,exact:builtEngine==='exact',hash:(()=>{try{return docHash();}catch(e){return '';}})()};
  if(!asmBuilding){try{asmCtxDraw();}catch(e){}if(asmMode==='asm'){try{asmDraw();}catch(e){}}}
}
function asmSnapFree(s){(s&&s.items||[]).forEach(it=>{try{it.geo.dispose();}catch(e){}});}
function asmBuildSnapshots(){
  // Rejoue chaque pièce sans instantané (ou en repli maillage alors que le noyau exact est
  // prêt), puis revient à la pièce active. Synchrone : rebuild() construit et capture
  // (buildDone) avant de rendre la main.
  if(!asm)return;
  const back=asm.active,exact=typeof occHas==='function'&&occHas();
  const need=p=>!p._snap||(exact&&!p._snap.exact);
  let n=0;
  asmBuilding=true;
  try{
    for(const p of asm.parts.slice()){if(p.id!==back&&need(p)){asmActivate(p.id);n++;}}
    if(n)asmActivate(back);
    else{const a=asmActivePart();if(a&&need(a)){builtVersion=-1;try{rebuild();}catch(e){}}}
  }finally{asmBuilding=false;}
  try{asmCtxDraw();}catch(e){}
  if(asmMode==='asm'){try{asmDraw();}catch(e){}}
}
/* ── dessin de la vue d'assemblage ── */
function asmDraw(){
  const S=asmSceneGet(),G=S.getObjectByName('asmOcc');
  for(const o of [...G.children]){G.remove(o);o.traverse(m=>{try{if(m.material)m.material.dispose();}catch(e){}});}
  if(!asm)return;
  asm.occ.forEach(o=>{
    if(o.visible===false)return;
    const p=asmPart(o.part);if(!p||!p._snap)return;
    const g=new THREE.Group();g.name='occ_'+o.id;g.userData.occ=o.id;
    g.matrixAutoUpdate=false;g.matrix.copy(asmMat4(o.fr));
    const on=asmSelId===o.id;
    p._snap.items.forEach(it=>{
      const mat=new THREE.MeshStandardMaterial({color:it.color,metalness:.35,roughness:.4,transparent:it.op<1,opacity:it.op,
        emissive:on?ASM_SEL_COL:0x000000,emissiveIntensity:on?0.35:0});
      const m=new THREE.Mesh(it.geo,mat);m.userData.occ=o.id;g.add(m);
    });
    G.add(g);
  });
  G.updateMatrixWorld(true);
}
function asmCtxDraw(){
  // Mode pièce : les autres occurrences en fantômes, dans le repère de l'occurrence éditée
  if(typeof scene==='undefined'||!scene)return;
  let G=scene.getObjectByName('asmCtx');
  if(G){for(const o of [...G.children]){G.remove(o);o.traverse(m=>{try{if(m.material)m.material.dispose();}catch(e){}});}}
  if(!asmOn()||asmMode==='asm')return;
  if(!G){G=new THREE.Group();G.name='asmCtx';scene.add(G);}
  const me=asmOcc(asmEditOcc)&&asmOcc(asmEditOcc).part===asm.active?asmOcc(asmEditOcc):asmPartOccs(asm.active)[0];
  if(!me)return;
  const inv=asmMat4(asmInverse(me.fr));
  asm.occ.forEach(o=>{
    if(o.id===me.id||o.visible===false)return;
    const p=asmPart(o.part);if(!p||!p._snap)return;
    const g=new THREE.Group();g.matrixAutoUpdate=false;g.matrix.multiplyMatrices(inv,asmMat4(o.fr));
    p._snap.items.forEach(it=>{
      const m=new THREE.Mesh(it.geo,new THREE.MeshStandardMaterial({color:it.color,transparent:true,opacity:0.18,depthWrite:false,metalness:.2,roughness:.6}));
      m.raycast=()=>{};m.renderOrder=-1;g.add(m);
    });
    G.add(g);
  });
  G.updateMatrixWorld(true);
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
function asmEnter(){
  // Vue d'assemblage (crée l'assemblage autour de la pièce si besoin)
  if(typeof skEdit!=='undefined'&&skEdit){try{faceEl.textContent='Fermez d’abord l’esquisse.';}catch(e){}return;}
  asmEnsure();
  asmLeavePart();
  if(!asmActivePart()._snap){
    // pièce seule jusqu'ici : aucune capture faite (asmOn faux) → on la force
    asm._force=true;builtVersion=-1;try{rebuild();}catch(e){}asm._force=false;
  }
  asmBuildSnapshots();
  asmMode='asm';
  try{document.body.setAttribute('data-asm','1');}catch(e){}
  if(!asmSelId||!asmOcc(asmSelId))asmSelId=asmEditOcc&&asmOcc(asmEditOcc)?asmEditOcc:null;
  asmDraw();asmCtxDraw();asmFit();
  try{renderTree();renderProps();docUndoUI();}catch(e){}
  try{faceEl.textContent='Assemblage : clic = sélectionner une occurrence · double-clic = éditer sa pièce.';}catch(e){}
}
function asmExit(occId){
  // Retour en mode pièce : la pièce de l'occurrence (ou la pièce active)
  if(!asm)return;
  const o=asmOcc(occId)||asmOcc(asmSelId)||asmPartOccs(asm.active)[0];
  asmMode='part';
  try{document.body.removeAttribute('data-asm');}catch(e){}
  asmEditOcc=o?o.id:null;
  if(o&&o.part!==asm.active)asmActivate(o.part);
  asmCtxDraw();
  try{renderTree();renderProps();docUndoUI();showAll();}catch(e){}
  const p=asmActivePart();
  try{faceEl.textContent='Pièce « '+(p?p.name:'')+' » — '+(o?o.name:'')+(asmOn()?' · les autres pièces sont en fantôme. « Assemblage » pour revenir.':'');}catch(e){}
}
function asmToggle(){if(asmMode==='asm')asmExit();else asmEnter();}
function asmOnChange(viewOnly){
  // Appelé par le modèle (46) après toute modification de l'assemblage (viewOnly : bascule)
  if(!viewOnly){try{dirty=true;autosave();}catch(e){}}
  if(asmBuilding)return;
  if(asmMode==='asm'){try{asmDraw();renderTree();renderProps();}catch(e){}}
  else{try{asmCtxDraw();}catch(e){}}
}
/* ── sélection dans la vue d'assemblage ── */
function asmPickAt(e){
  const S=asmSceneGet();
  const r=renderer.domElement.getBoundingClientRect();
  const ndc=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
  rayc.setFromCamera(ndc,camera);
  const ms=[];S.getObjectByName('asmOcc').traverse(m=>{if(m.isMesh)ms.push(m);});
  const h=rayc.intersectObjects(ms,false)[0];
  return h?h.object.userData.occ:null;
}
function asmClick(e){
  const id=asmPickAt(e);
  asmSelId=id;
  asmDraw();renderTree();renderProps();
  const o=asmOcc(id);
  try{faceEl.textContent=o?(o.name+' — pièce « '+((asmPart(o.part)||{}).name||'')+' »'+(o.fixed?' · fixée':'')+(o.align?' · alignée':'')+'\nDouble-clic = éditer la pièce.'):'Aucune occurrence ici.';}catch(err){}
}
function asmDblClick(e){
  const id=asmPickAt(e);if(id)asmExit(id);
}
function asmKey(e){
  // Clavier en vue d'assemblage → true si consommé
  if(asmMode!=='asm')return false;
  const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return false;
  const ctrl=e.ctrlKey||e.metaKey,k=String(e.key||'').toLowerCase();
  if(ctrl&&k==='z'&&!e.shiftKey){e.preventDefault();asmUndo();return true;}
  if(ctrl&&(k==='y'||(k==='z'&&e.shiftKey))){e.preventDefault();asmRedo();return true;}
  if((e.key==='Delete'||e.key==='Backspace')&&asmSelId){e.preventDefault();asmAskDelete(asmSelId);return true;}
  if(e.key==='Escape'){if(asmSelId){asmSelId=null;asmDraw();renderTree();renderProps();}return true;}
  return false;
}
/* ── commandes ── */
function asmCmdNewPart(){
  if(asmMode!=='asm')asmEnter();
  const r=asmNewPart();
  // on entre aussitôt dans la pièce neuve (vide : rien à voir dans l'assemblage)
  asmExit(r.occ.id);
  try{faceEl.textContent='Nouvelle pièce « '+r.part.name+' » : créez une esquisse. « Assemblage » pour revenir.';}catch(e){}
}
function asmCmdNewOcc(){
  const src=asmOcc(asmSelId);
  if(!src){try{faceEl.textContent='Nouvelle occurrence : sélectionnez d’abord une occurrence de la pièce à répéter.';}catch(e){}return;}
  const fr=JSON.parse(JSON.stringify(src.fr));
  const p=asmPart(src.part),b=p&&p._snap?asmSnapBox(p._snap):null;
  fr.o[0]+=b?Math.max(10,1.2*(b.max.x-b.min.x)):50; // décalée le long de X pour qu'on la voie
  const o=asmAddOcc(src.part,fr);
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
  const seule=asmPartOccs(o.part).length===1;
  if(seule&&asm.parts.length===1){try{faceEl.textContent='C’est la seule pièce : rien à supprimer.';}catch(e){}return;}
  if(!confirm('Supprimer l’occurrence « '+o.name+' » ?'+(seule?'\nC’est la dernière de sa pièce : la pièce « '+((asmPart(o.part)||{}).name||'')+' » sera supprimée (Ctrl+Z pour annuler).':'')))return;
  asmDeleteOcc(id);if(asmSelId===id)asmSelId=null;asmNotify();
}
function asmRename(id){
  const o=asmOcc(id);if(!o)return;
  const p=asmPart(o.part);
  const n=prompt('Nom de la pièce (toutes ses occurrences) :',p?p.name:'');if(!n||!p)return;
  asmPush('renommer');const old=p.name;p.name=n;
  asm.occ.forEach(q=>{if(q.part===p.id)q.name=q.name.replace(new RegExp('^'+old.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),n);});
  if(p.doc)p.doc.name=n;
  asmNotify();
}
/* ── arbre ── */
function asmTreeRender(t){
  // Arbre de la vue d'assemblage (renderTree le délègue ici)
  const row=(html,cls,title)=>{const d=document.createElement('div');d.className=cls;d.innerHTML=html;if(title)d.title=title;t.appendChild(d);return d;};
  row('<span>🧩 Assemblage · '+String(asm.name||'').replace(/</g,'&lt;')+'</span>','tgroup');
  row('<span class="pdot" style="background:#fff;box-shadow:0 0 0 2px #1c1c1e inset"></span><span class="nm">Origine de l’assemblage</span>','tnode','Repère de l’assemblage : cible d’un alignement');
  row('<span>📦 Occurrences ('+asm.occ.length+') · '+asm.parts.length+' pièce(s)</span>','tgroup');
  asm.occ.forEach(o=>{
    const p=asmPart(o.part)||{};
    const badges=(o.fixed?' <span title="Fixée">📌</span>':'')+(o.align?' <span title="Alignée sur un repère">🔗</span>':'')+(o.st==='warn'?' <span style="color:var(--warn)" title="'+String(o.msg||'').replace(/"/g,'&quot;')+'">⚠</span>':'');
    const d=row('<span>📦</span><span class="nm">'+String(o.name).replace(/</g,'&lt;')+badges+(p.id===asm.active?' <span style="color:var(--muted)">· active</span>':'')+'</span><span class="eye" title="Afficher / masquer">'+(o.visible===false?'🙈':'👁')+'</span>',
      'tnode'+(asmSelId===o.id?' sel':'')+(o.visible===false?' hidden':''),'Clic = sélectionner · double-clic = éditer la pièce · clic droit = menu');
    d.onclick=ev=>{
      if(ev.target&&ev.target.classList&&ev.target.classList.contains('eye')){asmPush('visibilité');o.visible=!(o.visible!==false);asmNotify();return;}
      {const f=globalThis.asmTreePick;if(typeof f==='function'&&f(o.id))return;} // saisie d'un alignement (lot C)
      asmSelId=o.id;asmDraw();renderTree();renderProps();
    };
    d.ondblclick=()=>asmExit(o.id);
    d.oncontextmenu=e=>{e.preventDefault();asmSelId=o.id;asmDraw();renderTree();renderProps();
      try{mfPop({getBoundingClientRect:()=>({left:e.clientX,right:e.clientX+190,top:e.clientY-6,bottom:e.clientY-6,width:190,height:0})},[
        {html:'✏️ Éditer la pièce',fn:()=>asmExit(o.id)},
        {html:'➕ Nouvelle occurrence',fn:()=>asmCmdNewOcc()},
        {html:o.fixed?'📌 Libérer':'📌 Fixer',fn:()=>asmToggleFixed(o.id)},
        {html:'🏷 Renommer la pièce',fn:()=>asmRename(o.id)},
        {html:'🗑 Supprimer',fn:()=>asmAskDelete(o.id)}]);}catch(err){}
    };
  });
}
function asmBreadcrumb(t){
  // Mode pièce : « 🧩 Assemblage › pièce » en tête de l'arbre, pour revenir
  if(!asmOn())return;
  const p=asmActivePart(),o=asmOcc(asmEditOcc);
  const d=document.createElement('div');d.className='tnode';d.style.cssText='font-weight:600;cursor:pointer';
  d.innerHTML='<span>🧩</span><span class="nm">Assemblage › '+String(p?p.name:'').replace(/</g,'&lt;')+(o?' <span style="color:var(--muted)">('+String(o.name).replace(/</g,'&lt;')+')</span>':'')+'</span><span title="Retour à l’assemblage">↩</span>';
  d.title='Revenir à la vue d’assemblage';
  d.onclick=()=>asmEnter();
  t.appendChild(d);
}
/* ── panneau ── */
function asmRenderProps(p){
  const mk=(tag,cls,txt)=>{const d=document.createElement(tag);if(cls)d.className=cls;if(txt!=null)d.textContent=txt;return d;};
  const H=t=>p.appendChild(mk('div','pnl-h',t));
  const Note=t=>p.appendChild(mk('div','pnl-note',t));
  const Btns=list=>{const d=mk('div','pnl-btns');list.forEach(([t,fn,cls])=>{const b=mk('button',cls||null,t);b.onclick=fn;d.appendChild(b);});p.appendChild(d);return d;};
  const o=asmOcc(asmSelId);
  if(!o){
    H('🧩 Assemblage');
    Note(asm.parts.length+' pièce(s), '+asm.occ.length+' occurrence(s). Cliquez une occurrence (vue ou arbre) ; double-clic = éditer sa pièce.');
    Btns([['➕ Nouvelle pièce',asmCmdNewPart,'primary'],['↩ Retour à la pièce',()=>asmExit()]]);
    return;
  }
  const pt=asmPart(o.part)||{};
  H('📦 '+o.name);
  Note('Pièce « '+pt.name+' »'+(pt.id===asm.active?' (pièce active)':'')+' · '+asmPartOccs(o.part).length+' occurrence(s)');
  if(o.st==='warn')Note('⚠ '+o.msg);
  const f=v=>v.map(x=>(+x).toFixed(2).replace('.',',')).join(' ; ');
  Note('Position : '+f(o.fr.o)+' · Z : '+f(o.fr.z));
  {const f=globalThis.asmPlacementProps;if(typeof f==='function')f(p,o);} // placement (lot C)
  Btns([['✏️ Éditer la pièce',()=>asmExit(o.id),'primary'],['➕ Occurrence',asmCmdNewOcc],[o.fixed?'📌 Libérer':'📌 Fixer',()=>asmToggleFixed(o.id)],['🗑 Supprimer',()=>asmAskDelete(o.id),'danger']]);
}
function asmAfterLoad(){
  // Fin d'ouverture (deserialise) : instantanés des pièces, puis vue d'assemblage si le
  // fichier a été enregistré dedans ; sinon contexte en fantômes autour de la pièce
  try{document.body.removeAttribute('data-asm');}catch(e){}
  asmSelId=null;asmEditOcc=null;
  if(!asmOn()){try{asmCtxDraw();}catch(e){}return;}
  const want=!!asm._wantAsm;asm._wantAsm=false;
  setTimeout(()=>{
    try{asmBuildSnapshots();}catch(e){}
    if(want){try{asmEnter();}catch(e){}}else{try{asmCtxDraw();renderTree();}catch(e){}}
  },0);
}
