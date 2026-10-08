// FAO — plans de dégagement/retrait (2026-10-08-002) : résolution des
// références « depuis » + décalage, héritage posage > opération, mode des
// remontées (min5/plan), sanitise, clés de parcours, rapides et G-code.
// Pur logique (aucun OCCT) : aucun rejeu de maillage.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const out=vm.runInContext(`(function(){
    const P=[]; const A=(ok,m)=>P.push((ok?'OK   ':'ECHEC')+' : '+m);
    const leaves=(root)=>{ const t=[]; (function w(n){
      if(n.textContent!==undefined&&!n.children.length)t.push(n.textContent);
      if(n.children)n.children.forEach(w); })(root); return t; };

    // --- 1. résolution des références (brut sert aussi de repli modèle)
    const J=faoDefaultJob(); J.name='PLAN';
    J.stock={x0:0,y0:0,z0:0,x1:100,y1:80,z1:25};
    J.fixture={note:'',radial:5,axial:5,z0:-10,z1:30};
    A(faoPlaneZ({ref:'brutHaut',dz:40},null,J,0)===65,'ref brutHaut+40 = 65');
    A(faoPlaneZ({ref:'brutBas',dz:5},null,J,0)===5,'ref brutBas+5 = 5');
    A(faoPlaneZ({ref:'origine',dz:12},null,J,0)===12,'ref origine+12 = 12');
    A(faoPlaneZ({ref:'bridageHaut',dz:0},null,J,0)===30,'ref bridageHaut = fixture.z1 (30)');
    A(faoPlaneZ({ref:'bridageBas',dz:2},null,J,0)===-8,'ref bridageBas+2 = -8');
    A(faoPlaneZ({ref:'face',fz:60,dz:-5},null,J,0)===55,'ref face 60-5 = 55');
    A(faoPlaneZ({ref:'face',dz:3},null,J,0)===28,'ref face sans fz -> repli dessus brut (25+3)');
    A(faoPlaneZ({ref:'max',s1:{ref:'brutHaut',dz:10},s2:{ref:'origine',dz:48}},null,J,0)===48,'max(brut+10 ; orig+48) = 48');
    A(faoPlaneZ({ref:'min',s1:{ref:'brutHaut',dz:10},s2:{ref:'origine',dz:48}},null,J,0)===35,'min(...) = 35');
    A(faoPlaneZ({ref:'retrait',dz:0},null,J,0)===50,'chaîne dégagement -> retrait hérité (25+25) = 50');
    A(!isFinite(faoPlaneZ({ref:'inconnu'},null,J,0)),'ref inconnue -> NaN (repli appelant)');
    A(!isFinite(faoPlaneZ({ref:'max',s1:{ref:'zzz'},s2:{ref:'yyy'}},null,J,0)),'max sans sous-référence valide -> NaN');
    A(isFinite(faoPlaneZ({ref:'modeleHaut',dz:0},null,J,0)),'ref modeleHaut : résolue (repli brut sans corps)');

    // --- 2. vue effective (héritage legacy traduit en références)
    const eff0=faoPlaneEff(J,null);
    A(eff0.clear.ref==='brutHaut'&&eff0.clear.dz===100,'eff : legacy dégagement = brut+100');
    A(eff0.retr.ref==='brutHaut'&&eff0.retr.dz===25,'eff : legacy retrait = brut+25');
    A(eff0.mode==='min5'&&!eff0.ownClear&&!eff0.ownRetr,'eff : défauts min5 / hérité du posage');
    J.safeZ=90;
    const eff1=faoPlaneEff(J,null);
    A(eff1.clear.ref==='origine'&&eff1.clear.dz===90,'eff : safeZ legacy affiché origine+90');
    delete J.safeZ;

    // --- 3. plans absolus + mode des remontées
    A(faoClearAbs(null,J)===125,'clear abs legacy = 25+100 = 125');
    A(faoRetractAbs(null,J)===50,'retr abs legacy = 25+25 = 50');
    A(faoZoneSecu(null,J)===30,'zoneSecu min5 legacy = min(50 ; 25+5) = 30');
    J.planes={mode:'plan'};
    A(faoZoneSecu(null,J)===50,'mode plan sans plan perso : 50');
    J.planes={retr:{ref:'brutHaut',dz:40},mode:'plan'};
    A(faoZoneSecu(null,J)===65,'mode plan retrait brut+40 : 65 = plan de retrait');
    A(faoZoneSecu(null,J)===faoRetractAbs(null,J),'mode plan : T = plan de retrait (pas de plafond Sortie)');
    J.planes={retr:{ref:'brutHaut',dz:40},mode:'min5'};
    A(faoZoneSecu(null,J)===30,'min5 : retrait brut+40 borné par Sortie -> 30');
    J.planes={retr:{ref:'brutHaut',dz:2},mode:'min5'};
    A(faoZoneSecu(null,J)===27,'min5 : retrait brut+2 -> 27 (> dessus brut)');
    J.planes={retr:{ref:'origine',dz:0},mode:'min5'};
    A(faoZoneSecu(null,J)===25,'min5 : retrait sous brut -> plancher dessus brut 25');
    J.planes={retr:{ref:'origine',dz:0},mode:'plan'};
    A(faoZoneSecu(null,J)===25,'mode plan : plancher dessus brut 25');
    delete J.planes;

    // --- 4. héritage posage > opération (le plan touché seul est propre)
    J.planes={clear:{ref:'brutHaut',dz:10}};
    const OP={type:'pocket',x0:10,y0:10,x1:90,y1:70,ztop:25,zbot:5,ap:10,ae:5};
    A(faoClearAbs(OP,J)===35,'op hérite clear du posage = 35');
    OP.planes={clear:{ref:'brutHaut',dz:50}};
    A(faoClearAbs(OP,J)===75,'op écrase clear = 75');
    A(faoClearAbs(null,J)===35,'posage intact quand l’op écrète');
    OP.planes={retr:{ref:'origine',dz:8}};
    A(faoRetractAbs(OP,J)===8,'op retrait propre = 8');
    A(faoClearAbs(OP,J)===35,'clear toujours hérité du posage');
    A(faoRetractAbs(null,J)===50,'sans op : retrait legacy 50');
    delete OP.planes; delete J.planes;

    // --- 5. sanitise : forme normalisée sinon SUPPRIMÉ (repli legacy)
    const S=faoDefaultSetup(); S.stock={x0:0,y0:0,z0:0,x1:100,y1:80,z1:25};
    S.planes={clear:{ref:'brutHaut',dz:10},retr:{ref:'retrait',dz:5},mode:'plan',junk:1};
    S.fixture={note:'',radial:5,axial:5,z0:'bas',z1:30};
    faoSanitiseOps(S);
    A(S.planes&&S.planes.clear&&S.planes.clear.dz===10,'sanitise : clear valide conservé');
    A(S.planes&&!S.planes.retr,'sanitise : ref « retrait » interdite en retrait -> retirée');
    A(S.planes&&S.planes.mode==='plan','sanitise : mode plan conservé');
    A(S.planes&&S.planes.junk===undefined,'sanitise : clé inconnue retirée');
    A(S.fixture&&S.fixture.z0===undefined&&S.fixture.z1===30,'sanitise : fixture z0 invalide retiré, z1 gardé');
    S.planes={clear:{ref:'max',s1:{ref:'brutHaut',dz:5},s2:{ref:'face'}}};
    faoSanitiseOps(S);
    A(!S.planes,'sanitise : max sans fz -> plans supprimés (repli legacy)');
    S.planes={clear:{ref:'max',s1:{ref:'brutHaut',dz:5},s2:{ref:'face',fz:60,dz:0}}};
    faoSanitiseOps(S);
    A(S.planes&&S.planes.clear.ref==='max'&&S.planes.clear.s2.fz===60,'sanitise : max valide (fz) conservé');
    S.planes={mode:'troco'}; faoSanitiseOps(S);
    A(!S.planes,'sanitise : mode inconnu -> planes supprimé');
    S.ops=[{type:'pocket',planes:{clear:{ref:'face'}}}];
    faoSanitiseOps(S);
    A(S.ops[0].id&&!S.ops[0].planes,'sanitise : plan op sans fz -> champ supprimé (héritage retrouvé)');
    delete S.ops; delete S.planes;

    // --- 6. clés de parcours : un plan changé pèse sur la trajectoire
    const K1=faoOpMovesKey(OP,J);
    OP.planes={clear:{ref:'brutHaut',dz:10}};
    const K2=faoOpMovesKey(OP,J);
    OP.planes={clear:{ref:'brutHaut',dz:11}};
    const K3=faoOpMovesKey(OP,J);
    A(!!K1&&!!K2&&!!K3&&K1!==K2&&K2!==K3,'sig : plan d’op = clé de parcours différente');
    delete OP.planes;
    J.planes={clear:{ref:'brutHaut',dz:10}};
    const K4=faoOpMovesKey(OP,J);
    J.planes={clear:{ref:'brutHaut',dz:12}};
    const K5=faoOpMovesKey(OP,J);
    A(!!K4&&!!K5&&K4!==K5,'sig : plan du posage = clé de parcours différente');
    delete J.planes;

    // --- 7. rapides normalisés + G-code : plan de dégagement par opération
    J.ops=[
      {type:'facing',z:25,ae:6,toolId:'T1'},
      {type:'pocket',x0:10,y0:10,x1:90,y1:70,ztop:25,zbot:5,ap:10,ae:5,toolId:'T2'}
    ];
    let SEQ=faoSeqSafe(J), maxRap=-Infinity;
    SEQ.forEach(s=>s.moves.forEach(m=>{ if(m.r&&isFinite(m.z))maxRap=Math.max(maxRap,m.z); }));
    A(maxRap===125,'séquence legacy : rapides au plan dégagement 125 (vu '+maxRap+')');
    J.planes={clear:{ref:'brutHaut',dz:10}};
    SEQ=faoSeqSafe(J); maxRap=-Infinity;
    SEQ.forEach(s=>s.moves.forEach(m=>{ if(m.r&&isFinite(m.z))maxRap=Math.max(maxRap,m.z); }));
    A(maxRap===35,'séquence : rapides au plan dégagement 35 (vu '+maxRap+')');
    const s630=faoPost(J,'siemens630');
    A(s630.code.indexOf('G0 Z10.000')>=0,'post : tête G0 = dégagement 35-25 = Z10');
    A(s630.code.indexOf('G0 Z25.000')>=0,'post : retrait inter-outils legacy 50-25 = Z25');
    A((s630.warns||[]).length===0,'post : aucune alerte');
    J.planes={clear:{ref:'brutHaut',dz:10},retr:{ref:'brutHaut',dz:40},mode:'plan'};
    const sPlan=faoPost(J,'siemens630');
    A(sPlan.code.indexOf('G0 Z40.000')>=0,'post mode plan : retrait inter-outils 65-25 = Z40');
    A(sPlan.code.indexOf('G0 Z10.000')>=0,'post mode plan : tête inchangée (plan dégagement)');
    A(faoRetractAbs(null,J)===65,'mode plan : retrait absolu 65');
    delete J.planes;

    // --- 8. perçage : RTP du cycle = plan d’usinage (T) de l’opération
    J.ops=[{type:'drill',pts:[[20,20],[80,60]],ztop:25,zbot:5,toolId:'T1'}];
    A(faoDrillCycle(J.ops[0],J,25).RTP===5,'cycle legacy RTP = 30-25 = 5');
    J.planes={retr:{ref:'brutHaut',dz:40},mode:'plan'};
    A(faoDrillCycle(J.ops[0],J,25).RTP===40,'cycle mode plan RTP = 65-25 = 40');
    J.planes={mode:'min5'};
    A(faoDrillCycle(J.ops[0],J,25).RTP===5,'cycle min5 RTP = 5 (plafond Sortie)');
    delete J.planes;

    // --- 9. fiche posage : libellés 2026-10-08-002
    const pc=document.createElement('div');
    faoSetupFiche(pc,faoDoc());
    const pt=leaves(pc), has=(t)=>pt.indexOf(t)>=0;
    A(has('Dégagement')&&has('Retrait')&&has('Remontées'),'fiche posage : « Dégagement » / « Retrait » / « Remontées »');
    A(!has('Plan Z'),'fiche posage : ancien libellé « Plan Z » retiré');
    A(pt.some(t=>t.indexOf('Plan retrait ou +5')>=0),'fiche posage : option remontées « Plan retrait ou +5 »');
    A(pt.some(t=>t.indexOf('Toujours plan de retrait')>=0),'fiche posage : option remontées « plan de retrait »');
    A(has('Br. Z0')&&has('Z1'),'fiche posage : bornes de bridage Z0/Z1');
    A(has('= 125.00')&&has('= 50.00'),'fiche posage : valeurs héritées 125.00 / 50.00');

    // --- 10. fiche opération : section « Plans » + bouton héritage
    const st=faoSetup();
    st.ops=[{type:'pocket',x0:10,y0:10,x1:90,y1:70,ztop:25,zbot:5,ap:10,ae:5}];
    faoSanitiseOps(st);
    let card=null, cardErr=null;
    try{ card=faoOpCardElement(st,st.ops[0],0); }catch(e){ cardErr=String((e&&e.message)||e); }
    A(!cardErr,'fiche op : construction sans exception'+(cardErr?' ('+cardErr+')':''));
    if(card){
      const ot=leaves(card), oh=(t)=>ot.indexOf(t)>=0;
      A(oh('Plans'),'fiche op : titre « Plans »');
      A(oh('Dégagement')&&oh('Retrait'),'fiche op : rangées Dégagement / Retrait');
      A(oh('= 125.00')&&oh('= 50.00'),'fiche op : valeurs héritées affichées 125.00 / 50.00');
      A(!oh('Hériter du posage'),'fiche op : pas de bouton héritage tant que rien n’est écrêté');
      st.ops[0].planes={retr:{ref:'brutHaut',dz:40}};
      const card2=faoOpCardElement(st,st.ops[0],0);
      const o2=leaves(card2);
      A(o2.indexOf('Hériter du posage')>=0,'fiche op : bouton « Hériter du posage » dès plan propre');
      A(o2.some(t=>t.indexOf('= 65.00')>=0),'fiche op : retrait propre affiché 65.00');
      A(o2.some(t=>t.indexOf('= 125.00')>=0),'fiche op : dégagement toujours hérité 125.00');
      st.ops[0].planes={clear:{ref:'max',s1:{ref:'brutHaut',dz:5},s2:{ref:'origine',dz:15}}};
      const card3=faoOpCardElement(st,st.ops[0],0);
      const o3=leaves(card3);
      A(o3.some(t=>t.indexOf('= 30.00')>=0),'fiche op : plan max résolu = 30.00 (max 30 ; 15)');
      A(o3.indexOf('· 1re')>=0&&o3.indexOf('· 2e')>=0,'fiche op : sous-références 1re/2e pour max');
    }

    if(P.length&&P.some(l=>l.indexOf('ECHEC')===0)){}
    return P;
  })()`,ctx);
  let ko=0;
  out.forEach(function(l){ console.log('  '+(l.indexOf('OK')===0?'✓':'✗')+' '+l.slice(7)); if(l.indexOf('ECHEC')===0)ko++; });
  if(ko){ console.log('\n'+ko+' ECHEC(S)'); process.exit(1); }
  console.log('\nTOUT EST CONFORME ('+out.length+' vérifications)');
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
