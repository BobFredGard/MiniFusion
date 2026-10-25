/* ----- entrée en arc tangent sur une paroi (mène à la passe) ----- */
// Quart de cercle S->W tangent à la direction de paroi (+Y) en W, avec
// S sur la ligne vidée à ≤10 mm de W (rayon capé à 5). G2 à gauche,
// G3 à droite — tangence prouvée par test.
function faoLeadArc(Mx,My,Wx,Wy,leftWall,z){
  const dir=leftWall?1:-1;
  if((Mx-Wx)*dir<=0)return null; // M du mauvais côté : pas d'arc
  const rLead=Math.min(Math.abs(Mx-Wx)/2,5);
  if(!(rLead>=0.5))return null;
  const Sx=Wx+dir*2*rLead, cx=Wx+dir*rLead;
  return {sx:Sx, move:{r:0,x:Wx,y:Wy,z:z,arc:{i:cx-Sx,j:0,cw:leftWall}}};
}

function faoIsoSegs(mesh,normals,dist,iso,flags,want,mask){
  // Marching-triangles : segments 3D + normales interpolées (points de contact).
  // 2026-10-04-004 : flags/want — masque optionnel des familles plate/inclinée
  // (iso-Z sur les faces en pente, anneaux géodésiques sur les plateaux).
  // 2026-10-12-002 : mask optionnel — un tableau booléen par face (zoneAt +
  // ztop/zbot). 2026-10-13-001 : mask et flags se COMPOSENT (ET logique) —
  // une face doit satisfaire les DEUX filtres (masque zone ET famille).
  const segs=[];
  for(let i=0;i<mesh.t.length;i++){
    if(mask&&!mask[i])continue;
    if(flags&&want!==null&&want!==undefined&&flags[i]!==want)continue;
    const ti=mesh.t[i];
    const P=[mesh.v[ti[0]],mesh.v[ti[1]],mesh.v[ti[2]]];
    const N=[normals[ti[0]],normals[ti[1]],normals[ti[2]]];
    const d=[dist[ti[0]]-iso,dist[ti[1]]-iso,dist[ti[2]]-iso];
    const pts=[];
    for(let k=0;k<3;k++){
      const da=d[k], db=d[(k+1)%3];
      if((da<0&&db>=0)||(da>=0&&db<0)){
        const s=Math.abs(db-da)>1e-12?da/(da-db):0;
        const A=P[k], B=P[(k+1)%3], NA=N[k], NB=N[(k+1)%3];
        pts.push({
          p:[A[0]+(B[0]-A[0])*s,A[1]+(B[1]-A[1])*s,A[2]+(B[2]-A[2])*s],
          n:[NA[0]+(NB[0]-NA[0])*s,NA[1]+(NB[1]-NA[1])*s,NA[2]+(NB[2]-NA[2])*s]
        });
      }
    }
    if(pts.length>=2)segs.push([pts[0],pts[1]]);
  }
  return segs;
}
function faoChainSegs(segs,tol){
  // Chaînage glouton par extrémités proches (points iso coïncidents aux arêtes).
  const t2=(tol||1e-4), chains=[];
  const used=new Array(segs.length).fill(false);
  const key=function(p){return p.p;};
  const deq=function(a,b){ const dx=a[0]-b[0],dy=a[1]-b[1],dz=a[2]-b[2];
    return dx*dx+dy*dy+dz*dz<t2*t2; };
  for(let s=0;s<segs.length;s++){
    if(used[s])continue;
    used[s]=true;
    const chain=[segs[s][0],segs[s][1]];
    let grew=true, guard=0;
    while(grew&&guard++<100000){
      grew=false;
      for(let k=0;k<segs.length;k++){
        if(used[k])continue;
        const A=segs[k][0], B=segs[k][1];
        if(deq(key(chain[chain.length-1]),key(A))){chain.push(B);used[k]=true;grew=true;break;}
        if(deq(key(chain[chain.length-1]),key(B))){chain.push(A);used[k]=true;grew=true;break;}
        if(deq(key(chain[0]),key(B))){chain.unshift(A);used[k]=true;grew=true;break;}
        if(deq(key(chain[0]),key(A))){chain.unshift(B);used[k]=true;grew=true;break;}
      }
    }
    chains.push(chain);
  }
  // 2026-10-12-002 : longueur d'arc par chaîne (somme des segments), attachée
  // au tableau retourné — sert au filtre d'incohérence (fragments trop courts).
  const lens=new Array(chains.length);
  for(let i=0;i<chains.length;i++){
    let a=0; const c=chains[i];
    for(let j=1;j<c.length;j++)
      a+=Math.hypot(c[j].p[0]-c[j-1].p[0],c[j].p[1]-c[j-1].p[1],c[j].p[2]-c[j-1].p[2]);
    lens[i]=a;
  }
  chains.lens=lens;
  return chains;
}
function faoGeoFlags(mesh,zb,zt){
  // 2026-10-04-004 : partition des faces — plate = normale quasi verticale
  // (nz ≥ 0,99 ≈ 8°, marge de tessellation), sinon inclinée/mur. flags limite
  // l'extraction à une famille ; un plateau n'est retenu que dans [zb,zt]
  // (limites Z) ; anySlope (toutes faces, hors limites) pilote le garde-fou
  // de la fraise droite.
  const flags=new Uint8Array(mesh.t.length);
  let anySlope=false, hasFlat=false;
  for(let i=0;i<mesh.t.length;i++){
    const t=mesh.t[i],A=mesh.v[t[0]],B=mesh.v[t[1]],C=mesh.v[t[2]];
    const ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2];
    const wx=C[0]-A[0],wy=C[1]-A[1],wz=C[2]-A[2];
    const nx=uy*wz-uz*wy, ny=uz*wx-ux*wz, nz=ux*wy-uy*wx;
    const l=Math.hypot(nx,ny,nz)||1;
    if(nz/l>=0.99){
      const zc=(A[2]+B[2]+C[2])/3;
      if(zc>=zb-1e-9&&zc<=zt+1e-9){flags[i]=1;hasFlat=true;}
    }else anySlope=true;
  }
  return {flags:flags,anySlope:anySlope,hasFlat:hasFlat};
}
function faoGeoEntryMode(entry,hasRrough){
  // 2026-10-04-009 : mode d'entrée de la géofinition. L'hélice creuse sa place
  // en tournant — INTERDITE sans ébauche 3D active AVANT cette finition
  // (sinon elle plongerait dans la matière pleine) : on retombe sur la rampe,
  // qui descend en biais sur l'air au-dessus de la trajectoire. L'arc circ
  // (2026-10-08-004) suit la même règle : sans ébauche, il n'y a pas d'ancre
  // (matière déjà ouverte) → rampe.
  const m=(entry==='ramp'||entry==='helix'||entry==='circ')?entry:'auto';
  if(m==='ramp')return 'ramp';
  if(!hasRrough)return 'ramp';
  return m;
}
function faoGeoHasRrough(job,op){
  // Ébauche 3D (rough3d) active AVANT cette opération dans le même posage ?
  // Op introuvable -> false (jamais d'hélice au doute). L'ancien « Débourrage »
  // (pocket3d) ayant été supprimé, il ne compte plus comme débourrage.
  const ops=(job&&job.ops)||[];
  let i=-1;
  for(let k=0;k<ops.length;k++){
    if(ops[k]===op||(op&&op.id&&ops[k]&&ops[k].id===op.id)){i=k;break;}
  }
  if(i<0)return false;
  for(let k=0;k<i;k++){
    const q=ops[k];
    if(!q||q.on===false)continue;
    if(q.type==='rough3d'||faoPocketAdapt(q))return true;
  }
  return false;
}
function faoSplinePts(P0,T0,P1,T1,n){
  // 2026-10-12-002 : échantillonnage d'une LIAISON PAR SPLINE TANGENTE
  // (demande : « passer de l'une à l'autre via une spline qui se déplacerait
  // en X, Y et Z pour rejoindre la courbe suivante… tangente aux 2 extrémités
  // de chaque courbe » — comme Fusion 360). Hermite cubique 3D :
  // C(t)=h00·P0+h10·m0+h01·P1+h11·m1, m0/m1 = tangentes aux extrémités DÉJÀ
  // scalées en mm par l'appelant (bornées par chord/3 et 0,9·longueur du
  // segment adjacent pour éviter le dépassement). Extrémités forcées exactes
  // (jointure C0 parfaite), n 1/10 échantillons réguliers en t — le caller
  // prend n=ceil(chord/0,5) (corde ≤ 0,5 mm pour le G1 du post-processeur).
  const nS=Math.max(6,Math.min(128,isFinite(+n)?Math.round(+n):12));
  const out=new Array(nS+1);
  for(let k=0;k<=nS;k++){
    const t=k/nS,t2=t*t,t3=t2*t;
    const h00=2*t3-3*t2+1,h10=t3-2*t2+t,h01=-2*t3+3*t2,h11=t3-t2;
    out[k]={x:h00*P0.x+h10*T0.x+h01*P1.x+h11*T1.x,
            y:h00*P0.y+h10*T0.y+h01*P1.y+h11*T1.y,
            z:h00*P0.z+h10*T0.z+h01*P1.z+h11*T1.z};
  }
  out[0]={x:P0.x,y:P0.y,z:P0.z};
  out[nS]={x:P1.x,y:P1.y,z:P1.z};
  return out;
}
// Colonnes de liaison par maillage, mémoïsées ENTRE générations
// (2026-10-13-002) : régénérer après un réglage réutilise les mêmes tableaux
// concaténés → faoDiscIdx/faoHashSegs (index spatiaux) frappent à
// l'identique au lieu de rebâtir ~100 hash × dizaines de milliers de
// segments (~6 s sur pièce 38k tris). Borné à 128 entrées pour plafonner la
// mémoire ; H évicté = reconcat mémoïsée + rehash, jamais plus.
const faoColCache=new WeakMap();
function* faoGenGeoFinishIt(mesh,o){
  // Trajectoire PARALLÈLE de la finition Crêtes constantes (profils 3D à pas
  // constant). 2026-10-14-003 : le mode Iso-Z (niveaux horizontaux + anneaux
  // plateaux + restes) est SUPPRIMÉ — Crêtes constantes façon Fusion
  // (src/89-fao-cretes.js) le remplace. Sorties pointe outil (contact +
  // normale×Rc − Rc·z). Limites ztop/zbot (défaut : étendue du maillage).
  o=o||{};
  if(!mesh||!mesh.v||!mesh.v.length)return [];
  const D=isFinite(+o.toolD)&&+o.toolD>0?+o.toolD:8;
  const kind=o.kind||'ball';
  const Rc=kind==='flat'?0:(kind==='bull'?Math.min(D/2,isFinite(+o.cornerR)?+o.cornerR:D/2):D/2);
  const L=isFinite(+o.laisse)&&+o.laisse>0?+o.laisse:0;
  const R=Rc+L;
  const secu=isFinite(+o.secu)?+o.secu:5;
  const step=isFinite(+o.step)&&+o.step>0?+o.step:1;
  const normals=faoMeshNormals(mesh);
  let zmax=-1/0, zmin=1/0;
  for(let i=0;i<mesh.v.length;i++){ const z=mesh.v[i][2]; if(z>zmax)zmax=z; if(z<zmin)zmin=z; }
  const zt=Math.min(isFinite(+o.ztop)?+o.ztop:zmax, zmax);
  const zb=Math.max(isFinite(+o.zbot)?+o.zbot:zmin, zmin);
  const G=faoGeoFlags(mesh,zb,zt);
  // Garde-fou fraise droite (point 2) : sans rayon actif, une pente même
  // légère laisse une arête non finie — on refuse plutot que de mentir.
  if(kind==='flat'&&G.anySlope)return [];
  const moves=[];
  const mode=faoGeoEntryMode(o.entry,o.hasRrough);
  // 2026-10-13-007 : SENS DE PASSE (rétro-ingénierie cav.txt) — 'bidir'
  // (défaut, absent inclus) = alternance du sens de coupe à surcoût borné ;
  // 'avalant' = proximité pure sans alternance, ordre haut→bas conservé.
  const sensBidir=(o.sens!=='avalant');
  const zones=[];
  // 2026-10-13-007 : TAG DE NIVEAU par zone (stitch spiral façon Fusion) —
  // {fam:'slope'|'plate', lvl:valeur d'iso}. Posé avant chaque emitLevel des
  // phases 1-2, relu par addLevel. Les restes (phase 3) gardent tag=null
  // (liaisons validées, pas de stitch).
  let zoneTag=null;
  // --- CRÊTES CONSTANTES 2026-10-13-001 -------------------------------------
  // Retour au double champ (demandes : « le parcours est oblique, je le veux le
  // plus parallèle possible de XY » / « les traces sur le plat continuent
  // d'être // à celles des parois, quitte à revenir finir les îlots ») :
  // (1) passes iso-Z HORIZONTALES sur les faces en pente — chaque passe est à
  //     Z constant = parallèle au plan XY (l'obliquité du géodésique pur
  //     disparaît), pas adaptif Δz = step×sinθ borné [dzFloor, step] →
  //     écart constant SUR la surface = step, façon Fusion 360 ;
  // (2) passes PARALLÈLES au contour sur les plateaux (direction issue des
  //     normales de paroi, iso-lignes droites, pas = step) ;
  // (3) restes : seeds locaux + champ géodésique (zones non couvertes).
  // La fenêtre Z (ztop/zbot) et la zone (zoneAt) bornent le masque des faces.
  // 2026-10-13-001 : zoneAt (limite d'op) borne aussi le masque — faces hors
  // zone exclues du champ, quelle que soit la fenêtre Z.
  const zoneAt=(typeof o.zoneAt==='function')?o.zoneAt:null;
  const userZ=isFinite(+o.ztop)||isFinite(+o.zbot);
  const allMask=new Uint8Array(mesh.t.length);
  for(let i=0;i<mesh.t.length;i++){
    const t=mesh.t[i];
    if(zoneAt){
      const xc=(mesh.v[t[0]][0]+mesh.v[t[1]][0]+mesh.v[t[2]][0])/3;
      const yc=(mesh.v[t[0]][1]+mesh.v[t[1]][1]+mesh.v[t[2]][1])/3;
      if(!zoneAt(xc,yc)){allMask[i]=0;continue;}
    }
    if(!userZ){allMask[i]=1;continue;}
    const zc=(mesh.v[t[0]][2]+mesh.v[t[1]][2]+mesh.v[t[2]][2])/3;
    allMask[i]=(zc>=zb-1e-9&&zc<=zt+1e-9)?1:0;
  }
  const chainsTol=Math.max(1e-4,step*0.02);
  // Grille de couverture : les chaînes émises marquent les cellules qu'elles
  // arpentent (pas step). Une cellule non marquée = zone non couverte → restes.
  const CS=Math.max(1e-3,step);
  const covSet=new Set();
  const ckey=function(x,y,z){
    return Math.floor(x/CS)+','+Math.floor(y/CS)+','+Math.floor(z/CS);
  };
  const covMark=function(chs){
    for(let i=0;i<chs.length;i++){ const c=chs[i];
      for(let j=0;j<c.length;j++)covSet.add(ckey(c[j].p[0],c[j].p[1],c[j].p[2]));
    }
  };
  const covHas=function(p){ return covSet.has(ckey(p[0],p[1],p[2])); };
  // Filtre d'incohérence : une iso dont les FRAGMENTS (chaînes d'arc <
  // max(step,D)) pèsent plus de 60 % de la longueur totale est abandonnée —
  // on passe à la suite plutôt que de rattraper point par point.
  const coherent=function(chs){
    if(!chs.length)return false;
    let tot=0,frag=0;
    const lens=chs.lens||[];
    const seuil=Math.max(step,D);
    for(let i=0;i<chs.length;i++){
      const a=lens[i]||0; tot+=a;
      if(a<seuil)frag+=a;
    }
    return tot>0&&frag<=0.6*tot;
  };
  // addLevel : convertit des chaînes source (points surface + normales) en
  // zone émissible (points POINTE outil). 2026-10-13-006 : centre = contact +
  // normale×R (R=Rc+laisse) ; pointe = centre − (0,0,Rc) le long de l'axe
  // outil (vertical). Sans cette conversion la boule/torique flottait à +Rc
  // en simulation ET en G-code (« la fraise ne touche pas les faces »).
  const addLevel=function(chs){
    const zcs=[];
    let zmaxZ=-1/0;
    chs.forEach(function(ch){
      if(ch.length<2)return;
      let zlo=1/0,zhi=-1/0;
      for(let j=0;j<ch.length;j++){const z=ch[j].p[2];if(z<zlo)zlo=z;if(z>zhi)zhi=z;}
      if(userZ&&(zhi>zt+1e-6||zlo<zb-1e-6))return;
      const cen=ch.map(function(q){
        const l=Math.hypot(q.n[0],q.n[1],q.n[2])||1;
        // centre = contact + n×R ; pointe = centre − (0,0,Rc)
        return {x:q.p[0]+q.n[0]/l*R, y:q.p[1]+q.n[1]/l*R, z:q.p[2]+q.n[2]/l*R-Rc};
      });
      const nl=Math.hypot(ch[0].n[0],ch[0].n[1],ch[0].n[2])||1;
      let cz=-1/0;
      cen.forEach(function(p){ if(p.z>cz)cz=p.z; });
      if(cz>zmaxZ)zmaxZ=cz;
      zcs.push({pts:cen,n0:[ch[0].n[0]/nl,ch[0].n[1]/nl,ch[0].n[2]/nl]});
    });
    if(zcs.length)zones.push({chains:zcs,zmax:zmaxZ,tag:zoneTag});
  };
  // emitLevel : extrait une iso du champ `field` à la valeur `iso`, restreinte
  // à la famille `want` (0=inclinée, 1=plate, null=toutes) ET au masque zone.
  // Si cover=1, seules les chaînes majoritairement non couvertes sont retenues.
  const emitLevel=function(field,iso,cover,want){
    const segs=faoIsoSegs(mesh,normals,field,iso,G.flags,want,allMask);
    if(!segs.length)return false;
    let chs=faoChainSegs(segs,chainsTol);
    if(cover){
      const keep=[],keepL=[];
      for(let ci=0;ci<chs.length;ci++){
        const ch=chs[ci]; let unc=0;
        for(let j=0;j<ch.length;j++)if(!covHas(ch[j].p))unc++;
        if(unc*2>=ch.length){keep.push(ch);keepL.push(chs.lens[ci]);}
      }
      keep.lens=keepL;
      chs=keep;
    }
    if(!chs.length)return false;
    // 2026-10-13-005 : rejet des chaînes DÉGÉNÉRÉES (longueur nulle ou quasi —
    // artefacts d'iso au ras des sommets sur maillage régulier) : sans ce
    // filtre chaque fragment zéro devient une zone à 1 segment, reliée par un
    // rapide parasite (29 rapides au plateau pour 3 vraies boucles concentriques).
    {
      const keep=[],keepL=[];
      const seuilDeg=Math.max(1e-6,step*0.05);
      for(let ci=0;ci<chs.length;ci++){
        if((chs.lens[ci]||0)>=seuilDeg){keep.push(chs[ci]);keepL.push(chs.lens[ci]);}
      }
      keep.lens=keepL;
      chs=keep;
    }
    if(!chs.length)return false;
    // 2026-10-13-006 : coherent() ASSOUMPI sur le plateau (want=1) — les
    // anneaux concentriques d'un maillage grossier sont légitimement
    // fragmentés en arcs < max(step,D) et le filtre 60 % les rejetait tous
    // (fond plat vide). Le filtre reste actif sur les pentes (want=0/null).
    // 2026-10-13-007 : idem profils parallèles (fam 'par') — un profil qui
    // traverse un boss se fragmente légitimement en tronçons (sol/boss/sol).
    if(want!==1&&!(zoneTag&&zoneTag.fam==='par')&&!coherent(chs))return false;
    addLevel(chs);
    covMark(chs);
    return true;
  };
  // --- PROFILS PARALLÈLES ----------------------------------------------------
  // 2026-10-13-007 : TRAJECTOIRE PARALLÈLE (rétro-ingénierie cav.txt + visu
  // Fusion « passes bleues » : passes 3D parallèles à espacement constant,
  // continues à travers boss et parois). Champ = coordonnée le long de l'axe
  // PERPENDICULAIRE au sens de passe (axe long de la pièce) : les iso-lignes
  // sont les profils verticaux qui suivent la surface en Z (montées/descentes).
  // Toute la machinerie est réutilisée (marching, chaînage, couverture, zones,
  // stitch fam:'par', sens opposé).
  {
    let bx0=1/0,bx1=-1/0,by0=1/0,by1=-1/0;
    for(let i=0;i<mesh.v.length;i++){const v=mesh.v[i];
      if(v[0]<bx0)bx0=v[0];if(v[0]>bx1)bx1=v[0];
      if(v[1]<by0)by0=v[1];if(v[1]>by1)by1=v[1];}
    // 2026-10-13-007 : DIRECTION des passes (op.pdir : 'auto' = axe long,
    // 'x', 'y', 'ang' = angle op.pdirAng en degrés). Champ = coordonnée le
    // long de la PERPENDICULAIRE au sens de passe : les iso-lignes sont les
    // profils qui courent en (pdx,pdy).
    let pdx=1,pdy=0;
    const pm=o.pdir||'auto';
    if(pm==='x'){pdx=1;pdy=0;}
    else if(pm==='y'){pdx=0;pdy=1;}
    else if(pm==='ang'&&isFinite(+o.pdirAng)){
      // Snap cardinal : ang=90 donne exactement (0,1) comme 'y' (pas de
      // résidu cos90°≈6e-17 — déterminisme + cache).
      const pa=(+o.pdirAng)*Math.PI/180;
      let cx=Math.cos(pa), sy=Math.sin(pa);
      if(Math.abs(cx)<1e-9)cx=0; else if(Math.abs(Math.abs(cx)-1)<1e-9)cx=cx<0?-1:1;
      if(Math.abs(sy)<1e-9)sy=0; else if(Math.abs(Math.abs(sy)-1)<1e-9)sy=sy<0?-1:1;
      pdx=cx;pdy=sy;
    }
    else if((bx1-bx0)<(by1-by0)){pdx=0;pdy=1;}
    const pnx=-pdy, pny=pdx;
    const pf=new Float64Array(mesh.v.length);
    let omin=1/0,omax=-1/0;
    for(let i=0;i<mesh.v.length;i++){
      const c=pnx*mesh.v[i][0]+pny*mesh.v[i][1];
      pf[i]=c; if(c<omin)omin=c; if(c>omax)omax=c;
    }
    if(omin<=omax){
      for(let off=omin;off<=omax+1e-9;off+=step){
        zoneTag={fam:'par',lvl:off};emitLevel(pf,off,null,null);
      }
      zoneTag=null;
    }
  }
  // --- phase d'émission : une entrée + une sortie par zone -----------------
  // 2026-10-13-007 : DIAG embarqué (fond nu : quelle phase est morte ?) —
  // compté sur les zones taggées, lu par la fiche op via op.geoDiag (hors
  // sig : donnée dérivée, comme geoBlocked).
  const faoDiag={slope:0,plate:0,par:0,rest:0,chains:0,flat:G.hasFlat?1:0,anySlope:G.anySlope?1:0};
  for(let zdi=0;zdi<zones.length;zdi++){const ztg=zones[zdi].tag;
    const zf=ztg&&ztg.fam;
    if(zf==='slope')faoDiag.slope++;else if(zf==='plate')faoDiag.plate++;
    else if(zf==='par')faoDiag.par++;else faoDiag.rest++;
    faoDiag.chains+=zones[zdi].chains.length;}
  try{moves.diag=faoDiag;}catch(e){}
  const margin=Math.max(1,D*0.2);
  // Colonnes de liaison par hauteur H (2026-10-13-001, remontées courtes) :
  // le repli valide un chemin à une hauteur H ≠ travel — même colonne ombre
  // tranchée à H-R (portée du métal sous le centre) jusqu'au sommet du
  // maillage, mémoïsée par H et partagée entre zones — et, depuis
  // 2026-10-13-002, entre générations (cache global faoColCache).
  let colMap=faoColCache.get(mesh);
  if(!colMap){colMap=new Map();faoColCache.set(mesh,colMap);}
  const segsFor=function(H){
    // Clé = plage de plans réellement lue (H−R, zmax] arrondie au µm.
    const key=Math.round((H-R)*1000)/1000+'|'+Math.round(zmax*1000)/1000;
    let s=colMap.get(key);
    if(!s){
      s=[];
      const pls=faoShadowPlanes(mesh,H-R,zmax);
      for(let k=0;k<pls.length;k++){
        const q=faoSliceZCached(mesh,pls[k]);
        if(q.length)s=s.concat(q);
      }
      if(colMap.size>=128)colMap.clear();
      colMap.set(key,s);
    }
    return s;
  };
  // Distance XY d'un point au matériau d'une colonne (0 = dedans) — miroir
  // de faoDiscClear avec hr=0 (parité + distance au contour). 2026-10-13-002 :
  // via l'index Y+hash (faoDiscIdx/faoDistSeg) — la colonne empilée pèse des
  // dizaines de milliers de segments et chaque liaison/spline/entrée
  // l'interroge des centaines de fois (le balayage linéaire totalisait ~9 s
  // sur une pièce 38k tris). Bornage R+2 : TOUS les consommateurs ne
  // comparent qu'à des seuils ≤ R (>1e-9, ≥need=R−0,5, min(R,·)) — une
  // distance > R+2 leur est strictement équivalente.
  const ptCap=R+2;
  const ptDistS=function(segs,x,y){
      const idx=faoDiscIdx(segs);
      if(idx&&idx.rows.length){
        let b=Math.floor((y-idx.y0)/idx.step);
        if(b<0)b=0; else if(b>=idx.n)b=idx.n-1;
        const row=idx.rows[b];
        let left=0;
        if(row)for(let t=0;t<row.length;t+=5){
          const ay=row[t+1],by=row[t+2];
          if((ay-y)*(by-y)<=0&&ay!==by&&row[t]+row[t+3]*(y-ay)/(by-ay)<x-1e-9)left++;
        }
        if((left%2)===1)return 0;
        const d=faoDistSeg(idx.H,x,y,ptCap);
        return d===1/0?ptCap:d;
      }
      const xs=[];
      for(let i=0;i<segs.length;i++){const s=segs[i];
        if((s[1]-y)*(s[3]-y)<=0&&s[1]!==s[3])
          xs.push(s[0]+(s[2]-s[0])*(y-s[1])/(s[3]-s[1]));}
      xs.sort(function(a,b){return a-b;});
      let left=0;
      for(let i=0;i<xs.length;i++)if(xs[i]<x-1e-9)left++;
      if((left%2)===1)return 0;
      let dmin=1/0;
      for(let i=0;i<segs.length;i++){const s=segs[i];
        const ax=s[0],ay=s[1],ex=s[2]-s[0],ey=s[3]-s[1],L2=ex*ex+ey*ey;
        let u=L2>0?((x-ax)*ex+(y-ay)*ey)/L2:0; if(u<0)u=0; else if(u>1)u=1;
        const px=ax+u*ex-x,py=ay+u*ey-y,d2=px*px+py*py;
        if(d2<dmin)dmin=d2;}
      return Math.sqrt(dmin);
  };
  let prevEnd=null; // dernier point émis + tangente (liaison inter-zones par spline)
  let lastSense=1; // 2026-10-13-007 : SENS OPPOSÉ (bidir façon Fusion) — sens
  // de la dernière chaîne émise (+1/-1), pour alterner le sens de coupe.
  for(let zi=0;zi<zones.length;zi++){
    const Z=zones[zi];
    // Z de liaison : au-dessus des coupes de la zone, sous secu quand possible.
    const travel=Math.max(Z.zmax,Math.min(secu,Z.zmax+margin));
    const ptDist=function(x,y){return ptDistS(segsFor(travel),x,y);};
    const pathOKh=function(p,q,H){
      const segs=segsFor(H);
      // La liaison ne doit jamais être PIÈRE que les points de coupe qu'elle
      // relie (offsets en normales de sommet fondues : le liseré peut situer
      // sous l'enveloppe) : seuil = min(R, distance réelle des extrémités).
      const d0=ptDistS(segs,p.x,p.y), d1=ptDistS(segs,q.x,q.y);
      if(!(d0>1e-6&&d1>1e-6))return false;
      const rr=Math.max(0.01,Math.min(R,d0,d1)-1e-3);
      const dx=q.x-p.x,dy=q.y-p.y,Ln=Math.sqrt(dx*dx+dy*dy);
      const n=Math.max(1,Math.ceil(Ln));
      for(let i=0;i<=n;i++){
        const t=i/n;
        if(!faoDiscClear(segs,p.x+dx*t,p.y+dy*t,0,rr))return false;
      }
      return true;
    };
    const pathOK=function(p,q){return pathOKh(p,q,travel);};
    const chainTol=Math.max(1e-4,step*0.02);
    // 2026-10-12-002 : LIAISON PAR SPLINE TANGENTE entre deux chaînes d'une
    // même zone (demande : splines X/Y/Z tangentes aux bouts, façon Fusion
    // 360). Validation par échantillon : (1) jamais de matière AU-DESSUS
    // (sections vertex de la colonne au-dessus du niveau de la zone) ;
    // (2) jamais sous la bande [min(z), max(z)] des deux bouts ; (3) dans
    // l'air, jamais plus bas que le niveau des deux bouts. Échec = 1 retry
    // avec tangentes réduites ×0,5 (moins de dépassement), puis repli lift.
    // Émission HYBRIDE : échantillon SUR la matière (ptDist=0) = coupe G1
    // (liaison coupante continue : tond les festons entre deux passes
    // voisines — DÉSACTIVÉ si laisse>0, on ne touche pas la matière
    // laissée) ; échantillon dans l'air = rapide G0.
    let spPl=null;
    const splinePlanes=function(){
      if(!spPl){
        spPl=[];
        // SÉCURITÉ : on ne garde que les plans STRICTEMENT au-dessus du niveau
        // de coupe des chaînes de la zone (au-dessus de zmax de la zone) — le
        // plan de coupe lui-même (le plateau) n'est PAS un obstacle : la fraise
        // y est censée reposer (liaison coupante sur la matière finie).
        const pls=faoShadowPlanes(mesh,Z.zmax+0.05,zmax);
        for(let k=0;k<pls.length;k++){
          const s2=faoSliceZCached(mesh,pls[k]);
          if(s2.length)spPl.push({z:pls[k],segs:s2});
        }
      }
      return spPl;
    };
    const splineEmit=function(from,tx,ty,pz,T0,l0,T1,l1,slide){
      if(!(L<=1e-9))return null; // laisse>0 : rien à tondre — lift sûr
      if(o.spline===false)return null; // échappatoire (tests / comparaison)
      const p0={x:from.x,y:from.y,z:from.z};
      const p1={x:tx,y:ty,z:pz};
      const chord=Math.hypot(p1.x-p0.x,p1.y-p0.y,p1.z-p0.z);
      if(!(chord>0.2))return null; // bout à bout : lift (ou continue)
      // Profondeur de coupe actif : une liaison en AIR ne doit jamais plonger
      // sous ce seuil (sinon la fraise entamerait le matériau restant d'un
      // coup non voulu). Pour une boule, la portée de coupe = Rc (rayon boule) ;
      // on garde 0,5 mm de marge. Le test "au-dessus des extrémités" (zFloor)
      // était trop strict : il rejetait toute liaison en air entre deux passes
      // de même cote — c'est le cas normal sur un plateau (annulus).
      const zFloor=Math.min(p0.z,p1.z)-(Rc+0.5);
      const zLo=Math.min(p0.z,p1.z)-0.05;
      const pl=slide?[]:splinePlanes(); // slide : pas de check « matière au-dessus »
      // Validation par échantillon : z ≥ zLo, jamais de matière AU-DESSUS
      // (sections des colonnes à une cote strictement supérieure), air jamais
      // sous la portée de coupe. Partagée par les 3 tentatives et par la
      // re-validation des corde fusionnées.
      // 2026-10-13-006 : slide=1 → pl=[] → le check « matière au-dessus » est
      // neutralisé (les extrémités SONT sur la surface, elles ont forcément
      // de la matière au-dessus — le check les rejetait et forçait le lift).
      const sampleOK=function(x,y,z){
        if(z<zLo)return false;
        for(let q=0;q<pl.length;q++){
          if(pl[q].z<=z+0.05)continue;
          if(faoDiscClear(pl[q].segs,x,y,0,0.001)===false)return false;
        }
        if(ptDist(x,y)>1e-9&&z<zFloor)return false;
        return true;
      };
      const validate=function(spts){
        for(let k=0;k<spts.length;k++)
          if(!sampleOK(spts[k].x,spts[k].y,spts[k].z))return false;
        return true;
      };
      const chordOK=function(A,B){
        const n=Math.max(1,Math.ceil(Math.hypot(B.x-A.x,B.y-A.y,B.z-A.z)/0.5));
        for(let k=1;k<n;k++){
          const t=k/n;
          if(!sampleOK(A.x+(B.x-A.x)*t,A.y+(B.y-A.y)*t,A.z+(B.z-A.z)*t))
            return false;
        }
        return true;
      };
      // 2026-10-13-003 : FUSION DES ÉCHANTILLONS AIR — un run consécutif
      // d'échantillons G0 devient quelques rapides DIRECTS (ajustement
      // gourmand) : corde la plus longue possible, re-validée au gabarit
      // 0,5 mm ET bornée à 0,5 mm de la courbe (les liaisons droites — type
      // diagonale de plateau — s'aplatissent en 1 G0 ; les courbes — type
      // transitions Fusion tangentes — gardent leur forme avec peu de
      // segments). Échec corde = échantillon par échantillon (validés).
      const emitMerged=function(spts){
        // Distance point/segment (bornage de forme de la corde).
        const devOK=function(A,B,k){
          const s=spts[k],ax=A.x,ay=A.y,az=A.z;
          const ex=B.x-ax,ey=B.y-ay,ez=B.z-az;
          const L2=ex*ex+ey*ey+ez*ez;
          let t=L2>0?((s.x-ax)*ex+(s.y-ay)*ey+(s.z-az)*ez)/L2:0;
          if(t<0)t=0; else if(t>1)t=1;
          const dx=ax+ex*t-s.x,dy=ay+ey*t-s.y,dz=az+ez*t-s.z;
          return dx*dx+dy*dy+dz*dz<=0.25; // 0,5 mm
        };
        let i0=1;
        while(i0<spts.length){
          const r0=ptDist(spts[i0].x,spts[i0].y)<=1e-9?0:1;
          let i1=i0;
          while(i1+1<spts.length&&
            (ptDist(spts[i1+1].x,spts[i1+1].y)<=1e-9?0:1)===r0)i1++;
          if(r0===1){
            let a=i0-1; // la corde part de la position courante
            while(a<i1){
              let b=a+1;
              while(b+1<=i1&&chordOK(spts[a],spts[b+1])){
                let dOK=true;
                for(let k=a+1;k<=b+1;k++)if(!devOK(spts[a],spts[b+1],k)){dOK=false;break;}
                if(!dOK)break;
                b++;
              }
              moves.push({r:1,tr:1,x:spts[b].x,y:spts[b].y,z:spts[b].z});
              a=b;
            }
          }else{
            for(let k=i0;k<=i1;k++){const s=spts[k];
              moves.push({r:0,tr:1,x:s.x,y:s.y,z:s.z});}
          }
          i0=i1+1;
        }
        return spts[spts.length-1].z;
      };
      const s0=Math.min(chord/3,0.9*(l0||0));
      const s1=Math.min(chord/3,0.9*(l1||0));
      for(let att=0;att<4;att++){
        let spts;
        if(att<3){
          // att 0/1 : tangente 3D pleine puis demi (moins de dépassement).
          // att 2 : RAMP-SPLINE (2026-10-13-003, demande « transitions type
          // Fusion ») — tangentes XY conservées (bulbe tangent aux deux
          // passes), Z composante nulle : le profil Z est un smoothstep entre
          // les deux cotes, strictement dans [min,max] → plus de creux sous
          // zLo, la liaison rattrape la plupart des cas qui tombaient en lift.
          // Atterrissage à la cote de coupe au début de chaîne (vert continu).
          const sc=att===1?0.5:1, flat=att>=2;
          spts=faoSplinePts(p0,
            {x:(T0?T0.x:0)*s0*sc,y:(T0?T0.y:0)*s0*sc,z:flat?0:(T0?T0.z:0)*s0*sc},
            p1,{x:T1.x*s1*sc,y:T1.y*s1*sc,z:flat?0:T1.z*s1*sc},Math.ceil(chord/0.5));
          if(!spts)break;
        }else{
          // att 3 : SPLINE PLATE à z = travel — Hermite XY (Z neutralisé) à
          // cote constante : colonne au-dessus de travel quasi vide, validation
          // toujours OK. Atterrissage à travel → ramp0 (descente le long du
          // 1er tronçon) ; repli lift à secu si travel est déjà à secu.
          const zP=Math.max(p0.z,p1.z,travel);
          if(zP>=secu-1e-9)break;
          p0.z=zP; p1.z=zP;
          spts=faoSplinePts(p0,
            {x:(T0?T0.x:0)*s0,y:(T0?T0.y:0)*s0,z:0},
            p1,{x:T1.x*s1,y:T1.y*s1,z:0},Math.ceil(chord/0.5));
          if(!spts)break;
        }
        if(!validate(spts)){
          if(typeof FAO_DEBUG_SLIDE!=='undefined'&&FAO_DEBUG_SLIDE){
            let bad=-1;
            for(let k=0;k<spts.length;k++)if(!sampleOK(spts[k].x,spts[k].y,spts[k].z)){bad=k;break;}
            console.log('SPLINE FAIL att='+att+' chord='+chord.toFixed(1)+' bad@'+bad+'/'+spts.length+
              ' p0z='+p0.z.toFixed(1)+' p1z='+p1.z.toFixed(1)+
              (bad>=0?' at('+spts[bad].x.toFixed(1)+','+spts[bad].y.toFixed(1)+','+spts[bad].z.toFixed(1)+')':'')+
              ' zLo='+zLo.toFixed(1)+' zFloor='+zFloor.toFixed(1)+' plN='+pl.length);
          }
          continue;
        }
        return emitMerged(spts);
      }
      return null;
    };
    // 2026-10-13-004 : LIGNE DROITE PRIORITAIRE (demande : « les lignes
    // droites c'est bien mieux »). Segment direct from→to, validé par
    // échantillons (MÊME contrat que la spline : z ≥ zLo, pas de matière
    // AU-DESSUS, air jamais sous portée de coupe), émission hybride fusionnée
    // (sur matière = G1 tr:1, en air = G0 tr:1 fusionné — la ligne droite
    // s'aplatit en 1 move par run). Retourne la cote d'arrivée si OK, null
    // sinon (le repli essaiera la spline puis le lift). Ne s'applique pas aux
    // entrées varc/circ/hélice (ce sont des arcs dédiés).
    const straightEmit=function(from,tx,ty,pz){
      if(!(L<=1e-9))return null;
      if(o.spline===false)return null; // échappatoire (tests / comparaison)
      const p0={x:from.x,y:from.y,z:from.z};
      const p1={x:tx,y:ty,z:pz};
      const chord=Math.hypot(p1.x-p0.x,p1.y-p0.y,p1.z-p0.z);
      if(!(chord>0.2))return null;
      const zFloor=Math.min(p0.z,p1.z)-(Rc+0.5);
      const zLo=Math.min(p0.z,p1.z)-0.05;
      const pl=splinePlanes();
      const sampleOK=function(x,y,z){
        if(z<zLo)return false;
        for(let q=0;q<pl.length;q++){
          if(pl[q].z<=z+0.05)continue;
          if(faoDiscClear(pl[q].segs,x,y,0,0.001)===false)return false;
        }
        if(ptDist(x,y)>1e-9&&z<zFloor)return false;
        return true;
      };
      const n=Math.max(2,Math.ceil(chord/0.5));
      const spts=[];
      for(let k=0;k<=n;k++){
        const t=k/n;
        const s={x:p0.x+(p1.x-p0.x)*t,y:p0.y+(p1.y-p0.y)*t,z:p0.z+(p1.z-p0.z)*t};
        if(!sampleOK(s.x,s.y,s.z)){
          if(typeof FAO_DEBUG_SLIDE!=='undefined'&&FAO_DEBUG_SLIDE)
            console.log('STRAIGHT FAIL k='+k+'/'+n+' at('+s.x.toFixed(1)+','+s.y.toFixed(1)+','+s.z.toFixed(1)+') zLo='+zLo.toFixed(1)+' zFloor='+zFloor.toFixed(1)+' ptDist='+ptDist(s.x,s.y).toFixed(2)+' plN='+pl.length);
          return null;
        }
        spts.push(s);
      }
      // Émission : ligne droite = chaque run matière/air = 1 move direct.
      let prevType=null;
      for(let k=1;k<spts.length;k++){
        const s=spts[k];
        const typ=ptDist(s.x,s.y)<=1e-9?0:1;
        if(typ!==prevType||k===spts.length-1){
          moves.push({r:typ,tr:1,x:s.x,y:s.y,z:s.z});
          prevType=typ;
        }
      }
      return spts[spts.length-1].z;
    };
    // Point visé par l'approche d'une chaîne : centre d'hélice (si autorisé) ou
    // point ~2D le long du tracé — la rampe descend ensuite en diagonale de pk
    // jusqu'au début (jamais de plongée verticale).
    const candLink=function(pts0i,n0){
      let pts=pts0i;
      // 2026-10-13-003 : chaîne grossière (1er tronçon > 2D sans point iso) —
      // insertion d'un point interpolé À 2D : l'attaque lift/diagonale se fait
      // le long de la chaîne, pas à l'autre bout (saut de 40 mm sinon). Point
      // collinéaire : le tracé de coupe est identique.
      if(pts.length>1){
        const d1=Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y,pts[1].z-pts[0].z);
        if(d1>2*D+1e-6){
          const t=(2*D)/d1;
          pts=pts.slice();
          pts.splice(1,0,{x:pts[0].x+(pts[1].x-pts[0].x)*t,
                            y:pts[0].y+(pts[1].y-pts[0].y)*t,
                            z:pts[0].z+(pts[1].z-pts[0].z)*t});
        }
      }
      const here=pts[0];
      let pk=0,acc=0;
      for(let i=1;i<pts.length;i++){
        const d=Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y);
        if(acc+d>=2*D&&i>1)break;
        acc+=d; pk=i;
        if(acc>=2*D)break;
      }
      let hx=null,hr=0,planesE=null;
      if(mode!=='ramp'&&n0[2]<=0.5&&Math.hypot(n0[0],n0[1])>0.05){
        hr=Math.max(0.5,Math.min(D*0.4,3));
        const nlxy=Math.hypot(n0[0],n0[1]);
        const off=hr+R+0.5;
        const cx=here.x+n0[0]/nlxy*off, cy=here.y+n0[1]/nlxy*off;
        planesE=faoShadowPlanes(mesh,here.z-R,zmax);
        const segsE=[];
        for(let k=0;k<planesE.length;k++){
          const s=faoSliceZCached(mesh,planesE[k]);
          if(s.length)segsE.push.apply(segsE,s);
        }
        if(faoDiscClear(segsE,cx,cy,hr,R))hx={x:cx,y:cy};
      }
      return {pts:pts,pk:pk,hx:hx,hr:hr,planesE:planesE,
              pt:hx?hx:{x:pts[pk].x,y:pts[pk].y}};
    };
    for(let ci=0;ci<Z.chains.length;ci++){
      const C=Z.chains[ci];
      let curSense=1; // sens de CETTE chaîne (+1 naturel, -1 si la sélection l'inverse — sens opposé 2026-10-13-007)
      if(ci>0||(ci===0&&prevEnd)){
        // Chaîne (fermée : tous les démarrages × 2 sens ; ouverte : droit ou
        // inversé) choisie pour QUE la liaison depuis la chaîne précédente
        // reste dans le vide : tous les candidats évalués au pathOK, on garde
        // un passage bas (sinon le plus court — repli via secu émis plus bas).
        // 2026-10-13-001 : ÉGALEMENT en tête de zone (ci===0&&prevEnd) —
        // l'extrémité la plus proche du tracé suivant, sinon la liaison
        // inter-zones partait de l'about arbitraire (~40 mm de saut).
        // 2026-10-13-007 : STITCHABILITÉ (pas de suivi du brut : le G1 direct
        // est sûr par proximité surface) — niveaux adjacents même famille :
        // la liaison sera un stitch SANS validation, donc le `ok` (colonne
        // matière : pics d'autres zones) ne doit pas écarter le plus proche
        // au profit d'un saut lointain-mais-dégagé.
        const from=ci>0?Z.chains[ci-1].pts[Z.chains[ci-1].pts.length-1]:prevEnd;
        const stPrev=(ci>0)?(Z.tag||null):((zi>0&&zones[zi-1])?zones[zi-1].tag:null);
        const stCur=Z.tag||null;
        const stTags=stPrev&&stCur&&stPrev.fam===stCur.fam&&
          (stPrev.fam==='slope'||stPrev.fam==='plate'||stPrev.fam==='par')&&
          Math.abs(stCur.lvl-stPrev.lvl)<=step*1.5+1e-9;
        const n0=C.n0,pts0=C.pts;
        const closed=pts0.length>3&&
          Math.hypot(pts0[0].x-pts0[pts0.length-1].x,pts0[0].y-pts0[pts0.length-1].y,pts0[0].z-pts0[pts0.length-1].z)<chainTol;
        const cands=[];
        if(closed){
          // 2026-10-13-005 : FENÊTRE de candidats au lieu de TOUS les points
          // — O(n²) → O(n·W). On cherche le point le plus proche de `from`
          // puis on teste une fenêtre de ±W points autour (2 sens). W borné
          // pour garder la qualité de sélection sans exploser le temps.
          const W=Math.min(24,Math.max(4,Math.floor(pts0.length/6)));
          let bi=0,bd=1/0;
          for(let k=0;k<pts0.length-1;k++){
            const d=Math.hypot(pts0[k].x-from.x,pts0[k].y-from.y);
            if(d<bd){bd=d;bi=k;}
          }
          for(let k=bi-W;k<=bi+W;k++){
            const kk=((k%(pts0.length-1))+(pts0.length-1))%(pts0.length-1);
            cands.push([kk,1]);cands.push([kk,-1]);
          }
        }
        else{cands.push([0,1]);cands.push([0,-1]);}
        let best=null, bestAlt=null, bestNear=null;
        for(let t=0;t<cands.length;t++){
          const c=cands[t];
          let pts;
          if(c[1]===1)pts=c[0]>0?pts0.slice(c[0]).concat(pts0.slice(1,c[0])):pts0.slice();
          else{const rv=pts0.slice().reverse();pts=c[0]>0?rv.slice(c[0]).concat(rv.slice(1,c[0])):rv;}
          const I=candLink(pts,n0);
          const ok=pathOK(from,I.pt);
          // 2026-10-13-003 : mesure vers le VRAI point d'attaque (hx ou début
          // de chaîne) et non vers I.pt (pts[pk] ≈ 2D le long de la chaîne) —
          // sur chaînes échantillonnées grossièrement pk tombe à l'opposé du
          // début, la sélection inversait le sens et fabriquait des diagonales
          // de 40 mm au lieu du saut de 6 mm entre passes voisines.
          const axc=I.hx?I.hx.x:pts[0].x, ayc=I.hx?I.hx.y:pts[0].y;
          const len=Math.hypot(axc-from.x,ayc-from.y);
          if(!best||((ok?0:1)<(best.ok?0:1))||(ok===best.ok&&len<best.len))
            best={pts:pts,ok:ok,len:len,sense:c[1]};
          // 2026-10-13-007 : SENS OPPOSÉ (bidir façon Fusion, cav.txt passes
          // 2/3 en -Y puis +Y) — mémorise le meilleur candidat en sens alterné.
          if(c[1]===-lastSense&&(!bestAlt||((ok?0:1)<(bestAlt.ok?0:1))||(ok===bestAlt.ok&&len<bestAlt.len)))
            bestAlt={pts:pts,ok:ok,len:len,sense:c[1]};
          if(!bestNear||len<bestNear.len)bestNear={pts:pts,len:len,sense:c[1]};
        }
        // G1 direct : proximité PURE quand stitchable (le stitch revérifie le
        // gap exact ; sinon repli validé — jamais de G1 non prouvé).
        // Alternance (bidir) sinon, proximité sinon. Inactive en 'avalant'.
        let pick=best;
        if(stTags&&bestNear&&bestNear.len<step*2)pick=bestNear;
        else if(sensBidir&&best&&bestAlt&&bestAlt.ok===best.ok&&bestAlt.len<=best.len*1.5+step)pick=bestAlt;
        if(pick){C.pts=pick.pts;curSense=pick.sense;}
      }
      const I=candLink(C.pts,C.n0);
      const pts=I.pts,here=pts[0],pk=I.pk,hx=I.hx,hr=I.hr,planesE=I.planesE;
      // 2026-10-08-004 : ENTRÉE CIRCULAIRE — arc tangent au début de chaîne.
      // Validité : le centre reste sur l'air de la colonne (matière à ≥ R-0.5,
      // miroir du contrôle des liaisons) ; ancre exigée (coupe antérieure à
      // ≤ D/2 de S) pour que la descente verticale soit dans le vide. Échec →
      // repli historique (hélice si slot, rampe, plongeon le long du tracé).
      // 2026-10-13-001 : ARC VERTICAL en priorité (varc) — quart de cercle dans le
      // PLAN VERTICAL du sens de coupe {u, Z}, centre (here.xy, travel),
      // de A (ρ = travel-here.z en amont du début de chaîne, hauteur travel)
      // jusqu'au début de chaîne. Pied de fraise toujours au-dessus de la
      // surface (décolle ρ au-dessus, contact exact au tracé) : ni groove XY
      // hors passes, ni plongée verticale en S sur matière existante
      // (demande : « des arcs suivant les plans XZ ou YZ »). Validité :
      // ρ ≥ 0,5 et colonne de liaison qui dégage R-0,5 sur A + 6 échantillons
      // du balayage — sinon repli arc XY, hélice, rampe.
      // 2026-10-13-006 : SLIDE INTER-TRACES — quand on glisse d'une trace vers
      // la trace inférieure juste en dessous (ΔZ significatif ET trace
      // précédente existante), on SAUTE le varc/circ (lift + arc vertical) :
      // la spline smoothstep glisse directement le long de la surface.
      let slideDZ=0;
      {
        const fromSlide=(ci>0?Z.chains[ci-1].pts[Z.chains[ci-1].pts.length-1]:prevEnd);
        if(fromSlide)slideDZ=Math.abs(fromSlide.z-here.z);
      }
      const slideLink=slideDZ>Math.max(0.1,step*0.15);
      let circ=null, varc=null;
      if(mode==='circ'&&pts.length>1&&!slideLink){
        const rhoV=travel-here.z;
        const dvx=pts[1].x-here.x, dvy=pts[1].y-here.y, lXY=Math.hypot(dvx,dvy);
        if(rhoV>=0.5&&lXY>1e-9){
          const uvx=dvx/lXY, uvy=dvy/lXY, need=Math.max(0.01,R-0.5);
          let okV=true;
          for(let k=0;k<=6&&okV;k++){
            const sw=Math.cos((k/6)*Math.PI/2)*rhoV;
            if(ptDist(here.x-uvx*sw,here.y-uvy*sw)<need)okV=false;
          }
          if(okV)varc={ax:here.x-uvx*rhoV,ay:here.y-uvy*rhoV,rho:rhoV,ux:uvx,uy:uvy};
        }
        if(!varc){
          // 2026-10-08-005 : rayons candidats (pas des iso = candidat) + disque
          // outil entièrement hors matière restante (air = ptDist > 0 ;
          // couverture par les passes iso antérieures à cote ≤ z sinon repli).
          const rhoG=faoCircRhos(D,step,o.entryR);
          const need=Math.max(0.01,R-0.5);
          circ=faoCircEval(here.x,here.y,pts[1].x-here.x,pts[1].y-here.y,rhoG,
            function(x,y){ return ptDist(x,y)>=need; },
            moves,here.z,D,true,
            function(x,y){ return ptDist(x,y)>1e-9; });
        }
      }
      const ax=varc?varc.ax:(circ?circ.sx:(hx?hx.x:pts[pk].x)),
            ay=varc?varc.ay:(circ?circ.sy:(hx?hx.y:pts[pk].y));
      let startZ, linkSpline=false;
      if(ci===0&&prevEnd){
        // Liaison INTER-ZONES (2026-10-13-004) : LIGNE DROITE d'abord —
        // segment direct s'il dégage (demande « les lignes droites c'est bien
        // mieux »), spline tangente seulement si la ligne est bloquée, lift
        // COURT (travel/H, secu en dernier) en dernier repli.
        const from=prevEnd;
        let startZs=null;
        const l0=prevEnd.l0||0;
        const l1=pts.length>1?Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y,pts[1].z-pts[0].z):0;
        const T0=prevEnd.T||null;
        const T1=l1>1e-9?{x:(pts[1].x-pts[0].x)/l1,y:(pts[1].y-pts[0].y)/l1,z:(pts[1].z-pts[0].z)/l1}:{x:1,y:0,z:0};
        if(varc){
          // Cible = A (début de l'arc vertical) à sa cote travel, arrivée
          // tangente −Z (la fraise plonge dans l'arc depuis A).
          startZs=splineEmit(from,varc.ax,varc.ay,here.z+varc.rho,T0,l0,
            {x:0,y:0,z:-1},l1);
        }else if(circ){
          const rsx=circ.sx-circ.cx,rsy=circ.sy-circ.cy;
          const lA=Math.hypot(rsx,rsy)||1;
          const TA=circ.cw?{x:rsy/lA,y:-rsx/lA,z:0}:{x:-rsy/lA,y:rsx/lA,z:0};
          startZs=splineEmit(from,circ.sx,circ.sy,here.z,T0,l0,TA,l1||lA);
        }else{
          // 2026-10-13-007 : STITCH SPIRAL inter-zones (façon Fusion : 7 passes
          // continues, 6 micro-liaisons) — niveaux iso-Z / anneaux plateau
          // CONSECUTIFS (même fam, |Δlvl| ≤ 1.5*step) : G1 direct SANS
          // validation quand le gap 3D < 2*step. Les niveaux consécutifs d'une
          // même famille sont adjacents par construction ; la chord reste au
          // contact (déviation négligeable à pas fin). tr:1 = séparateur de
          // passes. Respecte o.spline:false ET laisse>0.
          const dStitch=Math.hypot(here.x-from.x,here.y-from.y,here.z-from.z);
          const pTagS=(zi>0&&zones[zi-1])?zones[zi-1].tag:null;
          const cTagS=Z.tag||null;
          const stitchFam=pTagS&&cTagS&&pTagS.fam===cTagS.fam&&
            (pTagS.fam==='slope'||pTagS.fam==='plate'||pTagS.fam==='par')&&
            Math.abs(cTagS.lvl-pTagS.lvl)<=step*1.5+1e-9;
          if(o.spline!==false&&L<=1e-9&&stitchFam&&dStitch<step*2){
            moves.push({r:0,tr:1,x:here.x,y:here.y,z:here.z});
            startZs=here.z;
          }else{
          // 2026-10-13-006 : LIAISON COURTE AU CONTACT inter-zones (idem
          // intra) — zones adjacentes très proches (distance ET ΔZ < step/2) :
          // G1 direct sans lift. Au-delà, on laisse spline/straight/rapid
          // gérer (les transitions step-over normales restent des liaisons
          // validées). tr:1 marque la transition. Respecte o.spline:false
          // ET laisse>0.
          const dLink=Math.hypot(here.x-from.x,here.y-from.y,here.z-from.z);
          const dZlink=Math.abs(from.z-here.z);
          if(o.spline!==false&&L<=1e-9&&dLink<step*0.6&&dZlink<step*0.5){
            moves.push({r:0,tr:1,x:here.x,y:here.y,z:here.z});
            startZs=here.z;
          }else if(dZlink>Math.max(0.1,step*0.15)){
            // SUR PENTE (ΔZ ≠ 0 entre les bouts) la corde droite coupe en
            // DIAGONALE au-dessus de la surface → longue ligne rouge. On
            // préfère la SPLINE (smoothstep Z, tangente aux 2 passes) qui suit
            // la surface ; la ligne droite reste le repli si la spline échoue.
            startZs=splineEmit(from,here.x,here.y,here.z,T0,l0,T1,l1,true);
            if(startZs===null)startZs=straightEmit(from,here.x,here.y,here.z);
          }else{
            startZs=straightEmit(from,here.x,here.y,here.z);
            if(startZs===null)startZs=splineEmit(from,here.x,here.y,here.z,T0,l0,T1,l1,true);
          }
          }
        }
        if(startZs!==null){startZ=startZs;linkSpline=true;}
        else{
          // Repli 2026-10-13-001 : remontée COURTE — travel si le chemin est
          // clair, sinon H = max(from.z, Z.zmax)+5 (borné secu) validée par
          // pathOKh à sa propre altitude, sinon secu (historique).
          // 2026-10-13-007 : MICRO-LIFT façon Fusion (cav.txt T0-T5 : +5 mm
          // local, 3 blocs) essayé AVANT travel — lift minimal au-dessus des
          // deux bouts, validé par pathOKh à sa propre altitude. Écrase les
          // grands verticaux rouges en petits sauts locaux.
          let lz=secu;
          const microM=Math.min(secu,Math.max(from.z,here.z)+5);
          if(microM>Math.max(from.z,here.z)+0.5&&pathOKh(from,{x:ax,y:ay},microM))lz=microM;
          else if(pathOK(from,{x:ax,y:ay}))lz=travel;
          else{
            const H=Math.max(travel,Math.min(secu,Math.max(from.z,Z.zmax)+5));
            if(H>travel&&H<secu&&pathOKh(from,{x:ax,y:ay},H))lz=H;
            else{
              // 2026-10-13-003 : 2e échelon au Zmax GLOBAL — segsFor lit le
              // maillage entier : les pics d'une autre zone rendent la colonne
              // de H1 non vide et le segment droit échoue → secu inutile. Au-
              // dessus de tout le maillage la colonne est vide (validation
              // toujours OK) → vol à zmax+5 au lieu de secu.
              const H2=Math.max(travel,Math.min(secu,Math.max(from.z,zmax)+5));
              if(H2>travel&&H2<secu&&H2!==H&&pathOKh(from,{x:ax,y:ay},H2))lz=H2;
            }
          }
          if(Math.abs(from.z-lz)>1e-9)moves.push({r:1,x:from.x,y:from.y,z:lz});
          moves.push({r:1,x:ax,y:ay,z:lz});
          startZ=lz;
        }
      }else if(ci===0){
        // Début de programme : rapide à secu vers le point d'attaque.
        moves.push({r:1,x:ax,y:ay,z:secu});
        startZ=secu;
        // 2026-10-13-007 : POINTE ATTENDUE AU DÉPART (façon Fusion cav.txt
        // N65-N85 : G0 XY, G0 down, puis G1 court) — descente RAPIDE jusqu'au
        // spot (haut de matière sous le disque outil + 2, colonne d'air
        // vérifiée par faoHelixSpot) : les entrées G1 ne font que le court
        // final au lieu de descendre depuis secu en air.
        try{
          const spotX=hx?hx.x:ax, spotY=hx?hx.y:ay;
          const spot0=faoHelixSpot(mesh,spotX,spotY,hx?hr:0,R,here.z,zmax,planesE);
          const zSpot=Math.min(secu,isFinite(spot0)?spot0:secu);
          if(zSpot<secu-1e-9){moves.push({r:1,x:spotX,y:spotY,z:zSpot});startZ=zSpot;}
        }catch(e){}
      }else{
        // Liaison intra-zone (2026-10-13-004) : LIGNE DROITE d'abord —
        // segment direct s'il dégage (demande « les lignes droites c'est bien
        // mieux »), spline tangente seulement si la ligne est bloquée, lift
        // Z / secu en dernier repli (jamais de traversée de la pièce à basse
        // altitude non prouvée). La liaison rejoint le point d'attaque :
        // S de l'arc circ (tangente = perpauvre au rayon, sens cw) ou le
        // début de chaîne — hélice et approche mid-trace (pk≥1) gardent le
        // lift (descente d'air dédiée).
        const prev=Z.chains[ci-1],from=prev.pts[prev.pts.length-1];
        let startZs=null;
        const l0=prev.pts.length>1?Math.hypot(from.x-prev.pts[prev.pts.length-2].x,
          from.y-prev.pts[prev.pts.length-2].y,from.z-prev.pts[prev.pts.length-2].z):0;
        const l1=pts.length>1?Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y,pts[1].z-pts[0].z):0;
        const T0=l0>1e-9?{x:(from.x-prev.pts[prev.pts.length-2].x)/l0,
                          y:(from.y-prev.pts[prev.pts.length-2].y)/l0,
                          z:(from.z-prev.pts[prev.pts.length-2].z)/l0}:null;
        const T1=l1>1e-9?{x:(pts[1].x-pts[0].x)/l1,y:(pts[1].y-pts[0].y)/l1,
                          z:(pts[1].z-pts[0].z)/l1}:{x:1,y:0,z:0};
        if(varc){
          // Cible = A (début de l'arc vertical) à sa cote travel, arrivée
          // tangente −Z (la fraise plonge dans l'arc depuis A).
          startZs=splineEmit(from,varc.ax,varc.ay,here.z+varc.rho,T0,l0,
            {x:0,y:0,z:-1},l1);
        }else if(circ){
          const rsx=circ.sx-circ.cx,rsy=circ.sy-circ.cy;
          const lA=Math.hypot(rsx,rsy)||1;
          const TA=circ.cw?{x:rsy/lA,y:-rsx/lA,z:0}:{x:-rsy/lA,y:rsx/lA,z:0};
          startZs=splineEmit(from,circ.sx,circ.sy,here.z,T0,l0,TA,l1||lA);
        }else{
          // 2026-10-13-006 : LIAISON COURTE AU CONTACT (façon Fusion 360) —
          // passes adjacentes très proches (distance ET ΔZ < step/2) : G1
          // direct au niveau de coupe SANS check « matière au-dessus ».
          // tr:1 marque la transition. Respecte o.spline:false ET laisse>0.
          const dLink=Math.hypot(here.x-from.x,here.y-from.y,here.z-from.z);
          if(o.spline!==false&&L<=1e-9&&dLink<step*0.6&&Math.abs(here.z-from.z)<step*0.5){
            moves.push({r:0,tr:1,x:here.x,y:here.y,z:here.z});
            startZs=here.z;
          }else{
            // 2026-10-13-006 : idem liaison inter-zones — spline d'abord si
            // ΔZ ≠ 0 (pente), ligne droite sinon.
            const dZlink=Math.abs(from.z-here.z);
            if(dZlink>Math.max(0.1,step*0.15)){
              startZs=splineEmit(from,here.x,here.y,here.z,T0,l0,T1,l1,true);
              if(startZs===null)startZs=straightEmit(from,here.x,here.y,here.z);
            }else{
              startZs=straightEmit(from,here.x,here.y,here.z);
              if(startZs===null)startZs=splineEmit(from,here.x,here.y,here.z,T0,l0,T1,l1,true);
            }
          }
        }
        if(startZs!==null){startZ=startZs;linkSpline=true;}
        else{
          // Repli 2026-10-13-001 : remontée COURTE — travel si le chemin est
          // clair, sinon H = max(from.z, Z.zmax)+5 (borné secu) validée par
          // pathOKh à sa propre altitude, sinon secu (historique).
          // 2026-10-13-007 : MICRO-LIFT façon Fusion (idem inter-zones) —
          // +5 mm local validé avant travel.
          let liftZ=secu;
          const microM2=Math.min(secu,Math.max(from.z,here.z)+5);
          if(microM2>Math.max(from.z,here.z)+0.5&&pathOKh(from,{x:ax,y:ay},microM2))liftZ=microM2;
          else if(pathOK(from,{x:ax,y:ay}))liftZ=travel;
          else{
            const H=Math.max(travel,Math.min(secu,Math.max(from.z,Z.zmax)+5));
            if(H>travel&&H<secu&&pathOKh(from,{x:ax,y:ay},H))liftZ=H;
            else{
              // 2026-10-13-003 : 2e échelon au Zmax GLOBAL (voir liaison
              // inter-zones) — colonne vide au-dessus de tout le maillage.
              const H2=Math.max(travel,Math.min(secu,Math.max(from.z,zmax)+5));
              if(H2>travel&&H2<secu&&H2!==H&&pathOKh(from,{x:ax,y:ay},H2))liftZ=H2;
            }
          }
          if(Math.abs(from.z-liftZ)>1e-9)moves.push({r:1,x:from.x,y:from.y,z:liftZ});
          moves.push({r:1,x:ax,y:ay,z:liftZ});
          startZ=liftZ;
        }
      }
      let skip0=false, ramp0=false;
      if(varc){
        // 2026-10-13-001 : ARC VERTICAL (quart de cercle plan {u, Z}, centre
        // (here.xy, here.z+ρ)) — descente d'air à A si la liaison a laissé la
        // fraise plus haut, puis l'arc en G1 (corde ≤ 0,5 mm : l'arc serait
        // interprété XY par le post-G17) arrive tangent +u au début de chaîne.
        // Pied de fraise au-dessus de la surface tout du long, contact exact
        // au dernier point. Jamais d'arc {i,j,cw} en entrée.
        const zA=here.z+varc.rho;
        if(startZ>zA+1e-9)moves.push({r:0,ent:1,x:varc.ax,y:varc.ay,z:zA});
        const nA=Math.max(8,Math.min(48,Math.ceil(varc.rho*3.2)));
        for(let k=1;k<=nA;k++){
          if(k===nA){moves.push({r:0,ent:1,x:here.x,y:here.y,z:here.z});break;}
          const th=(k/nA)*Math.PI/2;
          moves.push({r:0,ent:1,
            x:here.x-varc.rho*Math.cos(th)*varc.ux,
            y:here.y-varc.rho*Math.cos(th)*varc.uy,
            z:zA-varc.rho*Math.sin(th)});
        }
        skip0=true;
      }else if(circ){
        // Rapide arrivé à S (secu/travel), descente en Z à S, arc tangent.
        // 2026-10-08-005 : descente + arc étiquetés ent (tracé bleu).
        if(Math.abs(startZ-here.z)>1e-9)moves.push({r:0,ent:1,x:circ.sx,y:circ.sy,z:here.z});
        moves.push({r:0,ent:1,x:here.x,y:here.y,z:here.z,
          arc:{i:circ.cx-circ.sx,j:circ.cy-circ.sy,cw:circ.cw}});
        skip0=true;
      }else if(linkSpline&&startZ<=here.z+1e-9){
        // 2026-10-12-002 : la spline/ligne droite de liaison a déposé la fraise
        // EXACTEMENT au début de chaîne, à la cote de coupe — la chaîne part
        // directement (pas de rampe, pas de diagonale air, pas d'hélice).
        // 2026-10-13-005 : AVANT le test hx — sinon l'hélice s'exécutait même
        // quand la liaison avait déjà atterri (lift forcé sur pentes).
      }else if(linkSpline||pk<1){
        // 2026-10-08-006 : JAMAIS de plongée à plat sur le début de chaîne
        // (fraise à cheval sur le mur) — RAMPE le long du 1er tronçon : la
        // fraise descend EN SE DÉPLAÇANT sur la chaîne (centre légal
        // préservé ; aucune orbite possible sans surcoupe du mur).
        // 2026-10-13-003 : aussi l'atterrissage de la spline PLATE (startZ =
        // travel > here.z) — descente répartie le long du 1er tronçon.
        ramp0=true;
      }else if(hx){
        // Hélice : descente d'air jusqu'au spot, spirale, G1 au début de chaîne.
        // Seulement si AUCUNE liaison (straight/spline) n'a réussi — repli.
        const spot=faoHelixSpot(mesh,hx.x,hx.y,hr,R,here.z,zmax,planesE);
        const hStart=Math.min(startZ,spot);
        if(Math.abs(startZ-hStart)>1e-9)moves.push({r:0,x:hx.x,y:hx.y,z:hStart});
        const hel=faoHelixEntry(hx.x,hx.y,hStart,here.z,hr,D);
        for(let i=1;i<hel.length;i++)moves.push(hel[i]);
        moves.push({r:0,x:here.x,y:here.y,z:here.z});
      }else{
        // Rampe : diagonale en AIR au-dessus du tracé (pk -> début), z au
        // moins égale au contact local — rapide (aucune coupe) et sûre.
        for(let i=pk-1;i>=0;i--){
          const f=(pk-i)/pk;
          const lin=startZ+(here.z-startZ)*f;
          const zz=Math.max(lin,pts[i].z);
          moves.push({r:1,x:pts[i].x,y:pts[i].y,z:zz});
        }
      }
      for(let i=skip0?1:0;i<pts.length;i++){
        // 006 : 1er tronçon rampe (pk<1) — descente répartie le long du
        // segment, puis la chaîne suit à z de coupe.
        if(i===1&&ramp0&&pts.length>1&&startZ>here.z+1e-9){
          const nR=Math.max(2,Math.ceil((startZ-here.z)/2));
          for(let s=1;s<=nR;s++){
            const f=s/nR;
            moves.push({r:0,x:here.x+(pts[1].x-here.x)*f,
                              y:here.y+(pts[1].y-here.y)*f,
                              z:startZ+(here.z-startZ)*f});
          }
        }else moves.push({r:0,x:pts[i].x,y:pts[i].y,z:pts[i].z});
      }
      // Suivi du dernier point émis + tangente (liaison inter-zones par spline).
      // 2026-10-13-007 : + sens de la chaîne (sens opposé bidir).
      {
        const last=pts[pts.length-1];
        const prev2=pts.length>1?pts[pts.length-2]:null;
        const l0last=prev2?Math.hypot(last.x-prev2.x,last.y-prev2.y,last.z-prev2.z):0;
        prevEnd={x:last.x,y:last.y,z:last.z,
          T:l0last>1e-9?{x:(last.x-prev2.x)/l0last,y:(last.y-prev2.y)/l0last,z:(last.z-prev2.z)/l0last}:null,
          l0:l0last};
        lastSense=curSense;
      }
      yield moves; // 2026-10-12-002 : dessin progressif — chaîne finie
    }
    yield moves; // dessin progressif — zone finie (pas de lift secu : la
    // spline inter-zones s'en charge à la zone suivante)
  }
  // Retrait final à secu si nécessaire (fin de programme).
  if(prevEnd&&Math.abs(prevEnd.z-secu)>1e-9){
    moves.push({r:1,x:prevEnd.x,y:prevEnd.y,z:secu});
  }
  return moves;
}
function faoGenGeoFinish(mesh,o){
  // Appel SYNCHRONE (drain complet du générateur) : strictement équivalent au
  // flux — dispatch, tests, G-code et estimation ne bougent pas. Le flux
  // progressif (aperçu au fil de l'eau) passe par faoGenGeoFinishIt via
  // faoOpMovesIt (yield*), comme l'ébauche 3D 2026-10-09-005.
  const it=faoGenGeoFinishIt(mesh,o);
  let r; while(!(r=it.next()).done){}
  return r.value;
}
/* ----- mode sélection : plan de travail 3+2 sur la pièce ----- */
// Clic sur une face sortante : la normale (repère pièce) devient l'orientation
// B/C de la table via faoOrientFromNormal ; une face tournée vers le bas est
// refusée (pièce à retourner). One-shot : sortie auto après application.
let faoPlanePick=null;
function faoPlaneStart(setupId){
  try{
    if(typeof skEdit!=='undefined'&&skEdit){faceEl.textContent='Plan : fermez l\'esquisse d\'abord.';return;}
    if((typeof filMode!=='undefined'&&filMode)||(typeof filModeX!=='undefined'&&filModeX)||
       (typeof mvMode!=='undefined'&&mvMode)||(typeof draftMode!=='undefined'&&draftMode)||
       (typeof coqueMode!=='undefined'&&coqueMode)||(typeof extPickFace!=='undefined'&&extPickFace)||
       (typeof faoChainMode!=='undefined'&&faoChainMode)){
      faceEl.textContent='Plan : quittez le mode en cours d\'abord.';return;
    }
    const bl=(typeof bodies!=='undefined'&&bodies)?bodies.filter(function(b){return b&&!b.ghost&&b.mesh;}):[];
    if(!bl.length){faceEl.textContent='Plan : aucun corps à cliquer.';return;}
    const setup=faoSetup(setupId);
    if(!setup){faceEl.textContent='Plan : poste introuvable.';return;}
    faoPlanePick={setupId:setup.id};
    try{renderer.domElement.style.cursor='crosshair';}catch(e){}
    faceEl.textContent='Plan 3+2 : cliquez une FACE SORTANTE de la pièce (Échap annule).';
    if(typeof renderProps==='function')renderProps();
  }catch(e){ try{faceEl.textContent='Plan : impossible ('+e.message+').';}catch(e2){} }
}
function faoPlaneCancel(silent){
  faoPlanePick=null;
  try{renderer.domElement.style.cursor='default';}catch(e){}
  if(!silent){ try{ if(typeof renderProps==='function')renderProps(); }catch(e){} }
}
function faoPlaneCommit(e){
  try{
    if(!faoPlanePick)return;
    const r=renderer.domElement.getBoundingClientRect();
    const ndc=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
    rayc.setFromCamera(ndc,camera);
    const objs=bodies.filter(function(b){return b&&!b.ghost&&b.visible!==false&&b.mesh;})
      .map(function(b){return b.mesh;});
    const hits=objs.length?rayc.intersectObjects(objs,false):[];
    if(!hits.length){faceEl.textContent='Plan : aucune face touchée, réessayez.';return;}
    const h=hits[0];
    const n=h.face&&h.face.normal;
    if(!n){faceEl.textContent='Plan : face illisible, réessayez.';return;}
    let nx=n.x,ny=n.y,nz=n.z;
    try{
      const v=new THREE.Vector3(n.x,n.y,n.z).transformDirection(h.object.matrixWorld);
      nx=v.x;ny=v.y;nz=v.z;
    }catch(e2){}
    try{ const Fr=faoFrame(faoSetup(faoPlanePick.setupId)); if(!Fr.id){ const q=faoRotF(Fr,[nx,ny,nz]); nx=q[0];ny=q[1];nz=q[2]; } }catch(e2){}
    const o=faoOrientFromNormal(nx,ny,nz);
    if(o.down){faceEl.textContent='Plan : face tournée vers le BAS — pièce à retourner (non appliquée).';return;}
    const setup=faoSetup(faoPlanePick.setupId);
    if(!setup){faceEl.textContent='Plan : poste introuvable, annulé.';faoPlaneCancel(true);return;}
    faoSnapshot('plan sur la pièce');
    setup.orient={b:o.b,c:o.c};
    faoPlaneCancel(true);
    faoChanged();
    faceEl.textContent='Plan : B '+o.b+'° · C '+o.c+'° appliqués — vérifiez le sens de rotation de votre machine.';
  }catch(err){ try{faceEl.textContent='Plan : impossible ('+err.message+').';}catch(e2){} }
}

