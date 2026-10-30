// Espace PLAN — suite de la fonction englobante ouverte dans 98-mep-00-modele.js (état privé partagé, fermée dans 98-mep-95-export-init.js) : interactions souris.
  /* ═══════════════ T. interactions souris ═══════════════ */
  function mepSetTool(t){
    mepCtxHide();
    try{if(typeof mfCloseMenus==='function')mfCloseMenus();}catch(e){}
    const next=t||'select';
    // 2026-10-22-018 : groupe d'ordonnées sélectionné + outil Ordonnées du même axe → on y AJOUTE des points
    let ordKeep=null;
    if(next==='ordx'||next==='ordy'){
      const sh0=mepSheet(),g0=sh0&&mepSt.selDim?sh0.dims.find(x=>x.id===mepSt.selDim):null;
      if(g0&&g0.kind==='ord'&&(g0.axis==='y')===(next==='ordy'))ordKeep=g0.id;
    }
    if(next!=='select'&&next!==mepSt.tool){mepSt.sel=null;mepSt.selDim=null;mepSt.selAxis=null;}
    mepSt.tool=next;
    if(next==='select')mepSt.entSel=[];
    mepSt.pick=null;mepSt.dim=null;mepSt.cutPts=[];mepSt.detC=null;mepSt.hovEnt=null;mepSt.skSel=new Set();mepSt.lot=null;mepSt.vcmd=null;
    mepSt.axisPick=[];mepSt.axisFree=null;mepSt.ord=null;mepSt.ordPt=null;mepSt.snapMode=null;mepSt.snapHov=null;
    mepSt.intPick=null;mepSt.dimLine=null;mepSt.chain=null;
    if(ordKeep){mepSt.ord=ordKeep;mepSt.selDim=ordKeep;mepStatus('Ordonnées : cliquez les points à AJOUTER au groupe sélectionné (Entrée ou Échap pour terminer).');}
    mepToolSync();
    try{mepSideShow();}catch(e){}
    if(mepSt.tool==='dim'&&mepSt.entSel&&mepSt.entSel.length){
      const d=mepDimDraftFromSel();
      if(d){
        d.__sel=false;
        mepSt.dim=d;mepRender();
        mepStatus(mepSt.entSel.length>=2
          ?'2 entités — cliquez pour poser la cote (clic droit : R/Ø, Échap annule).'
          :'Cote : cliquez une 2ᵉ entité ou posez la cote (clic droit : R/Ø, Échap annule).');
        return;
      }
      mepRender();
      mepStatus('Cote : sélectionnez 1 arête/cercle (ou 2 pour angle/entraxe).');
      return;
    }
    if(mepSt.tool==='hole'&&mepSt.entSel&&mepSt.entSel.length===1){
      const sh=mepSheet(),s=mepSt.entSel[0],ref=mepEntRef(sh,s);
      if(ref&&ref.e.t==='C'){
        const d=mepHoleDraft(sh,ref.v.id,ref.e,ref.i);
        if(d){
          d.__sel=false;
          mepSt.dim=d;mepRender();
          mepStatus('Perçage : cliquez pour placer l’étiquette (Échap annule).');
          return;
        }
      }
      mepStatus('Perçage : ce cercle ne correspond pas à une fonction Perçage.');
      mepRender();
      return;
    }
    const msg={
      select:'Sélection : clic = entité · clic sur cote = la déplacer · glisser = déplacer la vue · Suppr = effacer',
      line:'Ligne : cliquez le départ, puis l’arrivée (snap auto). Échap pour annuler.',
      rect:'Rectangle : clic 1 = coin, clic 2 = opposé.',
      circle:'Cercle : centre + un point du rayon.',
      arc:'Arc 3 points : centre, départ, arrivée.',
      point:'Point : cliquez pour placer.',
      trim:'Ajuster : cliquez le tronçon à couper entre 2 intersections.',
      dim:'Cote : cliquez une arête/cercle · 2ᵉ entité pour distance/angle · cliquez pour poser · clic droit : accrochage (extrémité, milieu, extrême X/Y, intersection)',
      hole:'Perçage : cliquez un cercle de perçage, puis posez l’étiquette.',
      axis:'Axes : cliquez un trou (ou utilisez Alignement / Cercle / Libre dans le panneau).',
      cut2:'Coupe : 2 clics sur la ligne de coupe.',
      det2:'Détail : centre + rayon.'
    }[t]||'';
    if(msg)mepStatus(msg);
    mepRender();
  }
  function mepAxisModeStatus(){
    const m=mepSt.axisMode||'hole',n=(mepSt.axisPick||[]).length;
    if(m==='align')return 'Alignement : '+n+' trou(s) sélectionné(s) — cliquez encore ou Entrée pour créer.';
    if(m==='pitch')return 'Cercle de perçage : '+n+' trou(s) sélectionné(s) — cliquez encore ou Entrée pour créer.';
    if(m==='free')return 'Axe libre : cliquez le départ puis l’arrivée.';
    if(m==='sym')return mepSt.axisSym?'Axe de symétrie : cliquez la 2ᵉ droite.':'Axe de symétrie : cliquez 2 droites (parallèles : axe médian ; sécantes : bissectrice).';
    return 'Axe de trou : cliquez un trou.';
  }
  function mepSetAxisMode(m){
    mepSt.axisMode=m||'hole';mepSt.axisSym=null;
    mepSetTool('axis');
    mepStatus(mepAxisModeStatus());
    try{mepSideShow();}catch(e){}
  }
  function mepAxisCommitPattern(){
    const mode=mepSt.axisMode||'hole';
    const picks=(mepSt.axisPick||[]).slice();
    if(!picks.length)return false;
    const sh=mepSheet(),v=mepView(sh,picks[0].vid);
    if(!v){mepStatus('Axe : vue introuvable.');return false;}
    if(picks.some(r=>r.vid!==v.id)){mepStatus('Axe : sélectionnez les trous dans la même vue.');return false;}
    const hs=picks.map(r=>mepAxisRefGeom(sh,v,r)).filter(Boolean);
    const tol=MEP_AXIS.tol/mepAxisScale(v);
    if(mode==='align'){
      if(hs.length<2){mepStatus('Alignement : sélectionnez au moins 2 trous.');return false;}
      if(!mepAxisCollinear(hs,tol)){mepStatus('Alignement : les centres ne sont pas alignés.');return false;}
      mepSt.axisPick=[];
      mepEdit('axe aligné',()=>{v.axes.push({id:mepUid('ax'),kind:'align',refs:picks});});
      mepStatus('Axe commun créé sur '+hs.length+' trous.');
      return true;
    }
    if(mode==='pitch'){
      if(hs.length<3){mepStatus('Cercle de perçage : sélectionnez au moins 3 trous.');return false;}
      const C=mepAxisFitCircle(hs);
      if(!C||mepAxisResidual(hs,C)>Math.max(0.1,tol*2)){mepStatus('Cercle de perçage : les centres ne sont pas sur un même cercle.');return false;}
      mepSt.axisPick=[];
      mepEdit('cercle de perçage',()=>{v.axes.push({id:mepUid('ax'),kind:'pitch',refs:picks});});
      mepStatus('Cercle de perçage créé sur '+hs.length+' trous.');
      return true;
    }
    return false;
  }
  function mepAxisCommitFree(a,b){
    if(!a||!b||a.vid!==b.vid)return false;
    const sh=mepSheet(),v=mepView(sh,a.vid);
    if(!v)return false;
    const A={x:(a.x-v.x)/v.scale,y:(a.y-v.y)/v.scale};
    const B={x:(b.x-v.x)/v.scale,y:(b.y-v.y)/v.scale};
    if(Math.hypot(B.x-A.x,B.y-A.y)<0.2){mepStatus('Axe libre : points confondus.');return false;}
    mepSt.axisFree=null;
    mepEdit('axe libre',()=>{v.axes.push({id:mepUid('ax'),kind:'free',a:A,b:B});});
    mepStatus('Axe libre créé.');
    return true;
  }
  /* 2026-10-22-012 : AXE DE SYMÉTRIE entre 2 droites d'une vue (« je dois pouvoir
     faire un axe symétrique à 2 droites ») — parallèles : axe médian ; sécantes :
     bissectrice de l'angle qui les contient. Longueur = étendue des 2 droites
     sur l'axe + dépassement normalisé ; enregistré comme axe libre (a, b) : ses
     extrémités se tirent à la souris. */
  function mepAxisSymGeom(e1,e2,v){
    const A1=[e1.x1,e1.y1],B1=[e1.x2,e1.y2],A2=[e2.x1,e2.y1],B2=[e2.x2,e2.y2];
    const nrm=d=>{const L=Math.hypot(d[0],d[1]);return L>1e-12?[d[0]/L,d[1]/L]:null;};
    let d1=nrm([B1[0]-A1[0],B1[1]-A1[1]]),d2=nrm([B2[0]-A2[0],B2[1]-A2[1]]);
    if(!d1||!d2)return null;
    const pts=[A1,B1,A2,B2],over=MEP_AXIS.overrun/mepAxisScale(v);
    const cr=d1[0]*d2[1]-d1[1]*d2[0];
    let O,u;
    if(Math.abs(cr)<0.02){ // parallèles : médiane
      if(d1[0]*d2[0]+d1[1]*d2[1]<0)d2=[-d2[0],-d2[1]];
      u=nrm([d1[0]+d2[0],d1[1]+d2[1]]);
      O=[(A1[0]+B1[0]+A2[0]+B2[0])/4,(A1[1]+B1[1]+A2[1]+B2[1])/4];
    }else{ // sécantes : bissectrice depuis l'intersection X
      const t=((A2[0]-A1[0])*d2[1]-(A2[1]-A1[1])*d2[0])/cr;
      const X=[A1[0]+d1[0]*t,A1[1]+d1[1]*t];
      const away=(A,B,d)=>{const far=Math.hypot(A[0]-X[0],A[1]-X[1])>Math.hypot(B[0]-X[0],B[1]-X[1])?A:B;
        return (far[0]-X[0])*d[0]+(far[1]-X[1])*d[1]<0?[-d[0],-d[1]]:d;};
      d1=away(A1,B1,d1);d2=away(A2,B2,d2);
      u=nrm([d1[0]+d2[0],d1[1]+d2[1]]);if(!u)return null;
      O=X;
    }
    const ts=pts.map(p=>(p[0]-O[0])*u[0]+(p[1]-O[1])*u[1]);
    const t0=Math.min(...ts)-over,t1=Math.max(...ts)+over;
    return{a:{x:O[0]+u[0]*t0,y:O[1]+u[1]*t0},b:{x:O[0]+u[0]*t1,y:O[1]+u[1]*t1}};
  }
  /* 2026-10-22-004 : l'axe de symétrie SUIT ses arêtes (« la fonction Axes (Symétrie)
     doit suivre ses arêtes si elles bougent ») — ann {kind:'sym', l1, l2} garde les 2
     droites sources (mm modèle de la vue). À chaque géométrie neuve de la vue, chacune
     est retrouvée : même direction (± 2°), puis le trait le plus proche en position et
     en longueur ; l1/l2 sont mis à jour (suivi pas à pas des modifications). Aucune
     droite parallèle trouvée : la dernière position connue est gardée. */
  // coût d'appariement d'un trait e avec un trait mémorisé L (même direction, même nature de trait)
  function mepAxisTrackCost(L,e){
    const dx=L.x2-L.x1,dy=L.y2-L.y1,len=Math.hypot(dx,dy);if(!(len>1e-9)||e.t!=='L')return Infinity;
    if(L.k&&e.k&&L.k!==e.k)return Infinity; // caché ≠ vu ≠ filetage
    if(!L.k&&(e.k==='thread'||e.k==='threadH'))return Infinity; // ancienne référence : jamais un trait de filetage
    const ex=e.x2-e.x1,ey=e.y2-e.y1,el=Math.hypot(ex,ey);if(!(el>1e-9))return Infinity;
    const ux=dx/len,uy=dy/len;
    if(Math.abs(ux*ey/el-uy*ex/el)>0.035)return Infinity;
    const cx=(e.x1+e.x2)/2-(L.x1+L.x2)/2,cy=(e.y1+e.y2)/2-(L.y1+L.y2)/2;
    return Math.abs(cx*uy-cy*ux)+0.5*Math.abs(cx*ux+cy*uy)+0.5*Math.abs(el-len);
  }
  /* les 2 droites d'un axe de symétrie suivies ENSEMBLE : même nature, même ordre, écartement
     non effondré (> 30 % de l'original — un trait coupé en deux n'est pas une paire), somme des
     déplacements + variation d'écartement minimale — suivies séparément, chacune sautait sur la
     droite voisine la plus proche (un trait de filetage, l'autre bord du trou…) */
  function mepAxisTrackPair(geo,l1,l2){
    const els=((geo&&geo.els)||[]).filter(e=>e.t==='L');
    const dx=l1.x2-l1.x1,dy=l1.y2-l1.y1,len=Math.hypot(dx,dy);if(!(len>1e-9))return null;
    const nx=-dy/len,ny=dx/len,off=e=>((e.x1+e.x2)/2)*nx+((e.y1+e.y2)/2)*ny,sep0=off(l2)-off(l1);
    const c1=els.map(e=>[e,mepAxisTrackCost(l1,e)]).filter(a=>a[1]<Infinity);
    const c2=els.map(e=>[e,mepAxisTrackCost(l2,e)]).filter(a=>a[1]<Infinity);
    let best=null,bc=Infinity;
    c1.forEach(([a,ca])=>c2.forEach(([b,cb])=>{
      if(a===b||(a.k||'')!==(b.k||''))return; // les 2 droites d'une paire sont de même nature
      const sep=off(b)-off(a);
      if(sep*sep0<=0||Math.abs(sep)<0.3*Math.abs(sep0))return;
      const lim=Math.max(3,0.6*len,0.6*Math.abs(sep0));if(ca>lim||cb>lim)return;
      const c=ca+cb+Math.abs(sep-sep0);if(c<bc){bc=c;best=[a,b];}
    }));
    return best;
  }
  function mepAxisTrackLine(geo,L,skip){
    const dx=L.x2-L.x1,dy=L.y2-L.y1,len=Math.hypot(dx,dy);if(!(len>1e-9))return null;
    const ux=dx/len,uy=dy/len,mx=(L.x1+L.x2)/2,my=(L.y1+L.y2)/2;
    let best=null,bc=Infinity;
    ((geo&&geo.els)||[]).forEach(e=>{
      if(e.t!=='L'||e===skip)return;
      if(L.k&&e.k&&L.k!==e.k)return; // même nature de trait
      const ex=e.x2-e.x1,ey=e.y2-e.y1,el=Math.hypot(ex,ey);if(!(el>1e-9))return;
      if(Math.abs(ux*ey/el-uy*ex/el)>0.035)return; // pas parallèle
      const cx=(e.x1+e.x2)/2-mx,cy=(e.y1+e.y2)/2-my;
      const perp=Math.abs(cx*uy-cy*ux),along=Math.abs(cx*ux+cy*uy);
      const c=perp+0.5*along+0.5*Math.abs(el-len);
      if(c<bc){bc=c;best=e;}
    });
    // 2026-10-22-019 : trop différent → pas retrouvé (on garde la dernière position connue)
    return bc<=Math.max(3,0.6*len)?best:null;
  }
  // géométrie exacte (noyau) : la seule sur laquelle des références peuvent être MISES À JOUR —
  // à l'ouverture, les vues passent d'abord par le maillage (arêtes de triangles)
  function mepGeoExact(g){return !!(g&&(/^OCCT/.test(g.src||'')||g.src==='dxf'));} // DXF : géométrie exacte et figée
  function mepAxisSymMigrate(v,ann){
    // axe de symétrie d'avant V0.3.28 (figé : a, b) → 2 droites parallèles symétriques autour de lui
    const g=mepGeoOf(v);if(!mepGeoExact(g))return;
    const dx=ann.b.x-ann.a.x,dy=ann.b.y-ann.a.y,L=Math.hypot(dx,dy);if(!(L>1e-9))return;
    const ux=dx/L,uy=dy/L,sd=e=>{const mx=(e.x1+e.x2)/2-ann.a.x,my=(e.y1+e.y2)/2-ann.a.y;return mx*uy-my*ux;};
    const par=g.els.filter(e=>{if(e.t!=='L'||e.k==='thread'||e.k==='threadH')return false;const ex=e.x2-e.x1,ey=e.y2-e.y1,el=Math.hypot(ex,ey);
      return el>1e-6&&Math.abs(ux*ey/el-uy*ex/el)<0.02&&Math.abs(sd(e))>0.01;});
    let best=null,bd=Infinity;
    for(let i=0;i<par.length;i++)for(let j=0;j<par.length;j++){
      const a=par[i],b=par[j],da=sd(a),db=sd(b);
      if(da<=0||db>=0||Math.abs(da+db)>0.02||(a.k||'')!==(b.k||''))continue;
      const la=Math.hypot(a.x2-a.x1,a.y2-a.y1),lb=Math.hypot(b.x2-b.x1,b.y2-b.y1);
      if(Math.abs(la-lb)>0.05)continue;
      if(da<bd){bd=da;best=[a,b];}
    }
    if(!best)return;
    const ln=e=>({x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2,k:e.k});
    ann.kind='sym';ann.l1=ln(best[0]);ann.l2=ln(best[1]);delete ann.a;delete ann.b;delete ann.sym;
  }
  function mepAxisSymTrack(v,ann){
    if(!ann.l1||!ann.l2)return null;
    const geo=mepGeoOf(v);
    const pr=mepAxisTrackPair(geo,ann.l1,ann.l2),e1=pr?pr[0]:null,e2=pr?pr[1]:null;
    const ln=e=>({x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2,k:e.k});
    // « les axes de symétrie ne gardent pas leurs références » : à l'ouverture la vue est d'abord
    // calculée sur le MAILLAGE, et le suivi réécrivait l1/l2 sur des arêtes de triangles.
    // Mise à jour seulement sur la géométrie exacte, et sur deux traits retrouvés.
    if(e1&&e2&&mepGeoExact(geo)){ann.l1=ln(e1);ann.l2=ln(e2);} // dérivé de la géométrie : pas d'étape d'annulation
    if(!mepGeoExact(geo))return mepAxisSymGeom(ann.l1,ann.l2,v);
    return mepAxisSymGeom(e1||ann.l1,e2||ann.l2,v);
  }
  function mepAxisClick(sh,P){
    const mode=mepSt.axisMode||'hole';
    if(mode==='sym'){
      const hit=mepHitViewEnt(sh,P.x,P.y);
      if(!hit||!hit.e||hit.e.t!=='L'){mepStatus('Axe de symétrie : cliquez une droite d’une vue.');return;}
      if(!mepSt.axisSym){mepSt.axisSym={vid:hit.vid,e:hit.e};mepStatus(mepAxisModeStatus());mepRender();return;}
      const f=mepSt.axisSym;mepSt.axisSym=null;
      if(f.vid!==hit.vid){mepStatus('Axe de symétrie : les 2 droites doivent être dans la même vue.');return;}
      if(f.e===hit.e){mepStatus('Axe de symétrie : cliquez une AUTRE droite.');mepSt.axisSym=f;return;}
      const v=mepView(sh,hit.vid);if(!v)return;
      const G=mepAxisSymGeom(f.e,hit.e,v);
      if(!G){mepStatus('Axe de symétrie : droites dégénérées.');return;}
      if(!Array.isArray(v.axes))v.axes=[];
      const ln=e=>({x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2,k:e.k});
      mepEdit('axe de symétrie',()=>{v.axes.push({id:mepUid('ax'),kind:'sym',l1:ln(f.e),l2:ln(hit.e)});});
      mepStatus('Axe de symétrie créé — tirez ses extrémités pour l’allonger.');
      return;
    }
    if(mode==='free'){
      const snap=mepSnapPt(P.x,P.y,sh),v=mepViewAt(sh,snap.x,snap.y);
      if(!v){mepStatus('Axe libre : cliquez dans une vue.');return;}
      if(!mepSt.axisFree){
        mepSt.axisFree={a:{x:snap.x,y:snap.y,vid:v.id},cur:{x:snap.x,y:snap.y}};
        mepStatus('Axe libre : cliquez le 2ᵉ point.');
        mepRender();return;
      }
      const a=mepSt.axisFree.a;
      if(v.id!==a.vid){mepStatus('Axe libre : les 2 points doivent être dans la même vue.');return;}
      mepAxisCommitFree(a,{x:snap.x,y:snap.y,vid:v.id});
      return;
    }
    const ref=mepAxisHoleAt(sh,P.x,P.y);
    if(!ref){mepStatus('Axe : cliquez un trou.');return;}
    const v=mepView(sh,ref.vid);if(!v)return;
    if(mode==='hole'){
      if(!Array.isArray(v.axes))v.axes=[];
      mepEdit('axe de perçage',()=>{v.axes.push({id:mepUid('ax'),kind:'hole',ref});});
      mepStatus('Axe de trou créé.');
      return;
    }
    if(!Array.isArray(mepSt.axisPick))mepSt.axisPick=[];
    if(mepSt.axisPick.length&&mepSt.axisPick[0].vid!==ref.vid){
      mepStatus('Axe : sélectionnez les trous dans la même vue.');return;
    }
    const ix=mepSt.axisPick.findIndex(r=>r.fid===ref.fid&&r.pid===ref.pid);
    if(ix>=0)mepSt.axisPick.splice(ix,1);else mepSt.axisPick.push(ref);
    mepStatus(mepAxisModeStatus());
    mepRender();
  }
  function mepToolSync(){/* plus de barre d'outils interne — le panneau latéral gère l'outil actif */}
  function mepDimDragStart(sh,P,dim,ev){
    mepSt.selDim=dim.id;mepSt.sel=null;mepSt.entSel=[];
    mepSt.ordPt=dim.kind==='ord'?{id:dim.id,i:mepOrdPtAt(sh,dim,P)}:null;
    // ordonnée + Ctrl : cassure — glisser décale la valeur le long de l'axe (ligne de rappel coudée),
    // Ctrl + clic sans glisser la retire
    if(dim.kind==='ord'&&ev&&(ev.ctrlKey||ev.metaKey)&&mepSt.ordPt.i>=0){
      const q=dim.pts[mepSt.ordPt.i];
      mepSt.pick={kind:'dimDrag',id:dim.id,sx:P.x,sy:P.y,px0:P.px,py0:P.py,jog:{i:mepSt.ordPt.i,j0:+q.jog||0},moved:false,undoPushed:false};
      mepStatus('Cassure : glissez pour dégager la valeur (Ctrl + clic sans glisser : la retire).');
      mepSideShow();mepRender();return;
    }
    const w=mepDimWorld(sh,dim);
    const tp=mepDimTextPos(sh,dim);
    let labelHit=!!tp&&Math.hypot(P.x-tp.x,P.y-tp.y)<=18/(mepSt.zoom||1);
    if(dim.kind==='ang'){ // texte collé à l'arc : seule sa boîte (pas l'arc voisin) le saisit
      const ap=mepAngTextPos(sh,dim),m=1.5/(mepSt.zoom||1);
      labelHit=!!ap&&Math.abs(P.x-ap.x)<=ap.hw+m&&Math.abs(P.y-ap.y)<=ap.hh+m;
    }
    mepSt.pick={kind:'dimDrag',id:dim.id,sx:P.x,sy:P.y,px0:P.px,py0:P.py,
      cx:w?w.b.x:null,cy:w?w.b.y:null,off0:dim.off,txtOff0:+dim.txtOff||0,labelHit,moved:false,undoPushed:false,
      rappel:mepSt.tool==='dim'?mepChainRappelAt(sh,dim,P):null}; // clic sans glisser sur un rappel : chaîne
    mepSideShow();mepRender();
  }
  function mepOnDown(ev){
    if(ev.button===1){ // double-clic molette = planche entière
      const now=Date.now();
      if(mepSt.lastMid&&now-mepSt.lastMid<380){mepSt.lastMid=0;mepFitSheet();mepRender();mepStatus('Planche entière.');ev.preventDefault();return;}
      mepSt.lastMid=now;
    }
    if(ev.button===1||(ev.button===0&&ev.altKey)){ // middle / alt = pan
      mepSt.pick={kind:'pan',sx:ev.clientX,sy:ev.clientY,px:mepSt.pan.x,py:mepSt.pan.y};
      mepSvgEl.setPointerCapture(ev.pointerId);
      ev.preventDefault();
      return;
    }
    if(ev.button!==0)return;
    mepSvgEl.setPointerCapture(ev.pointerId);
    const P=mepPt(ev);
    const sh=mepSheet();
    if(mepSt.vcmd){mepVcmdDown(sh,P,ev);return;}
    const tool=mepSt.tool;
    if(tool==='select'){
      if(mepSt.alignDims){ // outil Aligner : ce clic désigne la cote de référence
        const ref=mepDimAt(sh,P.x,P.y),ids=mepSt.alignDims;
        if(!ref){mepStatus('Aligner : cliquez une COTE de référence (Échap pour annuler).');return;}
        mepSt.alignDims=null;
        let res=null;mepEdit('alignement de cotes',()=>{res=mepDimAlignTo(sh,ref,ids);});
        mepStatus(res&&res.n?res.n+' cote(s) alignée(s) sur la référence'+(res.skip?' ; '+res.skip+' ignorée(s) (non parallèle(s))':'')+'.'
          :'Aligner : aucune cote parallèle à la référence.');
        mepSt.selDim=ref.id;mepSideShow();mepRender();return;
      }
      {let dA=(ev.shiftKey||ev.ctrlKey||ev.metaKey)?mepDimAt(sh,P.x,P.y):null;
       if(dA&&dA.kind==='ord'&&(ev.ctrlKey||ev.metaKey)&&!ev.shiftKey){mepDimDragStart(sh,P,dA,ev);return;} // Ctrl : cassure d'ordonnée
       if(dA){ // Maj/Ctrl + clic sur une cote : sélection multiple (la cote déjà active y entre aussi)
         const lot=mepSt.lot||{views:new Set(),dims:new Set()};
         if(mepSt.selDim&&mepSt.selDim!==dA.id&&!lot.dims.size)lot.dims.add(mepSt.selDim);
         if(lot.dims.has(dA.id))lot.dims.delete(dA.id);else lot.dims.add(dA.id);
         mepSt.lot=(lot.views.size||lot.dims.size)?lot:null;mepSt.selDim=null;mepSt.sel=null;
         mepStatus((mepSt.lot?mepSt.lot.dims.size:0)+' cote(s) sélectionnée(s).');
         mepSideShow();mepRender();return;}}
      if(!(ev.shiftKey||ev.ctrlKey||ev.metaKey))mepSt.lot=null;
      // esquisse (planche, ou cartouche en édition) : sélection, Maj = ajout, glisser = déplacer sous contraintes
      {const hk=mepSkHit(sh,P);
       if(hk){
         const add=ev.shiftKey||ev.ctrlKey||ev.metaKey;
         // texte non sélectionné : clic = le sélectionner, glisser = cadre de sélection
         // (les textes couvrent presque tout le cartouche) ; texte déjà sélectionné : glisser = déplacer
         if(hk.key[0]==='e'&&!(mepSt.skSel&&mepSt.skSel.has(hk.key))){
           const c0=mepSkCtx(sh,false),e0=c0.sk&&c0.sk.ents.find(x=>x.id===hk.key.slice(2));
           if(e0&&e0.t==='text'){mepSt.pick={kind:'box',sx:P.x,sy:P.y,cur:{x:P.x,y:P.y},px0:P.px,py0:P.py,add,clickKey:hk.key};return;}
         }
         mepSkSelect(hk.key,add);
         if(!add&&hk.key[0]!=='c'){const ctx=mepSkCtx(sh,false);
           mepSt.pick={kind:'skDrag',key:hk.key,sx:P.x,sy:P.y,px0:P.px,py0:P.py,base:mepSkSnapshot(ctx.sk),moved:false,undoPushed:false};}
         mepSideShow();mepRender();return;
       }
       const addK=ev.shiftKey||ev.ctrlKey||ev.metaKey;
       if(mepSt.tbEdit){mepSt.pick={kind:'box',sx:P.x,sy:P.y,cur:{x:P.x,y:P.y},px0:P.px,py0:P.py,add:addK};return;}
       if(!addK){if(mepSt.skSel&&mepSt.skSel.size)mepSt.skSel=new Set();mepSt.lot=null;}}
      // flèche de coupe ? → glisser le bout (trait fort + flèche + lettre) le long de la ligne de coupe
      {const ca=mepCutArrowAt(sh,P.x,P.y);
       if(ca){const shf=Array.isArray(ca.v.section.sh)?ca.v.section.sh:[0,0];
         mepSt.sel=ca.v.id;mepSt.selDim=null;mepSt.selAxis=null;
         mepSt.pick={kind:'cutDrag',vid:ca.v.id,end:ca.end,s0:+shf[ca.end]||0,sx:P.x,sy:P.y,px0:P.px,py0:P.py,moved:false,undoPushed:false};
         mepSideShow();mepRender();return;}}
      // tronçon d'une coupe brisée ? → glisser perpendiculairement à lui-même
      {const cs=mepCutSegAt(sh,P.x,P.y);
       if(cs){
         mepSt.sel=cs.v.id;mepSt.selDim=null;mepSt.selAxis=null;
         const M=mepCutModel(cs.v),G=mepFromSheet(cs.par,P.x,P.y),sG=M?G.x*M.t.x+G.y*M.t.y:0;
         if(ev.shiftKey){ // Maj + clic : enlève la brisure la plus proche du curseur
           let ok=false;mepEdit('ligne de coupe : brisure retirée',()=>{ok=mepCutDelBreakAt(sh,cs.v,cs.j,sG);});
           mepStatus(ok?'Ligne de coupe '+(cs.v.label||'')+' : brisure retirée.':'Ligne de coupe : aucune brisure à retirer.');
           mepSideShow();mepRender();return;}
         mepSt.pick={kind:'cutSeg',vid:cs.v.id,j:cs.j,M,sG,brk:ev.ctrlKey||ev.metaKey,px0:P.px,py0:P.py};
         mepSideShow();mepRender();return;}}
      // V0.8.2 : outil « ＋ Bulle » (clic sur une pièce d'une vue d'assemblage)
      if(mepSt.blAdd){let r=null;mepEdit('bulle ajoutée',()=>{r=mepBalloonAddAt(sh,P.x,P.y);});
        if(r&&r.ok){mepSt.selBl=r.b.id;mepSt.sel=null;mepSt.selDim=null;mepSt.selAxis=null;}
        mepStatus(r?r.msg:'');mepSideShow();mepRender();return;}
      // V0.8.2 : bulle ? → sélection + glisser pour la placer (Suppr la retire)
      {const bl=mepBalloonAt(sh,P.x,P.y);
       if(bl){const v=mepView(sh,bl.view),l=mepLocal(v,bl.p),A=mepToSheet(v,l[0],l[1]);
         mepSt.selBl=bl.id;mepSt.sel=null;mepSt.selDim=null;mepSt.selAxis=null;
         mepSt.pick={kind:'blDrag',id:bl.id,ox:P.x-(A.x+(+bl.dx||0)),oy:P.y-(A.y+(+bl.dy||0)),ax:A.x,ay:A.y,px0:P.px,py0:P.py,moved:false,undoPushed:false};
         mepStatus('Bulle : glissez pour la placer, Suppr pour la retirer.');
         mepSideShow();mepRender();return;}
       if(mepSt.selBl){mepSt.selBl=null;}}
      // titre de vue ? → glisser le long de l'axe de la vue
      {const tv=mepViewTitleAt(sh,P.x,P.y);
       if(tv){const g=mepViewTitleGeo(tv);
         mepSt.sel=tv.id;mepSt.selDim=null;mepSt.selAxis=null;
         mepSt.pick={kind:'ttlDrag',vid:tv.id,dy:P.y-(g.y-g.h/2),px0:P.px,py0:P.py,moved:false,undoPushed:false};
         mepSideShow();mepRender();return;}}
      // cote ? → sélection + glisser pour la déplacer (2ᵉ appui rapproché = double-clic)
      if(mepDimPressDbl(sh,P,ev))return;
      const dim=mepDimAt(sh,P.x,P.y);
      if(dim){mepDimDragStart(sh,P,dim,ev);return;}
      const axis=mepAxisAt(sh,P.x,P.y);
      if(axis){
        mepSt.selAxis={vid:axis.vid,id:axis.id,ak:axis.ak};mepSt.sel=null;mepSt.selDim=null;mepSt.entSel=[];
        // 2026-10-22-012/013 : saisi près d'une extrémité → on la tire (tout trait d'axe)
        const av=mepView(sh,axis.vid),an=axis.ann;
        if(av&&an&&an.kind==='free'&&an.a&&an.b){
          const tolE=6/(mepSt.zoom||1);
          const dA=Math.hypot(av.x+an.a.x*av.scale-P.x,av.y+an.a.y*av.scale-P.y);
          const dB=Math.hypot(av.x+an.b.x*av.scale-P.x,av.y+an.b.y*av.scale-P.y);
          if(Math.min(dA,dB)<=tolE)mepSt.pick={kind:'axisEnd',vid:av.id,id:an.id,end:dA<=dB?'a':'b',px0:P.px,py0:P.py,moved:false,undoPushed:false};
        }else if(av&&axis.end&&axis.p&&axis.p.t==='L'){
          mepSt.pick={kind:'axisEnd',vid:av.id,ak:axis.ak,end:axis.end,px0:P.px,py0:P.py,moved:false,undoPushed:false};
        }
        mepSideShow();mepRender();return;
      }
      // double-clic sur une hachure, détecté à l'APPUI : le 1er clic sélectionne la vue et
      // redessine la planche, le navigateur n'émet alors plus de dblclick
      if(mepHatchAt(sh,P.x,P.y)){
        const now=Date.now(),lh=mepSt.hatchDown;
        if(lh&&now-lh.t<450&&Math.hypot(P.px-lh.px,P.py-lh.py)<6){mepSt.hatchDown=null;mepSt.pick=null;mepHatchDialog();return;}
        mepSt.hatchDown={t:now,px:P.px,py:P.py};
      }else mepSt.hatchDown=null;
      const v=mepViewAt(sh,P.x,P.y);
      if(v){
        mepSt.sel=v.id;mepSt.selDim=null;mepSt.selAxis=null;
        mepSt.pick={kind:'viewDrag',vid:v.id,ox:P.x-v.x,oy:P.y-v.y,moved:false,undoPushed:false,
          px0:P.px,py0:P.py,add:ev.ctrlKey||ev.metaKey||ev.shiftKey};
        mepSideShow();mepRender();
      }else{
        // fond de planche : sélection au cadre (fenêtre / capture)
        const addK=ev.shiftKey||ev.ctrlKey||ev.metaKey;
        if(!addK){mepSt.sel=null;mepSt.selDim=null;mepSt.selAxis=null;mepSt.entSel=[];}
        mepSt.pick={kind:'box',sx:P.x,sy:P.y,cur:{x:P.x,y:P.y},px0:P.px,py0:P.py,add:addK};
        mepSideShow();mepRender();
      }
      return;
    }
    if(tool==='cut2'){
      const v=mepViewAt(sh,P.x,P.y);
      if(!v){mepStatus('Coupe : cliquez sur la vue parente.');return;}
      const lx=(P.x-v.x)/v.scale,ly=(P.y-v.y)/v.scale;
      mepSt.cutPts.push({x:lx,y:ly,vid:v.id});
      if(mepSt.cutPts.length===1){mepStatus('Coupe : 2ᵉ point de la ligne de coupe.');return;}
      const A=mepSt.cutPts[0],B=mepSt.cutPts[1];
      const par=mepView(sh,A.vid);
      if(!par){mepSt.cutPts=[];return;}
      mepSt.tool='select';mepSt.cutPts=[];
      mepSectionFromPicks(par,A,B);
      mepToolSync();
      return;
    }
    if(tool==='det2'){
      const v=mepViewAt(sh,P.x,P.y);
      if(!v){mepStatus('Détail : cliquez sur la vue parente.');return;}
      const lx=(P.x-v.x)/v.scale,ly=(P.y-v.y)/v.scale;
      if(!mepSt.detC){
        mepSt.detC={x:lx,y:ly,vid:v.id};
        mepStatus('Détail : cliquez un 2ᵉ point pour le rayon.');
        return;
      }
      const C=mepSt.detC;
      const par=mepView(sh,C.vid);
      const R=Math.hypot(lx-C.x,ly-C.y);
      mepSt.detC=null;mepSt.tool='select';
      if(par&&R>0.5)mepDetailFromPicks(par,C,R);
      else mepStatus('Détail : rayon trop petit.');
      mepToolSync();
      return;
    }
    if(tool==='dim'){
      // une cote déjà posée reste attrapable : n'importe quel trait rouge
      // (ligne, rappel, leader, arc) démarre son déplacement.
      if(mepSt.chain){mepChainClick(sh,P);return;} // chaîne de cotes : chaque clic donne le point suivant
      // (sauf en accrochage imposé : le clic donne un point, même sur le rappel d'une autre cote)
      if(!mepSt.dim&&!mepSt.snapMode){
        if(mepDimPressDbl(sh,P,ev))return;
        const dim=mepDimAt(sh,P.x,P.y);
        if(dim){mepDimDragStart(sh,P,dim,ev);return;}
      }
      // distance point→point en cours : on garde le flux 2 points + placement
      if(mepSt.dim&&mepSt.dim.kind==='dist'&&!mepSt.dim.b){
        mepDimClick(sh,P,ev.ctrlKey||ev.metaKey,ev.shiftKey,ev.altKey);return;
      }
      if(mepSt.dim&&mepSt.dim.kind==='dist'&&mepSt.dim._pp){
        mepDimClick(sh,P,ev.ctrlKey||ev.metaKey,ev.shiftKey,ev.altKey);return;
      }
      const hit=mepHitViewEnt(sh,P.x,P.y,{axes:true});
      if(mepSt.dim){
        // une seule entité déjà choisie : un clic sur une AUTRE entité ajoute
        // la 2ᵉ (distance/angle) au lieu de poser immédiatement la cote.
        if(hit&&(mepSt.entSel||[]).length===1&&!mepSameEntSel(hit)
          &&(hit.e.t==='L'||hit.e.t==='C'||hit.e.t==='A')){
          mepDimAddEnt(hit);return;
        }
        // clic dans le vide (ou sur la même entité) : pose de la cote
        mepDimCommitDraft(sh,P,ev.shiftKey);return;
      }
      mepDimClick(sh,P,ev.ctrlKey||ev.metaKey,ev.shiftKey,ev.altKey);
      return;
    }
    if(tool==='hole'){
      if(mepSt.dim){mepDimCommitDraft(sh,P,ev.shiftKey);return;}
      const hit=mepHitViewEnt(sh,P.x,P.y);
      const d=hit?mepHoleDraft(sh,hit.vid,hit.e,hit.i):null;
      if(!d){
        mepStatus('Perçage : cliquez un cercle projeté correspondant à une fonction Perçage.');
        return;
      }
      mepSt.selDim=null;
      mepSt.dim=d;
      mepStatus('Perçage : cliquez pour placer l’étiquette (Échap annule).');
      mepRender();
      return;
    }
    if(tool==='axis'){mepAxisClick(sh,P);return;}
    if(tool==='ordx'||tool==='ordy'){mepOrdClick(sh,P,tool==='ordy'?'y':'x');return;}
    if(tool==='note'){
      if(mepSt.dim&&mepSt.dim.kind==='note'){ // 2ᵉ clic : place le texte, puis le saisit
        mepDimCommitDraft(sh,P);
        const d=sh.dims.find(x=>x.id===mepSt.selDim);
        if(d)mepNoteEdit(sh,d);
        return;
      }
      const S=mepSnapLocal(sh,P);
      if(!S){mepStatus('Note : cliquez la pointe de la flèche dans une vue.');return;}
      mepSt.selDim=null;
      mepSt.dim={kind:'note',vid:S.v.id,vid2:null,a:S.q,b:{x:S.q.x+8/S.v.scale,y:S.q.y-8/S.v.scale},off:0,txt:'Texte',__ghost:true};
      mepStatus('Note : cliquez pour placer le texte (Échap annule).');
      mepRender();return;
    }
    /* outils de dessin 2D (esquisse de planche, ou cartouche en édition) */
    const pt=mepSkSnap(sh,P);
    if(tool==='line'||tool==='rect'||tool==='circle'||tool==='arc'||tool==='logo'){
      const pk=mepSt.pick;
      if(!pk||!pk.start){
        mepSt.pick={kind:tool,start:pt,cur:pt,pts:[pt]};
        mepStatus(tool==='arc'?'Arc : cliquez le point de départ.':tool==='line'?'Ligne : cliquez le point suivant.':'Cliquez le 2ᵉ point.');
        return;
      }
      if(tool==='line'){
        let res=null;
        mepEdit('ligne',()=>{res=mepSkAddLine(sh,pk.start,pt);});
        mepSt.pick=res?{kind:'line',start:{x:pt.x,y:pt.y,pid:res.b},cur:pt,pts:[]}:pk;
        mepStatus('Ligne enchaînée — clic suivant, ou Échap / clic droit pour terminer.');
        mepRender();return;
      }
      if(tool==='arc'){
        pk.pts.push(pt);
        if(pk.pts.length<3){mepStatus('Arc : cliquez le point d’arrivée.');return;}
        mepEdit('arc',()=>{mepSkAddArc(sh,pk.pts[0],pk.pts[1],pk.pts[2]);});
        mepSt.pick=null;return;
      }
      mepEdit(tool==='rect'?'rectangle':tool==='circle'?'cercle':'zone logo',()=>{
        if(tool==='rect')mepSkAddRect(sh,pk.start,pt);
        else if(tool==='circle')mepSkAddCircle(sh,pk.start,Math.hypot(pt.x-pk.start.x,pt.y-pk.start.y));
        else mepSkAddLogo(sh,pk.start,pt);
      });
      mepSt.pick=null;return;
    }
    if(tool==='point'){mepEdit('point',()=>{mepSkAddPt(sh,pt);});return;}
    if(tool==='text'){
      let e=null;mepEdit('texte',()=>{e=mepSkAddText(sh,pt);});
      if(e){mepSt.skSel=new Set(['e:'+e.id]);mepSideShow();mepRender();}
      return;
    }
    if(tool==='trim'){
      mepEdit('ajuster',()=>{mepSkTrim(sh,P.x,P.y);});
      return;
    }
  }
  function mepOnMove(ev){
    const P=mepPt(ev);
    mepCoordShow(P);
    const sh=mepSheet();
    if(mepSt.vcmd&&!(mepSt.pick&&mepSt.pick.kind==='pan')){mepVcmdMove(sh,P,ev);return;}
    const pk=mepSt.pick;
    if(pk){
      if(pk.kind==='pan'){
        mepSt.pan.x=pk.px-(ev.clientX-pk.sx)*mepPxToMm();
        mepSt.pan.y=pk.py-(ev.clientY-pk.sy)*mepPxToMm();
        mepRender();
        return;
      }
      if(pk.kind==='box'){
        pk.cur={x:P.x,y:P.y};
        if(!pk.drag&&Math.hypot(P.px-pk.px0,P.py-pk.py0)>=3)pk.drag=true;
        if(pk.drag)mepRender();
        return;
      }
      if(pk.kind==='skDrag'){
        // glisser un point / trait / texte : position imposée, le solveur fait suivre le reste
        if(!pk.dragStarted){if(Math.hypot(P.px-pk.px0,P.py-pk.py0)<3)return;pk.dragStarted=true;}
        const ctx=mepSkCtx(sh,false),sk=ctx.sk;if(!sk)return;
        if(!pk.undoPushed){try{docPushUndo('Plan : déplacement esquisse');}catch(e){}pk.undoPushed=true;}
        mepSkRestore(sk,pk.base);
        const dx=P.x-pk.sx,dy=P.y-pk.sy,id=pk.key.slice(2),fx=mepSkFixed(sk),anch=[];
        const mv=pid=>{if(!pid||fx.has(pid)||!sk.pts[pid]||anch.indexOf(pid)>=0)return;sk.pts[pid].x+=dx;sk.pts[pid].y+=dy;anch.push(pid);};
        if(pk.key[0]==='p')mv(id);
        else{
          const e=sk.ents.find(x=>x.id===id);
          if(e&&(e.t==='circle'||e.t==='arc')){const c=sk.pts[e.pc];if(c){e.r=Math.max(0.1,Math.hypot(P.x-ctx.ox-c.x,P.y-ctx.oy-c.y));anch.push(e.pc);}}
          else if(e)['p1','p2','pc','p'].forEach(k=>mv(e[k]));
        }
        // position impossible (élément coté / fixé) : les contraintes l'emportent, rien ne se déforme
        if(mepSkSolve(sk,30,anch)>1e-4){
          mepSkSolve(sk,80);
          if(!pk.warned){pk.warned=true;mepStatus('Élément tenu par ses cotes ou ses fixations : modifiez la cote (sélectionnez-la) pour le déplacer.');}
        }
        pk.moved=true;
        mepRender();return;
      }
      if(pk.kind==='cutSeg'){
        const v=mepView(sh,pk.vid),par=v&&v.section&&mepView(sh,v.section.pid),M=pk.M;
        if(par&&M){
          if(!pk.dragStarted){if(Math.hypot(P.px-pk.px0,P.py-pk.py0)<3)return;pk.dragStarted=true;}
          const L=mepFromSheet(par,P.x,P.y);
          if(pk.j%2){ // marche : glisse le long du 1er tronçon, entre ses voisines
            const k=(pk.j-1)/2,lo=k?M.steps[k-1]:M.s0,hi=k===M.steps.length-1?M.sE:M.steps[k+1];
            let sv=L.x*M.t.x+L.y*M.t.y;const a=Math.min(lo,hi)+0.5,b=Math.max(lo,hi)-0.5;sv=Math.max(a,Math.min(b,Math.round(sv*2)/2));
            pk.prev={kind:'step',k,s:sv};
            mepStatus('Ligne de coupe '+(v.label||'')+' : marche déplacée.');
          }else{ // plan : brisure au point saisi, le morceau suivant s'accroche au centre / à la ligne visé(e)
            const cv=L.x*M.n.x+L.y*M.n.y,tol=4/(mepSt.zoom||1)/par.scale;
            let best=null;mepCutCands(sh,par,M).forEach(q=>{const d=Math.abs(q.c-cv);if(d<=tol&&(!best||d<best.d||(d===best.d&&q.ref.t==='hole')))best=Object.assign({d},q);});
            pk.prev={kind:pk.brk?'break':'plane',m:pk.j/2,c:best?best.c:Math.round(cv*2)/2,ref:best?best.ref:null};
            mepStatus('Ligne de coupe '+(v.label||'')+' : '+(best?('accrochée '+({hole:'au centre du perçage',ax:'au trait d’axe',edge:'à l’arête'})[best.ref.t]):'position libre (aucun centre ni ligne visé)')
              +(pk.brk?' — relâchez pour briser (Ctrl).':' — tronçon déplacé.'));
          }
          mepRender();
        }
        return;
      }
      if(pk.kind==='cutDrag'){
        const v=mepView(sh,pk.vid),E=v&&mepCutEnds(sh,v)[pk.end];
        if(E){
          if(!pk.dragStarted){if(Math.hypot(P.px-pk.px0,P.py-pk.py0)<3)return;pk.dragStarted=true;}
          // seule la composante le long du trait compte (verticale pour une coupe verticale…)
          let sv=pk.s0+(P.x-pk.sx)*E.u.x+(P.y-pk.sy)*E.u.y;
          sv=Math.round(Math.max(-(E.L/2-6),Math.min(150,sv))*2)/2;
          const shf=Array.isArray(v.section.sh)?v.section.sh.slice():[0,0];
          if(shf[pk.end]!==sv){
            if(!pk.undoPushed){try{docPushUndo('Plan : flèche de coupe');}catch(e){}pk.undoPushed=true;}
            shf[pk.end]=sv;v.section.sh=shf;pk.moved=true;
            mepStatus('Flèche de coupe '+(v.label||'')+' : décalage '+mepFmtNum(sv,1)+' mm le long du trait.');
            mepRender();
          }
        }
        return;
      }
      if(pk.kind==='blDrag'){ // V0.8.2 : bulle glissée
        const b=(sh.balloons||[]).find(q=>q.id===pk.id);
        if(b){
          if(!pk.dragStarted){if(Math.hypot(P.px-pk.px0,P.py-pk.py0)<3)return;pk.dragStarted=true;}
          if(!pk.undoPushed){try{docPushUndo('Plan : bulle');}catch(e){}pk.undoPushed=true;}
          b.dx=+(P.x-pk.ox-pk.ax).toFixed(2);b.dy=+(P.y-pk.oy-pk.ay).toFixed(2);pk.moved=true;
          mepRender();
        }
        return;
      }
      if(pk.kind==='ttlDrag'){
        const v=mepView(sh,pk.vid),g=v&&mepViewTitleGeo(v);
        if(g){
          if(!pk.dragStarted){if(Math.hypot(P.px-pk.px0,P.py-pk.py0)<3)return;pk.dragStarted=true;}
          // centre du titre voulu ; x reste sur l'axe de la vue
          const tc=P.y-pk.dy,bb=g.bb,lh=g.h,above=tc<bb.y+bb.h/2;
          const gap=Math.max(1,Math.round((above?bb.y-tc-lh/2:tc-bb.y-bb.h-lh/2)*2)/2);
          const old=v.ttl||{};
          if(old.gap!==gap||(old.side||'below')!==(above?'above':'below')){
            if(!pk.undoPushed){try{docPushUndo('Plan : titre de vue');}catch(e){}pk.undoPushed=true;}
            v.ttl={side:above?'above':'below',gap};pk.moved=true;
            mepStatus('Titre de vue : '+(above?'au-dessus':'dessous')+', écart '+mepFmtNum(gap,1)+' mm (centré sur l’axe de la vue).');
            mepRender();
          }
        }
        return;
      }
      if(pk.kind==='viewDrag'){
        const v=mepView(sh,pk.vid);
        if(v){
          // seuil de 3 px : un clic (sans glissement) doit sélectionner, pas déplacer
          if(!pk.dragStarted){
            if(Math.hypot(P.px-pk.px0,P.py-pk.py0)<3)return;
            pk.dragStarted=true;
          }
          let nx=P.x-pk.ox,ny=P.y-pk.oy;
          if(v.align&&v.kind!=='proj'){
            // coupe / auxiliaire alignées : glissement sur la ligne de rappel
            const t=(nx-v.x)*v.align.x+(ny-v.y)*v.align.y;nx=v.x+t*v.align.x;ny=v.y+t*v.align.y;
          }
          if(v.kind==='proj'){
            // vue projetée : glissement contraint sur l'axe libre ; l'axe commun reste verrouillé sur la mère
            const par=mepView(sh,v.parent);
            const axis=(MEP_PROJ[v.proj||'']||{}).axis||'x';
            if(par){
              if(axis==='x')ny=par.y; // côté gauche/droit : hauteur = mère, x libre
              else nx=par.x;          // dessus/dessous : x = mère, distance libre
            }
          }
          const dx=nx-v.x,dy=ny-v.y;
          const bouge=Math.abs(dx)>1e-9||Math.abs(dy)>1e-9;
          // Instantané AVANT la première mutation : sinon l'undo mémorise la position
          // déjà déplacée et ne restaure rien. Les projections suivent dans le même geste.
          if(bouge&&!pk.undoPushed){try{docPushUndo('Plan : déplacement vue');}catch(e){}pk.undoPushed=true;}
          v.x=nx;v.y=ny;if(bouge)pk.moved=true;
          if(bouge)mepProjFollow(sh,v,dx,dy);
          mepRender();
        }
        return;
      }
      if(pk.kind==='axisEnd'&&pk.ak){ // 2026-10-22-013 : tout trait d'axe — allongement mémorisé par bout
        const v=mepView(sh,pk.vid),p=v&&mepAxisLineByKey(sh,v,pk.ak);
        if(p&&p.t==='L'){
          if(!pk.dragStarted){if(Math.hypot(P.px-pk.px0,P.py-pk.py0)<3)return;pk.dragStarted=true;}
          const L=Math.hypot(p.bx2-p.bx1,p.by2-p.by1);
          if(L>1e-9){
            const ux=(p.bx2-p.bx1)/L,uy=(p.by2-p.by1)/L;
            // accrochage sur la géométrie (hors traits d'axe), projeté sur le trait
            const sn=mepSnapPt(P.x,P.y,sh,{noAxes:true});
            const q=sn.hit?sn:P,lx=(q.x-v.x)/v.scale,ly=(q.y-v.y)/v.scale;
            const cur=(v.axExt&&v.axExt[pk.ak])||[0,0];
            let e1=+cur[0]||0,e2=+cur[1]||0;
            if(pk.end===1)e1=-((lx-p.bx1)*ux+(ly-p.by1)*uy);
            else e2=(lx-p.bx2)*ux+(ly-p.by2)*uy;
            const mn=0.5/v.scale; // jamais moins de 0,5 mm papier
            if(L+e1+e2<mn){if(pk.end===1)e1=mn-L-e2;else e2=mn-L-e1;}
            if(!pk.undoPushed){try{docPushUndo('Plan : longueur axe');}catch(e){}pk.undoPushed=true;}
            if(!v.axExt||typeof v.axExt!=='object')v.axExt={};
            v.axExt[pk.ak]=[+e1.toFixed(4),+e2.toFixed(4)];pk.moved=true;
            mepAxGen++;
          }
          mepRender();
        }
        return;
      }
      if(pk.kind==='axisEnd'){ // 2026-10-22-012 : allonger / raccourcir l'axe, direction conservée
        const v=mepView(sh,pk.vid),an=v&&(v.axes||[]).find(x=>x.id===pk.id);
        if(an&&an.a&&an.b){
          if(!pk.dragStarted){if(Math.hypot(P.px-pk.px0,P.py-pk.py0)<3)return;pk.dragStarted=true;}
          const fix=pk.end==='a'?an.b:an.a,mov=an[pk.end];
          const dx=mov.x-fix.x,dy=mov.y-fix.y,L=Math.hypot(dx,dy);
          if(L>1e-9){
            const ux=dx/L,uy=dy/L,lx=(P.x-v.x)/v.scale,ly=(P.y-v.y)/v.scale;
            const t=Math.max(0.5,(lx-fix.x)*ux+(ly-fix.y)*uy);
            if(!pk.undoPushed){try{docPushUndo('Plan : longueur axe');}catch(e){}pk.undoPushed=true;}
            an[pk.end]={x:fix.x+ux*t,y:fix.y+uy*t};pk.moved=true;
          }
          mepRender();
        }
        return;
      }
      if(pk.kind==='dimDrag'){
        const d=sh.dims.find(x=>x.id===pk.id);
        if(d){
          if(!pk.dragStarted){
            if(Math.hypot(P.px-pk.px0,P.py-pk.py0)<3)return;
            pk.dragStarted=true;
          }
          if(!pk.undoPushed&&(Math.abs(P.x-pk.sx)>1e-9||Math.abs(P.y-pk.sy)>1e-9)){
            try{docPushUndo('Plan : déplacement cote');}catch(e){}
            pk.undoPushed=true;
          }
          if(pk.undoPushed&&mepDimMoveTo(sh,d,P,pk)){
            pk.moved=true;
            mepRender();
          }
        }
        return;
      }
      if(pk.start!==undefined||pk.kind==='cut2'||pk.kind==='det2'){
        if(MEP_SK_TOOLS.indexOf(pk.kind)>=0){pk.cur=mepSkSnap(sh,P);mepRender();return;}
        const snap=mepSnapPt(P.x,P.y,sh);
        pk.cur={x:snap.x,y:snap.y,snap:snap.hit};
        mepRender();
        return;
      }
    }
    if(mepSt.tool==='note'&&mepSt.dim){if(mepDimMoveTo(sh,mepSt.dim,P))mepRender();return;}
    if(mepSt.tool==='dim'||mepSt.tool==='hole'){
      // survol des arêtes/cercis : feedback avant les 2 clics de sélection
      let need=false;
      if(mepSt.tool==='dim'&&mepSt.chain){mepChainHover(sh,P);return;}
      if(mepSt.tool==='dim'&&mepSt.snapMode&&!(mepSt.dim&&mepSt.dim.b)){
        // accrochage imposé : repère du point visé, pas de surbrillance d'entité
        // (Intersection : on survole des ENTITÉS, le point s'affiche dès la 2ᵉ)
        const isInt=mepSt.snapMode==='int';
        const ih=isInt?mepIntPickHit(sh,P):null;
        const S=isInt?mepIntPoint(sh,mepSt.intPick,ih,P):mepSnapModePt(sh,P.x,P.y,mepSt.snapMode),o=mepSt.snapHov;
        if(!!S!==!!o||(S&&(Math.abs(S.x-o.x)>1e-6||Math.abs(S.y-o.y)>1e-6)))need=true;
        mepSt.snapHov=S;
        const hov=ih?{vid:ih.vid,i:ih.i,sig:mepEntSig(ih.e)}:null;
        if(!mepSameHovEnt(hov,mepSt.hovEnt)){mepSt.hovEnt=hov;need=true;}
        if(need)mepRender();
        return;
      }
      if(mepSt.snapHov){mepSt.snapHov=null;need=true;}
      const hit=mepHitViewEnt(sh,P.x,P.y,{axes:mepSt.tool==='dim'});
      const hov=hit?{vid:hit.vid,i:hit.i,sig:mepEntSig(hit.e)}:null;
      if(!mepSameHovEnt(hov,mepSt.hovEnt)){mepSt.hovEnt=hov;need=true;}
      // la cote en cours suit la souris (sauf distance point→point sans 2ᵉ point)
      if(mepSt.dim&&!(mepSt.dim.kind==='dist'&&!mepSt.dim.b)){
        if(mepDimMoveTo(sh,mepSt.dim,P))need=true;
      }
      if(need)mepRender();
      return;
    }
    if(mepSt.tool==='axis'){
      if(mepSt.axisFree&&mepSt.axisFree.a){
        const snap=mepSnapPt(P.x,P.y,sh);
        const c=mepSt.axisFree.cur;
        if(!c||Math.abs(c.x-snap.x)>1e-6||Math.abs(c.y-snap.y)>1e-6){
          mepSt.axisFree.cur={x:snap.x,y:snap.y};
          mepRender();
        }
      }
      return;
    }
    // survol d'esquisse (cartouche en édition, ou esquisse de planche active) : élément visé surligné
    if(mepSt.tool==='select'&&(mepSt.tbEdit||(mepSt.skSel&&mepSt.skSel.size))){
      const hk=mepSkHit(sh,P),key=hk?hk.key:null;
      if(key!==mepSt.skHov){mepSt.skHov=key;try{mepRender();}catch(e){}}
      if(mepSt.tbEdit)return;
    }else if(mepSt.skHov){mepSt.skHov=null;try{mepRender();}catch(e){}}
    // survol titre de vue (cadre pointillé) puis vue (feedback)
    {const tv=mepViewTitleAt(sh,P.x,P.y),tid=tv?tv.id:null;
     if(tid!==mepSt.ttlHov){mepSt.ttlHov=tid;try{mepRender();}catch(e){}}
     const ca=mepCutArrowAt(sh,P.x,P.y),ck=ca?{vid:ca.v.id,end:ca.end}:null,o=mepSt.cutHov;
     if((ck&&(!o||o.vid!==ck.vid||o.end!==ck.end))||(!ck&&o)){mepSt.cutHov=ck;try{mepRender();}catch(e){}}}
    const v=mepViewAt(sh,P.x,P.y);
    const id=v?v.id:null;
    if(id!==mepSt.hovView){mepSt.hovView=id;try{mepRender();}catch(e){}}
  }
  function mepOnUp(ev){
    const pk=mepSt.pick;
    if(!pk)return;
    if(pk.kind==='axisEnd'){
      if(pk.moved)mepEdit('longueur axe',()=>{},true);
      mepSt.pick=null;
      return;
    }
    if(pk.kind==='dimDrag'){
      if(pk.moved)mepEdit(pk.jog?'cassure d’ordonnée':'déplacement cote',()=>{},true);
      else if(pk.jog){ // Ctrl + clic sans glisser : cassure retirée
        const sh=mepSheet(),d=sh.dims.find(x=>x.id===pk.id),q=d&&d.pts&&d.pts[pk.jog.i];
        if(q&&q.jog){mepEdit('cassure retirée',()=>{delete q.jog;});mepStatus('Cassure retirée.');}
      }else if(pk.rappel&&mepSt.tool==='dim'){ // rappel cliqué : départ d'une chaîne de cotes
        const sh=mepSheet(),d=sh&&sh.dims.find(x=>x.id===pk.id);
        if(d){mepSt.pick=null;mepChainStart(sh,d,pk.rappel);return;}
      }
      mepSt.pick=null;
      return;
    }
    if(pk.kind==='cutSeg'){
      const sh=mepSheet(),v=mepView(sh,pk.vid),q=pk.prev;mepSt.pick=null;
      if(v&&!q&&pk.M&&pk.brk&&!(pk.j%2)){
        let ok=false;mepEdit('ligne de coupe : brisure',()=>{ok=mepCutBreakClick(sh,v,pk.j/2,pk.sG);});
        mepStatus(ok?'Ligne de coupe '+(v.label||'')+' : brisure ajoutée — tirez le morceau pour le placer.':'Ligne de coupe : rien à briser ici.');
        mepSideShow();
      }
      if(v&&q&&pk.M){
        if(q.kind==='step')mepEdit('ligne de coupe : marche',()=>{const M=mepCutModel(v);M.steps[q.k]=q.s;mepCutFromModel(sh,v,M);});
        else if(q.kind==='plane')mepEdit('ligne de coupe : tronçon',()=>{const M=mepCutModel(v);M.c[q.m]=q.c;M.refs[q.m]=q.ref;mepCutFromModel(sh,v,M);});
        else mepEdit('ligne de coupe : brisure',()=>{if(!mepCutBreakAt(sh,v,q.m,pk.sG,q.c,q.ref))mepStatus('Ligne de coupe : rien à briser ici.');});
        mepSideShow();
      }
      mepRender();
      return;
    }
    if(pk.kind==='cutDrag'){
      if(pk.moved)mepEdit('flèche de coupe',()=>{},true);
      mepSt.pick=null;mepRender();
      return;
    }
    if(pk.kind==='ttlDrag'){
      if(pk.moved)mepEdit('titre de vue',()=>{},true);
      mepSt.pick=null;mepRender();
      return;
    }
    if(pk.kind==='blDrag'){ // V0.8.2
      if(pk.moved)mepEdit('bulle',()=>{},true);
      mepSt.pick=null;mepRender();
      return;
    }
    if(pk.kind==='box'){
      mepSt.pick=null;
      const sh=mepSheet();
      if(pk.drag){
        const n=mepBoxSelect(sh,pk,pk.add);
        mepStatus((mepBoxRect(pk).cross?'Capture':'Fenêtre')+' : '+n+' élément(s) ajouté(s) à la sélection.');
      }else if(pk.clickKey)mepSkSelect(pk.clickKey,pk.add);
      else if(!pk.add){mepSt.skSel=new Set();mepSt.lot=null;}
      mepSideShow();mepRender();
      return;
    }
    if(pk.kind==='skDrag'){
      if(pk.moved)mepEdit('déplacement esquisse',()=>{},true);
      mepSt.pick=null;mepSideShow();
      return;
    }
    if(pk.kind==='viewDrag'){
      if(pk.moved){
        // L'undo a été empilé au premier mouvement ; on finalise sans re-snapshot.
        mepEdit('déplacement vue',()=>{},true);
      }else{
        // clic sans déplacement : la vue reste sélectionnée ; aucune arête n'est
        // pré-sélectionnée hors d'une fonction (la cotation sélectionne elle-même).
        mepSt.entSel=[];mepSt.hovEnt=null;
        mepSideShow();mepRender();
      }
      mepSt.pick=null;
      return;
    }
    if(pk.kind==='pan'){mepSt.pick=null;return;}
    // tracé en cours (ligne, rectangle, cercle, arc, logo) : il continue au clic suivant
    // (V0.3.12 : auparavant effacé au relâchement — le dessin en 2 clics n'aboutissait jamais)
    if(MEP_SK_TOOLS.indexOf(pk.kind)>=0||pk.kind==='cut2'||pk.kind==='det2')return;
    mepSt.pick=null;
  }
  function mepOnWheel(ev){
    ev.preventDefault();
    const P=mepPt(ev);
    // sens de la molette inversable (paramètre Vue) : deltaY<0 (molette vers le haut)
    // = zoom avant par défaut ; zoomRev intervertit avant/arrière.
    const up=ev.deltaY<0;
    const k=(mepSt.zoomRev?!up:up)?1.12:1/1.12;
    const z0=mepSt.zoom;
    const z1=Math.min(20,Math.max(0.08,z0*k));
    if(z1===z0)return;
    // zoom autour du pointeur : le point P reste fixe à l'écran
    const vb=mepSvgViewBox();
    const ratio=z1/z0;
    mepSt.pan.x=P.x-(P.x-mepSt.pan.x)/ratio;
    mepSt.pan.y=P.y-(P.y-mepSt.pan.y)/ratio;
    mepSt.zoom=z1;
    mepRender();
  }
  // double-clic sur une cote (true si traité) : flèche → inversion des deux flèches ;
  // cote linéaire → inversion des flèches ; angle → angle rentrant (360 − θ) ↔ saillant ;
  // Alt (ou autre cote) → texte personnalisé
  function mepDimDblAction(sh,P,alt){
    const da=mepDimArrowAt(sh,P.x,P.y);
    if(da&&da.kind!=='ang'){mepDimToggleArrows(da);return true;}
    const d=da||mepDimAt(sh,P.x,P.y);
    if(!d)return false;
    if(d.kind==='ang'&&!alt){mepDimToggleBig(d);return true;}
    if(d.kind==='note'){mepNoteEdit(sh,d);return true;}
    if(d.kind==='ord')return true;
    if((d.kind==='len'||d.kind==='dist')&&!alt){mepDimToggleArrows(d);return true;}
    const t=prompt('Texte de cote (vide = calculé) :',d.txt||'');
    if(t!==null){mepEdit('texte cote',()=>{d.txt=t||undefined;});}
    return true;
  }
  /* 2026-10-22-014 : double-clic détecté à l'APPUI (« le double clic sur la cote devrait inverser
     le sens des flèches, mais pas tout le temps ») — le 1er clic sélectionne la cote et redessine
     la planche : l'élément sous la souris est remplacé et le navigateur perd souvent le dblclick.
     Le dblclick natif qui arrive quand même est ignoré (sinon il ré-inverserait). */
  function mepDimPressDbl(sh,P,ev){
    const hit=mepDimArrowAt(sh,P.x,P.y)||mepDimAt(sh,P.x,P.y);
    const now=Date.now(),lp=mepSt.dimDown;
    if(!hit){mepSt.dimDown=null;return false;}
    if(lp&&lp.id===hit.id&&now-lp.t<450&&Math.hypot(P.px-lp.px,P.py-lp.py)<6){
      mepSt.dimDown=null;mepSt.pick=null;mepSt.dblDoneT=now;
      mepDimDblAction(sh,P,ev.altKey);
      return true;
    }
    mepSt.dimDown={id:hit.id,t:now,px:P.px,py:P.py};
    return false;
  }
  function mepOnDbl(ev){
    const P=mepPt(ev);
    const sh=mepSheet();
    if(mepSt.dblDoneT&&Date.now()-mepSt.dblDoneT<700){mepSt.dblDoneT=0;return;} // déjà traité à l'appui
    if(mepDimDblAction(sh,P,ev.altKey))return;
    // double-clic sur une hachure → motif, angle, échelle, couleur (toutes les coupes)
    if(mepHatchAt(sh,P.x,P.y)){if(!mepHatchDlgEl)mepHatchDialog();return;}
    // double-clic sur étiquette de vue → renommer
    const v=mepViewAt(sh,P.x,P.y);
    if(v){
      const n=prompt('Libellé de la vue :',v.label||'');
      if(n!==null){mepEdit('libellé vue',()=>{v.label=n;});}
      return;
    }
  }
  function mepOnKey(ev){
    if(!mepSt.open)return;
    const t=ev.target;
    if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
    const k=ev.key;
    if(k==='Escape'&&mepCtxEl&&mepCtxEl.style.display!=='none'){
      mepCtxHide();ev.preventDefault();ev.stopPropagation();return;
    }
    if((k==='Escape'||k==='Enter')&&mepSt.ord){mepSt.ord=null;mepSetTool('select');mepStatus('Cotation d’ordonnées terminée.');ev.preventDefault();ev.stopPropagation();return;}
    if(k==='Escape'&&mepSt.blAdd){mepSt.blAdd=false;mepStatus('＋ Bulle terminé.');mepSideShow();ev.preventDefault();ev.stopPropagation();return;} // V0.8.2
    if(k==='Escape'){
      if(mepSt.intPick){mepIntCancel();ev.preventDefault();ev.stopPropagation();return;} // seulement l'intersection en cours
      if(mepSt.chain){mepChainEnd();ev.preventDefault();ev.stopPropagation();return;} // fin de chaîne, l'outil Cote reste actif
      if(mepSt.alignDims){mepSt.alignDims=null;mepStatus('Alignement annulé.');ev.preventDefault();ev.stopPropagation();return;}
      if(mepSt.vcmd){mepVcmdCancel();ev.preventDefault();ev.stopPropagation();return;}
      if(mepSt.pick&&MEP_SK_TOOLS.indexOf(mepSt.pick.kind)>=0){mepSt.pick=null;mepRender();ev.preventDefault();ev.stopPropagation();return;}
      if((mepSt.skSel&&mepSt.skSel.size)||mepSt.lot){mepSt.skSel=new Set();mepSt.lot=null;mepSideShow();mepRender();ev.preventDefault();ev.stopPropagation();return;}
      if(mepSt.tbEdit){if(mepSt.tool!=='select')mepSetTool('select');else mepTbEdit(false);ev.preventDefault();ev.stopPropagation();return;}
      if(mepSt.pick||mepSt.tool!=='select'||mepSt.dim||mepSt.cutPts.length||mepSt.detC
        ||mepSt.selAxis||(mepSt.axisPick&&mepSt.axisPick.length)||mepSt.axisFree){
        const pk0=mepSt.pick;
        if(pk0&&pk0.moved){
          if(pk0.kind==='viewDrag')mepEdit('déplacement vue',()=>{},true);
          else if(pk0.kind==='dimDrag')mepEdit('déplacement cote',()=>{},true);
        }
        mepSt.pick=null;mepSt.dim=null;mepSt.cutPts=[];mepSt.detC=null;
        mepSt.selAxis=null;mepSt.axisPick=[];mepSt.axisFree=null;mepSt.axisSym=null;
        mepSetTool('select');
        mepRender();
        ev.preventDefault();ev.stopPropagation();
      }
      return;
    }
    if(mepSt.vcmd&&mepSt.vcmd.kind==='local'&&mepSt.vcmd.stage===1&&(k==='Enter'||k==='Backspace')){
      if(k==='Enter')mepLocClose();else mepLocUndo();
      ev.preventDefault();ev.stopPropagation();return;
    }
    if(mepSt.vcmd&&mepSt.vcmd.kind==='section'&&mepSt.vcmd.stage===1&&(k==='Enter'||k==='Backspace')){
      if(k==='Enter')mepSecValidate();else mepSecUndo();
      ev.preventDefault();ev.stopPropagation();return;
    }
    if(k==='Enter'&&mepSt.tool==='axis'){
      if(mepSt.axisMode==='align'||mepSt.axisMode==='pitch')mepAxisCommitPattern();
      ev.preventDefault();ev.stopPropagation();
      return;
    }
    if(k==='Delete'||k==='Backspace'){
      const sh=mepSheet();
      if(mepSt.lot){mepDeleteLot(sh);ev.preventDefault();ev.stopPropagation();return;}
      if(mepSt.skSel&&mepSt.skSel.size){mepSkDeleteSel(sh);ev.preventDefault();ev.stopPropagation();return;}
      if(mepSt.selDim&&mepSt.ordPt&&mepSt.ordPt.id===mepSt.selDim&&mepSt.ordPt.i>=0){
        mepOrdDelPt(sh,sh.dims.find(d=>d.id===mepSt.selDim),mepSt.ordPt.i);
        ev.preventDefault();ev.stopPropagation();return;
      }
      if(mepSt.selBl&&(sh.balloons||[]).some(b=>b.id===mepSt.selBl)){ // V0.8.2 : bulle sélectionnée
        mepEdit('suppression bulle',()=>{sh.balloons=sh.balloons.filter(b=>b.id!==mepSt.selBl);mepSt.selBl=null;});
        mepSideShow();mepRender();ev.preventDefault();ev.stopPropagation();return;
      }
      if(mepSt.selDim){
        mepEdit('suppression cote',()=>{sh.dims=sh.dims.filter(d=>d.id!==mepSt.selDim);mepSt.selDim=null;});
        mepSideShow();
        ev.preventDefault();ev.stopPropagation();
        return;
      }
      if(mepSt.selAxis){
        const sel=mepSt.selAxis,v=mepView(sh,sel.vid);
        if(!sel.id){ // axe automatique : Suppr lui rend sa longueur d'origine
          if(v&&v.axExt&&v.axExt[sel.ak])mepEdit('longueur axe d’origine',()=>{delete v.axExt[sel.ak];});
          mepSideShow();ev.preventDefault();ev.stopPropagation();return;
        }
        mepEdit('suppression axe',()=>{
          if(v){v.axes=(v.axes||[]).filter(a=>a.id!==sel.id);mepAxisExtDrop(v,sel.id);}
          mepSt.selAxis=null;
        });
        mepSideShow();
        ev.preventDefault();ev.stopPropagation();
        return;
      }
      if(mepSt.entSel&&mepSt.entSel.length){
        mepSt.entSel=[];mepStatus('Sélection vide.');mepRender();
        ev.preventDefault();ev.stopPropagation();
        return;
      }
      if(mepSt.sel){
        mepDelView(mepSt.sel);
        ev.preventDefault();ev.stopPropagation();
        return;
      }
      return;
    }
    const ctrl=ev.ctrlKey||ev.metaKey;
    if(ctrl&&!ev.altKey){
      const kk=k.toLowerCase();
      // Ctrl+Z / Ctrl+Y : routage unique en capture (undoDispatch, 45)
      return; // ne pas voler le reste
    }
    if(k==='F'){try{mepFitSheet();mepRender();}catch(e){}}
    if((k==='x'||k==='X')&&mepSt.skSel&&mepSt.skSel.size){ // X : lignes / cercles / arcs sélectionnés ↔ construction
      const sh=mepSheet(),ctx=mepSkCtx(sh,false),sk=ctx.sk;
      const es=sk?mepSkSelParts(sk):null,G=es?es.L.concat(es.C):[];
      if(G.length){const on=!G.every(e=>!!e.cst);
        mepEdit(on?'construction':'trait normal',()=>G.forEach(e=>{if(on)e.cst=true;else delete e.cst;}));
        mepStatus(G.length+' élément(s) '+(on?'en construction (invisibles hors édition)':'redevenu(s) normal(aux)')+'.');
        mepSideShow();mepRender();}
      ev.preventDefault();ev.stopPropagation();return;
    }
    if(k==='v'||k==='V')mepSetTool('select');
    if(k==='l'||k==='L')mepSetTool('line');
    if(k==='r'||k==='R')mepSetTool(ev.shiftKey?'rect':'dim'); // R seul = outil cote (rayon via clic)
    if(k==='c'||k==='C')mepSetTool('circle');
    if(k==='a'||k==='A')mepSetTool('arc');
    if(k==='p'||k==='P')mepSetTool('point');
    if(k==='t'||k==='T')mepSetTool('trim');
    if(k==='d'||k==='D')mepSetTool('dim');
    if(k==='h'||k==='H')mepSetTool('hole');
    if(k==='x'||k==='X')mepSetTool('axis');
  }
  function mepViewAt(sh,sx,sy){
    // vue dont la bbox (papier) contient le point ; priorité à la plus « petite »
    let best=null,bw=1e18,byArea=1e18;
    sh.views.forEach(v=>{
      const bb=mepViewSheetBBox(v);if(!bb)return;
      const pad=2;
      if(sx>=bb.x-pad&&sx<=bb.x+bb.w+pad&&sy>=bb.y-pad&&sy<=bb.y+bb.h+pad){
        const area=(bb.w+pad*2)*(bb.h+pad*2);
        if(area<byArea){byArea=area;best=v;}
      }
    });
    return best;
  }
  // Géométrie d'une cote angulaire : sommet (intersection des 2 droites) + directions.
  function mepAngGeom(sh,d){
    const w=mepDimWorld(sh,d);if(!w)return null;
    const e1=d.a&&d.a.hint?mepEntByHint(w.v1,d.a.hint):null;
    const e2=d.b&&d.b.hint?mepEntByHint(d.vid2?w.v2:w.v1,d.b.hint):null;
    if(!(e1&&e1.t==='L'&&e2&&e2.t==='L'))return null;
    const ax=e1.x2-e1.x1,ay=e1.y2-e1.y1,bx=e2.x2-e2.x1,by=e2.y2-e2.y1;
    const a1=Math.atan2(ay,ax),a2=Math.atan2(by,bx);
    // vues différentes : coordonnées non comparables → arc centré sur la ligne A
    if(d.vid2&&d.vid2!==d.vid)return mepAngSector(d,{O:w.a,a1,a2,w});
    const den=ax*by-ay*bx;
    let ox=e1.x1,oy=e1.y1;
    if(Math.abs(den)>1e-9){
      const t=((e2.x1-e1.x1)*by-(e2.y1-e1.y1)*bx)/den;
      ox=e1.x1+ax*t;oy=e1.y1+ay*t;
    }
    // chaque côté de l'angle part du sommet VERS son arête (et non selon le sens de
    // saisie du segment) ; ext = portée de l'arête le long du côté (mm papier), pour les rappels
    const ray=e=>{let dx=(e.x1+e.x2)/2-ox,dy=(e.y1+e.y2)/2-oy;if(Math.hypot(dx,dy)<1e-9){dx=e.x2-e.x1;dy=e.y2-e.y1;}
      const l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,s1=(e.x1-ox)*ux+(e.y1-oy)*uy,s2=(e.x2-ox)*ux+(e.y2-oy)*uy;
      return{a:Math.atan2(uy,ux),ext:[Math.min(s1,s2)*w.v1.scale,Math.max(s1,s2)*w.v1.scale]};};
    const r1=ray(e1),r2=ray(e2);
    return mepAngSector(d,{O:mepToSheet(w.v1,ox,oy),a1:r1.a,a2:r2.a,ext:[r1.ext,r2.ext],w});
  }
  /* Secteur coté parmi les 4 que forment les deux droites (θ, 180−θ, θ, 180−θ) : d.q = bit 0
     → côté A retourné, bit 1 → côté B retourné ; d.big → angle rentrant (360 − secteur).
     b1/b2 = côtés de base (avant retournement), pour le choix du secteur au curseur.
     dd = balayage signé de a1 vers a2 (|dd| = valeur cotée, en radians). */
  function mepAngSector(d,g){
    const q=(+d.q||0)&3,flip=(a,e)=>({a:a+Math.PI,e:e?[-e[1],-e[0]]:e});
    let s1={a:g.a1,e:g.ext&&g.ext[0]},s2={a:g.a2,e:g.ext&&g.ext[1]};
    if(q&1)s1=flip(s1.a,s1.e);
    if(q&2)s2=flip(s2.a,s2.e);
    let dd=s2.a-s1.a;
    while(dd<=-Math.PI)dd+=2*Math.PI;
    while(dd>Math.PI)dd-=2*Math.PI;
    if(d.big)dd=dd>0?dd-2*Math.PI:dd+2*Math.PI;
    return Object.assign(g,{b1:g.a1,b2:g.a2,a1:s1.a,a2:s2.a,dd,ext:g.ext?[s1.e,s2.e]:g.ext});
  }
  // secteur (0..3) qui contient la direction φ (depuis le sommet), côtés de base b1/b2
  function mepAngSectorAt(b1,b2,phi){
    for(let q=0;q<4;q++){
      const s1=b1+((q&1)?Math.PI:0),s2=b2+((q&2)?Math.PI:0);
      let dd=s2-s1;while(dd<=-Math.PI)dd+=2*Math.PI;while(dd>Math.PI)dd-=2*Math.PI;
      let t=(phi-s1)*(dd>=0?1:-1);t=((t%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
      if(t<=Math.abs(dd)+1e-9)return q;
    }
    return 0;
  }
  function mepAngRadius(d){return Math.max(6,Math.min(80,d.off==null?14:d.off));}
  /* 2026-10-28 : « cotes d'angle : le texte est assez loin de la ligne de cote, il faut qu'il soit au
     centre, sur le dessus, en bas ou en haut en fonction de sa position ; je dois pouvoir le bouger de
     droite à gauche et retrouver son centre automatiquement ». Texte horizontal collé à l'arc, du côté
     extérieur : sa boîte touche l'arc (au-dessus en haut de l'arc, en dessous en
     bas, à côté sur les flancs) à 1,2 mm près. d.txtOff = décalage le long de l'arc (mm papier, sens
     des angles croissants) depuis le milieu ; |txtOff| < 3 mm → retour au centre. */
  // → {x,y (centre de la boîte), bx,by (ligne de base, ancre 'middle'), hw,hh, t (angle du point d'arc), r}
  function mepAngTextPos(sh,d,g){
    g=g||mepAngGeom(sh,d);if(!g)return null;
    const r=mepAngRadius(d),t=g.a1+g.dd/2+(+d.txtOff||0)/r;
    const val=d.value!=null?d.value:mepDimMeasure(sh,d);
    const hw=mepDimLabelHalf(d,val),H=MEP_TEXT_STYLE.dimH||3.5,hh=H/2;
    const nx=Math.cos(t),ny=Math.sin(t),k=r+1.2+Math.abs(nx)*hw+Math.abs(ny)*hh;
    const x=g.O.x+nx*k,y=g.O.y+ny*k;
    return{x,y,bx:x,by:y+hh,hw,hh,t,r};
  }
  function mepAngTxtOffSnap(v){v=+v||0;return Math.abs(v)<3?0:v;}
  // Trait de cote linéaire : a1/b1 = extrémités décalées, u = direction de la cote,
  // v = normale (côté de la cote). Sert au rendu, au texte et au hit-test, pour
  // que les rappels restent perpendiculaires au trait (pas de trapèze).
  function mepDimLine(sh,d,w){
    w=w||mepDimWorld(sh,d);if(!w)return null;
    if(d.kind!=='len'&&d.kind!=='dist')return null;
    const orient=d.orient||'a';
    let dx=w.b.x-w.a.x,dy=w.b.y-w.a.y,ux,uy,vx,vy,a1,b1;
    const off=(d.off==null?8:d.off);
    if(orient==='h'){
      dy=0;
      if(Math.abs(dx)<1e-9)return null;
      ux=dx>0?1:-1;uy=0;vx=0;vy=1;
      const cy=(w.a.y+w.b.y)/2+off;
      a1={x:w.a.x,y:cy};b1={x:w.b.x,y:cy};
    }else if(orient==='v'){
      dx=0;
      if(Math.abs(dy)<1e-9)return null;
      ux=0;uy=dy>0?1:-1;vx=1;vy=0;
      const cx=(w.a.x+w.b.x)/2+off;
      a1={x:cx,y:w.a.y};b1={x:cx,y:w.b.y};
    }else{
      const L0=Math.hypot(dx,dy);
      if(L0<1e-9)return null;
      ux=dx/L0;uy=dy/L0;vx=-uy;vy=ux;
      a1={x:w.a.x+vx*off,y:w.a.y+vy*off};
      b1={x:w.b.x+vx*off,y:w.b.y+vy*off};
    }
    const L=Math.hypot(dx,dy);
    const gap=MEP_DIM_STYLE.gap,over=MEP_DIM_STYLE.overrun,dir=off>=0?1:-1;
    // Distance entre DEUX droites parallèles : partir du coin de l'arête situé du
    // côté de la ligne de cote. Sinon le départ du rappel est au milieu de l'arête :
    // le vide de `gap` tombe le long de la pièce et devient invisible (la cote
    // semble « collée » à la pièce). On ne déplace que le DÉBUT du rappel, pas les
    // ancres de mesure ni la ligne de cote.
    let sa={x:w.a.x+vx*gap*dir,y:w.a.y+vy*gap*dir};
    let sb={x:w.b.x+vx*gap*dir,y:w.b.y+vy*gap*dir};
    if(d.kind==='dist'&&d.a&&d.a.hint&&d.a.hint.t==='seg'
      &&d.b&&d.b.hint&&d.b.hint.t==='seg'){
      const eA=mepEntByHint(w.v1,d.a.hint),eB=mepEntByHint(w.v1,d.b.hint);
      const parallelTo=(e)=>{
        if(!e||e.t!=='L')return false;
        const lx=e.x2-e.x1,ly=e.y2-e.y1,ll=Math.hypot(lx,ly)||1;
        return Math.abs((lx*vx+ly*vy)/ll)>0.999;
      };
      if(eA&&eB&&parallelTo(eA)&&parallelTo(eB)){
        const start=(e,ax,ay)=>{
          const p1=mepToSheet(w.v1,e.x1,e.y1),p2=mepToSheet(w.v1,e.x2,e.y2);
          const d1=(p1.x-ax)*vx*dir+(p1.y-ay)*vy*dir;
          const d2=(p2.x-ax)*vx*dir+(p2.y-ay)*vy*dir;
          const p=d1>=d2?p1:p2;
          return{x:p.x+vx*gap*dir,y:p.y+vy*gap*dir};
        };
        sa=start(eA,w.a.x,w.a.y);
        sb=start(eB,w.b.x,w.b.y);
      }
    }
    return{world:w,a:w.a,b:w.b,dx,dy,L,ux,uy,vx,vy,off,gap,over,dir,orient,
      a1,b1,
      sa,sb,
      ea:{x:a1.x+vx*over*dir,y:a1.y+vy*over*dir},
      eb:{x:b1.x+vx*over*dir,y:b1.y+vy*over*dir}};
  }
  /* orientation d'une cote linéaire : alignée (a), horizontale X (h), verticale Y (v).
     Même logique que l'esquisse 2D : le secteur du curseur autour du milieu choisit
     la direction de décalage la plus proche. */
  function mepDimOrientFromPts(ax,ay,bx,by,P){
    const dx=bx-ax,dy=by-ay;
    const mx=(ax+bx)/2,my=(ay+by)/2;
    const rdx=P.x-mx,rdy=P.y-my;
    if(Math.hypot(rdx,rdy)<=1e-6)return 'a';
    const beta=Math.atan2(dy,dx),phi=Math.atan2(rdy,rdx);
    const w180=a=>{a=(a*180/Math.PI)%180;if(a<0)a+=180;return a;};
    const dH=w180(phi-Math.PI/2),dV=w180(phi),dA=w180(phi-(beta+Math.PI/2));
    const cands=[{o:'h',d:dH,ok:Math.abs(dx)>1e-6},
      {o:'v',d:dV,ok:Math.abs(dy)>1e-6},{o:'a',d:dA,ok:true}];
    cands.sort((p,q)=>p.d-q.d);
    return (cands.find(c=>c.ok)||cands[2]).o;
  }
  function mepDimOrientAt(sh,d,P){
    const w=mepDimWorld(sh,d);if(!w||!d.b)return d.orient||'a';
    d.orient=mepDimOrientFromPts(w.a.x,w.a.y,w.b.x,w.b.y,P);
    return d.orient;
  }
  function mepDimOffsetFromPts(ax,ay,bx,by,o,P){
    if(o==='h')return P.y-(ay+by)/2;
    if(o==='v')return P.x-(ax+bx)/2;
    const dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy)||1;
    return (P.x-ax)*(-dy/L)+(P.y-ay)*(dx/L);
  }
  function mepDimClampOff(off,min){
    const m=Math.abs(min||0);
    if(off>0)return Math.max(m,off);
    if(off<0)return -Math.max(m,-off);
    return m;
  }
  // Position (mm papier) de l'étiquette d'une cote — sert au rendu et au clic/glisser.
  function mepDimTextPos(sh,d){
    const w=mepDimWorld(sh,d);if(!w)return null;
    if(d.kind==='dia'||d.kind==='rad'||d.kind==='hole'||d.kind==='note')return{x:w.b.x,y:w.b.y};
    if(d.kind==='ord'){ // valeur de l'origine, sur la ligne commune
      const v=mepView(sh,d.vid),oS=v?mepToSheet(v,d.o.x,d.o.y):w.a;
      return d.axis==='y'?{x:oS.x+(+d.off||0),y:oS.y}:{x:oS.x,y:oS.y+(+d.off||0)};
    }
    if(d.kind==='ang'){
      const p=mepAngTextPos(sh,d);
      return p?{x:p.x,y:p.y}:{x:w.b.x,y:w.b.y};
    }
    const g=mepDimLine(sh,d,w);
    return g?mepDimTextAnchorPos(g,d):{x:w.a.x,y:w.a.y};
  }
  // angle rentrant ↔ saillant : l'arc garde le même côté (le secteur opposé est retourné)
  function mepDimToggleBig(d){
    const big=!d.big;
    mepEdit(big?'angle rentrant':'angle saillant',()=>{
      if(big)d.big=true;else delete d.big;
      const q=((+d.q||0)&3)^3;if(q)d.q=q;else delete d.q;
    });
    mepSt.selDim=d.id;mepSt.sel=null;mepSt.entSel=[];
    mepSideShow();mepRender();
    mepStatus(big?'Angle rentrant (360° − θ) — double-clic pour revenir.':'Angle saillant.');
    return big;
  }
  function mepDimToggleArrows(d){
    const out=d.arr!=='out';
    mepEdit('sens des flèches',()=>{d.arr=out?'out':'in';});
    mepSt.selDim=d.id;mepSt.sel=null;mepSt.entSel=[];
    mepSideShow();mepRender();
    mepStatus(out?'Flèches vers l\'extérieur.':'Flèches vers l\'intérieur.');
    return out;
  }
  function mepDimArrowAt(sh,sx,sy){
    let best=null,bd=8/(mepSt.zoom||1);
    sh.dims.forEach(d=>{
      if(d.kind!=='len'&&d.kind!=='dist')return;
      const w=mepDimWorld(sh,d);if(!w)return;
      const g=mepDimLine(sh,d,w);if(!g)return;
      const dist=Math.min(Math.hypot(sx-g.a1.x,sy-g.a1.y),
        Math.hypot(sx-g.b1.x,sy-g.b1.y));
      if(dist<bd){bd=dist;best=d;}
    });
    return best;
  }
  function mepDimAt(sh,sx,sy){
    let best=null,bestScore=1e18;
    const bd=6/mepSt.zoom,bdTxt=18/mepSt.zoom;
    const segDist=(s,x1,y1,x2,y2)=>{
      const dx=x2-x1,dy=y2-y1,L2=dx*dx+dy*dy;
      let t=0;
      if(L2>1e-12)t=Math.max(0,Math.min(1,((s.x-x1)*dx+(s.y-y1)*dy)/L2));
      return Math.hypot(s.x-(x1+dx*t),s.y-(y1+dy*t));
    };
    const P={x:sx,y:sy};
    sh.dims.forEach(d=>{
      const w=mepDimWorld(sh,d);if(!w)return;
      // Tous les traits réellement dessinés (ligne, rappels, leader, arc) sont
      // enregistrés au rendu : on peut attraper n'importe lequel pour déplacer.
      let d1=1e9;
      const segs=mepDimHits.get(d);
      if(segs&&segs.length){
        segs.forEach(s=>{d1=Math.min(d1,segDist(P,s.x1,s.y1,s.x2,s.y2));});
      }else{
        const g=mepDimLine(sh,d,w);
        if(g)d1=segDist(P,g.a1.x,g.a1.y,g.b1.x,g.b1.y);
      }
      const tp=mepDimTextPos(sh,d);
      const d2=tp?Math.hypot(sx-tp.x,sy-tp.y):1e9;
      if(d1<bd||d2<bdTxt){
        const score=Math.min(d1/bd,d2/bdTxt);
        if(score<bestScore){bestScore=score;best=d;}
      }
    });
    return best;
  }
  /* menu contextuel R/Ø (clic droit sur une cote ou pendant le placement) */
  function mepCtxHide(){if(mepCtxEl)mepCtxEl.style.display='none';}
  function mepDimSetKind(d,nk,draft){
    if(!d||(d.kind!=='dia'&&d.kind!=='rad')||(nk!=='dia'&&nk!=='rad')||d.kind===nk)return;
    const label='Cote '+(nk==='dia'?'diamètre':'rayon');
    if(draft){
      d.kind=nk;delete d.txt;mepRender();
      mepStatus((nk==='dia'?'Cote Ø':'Cote R')+' : cliquez pour poser.');
      return;
    }
    mepEdit(label,()=>{d.kind=nk;delete d.txt;});
    mepSt.selDim=d.id;mepSt.sel=null;mepRender();mepSideShow();
    mepStatus(label+' — clic droit pour passer en '+(nk==='dia'?'R':'Ø')+'.');
  }
  function mepDimSetOrient(d,o,draft){
    if(!d||(d.kind!=='len'&&d.kind!=='dist'))return;
    const label=o==='h'?'Cote horizontale (X)':o==='v'?'Cote verticale (Y)':'Cote alignée';
    if(draft)d.__orientLock=true;
    if((d.orient||'a')===o){
      if(draft){mepRender();mepStatus(label+' : cliquez pour poser.');}
      return;
    }
    const apply=()=>{
      const sh=mepSheet();
      const tp=mepDimTextPos(sh,d); // position actuelle, avant de changer d'axe
      d.orient=o;
      if(tp){
        const w=mepDimWorld(sh,d);
        if(w)d.off=mepDimOffsetFromPts(w.a.x,w.a.y,w.b.x,w.b.y,o,tp);
      }
    };
    if(draft){
      apply();mepRender();
      mepStatus(label+' : cliquez pour poser.');
      return;
    }
    mepEdit(label,apply);
    mepSt.selDim=d.id;mepSt.sel=null;mepRender();mepSideShow();
    mepStatus(label+' — clic droit pour changer l’orientation.');
  }
  function mepCtxShow(x,y,d,draft,snap){
    if(!mepCtxEl){
      mepCtxEl=document.createElement('div');
      mepCtxEl.id='mepCtx';
      mepCtxEl.style.cssText='display:none;position:fixed;z-index:10000;min-width:170px;padding:5px;'
        +'border:1px solid var(--border,#3a3a3e);border-radius:8px;background:var(--surface,#222);'
        +'box-shadow:0 8px 24px rgba(0,0,0,.45);font:12px sans-serif;color:var(--text,#eee)';
      document.body.appendChild(mepCtxEl);
      window.addEventListener('pointerdown',e=>{
        if(mepCtxEl&&mepCtxEl.style.display!=='none'&&!mepCtxEl.contains(e.target))mepCtxHide();
      },true);
    }
    mepCtxEl.innerHTML='';
    const title=document.createElement('div');
    title.textContent=d?(draft?'Cote en cours':'Cote'):'Accrochage';
    title.style.cssText='padding:3px 8px 5px;color:var(--muted,#999);font-size:.7rem';
    mepCtxEl.appendChild(title);
    const add=(label,cur,on)=>{
      const b=document.createElement('button');
      b.type='button';b.textContent=(cur?'✓ ':'   ')+label;
      b.style.cssText='display:block;width:100%;text-align:left;padding:5px 8px;border:0;border-radius:5px;'
        +'background:none;color:inherit;font:inherit;cursor:pointer';
      b.onmouseenter=()=>{b.style.background='var(--primary,#0a84ff)';b.style.color='#fff';};
      b.onmouseleave=()=>{b.style.background='none';b.style.color='inherit';};
      b.onclick=()=>{mepCtxHide();on();};
      mepCtxEl.appendChild(b);
    };
    if(d&&(d.kind==='dia'||d.kind==='rad')){
      add('Rayon (R)',d.kind==='rad',()=>mepDimSetKind(d,'rad',!!draft));
      add('Diamètre (Ø)',d.kind==='dia',()=>mepDimSetKind(d,'dia',!!draft));
    }
    if(d&&(d.kind==='len'||d.kind==='dist')&&!(d.kind==='dist'&&!d.b)){
      const o=d.orient||'a';
      add('Alignée (A)',o==='a',()=>mepDimSetOrient(d,'a',!!draft));
      add('Horizontale (X)',o==='h',()=>mepDimSetOrient(d,'h',!!draft));
      add('Verticale (Y)',o==='v',()=>mepDimSetOrient(d,'v',!!draft));
    }
    if(snap){
      // accrochage imposé des points de la cote (2026-10-28)
      if(mepCtxEl.children.length>1){
        const h=document.createElement('div');h.textContent='Accrochage';
        h.style.cssText='padding:6px 8px 3px;margin-top:3px;border-top:1px solid var(--border,#3a3a3e);color:var(--muted,#999);font-size:.7rem';
        mepCtxEl.appendChild(h);
      }
      MEP_SNAP_MODES.forEach(([m,lab])=>add(lab,(mepSt.snapMode||null)===m,()=>mepSetSnapMode(m)));
    }
    mepCtxEl.style.display='block';
    mepCtxEl.style.left='0px';mepCtxEl.style.top='0px';
    const r=mepCtxEl.getBoundingClientRect();
    const vw=window.innerWidth||1200,vh=window.innerHeight||800;
    mepCtxEl.style.left=Math.max(4,Math.min(x,vw-r.width-4))+'px';
    mepCtxEl.style.top=Math.max(4,Math.min(y,vh-r.height-4))+'px';
  }
  function mepOnContext(ev){
    ev.preventDefault();
    if(mepSt.vcmd){mepVcmdCancel();return;}
    if(mepSt.pick&&MEP_SK_TOOLS.indexOf(mepSt.pick.kind)>=0){mepSt.pick=null;mepRender();mepStatus('Tracé terminé.');return;}
    const sh=mepSheet();if(!sh)return;
    const canCtx=d=>d&&(d.kind==='dia'||d.kind==='rad'||d.kind==='len'||d.kind==='dist');
    const snapCtx=mepSt.tool==='dim'&&!(mepSt.dim&&mepSt.dim.kind==='dist'&&mepSt.dim._pp);
    if(mepSt.dim&&canCtx(mepSt.dim)){
      mepCtxShow(ev.clientX,ev.clientY,mepSt.dim,true,snapCtx);
      return;
    }
    if(snapCtx&&mepSt.chain){mepCtxShow(ev.clientX,ev.clientY,null,false,true);return;} // chaîne : accrochage seul
    const P=mepPt(ev),d=mepSt.dim?null:mepDimAt(sh,P.x,P.y);
    if(snapCtx&&!canCtx(d)){mepCtxShow(ev.clientX,ev.clientY,null,false,true);return;}
    if(canCtx(d)){
      mepSt.selDim=d.id;mepSt.sel=null;mepSt.entSel=[];
      mepRender();
      mepCtxShow(ev.clientX,ev.clientY,d,false);
      return;
    }
    mepCtxHide();
  }
