// RÉPÉTITION + DÉPOUILLE sur le vrai noyau OCCT. Retour utilisateur (2026-10-27) : « les
// dépouilles ne sont pas prises en compte dans les répétitions ». Cause : repCanFeature ne
// proposait pas le type 'xdraft' et repCloneFeature ne transformait pas ses faces mémorisées
// (références durables pos/n/dim + ancre). Pièce : plaque 160 × 160 × 10 centrée, plot
// 20 × 20 × 30 dépouillé de 5° (plan neutre = dessus de la plaque). On répète [plot, dépouille]
// en linéaire, circulaire et symétrie : chaque copie de la dépouille est appariée en entier
// (m = t), sans avertissement, et le volume vaut plaque + k × (plot dépouillé).
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
  const f2=v=>(+v).toFixed(2);
  const mesure=()=>{markDirty();rebuild();const FR=occFinalShape(null);
    const o={v:vol(FR.shape),bad:(FR.msgs||[]).filter(m=>/impossible|introuvable|aucune|partiel|non dépouillée/.test(m))};
    try{FR.shape.delete();}catch(e){}return o;};
  const rect=(id,x0,y0,x1,y1)=>{const sk={id,name:id,plane:'XY',origin:[0,0,0],points:{},entities:[],constraints:[],dims:[]};
    [['p0',x0,y0,'e0','p1'],['p1',x1,y0,'e1','p2'],['p2',x1,y1,'e2','p3'],['p3',x0,y1,'e3','p0']].forEach(l=>{
      sk.points[l[0]]={x:l[1],y:l[2]};sk.entities.push({id:l[3],t:'line',p1:l[0],p2:l[4]});});return sk;};
  const PLAQUE=160*160*10;
  // faces réelles du solide courant : dessus de la plaque (z = 10) et 4 flancs du plot (x 30..50)
  const refs=()=>{
    markDirty();rebuild();const FR=occFinalShape(null);const out={ref:null,faces:[]};
    const ex=new occt.TopExp_Explorer_2(FR.shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);
    while(ex.More()){const f=occt.TopoDS.Face_1(ex.Current());const r=occFaceRef(f);try{f.delete();}catch(e){}
      if(r){if(r.n[2]>0.99&&Math.abs(r.pos[2]-10)<1e-3)out.ref=r;
        else if(Math.abs(r.n[2])<1e-3&&r.pos[0]>=29.9&&r.pos[0]<=50.1&&Math.abs(r.pos[1])<=10.1&&r.pos[2]>10)out.faces.push(r);}
      ex.Next();}
    ex.delete();try{FR.shape.delete();}catch(e){}
    return out;
  };
  const base=()=>{
    doc.sketches=[rect('sk_pl',-80,-80,80,80),rect('sk_pt',30,-10,50,10)];doc.cgeo=[];
    doc.features=[{id:'ex_pl',type:'extrude',name:'Plaque',sketchId:'sk_pl',op:'add',distance:10,visible:true},
      {id:'ex_pt',type:'extrude',name:'Plot',sketchId:'sk_pt',op:'add',distance:30,visible:true}];
    occCkClear();
    const r=refs();
    att(r.ref&&r.faces.length===4,'pièce de base : dessus de plaque '+(r.ref?'trouvé':'absent')+', '+r.faces.length+' flanc(s) au lieu de 4');
    const dr={id:'dr_t',type:'xdraft',name:'Dépouille',ref:r.ref,faces:r.faces,angle:5,visible:true};
    doc.features.push(dr);
    occCkClear();const m=mesure();
    att(dr._m&&dr._m.m===4&&dr._m.t===4,'pièce de base : dépouille source '+(dr._m?dr._m.m+'/'+dr._m.t:'?'));
    att(!m.bad.length,'pièce de base : avertissements '+JSON.stringify(m.bad));
    att(Math.abs(m.v-(PLAQUE+20*20*30))>10,'pièce de base : la dépouille ne change pas le volume ('+f2(m.v)+')');
    return m.v-PLAQUE; // volume propre du plot dépouillé (le pied, dans la plaque, n'est pas compté deux fois)
  };
  const scen=(tag,rp,k)=>{
    const vPlot=base();
    rp=Object.assign({id:'rp_t',type:'repeat',name:tag,base:['ex_pt','dr_t'],children:[],visible:true},rp);
    att(repCanFeature('dr_t'),tag+' : la dépouille n est pas proposée à la répétition');
    doc.features.push(rp);repGenChildren(rp);
    const ks=doc.features.filter(f=>f.repeatId===rp.id&&f.type==='xdraft');
    att(ks.length===k-1,tag+' : '+ks.length+' dépouille(s) copiée(s) au lieu de '+(k-1));
    occCkClear();const m=mesure();
    ks.forEach(d=>{att(d._m&&d._m.m===4&&d._m.t===4,tag+' : copie '+d.repIndex+' appariée '+(d._m?d._m.m+'/'+d._m.t:'?'));
      att(Math.abs(d.ref.pos[2]-10)<1e-3&&d.ref.n[2]>0.99,tag+' : plan neutre de la copie '+d.repIndex+' déplacé ('+d.ref.pos.map(f2)+')');});
    const vAtt=PLAQUE+k*vPlot;
    p(tag+' : vol '+f2(m.v)+' (attendu '+f2(vAtt)+'), '+ks.length+' dépouille(s) copiée(s)');
    att(Math.abs(m.v-vAtt)<0.5,tag+' : volume '+f2(m.v)+' au lieu de '+f2(vAtt)+' (copie non dépouillée ?)');
    att(!m.bad.length,tag+' : avertissements '+JSON.stringify(m.bad));
    // rejeu à froid : même résultat
    occCkClear();const m2=mesure();att(Math.abs(m2.v-m.v)<1e-6,tag+' : rejeu à froid différent ('+f2(m2.v)+')');
    return rp;
  };
  scen('linéaire X −60',{mode:'lin',copies:1,dist:-60,axis:'X'},2);
  scen('linéaire X −35, 2 copies',{mode:'lin',copies:2,dist:-35,axis:'X'},3);
  scen('circulaire Z tour complet',{mode:'circ',copies:1,angle:360,axis:'Z'},2);
  scen('circulaire Z 45°',{mode:'circ',copies:1,angle:45,axis:'Z'},2);
  scen('symétrie YZ',{mode:'mir',copies:1,plane:'YZ'},2);
  // l'angle de la source change : la copie suit (repSyncStale par la signature des sources)
  {
    const rp=scen('symétrie YZ puis 8°',{mode:'mir',copies:1,plane:'YZ'},2);
    doc.features.find(f=>f.id==='dr_t').angle=8;
    occCkClear();const m=mesure();
    const k=doc.features.find(f=>f.repeatId===rp.id&&f.type==='xdraft');
    att(k&&k.angle===8,'8° : la copie garde l angle '+(k&&k.angle));
    const src=doc.features.filter(f=>f.repeatId===rp.id);rp.visible=false;src.forEach(f=>f.visible=false);occCkClear();
    const seul=mesure();rp.visible=true;src.forEach(f=>f.visible=true);
    p('symétrie puis 8° : vol '+f2(m.v)+' (attendu '+f2(PLAQUE+2*(seul.v-PLAQUE))+')');
    att(Math.abs(m.v-(PLAQUE+2*(seul.v-PLAQUE)))<0.5,'8° : volume '+f2(m.v));
  }
  // ================= autres fonctions répétables (2026-10-27) =================
  const boite=sh=>{const b=new occt.Bnd_Box_1();occt.BRepBndLib.Add(sh,b,true);const a=b.CornerMin(),z=b.CornerMax();b.delete();return [a.X(),a.Y(),a.Z(),z.X(),z.Y(),z.Z()];};
  const mesureB=()=>{markDirty();rebuild();const FR=occFinalShape(null);
    const o={v:vol(FR.shape),b:boite(FR.shape),bad:(FR.msgs||[]).filter(m=>/impossible|introuvable|aucune|partiel|ignoré/.test(m))};
    try{FR.shape.delete();}catch(e){}return o;};
  const facesAny=()=>{markDirty();rebuild();const FR=occFinalShape(null);const out=[];
    const ex=new occt.TopExp_Explorer_2(FR.shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);
    while(ex.More()){const f=occt.TopoDS.Face_1(ex.Current());const r=occFaceRefAny(f);try{f.delete();}catch(e){}if(r)out.push(r);ex.Next();}
    ex.delete();try{FR.shape.delete();}catch(e){}return out;};
  const plaquePlot=()=>{
    doc.sketches=[rect('sk_pl',-80,-80,80,80),rect('sk_pt',30,-10,50,10)];doc.cgeo=[];
    doc.features=[{id:'ex_pl',type:'extrude',name:'Plaque',sketchId:'sk_pl',op:'add',distance:10,visible:true},
      {id:'ex_pt',type:'extrude',name:'Plot',sketchId:'sk_pt',op:'add',distance:30,visible:true}];
    occCkClear();
  };
  // pièce + fonction(s) ajoutée(s) par 'ajout', répétées avec le plot ; volume attendu vAtt(k)
  const scenF=(tag,ids,ajout,rpo,k,vAtt)=>{
    plaquePlot();ajout();
    rpo=Object.assign({id:'rp_f',type:'repeat',name:tag,base:['ex_pt'].concat(ids),children:[],visible:true},rpo);
    ids.forEach(id=>att(repCanFeature(id),tag+' : '+id+' non proposé à la répétition'));
    occCkClear();const m0=mesureB();att(!m0.bad.length,tag+' : source en défaut '+JSON.stringify(m0.bad));
    doc.features.push(rpo);repGenChildren(rpo);
    const ks=doc.features.filter(f=>f.repeatId===rpo.id);
    att(ks.length===(k-1)*(ids.length+1),tag+' : '+ks.length+' instance(s)');
    occCkClear();const m=mesureB();
    p(tag+' : vol '+f2(m.v)+' (attendu '+f2(vAtt(k))+'), '+ks.length+' instance(s)');
    att(Math.abs(m.v-vAtt(k))<0.5,tag+' : volume '+f2(m.v)+' au lieu de '+f2(vAtt(k)));
    att(!m.bad.length,tag+' : avertissements '+JSON.stringify(m.bad));
    ks.forEach(f=>att(!f._err&&!(f._m&&f._m.m<f._m.t),tag+' : instance '+f.name+' en défaut '+(f._err||(f._m?f._m.m+'/'+f._m.t:''))));
  };
  // ---------- DÉPLACEMENT DE FACE : dessus du plot (z = 30) monté de 5 mm ----------
  const ajoutMv=()=>{const r=facesAny().find(r=>r.n&&r.n[2]>0.99&&Math.abs(r.pos[2]-30)<1e-3);
    att(!!r,'déplacement : dessus du plot introuvable');
    doc.features.push({id:'mv_t',type:'xmove',name:'Déplacement',ref:r,dist:5,visible:true});};
  const vMv=k=>PLAQUE+k*20*20*25;
  scenF('déplacement · linéaire X −60',['mv_t'],ajoutMv,{mode:'lin',copies:1,dist:-60,axis:'X'},2,vMv);
  scenF('déplacement · circulaire 45°',['mv_t'],ajoutMv,{mode:'circ',copies:1,angle:45,axis:'Z'},2,vMv);
  scenF('déplacement · symétrie YZ',['mv_t'],ajoutMv,{mode:'mir',copies:1,plane:'YZ'},2,vMv);
  // ---------- SUPPRESSION DE FACE : trou Ø8 traversant le plot, rebouché par suppression ----------
  const ajoutDf=()=>{
    doc.sketches.push({id:'sk_tr',name:'Trou',plane:'XY',origin:[0,0,0],points:{c:{x:40,y:0}},entities:[{id:'c1',t:'circle',pc:'c',r:4}],constraints:[],dims:[]});
    doc.features.push({id:'ex_tr',type:'extrude',name:'Trou',sketchId:'sk_tr',op:'cut',distance:30,visible:true});
    occCkClear();
    const r=facesAny().find(r=>r.st==='Cylinder'&&Math.abs(r.pos[0]-40)<0.1&&Math.abs(r.pos[1])<0.1);
    att(!!r,'suppression : paroi du trou introuvable');
    doc.features.push({id:'df_t',type:'xdelface',name:'Suppression',faces:[r],visible:true});};
  const vDf=k=>PLAQUE+k*20*20*20;
  scenF('suppression · linéaire X −60',['ex_tr','df_t'],ajoutDf,{mode:'lin',copies:1,dist:-60,axis:'X'},2,vDf);
  scenF('suppression · circulaire 90°',['ex_tr','df_t'],ajoutDf,{mode:'circ',copies:1,angle:90,axis:'Z'},2,vDf);
  scenF('suppression · symétrie YZ',['ex_tr','df_t'],ajoutDf,{mode:'mir',copies:1,plane:'YZ'},2,vDf);
  // ---------- RÉVOLUTION : quart d'anneau (rectangle x 10..20, y ±5, 90° autour de Y) ----------
  // On compare la COPIE seule (source masquée) à l'image de la source seule (copie masquée) :
  // l'axe système Y doit suivre la copie, et le miroir inverser le sens de rotation.
  const tBoite=(b,rp)=>{const out=[1e9,1e9,1e9,-1e9,-1e9,-1e9];
    for(const x of [b[0],b[3]])for(const y of [b[1],b[4]])for(const z of [b[2],b[5]]){
      const q=rp.mode==='lin'?repAdd([x,y,z],repScale(repAxisVec(rp),+rp.dist)):repTransformPoint([x,y,z],1,rp);
      for(let i=0;i<3;i++){out[i]=Math.min(out[i],q[i]);out[i+3]=Math.max(out[i+3],q[i]);}}
    return out;};
  const scenRv=(tag,axis,rpo)=>{
    const sk=rect('sk_rv',10,-5,20,5);
    if(axis.k==='line'){sk.points.a0={x:0,y:-5};sk.points.a1={x:0,y:5};sk.entities.push({id:'ax',t:'line',p1:'a0',p2:'a1',construction:true});}
    doc.sketches=[sk];doc.cgeo=[];
    doc.features=[{id:'rv_t',type:'revolve',name:'',sketchId:'sk_rv',axis,angle:90,op:'add',visible:true}];
    att(repCanFeature('rv_t'),tag+' : révolution non proposée à la répétition');
    occCkClear();const a=mesureB(); // source seule, avant la répétition
    const rp=Object.assign({id:'rp_rv',type:'repeat',name:tag,base:['rv_t'],children:[],visible:true},rpo);
    doc.features.push(rp);repGenChildren(rp);
    const src=doc.features[0],k=doc.features.find(f=>f.repeatId===rp.id);
    att(!!k,tag+' : aucune copie');if(!k)return;
    src.visible=false;occCkClear();const c=mesureB();src.visible=true;
    const e=tBoite(a.b,rp),d=Math.max(...e.map((v,i)=>Math.abs(v-c.b[i])));
    p(tag+' : source ['+a.b.map(f2)+'] → copie ['+c.b.map(f2)+'], attendu ['+e.map(f2)+']');
    att(Math.abs(a.v-c.v)<0.05,tag+' : volume de la copie '+f2(c.v)+' au lieu de '+f2(a.v));
    att(d<0.5,tag+' : copie mal placée (écart '+f2(d)+' mm)');
    att(!a.bad.length&&!c.bad.length,tag+' : avertissements '+JSON.stringify(a.bad.concat(c.bad)));
  };
  scenRv('révolution axe Y · linéaire X 60',{k:'sys',d:'Y'},{mode:'lin',copies:1,dist:60,axis:'X'});
  scenRv('révolution axe Y · circulaire Z 90°',{k:'sys',d:'Y'},{mode:'circ',copies:1,angle:90,axis:'Z'});
  scenRv('révolution axe Y · symétrie YZ',{k:'sys',d:'Y'},{mode:'mir',copies:1,plane:'YZ'});
  scenRv('révolution axe Y · symétrie XY',{k:'sys',d:'Y'},{mode:'mir',copies:1,plane:'XY'});
  scenRv('révolution ligne · symétrie YZ',{k:'line',id:'ax'},{mode:'mir',copies:1,plane:'YZ'});
  scenRv('révolution ligne · circulaire X 90°',{k:'line',id:'ax'},{mode:'circ',copies:1,angle:90,axis:'X'});
  if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  ✗ '+m));}
  else{p('');p('TOUT EST CONFORME');}
  return P.join('\\n');`;
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'repeat_fonctions.js'});
  console.log(r);
  process.exit(/ECHECS|✗/.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,800));process.exit(1);});
