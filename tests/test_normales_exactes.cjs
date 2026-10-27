// V0.11.34 : faces « marbrées ». Les normales d'affichage étaient lissées sur TOUS les triangles
// d'un sommet sous 35° — une face plane bordée de congés tangents prenait leur inclinaison au
// bord (4,7° sur la boîte ci-dessous), étalée par ses longs triangles. occTriPos(…,true) rend
// la normale EXACTE de la surface (BRepGProp_Face) ; occTriNormals ne garde le lissage qu'en
// repli (point singulier). Vraies fonctions occTriPos / occTriNormals / smoothNormals.
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
    'const box=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),40,40,10).Shape();',
    'const fl=new occt.BRepFilletAPI_MakeFillet(box,0);',
    'const ex=new occt.TopExp_Explorer_2(box,occt.TopAbs_ShapeEnum.TopAbs_EDGE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);',
    'for(;ex.More();ex.Next())fl.Add_2(3,occt.TopoDS.Edge_1(ex.Current()));',
    'const sh=fl.Shape(),T=occTriPos(sh,0.1,0.3,true),S=smoothNormals(T.pos,35),N=occTriNormals(T),P=T.pos;',
    'const ang=(n,i,v)=>Math.acos(Math.max(-1,Math.min(1,n[i]*v[0]+n[i+1]*v[1]+n[i+2]*v[2])))*180/Math.PI;',
    'const out={tri:P.length/9,par:T.nrm.length===P.length,plans:[],opp:0,nan:0};',
    'for(let i=0;i<T.nrm.length;i+=3)if(T.nrm[i]!==T.nrm[i])out.nan++;',
    // faces planes : tous leurs sommets sur un même plan d'axe (dessus z=10, dessous z=0, flancs)
    'const AX=[[2,10,[0,0,1]],[2,0,[0,0,-1]],[0,0,[-1,0,0]],[0,40,[1,0,0]],[1,0,[0,-1,0]],[1,40,[0,1,0]]];',
    'for(const g of T.groups){const a=g.start*9,b=(g.start+g.count)*9;',
    '  for(const [c,v,n] of AX){let ok=true;for(let i=a;i<b;i+=3)if(Math.abs(P[i+c]-v)>1e-6){ok=false;break;}',
    '    if(!ok)continue;let ms=0,mn=0;for(let i=a;i<b;i+=3){ms=Math.max(ms,ang(S,i,n));mn=Math.max(mn,ang(N,i,n));}',
    '    out.plans.push({lisse:ms,exact:mn});}}',
    // sens : la normale de chaque sommet du côté de la facette (pas de face retournée)
    'for(let t=0;t<P.length/9;t++){const o=t*9,e1=[P[o+3]-P[o],P[o+4]-P[o+1],P[o+5]-P[o+2]],e2=[P[o+6]-P[o],P[o+7]-P[o+1],P[o+8]-P[o+2]];',
    '  const f=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];',
    '  for(let k=0;k<3;k++)if(f[0]*N[o+k*3]+f[1]*N[o+k*3+1]+f[2]*N[o+k*3+2]<0)out.opp++;}',
    'const T0=occTriPos(sh,0.1,0.3);out.sansN=!("nrm" in T0)&&T0.pos.length===P.length;',
    'return out;'
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+body+'})()',ctx);
  console.log('=== V0.11.34 : normales exactes (boîte 40×40×10, congés R3) ===');
  console.log('  '+r.tri+' triangles, '+r.plans.length+' faces planes, '+r.nan+' nœud(s) singulier(s) en repli');
  A(r.par,'nrm parallèle à pos');
  A(r.sansN,'sans wantN : pas de nrm, mêmes triangles');
  A(r.plans.length===6,'6 faces planes retrouvées');
  const ms=Math.max(...r.plans.map(p=>p.lisse)),mn=Math.max(...r.plans.map(p=>p.exact));
  console.log('  écart max à la normale du plan : lissé '+ms.toFixed(2)+'°, exact '+mn.toFixed(4)+'°');
  A(ms>1,'le lissage seul inclinait les faces planes (cas reproduit)');
  A(mn<0.01,'faces planes : normale constante, celle du plan');
  A(r.opp===0,'aucune normale opposée à sa facette ('+r.opp+')');
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.message)||e).slice(0,800));process.exit(1);});
