// RÉVOLUTIONS JOINTIVES sur le vrai noyau OCCT (2026-10-27). Défaut trouvé en rendant les
// révolutions répétables : deux quarts d'anneau qui se touchent EXACTEMENT par leur face
// d'extrémité figeaient le rejeu (> 60 s, markDirty();rebuild();occFinalShape ne rendait
// jamais la main). La fusion passait ; c'est ShapeUpgrade_UnifySameDomain (occUnify) qui
// bouclait en recollant deux cylindres coaxiaux de paramétrage incompatible (axe +Y contre
// −Y, ou repère indirect après symétrie). Garde-fou : occUnifyKeepEdges.
// Cas : (1) révolution 90° autour de l'axe système Y + révolution 90° d'un rectangle opposé
// autour d'une ligne de construction descendante → un seul solide, 2 × le quart d'anneau ;
// (2) quart d'anneau + son symétrique YZ (repère indirect) ; (3) témoin : quart d'anneau +
// sa rotation de 90° (même axe, même main) → les cylindres sont bien recollés (6 faces).
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const R=`
  const P=[];const p=s=>P.push(String(s));
  const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};
  const vol=sh=>{const G=new occt.GProp_GProps_1();occt.BRepGProp.VolumeProperties_1(sh,G,false,false,false);const v=G.Mass();G.delete();return v;};
  const nb=(sh,t)=>{let n=0;const ex=new occt.TopExp_Explorer_2(sh,t,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);while(ex.More()){n++;ex.Next();}ex.delete();return n;};
  const SOL=occt.TopAbs_ShapeEnum.TopAbs_SOLID,FAC=occt.TopAbs_ShapeEnum.TopAbs_FACE;
  const f2=v=>(+v).toFixed(2);
  const QUART=Math.PI*(20*20-10*10)/4*10;
  const rect=(id,x0,y0,x1,y1)=>{const sk={id,name:id,plane:'XY',origin:[0,0,0],points:{},entities:[],constraints:[],dims:[]};
    [['p0',x0,y0,'e0','p1'],['p1',x1,y0,'e1','p2'],['p2',x1,y1,'e2','p3'],['p3',x0,y1,'e3','p0']].forEach(l=>{
      sk.points[l[0]]={x:l[1],y:l[2]};sk.entities.push({id:l[3],t:'line',p1:l[0],p2:l[4]});});return sk;};
  const rvA={id:'rv_a',type:'revolve',name:'',sketchId:'sk_a',axis:{k:'sys',d:'Y'},angle:90,op:'add',visible:true};
  // ---------- (1) deux révolutions jointives, rejeu complet ----------
  {
    const a=rect('sk_a',10,-5,20,5),b=rect('sk_b',-20,-5,-10,5);
    b.points.a0={x:0,y:5};b.points.a1={x:0,y:-5};b.entities.push({id:'ax',t:'line',p1:'a0',p2:'a1',construction:true});
    doc.sketches=[a,b];doc.cgeo=[];
    doc.features=[rvA,{id:'rv_b',type:'revolve',name:'',sketchId:'sk_b',axis:{k:'line',id:'ax'},angle:90,op:'add',visible:true}];
    occCkClear();
    const t=Date.now();markDirty();rebuild();const FR=occFinalShape(null);const dt=Date.now()-t;
    const v=vol(FR.shape),ns=nb(FR.shape,SOL),nf=nb(FR.shape,FAC);
    p('±Y jointives : vol '+f2(v)+' (attendu '+f2(2*QUART)+'), '+ns+' solide(s), '+nf+' faces, '+dt+' ms');
    att(Math.abs(v-2*QUART)<0.05,'±Y : volume '+f2(v)+' au lieu de '+f2(2*QUART));
    att(ns===1,'±Y : '+ns+' solide(s) au lieu de 1');
    att(nf>=6&&nf<=10,'±Y : '+nf+' faces');
    att(!(FR.msgs||[]).length,'±Y : messages '+JSON.stringify(FR.msgs));
    att(dt<20000,'±Y : rejeu trop long ('+dt+' ms)');
    try{FR.shape.delete();}catch(e){}
  }
  // ---------- quart d'anneau seul + transformation par matrice, fusion + occUnify ----------
  const trsf=(sh,m)=>{const t=new occt.gp_Trsf_1();t.SetValues(...m);const b=new occt.BRepBuilderAPI_Transform_2(sh,t,true);const s=b.Shape();
    try{b.delete();}catch(e){}try{t.delete();}catch(e){}return s;};
  const paire=(tag,m,nfAtt)=>{
    doc.sketches=[rect('sk_a',10,-5,20,5)];doc.cgeo=[];doc.features=[rvA];
    const r=occShapeOfRevolve(rvA);const A=r.shape,B=trsf(A,m);
    const t=Date.now();const U=occUnify(occFuse(A,B));const dt=Date.now()-t;
    const v=vol(U),ns=nb(U,SOL),nf=nb(U,FAC);
    p(tag+' : vol '+f2(v)+', '+ns+' solide(s), '+nf+' faces, '+dt+' ms');
    att(Math.abs(v-2*QUART)<0.05,tag+' : volume '+f2(v)+' au lieu de '+f2(2*QUART));
    att(ns===1,tag+' : '+ns+' solide(s) au lieu de 1');
    att(nfAtt(nf),tag+' : '+nf+' faces');
    occDispose([U,A,B]);occDispose(r.bins);
  };
  // (2) symétrie par le plan YZ (x → −x) : cylindres en repère indirect
  paire('symétrie YZ',[-1,0,0,0, 0,1,0,0, 0,0,1,0],nf=>nf>=6&&nf<=10);
  // (3) témoin : rotation de 90° autour de Y (même axe, même main) → recollement complet
  paire('rotation 90° (témoin)',[0,0,1,0, 0,1,0,0, -1,0,0,0],nf=>nf===6);
  if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  ✗ '+m));}
  else{p('');p('TOUT EST CONFORME');}
  return P.join('\\n');`;
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'revolutions_jointives.js'});
  console.log(r);
  process.exit(/ECHECS|✗/.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,800));process.exit(1);});
