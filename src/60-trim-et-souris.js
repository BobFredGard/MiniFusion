/* ----- ajuster (trim) : retire le tronçon cliqué entre intersections ----- */
function interLineLine(A,B,C,D){
  const dx1=B.x-A.x,dy1=B.y-A.y,dx2=D.x-C.x,dy2=D.y-C.y;
  const den=dx1*dy2-dy1*dx2;if(Math.abs(den)<1e-12)return null;
  const t=((C.x-A.x)*dy2-(C.y-A.y)*dx2)/den,u=((C.x-A.x)*dy1-(C.y-A.y)*dx1)/den;
  return{x:A.x+dx1*t,y:A.y+dy1*t,t,u};
}
const TRIM_GRAZE=0.05; // frôlement (tangence exacte ou approchée) accepté comme intersection, en mm
function interLineCircle(A,B,C,r){
  const dx=B.x-A.x,dy=B.y-A.y,L2=dx*dx+dy*dy;if(L2<1e-12)return[];
  const t0=((C.x-A.x)*dx+(C.y-A.y)*dy)/L2;
  const px=A.x+dx*t0,py=A.y+dy*t0;
  const h2=r*r-(px-C.x)*(px-C.x)-(py-C.y)*(py-C.y);
  if(h2<-TRIM_GRAZE*TRIM_GRAZE)return[];const h=Math.sqrt(Math.max(h2,0)),L=Math.sqrt(L2);
  if(h<TRIM_GRAZE)return[{x:px,y:py,t:t0}];
  return[{x:px-dx/L*h,y:py-dy/L*h,t:t0-h/L},{x:px+dx/L*h,y:py+dy/L*h,t:t0+h/L}];
}
function interCircCirc(C0,r0,C1,r1){
  const dx=C1.x-C0.x,dy=C1.y-C0.y,d=Math.hypot(dx,dy);
  if(d<1e-9||d>r0+r1+TRIM_GRAZE||d<Math.abs(r0-r1)-TRIM_GRAZE)return[];
  const a=(r0*r0-r1*r1+d*d)/(2*d),h=Math.sqrt(Math.max(r0*r0-a*a,0));
  const xm=C0.x+dx*a/d,ym=C0.y+dy*a/d;
  if(h<TRIM_GRAZE)return[{x:xm,y:ym}];
  return[{x:xm-dy*h/d,y:ym+dx*h/d},{x:xm+dy*h/d,y:ym-dx*h/d}];
}
function angNorm(a){const T=Math.PI*2;a%=T;if(a<0)a+=T;return a;}
function entHits(sk,ent){ // intersections (monde) avec les autres entités
  const P=sk.points,out=[];
  const onArcEps=(a,a1,a2)=>angInArc(a,a1,a2+1e-4); // tolérance frontière d'arc (bruit solveur aux extrémités)
  const push=(x,y)=>{out.push({x,y});};
  if(ent.t==='line'){
    const A=P[ent.p1],B=P[ent.p2];if(!A||!B)return out;
    sk.entities.forEach(o=>{
      if(o.id===ent.id||o.construction)return; // construction : ne coupe jamais (hors trim)
      if(o.t==='line'){const C=P[o.p1],D=P[o.p2];if(!C||!D)return;
        const h=interLineLine(A,B,C,D);
        if(h&&h.t>-1e-6&&h.t<1+1e-6&&h.u>-1e-6&&h.u<1+1e-6)push(h.x,h.y);}
      if(o.t==='circle'||o.t==='arc'){const C=P[o.pc];if(!C)return;
        interLineCircle(A,B,C,o.r).forEach(h=>{if(h.t>-1e-6&&h.t<1+1e-6){
          if(o.t==='arc'){const an=arcAngles(sk,o);if(!an||!onArcEps(Math.atan2(h.y-C.y,h.x-C.x),an.a1,an.a2))return;}
          push(h.x,h.y);}});}
    });
  }
  if(ent.t==='circle'||ent.t==='arc'){
    const C=P[ent.pc];if(!C)return;
    const onArc=(x,y)=>{if(ent.t==='circle')return true;const an=arcAngles(sk,ent);return !!an&&onArcEps(Math.atan2(y-C.y,x-C.x),an.a1,an.a2);};
    sk.entities.forEach(o=>{
      if(o.id===ent.id||o.construction)return; // construction : ne coupe jamais (hors trim)
      if(o.t==='line'){const A=P[o.p1],B=P[o.p2];if(!A||!B)return;
        const span=Math.hypot(B.x-A.x,B.y-A.y)||1,tt=Math.max(1e-6,0.02/span); // tolérance en mm : une tangence (t≈1±bruit solveur) compte comme intersection
        interLineCircle(A,B,C,ent.r).forEach(h=>{if(h.t>-tt&&h.t<1+tt&&onArc(h.x,h.y))push(h.x,h.y);});}
      if(o.t==='circle'||o.t==='arc'){const C2=P[o.pc];if(!C2)return;
        interCircCirc(C,ent.r,C2,o.r).forEach(h=>{if(!onArc(h.x,h.y))return;
          if(o.t==='arc'){const an=arcAngles(sk,o);if(!an||!onArcEps(Math.atan2(h.y-C2.y,h.x-C2.x),an.a1,an.a2))return;}push(h.x,h.y);});}
    });
  }
  const u=[];out.forEach(h=>{if(!u.some(k=>Math.hypot(k.x-h.x,k.y-h.y)<1e-6))u.push(h);});
  return u;
}
function pidAtTol(sk,x,y,tol){let best=null,bd=tol;Object.keys(skPts(sk)).forEach(pid=>{const p=sk.points[pid];const d=Math.hypot(p.x-x,p.y-y);if(d<bd){bd=d;best=pid;}});return best||addPoint(sk,x,y);}
function splitOtherAt(sk,selfId,x,y){ // matérialise le point de coupe dans les lignes traversées (jonction en T)
  const pid=pidAtTol(sk,x,y,0.5);
  sk.entities.forEach(o=>{
    if(o.id===selfId||o.t!=='line')return;
    const A=sk.points[o.p1],B=sk.points[o.p2];if(!A||!B)return;
    if(o.p1===pid||o.p2===pid)return;
    if(distSeg(x,y,A,B)<0.5)splitLineAt(sk,o.id,pid);
  });
  return pid;
}
function skAttachOnCurve(sk,pid,x,y,tol){ // épingle un point sur le cercle/arc sous (x,y) : attache solide créée à la coupe
  if(!pid||!sk.points[pid])return 0;
  tol=tol||1e-3;let n=0;
  (sk.entities||[]).forEach(e=>{
    if((e.t!=='circle'&&e.t!=='arc')||!sk.points[e.pc])return;
    if(e.pc===pid||e.pa===pid||e.pb===pid)return; // centre/bouts propres de la courbe : structurels, pas de contrainte
    const C=sk.points[e.pc];
    if(Math.abs(Math.hypot(x-C.x,y-C.y)-e.r)>tol)return;
    if(e.t==='arc'){const an=arcAngles(sk,e);if(!an||!angInArc(Math.atan2(y-C.y,x-C.x),an.a1,an.a2))return;}
    if((sk.constraints||[]).some(c=>c.type==='oncircle'&&c.p===pid&&c.ent===e.id))return;
    sk.constraints.push({id:skNewEid(sk),type:'oncircle',p:pid,ent:e.id});n++;
  });
  return n;
}
function skAutoAttach(sk,pid,x,y,tol){
  // à la création (tous outils) : attache solide du point sur la géométrie proche —
  // pt/ligne → contrainte online (pied intérieur), sinon pt/cercle/arc → oncircle.
  if(!pid||!sk.points[pid])return 0;
  if(tol===undefined||tol===null)tol=SK_SNAP;
  let best=null,bd=tol;
  (sk.entities||[]).forEach(e=>{
    if(e.t!=='line'||e.p1===pid||e.p2===pid)return;
    const A=sk.points[e.p1],B=sk.points[e.p2];if(!A||!B)return;
    const dx=B.x-A.x,dy=B.y-A.y,L2=dx*dx+dy*dy;if(L2<1e-12)return;
    const t=((x-A.x)*dx+(y-A.y)*dy)/L2;
    if(t<=1e-3||t>=1-1e-3)return; // pied aux extrémités → coïncidence pt/pt (déjà gérée par le snap)
    const d=Math.hypot(A.x+t*dx-x,A.y+t*dy-y);
    if(d<bd){bd=d;best=e;}
  });
  if(best){
    if((sk.constraints||[]).some(c=>c.type==='online'&&c.p===pid&&c.line===best.id))return 0;
    if((sk.constraints||[]).some(c=>c.type==='midpoint'&&c.p===pid&&c.line===best.id))return 0; // déjà au centre ⊕ : l'online est implicite
    sk.constraints.push({id:skNewEid(sk),type:'online',p:pid,line:best.id});return 1;
  }
  return skAttachOnCurve(sk,pid,x,y,tol);
}
function skPinTangent(sk,lineId,entId){
  // verrouille le point de tangence (Fusion360) : l'extrémité au contact est épinglée
  // sur le cercle/arc via oncircle — le point de tangence ne glisse plus, la tangence converge.
  const L=entById(sk,lineId),E=entById(sk,entId);
  if(!L||!E||(E.t!=='circle'&&E.t!=='arc'))return 0;
  const C=sk.points[E.pc],A=sk.points[L.p1],B=sk.points[L.p2];
  if(!C||!A||!B)return 0;
  const dx=B.x-A.x,dy=B.y-A.y,Ln=Math.hypot(dx,dy);if(Ln<1e-9)return 0;
  const t=Math.max(0,Math.min(1,((C.x-A.x)*dx+(C.y-A.y)*dy)/(Ln*Ln)));
  const fx=A.x+t*dx,fy=A.y+t*dy;
  const tol=Math.max(3,E.r*0.08);
  let best=null,bd=Infinity;
  [L.p1,L.p2].forEach(pid=>{
    if(pid===E.pc||pid===E.pa||pid===E.pb)return; // bout structurel de l'arc : déjà sur la courbe
    const Pp=sk.points[pid];if(!Pp)return;
    if(Math.abs(Math.hypot(Pp.x-C.x,Pp.y-C.y)-E.r)>tol)return;
    const d=Math.hypot(Pp.x-fx,Pp.y-fy);
    if(d<bd){bd=d;best=pid;}
  });
  if(!best||bd>tol)return 0;
  if((sk.constraints||[]).some(c=>c.type==='oncircle'&&c.p===best&&c.ent===E.id))return 0;
  sk.constraints.push({id:skNewEid(sk),type:'oncircle',p:best,ent:E.id});
  return 1;
}
function trimEntity(sk,ent,cx,cy){
  const P=sk.points;
  if(ent.construction)return 'Entité de construction : repère de positionnement, rien à ajuster.'; // hors trim
  if(ent.t==='line'){
    const A=P[ent.p1],B=P[ent.p2];if(!A||!B)return 'Ligne invalide.';
    const dx=B.x-A.x,dy=B.y-A.y,len2=dx*dx+dy*dy;if(len2<1e-12)return 'Ligne dégénérée.';
    const cutAt=(x,y)=>{const pid=splitOtherAt(sk,ent.id,x,y);skAttachOnCurve(sk,pid,x,y);return pid;}; // coupe + épinglage sur cercle/arc
    const tc=((cx-A.x)*dx+(cy-A.y)*dy)/len2;
    const raw=entHits(sk,ent).map(h=>({t:((h.x-A.x)*dx+(h.y-A.y)*dy)/len2,x:h.x,y:h.y}))
      .filter(h=>h.t>=-1e-6&&h.t<=1+1e-6).sort((p,q)=>p.t-q.t);
    const hits=[];
    raw.forEach(h=>{const last=hits[hits.length-1];if(!last||Math.hypot(h.x-last.x,h.y-last.y)>1e-4)hits.push(h);});
    if(!hits.length)return 'Aucune intersection : rien à ajuster.';
    let prev=null,next=null;
    hits.forEach(h=>{if(h.t<tc-1e-9)prev=h;else if(h.t>tc+1e-9&&!next)next=h;});
    if(prev&&next&&prev.t<=1e-9&&next.t>=1-1e-9){
      cloneLineConstraints(sk,ent.id,[],true);
      sk.entities=sk.entities.filter(x=>x.id!==ent.id);
      return 'Ligne retirée ✂.';
    }
    if(prev&&next&&prev.t<=1e-9){
      ent.p1=cutAt(next.x,next.y);syncLineDims(sk,ent.id);return 'Ligne ajustée ✂.';
    }
    if(prev&&next&&next.t>=1-1e-9){
      ent.p2=cutAt(prev.x,prev.y);syncLineDims(sk,ent.id);return 'Ligne ajustée ✂.';
    }
    if(prev&&!next&&prev.t<=1e-9){
      cloneLineConstraints(sk,ent.id,[],true);
      sk.entities=sk.entities.filter(x=>x.id!==ent.id);
      return 'Ligne retirée ✂.';
    }
    if(!prev&&next&&next.t>=1-1e-9){
      cloneLineConstraints(sk,ent.id,[],true);
      sk.entities=sk.entities.filter(x=>x.id!==ent.id);
      return 'Ligne retirée ✂.';
    }
    if(prev&&next){
      const pA=cutAt(prev.x,prev.y),pB=cutAt(next.x,next.y);
      const p1=ent.p1,p2=ent.p2;
      sk.entities=sk.entities.filter(x=>x.id!==ent.id);
      const l1={id:skNewEid(sk),t:'line',p1,p2:pA},l2={id:skNewEid(sk),t:'line',p1:pB,p2};
      sk.entities.push(l1,l2);
      cloneLineConstraints(sk,ent.id,[l1.id,l2.id],true);
      return 'Tronçon retiré ✂.';
    }
    if(prev&&!next){ent.p2=cutAt(prev.x,prev.y);syncLineDims(sk,ent.id);return 'Ligne ajustée ✂.';}
    if(!prev&&next){ent.p1=cutAt(next.x,next.y);syncLineDims(sk,ent.id);return 'Ligne ajustée ✂.';}
    return 'Rien à ajuster ici.';
  }
  if(ent.t==='arc'||ent.t==='circle'){
    const C=P[ent.pc];if(!C)return 'Cercle invalide.';
    const hits=entHits(sk,ent);
    if(ent.t==='circle'&&hits.length<2)return 'Il faut au moins 2 intersections pour ajuster un cercle.';
    if(!hits.length)return 'Aucune intersection : rien à ajuster.';
    const angs=hits.map(h=>angNorm(Math.atan2(h.y-C.y,h.x-C.x))).sort((a,b)=>a-b);
    const clickA=angNorm(Math.atan2(cy-C.y,cx-C.x));
    if(ent.t==='circle'){ // le cercle devient l'arc complémentaire du segment cliqué
      let i0=angs.length-1;
      for(let i=0;i<angs.length;i++){const a0=angs[i],a1=angs[(i+1)%angs.length];
        const inside=a1>a0?(clickA>=a0&&clickA<=a1):(clickA>=a0||clickA<=a1);
        if(inside){i0=i;break;}}
      const aStart=angs[(i0+1)%angs.length];let aEnd=angs[i0];if(aEnd<=aStart)aEnd+=Math.PI*2;
      if(aEnd-aStart<0.05)return 'Arc restant trop petit.';
      ent.t='arc'; // bouts matérialisés en vrais points partagés : toute ligne qui finit/traverse à ce endroit s'y joint
      const bx=(ang)=>{const xx=C.x+ent.r*Math.cos(ang),yy=C.y+ent.r*Math.sin(ang);
        let pid=splitOtherAt(sk,ent.id,xx,yy);
        if(pid===ent.pc)pid=addPoint(sk,xx,yy);
        skAttachOnCurve(sk,pid,xx,yy); // attache solide dès la coupe (comme le trim de ligne)
        return pid;}; // garde-fou : jamais le centre
      ent.pa=bx(aStart);
      ent.pb=bx(aEnd);
      if(ent.pb===ent.pa)ent.pb=addPoint(sk,C.x+ent.r*Math.cos(aEnd),C.y+ent.r*Math.sin(aEnd));
      { // contraintes ancrées SUR le segment retiré (entre les deux bouts) → supprimées (sinon audit en rouge)
        const remIn=(a)=>{let s=aEnd,e=aStart;if(e<=s)e+=Math.PI*2;let r=(a-s)%(Math.PI*2);if(r<0)r+=Math.PI*2;return r>1e-5&&r<(e-s)-1e-5;};
        const anchorAbs=(c)=>{
          if(c.type==='oncircle'){const p=sk.points[c.p];if(!p)return null;return angNorm(Math.atan2(p.y-C.y,p.x-C.x));}
          if(c.type==='tangent'){const L=entById(sk,c.line);if(!L)return null;const A=sk.points[L.p1],B=sk.points[L.p2];if(!A||!B)return null;
            const dx=B.x-A.x,dy=B.y-A.y,L2=dx*dx+dy*dy;if(L2<1e-12)return null;
            const t=((C.x-A.x)*dx+(C.y-A.y)*dy)/L2;
            return angNorm(Math.atan2(A.y+t*dy-C.y,A.x+t*dx-C.x));}
          return null;};
        const dead=[];
        (sk.constraints||[]).forEach(c=>{
          if(!c||c.ent!==ent.id||(c.type!=='oncircle'&&c.type!=='tangent'))return;
          const a=anchorAbs(c);if(a===null)return;
          if(remIn(a))dead.push(c);});
        if(dead.length)sk.constraints=sk.constraints.filter(c=>dead.indexOf(c)<0);
      }
      return 'Cercle ajusté en arc ✂ (cotes Ø conservées).';
    }
    const an0=arcAngles(sk,ent);if(!an0)return 'Arc invalide.';
    const A1=an0.a1;let d=an0.a2-an0.a1;const T=Math.PI*2;if(d<1e-9)d=T;
    const C2=P[ent.pc];
    const rel=a=>{let r=(a-A1)%T;if(r<0)r+=T;return r;};
    // ancrage angulaire (relatif à A1) d'une contrainte tangence / point-sur-courbe sur cet arc
    const anchorRel=(c)=>{
      if(c.type==='oncircle'){const p=sk.points[c.p];if(!p)return null;return rel(Math.atan2(p.y-C2.y,p.x-C2.x));}
      if(c.type==='tangent'){const L=entById(sk,c.line);if(!L)return null;const A=sk.points[L.p1],B=sk.points[L.p2];if(!A||!B)return null;
        const dx=B.x-A.x,dy=B.y-A.y,L2=dx*dx+dy*dy;if(L2<1e-12)return null;
        const t=((C2.x-A.x)*dx+(C2.y-A.y)*dy)/L2;
        return rel(Math.atan2(A.y+t*dy-C2.y,A.x+t*dx-C2.x));}
      return null;};
    const inR=angs.map(a=>rel(a)).filter(r=>r>1e-4&&r<d-1e-4).sort((a,b)=>a-b);
    if(!inR.length)return 'Rien à ajuster ici.';
    const rc=rel(clickA);let pB=null,nB=null;inR.forEach(r=>{if(r<rc)pB=r;else if(nB===null)nB=r;});
    const E=1e-5;
    // point de coupe NEUF à l'angle relatif r : on ne déplace JAMAIS un bout existant (partagé avec
    // une ligne → c'est lui qui « partait en vrille » et fusionnait avec le voisin) ; on fusionne avec
    // le point déjà posé à cet endroit, sinon on crée, puis épinglage ⊙ sur l'arc.
    const cutAtRel=(r,excl)=>{const x=C2.x+ent.r*Math.cos(A1+r),y=C2.y+ent.r*Math.sin(A1+r);
      let pid=splitOtherAt(sk,ent.id,x,y);
      if(!pid||(excl||[]).indexOf(pid)>=0)pid=addPoint(sk,x,y);
      if(!(sk.constraints||[]).some(c=>c.type==='oncircle'&&c.p===pid&&c.ent===ent.id))
        sk.constraints.push({id:skNewEid(sk),type:'oncircle',p:pid,ent:ent.id});
      return pid;};
    // routage des contraintes après découpe : ancrées sur [0,pB] → arc d'origine,
    // sur [nB,d] → nouveau tronçon, dans le segment retiré (pB,nB) → supprimée.
    const routeLinks=(newId)=>{
      const dead=[];
      (sk.constraints||[]).forEach(c=>{
        if(!c||c.ent!==ent.id||(c.type!=='oncircle'&&c.type!=='tangent'))return;
        const r=anchorRel(c);if(r===null)return;
        if(pB!==null&&nB!==null){
          if(r<=pB+E)return; // reste sur l'arc d'origine
          if(r>=nB-E){if(newId)c.ent=newId;return;} // sur le tronçon conservé d'après
          dead.push(c); // dans le tronçon cliqué → retiré
        }else if(pB!==null){ // retiré : (pB, d]
          if(r<=pB+E)return;dead.push(c);
        }else{ // retiré : [0, nB)
          if(r>=nB-E)return;dead.push(c);
        }});
      if(dead.length)sk.constraints=sk.constraints.filter(c=>dead.indexOf(c)<0);
    };
    // le nouveau tronçon hérite des liaisons sans ancrage angulaire (//, ⟂, symétrie, fix) + cotes rayon
    const cloneRest=(newId)=>{
      if(!newId)return;
      (sk.constraints||[]).forEach(c=>{
        if(!c)return;
        if((c.type==='parallel'||c.type==='perpendicular'||c.type==='symmetric')&&(c.a===ent.id||c.b===ent.id)){
          const a=c.a===ent.id?newId:c.a,b=c.b===ent.id?newId:c.b;
          if(a!==b&&!(sk.constraints||[]).some(x=>x.type===c.type&&((x.a===a&&x.b===b)||(c.type!=='parallel'&&x.a===b&&x.b===a))))
            sk.constraints.push({id:skNewEid(sk),type:c.type,a,b});
        }else if(c.type==='fix'&&c.ent===ent.id){
          if(!(sk.constraints||[]).some(x=>x.type==='fix'&&x.ent===newId))
            sk.constraints.push({id:skNewEid(sk),type:'fix',ent:newId});
        }});
      (sk.dims||[]).filter(dd=>dd.type==='radius'&&dd.ent===ent.id).forEach(dd=>{
        if(!(sk.dims||[]).some(x=>x.type==='radius'&&x.ent===newId))
          sk.dims.push({id:skNewEid(sk),type:'radius',ent:newId,value:dd.value,ox:dd.ox||0,oy:dd.oy||0});});
    };
    if(pB!==null&&nB!==null){
      const oldPb=ent.pb; // bout d'origine (partagé, ex : tangence) : ne BOUGE PAS
      const qB=cutAtRel(pB,[ent.pc,ent.pa,ent.pb]);
      ent.pb=qB; // l'arc d'origine s'arrête avant le segment cliqué
      const np=cutAtRel(nB,[ent.pc,ent.pa,ent.pb,oldPb,qB]);
      const nA={id:skNewEid(sk),t:'arc',pc:ent.pc,pa:np,pb:oldPb,r:ent.r};
      sk.entities.push(nA);
      routeLinks(nA.id);cloneRest(nA.id);
      return 'Arc scindé ✂.';
    }
    if(pB!==null){
      const qB=cutAtRel(pB,[ent.pc,ent.pa,ent.pb]);
      ent.pb=qB;routeLinks(null);
      return 'Arc ajusté ✂.';
    }
    if(nB!==null){
      const qN=cutAtRel(nB,[ent.pc,ent.pa,ent.pb]);
      ent.pa=qN;routeLinks(null);
      return 'Arc ajusté ✂.';
    }
    return 'Rien à ajuster ici.';
  }
  return 'Ajuster : lignes, arcs et cercles uniquement.';
}

