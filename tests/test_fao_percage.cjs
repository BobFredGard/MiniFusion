// 2026-10-15-011 : perçage — trous reconnus sur le modèle, cycles, profondeurs, outils.
// Retour : « l'opération Perçage ne fait rien, pas d'outil ni parcours ».
// Pièce de test (noyau OCCT réel) : bloc 100×60×30 ; Ø8 débouchant en (20,20) ;
// Ø6,8 borgne de 30 à 15 avec pointe 118° en (50,30) ; Ø6 débouchant lamé Ø11 prof. 6 en (80,30) ;
// 3 trous Ø5 débouchants alignés (pour l'ordre).
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const R=[
    "const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};",
    "occt=__realOcct;occtReady=true;",
    "const P=(x,y,z)=>new occt.gp_Pnt_3(x,y,z),Dz=new occt.gp_Dir_4(0,0,1);",
    "const cut=(s,t)=>occCut(s,t);",
    "const cyl=(x,y,z,r,h)=>new occt.BRepPrimAPI_MakeCylinder_3(new occt.gp_Ax2_3(P(x,y,z),Dz),r,h).Shape();",
    "const cone=(x,y,z,r1,r2,h)=>new occt.BRepPrimAPI_MakeCone_3(new occt.gp_Ax2_3(P(x,y,z),Dz),r1,r2,h).Shape();",
    "let sh=new occt.BRepPrimAPI_MakeBox_2(P(0,0,0),100,60,30).Shape();",
    "sh=cut(sh,cyl(20,20,-1,4,40));",
    "sh=cut(sh,cyl(50,30,15,3.4,20));sh=cut(sh,cone(50,30,15-2.043,0,3.4,2.043));",
    "sh=cut(sh,cyl(80,30,-1,3,40));sh=cut(sh,cyl(80,30,24,5.5,10));",
    "[[10,50],[40,50],[25,50]].forEach(q=>{sh=cut(sh,cyl(q[0],q[1],-1,2.5,40));});",
    "const Dm=new occt.gp_Dir_4(0,0,-1);sh=cut(sh,new occt.BRepPrimAPI_MakeCylinder_3(new occt.gp_Ax2_3(P(90,10,31),Dm),2,11).Shape());",
    "sh=occFuse(sh,cyl(60,10,30,3,8));",
    "occLive={shape:sh};",
    // ── 1. reconnaissance
    "const H=faoHolesDetect();",
    "out.log.push('trous : '+H.map(h=>'Ø'+h.d+'@('+h.x+','+h.y+') Z'+h.ztop+'→'+h.zbot+(h.through?' déb':' borgne')+(h.tipAng?' pointe'+h.tipAng:'')+(h.cb?' lamage Ø'+h.cb.d:'')).join(' | '));",
    "const f=(x,y,d)=>H.find(h=>Math.abs(h.x-x)<0.01&&Math.abs(h.y-y)<0.01&&Math.abs(h.d-d)<0.01);",
    "const h8=f(20,20,8),h68=f(50,30,6.8),h6=f(80,30,6),h11=f(80,30,11);",
    "A(h8&&h8.through&&Math.abs(h8.ztop-30)<1e-6&&Math.abs(h8.zbot)<1e-6,'1a : Ø8 débouchant, Z 30 → 0');",
    "A(h68&&!h68.through&&Math.abs(h68.zbot-15)<1e-3&&Math.abs(h68.tipAng-118)<0.6,'1b : Ø6,8 borgne fond Z15, pointe '+(h68&&h68.tipAng)+'°');",
    "A(h6&&h6.through&&Math.abs(h6.ztop-24)<1e-6&&h6.cb&&Math.abs(h6.cb.d-11)<1e-6&&Math.abs(h6.zSurf-30)<1e-6,'1c : Ø6 débouchant sous lamage Ø11 (départ réel Z30)');",
    "A(h11&&!h11.through,'1d : le lamage Ø11 est vu comme un trou borgne à part');",
    "A(H.filter(h=>Math.abs(h.d-5)<0.01).length===3,'1e : 3 trous Ø5');",
    "A(!H.some(h=>h.d>50),'1f : le bloc lui-même n\\u2019est pas un trou');",
    "const hm=f(90,10,4);A(hm&&!hm.through&&Math.abs(hm.zbot-20)<1e-6,'1g : trou creusé en −Z (découpe extrudée) reconnu, borgne Z20');",
    "A(!f(60,10,6),'1h : un pion (cylindre en saillie) n\\u2019est pas un trou');",
    // ── 2. opération par défaut : aucun trou fantôme
    "const S=faoSetup();S.ops=[];const op=faoOpDefaults('drill');S.ops.push(op);",
    "A(op.src==='model'&&(op.holeSel||[]).length===0&&faoOpMoves(op,S).length===0,'2a : nouvelle opération = aucun trou (plus de perçage au centre du brut)');",
    // ── 3. sélection d'un groupe → trous + foret créé
    "const nT=S.tools.length;",
    "faoHoleToggle(S,op,6.8,30);",
    "A(op.holes.length===1&&Math.abs(op.holes[0].x-50)<1e-6,'3a : groupe Ø6,8 sélectionné (1 trou)');",
    "const t=faoToolById(S,op.toolId);",
    "A(t.kind==='drill'&&Math.abs(t.d-6.8)<1e-6&&S.tools.length===nT+1,'3b : foret Ø6,8 créé et affecté ('+t.name+', T'+t.num+')');",
    "const sf=faoToolSF(t,S);A(sf.f===Math.round(faoToolFr(t)*sf.s),'3c : F = f/tr × S ('+faoToolFr(t)+' × '+sf.s+' = '+sf.f+')');",
    // ── 4. profondeurs
    "const L=faoToolTipLen(t);",
    "let pl=faoDrillPlan(op,S);",
    "A(Math.abs(pl[0].zTip-(15-L))<1e-6,'4a : plein Ø au fond : pointe à Z '+pl[0].zTip.toFixed(3)+' (15 − '+L.toFixed(3)+')');",
    "op.depthMode='tip';pl=faoDrillPlan(op,S);A(Math.abs(pl[0].zTip-15)<1e-6,'4b : pointe au fond : Z15');op.depthMode='full';",
    "const nOps=S.ops.length;const o2=faoHoleToggle(S,op,8,30);",
    "A(S.ops.length===nOps+1&&o2!==op&&o2.holes.length===1&&faoToolById(S,o2.toolId).d===8&&faoToolById(S,op.toolId).d===6.8,'3d : ajouter un Ø8 à une opération Ø6,8 → NOUVELLE opération au foret Ø8 (les Ø6,8 gardent leur foret)');",
    "S.ops.splice(S.ops.indexOf(o2),1);",
    "faoHoleToggle(S,op,6.8,30);faoHoleToggle(S,op,8,30);",
    "pl=faoDrillPlan(op,S);const t8=faoToolById(S,op.toolId);",
    "A(Math.abs(pl[0].zTip-(0-1-faoToolTipLen(t8)))<1e-6,'4c : débouchant : −1 mm de débouchage − pointe ('+pl[0].zTip.toFixed(3)+')');",
    "faoHoleToggle(S,op,8,30);faoHoleToggle(S,op,6,24);pl=faoDrillPlan(op,S);",
    "A(Math.abs(pl[0].rfp-30)<1e-6,'4d : trou sous lamage : départ du cycle au dessus de la pièce (Z30)');",
    // ── 5. ordre optimisé
    "faoHoleToggle(S,op,6,24);faoHoleToggle(S,op,5,30);",
    "pl=faoDrillPlan(op,S);const xs=pl.map(p=>p.x).join(',');",
    "A(xs==='10,25,40'||xs==='40,25,10','5a : 3 trous alignés percés dans l\\u2019ordre ('+xs+', saisie 10,40,25)');",
    // ── 6. parcours immédiat + G-code
    "const nm=(faoMovesStat(op,S)||[]).length;A(nm===12,'6a : parcours produit tout de suite (sans « Tout régénérer ») — '+nm+' mouvements');",
    "S.name='PERC';S.stock={x0:0,y0:0,z0:0,x1:100,y1:60,z1:30};",
    "const g=faoPost(S,'siemens630').code;",
    "A((g.match(/CYCLE81\\(/g)||[]).length===3,'6b : Siemens : 3 × CYCLE81');",
    "op.cycle='peck';op.peck=3;const g2=faoPost(S,'siemens630').code;",
    "A((g2.match(/CYCLE83\\([^)]*, 1, 1, /g)||[]).length===3,'6c : débourrage : CYCLE83 VARI=1');",
    "op.cycle='chip';const g3=faoPost(S,'siemens630').code;",
    "A((g3.match(/CYCLE83\\([^)]*, 1, 0, /g)||[]).length===3,'6d : brise-copeaux : CYCLE83 VARI=0');",
    "const f3=faoPost(S,'fagor8065').code;",
    "A(!/G73/.test(f3)&&/G0 Z/.test(f3)&&!/G83/.test(f3),'6e : Fagor brise-copeaux : passes explicites (pas de G73 non confirmé)');",
    "op.cycle='drill';op.dwell=0.5;",
    "A(/CYCLE82\\(/.test(faoPost(S,'siemens630').code)&&/G82 /.test(faoPost(S,'fagor8065').code),'6f : temporisation : CYCLE82 / G82');",
    "op.dwell=0;",
    // ── 7. pointage : foret à centrer + profondeur par Ø de chanfrein
    "op.cycle='spot';faoDrillAutoTool(S,op,5);const ts=faoToolById(S,op.toolId);",
    "A(ts.kind==='spot'&&faoToolAngle(ts)===90,'7a : pointage → foret à pointer 90°');",
    "op.chD=6;pl=faoDrillPlan(op,S);",
    "A(Math.abs(pl[0].zTip-27)<1e-6,'7b : pointage Ø6 à 90° : 3 mm de profondeur (Z '+pl[0].zTip+')');",
    // ── 7c. foret à centrer DIN 333 A2,5 (d2 6,3, pilote 3,1) : chanfrein lu sur le cône 60°
    "const tc={id:'TC',num:99,name:'Foret à centrer A2.5',kind:'center',d:2.5,cornerR:0,flutes:2,vc:20,fz:0.03};S.tools.push(tc);op.toolId='TC';",
    "A(faoDrillAutoTool(S,op,5)===null&&op.toolId==='TC','7c : pointage : le foret à centrer choisi est gardé');",
    "pl=faoDrillPlan(op,S);const zc=30-(3.1+(3-1.25)/Math.tan(Math.PI/6));",
    "A(Math.abs(pl[0].zTip-zc)<1e-6,'7d : foret à centrer A2.5, chanfrein Ø6 : pointe à Z '+pl[0].zTip.toFixed(3));",
    "const tpc=faoToolTipProfile(tc);",
    "A(faoToolBodyD(tc)===6.3&&Math.abs(faoTipZAt(tpc,1.25)-1.25/Math.tan(59*Math.PI/180))<1e-9&&Math.abs(faoTipZAt(tpc,3.15)-tpc[3][1])<1e-9,'7e : profil pilote 118° + cône 60° jusqu’au corps Ø6.3');",
    // ── 8. suivi du modèle : trou déplacé → opération suivie
    "op.cycle='drill';S.ops=[op];op.holeSel=[{d:6.8,z:30}];faoDrillResolve(op);",
    "let sh2=new occt.BRepPrimAPI_MakeBox_2(P(0,0,0),100,60,30).Shape();sh2=cut(sh2,cyl(60,35,15,3.4,20));",
    "occLive={shape:sh2};faoHoleCache={shape:null,list:null};const k0=faoOpMovesKey(op,S);",
    "faoDrillResolve(op);",
    "A(op.holes.length===1&&Math.abs(op.holes[0].x-60)<1e-6&&Math.abs(op.holes[0].y-35)<1e-6,'8a : le trou déplacé sur le modèle est suivi (60,35)');",
    "A(faoOpMovesKey(op,S)!==k0,'8b : …et le parcours est bien marqué à refaire');",
    // ── 9. ancien perçage XY : inchangé
    "const old={id:'ox',type:'drill',toolId:'T1',pts:[[20,20],[80,60],[40,40]],ztop:25,zbot:5,peck:0};",
    "const po=faoDrillPlan(old,S);",
    "A(po.map(p=>p.x).join(',')==='20,80,40'&&po.every(p=>p.rfp===25&&p.zTip===5),'9a : saisie XY historique : ordre et cotes conservés');",
    "return out;"
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== 2026-10-15-011 : perçage — trous du modèle ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
