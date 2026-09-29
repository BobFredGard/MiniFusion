// Miroir d'esquisse avec ARCS : le sens de balayage des arcs doit suivre le repère.
// Non-régression 31s : en repère miroir (gaucher), occWireFromChain construisait le
// cercle autour de +n dans tous les cas -> les arcs prenaient le mauvais côté
// (slot miroir amputé de ses extrémités : outil large de 52 au lieu de 60).
// Test : slot 40x12 + R6 décentré en y, miroir XZ simple. L'outil miroir doit être
// le miroir EXACT de l'outil source (bbox symétrique, même nombre de faces).
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
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    "const bb=function(sh){const b=new occt.Bnd_Box_1();occt.BRepBndLib.Add(sh,b,true);const a=b.CornerMin(),z=b.CornerMax();b.delete();return [a.X(),a.Y(),a.Z(),z.X(),z.Y(),z.Z()];};",
    "const f1=v=>v.toFixed(1);",
    "const nf=function(sh){let n=0;const ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);while(ex.More()){n++;ex.Next();}ex.delete();return n;};",
    // slot 40x12, R6 aux bouts, décentré en y=30 (le miroir XZ se voit)
    "const sk={id:'sk_t',name:'Slot',plane:'XY',origin:[0,0,0],points:{},entities:[],constraints:[],dims:[]};",
    "const DY=30;",
    "[['p23',-20,6],['p24',20,6],['p25',-20,-6],['p26',20,-6],['p27',-20,0],['p28',20,0]].forEach(q=>{sk.points[q[0]]={x:q[1],y:q[2]+DY};});",
    "sk.entities.push({id:'e29',t:'line',p1:'p23',p2:'p24'});",
    "sk.entities.push({id:'e30',t:'line',p1:'p25',p2:'p26'});",
    "sk.entities.push({id:'e31',t:'arc',pc:'p27',pa:'p23',pb:'p25',r:6});",
    "sk.entities.push({id:'e32',t:'arc',pc:'p28',pa:'p26',pb:'p24',r:6});",
    "doc.sketches=[sk];",
    "doc.features=[{id:'ex_t',type:'extrude',name:'Slot',sketchId:'sk_t',op:'add',distance:2}];",
    "occSkipFeat=null;",
    "const outil=id=>{const f=doc.features.find(x=>x.id===id);const o=occShapeOfExtrude(f);const b=bb(o.shape);const n=nf(o.shape);return{b:b,n:n};};",
    "const src=outil('ex_t');",
    "p('outil source : x '+f1(src.b[0])+'..'+f1(src.b[3])+' y '+f1(src.b[1])+'..'+f1(src.b[4])+' ('+src.n+' faces)');",
    "att(Math.abs(src.b[0]+26)<0.7&&Math.abs(src.b[3]-26)<0.7,'source : x attendu -26..26 (avec arcs R6)');",
    // miroir SIMPLE across XZ
    "const rp={id:'rp_t',type:'repeat',name:'Symétrie',mode:'mir',copies:1,plane:'XZ',base:['ex_t'],children:[],visible:true};",
    "doc.features.push(rp);",
    "const n1=repGenChildren(rp);",
    "att(n1===1,'miroir simple : 1 instance, obtenu '+n1);",
    "const kid=doc.features.find(f=>f.repeatId==='rp_t');",
    "att(!!kid,'instance miroir présente');",
    "const mir=outil(kid.id);",
    "p('outil miroir : x '+f1(mir.b[0])+'..'+f1(mir.b[3])+' y '+f1(mir.b[1])+'..'+f1(mir.b[4])+' ('+mir.n+' faces)');",
    "att(mir.n===src.n,'miroir : même nombre de faces ('+mir.n+' vs '+src.n+')');",
    "att(Math.abs(mir.b[0]+26)<0.7&&Math.abs(mir.b[3]-26)<0.7,'miroir : x attendu -26..26 (arcs conservés, pas 52 tronqué)');",
    "att(Math.abs(mir.b[1]+36)<0.7&&Math.abs(mir.b[4]+24)<0.7,'miroir : y attendu -36..-24 (symétrique de 24..36)');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  x '+m));}",
    "else{p('');p('TOUT EST CONFORME');}",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'mirror_arc.js'});
  console.log(r);
  process.exit(/ECHECS \(\d+\)/.test(r)?1:0);
})().catch(e=>{console.error('FATAL',String((e&&e.message)||e).slice(0,500));process.exit(1);});
