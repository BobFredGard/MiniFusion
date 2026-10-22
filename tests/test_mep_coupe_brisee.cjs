// 2026-10-22-013 : COUPE BRISÉE (plans parallèles, ISO 128-44) — la ligne de coupe
// se pose point par point, chaque tronçon à l'équerre du précédent. La matière
// ôtée est un prisme en escalier : hachures sur CHAQUE plan de coupe, aucun trait
// dans la vue en coupe là où le plan change.
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
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};window.confirm=function(){return true;};showAll=function(){};',ctx);
  const r=await vm.runInContext(`(async()=>{
    const out={};
    try{mepSetActive(true);}catch(err){out.err='mepSetActive '+err.message;}
    // pavé 60 × 40 × 20
    const mb=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),60,40,20);
    const box=mb.Shape();
    const nb=bodies.length;
    bodies.push({id:'__bx__',bodyId:'__bx__',shape:box,mesh:{visible:true}});
    const sh=doc.mep.sheets[doc.mep.cur];
    // vue de dessus (mepBasisOf : v = [0,1,0]) : x local = X, y local = Y
    const par={id:'__par__',kind:'base',dir:[0,0,-1],u:[1,0,0],v:[0,-1,0],x:100,y:100,scale:1,
      mode:'hide',tangent:false,hlrExact:true,bodyId:'__bx__',axes:[]};
    sh.views.push(par);
    const pts=[[-5,10],[30,10],[30,30],[65,30]]; // Y=10 puis Y=30, marche en X=30
    const mkSec=(id,stepped)=>({id,kind:'section',parent:par.id,dir:[0,1,0],u:[1,0,0],v:[0,0,1],x:100,y:200,scale:1,
      mode:'hide',tangent:false,hlrExact:true,bodyId:'__bx__',axes:[],
      section:Object.assign({p:[-5,10,0],n:[0,1,0],a:pts[0],b:pts[1],pid:par.id},stepped?{pts}:{})});
    const vs=mkSec('__secS__',true),v1=mkSec('__sec1__',false);
    sh.views.push(vs,v1);
    try{
      const st=window.__mepTest.secStepped(vs);
      const cut=window.__mepTest.cutPrism(box,st.poly,st.vec);
      const gp=new occt.GProp_GProps_1();occt.BRepGProp.VolumeProperties_1(cut,gp,false,false,false);out.vol=gp.Mass();
      const span=ls=>ls.map(l=>{const xs=l.map(p=>Math.abs(p[0]));return[Math.round(Math.min(...xs)),Math.round(Math.max(...xs))];});
      out.p1=span(window.__mepTest.hatchLoops([cut],vs,st.planes[0],[0,1,0]));
      out.p2=span(window.__mepTest.hatchLoops([cut],vs,st.planes[1],[0,1,0]));
      const gS=window.__mepTest.geo(vs),g1=window.__mepTest.geo(v1);
      out.src=gS.src;out.hS=(gS.hatch||[]).length;out.h1=(g1.hatch||[]).length;
      const at30=g=>g.els.filter(e=>e.t==='L'&&Math.abs(Math.abs(e.x1)-30)<1e-3&&Math.abs(Math.abs(e.x2)-30)<1e-3).length;
      out.step30=at30(gS);out.n=gS.els.length;
      // profondeurs des hachures (Y du plan) : 10 et 30
      const ys=[];
      (gS.hatch||[]).forEach(l=>{const xs=l.map(p=>p[0]);ys.push([Math.min(...xs),Math.max(...xs)].map(x=>Math.round(Math.abs(x))));});
      out.spans=ys;
    }catch(err){out.err=(out.err||'')+' geo '+err.message+' '+err.stack;}
    sh.views.splice(sh.views.indexOf(par),3);
    bodies.length=nb;
    return out;
  })()`,ctx);
  if(r.err)console.log('  (info) '+r.err);
  console.log('  · coupe brisée : '+r.src+', '+r.n+' segments, hachures '+r.hS+' '+JSON.stringify(r.spans)+' ; coupe simple : hachures '+r.h1);
  A(r.src==='OCCT HLR','coupe brisée : HLR exact sur la matière coupée en escalier');
  console.log('  · volume restant '+r.vol+' ; hachures plan Y=10 '+JSON.stringify(r.p1)+' ; plan Y=30 '+JSON.stringify(r.p2));
  A(Math.abs(r.vol-24000)<1e-3,'matière ôtée en escalier : reste 30×10×20 + 30×30×20 = 24 000 mm³');
  A(JSON.stringify(r.p1)==='[[0,30]]'&&JSON.stringify(r.p2)==='[[30,60]]','une face hachurée par plan de coupe (X 0→30 sur Y=10, 30→60 sur Y=30)');
  A(r.hS>=1&&JSON.stringify(r.spans).indexOf('[0,60]')>=0,'vue en coupe : les 2 plans hachurés d’un seul tenant (0→60)');
  A(r.step30===0,'aucun trait dans la vue en coupe au changement de plan (X = 30)');
  console.log(ko?'ÉCHEC '+ko:'OK');
  process.exit(ko?1:0);
})();
