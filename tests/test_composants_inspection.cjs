// V0.6.6 : inspection (48-composants-inspection.js), noyau OCCT réel. Socle 40×40×20 (aluminium) et
// colonne 10×10×50 (acier) qui le traverse sur 5×10×20 : volumes, masses, centre de gravité,
// interférence de 1 000 mm³ ; colonne déplacée hors du socle : plus d'interférence ; pièce
// multicorps seule (sans composant) : interférence entre ses corps ; matière par composant.
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
    const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};const near=(a,b,t)=>Math.abs(a-b)<(t||1e-3);
    const sq=(id,x0,y0,x1,y1)=>({id,name:id,plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],
      points:{a:{x:x0,y:y0},b:{x:x1,y:y0},c:{x:x1,y:y1},d:{x:x0,y:y1}},
      entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],constraints:[],dims:[],seq:20,visible:false});
    const deux=()=>{
      docResetEmpty();doc.name='Banc';
      doc.sketches=[sq('skA',-20,-20,20,20),sq('skB',15,-5,25,5)];
      doc.bodies=[{id:'b1',name:'Socle',c:null},{id:'b2',name:'Colonne',c:null}];doc.bodySeq=3;doc.activeBody='b1';
      doc.features=[{id:'F1',type:'extrude',name:'Socle',sketchId:'skA',distance:20,op:'add',visible:true,body:'b1'},
                    {id:'F2',type:'extrude',name:'Colonne',sketchId:'skB',distance:50,op:'add',visible:true,body:'b2'}];
      ensureBodies();markDirty();rebuild();
    };
    // ── pièce multicorps seule ──
    deux();
    let r=asmInspectRun();
    A(r&&r.items.length===2&&near(r.items[0].v,32000,0.5)&&near(r.items[1].v,5000,0.5),'1 : pièce seule : deux corps ('+(r&&r.items.map(x=>x.v.toFixed(1)).join(' + '))+' mm³)');
    A(r.inter.length===1&&near(r.inter[0].v,1000,0.5),'2 : pièce seule : interférence entre ses corps ('+(r.inter[0]&&r.inter[0].v.toFixed(2))+' mm³)');
    asmInspectClear();
    // ── deux composants ──
    const res=asmCompsFromBodies(['b1','b2']);markDirty();rebuild();
    A(res.made.length===2,'3 : deux composants');
    const S=res.made[0].comp,C=res.made[1].comp;
    S.doc.mat={name:'Aluminium',rho:2.70};
    r=asmInspectRun();
    A(r.items.length===2&&asm.active===asm.root,'4 : inspection depuis la racine, retour à la racine');
    const iS=r.items.find(x=>x.comp===S.id),iC=r.items.find(x=>x.comp===C.id);
    A(near(iS.mass,86.4,1e-3)&&iS.mat==='Aluminium','5 : socle : 32 cm³ d aluminium = 86,4 g ('+iS.mass.toFixed(3)+')');
    A(near(iC.mass,39.25,1e-3)&&iC.mat==='Acier','6 : colonne : 5 cm³ d acier (matière par défaut) = 39,25 g ('+iC.mass.toFixed(3)+')');
    A(near(iS.c[2],10,1e-6)&&near(iC.c[0],20,1e-6)&&near(iC.c[2],25,1e-6),'7 : centres de gravité des corps');
    const M=86.4+39.25,cx=39.25*20/M,cz=(86.4*10+39.25*25)/M;
    A(near(r.total.mass,M,1e-3)&&near(r.com[0],cx,1e-4)&&near(r.com[2],cz,1e-4),'8 : total '+r.total.mass.toFixed(2)+' g, centre de gravité ('+r.com.map(v=>v.toFixed(3)).join(' ; ')+')');
    A(r.inter.length===1&&near(r.inter[0].v,1000,0.5)&&r.inter[0].geo,'9 : composants : interférence 1 000 mm³, affichable');
    A(S._exact&&C._exact,'10 : formes exactes gardées en cache');
    // deuxième passe : depuis le cache (aucune activation)
    let act=0;const keep=asmActivate;asmActivate=function(){act++;return keep.apply(this,arguments);};
    r=asmInspectRun();asmActivate=keep;
    A(act===0&&r.inter.length===1,'11 : relancée : formes en cache, aucun rejeu');
    // la colonne s'écarte : plus d'interférence, même masse
    const oC=asmRoot().occ.find(o=>o.comp===C.id);oC.fr={o:[100,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]};
    r=asmInspectRun();
    A(!r.inter.length&&near(r.total.mass,M,1e-3)&&near(r.items.find(x=>x.comp===C.id).c[0],120,1e-6),'12 : colonne déplacée : plus d interférence, centre de gravité suit');
    // deux occurrences de la colonne
    asmAddOcc(C.id,{o:[100,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]},asm.root);
    r=asmInspectRun();
    A(r.items.length===3&&r.inter.length===1&&near(r.inter[0].v,5000,0.5),'13 : deux colonnes superposées : interférence = toute la colonne (5 000 mm³)');
    asmInspectClear();
    A(asmInspect===null,'14 : fermé');
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== V0.6.6 : inspection ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
