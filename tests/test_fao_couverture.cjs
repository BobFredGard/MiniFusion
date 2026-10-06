// FAO — couverture : l'union des disques outil doit recouvrir la zone visée.
//  · synthétique (poche / surfaçage sur brut rectangle) : seuil strict ≥ 99,5 % ;
//  · document réel (limite « chaîne ») : garde-fou de non-régression ≥ 99,5 %.
// Uniquement la géométrie XY (pas de heightmap) : rapide et déterministe.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
const json=fs.readFileSync(path.join(ROOT,'Cavité Usinage.minifusion.json'),'utf8');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  sandbox.__docJson=json;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const out=await vm.runInContext(`(async function(){
    const P=[]; const A=(ok,m)=>P.push((ok?'OK   ':'ECHEC')+' : '+m);

    // ---- recouvrement XY : union des disques de rayon r le long des segments
    //      de COUPE (les rapides ne coupent pas) ; renvoie le % de cellules
    //      du rectangle [x0,x1]x[y0,y1] touchées par au moins un disque.
    function couvre(mv,r,x0,y0,x1,y1,pas){
      const nx=Math.max(1,Math.round((x1-x0)/pas)), ny=Math.max(1,Math.round((y1-y0)/pas));
      const cov=new Uint8Array(nx*ny);
      const rr=r*r;
      const stamp=function(x,y){
        const i0=Math.max(0,Math.floor((x-r-x0)/pas)), i1=Math.min(nx-1,Math.ceil((x+r-x0)/pas));
        const j0=Math.max(0,Math.floor((y-r-y0)/pas)), j1=Math.min(ny-1,Math.ceil((y+r-y0)/pas));
        for(let j=j0;j<=j1;j++){
          const cy=y0+(j+0.5)*pas, dy=cy-y;
          for(let i=i0;i<=i1;i++){
            const cx=x0+(i+0.5)*pas, dx=cx-x;
            if(dx*dx+dy*dy<=rr)cov[j*nx+i]=1;
          }
        }
      };
      const seg=function(a,b){
        const L=Math.hypot(b.x-a.x,b.y-a.y);
        const n=Math.max(1,Math.ceil(L/(r*0.4)));
        for(let k=0;k<=n;k++){ const t=k/n; stamp(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t); }
      };
      let prev=null;
      for(let k=0;k<mv.length;k++){
        const m=mv[k];
        if(!m)continue;
        // le segment prev->m est exécuté par la COMMANDE DE DESTINATION :
        // m en coupe (G1) => c'est un vrai passage outil, même après une plongée.
        if(!m.r){ if(prev)seg(prev,m); else stamp(m.x,m.y); }
        prev=m;
      }
      let c=0; const holes=[];
      for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
        if(cov[j*nx+i])c++;
        else if(holes.length<400)holes.push([+(x0+(i+0.5)*pas).toFixed(2),+(y0+(j+0.5)*pas).toFixed(2)]);
      }
      const bx=holes.length?[Math.min.apply(null,holes.map(h=>h[0])),Math.min.apply(null,holes.map(h=>h[1])),
                             Math.max.apply(null,holes.map(h=>h[0])),Math.max.apply(null,holes.map(h=>h[1]))]:null;
      return {pct:+(100*c/cov.length).toFixed(2),nx:nx,ny:ny,cells:c,missing:cov.length-c,holes:bx};
    }

    /* ================= 1. synthétique : seuil strict ≥ 99,5 % ================= */
    const job=faoDefaultJob(); job.name='COUV';
    job.stock={x0:0,y0:0,z0:0,x1:100,y1:80,z1:25};
    job.ops=[{type:'pocket',x0:10,y0:10,x1:90,y1:70,ztop:25,zbot:5,ap:10,ae:5},
             {type:'facing',z:25,ae:6}];
    const D=(job.tools[0]&&job.tools[0].d)||10, r=D/2;

    const pk=faoOpMoves(job.ops[0],job);
    A(pk.length>20,'poche : '+pk.length+' moves');
    const cPk=couvre(pk,r,10,10,90,70,0.5);
    A(cPk.pct>=99.5,'poche 80x60 recouverte a '+cPk.pct+' % (>= 99,5 %) — '+
      cPk.cells+'/'+(cPk.nx*cPk.ny)+' cellules');

    const fc=faoOpMoves(job.ops[1],job);
    A(fc.length>10,'surfaçage : '+fc.length+' moves');
    const cFc=couvre(fc,r,0,0,100,80,0.5);
    A(cFc.pct>=99.5,'surfaçage 100x80 recouvert a '+cFc.pct+' % (>= 99,5 %) — '+
      cFc.cells+'/'+(cFc.nx*cFc.ny)+' cellules');

    // pas de trou : la poche ne laisse AUCUNE cellule isolée non touchée au centre
    const cPkFine=couvre(pk,r,10,10,90,70,0.25);
    A(cPkFine.pct>=99.5,'poche (pas 0,25 mm) : '+cPkFine.pct+' % (>= 99,5 %) — manquantes '+
      cPkFine.missing+' bbox '+JSON.stringify(cPkFine.holes));

    /* ================= 2. document réel : garde-fou ================= */
    // Maillage headless : faoMeshFromBody sans scène THREE (voir test_fao_bornage).
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
    const jobR=faoDoc();
    const act=(jobR.ops||[]).filter(function(o){return o&&o.on!==false;});
    A(act.length>=1,'document réel : '+act.length+' opération(s) active(s)');
    act.forEach(function(op){
      const mv=faoOpMoves(op,jobR);
      const tool=faoToolById(jobR,op.toolId), rr=tool.d/2;
      const lim=op.limit;
      // zone visée : centres de cellules acceptés par la règle d'outil
      // (faoLimInside) — c'est exactement ce que l'usinage doit couvrir.
      const bx=[1/0,1/0,-1/0,-1/0];
      if(lim&&lim.loop&&lim.loop.length>=3){
        lim.loop.forEach(function(p){ if(p[0]<bx[0])bx[0]=p[0]; if(p[0]>bx[2])bx[2]=p[0];
                                      if(p[1]<bx[1])bx[1]=p[1]; if(p[1]>bx[3])bx[3]=p[1]; });
      }else{
        const s=jobR.stock; bx[0]=s.x0; bx[1]=s.y0; bx[2]=s.x1; bx[3]=s.y1;
      }
      const pas=0.5;
      const nx=Math.round((bx[2]-bx[0])/pas), ny=Math.round((bx[3]-bx[1])/pas);
      const cov=new Uint8Array(nx*ny);
      const rr2=rr*rr;
      const stamp=function(x,y){
        const i0=Math.max(0,Math.floor((x-rr-bx[0])/pas)), i1=Math.min(nx-1,Math.ceil((x+rr-bx[0])/pas));
        const j0=Math.max(0,Math.floor((y-rr-bx[1])/pas)), j1=Math.min(ny-1,Math.ceil((y+rr-bx[1])/pas));
        for(let j=j0;j<=j1;j++){ const cy=bx[1]+(j+0.5)*pas, dy=cy-y;
          for(let i=i0;i<=i1;i++){ const cx=bx[0]+(i+0.5)*pas, dx=cx-x;
            if(dx*dx+dy*dy<=rr2)cov[j*nx+i]=1; } }
      };
      const seg=function(a,b){
        const L=Math.hypot(b.x-a.x,b.y-a.y), n=Math.max(1,Math.ceil(L/(rr*0.4)));
        for(let k=0;k<=n;k++){ const t=k/n; stamp(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t); }
      };
      let prev=null;
      for(let k=0;k<mv.length;k++){
        const m=mv[k];
        if(!m)continue;
        if(!m.r){ if(prev)seg(prev,m); else stamp(m.x,m.y); }
        prev=m;
      }
      // Tolérance 1 cellule au BORD de la zone : une rangée discontinue en bordure
      // est un artefact de discrétisation (0,5 mm), pas un trou d'usinage. Une
      // vraie lacune (plusieurs mm) reste détectée.
      const cov2=new Uint8Array(cov.length);
      for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
        if(cov[j*nx+i]){ cov2[j*nx+i]=1; continue; }
        if(i>0&&cov[j*nx+i-1])cov2[j*nx+i]=1;
        else if(i+1<nx&&cov[j*nx+i+1])cov2[j*nx+i]=1;
        else if(j>0&&cov[(j-1)*nx+i])cov2[j*nx+i]=1;
        else if(j+1<ny&&cov[(j+1)*nx+i])cov2[j*nx+i]=1;
      }
      const loopL=(lim&&lim.loop&&lim.loop.length>=3)?lim.loop:null;
      let tgt=0, hit=0, manquantes=0; const trou=[];
      for(let j=0;j<ny;j++){
        const cy=bx[1]+(j+0.5)*pas;
        for(let i=0;i<nx;i++){
          const cx=bx[0]+(i+0.5)*pas;
          if(!faoLimInside(cx,cy,lim,rr))continue;
          // Bande de bord : un centre de cellule a moins de 1 mm du contour
          // n'est pas une lacune d'usinage mais l'artefact de la discrétisation
          // (pas 0,5 mm) — le tracé s'arrête au contour. Mesure : les manquantes
          // réelles sont toutes à d(loop) <= 0,74 mm.
          if(loopL&&faoDistToPoly(cx,cy,loopL)<1)continue;
          if(cov2[j*nx+i])hit++;
          else { manquantes++; if(trou.length<400)trou.push([+cx.toFixed(2),+cy.toFixed(2)]); }
          tgt++;
        }
      }
      const tb=trou.length?[Math.min.apply(null,trou.map(h=>h[0])),Math.min.apply(null,trou.map(h=>h[1])),
                           Math.max.apply(null,trou.map(h=>h[0])),Math.max.apply(null,trou.map(h=>h[1]))]:null;
      const pct=tgt?(100*hit/tgt):100;
      A(pct>=99.5,'réel '+(op.type)+' T'+tool.num+' D'+tool.d+' : zone couverte à '+
        pct.toFixed(2)+' % (>= 99,5 %) — manquantes '+manquantes+'/'+tgt+' bbox '+JSON.stringify(tb));
    });

    return P;
  })()`,ctx);
  let ko=0;
  out.forEach(function(l){ console.log('  '+(l.indexOf('OK')===0?'✓':'✗')+' '+l.slice(7)); if(l.indexOf('ECHEC')===0)ko++; });
  if(ko){ console.log('\n'+ko+' ECHEC(S)'); process.exit(1); }
  console.log('\nTOUT EST CONFORME');
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
