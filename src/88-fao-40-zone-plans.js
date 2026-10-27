/* ----- ZONE = mur vertical inviolable ---------------------------------------
   Règle d'atelier (affinée jusqu'à la capture) : la zone est un MUR. Rien ne
   s'y usine dehors, et les G0 ne font plus de TOUR « dans le vide » : on ne la
   franchit que pour l'ENGAGEMENT (retour d'outil en tête d'opération), la
   SORTIE, le CHANGEMENT D'OUTIL ou le POINT DE REPOS — les trois dernières
   raisons étant le fait de la séquence/post, jamais d'une opération isolée.
   Trois garde-fous, du plus tôt au plus tard :
   · `faoZoneStrip`   — les séries de G0 hors zone sont retirées à la
     GÉNÉRATION (dans faoZoneCuts) et à la LECTURE (faoOpMoves +
     faoOpMovesTry) : un tracé déjà en cache est purgé sans régénération ;
   · `faoZoneCuts`    — appelé en DERNIER dans faoOpMoves, après faoRoundMoves
     (les arrondis d'angle sont créés après le clip : leurs arcs peuvent
     dépasser la frontière — ils sont alors aplatis puis recoupés) ;
   · `faoSegClipper`  — filet de sécurité à l'AFFICHAGE, sur les seuls segments
     de coupe (un aperçu ne montre donc jamais de coupe hors zone, même avec
     un tracé en cache ancien). */
