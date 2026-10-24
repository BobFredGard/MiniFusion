// V0.6.4 : références entre composants (construction « Depuis un autre composant », 46 / 78).
// Modèle, sans noyau : plan d'un autre composant repris dans celui-ci (valeur dans SON repère),
// esquisse posée dessus, suivi quand l'autre se déplace (composant actif ou non), contexte d'une
// instance parmi plusieurs, figer, références circulaires (⚠ après trois passes), fichier.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=`
    const P=[];const p=s=>P.push(String(s));
    const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};
    confirm=function(){return true;};alert=function(){};
    const near=(a,b,t)=>Array.isArray(a)&&a.length===3&&a.every((x,i)=>Math.abs(x-b[i])<(t||1e-6));
    const V=(a,b,msg)=>att(near(a,b),msg+' : vu ['+(a||[]).map(x=>+(+x).toFixed(4)).join(', ')+'] attendu ['+b.join(', ')+']');
    const at=(o,x)=>{o.fr={o:x,x:[1,0,0],y:[0,1,0],z:[0,0,1]};};
    docResetEmpty();doc.name='Banc';asmEnsure();
    const Rt=asmRoot();
    const A=asmNewComp('Socle').comp,oA=Rt.occ[0];
    const B=asmNewComp('Capot').comp,oB=Rt.occ[1];
    at(oA,[50,0,0]);at(oB,[0,0,0]);
    // Socle : plan décalé de 10 au-dessus de son XY
    asmActivatePath([oA.id]);
    doc.cgeo.push({id:'pa',kind:'plane',how:'offset',name:'Dessus socle',refs:[{k:'o',id:'XY'}],p:{d:10},at:null,visible:true,fr:null,st:'ok',msg:''});
    markDirty();rebuild();
    V(A.doc.cgeo[0].fr.o,[0,0,10],'1 : plan du socle (dans le socle)');
    // Capot : le plan du socle, repris ici, et une esquisse dessus
    asmActivatePath([oB.id]);
    doc.cgeo.push({id:'px',kind:'plane',how:'ext',name:'Plan du socle',refs:[],p:{},at:null,visible:true,fr:null,st:'ok',msg:'',
      ext:{ctx:[oB.id],path:[oA.id],cg:'pa',o:null,frozen:false}});
    doc.sketches.push({id:'skx',name:'Esquisse sur le socle',plane:'CG',cg:{id:'px'},origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{},entities:[],constraints:[],dims:[],seq:1});
    markDirty();rebuild();
    const px=()=>B.doc.cgeo.find(c=>c.id==='px'),sk=()=>B.doc.sketches.find(s=>s.id==='skx');
    V(px().fr.o,[50,0,10],'2 : plan repris dans le capot (position du socle comprise)');
    att(px().st==='ok','3 : résolu sans avertissement ('+px().msg+')');
    V(sk().origin,[50,0,10],'4 : esquisse posée dessus');
    // le socle se déplace : capot ACTIF
    asmPush('déplacer');at(oA,[60,0,0]);
    att(asmExtStale().length===1&&asmExtStale()[0]===B,'5 : capot signalé à rejouer');
    att(asmExtSync()===true,'6 : synchronisé');
    V(px().fr.o,[60,0,10],'7 : le plan suit le socle (capot actif)');
    V(sk().origin,[60,0,10],'8 : l esquisse suit');
    // le socle se déplace : capot INACTIF (rejoué en arrière-plan)
    asmActivatePath([]);
    at(oA,[70,0,0]);asmExtSync();
    V(px().fr.o,[70,0,10],'9 : capot inactif : rejoué, le plan suit');
    att(asm.active===Rt.id&&doc===Rt.doc,'10 : retour au composant actif d avant');
    // le socle change (son plan monte) : le capot suit
    asmActivatePath([oA.id]);
    A.doc.cgeo[0].p.d=25;markDirty();rebuild();asmActivatePath([]);asmExtSync();
    V(px().fr.o,[70,0,25],'11 : le plan du socle monte : le capot suit');
    // deux instances du capot : la référence est prise dans SON contexte
    const oB2=asmAddOcc(B.id,{o:[0,0,100],x:[1,0,0],y:[0,1,0],z:[0,0,1]},Rt.id);
    V(asmExtFrame(px(),B.id).o,[70,0,25],'12 : contexte = la première instance (celle de la création)');
    V(asmExtFrame({ext:Object.assign({},px().ext,{ctx:[oB2.id]})},B.id).o,[70,0,-75],'13 : même référence vue depuis la seconde instance');
    // figer
    px().ext.frozen=true;at(oA,[80,0,0]);asmExtSync();
    V(px().fr.o,[70,0,25],'14 : figée : ne suit plus');
    asmActivatePath([oB.id]);markDirty();rebuild();
    V(px().fr.o,[70,0,25],'15 : figée : même au rejeu du capot');
    px().ext.frozen=false;markDirty();rebuild();
    V(px().fr.o,[80,0,25],'16 : libérée : reprend la position');
    // fichier
    asmActivatePath([]);
    const js=serialise();await deserialise(js,{rebuild:false});
    const B2=asmComp(B.id),px2=B2.doc.cgeo.find(c=>c.id==='px');
    att(px2&&px2.how==='ext'&&px2.ext.path.join()===oA.id&&px2.ext.cg==='pa'&&near(px2.fr.o,[80,0,25]),'17 : fichier : référence relue');
    // élément visé disparu : position mémorisée, ⚠
    asmActivatePath([oA.id]);doc.cgeo=[];markDirty();rebuild();
    asmActivatePath([oB.id]);markDirty();rebuild();
    const px3=asmComp(B.id).doc.cgeo.find(c=>c.id==='px');
    att(px3.st==='warn'&&/introuvable/.test(px3.msg)&&near(px3.fr.o,[80,0,25]),'18 : élément visé supprimé : ⚠, position gardée');
    // circulaire : le socle est aligné sur un repère du capot qui reprend… un repère du socle
    docResetEmpty();doc.name='Boucle';asmEnsure();
    const S=asmNewComp('S').comp,oS=asmRoot().occ[0];const C=asmNewComp('C').comp,oC=asmRoot().occ[1];
    S.doc.cgeo.push({id:'fs',kind:'frame',how:'zx',name:'Repère S',refs:[],p:{},at:null,visible:true,fr:{o:[0,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]},st:'ok',msg:''});
    asmActivatePath([oC.id]);
    doc.cgeo.push({id:'fc',kind:'frame',how:'ext',name:'Repère C',refs:[],p:{dz:5},at:null,visible:true,fr:null,st:'ok',msg:'',ext:{ctx:[oC.id],path:[oS.id],cg:'fs',o:null}});
    markDirty();rebuild();asmActivatePath([]);
    oS.align={src:{path:[],cg:'fs'},dst:{path:[oC.id],cg:'fc'},flip:false,rz:0,off:[0,0,0]};asmResolve();
    asmExtSync();
    const fc=C.doc.cgeo.find(c=>c.id==='fc');
    att(fc.st==='warn'&&/circulaires/.test(fc.msg),'19 : références circulaires : ⚠ après trois passes ('+fc.msg+')');
    if(ATT.length){p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  x '+m));}
    else p('TOUT EST CONFORME');
    return P.join(String.fromCharCode(10));
  `;
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'references.js'});
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,800));process.exit(1);});
