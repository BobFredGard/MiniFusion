// 2026-10-02-022 : en édition d'esquisse, le MENU FAO (colonne #faoWrap : barre « + Usinage »
// + panneau « FAO · posages ») reste ouvert par-dessus le voile translucide — il doit se CACHER
// à l'entrée (openSketch) et se RÉOUVrir à la sortie (closeSketch).
// Règles (mêmes conventions que l'arborescence, lot -020) :
//  · ouvert à l'entrée → caché pendant, réouvert à la sortie ;
//  · déjà replié à l'entrée → on n'y touche NI à l'entrée NI à la sortie ;
//  · l'entrée/sortie ne réécrit JAMAIS minifusion_faoFolded (seul le clic de l'onglet persiste) ;
//  · dépliage manuel PENDANT la session conservé à la sortie.
// État observable : faoFolded (source de vérité), faoAddBarEl.style.display (barre),
// #faoToggle.textContent ('❯' déplié / '❮' replié).
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    'const out={fails:[]};',
    'const A=(c,m)=>{if(!c)out.fails.push(m);};',
    'const tog=()=>(faoTreeWrapEl&&faoTreeWrapEl.children&&faoTreeWrapEl.children[0])||null;',
    'const writes=[];const _set=localStorage.setItem.bind(localStorage);',
    'localStorage.setItem=(k,v)=>{writes.push(k+"="+v);_set(k,v);};',
    'const faoW=()=>writes.filter(w=>w.indexOf("minifusion_faoFolded")===0);',
    // ── doc minimal : rectangle XY → extrusion (harnais, pas de noyau nécessaire) ──
    'const rect={id:"sk1",name:"S",plane:"XY",visible:true,',
    '  points:{O:{x:0,y:0},a:{x:0,y:0},b:{x:40,y:0},c:{x:40,y:30},d:{x:0,y:30}},',
    '  entities:[{id:"l1",t:"line",p1:"a",p2:"b"},{id:"l2",t:"line",p1:"b",p2:"c"},',
    '            {id:"l3",t:"line",p1:"c",p2:"d"},{id:"l4",t:"line",p1:"d",p2:"a"}],',
    '  constraints:[],dims:[],seq:10};',
    'ensureSketchBasis(rect);doc.sketches=[rect];',
    'doc.features=[{id:"ex1",type:"extrude",name:"Plot",sketchId:"sk1",op:"add",distance:10,dist:10,d2:0}];',
    'try{markDirty();rebuild();}catch(e){}',
    'out.pre={faoFolded:faoFolded,bar:faoAddBarEl?faoAddBarEl.style.display:null,',
    '  tog:tog()?tog().textContent:null,has:!!faoTreeWrapEl};',
    'A(out.pre.has===true,"P1 : panneau FAO construit au chargement");',
    'A(faoFolded===false&&out.pre.bar!=="none","P2 : menu ouvert au départ");',
    // ── A : OUVERT à l'entrée → caché pendant l'édition ──
    'writes.length=0;',
    'openSketch("sk1");',
    'out.A={faoFolded:faoFolded,bar:faoAddBarEl.style.display,tog:tog()?tog().textContent:null};',
    'A(faoFolded===true,"A1 : panneau FAO replié en édition — "+JSON.stringify(out.A));',
    'A(faoAddBarEl.style.display==="none","A2 : barre « + Usinage » masquée en édition");',
    'A(tog()&&tog().textContent==="❮","A3 : onglet en état repli");',
    'A(faoW().length===0,"A4 : aucune écriture localStorage du FAO à l entrée");',
    'closeSketch(false);',
    // ── B : SORTIE → réouvert (il était ouvert avant) ──
    'out.B={faoFolded:faoFolded,bar:faoAddBarEl.style.display,tog:tog()?tog().textContent:null};',
    'A(faoFolded===false,"B1 : panneau RÉOUVERT à la sortie — "+JSON.stringify(out.B));',
    'A(faoAddBarEl.style.display==="","B2 : barre visible à la sortie");',
    'A(tog()&&tog().textContent==="❯","B3 : onglet en état déplié");',
    'A(faoW().length===0,"B4 : entrée/sortie n a jamais réécrit minifusion_faoFolded");',
    // ── C : DÉJÀ REPLIÉ à l'entrée → on n'y touche pas (entrée ni sortie) ──
    'tog().onclick();', // clic manuel : repli + persistance (comportement historique)
    'out.C1={faoFolded:faoFolded,w:faoW().slice()};',
    'A(faoFolded===true,"C1 : le clic manuel replie toujours (non-régression)");',
    'A(faoW().indexOf("minifusion_faoFolded=1")>=0,"C2 : le clic manuel persiste toujours");',
    'writes.length=0;',
    'openSketch("sk1");',
    'A(faoFolded===true,"C3 : resté replié à l entrée (déjà replié : pas de nouvelle action)");',
    'closeSketch(false);',
    'A(faoFolded===true,"C4 : TOUJOURS replié à la sortie (déjà replié avant → pas de réouverture)");',
    'A(faoW().length===0,"C5 : toujours aucune écriture FAO en édition");',
    // ── D : ouvert avant, refermé MANUELLEMENT pendant la session → conservé ──
    'tog().onclick();', // retour déplié (état de sortie de C : replié)
    'out.Davant=faoFolded;',
    'A(out.Davant===false,"D0 : manuellement déplié avant l entrée");',
    'writes.length=0;',
    'openSketch("sk1");',
    'A(faoFolded===true,"D1 : caché à l entrée (il était ouvert)");',
    'tog().onclick(); // l utilisateur rouvre le menu PENDANT l édition',
    'A(faoFolded===false,"D2 : dépliage manuel pendant la session respecté");',
    'writes.length=0;', // le clic D2 a légitimement persisté : on isole entrée/sortie
    'closeSketch(false);',
    'A(faoFolded===false,"D3 : choix manuel conservé à la sortie (déjà réouvert)");',
    'A(faoW().length===0,"D4 : aucune écriture FAO sur tout le scénario D");',
    'return out;'
  ].join('\n');
  const vm=require('vm');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== menu FAO caché pendant l esquisse, réouvert à la sortie ===');
  ['pre','A','B','C1','Davant'].forEach(k=>{if(o[k]!==undefined)console.log('  '+k+' : '+JSON.stringify(o[k]));});
  if(o.fails&&o.fails.length){console.log('ECHECS :');o.fails.forEach(m=>console.log('  x '+m));process.exit(1);}
  console.log('TOUT EST CONFORME');
  process.exit(0);
})().catch(e=>{console.log('FATAL/FAIL',String((e&&e.stack)||e).slice(0,900));process.exit(1);});
