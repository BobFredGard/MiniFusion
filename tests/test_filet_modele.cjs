// 2026-10-19 : filet TARAUDÉ MODÉLISÉ pour impression 3D (ISO 68-1 / ISO 965-1).
// Demande : « pour l'impression 3D, modéliser les filets des trous taraudés, avec la
// norme associée, jeu d'impression 0,2 mm, noyau exact uniquement ».
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(m){window.__al=m;};',ctx);
  const R=[
    "const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};",
    "occt=__realOcct;occtReady=true;",
    "const box={id:'skB',name:'Bloc',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{a:{x:0,y:0},b:{x:100,y:0},c:{x:100,y:60},d:{x:0,y:60}},",
    "  entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],constraints:[],dims:[],seq:20,visible:false};",
    "const mk=(id,pts)=>{const P={},E=[];pts.forEach((q,i)=>{P['h'+i]={x:q[0],y:q[1]};E.push({id:'e'+i,t:'cpoint',p:'h'+i,hole:true});});",
    "  return {id:id,name:id,plane:'XY',origin:[0,0,30],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:P,entities:E,constraints:[],dims:[],seq:30,visible:false};};",
    "doc.sketches=[box,mk('s1',[[30,30]]),mk('s2',[[70,30]]),mk('s3',[[50,30]])];",
    "doc.features=[{id:'E',type:'extrude',name:'Bloc',sketchId:'skB',distance:30,op:'add',visible:true}];",
    "doc.bodies=[];delete doc.activeBody;markDirty();rebuild();",
    // M8 × 1,25 débouchant, filet modélisé 20 mm, jeu 0,2
    "askHole('s1');const f1=doc.features[doc.features.length-1];f1.d=tapDrill('M8',1.25);f1.end='through';",
    "f1.thread={size:'M8',p:1.25,len:20,lenMode:'len',model:true,clear:0.2};f1.name=holeName(f1);",
    // M8 × 1,25 borgne avec lamage : le filet commence APRÈS le lamage, jeu 0
    "askHole('s2');const f2=doc.features[doc.features.length-1];f2.kind='cbore';f2.d=tapDrill('M8',1.25);f2.cbD=11;f2.cbH=6;",
    "f2.end='blind';f2.depth=18;f2.tip=0;f2.thread={size:'M8',p:1.25,len:10,lenMode:'len',model:true,clear:0};f2.name=holeName(f2);",
    // fraisure simple : même profil empilé (cône + fût), sans filet
    "askHole('s3');const f3=doc.features[doc.features.length-1];f3.kind='csink';f3.d=6.8;f3.csD=11;f3.csA=90;",
    "f3.end='blind';f3.depth=18;f3.tip=0;f3.name=holeName(f3);",
    "markDirty();rebuild();",
    "A(builtEngine==='exact'&&!doc.features.some(f=>f._err),'1 : rejeu exact du filet modélisé sans erreur');",
    "const vol=occCoqueVolume(occLive.shape),nf=occCoqueNFaces(occLive.shape);",
    "out.log.push('volume '+vol.toFixed(1)+' mm3, '+nf+' faces');",
    "A(vol>170000&&vol<180000,'2 : volume du bloc plausible ('+vol.toFixed(1)+' mm3)');",
    // classification : matière (IN) / vide (OUT)
    "const cl=new occt.BRepClass3d_SolidClassifier_2(occLive.shape);",
    "const IN=occt.TopAbs_State.TopAbs_IN,OUT=occt.TopAbs_State.TopAbs_OUT;",
    "const st=(x,y,z)=>{const p=new occt.gp_Pnt_3(x,y,z);cl.Perform(p,1e-6);const s=cl.State();p.delete();return s;};",
    "const fracOut=(cx,cy,r,z)=>{let n=0,N=144;for(let k=0;k<N;k++){const a=k/N*Math.PI*2;if(st(cx+r*Math.cos(a),cy+r*Math.sin(a),z)===OUT)n++;}return n/N;};",
    "const th1=isoHoleThread('M8',1.25,0.2),th2=isoHoleThread('M8',1.25,0);",
    // V0.21.16 : un seul solide (le cœur du trou ne reste plus en solide séparé)
    "{const ex=new occt.TopExp_Explorer_2(occLive.shape,occt.TopAbs_ShapeEnum.TopAbs_SOLID,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);let n=0;for(;ex.More();ex.Next())n++;",
    " A(n===1,'10a : un seul solide après les perçages filetés ('+n+')');}",
    "A(st(30,30,25)===OUT&&st(30,30,5)===OUT,'10b : axe du trou fileté débouchant vide sur toute la hauteur');",
    // V0.21.16 : coupe AXIALE du trou lamé (jeu 0) = trapèze ISO : racine au Ø 8, crête au
    // Ø de perçage (6,75 ≥ D1 6,647), flancs à 60° (pente radiale/axiale = tan 60°)
    // rayon où commence la matière, par dichotomie (le profil est monotone sur le rayon)
    "{const rad=z=>{let a=3.2,b=4.3;for(let k=0;k<12;k++){const m=(a+b)/2;if(st(70+m,30,z)===OUT)a=m;else b=m;}return (a+b)/2;};",
    " const zs=[],rs=[];for(let z=17;z>14.5;z-=0.025){zs.push(z);rs.push(rad(z));}",
    " const mx=Math.max(...rs),mn=Math.min(...rs);",
    " A(Math.abs(mx-4)<0.01,'11a : coupe axiale, racine du filet au Ø majeur 8 (R'+mx.toFixed(3)+')');",
    " A(Math.abs(mn-3.375)<0.01,'11b : coupe axiale, crête au Ø de perçage 6,75 (R'+mn.toFixed(3)+')');",
    " let sl=[];for(let i=1;i<rs.length;i++){const d=Math.abs(rs[i]-rs[i-1]);if(d>0.02&&d<0.1)sl.push(d/0.025);}",
    " const sm=sl.reduce((a,b)=>a+b,0)/Math.max(1,sl.length);",
    " A(sl.length>4&&Math.abs(sm-Math.sqrt(3))<0.15,'11c : flancs à 60° dans la coupe axiale (pente '+sm.toFixed(2)+')');}",
    "const rMid1=(th1.rCrete+th1.rRacine)/2,rMid2=(th2.rCrete+th2.rRacine)/2;",
    "out.log.push('M8 jeu 0,2 : crete R'+th1.rCrete.toFixed(3)+', racine R'+th1.rRacine.toFixed(3)+', rMid '+rMid1.toFixed(3));",
    // à mi-profondeur du filet : la gorge retire de la matière au-delà du Ø de perçage
    "const q1=fracOut(30,30,rMid1,25),q1b=fracOut(30,30,rMid1,7);",
    "A(q1>0.15&&q1<0.8,'3a : au milieu du filet, '+Math.round(q1*100)+' % de la circonférence à rMid est usinée (gorge hélicoïdale)');",
    "A(q1b<0.02,'3b : sous la longueur filetée (20 mm), rMid est dans la matière ('+Math.round(q1b*100)+' %)');",
    "A(fracOut(30,30,th1.rRacine+0.3,25)<0.02,'3c : au-delà du Ø majeur, la matière est intacte');",
    "A(fracOut(30,30,th1.rCrete-0.1,25)>0.98,'3d : au-dessous du Ø mineur, tout est vide (perçage)');",
    // lamage : le filet ne commence qu'après 6 mm
    "const q2=fracOut(70,30,rMid2,19),q2b=fracOut(70,30,rMid2,13);",
    "A(q2>0.15&&q2<0.8,'4a : trou lamé, filet présent à 11 mm du dessus ('+Math.round(q2*100)+' %)');",
    "A(q2b<0.02,'4b : sous la longueur filetée du trou lamé, matière intacte ('+Math.round(q2b*100)+' %)');",
    "A(fracOut(70,30,4.75,27)>0.98,'4c : lamage Ø11 toujours vide à Ø9,5');",
    "A(fracOut(70,30,4.5,19)<0.02,'4d : hors du Ø majeur du trou lamé, matière intacte');",
    // le fond du lamage / de la fraisure doit être OUVERT sur le perçage (pas d'opercule)
    "A(st(70,30,24)===OUT,'4e : fond du lamage ouvert sur le perçage (pas de membrane)');",
    "A(st(50,30,27.9)===OUT,'4f : fond de fraisure ouvert sur le perçage (pas de membrane)');",
    "A(fracOut(50,30,3,20)>0.98,'4g : fraisure, perçage vide sous le cône');",
    "A(fracOut(50,30,4.5,20)<0.02,'4h : fraisure, matière intacte hors du perçage');",
    // le filet cosmétique n'est plus superposé au filet réel
    "holeThreadOverlay();const ov1=scene.getObjectByName('holeThreads');",
    "A(!ov1||!ov1.children.length,'5 : aucun filet cosmétique superposé quand le filet est modélisé');",
    // repli maillage : avertissement, pas de fausse géométrie
    "const ms=[];legacyHoleGeos(f1,ms);",
    "A(ms.some(m=>/filet modélisé/.test(m)),'6 : repli maillage avertit que le filet exige le noyau exact');",
    // persistance
    "const sv=JSON.parse(serialise(false)).features.find(x=>x.id===f1.id);",
    "A(sv&&sv.thread&&sv.thread.model===true&&Math.abs(+sv.thread.clear-0.2)<1e-9,'7 : model/clear persistés dans le document');",
    // la FAO continue de reconnaître le taraudage
    "faoHoleCache={shape:null,list:null};const H=faoHolesDetect();",
    "A(H.some(h=>Math.abs(h.x-30)<0.01&&Math.abs(h.y-30)<0.01&&h.feat&&h.feat.thread&&h.feat.thread.size==='M8'),'8 : la FAO reconnaît toujours le taraudage M8');",
    // « à travers tout » : le filet suit toute la profondeur de la pièce
    "try{cl.delete();}catch(e){}",
    "f1.thread.lenMode='through';markDirty();rebuild();",
    "const clT=new occt.BRepClass3d_SolidClassifier_2(occLive.shape);",
    "const stT=(x,y,z)=>{const p=new occt.gp_Pnt_3(x,y,z);clT.Perform(p,1e-6);const s=clT.State();p.delete();return s;};",
    "let qT=0;for(let k=0;k<144;k++){const a=k/144*Math.PI*2;if(stT(30+rMid1*Math.cos(a),30+rMid1*Math.sin(a),3)===OUT)qT++;}qT/=144;",
    "A(+f1._thLen>29.5&&qT>0.15,'9 : filet « débouchant tout » traverse la pièce (L='+f1._thLen+', '+Math.round(qT*100)+' % à 3 mm du fond)');",
    "try{clT.delete();}catch(e){}",
    "return out;"
  ].join('\n');
  try{
    const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
    console.log('=== 2026-10-19 : filet taraudé modélisé (ISO, impression 3D) ===');
    (o.log||[]).forEach(m=>console.log('  ✓ '+m));
    if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
    console.log('\n*** TOUT PASSE ***');
  }catch(e){
    console.log('FATAL',String((e&&e.stack)||e).slice(0,1600));process.exit(1);
  }
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
