/* ----- niveaux Z (ébauche par passes ap, finition = dernier niveau) ----- */
function faoFacingAe(stock,D,np){
  // Écart (ae) pour usiner EXACTEMENT np passes sur la largeur du brut + Ø.
  const d=(isFinite(+D)&&+D>0)?+D:10;
  const H=(+stock.y1-+stock.y0)+d;
  if(!(np>=2)||!(H>0))return null;
  return Math.round((H/(np-1))*1000)/1000;
}
function faoFacingYs(stock,r,ae){
  // Extrêmes du zigzag : la 1ʳᵉ (et la dernière) ligne MORDE dans la matière de la
  // valeur d'écart (plafonnée au rayon) — plus tangente à l'arête du brut.
  const a=(isFinite(+ae)&&+ae>0)?+ae:1;
  const m=Math.min(a,r);
  let yA=+stock.y0-r+m, yB=+stock.y1+r-m;
  if(!(yB>yA)){ yA=+stock.y0-r; yB=+stock.y1+r; } // span < 2m : sans mordant
  return {yA:yA,yB:yB};
}
function faoFacingCount(stock,D,ae){
  // Nombre de lignes que le zigzag produit (même logique que faoGenFacing).
  const d=(isFinite(+D)&&+D>0)?+D:10;
  const r=d/2;
  const a=(isFinite(+ae)&&+ae>0)?+ae:d*0.6;
  const Y=faoFacingYs(stock,r,a);
  let y=Y.yA,n=1,guard=0;
  while(y<Y.yB-1e-9&&guard++<100000){ y=Math.min(y+a,Y.yB); n++; }
  return n;
}
function faoFacingAp(stock,z,npz){
  // Pas en Z calculé du surfaçage : ébauche du dessus du brut (z1) à la cote z
  // en npz passes égales → ap=(z1−z)/npz. npz<2 ou z≥z1 → null (1 passe).
  if(!(npz>=2))return null;
  const zTop=isFinite(+stock.z1)?+stock.z1:null;
  if(zTop==null||!(zTop-(+z)>1e-9))return null;
  return Math.round(((zTop-(+z))/npz)*1000)/1000;
}
function faoLevels(zTop,zBot,ap){
  const p=isFinite(+ap)&&+ap>0?+ap:5;
  const lo=Math.min(+zTop,+zBot), hi=Math.max(+zTop,+zBot);
  const out=[]; let z=hi-p;
  if(!(isFinite(lo)&&isFinite(hi)))return [];
  while(z>lo+1e-9){ out.push(Math.round(z*1000)/1000); z-=p; }
  out.push(Math.round(lo*1000)/1000);
  return out;
}

/* ----- générateurs : surfaçage (zigzag, passe d'ébauche ou finition) ----- */
function faoGenFacing(stock,o){
  o=o||{};
  const D=isFinite(+o.toolD)&&+o.toolD>0?+o.toolD:10;
  const r=D/2;
  let ae=isFinite(+o.ae)&&+o.ae>0?+o.ae:D*0.6;
  const z=isFinite(+o.z)?+o.z:stock.z1;
  const secu=isFinite(+o.secu)?+o.secu:z+5;
  // Dépassement XY : l'outil sort de la matière de `sortie` mm (champ « Sortie »,
  // défaut 5 — historique 2) AVANT son demi-tour en bout de ligne.
  const dep=r+(isFinite(+o.sortie)&&+o.sortie>=0?+o.sortie:2);
  const yA0=stock.y0-r, yB0=stock.y1+r;
  // Passes pilotées (op.np ≥ 2) : écart exact H/(np−1) → couverture totale
  // garantie, dernier aligné sur la lisière. np absent/null → pilotage par ae.
  const np=isFinite(+o.np)?Math.floor(+o.np):0;
  if(np>=2&&yB0>yA0)ae=Math.max(0.01,(yB0-yA0)/(np-1));
  // Extrêmes avec mordant (l'écart morde dans la matière, plafonné au rayon).
  const Y=faoFacingYs(stock,r,ae), yA=Y.yA, yB=Y.yB;
  // Passes en Z (op.npz ≥ 2) : l'ébauche descend du dessus du brut (z1) jusqu'à
  // la cote z en npz passes égales → ap = (z1−z)/npz, dernière passe = cote.
  // npz absent/1, ou z ≥ z1 (rien à enlever) → une seule passe (historique).
  const npz=(isFinite(+o.npz)&&+o.npz>=2)?Math.floor(+o.npz):1;
  const zTop=isFinite(+stock.z1)?+stock.z1:z;
  const zs=[];
  if(npz>=2&&zTop>z+1e-9){
    const ap=(zTop-z)/npz;
    for(let k=1;k<=npz;k++)zs.push(k<npz?Math.round((zTop-k*ap)*1000)/1000:z);
  }else zs.push(z);
  const moves=[{r:1,x:stock.x0-dep,y:yA,z:secu}];
  let sens=1, garde=0;
  zs.forEach(function(lv,i){
    // niveaux pairs montent en Y (yA→yB), impairs descendent (yB→yA) : le
    // boustrophédon se poursuit d'un niveau au suivant, plongée hors matière.
    const yDown=(i%2===1);
    let y=yDown?yB:yA;
    if(i===0){
      moves.push({r:1,x:stock.x0-dep,y:yA,z:lv});
      moves.push({r:0,x:stock.x0-dep,y:yA,z:lv});
    }else{
      // même XY qu'on quitte (extrémité en dépassement, lisière en Y) : simple
      // changement de niveau Z — jamais de traversée en diagonale dans la matière.
      moves.push({r:0,x:moves[moves.length-1].x,y:moves[moves.length-1].y,z:lv});
    }
    // 2026-10-04-005 : la ligne est sillonnée AVANT le test de lisière — la
    // dernière passe devait finir le travail (l'alignement de bord manquait).
    while(garde++<100000){
      const xT=sens>0?stock.x1+dep:stock.x0-dep;
      moves.push({r:0,x:xT,y:y,z:lv});            // ligne : toute la largeur
      sens=-sens;                                  // prochaine ligne : l'autre côté
      if(yDown?y<=yA+1e-9:y>=yB-1e-9)break;        // lisière atteinte : tout est fait
      y=yDown?Math.max(y-ae,yA):Math.min(y+ae,yB);
      moves.push({r:0,x:xT,y:y,z:lv});            // transposition verticale (hors matière)
    }
  });
  moves.push({r:1,x:moves[moves.length-1].x,y:moves[moves.length-1].y,z:secu});
  return moves;
}

