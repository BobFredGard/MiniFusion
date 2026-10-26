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
  // point d'accroche de la géométrie (V0.7.2, 48-assemblage-accroches) ou repère
  const G=rel&&rel.sn?asmSnapFrame(r.comp,rel.sn):asmCompFrame(r.comp,rel&&rel.cg);
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
  const okFr=f=>f&&['o','x','y','z'].every(k=>Array.isArray(f[k])&&f[k].length===3&&f[k].every(v=>isFinite(+v)));
  const okV=v=>Array.isArray(v)&&v.length===3&&v.every(x=>isFinite(+x));
  const sn=s=>{ // point d'accroche (V0.7.2) : signature de face, point, arête, dernier repère
    if(!s||typeof s!=='object'||!okFr(s.fr)||typeof s.w!=='string'||!s.f||!okV(s.f.c)||!okV(s.f.n)||(s.f.k!=='plane'&&s.f.k!=='cyl'))return null;
    const o={f:{k:s.f.k,c:s.f.c.map(Number),n:s.f.n.map(Number)},w:s.w,fr:s.fr,name:typeof s.name==='string'?s.name:'Point d’accroche'};
    if(s.f.k==='cyl'&&isFinite(+s.f.r))o.f.r=+s.f.r;
    if(s.e&&(s.e.k==='line'||s.e.k==='circ')&&okV(s.e.m)){o.e={k:s.e.k,m:s.e.m.map(Number)};if(isFinite(+s.e.r))o.e.r=+s.e.r;}
    return o;
  };
  const rel=(r,isDst)=>{
    if(r&&typeof r==='object'&&Array.isArray(r.path)){const o={path:r.path.filter(x=>typeof x==='string'),cg:typeof r.cg==='string'?r.cg:null};
      const s=sn(r.sn);if(s){o.sn=s;o.cg=null;}return o;}
    if(isDst&&r&&typeof r==='object')return {path:r.occ?[r.occ]:[],cg:r.occ&&typeof r.cg==='string'?r.cg:null}; // V0.6.0 : {occ, cg}
    return {path:[],cg:typeof r==='string'?r:null}; // V0.6.0 : src = cgId | null
  };
  const out={src:rel(a.src,false),dst:rel(a.dst,true),flip:!!a.flip,rz:+a.rz||0,off:Array.isArray(a.off)?a.off.map(v=>+v||0):[0,0,0]};
  // liaison (V0.6.5) : type, valeurs des degrés de liberté, limites, position de repos ;
  // rel / sfr : repères explicites d'une liaison « telle que construite »
  if(ASM_JOINTS[a.type]&&a.type!=='rigid')out.type=a.type;
  const num=o=>{const r={};if(o&&typeof o==='object')Object.keys(o).forEach(k=>{if(ASM_DOF_KEYS.includes(k)&&isFinite(+o[k]))r[k]=+o[k];});return r;};
  if(a.q)out.q=num(a.q);if(a.q0)out.q0=num(a.q0);
  if(a.lim&&typeof a.lim==='object'){out.lim={};Object.keys(a.lim).forEach(k=>{const l=a.lim[k];if(ASM_DOF_KEYS.includes(k)&&Array.isArray(l)&&l.length===2&&l.every(v=>isFinite(+v)))out.lim[k]=[+l[0],+l[1]];});}
  if(okFr(a.rel))out.rel=a.rel;if(okFr(a.sfr))out.sfr=a.sfr;
  return out;
}
/* ── liaisons mécaniques (V0.6.5) ──
   Une liaison est un alignement qui laisse des degrés de liberté, autour / le long des axes du
   repère de liaison (celui de la cible, retournement / rotation / décalage compris) :
     M = T · J(q) · S⁻¹   (rigide : J = identité — l'alignement de V0.6.0)
   Résolution directe, dans l'ordre des dépendances : chaque occurrence a au plus une liaison
   vers ce qui la porte ; une boucle fermée donne ⚠ (pas de solveur). */
