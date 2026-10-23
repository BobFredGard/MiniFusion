/* ═══════════════ import DXF pour la mise en plan (2026-10-23) ═══════════════
   mepDxfParse(texte) → {els, units, k, n, skipped, bbox} : géométrie 2D d'un DXF ASCII
   (R12 à 2018) en millimètres, dans le repère des vues du plan (y vers le BAS, origine
   au centre de l'encombrement) — les mêmes éléments que la géométrie projetée d'une vue :
     L {x1,y1,x2,y2,k}  ·  C {cx,cy,r,k}  ·  A {cx,cy,r,a0,a1,k}  ·  P {pts:[[x,y]…],k}
   k : 'sharp' (trait continu) ou 'hidden' (type de ligne interrompu : HIDDEN, DASHED…).
   Lus : LINE, CIRCLE, ARC, LWPOLYLINE / POLYLINE (renflements → arcs), ELLIPSE, SPLINE
   (NURBS échantillonnée), INSERT (blocs, imbriqués, échelle, rotation, miroir).
   Ignorés (comptés dans skipped) : textes, hachures, solides, points…
   COTES (2026-10-23) : leur graphisme n'entre jamais dans la vue (texte, ligne de cote, flèches,
   lignes de rappel) — entités DIMENSION / LEADER, blocs de cote « *D… », calques de cotation
   (COTE, COTATION, DIM…). Les DIMENSION linéaires, alignées, rayons et diamètres sont rendues
   dans `dims` (repère de la vue) pour devenir des cotes natives du plan :
     {kind:'lin', orient:'h'|'v'|'a', a:[x,y], b:[x,y], p:[x,y]}   (p : point de la ligne de cote)
     {kind:'dia'|'rad', c:[x,y], r, t:[x,y]}                         (t : position du texte)
   Pur (aucun DOM) : testable sous Node. */
