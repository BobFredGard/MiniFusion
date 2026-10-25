/* ----- cache de parcours + de maillage -----
   Une même opération était recalculée 6 à 8 fois PAR INTERACTION souris
   (arbre, aperçu, fiche, stats, temps, viewer…) — pour l'ébauche 3D cela
   coûtait 6 × 76 s de gel. Le maillage OCCT et les moves sont donc mis en
   cache, invalidés par la clé ci-dessous.
   Clé = génér. de corps maillés + opération + posage, SANS les champs
   purement UI (hidden / on / geoBlocked / limit.stale / open) : replier,
   sélectionner, afficher/masquer une trace = HIT instantané. */
let faoOpMovesMap=null, faoBodyMeshMap=null, faoBodyMeshFn=null, faoBodyGen=0;
function faoOpMovesHit(op){ try{ return faoOpMovesMap?faoOpMovesMap.get(op):null; }catch(e){ return null; } }
function faoOpMovesStore(op,key,mv){
  try{ if(!faoOpMovesMap)faoOpMovesMap=new WeakMap();
       faoOpMovesMap.set(op,{key:key,mv:mv}); }catch(e){}
}
function faoOpSig(op){
  const o={};
  const skip={hidden:1,on:1,geoBlocked:1,geoDiag:1,stale:1,cut:1,tangent:1}; // cut : vitesses/avances (2026-10-15-010) — aucun effet sur le tracé ; tangent : aide à la saisie des faces (2026-10-21-003)
  try{
    for(const k in op){
      if(!Object.prototype.hasOwnProperty.call(op,k)||skip[k])continue;
      const v=op[k];
      if(k==='limit'&&v&&typeof v==='object'){
        const L={};
        for(const kk in v) if(Object.prototype.hasOwnProperty.call(v,kk)&&kk!=='stale'&&kk!=='missing')L[kk]=v[kk];
        o.limit=L;
      }else if(k==='limit2'&&v&&typeof v==='object'){
        // 2026-10-08-003 : zone interieure — mêmes règles que la zone
        // extérieure : les drapeaux transitaires ne changent jamais la clé.
        const L2={};
        for(const kk in v) if(Object.prototype.hasOwnProperty.call(v,kk)&&kk!=='stale'&&kk!=='missing')L2[kk]=v[kk];
        o.limit2=L2;
      }else o[k]=v;
    }
  }catch(e){ return op; }
  // 2026-10-21-007 : version du traitement des faces rouges — seules les
  // opérations À intouchables changent de parcours (chaînes densifiées sous la
  // zone 3D, volume « devant la face ») : elles seules sont à régénérer, pas
  // tout le cache (CACHE_VER inchangé).
  if(Array.isArray(op&&op.protect)&&op.protect.length)o._redV=3; // 2026-10-22-006 : volume « devant » borné (peau du corps-brut, hauteur de la face)
  return o;
}
let faoMovesFpMap=null;
let faoFpParts=''; // derniere liste hachee par faoSetupFp : id:empreinte_nb par corps // WeakMap (maillage deja memoise) -> empreinte du contenu
function faoMeshFp(mm){
  // Empreinte CONTENUE du maillage d'un corps — identique d'une session a l'autre,
  // contrairement a faoBodyGen (compteur de session, repasse a 0 au F5). Quantification
  // a 0,001 mm : absorbe les ecarts d'arrondi entre deux executions du meme solide.
  // INDEPENDANTE DE L'ORDRE : deux rejeux du meme solide enumerent les faces autrement
  // (les positions de reference des filtres derivent de 1e-9 entre deux enregistrements
  //  -> meme contour, autre ordre de triangles). Hacher la sequence classait les memes
  // points dans un autre ordre = autre cle = « cache perdu a chaque rafraichissement »
  // alors que le solide ne bougeait pas d'un cheveu (sonde : empreinte TRIEE identique
  // sur les deux etats, empreinte sequentielle differente).
  if(!mm||!mm.v||!mm.v.length)return '0';
  if(!faoMovesFpMap){ try{ faoMovesFpMap=new WeakMap(); }catch(e){ faoMovesFpMap=null; } }
  if(faoMovesFpMap){ const e=faoMovesFpMap.get(mm); if(e)return e; }
  const v=mm.v, t=new Array(v.length);
  for(let i=0;i<v.length;i++){
    const p=v[i];
    t[i]=(Math.round(((p&&+p[0])||0)*1000)|0)+','+(Math.round(((p&&+p[1])||0)*1000)|0)+','+(Math.round(((p&&+p[2])||0)*1000)|0);
  }
  t.sort();
  const s=t.join('|');
  let h=2166136261;
  for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); }
  const fp=(h>>>0).toString(36)+'_'+v.length;
  if(faoMovesFpMap){ try{ faoMovesFpMap.set(mm,fp); }catch(e){} }
  return fp;
}
function faoSetupFp(job){
  // Solide machine par CE posage (corps reels du document, filtres comme faoActiveMesh).
  // 'nb' = pas encore de maillage (document non reconstruit) : la lecture differee
  // reessaiera plutot que de memoriser une cle fausse.
  try{
    if(typeof bodies==='undefined'||!bodies||!bodies.length)return 'nb';
    const only=(job&&Array.isArray(job.bodies))?job.bodies:null;
    const parts=[],diag=[];
    for(let bi=0;bi<bodies.length;bi++){
      const b=bodies[bi];
      if(!b||b.ghost||b.visible===false)continue;
      if(only&&only.indexOf(b.id)<0)continue;
      const mm=faoMeshFromBodyCached(b);
      if(!mm)continue;
      // Le hash porte la GEOMETRIE seule : l'identite du corps n'entre dans aucune
      // trajectoire (faoActiveMesh fusionne les maillages visibles, sans id). Un id
      // qui bouge entre deux sessions rendait la cle fausse alors que le solide et
      // le parcours étaient identiques. L'id reste dans la liste DIAGNOSTIC.
      const fp=faoMeshFp(mm);
      parts.push(fp);
      diag.push(String(b.id)+':'+fp);
    }
    if(!parts.length){ faoFpParts=''; return 'nb'; }
    const str=parts.join('|');
    faoFpParts=diag.join('|');
    let h=2166136261;
    for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}
    return (h>>>0).toString(36)+'_'+parts.length+faoFrameSig(job); // repère orienté : autre solide
  }catch(e){ return 'x'; }
}
function faoOpMovesKey(op,job){
  try{
    // Normalisation AVANT hachage : faoRoot() le fait a chaque acces, mais une
    // cle calculee hors de cette voie (migration, appel direct) voyait un op
    // SANS minipasses/laisse puis un op AVEC -> « cle differente » a chaque
    // ouverture alors que RIEN n'avait bouge. Idempotent : aucun effet de bord.
    // repère propre (3+2) : la clé est TOUJOURS celle du posage vu par l'opération — qu'on la
    // calcule avec le posage (lecture du cache, F5, contrôles) ou pendant le calcul (faoOpJob)
    try{ if(op&&op.frame&&!(job&&job.__opJob===op)&&typeof faoOpFrame==='function'){ const fr=faoOpFrame(job,op); if(fr)job=faoOpJob(job,op,fr); } }catch(e){}
    const inh=!!(job&&job.__opJob);
    // champs du VRAI posage, dans SON ordre (nettoyage compris : jamais sur le posage vu par
    // l'opération, qui en garderait une copie et changerait l'ordre de la clé d'une session à l'autre)
    const base=inh?Object.getPrototypeOf(job):job;
    if(base&&Array.isArray(base.ops))faoSanitiseOps(base);
    const js={};
    for(const k in base){
      if(!Object.prototype.hasOwnProperty.call(base,k)||k==='ops'||k==='open')continue;
      if(k==='name'||k==='id')continue; // libelle / identifiant : jamais une trajectoire
      if(k==='holeInfo')continue; // nature des trous d'un STEP (taraudé…) : aucun effet sur les tracés
      js[k]=job[k]; // posage vu par l'opération : son brut (repère de l'opération)
    }
    if(inh){ js.stock=job.stock; js.opFrame=job.frame; js.originZero=true; }
    // Seul l'outil de CETTE operation influence ses parcours : modifier T3 ne
    // doit pas rendre perimes les traces des operations qui tournent en T1.
    // 2026-10-15-010 : sous-ensemble HISTORIQUE de la fiche (faoToolKeyObj) — les champs
    // ajoutés (longueurs, avances…) ne changent aucune trajectoire et ne périment rien.
    if(js&&js.tools)js.tools=[faoToolKeyObj(faoToolById(job,op&&op.toolId))];
    // Une operation ne depend QUE d'elle-meme, de son outil, du brut/du maillage
    // (faoBodyGen) — ET, pour la GEOFINITION uniquement, des operations qui la
    // PRECEDENT (faoGeoHasRrough lit leur type et leur etat actif). Tout le reste
    // ne change rien a SES tracés : modifier une autre operation ne la marquait
    // deja pas ... sauf avant, ou la cle embarquait la signature de TOUTES les
    // operations — d'ou un triangle sur tout le posage pour une seule modif.
    let dep=null;
    if(op&&op.type==='geofinish'){
      const ops=(job&&job.ops)||[];
      let idx=-1;
      for(let i=0;i<ops.length;i++){ const q=ops[i];
        if(q===op||(op.id&&q&&q.id===op.id)){ idx=i; break; } }
      dep=idx<0?['absent']:ops.slice(0,idx+1).map(function(q){
        return [q&&q.id,q&&q.type,q&&q.on!==false?1:0];
      });
    }
    let body='0'; // hors ebauche 3D/geofinition : aucun dependence au solide
    if(faoMeshOp(op)){
      const fp=faoSetupFp(job);
      // Solide pas encore construit ('nb') ou ilegitime ('x') : AUCUNE cle possible.
      // Une clé « nb|… » ne pouvait matcher aucune entrée (la lecture l'écartait déjà)
      // mais elle rendait st true -> triangle rouge pose DES l'ouverture, avant meme
      // que le solide existe — et il ne retombait jamais.
      if(fp==='nb'||fp==='x')return null;
      body=fp;
    }
    return body+'|'+JSON.stringify([faoOpSig(op),js,dep]);
  }catch(e){ return null; } // non sérialisable -> pas de cache (toujours juste)
}
function faoMeshFromBodyCached(b){
  if(faoBodyMeshFn!==faoMeshFromBody){
    faoBodyMeshFn=faoMeshFromBody;
    try{ faoBodyMeshMap=new WeakMap(); }catch(e){ faoBodyMeshMap=null; }
    faoBodyGen++;
  }
  if(faoBodyMeshMap){ const e=faoBodyMeshMap.get(b); if(e)return e; }
  let m=null;
  try{ m=faoMeshFromBody(b); }catch(e){ m=null; }
  if(m&&faoBodyMeshMap){ try{ faoBodyMeshMap.set(b,m); faoBodyGen++; }catch(e){} }
  return m;
}
/* ----- cache persistant des parcours (IndexedDB) -----
   Objectif : ne plus RECALCULER les trajectoires a chaque ouverture (l'ebauche 3D
   du document reel coute ~90 s). On ne met PAS les parcours dans le MODÈLE
   (71 Ko) : 286 000 points = 7,9 Mo, et l'autosave tient dans 5 Mo de localStorage.
   Une entree PAR operation, reecrite a chaque generation -> stockage borne.
   L'entree n'est servie que si sa cle est EXACTEMENT celle du moment present et si
   la VERSION DU CODE est la meme : sinon on recalcule, comme avant. */
