// Esquisse 2D (4/5) : dessin SVG et cotes.
/* ----- dessin SVG ----- */
let skRoot=null; // groupe racine du dessin : porte la transformation affine de l'orbite (null = vue normale)
function skEl(n,attrs,parent){
  const el=document.createElementNS(NS,n);
  for(const k in attrs)el.setAttribute(k,attrs[k]);
  (parent||skRoot||svg).appendChild(el);return el;
}
// Perspective (vue hors du plan) : le dessin, tracé en vue normale, va dans un SECOND SVG que CSS
// projette (matrix3d = homographie _skH) ; son cadre (non transformé) le coupe au bord du SVG
// d'esquisse. #skSvg reste en place, vide et transparent : il reçoit toujours la souris.
let _skSvgPW=null,_skSvgP=null;
function skSvgPGet(W,H){
  if(!_skSvgP){
    _skSvgPW=document.createElement('div');_skSvgPW.id='skSvgPWrap';
    _skSvgPW.style.cssText='position:absolute;overflow:hidden;pointer-events:none';
    _skSvgP=document.createElementNS(NS,'svg');_skSvgP.id='skSvgP';
    _skSvgP.style.cssText='position:absolute;left:0;top:0;overflow:visible;transform-origin:0 0';
    _skSvgPW.appendChild(_skSvgP);svg.parentNode.appendChild(_skSvgPW);
  }
  const h=_skH,f=x=>+x.toPrecision(12),pa=svg.parentNode,pr=pa.getBoundingClientRect(),r=svg.getBoundingClientRect(); // (pas d'offsetLeft sur un SVG)
  Object.assign(_skSvgPW.style,{display:'',left:(r.left-pr.left-pa.clientLeft)+'px',top:(r.top-pr.top-pa.clientTop)+'px',width:W+'px',height:H+'px',visibility:_skEdge?'hidden':''});
  _skSvgP.setAttribute('width',W);_skSvgP.setAttribute('height',H);_skSvgP.setAttribute('viewBox',`0 0 ${W} ${H}`);
  _skSvgP.style.transform=`matrix3d(${[h[0],h[3],0,h[6],h[1],h[4],0,h[7],0,0,1,0,h[2],h[5],0,h[8]].map(f).join(',')})`;
  _skSvgP.innerHTML='';
  return _skSvgP;
}
function skSvgPHide(){if(_skSvgPW){_skSvgPW.style.display='none';_skSvgP.innerHTML='';}}
function drawSketch2D(){
  if(!skEdit)return;const sk=skEdit;
  const{W,H}=svgSize();svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.innerHTML='';
  if(_skPrevCam) sketchSyncCamera(); // caméra (orthographique de face, perspective hors du plan) et _skH
  const persp=!!(_skH&&skOrbOn());
  if(persp)skRoot=skEl('g',{},skSvgPGet(W,H));
  else{skSvgPHide();const tf=skOrbTransform();skRoot=null;if(tf)skRoot=skEl('g',{transform:tf},svg);}
  // grille adaptative à l'échelle — en orbite, la zone du plan visible déborde le cadre :
  // lignes coupées par cette zone (perspective : arrêtées avant l'horizon)
  const gpoly=skOrbVisPoly(W,H).map(p=>s2w(p[0],p[1]));
  let gvx0=1e18,gvx1=-1e18,gvY0=1e18,gvY1=-1e18;
  gpoly.forEach(([wx,wy])=>{gvx0=Math.min(gvx0,wx);gvx1=Math.max(gvx1,wx);gvY0=Math.min(gvY0,wy);gvY1=Math.max(gvY1,wy);});
  let gstep=10;const gsteps=[0.001,0.002,0.005,0.01,0.02,0.05,0.1,0.2,0.5,1,2,5,10,20,50,100,200,500,1000,2000];
  for(const st of gsteps){if(st*skView.s>=16){gstep=st;break;}}
  const gline=(xa,ya,xb,yb,isAx)=>{const c=skClipSeg(gpoly,xa,ya,xb,yb);if(!c)return;
    const[x1,y1]=w2s(c[0],c[1]),[x2,y2]=w2s(c[2],c[3]);
    skEl('line',{x1,y1,x2,y2,stroke:isAx?'#0a84ff':'#2a2a2e','stroke-width':isAx?1.5:1});};
  const kx0=Math.floor(gvx0/gstep),kx1=Math.ceil(gvx1/gstep),ky0=Math.floor(gvY0/gstep),ky1=Math.ceil(gvY1/gstep);
  if(kx1-kx0<600)for(let k=kx0;k<=kx1;k++){const gx=k*gstep,isAx=Math.abs(gx)<1e-9;if(!isAx&&!skShowGrid)continue; // grille masquée : axes seuls
    gline(gx,gvY0-gstep,gx,gvY1+gstep,isAx);}
  if(ky1-ky0<600)for(let k=ky0;k<=ky1;k++){const gy=k*gstep,isAx=Math.abs(gy)<1e-9;if(!isAx&&!skShowGrid)continue;
    gline(gvx0-gstep,gy,gvx1+gstep,gy,isAx);}
  // Fantôme 2D orthographique (pièce derrière, sans perspective) — bouge avec le zoom/pan comme Fusion
  // B : violet supprimé, fantôme seul et plus contrasté pour bien voir la pièce
  // Perspective : la pièce elle-même est visible en 3D, le fantôme aplati n'aurait plus de sens.
  if(!persp&&(sk._ghost||[]).length){
    for(const r of sk._ghost){
      if(r.type==='circle'){
        const[a,b]=w2s(r.cx,r.cy);
        skEl('circle',{cx:a,cy:b,r:r.r*skView.s,fill:'none',stroke:'#e6e6ee','stroke-width':1.15,opacity:0.42});
      } else if(r.type==='arc'){
        const[a,b]=w2s(r.x1,r.y1),[c,d]=w2s(r.x2,r.y2);
        let dd=r.a2-r.a1; while(dd<=0)dd+=Math.PI*2; while(dd>Math.PI*2)dd-=Math.PI*2;
        skEl('path',{d:`M ${a} ${b} A ${r.r*skView.s} ${r.r*skView.s} 0 ${dd>Math.PI?1:0} 0 ${c} ${d}`,fill:'none',stroke:'#e6e6ee','stroke-width':1.15,opacity:0.42});
      } else {
        const[a,b]=w2s(r.x1,r.y1),[c,d]=w2s(r.x2,r.y2);
        if((a<-100&&c<-100)||(a>W+100&&c>W+100)||(b<-100&&d<-100)||(b>H+100&&d>H+100))continue;
        skEl('line',{x1:a.toFixed(1),y1:b.toFixed(1),x2:c.toFixed(1),y2:d.toFixed(1),stroke:'#e6e6ee','stroke-width':1.15,opacity:0.42});
      }
    }
  }
  // Références : arêtes du solide projetées (fond violet, non éditable, jamais dans le profil)
  // Outil ⧉ Projeter : visibles d'office (sinon on projette « dans le vide ») — masquées
  // dès que l'outil est quitté si le toggle reste éteint.
  if((skShowRefs||skTool==='project')&&(sk._refs||[]).length){
    for(let i=0;i<sk._refs.length;i++){const r=sk._refs[i];
      if(r.type==='circle'){
        const[a,b]=w2s(r.cx,r.cy);
        skEl('circle',{cx:a,cy:b,r:r.r*skView.s,fill:'none',stroke:'#bf5af2','stroke-width':1,'stroke-dasharray':'5 4',opacity:0.5});
      } else if(r.type==='arc'){
        const[a,b]=w2s(r.cx+r.r*Math.cos(r.a1),r.cy+r.r*Math.sin(r.a1)),[c,d]=w2s(r.cx+r.r*Math.cos(r.a2),r.cy+r.r*Math.sin(r.a2));
        let dd=r.a2-r.a1; const TAU=Math.PI*2; dd=((dd%TAU)+TAU)%TAU; if(dd<1e-9)dd=TAU;
        skEl('path',{d:`M ${a} ${b} A ${r.r*skView.s} ${r.r*skView.s} 0 ${dd>Math.PI?1:0} 0 ${c} ${d}`,fill:'none',stroke:'#bf5af2','stroke-width':1,'stroke-dasharray':'5 4',opacity:0.5});
      } else {
        const[a,b]=w2s(r.x1,r.y1),[c,d]=w2s(r.x2,r.y2);
        if(!skOrbOn()&&((a<-60&&c<-60)||(a>W+60&&c>W+60)||(b<-60&&d<-60)||(b>H+60&&d>H+60)))continue; // en orbite, le visible déborde le cadre
        skEl('line',{x1:a.toFixed(1),y1:b.toFixed(1),x2:c.toFixed(1),y2:d.toFixed(1),stroke:'#bf5af2','stroke-width':1,'stroke-dasharray':'5 4',opacity:0.5});
      }
    }
  }
  // guides d'inférence H/V + ⟂/⦾
  if(skInfer){
    if(skInfer.v){const[x]=w2s(skInfer.x,0);skEl('line',{x1:x,y1:0,x2:x,y2:H,stroke:'#bf5af2','stroke-width':1,'stroke-dasharray':'6 4'});}
    if(skInfer.h){const[,y]=w2s(0,skInfer.y);skEl('line',{x1:0,y1:y,x2:W,y2:y,stroke:'#bf5af2','stroke-width':1,'stroke-dasharray':'6 4'});}
    if(skInfer.perp){const l=entById(sk,skInfer.perp);if(l&&l.t==='line'){const A=sk.points[l.p1],B=sk.points[l.p2];
      if(A&&B){const[a,b]=w2s(A.x,A.y),[c,d2]=w2s(B.x,B.y);skEl('line',{x1:a,y1:b,x2:c,y2:d2,stroke:'#ffd60a','stroke-width':3,opacity:0.9});}}}
    if(skInfer.tan){const c=entById(sk,skInfer.tan);if(c){const C=sk.points[c.pc];
      if(C){const[a,b]=w2s(C.x,C.y);skEl('circle',{cx:a,cy:b,r:c.r*skView.s,fill:'none',stroke:'#ffd60a','stroke-width':3});}}}
    // V0.11.24 : ∥ = ligne de référence surlignée ; prolongement = guide pointillé du bout de la ligne au curseur
    if(skInfer.par){const l=entById(sk,skInfer.par);if(l&&l.t==='line'){const A=sk.points[l.p1],B=sk.points[l.p2];
      if(A&&B){const[a,b]=w2s(A.x,A.y),[c,d2]=w2s(B.x,B.y);skEl('line',{x1:a,y1:b,x2:c,y2:d2,stroke:'#bf5af2','stroke-width':7,opacity:0.55});}}} // halo large : l’entité (2 px) est dessinée par-dessus
    if(skInfer.ext&&skInfer.from){const[a,b]=w2s(skInfer.from.x,skInfer.from.y),[c,d2]=w2s(skInfer.x,skInfer.y);
      skEl('line',{x1:a,y1:b,x2:c,y2:d2,stroke:'#bf5af2','stroke-width':1,'stroke-dasharray':'6 4'});}
  }
  const fix=skFixed(sk);
  const showDof=skDofInfo(sk).dof>0; // flèches DOF tant que sous-contrainte (rang réel)
  const selIds=new Set();if(skSel&&skSel.kind==='ent')selIds.add(skSel.id);skSelX.forEach(s=>{if(s.kind==='ent')selIds.add(s.id);});
  // 2026-10-16-001 : bleu = entité encore libre (au moins un degré de liberté),
  // blanc = entité entièrement déterminée (contraintes + cotes + points fixes) —
  // par ANALYSE DE RANG (avant : seules les entités aux points « fixes » blanchissaient).
  const DA=skDofInfo(sk);
  const col=e=>selIds.has(e.id)?'#ff9f0a':(DA.entFull(e)?'#e8e8ea':'#64d2ff');
  const wdt=e=>selIds.has(e.id)?3.5:2;
  const tangT=(e,C)=>{ // [{x,y}] : un sigle T par tangence, posé au point de contact sur le cercle/arc (Fusion360)
    const P=sk.points;
    const out=[];
    (sk.constraints||[]).forEach(k=>{
      if(k.type==='tangent'&&k.ent===e.id){
        const L=entById(sk,k.line);if(!L||L.t!=='line')return;
        const A2=P[L.p1],B2=P[L.p2];if(!A2||!B2)return;
        const ex=B2.x-A2.x,ey=B2.y-A2.y,el2=ex*ex+ey*ey;if(el2<1e-12)return;
        const t=((C.x-A2.x)*ex+(C.y-A2.y)*ey)/el2;
        const fx=A2.x+t*ex,fy=A2.y+t*ey,fd=Math.hypot(fx-C.x,fy-C.y)||1e-9;
        out.push({x:C.x+(fx-C.x)/fd*e.r,y:C.y+(fy-C.y)/fd*e.r});
      }else if(k.type==='tangent2'&&(k.a===e.id||k.b===e.id)){
        const O=entById(sk,k.a===e.id?k.b:k.a);if(!O||!P[O.pc])return;
        const OC=P[O.pc],dd=Math.hypot(OC.x-C.x,OC.y-C.y)||1e-9;
        out.push({x:C.x+(OC.x-C.x)/dd*e.r,y:C.y+(OC.y-C.y)/dd*e.r});
      }
    });
    return out;
  };
  // Pastilles de contraintes (2026-10-15-007) : même icône que la barre d'outils,
  // posées côte à côte — remplacent les lettres/glyphes verts (H V ∥ ⟂ ⇔ = ◎).
  const badges=(names,sx,sy)=>{
    names.forEach((nmI,i)=>{
      const g=skEl('g',{transform:'translate('+(sx+i*17)+','+(sy-8)+')',class:'skbadge'});
      skEl('rect',{x:0,y:0,width:16,height:16,rx:4,fill:'#16261b',stroke:'#30d158','stroke-width':1},g);
      const ic=skEl('g',{transform:'translate(2,2) scale(0.5)',fill:'none',stroke:'#30d158','stroke-width':2.4,'stroke-linecap':'round','stroke-linejoin':'round',color:'#30d158'},g);
      try{ic.innerHTML=SK_ICONS[nmI]||'';}catch(e){}
    });
  };
  const drawT=(q)=>{const[tx,ty]=w2s(q.x,q.y);
    const g=skEl('text',{x:tx+6,y:ty-6,fill:'#30d158','font-size':12,'font-weight':'bold'});g.textContent='T';};
  (sk.entities||[]).forEach(e=>{
    const P=sk.points;
    if(e.t==='line'&&e.handle){ // poignée de spline : trait fin (symétrique à un point intérieur), T si tangente
      const A=P[e.p1],B=P[e.p2],S=entById(sk,e.handle);if(!A||!B)return;
      const[a,b]=w2s(A.x,A.y),[c,d]=w2s(B.x,B.y),st=selIds.has(e.id)?'#ff9f0a':'#bf5af2';
      const k=S?skSplineIndex(S,e.p1):-1,inner=S&&(S.closed||(k>0&&k<S.pts.length-1));
      skEl('line',{x1:inner?2*a-c:a,y1:inner?2*b-d:b,x2:c,y2:d,stroke:st,'stroke-width':selIds.has(e.id)?2.4:1.3,'stroke-dasharray':'4 3',opacity:.9});
      if((sk.constraints||[]).some(q=>q.type==='stangent'&&q.p===e.p1&&(q.s===e.handle||q.ent===e.handle)))drawT(A);
      return;
    }
    if(e.t==='spline'){const pl=skSplinePoly(sk,e);if(!pl)return;
      const toD=a=>'M '+a.map(q=>{const s=w2s(q[0],q[1]);return s[0].toFixed(1)+' '+s[1].toFixed(1);}).join(' L ');
      if(e.mode==='ctrl'){ // polygone de contrôle : pôles reliés en pointillé
        const Q=e.pts.map(p=>P[p]).filter(Boolean).map(q=>[q.x,q.y]);if(e.closed&&Q.length)Q.push(Q[0]);
        if(Q.length>1)skEl('path',{d:toD(Q),fill:'none',stroke:selIds.has(e.id)?'#ff9f0a':'#bf5af2','stroke-width':1.1,'stroke-dasharray':'3 3',opacity:.75});
        (sk.constraints||[]).forEach(k=>{if(k.type==='stangent'&&(k.s===e.id||k.ent===e.id)&&P[k.p])drawT(P[k.p]);});
      }
      if(skComb.has(e.id)){ // peigne de courbure
        const cb=skSplineComb(sk,e,120)||[];
        cb.forEach((q,i)=>{if(i%2)return;const[a,b]=w2s(q.x,q.y),[c,d2]=w2s(q.qx,q.qy);skEl('line',{x1:a,y1:b,x2:c,y2:d2,stroke:'#ff9f0a','stroke-width':0.8,opacity:.7});});
        if(cb.length>1)skEl('path',{d:toD(cb.map(q=>[q.qx,q.qy])),fill:'none',stroke:'#ff9f0a','stroke-width':1.2,opacity:.85});
      }
      (sk.constraints||[]).forEach(k=>{if(k.type==='scurv'&&k.s===e.id&&P[k.p]){const[tx,ty]=w2s(P[k.p].x,P[k.p].y);
        const g=skEl('text',{x:tx+6,y:ty+16,fill:'#30d158','font-size':11,'font-weight':'bold'});g.textContent='G2';}});
      const d=toD(pl);
      skEl('path',{d,fill:'none',stroke:col(e),'stroke-width':wdt(e),'stroke-linejoin':'round',...(e.construction?{'stroke-dasharray':'7 5',opacity:.45}:{})});
      if((sk.constraints||[]).some(k=>k.type==='fix'&&k.ent===e.id)){const m=pl[Math.floor(pl.length/2)],[mx,my]=w2s(m[0],m[1]);badges(['fix'],mx+8,my-10);}
      return;
    }
    if(e.t==='line'){const A=P[e.p1],B=P[e.p2];if(!A||!B)return;
      const[a,b]=w2s(A.x,A.y),[c,d]=w2s(B.x,B.y);
      if(e.axis){ // axe de rotation : trait mixte (axe), prolongé, toujours visible
        const ux=(c-a),uy=(d-b),ul=Math.hypot(ux,uy)||1,ex2=ux/ul*30,ey2=uy/ul*30;
        skEl('line',{x1:a-ex2,y1:b-ey2,x2:c+ex2,y2:d+ey2,stroke:selIds.has(e.id)?'#ff9f0a':'#ff9f0a','stroke-width':selIds.has(e.id)?2.6:1.6,'stroke-dasharray':'16 4 3 4',opacity:.95});
      }else
      skEl('line',{x1:a,y1:b,x2:c,y2:d,stroke:col(e),'stroke-width':wdt(e),...(e.construction?{'stroke-dasharray':'7 5',opacity:.45}:{})});
      const hv=(sk.constraints||[]).filter(k=>(k.type==='h'||k.type==='v')&&k.line===e.id).map(k=>k.type.toUpperCase()).join('');
      const eq=(sk.constraints||[]).some(k=>k.type==='equal'&&(k.a===e.id||k.b===e.id));
      const tgL=(sk.constraints||[]).filter(k=>k.type==='tangent'&&k.line===e.id);
      const nmB=[];
      (sk.constraints||[]).forEach(k=>{
        if((k.type==='h'||k.type==='v')&&k.line===e.id)nmB.push(k.type);
        else if((k.type==='parallel'||k.type==='perpendicular'||k.type==='collinear')&&(k.a===e.id||k.b===e.id))nmB.push(k.type);
        else if(k.type==='symmetric'&&(k.a===e.id||k.b===e.id||k.mid===e.id))nmB.push('symmetric');
        else if(k.type==='midpoint'&&(k.line===e.id||k.a===e.id||k.b===e.id))nmB.push('midpoint');
        else if(k.type==='fix'&&k.ent===e.id)nmB.push('fix');
      });
      if(eq)nmB.push('equal');
      if(nmB.length){const[mx,my]=w2s((A.x+B.x)/2,(A.y+B.y)/2);
        badges(Array.from(new Set(nmB)),mx+8,my-10);}
      // sigle T par tangence sur la ligne, au point de contact (l'autre sigle est sur le cercle/arc)
      if(tgL.length){const ddx=B.x-A.x,ddy=B.y-A.y,l2=ddx*ddx+ddy*ddy;
        tgL.forEach(k=>{const E=entById(sk,k.ent),Cc=E?P[E.pc]:null;if(!Cc||l2<1e-12)return;
          let t2=((Cc.x-A.x)*ddx+(Cc.y-A.y)*ddy)/l2;t2=Math.max(0,Math.min(1,t2));
          drawT({x:A.x+t2*ddx,y:A.y+t2*ddy});});}
    }
    if(e.t==='circle'){const C=P[e.pc];if(!C)return;const[a,b]=w2s(C.x,C.y);
      skEl('circle',{cx:a,cy:b,r:Math.abs(e.r)*skView.s,fill:e.construction?'none':'rgba(100,210,255,.07)',stroke:col(e),'stroke-width':wdt(e),...(e.construction?{'stroke-dasharray':'7 5',opacity:.45}:{})});
      const[px,py]=w2s(C.x,C.y);skEl('rect',{x:px-3,y:py-3,width:6,height:6,fill:fix.has(e.pc)?'#e8e8ea':'none',stroke:col(e)});
      tangT(e,C).forEach(drawT); // T au point de contact (un par tangence), pas au centre
      const cB=[];(sk.constraints||[]).forEach(k=>{if(k.type==='coaxial'&&(k.a===e.id||k.b===e.id))cB.push('coaxial');else if(k.type==='equal'&&(k.a===e.id||k.b===e.id))cB.push('equal');else if(k.type==='fix'&&k.ent===e.id)cB.push('fix');});
      if(cB.length)badges(Array.from(new Set(cB)),px+8,py-10);
    }
    if(e.t==='arc'){const C=P[e.pc];if(!C)return;const an=arcAngles(sk,e);if(!an)return;
      const p1={x:C.x+e.r*Math.cos(an.a1),y:C.y+e.r*Math.sin(an.a1)},p2={x:C.x+e.r*Math.cos(an.a2),y:C.y+e.r*Math.sin(an.a2)};
      const[a,b]=w2s(p1.x,p1.y),[c,d]=w2s(p2.x,p2.y);
      const dd=an.a2-an.a1;
      skEl('path',{d:`M ${a} ${b} A ${e.r*skView.s} ${e.r*skView.s} 0 ${dd>Math.PI?1:0} 0 ${c} ${d}`,fill:'none',stroke:col(e),'stroke-width':wdt(e),...(e.construction?{'stroke-dasharray':'7 5',opacity:.45}:{})});
      const[px,py]=w2s(C.x,C.y);skEl('rect',{x:px-3,y:py-3,width:6,height:6,fill:'none',stroke:col(e)});
      tangT(e,C).forEach(drawT); // T au point de contact (un par tangence)
      const aB=[];(sk.constraints||[]).forEach(k=>{if(k.type==='coaxial'&&(k.a===e.id||k.b===e.id))aB.push('coaxial');else if(k.type==='equal'&&(k.a===e.id||k.b===e.id))aB.push('equal');else if(k.type==='fix'&&k.ent===e.id)aB.push('fix');});
      if(aB.length)badges(Array.from(new Set(aB)),px+8,py-10);
    }
    if(e.t==='cpoint'){const Q=P[e.p];if(!Q)return;const[a,b]=w2s(Q.x,Q.y);
      if(e.hole){ // centre de perçage : cercle + croix orange (distinct du point de construction)
        const ch=selIds.has(e.id)?'#ff9f0a':'#ffb340';
        skEl('circle',{cx:a,cy:b,r:7,fill:'none',stroke:ch,'stroke-width':selIds.has(e.id)?2.6:1.8});
        skEl('path',{d:`M ${a-11} ${b} H ${a+11} M ${a} ${b-11} V ${b+11}`,stroke:ch,'stroke-width':1.2});
      }else skEl('path',{d:`M ${a-6} ${b} H ${a+6} M ${a} ${b-6} V ${b+6}`,stroke:col(e),'stroke-width':wdt(e)});}
  });
  // extrémités : carrés (plein = fixe) + pastille coïncident + flèche DOF · origine = pastille ronde permanente
  const hEnds=new Set();(sk.entities||[]).forEach(e=>{if(e.t==='line'&&e.handle)hEnds.add(e.p2);});
  Object.keys(skPts(sk)).forEach(pid=>{
    const p=sk.points[pid];if(!p)return;const[a,b]=w2s(p.x,p.y);
    const isSel=(skSel&&skSel.kind==='point'&&skSel.pid===pid)||skSelX.some(s=>s.kind==='point'&&s.pid===pid);
    const isMark=(skCoinA===pid)||(skPendPt===pid);
    if(pid===SK_ORIGIN){
      let used=0;(sk.entities||[]).forEach(e=>{if(e.p1===pid||e.p2===pid||e.p===pid||e.pc===pid||e.pa===pid||e.pb===pid)used++;});
      const ring=used>=2?'#30d158':(isSel?'#ff9f0a':'#8e8e93');
      skEl('circle',{cx:a,cy:b,r:5,fill:isSel?'#ff9f0a':'#e8e8ea',stroke:isSel?'#ff9f0a':'#8e8e93','stroke-width':1.5});
      skEl('circle',{cx:a,cy:b,r:9,fill:'none',stroke:ring,'stroke-width':1.4,opacity:0.95});
      if(isMark)skEl('circle',{cx:a,cy:b,r:13,fill:'none',stroke:'#ff9f0a','stroke-width':2,opacity:0.9});
      return;
    }
    if(hEnds.has(pid)){ // bout de poignée de spline : petit losange
      skEl('path',{d:`M ${a} ${b-5} L ${a+5} ${b} L ${a} ${b+5} L ${a-5} ${b} Z`,fill:fix.has(pid)?'#e8e8ea':(isSel?'#ff9f0a':'#101012'),stroke:isSel?'#ff9f0a':'#bf5af2','stroke-width':1.5});
      return;
    }
    skEl('rect',{x:a-4,y:b-4,width:8,height:8,fill:fix.has(pid)?'#e8e8ea':(isSel||isMark?'#ff9f0a':'#101012'),stroke:isSel?'#ff9f0a':(DA.ptFull(pid)?'#e8e8ea':'#64d2ff'),'stroke-width':1.5});
    let used=0;(sk.entities||[]).forEach(e=>{if(e.handle)return;if(e.p1===pid||e.p2===pid||e.p===pid||e.pc===pid||e.pa===pid||e.pb===pid||(e.pts&&e.pts.indexOf(pid)>=0))used++;});
    if(used>=2)skEl('circle',{cx:a,cy:b,r:6,fill:'none',stroke:'#30d158','stroke-width':1.2,opacity:0.9}); // coïncident
    if(showDof&&!fix.has(pid))skEl('path',{d:`M ${a+7} ${b-7} h 7 m -3.5 -3.5 l 3.5 3.5 l -3.5 3.5`,fill:'none',stroke:'#30d158','stroke-width':1.4,opacity:0.85}); // DOF
  });
  // santé : bouts ouverts (rouge + écart), auto-intersections (losanges orange)
  const HL=sk._health;
  if(HL){
    (HL.opens||[]).forEach(o=>{const[a,b]=w2s(o.x,o.y);
      skEl('circle',{cx:a,cy:b,r:7,fill:'none',stroke:'#ff453a','stroke-width':2.5});});
    if(HL.gapPair&&HL.gapD<25){const[a,b]=w2s(HL.gapPair[0].x,HL.gapPair[0].y),[c,e2]=w2s(HL.gapPair[1].x,HL.gapPair[1].y);
      skEl('line',{x1:a,y1:b,x2:c,y2:e2,stroke:'#ff453a','stroke-width':1.5,'stroke-dasharray':'4 3'});
      const t=skEl('text',{x:(a+c)/2,y:(b+e2)/2-8,fill:'#ff453a','font-size':12,'font-weight':'bold'});t.textContent='⚠ '+HL.gapD.toFixed(1);}
    (HL.selfints||[]).forEach(o=>{const[a,b]=w2s(o.x,o.y);
      skEl('path',{d:`M ${a} ${b-7} L ${a+7} ${b} L ${a} ${b+7} L ${a-7} ${b} Z`,fill:'none',stroke:'#ff9f0a','stroke-width':2});});
  }
  // marqueur de snap
  if(skSnapMk){const[a,b]=w2s(skSnapMk.x,skSnapMk.y);skEl('circle',{cx:a,cy:b,r:7,fill:'none',stroke:'#ffd60a','stroke-width':2});}
  // boîte de sélection rectangle
  if(skBox){
    const[a,b]=w2s(Math.min(skBox.x0,skBox.x1),Math.max(skBox.y0,skBox.y1));
    skEl('rect',{x:a,y:b,width:Math.abs(skBox.x1-skBox.x0)*skView.s,height:Math.abs(skBox.y1-skBox.y0)*skView.s,fill:'rgba(10,132,255,.08)',stroke:'#0a84ff','stroke-width':1,'stroke-dasharray':'4 3'});
  }
  // cotes
  drawSkDims(sk);
  // ⧉ hover : arête projetable sous le curseur (même hors plan) en orange — Fusion-like
  if(skTool==='project'&&skProjectHover){
    const pr=skProjectHover;
    if(pr.type==='circle'){
      const[a,b]=w2s(pr.cx,pr.cy);
      skEl('circle',{cx:a,cy:b,r:pr.r*skView.s,fill:'none',stroke:'#ff9f0a','stroke-width':3,opacity:0.95});
      skEl('circle',{cx:a,cy:b,r:4,fill:'#ff9f0a'});
    }else if(pr.type==='arc'){
      const a1=Math.atan2(pr.y1-pr.cy,pr.x1-pr.cx),a2=Math.atan2(pr.y2-pr.cy,pr.x2-pr.cx);
      let dd=a2-a1; while(dd<=0)dd+=Math.PI*2; while(dd>Math.PI*2)dd-=Math.PI*2;
      const[a,b]=w2s(pr.x1,pr.y1),[c,d]=w2s(pr.x2,pr.y2);
      skEl('path',{d:`M ${a} ${b} A ${pr.r*skView.s} ${pr.r*skView.s} 0 ${dd>Math.PI?1:0} 0 ${c} ${d}`,fill:'none',stroke:'#ff9f0a','stroke-width':3,opacity:0.95});
      const[ac,bc]=w2s(pr.cx,pr.cy); skEl('rect',{x:ac-3,y:bc-3,width:6,height:6,fill:'none',stroke:'#ff9f0a'});
    }else if(pr.type==='line'){
      const[a,b]=w2s(pr.x1,pr.y1),[c,d]=w2s(pr.x2,pr.y2);
      skEl('line',{x1:a,y1:b,x2:c,y2:d,stroke:'#ff9f0a','stroke-width':3,opacity:0.95});
      skEl('circle',{cx:a,cy:b,r:4,fill:'#ff9f0a'}); skEl('circle',{cx:c,cy:d,r:4,fill:'#ff9f0a'});
    }
  }
  // ⨯ Intersection : courbes de section candidates / retenues / survolées
  if(skTool==='isect'&&typeof skIsectDraw==='function'){try{skIsectDraw(sk);}catch(e){}}
  // brouillon + cote live (longueur/angle comme Fusion)
  if(skDraft){
    const d=skDraft;
    if(d.t==='spline'&&d.ctrl){ // points de contrôle : polygone vivant (clics + curseur)
      const Q=(d.pts||[]).map(q=>[q.x,q.y]);if(d.cur)Q.push([d.cur.x,d.cur.y]);else if(d.closeHint&&Q.length)Q.push(Q[0]);
      if(Q.length>1)skEl('path',{d:'M '+Q.map(q=>{const s=w2s(q[0],q[1]);return s[0].toFixed(1)+' '+s[1].toFixed(1);}).join(' L '),fill:'none',stroke:'#bf5af2','stroke-width':1.1,'stroke-dasharray':'3 3'});
    }
    if(d.t==='spline'){ // tracé de spline : courbe vivante + points déjà cliqués
      if(d.poly&&d.poly.length>1)skEl('path',{d:'M '+d.poly.map(q=>{const s=w2s(q[0],q[1]);return s[0].toFixed(1)+' '+s[1].toFixed(1);}).join(' L '),fill:'none',stroke:'#fff','stroke-width':2,'stroke-dasharray':'5 3'});
      (d.pts||[]).forEach((q,i)=>{const[a,b]=w2s(q.x,q.y);skEl('rect',{x:a-4,y:b-4,width:8,height:8,fill:i===0&&d.closeHint?'#ffd60a':'#101012',stroke:'#ffd60a','stroke-width':1.5});});
    }
    if(d.t==='line'){const[a,b]=w2s(d.x1,d.y1),[c2,d2]=w2s(d.x2,d.y2);
      skEl('line',{x1:a,y1:b,x2:c2,y2:d2,stroke:'#fff','stroke-width':2,'stroke-dasharray':'5 3'});
      const L=Math.hypot(d.x2-d.x1,d.y2-d.y1);
      if(L>1e-6){
        const ang=(Math.atan2(d.y2-d.y1,d.x2-d.x1)*180/Math.PI+360)%360;
        const[mx,my]=w2s((d.x1+d.x2)/2,(d.y1+d.y2)/2);
        const t=skEl('text',{x:mx,y:my-14,fill:'#ffd60a','font-size':13,'font-weight':'bold','text-anchor':'middle'});
        t.textContent=L.toFixed(2)+' mm ∠ '+ang.toFixed(1)+'°';
        if(skInfer&&skInfer.perp){const g=skEl('text',{x:mx+18,y:my+4,fill:'#ffd60a','font-size':15,'font-weight':'bold'});g.textContent='⟂';}
        if(skInfer&&skInfer.tan){const g=skEl('text',{x:mx+18,y:my+4,fill:'#ffd60a','font-size':15,'font-weight':'bold'});g.textContent='⦾';}
        if(skInfer&&skInfer.par){const g=skEl('text',{x:mx+18,y:my+4,fill:'#bf5af2','font-size':15,'font-weight':'bold'});g.textContent='∥';}
        if(skInfer&&skInfer.ext){const g=skEl('text',{x:mx+18,y:my+4,fill:'#bf5af2','font-size':13,'font-weight':'bold'});g.textContent='⟶ sur la droite';}
      }}
    if(d.t==='slot'){
      const x0=Math.min(d.x1,d.x2),x1=Math.max(d.x1,d.x2),y0=Math.min(d.y1,d.y2),y1=Math.max(d.y1,d.y2),w=x1-x0,h=y1-y0;
      if(w>0.5&&h>0.5){
        if(w>h){const r=h/2,ym=(y0+y1)/2;const[a1,b1]=w2s(x0+r, y1),[c1,d1]=w2s(x1-r, y1),[a2,b2]=w2s(x0+r, y0),[c2,d2]=w2s(x1-r, y0);
          skEl('line',{x1:a1,y1:b1,x2:c1,y2:d1,stroke:'#fff','stroke-width':2,'stroke-dasharray':'5 3'});
          skEl('line',{x1:a2,y1:b2,x2:c2,y2:d2,stroke:'#fff','stroke-width':2,'stroke-dasharray':'5 3'});
          const[ac1,bc1]=w2s(x0+r, ym),[ac2,bc2]=w2s(x1-r, ym);
          skEl('path',{d:`M ${a1} ${b1} A ${r*skView.s} ${r*skView.s} 0 0 0 ${a2} ${b2}`,fill:'none',stroke:'#fff','stroke-width':2,'stroke-dasharray':'5 3'});
          skEl('path',{d:`M ${c1} ${d1} A ${r*skView.s} ${r*skView.s} 0 0 1 ${c2} ${d2}`,fill:'none',stroke:'#fff','stroke-width':2,'stroke-dasharray':'5 3'});
        } else {const r=w/2,xm=(x0+x1)/2;const[a1,b1]=w2s(x0, y0+r),[a2,b2]=w2s(x0, y1-r),[c1,d1]=w2s(x1, y0+r),[c2,d2]=w2s(x1, y1-r);
          skEl('line',{x1:a1,y1:b1,x2:a2,y2:b2,stroke:'#fff','stroke-width':2,'stroke-dasharray':'5 3'});
          skEl('line',{x1:c1,y1:d1,x2:c2,y2:d2,stroke:'#fff','stroke-width':2,'stroke-dasharray':'5 3'});
          const[ac1,bc1]=w2s(xm, y0+r),[ac2,bc2]=w2s(xm, y1-r);
          skEl('path',{d:`M ${a1} ${b1} A ${r*skView.s} ${r*skView.s} 0 0 0 ${c1} ${d1}`,fill:'none',stroke:'#fff','stroke-width':2,'stroke-dasharray':'5 3'});
          skEl('path',{d:`M ${a2} ${b2} A ${r*skView.s} ${r*skView.s} 0 0 1 ${c2} ${d2}`,fill:'none',stroke:'#fff','stroke-width':2,'stroke-dasharray':'5 3'});
        }
      }
    } else if(d.t==='rect'){const[a,b]=w2s(Math.min(d.x1,d.x2),Math.max(d.y1,d.y2));
      skEl('rect',{x:a,y:b,width:Math.abs(d.x2-d.x1)*skView.s,height:Math.abs(d.y2-d.y1)*skView.s,fill:'rgba(255,255,255,.06)',stroke:'#fff','stroke-dasharray':'5 3'});
      const t=skEl('text',{x:a+Math.abs(d.x2-d.x1)*skView.s/2,y:b+Math.abs(d.y2-d.y1)*skView.s/2,fill:'#ffd60a','font-size':13,'font-weight':'bold','text-anchor':'middle'});
      t.textContent=Math.abs(d.x2-d.x1).toFixed(1)+' × '+Math.abs(d.y2-d.y1).toFixed(1);}
    if(d.t==='circle'){const[a,b]=w2s(d.cx,d.cy);skEl('circle',{cx:a,cy:b,r:d.r*skView.s,fill:'none',stroke:'#fff','stroke-dasharray':'5 3'});
      const t=skEl('text',{x:a,y:b-d.r*skView.s-8,fill:'#ffd60a','font-size':13,'font-weight':'bold','text-anchor':'middle'});
      t.textContent='⌀'+(d.r*2).toFixed(2);}
    if(d.t==='arc'){const C=sk.points[d.pc];if(C){const p1={x:C.x+d.r*Math.cos(d.a1),y:C.y+d.r*Math.sin(d.a1)},p2={x:C.x+d.r*Math.cos(d.a2),y:C.y+d.r*Math.sin(d.a2)};
      const[a,b]=w2s(p1.x,p1.y),[c2,d2]=w2s(p2.x,p2.y);
      let dd=(d.a2-d.a1)%(Math.PI*2);if(dd<0)dd+=Math.PI*2;
      skEl('path',{d:`M ${a} ${b} A ${d.r*skView.s} ${d.r*skView.s} 0 ${dd>Math.PI?1:0} 0 ${c2} ${d2}`,fill:'none',stroke:'#fff','stroke-dasharray':'5 3'});}}
  }
  // saisie dynamique (tapez une longueur/angle puis Entrée)
  if(skDyn&&skDown){
    const anchor=(skDraft&&skDraft.t==='line')?{x:(skDraft.x1+skDraft.x2)/2,y:(skDraft.y1+skDraft.y2)/2}:{x:skDown.x,y:skDown.y};
    const[sx,sy]=w2s(anchor.x,anchor.y);
    const label=(skDyn.mode==='len'?'L = ':'∠ = ')+(skDyn.buf||'')+(skDyn.mode==='len'?' mm':'°');
    const wpx=Math.max(70,label.length*8+18);
    skEl('rect',{x:sx-wpx/2,y:sy-44,width:wpx,height:24,rx:5,fill:'#1e1e1e',stroke:'#0a84ff','stroke-width':1.5});
    const t=skEl('text',{x:sx,y:sy-27,fill:'#fff','font-size':14,'font-weight':'bold','text-anchor':'middle'});
    t.textContent=label;
    const h=skEl('text',{x:sx,y:sy-50,fill:'#8a8f99','font-size':11,'text-anchor':'middle'});
    h.textContent='Tab angle/longueur · Entrée OK · Échap annule';
  }
  if(skRoot)skOrbUpright(skRoot); // orbite : textes et étiquettes restent lisibles
}
function dimById(sk,id){return (sk.dims||[]).find(d=>d.id===id);}
function angleArcInfo(sk,d){ // {V,rr,a1,dd} — secteur STOCKE (a1=rayon A, dd=±value), arc et texte toujours cohérents
  const fr=angleFrame(sk,d);if(!fr)return null;
  const rr=(d.w!=null&&isFinite(d.w))?Math.abs(d.w):14/skView.s;
  let ccw=d.ccw;
  if(ccw!==0&&ccw!==1)ccw=(fr.delta>=0)?1:0; // migration : signe courant (sans muter au rendu)
  const dd=(ccw?1:-1)*Math.max(0.02,Math.min(Math.PI-0.02,d.value||0));
  return{V:fr.V,rr,a1:fr.sA,dd};
}
// 2026-10-16-006 : cotes de RAYON / DIAMÈTRE façon mise en plan — ligne d'attache RADIALE
// (bissectrice de l'arc par défaut → toujours côté EXTÉRIEUR d'un congé), flèche sur
// l'arc, coude puis trait horizontal SOUS le texte, vers la droite ou la gauche selon le côté.
// Glisser l'étiquette fait tourner la ligne autour du centre ; jamais à l'intérieur du cercle.
function rdLayout(sk,d){
  const e=entById(sk,d.ent);if(!e||!(e.r>0))return null;const C=(sk.points||{})[e.pc];if(!C)return null;
  const s=skView.s||1;
  let u=rdDir(sk,e);
  // V0.11.13 : décalage posé (ox/oy) compté depuis le point du cercle — le coude ne bouge plus
  // au zoom ; sans décalage, coude à 26 px du cercle sur la direction par défaut.
  const gap=(d.ox||d.oy)?0:26/s;
  let K={x:C.x+u.x*(e.r+gap)+(d.ox||0),y:C.y+u.y*(e.r+gap)+(d.oy||0)};
  let vx=K.x-C.x,vy=K.y-C.y,vl=Math.hypot(vx,vy);
  if(vl<1e-9){vx=u.x;vy=u.y;vl=1;}
  u={x:vx/vl,y:vy/vl};
  const minR=e.r+10/s;
  if(vl<minR)K={x:C.x+u.x*minR,y:C.y+u.y*minR};
  return{e,C,u,K,P:{x:C.x+u.x*e.r,y:C.y+u.y*e.r},P2:{x:C.x-u.x*e.r,y:C.y-u.y*e.r},side:u.x>=0?1:-1};
}
function rdDir(sk,e){ // direction par défaut : bissectrice de l'arc, 45° pour un cercle
  if(e.t==='arc'){const an=arcAngles(sk,e);const am=an?(an.a1+an.a2)/2:Math.PI/4;return{x:Math.cos(am),y:Math.sin(am)};}
  return{x:Math.SQRT1_2,y:Math.SQRT1_2};
}
function rdPlaceAt(sk,d,wx,wy){ // pose R/Ø : le coude suit le curseur (V0.11.13 — il partait à côté sur un arc)
  const e=entById(sk,d.ent);if(!e||!(e.r>0))return;const C=(sk.points||{})[e.pc];if(!C)return;
  const u=rdDir(sk,e);
  d.ox=wx-(C.x+u.x*e.r);d.oy=wy-(C.y+u.y*e.r);
  if(!d.ox&&!d.oy)d.ox=1e-6; // curseur pile sur le cercle : décalage posé quand même
}
function rdText(d){
  const t=(d.type==='diameter'?'Ø':'R')+(+d.value).toFixed(2);
  return parDecor(d.id,d.ref?'('+t+')':t);
}
function rdTextW(str){return String(str).length*7.6+2;}
function rdDraw(sk,d,st){
  const L=rdLayout(sk,d);if(!L)return;
  const str=rdText(d),tw=rdTextW(str);
  const[px,py]=w2s(L.P.x,L.P.y),[kx,ky]=w2s(L.K.x,L.K.y);
  const ux=L.u.x,uy=-L.u.y; // repère écran (y vers le bas)
  if(d.type==='diameter'){
    const[qx,qy]=w2s(L.P2.x,L.P2.y);
    skEl('line',{x1:qx,y1:qy,x2:kx,y2:ky,stroke:st,'stroke-width':1.2,'pointer-events':'none'});
    dimArrow(px,py,ux,uy,st);dimArrow(qx,qy,-ux,-uy,st); // flèches sur le cercle, de l'intérieur
  }else{
    skEl('line',{x1:px,y1:py,x2:kx,y2:ky,stroke:st,'stroke-width':1.2,'pointer-events':'none'});
    dimArrow(px,py,-ux,-uy,st); // flèche posée sur l'arc depuis l'extérieur
  }
  const ex=kx+L.side*(tw+10);
  skEl('line',{x1:kx,y1:ky,x2:ex,y2:ky,stroke:st,'stroke-width':1.2,'pointer-events':'none'}); // trait SOUS le texte
  const t=skEl('text',{x:(kx+L.side*5).toFixed(1),y:(ky-4).toFixed(1),fill:st,'font-size':13,'font-weight':'bold',stroke:'#101012','stroke-width':3,'paint-order':'stroke','text-anchor':L.side>0?'start':'end',style:'cursor:move;pointer-events:all'});
  t.textContent=str;t.dataset.dim=d.id;
  t.addEventListener('dblclick',ev=>{ev.stopPropagation();editDim(d.id);});
}
function dimTextAt(S,d){ // V0.11.23 : texte d'une cote linéaire SUR sa ligne de cote, glissé de d.sl le long d'elle
  // (l'entraxe glisse sa ligne entière par d.sl : texte au milieu). Avant : dimLabelPos ajoutait
  // ox/oy mais dimTextOnLine dessinait au milieu — le texte glissé ne bougeait pas, sa zone de clic si.
  const mx=(S.a.x+S.b.x)/2,my=(S.a.y+S.b.y)/2;
  const s=(d&&d.type!=='gap'&&isFinite(d.sl))?d.sl:0;if(!s)return{x:mx,y:my};
  const dx=S.b.x-S.a.x,dy=S.b.y-S.a.y,L=Math.hypot(dx,dy)||1e-9;
  return{x:mx+dx/L*s,y:my+dy/L*s};
}
function skDimTextTo(sk,d,tx,ty){ // V0.11.23 : amène le texte d'une cote linéaire en (tx,ty) monde : écart d.w (⊥) + glissement d.sl (∥)
  let S=dimSeg(sk,d);if(!S)return false;
  if(d.type==='gap'){const s0=d.sl||0,bx=(S.a.x+S.b.x)/2-S.ux*s0,by=(S.a.y+S.b.y)/2-S.uy*s0;d.sl=(tx-bx)*S.ux+(ty-by)*S.uy;return true;}
  const M={x:(S.A.x+S.B.x)/2,y:(S.A.y+S.B.y)/2};
  d.w=(tx-M.x)*S.nx+(ty-M.y)*S.ny; // ligne de cote sous le texte
  S=dimSeg(sk,d);if(!S)return true;
  const dx=S.b.x-S.a.x,dy=S.b.y-S.a.y,L=Math.hypot(dx,dy);
  if(L<1e-9){d.sl=0;return true;}
  const mx=(S.a.x+S.b.x)/2,my=(S.a.y+S.b.y)/2;
  d.sl=((tx-mx)*dx+(ty-my)*dy)/L; // texte glissé le long de la ligne
  if(Math.abs(d.sl)<0.5/(skView.s||1))d.sl=0;
  return true;
}
function dimLabelPos(sk,d){ // position monde de l'étiquette, décalage utilisateur inclus (déplaçable)
  const P=sk.points,ox=d.ox||0,oy=d.oy||0;
  if(d.type==='length'||d.type==='distance'||d.type==='gap'||d.type==='distline'){const S=dimSeg(sk,d);if(!S)return null;
    return dimTextAt(S,d);}
  if(d.type==='diameter'||d.type==='radius'){const L=rdLayout(sk,d);if(!L)return null;const s=skView.s||1,tw=rdTextW(rdText(d));
    return{x:L.K.x+L.side*(5+tw/2)/s,y:L.K.y+8/s};} // centre du texte, posé sur le trait d'épaulement
  if(d.type==='angle'){const I=angleArcInfo(sk,d);if(!I)return null; // au milieu de l'arc, comme Fusion
    const am=I.a1+I.dd/2;return{x:I.V.x+I.rr*Math.cos(am)+ox,y:I.V.y+I.rr*Math.sin(am)+oy};}
  return null;
}
function dimSeg(sk,d){ // segment monde de la ligne de cote (offset perpendiculaire d.w / glissement d.sl / d.orient h|v|a)
  const P=sk.points;
  if(d.type==='length'){const l=entById(sk,d.line);if(!l)return null;const A=P[l.p1],B=P[l.p2];if(!A||!B)return null;
    const w=(d.w!=null&&isFinite(d.w))?d.w:5;
    const L=Math.hypot(B.x-A.x,B.y-A.y)||1e-9,nx=-(B.y-A.y)/L,ny=(B.x-A.x)/L;
    if(d.orient==='h'){const cy=(A.y+B.y)/2+w;return{a:{x:A.x,y:cy},b:{x:B.x,y:cy},A,B,nx:0,ny:1,w,hv:'h',cy};}
    if(d.orient==='v'){const cx=(A.x+B.x)/2+w;return{a:{x:cx,y:A.y},b:{x:cx,y:B.y},A,B,nx:1,ny:0,w,hv:'v',cx};}
    return{a:{x:A.x+nx*w,y:A.y+ny*w},b:{x:B.x+nx*w,y:B.y+ny*w},A,B,nx,ny,w};}
  if(d.type==='distance'){const A=P[d.a],B=P[d.b];if(!A||!B)return null;
    const w=(d.w!=null&&isFinite(d.w))?d.w:0;
    const L=Math.hypot(B.x-A.x,B.y-A.y)||1e-9,nx=-(B.y-A.y)/L,ny=(B.x-A.x)/L;
    if(d.orient==='h'){const cy=(A.y+B.y)/2+w;return{a:{x:A.x,y:cy},b:{x:B.x,y:cy},A,B,nx:0,ny:1,w,hv:'h',cy};}
    if(d.orient==='v'){const cx=(A.x+B.x)/2+w;return{a:{x:cx,y:A.y},b:{x:cx,y:B.y},A,B,nx:1,ny:0,w,hv:'v',cx};}
    return{a:{x:A.x+nx*w,y:A.y+ny*w},b:{x:B.x+nx*w,y:B.y+ny*w},A,B,nx,ny,w};}
  if(d.type==='gap'){const A=entById(sk,d.a),B=entById(sk,d.b);if(!A||!B)return null;
    const A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2];if(!A1||!A2||!B1||!B2)return null;
    const s=d.sl||0,dx=A2.x-A1.x,dy=A2.y-A1.y,L=Math.hypot(dx,dy)||1e-9,ux=dx/L,uy=dy/L;
    const nx=-uy,ny=ux;
    const Amx=(A1.x+A2.x)/2,Amy=(A1.y+A2.y)/2,Bmx=(B1.x+B2.x)/2,Bmy=(B1.y+B2.y)/2;
    const gap=(Bmx-Amx)*nx+(Bmy-Amy)*ny;
    return{a:{x:Amx+ux*s,y:Amy+uy*s},b:{x:Amx+ux*s+nx*gap,y:Amy+uy*s+ny*gap},ux,uy,nx,ny,gap,s};}
  if(d.type==='distline'){ // centre → pied de perpendiculaire sur la ligne (infinie, comme Fusion) + offset d.w
    const l=entById(sk,d.line),Pt=P[d.p];
    if(!l||l.t!=='line'||!Pt)return null;
    const A=P[l.p1],B=P[l.p2];if(!A||!B)return null;
    const dx=B.x-A.x,dy=B.y-A.y,L2=dx*dx+dy*dy||1e-9;
    const t=((Pt.x-A.x)*dx+(Pt.y-A.y)*dy)/L2;
    const F={x:A.x+dx*t,y:A.y+dy*t};
    const sx=F.x-Pt.x,sy=F.y-Pt.y,L=Math.hypot(sx,sy)||1e-9;
    let nx,ny;
    if(L>1e-9){nx=-sy/L;ny=sx/L;} // ⊥ au segment P→F (glissement le long de L)
    else{const Ln=Math.hypot(dx,dy)||1e-9;nx=dx/Ln;ny=dy/Ln;} // P sur la ligne : le long de L
    const w=(d.w!=null&&isFinite(d.w))?d.w:0;
    return{a:{x:Pt.x+nx*w,y:Pt.y+ny*w},b:{x:F.x+nx*w,y:F.y+ny*w},A:Pt,B:F,nx,ny,w};
  }
  return null;
}
function dimMeasureOf(A,B,o){ // mesure courante selon l'orientation de la cote (a=alignée, h, v)
  return o==='h'?Math.abs(B.x-A.x):o==='v'?Math.abs(B.y-A.y):Math.hypot(B.x-A.x,B.y-A.y);
}
function dimCurValue(sk,d){ // valeur courante (monde) d'une cote length/distance selon son orientation
  if(d.type==='length'){const l=entById(sk,d.line);if(!l)return null;const A=sk.points[l.p1],B=sk.points[l.p2];
    if(!A||!B)return null;return dimMeasureOf(A,B,d.orient);}
  if(d.type==='distance'){const A=sk.points[d.a],B=sk.points[d.b];if(!A||!B)return null;return dimMeasureOf(A,B,d.orient);}
  return null;
}
function skDimOrientAt(sk,dd,wx,wy){ // pose linéaire : H/V/aligné selon la position du curseur (direction de décalage la plus proche)
  const S=dimSeg(sk,dd);if(!S)return null;
  const A=S.A,B=S.B,M={x:(A.x+B.x)/2,y:(A.y+B.y)/2};
  const dx=B.x-A.x,dy=B.y-A.y;
  const rdx=wx-M.x,rdy=wy-M.y;
  let o=dd.orient||'a';
  if(Math.hypot(rdx,rdy)>1e-6){
    const beta=Math.atan2(dy,dx),phi=Math.atan2(rdy,rdx);
    // écart angulaire modulo 180°, replié sur [0,90] : 179,99° vaut 0,01° (V0.11.13 — curseur pile à
    // gauche ou sous la cote : la verticale / l'horizontale perdait face à l'alignée)
    const w180=a=>{a=(a*180/Math.PI)%180;if(a<0)a+=180;return Math.min(a,180-a);};
    const dH=w180(phi-Math.PI/2),dV=w180(phi),dA=w180(phi-(beta+Math.PI/2));
    const cands=[{o:'h',d:dH,ok:Math.abs(dx)>1e-6},{o:'v',d:dV,ok:Math.abs(dy)>1e-6},{o:'a',d:dA,ok:true}];
    cands.sort((x,y)=>x.d-y.d);
    o=(cands.find(c=>c.ok)||cands[2]).o; // jamais de cote « 0 » sur une ligne purement V/H
  }
  dd.orient=o;
  const L=Math.hypot(dx,dy)||1e-9;
  if(o==='h'){dd.w=wy-M.y;dd.value=+Math.abs(dx).toFixed(2);}
  else if(o==='v'){dd.w=wx-M.x;dd.value=+Math.abs(dy).toFixed(2);}
  else{const nx=-dy/L,ny=dx/L;dd.w=rdx*nx+rdy*ny;dd.value=+Math.hypot(dx,dy).toFixed(2);}
  return o;
}
function skDimAngleAt(sk,dd,wx,wy){ // pose d'angle : naturel / complémentaire / complémentaire permuté selon le secteur du curseur
  const V=angleVertex(sk,dd);if(!V)return;
  dd.w=Math.max(1,Math.hypot(wx-V.x,wy-V.y));
  if(dd.oa===undefined||dd.oa===null){dd.oa=dd.a;dd.ob=dd.b;}
  const TAU=Math.PI*2,fr=angleFrame(sk,{a:dd.oa,b:dd.ob});if(!fr)return;
  const v=Math.abs(fr.delta),mu=Math.atan2(wy-V.y,wx-V.x);
  const inS=(start,sweep)=>{let r=(mu-start)%TAU;if(r<0)r+=TAU;return sweep>=0?r<=sweep+1e-9:r>=TAU+sweep-1e-9;};
  const comp=Math.PI-Math.max(0.02,Math.min(Math.PI-0.02,v)),sB=fr.sB;
  if(inS(fr.sA,fr.delta)){dd.a=dd.oa;dd.b=dd.ob;delete dd.comp;dd.ccw=fr.delta>0?1:0;dd.value=v;}
  else if(inS(fr.sA,fr.delta>0?-comp:comp)){dd.a=dd.oa;dd.b=dd.ob;dd.comp=1;dd.ccw=fr.delta>0?0:1;dd.value=comp;}
  else if(inS(sB,fr.delta>0?comp:-comp)){dd.a=dd.ob;dd.b=dd.oa;dd.comp=1;dd.ccw=fr.delta>0?1:0;dd.value=comp;}
}
function angleWant(d,delta){ // consigne signée d'une cote d'angle (naturelle, ou complémentaire π−v via d.comp)
  const v=Math.max(0.02,Math.min(Math.PI-0.02,d.value||0));
  if(d.comp)return (delta>=0?1:-1)*(Math.PI-v);
  const ccw=(d.ccw===0||d.ccw===1)?d.ccw:((delta>=0)?1:0);
  return (ccw?1:-1)*v;
}
function hitDimLine(sk,px,py){ // px,py pixels écran SVG → id de cote si le clic est sur la ligne de cote
  for(const d of (sk.dims||[])){
    if(d.type==='length'||d.type==='distance'||d.type==='gap'||d.type==='distline'){
      const S=dimSeg(sk,d);if(!S)continue;
      const[a,b]=w2s(S.a.x,S.a.y),[c,e2]=w2s(S.b.x,S.b.y);
      if(distSeg(px,py,{x:a,y:b},{x:c,y:e2})<7)return d.id;
    }
    if(d.type==='angle'){
      const I=angleArcInfo(sk,d);if(!I)continue;
      let near=false;
      for(let i=0;i<=16;i++){const an=I.a1+I.dd*i/16;const[sx,sy]=w2s(I.V.x+I.rr*Math.cos(an),I.V.y+I.rr*Math.sin(an));
        if(Math.hypot(sx-px,sy-py)<7){near=true;break;}}
      if(near)return d.id;
    }
  }
  return null;
}
function angleVertex(sk,d){ // sommet commun, sinon INTERSECTION des deux droites (comme Fusion)
  const A=entById(sk,d.a),B=entById(sk,d.b);
  if(!A||!B||A.t!=='line'||B.t!=='line')return null;
  const P=sk.points;
  const sh=[A.p1,A.p2].find(p=>p===B.p1||p===B.p2);
  if(sh&&P[sh])return P[sh];
  const A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2];
  if(!A1||!A2||!B1||!B2)return null;
  // 2026-10-23 : lignes disjointes — l'ancien pseudo-sommet (milieu des milieux) donnait un
  // « angle » qui dépendait de la position des segments : le solveur pilotait autre chose que
  // l'angle des droites et la cote faisait pivoter les lignes dès sa création.
  const ax=A2.x-A1.x,ay=A2.y-A1.y,bx=B2.x-B1.x,by=B2.y-B1.y,cr=ax*by-ay*bx;
  const la=Math.hypot(ax,ay),lb=Math.hypot(bx,by);
  if(la>1e-12&&lb>1e-12&&Math.abs(cr)/(la*lb)>1e-4){
    const t=((B1.x-A1.x)*by-(B1.y-A1.y)*bx)/cr;
    return{x:A1.x+ax*t,y:A1.y+ay*t};
  }
  return{x:((A1.x+A2.x)/2+(B1.x+B2.x)/2)/2,y:((A1.y+A2.y)/2+(B1.y+B2.y)/2)/2};
}
function hitDimLabel(sk,px,py){ // px,py en pixels écran SVG → id de cote ou null (boîte tournée pour les cotes linéaires)
  for(const d of (sk.dims||[])){
    const w=dimLabelPos(sk,d);if(!w)continue;
    const[sx,sy]=w2s(w.x,w.y);
    const isLin=(d.type==='length'||d.type==='distance'||d.type==='gap'||d.type==='distline');
    if(isLin){
      const S=dimSeg(sk,d);
      if(S){
        const[ax,ay]=w2s(S.a.x,S.a.y),[bx,by]=w2s(S.b.x,S.b.y);
        const deg=Math.atan2(by-ay,bx-ax);
        const dx=px-sx,dy=py-sy;
        const lx=dx*Math.cos(deg)+dy*Math.sin(deg);
        const ly=-dx*Math.sin(deg)+dy*Math.cos(deg);
        const half=(String(d.value).length*7.8+14)/2;
        if(Math.abs(lx)<half+6&&Math.abs(ly)<12)return d.id; // boîte du texte (+6 px)
        continue;
      }
    }
    if(d.type==='diameter'||d.type==='radius'){const tw=rdTextW(rdText(d));if(Math.abs(px-sx)<tw/2+6&&Math.abs(py-sy)<12)return d.id;continue;}
    if(Math.hypot(sx-px,sy-py)<18)return d.id; // angle : 18 px autour de l'étiquette (était 60)
  }
  return null;
}
function dimText(x,y,str,id){ // étiquette horizontale avec halo sombre (Ø/R)
  str=parDecor(id,str); // nom= / ƒx
  const[ax,ay]=w2s(x,y);
  const t=skEl('text',{x:ax,y:ay-8,fill:'#30d158','font-size':13,'font-weight':'bold',stroke:'#101012','stroke-width':3,'paint-order':'stroke',style:'cursor:move;pointer-events:all',title:'Glisser pour déplacer · double-clic pour modifier'});
  t.textContent=str;
  t.addEventListener('dblclick',ev=>{ev.stopPropagation();editDim(id);});
  return t;
}
function dimTextOnLine(S,str,id,d){ // étiquette posée SUR la ligne de cote, alignée avec elle (comme Fusion), glissée de d.sl
  str=parDecor(id,str); // nom= / ƒx
  const T=dimTextAt(S,d),mx=T.x,my=T.y;
  const[ax,ay]=w2s(S.a.x,S.a.y),[bx,by]=w2s(S.b.x,S.b.y);
  const[sx,sy]=w2s(mx,my);
  if(!isFinite(sx)||!isFinite(sy))return null;
  let deg=Math.atan2(by-ay,bx-ax)*180/Math.PI;
  if(deg>90.01)deg-=180;else if(deg<-90.01)deg+=180; // toujours lisible
  const rot=`rotate(${deg.toFixed(2)} ${sx.toFixed(1)} ${sy.toFixed(1)})`;
  const wpx=str.length*7.8+10;
  const r=skEl('rect',{x:(sx-wpx/2).toFixed(1),y:(sy-11).toFixed(1),width:wpx,height:21,rx:2,fill:'#101012',transform:rot,style:'cursor:move',title:'Glisser = déplacer · double-clic = modifier'});
  const t=skEl('text',{x:sx.toFixed(1),y:(sy+4.5).toFixed(1),fill:skDimTxtCol,'font-size':13,'font-weight':'bold','text-anchor':'middle',transform:rot,style:'cursor:move;pointer-events:all'}); t.dataset.dim=id; r.dataset.dim=id;
  t.textContent=str;
  const ed=ev=>{ev.stopPropagation();editDim(id);};
  t.addEventListener('dblclick',ed);r.addEventListener('dblclick',ed);
  return t;
}
function dimArrow(x,y,ux,uy,st,size){ // pointe (x,y) écran, axe (ux,uy) écran unitaire pointant VERS la pointe
  size=size||9;
  if(!isFinite(x)||!isFinite(y)||!isFinite(ux)||!isFinite(uy))return;
  const L=Math.hypot(ux,uy)||1;ux/=L;uy/=L;
  const bx=-uy*size*0.32,by=ux*size*0.32;
  skEl('path',{d:`M ${x.toFixed(1)} ${y.toFixed(1)} L ${(x-ux*size+bx).toFixed(1)} ${(y-uy*size+by).toFixed(1)} L ${(x-ux*size-bx).toFixed(1)} ${(y-uy*size-by).toFixed(1)} Z`,fill:st,stroke:'none','pointer-events':'none'});
}
let skDimTxtCol='#30d158';
function skDimExt(sk,L,T,st){
  // Ligne d'attache : si le point T (bout de la cote) tombe HORS du segment L, la ligne
  // est prolongée depuis son extrémité la plus proche jusqu'au-delà de T.
  if(!L||L.t!=='line'||!T)return;
  const P=sk.points,A=P[L.p1],B=P[L.p2];if(!A||!B)return;
  const dx=B.x-A.x,dy=B.y-A.y,L2=dx*dx+dy*dy;if(L2<1e-12)return;
  const t=((T.x-A.x)*dx+(T.y-A.y)*dy)/L2;
  if(t>=-1e-6&&t<=1+1e-6)return;
  const E=t<0?A:B,len=Math.sqrt(L2),ux=dx/len,uy=dy/len,sg=t<0?-1:1,ov=8/skView.s;
  const F={x:A.x+dx*t+ux*sg*ov,y:A.y+dy*t+uy*sg*ov};
  const[a,b]=w2s(E.x,E.y),[c,e]=w2s(F.x,F.y);
  skEl('line',{x1:a,y1:b,x2:c,y2:e,stroke:st,'stroke-width':1,opacity:.85,'pointer-events':'none'});
}
function drawSkDims(sk){
  (sk.dims||[]).forEach(d=>{
    const P=sk.points,w=dimLabelPos(sk,d);if(!w)return;
    const selD=skSel&&skSel.kind==='dim'&&skSel.id===d.id;
    // 2026-10-16-001 : cotes pilotantes en vert, cotes de RÉFÉRENCE en gris avec la
    // valeur mesurée entre parenthèses.
    if(d.ref){const mv=skDimMeasure(sk,d);if(mv!=null&&isFinite(mv))d.value=mv;}
    const st=selD?'#ff9f0a':(d.ref?'#8e8e93':'#30d158');
    skDimTxtCol=st;
    const vtxt=v=>{const t=(d.dia?'Ø':'')+(d.dia?2*v:v).toFixed(2);return d.ref?'('+t+')':t;};
    const over=10/skView.s; // dépassement des lignes de rappel
    if(d.type==='length'||d.type==='distance'){
      const S=dimSeg(sk,d);if(!S)return;
      const{A,B,nx,ny}=S,off=(d.w!=null&&isFinite(d.w))?d.w:(d.type==='length'?5:0);
      const sg=off>=0?1:-1;
      // 2 lignes de rappel (witness) : géométrie → au-delà de la ligne de cote
      let Aex,Bex;
      if(S.hv==='h'){ // cote horizontale : rappels verticaux
        const sA2=S.cy>=A.y?1:-1,sB2=S.cy>=B.y?1:-1;
        Aex={x:A.x,y:S.cy+over*sA2};Bex={x:B.x,y:S.cy+over*sB2};
      }else if(S.hv==='v'){ // cote verticale : rappels horizontaux
        const sA2=S.cx>=A.x?1:-1,sB2=S.cx>=B.x?1:-1;
        Aex={x:S.cx+over*sA2,y:A.y};Bex={x:S.cx+over*sB2,y:B.y};
      }else{
        Aex={x:A.x+nx*(off+over*sg),y:A.y+ny*(off+over*sg)},Bex={x:B.x+nx*(off+over*sg),y:B.y+ny*(off+over*sg)};
      }
      const[ax,ay]=w2s(A.x,A.y),[aex,aey]=w2s(Aex.x,Aex.y);
      const[bx2,by2]=w2s(B.x,B.y),[bex,bey]=w2s(Bex.x,Bex.y);
      skEl('line',{x1:ax,y1:ay,x2:aex,y2:aey,stroke:st,'stroke-width':1,opacity:.85,'pointer-events':'none'});
      skEl('line',{x1:bx2,y1:by2,x2:bex,y2:bey,stroke:st,'stroke-width':1,opacity:.85,'pointer-events':'none'});
      // ligne de cote + flèches en bout (pointes sur les rappels)
      const[p1x,p1y]=w2s(S.a.x,S.a.y),[p2x,p2y]=w2s(S.b.x,S.b.y);
      skEl('line',{x1:p1x,y1:p1y,x2:p2x,y2:p2y,stroke:st,'stroke-width':1.4,'pointer-events':'none'});
      dimArrow(p1x,p1y,p1x-p2x,p1y-p2y,st); // pointe extérieure en a
      dimArrow(p2x,p2y,p2x-p1x,p2y-p1y,st); // pointe extérieure en b
      // valeur alignée sur la ligne, fond opaque
      dimTextOnLine(S,vtxt(d.value),d.id,d);
    }
    if(d.type==='diameter'||d.type==='radius'){rdDraw(sk,d,st);}
    if(d.type==='angle'){
      const I=angleArcInfo(sk,d);if(!I)return;
      const{V,rr,a1,dd}=I;
      const p1={x:V.x+rr*Math.cos(a1),y:V.y+rr*Math.sin(a1)},p2={x:V.x+rr*Math.cos(a1+dd),y:V.y+rr*Math.sin(a1+dd)};
      const[a,b]=w2s(p1.x,p1.y),[c,e2]=w2s(p2.x,p2.y);
      const sg=dd>=0?1:-1; // svg (y inversé) : CCW math → sweep 0, CW → sweep 1
      skEl('path',{d:`M ${a} ${b} A ${rr*skView.s} ${rr*skView.s} 0 ${Math.abs(dd)>Math.PI?1:0} ${sg>=0?0:1} ${c} ${e2}`,fill:'none',stroke:st,'stroke-width':1.5,'pointer-events':'none'});
      // flèches tangentielles aux 2 extrémités de l'arc (pointes vers l'extérieur de l'arc)
      const t1={x:-Math.sin(a1),y:Math.cos(a1)},t2={x:-Math.sin(a1+dd),y:Math.cos(a1+dd)};
      dimArrow(a,b,-t1.x*sg,-t1.y*sg,st,8); // en a : sortie d'arc
      dimArrow(c,e2,t2.x*sg,t2.y*sg,st,8); // en b : sortie d'arc
      dimText(w.x,w.y,d.ref?('(∠'+(d.value*180/Math.PI).toFixed(1)+'°)'):('∠'+(d.value*180/Math.PI).toFixed(1)+'°'),d.id);
      // 7. lignes d'attache : prolongement des lignes jusqu'à l'arc si celui-ci les dépasse
      try{const la=entById(sk,d.a),lb=entById(sk,d.b);[[la,p1],[lb,p2]].forEach(q=>skDimExt(sk,q[0],q[1],st));}catch(e){}
    }
    if(d.type==='gap'){
      const S=dimSeg(sk,d);if(!S)return;
      // ligne de cote prolongée des 2 côtés (les 2 lignes cotées sont les rappels)
      const dxs=S.b.x-S.a.x,dys=S.b.y-S.a.y,dl=Math.hypot(dxs,dys)||1;
      const ux=dxs/dl,uy=dys/dl;
      const A2={x:S.a.x-ux*over,y:S.a.y-uy*over},B2={x:S.b.x+ux*over,y:S.b.y+uy*over};
      const[a,b]=w2s(S.a.x,S.a.y),[c,e2]=w2s(S.b.x,S.b.y);
      const[a2x,a2y]=w2s(A2.x,A2.y),[b2x,b2y]=w2s(B2.x,B2.y);
      skEl('line',{x1:a2x,y1:a2y,x2:b2x,y2:b2y,stroke:st,'stroke-width':1.4,'pointer-events':'none'});
      // flèches aux 2 lignes (pointes sur les lignes cotées, pointant vers l'extérieur)
      dimArrow(a,b,a-c,b-e2,st,8);
      dimArrow(c,e2,c-a,e2-b,st,8);
      dimTextOnLine(S,vtxt(d.value),d.id,d);
      // 7. lignes d'attache : prolongement des 2 lignes cotées jusqu'à la ligne de cote
      try{skDimExt(sk,entById(sk,d.a),S.a,st);skDimExt(sk,entById(sk,d.b),S.b,st);}catch(e){}
    }
    if(d.type==='distline'){ // perpendiculaire centre ↔ ligne, offset d.w déplaçable
      const S=dimSeg(sk,d);if(!S)return;
      const dxs=S.b.x-S.a.x,dys=S.b.y-S.a.y,dl=Math.hypot(dxs,dys)||1;
      if(dl<1e-9)return;
      const ux=dxs/dl,uy=dys/dl; // de P (centre) vers F (pied)
      const off=(d.w!=null&&isFinite(d.w))?d.w:0;
      if(Math.abs(off)>0.5){ // rappels géométrie → au-delà de la ligne décalée
        const sg=off>=0?1:-1;
        const Aex={x:S.A.x+S.nx*(off+over*sg),y:S.A.y+S.ny*(off+over*sg)};
        const Bex={x:S.B.x+S.nx*(off+over*sg),y:S.B.y+S.ny*(off+over*sg)};
        const[ax,ay]=w2s(S.A.x,S.A.y),[aex,aey]=w2s(Aex.x,Aex.y);
        const[bx2,by2]=w2s(S.B.x,S.B.y),[bex,bey]=w2s(Bex.x,Bex.y);
        skEl('line',{x1:ax,y1:ay,x2:aex,y2:aey,stroke:st,'stroke-width':1,opacity:.85,'pointer-events':'none'});
        skEl('line',{x1:bx2,y1:by2,x2:bex,y2:bey,stroke:st,'stroke-width':1,opacity:.85,'pointer-events':'none'});
      }
      const P2={x:S.a.x-ux*over,y:S.a.y-uy*over}; // au-delà du centre
      const F2={x:S.b.x+ux*over,y:S.b.y+uy*over};  // au-delà du pied (traverse la ligne cotée)
      const[px,py]=w2s(S.a.x,S.a.y),[fx,fy]=w2s(S.b.x,S.b.y);
      const[p2x,p2y]=w2s(P2.x,P2.y),[f2x,f2y]=w2s(F2.x,F2.y);
      skEl('line',{x1:p2x,y1:p2y,x2:f2x,y2:f2y,stroke:st,'stroke-width':1.4,'pointer-events':'none'});
      dimArrow(px,py,px-fx,py-fy,st,8);  // pointe en P, vers l'extérieur
      dimArrow(fx,fy,fx-px,fy-py,st,8);  // pointe en F (sur la ligne), vers l'extérieur
      dimTextOnLine({a:{x:S.a.x,y:S.a.y},b:{x:S.b.x,y:S.b.y}},vtxt(d.value),d.id,d);
      try{skDimExt(sk,entById(sk,d.line),S.b,st);}catch(e){} // 7. prolongement de la ligne jusqu'au pied
    }
  });
}
let skDimEditInp=null; // V0.11.23 : champ de saisie d'une cote ouvert (clic sur une autre cote = insère son nom)
function skDimAutoName(sk,d){ // V0.11.23 : nom automatique d1, d2… (comme les paramètres de modèle de SolidCraft / Fusion)
  for(let n=1;n<10000;n++){const nm='d'+n;if(parNameCheck(nm,d,null)===true){d.name=nm;return nm;}}
  return null;
}
function skDimEditPick(sk,px,py){ // V0.11.23 : pendant la saisie, un clic sur une autre cote insère son nom (nommée d<n> au besoin)
  const inp=skDimEditInp;if(!inp||!sk)return false;
  const dl=hitDimLabel(sk,px,py)||hitDimLine(sk,px,py);if(!dl)return false;
  inp._hold=Date.now(); // le blur qui suit n'est pas une validation
  const keep=()=>{try{inp.focus();}catch(e){}};
  if(dl===inp._dimId){keep();return true;}
  const d=dimById(sk,dl);if(!d){keep();return true;}
  if(d.ref){skStatus('Une cote de RÉFÉRENCE mesure sans piloter : elle ne sert pas de paramètre.');keep();return true;}
  let nm=d.name;
  if(!nm){skPushUndo();nm=skDimAutoName(sk,d);if(!nm){keep();return true;}drawSketch2D();}
  // valeur seule (« 10 », « 10 mm ») : remplacée par le nom ; expression en cours : insérée au curseur
  const cur=String(inp.value),m=/^([A-Za-z_][A-Za-z0-9_]*\s*=\s*)?([\s\S]*)$/.exec(cur),pre=m&&m[1]?m[1]:'',rhs=m?m[2]:cur;
  let s0=cur.length,s1=cur.length;
  try{if(typeof inp.selectionStart==='number'){s0=inp.selectionStart;s1=inp.selectionEnd;}}catch(e){}
  if(parIsNumber(rhs.replace(/\s*(mm|°|deg)\s*$/i,''))){inp.value=pre+nm;s0=s1=inp.value.length;}
  else{s0=Math.max(s0,pre.length);s1=Math.max(s1,s0);inp.value=cur.slice(0,s0)+nm+cur.slice(s1);s0=s1=s0+nm.length;}
  keep();try{inp.setSelectionRange(s0,s1);}catch(e){}
  skStatus('« '+nm+' » inséré dans la saisie — Entrée pour valider.');
  return true;
}
function skDimToggleRef(id){ // V0.11.23 : bascule pilotante ⇄ référence à la demande (SolidCraft sketch.toggle_driven)
  const sk=skEdit;if(!sk)return false;const d=dimById(sk,id);if(!d)return false;
  if(d.ref){
    if(!skDimCanDrive(sk,d)){skStatus('Cote de RÉFÉRENCE (sur-contrainte) : elle mesure sans piloter — retirez une contrainte ou une cote pour la rendre pilotante.');return false;}
    skPushUndo();const mv=skDimMeasure(sk,d);if(mv!=null&&isFinite(mv))d.value=mv;delete d.ref;delete d.refV;
    afterEdit();skStatus('Cote PILOTANTE (= '+(+parDimUser(d).toFixed(2))+(d.type==='angle'?'°':' mm')+') — double-clic pour changer la valeur.');return true;
  }
  skPushUndo();d.ref=true;d.refV=1; // 1 = choix de l'utilisateur, gardé (2 = sur-contrainte, réévaluée)
  delete d.expr;delete d.exprErr;
  afterEdit();skStatus('Cote de RÉFÉRENCE : elle mesure sans piloter — clic droit pour la rendre pilotante.');return true;
}
function skDimResetText(id){ // V0.11.23 : texte et ligne de cote remis à leur place par défaut (sketch.dimension_text reset)
  const sk=skEdit;if(!sk)return false;const d=dimById(sk,id);if(!d)return false;
  skPushUndo();delete d.w;delete d.sl;d.ox=0;d.oy=0;drawSketch2D();skStatus('Texte de la cote replacé.');return true;
}
function skDimPlaceCommit(sk,dd){ // V0.11.23 : pose de la cote vivante — doublon (même type, même orientation) → cote existante sélectionnée
  skDimPlace=null;
  const dup=dd&&findDupDim({dims:(sk.dims||[]).filter(x=>x!==dd&&(x.orient||'a')===(dd.orient||'a'))},dd);
  if(dup){sk.dims=sk.dims.filter(x=>x!==dd);afterEdit();reuseDim(dup);return null;}
  return dd?dd.id:null;
}
function skDimPlaceType(key){ // V0.11.23 : taper la valeur (ou Entrée) pendant la pose = pose là où la cote est, saisie ouverte
  const sk=skEdit;if(!sk||!skDimPlace)return;
  const dd=dimById(sk,skDimPlace.id);const id=skDimPlaceCommit(sk,dd);if(!id)return;
  skStatus('Cote posée.');drawSketch2D();renderSkPanel();editDim(id,key);
}
function editDim(id,init){
  const sk=skEdit;if(!sk)return;const d=(sk.dims||[]).find(x=>x.id===id);if(!d)return;
  if(skDimEditInp){try{skDimEditInp._cancel();}catch(e){}} // une seule saisie à la fois
  if(d.ref){
    // cote de référence : redevient PILOTANTE si elle n'est plus en trop, sinon on explique
    if(!skDimCanDrive(sk,d)){skStatus('Cote de RÉFÉRENCE (sur-contrainte) : elle mesure sans piloter — retirez une contrainte ou une cote pour la rendre pilotante.');return;}
    skPushUndo();const mv=skDimMeasure(sk,d);if(mv!=null&&isFinite(mv))d.value=mv;delete d.ref;delete d.refV;
    skStatus('Cote redevenue PILOTANTE.');drawSketch2D();
  }
  const pos=dimLabelPos(sk,d); if(!pos) {
    const v=prompt(d.type==='angle'?'Nouvel angle (degrés) — « nom = valeur » pour la nommer :':'Nouvelle valeur (mm) — « nom = valeur » pour la nommer, ou une expression :', parDimInputText(d));
    if(v===null) return;
    skPushUndo();
    const rr=parDimCommit(sk,d,v);
    if(!rr.ok){skUndoStack.pop();skUndoBtn();alert(rr.msg);return;}
    d.value=rr.nv; parApplyAll(); skSolveOrRevert(sk,'Cote');drawSketch2D();renderSkPanel(); return;
  }
  const [sx,sy]=skOrbFwd(...w2s(pos.x,pos.y)); // position affichée (orbite comprise)
  const r=svg.getBoundingClientRect();
  const inp=document.createElement('input');
  inp.type='text'; inp.inputMode='decimal';
  inp.value=parDimInputText(d); // « nom = expression » si nommée / ƒx
  inp.title='Valeur, expression (ƒx), « nom = valeur » pour nommer la cote — clic sur une autre cote : insère son nom';
  const wIn=Math.max(80,Math.min(260,8*inp.value.length+24));
  inp.style.cssText=`position:absolute;left:${r.left+sx-wIn/2}px;top:${r.top+sy-14}px;width:${wIn}px;height:22px;font-size:12px;text-align:center;border:1px solid #0a84ff;border-radius:6px;background:#1e1e1e;color:#fff;z-index:50`;
  document.body.appendChild(inp);
  inp._dimId=id;skDimEditInp=inp;
  // V0.11.23 : hors du filet global ƒx (parFxGlobal, en capture) — il remplaçait « d1/2 » par « 30 » AVANT le
  // gestionnaire de la cote : l'expression était perdue, la cote ne suivait plus d1 (défaut depuis V0.11.15).
  inp._parFx=1;
  // 2026-10-16-001 : focus DIFFÉRÉ + blur ignoré 300 ms — le clic qui pose la cote
  // retirait le focus et validait aussitôt la saisie (« pas éditable de suite »).
  const t0=Date.now();
  // V0.11.23 : valeur tapée pendant la pose → elle remplace le texte, curseur à la fin
  const sel=()=>{if(init!=null){try{inp.setSelectionRange(inp.value.length,inp.value.length);}catch(e){}}else inp.select();};
  if(init!=null)inp.value=String(init);
  try{inp.focus();sel();}catch(e){} setTimeout(()=>{try{inp.focus();sel();}catch(e){}},30);
  let done=false;
  const commit=(cancel)=>{
    if(done) return; done=true;
    inp.remove();if(skDimEditInp===inp)skDimEditInp=null;
    if(cancel) return;
    // 2026-10-16-002 : « nom = valeur », expression ƒx (noms d'autres cotes / paramètres)
    skPushUndo();
    const rr=parDimCommit(sk,d,inp.value);
    if(!rr.ok){ skUndoStack.pop();skUndoBtn(); skStatus(rr.msg); drawSketch2D(); return; }
    const nv=rr.nv;
    skFirstDimScale(sk,d,nv); // 11. esquisse encore libre : toute la forme suit, à l'échelle
    d.value=nv; parApplyAll(); const ok=skSolveOrRevert(sk,'Cote');drawSketch2D();renderSkPanel();
    if(ok&&d.name)skStatus('Cote nommée « '+d.name+' » — utilisable dans les autres cotes (ƒx).');
  };
  inp.addEventListener('keydown',e=>{
    if(e.key==='Enter'){ commit(false); }
    if(e.key==='Escape'){ commit(true); }
    e.stopPropagation();
  });
  inp._cancel=()=>commit(true);
  inp.addEventListener('blur',()=>{ if(Date.now()-t0<300||Date.now()-(inp._hold||0)<400){ setTimeout(()=>{try{if(!done)inp.focus();}catch(e){}},0); return; } commit(false); });
  return inp;
}
function skFirstDimScale(sk,d,nv){
  // 11. 1re cote PILOTANTE d'une esquisse dessinée « à la volée » (aucune autre cote,
  // aucun point fixé ni projeté) : toute l'esquisse est mise à l'échelle (comme Fusion)
  // au lieu d'étirer une seule entité — les proportions sont gardées.
  if(!d||d.ref||d.type==='angle')return false;
  if((sk.dims||[]).some(x=>x!==d&&!x.ref))return false;
  if((sk.constraints||[]).some(c=>c.type==='fix'))return false;
  if((sk.entities||[]).some(e=>e.proj||e.ref))return false;
  const cur=skDimMeasure(sk,d);if(!(cur>1e-9)||!(nv>0))return false;
  const k=nv/cur;if(Math.abs(k-1)<1e-9)return false;
  const P=sk.points;const ids=Object.keys(P).filter(p=>p!==SK_ORIGIN);
  // centre : l'origine si l'esquisse y est attachée, sinon le centre de son encombrement
  const atO=ids.some(p=>Math.hypot(P[p].x,P[p].y)<1e-6)||(sk.constraints||[]).some(c=>c.type==='coincident'&&(c.a===SK_ORIGIN||c.b===SK_ORIGIN));
  let cx=0,cy=0;
  if(!atO){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;ids.forEach(p=>{x0=Math.min(x0,P[p].x);x1=Math.max(x1,P[p].x);y0=Math.min(y0,P[p].y);y1=Math.max(y1,P[p].y);});cx=(x0+x1)/2;cy=(y0+y1)/2;}
  ids.forEach(p=>{P[p].x=cx+(P[p].x-cx)*k;P[p].y=cy+(P[p].y-cy)*k;});
  (sk.entities||[]).forEach(e=>{if(e.r!=null)e.r*=k;});
  try{skStatus('1re cote : l’esquisse entière est mise à l’échelle ×'+k.toFixed(3)+' (proportions gardées).');}catch(e){}
  return true;
}
