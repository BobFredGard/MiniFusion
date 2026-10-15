// 2026-10-15-007 : esquisse consolidée — contrainte COLINÉAIRE + défauts corrigés.
//  1) Colinéaire posée par la sélection (2 lignes) : réglée, extrémités sur la même droite ;
//     refusée sur 2 lignes ⟂ ; une ∥ déjà posée sur la paire devient redondante (purgée) ;
//     annulable ; comptée 2 DDL ; recopiée sur la moitié d'une ligne scindée.
//  2) L'AUDIT voit enfin ∥ et ⟂ violées (elles en étaient absentes : jamais de ⚠,
//     et le choix LM/relaxation ignorait leur violation).
//  3) Tangence posée dans l'ordre « cercle puis ligne » : ANNULABLE (skPushUndo manquait).
//  4) Registre : chaque type de contrainte connu a nom + icône ; la liste n'a plus de glyphes.
//  5) Menu contextuel 2 lignes : entrée Colinéaire.
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    'const out={fails:[],log:[]};',
    'const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push("ok · "+m);};',
    'const mk=(pts,ents,cons)=>{const sk={id:"c"+(mk.n=(mk.n||0)+1),name:"C",plane:"XY",visible:true,points:pts,entities:ents,constraints:cons||[],dims:[],seq:100};',
    '  ensureSketchBasis(sk);doc.features=[];doc.sketches=[sk];openSketch(sk.id);return skEdit;};',
    'const L=(id,p1,p2)=>({id:id,t:"line",p1:p1,p2:p2});',
    'const sel2=(a,b)=>{skSel={kind:"ent",id:a};skSelX=[{kind:"ent",id:b}];};',
    'const dLine=(P,l,q)=>{const A=P[l.p1],B=P[l.p2],dx=B.x-A.x,dy=B.y-A.y,Ln=Math.hypot(dx,dy);return Math.abs((q.x-A.x)*(-dy/Ln)+(q.y-A.y)*(dx/Ln));};',
    // ── 1. Colinéaire posée par la sélection ──
    'let sk=mk({O:{x:0,y:0},a:{x:-40,y:0},b:{x:-10,y:2},c:{x:10,y:9},d:{x:40,y:14}},[L("l1","a","b"),L("l2","c","d")]);',
    'const nU=skUndoStack.length;',
    'sel2("l1","l2");applyCon("collinear");',
    'const kc=sk.constraints.find(c=>c.type==="collinear");',
    'A(!!kc,"1a : contrainte colinéaire créée");',
    'const l1=entById(sk,"l1"),l2=entById(sk,"l2");',
    'const e1=dLine(sk.points,l1,sk.points.c),e2=dLine(sk.points,l1,sk.points.d);',
    'A(e1<1e-6&&e2<1e-6,"1b : extrémités de l2 sur la droite de l1 ("+e1.toExponential(1)+", "+e2.toExponential(1)+")");',
    'A((skAudit(sk).residual||0)<1e-6,"1c : audit propre ("+skAudit(sk).residual+")");',
    'A(skUndoStack.length===nU+1,"1d : une étape d’annulation");',
    'const dof0=skDof(sk);sk.constraints=sk.constraints.filter(c=>c!==kc);const dof1=skDof(sk);sk.constraints.push(kc);',
    'A(dof1-dof0===2,"1e : Colinéaire retire 2 DDL ("+(dof1-dof0)+")");',
    'skUndoTrans();',
    'A(!sk.constraints.some(c=>c.type==="collinear"),"1f : annuler retire la colinéaire");',
    // ∥ existante sur la paire → purgée à la pose de ⫽
    'sk=mk({O:{x:0,y:0},a:{x:-40,y:0},b:{x:-10,y:0},c:{x:10,y:5},d:{x:40,y:5}},[L("l1","a","b"),L("l2","c","d")],[{id:"kp",type:"parallel",a:"l1",b:"l2"}]);',
    'sel2("l1","l2");applyCon("collinear");',
    'A(sk.constraints.some(c=>c.type==="collinear")&&!sk.constraints.some(c=>c.type==="parallel"),"1g : la ∥ redondante est purgée (⫽ ⇒ ∥)");',
    'A(Math.abs(sk.points.c.y-sk.points.a.y)<1e-6&&Math.abs(sk.points.d.y-sk.points.b.y)<1e-6,"1h : les 2 lignes ramenées sur la même droite");',
    // refus sur ⟂
    'sk=mk({O:{x:0,y:0},a:{x:0,y:0},b:{x:20,y:0},c:{x:30,y:0},d:{x:30,y:20}},[L("l1","a","b"),L("l2","c","d")],[{id:"kq",type:"perpendicular",a:"l1",b:"l2"}]);',
    'sel2("l1","l2");applyCon("collinear");',
    'A(!sk.constraints.some(c=>c.type==="collinear"),"1i : refusée sur 2 lignes perpendiculaires");',
    // scission : la moitié neuve hérite de ⫽
    'sk=mk({O:{x:0,y:0},a:{x:-40,y:0},b:{x:-10,y:0},c:{x:10,y:0},d:{x:40,y:0},m:{x:25,y:0}},[L("l1","a","b"),L("l2","c","d")],[{id:"kc",type:"collinear",a:"l1",b:"l2"}]);',
    'const nE=sk.entities.length;splitLineAt(sk,"l2","m");',
    'const nl=sk.entities[sk.entities.length-1];',
    'A(sk.entities.length===nE+1&&sk.constraints.some(c=>c.type==="collinear"&&((c.a==="l1"&&c.b===nl.id)||(c.b==="l1"&&c.a===nl.id))),"1j : la moitié scindée reste colinéaire");',
    // ── 2. l’audit voit ∥ et ⟂ ──
    'sk=mk({O:{x:0,y:0},a:{x:0,y:0},b:{x:40,y:0},c:{x:0,y:10},d:{x:40,y:18}},[L("l1","a","b"),L("l2","c","d")],[{id:"kp",type:"parallel",a:"l1",b:"l2"}]);',
    'const auP=skAudit(sk);',
    'A(auP.residual>0.05&&auP.all.some(o=>o.id==="kp"),"2a : ∥ violée signalée par l’audit (résidu "+auP.residual.toFixed(3)+" mm)");',
    'sk.constraints=[{id:"kq",type:"perpendicular",a:"l1",b:"l2"}];',
    'const auQ=skAudit(sk);',
    'A(auQ.residual>0.05&&auQ.all.some(o=>o.id==="kq"),"2b : ⟂ violée signalée par l’audit");',
    'solveSketch(sk);',
    'A((skAudit(sk).residual||0)<1e-6,"2c : …et réparée par le règlement");',
    // ── 3. tangence « cercle puis ligne » annulable ──
    'sk=mk({O:{x:0,y:0},a:{x:-20,y:0},b:{x:20,y:0},cc:{x:0,y:9}},[L("l","a","b"),{id:"e",t:"circle",pc:"cc",r:4}]);',
    'const nU3=skUndoStack.length;',
    'skSel={kind:"ent",id:"e"};skSelX=[{kind:"ent",id:"l"}];applyCon("tangent");',
    'A(sk.constraints.some(c=>c.type==="tangent"),"3a : tangence posée (ordre cercle → ligne)");',
    'A(skUndoStack.length===nU3+1,"3b : …et annulable (étape d’annulation présente)");',
    // ── 4. registre ──
    'const types=["h","v","parallel","perpendicular","collinear","equal","symmetric","fix","tangent","tangent2","coaxial","coincident","midpoint","online","oncircle"];',
    'const sansFiche=types.filter(t=>!SK_CON[t]||!SK_ICONS[SK_CON[t].ic]);',
    'A(!sansFiche.length,"4a : chaque type a nom + icône ("+(sansFiche.join(",")||"tous")+")");',
    'const icN=Object.keys(SK_ICONS);const bodies=icN.map(k=>SK_ICONS[k]);',
    'const dup=icN.filter((k,i)=>bodies.indexOf(SK_ICONS[k])!==i&&!(k==="length"||k==="dim"));',
    'A(!dup.length,"4b : aucune icône dupliquée (hors cote = longueur) "+dup.join(","));',
    'const d0=conDesc(sk,{type:"collinear",a:"l",b:"l"});',
    'A(/^Colinéaire /.test(d0),"4c : libellé de liste issu du registre (« "+d0+" »)");',
    // ── 5. menu contextuel ──
    'sk=mk({O:{x:0,y:0},a:{x:0,y:0},b:{x:40,y:0},c:{x:0,y:30},d:{x:40,y:30}},[L("l1","a","b"),L("l2","c","d")]);',
    'sel2("l1","l2");showSkCtx(10,10);',
    'const labs=document.getElementById("skCtxMenu").children.slice().map(b=>b.textContent||"");',
    'A(labs.some(t=>t.indexOf("Colinéaire")>=0),"5a : entrée Colinéaire dans le menu 2 lignes");',
    'A(labs.some(t=>t.indexOf("Parallèle")>=0)&&!labs.some(t=>/^∥/.test(t)),"5b : libellés sans glyphe de tête (icône à la place)");',
    'return out;'
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== 2026-10-15-007 : esquisse consolidée — Colinéaire, audit ∥/⟂, registre ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m.replace(/^ok · /,'')));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,900));process.exit(1);});
