/* ---------- OCCT exact (opencascade.js 1.1.4 vendu localement) ---------- */
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
    occBaseMsg=`OCCT : échec ${where} (${m}) — repli maillage. Vérifiez http://localhost:3000/occt/opencascade.wasm.wasm (65 Mo attendus).`;
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

