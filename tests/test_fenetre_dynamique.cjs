// V0.8.0 : fenêtre dynamique pour la révolution, le perçage et le congé (71-fenetre-dynamique.js),
// sans noyau. Aperçu immédiat (la fonction naît tout de suite), OK la garde, Annuler remet le
// document EXACTEMENT comme à l'ouverture (création : la fonction disparaît ; modification : valeurs
// d'avant) et retire les étapes d'annulation. Poignées : angle autour de l'axe, profondeur, rayon.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=`
    const ATT=[],OK=[];const att=(ok,msg)=>{(ok?OK:ATT).push(msg);};const near=(a,b,e)=>Math.abs(a-b)<(e||1e-6);
    confirm=function(){return true;};
    docResetEmpty();doc.name='Banc';
    // profil de révolution : rectangle 5..15 × 0..20 dans XZ… ici XY, axe = ligne de construction x=0
    const skR={id:'skR',name:'Profil',plane:'XY',visible:true,origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],seq:10,
      points:{a:{x:5,y:0},b:{x:15,y:0},c:{x:15,y:20},d:{x:5,y:20},o:{x:0,y:-5},t:{x:0,y:25}},
      entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'},
        {id:'ax',t:'line',p1:'o',p2:'t',construction:true,axis:true}],constraints:[],dims:[]};
    doc.sketches=[skR];markDirty();rebuild();
    const snap0=docSnap(),u0=docUndoStack.length;
    // ── révolution : création immédiate ──
    askRevolve('skR');
    let f=doc.features[0];
    att(f&&f.type==='revolve'&&f.angle===360&&f.axis&&f.axis.id==='ax'&&revNew===null,'« Révolution » crée tout de suite la fonction (360°, axe = l’axe de l’esquisse), sans formulaire');
    att(sel.kind==='feature'&&sel.id===f.id&&fdyn&&fdyn.isNew&&skR.visible===false,'sélectionnée, fenêtre ouverte en création, esquisse masquée');
    const uc=docUndoStack.length;
    fdynSet('angle',g=>{g.angle=90;});fdynSet('opération',g=>{g.op='cut';});
    att(f.angle===90&&f.op==='cut'&&docUndoStack.length===uc+2,'angle 90°, poche : une étape d’annulation chacune');
    fdynCancel();
    att(doc.features.length===0&&docSnap()===snap0&&docUndoStack.length===u0&&!fdyn,'Annuler en création : document identique, aucune étape laissée');
    // ── poignée d'angle ──
    askRevolve('skR');f=doc.features[0];
    const H=fdynHandle(f);
    att(H&&H.kind==='rot'&&H.label==='Angle'&&near(H.val,360)&&H.R0&&near(Math.hypot(H.R0.x,H.R0.z),15),'poignée d’angle : point de référence le plus loin de l’axe (à 15 mm)');
    const p90=fdynRotPt(H,90),r=Math.hypot(p90.x,p90.z);
    att(near(p90.y,H.R0.y,1e-6)&&near(r,15,1e-6)&&near(p90.x,0,1e-6)&&near(p90.z,-15,1e-6),'à 90° autour de l’axe +Y (sens direct, comme OCCT), le point à X15 passe à Z−15');
    fdynOk();
    att(doc.features.length===1&&!fdyn&&sel.kind===null,'OK : la révolution reste, fenêtre fermée');
    // ── profil invalide : formulaire ──
    {const sk2={id:'skB',name:'Coupé',plane:'XY',visible:true,origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],seq:20,
       points:{a:{x:-5,y:0},b:{x:5,y:0},c:{x:5,y:10},d:{x:-5,y:10},o:{x:0,y:-5},t:{x:0,y:15}},
       entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'},
         {id:'ax',t:'line',p1:'o',p2:'t',construction:true,axis:true}],constraints:[],dims:[]};
     doc.sketches.push(sk2);const n0=doc.features.length;askRevolve('skB');
     att(doc.features.length===n0&&revNew&&revNew.sketchId==='skB','profil des deux côtés de l’axe : pas de création, le formulaire dit ce qui manque');
     revNewCancel();}
    // ── perçage : session, poignée de profondeur ──
    docResetEmpty();
    const skH={id:'skH',name:'Centres',plane:'XY',visible:true,origin:[0,0,10],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],seq:10,
      points:{h1:{x:5,y:5,hole:true}},entities:[{id:'c1',t:'cpoint',p:'h1',hole:true}],constraints:[],dims:[]};
    doc.sketches=[skH];markDirty();rebuild();
    if(!holePoints(skH).length){skH.entities=[];skH.points.h1.hole=1;}
    const s2=docSnap(),u2=docUndoStack.length;
    askHole('skH');
    let h=doc.features.find(x=>x.type==='hole');
    att(h&&fdyn&&fdyn.isNew&&fdyn.id===h.id,'perçage : créé, fenêtre ouverte en création');
    const HH=fdynHandle(h);
    att(HH&&HH.kind==='lin'&&HH.label==='Profondeur'&&near(HH.val,15)&&near(HH.C.z,10)&&near(HH.n.z,-1),'flèche de profondeur : au centre (Z10), vers −Z (dans la matière), 15 mm');
    fdynSet('profondeur',g=>{g.depth=22;});
    att(h.depth===22&&/22/.test(h.name||'')||h.depth===22,'profondeur 22');
    fdynCancel();
    att(!doc.features.some(x=>x.type==='hole')&&docSnap()===s2&&docUndoStack.length===u2,'Annuler : le perçage disparaît, document identique');
    askHole('skH');h=doc.features.find(x=>x.type==='hole');fdynSet('fin',g=>{g.end='through';});
    att(fdynHandle(h)===null,'perçage débouchant : pas de flèche de profondeur');
    fdynOk();
    // ── congé exact : poignée de rayon ──
    const xf={id:'xf1',type:'xfillet',name:'Congé',edges:[{pos:[10,0,5],pos0:[10,0,5],r:2,name:'a1'},{pos:[0,10,5],pos0:[0,10,5],r:3,name:'a2'}],visible:true,tangent:true};
    doc.features.push(xf);sel={kind:'feature',id:'xf1'};renderProps();
    att(fdyn&&fdyn.id==='xf1'&&!fdyn.isNew,'sélectionner un congé ouvre sa fenêtre (modification)');
    const HX=fdynHandle(xf);
    att(HX&&HX.kind==='lin'&&HX.label==='Rayon'&&near(HX.val,2)&&near(HX.C.x,10),'flèche de rayon sur la première arête (r = 2)');
    const s3=docSnap();
    fdynSet('rayon',g=>HX.set(g,4));
    att(xf.edges.every(s=>s.r===4),'la flèche (ou le champ « toutes ») règle TOUTES les arêtes à 4');
    fdynCancel();
    const xf2=doc.features.find(x=>x.id==='xf1');
    att(xf2.edges[0].r===2&&xf2.edges[1].r===3,'Annuler : rayons d’avant (2 et 3)');
    att(fdynFeature()===null,'fenêtre fermée');
    return {ATT,OK};
  `;
  const o=vm.runInContext('(function(){'+R+'})()',ctx);
  console.log('=== V0.8.0 : fenêtre dynamique — révolution, perçage, congé ===');
  o.OK.forEach(m=>console.log('  ✓ '+m));
  if(o.ATT.length){o.ATT.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.ATT.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
