// V0.8.3 : enregistrement sûr + copie .bak (97-fichiers-projets.js). Système de fichiers SIMULÉ
// en mémoire (création, fichier d'échange remplacé à la fermeture, abandon, tailles) : contrôle du
// contenu, copie de la version précédente à côté du fichier (dossier de projets) et dans le
// navigateur, écriture qui échoue → original intact, relecture fausse → version précédente remise,
// fichier hors du dossier (pas de .bak sur le disque), ouverture de la copie, Ctrl+S complet.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=`
    const ATT=[],OK=[];const att=(ok,msg)=>{(ok?OK:ATT).push(msg);};
    confirm=function(){return true;};alert=function(){};showAll=function(){}; // pas de caméra dans le banc
    // ── système de fichiers en mémoire ──
    const FS={},IDB={};let mode='ok';
    idbSet=async(k,v)=>{IDB[k]=v;};idbGet=async k=>IDB[k];
    const mkFile=path=>({kind:'file',name:path.split('/').pop(),_p:path,
      async getFile(){if(!(path in FS))throw new Error('NotFound');const t=FS[path];return {name:path.split('/').pop(),size:t.length,lastModified:1000,text:async()=>t};},
      async createWritable(){let buf='',aborted=false;return {
        write:async t=>{if(mode==='fail')throw new Error('disque plein');buf=t;},
        close:async()=>{if(aborted)return;if(mode==='short'&&!path.endsWith('.bak')){FS[path]=buf.slice(0,buf.length>>1);mode='ok';}else FS[path]=buf;},
        abort:async()=>{aborted=true;}};},
      async queryPermission(){return 'granted';},async requestPermission(){return 'granted';},
      async isSameEntry(o){return !!o&&o._p===path;}});
    const mkDir=prefix=>({kind:'directory',name:prefix.split('/').filter(Boolean).pop()||'projets',
      async getDirectoryHandle(n){return mkDir(prefix+n+'/');},
      async getFileHandle(n,o){const q=prefix+n;if(!(q in FS)){if(o&&o.create)FS[q]='';else throw new Error('NotFound');}return mkFile(q);},
      async resolve(h){return h&&h._p&&h._p.startsWith(prefix)?h._p.slice(prefix.length).split('/'):null;},
      async queryPermission(){return 'granted';},async requestPermission(){return 'granted';}});
    mffFolder=mkDir('projets/');
    // ── 1. contrôle du contenu ──
    docResetEmpty();doc.name='Bride';
    att(/vide/.test(mffCheckData(''))&&/illisible/.test(mffCheckData('{pas du json………………………}'))&&/pas un projet/.test(mffCheckData(JSON.stringify({x:1,y:'abcdefghijklmnopqrstuvwxyz'}))),'1 : contenu vide, illisible ou étranger : refusé');
    att(mffCheckData(serialise())===''&&mffCheckData(await bundleSerialise())==='','2 : document et projet complet (bundle) : acceptés');
    // ── 2. premier enregistrement dans le dossier : pas de copie ──
    const h=await mffFolder.getFileHandle('pieces/Bride.miniFusion',{create:true});
    const v1=serialise();
    let r=await mffWriteSafe(h,v1);
    att(FS['projets/pieces/Bride.miniFusion']===v1&&!r.bak.disk&&!('projets/pieces/Bride.miniFusion.bak' in FS),'3 : premier enregistrement : écrit, rien à copier');
    // ── 3. deuxième : la version précédente part en .bak (à côté) et dans le navigateur ──
    doc.params=[{name:'e',expr:'12',value:12}];const v2=serialise();
    r=await mffWriteSafe(h,v2);
    att(FS['projets/pieces/Bride.miniFusion']===v2,'4 : nouvelle version écrite');
    att(FS['projets/pieces/Bride.miniFusion.bak']===v1&&r.bak.disk==='Bride.miniFusion.bak','5 : version précédente copiée en « Bride.miniFusion.bak » à côté du fichier');
    att(IDB['mff:bak:Bride.miniFusion']&&IDB['mff:bak:Bride.miniFusion'].txt===v1,'6 : et gardée dans le navigateur');
    // même contenu : pas de copie inutile
    r=await mffWriteSafe(h,v2);
    att(FS['projets/pieces/Bride.miniFusion.bak']===v1&&!r.bak.disk,'7 : contenu inchangé : la copie n’est pas écrasée');
    // ── 4. contenu invalide : rien n'est touché ──
    let err='';try{await mffWriteSafe(h,'');}catch(e){err=e.message;}
    att(/annulé/.test(err)&&FS['projets/pieces/Bride.miniFusion']===v2&&FS['projets/pieces/Bride.miniFusion.bak']===v1,'8 : contenu vide : enregistrement annulé, fichier et copie intacts');
    // ── 5. l'écriture échoue : abandon, original intact ──
    doc.params[0].expr='14';doc.params[0].value=14;const v3=serialise();
    mode='fail';err='';try{await mffWriteSafe(h,v3);}catch(e){err=e.message;}mode='ok';
    att(/disque plein/.test(err)&&FS['projets/pieces/Bride.miniFusion']===v2,'9 : écriture en échec : abandonnée, la version d’avant reste sur le disque');
    // ── 6. relecture fausse (fichier tronqué) : version précédente remise ──
    mode='short';err='';try{await mffWriteSafe(h,v3);}catch(e){err=e.message;}mode='ok';
    att(/relecture/.test(err)&&FS['projets/pieces/Bride.miniFusion']===v2,'10 : fichier tronqué à la relecture : version précédente remise ('+err.slice(0,60)+')');
    // ── 7. fichier hors du dossier de projets : copie dans le navigateur seulement ──
    FS['ailleurs/Axe.miniFusion']=v1;const hx=mkFile('ailleurs/Axe.miniFusion');
    r=await mffWriteSafe(hx,v2);
    att(FS['ailleurs/Axe.miniFusion']===v2&&!r.bak.disk&&r.bak.idb&&!('ailleurs/Axe.miniFusion.bak' in FS),'11 : hors du dossier de projets : pas de .bak sur le disque, copie dans le navigateur');
    // ── 8. Ctrl+S complet ──
    mffHandle=h;doc.params[0].expr='16';doc.params[0].value=16;
    const ok=await mffSave();
    att(ok&&/Bride\\.miniFusion\\.bak/.test(faceEl.textContent),'12 : Ctrl+S : enregistré, le message nomme la copie ('+faceEl.textContent+')');
    att(mffCheckData(FS['projets/pieces/Bride.miniFusion'])===''&&FS['projets/pieces/Bride.miniFusion.bak']===v2,'13 : projet complet écrit, copie = version d’avant');
    // ── 9. copies trouvées, ouverture de la copie ──
    const L=await mffBakFind(h);
    att(L.length===2&&L.some(c=>c.where==='disk')&&L.some(c=>c.where==='idb'),'14 : deux copies de secours proposées (disque, navigateur)');
    mffAsk=async()=>'drop';
    const cd=L.find(c=>c.where==='disk');
    await mffBakOpen(cd);
    att(doc.params.length===1&&doc.params[0].value===12&&mffHandle===h,'15 : copie ouverte (e = 12), rattachée au même fichier');
    return {ATT,OK};
  `;
  const o=await vm.runInContext('(async function(){'+R+'})()',ctx);
  console.log('=== V0.8.3 : enregistrement sûr, copie .bak ===');
  o.OK.forEach(m=>console.log('  ✓ '+m));
  if(o.ATT.length){o.ATT.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.ATT.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
