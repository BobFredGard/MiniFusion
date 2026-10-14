/* ================================================================
   CONTOUR 2.5D sur ARÊTES DU MODÈLE (2026-10-14-004)
   ----------------------------------------------------------------
   Profil = boucle XY d'une chaîne d'arêtes (op.limit, sélection
   faoChainStart) ; le contour n'est PAS une zone : la passe suit le
   profil, décalée du rayon outil du côté LIBRE.
   - côté auto : la matière est cherchée dans la section du solide à
     mi-hauteur (parité) — dedans = bossage (outil dehors), dehors =
     poche (outil dedans) ; forçable (op.cside 'ext' / 'int') ;
   - passes radiales (n, écart ae) puis finition à pleine hauteur
     (surépaisseur op.fin) ; passes en Z (ap) ;
   - sens avalant (matière à droite de l'avance, broche M3) ou opposé ;
   - entrée / sortie en quart de cercle tangent côté libre,
     recouvrement en fin de boucle ;
   - attaches (tabs) : n ponts de largeur W et hauteur H au-dessus du
     bas, l'outil passe par-dessus (montée/descente verticales).
   ================================================================ */
function faoContourProfil(op){ return !!(op&&op.type==='contour'&&op.strat==='profil'); }

// Abscisse curviligne du projeté de (x,y) sur la boucle fermée (cum = longueurs cumulées).
function faoLoopParam(loop,cum,x,y){
  let bd=1/0,bs=0;
  for(let i=0;i+1<loop.length;i++){
    const A=loop[i],B=loop[i+1],dx=B[0]-A[0],dy=B[1]-A[1],l2=dx*dx+dy*dy;
    let t=l2>0?((x-A[0])*dx+(y-A[1])*dy)/l2:0;if(t<0)t=0;else if(t>1)t=1;
    const qx=A[0]+dx*t-x,qy=A[1]+dy*t-y,d=qx*qx+qy*qy;
    if(d<bd){bd=d;bs=cum[i]+Math.sqrt(l2)*t;}
  }
  return bs;
}

