// 2026-10-16-017 : repère façon Fusion (point + axes + 3 plans) ; origine du posage sur l'un des
// 27 points cardinaux du brut ou du modèle ; surépaisseurs Z+ / Z− du brut ; G-code relatif.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
const {loadApp}=require('./appvm.cjs');
const {ctx}=loadApp();
const R=[
  "const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};const near=(a,b)=>Math.abs(a-b)<1e-9;",
  "A(FAO_CARD.length===27&&new Set(FAO_CARD.map(f=>f.join(','))).size===27,'1 : 27 points cardinaux distincts (8 coins, 12 milieux, 6 centres de faces, centre)');",
  "const st={x0:-10,y0:-20,z0:-5,x1:30,y1:40,z1:15};",
  "const P=s=>faoOriginPoint(s).join(',');",
  "A(P({stock:st,origin:{preset:'top-X0Y0'}})==='-10,-20,15'&&P({stock:st,origin:{preset:'top-X1Y1'}})==='30,40,15'&&P({stock:st,origin:{preset:'top-C'}})==='10,10,15'&&P({stock:st,origin:{preset:'bot-X0Y0'}})==='-10,-20,-5','2 : anciens préréglages lus à l\\u2019identique (dessus X0Y0, X1Y1, centre, dessous)');",
  "A(P({stock:st})==='-10,-20,15','3 : sans origine : dessus coin X0Y0 (défaut atelier)');",
  "A(P({stock:st,origin:{pt:[1,0.5,0.5],src:'stock'}})==='30,10,5','4 : point cardinal = milieu de la face X1 (30, 10, 5)');",
  "A(faoOriginLabel({origin:{pt:[0.5,0.5,1]}})==='dessus centre'&&faoOriginLabel({origin:{pt:[1,0,0]}})==='dessous coin X1 Y0'&&faoOriginLabel({origin:{pt:[0.5,1,0.5],src:'model'}})==='modèle · mi-hauteur milieu Y1','5 : libellés (« '+faoOriginLabel({origin:{pt:[0.5,1,0.5],src:'model'}})+' »)');",
  "A(P({stock:st,origin:{pt:[0,0,1],src:'model'}})==='-10,-20,15','6 : origine « modèle » sans corps : repli sur le brut');",
  "{const s=faoDefaultSetup();s.stock=st;s.origin={pt:[0.5,0.5,1]};let g='';try{g=String(faoPost(s).code);}catch(e){g='ERR '+e.message;}A(/dessus centre/.test(g),'7 : G-code : en-tête « origine dessus centre »');}",
  "A(/margeZp/.test(String(faoStock))&&/margeZm/.test(String(faoStock))&&/z0:a\\.z-mzm/.test(String(faoStock))&&/z1:b\\.z\\+mzp/.test(String(faoStock)),'8 : brut : surépaisseurs Z+ (dessus) et Z− (dessous) appliquées à la boîte des corps');",
  "A(typeof triadMake==='function'&&typeof triadPickPlane==='function'&&typeof faoPoseSync==='function'&&typeof faoPosePickAt==='function','9 : repère (triadMake), clic plan, repère du posage et clic sur point (vérifiés au navigateur)');",
  // 2026-10-16-018 : brut cylindrique
  "{const job={cylAxis:'z'};const c=faoStockCylFrom(job,{x:0,y:0,z:0},{x:40,y:30,z:20},2,3,1,false);A(near(c.cyl.r,27)&&near(c.x0,-7)&&near(c.x1,47)&&near(c.z0,-1)&&near(c.z1,23)&&c.cyl.axis==='z','10 : cylindre axe Z auto : R = ½ diagonale + marge (27), Z− 1 / Z+ 3 appliqués');}",
  "{const job={cylAxis:'x',cylD:50,cylL:80};const c=faoStockCylFrom(job,{x:0,y:0,z:0},{x:40,y:30,z:20},2,0,0,false);A(near(c.cyl.r,25)&&near(c.x0,-20)&&near(c.x1,60)&&near(c.y0,-10)&&near(c.z1,35),'11 : cylindre axe X saisi : Ø50, L80 centrée');}",
  "{const s={x0:-10,y0:-10,z0:0,x1:10,y1:10,z1:10,cyl:{axis:'z',c:[0,0,5],r:10}};const g=faoMatterGrid(s,1);const k=(ix,iy)=>iy*g.nx+ix;A(g.h[k(0,0)]===0&&g.h[k(10,10)]===10&&g.alive[k(0,0)]===0,'12 : simulation : coin hors du disque vide, centre plein');}",
  "{const s={x0:0,y0:-10,z0:-10,x1:20,y1:10,z1:10,cyl:{axis:'x',c:[10,0,0],r:10}};const g=faoMatterGrid(s,1);const ix=5,iy=10;A(Math.abs(g.h[iy*g.nx+ix]-(Math.sqrt(100-0.25)))<1e-3&&Math.abs(g.h[0]-Math.sqrt(100-90.25))<1e-3,'13 : cylindre couché : dessus de colonne = génératrice');}",
  // 2026-10-16-019 : repère orienté du posage
  "{const F0=faoFrame({});A(F0.id&&faoFrameSig({})==='','14 : sans réglage : repère posage = repère pièce (aucune clé de cache changée)');}",
  "{const s={frame:{z:'+X',x:'+Y'}};const F=faoFrame(s);A(!F.id&&F.Z.join()==='1,0,0'&&F.X.join()==='0,1,0'&&F.Y.join()==='0,0,1'&&faoFrameSig(s)!=='','15 : Z posage = +X pièce, X = +Y → Y = +Z (main droite)');",
  " const p=[3,-7,11],q=faoToF(F,p),w=faoToW(F,q);A(q.join()==='-7,11,3'&&w.join()==='3,-7,11','16 : pièce → posage → pièce (-7, 11, 3) aller-retour exact');}",
  "{const F=faoFrame({frame:{z:'+Z',x:'+X',flipZ:true}});A(F.Z[2]===-1&&F.X[0]===1&&F.Y[1]===-1,'17 : Inverser Z : Z −, Y suit (repère direct)');}",
  "{const F=faoFrame({frame:{z:'+Y',x:'-Y'}});A(!!F.warn&&Math.abs(F.X[0]*F.Z[0]+F.X[1]*F.Z[1]+F.X[2]*F.Z[2])<1e-12,'18 : X parallèle à Z : remplacé par un X perpendiculaire (avertissement)');}",
  "{const F=faoFrame({frame:{z:[0,1,1]}});A(Math.abs(F.Z[1]-Math.SQRT1_2)<1e-12&&Math.abs(F.X[0]-1)<1e-12,'19 : Z donné par une normale de face (0,1,1) normalisée');}",
  "{const F=faoFrame({frame:{z:'+X',x:'+Y'}});const m=faoMeshToF({v:[[31,0,0],[-31,5,2]],t:[[0,1,0]]},F);A(m.v[0].join()==='0,0,31'&&m.v[1].join()==='5,2,-31','20 : maillage ramené dans le repère posage (face X=31 → Z=31)');}",
  "A(/faoFrame\\(setup\\)/.test(String(faoActiveMesh))&&/faoFrameSig\\(job\\)/.test(String(faoSetupFp))&&/faoFrame\\(job\\)/.test(String(faoStock)),'21 : maillage d\\u2019usinage, clé de cache et brut passent par le repère du posage');",
  "{const s={frame:{z:'+X'}};faoFrameFixX(s);const t={frame:{z:'-Z',x:'+Y'}};faoFrameFixX(t);A(s.frame.x==='+Y'&&t.frame.x==='+Y'&&!faoFrame(s).warn,'22 : Z = +X : X passe à +Y automatiquement ; X déjà correct : conservé');}",
  // 2026-10-16-020 : repère propre d'une opération (3+2)
  "{const s=faoDefaultSetup();s.stock={x0:-10,y0:-20,z0:-5,x1:30,y1:40,z1:15};const op=faoOpDefaults('facing');s.ops=[op];",
  " A(faoOpFrame(s,op)===null&&faoOpBC(s,op)===null,'23 : opération sans repère : celui du posage (aucun B/C)');",
  " op.frame={z:'+X',x:'+Y'};const fr=faoOpFrame(s,op),bc=faoOpBC(s,op);A(fr&&bc.b===-90&&bc.c===0,'24 : opération Z = +X posage → B −90 C 0');",
  " const w=faoPtOpToPos(fr,[1,2,3]);A(w.join()==='-7,-19,17','25 : centre commun (origine posage −10,−20,15) : point opération (1,2,3) → posage (−7,−19,17)');",
  " const jo=faoOpJob(s,op,fr);A(jo.stock.z1===40&&jo.stock.z0===0&&jo.stock.x0===0&&jo.stock.y1===0,'26 : brut vu par l’opération : son dessus = face X1 du posage, à 40 du centre commun');",
  " const mv=faoMovesOpToPos([{r:1,x:10,y:0,z:5},{r:0,x:0,y:10,z:5,arc:{i:-10,j:0,cw:false}}],fr);const L=mv[mv.length-1];A(mv.length>10&&!mv.some(m=>m.arc)&&Math.abs(L.x+5)<1e-9&&Math.abs(L.y+20)<1e-9&&Math.abs(L.z-25)<1e-9,'27 : arc de l’opération linéarisé (' +(mv.length-1)+' segments) et ré-exprimé dans le posage');",
  " delete op.z;const g=faoPost(s,'siemens630').code;A(g.indexOf('TRAORI(1)')>=0&&g.indexOf('G0 B-90.000 C0.000')>=0&&/TRAFOOF/.test(g),'28 : G-code Siemens : TRAORI + G0 B-90 C0 avant l’opération, TRAFOOF en fin');",
  " const gf=faoPost(s,'fagor8065');A(!/G0 B/.test(gf.code)&&gf.warns.some(x=>/3 axes/.test(x)),'29 : Fagor 8065 (3 axes) : B/C non commandés, alerte');",
  " delete op.frame;A(!/TRAORI|B-90/.test(faoPost(s,'siemens630').code),'30 : repère du posage : aucune trace 3+2');",
  " op.ztop=15;op.zbot=5;faoOpFrameEdit(s,op,function(){op.frame={z:'+X',x:'+Y'};});A(op.ztop===40&&op.zbot===30,'31 : changement de repère : hauteurs recalées sur le dessus du brut (15/5 → 40/30)');}",
  // 2026-10-16-020 : origine des repères (Z0 sur la face) et cotes relatives au posage
  "{const F=faoFrame({frame:{z:[1,0,1],x:'+Y',o:[68,-30,22]}});const q=faoToF(F,[68,-30,22]),w=faoToW(F,[0,0,0]);const n=faoRotF(F,[Math.SQRT1_2,0,Math.SQRT1_2]);A(Math.hypot(...q)<1e-12&&w.join()==='68,-30,22'&&Math.abs(n[2]-1)<1e-12,'32 : repère posé sur une face : son origine est Z0 (point → 0), une direction ne subit que la rotation');}",
  "{const s=faoDefaultSetup();s.stock={x0:0,y0:0,z0:0,x1:100,y1:80,z1:25};const op=faoOpDefaults('facing');s.ops=[op];op.ztop=25;op.zbot=15;op.z=25;faoOpFrameEdit(s,op,function(){op.frame={z:[1,0,1],x:'+Y'};},[90,40,20]);const zf=Math.round(85/Math.SQRT2*1e4)/1e4;A(op.z===zf&&op.ztop===zf&&Math.abs(op.zbot-(zf-10))<1e-9&&faoOpFrame(s,op).O.join()==='0,0,25','33 : Z pris sur une face : centre commun avec le posage (0,0,25), hauteur de travail = cote de la face le long du Z incliné ('+zf+'), profondeur gardée');}",
  "{const s=faoDefaultSetup();s.stock={x0:-50,y0:-40,z0:0,x1:50,y1:40,z1:25};s.origin={pt:[0.5,0.5,1]};faoRoot().setups=[s];faoRoot().activeSetupId=s.id;const op=faoOpDefaults('pocket');s.ops=[op];op.ztop=25;A(faoDsp(op,25,2)===0&&faoInp(op,-5,2)===20&&faoPlaneZ({ref:'origine',dz:3},null,s,0)===28,'34 : cotes de fiche relatives à l’origine du posage (Z 25 affiché 0 ; saisi −5 → 20 ; « Origine »+3 = 28)');}",
  // 2026-10-16-021 : simulation avec outil incliné (45°) — jamais sous le plan du bout d'outil
  "{const g=faoMatterGrid({x0:0,y0:0,z0:0,x1:40,y1:20,z1:20},0.5);const AX=[Math.SQRT1_2,0,Math.SQRT1_2];faoMatterCarveTilt(g,{x:20,y:0,z:10},{x:20,y:20,z:10},5,AX,null);let under=0,minAt20=1e9;for(let iy=4;iy<g.ny-4;iy++)for(let ix=0;ix<g.nx;ix++){const x=g.ox+(ix+0.5)*g.pas,h=g.h[iy*g.nx+ix];if(h<Math.min(30-x,20)-0.8)under++;if(Math.abs(x-20)<0.3)minAt20=Math.min(minAt20,h);}A(under===0&&minAt20<11&&minAt20>9,'35 : simulation, fraise inclinée 45° : matière taillée jusqu’au plan du bout (Z '+minAt20.toFixed(2)+' au centre), jamais dessous');}",
  "{const g=faoMatterGrid({x0:0,y0:0,z0:0,x1:40,y1:20,z1:20},0.5);const AX=[Math.SQRT1_2,0,Math.SQRT1_2];for(let y=2;y<=18;y+=3)faoMatterCarveTilt(g,{x:12,y:y,z:18},{x:28,y:y,z:2},5,AX,null);let under=0,over=0;for(let iy=6;iy<g.ny-6;iy++)for(let ix=0;ix<g.nx;ix++){const x=g.ox+(ix+0.5)*g.pas,h=g.h[iy*g.nx+ix];if(x<14||x>26)continue;const pl=Math.min(30-x,20);if(h<pl-0.8)under++;if(h>pl+0.8)over++;}A(under===0&&over===0,'36 : passes qui DESCENDENT la pente du chanfrein : surface plane, ni marches ni creux ('+under+'/'+over+')');}",
  "return out;"
].join('\n');
(async()=>{
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== 2026-10-16-017 : repère, origine du posage sur points cardinaux, brut Z+/Z− ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
