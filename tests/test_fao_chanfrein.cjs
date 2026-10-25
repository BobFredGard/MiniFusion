// V0.7.9 : opération CHANFREIN — « transformer la Poche en opération à chanfreiner ».
// Chaîne d'arêtes du haut, largeur, décalage de pointe ; fraise à chanfreiner (angle, Ø de pointe)
// ou foret à pointer. Géométrie, parcours, ruban, fiche, outil, simulation de la matière taillée.
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
const {ctx}=loadApp();
const R=String.raw`
  const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};
  const near=(a,b,e)=>Math.abs(a-b)<(e||1e-6);
  const s=faoDefaultSetup();s.stock={x0:-5,y0:-5,z0:0,x1:105,y1:65,z1:30};s.stockSrc='manual';
  faoRoot().setups=[s];faoRoot().activeSetupId=s.id;s.ops=[];
  // 1. ruban : la Poche cède sa place au Chanfrein ; les poches restent créables par script
  const spec=faoAddOpsSpec();
  A(spec.length===7&&spec[1][0]==='chamfer'&&!spec.some(a=>a[0]==='pocket'),'1 : barre « + » : Chanfrein à la place de Poche (7 usinages)');
  A(faoOpDefaults('pocket')&&faoOpDefaults('pocket').type==='pocket','2 : une Poche reste lisible et créable (anciens fichiers)');
  // 2. outil : fraise à chanfreiner
  const op=faoOpDefaults('chamfer');
  A(op&&op.type==='chamfer'&&op.w===0.5&&op.tipOff===0.3&&op.limit&&op.limit.mode==='chain'&&faoMeshOp(op),'3 : défauts — largeur 0,5, décalage de pointe 0,3, chaîne d’arêtes, calculée sur le maillage');
  s.ops.push(op);
  const t=faoChamferToolMake(s,op);
  A(t.kind==='chamfer'&&t.ang===90&&t.dt===0.5&&op.toolId===t.id&&faoKindLabel('chamfer')==='Fraise à chanfreiner','4 : « Créer une fraise à chanfreiner » : Ø6 90° pointe Ø0,5, affectée');
  const tp=faoToolTipProfile(t);
  A(tp.length===3&&near(tp[1][0],0.25)&&near(tp[1][1],0)&&near(tp[2][0],3)&&near(tp[2][1],2.75),'5 : profil de pointe : méplat Ø0,5 puis cône 45° jusqu’au Ø6 ('+JSON.stringify(tp)+')');
  // 3. géométrie : largeur 1, décalage 0,3, arête à Z30
  op.z=30;op.w=1;op.tipOff=0.3;
  const G=faoChamferGeom(op,t);
  A(G&&near(G.b,1)&&near(G.d,0.55)&&near(G.zTip,28.7)&&near(G.rho,1.55)&&G.ok,'6 : 90° : jambe paroi 1, axe à 0,55 de l’arête (0,25 + 0,3), pointe à Z28,7, contact haut Ø3,1 ≤ Ø6');
  {const t60=Object.assign({},t,{ang:60});const G2=faoChamferGeom(op,t60);
   A(near(G2.b,1/Math.tan(Math.PI/6),1e-9),'7 : 60° : jambe paroi = largeur / tan 30° = '+G2.b.toFixed(3));}
  {const big=Object.assign({},op,{w:4});A(faoChamferGeom(big,t).ok===false&&/trop petit/.test(faoChamferGeom(big,t).warn),'8 : largeur 4 avec un Ø6 : outil trop petit signalé');}
  {const spot={kind:'spot',d:10,ang:90};const G3=faoChamferGeom(op,spot);A(near(G3.d,0.3)&&near(G3.rt,0),'9 : foret à pointer 90° : pointe vive, axe à 0,3 (= décalage × tan 45°)');}
  A(faoChamferGeom(op,{kind:'flat',d:10})===null,'10 : fraise cylindrique : pas de géométrie (fiche ⚠ + bouton de création)');
  // 4. parcours : bossage rectangulaire 100 × 60, arêtes du haut à Z30, outil à l'extérieur
  op.limit={mode:'chain',loop:[[0,0],[100,0],[100,60],[0,60],[0,0]],closed:true,nEdges:4,tangent:true,side:'center',extra:0};
  op.cside='ext';op.stale=false;
  const mv=faoOpMoves(op,s)||[];
  const cut=mv.filter(m=>m&&!m.r&&!m.ent&&isFinite(+m.x));
  const dEdge=m=>Math.min(Math.abs(m.x-0),Math.abs(m.x-100),Math.abs(m.y-0),Math.abs(m.y-60));
  const outside=m=>m.x<0||m.x>100||m.y<0||m.y>60;
  A(cut.length>4&&cut.every(m=>near(m.z,28.7,1e-3)),'11 : passe unique à la cote de pointe Z28,7 ('+cut.length+' points)');
  A(cut.filter(m=>m.x>2&&m.x<98||m.y>2&&m.y<58).every(m=>outside(m)&&near(dEdge(m),0.55,1e-3)),'12 : sur les côtés droits, axe à 0,55 mm À L’EXTÉRIEUR des arêtes');
  A(/Chanfrein 4 arêtes 1 mm/.test(faoOpLabel(op,s)),'13 : libellé G-code « '+faoOpLabel(op,s)+' »');
  // 5. arête d'alésage (côté intérieur) : cercle R5 au centre
  {const o2=Object.assign(faoOpDefaults('chamfer'),{toolId:t.id,z:30,w:1,tipOff:0.3,cside:'int'});
   const L=[];for(let k=0;k<=72;k++){const a=k/72*2*Math.PI;L.push([50+5*Math.cos(a),30+5*Math.sin(a)]);}
   o2.limit={mode:'chain',loop:L,closed:true,nEdges:1,tangent:true,side:'center',extra:0};s.ops.push(o2);
   const c2=(faoOpMoves(o2,s)||[]).filter(m=>m&&!m.r&&!m.ent&&isFinite(+m.x));
   const rr=c2.map(m=>Math.hypot(m.x-50,m.y-30));
   A(c2.length>10&&rr.every(r=>near(r,4.45,0.02)),'14 : bord de trou R5 : axe sur R4,45 (à l’intérieur), '+c2.length+' points');}
  // 6. simulation : la matière taillée a bien un chanfrein de 1 × 1 à 45°
  {const g=faoMatterGrid({x0:90,y0:20,z0:20,x1:105,y1:40,z1:30},0.1);
   // matière = bossage jusqu'à X100 : la partie X>100 vidée d'abord (paroi verticale)
   for(let iy=0;iy<g.ny;iy++)for(let ix=0;ix<g.nx;ix++){const x=g.ox+(ix+0.5)*g.pas;if(x>100)g.h[iy*g.nx+ix]=20;}
   const tpc=faoToolTipProfile(t);
   faoMatterCarveSeg(g,100.55,20,28.7,100.55,40,28.7,3,null,0,tpc);
   const iy=Math.floor((30-g.oy)/g.pas);const H=x=>g.h[iy*g.nx+Math.floor((x-g.ox)/g.pas)];
   const e05=H(99.55),e09=H(99.15),e12=H(98.85);
   // chanfrein 45° de 1 mm : à s mm de l'arête, Z = 29 + s
   A(near(e05,29.45,0.08)&&near(e09,29.85,0.08)&&near(e12,30,1e-6),'15 : simulation : à 0,45 et 0,85 mm de l’arête, Z '+e05.toFixed(2)+' et '+e09.toFixed(2)+' (attendu 29,45 et 29,85 : chanfrein 45° de 1 mm), à 1,15 mm le dessus est intact');}
  // 7. fiche, saisie, rafraîchissement
  A(/faoChamferRows\(d,setup,op\)/.test(String(faoOpCardElement))&&/op\.type==='chamfer'/.test(String(faoChainOk)),'16 : fiche Chanfrein branchée ; la validation de chaîne prend la cote de l’arête');
  A(faoZoneCtx(op,s)===null,'17 : pas de zone (ses arêtes sont son profil) : rien n’est rogné');
  return out;
`;
(async()=>{
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== FAO : opération Chanfrein ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
