// 2026-10-15-008 : échelle de l'esquisse — petites pièces, zoom fort.
// Retour : « je veux pouvoir faire des pièces petites et zoomer + dans l'esquisse ;
// on ne peut sélectionner que les points des lignes et pas les lignes ».
// Causes : tolérances « SK_PICK + 2 mm » (2 mm = 80 px à 40 px/mm : la zone des
// extrémités couvrait la ligne), disque de 60 px autour des étiquettes de cote qui
// volait les clics, zoom plafonné à 80 px/mm, seuils fixes 0,5 mm (décalage, arc).
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    'const out={fails:[],log:[]};',
    'const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};',
    'doc.features=[];doc.sketches=[];',
    // pièce de 3 mm : ligne de 2 mm + cote de longueur
    'const sk={id:"s1",name:"S",plane:"XY",visible:true,',
    '  points:{O:{x:0,y:0},a:{x:1,y:1},b:{x:3,y:1},c:{x:3,y:2.5}},',
    '  entities:[{id:"l1",t:"line",p1:"a",p2:"b"},{id:"l2",t:"line",p1:"b",p2:"c"}],',
    '  constraints:[],dims:[{id:"d1",type:"length",line:"l2",value:1.5,ox:0,oy:0}],seq:10};',
    'ensureSketchBasis(sk);doc.sketches.push(sk);openSketch("s1");',
    'const C=(wx,wy)=>{const r=svg.getBoundingClientRect();const p=w2s(wx,wy);return [r.left+p[0],r.top+p[1]];};',
    'const ev=(type,x,y,extra)=>{const r=Object.assign({type:type,button:0,buttons:0,shiftKey:false,ctrlKey:false,altKey:false,detail:1,pointerId:1,preventDefault:function(){},stopPropagation:function(){}},extra||{});r.clientX=x;r.clientY=y;return r;};',
    'const click=(wx,wy)=>{const p=C(wx,wy);svg.dispatchEvent(ev("pointerdown",p[0],p[1],{buttons:1}));svg.dispatchEvent(ev("pointerup",p[0],p[1]));svg.dispatchEvent(ev("click",p[0],p[1]));};',
    'skTool="select";',
    // zoom fort : 200 px/mm, centré sur la ligne
    'skView={s:200,cx:2,cy:1.5};skUpdateTols();drawSketch2D();',
    'A(typeof SK_SCALE_MAX!=="undefined"&&SK_SCALE_MAX>=500,"Z0 : zoom jusqu’à 600 px/mm (était 80)");',
    // clic sur la ligne à 0,15 mm de l’extrémité a (30 px) : avant = point (zone 2,04 mm)
    'skSel=null;skSelX=[];click(1.15,1.0);',
    'A(skSel&&skSel.kind==="ent"&&skSel.id==="l1","Z1 : à 200 px/mm, clic à 30 px de l’extrémité → la LIGNE est prise ("+JSON.stringify(skSel)+")");',
    'skSel=null;click(1.02,1.0);',
    'A(skSel&&skSel.kind==="point"&&skSel.pid==="a","Z2 : clic à 4 px de l’extrémité → le POINT reste prioritaire");',
    // l’étiquette de cote de l2 ne vole plus un clic sur l2 à 30 px d’elle
    'dimById(sk,"d1").w=0.15;drawSketch2D();', // ligne de cote à 0,15 mm = 30 px de l2
    'const lp=dimLabelPos(sk,dimById(sk,"d1"));const[lx,ly]=w2s(lp.x,lp.y);',
    'const tx=3,ty=Math.max(1.05,Math.min(2.45,lp.y+0.02));const[qx,qy]=w2s(tx,ty);',
    'A(Math.hypot(qx-lx,qy-ly)<60,"Z3a : clic placé à moins de 60 px de l’étiquette (ancien disque voleur)");',
    'out.log.push("étiquette à "+Math.round(Math.hypot(qx-lx,qy-ly))+" px du clic");',
    'skSel=null;click(tx,ty);',
    'A(skSel&&skSel.kind==="ent"&&skSel.id==="l2","Z3 : ligne prise près d’une étiquette de cote ("+JSON.stringify(skSel)+")");',
    // décalage 0,2 mm sur petite pièce
    'skSel={kind:"ent",id:"l1"};skSelX=[];',
    'const r=skOffsetApply(sk,["l1"],0.2,{x:2,y:1.2});',
    'A(r&&r.ok,"Z4 : décalage de 0,2 mm accepté (seuil 0,5 mm retiré) "+(r&&r.msg||""));',
    // tolérances en pixels, quelle que soit l’échelle
    'const g=n=>{try{return eval(n);}catch(e){return NaN;}};skView.s=1;skUpdateTols();const t1=[SK_PICK,g("SK_PT"),g("SK_PICKX")];skView.s=100;skUpdateTols();const t2=[SK_PICK*100,g("SK_PT")*100,g("SK_PICKX")*100];',
    'A(Math.abs(t1[0]-t2[0])<1e-9&&Math.abs(t1[1]-t2[1])<1e-9&&Math.abs(t1[2]-t2[2])<1e-9,"Z5 : tolérances 100 % en pixels ("+t1.join("/")+" px)");',
    // cadrage d’une esquisse vide : ~130 mm sur le petit côté (pièces ~100 mm)
    'const sk2={id:"s2",name:"V",plane:"XY",visible:true,points:{O:{x:0,y:0}},entities:[],constraints:[],dims:[],seq:5};',
    'ensureSketchBasis(sk2);doc.sketches.push(sk2);closeSketch(false);openSketch("s2");',
    'const sz=svgSize();const vis=Math.min(sz.W,sz.H)/skView.s;',
    'A(Math.abs(vis-130)<1,"Z6 : esquisse vide → "+vis.toFixed(1)+" mm visibles sur le petit côté");',
    // cadrage d’une pièce de 0,5 mm : plus de plancher à 1 mm
    'const sk3={id:"s3",name:"M",plane:"XY",visible:true,points:{O:{x:0,y:0},a:{x:10,y:10},b:{x:10.5,y:10}},entities:[{id:"m",t:"line",p1:"a",p2:"b"}],constraints:[],dims:[],seq:5};',
    'ensureSketchBasis(sk3);doc.sketches.push(sk3);closeSketch(false);openSketch("s3");',
    'A(skView.s>200,"Z7 : une pièce de 0,5 mm est cadrée en grand ("+skView.s.toFixed(0)+" px/mm)");',
    'return out;'
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== 2026-10-15-008 : échelle de l’esquisse (petites pièces, zoom fort) ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,900));process.exit(1);});