/* ----- poche rectangulaire (ébauche : offsets concentriques par niveau) ----- */
// radial : surépaisseur sur parois (XY) ; axial : surépaisseur sur le fond (Z).
function faoGenPocket(rect,zTop,zBot,o){
  o=o||{};
  const D=isFinite(+o.toolD)&&+o.toolD>0?+o.toolD:10;
  const r=D/2, ae=isFinite(+o.ae)&&+o.ae>0?+o.ae:D*0.5;
  const RA=faoRA(o);
  const secu=isFinite(+o.secu)?+o.secu:+zTop+5;
  const R={x0:rect.x0+RA.radial, y0:rect.y0+RA.radial, x1:rect.x1-RA.radial, y1:rect.y1-RA.radial};
  const zb=+zBot+RA.axial;
  if(R.x1-R.x0<0.05||R.y1-R.y0<0.05)return [];
  // 2026-10-08-004 : entrée circulaire — centre d'outil légal = boîte de la
  // poche retirée de r (jamais dans la paroi).
  const entryMode=o.entry||'auto';
  const rhoCirc=faoCircRhos(D,ae,o.entryR);
  // 2026-10-08-005 : air = hors de la boîte de poche (matière restante =
  // intérieur du rectangle usiné).
  const airPk=function(x,y){ return x<R.x0-1e-9||x>R.x1+1e-9||y<R.y0-1e-9||y>R.y1+1e-9; };
  const pocketOK=function(x,y){
    return x>=R.x0+r-1e-9&&x<=R.x1-r+1e-9&&y>=R.y0+r-1e-9&&y<=R.y1-r+1e-9;
  };
  const moves=[];
  const zs=faoLevels(+zTop,zb,isFinite(+o.ap)?+o.ap:5);
  zs.forEach(function(z,li){
    // Contours concentriques depuis la paroi (r) vers le centre.
    const insets=[]; let k=r;
    const cx=(R.x0+R.x1)/2, cy=(R.y0+R.y1)/2;
    while(k<=Math.min(R.x1-R.x0,R.y1-R.y0)/2+1e-9){ insets.push(k); k+=ae; }
    if(!insets.length)insets.push(Math.min(R.x1-R.x0,R.y1-R.y0)/2);
    insets.forEach(function(ins,idx){
      const ax=R.x0+ins, bx=R.x1-ins, ay=R.y0+ins, by=R.y1-ins;
      if(bx-ax<0.02||by-ay<0.02){ // fond étroit : une passe centrale
        moves.push({r:1,x:cx,y:cy,z:secu});
        moves.push({r:1,x:cx,y:cy,z:z});
        return;
      }
      // 2026-10-08-004 : ENTRÉE CIRCULAIRE — un arc tangent attaque l'anneau
      // depuis l'anneau précédent, G1 à Z de coupe (aucune remontée) quand la
      // bande est déjà ouverte ; premier anneau d'un niveau = aucune ancre ->
      // repli 006 : hélice de descente à l'angle (jamais de plongée à plat).
      let side=null;
      if(entryMode==='circ')side=faoCircEval(ax,ay,1,0,rhoCirc,pocketOK,moves,z,D,true,airPk);
      if(!side&&entryMode==='circ'){
        // 008 : 1re ATTAQUE du niveau — l'ancre échoue (rien n'est coupé à z).
        // On garde le MÊME arc tangent et on descend sur place en HÉLICE
        // (orbite tenue par l'écart analytic à la paroi) : entrée circulaire
        // à chaque niveau, jamais de plongée à plat sur du brut.
        for(let ri=0;ri<rhoCirc.length&&!side;ri++){
          const sides=faoSidesCirc(ax,ay,1,0,rhoCirc[ri]);
          if(!sides)continue;
          for(let i=0;i<sides.length;i++){
            const s2=sides[i];
            if(!pocketOK(s2.sx,s2.sy))continue;
            const pts2=faoCircArcPts(s2,ax,ay);
            if(!pts2)continue;
            let okA=true;
            for(let k=0;k<pts2.length;k++)if(!pocketOK(pts2[k][0],pts2[k][1])){okA=false;break;}
            if(!okA)continue;
            const cl=Math.min(s2.sx-R.x0,R.x1-s2.sx,s2.sy-R.y0,R.y1-s2.sy)-r;
            const hrH=Math.min(D*0.4,cl);
            if(!(hrH>=0.5))continue;
            const hFrom=(li>0)?zs[li-1]:+zTop;
            const hS=(hFrom>z+1e-9)?hFrom:secu;
            const last=moves.length?moves[moves.length-1]:null;
            if(!last||Math.abs(last.x-s2.sx)>1e-9||Math.abs(last.y-s2.sy)>1e-9||Math.abs(last.z-secu)>1e-9){
              if(last)moves.push({r:1,x:last.x,y:last.y,z:secu});
              moves.push({r:1,x:s2.sx,y:s2.sy,z:secu});
            }
            moves.push({r:0,ent:1,x:s2.sx,y:s2.sy,z:hS});
            faoHelixEntry(s2.sx,s2.sy,hS,z,hrH,D).slice(1).forEach(function(m){moves.push(m);});
            moves.push({r:0,x:s2.sx,y:s2.sy,z:z});
            moves.push({r:0,ent:1,x:ax,y:ay,z:z,
              arc:{i:s2.cx-s2.sx,j:s2.cy-s2.sy,cw:s2.cw}});
            s2.h008=true; side=s2;
            break;
          }
        }
      }
      if(side&&side.h008){
        // 008 : hélice + arc déjà émis ci-dessus.
      }else if(side){
        const prev=moves[moves.length-1];
        if(prev&&!prev.r&&Math.abs(prev.z-z)<1e-9){
          moves.push({r:0,ent:1,x:side.sx,y:side.sy,z:z});
        }else{
          if(prev)moves.push({r:1,x:prev.x,y:prev.y,z:secu});
          moves.push({r:1,x:side.sx,y:side.sy,z:secu});
          moves.push({r:0,ent:1,x:side.sx,y:side.sy,z:z});
        }
        moves.push({r:0,ent:1,x:ax,y:ay,z:z,
          arc:{i:side.cx-side.sx,j:side.cy-side.sy,cw:side.cw}});
      }else{
        // 2026-10-08-006 : 1re phase du niveau — JAMAIS de plongée à plat
        // dans la matière pleine (fraise à cheval, Ø25 en tête) et jamais
        // d'orbite (déborderait le coin légal -> surcoupe du mur) : RAMPE le
        // long du 1er côté de l'anneau — la fraise descend EN SE DEPLACANT,
        // centre exactement sur l'anneau (aucune surcoupe). hFrom = face
        // déjà usinée du niveau précédent (sinon zTop).
        const hFrom=(li>0)?zs[li-1]:+zTop;
        const z0=(hFrom>z+1e-9)?hFrom:secu;
        const last=moves.length?moves[moves.length-1]:null;
        if(!last||Math.abs(last.x-ax)>1e-9||Math.abs(last.y-ay)>1e-9||Math.abs(last.z-secu)>1e-9){
          if(last)moves.push({r:1,x:last.x,y:last.y,z:secu});
          moves.push({r:1,x:ax,y:ay,z:secu});
        }
        // 2 côtés depuis le coin : le plus long porte la rampe (paliers <= 2 mm).
        let rx=bx-ax,ry=0;
        if(Math.abs(rx)<2&&Math.abs(by-ay)>=2){ rx=0; ry=by-ay; }
        const L=Math.hypot(rx,ry);
        if(z0>z+1e-9)moves.push({r:0,ent:1,x:ax,y:ay,z:z0}); // air jusqu'a la face
        if(L>=2&&z0>z+1e-9){
          const nR=Math.max(2,Math.ceil((z0-z)/2));
          for(let s=1;s<=nR;s++){
            const f=s/nR;
            moves.push({r:0,ent:1,x:ax+rx*f,y:ay+ry*f,z:z0+(z-z0)*f});
          }
        }else{
          moves.push({r:0,ent:1,x:ax,y:ay,z:z0});
          moves.push({r:0,x:ax,y:ay,z:z});
        }
        // 2026-10-12-001 : la RAMPE ne descend le 1er côté qu'en progressant
        // (z0 -> z) — le fond sous la rampe restait +z0->z au-dessus de la
        // cote finale (bande de matiere le long du MUR D'ENTREE, visible en
        // parois/fond à 0 comme un gap pièce/usiné, jusqu'à ~ ap de haut).
        // Re-point à (ax,ay) À PLAT à z : le rectangle partagé qui suit
        // referme alors le 1er côté à la cote exacte (meme chose que les
        // entrees circulaires, qui arrivent à (ax,ay)).
        if(L>=2&&z0>z+1e-9)moves.push({r:0,x:ax,y:ay,z:z});
      }
      moves.push({r:0,x:bx,y:ay,z:z});
      moves.push({r:0,x:bx,y:by,z:z});
      moves.push({r:0,x:ax,y:by,z:z});
      moves.push({r:0,x:ax,y:ay,z:z});
    });
  });
  const last=moves.length?moves[moves.length-1]:{x:rect.x0,y:rect.y0};
  moves.push({r:1,x:last.x,y:last.y,z:secu});
  return moves;
}

