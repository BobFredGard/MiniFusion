/* ----- formats numériques (point décimal, comme les .cps : ascii) ----- */
function faoFmtXYZ(n){ const v=isFinite(+n)?+n:0; return (Math.round(v*1000)/1000).toFixed(3); }
function faoFmtF(n){ const v=isFinite(+n)&&+n>0?+n:100; return (Math.round(v*10)/10).toFixed(1); }
function faoFmtS(n){ const v=isFinite(+n)&&+n>0?+n:1000; return String(Math.round(v)); }
function faoProgName(s){
  // Nom de programme : majuscules, sans espaces (Siemens : 2 lettres mini).
  let t=String(s||'PIECE').toUpperCase().replace(/[^A-Z0-9_]/g,'_').replace(/^_+/,'');
  if(!/^[A-Z_]/.test(t))t='P_'+t;
  if(t.length<2)t=(t+'_X').slice(0,2);
  return t.slice(0,24);
}

/* ----- état : posages (persistés dans doc.fao) ----- */
// Un posage = machine + repère + modèle + brut + bridage + opérations, comme le
// SETUP Fusion (img1). Les outils vivent dans le posage (bibliothèque locale).
// Migration : job plat 31t/31u (name,post,tools,stock,ops) -> posage unique.
function faoStockDefault(){ return {x0:0,y0:0,z0:0,x1:100,y1:80,z1:25}; }
function faoDefaultTools(){
  // Bibliothèque initiale : cylindrique (ébauche/finition 2.5D), boule et
  // torique (finition 3D — rayon de coin stocké). T6 = fraise de la gamme
  // CAV-75-25 (D25 CR2 torique, S8000 F5000/6000) — la gamme de l'atelier
  // (référence CAV-75-25.mpf, hélice R10 = 0.4*D, ap 1-2, ae 8-10).
  return [
    {id:'T1',num:1,name:'Fraise D10',kind:'flat',d:10,cornerR:0,flutes:2,vc:250,fz:0.06},
    {id:'T2',num:2,name:'Fraise D6',kind:'flat',d:6,cornerR:0,flutes:2,vc:250,fz:0.04},
    {id:'T3',num:3,name:'Boule D8',kind:'ball',d:8,cornerR:4,flutes:2,vc:200,fz:0.04},
    {id:'T6',num:6,name:'Torique D25 R2',kind:'bull',d:25,cornerR:2,flutes:2,vc:628,fz:0.18}
  ];
}
let faoUidN=0;
const faoNewId=function(p){ return p+'_'+(++faoUidN)+'_'+Date.now().toString(36); };
function faoDefaultSetup(){
  return {
    id:faoNewId('setup'), name:'POSAGE1', machine:'siemens630', wcs:'G54',
    origin:{preset:'top-X0Y0'}, // préréglages point de bloc ; point pièce cliqué = phase suivante
    bodies:'all', // 'all' ou [ids de corps]
    tools:faoDefaultTools(),
    fixture:{note:'', radial:5, axial:5}, // mémorisé ; non pris en compte dans les parcours (phase suivante)
    coolant:'flood', secu:5, marge:5,
    rapide:5000, // vitesse des G0 (mm/min) — estimation + référence machine
    plungePct:30, // % de l'avance de coupe appliqué à la plongée (F de plongée)
    accel:1000, // accélération machine (mm/s²) — temps rapide réel d/v + v/A
    toolChg:30, // durée d'un changement d'outil (s) ajoutée à l'estimation
    orient:{b:0, c:0}, // indexation 3+2 : B (basculer Y) / C (tourner Z), degrés
    stock:faoStockDefault(), ops:[]
  };
}
function faoDefaultJob(){ return faoDefaultSetup(); } // alias historique (tests)
function faoMigrateSetup(flat){
  // Job plat 31t/31u -> posage : post->machine, outil unique->biblio, ops repris.
  const s=faoDefaultSetup();
  ['name','wcs','coolant','secu','marge','stock','rapide','plungePct'].forEach(function(k){
    if(flat&&flat[k]!==undefined)s[k]=flat[k];
  });
  if(flat&&(flat.machine||flat.post))s.machine=flat.machine||flat.post;
  if(flat&&flat.origin&&flat.origin.preset)s.origin={preset:flat.origin.preset};
  if(flat&&flat.bodies!==undefined)s.bodies=flat.bodies;
  if(flat&&flat.fixture)s.fixture=flat.fixture;
  if(Array.isArray(flat.tools)&&flat.tools.length)s.tools=flat.tools;
  else if(flat&&flat.tool&&isFinite(+flat.tool.d))s.tools=
    [{id:'T1',num:1,name:'Fraise D'+flat.tool.d,kind:'flat',d:+flat.tool.d,cornerR:0,flutes:2,vc:250,fz:0.06}];
  s.ops=Array.isArray(flat.ops)?flat.ops:[];
  faoSanitiseOps(s);
  return s;
}
function faoSanitiseOps(s){
  // 2026-10-06-004 : « Débourrage » (pocket3d) SUPPRIMÉ de l'application —
  // les anciennes opérations sont retirées du document à la lecture (migration,
  // comme `strategie`/`laisse`) : plus de fiche, plus de bouton, plus de
  // parcours orphelin dans l'aperçu et le G-code. Suppression EN PLACE :
  // faoRoot() relance cette fonction à chaque appel, un tableau remplacé
  // laisserait les références déjà saisies (opérations, undo) pointer ailleurs.
  const ops=s.ops;
  if(Array.isArray(ops))
    for(let i=ops.length-1;i>=0;i--)
      if(ops[i]&&ops[i].type==='pocket3d')ops.splice(i,1);
  // 2026-10-08-002 : plans de dégagement/retrait (référence + décalage).
  // Forme normalisée sinon SUPPRIMÉE (repli legacy safeZ/retract) ; le mode
  // des remontées n'accepte que 'min5' (défaut) ou 'plan'.
  if(s.planes&&typeof s.planes==='object'){
    const P=s.planes, out={};
    const c=faoPlaneClean(P.clear,'clear'); if(c)out.clear=c;
    const r=faoPlaneClean(P.retr,'retr'); if(r)out.retr=r;
    if(P.mode==='plan'||P.mode==='min5')out.mode=P.mode;
    if(out.clear||out.retr||out.mode)s.planes=out; else delete s.planes;
  }else if(s.planes!==undefined)delete s.planes;
  if(s.fixture&&typeof s.fixture==='object'){
    if(!isFinite(+s.fixture.z0))delete s.fixture.z0;
    if(!isFinite(+s.fixture.z1))delete s.fixture.z1;
  }
  (s.ops||[]).forEach(function(op){
    if(!op.id)op.id=faoNewId('op');
    if(op.on===undefined)op.on=true;
    if(!op.toolId||!(s.tools||[]).some(function(t){return t.id===op.toolId;}))
      op.toolId=(s.tools&&s.tools[0]&&s.tools[0].id)||'T1';
    // 31z : laisse unique -> surépaisseurs radiale (XY) + axiale (fond/Z).
    // La géodésique garde `laisse` (le long de la normale, ni radial ni axial).
    if(op.type!=='geofinish'&&op.type!=='geodesic'&&isFinite(+op.laisse)&&(op.radial===undefined&&op.axial===undefined)){
      op.radial=+op.laisse; op.axial=+op.laisse;
    }
    if(op.type!=='geofinish'&&op.type!=='geodesic')delete op.laisse;
    // 2026-10-13-001 : zone par ESQUISSE — sk (référence) + loop (boucle
    // extraite) doivent TOUJOURS voyager ensemble (jamais de moitié-champ) ;
    // le reste (sk vide en cours de choix) reste toléré comme la chaîne.
    if(op.limit&&op.limit.mode==='sketch'){
      if(typeof op.limit.sk!=='string'||!Array.isArray(op.limit.loop))delete op.limit;
    }else if(op.limit&&op.limit.mode!=='rect'&&op.limit.mode!=='chain')delete op.limit;
    // 2026-10-08-003 : zone INTERIEURE (ilot a ne pas toucher) — meme forme
    // que la zone exterieure, sinon supprimee. Rect : coins reordonnes (jamais
    // d'ilot silencieusement ignore) ; chaine : cote 'out' FORCE (regle outil
    // de l'ilot : dilate de r+marge, on garde le complement).
    if(op.limit2){
      if(op.limit2.mode==='sketch'){
        // 2026-10-13-002 : îlot par ESQUISSE — même contrat que la limite
        // esquisse (boucle re-extraite au rejeu), règle outil out FORCE.
        if(typeof op.limit2.sk!=='string'||!Array.isArray(op.limit2.loop))delete op.limit2;
        else{ if(!isFinite(+op.limit2.extra))op.limit2.extra=0; op.limit2.side='out'; }
      }else if(op.limit2.mode!=='rect'&&op.limit2.mode!=='chain')delete op.limit2;
      else if(op.limit2.mode==='rect'){
        const T=op.limit2, a=+T.x0, b=+T.x1, c=+T.y0, d=+T.y1;
        if(!(isFinite(a)&&isFinite(b)&&isFinite(c)&&isFinite(d)))delete op.limit2;
        else{ T.x0=Math.min(a,b); T.x1=Math.max(a,b); T.y0=Math.min(c,d); T.y1=Math.max(c,d);
              if(!isFinite(+T.extra))T.extra=0; }
      }else{
        if(!isFinite(+op.limit2.extra))op.limit2.extra=0;
        op.limit2.side='out';
      }
    }
    if(op.zlim&&!(op.zlim.anchors&&op.zlim.anchors.length))delete op.zlim;
    // 2026-10-08-002 : plans de l'opération (héritage posage) — forme
    // normalisée, sinon vide -> champ supprimé (héritage retrouvé).
    if(op.planes&&typeof op.planes==='object'){
      const P=op.planes, out={};
      const c=faoPlaneClean(P.clear,'clear'); if(c)out.clear=c;
      const r=faoPlaneClean(P.retr,'retr'); if(r)out.retr=r;
      if(out.clear||out.retr)op.planes=out; else delete op.planes;
    }else if(op.planes!==undefined)delete op.planes;
    // 2026-10-08-004 : mode d'entrée de coupe — seuls auto/helix/ramp/circ
    // survivent (valeur inconnue supprimée → repli du défaut) ; rayon d'entrée
    // invalide supprimé (le défaut Ø/4 est retrouvé à la génération).
    if(op.entry!==undefined&&['auto','helix','ramp','circ'].indexOf(op.entry)<0)delete op.entry;
    if(op.entryR!==undefined){
      if(isFinite(+op.entryR)&&+op.entryR>0)op.entryR=+op.entryR;
      else delete op.entryR;
    }
    // 2026-10-03-004 : mode trocoïdal unique — anciennes stratégies et passes
    // fines ap2 retirées du document à la lecture (migration, comme la laisse).
    delete op.strategy; delete op.ap2; delete op.radial2; delete op.axial2;
    // 2026-10-04-002 : mini-passes Z de l'ebauche (0 = off). Valeur nettoyee.
    // 2026-10-07-003 : plafond 9 -> 50 (le generateur plafonne aussi a 50).
    if(op.type==='pocket'&&op.strat!=='adaptive')delete op.strat;
    if(op.type==='contour'&&op.strat!=='profil')delete op.strat;
    if(op.type!=='pocket'&&op.type!=='contour')delete op.strat;
    // 2026-10-14-004 : contour sur profil — champs propres (absents ailleurs)
    if(op.type==='contour'&&op.strat==='profil'){
      if(op.cside!=='ext'&&op.cside!=='int')delete op.cside;
      ['nR','fin','leadR','overlap','tabN','tabW','tabH'].forEach(function(k){if(k in op&&!(isFinite(+op[k])&&+op[k]>=0))delete op[k];});
    }else ['cside','nR','fin','leadR','overlap','tabN','tabW','tabH'].forEach(function(k){delete op[k];});
    if(op.type==='rough3d'||faoPocketAdapt(op)){const mp=+op.minipasses;op.minipasses=isFinite(mp)&&mp>0?Math.min(50,Math.round(mp)):0;
      // 2026-10-07-001/002 : finition des parois (N contours « Parois » -> 0,
      // sur la DERNIERE passe en profondeur, finitProf cotes vers le haut) —
      // OFF par defaut : ni champ ni effet tant que la case n'est pas cochee
      // (les documents existants restent strictement identiques, sig compris).
      if(op.finitParois){op.finitParois=true;
        const fn=Math.round(+op.finitN);op.finitN=isFinite(fn)&&fn>0?Math.min(9,fn):1;
        const fp=Math.round(+op.finitProf);op.finitProf=isFinite(fp)&&fp>0?Math.min(9,fp):1;}
      else{delete op.finitParois;delete op.finitN;delete op.finitProf;}
      // 2026-10-15-001 : finition du FOND (passe à la cote exacte du fond)
      if(op.finitFond)op.finitFond=true; else delete op.finitFond;
      // 2026-10-07-005 : 'escargot' (spirale centre -> faces) conserve ;
      // tout autre mode inconnu est purge (absent = conventionnel).
      // 2026-10-08-001 : mode trocoïdal SUPPRIME (tracé peu satisfaisant) :
      // seul 'escargot' subsiste a cote du conventionnel ; un document 'troco'
      // bascule en conventionnel (sig bouge -> regen de l'op seule). La poche
      // d'entree (esquisse) part avec le mode : champ retire partout (les sigs
      // qui la portaient bougent aussi).
      // 2026-10-15-002 : CONVENTIONNEL RETIRÉ (« retire le conventionnel partout et on
      // garde l'escargot partout ») — tout document (absent / 'conv' / autre) passe
      // en escargot à la lecture.
      op.mode='escargot';
      delete op.entree;
      }
    // 2026-10-08-003 : sens de passe — seuls 'avalant' et 'bidir' survivent,
    // et seulement sur l'Ebauche 3D et la finition géodésique (2026-10-13-007 :
    // rétro-ingénierie cav.txt — sens opposé alterné sur Crêtes constantes).
    if(faoContourProfil(op)){ if(op.sens!=='avalant'&&op.sens!=='opp')delete op.sens; }
    else if((op.type!=='rough3d'&&op.type!=='geofinish'&&op.type!=='geodesic'&&!faoPocketAdapt(op))||(op.sens!=='avalant'&&op.sens!=='bidir'))delete op.sens;
    // 2026-10-13-007 : direction des passes parallèles — 'auto'/'x'/'y'/'ang'
    // sur Crêtes constantes (+ angle fini si 'ang'), absent = auto (axe long).
    if(op.type==='geofinish'){
      // 2026-10-14-003 : Iso-Z supprimé — absent / 'iso' (documents
      // antérieurs) -> Crêtes constantes façon Fusion ; 'départ' (seed) aussi.
      if(op.traj!=='parallel')op.traj='scallop';
      delete op.seed;
      if(op.pdir!=='x'&&op.pdir!=='y'&&op.pdir!=='ang'&&op.pdir!=='auto')delete op.pdir;
      if(op.pdir==='ang'&&!isFinite(+op.pdirAng))delete op.pdir;
      if(op.pdir!=='ang'&&('pdirAng' in op))delete op.pdirAng;
    }else{ delete op.traj; delete op.pdir; delete op.pdirAng; }
    // 2026-10-14-006 : « Glissement max » retiré (transitions au pas seulement)
    delete op.stayMax;
    // 2026-10-04-004 : finition géodésique — limites Z héritées du brut,
    // garde-fou fraise droite recalculée à chaque dispatch (jamais stockée).
    // 2026-10-21-003 : faces usinables (bleu : Finition, Géodésique) et
    // intouchables (rouge : + Ébauche 3D) — listes {b,f} / {b,all} valides ;
    // absentes ou vides = champ retiré (parcours et clés inchangés).
    if(op.type==='rough3d'||op.type==='geofinish'||op.type==='geodesic'){
      const pr=faoFaceListClean(op.protect);
      if(pr.length)op.protect=pr; else delete op.protect;
      if(!pr.length||!(isFinite(+op.protectM)&&+op.protectM>=0))delete op.protectM;
    }else{ delete op.protect; delete op.protectM; }
    if(op.type==='geofinish'){
      const fb=faoFaceListClean(op.faces);
      if(fb.length)op.faces=fb; else delete op.faces;
    }
    if(op.type!=='geodesic'&&op.type!=='geofinish')delete op.faces;
    if(op.type!=='geodesic'&&op.type!=='geofinish'&&op.type!=='rough3d')delete op.tangent;
    // 2026-10-21-001 : géodésique — faces pilotes {b,f} valides, pas borné
    if(op.type==='geodesic'){
      op.faces=faoFaceListClean(op.faces).filter(function(q){return !q.all;});
      if(!(+op.step>0))op.step=1; else op.step=Math.max(0.05,+op.step);
      op.tangent=op.tangent!==false;
      if(!(+op.laisse>=0))op.laisse=0;
    }
    if(op.type==='geofinish'){
      if(!isFinite(+op.ztop))op.ztop=faoStock().z1;
      if(!isFinite(+op.zbot))op.zbot=faoStock().z0;
      delete op.geoBlocked;
    }
  });
}
// radial/axial effectifs d'une op (compat 31v : `laisse` vaut les deux).
function faoRA(o){
  const leg=isFinite(+o.laisse)?+o.laisse:0;
  return {
    radial:isFinite(+o.radial)?+o.radial:leg,
    axial:isFinite(+o.axial)?+o.axial:leg
  };
}
function faoRoot(){
  // Racine {setups, activeSetupId} — crée + migre au besoin.
  try{
    if(typeof doc==='undefined')return {setups:[],activeSetupId:null};
    let r=doc.fao;
    if(!r||typeof r!=='object')r={};
    if(!Array.isArray(r.setups)){
      const s=(r.ops||r.stock)?faoMigrateSetup(r):faoDefaultSetup();
      r={setups:[s],activeSetupId:s.id};
      doc.fao=r;
    }
    if(!r.setups.length){
      const s=faoDefaultSetup(); r.setups.push(s); r.activeSetupId=s.id;
    }
    if(!r.activeSetupId||!r.setups.some(function(s){return s.id===r.activeSetupId;}))
      r.activeSetupId=r.setups[0].id;
    r.setups.forEach(faoSanitiseOps);
    return r;
  }catch(e){ return {setups:[faoDefaultSetup()],activeSetupId:null}; }
}
function faoSetup(id){
  const r=faoRoot();
  for(let i=0;i<r.setups.length;i++)if(r.setups[i].id===(id||r.activeSetupId))return r.setups[i];
  return r.setups[0];
}
function faoDoc(){ return faoSetup(); } // compat : l'ancien "job" = le posage actif
function faoTouch(){
  // Sale MAIS sans rejeu : dirty pour l'autosave, _docVersion inchangé.
  try{ dirty=true; }catch(e){}
  try{ if(typeof refreshParts==='function')refreshParts(); }catch(e){}
  try{ faoRenderTree(); }catch(e){}
}