const ASM_JOINTS={
  rigid:{lab:'Rigide',dof:[]},
  revolute:{lab:'Pivot',dof:['rz']},
  slider:{lab:'Glissière',dof:['tz']},
  cylindrical:{lab:'Pivot glissant',dof:['rz','tz']},
  planar:{lab:'Plan',dof:['tx','ty','rz']},
  ball:{lab:'Rotule',dof:['rx','ry','rz']}
};
const ASM_DOF_KEYS=['tx','ty','tz','rx','ry','rz'];
const ASM_DOF_LAB={tx:'Translation X',ty:'Translation Y',tz:'Translation Z',rx:'Rotation X',ry:'Rotation Y',rz:'Rotation Z'};
function asmDofs(a){return (ASM_JOINTS[(a&&a.type)||'rigid']||ASM_JOINTS.rigid).dof;}
function asmDofClamp(a,k,v){
  const l=a&&a.lim&&a.lim[k];v=+v||0;
  return l?Math.min(Math.max(v,Math.min(l[0],l[1])),Math.max(l[0],l[1])):v;
}
function asmJointFrame(a){
  // J(q) : translation (tx, ty, tz) puis rotations Rz·Ry·Rx (degrés), limites appliquées
  const q={};asmDofs(a).forEach(k=>{q[k]=asmDofClamp(a,k,a.q&&a.q[k]);});
  const r=k=>(q[k]||0)*Math.PI/180;
  const Rx=t=>({o:[0,0,0],x:[1,0,0],y:[0,Math.cos(t),Math.sin(t)],z:[0,-Math.sin(t),Math.cos(t)]});
  const Ry=t=>({o:[0,0,0],x:[Math.cos(t),0,-Math.sin(t)],y:[0,1,0],z:[Math.sin(t),0,Math.cos(t)]});
  const Rz=t=>({o:[0,0,0],x:[Math.cos(t),Math.sin(t),0],y:[-Math.sin(t),Math.cos(t),0],z:[0,0,1]});
  const R=asmCompose(Rz(r('rz')),asmCompose(Ry(r('ry')),Rx(r('rx'))));
  R.o=[q.tx||0,q.ty||0,q.tz||0];
  return R;
}
function asmJointTarget(ownerId,a){
  // Repère de liaison côté cible (dans le repère du porteur)
  if(a.rel){const T=asmRelFrame(ownerId,a.dst);return T?asmCompose(T,a.rel):null;}
  return asmAlignTarget(ownerId,a);
}
function asmAsBuilt(o,type,axis){
  // Liaison « telle que construite » : à la position actuelle, autour / le long d'un axe de
  // l'occurrence (x, y, z) passant par son origine — rien ne bouge à la création
  const R={x:{o:[0,0,0],x:[0,1,0],y:[0,0,1],z:[1,0,0]},y:{o:[0,0,0],x:[0,0,1],y:[1,0,0],z:[0,1,0]},z:asmFr0()}[axis||'z']||asmFr0();
  return {src:{path:[],cg:null},dst:{path:[],cg:null},flip:false,rz:0,off:[0,0,0],type:ASM_JOINTS[type]?type:'revolute',
    q:{},q0:{},rel:asmRound(asmCompose(o.fr,R)),sfr:R};
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
      const T=asmJointTarget(owner.id,a),S=a.sfr||asmRelFrame(o.comp,a.src);
      if(!T||!S){const snap=(!S?a.src:a.dst)&&(!S?a.src:a.dst).sn;
        o.st='warn';o.msg=snap?'point d’accroche introuvable (« '+snap.name+' » : la face a disparu ?) — position mémorisée'
          :!S?'repère du composant introuvable':'repère cible introuvable';continue;}
      const M=asmRound(asmCompose(T,asmCompose(asmJointFrame(a),asmInverse(S))));
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
function asmOccSerial(o){const s={id:o.id,comp:o.comp,name:o.name,fr:o.fr,fixed:!!o.fixed,visible:o.visible!==false,align:o.align||null};if(o.look)s.look=o.look;return s;}
function asmSerial(){
  if(!asmHasContent())return null;
  asmSync();
  try{asmNamesSync();}catch(e){} // noms des composants = noms de leurs documents (47)
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
    visible:o.visible!==false,align:asmAlignNorm(o.align),look:asmLookNorm(o.look),st:'ok',msg:''});
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
/* ── références entre composants (V0.6.4) : construction « Depuis un autre composant » ──
   el.ext = {ctx (chemin de l'instance où l'on travaille), path (instance visée), cg (élément de
   construction visé) | o (élément d'origine : XY, XZ, YZ, X, Y, Z, O), frozen, last (dernier
   repère lu)} ; valeur = inv(monde(ctx)) · monde(path) · élément. ctx lève l'ambiguïté quand le
   composant a plusieurs instances (le principe de Fusion : la référence est prise « en contexte »). */
