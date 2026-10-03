// 2026-10-02-014 : mode frais (freshHard=true) sans points de contrôle + phases
// du rapport « Rafraîchissement dur ».
// 1) occCkPut bloqué en mode frais : le rejeu principal (pass 0) ne MÉMORISE
//    plus rien — fraîcheur absolue et copie BRep économisée à chaque fonction ;
//    seules les passes de projection imbriquées (rebuild(pass>=1)) posent leurs
//    points (garde freshHard&&!(occProjPass>=1), call sites en thunk pour ne
//    même plus fabriquer la copie).
// 2) hardRefresh() mesure et rapporte les phases : repGen, purge, hôtes/solveur,
//    rejeu exact, tessellation/scène, repli maillage, projections, divers,
//    affichage — dans faceEl (« · phases : … ») et dans l'objet retourné
//    (phases), avec la somme des sous-phases bornée par le temps de rejeu.
// ROUGE avant implémentation : garde absente, appels directs encore présents,
// occCk non nul après un rejeu frais, phases absentes du rapport.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  sandbox.__src20=fs.readFileSync(path.join(ROOT,'src','20-noyau-et-operations-solides.js'),'utf8');
  sandbox.__src30=fs.readFileSync(path.join(ROOT,'src','30-marqueur-temps.js'),'utf8');
  sandbox.__src95=fs.readFileSync(path.join(ROOT,'src','95-toolbar.js'),'utf8');
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    // ═══ 1) structure ═══
    "const iP=__src20.indexOf('function occCkPut('),iR=__src20.indexOf('function occReplayBody(');",
    "att(iP>0&&iR>iP,'bornes occCkPut/occReplayBody introuvables');",
    "const cPut=(iP>0&&iR>iP)?__src20.slice(iP,iR):'';",
    "att(/let occProjPass=0/.test(__src20),'src/20 : déclaration occProjPass absente');",
    "att(/freshHard&&!\\(occProjPass>=1\\)/.test(cPut),'occCkPut : garde « freshHard&&!(occProjPass>=1) » absente — le mode frais doit interdire tout point de contrôle du rejeu principal');",
    "att(/typeof mkShape===\"?function\"?/.test(cPut)||/typeof mkShape==='function'/.test(cPut),'occCkPut : signature en thunk (mkShape) absente — la copie BRep doit être économisée');",
    "att(!/occCkPut\\(ckKey,occShapeCopy\\(/.test(__src20),'occCkPut : appels directs (copie fabriquée avant la garde) encore présents');",
    "const nThunk=(__src20.match(/occCkPut\\(ckKey,\\(\\)=>occShapeCopy\\(result\\)\\)/g)||[]).length;",
    "att(nThunk>=8,'occCkPut : '+nThunk+'/8 call sites en thunk');",
    "const iOR=__src20.indexOf('function occRebuild('),iPR=__src20.indexOf('function projRefreshRerun('),iEnd=__src20.length;",
    "att(iOR>0&&iPR>iOR,'bornes occRebuild/projRefreshRerun introuvables');",
    "const cOR=__src20.slice(iOR,iPR),cPR=__src20.slice(iPR,iEnd);",
    "att(/phAdd\\('replay'/.test(cOR),'occRebuild : la phase « rejeu exact » n est pas chronométrée');",
    "att(/phAdd\\('mesh'/.test(cOR),'occRebuild : la phase « tessellation/scène » n est pas chronométrée');",
    "att(/phAdd\\('proj'/.test(cPR),'projRefreshRerun : la phase « projections » n est pas chronométrée');",
    "att(/let hardPh=null/.test(__src30)&&/phAdd=/.test(__src30),'src/30 : compteur hardPh/phAdd absent');",
    "att(/occProjPass=pass\\|\\|0/.test(__src30),'src/30 : rebuild() ne positionne pas occProjPass (pass 0 vs passes de projection)');",
    "att(/phAdd\\('hotes'/.test(__src30),'src/30 : phase « hôtes/solveur » non chronométrée');",
    "att(/phAdd\\('maillage'/.test(__src30),'src/30 : phase « repli maillage » non chronométrée');",
    "const iH=__src95.indexOf('function hardRefresh('),iBH=__src95.indexOf(\"if($('btnHard'))\");",
    "att(iH>0&&iBH>iH,'bornes hardRefresh introuvables dans src/95');",
    "const cH=__src95.slice(iH,iBH);",
    "att(/hardPh=ph/.test(cH),'hardRefresh : le compteur de phases n est pas activé');",
    "att(/hardPh=null/.test(cH),'hardRefresh : le compteur n est pas désactivé en fin de course');",
    "att(/phases/.test(cH)&&/· phases : /.test(cH),'hardRefresh : la ligne de rapport « · phases » ou l objet phases est absent');",
    // ═══ 2) comportement : noyau OCCT réel ═══
    "const mkSq=(id,name,x0,y0,x1,y1)=>{",
    "  const sk={id:id,name:name,plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{},entities:[],constraints:[],dims:[],visible:false};",
    "  [['p0',x0,y0,'e0','p1'],['p1',x1,y0,'e1','p2'],['p2',x1,y1,'e2','p3'],['p3',x0,y1,'e3','p0']].forEach(l=>{",
    "    sk.points[l[0]]={x:l[1],y:l[2]};sk.entities.push({id:l[3],t:'line',p1:l[0],p2:l[4]});});",
    "  return sk;",
    "};",
    "doc.name='phases';doc.sketches=[mkSq('sk1','Base',0,0,60,40),mkSq('sk2','Poche',15,10,45,30)];",
    "doc.features=[{id:'E1',type:'extrude',name:'Base',sketchId:'sk1',op:'add',distance:20},",
    "  {id:'C1',type:'extrude',name:'Poche',sketchId:'sk2',op:'cut',distance:8}];",
    "doc.bodies=[];doc.bodySeq=1;delete doc.activeBody;doc.bodyVis={};doc.entNames={};doc.fold={};",
    "occSkipFeat=null;tlMark=null;",
    // a) mode rapide : les points de contrôle sont posés (inchangé)
    "freshHard=false;occCkClear();markDirty();rebuild();",
    "att(builtEngine==='exact','a) rebuild de base non exact (builtEngine='+builtEngine+')');",
    "att(occCk.length>0,'a) mode rapide : aucun point de contrôle posé ('+occCk.length+')');",
    "p('a) rapide : '+occCk.length+' ck posés');",
    // b) mode frais : AUCUN point de contrôle après le rejeu principal
    "freshHard=true;occCkClear();markDirty();rebuild();",
    "att(builtEngine==='exact','b) rebuild frais non exact (builtEngine='+builtEngine+')');",
    "att(occCk.length===0,'b) mode frais : '+occCk.length+' point(s) de contrôle posé(s) — occCkPut doit être bloqué (rejeu principal)');",
    "p('b) frais : '+occCk.length+' ck après rejeu');",
    // c) hardRefresh rapporte les phases
    "let hr=null;try{hr=hardRefresh();}catch(e){att(false,'hardRefresh a levé : '+e.message);}",
    "att(!!hr,'c) hardRefresh ne renvoie rien');",
    "if(hr){",
    "  p('c) ms='+hr.ms+' engine='+hr.engine+' bodies='+hr.bodies);",
    "  att(hr.err==null,'c) hardRefresh en erreur : '+hr.err);",
    "  att(hr.bodies>0,'c) aucun corps affiché ('+hr.bodies+')');",
    "  att(!!hr.phases,'c) objet phases absent du retour de hardRefresh');",
    "  if(hr.phases){",
    "    const ks=['rep','purge','rejeu','aff','hotes','replay','mesh','maillage','proj','autres'];",
    "    ks.forEach(k=>att(typeof hr.phases[k]==='number'&&hr.phases[k]>=0,'c) phases.'+k+' absent ou négatif ('+hr.phases[k]+')'));",
    "    att(hr.phases.replay>0,'c) phase rejeu exact non mesurée (0 ms) — le chronomètre n est pas dans occRebuild');",
    "    const sous=hr.phases.hotes+hr.phases.replay+hr.phases.mesh+hr.phases.maillage+hr.phases.proj;",
    "    att(sous<=hr.phases.rejeu+30,'c) somme des sous-phases ('+Math.round(sous)+' ms) > temps de rejeu ('+hr.phases.rejeu+' ms) — double compte');",
    "    p('c) phases : rep '+hr.phases.rep+' / purge '+hr.phases.purge+' / hôtes '+hr.phases.hotes+' / exact '+hr.phases.replay+' / tess '+hr.phases.mesh+' / maillage '+hr.phases.maillage+' / proj '+hr.phases.proj+' / divers '+hr.phases.autres+' / aff '+hr.phases.aff+' (rejeu '+hr.phases.rejeu+')');",
    "  }",
    "  att(/· phases : /.test(faceEl.textContent),'c) ligne « · phases » absente du rapport faceEl');",
    "}",
    "freshHard=false;",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  x '+m));}",
    "else p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'hardphases.js'});
  console.log('=== mode frais sans ck + phases du rafraîchissement dur ===');
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,600));process.exit(1);});