function mepDxfParse(txt){
  const lines=String(txt||'').split(/\r\n|\r|\n/);
  const P=[];
  for(let i=0;i+1<lines.length;i+=2){
    const c=parseInt(lines[i].trim(),10);
    if(!isFinite(c))continue;
    P.push([c,lines[i+1].replace(/\s+$/,'')]);
  }
  // en-tête : unités ($INSUNITS) ; sections BLOCKS et ENTITIES : entités groupées par code 0
  let units=0;
  const blocks={},ents=[];
  let sec='',cur=null,blk=null,inBlk=false;
  for(let i=0;i<P.length;i++){
    const[c,v]=P[i];
    if(c===0&&v==='SECTION'){sec=(P[i+1]&&P[i+1][0]===2)?P[i+1][1].trim():'';i++;continue;}
    if(c===0&&v==='ENDSEC'){sec='';cur=null;continue;}
    if(sec==='HEADER'){if(c===9&&v.trim()==='$INSUNITS'){const q=P[i+1];if(q&&q[0]===70)units=+q[1];}continue;}
    if(sec!=='BLOCKS'&&sec!=='ENTITIES')continue;
    if(c===0){
      const t=v.trim();
      if(sec==='BLOCKS'&&t==='BLOCK'){blk={name:'',bx:0,by:0,ents:[]};inBlk=true;cur={t:'BLOCK',g:[]};continue;}
      if(sec==='BLOCKS'&&t==='ENDBLK'){if(blk&&blk.name)blocks[blk.name]=blk;blk=null;inBlk=false;cur=null;continue;}
      cur={t,g:[]};
      if(sec==='BLOCKS'&&inBlk&&blk)blk.ents.push(cur);else if(sec==='ENTITIES')ents.push(cur);
      continue;
    }
    if(!cur)continue;
    if(cur.t==='BLOCK'&&blk){if(c===2)blk.name=v.trim();else if(c===10)blk.bx=+v;else if(c===20)blk.by=+v;continue;}
    cur.g.push([c,v]);
  }
  const K=({1:25.4,2:304.8,4:1,5:10,6:1000,8:1e-6,9:0.0254,10:914.4,11:1e-7,12:1e-6,13:1e-3,14:100})[units]||1;
  const out=[],skipped={};
  const skip=t=>{skipped[t]=(skipped[t]||0)+1;};
  const num=(e,c,d)=>{for(const q of e.g)if(q[0]===c)return +q[1];return d;};
  const str=(e,c)=>{for(const q of e.g)if(q[0]===c)return q[1].trim();return '';};
  const kind=e=>/HIDDEN|DASH|CACHE|INTERROMPU|DOT/i.test(str(e,6))?'hidden':'sharp';
  // calque de cotation : son contenu (lignes de cote, rappels, flèches) n'est pas de la pièce
  const dimLayer=e=>/(^|[^A-Z])(COT|DIM)/i.test(str(e,8));
  const dimsW=[];
  // transformations affines 2D : [a,b,c,d,e,f] → x' = a x + c y + e ; y' = b x + d y + f
  const mul=(M,N)=>[M[0]*N[0]+M[2]*N[1],M[1]*N[0]+M[3]*N[1],M[0]*N[2]+M[2]*N[3],M[1]*N[2]+M[3]*N[3],
    M[0]*N[4]+M[2]*N[5]+M[4],M[1]*N[4]+M[3]*N[5]+M[5]];
  const tp=(M,x,y)=>[M[0]*x+M[2]*y+M[4],M[1]*x+M[3]*y+M[5]];
  const I=[1,0,0,1,0,0];
  // repère objet (OCS) : extrusion −Z = miroir en X (cas courant des DXF exportés à l'envers)
  const ocs=e=>num(e,230,1)<0?[-1,0,0,1,0,0]:I;
  const det=M=>M[0]*M[3]-M[1]*M[2];
  const scl=M=>Math.sqrt(Math.abs(det(M)));
  const pushL=(M,x1,y1,x2,y2,k)=>{const a=tp(M,x1,y1),b=tp(M,x2,y2);out.push({t:'L',x1:a[0],y1:a[1],x2:b[0],y2:b[1],k});};
  // arc DXF (angles en radians, sens trigonométrique) → transformé ; miroir : sens inversé
  const pushA=(M,cx,cy,r,s,e,k)=>{
    while(e<=s)e+=2*Math.PI;
    const c=tp(M,cx,cy),R=r*scl(M);
    const ps=tp(M,cx+r*Math.cos(s),cy+r*Math.sin(s)),pe=tp(M,cx+r*Math.cos(e),cy+r*Math.sin(e));
    let a0=Math.atan2(ps[1]-c[1],ps[0]-c[0]),a1=Math.atan2(pe[1]-c[1],pe[0]-c[0]);
    if(det(M)<0){const t=a0;a0=a1;a1=t;}
    while(a1<=a0)a1+=2*Math.PI;
    if(e-s>=2*Math.PI-1e-9)out.push({t:'C',cx:c[0],cy:c[1],r:R,k});
    else out.push({t:'A',cx:c[0],cy:c[1],r:R,s:a0,e:a1,k});
  };
  const pushPts=(M,pts,closed,k)=>{const q=pts.map(p=>tp(M,p[0],p[1]));if(closed&&q.length>2)q.push(q[0].slice());if(q.length>1)out.push({t:'P',pts:q,k});};
  // segment de polyligne avec renflement (bulge = tan(angle/4)) → ligne ou arc
  const seg=(M,p,q,bu,k)=>{
    if(!bu||Math.abs(bu)<1e-9){pushL(M,p[0],p[1],q[0],q[1],k);return;}
    const th=4*Math.atan(bu),dx=q[0]-p[0],dy=q[1]-p[1],ch=Math.hypot(dx,dy);if(ch<1e-12)return;
    const r=ch/(2*Math.sin(Math.abs(th)/2)),mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2;
    const h=(ch/2)/Math.tan(th/2); // décalage du centre sur la normale gauche de p→q (signe compris)
    const cx=mx-dy/ch*h,cy=my+dx/ch*h;
    let s=Math.atan2(p[1]-cy,p[0]-cx),e=Math.atan2(q[1]-cy,q[0]-cx);
    if(bu<0){const t=s;s=e;e=t;}
    pushA(M,cx,cy,r,s,e,k);
  };
  // NURBS par de Boor, échantillonnée
  const nurbs=(deg,ctrl,knots,w)=>{
    const n=ctrl.length;if(n<2)return ctrl.slice();
    if(!knots||knots.length!==n+deg+1){knots=[];for(let i=0;i<n+deg+1;i++)knots.push(i<=deg?0:(i>=n?n-deg:i-deg));}
    const W=(w&&w.length===n)?w:ctrl.map(()=>1),t0=knots[deg],t1=knots[n],N=Math.max(24,n*8),pts=[];
    for(let s=0;s<=N;s++){
      const t=Math.min(t1-1e-12,t0+(t1-t0)*s/N);
      let k=deg;while(k<n-1&&t>=knots[k+1])k++;
      const d=[];for(let j=0;j<=deg;j++){const c=ctrl[k-deg+j],ww=W[k-deg+j];d.push([c[0]*ww,c[1]*ww,ww]);}
      for(let r=1;r<=deg;r++)for(let j=deg;j>=r;j--){
        const i=k-deg+j,den=knots[i+deg-r+1]-knots[i],a=den>1e-12?(t-knots[i])/den:0;
        d[j]=[(1-a)*d[j-1][0]+a*d[j][0],(1-a)*d[j-1][1]+a*d[j][1],(1-a)*d[j-1][2]+a*d[j][2]];
      }
      pts.push([d[deg][0]/d[deg][2],d[deg][1]/d[deg][2]]);
    }
    return pts;
  };
  const doEnts=(list,M,depth)=>{
    for(let i=0;i<list.length;i++){
      const e=list[i],k=kind(e),Mo=mul(M,ocs(e));
      if(e.t!=='DIMENSION'&&e.t!=='SEQEND'&&e.t!=='VERTEX'&&dimLayer(e)){skip('cotation (calque '+str(e,8)+')');
        if(e.t==='POLYLINE')while(i+1<list.length&&list[i+1].t!=='SEQEND')i++;continue;}
      switch(e.t){
        case 'DIMENSION':{
          // points de définition en coordonnées générales (10, 13, 14, 15) ; texte (11) en OCS
          const ty=num(e,70,0)&7,P_=c=>tp(M,num(e,c,0),num(e,c+10,0));
          if(ty===0||ty===1){
            const a=P_(13),b=P_(14),pl=P_(10),rot=((num(e,50,0)%180)+180)%180;
            const orient=ty===1?'a':(Math.abs(rot)<1e-6?'h':(Math.abs(rot-90)<1e-6?'v':null));
            if(orient)dimsW.push({kind:'lin',orient,a,b,p:pl});else skip('cote tournée');
          }else if(ty===3||ty===4){
            const p10=P_(10),p15=P_(15),t11=tp(Mo,num(e,11,0),num(e,21,0));
            const c=ty===4?p10:[(p10[0]+p15[0])/2,(p10[1]+p15[1])/2],r=Math.hypot(p15[0]-c[0],p15[1]-c[1]);
            dimsW.push({kind:ty===4?'rad':'dia',c,r,t:t11});
          }else skip('cote angulaire / ordonnée');
          break;
        }
        case 'LINE':pushL(M,num(e,10,0),num(e,20,0),num(e,11,0),num(e,21,0),k);break;
        case 'CIRCLE':pushA(Mo,num(e,10,0),num(e,20,0),num(e,40,0),0,2*Math.PI,k);break;
        case 'ARC':pushA(Mo,num(e,10,0),num(e,20,0),num(e,40,0),num(e,50,0)*Math.PI/180,num(e,51,360)*Math.PI/180,k);break;
        case 'LWPOLYLINE':{
          const V=[];let v=null;
          e.g.forEach(([c,x])=>{if(c===10){v=[+x,0,0];V.push(v);}else if(c===20&&v)v[1]=+x;else if(c===42&&v)v[2]=+x;});
          const closed=(num(e,70,0)&1)===1;
          for(let j=0;j+1<V.length;j++)seg(Mo,V[j],V[j+1],V[j][2],k);
          if(closed&&V.length>2)seg(Mo,V[V.length-1],V[0],V[V.length-1][2],k);
          break;
        }
        case 'POLYLINE':{
          const flag=num(e,70,0);if(flag&(16|64)){skip('POLYLINE 3D');break;}
          const V=[];let j=i+1;
          for(;j<list.length&&list[j].t!=='SEQEND';j++)if(list[j].t==='VERTEX')V.push([num(list[j],10,0),num(list[j],20,0),num(list[j],42,0)]);
          i=j; // VERTEX… SEQEND consommés
          for(let q=0;q+1<V.length;q++)seg(Mo,V[q],V[q+1],V[q][2],k);
          if((flag&1)&&V.length>2)seg(Mo,V[V.length-1],V[0],V[V.length-1][2],k);
          break;
        }
        case 'ELLIPSE':{
          const cx=num(e,10,0),cy=num(e,20,0),mx=num(e,11,1),my=num(e,21,0),ra=num(e,40,1);
          let s=num(e,41,0),t=num(e,42,2*Math.PI);while(t<=s)t+=2*Math.PI;
          const R=Math.hypot(mx,my),an=Math.atan2(my,mx);
          if(Math.abs(ra-1)<1e-9){pushA(Mo,cx,cy,R,s+an,t+an,k);break;}
          const N=Math.max(16,Math.ceil((t-s)/(Math.PI/48))),pts=[];
          for(let q=0;q<=N;q++){const u=s+(t-s)*q/N,x=R*Math.cos(u),y=R*ra*Math.sin(u);
            pts.push([cx+x*Math.cos(an)-y*Math.sin(an),cy+x*Math.sin(an)+y*Math.cos(an)]);}
          pushPts(Mo,pts,false,k);break;
        }
        case 'SPLINE':{
          const deg=num(e,71,3),ctrl=[],fit=[],knots=[],w=[];let c1=null,f1=null;
          e.g.forEach(([c,x])=>{
            if(c===10){c1=[+x,0];ctrl.push(c1);}else if(c===20&&c1)c1[1]=+x;
            else if(c===11){f1=[+x,0];fit.push(f1);}else if(c===21&&f1)f1[1]=+x;
            else if(c===40)knots.push(+x);else if(c===41)w.push(+x);});
          const pts=ctrl.length>deg?nurbs(deg,ctrl,knots,w):fit;
          pushPts(Mo,pts,(num(e,70,0)&1)===1&&ctrl.length<=deg,k);break;
        }
        case 'INSERT':{
          if(/^\*D/i.test(str(e,2))){skip('cotation (bloc '+str(e,2)+')');break;} // bloc de cote anonyme
          const b=blocks[str(e,2)];if(!b||depth>8){skip('INSERT');break;}
          const sx=num(e,41,1),sy=num(e,42,1),ro=num(e,50,0)*Math.PI/180,co=Math.cos(ro),si=Math.sin(ro);
          // insertion · rotation · échelle · −point de base du bloc (rangées / colonnes : 1 seule copie)
          let T=[co*sx,si*sx,-si*sy,co*sy,num(e,10,0),num(e,20,0)];
          T=mul(T,[1,0,0,1,-b.bx,-b.by]);
          doEnts(b.ents,mul(Mo,T),depth+1);break;
        }
        case 'SEQEND':case 'VERTEX':case 'ATTRIB':break;
        default:skip(e.t);
      }
    }
  };
  doEnts(ents,[K,0,0,K,0,0],0);
  // repère des vues : y vers le bas, centré sur l'encombrement
  let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
  const bb=(x,y)=>{if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;};
  out.forEach(e=>{
    if(e.t==='L'){bb(e.x1,e.y1);bb(e.x2,e.y2);}
    else if(e.t==='C'){bb(e.cx-e.r,e.cy-e.r);bb(e.cx+e.r,e.cy+e.r);}
    else if(e.t==='A'){for(let q=0;q<=32;q++){const a=e.s+(e.e-e.s)*q/32;bb(e.cx+e.r*Math.cos(a),e.cy+e.r*Math.sin(a));}}
    else if(e.t==='P')e.pts.forEach(p=>bb(p[0],p[1]));
  });
  if(!out.length){x0=y0=x1=y1=0;}
  const mx=(x0+x1)/2,my=(y0+y1)/2,R=v=>Math.round(v*1e6)/1e6;
  const els=out.map(e=>{
    if(e.t==='L')return{t:'L',x1:R(e.x1-mx),y1:R(my-e.y1),x2:R(e.x2-mx),y2:R(my-e.y2),k:e.k};
    if(e.t==='C')return{t:'C',cx:R(e.cx-mx),cy:R(my-e.cy),r:R(e.r),k:e.k};
    if(e.t==='A')return{t:'A',cx:R(e.cx-mx),cy:R(my-e.cy),r:R(e.r),a0:R(-e.s),a1:R(-e.e),k:e.k}; // y retourné : sens horaire
    return{t:'P',pts:e.pts.map(p=>[R(p[0]-mx),R(my-p[1])]),k:e.k};
  });
  const Q=p=>[R(p[0]-mx),R(my-p[1])];
  const dims=dimsW.map(d=>d.kind==='lin'?{kind:'lin',orient:d.orient,a:Q(d.a),b:Q(d.b),p:Q(d.p)}:{kind:d.kind,c:Q(d.c),r:R(d.r),t:Q(d.t)});
  return{els,dims,units:K,n:els.length,skipped,bbox:{w:R(x1-x0),h:R(y1-y0)},origin:{x:R(mx),y:R(my)}};
}
