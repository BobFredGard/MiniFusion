// V0.8.4 : configurations — tables de variantes (52-configurations.js), sans noyau. Une plaque
// (rectangle coté L × l, extrudée E) et un trou (extrusion en découpe) : colonnes L (cote nommée),
// E (valeur nommée de l'extrusion), P (paramètre libre) ; variantes « Petite », « Grande » (trou
// supprimé), activation (valeurs écrites, une étape d'annulation, trou supprimé / rétabli),
// mémoriser l'état, cellule vide = inchangée, valeur absente du modèle, expression fausse (⚠),
// renommer une valeur (la colonne suit), fichier, arbre, fenêtre ƒx.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=`
    const ATT=[],OK=[];const att=(ok,msg)=>{(ok?OK:ATT).push(msg);};
    confirm=function(){return true;};alert=function(){};
    docResetEmpty();doc.name='Plaque';
    const sk={id:'skP',name:'Plaque',plane:'XY',visible:true,origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],seq:10,
      points:{a:{x:0,y:0},b:{x:80,y:0},c:{x:80,y:50},d:{x:0,y:50}},
      entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],
      constraints:[{id:'k1',type:'fix',p:'a'},{id:'k2',type:'h',line:'l1'},{id:'k3',type:'v',line:'l2'},{id:'k4',type:'h',line:'l3'},{id:'k5',type:'v',line:'l4'}],
      dims:[{id:'dL',type:'distance',a:'a',b:'b',value:80,name:'L',expr:'80'},{id:'dl',type:'distance',a:'b',b:'c',value:50}]};
    const skT={id:'skT',name:'Trou',plane:'XY',visible:true,origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],seq:11,
      points:{o:{x:20,y:20}},entities:[{id:'c1',t:'circle',pc:'o',r:4}],constraints:[],dims:[]};
    doc.sketches=[sk,skT];
    doc.features=[{id:'F1',type:'extrude',name:'Plaque',sketchId:'skP',distance:10,op:'add',visible:true,pname:{distance:'E'},expr:{distance:'10'}},
                  {id:'F2',type:'extrude',name:'Trou',sketchId:'skT',distance:10,op:'cut',visible:true}];
    doc.params=[{name:'P',expr:'3',value:3}];
    markDirty();rebuild();
    const find=(n,id)=>{if(!n)return null;if(n.id===id)return n;for(const k of (n.children||[])){const r=find(k,id);if(r)return r;}return null;};
    renderTree();
    att(cfgOf()===null&&!find($('tree'),'cfgTree'),'1 : sans table : pas de configuration, rien dans l’arbre');
    // ── table ──
    const r1=cfgAddRow('Petite');cfgAddCol('L');cfgAddCol('E');cfgAddCol('P');
    att(cfgOf().rows.length===1&&cfgOf().active===r1.id&&r1.vals.L==='80'&&r1.vals.E==='10'&&r1.vals.P==='3','2 : première variante = l’état actuel (L 80, E 10, P 3), active');
    const r2=cfgAddRow('Grande');r2.vals.L='120';r2.vals.E='16';delete r2.vals.P;r2.off=['F2'];
    att(cfgOf().cols.join()==='L,E,P'&&cfgOf().rows.length===2,'3 : trois colonnes, deux variantes');
    // ── activation ──
    const u0=docUndoStack.length;
    let r=cfgApply(r2.id);
    const dL=doc.sketches.find(s=>s.id==='skP').dims.find(d=>d.id==='dL');
    const F1=doc.features.find(f=>f.id==='F1'),F2=doc.features.find(f=>f.id==='F2');
    att(r.ok&&Math.abs(dL.value-120)<1e-9&&Math.abs(F1.distance-16)<1e-9,'4 : « Grande » : L = 120, E = 16');
    att(Math.abs(doc.sketches.find(s=>s.id==='skP').points.b.x-120)<1e-6,'5 : l’esquisse suit (coin à X 120)');
    att(F2.visible===false&&doc.params[0].value===3,'6 : trou supprimé ; P (cellule vide) inchangé');
    att(docUndoStack.length===u0+1&&cfgOf().active===r2.id,'7 : une étape d’annulation, « Grande » active');
    r=cfgApply(r1.id);
    att(Math.abs(dL.value-80)<1e-9&&Math.abs(F1.distance-10)<1e-9&&F2.visible===true,'8 : retour à « Petite » : L 80, E 10, trou rétabli');
    // une fonction que la table ne pilote pas n'est pas touchée
    doc.features.push({id:'F3',type:'extrude',name:'Bossage',sketchId:'skT',distance:5,op:'add',visible:false});
    cfgApply(r2.id);
    att(doc.features.find(f=>f.id==='F3').visible===false,'9 : fonction hors table : laissée telle quelle');
    // ── annuler ──
    docUndo();doc.features=doc.features.filter(f=>f.id!=='F3');
    att(cfgOf().active===r1.id&&Math.abs(doc.sketches.find(s=>s.id==='skP').dims.find(d=>d.id==='dL').value-80)<1e-9,'10 : Ctrl+Z : retour à la variante d’avant');
    // ── mémoriser l'état ──
    const c=cfgOf();const rp=c.rows.find(x=>x.id===r1.id);
    doc.params[0].expr='7';parApplyAll();doc.features.find(f=>f.id==='F2').visible=false;
    cfgCapture(r1.id);
    att(rp.vals.P==='7'&&rp.off.join()==='F2','11 : mémoriser : P 7 et trou masqué entrent dans « Petite »');
    // ── valeur absente, expression fausse ──
    c.cols.push('Q');rp.vals.Q='5';
    r=cfgApply(r1.id);
    att(r.missing.join()==='Q','12 : colonne absente du modèle signalée ('+r.msg+')');
    c.cols=c.cols.filter(n=>n!=='Q');delete rp.vals.Q;
    rp.vals.P='L*';r=cfgApply(r1.id);
    att(!r.ok&&r.errs.length&&/P/.test(r.errs[0]),'13 : expression fausse : ⚠ ('+r.errs[0]+')');
    rp.vals.P='L/10';r=cfgApply(r1.id);
    att(r.ok&&Math.abs(doc.params[0].value-8)<1e-9,'14 : expression d’une autre valeur (P = L/10 = 8)');
    // ── renommer une valeur : la colonne suit ──
    const pp=doc.params[0];parRename('P','Pas');pp.name='Pas';
    att(c.cols.includes('Pas')&&!c.cols.includes('P')&&rp.vals.Pas==='L/10','15 : renommer P en Pas : colonne et valeurs suivent');
    // ── fichier ──
    const js=serialise();
    const o=JSON.parse(js);
    att(o.configs&&o.configs.rows.length===2&&o.configs.active===r1.id&&o.configs.cols.join()==='L,E,Pas','16 : écrit dans le fichier');
    await deserialise(js,{rebuild:false});
    const c2=cfgOf();
    att(c2&&c2.rows.length===2&&c2.rows[1].off.join()==='F2'&&c2.rows[1].vals.L==='120','17 : relu (valeurs, fonctions supprimées)');
    att(cfgNorm({rows:[{id:'x',vals:{'1bad':'2'},off:[3]}],cols:['1bad','ok']}).cols.join()==='ok','18 : fichier : noms invalides écartés');
    // ── arbre et fenêtre ƒx ──
    renderTree();
    const tr=find($('tree'),'cfgTree');
    att(!!tr,'19 : sélecteur de configuration en tête de l’arbre');
    openParamsDlg();
    att(!!find(document.body,'cfgTable')&&!!find(document.body,'cfgAdd'),'20 : section « Configurations » dans la fenêtre ƒx');
    // supprimer toutes les variantes : la table disparaît
    cfgDelRow(c2.rows[0].id);cfgDelRow(cfgOf().rows[0].id);
    att(cfgOf()===null&&doc.configs===null,'21 : plus de variante : plus de table');
    return {ATT,OK};
  `;
  const o=await vm.runInContext('(async function(){'+R+'})()',ctx);
  console.log('=== V0.8.4 : configurations (tables de variantes) ===');
  o.OK.forEach(m=>console.log('  ✓ '+m));
  if(o.ATT.length){o.ATT.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.ATT.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
