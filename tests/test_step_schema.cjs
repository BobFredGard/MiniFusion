// 2026-10-28 : export STEP au choix AP214 / AP203.
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
      return {nf,ns,dx:z.X()-a.X(),dy:z.Y()-a.Y(),dz:z.Z()-a.Z()};
    };
    const mk=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),60,40,20);
    const sh=mk.Shape();
    const b214=occWriteStep([sh],'/s.stp','AP214');
    const b203=occWriteStep([sh],'/s.stp','AP203');
    return {t214:txt(b214),t203:txt(b203),r214:relire(b214),r203:relire(b203)};
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
  console.log(ko?`\n${ko} ÉCHEC(S)`:'\nTOUT PASSE');
  process.exit(ko?1:0);
})().catch(e=>{console.log('  ✗ exception : '+(e&&e.stack||e));process.exit(1);});
