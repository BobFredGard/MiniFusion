/* ─────────────────────────────────────────────────────────────────────────────
   ESQUISSES ET CORPS FAO (« murs ») — V0.23.20.

   Demande : « pouvoir dessiner une esquisse et faire une extrusion dans le mode
   FAO, pour réaliser des murs infranchissables ou autres limites du genre » ;
   « il faut ajouter à l'arbre une partie esquisse et corps. Ils ne doivent
   apparaître que dans la FAO, jamais ailleurs ».

   Choix :
     • stockage PAR POSAGE, dans doc.fao (jamais doc.sketches / doc.features /
       bodies) : setup.sketches = esquisses (même format que la CAO), setup.walls
       = corps {id, name, sk, a: départ, h: hauteur, m: marge, on}. La CAO, la
       mise en plan, les exports, l'empreinte du modèle et le noyau ne les voient
       donc jamais ;
     • l'éditeur d'esquisse est celui de la CAO : l'esquisse FAO n'entre dans
       doc.sketches que LE TEMPS de l'édition (faoSkOpen), et en sort à la
       fermeture avant le rejeu (faoSkDetach, appelé par closeSketch) ;
     • plan d'esquisse = plan XY du POSAGE (origine pièce) : coordonnées
       d'esquisse = X/Y du programme, départ et hauteur = Z du posage ;
     • corps = prisme droit du contour (contours, trous, cercles), le long de la
       normale de l'esquisse, de a à a+h ;
     • MUR INFRANCHISSABLE pour toutes les opérations du posage : l'outil (flanc
       et dessous, gonflés de la marge) n'y entre jamais — coupes recoupées et
       reprises par le haut, rapides relevés au-dessus du mur (même au-delà du
       plan de dégagement), trous de perçage retirés ; Ébauche 3D / Géodésique :
       le mur s'ajoute au modèle et à la cote de pointe minimale ; Finition :
       positions d'outil au contact du mur exclues ;
     • une esquisse FAO peut aussi servir de zone / îlot d'opération.
   ───────────────────────────────────────────────────────────────────────── */
const FAO_WALL_M=0.5;
let faoSkEditId=null; // esquisse FAO ouverte dans l'éditeur (présente dans doc.sketches)
function faoWallM(w){return (w&&isFinite(+w.m)&&+w.m>=0)?+w.m:FAO_WALL_M;}
function faoSkList(setup){return (setup&&Array.isArray(setup.sketches))?setup.sketches:[];}
function faoWallList(setup){return (setup&&Array.isArray(setup.walls))?setup.walls:[];}
// Esquisse FAO par id (tous posages) -> {sk, setup} | null
function faoSkFind(id){
  try{
    if(typeof doc==='undefined'||!doc||!doc.fao||!Array.isArray(doc.fao.setups))return null;
    const S=doc.fao.setups;
    for(let i=0;i<S.length;i++){const L=faoSkList(S[i]);
      for(let k=0;k<L.length;k++)if(L[k]&&L[k].id===id)return {sk:L[k],setup:S[i]};}
  }catch(e){}
  return null;
}
// Nettoyage (faoRoot, à chaque accès) : listes vides retirées (clés de parcours
// inchangées pour les documents sans murs) ; une esquisse FAO restée dans
// doc.sketches (enregistrement pendant l'édition) en est retirée.
function faoWallsSanitise(r){
  try{
    (r.setups||[]).forEach(function(s){
      if(s.sketches!==undefined&&!(Array.isArray(s.sketches)&&s.sketches.length))delete s.sketches;
      if(Array.isArray(s.walls)){
        s.walls=s.walls.filter(function(w){return w&&typeof w.sk==='string'&&w.id;});
        s.walls.forEach(function(w){
          if(w.kind!=='surface')delete w.kind;
          // hauteur nulle admise pour une surface (surface plane du contour fermé)
          if(!isFinite(+w.a))w.a=0; if(!isFinite(+w.h)||(w.kind!=='surface'&&Math.abs(+w.h)<1e-6))w.h=10;
          if(w.m!==undefined&&!(isFinite(+w.m)&&+w.m>=0))delete w.m;
          if(w.on!==false)delete w.on;
        });
        if(!s.walls.length)delete s.walls;
      }else if(s.walls!==undefined)delete s.walls;
    });
    if(typeof doc!=='undefined'&&doc&&Array.isArray(doc.sketches)&&doc.sketches.some(function(q){return q&&q.fao;})){
      const ed=(typeof skEdit!=='undefined')?skEdit:null;
      doc.sketches=doc.sketches.filter(function(q){
        if(!q||!q.fao||q===ed)return true;
        const st=(r.setups||[]).filter(function(s){return s.id===q.fao;})[0]||(r.setups||[])[0];
        if(st&&!faoSkFind(q.id)){(st.sketches=st.sketches||[]).push(q);}
        return false;
      });
    }
  }catch(e){}
}

