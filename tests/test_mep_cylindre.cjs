// 2026-10-26 : PLAN — génératrices d'un cylindre
//  • « les lignes projetées appartenant à un cercle sont des multilignes ! Une seule suffit » :
//    chaque génératrice vue de côté = UN trait ;
//  • « reconnaître automatiquement que c'est depuis un cylindre et donc mettre un Ø avant » :
//    distance entre les 2 génératrices → Ø ; entre deux faces planes parallèles → pas de Ø.
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
    const out={};const T=window.__mepTest;
    try{mepSetActive(true);}catch(err){out.err='mepSetActive '+err.message;}
    // cylindre Ø20 × 50, axe X, posé sur un pavé 40 × 30 × 10
    const ax=new occt.gp_Ax2_3(new occt.gp_Pnt_3(0,0,25),new occt.gp_Dir_4(1,0,0));
    const cyl=new occt.BRepPrimAPI_MakeCylinder_3(ax,10,50).Shape();
    const box=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,-15,0),40,30,10).Shape();
    const fu=new occt.BRepAlgoAPI_Fuse_3(cyl,box);
    const bd={id:'__cy__',bodyId:'__cy__',shape:fu.Shape(),mesh:{visible:true}};
    bodies.push(bd);
    const sh=doc.mep.sheets[doc.mep.cur];
    // vue de face : regard −Y, u = X, v = −Z
    const v={id:'__cv__',kind:'base',dir:[0,1,0],u:[1,0,0],v:[0,0,-1],x:100,y:100,scale:1,
      mode:'hide',tangent:false,hlrExact:true,bodyId:'__cy__',axes:[]};
    sh.views.push(v);
    const g=T.geo(v);
    out.src=g.src;
    const L=g.els.filter(e=>e.t==='L');
    const hz=y=>L.filter(e=>Math.abs(e.y1-y)<1e-3&&Math.abs(e.y2-y)<1e-3);
    // génératrices : z 35 (v −35) et z 15 (v −15, en partie cachée derrière… non : devant le pavé)
    out.top=hz(35).map(e=>[Math.min(e.x1,e.x2),Math.max(e.x1,e.x2)].map(x=>+x.toFixed(3)).join('-'));
    out.nL=L.length;
    const gTop=hz(35)[0],gBot=hz(15).find(e=>Math.max(e.x1,e.x2)>45);
    out.dia=!!(gTop&&gBot&&mepCylDiaBetween(v,gTop,gBot));
    const b0=hz(0)[0],b10=hz(10)[0];
    out.boxDia=!!(b0&&b10&&mepCylDiaBetween(v,b0,b10));
    out.mix=!!(gTop&&b10&&mepCylDiaBetween(v,gTop,b10));
    // pièce de RÉVOLUTION (fonction Révolution) : profil Ø20 × 50 + cône Ø20→Ø30, axe X
    const pg=new occt.BRepBuilderAPI_MakePolygon_1();
    [[0,0],[70,0],[70,15],[50,10],[0,10]].forEach(q=>pg.Add_1(new occt.gp_Pnt_3(q[0],q[1],0)));
    pg.Close();
    const fc=new occt.BRepBuilderAPI_MakeFace_15(pg.Wire(),true).Face();
    const rv=new occt.BRepPrimAPI_MakeRevol_1(fc,new occt.gp_Ax1_2(new occt.gp_Pnt_3(0,0,0),new occt.gp_Dir_4(1,0,0)),2*Math.PI,false);
    const bd2={id:'__rv__',bodyId:'__rv__',shape:rv.Shape(),mesh:{visible:true}};
    bodies.push(bd2);
    const v2=Object.assign({},v,{id:'__rvv__',bodyId:'__rv__'});
    sh.views.push(v2);
    const g2=T.geo(v2),L2=g2.els.filter(e=>e.t==='L');
    out.rvLs=L2.map(e=>[e.x1,e.y1,e.x2,e.y2].map(x=>+x.toFixed(2)).join(','));
    const hz2=y=>L2.filter(e=>Math.abs(e.y1-y)<1e-3&&Math.abs(e.y2-y)<1e-3);
    out.rvTop=hz2(10).length+'/'+hz2(-10).length;
    const t2=hz2(10)[0],b2=hz2(-10)[0];
    out.rvDia=!!(t2&&b2&&mepCylDiaBetween(v2,t2,b2));
    // une droite seule : cercle d'extrémité vu de profil (Ø20) ; bout du cône (Ø30, pas un
    // cylindre) ; génératrice (longueur, pas un diamètre)
    const P=(x,y)=>({x,y});
    out.segEnd=mepCylDiaSeg(v2,P(0,-10),P(0,10));
    out.segCone=mepCylDiaSeg(v2,P(70,-15),P(70,15));
    out.segGen=mepCylDiaSeg(v2,P(0,10),P(50,10));
    out.segOut=mepCylDiaSeg(v2,P(60,-10),P(60,10)); // hors de la longueur du cylindre
    out.segFuse=mepCylDiaSeg(v,P(50,15),P(50,35));
    // pose d'une cote de longueur sur l'arête d'extrémité → Ø20
    const iE=g2.els.findIndex(e=>e.t==='L'&&Math.abs(e.x1)<1e-3&&Math.abs(e.x2)<1e-3);
    const dl={id:'dl',kind:'len',vid:v2.id,vid2:null,a:{x:0,y:-10,hint:{t:'seg',i:iE}},b:{x:0,y:10},off:8,orient:'a',ref:false,tol:null};
    T.autoDia?T.autoDia(sh,dl):null;
    out.lenTxt=dl.dsym?mepDimText(dl,20):'(pas de Ø)';
    return out;
  })()`,ctx);
  console.log('  · '+JSON.stringify(r));
  A(r.src==='OCCT HLR','vue calculée par le HLR exact');
  A(r.top&&r.top.length===1&&r.top[0]==='0-50','génératrice du dessus : un seul trait de 0 à 50 ('+(r.top&&r.top.join(' '))+')');
  A(r.dia,'distance entre les 2 génératrices du cylindre : reconnue comme Ø');
  A(!r.boxDia,'deux faces planes parallèles : pas de Ø');
  A(!r.mix,'génératrice + face plane : pas de Ø');
  A(r.rvTop==='1/1','révolution : chaque génératrice du Ø20 = un seul trait ('+r.rvTop+')');
  A(r.rvDia,'révolution : distance entre génératrices reconnue comme Ø');
  A(r.segEnd,'droite seule : arête du cercle d’extrémité vue de profil → Ø');
  A(r.segFuse,'droite seule sur le cylindre fusionné → Ø');
  A(!r.segCone,'bout du cône (pas un cylindre) : pas de Ø');
  A(!r.segGen,'génératrice (une longueur) : pas de Ø');
  A(!r.segOut,'même diamètre hors de la longueur du cylindre : pas de Ø');
  A(r.lenTxt==='Ø20','cote de longueur posée sur l’arête d’extrémité : « Ø20 » ('+r.lenTxt+')');
  console.log(ko?'ÉCHEC '+ko:'OK');
  process.exit(ko?1:0);
})();