let faoMovesWritten=null; // Set idbKey|cle -> deja ecrit dans cette session
let faoMovesWhy=null;     // Map idbKey -> {why:'absente'|'format'|'version'|'cle',...}
let faoBundleWantReport=false; // un .miniFusion vient d'etre ouvert : dire ce qu'il contient
function faoKeyDiff(a,b){
  // Deux cles de parcours differentes : POURQUOI ? « cle differente » ne disait
  // rien (solide ? outil ? parametres ?) et la moitie du diagnostic restait a
  // faire a la main. Compare d'abord l'empreinte du solide, puis chaque
  // composante du JSON : le motif remonte mot pour mot dans l'infobulle du ⚠.
  try{
    if(a===b)return '';
    const pa=String(a==null?'':a).split('|'), pb=String(b==null?'':b).split('|');
    const fa=pa.shift(), fb=pb.shift();
    if(fa!==fb)return 'empreinte du SOLIDE differente ('+(fa||'vide')+' -> '+(fb||'vide')+')';
    let ja=null,jb=null;
    try{ ja=JSON.parse(pa.join('|')); }catch(e){}
    try{ jb=JSON.parse(pb.join('|')); }catch(e){}
    if(!Array.isArray(ja)||!Array.isArray(jb))return 'cle differente';
    const d=[];
    const one=function(x,y,lab){
      if(JSON.stringify(x)===JSON.stringify(y))return;
      if(!x||!y||typeof x!=='object'||typeof y!=='object'){ d.push(lab); return; }
      const ks={};
      Object.keys(x).forEach(function(k){ks[k]=1;});
      Object.keys(y).forEach(function(k){ks[k]=1;});
      Object.keys(ks).forEach(function(k){
        let sx='',sy='';
        try{ sx=JSON.stringify(x[k]); }catch(e){ sx='?'; }
        try{ sy=JSON.stringify(y[k]); }catch(e){ sy='?'; }
        if(sx!==sy)d.push(lab+k);
      });
    };
    one(ja[0],jb[0],'operation.');
    one(ja[1],jb[1],'posage.');
    one(ja[2],jb[2],'dependance.');
    if(!d.length)return 'cle differente';
    return d.slice(0,6).join(', ')+(d.length>6?' …':'');
  }catch(e){ return 'cle differente'; }
}
function faoPartsDiff(a,b){
  // Compare la liste des corps haches, corps par corps : « empreinte du solide
  // differente » ne disait pas SIQUEL corps ni SI c'etaient les memes sommets.
  // meme nombre de sommets + autre hash => les coordonnees ont bouge (matrixWorld,
  // rejeu, jitter OCCT) ; nombre different => le maillage lui-meme a change.
  try{
    if(!a||!b)return '';
    const M=function(s){
      const m={};
      String(s).split('|').forEach(function(p){
        const i=p.indexOf(':'); if(i<0)return;
        const id=p.slice(0,i), fp=p.slice(i+1), j=fp.lastIndexOf('_');
        m[id]={fp:fp,n:j<0?0:+fp.slice(j+1)};
      });
      return m;
    };
    const X=M(a), Y=M(b), d=[];
    for(const id in X){
      if(!(id in Y)){ d.push('corps '+id+' disparu'); continue; }
      if(X[id].fp===Y[id].fp)continue;
      if(X[id].n&&Y[id].n&&X[id].n!==Y[id].n)
        d.push('corps '+id+' : '+X[id].n+' -> '+Y[id].n+' sommets');
      else
        d.push('corps '+id+' : memes sommets, coordonnees differentes ('
          +X[id].fp.split('_')[0]+' -> '+Y[id].fp.split('_')[0]+')');
    }
    for(const id in Y){ if(!(id in X))d.push('corps '+id+' apparue'); }
    if(!d.length)return '';
    return d.slice(0,3).join(' ; ')+(d.length>3?' …':'');
  }catch(e){ return ''; }
}
function faoMovesWhySet(k,why,info){
  // Pourquoi une entree du cache a-t-elle ete REJETEE a la lecture ? Sans cela,
  // « 1 operation sans parcours en memoire » ne dit jamais si la trace n'existe
  // pas, si elle vient d'un ancien moteur, ou si sa cle (donc le SOLIDE) a bouge.
  try{
    if(!k)return;
    if(!faoMovesWhy)faoMovesWhy=new Map();
    if(!why){ faoMovesWhy.delete(k); return; }
    const e={why:why};
    if(info)for(const kk in info)e[kk]=info[kk];
    faoMovesWhy.set(k,e);
  }catch(e){}
}
function faoMovesWhyGet(job,op){
  try{ return (faoMovesWhy&&faoMovesWhy.get(faoMovesIdbKey(job,op)))||null; }
  catch(e){ return null; }
}
function faoMovesWhyShort(job,op){
  // Forme COURTE, pour la barre d'etat (le detail complet est dans l'infobulle du ⚠).
  const w=faoMovesWhyGet(job,op);
  if(!w)return '';
  if(w.why==='version')return 'trace ecrite par un ancien moteur ('+w.ver+')';
  if(w.why==='cle')return w.d||'cle differente : outil / parametres / SOLIDE modifies';
  if(w.why==='absente')return 'jamais generate ici (ou cache purge)';
  if(w.why==='format')return 'entree de cache illisible';
  return '';
}
let faoMovesPreloading=false, faoMovesPreloaded=false;
// Reessais : a l'ouverture le solide n'existe pas encore (restoreViewCache +
// rejeu exact). Sans reprise automatique, la lecture s'arretait sur « nb » et le
// premier clic recyclait tout le calcul (90 s) alors que rien n'etait perime.
let faoMovesRetry=0, faoMovesRetryT=null;
function faoMovesIdbKey(job,op){
  return 'faoMoves:'+((job&&job.id)||'_')+':'+((op&&op.id)||'_');
}
function faoSolidSettled(){
  // Le corps affiche vient-il du REJEU exact, ou du REPLI D'IMAGE ?
  // restoreViewCache() remet des corps « cached » SANS shape : la FAO lit alors le
  // maillage d'affichage (l'interception « corps blindés » exige b.shape). Le rejeu
  // exact remplace ensuite ces corps par des corps kind:'body' AVEC shape ->
  // AUTRE source, AUTRE empreinte. Generer pendant cette fenetre ecrivait une entree
  // maudite : valable 3 secondes, rouge des l'ouverture suivante — cas exact de
  // « l'Ébauche 3D perd son cache a chaque refresh ».
  // Tant que c'est faux : on ne lit pas, on n'ecrit pas, on ne genere pas.
  try{
    if(typeof bodies==='undefined'||!bodies||!bodies.length)return true;
    for(let i=0;i<bodies.length;i++){
      const b=bodies[i];
      if(!b||b.ghost||b.visible===false)continue;
      if(b.cached===true&&!b.shape)return false;
    }
    return true;
  }catch(e){ return true; }
}
let faoRegenWhenSettled=false; // « Tout régénérer » pressé pendant le rejeu
function faoRegenFlush(){
  try{
    if(!faoRegenWhenSettled)return;
    if(!faoSolidSettled())return;
    faoRegenWhenSettled=false;
    faoPreviewGenerate();
  }catch(e){}
}
function faoMovesReady(){
  // Hors navigateur (harnais de tests) ou IDB indisponible : simplemente desactive.
  try{ return !!(typeof indexedDB!=='undefined'&&indexedDB&&
                 typeof idbSet==='function'&&typeof idbGet==='function'); }
  catch(e){ return false; }
}
function faoMovesReset(){
  // Nouveau document : l'ecriture doit repartir, et la lecture differeree aussi.
  try{ if(faoMovesWritten&&faoMovesWritten.clear)faoMovesWritten.clear(); }catch(e){}
  try{ if(faoMovesWhy&&faoMovesWhy.clear)faoMovesWhy.clear(); }catch(e){}
  try{ if(faoMovesRetryT){ clearTimeout(faoMovesRetryT); faoMovesRetryT=null; } }catch(e){}
  faoMovesPreloading=false;
  faoMovesPreloaded=false;
  faoMovesRetry=0;
  faoMovesFpSeen=null; // aucun solide lu pour ce document : la prochaine lecture compte
}
function faoMovesEngSig(job){
  // Ce qui NE se voit pas dans la cle mais change l'empreinte du solide : le
  // moteur (exact vs repli maillage), l'identite et le TYPE des corps visibles
  // (kind:'body' -> geometrie d'outillage occXDefl, sinon maillage d'affichage).
  // Rangee dans l'entree, elle permet de dire « le solide a change de source »
  // plutot que « cle differente » quand c'est exactement le cas.
  try{
    if(typeof bodies==='undefined'||!bodies)return '';
    const only=(job&&Array.isArray(job.bodies))?job.bodies:null;
    const L=[];
    for(let i=0;i<bodies.length;i++){
      const b=bodies[i];
      if(!b||b.ghost||b.visible===false)continue;
      if(only&&only.indexOf(b.id)<0)continue;
      L.push(b.id+'#'+(b.kind||'?')+(b._faoGeo?'*':''));
    }
    return (typeof builtEngine==='string'?builtEngine:'?')+'|'+L.join(',');
  }catch(e){ return ''; }
}
function faoMovesSave(job,op,key,mv){
  // Ecriture ASYNCHRONE et sans effet de bord : une panne d'IndexedDB ne bloque
  // ni l'apercu ni l'export (on recalcule simplement, comme aujourd'hui).
  try{
    if(!faoMovesReady()||!key||!mv)return;
    if(!faoSolidSettled())return; // clé calculée sur le repli : elle ne vaudra plus
    if(!faoMovesWritten)faoMovesWritten=new Set();
    const k=faoMovesIdbKey(job,op);
    const tag=k+'|'+key;
    if(faoMovesWritten.has(tag))return;
    faoMovesWritten.add(tag);
    Promise.resolve(idbSet(k,{v:1,ver:CACHE_VER,k:key,n:mv.length,at:Date.now(),
      e:faoMovesEngSig(job),p:faoFpParts,mv:mv}))
      .catch(function(){});
  }catch(e){}
}
/* ----- le solide bouge : les CLES de l'ebauche 3D bougent avec lui -----
   Seules les operations rough3d/geofinish embarquent faoSetupFp dans leur cle —
   d'ou « le Surfaçage passe toujours, l'Ébauche 3D jamais ». Au F5 la premiere
   lecture se fait sur le REPLI MAILLAGE (le noyau OCCT exact n'a pas encore boote) :
   autre empreinte, entree rejetee, triangle rouge. Quand le solide exact arrive,
   il faut RELIRE — sans quoi la lecture, deja « prete », ne regardait plus rien. */
