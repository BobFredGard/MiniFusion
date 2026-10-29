// 2026-10-28 : export STEP au choix AP214 / AP203.
// 2026-10-29 : option « sans courbes 2D » (stepStripPcurves) pour les vieux logiciels.
// Le noyau n'écrit que de l'AP214 IS (write.step.schema inaccessible dans cette
// build d'opencascade.js) ; l'AP203 est réécrit en JS (stepToAp203). On vérifie :
//   • en-têtes : AUTOMOTIVE_DESIGN / automotive_design vs CONFIG_CONTROL_DESIGN /
//     config_control_design, plus aucun contexte AP214 dans l'AP203 ;
//   • entités de gestion AP203 présentes et toutes les références #n résolues ;
//   • les deux fichiers se RELISENT en un solide de 6 faces, même boîte englobante.
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
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};',ctx);
  const r=vm.runInContext(`(function(){
    const txt=b=>{let t='';for(let i=0;i<b.length;i+=8192)t+=String.fromCharCode.apply(null,b.subarray(i,i+8192));return t;};
    const relire=function(b){
      try{occt.FS.unlink('/r.stp');}catch(e){}
      occt.FS.writeFile('/r.stp',b);
      const rd=new occt.STEPControl_Reader_1();rd.ReadFile('/r.stp');
      if(rd.NbRootsForTransfer()<1)return null;
      rd.TransferRoots();const sh=rd.OneShape();
      let nf=0,ns=0;
      const ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);
      while(ex.More()){nf++;ex.Next();}ex.delete();
      const es=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_SOLID,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);
      while(es.More()){ns++;es.Next();}es.delete();
      const bx=new occt.Bnd_Box_1();occt.BRepBndLib.Add(sh,bx,false);
      const a=bx.CornerMin(),z=bx.CornerMax();
      const G=new occt.GProp_GProps_1();occt.BRepGProp.VolumeProperties_1(sh,G,false,false,false);
      const ok=new occt.BRepCheck_Analyzer(sh,true).IsValid_2();
      return {nf,ns,dx:z.X()-a.X(),dy:z.Y()-a.Y(),dz:z.Z()-a.Z(),v:G.Mass(),ok};
    };
    const mk=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),60,40,20);
    const sh=mk.Shape();
    const b214=occWriteStep([sh],'/s.stp','AP214');
    const b203=occWriteStep([sh],'/s.stp','AP203');
    // Courbes 2D : boîte percée (couture de cylindre) + assemblage de deux pièces.
    const ax=new occt.gp_Ax2_3(new occt.gp_Pnt_3(30,20,-5),new occt.gp_Dir_4(0,0,1));
    const trou=new occt.BRepAlgoAPI_Cut_3(sh,new occt.BRepPrimAPI_MakeCylinder_3(ax,8,30).Shape()).Shape();
    const tr=new occt.gp_Trsf_1();tr.SetTranslation_1(new occt.gp_Vec_4(100,0,0));
    const B=new occt.BRep_Builder(),C=new occt.TopoDS_Compound();B.MakeCompound(C);
    B.Add(C,trou);B.Add(C,sh.Moved(new occt.TopLoc_Location_2(tr)));
    const pc={};
    for(const [k,s] of [['trou',trou],['asm',C]])for(const sch of ['AP214','AP203'])for(const np of [false,true]){
      const b=occWriteStep([s],'/s.stp',sch,np);pc[k+' '+sch+(np?' sans':' avec')]={t:txt(b),r:relire(b)};
    }
    return {t214:txt(b214),t203:txt(b203),r214:relire(b214),r203:relire(b203),pc};
  })()`,ctx);
  const {t214,t203}=r;
  console.log('— AP214');
  A(/FILE_SCHEMA\(\('AUTOMOTIVE_DESIGN \{ 1 0 10303 214/.test(t214),'FILE_SCHEMA AUTOMOTIVE_DESIGN (AP214 IS)');
  A(/'automotive_design'/.test(t214),'APPLICATION_PROTOCOL_DEFINITION automotive_design');
  console.log('— AP203');
  A(/FILE_SCHEMA\(\('CONFIG_CONTROL_DESIGN'\)\)/.test(t203),'FILE_SCHEMA CONFIG_CONTROL_DESIGN');
  A(/'config_control_design',1994,/.test(t203),'APPLICATION_PROTOCOL_DEFINITION config_control_design 1994');
  A(!/automotive|AUTOMOTIVE|PRODUCT_CONTEXT|PRODUCT_DEFINITION_CONTEXT/.test(t203),'aucun vestige AP214 (schéma, contextes)');
  A(/MECHANICAL_CONTEXT\(/.test(t203)&&/DESIGN_CONTEXT\('detailed design'/.test(t203),'MECHANICAL_CONTEXT + DESIGN_CONTEXT');
  for(const k of ['CC_DESIGN_APPROVAL','CC_DESIGN_SECURITY_CLASSIFICATION','CC_DESIGN_PERSON_AND_ORGANIZATION_ASSIGNMENT','CC_DESIGN_DATE_AND_TIME_ASSIGNMENT','APPROVAL_DATE_TIME','APPROVAL_PERSON_ORGANIZATION'])
    A(new RegExp(k+'\\(').test(t203),k);
  const def=new Set(),ref=new Set();
  const data=t203.slice(t203.indexOf('DATA;'));
  data.replace(/#(\d+)\s*=/g,(m,n)=>{def.add(n);return m;});
  data.replace(/#(\d+)(?!\s*=)/g,(m,n)=>{ref.add(n);return m;});
  const manq=[...ref].filter(n=>!def.has(n));
  A(manq.length===0,'toutes les références #n sont définies'+(manq.length?' (manquent : '+manq.slice(0,5).join(',')+')':''));
  A(def.size===new Set(data.match(/#\d+\s*=/g)).size,'aucun identifiant en double');
  console.log('— relecture OCCT');
  for(const [k,v] of [['AP214',r.r214],['AP203',r.r203]]){
    A(v&&v.ns===1&&v.nf===6,k+' : 1 solide, 6 faces'+(v?' ('+v.ns+' / '+v.nf+')':''));
    A(v&&Math.abs(v.dx-60)<1e-6&&Math.abs(v.dy-40)<1e-6&&Math.abs(v.dz-20)<1e-6,k+' : boîte 60 × 40 × 20');
  }
  console.log('— sans courbes 2D');
  const refsOk=(t)=>{const d=t.slice(t.indexOf('DATA;'));const def=new Set(),ref=new Set();
    d.replace(/#(\d+)\s*=/g,(m,n)=>{def.add(n);return m;});d.replace(/#(\d+)(?!\s*=)/g,(m,n)=>{ref.add(n);return m;});
    return [...ref].every(n=>def.has(n));};
  const nauo=(t)=>(t.match(/NEXT_ASSEMBLY_USAGE_OCCURRENCE\(/g)||[]).length;
  for(const k of ['trou','asm'])for(const sch of ['AP214','AP203']){
    const av=r.pc[k+' '+sch+' avec'],sa=r.pc[k+' '+sch+' sans'],n=k+' '+sch+' sans : ';
    A(/PCURVE\(/.test(av.t)&&/SEAM_CURVE\(/.test(av.t),k+' '+sch+' avec : PCURVE et SEAM_CURVE présentes');
    A(!/PCURVE|SURFACE_CURVE|SEAM_CURVE|DEFINITIONAL_REPRESENTATION|PARAMETRIC_REPRESENTATION_CONTEXT/.test(sa.t),n+'plus aucune courbe 2D ni contexte 2D');
    A(refsOk(sa.t),n+'toutes les références #n sont définies');
    A(sa.t.length<av.t.length*0.6,n+'fichier allégé ('+(sa.t.length/1024).toFixed(1)+' / '+(av.t.length/1024).toFixed(1)+' Ko)');
    A(nauo(sa.t)===nauo(av.t)&&(k!=='asm'||nauo(sa.t)===2),n+'même structure de produits ('+nauo(sa.t)+' occurrence(s) d\'assemblage)');
    const a=av.r,b=sa.r;
    A(a&&b&&a.ns===b.ns&&a.nf===b.nf&&Math.abs(a.v-b.v)<1e-6*a.v&&Math.abs(a.dx-b.dx)<1e-6&&b.ok,
      n+'relu à l\'identique, valide'+(b?' ('+b.ns+' solide(s), '+b.nf+' faces, '+b.v.toFixed(1)+' mm³)':''));
  }
  A(/CC_DESIGN_APPROVAL\(/.test(r.pc['asm AP203 sans'].t),'asm AP203 sans : entités de gestion AP203 conservées');
  console.log(ko?`\n${ko} ÉCHEC(S)`:'\nTOUT PASSE');
  process.exit(ko?1:0);
})().catch(e=>{console.log('  ✗ exception : '+(e&&e.stack||e));process.exit(1);});
