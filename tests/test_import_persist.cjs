// 2026-10-15-004 : un import STEP est PERSISTÉ avec le document.
// Retour : « quand on sauvegarde la pièce avec le STEP et des usinages, le fichier
// n'est pas rechargé car manquant. Pourtant le .miniFusion fait 30 Mo ! » — la
// géométrie importée n'était jamais écrite (deserialise jetait les fonctions import).
// On exécute le VRAI importSTEP (noyau OCCT réel, STEP généré ici), on enregistre le
// bundle .miniFusion, on vide tout, on le rouvre : la fonction doit revenir avec le
// MÊME id, son mesh, son BRep exact — et un ancien fichier sans source doit se
// rebrancher sur la fonction existante quand on réimporte le même nom.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  ✗ '+m);}else console.log('  ✓ '+m);};
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  if(typeof sandbox.btoa!=='function')sandbox.btoa=globalThis.btoa;
  if(typeof sandbox.atob!=='function')sandbox.atob=globalThis.atob;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(m){(window.__al=window.__al||[]).push(String(m));};window.confirm=function(){return true;};showAll=function(){};applyView=function(){};',ctx);
  sandbox.__step=vm.runInContext(`(function(){
    const mk=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),60,40,20);
    const sh=mk.Shape();
    const b=occWriteStep([sh],'/__vie.stp');
    try{sh.delete();}catch(e){}try{mk.delete();}catch(e){}
    return b?Uint8Array.from(b).buffer:null;
  })()`,ctx);
  if(!sandbox.__step){console.log('  ✗ STEP de test impossible à produire');process.exit(1);}

  const body=`
    const out={};
    await importSTEP({name:'bloc.stp',arrayBuffer:async()=>__step});
    const f=doc.features.find(x=>x.type==='import');
    if(!f||!f._mesh)return {err:'import sans _mesh'};
    out.id=f.id;
    out.src=!!(f.src&&f.src.key&&f.src.fmt==='step'&&f.src.size===__step.byteLength);
    out.ntri0=((importGeom.get(f.id)||{}).edges||[]).length;
    // ── mesure exacte sur un STEP : faces planes résolues sur le BRep importé ──
    // (THREE est un stub ici : la table triangle -> face de occTessellate n'y survit
    //  pas ; on la pose à la main, une face BRep par « triangle »)
    if(!((f._mesh.geometry.userData||{}).occGroups||[]).length){
      f._mesh.geometry.userData={occGroups:[0,1,2,3,4,5].map(k=>({f:k,start:k,count:1}))};
    }
    const grp=f._mesh.geometry.userData.occGroups;
    occt=__realOcct;occtReady=true;
    if(!bodies.some(b=>b.mesh===f._mesh))bodies.push({id:f.id,ref:f.id,kind:'import',mesh:f._mesh,visible:true}); // rejeu du harnais incomplet
    const geos=grp.map(gr=>{try{return occFaceGeom(f._mesh,gr.start);}catch(e){return 'ERR '+e.message;}});
    out.nFaces=grp.length;
    out.nPlans=geos.filter(G=>G&&G.kind==='plan').length;
    const dist=[];
    for(let i=0;i<geos.length;i++)for(let j=i+1;j<geos.length;j++){
      const a=geos[i],b=geos[j];if(!a||!b||a.kind!=='plan'||b.kind!=='plan')continue;
      if(Math.abs(Math.abs(a.n.dot(b.n))-1)>1e-9)continue;
      dist.push(+Math.abs((b.p.clone().sub(a.p)).dot(a.n)).toFixed(6));
    }
    out.dist=dist.sort((x,y)=>x-y);
    // document léger : le JSON ne contient que la référence, pas les octets
    const ser=serialise(false);
    out.serLeger=ser.length<20000;
    const bundle=await bundleSerialise();
    const B=JSON.parse(bundle);
    out.bundleSrc=!!(B.imports&&B.imports[f.src.key]&&B.imports[f.src.key].length>=__step.byteLength);

    // ── machine vierge : plus de table, plus de source en mémoire ──
    doc.features=[];markDirty();rebuild();
    docUndoStack.length=0;docRedoStack.length=0;importHydrate();
    importSrc.clear();
    out.tableVide=importGeom.size;
    occt=__realOcct;occtReady=true; // le chargeur asynchrone du harnais l'a remis à false
    await bundleRestore(bundle,{name:'reouvert'});
    for(let i=0;i<20&&_importRestoring;i++)await new Promise(r=>setTimeout(r,10));

    const g=doc.features.find(x=>x.type==='import');
    out.revenu=!!g;
    out.memeId=!!(g&&g.id===out.id);
    out.mesh=!!(g&&g._mesh);
    out.ntri1=g?((importGeom.get(g.id)||{}).edges||[]).length:-1;
    const e=g&&importGeom.get(g.id);
    out.brep=!!(e&&e.brep);
    out.corps=bodies.some(b=>b.kind==='import'&&g&&b.mesh===g._mesh);
    out.alerte=(window.__al||[]).filter(m=>/import/i.test(m)).length;

    // ── ancien fichier : fonction import SANS source ──
    window.__al=[];
    const old=JSON.parse(serialise(false));
    old.features.forEach(x=>{if(x.type==='import')delete x.src;});
    doc.features=[];markDirty();rebuild();docUndoStack.length=0;docRedoStack.length=0;importHydrate();
    occt=__realOcct;occtReady=true;
    await deserialise(JSON.stringify(old));
    const h=doc.features.find(x=>x.type==='import');
    out.oldGarde=!!(h&&h.id===out.id&&!h._mesh);
    out.oldAlerte=(window.__al||[]).some(m=>/réimportez/i.test(m)&&/bloc/.test(m));
    await importSTEP({name:'bloc.stp',arrayBuffer:async()=>__step});
    const imps=doc.features.filter(x=>x.type==='import');
    out.rebranche=imps.length===1&&imps[0].id===out.id&&!!imps[0]._mesh&&!!(imps[0].src&&imps[0].src.key);
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx);
  console.log('=== 2026-10-15-004 : import STEP persisté dans le .miniFusion ===');
  if(o.err){console.log('  ERREUR : '+o.err);A(false,'import STEP exécuté');process.exit(1);}
  console.log('  '+JSON.stringify(o));
  A(o.src,'la fonction import référence sa source (format, empreinte, taille)');
  A(o.nFaces===6&&o.nPlans===6,'mesure : les 6 faces du STEP sont résolues en PLANS exacts ('+o.nPlans+'/'+o.nFaces+')');
  A(JSON.stringify(o.dist)==='[20,40,60]','mesure : faces parallèles du STEP = 20 / 40 / 60 mm exactement ('+JSON.stringify(o.dist)+')');
  A(o.serLeger,'le JSON du document reste léger (octets hors document)');
  A(o.bundleSrc,'le .miniFusion embarque le fichier STEP d\'origine');
  A(o.tableVide===0,'machine « vierge » avant réouverture');
  A(o.revenu&&o.memeId,'réouverture : la fonction import revient avec le MÊME id');
  A(o.mesh&&o.corps,'réouverture : le STEP est de nouveau affiché (corps présent)');
  A(o.ntri1===o.ntri0&&o.ntri0>0,'mêmes arêtes classées qu\'à l\'import ('+o.ntri1+' / '+o.ntri0+')');
  A(o.brep,'réouverture : le solide exact (BRep) est disponible');
  A(o.alerte===0,'aucune alerte « réimportez » sur un fichier complet');
  A(o.oldGarde,'ancien fichier sans source : la fonction est conservée (même id)');
  A(o.oldAlerte,'ancien fichier : alerte nommant l\'import à réimporter');
  A(o.rebranche,'réimport du même nom : rebranché sur la fonction existante');
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
