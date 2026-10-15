// 2026-10-15-010 : fiches outils + conditions de coupe par opération.
// Demande : « piloter la vitesse de rotation et l'avance par outil et par opération
// (onglet Outil) ; page outil plus grande, liste à gauche, paramètres à droite ;
// taille, zone de coupe, dégagement, longueur sous mandrin ; S et avances travail,
// plongée, remontée, rapide. Modifier l'outil dans l'opération ne touche pas sa fiche ;
// par défaut on prend les valeurs de la fiche au choix de l'outil. »
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};",
    "const all=function(root){const o=[];(function w(n){o.push(n);(n.children||[]).forEach(w);})(root);return o;};",
    "const job=faoDefaultJob();job.name='OUT';job.stock={x0:0,y0:0,z0:0,x1:100,y1:80,z1:25};",
    "job.ops=[{id:'oA',type:'pocket',toolId:'T1',x0:10,y0:10,x1:90,y1:70,ztop:25,zbot:15,ap:5,ae:5},",
    "         {id:'oB',type:'pocket',toolId:'T1',x0:20,y0:20,x1:80,y1:60,ztop:15,zbot:10,ap:5,ae:5}];",
    "faoSanitiseOps(job);",
    "const T1=faoToolById(job,'T1');",
    // ── 1. héritage : sans surcharge, l'opération prend la fiche
    "const base=faoToolSF(T1,job);let C=faoOpCutting(job.ops[0],job);",
    "A(C.s===base.s&&C.f===base.f&&C.plunge===base.plunge&&C.src.s==='fiche','1a : sans surcharge, S/F/plongée = fiche (S'+C.s+' F'+C.f+')');",
    "A(C.entry===C.f&&C.retract===C.f&&C.rapid===faoRapide(job),'1b : entrée = remontée = F travail, rapide = posage');",
    // G-code par défaut : une seule S, F historique
    "const g0=faoPost(job,'siemens630').code;",
    "A((g0.match(/\\nS\\d/g)||[]).length===1,'1c : G-code par défaut : une seule S pour l\\u2019outil');",
    // ── 2. surcharge dans l'opération : ne touche PAS la fiche
    "const vc0=T1.vc,fz0=T1.fz;",
    "job.ops[1].cut={s:9000,f:1500,fPl:300,fRet:2500};",
    "C=faoOpCutting(job.ops[1],job);",
    "A(C.s===9000&&C.f===1500&&C.plunge===300&&C.retract===2500&&C.src.s==='op','2a : surcharges de l\\u2019opération appliquées');",
    "A(C.entry===base.f&&C.src.entry==='fiche','2b : champ non surchargé → fiche');",
    "A(T1.vc===vc0&&T1.fz===fz0&&!T1.fPl&&!T1.fRet,'2c : la fiche outil reste inchangée');",
    "const g1=faoPost(job,'siemens630').code;",
    "A(/\\nS9000\\n/.test(g1),'2d : G-code : changement de S entre les 2 opérations du même outil');",
    "A(/F1500\\.0/.test(g1)&&/F300\\.0/.test(g1),'2e : G-code : F travail et F plongée de l\\u2019opération');",
    "const iB=g1.indexOf('\\nS9000');A(iB>0&&g1.slice(0,iB).indexOf('F1500.0')<0,'2f : avances surchargées seulement APRÈS le changement d\\u2019opération');",
    // ── 3. fiche modifiée : se propage aux opérations NON surchargées
    "T1.fPl=222;",
    "A(faoOpCutting(job.ops[0],job).plunge===222&&faoOpCutting(job.ops[1],job).plunge===300,'3a : F plongée de la fiche → op A (héritée), pas op B (surchargée)');",
    "delete T1.fPl;",
    // ── 4. changer d'outil dans l'opération : reprend SA fiche
    "const S=faoSetup();S.tools=job.tools;S.ops=job.ops;",
    "const card=faoOpCardElement(S,job.ops[1],1);",
    "const tabs=all(card).filter(n=>/^fao-tab/.test(n.className||'')).map(n=>n.textContent);",
    "A(tabs.indexOf('Outil')>=0,'4a : la fiche d\\u2019opération a un onglet Outil ('+tabs.join('|')+')');",
    "const sels=all(card).filter(n=>n.tagName==='SELECT');",
    "const tsel=sels.find(s=>/Outil de l/.test(s.title||''));",
    "A(!!tsel,'4b : sélecteur d\\u2019outil présent');",
    "if(tsel){tsel.value='T2';tsel.onchange();}",
    "A(job.ops[1].toolId==='T2'&&!job.ops[1].cut,'4c : changer d\\u2019outil efface les surcharges (valeurs de la nouvelle fiche)');",
    "const C2=faoOpCutting(job.ops[1],job),sf2=faoToolSF(faoToolById(job,'T2'),job);",
    "A(C2.s===sf2.s&&C2.f===sf2.f,'4d : S/F = fiche T2 (S'+C2.s+' F'+C2.f+')');",
    // ── 5. cache des parcours : ni les avances ni les nouveaux champs ne périment
    "job.ops[1].toolId='T1';",
    "const k0=faoOpMovesKey(job.ops[0],job);",
    "job.ops[0].cut={s:12000,f:3000};T1.lc=40;T1.lsm=55;T1.fEnt=800;",
    "const k1=faoOpMovesKey(job.ops[0],job);",
    "A(k0!==null&&k0===k1,'5a : clé de cache inchangée (avances + longueurs = aucun recalcul)');",
    "T1.d=12;const k2=faoOpMovesKey(job.ops[0],job);T1.d=10;",
    "A(k2!==k1,'5b : changer le Ø, lui, périme bien le parcours');",
    // ── 6. géométrie : défauts et saisies
    "const g=faoToolDims({d:10});",
    "A(g.lc.v===25&&g.dq.v===10&&g.lsm.v>g.lc.v&&g.lt.v>g.lsm.v&&g.lc.def,'6a : défauts cohérents (Lc '+g.lc.v+', queue Ø'+g.dq.v+', sous mandrin '+g.lsm.v+', total '+g.lt.v+')');",
    "const g2=faoToolDims({d:6,lc:12,lsm:30});",
    "A(g2.lc.v===12&&!g2.lc.def&&g2.lsm.v===30&&g2.dq.v===6,'6b : valeurs saisies prioritaires');",
    "A(/<svg/.test(faoToolSvg({d:10,kind:'bull',cornerR:2,flutes:3})),'6c : schéma coté de l\\u2019outil');",
    // ── 7. portée : profondeur usinée vs longueurs
    "const _ms=faoMovesStat,_st=faoStock;faoStock=function(){return {x0:0,y0:0,z0:-30,x1:100,y1:80,z1:25};};",
    "const GG={lc:{v:25},lDeg:{v:30},lsm:{v:40},dq:{v:10},dDeg:{v:9}};",
    "const W=z=>{faoMovesStat=function(){return [{x:0,y:0,z:40,r:1},{x:0,y:0,z:z,r:0}];};return faoOpReachWarn({},S,{d:10},GG)||'';};",
    "const wA=W(10),wB=W(-3),wC=W(-8),wD=W(-20);faoMovesStat=_ms;faoStock=_st;",
    "A(wA==='','7a : 15 mm de profondeur < Lc 25 → aucune alerte');",
    "A(/longueur de coupe/.test(wB),'7b : 28 mm > Lc 25 → alerte col dégagé ('+wB+')');",
    "A(/queue/.test(wC),'7c : 33 mm > longueur dégagée 30 → la queue frotte ('+wC+')');",
    "A(/COLLISION/.test(wD),'7d : 45 mm > sous mandrin 40 → collision du mandrin ('+wD+')');",
    // ── 8. bibliothèque : liste + fiche + boutons
    "faoToolSelId='T1';const lib=faoToolsElement(S);",
    "const items=all(lib).filter(n=>/^fao-tl-it/.test(n.className||''));",
    "A(items.length===S.tools.length,'8a : liste à gauche = '+items.length+' outils');",
    "A(all(lib).some(n=>n.className==='fao-tl-h'&&/Conditions de coupe/.test(n.textContent)),'8b : fiche à droite avec conditions de coupe');",
    "A(all(lib).some(n=>n.className==='fao-tl-h'&&/Géométrie/.test(n.textContent)),'8c : fiche à droite avec géométrie');",
    "const btn=t=>all(lib).find(n=>n.tagName==='BUTTON'&&n.textContent===t);",
    "const n0=S.tools.length;btn('+ Nouveau').onclick();",
    "A(S.tools.length===n0+1,'8d : + Nouveau ajoute un outil');",
    "faoToolSelId='T1';const lib2=faoToolsElement(S);const del=all(lib2).find(n=>n.tagName==='BUTTON'&&n.textContent==='✕ Supprimer');del.onclick();",
    "A(S.tools.some(t=>t.id==='T1'),'8e : un outil utilisé par une opération n\\u2019est pas supprimé');",
    "return out;"
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== 2026-10-15-010 : fiches outils + conditions de coupe par opération ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,900));process.exit(1);});
