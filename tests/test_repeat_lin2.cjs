// Répétition linéaire à DEUX directions (grille), noyau OCCT réel.
// Plaque 100 × 100 × 10, un perçage Ø6 traversant en (10, 10). Répétition : 3 le long de X au pas
// de 20, puis 2ᵉ direction le long de Y : 2 au pas de 25 → 6 perçages. Contrôles : instances,
// positions des esquisses copiées, volume exact (calcul à la main), modification de la 2ᵉ quantité
// (→ 9), de l'axe (2ᵉ direction le long de Z : perçages hors plaque → retour à 3), suppression de la
// 2ᵉ direction (→ 3), relecture du fichier, nom « Linéaire 2 directions ».
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
    const base=id=>({id,name:id,plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],constraints:[],dims:[],seq:20,visible:false});
    docResetEmpty();doc.name='Banc';
    doc.sketches=[Object.assign(base('skA'),{points:{a:{x:0,y:0},b:{x:100,y:0},c:{x:100,y:100},d:{x:0,y:100}},
      entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}]}),
      Object.assign(base('skH'),{origin:[0,0,10],points:{p:{x:10,y:10}},entities:[{id:'c1',t:'circle',pc:'p',r:3}]})];
    doc.bodies=[{id:'b1',name:'Plaque',c:null}];doc.bodySeq=2;doc.activeBody='b1';
    doc.features=[{id:'F1',type:'extrude',name:'Plaque',sketchId:'skA',distance:10,op:'add',visible:true,body:'b1'},
                  {id:'F2',type:'extrude',name:'Perçage',sketchId:'skH',distance:-10,op:'cut',visible:true,body:'b1'}];
    ensureBodies();markDirty();rebuild();
    const vol=()=>{let FR=null,v=0;try{FR=occFinalShape(null);(FR.perBody||[]).forEach(pb=>{if(pb&&pb.shape)v+=occCoqueVolume(pb.shape);});}catch(e){}try{occCleanup(FR,null);}catch(e){}return v;};
    const trou=Math.PI*9*10,plein=100*100*10;
    A(near(vol(),plein-trou,1e-3),'0 : plaque percée une fois — '+vol().toFixed(3));
    const rp={id:'rp1',type:'repeat',name:'',mode:'lin',copies:2,q:1,dist:20,axis:'X',base:['F2'],children:[],visible:true,
      lin2:true,axis2:'Y',copies2:1,dist2:25};
    rp.name=repTypeName(rp.mode,rp);
    doc.features.push(rp);repGenChildren(rp);markDirty();rebuild();
    const kids=()=>doc.features.filter(f=>f.repeatId==='rp1');
    A(kids().length===5,'1 : grille 3 × 2 → 5 instances (original exclu) : '+kids().length);
    const ctr=kids().map(k=>{const s=doc.sketches.find(x=>x.id===k.sketchId);return (s.origin[0]+10)+','+(s.origin[1]+10);}).sort();
    A(JSON.stringify(ctr)===JSON.stringify(['10,35','30,10','30,35','50,10','50,35']),'2 : centres des copies (30,10) (50,10) (10,35) (30,35) (50,35) — '+ctr.join(' '));
    A(near(vol(),plein-6*trou,1e-3),'3 : volume exact, 6 perçages — '+vol().toFixed(3)+' (à la main '+(plein-6*trou).toFixed(3)+')');
    A(rp.name==='Linéaire 2 directions','4 : nom « '+rp.name+' »');
    rp.copies2=2;repGenChildren(rp);markDirty();rebuild();
    A(kids().length===8&&near(vol(),plein-9*trou,1e-3),'5 : 2ᵉ quantité 3 → grille 3 × 3, 9 perçages ('+kids().length+' instances)');
    // 2ᵉ direction prise sur une ARÊTE (droite le long de −Y) : les rangées sortent de la plaque
    selFaces=[];selEdges=[{G:{kind:'line',u:{x:0,y:-1,z:0}}}];repUseFaceFor(rp,2);markDirty();rebuild();
    A(rp.axis2==='Face'&&JSON.stringify(rp.dir2)==='[0,-1,0]'&&near(vol(),plein-3*trou,1e-3),'5b : 2ᵉ direction depuis une arête (−Y) : seules les 3 copies de la 1ʳᵉ rangée restent dans la plaque');
    // ⇄ Inverser la 2ᵉ direction : les rangées reviennent dans la plaque
    repFlipDir(rp,2);
    A(Math.abs(rp.dir2[1]-1)<1e-12&&near(vol(),plein-9*trou,1e-3),'5b2 : ⇄ Inverser : 2ᵉ direction vers +Y, de nouveau 9 perçages');
        // axe d'un CERCLE sélectionné (axe +Y) : rangées de nouveau dans la plaque
    selEdges=[{G:{kind:'circle',axis:{x:0,y:1,z:0},closed:true}}];repUseFaceFor(rp,2);markDirty();rebuild();
    A(JSON.stringify(rp.dir2)==='[0,1,0]'&&near(vol(),plein-9*trou,1e-3),'5c : 2ᵉ direction depuis l’axe d’un cercle (+Y) : 9 perçages');
    selEdges=[];
    // relecture
    const s=docSnap();docResetEmpty();docApplySnap(s); // instantané JSON = contenu de la sauvegarde
    const rp2=doc.features.find(f=>f.id==='rp1');
    A(rp2&&rp2.lin2===true&&rp2.axis2==='Face'&&JSON.stringify(rp2.dir2)==='[0,1,0]'&&rp2.copies2===2&&rp2.dist2===25&&near(vol(),plein-9*trou,1e-3),'6 : document relu depuis son JSON : 2ᵉ direction gardée, 9 perçages');
    // suppression de la 2ᵉ direction
    delete rp2.lin2;rp2.name=repTypeName(rp2.mode,rp2);repGenChildren(rp2);markDirty();rebuild();
    A(doc.features.filter(f=>f.repeatId==='rp1').length===2&&near(vol(),plein-3*trou,1e-3)&&rp2.name==='Linéaire','7 : sans 2ᵉ direction : la ligne de 3 perçages seule, nom « Linéaire »');
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== Répétition linéaire : 2ᵉ direction (grille) ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
