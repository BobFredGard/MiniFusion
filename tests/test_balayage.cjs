// 2026-10-29 : BALAYAGE (src/75-balayage.js) sur le noyau OCCT réel.
// Profil fermé d'une esquisse poussé le long du chemin d'une autre esquisse. On mesure le
// VOLUME (BRepGProp) : un tube de section A le long d'un chemin de longueur L fait A·L
// (onglet aux coins vifs compris — mesuré au prototype : L 50+50, carré 10 → 10 000).
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  ✗ '+m);}else console.log('  ✓ '+m);};
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const body=[
    'const out={};let sn=0;',
    'const reset=()=>{doc.sketches=[];doc.features=[];occCkClear();};',
    // esquisse : base (u,v,n) + origine ; boucles de points (polygones) en coordonnées 2D
    'const mkSk=(u,v,n,o)=>{const sk={id:"sk"+(++sn),name:"S"+sn,plane:"FACE",origin:o||[0,0,0],',
    '  axU:u,axV:v,axN:n,points:{},entities:[],constraints:[],dims:[],visible:true};doc.sketches.push(sk);return sk;};',
    'let k=0;',
    'const poly=(sk,pts,closed)=>{const ids=pts.map(q=>{const id="q"+(++k);sk.points[id]={x:q[0],y:q[1]};return id;});',
    '  for(let i=0;i<ids.length-(closed?0:1);i++)sk.entities.push({id:"L"+(++k),t:"line",p1:ids[i],p2:ids[(i+1)%ids.length]});return ids;};',
    'const circ=(sk,x,y,r)=>{const id="c"+(++k);sk.points[id]={x,y};sk.entities.push({id:"C"+(++k),t:"circle",pc:id,r});};',
    'const XY=[[1,0,0],[0,1,0],[0,0,1]],YZ=[[0,1,0],[0,0,1],[1,0,0]],ZX=[[0,0,1],[1,0,0],[0,1,0]];',
    'const vol=s=>{const G=new occt.GProp_GProps_1();occt.BRepGProp.VolumeProperties_1(s,G,false,false,false);const m=G.Mass();G.delete();return m;};',
    'const run=f=>{try{const r=occShapeOfSweep(f);const o={vol:vol(r.shape),warn:r.warnings};occDispose(r.bins);try{r.shape.delete();}catch(e){}return o;}catch(e){return{err:String(e.message)};}};',
    'const sw=(p,c,op)=>({id:"sw"+(++k),type:"sweep",name:"",sketchId:p.id,pathId:c.id,op:op||"add",visible:true});',
    // 1) chemin en L à coin vif, profil carré 10×10 dans YZ au départ
    'reset();let pr=mkSk(...YZ);poly(pr,[[-5,-5],[5,-5],[5,5],[-5,5]],true);',
    'let ch=mkSk(...XY);poly(ch,[[0,0],[50,0],[50,50]],false);',
    'out.L=run(sw(pr,ch));out.nom=sweepName(sw(pr,ch));',
    // 1b) même chemin dessiné à l'envers : il démarre quand même au profil
    'ch.entities=[];poly(ch,[[50,50],[50,0],[0,0]],false);out.Linv=run(sw(pr,ch));',
    // 2) ligne + arc tangent R20 + ligne, profil cercle r3
    'reset();pr=mkSk(...YZ);circ(pr,0,0,3);',
    'ch=mkSk(...XY);ch.points.a={x:0,y:0};ch.points.b={x:30,y:0};ch.points.c={x:30,y:20};ch.points.d={x:50,y:20};ch.points.e={x:50,y:60};',
    'ch.entities.push({id:"l1",t:"line",p1:"a",p2:"b"},{id:"a1",t:"arc",pc:"c",r:20,pa:"b",pb:"d"},{id:"l2",t:"line",p1:"d",p2:"e"});',
    'out.arc=run(sw(pr,ch));out.arcCk=sweepCheck(sw(pr,ch));out.arcLen=out.arcCk.path&&out.arcCk.path.len;',
    // 3) chemin FERMÉ (carré 40), profil cercle r3
    'reset();pr=mkSk(...YZ);circ(pr,0,0,3);ch=mkSk(...XY);poly(ch,[[0,0],[40,0],[40,40],[0,40]],true);out.ferme=run(sw(pr,ch));',
    // 4) chemin = CERCLE R30 (anneau), profil cercle r3 sur ZX centré en (30,0,0)
    'reset();pr=mkSk(...ZX);circ(pr,0,30,3);ch=mkSk(...XY);circ(ch,0,0,30);out.anneau=run(sw(pr,ch));',
    // 5) profil TROUÉ (tube carré 10/6) le long d'une droite de 40
    'reset();pr=mkSk(...YZ);poly(pr,[[-5,-5],[5,-5],[5,5],[-5,5]],true);poly(pr,[[-3,-3],[3,-3],[3,3],[-3,3]],true);',
    'ch=mkSk(...XY);poly(ch,[[0,0],[40,0]],false);out.troue=run(sw(pr,ch));',
    // 5b) deux cercles CONCENTRIQUES r6 / r4 : tube creux
    'reset();pr=mkSk(...YZ);circ(pr,0,0,6);circ(pr,0,0,4);ch=mkSk(...XY);poly(ch,[[0,0],[40,0]],false);out.tube=run(sw(pr,ch));',
    // 6) refus : chemin ramifié, chemin dans le plan du profil, même esquisse, profil ouvert
    'reset();pr=mkSk(...YZ);circ(pr,0,0,3);ch=mkSk(...XY);poly(ch,[[0,0],[20,0],[40,0]],false);poly(ch,[[20,0],[20,30]],false);out.ramif=run(sw(pr,ch));',
    'reset();pr=mkSk(...XY);circ(pr,0,0,3);ch=mkSk(...XY);poly(ch,[[0,0],[40,0]],false);out.coplan=run(sw(pr,ch));',
    'out.meme=run(sw(pr,pr));',
    'reset();pr=mkSk(...YZ);poly(pr,[[-5,-5],[5,-5],[5,5]],false);ch=mkSk(...XY);poly(ch,[[0,0],[40,0]],false);out.ouvert=run(sw(pr,ch));',
    // 7) dans le document : bloc 60×60×20 puis RAINURE balayée (découpe) en L
    'reset();const bl=mkSk(...XY);poly(bl,[[-10,-10],[60,-10],[60,60],[-10,60]],true);',
    'doc.features.push({id:"exB",type:"extrude",name:"Bloc",sketchId:bl.id,distance:20,op:"add",visible:true,mid:false,upto:null});',
    'pr=mkSk(YZ[0],YZ[1],YZ[2],[0,0,20]);poly(pr,[[-2,-2],[2,-2],[2,2],[-2,2]],true);',
    'ch=mkSk(XY[0],XY[1],XY[2],[0,0,20]);poly(ch,[[0,0],[40,0],[40,40]],false);',
    'const fc=sw(pr,ch,"cut");fc.name=sweepName(fc);doc.features.push(fc);',
    'markDirty();rebuild();const FR=occFinalShape(null);out.doc={vol:FR.shape?vol(FR.shape):null,msgs:FR.msgs.slice(0,3)};if(FR.shape)occCleanup(FR,null);',
    'out.icone=featIconOf(fc);out.tl=JSON.stringify(tlbSvgKey({kind:"feature",o:fc}));',
    'out.hote=tlHostFeatureOfSketch(ch)===fc;out.coupe=occIsCutFeat(fc);',
    // 8) repli maillage
    'reset();pr=mkSk(...YZ);circ(pr,0,0,3);ch=mkSk(...XY);poly(ch,[[0,0],[40,0],[40,40]],false);',
    'try{const g=legacySweepGeos(sw(pr,ch),[]);out.maillage={n:g.length};}catch(e){out.maillage={err:String(e.message)};}',
    'return out;'
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx);
  const near=(a,b,t)=>a!=null&&Math.abs(a-b)<=(t||1e-3)*Math.max(1,Math.abs(b));
  const show=x=>x.err?'ERREUR '+x.err:x.vol.toFixed(1)+(x.warn&&x.warn.length?' ['+x.warn.join(' | ')+']':'');
  const pi=Math.PI;
  console.log('=== 2026-10-29 : balayage (noyau OCCT réel) ===');
  console.log('  L carré 10         : '+show(o.L)+' (attendu 10000)');
  A(near(o.L.vol,10000),'chemin en L à coin vif : onglet, volume = section × longueur (10 000)');
  A(near(o.Linv.vol,10000),'chemin dessiné à l’envers : il part quand même du profil');
  A(/Balayage S1 le long de S2/.test(o.nom),'nom : « '+o.nom+' »');
  const lenArc=30+pi*10+40;
  console.log('  ligne+arc+ligne r3 : '+show(o.arc)+' (attendu '+(pi*9*lenArc).toFixed(1)+')');
  A(near(o.arcLen,lenArc),'longueur du chemin ligne + arc + ligne : '+(o.arcLen||0).toFixed(2));
  A(near(o.arc.vol,pi*9*lenArc),'tube r3 le long de ligne + arc tangent + ligne : volume exact');
  console.log('  carré fermé r3     : '+show(o.ferme));
  A(near(o.ferme.vol,pi*9*160),'chemin FERMÉ (carré 40) : anneau carré, volume π·9·160');
  console.log('  anneau R30 r3      : '+show(o.anneau));
  A(near(o.anneau.vol,pi*9*2*pi*30),'chemin CERCLE R30 : tore r3, volume 2π²·R·r²');
  console.log('  tube carré troué   : '+show(o.troue));
  A(near(o.troue.vol,(100-36)*40),'profil TROUÉ : le trou suit le chemin (64 × 40)');
  console.log('  tube r6/r4         : '+show(o.tube));
  A(near(o.tube.vol,pi*20*40),'cercles CONCENTRIQUES : tube creux, volume π(36−16)·40');
  A(o.ramif.err&&/ramifie/.test(o.ramif.err),'chemin ramifié refusé : « '+o.ramif.err+' »');
  A(o.coplan.err&&/plan du profil/.test(o.coplan.err),'chemin dans le plan du profil refusé : « '+o.coplan.err+' »');
  A(o.meme.err&&/AUTRE/.test(o.meme.err),'profil et chemin dans la même esquisse refusés');
  A(o.ouvert.err&&/non fermé/.test(o.ouvert.err),'profil ouvert refusé : « '+o.ouvert.err+' »');
  console.log('  bloc − rainure     : '+(o.doc.vol!=null?o.doc.vol.toFixed(1):'—')+' '+JSON.stringify(o.doc.msgs));
  // section 4×4 centrée sur la face du dessus : seule la moitié basse (4×2) entame le bloc
  A(near(o.doc.vol,70*70*20-8*80,1e-3),'rainure balayée en découpe dans un bloc : 98 000 − 8 × 80 = '+(70*70*20-8*80));
  A(!o.doc.msgs.some(m=>/exclu/.test(m)),'rejeu exact sans exclusion');
  A(o.icone==='≋'&&/"sweep","cut"/.test(o.tl),'icônes arbre / timeline : '+o.icone+' '+o.tl);
  A(o.hote&&o.coupe,'l’esquisse du chemin est rattachée au balayage ; découpe reconnue');
  A(o.maillage&&o.maillage.n===1,'repli maillage : '+JSON.stringify(o.maillage));
  console.log(ko?'✗ '+ko+' échec(s)':'✓ balayage : tout est bon');
  process.exit(ko?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