let faoMovesFpSeen=null; // {posageId: faoSetupFp} du solide utilise a la derniere lecture
function faoMovesSolidFp(){
  // Empreinte des solides qui entrent dans une CLE de parcours (seuls ces types
  // dependent du maillage : le Surfaçage, lui, ne voit jamais bouger sa clé).
  const o={};
  try{
    const r=faoRoot();
    ((r&&r.setups)||[]).forEach(function(s){
      if(!s)return;
      const ops=s.ops||[];
      for(let i=0;i<ops.length;i++){
        // toute opération calculée sur le maillage (poche adaptative et contour profil compris :
        // sans eux, leur parcours n'était jamais relu au F5 une fois le solide exact arrivé)
        if(ops[i]&&faoMeshOp(ops[i])){ o[s.id]=faoSetupFp(s); return; }
      }
    });
  }catch(e){}
  return o;
}
function faoMovesFpDiffers(snap){
  try{
    const cur=faoMovesSolidFp();
    for(const id in cur){ if(!snap||snap[id]!==cur[id])return true; }
    for(const id in snap){ if(!(id in cur))return true; }
  }catch(e){}
  return false;
}
function faoMovesSolidChanged(){
  // Depuis la derniere lecture, le solide a change (repli maillage -> OCCT exact,
  // import, edition du parametrique) : les cles de l'ebauche 3D ne valent plus.
  try{ if(!faoMovesReady())return false; return faoMovesFpDiffers(faoMovesFpSeen); }
  catch(e){ return false; }
}
async function faoMovesPreload(){
  // Rechauffe le cache MEMOIRE depuis IndexedDB : les parcours deja calcules par la
  // meme version sont SERVIS, pas recalcules. Renvoie le nombre d'operations restaurees.
  let n=0, pending=false;
  const snap=faoMovesSolidFp(); // solide tel qu'il est QUAND ON COMMENCE a lire
  try{
    if(!faoMovesReady())return 0;
    if(!faoSolidSettled())return 0; // rejeu en cours : on relira quand le solide sera la
    const r=faoRoot(); const setups=(r&&r.setups)||[];
    for(let si=0;si<setups.length;si++){
      const s=setups[si]; if(!s)continue;
      const ops=s.ops||[];
      for(let oi=0;oi<ops.length;oi++){
        const op=ops[oi]; if(!op)continue;
        if(faoMeshOp(op)){
          try{ faoActiveMesh(s); }catch(e){}
          // Solide pas encore construit : on ne valide RIEN et on reessiera plus tard.
          if(faoSetupFp(s)==='nb'){ pending=true; continue; }
        }
        const ck=faoOpMovesKey(op,s); if(!ck)continue;
        const curParts=faoFpParts; // figee tout de suite : l'await plus bas cede le fil
        const idk=faoMovesIdbKey(s,op);
        const ch=faoOpMovesHit(op);
        if(ch&&ch.key===ck){ faoMovesWhySet(idk,null); continue; } // deja en memoire
        let val=null;
        try{ val=await idbGet(idk); }catch(e){ val=null; }
        if(!val){ faoMovesWhySet(idk,'absente'); continue; }
        const nb=(val.n||(val.mv&&val.mv.length)||0);
        if(val.v!==1){ faoMovesWhySet(idk,'format',{ver:val.ver}); continue; }
        if(!cacheVerOK(val.ver)){ faoMovesWhySet(idk,'version',{ver:val.ver,n:nb}); continue; }
        if(!Array.isArray(val.mv)){ faoMovesWhySet(idk,'format',{ver:val.ver,n:nb}); continue; }
        if(val.k!==ck){
          const eng=faoMovesEngSig(s);
          let d=faoKeyDiff(val.k,ck);
          const per=val.p?faoPartsDiff(val.p,curParts):'';
          if(per)d=per+' ; '+d;
          if(val.e&&eng&&val.e!==eng)d='source du solide changee ('
            +val.e+' -> '+eng+') ; '+d;
          d+=' | corps actuels : '+(curParts||'?')+' ; ecrits : '+(val.p||'sans detail');
          faoMovesWhySet(idk,'cle',{ver:val.ver,k:val.k,n:nb,e:val.e,d:d}); continue; }
        faoMovesWhySet(idk,null);
        faoOpMovesStore(op,ck,val.mv); n++;
      }
    }
    if(!pending){
      faoMovesFpSeen=snap;
      faoMovesPreloaded=true; faoMovesRetry=0; faoMovesDone();
      // Le solide a bouge PENDANT la lecture : les cles utilisees ne valent plus —
      // on relit une fois (plutot que de laisser un triangle rouge injustifie).
      try{
        if(faoMovesFpDiffers(snap))
          setTimeout(function(){ try{ faoMovesPreloadSoon(true); }catch(e){} },0);
      }catch(e){}
    }
  }catch(e){}
  return n;
}
function faoMovesPending(){
  // Lecture IndexedDB en cours : un AFFICHAGE (nb de points, temps, stats) ne doit
  // JAMAIS servir de pretexte a un calcul — on attend, on n'invente pas.
  try{ return !!(faoMovesReady()&&!faoMovesPreloaded); }catch(e){ return false; }
}
function faoActiveOps(job){
  // Operations qui comptent : desactivees (on=false) exclues, partout
  // (apercu, stats, validation) — un lanceur desactive n'a pas de parcours a servir.
  return ((job&&job.ops)||[]).filter(function(o){return o&&o.on!==false;});
}
function faoMovesAllReady(job){
  // Vrai seulement si CHAQUE operation active a sa trace EN MEMOIRE avec sa cle
  // exacte (outil + parametres + brut + maillage) : l'apercu peut alors etre dessine
  // et VALIDE sans le moindre calcul. 0 operation = rien a valider (faux).
  try{
    const ops=faoActiveOps(job);
    if(!ops.length)return false;
    for(let i=0;i<ops.length;i++){
      const o=ops[i];
      if(faoMeshOp(o)){ try{ faoActiveMesh(job); }catch(e){} }
      const ck=faoOpMovesKey(o,job);
      if(ck===null)return false;              // solide pas encore construit
      const ch=faoOpMovesHit(o);
      if(!(ch&&ch.key===ck))return false;
    }
    return true;
  }catch(e){ return false; }
}
function faoMovesDone(){
  // Fin de lecture : 1) ACCES IMMEDIAT — si CHAQUE parcours est deja en memoire
  // (ouverture d'un fichier bien genere), on DESSINE tout de suite et l'apercu est
  // VALIDE : le bouton passe au vert sans rien presser et l'export s'ouvre. Aucun
  // calcul : le cache est lu, jamais recalcule. 2) Les modifications arrivees
  // PENDANT l'attente sont tranchees ici (l'oeil « Masquer » n'en est pas une).
  try{
    const w=faoPrevWanted; faoPrevWanted=false;
    const job=faoDoc();
    const nops=faoActiveOps(job).length;
    if(!w){
      if(nops)try{ faoStaleScan(); }catch(e){}  // qui est servi par la memoire ?
      const pret=nops?faoMovesAllReady(job):true;
      // On DESSINE des le premier dessin disponible, meme partiel : à l'ouverture
      // les traces presents doivent apparaitre tout de suite, sinon chaque ligne
      // dit « Masquer » alors que RIEN n'est affiche. Les absentes sont comptees
      // (faoPrevMissing) et l'apercu reste non valide tant qu'une seule manque.
      if(nops&&faoPrevOn)try{ faoRefreshPreview(); }catch(e){}
      faoPrevStale=!pret;                      // 0 operation : rien a valider
      try{ faoStaleUI(); }catch(e){}
    }else if(w==='full'){
      try{ faoStaleScan(); }catch(e){}
      try{ faoRefreshPreview(); }catch(e){}
      faoPrevStale=true;                       // une modif a eu lieu pendant l'attente
      try{ faoStaleUI(); }catch(e){}
    }else if(w==='lecture'){
      try{ faoRefreshPreview(true); }catch(e){}
    }
    if(faoBundleWantReport&&faoMovesReady()&&!faoMovesPending()){
      faoBundleWantReport=false;
      try{ if(typeof bundleReport==='function')bundleReport(); }catch(e){}
    }
    try{ faoRegenFlush(); }catch(e){}
    // triangles ⚠ de l'arbre : redessinés après CHAQUE lecture (une relecture au F5, solide exact
    // arrivé, laissait « à régénérer » des parcours pourtant retrouvés)
    try{ if(typeof faoRenderTree==='function')faoRenderTree(); }catch(e){}
    const a=(typeof document!=='undefined'&&document)?document.activeElement:null;
    if(a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.isContentEditable))return;
    if(typeof sel==='undefined'||!sel||!(sel.kind==='faoOp'||sel.kind==='faoSetup'))return;
    if(typeof renderProps==='function')renderProps();
    if(typeof faoRefreshFaoUI==='function')faoRefreshFaoUI();
  }catch(e){}
}
function faoMovesPreloadSoon(force){
  // Declencheur foin-et-oubli (l'init, l'ouverture de document) : une seule course
  // a la fois, et on RESSAIE toutes les 400 ms tant que le solide n'existe pas —
  // sans quoi la lecture s'arretait sur « nb » et le 1er clic recalculait tout.
  // force = le solide vient d'etre construit : repartir meme si on avait abandonne.
  try{
    if(!faoMovesReady())return;
    if(force){ try{ if(faoMovesRetryT){ clearTimeout(faoMovesRetryT); faoMovesRetryT=null; } }catch(e){}
      faoMovesPreloading=false; faoMovesPreloaded=false; faoMovesRetry=0; }
    if(faoMovesPreloading||faoMovesPreloaded)return;
    if(faoMovesRetryT)return; // une reprise est deja programmee
    faoMovesPreloading=true;
    Promise.resolve(faoMovesPreload()).then(function(){
      faoMovesPreloading=false;
      if(faoMovesPreloaded){ faoMovesRetry=0; return; } // faoMovesDone : fait par le prechargeur
      // Solide pas encore la : on retente, jusqu'a ce que les maillages arrivent.
      if(faoMovesRetry<75){ faoMovesRetry++;
        faoMovesRetryT=setTimeout(function(){
          try{ faoMovesRetryT=null; }catch(e){}
          faoMovesPreloadSoon();
        },400);
      }else{ faoMovesPreloaded=true; faoMovesRetry=0; faoMovesDone(); } // on n'attend plus
    }, function(){ faoMovesPreloading=false; });
  }catch(e){ faoMovesPreloading=false; }
}
/* ----- lecture SANS calcul : affichage = cache uniquement -----
   Un affichage (nombre de points, temps, stats, stats du posage) ne doit jamais
   declencher une regeneration : tant que le cache IndexedDB est en lecture on
   renvoie « rien » et le panneau affiche « … » — il se remplit tout seul. */
