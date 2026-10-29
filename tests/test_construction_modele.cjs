// Géométrie de construction (78-construction-modele.js), modèle seul, sans noyau :
// chaque méthode sur des références d'origine (valeurs attendues au µm), chaînes,
// ƒx, esquisse posée dessus, sauvegarde/ouverture, annuler, empreinte, suppression,
// marqueur temps, fonction d'ancrage supprimée.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=`
    const P=[];const p=s=>P.push(String(s));
    const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};
    confirm=function(){return true;};
    const near=(a,b,t)=>Array.isArray(a)&&a.length===3&&a.every((x,i)=>Math.abs(x-b[i])<(t||1e-6));
    const V=(a,b,msg)=>att(near(a,b),msg+' : vu ['+(a||[]).map(x=>+(+x).toFixed(6)).join(', ')+'] attendu ['+b.join(', ')+']');
    const O=id=>({k:'o',id}),C=(id,sub)=>sub?{k:'cg',id,sub}:{k:'cg',id};
    const S2=Math.SQRT1_2;
    docResetEmpty();
    att(Array.isArray(doc.cgeo)&&doc.cgeo.length===0,'document vide : cgeo = []');
    // ── plans ──
    const p1=cgNew('plane','offset',[O('XY')],{d:15});
    att(p1.name==='Plan 1','nom auto Plan 1 (vu '+p1.name+')');
    att(p1.at===null,'document vide : élément en tête de timeline');
    V(p1.fr.o,[0,0,15],'plan décalé de 15 : origine');V(p1.fr.z,[0,0,1],'plan décalé : normale');
    const p1b=cgNew('plane','offset',[O('XY')],{d:15,flip:true});
    V(p1b.fr.z,[0,0,-1],'plan décalé inversé : normale');
    att(Math.abs(cgDot(cgCross(p1b.fr.x,p1b.fr.y),p1b.fr.z)-1)<1e-9,'plan inversé : repère direct');
    const p2=cgNew('plane','offset',[C(p1.id)],{d:5});
    V(p2.fr.o,[0,0,20],'plan décalé d un plan décalé');
    const p3=cgNew('plane','angle',[O('XY'),O('X')],{a:30});
    V(p3.fr.z,[0,-0.5,Math.sqrt(3)/2],'plan à 30° autour de X : normale');
    V(p3.fr.x,[1,0,0],'plan à 30° : u = axe');
    const p4=cgNew('plane','3pts',[{k:'skpt',sk:'?',pt:'?'},O('O'),O('O')]);
    att(p4.st==='warn'&&/introuvable/.test(p4.msg),'3 points : référence introuvable signalée ('+p4.msg+')');
    // points pour les constructions par points
    const a=cgNew('point','xyz',[],{dx:10,dy:0,dz:0}),b=cgNew('point','xyz',[],{dx:0,dy:10,dz:0}),c=cgNew('point','xyz',[],{dx:0,dy:0,dz:10});
    V(a.fr.o,[10,0,0],'point par coordonnées');
    const p5=cgNew('plane','3pts',[C(a.id),C(b.id),C(c.id)]);
    V(p5.fr.z,[1/Math.sqrt(3),1/Math.sqrt(3),1/Math.sqrt(3)],'plan 3 points : normale');
    V(p5.fr.o,[10,0,0],'plan 3 points : origine = point 1');
    const pAl=cgNew('plane','3pts',[O('O'),C(a.id),O('O')]);
    att(pAl.st==='warn'&&/align/.test(pAl.msg),'3 points alignés refusés ('+pAl.msg+')');
    const p6=cgNew('plane','mid',[O('XY'),C(p2.id)]);
    V(p6.fr.o,[0,0,10],'plan médian XY / Z=20');
    const pNp=cgNew('plane','mid',[O('XY'),O('YZ')]);
    att(pNp.st==='warn'&&/parallèles/.test(pNp.msg),'médian de plans non parallèles refusé');
    const p7=cgNew('plane','normal',[O('Y'),C(a.id)]);
    V(p7.fr.z,[0,1,0],'plan normal à Y : normale');V(p7.fr.o,[10,0,0],'plan normal : passe par le point');
    // ── plan perpendiculaire à une courbe d'esquisse, au ratio de longueur (V0.19.9) ──
    {
      const skq={id:'skq',name:'Courbes',plane:'XY',entities:[],points:{},constraints:[],dims:[],seq:1,visible:true};
      skq.points={a:{x:0,y:0},b:{x:40,y:0},c:{x:0,y:0},d:{x:10,y:0},e:{x:0,y:10},s1:{x:0,y:0},s2:{x:20,y:20},s3:{x:40,y:0}};
      skq.entities=[{id:'L',t:'line',p1:'a',p2:'b'},{id:'A',t:'arc',pc:'c',pa:'d',pb:'e',r:10},{id:'S',t:'spline',pts:['s1','s2','s3']}];
      doc.sketches.push(skq);
      const E=e=>({k:'skent',sk:'skq',e});
      const l0=cgNew('plane','curve',[E('L')],{t:0}),l5=cgNew('plane','curve',[E('L')],{t:0.5}),l1=cgNew('plane','curve',[E('L')],{t:1});
      V(l0.fr.o,[0,0,0],'⟂ ligne t=0 : début');V(l5.fr.o,[20,0,0],'⟂ ligne t=0,5 : milieu');V(l1.fr.o,[40,0,0],'⟂ ligne t=1 : fin');
      V(l5.fr.z,[1,0,0],'⟂ ligne : normale = direction de la ligne');
      const lf=cgNew('plane','curve',[E('L')],{t:0.25,flip:true});
      V(lf.fr.o,[10,0,0],'⟂ ligne t=0,25');V(lf.fr.z,[-1,0,0],'⟂ ligne inversé : normale');
      const am=cgNew('plane','curve',[E('A')],{t:0.5});
      att(near(am.fr.o,[10*S2,10*S2,0],1e-3)&&near(am.fr.z,[-S2,S2,0],1e-3),'⟂ arc : normale = tangente (vu '+am.fr.z.join(', ')+')');
      const a1=cgNew('plane','curve',[E('A')],{t:1});
      att(near(a1.fr.o,[0,10,0],1e-6)&&near(a1.fr.z,[-1,0,0],1e-3),'⟂ arc t=1 : fin, tangente −X (vu '+a1.fr.o.join(', ')+' / '+a1.fr.z.join(', ')+')');
      const s0=cgNew('plane','curve',[E('S')],{t:0}),s5=cgNew('plane','curve',[E('S')],{t:0.5}),s1=cgNew('plane','curve',[E('S')],{t:1});
      V(s0.fr.o,[0,0,0],'⟂ spline t=0 : 1er point');V(s1.fr.o,[40,0,0],'⟂ spline t=1 : dernier point');
      att(near(s5.fr.o,[20,20,0],1e-3)&&near(s5.fr.z,[1,0,0],1e-3),'⟂ spline symétrique t=0,5 : sommet, tangente X (vu '+s5.fr.o.join(', ')+' / '+s5.fr.z.join(', ')+')');
      att(s0.fr.z[0]>0.3&&s0.fr.z[1]>0.3,'⟂ spline t=0 : tangente montante');
      const sx=cgNew('plane','curve',[E('S')],{t:1.5});
      att(sx.st==='warn'&&/hors/.test(sx.msg)&&near(sx.fr.o,[40,0,0]),'ratio > 1 : ramené au bout, signalé');
      const sNo=cgNew('plane','curve',[O('X')]);
      att(sNo.st==='warn'&&/courbe/.test(sNo.msg),'axe infini refusé comme courbe ('+sNo.msg+')');
      skq.points.s2.y=30;cgResolveAll();
      att(near(s5.fr.o,[20,30,0],1e-3),'⟂ spline : suit le point de passage modifié');
      const skOn={id:'skon',name:'Sur',plane:'CG',cg:{id:l5.id},entities:[{id:'M',t:'line',p1:'a',p2:'b'}],points:{a:{x:0,y:0},b:{x:5,y:0}},constraints:[],dims:[],seq:1,visible:true};
      doc.sketches.push(skOn);const keep=JSON.stringify(l5.fr);l5.refs=[{k:'skent',sk:'skon',e:'M'}];cgResolveAll();
      att(l5.st==='warn'&&JSON.stringify(l5.fr)===keep,'courbe d une esquisse posée sur ce plan : refusée (boucle)');
      l5.refs=[E('L')];doc.sketches=doc.sketches.filter(s=>s!==skOn&&s!==skq);
      doc.cgeo=doc.cgeo.filter(c=>![l0,l5,l1,lf,am,a1,s0,s5,s1,sx,sNo].includes(c));
    }
    // ── axes ──
    const x1=cgNew('axis','inter',[C(p3.id),O('XZ')]);
    V(x1.fr.z,[1,0,0],'axe intersection plan 30° / XZ : direction');
    V(x1.fr.o,[0,0,0],'axe intersection : sur la droite commune');
    const x2=cgNew('axis','2pts',[C(a.id),C(b.id)]);
    V(x2.fr.z,[-S2,S2,0],'axe 2 points : direction');
    const x3=cgNew('axis','normal',[C(p2.id),C(a.id)]);
    V(x3.fr.o,[10,0,20],'axe normal au plan Z=20 par (10,0,0) : pied');V(x3.fr.z,[0,0,1],'axe normal : direction');
    const x4=cgNew('axis','ref',[O('Z')],{flip:true});
    V(x4.fr.z,[0,0,-1],'axe sur Z inversé');
    const xPar=cgNew('axis','inter',[O('XY'),C(p2.id)]);
    att(xPar.st==='warn'&&/parallèles/.test(xPar.msg),'intersection de plans parallèles refusée');
    // ── points ──
    const q1=cgNew('point','inter',[C(x2.id),C(p7.id)]);
    V(q1.fr.o,[10,0,0],'point axe ∩ plan');
    const qPar=cgNew('point','inter',[O('X'),O('XY')]);
    att(qPar.st==='warn','axe contenu dans le plan : pas de point unique');
    // ── repères ──
    const f1=cgNew('frame','zx',[C(a.id),O('Y'),{k:'cg',id:x2.id}]);
    V(f1.fr.o,[10,0,0],'repère : origine');V(f1.fr.z,[0,1,0],'repère : Z');V(f1.fr.x,[-1,0,0],'repère : X projeté ⟂ Z');
    V(f1.fr.y,cgCross(f1.fr.z,f1.fr.x),'repère direct');
    const f2=cgNew('frame','face',[C(p2.id)],{dx:5,rz:90});
    V(f2.fr.o,[0,5,20],'repère sur plan, rz=90 puis dx=5');V(f2.fr.x,[0,1,0],'repère rz=90 : X');
    const f3=cgNew('frame','3pts',[O('O'),C(a.id),C(b.id)]);
    V(f3.fr.z,[0,0,1],'repère 3 points : Z');
    const fPar=cgNew('frame','zx',[O('O'),O('Z'),O('Z')]);
    att(fPar.st==='warn'&&/X parallèle/.test(fPar.msg),'repère X ∥ Z : X remplacé, signalé');
    const q2=cgNew('point','xyz',[C(f2.id)],{dx:1,dy:2,dz:3});
    V(q2.fr.o,[-2,6,23],'point dans un repère');
    const pf=cgNew('plane','offset',[C(f2.id,'XZ')],{d:1});
    V(pf.fr.z,[1,0,0],'plan XZ d un repère tourné : normale = -Y du repère');
    // ── esquisse posée sur un plan de construction ──
    const sk={id:'skc',name:'Esq',plane:'CG',cg:{id:p2.id},entities:[],points:{},constraints:[],dims:[],seq:1,visible:true,origin:[0,0,0]};
    doc.sketches.push(sk);
    att(cgResolveAll()===true,'résolution : l esquisse reçoit sa base');
    V(sk.origin,[0,0,20],'esquisse sur plan : origine');V(sk.axN,[0,0,1],'esquisse : normale');
    const B=sketchBasis(sk);
    att(Math.abs(B.o.z-20)<1e-9&&Math.abs(B.n.z-1)<1e-9,'sketchBasis suit le plan de construction');
    att(cgResolveAll()===false,'seconde résolution : rien ne bouge (stable)');
    // chaîne : on modifie le plan de base → le plan dérivé et l'esquisse suivent
    p1.p.d=25;cgResolveAll();
    V(p2.fr.o,[0,0,30],'chaîne : plan dérivé suit');V(sk.origin,[0,0,30],'chaîne : esquisse suit');
    // ── ƒx ──
    doc.params=[{name:'ep',expr:'8',value:8}];
    att(parFxSet(p1.p,'d','ep*2').ok===true,'ƒx accepté sur la distance');
    parResolve();cgResolveAll();
    att(Math.abs(p1.p.d-16)<1e-9,'ƒx : d = ep*2 = 16 (vu '+p1.p.d+')');
    V(p1.fr.o,[0,0,16],'ƒx : le plan suit le paramètre');
    doc.params[0].expr='10';parResolve();cgResolveAll();
    V(p1.fr.o,[0,0,20],'ƒx : paramètre changé, plan suit');
    // ── empreinte, sauvegarde, ouverture ──
    const h1=docHash();p1.p.d=21;_docVersion++;const h2=docHash();
    att(h1!==h2,'docHash change avec la distance');
    ensureBodies();doc.sketches.forEach(migrateSketch);cgResolveAll();const js=serialise(); // normalisé comme à l'ouverture
    att(js.indexOf('"cgeo"')>=0,'serialise : cgeo écrit');
    att(js.indexOf('_fxDirty')<0,'serialise : pas de transitoire');
    const n0=doc.cgeo.length;
    await deserialise(js,{rebuild:false});
    att(doc.cgeo.length===n0,'deserialise : '+n0+' éléments relus (vu '+doc.cgeo.length+')');
    const sk2=doc.sketches.find(s=>s.id==='skc');
    att(sk2&&sk2.plane==='CG'&&sk2.cg&&sk2.cg.id===p2.id,'deserialise : esquisse toujours sur le plan');
    att(serialise()===js,'aller-retour serialise → deserialise → serialise identique');
    // ancien document sans cgeo
    await deserialise(JSON.stringify({app:"MiniFusion",v:1,name:"Vieux",sketches:[],features:[]}),{rebuild:false});
    att(Array.isArray(doc.cgeo)&&doc.cgeo.length===0,'ancien fichier : cgeo = []');
    const hv=docHash();doc.cgeo=[];att(docHash()===hv,'empreinte d un document sans construction inchangée');
    // ── annuler / rétablir ──
    docResetEmpty();docUndoStack.length=0;docRedoStack.length=0;
    const u1=cgNew('plane','offset',[O('XZ')],{d:7});
    att(doc.cgeo.length===1,'création');
    att(docUndo()===true&&doc.cgeo.length===0,'annuler la création');
    att(docRedo()===true&&doc.cgeo.length===1&&doc.cgeo[0].id===u1.id,'rétablir la création');
    // ── suppression ──
    const base=doc.cgeo[0];
    const dep=cgNew('plane','offset',[C(base.id)],{d:3});
    const skd={id:'skd',name:'Esq D',plane:'CG',cg:{id:base.id},entities:[],points:{},constraints:[],dims:[],seq:1,visible:true,origin:[0,0,0]};
    doc.sketches.push(skd);cgResolveAll();
    const keepO=skd.origin.slice(),keepFr=JSON.stringify(dep.fr);
    const us=cgUsers(base.id);
    att(us.sks.length===1&&us.cgs.length===1,'cgUsers : 1 esquisse + 1 élément');
    att(cgDelete(base.id)===true,'suppression');
    att(skd.plane==='FACE'&&!skd.cg&&near(skd.origin,keepO),'esquisse détachée, laissée à sa place');
    cgResolveAll();
    att(dep.st==='warn'&&/supprimée/.test(dep.msg),'élément dépendant ⚠ ('+dep.msg+')');
    att(JSON.stringify(dep.fr)===keepFr,'élément dépendant figé sur sa dernière position');
    // ── timeline : ancrage, marqueur, fonction supprimée ──
    docResetEmpty();
    doc.features=[{id:'e1',type:'extrude',name:'E1',body:'b1'},{id:'e2',type:'extrude',name:'E2',body:'b1'},{id:'e3',type:'extrude',name:'E3',body:'b1'}];
    const t1=cgNew('plane','offset',[O('XY')],{d:1});
    att(t1.at==='e3','sans marqueur : après la dernière fonction (vu '+t1.at+')');
    tlSetPtr(doc.features[1]); // temps bloqué avant E2
    const t2=cgNew('plane','offset',[O('XY')],{d:2});
    att(t2.at==='e1','marqueur avant E2 : élément après E1 (vu '+t2.at+')');
    att(cgLocked(t1)===true&&cgLocked(t2)===false,'marqueur : t1 masqué, t2 actif');
    tlSetPtr(null);
    att(cgUpto(t2)===1&&cgUpto(t1)===3,'upto : fonctions visibles rejouées avant (vu '+cgUpto(t2)+','+cgUpto(t1)+')');
    cgResolveAll();
    delFeature(doc.features.find(f=>f.id==='e3'));
    cgResolveAll();
    att(t1.at==='e2','fonction d ancrage supprimée : raccroché à la précédente (vu '+t1.at+')');
    if(ATT.length){p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  x '+m));}
    else p('TOUT EST CONFORME');
    return P.join(String.fromCharCode(10));
  `;
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'construction.js'});
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,800));process.exit(1);});
