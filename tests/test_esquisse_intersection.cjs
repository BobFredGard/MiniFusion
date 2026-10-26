// 2026-10-26 : esquisse — outil ⨯ Intersection (Créer > Projeter/Inclure > Intersection, façon
// Fusion) : courbes d'intersection entre le plan d'esquisse et des FACES choisies ou un CORPS
// entier, en entités de référence qui suivent le modèle au rejeu.
// Harnais : noyau OCCT RÉEL (wasm) + vrai rejeu de la timeline :
//   E1 = bloc 100×60×40 (esquisse XY), C1 = trou Ø20 traversant centré (50,30).
// Valeurs calculées à la main :
//  • plan médian z=20 : rectangle 100×60 (périmètre 320) + cercle R10 (centre 50,30) ;
//  • plan vertical y=30 (axe du trou) : deux rectangles 40×40 → 8 lignes, longueur totale 320 ;
//  • bloc élargi à 120 : rectangle 120×60 → périmètre 360 ; plan y=30 avec E1=50 : rectangles
//    40×50 (x 0→40) et 60×50 (x 60→120) → 2×(40+50)+2×(60+50)=400.
// Couvre : candidats et faces d'origine, clic = face seule, Maj+clic = corps entier, Ctrl+clic
// + Entrée = plusieurs faces, une étape d'annulation, points partagés (contour fermé) et fixés,
// noms « Intersection N », suivi après modification de cote (corps ET faces), arbre, menu,
// raccourci I, repli maillage sans noyau.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
let ko=0;
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};window.confirm=function(){return true;};',ctx);
  console.log('=== esquisse : outil ⨯ Intersection (faces / corps ∩ plan) ===');
  const body=`
    const out={fails:[],log:[]};
    const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};
    const near=(a,b,t)=>Math.abs(a-b)<=(t||1e-3);
    const mkSk=(id,name,plane,o,u,v,n)=>{const sk={id,name,plane,origin:o,axU:u,axV:v,axN:n,points:{},entities:[],constraints:[],dims:[],seq:1,visible:true};ensureSketchBasis(sk);return sk;};
    const rect=(sk,x0,y0,x1,y1)=>{[['p0',x0,y0,'e0','p1'],['p1',x1,y0,'e1','p2'],['p2',x1,y1,'e2','p3'],['p3',x0,y1,'e3','p0']].forEach(l=>{sk.points[l[0]]={x:l[1],y:l[2]};sk.entities.push({id:l[3],t:'line',p1:l[0],p2:l[4]});});sk.seq=20;};
    const sk1=mkSk('sk1','Bloc','XY',[0,0,0],[1,0,0],[0,1,0],[0,0,1]);rect(sk1,0,0,100,60);
    const sk2=mkSk('sk2','Trou','XY',[0,0,0],[1,0,0],[0,1,0],[0,0,1]);
    sk2.points.c={x:50,y:30};sk2.entities.push({id:'ec',t:'circle',pc:'c',r:10});sk2.seq=20;
    // esquisses de travail : plan médian z=20 et plan vertical y=30 (normale -Y : u=X, v=Z)
    const skM=mkSk('skM','Médian','FACE',[0,0,20],[1,0,0],[0,1,0],[0,0,1]);
    const skV=mkSk('skV','Vertical','FACE',[0,30,0],[1,0,0],[0,0,1],[0,-1,0]);
    doc.sketches=[sk1,sk2,skM,skV];
    doc.features=[{id:'E1',type:'extrude',name:'Bloc',sketchId:'sk1',op:'add',distance:40},
                  {id:'C1',type:'extrude',name:'Trou',sketchId:'sk2',op:'cut',distance:40,through:true}];
    doc.bodies=[];doc.bodySeq=1;delete doc.activeBody;doc.entNames={};
    occSkipFeat=null;tlMark=null;markDirty();rebuild();
    A(!!(occLive&&occLive.shape),'solide exact produit par le rejeu (bloc percé)');
    const iso=sk=>(sk.entities||[]).filter(e=>e.isect);
    const lenOf=(sk,e)=>{const P=sk.points;if(e.t==='line')return Math.hypot(P[e.p2].x-P[e.p1].x,P[e.p2].y-P[e.p1].y);if(e.t==='circle')return 2*Math.PI*e.r;return 0;};
    const tot=(sk,L)=>L.reduce((s,e)=>s+lenOf(sk,e),0);

    // ── 1. outil, candidats, faces d'origine ──
    openSketch('skM');
    const btn=(document.getElementById('skToolbar').children||[]).find(b=>b.dataset&&b.dataset.tool==='isect');
    A(!!btn,'bouton ⨯ Intersection présent dans la barre d esquisse');
    if(btn)btn.onclick();
    A(skTool==='isect','clic sur le bouton : outil isect actif');
    const C=skIsectCandidates(skM);
    const nL=C.filter(c=>c.type==='line').length,nC=C.filter(c=>c.type==='circle').length;
    A(nL===4&&nC===1,'candidats du plan médian : 4 lignes + 1 cercle ('+nL+'+'+nC+')');
    A(new Set(C.map(c=>c.fk)).size===5,'chaque courbe connaît SA face d origine (5 faces distinctes)');
    const cc=C.find(c=>c.type==='circle');
    A(cc&&near(cc.r,10)&&near(cc.cx,50)&&near(cc.cy,30),'cercle exact R10 en (50,30) : '+(cc?[cc.cx,cc.cy,cc.r].map(v=>v.toFixed(4)):'-'));
    A(near(C.filter(c=>c.type==='line').reduce((s,c)=>s+Math.hypot(c.x2-c.x1,c.y2-c.y1),0),320),'périmètre du rectangle de section = 320');

    // ── 2. clic simple sur le cercle = la face du trou seule (une étape d annulation) ──
    const u0=skUndoStack.length;
    skIsectClickAt(skM,60,30,{});
    let L=iso(skM);
    A(L.length===1&&L[0].t==='circle'&&near(L[0].r,10),'clic sur le trou : 1 cercle R10 ('+L.length+' entité)');
    A(L[0]&&L[0].construction===true&&L[0].proj===true&&L[0].isect.mode==='faces'&&L[0].isect.faces.length===2,'cercle en construction, référence (proj) ; source = les 2 demi-faces du trou (couture du cylindre) : '+(L[0]&&L[0].isect.faces.length));
    A(L[0]&&/^Intersection \\d+$/.test(L[0].projName||''),'nom persistant « '+(L[0]&&L[0].projName)+' »');
    A(skUndoStack.length===u0+1,'une seule étape d annulation');
    skUndoTrans();
    A(iso(skM).length===0,'Annuler : le cercle disparaît');
    skRedoTrans();
    A(iso(skM).length===1,'Rétablir : il revient');
    skUndoTrans();

    // ── 3. Maj+clic = corps entier : rectangle + cercle, contour fermé et fixé ──
    skIsectClickAt(skM,50,0,{shiftKey:true});
    L=iso(skM);
    const Ll=L.filter(e=>e.t==='line'),Lc=L.filter(e=>e.t==='circle');
    A(Ll.length===4&&Lc.length===1,'Maj+clic : corps entier = 4 lignes + 1 cercle ('+Ll.length+'+'+Lc.length+')');
    A(near(tot(skM,Ll),320),'longueur des 4 lignes = 320 ('+tot(skM,Ll).toFixed(4)+')');
    A(Lc[0]&&near(lenOf(skM,Lc[0]),20*Math.PI),'cercle : circonférence 20π');
    const pids=new Set();Ll.forEach(e=>{pids.add(e.p1);pids.add(e.p2);});
    A(pids.size===4,'points PARTAGÉS aux coins (contour fermé) : '+pids.size+' points pour 4 lignes');
    const fx=new Set(skM.constraints.filter(c=>c.type==='fix'&&c.p).map(c=>c.p));
    A([...pids].every(p=>fx.has(p)),'tous les points sont fixés (comme une projection)');
    A(L.every(e=>e.isect.mode==='body'&&Array.isArray(e.isect.pt)),'source mémorisée : corps entier + point de repère');
    const names=new Set(L.map(e=>e.projName));
    A(names.size===L.length,'noms uniques ('+[...names].join(', ')+')');
    skUndoTrans();

    // ── 4. Ctrl+clic sur 2 faces puis Entrée ──
    skIsectClickAt(skM,0,30,{ctrlKey:true});
    skIsectClickAt(skM,50,0,{ctrlKey:true});
    A(skIsectSel.length===2&&iso(skM).length===0,'Ctrl+clic : 2 faces retenues, rien encore créé');
    skIsectClickAt(skM,0,30,{ctrlKey:true});skIsectClickAt(skM,0,30,{ctrlKey:true});
    A(skIsectSel.length===2,'Ctrl+clic de nouveau : retire puis remet la face');
    skIsectValidate(); // = touche Entrée (l'écouteur clavier de l'esquisse exige le DOM réel)
    L=iso(skM);
    const lens=L.map(e=>lenOf(skM,e)).sort((a,b)=>a-b);
    A(L.length===2&&near(lens[0],60)&&near(lens[1],100),'Entrée : 2 lignes de longueurs 60 et 100 ('+lens.map(v=>v.toFixed(3))+')');
    A(L.every(e=>e.isect.mode==='faces'&&e.isect.faces.length===2),'source : les 2 faces');
    const keepFaces=L.map(e=>e.id);

    // ── 5. plus le corps entier : on garde les deux sources pour le suivi ──
    skIsectApply(skM,{mode:'body',pt:[50,0,20]});
    A(iso(skM).length===7,'corps entier ajouté : 2 + 5 entités ('+iso(skM).length+')');
    closeSketch(true);

    // ── 6. plan vertical par l'axe du trou : deux rectangles ──
    openSketch('skV');
    skTool='isect';
    skIsectApply(skV,{mode:'body',pt:null});
    let V=iso(skV);
    A(V.length===8&&V.every(e=>e.t==='line'),'plan y=30 : 8 lignes (deux rectangles 40×40) ('+V.length+')');
    A(near(tot(skV,V),320),'longueur totale = 320 ('+tot(skV,V).toFixed(4)+')');
    const xs=V.map(e=>[skV.points[e.p1].x,skV.points[e.p2].x]).flat();
    A(xs.some(x=>near(x,40))&&xs.some(x=>near(x,60)),'les bords du trou (x=40 et x=60) coupent le bloc');
    closeSketch(true);

    // ── 7. suivi : bloc élargi à 120, puis hauteur 50 ──
    sk1.points.p1.x=120;sk1.points.p2.x=120;
    markDirty();rebuild();
    try{updateAllProjections();}catch(e){}
    L=iso(skM);
    const body=L.filter(e=>e.isect.mode==='body');
    const bl=body.filter(e=>e.t==='line');
    A(near(tot(skM,bl),360,1e-2),'suivi (corps) : bloc 120×60 → périmètre 360 ('+tot(skM,bl).toFixed(4)+')');
    const bc=body.find(e=>e.t==='circle');
    A(bc&&near(bc.r,10)&&near(skM.points[bc.pc].x,50),'le cercle du trou reste R10 en x=50');
    const fl=L.filter(e=>keepFaces.indexOf(e.id)>=0).map(e=>lenOf(skM,e)).sort((a,b)=>a-b);
    A(fl.length===2&&near(fl[0],60,1e-2)&&near(fl[1],120,1e-2),'suivi (faces) : la face y=0 mesure maintenant 120 ('+fl.map(v=>v.toFixed(3))+')');
    doc.features[0].distance=50;
    markDirty();rebuild();
    try{updateAllProjections();}catch(e){}
    V=iso(skV);
    A(near(tot(skV,V),2*(40+50)+2*(60+50),1e-2),'suivi (plan vertical) : bloc 120 × hauteur 50 → rectangles 40×50 et 60×50 = 400 ('+tot(skV,V).toFixed(4)+')');

    // ── 8. arbre : clic sur un corps pendant l'outil ──
    openSketch('skM');skTool='isect';
    const n0=iso(skM).length;
    const bd=bodies.find(b=>b.kind==='body');
    A(!!bd&&skIsectFromBody(bd.id)&&iso(skM).length===n0+5,'arbre : le corps cliqué donne ses 5 courbes');
    // ── 9. menu contextuel de l'outil ──
    skIsectHover=null;skIsectCtx(10,10);
    const m=document.getElementById('skCtxMenu');
    const txt=m?String(m.innerHTML||'')+[...(m.children||[])].map(c=>c.textContent||'').join('|'):'';
    A(/Tous les corps/.test(txt)&&/géométrie normale/.test(txt),'menu contextuel : « Tous les corps » + option géométrie normale');
    // ── 10. géométrie normale au choix ──
    skIsectReset();
    const fc=skIsectCandidates(skM).find(c=>c.type==='circle');
    skIsectReal=true;const nr=fc?skIsectApply(skM,{mode:'faces',faces:[fc.ref]}):0;
    A(nr===1&&iso(skM).slice(-1)[0].construction!==true,'option : courbes créées en géométrie NORMALE (profil)');
    skIsectReal=false;
    closeSketch(true);

    // ── 11. repli sans noyau : section du maillage, figée ──
    const _ready=occtReady;occtReady=false;
    openSketch('skM');skTool='isect';
    const grid=[];const tri=(a,b,c)=>grid.push(a,b,c);
    // tétraèdre de base z=0 et sommet z=40 : coupe à z=20 = triangle
    const P0=[0,0,0],P1=[40,0,0],P2=[0,40,0],P3=[0,0,40];
    tri(P0,P2,P1);tri(P0,P1,P3);tri(P1,P2,P3);tri(P2,P0,P3);
    const flat=grid.flat();
    const fake={geometry:{index:null,attributes:{position:{count:flat.length/3,getX:i=>flat[3*i],getY:i=>flat[3*i+1],getZ:i=>flat[3*i+2]}}},matrixWorld:{elements:[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]},updateMatrixWorld(){}};
    const _b=bodies;bodies=[{id:'m',kind:'body',mesh:fake}];
    skIsectReset();
    const MC=skIsectCandidates(skM);
    A(_isectCands.mesh===true&&MC.length===3,'sans noyau : section du maillage = 3 segments ('+MC.length+')');
    const n1=iso(skM).length;
    skIsectClickAt(skM,10,0,{});
    const ML=iso(skM).slice(n1);
    A(ML.length===3&&ML.every(e=>e.isect.mode==='mesh'),'clic : 3 lignes figées (mode maillage)');
    A(near(tot(skM,ML),20+20+Math.hypot(20,20),1e-3),'triangle 20/20/28,28 ('+tot(skM,ML).toFixed(4)+')');
    A(/MAILLAGE/.test(skMsg),'statut clair : « '+skMsg+' »');
    bodies=[];skIsectReset();
    skIsectCandidates(skM);skIsectHoverAt(skM,0,0,false);
    A(/aucun corps ne coupe/.test(skMsg),'ni noyau ni corps : message clair « '+skMsg+' »');
    bodies=_b;occtReady=_ready;
    closeSketch(false);
    return out;
  `;
  let o;
  try{o=await vm.runInContext('(async()=>{'+body+'})()',ctx);}
  catch(e){console.log('FATAL (harnais)',String((e&&e.stack)||e).slice(0,1200));process.exit(1);}
  o.log.forEach(m=>console.log('  ✓ '+m));
  if(o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));ko+=o.fails.length;}
  // raccourci I et libellé (sources)
  const rac=fs.readFileSync(path.join(ROOT,'src','99-raccourcis-esquisse.js'),'utf8');
  if(/i:'isect'/.test(rac))console.log('  ✓ raccourci I → outil Intersection');else{ko++;console.log('  ✗ raccourci I absent');}
  const tr=fs.readFileSync(path.join(ROOT,'src','60-trim-et-souris.js'),'utf8');
  if(/e\.key==='Enter'&&skEdit&&skTool==='isect'\)\{e\.preventDefault\(\);skIsectValidate\(\)/.test(tr))console.log('  ✓ Entrée valide les faces retenues');else{ko++;console.log('  ✗ Entrée non branchée');}
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,900));process.exit(1);});
