// FAO — Ébauche 3D (V0.11.26) : MODÈLE SIMPLE DES PASSES. On descend de ap
// en ap depuis Haut ; un fond réel (épaulement, plancher) est un arrêt : la
// passe s'y pose pour le reste (< ap), puis on repart de ap en ap depuis lui.
// Chaque niveau est une passe complète. Mini-passes : nb sur une tranche
// pleine, ⌊nb·reste/ap⌋ sur un reste (3 mm, ap 5, nb 4 → 2,4 → 2).
// Fixture : solide manifold en terrasses — cadre 10, épaulement 8
// (15..85 × 15..65), cavité 0 (25..75 × 25..55), dessous −5.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const out=vm.runInContext(`(function(){
    const P=[]; const A=(ok,m)=>P.push((ok?'OK   ':'ECHEC')+' : '+m);
    const xs=[0,15,25,75,85,100], ys=[0,15,25,55,65,80], zb=-5;
    const hOf=function(i,j){ // case (i,j) ; hors grille = dessous
      if(i<0||j<0||i>=xs.length-1||j>=ys.length-1)return zb;
      const ri=Math.min(i,xs.length-2-i), rj=Math.min(j,ys.length-2-j), r=Math.min(ri,rj);
      return r===0?10:(r===1?8:0);};
    const V=[],T=[],map={};
    const vx=function(x,y,z){const k=x+','+y+','+z;let n=map[k];if(n===undefined){n=V.length;V.push([x,y,z]);map[k]=n;}return n;};
    const quad=function(a,b,c,d){T.push([a,b,c]);T.push([a,c,d]);};
    for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++){
      const x0=xs[i],x1=xs[i+1],y0=ys[j],y1=ys[j+1],h=hOf(i,j);
      quad(vx(x0,y0,h),vx(x1,y0,h),vx(x1,y1,h),vx(x0,y1,h));       // dessus
      quad(vx(x0,y0,zb),vx(x0,y1,zb),vx(x1,y1,zb),vx(x1,y0,zb));   // dessous
    }
    for(let i=-1;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++){ // parois x = xs[i+1]
      const hA=hOf(i,j),hB=hOf(i+1,j);if(hA===hB)continue;
      const x=xs[i+1],y0=ys[j],y1=ys[j+1],lo=Math.min(hA,hB),hi=Math.max(hA,hB);
      if(hA>hB)quad(vx(x,y0,lo),vx(x,y1,lo),vx(x,y1,hi),vx(x,y0,hi));
      else quad(vx(x,y0,lo),vx(x,y0,hi),vx(x,y1,hi),vx(x,y1,lo));
    }
    for(let i=0;i<xs.length-1;i++)for(let j=-1;j<ys.length-1;j++){ // parois y = ys[j+1]
      const hA=hOf(i,j),hB=hOf(i,j+1);if(hA===hB)continue;
      const y=ys[j+1],x0=xs[i],x1=xs[i+1],lo=Math.min(hA,hB),hi=Math.max(hA,hB);
      if(hA>hB)quad(vx(x0,y,lo),vx(x0,y,hi),vx(x1,y,hi),vx(x1,y,lo));
      else quad(vx(x0,y,lo),vx(x1,y,lo),vx(x1,y,hi),vx(x0,y,hi));
    }
    const PO={v:V,t:T};
    (function(){ const ed={}; let bad=0;
      for(let i=0;i<T.length;i++)for(let k=0;k<3;k++){const a=T[i][k],b=T[i][(k+1)%3];
        const key=Math.min(a,b)+','+Math.max(a,b);(ed[key]=ed[key]||[]).push(a<b?1:-1);}
      for(const k in ed){const e=ed[k];if(e.length!==2||e[0]===e[1])bad++;}
      A(bad===0,'fixture en terrasses manifold ('+T.length+' tris'+(bad?', '+bad+' arête(s) mal fermée(s)':'')+')');
    })();
    const BX={x0:0,y0:0,x1:100,y1:80};
    const gen=function(extra){
      const o={ap:5,ae:3,toolD:10,radial:0,axial:0,secu:20};
      if(extra)for(const k in extra)o[k]=extra[k];
      // coupes à plat : segment de coupe à cote constante (hors hélices et entrées)
      const mv=faoGenRough3D(PO,BX,10,0,o),out=[];
      for(let i=1;i<mv.length;i++){const p=mv[i-1],q=mv[i];
        if(!q.r&&!p.r&&!q.ent&&Math.abs(p.z-q.z)<1e-9)out.push(q);}
      return out;
    };
    const at=function(cuts,z){return cuts.filter(function(m){return Math.abs(m.z-z)<1e-6;});};
    const inCav=function(m){return m.x>31&&m.x<69&&m.y>31&&m.y<49;};      // centres loin de l'épaulement
    const onShelf=function(m){return m.x>19.5&&m.x<80.5&&m.y>19.5&&m.y<60.5&&!(m.x>30.5&&m.x<69.5&&m.y>30.5&&m.y<49.5);};
    const c=gen();
    const zs={};c.forEach(function(m){if(m.z<10-1e-6&&m.z>0)zs[Math.round(m.z*1000)/1000]=1;});
    A(Object.keys(zs).map(Number).sort(function(a,b){return b-a;}).join(' ')==='8 3',
      'niveaux de coupe : 8 (reste 2 sur épaulement) 3 (+ fond 0) — '+Object.keys(zs).join(' '));
    const z8=at(c,8), z3=at(c,3);
    A(z8.some(inCav)&&z8.some(onShelf),'niveau 8 : passe complète, cavité et épaulement ('+z8.filter(inCav).length+' / '+z8.filter(onShelf).length+')');
    A(z3.length>0&&z3.every(function(m){return m.x<0||m.x>100||m.y<0||m.y>80||m.x>29.9&&m.x<70.1&&m.y>29.9&&m.y<50.1;}),'niveau 3 : ap sous épaulement, dans la cavité seule ('+z3.length+' points)');
    A(at(c,5).length===0,'aucune passe de grille à 5 (ancien modèle : 1 passe pour 3 mm)');
    // mini-passes : 8 → 3 tranche pleine (4) ; reste 3 → 0 : ⌊4·3/5⌋ = 2
    const m4=gen({minipasses:4});
    const zm={};m4.forEach(function(m){const z=Math.round(m.z*1000)/1000;if(z>0&&z<8&&z!==3)zm[z]=1;});
    const got=Object.keys(zm).map(Number).sort(function(a,b){return b-a;}).join(' ');
    // (le contour à 4 sort vide sur cette fixture, ancien moteur compris)
    A(/^7 6 5 (4 )?2 1$/.test(got),'mini-passes 8 → 3 : 7 6 5 (4) ; reste 3 → 0 : ⌊2,4⌋ = 2 → 2 1 — '+got);
    const m1=gen({minipasses:1});
    const z1={};m1.forEach(function(m){const z=Math.round(m.z*1000)/1000;if(z>0&&z<3)z1[z]=1;});
    A(Object.keys(z1).length===0,'nb 1 sur un reste de 3 : ⌊0,6⌋ = 0 mini-passe — '+Object.keys(z1).join(' '));
    return P;
  })()`,ctx);
  let ko=0;
  out.forEach(function(l){ console.log('  '+(l.indexOf('OK')===0?'✓':'✗')+' '+l.slice(7)); if(l.indexOf('ECHEC')===0)ko++; });
  if(ko){ console.log('\n'+ko+' ECHEC(S)'); process.exit(1); }
  console.log('\nTOUT EST CONFORME');
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