/* ----- esquisses ----- */
// Nouvelle esquisse sur le plan XY du posage (origine pièce), éditeur ouvert.
function faoSkNew(setupId){
  try{
    if(typeof skEdit!=='undefined'&&skEdit)return null;
    const setup=faoSetup(setupId);if(!setup)return null;
    const F=faoFrame(setup),O=F.O||[0,0,0];
    faoSnapshot('nouvelle esquisse FAO');
    const n=faoSkList(setup).length+1;
    const sk={id:uid('sk'),name:'Esquisse FAO '+n,plane:'FACE',fao:setup.id,entities:[],points:{},constraints:[],dims:[],seq:1,visible:true,
      origin:[O[0],O[1],O[2]],axU:F.X.slice(),axV:F.Y.slice(),axN:F.Z.slice()};
    (setup.sketches=setup.sketches||[]).push(sk);
    faoTouch();
    faoSkOpen(sk.id);
    return sk;
  }catch(e){return null;}
}
// Ouvre l'éditeur sur une esquisse FAO : elle n'entre dans doc.sketches que le
// temps de l'édition (l'éditeur la cherche là).
function faoSkOpen(id){
  const f=faoSkFind(id);if(!f)return false;
  if(typeof skEdit!=='undefined'&&skEdit)return false;
  f.sk.fao=f.setup.id;
  if(!doc.sketches.some(function(q){return q===f.sk;}))doc.sketches.push(f.sk);
  faoSkEditId=id;
  try{openSketch(id);}catch(e){faoSkDetach(f.sk);return false;}
  if(!(typeof skEdit!=='undefined'&&skEdit===f.sk)){faoSkDetach(f.sk);return false;}
  return true;
}
// Sortie de l'éditeur (closeSketch, AVANT le rejeu) : l'esquisse quitte doc.sketches.
function faoSkDetach(sk){
  try{ if(sk&&typeof doc!=='undefined'&&doc&&Array.isArray(doc.sketches))doc.sketches=doc.sketches.filter(function(q){return q!==sk&&!(q&&q.id===sk.id&&q.fao);}); }catch(e){}
  faoSkEditId=null;
}
// Après la fermeture : murs et zones re-extraits, parcours à régénérer.
function faoSkAfterEdit(sk){
  try{ faoWallMeshMemo.clear(); }catch(e){}
  try{ if(typeof faoSketchReplay==='function')faoSketchReplay(); }catch(e){}
  try{ if(sk&&sk.fao)sel={kind:'faoSetup',id:sk.fao}; }catch(e){}
  try{ faoChanged(); }catch(e){}
}
function faoSkDelete(setup,id){
  faoSnapshot('supprimer une esquisse FAO');
  setup.sketches=faoSkList(setup).filter(function(q){return q.id!==id;});
  if(Array.isArray(setup.walls))setup.walls=setup.walls.filter(function(w){return w.sk!==id;});
  faoChanged();
}

/* ----- corps (murs) ----- */
// Nouveau corps : extrusion de l'esquisse choisie (sinon la dernière) du posage,
// par défaut du dessous du brut à 10 mm au-dessus de son dessus.
function faoWallNew(setupId,skId){
  try{
    const setup=faoSetup(setupId);if(!setup)return null;
    const L=faoSkList(setup);
    const sk=(skId&&L.filter(function(q){return q.id===skId;})[0])||L[L.length-1];
    if(!sk){
      try{faceEl.textContent='Corps FAO : dessinez d’abord une esquisse FAO (contour fermé) — ruban « Esquisse ».';}catch(e){}
      return null;
    }
    const st=(setup.stock&&faoStockValid(setup.stock))?setup.stock:faoStockDefault();
    faoSnapshot('nouveau corps FAO');
    const n=faoWallList(setup).length+1;
    const w={id:faoNewId('wall'),name:'Corps FAO '+n,sk:sk.id,a:+(+st.z0).toFixed(3),h:+((+st.z1)+10-(+st.z0)).toFixed(3)};
    // esquisse sans contour fermé (traits seuls) : corps SURFACE d'office
    if(!faoSkRegions(sk).length&&faoSkStrokes(sk).length)w.kind='surface';
    (setup.walls=setup.walls||[]).push(w);
    sk.visible=false;
    faoChanged();
    faoSelectSetup(setup.id);
    try{sel={kind:'faoSetup',id:setup.id,wall:w.id};renderProps();faoRenderTree();}catch(e){}
    if(!faoWallMeshWorld(setup,w)){try{faceEl.textContent='Corps FAO : l’esquisse « '+sk.name+' » n’a pas de contour fermé — corps vide.';}catch(e){}}
    return w;
  }catch(e){return null;}
}
function faoWallDelete(setup,id){
  faoSnapshot('supprimer un corps FAO');
  setup.walls=faoWallList(setup).filter(function(w){return w.id!==id;});
  try{ if(sel&&sel.wall===id)delete sel.wall; }catch(e){}
  faoChanged();
}