function faoOpMovesTry(op,job){
  try{
    // repère propre (3+2) : parcours mémorisé dans le repère de l'opération → ramené dans le posage
    let fr=null;try{fr=(op&&op.frame&&!(job&&job.__opJob)&&typeof faoOpFrame==='function')?faoOpFrame(job,op):null;}catch(e){fr=null;}
    if(fr){
      const jo=faoOpJob(job,op,fr),k=faoFrameCur;faoFrameCur=fr;let r=null;
      try{r=faoOpMovesTry(op,jo);}finally{faoFrameCur=k;}
      return r===null||r===undefined?r:faoMovesOpToPos(r,fr);
    }
    if(faoMeshOp(op)){ try{ faoActiveMesh(job); }catch(e){} }
    const ck=faoOpMovesKey(op,job);
    if(ck===null)return null;
    const ch=faoOpMovesHit(op);
    const secu=faoZoneSecu(op,job);
    if(ch&&ch.key===ck)return faoZoneServe(ch,op,job,secu);
    if(ch&&op&&op.stale===true)return faoZoneServe(ch,op,job,secu); // perime : on affiche l'ancien trace
    return null;
  }catch(e){ return null; }
}
function faoMovesStat(op,job){
  // 1) trace deja en memoire -> tel quel. 2) lecture en cours -> null (« … »).
  // 3) cache persistant DISPONIBLE mais entree absente -> null : on ne recalcule
  //    PAS au passage. Cliquer sur le nom d'une operation n'est pas un ordre de
  //    generation : l'etat le dit (« pas de parcours ») et le bouton ⚠ / « Générer
  //    + aperçu » produit. 4) aucun cache du tout (IndexedDB absent) : on calcule,
  //    comme avant — il n'y a rien d'autre pour servir l'affichage.
  // 2026-10-15-011 : un perçage se calcule en une fraction de ms — toujours À JOUR,
  // produit sur place (jamais l'ancien tracé d'une opération périmée, jamais
  // « pas de parcours, Tout régénérer »). faoOpMoves relit le cache si la clé colle.
  if(op&&op.type==='drill'){ try{ return faoOpMoves(op,job); }catch(e){ return null; } }
  const mv=faoOpMovesTry(op,job);
  if(mv)return mv;
  if(faoMovesPending())return null;
  if(faoMovesReady())return null;
  return faoOpMoves(op,job);
}

