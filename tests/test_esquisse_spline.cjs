// 2026-10-29 : spline d'esquisse par points de passage (lot 1) — B-spline cubique exacte, poignées de
// tangence, tangence à une ligne / un arc / une autre spline, profils fermés, arête EXACTE au noyau OCCT.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};window.confirm=function(){return true;};',ctx);
  const R=[
"const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};",
"const f=v=>(+v).toExponential(1);",
"const mk=(id,pts,ents,cons)=>({id,name:id,plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:Object.assign({O:{x:0,y:0}},JSON.parse(JSON.stringify(pts))),",
"  entities:JSON.parse(JSON.stringify(ents)),constraints:JSON.parse(JSON.stringify(cons||[])),dims:[],seq:500,visible:false});",
"const mount=sk=>{ensureSketchBasis(sk);doc.sketches=[sk];doc.features=[];openSketch(sk.id);return skEdit;};",
"const area=pl=>{let s=0;for(let i=0;i<pl.length;i++){const a=pl[i],b=pl[(i+1)%pl.length];s+=a[0]*b[1]-b[0]*a[1];}return Math.abs(s/2);};",
// ── 1. la courbe passe par ses points, sans poignée = 2 DDL par point ──
"{const sk=mount(mk('s1',{a:{x:-30,y:0},b:{x:-10,y:12},c:{x:10,y:-6},d:{x:30,y:4}},[{id:'S',t:'spline',pts:['a','b','c','d']}]));",
" const S=entById(sk,'S'),fit=skSplineFit(sk,S);let mx=0;['a','b','c','d'].forEach((p,k)=>{const c=bsEval(fit,fit.u[k],0)[0];mx=Math.max(mx,Math.hypot(c[0]-sk.points[p].x,c[1]-sk.points[p].y));});",
" A(mx<1e-9,'1 : la courbe passe par ses 4 points (écart '+f(mx)+')');",
" const d0=skDofInfo(sk).dof;A(d0===8,'1 : 4 points libres = 8 DDL ('+d0+')');",
" skPushUndo();const hl=skSplineAddHandle(sk,S,'b');const pl0=skSplinePoly(sk,S,8);cleanupSk(sk);",
" const fit2=skSplineFit(sk,S);let dd=0;for(let t=0;t<=1;t+=0.02){const u=fit.u[3]*t,p=bsEval(fit,u,0)[0],q=bsEval(fit2,u,0)[0];dd=Math.max(dd,Math.hypot(p[0]-q[0],p[1]-q[1]));}",
" A(hl&&hl.construction&&hl.handle==='S'&&dd<1e-9,'1 : poser une poignée ne change pas la courbe (écart '+f(dd)+')');",
" A(skDofInfo(sk).dof===10,'1 : poignée = 2 DDL de plus (direction + tension) ('+skDofInfo(sk).dof+')');",
" drawSketch2D();skSel={kind:'ent',id:'S'};renderSkPanel();drawSketch2D();void pl0;",
" skUndoTrans();A(!skSplineHandleLine(skEdit,entById(skEdit,'S'),'b'),'1 : Ctrl+Z retire la poignée');}",
// ── 2. outil Spline : clics, fin, tangence automatique au bout d'une ligne ──
"{const sk=mount(mk('s2',{p0:{x:-30,y:5},p1:{x:0,y:5}},[{id:'L',t:'line',p1:'p0',p2:'p1'}]));",
" skTool='spline';const ev={detail:1};skSplClick(sk,0,5,ev);skSplClick(sk,20,8,ev);skSplClick(sk,40,5,ev);skSplFinish(false);",
" const S=skEdit.entities.find(e=>e.t==='spline');A(S&&S.pts.length===3&&S.pts[0]==='p1','2 : 3 clics → spline de 3 points partant du bout de la ligne');",
" const c=skEdit.constraints.find(k=>k.type==='stangent');A(c&&c.ent==='L'&&c.p==='p1','2 : bout parti dans le prolongement → tangence posée d’office');",
" const r=c?Math.abs(skStanResid(skEdit,c)):9;A(r<1e-6,'2 : tangence résolue (résidu '+f(r)+' mm)');",
" A(skAudit(skEdit).residual<1e-4,'2 : esquisse résolue (résidu '+f(skAudit(skEdit).residual)+')');",
" const tr=skLoopTrace(skEdit);A(tr.opens.length===2&&!tr.solids.length,'2 : ligne + spline ouvertes = 2 bouts ouverts');}",
// ── 3. tangence à un arc (menu Tangence : spline + arc sélectionnés) ──
"{const sk=mount(mk('s3',{c:{x:0,y:0},a1:{x:10,y:0},a2:{x:0,y:10},q1:{x:18,y:-12},q2:{x:30,y:-4}},",
"   [{id:'Ar',t:'arc',pc:'c',pa:'a1',pb:'a2',r:10},{id:'S',t:'spline',pts:['a1','q1','q2']}]));",
" skSel={kind:'ent',id:'S'};skSelX=[{kind:'ent',id:'Ar'}];applyCon('tangent');",
" const c=skEdit.constraints.find(k=>k.type==='stangent');const r=c?Math.abs(skStanResid(skEdit,c)):9;",
" A(c&&c.ent==='Ar'&&c.p==='a1'&&r<1e-5,'3 : spline tangente à l’arc en son bout (résidu '+f(r)+')');",
" const S=entById(skEdit,'S'),t=skSplineTangent(skEdit,S,'a1'),P=skEdit.points.a1,C=skEdit.points.c,cs=Math.abs((t.x*(P.x-C.x)+t.y*(P.y-C.y))/Math.hypot(P.x-C.x,P.y-C.y));",
" A(cs<1e-5,'3 : tangente de la COURBE ⟂ au rayon (cos '+f(cs)+')');}",
// ── 4. tangence entre deux splines (point commun) : G1 de part et d'autre ──
"{const sk=mount(mk('s4',{a:{x:-40,y:0},b:{x:-20,y:10},j:{x:0,y:0},c:{x:20,y:-14},d:{x:40,y:0}},",
"   [{id:'S1',t:'spline',pts:['a','b','j']},{id:'S2',t:'spline',pts:['j','c','d']}]));",
" skSel={kind:'ent',id:'S1'};skSelX=[{kind:'ent',id:'S2'}];applyCon('tangent');",
" const c=skEdit.constraints.find(k=>k.type==='stangent');const r=c?Math.abs(skStanResid(skEdit,c)):9;",
" const t1=skSplineTangent(skEdit,entById(skEdit,'S1'),'j'),t2=skSplineTangent(skEdit,entById(skEdit,'S2'),'j');",
" A(c&&r<1e-5&&t1&&t2&&t1.x*t2.x+t1.y*t2.y>0.99999,'4 : deux splines tangentes au point commun, même sens ('+(t1&&t2?(t1.x*t2.x+t1.y*t2.y).toFixed(6):'?')+')');",
" const nh=skEdit.entities.filter(e=>e.handle).length;A(nh===2,'4 : une poignée de chaque côté ('+nh+')');",
" skSel={kind:'point',pid:'j'};skSelX=[];deleteSkSel();",
" A(!skEdit.entities.some(e=>e.handle)&&!skEdit.constraints.some(k=>k.type==='stangent'),'4 : point commun supprimé → poignées et tangence retirées');",
" A(entById(skEdit,'S1').pts.length===2&&entById(skEdit,'S2').pts.length===2,'4 : chaque spline garde ses autres points');}",
// ── 5. profils : spline fermée seule ; ligne + spline (forme en D) ──
"const ring={a:{x:20,y:0},b:{x:0,y:12},c:{x:-20,y:0},d:{x:0,y:-12}};",
"{const sk=mk('k5',ring,[{id:'S',t:'spline',pts:['a','b','c','d'],closed:true}]);ensureSketchBasis(sk);",
" const tr=skLoopTrace(sk);A(tr.solids.length===1&&!tr.opens.length,'5 : spline fermée = 1 contour, aucun bout ouvert');",
" const sh=sketchShape(sk);A(sh.shapes.length===1,'5 : forme 3D de repli disponible');}",
"{const sk=mk('k6',{a:{x:0,y:-15},b:{x:12,y:0},c:{x:0,y:15}},[{id:'L',t:'line',p1:'c',p2:'a'},{id:'S',t:'spline',pts:['a','b','c']}]);ensureSketchBasis(sk);",
" const tr=skLoopTrace(sk);A(tr.solids.length===1&&!tr.opens.length,'5 : ligne + spline (D) = 1 contour');}",
// ── 6. noyau : extrusion d'une spline fermée et d'un D — volume = aire de la courbe exacte × hauteur ──
"const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE,FA=occt.TopAbs_ShapeEnum.TopAbs_FACE;",
"const kinds=s=>{const o=[];const x=new occt.TopExp_Explorer_2(s,FA,SH);while(x.More()){o.push(occSurfKind(occt.TopoDS.Face_1(x.Current())));x.Next();}x.delete();return o;};",
"const vol=s=>{const G=new occt.GProp_GProps_1();occt.BRepGProp.VolumeProperties_1(s,G,false,false,false);const v=G.Mass();G.delete();return v;};",
"const ext=(sk)=>{doc.sketches=[sk];doc.features=[];doc.bodies=[];delete doc.activeBody;ensureBodies();",
"  doc.features.push({id:'E',type:'extrude',name:'E',sketchId:sk.id,distance:10,op:'add',visible:true,body:doc.bodies[0].id});markDirty();rebuild();return occLive&&occLive.shape;};",
"{const sk=mk('k7',ring,[{id:'S',t:'spline',pts:['a','b','c','d'],closed:true}]);ensureSketchBasis(sk);",
" const s=ext(sk);const k=s?kinds(s):[];const pl=skSplinePoly(sk,entById(sk,'S'),400),A0=area(pl.slice(0,-1)),v=s?vol(s):0,er=Math.abs(v-10*A0)/(10*A0);",
" A(s&&k.filter(x=>x==='Plane').length===2&&k.length===4,'6 : spline fermée extrudée : 2 plans + 2 faces de la courbe ('+k.join(',')+')');",
" A(er<1e-4,'6 : volume = aire de la courbe × 10 (écart relatif '+f(er)+')');}",
"{const sk=mk('k8',{a:{x:0,y:-15},b:{x:12,y:0},c:{x:0,y:15}},[{id:'L',t:'line',p1:'c',p2:'a'},{id:'S',t:'spline',pts:['a','b','c']}]);ensureSketchBasis(sk);",
" const s=ext(sk);const k=s?kinds(s):[];const pl=skSplinePoly(sk,entById(sk,'S'),400),A0=area(pl),v=s?vol(s):0,er=Math.abs(v-10*A0)/(10*A0);",
" A(s&&k.length===4&&k.filter(x=>x==='Plane').length===3,'6 : D extrudé : 3 plans + la face de la spline ('+k.join(',')+')');",
" A(er<1e-4,'6 : volume du D exact (écart relatif '+f(er)+')');}",
// ── 7. lot 2 : spline par points de contrôle ──
"{const sk=mount(mk('s9',{p0:{x:-30,y:5},p1:{x:0,y:5}},[{id:'L',t:'line',p1:'p0',p2:'p1'}]));",
" skTool='cspline';const ev={detail:1};skSplClick(sk,0,5,ev);skSplClick(sk,15,7,ev);skSplClick(sk,30,30,ev);skSplClick(sk,50,0,ev);skSplFinish(false);",
" const S=skEdit.entities.find(e=>e.t==='spline');A(S&&S.mode==='ctrl'&&S.pts.length===4,'7 : outil points de contrôle → spline de 4 pôles');",
" const F7=skSplineFit(skEdit,S),c0=bsEval(F7,F7.a,0)[0],c1=bsEval(F7,F7.b,0)[0],P0=skEdit.points[S.pts[0]],P3=skEdit.points[S.pts[3]];",
" A(Math.hypot(c0[0]-P0.x,c0[1]-P0.y)<1e-9&&Math.hypot(c1[0]-P3.x,c1[1]-P3.y)<1e-9,'7 : la courbe part du 1er pôle et finit au dernier');",
" const c=skEdit.constraints.find(k=>k.type==='stangent');const r=c?Math.abs(skStanResid(skEdit,c)):9;",
" const Q1=skEdit.points[S.pts[1]];A(c&&r<1e-6&&Math.abs(Q1.y-P0.y)<1e-5,'7 : tangence automatique au bout de la ligne : le 2e pôle s’aligne (résidu '+f(r)+')');",
" A(!skSplineAddHandle(skEdit,S,S.pts[1]),'7 : pas de poignée sur un pôle (la tangente, c’est le polygone)');",
" A(skDofInfo(skEdit).dof>0,'7 : DDL comptés sur les pôles');}",
"{const sk=mk('k10',{a:{x:20,y:0},b:{x:0,y:15},c:{x:-20,y:0},d:{x:0,y:-15}},[{id:'S',t:'spline',mode:'ctrl',pts:['a','b','c','d'],closed:true}]);ensureSketchBasis(sk);",
" const tr=skLoopTrace(sk);A(tr.solids.length===1&&!tr.opens.length,'7 : spline fermée par pôles = 1 contour (nœuds virtuels)');",
" const s=ext(sk);const k=s?kinds(s):[];const pl=skSplinePoly(sk,entById(sk,'S'),400),A0=area(pl.slice(0,-1)),v=s?vol(s):0,er=Math.abs(v-10*A0)/(10*A0);",
" A(s&&k.length===4&&er<1e-4,'7 : extrusion exacte de la spline fermée par pôles ('+k.join(',')+', écart '+f(er)+')');}",
"{const sk=mk('k11',{a:{x:0,y:-15},b:{x:25,y:-15},c:{x:25,y:15},e:{x:0,y:15}},[{id:'L',t:'line',p1:'e',p2:'a'},{id:'S',t:'spline',mode:'ctrl',pts:['a','b','c','e']}]);ensureSketchBasis(sk);",
" const s=ext(sk);A(s&&kinds(s).length===4,'7 : D à pôles extrudé (ligne + spline ouverte)');}",
// ── 8. courbure continue (G2) : spline ↔ arc, spline ↔ ligne ; peigne ──
"{const sk=mount(mk('s12',{c:{x:0,y:0},a1:{x:10,y:0},a2:{x:0,y:10},q1:{x:16,y:-10},q2:{x:30,y:-6}},",
"   [{id:'Ar',t:'arc',pc:'c',pa:'a1',pb:'a2',r:10},{id:'S',t:'spline',pts:['a1','q1','q2']}]));",
" skSel={kind:'ent',id:'S'};skSelX=[{kind:'ent',id:'Ar'}];applyCon('curvature');",
" const S=entById(skEdit,'S'),g=skEdit.constraints.find(k=>k.type==='scurv'),t=skEdit.constraints.find(k=>k.type==='stangent');",
" const cv=skSplineCurvature(skEdit,S,'a1'),Ar=entById(skEdit,'Ar');",
" A(g&&t&&cv&&Math.abs(Math.abs(cv.k)-1/Ar.r)<1e-4,'8 : G2 avec l’arc : |courbure| = 1/R au raccord ('+(cv?Math.abs(cv.k).toFixed(5):'?')+' / '+(1/Ar.r).toFixed(5)+')');",
" A(skAudit(skEdit).residual<1e-3,'8 : esquisse résolue après G2 (résidu '+f(skAudit(skEdit).residual)+')');",
" skComb.add('S');drawSketch2D();const cb=skSplineComb(skEdit,S,60);A(cb&&cb.length===61,'8 : peigne de courbure calculé ('+(cb?cb.length:0)+' dents)');skComb.delete('S');",
" skEdit.constraints=skEdit.constraints.filter(k=>k.type!=='stangent');cleanupSk(skEdit);",
" A(!skEdit.constraints.some(k=>k.type==='scurv'),'8 : tangence retirée → la G2 part avec elle');}",
"{const sk=mount(mk('s13',{p0:{x:-30,y:5},p1:{x:0,y:5},q1:{x:20,y:8},q2:{x:40,y:20}},[{id:'L',t:'line',p1:'p0',p2:'p1'},{id:'S',t:'spline',pts:['p1','q1','q2']}]));",
" skSel={kind:'ent',id:'S'};skSelX=[{kind:'ent',id:'L'}];applyCon('curvature');",
" const cv=skSplineCurvature(skEdit,entById(skEdit,'S'),'p1');A(cv&&Math.abs(cv.k)<1e-4,'8 : G2 avec une ligne : courbure nulle au raccord ('+(cv?f(cv.k):'?')+')');}",
"return out;"
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== Spline d’esquisse (lot 1) ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
