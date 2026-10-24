/* ---------- assemblage : pièces, occurrences, pièce active (V0.6.0) ----------
   Tout le code travaille sur UNE pièce globale `doc` (~650 accès) : on la garde, elle
   devient la PIÈCE ACTIVE, et l'assemblage vit à côté. Un document d'une seule pièce
   n'a pas d'assemblage (asm = null, fichier identique à avant) ; asmEnsure() le crée
   à la première pièce ajoutée.
     asm.parts[] : {id, kind:'part' ('asm' réservé aux sous-assemblages), name, doc}
                   doc = l'objet pièce complet ; celui de la pièce active EST `doc`.
     asm.occ[]   : {id, part, name, fr:{o,x,y,z}, fixed, visible, align|null, st, msg}
                   fr = position de l'occurrence (repère direct dans l'assemblage).
     align       : {src:cgId|null, dst:{occ:occId|null, cg:cgId|null}, flip, rz, off:[x,y,z]}
                   repère src de la pièce posé sur le repère cible (origine de
                   l'assemblage, ou repère d'une autre occurrence) — associatif : si
                   une pièce change, son repère bouge et asmResolve() replace tout.
   Changer de pièce (asmActivate) ne passe PAS par docResetEmpty : faoReset supprime
   doc.fao. On ferme les modes, on range l'état d'exécution de la pièce (annuler,
   marqueur temps, sélection) dans part._rt, on bascule `doc`, on rejoue. */