/* ----- contour extérieur (finition : périmètre compensé du rayon outil) ----- */
function faoGenContour(rect,zTop,zBot,o){
  o=o||{};
  const D=isFinite(+o.toolD)&&+o.toolD>0?+o.toolD:10;
  const r=D/2;
  const RA=faoRA(o);
  const secu=isFinite(+o.secu)?+o.secu:+zTop+5;
  const ax=rect.x0-r-RA.radial, bx=rect.x1+r+RA.radial, ay=rect.y0-r-RA.radial, by=rect.y1+r+RA.radial;
  const moves=[];
  const zs=faoLevels(+zTop,+zBot+RA.axial,isFinite(+o.ap)?+o.ap:5);
  // Approche tangentielle : entrée à 45° depuis l'extérieur.
  const ex=ax-(r+3), ey=ay-(r+3);
  // 2026-10-08-004 : ENTRÉE CIRCULAIRE — contour EXTERNE : le centre d'outil
  // reste dehors à ≥ r de la pièce (ancre inutile, tout se passe en air) ;
  // rapide sur place, descente en Z à S, arc tangent sur le début de passe.
  // 2026-10-08-007 : l'extérieur d'un bossage n'est PAS de l'air — c'est du
  // brut (à moins qu'une ébauche ne l'ait déjà enlevé, que le contour ne
  // voit pas). La « descente à S » devient une RAMPE le long de l'arc tangent
  // (interpolation hélicoïdale répartie en paliers ≤ 2 mm) : la fraise
  // découpe le brut en progressant, jamais à plat dessus. Le repli historique
  // (sans cercle) ramp le long du 1er côté du rectangle, comme la poche 006.
  const entryMode=o.entry||'auto';
  const rhoCirc=faoCircRhos(D,0,o.entryR);
  const outsideOK=function(x,y){
    const dx=Math.max(rect.x0-x,0,x-rect.x1);
    const dy=Math.max(rect.y0-y,0,y-rect.y1);
    return Math.hypot(dx,dy)>=r-1e-9;
  };
  const sideC=(entryMode==='circ')?faoCircEval(ax,ay,1,0,rhoCirc,outsideOK,moves,zTop,D,false):null;
  zs.forEach(function(z,li){
    if(sideC){
      moves.push({r:1,x:sideC.sx,y:sideC.sy,z:secu});
      // 007 : arc tangent RAMPE — descente répartie le long de l'arc (chaque
      // sous-arc garde son centre IJK ; G2/G3 hélicoïdal = légal).
      const Rr=Math.hypot(sideC.sx-sideC.cx,sideC.sy-sideC.cy);
      let a0=Math.atan2(sideC.sy-sideC.cy,sideC.sx-sideC.cx);
      let a1=Math.atan2(ay-sideC.cy,ax-sideC.cx);
      let da=a1-a0;
      if(sideC.cw){if(da>0)da-=2*Math.PI;}else if(da<0)da+=2*Math.PI;
      const nR=Math.max(2,Math.ceil((zTop-z)/2));
      let ppx=sideC.sx,ppy=sideC.sy;
      for(let s=1;s<=nR;s++){
        const f=s/nR,a=a0+da*f;
        const xx=sideC.cx+Rr*Math.cos(a),yy=sideC.cy+Rr*Math.sin(a);
        moves.push({r:0,ent:1,x:xx,y:yy,
          z:Math.round((zTop+(z-zTop)*f)*1000)/1000,
          arc:{i:sideC.cx-ppx,j:sideC.cy-ppy,cw:sideC.cw}});
        ppx=xx;ppy=yy;
      }
    }else{
      // 007 : repli = RAMPE le long du 1er côté (descente en coupant le brut,
      // paliers ≤ 2 mm) — jamais de plongée/rapide à plat dans le brut.
      const z0=(li>0)?zs[li-1]:+zTop;
      moves.push({r:1,x:ex,y:ey,z:secu});
      moves.push({r:1,x:ax,y:ay,z:secu});
      if(z0>z+1e-9)moves.push({r:0,ent:1,x:ax,y:ay,z:z0});
      const nR=Math.max(2,Math.ceil((z0-z)/2));
      for(let s=1;s<=nR;s++){
        const f=s/nR;
        moves.push({r:0,ent:1,x:ax+(bx-ax)*f,y:ay,
          z:Math.round((z0+(z-z0)*f)*1000)/1000});
      }
      // 2026-10-12-001 : la RAMPE ne couvre le 1er côté qu'en descendant
      // (z0 -> z) — bande de matière le long du côté d'entrée (gap visible
      // en parois/fond à 0, cf. poche). Re-point à (ax,ay) À PLAT à z : le
      // rectangle partagé qui suit referme le 1er côté à la cote exacte.
      if(z0>z+1e-9)moves.push({r:0,x:ax,y:ay,z:z});
    }
    moves.push({r:0,x:bx,y:ay,z:z});
    moves.push({r:0,x:bx,y:by,z:z});
    moves.push({r:0,x:ax,y:by,z:z});
    moves.push({r:0,x:ax,y:ay,z:z});
  });
  moves.push({r:1,x:ax,y:ay,z:secu});
  return moves;
}

/* ----- perçage (déroulé G0/G1 en MVP ; CYCLE81/G81 en phase 2) ----- */
function faoGenDrill(pts,zTop,zBot,secu){
  const s=isFinite(+secu)?+secu:+zTop+5;
  const moves=[];
  (pts||[]).forEach(function(p){
    moves.push({r:1,x:+p[0],y:+p[1],z:s});
    moves.push({r:1,x:+p[0],y:+p[1],z:+zTop});
    moves.push({r:0,x:+p[0],y:+p[1],z:+zBot});
    moves.push({r:1,x:+p[0],y:+p[1],z:s});
  });
  return moves;
}