let asmExtBusy=false;
function asmExtGeom(cid,e){
  // Repère de l'élément visé dans le repère de son composant
  if(e.cg){
    const c=asmComp(cid);const k=c&&(c.doc.cgeo||[]).find(q=>q&&q.id===e.cg);
    return k&&k.fr?{o:k.fr.o.slice(),x:k.fr.x.slice(),y:k.fr.y.slice(),z:k.fr.z.slice()}:null;
  }
  const P=CG_O_PLANES[e.o];
  if(P)return {o:[0,0,0],x:P.u.slice(),y:P.v.slice(),z:P.n.slice()};
  if(e.o==='X')return {o:[0,0,0],x:[0,1,0],y:[0,0,1],z:[1,0,0]};
  if(e.o==='Y')return {o:[0,0,0],x:[0,0,1],y:[1,0,0],z:[0,1,0]};
  return asmFr0(); // Z, O
}
function asmExtCtx(e,cid){
  // Instance de référence du composant qui porte l'élément
  if(Array.isArray(e.ctx)&&asmPathComp(e.ctx)===cid)return e.ctx;
  if(cid===asm.active&&asmPathComp(asm.path)===cid)return asm.path;
  return asmFirstPath(cid);
}
function asmExtFrame(el,cid){
  // Repère de la référence externe dans le composant cid (par défaut : le composant actif)
  const e=el&&el.ext;if(!asm||!e||!Array.isArray(e.path))return null;
  cid=cid||asm.active;
  const ctx=asmExtCtx(e,cid),T=asmPathComp(e.path);
  if(!ctx||!T)return null;
  const G=asmExtGeom(T,e),Wt=asmWorld(e.path),Wc=asmWorld(ctx);
  if(!G||!Wt||!Wc)return null;
  return asmRound(asmCompose(asmInverse(Wc),asmCompose(Wt,G)));
}
function asmExtStale(){
  // Composants dont une référence externe a bougé depuis leur dernier rejeu
  const out=[];if(!asm)return out;
  asm.comps.forEach(c=>{(c.doc.cgeo||[]).forEach(el=>{
    if(!el||el.how!=='ext'||!el.ext||el.ext.frozen)return;
    const F=asmExtFrame(el,c.id);
    if(F&&!cgSameFr(cgRound(F),el.ext.last||null)&&!out.includes(c))out.push(c);
  });});
  // faces d'autres composants, références d'éléments de construction
  asm.comps.forEach(c=>{if(out.includes(c))return;
    if((c.doc.cgeo||[]).some(el=>(el&&el.refs||[]).some(r=>{
      if(!r||r.k!=='xf')return false;const s=asmXfSig(r,c.id);return s!=null&&s!==r.sig;})))out.push(c);});
  // V0.8.1 : arêtes d'autres composants projetées dans une esquisse
  asm.comps.forEach(c=>{if(out.includes(c))return;
    if((c.doc.sketches||[]).some(sk=>(sk.entities||[]).some(e=>{
      if(!e||!e.ext||!e.proj)return false;const s=asmSkExtSig(e.ext,c.id);return s!=null&&s!==e.ext.sig;})))out.push(c);});
  return out;
}
/* ── arêtes des autres composants dans une esquisse (V0.8.1) ──
   Projeter (esquisse) propose aussi les arêtes exactes des autres instances de l'assemblage,
   lues dans leur instantané (_snap.pedges, capturé à la fin de leur rejeu). Entité projetée :
   e.ext = {ctx (instance où l'on travaille), path (instance visée), sig (dernière lecture)} ;
   associative comme une projection ordinaire (srcMid), rejouée quand l'instance visée bouge ou
   que son composant change (asmExtStale). Les instances du composant actif sont exclues (il se
   viserait lui-même). */