function faoZoneCtx(op,job){
  // -> {lim, lim2, D, chain, R?, R2?, at(x,y), cross(a,b)} pour l'opération,
  //    ou null (aucune zone exploitable : la règle ne s'applique pas à cette op).
  // 2026-10-08-003 : la zone INTERIEURE (îlot) se compose — on garde ce qui
  // est dedans (lim) ET hors de l'îlot (lim2). at/cross deviennent le ET / le
  // OU des deux frontières ; la coupe finale se refait en deux temps dans
  // faoZoneCuts (clip extérieur exact, puis clip îlot).
  const lim=op&&op.limit, lim2=op&&op.limit2;
  if(!lim&&!lim2)return null;
  if(op&&op.type==='chamfer')return null; // V0.7.9 : ses arêtes sont son profil, pas une zone
  const tool=faoToolById(job,op&&op.toolId);
  const D=(tool&&+tool.d>0)?+tool.d:10;
  // 2026-10-13-006 : rayon de garantie zone. Géofinish boule/torique : les
  // points chemin sont la POINTE (contact), qui PEUT atteindre la limite —
  // le corps de l'outil déborde au-delà mais c'est le comportement normal de
  // la finition 3D (l'arête est finie par le flanc de la boule). Sans ce
  // ajustement, un anneau de D/2 restait non fini le long de l'esquisse
  // (« plat usiné JUSQU'À la limite, bout de fraise = contour »).
  // Plat (ou op hors géofinish) : arête de l'outil = limite → centre = lim−D/2.
  const zr=(op&&op.type==='geofinish'&&tool&&tool.kind!=='flat')?0:D/2;
  let at=null, cross=null, R=null, chain=false, limOK=null;
  if(lim&&(lim.mode==='chain'||lim.mode==='sketch')&&lim.loop&&lim.loop.length>=3){
    limOK=lim; chain=true;
    const loop=lim.loop, r=zr;
    at=function(x,y){ return faoLimInside(x,y,lim,r); };
    cross=function(a,b){ return faoPolyCross(a.x,a.y,b.x,b.y,loop); };
  }else if(lim&&lim.mode==='rect'){
    const R0=faoEffLimit(op,(op&&op.type==='geofinish'&&tool&&tool.kind!=='flat')?0.001:D);
    if(R0){
      limOK=lim; R=R0;
      at=function(x,y){ return x>=R.x0&&x<=R.x1&&y>=R.y0&&y<=R.y1; };
      cross=function(a,b){
        const s=faoClipLB({x:a.x,y:a.y},{x:b.x,y:b.y},R);
        return !s||s[0]>1e-9||s[1]<1-1e-9; };
    }
  }
  // --- îlot intérieur : la zone usinable est le COMPLÉMENT de l'îlot dilaté.
  let R2=null, lim2OK=null;
  if(lim2&&lim2.mode==='rect'){
    R2=faoLimit2R(lim2,D);
    if(!R2)R2=null; else lim2OK=lim2;
  }else if(lim2&&(lim2.mode==='chain'||lim2.mode==='sketch')&&lim2.loop&&lim2.loop.length>=3){
    lim2OK=lim2;
  }
  if(!limOK&&!lim2OK)return null;
  if(lim2OK){
    // 2026-10-13-007 : l'ÎLOT garde la garantie D/2 quel que soit l'outil —
    // c'est une zone à PROTÉGER (bride, îlot) : la pointe au bord laisserait
    // le corps boule/torique entamer l'îlot de D/2. (Rect : faoLimit2R(D).)
    const r2=D/2;
    const at2=R2
      ?function(x,y){ return !(x>=R2.x0&&x<=R2.x1&&y>=R2.y0&&y<=R2.y1); }
      :function(x,y){ return !faoLimInside(x,y,lim2OK,r2); };
    const cross2=R2
      // Chevauchement avec l'îlot (et non « pas entièrement dedans ») :
      // ligne AVOID l'îlot -> false (raccourci autorisé, coupe jugée propre),
      // ligne qui l'entrechevauche -> true (pas de raccourci à travers).
      ?function(a,b){ return !!faoClipLB({x:a.x,y:a.y},{x:b.x,y:b.y},R2); }
      :function(a,b){ return faoPolyCross(a.x,a.y,b.x,b.y,lim2OK.loop); };
    const at1=at, cross1=cross;
    at=at1?function(x,y){ return at1(x,y)&&at2(x,y); }:at2;
    cross=cross1?function(a,b){ return cross1(a,b)||cross2(a,b); }:cross2;
  }
  return {lim:limOK,lim2:lim2OK,D:D,chain:chain,R:R,R2:R2,at:at,cross:cross};
}
/* ===================== PLANS : DÉGAGEMENT / RETRAIT ===================== */
// 2026-10-08-002 : plans façon Fusion360, PAR OPÉRATION (héritage posage ->
// op). Un plan = {ref, dz} : valeur = Z de la référence + décalage, en
// coordonnées MONDE (repère pièce). `ref` ∈ FAO_PLANE_REFS ; 'max'/'min'
// portent deux sous-plans {s1,s2} (sous-références de base seulement) ;
// 'face' porte `fz` = Z mesuré au clic. Le plan 'retrait' n'est chaîné que
// DANS le plan de dégagement (déGagement = retrait + 10 par défaut) — la
// chaîne est bornée à 2 maillons (nettoyage + garde `dep`), jamais de cycle.
// Les plans alimentent : translations rapides XY (dégagement), remontées des
// G0 (retrait, selon `planes.mode`), retrait inter-outils et fin de parcours.
const FAO_PLANE_REFS=[
  ['brutHaut','Haut du brut'],
  ['brutBas','Fond du brut'],
  ['modeleHaut','Haut du modèle'],
  ['modeleBas','Bas du modèle'],
  ['bridageHaut','Haut du bridage'],
  ['bridageBas','Bas du bridage'],
  ['face','Sélection (face)'],
  ['origine','Origine (absolue)'],
  ['max','Le plus élevé des deux'],
  ['min','Le plus bas des deux']
];
function faoModelZBox(job){
  // bbox des corps du modèle (sans marge) — Z « Haut/Bas du modèle ».
  // Repli : Z du brut (le brut suit le modèle en source corps).
  try{
    if(typeof THREE!=='undefined'&&typeof bodies!=='undefined'&&bodies&&bodies.length){
      const box=new THREE.Box3(); let n=0;
      const want=(job&&job.stockSrc==='body')?job.stockBody:null;
      const ms=[];
      bodies.forEach(function(b){
        if(!b||b.ghost||!b.mesh)return;
        if(want!=null){ if(b.id!==want)return; }
        else if(b.visible===false)return;
        try{ box.expandByObject(b.mesh); n++; ms.push(b.mesh); }catch(e){}
      });
      const Fr=faoFrame(job); // repère orienté : Z du posage
      if(n&&!Fr.id){ const Bf=faoMeshesBoxF(ms,Fr); if(Bf)return {z0:Bf.z0,z1:Bf.z1}; }
      if(n&&!box.isEmpty()&&isFinite(box.min.z)&&isFinite(box.max.z))
        return {z0:box.min.z,z1:box.max.z};
    }
  }catch(e){}
  const s=faoStock(); return {z0:s.z0,z1:s.z1};
}
function faoPlaneZ(pl,op,job,dep){
  // Résolution ABSOLUE d'un plan. NaN = plan illisible (repli côté appelant).
  dep=dep||0;
  if(!pl||typeof pl!=='object'||!pl.ref||dep>4)return NaN;
  const st=(job&&job.stock&&isFinite(+job.stock.z1))?job.stock:faoStockDefault();
  const z1=isFinite(+st.z1)?+st.z1:0, z0=isFinite(+st.z0)?+st.z0:0;
  let z=NaN;
  switch(pl.ref){
    case 'brutHaut': z=z1; break;
    case 'brutBas': z=z0; break;
    case 'modeleHaut': case 'modeleBas':{
      const mb=faoModelZBox(job);
      z=(pl.ref==='modeleHaut')?mb.z1:mb.z0; break;
    }
    case 'bridageHaut':{ const f=job&&job.fixture;
      z=(f&&isFinite(+f.z1))?+f.z1:z1; break; }
    case 'bridageBas':{ const f=job&&job.fixture;
      z=(f&&isFinite(+f.z0))?+f.z0:z0; break; }
    case 'face': z=isFinite(+pl.fz)?+pl.fz:z1; break;
    case 'origine': z=(job&&job.originZero)?0:faoOriginPoint(job)[2]; break; // 2026-10-16-020 : Z0 = origine du POSAGE (repère d'usinage)
    case 'retrait': // chaîne unique : dégagement depuis le retrait
      if(dep>=3)return NaN;
      z=faoRetractAbs(op,job); break;
    case 'max': case 'min':{
      const a=faoPlaneZ(pl.s1,op,job,dep+1), b=faoPlaneZ(pl.s2,op,job,dep+1);
      if(!isFinite(a)&&!isFinite(b))return NaN;
      if(!isFinite(a))return b;
      if(!isFinite(b))return a;
      return (pl.ref==='max')?Math.max(a,b):Math.min(a,b);
    }
    default: return NaN;
  }
  if(!isFinite(z))return NaN;
  return z+(isFinite(+pl.dz)?+pl.dz:0);
}
function faoClearAbs(op,job){
  // Plan de dégagement ABSOLU de l'opération (héritage op > posage > legacy).
  const pl=(op&&op.planes&&op.planes.clear)?op.planes.clear:
    (job&&job.planes&&job.planes.clear)?job.planes.clear:null;
  if(pl){ const z=faoPlaneZ(pl,op,job,0); if(isFinite(z))return z; }
  return faoSafeZ(job);
}
function faoRetractAbs(op,job){
  // Plan de retrait ABSOLU de l'opération (héritage op > posage > legacy).
  const pl=(op&&op.planes&&op.planes.retr)?op.planes.retr:
    (job&&job.planes&&job.planes.retr)?job.planes.retr:null;
  if(pl){ const z=faoPlaneZ(pl,op,job,0); if(isFinite(z))return z; }
  return faoRetractZ(job);
}
function faoZoneSecu(op,job){
  // Plan des RAPIDES internes de l'opération (absolu, jamais sous le brut) :
  //  - mode 'plan' (remontées « toujours au plan de retrait ») : le plan de
  //    retrait lui-même, ramené au-dessus du brut ;
  //  - mode 'min5' (défaut, « plan de retrait ou minimum +5 mm ») : le plan
  //    de retrait BORNÉ par dessus brut + Sortie (5 par défaut) — c'est
  //    l'ancien secu absolu quand le retrait vaut brut+25 (héritage).
  const top=(job&&job.stock&&isFinite(+job.stock.z1))?+job.stock.z1:
    (op&&isFinite(+op.z))?+op.z:(op&&isFinite(+op.ztop))?+op.ztop:0;
  const retr=Math.max(faoRetractAbs(op,job),top); // jamais sous le dessus du brut
  const mode=(job&&job.planes&&job.planes.mode)||'min5';
  if(mode==='plan')return retr;
  const ceil=top+((job&&isFinite(+job.secu))?+job.secu:5); // Sortie
  return Math.min(retr,ceil);
}
/* ----- nettoyage (sanitise) : forme normalisée, sinon null (repli legacy) ----- */
function faoPlaneSlotClean(s){
  if(!s||typeof s!=='object')return null;
  let ok=false;
  for(let i=0;i<FAO_PLANE_REFS.length;i++){
    const r=FAO_PLANE_REFS[i][0];
    if(r===s.ref&&r!=='max'&&r!=='min'&&r!=='retrait'){ok=true;break;}
  }
  if(!ok)return null;
  const o={ref:s.ref,dz:isFinite(+s.dz)?+s.dz:0};
  if(s.ref==='face'){ if(!isFinite(+s.fz))return null; o.fz=+s.fz; }
  return o;
}
function faoPlaneClean(pl,role){
  // role='clear' : accepte la chaîne 'retrait' ; role='retr' : jamais.
  if(!pl||typeof pl!=='object')return null;
  if(pl.ref==='max'||pl.ref==='min'){
    const s1=faoPlaneSlotClean(pl.s1), s2=faoPlaneSlotClean(pl.s2);
    return (s1&&s2)?{ref:pl.ref,s1:s1,s2:s2}:null;
  }
  if(pl.ref==='retrait')return (role==='clear')?{ref:'retrait',dz:isFinite(+pl.dz)?+pl.dz:0}:null;
  return faoPlaneSlotClean(pl);
}
function faoPlaneEff(job,op){
  // Valeurs EFFECTIVES montrées à l'écran (héritage op > posage > legacy).
  // Le legacy traduit les anciens champs absolus en références : Auto =
  // brut+100 (dégagement) / brut+25 (retrait), valeur forcée = origine+val.
  const P=(job&&job.planes)||{}, O=(op&&op.planes)||{};
  const clear=O.clear||P.clear||
    (job&&isFinite(+job.safeZ)?{ref:'origine',dz:+job.safeZ}:{ref:'brutHaut',dz:100});
  const retr=O.retr||P.retr||
    (job&&isFinite(+job.retract)?{ref:'origine',dz:+job.retract}:{ref:'brutHaut',dz:25});
  return {clear:clear,retr:retr,mode:P.mode==='plan'?'plan':'min5',
    ownClear:!!O.clear,ownRetr:!!O.retr};
}
function faoZoneStrip(moves,ctx,secu,job){
  // 2026-10-10-002 : test de franchissement de la boîte brut (utilisé par le
  // garde-brut ci-dessous) : true si le segment a->b ENTRE dans la boîte sb
  // (au moins une extrémité dedans ET l'autre dehors, ou intersection non
  // triviale avec une arête). Un segment entièrement dedans ou entièrement
  // dehors ne FRANCHIT pas la frontière -> false.
  function faoBoxCross(a,b,sb){
    const inB=function(x,y){ return x>=sb.x0-1e-9&&x<=sb.x1+1e-9&&y>=sb.y0-1e-9&&y<=sb.y1+1e-9; };
    const ain=inB(a.x,a.y), bin=inB(b.x,b.y);
    if(ain!==bin)return true; // une extrémité dedans, l'autre dehors : franchit
    if(ain&&bin)return false; // les deux dedans : pas de franchissement
    // les deux dehors : franchit SSI le segment coupe la boîte (intersection
    // non triviale, pas seulement un point de contact)
    const x0=sb.x0,y0=sb.y0,x1=sb.x1,y1=sb.y1;
    let t0=0,t1=1; const dx=b.x-a.x, dy=b.y-a.y;
    const clip=function(p,q){
      if(Math.abs(dx)<1e-12){ if(p>0)return a.x<=q; return a.x>=q; }
      const r=(q-a.x)/dx; if(p>0){ if(r>t1)return false; if(r>t0)t0=r; }
      else { if(r<t0)return false; if(r<t1)t1=r; } return true;
    };
    if(!clip(-dx,x0))return false; if(!clip(dx,x1))return false;
    const clipY=function(p,q){
      if(Math.abs(dy)<1e-12){ if(p>0)return a.y<=q; return a.y>=q; }
      const r=(q-a.y)/dy; if(p>0){ if(r>t1)return false; if(r>t0)t0=r; }
      else { if(r<t0)return false; if(r<t1)t1=r; } return true;
    };
    if(!clipY(-dy,y0))return false; if(!clipY(dy,y1))return false;
    // Franchissement non triviel : longueur d'intersection > epsilon
    return (t1-t0)>1e-9;
  }
  // Retire les SÉRIES de rapides hors zone : la coupe a déjà été clipée avant,
  // ces G0 ne font que se rendre « dans le vide » (tour du cadre de validation,
  // liaison au ras du brut, plongée déportée hors mur). Ils ne sont gardés que
  // s'ils ouvrent l'opération (engagement, retour d'outil) ou si la jonction
  // directe prev->next traverserait elle la frontière : on ne fabrique JAMAIS
  // un franchissement nouveau. Rend le MÊME tableau si rien ne sort.
  if(!moves||!moves.length)return moves;
  // --- 2026-10-10-002 : garde-brut (SANS zone uniquement).
  // Un G0 dont les DEUX bouts sont hors de la boîte du brut ne sert jamais
  // l'usinage : il traverserait dans le vide au-delà du brut (c'est le trait
  // rouge que l'utilisateur voit hors pièce). Un engagement / un retour
  // d'outil / un franchissement nécessaire ont au moins un bout DEDANS :
  // ils survivent. La coupe (r=0) n'est pas touchée ici (elle est clipée par
  // la zone quand il y en a une ; sinon c'est la génération qui la borne).
  // QUAND IL Y A UNE ZONE (ctx) : la purge de zone ci-dessous gère déjà les
  // rapides (faoZoneStrip) — on ne duplique pas la logique.
  if(!ctx){
  try{
    const sb=(job&&job.stock&&faoStockValid(job.stock))?job.stock:faoStock(); // brut du job : repère 3+2 compris
    if(sb&&isFinite(sb.x0)&&isFinite(sb.x1)&&isFinite(sb.y0)&&isFinite(sb.y1)){
      const inB=function(x,y){
        return x>=sb.x0-1e-9&&x<=sb.x1+1e-9&&y>=sb.y0-1e-9&&y<=sb.y1+1e-9;
      };
      const br=[]; let prev=null, dropped=false;
      // 2026-10-10-002 : la PREMIÈRE série de rapides (engagement / retour
      // d'outil en tête d'op) est préservée — même règle que faoZoneStrip pour
      // la zone. Un outil doit pouvoir approcher depuis l'extérieur du brut.
      let i0=0;
      while(i0<moves.length&&moves[i0].r&&!inB(moves[i0].x,moves[i0].y))i0++;
      for(let i=0;i<i0;i++)br.push(moves[i]); // tête préservée
      prev=(i0>0)?moves[i0-1]:null;
      // Séries de rapides hors brut APRES la tête (même logique que zone)
      for(let i=i0;i<moves.length;){
        const m=moves[i];
        if(m.r&&!inB(m.x,m.y)){
          let j=i;
          while(j<moves.length&&moves[j].r&&!inB(moves[j].x,moves[j].y))j++;
          // Série [i,j-1] 100% hors brut. Retirée SEULEMENT si :
          //  - elle n'est ni en tête (engagement) ni en fin d'op (retour outil) ;
          //  - la jonction prev->next ne traverserait PAS la frontière du brut.
          const pr=(i>0)?moves[i-1]:null, nx=(j<moves.length)?moves[j]:null;
          if(!pr||!nx){ i=j; prev=nx||prev; continue; } // tête ou queue : préservée
          if(!faoBoxCross(pr,nx,sb)){ dropped=true; i=j; prev=nx; continue; }
        }
        br.push(m); prev=m; i++;
      }
      if(dropped&&br.length){
        // Re-jonexion EN SÉCURITÉ (même règle que faoZoneStrip) : un rapide
        // hors brut retiré est remplacé par un retrait vertical au point de
        // coupe précédent, puis une liaison sécu au point suivant. Jamais de
        // coupe→coupe diagonale (plongée déportée).
        const out2=[]; prev=null;
        for(let i=0;i<br.length;i++){
          const m=br[i];
          // Transition coupe→coupe (rapide retiré entre les deux) : on remonte
          // d'abord en Z au point courant, puis on descend au point suivant.
          if(prev&&prev.r===0&&m.r===0){
            const zc=Math.max(prev.z,m.z,secu);
            out2.push({r:1,x:prev.x,y:prev.y,z:zc});
            out2.push({r:1,x:m.x,y:m.y,z:zc});
          }
          out2.push(m); prev=m;
        }
        moves=out2;
      }else if(dropped) moves=br;
    }
  }catch(e){}
  } // fin garde-brut (sans zone)
  if(!ctx)return moves;
  const at=ctx.at;
  const runs=[]; let k=0;
  while(k<moves.length){
    const m=moves[k];
    if(m.r&&!at(m.x,m.y)){
      let j=k;
      while(j<moves.length&&moves[j].r&&!at(moves[j].x,moves[j].y))j++;
      runs.push([k,j-1]); k=j;
    }else k++;
  }
  if(!runs.length)return moves;
  const drop=runs.map(function(r){
    const a=r[0], b=r[1];
    const prev=a>0?moves[a-1]:null, next=b+1<moves.length?moves[b+1]:null;
    if(!prev)return false;                       // tête d'op : engagement
    if(next&&ctx.cross(prev,next))return false;  // franchissement nécessaire
    return true;
  });
  if(!drop.some(function(d){ return d; }))return moves;
  const out=[]; let u=0;
  for(let i=0;i<moves.length;i++){
    if(u<runs.length&&i===runs[u][0]){
      const a=runs[u][0], b=runs[u][1];
      const prev=a>0?moves[a-1]:null, next=b+1<moves.length?moves[b+1]:null;
      u++;
      if(!drop[u-1]){ for(let t=a;t<=b;t++)out.push(moves[t]); i=b; continue; }
      // jonction : jamais de G0 à z de coupe (retrait puis liaison en sécurité)
      if(prev&&prev.r===0)out.push({r:1,x:prev.x,y:prev.y,z:secu});
      if(next&&next.r===0)out.push({r:1,x:next.x,y:next.y,z:secu});
      i=b; continue;
    }
    out.push(moves[i]);
  }
  return out;
}
function faoZoneServe(ch,op,job,secu){
  // Lecture d'un tracé en cache : la purge des excursions est appliquée UNE fois
  // puis rangée dans l'entrée mémoire — pas de rejeu, clé de cache inchangée.
  if(!ch||!Array.isArray(ch.mv))return ch?ch.mv:null;
  const ctx=faoZoneCtx(op,job);
  if(!ctx)return ch.mv;
  const mv=faoZoneStrip(ch.mv,ctx,secu,job);
  if(mv!==ch.mv)ch.mv=mv;
  return ch.mv;
}
function faoZoneCuts(moves,op,job,secu){
  // 0) purge des excursions de G0 (le diagnostic verrait un rapide dehors comme
  //    un débordement de coupe) ; 1) la coupe est-elle entière dans la zone ?
  //    Si un seul point déborde (extrémité, croisement, arc d'arrondi) :
  //    2) réparation — arcs -> polygone, puis re-clip des SEULS segments de
  //    coupe (les rapides restent ce qu'ils sont, hors les séries retirées).
  const ctx=faoZoneCtx(op,job);
  if(!ctx||!moves||!moves.length)return moves;
  const at=ctx.at;
  const depasse=function(a,b,m){
    // Extrémité de coupe hors zone, ou segment/arc qui traverse la frontière.
    if(!at(m.x,m.y))return true;
    if(m.arc){
      const pts=faoArcSegs(a,m);
      for(let k=0;k<pts.length;k++)if(!at(pts[k][0],pts[k][1]))return true;
      return false;
    }
    return ctx.cross(a,b);
  };
  const m0=faoZoneStrip(moves,ctx,secu,job);
  // --- 1) diagnostic : la coupe est-elle entièrement dedans ?
  let prev=null, bust=false;
  for(let i=0;i<m0.length&&!bust;i++){
    const m=m0[i];
    if(m.r){ prev=m; continue; }   // rapides : le droit de traverser
    if(prev&&depasse(prev,m,m))bust=true;
    if(!prev&&!at(m.x,m.y))bust=true;
    prev=m;
  }
  if(!bust)return m0;          // RAS : on ne touche à rien d'autre
  // --- 2) réparation
  const flat=[]; prev=null;
  for(let i=0;i<m0.length;i++){
    const m=m0[i];
    if(m.r){ flat.push(m); prev=m; continue; }
    if(m.arc&&prev){
      const pts=faoArcSegs(prev,m); let ok=at(m.x,m.y);
      for(let k=0;k<pts.length&&ok;k++)if(!at(pts[k][0],pts[k][1]))ok=false;
      if(ok){ flat.push(m); prev=m; continue; }
      // 10-09-004 : un arc d'entrée développé reste bleu (ent sur chaque point).
      for(let k=0;k<pts.length;k++){ const o={r:0,x:pts[k][0],y:pts[k][1],z:pts[k][2]}; if(m.ent)o.ent=1; flat.push(o); }
      prev=flat[flat.length-1];
      continue;
    }
    flat.push(m); prev=m;
  }
  let cut=flat;
  if(ctx.chain)cut=faoClipMovesPoly(cut,ctx.lim,ctx.D/2,secu,2);
  else if(ctx.R)cut=faoClipMovesXY(cut,ctx.R,secu);
  // 2026-10-08-003 : puis le COMPLÉMENT de l'îlot intérieur (deuxième passe :
  // les deux clips se composent — intersection des zones usinables).
  if(ctx.R2)cut=faoClipMovesXY(cut,ctx.R2,secu,true);
  else if(ctx.lim2)
    cut=faoClipMovesPoly(cut,ctx.lim2,ctx.D/2,secu,2,
      function(x,y){ return !faoLimInside(x,y,ctx.lim2,ctx.D/2); });
  return faoZoneStrip(cut,ctx,secu,job);
}
/* ----- affichage : la COUPE ne sort jamais de la zone (l'aperçu le garantit)
   même sur un tracé en cache. Les rapides, eux, sont dessinés tels quels —
   engagés en tête d'opération ou franchissements de la séquence. */
