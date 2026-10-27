/* ================= interface (bouton + panneau flottant) ================= */
// 2026-10-14-004 : POCHE 2.5D ADAPTATIVE — géométrie = arêtes du modèle (bord
// de la poche, op.limit chaîne, outil entier dedans), vidage par le moteur de
// l'Ébauche 3D (pelage au petit pas, hélices, trochoïdes dans les goulets,
// fonds détectés, îlots = matière du solide). op.strat='adaptive' ; une poche
// sans ce champ (documents antérieurs) reste la poche RECTANGLE historique.
// Fiche poche adaptative : section « Bord de la poche » (sélection d'arêtes).
function faoPocketGeoRows(d,setup,op){
  d.appendChild(faoH('Bord de la poche'));
  const L=(op.limit&&op.limit.mode==='chain')?op.limit:null;
  const has=!!(L&&(L.loop||[]).length>=3);
  const rc=faoRow();
  const info=document.createElement('span'); info.className='fao-meta';
  info.textContent=has
    ?(L.nEdges||'?')+' arête(s), boucle '+(L.closed?'fermée':'refermée')+' · fond détecté '+op.zbot
    :'aucun bord — cliquez les arêtes du bord de la poche';
  rc.appendChild(info);
  const bs=document.createElement('button'); bs.textContent=has?'Re-sélectionner':'Sélectionner le bord';
  bs.style.fontSize='.72rem';
  bs.title='Cliquez les arêtes qui entourent la poche (bord haut ou fond) : la poche est vidée à l’intérieur, outil entier dedans, jusqu’au fond. Les bossages intérieurs sont des îlots automatiques (matière du solide).';
  bs.onclick=function(){
    if(!op.limit||op.limit.mode!=='chain')op.limit={mode:'chain',loop:[],closed:false,nEdges:0,tangent:true,side:'in',extra:0};
    faoChainStart(setup.id,op.id);
  };
  rc.appendChild(bs);
  d.appendChild(rc);
  if(L&&L.stale){
    const ws=document.createElement('div'); ws.className='fao-alert';
    ws.textContent='⚠ Modèle modifié : arêtes du bord non retrouvées — boucle inchangée (obsolète), re-sélectionnez le bord.';
    d.appendChild(ws);
  }
}
// Fond de poche : Z le plus bas du solide sous la boucle (sommets et centres
// de triangles dedans, outil entier dedans), borné au brut ; aucun triangle
// (poche débouchante) -> bas du brut.
function faoPocketFloor(mesh,loop,zMin){
  // Fond de poche : la plus basse des faces quasi horizontales tournées vers le haut, sous la
  // boucle ET VUES DU DESSUS (aucune matière au-dessus) — une facette de paroi d'un trou
  // transversal, cachée dans la matière, n'est pas un fond (repère 3+2 : trous verticaux du
  // posage vus de côté).
  const V=mesh.v;
  let lx0=1/0,ly0=1/0,lx1=-1/0,ly1=-1/0;
  (loop||[]).forEach(function(p){if(p[0]<lx0)lx0=p[0];if(p[0]>lx1)lx1=p[0];if(p[1]<ly0)ly0=p[1];if(p[1]>ly1)ly1=p[1];});
  let top=null,g=1,nx=0,ny=0;
  if(lx1>lx0&&ly1>ly0){
    g=Math.max(0.2,Math.hypot(lx1-lx0,ly1-ly0)/300);
    nx=Math.ceil((lx1-lx0)/g)+1;ny=Math.ceil((ly1-ly0)/g)+1;top=new Float32Array(nx*ny).fill(-1/0);
    for(let i=0;i<mesh.t.length;i++){
      const T=mesh.t[i],A=V[T[0]],B=V[T[1]],C=V[T[2]];
      const d=(B[1]-C[1])*(A[0]-C[0])+(C[0]-B[0])*(A[1]-C[1]);if(Math.abs(d)<1e-12)continue;
      const i0=Math.max(0,Math.floor((Math.min(A[0],B[0],C[0])-lx0)/g)),i1=Math.min(nx-1,Math.ceil((Math.max(A[0],B[0],C[0])-lx0)/g));
      const j0=Math.max(0,Math.floor((Math.min(A[1],B[1],C[1])-ly0)/g)),j1=Math.min(ny-1,Math.ceil((Math.max(A[1],B[1],C[1])-ly0)/g));
      for(let j=j0;j<=j1;j++)for(let k=i0;k<=i1;k++){const x=lx0+k*g,y=ly0+j*g;
        const l1=((B[1]-C[1])*(x-C[0])+(C[0]-B[0])*(y-C[1]))/d,l2=((C[1]-A[1])*(x-C[0])+(A[0]-C[0])*(y-C[1]))/d,l3=1-l1-l2;
        if(l1<-1e-9||l2<-1e-9||l3<-1e-9)continue;const z=l1*A[2]+l2*B[2]+l3*C[2];const q=j*nx+k;if(z>top[q])top[q]=z;}
    }
  }
  const seen=function(x,y,z){ // rien au-dessus de (x,y,z) ?
    if(!top)return true;const k=Math.round((x-lx0)/g),j=Math.round((y-ly0)/g);
    if(k<0||j<0||k>=nx||j>=ny)return true;const h=top[j*nx+k];return !(h>z+0.05);
  };
  let zf=1/0;
  for(let i=0;i<mesh.t.length;i++){
    const t=mesh.t[i],A=V[t[0]],B=V[t[1]],C=V[t[2]];
    const cx=(A[0]+B[0]+C[0])/3,cy=(A[1]+B[1]+C[1])/3,cz=(A[2]+B[2]+C[2])/3;
    if(cz>=zf||!faoPointInPoly(cx,cy,loop))continue;
    // face quasi horizontale tournée vers le haut = fond
    const ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2],wx=C[0]-A[0],wy=C[1]-A[1],wz=C[2]-A[2];
    const nz=ux*wy-uy*wx,nl=Math.hypot(uy*wz-uz*wy,uz*wx-ux*wz,nz);
    if(!(nl>0)||nz/nl<0.98)continue;
    if(cz>=zMin-1e-9&&seen(cx,cy,cz))zf=cz;
  }
  return zf<1/0?Math.round(zf*1000)/1000:zMin;
}
function faoPocketAdapt(op){ return !!(op&&op.type==='pocket'&&op.strat==='adaptive'); }
// Opérations calculées sur le MAILLAGE du solide (clé de cache liée au solide).
function faoMeshOp(op){ return !!(op&&(op.type==='rough3d'||op.type==='geofinish'||op.type==='geodesic'||faoPocketAdapt(op)||
  (typeof faoContourProfil==='function'&&faoContourProfil(op))||op.type==='chamfer')); }
function faoOpDefaults(type){
  const s=faoStock(); const job=faoDoc();
  const tool=(job.tools&&job.tools[0])||{id:'T1',d:10};
  const cx=(s.x0+s.x1)/2, cy=(s.y0+s.y1)/2;
  const base={id:faoNewId('op'), on:true, toolId:tool.id, radial:0, axial:0};
  const D=isFinite(+tool.d)?+tool.d:10;
  if(type==='facing')return Object.assign({},base,{type:'facing', z:s.z1, ae:+(D*0.6).toFixed(2), arrondi:0});
  if(type==='pocket')return Object.assign({},base,{type:'pocket',strat:'adaptive',
    // bord = chaîne d'arêtes à sélectionner (outil entier dans la poche)
    limit:{mode:'chain',loop:[],closed:false,nEdges:0,tangent:true,side:'in',extra:0},
    ztop:s.z1, zbot:s.z0, ap:+Math.max(1,D).toFixed(2), ae:+(D*0.2).toFixed(2),
    radial:0.3, axial:0.2, finitParois:true, finitN:1, finitProf:1,
    entry:'circ', sens:'avalant', arrondi:0, mode:'escargot'});
  if(type==='contour')return Object.assign({},base,{type:'contour',strat:'profil',
    // profil = chaîne d'arêtes (bas de la paroi) ; côté auto, avalant
    limit:{mode:'chain',loop:[],closed:false,nEdges:0,tangent:true,side:'center',extra:0},
    ztop:s.z1, zbot:s.z0, ap:+Math.max(1,D).toFixed(2), ae:+(D*0.4).toFixed(2), nR:1, fin:0.2,
    radial:0, axial:0, sens:'avalant', overlap:1, tabN:0, tabW:5, tabH:2, arrondi:0});
  if(type==='drill'){
    // 2026-10-15-011 : trous RECONNUS sur le modèle (aucun par défaut — plus de trou
    // fantôme au centre du brut sur toute sa hauteur), foret de la bibliothèque.
    const dr=(job.tools||[]).find(function(t){return t.kind==='drill';});
    return Object.assign({},base,{type:'drill',toolId:dr?dr.id:base.toolId,src:'model',holeSel:[],holes:[],
      cycle:'drill',depthMode:'full',brk:1,order:'auto',peck:0,dwell:0,
      pts:[], ztop:s.z1, zbot:s.z0});
  }
  if(type==='rough3d')return Object.assign({},base,{type:'rough3d',
    ztop:s.z1, zbot:s.z0, ap:5, ae:+(D*0.6).toFixed(2),
    radial:0.5, axial:0.5,
    // 2026-10-08-004 : entrée circulaire (arc tangent) par défaut à la
    // création — 'auto' garde l'hélice/plongée historique des anciens docs.
    entry:'circ', minipasses:0,
    // 2026-10-22-001 : finir une région avant la suivante (faoRegionOrder)
    parRegion:true,
    // 2026-10-07-005 : l'ESCARGOT est la 1re selection a la creation
    // (les documents anciens sans mode restent conventionnels).
    mode:'escargot',
    // 2026-10-08-003 : sens de passe — 'avalant' (defaut a la creation) =
    // sens de coupe CONSTANT : aucune chaine retournee, la passe suit toujours
    // le meme sens d'avance (les dents attaquent la matiere de la meme facon,
    // cf. sens de rotation de la fraise). Absent = legacy 'bidir' (retournement
    // vers l'extremite la plus proche, documents anteriurs inchanges).
    sens:'avalant',
    arrondi:+(Math.min(2,D*0.25)).toFixed(2)});
  if(type==='geofinish')return Object.assign({},base,{type:'geofinish',
    step:1, laisse:0, entry:'circ', ztop:s.z1, zbot:s.z0,
    // 2026-10-14-001 : Crêtes constantes façon Fusion par défaut, sens unique
    // avalant (cav.txt relu anneau par anneau : 30 + 24 anneaux, TOUS dans le
    // même sens par front — la lecture « sens alterné » du 007 était fausse).
    traj:'scallop', sens:'avalant'});
  // 2026-10-21-001 : GÉODÉSIQUE — faces pilotes à choisir dans la vue (ensemble
  // de faces tangentes), pas mesuré sur la surface, glissement au contact.
  if(type==='geodesic')return Object.assign({},base,{type:'geodesic',
    faces:[], tangent:true, step:+Math.max(0.2,Math.min(1,D*0.05)).toFixed(2), laisse:0, sens:'avalant'});
  // Type retiré (2026-10-06-004 : pocket3d) ou inconnu -> null : pas de fiche,
  // pas d'opération fantôme. Seule la barre « + Usinage » crée des opérations.
  // V0.7.9 : CHANFREIN — chaîne d'arêtes du haut, largeur, décalage de pointe (src/89-fao-chanfrein.js)
  if(type==='chamfer'){
    const ct=(job.tools||[]).find(function(t){return t&&(t.kind==='chamfer'||t.kind==='spot');});
    return Object.assign({},base,{type:'chamfer',toolId:ct?ct.id:base.toolId,
      limit:{mode:'chain',loop:[],closed:false,nEdges:0,tangent:true,side:'center',extra:0},
      w:0.5,tipOff:0.3,cside:'auto',sens:'avalant',overlap:1});
  }
  if(['facing','pocket','contour','drill','rough3d','geofinish','geodesic'].indexOf(type)<0)return null;
  return Object.assign({},base,{type:type});
}
// Les 6 usinages et leur libellé court — source unique des boutons « + » de
// l'arbre FAO (l'ordre est contractuel : les tests cliquent par index).
function faoAddOpsSpec(){
  // V0.7.9 : la Poche (redondante avec l'Ébauche 3D) cède sa place au Chanfrein ; les poches des
  // fichiers existants restent lisibles et calculées
  return [['facing','+ Surfaçage'],['chamfer','+ Chanfrein'],['contour','+ Contour'],
    ['drill','+ Perçage'],['rough3d','+ Ébauche 3D'],['geofinish','+ Finition'],['geodesic','+ Géodésique']];
}
/* ================= interface FAO : arbre + fiches panneau droit ================= */
// Arbre FAO dédié (overlay dans la vue 3D) : posages > opérations, état on/off,
// badge outil. La fiche du posage / de l'op sélectionnée s'affiche dans le
// panneau droit (#props), comme toute fonction dessin (hook dans renderProps).
function faoH(t){ const h=document.createElement('div');
  h.className='fao-h'; h.textContent=t; return h; }
function faoRow(){ const d=document.createElement('div');
  d.className='fao-row'; return d; }
function faoLab(t){ const s=document.createElement('span');
  s.className='fao-lab'; s.textContent=t; return s; }
