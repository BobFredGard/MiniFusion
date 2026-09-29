// Menu contextuel d'esquisse : il doit s'ouvrir sur 2 droites sélectionnées,
// SANS usage préalable de l'outil Décaler, et le relâchement du clic droit ne
// doit jamais le refermer.
// Régressions couvertes :
//  - skOffsetD non déclaré → ReferenceError avant display='block' (menu jamais affiché) ;
//  - handler document 'click' fermant le menu sur le click-button-2 qui suit le clic droit.
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    'const out={fails:[]};',
    'const A=(c,m)=>{if(!c)out.fails.push(m);};',
    'const disp=()=>{try{return document.getElementById("skCtxMenu").style.display||"none";}catch(e){return "?";}};',
    'const items=()=>{try{return document.getElementById("skCtxMenu").children.length;}catch(e){return -1;}};',
    'const labels=()=>{try{return document.getElementById("skCtxMenu").children.slice().map(b=>b.textContent||"");}catch(e){return [];}};',
    'doc.features=[];doc.sketches=[];',
    'const sk={id:"s1",name:"S",plane:"XY",visible:true,',
    '  points:{O:{x:0,y:0},a:{x:0,y:0},b:{x:40,y:0},c:{x:0,y:30},d:{x:40,y:30}},',
    '  entities:[{id:"l1",t:"line",p1:"a",p2:"b"},{id:"l2",t:"line",p1:"c",p2:"d"}],',
    '  constraints:[],dims:[],seq:10};',
    'ensureSketchBasis(sk);doc.sketches.push(sk);',
    'openSketch("s1");',
    'A(!!skEdit,"esquisse ouverte");',
    'const C=(wx,wy)=>{const r=svg.getBoundingClientRect();const p=w2s(wx,wy);return [r.left+p[0],r.top+p[1]];};',
    'const ev=(type,x,y,extra)=>{const r=Object.assign({type:type,button:0,buttons:0,shiftKey:false,ctrlKey:false,altKey:false,detail:0,preventDefault:function(){},stopPropagation:function(){}},extra||{});r.clientX=x;r.clientY=y;return r;};',
    'const downL=(x,y,sh)=>svg.dispatchEvent(ev("pointerdown",x,y,{button:0,shiftKey:!!sh,detail:1}));',
    'const upL=(x,y)=>svg.dispatchEvent(ev("pointerup",x,y,{button:0}));',
    'const clickL=(x,y)=>svg.dispatchEvent(ev("click",x,y,{button:0}));',
    'const rightSeq=(x,y)=>{svg.dispatchEvent(ev("pointerdown",x,y,{button:2}));',
    '  svg.dispatchEvent(ev("contextmenu",x,y,{button:2}));',
    '  svg.dispatchEvent(ev("pointerup",x,y,{button:2}));',
    '  svg.dispatchEvent(ev("click",x,y,{button:2}));};',
    'const docClick=(btn)=>document.dispatchEvent(ev("click",0,0,{button:btn}));',
    // T0 : 1 ligne -> menu 1 ligne
    'let p=C(20,0);downL(p[0],p[1]);upL(p[0],p[1]);clickL(p[0],p[1]);',
    'A(skSel&&skSel.kind==="ent"&&skSel.id==="l1","T0 : ligne1 sélectionnée");',
    'p=C(20,0);rightSeq(p[0],p[1]);',
    'A(disp()==="block","T0 : menu affiché pour 1 ligne (sans usage préalable de Décaler)");',
    'A(labels().some(t=>t.indexOf("Longueur")>=0),"T0 : entrées 1 ligne présentes");',
    'try{document.getElementById("skCtxMenu").style.display="none";}catch(e){}',
    // T1+T2 : 2 lignes (Shift+clic) -> menu 2 lignes, sans usage préalable de Décaler
    'p=C(20,0);downL(p[0],p[1]);upL(p[0],p[1]);clickL(p[0],p[1]);',
    'p=C(20,30);downL(p[0],p[1],true);upL(p[0],p[1]);clickL(p[0],p[1]);',
    'A(skSel&&skSel.id==="l1"&&skSelX.length===1&&skSelX[0].id==="l2","T1 : 2 droites sélectionnées");',
    'p=C(60,15);rightSeq(p[0],p[1]);',
    'A(disp()==="block","T1 : menu affiché pour 2 lignes DANS LE VIDE (sans Décaler préalable)");',
    'A(labels().some(t=>t.indexOf("Parallèle")>=0),"T2 : entrées 2 lignes présentes (Parallèle)");',
    // T3 : clic droit (button 2) au niveau document ne referme pas
    'docClick(2);',
    'A(disp()==="block","T3 : le relâchement du clic droit ne referme pas le menu");',
    // T4 : clic gauche (button 0) au niveau document referme (comportement voulu conservé)
    'docClick(0);',
    'A(disp()==="none","T4 : le clic gauche referme toujours le menu");',
    'return out;'
  ].join('\n');
  const vm=require('vm');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('skEdit + sélection 2 lignes + menu contextuel');
  if(o.fails&&o.fails.length){console.log('ECHECS :');o.fails.forEach(m=>console.log('  x '+m));process.exit(1);}
  console.log('TOUT EST CONFORME');
  process.exit(0);
})().catch(e=>{console.log('FATAL/FAIL',String((e&&e.message)||e).slice(0,600));process.exit(1);});
