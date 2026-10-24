/* ---------- composants : arbre de composants, composant actif (V0.6.0 → V0.6.1) ----------
   Comme dans Fusion 360, TOUT est composant. Le fichier est le composant RACINE : une pièce
   complète (esquisses, construction, corps, FAO, PLAN) qui porte en plus des OCCURRENCES de
   composants enfants, eux-mêmes pièces complètes avec leurs propres enfants.
   Tout le code travaille sur UNE pièce globale `doc` (~650 accès) : on la garde, elle devient
   le COMPOSANT ACTIF. Un document sans enfants n'a pas d'assemblage (asm = null, fichier
   identique à avant) ; asmEnsure() le crée au premier composant ajouté.
     asm.comps[] : {id, kind:'comp', name, doc, occ:[], link:null|{…}, of?}
                   link = composant lié à un fichier (47-composants-lies.js) ; of = id du
                   composant lié dont il fait partie (sous-composant venu de son fichier).
                   doc = l'objet pièce complet ; celui du composant actif EST `doc`.
                   occ = occurrences ENFANTS DIRECTES de ce composant (placées dans son repère).
     occ         : {id, comp, name, fr:{o,x,y,z}, fixed, visible, align|null, st, msg}
     asm.root    : composant racine · asm.path : instance éditée = chemin d'occurrences depuis
                   la racine ([] = racine) · asm.active : composant au bout du chemin.
     align       : {src:{path,cg}, dst:{path,cg}, flip, rz, off:[x,y,z]}
                   src : repère du composant placé (path DANS ce composant, [] = lui-même) ;
                   dst : repère cible, relatif au composant PORTEUR (path [] = le porteur : son
                   origine ou un de ses repères de construction — la « géométrie de base »).
                   Associatif : asmResolve() replace tout, de bas en haut.
   Changer de composant (asmActivate) ne passe PAS par docResetEmpty : faoReset supprime
   doc.fao. On ferme les modes, on range l'état d'exécution du composant (annuler, marqueur
   temps, sélection) dans comp._rt, on bascule `doc`, on rejoue. */
