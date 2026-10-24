// Composants imbriqués (46-assemblage-modele.js, V0.6.1), modèle seul, sans noyau : arbre à
// trois niveaux, repère monde d'une instance, alignement sur la géométrie de base de la
// racine et sur un repère d'un sous-composant, résolution de bas en haut, associativité,
// refus des cycles de contenance, activation par chemin, suppression, aller-retour du
// fichier, insertion d'un fichier imbriqué (structure gardée, identifiants renouvelés).
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
    const FR=(id,name,o)=>({id,kind:'frame',how:'zx',name,refs:[],p:{},at:null,visible:true,fr:{o,x:[1,0,0],y:[0,1,0],z:[0,0,1]},st:'ok',msg:''});
    docResetEmpty();doc.name='Banc';
    doc.cgeo.push(FR('base','Repère de base',[0,0,100]));
    asmEnsure();
    const Rt=asmRoot();
    // ── Châssis dans la racine, Roue dans le Châssis ──
    const nc=asmNewComp('Châssis');const C=nc.comp,oC=nc.occ;
    C.doc.cgeo.push(FR('top','Dessus',[0,0,5]));
    oC.fr={o:[10,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]};
    const nw=asmNewComp('Roue',C.id);const W=nw.comp,oW=nw.occ;
    W.doc.cgeo.push(FR('axe','Axe',[1,0,0]));
    oW.fr={o:[3,0,0],x:[0,1,0],y:[-1,0,0],z:[0,0,1]};
    att(nw.owner===C&&C.occ.length===1&&Rt.occ.length===1,'Roue portée par le Châssis, pas par la racine');
    const Wp=asmWorld([oC.id,oW.id]);
    V(Wp.o,[13,0,0],'repère monde de la Roue : origine');V(Wp.x,[0,1,0],'repère monde de la Roue : X');
    V(asmCompose(Wp,asmCompFrame(W.id,'axe')).o,[13,1,0],'repère Axe de la Roue, dans la racine');
    att(asmInstances(Rt.id).length===3,'3 instances : racine, Châssis, Roue');
    att(asmPathComp([oC.id,oW.id])===W.id&&asmPathComp([oW.id])===null,'chemin absolu valide / rompu');
    att(asmContains(C.id,W.id)&&!asmContains(W.id,C.id),'contenance');
    // ── cycles de contenance refusés ──
    att(asmAddOcc(C.id,null,W.id)===null,'Châssis dans la Roue : refusé (cycle)');
    att(asmAddOcc(Rt.id,null,C.id)===null,'racine dans le Châssis : refusé');
    att(asmAddOcc(C.id,null,C.id)===null,'Châssis dans lui-même : refusé');
    // ── alignements : Châssis sur le repère de base, Roue sur le dessus du Châssis,
    //    Plaque (racine) sur l'Axe de la Roue — trois niveaux, de bas en haut ──
    oC.align={src:{path:[],cg:'top'},dst:{path:[],cg:'base'},flip:false,rz:0,off:[0,0,0]};
    oW.align={src:{path:[],cg:'axe'},dst:{path:[],cg:'top'},flip:false,rz:0,off:[0,0,0]};
    const np=asmNewComp('Plaque');const Pl=np.comp,oP=np.occ;
    oP.align={src:{path:[],cg:null},dst:{path:[oC.id,oW.id],cg:'axe'},flip:false,rz:0,off:[0,0,0]};
    Rt.occ.reverse(); // Plaque avant le Châssis : l'ordre des dépendances doit être retrouvé
    asmResolve();
    V(oC.fr.o,[0,0,95],'Châssis : dessus posé sur le repère de base');
    V(oW.fr.o,[-1,0,5],'Roue : axe posé sur le dessus du Châssis (dans le Châssis)');
    V(asmWorld([oP.id]).o,[0,0,100],'Plaque : sur l axe de la Roue, deux niveaux plus bas');
    att([oC,oW,oP].every(o=>o.st==='ok'),'trois alignements résolus');
    // associatif : la géométrie de base de la racine bouge → tout suit
    Rt.doc.cgeo[0].fr.o=[0,0,200];asmResolve();
    V(oC.fr.o,[0,0,195],'associatif : le Châssis suit le repère de base');
    V(asmWorld([oP.id]).o,[0,0,200],'associatif : la Plaque suit');
    // la Roue change (son repère Axe) → la Plaque suit, le Châssis non
    W.doc.cgeo[0].fr.o=[2,0,0];asmResolve();
    V(oW.fr.o,[-2,0,5],'Roue : se recale dans le Châssis');
    V(asmWorld([oP.id]).o,[0,0,200],'Plaque : toujours sur l axe (qui reste au même endroit)');
    V(oC.fr.o,[0,0,195],'Châssis : inchangé');
    // ── deuxième Roue dans la racine ; activation par chemin ──
    const oW2=asmAddOcc(W.id,{o:[50,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]},Rt.id);
    att(oW2&&oW2.name==='Roue:2','deuxième occurrence de la Roue : Roue:2');
    att(asmCompOccs(W.id).length===2,'Roue : deux instances');
    asmActivatePath([oC.id,oW.id]);
    att(doc===W.doc&&asm.active===W.id&&asm.path.length===2,'activation par chemin : la Roue du Châssis');
    asmActivate(W.id,[oW2.id]);
    att(asm.path.join()===oW2.id&&doc===W.doc,'même composant, autre instance : chemin changé');
    asmActivatePath([oC.id]);
    att(doc===C.doc,'Châssis actif');
    // ── aller-retour du fichier ──
    const js=serialise();
    const o1=JSON.parse(js);
    att(o1.asm.v===2&&o1.asm.comps.length===4&&o1.asm.path.join()===oC.id,'fichier : 4 composants, chemin actif');
    att(o1.name==='Châssis','fichier : composant actif au premier niveau');
    await deserialise(js,{rebuild:false});
    att(asm.comps.length===4&&asmComp(C.id).occ.length===1&&asmRoot().occ.length===3,'ouverture : arbre imbriqué relu');
    V(asmWorld([oC.id,oW.id]).o,[-2,0,200],'ouverture : position monde de la Roue du Châssis');
    att(asmRoot().doc.cgeo[0].id==='base','ouverture : géométrie de base de la racine relue');
    ensureBodies();
    const js2=serialise();await deserialise(js2,{rebuild:false});ensureBodies();
    att(serialise()===js2,'aller-retour stable');
    // ── fichier avec un cycle : occurrence écartée ──
    const bad=JSON.parse(js2);const cc=bad.asm.comps.find(q=>q.id===W.id);
    cc.occ.push({id:'oX',comp:C.id,name:'boucle',fr:{o:[0,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]},fixed:false,visible:true,align:null});
    await deserialise(JSON.stringify(bad),{rebuild:false});
    att(!asmOcc('oX')&&asmComp(W.id).occ.length===0,'fichier abîmé : occurrence qui ferait un cycle écartée');
    // ── insertion d'un fichier imbriqué ──
    await deserialise(js2,{rebuild:false});
    const txt=serialise();
    docResetEmpty();doc.name='Atelier';
    let ok=false;try{ok=await asmInsertText(txt,'Banc.miniFusion');}catch(e){p('insertion : '+e.message);}
    att(ok===true,'insertion : faite');
    if(ok){
      const R2=asmRoot();
      att(R2.doc===doc&&R2.occ.length===1,'insertion : une occurrence dans la racine Atelier');
      const ins=asmComp(R2.occ[0].comp);
      att(ins.name==='Banc'&&ins.doc.cgeo.some(k=>k.id==='base'),'insertion : la racine du fichier devient un composant, avec sa géométrie');
      att(asm.comps.length===5&&!asmComp(C.id)&&ins.occ.length===3,'insertion : 4 composants copiés avec de nouveaux identifiants, imbrication gardée');
      const oPl=ins.occ.find(q=>q.name==='Plaque:1'),oCh=ins.occ.find(q=>q.name==='Châssis:1');
      att(oPl&&oPl.align&&oPl.align.dst.path[0]===oCh.id&&oPl.align.dst.path[0]!==oC.id,'insertion : chemins d alignement renumérotés');
      asmResolve();
      const dx=R2.occ[0].fr.o;
      V(asmWorld([R2.occ[0].id,oPl.id]).o,[dx[0],dx[1],dx[2]+200],'insertion : la Plaque reste sur l axe de la Roue');
    }
    if(ATT.length){p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  x '+m));}
    else p('TOUT EST CONFORME');
    return P.join(String.fromCharCode(10));
  `;
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'composants.js'});
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,800));process.exit(1);});
