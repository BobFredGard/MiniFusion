// 2026-10-06 « FAO limite chaîne » — intégrité de la boucle XY (Chantier A)
// La boucle d'une limite « chaîne » est ASSEMBLÉE depuis des arêtes OCCT
// (faoOrderEdges → faoLoopFromChains). Deux défauts assemblaient une boucle
// fausse et le clip (faoClipMovesPoly) excluait alors une bande entière de
// matière — usinage incomplet visible sur l'aperçu :
//   1. une arête raccordée par son ARRIVÉE n'était pas inversée → le côté
//      correspondant disparaissait de la boucle ;
//   2. le 1er point de chaque maillon suivant était sauté aveuglément →
//      en plus du côté perdu, une corde parasite apparaissait.
// Symptôme sur le document réel : segment de 181,7 mm (le vrai plus long côté
// fait 157,663) et aire 22 454 mm² au lieu de 24 528 ; 26,3 mm de matière non
// usinée dans le coin supérieur droit.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
const json=fs.readFileSync(path.join(ROOT,'Cavité Usinage.minifusion.json'),'utf8');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  ✗ '+m);}else console.log('  ✓ '+m);};
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  sandbox.__docJson=json;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const out=await vm.runInContext(`(async function(){
    // --- outillage local -------------------------------------------------
    // Arête 2 points, dans l'ordre p0→p1 (inverse: true = enregistrée à l'envers).
    const mk=function(a,b,inverse){
      const p=inverse?[[b[0],b[1],0],[a[0],a[1],0]]:[[a[0],a[1],0],[b[0],b[1],0]];
      return {mid:[(a[0]+b[0])/2,(a[1]+b[1])/2,0],pts:p,len:Math.hypot(b[0]-a[0],b[1]-a[1]),sharp:true};
    };
    // Qualité d'une boucle : aire, plus long segment, fermeture, milieux dessus.
    const qual=function(edges,sel){
      const ch=faoOrderEdges(edges,sel||edges.map(function(_,i){return i;}));
      const r=faoLoopFromChains(edges,ch), loop=r.loop;
      let maxSeg=0,area=0;
      for(let i=0;i+1<loop.length;i++){
        const a=loop[i],b=loop[i+1];
        const d=Math.hypot(b[0]-a[0],b[1]-a[1]);
        if(d>maxSeg)maxSeg=d;
        area+=a[0]*b[1]-b[0]*a[1];
      }
      let eLen=0; edges.forEach(function(e){ if(e&&e.len>eLen)eLen=e.len; });
      let far=0;
      (sel||edges.map(function(_,i){return i;})).forEach(function(i){
        const e=edges[i];
        if(!e||!e.mid)return;
        const d=faoLoopDistTo(loop,[e.mid[0],e.mid[1]]);
        if(d>far)far=d;
      });
      return {loop:loop,closed:r.closed,maxSeg:maxSeg,area:Math.abs(area/2),
              maxEdge:eLen,farMid:far};
    };
    const R=[];

    // T1 — rectangle 40×30, ordre des indices mélangé + arêtes inversées.
    let E=[mk([0,0],[40,0],false),mk([40,0],[40,30],true),
           mk([40,30],[0,30],false),mk([0,30],[0,0],true)];
    let q=qual(E,[2,0,3,1]);
    R.push([Math.abs(q.area-1200)<1e-6,'T1 rectangle 40x30 : aire 1200 (obtenu '+q.area.toFixed(3)+')']);
    R.push([q.maxSeg<=50+1e-6,'T1 : aucun segment > le plus long côté (max '+q.maxSeg.toFixed(2)+' <= 50)']);
    R.push([q.closed===true,'T1 : boucle refermée d office']);
    R.push([q.farMid<1e-6,'T1 : tous les milieux d arete sur la boucle (max '+q.farMid.toExponential(1)+' mm)']);

    // T2 — mêmes 4 arêtes mais TOUTES enregistrées à l'envers (cas nominal régressif).
    E=[mk([0,0],[40,0],true),mk([40,0],[40,30],true),
       mk([40,30],[0,30],true),mk([0,30],[0,0],true)];
    q=qual(E,[1,3,0,2]);
    R.push([Math.abs(q.area-1200)<1e-6,'T2 toutes inversées : aire 1200 (obtenu '+q.area.toFixed(3)+')']);
    R.push([q.maxSeg<=50+1e-6,'T2 toutes inversées : pas de corde parasite (max '+q.maxSeg.toFixed(2)+')']);

    // T3 — hexagone régulier r=50, orientations quelconques, sel mélangé.
    E=[];
    for(let k=0;k<6;k++){
      const a0=k*Math.PI/3, a1=(k+1)*Math.PI/3;
      E.push(mk([50*Math.cos(a0),50*Math.sin(a0)],[50*Math.cos(a1),50*Math.sin(a1)],k%3===1));
    }
    q=qual(E,[5,2,0,4,1,3]);
    const a6=3*50*50*Math.sin(Math.PI/3);
    R.push([Math.abs(q.area-a6)<0.5,'T3 hexagone : aire '+(a6-0.5).toFixed(1)+' (obtenu '+q.area.toFixed(1)+')']);
    R.push([q.maxSeg<=50+1e-6,'T3 hexagone : segment max '+q.maxSeg.toFixed(2)+' <= 50']);
    R.push([q.farMid<1e-3,'T3 hexagone : milieux sur la boucle ('+q.farMid.toExponential(1)+' mm)']);

    // T4 — DOCUMENT RÉEL : après rejeu, la boucle doit être intégre.
    await deserialise(__docJson,{rebuild:false});
    occCkClear();markDirty();
    await rebuild();
    try{ faoChainReplay(); }catch(e){}
    const op=doc.fao.setups[0].ops[1];
    const L=op.limit, loop=L.loop;
    let maxSeg=0,area=0,i;
    for(i=0;i+1<loop.length;i++){
      const a=loop[i],b=loop[i+1];
      const d=Math.hypot(b[0]-a[0],b[1]-a[1]);
      if(d>maxSeg)maxSeg=d;
      area+=a[0]*b[1]-b[0]*a[1];
    }
    area=Math.abs(area/2);
    R.push([maxSeg<=158,'T4 doc réel : segment max '+maxSeg.toFixed(2)+' <= 157,663 + marge (avant fix : 181,74)']);
    R.push([area>24000&&area<25000,'T4 doc réel : aire '+area.toFixed(0)+' ∈ [24000,25000] (avant fix : 22454)']);
    R.push([L.stale===false,'T4 doc réel : stale=false (ancre unique suivie)']);
    R.push([L.nEdges===8&&loop.length>100,'T4 doc réel : 8 arêtes, '+loop.length+' points']);
    // Le côté haut (y = +61,489, x de -78,832 à 78,832) doit exister : c'est lui
    // qui avait disparu et qui créait l'îlot de 26,3 mm non usiné.
    let topSeg=false;
    for(i=0;i+1<loop.length;i++){
      const a=loop[i],b=loop[i+1];
      if(Math.abs(a[1]-61.489)<0.01&&Math.abs(b[1]-61.489)<0.01&&
         Math.abs(a[0]-b[0])>150){topSeg=true;break;}
    }
    R.push([topSeg,'T4 doc réel : côté haut (157,663 mm à y=61,489) présent']);
    return R;
  })()`,ctx);
  out.forEach(function(r){ A(r[0],r[1]); });
  if(ko){ console.log('\n'+ko+' ECHEC(S)'); process.exit(1); }
  console.log('\nTOUT EST CONFORME');
  process.exit(0);
})().catch(e=>{console.error('ERREUR',e);process.exit(1);});
