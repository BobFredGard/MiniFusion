/* ---------- OCCT exact (opencascade.js 1.1.4 vendu localement) ---------- */
/* V0.15.8 : rattrapage des exceptions C++ du noyau. La colle Emscripten de ce build appelle
   ___cxa_can_catch (« ce catch(T&) attrape-t-il une exception de type U ? ») sans que le
   .wasm ne l'exporte ni que la colle ne la définisse : dès qu'OCCT lançait une exception
   d'un type DÉRIVÉ de celui de son propre catch (Standard_ConstructionError attrapée par
   catch(Standard_Failure&), cas courant dans les booléens, la suppression de face…), on
   avait « ReferenceError: ___cxa_can_catch is not defined » : l'opération entière avortait
   au lieu que le noyau se rattrape (plantages après 64 s / 579 s sur le plateau et la
   Cavité). L'identifiant libre se résout sur l'objet global : on l'y définit AVANT le
   chargement de la colle. Réponse = vrai test d'héritage sur les type_info Itanium lus dans
   la mémoire du noyau ; module inconnu → « oui » (toutes les exceptions OCCT dérivent de
   Standard_Failure, l'attrapé courant). */
function occtTypeName(H8,H32,t){
  // Nom (mangled) d'un std::type_info : [vptr, const char* name] ; null si illisible.
  try{
    if(!(t>0)||(t>>2)+1>=H32.length)return null;
    let p=H32[(t+4)>>2],s='';
    if(!(p>0)||p>=H8.length)return null;
    for(let i=0;i<256&&p+i<H8.length;i++){const c=H8[p+i];if(!c)break;s+=String.fromCharCode(c);}
    return /^[0-9A-Za-z_]{2,255}$/.test(s)?s:null;
  }catch(e){return null;}
}
function occtCanCatch(H8,H32,caught,thrown){
  // Le type `thrown` est-il `caught` ou en dérive-t-il ? Parcours des bases (wasm32) :
  // __si_class_type_info = [vptr, nom, base*] ; __vmi_class_type_info = [vptr, nom, flags,
  // nb_bases, {base*, offset_flags}…]. Une base n'est suivie que si elle a un nom lisible.
  if(!caught||!thrown)return false;
  const cn=occtTypeName(H8,H32,caught);
  const vu=new Set(),file=[thrown];
  while(file.length&&vu.size<64){
    const t=file.shift();
    if(vu.has(t))continue;vu.add(t);
    if(t===caught)return true;
    const tn=occtTypeName(H8,H32,t);
    if(cn&&tn===cn)return true; // même type vu par deux unités de compilation
    if(!tn)continue;
    const b=H32[(t+8)>>2];
    if(occtTypeName(H8,H32,b)){file.push(b);continue;} // héritage simple
    const flags=H32[(t+8)>>2],n=H32[(t+12)>>2];       // héritage multiple / virtuel
    if(flags>=0&&flags<=3&&n>0&&n<16)
      for(let i=0;i<n;i++){const bi=H32[(t+16+8*i)>>2];if(occtTypeName(H8,H32,bi))file.push(bi);}
  }
  return false;
}
function occtExcInstall(G){
  // Pose les deux fonctions sur l'objet global G (page, ou worker de 21-suppression-face :
  // `occt` y désigne alors le noyau du worker).
  if(typeof G.___cxa_can_catch!=='function')G.___cxa_can_catch=function(caught,thrown){
    let M=null;try{M=(typeof occt!=='undefined'&&occt&&occt.HEAP32&&occt.HEAPU8)?occt:null;}catch(e){M=null;}
    if(!M)return 1;
    try{return occtCanCatch(M.HEAPU8,M.HEAP32,caught,thrown)?1:0;}catch(e){return 1;}
  };
  // Exceptions lancées par pointeur : OCCT n'en lance pas (valeurs / handles).
  if(typeof G.___cxa_is_pointer_type!=='function')G.___cxa_is_pointer_type=function(){return 0;};
}
occtExcInstall((typeof globalThis!=='undefined')?globalThis:window);
function occtFileUrl(p){ // chemin relatif : marche en http(s) comme en file://
  try{const b=document.currentScript&&document.currentScript.src?document.currentScript.src:location.href;
    return new URL(p,b).href;}catch(e){return p;}
}
function occIdbOpen(){
  if(typeof indexedDB==='undefined'||!indexedDB.open)return Promise.reject(new Error('IndexedDB indisponible'));
  return new Promise((res,rej)=>{
    try{
      const r=indexedDB.open('minifusion_occ',1);
      r.onupgradeneeded=()=>{try{r.result.createObjectStore('wasm');}catch(e){}};
      r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);
    }catch(e){rej(e);}
  });
}
function idbBytes(v){
  // Selon le navigateur, IndexedDB redonne un ArrayBuffer ou un octet[] — on normalise.
  try{if(v instanceof ArrayBuffer)return v;
    if(v&&typeof v.buffer==='object'&&v.buffer instanceof ArrayBuffer&&typeof v.byteOffset==='number'&&typeof v.byteLength==='number')
      return v.buffer.slice(v.byteOffset,v.byteOffset+v.byteLength);}catch(e){}
  return null;
}
function occCacheSave(buf){
  const arr=idbBytes(buf);if(!arr)return Promise.resolve();
  return occIdbOpen().then(db=>new Promise((res,rej)=>{
    try{
      const tx=db.transaction('wasm','readwrite');tx.objectStore('wasm').put(arr,'kernel');
      tx.oncomplete=()=>{try{db.close();}catch(e){}res();};
      tx.onerror=()=>{try{db.close();}catch(e){}rej(tx.error||new Error('idb put'));};
    }catch(e){rej(e);}
  })).catch(()=>{});
}
function occCacheLoad(){
  return occIdbOpen().then(db=>new Promise((res,rej)=>{
    try{
      const tx=db.transaction('wasm','readonly');const q=tx.objectStore('wasm').get('kernel');
      q.onsuccess=()=>{const v=q.result;try{db.close();}catch(e){}
        const b=idbBytes(v);b?res(b):rej(new Error('cache vide'));};
      q.onerror=()=>{try{db.close();}catch(e){}rej(q.error||new Error('idb get'));};
    }catch(e){rej(e);}
  }));
}
(async()=>{
  if(window.__occBootDone)return; // garde anti-double-démarrage (import lent + repli script)
  window.__occBootDone=true;
  const t0=performance.now();
  const stage=s=>{occBaseMsg='OCCT : '+s;occStatus();try{console.log('[OCCT] '+s);}catch(e){}};
  const fail=(where,err)=>{
    occtReady=false;
    const m=String((err&&(err.message||err))||err||'?').slice(0,160);
    occBaseMsg=`OCCT : échec ${where} (${m}) — repli maillage. Vérifiez ${occtFileUrl('occt/opencascade.wasm.wasm')} (65 Mo attendus).`;
    occStatus();
  };
  const withTimeout=(p,ms,what)=>Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error('délai dépassé '+what)),ms))]);
  stage('chargement JS noyau (0,3 Mo)…');
  // Laisse le navigateur peindre l'étape AVANT la compilation : sans cela le message
  // s'affiche après coup, quand la tabulation est déjà gelée.
  const yieldUI=()=>new Promise(r=>{try{requestAnimationFrame(()=>setTimeout(r,0));}catch(e){setTimeout(r,0);}});
  const boot=async factory=>{
    stage('JS noyau OK, compilation wasm (~65 Mo, ~10-60 s) — interface momentanément figée…');
    await yieldUI();
    occt=await withTimeout(factory({locateFile:p=>String(p).endsWith('.wasm')?'occt/opencascade.wasm.wasm':p}),180000,'compilation wasm');
    occBaseMsg=`OCCT : prêt en ${((performance.now()-t0)/1000).toFixed(0)} s — vérification…`;occStatus();
    await occtFinishBoot();
  };
  const bootBin=async(factory,bin)=>{
    stage('JS noyau OK, compilation depuis le cache local (~65 Mo) — interface momentanément figée…');
    await yieldUI();
    try{
      occt=await withTimeout(factory({wasmBinary:bin,locateFile:p=>String(p).endsWith('.wasm')?'occt/opencascade.wasm.wasm':p}),180000,'compilation wasm');
      occBaseMsg=`OCCT : prêt depuis le cache local en ${((performance.now()-t0)/1000).toFixed(0)} s — vérification…`;occStatus();
      await occtFinishBoot();
    }catch(e){fail('démarrage (cache)',e);}
  };
  // Mode fichier (file://) : le fetch du .wasm est bloqué par CORS → après la première
  // désignation manuelle (mise en cache IndexedDB), le noyau se relance AUTOMATIQUEMENT.
  // SANS cache exploitable, on ne tente RIEN : en file:// le .wasm ne peut pas être lu, et la
  // compilation des ~65 Mo monopolise le thread principal (onglet figé, aucun message) —
  // on reste en moteur maillage avec une explication claire.
  const isFile=location.protocol==='file:'||location.protocol==='about:';
  let cached=null;
  if(isFile){try{cached=await occCacheLoad();}catch(e){cached=null;}}
  if(isFile&&!cached){
    occtReady=false;
    occBaseMsg='OCCT : noyau exact indisponible en mode fichier (le .wasm ne peut pas être lu en file://) — moteur maillage utilisé. Pour le noyau exact : servez le dossier en localhost, ou désignez le .wasm une fois via « ⚙ Noyau .wasm… ».';
    occStatus();
    return;
  }
  try{
    const mod=await withTimeout(import(occtFileUrl('occt/opencascade.full.js')),30000,'chargement JS');
    const factory=mod.default||mod.opencascadeFactory||window.opencascadeFactory||window.opencascade;
    if(typeof factory!=='function')throw new Error('factory absente (import vide ?)');
    if(cached){await bootBin(factory,cached);return;}
    await boot(factory);return;
  }catch(e1){
    try{
      stage('import ESM impossible, essai script classique…');
      await withTimeout(new Promise((res,rej)=>{const s=document.createElement('script');s.src='occt/opencascade.full.js';s.onload=res;s.onerror=()=>rej(new Error('script 404/erreur'));document.head.appendChild(s);}),30000,'chargement script');
      const factory=window.opencascadeFactory||window.opencascade;
      if(typeof factory!=='function')throw new Error('factory absente (script)');
      if(cached){await bootBin(factory,cached);return;}
      await boot(factory);
    }catch(e2){fail('démarrage',e2&&e2.message?e2:(e1&&e1.message?e1:e1));}
  }
})();

