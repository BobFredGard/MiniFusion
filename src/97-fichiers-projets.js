/* ---------- Fichiers : ouvrir / enregistrer / enregistrer sous, récents, dossier de projets (V0.2.3) ----------
   Un navigateur n'écrit pas où il veut sur le disque. Chrome et Edge (Windows, Mac) offrent
   l'API d'accès aux fichiers : vraies fenêtres « Ouvrir » / « Enregistrer sous » du système, et
   l'application GARDE le lien vers le fichier → Ctrl+S réécrit le même fichier, sans question.
   Les liens (fichiers récents, dossier de projets) sont mémorisés dans IndexedDB ; le navigateur
   redemande la permission une fois par session (un clic). Firefox / Safari : repli (sélecteur
   de fichier pour ouvrir, téléchargement pour enregistrer).
   Ouvrir / Nouveau : si la pièce a des modifications non enregistrées → Enregistrer / Ne pas
   enregistrer / Annuler, puis l'espace est VIDÉ (docResetEmpty) avant de charger. */
const MFF_FS=typeof window!=='undefined'&&typeof window.showOpenFilePicker==='function';
const MFF_TYPES=[{description:'Projet MiniFusion',accept:{'application/json':['.miniFusion','.json']}}];
let mffHandle=null,mffName='',mffSavedSig=null,mffFolder=null;
function mffSig(){
  // empreinte du DOCUMENT (sans la vue, la sélection ni les replis) : « modifié depuis l'enregistrement »
  try{const o=JSON.parse(serialise(false));delete o.view;delete o.sel;delete o.fold;delete o.originVis;const s=JSON.stringify(o);
    let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36)+'_'+s.length;}catch(e){return '';}
}
function mffModified(){
  try{const empty=!(doc.sketches||[]).length&&!(doc.features||[]).length;
    if(mffSavedSig===null)return !empty;return mffSig()!==mffSavedSig;}catch(e){return false;}
}
function mffMark(){mffSavedSig=mffSig();mffTitle();}
function mffTitle(){
  try{
    const nm=mffName||((doc&&doc.name)||'Sans titre');const mod=mffModified();
    const el=document.getElementById('mffName');
    if(el){el.textContent=(mod?'● ':'')+nm;el.title=(mffHandle?'Fichier : '+mffHandle.name:'Pas encore de fichier sur le disque')+(mod?' — modifications non enregistrées':' — enregistré');el.classList.toggle('mod',mod);}
    document.title=(mod?'● ':'')+nm+' — MiniFusion';
  }catch(e){}
}
/* ---- boîte de dialogue « Enregistrer les modifications ? » ---- */
function mffAsk(msg,buttons){
  // buttons : [[valeur, libellé, primaire?]] → Promise(valeur) ; Échap = 'cancel'
  return new Promise(res=>{
    const bg=document.createElement('div');bg.className='mffDlgBg';
    const d=document.createElement('div');d.className='mffDlg';
    const p=document.createElement('div');p.className='mffMsg';p.textContent=msg;d.appendChild(p);
    const row=document.createElement('div');row.className='mffBtns';
    const done=v=>{document.removeEventListener('keydown',key,true);bg.remove();res(v);};
    buttons.forEach(([v,l,pr])=>{const b=document.createElement('button');b.textContent=l;if(pr)b.className='primary';b.onclick=()=>done(v);row.appendChild(b);});
    d.appendChild(row);bg.appendChild(d);document.body.appendChild(bg);
    const key=e=>{if(e.key==='Escape'){e.preventDefault();done('cancel');}};
    document.addEventListener('keydown',key,true);
    setTimeout(()=>{try{row.querySelector('.primary').focus();}catch(e){}},0);
  });
}
async function mffConfirmDiscard(){
  // true = on peut remplacer la pièce courante
  if(!mffModified())return true;
  const nm=mffName||doc.name||'Sans titre';
  const r=await mffAsk('Enregistrer les modifications de « '+nm+' » ?',[['save','Enregistrer',true],['drop','Ne pas enregistrer'],['cancel','Annuler']]);
  if(r==='cancel')return false;
  if(r==='save')return await mffSave();
  return true;
}
/* ---- écriture / lecture ---- */
async function mffData(){try{return await bundleSerialise();}catch(e){return serialise();}}
async function mffPerm(h,mode){
  try{const o={mode:mode||'readwrite'};if((await h.queryPermission(o))==='granted')return true;return (await h.requestPermission(o))==='granted';}catch(e){return false;}
}
async function mffWrite(h){
  // composants liés modifiés ici : leurs sources d'abord (47-composants-lies)
  try{if(asm&&asmLinked().length)await asmLinksWrite();}catch(e){}
  const data=await mffData();
  return await mffWriteSafe(h,data);
}
/* ---- enregistrement sûr (V0.8.3) ----
   1. le contenu est CONTRÔLÉ avant d'écrire (non vide, lisible, c'est bien un projet) : un
      enregistrement raté ne remplace jamais un bon fichier ;
   2. la version précédente est COPIÉE : « nom.miniFusion.bak » à côté du fichier quand il est
      dans le dossier de projets (le navigateur n'écrit qu'où on lui a donné accès), et toujours
      dans le stockage du navigateur (IndexedDB, une copie par fichier) ;
   3. l'écriture passe par le fichier d'échange du navigateur, qui ne remplace l'original qu'à la
      fermeture ; en cas d'erreur elle est abandonnée (l'original reste intact) ;
   4. relecture : la taille écrite doit être celle du contenu, sinon la copie est remise. */
