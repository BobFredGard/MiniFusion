// FAO — un AFFICHAGE ne doit jamais REGENERER :
//  · choisir une operation ou afficher les stats du posage ne calcule RIEN tant
//    que le cache IndexedDB est en lecture : le panneau affiche « chargement »
//    puis se remplit tout seul (c'etait le « ca regenere a chaque F5 ») ;
//  · tant que le solide n'existe pas (restoreViewCache + rejeu exact), la lecture
//    RESSAIE toutes les 400 ms au lieu d'abandonner sur « nb » ;
//  · le calcul ne reste qu'aux chemins EXPLICITES : « Tout régénérer », le
//    triangle ⚠, et le 1er passage sans aucun cache (IndexedDB absente) ;
//  · un fichier bien genere ouvert = acces IMMEDIAT : la fin de lecture dessine
//    les traces et valide l'apercu, sans aucun clic.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const out=await vm.runInContext(`(async function(){
    const P=[]; const A=(ok,m)=>P.push((ok?'OK   ':'ECHEC')+' : '+m);
    const sleep=function(ms){ return new Promise(function(r){ setTimeout(r,ms); }); };

    const s=faoDefaultSetup();
    s.id='pos1';
    s.stock={x0:0,y0:0,z0:0,x1:100,y1:80,z1:25};
    s.tools=[{id:'T1',num:1,name:'Fraise D10',kind:'flat',d:10,cornerR:0,flutes:2,vc:250,fz:0.06}];
    s.ops=[{id:'opP',on:true,toolId:'T1',type:'pocket',x0:5,y0:5,x1:95,y1:75,ztop:25,zbot:5,ap:8,ae:5}];
    doc.fao={setups:[s],activeSetupId:s.id};
    faoPrevOn=true;
    faoOpMovesPurge(); faoMovesReset();

    const origGen=faoGenPocket; let gen=0;
    faoGenPocket=function(){ gen++; return origGen.apply(this,arguments); };

    /* ============ 0. sans IndexedDB : inchange ============ */
    A(faoMovesReady()===false,'sans indexedDB : cache persistant desactive');
    A(faoMovesPending()===false,'sans indexedDB : on n attend personne');
    A(faoMovesStat(s.ops[0],s).length>0,'sans indexedDB : on calcule (comme avant)');
    A(gen===1,'sans indexedDB : 1 generation ('+gen+')');

    /* ============ 1. IndexedDB present ============ */
    const kv={};
    try{ indexedDB={open:function(){ return {}; }}; }catch(e){}
    idbSet=function(k,v){ kv[k]=v; return Promise.resolve(); };
    idbGet=function(k){ return Promise.resolve(
      Object.prototype.hasOwnProperty.call(kv,k)?kv[k]:undefined); };
    A(faoMovesReady()===true,'indexedDB present : cache persistant actif');

    /* ============ 2. 1er passage ============ */
    faoOpMovesPurge(); faoMovesReset();
    gen=0;
    const mv1=faoOpMoves(s.ops[0],s);
    A(mv1.length>0,'1er passage : '+mv1.length+' points, ecrits en base');
    A(gen===1,'1er passage : une generation ('+gen+')');
    A(!!kv[faoMovesIdbKey(s,s.ops[0])],'entree IndexedDB ecrite');
    gen=0;

    /* ============ 3. « nouveau navigateur » : lecture en cours ============
       C'est exactement l'etat au F5 : memoire vide, base pleine, solide en cours
       de construction. Choisir l'operation ne doit RIEN calculer. */
    faoOpMovesPurge(); faoMovesReset();
    A(!faoOpMovesHit(s.ops[0]),'cache memoire vide');
    A(faoMovesPending()===true,'lecture IndexedDB en attente');

    A(faoOpMovesTry(s.ops[0],s)===null,'lecture seule : rien en memoire -> null');
    A(gen===0,'lecture seule : AUCUN calcul ('+gen+')');

    A(faoMovesStat(s.ops[0],s)===null,'fiche op : null pendant la lecture (affichage « … »)');
    A(gen===0,'fiche op : AUCUN calcul pendant la lecture ('+gen+')');

    const st=faoStats(s);
    A(st.pending===true,'stats du posage : en attente du cache');
    A(faoStatsText().indexOf('chargement')>=0,'texte des stats : « '+faoStatsText()+' »');
    A(gen===0,'stats du posage : AUCUN calcul pendant la lecture ('+gen+')');

    /* ============ 4. la lecture se termine : les points arrivent SANS calcul ============ */
    const n4=await faoMovesPreload();
    A(n4===1,'preload : '+n4+' operation restauree');
    A(faoMovesPending()===false,'lecture finie');
    const mv4=faoMovesStat(s.ops[0],s);
    A(!!mv4&&mv4.length===mv1.length,'fiche op : '+(mv4?mv4.length:0)+' pts affiches');
    A(gen===0,'fiche op apres lecture : AUCUN recalcul ('+gen+')');
    A(faoOpMovesTry(s.ops[0],s)===kv[faoMovesIdbKey(s,s.ops[0])].mv,
      'parcours servis = tableau de la base');
    const st4=faoStats(s);
    A(st4.pending!==true&&st4.n===1,'stats du posage : '+st4.n+' op apres lecture');
    A(gen===0,'stats apres lecture : AUCUN recalcul ('+gen+')');

    /* ============ 5. rien en base (operation inconnue) : on ne recalcule PAS ============
       Cache persistant DISPONIBLE mais entree absente : l'affichage reste en lecture
       seule. Cliquer le nom d'une operation n'est pas un ordre de generation — l'etat
       le dit et « Tout régénérer » produit (~90 s, jamais declenche en cachette). */
    s.ops.push({id:'opQ',on:true,toolId:'T1',type:'pocket',x0:5,y0:5,x1:95,y1:75,ztop:25,zbot:8,ap:5,ae:5});
    faoOpMovesPurge(); faoMovesReset();
    await faoMovesPreload();
    const mv5=faoMovesStat(s.ops[1],s);
    A(mv5===null,'entree absente : AUCUN calcul au clic (gen='+gen+')');
    A(gen===0,'entree absente : fiche = « pas de parcours », 0 generation ('+gen+')');
    A(faoStaleCount()>0,'entree absente : triangle \u26a0 pose sur l operation ('+faoStaleCount()+')');
    A(faoPrevStale===true,'entree absente : apercu reste perime (export bloque)');
    const st5=faoStats(s);
    A(st5.missing>0,'entree absente : stats signalent l operation manquante ('+st5.missing+')');
    A(faoStatsText().indexOf('Tout régénérer')>=0&&faoStatsText().indexOf('Générer')<0,
      'entree absente : message stats = « '+faoStatsText()+' »');
    // Generation EXPLICITE : c'est le seul chemin qui produit une trajectoire.
    const mv5b=faoOpMoves(s.ops[1],s);
    A(!!mv5b&&mv5b.length>0,'generation explicite : '+mv5b.length+' points');
    A(gen===1,'generation explicite : 1 generation ('+gen+')');
    A(faoStaleCount()===0,'generation explicite : plus rien a regenerer');

    /* ============ 6. solide pas encore construit : on RESSAIE ============ */
    bodies.length=0;
    faoOpMovesPurge(); faoMovesReset();
    s.ops.push({id:'opR',on:true,toolId:'T1',type:'rough3d',ztop:25,zbot:0,ap:4,ae:4});
    faoMovesPreloadSoon();
    await sleep(80);
    A(faoMovesPreloaded===false,'solide absent : la lecture ne passe PAS en « pret »');
    A(faoMovesRetry>0||faoMovesRetryT!==null,
      'solide absent : reprise programmee (essai n°'+faoMovesRetry+')');
    A(faoMovesPending()===true,'solide absent : les affichages attendent encore');
    faoMovesReset();          // coupe la boucle de reessais (le solide arrive ensuite)

    /* ============ 7. le solide arrive : la reprise forcee de l init ============ */
    bodies.push({id:'b1',name:'Corps 1',visible:true,ghost:false});
    faoMeshFromBody=function(){ return {v:[[0,0,0],[10,0,0],[0,10,0]],t:[[0,1,2]]}; };
    faoOpMovesPurge(); faoMovesReset();
    faoMovesPreloadSoon(true);
    await sleep(80);
    A(faoMovesPreloaded===true,'solide construit : lecture terminee sans intervention');
    A(faoMovesRetry===0,'reessais remis a zero');

    s.ops.pop();

    /* ============ 8. modif pendant la lecture : rien n est tranche avant la fin ============
       Un clic dans l'arbre juste apres un F5 ne doit ni poser de triangles rouges
       (le cache n'est pas encore lu) ni relancer l'apercu. */
    faoOpMovesPurge(); faoMovesReset(); faoStaleClear();
    A(faoMovesPending()===true,'etat F5 : lecture en cours');
    faoChanged();
    A(faoPrevWanted==='full','modif pendant la lecture : reportee (redraw complet)');
    A(faoStaleCount()===0,'modif pendant la lecture : AUCUN triangle faux');
    A(faoStatsText().indexOf('chargement')>=0,'modif pendant la lecture : stats en attente');
    gen=0;
    faoMovesPreloadSoon();
    await sleep(80);
    A(faoPrevWanted===false,'apres lecture : la modif est tranchee');
    A(faoStaleCount()===0,'apres lecture : le cache est chaud, rien n est perime');
    A(gen===0,'apres lecture : le redraw differe ne recalcule RIEN ('+gen+')');

    faoMovesReset();

    /* ============ 9. MASQUER / AFFICHER = AFFICHAGE SEUL ============
       L'oeil de l'arbre ne doit JAMAIS regenerer : le G-code ne change pas,
       aucun triangle, aucun parcours recalcule — meme avec la memoire vide. */
    faoPrevOn=true;
    faoOpMovesPurge(); faoMovesPreloaded=true; // memoire VIDE, lecture deja terminee
    gen=0;
    const ps0=faoPrevStale;
    s.ops[0].hidden=true;
    faoVisibleChanged();
    A(gen===0,'masquer (memoire vide) : AUCUN recalcul ('+gen+')');
    A(faoPrevStale===ps0,'masquer : l apercu n est pas marque perime (G-code inchange)');
    A(faoStaleCount()===0,'masquer : aucun triangle');
    A(faoPrevMissing>0,'masquer : parcours absents de la memoire signales ('+faoPrevMissing+')');
    s.ops[0].hidden=false;
    faoVisibleChanged();
    A(gen===0,'afficher (memoire vide) : AUCUN recalcul ('+gen+')');

    /* ---- 9b : pendant la lecture, le redraw est REPORT (pas de calcul) ---- */
    faoOpMovesPurge(); faoMovesReset();
    gen=0;
    s.ops[0].hidden=true;
    faoVisibleChanged();
    A(faoPrevWanted==='lecture','masquer pendant la lecture : redraw reporte');
    A(gen===0,'masquer pendant la lecture : AUCUN recalcul ('+gen+')');
    s.ops[0].hidden=false;
    await faoMovesPreload();           // -> faoMovesDone() -> faoRefreshPreview(true)
    A(faoPrevWanted===false,'apres lecture : le report est consomme');
    A(gen===0,'apres lecture : le redraw reporte n a rien recalcule ('+gen+')');

    /* ---- 9c : cache chaud = traces dessinees, toujours 0 calcul ---- */
    await faoMovesPreload();
    gen=0;
    s.ops[0].hidden=true;
    faoVisibleChanged();
    A(faoPrevMissing===0,'cache chaud : tous les parcours sont en memoire');
    A(gen===0,'cache chaud : masquer n a rien recalcule ('+gen+')');
    s.ops[0].hidden=false;
    faoVisibleChanged();
    A(gen===0,'cache chaud : afficher n a rien recalcule ('+gen+')');

    /* ============ 10. OUVERTURE : ACCES IMMEDIAT (aucun clic) ============
       Fichier bien genere + cache chaud : la fin de lecture DESSINE les traces et
       VALIDE l'apercu — le bouton passe au vert sans « Tout régénérer », et aucun
       triangle ne subsiste. */
    faoOpMovesPurge(); faoMovesReset(); faoStaleClear();
    s.ops[0].hidden=false;
    faoPrevOn=true; faoPrevStale=true;   // « Nouveau fichier » (rouge) puis « Ouvrir »
    gen=0;
    await faoMovesPreload();
    A(gen===0,'ouverture : AUCUN calcul ('+gen+')');
    A(faoPrevStale===false,'ouverture : apercu VALIDE sans rien presser');
    A(faoStaleCount()===0,'ouverture : aucun triangle ('+faoStaleCount()+')');
    A(faoPrevMissing===0,'ouverture : toutes les traces dessinees ('+faoPrevMissing+' manquant)');
    A(faoMovesAllReady(s)===true,'ouverture : tous les parcours sont en memoire');

    /* ---- 11. cliquer sur le nom d'une operation = affichage seul ---- */
    gen=0;
    const mv11=faoMovesStat(s.ops[0],s);
    A(!!mv11&&gen===0,'clic sur une op : trace servie du cache, 0 generation ('+gen+')');
    const st11=faoStats(s);
    A(st11.missing===0&&st11.n===2,'clic : stats completes sans calcul ('+st11.n+' op)');

    faoMovesReset();
    faoGenPocket=origGen;
    return P;
  })()`,ctx);
  let ko=0;
  out.forEach(function(l){ console.log('  '+(l.indexOf('OK')===0?'✓':'✗')+' '+l.slice(7)); if(l.indexOf('ECHEC')===0)ko++; });
  if(ko){ console.log('\n'+ko+' ECHEC(S)'); process.exit(1); }
  console.log('\nTOUT EST CONFORME');
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