/* ----- géométrie : contours de l'esquisse -> prisme ----- */
// Polyligne 2D (esquisse) d'une chaîne skLoopTrace, sans point final répété.
function faoSkChainPts(sk,tr,chain){
  const TAU=Math.PI*2,nodes=chainNodesOf(chain),pts=[];
  for(let i=0;i<chain.length;i++){
    const st=chain[i],ed=st.ed,toId=nodes[i+1];
    if(ed.kind==='line'){const q=tr.pts[toId];if(q)pts.push([q.x,q.y]);}
    else if(ed.kind==='spline'){const pl=skEdgePoly(ed,st.from);for(let k=1;k<pl.length;k++)pts.push([pl[k][0],pl[k][1]]);}
    else{
      const a=ed.e,C=tr.pts[a.pc],an=arcAngles(sk,a);
      if(!C||!an||!(a.r>1e-9))return null;
      const fwd=(ed.a===st.from),d=an.a2-an.a1,sweep=fwd?d:-d,s0=fwd?an.a1:an.a2;
      const n2=Math.max(2,Math.ceil(Math.abs(sweep)/TAU*48));
      for(let k=1;k<=n2;k++){const t=s0+sweep*k/n2;pts.push([C.x+a.r*Math.cos(t),C.y+a.r*Math.sin(t)]);}
    }
  }
  const u=[];
  pts.forEach(function(p){const q=u[u.length-1];if(!q||Math.hypot(p[0]-q[0],p[1]-q[1])>1e-6)u.push(p);});
  while(u.length>1&&Math.hypot(u[0][0]-u[u.length-1][0],u[0][1]-u[u.length-1][1])<1e-6)u.pop();
  return u.length>=3?u:null;
}
function faoCirclePts(cx,cy,r){const n=Math.max(16,Math.min(96,Math.ceil(r*4))),o=[];for(let k=0;k<n;k++){const t=k/n*Math.PI*2;o.push([cx+r*Math.cos(t),cy+r*Math.sin(t)]);}return o;}
function faoArea2(P){let s=0;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];s+=p[0]*q[1]-q[0]*p[1];}return s/2;}
// Régions pleines de l'esquisse : [{outer:[[u,v]..] CCW, holes:[[..] CW]}]
function faoSkRegions(sk){
  const tr=skLoopTrace(sk);if(!tr)return [];
  const R=[];
  (tr.solids||[]).forEach(function(sol,si){
    let o=faoSkChainPts(sk,tr,sol.chain);if(!o)return;
    if(faoArea2(o)<0)o=o.slice().reverse();
    const H=[];
    (sol.holes||[]).forEach(function(h){let p=faoSkChainPts(sk,tr,h);if(!p)return;if(faoArea2(p)>0)p=p.slice().reverse();H.push(p);});
    (tr.circleHoles||[]).filter(function(ch){return ch.solid===si;}).forEach(function(ch){
      const C=sk.points[ch.circle.pc];if(C)H.push(faoCirclePts(C.x,C.y,ch.circle.r).reverse());});
    R.push({outer:o,holes:H});
  });
  (tr.circlesOut||[]).forEach(function(c){const C=sk.points[c.pc];if(C)R.push({outer:faoCirclePts(C.x,C.y,c.r),holes:[]});});
  return R;
}
// Triangulation d'une région (contour + trous) : THREE.ShapeUtils, sinon éventail.
function faoRegionTris(outer,holes){
  try{
    if(typeof THREE!=='undefined'&&THREE.ShapeUtils&&THREE.Vector2){
      const V=function(P){return P.map(function(p){return new THREE.Vector2(p[0],p[1]);});};
      const f=THREE.ShapeUtils.triangulateShape(V(outer),holes.map(V));
      if(Array.isArray(f)&&f.length)return f;
    }
  }catch(e){}
  const f=[];for(let i=1;i+1<outer.length;i++)f.push([0,i,i+1]);return f;
}
// Traits forts de l'esquisse (ouverts ou fermés) -> polylignes 2D [{pts, closed}]
// — base d'un corps SURFACE (demande : « les limites pourront être des surfaces
// simples, pas forcément des solides »).
function faoSkStrokes(sk){
  const P=sk.points||{},out=[];
  (sk.entities||[]).forEach(function(e){
    if(!e||e.construction||e.ref)return;
    if(e.t==='line'){if(e.handle)return;const A=P[e.p1],B=P[e.p2];if(A&&B&&Math.hypot(B.x-A.x,B.y-A.y)>1e-9)out.push({pts:[[A.x,A.y],[B.x,B.y]],closed:false});}
    else if(e.t==='circle'){const C=P[e.pc];if(C&&e.r>1e-9)out.push({pts:faoCirclePts(C.x,C.y,e.r),closed:true});}
    else if(e.t==='arc'){const C=P[e.pc],an=arcAngles(sk,e);if(!C||!an||!(e.r>1e-9))return;
      const d=an.a2-an.a1,n=Math.max(2,Math.ceil(Math.abs(d)/(Math.PI*2)*48)),pts=[];
      for(let k=0;k<=n;k++){const t=an.a1+d*k/n;pts.push([C.x+e.r*Math.cos(t),C.y+e.r*Math.sin(t)]);}
      out.push({pts:pts,closed:false});}
    else if(e.t==='spline'){try{const pl=skSplinePoly(sk,e,12);if(pl&&pl.length>=2)out.push({pts:pl.map(function(p){return [p[0],p[1]];}),closed:false});}catch(err){}}
  });
  return out;
}
// Corps FAO en coordonnées MONDE -> {v,t} | null (mémorisé). Solide : prisme des
// contours fermés. Surface : parois sans épaisseur le long de chaque trait de
// a à a+h ; hauteur nulle -> surface plane des contours fermés à la cote a.
const faoWallMeshMemo=new Map();
function faoWallMeshWorld(setup,w){
  const sk=faoSkList(setup).filter(function(q){return q.id===w.sk;})[0];
  if(!sk)return null;
  const surf=w.kind==='surface';
  const a=+w.a||0,h=+w.h||0;if(!surf&&!(Math.abs(h)>1e-6))return null;
  let key=null;
  try{key=JSON.stringify([sk.entities,sk.points,sk.origin,sk.axU,sk.axV,sk.axN,a,h,surf?1:0]);}catch(e){key=null;}
  if(key!==null&&faoWallMeshMemo.has(key))return faoWallMeshMemo.get(key);
  let out=null;
  try{
    const b=sketchBasis(sk),n=[b.n.x,b.n.y,b.n.z];
    const t0=Math.min(a,a+h),t1=Math.max(a,a+h);
    const V=[],T=[];
    const P=function(p,t){const q=occW(sk,p[0],p[1]);return [q[0]+n[0]*t,q[1]+n[1]*t,q[2]+n[2]*t];};
    if(surf&&Math.abs(h)<=1e-6){ // surface plane
      faoSkRegions(sk).forEach(function(R){
        const flat=[].concat.apply([],[R.outer].concat(R.holes)),i0=V.length;
        flat.forEach(function(p){V.push(P(p,a));});
        faoRegionTris(R.outer,R.holes).forEach(function(f){T.push([i0+f[0],i0+f[1],i0+f[2]]);});
      });
    }else if(surf){ // parois le long des traits
      faoSkStrokes(sk).forEach(function(S){
        const i0=V.length,N=S.pts.length;
        S.pts.forEach(function(p){V.push(P(p,t0));});
        S.pts.forEach(function(p){V.push(P(p,t1));});
        const M=S.closed?N:N-1;
        for(let k=0;k<M;k++){const p=k,q=(k+1)%N;T.push([i0+p,i0+q,i0+N+q],[i0+p,i0+N+q,i0+N+p]);}
      });
    }else faoSkRegions(sk).forEach(function(R){
      const rings=[R.outer].concat(R.holes),flat=[].concat.apply([],rings);
      const i0=V.length;
      flat.forEach(function(p){V.push(P(p,t0));});
      const i1=V.length;
      flat.forEach(function(p){V.push(P(p,t1));});
      faoRegionTris(R.outer,R.holes).forEach(function(f){
        T.push([i0+f[0],i0+f[2],i0+f[1]]); // dessous (normale -n)
        T.push([i1+f[0],i1+f[1],i1+f[2]]); // dessus
      });
      let off=0;
      rings.forEach(function(ring){
        for(let k=0;k<ring.length;k++){const p=off+k,q=off+(k+1)%ring.length;
          T.push([i0+p,i0+q,i1+q],[i0+p,i1+q,i1+p]);}
        off+=ring.length;
      });
    });
    out=T.length?{v:V,t:T}:null;
  }catch(e){out=null;}
  if(key!==null){ if(faoWallMeshMemo.size>64)faoWallMeshMemo.clear(); faoWallMeshMemo.set(key,out); }
  return out;
}
// Corps actifs du posage (repère du posage vu par `job`) -> [{w, mesh}]
function faoWallsActive(job){
  const L=faoWallList(job);if(!L.length)return [];
  const F=faoFrame(job),out=[];
  L.forEach(function(w){
    if(w.on===false)return;
    const m=faoWallMeshWorld(job,w);if(!m)return;
    out.push({w:w,mesh:F.id?m:{v:m.v.map(function(p){return faoToF(F,p);}),t:m.t}});
  });
  return out;
}
function faoWallsMesh(job){
  let M=null;faoWallsActive(job).forEach(function(q){M=faoMeshConcat(M,q.mesh);});return M;
}
// Clé de parcours : géométrie (repère du posage) + marges des corps actifs ; null sans corps.
function faoWallsSig(job){
  try{
    const A=faoWallsActive(job);if(!A.length)return null;
    return A.map(function(q){return faoMeshFp(q.mesh)+'@'+faoWallM(q.w);}).join(',');
  }catch(e){return null;}
}
// Cote de pointe MINIMALE d'un outil cylindrique de diamètre D (gonflé de la
// marge de chaque corps + extra) : -Infinity loin des corps ; null sans corps.
const faoWallTipMemo=new Map();
function faoWallTip(job,D,extra){
  const A=faoWallsActive(job);if(!A.length)return null;
  const ex=(+extra>0)?+extra:0;
  let k='';try{k=A.map(function(q){return faoMeshFp(q.mesh)+'@'+faoWallM(q.w);}).join(',')+'|'+D+'|'+ex;}catch(e){k='';}
  if(k&&faoWallTipMemo.has(k))return faoWallTipMemo.get(k);
  // le dropper gonfle l'outil en RAYON seulement : la marge sous la pointe est ajoutée ici
  const drops=A.map(function(q){const L=faoWallM(q.w)+ex;return {d:faoScDropper(q.mesh,'flat',D,0,L),L:L};});
  const fn=function(x,y){let z=-1/0;for(let i=0;i<drops.length;i++){const v=drops[i].d.tip(x,y)+drops[i].L;if(v>z)z=v;}return z;};
  if(k){ if(faoWallTipMemo.size>32)faoWallTipMemo.clear(); faoWallTipMemo.set(k,fn); }
  return fn;
}
function faoTipMax(a,b){if(!a)return b;if(!b)return a;return function(x,y){const p=a(x,y),q=b(x,y);return p>q?p:q;};}

