// FAO — ÉBAUCHE 3D : PASSE TORIQUE (2026-10-14-007, src/89-fao-torique.js).
// Tronc de pyramide à faces 45° : la fraise droite du moteur laisse 0,965 mm
// à chaque niveau sous un torique D10 R2 ; la passe ajoutée vient au
// contact (écart ≈ 0), sans surcoupe, et le parcours du moteur est
// IDENTIQUE (préfixe) — seules les passes toriques s'ajoutent à la fin.
// Descente torique exacte comparée à l'anneau de 800 boules.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    "const v=[[-30,-30,0],[30,-30,0],[30,30,0],[-30,30,0],[-10,-10,20],[10,-10,20],[10,10,20],[-10,10,20]];",
    "const t=[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[1,2,6],[1,6,5],[2,3,7],[2,7,6],[3,0,4],[3,4,7]];",
    "const FR={v:v,t:t};const B={x0:-50,y0:-50,x1:50,y1:50};",
    // 1. descente torique exacte
    "const TD=faoTorusDropper(FR,10,2,0),RF=faoScDropper(FR,'bull',10,2,0,800);",
    "let dmin=0,dmax=0;for(let i=0;i<200;i++){const x=-40+80*((i*37)%200)/200,y=-40+80*((i*91)%200)/200;const a=TD.tip(x,y),b=RF.tip(x,y);if(a>-1/0&&b>-1/0){const d=a-b;if(d<dmin)dmin=d;if(d>dmax)dmax=d;}}",
    "att(dmin>-0.005&&dmax<0.002,'descente torique exacte ≈ anneau de 800 boules ('+dmin.toFixed(4)+' .. '+dmax.toFixed(4)+')');",
    // 2. ébauche fraise droite vs torique
    "const oF={ap:4,ae:3,toolD:10,kind:'flat',cornerR:2,radial:0,axial:0,secu:30,sens:'avalant'};",
    "const mF=faoGenRough3D(FR,B,22,0,oF);",
    "const mB=faoGenRough3D(FR,B,22,0,Object.assign({},oF,{kind:'bull'}));",
    "let same=0;for(let i=0;i<mF.length&&i<mB.length;i++){const a=mF[i],b=mB[i];if(a.r===b.r&&a.x===b.x&&a.y===b.y&&a.z===b.z)same++;else break;}",
    "p('fraise droite : '+mF.length+' moves ; torique : '+mB.length+' (préfixe identique '+same+')');",
    "att(same===mF.length,'parcours du moteur inchangé : préfixe identique ('+same+'/'+mF.length+')');",
    "const lift=function(mv){let n=0;for(let i=1;i<mv.length;i++)if(mv[i].r&&!mv[i-1].r)n++;return n;};",
    "att(lift(mB)-lift(mF)<=6,'remontées : +1 par niveau au plus ('+lift(mF)+' -> '+lift(mB)+')');",
    "const dr=faoScDropper(FR,'bull',10,2,0,400);",
    "const gap=function(mv){let gmin=1/0;const per={};for(let i=1;i<mv.length;i++){const a=mv[i-1],b=mv[i];if(b.r)continue;const L=Math.hypot(b.x-a.x,b.y-a.y),k=Math.max(1,Math.ceil(L/0.3));for(let q=0;q<=k;q++){const x=a.x+(b.x-a.x)*q/k,y=a.y+(b.y-a.y)*q/k,z=a.z+(b.z-a.z)*q/k;const g=z-dr.tip(x,y);if(g<gmin)gmin=g;if([2,6,10,14,18].includes(z)){if(!(z in per)||g<per[z])per[z]=g;}}}return {gmin:gmin,per:per};};",
    "const gF=gap(mF),gB=gap(mB);",
    "p('écart torique↔face par niveau — droite '+JSON.stringify(gF.per)+' / torique '+JSON.stringify(gB.per));",
    "att(Object.values(gF.per).every(g=>g>0.9),'fraise droite : ~0,965 mm laissés aux faces 45°');",
    "att(Object.values(gB.per).length===5&&Object.values(gB.per).every(g=>Math.abs(g)<0.01),'passe torique : au contact à chaque niveau (|écart| < 0,01)');",
    "att(gB.gmin>-0.01,'passe torique : aucune surcoupe (min '+gB.gmin.toFixed(4)+')');",
    // 2026-10-14-008 : mini-passes au contact réel (laisse Parois), à leur place
    "const oM=Object.assign({},oF,{minipasses:2,radial:0.5});",
    "const mMF=faoGenRough3D(FR,B,22,0,oM),mMB=faoGenRough3D(FR,B,22,0,Object.assign({},oM,{kind:'bull'}));",
    "const drL=faoTorusDropper(FR,10,2,0.5);",
    "const zMini={};mMF.forEach(m=>{if(!m.r&&!m.ent&&Math.abs(m.z-Math.round(m.z))>1e-3)zMini[m.z.toFixed(3)]=1;});",
    "const gapL=function(mv){const per={};let gmin=1/0;for(let i=1;i<mv.length;i++){const b=mv[i];if(b.r||b.ent)continue;const g=b.z-drL.tip(b.x,b.y);if(g<gmin)gmin=g;const k=b.z.toFixed(3);if(zMini[k]&&(!(k in per)||g<per[k]))per[k]=g;}return {per:per,gmin:gmin};};",
    "const gMF=gapL(mMF),gMB=gapL(mMB);",
    "p('mini-passes (Parois 0,5) — droite '+JSON.stringify(gMF.per)+' / torique '+JSON.stringify(gMB.per));",
    "att(Object.keys(gMB.per).length>=4&&Object.values(gMB.per).every(g=>Math.abs(g)<0.01),'mini-passes toriques : au contact de la laisse Parois');",
    "att(Object.values(gMF.per).every(g=>g>0.5),'mini-passes fraise droite : ~1 mm de trop (référence)');",
    "att(gMB.gmin>-0.01,'mini-passes toriques : aucune surcoupe de la laisse (min '+gMB.gmin.toFixed(4)+')');",
    "att(lift(mMB)<=lift(mMF)+6,'mini-passes : remontées '+lift(mMF)+' -> '+lift(mMB));",
    // 3. fraise droite / torique R0 : rien d'ajouté
    "const mR0=faoGenRough3D(FR,B,22,0,Object.assign({},oF,{kind:'bull',cornerR:0}));",
    "att(mR0.length===mF.length,'torique R0 = fraise droite : rien d ajouté');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(function(m){p('  x '+m);});}",
    "else p('TOUT EST CONFORME');",
    "return {txt:P.join(String.fromCharCode(10)),ko:ATT.length};"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'fao_torique.js'});
  console.log(r.txt);
  process.exit(r.ko?1:0);
})().catch(e=>{console.log('FATAL',e&&e.stack||e);process.exit(1);});
