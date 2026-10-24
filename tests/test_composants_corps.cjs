// V0.6.2 : composants depuis les corps, déplacer vers un composant (48-composants-depuis-corps.js).
// Partie modèle (dépendances, refus, déplacé / copié, identifiants renouvelés, ancrage de la
// construction), puis noyau OCCT réel : deux corps, le second devient un composant à la même
// place (volumes), annuler / rétablir par Ctrl+Z en mode pièce.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};confirm=function(){return true;};',ctx);
  const R=String.raw`
    const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};const near=(a,b,t)=>Math.abs(a-b)<(t||1e-3);
    // ── 1. modèle seul ──
    const sk=(id,extra)=>Object.assign({id,name:id,plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{},entities:[],constraints:[],dims:[],seq:1},extra||{});
    const ft=(id,body,sketchId,extra)=>Object.assign({id,name:id,type:'extrude',body,sketchId,distance:10,op:'add',visible:true},extra||{});
    const D=()=>({name:'Banc',sketches:[sk('sA'),sk('sB',{plane:'CG',cg:{id:'pl',sub:'xy'}}),sk('sC',{plane:'FACE',host:{feat:'fA'}}),sk('sShared'),sk('sFree')],
      features:[ft('fA','b1','sA'),ft('fB','b2','sB'),ft('fC','b2','sC'),ft('fD','b3','sShared'),ft('fA2','b1','sShared')],
      cgeo:[{id:'pl',kind:'plane',how:'offset',name:'Plan 1',refs:[],p:{d:5},at:'fA',ai:1,fr:{o:[0,0,5],x:[1,0,0],y:[0,1,0],z:[0,0,1]}}],
      bodies:[{id:'b1',name:'Socle'},{id:'b2',name:'Pied',color:0xff0000},{id:'b3',name:'Cale'}],bodySeq:4,activeBody:'b2',bodyVis:{b2:false},params:[{name:'H',expr:'20'}]});
    let d=D();
    let p=asmSplitPlan(d,{bodies:['b2']});
    A(!p.ok&&p.why.some(w=>/sC/.test(w)&&/fA/.test(w)),'1 : Pied refusé — son esquisse sC est posée sur une face de fA, qui reste ('+p.why[0]+')');
    p=asmSplitPlan(d,{bodies:['b1']});
    A(!p.ok&&p.why.some(w=>/sC/.test(w)&&/utilise/.test(w)),'2 : Socle refusé — sC, qui reste, utilise fA');
    d.features=d.features.filter(f=>f.id!=='fC');d.sketches=d.sketches.filter(s=>s.id!=='sC');
    p=asmSplitPlan(d,{bodies:['b2']});
    A(p.ok&&p.move.has('sB')&&p.move.has('pl')&&!p.copy.size,'3 : Pied : son esquisse et son plan de construction partent avec lui');
    p=asmSplitPlan(d,{bodies:['b1']});
    A(p.ok&&p.move.has('sA')&&p.copy.has('sShared'),'4 : Socle : sA déplacée, sShared (aussi utilisée par la Cale) copiée');
    // combinaison entre corps
    d.features.push({id:'fE',name:'Combiner',type:'combine',body:'b1',tools:['b3'],mode:'cut',visible:true});
    A(!asmSplitPlan(d,{bodies:['b1']}).ok&&!asmSplitPlan(d,{bodies:['b3']}).ok,'5 : corps combinés : ni la cible ni l outil ne partent seuls');
    A(asmSplitPlan(d,{bodies:['b1','b3']}).ok,'6 : les deux ensemble : accepté');
    d.features=d.features.filter(f=>f.id!=='fE');
    // transfert vers un document neuf
    const dst=asmEmptyDoc('Pied');
    p=asmSplitPlan(d,{bodies:['b2']});
    let r=asmSplitApply(d,dst,p);
    A(dst.features.map(f=>f.id).join()==='fB'&&dst.sketches.map(s=>s.id).join()==='sB'&&dst.cgeo.map(c=>c.id).join()==='pl','7 : cible : fB, sB, Plan 1');
    A(dst.bodies.length===1&&dst.bodies[0].id==='b2'&&dst.bodies[0].color===0xff0000&&dst.bodyVis.b2===false&&dst.activeBody==='b2','8 : fiche du corps (nom, couleur, visibilité) transférée, corps actif');
    A(dst.params.length===1&&dst.params[0].name==='H','9 : paramètres copiés');
    A(dst.cgeo[0].at===null,'10 : construction ancrée sur une fonction restée : évaluée au début de la cible');
    A(!d.features.some(f=>f.body==='b2')&&!d.sketches.some(s=>s.id==='sB')&&!d.cgeo.length&&!d.bodies.some(e=>e.id==='b2')&&d.activeBody==='b1'&&!('b2' in d.bodyVis),'11 : source : corps, esquisse, plan retirés, corps actif recalé');
    // collisions d'identifiants dans une cible existante
    d=D();d.features=d.features.filter(f=>f.id!=='fC');d.sketches=d.sketches.filter(s=>s.id!=='sC');
    const T={name:'Cible',sketches:[sk('sB')],features:[ft('fB','b2','sB')],cgeo:[],bodies:[{id:'b2',name:'Autre'}],bodySeq:3,activeBody:'b2',params:[{name:'H',expr:'99'}]};
    r=asmSplitApply(d,T,asmSplitPlan(d,{bodies:['b2']}));
    const nf=T.features[1],ns=T.sketches[1];
    A(nf&&nf.id!=='fB'&&ns.id!=='sB'&&nf.sketchId===ns.id,'12 : identifiants déjà pris : renouvelés, et la fonction suit son esquisse ('+nf.sketchId+')');
    A(nf.body==='b3'&&T.bodies.map(e=>e.id).join()==='b2,b3'&&T.bodySeq===4&&r.bodies[0]==='b3','13 : corps déjà pris : b3 dans la cible');
    A(T.params.length===1&&T.params[0].expr==='99','14 : paramètre homonyme de la cible conservé');
    A(T.cgeo[0].at==='fB'&&T.cgeo[0].ai===1,'15 : construction ancrée après les fonctions que la cible avait déjà');
    // esquisses seules
    d=D();
    A(!asmSplitPlan(d,{sketches:['sShared']}).ok,'16 : esquisse encore utilisée : refusée');
    p=asmSplitPlan(d,{sketches:['sFree']});
    A(p.ok&&p.M.has('sFree'),'17 : esquisse libre : déplaçable');
    // ── 2. noyau réel : deux corps, le cylindre devient un composant ──
    docResetEmpty();doc.name='Banc';
    const box={id:'skA',name:'Bloc',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{a:{x:-20,y:-20},b:{x:20,y:-20},c:{x:20,y:20},d:{x:-20,y:20}},
      entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],constraints:[],dims:[],seq:20,visible:false};
    const cyl={id:'skC',name:'Cyl',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{k:{x:40,y:0}},entities:[{id:'cc',t:'circle',pc:'k',r:10}],constraints:[],dims:[],seq:20,visible:false};
    doc.sketches=[box,cyl];doc.bodies=[{id:'b1',name:'Socle',c:null},{id:'b2',name:'Colonne',c:null}];doc.bodySeq=3;doc.activeBody='b1';
    doc.features=[{id:'F1',type:'extrude',name:'Bloc',sketchId:'skA',distance:20,op:'add',visible:true,body:'b1'},
                  {id:'F2',type:'extrude',name:'Colonne',sketchId:'skC',distance:40,op:'add',visible:true,body:'b2'}];
    ensureBodies();markDirty();rebuild();
    const vols=()=>{const FR=occFinalShape(null);const v=FR.perBody.map(b=>occCoqueVolume(b.shape));occCleanup(FR,null);return v;};
    let v=vols();
    A(builtEngine==='exact'&&v.length===2&&near(v[0],32000,0.5)&&near(v[1],Math.PI*100*40,0.5),'18 : avant : deux corps ('+v.map(x=>x.toFixed(1)).join(' + ')+' mm³)');
    docPushUndo('modif avant');
    const res=asmCompsFromBodies(['b2']);
    A(res.made.length===1&&!res.refused.length&&res.made[0].comp.name==='Colonne','19 : composant « Colonne » créé');
    const C=res.made[0].comp,oc=res.made[0].occ;
    A(asmRoot().occ.length===1&&asmIsIdentity(oc.fr)&&asmRoot().doc===doc,'20 : occurrence dans la racine, à l identité (rien ne bouge)');
    A(doc.sketches.map(s=>s.id).join()==='skA'&&C.doc.sketches.map(s=>s.id).join()==='skC','21 : esquisse du cylindre partie avec lui');
    markDirty();rebuild();v=vols();
    A(v.length===1&&near(v[0],32000,0.5),'22 : racine : le bloc seul ('+v[0].toFixed(1)+' mm³)');
    asmActivatePath([oc.id]);v=vols();
    A(doc===C.doc&&v.length===1&&near(v[0],Math.PI*100*40,0.5),'23 : composant : le cylindre, même volume ('+(v[0]||0).toFixed(1)+' mm³)');
    const FRc=occFinalShape(null);const bb=occListEdges(FRc.shape).reduce((m,e)=>Math.max(m,...e.pts.map(q=>q[0])),-1e9);occCleanup(FRc,null);
    A(near(bb,50,1e-3),'24 : composant : même place (X max 50)');
    asmActivatePath([]);
    // annuler en mode pièce : l'opération d'assemblage est la plus récente
    A(asmUndoFirst(false),'25 : Ctrl+Z en mode pièce vise la création du composant');
    docUndo();
    A(asm.comps.length===1&&doc.features.length===2&&doc.bodies.length===2&&doc.sketches.length===2,'26 : annulé : un seul composant, les deux corps revenus');
    A(!asmUndoFirst(false)&&docUndoStack.length===1&&docUndoStack[0].label==='modif avant','27 : Ctrl+Z suivant : l annulation du document reprend');
    A(asmUndoFirst(true)&&!docRedoStack.length,'28 : Ctrl+Y vise la création du composant (pile de rétablissement du document vide)');
    document.body.dispatchEvent({type:'keydown',key:'y',ctrlKey:true,preventDefault(){}}); // le vrai raccourci (45)
    A(asm.comps.length===2&&doc.features.length===1,'29 : rétabli par Ctrl+Y');
    // déplacer vers un composant existant : une esquisse libre
    doc.sketches.push(Object.assign(JSON.parse(JSON.stringify(cyl)),{id:'skL',name:'Libre'}));
    const mv=asmMoveToComp({sketches:['skL']},C.id);
    A(mv.ok&&!doc.sketches.some(s=>s.id==='skL')&&C.doc.sketches.some(s=>s.id==='skL')&&C._stale,'30 : esquisse libre déplacée vers « Colonne »');
    const mv2=asmMoveToComp({sketches:['skA']},C.id);
    A(!mv2.ok&&/utilise/.test(mv2.why.join()),'31 : esquisse encore utilisée par le bloc : refusée');
    const mv3=asmMoveToComp({sketches:[]},'_new','Neuf');
    A(mv3.ok&&mv3.comp.name==='Neuf'&&asmRoot().occ.length===2,'32 : vers un composant neuf (même étape d annulation)');
    A(asmUndo()&&asmRoot().occ.length===1,'33 : annuler : le composant neuf disparaît');
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== V0.6.2 : composants depuis les corps ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