// 2026-10-22-007 : MISE EN LIGNE des fiches (retour : « une présentation soignée,
// la même que le panneau Plan, car c'est l'anarchie ») — chaque rangée
// « libellé + champ » devient UNE ligne par réglage : libellé à gauche, champ(s)
// alignés à droite, unité juste après le champ ; case à cocher À DROITE de son
// libellé ; plusieurs réglages tassés sur une rangée = plusieurs lignes. Les
// éléments sont DÉPLACÉS (jamais clonés) : leurs gestionnaires restent branchés.
// Rangées non reconnues (en-tête d'opération, boutons seuls…) : intactes.
function faoTidyRows(root){
  if(!root||!root.querySelectorAll)return;
  const isEl=function(e){return !!(e&&e.nodeType===1);};
  const has=function(e,c){return isEl(e)&&e.classList&&e.classList.contains(c);};
  const isLab=function(e){return isEl(e)&&e.tagName==='SPAN'&&has(e,'fao-lab');};
  const isCtl=function(e){return isEl(e)&&/^(INPUT|SELECT|BUTTON|TEXTAREA)$/.test(e.tagName);};
  const isCb=function(e){return isCtl(e)&&e.tagName==='INPUT'&&e.type==='checkbox';};
  const isChk=function(e){return isEl(e)&&e.tagName==='LABEL'&&has(e,'fao-check');};
  Array.prototype.slice.call(root.querySelectorAll('.fao-row')).forEach(function(row){
    if(has(row,'fao-line')||!row.parentNode)return;
    Array.prototype.slice.call(row.children).forEach(function(c){
      if(has(c,'fao-pair')){while(c.firstChild)row.insertBefore(c.firstChild,c);row.removeChild(c);}});
    const ch=[];
    for(let n=row.firstChild;n;n=n.nextSibling){
      if(n.nodeType===3){if(n.textContent.trim())return;continue;}
      if(n.nodeType===1)ch.push(n);
    }
    const f=ch[0];
    if(!f||!(isLab(f)||isChk(f)||(isCb(f)&&isLab(ch[1]))))return;
    const groups=[];let g=null;
    for(let i=0;i<ch.length;i++){const e=ch[i];
      if(isChk(e)){g={chk:e,ctl:[]};groups.push(g);continue;}
      if(has(e,'fao-help')){groups.push({help:e});g=null;continue;}
      if(isCb(e)&&isLab(ch[i+1])){g={lab:ch[i+1],ctl:[e]};groups.push(g);i++;continue;}
      // un libellé suivi d'un champ ouvre un réglage ; sinon c'est l'unité du précédent
      if(isLab(e)&&(!g||g.help||isCtl(ch[i+1]))){g={lab:e,ctl:[]};groups.push(g);continue;}
      if(!g||g.help){g={lab:null,ctl:[]};groups.push(g);}
      g.ctl.push(e);
    }
    const par=row.parentNode;
    groups.forEach(function(q){
      if(q.help){par.insertBefore(q.help,row);return;}
      const ln=document.createElement('div');ln.className='fao-row fao-line';
      if(row.style&&row.style.cssText)ln.style.cssText=row.style.cssText;
      if(row.title)ln.title=row.title;
      if(q.chk){ln.classList.add('fao-line-chk');ln.appendChild(q.chk);q.ctl.forEach(function(e){ln.appendChild(e);});}
      else{
        if(q.lab)ln.appendChild(q.lab);
        const c=document.createElement('span');c.className='fao-ctl';
        q.ctl.forEach(function(e){c.appendChild(e);});
        if(q.ctl.length)ln.appendChild(c);
      }
      par.insertBefore(ln,row);
    });
    par.removeChild(row);
  });
}
function faoSnapshot(title){
  // Instantané du document AVANT mutation — même discipline que le modèle dessin
  // (45-annuler-document.js) : Ctrl+Z revient à l'état FAO précédent. Le titre du
  // widget (infobulle) devient le libellé dans le bouton « Annuler ».
  try{
    if(typeof docPushUndo==='function')
      docPushUndo('FAO : '+(title?String(title).slice(0,48):'modification'));
  }catch(e){}
}
function faoAllOps(){
  // Toutes les operations de TOUS les posages (modifier un outil peut perimier
  // les parcours d'un posage qui n'est pas actif).
  try{
    const r=faoRoot(), out=[];
    (r.setups||[]).forEach(function(s){ ((s&&s.ops)||[]).forEach(function(o){ if(o)out.push(o); }); });
    return out;
  }catch(e){ return []; }
}
function faoStaleCount(){ let n=0; faoAllOps().forEach(function(o){ if(o&&o.stale===true)n++; }); return n; }
function faoStaleScan(){
  // EXACT : une operation est "a regenerer" quand sa cle de cache ne correspond
  // plus a l'entree memorisee (outil, parametres, brut, maillage). C'est ce test
  // qui empeche la regeneration eager : tant qu'une operation est perimee,
  // faoOpMoves renvoie l'ancien trace et l'icone ! s'affiche dans l'arbre.
  let n=0;
  try{
    const r=faoRoot();
    (r.setups||[]).forEach(function(s){
      ((s&&s.ops)||[]).forEach(function(o){
        if(!o)return;
        // Prima le maillage AVANT la cle (comme faoOpMoves) : la 1re lecture
        // d'une ebauche 3D incremente faoBodyGen.
        if(faoMeshOp(o)){ try{ faoActiveMesh(s); }catch(e){} }
        // 2026-10-15-011 : perçage = instantané → régénéré sur place, jamais « ⚠ ».
        if(o.type==='drill'){ try{ o.stale=false; faoOpMoves(o,s); }catch(e){} }
        const ck=faoOpMovesKey(o,s), ch=faoOpMovesHit(o);
        const st=(ck!==null)&&!(ch&&ch.key===ck);
        o.stale=st;
        if(st)n++;
      });
    });
  }catch(e){}
  return n;
}
function faoStaleClear(){ faoAllOps().forEach(function(o){ if(o&&o.stale===true)o.stale=false; }); }
function faoStaleWhy(op,job){
  // Pourquoi CETTE ligne est-elle marquée ⚠ ? Trois causes tres differentes
  // (aucune trace / tampon d'ancien moteur / autre cle = le SOLIDE a bouge), et
  // sans cela l'utilisateur ne peut pas trancher — « 1 operation sans parcours »
  // ne dit pas SI la trace existe dans le cache.
  try{
    if(!faoSolidSettled())return 'Rejeu exact en cours : le corps affiche vient du cache local (sans solide). La lecture et la generation attendent la fin du rejeu — quelques secondes.';
    if(faoMovesPending())return 'Lecture du cache en cours : la reponse s affiche dans un instant.';
    const ck=faoOpMovesKey(op,job);
    if(ck===null)return 'Solide ou maillage indisponible : aucune cle de cache possible pour l instant.';
    const ch=faoOpMovesHit(op);
    if(!ch){
      const w=faoMovesWhyGet(job,op);
      if(w&&w.why==='version')return 'Trace conservee mais ecrite par une version ANTERIEURE du moteur ('+w.ver+') : a regenerer une fois, puis re-enregistrer.';
      if(w&&w.why==='cle')return 'Trace conservee sous une AUTRE cle ('+(w.n||0)+' points) : '
        +(w.d||'outil, parametres ou SOLIDE modifies depuis la generation.')
        +' Cette operation n a pas pu etre servie telle quelle depuis le cache.'
        +' Remede : « Tout regenerer » une fois, puis re-enregistrer le fichier'
        +' — la trace reste ensuite valable tant que le solide ne change pas.';
      if(w&&w.why==='absente')return 'Aucune trace enregistree pour cette operation (jamais generate ici, ou cache purge).';
      if(w&&w.why==='format')return 'Entree de cache illisible : a regenerer une fois.';
      return 'Aucune trace enregistree pour cette operation sur cette machine (jamais generate ici).';
    }
    if(ch.key!==ck)return 'Trace en memoire sous une autre cle : '+faoKeyDiff(ch.key,ck)+'.';
    return '';
  }catch(e){ return ''; }
}
function faoOpMovesPurge(){
  // Purge COMPLETE du cache : la prochaine lecture recalcule CHAQUE operation.
  try{ faoOpMovesMap=new WeakMap(); }catch(e){}
}
function faoRegenOp(setupId,opId){
  // Clic sur le triangle ⚠ (arbre OU fiche) : régénérer CETTE opération
  // uniquement — les autres gardent leur tracé, qu'elles soient à jour ou non.
  try{
    const r=faoRoot(); let s=null,o=null;
    (r.setups||[]).forEach(function(x){
      ((x&&x.ops)||[]).forEach(function(q){ if(q&&q.id===opId){ s=x; o=q; } });
    });
    if(!o)return 0;
    o.stale=false;             // débloque le recalcul (clé ≠ cache)
    const mv=faoOpMoves(o,s);
    faoRefreshPreview();       // redessine : cette op est fraîche, les autres servent l'ancien tracé
    if(faoStaleCount()===0)faoPrevStale=false;
    faoRefreshFaoUI();         // arbre (triangle retiré) + fiche + bouton
    return mv?mv.length:0;
  }catch(e){ return 0; }
}
function faoStaleUI(){
  // Reflète faoPrevStale sur le bouton « Tout régénérer » et sur l'export.
  try{
    let bg=faoGenBtnEl;
    if(!bg&&(typeof document!=='undefined'&&document))bg=document.getElementById('faoGenBtn');
    if(bg){
      const n=faoStaleCount();
      bg.textContent=faoPrevStale
        ? (String.fromCharCode(0x26a0)+' Tout régénérer'+(n?' ('+n+')':''))
        : 'Tout régénérer';
      if(bg.classList&&bg.classList.toggle)bg.classList.toggle('fao-stale',!!faoPrevStale);
      bg.title=faoPrevStale
        ? ((n?(n+' opération(s) à régénérer — son triangle ⚠ ne régénère qu’elle. ')
             :'')
           +'Ce bouton régénère TOUTES les opérations puis ré-affiche les traces'
           +' (les traces masquées ligne par ligne le RESTENT).')
        : ('Régénère TOUTES les opérations (même celles à jour) puis RÉ-AFFICHE toutes'
           +' les traces — les traces masquées ligne par ligne ne le sont pas :'
           +' masquez-les à la main, ligne par ligne.');
    }
    let be=faoExportBtnEl;
    if(!be&&(typeof document!=='undefined'&&document))be=document.getElementById('faoExportBtn');
    if(be){
      be.disabled=!!faoPrevStale;
      be.title=faoPrevStale
        ?'Export bloqué : aperçu périmé. Cliquez d’abord sur « Tout régénérer ».'
        :'Exporte le programme du posage courant : G-code Siemens 840D ou Fagor 8065 (.mpf / .nc).';
    }
  }catch(e){}
}
function faoChanged(){
  // Pendant la lecture du cache, aucun verdict n'est fiable : la memoire est vide,
  // tout parait « perime » alors que rien ne l'est (et l'apercu recalculerait tout).
  // On tranchera apres la lecture — cf. faoMovesDone().
  const attend=faoMovesPending();
  if(attend)faoPrevWanted='full';
  else faoStaleScan();            // 1) qui doit être regeneré -> icônes !
  faoTouch();
  if(!attend)faoRefreshPreview(); // 2) redraw : sert l'ancien trace pour les perimes
  faoRefreshFaoUI();
  faoPrevStale=true;
  faoStaleUI();
}
function faoVisibleChanged(){
  // OEIL « Masquer / Afficher » : champ PUREMENT AFFICHAGE (ignore par faoOpSig, le
  // G-code ne change pas, l'export reste valide, aucun triangle). On DESSINE ce qui
  // est deja en memoire : ouvrir un document puis masquer une operation ne doit
  // JAMAIS declencher la regeneration des trajectoires (~90 s sur l'ebauche 3D).
  faoTouch();
  if(faoMovesPending()){
    if(!faoPrevWanted)faoPrevWanted='lecture'; // redraw en fin de lecture
    faoRefreshFaoUI();
    return;
  }
  const n=faoRefreshPreview(true);
  faoRefreshFaoUI();
  try{
    if(faoPrevMissing>0&&typeof faceEl!=='undefined'&&faceEl){
      let why='';
      try{
        const job=faoDoc();
        const ops=faoActiveOps(job).filter(function(o){ return !o||!o.hidden; });
        for(let i=0;i<ops.length;i++){
          const ck=faoOpMovesKey(ops[i],job), ch=faoOpMovesHit(ops[i]);
          if(ck!==null&&!(ch&&ch.key===ck)){ why=faoMovesWhyShort(job,ops[i]); if(why)break; }
        }
      }catch(e){}
      faceEl.textContent='FAO : '+faoPrevMissing+' operation(s) sans parcours en memoire'
        +' ('+n+' points affiches)'
        +(why?' — '+why:'')
        +' — « Tout régénérer » pour les produire.';
    }
    else if(n>0&&typeof faceEl!=='undefined'&&faceEl)
      faceEl.textContent='FAO : '+n+' points de parcours.';
  }catch(e){}
}
function faoReset(){
  // « Nouveau modèle » : la FAO repart de zéro — mode lecture fermé, fenêtre outils
  // fermée, traces retirées de la scène, posages et opérations remis au défaut.
  try{ if(typeof faoVw!=='undefined'&&faoVw)faoViewerClose(); }catch(e){}
  try{ if(typeof faoToolsWin!=='undefined'&&faoToolsWin)faoToolsWindowClose(); }catch(e){}
  try{ if(typeof doc!=='undefined'&&doc)delete doc.fao; }catch(e){} // faoRoot() recrée un posage propre
  try{ if(typeof sel!=='undefined'&&sel&&(sel.kind==='faoSetup'||sel.kind==='faoOp'))sel={kind:null,id:null}; }catch(e){}
  try{ faoViewerBtnUpdate(); }catch(e){}
  try{ faoChanged(); }catch(e){} // traces (0 pt désormais) + arbre + fiche
  // Rien à valider : sans opération active, un bouton « ⚠ Tout régénérer » ment
  // (il n'y a rien à générer) — le bouton revient au vert dès l'ouverture.
  try{
    if(!faoActiveOps(faoDoc()).length){ faoPrevStale=false; faoStaleUI(); }
  }catch(e){}
}
function faoNum(val,fn,w,step,title){
  // V0.11.15 : champ TEXTE décimal (un type=number refuse « L/2 ») — ƒx global, ↑/↓ = pas
  const i=document.createElement('input'); i.type='text'; i.inputMode='decimal'; i.className='fao-in fao-num';
  // valeur affichée arrondie (1,000000001 → 1) : jamais de chiffres parasites
  i.value=(typeof val==='number'&&isFinite(val))?String(+val.toFixed(4)):val;
  if(step)i.step=step;
  if(title)i.title=title;
  i.onchange=function(){ const v=parseFloat(String(i.value).replace(',','.')); if(isFinite(v)){ faoSnapshot(title); fn(v); faoChanged(); } };
  parNumKeys(i);
  return i; }
function faoTxt(val,fn,w,title){
  const i=document.createElement('input'); i.type='text'; i.className='fao-in';
  i.value=val;
  if(title)i.title=title;
  i.onchange=function(){ faoSnapshot(title); fn(i.value); faoChanged(); };
  return i; }
function faoSel(opts,val,fn,title){
  const s=document.createElement('select'); s.className='fao-sel';
  opts.forEach(function(o){ const op=document.createElement('option');
    op.value=o[0]; op.textContent=o[1]; if(o[2])op.title=o[2]; s.appendChild(op); });
  s.value=val;
  if(title)s.title=title;
  s.onchange=function(){ faoSnapshot(title); fn(s.value); faoChanged(); };
  return s; }
function faoMini(t,fn,title){
  const b=document.createElement('button'); b.className='fao-mini'; b.textContent=t;
  if(title)b.title=title;
  b.onclick=function(){ faoSnapshot(title||('bouton « '+t+' »')); fn(); faoChanged(); };
  return b; }
function faoHelp(t){
  // Ligne d'aide sous un groupe de champs (néophytes : quoi mettre et pourquoi).
  const n=document.createElement('div');
  n.className='fao-help';
  n.textContent=t; return n; }
/* 2026-10-08-004 : lignes « Entrée » + « R entrée » communes aux fiches
   Poche / Contour / Ébauche 3D / Finition : sélection du mode (circ par
   défaut) et rayon du cercle d'entrée (défaut Ø/4). */
function faoEntryRows(rp,op,D){
  rp.appendChild(faoLab('Entrée'));
  rp.appendChild(faoSel([
    ['circ','Cercle · arc tangent','Rapide sur place, descente en Z à l\'ancre, arc tangent sur la passe — défaut.'],
    ['auto','Auto · hélice si possible','Hélice quand le vide fait ≥ 2×Ø, sinon rampe.'],
    ['helix','Hélice · descente circulaire','Creuse sa place en tournant : il faut un vide d\'au moins 2×Ø.'],
    ['ramp','Rampe · descente en biais','Descend en avançant le long de la passe : passe partout, plus lent.']],
    op.entry||'circ',function(v){op.entry=v;},
    'Manière de plonger dans la matière — jamais de plongée verticale.'));
  const dE=(isFinite(+D)&&+D>0)?+D:10;
  rp.appendChild(faoLab('Rayon d\'entrée'));
  rp.appendChild(faoNum(isFinite(+op.entryR)&&+op.entryR>0?+op.entryR:+(dE/4).toFixed(2),function(v){
    if(isFinite(v)&&v>0)op.entryR=v; else delete op.entryR;
  },44,0.1,
  'Rayon du cercle d\'entrée (mm) : le centre du cercle se place à ce rayon de l\'ancre, l\'arc arrive en tangence sur la passe. Défaut Ø/4 de l\'outil ; 0 = défaut.'));
}
/* 2026-10-08-003 : infos de mode en menu CONTEXTUEL — la fiche reste lisible
   (les blocs d'aide « trop en place » ont été retirés) : clic droit sur le
   select Mode de l'Ébauche 3D = popup avec le texte du mode CHOISI. Fermeture
   sur clic extérieur, Échap, ou changement de mode (voir le wrapper du select). */
let faoInfoBox=null, faoInfoOff=null;
function faoModeInfoClose(){
  if(faoInfoOff){ try{faoInfoOff();}catch(e){} faoInfoOff=null; }
  if(faoInfoBox){
    try{ faoInfoBox.remove(); }catch(e){}
    // Le harnais de test stub remove() : on désactive aussi la classe pour que
    // « popup fermé » soit observable partout (inoffensif côté navigateur).
    try{ faoInfoBox.className='fao-ctx-off'; }catch(e){}
    faoInfoBox=null;
  }
}
function faoModeInfoShow(x,y,text){
  faoModeInfoClose();
  const b=document.createElement('div');
  b.className='fao-ctx';
  b.textContent=text;
  try{ b.style.left=Math.max(4,x)+'px'; b.style.top=Math.max(4,y)+'px'; }catch(e){}
  try{ document.body.appendChild(b); }catch(e){ return; }
  faoInfoBox=b;
  try{
    const away=function(e){
      if(faoInfoBox&&e&&e.target&&faoInfoBox.contains&&faoInfoBox.contains(e.target))return;
      faoModeInfoClose();
    };
    const key=function(e){ if(!e||e.key==='Escape'||e.keyCode===27)faoModeInfoClose(); };
    window.addEventListener('pointerdown',away);
    window.addEventListener('keydown',key);
    faoInfoOff=function(){
      try{ window.removeEventListener('pointerdown',away); }catch(e){}
      try{ window.removeEventListener('keydown',key); }catch(e){}
    };
  }catch(e){}
}
function faoCard(){
  const d=document.createElement('div');
  d.className='fao-card';
  return d; }
