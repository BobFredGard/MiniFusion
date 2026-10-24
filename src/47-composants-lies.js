/* ---------- composants liés à un fichier externe, édités sur place (V0.6.3) ----------
   Un composant LIÉ (comp.link) vient d'un fichier .miniFusion : sa racine devient le composant,
   ses sous-composants viennent avec lui (marqués c.of = id du composant lié). Le fichier hôte
   garde une COPIE (il s'ouvre sans la source : autre PC, Firefox) ; la source fait foi :
     · vérification (ouverture, retour sur l'onglet, bouton) : source changée et rien de modifié
       ici → mise à jour ; modifiée des deux côtés → Garder les miennes / Prendre la source /
       Rompre le lien ;
     · ÉDITION SUR PLACE : on modifie le composant lié comme un autre ; à l'enregistrement de
       l'hôte (Ctrl+S), sa source est réécrite d'abord (même format, trajectoires FAO gardées).
   link = {rel (chemin dans le dossier de projets), key (handle en IndexedDB, hors dossier),
           name, sig (empreinte du texte de la source à la dernière synchro), base (empreinte du
           sous-arbre à la dernière synchro : ≠ → modifié ici), map {id source → id hôte}
           (seulement ceux qui ont dû changer), srcRoot (id de la racine dans la source)}.
   Dans le dossier de projets, une seule autorisation couvre tous les liens, et le chemin suit
   le dossier d'un PC à l'autre (Dropbox). */