/* ----- dispatch : une op -> moves (outil de sa fiche + limite rect) ----- */
// 2026-10-09-005 : corps en générateur (faoOpMovesIt) — l'ébauche 3D cède le
// fil après chaque niveau (yield* faoGenRough3DIt) pour le dessin progressif.
// faoOpMoves() = drain SYNCHRONE strictement équivalent (appels classiques,
// tests, G-code, estimation, aperçu canonique) ; faoOpMovesStream() = flux.
function* faoOpMovesIt0(op,job){
  // (2026-10-16-020 : appelé par faoOpMovesIt, qui gère le repère PROPRE d'une opération)
  // Prime le maillage AVANT la clé : faoSetupFp lit les maillages des corps, il
  // faut qu'ils existent avant de calculer la clé (sinon 'nb' = clé fausse).
  if(faoMeshOp(op)){ try{ faoActiveMesh(job); }catch(e){} }
  // secu = dégagement RELATIF au-dessus du brut (jamais dans la matière).
  // Calculé AVANT les retours cache : la purge des excursions hors zone
  // (faoZoneServe) en a besoin pour rebrancher les jonctions.
  const secu=faoZoneSecu(op,job);
  const ck=faoOpMovesKey(op,job);
  if(ck!==null){
    const ch=faoOpMovesHit(op);
    if(ch&&ch.key===ck)return faoZoneServe(ch,op,job,secu);
    // PERIME : on sert l'ancien trace tant que « Generer + apercu » n'a pas ete
    // presse — une modification ne bouge RIEN a l'ecran d'elle-meme.
    // (sauf le perçage : instantané, toujours recalculé à jour — 2026-10-15-011)
    if(ch&&op&&op.stale===true&&op.type!=='drill')return faoZoneServe(ch,op,job,secu);
  }
  const tool=faoToolById(job,op&&op.toolId);
  const D=isFinite(+tool.d)&&+tool.d>0?+tool.d:10;
  const sortie=(isFinite(+((job||{}).secu))?+job.secu:5);
  const base={toolD:D, secu:secu, sortie:sortie};
  const RA=faoRA(op||{});
  let mv=[];
  if(!op||!op.type)return [];
  if(op.type==='facing')mv=faoGenFacing(job.stock||faoStockDefault(),
    {toolD:D, ae:isFinite(+op.ae)?+op.ae:D*0.6, np:isFinite(+op.np)?+op.np:0,
     npz:isFinite(+op.npz)?+op.npz:0, sortie:sortie,
     z:(isFinite(+op.z)?+op.z:(job.stock||{}).z1)+RA.axial, secu:secu});
  else if(op.type==='pocket'&&!faoPocketAdapt(op))mv=faoGenPocket({x0:+op.x0,y0:+op.y0,x1:+op.x1,y1:+op.y1},
    +op.ztop,+op.zbot,Object.assign({},base,{ap:+op.ap,ae:isFinite(+op.ae)?+op.ae:D*0.5,
      radial:RA.radial,axial:RA.axial,
      // 2026-10-08-004 : entrée circulaire par défaut (rayon d'entrée op.).
      entry:op.entry||'circ',entryR:op.entryR}));
  else if(faoContourProfil(op)){
    let am=null;
    try{ am=faoActiveMesh(job,'mid'); }catch(e){ am=null; } // 2026-10-22-009 : maillage intermédiaire
    const L=op.limit;
    if(L&&(L.mode==='chain'||L.mode==='sketch')&&(L.loop||[]).length>=3){
      mv=faoGenContourProfil(am&&am.mesh,L.loop,Object.assign({},base,{
        ztop:+op.ztop,zbot:+op.zbot,ap:+op.ap,ae:op.ae,nR:op.nR,fin:op.fin,
        radial:RA.radial,axial:RA.axial,side:op.cside,sens:op.sens==='opp'?'opp':'climb',
        leadR:op.leadR,overlap:op.overlap,tabN:op.tabN,tabW:op.tabW,tabH:op.tabH}));
      try{ if(mv&&mv.diag)op.geoDiag=mv.diag; }catch(e){}
    }
  }
  else if(op.type==='contour')mv=faoGenContour({x0:+op.x0,y0:+op.y0,x1:+op.x1,y1:+op.y1},
    +op.ztop,+op.zbot,Object.assign({},base,{ap:+op.ap,radial:RA.radial,axial:RA.axial,
      entry:op.entry||'circ',entryR:op.entryR}));
  else if(op.type==='drill')mv=(op.cycle==='helix')?faoGenHelixPlan(faoDrillPlan(op,job),D,op,secu):faoGenDrillPlan(faoDrillPlan(op,job),secu,op); // trous du modèle ou XY (src/89-fao-percage.js) ; helix = fraisage
  else if(op.type==='rough3d'||faoPocketAdapt(op)){
    let am=null;
    try{ am=faoActiveMesh(job,'mid'); }catch(e){ am=null; } // 2026-10-22-009 : maillage intermédiaire
    // 2026-10-21-003 : intouchables — solides rouges = obstacles du modèle ;
    // faces/solides rouges = cote de pointe minimale (outil gonflé de la marge)
    let protTip=null;
    if(op.type==='rough3d'&&Array.isArray(op.protect)&&op.protect.length&&am&&am.mesh){
      try{ const rb=faoProtectBodiesMesh(job,op); if(rb)am={mesh:faoMeshConcat(am.mesh,rb),box:am.box}; }catch(e){}
      try{ protTip=faoProtectTip(job,op,faoToolById(job,op.toolId)||{d:D},faoRA(op).radial,true,am.mesh); }catch(e){ protTip=null; }
    }
    // bulge supprimé : la sonde (A/B) montrait une garde identique avec ou
    // sans compensation parent — l'arrondi tangent reste hors mur (≥0.48).
    const brutTop=(job&&job.stock&&isFinite(+job.stock.z1))?+job.stock.z1:null;
    // Fix 2 (2026-10-10-001) : la limite d'op (lim/lim2) est injectée EN
    // GÉNÉRATION — le clip final restait en filet et jetait 43 % des points
    // générés sur la pièce réelle (61 276 moves + 9,2 s de clipPoly).
    const zctx=faoZoneCtx(op,job);
    // Poche adaptative SANS bord sélectionné : rien (jamais tout le brut).
    const pkNoGeo=faoPocketAdapt(op)&&!(zctx&&zctx.chain);
    if(am&&am.mesh&&!pkNoGeo)mv=yield* faoGenRough3DIt(am.mesh,am.box,+op.ztop,+op.zbot,
      {ap:+op.ap,ae:isFinite(+op.ae)?+op.ae:D*0.6,toolD:D,
       // 2026-10-14-007 : forme de l'outil (passe torique)
       kind:(faoToolById(job,op.toolId)||{}).kind,cornerR:(faoToolById(job,op.toolId)||{}).cornerR,
       radial:RA.radial,axial:RA.axial,
       minipasses:isFinite(+op.minipasses)?+op.minipasses:0,
       finitParois:!!op.finitParois,finitN:op.finitN,finitProf:op.finitProf,
       finitFond:!!op.finitFond,
        // 2026-10-08-004 : entrée CIRC par défaut (doc sans champ = arc
        // tangent, repli hélice/rampe si pas d'ancre ; 'auto' = legacy).
        entry:op.entry||'circ',entryR:op.entryR,brutTop:brutTop,secu:secu,
        // 2026-10-21-002 : boîte du brut — élargit le domaine d'usinage quand
        // le brut déborde de la pièce (bande des flancs jamais usinée avant)
        stockBox:(job&&job.stock&&faoStockValid&&faoStockValid(job.stock))?job.stock:null,
        protectTip:protTip,
        // 2026-10-21-010 : brut = corps — dessus réel dilaté du rayon d'outil
        stockTopAt:(function(){try{const T=faoStockTop(job,1);return T?T.dil(D/2+RA.radial):null;}catch(e){return null;}})(),
        // 2026-10-22-003 : dessus NON dilaté (entrées par l'extérieur, à plat)
        stockRawAt:(function(){try{const T=faoStockTop(job,1);return T?T.at:null;}catch(e){return null;}})(),
        zoneAt:zctx?zctx.at:null,
        // 2026-10-11-005 : la limite voyage avec la zone — le REPÈRE de
        // génération (faoLoopAxis) suit l'axe de la chaîne (poche oblique).
        limit:op.limit,
        // 2026-10-07-005 : mode de vidage — 'escargot' = spirale centre ->
        // faces (faoSpiralLevel) ; absent = conventionnel (documents anciens).
        // 2026-10-08-001 : la poche d'entree (o.poly) a disparu avec le mode
        // trocoïdal.
        // 2026-10-08-002 : remPlan = remontées « toujours plan de retrait »
        // (posage.planes.mode) : les liaisons tiennent secu (le plan) au lieu
        // de remonter à 5 mm au-dessus de la matière (mode 'min5').
        remPlan:!!(job&&job.planes&&job.planes.mode==='plan'),
        // 2026-10-22-001 : finir une région avant la suivante (faoRegionOrder)
        parRegion:!!op.parRegion,
        mode:'escargot', // 2026-10-15-002 : mode unique
        // 2026-10-08-003 : sens de passe — 'avalant' = sens de coupe constant
        // (aucune chaine retournee) ; absent/'bidir' = legacy (retournement
        // vers l'extremite la plus proche).
        sens:op.sens});
    // 2026-10-21-003 : rapides au-dessus des intouchables -> plan de dégagement
    if(protTip&&mv&&mv.length)mv=faoProtectRapids(mv,protTip,secu);
  }
  else if(op.type==='geofinish'){
    let am=null;
    try{ am=faoActiveMesh(job,true); }catch(e){ am=null; } // 2026-10-14-009 : maillage fin (congés)
    // 2026-10-21-003 : faces usinables (bleu) / intouchables (rouge)
    let faceOk=null;
    if(am&&am.mesh&&((Array.isArray(op.protect)&&op.protect.length)||(Array.isArray(op.faces)&&op.faces.length))){
      try{ const rb=faoProtectBodiesMesh(job,op); if(rb)am={mesh:faoMeshConcat(am.mesh,rb),box:am.box}; }catch(e){}
      try{ faceOk=faoFaceOkAt(job,op,am.mesh,faoToolById(job,op.toolId)||{d:D},+op.laisse||0); }catch(e){ faceOk=null; }
    }
    if(am&&am.mesh){
      const tool=faoToolById(job,op.toolId);
      // 2026-10-12-002 : yield* — la finition cède le fil par chaîne/zone
      // (aperçu progressif au flux, comme l'ébauche 3D 005).
      // 2026-10-13-001 : zoneAt injectée — la limite d'op borne le MASQUE du
      // champ géodésique (faces hors zone exclues) ; sans cela, zbot bas +
      // parois du maillage = passes qui descendent sous la face limitée.
      const zctx0=faoZoneCtx(op,job);
      const zctx=faceOk?{at:(zctx0&&zctx0.at)?function(x,y){return zctx0.at(x,y)&&faceOk(x,y);}:faceOk}:zctx0;
      // 2026-10-14-001 : trajectoire 'scallop' = CRÊTES CONSTANTES façon
      // Fusion 360 (offsets géodésiques depuis les bords de la zone, lentilles
      // dans les restes, descente outil sans surcoupe) — src/89-fao-cretes.js.
      if(op.traj==='scallop')mv=yield* faoGenScallopIt(am.mesh,
        {step:isFinite(+op.step)?+op.step:1,toolD:D,kind:tool.kind,
         cornerR:tool.cornerR,laisse:+op.laisse||0,secu:secu,
         ztop:op.ztop,zbot:op.zbot,sens:op.sens,
         zoneAt:zctx?zctx.at:null});
      else mv=yield* faoGenGeoFinishIt(am.mesh,
        {step:isFinite(+op.step)?+op.step:1,toolD:D,kind:tool.kind,
         cornerR:tool.cornerR,laisse:+op.laisse||0,secu:secu,
         ztop:op.ztop,zbot:op.zbot,
         // 2026-10-13-007 : sens de passe (rétro-ingénierie cav.txt) —
         // 'bidir' (défaut, absent inclus) = alternance du sens de coupe ;
         // 'avalant' = proximité sans alternance, ordre haut→bas.
         sens:op.sens,
         // 2026-10-13-007 : direction des passes parallèles — 'auto' (axe
         // long), 'x', 'y', 'ang' (angle op.pdirAng, degrés depuis X).
         pdir:op.pdir,pdirAng:op.pdirAng,
         // 2026-10-08-004 : entrée CIRC par défaut (doc sans champ = arc tangent ;
         // sans ébauche 3D amont, faoGeoEntryMode retombe sur la rampe).
         entry:op.entry||'circ',entryR:op.entryR,hasRrough:faoGeoHasRrough(job,op),
         zoneAt:zctx?zctx.at:null});
      // parallèle : le masque de faces ne voit que les centres de facettes —
      // passes recoupées EXACTEMENT au prédicat bleu/rouge (ré-entrée par le haut)
      if(faceOk&&op.traj!=='scallop'&&mv.length)mv=faoClipMovesPoly(mv,null,0,secu,1,faceOk);
      op.geoBlocked=(tool.kind==='flat'&&!mv.length);
      // 2026-10-13-007 : diag embarqué (fond nu : quelle phase est morte ?) —
      // lu par la fiche op. Stashé AVANT le clip (qui reconstruit les tableaux).
      try{ if(mv&&mv.diag)op.geoDiag=mv.diag; else delete op.geoDiag; }catch(e){}
    }else op.geoBlocked=false;
  }
  // 2026-10-21-001 : GÉODÉSIQUE — passes à distance constante SUR les faces
  // pilotes choisies (op.faces), descente outil sur tout le modèle du posage
  // (aucune pénétration), glissement au contact — src/89-fao-geodesique.js.
  else if(op.type==='geodesic'){
    let am=null,drive=null;
    try{ am=faoActiveMesh(job,true); }catch(e){ am=null; }
    try{ drive=faoGeoDrive(job,op); }catch(e){ drive=null; }
    // 2026-10-21-003 : intouchables — solides rouges = obstacles, faces et
    // solides rouges = descente de l'outil gonflé de la marge
    let red=null;
    if(am&&am.mesh&&Array.isArray(op.protect)&&op.protect.length){
      try{ const rb=faoProtectBodiesMesh(job,op); if(rb)am={mesh:faoMeshConcat(am.mesh,rb),box:am.box}; }catch(e){}
      try{ const tl=faoToolById(job,op.toolId)||{d:D,kind:'ball'};red=faoProtectFn(job,op,tl.kind||'ball',+tl.d||D,tl.cornerR,+op.laisse||0,am.mesh); }catch(e){ red=null; }
    }
    if(am&&am.mesh&&drive){
      const tool=faoToolById(job,op.toolId);
      mv=yield* faoGenGeodesicIt(am.mesh,drive,
        {step:isFinite(+op.step)?+op.step:1,toolD:D,kind:tool.kind,
         cornerR:tool.cornerR,laisse:+op.laisse||0,secu:secu,sens:op.sens,
         protectFn:red});
      try{ if(mv&&mv.diag)op.geoDiag=mv.diag; else delete op.geoDiag; }catch(e){}
    }else{ try{ op.geoDiag={nofaces:!drive?1:0}; }catch(e){} }
  }
  // Limite : rect (Liang-Barsky rapide) ou chaîne d'arêtes (clip impair).
  // Phase suivante : chaîne d'arêtes multiples, faces.
  const lim=op.limit;
  // 2026-10-08-003 : zone intérieure (îlot) — clip en COMPLÉMENT, après
  // l'extérieur (les deux se composent en intersection).
  const lim2=op.limit2;
  // 2026-10-13-006 : rayon de clip — géofinish boule/torique : la pointe
  // (contact) peut atteindre la limite (r≈0) ; plat : arête = limite (r=D/2).
  const clipR=(op.type==='geofinish'&&tool&&tool.kind!=='flat')?0.001:D/2;
  // 2026-10-14-001 : Crêtes constantes 'scallop' — la zone est déjà la
  // RÉGION du générateur (bord exact par dichotomie) ; le re-clip couperait
  // les arcs d'entrée/sortie tangents au bord et réinjecterait des remontées.
  const zoneDone=(op.type==='geofinish'&&op.traj==='scallop')||op.type==='geodesic'||faoContourProfil(op);
  if(zoneDone){}
  else if(lim&&lim.mode==='rect'&&mv.length){
    const R=faoEffLimit(op,clipR*2);
    if(R)mv=faoClipMovesXY(mv,R,secu);
  }else if(lim&&(lim.mode==='chain'||lim.mode==='sketch')&&lim.loop&&lim.loop.length>=3&&mv.length){
    mv=faoClipMovesPoly(mv,lim,clipR,secu,2);
  }
  if(lim2&&mv.length&&!zoneDone){
    if(lim2.mode==='rect'){
      const R2=faoLimit2R(lim2,D);
      if(R2)mv=faoClipMovesXY(mv,R2,secu,true);
    }else if((lim2.mode==='chain'||lim2.mode==='sketch')&&lim2.loop&&lim2.loop.length>=3){
      // 2026-10-13-007 : îlot = garantie D/2 (zone protégée), pas clipR.
      mv=faoClipMovesPoly(mv,lim2,D/2,secu,2,
        function(x,y){ return !faoLimInside(x,y,lim2,D/2); });
    }
  }
  // Arrondi des coins (trajectoires circulaires) : ébauche 3D + 2.5D
  // (surfaçage/poche/contour). 0 = angles vifs.
  if(op&&isFinite(+op.arrondi)&&+op.arrondi>0&&mv.length&&
     (op.type==='rough3d'||op.type==='facing'||op.type==='pocket'||op.type==='contour'))
    mv=faoRoundMoves(mv,+op.arrondi);
  // ZONE = frontière inviolable pendant le travail : garde-fou de coupe posé
  // EN DERNIER (faoRoundMoves crée ses arcs APRÈS le clip — un arrondi pouvait
  // dépasser la frontière). Les rapides, eux, traversent librement.
  // 2026-10-08-003 : l'îlot intérieur compte comme une zone (ctx composé).
  if((lim||lim2)&&mv.length&&!zoneDone)mv=faoZoneCuts(mv,op,job,secu);
  if(ck!==null)faoOpMovesStore(op,ck,mv);
  if(ck!==null)faoMovesSave(job,op,ck,mv); // persistance : prochaine ouverture = lecture
  if(op){ try{ op.stale=false; }catch(e){} } // generation fraiche
  return mv;
}
function faoOpMoves(op,job){
  // Drain SYNCHRONE : identique (au résultat près) à l'ancienne fonction.
  const it=faoOpMovesIt(op,job);
  let r; while(!(r=it.next()).done){}
  return r.value;
}
function faoYieldUI(){
  // Cède la main au navigateur (rAF) entre deux niveaux de l'ébauche, pour
  // que les courbes dessinées soient visibles — repli setTimeout / micro-tâche
  // (harnais de tests : rAF no-op -> la garde temporisée débloque le flux).
  // Jamais bloquant : premier arrivé gagne, le reste est sans effet.
  return new Promise(function(res){
    let done=false;
    const fin=function(){ if(done)return; done=true; res(); };
    try{
      if(typeof requestAnimationFrame==='function'){
        requestAnimationFrame(fin);
        if(typeof setTimeout==='function')setTimeout(fin,50); else fin();
      }else if(typeof setTimeout==='function')setTimeout(fin,0);
      else fin();
    }catch(e){ fin(); }
  });
}
function faoOpMovesStream(op,job,onChunk){
  // Même corps que faoOpMoves, mais en FLUX : à chaque yield (niveau de
  // l'ébauche 3D), on passe le fragment au dessinateur puis on rend la main
  // au navigateur. Renvoie une Promise<moves> — résultat final identique à la
  // version synchrone (le corps ne dépend pas du découpage des yields).
  const it=faoOpMovesIt(op,job);
  return (async function(){
    let r=it.next();
    while(!r.done){
      if(onChunk){ try{ onChunk(r.value); }catch(e){} }
      await faoYieldUI();
      r=it.next();
    }
    return r.value;
  })();
}
function faoJobMoves(job){
  // Regroupe par outil (changement d'outil si l'id change). Les ops
  // désactivées (on=false) sont ignorées partout (aperçu, temps, G-code).
  const out=[]; let cur=null;
  ((job&&job.ops)||[]).forEach(function(op){
    if(op&&op.on===false)return;
    const tool=faoToolById(job,op&&op.toolId);
    const sf=faoOpCutting(op,job); // conditions de CETTE opération (fiche ou surcharge)
    const key=tool.id+'|'+tool.d;
    if(!cur||cur.key!==key){
      cur={key:key, tool:{id:tool.id,num:tool.num,name:tool.name,d:tool.d,
        s:sf.s, f:sf.f, plunge:sf.plunge}, blocks:[]};
      out.push(cur);
    }
    cur.blocks.push({op:op,moves:faoOpMoves(op,job),cut:sf});
  });
  return out;
}

