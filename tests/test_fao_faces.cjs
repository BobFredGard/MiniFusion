// 2026-10-21-003 : FACES USINABLES (bleu) / INTOUCHABLES (rouge) par opération,
// sur RETARD.step (pièce réelle). Demande : « interdire rapidement à la fraise
// d'aller usiner ce que l'on ne veut pas usiner ». Vérifications PHYSIQUES :
//   • Géodésique (bleu = face du dessus, rouge = flanc plat x=48,2, marge 0,5) :
//     la boule ne s'approche JAMAIS à moins de la marge du flanc rouge ;
//   • Finition Crêtes (bleu = face du dessus) : chaque point d'usinage repose
//     sur la face bleue (descente sur le bleu seul = descente sur tout) ;
//   • Ébauche 3D (rouge = face du dessus) : aucune position d'outil (avance ou
//     rapide) à moins de la marge du rouge, et aucun rapide sous le plan de
//     dégagement au-dessus de son emprise (brut jamais vidé là) ;
//   • saisie (face + tangentes, Maj = solide entier, exclusivité bleu/rouge),
//     nettoyage du document, fiche.
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
  const T0=sandbox.THREE;
  class BG{constructor(){this.attributes={};this.userData={};this.index=null;}
    setAttribute(n,a){this.attributes[n]=a;return this;} getAttribute(n){return this.attributes[n];}
    setIndex(i){this.index=i;return this;} computeVertexNormals(){} computeBoundingBox(){} computeBoundingSphere(){} dispose(){}}
  class F32{constructor(a,n){this.array=Float32Array.from(a);this.itemSize=n;this.count=this.array.length/n;}}
  sandbox.THREE=new Proxy({},{get(t,k){if(k==='BufferGeometry')return BG;if(k==='Float32BufferAttribute')return F32;return T0[k];}});
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};window.confirm=function(){return true;};showAll=function(){};',ctx);
  sandbox.__step=fs.readFileSync(path.join(__dirname,'fixtures','RETARD.step')).buffer;
  const body=`
    const R=[];const att=(c,m)=>R.push([!!c,m]);
    await importSTEP({name:'RETARD.step',arrayBuffer:async()=>__step});
    try{markDirty();rebuild();}catch(e){}
    const imp=bodies.find(b=>b.kind==='import');
    const setup=faoSetup();
    setup.frame={z:[0,-0.195090322016129,0.98078528040323]};
    // brut saisi : boîte de la pièce (repère du posage) + 2 mm (le harnais ne
    // calcule pas la boîte des corps — THREE simulé)
    {const bx=faoActiveMesh(setup).box;setup.stockSrc='manual';
     setup.stock={x0:bx.x0-2,y0:bx.y0-2,z0:bx.z0-2,x1:bx.x1+2,y1:bx.y1+2,z1:bx.z1+2};}
    faoStock();
    const F=faoFrame(setup);
    const g=faoFineGeo(imp), mm=faoMeshFromBodyFineCached(imp);
    // faces repères : dessus (centre le plus haut), flanc plat x = 48,2
    let top=-1,best=-1/0,side=-1,sideN=0;
    g.userData.occGroups.forEach(function(gr){
      let cz=0,n=0,allX=true;
      for(let k=gr.start;k<gr.start+gr.count;k++){const t=mm.t[k];for(let q=0;q<3;q++){const p=mm.v[t[q]];cz+=faoToF(F,p)[2];n++;if(Math.abs(p[0]-48.2)>1e-3)allX=false;}}
      cz/=n;if(gr.count>200&&cz>best){best=cz;top=gr.f;}
      if(allX&&gr.count>sideN){sideN=gr.count;side=gr.f;}
    });
    att(top>=0&&side>=0,'faces repérées : dessus '+top+', flanc x=48,2 '+side);
    const ball={id:'TB',num:4,name:'Boule D30',kind:'ball',d:30,cornerR:15,flutes:2,vc:200,fz:0.05};
    const bull={id:'TT',num:6,name:'Torique D20 R2',kind:'bull',d:20,cornerR:2,flutes:2,vc:500,fz:0.1};
    setup.tools=(setup.tools||[]).concat([ball,bull]);
    // ---- saisie : tangentes, exclusivité, solide entier, nettoyage ----
    const t1=faoOpDefaults('geodesic');t1.toolId='TB';
    faoFaceToggle(t1,'faces',imp,top,false);
    att(t1.faces.length===1&&t1.faces[0].f===top,'bleu : face du dessus ajoutée');
    faoFaceToggle(t1,'protect',imp,top,false);
    att(t1.faces.length===0&&t1.protect.length===1,'une face passée en rouge quitte le bleu');
    faoFaceToggle(t1,'protect',imp,null,true);
    att(t1.protect.length===1&&t1.protect[0].all===1,'Maj+clic : solide entier en rouge');
    faoFaceToggle(t1,'protect',imp,null,true);
    att(t1.protect.length===0,'second Maj+clic : solide retiré');
    const sOps=faoDefaultSetup();sOps.ops=[{id:'z1',type:'facing',on:true,z:10,protect:[{b:'x',f:1}],faces:[{b:'x',f:2}]},
      {id:'z2',type:'rough3d',on:true,protect:[{b:'x',f:'a'},{b:'y',all:1}],protectM:-1}];
    faoSanitiseOps(sOps);
    att(!('protect' in sOps.ops[0])&&!('faces' in sOps.ops[0]),'nettoyage : pas de listes hors Ébauche 3D / Finition / Géodésique');
    att(sOps.ops[1].protect.length===1&&sOps.ops[1].protect[0].all===1&&!('protectM' in sOps.ops[1]),'nettoyage : entrées invalides et marge négative retirées');
    let fiche=true;try{const dd=document.createElement('div');t1.protect=[{b:imp.id,f:side}];faoFaceListsFiche(dd,setup,t1);}catch(e){fiche=String(e&&e.message||e);}
    att(fiche===true,'fiche Faces rendue ('+fiche+')');
    const out={R:R};
    // ---- A. Géodésique : bleu dessus, rouge flanc x=48,2 ----
    const gA=faoOpDefaults('geodesic');Object.assign(gA,{toolId:'TB',step:1.5,faces:[{b:imp.id,f:top}]});
    setup.ops=[gA];faoSanitiseOps(setup);
    const mv0=faoOpMoves(gA,setup);const reg0=gA.geoDiag&&gA.geoDiag.region;
    gA.protect=[{b:imp.id,f:side}];gA.protectM=0.5;delete gA.stale;faoSanitiseOps(setup);
    const mvA=faoOpMoves(gA,setup);
    out.A={n0:mv0.length,reg0:reg0,reg:gA.geoDiag&&gA.geoDiag.region,mv:mvA.map(m=>[m.r?1:0,m.x,m.y,m.z]),red:faoFaceMesh(setup,gA.protect)};
    // ---- B. Finition Crêtes : bleu = dessus ----
    const fB=faoOpDefaults('geofinish');Object.assign(fB,{toolId:'TB',step:3,faces:[{b:imp.id,f:top}]});
    setup.ops=[fB];faoSanitiseOps(setup);
    const mvB=faoOpMoves(fB,setup);
    const am=faoActiveMesh(setup,true);
    const dAll=faoScDropper(am.mesh,'ball',30,15,0),dBlue=faoScDropper(faoFaceMesh(setup,fB.faces),'ball',30,15,0);
    let offBlue=0,cutB=0;
    for(const m of mvB){if(m.r||m.ent||m.tr)continue;cutB++;const a=dAll.tip(m.x,m.y),b=dBlue.tip(m.x,m.y);if(!(b>-1/0)||Math.abs(a-b)>0.01)offBlue++;}
    out.B={n:mvB.length,cut:cutB,off:offBlue};
    // ---- C. Ébauche 3D : rouge = dessus ----
    const eC=faoOpDefaults('rough3d');Object.assign(eC,{toolId:'TT',ap:6,ae:6,radial:0.5,axial:0.5,ztop:setup.stock.z1,zbot:35,minipasses:0,protect:[{b:imp.id,f:top}],protectM:0.5});
    setup.ops=[eC];faoSanitiseOps(setup);
    const mvC=faoOpMoves(eC,setup);
    const secu=faoZoneSecu(eC,setup);
    const pT=faoProtectTip(setup,eC,bull,0,true); // fraise droite D20 gonflée de 0,5 (marge seule)
    let worst=0,worstAt=null,rapUnder=0;
    for(let i=1;i<mvC.length;i++){const a=mvC[i-1],b=mvC[i];
      const L=Math.hypot(b.x-a.x,b.y-a.y),ns=Math.max(1,Math.ceil(L/0.5));
      for(let k=0;k<=ns;k++){const t=k/ns,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t,z=a.z+(b.z-a.z)*t;
        const e=pT(x,y)-z;if(e>worst){worst=e;worstAt=[x,y,z,i,b.r?'G0':'G1'];}
        if(b.r&&z<secu-1e-6&&pT(x,y)>z-0.9&&L>1e-9)rapUnder++;}} // 2026-10-22-004 : ≥ 1 mm au-dessus du rouge (plus forcément au plan)
    const dM=faoScDropper(faoActiveMesh(setup).mesh,'flat',20,0,0);
    const through=function(mv){let w=0,at=null;for(let i=1;i<mv.length;i++){const a=mv[i-1],b=mv[i];const L=Math.hypot(b.x-a.x,b.y-a.y),ns=Math.max(1,Math.ceil(L/0.5));
      for(let k=0;k<=ns;k++){const t=k/ns,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t,z=a.z+(b.z-a.z)*t;const e=dM.tip(x,y)-z;if(e>w){w=e;at=[+x.toFixed(1),+y.toFixed(1),+z.toFixed(1),i,b.r?'G0':(b.ent?'ent':'G1')];}}}return [+w.toFixed(3),at];};
    const eN=Object.assign({},eC,{id:'noprot'});delete eN.protect;delete eN.protectM;setup.ops=[eN];faoSanitiseOps(setup);
    const mvN=faoOpMoves(eN,setup);setup.ops=[eC];
    out.cmp={stock:setup.stock,secu:secu,ztop:eC.ztop,zbot:eC.zbot,penProt:through(mvC),penNoProt:through(mvN),nN:mvN.length};
    out.dbg={at:worstAt,modelTip:worstAt?dM.tip(worstAt[0],worstAt[1]):null,prev:mvC.slice(Math.max(0,(worstAt?worstAt[3]:0)-3),(worstAt?worstAt[3]:0)+2)};
    // ---- D. Ébauche 3D : rouge = flanc x=48,2, « Interdire devant la face » ----
    // sans la case, l'outil enlève le brut DEVANT le flanc (bande x 48,2→brut)
    // en restant à la marge de la face ; avec, le volume avant est interdit.
    // outil (fraise droite D20) qui entre dans le volume AVANT du flanc (prisme jusqu'au brut)
    const prism=faoFrontPrism(faoFaceMesh(setup,[{b:imp.id,f:side}]),setup.stock);
    const dP=faoScDropper(prism,'flat',20,0,0);
    // 2026-10-21-013 : « devant » = centre d'outil sans pièce dessous (au-dessus de
    // la pièce, l'outil peut déborder sur la bande pour finir la face vrillée)
    const dBelow=faoScDropper(faoActiveMesh(setup).mesh,'flat',0.4,0,0);
    const band=function(mv){let n=0;
      for(let i=1;i<mv.length;i++){const a=mv[i-1],b=mv[i];if(b.r)continue;
        const L=Math.hypot(b.x-a.x,b.y-a.y),ns=Math.max(1,Math.ceil(L/0.5));
        for(let k=1;k<=ns;k++){const t=k/ns,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t,z=a.z+(b.z-a.z)*t;
          if(dBelow.tip(x,y)>-1/0)continue; // pièce sous l'outil : pas devant le flanc
          const e=dP.tip(x,y);if(e>-1e8&&z<e-0.05)n++;}}return n;};
    const eD=faoOpDefaults('rough3d');Object.assign(eD,{toolId:'TT',ap:6,ae:6,radial:0.5,axial:0.5,ztop:setup.stock.z1,zbot:35,minipasses:0,protect:[{b:imp.id,f:side}],protectM:0.5});
    setup.ops=[eD];faoSanitiseOps(setup);
    const mvD0=faoOpMoves(eD,setup);
    const eF=Object.assign({},eD,{id:'front',protectFront:true});setup.ops=[eF];faoSanitiseOps(setup);
    const mvD1=faoOpMoves(setup.ops[0],setup);
    const pTF=faoProtectTip(setup,setup.ops[0],bull,0,true,faoActiveMesh(setup).mesh);
    let wF=0,wAt=null;for(let i=1;i<mvD1.length;i++){const a=mvD1[i-1],b=mvD1[i];const L=Math.hypot(b.x-a.x,b.y-a.y),ns=Math.max(1,Math.ceil(L/0.5));
      for(let k=0;k<=ns;k++){const t=k/ns,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t,z=a.z+(b.z-a.z)*t;const e=pTF(x,y)-z;if(e>wF){wF=e;wAt=[+x.toFixed(1),+y.toFixed(1),+z.toFixed(1),i,b.r?'G0':(b.ent?'ent':'G1'),JSON.stringify(a),JSON.stringify(b)];}}}
    out.Dat=wAt;
    out.D={band0:band(mvD0),band1:band(mvD1),n0:mvD0.length,n1:mvD1.length,wF:wF,frontKept:setup.ops[0].protectFront===true};
    // 2026-10-22-006 : face COURBE (bord cylindrique du moyeu, face 24) — le volume
    // « devant » ne monte jamais au-dessus de la face (il passait par-dessus le flanc)
    {const fc=faoFaceMesh(setup,[{b:imp.id,f:24}]);let zF=-1/0;if(fc)for(const p of fc.v)if(p[2]>zF)zF=p[2];
     const pc=fc?faoFrontPrism(fc,setup.stock):null;let zP=-1/0;if(pc)for(const p of pc.v)if(p[2]>zP)zP=p[2];
     out.E24={zF:zF,zP:zP,n:pc?pc.t.length:0};}
    // ---- E. minipasses avec faces rouges (2026-10-21-008) : un contour fermé
    // qui COMMENÇAIT hors zone (flanc rouge) était jeté en entier ----
    const eE=faoOpDefaults('rough3d');Object.assign(eE,{toolId:'TT',ap:6,ae:6,radial:0.5,axial:0.5,ztop:setup.stock.z1,zbot:30,minipasses:2,
      protect:[{b:imp.id,f:side},{b:imp.id,f:3},{b:imp.id,f:6}],protectFront:true});
    setup.ops=[eE];faoSanitiseOps(setup);
    const mvE=faoOpMoves(setup.ops[0],setup);
    const zt=+setup.ops[0].ztop,bands=[];
    for(let k=1;;k++){const zl=Math.round((zt-6*k)*1000)/1000;if(zl<30-1e-6)break;
      let L=0;for(const dz of [2,4]){const zm=Math.round((zl+dz)*1000)/1000;
        for(let i=1;i<mvE.length;i++){const a=mvE[i-1],b=mvE[i];if(b.r||a.r)continue;if(Math.abs(a.z-zm)<1e-6&&Math.abs(b.z-zm)<1e-6)L+=Math.hypot(b.x-a.x,b.y-a.y);}}
      bands.push([zl,+L.toFixed(1)]);}
    out.E={bands:bands};
    // ---- F. rotation du repère autour de X (2026-10-21-009) ----
    const fz=function(fr){return faoFrame({frame:fr}).Z.map(v=>+v.toFixed(5));};
    out.F={xp:fz({rx:-11.25}),xm:fz({rx:-11.25,rxAx:'-X'}),none:fz({}),op:(function(){const o2={frame:{z:'+Z',x:'+X',rx:30}};const fr=faoOpFrame(setup,o2);return fr&&fr.rel.Z.map(v=>+v.toFixed(4));})()};
    out.C={n:mvC.length,worst:worst,worstAt:worstAt,rapUnder:rapUnder,secu:secu};
    return out;
  `;
  let r;
  try{ r=await vm.runInContext('(async()=>{'+body+'})()',ctx); }
  catch(e){ console.log('  ✗ exception',e&&e.stack||e); process.exit(1); }
  r.R.forEach(x=>A(x[0],x[1]));
  // A : distance boule ↔ flanc rouge (sommets + centres + milieux d'arêtes des triangles rouges)
  const red=r.A.red,Rb=15;
  const P=[];for(const t of red.t){const a=red.v[t[0]],b=red.v[t[1]],c=red.v[t[2]];
    for(const w of [[1,0,0],[0,1,0],[0,0,1],[1/3,1/3,1/3],[.5,.5,0],[0,.5,.5],[.5,0,.5]])P.push([a[0]*w[0]+b[0]*w[1]+c[0]*w[2],a[1]*w[0]+b[1]*w[1]+c[1]*w[2],a[2]*w[0]+b[2]*w[1]+c[2]*w[2]]);}
  const Hs=4,Gr=new Map();P.forEach((p,i)=>{const k=Math.floor(p[0]/Hs)+','+Math.floor(p[1]/Hs)+','+Math.floor(p[2]/Hs);(Gr.get(k)||Gr.set(k,[]).get(k)).push(i);});
  let dmin=1/0;
  const mvA=r.A.mv;
  for(let i=1;i<mvA.length;i++){const a=mvA[i-1],b=mvA[i];if(b[0])continue;
    const L=Math.hypot(b[1]-a[1],b[2]-a[2],b[3]-a[3]),ns=Math.max(1,Math.ceil(L/0.5));
    for(let k=1;k<=ns;k++){const t=k/ns,c=[a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t,a[3]+(b[3]-a[3])*t+Rb];
      const ci=Math.floor(c[0]/Hs),cj=Math.floor(c[1]/Hs),ck=Math.floor(c[2]/Hs);
      for(let x=-5;x<=5;x++)for(let y=-5;y<=5;y++)for(let z=-5;z<=5;z++){const l=Gr.get((ci+x)+','+(cj+y)+','+(ck+z));if(!l)continue;
        for(const j of l){const q=P[j];const d=Math.hypot(q[0]-c[0],q[1]-c[1],q[2]-c[2])-Rb;if(d<dmin)dmin=d;}}}}
  console.log('  · A Géodésique : zone '+r.A.reg0+' → '+r.A.reg+' triangles ; distance mini boule ↔ flanc rouge '+dmin.toFixed(3)+' mm');
  A(r.A.mv.length>100,'A : parcours géodésique produit ('+r.A.mv.length+' mouvements)');
  A(r.A.reg<r.A.reg0,'A : la zone touchable rétrécit le long du flanc rouge');
  A(dmin>=0.5-0.03,'A : la boule reste à ≥ 0,5 mm (marge) du flanc rouge');
  console.log('  · B Finition : '+r.B.cut+' points d’usinage, '+r.B.off+' hors de la face bleue');
  A(r.B.cut>100,'B : finition produite ('+r.B.n+' mouvements)');
  A(r.B.off===0,'B : tous les points d’usinage reposent sur la face bleue');
  console.log('  · C Ébauche 3D : '+r.C.n+' mouvements ; pire empiètement de marge '+r.C.worst.toFixed(3)+' mm'+(r.C.worstAt?' ('+r.C.worstAt.map(v=>typeof v==='number'?+v.toFixed(2):v).join(',')+')':'')+' ; rapides à moins de 1 mm au-dessus du rouge : '+r.C.rapUnder);
  A(r.C.n>100,'C : ébauche produite');
  A(r.C.worst<=0.02,'C : aucune position d’outil à moins de la marge de la face rouge');
  A(r.C.rapUnder===0,'C : aucun rapide à moins de 1 mm au-dessus du rouge');
  if(process.env.DBG){console.log(JSON.stringify(r.dbg));console.log(JSON.stringify(r.cmp));}
  console.log('  · D Interdire devant la face : avances sous le bord du flanc, outil sur la bande avant : '+r.D.band0+' sans la case ('+r.D.n0+' mvts) → '+r.D.band1+' avec ('+r.D.n1+' mvts) ; pire empiètement du volume interdit '+r.D.wF.toFixed(3)+' mm');
  if(r.D.wF>0.02)console.log('    pire en',JSON.stringify(r.Dat));
  A(r.D.frontKept,'D : option « Interdire devant la face » conservée par le nettoyage');
  A(r.D.band0>0,'D : sans la case, l’ébauche usine bien le brut devant le flanc rouge (cas du retour utilisateur)');
  console.log('  · face 24 (bord cylindrique) : dessus de la face '+r.E24.zF.toFixed(2)+', dessus du volume « devant » '+r.E24.zP.toFixed(2)+' ('+r.E24.n+' triangles)');
  A(r.E24.n>0&&r.E24.zP<=r.E24.zF+1e-6,'D : le volume « devant » d’une face courbe ne monte pas au-dessus de la face');
  A(r.D.band1===0,'D : avec la case, plus aucune avance DEVANT le flanc rouge (outil hors de la pièce)');
  A(r.D.wF<=0.02,'D : aucune position d’outil dans le volume avant + marge');
  console.log('  · E minipasses par bande (Z niveau : longueur aux 2 cotes de minipasse, mm) : '+r.E.bands.map(b=>b[0].toFixed(1)+':'+b[1]).join(' · '));
  A(r.E.bands.length>=3&&r.E.bands.every(b=>b[1]>10),'E : minipasses présentes à CHAQUE bande malgré les flancs rouges');
  const sn=+Math.sin(11.25*Math.PI/180).toFixed(5),cs=+Math.cos(11.25*Math.PI/180).toFixed(5);
  A(JSON.stringify(r.F.xp)===JSON.stringify([0,sn,cs]),'F : rotation −11,25° autour de X+ → Z = (0, '+sn+', '+cs+') ('+r.F.xp+')');
  A(JSON.stringify(r.F.xm)===JSON.stringify([0,-sn,cs]),'F : même angle autour de X− → Z symétrique ('+r.F.xm+')');
  A(JSON.stringify(r.F.none)===JSON.stringify([0,0,1]),'F : sans rotation, Z inchangé');
  A(r.F.op&&Math.abs(r.F.op[1]+0.5)<1e-4&&Math.abs(r.F.op[2]-0.866)<1e-3,'F : opération tournée de 30° autour de X → Z (repère du posage) = (0, −0,5, 0,866) ('+r.F.op+')');
  console.log(ko?'ÉCHEC '+ko:'OK');
  process.exit(ko?1:0);
})();
