// V0.6.7 : mise en plan d'assemblage (48-composants-plan.js + 98-mise-en-plan.js), noyau OCCT réel.
// Socle + deux colonnes (deux occurrences du même composant) : vue « Assemblage » (corps des
// instances, solides exacts placés, sans activer de composant), HLR exact qui voit les trois
// solides, cache de la vue invalidé quand une occurrence bouge, nomenclature par composant
// (1er niveau / tous niveaux / pièces seules), bulles automatiques numérotées comme elle.
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
    const T=window.__mepTest;
    const sq=(id,x0,y0,x1,y1)=>({id,name:id,plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],
      points:{a:{x:x0,y:y0},b:{x:x1,y:y0},c:{x:x1,y:y1},d:{x:x0,y:y1}},
      entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],constraints:[],dims:[],seq:20,visible:false});
    docResetEmpty();doc.name='Banc';
    doc.sketches=[sq('skA',-20,-20,20,20),sq('skB',25,-5,35,5)];
    doc.bodies=[{id:'b1',name:'Socle',c:null},{id:'b2',name:'Colonne',c:null}];doc.bodySeq=3;doc.activeBody='b1';
    doc.features=[{id:'F1',type:'extrude',name:'Socle',sketchId:'skA',distance:20,op:'add',visible:true,body:'b1'},
                  {id:'F2',type:'extrude',name:'Colonne',sketchId:'skB',distance:50,op:'add',visible:true,body:'b2'}];
    ensureBodies();markDirty();rebuild();
    const res=asmCompsFromBodies(['b1','b2']);markDirty();rebuild();asmBuildSnapshots();
    const S=res.made[0].comp,C=res.made[1].comp;
    const oC2=asmAddOcc(C.id,{o:[-60,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]},asm.root);
    asmBuildSnapshots();
    A(asmPlanOn()&&asm.active===asm.root,'1 : racine active, avec des composants');
    // corps d'une vue « Assemblage »
    let acts=0;const keep=asmActivate;asmActivate=function(){acts++;return keep.apply(this,arguments);};
    const L=asmPlanBodies();asmActivate=keep;
    A(L.length===3&&L.every(b=>b.shape&&b.mesh),'2 : trois corps (socle, deux colonnes), solides exacts et maillages ('+L.length+')');
    A(acts===0,'3 : aucun composant activé (le PLAN resterait ouvert)');
    const vols=L.map(b=>occCoqueVolume(b.shape)).sort((a,b)=>a-b);
    A(near(vols[0],5000,0.5)&&near(vols[1],5000,0.5)&&near(vols[2],32000,0.5),'4 : volumes '+vols.map(v=>v.toFixed(0)).join(' / '));
    const xs=L.filter(b=>b.asmComp===C.id).map(b=>{let m=-1e9;occListEdges(b.shape).forEach(e=>e.pts.forEach(q=>{m=Math.max(m,q[0]);}));return m;}).sort((a,b)=>a-b);
    A(near(xs[0],-25,1e-6)&&near(xs[1],35,1e-6),'5 : colonnes placées par leur occurrence (X max -25 et 35)');
    A(asmPlanBodies()[0]===L[0],'6 : même assemblage : corps repris du cache');
    // la vue
    const sh=T.sheet();
    const v=T.addView({kind:'base',vk:'front',asm:true});
    A(T.meshesOf(v).length===3,'7 : vue « Assemblage » : trois corps');
    const g=window.__mepTest.geo(v);
    const xmax=Math.max(...g.els.filter(e=>e.t==='L').map(e=>Math.max(e.x1,e.x2)));
    const xmin=Math.min(...g.els.filter(e=>e.t==='L').map(e=>Math.min(e.x1,e.x2)));
    A(g.src==='OCCT HLR'&&near(xmax,35,1e-3)&&near(xmin,-35,1e-3),'8 : HLR exact sur les trois solides ('+g.src+', X '+xmin.toFixed(1)+' → '+xmax.toFixed(1)+')');
    const sig0=T.viewSig(v);oC2.fr={o:[-80,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]};
    A(T.viewSig(v)!==sig0,'9 : une occurrence bouge : la vue se recalcule');
    const g2=window.__mepTest.geo(v);
    A(near(Math.min(...g2.els.filter(e=>e.t==='L').map(e=>Math.min(e.x1,e.x2))),-55,1e-3),'10 : … et suit (X min -55)');
    const v0=T.addView({kind:'base',vk:'front'});
    A(T.meshesOf(v0).length===0,'11 : vue « Assemblée » de la racine : ses propres corps seulement (aucun)');
    // nomenclature
    sh.bom={on:true,mat:{},lvl:'comp1'};
    let rows=T.bomRows(sh);
    A(rows.length===2&&rows[0].name==='Socle'&&rows[0].qty===1&&rows[1].name==='Colonne'&&rows[1].qty===2,'12 : nomenclature 1er niveau : Socle ×1, Colonne ×2');
    A(rows[1].mat==='Acier','13 : matière par défaut ('+rows[1].mat+') — dimensions vérifiées au navigateur (maillages simulés ici)');
    C.doc.mat={name:'Aluminium',rho:2.7};
    A(T.bomRows(sh)[1].mat==='Aluminium','14 : matière du composant');
    sh.bom.mat[C.id]='EN AW-6082';
    A(T.bomRows(sh)[1].mat==='EN AW-6082','15 : matière saisie au plan prioritaire');
    // sous-composant : vis dans le socle → tous niveaux / pièces seules
    const vis=asmNewComp('Vis',S.id);
    sh.bom.lvl='all';rows=T.bomRows(sh);
    A(rows.length===3&&rows.some(r=>r.name==='Vis'&&r.qty===1),'16 : tous niveaux : la vis du socle apparaît');
    sh.bom.lvl='parts';rows=T.bomRows(sh);
    A(rows.length===2&&!rows.some(r=>r.name==='Socle'),'17 : pièces seules : le socle (qui a un sous-composant) n apparaît plus');
    sh.bom.lvl='comp1';
    // bulles
    A(T.balloonsAuto(sh)===2&&sh.balloons.every(b=>b.view===v.id),'18 : bulles automatiques sur la vue « Assemblage »');
    const txt=[];const mk=(tag,at)=>{const o={tag,at,textContent:''};if(tag==='text')txt.push(o);return o;};
    T.drawBalloons(mk,sh);
    A(txt.map(o=>o.textContent).sort().join()==='1,2','19 : bulles numérotées comme la nomenclature');
    sh.bom.lvl='parts';txt.length=0;T.drawBalloons(mk,sh);
    A(txt.map(o=>o.textContent).join()==='2','20 : pièces seules (Vis 1, Colonne 2) : la bulle du socle disparaît, celle de la colonne suit la nomenclature');
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== V0.6.7 : mise en plan d assemblage ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