/* ----- estimation : longueurs + temps ----- */
/* ----- arcs G2/G3 : longueur, subdivision (aperçu), arrondi des coins ----- */
// Move circulaire : {r:0, x,y,z, arc:{i,j,cw}} — i,j = centre RELATIF au point
// de départ (IJK incrémental, accepté par 840D comme 8065, balayage < 180°).
function faoSegLen(p0,m){
  if(!m.arc)return Math.hypot(m.x-p0.x,m.y-p0.y,m.z-p0.z);
  const r=Math.hypot(m.arc.i,m.arc.j);
  if(!(r>1e-9))return Math.hypot(m.x-p0.x,m.y-p0.y,m.z-p0.z);
  // Centre = point de DÉPART + IJK (incrémental départ, comme les CN).
  const cx=p0.x+m.arc.i, cy=p0.y+m.arc.j;
  let a0=Math.atan2(p0.y-cy,p0.x-cx);
  let a1=Math.atan2(m.y-cy,m.x-cx);
  let sw=a1-a0;
  if(m.arc.cw){ while(sw>=0)sw-=2*Math.PI; }
  else{ while(sw<=0)sw+=2*Math.PI; }
  return Math.abs(sw)*r;
}
function faoArcSegs(p0,m,maxStep){
  // Subdivision d'arc pour l'aperçu/visionneuse : ADAPTATIVE (sagitta
  // ≤ 0.05 mm) — un grand rayon est découpé bien au-delà de 5° pour que
  // le cercle reste un cercle à l'écran ; les petits rayons gardent 5°.
  const pts=[];
  if(!m.arc)return pts;
  const r=Math.hypot(m.arc.i,m.arc.j);
  if(!(r>1e-9))return pts;
  const cx=p0.x+m.arc.i, cy=p0.y+m.arc.j;
  let a0=Math.atan2(p0.y-cy,p0.x-cx), a1=Math.atan2(m.y-cy,m.x-cx);
  let sw=a1-a0;
  if(m.arc.cw){ while(sw>=0)sw-=2*Math.PI; }
  else{ while(sw<=0)sw+=2*Math.PI; }
  const sag=0.05; // écart de corde max (mm)
  const dth0=Math.PI/36; // 5° : plafond angulaire historique
  let dth=dth0;
  if(r>sag){
    const c=1-sag/r;
    const d=2*Math.acos(c>1?1:(c<-1?-1:c)); // sagitta : dth = 2·acos(1−sag/r)
    if(isFinite(d)&&d>0&&d<dth)dth=d;
  }
  const n=Math.max(2,Math.min(1024,Math.ceil(Math.abs(sw)/dth)));  for(let i=1;i<=n;i++){
    const a=a0+sw*i/n;
    pts.push([cx+r*Math.cos(a),cy+r*Math.sin(a),p0.z+(m.z-p0.z)*i/n]);
  }
  return pts;
}
function faoRoundPath(pts,radius){
  // Remplace chaque coin (changement de direction 1°..179°) par un arc
  // tangent de rayon donné. Retourne des moves {r:0} (droites + arcs).
  const out=[];
  const R=isFinite(+radius)&&+radius>0?+radius:0;
  if(!(R>0)||!pts||pts.length<3)return (pts||[]).map(function(p){return {r:0,x:p.x,y:p.y,z:p.z};});
  const P=pts.map(function(p){return {x:+p.x,y:+p.y,z:+p.z};});
  out.push({r:0,x:P[0].x,y:P[0].y,z:P[0].z});
  for(let i=1;i+1<P.length;i++){
    const a=P[i-1], b=P[i], c=P[i+1];
    if(Math.abs(b.z-a.z)>1e-9||Math.abs(c.z-b.z)>1e-9){
      out.push({r:0,x:b.x,y:b.y,z:b.z}); // pas d'arc hors plan : on garde le coin
      continue;
    }
    const vix=b.x-a.x, viy=b.y-a.y, li=Math.hypot(vix,viy);
    const vox=c.x-b.x, voy=c.y-b.y, lo=Math.hypot(vox, voy);
    if(li<1e-9||lo<1e-9){ out.push({r:0,x:b.x,y:b.y,z:b.z}); continue; }
    const ux=vix/li, uy=viy/li, vx=vox/lo, vy=voy/lo;
    const dot=Math.max(-1,Math.min(1,ux*vx+uy*vy));
    const theta=Math.acos(dot); // angle de braquage
    if(!(theta>0.017&&theta<3.124)){ out.push({r:0,x:b.x,y:b.y,z:b.z}); continue; }
    let t=R*Math.tan(theta/2); // distance tangente : R·tan(θ/2)
    t=Math.min(t,li/2,lo/2);
    const rr=t/Math.tan(theta/2); // rayon effectif ≤ R (exact si non clampé)
    const ax=b.x-ux*t, ay=b.y-uy*t, bx=b.x+vx*t, by=b.y+vy*t;
    const cross=ux*vy-uy*vx;
    const sgn=cross>0?1:-1; // virage à gauche (CCW) : centre à gauche
    let nx=-uy*sgn, ny=ux*sgn;
    const cx=ax+nx*rr, cy=ay+ny*rr;
    // Vérifie la tangence à la sortie (garde contre les cas limites).
    if(Math.abs(Math.hypot(bx-cx,by-cy)-rr)>Math.max(1e-6,rr*1e-3)){
      out.push({r:0,x:b.x,y:b.y,z:b.z}); continue;
    }
    out.push({r:0,x:ax,y:ay,z:b.z});
    out.push({r:0,x:bx,y:by,z:b.z,arc:{i:cx-ax,j:cy-ay,cw:sgn<0}});
  }
  const last=P[P.length-1];
  out.push({r:0,x:last.x,y:last.y,z:last.z});
  return out;
}
function faoRoundMoves(moves,radius){
  // Arrondit les passages coupés, passe par passe (les rapides coupent).
  // 10-09-004 : les SÉQUENCES D'ENTRÉE (ent — hélice, rampe, plongée d'entrée)
  // coupent aussi le run et passent telles quelles : ni la géométrie de
  // l'entrée (une hélice arrondie au rayon d'arrondi n'est plus l'entrée
  // calculée), ni son étiquette bleue ne doivent changer. Seules les coupes
  // de parcours sont arrondies.
  const R=isFinite(+radius)&&+radius>0?+radius:0;
  if(!(R>0))return moves;
  const out=[]; let run=[];
  const flush=function(){
    if(run.length>=3){
      const rounded=faoRoundPath(run,R);
      // Le 1er point est déjà la position courante : on l'omet.
      for(let i=1;i<rounded.length;i++)out.push(rounded[i]);
    }else{
      run.forEach(function(p){out.push({r:0,x:p.x,y:p.y,z:p.z});});
    }
    run=[];
  };
  (moves||[]).forEach(function(m){
    if(m.r||m.arc||m.ent){ flush(); out.push(m); return; }
    run.push({x:m.x,y:m.y,z:m.z});
  });
  flush();
  return out;
}
function faoEstimate(moves,fCut,fRap,accel){
  const fc=isFinite(+fCut)&&+fCut>0?+fCut:1200;
  const fr=isFinite(+fRap)&&+fRap>0?+fRap:5000;
  const A=isFinite(+accel)&&+accel>0?+accel:1000;
  let cut=0, rap=0, nr=0, prev=null;
  (moves||[]).forEach(function(m){
    if(prev!==null){
      const d=faoSegLen(prev,m);
      if(m.r){ rap+=d; nr++; } else cut+=d;
    }
    prev=m;
  });
  // Temps rapide réel : d/v + v/A (trapèze : la décélération « paie » l'accélération).
  // v en mm/s = fr/60, A en mm/s² -> v/A en secondes, converti en minutes.
  const tmin=cut/fc+rap/fr+nr*(fr/60)/A/60;
  return {cut:cut, rap:rap, nr:nr, tmin:tmin};
}

