// 2026-10-21-001 : opération GÉODÉSIQUE sur RETARD.step (pièce réelle, boule D30).
// Référence Fusion 360 (rétro-ingénierie de son G-code 1001.nc, hors dépôt) sur la
// même face et le même posage (Z tourné de −11,25° autour de X), pas 0,8 :
// 26,5 m d'avance G1 dont 23 % DANS LE VIDE (pointes), ≈ 106 min à F250.
// Ici : décalages depuis les bords de la face, glissement au contact. On vérifie
// par le vrai chemin de l'appli (op créée, faces choisies, faoOpMoves) :
//   • aucune pénétration (points ET milieux de segments ≥ descente outil) ;
//   • matière restante sur la face ≤ crête théorique (+ marge) : couverture ;
//   • pas entre passes voisines ≤ pas demandé (+ tolérance) ;
//   • part de l'avance hors matière et remontées bornées.
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
  // THREE du harnais = stub : une vraie BufferGeometry minimale pour que le
  // maillage FIN d'un import (occTessellate) garde ses sommets et occGroups.
  const T0=sandbox.THREE;
  class BG{constructor(){this.attributes={};this.userData={};this.index=null;}
    setAttribute(n,a){this.attributes[n]=a;return this;} getAttribute(n){return this.attributes[n];}
    setIndex(i){this.index=i;return this;} computeVertexNormals(){} computeBoundingBox(){} computeBoundingSphere(){} dispose(){}}
  class F32{constructor(a,n){this.array=Float32Array.from(a);this.itemSize=n;this.count=this.array.length/n;}}
  sandbox.THREE=new Proxy({},{get(t,k){if(k==='BufferGeometry')return BG;if(k==='Float32BufferAttribute')return F32;return T0[k];}});
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};window.confirm=function(){return true;};',ctx);
  sandbox.__step=fs.readFileSync(path.join(__dirname,'fixtures','RETARD.step')).buffer;
  const STEP=0.8, D=30, R=D/2;
  sandbox.__P={STEP:STEP,D:D};
  const body=`
    const R0=[];const att=(c,m)=>R0.push([!!c,m]);
    await importSTEP({name:'RETARD.step',arrayBuffer:async()=>__step});
    try{markDirty();rebuild();}catch(e){}
    const imp=bodies.find(b=>b.kind==='import');
    if(!imp)return {err:'pas de corps importé'};
    const setup=faoSetup();
    // posage de Fusion : Z machine = axe tourné de −11,25° autour de X
    setup.frame={z:[0,-0.195090322016129,0.98078528040323]};
    const F=faoFrame(setup);
    // outil : boule D30
    const tl={id:'TGEO',num:4,name:'Boule D30',kind:'ball',d:__P.D,cornerR:__P.D/2,flutes:2,vc:200,fz:0.05};
    setup.tools=(setup.tools||[]).concat([tl]);
    att(faoAddOpsSpec().some(s=>s[0]==='geodesic'),'bouton « + Géodésique » présent');
    const op=faoOpDefaults('geodesic');
    att(op&&op.type==='geodesic'&&Array.isArray(op.faces)&&op.faces.length===0,'op créée sans face');
    op.toolId=tl.id;op.step=__P.STEP;op.sens='avalant';
    setup.ops.push(op);
    // face graine : la plus grande face dont le centre est le plus haut (Z posage)
    const g=faoFineGeo(imp), mm=faoMeshFromBodyFineCached(imp);
    if(!g||!mm)return {err:'maillage fin absent'};
    let seed=-1,best=-1/0;
    g.userData.occGroups.forEach(function(gr){
      let cz=0,n=0;
      for(let k=gr.start;k<gr.start+gr.count;k++){const t=mm.t[k];for(let q=0;q<3;q++){cz+=faoToF(F,mm.v[t[q]])[2];n++;}}
      cz/=n;if(gr.count>200&&cz>best){best=cz;seed=gr.f;}
    });
    const msg=faoGeoToggleFace(op,imp,seed);
    att(op.faces.length===1,'face du dessus choisie seule (pointes à arête vive, non tangentes) : '+msg);
    faoSanitiseOps(setup);
    att(op.faces.length===1&&op.faces[0].f===seed,'faces conservées par le nettoyage du document');
    // fiche : rendu sans exception
    let ficheOk=true;try{const dd=document.createElement('div');faoGeoFiche(dd,setup,op);}catch(e){ficheOk=String(e&&e.message||e);}
    att(ficheOk===true,'fiche Géodésique rendue ('+ficheOk+')');
    const t0=Date.now();
    const mv=faoOpMoves(op,setup);
    const ms=Date.now()-t0;
    const am=faoActiveMesh(setup,true);
    const drive=faoGeoDrive(setup,op);
    // pénétration : points et milieux des segments d'avance vs descente outil
    const drop=faoScDropper(am.mesh,'ball',__P.D,__P.D/2,0);
    let pen=0,penAt=null,air=0,feed=0;
    for(let i=1;i<mv.length;i++){const a=mv[i-1],b=mv[i];
      for(const t of [0.5,1]){const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t,z=a.z+(b.z-a.z)*t;const zd=drop.tip(x,y);
        if(zd>-1/0&&zd-z>pen){pen=zd-z;penAt=[x,y,z,i];}}
      if(!b.r){const l=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z);feed+=l;const zd=drop.tip((a.x+b.x)/2,(a.y+b.y)/2);
        if(!(zd>-1/0)||(a.z+b.z)/2>zd+0.05)air+=l;}}
    return {R:R0,ms:ms,diag:op.geoDiag||mv.diag,label:faoOpLabel(op,setup),pen:pen,penAt:penAt,air:air,feed:feed,
      mv:mv.map(m=>[m.r?1:0,m.x,m.y,m.z,m.tr?1:(m.ent?2:0)]),
      drive:{v:drive.v,n:drive.n}};
  `;
  let r;
  try{ r=await vm.runInContext('(async()=>{'+body+'})()',ctx); }
  catch(e){ console.log('  ✗ exception',e&&e.stack||e); process.exit(1); }
  if(r.err){console.log('  ✗ '+r.err);process.exit(1);}
  r.R.forEach(x=>A(x[0],x[1]));
  console.log('  · '+r.label+' — '+r.mv.length+' mouvements, '+r.ms+' ms');
  console.log('  · diag '+JSON.stringify(r.diag));
  if(process.env.GEO_DUMP){fs.writeFileSync(process.env.GEO_DUMP,JSON.stringify(r));console.log('  · dump ->',process.env.GEO_DUMP);}
  A(r.mv.length>1000,'parcours non vide ('+r.mv.length+' mouvements)');
  A(r.pen<=0.005,'aucune pénétration (max '+r.pen.toFixed(4)+' mm'+(r.penAt?' en '+r.penAt.map(v=>+v.toFixed(2)).join(','):'')+')');
  const airPct=100*r.air/r.feed;
  A(airPct<3,'avance hors matière '+airPct.toFixed(1)+' % (Fusion : 23 %) sur '+(r.feed/1000).toFixed(1)+' m');
  A(r.diag.lifts<=30,'remontées bornées ('+r.diag.lifts+' ; glissements au contact : '+r.diag.slides+')');
  // centres de boule le long des passes d'avance (densifiés à 0,25 mm)
  const C=[];
  for(let i=1;i<r.mv.length;i++){const a=r.mv[i-1],b=r.mv[i];if(b[0])continue;
    const l=Math.hypot(b[1]-a[1],b[2]-a[2],b[3]-a[3]),n=Math.max(1,Math.ceil(l/0.25));
    for(let k=1;k<=n;k++){const t=k/n;C.push([a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t,a[3]+(b[3]-a[3])*t+R,i]);}}
  const H=2,G=new Map();const key=(x,y,z)=>Math.floor(x/H)+','+Math.floor(y/H)+','+Math.floor(z/H);
  C.forEach((c,i)=>{const k=key(c[0],c[1],c[2]);(G.get(k)||G.set(k,[]).get(k)).push(i);});
  const nearC=(p,rad)=>{let b=1/0;const r0=Math.ceil(rad/H);const a=Math.floor(p[0]/H),bb=Math.floor(p[1]/H),c=Math.floor(p[2]/H);
    for(let x=-r0;x<=r0;x++)for(let y=-r0;y<=r0;y++)for(let z=-r0;z<=r0;z++){const L=G.get((a+x)+','+(bb+y)+','+(c+z));if(!L)continue;
      for(const j of L){const q=C[j];const d=(q[0]-p[0])**2+(q[1]-p[1])**2+(q[2]-p[2])**2;if(d<b)b=d;}}return Math.sqrt(b);};
  // matière restante = distance du point de face à la boule balayée la plus proche
  const res=[];
  for(let i=0;i<r.drive.v.length;i+=3){const p=r.drive.v[i],n=r.drive.n[i];if(n[2]<0.02)continue;
    res.push(nearC(p,R+2)-R);}
  res.sort((a,b)=>a-b);
  const q=f=>res[Math.floor(f*(res.length-1))];
  const cusp=R-Math.sqrt(R*R-(STEP/2)**2);
  console.log('  · matière restante (mm) : p50 '+q(.5).toFixed(4)+' · p99 '+q(.99).toFixed(4)+' · p99,9 '+q(.999).toFixed(4)+' · max '+q(1).toFixed(4)+' (crête théorique '+cusp.toFixed(4)+')');
  A(q(.999)<=cusp*1.6,'matière restante p99,9 ≤ 1,6 × crête théorique');
  A(q(1)<=cusp*3,'matière restante max ≤ 3 × crête théorique (aucun trou)');
  // pas : distance d'un centre au centre d'une AUTRE passe (indice éloigné) le plus proche
  const st=[];
  for(let i=0;i<C.length;i+=40){const p=C[i];let b=1/0;const a=Math.floor(p[0]/H),bb=Math.floor(p[1]/H),c=Math.floor(p[2]/H);
    for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){const L=G.get((a+x)+','+(bb+y)+','+(c+z));if(!L)continue;
      for(const j of L){const o=C[j];if(Math.abs(o[3]-p[3])<40)continue;const d=Math.hypot(o[0]-p[0],o[1]-p[1],o[2]-p[2]);if(d<b)b=d;}}
    if(b<3)st.push(b);}
  st.sort((a,b)=>a-b);
  const s95=st[Math.floor(st.length*0.95)];
  console.log('  · écart entre passes voisines (centres) : p50 '+st[st.length>>1].toFixed(3)+' · p95 '+s95.toFixed(3));
  A(s95<=STEP*1.12,'pas p95 ≤ pas demandé + 12 % ('+s95.toFixed(3)+')');
  console.log(ko?'ÉCHEC '+ko:'OK');
  process.exit(ko?1:0);
})();
