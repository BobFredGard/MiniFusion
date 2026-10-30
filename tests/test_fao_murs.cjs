// V0.23.20 — ESQUISSES ET CORPS FAO (« murs infranchissables »), src/89-fao-murs.js.
// CONTRAT :
//  A) stockage : esquisses et corps vivent dans le POSAGE (doc.fao), jamais dans
//     doc.sketches / doc.features ; une esquisse FAO égarée dans doc.sketches en
//     est retirée par faoRoot() ; listes vides supprimées ;
//  B) prisme : contour de l'esquisse extrudé de a à a+h (repère du posage) ;
//  C) clé de parcours : inchangée sans corps, change avec un corps actif ;
//  D) Surfaçage traversant un mur : aucune position de coupe dans le mur gonflé
//     (r + marge) sous son dessus ; aucun rapide ne le traverse (relevé au-dessus,
//     même au-delà du plan de dégagement) ; corps désactivé = parcours d'origine ;
//  E) Perçage : trou sous un corps retiré du plan (G-code compris) ;
//  F) arbre FAO : sections « Esquisses » et « Corps » ; arbre CAO : aucune
//     esquisse FAO ; fiche du corps ;
//  G) zone d'opération : une esquisse FAO sert aussi de limite (faoSketchLoop).
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    "doc.sketches=[];doc.features=[];delete doc.fao;",
    "const s=faoSetup();",
    "s.stock={x0:0,y0:0,z0:0,x1:100,y1:60,z1:20};",
    // mur 10 x 60 au milieu (x 45..55), plan XY du posage (repère identité)
    "const sk={id:'fsk1',name:'Esquisse FAO 1',plane:'FACE',fao:s.id,visible:true,origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],",
    "  points:{a:{x:45,y:-10},b:{x:55,y:-10},c:{x:55,y:70},d:{x:45,y:70}},",
    "  entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],",
    "  constraints:[],dims:[],seq:10};",
    // ---- A : stockage
    "s.sketches=[sk];",
    "doc.sketches.push(sk);faoRoot();",
    "att(!doc.sketches.some(q=>q.id==='fsk1'),'A : esquisse FAO retiree de doc.sketches');",
    "att(faoSkList(s).length===1,'A : esquisse FAO gardee dans le posage');",
    "s.walls=[];faoRoot();att(s.walls===undefined,'A : liste de corps vide supprimee');",
    // ---- C : clé sans corps
    "const op={id:'of1',on:true,toolId:'T1',type:'facing',ae:6,z:20,np:0,npz:0};",
    "s.ops=[op];faoRoot();",
    "const k0=faoOpMovesKey(op,s);",
    "const mv0=faoOpMoves(op,s);",
    // ---- B : prisme
    "s.walls=[{id:'w1',name:'Corps FAO 1',sk:'fsk1',a:0,h:30}];faoRoot();",
    "const M=faoWallsMesh(s);",
    "att(!!M&&M.t.length>=12,'B : prisme triangule ('+(M?M.t.length:0)+' triangles)');",
    "let z0=1/0,z1=-1/0,x0=1/0,x1=-1/0;if(M)M.v.forEach(p=>{z0=Math.min(z0,p[2]);z1=Math.max(z1,p[2]);x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);});",
    "att(Math.abs(z0)<1e-9&&Math.abs(z1-30)<1e-9,'B : Z 0..30 (vu '+z0+'..'+z1+')');",
    "att(Math.abs(x0-45)<1e-9&&Math.abs(x1-55)<1e-9,'B : X 45..55');",
    // ---- C : clé avec corps
    "const k1=faoOpMovesKey(op,s);",
    "att(k0!==null&&k1!==null&&k0!==k1,'C : la cle change avec un corps actif');",
    "s.walls[0].name='autre nom';att(faoOpMovesKey(op,s)===k1,'C : renommer un corps ne perime rien');",
    // ---- D : surfaçage
    "const mv=faoOpMoves(op,s);",
    "const D=faoToolById(s,'T1').d,r=D/2,m=FAO_WALL_M;",
    "let bad=0,badR=0,hasIn=0;",
    "for(let i=0;i<mv.length;i++){const q=mv[i];",
    "  const near=(q.x>45-r-m+0.05&&q.x<55+r+m-0.05&&q.y>-10-r&&q.y<70+r);",
    "  if(near&&q.z<30+m-0.02){if(q.r)badR++;else bad++;}",
    "  if(i>0){const a=mv[i-1];if(q.r||!q.r){const n=Math.ceil(Math.hypot(q.x-a.x,q.y-a.y));for(let k=1;k<n;k++){const t=k/n,x=a.x+(q.x-a.x)*t,y=a.y+(q.y-a.y)*t,z=a.z+(q.z-a.z)*t;",
    "    if(x>45-r-m+0.05&&x<55+r+m-0.05&&y>-10-r+0.05&&y<70+r-0.05&&z<30+m-0.02)hasIn++;}}}",
    "}",
    "att(mv.length>0,'D : parcours non vide');",
    "att(bad===0,'D : aucune coupe dans le mur ('+bad+')');",
    "att(badR===0&&hasIn===0,'D : aucun deplacement ne traverse le mur ('+badR+'/'+hasIn+')');",
    "att(mv.some(q=>!q.r&&q.x<40)&&mv.some(q=>!q.r&&q.x>60),'D : usinage des deux cotes du mur');",
    "att(mv.some(q=>q.r&&q.z>30),'D : rapides releves au-dessus du mur (au-dela du degagement)');",
    "s.walls[0].on=false;faoRoot();",
    "att(faoOpMovesKey(op,s)===k0,'D : corps desactive -> cle d origine');",
    "const mvOff=faoOpMoves(op,s);",
    "att(JSON.stringify(mvOff)===JSON.stringify(mv0),'D : corps desactive -> parcours d origine');",
    "delete s.walls[0].on;faoRoot();",
    // ---- E : perçage
    "const od={id:'od1',on:true,toolId:'T1',type:'drill',src:'xy',pts:[[20,30],[50,30],[80,30]],ztop:20,zbot:5};",
    "s.ops.push(od);faoRoot();",
    "const pl=faoDrillPlan(od,s);",
    "att(pl.length===2&&!pl.some(p=>Math.abs(p.x-50)<1e-6),'E : trou sous le mur retire ('+pl.map(p=>p.x).join(',')+')');",
    // ---- H : SURFACE — un trait OUVERT extrudé (paroi sans épaisseur), puis surface plane
    "const sk2={id:'fsk2',name:'Trait',plane:'FACE',fao:s.id,visible:true,origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],",
    "  points:{a:{x:70,y:-10},b:{x:70,y:70}},entities:[{id:'t1',t:'line',p1:'a',p2:'b'}],constraints:[],dims:[],seq:3};",
    "s.sketches.push(sk2);",
    "const wS=faoWallNew(s.id,'fsk2');",
    "att(wS&&wS.kind==='surface','H : trait ouvert -> corps SURFACE d office');",
    "att(!!faoWallMeshWorld(s,wS),'H : surface maillee');",
    "s.ops=[op];op.stale=false;faoRoot();", // faoWallNew -> faoChanged : op perimee (ancien trace servi)
    "const mvS=faoOpMoves(op,s);",
    "let badS=0;mvS.forEach(q=>{if(!q.r&&q.x>70-r-m+0.05&&q.x<70+r+m-0.05&&q.z<30+m-0.02)badS++;});",
    "att(badS===0,'H : aucune coupe contre la paroi ('+badS+')');",
    "att(mvS.some(q=>!q.r&&q.x>75.4&&q.x<80),'H : usinage au-dela de la paroi');",
    "wS.h=0;wS.a=10;faoRoot();",
    "att(!faoWallMeshWorld(s,wS),'H : hauteur 0 sur un trait ouvert -> rien (pas de contour ferme)');",
    "wS.sk='fsk1';faoRoot();const Mf=faoWallMeshWorld(s,wS);",
    "att(!!Mf&&Mf.v.every(p=>Math.abs(p[2]-10)<1e-9),'H : surface plane a Z 10');",
    "s.walls=s.walls.filter(w=>w.id!==wS.id);faoRoot();",
    // ---- F : arbre / fiche
    "const tr=document.getElementById('faoTree');faoRenderTree();",
    "const txt=n=>{let t=n.textContent||'';(n.children||[]).forEach(c=>{t+=' '+txt(c);});return t;};",
    "const T=txt(tr);",
    "att(T.indexOf('Esquisses (2)')>=0,'F : section Esquisses dans l arbre FAO');",
    "att(T.indexOf('Corps (1)')>=0,'F : section Corps dans l arbre FAO');",
    "att(!doc.sketches.some(q=>q.fao),'F : aucune esquisse FAO cote CAO');",
    "const P=document.createElement('div');faoRenderProps(P,{kind:'faoSetup',id:s.id,wall:'w1'});",
    "att(txt(P).indexOf('Corps FAO')>=0&&txt(P).indexOf('Hauteur')>=0,'F : fiche du corps');",
    // ---- G : zone
    "const lp=faoSketchLoop('fsk1');",
    "att(!!lp&&lp.length>=4,'G : esquisse FAO utilisable comme zone');",
    "return ATT;"
  ].join('\n');
  const out=await vm.runInContext('(async()=>{'+R+'\n})()',ctx);
  if(out&&out.length){
    console.log('=== esquisses et corps FAO (V0.23.20) ===');
    console.log('ECHECS :');out.forEach(m=>console.log('  x '+m));
    process.exit(1);
  }
  console.log('=== esquisses et corps FAO : stockage, prisme, cle, surfacage, percage, arbre, zone ===');
  console.log('TOUT EST CONFORME');
  process.exit(0);
})().catch(e=>{console.log('FATAL/FAIL',String((e&&e.stack)||e).slice(0,1400));process.exit(1);});
