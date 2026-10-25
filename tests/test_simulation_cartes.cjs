// V0.7.8 : simulation — une carte de hauteurs par orientation d'outil (3+2), rendu par lancer de rayons.
// Palier 2 de la qualité de simulation : plus de voxels ni de complément en escalier pour les cavités
// latérales ; chaque opération inclinée taille dans la carte de son orientation comme à la verticale.
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
const {ctx}=loadApp();
const R=String.raw`
  const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};
  const near=(a,b,e)=>Math.abs(a-b)<(e||1e-6);
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  // 1. orientations distinctes du parcours
  const pts=[{x:0,y:0,z:0},{x:1,y:0,z:0,ax:[0,-1,0]},{x:2,y:0,z:0,ax:[0,-1,0]},{x:3,y:0,z:0,ax:[1,0,0]},{x:4,y:0,z:0,ax:[0,-1.0004,0]}];
  const axes=faoMapsAxes(pts);
  A(axes.length===2&&axes[0][1]===-1&&axes[1][0]===1,'1 : deux orientations distinctes (−Y, +X), la quasi-identique fusionnée');
  // 2. repère d'une carte : orthonormé direct, A = axe donné
  {const F=faoMapFrame([0,-1,0]);
   A(near(dot(F.U,F.V),0)&&near(dot(F.U,F.A),0)&&near(dot(F.V,F.A),0)&&near(Math.hypot(...F.U),1)&&near(Math.hypot(...F.V),1)&&F.A[1]===-1,'2 : repère (U, V, A) orthonormé, A = −Y');
   const c=[F.U[1]*F.V[2]-F.U[2]*F.V[1],F.U[2]*F.V[0]-F.U[0]*F.V[2],F.U[0]*F.V[1]-F.U[1]*F.V[0]];A(near(c[0],F.A[0])&&near(c[1],F.A[1])&&near(c[2],F.A[2]),'3 : U × V = A (repère direct)');}
  // 3. carte d'une orientation : couvre la boîte du brut projetée, hauteur initiale = bord le plus loin le long de A
  const g=faoMatterGrid({x0:0,y0:0,z0:0,x1:100,y1:60,z1:30},0.5);
  faoMapsInit(g,[[0,-1,0]]);
  const m=g.maps.list[0];
  A(g.maps.list.length===1&&m.key==='0,-1,0'&&m.pas===g.pas&&m.nz===1,'4 : une carte −Y rattachée à la grille, même maille ('+g.pas+' mm), sans couches');
  {let ok=true;[[0,0,0],[100,60,30],[0,60,0],[100,0,30]].forEach(p=>{const u=dot(p,m.U),v=dot(p,m.V),w=dot(p,m.A);
     if(u<m.ox-1e-9||u>m.sx1+1e-9||v<m.oy-1e-9||v>m.sy1+1e-9||w<m.oz-1e-9||w>m.sz1+1e-9)ok=false;});
   A(ok&&near(m.oz,-60)&&near(m.sz1,0)&&m.h[0]===0,'5 : la carte couvre les coins de la boîte ; w de −60 (face Y60) à 0 (face Y0), hauteur initiale 0 = la face Y0');}
  // 4. taille d'un outil horizontal (−Y) : trou Ø5 à X50 Z15 jusqu'à Y15 → la carte descend à w = −15 au centre, rien ailleurs
  const k=faoMatterCarveAx(g,{x:50,y:-5,z:15},{x:50,y:15,z:15},2.5,[0,-1,0],null,0,null);
  const cell=(x,z)=>{const u=x*m.U[0]+z*m.U[2],v=x*m.V[0]+z*m.V[2];return Math.floor((v-m.oy)/m.pas)*m.nx+Math.floor((u-m.ox)/m.pas);};
  A(Array.isArray(k)&&k.length===0&&m.dirty===true,'6 : aucun voxel tué, carte marquée à renvoyer');
  A(near(m.h[cell(50,15)],-15,1e-6)&&near(m.h[cell(52,15)],-15,1e-6)&&m.h[cell(54,15)]===0&&m.h[cell(50,20)]===0,'7 : au centre et à 2 mm de l’axe : w = −15 (fond du trou à Y15) ; hors du Ø5 : la face Y0 intacte');
  let low=0;for(let c=0;c<g.nx*g.ny;c++)if(g.h[c]<30-1e-6)low++;
  A(low===0,'8 : la carte du posage (dessus) est intacte : aucune cheminée');
  {const c=cell(50,15),n=[m.nrm[c*4],m.nrm[c*4+1],m.nrm[c*4+2]];A(near(n[2],1),'9 : normale du fond dans la carte = (0,0,1) de la carte, soit −Y du posage (vers l’outil)');}
  // 5. une carte par orientation, 3 au plus (4 échantillonneurs avec le posage)
  {const g2=faoMatterGrid({x0:0,y0:0,z0:0,x1:10,y1:10,z1:10},1);faoMapsInit(g2,[[1,0,0],[0,1,0],[-1,0,0],[0,-1,0]]);
   A(g2.maps.list.length===3&&FAO_RM_MAX===4,'10 : au plus 3 cartes d’orientation (+ celle du posage)');
   g2.maps.list.forEach(q=>{q.dirty=false;});
   A(faoMatterCarveAx(g2,{x:5,y:5,z:5},{x:6,y:5,z:5},1,[0,-1,0],null,0,null).length===0&&!faoMapsDirty(g2),'11 : orientation sans carte : rien n’est taillé, rien à renvoyer');}
  // 6. taille par le rattrapage : les points inclinés vont dans leur carte quand elle existe
  {const g3=faoMatterGrid({x0:0,y0:0,z0:0,x1:100,y1:60,z1:30},0.5);faoMapsInit(g3,[[0,-1,0]]);
   const P=[{x:50,y:-5,z:15,r:1},{x:50,y:15,z:15,ax:[0,-1,0]}],dd=[5,5],times=[0,1];
   const ks=faoMatterCarveTo(g3,P,dd,times,10,[],null,null);
   let low3=0;for(let c=0;c<g3.nx*g3.ny;c++)if(g3.h[c]<30-1e-6)low3++;
   A(ks.length===0&&low3===0&&g3.maps.list[0].dirty&&near(g3.maps.list[0].h[cell(50,15)],-15),'12 : rattrapage — segment incliné taillé dans sa carte (dessus intact, carte à renvoyer)');}
  // 7. shader et branchements
  A(/rmInside\(/.test(FAO_RM_FS)&&/gl_FragDepth/.test(String(faoMatterRmMat))&&/rmSmooth>0\.5/.test(FAO_RM_FS)&&/texelFetch\(rmH3/.test(FAO_RM_FS),
    '13 : shader : intersection des cartes, profondeur écrite, lissage bilinéaire, 4 cartes');
  A(/g\.maps\?faoMatterCarveAx/.test(String(faoMatterCarveTo))&&/g\.maps\?faoMatterCarveAx/.test(String(faoMatterCarveRange)),'14 : rattrapage et pas-à-pas passent par les cartes');
  A(faoMatterRmSupported()===false,'15 : sans WebGL2 : pas de lancer de rayons (voxels et complément comme avant)');
  return out;
`;
(async()=>{
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== Simulation : cartes par orientation (3+2) et lancer de rayons ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
