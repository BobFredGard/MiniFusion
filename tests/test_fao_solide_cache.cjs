// FAO — l'Ébauche 3D (et la géofinition) embarque l'EMPREINTE DU SOLIDE dans sa
// clé de cache ; le Surfaçage, lui, n'en dépend pas. Conséquence mesurée au F5 :
// la 1re lecture a lieu sur le REPLI MAILLAGE (le noyau OCCT exact n'a pas encore
// demarre) -> autre empreinte, entrée rejetée, triangle rouge. Et quand le solide
// exact arrivait, rien ne relisait : le triangle ne retombait JAMAIS.
//  · clé impossible ('nb' = solide pas construit) = AUCUN triangle ;
//  · l'empreinte suivie par la lecture : dès qu'elle change, le cache est RELU
//    (aucun calcul) et les deux opérations redeviennent vertes, d'elles-mêmes.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const out=await vm.runInContext(`(async function(){
    const P=[]; const A=(ok,m)=>P.push((ok?'OK   ':'ECHEC')+' : '+m);
    const sleep=function(ms){ return new Promise(function(r){ setTimeout(r,ms); }); };

    /* ---- IndexedDB simulé (le harnais n'en a pas) ---- */
    const kv={};
    try{ indexedDB={open:function(){ return {}; }}; }catch(e){}
    idbSet=function(k,v){ kv[k]=v; return Promise.resolve(); };
    idbGet=function(k){ return Promise.resolve(
      Object.prototype.hasOwnProperty.call(kv,k)?kv[k]:undefined); };
    A(faoMovesReady()===true,'indexedDB present : cache actif');

    /* ---- deux solides : A = exact (OCCT), B = repli maillage ---- */
    const mA=function(){ return {v:[[0,0,0],[10,0,0],[0,10,0],[0,0,10]],
                                 t:[[0,1,2],[0,1,3],[0,2,3]]}; };
    const mB=function(){ return {v:[[0,0,0],[12,0,0],[0,12,0],[0,0,12]],
                                 t:[[0,1,2],[0,1,3],[0,2,3]]}; };
    bodies.length=0;
    bodies.push({id:'b1',name:'Corps 1',visible:true,ghost:false});
    faoMeshFromBody=mA;

    const s=faoDefaultSetup();
    s.id='pos1';
    s.stock={x0:0,y0:0,z0:0,x1:100,y1:80,z1:25};
    s.tools=[{id:'T1',num:1,name:'Fraise D10',kind:'flat',d:10,cornerR:0,flutes:2,vc:250,fz:0.06}];
    s.ops=[
      {id:'opF',on:true,toolId:'T1',type:'facing',z:20,ae:6},
      {id:'opR',on:true,toolId:'T1',type:'rough3d',ztop:25,zbot:0,ap:4,ae:4}];
    doc.fao={setups:[s],activeSetupId:s.id};
    faoPrevOn=true;

    let gen=0;
    // 2026-10-09-005 : le corps de l'ébauche est le générateur faoGenRough3DIt
    // (faoGenRough3D n'est plus qu'un drain synchrone) — on intercepte L'entrée
    // réelle du calcul, comme avant.
    const origGI=faoGenRough3DIt;
    faoGenRough3DIt=function*(){ gen++;
      const fake=[{r:0,x:10,y:10,z:20},{r:0,x:80,y:10,z:20},{r:0,x:80,y:60,z:20}];
      yield fake; return fake; };

    /* ==== 1. solide pas construit : PAS de clé -> PAS de triangle ==== */
    faoOpMovesPurge(); faoMovesReset();
    const keep=bodies.splice(0,bodies.length);   // solide retire (etat « nb »)
    A(faoOpMovesKey(s.ops[1],s)===null,'sans solide : cle de l ebauche impossible');
    A(faoOpMovesKey(s.ops[0],s)!==null,'sans solide : le surfacage a toujours sa cle');
    const mv0=faoOpMoves(s.ops[0],s);            // memoire, independant du solide
    A(mv0.length>0,'sans solide : le surfacage se genere quand meme ('+mv0.length+' pts)');
    A(faoStaleScan()===0,'sans solide : AUCUN triangle rouge ('+faoStaleCount()+')');
    A(s.ops[1].stale!==true,'sans solide : l ebauche n est pas marquee a regenerer');
    keep.forEach(function(b){ bodies.push(b); });
    faoMeshFromBody=mA;

    /* ==== 2. generation sous le solide EXACT (empreinte A) ==== */
    faoOpMovesPurge(); faoMovesReset();
    gen=0;
    const mvF=faoOpMoves(s.ops[0],s);
    const mvR=faoOpMoves(s.ops[1],s);
    A(mvF.length>0,'surfacage genere : '+mvF.length+' pts');
    A(!!mvR,'ebauche 3D generee : '+mvR.length+' pts');
    A(gen===1,'ebauche 3D : 1 seul calcul ('+gen+')');
    A(!!kv[faoMovesIdbKey(s,s.ops[1])],'entree IndexedDB ecrite pour l ebauche');

    /* ==== 3. F5 : le solide est d'abord le REPLI MAILLAGE (empreinte B) ==== */
    faoMeshFromBody=mB;
    faoOpMovesPurge(); faoMovesReset();
    gen=0;
    await faoMovesPreload();
    A(gen===0,'repli : AUCUN calcul ('+gen+')');
    A(faoMovesStat(s.ops[0],s)!==null,'repli : le SURFACAGE est servi (pas de dependance au solide)');
    A(faoMovesStat(s.ops[1],s)===null,'repli : l EBAUCHE 3D pas servie (empreinte fausse)');
    A(faoStaleCount()===1,'repli : 1 seul triangle, celui de l ebauche ('+faoStaleCount()+')');
    A(faoPrevStale===true,'repli : apercu perime -> export bloque, bouton ⚠');

    /* ==== 4. le noyau exact boote : le solide redevient A ==== */
    faoMeshFromBody=mA;
    A(faoMovesSolidChanged()===true,'exact : empreinte du solide changee -> relecture voulue');

    /* ==== 5. fin de rejeu (buildDone) : relecture SEULE, puis vert ==== */
    buildDone();
    await sleep(60);
    A(gen===0,'exact : relecture seule, AUCUN calcul ('+gen+')');
    A(faoMovesSolidChanged()===false,'exact : empreinte suivie (plus de relecture en boucle)');
    A(faoMovesStat(s.ops[1],s)!==null,'exact : l EBAUCHE 3D est servie du cache');
    A(faoStaleCount()===0,'exact : plus aucun triangle ('+faoStaleCount()+')');
    A(faoPrevStale===false,'exact : apercu VALIDE sans rien presser (bouton au vert)');
    A(faoPrevMissing===0,'exact : toutes les traces dessinees ('+faoPrevMissing+' manquant)');
    A(gen===0,'exact : toujours AUCUN calcul ('+gen+')');

    /* ==== 6. le solide change vraiment (edition) : la relecture ne cache rien ==== */
    const mvE=faoOpMoves(s.ops[1],s);   // ecrit sous l'empreinte A
    faoOpMovesPurge(); faoMovesReset();
    faoMeshFromBody=mB;                 // autre solide : entree de A invalide
    gen=0;
    await faoMovesPreload();
    A(gen===0,'edition : AUCUN calcul ('+gen+')');
    A(faoMovesStat(s.ops[1],s)===null,'edition : entree B inexistante, pas de service');
    A(faoStaleCount()===1,'edition : triangle justifie sur l ebauche ('+faoStaleCount()+')');
    A(mvE.length===mvR.length,'edition : meme nombre de points qu a la generation');

    faoOpMovesPurge(); faoMovesReset();
    faoGenRough3DIt=origGI;
    faoMeshFromBody=mA;
    return P;
  })()`,ctx);
  let ko=0;
  out.forEach(function(l){ console.log('  '+(l.indexOf('OK')===0?'✓':'✗')+' '+l.slice(7)); if(l.indexOf('ECHEC')===0)ko++; });
  if(ko){ console.log('\n'+ko+' ECHEC(S)'); process.exit(1); }
  console.log('\nTOUT EST CONFORME');
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
