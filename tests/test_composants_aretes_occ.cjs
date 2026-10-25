// V0.8.1 : arêtes des autres composants dans une esquisse, noyau OCCT réel. Socle 40×40×20 percé
// (Ø8 en (10,10)) et goupille Ø10, convertis en composants. Dans la goupille, une esquisse XY :
// Projeter propose les arêtes exactes du socle (capturées à la fin de son rejeu) ; le cercle du
// perçage se projette en cercle (Ø8, à la position du socle vue depuis la goupille) ; le socle
// se déplace, puis son perçage change de diamètre : le cercle projeté suit.
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
    const ATT=[],OK=[];const att=(ok,msg)=>{(ok?OK:ATT).push(msg);};
    const near=(a,b,t)=>Math.abs(a-b)<(t||1e-6);
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
    const S=res.made[0].comp,P=res.made[1].comp,oS=asmCompOccs(S.id)[0],oP=asmCompOccs(P.id)[0];
    att(S&&P&&oS&&oP,'0 : deux composants, Socle et Goupille');
    att(S._snap&&S._snap.pedges&&S._snap.pedges.length>=12,'1 : arêtes exactes du socle capturées ('+(S._snap&&S._snap.pedges?S._snap.pedges.length:0)+')');
    // goupille active, esquisse XY
    asmActivatePath(asmFirstPath(P.id));
    const sk=Object.assign(base('skG'),{name:'Sur la goupille',visible:true,points:{},entities:[]});
    doc.sketches.push(sk);markDirty();rebuild();
    const L=asmSkExtLists();
    att(L.length===1&&L[0].name===S.name,'2 : Projeter propose le socle (et pas la goupille elle-même)');
    // perçage du socle : (10,10) dans le socle, vu depuis la goupille
    const Ws=asmWorld(asmFirstPath(S.id)),Wp=asmWorld(asmFirstPath(P.id));
    const at=asmApply(asmCompose(asmInverse(Wp),Ws),[10,10,0]);
    skView.s=4;
    const pr=projectEdgeAt(sk,at[0]+4,at[1]);
    att(pr&&(pr.type==='circle'||pr.type==='arc')&&near(pr.r,4,1e-6)&&near(pr.cx,at[0],1e-6)&&near(pr.cy,at[1],1e-6)&&pr.ext,'3 : le perçage (deux demi-cercles dans OCCT) se projette en arc R4 au bon endroit, lié au socle ('+JSON.stringify(pr&&{t:pr.type,cx:pr.cx,cy:pr.cy,r:pr.r})+')');
    const c0=addPoint(sk,pr.cx,pr.cy);
    if(pr.type==='arc'){const a0=addPoint(sk,pr.x1,pr.y1),b0=addPoint(sk,pr.x2,pr.y2);
      sk.entities.push(Object.assign({id:'pc',t:'arc',pc:c0,pa:a0,pb:b0,r:pr.r,construction:true,proj:true},projNames(pr)));
      sk.constraints.push({id:'f1',type:'fix',p:c0},{id:'f2',type:'fix',p:a0},{id:'f3',type:'fix',p:b0});}
    else{sk.entities.push(Object.assign({id:'pc',t:'circle',pc:c0,r:pr.r,construction:true,proj:true},projNames(pr)));
      sk.constraints.push({id:'f1',type:'fix',p:c0});}
    markDirty();rebuild();
    const cur=()=>{const s=P.doc.sketches.find(x=>x.id==='skG'),e=s.entities.find(x=>x.id==='pc');return {x:s.points[e.pc].x,y:s.points[e.pc].y,r:e.r};};
    // le socle se déplace de 15 en X
    asmActivatePath([]);
    oS.fr={o:[oS.fr.o[0]+15,oS.fr.o[1],oS.fr.o[2]],x:oS.fr.x,y:oS.fr.y,z:oS.fr.z};
    att(asmExtStale().includes(P),'4 : socle déplacé : goupille signalée');
    asmExtSync();
    let c=cur();
    att(near(c.x,at[0]+15,1e-4)&&near(c.y,at[1],1e-4)&&near(c.r,4,1e-6),'5 : le cercle projeté suit le socle (+15 en X)');
    // le perçage passe à Ø12
    asmActivatePath(asmFirstPath(S.id));
    doc.sketches.find(s=>s.id==='skH').entities[0].r=6;markDirty();rebuild();
    asmActivatePath([]);asmExtSync();
    c=cur();
    att(near(c.r,6,1e-6)&&near(c.x,at[0]+15,1e-4),'6 : perçage Ø12 : le cercle projeté suit (R6)');
    att(asmExtStale().length===0,'7 : stable');
    return {ATT,OK};
  `;
  const o=await vm.runInContext('(async function(){'+R+'})()',ctx);
  console.log('=== V0.8.1 : arêtes d’un autre composant, noyau réel ===');
  o.OK.forEach(m=>console.log('  ✓ '+m));
  if(o.ATT.length){o.ATT.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.ATT.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
