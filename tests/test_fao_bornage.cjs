// 2026-10-04-007 : « FAO bornage murs » (ROUGE 026) — la descente clamp de
// `faoRoughAdaptiveLevel` (garde 12 paliers puis `return`) abandonne des
// lignes sur la pièce réelle « Cavité Usinage » : le coupe manquant laisse un
// rayé non usiné le long du mur (niveaux z49/48/41/28…20.5).
// Vérité terrain INDÉPENDANTE du nombre de paliers : pour chaque niveau
// (principal + mini-passes) et chaque côté, on prend la ligne de grille la
// plus extérieure qui traverse le mur (c0 non vide) et on fait une
// bissection sur `clean(t)` = faoYCands vide, dans le sens donné par le
// premier candidat (le plus proche) : plus petit/grand y sûr atteignable.
// Un coupe doit exister à ≤ 0.5 mm de cette borne (contrôles verts : 0).
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
    await deserialise(__docJson,{rebuild:false});
    occCkClear();markDirty();rebuild();
    const setup=faoSetup();
    faoMeshFromBody=function(b){
      try{
        if(!b||!b.shape)return null;
        const D=occXDefl();
        new occt.BRepMesh_IncrementalMesh_2(b.shape,D.lin,false,D.ang,false);
        const v=[],t=[],map={};
        const ex=new occt.TopExp_Explorer_2(b.shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);
        while(ex.More()){
          const f=occt.TopoDS.Face_1(ex.Current());
          const loc=new occt.TopLoc_Location_1();
          try{
            const h=occt.BRep_Tool.Triangulation(f,loc);
            if(h&&!h.IsNull()){
              const tr=h.get(),nt=tr.NbTriangles();
              let rev=false;
              try{rev=(f.Orientation_1()===occt.TopAbs_Orientation.TopAbs_REVERSED);}catch(e){}
              const trsf=loc.IsIdentity()?null:loc.Transformation();
              for(let i=1;i<=nt;i++){
                const triangle=tr.Triangle(i);
                let idx=[triangle.Value(1),triangle.Value(2),triangle.Value(3)];
                if(rev)idx=[idx[0],idx[2],idx[1]];
                const tri=[];
                for(const k of idx){
                  const p=tr.Node(k);let x,y,z;
                  if(trsf){const q=p.Transformed(trsf);x=q.X();y=q.Y();z=q.Z();}else{x=p.X();y=p.Y();z=p.Z();}
                  const key=x.toFixed(4)+","+y.toFixed(4)+","+z.toFixed(4);
                  let j=map[key];if(j===undefined){j=v.length;v.push([x,y,z]);map[key]=j;}
                  tri.push(j);
                }
                t.push(tri);
              }
            }
          }catch(e){}
          try{loc.delete();}catch(e){}
          ex.Next();
        }
        try{ex.delete();}catch(e){}
        if(!v.length||!t.length)return null;
        return {v:v,t:t};
      }catch(e){return null;}
    };
    const am=faoActiveMesh(setup);
    if(!am)return {err:'PAS DE MESH'};
    const mesh=am.mesh,B=am.box;
    const mv=faoGenRough3D(mesh,B,50,20,{toolD:25,secu:65,ap:5,ae:6,radial:0.5,axial:0.5,entry:'auto',minipasses:4,brutTop:60});
    faoSliceCache={mesh:mesh,map:{}};
    const zt=50,aeA=6,TOL=0.5;
    function rOf(z){
      // Retour 6/10 (A3) : mini-passes à marge ENTière (s = radial) — même
      // r que le parent (D/2 + radial = 13) à tous les niveaux, plus de
      // décroissance (nb-k)/nb qui laissait le contour collé à la cote.
      return 13;
    }
    function bound(z,r,planes,sign){
      const top=zt;
      function ivsAt(t){return faoShadowIntervals(mesh,B,t,z,top,r,aeA,planes);}
      function clean(t){const ivs=ivsAt(t);if(!ivs.length)return false;return faoYCands(mesh,planes,z,top,t,r,ivs).length===0;}
      let yy=null;
      for(let k=0;k<100000;k++){
        const y=B.y0-r+k*aeA;
        if(y>B.y1+r+1e-9)break;
        if(y+r<=B.y0+1e-9||y-r>=B.y1-1e-9)continue;
        if(sign<0?y>=0:y<=0)continue;
        const ivs=ivsAt(y);
        if(!ivs.length)continue;
        if(!faoYCands(mesh,planes,z,top,y,r,ivs).length)continue;
        yy=y;break;
      }
      if(yy===null)return null;
      if(sign<0){
        let Lo=yy,Hi=null;
        for(let k=1;k<100000;k++){
          const y=yy+k*aeA;
          if(y>B.y1+r+1e-9)break;
          if(clean(y)){Hi=y;break;}
          Lo=y;
        }
        if(Hi===null)return {yy:yy,t:null};
        for(let i=0;i<30;i++){const m=(Lo+Hi)/2;if(clean(m))Hi=m;else Lo=m;}
        return {yy:yy,t:Hi};
      }
      let Hi=yy,Lo=null;
      for(let k=1;k<100000;k++){
        const y=yy-k*aeA;
        if(y<B.y0-r-1e-9)break;
        if(clean(y)){Lo=y;break;}
        Hi=y;
      }
      if(Lo===null)return {yy:yy,t:null};
      for(let i=0;i<30;i++){const m=(Lo+Hi)/2;if(clean(m))Lo=m;else Hi=m;}
      return {yy:yy,t:Lo};
    }
    const cutsByZ={};
    mv.forEach(function(m){if(m.r)return;const k=Math.round(m.z*1000)/1000;
      (cutsByZ[k]=cutsByZ[k]||[]).push(m.y);});
    const rows=[];
    const ZL=[49,48,47,46,45,44,43,42,41,40,39,38,37,36,35,34,33,32,31,30,29,28,27,26,25,24.1,23.2,22.3,21.4,20.5];
    for(const z of ZL){
      const cuts=cutsByZ[Math.round(z*1000)/1000]||[];
      const r=rOf(z);
      const planes=faoShadowPlanes(mesh,z,Math.max(zt,60));
      const sl=bound(z,r,planes,-1),sh=bound(z,r,planes,1);
      let mn=null,mx=null;
      cuts.forEach(function(y){if(mn===null||y<mn)mn=y;if(mx===null||y>mx)mx=y;});
      rows.push({z:z,
        tLo:sl?sl.t:null,mn:mn,
        gLo:(sl&&sl.t!==null&&mn!==null)?Math.round((mn-sl.t)*1000)/1000:null,
        tHi:sh?sh.t:null,mx:mx,
        gHi:(sh&&sh.t!==null&&mx!==null)?Math.round((sh.t-mx)*1000)/1000:null});
    }
    return {mv:mv.length,rows:rows};
  })()`,ctx);
  if(out&&out.err){console.log('  ✗ '+out.err);process.exit(1);}
  A(out.mv>1000,'cavité usinage : '+out.mv+' moves générés');
  A(out.rows.length===30,'30 niveaux évalués, vu '+out.rows.length);
  const nul=out.rows.filter(R=>R.gLo===null||R.gHi===null).length;
  A(nul===0,'60 bornes atteintes par bissection, '+nul+' côté(s) inatteignable(s)');
  for(const R of out.rows){
    // Retour 6/10 : aussi le GOUGE (borne franchie vers la matière, g < 0)
    // — distance perpendiculaire exacte, plus jamais r·cosθ ni recul d'aeA.
    const okLo=R.gLo!==null&&R.gLo<=0.5&&R.gLo>=-0.1;
    const okHi=R.gHi!==null&&R.gHi<=0.5&&R.gHi>=-0.1;
    A(okLo&&okHi,
      'z='+R.z+' bornes : bas coupe '+(R.mn===null?'absente':R.mn)+
      ' vs borne '+(R.tLo===null?'inatteignable':R.tLo)+' (écart '+R.gLo+')'+
      ' — haut coupe '+(R.mx===null?'absente':R.mx)+
      ' vs borne '+(R.tHi===null?'inatteignable':R.tHi)+' (écart '+R.gHi+')'+
      (okLo?'':' [BAS MANQUANT/TROP LOIN/GOUGE]')+(okHi?'':' [HAUT MANQUANT/TROP LOIN/GOUGE]'));
  }
  console.log(ko?('  '+ko+' échec(s)'):'  bornage murs : bornes atteintes partout');
  process.exit(ko?1:0);
})().catch(e=>{console.error('  ✗ ECHEC',String((e&&e.stack)||e).slice(0,2000));process.exit(1);});
