// Bandeau de timeline (41-bandeau-timeline.js), modèle seul, sans noyau : ordre des étapes
// (esquisse avant sa consommatrice, construction après sa fonction d'ancrage, esquisse sur
// face après son hôte, esquisse libre en fin), marqueur (grisé au-delà, interstice → fonction,
// ⏮ ◀ ▶ ⏭), glisser-déposer (même corps, bloc de répétition entier, une étape d'annulation),
// ⚠ marqués, rendu DOM (une case par étape, sélection partagée avec l'arbre).
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    "confirm=function(){return true;};",
    "att(typeof tlbSteps==='function','tlbSteps présente');",
    "att(typeof renderTimeline==='function','renderTimeline présente');",
    "docResetEmpty();",
    "const ids=()=>tlbSteps().map(s=>s.id).join(',');",
    // --- fil : s1 → E1 ; plan c1 ancré après E1 ; congé X1 ; s2 (sur face de E1) consommée par E2 ; s3 libre ; s4 sur c1
    "doc.bodies=[{id:'b1',name:'Corps 1'},{id:'b2',name:'Corps 2'}];doc.activeBody='b1';",
    "doc.features=[{id:'e1',type:'extrude',name:'E1',sketchId:'s1',body:'b1'},{id:'x1',type:'xfillet',name:'X1',body:'b1',edges:[]},{id:'e2',type:'extrude',name:'E2',sketchId:'s2',body:'b1'}];",
    "doc.sketches=[{id:'s1',name:'Esq1',plane:'XY',entities:[],points:{}},{id:'s2',name:'Esq2',plane:'FACE',host:{feat:'e1'},entities:[],points:{}},{id:'s3',name:'Esq3',plane:'XZ',entities:[],points:{}},{id:'s4',name:'Esq4',plane:'CG',cg:{id:'c1'},entities:[],points:{}}];",
    "doc.cgeo=[{id:'c1',kind:'plane',how:'offset',refs:[{k:'o',id:'XY'}],par:{d:5},at:'e1',name:'Plan 1'},{id:'c0',kind:'axis',how:'ref',refs:[{k:'o',id:'Z'}],at:null,name:'Axe 1'}];",
    "att(ids()==='c0,s1,e1,c1,s4,x1,s2,e2,s3','ordre du fil (vu '+ids()+')');",
    "att(tlbSteps().every(s=>!s.off),'sans marqueur : rien de grisé');",
    "att(tlbMarkGap(tlbSteps())===9,'sans marqueur : marqueur en fin de fil');",
    // --- marqueur avant X1 : X1, s2, E2, s3 hors rejeu ; c1 et s4 (après E1) restent actifs
    "tlSetPtr(doc.features[1]);",
    "let S=tlbSteps();",
    "att(S.filter(s=>s.off).map(s=>s.id).join(',')==='x1,s2,e2,s3','marqueur avant X1 : grisés (vu '+S.filter(s=>s.off).map(s=>s.id).join(',')+')');",
    "att(tlbMarkGap(S)===5,'marqueur avant X1 : interstice 5 (vu '+tlbMarkGap(S)+')');",
    "att(S.find(s=>s.id==='c1').off===cgLocked(cgGet('c1')),'grisé construction = cgLocked');",
    "att(S.find(s=>s.id==='e2').off===tlLocked(doc.features[2]),'grisé fonction = tlLocked');",
    // interstice → fonction avant laquelle poser le marqueur
    "att(tlbGapFeature(S,0).id==='e1','interstice 0 → avant E1');",
    "att(tlbGapFeature(S,2).id==='e1','interstice entre Esq1 et E1 → avant E1');",
    "att(tlbGapFeature(S,3).id==='x1','interstice après E1 → avant X1');",
    "att(tlbGapFeature(S,7).id==='e2','interstice entre Esq2 et E2 → avant E2');",
    "att(tlbGapFeature(S,8)===null,'interstice après E2 → fin (pas de marqueur)');",
    // ⏮ ◀ ▶ ⏭
    "tlbStep(1);att(tlMark==='e2','▶ : marqueur avant E2 (vu '+tlMark+')');",
    "tlbStep(1);att(tlMark===null,'▶ : fin du fil');",
    "tlbStep(-1);att(tlMark==='e2','◀ depuis la fin : avant E2');",
    "tlbStep(-2);att(tlMark==='e1','⏮ : avant E1');",
    "S=tlbSteps();att(S.filter(s=>!s.off).map(s=>s.id).join(',')==='c0','⏮ : seule la construction de tête reste active');",
    "tlbStep(-1);att(tlMark==='e1','◀ en tête : reste avant E1');",
    "tlbStep(2);att(tlMark===null,'⏭ : tout rejouer');",
    // --- ⚠ : congé incomplet, construction en erreur
    "doc.features[1]._m={m:1,t:3};doc.cgeo[1].st='warn';doc.cgeo[1].msg='référence perdue';",
    "S=tlbSteps();",
    "att(S.find(s=>s.id==='x1').warn,'congé incomplet marqué ⚠');",
    "att(S.find(s=>s.id==='c0').warn,'construction en erreur marquée ⚠');",
    "att(!S.find(s=>s.id==='e1').warn,'extrusion saine non marquée');",
    // --- rendu DOM : une case par étape, sélection partagée avec l'arbre
    "sel={kind:'sketch',id:'s2'};treeSel=[];tlSetPtr(doc.features[2]);",
    "renderTimeline();",
    "const st=tlbEl._steps;",
    "att(st.length===9,'rendu : 9 cases (vu '+st.length+')');",
    "att(/\\bsel\\b/.test(st[6].className),'rendu : esquisse sélectionnée en surbrillance');",
    "att(/\\boff\\b/.test(st[7].className)&&/\\boff\\b/.test(st[6].className)&&!/\\boff\\b/.test(st[5].className),'rendu : marqueur avant E2 → E2 et son esquisse grisées, X1 active');",
    "att(/\\bwarn\\b/.test(st[5].className),'rendu : X1 ⚠');",
    "att(/E1/.test(st[2].title),'rendu : survol = nom');",
    "tlbClick(tlbSteps()[2],{});att(sel.kind==='feature'&&sel.id==='e1'&&treeSel[0]==='e1','clic : sélection de la fonction (même sel que l arbre)');",
    "tlbClick(tlbSteps()[0],{});att(sel.kind==='cg'&&sel.id==='c0','clic : sélection d une construction');",
    "tlSetPtr(null);",
    // --- glisser-déposer : même corps, blocs entiers, une étape d'annulation
    "doc.cgeo=[];doc.sketches=[];",
    "doc.features=[{id:'a1',type:'extrude',name:'A1',body:'b1'},{id:'a2',type:'extrude',name:'A2',body:'b1'},{id:'b_1',type:'extrude',name:'B1',body:'b2'},{id:'a3',type:'extrude',name:'A3',body:'b1'}];",
    "const F=()=>doc.features.map(f=>f.id).join(',');",
    "att(tlbMoveTo('a1',2)===true,'A1 glissée entre A2 et B1');",
    "att(F()==='a2,a1,b_1,a3','A1 après A2, avant B1 (vu '+F()+')');",
    "att(docUndo()===true&&F()==='a1,a2,b_1,a3','une seule étape d annulation (vu '+F()+')');",
    "att(tlbMoveTo('a3',0)===true,'A3 glissée en tête');",
    "att(F()==='a3,a1,a2,b_1','A3 en tête (vu '+F()+')');",
    "docUndo();",
    "att(tlbMoveTo('a1',4)===true,'A1 glissée en fin');",
    "att(F()==='a2,b_1,a3,a1','A1 en fin (vu '+F()+')');",
    "docUndo();",
    "att(tlbMoveTo('a3',3)===false&&F()==='a1,a2,b_1,a3','dépose sur place : rien ne bouge');",
    "att(tlbMoveTo('b_1',0)===false&&F()==='a1,a2,b_1,a3','B1 seule de son corps : ne bouge pas');",
    // bloc de répétition entier ; les instances ne sont pas des étapes du bandeau
    "doc.features=[{id:'x1',type:'extrude',name:'X1',body:'b1'},{id:'rp',type:'repeat',name:'R',body:'b1',base:[]},{id:'k1',type:'extrude',name:'K1',body:'b1',repeatId:'rp'},{id:'k2',type:'extrude',name:'K2',body:'b1',repeatId:'rp'},{id:'x2',type:'extrude',name:'X2',body:'b1'}];",
    "att(ids()==='x1,rp,x2','instances repliées dans leur répétition (vu '+ids()+')');",
    "att(tlbMoveTo('rp',3)===true&&F()==='x1,x2,rp,k1,k2','bloc répétition glissé en fin, entier (vu '+F()+')');",
    "att(tlbMoveTo('k1',0)===false,'instance seule : non déplaçable');",
    // --- marqueur posé par l'utilisateur : ni l'esquisse ni l'extrusion ne le déplacent
    "doc.sketches=[{id:'t1',name:'EsqT1',plane:'XY',entities:[],points:{}}];",
    "doc.features=[{id:'m1',type:'extrude',name:'M1',sketchId:'t1',body:'b1'},{id:'m2',type:'extrude',name:'M2',body:'b1'},{id:'m3',type:'extrude',name:'M3',body:'b1'}];",
    "tlSetPtr(doc.features[1]);",
    "doc.sketches.push({id:'t2',name:'EsqT2',plane:'XZ',entities:[],points:{}});",
    "openSketch('t2');closeSketch(true);",
    "att(tlMark==='m2','nouvelle esquisse fermée : marqueur toujours avant M2 (vu '+tlMark+')');",
    "extDynNew('t2');extDyn=null;",
    "att(tlMark==='m2'&&doc.features[1].sketchId==='t2','extrusion validée : insérée au marqueur, marqueur inchangé (vu '+tlMark+')');",
    "openSketch('t1');att(tlMark==='m1','esquisse consommée : verrou avant sa fonction');closeSketch(false);",
    "att(tlMark==='m2','sortie d esquisse consommée : marqueur de l utilisateur restauré (vu '+tlMark+')');",
    "tlSetPtr(null);openSketch('t1');closeSketch(false);att(tlMark===null,'sans marqueur : sortie = tout rejoué');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  x '+m));}",
    "else p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'timeline.js'});
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