function asmSkXf(ctx,path){const Wt=asmWorld(path),Wc=asmWorld(ctx);return Wt&&Wc?asmCompose(asmInverse(Wc),Wt):null;}
function asmSkExtCtx(x,cid){return Array.isArray(x.ctx)&&asmPathComp(x.ctx)===cid?x.ctx:asmExtCtx({},cid);}
function asmSkExtEdges(x,cid){
  // Arêtes ({pts, mid}) de l'instance x.path, dans le repère du composant cid (actif par défaut)
  if(!asm||!x||!Array.isArray(x.path))return null;
  cid=cid||asm.active;
  const T=asmPathComp(x.path),c=asmComp(T),E=c&&c._snap&&c._snap.pedges;
  if(!E||!E.length||T===cid)return null;
  const ctx=asmSkExtCtx(x,cid),F=ctx&&asmSkXf(ctx,x.path);if(!F)return null;
  return E.map(e=>({pts:e.pts.map(p=>asmApply(F,p)),mid:e.mid?asmApply(F,e.mid):null}));
}
function asmSkExtSig(x,cid){
  // Signature de ce que voit la projection : repère de l'instance visée + état de son composant
  if(!asm||!x||!Array.isArray(x.path))return null;
  cid=cid||asm.active;
  const T=asmPathComp(x.path),c=asmComp(T);if(!c||!c._snap||!c._snap.pedges)return null;
  const ctx=asmSkExtCtx(x,cid),F=ctx&&asmSkXf(ctx,x.path);if(!F)return null;
  const r=v=>v.map(a=>Math.round(a*1e4)/1e4).join(',');
  return [r(F.o),r(F.x),r(F.y),r(F.z),c._snap.hash||''].join('|');
}
function asmSkExtLists(){
  // Listes candidates de l'outil Projeter : chaque instance visible hors composant actif
  if(!asm||!asmOn())return [];
  const out=[],P=asm.path;
  const hidden=path=>{let c=asmRoot();for(const id of path){const o=c&&c.occ.find(q=>q.id===id);if(!o||o.visible===false)return true;c=asmComp(o.comp);}return false;};
  asmInstances(asm.root).forEach(inst=>{
    if(inst.comp===asm.active||hidden(inst.path))return;
    const x={ctx:P.slice(),path:inst.path.slice()},ed=asmSkExtEdges(x);
    if(ed&&ed.length)out.push({edges:ed,ext:x,name:(asmComp(inst.comp)||{}).name||''});
  });
  return out;
}
function asmSkCaptureEdges(){
  // Arêtes exactes du composant actif (fin de rejeu), données pures pour les esquisses des autres
  try{
    if(!(typeof occHas==='function'&&occHas()&&occLive&&occLive.shape))return null;
    const E=occListEdges(occLive.shape);if(!E||!E.length)return null;
    const r=p=>p.map(a=>Math.round(a*1e6)/1e6);
    return E.slice(0,8000).map(e=>({pts:e.pts.map(r),mid:e.mid?r(e.mid):null}));
  }catch(e){return null;}
}
/* ── faces des autres composants comme références de construction ──
   Chaque composant capture, à la fin de son rejeu, ses faces planes et cylindriques/coniques
   (_snap.pfaces : géométrie dans SON repère + référence durable occFaceRefAny). Une référence
   ref = {k:'xf', ctx (instance où l'on travaille), path (instance visée), ref, loc, name, sig}
   se résout dans le composant actif via asmSkXf, comme les arêtes projetées (V0.8.1) : elle suit
   quand l'instance visée bouge ou que son composant change (asmExtStale), et garde sa dernière
   position (⚠) si la face a disparu. */