let asm=null;
let asmMode='part'; // 'part' : édition de la pièce active · 'asm' : vue d'assemblage (47)
let asmUndoStack=[],asmRedoStack=[];
const ASM_UNDO_MAX=40;
function asmFr0(){return {o:[0,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]};}
function asmEmptyDoc(name){
  return {name:name||'Pièce',tint:0,sketches:[],features:[],cgeo:[],bodyVis:{},bodies:[],bodySeq:1,activeBody:null,mep:null};
}
/* ── accès ── */
function asmSync(){
  // La pièce active doit toujours être `doc` (deserialise, docResetEmpty le remplacent)
  if(!asm)return;
  const p=asm.parts.find(q=>q.id===asm.active)||asm.parts[0];
  if(p&&p.doc!==doc)p.doc=doc;
  if(p)asm.active=p.id;
}
function asmPart(id){return asm?asm.parts.find(p=>p.id===id)||null:null;}
function asmOcc(id){return asm?asm.occ.find(o=>o.id===id)||null:null;}
function asmActivePart(){asmSync();return asm?asmPart(asm.active):null;}
function asmPartOccs(pid){return asm?asm.occ.filter(o=>o.part===pid):[];}
function asmEnsure(){
  // Crée l'assemblage autour de la pièce courante (une occurrence fixée à l'origine)
  if(asm){asmSync();return asm;}
  const pid=uid('pc'),nm=doc.name||'Pièce 1';
  asm={name:nm,parts:[{id:pid,kind:'part',name:nm,doc}],
    occ:[{id:uid('oc'),part:pid,name:nm+':1',fr:asmFr0(),fixed:true,visible:true,align:null,st:'ok',msg:''}],
    active:pid};
  return asm;
}
function asmHasContent(){
  // Faut-il écrire un bloc asm ? (sinon : fichier strictement identique à une pièce seule)
  if(!asm)return false;
  if(asm.parts.length>1||asm.occ.length>1)return true;
  const o=asm.occ[0];if(!o)return false;
  const I=asmFr0();
  return !['o','x','y','z'].every(k=>o.fr[k].every((v,i)=>Math.abs(v-I[k][i])<1e-12));
}
function asmOccName(pid){
  const p=asmPart(pid),base=(p&&p.name)||'Pièce';
  let n=0;asmPartOccs(pid).forEach(o=>{const m=/:(\d+)$/.exec(o.name||'');if(m)n=Math.max(n,+m[1]);});
  return base+':'+(n+1);
}
/* ── repères (algèbre des déplacements rigides, tableaux [x,y,z]) ── */
function asmApply(F,p){return [F.o[0]+F.x[0]*p[0]+F.y[0]*p[1]+F.z[0]*p[2],F.o[1]+F.x[1]*p[0]+F.y[1]*p[1]+F.z[1]*p[2],F.o[2]+F.x[2]*p[0]+F.y[2]*p[1]+F.z[2]*p[2]];}
function asmRot(F,v){return [F.x[0]*v[0]+F.y[0]*v[1]+F.z[0]*v[2],F.x[1]*v[0]+F.y[1]*v[1]+F.z[1]*v[2],F.x[2]*v[0]+F.y[2]*v[1]+F.z[2]*v[2]];}
function asmCompose(A,B){return {o:asmApply(A,B.o),x:asmRot(A,B.x),y:asmRot(A,B.y),z:asmRot(A,B.z)};}
function asmInverse(F){
  // R⁻¹ = Rᵀ : les axes de l'inverse sont les LIGNES de R
  const x=[F.x[0],F.y[0],F.z[0]],y=[F.x[1],F.y[1],F.z[1]],z=[F.x[2],F.y[2],F.z[2]];
  const o=[-(x[0]*F.o[0]+y[0]*F.o[1]+z[0]*F.o[2]),-(x[1]*F.o[0]+y[1]*F.o[1]+z[1]*F.o[2]),-(x[2]*F.o[0]+y[2]*F.o[1]+z[2]*F.o[2])];
  return {o,x,y,z};
}
function asmRound(F){const r=v=>v.map(a=>{const b=Math.round(a*1e9)/1e9;return Object.is(b,-0)?0:b;});return {o:r(F.o),x:r(F.x),y:r(F.y),z:r(F.z)};}
function asmPartFrame(pid,cgId){
  // Repère d'une pièce dans SES coordonnées : origine (null) ou repère de construction
  if(!cgId)return asmFr0();
  const p=asmPart(pid);if(!p||!p.doc)return null;
  const c=(p.doc.cgeo||[]).find(k=>k&&k.id===cgId&&k.kind==='frame');
  return c&&c.fr?{o:c.fr.o.slice(),x:c.fr.x.slice(),y:c.fr.y.slice(),z:c.fr.z.slice()}:null;
}
function asmAlignTarget(a){
  // Repère cible dans l'assemblage, retournement / rotation / décalage compris
  let T;
  if(!a.dst||!a.dst.occ)T=asmFr0();
  else{
    const d=asmOcc(a.dst.occ);if(!d)return null;
    const Fp=asmPartFrame(d.part,a.dst.cg);if(!Fp)return null;
    T=asmCompose(d.fr,Fp);
  }
  // retournement : demi-tour autour du X cible (Z et Y inversés) ; rotation autour du Z cible
  let L=asmFr0();
  if(a.flip)L={o:[0,0,0],x:[1,0,0],y:[0,-1,0],z:[0,0,-1]};
  const r=(+a.rz||0)*Math.PI/180;
  if(r){const c=Math.cos(r),s=Math.sin(r);L=asmCompose({o:[0,0,0],x:[c,s,0],y:[-s,c,0],z:[0,0,1]},L);}
  const off=Array.isArray(a.off)?a.off.map(v=>+v||0):[0,0,0];
  L.o=off;
  return asmCompose(T,L);
}
function asmResolve(){
  // Place les occurrences alignées, dans l'ordre des dépendances. → true si une a bougé
  if(!asm)return false;
  let ch=false;
  const todo=asm.occ.filter(o=>o.align);
  asm.occ.forEach(o=>{if(!o.align){o.st='ok';o.msg='';}});
  const done=new Set(asm.occ.filter(o=>!o.align).map(o=>o.id));
  let progress=true;
  while(todo.length&&progress){
    progress=false;
    for(let i=0;i<todo.length;i++){
      const o=todo[i],a=o.align,dep=a.dst&&a.dst.occ;
      if(dep&&!done.has(dep)&&asmOcc(dep))continue; // cible pas encore placée
      todo.splice(i,1);i--;progress=true;done.add(o.id);
      const T=asmAlignTarget(a),S=asmPartFrame(o.part,a.src);
      if(!T||!S){o.st='warn';o.msg=!S?'repère de la pièce introuvable':'repère cible introuvable';continue;}
      const M=asmRound(asmCompose(T,asmInverse(S)));
      if(['o','x','y','z'].some(k=>M[k].some((v,j)=>Math.abs(v-o.fr[k][j])>1e-9))){o.fr=M;ch=true;}
      o.st='ok';o.msg='';
    }
  }
  todo.forEach(o=>{o.st='warn';o.msg='alignement circulaire : position mémorisée';});
  return ch;
}
/* ── pièces et occurrences ── */
function asmNewPart(name){
  asmEnsure();
  asmPush('nouvelle pièce');
  const nm=name||('Pièce '+(asm.parts.length+1));
  const p={id:uid('pc'),kind:'part',name:nm,doc:asmEmptyDoc(nm)};
  asm.parts.push(p);
  const o={id:uid('oc'),part:p.id,name:nm+':1',fr:asmFr0(),fixed:false,visible:true,align:null,st:'ok',msg:''};
  asm.occ.push(o);
  return {part:p,occ:o};
}
function asmAddOcc(pid,fr){
  asmEnsure();if(!asmPart(pid))return null;
  asmPush('nouvelle occurrence');
  const o={id:uid('oc'),part:pid,name:asmOccName(pid),fr:fr?asmRound(fr):asmFr0(),fixed:false,visible:true,align:null,st:'ok',msg:''};
  asm.occ.push(o);
  return o;
}
function asmDeleteOcc(id){
  // Supprimer la dernière occurrence d'une pièce supprime la pièce (pas la dernière pièce)
  const o=asmOcc(id);if(!o)return false;
  const seule=asmPartOccs(o.part).length===1;
  if(seule&&asm.parts.length===1)return false;
  asmPush('suppression de « '+o.name+' »');
  asm.occ=asm.occ.filter(q=>q.id!==id);
  asm.occ.forEach(q=>{if(q.align&&q.align.dst&&q.align.dst.occ===id){q.align=null;}}); // gardent leur position
  if(seule){
    if(asm.active===o.part){const autre=asm.parts.find(p=>p.id!==o.part);if(autre)asmActivate(autre.id);}
    asm.parts=asm.parts.filter(p=>p.id!==o.part);
  }
  asmResolve();
  return true;
}
/* ── pièce active ── */
function asmLeavePart(){
  // Ferme tout ce qui tient un état sur la pièce courante, SANS toucher à son document
  try{if(typeof skEdit!=='undefined'&&skEdit)closeSketch(true);}catch(e){}
  try{if(typeof cgMode!=='undefined'&&cgMode)cgCancel();}catch(e){}
  try{if(filMode)exitFilletMode(true);}catch(e){}
  try{if(filModeX)exitExactFilletMode(true);}catch(e){}
  try{if(typeof draftMode!=='undefined'&&draftMode)exitDraftMode(true);}catch(e){}
  try{if(typeof coqueMode!=='undefined'&&coqueMode)exitCoqueMode(true);}catch(e){}
  try{if(typeof repMode!=='undefined'&&repMode)exitRepMode();}catch(e){}
  try{if(typeof mvMode!=='undefined'&&mvMode)exitMoveFaceMode(true);}catch(e){}
  try{if(typeof extNew!=='undefined'&&extNew)extNew=null;}catch(e){}
  try{if(typeof revNew!=='undefined'&&revNew)revNew=null;}catch(e){}
  try{if(typeof faoVw!=='undefined'&&faoVw)faoViewerClose();}catch(e){}
  try{if(typeof faoToolsWin!=='undefined'&&faoToolsWin)faoToolsWindowClose();}catch(e){}
  try{if(typeof mepIsOpen==='function'&&mepIsOpen()&&typeof mepReset==='function')mepReset();}catch(e){}
  const p=asmActivePart();
  if(p)p._rt={undo:docUndoStack,redo:docRedoStack,tl:tlMark,sel:Object.assign({},sel),abody:doc.activeBody};
}
function asmActivate(pid){
  // Bascule la pièce active : son document devient `doc`, son état d'exécution revient
  asmEnsure();
  const p=asmPart(pid);if(!p)return false;
  if(p.id===asm.active&&p.doc===doc)return true;
  asmLeavePart();
  asm.active=p.id;doc=p.doc;
  const rt=p._rt||{};
  docUndoStack=rt.undo||[];docRedoStack=rt.redo||[];
  tlMark=rt.tl||null;
  sel=rt.sel&&rt.sel.kind?rt.sel:{kind:null,id:null};
  if(typeof treeSel!=='undefined')treeSel=[];
  occSkipFeat=null;
  builtVersion=-1;builtHash=null;builtEngine=null;_hashMemo=null;
  // _docVersion++ et non markDirty() : changer de pièce n'est pas une modification du document
  try{_docVersion++;rebuild();}catch(e){}
  try{renderTree();renderProps();docUndoUI();}catch(e){}
  try{if(typeof faoRefreshFaoUI==='function')faoRefreshFaoUI();}catch(e){}
  try{if(typeof faoRefreshPreview==='function')faoRefreshPreview();}catch(e){}
  try{buildEdgeOverlay();}catch(e){}
  asmNotify(true);
  return true;
}
function asmCkPrefix(){
  // Points de contrôle du noyau : clés préfixées par la pièce (deux pièces peuvent avoir un
  // corps « b1 » aux signatures identiques). Pièce seule : aucun préfixe (inchangé).
  return asm&&asm.parts.length>1?asm.active+'§':'';
}
/* ── annuler / rétablir de l'ASSEMBLAGE (positions, pièces, occurrences) ── */
function asmSnap(){
  // Occurrences copiées ; pièces par RÉFÉRENCE (leurs documents ont leur propre annulation)
  return asm?{occ:JSON.parse(JSON.stringify(asm.occ)),parts:asm.parts.slice(),active:asm.active}:null;
}
function asmPush(label){
  const s=asmSnap();if(!s)return;
  asmUndoStack.push({snap:s,label:label||'assemblage'});
  while(asmUndoStack.length>ASM_UNDO_MAX)asmUndoStack.shift();
  asmRedoStack.length=0;
}
function asmRestore(s){
  asm.occ=s.occ;asm.parts=s.parts;
  if(!asmPart(asm.active)||!asm.parts.some(p=>p.doc===doc)){const a=asmPart(s.active)||asm.parts[0];if(a)asmActivate(a.id);}
  asmResolve();asmNotify();
}
function asmUndo(){
  const e=asmUndoStack.pop();if(!e||!asm)return false;
  asmRedoStack.push({snap:asmSnap(),label:e.label});asmRestore(e.snap);
  try{faceEl.textContent='↩ Annulé : '+e.label;}catch(err){}
  return true;
}
function asmRedo(){
  const e=asmRedoStack.pop();if(!e||!asm)return false;
  asmUndoStack.push({snap:asmSnap(),label:e.label});asmRestore(e.snap);
  try{faceEl.textContent='↪ Rétabli : '+e.label;}catch(err){}
  return true;
}
function asmNotify(viewOnly){
  // Prévient l'interface d'assemblage (47) — sans en dépendre : le modèle se teste seul.
  // viewOnly : rien n'a changé dans le document (bascule de pièce), juste l'affichage.
  const f=globalThis.asmOnChange;if(typeof f==='function'){try{f(!!viewOnly);}catch(e){}}
}
/* ── sauvegarde : bloc asm dans le fichier (doc = pièce active, compatibilité) ── */
function asmSerial(){
  if(!asmHasContent())return null;
  asmSync();
  const occ=asm.occ.map(o=>({id:o.id,part:o.part,name:o.name,fr:o.fr,fixed:!!o.fixed,visible:o.visible!==false,align:o.align||null}));
  const parts=asm.parts.map(p=>({id:p.id,kind:p.kind||'part',name:p.name,doc:p.doc===doc?null:serialiseObj(p.doc,false)}));
  return {v:1,name:asm.name,active:asm.active,mode:asmMode,occ,parts};
}
function asmFromSerial(a){
  // Reconstruit l'assemblage à l'ouverture ; `doc` (déjà chargé) est la pièce active
  asm=null;asmMode='part';asmUndoStack=[];asmRedoStack=[];
  if(!a||!Array.isArray(a.parts)||!Array.isArray(a.occ)||!a.parts.length)return false;
  const parts=a.parts.filter(p=>p&&typeof p.id==='string').map(p=>({id:p.id,kind:p.kind==='asm'?'asm':'part',name:String(p.name||p.id),
    doc:p.doc==null?doc:docFromSerial(p.doc)}));
  if(!parts.some(p=>p.doc===doc)){parts[0].doc=doc;} // fichier abîmé : la pièce active reste la pièce chargée
  const ids=new Set(parts.map(p=>p.id));
  const okFr=f=>f&&['o','x','y','z'].every(k=>Array.isArray(f[k])&&f[k].length===3&&f[k].every(v=>isFinite(+v)));
  const occ=a.occ.filter(o=>o&&typeof o.id==='string'&&ids.has(o.part)).map(o=>({id:o.id,part:o.part,name:String(o.name||o.id),
    fr:okFr(o.fr)?{o:o.fr.o.map(Number),x:o.fr.x.map(Number),y:o.fr.y.map(Number),z:o.fr.z.map(Number)}:asmFr0(),
    fixed:!!o.fixed,visible:o.visible!==false,align:(o.align&&typeof o.align==='object')?o.align:null,st:'ok',msg:''}));
  // une pièce sans occurrence en reçoit une (sinon elle serait invisible et inaccessible)
  parts.forEach(p=>{if(!occ.some(o=>o.part===p.id))occ.push({id:uid('oc'),part:p.id,name:p.name+':1',fr:asmFr0(),fixed:false,visible:true,align:null,st:'ok',msg:''});});
  const act=parts.find(p=>p.doc===doc);
  asm={name:String(a.name||doc.name||'Assemblage'),parts,occ,active:act.id};
  // la vue d'assemblage demande les instantanés de toutes les pièces : rétablie après le
  // chargement (asmAfterLoad, 47), on ouvre donc toujours en mode pièce
  asmMode='part';asm._wantAsm=a.mode==='asm';
  asmResolve();
  return true;
}
function asmAllDocs(){
  // Tous les documents de pièce (pièce seule : [doc]) — trajectoires FAO, imports du bundle
  return asm?asm.parts.map(p=>p.doc).filter(Boolean):[doc];
}