/* ----- parcours : coupes recoupées, rapides relevés, trous retirés ----- */
// Coupes : toute position où la pointe passe sous la cote minimale wT est
// retirée ; reprise par le haut (montée au dégagement, traversée, approche
// rapide à 2 mm, plongée en avance). Les rapides sont traités ensuite.
function faoWallClip(mv,wT,secu){
  if(!wT||!mv||!mv.length)return mv;
  const ok=function(x,y,z){return !(z<wT(x,y)-0.01);};
  const tag=function(o,m){if(m&&m.ent)o.ent=1;return o;};
  const out=[];let p=null,pin=true,n=0;
  const reenter=function(X,Y,Z,m){
    const l=out.length?out[out.length-1]:null,S=Math.max(+secu||0,Z,l?l.z:Z);
    if(l&&l.z<S-1e-6)out.push({r:1,x:l.x,y:l.y,z:S});
    out.push({r:1,x:X,y:Y,z:S});
    if(Z+2<S)out.push({r:1,x:X,y:Y,z:Z+2});
    out.push(tag({r:0,x:X,y:Y,z:Z},m));n++;
  };
  for(let i=0;i<mv.length;i++){
    const m=mv[i],mok=ok(m.x,m.y,m.z);
    // rapide finissant dans un corps : retiré (la reprise se fera par le haut)
    if(m.r){if(mok)out.push(m);else n++;p=m;pin=mok;continue;}
    if(m.arc||!p){
      if(mok&&(pin||!p))out.push(m);else if(mok)reenter(m.x,m.y,m.z,m);else n++;
      p=m;pin=mok;continue;
    }
    const L=Math.hypot(m.x-p.x,m.y-p.y),K=Math.max(1,Math.ceil(L/1));
    let cx=p.x,cy=p.y,cz=p.z,cin=pin;
    for(let k=1;k<=K;k++){
      const t=k/K,nx=p.x+(m.x-p.x)*t,ny=p.y+(m.y-p.y)*t,nz=p.z+(m.z-p.z)*t,nin=ok(nx,ny,nz);
      if(nin!==cin){
        // croisement affiné (0,05 mm), côté autorisé
        let a0=0,a1=1;
        for(let q=0;q<24;q++){const tm=(a0+a1)/2;const im=ok(cx+(nx-cx)*tm,cy+(ny-cy)*tm,cz+(nz-cz)*tm);
          if(im===cin)a0=tm;else a1=tm;if(Math.hypot(nx-cx,ny-cy,nz-cz)*(a1-a0)<0.05)break;}
        const tt=cin?a0:a1,X=cx+(nx-cx)*tt,Y=cy+(ny-cy)*tt,Z=cz+(nz-cz)*tt;
        if(cin){out.push(tag({r:0,x:X,y:Y,z:Z},m));n++;}
        else reenter(X,Y,Z,m);
      }
      if(nin&&k===K)out.push(m);
      cx=nx;cy=ny;cz=nz;cin=nin;
    }
    p=m;pin=cin;
  }
  if(!n)return mv;
  try{out.diag=mv.diag;}catch(e){}
  return out;
}
// Rapides : un rapide qui passerait dans un corps (pointe sous wT le long du
// trajet) monte sur place à 1 mm au-dessus du corps, traverse, redescend —
// sans plafond au plan de dégagement : le mur n'est jamais traversé.
function faoWallRapids(mv,wT){
  if(!wT||!mv||!mv.length)return mv;
  const out=[];let n=0;
  for(let i=0;i<mv.length;i++){
    const b=mv[i],a=i>0?mv[i-1]:null;
    if(!a||!b.r){out.push(b);continue;}
    const L=Math.hypot(b.x-a.x,b.y-a.y),ns=Math.max(1,Math.ceil(L));
    let hit=false,need=-1/0;
    for(let k=0;k<=ns;k++){const t=k/ns,v=wT(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t);
      if(!(v>-1e8))continue;if(v>need)need=v;if(v>a.z+(b.z-a.z)*t-0.01)hit=true;}
    if(!hit){out.push(b);continue;}
    const H=Math.max(need+1,a.z,b.z);
    if(a.z<H-1e-6)out.push({r:1,x:a.x,y:a.y,z:H});
    out.push({r:1,x:b.x,y:b.y,z:H});
    if(b.z<H-1e-6)out.push(b);
    n++;
  }
  if(!n)return mv;
  try{out.diag=mv.diag;}catch(e){}
  return out;
}
// Dernière passe de toute opération (dispatch) : coupes puis rapides.
function faoWallsApply(mv,op,job,D,secu){
  if(!mv||!mv.length)return mv;
  let wT=null;try{wT=faoWallTip(job,D,0);}catch(e){wT=null;}
  if(!wT)return mv;
  if(op&&op.type!=='drill')mv=faoWallClip(mv,wT,secu);
  return faoWallRapids(mv,wT);
}
// Perçage : un trou dont la pointe descendrait dans un corps est retiré du plan.
function faoWallDrillFilter(list,job,D){
  let wT=null;try{wT=faoWallTip(job,D,0);}catch(e){wT=null;}
  if(!wT)return list;
  return list.filter(function(p){return !(+p.zTip<wT(+p.x,+p.y)-0.01);});
}
// Finition : positions d'outil (x,y) admises loin des corps (aucun contact).
function faoWallFarAt(job,D){
  let wT=null;try{wT=faoWallTip(job,D,0);}catch(e){wT=null;}
  return wT?function(x,y){return !(wT(x,y)>-1e8);}:null;
}

