// Espace PLAN — suite de la fonction englobante ouverte dans 98-mep-00-modele.js (état privé partagé, fermée dans 98-mep-95-export-init.js) : cotes : mesure, texte, rendu.
  /* ═══════════════ O. cotes : mesure, texte, rendu ═══════════════ */
  /* 2026-10-22-019 : « les cotes, normales et d'ordonnées, ne suivent pas les axes (alignement),
     elles perdent leurs références » — un point accroché à un trait d'axe garde la référence
     {t:'axp', ak, f} (clé de l'axe, position le long de son trait d'origine) ou {t:'axc', ak}
     (centre d'un cercle de perçage) ; il est recalculé à chaque dessin. Un point SANS référence
     posé pile sur un axe manuel de la bonne direction s'y rattache (cotes d'avant V0.3.29). */
  function mepAxisRefOf(sh,v,q,ak){
    const e=mepAxisLineByKey(sh,v,ak);if(!e)return null;
    if(e.t==='C'||e.t==='A')return{t:'axc',ak};
    const x1=e.bx1!=null?e.bx1:e.x1,y1=e.by1!=null?e.by1:e.y1,x2=e.bx2!=null?e.bx2:e.x2,y2=e.by2!=null?e.by2:e.y2;
    const dx=x2-x1,dy=y2-y1,L2=dx*dx+dy*dy;if(!(L2>1e-12))return null;
    return{t:'axp',ak,f:((q.x-x1)*dx+(q.y-y1)*dy)/L2};
  }
  const mepNoAx=new WeakSet();
  function mepPtRefresh(sh,v,q,pref){
    // pref : 'v' (axe vertical voulu), 'h' (horizontal), null (indifférent) — pour la migration
    if(!q||!v)return q;
    const h=q.hint;
    if(h&&h.t==='eln'&&h.l){
      const g=mepGeoOf(v);if(!mepGeoExact(g))return q; // jamais sur le maillage de l'ouverture
      const e=mepAxisTrackLine(g,h.l,null);if(!e)return q;
      h.l={x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2,k:e.k};
      q.x=e.x1+(e.x2-e.x1)*h.f;q.y=e.y1+(e.y2-e.y1)*h.f;
      return q;
    }
    if(h&&(h.t==='axp'||h.t==='axc')){
      const e=mepAxisLineByKey(sh,v,h.ak);if(!e)return q; // axe disparu : dernière position connue
      if(h.t==='axc'){if(e.cx!=null){q.x=e.cx;q.y=e.cy;}return q;}
      const x1=e.bx1!=null?e.bx1:e.x1,y1=e.by1!=null?e.by1:e.y1,x2=e.bx2!=null?e.bx2:e.x2,y2=e.by2!=null?e.by2:e.y2;
      q.x=x1+(x2-x1)*h.f;q.y=y1+(y2-y1)*h.f;
      return q;
    }
    if(h||mepNoAx.has(q)||!mepGeoExact(mepGeoOf(v)))return q;
    // migration : point libre posé pile sur un axe MANUEL (clé « m… », stable) ou une arête de la
    // pièce, de la bonne direction — d'abord ce qui passe PAR le point (sur le trait), le plus long
    const dirOk=(dx,dy)=>!(pref==='v'&&Math.abs(dx)>Math.abs(dy)*0.05)&&!(pref==='h'&&Math.abs(dy)>Math.abs(dx)*0.05);
    const on=(e,dx,dy,L)=>{
      if(Math.abs((q.x-e.x1)*dy-(q.y-e.y1)*dx)/L>=0.02)return -1;
      const f=((q.x-e.x1)*dx+(q.y-e.y1)*dy)/(L*L);return f>=-0.02&&f<=1.02?2:1; // 2 = sur le trait
    };
    let best=null,bs=-1;
    mepAxisLines(sh,v).forEach(e=>{
      if(!e.ak||e.ak[0]!=='m')return;
      if(e.t==='C'){if(!pref&&Math.hypot(q.x-e.cx,q.y-e.cy)<0.02&&bs<3){bs=3;best=mepAxisRefOf(sh,v,q,e.ak);}return;}
      if(e.t!=='L')return;
      const dx=e.x2-e.x1,dy=e.y2-e.y1,L=Math.hypot(dx,dy);if(!(L>1e-9)||!dirOk(dx,dy))return;
      const k=on(e,dx,dy,L);if(k<0)return;
      const sc=k+Math.min(0.9,L/1000); // sur le trait d'abord, puis le plus long
      if(sc>bs){bs=sc;best=mepAxisRefOf(sh,v,q,e.ak);}
    });
    if(!best){ // arête de la pièce (suivie comme les droites d'un axe de symétrie)
      let be=null,bl=0;
      (mepGeoOf(v).els||[]).forEach(e=>{
        if(e.t!=='L')return;
        const dx=e.x2-e.x1,dy=e.y2-e.y1,L=Math.hypot(dx,dy);if(!(L>1e-6)||!dirOk(dx,dy))return;
        if(on(e,dx,dy,L)===2&&L>bl){bl=L;be=e;}
      });
      if(be)best=mepEdgeRefOf(be,q);
    }
    if(best)q.hint=best;else mepNoAx.add(q); // une seule recherche par point (mémoire, jamais enregistré)
    return q;
  }
  function mepEdgeRefOf(e,q){
    const dx=e.x2-e.x1,dy=e.y2-e.y1,L2=dx*dx+dy*dy;
    return{t:'eln',l:{x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2,k:e.k},f:L2>1e-12?((q.x-e.x1)*dx+(q.y-e.y1)*dy)/L2:0};
  }
  /* 2026-10-28 : « la largeur passe de 10,14 à 10 dans le 3D et la cote de la mise en plan ne bouge
     pas ; supprimée et recréée, elle est bonne » — les points accrochés par INDEX d'entité
     ({t:'seg'|'ctr', i}) ne se ré-ancraient qu'au bouton « Rejeter ». Le point garde la forme de
     son entité (h.s, enregistrée avec le plan) ; quand la géométrie EXACTE de la vue change, l'entité
     est retrouvée par sa forme (droite parallèle la plus proche, cercle de même rayon), le point
     glisse avec elle (même position relative le long de l'arête, ou le centre) et l'index est
     mis à jour. Dérivé de la géométrie : pas d'étape d'annulation. */
  const mepIdxSeen=new WeakMap(); // point → géométrie déjà vue (évite de refaire le suivi à chaque dessin)
  function mepIdxSnap(e){
    return e.t==='L'?{t:'L',x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2,k:e.k}:{t:e.t,cx:e.cx,cy:e.cy,r:e.r};
  }
  function mepIdxSame(e,s){
    if(!e||!s||(e.t==='L')!==(s.t==='L'))return false;
    const n=(a,b)=>Math.abs(a-b)<1e-6;
    return e.t==='L'?n(e.x1,s.x1)&&n(e.y1,s.y1)&&n(e.x2,s.x2)&&n(e.y2,s.y2):n(e.cx,s.cx)&&n(e.cy,s.cy)&&n(e.r,s.r);
  }
  function mepIdxFollow(v,q){
    const h=q&&q.hint;
    if(!v||!h||(h.t!=='seg'&&h.t!=='ctr')||typeof h.i!=='number')return false;
    const g=mepGeoOf(v);if(!mepGeoExact(g)||mepIdxSeen.get(q)===g)return false;
    mepIdxSeen.set(q,g);
    const cur=g.els[h.i];
    if(!h.s){ // première rencontre : la forme de l'entité qui passe bien par le point
      if(cur&&(cur.t==='L'?h.t==='seg'&&mepSegDist(q,cur)<0.6:(cur.t==='C'||cur.t==='A')&&Math.hypot(cur.cx-q.x,cur.cy-q.y)<0.6))h.s=mepIdxSnap(cur);
      else if(h.t==='ctr'){ // index périmé : le cercle centré sur le point
        const k=g.els.findIndex(c=>(c.t==='C'||c.t==='A')&&Math.hypot(c.cx-q.x,c.cy-q.y)<0.05);
        if(k>=0){h.i=k;h.s=mepIdxSnap(g.els[k]);}
      }
      return false;
    }
    if(mepIdxSame(cur,h.s))return false;
    const s=h.s;let e=null;
    if(s.t==='L')e=mepAxisTrackLine(g,s,null);
    else{
      let bc=Infinity;
      g.els.forEach(c=>{
        if(c.t!=='C'&&c.t!=='A')return;
        const k=Math.hypot(c.cx-s.cx,c.cy-s.cy)+2*Math.abs(c.r-s.r);
        if(k<bc){bc=k;e=c;}
      });
      if(bc>Math.max(3,s.r))e=null;
    }
    if(!e)return false; // entité disparue : dernière position connue
    if(s.t==='L'){
      const dx=s.x2-s.x1,dy=s.y2-s.y1,L2=dx*dx+dy*dy;
      const f=L2>1e-12?((q.x-s.x1)*dx+(q.y-s.y1)*dy)/L2:0;
      // même sens que l'ancienne arête (le noyau peut l'avoir retournée)
      const rev=Math.hypot(e.x1-s.x1,e.y1-s.y1)+Math.hypot(e.x2-s.x2,e.y2-s.y2)
        >Math.hypot(e.x2-s.x1,e.y2-s.y1)+Math.hypot(e.x1-s.x2,e.y1-s.y2);
      const ax=rev?e.x2:e.x1,ay=rev?e.y2:e.y1,bx=rev?e.x1:e.x2,by=rev?e.y1:e.y2;
      q.x=ax+(bx-ax)*f;q.y=ay+(by-ay)*f;
    }else{q.x=e.cx;q.y=e.cy;}
    h.i=g.els.indexOf(e);h.s=mepIdxSnap(e);
    mepIdxSeen.set(q,g);
    return true;
  }
  function mepDimPtsRefresh(sh,d){
    const v1=mepView(sh,d.vid);if(!v1)return;
    // points accrochés par index d'entité : suivent la géométrie exacte (cote, ordonnées)
    if(d.kind==='ord'){mepIdxFollow(v1,d.o);(d.pts||[]).forEach(q=>mepIdxFollow(v1,q));}
    else{
      const v2=d.vid2?mepView(sh,d.vid2):v1;
      if(mepIdxFollow(v1,d.a)&&d.kind==='len'&&!d.vid2&&d.b){
        // longueur : ses 2 extrémités dessinées sont celles de l'arête retrouvée
        const e=mepEntByHint(v1,d.a.hint);
        if(e&&e.t==='L'){
          const sw=Math.hypot(e.x2-d.a.x,e.y2-d.a.y)<Math.hypot(e.x1-d.a.x,e.y1-d.a.y);
          d.a.x=sw?e.x2:e.x1;d.a.y=sw?e.y2:e.y1;d.b={x:sw?e.x1:e.x2,y:sw?e.y1:e.y2};
        }
      }
      if(d.b&&v2)mepIdxFollow(v2,d.b);
    }
    if(d.kind==='dist'){ // points d'intersection (accrochage imposé) : suivent leurs 2 entités
      mepIntRefresh(v1,d.a);if(d.b)mepIntRefresh(d.vid2?mepView(sh,d.vid2):v1,d.b);
    }
    if(d.kind==='ord'){
      const pr=d.axis==='y'?'h':'v';
      mepPtRefresh(sh,v1,d.o,pr);d.a=d.b=d.o;(d.pts||[]).forEach(q=>mepPtRefresh(sh,v1,q,pr));
      return;
    }
    if(d.kind!=='dist'&&d.kind!=='note')return;
    const pr=d.kind==='dist'?(d.orient==='h'?'v':(d.orient==='v'?'h':null)):null;
    // distance oblique : pas de migration ambiguë, mais les références posées restent suivies
    const ok=q=>!!(q&&(pr||d.kind!=='dist'||q.hint));
    if(ok(d.a))mepPtRefresh(sh,v1,d.a,pr);
    if(d.kind==='dist'&&ok(d.b))mepPtRefresh(sh,d.vid2?mepView(sh,d.vid2):v1,d.b,pr);
  }
  function mepDimWorld(sh,d){
    // ancrages → mm papier
    const v1=mepView(sh,d.vid);
    if(!v1)return null;
    try{mepDimPtsRefresh(sh,d);}catch(e){} // points accrochés aux traits d'axe : suivent l'axe
    // longueur d'un trait d'axe : suit son allongement (2026-10-22-013)
    if(d.kind==='len'&&!d.vid2&&d.a&&d.a.hint&&typeof d.a.hint.i==='string'){
      const e=mepEntByHint(v1,d.a.hint);
      if(e&&e.t==='L'){d.a={x:e.x1,y:e.y1,hint:d.a.hint};d.b={x:e.x2,y:e.y2};}
    }
    const a=mepToSheet(v1,d.a.x,d.a.y);
    let b=a;
    if(d.vid2){
      const v2=mepView(sh,d.vid2);
      if(!v2)return null;
      b=mepToSheet(v2,d.b.x,d.b.y);
    }else b=mepToSheet(v1,d.b?d.b.x:d.a.x,d.b?d.b.y:d.a.y);
    return{a,b,v1,v2:d.vid2?mepView(sh,d.vid2):null};
  }
  // Angle (degrés) entre deux directions, dans [0,180] — même valeur que l'arc dessiné
  // par mepDrawDim (dd normalisé sur (−π,π]). Ne PAS replier à 90° : un angle obtus
  // (p. ex. 120°) doit s'afficher 120°, pas 60°.
  function mepAngleDeg(d1,d2){
    let a=Math.abs((d2-d1)*180/Math.PI)%360;
    if(a>180)a=360-a;
    return a;
  }
  function mepDimMeasure(sh,d){
    // Valeurs en mm MODÈLE : les ancres (d.a/d.b) sont déjà en coordonnées modèle,
    // et les éléments de géométrie le sont aussi. Ne PAS multiplier par view.scale
    // (ce serait des mm papier → cote fausse dès que l'échelle ≠ 1:1).
    const w=mepDimWorld(sh,d);
    if(!w)return 0;
    const o=d.orient||'a';
    const oriented=(A,B)=>o==='h'?Math.abs(B.x-A.x):o==='v'?Math.abs(B.y-A.y):Math.hypot(B.x-A.x,B.y-A.y);
    const modelDist=()=>d.b?oriented(d.a,d.b):0;
    switch(d.kind){
      case 'len':{
        const e=mepEntByHint(w.v1,d.a.hint);
        if(e&&e.t==='L')return oriented({x:e.x1,y:e.y1},{x:e.x2,y:e.y2});
        return modelDist();
      }
      case 'dist':return modelDist();
      case 'rad':{const e=mepEntByHint(w.v1,d.a.hint);return e&&(e.t==='C'||e.t==='A')?e.r:modelDist();}
      case 'dia':{const e=mepEntByHint(w.v1,d.a.hint);return e&&(e.t==='C'||e.t==='A')?2*e.r:2*modelDist();}
      case 'ang':{
        // valeur = secteur dessiné (θ, 180−θ ou rentrant 360−θ selon d.q / d.big)
        const g=mepAngGeom(sh,d);
        if(g)return Math.abs(g.dd)*180/Math.PI;
        const a1=Math.atan2(w.a.y-(w.b?w.b.y:w.a.y),w.a.x-(w.b?w.b.x:w.a.x));
        return Math.abs(a1*180/Math.PI);
      }
      default:return Math.hypot(w.b.x-w.a.x,w.b.y-w.a.y);
    }
  }
  function mepEntByHint(view,hint){
    if(!view||!hint)return null;
    if(typeof hint.i==='string'&&hint.i.indexOf('ax:')===0){ // trait d'axe (2026-10-22-013)
      const sh=mepSheetOfView(view);
      return sh?mepAxisLineByKey(sh,view,hint.i.slice(3)):null;
    }
    const g=mepGeoOf(view);
    return g.els[hint.i]||null;
  }
  function mepHoleFeatureText(f){
    if(!f||f.type!=='hole'||typeof holeNorm!=='function')return '';
    const N=holeNorm(f);
    const fr=v=>mepFmtNum(v,2);
    const sk=(typeof doc!=='undefined'&&doc.sketches)?doc.sketches.find(s=>s.id===f.sketchId):null;
    let A=null;
    try{if(sk&&typeof holeAxis==='function')A=holeAxis(f,sk);}catch(e){A=null;}
    const P=A&&A.pts&&A.pts[0]?A.pts[0]:null;
    const holeDepth=()=>{
      if(N.end==='through'||N.end==='next')return'déb.';
      if(N.end==='upto'){
        if(P&&A&&typeof holePlaneDist==='function'){
          const t=holePlaneDist(f.uptoPlane,P,A.dir);
          if(t!=null&&isFinite(t))return'↧'+fr(t);
        }
        return'↧ face';
      }
      return'↧'+fr(N.depth);
    };
    const threadDepth=()=>{
      const m=f.thread.lenMode||'len';
      const eff=+f._thLen||+f.thread.len||0;
      if(m==='through')return'déb.';
      if(m==='next')return'déb.';
      if(m==='upto'){
        if(P&&A&&typeof holePlaneDist==='function'){
          const t=holePlaneDist(f.thread.uptoPlane,P,A.dir);
          if(t!=null&&isFinite(t))return'↧'+fr(t);
        }
        return'↧ face';
      }
      return'↧'+fr(eff||N.depth);
    };
    const lines=[];
    // V0.24.0 : alésé — l'alésage (fond plat) d'abord : la tolérance se pose après ce 1er Ø
    if(N.kind==='ream'){
      if(N.pilot==='open')return 'Ø'+fr(N.reamD)+' déb.';
      lines.push('Ø'+fr(N.reamD)+' ↧'+fr(N.reamH));
      if(N.pilot!=='none')lines.push('Ø'+fr(N.d)+' '+holeDepth());
      return lines.join('\n');
    }
    if(f.thread&&f.thread.size){
      lines.push(holeThreadLabel(f.thread)+' '+threadDepth());
      lines.push('Ø'+fr(N.d)+' '+holeDepth());
    }else{
      lines.push('Ø'+fr(N.d)+' '+holeDepth());
    }
    if(N.kind==='cbore')lines.push('Lamage Ø'+fr(N.cbD)+' ↧'+fr(N.cbH));
    if(N.kind==='csink')lines.push('Fraisure Ø'+fr(N.csD)+' x '+fr(N.csA)+'°');
    return lines.join('\n');
  }
  /* V0.24.0 : tolérance AUTOMATIQUE d'une cotation de perçage — celle de l'alésage de la
     fonction (« Ø6 H7 (+0,012 / 0) »), suivie en direct ; une tolérance posée à la main
     (ou retirée : d.tolManual) l'emporte. */
  function mepHoleAutoTol(d){
    if(!d||d.kind!=='hole'||!d.holeFid||typeof doc==='undefined')return null;
    const f=(doc.features||[]).find(x=>x.id===d.holeFid);
    return (f&&f.type==='hole'&&f.kind==='ream'&&f.reamTol)?{m:'cls',cls:String(f.reamTol)}:null;
  }
  function mepHoleTol(d){return d.tol||(d.tolManual?null:mepHoleAutoTol(d));}
  function mepHoleAt(sh,vid,e,i){
    if(!e||e.t!=='C')return null;
    const v=mepView(sh,vid);if(!v)return null;
    if(typeof holeAxis!=='function'||typeof holeNorm!=='function'||typeof doc==='undefined')return null;
    const b=mepBasisOf(v),u=b.u,vv=b.v,dir=b.dir;
    let best=null;
    (doc.features||[]).forEach(f=>{
      if(!f||f.type!=='hole'||f.visible===false)return;
      const sk=(doc.sketches||[]).find(s=>s.id===f.sketchId);if(!sk)return;
      let A=null,N=null;
      try{A=holeAxis(f,sk);N=holeNorm(f);}catch(err){return;}
      if(!A||!A.pts||!A.pts.length||!A.dir)return;
      const ad=[A.dir.x,A.dir.y,A.dir.z];
      if(Math.abs(mepDot(ad,dir))<0.999)return;
      const rs=[N.d/2];
      if(N.kind==='ream')rs.push(N.reamD/2);
      if(N.kind==='cbore')rs.push(N.cbD/2);
      if(N.kind==='csink')rs.push(N.csD/2);
      if(f.thread&&f.thread.model&&typeof isoHoleThread==='function'){
        const th=isoHoleThread(f.thread.size,f.thread.p,f.thread.clear);
        if(th)rs.push(th.D/2,th.D1/2+th.c);
      }
      const rTol=Math.max(0.18,e.r*0.03);
      if(!rs.some(r=>Math.abs(e.r-r)<=rTol))return;
      A.pts.forEach(P=>{
        const wp=[P.x,P.y,P.z];
        const lx=mepDot(wp,u),ly=mepDot(wp,vv);
        const dc=Math.hypot(lx-e.cx,ly-e.cy);
        if(dc>0.4)return;
        const dr=Math.min.apply(null,rs.map(r=>Math.abs(e.r-r)));
        const score=dc+dr*0.5;
        if(!best||score<best.score)best={f:f,N:N,A:A,P:P,view:v,i:i,score:score};
      });
    });
    return best;
  }
  // famille d'un perçage : la fonction elle-même, ou sa répétition (base + instances) à
  // spécification égale — les instances d'une répétition sont des fonctions Perçage à part
  function mepHoleFam(f){
    if(!f)return '';
    const rp=(doc.features||[]).find(r=>r&&r.type==='repeat'&&(f.repeatId===r.id||(r.base||[]).indexOf(f.id)>=0));
    return rp?'rp:'+rp.id+'|'+mepHoleFeatureText(f):f.id;
  }
  // nombre de trous de la famille vus de bout dans la vue (un par axe, cercles de lamage /
  // fraisure / filetage confondus) ; mémorisé par géométrie de vue
  const mepHoleNCache=new WeakMap();
  function mepHoleCount(sh,v,fam){
    let g=null;try{g=mepGeoOf(v);}catch(e){return 0;}
    if(!g||!g.els)return 0;
    let C=mepHoleNCache.get(g);if(!C){C=new Map();mepHoleNCache.set(g,C);}
    if(C.has(fam))return C.get(fam);
    const pts=new Set();
    g.els.forEach((e,i)=>{
      if(!e||e.t!=='C')return;
      let m=null;try{m=mepHoleAt(sh,v.id,e,i);}catch(err){}
      if(m&&mepHoleFam(m.f)===fam)pts.add([m.P.x,m.P.y,m.P.z].map(q=>(+q).toFixed(3)).join(','));
    });
    C.set(fam,pts.size);
    return pts.size;
  }
  function mepHoleDraft(sh,vid,e,i,lx,ly){
    const m=mepHoleAt(sh,vid,e,i);
    if(!m)return null;
    const hn=mepHoleCount(sh,m.view,mepHoleFam(m.f));
    const b={x:e.cx+e.r*0.9,y:e.cy-e.r*0.9};
    if(lx!=null&&ly!=null)b={x:lx,y:ly};
    return{kind:'hole',vid:vid,vid2:null,a:{x:e.cx,y:e.cy,hint:{t:'ctr',i:i}},
      b:b,off:0,holeFid:m.f.id,holeText:mepHoleFeatureText(m.f),holeN:hn>1?hn:undefined,__ghost:true,tol:null};
  }
  function mepAxisScale(v){return Math.max(1e-9,(v&&+v.scale>0)?+v.scale:1);}
  function mepAxisKey(h){const id=(h&&h.fid||'')+'|'+(h&&h.pid||'');return id!=='|'?id:(+h.x).toFixed(3)+','+(+h.y).toFixed(3);}
  function mepAxisSameDia(a,b){const tol=Math.max(0.05,Math.max(a.r,b.r)*0.05);return Math.abs(a.r-b.r)<=tol;}
  function mepAxisFitCircle(pts){
    if(!pts||pts.length<3)return null;
    let n=0,sx=0,sy=0,sxx=0,syy=0,sxy=0,sx3=0,sy3=0,s2=0;
    pts.forEach(p=>{
      const x=+p.x,y=+p.y;if(!Number.isFinite(x)||!Number.isFinite(y))return;
      n++;sx+=x;sy+=y;sxx+=x*x;syy+=y*y;sxy+=x*y;
      sx3+=x*(x*x+y*y);sy3+=y*(x*x+y*y);s2+=x*x+y*y;
    });
    if(n<3)return null;
    const m=[[sxx,sxy,sx],[sxy,syy,sy],[sx,sy,n]];
    const det=a=>a[0][0]*(a[1][1]*a[2][2]-a[1][2]*a[2][1])
      -a[0][1]*(a[1][0]*a[2][2]-a[1][2]*a[2][0])
      +a[0][2]*(a[1][0]*a[2][1]-a[1][1]*a[2][0]);
    const D=det(m);if(Math.abs(D)<1e-9)return null;
    const col=(i,val)=>m.map((row,r)=>row.map((x,c)=>c===i?val[r]:x));
    const b=[-sx3,-sy3,-s2];
    const A=det(col(0,b))/D,B=det(col(1,b))/D,C=det(col(2,b))/D;
    const cx=-A/2,cy=-B/2,r2=cx*cx+cy*cy-C;
    if(!(r2>1e-9))return null;
    return{cx,cy,r:Math.sqrt(r2)};
  }
  function mepAxisCircle3(a,b,c){
    const ax=+a.x,ay=+a.y,bx=+b.x,by=+b.y,cx=+c.x,cy=+c.y;
    const d=2*(ax*(by-cy)+bx*(cy-ay)+cx*(ay-by));
    if(Math.abs(d)<1e-9)return null;
    const a2=ax*ax+ay*ay,b2=bx*bx+by*by,c2=cx*cx+cy*cy;
    const ux=(a2*(by-cy)+b2*(cy-ay)+c2*(ay-by))/d;
    const uy=(a2*(cx-bx)+b2*(ax-cx)+c2*(bx-ax))/d;
    const r=Math.hypot(ax-ux,ay-uy);
    return r>0.05?{cx:ux,cy:uy,r}:null;
  }
  function mepAxisResidual(hs,C){
    let m=0;(hs||[]).forEach(h=>{m=Math.max(m,Math.abs(Math.hypot(h.x-C.cx,h.y-C.cy)-C.r));});
    return m;
  }
  function mepAxisCollinear(hs,tol){
    if(!hs||hs.length<2)return false;
    let A=hs[0],B=hs[hs.length-1],best=-1;
    for(let i=0;i<hs.length;i++)for(let j=i+1;j<hs.length;j++){
      const d=(hs[i].x-hs[j].x)**2+(hs[i].y-hs[j].y)**2;
      if(d>best){best=d;A=hs[i];B=hs[j];}
    }
    const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy);
    if(L<1e-9)return false;
    return hs.every(h=>Math.abs((h.x-A.x)*dy-(h.y-A.y)*dx)/L<=tol);
  }
  function mepAxisEqualSpacing(hs,C){
    const n=hs.length;if(n<3)return false;
    const a=hs.map(h=>Math.atan2(h.y-C.cy,h.x-C.cx)).sort((x,y)=>x-y);
    const gap=[];
    for(let i=0;i<n;i++){
      let g=a[(i+1)%n]-a[i];
      if(i===n-1)g+=2*Math.PI;
      gap.push(g);
    }
    const ideal=2*Math.PI/n;
    return gap.every(g=>Math.abs(g-ideal)<=Math.max(0.12*ideal,0.08));
  }
  function mepAxisPitchGroups(holes,v){
    const hs=(holes||[]).filter(h=>h&&Number.isFinite(+h.x)&&Number.isFinite(+h.y));
    if(hs.length<3)return[];
    const tol=Math.max(0.05,MEP_AXIS.tol/mepAxisScale(v));
    const cand=[];
    for(let i=0;i<hs.length;i++)for(let j=i+1;j<hs.length;j++)for(let k=j+1;k<hs.length;k++){
      if(!mepAxisSameDia(hs[i],hs[j])||!mepAxisSameDia(hs[i],hs[k]))continue;
      const C=mepAxisCircle3(hs[i],hs[j],hs[k]);if(!C)continue;
      const pts=hs.filter(h=>mepAxisSameDia(h,hs[i])
        &&Math.abs(Math.hypot(h.x-C.cx,h.y-C.cy)-C.r)<=tol);
      if(pts.length<MEP_AXIS.minPitch||!mepAxisEqualSpacing(pts,C))continue;
      cand.push({C,pts});
    }
    cand.sort((a,b)=>b.pts.length-a.pts.length||a.C.r-b.C.r);
    const used=new Set(),out=[];
    cand.forEach(c=>{
      if(c.pts.some(h=>used.has(mepAxisKey(h))))return;
      c.pts.forEach(h=>used.add(mepAxisKey(h)));
      out.push(c);
    });
    return out;
  }
  function mepAxisLineGroups(holes,v){
    const hs=(holes||[]).filter(h=>h&&Number.isFinite(+h.x)&&Number.isFinite(+h.y));
    if(hs.length<MEP_AXIS.minAlign)return[];
    const tol=Math.max(0.05,MEP_AXIS.tol/mepAxisScale(v));
    const cand=[];
    for(let i=0;i<hs.length;i++)for(let j=i+1;j<hs.length;j++){
      const dx=hs[j].x-hs[i].x,dy=hs[j].y-hs[i].y,L=Math.hypot(dx,dy);
      if(L<1e-9)continue;
      const ux=dx/L,uy=dy/L;
      const pts=hs.filter(h=>Math.abs((h.x-hs[i].x)*uy-(h.y-hs[i].y)*ux)<=tol);
      if(pts.length>=MEP_AXIS.minAlign)cand.push({pts,ux,uy});
    }
    cand.sort((a,b)=>b.pts.length-a.pts.length);
    const used=new Set(),out=[];
    cand.forEach(c=>{
      if(c.pts.some(h=>used.has(mepAxisKey(h))))return;
      c.pts.forEach(h=>used.add(mepAxisKey(h)));
      out.push(c);
    });
    return out;
  }
  function mepAxisCrossPrims(x,y,r,v,cls){
    const over=MEP_AXIS.overrun/mepAxisScale(v);
    const L=Math.max(r+over,1.5/mepAxisScale(v));
    const k=cls||'mepAxisCross';
    return[{t:'L',x1:x-L,y1:y,x2:x+L,y2:y,cls:k},
      {t:'L',x1:x,y1:y-L,x2:x,y2:y+L,cls:k}];
  }
  function mepAxisCenterCross(x,y,L,cls){
    const k=cls||'mepAxis';
    return[{t:'L',x1:x-L,y1:y,x2:x+L,y2:y,cls:k},
      {t:'L',x1:x,y1:y-L,x2:x,y2:y+L,cls:k}];
  }
  function mepAxisSpanBox(P,d,bb){
    let t0=-1e9,t1=1e9;
    const axes=[[d[0],P.x,bb.minx,bb.maxx],[d[1],P.y,bb.miny,bb.maxy]];
    for(const [dd,p,lo,hi] of axes){
      if(Math.abs(dd)<1e-9){if(p<lo||p>hi)return null;continue;}
      let a=(lo-p)/dd,b=(hi-p)/dd;
      if(a>b){const t=a;a=b;b=t;}
      t0=Math.max(t0,a);t1=Math.min(t1,b);
    }
    return t1>t0?[t0,t1]:null;
  }
  function mepAxisSideLine(h,v,g){
    const dx=h.dir2?h.dir2[0]:0,dy=h.dir2?h.dir2[1]:0,L=Math.hypot(dx,dy);
    if(L<0.5)return[];
    const ux=dx/L,uy=dy/L,P={x:h.x,y:h.y};
    const over=MEP_AXIS.overrun/mepAxisScale(v);
    if(h.N&&h.N.end==='blind'){
      const len=Math.max(0.5,+h.N.depth||0);
      return[{t:'L',x1:P.x,y1:P.y,x2:P.x+ux*(len+over),y2:P.y+uy*(len+over),cls:'mepAxis'}];
    }
    const bb=g?mepAABBOf(g):null;
    const sp=bb?mepAxisSpanBox(P,[ux,uy],bb):null;
    if(!sp)return[];
    const t0=sp[0]-over,t1=sp[1]+over;
    if(t1-t0<1)return[];
    return[{t:'L',x1:P.x+ux*t0,y1:P.y+uy*t0,x2:P.x+ux*t1,y2:P.y+uy*t1,cls:'mepAxis'}];
  }
  function mepAxisHoleOfFeature(f,N,A,P,b){
    const d=mepNorm(A.dir);
    const r=Math.max(N.d/2,N.kind==='cbore'?N.cbD/2:0,N.kind==='csink'?N.csD/2:0);
    return{fid:f.id,pid:P.id,f,N,A,P,
      x:mepDot([P.x,P.y,P.z],b.u),y:mepDot([P.x,P.y,P.z],b.v),r,
      facing:mepDot(d,b.dir),dir2:[mepDot(d,b.u),mepDot(d,b.v)]};
  }
  function mepAxisFeatureHoles(sh,v){
    const b=mepBasisOf(v),out=[];
    (doc.features||[]).forEach(f=>{
      if(!f||f.type!=='hole'||f.visible===false)return;
      const sk=(doc.sketches||[]).find(s=>s.id===f.sketchId);if(!sk)return;
      let A=null,N=null;
      try{A=holeAxis(f,sk);N=holeNorm(f);}catch(e){return;}
      if(!A||!A.pts||!A.pts.length||!A.dir)return;
      A.pts.forEach(P=>out.push(mepAxisHoleOfFeature(f,N,A,P,b)));
    });
    return out;
  }
  function mepAxisFaceHoles(sh,v){
    const g=mepGeoOf(v),b=mepBasisOf(v),out=[],seen=new Set();
    g.els.forEach((e,i)=>{
      if(e.t!=='C')return;
      const m=mepHoleAt(sh,v.id,e,i);if(!m)return;
      const key=m.f.id+'|'+m.P.id;
      if(seen.has(key))return;
      seen.add(key);
      out.push(mepAxisHoleOfFeature(m.f,m.N,m.A,m.P,b));
    });
    return out;
  }
  function mepAxisPitchPrims(C,hs,v){
    const out=[{t:'C',cx:C.cx,cy:C.cy,r:C.r,cls:'mepAxis'}];
    const over=MEP_AXIS.overrun/mepAxisScale(v);
    (hs||[]).forEach(h=>{
      const dx=h.x-C.cx,dy=h.y-C.cy,L=Math.hypot(dx,dy)||1;
      const end=C.r+h.r+over;
      out.push({t:'L',x1:C.cx,y1:C.cy,x2:C.cx+dx/L*end,y2:C.cy+dy/L*end,cls:'mepAxis'});
    });
    out.push(...mepAxisCenterCross(C.cx,C.cy,6/mepAxisScale(v),'mepAxis'));
    return out;
  }
  function mepAxisAlignPrims(hs,v,marks){
    if(!hs||hs.length<2)return[];
    let A=hs[0],B=hs[hs.length-1],best=-1;
    for(let i=0;i<hs.length;i++)for(let j=i+1;j<hs.length;j++){
      const d=(hs[i].x-hs[j].x)**2+(hs[i].y-hs[j].y)**2;
      if(d>best){best=d;A=hs[i];B=hs[j];}
    }
    const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy);
    if(L<1e-9)return[];
    const ux=dx/L,uy=dy/L,over=MEP_AXIS.overrun/mepAxisScale(v);
    const ts=hs.map(h=>(h.x-A.x)*ux+(h.y-A.y)*uy);
    const t0=Math.min(...ts)-over,t1=Math.max(...ts)+over;
    const out=[{t:'L',x1:A.x+ux*t0,y1:A.y+uy*t0,x2:A.x+ux*t1,y2:A.y+uy*t1,cls:'mepAxis'}];
    if(marks!==false)hs.forEach(h=>out.push(...mepAxisCrossPrims(h.x,h.y,h.r,v,'mepAxisCross')));
    return out;
  }
  function mepAxisRefGeom(sh,v,ref){
    if(!ref)return null;
    const f=(doc.features||[]).find(x=>x&&x.id===ref.fid);if(!f)return null;
    const sk=(doc.sketches||[]).find(s=>s.id===f.sketchId);if(!sk)return null;
    const b=mepBasisOf(v);
    let A=null,N=null;
    try{A=holeAxis(f,sk);N=holeNorm(f);}catch(e){return null;}
    if(!A||!A.pts||!A.dir)return null;
    const P=A.pts.find(p=>p.id===ref.pid);if(!P)return null;
    return mepAxisHoleOfFeature(f,N,A,P,b);
  }
  function mepAxisManualGeom(sh,v,ann){
    if(!ann)return[];
    if(ann.kind==='free'&&ann.sym&&ann.a&&ann.b)mepAxisSymMigrate(v,ann); // ancien axe de symétrie figé
    if(ann.kind==='free'){
      if(!ann.a||!ann.b)return[];
      return[{t:'L',x1:ann.a.x,y1:ann.a.y,x2:ann.b.x,y2:ann.b.y,cls:'mepAxis'}];
    }
    if(ann.kind==='sym'){ // axe de symétrie ASSOCIATIF : suit ses 2 droites
      const G=mepAxisSymTrack(v,ann);
      return G?[{t:'L',x1:G.a.x,y1:G.a.y,x2:G.b.x,y2:G.b.y,cls:'mepAxis'}]:[];
    }
    if(ann.kind==='hole'){
      const h=mepAxisRefGeom(sh,v,ann.ref);if(!h)return[];
      if(Math.abs(h.facing)>0.999)return mepAxisCrossPrims(h.x,h.y,h.r,v,'mepAxisCross');
      if(Math.abs(h.facing)<0.02)return mepAxisSideLine(h,v,mepGeoOf(v));
      return mepAxisCrossPrims(h.x,h.y,h.r,v,'mepAxisCross');
    }
    const hs=(ann.refs||[]).map(r=>mepAxisRefGeom(sh,v,r)).filter(Boolean);
    if(ann.kind==='align')return mepAxisAlignPrims(hs,v,true);
    if(ann.kind==='pitch'){
      if(hs.length<3)return[];
      const C=mepAxisFitCircle(hs);if(!C)return[];
      return mepAxisPitchPrims(C,hs,v);
    }
    return[];
  }
  /* 2026-10-22-012 : AXES DES CYLINDRES D'UN STEP (« les traits d'axes doivent
     être possibles sur un cylindre venant d'un STEP ») — un import n'a pas de
     fonction Perçage : les axes viennent des faces cylindriques de son solide
     exact (importGeom.brep). Faces coaxiales regroupées (tronçons, demi-
     cylindres) ; un groupe qui couvre moins d'un demi-tour (congé) est ignoré.
     Vue en bout : croix de centre ; vue de côté : trait d'axe sur la longueur. */
  function mepExactOf(bd){
    if(!bd)return null;
    if(bd.shape)return bd.shape;
    try{if(bd.kind==='import'&&typeof importGeom!=='undefined'){const e=importGeom.get(bd.ref||bd.id);if(e&&e.brep)return e.brep;}}catch(e){}
    return null;
  }
  const mepCylCache=new Map(); // id d'import → {shape, list}
  function mepShapeCyls(bd){
    const sh=mepExactOf(bd);if(!sh||typeof occt==='undefined'||!occt)return[];
    const k=bd.ref||bd.id,c=mepCylCache.get(k);
    if(c&&c.shape===sh)return c.list;
    const groups=new Map();
    let ex=null;
    try{ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);}catch(e){return[];}
    const T=occt.GeomAbs_SurfaceType;
    while(ex.More()){
      let ad=null;
      try{
        const f=occt.TopoDS.Face_1(ex.Current());
        ad=new occt.BRepAdaptor_Surface_2(f,true);
        if(ad.GetType()===T.GeomAbs_Cylinder){
          const cy=ad.Cylinder(),ax=cy.Axis(),L=ax.Location(),Dd=ax.Direction();
          let d=[Dd.X(),Dd.Y(),Dd.Z()];
          const sgn=Math.abs(d[0])>1e-6?Math.sign(d[0]):(Math.abs(d[1])>1e-6?Math.sign(d[1]):(Math.sign(d[2])||1));
          const flip=sgn<0;if(flip)d=d.map(x=>-x);
          const l=[L.X(),L.Y(),L.Z()],ld=mepDot(l,d);
          const o=[l[0]-d[0]*ld,l[1]-d[1]*ld,l[2]-d[2]*ld]; // pied de l'axe (plan normal passant par 0)
          const v0=ad.FirstVParameter(),v1=ad.LastVParameter();
          const t0=ld+(flip?-v1:v0),t1=ld+(flip?-v0:v1);
          const axk=o.map(x=>x.toFixed(2)).join(',')+'|'+d.map(x=>x.toFixed(3)).join(',');
          const key=axk+'|'+cy.Radius().toFixed(2); // par axe ET rayon : moyeu, alésage, bouts séparés
          let g=groups.get(key);
          if(!g){g={o,d,axk,t0:Math.min(t0,t1),t1:Math.max(t0,t1),r:0,u:0};groups.set(key,g);}
          g.t0=Math.min(g.t0,t0,t1);g.t1=Math.max(g.t1,t0,t1);
          g.r=Math.max(g.r,cy.Radius());g.u+=Math.abs(ad.LastUParameter()-ad.FirstUParameter());
        }
      }catch(e){}
      try{if(ad)ad.delete();}catch(e){}
      ex.Next();
    }
    try{ex.delete();}catch(e){}
    // un rayon qui ne fait pas un demi-tour (congé, arc de contour) ne porte pas d'axe ;
    // les rayons retenus d'un même axe fusionnent : un trait, une croix (plus grand rayon)
    const byAx=new Map();
    [...groups.values()].filter(g=>g.u>=Math.PI*0.95&&g.t1-g.t0>1e-3).forEach(g=>{
      const a=byAx.get(g.axk);
      if(!a)byAx.set(g.axk,{o:g.o,d:g.d,t0:g.t0,t1:g.t1,r:g.r,u:g.u,rs:[g.r]});
      else{a.t0=Math.min(a.t0,g.t0);a.t1=Math.max(a.t1,g.t1);a.r=Math.max(a.r,g.r);a.rs.push(g.r);}
    });
    const list=[...byAx.values()];
    mepCylCache.set(k,{shape:sh,list});
    return list;
  }
  /* Deux traits parallèles d'une vue = génératrices d'un même cylindre (axe dans le plan de
     la vue, à mi-distance, rayon = demi-écart) → la distance est un diamètre : « Ø ». */
  function mepCylDiaBetween(v,e1,e2){
    if(!v||!e1||!e2||e1.t!=='L'||e2.t!=='L'||mepOblOf(v)||mepPerspOf(v))return false;
    const b=mepBasisOf(v),tol=0.01;
    const l1=Math.hypot(e1.x2-e1.x1,e1.y2-e1.y1);if(l1<1e-9)return false;
    const ux=(e1.x2-e1.x1)/l1,uy=(e1.y2-e1.y1)/l1;
    const off=(e,ox,oy)=>(e.x1-ox)*-uy+(e.y1-oy)*ux; // distance signée à la droite (o, u)
    const gap=Math.abs(off(e2,e1.x1,e1.y1));if(gap<1e-6)return false;
    return mepMeshesOf(v).some(bd=>mepShapeCyls(bd).some(g=>{
      if(Math.abs(mepDot(g.d,b.dir))>0.02)return false;
      let dx=mepDot(g.d,b.u),dy=mepDot(g.d,b.v);const L=Math.hypot(dx,dy);if(L<1e-9)return false;
      dx/=L;dy/=L;
      if(Math.abs(dx*uy-dy*ux)>1e-3)return false; // axe parallèle aux traits
      const ox=mepDot(g.o,b.u),oy=mepDot(g.o,b.v);
      const s1=off(e1,ox,oy),s2=off(e2,ox,oy);
      return (g.rs||[g.r]).some(r=>Math.abs(gap-2*r)<tol&&Math.abs(Math.abs(s1)-r)<tol&&Math.abs(Math.abs(s2)-r)<tol&&s1*s2<0);
    }));
  }
  /* « Même une droite issue de la projection d'un cylindre doit avoir un Ø » : une mesure A→B
     (repère de la vue) perpendiculaire à l'axe d'un cylindre du plan de vue, centrée sur cet
     axe, dans sa longueur, et de longueur 2R est un diamètre — arête du cercle d'extrémité vu
     de profil, distance entre génératrices, points pris de part et d'autre. */
  function mepCylDiaSeg(v,A,B){
    if(!v||!A||!B||mepOblOf(v)||mepPerspOf(v))return false;
    const len=Math.hypot(B.x-A.x,B.y-A.y);if(len<1e-6)return false;
    const b=mepBasisOf(v),tol=0.01,mx=(A.x+B.x)/2,my=(A.y+B.y)/2;
    return mepMeshesOf(v).some(bd=>mepShapeCyls(bd).some(g=>{
      if(Math.abs(mepDot(g.d,b.dir))>0.02)return false;
      let dx=mepDot(g.d,b.u),dy=mepDot(g.d,b.v);const L=Math.hypot(dx,dy);if(L<1e-9)return false;
      dx/=L;dy/=L;
      if(Math.abs(((B.x-A.x)*dx+(B.y-A.y)*dy)/len)>1e-3)return false; // ⟂ à l'axe
      const ox=mepDot(g.o,b.u),oy=mepDot(g.o,b.v);
      if(Math.abs((mx-ox)*-dy+(my-oy)*dx)>tol)return false; // milieu sur l'axe
      const t=((mx-ox)*dx+(my-oy)*dy)/L; // abscisse le long de l'axe (unités modèle)
      if(t<g.t0-tol||t>g.t1+tol)return false;
      return (g.rs||[g.r]).some(r=>Math.abs(len-2*r)<tol);
    }));
  }
  // cote linéaire posée : Ø automatique si elle mesure un diamètre de cylindre
  function mepDimAutoDia(sh,d){
    if(!d||d.dsym||d.txt||(d.kind!=='len'&&d.kind!=='dist')||d.vid2&&d.vid2!==d.vid)return;
    const v=mepView(sh,d.vid);if(!v)return;
    let A=d.a,B=d.b;
    if(d.kind==='len'&&d.a&&d.a.hint){const e=mepEntByHint(v,d.a.hint);if(e&&e.t==='L'){A={x:e.x1,y:e.y1};B={x:e.x2,y:e.y2};}}
    if(!A||!B)return;
    const o=d.orient||'a';
    if(o==='h')B={x:B.x,y:A.y};else if(o==='v')B={x:A.x,y:B.y};
    try{if(mepCylDiaSeg(v,A,B))d.dsym='Ø';}catch(e){}
  }
  function mepAxisCylPrims(sh,v){
    const out=[],b=mepBasisOf(v),over=MEP_AXIS.overrun/mepAxisScale(v);
    mepMeshesOf(v).forEach(bd=>{
      if(bd.kind!=='import')return; // corps modélisés : axes des fonctions Perçage
      mepShapeCyls(bd).forEach(g=>{
        const facing=mepDot(g.d,b.dir);
        const P=t=>[g.o[0]+g.d[0]*t,g.o[1]+g.d[1]*t,g.o[2]+g.d[2]*t];
        if(Math.abs(facing)>0.999){
          const c=P(g.t0);out.push(...mepAxisCrossPrims(mepDot(c,b.u),mepDot(c,b.v),g.r,v,'mepAxisCross'));
        }else if(Math.abs(facing)<0.02){
          const A=P(g.t0),B=P(g.t1);
          const ax=mepDot(A,b.u),ay=mepDot(A,b.v),bx=mepDot(B,b.u),by=mepDot(B,b.v);
          const L=Math.hypot(bx-ax,by-ay);if(L<1e-6)return;
          const ux=(bx-ax)/L,uy=(by-ay)/L;
          out.push({t:'L',x1:ax-ux*over,y1:ay-uy*over,x2:bx+ux*over,y2:by+uy*over,cls:'mepAxis'});
        }
      });
    });
    return out;
  }
  function mepAxisAutoGeom(sh,v){
    const out=[];
    if(!v||(!v.autoAxes&&!v.autoPitch)||mepOblOf(v)||mepPerspOf(v))return out;
    const manual=new Set();
    (v.axes||[]).forEach(a=>{
      const rs=a&&a.kind==='hole'?[a.ref]:(a&&a.refs)||[];
      rs.forEach(r=>{if(r)manual.add((r.fid||'')+'|'+(r.pid||''));});
    });
    const face=mepAxisFaceHoles(sh,v).filter(h=>!manual.has(mepAxisKey(h)));
    const inPitch=new Set();
    if(v.autoPitch){
      mepAxisPitchGroups(face,v).forEach(g=>{
        g.pts.forEach(h=>inPitch.add(mepAxisKey(h)));
        out.push(...mepAxisPitchPrims(g.C,g.pts,v));
      });
    }
    if(v.autoAxes){
      face.forEach(h=>{
        if(!inPitch.has(mepAxisKey(h)))out.push(...mepAxisCrossPrims(h.x,h.y,h.r,v,'mepAxisCross'));
      });
      const rest=face.filter(h=>!inPitch.has(mepAxisKey(h)));
      mepAxisLineGroups(rest,v).forEach(g=>out.push(...mepAxisAlignPrims(g.pts,v,false)));
      const g=mepGeoOf(v);
      mepAxisFeatureHoles(sh,v).forEach(h=>{
        if(!manual.has(mepAxisKey(h))&&Math.abs(h.facing)<0.02)out.push(...mepAxisSideLine(h,v,g));
      });
      try{out.push(...mepAxisCylPrims(sh,v));}catch(e){} // 2026-10-22-012 : cylindres d'un STEP
    }
    return out;
  }
  /* 2026-10-22-013 : TOUS LES TRAITS D'AXE D'UNE VUE (auto + manuels), chacun
     avec une clé stable « ak » : « m<id>.<n> » pour un axe manuel, « a<géométrie> »
     pour un axe automatique. v.axExt[ak]=[e1,e2] allonge (ou raccourcit) le trait
     à ses deux bouts (mm modèle) — « étirer n'importe quel trait d'axe créé ».
     Les extrémités servent à l'accrochage (flèches de coupe, esquisse) et les
     traits aux cotes (hint {t:'seg',i:'ax:<ak>'}). bx1..by2 = trait d'origine. */
  const mepAxLinesCache=new Map(); // vue → {gen, list}
  var mepAxGen=0;
  function mepAxisLines(sh,v,autoTest){
    if(!v)return[];
    const c=mepAxLinesCache.get(v),geo=mepGeoOf(v);
    if(!autoTest&&c&&c.gen===mepAxGen&&c.geo===geo)return c.list;
    const out=[],ext=v.axExt||{};
    const add=(p,ak,ann)=>{
      const q=Object.assign({},p,{ak,ann:ann||null});
      if(p.t==='L'){
        q.bx1=p.x1;q.by1=p.y1;q.bx2=p.x2;q.by2=p.y2;
        const e=ext[ak],L=Math.hypot(p.x2-p.x1,p.y2-p.y1);
        if(e&&L>1e-9&&!(ann&&ann.kind==='free')){
          const ux=(p.x2-p.x1)/L,uy=(p.y2-p.y1)/L,e1=+e[0]||0,e2=+e[1]||0;
          q.x1=p.x1-ux*e1;q.y1=p.y1-uy*e1;q.x2=p.x2+ux*e2;q.y2=p.y2+uy*e2;
          // une croix de centre allongée devient un vrai trait d'axe : fin, mixte (ISO 128-2 04.1)
          if(e1>1e-6||e2>1e-6)q.cls='mepAxis';
        }
      }
      out.push(q);
    };
    const r2=x=>(+x).toFixed(2);
    let auto=[];
    try{auto=autoTest||mepAxisAutoGeom(sh,v);}catch(e){}
    const seen=new Map();
    auto.forEach(p=>{
      let k='a'+(p.t==='L'?[p.x1,p.y1,p.x2,p.y2]:[p.cx,p.cy,p.r]).map(r2).join(',');
      const n=seen.get(k)||0;seen.set(k,n+1);if(n)k+='#'+n;
      add(p,k,null);
    });
    (v.axes||[]).forEach(ann=>{
      let ps=[];
      try{ps=mepAxisManualGeom(sh,v,ann);}catch(e){}
      ps.forEach((p,i)=>add(p,'m'+ann.id+'.'+i,ann));
    });
    if(!autoTest)mepAxLinesCache.set(v,{gen:mepAxGen,geo,list:out});
    return out;
  }
  function mepAxisLineByKey(sh,v,ak){
    return mepAxisLines(sh,v).find(p=>p.ak===ak)||null;
  }
  function mepSheetOfView(v){
    try{return (doc.mep.sheets||[]).find(s=>s.views.indexOf(v)>=0)||mepSheet();}catch(e){return null;}
  }
  function mepAxisAt(sh,sx,sy){
    const tol=5/mepSt.zoom;
    let best=null,bd=tol;
    sh.views.forEach(v=>{
      mepAxisLines(sh,v).forEach(p=>{
        let d=1e9,end=null;
        if(p.t==='L'){
          const ax=v.x+p.x1*v.scale,ay=v.y+p.y1*v.scale;
          const bx=v.x+p.x2*v.scale,by=v.y+p.y2*v.scale;
          const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;
          const t=L2>1e-12?Math.max(0,Math.min(1,((sx-ax)*dx+(sy-ay)*dy)/L2)):0;
          d=Math.hypot(sx-(ax+dx*t),sy-(ay+dy*t));
          const d1=Math.hypot(sx-ax,sy-ay),d2=Math.hypot(sx-bx,sy-by);
          if(Math.min(d1,d2)<=6/(mepSt.zoom||1))end=d1<=d2?1:2;
        }else if(p.t==='C'){
          const cx=v.x+p.cx*v.scale,cy=v.y+p.cy*v.scale;
          d=Math.abs(Math.hypot(sx-cx,sy-cy)-p.r*v.scale);
        }
        if(end)d=Math.hypot(sx-(end===1?v.x+p.x1*v.scale:v.x+p.x2*v.scale),sy-(end===1?v.y+p.y1*v.scale:v.y+p.y2*v.scale))-tol; // une extrémité l'emporte toujours sur un trait qui passe (croix sur un alignement)
        if(d<bd){bd=d;best={vid:v.id,id:p.ann?p.ann.id:null,ann:p.ann,ak:p.ak,p,end};}
      });
    });
    return best;
  }
  function mepAxisHoleAt(sh,sx,sy){
    const hit=mepHitViewEnt(sh,sx,sy);
    if(hit&&hit.e&&hit.e.t==='C'){
      const m=mepHoleAt(sh,hit.vid,hit.e,hit.i);
      if(m)return{vid:hit.vid,fid:m.f.id,pid:m.P.id};
    }
    const v0=mepViewAt(sh,sx,sy);
    const views=v0?[v0]:sh.views;
    let best=null,bd=8/mepSt.zoom;
    views.forEach(v=>{
      mepAxisFeatureHoles(sh,v).forEach(h=>{
        const d=Math.hypot(v.x+h.x*v.scale-sx,v.y+h.y*v.scale-sy);
        if(d<bd){bd=d;best={vid:v.id,fid:h.fid,pid:h.pid};}
      });
    });
    return best;
  }
  function mepSignedTol(v){
    const n=+v||0;
    return (n<0?'−':'+')+mepFmtNum(Math.abs(n),3);
  }
  function mepDimTextParts(d,value){
    // distance entre génératrices d'un cylindre : préfixe Ø comme une cote de diamètre
    if(d.dsym&&!d.txt&&d.kind!=='dia'&&d.kind!=='rad')return mepDimSymbolParts(Object.assign({},d,{dsym:''}),value,d.dsym);
    const pre=d.pre?String(d.pre).trim():'',post=d.post?String(d.post).trim():'';
    const join=(a,b)=>a&&b?a+' '+b:(a||b);
    const wrap=s=>join(join(pre,s),post);
    if(d.kind==='hole')return{main:wrap((d.holeN>1&&!d.txt?d.holeN+'× ':'')+(d.txt||d.holeText||'')),up:'',lo:'',sym:''};
    if(d.txt)return{main:wrap(d.txt),up:'',lo:'',sym:''};
    const unit=d.kind==='ang'?'°':'';
    const base=mepFmtNum(value,d.kind==='ang'?1:2)+unit;
    const t=d.tol||{};
    if(t.m==='pm'&&t.s>0){
      const sym='±'+mepFmtNum(t.s,3)+(post?' '+post:'');
      return{main:join(pre,base),sym,up:'',lo:''};
    }
    if(t.m==='dbl')return{main:wrap(base),up:mepSignedTol(t.hi),lo:mepSignedTol(t.lo),sym:''};
    if(t.m==='cls'&&t.cls){
      // 2026-10-22-007 : classe ISO 286 suivie de ses écarts entre parenthèses, empilés comme
      // une tolérance bilatérale (même place, même hauteur) — « Ø20 H7 (+0,021 / 0) ».
      // Ajustement (H7/g6) : la classe seule (deux plages, pas un écart sur la cote).
      const r=String(t.cls).indexOf('/')<0?mepTolRange(t.cls,Math.abs(value)):null;
      if(r)return{main:join(pre,base+' '+t.cls),up:mepSignedTol0(r.hi),lo:mepSignedTol0(r.lo),sym:'',par:true,post};
      return{main:wrap(base+' '+t.cls),up:'',lo:'',sym:''};
    }
    return{main:wrap(base),up:'',lo:'',sym:''};
  }
  // écart ISO : 0 sans signe (ISO 286), sinon signé
  function mepSignedTol0(v){return Math.abs(+v||0)<1e-9?'0':mepSignedTol(v);}
  function mepDimSymbolParts(d,value,sym){
    const pre=d.pre?String(d.pre).trim():'',post=d.post?String(d.post).trim():'';
    const p=mepDimTextParts(Object.assign({},d,{pre:'',post:''}),value);
    const join=(a,b)=>a&&b?a+' '+b:(a||b);
    const main=join(pre,sym+p.main);
    if(p.sym)return Object.assign({},p,{main,sym:join(p.sym,post)});
    if(p.par)return Object.assign({},p,{main,post}); // suffixe après la parenthèse des écarts
    return Object.assign({},p,{main:join(main,post)});
  }
  function mepDimText(d,value){
    const p=(d.kind==='dia'||d.kind==='rad')
      ?mepDimSymbolParts(d,value,d.kind==='dia'?'Ø':'R')
      :mepDimTextParts(d,value);
    const main=p.sym?p.main+' '+p.sym:p.main;
    const ht=d.kind==='hole'&&!d.txt?mepHoleTol(d):null;
    if(ht)return mepTolMarks(mepHoleTolText(main,ht));
    if(p.par)return main+' ('+p.up+' / '+p.lo+')'+(p.post?' '+p.post:'');
    return p.up||p.lo?main+' '+p.up+' / '+p.lo:main;
  }
  /* tolérances au PRORATA de la hauteur des cotes (V0.23.5) : écarts à 0,68 × le corps du texte,
     interligne et espacements proportionnels — plus de minimum fixe (2,8 / 1,8 / 1,2 mm) qui
     les grossissait en petite écriture ; à 3,5 mm (défaut) le dessin reste celui d'avant */
  function mepDimSubH(th){return th*0.68;}
  function mepDimTolLineH(){
    const th=MEP_DIM_STYLE.textHeight||7;
    return mepDimSubH(th)*0.855;
  }
  // largeur de la pile des écarts (parenthèses et suffixe compris), mm papier
  function mepDimStackW(up,lo,par,post){
    const th=MEP_DIM_STYLE.textHeight||7,sub=mepDimSubH(th),lh=mepDimTolLineH();
    const pw=par?sub*0.55:0,tw=Math.max(String(up||'').length,String(lo||'').length)*sub*0.54;
    const cw=par?(sub+lh)*0.4+(post?(String(post).length+1)*sub*0.54:0):0;
    return pw+tw+cw;
  }
  function mepDimStackGap(){return (MEP_DIM_STYLE.textHeight||7)*0.245;}
  function mepDimDrawText(mk,T,main,up,lo,x,y,anchor,transform,flip,sym,par,post){
    // 2026-10-22-011 : texte calé à DROITE (leader à droite) — la pile des écarts tient AVANT
    // le point d'attache : tout le groupe recule (la pile ne déborde plus sur le leader)
    const shiftEnd=(anchor==='end'&&(up||lo))?mepDimStackGap()+mepDimStackW(up,lo,par,post):0;
    const attrs={x:x-shiftEnd,y,'text-anchor':anchor};
    if(transform)attrs.transform=transform;
    const t=mk('text',Object.assign(attrs,T));
    t.textContent=main;
    if(sym){
      const ts=document.createElementNS(NS,'tspan');
      ts.setAttribute('font-size',String((MEP_DIM_STYLE.textHeight||7)*0.85));
      ts.textContent=' '+sym;
      t.appendChild(ts);
    }
    if(!up&&!lo)return t;
    const th=MEP_DIM_STYLE.textHeight||7;
    const gap=mepDimStackGap();
    const mw=Math.max(7,String(main).length*th*0.62);
    // calé à gauche : la pile suit la largeur MESURÉE du texte (celle du souligné des Ø/R)
    const sx=anchor==='middle'?x+mw/2+gap:(anchor==='end'?x-shiftEnd+gap:x+mepTxtW(t,main,th)+gap);
    mepDimDrawStack(mk,T,sx,y,up,lo,transform,flip,par,post);
    return t;
  }
  /* pile des écarts (supérieur au-dessus de l'inférieur), entre parenthèses pour une classe ISO,
     à partir de sx (bord gauche) sur la ligne de base y du texte de cote */
  function mepDimDrawStack(mk,T,sx,y,up,lo,transform,flip,par,post){
    const th=MEP_DIM_STYLE.textHeight||7;
    const sub=mepDimSubH(th);
    const lh=mepDimTolLineH();
    const st=Object.assign({},T,{x:sx,'text-anchor':'start',
      style:'font-size:'+sub+'px;stroke-width:1'});
    if(transform)st.transform=transform;
    // écarts d'une classe ISO : parenthèses hautes autour de la pile (même place qu'en bilatéral)
    const pw=par?sub*0.55:0;
    // V0.24.0 : écarts alignés sur la virgule — partie entière (signe compris) calée à droite,
    // décimales calées à gauche du même point : « 0 » sous le 0 de « −0.021 »
    const cut=v=>{const s=String(v||''),i=s.search(/[.,]/);return i<0?[s,'']:[s.slice(0,i),s.slice(i)];};
    const U=cut(up),L=cut(lo),cw=sub*0.58;
    const iw=Math.max(U[0].length,L[0].length)*cw,xd=sx+pw+iw;
    const tw=iw+Math.max(U[1].length,L[1].length)*sub*0.54;
    const row=(P,yy)=>{
      if(P[0]){const a=mk('text',Object.assign({},st,{x:xd,y:yy,'text-anchor':'end'}));a.textContent=P[0];}
      if(P[1]){const b=mk('text',Object.assign({},st,{x:xd,y:yy}));b.textContent=P[1];}
    };
    row(U,flip?y+lh:y-lh);
    row(L,y);
    if(par){
      // parenthèses centrées sur la pile : milieu des deux lignes d'écarts (hauteur de capitale
      // ≈ 0,7 × corps), le centre d'un « ( » est ≈ 0,26 × son corps au-dessus de la ligne de base
      const ph=sub+lh,py=y+(flip?lh:-lh)*0.5-sub*0.35+ph*0.26;
      const sp=Object.assign({},st,{y:py,style:'font-size:'+ph.toFixed(2)+'px;stroke-width:1'});
      const p0=mk('text',Object.assign({},sp,{x:sx}));p0.textContent='(';
      const p1=mk('text',Object.assign({},sp,{x:sx+pw+tw}));p1.textContent=')'+(post?' '+post:'');
    }
  }
  function mepDimHasStack(d){
    return !d.txt&&d.tol&&(d.tol.m==='dbl'||(d.tol.m==='cls'&&d.tol.cls&&String(d.tol.cls).indexOf('/')<0));
  }
  /* 2026-10-30 : étendue du texte d'une cote ancré 'middle', dans le sens de lecture, depuis le
     point d'ancrage → {lo,hi} (mm papier). Le « ± » suit le texte (centré avec lui) ; la pile des
     écarts est posée d'UN seul côté, après la valeur (mêmes mesures que mepDimDrawText) : la ligne
     de cote ne se prolonge plus du mauvais côté de toute la largeur des tolérances. */
  function mepDimLabelSpan(d,value){
    const p=mepDimTextParts(d,value);
    const th=MEP_DIM_STYLE.textHeight||7;
    const main=d.ref?'('+p.main+')':p.main;
    const mainHalf=Math.max(7,String(main).length*th*0.62)/2;
    if(p.sym){
      const h=mainHalf+(Math.max(1.2,th*0.14)+String(p.sym).length*th*0.85*0.54)/2;
      return{lo:-h,hi:h};
    }
    if(!p.up&&!p.lo)return{lo:-mainHalf,hi:mainHalf};
    return{lo:-mainHalf,hi:mainHalf+mepDimStackGap()+mepDimStackW(p.up,p.lo,p.par,p.post)};
  }
  function mepDimLabelHalf(d,value){
    const s=mepDimLabelSpan(d,value);
    return Math.max(-s.lo,s.hi);
  }
  // étendue du texte le long de u (direction de la cote) : le sens de lecture est +u, ou −u quand
  // le texte est retourné (cote vers la gauche) ou vertical (lu de bas en haut)
  function mepDimLabelSpanU(g,d,value){
    const s=mepDimLabelSpan(d,value);
    const vertical=Math.abs(g.ux)<1e-6;
    const ang=Math.atan2(g.dy,g.dx)*180/Math.PI;
    const k=vertical?(g.uy>0?-1:1):((ang>90||ang<-90)?-1:1);
    return k>0?s:{lo:-s.hi,hi:-s.lo};
  }
  function mepDimTextAnchorPos(g,d){
    const th=MEP_DIM_STYLE.textHeight||7;
    const toff=+d.txtOff||0;
    const vertical=Math.abs(g.ux)<1e-6;
    let x=(g.a1.x+g.b1.x)/2+g.ux*toff;
    let y=(g.a1.y+g.b1.y)/2+g.uy*toff;
    if(vertical){
      x-=Math.max(2,th*0.28);
    }else if(mepDimHasStack(d)){
      y-=mepDimTolLineH();
    }else{
      y-=2;
    }
    return{x,y,vertical,toff};
  }
  function mepDimLineExtent(g,d,value){
    const half=g.L/2,toff=+d.txtOff||0;
    if(Math.abs(toff)<1e-9)return{start:-half,end:half,half};
    const s=mepDimLabelSpanU(g,d,value);
    return{start:Math.min(-half,toff+s.lo),end:Math.max(half,toff+s.hi),half};
  }
  function mepDimTxtOffSnap(sh,d,v,g){
    v=+v||0;
    g=g||mepDimLine(sh,d);
    if(!g||!g.L)return v;
    const value=d.value!=null?d.value:mepDimMeasure(sh,d);
    // texte entièrement entre les flèches, ici comme au centre → retour au centre
    const s=mepDimLabelSpanU(g,d,value),half=g.L/2;
    const fits=o=>o+s.lo>=-half-1e-9&&o+s.hi<=half+1e-9;
    return (fits(v)&&fits(0))?0:v;
  }
  /* largeur d'un texte de cote (mm papier) : mesurée sur le SVG quand il est affiché,
     sinon estimée d'après le corps de la police (chiffres et capitales ≈ 0,6 corps, graisse 600) */
  function mepTxtW(el,str,fs){
    try{if(el&&typeof el.getComputedTextLength==='function'){const w=el.getComputedTextLength();if(w>0)return w;}}catch(e){}
    return String(str||'').length*fs*0.6;
  }
  function mepDimUnderOff(h){return 0.3*h+0.9;} // ligne de rappel soulignée : écart sous la ligne de base
  /* 2026-10-22-017 : tolérance d'une cotation de perçage — posée juste après le 1er « Ø… » de
     l'étiquette (le Ø du trou ; pour un taraudage, la ligne du foret), écarts en petit corps
     (balises \u0001…\u0002 → tspan réduit) : « Ø8 H7 (+0,015 / 0) ↧12 ». */
  function mepHoleTolText(txt,tol){
    if(!tol||!tol.m)return txt;
    const m=/Ø\s?([0-9]+(?:[.,][0-9]+)?)/.exec(String(txt||''));if(!m)return txt;
    const nom=parseFloat(m[1].replace(',','.'));if(!(nom>0))return txt;
    const p=mepDimTextParts({kind:'dia',tol},nom);let add='';
    if(tol.m==='pm'&&tol.s>0)add='\u0001'+p.sym+'\u0002';
    // V0.24.0 : écarts EMPILÉS comme sur les autres cotes (\u0003 [ « ( » ] sup \u0004 inf)
    else if(tol.m==='dbl')add='\u0001\u0003'+p.up+'\u0004'+p.lo+'\u0002';
    else if(tol.m==='cls'&&tol.cls)add=tol.cls+(p.par?' \u0001\u0003('+p.up+'\u0004'+p.lo+'\u0002':'');
    if(!add)return txt;
    const e=m.index+m[0].length;
    return txt.slice(0,e)+' '+add+txt.slice(e);
  }
  const MEP_TOL_STACK=/\u0001\u0003(\(?)([^\u0004]*)\u0004([^\u0002]*)\u0002/;
  // texte seul (panneau, export texte) : pile écrite « (+0.015 / 0) »
  const mepTolMarks=s=>String(s||'').replace(new RegExp(MEP_TOL_STACK.source,'g'),(m,p,a,b)=>p?'('+a+' / '+b+')':a+' / '+b).replace(/[\u0001\u0002]/g,'');
  function mepHoleCallout(cx,cy,rr,px,py,txt){
    let ux=px-cx,uy=py-cy,ul=Math.hypot(ux,uy);
    if(ul<1e-6){ux=1;uy=0;ul=1;}
    ux/=ul;uy/=ul;
    const ang=Math.atan2(uy,ux);
    const ex=cx+rr*Math.cos(ang),ey=cy+rr*Math.sin(ang);
    const lines=String(txt||'').split('\n');
    // interligne, souligné et largeur suivent la hauteur d'écriture des cotes
    const fs=MEP_DIM_STYLE.textHeight||7,h=MEP_TEXT_STYLE.dimH;
    const lh=fs*1.2,n=lines.length,mid=py+h*0.4;
    const y0=mid-(n-1)*lh/2;
    const tx=px,anchor=ux<0?'end':'start';
    const tw=Math.max(h,...lines.map(s=>mepTxtW(null,mepTolMarks(s),fs)));
    const u0=anchor==='end'?tx-tw:tx,u1=anchor==='end'?tx:tx+tw;
    // souligné sous les jambages (ISO 3098 : 0,3 h) + le halo blanc du texte : sinon il touche le Ø
    const lineY=y0+(n-1)*lh+mepDimUnderOff(h);
    return{ex,ey,lines,lh,y0,tx,anchor,u0,u1,lineY};
  }
  /* 2026-10-22-015 : NOTE À FLÈCHE (« zone texte avec flèche comme pour les cotations de perçage,
     texte libre ») — d.kind 'note' : a = pointe de la flèche, b = départ du texte souligné (mm
     locaux de la vue), d.txt multiligne ; dessin et glisser = ceux de l'étiquette de perçage.
     COTATION D'ORDONNÉES (ISO 129-1) — d.kind 'ord' : d.o = origine « 0 », d.axis 'x' | 'y',
     d.pts = points cotés, d.off = position commune (mm papier depuis l'origine, perpendiculaire à
     l'axe) : toutes les valeurs sont alignées et se déplacent ENSEMBLE (un seul objet). Les
     valeurs s'écrivent le long des lignes d'attache, au bout ; les points gardent leur
     accrochage (re-ancrés au rejeu comme les autres cotes). */
  let mepTxtDlgEl=null;
  function mepTextDialog(title,init,cb){
    if(mepTxtDlgEl){try{mepTxtDlgEl.remove();}catch(e){}}
    const box=document.createElement('div');mepTxtDlgEl=box;box.id='mepTxtDlg';
    box.style.cssText='position:fixed;z-index:10001;left:50%;top:40%;transform:translate(-50%,-50%);width:300px;padding:12px 14px;'
      +'border:1px solid var(--border,#3a3a3e);border-radius:10px;background:var(--surface,#222);color:var(--text,#eee);'
      +'box-shadow:0 12px 32px rgba(0,0,0,.5);font:12px sans-serif';
    const h=document.createElement('div');h.textContent=title;h.style.cssText='font-weight:600;font-size:13px;margin-bottom:8px';box.appendChild(h);
    const ta=document.createElement('textarea');ta.id='mepTxtDlgTa';ta.rows=3;ta.value=init||'';
    ta.style.cssText='width:100%;box-sizing:border-box;resize:vertical;font:13px sans-serif';box.appendChild(ta);
    const n=document.createElement('div');n.textContent='Entrée : valider · Maj + Entrée : nouvelle ligne · Échap : annuler';
    n.style.cssText='color:var(--muted,#aaa);font-size:11px;margin:6px 0';box.appendChild(n);
    const bt=document.createElement('div');bt.style.cssText='display:flex;justify-content:flex-end;gap:8px';
    const close=()=>{try{box.remove();}catch(e){}if(mepTxtDlgEl===box)mepTxtDlgEl=null;};
    const bC=document.createElement('button');bC.type='button';bC.textContent='Annuler';bC.onclick=()=>{close();cb(null);};
    const bO=document.createElement('button');bO.type='button';bO.id='mepTxtDlgOk';bO.textContent='Valider';bO.onclick=()=>{close();cb(ta.value);};
    bt.appendChild(bC);bt.appendChild(bO);box.appendChild(bt);
    ta.addEventListener('keydown',e=>{e.stopPropagation();
      if(e.key==='Escape'){bC.click();}else if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();bO.click();}});
    document.body.appendChild(box);try{ta.focus();ta.select();}catch(e){}
    return box;
  }
  function mepNoteEdit(sh,d){
    mepTextDialog('Note',d.txt||'',t=>{
      if(t===null)return;
      const v=String(t).replace(/\r/g,'').replace(/\s+$/,'');
      mepEdit('texte de note',()=>{if(v)d.txt=v;else sh.dims=sh.dims.filter(x=>x!==d);});
      mepSideShow();mepRender();
    });
  }
  // accrochage → point local d'une vue + indice d'entité (re-ancrage au rejeu)
  function mepSnapHint(sh,v,sn,q){
    // référence durable d'un point accroché : trait d'axe (suivi à chaque dessin) ou entité (re-ancrage au rejeu)
    const h=sn&&sn.hit;if(!h)return null;
    if(h.ak&&(h.t==='axEnd'||h.t==='axMid'||h.t==='onAx'||h.t==='ctr'))return mepAxisRefOf(sh,v,q,h.ak);
    if(isFinite(h.i)){if(h.t==='end')return{t:'seg',i:h.i};if(h.t==='ctr')return{t:'ctr',i:h.i};
      if(h.t==='mid'||h.t==='onSeg'){const g=mepGeoOf(v),e=g&&g.els[h.i];if(e&&e.t==='L'&&mepGeoExact(g))return mepEdgeRefOf(e,q);}}
    return null;
  }
  function mepSnapLocal(sh,P){
    const sn=mepSnapPt(P.x,P.y,sh),v=sn.hit?mepView(sh,sn.hit.vid):mepViewAt(sh,sn.x,sn.y);
    if(!v)return null;
    const q={x:(sn.x-v.x)/v.scale,y:(sn.y-v.y)/v.scale};
    const hh=mepSnapHint(sh,v,sn,q);if(hh)q.hint=hh;
    return{v,q};
  }
  function mepOrdDefaultOff(v,axis,o){
    const bb=mepAABBOf(mepGeoOf(v)),oS=mepToSheet(v,o.x,o.y);
    if(!bb)return -10;
    return axis==='y'?(v.x+bb.minx*v.scale)-10-oS.x:(v.y+bb.miny*v.scale)-10-oS.y;
  }
  function mepOrdClick(sh,P,axis){
    const cur=mepSt.ord?sh.dims.find(x=>x.id===mepSt.ord):null;
    const S=mepSnapLocal(sh,P);
    if(!S){mepStatus('Ordonnées : cliquez dans une vue.');return;}
    if(!cur){
      const o=S.q,d={id:mepUid('d'),kind:'ord',axis,vid:S.v.id,vid2:null,o,a:o,b:o,pts:[],off:mepOrdDefaultOff(S.v,axis,o),ref:false,tol:null};
      mepEdit('cotation d’ordonnées',()=>{sh.dims.push(d);});
      mepSt.ord=d.id;mepSt.selDim=d.id;
      mepStatus('Ordonnées '+axis.toUpperCase()+' : origine « 0 » posée — cliquez les points à coter (Entrée ou Échap pour terminer).');
    }else{
      if(S.v.id!==cur.vid){mepStatus('Ordonnées : les points doivent être dans la vue de l’origine.');return;}
      mepEdit('point d’ordonnée',()=>{cur.pts.push(S.q);});
      mepStatus('Ordonnées '+cur.axis.toUpperCase()+' : '+cur.pts.length+' point(s) — Entrée ou Échap pour terminer.');
    }
    mepSideShow();mepRender();
  }
  // 2026-10-22-016 : « je dois pouvoir supprimer une cote parmi les ordonnées » — le clic désigne
  // la valeur la plus proche (le long de l'axe) ; Suppr ou « Supprimer ce point » la retire
  function mepOrdPtAt(sh,d,P){
    const v=mepView(sh,d.vid);if(!v)return -1;
    let best=-1,bd=Infinity;
    [d.o].concat(d.pts||[]).forEach((q,k)=>{const S=mepToSheet(v,q.x,q.y),j=(+q.jog||0)*v.scale,e=d.axis==='y'?Math.abs(S.y+j-P.y):Math.abs(S.x+j-P.x);if(e<bd){bd=e;best=k-1;}});
    return best;
  }
  function mepOrdDelPt(sh,d,i){
    if(!d||!(i>=0)||!d.pts||i>=d.pts.length)return false;
    mepEdit('point d’ordonnée supprimé',()=>{d.pts.splice(i,1);});
    mepSt.ordPt=null;
    mepStatus('Point d’ordonnée supprimé ('+d.pts.length+' restant(s)).');
    mepSideShow();mepRender();
    return true;
  }
  function mepOrdValue(d,p){
    // mm modèle depuis l'origine, signé : X vers la droite, Y vers le haut (v papier = vers le bas) ;
    // l'affichage en prend la valeur absolue
    return d.axis==='y'?(d.o.y-p.y):(p.x-d.o.x);
  }
  function mepDrawOrd(draw,d,sh,L,T){
    const v=mepView(sh,d.vid);if(!v||!d.o)return;
    try{mepDimPtsRefresh(sh,d);}catch(e){}
    const hh=MEP_TEXT_STYLE.dimH,gap=Math.max(0.8,MEP_DIM_STYLE.gap||1),oS=mepToSheet(v,d.o.x,d.o.y);
    const line=d.axis==='y'?oS.x+(+d.off||0):oS.y+(+d.off||0);
    const hi=(mepSt.ordPt&&mepSt.ordPt.id===d.id)?mepSt.ordPt.i:null;
    // une valeur désignée : elle seule en rouge (le reste du groupe en couleur normale), Suppr la retire
    if(hi!==null){const un=c=>String(c||'').replace(/\s*mepDimSel\b/g,'');L=Object.assign({},L,{class:un(L.class)});T=Object.assign({},T,{class:un(T.class)});}
    const Ls=Object.assign({},L,{class:L.class+' mepDimSel'}),Ts=Object.assign({},T,{class:T.class+' mepDimSel'});
    [d.o].concat(d.pts||[]).forEach((p,k)=>{
      const on=hi!==null&&k-1===hi,L1=on?Ls:L,T1=on?Ts:T;
      // valeur toujours POSITIVE (distance à l'origine) — points des deux côtés du « 0 » compris
      const P=mepToSheet(v,p.x,p.y),val=Math.abs(mepOrdValue(d,p));
      const s=mepFmtNum(val<1e-9?0:val,2);
      const pp=(k>0&&p.tol)?mepDimTextParts({kind:'len',tol:p.tol},val<1e-9?0:val):null; // tolérance de CE point
      const put=(x,y,anchor,tr)=>{
        if(!pp){const a={x,y,'text-anchor':anchor};if(tr)a.transform=tr;draw('text',Object.assign(a,T1)).textContent=s;return;}
        mepDimDrawText(draw,T1,pp.main,pp.up,pp.lo,x,y,anchor,tr,false,pp.sym,pp.par,pp.post);
      };
      // cassure (2026-10-23) : rappel droit, coude oblique sur 3 mm, puis droit jusqu'à la ligne des valeurs
      const J=(k>0&&+p.jog)?+p.jog*v.scale:0;
      if(d.axis==='y'){
        const sg=line<P.x?-1:1,y2=P.y+J;
        if(J&&Math.abs(line-P.x)>8){const b1=line-sg*7,b2=line-sg*4;
          draw('line',Object.assign({x1:P.x+sg*gap,y1:P.y,x2:b1,y2:P.y},L1));draw('line',Object.assign({x1:b1,y1:P.y,x2:b2,y2:y2},L1));
          draw('line',Object.assign({x1:b2,y1:y2,x2:line,y2:y2},L1));}
        else draw('line',Object.assign({x1:P.x+sg*gap,y1:P.y,x2:line,y2:P.y},L1));
        put(line+sg*1,(J&&Math.abs(line-P.x)>8?y2:P.y)+hh*0.5,sg<0?'end':'start',null);
      }else{
        const sg=line<P.y?-1:1,x2=P.x+J,ok=J&&Math.abs(line-P.y)>8,xt=(ok?x2:P.x)+hh*0.5,y=line+sg*1;
        if(ok){const b1=line-sg*7,b2=line-sg*4;
          draw('line',Object.assign({x1:P.x,y1:P.y+sg*gap,x2:P.x,y2:b1},L1));draw('line',Object.assign({x1:P.x,y1:b1,x2:x2,y2:b2},L1));
          draw('line',Object.assign({x1:x2,y1:b2,x2:x2,y2:line},L1));}
        else draw('line',Object.assign({x1:P.x,y1:P.y+sg*gap,x2:P.x,y2:line},L1));
        put(xt,y,sg<0?'start':'end','rotate(-90 '+xt.toFixed(3)+' '+y.toFixed(3)+')');
      }
    });
  }
  function mepDrawDim(mk,d,sh){
    const w=mepDimWorld(sh,d);
    if(!w)return;
    const val=d.value!=null?d.value:mepDimMeasure(sh,d);
    let txt=mepDimText(d,val);
    const sel=mepSt.selDim===d.id||!!(mepSt.lot&&mepSt.lot.dims.has(d.id));
    const ghost=!!d.__ghost;
    const col=sel?COL.sel:(d.ref?null:'#0a84ff');
    const L={class:'mepDimL'+(sel?' mepDimSel':'')+(ghost?' mepDimGhost':'')};
    const LX={class:L.class+' mepDimX'}; // lignes de rappel (V0.23.4) : leur épaisseur propre (--mepLwExt)
    const T={class:'mepDimT'+(sel?' mepDimSel':'')+(d.ref?' mepDimRef':'')+(ghost?' mepDimGhost':'')};
    const AR=sel?'url(#mepArrSel)':'url(#mepArr)';
    const ARS=sel?'url(#mepArrSSel)':'url(#mepArrS)';
    const hit=[];
    mepDimHits.set(d,hit);
    const draw=(tag,attrs)=>{
      if(tag==='line'){
        const x1=+(attrs&&attrs.x1),y1=+(attrs&&attrs.y1),x2=+(attrs&&attrs.x2),y2=+(attrs&&attrs.y2);
        if([x1,y1,x2,y2].every(Number.isFinite))hit.push({x1,y1,x2,y2});
      }
      return mk(tag,attrs);
    };
    if(d.kind==='ord'){mepDrawOrd(draw,d,sh,LX,T);return;}
    if(d.kind==='note')txt=d.txt||'Texte';
    if(d.kind==='hole'||d.kind==='note'){
      if(d.kind==='hole'&&d.holeFid&&typeof doc!=='undefined'){
        const f=(doc.features||[]).find(x=>x.id===d.holeFid);
        if(f){
          d.holeText=mepHoleFeatureText(f);
          // nombre tenu à jour (répétition modifiée, trous ajoutés à l'esquisse…)
          const hn=mepHoleCount(sh,w.v1,mepHoleFam(f));if(hn>0)d.holeN=hn;
          txt=d.txt||((d.holeN>1?d.holeN+'× ':'')+d.holeText);
        }
      }
      const ht=d.kind==='hole'&&!d.txt?mepHoleTol(d):null;
      if(ht)txt=mepHoleTolText(txt,ht);
      const e=mepEntByHint(w.v1,d.a.hint);
      let cx=w.a.x,cy=w.a.y,rr=0;
      if(e&&(e.t==='C'||e.t==='A')){
        const v=w.v1,cS=mepToSheet(v,e.cx,e.cy);
        rr=e.r*v.scale;cx=cS.x;cy=cS.y;
      }
      const g=mepHoleCallout(cx,cy,rr,w.b.x,w.b.y,txt);
      draw('line',Object.assign({x1:g.tx,y1:g.lineY,x2:g.ex,y2:g.ey,'marker-end':AR},L));
      const t=draw('text',Object.assign({x:g.tx,y:g.y0,'text-anchor':g.anchor},T));
      let twM=0;
      const th=MEP_DIM_STYLE.textHeight||7,gap=mepDimStackGap();
      g.lines.forEach((s,k)=>{
        const sm=MEP_TOL_STACK.exec(s);
        if(sm){
          // ligne avec écarts empilés : texte avant, pile, texte après — éléments séparés, posés
          // une fois les largeurs mesurées (calé à droite si le leader part à droite)
          const yy=g.y0+k*g.lh,bef=s.slice(0,sm.index).replace(/\s+$/,''),aft=s.slice(sm.index+sm[0].length).replace(/^\s+/,'');
          const par=!!sm[1],up=sm[2],lo=sm[3];
          const t0=draw('text',Object.assign({x:g.tx,y:yy,'text-anchor':'start'},T));t0.textContent=bef;
          const w0=mepTxtW(t0,bef,th),ws=mepDimStackW(up,lo,par,'');
          let t2=null,w2=0;
          if(aft){t2=draw('text',Object.assign({x:g.tx,y:yy,'text-anchor':'start'},T));t2.textContent=aft;w2=mepTxtW(t2,aft,th);}
          const tot=w0+gap+ws+(aft?gap+w2:0),x0=g.anchor==='end'?g.tx-tot:g.tx;
          t0.setAttribute('x',String(x0));
          mepDimDrawStack(draw,T,x0+w0+gap,yy,up,lo,null,false,par,'');
          if(t2)t2.setAttribute('x',String(x0+w0+gap+ws+gap));
          twM=Math.max(twM,tot);
          return;
        }
        const ts=document.createElementNS(NS,'tspan');
        ts.setAttribute('x',String(g.tx));ts.setAttribute('y',String(g.y0+k*g.lh));
        if(s.indexOf('\u0001')<0)ts.textContent=s;
        else s.split(/(\u0001[^\u0002]*\u0002)/).forEach(seg=>{ // écarts de tolérance en petit corps
          if(!seg)return;
          const sub=document.createElementNS(NS,'tspan');
          if(seg[0]==='\u0001'){sub.setAttribute('font-size',String(mepDimSubH(MEP_DIM_STYLE.textHeight||7)));sub.textContent=mepTolMarks(seg);}
          else sub.textContent=seg;
          ts.appendChild(sub);
        });
        t.appendChild(ts);
        twM=Math.max(twM,mepTxtW(ts,s,MEP_DIM_STYLE.textHeight||7));
      });
      // souligné à la longueur réelle du texte (police et hauteur réglées)
      const u0=twM>0?(g.anchor==='end'?g.tx-twM:g.tx):g.u0,u1=twM>0?(g.anchor==='end'?g.tx:g.tx+twM):g.u1;
      draw('line',Object.assign({x1:u0,y1:g.lineY,x2:u1,y2:g.lineY},L));
      return;
    }
    if(d.kind==='dia'||d.kind==='rad'){
      // b = position du texte choisie par l'utilisateur ; le leader pointe la
      // circonférence dans cette direction (déplaçable au glisser).
      const e=mepEntByHint(w.v1,d.a.hint);
      let cx=w.a.x,cy=w.a.y,rr=0;
      if(e&&(e.t==='C'||e.t==='A')){
        const v=w.v1,cS=mepToSheet(v,e.cx,e.cy);
        rr=e.r*v.scale;cx=cS.x;cy=cS.y;
      }
      const px=w.b.x,py=w.b.y;
      let ux=px-cx,uy=py-cy,ul=Math.hypot(ux,uy);
      if(ul<1e-6){ux=1;uy=0;ul=1;}
      ux/=ul;uy/=ul;
      let ang=Math.atan2(uy,ux);
      if(e&&e.t==='A'){
        const lo=Math.min(e.a0,e.a1),hi=Math.max(e.a0,e.a1);
        let an=ang;while(an<lo)an+=2*Math.PI;
        if(an>hi){
          const d0=Math.abs(ang-e.a0),d1=Math.abs(ang-e.a1);
          ang=d0<d1?e.a0:e.a1;
        }else ang=an;
      }
      const ex=cx+rr*Math.cos(ang),ey=cy+rr*Math.sin(ang);
      const pp=mepDimSymbolParts(d,val,d.kind==='dia'?'Ø':'R');
      const str=pp.main;
      // texte sur un trait souligné : le leader part de dessous l'étiquette
      // (plus de vide entre le texte et la flèche).
      const fs=MEP_DIM_STYLE.textHeight||7,hh=MEP_TEXT_STYLE.dimH,uOff=mepDimUnderOff(hh);
      const tx=px,ty=py+hh*0.4;
      // leader du texte vers la circonférence, flèche sur l'arête
      draw('line',Object.assign({x1:tx,y1:ty+uOff,x2:ex,y2:ey,'marker-end':AR},L));
      if(d.kind==='dia'){
        // trait de diamètre : part du bord (côté texte) après un vide, traverse
        // le centre et flèche le bord opposé - il ne part plus du centre.
        const lg=Math.min(MEP_DIM_STYLE.leaderGap,rr*0.45);
        draw('line',Object.assign({x1:ex-ux*lg,y1:ey-uy*lg,
          x2:cx-rr*Math.cos(ang),y2:cy-rr*Math.sin(ang),'marker-end':ARS},L));
      }
      // trait sous la valeur R/Ø : longueur du texte réel (symbole et tolérances compris)
      const tEl=mepDimDrawText(draw,T,str,pp.up,pp.lo,tx,ty,ux<0?'end':'start',null,false,pp.sym,pp.par,pp.post);
      let tw=mepTxtW(tEl,str+(pp.sym?' '+pp.sym:''),fs);
      if(pp.up||pp.lo)tw+=mepDimStackGap()+mepDimStackW(pp.up,pp.lo,pp.par,pp.post); // pile des écarts comprise
      tw=Math.max(hh,tw);
      const u0=ux<0?tx-tw:tx,u1=ux<0?tx:tx+tw;
      draw('line',Object.assign({x1:u0,y1:ty+uOff,x2:u1,y2:ty+uOff},L));
      return;
    }
    if(d.kind==='ang'){
      const g=mepAngGeom(sh,d);
      if(!g)return;
      const O=g.O,r=mepAngRadius(d);
      const aa=g.a1,bb=g.a2,dd=g.dd;
      const sweep=dd>0?1:0,large=Math.abs(dd)>Math.PI?1:0;
      const x1=O.x+r*Math.cos(aa),y1=O.y+r*Math.sin(aa);
      const x2=O.x+r*Math.cos(bb),y2=O.y+r*Math.sin(bb);
      // rappels : prolongent chaque arête jusqu'à l'arc (vide au départ, dépassement après l'arc)
      if(g.ext)[[aa,g.ext[0]],[bb,g.ext[1]]].forEach(([a,e])=>{
        const ux=Math.cos(a),uy=Math.sin(a),gap=MEP_DIM_STYLE.gap,ov=MEP_DIM_STYLE.overrun;
        let s0=null,s1=null;
        if(r>e[1]+0.05){s0=e[1]+gap;s1=r+ov;}
        else if(r<e[0]-0.05){s0=e[0]-gap;s1=r-ov;}
        if(s0!==null&&Math.abs(s1-s0)>0.2)draw('line',Object.assign({x1:O.x+ux*s0,y1:O.y+uy*s0,x2:O.x+ux*s1,y2:O.y+uy*s1},LX));
      });
      // arc fléché aux deux bouts (pointes sur les rappels)
      draw('path',Object.assign({d:'M'+x1+','+y1+' A'+r+','+r+' 0 '+large+' '+sweep+' '+x2+','+y2,'marker-start':ARS,'marker-end':AR},L));
      const nSeg=Math.max(6,Math.ceil(Math.abs(dd)*r/3));
      for(let k=0;k<nSeg;k++){
        const t0=aa+dd*k/nSeg,t1=aa+dd*(k+1)/nSeg;
        hit.push({x1:O.x+r*Math.cos(t0),y1:O.y+r*Math.sin(t0),
          x2:O.x+r*Math.cos(t1),y2:O.y+r*Math.sin(t1)});
      }
      // texte collé à l'arc (mepAngTextPos) ; poussé hors des flèches, l'arc se prolonge jusqu'à lui
      const tp=mepAngTextPos(sh,d,g);if(!tp)return;
      const lo=Math.min(aa,aa+dd),hi=Math.max(aa,aa+dd);
      if(tp.t<lo||tp.t>hi){
        const e0=tp.t<lo?lo:hi,e1=tp.t,ne=Math.max(4,Math.ceil(Math.abs(e1-e0)*r/2));
        for(let k=0;k<ne;k++){
          const t0=e0+(e1-e0)*k/ne,t1=e0+(e1-e0)*(k+1)/ne;
          draw('line',Object.assign({x1:O.x+r*Math.cos(t0),y1:O.y+r*Math.sin(t0),x2:O.x+r*Math.cos(t1),y2:O.y+r*Math.sin(t1)},L));
        }
      }
      const pp=mepDimTextParts(d,val);
      mepDimDrawText(draw,T,pp.main,pp.up,pp.lo,tp.bx,tp.by,'middle',null,false,pp.sym,pp.par,pp.post);
      return;
    }
    /* linear (len / dist) */
    const g=mepDimLine(sh,d,w);
    if(!g)return;
    const {a1,b1,sa,sb,ea,eb}=g;
    // rappels : perpendiculaires au trait, avec un vide de `gap` au départ de
    // la pièce et un dépassement `over` après la ligne de cote (paramètres).
    draw('line',Object.assign({x1:sa.x,y1:sa.y,x2:ea.x,y2:ea.y},LX));
    draw('line',Object.assign({x1:sb.x,y1:sb.y,x2:eb.x,y2:eb.y},LX));
    // point d'intersection dans le vide : arêtes / arcs prolongés jusqu'au point
    mepDrawSnapExt(draw,LX,w.v1,d.a);if(d.b)mepDrawSnapExt(draw,LX,w.v2||w.v1,d.b);
    // ligne de cote fléchée
    if(d.arr==='out'){
      const ext=Math.max(2,MEP_DIM_STYLE.arrowLen);
      draw('line',Object.assign({x1:a1.x-g.ux*ext,y1:a1.y-g.uy*ext,
        x2:a1.x,y2:a1.y,'marker-end':AR},L));
      draw('line',Object.assign({x1:b1.x,y1:b1.y,
        x2:b1.x+g.ux*ext,y2:b1.y+g.uy*ext,'marker-start':ARS},L));
      draw('line',Object.assign({x1:a1.x,y1:a1.y,x2:b1.x,y2:b1.y},L));
    }else{
      draw('line',Object.assign({x1:a1.x,y1:a1.y,x2:b1.x,y2:b1.y,'marker-start':ARS,'marker-end':AR},L));
    }
    const ext=mepDimLineExtent(g,d,val);
    const midX=(a1.x+b1.x)/2,midY=(a1.y+b1.y)/2;
    if(ext.end>ext.half+1e-9){
      draw('line',Object.assign({x1:b1.x,y1:b1.y,
        x2:midX+g.ux*ext.end,y2:midY+g.uy*ext.end},L));
    }
    if(ext.start<-ext.half-1e-9){
      draw('line',Object.assign({x1:midX+g.ux*ext.start,y1:midY+g.uy*ext.start,
        x2:a1.x,y2:a1.y},L));
    }
    const ap=mepDimTextAnchorPos(g,d);
    const mx=ap.x,my=ap.y;
    let ang=Math.atan2(g.dy,g.dx)*180/Math.PI;
    let flip=ang>90||ang<-90;
    if(ap.vertical){ang=-90;flip=false;}
    const tr=flip?'rotate('+(ang+180)+' '+mx+' '+my+')':'rotate('+ang+' '+mx+' '+my+')';
    const pp=mepDimTextParts(d,val);
    const main=d.ref?'('+pp.main+')':pp.main;
    mepDimDrawText(draw,T,main,pp.up,pp.lo,mx,my,'middle',tr,flip,pp.sym,pp.par,pp.post);
  }