/* ----- limite d'usinage rectangulaire + règle outil ----- */
// op.limit = null (tout usiner) ou {mode:'rect',x0,y0,x1,y1,
//   side:'center'|'in'|'out', extra}. Règle outil (comme Fusion) :
//   'in' = outil contenu dans la limite (zone rétractée de r),
//   'out' = la limite est entièrement couverte (zone dilatée de r),
//   'center' = le centre reste dans la limite. `extra` = décalage supp. (mm).
function faoEffLimit(op,toolD){
  const L=op&&op.limit;
  if(!L||L.mode!=='rect')return null;
  const r=(isFinite(+toolD)&&+toolD>0?+toolD:10)/2;
  const ex=isFinite(+L.extra)?+L.extra:0;
  const k=(L.side==='out'?r:L.side==='in'?-r:0)+ex;
  const R={x0:+L.x0-k, y0:+L.y0-k, x1:+L.x1+k, y1:+L.y1+k};
  if(!(R.x1>R.x0&&R.y1>R.y0))return null;
  return R;
}
// 2026-10-08-003 : zone INTERIEURE (îlot à préserver) — le COMPLÉMENT de ce
// rectangle dilaté de r+extra est la zone usinable (règle outil fixée « hors
// de l'îlot », la marge ajoute de la distance). Dégénéré (extra très négatif)
// : planter sur 0,01 mm plutôt que d'ignorer l'îlot en silence (on ne usine
// JAMAIS l'îlot par défaut).
function faoLimit2R(lim2,toolD){
  if(!lim2||lim2.mode!=='rect')return null;
  const r=(isFinite(+toolD)&&+toolD>0?+toolD:10)/2;
  const ex=isFinite(+lim2.extra)?+lim2.extra:0;
  const k=Math.max(0.01,r+ex);
  const R={x0:+lim2.x0-k, y0:+lim2.y0-k, x1:+lim2.x1+k, y1:+lim2.y1+k};
  if(!(R.x1>R.x0&&R.y1>R.y0))return null;
  return R;
}
function faoLimitDrillPts(op,toolD){
  const pts=(op&&op.pts)||[];
  const lim=op&&op.limit;
  if(lim&&(lim.mode==='chain'||lim.mode==='sketch')&&lim.loop&&lim.loop.length>=3)
    return pts.filter(function(p){ return faoLimInside(+p[0],+p[1],lim,0); });
  const R=faoEffLimit(op,toolD);
  let out=R?pts.filter(function(p){ return +p[0]>=R.x0&&+p[0]<=R.x1&&+p[1]>=R.y0&&+p[1]<=R.y1; }):pts;
  // 2026-10-08-003 : l'îlot intérieur exclut aussi les perçages — avec le
  // RAYON de l'outil (le centre seul ne suffit pas : la fraise mordrait l'îlot).
  const L2=op&&op.limit2;
  if(L2&&L2.mode==='rect'){
    const R2=faoLimit2R(L2,toolD);
    if(R2)out=out.filter(function(p){
      return !(+p[0]>=R2.x0&&+p[0]<=R2.x1&&+p[1]>=R2.y0&&+p[1]<=R2.y1); });
  }else if(L2&&(L2.mode==='chain'||L2.mode==='sketch')&&L2.loop&&L2.loop.length>=3){
    const r=(isFinite(+toolD)&&+toolD>0?+toolD:10)/2;
    out=out.filter(function(p){ return !faoLimInside(+p[0],+p[1],L2,r); });
  }
  return out;
}
function faoClipLB(p0,p1,R){
  // Liang-Barsky : fraction [t0,t1] du segment dans R, ou null.
  let t0=0, t1=1;
  const dx=p1.x-p0.x, dy=p1.y-p0.y, e=1e-12;
  const P=[-dx,dx,-dy,dy], Q=[p0.x-R.x0,R.x1-p0.x,p0.y-R.y0,R.y1-p0.y];
  for(let k=0;k<4;k++){
    if(Math.abs(P[k])<e){ if(Q[k]<0)return null; }
    else{ const t=Q[k]/P[k];
      if(P[k]<0){ if(t>t0)t0=t; } else if(t<t1)t1=t; }
  }
  return t0<=t1?[t0,t1]:null;
}
function faoClipMovesXY(moves,R,secuZ,invert){
  // Ne garde que la coupe dans R (invert = DEHORS, 2026-10-08-003 : complément
  // de la zone intérieure/îlot — 0, 1 ou 2 morceaux par segment). Ré-entrée
  // sécurisée : remontée sécu, rapide XY, plongée — jamais de G0 dans la matière.
  // 10-09-004 : un move reconstruit garde l'étiquette d'entrée (ent) de SA
  // destination — sans elle, hélices/rampes perdent le tracé bleu au clip
  // (les arcs, poussés tels quels, restaient bleus : incohérence perçue).
  const out=[]; let px=null, py=null, pz=null, inside=false;
  const push0=function(x,y,z,m){ const o={r:0,x:x,y:y,z:z}; if(m&&m.ent)o.ent=1; out.push(o); };
  const inR=function(x,y){ return x>=R.x0&&x<=R.x1&&y>=R.y0&&y<=R.y1; };
  const keep=function(x,y){ return invert?!inR(x,y):inR(x,y); };
  moves.forEach(function(m){
    if(m.r){ out.push(m); px=m.x; py=m.y; pz=m.z; inside=keep(m.x,m.y); return; }
    if(m.arc){ out.push(m); px=m.x; py=m.y; pz=m.z; inside=keep(m.x,m.y); return; }
    if(px===null){ px=m.x; py=m.y; pz=m.z; inside=keep(m.x,m.y); }
    const seg=faoClipLB({x:px,y:py},{x:m.x,y:m.y},R);
    if(!invert){
      if(!seg){ inside=false; }
      else{
        const ax=px+(m.x-px)*seg[0], ay=py+(m.y-py)*seg[0], az=pz+(m.z-pz)*seg[0];
        const bx=px+(m.x-px)*seg[1], by=py+(m.y-py)*seg[1], bz=pz+(m.z-pz)*seg[1];
        if(!inside||Math.hypot(ax-px,ay-py)>1e-6){
          out.push({r:1,x:px,y:py,z:secuZ});
          out.push({r:1,x:ax,y:ay,z:secuZ});
          out.push({r:1,x:ax,y:ay,z:az});
        }
        push0(bx,by,bz,m);
        inside=true;
      }
      px=m.x; py=m.y; pz=m.z;
      return;
    }
    // invert : morceaux [0,t0] et [t1,1] (segment hors R = tout garder).
    const pieces=[];
    if(!seg)pieces.push([0,1]);
    else{
      if(seg[0]>1e-9)pieces.push([0,seg[0]]);
      if(seg[1]<1-1e-9)pieces.push([seg[1],1]);
    }
    if(!pieces.length){ inside=false; px=m.x; py=m.y; pz=m.z; return; }
    pieces.forEach(function(pc){
      const ax=px+(m.x-px)*pc[0], ay=py+(m.y-py)*pc[0], az=pz+(m.z-pz)*pc[0];
      const bx=px+(m.x-px)*pc[1], by=py+(m.y-py)*pc[1], bz=pz+(m.z-pz)*pc[1];
      if(!inside||Math.hypot(ax-px,ay-py)>1e-6){
        out.push({r:1,x:px,y:py,z:secuZ});
        out.push({r:1,x:ax,y:ay,z:secuZ});
        out.push({r:1,x:ax,y:ay,z:az});
      }
      push0(bx,by,bz,m);
      inside=true;
    });
    px=m.x; py=m.y; pz=m.z;
  });
  return out;
}

