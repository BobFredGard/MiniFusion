// Espace PLAN — suite de la fonction englobante ouverte dans 98-mep-00-modele.js (état privé partagé, fermée dans 98-mep-95-export-init.js) : outil cote unique.
  /* ═══════════════ U. outil cote unique ═══════════════ */
  /* pré-sélection : clic dans le vide = désélection ; clic sur arête/cercle = (dé)sélection */
  function mepEntSig(e){
    if(!e)return '';
    if(e.ak)return 'X'+e.ak; // trait d'axe : sa clé (il s'allonge sans changer d'identité)
    if(e.t==='L')return 'L'+[e.x1,e.y1,e.x2,e.y2].map(x=>(+x).toFixed(3)).join(',');
    if(e.t==='C')return 'C'+[e.cx,e.cy,e.r].map(x=>(+x).toFixed(3)).join(',');
    if(e.t==='A')return 'A'+[e.cx,e.cy,e.r,e.a0,e.a1].map(x=>(+x).toFixed(4)).join(',');
    return e.t||'?';
  }
  function mepSameHovEnt(a,b){
    if(!a||!b)return a===b;
    return a.vid===b.vid&&a.i===b.i&&a.sig===b.sig;
  }
  function mepSameEntSel(hit){
    return !!(hit&&(mepSt.entSel||[]).some(s=>s.vid===hit.vid&&s.i===hit.i
      &&(!s.sig||s.sig===mepEntSig(hit.e))));
  }
  function mepDimRefreshDraft(){
    const d=mepDimDraftFromSel();
    if(!d)return null;
    d.__sel=false;
    mepSt.dim=d;
    return d;
  }
  function mepDimSelectEnt(hit,alt){
    if(!hit||!hit.e)return false;
    const t=hit.e.t;
    if(t!=='L'&&t!=='C'&&t!=='A')return false;
    mepSt.sel=null;mepSt.selDim=null;
    mepSt.entSel=[{vid:hit.vid,i:hit.i,t,sig:mepEntSig(hit.e),lx:hit.lx,ly:hit.ly}];
    const d=mepDimRefreshDraft();
    if(!d){
      mepSt.entSel=[];
      mepStatus('Cote : cette entité ne peut pas être cotée seule.');
      mepRender();
      return false;
    }
    if(t==='C'||t==='A')d.kind=mepDimKindForEnt(t,!!alt);
    mepSt.hovEnt={vid:hit.vid,i:hit.i,sig:mepEntSig(hit.e)};
    const label=t==='L'?'Longueur':d.kind==='dia'?'Cote Ø':'Cote R';
    mepStatus(label+' : cliquez une 2ᵉ entité ou posez la cote (Échap annule).');
    mepRender();
    return true;
  }
  function mepDimAddEnt(hit){
    const before=(mepSt.entSel||[]).slice();
    mepEntSelToggle(hit,true);
    const d=mepDimRefreshDraft();
    if(!d){
      mepSt.entSel=before;
      mepStatus('Cote : ces 2 entités ne peuvent pas être cotées ensemble.');
      mepRender();
      return false;
    }
    mepSt.hovEnt={vid:hit.vid,i:hit.i,sig:mepEntSig(hit.e)};
    mepStatus('2 entités — cliquez pour poser la cote (clic droit : R/Ø).');
    mepRender();
    return true;
  }
  function mepEntSelToggle(hit,add){
    if(!hit)return;
    if(!mepSt.entSel)mepSt.entSel=[];
    const i=mepSt.entSel.findIndex(s=>s.vid===hit.vid&&s.i===hit.i);
    if(i>=0)mepSt.entSel.splice(i,1);
    else{
      if(mepSt.entSel.length>=2){
        if(add){mepStatus('2 entités maximum pour une cote.');return;}
        mepSt.entSel=[];
      }
      mepSt.entSel.push({vid:hit.vid,i:hit.i,t:hit.e.t,sig:mepEntSig(hit.e),lx:hit.lx,ly:hit.ly});
    }
    if(mepSt.entSel.length){mepSt.sel=null;mepSt.selDim=null;}
    const n=mepSt.entSel.length;
    mepStatus(n?('Sélection : '+n+' entité(s) — bouton Cote pour coter.'):'Sélection vide.');
  }
  function mepEntRef(sh,s){
    const v=mepView(sh,s.vid);if(!v)return null;
    const e=mepEntByHint(v,{i:s.i});
    if(!e)return null;
    if(s.sig&&s.sig!==mepEntSig(e))return null;
    return{v,e,i:s.i};
  }
  // type par défaut : un arc se cote en R, un cercle complet en Ø (Alt inverse,
  // le menu contextuel permet de revenir à l'autre type après coup).
  function mepDimKindForEnt(t,alt){return t==='A'?(alt?'dia':'rad'):(alt?'rad':'dia');}
  function mepSnapSeg(e,lx,ly,tol){
    const dx=e.x2-e.x1,dy=e.y2-e.y1,L2=dx*dx+dy*dy;
    let t=L2>1e-12?((lx-e.x1)*dx+(ly-e.y1)*dy)/L2:0;
    t=t<0?0:(t>1?1:t);
    if(tol>0){
      const d0=Math.hypot(lx-e.x1,ly-e.y1),d1=Math.hypot(lx-e.x2,ly-e.y2);
      if(d0<=tol&&d0<=d1)t=0;
      else if(d1<=tol)t=1;
    }
    return{t:t,x:e.x1+dx*t,y:e.y1+dy*t};
  }
  /* Construit la cote à partir de la pré-sélection (1 ou 2 entités projetées). */
  function mepDimDraftFromSel(){
    const sh=mepSheet();if(!sh)return null;
    const sel=(mepSt.entSel||[]).slice();
    const A=sel[0]?mepEntRef(sh,sel[0]):null;
    if(!A)return null;
    const base={off:10,tol:null,__ghost:true,__sel:true};
    if(sel.length===1){
      const{v,e,i}=A;
      if(e.t==='L')return Object.assign(base,{kind:'len',vid:v.id,vid2:null,
        a:{x:e.x1,y:e.y1,hint:{t:'seg',i}},b:{x:e.x2,y:e.y2}});
      if(e.t==='C'||e.t==='A'){
        return Object.assign(base,{kind:mepDimKindForEnt(e.t,false),vid:v.id,vid2:null,
          a:{x:e.cx,y:e.cy,hint:{t:'ctr',i}},b:{x:e.cx+e.r,y:e.cy}});
      }
      return null;
    }
    if(sel.length!==2)return null;
    const B=mepEntRef(sh,sel[1]);if(!B)return null;
    const Av=A.v,Ae=A.e,Ai=A.i,Bv=B.v,Be=B.e,Bi=B.i;
    const isL=x=>x.t==='L',isC=x=>x.t==='C'||x.t==='A';
    if(isL(Ae)&&isL(Be)){
      const ax=Ae.x2-Ae.x1,ay=Ae.y2-Ae.y1,bx=Be.x2-Be.x1,by=Be.y2-Be.y1;
      const la=Math.hypot(ax,ay)||1,lb=Math.hypot(bx,by)||1;
      const par=Math.abs(ax*by-ay*bx)/(la*lb)<1e-4;
      if(par&&Av.id===Bv.id){
        // droites parallèles : distance perpendiculaire. On ancre la cote au
        // milieu des deux points cliqués (borné sur A) puis on projette ce
        // point sur B : les extrémités et le dégagement restent ceux de la
        // géométrie, pas le milieu arbitraire du segment.
        const sA=sel[0],sB=sel[1];
        const snapTol=Math.max(0.15,Math.min(2,1.5/Math.max(Av.scale,1e-9)));
        const pA=(sA&&sA.lx!=null)?mepSnapSeg(Ae,sA.lx,sA.ly,snapTol)
          :{t:0.5,x:Ae.x1+ax*0.5,y:Ae.y1+ay*0.5};
        const pB=(sB&&sB.lx!=null)?mepSnapSeg(Be,sB.lx,sB.ly,snapTol)
          :{t:0.5,x:Be.x1+bx*0.5,y:Be.y1+by*0.5};
        const tA=pA.t;
        const tB=((pB.x-Ae.x1)*ax+(pB.y-Ae.y1)*ay)/(la*la);
        let t=(tA+tB)/2;t=t<0?0:(t>1?1:t);
        const ax0=Ae.x1+ax*t,ay0=Ae.y1+ay*t;
        let tb=((ax0-Be.x1)*bx+(ay0-Be.y1)*by)/(lb*lb);
        tb=tb<0?0:(tb>1?1:tb);
        // génératrices d'un même cylindre : la distance est un diamètre
        let cyl=false;try{cyl=mepCylDiaBetween(Av,Ae,Be);}catch(e){}
        return Object.assign(base,{kind:'dist',vid:Av.id,vid2:null,
          a:{x:ax0,y:ay0,hint:{t:'seg',i:Ai}},
          b:{x:Be.x1+bx*tb,y:Be.y1+by*tb,hint:{t:'seg',i:Bi}}},cyl?{dsym:'Ø'}:{});

      }
      return Object.assign(base,{kind:'ang',off:14,vid:Av.id,vid2:Bv.id,
        a:{x:Ae.x1,y:Ae.y1,hint:{t:'seg',i:Ai}},
        b:{x:Be.x1,y:Be.y1,hint:{t:'seg',i:Bi}}});
    }
    if(isC(Ae)&&isC(Be)){
      // entraxe : les deux centres doivent être dans la même vue (repère commun)
      if(Av.id!==Bv.id)return null;
      return Object.assign(base,{kind:'dist',vid:Av.id,vid2:null,
        a:{x:Ae.cx,y:Ae.cy},b:{x:Be.cx,y:Be.cy}});
    }
    // cercle + droite : distance centre ↔ droite (pied de perpendiculaire)
    const line=isL(Ae)?Ae:(isL(Be)?Be:null),circ=isC(Ae)?Ae:(isC(Be)?Be:null);
    if(line&&circ){
      const lv=isL(Ae)?Av:Bv,cv=isL(Ae)?Bv:Av;
      if(lv.id!==cv.id)return null;
      const ax=line.x2-line.x1,ay=line.y2-line.y1,la=Math.hypot(ax,ay)||1;
      let t=((circ.cx-line.x1)*ax+(circ.cy-line.y1)*ay)/(la*la);
      t=t<0?0:(t>1?1:t);
      return Object.assign(base,{kind:'dist',vid:lv.id,vid2:null,
        a:{x:line.x1+ax*t,y:line.y1+ay*t},b:{x:circ.cx,y:circ.cy}});
    }
    return null;
  }
  /* Met la cote (brouillon ou existante) sous le curseur. */
  function mepDimMoveTo(sh,d,P,pk){
    if(!d)return false;
    const w=mepDimWorld(sh,d);if(!w)return false;
    if(d.kind==='len'||d.kind==='dist'){
      if(!d.b)return false;
      // Une cote en cours de pose choisit son axe au curseur ; une cote déjà
      // posée garde son orientation quand on déplace son étiquette.
      if(d.__ghost&&!d.__orientLock)mepDimOrientAt(sh,d,P);
      const o=d.orient||'a';
      const w2=mepDimWorld(sh,d);if(!w2)return false;
      // 2026-10-22-012 : cote POSÉE saisie (ligne ou valeur) — le geste la déplace à la fois le long
      // des lignes de rappel (décalage) et le long de sa ligne (valeur), en relatif : rien ne saute
      if(pk&&pk.off0!=null&&pk.sx!=null){
        const offAt=Q=>{
          if(o==='h'||o==='v')return mepDimOffsetFromPts(w2.a.x,w2.a.y,w2.b.x,w2.b.y,o,Q);
          const dx=w2.b.x-w2.a.x,dy=w2.b.y-w2.a.y,L=Math.hypot(dx,dy);
          return L<1e-9?0:(Q.x-w2.a.x)*(-dy/L)+(Q.y-w2.a.y)*(dx/L);
        };
        const S={x:pk.sx,y:pk.sy};
        d.off=(+pk.off0||0)+offAt(P)-offAt(S);
        const g=mepDimLine(sh,d,mepDimWorld(sh,d));
        if(g){
          const to=(+pk.txtOff0||0)+(P.x-S.x)*g.ux+(P.y-S.y)*g.uy;
          d.txtOff=mepDimTxtOffSnap(sh,d,to,g);
        }
        return true;
      }
      if(!(pk&&pk.labelHit)){
        if(o==='h'||o==='v'){
          d.off=mepDimOffsetFromPts(w2.a.x,w2.a.y,w2.b.x,w2.b.y,o,P);
        }else{
          const dx=w2.b.x-w2.a.x,dy=w2.b.y-w2.a.y,L=Math.hypot(dx,dy);
          if(L<1e-9)return false;
          d.off=(P.x-w2.a.x)*(-dy/L)+(P.y-w2.a.y)*(dx/L);
        }
      }
      if(pk&&pk.labelHit){
        const g=mepDimLine(sh,d,w2);
        if(g){
          const mx=(g.a1.x+g.b1.x)/2,my=(g.a1.y+g.b1.y)/2;
          const to=(P.x-mx)*g.ux+(P.y-my)*g.uy;
          d.txtOff=mepDimTxtOffSnap(sh,d,to,g);
        }
      }
      return true;
    }
    // angle : le curseur règle le rayon de l'arc (centré sur le sommet réel) et choisit
    // le secteur coté parmi les 4 (θ / 180−θ) ; en rentrant, le secteur du curseur est
    // celui du milieu de l'arc, donc on cote le complément du secteur OPPOSÉ.
    if(d.kind==='ang'){
      let g=mepAngGeom(sh,d);
      if(!g)return false;
      // texte saisi : il glisse le long de l'arc (relatif au geste), aimanté au milieu
      if(pk&&pk.labelHit&&pk.sx!=null){
        const r=mepAngRadius(d),ang=Q=>Math.atan2(Q.y-g.O.y,Q.x-g.O.x);
        let da=ang(P)-ang({x:pk.sx,y:pk.sy});
        while(da>Math.PI)da-=2*Math.PI;while(da<=-Math.PI)da+=2*Math.PI;
        const to=mepAngTxtOffSnap((+pk.txtOff0||0)+da*r);
        if(to)d.txtOff=+to.toFixed(3);else delete d.txtOff;
        return true;
      }
      if(Math.hypot(P.x-g.O.x,P.y-g.O.y)>1e-6){
        const q=mepAngSectorAt(g.b1,g.b2,Math.atan2(P.y-g.O.y,P.x-g.O.x))^(d.big?3:0);
        if(q!==((+d.q||0)&3)){if(q)d.q=q;else delete d.q;g=mepAngGeom(sh,d)||g;}
      }
      // le texte est collé à l'arc, juste à l'extérieur : le curseur règle l'arc lui-même
      d.off=Math.max(6,Math.min(80,Math.hypot(P.x-g.O.x,P.y-g.O.y)));
      return true;
    }
    // Ø/R : translation du point d'ancrage (si on a saisi l'étiquette, on
    // conserve le décalage main→étiquette au lieu de la coller sous le doigt).
    const v=mepView(sh,d.vid);
    if(!v)return false;
    let sx=P.x,sy=P.y;
    if(pk&&pk.cx!=null){sx=pk.cx+(P.x-pk.sx);sy=pk.cy+(P.y-pk.sy);}
    if(d.kind==='dia'||d.kind==='rad'||d.kind==='hole'||d.kind==='note'){
      d.b={x:(sx-v.x)/v.scale,y:(sy-v.y)/v.scale};
      return true;
    }
    if(d.kind==='ord'&&pk&&pk.jog){ // cassure : la valeur glisse le long de l'axe
      const q=d.pts&&d.pts[pk.jog.i];if(!q)return false;
      const v1=mepView(sh,d.vid),sc=(v1&&v1.scale)||1;
      q.jog=+(pk.jog.j0+(d.axis==='y'?P.y-pk.sy:P.x-pk.sx)/sc).toFixed(3); // mm vue (suit l'échelle)
      if(Math.abs(q.jog)<1e-3)delete q.jog;
      return true;
    }
    if(d.kind==='ord'&&pk&&pk.off0!=null){ // tout le groupe glisse perpendiculairement à l'axe
      d.off=(+pk.off0||0)+(d.axis==='y'?P.x-pk.sx:P.y-pk.sy);
      return true;
    }
    return false;
  }
  function mepDimClearSelection(){
    mepSt.dim=null;mepSt.entSel=[];mepSt.hovEnt=null;mepSt.dimLine=null;mepSt.intPick=null;
  }
  function mepDimCommitDraft(sh,P,ref){
    const D=mepSt.dim;if(!D)return;
    if(!mepDimWorld(sh,D)){
      mepDimClearSelection();mepRender();
      mepStatus('Cote annulée : vue supprimée.');
      return;
    }
    mepDimMoveTo(sh,D,P);
    const id=mepUid('d');
    const d=Object.assign({},D,{id,ref:!!ref,tol:D.tol||null});
    delete d.__ghost;delete d.__sel;delete d.__orientLock;
    // retirer le fantôme AVANT le rendu de mepEdit (sinon il reste affiché)
    mepDimClearSelection();
    mepSt.selDim=id;mepSt.sel=null;
    mepEdit('cote '+(d.kind==='hole'?'perçage':d.kind==='dia'?'Ø':d.kind==='rad'?'R':d.kind==='ang'?'angle':d.kind==='len'?'longueur':'distance'),()=>{
      mepDimAutoDia(sh,d);
      sh.dims.push(d);
    });
    mepSideShow();
    mepStatus('Cote posée — glissez n’importe quel trait rouge ou l’étiquette pour la déplacer.');
  }
  function mepDimClick(sh,P,ctrl,shift,alt){
    const tool=mepSt.dim; // état en cours : {kind,a,vid,ent}
    if(!tool&&mepSt.snapMode){
      // accrochage imposé (menu contextuel) : le clic donne un POINT, jamais une entité
      // (Intersection : 2 clics d'entités, cf. mepIntClick)
      const S=mepSnapModeClick(sh,P);
      if(!S)return;
      if(mepSt.dimLine){mepDimLineToPt(sh,S,P);return;} // 1ʳᵉ entité = une droite
      mepSt.dim={kind:'dist',a:mepSnapModeQ(sh,S),vid:S.vid,off:8,__ghost:true};
      mepSt.snapHov=null;
      mepStatus('Distance : cliquez le 2ᵉ point (accrochage '+mepSnapModeLabel(mepSt.snapMode).toLowerCase()+', clic droit pour changer).');
      mepRender();
      return;
    }
    if(!tool){
      // 1ᵉʳ clic : sélection d'une entité, sans poser la cote. Un 2ᵉ clic sur
      // une autre entité construit distance/angle ; sinon le clic suivant pose.
      const hit=mepHitViewEnt(sh,P.x,P.y,{axes:true});
      if(hit&&mepDimSelectEnt(hit,alt))return;
      // sinon : point libre (distance)
      const snap=mepSnapPt(P.x,P.y,sh);
      const v=mepViewAt(sh,snap.x,snap.y);
      const lx=v?(snap.x-v.x)/v.scale:0,ly=v?(snap.y-v.y)/v.scale:0;
      if(!v){mepStatus('Cote : cliquez une arête ou un cercle projeté.');return;}
      const qa={x:lx,y:ly};{const hh=(snap.hit&&snap.hit.vid===v.id)?mepSnapHint(sh,v,snap,qa):null;if(hh)qa.hint=hh;}
      mepSt.dim={kind:'dist',a:qa,vid:v.id,off:8,__ghost:true};
      mepStatus('Distance : cliquez le 2ᵉ point.');
      return;
    }
    /* 2ᵉ clic */
    const D=mepSt.dim;
    const sh2=sh;
    if(D.kind==='dist'&&!D.b&&mepSt.snapMode){
      const S=mepSnapModeClick(sh2,P);
      if(!S)return;
      if(S.vid!==D.vid){mepStatus('Distance : les 2 points doivent être dans la même vue.');return;}
      D.b=mepSnapModeQ(sh2,S);
      D._pp=P;mepSt.snapHov=null;
      mepStatus('Distance : encore un clic pour placer la cote.');
      mepRender();
      return;
    }
    if(D.kind==='dist'&&!D.b){
      const snap=mepSnapPt(P.x,P.y,sh2);
      const v=mepView(sh2,D.vid);
      if(!v){mepSt.dim=null;return;}
      const lx=(snap.x-v.x)/v.scale,ly=(snap.y-v.y)/v.scale;
      D.b={x:lx,y:ly};{const hh=(snap.hit&&snap.hit.vid===v.id)?mepSnapHint(sh2,v,snap,D.b):null;if(hh)D.b.hint=hh;}
      D._pp=P; // position papier du 2ᵉ clic → futur placement
      mepStatus('Distance : encore un clic pour placer la cote.');
      return;
    }
    if(D.kind==='dist'&&D.b&&D._pp){
      // placement final
      const a=D.a,b=D.b,vid=D.vid;
      mepDimMoveTo(sh2,D,P);
      const off=D.off,orient=D.orient||'a';
      mepEdit('cote distance',()=>{
        const nd={id:mepUid('d'),kind:'dist',vid,vid2:null,a,b,off,orient,ref:shift,tol:null};
        mepDimAutoDia(sh2,nd);
        sh2.dims.push(nd);
      });
      mepDimClearSelection();mepSt.selDim=null;mepSt.sel=null;mepSt.snapMode=null;mepSt.snapHov=null;mepRender();
      mepStatus('Cote posée.');
      return;
    }
    if(D.kind==='len'){
      // Ctrl + 2ᵉ segment → angle
      if(ctrl){
        const hit=mepHitViewEnt(sh2,P.x,P.y,{axes:true});
        if(hit&&hit.e.t==='L'){
          mepEdit('cote angle',()=>{
            sh2.dims.push({id:mepUid('d'),kind:'ang',vid:D.vid,vid2:hit.vid,
              a:D.a,b:{x:hit.lx,y:hit.ly,hint:{t:'seg',i:hit.i}},off:10,ref:shift,tol:null});
          });
          mepDimClearSelection();mepSt.selDim=null;mepSt.sel=null;mepRender();
          mepStatus('Cote angulaire posée.');
          return;
        }
      }
      // placement : la cote porte sur les DEUX extrémités de l'arête (point cliqué ≠ cote)
      const v=mepView(sh2,D.vid);
      if(v){
        // orienter l'offset perpendiculairement au segment
        const e=D.a.hint?mepEntByHint(v,D.a.hint):null;
        let A={x:D.a.x,y:D.a.y},B={x:D.a.x,y:D.a.y};
        if(e&&e.t==='L'){A={x:e.x1,y:e.y1};B={x:e.x2,y:e.y2};}
        const ax=v.x+A.x*v.scale,ay=v.y+A.y*v.scale;
        const bx=v.x+B.x*v.scale,by=v.y+B.y*v.scale;
        const orient=mepDimOrientFromPts(ax,ay,bx,by,P);
        const off=mepDimClampOff(mepDimOffsetFromPts(ax,ay,bx,by,orient,P),6);
        mepEdit('cote longueur',()=>{
          const nd={id:mepUid('d'),kind:'len',vid:D.vid,vid2:null,a:A,b:B,off,orient,ref:shift,tol:null};
          mepDimAutoDia(sh2,nd);
          sh2.dims.push(nd);
        });
      }
      mepDimClearSelection();mepSt.selDim=null;mepSt.sel=null;mepRender();
      mepStatus('Cote posée.');
      return;
    }
    if(D.kind==='dia'||D.kind==='rad'){
      const off=mepDimOff(D.a,{x:D.a.x+0.001,y:D.a.y},P);
      // b = point direction du leader
      const v=mepView(sh2,D.vid);
      let bx=D.a.x,by=D.a.y-1;
      if(v){
        bx=(P.x-v.x)/D.a.x!==0?(P.x-v.x)/v.scale:D.a.x;
        bx=(P.x-v.x)/v.scale;by=(P.y-v.y)/v.scale;
      }
      mepEdit('cote '+(D.kind==='dia'?'Ø':'R'),()=>{
        sh2.dims.push({id:mepUid('d'),kind:D.kind,vid:D.vid,vid2:null,
          a:D.a,b:{x:bx,y:by},off:0,ref:shift,tol:null});
      });
      mepDimClearSelection();mepSt.selDim=null;mepSt.sel=null;mepRender();
      mepStatus('Cote posée.');
      return;
    }
    // repli
    mepDimClearSelection();mepRender();
  }
  function mepDimOff(a,b,P){
    const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1;
    const nx=-dy/L,ny=dx/L;
    return Math.abs((P.x-a.x)*nx+(P.y-a.y)*ny)||8;
  }
