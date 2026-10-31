// V0.24.0 : fonction Perçage « Alésé » + table ISO 286 complète.
// Demande : « il manque la fonction Trous Alésé : 1 - alésé fond plat ; 2 - alésé fond plat et
// trou de perçage non débouchant ; 3 - alésé fond plat et trou de perçage débouchant. La
// tolérance ISO de l'alésage est écrite automatiquement dans la cotation de perçage (Ø6 H7
// (+0.012/0)). Perçage = Ø alésage − 0,5 ou − 1. En mise en plan, toutes les tolérances ISO ;
// pour les perçages alésés, uniquement les trous (majuscules). »
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
    "const eq=(r,lo,hi)=>r&&Math.abs(r.lo-lo)<1e-6&&Math.abs(r.hi-hi)<1e-6;",
    // 1) table ISO 286 (valeurs des tables ISO 286-2)
    "A(eq(iso286Range('H7',6),0,0.012)&&eq(iso286Range('H7',20),0,0.021)&&eq(iso286Range('H11',20),0,0.13),'1a : H7 Ø6 +0,012/0 · H7 Ø20 +0,021/0 · H11 Ø20 +0,130/0 (IT11 corrigé)');",
    "A(eq(iso286Range('g6',20),-0.02,-0.007)&&eq(iso286Range('G7',20),0.007,0.028)&&eq(iso286Range('F7',10),0.013,0.028),'1b : g6 / G7 / F7');",
    "A(eq(iso286Range('K7',8),-0.01,0.005)&&eq(iso286Range('M7',15),-0.018,0)&&eq(iso286Range('N7',20),-0.028,-0.007),'1c : K7 Ø8 +5/−10 · M7 Ø15 0/−18 · N7 Ø20 −7/−28 (règle du Δ)');",
    "A(eq(iso286Range('P7',25),-0.035,-0.014)&&eq(iso286Range('S7',15),-0.039,-0.021)&&eq(iso286Range('M6',260),-0.041,-0.009),'1d : P7 · S7 · M6 250-315 (cas particulier −9)');",
    "A(eq(iso286Range('J7',20),-0.009,0.012)&&eq(iso286Range('j6',20),-0.004,0.009)&&eq(iso286Range('k6',20),0.002,0.015)&&eq(iso286Range('r6',60),0.041,0.06)&&eq(iso286Range('u6',25),0.048,0.061),'1e : J7 · j6 · k6 · r6 · u6');",
    "A(iso286Range('t6',20)===null&&iso286Range('H7',600)===null&&iso286Range('Js7',10)===null,'1f : lettre non définie (t ≤ 24), Ø > 500, casse mêlée → pas de tolérance');",
    "const CH=iso286Classes(true),CA=iso286Classes(false);",
    "A(CH.length>200&&CA.length>200&&CH.every(c=>iso286Parse(c).hole)&&CA.every(c=>!iso286Parse(c).hole)&&CH.indexOf('ZC11')>=0&&CA.indexOf('a13')>=0&&CH.indexOf('H01')>=0,'1g : '+CH.length+' classes d\\u2019alésage (A … ZC) et '+CA.length+' d\\u2019arbre (a … zc)');",
    // 2) les 3 cas sur un bloc 100 × 60 × 30
    "const box={id:'skA',name:'Bloc',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{a:{x:0,y:0},b:{x:100,y:0},c:{x:100,y:60},d:{x:0,y:60}},",
    "  entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],constraints:[],dims:[],seq:20,visible:false};",
    "const mk=(id,pts)=>{const P={},E=[];pts.forEach((q,i)=>{P['h'+i]={x:q[0],y:q[1]};E.push({id:'e'+i,t:'cpoint',p:'h'+i,hole:true});});",
    "  return {id:id,name:id,plane:'XY',origin:[0,0,30],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:P,entities:E,constraints:[],dims:[],seq:30,visible:false};};",
    "doc.sketches=[box,mk('s1',[[20,30]]),mk('s2',[[50,30]]),mk('s3',[[80,15],[80,45]]),mk('s4',[[35,10]])];",
    "doc.features=[{id:'F1',type:'extrude',name:'Bloc',sketchId:'skA',distance:30,op:'add',visible:true}];",
    "doc.bodies=[];delete doc.activeBody;markDirty();rebuild();",
    "const opts=(fx)=>{const p=document.createElement('div');renderHoleProps(p,fx);const o=[];(function w(n){if(n.tagName==='SELECT')o.push(n);(n.children||[]).forEach(w);})(p);return o;};",
    "askHole('s1');const f1=doc.features[doc.features.length-1];",
    // le type « Alésé » se choisit dans le panneau (valeurs de départ cohérentes)
    "f1.d=6;f1.depth=15;f1.thread={size:'M8',p:1.25,len:10};",
    "const p1=document.createElement('div');renderHoleProps(p1,f1);",
    "const segB=[];(function w(n){if(n.tagName==='BUTTON'&&n.dataset&&n.dataset.v==='ream')segB.push(n);(n.children||[]).forEach(w);})(p1);",
    "A(segB.length===1,'2a0 : bouton « Alésé » dans le type');if(segB[0])segB[0].onclick();",
    "out.log.push('après « Alésé » : '+JSON.stringify({kind:f1.kind,reamD:f1.reamD,reamH:f1.reamH,reamTol:f1.reamTol,pilot:f1.pilot,thread:f1.thread}));",
    "A(f1.kind==='ream'&&f1.reamD===6&&f1.reamTol==='H7'&&f1.pilot==='none'&&!f1.thread,'2a : bouton « Alésé » : Ø6 H7, fond plat seul, taraudage retiré');",
    "f1.reamD=6;f1.reamH=10;f1.reamTol='H7';f1.pilot='none';",
    "askHole('s2');const f2=doc.features[doc.features.length-1];Object.assign(f2,{kind:'ream',reamD:8,reamH:8,reamTol:'H7',pilot:'blind',reamOff:0.5,depth:20,tip:118});f2.d=holeReamDrill(f2);",
    "askHole('s3');const f3=doc.features[doc.features.length-1];Object.assign(f3,{kind:'ream',reamD:10,reamH:12,reamTol:'G6',pilot:'through',reamOff:1});f3.d=holeReamDrill(f3);",
    "askHole('s4');const f4=doc.features[doc.features.length-1];Object.assign(f4,{kind:'ream',reamD:5,reamH:6,reamTol:'H7',pilot:'open',reamOff:0.5});",
    "[f1,f2,f3,f4].forEach(f=>f.name=holeName(f));",
    "A(f4.name==='Alésé Ø5 H7 débouchant ×1','2e : nom de l\u2019alésage débouchant');",
    "out.log.push('noms : '+[f1,f2,f3].map(f=>f.name).join(' | '));",
    "A(f2.d===7.5&&f3.d===9,'2b : Ø de perçage = Ø alésage − 0,5 (7,5) / − 1 (9)');",
    "A(/Alésé Ø6 H7 fond plat/.test(f1.name)&&/Alésé Ø8 H7 \\+ Ø7,5/.test(f2.name)&&/Alésé Ø10 G6 \\+ Ø9 débouchant ×2/.test(f3.name),'2c : noms des fonctions');",
    "markDirty();rebuild();",
    "A(builtEngine==='exact'&&!doc.features.some(f=>f._err),'2d : rejeu exact sans erreur');",
    "faoHoleCache={shape:null,list:null};const H=faoHolesDetect();",
    "out.log.push('trous : '+H.map(h=>'Ø'+h.d+'@('+h.x+','+h.y+') Z'+h.ztop+'→'+h.zbot+(h.through?' déb':' borgne')+(h.tipAng?' pointe'+h.tipAng:'')+(h.cb?' étagé Ø'+h.cb.d:'')+(h.feat?' ['+h.feat.role+(h.feat.tol?' '+h.feat.tol:'')+']':'')).join(' | '));",
    "const g=(x,y,d)=>H.find(h=>Math.abs(h.x-x)<0.01&&Math.abs(h.y-y)<0.01&&Math.abs(h.d-d)<0.01);",
    "const c1=g(20,30,6),c2a=g(50,30,8),c2b=g(50,30,7.5),c3a=g(80,15,10),c3b=g(80,15,9);",
    "A(c1&&!c1.through&&Math.abs(c1.zbot-20)<1e-3&&!c1.tipAng,'3a : cas 1 : Ø6 fond plat à 10 mm (Z20), sans pointe');",
    "A(c2a&&!c2a.through&&Math.abs(c2a.zbot-22)<1e-3&&c2b&&!c2b.through&&Math.abs(c2b.ztop-22)<1e-3&&Math.abs(c2b.zbot-10)<1e-3&&Math.abs(c2b.tipAng-118)<0.6,'3b : cas 2 : Ø8 × 8 fond plat puis Ø7,5 non débouchant (plein Ø à 20, pointe 118°)');",
    "A(c3a&&Math.abs(c3a.zbot-18)<1e-3&&c3b&&c3b.through&&Math.abs(c3b.zbot)<1e-3&&g(80,45,10)&&g(80,45,9),'3c : cas 3 : Ø10 × 12 fond plat puis Ø9 débouchant (×2)');",
    "const c4=g(35,10,5);A(c4&&c4.through&&Math.abs(c4.ztop-30)<1e-3&&Math.abs(c4.zbot)<1e-3&&!H.some(h=>Math.abs(h.x-35)<0.01&&Math.abs(h.d-5)>0.01)&&c4.feat&&c4.feat.role==='alesage','3e : alésage débouchant : Ø5 seul, Z30→0, reconnu par la FAO');",
    "A(c1&&c1.feat&&c1.feat.role==='alesage'&&c1.feat.tol==='H7'&&c3a&&c3a.feat&&c3a.feat.tol==='G6'&&c3b&&c3b.feat&&c3b.feat.role==='trou','3d : la FAO reconnaît l\\u2019alésage (classe ISO) et son perçage');",
    // 3) panneau : tolérance en majuscules seulement, qualités des tables
    "const S1=opts(f2);const lettres=S1.find(s=>[...s.querySelectorAll?s.querySelectorAll('option'):[]].length&&s.value==='H'&&s.options&&s.options.length===ISO286_HOLE_LETTERS.length);",
    "const allOpt=[];S1.forEach(s=>{(function w(n){if(n.tagName==='OPTION')allOpt.push(n.value);(n.children||[]).forEach(w);})(s);});",
    "A(ISO286_HOLE_LETTERS.every(L=>allOpt.indexOf(L)>=0)&&!ISO286_SHAFT_LETTERS.some(l=>allOpt.indexOf(l)>=0&&l!==l.toUpperCase()),'4a : panneau Alésé : écarts A … ZC, aucune minuscule');",
    "A(allOpt.indexOf('open')>=0&&allOpt.indexOf('blind')>=0&&allOpt.indexOf('through')>=0&&allOpt.indexOf('none')>=0&&allOpt.indexOf('0.5')>=0&&allOpt.indexOf('1')>=0,'4b : 4 cas et Ø perçage −0,5 / −1 proposés');",
    "const txt=(fx)=>{const p=document.createElement('div');renderHoleProps(p,fx);const t=[];(function w(n){if(n.className==='pnl-note')t.push(n.textContent);(n.children||[]).forEach(w);})(p);return t.join(' | ');};",
    "const n2=txt(f2);out.log.push('note : '+n2);",
    "A(/H7 \\(\\+0,015 \\/ 0\\)/.test(n2),'4c : panneau : « Ø8 H7 (+0,015 / 0) »');",
    // 4) mise en plan : texte de la cotation de perçage + tolérance automatique
    "const T=window.__mepTest;",
    "const t1=T.holeText(f1),t2=T.holeText(f2),t3=T.holeText(f3);out.log.push('cotes : '+[t1,t2,t3].map(s=>s.replace(/\\n/g,' / ')).join(' | '));",
    "A(t1==='Ø6 ↧10'&&t2==='Ø8 ↧8\\nØ7.5 ↧20'&&t3==='Ø10 ↧12\\nØ9 déb.','4d : texte de cotation : alésage d\\u2019abord, puis perçage');",
    "A(T.holeText(f4)==='Ø5 déb.'&&/^Ø5 H7 \\(\\+0.012 \\/ 0\\) déb\\.$/.test(T.holeTolText(T.holeText(f4),{m:'cls',cls:'H7'})),'4d2 : cotation de l\u2019alésage débouchant : « Ø5 H7 (+0.012 / 0) déb. »');",
    "const d2={kind:'hole',holeFid:f2.id,holeText:t2,tol:null};",
    "const tt=T.holeTolText(t2,T.holeTol(d2));out.log.push('cote auto : '+tt.replace(/\\n/g,' / '));",
    "A(/^Ø8 H7 \\(\\+0.015 \\/ 0\\) ↧8\\nØ7.5 ↧20$/.test(tt),'4e : tolérance ISO écrite d\\u2019office dans la cotation de perçage');",
    "f2.reamTol='F7';A(T.holeTol(d2).cls==='F7','4f : la cotation suit la classe de la fonction');",
    "A(T.holeTol(Object.assign({},d2,{tolManual:true}))===null&&T.holeTol(Object.assign({},d2,{tol:{m:'pm',s:0.1}})).m==='pm','4g : tolérance retirée ou posée à la main : l\\u2019automatique s\\u2019efface');",
    "return out;"
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== V0.24.0 : perçage Alésé + ISO 286 complète ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