/* ----- limite par chaîne d'arêtes : boucle XY + clip polygone ----- */
// La chaîne est SNAPSHOTÉE à la sélection (pts 3D -> boucle XY) + les ancres des
// germes (milieu 3D + longueur) sont conservées : à chaque fin de rejeu,
// faoChainReplay re-suit la boucle sur les arêtes du nouveau solide (rejeu auto) ;
// si les arêtes ont trop bougé, la boucle figée reste et l'op passe en « stale ».
// op.limit = {mode:'chain', loop:[[x,y]...], closed, nEdges, tangent, side, extra,
//             anchors:[{m:[x,y,z],len}...], stale}.
function faoTangentSet(edges,seeds){
  // BFS tangentiel (même règle que les congés : |dot| > 0.985 aux sommets).
  const norm=function(v){ return (Math.abs(v)<0.0005?0:v).toFixed(3); };
  const vmap=new Map(), keys=[];
  edges.forEach(function(e,i){
    const p=e.pts||[];
    if(p.length<2)return;
    const k0=p[0].map(norm).join(','), k1=p[p.length-1].map(norm).join(',');
    keys[i]=[k0,k1];
    if(!vmap.has(k0))vmap.set(k0,[]);
    if(!vmap.has(k1))vmap.set(k1,[]);
    vmap.get(k0).push(i); vmap.get(k1).push(i);
  });
  const getTan=function(ei,atEnd){
    const p=(edges[ei]&&edges[ei].pts)||[];
    if(p.length<2)return null;
    const a=atEnd?p[p.length-2]:p[0], b=atEnd?p[p.length-1]:p[1];
    return [b[0]-a[0],b[1]-a[1],b[2]-a[2]];
  };
  const tang=function(a,b,sk){
    try{
      const ka=keys[a], kb=keys[b];
      if(!ka||!kb)return false;
      const ta=getTan(a,ka[0]!==sk), tb=getTan(b,kb[0]!==sk);
      if(!ta||!tb)return false;
      const la=Math.hypot(ta[0],ta[1],ta[2]), lb=Math.hypot(tb[0],tb[1],tb[2]);
      if(la<1e-9||lb<1e-9)return false;
      return Math.abs((ta[0]*tb[0]+ta[1]*tb[1]+ta[2]*tb[2])/(la*lb))>0.985;
    }catch(e){ return false; }
  };
  const seen=new Set(), queue=(seeds||[]).filter(function(i){return i>=0&&i<edges.length;});
  queue.forEach(function(i){seen.add(i);});
  while(queue.length){
    const cur=queue.shift();
    (keys[cur]||[]).forEach(function(k){
      (vmap.get(k)||[]).forEach(function(nb){
        if(seen.has(nb))return;
        if(tang(cur,nb,k)){ seen.add(nb); queue.push(nb); }
      });
    });
  }
  return Array.from(seen);
}
function faoOrderEdges(edges,idx){
  // Ordonne des indices d'arêtes en chemin(s) par extrémités proches (3D).
  // Chaque maillon est {i,rev} : une arête est INVERSÉE quand c'est son ARRIVÉE
  // qui touche la pointe de la chaîne. Sans cette inversion la boucle XY perd le
  // côté correspondant et gagne une corde parasite (clip de chaîne trop étroit →
  // une bande entière de matière n'est jamais atteinte).
  const tol=1e-4, chains=[], used=new Set();
  const ends=function(i){
    const p=edges[i].pts;
    return [p[0],p[p.length-1]];
  };
  const near=function(a,b){
    const dx=a[0]-b[0], dy=a[1]-b[1], dz=a[2]-b[2];
    return dx*dx+dy*dy+dz*dz<tol*tol;
  };
  (idx||[]).forEach(function(s){
    if(used.has(s)||!edges[s]||!edges[s].pts||edges[s].pts.length<2)return;
    used.add(s);
    let chain=[{i:s,rev:false}], grew=true, guard=0;
    while(grew&&guard++<10000){
      grew=false;
      const first=chain[0], last=chain[chain.length-1];
      const ef=ends(first.i), el=ends(last.i);
      const head=first.rev?ef[1]:ef[0]; // départ du chemin
      const tail=last.rev?el[0]:el[1];  // arrivée du chemin
      for(let k=0;k<idx.length;k++){
        const j=idx[k];
        if(used.has(j)||!edges[j]||!edges[j].pts||edges[j].pts.length<2)continue;
        const e=ends(j);
        if(near(tail,e[0])){chain.push({i:j,rev:false});used.add(j);grew=true;break;}
        if(near(tail,e[1])){chain.push({i:j,rev:true});used.add(j);grew=true;break;}
        if(near(head,e[1])){chain.unshift({i:j,rev:false});used.add(j);grew=true;break;}
        if(near(head,e[0])){chain.unshift({i:j,rev:true});used.add(j);grew=true;break;}
      }
    }
    chains.push(chain);
  });
  return chains;
}
function faoLoopFromChains(edges,chains){
  // Chaînes 3D -> boucle XY (projection, dédupliquée, refermée d'office).
  // Maillon {i,rev} : arête parcourue à l'envers si rev. Le 1er point de chaque
  // arête est conservé : la déduplication juste en dessous enlève les doublons.
  let pts=[];
  (chains||[]).forEach(function(ch){
    ch.forEach(function(link){
      const i=(link&&typeof link==='object')?link.i:link;
      const rev=!!(link&&typeof link==='object'&&link.rev);
      const p=(edges[i]&&edges[i].pts)||[];
      for(let k=0;k<p.length;k++){
        const q=p[rev?(p.length-1-k):k];
        pts.push([q[0],q[1]]);
      }
    });
  });
  pts=pts.filter(function(q,i){
    if(!i)return true;
    const a=pts[i-1];
    return Math.hypot(q[0]-a[0],q[1]-a[1])>1e-4;
  });
  if(pts.length<3)return {loop:[],closed:false};
  const closed=Math.hypot(pts[0][0]-pts[pts.length-1][0],pts[0][1]-pts[pts.length-1][1])<0.5;
  if(!closed)pts.push([pts[0][0],pts[0][1]]); // chaîne ouverte : refermée d'office
  return {loop:pts.map(function(q){return [Math.round(q[0]*1000)/1000,Math.round(q[1]*1000)/1000];}),closed:closed};
}
function faoLoopArea(loop){
  let a=0;
  for(let i=0;i+1<loop.length;i++)a+=loop[i][0]*loop[i+1][1]-loop[i+1][0]*loop[i][1];
  return Math.abs(a/2);
}
function faoLoopDistTo(loop,xy){
  // Distance XY d'un point à la polyligne de boucle (garde-fou d'intégrité).
  if(!loop||loop.length<2||!xy)return Infinity;
  let best=Infinity;
  for(let i=0;i+1<loop.length;i++){
    const a=loop[i], b=loop[i+1];
    const dx=b[0]-a[0], dy=b[1]-a[1], l2=dx*dx+dy*dy;
    let t=l2>1e-12?((xy[0]-a[0])*dx+(xy[1]-a[1])*dy)/l2:0;
    t=t<0?0:(t>1?1:t);
    const qx=a[0]+dx*t-xy[0], qy=a[1]+dy*t-xy[1];
    const d=qx*qx+qy*qy;
    if(d<best)best=d;
  }
  return Math.sqrt(best);
}

