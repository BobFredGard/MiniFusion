// V0.7.6 : extrusion dynamique (70-extrusion-dynamique.js), session de la fenêtre, sans noyau.
// « Extrusion » crée tout de suite la fonction (aperçu = résultat) ; OK la garde ; Annuler remet
// le document EXACTEMENT comme à l'ouverture (création : la fonction disparaît ; modification :
// valeurs d'avant) et retire les étapes d'annulation prises entre-temps. Opération, direction,
// inversion, distance : une étape d'annulation chacune. La fenêtre s'ouvre à la sélection d'une
// extrusion. Harnais : DOM/THREE stubbé.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=`
    const ATT=[],OK=[];const att=(ok,msg)=>{(ok?OK:ATT).push(msg);};
    confirm=function(){return true;};
    docResetEmpty();doc.name='Banc';
    const sk={id:'skP',name:'Profil',plane:'XY',visible:true,origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],seq:10,
      points:{a:{x:-25,y:-15},b:{x:25,y:-15},c:{x:25,y:15},d:{x:-25,y:15}},
      entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],constraints:[],dims:[]};
    doc.sketches=[sk];markDirty();rebuild();
    const snap0=docSnap(),u0=docUndoStack.length;
    // ── création : la fonction existe tout de suite ──
    askExtrude('skP');
    let f=doc.features[0];
    att(f&&f.type==='extrude'&&f.distance===20&&f.op==='add','« Extrusion » crée tout de suite une extrusion de 20 mm (aperçu = résultat)');
    att(sel.kind==='feature'&&sel.id===f.id&&extDyn&&extDyn.isNew,'elle est sélectionnée, fenêtre ouverte en création');
    att(sk.visible===false,'l’esquisse est masquée comme après une extrusion');
    // ── réglages ──
    extDynSet('distance',g=>extDistSet(g,35));
    att(f.distance===35&&/35mm/.test(f.name),'distance 35 : le nom suit');
    extDynSet('opération',g=>{g.op='cut';g.distance=-Math.abs(g.distance);});
    att(f.op==='cut'&&f.distance===-35,'poche : distance négative');
    // ── Annuler en création : tout disparaît ──
    extDynCancel();
    att(doc.features.length===0&&docSnap()===snap0,'Annuler : le document est EXACTEMENT celui d’avant (aucune fonction)');
    att(docUndoStack.length===u0&&!extDyn&&sel.kind===null,'… sans étape d’annulation laissée, fenêtre fermée');
    // ── création puis OK ──
    askExtrude('skP');f=doc.features[0];extDynSet('distance',g=>extDistSet(g,30));
    extDynOk();
    att(doc.features.length===1&&f.distance===30&&sel.kind===null&&!extDyn,'OK : l’extrusion de 30 mm reste, fenêtre fermée');
    // ── modification : la fenêtre s'ouvre à la sélection ; Annuler remet les valeurs ──
    sel={kind:'feature',id:f.id};renderProps();
    att(extDyn&&extDyn.id===f.id&&!extDyn.isNew,'sélectionner l’extrusion ouvre sa fenêtre (modification)');
    const s1=docSnap(),u1=docUndoStack.length;
    extDynSet('direction',g=>{g.mid=true;});extDynSet('inverser',g=>{g.flip=!g.flip;});extDynSet('dépouille',g=>{g.draft=3;});
    att(f.mid===true&&f.flip===true&&f.draft===3&&docUndoStack.length===u1+3,'symétrique, inversée, dépouille 3° : une étape d’annulation chacune');
    extDynCancel();
    f=doc.features[0];
    att(docSnap()===s1&&!f.mid&&!f.flip&&!(+f.draft)&&docUndoStack.length===u1,'Annuler en modification : valeurs d’avant, étapes retirées');
    // ── un autre choix ferme la fenêtre ──
    sel={kind:'feature',id:f.id};renderProps();sel={kind:null,id:null};renderProps();
    att(extDynFeature()===null,'désélectionner : plus de fenêtre');
    // ── Ctrl+Z après OK ──
    sel={kind:'feature',id:f.id};renderProps();extDynSet('distance',g=>extDistSet(g,12));extDynOk();
    docUndo();
    att(doc.features[0].distance===30,'après OK, Ctrl+Z défait la dernière modification (12 → 30)');
    return {ATT,OK};
  `;
  const o=vm.runInContext('(function(){'+R+'})()',ctx);
  console.log('=== V0.7.6 : extrusion dynamique (fenêtre) ===');
  o.OK.forEach(m=>console.log('  ✓ '+m));
  if(o.ATT.length){o.ATT.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.ATT.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
