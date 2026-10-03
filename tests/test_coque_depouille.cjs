// Coque + dépouille : le fichier RÉEL de l'utilisateur (fixtures/coque.json) doit
// s'évider POUR DE VRAI — pas renvoyer un « solide » qui garde son dessus ou qui
// explose hors gabarit (junk silencieux : IsDone=true sans évidage).
// 3 configurations du même document :
//   A : dépouille -15° + congé R6 — le cas du bug (recette directe → junk)
//   B : dépouille -15° sans congé  — même famille (recette Intersection attendue)
//   D : sans dépouille + congé     — la recette directe Arc fonctionne (non-régression)
// Critères d'évidage réel (sondages coque 6-17) : Δfaces ≥ +5, volume < 0.5×base,
// bbox serrée ±(2+2×paroi) via AddOptimal (une face parasite hors gabarit = junk),
// anneau du dessus entre 100 et 500 mm² (dessus OUVERT, pas la face pleine ~8000),
// forme valide (ShapeFix le cas échéant), toutes les faces maillables,
// appariment _m = 1/1, aucun avertissement fatal.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
const json=fs.readFileSync(path.join(ROOT,'tests','fixtures','coque.json'),'utf8');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const body=`(async()=>{
    const out={fails:[],scen:{}};
    const A=(c,m)=>{if(!c)out.fails.push(m);};
    const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
    const cnt=sh=>{let n=0;const x=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);
      while(x.More()){n++;x.Next();}x.delete();return n;};
    const vol=sh=>{const G=new occt.GProp_GProps_1();occt.BRepGProp.VolumeProperties_1(sh,G,false,false,false);
      const v=G.Mass();try{G.delete();}catch(e){}return v;};
    const valid=sh=>{const a=new occt.BRepCheck_Analyzer(sh,true);const v=a.IsValid_1(sh);
      try{a.delete();}catch(e){}return v;};
    const bbOpt=sh=>{const b=new occt.Bnd_Box_1();
      try{occt.BRepBndLib.AddOptimal(sh,b,true,false);}
      catch(e){try{occt.BRepBndLib.AddOptimal(sh,b);}catch(e2){try{b.delete();}catch(e){}return null;}}
      try{const a=b.CornerMin(),z=b.CornerMax();
        const o=[a.X(),a.Y(),a.Z(),z.X(),z.Y(),z.Z()];
        try{b.delete();}catch(e){}return o;}
      catch(e){try{b.delete();}catch(e2){}return null;}};
    const meshInfo=sh=>{const r={faces:0,nomesh:0};
      try{
        new occt.BRepMesh_IncrementalMesh_2(sh,0.2,false,0.5,false);
        const x=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);
        const loc=new occt.TopLoc_Location_1();
        while(x.More()){
          const f=occt.TopoDS.Face_1(x.Current());r.faces++;
          try{const h=occt.BRep_Tool.Triangulation(f,loc);
            if(!h||h.IsNull())r.nomesh++;
            else{const t=h.get();if(!t||!t.NbTriangles())r.nomesh++;}}
          catch(e){r.nomesh++;}
          try{f.delete();}catch(e){}
          x.Next();}
        x.delete();try{loc.delete();}catch(e){}
      }catch(e){r.throw=String(e.message||e).slice(0,80);}
      return r;};
    const topArea=(S,zTop)=>{let a=0;
      const x=new occt.TopExp_Explorer_2(S,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);
      while(x.More()){
        const f=occt.TopoDS.Face_1(x.Current());
        try{const b=occFaceBox(f);
          if(b.dim[2]<0.6&&Math.abs(b.pos[2]-zTop)<0.8&&b.dim[0]>40){
            const G=new occt.GProp_GProps_1();
            occt.BRepGProp.SurfaceProperties_1(f,G,false,false);
            a+=G.Mass();try{G.delete();}catch(e){}
          }}catch(e){}
        try{f.delete();}catch(e){}
        x.Next();}
      x.delete();return a;};
    const measure=FR=>{const s=FR.perBody[0].shape;
      return {nf:cnt(s),v:vol(s),bb:bbOpt(s),valid:valid(s)};};
    await deserialise(${JSON.stringify(json)},{rebuild:false});
    const X=doc.features;
    const ex=X.filter(f=>f.type==="extrude")[0];
    const fil=X.filter(f=>f.type==="xfillet")[0];
    const shl=X.filter(f=>f.type==="xshell")[0];
    A(!!ex&&!!fil&&!!shl,"fixture : extrude/xfillet/xshell présents");
    if(!ex||!fil||!shl)return out;
    const run=async(name,draft,filOn)=>{
      ex.draft=draft;fil.visible=filOn;
      shl.visible=false;freshHard=true;occCkClear();markDirty();rebuild();
      const FRb=occFinalShape(null);const m0=measure(FRb);occCleanup(FRb,null);
      shl.visible=true;freshHard=true;occCkClear();markDirty();rebuild();
      const FR=occFinalShape(null);const m1=measure(FR);
      const shape=FR.perBody[0].shape;
      m1.top=topArea(shape,m0.bb?m0.bb[5]:0);
      m1.mesh=meshInfo(shape);
      m1.msgs=(FR.msgs||[]).filter(s=>/aucun volume|évidage|impossible/i.test(s));
      m1.m=shl._m?(shl._m.m+"/"+shl._m.t):"?";
      occCleanup(FR,null);
      out.scen[name]={m0:{nf:m0.nf,v:+m0.v.toFixed(1)},
        m1:{nf:m1.nf,v:+m1.v.toFixed(1),valid:m1.valid,top:+m1.top.toFixed(1),
          nomesh:m1.mesh?m1.mesh.nomesh:-1,m:m1.m,fautes:m1.msgs.length}};
      const p=name+" : ";
      A(!!m0.bb&&!!m1.bb,p+"boîtes englobantes mesurables");
      A(m1.nf>=m0.nf+5,p+"évidage réel : faces "+m1.nf+" >= base "+m0.nf+"+5");
      A(m1.v>0&&m1.v<m0.v*0.5,p+"volume évoyé < 0.5×base : "+m1.v.toFixed(0)+" / "+m0.v.toFixed(0));
      if(m0.bb&&m1.bb){
        const mg=4;let ok=true;
        for(let i=0;i<6;i++){
          if(i<3&&m1.bb[i]<m0.bb[i]-mg)ok=false;
          if(i>=3&&m1.bb[i]>m0.bb[i]+mg)ok=false;}
        A(ok,p+"bbox serrée ±"+mg+" : ["+m1.bb.map(v=>v.toFixed(1)).join(",")+
          "] vs base ["+m0.bb.map(v=>v.toFixed(1)).join(",")+"]");}
      A(m1.top>100&&m1.top<500,p+"dessus ouvert (anneau "+m1.top.toFixed(0)+" mm², attendu 100..500)");
      A(m1.valid===true,p+"forme valide");
      A(!!m1.mesh&&m1.mesh.nomesh===0&&!m1.mesh.throw,
        p+"toutes les faces maillables"+(m1.mesh&&m1.mesh.throw?" ("+m1.mesh.throw+")":
        " ("+(m1.mesh?m1.mesh.nomesh:"?")+" sans triangulation)"));
      A(m1.m==="1/1",p+"appariement _m = 1/1 ("+m1.m+")");
      A(m1.msgs.length===0,p+"aucun avertissement fatal"+
        (m1.msgs.length?" : "+m1.msgs.join(" | "):""));
    };
    await run("A dépouille+congé",-15,true);
    await run("B dépouille",-15,false);
    await run("D congé seul",0,true);
    return out;
  })()`;
  const o=await vm.runInContext(body,ctx,{filename:'coque_depouille.cjs'});
  for(const k of Object.keys(o.scen||{})){
    const s=o.scen[k];
    console.log(k+" | base "+s.m0.nf+"f/"+s.m0.v+" → "+s.m1.nf+"f/"+s.m1.v+
      " | valid "+s.m1.valid+" | anneau "+s.m1.top+" | nomesh "+s.m1.nomesh+" | _m "+s.m1.m);
  }
  if(o.fails&&o.fails.length){
    console.log("ECHECS ("+o.fails.length+") :");
    o.fails.forEach(m=>console.log("  x "+m));
    process.exit(1);
  }
  console.log("TOUT EST CONFORME");
  process.exit(0);
})().catch(e=>{console.log("FATAL/FAIL",String((e&&e.message)||e).slice(0,600));process.exit(1);});