/* ----- interactions souris ----- */
svg.addEventListener('wheel',e=>{
  if(!skEdit)return;e.preventDefault();
  const r=svg.getBoundingClientRect();
  const k=zoomInv?e.deltaY:-e.deltaY;
  skSetZoom(skView.s*Math.exp(k*0.0012),e.clientX-r.left,e.clientY-r.top);
},{passive:false});
svg.addEventListener('contextmenu',e=>{
  e.preventDefault();
  if(!skEdit) return;
  if(skDimPlace){skCancelDraft();skStatus('Placement annulé.');return;} // Échap/clic droit pendant la pose
  const selEnts=skSelectedEnts();
  const hasSel = selEnts.length>0 || (skSel&&skSel.kind==='point') || skSelX.length>0;
  if(hasSel){
    showSkCtx(e.clientX, e.clientY);
    return;
  }
  skCancelDraft();if(skEdit)skStatus('Action annulée.');
});
document.addEventListener('click',e=>{
  const m=$('skCtxMenu'); if(!m||m.style.display==='none') return;
  if(!m.contains(e.target) && e.target!==svg) hideSkCtx();
});
function skEntPids(e){
  if(!e)return[];
  if(e.t==='line')return[e.p1,e.p2];
  if(e.t==='arc')return[e.pc,e.pa,e.pb];
  if(e.t==='circle')return[e.pc];
  if(e.t==='cpoint')return[e.p];
  return[];
}
function skDragComp(sk,seed){
  // composante connexe pour un glisser en corps rigide :
  // pids réunis (points partagés), coïncidents, tangents, symétriques, parallèles/perp
  const pids=new Set();const ents=new Set();
  (seed||[]).forEach(p=>{if(p&&sk.points[p])pids.add(p);});
  let changed=true,guard=0;
  while(changed&&guard++<128){
    changed=false;
    (sk.entities||[]).forEach(e=>{
      if(ents.has(e.id))return;
      const ep=skEntPids(e);
      if(ep.some(p=>pids.has(p)&&sk.points[p])){
        ents.add(e.id);
        ep.forEach(p=>{if(p&&sk.points[p])pids.add(p);});
        changed=true;
      }
    });
    (sk.constraints||[]).forEach(c=>{
      if(!c)return;
      if(c.type==='coincident'){
        if(pids.has(c.a)&&!pids.has(c.b)&&sk.points[c.b]){pids.add(c.b);changed=true;}
        else if(pids.has(c.b)&&!pids.has(c.a)&&sk.points[c.a]){pids.add(c.a);changed=true;}
      }else if(c.type==='tangent'){
        const L=entById(sk,c.line),E=entById(sk,c.ent);
        if(!L||!E)return;
        if(ents.has(L.id)&&!ents.has(E.id)){ents.add(E.id);skEntPids(E).forEach(p=>{if(p&&sk.points[p])pids.add(p);});changed=true;}
        else if(ents.has(E.id)&&!ents.has(L.id)){ents.add(L.id);skEntPids(L).forEach(p=>{if(p&&sk.points[p])pids.add(p);});changed=true;}
      }else if(c.type==='oncircle'){
        const E=entById(sk,c.ent);
        if(!E||!sk.points[c.p])return;
        if(pids.has(c.p)&&!ents.has(E.id)){ents.add(E.id);skEntPids(E).forEach(p=>{if(p&&sk.points[p])pids.add(p);});changed=true;}
        else if(ents.has(E.id)&&!pids.has(c.p)){pids.add(c.p);changed=true;}
      }else if(c.type==='online'){
        const L=entById(sk,c.line);
        if(!L||!sk.points[c.p])return;
        if(pids.has(c.p)&&!ents.has(L.id)){ents.add(L.id);skEntPids(L).forEach(p=>{if(p&&sk.points[p])pids.add(p);});changed=true;}
        else if(ents.has(L.id)&&!pids.has(c.p)){pids.add(c.p);changed=true;}
      }else if(c.type==='symmetric'||c.type==='parallel'||c.type==='perpendicular'){
        const A=entById(sk,c.a),B=entById(sk,c.b);
        if(!A||!B)return;
        if(ents.has(A.id)&&!ents.has(B.id)){ents.add(B.id);skEntPids(B).forEach(p=>{if(p&&sk.points[p])pids.add(p);});changed=true;}
        else if(ents.has(B.id)&&!ents.has(A.id)){ents.add(A.id);skEntPids(A).forEach(p=>{if(p&&sk.points[p])pids.add(p);});changed=true;}
      }
    });
  }
  return {pids:[...pids],ents:[...ents]};
}
svg.addEventListener('dblclick',e=>{
  if(!skEdit||skTool!=='select')return;
  const sk=skEdit;
  const r0=svg.getBoundingClientRect();
  const px=e.clientX-r0.left,py=e.clientY-r0.top;
  const dl=hitDimLabel(sk,px,py); // étiquette seule → édition (pas la ligne fléchée)
  if(dl){editDim(dl);return;}
  const[wx,wy]=evXY(e);
  const ent=nearestEntity(sk,wx,wy,SK_PICK+2);if(!ent)return;
  if(ent.t!=='line'&&ent.t!=='circle'&&ent.t!=='arc')return;
  const ex=sk.dims.find(d=>(d.type==='length'&&d.line===ent.id)||(d.ent===ent.id&&(d.type==='diameter'||d.type==='radius')));
  if(ex){editDim(ex.id);return;}
  skPushUndo();
  if(ent.t==='line')sk.dims.push({id:skNewEid(sk),type:'length',line:ent.id,value:+lineLen(sk,ent).toFixed(3),ox:0,oy:0});
  else if(ent.t==='circle')sk.dims.push({id:skNewEid(sk),type:'diameter',ent:ent.id,value:+(ent.r*2).toFixed(3),ox:0,oy:0});
  else sk.dims.push({id:skNewEid(sk),type:'radius',ent:ent.id,value:+ent.r.toFixed(3),ox:0,oy:0});
  afterEdit();skStatus('Cote créée — double-clic sur la valeur pour l’éditer.');
});
svg.addEventListener('pointerdown',e=>{
  if(!skEdit)return;const sk=skEdit;
  try{svg.setPointerCapture(e.pointerId);}catch(err){}
  if(e.button===2)return;
  if(e.button===1){e.preventDefault();skPan={px:e.clientX,py:e.clientY,cx:skView.cx,cy:skView.cy};return;}
  if(e.button!==0||skPan)return;
  const[wx,wy]=evXY(e);
  if(skTool==='select'){
    const r0=svg.getBoundingClientRect(); // une étiquette de cote se déplace au glisser, s'édite au double-clic
    const dl=hitDimLabel(sk,e.clientX-r0.left,e.clientY-r0.top);
    if(dl){const dd=dimById(sk,dl);skSel={kind:'dim',id:dl};skSelX=[];
      skDimDrag={id:dl,mode:'label',px:e.clientX,py:e.clientY,ox0:(dd.ox||0),oy0:(dd.oy||0),pushed:false};
      renderSkPanel();return;}
    const pid=nearestPoint(sk,wx,wy,SK_PICK+2);
    if(pid){
      if(e.shiftKey){skSelX.push({kind:'point',pid});renderSkPanel();drawSketch2D();return;}
      skSel={kind:'point',pid};skSelX=[];
      // point de jonction (partagé par 2+ entités ou coïncident) → glisser toute la composante en corps rigide
      const nShared=(sk.entities||[]).reduce((n,e)=>n+(skEntPids(e).indexOf(pid)>=0?1:0),0);
      const coin=(sk.constraints||[]).some(c=>c.type==='coincident'&&(c.a===pid||c.b===pid));
      if(nShared>1||coin){
        const comp=skDragComp(sk,[pid]);
        const orig={};comp.pids.forEach(p=>{if(sk.points[p])orig[p]={x:sk.points[p].x,y:sk.points[p].y};});
        skDragEnt={x0:wx,y0:wy,pids:comp.pids,orig,anchor:comp.pids.filter(p=>!skFixed(sk).has(p)),pushed:false};
        renderSkPanel();drawSketch2D();return;
      }
      skDrag=pid;skDragMoved=false;skDragPushed=false;renderSkPanel();drawSketch2D();return;
    }
    if(e.detail===2) return;
    const dlId=hitDimLine(sk,e.clientX-r0.left,e.clientY-r0.top); // ligne de cote : glisser = repositionner
    if(dlId){const dd=dimById(sk,dlId);if(dd){
      skSel={kind:'dim',id:dlId};skSelX=[];
      skDimDrag={id:dlId,mode:'line',px:e.clientX,py:e.clientY,w0:(dd.w!=null?dd.w:(dd.type==='length'?5:0)),sl0:(dd.sl||0),pushed:false};
      renderSkPanel();drawSketch2D();return;}}
    const ent=nearestEntity(sk,wx,wy,SK_PICK);
    if(ent){
      if(e.shiftKey){if(!(skSel&&skSel.kind==='ent'&&skSel.id===ent.id))skSelX.push({kind:'ent',id:ent.id});}
      else{skSel={kind:'ent',id:ent.id};skSelX=[];}
      // déplacement en corps rigide : toute la composante connexe (points partagés,
      // coïncidences, tangences, symétries, parallélismes) suit le membre saisi
      const comp=skDragComp(sk,skEntPids(ent));
      const orig={};comp.pids.forEach(p=>{if(sk.points[p])orig[p]={x:sk.points[p].x,y:sk.points[p].y};});
      skDragEnt={x0:wx,y0:wy,pids:comp.pids,orig,anchor:comp.pids.filter(p=>!skFixed(sk).has(p)),pushed:false};
      renderSkPanel();drawSketch2D();return;
    }
    // clic sur le vide → boîte de sélection (gauche→droite : dedans · droite→gauche : croisé)
    if(!e.shiftKey){skSel=null;skSelX=[];renderSkPanel();}
    skBox={x0:wx,y0:wy,x1:wx,y1:wy,add:e.shiftKey};
    drawSketch2D();return;
  }
  if(skTool==='line'){
    if(skDyn){skDynCommit();return;}
    if(skDown){skDown.clicked=true;return;} // déjà armé : le tracé suit la souris
    const fromChain=!!skChain;
    const startPid=skChain||snapNewPoint(sk,wx,wy);
    const S=sk.points[startPid];
    skDown={pid:startPid,x:S.x,y:S.y,fromChain,clicked:false,cx:e.clientX,cy:e.clientY};
    drawSketch2D();
    skStatus('1er point armé — déplacez puis 2e clic (ou tapez une longueur + Entrée).');
    return;
  }
  if(skTool==='rect'||skTool==='circle'||skTool==='slot'){
    if(skDown) return;
    const pid=snapNewPoint(sk,wx,wy);const S=sk.points[pid];
    skDown={pid,x:S.x,y:S.y,center:!!e.shiftKey&&skTool!=='circle'};return;
  }
  if(skTool==='cpoint'){skPushUndo();const pid=snapNewPoint(sk,wx,wy);sk.entities.push({id:skNewEid(sk),t:'cpoint',p:pid});skAutoAttach(sk,pid,wx,wy);afterEdit();return;}
  if(skTool==='arc'){
    if(!skArcC){skPushUndo();skArcC=snapNewPoint(sk,wx,wy);drawSketch2D();skStatus('Arc : cliquez le point de départ.');return;}
    const C=sk.points[skArcC];
    if(skArcA1===null||skArcA1===undefined){
      skPushUndo();
      const pa=snapNewPoint(sk,wx,wy),P0=sk.points[pa]; // réutilise un point existant → attaché d'office
      const rr=Math.hypot(P0.x-C.x,P0.y-C.y);
      if(rr<0.5){skStatus('Arc : départ trop près du centre.');return;}
      skArcPa=pa;skArcA1=Math.atan2(P0.y-C.y,P0.x-C.x);
      skDraft={t:'arc',pc:skArcC,r:rr,a1:skArcA1,a2:skArcA1+0.6};
      skStatus('Arc : cliquez le point final.');drawSketch2D();return;}
    skPushUndo();
    const pb=snapNewPoint(sk,wx,wy);
    const na={id:skNewEid(sk),t:'arc',pc:skArcC,pa:skArcPa,pb,r:skDraft.r};
    sk.entities.push(na);
    [na.pa,na.pb].forEach(pid=>{const pp=sk.points[pid];if(pp)skAutoAttach(sk,pid,pp.x,pp.y);});
    {const cp=sk.points[na.pc];if(cp)skAutoAttach(sk,na.pc,cp.x,cp.y,1e-3);}
    skArcC=null;skArcA1=null;skArcPa=null;skDraft=null;afterEdit();return;
  }
  if(skTool==='dim'){
    if(skDimPlace){ // cote vivante : 2ᵉ entité → conversion (comme Fusion), vide → pose + saisie
      const dd=dimById(sk,skDimPlace.id);
      const ent=nearestEntity(sk,wx,wy,SK_PICK);
      const pid=nearestPoint(sk,wx,wy,SK_PICK+2);
      if(dd&&tryExtendDim(dd,ent,pid))return; // convertie → reste en mode pose
      const id=skDimPlace.id;skDimPlace=null;
      skStatus('Cote posée.');drawSketch2D();renderSkPanel();editDim(id);return;
    }
    dimClick(wx,wy,e.shiftKey);return;
  }
  if(skTool==='coincident'){
    const pid=nearestPoint(sk,wx,wy,SK_SNAP);
    if(!pid){skStatus('Coïncident : cliquez une extrémité existante (carrés).');return;}
    if(!skCoinA){skCoinA=pid;skStatus('Coïncident : cliquez la 2ᵉ extrémité à fusionner.');drawSketch2D();return;}
    if(pid!==skCoinA)skPushUndo();
    if(mergePoints(sk,pid,skCoinA))skStatus('Points fusionnés ⌖.');
    skCoinA=null;afterEdit();return;
  }
  if(skTool==='fillet'||skTool==='chamfer'){
    // Congé / chanfrein : 2 clics sur 2 lignes en coin (même geste que coïncidence).
    const isF=skTool==='fillet';
    const ent=nearestEntity(sk,wx,wy,SK_PICK+3,false);
    if(!ent||ent.t!=='line'){skStatus((isF?'Congé ⦾':'Chanfrein ◣')+' : cliquez une ligne droite.');return;}
    if(!skCornA||skCornA.tool!==skTool){skCornA={tool:skTool,id:ent.id};skStatus((isF?'Congé ⦾ : 1ʳᵉ arête ✓ — cliquez la 2ᵉ (coin commun).':'Chanfrein ◣ : 1ʳᵉ arête ✓ — cliquez la 2ᵉ (coin commun).'));drawSketch2D();return;}
    if(ent.id===skCornA.id){skStatus('Même ligne — cliquez une autre ligne.');return;}
    skPushUndo();
    const r=isF?skFilletCorner(sk,skCornA.id,ent.id,skFilletR):skChamferCorner(sk,skCornA.id,ent.id,skChamferD);
    skCornA=null;
    if(!r.ok){skUndoStack.pop();skUndoBtn();skStatus(r.msg);drawSketch2D();return;}
    afterEdit();
    skStatus(r.msg+(isF?' — R modifiable (double-clic la cote).':' — retrait modifiable (double-clic la cote).'));
    return;
  }
  if(skTool==='project'){
    if(!occHas()||!occLive||!occLive.shape){skStatus('Projeter : noyau OCCT requis et solide visible.');return;}
    const pr=projectEdgeAt(sk,wx,wy);
    if(!pr){skStatus('Aucune arête 3D sur ce plan à proximité.');return;}
    skPushUndo();
    if(pr.type==='circle'){
      const pc=addPoint(sk,pr.cx,pr.cy);
      sk.constraints.push({id:skNewEid(sk),type:'fix',p:pc});
      const eid=skNewEid(sk);
      sk.entities.push(Object.assign({id:eid,t:'circle',pc,r:pr.r,construction:true,proj:true},projNames(pr)));
      sk.constraints.push({id:skNewEid(sk),type:'fix',ent:eid});
      skStatus('Cercle projeté en construction (centre fixe).');
    }else if(pr.type==='arc'){
      const pc=addPoint(sk,pr.cx,pr.cy);
      const pa=addPoint(sk,pr.x1,pr.y1), pb=addPoint(sk,pr.x2,pr.y2);
      sk.constraints.push({id:skNewEid(sk),type:'fix',p:pc});
      sk.constraints.push({id:skNewEid(sk),type:'fix',p:pa});
      sk.constraints.push({id:skNewEid(sk),type:'fix',p:pb});
      const eid=skNewEid(sk);
      sk.entities.push(Object.assign({id:eid,t:'arc',pc,pa,pb,r:pr.r,construction:true,proj:true},projNames(pr)));
      sk.constraints.push({id:skNewEid(sk),type:'fix',ent:eid});
      skStatus('Arc projeté en construction (fixe).');
    }else{
      const p1=addPoint(sk,pr.x1,pr.y1),p2=addPoint(sk,pr.x2,pr.y2);
      const eid=skNewEid(sk);
      sk.entities.push(Object.assign({id:eid,t:'line',p1,p2,construction:true,proj:true},projNames(pr)));
      sk.constraints.push({id:skNewEid(sk),type:'fix',p:p1},{id:skNewEid(sk),type:'fix',p:p2});
      skStatus('Arête projetée en construction (fixe).');
    }
    afterEdit();return;
  }
  if(skTool==='trim'){
    const ent=nearestEntity(sk,wx,wy,SK_PICK+3,true);
    if(!ent){skStatus('Ajuster : cliquez un tronçon de ligne, d’arc ou de cercle près d’une intersection.');return;}
    skPushUndo();skStatus(trimEntity(sk,ent,wx,wy));afterEdit();return;
  }
});
svg.addEventListener('pointermove',e=>{
  if(!skEdit)return;const sk=skEdit;const[wx,wy]=evXY(e);
  if(skPan){skView.cx=skPan.cx-(e.clientX-skPan.px)/skView.s;skView.cy=skPan.cy+(e.clientY-skPan.py)/skView.s;drawSketch2D();return;}
  if(skTool==='project'){
    const pr=projectEdgeAt(sk,wx,wy);
    const k=pr?JSON.stringify(pr):'null', ko=skProjectHover?JSON.stringify(skProjectHover):'null';
    if(k!==ko){ skProjectHover=pr; drawSketch2D(); }
    if(pr) skStatus('⧉ '+(pr.type==='circle'?'Cercle':pr.type==='arc'?'Arc':'Arête')+' — clic pour projeter en construction.');
    else skStatus('⧉ Survolez une arête 3D (même hors plan) — elle s\'illumine en orange.');
    return;
  }
  if(skDrag){
    if(skFixed(sk).has(skDrag)){skStatus('Point fixé 🔒 — retirez « Fixe » pour le déplacer.');return;}
    if(!skDragPushed){skPushUndo();skDragPushed=true;}
    const s=findSnap(sk,wx,wy,skDrag);
    let nx=wx,ny=wy;
    if(s){nx=s.x;ny=s.y;skSnapMk={x:nx,y:ny};}
    else{if($('skSnap').checked){nx=skSnapVal(nx);ny=skSnapVal(ny);}skSnapMk=null;}
    sk.points[skDrag]={x:nx,y:ny};skDragMoved=true;
    solveSketch(sk,40,[skDrag]);drawSketch2D();return;
  }
  if(skDragEnt){
    const dx=wx-skDragEnt.x0,dy=wy-skDragEnt.y0;
    if(!skDragEnt.pushed){
      if(Math.hypot(dx,dy)*skView.s<=4)return; // seuil anti-clic
      const anyFree=skDragEnt.anchor.length>0;
      if(!anyFree){skStatus('Entité fixée 🔒 — retirez « Fixe » pour la déplacer.');return;}
      skPushUndo();skDragEnt.pushed=true;
    }
    skDragEnt.pids.forEach(p=>{
      if(skFixed(sk).has(p))return;
      const o=skDragEnt.orig[p];if(o)sk.points[p]={x:o.x+dx,y:o.y+dy};
    });
    solveSketch(sk,40);drawSketch2D();return;
  }
  if(skDimDrag){
    const dd=dimById(sk,skDimDrag.id);if(!dd){skDimDrag=null;return;}
    if(skDimDrag.mode==='line'){
      const ddx=(e.clientX-skDimDrag.px)/skView.s,ddy=-(e.clientY-skDimDrag.py)/skView.s;
      if(!skDimDrag.pushed&&(Math.abs(ddx)+Math.abs(ddy))>1e-6){skPushUndo();skDimDrag.pushed=true;}
      if(dd.type==='length'||dd.type==='distance'||dd.type==='distline'){
        const S=dimSeg(sk,dd);
        if(S)dd.w=(skDimDrag.w0!=null?skDimDrag.w0:0)+ddx*S.nx+ddy*S.ny;
      }else if(dd.type==='gap'){
        const S=dimSeg(sk,dd);
        if(S)dd.sl=(skDimDrag.sl0||0)+ddx*S.ux+ddy*S.uy;
      }else if(dd.type==='angle'){
        const V=angleVertex(sk,dd);
        if(V){const[mwx,mwy]=evXY(e);dd.w=Math.max(1,Math.hypot(mwx-V.x,mwy-V.y));}
      }
      drawSketch2D();return;
    }
    dd.ox=skDimDrag.ox0+(e.clientX-skDimDrag.px)/skView.s;
    dd.oy=skDimDrag.oy0-(e.clientY-skDimDrag.py)/skView.s;
    drawSketch2D();return;
  }
  if(skBox){skBox.x1=wx;skBox.y1=wy;drawSketch2D();return;}
  if(skDimPlace&&skTool==='dim'){ // aperçu : la cote de pose suit le curseur
    const dd=dimById(sk,skDimPlace.id);
    if(!dd)skDimPlace=null;
    else{
      if(dd.type==='length'||dd.type==='distance'){skDimOrientAt(sk,dd,wx,wy);}
      else if(dd.type==='distline'){const S=dimSeg(sk,dd);if(S)dd.w=(wx-S.A.x)*S.nx+(wy-S.A.y)*S.ny;}
      else if(dd.type==='gap'){const S=dimSeg(sk,dd);if(S){const s0=dd.sl||0;const ax0=S.a.x-S.ux*s0,ay0=S.a.y-S.uy*s0;
        dd.sl=(wx-ax0)*S.ux+(wy-ay0)*S.uy;}}
      else if(dd.type==='angle'){skDimAngleAt(sk,dd,wx,wy);}
      else if(dd.type==='diameter'||dd.type==='radius'){ // Ø/R : le rayon suit le curseur (comme Fusion)
        const e=entById(sk,dd.ent),C=e&&sk.points[e.pc];
        if(e&&C){dd.ox=wx-(C.x+e.r*0.7);dd.oy=wy-(C.y+e.r*0.7);}}
      drawSketch2D();return;
    }
  }
  if(skTool==='line'&&skDown){
    let gx=wx,gy=wy;skInfer=null;skSnapMk=null;
    const s=findSnap(sk,wx,wy,skDown.pid);
    if(s&&s.kind==='point'){gx=s.x;gy=s.y;skSnapMk={x:gx,y:gy};}
    else{
      if(s&&s.kind==='mid')skSnapMk={x:s.x,y:s.y};
      if(Math.abs(wx-skDown.x)<SK_INF){gx=skDown.x;skInfer={v:true,x:gx};}
      if(Math.abs(wy-skDown.y)<SK_INF){gy=skDown.y;skInfer=Object.assign(skInfer||{},{h:true,y:gy});}
      if($('skSnap').checked){if(!skInfer||!skInfer.v)gx=skSnapVal(gx);if(!skInfer||!skInfer.h)gy=skSnapVal(gy);}
    }
    // inférence ⟂ (perpendiculaire) et ⦾ (tangente) — comme Fusion
    const dxB=gx-skDown.x,dyB=gy-skDown.y,lenB=Math.hypot(dxB,dyB);
    if(lenB>1e-6){
      let bestPerp=null,bestD=1e9;
      (sk.entities||[]).forEach(l=>{
        if(l.t!=='line')return;
        const A=sk.points[l.p1],B=sk.points[l.p2];if(!A||!B)return;
        const ux=B.x-A.x,uy=B.y-A.y,ul=Math.hypot(ux,uy)||1e-9;
        if(Math.abs((dxB*ux+dyB*uy)/(lenB*ul))>0.053)return; // ≈3° de la normale
        const shared=l.p1===skDown.pid||l.p2===skDown.pid;
        const dl=distSeg(wx,wy,A,B);
        if(!shared&&dl>SK_INF*4)return;
        if(dl<bestD){bestD=dl;bestPerp=l.id;}
      });
      if(bestPerp)skInfer=Object.assign(skInfer||{},{perp:bestPerp});
      let bestTan=null;
      (sk.entities||[]).forEach(c=>{
        if(c.t!=='circle'&&c.t!=='arc')return;
        const C=sk.points[c.pc];if(!C)return;
        const dd=distSeg(C.x,C.y,{x:skDown.x,y:skDown.y},{x:gx,y:gy});
        if(Math.abs(dd-c.r)<SK_INF*1.5)bestTan=c.id;
      });
      if(bestTan)skInfer=Object.assign(skInfer||{},{tan:bestTan});
    }
    skDraft={t:'line',x1:skDown.x,y1:skDown.y,x2:gx,y2:gy,gx,gy,snap:s};
    drawSketch2D();return;
  }
  if((skTool==='rect'||skTool==='slot')&&skDown){
    let bx=wx,by=wy;const s=findSnap(sk,wx,wy);
    if(s){bx=s.x;by=s.y;}else if($('skSnap').checked){bx=skSnapVal(bx);by=skSnapVal(by);}
    let x1=skDown.x,y1=skDown.y;
    if(skDown.center){x1=2*skDown.x-bx;y1=2*skDown.y-by;}
    skDraft={t:skTool==='slot'?'slot':'rect',x1,y1,x2:bx,y2:by};drawSketch2D();return;
  }
  if(skTool==='circle'&&skDown){
    let bx=wx,by=wy;const s=findSnap(sk,wx,wy);
    if(s){bx=s.x;by=s.y;}else if($('skSnap').checked){bx=skSnapVal(bx);by=skSnapVal(by);}
    const r0=Math.hypot(bx-skDown.x,by-skDown.y);
    skDraft={t:'circle',cx:skDown.x,cy:skDown.y,r:r0};
    skStatus('Ø = '+(2*r0).toFixed(2)+' — 2e clic pour valider.');
    drawSketch2D();return;
  }
  if(skTool==='arc'&&skArcC&&skArcA1!==null&&skArcA1!==undefined&&skDraft){
    const C=sk.points[skArcC];let a2=Math.atan2(wy-C.y,wx-C.x);let d=a2-skArcA1;while(d<=0)d+=Math.PI*2;
    skDraft.a2=skArcA1+d;drawSketch2D();return;
  }
  if(!skDown&&!skDrag&&!skDimDrag&&(skTool==='line'||skTool==='coincident'||skTool==='dim'||skTool==='arc')){
    const s=findSnap(sk,wx,wy);const nm=s?{x:s.x,y:s.y}:null;
    if(JSON.stringify(nm)!==JSON.stringify(skSnapMk)){skSnapMk=nm;drawSketch2D();}
  }
});
svg.addEventListener('pointerup',e=>{
  if(skPan){skPan=null;return;}
  if(!skEdit||e.button!==0)return;const sk=skEdit;const[wx,wy]=evXY(e);
  if(skDimDrag){skDimDrag=null;drawSketch2D();return;}
  if(skDrag){skDrag=null;skDragPushed=false;skSnapMk=null;renderSkPanel();drawSketch2D();return;}
  if(skDragEnt){const moved=skDragEnt.pushed;skDragEnt=null;if(moved){solveSketch(sk,60);renderSkPanel();skStatus('Entité déplacée.');}drawSketch2D();return;}
  if(skBox){
    const w=skBox;skBox=null;
    if(Math.hypot(w.x1-w.x0,w.y1-w.y0)*skView.s>5){
      const hits=skBoxHits(w);
      if(w.add){hits.forEach(h=>{if(!skSelX.some(s=>s.kind===h.kind&&(s.id===h.id||s.pid===h.pid)))skSelX.push(h);});}
      else{skSel=null;skSelX=hits;}
      skStatus(hits.length+' entité(s) sélectionnée(s) — Shift+clic pour ajouter.');
    }
    renderSkPanel();drawSketch2D();return;
  }
  if(skTool==='line'&&skDown){
    if(skDyn)return; // saisie en cours : le clic suivant commit via pointerdown
    const d=skDraft;
    const L=d?Math.hypot(d.x2-d.x1,d.y2-d.y1):0;
    const distRaw=Math.hypot(wx-skDown.x,wy-skDown.y);
    const gxp=e.clientX-(skDown.cx!=null?skDown.cx:e.clientX),gyp=e.clientY-(skDown.cy!=null?skDown.cy:e.clientY);
    const commit=!!skDown.clicked||Math.hypot(gxp,gyp)>5;
    let nl=null,finish=false;
    if(commit&&d&&L>0.5){
      nl=skCommitLine(sk,skDown.pid,d.snap,d.gx,d.gy,0);finish=true;
    }else if(commit&&distRaw>0.5){
      // clic à l'endroit (sans événement de mouvement intermédiaire)
      const s=findSnap(sk,wx,wy,skDown.pid);
      let ex=wx,ey=wy;
      if(s){ex=s.x;ey=s.y;}else if($('skSnap').checked){ex=skSnapVal(ex);ey=skSnapVal(ey);}
      nl=skCommitLine(sk,skDown.pid,s,ex,ey,0);finish=true;
    }else{
      if(skDown.clicked||skDown.fromChain){skDown=null;skChain=null;skStatus('Point de départ annulé — recliquez pour recommencer.');finish=true;}
      else skStatus('Point de départ armé — déplacez puis 2e clic.');
    }
    if(nl){skDown=null;skChain=null;skTool='select';document.querySelectorAll('#skToolbar .tool').forEach(x=>x.classList.toggle('on',x.dataset.tool==='select'));skStatus('Ligne créée — sélection (➤).');}
    else if(finish&&!nl&&skDown===null){/* statut déjà posé */}
    solveSketch(sk);skDraft=null;skInfer=null;skSnapMk=null;cleanupSk(sk);drawSketch2D();renderSkPanel();return;
  }
  if((skTool==='rect'||skTool==='slot')&&skDown){
    let bx=wx,by=wy;const s=findSnap(sk,wx,wy);
    if(s){bx=s.x;by=s.y;}else if($('skSnap').checked){bx=skSnapVal(bx);by=skSnapVal(by);}
    let ax=skDown.x,ay=skDown.y;
    const center=!!skDown.center, cPid=skDown.pid;
    if(center){ax=2*ax-bx;ay=2*ay-by;}
    if(!(Math.abs(bx-ax)>0.5&&Math.abs(by-ay)>0.5)){
      skDraft=null;drawSketch2D();
      skStatus((skTool==='slot'?'Oblong':'Rectangle')+(center?' (depuis le centre)':'')+' : 1er point armé — déplacez puis 2e clic.');
      return;
    }
    if(Math.abs(bx-ax)>0.5&&Math.abs(by-ay)>0.5){
      skPushUndo();
      if(skTool==='slot'){
        const x0=Math.min(ax,bx),x1=Math.max(ax,bx),y0=Math.min(ay,by),y1=Math.max(ay,by);
        const w=x1-x0,h=y1-y0;
        if(w>1&&h>1){
          if(w>=h){
            const r=h/2,ym=(y0+y1)/2,xm0=x0+r,xm1=x1-r;
            const pTL=pidAt(sk,xm0,y1),pTR=pidAt(sk,xm1,y1),pBL=pidAt(sk,xm0,y0),pBR=pidAt(sk,xm1,y0);
            const pcL=pidAt(sk,xm0,ym),pcR=pidAt(sk,xm1,ym);
            const lT={id:skNewEid(sk),t:'line',p1:pTL,p2:pTR},lB={id:skNewEid(sk),t:'line',p1:pBL,p2:pBR};
            const aL={id:skNewEid(sk),t:'arc',pc:pcL,pa:pTL,pb:pBL,r};
            const aR={id:skNewEid(sk),t:'arc',pc:pcR,pa:pBR,pb:pTR,r};
            // ligne de construction entre les 2 centres : le centre d'un arc devient un point
            // partagé (2+ entités) → le glisser du centre reste un corps rigide, la forme se pilote
            // par la cote longueur (entraxe) contre la droite de construction, sans casser.
            const lC={id:skNewEid(sk),t:'line',p1:pcL,p2:pcR,construction:true};
            sk.entities.push(lT,lB,aL,aR,lC);
            [pTL,pTR,pBL,pBR].forEach(pid=>{const pp=sk.points[pid];if(pp)skAutoAttach(sk,pid,pp.x,pp.y);});
            [pcL,pcR].forEach(pid=>{const pp=sk.points[pid];if(pp)skAutoAttach(sk,pid,pp.x,pp.y,1e-3);});
            sk.constraints.push(
              {id:skNewEid(sk),type:'h',line:lT.id},{id:skNewEid(sk),type:'h',line:lB.id},
              {id:skNewEid(sk),type:'h',line:lC.id},
              {id:skNewEid(sk),type:'tangent',line:lT.id,ent:aL.id},{id:skNewEid(sk),type:'tangent',line:lT.id,ent:aR.id},
              {id:skNewEid(sk),type:'tangent',line:lB.id,ent:aL.id},{id:skNewEid(sk),type:'tangent',line:lB.id,ent:aR.id},
              {id:skNewEid(sk),type:'equal',a:aL.id,b:aR.id});
            try{
              const entraxe=Math.abs(xm1-xm0);
              if(entraxe>0.5)sk.dims.push({id:skNewEid(sk),type:'length',line:lC.id,value:+entraxe.toFixed(2)});
              sk.dims.push({id:skNewEid(sk),type:'radius',ent:aL.id,value:+r.toFixed(2)});
            }catch(e){}
            if(center)sk.constraints.push({id:skNewEid(sk),type:'fix',p:cPid});
          } else {
            const r=w/2,xm=(x0+x1)/2,ym0=y0+r,ym1=y1-r;
            const pL0=pidAt(sk,x0,ym0),pL1=pidAt(sk,x0,ym1),pR0=pidAt(sk,x1,ym0),pR1=pidAt(sk,x1,ym1);
            const pcB=pidAt(sk,xm,ym0),pcT=pidAt(sk,xm,ym1);
            const lL={id:skNewEid(sk),t:'line',p1:pL0,p2:pL1},lR={id:skNewEid(sk),t:'line',p1:pR0,p2:pR1};
            const aB={id:skNewEid(sk),t:'arc',pc:pcB,pa:pL0,pb:pR0,r};
            const aT={id:skNewEid(sk),t:'arc',pc:pcT,pa:pR1,pb:pL1,r};
            // ligne de construction verticale entre les 2 centres (même logique que l'oblong horizontal)
            const lA={id:skNewEid(sk),t:'line',p1:pcB,p2:pcT,construction:true};
            sk.entities.push(lL,lR,aB,aT,lA);
            [pL0,pL1,pR0,pR1].forEach(pid=>{const pp=sk.points[pid];if(pp)skAutoAttach(sk,pid,pp.x,pp.y);});
            [pcB,pcT].forEach(pid=>{const pp=sk.points[pid];if(pp)skAutoAttach(sk,pid,pp.x,pp.y,1e-3);});
            sk.constraints.push(
              {id:skNewEid(sk),type:'v',line:lL.id},{id:skNewEid(sk),type:'v',line:lR.id},
              {id:skNewEid(sk),type:'v',line:lA.id},
              {id:skNewEid(sk),type:'tangent',line:lL.id,ent:aB.id},{id:skNewEid(sk),type:'tangent',line:lL.id,ent:aT.id},
              {id:skNewEid(sk),type:'tangent',line:lR.id,ent:aB.id},{id:skNewEid(sk),type:'tangent',line:lR.id,ent:aT.id},
              {id:skNewEid(sk),type:'equal',a:aB.id,b:aT.id});
            try{
              const entraxe=Math.abs(ym1-ym0);
              if(entraxe>0.5)sk.dims.push({id:skNewEid(sk),type:'length',line:lA.id,value:+entraxe.toFixed(2)});
              sk.dims.push({id:skNewEid(sk),type:'radius',ent:aB.id,value:+r.toFixed(2)});
            }catch(e){}
            if(center)sk.constraints.push({id:skNewEid(sk),type:'fix',p:cPid});
          }
        }
      } else {
        let A,Bp,Cp,D;
        if(center){
          A=pidAt(sk,ax,ay);Bp=pidAt(sk,bx,ay);Cp=pidAt(sk,bx,by);D=pidAt(sk,ax,by);
        } else {
          A=cPid;Bp=pidAt(sk,bx,ay);Cp=pidAt(sk,bx,by);D=pidAt(sk,ax,by);
        }
        const l1={id:skNewEid(sk),t:'line',p1:A,p2:Bp},l2={id:skNewEid(sk),t:'line',p1:Bp,p2:Cp},
              l3={id:skNewEid(sk),t:'line',p1:Cp,p2:D},l4={id:skNewEid(sk),t:'line',p1:D,p2:A};
        sk.entities.push(l1,l2,l3,l4);
        [A,Bp,Cp,D].forEach(pid=>{const pp=sk.points[pid];if(pp)skAutoAttach(sk,pid,pp.x,pp.y);});
        sk.constraints.push({id:skNewEid(sk),type:'h',line:l1.id},{id:skNewEid(sk),type:'h',line:l3.id},
                            {id:skNewEid(sk),type:'v',line:l2.id},{id:skNewEid(sk),type:'v',line:l4.id});
        if(center){
          const cx=sk.points[cPid].x,cy=sk.points[cPid].y;
          const halfW=Math.abs(bx-ax),halfH=Math.abs(by-ay);
          const pH=addPoint(sk,cx+halfW,cy),pV=addPoint(sk,cx,cy+halfH);
          const axisH={id:skNewEid(sk),t:'line',p1:cPid,p2:pH,construction:true};
          const axisV={id:skNewEid(sk),t:'line',p1:cPid,p2:pV,construction:true};
          sk.entities.push(axisH,axisV);
          sk.constraints.push(
            {id:skNewEid(sk),type:'h',line:axisH.id},
            {id:skNewEid(sk),type:'v',line:axisV.id},
            {id:skNewEid(sk),type:'fix',p:cPid},
            {id:skNewEid(sk),type:'symmetric',a:l4.id,b:l2.id,mid:axisV.id},
            {id:skNewEid(sk),type:'symmetric',a:l1.id,b:l3.id,mid:axisH.id});
        }
        try{
          const w=Math.abs(bx-ax),h=Math.abs(by-ay);
          if(w>0.5)sk.dims.push({id:skNewEid(sk),type:'length',line:l1.id,value:+w.toFixed(2),ox:0,oy:6});
          if(h>0.5)sk.dims.push({id:skNewEid(sk),type:'length',line:l2.id,value:+h.toFixed(2),ox:6,oy:0});
        }catch(e){}
      }
    }
    skDown=null;skDraft=null;afterEdit();
    skTool='select';document.querySelectorAll('#skToolbar .tool').forEach(x=>x.classList.toggle('on',x.dataset.tool==='select'));skStatus('Sélection (➤).');return;
  }
  if(skTool==='circle'&&skDown){
    let bx=wx,by=wy;const s=findSnap(sk,wx,wy);
    if(s){bx=s.x;by=s.y;}else if($('skSnap').checked){bx=skSnapVal(bx);by=skSnapVal(by);}
    const r=Math.hypot(bx-skDown.x,by-skDown.y);
    if(r<=0.5){skDraft=null;drawSketch2D();skStatus('Cercle : centre armé — déplacez puis 2e clic pour valider le Ø.');return;}
    skPushUndo();
    const nc={id:skNewEid(sk),t:'circle',pc:skDown.pid,r};
    sk.entities.push(nc);
    {const cp=sk.points[nc.pc];if(cp)skAutoAttach(sk,nc.pc,cp.x,cp.y,1e-3);}
    if(s&&s.kind==='point'&&s.pid&&s.pid!==nc.pc&&!(sk.constraints||[]).some(c=>c.type==='oncircle'&&c.p===s.pid&&c.ent===nc.id))
      sk.constraints.push({id:skNewEid(sk),type:'oncircle',p:s.pid,ent:nc.id}); // rayon posé sur un point → point sur cercle
    skDown=null;skDraft=null;afterEdit();
    skTool='select';document.querySelectorAll('#skToolbar .tool').forEach(x=>x.classList.toggle('on',x.dataset.tool==='select'));skStatus('Cercle créé — sélection (➤).');return;
  }
});
function skEscapeToSelect(){
  // Échap : abandonne l'action en cours ET revient à l'outil Sélection (1er icône).
  skDyn=null;skCancelDraft();
  skTool='select';
  document.querySelectorAll('#skToolbar .tool').forEach(x=>x.classList.toggle('on',x.dataset.tool==='select'));
  skStatus('Sélection (➤).');
  if(skEdit){drawSketch2D();renderSkPanel();}
}
function skCancelDraft(){
  if(skDimPlace&&skEdit){skEdit.dims=skEdit.dims.filter(x=>x.id!==skDimPlace.id);skDimPlace=null;} // Échap pendant le placement annule la cote
  skChain=null;skArcC=null;skArcA1=null;skArcPa=null;skPendPt=null;skCoinA=null;skCornA=null;skDraft=null;skDown=null;skDrag=null;skDragEnt=null;skBox=null;skDyn=null;skDimDrag=null;skPan=null;skInfer=null;skMsg='';skDimLine=null;skDimRef=null;skProjectHover=null;hideSkCtx();if(skEdit){cleanupSk(skEdit);drawSketch2D();renderSkPanel();}}
