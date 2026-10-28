// Espace PLAN — suite de la fonction englobante ouverte dans 98-mep-00-modele.js (état privé partagé, fermée dans 98-mep-95-export-init.js) : cotation en chaîne.
  /* ═══════════════ U3. cotation en chaîne (outil Cote) ═══════════════ */
  /* 2026-10-28 : « je crée et positionne une cote, fonction cotation toujours active, je clique sur une
     des lignes de rappel et elle devient ma 1ère ligne de ma cote suivante ; au prochain clic, je
     positionne la cote et la 2nde ligne devient la 1ère ligne de la cote suivante, jusqu'à Échap qui
     valide l'empilement des cotes, toutes bien alignées ».
     mepSt.chain={vid,a (point local du rappel repris),orient,L (point papier de la ligne de cote),n,ghost}.
     Chaque clic donne un point (accrochage automatique ou imposé au clic droit) : la cote est posée
     aussitôt sur la même ligne de cote, même orientation ; son 2ᵉ rappel devient le départ suivant.
     Un clic SANS glisser sur un rappel lance la chaîne ; glisser déplace toujours la cote. */
  // rappel ('a' | 'b') d'une cote linéaire sous le point P (mm papier), null sur la ligne de cote ou l'étiquette
  function mepChainRappelAt(sh,d,P){
    if(!d||(d.kind!=='len'&&d.kind!=='dist'))return null;
    const g=mepDimLine(sh,d);if(!g)return null;
    const sd=(x1,y1,x2,y2)=>{
      const dx=x2-x1,dy=y2-y1,L2=dx*dx+dy*dy;
      const t=L2>1e-12?Math.max(0,Math.min(1,((P.x-x1)*dx+(P.y-y1)*dy)/L2)):0;
      return Math.hypot(P.x-(x1+dx*t),P.y-(y1+dy*t));
    };
    const tol=6/(mepSt.zoom||1);
    const da=sd(g.sa.x,g.sa.y,g.ea.x,g.ea.y),db=sd(g.sb.x,g.sb.y,g.eb.x,g.eb.y),dl=sd(g.a1.x,g.a1.y,g.b1.x,g.b1.y);
    const m=Math.min(da,db);
    if(!(m<tol)||dl<m)return null;
    // la zone de saisie de l'étiquette est large (18 mm) : seul le texte lui-même l'emporte sur le rappel
    const tp=mepDimTextPos(sh,d);
    if(tp&&Math.hypot(P.x-tp.x,P.y-tp.y)<Math.min(m,2.5/(mepSt.zoom||1)))return null;
    return da<=db?'a':'b';
  }
  function mepChainStart(sh,d,end){
    const g=mepDimLine(sh,d);if(!g)return false;
    const p=end==='a'?d.a:d.b;if(!p)return false;
    const vid=end==='a'?d.vid:(d.vid2||d.vid);
    mepSt.chain={vid,a:JSON.parse(JSON.stringify(p)),orient:d.orient||'a',L:end==='a'?{x:g.a1.x,y:g.a1.y}:{x:g.b1.x,y:g.b1.y},n:0,ghost:null};
    mepSt.selDim=null;mepSt.sel=null;mepSt.entSel=[];mepSt.dim=null;mepSt.hovEnt=null;
    mepStatus('Chaîne de cotes : cliquez le point suivant (clic droit : accrochage, Échap termine).');
    mepRender();
    return true;
  }
  // cote de la chaîne vers le point local q, sur la ligne de cote commune (null si nulle ou impossible)
  function mepChainDim(sh,C,q){
    const d={kind:'dist',vid:C.vid,vid2:null,a:JSON.parse(JSON.stringify(C.a)),b:q,orient:C.orient,off:0,tol:null};
    const w=mepDimWorld(sh,d);if(!w)return null;
    const dx=w.b.x-w.a.x,dy=w.b.y-w.a.y;
    if(C.orient==='h'?Math.abs(dx)<1e-6:C.orient==='v'?Math.abs(dy)<1e-6:Math.hypot(dx,dy)<1e-6)return null;
    d.off=mepDimOffsetFromPts(w.a.x,w.a.y,w.b.x,w.b.y,C.orient,C.L);
    return d;
  }
  // point visé au curseur : accrochage imposé (S, comme les clics de l'outil Cote) ou automatique
  function mepChainPtAuto(sh,C,P){
    const v=mepView(sh,C.vid);if(!v)return null;
    const snap=mepSnapPt(P.x,P.y,sh);
    const q={x:(snap.x-v.x)/v.scale,y:(snap.y-v.y)/v.scale};
    const hh=(snap.hit&&snap.hit.vid===v.id)?mepSnapHint(sh,v,snap,q):null;if(hh)q.hint=hh;
    return q;
  }
  function mepChainHover(sh,P){
    const C=mepSt.chain;let q=null;
    if(mepSt.snapMode){
      const isInt=mepSt.snapMode==='int',ih=isInt?mepIntPickHit(sh,P):null;
      const S=isInt?mepIntPoint(sh,mepSt.intPick,ih,P):mepSnapModePt(sh,P.x,P.y,mepSt.snapMode);
      mepSt.snapHov=S;
      mepSt.hovEnt=ih?{vid:ih.vid,i:ih.i,sig:mepEntSig(ih.e)}:null;
      if(S&&S.vid===C.vid)q={x:S.q.x,y:S.q.y};
    }else{
      mepSt.snapHov=null;
      const hit=mepHitViewEnt(sh,P.x,P.y,{axes:true});
      mepSt.hovEnt=hit?{vid:hit.vid,i:hit.i,sig:mepEntSig(hit.e)}:null;
      q=mepChainPtAuto(sh,C,P);
    }
    C.ghost=q?mepChainDim(sh,C,q):null;
    if(C.ghost)C.ghost.__ghost=true;
    mepRender();
  }
  function mepChainClick(sh,P){
    const C=mepSt.chain;let q;
    if(mepSt.snapMode){
      const S=mepSnapModeClick(sh,P);
      if(!S)return;
      if(S.vid!==C.vid){mepStatus('Chaîne de cotes : le point doit être dans la même vue.');return;}
      q=mepSnapModeQ(sh,S);
    }else q=mepChainPtAuto(sh,C,P);
    const d=q&&mepChainDim(sh,C,q);
    if(!d){mepStatus('Chaîne de cotes : cote nulle dans cette direction — cliquez un autre point.');return;}
    d.id=mepUid('d');d.ref=false;
    mepEdit('cote en chaîne',()=>{mepDimAutoDia(sh,d);sh.dims.push(d);});
    C.a=JSON.parse(JSON.stringify(d.b));C.n++;C.ghost=null;
    mepSt.snapMode=null;mepSt.snapHov=null;mepSt.intPick=null;
    mepStatus('Chaîne de cotes : '+C.n+' cote'+(C.n>1?'s':'')+' — cliquez le point suivant (Échap termine).');
    mepRender();
  }
  function mepChainEnd(){
    const C=mepSt.chain;if(!C)return false;
    mepSt.chain=null;mepSt.snapMode=null;mepSt.snapHov=null;mepSt.intPick=null;mepSt.hovEnt=null;
    mepStatus('Chaîne de cotes terminée'+(C.n?' : '+C.n+' cote'+(C.n>1?'s':'')+' alignée'+(C.n>1?'s':''):'')+'.');
    mepRender();
    return true;
  }
