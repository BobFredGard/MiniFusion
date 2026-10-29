// V0.20.1 : esquisse — arêtes et points du PLAN utilisables sans ⧉ (50-esquisse-7-plan-cibles.js).
// Harnais : noyau OCCT RÉEL (wasm), boîte 100×60×40.
//  1) esquisse sur la face du dessus (z=40) : 4 arêtes du plan, 4 sommets, 4 milieux ;
//  2) survol (outil Ligne) : sommet / milieu / pied sur arête → accroche + surbrillance ;
//  3) clic : projection automatique, associative, réutilisée (pas de doublon) ;
//  4) ligne tracée de sommet à milieu (vrais événements souris), cote sur une arête ;
//  5) plan médian y=30 : points de traversée des arêtes, suivis quand la boîte s'allonge ;
//  6) croisements 2D (ligne/ligne, ligne/cercle, cercle/cercle) ;
//  7) hors des outils de dessin (Sélection) : aucune accroche du plan.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};window.confirm=function(){return true;};',ctx);
  console.log('=== esquisse : arêtes / points du plan sans projection ===');
  const body=`
    const OK=[],KO=[];const A=(c,m)=>{(c?OK:KO).push(m);};
    const near=(a,b,t)=>Math.abs(a-b)<(t||1e-6);
    const box=(lx)=>new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(10,10,0),lx,60,40).Shape();
    occLive={shape:box(100)};
    const sk={id:'p1',name:'P',plane:'FACE',origin:[0,0,40],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],
      entities:[],points:{},constraints:[],dims:[],seq:1,visible:true};
    ensureSketchBasis(sk);doc.sketches=[sk];doc.features=[];
    openSketch('p1');
    skView.s=4;skUpdateTols();
    // ── 1. cibles ──
    const T=skPlTargets(sk);
    A(T.E.length===4&&T.E.every(e=>e.type==='line'),'1 : 4 arêtes droites dans le plan z=40 ('+T.E.length+')');
    const kinds=k=>T.P.filter(p=>p.kind===k).length;
    A(kinds('end')===4&&kinds('mid')===4&&kinds('pierce')===0&&kinds('isect')===0,'1 : 4 sommets + 4 milieux, ni traversée ni croisement ('+JSON.stringify(T.P.map(p=>p.kind))+')');
    A(T.E.every(e=>e.srcMid&&near(e.srcMid[2],40)),'1 : chaque arête garde son milieu 3D (associativité)');
    // ── 2. survol ──
    skTool='line';
    let s=findSnap(sk,10.4,10.3);
    A(s&&s.kind==='plane'&&s.pl.kind==='pt'&&s.pl.p.kind==='end'&&near(s.x,10)&&near(s.y,10),'2 : sommet (10,10) accroché');
    A(skPlHover&&skPlHover.kind==='pt','2 : surbrillance posée');
    s=findSnap(sk,60.5,10.4);
    A(s&&s.kind==='plane'&&s.pl.p&&s.pl.p.kind==='mid'&&near(s.x,60),'2 : milieu (60,10)');
    s=findSnap(sk,40,10.8);
    A(s&&s.kind==='plane'&&s.pl.kind==='edge'&&near(s.x,40)&&near(s.y,10),'2 : pied sur l’arête (40,10)');
    s=findSnap(sk,40,30);
    A(!s&&!skPlHover,'2 : loin de tout : rien, surbrillance effacée');
    let n=0;const _skEl=skEl;skEl=function(t,a,p){if(a&&(a.stroke==='#ff9f0a'||a.fill==='#ff9f0a'))n++;return _skEl(t,a,p);};
    findSnap(sk,10.4,10.3);drawSketch2D();skEl=_skEl;
    A(n>=3,'2 : dessin orange (2 arêtes + point : '+n+')');
    // ── 3. clic : projection automatique ──
    const proj=()=>sk.entities.filter(e=>e.proj);
    const p0=snapNewPoint(sk,10.4,10.3);
    A(proj().length===1&&proj()[0].t==='line'&&proj()[0].construction,'3 : arête projetée en construction ('+proj().length+')');
    A([proj()[0].p1,proj()[0].p2].indexOf(p0)>=0,'3 : le point cliqué EST l’extrémité projetée');
    const e1=proj()[0],o1=sk.points[e1.p1===p0?e1.p2:e1.p1];
    const p1=snapNewPoint(sk,o1.x+0.3,o1.y-0.4);
    A(proj().length===1&&[proj()[0].p1,proj()[0].p2].indexOf(p1)>=0,'3 : sommet voisin : même projetée réutilisée, pas de doublon');
    // ── 4. vrais événements : ligne du sommet (10,70) au milieu (110,40) ──
    const C=(wx,wy)=>{const r=svg.getBoundingClientRect();const p=w2s(wx,wy);return [r.left+p[0],r.top+p[1]];};
    const ev=(type,x,y,extra)=>Object.assign({type,button:0,buttons:0,shiftKey:false,ctrlKey:false,altKey:false,metaKey:false,detail:1,pointerId:1,
      clientX:x,clientY:y,preventDefault(){},stopPropagation(){}},extra||{});
    const at=(type,wx,wy)=>{const p=C(wx,wy);svg.dispatchEvent(ev(type,p[0],p[1],type==='pointerdown'?{buttons:1}:{}));};
    const nL=sk.entities.filter(e=>e.t==='line'&&!e.construction).length;
    at('pointermove',10.3,69.7);at('pointerdown',10.3,69.7);at('pointerup',10.3,69.7);
    at('pointermove',109.7,40.4);at('pointerdown',109.7,40.4);at('pointerup',109.7,40.4);
    skEscapeToSelect();
    const L=sk.entities.filter(e=>e.t==='line'&&!e.construction);
    A(L.length===nL+1,'4 : une ligne tracée ('+(L.length-nL)+')');
    const l=L[L.length-1],LA=l&&sk.points[l.p1],LB=l&&sk.points[l.p2];
    A(LA&&LB&&near(LA.x,10)&&near(LA.y,70)&&near(LB.x,110)&&near(LB.y,40),'4 : de (10,70) à (110,40) : '+JSON.stringify([LA,LB]));
    const pE=pid=>proj().some(e=>e.t==='line'&&(e.p1===pid||e.p2===pid));
    A(pE(l.p1),'4 : le départ est l’extrémité d’une arête projetée au passage');
    A(proj().some(e=>e.t==='line'&&near(sk.points[e.p1].x,110)&&near(sk.points[e.p2].x,110)),'4 : arête x=110 projetée pour son milieu');
    A(sk.constraints.some(c=>c.type==='midpoint'&&c.p===l.p2&&entById(sk,c.line)&&entById(sk,c.line).proj),'4 : bout au milieu de l’arête projetée (contrainte milieu)');
    skTool='dim';
    skPlDimPrep(sk,60,10.5);
    const y60=()=>proj().filter(e=>e.t==='line'&&near(sk.points[e.p1].y,70)&&near(sk.points[e.p2].y,70)).length;
    const y10=proj().filter(e=>e.t==='line'&&near(sk.points[e.p1].y,10)&&near(sk.points[e.p2].y,10)).length;
    A(y10===1,'4 : cote sur l’arête y=10 : une seule projetée ('+y10+')');
    skPlDimPrep(sk,60,69.6);
    A(y60()===1,'4 : cote sur l’arête y=70 : projetée une seule fois ('+y60()+')');
    // ── 7. outil Sélection : rien ──
    skTool='select';
    A(!findSnap(sk,10.4,10.3)||findSnap(sk,10.4,10.3).kind!=='plane','7 : Sélection : pas d’accroche du plan');
    closeSketch(false);
    // ── 5. plan médian y=30 : traversées ──
    const s2={id:'p2',name:'M',plane:'FACE',origin:[0,30,0],axU:[1,0,0],axV:[0,0,1],axN:[0,-1,0],
      entities:[],points:{},constraints:[],dims:[],seq:1,visible:true};
    ensureSketchBasis(s2);doc.sketches=[sk,s2];
    occLive={shape:box(100)}; // closeSketch a rejoué le document (vide)
    _skPlCache=null;
    const T2=skPlTargets(s2);
    const pc=T2.P.filter(p=>p.kind==='pierce');
    A(T2.E.length===0&&pc.length===4,'5 : plan médian : aucune arête, 4 traversées ('+T2.E.length+'/'+pc.length+')');
    const b=sketchBasis(s2),to2=q=>[(q[0]-b.o.x)*b.u.x+(q[1]-b.o.y)*b.u.y+(q[2]-b.o.z)*b.u.z,(q[0]-b.o.x)*b.v.x+(q[1]-b.o.y)*b.v.y+(q[2]-b.o.z)*b.v.z];
    const want=[[10,30,0],[110,30,0],[10,30,40],[110,30,40]].map(to2);
    A(want.every(w=>pc.some(p=>near(p.x,w[0],1e-6)&&near(p.y,w[1],1e-6))),'5 : aux bons endroits '+JSON.stringify(pc.map(p=>[p.x,p.y])));
    const w1=to2([110,30,40]);
    const h=skPlHit(s2,w1[0]+0.3,w1[1]-0.2);
    const q=skPlMaterialize(s2,h);
    if(!q||!s2.points[q]){KO.push('5 : traversée non matérialisée');return {OK,KO};}
    const cp=s2.entities.find(e=>e.t==='cpoint'&&e.p===q);
    A(cp&&cp.pierce&&cp.proj&&cp.construction&&s2.constraints.some(c=>c.type==='fix'&&c.p===q),'5 : point de construction projeté, fixe');
    // la boîte s'allonge à 120 : la traversée suit, la projetée de la face aussi
    occLive={shape:box(120)};_skPlCache=null;
    updateAssociativeProjections(s2);
    const w2=to2([130,30,40]);
    A(near(s2.points[q].x,w2[0],1e-6)&&near(s2.points[q].y,w2[1],1e-6),'5 : traversée suivie au rejeu '+JSON.stringify(s2.points[q]));
    updateAssociativeProjections(sk);
    const e0=proj().find(e=>e.t==='line'&&near(sk.points[e.p1].y,10)&&near(sk.points[e.p2].y,10));
    A(e0&&near(Math.max(sk.points[e0.p1].x,sk.points[e0.p2].x),130,1e-6),'5 : arête du plan projetée automatiquement : suit aussi (x→130)');
    // ── 6. croisements 2D ──
    const X=skPlIsect({type:'line',x1:0,y1:0,x2:10,y2:10},{type:'line',x1:0,y1:10,x2:10,y2:0});
    A(X.length===1&&near(X[0][0],5)&&near(X[0][1],5),'6 : ligne × ligne');
    const Y=skPlIsect({type:'line',x1:-10,y1:0,x2:10,y2:0},{type:'circle',cx:0,cy:0,r:5});
    A(Y.length===2&&Y.every(p=>near(Math.abs(p[0]),5)),'6 : ligne × cercle');
    const Z=skPlIsect({type:'circle',cx:0,cy:0,r:5},{type:'circle',cx:8,cy:0,r:5});
    A(Z.length===2&&Z.every(p=>near(p[0],4)),'6 : cercle × cercle');
    const W=skPlIsect({type:'line',x1:0,y1:0,x2:2,y2:0},{type:'circle',cx:0,cy:0,r:5});
    A(W.length===0,'6 : hors du segment : aucun');
    return {OK,KO};
  `;
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx);
  o.OK.forEach(m=>console.log('  ✓ '+m));o.KO.forEach(m=>console.log('  ✗ '+m));
  console.log(o.KO.length?'\n*** '+o.KO.length+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(o.KO.length?1:0);
})().catch(e=>{console.log('  ✗ '+(e&&e.stack||e));process.exit(1);});
