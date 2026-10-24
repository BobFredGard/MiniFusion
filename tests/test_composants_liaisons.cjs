// V0.6.5 : liaisons mécaniques (46 : asmJointFrame / asmJointTarget / asmAsBuilt ; 48 : animation,
// manipulateur). Modèle, sans noyau : rigide = l'alignement d'avant, pivot, limites, glissière,
// pivot glissant, plan, rotule, liaison telle que construite (rien ne bouge, puis rotation autour
// de l'axe de l'occurrence), chaîne de deux liaisons, boucle (⚠), fichier, animation (aller-retour
// entre les limites), degrés de liberté proposés au manipulateur.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=`
    const P=[];const p=s=>P.push(String(s));
    const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};
    confirm=function(){return true;};alert=function(){};
    const near=(a,b,t)=>Array.isArray(a)&&a.length===3&&a.every((x,i)=>Math.abs(x-b[i])<(t||1e-6));
    const V=(a,b,msg)=>att(near(a,b),msg+' : vu ['+(a||[]).map(x=>+(+x).toFixed(5)).join(', ')+'] attendu ['+b.map(x=>+(+x).toFixed(5)).join(', ')+']');
    const FR=(id,name,o)=>({id,kind:'frame',how:'zx',name,refs:[],p:{},at:null,visible:true,fr:{o,x:[1,0,0],y:[0,1,0],z:[0,0,1]},st:'ok',msg:''});
    const c30=Math.cos(Math.PI/6),s30=Math.sin(Math.PI/6),c20=Math.cos(Math.PI/9),s20=Math.sin(Math.PI/9);
    docResetEmpty();doc.name='Mécanisme';asmEnsure();
    const Rt=asmRoot();
    const A=asmNewComp('Bâti').comp,oA=Rt.occ[0];A.doc.cgeo.push(FR('fa','Axe du bâti',[0,0,10]));
    const B=asmNewComp('Bras').comp,oB=Rt.occ[1];B.doc.cgeo.push(FR('fb','Pied du bras',[0,0,0]),FR('fe','Bout du bras',[40,0,0]));
    const W=(o,cg)=>asmCompose(o.fr,asmRelFrame(o.comp,{path:[],cg}));
    // rigide (= l'alignement de V0.6.0)
    oB.align=asmAlignNorm({src:{path:[],cg:'fb'},dst:{path:[oA.id],cg:'fa'}});asmResolve();
    V(W(oB,'fb').o,[0,0,10],'1 : rigide : pied du bras sur l axe du bâti');V(W(oB,'fb').x,[1,0,0],'1b : rigide : X');
    att(!oB.align.type&&!asmDofs(oB.align).length,'2 : rigide : aucun degré de liberté');
    // pivot à 30°
    oB.align.type='revolute';oB.align.q={rz:30};asmResolve();
    V(W(oB,'fb').o,[0,0,10],'3 : pivot : l axe ne bouge pas');V(W(oB,'fb').x,[c30,s30,0],'4 : pivot à 30° : X tourne');
    V(W(oB,'fe').o,[40*c30,40*s30,10],'5 : pivot : le bout du bras décrit un cercle');
    // limites
    oB.align.lim={rz:[-10,20]};asmResolve();
    V(W(oB,'fb').x,[c20,s20,0],'6 : limite haute 20° : bloqué');
    att(asmDofClamp(oB.align,'rz',-50)===-10,'7 : limite basse');
    delete oB.align.lim;
    // glissière, pivot glissant, plan, rotule
    oB.align.type='slider';oB.align.q={tz:5};asmResolve();
    V(W(oB,'fb').o,[0,0,15],'8 : glissière : +5 le long de Z');V(W(oB,'fb').x,[1,0,0],'8b : glissière : pas de rotation');
    oB.align.type='cylindrical';oB.align.q={rz:90,tz:5};asmResolve();
    V(W(oB,'fb').o,[0,0,15],'9 : pivot glissant : translation');V(W(oB,'fb').x,[0,1,0],'9b : pivot glissant : rotation 90°');
    oB.align.type='planar';oB.align.q={tx:3,ty:4,rz:0,tz:99};asmResolve();
    V(W(oB,'fb').o,[3,4,10],'10 : plan : X / Y (tz ignoré : pas un degré de liberté du plan)');
    oB.align.type='ball';oB.align.q={rx:90};asmResolve();
    V(W(oB,'fb').o,[0,0,10],'11 : rotule : centre fixe');V(W(oB,'fb').z,[0,-1,0],'11b : rotule : rotation X de 90°');
    // chaîne : une biellette pivotée au bout du bras
    oB.align.type='revolute';oB.align.q={rz:90};asmResolve();
    const C=asmNewComp('Biellette').comp,oC=Rt.occ[2];C.doc.cgeo.push(FR('fc','Œil',[0,0,0]));
    oC.align=asmAlignNorm({src:{path:[],cg:'fc'},dst:{path:[oB.id],cg:'fe'},type:'revolute',q:{rz:90}});asmResolve();
    V(W(oC,'fc').o,[0,40,10],'12 : chaîne : la biellette suit le bout du bras');
    V(W(oC,'fc').x,[-1,0,0],'13 : chaîne : angles cumulés (90 + 90)');
    // boucle fermée
    oA.align=asmAlignNorm({src:{path:[],cg:'fa'},dst:{path:[oC.id],cg:'fc'},type:'revolute'});asmResolve();
    att(oA.st==='warn'&&/circulaire/.test(oA.msg),'14 : boucle fermée : ⚠ (pas de solveur)');
    oA.align=null;asmResolve();
    // telle que construite
    const D=asmNewComp('Volet').comp,oD=Rt.occ[3];
    oD.fr={o:[50,0,0],x:[0,1,0],y:[-1,0,0],z:[0,0,1]};
    const fr0=JSON.stringify(oD.fr);
    oD.align=asmAsBuilt(oD,'revolute','z');asmResolve();
    att(JSON.stringify(oD.fr)===fr0,'15 : telle que construite : rien ne bouge');
    oD.align.q={rz:90};asmResolve();
    V(oD.fr.o,[50,0,0],'16 : telle que construite : tourne autour de SON origine');V(oD.fr.x,[-1,0,0],'17 : … de SON axe Z (X : [0,1,0] → [-1,0,0])');
    oD.align=asmAsBuilt(Object.assign({},oD,{fr:JSON.parse(fr0)}),'revolute','x');oD.fr=JSON.parse(fr0);asmResolve();
    att(JSON.stringify(oD.fr)===fr0,'18 : axe X de l occurrence : rien ne bouge');
    oD.align.q={rz:90};asmResolve();
    V(oD.fr.x,[0,1,0],'19 : rotation autour de SON axe X : X inchangé');V(oD.fr.z,[1,0,0],'19b : … Z tourne (vers +X monde)');
    // fichier
    oB.align.lim={rz:[-45,45]};oB.align.q0={rz:10};
    const js=serialise();await deserialise(js,{rebuild:false});
    const oB2=asmOcc(oB.id),oD2=asmOcc(oD.id);
    att(oB2.align.type==='revolute'&&oB2.align.q.rz===90&&oB2.align.lim.rz.join()==='-45,45'&&oB2.align.q0.rz===10,'20 : fichier : type, valeurs, limites, repos');
    att(oD2.align.rel&&oD2.align.sfr&&oD2.align.type==='revolute','21 : fichier : liaison telle que construite');
    V(asmCompose(oB2.fr,asmRelFrame(oB2.comp,{path:[],cg:'fb'})).x,[Math.cos(Math.PI/4),Math.sin(Math.PI/4),0],'22 : rouvert : limitée à 45°');
    // animation : aller-retour entre les limites
    const an={occ:oB.id,k:'rz',dir:1,last:0};oB2.align.q.rz=40;
    asmAnimTick(an,0.1);att(Math.abs(oB2.align.q.rz-45)<1e-9&&an.dir===-1,'23 : animation : butée haute, demi-tour');
    asmAnimTick(an,0.5);att(Math.abs(oB2.align.q.rz-0)<1e-9,'24 : animation : redescend (90°/s)');
    // manipulateur : seulement les degrés de liberté
    asmSelId=oB.id;
    const G=asmGizmoSpec(oB2);
    att(G&&G.h.length===1&&G.h[0].kind==='rot'&&G.h[0].ax===2&&G.h[0].dof==='rz','25 : manipulateur d un pivot : un anneau, autour de Z de la liaison');
    oB2.align.type='planar';att(asmGizmoSpec(oB2).h.map(h=>h.dof).join()==='tx,ty,rz','26 : plan : deux flèches et un anneau');
    oB2.align.type=undefined;delete oB2.align.type;att(asmGizmoSpec(oB2)===null,'27 : rigide : pas de manipulateur');
    if(ATT.length){p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  x '+m));}
    else p('TOUT EST CONFORME');
    return P.join(String.fromCharCode(10));
  `;
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'liaisons.js'});
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,800));process.exit(1);});
