/* ---------- suppression de face dans un Web Worker (V0.15.9) ----------
   BRepAlgoAPI_Defeaturing va de 0,4 s à plus de dix minutes sur une même pièce (Cavité
   Usinage : un cylindre 33×33×23 tient le noyau 579 s puis le fait planter) et ce build ne
   sait pas l'interrompre. Le calcul part donc dans un worker qui charge SON noyau OCCT :
   l'interface ne gèle plus, le corps reste affiché sans la suppression (« calcul en
   cours… »), et au bout de DEL_WK_DELAI le worker est arrêté net — la fonction prend ⚠
   « le noyau ne sait pas supprimer ces faces en un temps raisonnable ».
   • Aller-retour du solide en BRep natif (BRepTools.Write_2 / Read_2 par le FS du noyau) :
     exact, ~10 ms, mêmes faces dans le même ordre. Les faces visées sont résolues ici par
     occFindFaceAny (comme au rejeu synchrone) et partent par leur RANG d'exploration.
   • Le worker exécute le MÊME code que le thread principal (occDelFacesTry et ses
     dépendances, sérialisées par delWkSource) : garde-fou de débord, reprise face par face
     bornée à DEL_ISOLE_MAX.
   • Résultat rangé par clé de point de contrôle (ckKey), comme le rejeu « STEP en cours de
     restauration » : la réponse relance le rejeu, qui le reprend tel quel.
   • Pas de worker (harnais Node, file:// sans accès au .wasm, démarrage raté) : calcul
     synchrone, comme avant. */
let DEL_WK_DELAI=20000; // ms ; réglable : localStorage minifusion_delFaceDelai (en secondes)
try{const s=+localStorage.getItem('minifusion_delFaceDelai');if(s>0)DEL_WK_DELAI=s*1000;}catch(e){}
const DEL_WK_SURSIS=2000; // ms ; après le délai, avant l'arrêt (voir delWkArm)
const DEL_WK_MARK='⧗';   // marque, dans ckKey, d'une suppression pas encore calculée
let delWk=null;          // {w, ready, job, timer, boot} : worker courant
let delWkOff=null;       // raison de l'abandon (démarrage impossible) → calcul synchrone
let delWkMod=null;       // WebAssembly.Module du premier worker, réemployé après un arrêt
const delWkQ=[];         // travaux en attente {key, fid, brep, idx}
const delWkRes=new Map(); // ckKey → {st:'run'|'fin', sig, brep|null, kept, err, warnings, ms, delai?}
// Une même entrée (objet) peut être rangée sous PLUSIEURS clés : le rejeu change de clé pour le
// même travail (référence de face complétée d'une ancre d'esquisse au rejeu suivant) — sans
// cela la suppression était calculée deux fois. sig = fonction + rangs des faces + clé du
// solide d'entrée (préfixe du rejeu) — pas les octets BRep : deux copies du même solide ne
// s'écrivent pas pareil, et la triangulation d'affichage s'y ajoute après le premier rejeu.
const DEL_WK_RES_MAX=32;

