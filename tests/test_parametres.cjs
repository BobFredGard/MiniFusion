// 2026-10-16-002 : paramètres (cotes nommées « nom = valeur », expressions ƒx, paramètres
// libres, propagation entre esquisses, renommage, cycles) + congés multi-coins pilotés
// par UNE seule cote (contrainte « égal » sur les suivants), comme Fusion 360.
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const {ctx}=loadApp();
  const R=[
'const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};',
'const near=(a,b,t)=>Math.abs(a-b)<(t||1e-6);',
'const L=(id,a,b)=>({id:id,t:"line",p1:a,p2:b});',
'const mount=(sk,keep)=>{ensureSketchBasis(sk);if(keep)doc.sketches.push(sk);else{doc.sketches=[sk];doc.features=[];doc.params=[];}openSketch(sk.id);return skEdit;};',
'const rect=(id)=>({id:id,name:id,plane:"XY",visible:true,points:{O:{x:0,y:0},p0:{x:0,y:0},p1:{x:50,y:0},p2:{x:50,y:30},p3:{x:0,y:30}},',
'  entities:[L("e0","p0","p1"),L("e1","p1","p2"),L("e2","p2","p3"),L("e3","p3","p0")],',
'  constraints:[{id:"c0",type:"h",line:"e0"},{id:"c1",type:"v",line:"e1"},{id:"c2",type:"h",line:"e2"},{id:"c3",type:"v",line:"e3"},{id:"co",type:"coincident",a:"p0",b:"O"}],',
'  dims:[{id:"W",type:"length",line:"e0",value:50,chk:1,ox:0,oy:0},{id:"H",type:"length",line:"e1",value:30,chk:1,ox:0,oy:0}],seq:50});',
'const set=(sk,id,txt)=>{const d=sk.dims.find(x=>x.id===id);const r=parDimCommit(sk,d,txt);if(r.ok){d.value=r.nv;parApplyAll();solveSketch(sk);}return r;};',
'const wid=sk=>Math.abs(sk.points.p1.x-sk.points.p0.x),hei=sk=>Math.abs(sk.points.p2.y-sk.points.p1.y);',
// ── évaluateur
'const ev=s=>parEval(s,n=>{throw new Error(n)});',
'A(ev("2*(3+4)")===14&&ev("12,5")===12.5&&ev("max(3; 7)")===7&&ev("max(3, 7)")===7&&ev("sqrt(16)")===4&&near(ev("sin(30)"),0.5)&&ev("2^3")===8&&ev("-4+10 mm")===6,"1 : évaluateur (+ - * / ^, décimale « , », max(a; b), sqrt, sin en degrés, « mm »)");',
'let e1=null;try{ev("3*(2");}catch(e){e1=e.message;}A(!!e1,"1b : expression invalide refusée ("+e1+")");',
// ── cote nommée + expression
'let sk=mount(rect("s1"));',
'let r=set(sk,"W","L = 60");',
'A(r.ok&&sk.dims.find(d=>d.id==="W").name==="L"&&near(wid(sk),60),"2 : « L = 60 » nomme la cote et pilote la largeur ("+wid(sk).toFixed(3)+")");',
'r=set(sk,"H","L/2");',
'A(r.ok&&sk.dims.find(d=>d.id==="H").expr==="L/2"&&near(hei(sk),30),"3 : cote ƒx « L/2 » = 30");',
'r=set(sk,"W","80");',
'A(r.ok&&near(wid(sk),80)&&near(hei(sk),40),"4 : L passe à 80 → la hauteur ƒx suit (40) ("+hei(sk).toFixed(3)+")");',
'A(parDecor("W","80.00")==="L=80.00"&&parDecor("H","40.00")==="ƒx 40.00","5 : étiquettes « L=80.00 » et « ƒx 40.00 »");',
'A(parDimInputText(sk.dims.find(d=>d.id==="W"))==="L = 80"&&parDimInputText(sk.dims.find(d=>d.id==="H"))==="L/2","5b : saisie pré-remplie « L = 80 » / « L/2 »");',
// ── erreurs : cycle, nom inconnu, nom pris, nom réservé
'r=set(sk,"H","Hh = L/2");r=set(sk,"W","L = Hh*2");',
'A(!r.ok&&/circulaire/.test(r.msg)&&sk.dims.find(d=>d.id==="W").expr==null&&near(wid(sk),80),"6 : référence circulaire refusée, la cote reste à 80 ("+r.msg+")");',
'r=set(sk,"H","Zorg*2");A(!r.ok&&/inconnu/.test(r.msg),"7 : nom inconnu refusé ("+r.msg+")");',
'r=set(sk,"H","L = 3");A(!r.ok&&/déjà utilisé/.test(r.msg),"8 : nom déjà pris refusé");',
'r=set(sk,"H","sqrt = 3");A(!r.ok&&/réservé/.test(r.msg),"8b : nom réservé refusé");',
// ── renommage : les expressions suivent
'r=set(sk,"H","L/2");r=set(sk,"W","Long = 80");',
'A(r.ok&&sk.dims.find(d=>d.id==="H").expr==="Long/2","9 : renommer L → Long met à jour les expressions (Long/2)");',
// ── paramètre libre + 2e esquisse
'doc.params.push({name:"Ep",expr:"5"});',
'const s2=mount({id:"s2",name:"s2",plane:"XY",visible:true,points:{O:{x:0,y:0},c:{x:100,y:0}},entities:[{id:"k",t:"circle",pc:"c",r:3}],constraints:[],dims:[{id:"D",type:"diameter",ent:"k",value:6,chk:1,ox:0,oy:0}],seq:20},true);',
'r=set(s2,"D","Long/4+Ep");',
'A(r.ok&&near(entById(s2,"k").r,12.5),"10 : autre esquisse : Ø = Long/4 + Ep = 25 (R "+entById(s2,"k").r.toFixed(3)+")");',
'const s1=doc.sketches.find(s=>s.id==="s1");s1.dims.find(d=>d.id==="W").value=100;parApplyAll();',
'A(near(entById(s2,"k").r,15)&&near(hei(s1),50),"11 : Long → 100 : l\\u2019autre esquisse (Ø30) et la hauteur (50) suivent");',
'doc.params[0].expr="Long/20";parApplyAll();',
'A(near(doc.params[0].value,5)&&near(entById(s2,"k").r,15),"12 : paramètre libre en expression (Ep = Long/20 = 5)");',
'doc.params[0].expr="Long/10";parResolve();parApplyAll();',
'A(near(entById(s2,"k").r,17.5),"12b : fenêtre ƒx (2 évaluations successives) : l’esquisse est bien résolue (R "+entById(s2,"k").r.toFixed(3)+")");',
'doc.params[0].expr="Long/20";parApplyAll();',
// ── enregistrement
'const js=serialise(false),o=JSON.parse(js);',
'A(Array.isArray(o.params)&&o.params[0].name==="Ep"&&o.sketches[0].dims.some(d=>d.name==="Long")&&o.sketches[1].dims.some(d=>d.expr==="Long/4+Ep"),"13 : paramètres, noms et expressions enregistrés dans le fichier");',
'try{await deserialise(js);}catch(e){}A(Array.isArray(doc.params)&&doc.params[0].name==="Ep","13b : relus à l\\u2019ouverture");',
// ── congés multi-coins : UNE cote
'sk=mount(rect("f1"));',
'skSel=null;skSelX=["e0","e1","e2","e3"].map(id=>({kind:"ent",id}));skApplyFilletSel();',
'const arcs=sk.entities.filter(e=>e.t==="arc"),rds=sk.dims.filter(d=>d.type==="radius"),eqs=sk.constraints.filter(c=>c.type==="equal");',
'A(arcs.length===4&&rds.length===1&&eqs.length===3,"14 : 4 lignes sélectionnées → 4 congés, UNE cote R, 3 « égal » ("+arcs.length+"/"+rds.length+"/"+eqs.length+")");',
'r=set(sk,rds[0].id,"Rc = 6");',
'A(r.ok&&arcs.every(a=>near(entById(sk,a.id).r,6,1e-5))&&(skAudit(sk).residual||0)<1e-5,"15 : R → 6 (nommé Rc) : les 4 congés suivent");',
'A(skDofInfo(sk).dof===0,"16 : esquisse complète (0 DDL) avec la cote unique + égal");',
'const pv=sk.points.p0;A(pv&&near(pv.x,0)&&near(pv.y,0)&&sk.constraints.filter(c=>c.type==="online"&&c.p==="p0").length===2,"16b : coin accroché à l’origine congé → COIN VIRTUEL sur les 2 droites (ancrage gardé)");',
// ── outil Congé : clic sur les coins, une seule cote pour la passe
'sk=mount(rect("f2"));',
'const C=(wx,wy)=>{const q=svg.getBoundingClientRect();const p=w2s(wx,wy);return [q.left+p[0],q.top+p[1]];};',
'const E=(t,p)=>({type:t,button:0,buttons:t==="pointerdown"?1:0,shiftKey:false,ctrlKey:false,altKey:false,metaKey:false,detail:1,pointerId:1,clientX:p[0],clientY:p[1],preventDefault(){},stopPropagation(){}});',
'const click=(x,y)=>{svg.dispatchEvent(E("pointerdown",C(x,y)));svg.dispatchEvent(E("pointerup",C(x,y)));};',
'skCancelDraft();skTool="fillet";click(50,0);click(50,30);',
'A(sk.entities.filter(e=>e.t==="arc").length===2&&sk.dims.filter(d=>d.type==="radius").length===1&&sk.constraints.some(c=>c.type==="equal"),"17 : outil Congé : clic sur 2 coins → 2 congés, 1 cote, « égal »");',
'skCancelDraft();skTool="fillet";click(0,30);',
'A(sk.dims.filter(d=>d.type==="radius").length===2,"18 : Échap / nouvelle passe → nouvelle cote");',
'return out;'
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== 2026-10-16-002 : paramètres + congés multi-coins ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,900));process.exit(1);});
