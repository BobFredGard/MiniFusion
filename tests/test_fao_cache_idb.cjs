// FAO — cache PERSISTANT des parcours (IndexedDB) :
//  · les trajectoires ne sont PAS dans le modèle (71 Ko -> 7,9 Mo, autosave 5 Mo) :
//    une entree PAR OPERATION dans IndexedDB, reecrite a chaque generation ;
//  · une entree n'est servie que si sa cle est EXACTEMENT la bonne ET si la version
//    du code est la meme — sinon on recalcule, comme avant ;
//  · la cle s'appuie sur une EMPREINTE DU SOLIDE (et non faoBodyGen, compteur de
//    session) : c'est ce qui rend la lecture possible au rechargement.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const out=await vm.runInContext(`(async function(){
    const P=[]; const A=(ok,m)=>P.push((ok?'OK   ':'ECHEC')+' : '+m);

    /* ============ 0. sans IndexedDB ============ */
    A(faoMovesReady()===false,'sans indexedDB : cache persistant simplement désactivé');

    const s=faoDefaultSetup();
    s.id='pos1';
    s.stock={x0:0,y0:0,z0:0,x1:100,y1:80,z1:25};
    s.tools=[{id:'T1',num:1,name:'Fraise D10',kind:'flat',d:10,cornerR:0,flutes:2,vc:250,fz:0.06}];
    s.ops=[{id:'opP',on:true,toolId:'T1',type:'pocket',x0:5,y0:5,x1:95,y1:75,ztop:25,zbot:5,ap:8,ae:5}];
    doc.fao={setups:[s],activeSetupId:s.id};
    faoPrevOn=true;
    faoOpMovesPurge(); faoMovesReset();

    /* ============ 1. IndexedDB simulate ============ */
    const kv={};
    try{ indexedDB={open:function(){ return {}; }}; }catch(e){}
    idbSet=function(k,v){ kv[k]=v; return Promise.resolve(); };
    idbGet=function(k){ return Promise.resolve(
      Object.prototype.hasOwnProperty.call(kv,k)?kv[k]:undefined); };
    A(faoMovesReady()===true,'indexedDB present : cache persistant actif');

    const origGen=faoGenPocket; let gen=0;
    const count=function(){ gen=0; faoGenPocket=function(){ gen++; return origGen.apply(this,arguments); }; };
    const uncount=function(){ faoGenPocket=origGen; };

    const mv1=faoOpMoves(s.ops[0],s);
    const idbKey=faoMovesIdbKey(s,s.ops[0]);
    const ck1=faoOpMovesKey(s.ops[0],s);
    A(mv1.length>0,'generation : '+mv1.length+' points');
    A(!!kv[idbKey],'parcours écrits dans IndexedDB sous « '+idbKey+' »');
    A(kv[idbKey]&&kv[idbKey].v===1,'entree format v=1');
    A(kv[idbKey]&&kv[idbKey].ver===APP_VER,'entree versionnee '+APP_VER);
    A(kv[idbKey]&&kv[idbKey].k===ck1,'entree = cle de cache exacte');
    A(kv[idbKey]&&kv[idbKey].mv===mv1,'entree = parcours memorises');

    /* ============ 2. reouverture : LECTURE, pas de recalcul ============ */
    faoOpMovesPurge();                 // « nouveau navigateur » : cache memoire vide
    faoMovesReset();
    A(!faoOpMovesHit(s.ops[0]),'cache memoire vide');
    const n2=await faoMovesPreload();
    A(n2===1,'preload : 1 operation restauree ('+n2+')');
    count();
    const mv2=faoOpMoves(s.ops[0],s);
    uncount();
    A(gen===0,'réouverture : AUCUN recalcul ('+gen+' appel du générateur)');
    A(mv2===kv[idbKey].mv,'parcours servis depuis IndexedDB (même tableau)');

    /* ============ 3. version du code differente ============ */
    const mvPrec=kv[idbKey].mv;      // tracé PRESENTement en base, avant rejet
    kv[idbKey].ver='0000-00-00-000';
    faoOpMovesPurge(); faoMovesReset();
    const n3=await faoMovesPreload();
    A(n3===0,'version differente : entree REFUSEE ('+n3+')');
    count(); faoOpMoves(s.ops[0],s); uncount();
    A(gen===1,'version differente : on recalcule ('+gen+')');
    A(faoOpMoves(s.ops[0],s)!==mvPrec,'version differente : nouveau tableau (pas celui en base)');
    kv[idbKey].ver=APP_VER;

    /* ============ 4. cle differente (parametre modifie) ============ */
    const mvPrec4=kv[idbKey].mv;
    kv[idbKey].k='CLE-DE-TEST';
    faoOpMovesPurge(); faoMovesReset();
    const n4=await faoMovesPreload();
    A(n4===0,'cle differente : entree REFUSEE ('+n4+')');
    count(); const mv4=faoOpMoves(s.ops[0],s); uncount();
    A(gen===1,'cle differente : on recalcule ('+gen+')');
    A(mv4!==mvPrec4,'cle differente : on ne sert PAS l ancien tracé');

    /* ============ 5. UNE entree par operation (pas de garbage) ============ */
    const nb0=Object.keys(kv).length;
    s.ops[0].x0=8;
    faoChanged();
    faoPreviewGenerate();
    faoPreviewGenerate();
    A(faoStaleCount()===0,'regen OK');
    A(Object.keys(kv).length===nb0,
      'toujours '+nb0+' entree(s) dans IndexedDB ('+Object.keys(kv).length+') — reecrite, jamais dupliquee');
    A(kv[idbKey]&&kv[idbKey].k===faoOpMovesKey(s.ops[0],s),'entree mise a jour = derniere generation');

    /* ============ 6. retour sans IndexedDB ============ */
    try{ indexedDB=undefined; }catch(e){}
    A(faoMovesReady()===false,'indexedDB retire : tout continue de fonctionner');
    faoOpMovesPurge();
    A(faoOpMoves(s.ops[0],s).length>0,'generation sans IDB inchangee');

    /* ============ 7. EMPREINTE DU SOLIDE ============ */
    bodies.length=0;
    bodies.push({id:'b1',name:'Corps 1',visible:true,ghost:false});
    faoMeshFromBody=function(){ return {v:[[0,0,0],[10,0,0],[0,10,0]],t:[[0,1,2]]}; };
    const fp1=faoSetupFp(s);
    A(fp1!=='nb','empreinte du solide = '+fp1);
    faoMovesFpMap=null;                 // « nouveau navigateur » : memoire d empreinte purgee
    const fp2=faoSetupFp(s);
    A(fp2===fp1,'empreinte IDENTIQUE entre deux sessions ('+fp2+')');
    faoMovesFpMap=null;
    faoMeshFromBody=function(){ return {v:[[0,0,0],[20,0,0],[0,20,0]],t:[[0,1,2]]}; };
    const fp3=faoSetupFp(s);
    A(fp3!==fp1,'maillage different -> empreinte differente ('+fp3+')');

    /* ============ 8. la cle suit l'empreinte, SAUF hors 3D ============ */
    faoMovesFpMap=null;
    faoMeshFromBody=function(){ return {v:[[0,0,0],[10,0,0],[0,10,0]],t:[[0,1,2]]}; };
    const opR={id:'r1',on:true,toolId:'T1',type:'rough3d',ztop:25,zbot:0,ap:4,ae:4};
    const kR1=faoOpMovesKey(opR,s);
    const kF1=faoOpMovesKey(s.ops[0],s);
    faoMovesFpMap=null;
    faoMeshFromBody=function(){ return {v:[[0,0,0],[20,0,0],[0,20,0]],t:[[0,1,2]]}; };
    const kR2=faoOpMovesKey(opR,s);
    const kF2=faoOpMovesKey(s.ops[0],s);
    A(kR1!==kR2,'ebauche 3D : la cle DEPEND de l empreinte du solide');
    A(kF1===kF2,'2.5D : la cle ne depend PAS du solide (composante \"0\")');
    A(String(kF1).indexOf('0|')===0,'cle 2.5D sans composante corps : '+String(kF1).slice(0,40));

    /* ============ 9. faoBodyGen n influe plus sur la cle ============ */
    faoMovesFpMap=null;
    faoMeshFromBody=function(){ return {v:[[0,0,0],[10,0,0],[0,10,0]],t:[[0,1,2]]}; };
    const kF3=faoOpMovesKey(s.ops[0],s);
    const g0=faoBodyGen; faoBodyGen=g0+7;
    const kF4=faoOpMovesKey(s.ops[0],s);
    faoBodyGen=g0;
    A(kF3===kF4,'compteur de session faoBodyGen ignore par la cle');

    uncount();
    return P;
  })()`,ctx);
  let ko=0;
  out.forEach(function(l){ console.log('  '+(l.indexOf('OK')===0?'✓':'✗')+' '+l.slice(7)); if(l.indexOf('ECHEC')===0)ko++; });
  if(ko){ console.log('\n'+ko+' ECHEC(S)'); process.exit(1); }
  console.log('\nTOUT EST CONFORME');
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
