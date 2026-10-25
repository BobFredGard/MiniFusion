/* ---------- Simulation : cavités des posages 3+2 (V0.7.6) ----------
   La matière simulée se dessine en Z-map : une hauteur par colonne, vue du dessus
   (src/88-fao-70-simulation.js). Une opération au repère propre (outil incliné) creuse DANS la
   matière — trou sur la tranche, poche sur un flanc : les voxels meurent (faoMatterCarveTilt)
   mais la Z-map ne les montre pas (« l'usinage a l'air de se faire mais la matière n'est pas
   enlevée », la fraise semble collée à la face d'entrée).
   La Z-map reste le rendu (mêmes mises à jour par colonne, même finesse) ; seules les colonnes
   CREUSÉES (un voxel mort sous leur dessus) reçoivent un complément : leurs flancs voxel par
   voxel — faces du brut percées à l'entrée de l'outil — et les parois, fonds et plafonds des
   cavités, plus les faces des colonnes voisines tournées vers elles. Leurs flancs Z-map sont
   repliés (faoViewerMatterWriteCol). Le complément ne couvre que ces colonnes : reconstruit au
   plus toutes les FAO_VOX_MS pendant la lecture. */
const FAO_VOX_MS=120;
function faoViewerVoxWanted(vw){
  try{ return !!(vw&&vw.pts&&vw.pts.some(function(p){return p&&p.ax;})); }catch(e){ return false; }
}
function faoVoxSolidTop(g,c,k){
  // Cote du dessus de la matière dans le voxel k de la colonne c, ou −1 (vide). Un voxel mort
  // à moins d'un pas sous le dessus de la colonne compte comme plein : la Z-map tue celui qui
  // chevauche la cote de coupe, la matière va pourtant jusqu'à elle.
  const pz=g.pz||g.pas,z0=g.oz+k*pz,hc=g.h?g.h[c]:g.oz+g.nz*pz;
  if(z0>=hc-1e-9)return -1;
  if(g.alive[k*g.nx*g.ny+c]||z0+pz/2>=hc-pz)return Math.min(z0+pz,hc);
  return -1;
}
function faoVoxMarkCav(vw,ks){
  // Colonnes qui deviennent CREUSÉES (voxel mort sous le dessus) — elles le restent.
  const g=vw.matterGrid,cav=vw.cav,out=[];
  if(!g||!cav||!ks)return out;
  const L=g.nx*g.ny,pz=g.pz||g.pas;
  for(let n=0;n<ks.length;n++){
    const idx=ks[n],c=idx%L;if(cav[c])continue;
    const k=(idx/L)|0,zc=g.oz+(k+0.5)*pz,hc=g.h?g.h[c]:g.oz+g.nz*pz;
    if(zc<hc-pz){cav[c]=1;out.push(c);}
  }
  return out;
}
function faoVoxBuild(g,cav,tops){
  // Triangles (positions + normales plates) du complément : cav = colonnes creusées
  // (absent : toutes — surface complète, utilisée par les tests). tops : dessus des colonnes
  // creusées aussi (rendu « ≈ lisse », dont les cellules creusées sont retirées).
  let cap=1<<14,pos=new Float32Array(cap*3),nrm=new Float32Array(cap*3),n=0;
  const grow=function(){cap*=2;const p=new Float32Array(cap*3),q=new Float32Array(cap*3);p.set(pos);q.set(nrm);pos=p;nrm=q;};
  const quad=function(a,b,c,d,nx,ny,nz){ // a b c d dans le sens direct vu depuis la normale
    if(n+6>cap)grow();
    const P=[a,b,c,a,c,d];
    for(let i=0;i<6;i++){const o=(n+i)*3;pos[o]=P[i][0];pos[o+1]=P[i][1];pos[o+2]=P[i][2];nrm[o]=nx;nrm[o+1]=ny;nrm[o+2]=nz;}
    n+=6;
  };
  const NXc=g.nx,NYc=g.ny,pz=g.pz||g.pas,oz=g.oz,L=NXc*NYc,H=g.h;
  const sx1=(g.sx1!=null)?g.sx1:g.ox+NXc*g.pas,sy1=(g.sy1!=null)?g.sy1:g.oy+NYc*g.pas;
  const all=!cav;
  const isCav=function(c){return all||cav[c];};
  const hOf=function(c){return H?H[c]:oz+g.nz*pz;};
  const T=function(c,k){
    if(isCav(c))return faoVoxSolidTop(g,c,k);
    const z0=oz+k*pz,hc=hOf(c);return z0>=hc-1e-9?-1:Math.min(z0+pz,hc);
  };
  const box=function(c){const i=c%NXc,j=(c/NXc)|0,x0=g.ox+i*g.pas,y0=g.oy+j*g.pas;
    return [x0,Math.min(x0+g.pas,sx1),y0,Math.min(y0+g.pas,sy1)];};
  const side=function(B,S,lo,hi){ // face du côté S d'une colonne de boîte B, de lo à hi
    if(!(hi>lo+1e-6))return;
    const x0=B[0],x1=B[1],y0=B[2],y1=B[3];
    if(S[0]<0)quad([x0,y1,lo],[x0,y0,lo],[x0,y0,hi],[x0,y1,hi],-1,0,0);
    else if(S[0]>0)quad([x1,y0,lo],[x1,y1,lo],[x1,y1,hi],[x1,y0,hi],1,0,0);
    else if(S[1]<0)quad([x0,y0,lo],[x1,y0,lo],[x1,y0,hi],[x0,y0,hi],0,-1,0);
    else quad([x1,y1,lo],[x0,y1,lo],[x0,y1,hi],[x1,y1,hi],0,1,0);
  };
  const SIDES=[[-1,0],[1,0],[0,-1],[0,1]];
  const nbOf=function(c,S){const i=c%NXc+S[0],j=((c/NXc)|0)+S[1];return (i>=0&&j>=0&&i<NXc&&j<NYc)?j*NXc+i:-1;};
  for(let c=0;c<L;c++){
    if(!isCav(c))continue;
    const B=box(c);if(!(B[1]>B[0])||!(B[3]>B[2]))continue;
    const hc=hOf(c);if(!(hc>oz+1e-9))continue;
    const x0=B[0],x1=B[1],y0=B[2],y1=B[3];
    if(all||tops)quad([x0,y0,hc],[x1,y0,hc],[x1,y1,hc],[x0,y1,hc],0,0,1);
    if(all){ // surface complète : fond du brut
      if(T(c,0)>=0)quad([x0,y0,oz],[x0,y1,oz],[x1,y1,oz],[x1,y0,oz],0,0,-1);
    }
    // fonds et plafonds des cavités
    for(let k=0;k<g.nz;k++){
      const a=T(c,k);if(a<0)continue;
      const z0=oz+k*pz,z1=z0+pz;
      if(k>0&&T(c,k-1)<0)quad([x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[x1,y0,z0],0,0,-1);
      if(a>=z1-1e-9&&z1<hc-1e-9&&(k+1>=g.nz||T(c,k+1)<0))quad([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],0,0,1);
    }
    for(const S of SIDES){
      const nb=nbOf(c,S);
      // flanc de la colonne creusée, voxel par voxel (tranches contiguës fusionnées)
      let lo=null,hi=null;
      for(let k=0;k<g.nz;k++){
        const a=T(c,k);
        if(a<0){if(lo!==null)side(B,S,lo,hi);lo=null;continue;}
        const b=nb>=0?T(nb,k):-1,l=b>=0?b:oz+k*pz;
        if(!(a>l+1e-6)){if(lo!==null)side(B,S,lo,hi);lo=null;continue;}
        if(lo!==null&&Math.abs(hi-l)<1e-6)hi=a;else{if(lo!==null)side(B,S,lo,hi);lo=l;hi=a;}
      }
      if(lo!==null)side(B,S,lo,hi);
      // voisine NON creusée : sa face tournée vers la cavité, sous le dessus de c (au-dessus,
      // la Z-map la dessine déjà)
      if(all||nb<0||isCav(nb))continue;
      const Bn=box(nb),Sn=[-S[0],-S[1]],hn=hOf(nb);
      lo=null;hi=null;
      for(let k=0;k<g.nz;k++){
        const z0=oz+k*pz;if(z0>=Math.min(hn,hc)-1e-9)break;
        const top=Math.min(z0+pz,hn,hc);
        if(T(c,k)>=0){if(lo!==null)side(Bn,Sn,lo,hi);lo=null;continue;}
        if(lo!==null&&Math.abs(hi-z0)<1e-6)hi=top;else{if(lo!==null)side(Bn,Sn,lo,hi);lo=z0;hi=top;}
      }
      if(lo!==null)side(Bn,Sn,lo,hi);
    }
  }
  return {pos:pos.subarray(0,n*3),nrm:nrm.subarray(0,n*3),n:n};
}
function faoViewerVoxRefresh(vw,force){
  // Reconstruit le complément (colonnes creusées) — au plus toutes les FAO_VOX_MS ; sinon une
  // reprise est programmée (la dernière passe s'affiche aussi à l'arrêt).
  if(!vw||!vw.vox||!vw.cav||!vw.matter||!vw.matterGrid)return;
  const now=(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now();
  const gap=Math.max(FAO_VOX_MS,4*(vw.voxMs||0)); // jamais plus d'un quart du temps à reconstruire
  if(!force&&vw.voxAt&&now-vw.voxAt<gap){
    if(!vw.voxT)vw.voxT=setTimeout(function(){vw.voxT=null;if(vw.voxDirty)faoViewerVoxRefresh(vw,true);},gap);
    return;
  }
  vw.voxAt=now;vw.voxDirty=false;
  try{
    const r=faoVoxBuild(vw.matterGrid,(vw.mH&&vw.cavDraw)||vw.cav,!!vw.mH);
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(r.pos),3));
    geo.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(r.nrm),3));
    if(!vw.voxMesh){
      const m=new THREE.Mesh(geo,vw.matter.material);
      m.name='faoMatterCav';m.raycast=function(){};m.frustumCulled=false;
      if(typeof scene!=='undefined'&&scene)faoAdd3D(m);
      vw.voxMesh=m;
    }else{
      const old=vw.voxMesh.geometry;vw.voxMesh.geometry=geo;
      try{ if(old&&old.dispose)old.dispose(); }catch(e){}
    }
    vw.voxMesh.visible=vw.matter.visible!==false;
    vw.voxTris=r.n/3;
    vw.voxMs=((typeof performance!=='undefined'&&performance.now)?performance.now():Date.now())-now;
  }catch(e){}
}
function faoViewerVoxFoldHF(vw,c){
  // Rendu « ≈ lisse » (faoViewerMatterHFBuild) : les murs du bord du brut sont un quad par cellule
  // de bord (ordre : −Y, +Y, −X, +X). Celui d'une colonne creusée est replié sur un segment
  // (aire nulle même quand son haut suit la surface) : le complément dessine ce flanc percé.
  const H=vw.mH,g=vw.matterGrid;if(!H||!g)return false;
  const i=c%g.nx,j=(c/g.nx)|0,es=[];
  if(j===0)es.push(i);
  if(j===g.ny-1)es.push(g.nx+i);
  if(i===0)es.push(2*g.nx+j);
  if(i===g.nx-1)es.push(2*g.nx+g.ny+j);
  for(const e of es){const wv=H.NV+4*e;
    for(let s=1;s<4;s++){H.pos[(wv+s)*3]=H.pos[wv*3];H.pos[(wv+s)*3+1]=H.pos[wv*3+1];}}
  // cellule de la surface lisse retirée (ses 2 triangles dégénérés) : le complément dessine la
  // colonne creusée entière — la pente lisse vers la voisine recouvrait l'entrée de la cavité
  if(H.idx){const o=c*6;for(let q=0;q<6;q++)H.idx[o+q]=H.idx[o];}
  return true;
}
function faoViewerVoxKill(vw,ks){
  // Après une taille : colonnes nouvellement creusées → flancs Z-map repliés, complément à refaire.
  const nw=faoVoxMarkCav(vw,ks);
  if(nw.length&&vw.mArr){
    for(let m=0;m<nw.length;m++)faoViewerMatterWriteCol(vw,nw[m]);
    try{ vw.matter.geometry.attributes.position.needsUpdate=true; }catch(e){}
  }
  if(nw.length&&vw.mH){ // « ≈ lisse » : colonne creusée ET sa couronne retirées de la surface lisse
    // (la pente lissée vers les voisines recouvrait l'entrée des cavités) — le complément les dessine
    const g=vw.matterGrid;if(!vw.cavDraw)vw.cavDraw=new Uint8Array(g.nx*g.ny);
    let any=false;
    for(let m=0;m<nw.length;m++){const c=nw[m],i=c%g.nx,j=(c/g.nx)|0;
      for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=g.nx||jj>=g.ny)continue;
        const n=jj*g.nx+ii;if(vw.cavDraw[n])continue;vw.cavDraw[n]=1;if(faoViewerVoxFoldHF(vw,n))any=true;}}
    if(any)try{ vw.mH.geo.attributes.position.needsUpdate=true; if(vw.mH.geo.index)vw.mH.geo.index.needsUpdate=true; }catch(e){}
  }
  vw.cavN=(vw.cavN||0)+nw.length;
  if(vw.cavN&&(nw.length||(ks&&ks.length))){ vw.voxDirty=true; faoViewerVoxRefresh(vw,false); }
}
function faoViewerVoxDispose(vw){
  try{ if(vw.voxT){ clearTimeout(vw.voxT); vw.voxT=null; } }catch(e){}
  try{ if(vw.voxMesh){ if(typeof scene!=='undefined'&&scene)faoDel3D(vw.voxMesh); if(vw.voxMesh.geometry&&vw.voxMesh.geometry.dispose)vw.voxMesh.geometry.dispose(); } }catch(e){}
  vw.voxMesh=null; vw.cav=null; vw.cavDraw=null; vw.vox=false;
}
