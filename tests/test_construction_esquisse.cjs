// Géométrie de construction sur le VRAI noyau OCCT : esquisse sur un plan de
// construction → extrusion au bon endroit ; plan décalé d'une FACE qui suit la
// pièce quand la hauteur change ; axe d'une face cylindrique ; point sur un
// sommet qui suit l'arête ; repli sans noyau (position mémorisée, ⚠).
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
    const near=(a,b,t)=>Array.isArray(a)&&a.every((x,i)=>Math.abs(x-b[i])<(t||1e-3));
    const V=(a,b,msg,t)=>att(near(a,b,t),msg+' : vu ['+(a||[]).map(x=>+(+x).toFixed(4)).join(', ')+'] attendu ['+b.join(', ')+']');
    const bb=sh=>{const b=new occt.Bnd_Box_1();b.SetGap(0);occt.BRepBndLib.Add(sh,b,false);const a=b.CornerMin(),z=b.CornerMax();const r=[a.X(),a.Y(),a.Z(),z.X(),z.Y(),z.Z()];b.delete();return r;};
    const faces=sh=>{const out=[];const ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);while(ex.More()){out.push(occt.TopoDS.Face_1(ex.Current()));ex.Next();}ex.delete();return out;};
    const mkRect=(id,x0,y0,w,h,extra)=>{const sk=Object.assign({id,name:id,plane:'XY',origin:[0,0,0],points:{},entities:[],constraints:[],dims:[],seq:1,visible:true},extra||{});
      [['p0',x0,y0],['p1',x0+w,y0],['p2',x0+w,y0+h],['p3',x0,y0+h]].forEach(q=>{sk.points[q[0]]={x:q[1],y:q[2]};});
      sk.entities.push({id:id+'e0',t:'line',p1:'p0',p2:'p1'},{id:id+'e1',t:'line',p1:'p1',p2:'p2'},{id:id+'e2',t:'line',p1:'p2',p2:'p3'},{id:id+'e3',t:'line',p1:'p3',p2:'p0'});return sk;};
    const replay=()=>{cgResolveAll();try{resolveAllSketchHosts();}catch(e){}occCk.length=0;const FR=occFinalShape(null);occLive={shape:FR.shape};return FR;};
    docResetEmpty();
    // ── bloc 100 × 60 × 40 ──
    doc.sketches=[mkRect('skA',0,0,100,60)];
    doc.bodies=[{id:'b1',name:'Corps 1',c:null}];doc.bodySeq=2;doc.activeBody='b1';
    doc.features=[{id:'exA',type:'extrude',name:'Bloc',sketchId:'skA',op:'add',distance:40,body:'b1'}];
    let FR=replay();
    // ── plan décalé de 5 au-dessus de la face du DESSUS ──
    const top=faces(FR.shape).map(f=>occFaceRefAny(f)).find(r=>r&&r.n&&r.n[2]>0.99);
    att(!!top,'face du dessus trouvée');
    const P1=cgNew('plane','offset',[{k:'face',ref:top,name:'Face 1'}],{d:5});
    att(P1.at==='exA','plan ancré après le bloc');
    att(P1.st==='ok','plan sur face résolu ('+P1.msg+')');
    V(P1.fr.o,[50,30,45],'plan décalé de la face du dessus');V(P1.fr.z,[0,0,1],'normale sortante');
    // ── esquisse sur ce plan → plot 20 × 20 × 10 ──
    doc.sketches.push(mkRect('skB',10,10,20,20,{plane:'CG',cg:{id:P1.id}}));
    doc.features.push({id:'exB',type:'extrude',name:'Plot',sketchId:'skB',op:'add',distance:10,body:'b1'});
    FR=replay();
    const skB=doc.sketches.find(s=>s.id==='skB');
    V(skB.origin,[50,30,45],'esquisse : origine = plan');
    let B=bb(FR.shape);
    p('avec plot : z '+B[2].toFixed(3)+' .. '+B[5].toFixed(3));
    att(Math.abs(B[5]-55)<1e-6,'plot posé sur le plan : z max 55 (vu '+B[5].toFixed(4)+')');
    // ── la hauteur du bloc change : face → plan → esquisse → plot suivent ──
    doc.features[0].distance=50;
    FR=replay();
    V(P1.fr.o,[50,30,55],'le plan suit la face du dessus');
    B=bb(FR.shape);
    att(Math.abs(B[5]-65)<1e-6,'le plot suit : z max 65 (vu '+B[5].toFixed(4)+')');
    // ── axe d'une face cylindrique ──
    doc.sketches.push({id:'skC',name:'Rond',plane:'XY',origin:[0,0,0],points:{c:{x:200,y:30}},entities:[{id:'c1',t:'circle',pc:'c',r:10}],constraints:[],dims:[],seq:1,visible:true});
    doc.features.push({id:'exC',type:'extrude',name:'Cylindre',sketchId:'skC',op:'add',distance:30,body:'b1'});
    FR=replay();
    const cyl=faces(FR.shape).find(f=>occSurfKind(f)==='Cylinder');
    att(!!cyl,'face cylindrique trouvée');
    const A1=cgNew('axis','ref',[{k:'face',ref:occFaceRefAny(cyl),name:'Face 2'}]);
    att(A1.st==='ok','axe du cylindre résolu ('+A1.msg+')');
    V([A1.fr.o[0],A1.fr.o[1]],[200,30],'axe du cylindre : passe par le centre');
    att(Math.abs(Math.abs(A1.fr.z[2])-1)<1e-9,'axe du cylindre : vertical');
    // ── point sur un sommet : coin (100, 60, haut) ──
    const E=occListEdges(FR.shape).find(e=>Math.abs(e.mid[0]-100)<1e-6&&Math.abs(e.mid[1]-60)<1e-6);
    att(!!E,'arête verticale du coin trouvée');
    const Q1=cgNew('point','ref',[{k:'vtx',pos:E.mid,len:E.len,vpos:[100,60,50],name:'Sommet 1'}]);
    V(Q1.fr.o,[100,60,50],'point sur le sommet du haut');
    doc.features[0].distance=40;
    FR=replay();
    V(Q1.fr.o,[100,60,40],'le sommet suit la hauteur du bloc');
    V(P1.fr.o,[50,30,45],'le plan revient avec la face');
    // ── plan perpendiculaire à une arête, au ratio (V0.19.9) : arête droite du coin, cercle du cylindre ──
    {
      const Ev=occListEdges(FR.shape).find(e=>Math.abs(e.mid[0]-100)<1e-6&&Math.abs(e.mid[1]-60)<1e-6);
      const Pv=cgNew('plane','curve',[{k:'edge',pos:Ev.mid,len:Ev.len,name:'Droite'}],{t:0.25});
      att(Pv.st==='ok'&&Math.abs(Math.abs(Pv.fr.z[2])-1)<1e-9,'⟂ arête verticale : normale verticale ('+Pv.msg+')');
      att(Math.abs(Pv.fr.o[0]-100)<1e-6&&Math.abs(Pv.fr.o[1]-60)<1e-6&&(Math.abs(Pv.fr.o[2]-10)<1e-6||Math.abs(Pv.fr.o[2]-30)<1e-6),'⟂ arête verticale t=0,25 : au quart (vu '+Pv.fr.o.join(', ')+')');
      const Ec=occListEdges(FR.shape).find(e=>Math.abs(e.mid[2]-30)<1e-6&&Math.hypot(e.mid[0]-200,e.mid[1]-30)>9.9&&Math.hypot(e.mid[0]-200,e.mid[1]-30)<10.1);
      att(!!Ec,'cercle du haut du cylindre trouvé');
      if(Ec){
        const Pc=cgNew('plane','curve',[{k:'edge',pos:Ec.mid,len:Ec.len,name:'Cercle'}],{t:0.3});
        const r=[Pc.fr.o[0]-200,Pc.fr.o[1]-30,0];
        att(Pc.st==='ok'&&Math.abs(Math.hypot(r[0],r[1])-10)<1e-3&&Math.abs(Pc.fr.o[2]-30)<1e-6,'⟂ cercle : origine sur le cercle (vu '+Pc.fr.o.join(', ')+')');
        att(Math.abs(Pc.fr.z[2])<1e-6&&Math.abs(r[0]*Pc.fr.z[0]+r[1]*Pc.fr.z[1])<1e-3,'⟂ cercle : normale tangente (horizontale, ⟂ rayon)');
      }
    }
    // ── marqueur : le plan est résolu sur le solide AVANT lui (antériorité) ──
    att(cgUpto(P1)===1,'plan : 1 fonction rejouée avant lui (vu '+cgUpto(P1)+')');
    // ── sans noyau exact : position mémorisée, ⚠ ──
    const keep=JSON.stringify(P1.fr);
    const _has=occHas;occHas=()=>false;
    cgResolveAll();
    occHas=_has;
    att(JSON.stringify(P1.fr)===keep,'sans noyau : le plan garde sa position');
    att(P1.st==='warn'&&/noyau exact indisponible/.test(P1.msg),'sans noyau : ⚠ explicite ('+P1.msg+')');
    FR=replay();
    att(P1.st==='ok','noyau revenu : plan de nouveau résolu');
    // ── sauvegarde : les références à la pièce sont sérialisables ──
    const js=serialise();
    att(js.indexOf('"k": "face"')>=0&&js.indexOf('"k": "vtx"')>=0,'références face / sommet écrites');
    if(ATT.length){p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  x '+m));}
    else p('TOUT EST CONFORME');
    return P.join(String.fromCharCode(10));
  `;
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'construction-occt.js'});
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,800));process.exit(1);});