function faoRefreshFaoUI(){
  try{ faoRenderTree(); }catch(e){}
  try{
    if(typeof sel!=='undefined'&&sel&&sel.kind&&(sel.kind==='faoSetup'||sel.kind==='faoOp')
      &&typeof renderProps==='function')renderProps();
  }catch(e){}
  faoStaleUI();
}
let faoTreeWrapEl=null; // ref réelle du panneau arbre FAO (la lecture par id est ambiguë sous stub)
let faoAddBarEl=null;   // barre des 7 +usinage posée sur la vue 3D
let faoWrapEl=null;     // colonne de droite #faoWrap : barre des +usinage + panneau FAO
let faoFolded=false;    // panneau FAO rabattu sur sa droite (persisté en localStorage)
let faoCntEl=null;      // contenu .fao-cnt (ref réelle pour le repli programmatique)
let faoTogEl=null;      // onglet #faoToggle (ref réelle : lecture par id ambiguë sous stub)
function faoFoldSet(f){ // replier/déplier SANS toucher à localStorage (clic manuel = persistance)
  if(!faoTreeWrapEl||!faoCntEl||!faoTogEl)return;
  faoFolded=!!f;
  try{faoCntEl.style.display=faoFolded?'none':'';}catch(e){}
  try{faoTreeWrapEl.classList.toggle('folded',faoFolded);}catch(e){}
  faoTogEl.textContent=faoFolded?'❮':'❯';
  faoTogEl.title=faoFolded?'Déplier le panneau FAO':'Rabattre le panneau FAO sur la droite';
  if(faoAddBarEl)faoAddBarEl.style.display=faoFolded?'none':'';
  try{viewCenterShift();}catch(e){} // V0.2.5 : le pivot suit la zone visible
}
function faoInitUI(){
  if(typeof document==='undefined')return;
  try{
    if(typeof window!=='undefined'&&window.addEventListener&&!faoVwEsc){
      faoVwEsc=true; // une seule fois
      window.addEventListener('keydown',function(e){
        if(e.key!=='Escape')return;
        if(faoToolsWin){ faoToolsWindowClose(); return; } // fenêtre outils d'abord
        if(faoVw){
          faoViewerClose();
          faoViewerMsg('FAO : mode lecture usinage quitté (Échap) — traces ré-affichées.');
        }
      });
    }
    // 7 boutons d'ajout : sur la vue 3D (même pilule que #viewbar), posés sur la
    // colonne de droite AU-DESSUS du panneau FAO — masqués dès que ce panneau est
    // rabattu. Le panneau FAO coule lui-même sous la barre dans la même colonne.
    if(!faoAddBarEl){
      const barHost=document.getElementById('vpwrap')||document.body;
      if(barHost){
        // colonne de droite #faoWrap : barre des +usinage puis panneau FAO
        let col=null;
        const sib=barHost.children||[];
        for(let i=0;i<sib.length;i++){ if(sib[i]&&sib[i].id==='faoWrap'){col=sib[i];break;} }
        if(!col){ col=document.createElement('div'); col.id='faoWrap'; barHost.appendChild(col); }
        faoWrapEl=col;
        const bar=document.createElement('div');
        bar.id='faoAddBar';
        bar.className='fao-addbar'; // pilule : meme panneau que #viewbar (faoUiCss)
        const lab=document.createElement('span');
        lab.className='fao-addlab';
        lab.textContent='+ Usinage';
        lab.title='Ajouter une opération d’usinage au posage courant — sa fiche s’ouvre dans le panneau de droite.';
        bar.appendChild(lab);
        faoAddOpsSpec().forEach(function(a){
          const nm=a[1].replace(/^\+ /,'');
          const b=document.createElement('button');
          b.textContent=nm;
          b.title='Ajouter une opération « '+nm+' » au posage courant (puis sa fiche s’ouvre à droite)';
          b.onclick=function(){
            try{
              const op=faoOpDefaults(a[0]);
              if(!op)return;
              const s=faoSetup();
              faoSnapshot('nouvelle opération « '+nm+' »');
              s.ops.push(op);
              faoChanged();
              faoSelectOp(s.id,op.id);
            }catch(e){}
          };
          bar.appendChild(b);
        });
        col.appendChild(bar);
        faoAddBarEl=bar;
      }
    }
    if(!faoTreeWrapEl){
      const host=faoWrapEl||document.getElementById('vpwrap')||document.body;
      const w=document.createElement('div');
      w.id='faoTreeWrap'; // habillage entièrement en CSS injecté (faoUiCss)
      // onglet de repli — procédé identique à l'arbre des corps (src/95-toolbar.js)
      const tog=document.createElement('button');
      tog.id='faoToggle';
      tog.textContent='❯';
      tog.title='Rabattre le panneau FAO sur la droite';
      w.appendChild(tog);
      const cnt=document.createElement('div');
      cnt.className='fao-cnt';
      w.appendChild(cnt);
      const t=document.createElement('div');
      t.className='fao-title';
      t.textContent='FAO · posages';
      cnt.appendChild(t);
      const tree=document.createElement('div'); tree.id='faoTree'; cnt.appendChild(tree);
      const grp=function(label){ const g=document.createElement('div'); g.className='fao-h'; g.textContent=label; return g; };
      const row=function(){ const d=document.createElement('div'); d.className='fao-actions'; return d; };
      // Les 7 +usinage vivent sur la vue 3D (faoAddBar) ; ici les ACTIONS du
      // posage, regroupées sous un libellé qui dit ce que le bouton fait.
      cnt.appendChild(grp('Posage'));
      const r1=row();
      const add=document.createElement('button'); add.textContent='+ Posage';
      add.title='Nouveau posage (machine, origine, brut propres).';
      add.onclick=function(){
        try{
          const r=faoRoot();
          faoSnapshot('nouveau posage');
          const s=faoDefaultSetup(); s.name='POSAGE'+(r.setups.length+1);
          r.setups.push(s); r.activeSetupId=s.id;
          faoChanged();
        }catch(e){}
      };
      r1.appendChild(add);
      const tw=document.createElement('button'); tw.id='faoToolsBtn'; tw.textContent='Outils';
      tw.title='Bibliothèque d\'outils du posage : fenêtre flottante (Échap ou ✕ pour fermer).';
      tw.onclick=function(){ faoToolsWindowToggle(); };
      r1.appendChild(tw);
      cnt.appendChild(r1);
      cnt.appendChild(grp('Exécution'));
      const r2=row();
      const bvw=document.createElement('button'); bvw.id='faoVwBtn';
      bvw.textContent=faoVw?'■ Quitter l\'usinage':'▶ Usinage';
      bvw.title='Viewer d\'usinage : cache les traces, anime l\'outil le long du parcours (Échap pour sortir).';
      bvw.onclick=function(){ faoViewerToggle(); };
      faoVwBtn=bvw;
      r2.appendChild(bvw);
      // 2026-10-13-003 : cycle d'affichage des rapides (tous / fondus /
      // masqués) — recoloration seule, aucune régénération. État persisté.
      try{ const rv=localStorage.getItem('minifusion_faoRap');
        if(rv==='fondu'||rv==='masque')faoViewerRap=rv; }catch(e){}
      const brap=document.createElement('button'); brap.id='faoRapBtn';
      brap.textContent=faoViewerRapLabel(faoViewerRap);
      brap.title='Traces rapides (rouges) : ✓ tous (30 %) — ~ fondus (8 %, contexte sans bruit) — ✕ masqués (coupe et entrées seules).';
      brap.onclick=function(){ faoViewerRapNext(); };
      faoVwRapBtn=brap;
      r2.appendChild(brap);
      cnt.appendChild(r2);
      // Tout régénérer : en bas d'Exécution, toujours visible — régénère TOUTES
      // les trajectoires ; les traces masquées ligne par ligne le RESTENT masquées.
      const bg=document.createElement('button'); bg.id='faoGenBtn'; faoGenBtnEl=bg;
      bg.className='fao-gen';
      bg.textContent='Tout régénérer';
      bg.title='Régénère TOUTES les trajectoires (même celles à jour). Les traces'
        +' masquées ligne par ligne le restent — masquez-les à la main.';
      bg.onclick=function(){
        // 2026-10-09-005 : flux progressif — les courbes apparaissent pendant
        // la génération (le bouton est grisé le temps du calcul).
        if(bg.disabled)return;
        bg.disabled=true;
        const done=function(){ try{ bg.disabled=false; }catch(e){} };
        try{
          Promise.resolve(faoPreviewGenerateAsync()).then(function(){
            try{ faoRefreshFaoUI(); }catch(e){}
            done();
          },function(e){
            try{ if(typeof console!=='undefined'&&console&&console.log)console.log('regen',e); }catch(e2){}
            try{ faoRefreshFaoUI(); }catch(e){}
            done();
          });
        }catch(e){ done(); }
      };
      cnt.appendChild(bg);
      cnt.appendChild(grp('Export'));
      const r4=row();
      const be=document.createElement('button'); be.id='faoExportBtn'; faoExportBtnEl=be; be.className='primary'; be.textContent='Exporter G-code';
      be.title='Exporte le programme du posage courant : G-code Siemens 840D ou Fagor 8065 (.mpf / .nc).';
      be.onclick=function(){ faoExport(); };
      r4.appendChild(be);
      cnt.appendChild(r4);
      faoViewerBtnUpdate();
      // Refs du repli programmatique (session d'esquisse) posées AVANT la
      // restauration initiale, qui passe par fold() → faoFoldSet.
      faoTreeWrapEl=w;faoCntEl=cnt;faoTogEl=tog;
      // Repli : contenu masqué, onglet seul au bord droit, barre 3D masquée —
      // état persisté comme l'arbre des corps (clic de l'onglet seul).
      const fold=function(){
        faoFoldSet(!faoFolded);
        try{ localStorage.setItem('minifusion_faoFolded',faoFolded?'1':'0'); }catch(e){}
      };
      tog.onclick=fold;
      try{ if(localStorage.getItem('minifusion_faoFolded')==='1')fold(); }catch(e){}
      host.appendChild(w);
    }
    faoRenderTree();
  }catch(e){}
}
function faoRenderTree(){
  let tree=null;
  try{ tree=document.getElementById('faoTree'); }catch(e){ return; }
  if(!tree)return;
  try{
    tree.innerHTML='';
    const r=faoRoot();
    const isSel=function(kind,id){ try{
      return typeof sel!=='undefined'&&sel&&sel.kind===kind&&sel.id===id;
    }catch(e){ return false; } };
    r.setups.forEach(function(s,si){
      const h=document.createElement('div');
      h.className='fao-setup'+(isSel('faoSetup',s.id)?' sel':'');
      // ▼/▶ : replie les opérations de CE posage — l'état (s.open) est dans le
      // document, donc enregistré/chargé avec la sauvegarde. Déplié par défaut.
      const open=s.open!==false;
      const tri=document.createElement('span');
      tri.className='fao-tri';
      tri.textContent=open?'▼':'▶';
      tri.title=open?'Replier les opérations de ce posage':'Déplier les opérations de ce posage';
      tri.onclick=function(ev){
        try{ if(ev&&ev.stopPropagation)ev.stopPropagation(); }catch(e){}
        s.open=!open;
        faoTouch(); // champ purement UI : persiste dans doc.fao + re-rend l'arbre, sans rien recalculer
      };
      h.appendChild(tri);
      const sl=document.createElement('span');
      sl.textContent='▤ '+s.name+' · '+(FAO_POSTS[s.machine||s.post]?FAO_POSTS[s.machine||s.post].label:s.machine)
        +(faoOrientOn(s)?(' · 3+2 B'+faoOrient(s).b+' C'+faoOrient(s).c):'');
      h.appendChild(sl);
      h.title='Clic = fiche du posage dans le panneau droit'
        +(open?'':' · opérations repliées (clic sur la flèche pour les rouvrir)');
      h.onclick=function(){ faoSelectSetup(s.id); };
      tree.appendChild(h);
      if(open)(s.ops||[]).forEach(function(op,i){
        // ●/○ = ACTIVÉE (entre dans le G-code) — indépendant de « Masquer » : une
        // opération désactivée est absente du programme, une opération masquée
        // est dans le programme mais ses TRACES ne s'affichent pas en 3D.
        const hid=op.hidden===true;
        const off=op.on===false;
        const d=document.createElement('div');
        d.className='fao-op'+(isSel('faoOp',op.id)?' sel':'')
          +(off?' isoff':'')+(hid?' ishid':'');
        d.title='Clic = fiche dans le panneau droit'
          +(hid?' — traces masquées dans la 3D (opération toujours active)':'');
        const eye=document.createElement('span');
        eye.textContent=off?'○':'●';
        eye.className='eye '+(off?'off':'on');
        eye.title='Activer / désactiver (entre dans le G-code)';
        eye.onclick=function(ev){ try{ if(ev&&ev.stopPropagation)ev.stopPropagation(); }catch(e){}
          faoSnapshot('activer/désactiver « '+faoOpShortLabel(op)+' »');
          op.on=!(op.on!==false); faoChanged(); };
        const lb=document.createElement('span'); lb.className='lb';
        lb.textContent=(i+1)+'. '+faoOpShortLabel(op);
        const tool=faoToolById(s,op.toolId);
        const badge=document.createElement('span');
        badge.className='badge';
        badge.textContent='[T'+(tool.num||'?')+']';
        // Masquer / Afficher : traces d'UNE opération, à l'extrême droite (l'œil
        // d'activation reste le premier enfant : ordre contractuel des tests).
        const mb=document.createElement('span');
        mb.className='hbtn'+(hid?' on':'');
        mb.textContent=hid?'Afficher':'Masquer';
        mb.title=hid
          ?'Ré-afficher les traces de cette opération dans la 3D (le G-code n a jamais changé)'
          :'Masquer UNIQUEMENT les traces de cette opération dans la 3D — l opération reste active et exportée';
        mb.onclick=function(ev){ try{ if(ev&&ev.stopPropagation)ev.stopPropagation(); }catch(e){}
          faoSnapshot((hid?'ré-afficher':'masquer')+' les traces de « '+faoOpShortLabel(op)+' »');
          op.hidden=!hid; faoVisibleChanged(); };
        d.appendChild(eye); d.appendChild(lb); d.appendChild(badge);
        if(op.stale===true){
          const sk=document.createElement('span');
          sk.className='stalei';
          sk.textContent=String.fromCharCode(0x26a0);
          const why=faoStaleWhy(op,s);
          sk.title='Parcours à régénérer : CETTE opération a changé. Clic = ne régénérer'
            +' que cette opération (le bouton « Tout régénérer » régénère tout).'
            +(why?(' '+why):'');
          sk.onclick=function(ev){
            try{ if(ev&&ev.stopPropagation)ev.stopPropagation(); }catch(e){}
            faoRegenOp(s.id,op.id);
          };
          d.appendChild(sk);
        }
        d.appendChild(mb);
        d.onclick=function(){ faoSelectOp(s.id,op.id); };
        tree.appendChild(d);
      });
    });
  }catch(e){}
}
function faoOpShortLabel(op){
  const n={facing:'Surfaçage',pocket:'Poche',chamfer:'Chanfrein',contour:'Contour',drill:'Perçage',
    rough3d:'Ébauche 3D',geofinish:'Finition',geodesic:'Géodésique'}[op.type]||op.type;
  if(op.type==='drill'){
    // 2026-10-15-013 : libellé selon le cycle et les trous (« Taraudage M8 (4) »).
    if(op.src!=='model')return n+' ('+(op.pts||[]).length+')';
    const H=op.holes||[],c=op.cycle||'drill';
    const fr=function(v){return String(+(+v).toFixed(2)).replace('.',',');};
    if(c==='spot')return 'Pointage ('+H.length+')';
    if(c==='helix')return 'Lamage fraisé'+(H.length?' Ø'+fr(H[0].d):'')+' ('+H.length+')';
    if(c==='tap'){const h=H.find(function(x){return x.thread;});return 'Taraudage'+(h&&typeof holeThreadLabel==='function'?' '+holeThreadLabel(h.thread):'')+' ('+H.length+')';}
    return n+(H.length?' Ø'+fr(H[0].d):'')+' ('+H.length+')';
  }
  return n;
}
function faoSelectSetup(id){
  try{
    if(typeof mfCloseMenus==='function')mfCloseMenus();
    const r=faoRoot(); r.activeSetupId=id;
    sel={kind:'faoSetup',id:id};
    if(typeof renderTree==='function')renderTree();
    if(typeof renderProps==='function')renderProps();
    faoRenderTree();
  }catch(e){}
}
function faoSelectOp(setupId,opId){
  try{
    if(typeof mfCloseMenus==='function')mfCloseMenus();
    const r=faoRoot(); r.activeSetupId=setupId;
    sel={kind:'faoOp',id:opId,setup:setupId};
    if(typeof renderTree==='function')renderTree();
    if(typeof renderProps==='function')renderProps();
    faoRenderTree();
  }catch(e){}
}
/* ----- bibliothèque d'outils : src/89-fao-outils.js (faoToolsElement, 2026-10-15-010) ----- */
/* ----- fenêtre flottante : bibliothèque d'outils du posage actif ----- */
let faoToolsWin=null, faoToolsWinX=null, faoToolsWinBody=null, faoToolsWinT=null;
function faoToolsWindowOpen(){
  // Fenêtre dédiée (au lieu de faire défiler la fiche posage) : créée à la volée,
  // contenu RECONSTRUIT à chaque ouverture (setup actif du moment), fermable ✕ / Échap.
  // Refs globales (pattern viewer) — jamais de relecture par id.
  try{
    if(!faoToolsWin){
      const host=(document.getElementById('vpwrap')||document.body);
      const w=document.createElement('div'); w.id='faoToolsWin';
      w.className='fao-win fao-toolwin'; // grande fenêtre : liste à gauche, fiche à droite (2026-10-15-010)
      const h=document.createElement('div');
      h.className='fao-win-h';
      const ht=document.createElement('div'); ht.id='faoToolsWinT';
      ht.className='fao-win-t';
      h.appendChild(ht);
      const xb=document.createElement('button'); xb.id='faoToolsWinX'; xb.textContent='✕';
      xb.className='fao-win-x'; xb.title='Fermer la fenêtre (Échap aussi)';
      xb.onclick=function(){ faoToolsWindowClose(); };
      h.appendChild(xb);
      w.appendChild(h);
      const body=document.createElement('div'); body.id='faoToolsWinBody';
      w.appendChild(body);
      host.appendChild(w);
      faoToolsWin=w; faoToolsWinX=xb; faoToolsWinBody=body; faoToolsWinT=ht;
    }
    const setup=faoSetup();
    if(faoToolsWinT)faoToolsWinT.textContent='Bibliothèque d’outils · '+((setup&&setup.name)||'posage');
    if(faoToolsWinBody){ faoToolsWinBody.innerHTML=''; faoToolsWinBody.appendChild(faoToolsElement(setup)); }
    faoToolsWin.style.display='block';
    return true;
  }catch(e){ faoViewerMsg('Outils : '+((e&&e.message)||e)); return false; }
}
function faoToolsWindowClose(){
  const w=faoToolsWin;
  try{ if(w&&w.parentNode)w.parentNode.removeChild(w); }catch(e){}
  try{ if(w)w.style.display='none'; }catch(e){}
  faoToolsWin=null; faoToolsWinX=null; faoToolsWinBody=null; faoToolsWinT=null;
}
function faoToolsWindowToggle(){
  if(faoToolsWin){ faoToolsWindowClose(); return false; }
  return faoToolsWindowOpen();
}
/* ----- fiche d'opération (élément réutilisable) ----- */
function faoToolOpts(setup){
  return (setup.tools||[]).map(function(t){
    const sf=faoToolSF(t,setup);
    return [t.id,'T'+t.num+' '+t.name+' (S'+sf.s+' F'+sf.f+')']; });
}
/* ----- plans de dégagement/retrait : rangées « référence + décalage » ----- */
// 2026-10-08-002 — composants partagés fiche posage / fiche opération.
function faoPlaneRefOpts(allowRetract,allowMM){
  const o=[];
  if(allowRetract)o.push(['retrait','Hauteur de retrait']);
  for(let i=0;i<FAO_PLANE_REFS.length;i++){
    const r=FAO_PLANE_REFS[i][0];
    if(!allowMM&&(r==='max'||r==='min'))continue;
    o.push([FAO_PLANE_REFS[i][0],FAO_PLANE_REFS[i][1]]);
  }
  return o;
}
function faoPlaneSet(owner,which,pl){
  // Écrit SEULEMENT le plan touché (l'autre reste hérité du posage). Écriture
  // pure : le widget appelant (faoSel/faoNum/faoMini) prend déjà le snapshot
  // d'annulation et appelle faoChanged(). Sur le posage, l'ancien champ
  // absolu (safeZ/retract) devient redondant : supprimé (une seule source).
  owner.planes=owner.planes||{};
  owner.planes[which]=pl;
  if(owner.ops!==undefined&&owner.stock!==undefined){
    if(which==='clear')delete owner.safeZ;
    if(which==='retr')delete owner.retract;
  }
}
function faoPlaneRow(which,label,pl,job,op,tgt){
  // tgt={setupId,opId} pour le picking « face ». Conteneur = ligne principale
  // (+ 2 lignes de sous-références pour max/min) + valeur résolue à droite.
  const owner=op||job;
  const isMM=(pl.ref==='max'||pl.ref==='min');
  const set=function(np){ faoPlaneSet(owner,which,np); };
  const z=faoPlaneZ(pl,op,job,0);
  const tip='Référence « '+label+' » : valeur = Z de la référence + décalage '+
    '(mm), toujours ramenée au-dessus du dessus du brut.';
  const box=document.createElement('div');
  const row=faoRow();
  row.appendChild(faoLab(label));
  row.appendChild(faoSel(faoPlaneRefOpts(which==='clear',true),pl.ref,function(v){
    if(v===pl.ref)return;
    if(v==='max'||v==='min'){
      const s1=(pl.ref==='max'||pl.ref==='min')?pl.s1:
        {ref:pl.ref,dz:isFinite(+pl.dz)?+pl.dz:0,fz:pl.fz};
      const s2=(pl.ref==='max'||pl.ref==='min')?pl.s2:{ref:'brutHaut',dz:0};
      set({ref:v,s1:s1,s2:s2});
    }else{
      const s=(pl.ref==='max'||pl.ref==='min')?(pl.s1||{ref:'brutHaut',dz:0}):pl;
      const np={ref:v,dz:isFinite(+s.dz)?+s.dz:0};
      if(v==='face')np.fz=isFinite(+s.fz)?+s.fz:
        (isFinite(z)?Math.round((z-np.dz)*100)/100:0);
      set(np);
    }
  },tip));
  if(!isMM){
    row.appendChild(faoNum(isFinite(+pl.dz)?+pl.dz:0,function(v){
      set(Object.assign({},pl,{dz:v}));
    },48,0.5,'Décalage « '+label+' » (mm, ±) ajouté à la référence.'));
    if(pl.ref==='face')row.appendChild(faoMini('Sélect.',function(){
      faoZPlaneStart({setupId:tgt.setupId,opId:tgt.opId,which:which,slot:null});
    },'Cliquer la face de référence dans la vue 3D (Échap annule).'));
  }
  // 2026-10-16-020 : valeur affichée relative à l'origine du posage (Z0), ou de l'opération à repère propre
  const zR=(function(){ try{ const s=faoSetup(tgt.setupId); const o=tgt.opId?(s.ops||[]).filter(function(x){return x.id===tgt.opId;})[0]:null;
    return z-((o&&faoOpFrame(s,o))?0:faoOriginPoint(s)[2]); }catch(e){ return z; } })();
  row.appendChild(faoLab('= '+(isFinite(zR)?zR.toFixed(2):'—')));
  box.appendChild(row);
  if(isMM){
    [[1,pl.s1||{ref:'brutHaut',dz:0}],[2,pl.s2||{ref:'brutHaut',dz:0}]].forEach(function(pr){
      const slot=pr[0], s=pr[1];
      const r2=faoRow();
      r2.appendChild(faoLab('· '+(slot===1?'1re':'2e')));
      r2.appendChild(faoSel(faoPlaneRefOpts(false,false),s.ref,function(v){
        if(v===s.ref)return;
        const ns={ref:v,dz:isFinite(+s.dz)?+s.dz:0};
        if(v==='face')ns.fz=isFinite(+s.fz)?+s.fz:0;
        const np=Object.assign({},pl);
        np[slot===1?'s1':'s2']=ns;
        set(np);
      },'Sous-référence '+(slot===1?'1re':'2e')+' « '+label+' » (base du plus/bas des deux).'));
      r2.appendChild(faoNum(isFinite(+s.dz)?+s.dz:0,function(v){
        const np=Object.assign({},pl);
        np[slot===1?'s1':'s2']=Object.assign({},s,{dz:v});
        set(np);
      },48,0.5,'Décalage de la sous-référence.'));
      if(s.ref==='face')r2.appendChild(faoMini('Sélect.',function(){
        faoZPlaneStart({setupId:tgt.setupId,opId:tgt.opId,which:which,slot:slot});
      },'Cliquer la face de référence (Échap annule).'));
      box.appendChild(r2);
    });
  }
  return box;
}
function faoPlanesCard(setup,op){
  // Section « Plans » de la fiche opération : héritage posage > op > legacy.
  const box=document.createElement('div');
  box.appendChild(faoH('Plans'));
  const eff=faoPlaneEff(setup,op);
  const tgt={setupId:setup.id,opId:op.id};
  box.appendChild(faoPlaneRow('clear','Dégagement',eff.clear,setup,op,tgt));
  box.appendChild(faoPlaneRow('retr','Retrait',eff.retr,setup,op,tgt));
  if(eff.ownClear||eff.ownRetr){
    const rh=faoRow();
    rh.appendChild(faoMini('Hériter du posage',function(){
      if(!op.planes)return;
      delete op.planes.clear; delete op.planes.retr;
      if(!op.planes.clear&&!op.planes.retr)delete op.planes;
    },'Revenir aux plans du posage pour cette opération.'));
    box.appendChild(rh);
  }
  box.appendChild(faoHelp(
    'Dégagement = plan des translations rapides XY ; Retrait = plan des remontées '+
    '(mode « Remontées » du posage). Hérités du posage tant que non modifiés — '+
    'tout plan reste au-dessus du dessus du brut.'));
  return box;
}
/* 2026-10-14-011 : FICHE EN ONGLETS (retour : « menus pas top, zones texte
   illisibles à cause des flèches, indications pas assez claires, peut-être
   mettre des onglets par type d'informations »). Les sections de la fiche
   (titres faoH) sont rangées dans des onglets — Réglages, Zone, Hauteurs,
   Passes, Entrées, Matière, Attaches — ; l'en-tête (outil, ordre) et la
   ligne de bilan restent visibles. Chaque onglet a une ligne d'aide qui
   explique le champ survolé ou en cours de saisie (son infobulle). Onglet
   choisi mémorisé par opération. */
