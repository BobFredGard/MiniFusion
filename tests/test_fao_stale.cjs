// FAO — « calculer puis valider » : dès qu'un paramètre change, l'aperçu et le
// programme sont périmés (faoPrevStale) ; le bouton « Générer + aperçu » le
// signale, l'export est BLOQUÉ, et « Générer + aperçu » re-valide.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=[];
  const out=vm.runInContext(`(function(){
    const P=[]; const A=(ok,m)=>P.push((ok?'OK   ':'ECHEC')+' : '+m);
    // refs réelles (la lecture par id est ambiguë sous stub DOM)
    const gen=function(){ return (typeof faoGenBtnEl!=='undefined'&&faoGenBtnEl)?faoGenBtnEl:document.getElementById('faoGenBtn'); };
    const exp=function(){ return (typeof faoExportBtnEl!=='undefined'&&faoExportBtnEl)?faoExportBtnEl:document.getElementById('faoExportBtn'); };

    // --- état initial : aperçu valide, export ouvert
    faoPrevStale=false; faoStaleUI();
    A(faoPrevStale===false,'état initial : aperçu valide');
    A(gen().textContent.indexOf('T')===0,'état initial : bouton « Tout régénérer » : '+JSON.stringify(gen().textContent));
    A(exp().disabled===false,'état initial : export ouvert');

    // --- toute modification pèrimé l'aperçu
    faoChanged();
    A(faoPrevStale===true,'faoChanged() : aperçu périmé');
    A(gen().textContent.charCodeAt(0)===0x26a0,'bouton signale ⚠ : '+JSON.stringify(gen().textContent));
    A(exp().disabled===true,'bouton export grisé');

    // --- l'export est refusé
    try{ faceEl.textContent=''; }catch(e){}
    faoExport();
    const msg=(typeof faceEl!=='undefined'&&faceEl)?String(faceEl.textContent||''):'';
    A(msg.indexOf('bloqu')>=0,'export bloqué : '+JSON.stringify(msg));

    // --- le G-code reste calculable (seul l'EXPORT est bloqué)
    const job=faoDefaultJob(); job.name='STALE';
    job.stock={x0:0,y0:0,z0:0,x1:100,y1:80,z1:25};
    job.ops=[{type:'pocket',x0:10,y0:10,x1:90,y1:70,ztop:25,zbot:5,ap:10,ae:5}];
    const code=faoPost(job).code;
    A(code&&code.length>500,'faoPost reste disponible même périmé ('+code.length+' car.)');

    // --- « Tout régénérer » re-valide
    faoPreviewGenerate();
    A(faoPrevStale===false,'faoPreviewGenerate() : aperçu re-validé');
    A(gen().textContent.indexOf('T')===0,'bouton redevenu « Tout régénérer » : '+JSON.stringify(gen().textContent));
    A(exp().disabled===false,'export ré-ouvert');

    // --- l'export n'est plus refusé (il ne déclenche plus le message de blocage)
    try{ faceEl.textContent=''; }catch(e){}
    faoExport();
    const msg2=(typeof faceEl!=='undefined'&&faceEl)?String(faceEl.textContent||''):'';
    A(msg2.indexOf('bloqu')<0,'export débloqué après régénération : '+JSON.stringify(msg2));

    // --- un nouvel edit re-bloque
    faoChanged();
    A(faoPrevStale===true&&exp().disabled===true,'un nouvel edit re-bloque l export');
    faoPreviewGenerate();
    A(faoPrevStale===false,'nettoyage final');
    return P;
  })()`,ctx);
  let ko=0;
  out.forEach(function(l){ console.log('  '+(l.indexOf('OK')===0?'✓':'✗')+' '+l.slice(7)); if(l.indexOf('ECHEC')===0)ko++; });
  if(ko){ console.log('\n'+ko+' ECHEC(S)'); process.exit(1); }
  console.log('\nTOUT EST CONFORME');
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
