// FAO — rafraîchissement des parcours :
//  · modifier un OUTIL (ou un paramètre) ne recalcule rien sur-le-champ, il marque
//    « à régénérer » la SEULE opération concernée (triangle ⚠) ;
//  · cliquer sur ce triangle ne régénère QUE l'opération du triangle ;
//  · « Générer + aperçu » régénère TOUT, à la demande (purge du cache) ;
//  · la lecture usinage taille la matière en INCRÉMENTAL (plus jamais 0 → t :
//    en O(i) l'ébauche 3D devenait intenable alors que le surfaçage passait).
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const out=vm.runInContext(`(function(){
    const P=[]; const A=(ok,m)=>P.push((ok?'OK   ':'ECHEC')+' : '+m);
    const gen=function(){ return (typeof faoGenBtnEl!=='undefined'&&faoGenBtnEl)?faoGenBtnEl:document.getElementById('faoGenBtn'); };
    const exp=function(){ return (typeof faoExportBtnEl!=='undefined'&&faoExportBtnEl)?faoExportBtnEl:document.getElementById('faoExportBtn'); };
    // Le stub DOM n'implémente PAS innerHTML='' (faoRenderTree l'utilise pour
    // vider l'arbre) : on vide les enfants à la main avant chaque rendu.
    const renderTree=function(){
      const t=document.getElementById('faoTree');
      if(t&&t.children)t.children.length=0;
      faoRenderTree();
    };
    const walk=function(node,fn){ if(!node)return; fn(node);
      if(node.children)node.children.forEach(function(c){ walk(c,fn); }); };
    const countIcon=function(){
      let n=0; walk(document.getElementById('faoTree'),function(x){ if(x.className==='stalei')n++; }); return n;
    };
    const theIcon=function(){
      let f=null; walk(document.getElementById('faoTree'),function(x){ if(x.className==='stalei')f=x; }); return f;
    };

    /* ============ 1. document à 2 ops / 2 outils ============ */
    const s=faoDefaultSetup();
    s.stock={x0:0,y0:0,z0:0,x1:100,y1:80,z1:25};
    s.tools=[{id:'T1',num:1,name:'Fraise D10',kind:'flat',d:10,cornerR:0,flutes:2,vc:250,fz:0.06},
             {id:'T2',num:2,name:'Fraise D6',kind:'flat',d:6,cornerR:0,flutes:2,vc:250,fz:0.06}];
    s.ops=[{id:'opA',on:true,toolId:'T1',type:'facing',z:25,ae:6},
           {id:'opB',on:true,toolId:'T2',type:'pocket',x0:10,y0:10,x1:90,y1:70,ztop:25,zbot:5,ap:10,ae:5}];
    doc.fao={setups:[s],activeSetupId:s.id};
    faoPrevOn=true;
    renderTree();
    faoPreviewGenerate();
    const mvA0=faoOpMoves(s.ops[0],s), mvB0=faoOpMoves(s.ops[1],s);
    A(faoPrevStale===false&&faoStaleCount()===0,'départ : tout est à jour ('+faoStaleCount()+' à régénérer)');
    A(exp().disabled===false,'départ : export ouvert');
    A(countIcon()===0,'départ : aucun triangle ('+countIcon()+')');

    /* ============ 2. modification d'un OUTIL = une seule opération ============ */
    s.tools[0].d=25;
    faoChanged();
    A(s.ops[0].stale===true,'outil T1 modifié -> opA (T1) à régénérer');
    A(s.ops[1].stale===false,'outil T1 modifié -> opB (T2) INTACTE (un seul triangle)');
    A(faoStaleCount()===1,'compteur = 1 ('+faoStaleCount()+')');
    A(faoPrevStale===true,'faoChanged : aperçu périmé');
    A(faoOpMoves(s.ops[0],s)===mvA0,'PAS de régénération éager : l’ancien tracé est servi');
    A(faoOpMoves(s.ops[1],s)===mvB0,'opB inchangée (même tableau)');
    A(gen().textContent.charCodeAt(0)===0x26a0,'bouton signale ⚠ : '+JSON.stringify(gen().textContent));
    A(exp().disabled===true,'export bloqué tant que périmé');
    renderTree();
    A(countIcon()===1,'arbre : 1 seul triangle ⚠ ('+countIcon()+')');
    const ic=theIcon();
    A(ic&&typeof ic.onclick==='function','le triangle est cliquable');

    /* ============ 3. clic sur le triangle = CETTE opération uniquement ============ */
    ic.onclick({stopPropagation:function(){}});
    A(s.ops[0].stale===false,'triangle : opA régénérée');
    A(s.ops[1].stale===false,'triangle : opB toujours fraîche');
    const mvA1=faoOpMoves(s.ops[0],s);
    A(mvA1!==mvA0,'triangle : opA recalculée (nouveau tableau)');
    A(JSON.stringify(mvA1)!==JSON.stringify(mvA0),
      'triangle : nouveau tracé pour D25 ('+mvA0.length+' -> '+mvA1.length+' points)');
    A(faoOpMoves(s.ops[1],s)===mvB0,'triangle : opB NON recalculée (même tableau)');
    A(faoStaleCount()===0&&faoPrevStale===false,'triangle : plus rien à régénérer');
    A(gen().textContent.indexOf('T')===0,'bouton redevenu « Tout régénérer » : '+JSON.stringify(gen().textContent));
    A(exp().disabled===false,'export ré-ouvert');
    renderTree();
    A(countIcon()===0,'arbre : triangle effacé ('+countIcon()+')');

    /* ============ 4. paramètre d'une opération : elle seule ============ */
    s.ops[1].x0=20;
    faoChanged();
    A(s.ops[1].stale===true,'paramètre opB -> opB à régénérer');
    A(s.ops[0].stale===false,'paramètre opB -> opA INTACTE (clé réduite à l’opération)');
    A(faoStaleCount()===1,'compteur = 1 ('+faoStaleCount()+')');
    A(faoOpMoves(s.ops[1],s)===mvB0,'PAS de régénération éager sur opB (ancien tracé servi)');
    A(faoOpMoves(s.ops[0],s)===mvA1,'opA toujours sur son tracé');
    renderTree();
    A(countIcon()===1,'arbre : 1 triangle sur opB ('+countIcon()+')');

    /* ============ 5. « Générer + aperçu » = TOUT ============ */
    faoPreviewGenerate();
    const mvA2=faoOpMoves(s.ops[0],s), mvB2=faoOpMoves(s.ops[1],s);
    A(s.ops[0].stale===false&&s.ops[1].stale===false,'tout régénéré : plus rien de périmé');
    A(mvB2!==mvB0,'bouton : opB recalculée (purge du cache)');
    A(JSON.stringify(mvB2)!==JSON.stringify(mvB0),'bouton : opB nouveau tracé avec x0=20');
    A(mvA2!==mvA1,'bouton : opA RECALCULÉE elle aussi (tout, même à jour)');
    A(JSON.stringify(mvA2)===JSON.stringify(mvA1),'bouton : opA, contenu strictement identique');
    A(faoPrevStale===false&&faoStaleCount()===0,'bouton : aperçu validé');
    A(exp().disabled===false,'export ouvert');
    renderTree();
    A(countIcon()===0,'arbre : aucun triangle ('+countIcon()+')');

    /* ============ 6. masquer les traces ne périmie rien ============ */
    s.ops[0].hidden=true;
    faoChanged();
    A(s.ops[0].stale===false&&s.ops[1].stale===false,'op.hidden ne périmie aucun parcours');
    s.ops[0].hidden=false;
    faoChanged();
    A(faoStaleCount()===0,'toujours à jour');

    /* ============ 7. lecture usinage : taille INCRÉMENTAL ============ */
    const N=6000, pts=[], dd=[], times=[];
    let tt=0;
    for(let i=0;i<N;i++){ pts.push({x:(i%100)*0.8,y:Math.floor(i/100)*0.8,z:15,r:0}); dd.push(10); times.push(tt); tt+=0.01; }
    const tEnd=times[N-1];
    const GX={x0:0,y0:0,z0:0,x1:100,y1:80,z1:25};
    const mkVw=function(g){
      const nc=g.nx*g.ny;
      const vw={matterOn:true,matter:{geometry:{attributes:{position:{needsUpdate:false}}}},
        matterGrid:g,mTops:new Float32Array(nc),mArr:new Float32Array((nc*30+6)*3),
        mPos:null,pts:pts,dd:dd,times:times,t:0};
      for(let c=0;c<nc;c++)vw.mTops[c]=g.full;
      return vw;
    };
    // 7a) équivalence : pas-à-pas 0 -> T == CarveTo(0 -> T)
    const gA=faoMatterGrid(GX,1), gB=faoMatterGrid(GX,1);
    const vwA=mkVw(gA);
    faoMatterCarveTo(gB,pts,dd,times,tEnd,[]);
    for(let i=1;i<N;i++){
      vwA.t=times[i];
      faoViewerMatterStep(vwA,{x:pts[i].x,y:pts[i].y,z:pts[i].z,i:i,r:false});
    }
    let diff=0;
    for(let c=0;c<gA.h.length;c++) if(Math.abs(gA.h[c]-gB.h[c])>1e-6) diff++;
    A(diff===0,'incrémental == CarveTo : Z-map identique ('+diff+' colonnes différentes)');
    A(vwA.mPos&&vwA.mPos.i===N-1,'mPos suit l’index ('+(vwA.mPos?vwA.mPos.i:'-')+')');

    // 7b) coût : 20 frames en FIN de parcours ne doivent PAS re-parcourir 6000 pts
    const gC=faoMatterGrid(GX,1), vwC=mkVw(gC);
    vwC.t=times[N-100];
    faoViewerMatterStep(vwC,{x:pts[N-100].x,y:pts[N-100].y,z:15,i:N-100,r:false}); // rattrapage initial
    const orig=faoMatterCarveSeg; let calls=0;
    faoMatterCarveSeg=function(){ calls++; return orig.apply(this,arguments); };
    for(let k=1;k<=20;k++){
      const i=N-100+k;
      vwC.t=times[i];
      faoViewerMatterStep(vwC,{x:pts[i].x,y:pts[i].y,z:15,i:i,r:false});
    }
    faoMatterCarveSeg=orig;
    A(calls<=40,'20 frames en fin de parcours : '+calls+' carves (attendu ≤ 40, avant ≈ 118 000)');

    // 7c) retour arrière : pas de re-taille depuis 0
    const gD=faoMatterGrid(GX,1), vwD=mkVw(gD);
    vwD.t=times[500];
    faoViewerMatterStep(vwD,{x:pts[500].x,y:pts[500].y,z:15,i:500,r:false});
    const o2=faoMatterCarveSeg; let c2=0;
    faoMatterCarveSeg=function(){ c2++; return o2.apply(this,arguments); };
    vwD.t=times[100];
    faoViewerMatterStep(vwD,{x:pts[100].x,y:pts[100].y,z:15,i:100,r:false});
    faoMatterCarveSeg=o2;
    A(c2===0,'retour arrière : aucune taille ('+c2+' carve)');

    return P;
  })()`,ctx);
  let ko=0;
  out.forEach(function(l){ console.log('  '+(l.indexOf('OK')===0?'✓':'✗')+' '+l.slice(7)); if(l.indexOf('ECHEC')===0)ko++; });
  if(ko){ console.log('\n'+ko+' ECHEC(S)'); process.exit(1); }
  console.log('\nTOUT EST CONFORME');
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