const faoTabSel={};
const FAO_TAB_ORDER=['Réglages','Outil','Zone','Hauteurs','Passes','Entrées','Matière','Attaches','Repère'];
const FAO_TAB_HELP={
  'Réglages':'Paramètres principaux de l’opération. Survolez un champ pour son explication.',
  'Repère':'Orientation de l’outil pour CETTE opération (3+2). Par défaut : le repère du posage.',
  'Outil':'Outil de l’opération, vitesse de rotation et avances. Grisé = valeur de la fiche outil ; une valeur saisie ici ne vaut que pour cette opération.',
  'Zone':'Où usiner : tout le brut, un rectangle, des arêtes du modèle ou une esquisse — et ce qu’il faut épargner.',
  'Hauteurs':'Haut et Bas de la zone usinée (mm). Ils peuvent suivre des arêtes du modèle.',
  'Passes':'Descente par niveau, pas latéral et manière de vider.',
  'Entrées':'Comment l’outil entre dans la matière, et les plans de dégagement / retrait.',
  'Matière':'Surépaisseur laissée pour l’opération suivante (mm).',
  'Attaches':'Ponts de matière pour tenir la pièce en détourage traversant.'};
function faoTabOf(t){
  t=String(t||'').toLowerCase().replace(/\s*\(.*$/,'').trim();
  const M=[['outil','Outil'],['trous','Zone'],['hauteur','Hauteurs'],['vidage','Passes'],['passes','Passes'],['côté et sens','Passes'],
    ['trajectoire','Entrées'],['plans','Entrées'],['entrée','Entrées'],['matière','Matière'],
    ['attaches','Attaches'],['repère','Repère'],['zone','Zone'],['bord de la poche','Zone'],['profil','Zone']];
  for(let i=0;i<M.length;i++)if(t.indexOf(M[i][0])===0)return M[i][1];
  return null;
}
function faoCardTabs(d,op){
  const kids=Array.prototype.slice.call(d.children||[]);
  if(kids.length<3)return null;
  const foot=kids[kids.length-1],mid=kids.slice(1,-1);
  const groups={};let cur='Réglages';
  const isH=function(el){return !!(el&&el.className==='fao-h');};
  mid.forEach(function(el){
    let h=isH(el)?el:null;
    if(!h&&el.children&&el.children[0]&&isH(el.children[0]))h=el.children[0];
    if(h){const t=faoTabOf(h.textContent);if(t)cur=t;}
    (groups[cur]||(groups[cur]=[])).push(el);
  });
  // un onglet qui ne contient qu'un titre (section vide) est retiré
  const names=FAO_TAB_ORDER.filter(function(n){
    return groups[n]&&groups[n].some(function(el){return !isH(el);});});
  if(names.length<2)return null;
  // carte NEUVE (appendChild seul : déplace les éléments, marche partout)
  const nd=faoCard();
  try{ if(d.style&&d.style.opacity)nd.style.opacity=d.style.opacity; }catch(e){}
  nd.appendChild(kids[0]);
  const bar=document.createElement('div');bar.className='fao-tabs';
  const panes={},btns={};
  const sel=(op&&faoTabSel[op.id]&&names.indexOf(faoTabSel[op.id])>=0)?faoTabSel[op.id]:names[0];
  const show=function(n){
    names.forEach(function(k){panes[k].style.display=(k===n)?'':'none';btns[k].className='fao-tab'+(k===n?' on':'');});
    if(op)faoTabSel[op.id]=n;
  };
  names.forEach(function(n){
    const b=document.createElement('button');b.className='fao-tab';b.textContent=n;b.title=FAO_TAB_HELP[n]||n;
    b.onclick=function(){show(n);};
    bar.appendChild(b);btns[n]=b;
    const p=document.createElement('div');p.className='fao-pane';
    // les titres de section restent (ils portent l'unité, ex. « Passes (mm) »)
    groups[n].forEach(function(el){p.appendChild(el);});
    // libellé + champ : jamais séparés au retour à la ligne (panneau étroit)
    Array.prototype.slice.call(p.querySelectorAll?p.querySelectorAll('.fao-row'):[]).forEach(function(row){
      const ch=Array.prototype.slice.call(row.children||[]);
      for(let q=0;q+1<ch.length;q++){
        if(ch[q].className!=='fao-lab')continue;
        const nx=ch[q+1];if(!nx||nx.className==='fao-lab')continue;
        const pr=document.createElement('span');pr.className='fao-pair';
        row.insertBefore(pr,ch[q]);pr.appendChild(ch[q]);pr.appendChild(nx);q++;
      }
    });
    const tip=document.createElement('div');tip.className='fao-tip';tip.textContent=FAO_TAB_HELP[n]||'';
    const say=function(e){let t=e&&e.target;for(let q=0;q<4&&t&&t!==p;q++){if(t.title){tip.textContent=t.title;return;}t=t.parentNode;}};
    try{p.addEventListener('mouseover',say);p.addEventListener('focusin',say);
      p.addEventListener('mouseleave',function(){tip.textContent=FAO_TAB_HELP[n]||'';});}catch(e){}
    p.appendChild(tip);
    panes[n]=p;
  });
  nd.appendChild(bar);
  names.forEach(function(n){nd.appendChild(panes[n]);});
  nd.appendChild(foot);
  show(sel);
  return nd;
}
// 2026-10-22-008 : ONGLETS DE LA FICHE POSAGE (« est-ce que l'on peut mettre des
// onglets au menu posage ? ») — mêmes onglets que la fiche d'opération : une
// section (titre .fao-h) = un onglet ; le titre « Posage · nom » reste en tête,
// l'estimation et la note du bas restent visibles sous les onglets. Onglet
// choisi mémorisé par posage (faoTabSel).
function faoSetupTabs(p,setup){
  const kids=Array.prototype.slice.call(p.children||[]);
  if(kids.length<4)return;
  const MAP=[['posage','Général'],['repère','Repère'],['modèle','Modèle'],['brut','Brut'],['plans','Plans'],['machine','Temps']];
  const nameOf=function(t){t=String(t||'').toLowerCase();for(let i=0;i<MAP.length;i++)if(t.indexOf(MAP[i][0])===0)return MAP[i][1];return null;};
  const isH=function(el){return !!(el&&el.className==='fao-h');};
  const groups={},names=[],foot=[];let cur=null,inFoot=false;
  const title=isH(kids[0])?kids[0]:null;
  kids.forEach(function(el,i){
    if(el===title)return;
    if(!inFoot&&el.classList&&el.classList.contains('fao-stats'))inFoot=true;
    if(inFoot){foot.push(el);return;}
    if(isH(el)){const n=nameOf(el.textContent);if(n){cur=n;if(!groups[n]){groups[n]=[];names.push(n);}}}
    if(i===1&&!cur){cur='Général';groups[cur]=[];names.push(cur);}
    if(!cur){cur='Général';if(!groups[cur]){groups[cur]=[];names.push(cur);}}
    groups[cur].push(el);
  });
  if(names.length<2)return;
  const sel=(faoTabSel[setup.id]&&names.indexOf(faoTabSel[setup.id])>=0)?faoTabSel[setup.id]:names[0];
  const bar=document.createElement('div');bar.className='fao-tabs';
  const panes={},btns={};
  const show=function(n){names.forEach(function(k){panes[k].style.display=(k===n)?'':'none';btns[k].className='fao-tab'+(k===n?' on':'');});faoTabSel[setup.id]=n;};
  names.forEach(function(n){
    const b=document.createElement('button');b.className='fao-tab';b.textContent=n;b.onclick=function(){show(n);};
    bar.appendChild(b);btns[n]=b;
    const pn=document.createElement('div');pn.className='fao-pane';
    groups[n].forEach(function(el){pn.appendChild(el);});
    panes[n]=pn;
  });
  if(title)p.insertBefore(bar,title.nextSibling);else p.insertBefore(bar,p.firstChild);
  let at=bar.nextSibling;
  names.forEach(function(n){p.insertBefore(panes[n],at);});
  foot.forEach(function(el){p.appendChild(el);});
  show(sel);
}
function faoOpCardElement(setup,op,i){
  const d=faoCard();
  if(op.on===false)d.style.opacity='0.55';
  const typeName={facing:'Surfaçage',pocket:'Poche',chamfer:'Chanfrein',contour:'Contour',drill:'Perçage',
    rough3d:'Ébauche 3D',geofinish:'Finition',geodesic:'Géodésique'};
  const r=faoRow();
  const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=op.on!==false;
  cb.title='Décocher = ignorer cette opération (aperçu, temps, G-code)';
  cb.onchange=function(){ faoSnapshot('activer/désactiver « '+(typeName[op.type]||op.type)+' »');
    op.on=cb.checked; faoChanged(); };
  r.appendChild(cb);
  const tt=document.createElement('span');
  tt.className='fao-opnum';
  tt.textContent=(i+1)+'. '+(typeName[op.type]||op.type);
  r.appendChild(tt);
  r.appendChild(faoSel(faoToolOpts(setup),op.toolId,function(v){ op.toolId=v; delete op.cut; },
    'Outil de cette opération — en changer reprend les vitesses et avances de sa fiche (onglet Outil)'));
  if(op.stale===true){
    const w=document.createElement('span');
    w.textContent=String.fromCharCode(0x26a0);
    w.style.cssText='color:#ff453a;font-weight:700;cursor:pointer;';
    const why=faoStaleWhy(op,setup);
    w.title='Parcours à régénérer : CETTE opération a changé. Clic = ne régénérer'
      +' que cette opération (le bouton « Tout régénérer » régénère tout).'
      +(why?(' '+why):'');
    w.onclick=function(){ faoRegenOp(setup.id,op.id); };
    r.appendChild(w);
  }
  r.appendChild(faoMini('↑',function(){ if(i>0){ setup.ops.splice(i,1); setup.ops.splice(i-1,0,op); } },
    'Remonter cette opération (usinée plus tôt)'));
  r.appendChild(faoMini('↓',function(){ if(i<setup.ops.length-1){ setup.ops.splice(i,1); setup.ops.splice(i+1,0,op); } },
    'Descendre cette opération (usinée plus tard)'));
  r.appendChild(faoMini('✕',function(){ setup.ops.splice(i,1); },'Supprimer cette opération'));
  d.appendChild(r);
  const rp=faoRow();
  let geoNote=null;
  const rect4=function(){
    rp.appendChild(faoLab('X')); rp.appendChild(faoNum(faoDsp(op,op.x0,0),function(v){op.x0=faoInp(op,v,0);},56));
    rp.appendChild(faoLab('Y')); rp.appendChild(faoNum(faoDsp(op,op.y0,1),function(v){op.y0=faoInp(op,v,1);},56));
    rp.appendChild(faoLab('→')); rp.appendChild(faoNum(faoDsp(op,op.x1,0),function(v){op.x1=faoInp(op,v,0);},56));
    rp.appendChild(faoNum(faoDsp(op,op.y1,1),function(v){op.y1=faoInp(op,v,1);},56));
  };
  const zz=function(){
    rp.appendChild(faoLab('Haut')); rp.appendChild(faoNum(faoDsp(op,op.ztop,2),function(v){op.ztop=faoInp(op,v,2);},56));
    rp.appendChild(faoLab('Bas')); rp.appendChild(faoNum(faoDsp(op,op.zbot,2),function(v){op.zbot=faoInp(op,v,2);},56));
  };
  if(op.type==='facing'){
    rp.appendChild(faoLab('Z')); rp.appendChild(faoNum(faoDsp(op,op.z,2),function(v){op.z=faoInp(op,v,2);},60));
    // SEUL paramètre de recouvrement XY : l'écart (ae). Le nombre de lignes est
    // affiché en lecture seule à droite. Un ancien document piloté par « Passes »
    // (np≥2) est lu tel quel (écart affiché = H/(np−1)) ; saisir l'écart bascule
    // définitivement en pilotage par écart (op.np=null).
    const stF=faoOpView(setup,op).stock||faoStock();
    const tF=faoToolById(setup,op.toolId);
    const dF=(tF&&isFinite(+tF.d)&&+tF.d>0)?+tF.d:10;
    const npOn=isFinite(+op.np)&&+op.np>=2;
    const aeShow=npOn?(faoFacingAe(stF,dF,+op.np)||op.ae):op.ae;
    const nbShow=npOn?Math.round(+op.np):faoFacingCount(stF,dF,op.ae);
    rp.appendChild(faoLab('Écart'));
    rp.appendChild(faoNum(isFinite(+aeShow)?Math.round(+aeShow*1000)/1000:aeShow,function(v){
      op.ae=Math.max(0.5,v);
      op.np=null; // ancien doc « Passes » → bascule en pilotage par écart
    },48,0.5,'Recouvrement du fraiseur : distance entre deux passes — SEUL paramètre de recouvrement XY (le nombre de lignes résultant est affiché en lecture seule à droite). Sur un ancien document piloté par « Passes », saisir l\'écart bascule définitivement en pilotage par écart.'));
    rp.appendChild(faoLab(nbShow+' ligne'+(nbShow>1?'s':'')));
    // Passes en Z (par brut) : ébauche du dessus du brut (Z1) à la cote Z en N
    // passes égales — l'ap est CALCULÉ (Z1−Z)/N et affiché en lecture seule.
    const npzShow=(isFinite(+op.npz)&&+op.npz>=2)?Math.round(+op.npz):1;
    const apZShow=faoFacingAp(stF,(isFinite(+op.z)?+op.z:stF.z1)+faoRA(op).axial,npzShow);
    rp.appendChild(faoLab('pz'));
    rp.appendChild(faoNum(npzShow,function(v){
      const n=Math.round(v);
      op.npz=(n>=2)?n:null; // 1 passe = mode historique (coupe unique à la cote Z)
    },40,1,'Passes en Z du surfaçage : l\'ébauche descend du dessus du brut (Z1) jusqu\'à la cote Z en N passes égales, le pas ap = (Z1−Z)/N est calculé automatiquement. 1 = passe unique (mode historique).'));
    rp.appendChild(faoLab(apZShow!=null?('ap '+apZShow):'ap —'));
    rp.appendChild(faoLab('laisse Z')); rp.appendChild(faoNum(faoRA(op).axial,function(v){op.axial=Math.max(0,v);},48,0.1));
    rp.appendChild(faoLab('Arrondi')); rp.appendChild(faoNum(isFinite(+op.arrondi)?+op.arrondi:0,function(v){op.arrondi=Math.max(0,v);},48,0.5));
    // Rappel du réglage de POSAGE « Sortie » (même champ que la fiche du posage) :
    // on le voit et le règle là où l'on paramètre la passe — dépassement XY du
    // demi-tour + retrait Z (voir infobulle).
    rp.appendChild(faoLab('Sortie'));
    rp.appendChild(faoNum(isFinite(+setup.secu)?+setup.secu:5,function(v){ setup.secu=Math.max(0,v); },44,0.5,
      'Sortie de pièce (mm hors matière — réglage du POSAGE, commun à toutes les opérations) : (1) dépassement XY en bout de ligne — l’outil sort de la pièce avant son demi-tour, (2) plafond des remontées locales du mode « Remontées : plan retrait ou +5 mm ». Généralement 5 à 10.'));
  }else if(op.type==='chamfer'){
    faoChamferRows(d,setup,op); // src/89-fao-chanfrein.js
  }else if(faoContourProfil(op)){
    faoContourRows(d,setup,op);
  }else if((op.type==='pocket'&&!faoPocketAdapt(op))||op.type==='contour'){
    rect4(); zz();
    rp.appendChild(faoLab('Descente ap')); rp.appendChild(faoNum(op.ap,function(v){op.ap=Math.max(0.5,v);},48));
    if(op.type==='pocket'){ rp.appendChild(faoLab('Pas latéral')); rp.appendChild(faoNum(op.ae,function(v){op.ae=Math.max(0.5,v);},48)); }
    rp.appendChild(faoLab('Parois')); rp.appendChild(faoNum(faoRA(op).radial,function(v){op.radial=Math.max(0,v);},44,0.1));
    rp.appendChild(faoLab('Fond')); rp.appendChild(faoNum(faoRA(op).axial,function(v){op.axial=Math.max(0,v);},44,0.1));
    rp.appendChild(faoLab('Arrondi')); rp.appendChild(faoNum(isFinite(+op.arrondi)?+op.arrondi:0,function(v){op.arrondi=Math.max(0,v);},48,0.5));
    faoEntryRows(rp,op,(function(){const t=faoToolById(setup,op.toolId);
      return t&&+t.d>0?+t.d:10;})());
  }else if(op.type==='rough3d'||faoPocketAdapt(op)){
    if(faoPocketAdapt(op))faoPocketGeoRows(d,setup,op);
    // --- fiche Ébauche 3D : sections titrées pour les néophytes.
    // Chaque champ porte son nom complet + infobulle ; le mode unique et
    // l'entrée sont expliqués en une ligne, avec garde-fous chiffrés.
    const toolD=(function(){ const t=faoToolById(setup,op.toolId);
      return (isFinite(+t.d)&&+t.d>0)?+t.d:10; })();
    const aeNow=isFinite(+op.ae)&&+op.ae>0?+op.ae:toolD*0.6;
    const apNow=isFinite(+op.ap)&&+op.ap>0?+op.ap:5;
    d.appendChild(faoH('Hauteurs à usiner (mm)'));
    const rZ=faoRow();
    rZ.appendChild(faoLab('Haut')); rZ.appendChild(faoNum(faoDsp(op,op.ztop,2),function(v){faoZlimBreak(op);op.ztop=faoInp(op,v,2);},56,
      null,'Niveau le plus haut usiné — en général le dessus du brut. Édité à la main : casse le lien avec les arêtes.'));
    rZ.appendChild(faoLab('Bas')); rZ.appendChild(faoNum(faoDsp(op,op.zbot,2),function(v){faoZlimBreak(op);op.zbot=faoInp(op,v,2);},56,
      null,'Niveau le plus bas — fond de la zone à ébaucher (hors surépaisseur). Édité à la main : casse le lien avec les arêtes.'));
    if(op.zlim){
      const bz=document.createElement('span'); bz.className='fao-meta';
      bz.textContent='lié à '+(op.zlim.nEdges||'?')+' arête(s)'+(op.zlim.stale?' ⚠':'');
      bz.title='Haut/Bas suivent ces arêtes à chaque rejeu du modèle.';
      rZ.appendChild(bz);
      const br=document.createElement('button'); br.textContent='Retirer'; br.style.fontSize='.72rem';
      br.title='Retirer le lien avec les arêtes (valeurs conservées, redeviennent éditables).';
      br.onclick=function(){ faoZlimBreak(op); faoChanged();
        try{ if(typeof renderProps==='function')renderProps(); }catch(e){} };
      rZ.appendChild(br);
    }else{
      const bl=document.createElement('button'); bl.textContent='Limiter Z (arêtes)'; bl.style.fontSize='.72rem';
      bl.title='Sélectionner des arêtes du modèle pour fixer le haut et le bas de la zone à ébaucher.';
      bl.onclick=function(){ faoZlimStart(setup.id,op.id); };
      rZ.appendChild(bl);
    }
    d.appendChild(rZ);
    if(op.zlim&&op.zlim.stale){
      const wz=document.createElement('div'); wz.className='fao-note';
      wz.textContent='⚠ Modèle modifié : arêtes de limite Z non retrouvées — valeurs inchangées. Re-sélectionnez les arêtes.';
      d.appendChild(wz);
    }
    d.appendChild(faoH('Vidage'));
    const rM=faoRow();
    rM.appendChild(faoLab('Mode'));
    // 2026-10-15-002 : mode unique ESCARGOT (le conventionnel est retiré)
    const modeSel=document.createElement('span');
    modeSel.className='fao-meta';
    modeSel.textContent='Escargot · du centre vers les faces';
    modeSel.title='Pelage en spirale depuis le centre de la zone à usiner vers les faces, tours espacés de ae ; entrées en hélice ou en arc tangent ; '+
      'la dernière passe de chaque niveau suit les faces du solide (au contact réel de l’outil torique ou boule).';
    rM.appendChild(modeSel);
    d.appendChild(rM);
    // 2026-10-08-003 : SENS DE PASSE — 'avalant' = sens de coupe constant
    // (aucune chaine retournée : les dents attaquent la matière de la même
    // façon sur tous les morceaux — sens de rotation de la fraise) ; défaut à
    // la création. 'bidir' = ancien comportement (retournement vers
    // l'extrémité la plus proche, triangles courts en fin de passe).
    // Document ancien sans champ = effectivement bidirectionnel → on affiche
    // 'bidir' (la valeur réelle) plutôt que le défaut d'usine.
    const rS=faoRow();
    rS.appendChild(faoLab('Sens'));
    rS.appendChild(faoSel([
      ['avalant','Sens unique · avalant','Toutes les passes coupent vers le même côté (dents attaquant la matière du même sens, comme la rotation de la fraise) : enchaînement au plus proche SANS retournement, retour rapide à vide en fin de passe. Défaut à la création (2026-10-08-003).'],
      ['bidir','Bidirectionnel','Chaque passe retourne vers l’extrémité la plus proche de la précédente (moins de trajet à vide, mais le sens de coupe alterne — lecture des documents antérieurs, comportement historique).']],
      (op.sens==='avalant')?'avalant':'bidir',
      function(v){ if(v==='avalant')op.sens='avalant'; else op.sens='bidir'; },
      'Sens de passe de l’ébauche 3D — avalant (sens de coupe constant) ou bidirectionnel (retournement vers l’extrémité la plus proche).'));
    d.appendChild(rS);
    d.appendChild(faoH('Passes (mm)'));
    const rP=faoRow();
    rP.appendChild(faoLab('Descente ap')); rP.appendChild(faoNum(op.ap,function(v){op.ap=Math.max(0.5,v);},48,0.5,
      'Descente : hauteur usinée par niveau (Maximum Stepdown).'));
    rP.appendChild(faoLab('Pas latéral ae')); rP.appendChild(faoNum(op.ae,function(v){op.ae=Math.max(0.5,v);},48,
      'Pas latéral : distance entre deux passes voisines (Stepover).'));
    rP.appendChild(faoLab('Mini-passes')); rP.appendChild(faoNum(op.minipasses||0,function(v){op.minipasses=Math.max(0,Math.min(50,Math.round(v)));},40,1,
      'Mini-passes Z par niveau : contour des parois entre deux plans (0 = off, 1 à 50). Profondeur k·ap/(nb+1) sous le plan du dessus, décalage radial décroissant.'));
    d.appendChild(rP);
    d.appendChild(faoHelp(
      'ae = '+(aeNow/toolD).toFixed(2)+'×Ø, ap = '+(apNow/toolD).toFixed(2)+'×Ø (outil Ø '+toolD+').'));
    d.appendChild(faoH('Matière à laisser (mm)'));
    const rR=faoRow();
    rR.appendChild(faoLab('Parois')); rR.appendChild(faoNum(faoRA(op).radial,function(v){op.radial=Math.max(0,v);},44,0.1,
      'Surépaisseur sur les côtés : l’ébauche s’arrête à cette distance des parois (la finition l’enlèvera).'));
    rR.appendChild(faoLab('Fond')); rR.appendChild(faoNum(faoRA(op).axial,function(v){op.axial=Math.max(0,v);},44,0.1,
      'Surépaisseur sur le fond : l’ébauche s’arrête à cette hauteur au-dessus du fond.'));
    d.appendChild(rR);
    // 2026-10-07-001 : FINITION DES PAROIS — N contours « Parois » → 0 par
    // niveau. Case OFF par défaut : aucun document existant ne bouge ; tant que
    // la case est cochée, le sig de l'op change → parcours périmé → rejeu.
    const rFi=faoRow();
    const cbFi=document.createElement('input'); cbFi.type='checkbox'; cbFi.checked=!!op.finitParois;
    cbFi.title='Finir les parois : sur la dernière passe en profondeur, N contours enlèvent la matière laissée « Parois » jusqu’à 0 (dernier à la cote théorique). Décochée = ébauche seule.';
    cbFi.onchange=function(){ faoSnapshot('finir les parois');
      if(cbFi.checked){ op.finitParois=true; if(!isFinite(+op.finitN))op.finitN=1;
        if(!isFinite(+op.finitProf))op.finitProf=1; }
      else{ delete op.finitParois; delete op.finitN; delete op.finitProf; }
      faoChanged(); };
    rFi.appendChild(cbFi);
    rFi.appendChild(faoLab('Finir parois'));
    const numFi=faoNum(isFinite(+op.finitN)?Math.round(+op.finitN):1,function(v){
      op.finitN=Math.max(1,Math.min(9,Math.round(v)));},36,1,
      'Passes de finition des parois : de « Parois » à 0, réparties régulièrement (1 = directement à 0).');
    numFi.disabled=!op.finitParois;
    numFi.title='Nombre de contours de finition — cochez « Finir parois » pour le régler.';
    rFi.appendChild(numFi);
    rFi.appendChild(faoLab('passes'));
    d.appendChild(rFi);
    // 2026-10-15-001 : FINIR LE FOND — avec une surépaisseur « Fond » > 0, une
    // passe à la cote exacte du fond enlève la laisse ; la finition des parois
    // (dernière passe latérale) se fait à cette même hauteur.
    const rFf=faoRow();
    const cbFf=document.createElement('input'); cbFf.type='checkbox'; cbFf.checked=!!op.finitFond;
    cbFf.title='Finir le fond : avec une surépaisseur « Fond » > 0, une dernière passe à la cote exacte du fond enlève la laisse (et la finition des parois se fait à cette hauteur). Sans effet si Fond = 0.';
    cbFf.onchange=function(){ faoSnapshot('finir le fond');
      if(cbFf.checked)op.finitFond=true; else delete op.finitFond;
      faoChanged(); };
    rFf.appendChild(cbFf);
    rFf.appendChild(faoLab('Finir le fond'));
    d.appendChild(rFf);
    // 2026-10-07-002 : PROFONDEURS DE FINITION — la « dernière passe » ne
    // racle la colonne que sur la hauteur de DENT ; mur > dent = N cotes
    // (haut-bas)/N vers le haut. 1 par defaut = comportement unique (documents
    // existants inchangés). Grise tant que Finir parois est décochée.
    const rZp=faoRow();
    rZp.appendChild(faoLab('Profondeurs'));
    const numZp=faoNum(isFinite(+op.finitProf)?Math.round(+op.finitProf):1,function(v){
      op.finitProf=Math.max(1,Math.min(9,Math.round(v)));},36,1,
      'Profondeurs de finition : 1 = dernière passe seule (fraise à dent haute), N = la séquence se répète vers le haut, écartés de hauteur du mur / N (dent ≥ écart).');
    numZp.disabled=!op.finitParois;
    rZp.appendChild(numZp);
    rZp.appendChild(faoLab('cotes'));
    d.appendChild(rZp);
    const npz=isFinite(+op.finitProf)?Math.max(1,Math.min(9,Math.round(+op.finitProf))):1;
    if(op.finitParois)d.appendChild(faoHelp(
      'Finition : '+Math.round(op.finitN)+' contour(s) × '+npz+' profondeur(s) sur la DERNIÈRE passe en profondeur '+
      '(écart = hauteur du mur / '+npz+' — dent ≥ écart ; 1 = la dent couvre le mur seule) — '+
      Math.round(op.finitN)+'×'+npz+'× plus de calcul de région sur ces cotes seulement.'));
    d.appendChild(faoH('Trajectoire'));
    // 2026-10-22-001 : FINIR UNE RÉGION AVANT L'AUTRE — dès que la zone se
    // sépare en régions indépendantes, chacune est finie jusqu'en bas avant la
    // suivante (au lieu de passer d'un côté à l'autre à chaque niveau).
    const rRg=faoRow();
    const cbRg=document.createElement('input'); cbRg.type='checkbox'; cbRg.checked=!!op.parRegion;
    cbRg.title='Finir une région avant l’autre : dès que la zone se sépare en régions indépendantes (aucune matière commune), chaque région est usinée jusqu’en bas avant de passer à la suivante. Décochée = niveau par niveau, d’un côté à l’autre.';
    cbRg.onchange=function(){ faoSnapshot('ordre par région');
      if(cbRg.checked)op.parRegion=true; else delete op.parRegion;
      faoChanged(); };
    rRg.appendChild(cbRg);
    rRg.appendChild(faoLab('Finir une région avant l’autre'));
    d.appendChild(rRg);
    const rT2=faoRow();
    rT2.appendChild(faoLab('Arrondi')); rT2.appendChild(faoNum(isFinite(+op.arrondi)?+op.arrondi:0,function(v){op.arrondi=Math.max(0,v);},48,0.5,
      'Rayon d’arrondi des angles vifs (sort en G2/G3, trajectoire fluide). 0 = angles vifs.'));
    faoEntryRows(rT2,op,toolD);
    d.appendChild(rT2);
  }else if(op.type==='geofinish'){
    // 2026-10-14-011 : fiche en sections (onglets) — Hauteurs, Passes, Entrées, Matière
    d.appendChild(faoH('Hauteurs (mm)'));
    const gH=faoRow();
    gH.appendChild(faoLab('Haut')); gH.appendChild(faoNum(faoDsp(op,op.ztop,2),function(v){op.ztop=faoInp(op,v,2);},56,null,'Haut de la zone finie (mm) : au-dessus, le relief n’est pas fini.'));
    gH.appendChild(faoLab('Bas')); gH.appendChild(faoNum(faoDsp(op,op.zbot,2),function(v){op.zbot=faoInp(op,v,2);},56,null,'Bas de la zone finie (mm) : la pointe de l’outil descend jusqu’ici.'));
    d.appendChild(gH);
    d.appendChild(faoH('Passes'));
    const gP=faoRow();
    gP.appendChild(faoLab('Pas')); gP.appendChild(faoNum(op.step,function(v){op.step=Math.max(0.2,v);},52,0.5,'Écart entre deux passes voisines, mesuré sur la surface (mm). Plus il est petit, plus les crêtes sont basses.'));
    d.appendChild(gP);
    const gE=faoRow();
    // 2026-10-04-009 : entrée identique à l'ébauche 3D — hélice réservée si un
    // ébauche 3D est active avant (sinon rampe). 2026-10-08-004 : circ par
    // défaut (même règle : sans ébauche avant, faoGeoEntryMode retombe rampe).
    faoEntryRows(gE,op,(function(){const t=faoToolById(setup,op.toolId);
      return t&&+t.d>0?+t.d:8;})());
    // 2026-10-13-007 : SENS DE PASSE (rétro-ingénierie cav.txt : passes 2/3 en
    // sens opposé) — 'bidir' (défaut) = alternance du sens de coupe à surcoût
    // borné ; 'avalant' = proximité sans alternance, ordre haut→bas. Document
    // ancien sans champ = bidir (comportement réel).
    gP.appendChild(faoLab('Sens'));
    gP.appendChild(faoSel([
      ['bidir','Bidirectionnel · sens opposé','Chaque passe alterne le sens de coupe par rapport à la précédente (moins de trajet à vide, enchaînement au plus proche en sens inverse).'],
      ['avalant','Sens unique · avalant','Toutes les passes dans le même sens, avalant (côté déjà usiné à droite, matière à gauche — comme Fusion 360 en Crêtes constantes). Défaut à la création.']],
      (op.sens==='avalant')?'avalant':'bidir',
      function(v){ if(v==='avalant')op.sens='avalant'; else op.sens='bidir'; },
      'Sens de coupe des passes — sens unique avalant par défaut (façon Fusion 360).'));
    // 2026-10-13-007 : TRAJECTOIRE (rétro-ingénierie cav.txt + visu Fusion
    // « passes bleues ») — 'iso' (défaut, documents anciens) = niveaux
    // horizontaux + anneaux plateaux ; 'parallel' = passes 3D parallèles à
    // pas constant le long de l'axe long, continues à travers boss et parois.
    gP.appendChild(faoLab('Trajectoire'));
    gP.appendChild(faoSel([
      ['scallop','Crêtes constantes · offsets des bords','Façon Fusion 360 : anneaux FERMÉS à distance constante SUR la surface, depuis chaque bord de la zone (îlot, contour), qui se rencontrent à mi-chemin ; les restes sont finis en boucles concentriques. Liaisons en S au contact, aucune surcoupe (descente outil). Défaut à la création.'],
      ['parallel','Parallèle · passes 3D','Passes 3D parallèles à espacement constant le long de l’axe long de la pièce : chaque passe suit la surface en Z, continue à travers boss et parois, façon Fusion 360.']],
      (op.traj==='parallel')?'parallel':'scallop',
      function(v){ op.traj=(v==='parallel')?'parallel':'scallop'; pdShow(); },
      'Type de trajectoire — parallèle = passes 3D continues façon Fusion 360.'));
    // 2026-10-13-007 : DIRECTION des passes (mode Parallèle) — Auto (axe long
    // de la pièce), X, Y, ou Angle libre en degrés depuis X (0 = X, 90 = Y).
    // Pour aligner sur une arête/face : lire son angle dans l'esquisse ou
    // l'arbre et le saisir ici (la sélection géométrique directe viendra).
    // Direction/Angle n'ont de sens qu'en Parallèle : masqués en Crêtes constantes.
    const pdEls=[];
    const pdShow=function(){ pdEls.forEach(function(e){ e.style.display=(op.traj==='parallel')?'':'none'; }); };
    pdEls.push(gP.appendChild(faoLab('Direction')));
    const pdSel=faoSel([
      ['auto','Auto · axe long','Passes le long du plus grand côté de la pièce (choix automatique).'],
      ['x','X','Passes parallèles à l’axe X.'],
      ['y','Y','Passes parallèles à l’axe Y.'],
      ['ang','Angle…','Angle libre en degrés depuis X (champ suivant).']],
      (op.pdir==='x'||op.pdir==='y'||op.pdir==='ang')?op.pdir:'auto',
      function(v){ if(v==='x'||v==='y'||v==='ang'){op.pdir=v;if(v==='ang'&&!isFinite(+op.pdirAng))op.pdirAng=0;} else {delete op.pdir;delete op.pdirAng;} },
      'Direction des passes — actif en trajectoire Parallèle.');
    pdEls.push(gP.appendChild(pdSel));
    pdEls.push(gP.appendChild(faoLab('Angle°')));
    pdEls.push(gP.appendChild(faoNum(isFinite(+op.pdirAng)?+op.pdirAng:0,function(v){op.pdirAng=v;if(op.pdir!=='ang'){op.pdir='ang';pdSel.value='ang';}},52,1,
      'Angle des passes en degrés depuis X (0 = X, 90 = Y). Saisir bascule en mode Angle.')));
    pdShow();
    // 2026-10-04-004 : limites Z (au-delà, relief non fini) + garde-fou fraise droite.
    d.appendChild(faoH('Entrées'));
    d.appendChild(gE);
    d.appendChild(faoH('Matière à laisser (mm)'));
    const gM=faoRow();
    gM.appendChild(faoLab('Surépaisseur')); gM.appendChild(faoNum(op.laisse,function(v){op.laisse=Math.max(0,v);},48,0.1,'Matière laissée sur toute la surface (mm). 0 = à la cote.'));
    d.appendChild(gM);
    const tG=faoToolById(setup,op.toolId);
    if(tG&&tG.kind==='flat'){
      geoNote=document.createElement('div'); geoNote.className='fao-note';
      geoNote.textContent=op.geoBlocked
        ? '⚠ Fraise droite refusée : le modèle n\'est pas horizontal (pente > 8°). Utilisez une boule ou une torique.'
        : 'Fraise droite : finition réservée aux faces horizontales — le reste du modèle n\'est pas usiné.';
    }
    // 2026-10-13-007 : DIAG embarqué (fond nu : quelle phase est morte ?) —
    // zones par famille + chaînes, plan détecté ou non.
    if(op.geoDiag){
      const gd=op.geoDiag;
      const gdEl=document.createElement('div'); gdEl.className='fao-meta';
      if(gd.fronts!==undefined)
        gdEl.textContent='Diag : '+gd.fronts+' bord(s) · anneaux '+(gd.rings||[]).join('/')+' · '+(gd.rest||0)+' boucles de reste · '+(gd.seq||0)+' séquence(s) · '+(gd.slides||0)+' glissement(s) · '+(gd.lifts||0)+' remontée(s) · '+(gd.tips||0)+' pointe(s) · '+(gd.ms||0)+' ms';
      else
      gdEl.textContent='Diag : '+gd.chains+' chaînes ('+gd.slope+' pentes · '+gd.plate+' plateaux · '+gd.par+' // · '+gd.rest+' restes)'+(gd.flat?'':' · ⚠ aucun plan détecté');
      d.appendChild(gdEl);
    }
  }else if(op.type==='geodesic'){
    // 2026-10-21-001 : faces pilotes, pas, sens, surépaisseur (src/89-fao-geodesique.js)
    faoGeoFiche(d,setup,op);
  }else if(op.type==='drill'){
    // 2026-10-15-011 : cycle, profondeur, ordre + trous du modèle (src/89-fao-percage.js)
    faoDrillSections(setup,op,d);
  }
  // 2026-10-21-003 : faces usinables (bleu) / intouchables (rouge) — src/89-fao-faces.js
  try{ faoFaceListsFiche(d,setup,op); }catch(e){}
  if(rp.children.length)d.appendChild(rp); // vide pour l'Ébauche 3D (sections propres)
  if(geoNote)d.appendChild(geoNote);
  // 2026-10-08-002 : plans de l'opération (dégagement / retrait), hérités du
  // posage tant que non modifiés — avant la zone (les plans cadrent tout).
  d.appendChild(faoPlanesCard(setup,op));
  // Limite d'usinage (tout, rectangle, chaîne d'arêtes, ou esquisse).
  // 2026-10-21-001 : la géodésique n'a pas de zone — ses faces pilotes la font.
  if(op.type!=='geodesic'){
  d.appendChild(faoH('Zone'));
  const rl=faoRow();
  const limMode=op.limit?(op.limit.mode||'all'):'all';
  rl.appendChild(faoLab('Zone'));
  rl.appendChild(faoSel([['all','Tout usiner'],['rect','Rectangle'],['chain','Chaîne d\'arêtes'],['sketch','Esquisse']],limMode,function(v){
    if(v==='rect'){
      const s=faoOpView(setup,op).stock||faoStock(); // repère 3+2 : brut vu par l'opération
      op.limit={mode:'rect',x0:s.x0,y0:s.y0,x1:s.x1,y1:s.y1,side:'center',extra:0};
    }else if(v==='chain'){
      const old=op.limit&&op.limit.mode==='chain'?op.limit:null;
      op.limit=old||{mode:'chain',loop:[],closed:false,nEdges:0,tangent:true,side:'center',extra:0};
      faoChainStart(setup.id,op.id);
    }else if(v==='sketch'){
      // 2026-10-13-001 : zone par esquisse — pas de sélection 3D : la boucle
      // est extraite du contour (faoSketchLoop) dès l'esquisse choisie ci-dessous.
      const old=op.limit&&op.limit.mode==='sketch'?op.limit:null;
      op.limit=old||{mode:'sketch',sk:'',loop:[],closed:true,side:'center',extra:0};
    }else delete op.limit;
  },'Zone usinée : tout le brut, un rectangle, l’intérieur d’une chaîne d’arêtes, ou le contour d’une esquisse.'));
  if(limMode==='rect'&&op.limit){
    const L=op.limit;
    rl.appendChild(faoNum(faoDsp(op,L.x0,0),function(v){L.x0=faoInp(op,v,0);},52,null,'Rectangle : coin X mini (mm)'));
    rl.appendChild(faoNum(faoDsp(op,L.y0,1),function(v){L.y0=faoInp(op,v,1);},52,null,'Rectangle : coin Y mini (mm)'));
    rl.appendChild(faoNum(faoDsp(op,L.x1,0),function(v){L.x1=faoInp(op,v,0);},52,null,'Rectangle : coin X maxi (mm)'));
    rl.appendChild(faoNum(faoDsp(op,L.y1,1),function(v){L.y1=faoInp(op,v,1);},52,null,'Rectangle : coin Y maxi (mm)'));
  }
  const geoOwn=faoPocketAdapt(op)||faoContourProfil(op)||op.type==='chamfer'; // bord / profil / arêtes : section propre
  if(!geoOwn&&!(op.type==='drill'&&op.src==='model'))d.appendChild(rl); // trous du modèle : pas de zone
  if(limMode==='chain'&&op.limit&&!geoOwn){
    const rc=faoRow();
    const hasLoop=(op.limit.loop||[]).length>=3;
    const info=document.createElement('span');
    info.className='fao-meta';
    info.textContent=hasLoop
      ?(op.limit.nEdges||'?')+' arêtes, boucle '+(op.limit.closed?'fermée':'refermée')
        +(op.limit.tangent?' (tangentes)':'')+' · '+op.limit.loop.length+' pts'
      :'aucune boucle — sélectionnez des arêtes';
    rc.appendChild(info);
    const bs=document.createElement('button'); bs.textContent=hasLoop?'Re-sélectionner':'Sélectionner';
    bs.style.fontSize='.72rem';
    bs.onclick=function(){ faoChainStart(setup.id,op.id); };
    rc.appendChild(bs);
    d.appendChild(rc);
    if(op.limit.stale){
      const ws=document.createElement('div');
      ws.className='fao-alert';
      ws.textContent='⚠ Modèle modifié : arêtes non retrouvées — boucle inchangée (obsolète), re-sélectionnez la chaîne.';
      d.appendChild(ws);
    }
  }
  if(limMode==='sketch'&&op.limit){
    // 2026-10-13-001 : choix de l'esquisse de la zone — la boucle est extraite
    // AU CHOIX (faoSketchLoop) puis RE-EXTRAPOLÉE à chaque rejeu (faoSketchReplay).
    const L=op.limit;
    const rsk=faoRow();
    rsk.appendChild(faoLab('Esquisse'));
    const skOpts=[['','— choisir une esquisse —','Contour fermé (traits forts), plan horizontal, sans îlot ni trou, sans cercle.']];
    ((typeof doc!=='undefined'&&doc&&doc.sketches)||[]).forEach(function(s){
      skOpts.push([s.id,s.name+' · '+sketchFaceLabel(s),(s.entities||[]).length+' traits']);
    });
    rsk.appendChild(faoSel(skOpts,L.sk||'',function(v){
      L.sk=v||'';
      const w=L.sk?faoSketchLoop(L.sk):null;
      if(w&&w.length>=3){ L.loop=w; L.closed=true; L.stale=false; }
      else L.loop=[];
    },'Esquisse de la zone : contour extérieur unique en vue XY, plan horizontal, sans îlot ni trou. Re-extraite à chaque rejeu.'));
    d.appendChild(rsk);
    const hasLoopS=(L.loop||[]).length>=3;
    const infoS=document.createElement('div');
    if(hasLoopS){
      infoS.className='fao-help';
      infoS.textContent='Boucle de '+L.loop.length+' pts — re-extraite à chaque rejeu (éditer l’esquisse met la zone à jour).';
    }else{
      infoS.className='fao-alert';
      infoS.textContent=L.sk
        ?'⚠ Esquisse absente ou inutilisable (plan non horizontal, contours multiples, îlot ou trou, cercle) — zone NON appliquée.'
        :'Aucune esquisse choisie — zone NON appliquée.';
    }
    d.appendChild(infoS);
    if(L.stale&&hasLoopS){
      const ws=document.createElement('div');
      ws.className='fao-alert';
      ws.textContent='⚠ Esquisse supprimée ou devenue inutilisable — boucle inchangée (obsolète) : re-choisissez une esquisse.';
      d.appendChild(ws);
    }
  }
  if((limMode==='rect'||limMode==='chain'||limMode==='sketch')&&op.limit&&!faoContourProfil(op)&&op.type!=='chamfer'){
    const rs=faoRow();
    rs.appendChild(faoLab('Outil'));
    rs.appendChild(faoSel([
      ['center','Centre dedans','Le centre de l’outil reste dans la zone.'],
      ['in','Outil dedans','L’outil entier reste dans la zone (retrait d’un rayon).'],
      ['out','Tout couvrir','La zone est entièrement balayée, l’outil déborde d’un rayon.']],
      op.limit.side||'center',function(v){op.limit.side=v;},
      'Position de l’outil par rapport au bord de la zone.'));
    rs.appendChild(faoLab('Marge'));
    rs.appendChild(faoNum(op.limit.extra||0,function(v){op.limit.extra=v;},44,0.5,
      'Élargit (+) ou rétrécit (−) la zone en mm.'));
    d.appendChild(rs);
  }
  // 2026-10-08-003 : ZONE INTÉRIEURE (îlot à préserver) — on usine ENTRE la
  // zone extérieure et cet îlot. Règle outil fixée « hors de l'îlot » (side
  // 'out' interne) : la Marge ajoute de la distance entre l'outil et l'îlot.
  const rl2=faoRow();
  const lim2Mode=op.limit2?(op.limit2.mode||'rect'):'none';
  rl2.appendChild(faoLab('Zone int.'));
  rl2.appendChild(faoSel([
    ['none','Aucune','Pas de zone intérieure : toute la matière de la zone extérieure est usinée.'],
    ['rect','Rectangle (îlot)','Rectangle à NE PAS usiner — l\'outil reste à un rayon + marge du contour.'],
    ['chain','Chaîne d\'arêtes','Îlot délimité par des arêtes du modèle — même règle outil, re-suivi à chaque rejeu.'],
    ['sketch','Esquisse','Îlot délimité par un contour d\'esquisse — re-extrait à chaque rejeu.']],
    lim2Mode,function(v){
      if(v==='rect'){
        const s=faoOpView(setup,op).stock||faoStock(); // repère 3+2 : brut vu par l'opération
        const cx=((+s.x0)+(+s.x1))/2, cy=((+s.y0)+(+s.y1))/2;
        const w=Math.max(2,Math.min((+s.x1)-(+s.x0),(+s.y1)-(+s.y0))*0.15);
        op.limit2={mode:'rect',x0:Math.round((cx-w)*100)/100,y0:Math.round((cy-w)*100)/100,
          x1:Math.round((cx+w)*100)/100,y1:Math.round((cy+w)*100)/100,extra:0};
      }else if(v==='chain'){
        const old=op.limit2&&op.limit2.mode==='chain'?op.limit2:null;
        op.limit2=old||{mode:'chain',loop:[],closed:false,nEdges:0,tangent:true,side:'out',extra:0};
        faoChainStart(setup.id,op.id,'chain2');
      }else if(v==='sketch'){
        // 2026-10-13-002 : îlot par esquisse — on garde l'ancien choix d'esquisse
        // si on y revenait, sinon on repart d'une îlot vide (jamais deviné).
        const old=op.limit2&&op.limit2.mode==='sketch'?op.limit2:null;
        op.limit2=old||{mode:'sketch',sk:'',loop:[],closed:true,side:'out',extra:0};
      }else delete op.limit2;
    },
    'Zone intérieure (îlot) : matière à NE PAS toucher — l\'ébauche usine entre les deux zones.'));
  if(lim2Mode==='rect'&&op.limit2){
    const L2=op.limit2;
    rl2.appendChild(faoNum(faoDsp(op,L2.x0,0),function(v){L2.x0=faoInp(op,v,0);},52,null,'Îlot : coin X mini (mm)'));
    rl2.appendChild(faoNum(faoDsp(op,L2.y0,1),function(v){L2.y0=faoInp(op,v,1);},52,null,'Îlot : coin Y mini (mm)'));
    rl2.appendChild(faoNum(faoDsp(op,L2.x1,0),function(v){L2.x1=faoInp(op,v,0);},52,null,'Îlot : coin X maxi (mm)'));
    rl2.appendChild(faoNum(faoDsp(op,L2.y1,1),function(v){L2.y1=faoInp(op,v,1);},52,null,'Îlot : coin Y maxi (mm)'));
  }
  if(!faoContourProfil(op)&&op.type!=='chamfer'&&!(op.type==='drill'&&op.src==='model'))d.appendChild(rl2); // trous du modèle, chanfrein : ni zone ni îlot
  if(lim2Mode==='chain'&&op.limit2){
    const rc2=document.createElement('div');
    rc2.className='fao-row';
    const hasLoop2=(op.limit2.loop||[]).length>=3;
    const info2=document.createElement('span');
    info2.className='fao-meta';
    info2.textContent=hasLoop2
      ?('îlot : '+(op.limit2.nEdges||'?')+' arêtes, boucle '+(op.limit2.closed?'fermée':'refermée')
        +' · '+op.limit2.loop.length+' pts')
      :'aucune boucle — sélectionnez les arêtes de l\'îlot';
    rc2.appendChild(info2);
    const bs2=document.createElement('button'); bs2.textContent=hasLoop2?'Re-sélectionner':'Sélectionner';
    bs2.style.fontSize='.72rem';
    bs2.onclick=function(){ faoChainStart(setup.id,op.id,'chain2'); };
    rc2.appendChild(bs2);
    d.appendChild(rc2);
    if(op.limit2.stale){
      const ws2=document.createElement('div');
      ws2.className='fao-alert';
      ws2.textContent='⚠ Modèle modifié : arêtes de l\'îlot non retrouvées — boucle inchangée (obsolète), re-sélectionnez.';
      d.appendChild(ws2);
    }
  }
  if(lim2Mode==='sketch'&&op.limit2){
    // 2026-10-13-002 : îlot par ESQUISSE — miroir de la limite esquisse :
    // boucle extraite au choix, re-extrapée à chaque rejeu (faoSketchReplay).
    const L2=op.limit2;
    const rsk2=document.createElement('div');
    rsk2.className='fao-row';
    rsk2.appendChild(faoLab('Esquisse'));
    const skOpts2=[['','— choisir une esquisse —','Contour fermé (traits forts), plan horizontal, sans îlot ni trou, sans cercle.']];
    ((typeof doc!=='undefined'&&doc&&doc.sketches)||[]).forEach(function(s){
      skOpts2.push([s.id,s.name+' · '+sketchFaceLabel(s),(s.entities||[]).length+' traits']);
    });
    rsk2.appendChild(faoSel(skOpts2,L2.sk||'',function(v){
      L2.sk=v||'';
      const w=L2.sk?faoSketchLoop(L2.sk):null;
      if(w&&w.length>=3){ L2.loop=w; L2.closed=true; L2.stale=false; }
      else L2.loop=[];
    },'Esquisse de l\'îlot : contour extérieur unique en vue XY, plan horizontal, sans îlot ni trou. Re-extraite à chaque rejeu.'));
    d.appendChild(rsk2);
    const hasLoopS2=(L2.loop||[]).length>=3;
    const infoS2=document.createElement('div');
    if(hasLoopS2){
      infoS2.className='fao-help';
      infoS2.textContent='Îlot : boucle de '+L2.loop.length+' pts — re-extraite à chaque rejeu (éditer l’esquisse met l’îlot à jour).';
    }else{
      infoS2.className='fao-alert';
      infoS2.textContent=L2.sk
        ?'⚠ Esquisse absente ou inutilisable (plan non horizontal, contours multiples, îlot ou trou, cercle) — îlot NON appliqué.'
        :'Aucune esquisse choisie — îlot NON appliqué.';
    }
    d.appendChild(infoS2);
    if(L2.stale&&hasLoopS2){
      const wsS2=document.createElement('div');
      wsS2.className='fao-alert';
      wsS2.textContent='⚠ Esquisse supprimée ou devenue inutilisable — boucle inchangée (obsolète) : re-choisissez une esquisse.';
      d.appendChild(wsS2);
    }
  }
  if(op.limit2&&lim2Mode!=='none'){
    const rs2=faoRow();
    rs2.appendChild(faoLab('Marge'));
    rs2.appendChild(faoNum(op.limit2.extra||0,function(v){op.limit2.extra=v;},44,0.5,
      'Distance supplémentaire (+) entre l\'outil et l\'îlot, en mm.'));
    d.appendChild(rs2);
  }
  } // fin zone (hors géodésique)
  // 2026-10-15-010 : onglet « Outil » (vitesse, avances, portée) — avant le bilan.
  try{ d.appendChild(faoOpToolSection(setup,op)); }catch(e){}
  const sf=faoOpCutting(op,setup);
  const rr=faoRow();
  const rs=document.createElement('span');
  rs.className='fao-meta';
  // Ouvrir une operation ne doit PAS la recalculer : le cache est lu (IDB ou
  // memoire). Lecture en cours -> « … » qui se remplit tout seul ; cache lu mais
  // parcours absent -> on le DIT, on ne lance pas ~90 s derriere un clic de fiche.
  const mv=faoMovesStat(op,setup);
  if(!mv){
    if(faoMovesPending()){
      rs.textContent='S'+sf.s+' F'+sf.f+' · chargement du parcours…';
      faoMovesPreloadSoon();
    }else{
      rs.textContent='S'+sf.s+' F'+sf.f+' · pas de parcours en mémoire — « Tout régénérer »';
    }
  }else{
    const ee=faoEstimate(mv,sf.f,faoRapide(setup),faoAccel(setup));
    rs.textContent='S'+sf.s+' F'+sf.f+' · '+mv.length+' pts · ≈'+ee.tmin.toFixed(1)+' min';
  }
  rr.appendChild(rs);
  try{ faoOpFrameRows(d,setup,op); }catch(e){} // 2026-10-16-020 : repère propre (3+2) de l'opération
  d.appendChild(rr);
  try{ const tc=faoCardTabs(d,op); if(tc)return tc; }catch(e){}
  return d;
}
/* ----- fiche du posage ----- */
function faoSetupFiche(p,setup){
  const stock=faoStock();
  p.appendChild(faoH('Posage · '+setup.name));
  const rN=faoRow();
  rN.appendChild(faoLab('Nom'));
  rN.appendChild(faoTxt(setup.name,function(v){ setup.name=faoProgName(v)||setup.name; },120));
  if(faoRoot().setups.length>1)
    rN.appendChild(faoMini('Supprimer',function(){
      const r=faoRoot();
      r.setups=r.setups.filter(function(s){return s.id!==setup.id;});
      r.activeSetupId=(r.setups[0]||{}).id||null;
      try{ sel={kind:null,id:null}; }catch(e){}
    }));
  p.appendChild(rN);
  const rM=faoRow();
  rM.appendChild(faoLab('Machine'));
  rM.appendChild(faoSel(Object.keys(FAO_POSTS).map(function(k){return [k,FAO_POSTS[k].label];}),
    setup.machine||'siemens630',function(v){ setup.machine=v; }));
  rM.appendChild(faoLab('Origine '+(setup.wcs||'G54')));
  rM.appendChild(faoSel([['G54','G54'],['G55','G55'],['G56','G56'],['G57','G57'],['G58','G58'],['G59','G59']],
    setup.wcs||'G54',function(v){ setup.wcs=v; }));
  p.appendChild(rM);
  // 2026-10-16-017 : origine = un des 27 points cardinaux (clic dans la vue) du brut ou du modèle
  const rO=faoRow();
  const spO=faoOriginSpec(setup);
  rO.appendChild(faoLab('Origine sur'));
  rO.appendChild(faoSel([['stock','Brut'],['model','Modèle']],spO.src,
    function(v){ setup.origin={pt:faoOriginSpec(setup).pt,src:v}; },
    'Boîte dont les points cardinaux servent d’origine : le brut (avec ses marges) ou le modèle usiné.'));
  rO.appendChild(faoLab('· '+faoCardLabel(spO.pt)));
  p.appendChild(rO);
  const rOp=faoRow();
  [['Dessus X0Y0',[0,0,1]],['Dessus centre',[0.5,0.5,1]],['Centre',[0.5,0.5,0.5]],['Dessous X0Y0',[0,0,0]]].forEach(function(q){
    rOp.appendChild(faoMini(q[0],function(){ setup.origin={pt:q[1].slice(),src:faoOriginSpec(setup).src}; },'Origine : '+faoCardLabel(q[1])));
  });
  p.appendChild(rOp);
  p.appendChild(faoHelp('Ou cliquez l’un des points blancs de la vue (coins, milieux d’arêtes, centres de faces, centre). Le repère du posage s’y place ; le G-code est relatif à ce point.'));
  faoFrameRows(p,setup); // 2026-10-16-019 : orientation Z / X du repère du posage
  // Indexation 3+2 (table C + B) — {0,0} = usinage 3 axes strictement inchangé.
  // 2026-10-16-020 : le 3+2 se règle désormais PAR OPÉRATION (onglet Repère) ; la ligne
  // du posage ne reste visible que pour un ancien document qui en porte un.
  const r32=faoRow();
  const O=faoOrient(setup);
  if(O.b!==0||O.c!==0){
  r32.appendChild(faoLab('3+2 B'));
  r32.appendChild(faoNum(O.b,function(v){ setup.orient={b:Math.round(v*1000)/1000,c:faoOrient(setup).c}; },
    44,5,"Bascule de table autour de Y (degrés). 0 = usinage 3 axes. Non nul : Siemens = TRAORI(1) + positionnement B/C (XYZ restent repère pièce) ; Fagor 8065 = machine 3 axes : indexation ignorée à l'export (aucun B/C, alerte)."));
  r32.appendChild(faoLab('C'));
  r32.appendChild(faoNum(O.c,function(v){ setup.orient={b:faoOrient(setup).b,c:Math.round(v*1000)/1000}; },
    44,5,"Rotation de table autour de Z (degrés) — indexation de la pièce dans le plan d'usinage."));
  r32.appendChild(faoLab('°'));
  r32.appendChild(faoMini('3 axes',function(){ setup.orient={b:0,c:0}; },
    'Remise à plat : annule l\'indexation 3+2 (B=0, C=0).'));
  p.appendChild(r32);
  p.appendChild(faoHelp('Ancien réglage 3+2 du posage (orientation par défaut de ses opérations). Le 3+2 se règle maintenant par opération : onglet « Repère » de l’opération. « 3 axes » le retire.'));
  }
  const PM=FAO_POSTS[setup.machine||setup.post]||{};
  if(PM.axes===3&&(O.b!==0||O.c!==0)){
    const w32=document.createElement('div');
    w32.className='fao-alert';
    w32.textContent='⚠ '+PM.label+' = machine 3 axes : cette indexation 3+2 sera IGNORÉE à l\'export (programme émis à plat, aucun B/C).';
    p.appendChild(w32);
  }
  // Modèle : corps à usiner
  p.appendChild(faoH('Modèle à usiner'));
  const rB=faoRow();
  let bl=[];
  try{ bl=(typeof bodies!=='undefined'&&bodies?bodies:[]).filter(function(b){return b&&!b.ghost;}); }catch(e){}
  if(!bl.length)rB.appendChild(faoLab('Aucun corps (tout le brut).'));
  else{
    const all=setup.bodies==='all';
    const cbs=[]; // 2026-10-22-007 : cases gardées en main (faoTidyRows éclate la rangée)
    bl.forEach(function(b){
      const cb=document.createElement('input'); cb.type='checkbox'; cbs.push(cb);
      cb.checked=all||(Array.isArray(setup.bodies)&&setup.bodies.indexOf(b.id)>=0);
      const nm=(b.name||b.id)+'';
      const lb=document.createElement('label');
      lb.className='fao-check';
      lb.appendChild(cb);
      lb.appendChild(document.createTextNode(nm));
      cb.onchange=function(){
        faoSnapshot('corps modélisés du posage');
        const checked=[];
        try{
          cbs.forEach(function(x,i){
            if(x.checked&&bl[i])checked.push(bl[i].id); });
        }catch(e){}
        setup.bodies=(checked.length===bl.length)?'all':checked;
        faoChanged();
      };
      rB.appendChild(lb);
    });
  }
  p.appendChild(rB);
  // Brut + bridage
  p.appendChild(faoH('Brut · bridage'));
  // 2026-10-16-018 : forme du brut — boîte, cylindre ou modèle (un corps EST le brut)
  const shpS=faoStockShape(setup);
  const rShp=faoRow();
  rShp.appendChild(faoLab('Forme'));
  rShp.appendChild(faoSel([['box','Boîte'],['cyl','Cylindre'],['solid','Modèle (corps)']],shpS,function(v){
    if(v==='solid'){
      setup.stockShape='solid';
      let id=setup.stockBody;
      if(id==null){const f=(typeof bodies!=='undefined'&&bodies?bodies:[]).filter(function(b){return b&&!b.ghost&&b.mesh;})[0];id=f?f.id:null;}
      if(id!=null)faoStockBodySet(id,setup);
    }else{
      if(setup.stockShape==='solid'){ faoStockBodyRestore(setup); setup.stockSrc='bodies'; }
      setup.stockShape=v;
    }
    faoStock();
    if(typeof renderProps==='function')renderProps();
  },'Boîte (modèle + marges), cylindre (barre ronde : axe, Ø et longueur auto ou saisis) ou modèle : un corps du document EST le brut (brut de fonderie, ébauche importée).'));
  p.appendChild(rShp);
  if(shpS==='cyl'){
    const rCy=faoRow();
    const scy=(setup.stock&&setup.stock.cyl)||null;
    rCy.appendChild(faoLab('Axe'));
    rCy.appendChild(faoSel([['z','Z'],['x','X'],['y','Y']],setup.cylAxis||'z',function(v){ setup.cylAxis=v; faoStock(); },
      'Axe du cylindre (repère pièce).'));
    rCy.appendChild(faoLab('Ø'));
    rCy.appendChild(faoNum(isFinite(+setup.cylD)&&+setup.cylD>0?+setup.cylD:(scy?+(2*scy.r).toFixed(3):0),function(v){ setup.cylD=v>0?v:0; faoStock(); },48,1,
      'Diamètre du brut (mm). 0 = automatique : cercle circonscrit au modèle + marge XY.'));
    rCy.appendChild(faoLab('L'));
    const Lc=scy?(scy.axis==='x'?setup.stock.x1-setup.stock.x0:scy.axis==='y'?setup.stock.y1-setup.stock.y0:setup.stock.z1-setup.stock.z0):0;
    rCy.appendChild(faoNum(isFinite(+setup.cylL)&&+setup.cylL>0?+setup.cylL:+Lc.toFixed(3),function(v){ setup.cylL=v>0?v:0; faoStock(); },48,1,
      'Longueur du brut (mm). 0 = automatique : modèle + surépaisseurs (Z+/Z− pour un axe Z, marge XY aux deux bouts sinon). Saisie : axe Z = dessus conservé, axe X/Y = milieu conservé.'));
    rCy.appendChild(faoMini('Auto',function(){ setup.cylD=0; setup.cylL=0; faoStock(); },'Ø et longueur recalculés depuis le modèle et les marges.'));
    p.appendChild(rCy);
  }
  if(shpS==='solid'){
    const rSo=faoRow();
    rSo.appendChild(faoLab('Brut ='));
    const bL=(typeof bodies!=='undefined'&&bodies?bodies:[]).filter(function(b){return b&&!b.ghost&&b.mesh;});
    if(bL.length)rSo.appendChild(faoSel(bL.map(function(b){return [b.id,String(b.name||b.id)];}),
      setup.stockBody!=null?setup.stockBody:bL[0].id,function(v){ faoStockBodySet(v,setup); faoStock(); },
      'Corps qui EST le brut (forme réelle, sans marge) — masqué dans la vue dès choisi, l’œil de l’arbre le réaffiche.'));
    else rSo.appendChild(faoLab('aucun corps'));
    p.appendChild(rSo);
  }
  // Source de la boîte : tous les corps (défaut), un seul corps, ou saisie manuelle.
  const modeS=(setup.stockSrc==='body'||setup.stockSrc==='manual')?setup.stockSrc:'bodies';
  const rSrc=faoRow();
  rSrc.appendChild(faoLab('Source'));
  rSrc.appendChild(faoSel([['bodies','Tous les corps'],['body','Corps choisi'],['manual','Manuel']],
    modeS,function(v){
      if(v==='manual'){ faoStock(); faoStockBodyRestore(setup); setup.stockSrc='manual'; } // fige la boîte courante
      else if(v==='body'){
        let id=setup.stockBody;
        if(id==null){
          const first=(typeof bodies!=='undefined'&&bodies?bodies:[])
            .filter(function(b){return b&&!b.ghost&&b.mesh;})[0];
          id=first?first.id:null;
        }
        if(id!=null)faoStockBodySet(id,setup); // désigne + masque le corps choisi
        else{ setup.stockSrc='body'; setup.stockBody=null; faoStock(); }
      }
      else{ // bodies
        faoStockBodyRestore(setup); // ré-affiche le corps qu'on avait masqué
        setup.stockSrc='bodies';
        faoStock();
      }
      if(typeof renderProps==='function')renderProps();
    },
    'D’où vient la boîte du brut : bbox des corps visibles (défaut), bbox d’un seul corps (barreau importé à côté du brut — masqué dans la vue dès choisi, l’œil de l’arbre le réaffiche) ou boîte saisie à la main.'));
  if(shpS!=='solid')p.appendChild(rSrc);
  if(modeS==='body'&&shpS!=='solid'){
    const rBd=faoRow();
    rBd.appendChild(faoLab('Brut ='));
    const bList=(typeof bodies!=='undefined'&&bodies?bodies:[])
      .filter(function(b){return b&&!b.ghost&&b.mesh;});
    if(bList.length){
      rBd.appendChild(faoSel(bList.map(function(b){return [b.id,String(b.name||b.id)];}),
        setup.stockBody!=null?setup.stockBody:bList[0].id,
        function(v){ faoStockBodySet(v,setup); },
        'Corps dont la boîte englobante (+ marge) sert de brut. Dès choisi, il est masqué dans la vue (œil de l’arbre pour le revoir).'));
    }else{
      const nb=document.createElement('span');
      nb.className='fao-empty';
      nb.textContent='aucun corps visible — brut resté par défaut';
      rBd.appendChild(nb);
    }
    p.appendChild(rBd);
  }
  if(modeS==='manual'){
    const sM=(setup.stock&&[setup.stock.x0,setup.stock.y0,setup.stock.z0,
      setup.stock.x1,setup.stock.y1,setup.stock.z1].every(isFinite))?setup.stock:faoStock();
    const rM1=faoRow(), rM2=faoRow();
    const mkM=function(k,lab,rr){
      rr.appendChild(faoLab(lab));
      rr.appendChild(faoNum(isFinite(+sM[k])?+sM[k]:0,function(v){
        setup.stock=setup.stock||{}; setup.stock[k]=v;
      },44));
    };
    mkM('x0','X0',rM1); mkM('y0','Y0',rM1); mkM('z0','Z0',rM1);
    mkM('x1','X1',rM2); mkM('y1','Y1',rM2); mkM('z1','Z1',rM2);
    p.appendChild(rM1); p.appendChild(rM2);
    const nM=document.createElement('div');
    nM.className='fao-help';
    nM.textContent='Boîte manuelle (repère monde) — jamais recalculée automatiquement.';
    p.appendChild(nM);
  }
  const rS=faoRow();
  const OGs=faoOriginPoint(setup); // cotes du brut relatives à l'origine du posage (Z0)
  const fx=function(v,i){ return (+v-OGs[i]).toFixed(0); };
  rS.appendChild(faoLab('Brut '+fx(stock.x0,0)+','+fx(stock.y0,1)+','+fx(stock.z0,2)
    +' → '+fx(stock.x1,0)+','+fx(stock.y1,1)+','+fx(stock.z1,2)));
  if(modeS!=='manual')rS.appendChild(faoMini('MAJ brut',function(){ faoStock(); }));
  p.appendChild(rS);
  if(modeS!=='manual'&&shpS!=='solid'){
    const rMg=faoRow();
    rMg.appendChild(faoLab('Marge XY'));
    rMg.appendChild(faoNum(setup.marge,function(v){ setup.marge=Math.max(0,v); faoStock(); },40,1,
      'Surépaisseur du brut autour du modèle, en X et en Y (mm).'));
    p.appendChild(rMg);
    const rMz=faoRow(); // 2e ligne : la fiche est étroite, Z− passait seul à la ligne
    rMz.appendChild(faoLab('Surép. Z+'));
    rMz.appendChild(faoNum(isFinite(+setup.margeZp)?+setup.margeZp:0,function(v){ setup.margeZp=Math.max(0,v); faoStock(); },40,0.5,
      'Surépaisseur du brut AU-DESSUS du modèle (mm) — matière à surfacer.'));
    rMz.appendChild(faoLab('Z−'));
    rMz.appendChild(faoNum(isFinite(+setup.margeZm)?+setup.margeZm:0,function(v){ setup.margeZm=Math.max(0,v); faoStock(); },40,0.5,
      'Surépaisseur du brut AU-DESSOUS du modèle (mm) — talon / prise d’étau.'));
    p.appendChild(rMz);
  }
  const rF=faoRow();
  rF.appendChild(faoLab('Bridage'));
  rF.appendChild(faoTxt((setup.fixture&&setup.fixture.note)||'',function(v){
    setup.fixture=setup.fixture||{}; setup.fixture.note=String(v).slice(0,80); },110));
  rF.appendChild(faoLab('Dégagement radial'));
  rF.appendChild(faoNum(setup.fixture?setup.fixture.radial:5,function(v){
    setup.fixture=setup.fixture||{}; setup.fixture.radial=Math.max(0,v); },44));
  rF.appendChild(faoLab('Dégagement axial'));
  rF.appendChild(faoNum(setup.fixture?setup.fixture.axial:5,function(v){
    setup.fixture=setup.fixture||{}; setup.fixture.axial=Math.max(0,v); },44));
  p.appendChild(rF);
  // Bornes Z du bridage : références « Haut/Bas du bridage » des plans
  // (2026-10-08-002). Défaut = fond/dessus du brut (non stocké tant qu'édité).
  const rFZ=faoRow();
  rFZ.appendChild(faoLab('Bridage Z bas'));
  rFZ.appendChild(faoNum(isFinite(+setup.fixture.z0)?+setup.fixture.z0:stock.z0,function(v){
    setup.fixture=setup.fixture||{}; setup.fixture.z0=v; },44,1,
    'Bas du bridage (mm, repère monde) — référence « Bas du bridage » des plans. Défaut = fond du brut.'));
  rFZ.appendChild(faoLab('Bridage Z haut'));
  rFZ.appendChild(faoNum(isFinite(+setup.fixture.z1)?+setup.fixture.z1:stock.z1,function(v){
    setup.fixture=setup.fixture||{}; setup.fixture.z1=v; },44,1,
    'Haut du bridage (mm, repère monde) — référence « Haut du bridage » des plans. Défaut = dessus du brut.'));
  p.appendChild(rFZ);
  const nF=document.createElement('div');
  nF.className='fao-help';
  nF.textContent='Bridage mémorisé (phase suivante : évitement dans les parcours).';
  p.appendChild(nF);
  p.appendChild(faoH('Plans · sortie')); // 2026-10-22-008 : onglet « Plans »
  const rC=faoRow();
  rC.appendChild(faoLab('Sortie'));
  rC.appendChild(faoNum(setup.secu,function(v){ setup.secu=Math.max(0,v); },48,0.5,
    "Sortie de pièce (mm hors matière) : (1) dépassement XY en bout de ligne — l'outil sort de la pièce de cette valeur avant son demi-tour, (2) plafond des remontées locales du mode « Remontées : plan retrait ou +5 mm ». Généralement 5 à 10."));
  rC.appendChild(faoLab('Arrosage'));
  rC.appendChild(faoSel([['flood','M7/M08'],['through','M8'],['off','arrêt']],setup.coolant||'flood',
    function(v){ setup.coolant=v; }));
  p.appendChild(rC);
  // 2026-10-08-002 : plans de référence (Fusion360) + mode des remontées —
  // remplace les anciens champs absolus « Retrait » et « Plan Z ».
  const effP=faoPlaneEff(setup,null);
  const tgtP={setupId:setup.id,opId:null};
  p.appendChild(faoPlaneRow('clear','Dégagement',effP.clear,setup,null,tgtP));
  p.appendChild(faoPlaneRow('retr','Retrait',effP.retr,setup,null,tgtP));
  const rMd=faoRow();
  rMd.appendChild(faoLab('Remontées'));
  rMd.appendChild(faoSel([
    ['min5','Plan retrait ou +5 mm','Défaut : les G0 remontent localement à 5 mm au-dessus de la matière, sans jamais dépasser le plan de retrait (Sortie en borne le plafond).'],
    ['plan','Toujours plan de retrait','Toutes les remontées montent au plan de retrait — liaisons plus hautes, plus lentes, mais dégagement maximal.']],
    effP.mode,function(v){ setup.planes=setup.planes||{}; setup.planes.mode=v; },
    'Remontées (liaisons G0) : toujours le plan de retrait, OU remontée locale minimum 5 mm bornée par le plan de retrait.'));
  p.appendChild(rMd);
  p.appendChild(faoHelp(
    'Plans en mm par référence (« depuis ») + décalage : dégagement = plan des translations rapides XY, '+
    'retrait = plan des remontées et des changements d\'outil. Opérations : héritent de ces valeurs '+
    'tant qu\'elles ne les touchent pas ; tout plan reste ≥ dessus du brut.'));
  p.appendChild(faoH('Machine · temps')); // 2026-10-22-008 : onglet « Temps »
  const rV=faoRow();
  rV.appendChild(faoLab('Rapide G0'));
  rV.appendChild(faoNum(faoRapide(setup),function(v){ setup.rapide=Math.max(1,Math.round(v)); },
    56,100,'Vitesse des déplacements en mode rapide (mm/min) — employée pour l\'estimation des temps.'));
  rV.appendChild(faoLab('Plongée'));
  rV.appendChild(faoNum(faoPlungePct(setup),function(v){ setup.plungePct=Math.min(100,Math.max(1,v)); },
    36,100,"Pourcentage de l'avance de coupe appliqué à la plongée (F de plongée des G1 Z)."));
  rV.appendChild(faoLab('% de F'));
  const rA=faoRow();
  rA.appendChild(faoLab('Accélération'));
  rA.appendChild(faoNum(faoAccel(setup),function(v){ setup.accel=Math.max(100,Math.round(v)); },
    44,100,"Accélération de la machine (mm/s²) — le temps des rapides vaut d/v + v/A, un rapide court coûte plus que sa longueur."));
  rA.appendChild(faoLab('mm/s²'));
  rA.appendChild(faoLab('Changement d’outil'));
  rA.appendChild(faoNum(faoToolChg(setup),function(v){ setup.toolChg=Math.max(0,Math.round(v)); },
    40,5,"Durée d'un changement d'outil (secondes) ajoutée à l'estimation pour chaque changement de groupe outil."));
  rA.appendChild(faoLab('s'));
  p.appendChild(rV);
  p.appendChild(rA);
  // La fiche reste LA configuration du posage. Les usinages, l'export, les
  // outils, + Posage, ▶ Usinage et « Tout régénérer » vivent dans l'arbre FAO
  // (faoInitUI) : on ne promène plus la même action à deux endroits.
  const st=document.createElement('div');
  st.className='fao-stats';
  st.textContent=faoStatsText();
  p.appendChild(st);
  const note=document.createElement('div');
  note.className='fao-note';
  note.textContent='3 axes : G0/G1, G2/G3 (arrondis) + cycles de perçage (CYCLE81/G81). Validez toujours le 1er programme en simulation / à vide sur la CN.';
  p.appendChild(note);
}
/* ----- dispatcher panneau droit ----- */
function faoRenderProps(p,s){
  try{ faoMovesPreloadSoon(); }catch(e){} // foin-et-oubli : le cache se remplit pendant qu'on regarde
  try{
    p.innerHTML='';
    try{ p.className='col fao-panel'; }catch(e){}
    const r=faoRoot();
    let setup=null, op=null, idx=-1;
    if(s.kind==='faoSetup'){
      setup=r.setups.filter(function(x){return x.id===s.id;})[0]||null;
    }else{
      setup=r.setups.filter(function(x){return x.id===(s.setup||r.activeSetupId);})[0]||faoSetup();
      if(setup)(setup.ops||[]).forEach(function(o,i){ if(o.id===s.id){op=o;idx=i;} });
    }
    if(!setup){ const d=document.createElement('div'); d.textContent='Posage introuvable.'; p.appendChild(d); return; }
    if(typeof faoChainMode!=='undefined'&&faoChainMode&&op&&
       faoChainMode.setupId===setup.id&&faoChainMode.opId===op.id){
      faoChainPanel(p,setup,op);
      return;
    }
    if(op){
      p.appendChild(faoH('Opération · '+setup.name));
      p.appendChild(faoOpCardElement(setup,op,idx));
      const back=faoRow();
      const bb=document.createElement('button'); bb.textContent='← Posage '+setup.name; bb.style.fontSize='.72rem';
      bb.onclick=function(){ faoSelectSetup(setup.id); };
      back.appendChild(bb);
      p.appendChild(back);
    }else{
      faoSetupFiche(p,setup);
      faoSetupTabs(p,setup); // 2026-10-22-008 : onglets du posage
    }
    faoTidyRows(p); // 2026-10-22-007 : même présentation que le panneau Plan
  }catch(e){}
}

function faoStatsGroups(job){
  // Groupes d'outils SANS toucher aux parcours : faoJobMoves() calcule les absents,
  // et une estimation affichée n'a pas le droit de produire une trajectoire.
  let groups=0, prev=null;
  try{
    faoActiveOps(job).forEach(function(op){
      const t=faoToolById(job,op.toolId)||{};
      const k=String(t.id)+'|'+String(t.d);
      if(k!==prev){ groups++; prev=k; }
    });
  }catch(e){ groups=0; }
  return groups;
}
function faoStats(job){
  // Estimation complète du posage : temps de coupe + rapides (accélération
  // machine) + changements d'outil (nb de groupes outil - 1) × durée unitaire.
  let cut=0, rap=0, tm=0, n=0, wait=false, missing=0;
  faoActiveOps(job).forEach(function(op){
    const sf=faoOpCutting(op,job); // avance + rapide de CETTE opération
    const mv=faoMovesStat(op,job); // lecture d'abord : une stats ne recalcule rien
    if(!mv){ if(faoMovesPending())wait=true; else missing++; return; }
    const e=faoEstimate(mv,sf.f,sf.rapid,faoAccel(job));
    cut+=e.cut; rap+=e.rap; tm+=e.tmin; n++;
  });
  if(wait)return {n:0, cut:0, rap:0, groups:0, tchg:0, tmin:0, pending:true};
  const groups=faoStatsGroups(job);
  const tchg=Math.max(0,groups-1)*(faoToolChg(job)/60);
  return {n:n, cut:cut, rap:rap, groups:groups, tchg:tchg, tmin:tm+tchg, missing:missing};
}
function faoStatsText(){
  try{
    const s=faoStats(faoDoc());
    if(s.pending)return 'Estimation : chargement du parcours…';
    const base=s.n+' op · coupe '+(s.cut/1000).toFixed(1)+' m · rapides '
      +(s.rap/1000).toFixed(1)+' m · ≈'+s.tmin.toFixed(1)+' min';
    if(s.missing){
      let why='';
      try{
        const job=faoDoc();
        const ops=faoActiveOps(job).filter(function(o){ return !o||!o.hidden; });
        for(let i=0;i<ops.length;i++){
          const ck=faoOpMovesKey(ops[i],job), ch=faoOpMovesHit(ops[i]);
          if(ck!==null&&!(ch&&ch.key===ck)){ why=faoMovesWhyShort(job,ops[i]); if(why)break; }
        }
      }catch(e){}
      return 'Estimation partielle : '+base+' — '+s.missing
        +' opération(s) sans parcours en mémoire'+(why?' ('+why+')':'')
        +', « Tout régénérer » pour les produire.';
    }
    return base;
  }catch(e){ return ''; }
}
function faoExport(){
  try{
    if(faoPrevStale){
      try{ faceEl.textContent='FAO : export bloqu\u00e9 — aper\u00e7u p\u00e9rim\u00e9, cliquez \u00ab Tout r\u00e9g\u00e9rer \u00bb d\u2019abord.'; }catch(e){}
      try{ if(typeof console!=='undefined'&&console&&console.warn)console.warn('FAO : export bloqu\u00e9 — aper\u00e7u p\u00e9rim\u00e9.'); }catch(e){}
      faoStaleUI();
      return;
    }
    const job=faoDoc();
    const actives=(job.ops||[]).filter(function(o){return !o||o.on!==false;});
    if(!actives.length){ try{ faceEl.textContent='FAO : aucune opération active à exporter.'; }catch(e){} return; }
    const r=faoPost(job);
    const name=faoProgName(job.name)+'.'+r.ext;
    const blob=new Blob([r.code],{type:'text/plain'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob); a.download=name;
    document.body.appendChild(a); a.click();
    setTimeout(function(){ try{ URL.revokeObjectURL(a.href); a.remove(); }catch(e){} },500);
    try{ faceEl.textContent='FAO : '+name+' exporté ('+r.code.split('\n').length+' blocs).'
      +(r.warns&&r.warns.length?(' ⚠ '+r.warns.join(' ; ')):''); }catch(e){}
  }catch(e){}
}