/* ----- arbre FAO : sections « Esquisses » et « Corps » du posage ----- */
function faoWallsTree(tree,s,isSel){
  const mk=function(cls,txt,title){const d=document.createElement('div');d.className=cls;if(txt!=null)d.textContent=txt;if(title)d.title=title;return d;};
  const stop=function(ev){try{if(ev&&ev.stopPropagation)ev.stopPropagation();}catch(e){}};
  const L=faoSkList(s),W=faoWallList(s);
  const hs=mk('fao-op fao-grp',null,'Esquisses propres à la FAO (plan XY du posage) — jamais visibles en CAO ni en mise en plan.');
  const ls=document.createElement('span');ls.className='lb';ls.textContent='✏️ Esquisses ('+L.length+')';hs.appendChild(ls);
  const as=document.createElement('span');as.className='hbtn';as.textContent='+';as.title='Nouvelle esquisse FAO (plan XY du posage)';
  as.onclick=function(ev){stop(ev);faoSkNew(s.id);};hs.appendChild(as);
  tree.appendChild(hs);
  L.forEach(function(sk){
    const d=mk('fao-op fao-sub'+(sk.visible===false?' ishid':''),null,'Clic = modifier l’esquisse');
    const eye=document.createElement('span');eye.className='eye '+(sk.visible===false?'off':'on');eye.textContent=sk.visible===false?'○':'●';
    eye.title='Afficher / masquer l’esquisse dans la vue';
    eye.onclick=function(ev){stop(ev);sk.visible=sk.visible===false;faoTouch();faoWalls3D(true);};
    const lb=document.createElement('span');lb.className='lb';lb.textContent=sk.name+' · '+(sk.entities||[]).length+' traits';
    const ex=document.createElement('span');ex.className='hbtn';ex.textContent='Extruder';ex.title='Nouveau corps FAO depuis cette esquisse';
    ex.onclick=function(ev){stop(ev);faoWallNew(s.id,sk.id);};
    const del=document.createElement('span');del.className='hbtn';del.textContent='✕';del.title='Supprimer l’esquisse (et ses corps)';
    del.onclick=function(ev){stop(ev);faoSkDelete(s,sk.id);};
    d.appendChild(eye);d.appendChild(lb);d.appendChild(ex);d.appendChild(del);
    d.onclick=function(){faoSkOpen(sk.id);};
    tree.appendChild(d);
  });
  const hw=mk('fao-op fao-grp',null,'Corps FAO : murs infranchissables pour toutes les opérations du posage (étau, brides, zones interdites).');
  const lw=document.createElement('span');lw.className='lb';lw.textContent='◧ Corps ('+W.length+')';hw.appendChild(lw);
  const aw=document.createElement('span');aw.className='hbtn';aw.textContent='+';aw.title='Nouveau corps FAO : extrusion de la dernière esquisse FAO';
  aw.onclick=function(ev){stop(ev);faoWallNew(s.id);};hw.appendChild(aw);
  tree.appendChild(hw);
  W.forEach(function(w){
    const on=w.on!==false;
    const d=mk('fao-op fao-sub'+(isSel('faoSetup',s.id)&&sel.wall===w.id?' sel':'')+(on?'':' isoff'),null,'Clic = fiche du corps');
    const eye=document.createElement('span');eye.className='eye '+(on?'on':'off');eye.textContent=on?'●':'○';
    eye.title='Activer / désactiver le corps (un corps désactivé n’arrête plus l’outil)';
    eye.onclick=function(ev){stop(ev);faoSnapshot('activer/désactiver « '+w.name+' »');if(on)w.on=false;else delete w.on;faoChanged();};
    const lb=document.createElement('span');lb.className='lb';
    lb.textContent=w.name+(w.kind==='surface'?' (surface)':'')+' · '+faoWallHLabel(w)+(faoWallMeshWorld(s,w)?'':' ⚠');
    d.appendChild(eye);d.appendChild(lb);
    d.onclick=function(){try{faoRoot().activeSetupId=s.id;sel={kind:'faoSetup',id:s.id,wall:w.id};renderTree();renderProps();faoRenderTree();}catch(e){}};
    tree.appendChild(d);
  });
}
function faoWallHLabel(w){const a=+w.a||0,h=+w.h||0;const f=function(v){return String(+(+v).toFixed(2)).replace('.',',');};if(Math.abs(h)<=1e-6)return 'Z '+f(a);return 'Z '+f(Math.min(a,a+h))+' → '+f(Math.max(a,a+h));}

