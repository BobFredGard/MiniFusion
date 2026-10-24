// Assemblage (46-assemblage-modele.js), modèle seul, sans noyau : un document d'une
// seule pièce reste identique ; pièces et occurrences ; changer de pièce active garde
// FAO, PLAN, construction et annulation de chacune ; sauvegarde / ouverture ;
// alignement de repères (retournement, rotation, décalage, associatif, cycle) ;
// suppression ; annuler de l'assemblage ; préfixe des points de contrôle.
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
    docResetEmpty();
    att(asm===null,'document neuf : pas d assemblage');
    doc.name='Bride';
    doc.cgeo.push({id:'fa',kind:'frame',how:'zx',name:'Repère A',refs:[],p:{},at:null,visible:true,fr:{o:[10,0,0],x:[1,0,0],y:[0,0,1],z:[0,-1,0]},st:'ok',msg:''});
    doc.fao={setups:[{id:'stA',name:'Posage A',ops:[]}],activeSetupId:'stA'};
    doc.mep={sheets:[{id:'shA'}]};
    const js0=serialise(false);
    att(js0.indexOf('"asm"')<0,'pièce seule : aucun bloc asm');
    asmEnsure();
    att(asm&&asm.parts.length===1&&asm.occ.length===1,'asmEnsure : 1 pièce, 1 occurrence');
    att(asm.parts[0].doc===doc,'la pièce active EST doc');
    att(serialise(false)===js0,'assemblage d une pièce à l origine : fichier strictement identique');
    att(asmCkPrefix()==='','une pièce : clés de cache sans préfixe');
    // ── deuxième pièce ──
    const A=asm.parts[0],oA=asm.occ[0];
    const nb=asmNewPart('Axe');const B=nb.part,oB=nb.occ;
    att(asm.parts.length===2&&asm.occ.length===2,'nouvelle pièce : 2 pièces, 2 occurrences');
    att(oB.name==='Axe:1'&&oB.fixed===false,'occurrence nommée Axe:1, libre');
    att(asmCkPrefix()===A.id+'§','plusieurs pièces : clés préfixées par la pièce active');
    // annulation propre à la pièce A
    docUndoStack.length=0;docPushUndo('modif A');
    att(docUndoStack.length===1,'pièce A : 1 étape d annulation');
    // ── bascule vers B ──
    asmActivate(B.id);
    att(doc===B.doc&&asm.active===B.id,'B active : doc = document de B');
    att(doc.name==='Axe','B active : son nom');
    att(docUndoStack.length===0,'B active : sa propre pile d annulation (vide)');
    att(A.doc.fao&&A.doc.fao.setups[0].id==='stA','A inactive : sa FAO intacte');
    att(A.doc.mep&&A.doc.mep.sheets[0].id==='shA','A inactive : son PLAN intact');
    att(A.doc.cgeo.length===1,'A inactive : sa construction intacte');
    doc.cgeo.push({id:'fb',kind:'frame',how:'zx',name:'Repère B',refs:[],p:{},at:null,visible:true,fr:{o:[0,0,5],x:[1,0,0],y:[0,1,0],z:[0,0,1]},st:'ok',msg:''});
    att(asmCkPrefix()===B.id+'§','préfixe = pièce active B');
    asmActivate(A.id);
    att(doc===A.doc&&docUndoStack.length===1&&docUndoStack[0].label==='modif A','retour sur A : sa pile d annulation revient');
    att(!doc.fao||doc.fao.setups[0].id==='stA','retour sur A : FAO de A');
    // ── alignement : repère B sur repère A ──
    const comp=(o,cg)=>asmCompose(o.fr,asmPartFrame(o.part,cg));
    oB.align={src:'fb',dst:{occ:oA.id,cg:'fa'},flip:false,rz:0,off:[0,0,0]};
    att(asmResolve()===true,'alignement : l occurrence bouge');
    let W=comp(oB,'fb');
    V(W.o,[10,0,0],'repère B posé sur repère A : origine');V(W.z,[0,-1,0],'repère B : Z = Z de A');V(W.x,[1,0,0],'repère B : X = X de A');
    att(oB.st==='ok','alignement résolu');
    oB.align.flip=true;asmResolve();W=comp(oB,'fb');
    V(W.o,[10,0,0],'retourné : même origine');V(W.z,[0,1,0],'retourné : Z inversé');V(W.x,[1,0,0],'retourné : X conservé');
    oB.align.flip=false;oB.align.rz=90;oB.align.off=[1,2,3];asmResolve();W=comp(oB,'fb');
    // cible : origine de A + décalage dans les axes de A (x=[1,0,0], y=[0,0,1], z=[0,-1,0])
    V(W.o,[11,-3,2],'décalage dans le repère cible');V(W.x,[0,0,1],'rotation 90° autour de Z : X = Y de A');
    // associatif : le repère de A bouge (pièce modifiée) → B suit
    oB.align.rz=0;oB.align.off=[0,0,0];
    A.doc.cgeo[0].fr.o=[20,0,0];asmResolve();W=comp(oB,'fb');
    V(W.o,[20,0,0],'associatif : B suit le repère de A');
    // origine de l'assemblage comme cible
    oB.align={src:'fb',dst:{occ:null,cg:null},flip:false,rz:0,off:[0,0,0]};asmResolve();W=comp(oB,'fb');
    V(W.o,[0,0,0],'cible = origine de l assemblage');V(W.z,[0,0,1],'cible origine : Z');
    // cycle
    oB.align={src:'fb',dst:{occ:oA.id,cg:'fa'}};oA.align={src:'fa',dst:{occ:oB.id,cg:'fb'}};
    const keep=JSON.stringify(oA.fr);asmResolve();
    att(oA.st==='warn'&&oB.st==='warn'&&/circulaire/.test(oA.msg),'cycle : les deux ⚠');
    att(JSON.stringify(oA.fr)===keep,'cycle : position mémorisée');
    oA.align=null;oB.align={src:'fb',dst:{occ:oA.id,cg:'fa'},flip:false,rz:0,off:[0,0,0]};asmResolve();
    // ── sauvegarde / ouverture ──
    const js1=serialise();
    const o1=JSON.parse(js1);
    att(o1.asm&&o1.asm.parts.length===2&&o1.asm.occ.length===2,'bloc asm écrit (2 pièces, 2 occurrences)');
    att(o1.name==='Bride'&&o1.asm.parts.find(q=>q.id===A.id).doc===null,'pièce active au premier niveau (doc null dans asm)');
    att(o1.asm.parts.find(q=>q.id===B.id).doc.name==='Axe','autre pièce sérialisée');
    att(o1.asm.parts.find(q=>q.id===B.id).doc.view===undefined,'autre pièce : pas d état d interface');
    await deserialise(js1,{rebuild:false});
    att(asm&&asm.parts.length===2&&asm.active===A.id&&doc===asm.parts[0].doc,'ouverture : assemblage reconstruit, A active');
    const B2=asmPart(B.id);
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
    const ob=asm.occ.find(o=>o.part===B.id);
    att(asmDeleteOcc(ob.id)===true,'suppression de la dernière occurrence de B');
    att(asm.parts.length===1&&!asmPart(B.id),'B supprimée avec sa dernière occurrence');
    att(asmDeleteOcc(asm.occ[0].id)===false,'la dernière pièce ne se supprime pas');
    att(asmUndo()===true&&asm.parts.length===2&&asmPart(B.id),'annuler : B revient');
    att(asmRedo()===true&&asm.parts.length===1,'rétablir : B repart');
    if(ATT.length){p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  x '+m));}
    else p('TOUT EST CONFORME');
    return P.join(String.fromCharCode(10));
  `;
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'assemblage.js'});
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,800));process.exit(1);});