function faoPolyCross(ax,ay,bx,by,loop){
  const dx=bx-ax, dy=by-ay;
  for(let i=0,j=loop.length-1;i<loop.length;j=i++){
    const cx1=loop[j][0],cy1=loop[j][1],cx2=loop[i][0],cy2=loop[i][1];
    const ex=cx2-cx1, ey=cy2-cy1;
    const den=dx*ey-dy*ex;
    if(Math.abs(den)<1e-12)continue;
    const t=((cx1-ax)*ey-(cy1-ay)*ex)/den;
    const u=((cx1-ax)*dy-(cy1-ay)*dx)/den;
    if(t>1e-9&&t<1-1e-9&&u>1e-9&&u<1-1e-9)return true;
  }
  return false;
}
function faoSegClipper(op,job){
  // V0.7.8 : opération au repère propre (3+2) — la zone est dans le repère de l'OPÉRATION, les
  // segments de l'aperçu dans celui du posage : sans conversion, toute la coupe était rejetée
  // (« pas de spirale verte » sur l'ébauche 3D de l'oblong), seuls les rapides restaient.
  let fr=null;try{fr=(typeof faoOpFrame==='function')?faoOpFrame(job,op):null;}catch(e){fr=null;}
  if(!fr)return faoSegClipper0(op,job);
  const inner=faoSegClipper0(op,faoOpJob(job,op,fr));if(!inner)return null;
  const toO=function(x,y,z){return faoToF(fr,faoToW(fr.P,[x,y,z]));};
  return function(ax,ay,az,bx,by,bz,push){
    const A=toO(ax,ay,az),B=toO(bx,by,bz);
    inner(A[0],A[1],A[2],B[0],B[1],B[2],function(x1,y1,z1,x2,y2,z2){
      const P=faoPtOpToPos(fr,[x1,y1,z1]),Q=faoPtOpToPos(fr,[x2,y2,z2]);push(P[0],P[1],P[2],Q[0],Q[1],Q[2]);});
  };
}
function faoZoneDone(op){
  // Zone déjà tenue par le générateur (bord exact, arcs d'entrée/sortie
  // tangents au bord) : ni re-clip à la génération, ni clip à l'affichage.
  return !!op&&((op.type==='geofinish'&&op.traj==='scallop')||op.type==='geodesic'||
    (typeof faoContourProfil==='function'&&faoContourProfil(op))||op.type==='chamfer');
}
function faoSegClipper0(op,job){
  // -> fn(ax,ay,az,bx,by,bz,push) qui ne pousse que la partie DANS la zone,
  //    ou null : opération sans zone (affichage inchangé, cas par défaut).
  // Usage réservé aux segments de COUPE (cf. faoRefreshPreview) : un rapide
  // a le droit de traverser la frontière.
  // 2026-10-08-003 : zone intérieure (îlot) — ctx composé (ET des deux zones).
  // 2026-10-27 : opérations dont la zone EST le parcours (faoZoneDone) — pas
  // de clip, comme à la génération : le Contour profil passe sur/hors de sa
  // chaîne, le clip effaçait ses arcs d'entrée verts (voire tout le tracé).
  if(faoZoneDone(op))return null;
  const ctx=faoZoneCtx(op,job);
  if(!ctx)return null;
  if(!ctx.lim2){
    // --- extérieur seul : chemins historiques EXACTS (inchangés) ---
    if(ctx.chain){
      const at=ctx.at;
      return function(ax,ay,az,bx,by,bz,push){
        const ain=at(ax,ay), bin=at(bx,by);
        const cross=ctx.cross({x:ax,y:ay},{x:bx,y:by});
        if(ain&&bin&&!cross){ push(ax,ay,az,bx,by,bz); return; } // cas courant : 1 test
        if(!ain&&!bin&&!cross)return;                            // tout dehors : rien
        const n=Math.max(1,Math.ceil(Math.hypot(bx-ax,by-ay)));  // subdivision 1 mm
        let px=ax,py=ay,pz=az,pin=ain;
        for(let i=1;i<=n;i++){
          const t=i/n, cx=ax+(bx-ax)*t, cy=ay+(by-ay)*t, cz=az+(bz-az)*t, cin=at(cx,cy);
          if(cin&&pin)push(px,py,pz,cx,cy,cz);
          px=cx;py=cy;pz=cz;pin=cin;
        }
      };
    }
    if(ctx.R){
      const R=ctx.R;
      return function(ax,ay,az,bx,by,bz,push){
        const s=faoClipLB({x:ax,y:ay},{x:bx,y:by},R);
        if(!s)return;
        push(ax+(bx-ax)*s[0],ay+(by-ay)*s[0],az+(bz-az)*s[0],
             ax+(bx-ax)*s[1],ay+(by-ay)*s[1],az+(bz-az)*s[1]);
      };
    }
    return null;
  }
  // --- composé (limite + îlot) : at = ET, cross = OU, marche 1 mm ---
  const at=ctx.at;
  return function(ax,ay,az,bx,by,bz,push){
    const ain=at(ax,ay), bin=at(bx,by);
    const cr=ctx.cross({x:ax,y:ay},{x:bx,y:by});
    if(ain&&bin&&!cr){ push(ax,ay,az,bx,by,bz); return; }
    if(!ain&&!bin&&!cr)return;
    const n=Math.max(1,Math.ceil(Math.hypot(bx-ax,by-ay)));
    let px=ax,py=ay,pz=az,pin=ain;
    for(let i=1;i<=n;i++){
      const t=i/n, cx=ax+(bx-ax)*t, cy=ay+(by-ay)*t, cz=az+(bz-az)*t, cin=at(cx,cy);
      if(cin&&pin)push(px,py,pz,cx,cy,cz);
      px=cx;py=cy;pz=cz;pin=cin;
    }
  };
}
