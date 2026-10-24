// Ouverture d'un .miniFusion DÉTERMINISTE : le solide ne dépend plus de l'ordre des micro-tâches.
// Constat (V0.6.0) : une seule attente asynchrone de plus dans bundleRestore faisait passer la
// pédale de 143 à 155 arêtes. Cause : le démarrage asynchrone du noyau (96) tournait AUSSI dans
// le harnais — en « file: » sans cache, il remettait occtReady=false une micro-tâche plus tard,
// après que le test l'avait mis à true : toute attente avant le rejeu le faisait en repli maillage
// (le fichier de la pédale n'a pourtant aucun import). Corrigé dans appvm.cjs (__occBootDone).
// Côté application : `await bundleRestore` / `await deserialise` rendent désormais la main IMPORTS
// REJOUÉS (importRestorePending attendue), et une restauration déjà en cours (noyau prêt pendant
// une ouverture) n'empêche plus celle du nouveau document — avant, elle rendait 0 et le STEP
// du fichier ouvert ne revenait jamais.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  ✗ '+m);}else console.log('  ✓ '+m);};
const pedale=fs.readFileSync(path.join(ROOT,'Exemples','Support Pédale Déportée R1200RT 2011.miniFusion'),'utf8');
const malaxeur=fs.readFileSync(path.join(ROOT,'Exemples','Malaxeur Retard.miniFusion'),'utf8');
const crochet=fs.readFileSync(path.join(ROOT,'Exemples','Crochet.miniFusion'),'utf8');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;sandbox.__pedale=pedale;sandbox.__malaxeur=malaxeur;sandbox.__crochet=crochet;
  sandbox.btoa=globalThis.btoa;sandbox.atob=globalThis.atob; // sources des imports (base64)
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const body=`
    const out={};
    viewUserMoved=true; // pas de recadrage après rejeu des imports : showAll lève dans le harnais (caméra factice)
    const attendre=async n=>{for(let i=0;i<n;i++)await null;await new Promise(r=>setTimeout(r,0));};
    const vierge=()=>{ // machine « vierge » : plus de table d'imports, plus de source en mémoire
      doc.features=[];markDirty();rebuild();docUndoStack.length=0;docRedoStack.length=0;importHydrate();importSrc.clear();
    };
    const aretes=()=>{occCkClear();markDirty();rebuild();const FR=occFinalShape(null);
      if(!FR||!FR.shape)return 'shape nulle';
      const es=occSharpEdges(FR.shape);return es.length+'/'+es.filter(e=>e.sharp).length+'/'+es.filter(e=>!e.sharp).length;};
    const solide=()=>{ // document fait d'imports seuls : occFinalShape est nul, on mesure leurs BRep
      occCkClear();markDirty();rebuild();
      const sh=doc.features.filter(f=>f.type==='import').map(f=>(importGeom.get(f.id)||{}).brep).filter(Boolean);
      if(!sh.length)return 'aucun solide';
      return sh.map(s=>occCoqueNFaces(s)+' faces, '+(occCoqueVolume(s)||0).toFixed(2)+' mm3').join(' + ')
        +' — '+bodies.filter(b=>b.kind==='import').length+' corps';};
    const imports=()=>doc.features.filter(f=>f.type==='import').map(f=>!!f._mesh&&importGeom.has(f.id));
    // ── pédale (sans import) : 0 attente / attentes avant et après l'ouverture ──
    await bundleRestore(__pedale,{rebuild:false});out.ped0=aretes();
    await attendre(5);await bundleRestore(__pedale,{rebuild:false});await attendre(5);
    out.pedReady=occtReady;out.ped1=aretes();
    // ── Malaxeur Retard (2 imports STEP) : imports prêts dès le retour de bundleRestore ──
    vierge();await bundleRestore(__malaxeur,{rebuild:false});
    out.mal0imp=imports();out.mal0=solide();
    vierge();await attendre(5);await bundleRestore(__malaxeur,{rebuild:false});await attendre(5);
    out.mal1imp=imports();out.mal1=solide();
    // ── restauration déjà en cours au moment de l'ouverture (noyau prêt pendant l'ouverture) ──
    vierge();occtReady=false;await bundleRestore(__malaxeur,{rebuild:false});
    out.attente=imports(); // noyau absent : imports en attente, sans géométrie
    occtReady=true;
    const _get=importSrcGet;
    importSrcGet=async k=>{await new Promise(r=>setTimeout(r,30));return _get(k);}; // lecture lente (IndexedDB)
    const p1=importRestorePending(); // celle d'occtFinishBoot : vise le document ci-dessus
    await bundleRestore(__malaxeur,{rebuild:false}); // le fichier est rouvert pendant ce temps
    out.mal2imp=imports();
    await p1;importSrcGet=_get;
    out.mal2=solide();
    // ── un fichier ouvert juste après un autre (aucune modification entre les deux) ──
    const vol=()=>(occLive&&occLive.shape)?(occCoqueVolume(occLive.shape)||0).toFixed(2):'—';
    // (rebuild:false + rebuild() : même garde que le rejeu de deserialise, sans son showAll qui lève ici)
    vierge();await bundleRestore(__crochet,{rebuild:false});rebuild();out.volA=vol();
    await bundleRestore(__pedale,{rebuild:false});rebuild();out.volB=vol();
    builtVersion=-1;rebuild();out.volRef=vol(); // rejeu forcé : la vraie pédale
    return out;`;
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx);
  console.log('=== Ouverture déterministe (ordre des micro-tâches) ===');
  console.log('  '+JSON.stringify(o));
  A(o.ped0==='143/85/58','pédale, aucune attente : 143 arêtes, 85 vives, 58 tangentes ('+o.ped0+')');
  A(o.pedReady===true,'le démarrage asynchrone du noyau ne remet plus occtReady à false dans le harnais');
  A(o.ped1===o.ped0,'pédale, attentes avant/après l’ouverture : MÊME solide ('+o.ped1+')');
  A(o.mal0imp.length===2&&o.mal0imp.every(Boolean),'Malaxeur : les 2 STEP sont rejoués quand bundleRestore rend la main');
  A(o.mal1imp.length===2&&o.mal1imp.every(Boolean)&&o.mal1===o.mal0,'Malaxeur, attentes en plus : mêmes imports, MÊME solide ('+o.mal1+')');
  A(o.attente.length===2&&o.attente.every(x=>!x),'noyau absent à l’ouverture : imports en attente (aucune géométrie)');
  A(o.mal2imp.length===2&&o.mal2imp.every(Boolean),'restauration déjà en cours : les STEP du fichier rouvert reviennent quand même');
  A(o.mal2===o.mal0,'… et donnent le MÊME solide ('+o.mal2+')');
  A(o.volB===o.volRef&&o.volB!==o.volA,'fichier ouvert juste après un autre : SON solide est rejoué ('+o.volA+' → '+o.volB+', attendu '+o.volRef+' mm3)');
  console.log(ko?'ÉCART — '+ko+' échec(s)':'TOUT EST CONFORME');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,800));process.exit(1);});
