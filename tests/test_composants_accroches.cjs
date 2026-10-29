// V0.7.2 : points d'accroche d'assemblage (48-assemblage-accroches.js), noyau OCCT réel.
// Socle 40×40×20 percé (Ø8 en (10,10)) et goupille Ø10×30, convertis en composants.
// Contrôles : points d'une face plane (centre de surface, points cardinaux, centre du cercle
// du perçage), d'un cylindre (début, milieu, fin de l'axe) ; alignement de la goupille par le
// centre de sa face du bas sur le coin nord-est du dessus du socle, puis sur le centre du
// perçage ; le socle change (60×60, puis 25 de haut) : la goupille suit ; la face disparaît :
// ⚠ et position mémorisée ; la référence survit à l'enregistrement.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};confirm=function(){return true;};',ctx);
  const R=String.raw`
    const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};
    const near=(a,b,t)=>Math.abs(a-b)<(t||1e-6);const nearV=(a,b,t)=>a&&b&&[0,1,2].every(i=>near(a[i],b[i],t));
    const f3=v=>'('+v.map(x=>(+x).toFixed(3)).join(', ')+')';
    const base=(id)=>({id,name:id,plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],constraints:[],dims:[],seq:20,visible:false});
    const sq=(id,x0,y0,x1,y1)=>Object.assign(base(id),{points:{a:{x:x0,y:y0},b:{x:x1,y:y0},c:{x:x1,y:y1},d:{x:x0,y:y1}},
      entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}]});
    const ci=(id,x,y,r)=>Object.assign(base(id),{points:{p:{x,y}},entities:[{id:'c1',t:'circle',pc:'p',r}]});
    docResetEmpty();doc.name='Banc';
    doc.sketches=[sq('skA',-20,-20,20,20),ci('skH',10,10,4),ci('skP',60,0,5)];
    doc.bodies=[{id:'b1',name:'Socle',c:null},{id:'b2',name:'Goupille',c:null}];doc.bodySeq=3;doc.activeBody='b1';
    doc.features=[{id:'F1',type:'extrude',name:'Socle',sketchId:'skA',distance:20,op:'add',visible:true,body:'b1'},
                  {id:'F2',type:'extrude',name:'Perçage',sketchId:'skH',distance:20,op:'cut',visible:true,body:'b1'},
                  {id:'F3',type:'extrude',name:'Goupille',sketchId:'skP',distance:30,op:'add',visible:true,body:'b2'}];
    ensureBodies();markDirty();rebuild();
    const res=asmCompsFromBodies(['b1','b2']);markDirty();rebuild();asmBuildSnapshots();
    const S=res.made[0].comp,P=res.made[1].comp,oS=res.made[0].occ||S&&asmCompOccs(S.id)[0],oP=asmCompOccs(P.id)[0];
    A(S&&P&&oP,'0 : deux composants, Socle et Goupille');
    // ── 1. points d'une face plane ──
    const GS=asmSnapGeomOf(S);
    A(GS&&GS.faces.length>=7,'1 : faces d’accroche du socle : '+(GS?GS.faces.length:0)+' (6 planes + le perçage)');
    const top=GS.faces.find(F=>F.k==='plane'&&nearV(F.n,[0,0,1],1e-9));
    A(!!top,'2 : face du dessus trouvée (normale +Z)');
    const it=asmSnapItems(top),byW=w=>it.filter(q=>q.w===w&&!q.e);
    const holeA=16*Math.PI,cx=-(holeA*10)/(1600-holeA);
    A(nearV(byW('c')[0].fr.o,[cx,cx,20],1e-6),'3 : centre de surface (perçage déduit) '+f3(byW('c')[0].fr.o)+' — à la main ('+cx.toFixed(4)+', '+cx.toFixed(4)+', 20)');
    const card=['n','s','e','o','ne','no','se','so'].map(w=>byW(w)[0].fr.o);
    const want=[[0,20],[0,-20],[20,0],[-20,0],[20,20],[-20,20],[20,-20],[-20,-20]];
    A(want.every(([x,y])=>card.some(p=>nearV(p,[x,y,20],1e-6))),'4 : 8 points cardinaux : milieux des côtés et coins du dessus');
    A(it.every(q=>nearV(q.fr.z,[0,0,1],1e-9)),'5 : Z de chaque point = normale de la face');
    const hole=it.find(q=>q.w==='ec');
    A(hole&&nearV(hole.fr.o,[10,10,20],1e-6)&&/centre du cercle Ø8/.test(hole.name),'6 : centre du cercle du perçage '+(hole?f3(hole.fr.o)+' « '+hole.name+' »':'absent'));
    // ── 2. cylindre ──
    const cyl=GS.faces.find(F=>F.k==='cyl');
    const ci2=cyl&&asmSnapItems(cyl).filter(q=>!q.e);
    A(cyl&&near(cyl.r,4)&&ci2.length===3&&[0,10,20].every(z=>ci2.some(q=>nearV(q.fr.o,[10,10,z],1e-6))),'7 : perçage : début, milieu, fin de l’axe en (10,10, 0 / 10 / 20)');
    const GP=asmSnapGeomOf(P),bot=GP.faces.find(F=>F.k==='plane'&&nearV(F.n,[0,0,-1],1e-9)),pc=GP.faces.find(F=>F.k==='cyl');
    A(bot&&nearV(asmSnapItems(bot)[0].fr.o,[60,0,0],1e-6)&&pc&&near(pc.r,5),'8 : goupille : face du bas centrée (60,0,0), cylindre R5');
    // ── 3. aligner la goupille : centre du bas → coin nord-est du dessus ──
    const ne=byW('ne')[0];
    const src={path:[],cg:null,sn:asmSnapRef(bot,asmSnapItems(bot)[0])},dst={path:[oS.id],cg:null,sn:asmSnapRef(top,ne)};
    oP.align={src,dst,flip:true,rz:0,off:[0,0,0]};asmResolve();
    const at=(o,p)=>{const F=o.fr;return [0,1,2].map(i=>F.o[i]+F.x[i]*p[0]+F.y[i]*p[1]+F.z[i]*p[2]);};
    A(nearV(at(oP,[60,0,0]),ne.fr.o,1e-6)&&nearV(at(oP,[60,0,30]),[ne.fr.o[0],ne.fr.o[1],50],1e-6),'9 : goupille posée sur le coin '+f3(ne.fr.o)+', debout (haut en z = 50)');
    A(oP.st==='ok','10 : alignement sans ⚠');
    // sur le centre du perçage
    oP.align.dst={path:[oS.id],cg:null,sn:asmSnapRef(top,hole)};asmResolve();
    A(nearV(at(oP,[60,0,0]),[10,10,20],1e-6),'11 : … puis sur le centre du perçage (10,10,20)');
    oP.align.dst={path:[oS.id],cg:null,sn:asmSnapRef(top,ne)};asmResolve();
    // ── 4. le socle change : la goupille suit ──
    const editS=fn=>{asmActivate(S.id);fn(doc);markDirty();rebuild();asmActivate(asm.root);asmBuildSnapshots();};
    editS(d=>{const k=d.sketches.find(s=>s.id==='skA');Object.assign(k.points,{a:{x:-30,y:-30},b:{x:30,y:-30},c:{x:30,y:30},d:{x:-30,y:30}});});
    const r1=asmSnapSync();
    const q1=at(oP,[60,0,0]);
    A(r1===2&&nearV(q1.map(Math.abs),[30,30,20],1e-6),'12 : socle 60×60 : la goupille suit le coin '+f3(q1)+' (sync '+r1+')');
    editS(d=>{d.features.find(f=>f.id==='F1').distance=25;});
    asmSnapSync();
    A(near(at(oP,[60,0,0])[2],25,1e-6)&&near(at(oP,[60,0,30])[2],55,1e-6),'13 : socle de 25 de haut : la goupille remonte (bas z = 25)');
    A(asmSnapSync()===0,'14 : rien n’a changé : aucune relecture');
    // ── 5. enregistrement ──
    const back=asmAlignNorm(JSON.parse(JSON.stringify(oP.align)));
    A(back&&back.dst.sn&&back.dst.sn.w==='ne'&&back.src.sn.w==='c'&&nearV(back.dst.sn.fr.o,oP.align.dst.sn.fr.o,1e-9),'15 : la référence survit à l’enregistrement (w, signature, dernier repère)');
    A(asmRelName(asm.active,oP.align.dst).includes('Face plane · nord-est'),'16 : nom lisible : « '+asmRelName(asm.active,oP.align.dst)+' »');
    // ── 6. la face disparaît ──
    const fr0=JSON.stringify(oP.fr);
    editS(d=>{d.features.find(f=>f.id==='F1').visible=false;d.features.find(f=>f.id==='F2').visible=false;});
    asmSnapSync();
    A(oP.st==='warn'&&/point d’accroche introuvable/.test(oP.msg)&&JSON.stringify(oP.fr)===fr0,'17 : face disparue : ⚠ « '+oP.msg+' », position mémorisée');
    editS(d=>{d.features.find(f=>f.id==='F1').visible=true;d.features.find(f=>f.id==='F2').visible=true;});
    asmSnapSync();
    A(oP.st==='ok'&&near(at(oP,[60,0,0])[2],25,1e-6),'18 : face revenue : alignement rétabli');
    // ── 7. V0.21.12 : perçage Ø8 déplacé au-delà d'un Ø10 voisin : la goupille suit le Ø8 ──
    editS(d=>{d.sketches.push(ci('skQ',0,10,5));d.features.push({id:'F4',type:'extrude',name:'Trou Ø10',sketchId:'skQ',distance:25,op:'cut',visible:true,body:'b1'});});
    asmSnapSync();
    const GS2=asmSnapGeomOf(S),c8=GS2.faces.find(F=>F.k==='cyl'&&near(F.r,4));
    oP.align={src,dst:{path:[oS.id],cg:null,sn:asmSnapRef(c8,asmSnapItems(c8).find(q=>q.w==='a1'))},flip:true,rz:0,off:[0,0,0]};asmResolve();
    A(nearV(at(oP,[60,0,0]),[10,10,20],1e-6),'19 : goupille sur la fin de l’axe du Ø8 (10,10,20)');
    editS(d=>{const k=d.sketches.find(s=>s.id==='skH');k.points.p={x:-20,y:-20};});
    asmSnapSync();
    A(nearV(at(oP,[60,0,0]),[-20,-20,20],1e-6)&&/Ø8/.test(oP.align.dst.sn.name),'20 : Ø8 déplacé en (-20,-20), le Ø10 plus proche : la goupille suit le Ø8 '+f3(at(oP,[60,0,0]))+' « '+oP.align.dst.sn.name+' »');
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== V0.7.2 : points d accroche d assemblage ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
