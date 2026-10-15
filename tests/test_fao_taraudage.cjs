// 2026-10-15-013 : FAO — taraudage + gamme automatique (pointage → perçage → taraudage).
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};',ctx);
  const R=[
    "const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};",
    "occt=__realOcct;occtReady=true;",
    "const box={id:'skA',name:'Bloc',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{a:{x:0,y:0},b:{x:120,y:0},c:{x:120,y:60},d:{x:0,y:60}},",
    "  entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],constraints:[],dims:[],seq:20,visible:false};",
    "const mk=(id,pts)=>{const P={},E=[];pts.forEach((q,i)=>{P['h'+i]={x:q[0],y:q[1]};E.push({id:'e'+i,t:'cpoint',p:'h'+i,hole:true});});",
    "  return {id:id,name:id,plane:'XY',origin:[0,0,40],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:P,entities:E,constraints:[],dims:[],seq:30,visible:false};};",
    "doc.sketches=[box,mk('sM',[[15,15],[15,45]]),mk('sT',[[40,15],[40,45]]),mk('sC',[[70,15],[70,45]]),mk('sP',[[100,30]])];",
    "doc.features=[{id:'F1',type:'extrude',name:'Bloc',sketchId:'skA',distance:40,op:'add',visible:true}];",
    "doc.bodies=[];delete doc.activeBody;markDirty();rebuild();",
    "askHole('sM');const fM=doc.features[doc.features.length-1];fM.thread={size:'M8',p:1.25,len:12};fM.d=6.75;fM.depth=16;",
    "askHole('sT');const fT=doc.features[doc.features.length-1];fT.d=8;fT.end='through';",
    "askHole('sC');const fC=doc.features[doc.features.length-1];fC.kind='cbore';fC.d=6.6;fC.cbD=11;fC.cbH=6.4;fC.end='through';",
    "askHole('sP');const fP=doc.features[doc.features.length-1];fP.d=5;fP.depth=30;",
    "markDirty();rebuild();faoHoleCache={shape:null,list:null};",
    "A(builtEngine==='exact'&&!doc.features.some(f=>f._err),'0 : pièce exacte (M8, Ø8, lamage CHC, Ø5 profond)');",
    "const S=faoSetup();S.ops=[];S.name='TAR';S.stock={x0:0,y0:0,z0:0,x1:120,y1:60,z1:40};",
    "const op=faoOpDefaults('drill');S.ops.push(op);",
    "const G=faoHoleGroups(faoHolesDetect());G.forEach(g=>op.holeSel.push({d:g.d,z:g.z}));faoDrillResolve(op);",
    "out.log.push('groupes : '+G.map(g=>'Ø'+g.d+'@'+g.z+'×'+g.holes.length).join(' | '));",
    // ── gamme
    "const made=faoDrillGamme(S,op);",
    "const desc=S.ops.map(o=>({c:o.cycle,t:faoToolById(S,o.toolId),n:(o.holes||[]).length}));",
    "out.log.push('gamme : '+desc.map(x=>x.c+'('+x.n+') '+x.t.name).join(' → '));",
    "A(desc[0].c==='spot'&&desc[0].t.kind==='spot','1a : 1re opération = pointage au foret à centrer');",
    "A(desc[desc.length-1].c==='tap'&&desc[desc.length-1].t.kind==='tap'&&desc[desc.length-1].t.size==='M8','1b : dernière = taraudage au taraud M8');",
    "const drills=desc.filter(x=>x.c==='drill'||x.c==='peck');",
    "A(drills.length===4&&drills.every(x=>x.t.kind==='drill'),'1c : un perçage par Ø (6,75 / 8 / 6,6 / 5) au foret');",
    "A(drills.some(x=>x.c==='peck'&&Math.abs(x.t.d-5)<1e-6),'1d : Ø5 × 30 (> 4 × Ø) → débourrage automatique');",
    "const hl=S.ops.find(o=>o.cycle==='helix'),th=hl&&faoToolById(S,hl.toolId);",
    "A(hl&&!S.ops.some(o=>o.cycle!=='helix'&&(o.holes||[]).some(h=>Math.abs(h.d-11)<0.01)),'1e : le lamage Ø11 est FRAISÉ (opération hélicoïdale), jamais percé');",
    "A(th&&th.kind==='flat'&&th.d>=0.4*11&&th.d<=0.85*11,'1f : fraise cylindrique adaptée au lamage Ø11 (T'+(th&&th.num)+' '+(th&&th.name)+')');",
    "const mvH=faoOpMoves(hl,S),arcs=mvH.filter(m=>m.arc),R=(11-th.d)/2;",
    "A(arcs.length>8&&arcs.every(m=>!m.arc.cw)&&arcs.every(m=>{const p=mvH[mvH.indexOf(m)-1];return Math.abs(Math.hypot(m.arc.i,m.arc.j)-R)<1e-6;}),'1g : hélice en avalant (G3) au rayon '+R+' ('+arcs.length+' quarts de tour)');",
    "const zMin=Math.min.apply(null,mvH.filter(m=>!m.r).map(m=>m.z));A(Math.abs(zMin-33.6)<1e-6,'1h : fond du lamage dressé à Z33,6 (6,4 de profondeur)');",
    "A(arcs.filter(m=>m.ent).length>0&&arcs.filter(m=>!m.ent).length===8,'1i : descente en F entrée, 1 tour complet à plat au fond par lamage');",
    "const mvR=faoGenHelixPlan([{x:0,y:0,rfp:10,zTip:0,d:30}],10,{},20),radii=[...new Set(mvR.filter(m=>m.arc).map(m=>+Math.hypot(m.arc.i,m.arc.j).toFixed(3)))];",
    "A(radii.length===2&&radii[0]<5&&Math.abs(radii[1]-10)<1e-6,'1j : Ø30 à la fraise Ø10 : 2 anneaux ('+radii.join(' puis ')+') — aucun noyau au centre');",
    // ── taraudage
    "const tp=S.ops[S.ops.length-1],tt=faoToolById(S,tp.toolId),sf=faoToolSF(tt,S);",
    "A(sf.f===Math.round(1.25*sf.s),'2a : taraud : F = pas × S ('+sf.f+' = 1,25 × '+sf.s+')');",
    "const pl=faoDrillPlan(tp,S);",
    "A(pl.length===2&&pl.every(p=>Math.abs(p.zTip-28)<1e-6),'2b : profondeur taraudée = longueur filetée 12 (Z28)');",
    "const mvT=faoOpMoves(tp,S),dn=mvT.filter(m=>!m.r&&!m.tapOut),up=mvT.filter(m=>m.tapOut);",
    "A(up.length===2&&up.every(m=>!m.r)&&dn.length===2,'2b2 : le taraud ressort en AVANCE (même F, rotation inversée), jamais en rapide');",
    "A(/CYCLE84\\([^)]*, 3, , 1\\.250, 0, (\\d+), \\1\\)/.test(faoPost(S,'siemens630').code),'2b3 : CYCLE84 : même vitesse à l\u2019aller et au retour (SST = SST1)');",
    "const sp=S.ops[0],ps=faoDrillPlan(sp,S),pM=ps.find(p=>Math.abs(p.x-15)<1e-6);",
    "A(pM&&Math.abs(pM.zTip-(40-4.2))<1e-6,'2c : pointage du M8 : chanfrein Ø8,4 (nominal + 0,4) → 4,2 mm');",
    "const g8=faoPost(S,'siemens630').code,fg=faoPost(S,'fagor8065').code;",
    "A((g8.match(/CYCLE84\\([^)]*, 3, , 1\\.250, 0, /g)||[]).length===2,'2d : Siemens : 2 × CYCLE84 rigide, pas 1,25');",
    "A((fg.match(/G84 [^\\n]*R1 F/g)||[]).length===2,'2e : Fagor : 2 × G84 rigide (R1)');",
    "A((g8.match(/CYCLE83\\(/g)||[]).length===5&&(g8.match(/CYCLE81\\(/g)||[]).length===9,'2f : CYCLE83 pour les 5 trous > 4 × Ø (Ø5, Ø8, Ø6,6), CYCLE81 pour 7 pointages + 2 perçages Ø6,75');",
    // ── STEP : trou lisse marqué taraudé dans la fiche → taraudage possible
    "const k8=(8).toFixed(2)+'@'+(40).toFixed(2);S.holeInfo={};S.holeInfo[k8]={thread:{size:'M10',p:1.5}};",
    "const t2=faoOpDefaults('drill');t2.cycle='tap';S.ops.push(t2);t2.holeSel=[{d:8,z:40}];faoDrillResolve(t2);faoDrillAutoTool(S,t2,8);",
    "const tt2=faoToolById(S,t2.toolId);",
    "A(tt2.kind==='tap'&&tt2.size==='M10'&&Math.abs(tt2.p-1.5)<1e-9,'3a : STEP « Taraudé M10 » → taraud M10 créé');",
    "const pl2=faoDrillPlan(t2,S);A(pl2.every(p=>Math.abs(p.zTip-(0-1.5))<1e-6),'3b : débouchant taraudé : traverse (−max(débouchage, pas))');",
    "return out;"
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== 2026-10-15-013 : taraudage + gamme automatique ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