/* ----- picking « face » des plans (2026-10-08-002) ----- */
// Le clic sur une face fige son Z (`fz`) dans le plan choisi (référence
// « Sélection ») — même garde-fous de modes que le picking 3+2 (faoPlaneStart).
let faoZPlanePick=null;
function faoZPlaneStart(t){
  // t={setupId,opId,which:'clear'|'retr',slot:1|2|null}
  try{
    if(typeof skEdit!=='undefined'&&skEdit){faceEl.textContent='Plan : fermez l\'esquisse d\'abord.';return;}
    if((typeof filMode!=='undefined'&&filMode)||(typeof filModeX!=='undefined'&&filModeX)||
       (typeof mvMode!=='undefined'&&mvMode)||(typeof draftMode!=='undefined'&&draftMode)||
       (typeof coqueMode!=='undefined'&&coqueMode)||(typeof extPickFace!=='undefined'&&extPickFace)||
       (typeof faoPlanePick!=='undefined'&&faoPlanePick)||(typeof faoChainMode!=='undefined'&&faoChainMode)){
      faceEl.textContent='Plan : quittez le mode en cours d\'abord.';return;
    }
    const bl=(typeof bodies!=='undefined'&&bodies)?bodies.filter(function(b){return b&&!b.ghost&&b.mesh;}):[];
    if(!bl.length){faceEl.textContent='Plan : aucun corps à cliquer.';return;}
    if(!faoSetup(t.setupId)){faceEl.textContent='Plan : poste introuvable.';return;}
    faoZPlanePick=t;
    try{renderer.domElement.style.cursor='crosshair';}catch(e){}
    faceEl.textContent='Plan : cliquez la FACE de référence (Z retenu = point cliqué, Échap annule).';
    if(typeof renderProps==='function')renderProps();
  }catch(e){ try{faceEl.textContent='Plan : impossible ('+e.message+').';}catch(e2){} }
}
function faoZPlaneCancel(silent){
  faoZPlanePick=null;
  try{renderer.domElement.style.cursor='default';}catch(e){}
  if(!silent){ try{ if(typeof renderProps==='function')renderProps(); }catch(e){} }
}
function faoZPlaneCommit(e){
  try{
    if(!faoZPlanePick)return;
    const t=faoZPlanePick;
    const r=renderer.domElement.getBoundingClientRect();
    const ndc=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
    rayc.setFromCamera(ndc,camera);
    const objs=bodies.filter(function(b){return b&&!b.ghost&&b.visible!==false&&b.mesh;})
      .map(function(b){return b.mesh;});
    const hits=objs.length?rayc.intersectObjects(objs,false):[];
    if(!hits.length){faceEl.textContent='Plan : aucune face touchée, réessayez.';return;}
    const setup=faoSetup(t.setupId);
    const hp=hits[0].point,Fr=t.opId?faoOpFrameOf(setup.id,t.opId):faoFrame(setup);
    const z=Math.round((Fr.id?hp.z:faoToF(Fr,[hp.x,hp.y,hp.z])[2])*100)/100; // Z du repère posage
    if(!setup){faceEl.textContent='Plan : poste introuvable, annulé.';faoZPlaneCancel(true);return;}
    let owner=setup, op=null;
    if(t.opId){
      const ops=setup.ops||[];
      for(let i=0;i<ops.length;i++)if(ops[i]&&ops[i].id===t.opId){op=ops[i];break;}
      if(!op){faceEl.textContent='Plan : opération introuvable, annulé.';faoZPlaneCancel(true);return;}
      owner=op;
    }
    const eff=faoPlaneEff(setup,op);
    const base=(t.which==='clear'?eff.clear:eff.retr)||{ref:'brutHaut',dz:0};
    const mm=(base.ref==='max'||base.ref==='min');
    let pl;
    if(t.slot&&mm){
      const cur=(t.slot===1?base.s1:base.s2)||{ref:'brutHaut',dz:0};
      const slot={ref:'face',dz:isFinite(+cur.dz)?+cur.dz:0,fz:z};
      pl=Object.assign({},base);
      pl[t.slot===1?'s1':'s2']=slot;
    }else{
      pl=Object.assign({},base,{ref:'face',fz:z});
    }
    faoSnapshot('plan face (Z '+z.toFixed(2)+')');
    faoPlaneSet(owner,t.which,pl);
    faoZPlaneCancel(true);
    faoChanged();
    faceEl.textContent='Plan : face retenue à Z '+z.toFixed(2)+' mm — valeur résolue à jour dans la fiche.';
  }catch(err){ try{faceEl.textContent='Plan : impossible ('+err.message+').';}catch(e2){} }
}

