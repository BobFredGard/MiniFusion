// V0.11.19 : RÉPÉTITION d'un chanfrein à deux distances et d'une dépouille inversée, vrai noyau.
// La première face d'un chanfrein asymétrique (celle qui porte D1) doit être, sur chaque copie,
// l'IMAGE de celle de la source — pas celle que donnerait la règle « regarde vers le haut, sinon
// +X puis +Y » appliquée en coordonnées monde : sur un plot tourné de 180°, cette règle échangeait
// D1 et D2 (même volume enlevé, faces inversées). Chaque arête mémorise donc la normale de sa
// première face (`fn`), transformée avec la copie.
// Pièce : plaque 160 × 160 × 10 centrée, plot 20 × 20 × 30 en x 30..50, y −10..10.
//   A. chanfrein 2 / 6 de l'arête VERTICALE du coin (50, 10) : D1 = 2 sur le flanc +X (sa largeur
//      en y passe à 18), D2 = 6 sur le flanc +Y (largeur en x → 14). Copies : linéaire, circulaire
//      90° / 180° / 360°, symétrie YZ et XZ — sur chaque copie, le flanc image de +X mesure 18.
//   B. dépouille 5° inversée (flip) des 4 flancs, plan neutre = dessus de plaque : chaque copie a
//      le volume du plot source (le signe suit la normale transformée).
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};',ctx);
  const R=`
  const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};
  const vol=sh=>{const G=new occt.GProp_GProps_1();occt.BRepGProp.VolumeProperties_1(sh,G,false,false,false);const v=G.Mass();G.delete();return v;};
  const f2=v=>(+v).toFixed(2);
  const near=(a,b,t)=>Math.abs(a-b)<=t;
  const rect=(id,x0,y0,x1,y1)=>{const sk={id,name:id,plane:'XY',origin:[0,0,0],points:{},entities:[],constraints:[],dims:[]};
    [['p0',x0,y0,'e0','p1'],['p1',x1,y0,'e1','p2'],['p2',x1,y1,'e2','p3'],['p3',x0,y1,'e3','p0']].forEach(l=>{
      sk.points[l[0]]={x:l[1],y:l[2]};sk.entities.push({id:l[3],t:'line',p1:l[0],p2:l[4]});});return sk;};
  const PLAQUE=160*160*10;
  const faces=()=>{ // références de toutes les faces du solide final
    markDirty();rebuild();const FR=occFinalShape(null);const out=[];
    const ex=new occt.TopExp_Explorer_2(FR.shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);
    while(ex.More()){const f=occt.TopoDS.Face_1(ex.Current());const r=occFaceRef(f);try{f.delete();}catch(e){}if(r)out.push(r);ex.Next();}
    ex.delete();const v=vol(FR.shape);const bad=(FR.msgs||[]).filter(m=>/impossible|introuvable|aucune|partiel|non dépouillée/.test(m));
    try{FR.shape.delete();}catch(e){}return {refs:out,v,bad};};
  const base=()=>{
    doc.sketches=[rect('sk_pl',-80,-80,80,80),rect('sk_pt',30,-10,50,10)];doc.cgeo=[];doc.bodies=[];
    doc.features=[{id:'ex_pl',type:'extrude',name:'Plaque',sketchId:'sk_pl',op:'add',distance:10,visible:true},
      {id:'ex_pt',type:'extrude',name:'Plot',sketchId:'sk_pt',op:'add',distance:30,visible:true}];
    occCkClear();markDirty();rebuild();
  };
  // flanc d'un plot : face verticale de normale n (±X ou ±Y), à la position (cx, cy) du plot, au-dessus de la plaque
  const flanc=(refs,n,px,py)=>refs.find(r=>Math.abs(r.n[0]-n[0])<1e-3&&Math.abs(r.n[1]-n[1])<1e-3&&Math.abs(r.n[2])<1e-3&&r.pos[2]>10
    &&Math.abs(r.pos[0]-px)<10.5&&Math.abs(r.pos[1]-py)<10.5);
  // ───── A. chanfrein deux distances sur l'arête verticale du coin (50, 10) ─────
  const chamA=()=>{
    base();
    const E=occListEdges(occLive.shape);
    const e=E.find(x=>near(x.mid[0],50,1e-6)&&near(x.mid[1],10,1e-6)&&near(x.mid[2],20,1e-6));
    A(!!e,'A : arête verticale du coin (50, 10) trouvée');
    const xf={id:'xf_t',type:'xfillet',name:'Chanfrein',chamfer:true,cmode:'d2',cd2:6,tangent:true,visible:true,
      edges:[{pos:e.mid.slice(),pos0:e.mid.slice(),r:2,len:30,anchor:null,name:'e',seed:1,fn:[1,0,0]}]};
    doc.features.push(xf);occCkClear();
    const m=faces();
    const fx=flanc(m.refs,[1,0,0],40,0),fy=flanc(m.refs,[0,1,0],40,0);
    A(fx&&near(fx.dim[1],18,1e-3)&&fy&&near(fy.dim[0],14,1e-3),'A : source : D1 = 2 sur le flanc +X (largeur '+(fx?f2(fx.dim[1]):'?')+'), D2 = 6 sur le flanc +Y (largeur '+(fy?f2(fy.dim[0]):'?')+')');
    return m.v-PLAQUE;
  };
  const scenA=(tag,rp,k,images)=>{
    const vPlot=chamA();
    rp=Object.assign({id:'rp_t',type:'repeat',name:tag,base:['ex_pt','xf_t'],children:[],visible:true},rp);
    doc.features.push(rp);repGenChildren(rp);occCkClear();
    const m=faces();
    const copies=doc.features.filter(f=>f.repeatId==='rp_t'&&f.type==='xfillet');
    A(copies.length===k-1,tag+' : '+copies.length+' copie(s) du chanfrein au lieu de '+(k-1));
    A(!m.bad.length,tag+' : avertissements '+JSON.stringify(m.bad));
    A(near(m.v,PLAQUE+k*vPlot,0.5),tag+' : volume = plaque + '+k+' × plot chanfreiné ('+f2(m.v)+' / '+f2(PLAQUE+k*vPlot)+')');
    copies.forEach((c,i)=>{const im=images[i];if(!im)return;
      const f1=flanc(m.refs,im.n1,im.px,im.py),f1w=f1?f1.dim[im.ax1]:NaN;
      const f2b=flanc(m.refs,im.n2,im.px,im.py),f2w=f2b?f2b.dim[im.ax2]:NaN;
      A(near(f1w,18,1e-3)&&near(f2w,14,1e-3),tag+' copie '+(i+1)+' : D1 sur l\\'image du flanc +X (largeur '+f2(f1w)+' attendu 18), D2 sur l\\'image du flanc +Y ('+f2(f2w)+' attendu 14)');
      A(Array.isArray(c.edges[0].fn)&&near(c.edges[0].fn[0],im.n1[0],1e-3)&&near(c.edges[0].fn[1],im.n1[1],1e-3),tag+' copie '+(i+1)+' : fn transformée = '+JSON.stringify(c.edges[0].fn));
    });
  };
  // images du flanc +X (n1, largeur sur l'axe ax1) et du flanc +Y (n2, ax2) pour chaque copie
  scenA('linéaire X −60',{mode:'lin',copies:1,dist:-60,axis:'X'},2,[{n1:[1,0,0],ax1:1,n2:[0,1,0],ax2:0,px:-20,py:0}]);
  scenA('circulaire Z 90°',{mode:'circ',copies:1,angle:90,axis:'Z'},2,[{n1:[0,1,0],ax1:0,n2:[-1,0,0],ax2:1,px:0,py:40}]);
  scenA('circulaire Z 180°',{mode:'circ',copies:1,angle:180,axis:'Z'},2,[{n1:[-1,0,0],ax1:1,n2:[0,-1,0],ax2:0,px:-40,py:0}]);
  scenA('circulaire Z tour complet 4',{mode:'circ',copies:3,angle:360,axis:'Z'},4,[{n1:[0,1,0],ax1:0,n2:[-1,0,0],ax2:1,px:0,py:40},{n1:[-1,0,0],ax1:1,n2:[0,-1,0],ax2:0,px:-40,py:0},{n1:[0,-1,0],ax1:0,n2:[1,0,0],ax2:1,px:0,py:-40}]);
  scenA('symétrie YZ',{mode:'mir',copies:1,plane:'YZ'},2,[{n1:[-1,0,0],ax1:1,n2:[0,1,0],ax2:0,px:-40,py:0}]);
  // symétrie XZ : le plot se recouvre lui-même (y −10..10 symétrique) → on décale le plot d'abord
  // (test de la normale +Y → −Y) : plot en y 20..40, copie en y −40..−20
  {
    base();doc.sketches[1]=rect('sk_pt',30,20,50,40);occCkClear();markDirty();rebuild();
    const E=occListEdges(occLive.shape);const e=E.find(x=>near(x.mid[0],50,1e-6)&&near(x.mid[1],40,1e-6)&&near(x.mid[2],20,1e-6));
    const xf={id:'xf_t',type:'xfillet',name:'Chanfrein',chamfer:true,cmode:'d2',cd2:6,tangent:true,visible:true,edges:[{pos:e.mid.slice(),pos0:e.mid.slice(),r:2,len:30,anchor:null,name:'e',seed:1,fn:[1,0,0]}]};
    doc.features.push(xf);const rp={id:'rp_t',type:'repeat',name:'symétrie XZ',base:['ex_pt','xf_t'],children:[],visible:true,mode:'mir',copies:1,plane:'XZ'};
    doc.features.push(rp);repGenChildren(rp);occCkClear();
    const m=faces();
    const f1=flanc(m.refs,[1,0,0],40,-30),f2b=flanc(m.refs,[0,-1,0],40,-30);
    A(!m.bad.length&&f1&&near(f1.dim[1],18,1e-3)&&f2b&&near(f2b.dim[0],14,1e-3),'symétrie XZ : copie : D1 sur le flanc +X ('+(f1?f2(f1.dim[1]):'?')+'), D2 sur le flanc −Y, image du +Y ('+(f2b?f2(f2b.dim[0]):'?')+')');
  }
  // ───── B. dépouille 5° INVERSÉE des 4 flancs ─────
  const draftB=()=>{
    base();
    const m0=faces();
    const ref=m0.refs.find(r=>r.n[2]>0.99&&near(r.pos[2],10,1e-3));
    const fl=m0.refs.filter(r=>Math.abs(r.n[2])<1e-3&&r.pos[0]>=29.9&&r.pos[0]<=50.1&&Math.abs(r.pos[1])<=10.1&&r.pos[2]>10);
    A(!!ref&&fl.length===4,'B : dessus de plaque et 4 flancs trouvés');
    const dr={id:'dr_t',type:'xdraft',name:'Dépouille',ref,faces:fl,angle:5,flip:true,visible:true};
    doc.features.push(dr);occCkClear();
    const m=faces();
    A(dr._m&&dr._m.m===4&&!m.bad.length,'B : source 4/4 faces, sans avertissement');
    // inversée (angle effectif −5°) : les flancs rentrent en montant → le plot est PLUS PETIT que droit
    A(m.v<PLAQUE+20*20*30-10,'B : dépouille inversée : le plot se resserre en montant (volume '+f2(m.v-PLAQUE)+' < 12000)');
    return m.v-PLAQUE;
  };
  const scenB=(tag,rp,k)=>{
    const vPlot=draftB();
    rp=Object.assign({id:'rp_t',type:'repeat',name:tag,base:['ex_pt','dr_t'],children:[],visible:true},rp);
    doc.features.push(rp);repGenChildren(rp);occCkClear();
    const m=faces();
    const copies=doc.features.filter(f=>f.repeatId==='rp_t'&&f.type==='xdraft');
    A(copies.length===k-1&&copies.every(c=>c.flip===true&&draftAngleEff(c)===-5),tag+' : copies avec flip (angle effectif −5°)');
    A(!m.bad.length,tag+' : avertissements '+JSON.stringify(m.bad));
    A(near(m.v,PLAQUE+k*vPlot,0.5),tag+' : volume = plaque + '+k+' × plot dépouillé inversé ('+f2(m.v)+' / '+f2(PLAQUE+k*vPlot)+')');
  };
  scenB('dépouille · linéaire X −60',{mode:'lin',copies:1,dist:-60,axis:'X'},2);
  scenB('dépouille · circulaire Z 180°',{mode:'circ',copies:1,angle:180,axis:'Z'},2);
  scenB('dépouille · symétrie YZ',{mode:'mir',copies:1,plane:'YZ'},2);
  return out;`;
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== V0.11.19 : répétition de chanfreins asymétriques et de dépouilles inversées ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
