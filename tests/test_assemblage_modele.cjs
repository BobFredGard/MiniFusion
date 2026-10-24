// Assemblage (46-assemblage-modele.js), modèle seul, sans noyau : un document sans composant
// reste identique ; composants et occurrences ; changer de composant actif garde FAO, PLAN,
// construction et annulation de chacun ; sauvegarde / ouverture ; alignement de repères
// (retournement, rotation, décalage, associatif, cycle) ; suppression ; annuler de
// l'assemblage ; préfixe des points de contrôle ; fichier V0.6.0 (bloc asm v1) relu.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=`
    const P=[];const p=s=>P.push(String(s));
    const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};
    confirm=function(){return true;};
    const near=(a,b,t)=>Array.isArray(a)&&a.length===3&&a.every((x,i)=>Math.abs(x-b[i])<(t||1e-7));
    const V=(a,b,msg)=>att(near(a,b),msg+' : vu ['+(a||[]).map(x=>+(+x).toFixed(6)).join(', ')+'] attendu ['+b.map(x=>+(+x).toFixed(6)).join(', ')+']');
    const sansAsm=s=>{const o=JSON.parse(s);delete o.asm;return JSON.stringify(o);};
    const FR=(id,name,fr)=>({id,kind:'frame',how:'zx',name,refs:[],p:{},at:null,visible:true,fr,st:'ok',msg:''});
    docResetEmpty();
    att(asm===null,'document neuf : pas d assemblage');
    doc.name='Bride';
    doc.cgeo.push(FR('fa','Repère A',{o:[10,0,0],x:[1,0,0],y:[0,0,1],z:[0,-1,0]}));
    doc.fao={setups:[{id:'stA',name:'Posage A',ops:[]}],activeSetupId:'stA'};
    doc.mep={sheets:[{id:'shA'}]};
    const js0=serialise(false);
    att(js0.indexOf('"asm"')<0,'pièce seule : aucun bloc asm');
    asmEnsure();
    att(asm&&asm.comps.length===1&&asm.root===asm.comps[0].id&&!asm.comps[0].occ.length,'asmEnsure : la pièce devient la racine, sans enfant');
    att(asm.comps[0].doc===doc,'la racine EST doc');
    att(serialise(false)===js0,'racine seule : fichier strictement identique');
    att(asmCkPrefix()==='','un composant : clés de cache sans préfixe');
    // ── deux composants sous la racine ──
    const Rt=asmRoot();
    const na=asmNewComp('Bride');const A=na.comp,oA=na.occ;
    const nb=asmNewComp('Axe');const B=nb.comp,oB=nb.occ;
    att(asm.comps.length===3&&Rt.occ.length===2,'deux composants : 3 composants, 2 occurrences dans la racine');
    att(oB.name==='Axe:1'&&oB.fixed===false&&oB.comp===B.id,'occurrence nommée Axe:1, libre');
    att(asmCkPrefix()===Rt.id+'§','plusieurs composants : clés préfixées par le composant actif');
    // annulation propre à la racine
    docUndoStack.length=0;docPushUndo('modif racine');
    // ── bascule vers A puis B ──
    asmActivatePath([oA.id]);
    att(doc===A.doc&&asm.active===A.id&&asm.path.join()===oA.id,'A active : doc = document de A, chemin [oA]');
    att(docUndoStack.length===0,'A active : sa propre pile d annulation (vide)');
    att(Rt.doc.fao&&Rt.doc.fao.setups[0].id==='stA','racine inactive : sa FAO intacte');
    att(Rt.doc.mep&&Rt.doc.mep.sheets[0].id==='shA','racine inactive : son PLAN intact');
    att(Rt.doc.cgeo.length===1,'racine inactive : sa construction intacte');
    doc.cgeo.push(FR('fa2','Repère A2',{o:[10,0,0],x:[1,0,0],y:[0,0,1],z:[0,-1,0]}));
    asmActivatePath([oB.id]);
    doc.cgeo.push(FR('fb','Repère B',{o:[0,0,5],x:[1,0,0],y:[0,1,0],z:[0,0,1]}));
    att(asmCkPrefix()===B.id+'§','préfixe = composant actif B');
    asmActivatePath([]);
    att(doc===Rt.doc&&docUndoStack.length===1&&docUndoStack[0].label==='modif racine','retour à la racine : sa pile d annulation revient');
    // ── alignement : repère B sur repère A2 de l'occurrence A ──
    const comp=(o,rel)=>asmCompose(o.fr,asmRelFrame(o.comp,rel));
    const sB={path:[],cg:'fb'};
    oB.align={src:sB,dst:{path:[oA.id],cg:'fa2'},flip:false,rz:0,off:[0,0,0]};
    att(asmResolve()===true,'alignement : l occurrence bouge');
    let W=comp(oB,sB);
    V(W.o,[10,0,0],'repère B posé sur repère A2 : origine');V(W.z,[0,-1,0],'repère B : Z = Z de A2');V(W.x,[1,0,0],'repère B : X = X de A2');
    att(oB.st==='ok','alignement résolu');
    oB.align.flip=true;asmResolve();W=comp(oB,sB);
    V(W.o,[10,0,0],'retourné : même origine');V(W.z,[0,1,0],'retourné : Z inversé');V(W.x,[1,0,0],'retourné : X conservé');
    oB.align.flip=false;oB.align.rz=90;oB.align.off=[1,2,3];asmResolve();W=comp(oB,sB);
    // cible : origine de A2 + décalage dans les axes de A2 (x=[1,0,0], y=[0,0,1], z=[0,-1,0])
    V(W.o,[11,-3,2],'décalage dans le repère cible');V(W.x,[0,0,1],'rotation 90° autour de Z : X = Y de A2');
    // associatif : le repère de A bouge (composant modifié) → B suit
    oB.align.rz=0;oB.align.off=[0,0,0];
    A.doc.cgeo[0].fr.o=[20,0,0];asmResolve();W=comp(oB,sB);
    V(W.o,[20,0,0],'associatif : B suit le repère de A');
    // géométrie de base de la racine comme cible (son repère de construction fa)
    oB.align={src:sB,dst:{path:[],cg:'fa'},flip:false,rz:0,off:[0,0,0]};asmResolve();W=comp(oB,sB);
    V(W.o,[10,0,0],'cible = repère de base de la racine');V(W.z,[0,-1,0],'cible repère de base : Z');
    oB.align={src:sB,dst:{path:[],cg:null},flip:false,rz:0,off:[0,0,0]};asmResolve();W=comp(oB,sB);
    V(W.o,[0,0,0],'cible = origine de la racine');
    // cycle
    oB.align={src:sB,dst:{path:[oA.id],cg:'fa2'}};oA.align={src:{path:[],cg:'fa2'},dst:{path:[oB.id],cg:'fb'}};
    const keep=JSON.stringify(oA.fr);asmResolve();
    att(oA.st==='warn'&&oB.st==='warn'&&/circulaire/.test(oA.msg),'cycle : les deux ⚠');
    att(JSON.stringify(oA.fr)===keep,'cycle : position mémorisée');
    oA.align=null;oB.align={src:sB,dst:{path:[oA.id],cg:'fa2'},flip:false,rz:0,off:[0,0,0]};asmResolve();
    // ── rotation de placement (48) : +90° autour de Z, pivot = origine de l'occurrence
    const Rz=asmRotFr({o:[5,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]},[5,0,0],[0,0,1],Math.PI/2);
    V(Rz.o,[5,0,0],'rotation : pivot fixe');V(Rz.x,[0,1,0],'rotation +90° Z : X → Y');V(Rz.y,[-1,0,0],'rotation +90° Z : Y → −X');
    const Rp=asmRotFr({o:[5,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]},[0,0,0],[0,0,1],Math.PI);
    V(Rp.o,[-5,0,0],'rotation autour d un autre pivot : l origine tourne');
    // ── sauvegarde / ouverture ──
    asmActivatePath([oA.id]);
    const js1=serialise();
    const o1=JSON.parse(js1);
    att(o1.asm&&o1.asm.v===2&&o1.asm.comps.length===3&&o1.asm.root===Rt.id,'bloc asm v2 écrit (3 composants)');
    att(o1.name==='Bride'&&o1.asm.comps.find(q=>q.id===A.id).doc===null,'composant actif au premier niveau (doc null dans asm)');
    att(o1.asm.comps.find(q=>q.id===B.id).doc.name==='Axe','autre composant sérialisé');
    att(o1.asm.comps.find(q=>q.id===B.id).doc.view===undefined,'autre composant : pas d état d interface');
    att(o1.asm.comps.find(q=>q.id===Rt.id).occ.length===2,'occurrences portées par la racine');
    await deserialise(js1,{rebuild:false});
    att(asm&&asm.comps.length===3&&asm.active===A.id&&doc===asmComp(A.id).doc&&asm.path.join()===oA.id,'ouverture : arbre reconstruit, A active par son chemin');
    att(asmComp(Rt.id).doc.fao&&asmComp(Rt.id).doc.fao.setups[0].id==='stA','ouverture : FAO de la racine relue');
    const B2=asmComp(B.id);
    att(B2&&B2.doc.cgeo.length===1&&B2.doc.cgeo[0].id==='fb','ouverture : construction de B relue');
    V(asmOcc(oB.id).fr.o,oB.fr.o,'ouverture : position de B');
    ensureBodies();doc.sketches.forEach(migrateSketch);
    const js2=serialise();await deserialise(js2,{rebuild:false});ensureBodies();
    att(serialise()===js2,'aller-retour stable');
    att(sansAsm(js2).length>0&&JSON.parse(js2).v===1,'format : v1 au premier niveau (compatibilité)');
    // ancien fichier
    await deserialise(js0,{rebuild:false});
    att(asm===null,'ancien fichier : pas d assemblage');
    // ── suppression, annuler de l'assemblage ──
    await deserialise(js2,{rebuild:false});
    const ob=asmOcc(oB.id);
    att(asmDeleteOcc(ob.id)===true,'suppression de la dernière occurrence de B');
    att(asm.comps.length===2&&!asmComp(B.id),'B supprimé avec sa dernière occurrence');
    att(asmUndo()===true&&asm.comps.length===3&&asmComp(B.id)&&asmOcc(oB.id),'annuler : B revient');
    att(asmRedo()===true&&asm.comps.length===2,'rétablir : B repart');
    // supprimer l'instance éditée : on remonte au porteur
    att(asm.active===A.id,'A toujours active');
    asmDeleteOcc(oA.id);
    att(asm.active===Rt.id&&asm.path.length===0&&doc===asmRoot().doc,'instance éditée supprimée : retour à la racine');
    // ── fichier V0.6.0 : bloc asm v1 (pièces à un seul niveau, sans géométrie d'assemblage) ──
    docResetEmpty();doc.name='Socle';
    doc.cgeo.push(FR('fs','Dessus',{o:[0,0,20],x:[1,0,0],y:[0,1,0],z:[0,0,1]}));
    const top=JSON.parse(serialise(false));
    const axe=Object.assign(JSON.parse(serialise(false)),{name:'Pied'});axe.cgeo=[FR('fp','Bas',{o:[0,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]})];
    top.asm={v:1,name:'Banc',active:'p1',mode:'asm',
      parts:[{id:'p1',kind:'part',name:'Socle',doc:null},{id:'p2',kind:'part',name:'Pied',doc:axe}],
      occ:[{id:'o1',part:'p1',name:'Socle:1',fr:{o:[5,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]},fixed:true,visible:true,align:null},
           {id:'o2',part:'p2',name:'Pied:1',fr:{o:[0,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]},fixed:false,visible:true,align:{src:'fp',dst:{occ:'o1',cg:'fs'},flip:false,rz:0,off:[0,0,0]}}]};
    await deserialise(JSON.stringify(top),{rebuild:false});
    const r1=asmRoot();
    att(asm&&asm.comps.length===3&&r1.name==='Banc'&&!r1.doc.features.length,'V0.6.0 : racine vide créée (nom de l assemblage)');
    att(r1.occ.length===2&&r1.occ[0].comp==='p1','V0.6.0 : occurrences portées par la racine');
    att(asm.active==='p1'&&asm.path.join()==='o1'&&doc.name==='Socle','V0.6.0 : pièce active = Socle, par son occurrence');
    const o2=asmOcc('o2');
    att(o2.align&&o2.align.src.cg==='fp'&&o2.align.dst.path.join()==='o1'&&o2.align.dst.cg==='fs','V0.6.0 : alignement converti en chemins');
    V(asmCompose(o2.fr,asmRelFrame('p2',o2.align.src)).o,[5,0,20],'V0.6.0 : pied posé sur le dessus du socle (position monde)');
    att(asmTreeFromSerial(top.asm,doc).wantAsm===true,'V0.6.0 : enregistré en vue d assemblage → rouvert en mode Placer');
    if(ATT.length){p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  x '+m));}
    else p('TOUT EST CONFORME');
    return P.join(String.fromCharCode(10));
  `;
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'assemblage.js'});
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,800));process.exit(1);});