function mffCheckData(txt){
  // → message d'erreur, ou '' si le contenu est un projet lisible
  if(typeof txt!=='string'||txt.length<20)return 'contenu vide';
  let o;try{o=JSON.parse(txt);}catch(e){return 'contenu illisible ('+(e&&e.message||e)+')';}
  if(!o||typeof o!=='object')return 'contenu illisible';
  const d=o.doc&&typeof o.doc==='object'?o.doc:o; // bundle : {doc, …} ; document : {app, …}
  if(d.app!=='MiniFusion'&&!Array.isArray(d.features)&&!Array.isArray(d.sketches))return 'ce n’est pas un projet MiniFusion';
  return '';
}
async function mffDirOf(h){
  // Dossier qui contient h, s'il est dans le dossier de projets (sinon null)
  try{
    if(!mffFolder||typeof mffFolder.resolve!=='function')return null;
    const path=await mffFolder.resolve(h);if(!Array.isArray(path)||!path.length)return null;
    let d=mffFolder;for(const n of path.slice(0,-1))d=await d.getDirectoryHandle(n);
    return d;
  }catch(e){return null;}
}
async function mffBackup(h,old){
  // Copie de la version précédente → {disk: nom du .bak ou '', idb: bool}
  const out={disk:'',idb:false};
  try{await idbSet('mff:bak:'+h.name,{name:h.name,at:Date.now(),txt:old});out.idb=true;}catch(e){}
  try{
    const d=await mffDirOf(h);
    if(d){const b=await d.getFileHandle(h.name+'.bak',{create:true});const w=await b.createWritable();
      try{await w.write(old);await w.close();out.disk=b.name;}catch(e){try{await w.abort();}catch(e2){}}}
  }catch(e){}
  return out;
}
async function mffWriteSafe(h,data,opt){
  // → {bak:{disk,idb}} ; lève une erreur si rien n'a été écrit (l'original est alors intact)
  const bad=mffCheckData(data);if(bad)throw new Error('enregistrement annulé : '+bad+' — le fichier sur le disque n’a pas été touché');
  let old=null;try{old=await (await h.getFile()).text();}catch(e){old=null;}
  let bak={disk:'',idb:false};
  if(old&&old!==data&&!(opt&&opt.noBak))bak=await mffBackup(h,old);
  const w=await h.createWritable();
  try{await w.write(data);await w.close();}
  catch(e){try{await w.abort();}catch(e2){}throw e;}
  try{
    const f=await h.getFile(),n=typeof Blob!=='undefined'?new Blob([data]).size:data.length;
    if(typeof f.size==='number'&&f.size!==n){
      if(old){const w2=await h.createWritable();await w2.write(old);await w2.close();}
      throw new Error('relecture : '+f.size+' octets au lieu de '+n+(old?' — version précédente remise':''));
    }
  }catch(e){if(/relecture/.test(e&&e.message||''))throw e;}
  mffLastBak=bak;
  return {bak};
}
let mffLastBak=null;
async function mffBakFind(h){
  // Copies de secours du fichier courant : sur le disque (.bak) et dans le navigateur
  const out=[];if(!h)return out;
  try{const d=await mffDirOf(h);if(d){const b=await d.getFileHandle(h.name+'.bak');const f=await b.getFile();
    out.push({where:'disk',label:'📁 '+b.name,at:f.lastModified||0,txt:async()=>await f.text()});}}catch(e){}
  try{const r=await idbGet('mff:bak:'+h.name);if(r&&typeof r.txt==='string')out.push({where:'idb',label:'🗄 copie du navigateur',at:r.at||0,txt:async()=>r.txt});}catch(e){}
  return out.sort((a,b)=>b.at-a.at);
}
async function mffBakOpen(c){
  // Ouvre une copie de secours À LA PLACE du document, rattachée au même fichier : Ctrl+S la
  // réécrit (et la version actuelle devient à son tour la copie)
  if(!(await mffConfirmDiscard()))return false;
  const txt=await c.txt(),bad=mffCheckData(txt);if(bad){alert('Copie de secours illisible : '+bad);return false;}
  const h=mffHandle;await mffLoadText(txt,h?h.name:'copie',h);
  mffSavedSig=null;setTimeout(()=>{mffSavedSig='__copie__';mffTitle();},1600); // « modifié » : le disque a l'autre version
  try{faceEl.textContent='Copie de secours ouverte ('+new Date(c.at).toLocaleString('fr')+') — Ctrl+S pour la remettre dans '+(h?h.name:'le fichier')+'.';}catch(e){}
  return true;
}
async function mffBakMenu(anchor){
  const L=await mffBakFind(mffHandle);
  const items=L.length?L.map(c=>({html:c.label.replace(/</g,'&lt;')+' <span style="opacity:.6">'+(c.at?new Date(c.at).toLocaleString('fr'):'')+'</span>',fn:()=>mffBakOpen(c)}))
    :[{html:'<span style="opacity:.6">'+(mffHandle?'Aucune copie de secours pour ce fichier':'Pas encore de fichier sur le disque')+'</span>',fn:()=>{}}];
  mfPop(anchor,items);
}
function mffBase(n){return String(n||'').replace(/(\.minifusion(\.json)?|\.json)$/i,'');}
async function mffSave(){
  // true si enregistré
  if(mffHandle&&(MFF_FS||typeof mffHandle.createWritable==='function')){ // un lien qui sait écrire suffit
    try{
      if(!(await mffPerm(mffHandle,'readwrite')))throw new Error('permission refusée');
      const r=await mffWrite(mffHandle);fileHandle=mffHandle;mffMark();mffRecentAdd(mffHandle);
      try{autosave();}catch(e){}
      const bk=r&&r.bak&&r.bak.disk?' — version précédente : '+r.bak.disk:(r&&r.bak&&r.bak.idb?' — version précédente gardée dans le navigateur':'');
      try{faceEl.textContent='Enregistré dans '+mffHandle.name+' (document + trajectoires)'+bk+'.';}catch(e){}
      return true;
    }catch(e){try{faceEl.textContent='Enregistrement impossible ('+(e&&e.message||e)+') — « Enregistrer sous… ».';}catch(e2){}}
  }
  return await mffSaveAs();
}
async function mffSaveAs(){
  const fname=(mffName||doc.name||'piece').replace(/[\\/:*?"<>|]/g,'_')+'.miniFusion';
  if(MFF_FS&&window.showSaveFilePicker){
    try{
      const o={suggestedName:fname,types:MFF_TYPES};if(mffFolder)o.startIn=mffFolder;else if(mffHandle)o.startIn=mffHandle;
      const h=await window.showSaveFilePicker(o);
      await mffWrite(h);
      mffHandle=h;fileHandle=h;mffName=mffBase(h.name);doc.name=mffName;mffMark();mffRecentAdd(h);
      try{autosave();renderTree();renderProps();}catch(e){}
      try{faceEl.textContent='Enregistré sous '+h.name+'.';}catch(e){}
      return true;
    }catch(e){if(e&&e.name==='AbortError')return false;try{faceEl.textContent='Enregistrer sous : '+(e&&e.message||e);}catch(e2){}return false;}
  }
  // repli : téléchargement
  try{const data=await mffData();const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.download=fname;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);mffMark();return true;}catch(e){return false;}
}
async function mffLoadText(txt,name,handle){
  // vide l'espace PUIS charge (document + trajectoires), sans demander : l'appelant a déjà confirmé
  try{if(typeof faoVw!=='undefined'&&faoVw&&typeof faoViewerOpen==='function')faoViewerOpen();}catch(e){} // simulation fermée
  try{docResetEmpty();}catch(e){}
  const nm=mffBase(name);
  if(bundleIs(txt))await bundleRestore(txt,{name:nm});
  else{await deserialise(txt);doc.name=nm;rebuild();}
  mffHandle=handle||null;fileHandle=mffHandle;mffName=nm;
  try{renderTree();renderProps();}catch(e){}
  try{showAll();}catch(e){}
  mffMark();
  setTimeout(mffMark,1500); // après le rejeu complet (le document se normalise à l'ouverture)
  if(handle)mffRecentAdd(handle);
  try{faceEl.textContent='Ouvert : '+(handle?handle.name:name)+'.';}catch(e){}
}
async function mffOpenHandle(h){
  try{
    if(!(await mffPerm(h,'read')))throw new Error('permission refusée');
    const f=await h.getFile();await mffLoadText(await f.text(),f.name,h);return true;
  }catch(e){alert('Ouverture impossible : '+(e&&e.message||e));return false;}
}
async function mffOpen(){
  if(!(await mffConfirmDiscard()))return;
  if(MFF_FS){
    try{
      const o={types:MFF_TYPES,multiple:false};if(mffFolder)o.startIn=mffFolder;
      const [h]=await window.showOpenFilePicker(o);if(h)await mffOpenHandle(h);
    }catch(e){if(!(e&&e.name==='AbortError'))alert('Ouverture impossible : '+(e&&e.message||e));}
    return;
  }
  mffPendingOpen=true;try{document.getElementById('fileProj').click();}catch(e){}
}
let mffPendingOpen=false;
async function mffNew(){
  if(!(await mffConfirmDiscard()))return;
  try{if(typeof faoVw!=='undefined'&&faoVw&&typeof faoViewerOpen==='function')faoViewerOpen();}catch(e){}
  docResetEmpty();mffHandle=null;mffName='';
  markDirty();rebuild();renderProps();try{renderTree();showAll();}catch(e){}
  mffSavedSig=null;mffTitle();
  try{faceEl.textContent='Nouveau modèle. Créez une esquisse.';}catch(e){}
}
/* ---- fichiers récents (liens mémorisés) ---- */
async function mffRecentList(){try{const l=await idbGet('mff:recent');return Array.isArray(l)?l:[];}catch(e){return [];}}
async function mffRecentAdd(h){
  try{
    const l=await mffRecentList();const out=[{name:h.name,h:h,at:Date.now()}];
    for(const it of l){if(out.length>=8)break;let same=false;try{same=it.h&&(await it.h.isSameEntry(h));}catch(e){}if(!same)out.push(it);}
    await idbSet('mff:recent',out);
  }catch(e){}
}
async function mffRecentMenu(anchor){
  const l=await mffRecentList();
  const items=l.length?l.map(it=>({html:'<span style="opacity:.6">🕘</span> '+it.name.replace(/</g,'&lt;'),fn:async()=>{if(await mffConfirmDiscard())mffOpenHandle(it.h);}})):[{html:'<span style="opacity:.6">Aucun fichier récent</span>',fn:()=>{}}];
  if(l.length)items.push({html:'<span style="opacity:.6">✕ Vider la liste</span>',fn:()=>{idbSet('mff:recent',[]).catch(()=>{});}});
  mfPop(anchor,items);
}
/* ---- dossier de projets ---- */
async function mffFolderLoad(){try{const h=await idbGet('mff:folder');if(h)mffFolder=h;}catch(e){}}
async function mffFolderChoose(){
  try{const h=await window.showDirectoryPicker({id:'minifusion-projets',mode:'readwrite'});mffFolder=h;await idbSet('mff:folder',h);return h;}catch(e){return null;}
}
async function mffFolderPanel(){
  const old=document.getElementById('mffPanel');if(old){old.remove();return;}
  if(!MFF_FS){alert('Le dossier de projets demande Chrome ou Edge (API d’accès aux fichiers).');return;}
  if(!mffFolder)await mffFolderLoad();
  const pn=document.createElement('div');pn.id='mffPanel';pn.className='mffPanel';
  const close=()=>pn.remove();
  const head=document.createElement('div');head.className='mffHead';
  const t=document.createElement('b');t.textContent='Dossier de projets';head.appendChild(t);
  const x=document.createElement('button');x.textContent='✕';x.title='Fermer';x.onclick=close;head.appendChild(x);
  pn.appendChild(head);
  const body=document.createElement('div');body.className='mffBody';pn.appendChild(body);
  document.body.appendChild(pn);
  const draw=async()=>{
    body.innerHTML='';
    const bar=document.createElement('div');bar.className='mffBar';
    const ch=document.createElement('button');ch.textContent=mffFolder?'Changer de dossier…':'Choisir un dossier…';ch.onclick=async()=>{if(await mffFolderChoose())draw();};bar.appendChild(ch);
    if(mffFolder){const sv=document.createElement('button');sv.className='primary';sv.textContent='Enregistrer ici';sv.title='Enregistrer la pièce courante dans ce dossier';
      sv.onclick=async()=>{const nm=prompt('Nom du fichier :',(mffName||doc.name||'piece').replace(/[\\/:*?"<>|]/g,'_'));if(!nm)return;
        try{if(!(await mffPerm(mffFolder,'readwrite')))return;const h=await mffFolder.getFileHandle(mffBase(nm)+'.miniFusion',{create:true});await mffWrite(h);mffHandle=h;fileHandle=h;mffName=mffBase(h.name);doc.name=mffName;mffMark();mffRecentAdd(h);try{renderTree();renderProps();}catch(e){}draw();}catch(e){alert('Enregistrement impossible : '+(e&&e.message||e));}};
      bar.appendChild(sv);}
    body.appendChild(bar);
    if(!mffFolder){const n=document.createElement('div');n.className='mffNote';n.textContent='Choisissez le dossier où vous rangez vos pièces : la liste de ses projets apparaîtra ici (double-clic pour ouvrir).';body.appendChild(n);return;}
    const path=document.createElement('div');path.className='mffNote';path.textContent='📁 '+mffFolder.name;body.appendChild(path);
    if(!(await mffPerm(mffFolder,'read'))){const n=document.createElement('div');n.className='mffNote';n.textContent='Permission nécessaire : cliquez « Changer de dossier… » ou rouvrez ce panneau.';body.appendChild(n);return;}
    const files=[];
    try{for await(const [nm,h] of mffFolder.entries()){if(h.kind==='file'&&/\.(miniFusion|json)$/i.test(nm)){let t=0;try{t=(await h.getFile()).lastModified;}catch(e){}files.push({nm,h,t});}}}catch(e){}
    files.sort((a,b)=>b.t-a.t);
    const list=document.createElement('div');list.className='mffList';
    if(!files.length){const n=document.createElement('div');n.className='mffNote';n.textContent='Aucun projet (.miniFusion) dans ce dossier.';list.appendChild(n);}
    files.forEach(f=>{const r=document.createElement('div');r.className='mffRow';if(mffHandle&&mffHandle.name===f.nm)r.classList.add('on');
      r.innerHTML='<span>'+f.nm.replace(/</g,'&lt;')+'</span><em>'+(f.t?new Date(f.t).toLocaleString('fr'):'')+'</em>';
      r.title='Double-clic : ouvrir';r.ondblclick=async()=>{if(await mffConfirmDiscard()){await mffOpenHandle(f.h);close();}};list.appendChild(r);});
    body.appendChild(list);
  };
  draw();
}
/* ---- branchement : boutons existants, bandeau, raccourcis ---- */
function mffCss(){
  if(document.getElementById('mffCss'))return;
  const st=document.createElement('style');st.id='mffCss';
  st.textContent=[
    '.mffDlgBg{position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center}',
    '.mffDlg{min-width:380px;max-width:520px;padding:18px 20px;border-radius:14px;background:var(--surface);background-color:var(--bg);border:1px solid var(--border);box-shadow:0 20px 50px rgba(0,0,0,.5);color:var(--text)}',
    '.mffMsg{font-size:.95rem;margin-bottom:16px;line-height:1.4}',
    '.mffBtns{display:flex;gap:8px;justify-content:flex-end}',
    '#mffName{font-size:.78rem;padding:3px 10px;border-radius:8px;color:var(--muted);max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:default}',
    '#mffName.mod{color:var(--text)}',
    '.mffPanel{position:fixed;right:16px;top:72px;z-index:8000;width:380px;max-height:70vh;display:flex;flex-direction:column;border-radius:14px;background-color:var(--bg);border:1px solid var(--border);box-shadow:0 20px 50px rgba(0,0,0,.45);color:var(--text)}',
    '.mffHead{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border)}',
    '.mffHead button{padding:2px 8px}',
    '.mffBody{padding:10px 14px;overflow:auto;display:flex;flex-direction:column;gap:8px}',
    '.mffBar{display:flex;gap:6px;flex-wrap:wrap}',
    '.mffNote{font-size:.75rem;color:var(--muted)}',
    '.mffList{display:flex;flex-direction:column;gap:2px}',
    '.mffRow{display:flex;justify-content:space-between;gap:10px;padding:6px 8px;border-radius:7px;cursor:pointer;font-size:.8rem}',
    '.mffRow:hover{background:rgba(127,127,127,.14)}.mffRow.on{background:var(--primary);color:#fff}',
    '.mffRow em{font-style:normal;font-size:.7rem;opacity:.65;white-space:nowrap}'
  ].join('\n');
  document.head.appendChild(st);
}
(function(){
  try{
    mffCss();
    const $$=id=>document.getElementById(id);
    // boutons historiques (menu Projet de l'interface classique) : même logique partout
    if($$('btnNew'))$$('btnNew').onclick=()=>mffNew();
    if($$('btnLoad'))$$('btnLoad').onclick=()=>mffOpen();
    if($$('btnSave'))$$('btnSave').onclick=()=>mffSave();
    if($$('btnSaveAs'))$$('btnSaveAs').onclick=()=>mffSaveAs();
    // repli sans API : le sélecteur de fichier historique confirme, vide puis charge
    const fp=$$('fileProj');
    if(fp){
      const nf=fp.cloneNode(true);fp.parentNode.replaceChild(nf,fp); // retire l'ancien gestionnaire
      nf.addEventListener('change',async e=>{
        const f=e.target.files[0];e.target.value='';if(!f)return;
        if(!mffPendingOpen&&!(await mffConfirmDiscard()))return;
        mffPendingOpen=false;
        try{await mffLoadText(await f.text(),f.name,null);}catch(err){alert('Projet illisible : '+err.message);}
      });
    }
    // menu Projet (classique) : + Ouvrir récent, Dossier de projets
    const nb=$$('btnNew'),menu=nb&&nb.parentNode;
    if(menu&&menu.classList&&menu.classList.contains('ddMenu')&&!$$('btnRecent')){
      const r=document.createElement('button');r.id='btnRecent';r.innerHTML='<i>🕘</i>Ouvrir récent…';r.title='Fichiers ouverts ou enregistrés récemment';r.onclick=e=>{e.stopPropagation();mffRecentMenu(r);};
      const f=document.createElement('button');f.id='btnFolder';f.innerHTML='<i>📁</i>Dossier de projets…';f.title='Explorer le dossier où vous rangez vos pièces';f.onclick=()=>mffFolderPanel();
      const k=document.createElement('button');k.id='btnBak';k.innerHTML='<i>🛟</i>Copie de secours…';k.title='Version précédente du fichier, gardée à chaque enregistrement (.bak à côté du fichier dans le dossier de projets, et dans le navigateur)';k.onclick=e=>{e.stopPropagation();mffBakMenu(k);};
      menu.appendChild(r);menu.appendChild(f);menu.appendChild(k);
    }
    // nom du fichier + point « modifié » à côté du logo (les deux interfaces)
    const brand=document.querySelector('.topbar .brand');
    if(brand&&!$$('mffName')){const n=document.createElement('span');n.id='mffName';brand.parentNode.insertBefore(n,brand.nextSibling);}
    setInterval(mffTitle,1000);
    // raccourcis : Ctrl+S, Ctrl+Maj+S, Ctrl+O
    document.addEventListener('keydown',e=>{
      if(!(e.ctrlKey||e.metaKey))return;const k=(e.key||'').toLowerCase();
      if(k==='s'){e.preventDefault();e.stopPropagation();(e.shiftKey?mffSaveAs:mffSave)();}
      else if(k==='o'){e.preventDefault();e.stopPropagation();mffOpen();}
    },true);
    mffFolderLoad();
    // brouillon restauré au démarrage : il n'est sur AUCUN fichier → compté « non enregistré »
    setTimeout(mffTitle,2500);
  }catch(e){}
})();