function faoGenContourProfil(mesh,loop0,o){
  o=o||{};
  const moves=[];
  const diag={side:null,levels:0,passes:0,tabs:0};
  try{moves.diag=diag;}catch(e){}
  if(!loop0||loop0.length<4)return moves;
  const D=isFinite(+o.toolD)&&+o.toolD>0?+o.toolD:10, r=D/2;
  const RA=faoRA(o);
  const secu=isFinite(+o.secu)?+o.secu:5;
  const ztop=+o.ztop, zbot=+o.zbot;
  if(!(isFinite(ztop)&&isFinite(zbot))||!(ztop>zbot+1e-9))return moves;
  // boucle fermée, sens trigo (CCW)
  let loop=loop0.map(function(p){return [+p[0],+p[1]];});
  {const a=loop[0],b=loop[loop.length-1];
    if(Math.hypot(a[0]-b[0],a[1]-b[1])>1e-6)loop.push([a[0],a[1]]);}
  let ar=0;for(let i=0;i+1<loop.length;i++)ar+=loop[i][0]*loop[i+1][1]-loop[i+1][0]*loop[i][1];
  if(ar<0)loop=loop.slice().reverse();
  // --- côté matière : section à mi-hauteur, parité de part et d'autre
  let side=o.side==='ext'||o.side==='int'?o.side:null;
  if(!side&&mesh){
    const zm=Math.max(zbot+0.05,Math.min(ztop-0.05,(ztop+zbot)/2));
    const segs=faoSliceZCached(mesh,Math.round(zm*1000)/1000);
    let vin=0,vout=0;
    const n=loop.length-1,stp=Math.max(1,Math.floor(n/24));
    for(let i=0;i<n;i+=stp){
      const A=loop[i],B=loop[i+1],dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy);
      if(!(L>1e-6))continue;
      const mx=(A[0]+B[0])/2,my=(A[1]+B[1])/2,nx=-dy/L,ny=dx/L; // gauche = dedans (CCW)
      const e=Math.min(0.2,r*0.2);
      if(faoSliceHit(segs,mx+nx*e,my+ny*e,0))vin++;
      if(faoSliceHit(segs,mx-nx*e,my-ny*e,0))vout++;
    }
    side=vin>vout?'ext':(vout>vin?'int':'ext');
  }
  if(!side)side='ext';
  diag.side=side;
  // offset côté libre : ext = à droite d'une boucle CCW (faoOffsetChain side +1)
  const oside=side==='ext'?1:-1;
  const dFin=r+RA.radial;
  const fin=isFinite(+o.fin)&&+o.fin>0?+o.fin:0;
  const nR=Math.max(1,Math.min(20,Math.round(isFinite(+o.nR)?+o.nR:1)));
  const aeR=isFinite(+o.ae)&&+o.ae>0?+o.ae:D*0.4;
  const offs=[];for(let k=nR-1;k>=0;k--)offs.push(dFin+fin+k*aeR);
  // sens : avalant = matière à DROITE de l'avance (broche M3, G41)
  const climb=o.sens!=='opp';
  const ccw=(side==='int')===climb; // int + avalant -> CCW ; ext + avalant -> CW
  // longueurs cumulées de la boucle (attaches)
  const cum=[0];for(let i=1;i<loop.length;i++)cum.push(cum[i-1]+Math.hypot(loop[i][0]-loop[i-1][0],loop[i][1]-loop[i-1][1]));
  const Ltot=cum[cum.length-1];
  const tabN=Math.max(0,Math.min(50,Math.round(+o.tabN||0)));
  const tabW=isFinite(+o.tabW)&&+o.tabW>0?+o.tabW:5;
  const tabZ=zbot+(isFinite(+o.tabH)&&+o.tabH>0?+o.tabH:2);
  const tabC=[];for(let i=0;i<tabN;i++)tabC.push((i+0.5)*Ltot/tabN);
  diag.tabs=tabN;
  const inTab=function(x,y){
    if(!tabN)return false;
    const s=faoLoopParam(loop,cum,x,y),half=tabW/2+r;
    for(let i=0;i<tabC.length;i++){let d=Math.abs(s-tabC[i]);d=Math.min(d,Ltot-d);if(d<=half)return true;}
    return false;
  };
  // passe décalée à d : morceaux valides (à >= d−0,01 du profil), sens voulu
  const passAt=function(d){
    const P=faoOffsetChain(loop,d,oside);
    if(!P)return [];
    const runs=faoSplitValid(P,function(p){return faoDistToPoly(p[0],p[1],loop)>=d-0.01;});
    const out=[];
    runs.forEach(function(run){
      let R=run.slice();
      // polygone entier valide : refermé
      if(run===P||run.length===P.length)R.push([R[0][0],R[0][1]]);
      let a2=0;for(let i=0;i+1<R.length;i++)a2+=R[i][0]*R[i+1][1]-R[i+1][0]*R[i][1];
      const closed=Math.hypot(R[0][0]-R[R.length-1][0],R[0][1]-R[R.length-1][1])<1e-6;
      if(closed&&((a2>0)!==ccw))R.reverse();
      if(!closed&&!ccw)R.reverse();
      // droites échantillonnées à 0,25 mm par l'offset : simplifiées (écart 2 µm)
      R=faoSimplifyPts(R,0.002);
      if(R.length>=2)out.push({pts:R,closed:closed});
    });
    return out;
  };
  const leadR=Math.max(0.5,isFinite(+o.leadR)&&+o.leadR>0?+o.leadR:Math.min(5,Math.max(1,D*0.6)));
  const overlap=isFinite(+o.overlap)&&+o.overlap>=0?+o.overlap:1;
  const zClear=Math.min(secu,Math.max(ztop,zbot)+2);
  const rnd=function(v){return Math.round(v*10000)/10000;};
  let cur=null;
  const push=function(m){m.x=rnd(m.x);m.y=rnd(m.y);m.z=rnd(m.z);moves.push(m);cur=m;};
  // côté libre d'un point de passe (normale vers l'extérieur de la matière)
  // t = tangente unitaire de l'avance ; avalant : matière à droite, libre à gauche
  const freeN=function(t){ return climb?[-t[1],t[0]]:[t[1],-t[0]]; };
  // arc tangent (polyligne) : entrée de A vers P0 / sortie de P1 vers B
  const arcPts=function(P,t,nf,R,isIn){
    const C=[P[0]+nf[0]*R,P[1]+nf[1]*R],pts=[];
    const N=8;
    for(let k=0;k<=N;k++){const th=k/N*Math.PI/2;
      if(isIn)pts.push([C[0]-R*(t[0]*Math.cos(th)+nf[0]*Math.sin(th)),C[1]-R*(t[1]*Math.cos(th)+nf[1]*Math.sin(th))]);
      else pts.push([C[0]+R*(-nf[0]*Math.cos(th)+t[0]*Math.sin(th)),C[1]+R*(-nf[1]*Math.cos(th)+t[1]*Math.sin(th))]);}
    return pts;
  };
  const arcOK=function(pts,d){
    for(let k=0;k<pts.length;k++)if(faoDistToPoly(pts[k][0],pts[k][1],loop)<Math.min(d,r)-0.01)return false;
    return true;
  };
  // une passe (morceau) à la cote z : entrée, boucle (+recouvrement), sortie
  const emitRun=function(run,z,d){
    let pts=run.pts;
    // départ : point le plus proche de la position courante (boucle fermée)
    if(run.closed&&cur){
      let bi=0,bd=1/0;
      for(let i=0;i+1<pts.length;i++){const q=(pts[i][0]-cur.x)*(pts[i][0]-cur.x)+(pts[i][1]-cur.y)*(pts[i][1]-cur.y);if(q<bd){bd=q;bi=i;}}
      const body=pts.slice(bi,pts.length-1).concat(pts.slice(0,bi));
      pts=body.concat([[body[0][0],body[0][1]]]);
    }
    // recouvrement
    if(run.closed&&overlap>0){
      let acc=0;
      for(let i=1;i<pts.length&&acc<overlap;i++){
        const a=pts[i-1],b=pts[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);
        if(acc+l>=overlap){const u=(overlap-acc)/l;pts=pts.concat([[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u]]);acc=overlap;break;}
        pts=pts.concat([[b[0],b[1]]]);acc+=l;
      }
    }
    const tan=function(a,b){const l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return [(b[0]-a[0])/l,(b[1]-a[1])/l];};
    const t0=tan(pts[0],pts[1]),t1=tan(pts[pts.length-2],pts[pts.length-1]);
    const nf0=freeN(t0),nf1=freeN(t1);
    let lin=null,lout=null;
    for(let R=leadR;R>=0.5&&!lin;R*=0.6){const a=arcPts(pts[0],t0,nf0,R,true);if(arcOK(a,d))lin=a;}
    for(let R=leadR;R>=0.5&&!lout;R*=0.6){const a=arcPts(pts[pts.length-1],t1,nf1,R,false);if(arcOK(a,d))lout=a;}
    const S=lin?lin[0]:pts[0];
    // approche : dégagement, rapide au-dessus du départ, plongée en avance
    if(!cur){push({r:1,x:S[0],y:S[1],z:secu});if(zClear<secu-1e-9)push({r:1,x:S[0],y:S[1],z:zClear});}
    else{
      if(cur.z<zClear-1e-9)push({r:1,x:cur.x,y:cur.y,z:zClear});
      push({r:1,x:S[0],y:S[1],z:zClear});
    }
    const zIn=(lin&&inTab(S[0],S[1])&&z<tabZ)?tabZ:z;
    push({r:0,ent:1,x:S[0],y:S[1],z:zIn});
    const cutPt=function(x,y,ent){
      const zz=(z<tabZ&&inTab(x,y))?tabZ:z;
      if(cur&&!cur.r&&Math.abs(cur.z-zz)>1e-9){
        // bord d'attache : marche verticale au point de bascule (dichotomie)
        let A=[cur.x,cur.y],B=[x,y];const sA=cur.z>z+1e-9;
        for(let it=0;it<20;it++){const m=[(A[0]+B[0])/2,(A[1]+B[1])/2];if(inTab(m[0],m[1])===sA)A=m;else B=m;}
        const q=sA?B:A;
        push({r:0,ent:ent,x:q[0],y:q[1],z:cur.z});
        push({r:0,ent:ent,x:q[0],y:q[1],z:zz});
      }
      push({r:0,ent:ent,x:x,y:y,z:zz});
    };
    if(lin)for(let k=1;k<lin.length;k++)cutPt(lin[k][0],lin[k][1],1);
    for(let k=1;k<pts.length;k++)cutPt(pts[k][0],pts[k][1],0);
    if(lout)for(let k=1;k<lout.length;k++)cutPt(lout[k][0],lout[k][1],1);
    diag.passes++;
  };
  const levels=faoLevels(ztop,zbot+RA.axial,isFinite(+o.ap)&&+o.ap>0?+o.ap:5);
  diag.levels=levels.length;
  const passes=offs.map(passAt);
  levels.forEach(function(z){
    passes.forEach(function(runs,k){runs.forEach(function(run){emitRun(run,z,offs[k]);});});
  });
  // finition à pleine hauteur (surépaisseur fin enlevée d'un coup au fond)
  if(fin>0){
    const zf=zbot+RA.axial;
    passAt(dFin).forEach(function(run){emitRun(run,zf,dFin);});
  }
  if(cur)push({r:1,x:cur.x,y:cur.y,z:secu});
  return moves;
}

