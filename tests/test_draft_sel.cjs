// Dépouille façon Fusion : chaîne tangente des faces + calcul d'aperçu, sur noyau réel.
// 1. boîte pure : toute chaîne = la face seule (que des arêtes vives).
// 2. boîte + congé R10 sur une arête verticale : la chaîne du mur contient mur + congé + mur voisin (3).
// 3. le calcul qui nourrit l'aperçu bleu (occDraftOnce sur la chaîne résolue) donne un solide valide.
// Les couleurs/flèche/panneau sont du DOM+THREE (non testables ici) ; la géométrie qui les
// sous-tend l'est, et c'est elle qui faisait « n'importe quoi ».
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
  const body=[
    'const out={fails:[]};',
    'const A=(c,m)=>{if(!c)out.fails.push(m);};',
    'const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;',
    'const centres=sh=>{const r=[];const ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);let i=0;while(ex.More()){const f=occt.TopoDS.Face_1(ex.Current());const b=occFaceBox(f);r.push({ord:i,pos:b?b.pos:null});try{f.delete();}catch(e){}i++;ex.Next();}try{ex.delete();}catch(e){}return r;};',
    // boîte 100x60x40 seule
    'const mk=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),100,60,40);',
    'const box=mk.Shape();',
    'out.boxFaces=centres(box).length;',
    'A(occTangentFaces(box,0).join()=="0","boite pure : chaine(0)="+JSON.stringify(occTangentFaces(box,0)));',
    'A(occTangentFaces(box,4).join()=="4","boite pure : chaine(4)="+JSON.stringify(occTangentFaces(box,4)));',
    'A(occTangentFaces(box,-1).join()=="-1","garde-fou : ord invalide");',
    'A(occTangentFaces(null,0).join()=="0","garde-fou : solide nul");',
    // congé R10 sur l'arête verticale du coin (100,60)
    'let eH=null;{const ex=new occt.TopExp_Explorer_2(box,occt.TopAbs_ShapeEnum.TopAbs_EDGE,SH);',
    'while(ex.More()){try{const e=occt.TopoDS.Edge_1(ex.Current());const ad=new occt.BRepAdaptor_Curve_2(e);',
    'const u0=ad.FirstParameter(),u1=ad.LastParameter();',
    'if(u1>u0){const a=ad.Value(u0),b=ad.Value(u1),m=ad.Value((u0+u1)/2);',
    'const vert=Math.abs(b.Z()-a.Z())>Math.hypot(b.X()-a.X(),b.Y()-a.Y());',
    'if(vert&&Math.abs(m.X()-100)<1&&Math.abs(m.Y()-60)<1)eH=e;}',
    'try{ad.delete();}catch(e){}}catch(e){}ex.Next();}try{ex.delete();}catch(e){}}',
    'A(!!eH,"arete verticale du coin (100,60) trouvee");',
    'const mf=new occt.BRepFilletAPI_MakeFillet(box,0);mf.Add_2(10,eH);mf.Build();',
    'A(!!mf.IsDone(),"conge R10 construit");',
    'const sh=mf.Shape();',
    // mur +X : centre x≈100
    'const cs=centres(sh);',
    'const murX=cs.find(c=>c.pos&&Math.abs(c.pos[0]-100)<1);',
    'A(!!murX,"mur +X repere (ord="+ (murX?murX.ord:"?") +")");',
    'const ch=murX?occTangentFaces(sh,murX.ord):[];',
    'out.chaineMurX=ch;',
    'A(ch.length===3,"chaine du mur +X = 3 faces, obtenu "+JSON.stringify(ch));',
    'if(ch.length===3){',
    '  const ps=ch.map(o=>cs.find(c=>c.ord===o).pos);',
    '  A(ps.some(p=>Math.abs(p[0]-100)<1),"chaine : contient le mur +X");',
    '  A(ps.some(p=>Math.abs(p[1]-60)<1),"chaine : contient le mur +Y voisin");',
    '  A(ps.some(p=>Math.hypot(p[0]-95,p[1]-55)<9),"chaine : contient le conge du coin");',
    '}',
    // le dessus reste seul (que des arêtes vives autour)
    'const top=cs.find(c=>c.pos&&Math.abs(c.pos[2]-40)<1);',
    'const chTop=top?occTangentFaces(sh,top.ord):[];',
    'A(chTop.length===1,"chaine du dessus = 1 face, obtenu "+JSON.stringify(chTop));',
    // calcul d'aperçu : neutre = dessus, faces = chaîne du mur résolue par occFindFace
    'const nref=top?{pos:cs.find(c=>c.ord===top.ord).pos,dim:[100,60,0],n:[0,0,1]}:null;',
    'const refs={};{const ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);let i=0;while(ex.More()){try{const f=occt.TopoDS.Face_1(ex.Current());const r=occFaceRef(f);if(r)refs[i]=r;try{f.delete();}catch(e){}}catch(e){}i++;ex.Next();}try{ex.delete();}catch(e){}}',
    'const got=[];',
    '(murX?occTangentFaces(sh,murX.ord):[]).forEach(o=>{',
    '  if(!refs[o])return;',
    '  try{const h=occFindFace(sh,refs[o]);if(h)got.push(h);}catch(e){}',
    '});',
    'out.facesResolues=got.length;',
    'A(got.length>=2,"resolution des faces de la chaine : "+got.length+" (mur+conge au moins)");',
    'let prev=null,prevErr=null;',
    'try{',
    '  const r=occDraftOnce(sh,{pos:nref.pos,n:nref.n},got,10*Math.PI/180);',
    '  prev=r.shape;out.refused=r.refused;',
    '}catch(e){prevErr=String((e&&e.message)||e).slice(0,120);}',
    'got.forEach(g=>{try{g.delete();}catch(e){}});',
    'A(!prevErr,"aperçu : calcul sans exception"+(prevErr?" ("+prevErr+")":""));',
    'A(!!prev,"aperçu : solide produit");',
    'if(prev){let n=0;try{n=occListEdges(prev).length;}catch(e){}out.aretesApercu=n;',
    'A(n>0,"aperçu : solide avec des arêtes ("+n+")");',
    'try{prev.delete();}catch(e){}}',
    'try{sh.delete();}catch(e){}try{box.delete();}catch(e){}try{eH.delete();}catch(e){}try{mf.delete();}catch(e){}try{mk.delete();}catch(e){}',
    // chargement validé (édition / « Re-sélectionner ») : copie ou rien, jamais d'exception
    'A(draftCleanRef({pos:[1,2,3],n:[0,0,1],dim:[10,10,0]})!==null,"cleanRef : ref valide acceptée");',
    'A(draftCleanRef({pos:[1,2,3],n:[0,0,1],dim:[10,10,0]})._ord===-1,"cleanRef : _ord initialisé à -1");',
    'A(draftCleanRef({pos:[1,2,3],n:[0,0,1]})===null,"cleanRef : dim manquant refusé (occFindFace lèverait)");',
    'A(draftCleanRef({pos:[1,2],n:[0,0,1],dim:[1,1,0]})===null,"cleanRef : pos trop court refusé");',
    'A(draftCleanRef(null)===null,"cleanRef : null refusé");',
    '{const src={pos:[1,2,3],n:[0,0,1],dim:[10,10,0]};const cp2=draftCleanRef(src);cp2.pos[0]=999;',
    'A(src.pos[0]===1,"cleanRef : copie profonde, pas d\u2019alias sur le document");}',
    // D. suivi après édition amont : extrusion 100x60 relevée de 40 → le centre bouge de
    // plus que le couperet 2,5 mm de la passe 2 — seules les passes 1 sauvent la mise.
    'doc.sketches=[{id:"sk_t",name:"Plaque",plane:"XY",origin:[0,0,0],points:{p0:{x:0,y:0},p1:{x:100,y:0},p2:{x:100,y:60},p3:{x:0,y:60}},entities:[{id:"e0",t:"line",p1:"p0",p2:"p1"},{id:"e1",t:"line",p1:"p1",p2:"p2"},{id:"e2",t:"line",p1:"p2",p2:"p3"},{id:"e3",t:"line",p1:"p3",p2:"p0"}],constraints:[],dims:[]}];',
    'doc.features=[{id:"ex_t",type:"extrude",name:"Plot",sketchId:"sk_t",op:"add",distance:40,visible:true}];',
    'occSkipFeat=null;',
    'const rejouer=()=>{try{occCk.length=0;}catch(e){}return occFinalShape(null);};',
    'const topDe=sh=>{let rt=null;const ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);while(ex.More()){const f=occt.TopoDS.Face_1(ex.Current());const b=occFaceBox(f);const n=occFaceOutNormal(f);if(b&&n&&n[2]>0.9&&b.pos[2]>30){rt={h:f,ref:occFaceRef(f)};break;}try{f.delete();}catch(e){}ex.Next();}try{ex.delete();}catch(e){}return rt;};',
    'const murXDe=sh=>{let rt=null;const ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);while(ex.More()){const f=occt.TopoDS.Face_1(ex.Current());const b=occFaceBox(f);const n=occFaceOutNormal(f);if(b&&n&&n[0]>0.9&&b.pos[0]>99){rt={h:f,ref:occFaceRef(f)};try{f.delete();}catch(e){}break;}try{f.delete();}catch(e){}ex.Next();}try{ex.delete();}catch(e){}return rt;};',
    'let FR=rejouer();',
    'A(!!(FR&&FR.shape),"D : extrusion 40 rejouée");',
    // D1. passe 1b : dessus SANS ancre (grand centre, backfill impossible), hauteur 40→50.
    // Proximité seule : centre bougé de 10 mm > couperet 2,5 → perdue sans la passe 1b.
    'let t1=topDe(FR.shape);',
    'A(!!t1,"D1 : dessus repéré à 40");',
    'if(FR.shape){try{FR.shape.delete();}catch(e){}}',
    'if(t1){try{t1.h.delete();}catch(e){}}',
    'const refTopSansAncre=t1?t1.ref:null;',
    'A(refTopSansAncre&&!refTopSansAncre.anchor,"D1 : pas d\u2019ancre au départ");',
    'doc.features[0].distance=50;',
    'FR=rejouer();',
    'let trouve=null,proxEcart=1e9;',
    'if(FR.shape&&refTopSansAncre){',
    '  const h=occFindFace(FR.shape,refTopSansAncre);',
    '  if(h){const b=occFaceBox(h);if(b)proxEcart=Math.abs(b.pos[2]-40);trouve=b?b.pos:null;try{h.delete();}catch(e){}}',
    '}',
    'out.passe1b={trouve:trouve,proxEcart:+proxEcart.toFixed(1)};',
    'A(!!trouve&&Math.abs(trouve[2]-50)<0.6,"D1 passe 1b : dessus suivi à z=50 sans ancre (trouvé "+JSON.stringify(trouve)+")");',
    'A(proxEcart>2.5,"D1 : la passe 2 seule aurait échoué (écart "+proxEcart+" mm > 2,5)");',
    'if(FR.shape){try{FR.shape.delete();}catch(e){}}',
    // D2. passe 1a : mur +X AVEC ancre entité, hauteur 40→70 (centre bougé de 15, dims +30).
    // Passe 2 : 15 mm > 2,5 → perdue. Passe 1b : dims Z hors tolérance → s'abstient.
    'doc.features[0].distance=40;FR=rejouer();',
    'let w1=murXDe(FR.shape);',
    'A(!!w1,"D2 : mur +X repéré à 40");',
    'if(FR.shape){try{FR.shape.delete();}catch(e){}}',
    'if(w1){try{w1.h.delete();}catch(e){}}',
    'const refMur=w1?w1.ref:null;',
    'if(refMur)refMur.anchor={t:"e",sk:"sk_t",id:"e1"};',
    'doc.features[0].distance=70;FR=rejouer();',
    'let trouveW=null;',
    'if(FR.shape&&refMur){const h=occFindFace(FR.shape,refMur);if(h){const b=occFaceBox(h);if(b)trouveW=b.pos;try{h.delete();}catch(e){}}}',
    'out.passe1a={trouve:trouveW};',
    'A(!!trouveW&&Math.abs(trouveW[0]-100)<0.6&&Math.abs(trouveW[2]-35)<1.2,"D2 passe 1a : mur suivi à (100,·,35) via l\u2019ancre (trouvé "+JSON.stringify(trouveW)+")");',
    'if(FR.shape){try{FR.shape.delete();}catch(e){}}',
    // D3. bout en bout, le scénario utilisateur : dépouille posée à 40, extrusion à 55.
    'doc.features[0].distance=40;FR=rejouer();',
    'let rT=topDe(FR.shape);',
    'const murs=[];{const ex=new occt.TopExp_Explorer_2(FR.shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);while(ex.More()){const f=occt.TopoDS.Face_1(ex.Current());const b=occFaceBox(f);const n=occFaceOutNormal(f);if(b&&n&&Math.abs(n[2])<0.1){const r=occFaceRef(f);if(r)murs.push(r);}try{f.delete();}catch(e){}ex.Next();}try{ex.delete();}catch(e){}}',
    'A(murs.length===4,"D3 : 4 murs relevés (obtenu "+murs.length+")");',
    'if(FR.shape){try{FR.shape.delete();}catch(e){}}',
    'if(rT){try{rT.h.delete();}catch(e){}}',
    'doc.features.push({id:"dr_1",type:"xdraft",name:"Dépouillage",ref:rT?rT.ref:null,faces:murs,angle:10,visible:true});',
    'FR=rejouer();',
    'const dr0=doc.features.find(f=>f.id==="dr_1");',
    'out.draft40={m:dr0&&dr0._m?dr0._m.m:"?",t:dr0&&dr0._m?dr0._m.t:"?",msgs:(FR.msgs||[]).length};',
    'A(dr0&&dr0._m&&dr0._m.m===4&&dr0._m.t===4,"D3 : dépouillage complet à 40 ("+JSON.stringify(dr0&&dr0._m)+")");',
    'if(FR.shape){try{FR.shape.delete();}catch(e){}}',
    'doc.features[0].distance=55;FR=rejouer();',
    'const dr1=doc.features.find(f=>f.id==="dr_1");',
    'const fatals=(FR.msgs||[]).filter(m=>/introuvable|impossible|fatal/i.test(m));',
    'out.draft55={m:dr1&&dr1._m?dr1._m.m:"?",t:dr1&&dr1._m?dr1._m.t:"?",fatals:fatals.length,forme:!!(FR&&FR.shape)};',
    'A(dr1&&dr1._m&&dr1._m.m===4&&dr1._m.t===4,"D3 : dépouillage TOUJOURS complet à 55 ("+JSON.stringify(dr1&&dr1._m)+", pas de triangle)");',
    'A(!fatals.length,"D3 : aucun message fatal ("+fatals.slice(0,2).join(" // ").slice(0,120)+")");',
    'A(!!(FR&&FR.shape),"D3 : solide valide après édition amont");',
    'if(FR.shape){try{FR.shape.delete();}catch(e){}}',
    'return out;'
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx,{filename:'draft_sel.cjs'});
  console.log('faces boite        :',o.boxFaces);
  console.log('chaine mur +X      :',JSON.stringify(o.chaineMurX));
  console.log('faces resolues     :',o.facesResolues,' | refusees apercu :',JSON.stringify(o.refused));
  console.log('aretes apercu      :',o.aretesApercu);
  console.log('passe 1b (sans ancre, 40->50) :',JSON.stringify(o.passe1b));
  console.log('passe 1a (ancre entité, 40->70) :',JSON.stringify(o.passe1a));
  console.log('bout en bout (dépouille à 40, extrusion à 55) :',JSON.stringify(o.draft40),JSON.stringify(o.draft55));
  if(o.fails&&o.fails.length){console.log('ECHECS :');o.fails.forEach(m=>console.log('  x '+m));process.exit(1);}
  console.log('TOUT EST CONFORME');
  process.exit(0);
})().catch(e=>{console.log('FATAL/FAIL',String((e&&e.message)||e).slice(0,600));process.exit(1);});
