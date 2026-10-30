// V0.23.7 : COUPE LOCALE — « choisir une vue, dessiner une patate (forme libre fermée), puis choisir
// une arête de la vue qui définit le plan de coupe ; si l'arête change, le plan change ».
// Pavé 60 × 40 × 20 percé d'un trou Ø8 le long de X (axe Y = 20, Z = 10), vu de face (regard Y) :
// le trou est en traits cachés ; la génératrice choisie (z local = 6) est à la profondeur Y = 20.
// Dans la forme : plan Y = 20 → trou VU (arêtes vives) et hachures ; hors forme : toujours caché.
// Le trou passe à Y = 30 : même trait 2D, nouvelle profondeur → le plan suit (Y = 30).
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
    const T=window.__mepTest;
    const part=yh=>{ // pavé percé le long de X à Y = yh
      const box=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),60,40,20).Shape();
      const ax=new occt.gp_Ax2_3(new occt.gp_Pnt_3(-5,yh,10),new occt.gp_Dir_4(1,0,0));
      const cyl=new occt.BRepPrimAPI_MakeCylinder_3(ax,4,70).Shape();
      return new occt.BRepAlgoAPI_Cut_3(box,cyl).Shape();
    };
    const nb=bodies.length,bd={id:'__bx__',bodyId:'__bx__',shape:part(20),mesh:{visible:true}};
    bodies.push(bd);
    const sh=doc.mep.sheets[doc.mep.cur];
    // vue de face (comme une vue en coupe Y) : x local = X, y local = Z
    const v={id:'__loc__',kind:'base',dir:[0,1,0],u:[1,0,0],v:[0,0,1],x:100,y:100,scale:1,
      mode:'dash',tangent:false,hlrExact:true,bodyId:'__bx__',axes:[]};
    sh.views.push(v);
    try{
      const g0=T.geo(v);
      out.src=g0.src;
      const hid=g0.els.filter(e=>e.t==='L'&&e.k==='hidden'&&Math.abs(e.y1-6)<1e-3&&Math.abs(e.y2-6)<1e-3);
      out.hid=hid.length;out.w0=hid.length?hid[0].w:null;
      // patate autour du milieu du trou (X 20..40), hors des bords
      const e=hid.find(q=>Math.min(q.x1,q.x2)<30&&Math.max(q.x1,q.x2)>30)||hid[0];
      v.locals=[{id:'L1',pts:[[20,2],[40,2],[42,10],[40,18],[20,18],[18,10]],
        ref:{x:30,y:6,s:{t:'L',x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2,k:e.k},w:e.w}}];
      T.geoClear();
      const g1=T.geo(v);
      const vis6=g1.els.filter(q=>q.t==='L'&&q.k==='sharp'&&Math.abs(q.y1-6)<1e-3&&Math.abs(q.y2-6)<1e-3);
      const hid6=g1.els.filter(q=>q.t==='L'&&q.k==='hidden'&&Math.abs(q.y1-6)<1e-3&&Math.abs(q.y2-6)<1e-3);
      out.vis6=vis6.map(q=>[Math.min(q.x1,q.x2),Math.max(q.x1,q.x2)].map(x=>+x.toFixed(1)));
      out.hid6=hid6.map(q=>[Math.min(q.x1,q.x2),Math.max(q.x1,q.x2)].map(x=>+x.toFixed(1)));
      out.hatch=(g1.hatchLoc||[]).map(h=>h.loops.length);
      out.brk=g1.els.filter(q=>q.k==='brk').length;
      out.full=(g1.fullEls||[]).length;
      // le trou recule à Y = 30 : même trait 2D, nouvelle profondeur
      bd.shape=part(30);T.geoClear();
      const g2=T.geo(v);
      out.w2=v.locals[0].ref.w;out.lost=!!v.locals[0].lost;
      out.vis6b=g2.els.filter(q=>q.t==='L'&&q.k==='sharp'&&Math.abs(q.y1-6)<1e-3&&Math.abs(q.y2-6)<1e-3).length;
      // forme : courbe fermée lisse passant par les points cliqués
      const C=T.locCurve([[0,0],[10,0],[10,10],[0,10]]);
      out.curveThrough=[[0,0],[10,0],[10,10],[0,10]].every(p=>C.some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<1e-9));
      // rognage d'un segment par la forme : dedans / dehors
      const sq=[[0,0],[10,0],[10,10],[0,10]];
      out.clipIn=T.clipSegPoly(-5,5,15,5,sq,true).map(s=>s.slice(0,4).map(x=>+x.toFixed(3)));
      out.clipOut=T.clipSegPoly(-5,5,15,5,sq,false).map(s=>s.slice(0,4).map(x=>+x.toFixed(3)));
    }catch(err){out.err=(out.err||'')+' geo '+err.message+' '+err.stack;}
    sh.views.splice(sh.views.indexOf(v),1);
    bodies.length=nb;
    return out;
  })()`,ctx);
  if(r.err)console.log('  (info) '+r.err);
  console.log('  · '+r.src+' ; génératrice cachée z=6 : '+r.hid+' trait(s), profondeur '+r.w0);
  A(r.src==='OCCT HLR'&&r.hid>0&&Math.abs(r.w0-20)<1e-6,'HLR exact : chaque trait porte sa profondeur (génératrice du trou à Y = 20)');
  console.log('  · avec la coupe : vus '+JSON.stringify(r.vis6)+' ; cachés '+JSON.stringify(r.hid6)+' ; hachures '+JSON.stringify(r.hatch)+' ; limite '+r.brk);
  A(r.vis6&&r.vis6.length&&r.vis6.every(s=>s[0]>=17&&s[1]<=43),'dans la forme : le trou coupé est VU (arête vive), seulement dans la forme');
  A(r.hid6&&r.hid6.some(s=>s[0]<1)&&r.hid6.some(s=>s[1]>59),'hors de la forme : le trou reste en traits cachés des deux côtés');
  A(r.hatch&&r.hatch.length===1&&r.hatch[0]>0,'hachures de la face coupée');
  A(r.brk>0,'limite de la coupe : trait fin continu');
  A(r.full>0,'vue entière gardée pour retrouver l’arête');
  console.log('  · trou déplacé à Y = 30 : plan à '+r.w2+(r.lost?' (arête perdue)':'')+' ; vus '+r.vis6b);
  A(Math.abs(r.w2-30)<1e-6&&!r.lost,'l’arête change de profondeur → le plan suit (Y = 30)');
  A(r.vis6b>0,'après le changement : le trou est toujours coupé');
  A(r.curveThrough,'forme lisse passant par les points cliqués');
  A(JSON.stringify(r.clipIn)==='[[0,5,10,5]]'&&JSON.stringify(r.clipOut)==='[[-5,5,0,5],[10,5,15,5]]','rognage d’un trait : dedans / dehors de la forme');
  console.log(ko?'FAIL '+ko+' assertion(s)':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})();