/* ----- origine pièce (point de bloc sur le brut, préréglages) ----- */
// Le G-code est exprimé RELATIF à ce point (= position du G54 sur la machine).
// Phase suivante : point pièce cliqué + orientation (3+2).
function faoOriginPoint(setup){
  // 2026-10-16-017 : l'un des 27 points cardinaux du brut ou du modèle (src/89-fao-posage-repere) ;
  // les préréglages historiques {preset} se lisent comme leurs points équivalents.
  const s=(setup&&setup.stock)||faoStockDefault();
  const sp=faoOriginSpec(setup);
  const B=(sp.src==='model'&&faoModelBox(setup))||s;
  return faoBoxPt(B,sp.pt);
}
function faoOriginLabel(setup){
  const sp=faoOriginSpec(setup);
  const t=faoCardLabel(sp.pt);
  return sp.src==='model'?'modèle · '+t:t;
}
/* ----- plans : retrait (absolu, auto = dessus + 25) ----- */
// 2026-10-08-002 : le plan de dégagement/retrait se règle par RÉFÉRENCE
// (`setup.planes` / `op.planes`) ; les anciens champs absolus `retract` /
// `safeZ` restent le repli des documents qui n'ont jamais touché les plans.
function faoRetractZ(setup){
  if(setup&&setup.planes&&setup.planes.retr){
    const z=faoPlaneZ(setup.planes.retr,null,setup,0);
    if(isFinite(z))return z;
  }
  if(setup&&isFinite(+setup.retract))return +setup.retract;
  const s=(setup&&setup.stock)||faoStockDefault();
  return (isFinite(+s.z1)?+s.z1:0)+25;
}
/* ----- plan de sécurité / dégagement : 100 mm au-dessus de la pièce ----- */
// Tout RAPIDE qui translate en XY passe par ce plan : on remonte d'abord, on
// traverse au plan, puis on plonge. Jamais de translation en Z bas (l'outil
// ne doit pas traverser la matière en G0).
function faoSafeZ(job){
  if(job&&job.planes&&job.planes.clear){
    const z=faoPlaneZ(job.planes.clear,null,job,0);
    if(isFinite(z))return z;
  }
  if(job&&isFinite(+job.safeZ)&&+job.safeZ>-1e9)return +job.safeZ;
  const s=(job&&job.stock)||faoStockDefault();
  return (isFinite(+s.z1)?+s.z1:0)+100; // le brut contient la pièce
}
function faoSafeAhead(prev,m,safe){
  // Points à inserrer AVANT le rapide m (m est ensuite émis tel quel : il devient
  // la plongée verticale au bon XY). null = m peut partir directement.
  if(!m||!m.r)return null;
  if(!prev)return (m.z<safe-1e-9)?[{r:1,x:m.x,y:m.y,z:safe}]:null;
  if(Math.hypot(m.x-prev.x,m.y-prev.y)<=1e-9)return null; // pur axe Z : retrait déjà fait
  if(prev.z>=safe-1e-9&&m.z>=safe-1e-9)return null;       // tout se passe au plan
  const ins=[];
  if(prev.z<safe-1e-9)ins.push({r:1,x:prev.x,y:prev.y,z:safe}); // retrait sur place
  if(m.z<safe-1e-9)ins.push({r:1,x:m.x,y:m.y,z:safe});          // translation au plan
  return ins;
}
function faoSeqSafe(job,seule){
  // Séquence complète du posage [{op,moves}] avec rapides normalisés au plan de
  // sécurité DE CHAQUE OPÉRATION (2026-10-08-002 : plans par opération, hérités
  // du posage). Source unique partagée par l'aperçu, le visionneuse et le G-code.
  // seule=true : LECTURE SEULE — un parcours absent de la memoire est IGNORE
  // (absent:true), jamais calcule : afficher/masquer une trace ne regenerate rien.
  const res=[]; let prev=null;
  ((job&&job.ops)||[]).forEach(function(op){
    if(!op||op.on===false)return;
    const safe=faoClearAbs(op,job); // plan de dégagement de CETTE opération
    let mv=null;
    if(seule){
      mv=faoOpMovesTry(op,job);
      if(mv===null){ res.push({op:op,moves:[],absent:true}); return; }
    }else mv=faoOpMoves(op,job)||[];
    // repère propre (3+2) : dégagements le long du Z de L'OPÉRATION (src/89-fao-posage-repere.js)
    const fr=(function(){try{return faoOpFrame(job,op);}catch(e){return null;}})();
    if(fr&&mv.length){const q=faoSeqSafeOp(job,op,fr,mv,prev);prev=q.prev;res.push({op:op,moves:q.out});return;}
    const out=[];
    for(let i=0;i<mv.length;i++){
      const m=mv[i];
      const ins=faoSafeAhead(prev,m,safe);
      if(ins)for(let k=0;k<ins.length;k++)out.push(ins[k]);
      out.push(m);
      prev=m;
    }
    // Perçage émis en cycle dialecte : la machine repose au plan du cycle
    // (plan de retrait de l'opération = RTP), sous le plan de sécurité.
    if(op.type==='drill'&&mv.length){
      prev={x:mv[mv.length-1].x,y:mv[mv.length-1].y,z:faoZoneSecu(op,job)};
    }
    res.push({op:op,moves:out});
  });
  return res;
}