/* ----- fiche d'un corps (panneau droit) ----- */
function faoWallFiche(p,setup,w){
  p.appendChild(faoH('Corps FAO · '+setup.name));
  const c=faoCard();
  const r0=faoRow();r0.appendChild(faoLab('Nom'));
  r0.appendChild(faoTxt(w.name,function(v){w.name=String(v).slice(0,60)||w.name;faoTouch();},140));
  c.appendChild(r0);
  const r1=faoRow();r1.appendChild(faoLab('Esquisse'));
  const opts=faoSkList(setup).map(function(q){return [q.id,q.name,(q.entities||[]).length+' traits'];});
  r1.appendChild(faoSel(opts,w.sk,function(v){faoSnapshot('esquisse du corps');w.sk=v;faoChanged();},'Esquisse FAO extrudée (contours fermés, trous et cercles compris).'));
  r1.appendChild(faoMini('Modifier',function(){faoSkOpen(w.sk);},'Ouvrir l’esquisse dans l’éditeur.'));
  c.appendChild(r1);
  const rk=faoRow();rk.appendChild(faoLab('Type'));
  rk.appendChild(faoSel([['solid','Solide','Prisme des contours fermés de l’esquisse.'],['surface','Surface','Parois sans épaisseur le long de chaque trait (même ouvert) ; hauteur 0 : surface plane des contours fermés.']],
    w.kind==='surface'?'surface':'solid',function(v){faoSnapshot('type du corps');if(v==='surface')w.kind='surface';else{delete w.kind;if(Math.abs(+w.h||0)<1e-6)w.h=10;}faoChanged();},
    'Solide (volume) ou surface simple (paroi, plancher).'));
  c.appendChild(rk);
  const r2=faoRow();
  r2.appendChild(faoLab('Départ Z'));
  r2.appendChild(faoNum(+w.a||0,function(v){w.a=v;},54,1,'Cote de départ le long de la normale de l’esquisse (Z du posage), mm.'));
  r2.appendChild(faoLab('Hauteur'));
  r2.appendChild(faoNum(+w.h||0,function(v){if(Math.abs(v)>1e-6||w.kind==='surface')w.h=v;},54,1,'Hauteur de l’extrusion (mm) — négative : vers le bas ; 0 (surface) : surface plane à la cote de départ.'));
  c.appendChild(r2);
  const r3=faoRow();
  r3.appendChild(faoLab('Marge'));
  r3.appendChild(faoNum(faoWallM(w),function(v){w.m=Math.max(0,v);},54,0.1,'Distance minimale entre l’outil (flanc et pointe) et le corps, mm.'));
  const cb=document.createElement('input');cb.type='checkbox';cb.checked=w.on!==false;
  cb.onchange=function(){faoSnapshot('activer/désactiver « '+w.name+' »');if(cb.checked)delete w.on;else w.on=false;faoChanged();};
  const lb=document.createElement('label');lb.className='fao-check';lb.appendChild(cb);lb.appendChild(document.createTextNode('Actif'));
  r3.appendChild(lb);
  c.appendChild(r3);
  if(!faoWallMeshWorld(setup,w))c.appendChild(faoHelp(w.kind==='surface'?'⚠ Surface vide : aucun trait fort (hauteur 0 : aucun contour fermé).':'⚠ Corps vide : l’esquisse n’a aucun contour fermé (traits forts) — type Surface pour des traits ouverts.'));
  c.appendChild(faoHelp('Mur infranchissable pour TOUTES les opérations du posage : l’outil ne touche jamais le corps (ou la surface) gonflé de la marge — coupes reprises par le haut, rapides relevés au-dessus, trous retirés. Visible seulement en FAO.'));
  const r4=faoRow();
  r4.appendChild(faoMini('Supprimer',function(){faoWallDelete(setup,w.id);},'Supprimer ce corps (l’esquisse reste).'));
  r4.appendChild(faoMini('← Posage '+setup.name,function(){faoSelectSetup(setup.id);},'Retour à la fiche du posage.'));
  c.appendChild(r4);
  p.appendChild(c);
}

