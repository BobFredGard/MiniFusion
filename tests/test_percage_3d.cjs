// 2026-10-15-012 : fonction 3D « Perçage » + centres de perçage + lien FAO.
// Demande : « une fonction Perçage dans la modélisation 3D en rapport avec l'opération
// Perçage FAO : des points dédiés aux centres de trous ; trous ou trous taraudés, lamage
// et fraisure intégrés ; laisser le choix trou/taraudage pour un STEP ; reconnaître
// automatiquement si créé avec ».
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(m){window.__al=m;};',ctx);
  const R=[
    "const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};",
    "occt=__realOcct;occtReady=true;",
    "const box={id:'skA',name:'Bloc',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{a:{x:0,y:0},b:{x:100,y:0},c:{x:100,y:60},d:{x:0,y:60}},",
    "  entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],constraints:[],dims:[],seq:20,visible:false};",
    "const mk=(id,pts)=>{const P={},E=[];pts.forEach((q,i)=>{P['h'+i]={x:q[0],y:q[1]};E.push({id:'e'+i,t:'cpoint',p:'h'+i,hole:true});});",
    "  P.z={x:50,y:5};E.push({id:'ez',t:'cpoint',p:'z'}); // point de construction ORDINAIRE : ignoré par le perçage",
    "  return {id:id,name:id,plane:'XY',origin:[0,0,30],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:P,entities:E,constraints:[],dims:[],seq:30,visible:false};};",
    "doc.sketches=[box,mk('sT',[[15,15],[15,45]]),mk('sM',[[40,15],[40,45]]),mk('sC',[[65,15],[65,45]]),mk('sF',[[85,30]])];",
    "doc.features=[{id:'F1',type:'extrude',name:'Bloc',sketchId:'skA',distance:30,op:'add',visible:true}];",
    "doc.bodies=[];delete doc.activeBody;markDirty();rebuild();",
    "A(holePoints(doc.sketches[1]).length===2,'0 : 2 centres de perçage par esquisse (le point de construction ordinaire est ignoré)');",
    // fonctions Perçage (sens auto : vers la matière)
    "askHole('sT');const fT=doc.features[doc.features.length-1];fT.d=8;fT.end='through';",
    "askHole('sM');const fM=doc.features[doc.features.length-1];fM.thread={size:'M8',p:1.25,len:12};fM.d=tapDrill('M8',1.25);fM.depth=16;",
    "askHole('sC');const fC=doc.features[doc.features.length-1];fC.kind='cbore';fC.d=6.6;fC.cbD=11;fC.cbH=6.4;fC.end='through';",
    "askHole('sF');const fF=doc.features[doc.features.length-1];fF.kind='csink';fF.d=5.5;fF.csD=11;fF.csA=90;fF.depth=10;fF.tip=0;",
    "[fT,fM,fC,fF].forEach(f=>f.name=holeName(f));",
    "A(!fT.flip&&!fM.flip,'1a : sens automatique vers la matière (esquisse sur le dessus → vers le bas)');",
    "A(fM.d===6.75&&/Taraudé M8/.test(fM.name),'1b : taraudé M8 : Ø de perçage 6,75 (M − pas) — « '+fM.name+' »');",
    "markDirty();rebuild();",
    "A(builtEngine==='exact'&&!doc.features.some(f=>f._err),'1c : rejeu exact sans erreur');",
    // géométrie : la FAO relit les trous
    "faoHoleCache={shape:null,list:null};const H=faoHolesDetect();",
    "out.log.push('trous : '+H.map(h=>'Ø'+h.d+'@('+h.x+','+h.y+') Z'+h.ztop+'→'+h.zbot+(h.through?' déb':' borgne')+(h.tipAng?' pointe'+h.tipAng:'')+(h.chD?' fraisure Ø'+h.chD:'')+(h.feat&&h.feat.thread?' '+h.feat.thread.size:'')).join(' | '));",
    "const f=(x,y,d)=>H.find(h=>Math.abs(h.x-x)<0.01&&Math.abs(h.y-y)<0.01&&Math.abs(h.d-d)<0.01);",
    "const t8=f(15,15,8),m8=f(40,15,6.75),cb=f(65,15,6.6),cb11=f(65,15,11),fr=f(85,30,5.5);",
    "A(t8&&t8.through&&Math.abs(t8.zbot)<1e-6,'2a : Ø8 débouchant');",
    "A(m8&&!m8.through&&Math.abs(m8.zbot-14)<1e-3&&Math.abs(m8.tipAng-118)<0.6,'2b : M8 : Ø6,75 borgne, plein Ø à 16 mm (Z14), pointe 118°');",
    "A(cb&&cb.through&&Math.abs(cb.ztop-23.6)<1e-3&&cb11&&!cb11.through&&Math.abs(cb11.zbot-23.6)<1e-3,'2c : lamage CHC M6 : Ø11 × 6,4 puis Ø6,6 débouchant');",
    "A(fr&&Math.abs(fr.chD-11)<0.02&&!fr.tipAng,'2d : fraisure Ø11 à 90° sur Ø5,5 fond plat ('+(fr&&fr.chD)+')');",
    // reconnaissance automatique de la nature
    "A(m8&&m8.feat&&m8.feat.thread&&m8.feat.thread.size==='M8','3a : la FAO reconnaît « taraudé M8 » (fonction Perçage)');",
    "A(cb11&&cb11.feat&&cb11.feat.role==='lamage','3b : le Ø11 est reconnu comme le lamage de la fonction');",
    "A(t8&&t8.feat&&!t8.feat.thread,'3c : le Ø8 est un trou lisse de la fonction');",
    // modification : profondeur → le trou suit
    "fM.depth=20;markDirty();rebuild();faoHoleCache={shape:null,list:null};",
    "const m8b=faoHolesDetect().find(h=>Math.abs(h.x-40)<0.01&&Math.abs(h.y-15)<0.01);",
    "A(m8b&&Math.abs(m8b.zbot-10)<1e-3,'4a : profondeur 20 → fond Z10 (fonction paramétrique)');",
    // fins « jusqu'à la face », « débouchant (prochaine face) », « débouchant tout »
    "const cav={id:'sV',name:'Cav',plane:'XY',origin:[0,0,20],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{a:{x:20,y:5},b:{x:80,y:5},c:{x:80,y:55},d:{x:20,y:55}},",
    "  entities:[{id:'v1',t:'line',p1:'a',p2:'b'},{id:'v2',t:'line',p1:'b',p2:'c'},{id:'v3',t:'line',p1:'c',p2:'d'},{id:'v4',t:'line',p1:'d',p2:'a'}],constraints:[],dims:[],seq:20,visible:false};",
    "doc.sketches.push(cav,mk('sN',[[30,30]]),mk('sA',[[50,30]]),mk('sU',[[70,30]]));",
    "doc.features=[doc.features[0],{id:'FV',type:'extrude',name:'Cavité interne',sketchId:'sV',distance:-15,op:'cut',visible:true}];",
    "markDirty();rebuild();",
    "askHole('sN');const fN=doc.features[doc.features.length-1];fN.d=6;fN.end='next';fN.thread={size:'M8',p:1.25,lenMode:'next'};",
    "askHole('sA');const fA=doc.features[doc.features.length-1];fA.d=6;fA.end='through';",
    "askHole('sU');const fU=doc.features[doc.features.length-1];fU.d=6;fU.end='upto';fU.uptoPlane={p:[0,0,2],n:[0,0,1]};",
    "markDirty();rebuild();faoHoleCache={shape:null,list:null};",
    "const HV=faoHolesDetect();const g=(x)=>HV.filter(h=>Math.abs(h.x-x)<0.01&&Math.abs(h.y-30)<0.01&&Math.abs(h.d-6)<0.01);",
    "out.log.push('fins : '+[30,50,70].map(x=>g(x).map(h=>'x'+x+' Z'+h.ztop+'→'+h.zbot).join(',')).join(' | '));",
    "A(g(30).length===1&&Math.abs(g(30)[0].zbot-20)<0.06,'4b : « Débouchant » : s\\u2019arrête à la 1re sortie de matière (cavité, Z20)');",
    "A(g(50).length===2&&g(50).some(h=>Math.abs(h.zbot)<1e-3&&h.through),'4c : « Débouchant tout » : traverse la cavité jusqu\\u2019au bas (2 tronçons, Z0)');",
    "A(g(70).length===2&&g(70).some(h=>Math.abs(h.zbot-2)<1e-3&&!h.through),'4d : « Jusqu\\u2019à la face » Z2 : fond à Z2 (sous la cavité)');",
    "A(Math.abs((fN._thLen||0)-10)<0.06,'4e : longueur filetée « prochaine face » = '+fN._thLen+' mm');",
    "A(!/Supprimer/.test((function(){const p=document.createElement('div');renderHoleProps(p,fN);const t=[];(function w(n){t.push(n.textContent||'');(n.children||[]).forEach(w);})(p);return t.join('|');})()),'4f : plus de bouton Supprimer en double dans le panneau Perçage');",
    // STEP : pas de fonction → choix proposé selon le Ø
    "const S=faoSetup();S.ops=[];const op=faoOpDefaults('drill');S.ops.push(op);",
    "doc.features=doc.features.filter(x=>x.type!=='hole'||x.id==='zz');faoHoleCache={shape:null,list:null};",
    "const card=faoOpCardElement(S,op,0);const all=n=>{const o=[];(function w(x){o.push(x);(x.children||[]).forEach(w);})(n);return o;};",
    "const sels=all(card).filter(n=>n.tagName==='SELECT'&&/STEP/.test(n.title||''));",
    "out.log.push('sélecteurs « nature » (sans fonction, solide figé) : '+sels.length);",
    "const k0=faoOpMovesKey(op,S);S.holeInfo={'6.75@30.00':{thread:{size:'M8',p:1.25}}};",
    "A(faoOpMovesKey(op,S)===k0,'5a : marquer un trou STEP « taraudé » ne périme aucun parcours');",
    "return out;"
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== 2026-10-15-012 : fonction Perçage 3D + lien FAO ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
