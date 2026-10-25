// 2026-10-22-003/004/005 : PLAN —
//  • cote de longueur re-ancrée après « reprojeter » : au coin d'un rectangle, l'arête
//    voisine (perpendiculaire) n'est plus prise pour l'arête cotée (100 → 0) ;
//  • axe de symétrie ASSOCIATIF : suit ses 2 droites quand la pièce change ;
//  • hachures réglables (motif, angle, échelle, couleur) communes à toutes les coupes.
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
    const mkBox=(x,y,z)=>new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),x,y,z).Shape();
    const nb=bodies.length;
    const bd={id:'__bx__',bodyId:'__bx__',shape:mkBox(100,65,20),mesh:{visible:true}};
    bodies.push(bd);
    const sh=doc.mep.sheets[doc.mep.cur];
    const par={id:'__par__',kind:'base',dir:[0,0,-1],u:[1,0,0],v:[0,-1,0],x:100,y:100,scale:1,
      mode:'hide',tangent:false,hlrExact:true,bodyId:'__bx__',axes:[]};
    sh.views.push(par);
    try{
      // ── 1. cote de longueur sur une arête horizontale, point a au coin partagé avec
      //       une arête verticale d'INDEX PLUS PETIT (cas qui cassait : 100 → 0)
      const g=T.geo(par),L=g.els.map((e,i)=>Object.assign({i},e)).filter(e=>e.t==='L');
      const isH=e=>Math.abs(e.y1-e.y2)<1e-6&&Math.abs(Math.abs(e.x2-e.x1)-100)<1e-3;
      const isV=e=>Math.abs(e.x1-e.x2)<1e-6&&Math.abs(Math.abs(e.y2-e.y1)-65)<1e-3;
      const near=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1])<1e-6;
      let pick=null;
      L.filter(isH).forEach(h=>L.filter(isV).forEach(v=>{
        if(pick||v.i>h.i)return;
        [[h.x1,h.y1],[h.x2,h.y2]].forEach((c,k)=>{
          if(!pick&&(near(c,[v.x1,v.y1])||near(c,[v.x2,v.y2])))pick={h,c,o:k?[h.x1,h.y1]:[h.x2,h.y2]};
        });
      }));
      out.casOk=!!pick;
      if(pick){
        const d={id:'__d__',kind:'len',vid:par.id,vid2:null,orient:'h',off:10,
          a:{x:pick.c[0],y:pick.c[1],hint:{t:'seg',i:pick.h.i}},b:{x:pick.o[0],y:pick.o[1]}};
        sh.dims.push(d);
        out.v0=window.mepDimValue(d);
        T.reproject(null);
        out.v1=window.mepDimValue(d);
        T.reproject(null);
        out.v2=window.mepDimValue(d);
        // ── 1b. glisser une cote posée : décalage (lignes de rappel) ET valeur le long de la ligne
        d.off=10;d.txtOff=0;
        const S=window.mepDimTextPos(d);
        const pkD={off0:d.off,txtOff0:0,sx:S.x,sy:S.y,labelHit:true};
        const g0=window.mepDimLine(d),perp=[-g0.uy,g0.ux];
        window.mepDimMoveTo(d,{x:S.x+perp[0]*8,y:S.y+perp[1]*8},pkD);
        out.drgPerp=[+Math.abs(d.off-10).toFixed(6),+(+d.txtOff||0).toFixed(6)];
        window.mepDimMoveTo(d,{x:S.x+perp[0]*8+g0.ux*65,y:S.y+perp[1]*8+g0.uy*65},pkD);
        out.drgBoth=[+Math.abs(d.off-10).toFixed(6),+(+d.txtOff||0).toFixed(6)];
        out.drgVal=window.mepDimValue(d);
        sh.dims.splice(sh.dims.indexOf(d),1);
        // ── 1c. aligner sur une cote de référence : 2 cotes horizontales (haut / bas) + 1 verticale
        const hs=L.filter(isH),vv=L.filter(isV);
        const mkD=(id,e,o,off)=>({id,kind:'len',vid:par.id,vid2:null,orient:o,off,
          a:{x:e.x1,y:e.y1,hint:{t:'seg',i:e.i}},b:{x:e.x2,y:e.y2}});
        const dR=mkD('__dR__',hs[0],'h',-10),dH=mkD('__dH__',hs[1],'h',30),dV=mkD('__dV__',vv[0],'v',12);
        sh.dims.push(dR,dH,dV);
        const yR=window.mepDimLine(dR).a1.y,yH0=window.mepDimLine(dH).a1.y,xV0=window.mepDimLine(dV).a1.x;
        const res=T.dimAlignTo(dR,['__dH__','__dV__','__dR__']);
        out.alRes=JSON.stringify(res);
        out.alY=[+yR.toFixed(4),+yH0.toFixed(4),+window.mepDimLine(dH).a1.y.toFixed(4)];
        out.alV=Math.abs(window.mepDimLine(dV).a1.x-xV0)<1e-9;
        out.alVal=window.mepDimValue(dH);
        // ── 1d. double-clic détecté à l'appui : 2 appuis rapprochés sur la cote = flèches inversées, une fois
        const tpR=window.mepDimTextPos(dR),PR={x:tpR.x,y:tpR.y,px:500,py:300};
        const arr0=dR.arr||'in';
        const p1=T.dimPressDbl(PR,{}),arr1=dR.arr||'in';
        const p2=T.dimPressDbl(PR,{}),arr2=dR.arr||'in';
        const p3=T.dimPressDbl(PR,{}); // 3ᵉ appui : un nouveau 1er clic, rien
        out.dbl=[p1,p2,p3,arr0===arr1,arr2!==arr0,(dR.arr||'in')===arr2].join(',');
        sh.dims.splice(sh.dims.indexOf(dR),3);
        // ── 1e. cotation d'ordonnées X puis Y depuis le coin (0,0) de la vue de dessus (pavé 100 × 65)
        const recD=d=>{const o={lines:[],texts:[]};T.drawDim((tag,a)=>{const e=Object.assign({tag},a,{textContent:'',appendChild:c=>{e.textContent+=(e.textContent?'|':'')+(c.textContent||'');}});
          if(tag==='line')o.lines.push(e);if(tag==='text')o.texts.push(e);return e;},d);return o;};
        const nD0=sh.dims.length;
        T.ordClick({x:100,y:100,px:0,py:0},'x');T.ordClick({x:200,y:100,px:0,py:0},'x');T.ordClick({x:200,y:165,px:0,py:0},'x');T.ordEnd();
        const dX=sh.dims[sh.dims.length-1];
        const rX=recD(dX);
        out.ordX=dX.kind+'|'+rX.texts.map(t=>t.textContent).join(',')+'|'+(new Set(rX.texts.map(t=>(+t.y).toFixed(3))).size);
        const S0=window.mepDimTextPos(dX),pkO={off0:dX.off,sx:S0.x,sy:S0.y};
        window.mepDimMoveTo(dX,{x:S0.x+30,y:S0.y-12},pkO);
        const rX2=recD(dX);
        out.ordXmove=(+rX2.texts[0].y-(+rX.texts[0].y)).toFixed(3)+'|'+rX2.texts.every((t,i)=>Math.abs((+t.y)-(+rX.texts[i].y)+12)<1e-6&&+t.x===+rX.texts[i].x);
        T.ordClick({x:100,y:165,px:0,py:0},'y');T.ordClick({x:100,y:100,px:0,py:0},'y');T.ordEnd();
        const dY=sh.dims[sh.dims.length-1];
        out.ordY=recD(dY).texts.map(t=>t.textContent).join(',');
        out.ordN=sh.dims.length-nD0;
        // origine en haut, point en dessous (côté négatif) : la valeur reste positive
        T.ordClick({x:100,y:100,px:0,py:0},'y');T.ordClick({x:100,y:165,px:0,py:0},'y');T.ordEnd();
        out.ordNeg=recD(sh.dims[sh.dims.length-1]).texts.map(t=>t.textContent).join(',');
        // supprimer UNE valeur du groupe : 0, 100, 50 → clic près du 50 → 0, 100
        T.ordClick({x:100,y:100,px:0,py:0},'x');T.ordClick({x:200,y:100,px:0,py:0},'x');T.ordClick({x:150,y:100,px:0,py:0},'x');T.ordEnd();
        const dD=sh.dims[sh.dims.length-1],v0=recD(dD).texts.map(t=>t.textContent).join(',');
        const iD=T.ordPtAt(dD,{x:152,y:60}),iO=T.ordPtAt(dD,{x:99,y:60});
        const okD=T.ordDelPt(dD,iD),okO=T.ordDelPt(dD,iO);
        out.ordDel=v0+'|'+iD+'|'+iO+'|'+okD+'|'+okO+'|'+recD(dD).texts.map(t=>t.textContent).join(',');
        // tolérance sur UNE valeur du groupe (H7 sur 100) : les autres restent nues
        dD.pts[0].tol={m:'cls',cls:'H7'};
        const rT=recD(dD);
        out.ordTol=rT.texts.map(t=>t.textContent).join(',');
        // ajouter une valeur à un groupe existant : groupe sélectionné + outil Ordonnées X
        const nBefore=sh.dims.length,ptsBefore=dD.pts.length;
        T.selDim(dD.id);window.mepSetTool('ordx');
        T.ordClick({x:200,y:165,px:0,py:0},'x');T.ordEnd();window.mepSetTool('select');
        out.ordAdd=(sh.dims.length-nBefore)+'|'+(dD.pts.length-ptsBefore);
        // 2026-10-23 : valeur désignée seule en rouge ; cassure = rappel coudé (3 traits), valeur décalée
        T.ordPick(dD,0);const rS=recD(dD);T.ordPick(null);
        const red=rS.lines.filter(l=>/mepDimSel/.test(l.class||'')).length,redT=rS.texts.filter(t=>/mepDimSel/.test(t.class||'')).length;
        const n0=recD(dD).lines.length;dD.pts[0].jog=8;const rJ=recD(dD);delete dD.pts[0].jog;
        out.ordPick=red===1&&redT>=1&&redT<rS.texts.length&&rJ.lines.length===n0+2;out.ordPickDbg=red+'/'+redT+' traits rouges, '+n0+'→'+rJ.lines.length+' traits avec cassure';
        // perçage : tolérance posée après le 1er Ø de l'étiquette
        out.holeTol=[T.holeTolText('Ø8 ↧12',{m:'cls',cls:'H7'}),T.holeTolText('M10×1.25 ↧18\\nØ8.5 ↧25',{m:'pm',s:0.05}),
          T.holeTolText('Ø6.6 déb.',{m:'dbl',hi:0.1,lo:-0.05}),T.holeTolText('Ø6.6 déb.',null)].join(' | ');
        sh.dims.length=nD0;
        // ── 1f. note à flèche : texte libre multiligne souligné, flèche sur la pointe
        const dN={id:'__dN__',kind:'note',vid:par.id,vid2:null,a:{x:50,y:-30},b:{x:80,y:-50},off:0,txt:'REPÈRE A\\nTrempé'};
        sh.dims.push(dN);
        const rN=recD(dN);
        out.note=rN.texts.length+'|'+rN.lines.length+'|'+rN.lines.some(l=>l['marker-end'])+'|'+JSON.stringify(window.mepDimTextPos(dN));
        sh.dims.splice(sh.dims.indexOf(dN),1);
      }
      // ── 2. axe de symétrie entre les 2 arêtes verticales : x = 50, puis pièce élargie à 140 → x = 70
      const vs=L.filter(isV);
      const ln=e=>({x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2});
      const ann={id:'__sym__',kind:'sym',l1:ln(vs[0]),l2:ln(vs[1])};
      par.axes.push(ann);
      const mid=p=>(p.x1+p.x2)/2;
      const p0=T.axisManual(par,ann);out.ax0=p0.length?mid(p0[0]):null;
      bd.shape=mkBox(140,65,20);T.geoClear();
      const p1=T.axisManual(par,ann);out.ax1=p1.length?mid(p1[0]):null;
      out.vert1=p1.length?Math.abs(p1[0].x1-p1[0].x2)<1e-6:false;
      bd.shape=mkBox(120,65,20);T.geoClear();
      const p2=T.axisManual(par,ann);out.ax2=p2.length?mid(p2[0]):null;
      par.axes.length=0;
      // ── 2b. point accroché à un trait d'axe MANUEL : rattachement (cote d'avant) puis suivi de l'axe
      const annF={id:'__axF__',kind:'free',a:{x:30,y:-10},b:{x:30,y:80}};
      par.axes.push(annF);
      const qD={x:30,y:20};
      T.ptRefresh(par,qD,'v');
      out.axRef=qD.hint?qD.hint.t+':'+qD.hint.ak:'aucune';
      annF.a={x:37,y:-10};annF.b={x:37,y:80};T.geoClear(); // l'axe se déplace de 7 mm (cache des traits d'axe vidé, comme après une modification)
      T.ptRefresh(par,qD,'v');
      out.axFollow=[+qD.x.toFixed(4),+qD.y.toFixed(4)];
      const qH={x:30,y:20};T.ptRefresh(par,qH,'h'); // mauvaise direction : pas de rattachement
      out.axNoH=!qH.hint;
      par.axes.length=0;
      // ── 3. hachures : défaut historique, puis acier 30° × 2 en rouge
      const loops=[[[0,0],[20,0],[20,10],[0,10]]];
      const draw=c=>{const r=[];T.drawHatch((tag,a)=>{r.push(Object.assign({tag},a));return{};},loops,{x:0,y:0,scale:1},c);return r;};
      out.cfg0=JSON.stringify(T.hatchCfg());
      const d0=draw();out.n0=d0.length;out.style0=d0.some(e=>e.style);
      out.slope0=d0.length?Math.round(Math.atan2(d0[0].y2-d0[0].y1,d0[0].x2-d0[0].x1)*180/Math.PI):null;
      T.hatchApply({pat:'acier',ang:30,sc:2,col:'#ff0000'});
      out.cfg1=JSON.stringify(doc.mep.hatch);
      const d1=draw();out.n1=d1.length;out.style1=d1.every(e=>e.style==='stroke:#ff0000');
      out.slope1=d1.length?Math.round(Math.atan2(d1[0].y2-d1[0].y1,d1[0].x2-d1[0].x1)*180/Math.PI):null;
      out.ser=serialise(false).indexOf('"acier"')>=0;
      T.hatchApply({pat:'plein',ang:45,sc:1,col:''});
      const d2=draw();out.plein=d2.length===1&&d2[0].tag==='path'&&/mepHatchFill/.test(d2[0].class);
      T.hatchApply({pat:'plast',ang:45,sc:1,col:''});
      out.dash=draw().every(e=>e['stroke-dasharray']==='2 1');
      doc.mep.hatch=undefined;
      out.back=JSON.stringify(T.hatchCfg())===out.cfg0&&draw().length===out.n0;
      // ── 4. ligne de coupe : Ctrl + clic brise au curseur, Maj + clic retire la brisure la plus proche
      const sv={id:'__sv__',kind:'section',parent:par.id,x:100,y:250,scale:1,axes:[],
        section:{a:[0,0],b:[60,0],pid:par.id,p:[0,0,0],n:[0,1,0]}};
      sh.views.push(sv);
      out.brk1=T.cutBreakClick(sh,sv,0,20)&&JSON.stringify(sv.section.pts);
      out.brk2=T.cutBreakClick(sh,sv,1,40)&&JSON.stringify(sv.section.pts);
      // Maj + clic sur le 1er plan, près de la marche x=20 : le plan cliqué (c=0) reste, le suivant part
      out.del1=T.cutDelBreakAt(sh,sv,0,18)&&JSON.stringify(T.cutModel(sv).c)+'|'+JSON.stringify(T.cutModel(sv).steps);
      out.del2=T.cutDelBreakAt(sh,sv,1,40)&&JSON.stringify(sv.section.pts||null)+'|'+JSON.stringify(sv.section.a)+JSON.stringify(sv.section.b);
      out.del3=T.cutDelBreakAt(sh,sv,0,30);
      sh.views.splice(sh.views.indexOf(sv),1);
      // ── 5. vue oblique (cavalière 45°, k 0,5) d'un pavé 60 × 40 × 20 vu de face
      bd.shape=mkBox(60,40,20);T.geoClear();
      const fv={id:'__fv__',kind:'base',vk:'front',dir:[0,-1,0],u:[1,0,0],v:[0,0,-1],x:100,y:300,scale:1,
        mode:'hide',tangent:false,hlrExact:true,bodyId:'__bx__',axes:[],obl:{a:45,k:0.5}};
      sh.views.push(fv);
      const gO=T.geo(fv),LO=gO.els.filter(e=>e.t==='L');
      const xs=[],ys=[];LO.forEach(e=>{xs.push(e.x1,e.x2);ys.push(e.y1,e.y2);});
      out.oblSrc=gO.src;out.oblN=LO.length;
      out.oblW=Math.max(...xs)-Math.min(...xs);out.oblH=Math.max(...ys)-Math.min(...ys);
      out.oblDiag=LO.filter(e=>Math.abs(Math.abs(e.x2-e.x1)-Math.abs(e.y2-e.y1))<1e-3&&Math.abs(e.x2-e.x1)>1).length;
      // ombrage : la face de droite (normale +X) est de chant en orthogonale, vue en cavalière
      const tri=[[60,0,0],[60,40,0],[60,40,20]];
      const fO=T.shadeTri(fv,tri[0],tri[1],tri[2],0x888888,1);
      out.shadeObl=!!fO&&JSON.stringify(fO.p.map(q=>[+q[0].toFixed(3),+q[1].toFixed(3)]));
      delete fv.obl;T.geoClear();
      out.shadeOrtho=T.shadeTri(fv,tri[0],tri[1],tri[2],0x888888,1);
      const gF=T.geo(fv),xf=[];gF.els.forEach(e=>{if(e.t==='L')xf.push(e.x1,e.x2);});
      out.orthoW=Math.max(...xf)-Math.min(...xf);
      sh.views.splice(sh.views.indexOf(fv),1);
      // ── 6. filetage ISO 6410 : M8, longueur filetée 12, percé depuis le dessus en (30,20,20)
      const hA0=holeAxis,hN0=holeNorm,F0=doc.features,S0=doc.sketches;
      holeAxis=()=>({dir:{x:0,y:0,z:-1},pts:[{id:'p1',x:30,y:20,z:20}]});
      holeNorm=()=>({kind:'simple',d:6.8,r:3.4,depth:16,end:'blind',tip:118});
      doc.sketches=[{id:'skT'}];
      doc.features=[{id:'hT',type:'hole',sketchId:'skT',d:6.8,thread:{size:'M8',p:1.25,len:12},_thLen:12}];
      const vTop={id:'__vt__',kind:'base',vk:'top',dir:[0,0,1],u:[1,0,0],v:[0,-1,0],x:0,y:0,scale:1,mode:'hide',axes:[]};
      const vBot={id:'__vb__',kind:'base',vk:'bottom',dir:[0,0,-1],u:[1,0,0],v:[0,1,0],x:0,y:0,scale:1,mode:'hide',axes:[]};
      const vSec={id:'__vs__',kind:'section',dir:[0,1,0],u:[1,0,0],v:[0,0,-1],x:0,y:0,scale:1,mode:'hide',axes:[],
        section:{p:[0,20,0],n:[0,1,0],a:[0,20],b:[60,20]}};
      const vFr={id:'__vf__',kind:'base',vk:'front',dir:[0,-1,0],u:[1,0,0],v:[0,0,-1],x:0,y:0,scale:1,mode:'dash',axes:[]};
      const r2=x=>Math.round(x*1000)/1000;
      const sum=l=>l.map(e=>e.t==='A'?['A',r2(e.cx),r2(e.cy),e.r,r2(e.a1-e.a0),e.k]:['L',r2(e.x1),r2(e.y1),r2(e.x2),r2(e.y2),e.k]);
      out.thTop=JSON.stringify(sum(T.threadEls(vTop)));
      out.thBot=T.threadEls(vBot).length;
      out.thDet=JSON.stringify(sum(T.threadEls(Object.assign({},vTop,{id:'__vd__',kind:'detail',parent:'__vt__',detail:{cx:30,cy:-20,r:10}})))); // 2026-10-23 : détails aussi
      out.thSec=JSON.stringify(sum(T.threadEls(vSec)));
      out.thFr=JSON.stringify(T.threadEls(vFr).map(e=>e.k));
      vFr.mode='hide';out.thFrHide=T.threadEls(vFr).length;
      doc.features[0].thread.lenMode='through';out.thThru=T.threadEls(vSec).length;
      doc.features[0].thread.model=true;out.thModel=T.threadEls(vTop).length;
      holeAxis=hA0;holeNorm=hN0;doc.features=F0;doc.sketches=S0;
      // ── 7. Ø40 H7 (+0,025 / 0) calé à droite (leader à droite) : la pile tient avant le point d'attache
      const rec=[];const mkR=(tag,a)=>{const o=Object.assign({tag},a,{textContent:''});rec.push(o);return o;};
      T.dimDrawText(mkR,{},'Ø40 H7','+0.025','0',100,50,'end',null,false,'',true,'');
      const xs7=rec.map(o=>+o.x);
      const close=rec.find(o=>o.textContent&&o.textContent[0]===')')||rec[rec.length-1];
      out.endMainX=+rec[0].x;out.endClose=+close.x;out.endW=T.dimStackW('+0.025','0',true,'');
      out.endOk=rec[0].x<100&&Math.max(...xs7)<100&&xs7.slice(1).every(x=>x>+rec[0].x);
      rec.length=0;T.dimDrawText(mkR,{},'Ø40 H7','+0.025','0',100,50,'start',null,false,'',true,'');
      out.startOk=+rec[0].x===100&&rec.slice(1).every(o=>+o.x>100);
    }catch(err){out.err=(out.err||'')+' '+err.message+' '+err.stack;}
    sh.views.splice(sh.views.indexOf(par),1);
    bodies.length=nb;
    return out;
  })()`,ctx);
  if(r.err)console.log('  (info) '+r.err);
  A(r.casOk,'cas test trouvé : coin partagé avec une arête verticale d’index plus petit');
  console.log('  · cote : '+r.v0+' → reprojection '+r.v1+' → '+r.v2);
  A(Math.abs(r.v0-100)<1e-6&&Math.abs(r.v1-100)<1e-6&&Math.abs(r.v2-100)<1e-6,'cote de longueur 100 conservée après reprojection (plus de 0)');
  console.log('  · glisser la cote : perpendiculaire '+JSON.stringify(r.drgPerp)+' ; + le long '+JSON.stringify(r.drgBoth));
  A(JSON.stringify(r.drgPerp)==='[8,0]','glisser perpendiculaire : la cote suit les lignes de rappel (décalage +8), la valeur reste centrée');
  A(JSON.stringify(r.drgBoth)==='[8,65]'&&Math.abs(r.drgVal-100)<1e-6,'glisser en biais : décalage ET valeur déplacée le long de la ligne (65), cote toujours 100');
  console.log('  · aligner : '+r.alRes+' ; y réf / avant / après '+JSON.stringify(r.alY));
  A(r.alRes==='{"n":1,"skip":1}'&&r.alY&&r.alY[2]===r.alY[0]&&r.alY[1]!==r.alY[0],'aligner : la cote horizontale prend la ligne de la référence, la verticale est ignorée');
  A(r.alV&&Math.abs(r.alVal-100)<1e-6,'aligner : la cote non parallèle ne bouge pas, la valeur alignée reste 100');
  A(r.dbl==='false,true,false,true,true,true','double-clic sur une cote (détecté à l’appui) : flèches inversées une seule fois');
  console.log('  · ordonnées X '+r.ordX+' ; glisser '+r.ordXmove+' ; Y '+r.ordY+' ; note '+r.note);
  A(r.ordX==='ord|0,100,100|1','ordonnées X : « 0 » puis 100 et 100, toutes les valeurs sur une même ligne');
  A(r.ordXmove==='-12.000|true','ordonnées : glisser une valeur déplace tout le groupe (perpendiculaire à l’axe seulement)');
  console.log('  · ordonnées, suppression d’un point : '+r.ordDel);
  A(r.ordDel==='0,100,50|1|-1|true|false|0,100','ordonnées : le clic désigne la valeur la plus proche, seule elle est supprimée (l’origine reste)');
  console.log('  · ordonnées, tolérance d’un point : '+r.ordTol+' ; perçage : '+r.holeTol);
  A(r.ordTol==='0,100 H7,+0.035,0,(,)','ordonnées : tolérance H7 sur une seule valeur (écarts entre parenthèses), l’origine reste nue');
  A(r.holeTol==='Ø8 H7 (+0.015 / 0) ↧12 | M10×1.25 ↧18\nØ8.5 ±0.05 ↧25 | Ø6.6 +0.1 / −0.05 déb. | Ø6.6 déb.','perçage : tolérance après le Ø (classe ISO, ±, double), rien sans tolérance');
  A(r.ordAdd==='0|1','ordonnées : groupe sélectionné + outil Ordonnées → la valeur s’AJOUTE au groupe (pas de nouveau « 0 »)');
  A(r.ordNeg==='0,65','ordonnées : jamais de valeur négative (point du côté opposé : 65, pas −65)');
  A(r.ordY==='0,65'&&r.ordN===2,'ordonnées Y : « 0 » puis 65 (vers le haut) ; une cote par groupe');
  A(/^1\|\d+\|true\|\{"x":180,"y":50\}$/.test(r.note||''),'note à flèche : un texte, flèche + souligné, texte placé au point choisi');
  console.log('  · axe de symétrie : x '+r.ax0+' → (140) '+r.ax1+' → (120) '+r.ax2);
  A(Math.abs(r.ax0-50)<1e-6,'axe de symétrie au milieu des 2 arêtes (x 50)');
  A(Math.abs(r.ax1-70)<1e-6&&r.vert1,'pièce élargie à 140 : l’axe suit ses arêtes (x 70, toujours vertical)');
  A(Math.abs(r.ax2-60)<1e-6,'pièce ramenée à 120 : l’axe suit encore (x 60)');
  console.log('  · point sur axe : '+r.axRef+' → '+JSON.stringify(r.axFollow));
  A(r.axRef==='axp:m__axF__.0','point posé sur un axe manuel (vertical) : rattaché à l’axe');
  A(JSON.stringify(r.axFollow)==='[37,20]'&&r.axNoH,'l’axe se déplace de 7 : le point suit ; axe de mauvaise direction : pas de rattachement');
  console.log('  · hachures : défaut '+r.cfg0+' '+r.n0+' traits '+r.slope0+'° ; réglées '+r.cfg1+' '+r.n1+' traits '+r.slope1+'°');
  A(r.cfg0==='{"pat":"iso","ang":45,"sc":1,"col":"","parts":true}'&&!r.style0,'hachures par défaut : ISO 128-50 45°, couleur du thème, une hachure par pièce (V0.8.2)');
  A(r.cfg1==='{"pat":"acier","ang":30,"sc":2,"col":"#ff0000"}'&&r.ser,'réglage commun enregistré dans le document (doc.mep.hatch)');
  A(r.style1&&r.n1>0&&Math.abs(r.slope0)!==Math.abs(r.slope1),'acier 30° rouge : traits recolorés et réorientés');
  A(r.plein,'motif plein : une surface remplie (pair-impair)');
  A(r.dash,'motif plastique : traits tiretés');
  A(r.back,'réglage effacé : retour au rendu historique');
  console.log('  · coupe : '+r.brk1+' → '+r.brk2+' ; retrait '+r.del1+' → '+r.del2);
  A(r.brk1==='[[0,0],[20,0],[20,10],[60,10]]','Ctrl + clic : brisure au curseur (x 20), morceau suivant décalé de 10');
  A(r.brk2==='[[0,0],[20,0],[20,10],[40,10],[40,20],[60,20]]','Ctrl + clic sur le 2e plan : 2e brisure (x 40)');
  A(r.del1==='[0,20]|[40]','Maj + clic près de x 20 : cette brisure seule retirée, le plan cliqué reste');
  A(r.del2==='null|[0,0][60,0]','Maj + clic sur la marche restante : ligne droite rendue');
  A(r.del3===false,'Maj + clic sans brisure : rien à retirer');
  console.log('  · oblique : '+r.oblSrc+', '+r.oblN+' traits, '+(+r.oblW).toFixed(3)+' × '+(+r.oblH).toFixed(3)+', fuyantes '+r.oblDiag+' ; orthogonale '+r.orthoW);
  const fu=0.5*40*Math.SQRT1_2;
  A(r.oblSrc==='OCCT HLR'&&Math.abs(r.oblW-(60+fu))<1e-3&&Math.abs(r.oblH-(20+fu))<1e-3,'cavalière 45° k 0,5 : face en vraie grandeur + fuyantes 0,5 × 40 (74,14 × 34,14)');
  A(r.oblN===9&&r.oblDiag===3,'pavé en cavalière : 9 arêtes vues dont 3 fuyantes à 45° (3 cachées supprimées)');
  A(Math.abs(r.orthoW-60)<1e-3,'retour en orthogonale : vue de face 60 de large');
  console.log('  · ombrage oblique : '+r.shadeObl);
  A(r.shadeObl==='[[60,0],[74.142,-14.142],[74.142,-34.142]]'&&r.shadeOrtho===null,'ombrage : face de chant en orthogonale, vue et cisaillée en cavalière');
  console.log('  · filetage : dessus '+r.thTop+' ; coupe '+r.thSec+' ; face '+r.thFr);
  A(r.ordPick,'ordonnées : valeur désignée seule en rouge, cassure en 3 traits ('+r.ordPickDbg+')');
  A(r.thTop==='[["A",30,-20,4,4.712,"thread"]]','vue en bout (entrée vue) : 3/4 de cercle fin au Ø nominal 8');
  A(r.thDet===r.thTop,'vue de détail : même représentation du filetage que sa vue mère');
  A(r.thBot===0,'vue de dessous (trou borgne, entrée cachée) : pas de 3/4 de cercle');
  A(r.thSec==='[["L",26,20,26,8,"thread"],["L",34,20,34,8,"thread"],["L",26,8,34,8,"sharp"]]','coupe par l’axe : 2 traits fins au Ø 8 sur 12 + trait fort de fin de filetage');
  A(r.thFr==='["threadH","threadH","threadH"]'&&r.thFrHide===0,'vue de face : filet caché en interrompu (mode pointillé), rien en cachées supprimées');
  A(r.thThru===2,'filetage débouchant : pas de trait de fin de filetage');
  A(r.thModel===0,'filet modélisé : rien d’ajouté (géométrie réelle)');
  console.log('  · Ø40 H7 calé à droite : texte x '+r.endMainX+', « ) » x '+r.endClose+', pile '+(+r.endW).toFixed(2));
  A(r.endOk&&r.endClose<100&&100-r.endClose<r.endW,'cote calée à droite : texte reculé, écarts et parenthèses AVANT le point d’attache du leader');
  A(r.startOk,'cote calée à gauche : écarts après le texte');
  console.log(ko?'ÉCHEC '+ko:'OK');
  process.exit(ko?1:0);
})();