// Fiche du contour sur profil : sections Profil, Hauteurs, Passes, Côté et
// sens, Entrée/sortie, Attaches, Matière à laisser.
function faoContourRows(d,setup,op){
  const toolD=(function(){const t=faoToolById(setup,op.toolId);return t&&+t.d>0?+t.d:10;})();
  d.appendChild(faoH('Profil'));
  const L=(op.limit&&op.limit.mode==='chain')?op.limit:null;
  const has=!!(L&&(L.loop||[]).length>=3);
  const rc=faoRow();
  const info=document.createElement('span'); info.className='fao-meta';
  const gd=op.geoDiag||{};
  info.textContent=has
    ?(L.nEdges||'?')+' arête(s), boucle '+(L.closed?'fermée':'refermée')+
      (gd.side?' · outil '+(gd.side==='ext'?'à l’EXTÉRIEUR (bossage)':'à l’INTÉRIEUR (poche)'):'')
    :'aucun profil — cliquez les arêtes du BAS de la paroi';
  rc.appendChild(info);
  const bs=document.createElement('button'); bs.textContent=has?'Re-sélectionner':'Sélectionner le profil';
  bs.style.fontSize='.72rem';
  bs.title='Cliquez les arêtes du bas de la paroi à contourner : Bas = cette arête, Haut = dessus du brut. Le côté de l’outil est déduit de la matière.';
  bs.onclick=function(){
    if(!op.limit||op.limit.mode!=='chain')op.limit={mode:'chain',loop:[],closed:false,nEdges:0,tangent:true,side:'center',extra:0};
    faoChainStart(setup.id,op.id);
  };
  rc.appendChild(bs);
  d.appendChild(rc);
  if(L&&L.stale){
    const ws=document.createElement('div'); ws.className='fao-alert';
    ws.textContent='⚠ Modèle modifié : arêtes du profil non retrouvées — boucle inchangée (obsolète), re-sélectionnez le profil.';
    d.appendChild(ws);
  }
  d.appendChild(faoH('Hauteurs (mm)'));
  const rZ=faoRow();
  rZ.appendChild(faoLab('Haut')); rZ.appendChild(faoNum(op.ztop,function(v){op.ztop=v;},56,null,'Haut de la paroi usinée (dessus du brut par défaut).'));
  rZ.appendChild(faoLab('Bas')); rZ.appendChild(faoNum(op.zbot,function(v){op.zbot=v;},56,null,'Bas de la paroi (arête la plus basse du profil par défaut).'));
  d.appendChild(rZ);
  d.appendChild(faoH('Passes (mm)'));
  const rP=faoRow();
  rP.appendChild(faoLab('ap')); rP.appendChild(faoNum(op.ap,function(v){op.ap=Math.max(0.2,v);},48,0.5,'Descente par passe en Z.'));
  rP.appendChild(faoLab('passes')); rP.appendChild(faoNum(isFinite(+op.nR)?+op.nR:1,function(v){op.nR=Math.max(1,Math.min(20,Math.round(v)));},36,1,
    'Passes latérales (ébauche) : de la plus éloignée vers la paroi, écartées de ae.'));
  rP.appendChild(faoLab('ae')); rP.appendChild(faoNum(isFinite(+op.ae)?+op.ae:+(toolD*0.4).toFixed(2),function(v){op.ae=Math.max(0.05,v);},48,0.1,'Écart entre deux passes latérales.'));
  rP.appendChild(faoLab('finition')); rP.appendChild(faoNum(isFinite(+op.fin)?+op.fin:0,function(v){op.fin=Math.max(0,v);},44,0.05,
    'Surépaisseur laissée par les passes en Z puis enlevée par UNE passe de finition à pleine hauteur (0 = pas de passe de finition séparée).'));
  d.appendChild(rP);
  d.appendChild(faoH('Côté et sens'));
  const rS=faoRow();
  rS.appendChild(faoLab('Côté'));
  rS.appendChild(faoSel([
    ['auto','Auto · selon la matière','Bossage : outil à l’extérieur ; poche : outil à l’intérieur (section du solide à mi-hauteur).'],
    ['ext','Extérieur','Outil à l’extérieur du profil.'],
    ['int','Intérieur','Outil à l’intérieur du profil.']],
    (op.cside==='ext'||op.cside==='int')?op.cside:'auto',
    function(v){ if(v==='ext'||v==='int')op.cside=v; else delete op.cside; },'Côté de l’outil par rapport au profil.'));
  rS.appendChild(faoLab('Sens'));
  rS.appendChild(faoSel([
    ['avalant','Avalant','Matière à droite de l’avance (broche M3) : meilleur état de surface.'],
    ['opp','Opposition','Matière à gauche de l’avance.']],
    op.sens==='opp'?'opp':'avalant',function(v){op.sens=(v==='opp')?'opp':'avalant';},'Sens de coupe.'));
  d.appendChild(rS);
  d.appendChild(faoH('Entrée / sortie'));
  const rE=faoRow();
  rE.appendChild(faoLab('rayon')); rE.appendChild(faoNum(isFinite(+op.leadR)?+op.leadR:+Math.min(5,Math.max(1,toolD*0.6)).toFixed(2),function(v){op.leadR=Math.max(0.5,v);},44,0.5,
    'Rayon des quarts de cercle tangents d’entrée et de sortie, côté libre.'));
  rE.appendChild(faoLab('recouvrement')); rE.appendChild(faoNum(isFinite(+op.overlap)?+op.overlap:1,function(v){op.overlap=Math.max(0,v);},44,0.5,
    'Longueur parcourue au-delà du point de départ avant la sortie (pas de marque).'));
  d.appendChild(rE);
  d.appendChild(faoH('Attaches'));
  const rT=faoRow();
  rT.appendChild(faoLab('nombre')); rT.appendChild(faoNum(isFinite(+op.tabN)?+op.tabN:0,function(v){op.tabN=Math.max(0,Math.min(50,Math.round(v)));},36,1,
    'Ponts de matière laissés pour tenir la pièce en détourage traversant (0 = aucun), répartis sur le profil.'));
  rT.appendChild(faoLab('largeur')); rT.appendChild(faoNum(isFinite(+op.tabW)?+op.tabW:5,function(v){op.tabW=Math.max(0.5,v);},44,0.5,'Largeur d’une attache le long du profil.'));
  rT.appendChild(faoLab('hauteur')); rT.appendChild(faoNum(isFinite(+op.tabH)?+op.tabH:2,function(v){op.tabH=Math.max(0.1,v);},44,0.5,'Hauteur de l’attache au-dessus du Bas.'));
  d.appendChild(rT);
  d.appendChild(faoH('Matière à laisser (mm)'));
  const rR=faoRow();
  rR.appendChild(faoLab('Parois')); rR.appendChild(faoNum(faoRA(op).radial,function(v){op.radial=Math.max(0,v);},44,0.1,'Surépaisseur laissée sur la paroi (0 = à la cote).'));
  rR.appendChild(faoLab('Fond')); rR.appendChild(faoNum(faoRA(op).axial,function(v){op.axial=Math.max(0,v);},44,0.1,'Surépaisseur au-dessus du Bas.'));
  d.appendChild(rR);
}