let asmLinkBusy=false;
function asmHash(s){
  s=String(s||'');let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
  return (h>>>0).toString(36)+'_'+s.length;
}
function asmLinked(){return asm?asm.comps.filter(c=>c.link):[];}
function asmLinkMembers(L){
  // Le composant lié et tout ce qui vient de son fichier (y compris les sous-composants d'un
  // lien imbriqué : of mène à L de proche en proche)
  const s=new Set([L.id]);if(!asm)return [L];
  let ch=true;while(ch){ch=false;asm.comps.forEach(c=>{if(c.of&&s.has(c.of)&&!s.has(c.id)){s.add(c.id);ch=true;}});}
  return [L].concat(asm.comps.filter(c=>c!==L&&s.has(c.id)));
}
function asmLinkInv(L){const m=(L.link&&L.link.map)||{},inv={};Object.keys(m).forEach(k=>{inv[m[k]]=k;});inv[L.id]=L.link.srcRoot||L.id;return inv;}
function asmSubtreeObj(L){
  // Le composant lié et ses sous-composants, tels qu'ils s'écrivent dans leur fichier source
  // (identifiants de la source, racine au premier niveau)
  const inv=asmLinkInv(L),I=id=>inv[id]||id;
  const top=serialiseObj(L.doc,false);top.name=L.name;
  const mem=asmLinkMembers(L);
  if(mem.length>1||L.occ.length){
    const occ=o=>({id:I(o.id),comp:I(o.comp),name:o.name,fr:o.fr,fixed:!!o.fixed,visible:o.visible!==false,
      align:o.align?Object.assign({},o.align,{src:{path:o.align.src.path.map(I),cg:o.align.src.cg},dst:{path:o.align.dst.path.map(I),cg:o.align.dst.cg}}):null});
    top.asm={v:2,name:L.name,root:I(L.id),active:I(L.id),path:[],mode:'part',
      comps:mem.map(c=>({id:I(c.id),kind:'comp',name:c.name,doc:c===L?null:serialiseObj(c.doc,false),occ:c.occ.map(occ),link:c===L?null:asmLinkSerial(c.link),
        of:c.of&&c.of!==L.id?I(c.of):undefined}))};
  }
  return top;
}
function asmSubtreeSig(L){try{return asmHash(JSON.stringify(asmSubtreeObj(L)));}catch(e){return '';}}
function asmLinkDirty(L){return !!(L&&L.link)&&(!!L.link.pend||asmSubtreeSig(L)!==L.link.base);}
function asmLinkRebase(list){
  // Empreinte de référence prise APRÈS le rejeu des composants : la première activation
  // normalise un document (réparations, instances de répétition) sans que ce soit une
  // modification. pend (modifié ici, pas encore écrit) l'emporte.
  (list||asmLinked()).forEach(L=>{if(L.link)L.link.base=asmSubtreeSig(L);});
}
function asmLinkText(L,cur){
  // Texte à écrire dans la source : son enveloppe (bundle : trajectoires, imports) est gardée
  const top=asmSubtreeObj(L);
  try{
    const b=cur?JSON.parse(cur):null;
    if(b&&b.bundle===1&&b.doc){b.doc=top;b.v=APP_VER;b.at=Date.now();b.name=top.name;return JSON.stringify(b);}
  }catch(e){}
  return JSON.stringify(top,null,2);
}
/* ── charger le contenu d'une source dans le composant lié (création ou mise à jour) ── */
async function asmLinkLoad(L,txt){
  let b;try{b=JSON.parse(txt);}catch(e){throw new Error('fichier illisible');}
  const top=(b&&b.bundle===1&&b.doc)?b.doc:b;
  if(!top||!Array.isArray(top.features))throw new Error('ce n’est pas un projet MiniFusion');
  if(b&&b.bundle===1){try{await bundleStoreCaches(b);}catch(e){}}
  const t=asmTreeOfFile(top);
  const map=Object.assign({},L.link.map||{});
  const oldM=asmLinkMembers(L).filter(c=>c!==L),old=new Map(oldM.map(c=>[c.id,c]));
  const taken=new Set();asm.comps.forEach(c=>{if(c!==L&&!old.has(c.id)){taken.add(c.id);c.occ.forEach(o=>taken.add(o.id));}});
  const M=id=>{
    if(id===t.root)return L.id;
    if(map[id])return map[id];
    if(taken.has(id)||id===L.id){map[id]=uid(String(id).split('_')[0]||'id');return map[id];}
    return id;
  };
  t.comps.forEach(c=>{M(c.id);c.occ.forEach(o=>M(o.id));});
  const mo=o=>Object.assign({},o,{id:M(o.id),comp:M(o.comp),st:'ok',msg:'',
    align:o.align?Object.assign({},o.align,{src:{path:o.align.src.path.map(M),cg:o.align.src.cg},dst:{path:o.align.dst.path.map(M),cg:o.align.dst.cg}}):null});
  const keep=new Set();
  t.comps.forEach(c=>{
    if(c.id===t.root){
      // la racine de la source = le composant lié (même objet : il peut être le composant actif)
      const nd=JSON.parse(JSON.stringify(serialiseObj(c.doc,false)));
      if(L.doc===doc){try{docApplySnap(JSON.stringify(nd));}catch(e){}}
      else{Object.keys(L.doc).forEach(k=>{if(!(k in nd))delete L.doc[k];});Object.assign(L.doc,docFromSerial(nd));}
      L.doc.name=L.name;L.occ=c.occ.map(mo);
    }else{
      const id=M(c.id);keep.add(id);
      let h=old.get(id);
      if(h){
        if(h.doc===doc){try{docApplySnap(JSON.stringify(serialiseObj(c.doc,false)));}catch(e){}}else h.doc=c.doc;
        h.name=c.name;h.occ=c.occ.map(mo);h.link=c.link||null;h.of=c.of?M(c.of):L.id;
      }else{h={id,kind:'comp',name:c.name,doc:c.doc,occ:c.occ.map(mo),link:c.link||null,of:c.of?M(c.of):L.id};asm.comps.push(h);}
    }
  });
  // sous-composants disparus de la source (et ce qui ne servait qu'à eux)
  asm.comps=asm.comps.filter(c=>!old.has(c.id)||keep.has(c.id));
  // (pas d'asmPurge : à la création, le composant lié n'a pas encore d'occurrence)
  if(!asmComp(asm.active)){asmActivatePath([]);}
  Object.keys(map).forEach(k=>{if(map[k]===k)delete map[k];});
  L.link.map=map;L.link.srcRoot=t.root;
  L.link.sig=asmHash(txt);L.link.base=asmSubtreeSig(L);L.link.st='ok';L.link.msg='';
  asmLinkMembers(L).forEach(c=>{c._stale=true;c._sane=false;c._rt=null;});
  if(L.doc===doc){try{builtVersion=-1;builtHash=null;_docVersion++;rebuild();}catch(e){}}
  asmResolve();
  return true;
}
/* ── accès aux fichiers sources ── */
async function asmLinkHandle(L,ask){
  // → {h} ou {why} ; ask : demander l'autorisation (il faut un geste de l'utilisateur)
  const l=L.link,perm=async(h,mode)=>{
    try{const o={mode};if(typeof h.queryPermission!=='function')return true; // (stockage privé : toujours permis)
      if((await h.queryPermission(o))==='granted')return true;
      if(!ask)return false;return (await h.requestPermission(o))==='granted';}catch(e){return false;}};
  if(l.rel&&mffFolder){
    if(!(await perm(mffFolder,'readwrite')))return {why:'accès au dossier de projets à autoriser',perm:true};
    try{
      const seg=String(l.rel).split('/').filter(Boolean);let d=mffFolder;
      for(let i=0;i<seg.length-1;i++)d=await d.getDirectoryHandle(seg[i]);
      return {h:await d.getFileHandle(seg[seg.length-1])};
    }catch(e){return {why:'source introuvable dans le dossier de projets : '+l.rel};}
  }
  if(l.key){
    let h=null;try{h=await idbGet(l.key);}catch(e){}
    if(!h)return {why:'source introuvable (lien mémorisé sur un autre ordinateur ?)'};
    if(!(await perm(h,'readwrite')))return {why:'accès au fichier source à autoriser',perm:true};
    return {h};
  }
  return {why:l.rel?'dossier de projets non choisi : lien « '+l.rel+' » non vérifié':'source inconnue'};
}
async function asmLinkRef(h){
  // Comment retrouver ce fichier : chemin dans le dossier de projets, sinon handle mémorisé
  let rel=null;
  try{if(mffFolder){const p=await mffFolder.resolve(h);if(p&&p.length)rel=p.join('/');}}catch(e){}
  if(rel)return {rel,key:null};
  const key='mfl:'+uid('k');try{await idbSet(key,h);}catch(e){}
  return {rel:null,key};
}
/* ── vérifier les liens (ouverture, retour sur l'onglet, bouton) ── */
async function asmLinksCheck(ask){
  if(!asm||asmLinkBusy)return {updated:[],warn:[]};
  const L0=asmLinked();if(!L0.length)return {updated:[],warn:[]};
  asmLinkBusy=true;
  const out={updated:[],warn:[],perm:false};
  try{
    for(const L of L0){
      if(!L.link||!asmComp(L.id))continue;
      const r=await asmLinkHandle(L,ask);
      if(!r.h){L.link.st='warn';L.link.msg=r.why;out.warn.push(L.name);if(r.perm)out.perm=true;continue;}
      let txt;try{txt=await (await r.h.getFile()).text();}catch(e){L.link.st='warn';L.link.msg='lecture impossible';out.warn.push(L.name);continue;}
      if(asmHash(txt)===L.link.sig){L.link.st='ok';L.link.msg='';continue;}
      let choix='theirs';
      if(asmLinkDirty(L))choix=await mffAsk('« '+L.name+' » a changé sur le disque ET ici.\nGarder vos modifications (la source sera écrasée au prochain enregistrement), prendre la source (vos modifications sont perdues), ou rompre le lien ?',
        [['mine','Garder les miennes',true],['theirs','Prendre la source'],['break','Rompre le lien']]);
      if(choix==='mine'){L.link.sig=asmHash(txt);L.link.pend=true;L.link.st='ok';L.link.msg='modifié ici : la source sera réécrite à l’enregistrement';continue;}
      if(choix==='break'){asmLinkBreak(L);continue;}
      if(choix==='cancel')continue;
      try{await asmLinkLoad(L,txt);out.updated.push(L.name);}catch(e){L.link.st='warn';L.link.msg=String(e&&e.message||e);out.warn.push(L.name);}
    }
  }finally{asmLinkBusy=false;}
  if(out.updated.length){
    // contenu remplacé depuis le disque : les annulations qui le citaient ne valent plus
    asmUndoStack.length=0;asmRedoStack.length=0;
    try{asmBuildSnapshots();}catch(e){}
    asmLinkRebase(asmLinked().filter(L=>out.updated.includes(L.name)));
    try{dirty=true;autosave();}catch(e){}
  }
  asmNotify(!out.updated.length);
  try{renderTree();}catch(e){}
  if(out.updated.length){try{faceEl.textContent='Mis à jour depuis le disque : '+out.updated.join(', ')+'.';}catch(e){}}
  else if(out.warn.length&&ask){try{faceEl.textContent='Liens non vérifiés : '+out.warn.join(', ')+'.';}catch(e){}}
  return out;
}
/* ── écrire les sources modifiées ici (avant l'hôte, Ctrl+S) ── */
async function asmLinksWrite(){
  const out={written:[],failed:[]};
  if(!asm)return out;
  for(const L of asmLinked()){
    if(!asmLinkDirty(L))continue;
    const r=await asmLinkHandle(L,true);
    if(!r.h){out.failed.push(L.name+' ('+r.why+')');continue;}
    try{
      const cur=await (await r.h.getFile()).text();
      if(asmHash(cur)!==L.link.sig){
        const c=await mffAsk('La source de « '+L.name+' » a aussi changé sur le disque depuis la dernière vérification.\nL’écraser avec vos modifications ?',[['over','Écraser la source',true],['skip','Ne pas l’écrire']]);
        if(c!=='over'){out.failed.push(L.name+' (non écrite)');continue;}
      }
      const txt=asmLinkText(L,cur);
      const w=await r.h.createWritable();await w.write(txt);await w.close();
      delete L.link.pend;L.link.sig=asmHash(txt);L.link.base=asmSubtreeSig(L);L.link.st='ok';L.link.msg='';
      out.written.push(L.name);
    }catch(e){out.failed.push(L.name+' ('+(e&&e.message||e)+')');}
  }
  asmLinked().forEach(L=>{if(out.failed.some(x=>x.indexOf(L.name)===0))L.link.pend=true;});
  if(out.failed.length){try{alert('Sources non écrites :\n• '+out.failed.join('\n• ')+'\nL’assemblage garde vos modifications ; elles seront écrites au prochain enregistrement.');}catch(e){}}
  return out;
}
/* ── commandes ── */
function asmLinkBreak(L){
  // Rompre : le composant devient une copie locale (ses sous-composants aussi)
  if(!L||!L.link)return;
  L.link=null;asm.comps.forEach(c=>{if(c.of===L.id)delete c.of;});
  asmNotify();
}
async function asmPickSource(){
  // Fenêtre « Ouvrir » (dossier de projets) → {h, txt, name} ou null
  if(!MFF_FS){alert('Les composants liés demandent Chrome ou Edge (accès aux fichiers).');return null;}
  try{
    const o={types:MFF_TYPES,multiple:false};if(mffFolder)o.startIn=mffFolder;
    const [h]=await window.showOpenFilePicker(o);if(!h)return null;
    const f=await h.getFile();return {h,txt:await f.text(),name:f.name};
  }catch(e){if(!(e&&e.name==='AbortError'))alert('Lecture impossible : '+(e&&e.message||e));return null;}
}
async function asmLinkInsert(h,txt,name){
  // Nouveau composant lié dans le composant actif (même source déjà liée : une occurrence)
  asmEnsure();
  const owner=asmActiveComp();
  for(const L of asmLinked()){
    let same=false;try{const r=await asmLinkHandle(L,false);same=!!(r.h&&await r.h.isSameEntry(h));}catch(e){}
    if(same){
      const o=asmAddOcc(L.id,null,owner.id);
      if(o){asmSelId=o.id;asmNotify();try{faceEl.textContent='« '+name+' » est déjà lié : nouvelle occurrence '+o.name+'.';}catch(e){}}
      return o?L:null;
    }
  }
  const ref=await asmLinkRef(h);
  const base=mffBase(name);
  asmPush('lier « '+base+' »',[owner.id]);
  const L={id:uid('cp'),kind:'comp',name:base,doc:asmEmptyDoc(base),occ:[],link:{rel:ref.rel,key:ref.key,name,sig:'',base:'',map:{},srcRoot:null}};
  {const P=asmLinkOwner(owner);if(P)L.of=P.id;}
  asm.comps.push(L);
  try{await asmLinkLoad(L,txt);}
  catch(e){asm.comps=asm.comps.filter(c=>c!==L&&c.of!==L.id);asmUndoStack.pop();alert('Lien impossible : '+(e&&e.message||e));return null;}
  let dx=0;try{const box=new THREE.Box3();asmSceneGet().getObjectByName('asmOcc').traverse(m=>{if(m.isMesh)box.expandByObject(m);});if(!box.isEmpty())dx=box.max.x+20;}catch(e){}
  const o=asmNewOccObj(L.id,base+':1',{o:[dx,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]});owner.occ.push(o);
  try{asmBuildSnapshots();}catch(e){}
  asmLinkRebase([L]);
  asmResolve();asmSelId=o.id;asmNotify();
  try{faceEl.textContent='Lié : « '+base+' »'+(ref.rel?' ('+ref.rel+')':' (hors du dossier de projets : lien valable sur cet ordinateur)')+'. Modifiable ici : la source est réécrite à l’enregistrement.';}catch(e){}
  return L;
}
function asmExclusiveSubtree(C){
  // Sous-composants de C utilisés seulement sous C (sinon, ils ne peuvent pas partir dans son fichier)
  const sub=new Set(asmInstances(C.id).map(i=>i.comp));sub.delete(C.id);
  const bad=[];
  sub.forEach(id=>{asmCompOccs(id).forEach(o=>{const own=asmOccOwner(o.id);if(own&&own!==C&&!sub.has(own.id))bad.push(asmComp(id).name);});});
  return {sub,bad:[...new Set(bad)]};
}
async function asmCmdExtract(cid){
  // Composant → fichier .miniFusion, et le composant devient lié à ce fichier
  const C=asmComp(cid),why=asmExtractCheck(C);
  if(why){alert('Extraction impossible : '+why+'.');return false;}
  if(!MFF_FS||!window.showSaveFilePicker){alert('Extraire vers un fichier demande Chrome ou Edge.');return false;}
  let h;
  try{const o={suggestedName:String(C.name).replace(/[\\/:*?"<>|]/g,'_')+'.miniFusion',types:MFF_TYPES};if(mffFolder)o.startIn=mffFolder;h=await window.showSaveFilePicker(o);}
  catch(e){if(!(e&&e.name==='AbortError'))alert('Extraire : '+(e&&e.message||e));return false;}
  return asmExtractTo(C,h);
}
function asmExtractCheck(C){
  // → raison d'un refus d'extraction, ou ''
  if(!C||C.id===asm.root)return 'la racine ne s’extrait pas';
  if(C.link)return '« '+C.name+' » est déjà lié à '+C.link.name;
  if(asmLinkOwner(C))return '« '+C.name+' » fait partie d’un composant lié : extrayez plutôt celui-ci';
  const x=asmExclusiveSubtree(C);
  return x.bad.length?x.bad.join(', ')+' sert aussi ailleurs dans l’assemblage':'';
}
async function asmExtractTo(C,h){
  // Écrit le sous-arbre de C dans le fichier h ; C devient lié à ce fichier
  if(asmExtractCheck(C))return false;
  const x=asmExclusiveSubtree(C);
  const ref=await asmLinkRef(h);
  asmPush('extraire « '+C.name+' »',[C.id]);
  C.link={rel:ref.rel,key:ref.key,name:h.name,sig:'',base:'',map:{},srcRoot:C.id};
  x.sub.forEach(id=>{asmComp(id).of=C.id;});
  try{
    const txt=asmLinkText(C,'');
    const w=await h.createWritable();await w.write(txt);await w.close();
    C.link.sig=asmHash(txt);C.link.base=asmSubtreeSig(C);C.link.st='ok';
  }catch(e){asmUndo();alert('Écriture impossible : '+(e&&e.message||e));return false;}
  asmNotify();
  try{faceEl.textContent='« '+C.name+' » extrait vers '+(ref.rel||h.name)+' : c’est maintenant un composant lié.';}catch(e){}
  return true;
}
async function asmCmdReplaceWithLink(cid){
  // Remplacer le contenu d'un composant par celui d'un fichier, auquel il devient lié
  const C=asmComp(cid);if(!C||C.id===asm.root)return false;
  const p=await asmPickSource();if(!p)return false;
  if(!confirm('Le contenu de « '+C.name+' » (et de ses sous-composants) sera remplacé par celui de '+p.name+', auquel il sera lié. Ses occurrences gardent leur place.\nContinuer ?'))return false;
  const x=asmExclusiveSubtree(C);
  const ref=await asmLinkRef(p.h);
  asmPush('remplacer « '+C.name+' » par un lien',[C.id]);
  x.sub.forEach(id=>{const c=asmComp(id);if(!c.link)c.of=C.id;});
  C.link={rel:ref.rel,key:ref.key,name:p.name,sig:'',base:'',map:{},srcRoot:null};
  try{await asmLinkLoad(C,p.txt);}catch(e){asmUndo();alert('Lien impossible : '+(e&&e.message||e));return false;}
  try{asmBuildSnapshots();}catch(e){}
  asmNotify();
  try{faceEl.textContent='« '+C.name+' » est maintenant lié à '+(ref.rel||p.name)+'.';}catch(e){}
  return true;
}
async function asmCmdRelink(cid){
  // Source déplacée ou renommée : désigner le nouveau fichier
  const L=asmComp(cid);if(!L||!L.link)return false;
  const p=await asmPickSource();if(!p)return false;
  const ref=await asmLinkRef(p.h);
  L.link.rel=ref.rel;L.link.key=ref.key;L.link.name=p.name;
  if(asmHash(p.txt)!==L.link.sig&&!asmLinkDirty(L)){try{await asmLinkLoad(L,p.txt);asmBuildSnapshots();}catch(e){alert('Lecture impossible : '+(e&&e.message||e));}}
  else L.link.st='ok';
  asmNotify();
  try{faceEl.textContent='« '+L.name+' » relié à '+(ref.rel||p.name)+'.';}catch(e){}
  return true;
}
async function asmCmdLinkInsert(){
  const p=await asmPickSource();if(!p)return null;
  const c=await mffAsk('Insérer '+p.name+' :',[['link','Lier (modifiable ici, la source suit)',true],['copy','Copier (indépendant)'],['cancel','Annuler']]);
  if(c==='copy')return asmInsertText(p.txt,p.name);
  if(c==='link')return asmLinkInsert(p.h,p.txt,p.name);
  return null;
}
function asmLinkBadge(c){
  // Pastilles de l'arbre : 🔗 lié, ✎ modifié ici (pas encore écrit), ⚠ problème
  if(!c)return '';
  const L=c.link?c:null;if(!L)return c.of?' <span title="Partie d’un composant lié" style="color:var(--muted)">🔗</span>':'';
  const d=asmLinkDirty(L);
  return ' <span title="Lié à '+asmEsc(L.link.rel||L.link.name)+'">🔗</span>'+(d?' <span title="Modifié ici : la source sera réécrite à l’enregistrement">✎</span>':'')+
    (L.link.st==='warn'?' <span style="color:var(--warn)" title="'+asmEsc(L.link.msg)+'">⚠</span>':'');
}
function asmLinkMenu(c){
  // Entrées du menu contextuel d'une occurrence (arbre des composants)
  if(!c||c.id===(asm&&asm.root))return [];
  if(c.link)return [{html:'🔄 Mettre à jour les liens',fn:()=>asmLinksCheck(true)},{html:'🔗 Relier la source…',fn:()=>asmCmdRelink(c.id)},{html:'✂ Rompre le lien',fn:()=>{asmPush('rompre le lien',[]);asmLinkBreak(c);}}];
  if(c.of)return [];
  return [{html:'📤 Extraire vers un fichier…',fn:()=>asmCmdExtract(c.id)},{html:'🔗 Remplacer par un lien…',fn:()=>asmCmdReplaceWithLink(c.id)}];
}
try{document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&asmLinked().length)asmLinksCheck(false);});}catch(e){}
