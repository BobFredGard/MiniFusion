// 2026-10-16-005 : raccourcis d'esquisse (F1…F12, H) et 3D (H R F C M), perçage répétable.
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const {ctx}=loadApp();
  const R=[
'const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};',
'const L=(id,a,b)=>({id:id,t:"line",p1:a,p2:b});',
'const mount=sk=>{ensureSketchBasis(sk);doc.sketches=[sk];doc.features=[];openSketch(sk.id);{const ov=$("sketchOverlay");ov.classList=Object.assign({},ov.classList,{contains:()=>true});}return skEdit;};',
'const key=(k,ex)=>{let pd=false;const ev=Object.assign({type:"keydown",key:k,target:document.body,shiftKey:false,ctrlKey:false,altKey:false,metaKey:false,repeat:false,preventDefault(){pd=true;},stopPropagation(){}},ex||{});window.dispatchEvent(ev);return pd;};',
'const has=(sk,t,f)=>(sk.constraints||[]).some(c=>c.type===t&&(!f||f(c)));',
'let sk=mount({id:"a",name:"A",plane:"XY",visible:true,points:{O:{x:0,y:0},p0:{x:0,y:0.5},p1:{x:50,y:2},p2:{x:52,y:30},p3:{x:-1,y:31},q:{x:80,y:80},r:{x:81,y:80}},',
'  entities:[L("e0","p0","p1"),L("e1","p1","p2"),L("e2","p2","p3"),L("e3","p3","p0"),L("f","q","r")],constraints:[],dims:[],seq:50});',
// F2 : H ou V selon l'inclinaison
'skSel=null;skSelX=["e0","e1","e2","e3"].map(id=>({kind:"ent",id}));let pd=key("F2");',
'A(pd&&has(sk,"h",c=>c.line==="e0")&&has(sk,"v",c=>c.line==="e1")&&has(sk,"h",c=>c.line==="e2")&&has(sk,"v",c=>c.line==="e3"),"F2 : chaque ligne reçoit H (plutôt horizontale) ou V (plutôt verticale), touche interceptée");',
// F5 parallèle · F6 perpendiculaire · F4 égal · F12 blocage
'skSelX=[{kind:"ent",id:"e0"},{kind:"ent",id:"f"}];key("F5");A(has(sk,"parallel"),"F5 : parallèle (et plus de rechargement de page)");',
'skSelX=[{kind:"ent",id:"e1"},{kind:"ent",id:"f"}];key("F4");A(has(sk,"equal"),"F4 : égalité");',
'skSelX=[{kind:"ent",id:"f"}];key("F12");A(has(sk,"fix"),"F12 : blocage");',
// F1 : 2 points → fusion
'skSel=null;skSelX=[{kind:"point",pid:"r"},{kind:"point",pid:"q"}];const n0=Object.keys(sk.points).length;key("F1");',
'A(Object.keys(sk.points).length===n0-1,"F1 : 2 points sélectionnés → coïncidence (fusion)");',
// H : outil centre de perçage
'key("h");A(skTool==="hpoint","H : outil Centre de perçage");',
// 3D : H R F C M → boutons
'closeSketch(false);{const ov=$("sketchOverlay");ov.classList=Object.assign({},ov.classList,{contains:()=>false});}',
'const hit={};["btnHole","btnRevolve","btnFillet","btnChamfer","btnRepeat"].forEach(id=>{const b=$(id);if(b)b.click=()=>{hit[id]=1;};});',
'["h","R","f","C","m"].forEach(k=>key(k));',
'A(hit.btnHole&&hit.btnRevolve&&hit.btnFillet&&hit.btnChamfer&&hit.btnRepeat,"3D : H perçage · R révolution · F congés · C chanfreins · M répétitions ("+Object.keys(hit).join(",")+")");',
'const hit2=Object.keys(hit).length;key("c",{ctrlKey:true});A(Object.keys(hit).length===hit2,"3D : Ctrl+C n\\u2019ouvre pas les chanfreins");',
// répétition d'un perçage
'const hs={id:"hs",name:"Centres",plane:"XY",origin:[0,0,10],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{O:{x:0,y:0},h0:{x:5,y:5}},entities:[{id:"c0",t:"cpoint",p:"h0",hole:true}],constraints:[],dims:[],seq:10,visible:false};',
'doc.sketches=[hs];doc.features=[{id:"ho1",type:"hole",name:"Perçage",sketchId:"hs",kind:"simple",d:6,depth:8,visible:true,thread:{size:"M8",p:1.25,len:10}}];',
'A(repCanFeature("ho1"),"Répétition : un perçage peut être coché");',
'const rp={id:"rp1",type:"repeat",name:"Linéaire",mode:"lin",copies:3,dist:20,axis:"X",base:["ho1"],visible:true};doc.features.push(rp);repGenChildren(rp);',
'const kids=doc.features.filter(f=>f.repeatId==="rp1");',
'const ox=kids.map(k=>doc.sketches.find(s=>s.id===k.sketchId).origin[0]).sort((a,b)=>a-b);',
'A(kids.length===3&&kids.every(k=>k.type==="hole"&&k.thread&&k.thread.size==="M8")&&ox.join(",")==="20,40,60","Répétition linéaire ×3 du perçage : 3 perçages taraudés M8, esquisses décalées de 20 ("+ox.join(",")+")");',
// aide
'A(!!$("btnAide"),"Aide : bouton ❔ Aide présent (sous le badge de version)");',
'let opened=0;const oA=openAide;openAide=function(){opened++;};',
'key("F1");A(opened===1,"Aide : F1 hors esquisse ouvre l’aide");',
'key("?");A(opened===2,"Aide : « ? » ouvre l’aide");',
'mount({id:"z",name:"Z",plane:"XY",visible:true,points:{O:{x:0,y:0}},entities:[],constraints:[],dims:[],seq:5});key("F1");A(opened===2,"Aide : en esquisse, F1 reste la coïncidence (pas d’aide)");openAide=oA;',
'return out;'
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== 2026-10-16-005 : raccourcis + perçage répétable ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,900));process.exit(1);});