/* ----- affichage 3D (espace FAO seulement : groupe racine du posage) ----- */
let faoWallsG=null,faoWallsGSig='';
function faoWalls3D(force){
  try{
    if(typeof THREE==='undefined'||typeof scene==='undefined'||!scene)return;
    const setup=faoSetup();
    const W=faoWallList(setup).filter(function(w){return w.on!==false;});
    const S=faoSkList(setup).filter(function(q){return q.visible!==false;});
    let sig='';
    try{sig=setup.id+'|'+faoFrameSig(setup)+'|'+JSON.stringify([W,S.map(function(q){return [q.id,q.entities,q.points,q.origin,q.axN];}),faoSkEditId]);}catch(e){sig=String(Math.random());}
    if(!force&&sig===faoWallsGSig&&faoWallsG&&faoWallsG.parent)return;
    faoWallsGSig=sig;
    if(faoWallsG){try{faoWallsG.traverse(function(o){if(o.geometry)o.geometry.dispose();if(o.material&&o.material.dispose)o.material.dispose();});faoDel3D(faoWallsG);}catch(e){}}
    faoWallsG=new THREE.Group();faoWallsG.name='faoWalls';
    const F=faoFrame(setup);
    const toF=function(p){return F.id?p:faoToF(F,p);};
    W.forEach(function(w){
      const m=faoWallMeshWorld(setup,w);if(!m)return;
      const pos=[];m.t.forEach(function(t){for(let k=0;k<3;k++){const q=toF(m.v[t[k]]);pos.push(q[0],q[1],q[2]);}});
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
      const mat=new THREE.MeshStandardMaterial({color:0x8fd3ff,transparent:true,opacity:0.32,side:THREE.DoubleSide,depthWrite:false,roughness:0.7,metalness:0});
      const me=new THREE.Mesh(g,mat);me.name='faoWall_'+w.id;me.renderOrder=3;faoWallsG.add(me);
      try{const eg=new THREE.EdgesGeometry(g,30);const el=new THREE.LineSegments(eg,new THREE.LineBasicMaterial({color:0x8fd3ff,transparent:true,opacity:0.8}));faoWallsG.add(el);}catch(e){}
    });
    S.forEach(function(sk){
      if(sk.id===faoSkEditId)return; // en édition : l'éditeur la dessine
      const pos=[];
      faoSkStrokes(sk).forEach(function(S){const ring=S.pts;{
        for(let k=0;k<(S.closed?ring.length:ring.length-1);k++){const a=ring[k],b=ring[(k+1)%ring.length];
          const A=toF(occW(sk,a[0],a[1])),B=toF(occW(sk,b[0],b[1]));pos.push(A[0],A[1],A[2],B[0],B[1],B[2]);}}});
      if(!pos.length)return;
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
      faoWallsG.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x5ac8fa})));
    });
    faoAdd3D(faoWallsG);
  }catch(e){}
}