// Chemin COURT obligatoire : au-delà de ~10 caractères, la chaîne passée à BRepTools.Write_2 /
// Read_2 arrive mangée au C++ (fichier « ('򀋀 » à la racine, FS error 44 à la relecture) —
// même build qui ignore les noms de paramètres d'Interface_Static (V0.15.5).
const DEL_BREP_PATH='/d.brep';
function occBrepWrite(sh){
  // Solide → octets BRep natifs (exact, topologie et ordre des faces conservés).
  const p=DEL_BREP_PATH;
  try{occt.FS.unlink(p);}catch(e){}
  const pi=new occt.Handle_Message_ProgressIndicator_1();
  try{if(!occt.BRepTools.Write_2(sh,p,pi))throw new Error('écriture BRep refusée');}
  finally{try{pi.delete();}catch(e){}}
  const b=occt.FS.readFile(p);
  try{occt.FS.unlink(p);}catch(e){}
  return b;
}
function occBrepRead(bytes){
  const p=DEL_BREP_PATH;
  occt.FS.writeFile(p,bytes);
  const s=new occt.TopoDS_Shape(),B=new occt.BRep_Builder(),pi=new occt.Handle_Message_ProgressIndicator_1();
  try{
    if(!occt.BRepTools.Read_2(s,p,B,pi)||s.IsNull()){try{s.delete();}catch(e){}throw new Error('lecture BRep refusée');}
    return s;
  }finally{try{B.delete();}catch(e){}try{pi.delete();}catch(e){}try{occt.FS.unlink(p);}catch(e){}}
}
function delWkUsable(){
  try{
    return !delWkOff&&typeof Worker==='function'&&typeof Blob==='function'&&typeof URL!=='undefined'&&!!URL.createObjectURL
      &&!!(occt&&occt.BRepTools&&occt.BRepTools.Write_2&&occt.BRepTools.Read_2);
  }catch(e){return false;}
}
function delWkMain(){
  // Corps du worker : sérialisé par delWkSource, jamais appelé sur le thread principal.
  self.onmessage=async ev=>{
    const m=ev.data||{};
    const ko=e=>self.postMessage({t:'ko',err:String((e&&e.message)||e)});
    if(m.t==='boot'){
      try{
        self.importScripts(m.js);
        const fac=self.opencascadeFactory||self.opencascade;
        let mod=m.mod||null;
        occt=await fac({
          locateFile:()=>m.wasm,
          instantiateWasm(info,recv){
            (async()=>{
              if(!mod){
                try{mod=await WebAssembly.compileStreaming(fetch(m.wasm));}
                catch(e){const r=await fetch(m.wasm);mod=await WebAssembly.compile(await r.arrayBuffer());}
              }
              recv(await WebAssembly.instantiate(mod,info),mod);
            })().catch(ko);
            return {};
          }
        });
        occtReady=true;
        try{self.postMessage({t:'pret',mod});}catch(e){self.postMessage({t:'pret'});}
      }catch(e){ko(e);}
      return;
    }
    if(m.t!=='job')return;
    self.postMessage({t:'debut',id:m.id});
    const t0=Date.now();let s=null,hs=[];
    const fin=o=>self.postMessage(Object.assign({t:'fin',id:m.id,kept:0,err:null,warnings:[],brep:null,ms:Date.now()-t0},o));
    try{
      s=occBrepRead(m.brep);
      hs=m.idx.map(i=>occFaceAt(s,i));
      if(hs.some(h=>!h))throw new Error('face introuvable après transfert au worker');
      const res=occDelFacesTry(s,hs);
      const brep=res.r?occBrepWrite(res.r):null;
      if(res.r)try{res.r.delete();}catch(e){}
      fin({kept:res.kept,err:res.err,warnings:res.warnings,brep});
    }catch(e){fin({err:String((e&&e.message)||e)});}
    finally{hs.forEach(h=>{try{if(h)h.delete();}catch(e){}});if(s)try{s.delete();}catch(e){}}
  };
}
function delWkSource(){
  // Le worker reçoit le code de CE fichier et de 20-noyau, pas une copie à entretenir.
  // + rattrapage des exceptions C++ du noyau (V0.15.8, 96-noyau) : la colle chargée par
  // importScripts cherche ___cxa_can_catch sur self — posée AVANT ce chargement.
  const fns=[occBinPush,occDispose,occUnifyKeepEdges,occUnify,occCoqueValide,occBoxMinMax,occDelFaceDebord,
    occDeleteFacesOnce,occDelFacesTry,occBrepWrite,occBrepRead,occFaceAt,occtTypeName,occtCanCatch,occtExcInstall];
  return 'let occt=null,occtReady=false;const DEL_ISOLE_MAX='+DEL_ISOLE_MAX+',DEL_BREP_PATH='+JSON.stringify(DEL_BREP_PATH)+';\n'+fns.map(String).join('\n')+'\nocctExcInstall(self);\n('+delWkMain+')();\n';
}
function delWkStart(){
  if(delWk)return delWk;
  const url=URL.createObjectURL(new Blob([delWkSource()],{type:'text/javascript'}));
  const me={w:new Worker(url),ready:false,job:null,timer:null,boot:null};
  delWk=me;
  me.w.onmessage=ev=>delWkMsg(me,ev.data||{});
  me.w.onerror=ev=>{try{ev.preventDefault();}catch(e){}delWkCrash(me,(ev&&ev.message)||'erreur du worker');};
  me.boot=setTimeout(()=>delWkCrash(me,'démarrage du noyau de calcul trop long'),180000);
  const msg={t:'boot',js:occtFileUrl('occt/opencascade.full.js'),wasm:occtFileUrl('occt/opencascade.wasm.wasm'),mod:delWkMod};
  try{me.w.postMessage(msg);}catch(e){msg.mod=null;me.w.postMessage(msg);}
  return me;
}
function delWkStop(me){
  try{clearTimeout(me.timer);clearTimeout(me.boot);}catch(e){}
  try{me.w.terminate();}catch(e){}
  if(delWk===me)delWk=null;
}
function delWkMsg(me,m){
  if(me!==delWk)return;
  if(m.t==='pret'){me.ready=true;clearTimeout(me.boot);if(m.mod)delWkMod=m.mod;delWkPump();return;}
  if(m.t==='ko'){delWkCrash(me,m.err);return;}
  if(m.t==='debut'){
    me.sursis=false;
    delWkArm(me,()=>delWkTimeout(me),DEL_WK_DELAI);
    return;
  }
  if(m.t==='fin'&&me.job&&me.job.key===m.id){
    clearTimeout(me.timer);me.job=null;
    delWkFin(m.id,{brep:m.brep||null,kept:m.kept|0,err:m.err,warnings:m.warnings||[],ms:m.ms});
    delWkPump();
    delWkReplay(m.id);
  }
}
function delWkArm(me,fn,ms){
  // V0.15.15 : minuteur du délai. Pendant un rejeu synchrone (16 s sur un gros STEP), le fil
  // principal est bloqué : la « fin » du worker arrive dans la file mais n'est pas lue, et
  // le minuteur échu pouvait passer AVANT elle → abandon à tort d'un calcul fini (plateau
  // de l'utilisateur : 6 faces en 11 s, ⚠ « arrêté après 20 s »). Un minuteur qui se
  // déclenche en retard se replace donc derrière la file avant de décider.
  clearTimeout(me.timer);
  const du=performance.now()+ms;
  me.timer=setTimeout(()=>{
    if(performance.now()-du>200)me.timer=setTimeout(fn,0);
    else fn();
  },ms);
}
function delWkTimeout(me){
  // Délai dépassé : le noyau ne s'interrompt pas, on arrête le worker entier. Le suivant
  // repart du module wasm déjà compilé (delWkMod). Avant d'arrêter : un sursis de
  // DEL_WK_SURSIS, le temps qu'une « fin » déjà envoyée soit lue.
  if(me!==delWk||!me.job)return;
  if(!me.sursis){me.sursis=true;delWkArm(me,()=>delWkTimeout(me),DEL_WK_SURSIS);return;}
  const j=me.job;
  delWkStop(me);
  delWkFin(j.key,{brep:null,kept:0,warnings:[],ms:DEL_WK_DELAI,delai:true,
    err:`le noyau ne sait pas supprimer ces faces en un temps raisonnable (calcul arrêté après ${Math.round(DEL_WK_DELAI/1000)} s)`+(j.idx.length>1?' — essayez-les séparément':'')});
  if(delWkQ.length)delWkStart();
  delWkReplay(j.key);
}
function delWkCrash(me,why){
  if(me!==delWk)return;
  const j=me.job;
  delWkStop(me);
  if(!me.ready){
    // Démarrage impossible (file://, .wasm illisible…) : retour au calcul synchrone d'avant.
    delWkOff=String(why||'?');
    try{console.warn('[Suppression de face] worker indisponible ('+delWkOff+') — calcul sur le thread principal');}catch(e){}
    delWkQ.length=0;
    delWkRes.forEach((v,k)=>{if(v.st==='run')delWkRes.delete(k);});
    delWkReplay(null);
    return;
  }
  // Le noyau du worker a planté en plein calcul (mémoire…) : échec de CE travail seulement.
  if(j)delWkFin(j.key,{brep:null,kept:0,warnings:[],ms:0,err:`le noyau s'est arrêté pendant le calcul (${why})`});
  if(delWkQ.length)delWkStart();
  if(j)delWkReplay(j.key);
}
function delWkFin(key,v){
  // Fin d'un travail : l'entrée est COMPLÉTÉE en place (ses alias la voient), puis les plus
  // anciennes finies sont oubliées.
  const e=delWkRes.get(key)||{sig:null};
  Object.assign(e,v,{st:'fin'});
  delWkRes.delete(key);delWkRes.set(key,e);
  for(const [k,x] of delWkRes){if(delWkRes.size<=DEL_WK_RES_MAX)break;if(x.st==='fin')delWkRes.delete(k);}
}
function delWkPump(){
  if(!delWk||!delWk.ready||delWk.job)return;
  const j=delWkQ.shift();if(!j)return;
  delWk.job=j;
  delWk.w.postMessage({t:'job',id:j.key,brep:j.brep,idx:j.idx});
}
function delWkAsk(key,result,hs,fid,ckPre){
  // Rejeu : résultat du worker pour cette clé, ou {pending} (calcul lancé / en cours).
  // ckPre : clé du solide d'entrée (préfixe du rejeu avant la fonction).
  // → {pending:true,msg} | {res:{r,kept,err,warnings}}
  const e=delWkRes.get(key);
  if(e&&e.st==='fin'){
    let r=null,err=e.err;
    if(e.brep){try{r=occBrepRead(e.brep);}catch(x){err=(x&&x.message)||String(x);}}
    return{res:{r,kept:r?e.kept:0,err:err||'résultat illisible',warnings:e.warnings.slice()}};
  }
  if(e)return{pending:true,msg:'calcul en cours… (corps affiché sans la suppression)'};
  // Suppression précédente du même corps encore en calcul : son entrée n'est pas encore le
  // solide de cette clé — on attend sa réponse plutôt que de calculer à côté.
  if(key.includes(DEL_WK_MARK))return{pending:true,msg:'en attente de la suppression précédente…'};
  const idx=[];
  const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
  const ex=new occt.TopExp_Explorer_2(result,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);
  for(let k=0;ex.More();k++,ex.Next()){const c=ex.Current();hs.forEach((h,i)=>{if(idx[i]==null&&c.IsSame(h))idx[i]=k;});}
  try{ex.delete();}catch(x){}
  if(idx.length<hs.length||idx.some(v=>v==null))return{res:null}; // inattendu : synchrone
  let brep;
  try{brep=occBrepWrite(result);}catch(x){return{res:null};}
  // Même travail déjà lancé ou fini sous une autre clé : on le partage (alias).
  const sig=fid+'|'+idx.join(',')+'|'+(ckPre||'');
  for(const x of delWkRes.values())if(x.sig===sig){delWkRes.set(key,x);return delWkAsk(key,result,hs,fid,ckPre);}
  // Une nouvelle version de la même fonction (édition) rend caduques ses travaux en attente.
  for(let i=delWkQ.length-1;i>=0;i--)if(delWkQ[i].fid===fid){delWkRes.delete(delWkQ[i].key);delWkQ.splice(i,1);}
  delWkRes.set(key,{st:'run',sig});
  delWkQ.push({key,fid,brep,idx});
  try{delWkStart();}catch(x){delWkOff=(x&&x.message)||String(x);delWkQ.length=0;delWkRes.delete(key);return{res:null};}
  delWkPump();
  return{pending:true,msg:'calcul en cours… (corps affiché sans la suppression)'};
}
function delWkPending(){
  // Nombre de suppressions encore attendues (en cours + en file).
  const s=new Set();delWkRes.forEach(v=>{if(v.st==='run')s.add(v);});return s.size;
}
function delWkReplay(key){
  // Réponse du worker : le rejeu reprend le résultat rangé sous sa clé.
  setTimeout(()=>{
    try{builtVersion=-1;builtHash=null;builtEngine=null;rebuild();}catch(e){}
    try{if(sel&&sel.kind==='feature')renderProps();}catch(e){}
    const e=key&&delWkRes.get(key);
    if(!e||delWkPending())return;
    try{
      faceEl.textContent=e.err&&!e.brep
        ?'⚠ Suppression de face : '+e.err+' (voir ⚠ dans l\'arbre, Ctrl+Z pour annuler).'
        :'Suppression de face : calcul terminé en '+(e.ms/1000).toFixed(1).replace('.',',')+' s.';
    }catch(x){}
  },0);
}