/* ----- mode sélection : chaîne d'arêtes pour limite d'usinage ----- */
// Germes cliqués (jaune) + tangentes déduites (rouge), comme les congés.
// À la validation on SNAPSHOTE la boucle XY dans op.limit + les ancres des germes :
// la limite survit au rejeu (re-suie auto par faoChainReplay) et à la sauvegarde
// sans OCCT ; arêtes trop déplacées -> stale (alerte) -> re-sélectionner.
function faoChainEdgesWorld(opt){
  // Arêtes listables pour la saisie de zone (Chaîne / Chaîne îlot / Limite Z).
  // • composé exact occLive, COMME AVANT (pièce native) ;
  // • + imports STEP affichés : un import SEUL n'entre JAMAIS dans la chaîne
  //   exacte (occReplayBody « importSeul → return ») donc occLive reste null et
  //   la saisie refusait tout (« recalcul impossible ») alors que l'overlay
  //   « Arêtes » dessinait bien le STEP (mêmes arêtes classées À L'IMPORT,
  //   importGeom entry.edges — cf. edgeOverlayData).
  // Le composé occLive ne contient jamais un import non consommé (il n'est
  // poussé dans bodies QUE s'il n'est PAS dans FR.imports) : aucun doublon.
  const out=[];
  const add=function(e,mw){
    try{
      if(!e||!e.pts||e.pts.length<1)return;
      let p=e.pts,mid=(e.mid&&isFinite(e.mid[0]))?[+e.mid[0],+e.mid[1],isFinite(+e.mid[2])?+e.mid[2]:0]:null;
      let len=+e.len;
      if(mw&&mw.elements){ // coordonnées mesh -> monde (comme buildEdgeOverlay)
        p=p.map(function(q){const v=new THREE.Vector3(q[0],q[1],q[2]).applyMatrix4(mw);return[v.x,v.y,v.z];});
        if(mid){const m=new THREE.Vector3(mid[0],mid[1],mid[2]).applyMatrix4(mw);mid=[m.x,m.y,m.z];}
      }
      if(!mid||!isFinite(len)||len<=0){
        // repli maillage (STL / import sans classification) : milieu à mi-
        // longueur + longueur cumulée, CALCULÉS donc stables d'un rejeu à l'autre.
        let L=0;const acc=[0];
        for(let i=0;i+1<p.length;i++){L+=Math.hypot(p[i+1][0]-p[i][0],p[i+1][1]-p[i][1],p[i+1][2]-p[i][2]);acc.push(L);}
        if(!(L>1e-12))return;
        len=L;
        const half=L/2;let k=0;while(k+1<acc.length&&acc[k+1]<half)k++;
        const seg=acc[k+1]-acc[k],t=seg>1e-12?(half-acc[k])/seg:0;
        mid=[p[k][0]+(p[k+1][0]-p[k][0])*t,p[k][1]+(p[k+1][1]-p[k][1])*t,p[k][2]+(p[k+1][2]-p[k][2])*t];
      }
      out.push({mid:mid,pts:p,len:len,sharp:e.sharp!==false});
    }catch(err){}
  };
  if(typeof occLive!=='undefined'&&occLive&&occLive.shape){
    try{occSharpEdges(occLive.shape).forEach(function(e){add(e,null);});}catch(e){}
  }
  // 2026-10-21-006 : opt.all (rejeu des zones) — imports masqués compris, sauf
  // les corps choisis comme BRUT d'un posage (leurs arêtes ne bornent jamais une zone)
  const all=!!(opt&&opt.all);
  const stockIds=new Set();
  if(all)try{((faoRoot()&&faoRoot().setups)||[]).forEach(function(s){if(s&&s.stockSrc==='body'&&s.stockBody!=null)stockIds.add(String(s.stockBody));});}catch(e){}
  try{
    (typeof bodies!=='undefined'&&bodies?bodies:[]).forEach(function(b){
      if(!b||b.kind!=='import'||b.ghost||!b.mesh)return;
      if(all){ if(stockIds.has(String(b.id))||stockIds.has(String(b.ref)))return; }
      else if(b.visible===false||b.mesh.visible===false)return;
      let ent=null;try{ent=(typeof importGeom!=='undefined'&&importGeom)?importGeom.get(b.ref||b.id):null;}catch(e){}
      const mw=(b.mesh&&b.mesh.matrixWorld)||null;
      if(ent&&ent.edges&&ent.edges.length){ent.edges.forEach(function(e){add(e,mw);});return;}
      try{edgeOverlayFromMesh(b).forEach(function(e){add(e,null);});}catch(e){} // STL : déjà en monde
    });
  }catch(e){}
  return out;
}
let faoChainMode=null, faoChainHover=null;
function faoChainStart(setupId,opId,kind){
  // kind : 'chain' (zone extérieure, défaut) · 'chain2' (zone intérieure,
  // îlot 2026-10-08-003) · 'z' (limite Z d'ébauche 3D).
  try{
    const is2=(kind==='chain2');
    const PRE=(kind==='z')?'Limite Z':(is2?'Chaîne (îlot)':'Chaîne');
    if(typeof skEdit!=='undefined'&&skEdit){faceEl.textContent=PRE+' : fermez l\'esquisse d\'abord.';return;}
    if((typeof filMode!=='undefined'&&filMode)||(typeof filModeX!=='undefined'&&filModeX)||
       (typeof mvMode!=='undefined'&&mvMode)||(typeof draftMode!=='undefined'&&draftMode)||
       (typeof coqueMode!=='undefined'&&coqueMode)||(typeof extPickFace!=='undefined'&&extPickFace)||
       (typeof faoPlanePick!=='undefined'&&faoPlanePick)){
      faceEl.textContent=PRE+' : quittez le mode en cours d\'abord.';return;
    }
    if(!occLive||!occLive.shape){
      if(typeof occHas==='function'&&!occHas()){faceEl.textContent=PRE+' : solide exact indisponible (OCCT non chargé ou aucun volume).';return;}
      try{rebuild();}catch(e){}
      // Un import SEUL ne fabrique AUCUN solide exact (occReplayBody : importSeul
      // → return) : occLive peut rester null alors que les arêtes du STEP existent
      // — on liste quand même (faoChainEdgesWorld lit importGeom) au lieu de
      // refuser tout à ce stade.
    }
    let edges=[];
    try{ edges=faoChainEdgesWorld(); }catch(e){ edges=[]; }
    try{ // 2026-10-16-019 : repère orienté du posage → arêtes dans SES coordonnées
      const Fr=faoOpFrameOf(setupId,opId); // repère de l'opération (sinon du posage)
      if(!Fr.id)edges=edges.map(function(e){ const o=Object.assign({},e);
        o.pts=(e.pts||[]).map(function(q){return faoToF(Fr,q);}); if(e.mid)o.mid=faoToF(Fr,e.mid); return o; });
    }catch(e){}
    if(!edges.length){
      faceEl.textContent=(!occLive||!occLive.shape)?(PRE+' : recalcul impossible.'):(PRE+' : aucune arête listable.');
      return;
    }
    const setup=faoSetup(setupId);
    const op=(setup.ops||[]).filter(function(o){return o.id===opId;})[0];
    if(!op){faceEl.textContent=PRE+' : opération introuvable.';return;}
    const isZ=(kind==='z');
    const old=is2
      ?(op.limit2&&op.limit2.mode==='chain'?op.limit2:null)
      :(op.limit&&op.limit.mode==='chain'?op.limit:null);
    faoChainMode={setupId:setup.id,opId:op.id,edges:edges,seeds:[],
      tangent:isZ?false:(old?!!old.tangent:true),sel:[],
      kind:isZ?'z':(is2?'chain2':'chain')};
    // 2026-10-21-006 : ROUVRIR la saisie reprend la sélection en cours (droites
    // ET courbes) — avant, elle repartait vide : modifier une zone obligeait à
    // tout recliquer (« il perd la sélection de courbes et droites »).
    try{
      const oldA=isZ?(op.zlim&&op.zlim.anchors):(old&&old.anchors);
      if(oldA&&oldA.length){faoChainMode.seeds=faoAnchorSeeds(oldA,edges);faoChainSync();}
    }catch(e){}
    faoChainHover=null;
    faoChainBuildOverlay();
    if(typeof renderProps==='function')renderProps();
    const pre=faoChainMode.sel.length?(' · '+faoChainMode.sel.length+' déjà retenue(s), un clic les retire'):'';
    faceEl.textContent=isZ
      ?('Limite Z : cliquez les arêtes des hauteurs ('+edges.length+' listées)'+pre+' · OK valide, Échap annule.')
      :(PRE+' : cliquez des arêtes ('+edges.length+' listées)'+pre+' · tangentes auto '+
        (faoChainMode.tangent?'ON':'OFF')+' · OK valide, Échap annule.');
  }catch(e){ try{faceEl.textContent='Chaîne : impossible ('+e.message+').';}catch(e2){} }
}
function faoZlimStart(setupId,opId){
  // Sélection d'arêtes au service des hauteurs Haut/Bas de l'ébauche 3D.
  faoChainStart(setupId,opId,'z');
}
function faoChainExit(silent){
  try{
    faoChainMode=null; faoChainHover=null;
    if(typeof scene!=='undefined'&&scene){
      const o=faoGet3D('faoChainEdges');
      if(o)faoDel3D(o);
    }
    try{renderer.domElement.style.cursor='default';}catch(e){}
    if(!silent){
      faoRefreshFaoUI();
      try{ if(typeof renderProps==='function')renderProps(); }catch(e){}
    }
  }catch(e){}
}
// 2026-10-15-005 : PRÉ-SÉLECTION D'ARÊTES PLUS VISIBLE ET PLUS PRÉCISE.
// Retour : « les arêtes extérieures sont visibles mais pas assez précises et le trait
// trop fin ; les arêtes de fond de poche ou de détourage ne le sont pas du tout ».
// • Trait : les LineSegments WebGL font TOUJOURS 1 px → quads écran (comme les
//   rapides), 3 px au repos, 5 px survolée / sélectionnée.
// • Arêtes concaves : posées exactement sur la surface, elles passaient DERRIÈRE la
//   facette (fond de poche, pied de détourage : la corde du maillage est devant
//   l'arête vraie). Le shader avance chaque sommet vers la caméra (0,25 mm +
//   0,4 % de la distance) : visible sur la face, toujours caché par la matière.
// • Pointage : distance en PIXELS écran au segment (10 px), et non plus 2 mm en 3D
//   (trop large de près, inattrapable de loin) ; une arête cachée par la pièce
//   n'est jamais prise.
const FAO_CHAIN_W=3, FAO_CHAIN_WH=5;
function faoChainBuildOverlay(){
  try{
    if(!faoChainMode)return;
    const old=faoGet3D('faoChainEdges');
    if(old)faoDel3D(old);
    const segs=[], segEdge=[];
    faoChainMode.edges.forEach(function(e,i){
      const p=e.pts||[];
      for(let k=0;k+1<p.length;k++){
        segs.push(p[k][0],p[k][1],p[k][2],p[k+1][0],p[k+1][1],p[k+1][2]);
        segEdge.push(i);
      }
    });
    const n=segEdge.length;
    const pos=new Float32Array(n*12),oth=new Float32Array(n*12),side=new Float32Array(n*4),
      col=new Float32Array(n*12),wid=new Float32Array(n*4),idx=new Uint32Array(n*6);
    for(let i=0;i<n;i++){
      const a=i*6,v=i*12,k=i*4;
      for(let q=0;q<4;q++){
        const atA=q<2,o=v+q*3;
        pos[o]=segs[a+(atA?0:3)];pos[o+1]=segs[a+(atA?1:4)];pos[o+2]=segs[a+(atA?2:5)];
        oth[o]=segs[a+(atA?3:0)];oth[o+1]=segs[a+(atA?4:1)];oth[o+2]=segs[a+(atA?5:2)];
        wid[k+q]=FAO_CHAIN_W;
      }
      side[k]=1;side[k+1]=-1;side[k+2]=-1;side[k+3]=1;
      const t=i*6;idx[t]=k;idx[t+1]=k+1;idx[t+2]=k+2;idx[t+3]=k+1;idx[t+4]=k+3;idx[t+5]=k+2;
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    g.setAttribute('other',new THREE.BufferAttribute(oth,3));
    g.setAttribute('side',new THREE.BufferAttribute(side,1));
    g.setAttribute('col',new THREE.BufferAttribute(col,3));
    g.setAttribute('wid',new THREE.BufferAttribute(wid,1));
    g.setIndex(new THREE.BufferAttribute(idx,1));
    const res=new THREE.Vector2(1000,1000);
    const mkMat=function(halo){ return new THREE.ShaderMaterial({
      uniforms:{res:{value:res},halo:{value:halo}},
      vertexShader:[
        'attribute vec3 other; attribute float side; attribute vec3 col; attribute float wid; uniform vec2 res; uniform float halo; varying vec3 vCol;',
        'vec4 pull(vec3 p){',
        '  vec4 m=modelViewMatrix*vec4(p,1.0);',
        '  float dd=length(m.xyz);',
        '  m.xyz*=max(0.0,1.0-(0.25+0.004*dd)/max(dd,1e-3));', // vers la caméra
        '  return projectionMatrix*m;',
        '}',
        'void main(){',
        '  vCol=halo>0.5?vec3(0.03,0.03,0.05):col;',
        '  vec4 a=pull(position);',
        '  vec4 b=pull(other);',
        '  vec2 d=(b.xy/b.w-a.xy/a.w)*res;',
        '  float l=length(d);',
        '  vec2 u=l>1e-6?d/l:vec2(1.0,0.0);',
        '  vec2 nrm=vec2(-u.y,u.x);',
        '  a.xy+=nrm*side*(wid+halo*2.0)/res*a.w;',
        '  gl_Position=a;',
        '}'].join(String.fromCharCode(10)),
      fragmentShader:'varying vec3 vCol; void main(){ gl_FragColor=vec4(vCol,1.0); }',
      side:THREE.DoubleSide
    }); };
    // Liseré sombre SOUS le trait (+1 px de chaque côté) : contraste garanti, même
    // une arête jaune survolée sur un corps jaune reste lisible.
    const halo=new THREE.Mesh(g,mkMat(1));
    halo.frustumCulled=false; halo.renderOrder=998; halo.raycast=function(){};
    const mesh=new THREE.Mesh(g,mkMat(0));
    mesh.frustumCulled=false;
    mesh.renderOrder=999;
    mesh.raycast=function(){}; // pointage écran : faoChainPick
    mesh.onBeforeRender=function(rd){ try{ rd.getDrawingBufferSize(res); res.divideScalar(rd.getPixelRatio()||1); }catch(e){} };
    mesh.userData.segEdge=segEdge;
    mesh.userData.segs=segs;
    halo.onBeforeRender=mesh.onBeforeRender;
    const grp=new THREE.Group(); grp.name='faoChainEdges'; grp.add(mesh); grp.add(halo); // [0] = trait (pointage)
    // arêtes en coordonnées de l'OPÉRATION (repère 3+2) : le groupe les ramène dans le posage
    try{ const M=faoOpMatrix(faoSetup(faoChainMode.setupId),(faoSetup(faoChainMode.setupId).ops||[]).filter(function(o){return o.id===faoChainMode.opId;})[0]);
      if(M){ grp.matrixAutoUpdate=false; grp.matrix.copy(M); } }catch(e){}
    faoAdd3D(grp);
    faoChainPaint();
  }catch(e){ try{faceEl.textContent='Chaîne : affichage impossible ('+e.message+').';}catch(e2){} }
}
function faoChainIsSeed(i){
  return !!(faoChainMode&&faoChainMode.seeds&&faoChainMode.seeds.indexOf(i)>=0);
}
function faoChainIsSel(i){
  if(!faoChainMode)return false;
  return faoChainMode.sel.indexOf(i)>=0;
}
function faoChainPaint(){
  try{
    const grp=faoGet3D('faoChainEdges');
    if(!grp||!faoChainMode)return;
    const l=grp.children[0];
    if(!l||!l.geometry||!l.geometry.attributes.col)return;
    const col=l.geometry.attributes.col, wid=l.geometry.attributes.wid, segEdge=l.userData.segEdge;
    if(!segEdge)return;
    const c=new THREE.Color(), cache={};
    for(let k=0;k<segEdge.length;k++){
      const i=segEdge[k];
      let st=cache[i];
      if(st===undefined){
        const seed=faoChainIsSeed(i), sl=faoChainIsSel(i), hv=(faoChainHover===i);
        st=cache[i]={hex:seed?0xffd60a:(sl?0xff453a:(hv?0xffd60a:0x0a84ff)),w:(seed||sl||hv)?FAO_CHAIN_WH:FAO_CHAIN_W};
      }
      c.setHex(st.hex);
      for(let q=0;q<4;q++){col.setXYZ(k*4+q,c.r,c.g,c.b);wid.setX(k*4+q,st.w);}
    }
    col.needsUpdate=true; wid.needsUpdate=true;
  }catch(e){}
}
function faoChainPick(e){
  // Arête la plus proche EN PIXELS du curseur (≤ 10 px), parmi celles que la pièce
  // ne cache pas (profondeur ≤ premier impact du rayon + tolérance).
  try{
    const grp=faoGet3D('faoChainEdges');
    if(!grp||!faoChainMode)return null;
    const l=grp.children[0];const segs=l&&l.userData.segs,segEdge=l&&l.userData.segEdge;
    if(!segs||!segEdge)return null;
    const r=renderer.domElement.getBoundingClientRect();
    const mx=e.clientX-r.left,my=e.clientY-r.top,W=r.width,H=r.height;
    // premier impact sur les corps visibles (occultation)
    let dHit=Infinity;
    try{
      const ndc=new THREE.Vector2((mx/W)*2-1,-(my/H)*2+1);
      rayc.setFromCamera(ndc,camera);
      const ms=(bodies||[]).filter(function(b){return b&&b.visible!==false&&!b.ghost&&b.mesh&&b.mesh.visible!==false;}).map(function(b){return b.mesh;});
      const h=rayc.intersectObjects(ms,false);
      if(h.length)dHit=h[0].distance;
    }catch(err){}
    camera.updateMatrixWorld();
    const PV=new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
    let RW=null; try{ grp.updateMatrixWorld(true); RW=grp.matrixWorld; if(RW)PV.multiply(RW); }catch(err){} // segments en repère de l'opération (ou du posage)
    const cpw=camera.position,cp=RW?cpw.clone().applyMatrix4(RW.clone().invert()):cpw,va=new THREE.Vector4(),vb=new THREE.Vector4();
    const TOL=10;let best=null,bestD=TOL*TOL,bestZ=Infinity;
    for(let k=0;k<segEdge.length;k++){
      const o=k*6;
      va.set(segs[o],segs[o+1],segs[o+2],1).applyMatrix4(PV);
      vb.set(segs[o+3],segs[o+4],segs[o+5],1).applyMatrix4(PV);
      if(va.w<=1e-6||vb.w<=1e-6)continue;
      const ax=(va.x/va.w*0.5+0.5)*W,ay=(-va.y/va.w*0.5+0.5)*H;
      const bx=(vb.x/vb.w*0.5+0.5)*W,by=(-vb.y/vb.w*0.5+0.5)*H;
      const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;
      let t=L2>1e-9?((mx-ax)*dx+(my-ay)*dy)/L2:0;t=t<0?0:(t>1?1:t);
      const px=ax+dx*t-mx,py=ay+dy*t-my,d2=px*px+py*py;
      if(d2>bestD+1e-9)continue;
      // point 3D correspondant (interpolation perspective) et sa distance caméra
      const tw=t/vb.w/((1-t)/va.w+t/vb.w);
      const X=segs[o]+(segs[o+3]-segs[o])*tw,Y=segs[o+1]+(segs[o+4]-segs[o+1])*tw,Z=segs[o+2]+(segs[o+5]-segs[o+2])*tw;
      const dc=Math.hypot(X-cp.x,Y-cp.y,Z-cp.z);
      if(dc>dHit+Math.max(0.5,0.02*dHit))continue; // cachée par la matière
      if(d2<bestD-0.25||dc<bestZ){best=segEdge[k];bestD=d2;bestZ=dc;}
    }
    return (best!==null&&best>=0&&best<faoChainMode.edges.length)?best:null;
  }catch(e){ return null; }
}
function faoChainSync(){
  if(!faoChainMode)return;
  if(faoChainMode.tangent){
    const all=[];
    (faoChainMode.seeds||[]).forEach(function(s){
      faoTangentSet(faoChainMode.edges,[s]).forEach(function(j){ if(all.indexOf(j)<0)all.push(j); });
    });
    faoChainMode.sel=all;
  }else{
    faoChainMode.sel=(faoChainMode.seeds||[]).slice();
  }
}
function faoChainToggle(e){
  try{
    if(!faoChainMode||!faoChainMode.edges)return;
    const i=faoChainPick(e);
    const PRE=(faoChainMode.kind==='z')?'Limite Z':(faoChainMode.kind==='chain2'?'Chaîne (îlot)':'Chaîne');
    if(i===null||i===undefined||!faoChainMode.edges[i]){
      faceEl.textContent=PRE+' : cliquez une arête bleue.'+
        (faoChainMode.tangent?' Les tangentes sont ajoutées automatiquement.':' Une seule arête par clic.');
      return;
    }
    const k=faoChainMode.seeds.indexOf(i);
    if(k>=0)faoChainMode.seeds.splice(k,1);
    else faoChainMode.seeds.push(i);
    faoChainSync();
    faoChainPaint();
    if(typeof renderProps==='function')renderProps();
    const extra=(faoChainMode.tangent&&faoChainMode.sel.length>faoChainMode.seeds.length)
      ?' ('+faoChainMode.sel.length+' retenues dont '+faoChainMode.seeds.length+' cliquée(s) + tangentes)':'';
    faceEl.textContent=((faoChainMode.kind==='z')?'Limite Z'
      :(faoChainMode.kind==='chain2'?'Chaîne (îlot)':'Chaîne'))+' : '+
      faoChainMode.sel.length+' arête(s)'+extra+'.';
  }catch(err){ try{faceEl.textContent='Sélection impossible ('+err.message+').';}catch(e2){} }
}
function faoChainPanel(p,setup,op){
  const isZ=(faoChainMode.kind==='z');
  const is2=(faoChainMode.kind==='chain2');
  p.appendChild(faoH(isZ?'Limite Z : sélection d\'arêtes'
    :(is2?'Zone intérieure : chaîne d\'arêtes (îlot)':'Limite : chaîne d\'arêtes')));
  const n=faoChainMode.sel.length, ns=(faoChainMode.seeds||[]).length;
  const info=document.createElement('div');
  info.className='fao-meta';
  info.textContent=isZ
    ?(n+' arête(s) — une ou plusieurs en haut, une ou plusieurs en bas : Ztop = Zmax, Zbot = Zmin.')
    :(n+' arête(s) retenue(s)'+(faoChainMode.tangent?' dont '+ns+' cliquée(s) + tangentes':'')+'.');
  p.appendChild(info);
  if(!isZ){
    const r=faoRow();
    const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=!!faoChainMode.tangent;
    cb.onchange=function(){ faoChainMode.tangent=cb.checked; faoChainSync(); faoChainPaint(); faoRefreshFaoUI(); };
    r.appendChild(cb);
    const lb=document.createElement('span'); lb.textContent='Arêtes tangentes auto';
    lb.className='fao-lab'; r.appendChild(lb);
    p.appendChild(r);
  }
  const r2=faoRow();
  const ok=document.createElement('button');
  ok.textContent=isZ?'OK · appliquer la limite Z'
    :(is2?'OK · utiliser comme îlot':'OK · utiliser comme limite');
  ok.style.fontSize='.78rem';
  ok.onclick=function(){ faoChainOk(); };
  const no=document.createElement('button'); no.textContent='Annuler'; no.style.fontSize='.72rem';
  no.onclick=function(){ faoChainExit(); faceEl.textContent=(isZ?'Limite Z':(is2?'Chaîne (îlot)':'Chaîne'))+' : annulée, limite inchangée.'; };
  const clr=document.createElement('button'); clr.textContent='Effacer'; clr.style.fontSize='.72rem';
  clr.onclick=function(){ faoChainMode.seeds=[]; faoChainMode.sel=[]; faoChainPaint(); faoRefreshFaoUI(); };
  r2.appendChild(ok); r2.appendChild(no); r2.appendChild(clr);
  p.appendChild(r2);
  const note=document.createElement('div');
  note.className='fao-note';
  note.textContent=isZ
    ?'Haut et bas sont re-suivis à chaque rejeu (ancres des germes) ; éditer un champ casse le lien, une arête perdue met la fiche en alerte (valeurs gardées).'
    :(is2
      ?'Îlot à préserver : l\'ébauche usine HORS de cette boucle (outil au moins à un rayon + marge du contour — règle outil fixée, pas de choix de côté). Re-suivi automatique à chaque rejeu comme la zone extérieure.'
      :'La boucle est re-suie automatiquement à chaque rejeu (ancres des germes) ; si les arêtes ont trop bougé, la fiche passe en alerte. Chaîne ouverte : refermée d\'office en segment droit.');
  p.appendChild(note);
}
function faoChainOk(){
  let PRE='Chaîne';
  try{
    if(!faoChainMode)return;
    const setup=faoSetup(faoChainMode.setupId);
    const op=(setup.ops||[]).filter(function(o){return o.id===faoChainMode.opId;})[0];
    const isZ=(faoChainMode.kind==='z');
    const is2=(faoChainMode.kind==='chain2');
    PRE=isZ?'Limite Z':(is2?'Chaîne (îlot)':'Chaîne');
    if(!op){faceEl.textContent=PRE+' : opération introuvable.';faoChainExit();return;}
    if(!faoChainMode.sel.length){faceEl.textContent=PRE+' : aucune arête — limite inchangée.';faoChainExit();return;}
    if(isZ){
      // --- Limite Z par arêtes : Zmax/Zmin sur la sélection + ancre par germe.
      const nSel=faoChainMode.sel.length;
      const Z=faoZlimFromEdges(faoChainMode.edges,faoChainMode.sel);
      if(!Z){faoChainExit();faceEl.textContent='Limite Z : sélection invalide (haut > bas requis) — inchangée.';return;}
      faoSnapshot('limite Z par arêtes');
      op.ztop=Z.ztop; op.zbot=Z.zbot;
      // Lien suivi à chaque rejeu (faoZlimRematch) ; éditer un champ casse le
      // lien (faoZlimBreak) ; arête perdue -> stale + alerte, valeurs gardées.
      op.zlim={anchors:Z.anchors,nEdges:nSel,stale:false};
      faoChainExit();
      faoChanged();
      faceEl.textContent='Limite Z : haut '+Z.ztop+' → bas '+Z.zbot+' ('+nSel+' arêtes) enregistrée.';
      return;
    }
    const chains=faoOrderEdges(faoChainMode.edges,faoChainMode.sel);
    let res=faoLoopFromChains(faoChainMode.edges,chains);
    if(!res.loop.length||faoLoopArea(res.loop)<1e-6){
      faceEl.textContent=PRE+' : boucle dégénérée — limite inchangée.';return;
    }
    // Cap : les très longues chaînes sont sous-échantillonnées (clip en O(n)).
    res=faoChainLoopCap(res);
    const nEdges=faoChainMode.sel.length, wasTangent=!!faoChainMode.tangent;
    const old=is2
      ?(op.limit2&&op.limit2.mode==='chain'?op.limit2:null)
      :(op.limit&&op.limit.mode==='chain'?op.limit:null);
    faoSnapshot(is2?'zone intérieure en chaîne':'limite en chaîne');
    const L={mode:'chain',loop:res.loop,closed:res.closed,
      nEdges:nEdges,tangent:wasTangent,
      // Ancres des germes (figées) : permettent à faoChainReplay de re-suivre la
      // boucle à chaque fin de rejeu, et de passer en stale si plus retrouvable.
      anchors:(faoChainMode.seeds||[]).map(function(i){return faoEdgeAnchor(faoChainMode.edges[i]);}).filter(Boolean),
      stale:false,
      side:(old&&old.side)||'center',extra:(old&&isFinite(+old.extra))?+old.extra:0};
    // 2026-10-08-003 : l'îlot intérieur impose la règle outil « out » (dilaté
    // de r+marge, on garde le complément) — pas de choix de côté à l'écran.
    if(is2)L.side='out';
    if(is2)op.limit2=L; else op.limit=L;
    // 2026-10-14-004 : poche adaptative — bord = outil entier dedans ; haut =
    // dessus du brut, bas = fond détecté sous la boucle (sauf lien Z d'arêtes).
    if(!is2&&faoContourProfil(op)&&!op.zlim){
      // contour : bas = arête la plus basse de la sélection (bas de paroi),
      // haut = dessus du brut
      try{
        let zl=1/0;
        faoChainMode.sel.forEach(function(i){const e=faoChainMode.edges[i];(e&&e.pts||[]).forEach(function(p){if(isFinite(+p[2])&&+p[2]<zl)zl=+p[2];});});
        const st=faoOpView(setup,op).stock||faoStock(); // repère 3+2 : brut vu par l'opération
        op.ztop=+st.z1;
        if(zl<1/0&&zl<+st.z1-1e-6)op.zbot=Math.round(zl*1000)/1000;
      }catch(e){}
    }
    if(!is2&&faoPocketAdapt(op)){
      L.side='in';
      if(!op.zlim){
        try{
          const ov=faoOpView(setup,op); // repère 3+2 : brut et pièce vus par l'opération
          const st=ov.stock||faoStock();
          const am=faoActiveMesh(ov);
          op.ztop=+st.z1;
          op.zbot=(am&&am.mesh)?faoPocketFloor(am.mesh,L.loop,+st.z0):+st.z0;
        }catch(e){}
      }
    }
    faoChainExit();
    faoChanged();
    faceEl.textContent=PRE+' : '+(is2?'îlot ':'limite ')+(res.closed?'fermée':'refermée')+' ('+
      nEdges+' arêtes) enregistrée.';
  }catch(e){ try{faceEl.textContent=PRE+' : validation impossible ('+e.message+').';}catch(e2){} }
}
try{ faoInitUI(); }catch(e){}
