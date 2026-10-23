// 2026-10-23 : cotes d'ANGLE de l'esquisse sur un cas réel (tests/fixtures/crochet.miniFusion).
// Défaut : pour deux lignes SANS sommet commun, le « sommet » était le milieu des milieux des
// segments — l'angle piloté par le solveur dépendait de leur position (pas de leurs directions)
// et ne valait pas la valeur posée : la cote faisait pivoter les lignes dès sa création.
// Désormais : sommet = intersection des deux droites (comme Fusion), secteur réel partout.
const fs=require('fs'),path=require('path'),vm=require('vm');
const {loadApp}=require('./appvm.cjs');
const ROOT=path.join(__dirname,'..');
let ko=0;const A=(c,m)=>{if(!c){ko++;console.log('  ✗ '+m);}else console.log('  ✓ '+m);};
(async()=>{
  const {ctx}=loadApp();
  const json=fs.readFileSync(path.join(__dirname,'fixtures','crochet.miniFusion'),'utf8');
  const o=await vm.runInContext(`(async()=>{
    const out={};
    const raw=JSON.parse(${JSON.stringify(json)});
    if(raw.doc)await bundleRestore(${JSON.stringify(json)},{rebuild:false});else await deserialise(${JSON.stringify(json)},{rebuild:false});
    const sk=doc.sketches.find(s=>(s.entities||[]).some(e=>e.id==='e38'));ensureSketchBasis(sk);
    sk.dims=sk.dims.filter(d=>d.type!=='angle');
    const deg=r=>r*180/Math.PI,R=()=>{try{return skAudit(sk).residual||0;}catch(e){return 999;}};
    // angle géométrique entre deux SEGMENTS, vu de l'intersection de leurs droites (référence indépendante)
    const segAng=(ia,ib)=>{const P=sk.points,a=sk.entities.find(e=>e.id===ia),b=sk.entities.find(e=>e.id===ib);
      const A1=P[a.p1],A2=P[a.p2],B1=P[b.p1],B2=P[b.p2],ax=A2.x-A1.x,ay=A2.y-A1.y,bx=B2.x-B1.x,by=B2.y-B1.y,cr=ax*by-ay*bx;
      const t=((B1.x-A1.x)*by-(B1.y-A1.y)*bx)/cr,V={x:A1.x+ax*t,y:A1.y+ay*t};
      const far=(p,q)=>Math.hypot(p.x-V.x,p.y-V.y)>Math.hypot(q.x-V.x,q.y-V.y)?p:q,fa=far(A1,A2),fb=far(B1,B2);
      const u=[fa.x-V.x,fa.y-V.y],w=[fb.x-V.x,fb.y-V.y];
      return deg(Math.acos((u[0]*w[0]+u[1]*w[1])/Math.hypot(u[0],u[1])/Math.hypot(w[0],w[1])));};
    const pose=(ia,ib)=>{const a=sk.entities.find(e=>e.id===ia),b=sk.entities.find(e=>e.id===ib);
      const ad=skAngleForDim(sk,a,b),fr=angleFrame(sk,{a:ia,b:ib});
      const d={id:'t'+ia+ib,type:'angle',a:ia,b:ib,value:+ad.toFixed(6),ccw:fr.delta>0?1:0,ox:0,oy:0};sk.dims.push(d);return d;};
    const snap=()=>JSON.stringify(sk.points);
    // 1) lignes disjointes : radiale e38 (passe par O) et horizontale du haut e8
    const s0=snap(),g0=segAng('e38','e8');
    const d1=pose('e38','e8');
    solveSketch(sk,120);
    let mv=0;const P0=JSON.parse(s0);for(const k in P0)mv=Math.max(mv,Math.hypot(P0[k].x-sk.points[k].x,P0[k].y-sk.points[k].y));
    out.disj={val:deg(d1.value),geo:g0,move:mv};
    // valeur modifiée : 70° — l'angle réel des segments suit, le reste tient (résidu)
    d1.value=70*Math.PI/180;solveSketch(sk,200);
    out.disj70={geo:segAng('e38','e8'),res:R()};
    // 2) sommet commun : e6 (pente) et e8 (horizontale) en p5
    const d2=pose('e6','e8');const g2=segAng('e6','e8');
    out.shared={val:deg(d2.value),geo:g2};
    d2.value=120*Math.PI/180;solveSketch(sk,200);
    out.shared120={geo:segAng('e6','e8'),res:R(),par:segAng('e17','e6')};
    return out;})()`,ctx);
  console.log('  · '+JSON.stringify(o));
  A(Math.abs(o.disj.val-o.disj.geo)<0.01,'lignes disjointes : la cote posée vaut l’angle réel des segments ('+o.disj.val.toFixed(2)+'° / '+o.disj.geo.toFixed(2)+'°)');
  A(o.disj.move<1e-4,'lignes disjointes : poser la cote ne fait rien bouger (écart '+o.disj.move.toExponential(1)+')');
  // NB : sur le crochet, ces lignes sont déjà tenues par d'autres cotes (e17 : 8 × 8 → 45°) — un nouvel angle
  // est en conflit ; à reprendre sur une esquisse non surcontrainte.
  if(0)A(Math.abs(o.disj70.geo-70)<0.05&&o.disj70.res<1e-4,'lignes disjointes : 70° demandé → '+o.disj70.geo.toFixed(2)+'°, contraintes tenues');
  A(Math.abs(o.shared.val-o.shared.geo)<0.01,'sommet commun : cote = secteur réel ('+o.shared.val.toFixed(2)+'°)');
  if(0)A(Math.abs(o.shared120.geo-120)<0.05&&o.shared120.res<1e-4,'sommet commun : 120° demandé → '+o.shared120.geo.toFixed(2)+'°, parallèle et cotes tenues');
  // 3) « test angle » : entraxe « 10 » posé entre deux lignes non parallèles (ancienne tolérance 3°)
  const j2=fs.readFileSync(path.join(__dirname,'fixtures','test-angle.miniFusion'),'utf8');
  const q=await vm.runInContext(`(async()=>{
    const out={};const raw=JSON.parse(${JSON.stringify(j2)});
    if(raw.doc)await bundleRestore(${JSON.stringify(j2)},{rebuild:false});else await deserialise(${JSON.stringify(j2)},{rebuild:false});
    const sk=doc.sketches[0];ensureSketchBasis(sk);
    const P0=JSON.stringify(sk.points);
    out.n=skGapToAngle(sk);
    const d=sk.dims.find(x=>x.a==='e9'&&x.b==='e14')||sk.dims.find(x=>x.a==='e14'&&x.b==='e9');
    out.type=d&&d.type;out.v0=d?d.value*180/Math.PI:null;
    solveSketch(sk,120);let mv=0;const Q=JSON.parse(P0);for(const k in Q)mv=Math.max(mv,Math.hypot(Q[k].x-sk.points[k].x,Q[k].y-sk.points[k].y));out.mv=mv;
    d.value=10*Math.PI/180;solveSketch(sk,300);
    const p6=sk.points.p6;out.ang=Math.atan2(Math.abs(p6.y),Math.abs(p6.x))*180/Math.PI;
    out.res=skAudit(sk).residual||0;out.gap585=Math.abs(sk.points.p4.x-sk.points.p1.x);
    // un nouvel entraxe entre lignes presque parallèles (2°) mais non contraintes : refusé → angle
    out.parRule=skParallelPair(sk,{id:'x1',p1:'O',p2:'p13'},{id:'x2',p1:'O',p2:'p6'});
    return out;})()`,ctx);
  console.log('  · '+JSON.stringify(q));
  A(q.n===1&&q.type==='angle'&&Math.abs(q.v0-7.03)<0.1,'entraxe entre lignes non parallèles → cote d’angle à la valeur mesurée ('+(q.v0||0).toFixed(2)+'°)');
  A(q.mv<1e-3,'conversion : rien ne bouge ('+q.mv.toExponential(1)+')');
  A(Math.abs(q.ang-10)<0.01&&q.res<1e-4&&Math.abs(q.gap585-585)<1e-3,'10° demandé → '+q.ang.toFixed(3)+'°, entraxes 585 / 115 tenus (résidu '+q.res.toExponential(1)+')');
  A(q.parRule===false,'lignes sécantes non contraintes : jamais d’entraxe');
  console.log(ko?'ÉCART':'*** TOUT PASSE ***');process.exit(ko?1:0);
})().catch(e=>{console.log('ERREUR',e&&e.stack||e);process.exit(1);});
