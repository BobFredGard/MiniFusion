// V0.8.2 : mise en plan d'assemblage — hachures par pièce et bulles (48-composants-plan.js +
// 98-mep-*.js), noyau OCCT réel. Socle + deux colonnes (deux occurrences du même
// composant). Coupe : une famille de hachures par composant (les deux colonnes partagent la
// leur), variante d'angle alternée ; case « une hachure par pièce ». Bulles : accrochées sur la
// surface VISIBLE (face avant vue de face, dessus de la colonne vu de dessus), rangées autour de
// la vue sans se toucher ; bulle sous le curseur ; « ＋ Bulle » sur la pièce cliquée.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};confirm=function(){return true;};',ctx);
  const R=String.raw`
    const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};const near=(a,b,t)=>Math.abs(a-b)<(t||1e-3);
    const T=window.__mepTest;
    const sq=(id,x0,y0,x1,y1)=>({id,name:id,plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],
      points:{a:{x:x0,y:y0},b:{x:x1,y:y0},c:{x:x1,y:y1},d:{x:x0,y:y1}},
      entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},{id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],constraints:[],dims:[],seq:20,visible:false});
    docResetEmpty();doc.name='Banc';
    doc.sketches=[sq('skA',-20,-20,20,20),sq('skB',25,-5,35,5)];
    doc.bodies=[{id:'b1',name:'Socle',c:null},{id:'b2',name:'Colonne',c:null}];doc.bodySeq=3;doc.activeBody='b1';
    doc.features=[{id:'F1',type:'extrude',name:'Socle',sketchId:'skA',distance:20,op:'add',visible:true,body:'b1'},
                  {id:'F2',type:'extrude',name:'Colonne',sketchId:'skB',distance:50,op:'add',visible:true,body:'b2'}];
    ensureBodies();markDirty();rebuild();
    const res=asmCompsFromBodies(['b1','b2']);markDirty();rebuild();asmBuildSnapshots();
    const S=res.made[0].comp,C=res.made[1].comp;
    asmAddOcc(C.id,{o:[-60,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]},asm.root);
    asmBuildSnapshots();
    const sh=T.sheet();
    const v=T.addView({kind:'base',vk:'front',asm:true});
    T.geo(v);
    // ── hachures par pièce ──
    const sv={id:'__sv__',kind:'section',parent:v.id,asm:true,x:v.x,y:v.y+80,scale:v.scale,axes:[],
      section:{a:[-40,0],b:[40,0],pid:v.id,p:[0,0,0],n:[0,1,0]}};
    sh.views.push(sv);
    const g=T.geo(sv);
    A(g.hatchG&&g.hatchG.length===2,'1 : coupe d’assemblage : une famille de hachures par composant ('+(g.hatchG?g.hatchG.length:0)+')');
    const nL=g.hatchG?g.hatchG.map(G=>G.loops.length).sort().join():'';
    A(nL==='1,2','2 : socle 1 boucle, colonnes 2 boucles (même composant, même hachure) : '+nL);
    A(g.hatch&&g.hatch.length===3,'3 : toutes les boucles restent connues (double-clic sur une hachure)');
    const H0=T.hatchVar(0),H1=T.hatchVar(1),H2=T.hatchVar(2);
    A(H0.ang===45&&H1.ang===135&&H2.ang===45&&near(H2.sc,1.6),'4 : variantes : 45°, 135°, puis 45° au pas × 1,6');
    A(T.hatchCfg().parts===true,'5 : « une hachure par pièce » par défaut');
    T.hatchApply({pat:'iso',ang:30,sc:1,col:'',parts:false});
    A(T.hatchCfg().parts===false&&doc.mep.hatch.parts===false,'6 : la case se décoche et s’enregistre');
    T.hatchApply({pat:'iso',ang:45,sc:1,col:''});
    A(T.hatchCfg().parts===true&&doc.mep.hatch.parts===undefined,'7 : recochée : rien d’écrit (défaut)');
    sh.views.splice(sh.views.indexOf(sv),1);
    // ── bulles : accroche visible, disposition ──
    sh.bom={on:true,mat:{},lvl:'comp1'};
    A(T.balloonsAuto(sh)===2,'8 : deux bulles automatiques');
    const bS=sh.balloons.find(b=>b.comp===S.id),bC=sh.balloons.find(b=>b.comp===C.id);
    A(bS&&near(bS.p[1],-20,1e-3),'9 : bulle du socle accrochée sur sa face AVANT (Y -20), vue de face : '+(bS?bS.p.map(x=>+x.toFixed(2)).join(', '):''));
    A(bC&&near(bC.p[1],-5,1e-3),'10 : bulle de la colonne sur sa face avant (Y -5)');
    const bb=T.viewBBox?T.viewBBox(v):null;
    const pos=b=>{const l=[b.p[0]*v.u[0]+b.p[1]*v.u[1]+b.p[2]*v.u[2],b.p[0]*v.v[0]+b.p[1]*v.v[1]+b.p[2]*v.v[2]];return {x:v.x+l[0]*v.scale+b.dx,y:v.y+l[1]*v.scale+b.dy};};
    const P1=pos(bS),P2=pos(bC);
    A(Math.hypot(P1.x-P2.x,P1.y-P2.y)>=10,'11 : bulles écartées (≥ 10 mm) : '+Math.hypot(P1.x-P2.x,P1.y-P2.y).toFixed(1));
    if(bb)A([P1,P2].every(P=>P.x<bb.x||P.x>bb.x+bb.w||P.y<bb.y||P.y>bb.y+bb.h),'12 : bulles hors de la vue');
    const free=b=>{const P=pos(b),A0={x:P.x-b.dx,y:P.y-b.dy};for(let k=1;k<=10;k++){const f=k/10,X=A0.x+b.dx*f,Y=A0.y+b.dy*f;
      const h=asmPlanHit(v.dir,v.u,v.v,(X-v.x)/v.scale,(Y-v.y)/v.scale);if(h&&h.comp!==b.comp)return false;}return true;};
    A(free(bS)&&free(bC),'12b : aucun trait de bulle ne passe au-dessus d’une autre pièce');
    A(T.balloonAt(P1.x+1,P1.y)===bS&&T.balloonAt(P1.x+30,P1.y+30)!==bS,'13 : bulle sous le curseur retrouvée');
    // ── ＋ Bulle : la pièce sous le clic ──
    const r0=T.balloonAdd(v.x+0*v.scale,v.y-10*v.scale); // centre du socle (Z 10)
    A(r0.ok&&r0.b.comp===S.id&&near(r0.b.p[1],-20,1e-3),'14 : ＋ Bulle sur le socle : face avant touchée');
    const r1=T.balloonAdd(v.x+30*v.scale,v.y-40*v.scale); // colonne au-dessus du socle (Z 40)
    A(r1.ok&&r1.b.comp===C.id,'15 : ＋ Bulle sur la colonne');
    const r2=T.balloonAdd(v.x+0*v.scale,v.y-40*v.scale); // vide au-dessus du socle
    A(!r2.ok&&sh.balloons.length===4,'16 : clic dans le vide : pas de bulle ('+r2.msg+')');
    // vu de dessus : le dessus de la colonne (Z 50)
    const vt=T.addView({kind:'base',vk:'top',asm:true});T.geo(vt);
    const r3=T.balloonAdd(vt.x+30*vt.scale,vt.y+0*vt.scale);
    A(r3.ok&&r3.b.comp===C.id&&near(r3.b.p[2],50,1e-3),'17 : vue de dessus : bulle sur le DESSUS de la colonne (Z 50)');
    // nomenclature au niveau « pièces seules » sans la pièce : refus explicite
    const vis=asmNewComp('Vis',S.id);sh.bom.lvl='parts';
    const r4=T.balloonAdd(v.x+0*v.scale,v.y-10*v.scale);
    A(!r4.ok&&/nomenclature/.test(r4.msg),'18 : pièce absente de la nomenclature : refus expliqué');
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== V0.8.2 : mise en plan d assemblage — hachures par pièce, bulles ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
