// 2026-09-30r : annulation de document + suppression multi-fonctions au clavier.
// On vérifie le COMPORTEMENT (états, solides, piles), pas l'existence des symboles.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  x '+m);}else console.log('  ✓ '+m);};
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  // confirm()/alert() : le harnais n'a pas de navigateur
  vm.runInContext(`
    var __confirm=[]; var __confirmer=true;
    window.confirm=function(){__confirm.push(1);return __confirmer;};
    window.alert=function(){};
  `,ctx);

  const body = `
    const out={};
    const rectSk=function(id,n,x0,y0,x1,y1){
      const sk={id:id,name:n,plane:"XY",origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],
        points:{},entities:[],constraints:[],dims:[],visible:false};
      [["a",x0,y0],["b",x1,y0],["c",x1,y1],["d",x0,y1]].forEach(function(q){sk.points[q[0]]={x:q[1],y:q[2]};});
      [["a","b"],["b","c"],["c","d"],["d","a"]].forEach(function(e,i){sk.entities.push({id:"l"+i,t:"line",p1:e[0],p2:e[1]});});
      return sk;
    };
    const etat=function(){return doc.features.map(function(f){return f.id;}).join(",");};
    const solide=function(){
      markDirty();rebuild();
      const FR=occFinalShape(null);
      let n=0;
      if(FR.shape){
        const e=new occt.TopExp_Explorer_2(FR.shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);
        while(e.More()){n++;e.Next();}
        occCleanup(FR,null);
      }
      return n;
    };

    // document de depart : bloc + poche + conge exact sur le bloc
    doc.sketches=[];doc.features=[];doc.entNames={};
    doc.sketches.push(rectSk("sk1","Bloc",0,0,40,30));
    doc.sketches.push(rectSk("sk2","Poche",10,10,20,20));
    addFeature({id:"E1",type:"extrude",name:"Bloc",sketchId:"sk1",distance:20,op:"add",visible:true,mid:false,upto:null});
    addFeature({id:"E2",type:"extrude",name:"Poche",sketchId:"sk2",distance:30,op:"cut",visible:true,mid:false,upto:null});
    addFeature({id:"X1",type:"xfillet",name:"Conge",target:"E1",chamfer:false,
      edges:[{pos:[40,15,0],r:2,len:30},{pos:[40,15,20],r:2,len:30}],visible:true});
    markDirty();rebuild();
    out.depart=etat();
    out.facesDepart=solide();
    out.pileCreations=docUndoStack.length;
    out.libelles=docUndoStack.map(function(e){return e.label;}).join(" | ");

    // 1) annuler une creation
    out.okUndo=docUndo();
    out.apresUndo=etat();
    out.facesApresUndo=solide();
    out.pileApresUndo=docUndoStack.length;
    out.pileRedo=docRedoStack.length;

    // 2) retablir
    out.okRedo=docRedo();
    out.apresRedo=etat();
    out.facesApresRedo=solide();

    // 2b) REFERENCE independante : le meme document SANS le conge, construit de zero.
    //     C'est a elle qu'on compare l'etat obtenu apres annulation (comparer a l'etat
    //     de depart serait faux : annuler retire justement le dernier objet).
    (function(){
      const garde=JSON.stringify(doc);
      doc.features=doc.features.filter(function(f){return f.id!=="X1";});
      out.facesSansConge=solide();
      doc=JSON.parse(garde);
    })();

    // 3) annuler trois fois : pile vide, plus aucune fonction
    docUndo();docUndo();docUndo();
    out.apres3Undo=etat();
    out.pileVide=docUndoStack.length===0;
    out.redoPile=docRedoStack.length;

    // 4) selection multiple + suppression en cascade (E1 et son conge X1)
    while(docRedoStack.length)docRedo();
    out.avantCascade=etat();
    treeSel=["E1"];
    out.ids=treeSelIds().join("+");
    out.deps=treeSelDeps(treeSelIds()).join("+");
    __confirm=[];__confirmer=true;
    treeDeleteSel();
    out.apresCascade=etat();
    out.nbConfirm=__confirm.length;
    out.facesApresCascade=solide();
    out.pileApresSuppr=docUndoStack.length;

    // 5) annuler la suppression : tout doit revenir
    out.okUndoSuppr=docUndo();
    out.retourApresUndo=etat();
    out.facesRetour=solide();

    // 6) refus de l'utilisateur : rien ne bouge
    while(docRedoStack.length)docRedo();
    const avantRefus=etat();
    treeSel=["E2"];__confirm=[];__confirmer=false;
    treeDeleteSel();
    out.refus=etat()===avantRefus;
    out.nbConfirmRefus=__confirm.length;

    // 7) multi-selection : deux fonctions choisies au Ctrl+clic
    __confirmer=true;
    treeSel=["E1","E2"];
    out.deps2=treeSelDeps(treeSelIds()).join("+");
    __confirm=[];__confirmer=true;
    treeDeleteSel();
    out.apresLot=etat();
    out.lotNb=__confirm.length;
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx);

  console.log('=== 2026-09-30r : annulation de document + Suppr multi-fonctions ===');
  console.log('  départ            : '+o.depart+'  ->  '+o.facesDepart+' faces');
  console.log('  étapes creations  : '+o.pileCreations+'  ['+o.libelles+']');
  console.log('  apres annuler     : '+o.apresUndo+'  ->  '+o.facesApresUndo+' faces  (pile '+o.pileApresUndo+', retablir '+o.pileRedo+')');
  console.log('  apres retablir    : '+o.apresRedo+'  ->  '+o.facesApresRedo+' faces');
  console.log('  apres 3 annulations: '+o.apres3Undo+'   pile vide='+o.pileVide+' (retablir '+o.redoPile+')');
  console.log('  E1 dependants     : '+o.deps+'   |  E1+E2 dependants : '+o.deps2);
  console.log('  apres cascade     : '+o.apresCascade+'  ->  '+o.facesApresCascade+' faces  (confirmations='+o.nbConfirm+')');
  console.log('  apres annulation  : '+o.retourApresUndo+'  ->  '+o.facesRetour+' faces');
  console.log('  apres lot E1+E2   : '+o.apresLot);
  A(o.pileCreations===3,'chaque creation (3) empile UNE etape : '+o.pileCreations);
  A(/Conge/.test(o.libelles)&&/Poche/.test(o.libelles),'les etapes sont etiquetees par le nom de la fonction');
  A(o.okUndo&&o.apresUndo==='E1,E2','annuler une creation retire la derniere fonction');
  A(o.facesApresUndo===o.facesSansConge,'le solide apres annulation vaut le document SANS le congé ('+o.facesApresUndo+' = '+o.facesSansConge+' faces)');
  A(o.okRedo&&o.apresRedo===o.depart,'retablir restaure la creation');
  A(o.pileVide&&o.apres3Undo==='','annuler 3 fois vide la pile et la liste des fonctions');
  A(o.deps==='X1','la dependance est detectee : le conge X1 depend de E1');
  A(o.apresCascade==='E2','la suppression emporte le conge : reste E2');
  A(o.nbConfirm===1,'une confirmation est demandee (pas de suppression silencieuse)');
  A(o.okUndoSuppr&&o.retourApresUndo===o.avantCascade,'annuler la suppression restaure les 3 fonctions');
  A(o.facesRetour===o.facesDepart,'le solide est restaure a l identique ('+o.facesRetour+' faces)');
  A(o.refus&&o.nbConfirmRefus===1,'un refus de confirmation ne supprime rien');
  A(o.apresLot==='','le lot E1+E2 emporte tout (conge compris) : reste "'+o.apresLot+'"');
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.message)||e).slice(0,600));process.exit(1);});