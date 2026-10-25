// V0.7.6 : perçage sur la TRANCHE — trous vus dans le repère propre de l'opération (3+2).
// Retour : « J'ai un souci pour prendre les trous sur la tranche, repère bien placé pourtant »
// (Perçages.miniFusion : opération Perçage, repère Z = −Y, trou Ø4,2 choisi dans la vue →
// « 0 pts »). Le clic dans la vue détectait les trous dans le repère de l'OPÉRATION, mais la
// résolution des trous choisis, la liste du panneau et les anneaux les cherchaient dans celui du
// POSAGE : le trou de la tranche n'y est pas vertical → 0 trou, 0 mouvement.
// Pièce (noyau OCCT réel) : bloc 100 × 60 × 30, un trou Ø5 sur le dessus en (20,20) débouchant,
// et un trou Ø5 borgne de 15 mm sur la tranche Y = 0, en X = 50, Z = 15.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const R=String.raw`
    const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};
    const P=(x,y,z)=>new occt.gp_Pnt_3(x,y,z);
    const cyl=(p,d,r,h)=>new occt.BRepPrimAPI_MakeCylinder_3(new occt.gp_Ax2_3(p,d),r,h).Shape();
    let sh=new occt.BRepPrimAPI_MakeBox_2(P(0,0,0),100,60,30).Shape();
    sh=occCut(sh,cyl(P(20,20,-1),new occt.gp_Dir_4(0,0,1),2.5,40));          // dessus, débouchant
    sh=occCut(sh,cyl(P(50,-1,15),new occt.gp_Dir_4(0,1,0),2.5,16));          // tranche Y = 0, 15 mm
    occLive={shape:sh};
    const S=faoSetup();S.ops=[];
    // opération dans le repère du posage : seul le trou du dessus est vertical
    const op0=faoOpDefaults('drill');S.ops.push(op0);
    const H0=faoWithOpFrame(op0,()=>faoHolesDetect());
    A(H0.length===1&&Math.abs(H0[0].x-20)<1e-6,'1 : repère du posage — le trou du dessus seul ('+H0.length+')');
    // opération au repère PROPRE posé sur la tranche : Z de l'opération = −Y (l'outil vient de −Y)
    const op=faoOpDefaults('drill');op.frame={z:'-Y',x:'X',flipZ:false,flipX:false};S.ops.push(op);
    const H=faoWithOpFrame(op,()=>faoHolesDetect());
    A(H.length===1&&Math.abs(H[0].d-5)<1e-6&&!H[0].through,'2 : repère de l’opération (−Y) — le trou de la tranche est vu, Ø5 borgne ('+H.map(h=>'Ø'+h.d+' Z'+h.ztop+'→'+h.zbot).join(' ')+')');
    faoHoleToggle(S,op,H[0].d,H[0].ztop);
    A(op.holes.length===1,'3 : le trou choisi est RÉSOLU dans le repère de l’opération (avant : 0) — '+op.holes.length);
    faoDrillResolve(op);
    A(op.holes.length===1,'4 : … et le reste au rejeu (faoDrillResolve)');
    const mv=faoOpMoves(op,S)||[];
    const feed=mv.filter(m=>m&&!m.r&&isFinite(+m.y));
    const yMax=feed.length?Math.max(...feed.map(m=>+m.y)):NaN;
    const t=faoToolById(S,op.toolId),L=faoToolTipLen(t);
    A(mv.length>0&&feed.every(m=>Math.abs(m.x-50)<1e-6&&Math.abs(m.z-15)<1e-6)&&Math.abs(yMax-(15+L))<1e-3,
      '5 : parcours dans le repère du posage : le foret avance le long de +Y en (50, Z15) jusqu’à Y '+yMax.toFixed(3)+' (15 + pointe '+L.toFixed(3)+')');
    A(mv.filter(m=>m&&m.r).every(m=>+m.y<0),'6 : les rapides restent du côté de la tranche (Y < 0)');
    // enchaînement (aperçu, simulation, G-code) : sortie le long du Z de l'opération (−Y), pas du Z posage
    const seq=faoSeqSafe(S).find(b=>b.op===op).moves;
    const hop=faoClearAbs(null,S),inner=seq.slice(1,-1);
    A(inner.every(m=>Math.abs(m.z-15)<1e-6)&&Math.abs(seq[0].z-hop)<1e-6&&Math.abs(seq[seq.length-1].z-hop)<1e-6,
      '6b : 3+2 — entre l’entrée et la sortie, tout reste en Z15 (le long de −Y) ; seules les liaisons montent au plan du posage (Z'+hop+')');
    const sx=seq[seq.length-2],dr0=seq.filter(m=>!m.r).slice(-1)[0];
    A(Math.abs(sx.x-dr0.x)<1e-6&&Math.abs(sx.z-dr0.z)<1e-6&&sx.y<-1,'6c : sortie le long de −Y jusqu’au plan de retrait de l’opération (Y '+sx.y.toFixed(2)+'), puis montée');
    // simulation de matière : le foret horizontal creuse DANS la matière, le dessus reste intact
    {const g=faoMatterGrid({x0:0,y0:0,z0:0,x1:100,y1:60,z1:30},1);
      const k=faoMatterCarveTilt(g,{x:50,y:-5,z:15},{x:50,y:15,z:15},2.5,[0,-1,0],null);
      let low=0;for(let c=0;c<g.nx*g.ny;c++)if(g.h[c]<30-1e-6)low++;
      const deep=k.some(idx=>{const ix=idx%g.nx,iy=Math.floor(idx/g.nx)%g.ny;return Math.abs(g.ox+(ix+0.5)*g.pas-50)<1&&g.oy+(iy+0.5)*g.pas>13;});
      const past=k.some(idx=>{const iy=Math.floor(idx/g.nx)%g.ny;return g.oy+(iy+0.5)*g.pas>15.5;});
      A(low===0&&k.length>0&&deep&&!past,'6d : simulation — trou de la tranche creusé jusqu’à Y15 ('+k.length+' voxels), aucune colonne abaissée (avant : cheminée jusqu’au dessus)');}
    // repère repassé à celui du posage puis remis : les trous choisis sont re-résolus
    faoOpFrameEdit(S,op,()=>{delete op.frame;});
    A(op.holes.length===0,'7 : repère du posage → le trou de la tranche n’y est plus vu ('+op.holes.length+')');
    faoOpFrameEdit(S,op,()=>{op.frame={z:'-Y',x:'X',flipZ:false,flipX:false};});
    A(op.holes.length===1&&(faoOpMoves(op,S)||[]).length>0,'8 : repère remis → trou re-résolu et parcours recréé ('+op.holes.length+')');
    // gamme : les opérations créées gardent le repère 3+2 et ont un parcours
    const made=faoDrillGamme(S,op)||[];
    A(made.length>=2&&made.every(o=>o.frame&&o.frame.z==='-Y'),'9 : gamme — '+made.length+' opérations, toutes au repère −Y ('+made.map(o=>o.cycle+':'+(o.frame&&o.frame.z)).join(' ')+')');
    A(made.every(o=>o.holes.length===1&&(faoOpMoves(o,S)||[]).filter(m=>m&&!m.r).every(m=>Math.abs(m.x-50)<1e-6&&Math.abs(m.z-15)<1e-6)&&(faoOpMoves(o,S)||[]).length>0),
      '10 : gamme — chaque opération perce le trou de la tranche (parcours non vide, en X50 Z15)');
    // nouveau Ø ajouté depuis l'opération au repère propre : la nouvelle opération hérite du repère
    const dr=made.find(o=>o.cycle!=='spot');
    const no=faoHoleToggle(S,dr,8,dr.holeSel[0].z);
    A(no!==dr&&no.frame&&no.frame.z==='-Y','11 : nouveau Ø → nouvelle opération au même repère −Y');
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== Perçage sur la tranche (repère propre de l’opération) ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