function asmSkCaptureFaces(){
  try{
    if(!(typeof occHas==='function'&&occHas()&&occLive&&occLive.shape))return null;
    const out=[],SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE,T=occt.GeomAbs_SurfaceType;
    const r=p=>p.map(a=>Math.round(a*1e6)/1e6);
    const ex=new occt.TopExp_Explorer_2(occLive.shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);
    try{
      while(ex.More()&&out.length<4000){
        let f=null,ad=null;
        try{
          f=occt.TopoDS.Face_1(ex.Current());
          ad=new occt.BRepAdaptor_Surface_2(f,true);
          const gt=ad.GetType(),b=occFaceBox(f);
          if(b&&gt===T.GeomAbs_Plane){
            const n=occFaceOutNormal(f);
            if(n)out.push({ref:occFaceRefAny(f),plane:{o:r(b.pos),n:r(n)}});
          }else if(b&&(gt===T.GeomAbs_Cylinder||gt===T.GeomAbs_Cone)){
            const S=gt===T.GeomAbs_Cylinder?ad.Cylinder():ad.Cone(),ax=S.Axis();
            const d=[ax.Direction().X(),ax.Direction().Y(),ax.Direction().Z()],lo=[ax.Location().X(),ax.Location().Y(),ax.Location().Z()];
            const t=(b.pos[0]-lo[0])*d[0]+(b.pos[1]-lo[1])*d[1]+(b.pos[2]-lo[2])*d[2];
            out.push({ref:occFaceRefAny(f),axis:{o:r([lo[0]+d[0]*t,lo[1]+d[1]*t,lo[2]+d[2]*t]),d:r(d),rad:gt===T.GeomAbs_Cylinder?+S.Radius().toFixed(6):null}});
          }
        }catch(e){}
        finally{try{if(ad)ad.delete();}catch(e){}try{if(f)f.delete();}catch(e){}}
        ex.Next();
      }
    }finally{try{ex.delete();}catch(e){}}
    return out;
  }catch(e){return null;}
}
function asmXfFind(Fs,ref){
  // Face visée dans la capture courante : même référence durable, sinon la plus proche de la
  // géométrie mémorisée (même type, même direction) — la face a pu changer de taille
  if(!Fs||!ref)return null;
  const k=JSON.stringify(ref.ref||null);
  const same=Fs.find(e=>JSON.stringify(e.ref||null)===k);if(same)return same;
  const L=ref.loc||{},dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
  let best=null,bd=Infinity;
  Fs.forEach(e=>{
    if(L.plane&&e.plane&&dot(L.plane.n,e.plane.n)>0.999){const d=Math.abs(dot(sub(e.plane.o,L.plane.o),L.plane.n));if(d<bd){bd=d;best=e;}}
    if(L.axis&&e.axis&&Math.abs(dot(L.axis.d,e.axis.d))>0.999){const w=sub(e.axis.o,L.axis.o),t=dot(w,L.axis.d),d=Math.hypot(w[0]-L.axis.d[0]*t,w[1]-L.axis.d[1]*t,w[2]-L.axis.d[2]*t);if(d<bd){bd=d;best=e;}}
  });
  return bd<1?best:null; // au-delà d'1 mm : ce n'est plus la même face
}
function asmXfSig(ref,cid){return asmSkExtSig({ctx:ref.ctx,path:ref.path},cid);}
function asmXfEval(ref,cid){
  // Géométrie {plane|axis, point} de la face visée, dans le repère du composant cid (actif)
  if(!asm||!ref||!Array.isArray(ref.path))return null;
  cid=cid||asm.active;
  const T=asmPathComp(ref.path),c=asmComp(T);
  if(!c||T===cid||!c._snap||!c._snap.pfaces)return null;
  const e=asmXfFind(c._snap.pfaces,ref);if(!e)return null;
  const ctx=asmSkExtCtx(ref,cid),F=ctx&&asmSkXf(ctx,ref.path);if(!F)return null;
  const P=p=>asmApply(F,p),V=v=>{const q=asmApply(F,v);return [q[0]-F.o[0],q[1]-F.o[1],q[2]-F.o[2]];};
  ref.sig=asmXfSig(ref,cid);
  if(e.plane){const o=P(e.plane.o),B=cgBasisN(V(e.plane.n),null);return {plane:{o,u:B.u,v:B.v,n:B.n},point:{o}};}
  const o=P(e.axis.o);return {axis:{o,d:cgUnit(V(e.axis.d))},point:{o}};
}
function asmExtSync(){
  // Rejoue les composants dont une référence externe a bougé (placement, autre composant
  // modifié), jusqu'à stabilité — trois passes au plus, sinon ⚠ « circulaire ». → true si rejoué
  if(!asm||asmExtBusy)return false;
  asmExtBusy=true;let any=false;
  try{
    for(let pass=0;pass<3;pass++){
      const st=asmExtStale();if(!st.length)return any;
      any=true;
      st.forEach(c=>{if(c.doc===doc){try{builtVersion=-1;builtHash=null;markDirty();rebuild();}catch(e){}}else c._stale=true;});
      try{asmBuildSnapshots();}catch(e){}
      asmResolve();
    }
    asmExtStale().forEach(c=>(c.doc.cgeo||[]).forEach(el=>{if(el&&el.how==='ext'&&el.ext&&!el.ext.frozen){el.st='warn';el.msg='références circulaires entre composants : position mémorisée';}}));
  }finally{asmExtBusy=false;}
  return any;
}
function asmExtSyncSoon(){if(!asmExtBusy&&asm){try{setTimeout(()=>{try{if(asmExtStale().length){asmExtSync();asmNotify(true);}}catch(e){}},0);}catch(e){}}}