let asm=null;
let asmMode='part'; // 'part' : modéliser le composant actif · 'asm' : placer ses enfants (47)
let asmUndoStack=[],asmRedoStack=[];
const ASM_UNDO_MAX=40;
function asmFr0(){return {o:[0,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]};}
function asmEmptyDoc(name){
  return {name:name||'Composant',tint:0,sketches:[],features:[],cgeo:[],bodyVis:{},bodies:[],bodySeq:1,activeBody:null,mep:null};
}
function asmNewOccObj(cid,name,fr){return {id:uid('oc'),comp:cid,name,fr:fr||asmFr0(),fixed:false,visible:true,align:null,st:'ok',msg:''};}
/* ── accès ── */
function asmSync(){
  // Le composant actif doit toujours être `doc` (deserialise, docResetEmpty le remplacent)
  if(!asm)return;
  const c=asm.comps.find(q=>q.id===asm.active)||asmComp(asm.root)||asm.comps[0];
  if(c&&c.doc!==doc)c.doc=doc;
  if(c)asm.active=c.id;
}
function asmComp(id){return asm?asm.comps.find(c=>c.id===id)||null:null;}
function asmRoot(){return asm?asmComp(asm.root):null;}
function asmOcc(id){
  if(!asm||!id)return null;
  for(const c of asm.comps){const o=c.occ.find(q=>q.id===id);if(o)return o;}
  return null;
}
function asmOccOwner(id){return asm?asm.comps.find(c=>c.occ.some(q=>q.id===id))||null:null;}
function asmActiveComp(){asmSync();return asm?asmComp(asm.active):null;}
function asmCompOccs(cid){
  // Toutes les occurrences (où qu'elles soient) du composant cid
  const out=[];if(!asm)return out;
  asm.comps.forEach(c=>c.occ.forEach(o=>{if(o.comp===cid)out.push(o);}));
  return out;
}
function asmEnsure(){
  // Crée l'arbre autour du document courant, qui devient la racine (sans enfants)
  if(asm){asmSync();return asm;}
  const id=uid('cp'),nm=doc.name||'Racine';
  asm={name:nm,root:id,comps:[{id,kind:'comp',name:nm,doc,occ:[],link:null}],path:[],active:id};
  return asm;
}
function asmHasContent(){
  // Faut-il écrire un bloc asm ? (sinon : fichier strictement identique à une pièce seule)
  return !!asm&&(asm.comps.length>1||asm.comps.some(c=>c.occ.length>0));
}
function asmOccName(cid){
  const c=asmComp(cid),base=(c&&c.name)||'Composant';
  let n=0;asmCompOccs(cid).forEach(o=>{const m=/:(\d+)$/.exec(o.name||'');if(m)n=Math.max(n,+m[1]);});
  return base+':'+(n+1);
}
function asmContains(a,b){
  // Le composant a contient-il (à n'importe quelle profondeur) le composant b ? (a===b : oui)
  if(a===b)return true;
  const seen=new Set();
  const go=id=>{if(id===b)return true;if(seen.has(id))return false;seen.add(id);
    const c=asmComp(id);return !!c&&c.occ.some(o=>go(o.comp));};
  return go(a);
}
function asmLinkOwner(c){
  // Composant lié qui possède c (lui-même s'il est lié, sinon celui dont il vient) ou null
  if(!c)return null;if(c.link)return c;return c.of?asmComp(c.of):null;
}
function asmCanPlace(cid,ownerId){
  const c=asmComp(cid),o=asmComp(ownerId);if(!c||!o||asmContains(cid,ownerId))return false;
  // dans un composant lié, seulement ses propres sous-composants (son fichier les décrit)
  const L=asmLinkOwner(o);
  return !L||c.of===L.id;
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
function asmCompFrame(cid,cgId){
  // Repère d'un composant dans SES coordonnées : origine (null) ou repère de construction
  if(!cgId)return asmFr0();
  const c=asmComp(cid);if(!c||!c.doc)return null;
  const k=(c.doc.cgeo||[]).find(q=>q&&q.id===cgId&&q.kind==='frame');
  return k&&k.fr?{o:k.fr.o.slice(),x:k.fr.x.slice(),y:k.fr.y.slice(),z:k.fr.z.slice()}:null;
}
function asmPathFrame(cid,path){
  // Position, dans le repère du composant cid, de l'instance au bout du chemin (relatif) →
  // {F, comp} ; null si le chemin est rompu
  let F=asmFr0(),c=asmComp(cid);
  for(const id of (path||[])){
    if(!c)return null;
    const o=c.occ.find(q=>q.id===id);if(!o)return null;
    F=asmCompose(F,o.fr);c=asmComp(o.comp);
  }
  return c?{F,comp:c.id}:null;
}
function asmRelFrame(cid,rel){
  // Repère {path, cg} relatif au composant cid, exprimé dans le repère de cid
  const r=asmPathFrame(cid,rel&&rel.path);if(!r)return null;
  const G=asmCompFrame(r.comp,rel&&rel.cg);
  return G?asmCompose(r.F,G):null;
}
function asmWorld(path){
  // Repère, dans celui de la racine, de l'instance au bout d'un chemin absolu
  const r=asm?asmPathFrame(asm.root,path):null;
  return r?r.F:null;
}
function asmPathComp(path){const r=asm?asmPathFrame(asm.root,path):null;return r?r.comp:null;}
function asmPathOK(path){return Array.isArray(path)&&!!asmPathComp(path);}
function asmFirstPath(cid){
  // Premier chemin (parcours en largeur depuis la racine) menant à une instance de cid
  if(!asm)return null;
  if(cid===asm.root)return [];
  const q=[[asm.root,[]]],seen=new Set([asm.root]);
  while(q.length){
    const [id,p]=q.shift(),c=asmComp(id);if(!c)continue;
    for(const o of c.occ){
      const np=p.concat(o.id);
      if(o.comp===cid)return np;
      if(!seen.has(o.comp)){seen.add(o.comp);q.push([o.comp,np]);}
    }
  }
  return null;
}
function asmInstances(cid){
  // Toutes les instances de l'arbre sous le composant cid (lui compris) :
  // [{path (relatif à cid), comp, F (dans le repère de cid), depth}] — parcours en profondeur
  const out=[];if(!asm)return out;
  const go=(id,path,F,d,stack)=>{
    out.push({path,comp:id,F,depth:d});
    const c=asmComp(id);if(!c||stack.has(id))return;
    stack.add(id);
    c.occ.forEach(o=>go(o.comp,path.concat(o.id),asmCompose(F,o.fr),d+1,stack));
    stack.delete(id);
  };
  go(cid,[],asmFr0(),0,new Set());
  return out;
}
/* ── alignements ── */
function asmAlignNorm(a){
  // Alignement sous sa forme V0.6.1 (src / dst = {path, cg}) ; null si inutilisable
  if(!a||typeof a!=='object')return null;
  const rel=(r,isDst)=>{
    if(r&&typeof r==='object'&&Array.isArray(r.path))return {path:r.path.filter(x=>typeof x==='string'),cg:typeof r.cg==='string'?r.cg:null};
    if(isDst&&r&&typeof r==='object')return {path:r.occ?[r.occ]:[],cg:r.occ&&typeof r.cg==='string'?r.cg:null}; // V0.6.0 : {occ, cg}
    return {path:[],cg:typeof r==='string'?r:null}; // V0.6.0 : src = cgId | null
  };
  return {src:rel(a.src,false),dst:rel(a.dst,true),flip:!!a.flip,rz:+a.rz||0,off:Array.isArray(a.off)?a.off.map(v=>+v||0):[0,0,0]};
}
function asmAlignTarget(ownerId,a){
  // Repère cible dans le repère du porteur, retournement / rotation / décalage compris
  const T=asmRelFrame(ownerId,a.dst);if(!T)return null;
  // retournement : demi-tour autour du X cible (Z et Y inversés) ; rotation autour du Z cible
  let L=asmFr0();
  if(a.flip)L={o:[0,0,0],x:[1,0,0],y:[0,-1,0],z:[0,0,-1]};
  const r=(+a.rz||0)*Math.PI/180;
  if(r){const c=Math.cos(r),s=Math.sin(r);L=asmCompose({o:[0,0,0],x:[c,s,0],y:[-s,c,0],z:[0,0,1]},L);}
  L.o=Array.isArray(a.off)?a.off.map(v=>+v||0):[0,0,0];
  return asmCompose(T,L);
}
function asmResolveIn(owner){
  // Place les occurrences alignées d'UN porteur, dans l'ordre des dépendances entre frères
  let ch=false;
  const todo=owner.occ.filter(o=>o.align);
  owner.occ.forEach(o=>{if(!o.align){o.st='ok';o.msg='';}});
  const done=new Set(owner.occ.filter(o=>!o.align).map(o=>o.id));
  let progress=true;
  while(todo.length&&progress){
    progress=false;
    for(let i=0;i<todo.length;i++){
      const o=todo[i],a=o.align,dep=a.dst&&a.dst.path&&a.dst.path[0];
      if(dep&&dep!==o.id&&!done.has(dep)&&owner.occ.some(q=>q.id===dep))continue; // cible pas encore placée
      todo.splice(i,1);i--;progress=true;done.add(o.id);
      if(dep===o.id){o.st='warn';o.msg='la cible est dans l’occurrence elle-même';continue;}
      const T=asmAlignTarget(owner.id,a),S=asmRelFrame(o.comp,a.src);
      if(!T||!S){o.st='warn';o.msg=!S?'repère du composant introuvable':'repère cible introuvable';continue;}
      const M=asmRound(asmCompose(T,asmInverse(S)));
      if(['o','x','y','z'].some(k=>M[k].some((v,j)=>Math.abs(v-o.fr[k][j])>1e-9))){o.fr=M;ch=true;}
      o.st='ok';o.msg='';
    }
  }
  todo.forEach(o=>{o.st='warn';o.msg='alignement circulaire : position mémorisée';});
  return ch;
}
function asmResolve(){
  // Tous les alignements, de BAS EN HAUT : la disposition interne d'un enfant ne dépend pas
  // de son parent, elle est donc fixée avant que le parent n'aligne sur ses repères.
  // → true si une occurrence a bougé
  if(!asm)return false;
  let ch=false;const seen=new Set();
  const visit=c=>{
    if(!c||seen.has(c.id))return;seen.add(c.id);
    c.occ.forEach(o=>visit(asmComp(o.comp)));
    if(asmResolveIn(c))ch=true;
  };
  visit(asmRoot());asm.comps.forEach(visit);
  return ch;
}
/* ── composants et occurrences ── */
function asmNewComp(name,ownerId){
  // Nouveau composant vide, avec une occurrence dans le porteur (par défaut : le composant actif)
  asmEnsure();
  const owner=asmComp(ownerId||asm.active);if(!owner)return null;
  asmPush('nouveau composant');
  const nm=name||('Composant '+asm.comps.length);
  const c={id:uid('cp'),kind:'comp',name:nm,doc:asmEmptyDoc(nm),occ:[],link:null};
  const L=asmLinkOwner(owner);if(L)c.of=L.id; // créé dans un composant lié : il en fait partie
  asm.comps.push(c);
  const o=asmNewOccObj(c.id,nm+':1');
  owner.occ.push(o);
  return {comp:c,occ:o,owner};
}
function asmAddOcc(cid,fr,ownerId){
  // Nouvelle occurrence de cid dans le porteur — refusée si cid contient le porteur (cycle)
  asmEnsure();
  const owner=asmComp(ownerId||asm.active);
  if(!owner||!asmCanPlace(cid,owner.id))return null;
  asmPush('nouvelle occurrence');
  const o=asmNewOccObj(cid,asmOccName(cid),fr?asmRound(fr):asmFr0());
  owner.occ.push(o);
  return o;
}
function asmPurge(){
  // Composants plus utilisés nulle part (hors racine) : supprimés, en cascade
  let again=true;
  while(again){
    again=false;
    const used=new Set([asm.root]);asm.comps.forEach(c=>c.occ.forEach(o=>used.add(o.comp)));
    const keep=asm.comps.filter(c=>used.has(c.id));
    if(keep.length<asm.comps.length){asm.comps=keep;again=true;}
  }
}
function asmDeleteOcc(id){
  // Supprimer une occurrence ; un composant qui n'a plus d'instance part avec elle
  const owner=asmOccOwner(id),o=asmOcc(id);if(!o||!owner)return false;
  asmPush('suppression de « '+o.name+' »');
  owner.occ=owner.occ.filter(q=>q.id!==id);
  // les alignements qui passaient par elle tombent (les occurrences gardent leur position)
  asm.comps.forEach(c=>c.occ.forEach(q=>{const a=q.align;
    if(a&&((a.dst&&a.dst.path.includes(id))||(a.src&&a.src.path.includes(id))))q.align=null;}));
  asmPurge();
  // l'instance éditée passait par elle : on remonte au porteur
  const k=asm.path.indexOf(id);
  if(k>=0)asmActivatePath(asm.path.slice(0,k));
  else if(!asmComp(asm.active)||asmPathComp(asm.path)!==asm.active)asmActivatePath([]);
  asmResolve();
  return true;
}
/* ── composant actif ── */
function asmLeavePart(){
  // Ferme tout ce qui tient un état sur le composant courant, SANS toucher à son document
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
  const c=asmActiveComp();
  if(c)c._rt={undo:docUndoStack,redo:docRedoStack,tl:tlMark,sel:Object.assign({},sel),abody:doc.activeBody};
}
function asmActivatePath(path){
  // Édite l'instance au bout du chemin (absolu) : son composant devient `doc`
  asmEnsure();
  const p=asmPathOK(path)?path.slice():[];
  const cid=asmPathComp(p);
  asm.path=p;
  return asmActivate(cid,p);
}
function asmActivate(cid,path){
  // Bascule le composant actif : son document devient `doc`, son état d'exécution revient.
  // path : instance éditée (par défaut : la courante si elle est de ce composant, sinon la première)
  asmEnsure();
  const c=asmComp(cid);if(!c)return false;
  if(path&&asmPathComp(path)===cid)asm.path=path.slice();
  else if(asmPathComp(asm.path)!==cid)asm.path=asmFirstPath(cid)||[];
  if(c.id===asm.active&&c.doc===doc)return true;
  asmLeavePart();
  asm.active=c.id;doc=c.doc;
  if(!c._sane){
    // Première activation : mêmes réparations qu'à l'ouverture d'un fichier (deserialise) —
    // instances de répétition en double ou en trop, puis régénération (elles sont dérivées)
    c._sane=true;
    try{docSanitise();}catch(e){}
    try{doc.features.filter(f=>f.type==='repeat').forEach(f=>{try{repGenChildren(f);}catch(e){}});}catch(e){}
  }
  const rt=c._rt||{};
  docUndoStack=rt.undo||[];docRedoStack=rt.redo||[];
  tlMark=rt.tl||null;
  sel=rt.sel&&rt.sel.kind?rt.sel:{kind:null,id:null};
  if(typeof treeSel!=='undefined')treeSel=[];
  occSkipFeat=null;
  builtVersion=-1;builtHash=null;builtEngine=null;_hashMemo=null;
  // _docVersion++ et non markDirty() : changer de composant n'est pas une modification du document
  try{_docVersion++;rebuild();}catch(e){}
  try{renderTree();renderProps();docUndoUI();}catch(e){}
  try{if(typeof faoRefreshFaoUI==='function')faoRefreshFaoUI();}catch(e){}
  try{if(typeof faoRefreshPreview==='function')faoRefreshPreview();}catch(e){}
  try{buildEdgeOverlay();}catch(e){}
  asmNotify(true);
  return true;
}
function asmCkPrefix(){
  // Points de contrôle du noyau : clés préfixées par le composant (deux composants peuvent
  // avoir un corps « b1 » aux signatures identiques). Composant seul : aucun préfixe (inchangé).
  return asm&&asm.comps.length>1?asm.active+'§':'';
}
/* ── annuler / rétablir de l'ASSEMBLAGE (positions, composants, occurrences) ──
   Les documents des composants ont leur propre annulation ; une opération qui modifie AUSSI
   des documents (composant depuis un corps, déplacer vers un composant) les nomme (docs) :
   leur contenu est alors pris dans l'instantané, et Ctrl+Z en mode pièce passe par ici quand
   elle est la plus récente (horloge undoTick, 45). */
function asmDocSnapOf(d){
  // Comme docSnap (45), pour n'importe quel document : sans les transitoires
  const c=Object.assign({},d);
  c.sketches=(d.sketches||[]).map(s=>{const o=Object.assign({},s);delete o._refs;return o;});
  c.features=(d.features||[]).map(({_mesh,_m,...r})=>r);
  c.cgeo=(d.cgeo||[]).map(cgClean);
  return JSON.stringify(c);
}
function asmSnap(docIds){
  // Occurrences copiées ; composants par RÉFÉRENCE ; documents nommés copiés
  if(!asm)return null;
  const occ={};asm.comps.forEach(c=>{occ[c.id]=JSON.parse(JSON.stringify(c.occ));});
  const docs={};(docIds||[]).forEach(id=>{const c=asmComp(id);if(c&&c.doc)docs[id]=asmDocSnapOf(c.doc);});
  return {occ,comps:asm.comps.slice(),active:asm.active,path:asm.path.slice(),docs};
}
function asmPush(label,docIds){
  const s=asmSnap(docIds);if(!s)return;
  asmUndoStack.push({snap:s,label:label||'assemblage',docIds:docIds||[],t:++undoTick});
  while(asmUndoStack.length>ASM_UNDO_MAX)asmUndoStack.shift();
  asmRedoStack.length=0;
}
function asmUndoFirst(redo){
  // Mode pièce : la dernière opération est-elle une opération d'assemblage qui a modifié ce
  // document ? (sinon Ctrl+Z reste l'annulation du document)
  if(!asm)return false;
  const A=redo?asmRedoStack:asmUndoStack,D=redo?docRedoStack:docUndoStack;
  const a=A[A.length-1],d=D[D.length-1];
  return !!a&&(a.docIds||[]).includes(asm.active)&&(!d||(a.t||0)>(d.t||0));
}
function asmRestore(s){
  asm.comps=s.comps;asm.comps.forEach(c=>{if(s.occ[c.id])c.occ=s.occ[c.id];});
  const touched=[];
  Object.keys(s.docs||{}).forEach(id=>{
    const c=asmComp(id);if(!c)return;
    if(c.doc===doc){try{docApplySnap(s.docs[id]);}catch(e){}}
    else{try{const d=JSON.parse(s.docs[id]);Object.keys(d).forEach(k=>{c.doc[k]=d[k];});}catch(e){}}
    touched.push(c);
  });
  if(!asmComp(asm.active)||!asm.comps.some(c=>c.doc===doc)||!asmPathOK(asm.path)){
    asmActivatePath(asmPathOK(s.path)?s.path:[]);
  }
  touched.forEach(c=>{
    if(c.doc===doc){try{builtVersion=-1;builtHash=null;markDirty();rebuild();}catch(e){}}
    else c._stale=true; // instantané d'affichage à refaire (47)
  });
  asmResolve();asmNotify();
}
function asmUndo(){
  const e=asmUndoStack.pop();if(!e||!asm)return false;
  asmRedoStack.push({snap:asmSnap(e.docIds),label:e.label,docIds:e.docIds,t:++undoTick});asmRestore(e.snap);
  try{faceEl.textContent='↩ Annulé : '+e.label;}catch(err){}
  return true;
}
function asmRedo(){
  const e=asmRedoStack.pop();if(!e||!asm)return false;
  asmUndoStack.push({snap:asmSnap(e.docIds),label:e.label,docIds:e.docIds,t:++undoTick});asmRestore(e.snap);
  try{faceEl.textContent='↪ Rétabli : '+e.label;}catch(err){}
  return true;
}
function asmNotify(viewOnly){
  // Prévient l'interface d'assemblage (47) — sans en dépendre : le modèle se teste seul.
  // viewOnly : rien n'a changé dans le document (bascule de composant), juste l'affichage.
  const f=globalThis.asmOnChange;if(typeof f==='function'){try{f(!!viewOnly);}catch(e){}}
}
/* ── sauvegarde : bloc asm (v2) dans le fichier (doc = composant actif, compatibilité) ── */
function asmOccSerial(o){return {id:o.id,comp:o.comp,name:o.name,fr:o.fr,fixed:!!o.fixed,visible:o.visible!==false,align:o.align||null};}
function asmSerial(){
  if(!asmHasContent())return null;
  asmSync();
  const comps=asm.comps.map(c=>({id:c.id,kind:'comp',name:c.name,doc:c.doc===doc?null:serialiseObj(c.doc,false),
    occ:c.occ.map(asmOccSerial),link:asmLinkSerial(c.link,c),of:c.of||undefined}));
  return {v:2,name:asm.name,root:asm.root,active:asm.active,path:asm.path.slice(),mode:asmMode,comps};
}
function asmLinkSerial(l,c){
  // Lien enregistré sans son état d'exécution (st, msg) ; pend : modifié ici et pas encore écrit
  // dans sa source (l'empreinte de référence est recalculée à l'ouverture, 47-composants-lies)
  if(!l||typeof l!=='object')return null;
  const o={};Object.keys(l).forEach(k=>{if(k!=='st'&&k!=='msg'&&k!=='pend'&&k!=='base'&&k[0]!=='_')o[k]=l[k];});
  if(c){try{if(asmLinkDirty(c))o.pend=true;}catch(e){}}
  return o;
}
function asmTreeFromSerial(a,topDoc,mkDoc){
  // Arbre de composants depuis un bloc asm (v2, ou v1 de V0.6.0 migré) ; topDoc = document du
  // premier niveau (= composant actif du fichier). → {name, root, comps, active, path, wantAsm}
  // ou null. Sans effet de bord : sert à l'ouverture ET à l'insertion d'un fichier.
  mkDoc=mkDoc||docFromSerial;
  if(!a||typeof a!=='object')return null;
  const okFr=f=>f&&['o','x','y','z'].every(k=>Array.isArray(f[k])&&f[k].length===3&&f[k].every(v=>isFinite(+v)));
  const fr=f=>okFr(f)?{o:f.o.map(Number),x:f.x.map(Number),y:f.y.map(Number),z:f.z.map(Number)}:asmFr0();
  const occOf=(o,cidKey)=>({id:String(o.id),comp:String(o[cidKey]),name:String(o.name||o.id),fr:fr(o.fr),fixed:!!o.fixed,
    visible:o.visible!==false,align:asmAlignNorm(o.align),st:'ok',msg:''});
  let comps,root;
  if(Array.isArray(a.comps)&&a.comps.length){
    comps=a.comps.filter(c=>c&&typeof c.id==='string').map(c=>({id:c.id,kind:'comp',name:String(c.name||c.id),
      doc:c.doc==null?topDoc:mkDoc(c.doc),occ:(Array.isArray(c.occ)?c.occ:[]).filter(o=>o&&typeof o.id==='string').map(o=>occOf(o,'comp')),
      link:(c.link&&typeof c.link==='object')?c.link:null,of:typeof c.of==='string'?c.of:undefined}));
    root=comps.some(c=>c.id===a.root)?a.root:comps[0].id;
  }else if(Array.isArray(a.parts)&&a.parts.length&&Array.isArray(a.occ)){
    // V0.6.0 (v1) : un seul niveau, sans géométrie d'assemblage → racine vide portant les occurrences
    comps=a.parts.filter(p=>p&&typeof p.id==='string').map(p=>({id:p.id,kind:'comp',name:String(p.name||p.id),
      doc:p.doc==null?topDoc:mkDoc(p.doc),occ:[],link:null}));
    const nm=String(a.name||'Assemblage');
    root=uid('cp');
    comps.unshift({id:root,kind:'comp',name:nm,doc:asmEmptyDoc(nm),occ:a.occ.filter(o=>o&&typeof o.id==='string').map(o=>occOf(o,'part')),link:null});
  }else return null;
  if(!comps.some(c=>c.doc===topDoc)){const r=comps.find(c=>c.id===root);r.doc=topDoc;} // fichier abîmé
  // occurrences de composants inconnus : écartées ; parcours en profondeur depuis la racine :
  // une occurrence qui ramène à un composant en cours de parcours ferait un cycle → écartée
  const ids=new Set(comps.map(c=>c.id)),byId=new Map(comps.map(c=>[c.id,c]));
  comps.forEach(c=>{c.occ=c.occ.filter(o=>ids.has(o.comp));});
  const onStack=new Set(),done=new Set();
  const dfs=id=>{onStack.add(id);const c=byId.get(id);
    c.occ=c.occ.filter(o=>{if(onStack.has(o.comp))return false;if(!done.has(o.comp))dfs(o.comp);return true;});
    onStack.delete(id);done.add(id);};
  dfs(root);
  // un composant inaccessible depuis la racine en reçoit une occurrence (sinon invisible)
  comps.forEach(c=>{if(!done.has(c.id)){byId.get(root).occ.push(asmNewOccObj(c.id,c.name+':1'));onStack.add(root);dfs(c.id);onStack.delete(root);}});
  const act=comps.find(c=>c.doc===topDoc);
  return {name:String(a.name||topDoc.name||'Assemblage'),root,comps,active:act.id,
    path:Array.isArray(a.path)?a.path.filter(x=>typeof x==='string'):null,wantAsm:a.mode==='asm'};
}
function asmFromSerial(a){
  // Reconstruit l'arbre à l'ouverture ; `doc` (déjà chargé) est le composant actif
  asm=null;asmMode='part';asmUndoStack=[];asmRedoStack=[];
  const t=asmTreeFromSerial(a,doc);if(!t)return false;
  asm={name:t.name,root:t.root,comps:t.comps,path:[],active:t.active};
  asm.path=(t.path&&asmPathComp(t.path)===t.active)?t.path:(asmFirstPath(t.active)||[]);
  // la vue d'assemblage demande les instantanés de tous les composants : rétablie après le
  // chargement (asmAfterLoad, 47), on ouvre donc toujours en mode Modéliser
  asm._wantAsm=t.wantAsm;
  asmResolve();
  return true;
}
function asmAllDocs(){
  // Tous les documents de composant (pièce seule : [doc]) — trajectoires FAO, imports du bundle
  return asm?asm.comps.map(c=>c.doc).filter(Boolean):[doc];
}
