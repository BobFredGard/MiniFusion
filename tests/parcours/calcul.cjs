// Non-régression des parcours — calcul d'UNE opération (lancé par tests/parcours/run.cjs) :
//   node tests/parcours/calcul.cjs "<fichier .miniFusion>" <id du posage> <id de l'opération>
// Le fichier est rouvert dans MiniFusion (noyau OCCT réel) SANS ses trajectoires
// enregistrées, l'opération est recalculée par faoOpMoves et un résumé chiffré est écrit
// sur la dernière ligne (« RESUME {json} »).
// Maillage FAO : tessellation OCCT du solide exact (BRepMesh, flèche de l'application),
// comme les suites FAO du dépôt — le harnais n'a pas le rendu three.js de la page ; les
// chiffres servent à comparer deux versions du moteur, pas à reproduire l'écran.
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
globalThis.__dirname = path.join(ROOT, 'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'occt', 'opencascade.full.js'), 'utf8'), { filename: 'occt.js' });
const { loadApp } = require('../appvm.cjs');
const [fichier, setupId, opId] = process.argv.slice(2);
(async () => {
  const real = await globalThis.opencascadeFactory({ wasmBinary: fs.readFileSync(path.join(ROOT, 'occt', 'opencascade.wasm.wasm')) });
  const { ctx, sandbox } = loadApp();
  sandbox.__realOcct = real;
  sandbox.btoa = globalThis.btoa; sandbox.atob = globalThis.atob; // sources des imports STEP (base64)
  // THREE du harnais = stub : BufferGeometry minimale (maillage FAO des imports STEP)
  const T0 = sandbox.THREE;
  class BG {
    constructor() { this.attributes = {}; this.userData = {}; this.index = null; }
    setAttribute(n, a) { this.attributes[n] = a; return this; } getAttribute(n) { return this.attributes[n]; }
    setIndex(i) { this.index = i; return this; } computeVertexNormals() {} computeBoundingBox() {} computeBoundingSphere() {} dispose() {}
  }
  class F32 { constructor(a, n) { this.array = Float32Array.from(a); this.itemSize = n; this.count = this.array.length / n; } }
  sandbox.THREE = new Proxy({}, { get(t, k) { if (k === 'BufferGeometry') return BG; if (k === 'Float32BufferAttribute') return F32; return T0[k]; } });
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};window.confirm=function(){return true;};viewUserMoved=true;', ctx);
  const b = JSON.parse(fs.readFileSync(fichier, 'utf8'));
  delete b.moves; // jamais les trajectoires du fichier : tout est recalculé
  sandbox.__doc = JSON.stringify(b);
  sandbox.__ids = [setupId, opId];
  const r = await vm.runInContext(`(async function(){
    await bundleRestore(__doc,{rebuild:false});
    occCkClear();markDirty();rebuild();
    const meshOrig=faoMeshFromBody;
    faoMeshFromBody=function(b,q){
      try{
        if(!b||!b.shape)return meshOrig(b,q);
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
                const tg=tr.Triangle(i);
                let idx=[tg.Value(1),tg.Value(2),tg.Value(3)];
                if(rev)idx=[idx[0],idx[2],idx[1]];
                const tri=[];
                for(const k of idx){
                  const p=tr.Node(k);let x,y,z;
                  if(trsf){const q2=p.Transformed(trsf);x=q2.X();y=q2.Y();z=q2.Z();}else{x=p.X();y=p.Y();z=p.Z();}
                  const key=x.toFixed(4)+','+y.toFixed(4)+','+z.toFixed(4);
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
        if(!v.length||!t.length)return meshOrig(b,q);
        return {v:v,t:t};
      }catch(e){return meshOrig(b,q);}
    };
    try{faoMovesReset();}catch(e){}
    const job=(faoRoot().setups||[]).find(s=>s.id===__ids[0]);
    if(!job)return {err:'posage introuvable'};
    const op=(job.ops||[]).find(o=>o.id===__ids[1]);
    if(!op)return {err:'opération introuvable'};
    op.stale=false;
    const t0=Date.now();
    const mv=faoOpMoves(op,job)||[];
    if(!mv.length)return {err:'parcours vide (géométrie absente ? imports : '+doc.features.filter(f=>f.type==='import').map(f=>f.name+(importGeom.has(f.id)?' chargé':' MANQUANT')).join(', ')+')'};
    const ms=Date.now()-t0;
    // résumé : longueurs (arcs compris), remontées, cotes, longueur à plat par cote
    let coupe=0,rapide=0,nRap=0,remont=0,zMin=1/0,zMax=-1/0;const plat={};
    for(let i=1;i<mv.length;i++){const p=mv[i-1],m=mv[i],d=faoSegLen(p,m);
      if(m.r){rapide+=d;nRap++;if(m.z>p.z+1e-6)remont++;continue;}
      coupe+=d;if(m.z<zMin)zMin=m.z;if(m.z>zMax)zMax=m.z;
      if(!p.r&&Math.abs(m.z-p.z)<1e-6){const k=(Math.round(m.z*1000)/1000).toFixed(3);plat[k]=(plat[k]||0)+d;}}
    const niveaux={};
    Object.keys(plat).filter(k=>plat[k]>=Math.max(20,0.002*coupe)).sort((a,b)=>b-a).forEach(k=>{niveaux[k]=Math.round(plat[k]);});
    const tool=faoToolById(job,op.toolId)||{};
    const f=(op.cut&&+op.cut.f)||0;
    const est=faoEstimate(mv,f||undefined,job.rapide,job.accel);
    return {type:op.type,outil:tool.name||op.toolId||'',ms:ms,
      resume:{n:mv.length,coupe:Math.round(coupe*10)/10,rapide:Math.round(rapide*10)/10,nRap:nRap,remontees:remont,
        zMin:isFinite(zMin)?Math.round(zMin*1000)/1000:null,zMax:isFinite(zMax)?Math.round(zMax*1000)/1000:null,
        minutes:Math.round(est.tmin*100)/100,niveaux:niveaux}};
  })()`, ctx);
  console.log('RESUME ' + JSON.stringify(r));
  process.exit(r && r.err ? 1 : 0);
})().catch(e => { console.log('RESUME ' + JSON.stringify({ err: String((e && e.stack) || e).slice(0, 1500) })); process.exit(1); });
