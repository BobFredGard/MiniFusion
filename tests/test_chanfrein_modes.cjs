// V0.11.19 : chanfrein à DEUX DISTANCES ou DISTANCE + ANGLE, avec inversion de la première face
// (idée SolidCraft `solid.chamfer`). Noyau réel. Pièce : boîte 40×30×20 extrudée depuis une
// esquisse ; arête du haut y=0 (milieu (20, 0, 20)) entre le dessus (+Z) et la face avant (−Y).
// Première face = celle qui regarde le plus vers le haut = le dessus : D1 s'y mesure, D2 sur la
// face avant. Vérifications par le VOLUME enlevé (section triangulaire × 40 mm) et par la
// position de la nouvelle arête du chanfrein sur le dessus (y = D1, ou y = D2 après inversion).
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};',ctx);
  const R=[
    "const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};",
    "occt=__realOcct;occtReady=true;",
    "const sk={id:'s',name:'s',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{a:{x:0,y:0},b:{x:40,y:0},c:{x:40,y:30},d:{x:0,y:30}},",
    "  entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],constraints:[],dims:[],seq:9,visible:false};",
    "doc.sketches=[sk];doc.features=[{id:'F',type:'extrude',name:'P',sketchId:'s',distance:20,op:'add',visible:true}];doc.bodies=[];markDirty();rebuild();",
    "const vol=sh=>{const G=new occt.GProp_GProps_1();occt.BRepGProp.VolumeProperties_1(sh,G,false,false,false);const v=G.Mass();try{G.delete();}catch(e){}return v;};",
    "const ok=sh=>{try{const c=new occt.BRepCheck_Analyzer(sh,true,false);return c.IsValid();}catch(e){return null;}};",
    "const near=(a,b,t)=>Math.abs(a-b)<=t;",
    "const edgeAt=(sh,p)=>occListEdges(sh).some(e=>Math.hypot(e.mid[0]-p[0],e.mid[1]-p[1],e.mid[2]-p[2])<0.05);",
    "const base=occLive.shape,E=occListEdges(base),V0=vol(base);",
    "A(near(V0,24000,1e-6),'0 : boîte 40×30×20, volume 24000 ('+V0.toFixed(3)+')');",
    "const e0=E.find(e=>near(e.mid[0],20,1e-6)&&near(e.mid[1],0,1e-6)&&near(e.mid[2],20,1e-6));",
    "A(!!e0,'0 : arête du haut y=0 trouvée');",
    "const job=()=>[{src:e0.src,r:2,mid:e0.mid.slice()}];",
    "const run=(opts)=>{const w=[];const s=occFilletRun(base,job(),w,true,opts);return {s,w,v:s?vol(s):NaN};};",
    // 1. distance égale (inchangé) : section ½·2·2 = 2 mm² × 40 = 80
    "const eq=run(null);",
    "A(eq.s&&near(eq.v,24000-80,0.01),'1 : distance égale D2 : volume 23920 ('+eq.v.toFixed(3)+')');",
    "A(edgeAt(eq.s,[20,2,20])&&edgeAt(eq.s,[20,0,18]),'1 : arêtes du chanfrein à y=2 sur le dessus et z=18 sur la face avant');",
    // 2. deux distances D1=2 (dessus), D2=6 (face avant) : ½·2·6 = 6 mm² × 40 = 240
    "const d2=run({cham:{mode:'d2',d2:6,ang:45,flip:false}});",
    "A(d2.s&&near(d2.v,24000-240,0.01),'2 : deux distances 2/6 : volume 23760 ('+d2.v.toFixed(3)+')');",
    "A(d2.s&&ok(d2.s)!==false,'2 : solide valide');",
    "A(d2.s&&edgeAt(d2.s,[20,2,20])&&edgeAt(d2.s,[20,0,14]),'2 : D1=2 sur le DESSUS (première face = celle qui regarde en haut), D2=6 descend la face avant (z=14)');",
    // 3. inversion : D1=2 sur la face avant, D2=6 sur le dessus
    "const d2f=run({cham:{mode:'d2',d2:6,ang:45,flip:true}});",
    "A(d2f.s&&near(d2f.v,24000-240,0.01),'3 : inversé : même volume 23760 ('+d2f.v.toFixed(3)+')');",
    "A(d2f.s&&edgeAt(d2f.s,[20,6,20])&&edgeAt(d2f.s,[20,0,18]),'3 : inversé : D2=6 sur le dessus (y=6), D1=2 sur la face avant (z=18)');",
    // 4. distance + angle : D1=2 sur le dessus, angle 30° entre le chanfrein et le dessus → D2 = 2·tan30 = 1,1547
    "const da=run({cham:{mode:'da',d2:0,ang:30,flip:false}});",
    "const D2=2*Math.tan(Math.PI/6);",
    "A(da.s&&near(da.v,24000-40*0.5*2*D2,0.01),'4 : distance + angle 2 ∠ 30° : volume '+(24000-40*D2).toFixed(3)+' ('+(da.s?da.v.toFixed(3):'?')+')');",
    "A(da.s&&edgeAt(da.s,[20,2,20])&&edgeAt(da.s,[20,0,20-D2]),'4 : D1=2 sur le dessus, D2=1,155 sur la face avant');",
    "const daf=run({cham:{mode:'da',d2:0,ang:30,flip:true}});",
    "A(daf.s&&near(daf.v,24000-40*D2,0.01)&&edgeAt(daf.s,[20,D2,20])&&edgeAt(daf.s,[20,0,18]),'4 : inversé : D1=2 sur la face avant, 1,155 sur le dessus');",
    // 5. arête SEULE (case tangentes décochée) : l'outil extrudé respecte aussi D1/D2 et l'angle
    "const s2=run({single:true,cham:{mode:'d2',d2:6,ang:45,flip:false}});",
    "A(s2.s&&near(s2.v,24000-240,0.01)&&edgeAt(s2.s,[20,2,20])&&edgeAt(s2.s,[20,0,14]),'5 : arête seule, deux distances : volume 23760 et D1 sur le dessus ('+(s2.s?s2.v.toFixed(3):'?')+')');",
    "const s2f=run({single:true,cham:{mode:'d2',d2:6,ang:45,flip:true}});",
    "A(s2f.s&&near(s2f.v,24000-240,0.01)&&edgeAt(s2f.s,[20,6,20]),'5 : arête seule, inversé : D2 sur le dessus');",
    "const s3=run({single:true,cham:{mode:'da',d2:0,ang:30,flip:false}});",
    "A(s3.s&&near(s3.v,24000-40*D2,0.01)&&edgeAt(s3.s,[20,2,20]),'5 : arête seule, distance + angle : volume '+(24000-40*D2).toFixed(3)+' ('+(s3.s?s3.v.toFixed(3):'?')+')');",
    // 6. par le DOCUMENT : fonction chanfrein exact + rejeu, signature et édition du type
    "const xf={id:'C',type:'xfillet',name:'c',chamfer:true,cmode:'d2',cd2:6,tangent:true,visible:true,edges:[{pos:e0.mid.slice(),pos0:e0.mid.slice(),r:2,len:40,anchor:null,name:'e',seed:1}]};",
    "doc.features.push(xf);",
    "const final=()=>{freshHard=true;occCkClear();markDirty();rebuild();const FR=occFinalShape(null);const sh=FR.perBody[0].shape;const r={v:vol(sh),y2:edgeAt(sh,[20,2,20]),y6:edgeAt(sh,[20,6,20]),m:xf._m?xf._m.m+'/'+xf._m.t:'?'};occCleanup(FR,null);return r;};",
    "const f1=final();",
    "A(near(f1.v,23760,0.01)&&f1.y2&&f1.m==='1/1','6 : fonction cmode=d2 : volume 23760, D1 sur le dessus, 1/1 arête ('+f1.v.toFixed(3)+', '+f1.m+')');",
    "const sig1=featSig(xf);xf.cflip=true;const sig2=featSig(xf);",
    "A(sig1!==sig2,'6 : l\\u2019inversion change la signature de rejeu (cache non réutilisé)');",
    "const f2=final();",
    "A(near(f2.v,23760,0.01)&&f2.y6,'6 : cflip : D2=6 sur le dessus après rejeu');",
    "xf.cmode='da';xf.cang=30;xf.cflip=false;const sig3=featSig(xf);",
    "A(sig3!==sig2&&sig3!==sig1,'6 : passage à distance + angle : signature distincte');",
    "const f3=final();",
    "A(near(f3.v,24000-40*D2,0.01)&&f3.y2,'6 : cmode=da 30° au rejeu : volume '+(24000-40*D2).toFixed(3)+' ('+f3.v.toFixed(3)+')');",
    "xf.cmode='eq';delete xf.cang;const f4=final();",
    "A(near(f4.v,23920,0.01),'6 : retour à distance égale : volume 23920 ('+f4.v.toFixed(3)+')');",
    "A(xChamOpts(xf)===null&&xChamKey(xChamOpts({chamfer:true,cmode:'d2',cd2:6}))==='d2:6:45:0','7 : xChamOpts : eq → null, d2 → clé « d2:6:45:0 »');",
    "A(xChamLabel({chamfer:true,cmode:'da',cang:30,cflip:true})===' · ∠ 30° ⇄'&&xChamLabel({chamfer:true})==='','7 : xChamLabel : suffixe lisible');",
    // 8. par la COMMANDE (enterExactFilletMode / applyExactFillet) : la normale de la première face est mémorisée
    "doc.features=doc.features.filter(f=>f.type!=='xfillet');freshHard=true;occCkClear();markDirty();rebuild();",
    "enterExactFilletMode(null,'chamfer');filModeX.radius=2;filModeX.cmode='d2';filModeX.cd2=6;filModeX.cflip=false;",
    "let i0=-1;filModeX.edges.forEach((e,i)=>{if(near(e.mid[0],20,1e-3)&&near(e.mid[1],0,1e-3)&&near(e.mid[2],20,1e-3))i0=i;});",
    "A(i0>=0,'8 : arête du haut y=0 listée par la commande');xSeedAdd(i0);xSelSync();applyExactFillet();",
    "const made=doc.features.find(f=>f.type==='xfillet');",
    "A(made&&made.chamfer&&made.cmode==='d2'&&made.cd2===6&&made.cflip===false,'8 : fonction créée en deux distances (cmode d2, D2 6)');",
    "A(made&&Array.isArray(made.edges[0].fn)&&near(made.edges[0].fn[2],1,1e-3),'8 : fn mémorisée = normale du dessus ('+JSON.stringify(made&&made.edges[0].fn)+')');",
    "const f8=(()=>{freshHard=true;occCkClear();markDirty();rebuild();const FR=occFinalShape(null);const sh=FR.perBody[0].shape;const r={v:vol(sh),y2:edgeAt(sh,[20,2,20])};occCleanup(FR,null);return r;})();",
    "A(near(f8.v,23760,0.01)&&f8.y2,'8 : rejeu : volume 23760, D1 sur le dessus ('+f8.v.toFixed(3)+')');",
    // édition : la normale est gardée telle quelle, l'inversion se fait par cflip
    "enterExactFilletMode(made);filModeX.cflip=true;applyExactFillet();",
    "A(made.cflip===true&&near(made.edges[0].fn[2],1,1e-3),'8 : édition + inversion : fn inchangée, cflip posé');",
    "const f9=(()=>{freshHard=true;occCkClear();markDirty();rebuild();const FR=occFinalShape(null);const sh=FR.perBody[0].shape;const r={v:vol(sh),y6:edgeAt(sh,[20,6,20])};occCleanup(FR,null);return r;})();",
    "A(near(f9.v,23760,0.01)&&f9.y6,'8 : après inversion : D2=6 sur le dessus');",
    "return out;"
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== V0.11.19 : chanfrein deux distances / distance + angle / inversion ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
