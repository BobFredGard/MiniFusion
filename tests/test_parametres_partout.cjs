// V0.11.15 : paramètres ƒx PARTOUT — un paramètre créé à la volée (cote nommée d'esquisse,
// paramètre libre) s'utilise dans les commandes de création (dépouille, coque, répétition,
// congé…) avec le LIEN conservé, et tout autre champ numérique accepte une expression
// (« L + 2 », « P1*3 », « 12,5/4 ») évaluée à la validation (filet global).
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const {ctx}=loadApp();
  const R=[
'const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};',
'const near=(a,b)=>Math.abs(a-b)<1e-6;',
'const box={id:"skA",name:"Plaque",plane:"XY",origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{O:{x:0,y:0},a:{x:0,y:0},b:{x:100,y:0},c:{x:100,y:60},d:{x:0,y:60}},',
'  entities:[{id:"l1",t:"line",p1:"a",p2:"b"},{id:"l2",t:"line",p1:"b",p2:"c"},{id:"l3",t:"line",p1:"c",p2:"d"},{id:"l4",t:"line",p1:"d",p2:"a"}],',
'  constraints:[],dims:[{id:"W",type:"length",line:"l1",value:100,chk:1,name:"L"}],seq:20,visible:false};',
'doc.sketches=[box];doc.params=[{name:"P1",expr:"4",value:4}];doc.features=[];parResolve();',
// 1. lecture ponctuelle
'let r=parFxNum("L/4 + P1");A(r.ok&&near(r.v,29),"1 : « L/4 + P1 » = 29");',
'r=parFxNum("12,5 / 4");A(r.ok&&near(r.v,3.125),"1b : « 12,5 / 4 » = 3,125");',
'r=parFxNum("Zorg*2");A(!r.ok&&/inconnu/.test(r.msg),"1c : nom inconnu refusé");',
// 2. porteur provisoire (commande en cours) : l'expression est évaluée et gardée
'const dm={angle:5};r=parFxSet(dm,"angle","P1/2");',
'A(r.ok&&near(r.v,2)&&dm.expr.angle==="P1/2"&&dm.angle===5,"2 : commande en cours : « P1/2 » → 2, expression mémorisée, valeur appliquée par la commande");',
'r=parFxSet(dm,"angle","Zorg");A(!r.ok&&dm.expr.angle==="P1/2","2b : erreur → l\\u2019expression précédente reste");',
// 3. création : la fonction hérite du lien, qui suit le paramètre
'dm.angle=2;const nf={id:"dr1",type:"xdraft",name:"D",angle:2,faces:[],visible:true};parFxCopy(dm,nf,["angle"]);doc.features.push(nf);',
'doc.params[0].expr="6";parApplyAll();',
'A(nf.expr.angle==="P1/2"&&near(nf.angle,3),"3 : dépouille créée : P1 = 6 → angle 3 ("+nf.angle+")");',
// 4. clé renommée (extrusion : dist → distance) et édition (parFxFrom)
'const en={dist:20};parFxSet(en,"dist","Ep = L/5");const ef={id:"ex1",type:"extrude",distance:-20,op:"cut"};parFxCopy(en,ef,{dist:"distance"});',
'A(ef.expr.distance==="L/5"&&ef.pname.distance==="Ep","4 : extrusion : dist → distance, nom « Ep » repris");',
'doc.features.push(ef);parApplyAll();A(near(ef.distance,-20),"4b : la valeur ƒx garde le sens de la découpe ("+ef.distance+")");',
'const ed=parFxFrom(ef,{dist:20},{dist:"distance"});r=parFxSet(ed,"dist","Ep = L/4");',
'A(r.ok&&near(r.v,25),"4c : édition : son propre nom « Ep » n\\u2019est pas « déjà utilisé »");',
// 5. répétition : les clés du mode seulement
'const rm={type:"lin",dist:10,angle:360};parFxSet(rm,"dist","L/10");const rp={id:"rp1",type:"repeat",dist:10};parFxCopy(rm,rp,["dist"]);',
'A(rp.expr&&rp.expr.dist==="L/10"&&!("angle" in rp.expr),"5 : répétition linéaire : distance liée");',
// 6. une saisie en clair efface l'expression
'const cm={thick:2};parFxSet(cm,"thick","P1/3");cm.expr={};const sh={id:"sh1",expr:{thick:"P1"}};parFxCopy(cm,sh,["thick"]);',
'A(!sh.expr,"6 : valeur saisie en clair → plus d\\u2019expression sur la coque");',
// 7. filet global : champ numérique quelconque
'const mk=(v,mode)=>({tagName:"INPUT",type:"text",inputMode:mode||"",value:v,dataset:{},readOnly:false,disabled:false,closest:()=>null,dispatchEvent:()=>{}});',
'let t=mk("10","");t._fxPrev="10";t.value="L + 2";parFxGlobal({type:"change",target:t});',
'A(t.value==="102","7 : champ numérique : « L + 2 » → 102 avant le gestionnaire du champ ("+t.value+")");',
't=mk("","decimal");t._fxPrev="";t.value="P1*2,5";parFxGlobal({type:"keydown",key:"Enter",target:t});',
'A(t.value==="15","7b : champ décimal, Entrée : « P1*2,5 » → 15 ("+t.value+")");',
't=mk("8","");t._fxPrev="8";t.value="2*Zorg";parFxGlobal({type:"change",target:t});',
'A(t.value==="8","7c : nom inconnu → valeur d\\u2019avant (jamais « 2 » lu par parseFloat)");',
't=mk("Corps1","");t._fxPrev="Corps1";t.value="L";parFxGlobal({type:"change",target:t});',
'A(t.value==="L","7d : champ texte (un nom) : laissé tel quel");',
't=mk("10","decimal");t._parFx=1;t._fxPrev="10";t.value="L";parFxGlobal({type:"change",target:t});',
'A(t.value==="L","7e : champ parFx : laissé à son gestionnaire (le lien est gardé)");',
't=mk("10","decimal");t._fxPrev="10";t.value="Ep = 3";parFxGlobal({type:"change",target:t});',
'A(t.value==="Ep = 3","7f : « nom = … » hors fonction : non interprété");',
'r=parFxNum("pi");A(r.ok&&r.v===Math.PI,"8 : constante pi disponible partout (pleine précision)");',
't=mk("1","decimal");t._fxPrev="1";t.value="2*pi";parFxGlobal({type:"change",target:t});',
'A(Math.abs(parseFloat(t.value)-2*Math.PI)<1e-12,"8b : « 2*pi » → "+t.value+" (12 décimales)");',
'return out;'
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== V0.11.15 : paramètres ƒx partout ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
