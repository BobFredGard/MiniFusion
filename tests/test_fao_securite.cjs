// 2026-10-06 « FAO plan de sécurité » — aucun rapide ne translate en Z bas
// Le parcours doit REMONTR sur un plan placé 100 mm au-dessus de la pièce avant
// de se déplacer vers le prochain usinage : retrait sur place -> translation au
// plan -> plongée. Toute translation XY en G0 sous le plan traverse la matière.
// Contrat vérifié ici sur (1) la séquence partagée aperçu/visionneuse/post,
// (2) le G-code réellement émis, (3) le champ UI.
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
    const R=[];
    const A=function(c,m){ R.push([!!c,m]); };
    const NL=String.fromCharCode(10);

    // ---- 1. valeur du plan ----
    const s1={stock:{x0:0,y0:0,z0:0,x1:100,y1:80,z1:25}};
    A(faoSafeZ(s1)===125,'plan auto = dessus brut (25) + 100 = 125 ('+faoSafeZ(s1)+')');
    s1.safeZ=90;
    A(faoSafeZ(s1)===90,'plan réglable setup.safeZ = 90');
    delete s1.safeZ;

    // ---- 2. séquence du document réel : invariant XY/rapide ----
    await deserialise(__docJson,{rebuild:false});
    occCkClear();markDirty();await rebuild();
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
    const job=faoDoc();
    const safe=faoSafeZ(job);
    A(safe===160,'document réel : plan = '+(job.stock?job.stock.z1:'?')+' + 100 = '+safe);
    const seq=faoSeqSafe(job);
    let viol=0, nTravel=0, maxLow=-1e9, nPlan=0;
    for(let i=0;i<seq.length;i++){
      const mv=seq[i].moves;
      let prev=null;
      for(let k=0;k<mv.length;k++){
        const m=mv[k];
        if(prev){
          const dxy=Math.hypot(m.x-prev.x,m.y-prev.y);
          const rapid=m.r?1:0; // le segment est exécuté par la commande de sa destination
          if(rapid&&dxy>1e-9){
            nTravel++;
            const lo=Math.min(prev.z,m.z);
            if(lo<safe-1e-9){ viol++; if(lo>maxLow)maxLow=lo; }
          }
          if(m.r&&Math.abs(m.z-safe)<1e-9)nPlan++;
        }
        prev=m;
      }
    }
    A(viol===0,'séquence réelle : 0 translation XY rapide sous le plan ('+nTravel+
       ' translations, viol='+viol+(viol?'), plus bas '+maxLow.toFixed(1):'')+')');
    A(nPlan>100,'séquence réelle : le plan est réellement utilisé ('+nPlan+' pts à '+safe+' mm)');
    A(seq.some(function(b){return b.moves.some(function(m){return m.r&&Math.abs(m.z-safe)<1e-9;});}),
       'séquence réelle : au moins une opération passe par le plan');

    // ---- 3. G-code : même invariant, lu dans le programme émis ----
    const J=faoDefaultSetup();
    J.name='SECU'; J.stock={x0:0,y0:0,z0:0,x1:100,y1:80,z1:25};
    J.ops=[
      {id:'a',on:true,toolId:'T1',type:'pocket',x0:10,y0:10,x1:90,y1:70,ztop:25,zbot:5,ap:10,ae:5},
      {id:'b',on:true,toolId:'T1',type:'contour',x0:10,y0:10,x1:90,y1:70,ztop:5,zbot:0,ap:5},
      {id:'c',on:true,toolId:'T2',type:'facing',z:25,ae:6}
    ];
    const OG=faoOriginPoint(J), oz=OG[2];
    const safeM=faoSafeZ(J)-oz; // plan en coordonnées machine
    const code=faoPost(J,'siemens630').code;
    const numAt=function(l,ch){
      const i=l.indexOf(ch); if(i<0)return null;
      let j=i+1, t='';
      if(l.charAt(j)==='-'){ t='-'; j++; }
      while(j<l.length){ const c=l.charAt(j);
        if((c>='0'&&c<='9')||c==='.'){ t+=c; j++; } else break; }
      return (t&&t!=='-')?parseFloat(t):null;
    };
    let px=null,py=null,pz=null, g0=0, gv=0, lo=1e9;
    code.split(NL).forEach(function(line){
      const c0=line.charAt(0), c1=line.charAt(1), c2=line.charAt(2);
      if(c0!=='G'||c1<'0'||c1>'3'||c2!==' ')return; // seules G0..G3 déplacent
      const isG0=(c1==='0');
      const nx=numAt(line,'X'), ny=numAt(line,'Y'), nz=numAt(line,'Z');
      const ax=(nx===null)?px:nx, ay=(ny===null)?py:ny, az=(nz===null)?pz:nz;
      if(isG0&&px!==null&&py!==null&&pz!==null&&ax!==null&&ay!==null&&az!==null){
        const dxy=Math.hypot(ax-px,ay-py);
        if(dxy>1e-9){
          g0++;
          const l=Math.min(pz,az);
          if(l<safeM-1e-9){ gv++; if(l<lo)lo=l; }
        }
      }
      if(ax!==null&&ay!==null&&az!==null){ px=ax; py=ay; pz=az; }
    });
    A(g0>0,'post : '+g0+' translations XY en G0 analysées');
    A(gv===0,'post : 0 translation XY sous le plan '+safeM.toFixed(1)+
       ' (machine) — viol='+gv+(gv?', plus bas '+lo.toFixed(1):''));

    // ---- 4. le retrait initial et le retrait inter-outils sont en Z seul ----
    const firstG0=code.trim().split(NL).filter(function(l){return l.indexOf('G0 ')===0;})[0]||'';
    A(firstG0.indexOf('G0 Z')===0,'post : le 1er G0 est un retrait Z seul ('+firstG0+')');

    // ---- 5. champ UI ----
    const pc=document.createElement('div');
    faoSetupFiche(pc,faoDoc());
    let labZ=null;
    (function w(n){ if(n.children)n.children.forEach(function(ch){
      if(ch.textContent==='Plan Z')labZ=ch; w(ch); }); })(pc);
    A(!!labZ,'fiche posage : champ « Plan Z »');

    return R;
  })()`,ctx);
  out.forEach(function(r){ A(r[0],r[1]); });
  if(ko){ console.log('\n'+ko+' ECHEC(S)'); process.exit(1); }
  console.log('\nTOUT EST CONFORME');
  process.exit(0);
})().catch(e=>{console.error('ERREUR',e);process.exit(1);});