/* ----- rejeu auto : la limite « chaîne » suit le modèle ----- */
// Chaque validation mémorise milieu 3D + longueur de chaque GERME (ancres figées).
// À chaque fin de rejeu (buildDone → faoChainReplay), si chaque ancre retrouve « son »
// arête sur le nouveau solide (tolérance XY, Z libre pour un changement de profondeur,
// dérive de longueur ≤ 50 %), la boucle est RECONSTRUITE automatiquement (tangentes
// re-déduites depuis les germes). Sinon la boucle figée est conservée et l'op passe en
// « stale » : alerte dans la fiche + ATTENTION à l'export (repli = l'ancien
// « modèle modifié -> re-sélectionner », mais signalé au lieu d'être silencieux).
const FAO_CHAIN_TOL=10; // mm — distance XY max acceptée entre une ancre et son arête
function faoEdgeAnchor(e){
  // {m:[x,y,z], len} d'une arête : milieu OCCT si présent, sinon milieu du polyline.
  if(!e)return null;
  const p=e.pts||[];
  const m=(e.mid&&isFinite(e.mid[0]))?e.mid:(p.length>=2?p[Math.floor((p.length-1)/2)]:null);
  if(!m||!isFinite(m[0]))return null;
  return {m:[m[0],m[1],isFinite(+m[2])?+m[2]:0],len:isFinite(+e.len)?+e.len:0};
}
function faoChainLoopCap(res){
  // Cap 2000 pts (clip en O(n)) : les très longues chaînes sont sous-échantillonnées.
  if(!res||!res.loop||res.loop.length<=2000)return res;
  const stride=Math.ceil(res.loop.length/2000), thin=[];
  for(let i=0;i<res.loop.length;i+=stride)thin.push(res.loop[i]);
  if(thin[thin.length-1]!==res.loop[res.loop.length-1])thin.push(res.loop[res.loop.length-1]);
  return {loop:thin,closed:res.closed};
}
function faoChainRematch(op,edges,field){
  // Reconstruit la boucle si les ances des germes retrouvent leurs arêtes.
  // Retour {changed, stale, matched, nSel, skipped?} — état dérivé : JAMAIS de
  // snapshot (comme les projections associatives), l'annulation reste au rejeu modèle.
  // 2026-10-08-003 : field ('limit' par défaut, ou 'limit2') — la zone
  // intérieure se re-branche avec exactement les mêmes règes d'ancres.
  const L=op&&op[field||'limit'];
  if(!L||L.mode!=='chain')return {changed:false,skipped:true};
  if(!(L.anchors&&L.anchors.length))return {changed:false,skipped:true}; // ancien document
  if(!edges||!edges.length)return {changed:false,skipped:true};
  const fail=function(nSel){
    const ch=!L.stale;
    L.stale=true;
    return {changed:!!ch,stale:true,matched:0,nSel:nSel||0};
  };
  // 1) appariement injectif ancre -> arête (meilleur score, tous les germes requis)
  const used=new Set(), seeds=[];
  for(let a=0;a<L.anchors.length;a++){
    const A=L.anchors[a];
    if(!A||!A.m||!isFinite(A.m[0]))return fail();
    let best=-1,bestD=Infinity,bestS=Infinity;
    for(let i=0;i<edges.length;i++){
      if(used.has(i))continue;
      const e=edges[i];
      if(!e||!e.pts||e.pts.length<2)continue;
      const m=(e.mid&&isFinite(e.mid[0]))?e.mid:null;
      if(!m)continue;
      const dxy=Math.hypot(m[0]-A.m[0],m[1]-A.m[1]);
      if(dxy>FAO_CHAIN_TOL)continue; // tolérance sèche sur XY (le Z n'est pas borné)
      const dz=Math.abs((isFinite(+m[2])?+m[2]:0)-(isFinite(+A.m[2])?+A.m[2]:0));
      const len=+e.len||0;
      const dl=A.len>1?Math.abs(len-A.len)/A.len:0;
      if(dl>0.5)continue; // même position mais taille fondu : plus la même arête
      const s=dxy+0.1*dz+5*dl;
      if(s<bestS){bestS=s;best=i;bestD=dxy;}
    }
    if(best<0||bestD>FAO_CHAIN_TOL)return fail();
    used.add(best); seeds.push(best);
  }
  // 2) re-déduction des tangentes depuis les germes appariés (même règle qu'à la saisie)
  let sel=seeds.slice();
  if(L.tangent){
    const all=[];
    seeds.forEach(function(s){
      faoTangentSet(edges,[s]).forEach(function(j){ if(all.indexOf(j)<0)all.push(j); });
    });
    sel=all;
  }
  // 3) reconstruction de la boucle XY (ordre, clip de longueur, validation)
  let res=faoLoopFromChains(edges,faoOrderEdges(edges,sel));
  if(!res.loop.length||res.loop.length<3||faoLoopArea(res.loop)<1e-6)return fail(sel.length);
  // Intégrité : chaque arête retenue doit avoir ses points SUR la boucle. Une
  // arête mal orientée à l'assemblage est partiellement sautée → son milieu
  // s'éloigne et la boucle gagne une corde parasite : le clip exclurait alors une
  // bande entière de matière. Stale (⚠ + export) plutôt qu'un usinage incomplet.
  for(let k=0;k<sel.length;k++){
    const e=edges[sel[k]];
    if(!e||!e.pts||e.pts.length<2)continue;
    const p=e.pts;
    let mx=(e.mid&&isFinite(e.mid[0]))?e.mid[0]:(p[0][0]+p[p.length-1][0])/2;
    let my=(e.mid&&isFinite(e.mid[1]))?e.mid[1]:(p[0][1]+p[p.length-1][1])/2;
    if(faoLoopDistTo(res.loop,[mx,my])>3)return fail(sel.length);
  }
  res=faoChainLoopCap(res);
  const wasStale=!!L.stale;
  const loopChanged=JSON.stringify(L.loop||[])!==JSON.stringify(res.loop);
  L.loop=res.loop; L.closed=res.closed; L.nEdges=sel.length; L.stale=false;
  return {changed:loopChanged||wasStale,stale:false,matched:seeds.length,nSel:sel.length};
}
function faoZlimFromEdges(edges,idxs){
  // Limite Z par arêtes : ancre par germe + Zmax/Zmin sur les arêtes retenues.
  // {ztop,zbot,anchors} ou null si sélection invalide (faut ztop > zbot).
  const anchors=[]; let ztop=-Infinity,zbot=Infinity;
  for(let k=0;k<(idxs||[]).length;k++){
    const e=edges&&edges[idxs[k]];
    if(!e||!e.pts||e.pts.length<2)continue;
    const A=faoEdgeAnchor(e); if(!A)return null;
    anchors.push(A);
    for(let i=0;i<e.pts.length;i++){
      const z=+e.pts[i][2];
      if(isFinite(z)){ if(z>ztop)ztop=z; if(z<zbot)zbot=z; }
    }
  }
  if(!anchors.length||!(ztop>zbot))return null;
  return {ztop:Math.round(ztop*1000)/1000,zbot:Math.round(zbot*1000)/1000,anchors:anchors};
}
function faoZlimRematch(op,edges){
  // Re-branche la limite Z (ancres figées des germes) à chaque fin de rejeu :
  // état dérivé comme les chaînes — Z recalculé sur les arêtes appariées (tol
  // 3D), stale si introuvable/hors tolérance : valeurs figées conservées +
  // alerte en fiche (re-sélectionner les arêtes).
  const L=op&&op.zlim;
  if(!L)return {changed:false,skipped:true};
  if(!(L.anchors&&L.anchors.length))return {changed:false,skipped:true}; // ancien document
  if(!edges||!edges.length)return {changed:false,skipped:true};
  const fail=function(){
    const ch=!L.stale;
    L.stale=true;
    return {changed:!!ch,stale:true,matched:0};
  };
  // 1) appariement injectif ancre -> arête (meilleur score, toutes exigées)
  const used=new Set(); const got=[];
  for(let a=0;a<L.anchors.length;a++){
    const A=L.anchors[a];
    if(!A||!A.m||!isFinite(A.m[0]))return fail();
    let best=-1,bestS=Infinity;
    for(let i=0;i<edges.length;i++){
      if(used.has(i))continue;
      const e=edges[i];
      if(!e||!e.pts||e.pts.length<2)continue;
      const m=(e.mid&&isFinite(e.mid[0]))?e.mid:null;
      if(!m)continue;
      const dz=Math.abs((isFinite(+m[2])?+m[2]:0)-(isFinite(+A.m[2])?+A.m[2]:0));
      const d3=Math.hypot(m[0]-A.m[0],m[1]-A.m[1],dz);
      if(d3>FAO_CHAIN_TOL)continue; // tolérance 3D (XY + Z)
      const len=+e.len||0;
      const dl=A.len>1?Math.abs(len-A.len)/A.len:0;
      if(dl>0.5)continue; // même position mais taille fondu : plus la même arête
      const s=d3+5*dl;
      if(s<bestS){bestS=s;best=i;}
    }
    if(best<0)return fail();
    used.add(best); got.push(edges[best]);
  }
  // 2) Zmax/Zmin sur les arêtes appariées (source de vérité : le modèle)
  let ztop=-Infinity,zbot=Infinity;
  got.forEach(function(e){
    (e.pts||[]).forEach(function(p){
      const z=+p[2];
      if(isFinite(z)){ if(z>ztop)ztop=z; if(z<zbot)zbot=z; }
    });
  });
  if(!(ztop>zbot))return fail();
  ztop=Math.round(ztop*1000)/1000; zbot=Math.round(zbot*1000)/1000;
  const wasStale=!!L.stale;
  const changed=wasStale||ztop!==+op.ztop||zbot!==+op.zbot;
  L.nEdges=got.length; L.stale=false;
  op.ztop=ztop; op.zbot=zbot;
  return {changed:changed,stale:false,matched:got.length};
}
function faoZlimBreak(op){
  // Édition manuelle d'un champ Haut/Bas : casse le lien avec les arêtes
  // (valeurs conservées) — les champs repassent en saisie libre.
  if(op&&op.zlim)delete op.zlim;
}
function faoRematchAll(setups,edges){
  // Fin de rejeu : une seule passe re-branche chaînes XY (zones ext et
  // intérieure) ET limites Z.
  let n=0;
  ((setups)||[]).forEach(function(st){
    ((st&&st.ops)||[]).forEach(function(op){
      const r=faoChainRematch(op,edges);
      const r2=faoChainRematch(op,edges,'limit2');
      const rz=faoZlimRematch(op,edges);
      if((r&&r.changed)||(r2&&r2.changed)||(rz&&rz.changed))n++;
    });
  });
  return n;
}
function faoSketchLoop(skId){
  // 2026-10-13-001 : esquisse de ZONE -> boucle XY MONDE (contour extérieur
  // UNIQUE, normalisé CCW). Mêmes règles que la poche d'entrée (faoEntreePoly,
  // -005) : contours FORTS (skLoopTrace exclut construction/réf.), plan
  // horizontal, aucun îlot/trou/cercle (décor ambigu), dédoublonnage bbox+aire
  // (une traverse par sens dès qu'un arc est présent). Repli null : esquisse
  // absente, plan non horizontal, contours multiples, îlot ou trou, cercle,
  // boucle dégénérée — la zone n'est JAMAIS devinée.
  try{
    if(typeof doc==='undefined'||!doc||!Array.isArray(doc.sketches))return null;
    const sk=doc.sketches.find(function(s){return s.id===skId;});
    if(!sk)return null;
    const b=sketchBasis(sk);
    if(!b||Math.abs(b.n.z)<0.99)return null;   // la zone est un contour XY
    const tr=skLoopTrace(sk);
    if(!tr||!tr.loops||!tr.loops.length)return null;
    if((tr.circleHoles&&tr.circleHoles.length)||(tr.circlesOut&&tr.circlesOut.length))return null;
    const TAU=Math.PI*2;
    for(let i=0;i<tr.loops.length;i++){
      const L=tr.loops[i];
      if(L.kind==='island'||L.kind==='hole')return null; // îlot / anneau -> repli
    }
    // Candidats = contours extérieurs à aire positive.
    const cands=[];
    for(let i=0;i<tr.loops.length;i++){
      const L=tr.loops[i];
      if(L.kind==='outer'&&L.area>0)cands.push(L);
    }
    if(!cands.length)return null;
    const polys=[];
    for(let ci=0;ci<cands.length;ci++){
      const chain=cands[ci].chain, nodes=chainNodesOf(chain);
      const pts=[];
      let bad=false;
      for(let i=0;i<chain.length&&!bad;i++){
        const st=chain[i], ed=st.ed, toId=nodes[i+1];
        if(ed.kind==='line'){
          const q=tr.pts[toId];
          if(q)pts.push([q.x,q.y]);
        }else{
          const a=ed.e, C=tr.pts[a.pc], an=arcAngles(sk,a);
          if(!C||!an||!(a.r>1e-9)){bad=true;break;}
          // Arc : delta CCW strictement > 0 (arcAngles) — la traverse
          // INVERSE fait le retour COURT (-d), jamais le complément 2PI-d.
          const fwd=(ed.a===st.from);
          const d=an.a2-an.a1;
          const sweep=fwd?d:-d;
          const s0=fwd?an.a1:an.a2;
          const n2=Math.max(2,Math.ceil(Math.abs(sweep)/TAU*24));
          for(let k=1;k<=n2;k++){
            const t=s0+sweep*k/n2;
            pts.push([C.x+a.r*Math.cos(t),C.y+a.r*Math.sin(t)]);
          }
        }
      }
      if(bad||pts.length<3)continue;
      // dédup quasi-confondus + fermeture
      const u=[];
      for(let i=0;i<pts.length;i++){
        const p=pts[i], q=u[u.length-1];
        if(!q||Math.hypot(p[0]-q[0],p[1]-q[1])>1e-6)u.push(p);
      }
      while(u.length>1&&
        Math.hypot(u[0][0]-u[u.length-1][0],u[0][1]-u[u.length-1][1])<1e-6)u.pop();
      if(u.length<3)continue;
      // 2D esquisse -> monde (repère du dessin), XY seulement
      const w=[];
      let okW=true;
      for(let i=0;i<u.length;i++){
        const Q=occW(sk,u[i][0],u[i][1]);
        if(!isFinite(Q[0])||!isFinite(Q[1])){okW=false;break;}
        w.push([Q[0],Q[1]]);
      }
      if(!okW||w.length<3)continue;
      // aire signée : polygone normalisé CCW (le dédoublonnage compare les
      // aires absolues ; pip et scanline sont insensibles au sens)
      let s2=0;
      for(let i=0;i<w.length;i++){
        const p=w[i], q=w[(i+1)%w.length];
        s2+=p[0]*q[1]-q[0]*p[1];
      }
      if(s2<0){w.reverse();s2=-s2;}
      let ax0=1/0,ax1=-1/0,ay0=1/0,ay1=-1/0;
      for(let i=0;i<w.length;i++){
        if(w[i][0]<ax0)ax0=w[i][0]; if(w[i][0]>ax1)ax1=w[i][0];
        if(w[i][1]<ay0)ay0=w[i][1]; if(w[i][1]>ay1)ay1=w[i][1];
      }
      let dup=false;
      for(let i=0;i<polys.length&&!dup;i++){
        const G=polys[i];
        if(Math.abs(G.x0-ax0)<1e-6&&Math.abs(G.x1-ax1)<1e-6&&
           Math.abs(G.y0-ay0)<1e-6&&Math.abs(G.y1-ay1)<1e-6&&
           Math.abs(G.a-Math.abs(s2)/2)<1e-6)dup=true;
      }
      if(!dup)polys.push({w:w,x0:ax0,x1:ax1,y0:ay0,y1:ay1,a:Math.abs(s2)/2});
    }
    // Un SEUL contour unique — sinon repli : contours multiples / décor ambigu.
    if(polys.length!==1)return null;
    return polys[0].w;
  }catch(e){ return null; }
}
function faoLoopSame(a,b){
  // Boucles CCW normalisées : MÊME contour ? Comparaison en CYCLE (rotation
  // de départ admise) — skLoopTrace peut démarrer ailleurs après une édition
  // sans que le contour ait bougé ; comparer bêtement déclencherait
  // faoChanged à chaque rejeu = recalcul en boucle infinie.
  if(!a||!b||a.length!==b.length)return false;
  const n=a.length;
  if(!n)return true;
  for(let s=0;s<n;s++){
    let ok=true;
    for(let i=0;i<n&&ok;i++){
      const p=a[i], q=b[(i+s)%n];
      if(Math.abs(p[0]-q[0])>1e-6||Math.abs(p[1]-q[1])>1e-6)ok=false;
    }
    if(ok)return true;
  }
  return false;
}
function faoSketchReplay(){
  // Fin de rejeu (buildDone) : RE-EXTRAIT chaque limite « esquisse » du
  // document (état dérivé, comme faoChainReplay — mais sans OCCT : esquisse
  // + occW suffisent). Édition -> nouvelle boucle (le sig de l'op change ->
  // parcours régénérés) ; esquisse perdue ou devenue inutilisable -> stale +
  // alerte, boucle inchangée : l'ANCIEN contour reste la zone usinée (jamais
  // une zone qui s'ouvre en silence).
  let n=0;
  try{
    if(typeof faoChainMode!=='undefined'&&faoChainMode)return 0;
    const F=(doc&&doc.fao&&doc.fao.setups)||[];
    for(let i=0;i<F.length;i++){
      const ops=(F[i]&&F[i].ops)||[];
      for(let k=0;k<ops.length;k++){
        const o=ops[k]||{};
        // 2026-10-13-002 : rejeu des esquisses de zone ET d'îlot (limit + limit2).
        for(let li=0;li<2;li++){
          const L=li?o.limit2:o.limit;
          if(!L||L.mode!=='sketch'||typeof L.sk!=='string'||!L.sk)continue;
          const w=faoSketchLoop(L.sk);
          if(w&&w.length>=3){
            if(!faoLoopSame(L.loop,w)){ L.loop=w; L.closed=true; n++; }
            if(L.stale){ L.stale=false; n++; }
          }else if(!L.stale){ L.stale=true; n++; }
        }
      }
    }
  }catch(e){ return 0; }
  if(n){ try{ faoChanged(); }catch(e){} }
  return n;
}
function faoChainReplay(){
  // Fin de rejeu (buildDone) : re-suit toutes les limites chaîne du document sur les
  // arêtes du nouveau solide. Repli silencieux partout où l'on ne peut pas juger :
  // sélection en cours, OCCT absent, solide exact illisible, aucune ancre.
  try{
    if(typeof faoChainMode!=='undefined'&&faoChainMode)return 0;
    const F=(doc&&doc.fao&&doc.fao.setups)||[];
    let any=false;
    for(let i=0;i<F.length&&!any;i++){
      const ops=(F[i]&&F[i].ops)||[];
      for(let k=0;k<ops.length;k++){
        const o=ops[k]||{};
        const L=o.limit, L2=o.limit2, Z=o.zlim;
        if((L&&L.mode==='chain'&&L.anchors&&L.anchors.length)||
           (L2&&L2.mode==='chain'&&L2.anchors&&L2.anchors.length)||
           (Z&&Z.anchors&&Z.anchors.length)){any=true;break;}
      }
    }
    if(!any)return 0;
    if(typeof occHas==='function'&&!occHas())return 0;
    let edges=null;
    try{ edges=faoChainEdgesWorld(); }catch(e){ return 0; }
    if(!edges||!edges.length)return 0;
    const n=faoRematchAll(F,edges);
    if(n)faoChanged();
    return n;
  }catch(e){ return 0; }
}
function faoPointInPoly(x,y,loop){
  // Impair : dedans <=> nombre impair de croisements.
  let inside=false;
  for(let i=0,j=loop.length-1;i<loop.length;j=i++){
    const xi=loop[i][0], yi=loop[i][1], xj=loop[j][0], yj=loop[j][1];
    if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))inside=!inside;
  }
  return inside;
}
function faoDistToPoly(x,y,loop){
  // 2026-10-14-001 : distance² minimale puis UNE racine (Math.hypot par
  // segment coûtait ~30 µs/appel sur une chaîne de 133 points — appelé des
  // centaines de milliers de fois par la finition Crêtes constantes).
  let m=1/0;
  for(let i=0;i+1<loop.length;i++){
    const ax=loop[i][0], ay=loop[i][1], bx=loop[i+1][0], by=loop[i+1][1];
    const dx=bx-ax, dy=by-ay, l2=dx*dx+dy*dy;
    let t=l2>1e-12?((x-ax)*dx+(y-ay)*dy)/l2:0;
    t=t<0?0:(t>1?1:t);
    const ex=x-(ax+dx*t), ey=y-(ay+dy*t), d2=ex*ex+ey*ey;
    if(d2<m)m=d2;
  }
  return Math.sqrt(m);
}
function faoLimInside(x,y,lim,r){
  // Règle outil (comme Fusion) SANS offsetter le polygone : on teste le point
  // avec marge. side in : érodé de r ; out : dilaté de r ; center : tel quel.
  // extra (décalage supp.) dilate toujours la zone utile.
  const loop=lim&&lim.loop;
  if(!loop||loop.length<3)return true;
  const rr=isFinite(+r)&&+r>0?+r:0, ex=isFinite(+lim.extra)?+lim.extra:0;
  const in0=faoPointInPoly(x,y,loop), d=faoDistToPoly(x,y,loop);
  const side=lim.side||'center';
  if(side==='in')return in0&&(d+ex>=rr);
  if(side==='out')return in0||(d<=rr+ex);
  return in0||(d<=ex);
}
function faoClipMovesPoly(moves,lim,r,secuZ,sub,atFn){
  // Clip impair : on subdivise (pas `sub`, 2 mm défaut) et on ne garde que les
  // passages dedans, croisement affiné par dichotomie (0,1 mm). Ré-entrée
  // sécurisée comme en rect : remontée sécu, jamais de G0 dans la matière.
  // 2026-10-08-003 : atFn (optionnel) remplace la règle lim/r — utilisé pour
  // l'îlot intérieur (on garde le COMPLÉMENT : atFn = !faoLimInside).
  const step=isFinite(+sub)&&+sub>0?+sub:2;
  const out=[]; let px=null, py=null, pz=null, inside=false;
  // 10-09-004 : conservation de l'étiquette d'entrée (ent) sur les points
  // reconstruits — même règle que faoClipMovesXY (bleu préservé au clip).
  const push0=function(x,y,z,m){ const o={r:0,x:x,y:y,z:z}; if(m&&m.ent)o.ent=1; out.push(o); };
  const at=(typeof atFn==='function')?atFn:function(x,y){ return faoLimInside(x,y,lim,r); };
  const cross=function(ax,ay,bx,by,ain){
    // Dichotomie du point de croisement (sortie à 0,1 mm).
    let t0=0, t1=1;
    for(let k=0;k<30;k++){
      const tm=(t0+t1)/2;
      const insideMid=at(ax+(bx-ax)*tm,ay+(by-ay)*tm);
      if(insideMid===ain)t0=tm; else t1=tm;
      if(Math.hypot((bx-ax)*(t1-t0),(by-ay)*(t1-t0))<0.1)break;
    }
    const t=t0; // côté ain : sortie DEDANS, entrée DEHORS — jamais au-delà
    return [ax+(bx-ax)*t,ay+(by-ay)*t];
  };
  const zAt=function(ax,ay,az,bx,by,bz,cx,cy){
    // Z interpolé au point (cx,cy) sur le segment a->b.
    const dx=bx-ax, dy=by-ay, l2=dx*dx+dy*dy;
    const f=l2>1e-12?((cx-ax)*dx+(cy-ay)*dy)/l2:0;
    return az+(bz-az)*Math.max(0,Math.min(1,f));
  };
  const enter=function(x,y,z){
    out.push({r:1,x:px,y:py,z:secuZ});
    out.push({r:1,x:x,y:y,z:secuZ});
    out.push({r:1,x:x,y:y,z:z});
  };
  moves.forEach(function(m){
    if(m.r){ out.push(m); px=m.x; py=m.y; pz=m.z; inside=at(m.x,m.y); return; }
    if(m.arc){ out.push(m); px=m.x; py=m.y; pz=m.z; inside=at(m.x,m.y); return; }
    if(px===null){ px=m.x; py=m.y; pz=m.z; inside=at(m.x,m.y); }
    const len=Math.hypot(m.x-px,m.y-py);
    const n=Math.max(1,Math.ceil(len/step));
    let cx=px, cy=py, cz=pz, cin=inside;
    for(let i=1;i<=n;i++){
      const nx=px+(m.x-px)*i/n, ny=py+(m.y-py)*i/n, nz=pz+(m.z-pz)*i/n;
      const nin=at(nx,ny);
      if(nin&&!cin){
        const c=cross(cx,cy,nx,ny,false);
        const zc=zAt(cx,cy,cz,nx,ny,nz,c[0],c[1]);
        enter(c[0],c[1],zc);
        push0(nx,ny,nz,m);
      }else if(nin&&cin){
        push0(nx,ny,nz,m);
      }else if(!nin&&cin){
        const c=cross(cx,cy,nx,ny,true);
        push0(c[0],c[1],zAt(cx,cy,cz,nx,ny,nz,c[0],c[1]),m);
      }
      cx=nx; cy=ny; cz=nz; cin=nin;
    }
    px=m.x; py=m.y; pz=m.z; inside=cin;
  });
  return out;
}