function hideSkCtx(){ const m=$('skCtxMenu'); if(m) m.style.display='none'; }
function showSkCtx(x,y){
  if(!skEdit) return;
  const m=$('skCtxMenu'); if(!m) return;
  const selEnts=skSelectedEnts();
  const pts=[]; if(skSel&&skSel.kind==='point') pts.push(skSel.pid); skSelX.forEach(s=>{if(s.kind==='point') pts.push(s.pid);});
  const lines=selEnts.filter(e=>e.t==='line'), circles=selEnts.filter(e=>e.t==='circle'), arcs=selEnts.filter(e=>e.t==='arc');
  const tot=selEnts.length + pts.length;
  m.innerHTML='<div id="skCtxTitle" style="font-size:.72rem;color:var(--muted);padding:4px 8px">Cote / Contrainte</div>';
  const add=(label, fn)=>{
    const b=document.createElement('button'); b.textContent=label; b.style.cssText='display:block;width:100%;text-align:left;padding:6px 10px;background:none;border:none;color:#fff;cursor:pointer;font-size:.82rem'; b.onmouseenter=()=>b.style.background='rgba(255,255,255,.08)'; b.onmouseleave=()=>b.style.background='none'; b.onclick=()=>{ hideSkCtx(); fn(); }; m.appendChild(b);
  };
  let has=false;
  // construction : bascule hors profil (touche X)
  const ctorEnts=selEnts.filter(e=>e.t==='line'||e.t==='circle'||e.t==='arc');
  if(ctorEnts.length){
    add(ctorEnts.some(e=>!e.construction)?'⇄ Construction (X)':'⇄ Géométrie normale (X)',()=>toggleConstr());
    has=true;
  }
  // 1 ligne
  if(lines.length===1 && tot===1){
    add('📏 Longueur',()=>{ const e=lines[0]; skPushUndo(); skEdit.dims.push({id:skNewEid(skEdit),type:'length',line:e.id,value:+lineLen(skEdit,e).toFixed(2)}); afterEdit(); });
    add('─ Horizontal (H)',()=>applyCon('h')); add('│ Vertical (V)',()=>applyCon('v')); add('📌 Fixe',()=>applyCon('fix')); has=true;
  }
  // 1 cercle / arc
  if(circles.length===1 && tot===1){
    add('⌀ Diamètre',()=>{ const e=circles[0]; skPushUndo(); skEdit.dims.push({id:skNewEid(skEdit),type:'diameter',ent:e.id,value:+(e.r*2).toFixed(2)}); afterEdit(); });
    add('○ Rayon',()=>{ const e=circles[0]; skPushUndo(); skEdit.dims.push({id:skNewEid(skEdit),type:'radius',ent:e.id,value:+e.r.toFixed(2)}); afterEdit(); });
    if(circles[0].pc!==SK_ORIGIN)add('⌾ Centre à l’origine',()=>{ skPushUndo(); skEdit.constraints.push({id:skNewEid(skEdit),type:'coincident',a:circles[0].pc,b:SK_ORIGIN}); afterEdit(); skStatus('Centre fixé à l’origine ⌾.'); });
    add('📌 Fixe',()=>applyCon('fix')); has=true;
  }
  if(arcs.length===1 && tot===1){
    add('○ Rayon',()=>{ const e=arcs[0]; skPushUndo(); skEdit.dims.push({id:skNewEid(skEdit),type:'radius',ent:e.id,value:+e.r.toFixed(2)}); afterEdit(); });
    if(arcs[0].pc!==SK_ORIGIN)add('⌾ Centre à l’origine',()=>{ skPushUndo(); skEdit.constraints.push({id:skNewEid(skEdit),type:'coincident',a:arcs[0].pc,b:SK_ORIGIN}); afterEdit(); skStatus('Centre fixé à l’origine ⌾.'); });
    add('📌 Fixe',()=>applyCon('fix')); has=true;
  }
  // 1 point
  if(pts.length===1 && tot===1){
    if(pts[0]===SK_ORIGIN)add('(Origine 0,0 — point fixe permanent)',()=>{});
    else{
      add('⌾ Fixer à l’origine',()=>{ skPushUndo(); skEdit.constraints.push({id:skNewEid(skEdit),type:'coincident',a:pts[0],b:SK_ORIGIN}); afterEdit(); skStatus('Point fixé à l’origine ⌾.'); });
      add('📌 Fixe',()=>applyCon('fix'));
    }
    has=true;
  }
  // 2 lignes : tout
  if(lines.length===2){
    add('⇔ Entraxe (//)',()=>{
      const A=lines[0],B=lines[1]; const g=lineGap(skEdit,A,B);
      skPushUndo(); skEdit.dims.push({id:skNewEid(skEdit),type:'gap',a:A.id,b:B.id,value:+g.toFixed(2),ox:0,oy:0}); afterEdit();
    });
    add('∠ Angle',()=>{
      const A=lines[0],B=lines[1];
      const id=createAngleDim(skEdit,A,B);
      if(!id){skStatus('Angle trop proche de 0°/180° — non cotable.');return;}
      afterEdit();
      const d=skEdit.dims.find(x=>x.id===id);
      skStatus('Cote angle ∠'+(d&&d.value?(d.value*180/Math.PI).toFixed(1):'?')+'° posée.');
    });
    add('∥ Parallèle',()=>applyCon('parallel')); add('⟂ Perpendiculaire',()=>applyCon('perpendicular'));
    add('＝ Égal',()=>applyCon('equal')); add('─ Horizontal',()=>applyCon('h')); add('│ Vertical',()=>applyCon('v')); add('⊕ Milieux égaux (2 lignes)',()=>applyCon('midpoint')); has=true;
    add('⦾ Congé (arc tangent + R)',()=>skApplyFilletSel()); add('◣ Chanfrein (coupe + cote)',()=>skApplyChamferSel());
  }
  // 2 points
  if(pts.length===2){
    add('📏 Distance points',()=>{
      const A=skEdit.points[pts[0]], B=skEdit.points[pts[1]];
      if(A&&B){ skPushUndo(); skEdit.dims.push({id:skNewEid(skEdit),type:'distance',a:pts[0],b:pts[1],value:+Math.hypot(B.x-A.x,B.y-A.y).toFixed(2)}); afterEdit(); }
    });
    add('⌾ Coïncident',()=>{ skPushUndo(); skEdit.constraints.push({id:skNewEid(skEdit),type:'coincident',a:pts[0],b:pts[1]}); afterEdit(); skStatus('Points coïncidents ⌾.'); });
    add('📌 Fixe',()=>applyCon('fix')); has=true;
  }
  // point + ligne
  if(pts.length===1 && lines.length===1){
    add('📏 Distance point–ligne',()=>{
      const p=skEdit.points[pts[0]], l=lines[0], A=skEdit.points[l.p1], B=skEdit.points[l.p2];
      if(p&&A&&B){ const d=distSeg(p.x,p.y,A,B); skPushUndo(); skEdit.dims.push({id:skNewEid(skEdit),type:'distline',line:l.id,p:pts[0],value:+d.toFixed(2)}); afterEdit(); }
    });
    add('⊕ Milieu (point au centre)',()=>applyCon('midpoint'));
    add('📌 Fixe',()=>applyCon('fix')); has=true;
  }
  // point + cercle/arc
  if(pts.length===1 && (circles.length===1||arcs.length===1)){
    const c=circles[0]||arcs[0];
    if(c&&c.pc!==pts[0])add('⌾ Coïncident centre–point',()=>{ skPushUndo(); skEdit.constraints.push({id:skNewEid(skEdit),type:'coincident',a:c.pc,b:pts[0]}); afterEdit(); skStatus('Centre et point coïncidents ⌾.'); });
    add('📌 Fixe',()=>applyCon('fix')); has=true;
  }
    // ligne + cercle/arc
  if(lines.length===1 && (circles.length===1||arcs.length===1)){
    add('⦾ Tangence',()=>applyCon('tangent'));
    add('📏 Distance',()=>{
      const l=lines[0], c=(circles[0]||arcs[0]), C=skEdit.points[c.pc];
      if(l&&C){ const A=skEdit.points[l.p1],B=skEdit.points[l.p2]; if(A&&B){ const d=distSeg(C.x,C.y,A,B); skPushUndo(); skEdit.dims.push({id:skNewEid(skEdit),type:'distline',line:l.id,p:c.pc,value:+d.toFixed(2)}); afterEdit(); } }
    }); has=true;
  }
  // 3 lignes : symétrie (2 + axe en dernier)
  if(lines.length===3){
    add('⇔ Symétrie (2 + axe)',()=>applyCon('symmetric')); has=true;
  }
  // 2 cercles / 2 arcs / cercle+arc
  if(circles.length+arcs.length===2){
    add('＝ Égal',()=>applyCon('equal'));
    add('⦾ Tangence',()=>applyCon('tangent'));
    add('◎ Coaxial (concentriques)',()=>applyCon('coaxial'));
    add('📏 Distance centres',()=>{
      const a=circles[0]||arcs[0], b=circles[1]||arcs[1];
      const A=skEdit.points[a.pc], B=skEdit.points[b.pc];
      if(A&&B){ skPushUndo(); skEdit.dims.push({id:skNewEid(skEdit),type:'distance',a:a.pc,b:b.pc,value:+Math.hypot(B.x-A.x,B.y-A.y).toFixed(2)}); afterEdit(); }
    }); has=true;
  }
  // 3D ref (violet) déjà projetable via clic simple, mais aussi proposable ici
  if(!has && skEdit._refs && skEdit._refs.length){
    add('👁 Projeter arête 3D (violet) → clic simple sur violet',()=>{});
    has=true;
  }
  if(!has) add('(sélectionnez 1–2 entités : ligne, point, cercle, arc, ou 3D violet)',()=>{});
  m.style.left=x+'px'; m.style.top=y+'px'; m.style.display='block';
}
document.querySelectorAll('#skToolbar .tool').forEach(b=>b.onclick=()=>{skCancelDraft();skTool=b.dataset.tool;document.querySelectorAll('#skToolbar .tool').forEach(x=>x.classList.toggle('on',x===b));if(skEdit)skStatus(b.title||'');});
document.querySelectorAll('#skToolbar .con').forEach(b=>b.onclick=()=>applyCon(b.dataset.con));
$('skZoomIn').onclick=()=>{if(!skEdit)return;const{W,H}=svgSize();skSetZoom(skView.s*1.25,W/2,H/2);};
$('skZoomOut').onclick=()=>{if(!skEdit)return;const{W,H}=svgSize();skSetZoom(skView.s/1.25,W/2,H/2);};
$('skFit').onclick=()=>{if(skEdit)skFitView();};
$('skRefs').onclick=()=>{skShowRefs=!skShowRefs;$('skRefs').style.opacity=skShowRefs?'1':'0.45';if(skEdit)drawSketch2D();};
window.addEventListener('keydown',e=>{
  if(!$('sketchOverlay').classList.contains('open'))return;
  if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))return;
  // saisie dynamique : tapez des chiffres pendant le tracé d'une ligne
  if(skDyn){
    if(/^[0-9]$/.test(e.key)){skDyn.buf+=e.key;e.preventDefault();drawSketch2D();return;}
    if(e.key==='.'||e.key===','){if(!skDyn.buf.includes('.'))skDyn.buf+='.';e.preventDefault();drawSketch2D();return;}
    if(e.key==='Backspace'){skDyn.buf=skDyn.buf.slice(0,-1);e.preventDefault();drawSketch2D();return;}
    if(e.key==='Tab'){skDyn={mode:skDyn.mode==='len'?'ang':'len',buf:''};e.preventDefault();drawSketch2D();return;}
    if(e.key==='Enter'){e.preventDefault();skDynCommit();return;}
    if(e.key==='Escape'){e.preventDefault();skEscapeToSelect();return;}
  }
  if(e.key==='Escape'){e.preventDefault();skEscapeToSelect();return;}
  if(e.ctrlKey&&!e.shiftKey&&(e.key==='z'||e.key==='Z')){e.preventDefault();skUndoTrans();return;}
  if((e.ctrlKey&&(e.key==='y'||e.key==='Y'))||(e.ctrlKey&&e.shiftKey&&(e.key==='z'||e.key==='Z'))){e.preventDefault();skRedoTrans();return;}
  if((e.key==='Delete'||e.key==='Backspace')&&skEdit){e.preventDefault();deleteSkSel();return;}
  if((e.key==='x'||e.key==='X')&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&!skDyn&&skEdit){e.preventDefault();toggleConstr();return;}
  // lancer la saisie dynamique en tapant un chiffre (outil Ligne + point de départ armé)
  if(skEdit&&skTool==='line'&&skDown&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&/^[0-9]$/.test(e.key)){
    skDyn={mode:'len',buf:e.key};e.preventDefault();drawSketch2D();return;
  }
  if(e.key==='Tab'&&skEdit&&skTool==='line'&&skDown){
    skDyn={mode:'len',buf:''};e.preventDefault();drawSketch2D();return;
  }
});
/* ----- boutons Congé / Chanfrein : créés ici (coque HTML générée, jamais éditée),
   APRES la liaison générique des .tool (ci-dessus) → handler dédié uniquement.
   Même pattern que btnDraft/btnCoque côté 3D. Raccourcis F/H dans shortcuts.js. */
(function(){
  const bar=document.getElementById('skToolbar');if(!bar)return;
  const mk=(tool,icon,title)=>{
    if(bar.querySelector('[data-tool="'+tool+'"]'))return;
    const b=document.createElement('button');b.className='tool';b.dataset.tool=tool;b.textContent=icon;b.title=title;
    b.onclick=()=>{skCancelDraft();skTool=tool;document.querySelectorAll('#skToolbar .tool').forEach(x=>x.classList.toggle('on',x===b));if(skEdit)skStatus(title);};
    const trim=bar.querySelector('[data-tool="trim"]');
    if(trim&&trim.parentNode)trim.parentNode.insertBefore(b,trim.nextSibling);else bar.appendChild(b);
  };
  mk('fillet','⦾','Congé (F) : cliquez 2 lignes en coin → arc tangent + cote R (double-clic pour modifier)');
  mk('chamfer','◣','Chanfrein (H) : cliquez 2 lignes en coin → coupe + cote (double-clic pour modifier)');
})();

