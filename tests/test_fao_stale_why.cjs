// Diagnostic FAO — « 1 opération sans parcours en mémoire » doit DIRE POURQUOI.
// Trois causes très différentes, indiscernables jusqu'ici (et l'utilisateur est
// resté bloqué dessus) : jamais générée ici / écrite par un ancien tampon de
// moteur / écrite sous une autre clé (le SOLIDE a bougé). La lecture du cache
// enregistre le motif du rejet, l'infobulle du ⚠ et la barre d'état le répètent.
// + un .miniFusion ouvert dit combien de trajectoires il embarque réellement.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const out=await vm.runInContext(`(async function(){
    const P=[]; const A=(ok,m)=>P.push((ok?'OK   ':'ECHEC')+' : '+m);

    /* ---- IndexedDB simulé ---- */
    const kv={};
    try{ indexedDB={open:function(){ return {}; }}; }catch(e){}
    idbSet=function(k,v){ kv[k]=v; return Promise.resolve(); };
    idbGet=function(k){ return Promise.resolve(
      Object.prototype.hasOwnProperty.call(kv,k)?kv[k]:undefined); };
    idbKeys=function(p){ return Promise.resolve(
      Object.keys(kv).filter(function(k){ return k.indexOf(p)===0; })); };

    /* ---- 4 operations : une valide, une vieux tampon, une autre cle, une absente ---- */
    const s=faoDefaultSetup();
    s.id='why1';
    s.stock={x0:0,y0:0,z0:0,x1:100,y1:80,z1:25};
    s.tools=[{id:'T1',num:1,name:'Fraise D10',kind:'flat',d:10,cornerR:0,flutes:2,vc:250,fz:0.06}];
    const mk=(id,bot)=>({id:id,on:true,toolId:'T1',type:'pocket',
      x0:10,y0:10,x1:90,y1:70,ztop:25,zbot:bot,ap:8,ae:5});
    s.ops=[mk('opA',5),mk('opB',6),mk('opC',7),mk('opD',8)];
    doc.name='Diagnostic';
    doc.fao={setups:[s],activeSetupId:s.id};
    faoPrevOn=true;
    faoOpMovesPurge(); faoMovesReset(); faoStaleClear();

    /* ============ 1. les 4 états dans le cache ============ */
    const mvA=faoOpMoves(s.ops[0],s);
    A(mvA.length>0,'operation A generee : '+mvA.length+' pts');
    const idB='faoMoves:'+s.id+':opB', idC='faoMoves:'+s.id+':opC';
    kv[idB]={v:1,ver:'2026-10-04-010',k:faoOpMovesKey(s.ops[1],s),n:42,mv:[1,2,3]};
    // meme operation mais stock different a la generation : la cle recoiffe
    // UNIQUEMENT posage.stock -> le motif doit le dire mot pour mot.
    kv[idC]={v:1,ver:CACHE_VER,n:99,mv:[1,2,3],
      k:faoOpMovesKey(s.ops[2],s).replace('"x1":100','"x1":123')};
    A(!kv['faoMoves:'+s.id+':opD'],'operation D : aucune entree (jamais generate)');

    faoOpMovesPurge(); faoMovesReset();
    const nLoad=await faoMovesPreload();
    A(nLoad===1,'lecture : 1 seule operation restauree ('+nLoad+')');

    /* ============ 2. motifs ============ */
    A(faoStaleWhy(s.ops[0],s)==='','A (valide) : aucun motif');
    const wB=faoStaleWhy(s.ops[1],s);
    A(wB.indexOf('ANTERIEURE')>=0&&wB.indexOf('2026-10-04-010')>=0,
      'B (ancien tampon) : \"'+wB+'\"');
    const wC=faoStaleWhy(s.ops[2],s);
    A(wC.indexOf('AUTRE cle')>=0&&wC.indexOf('99 points')>=0
      &&wC.indexOf('posage.stock')>=0,
      'C (autre cle) : \"'+wC+'\"');
    const wD=faoStaleWhy(s.ops[3],s);
    A(wD.indexOf('jamais generate ici, ou cache purge')>=0,
      'D (absente) : \"'+wD+'\"');
    A(faoMovesWhyShort(s,s.ops[1]).indexOf('ancien moteur')>=0,
      'B court : \"'+faoMovesWhyShort(s,s.ops[1])+'\"');
    A(faoMovesWhyShort(s,s.ops[2]).indexOf('posage.stock')>=0,
      'C court : \"'+faoMovesWhyShort(s,s.ops[2])+'\"');
    A(faoMovesWhyShort(s,s.ops[3]).indexOf('jamais generate')>=0,
      'D court : \"'+faoMovesWhyShort(s,s.ops[3])+'\"');
    A(faoMovesWhyShort(s,s.ops[0])==='','A court : aucun motif');

    /* ============ 3. 3 triangles, pas 4 ============ */
    A(faoStaleScan()===3,'scan : 3 operations marquees ('+faoStaleCount()+')');
    A(s.ops[0].stale!==true,'A reste verte');

    /* ============ 4. pendant la lecture : pas de verdict premature ============ */
    faoOpMovesPurge(); faoMovesReset(); faoStaleClear();
    const wP=faoStaleWhy(s.ops[0],s);
    A(wP.indexOf('Lecture du cache en cours')>=0,'lecture en cours : \"'+wP+'\"');
    await faoMovesPreload();

    /* ============ 5. barre d'etat (oeil Masquer/Afficher) ============ */
    faceEl.textContent='';
    faoVisibleChanged();
    A(faceEl.textContent.indexOf('sans parcours en memoire')>=0,
      'etat : \"'+faceEl.textContent.slice(0,120)+'\"');
    A(faceEl.textContent.indexOf('ancien moteur')>=0,
      'etat : le motif suit la 1re operation manquante');
    const stats=faoStatsText();
    A(stats.indexOf('sans parcours en mémoire')>=0&&stats.indexOf('ancien moteur')>=0,
      'stats : \"'+stats.slice(0,140)+'\"');

    /* ============ 5 bis. une cle differente dit POURQUOI ============ */
    A(faoKeyDiff('1a|[\"sig\",{},null]','1b|[\"sig\",{},null]')
      .indexOf('empreinte du SOLIDE differente')>=0,'cle : le solide est nomme');
    A(faoKeyDiff('1x|[{\\\"id\\\":\\\"op\\\",\\\"minipasses\\\":0},{},null]',
                 '1x|[{\\\"id\\\":\\\"op\\\"},{},null]')
      .indexOf('operation.minipasses')>=0,'cle : la composante est nommee');
    A(faoKeyDiff('1x|[\"s\",{},null]','1x|[\"s\",{},null]')==='','cle : rien a dire quand c est identique');

    /* ============ 5 ter. signature moteur/corps : la SOURCE du solide ============
       kind:'body' -> geometrie d'outillage (occXDefl), sinon maillage d'affichage :
       l'empreinte change sans que le solide ait bouge. L'entree porte la signature
       ecrite a la generation -> le motif le dit explicitement. */
    kv[idB]={v:1,ver:CACHE_VER,n:42,mv:[1,2,3],
      e:'old_engine|b1#body*',
      k:faoOpMovesKey(s.ops[1],s)+'!'};
    faoOpMovesPurge(); faoMovesReset(); faoStaleClear();
    await faoMovesPreload();
    const wB2=faoStaleWhy(s.ops[1],s);
    A(wB2.indexOf('source du solide changee')>=0,
      'cle : la SOURCE du solide est nommee : "'+wB2+'"');
    A(faoMovesWhyShort(s,s.ops[1]).indexOf('source du solide changee')>=0,
      'cle court : la source suit aussi dans la barre d etat');

    /* ============ 5 quater. corps par corps : maillage ou simple coordonnees ============
       « empreinte differente » ne disait pas QUEL corps ni SI les sommets avaient
       bouge : meme compte + autre hash = les COORDONNEES ont change. */
    A(faoPartsDiff('b1:1a2b_100','b1:3c4d_100').indexOf('coordonnees differentes')>=0,
      'parties : memes sommets = coordonnees ('+faoPartsDiff('b1:1a2b_100','b1:3c4d_100')+')');
    A(faoPartsDiff('b1:1a2b_100','b1:3c4d_120').indexOf('100 -> 120 sommets')>=0,
      'parties : compte change ('+faoPartsDiff('b1:1a2b_100','b1:3c4d_120')+')');
    const pd=faoPartsDiff('b1:1a2b_100','b2:9f8e_50');
    A(pd.indexOf('b1 disparu')>=0&&pd.indexOf('b2 apparue')>=0,'parties : apparition/disparition ('+pd+')');
    A(faoPartsDiff('b1:1a2b_100','b1:1a2b_100')==='','parties : rien a dire quand c est identique');
    // plomberie : la liste figee apres la cle est celle comparee a l'entree
    kv[idB]={v:1,ver:CACHE_VER,n:42,mv:[1,2,3],
      e:'old_engine|b1#body*',p:'b1:3c4d_100',k:faoOpMovesKey(s.ops[1],s)+'!'};
    faoFpParts='b1:1a2b_100';
    faoOpMovesPurge(); faoMovesReset(); faoStaleClear();
    await faoMovesPreload();
    const wB3=faoStaleWhy(s.ops[1],s);
    A(wB3.indexOf('b1 : memes sommets, coordonnees differentes')>=0,
      'entree : corps par corps dans le motif ("'+wB3.slice(0,150)+'")');
    faoFpParts='';

    /* ============ 5 quint. repli d'image : ni lecture, ni ecriture ============
       restoreViewCache remet des corps « cached » SANS shape : la FAO lit alors le
       maillage de repli, et le rejeu exact change l'empreinte juste après. */
    A(faoSolidSettled()===true,'solide : etat final au depart');
    delete kv['faoMoves:'+s.id+':opA'];
    bodies.push({id:'bC',name:'Repli',visible:true,ghost:false,cached:true,kind:'body',mesh:{visible:true}});
    A(faoSolidSettled()===false,'solide : corps en repli d image = etat non etabli');
    faoMovesReset(); faoOpMovesPurge();
    const nSusp=await faoMovesPreload();
    A(nSusp===0,'solide : lecture differee pendant le rejeu (0 lue)');
    A(faoMovesPending()===true,'solide : on reste en attente (pas de verdict)');
    faoOpMoves(s.ops[0],s);
    A(!kv['faoMoves:'+s.id+':opA'],'solide : aucune entree ecrite sur le repli');
    const nSuspGen=faoPreviewGenerate();
    A(nSuspGen===0&&faoRegenWhenSettled===true,
      'solide : Tout regenerer differe (0 point, drapeau pose)');
    A(faoStaleWhy(s.ops[0],s).indexOf('Rejeu exact en cours')>=0,
      'solide : l infobulle le dit');
    bodies.pop();
    A(faoSolidSettled()===true,'solide : corps exact de retour = etat etabli');
    faoRegenWhenSettled=false;
    faoMovesReset(); faoOpMovesPurge(); // memoire vidée : la generation repart de zéro
    faoOpMoves(s.ops[0],s);
    A(!!kv['faoMoves:'+s.id+':opA'],'solide : entree ecrite des que le solide est etabli');

    /* ============ 6. ouverture d'un .miniFusion : ce qu'il contient VRAIMENT ============ */
    const txt=await bundleSerialise();
    const b=JSON.parse(txt);
    A(b.nMoves===3,'bundle : '+b.nMoves+' trajectoires embarquees (A, B vieux tampon, C autre cle)');
    Object.keys(kv).forEach(function(k){ delete kv[k]; });
    faoOpMovesPurge(); faoMovesReset(); faoStaleClear();
    faceEl.textContent='';
    await bundleRestore(txt,{rebuild:false});
    await faoMovesPreload();
    A(faceEl.textContent.indexOf('fichier ouvert')>=0,
      'ouverture : \"'+faceEl.textContent.slice(0,140)+'\"');
    A(faceEl.textContent.indexOf('3 opération(s) sans parcours')>=0,
      'ouverture : les 3 entrees non valides sont signalees');
    A(faceEl.textContent.indexOf('source du solide changee')>=0,
      'ouverture : le motif est donne');
    A(faoStaleCount()===3,'ouverture : 3 triangles ('+faoStaleCount()+')');

    /* ============ 7. aller-retour JSON : la cle ne doit PLUS deriver ============
       Cas prouve par la sonde : un op non normalise hache SANS minipasses au
       moment de la generation puis AVEC a la lecture -> entree rejetee a chaque
       ouverture alors que RIEN n avait bouge. faoOpMovesKey normalise desormais. */
    const sj=faoSetup();
    const raw={id:'opR',on:true,toolId:'T1',type:'rough3d',ztop:25,zbot:0,ap:4,ae:4};
    sj.ops.push(raw);                       // cree SANS minipasses (comme l UI)
    const kRaw=faoOpMovesKey(raw,sj);       // hache, puis normalise en chemin
    const kNorm=faoOpMovesKey(faoSetup().ops[faoSetup().ops.length-1],faoSetup());
    A(kRaw===kNorm,'cle : creation directe = cle apres faoRoot');
    A(raw.minipasses===0,'cle : le champ minipasses a ete ajoute par la migration');
    const json=JSON.parse(JSON.stringify(doc));
    doc=json;
    const s3=faoSetup();
    const k3=faoOpMovesKey(s3.ops[s3.ops.length-1],s3);
    A(k3===kRaw,'cle : identique apres aller-retour JSON');
    doc={fao:null};

    /* ============ 8. la generation differee a bien lieu a la fin du rejeu ============ */
    const origPG=faoPreviewGenerate; let pg=0;
    faoPreviewGenerate=function(){ pg++; return 1; };
    bodies.push({id:'bF',name:'Repli2',visible:true,ghost:false,cached:true,kind:'body',mesh:{visible:true}});
    faoRegenWhenSettled=true;
    faoRegenFlush();
    A(pg===0&&faoRegenWhenSettled===true,'differe : rien tant que le repli est la');
    bodies.pop();
    faoRegenFlush();
    A(pg===1&&faoRegenWhenSettled===false,
      'differe : execute des que le solide exact revient (appel '+pg+')');
    faoPreviewGenerate=origPG;

    faoMovesReset();
    return P;
  })()`,ctx);
  let ko=0;
  out.forEach(function(l){ console.log('  '+(l.indexOf('OK')===0?'✓':'✗')+' '+l.slice(7)); if(l.indexOf('ECHEC')===0)ko++; });
  if(ko){ console.log('\n'+ko+' ECHEC(S)'); process.exit(1); }
  console.log('\nTOUT EST CONFORME');
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
