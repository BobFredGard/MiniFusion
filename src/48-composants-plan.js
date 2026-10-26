/* ---------- mise en plan d'assemblage (V0.6.7) ----------
   Le PLAN d'un composant (doc.mep, 98-mep-*.js) peut montrer « Assemblage » : le composant
   ET tout ce qu'il contient. Le PLAN travaille sur des corps (maillage + solide exact) : on lui
   fournit, en plus des corps du composant actif, un « corps » par corps de chaque instance placée
   (solide exact copié, transformé, maillage tiré du solide — repli : l'instantané d'affichage).
   Les solides des autres composants viennent d'un rejeu SILENCIEUX (doc échangé le temps du
   calcul, sans activation : activer fermerait le PLAN), gardés en cache (c._exact).
   Nomenclature par composant (premier niveau / tous niveaux / pièces seules), bulles. */
let asmPlanCache=null; // {sig, list}
function asmPlanOn(){return !!asm&&!!asmActiveComp()&&asmActiveComp().occ.length>0;}
function asmPlanInstances(){
  // Instances sous le composant actif (lui exclu), visibles
  const base=asmActiveComp();if(!base)return [];
  const hidden=path=>{let c=base;for(const id of path){const o=c&&c.occ.find(q=>q.id===id);if(!o||o.visible===false)return true;c=asmComp(o.comp);}return false;};
  return asmInstances(base.id).filter(i=>i.path.length&&!hidden(i.path));
}
function asmPlanSig(){
  if(!asmPlanOn())return '';
  return asmHash(JSON.stringify(asmPlanInstances().map(i=>{const c=asmComp(i.comp);
    return [i.path.join('/'),asmRound(i.F),c&&c._snap?c._snap.hash:'',c&&c._stale?1:0];})));
}
function asmExactQuiet(c){
  // Solides exacts d'un composant SANS l'activer : document échangé le temps du rejeu
  const d0=doc,a0=asm.active,s0=occSkipFeat;
  let out=[];
  try{doc=c.doc;asm.active=c.id;occSkipFeat=null;out=asmExactActive();}
  finally{doc=d0;asm.active=a0;occSkipFeat=s0;}
  return out;
}
function asmExactOfQuiet(c){
  const h=c._snap?c._snap.hash:'';
  if(c._exact&&c._exact.hash===h&&h&&!c._stale)return c._exact.list;
  asmExactFree(c);
  const list=c.doc===doc?asmExactActive():asmExactQuiet(c);
  c._exact={hash:h,list};
  return list;
}
function asmPlanFree(){
  if(!asmPlanCache)return;
  asmPlanCache.list.forEach(b=>{try{b.mesh.geometry.dispose();b.mesh.material.dispose();}catch(e){}try{if(b.shape)b.shape.delete();}catch(e){}});
  asmPlanCache=null;
}
function asmPlanBodies(){
  // Corps à projeter pour une vue « Assemblage » : ceux du composant actif + ceux des instances
  const own=((typeof bodies!=='undefined'&&bodies)||[]).filter(b=>b&&!b.ghost&&b.kind!=='ghost'&&b.mesh&&b.mesh.visible!==false);
  if(!asmPlanOn())return own;
  const sig=asmPlanSig();
  if(asmPlanCache&&asmPlanCache.sig===sig)return own.concat(asmPlanCache.list);
  asmPlanFree();
  const exact=typeof occHas==='function'&&occHas();
  const list=[];
  asmPlanInstances().forEach(I=>{
    const c=asmComp(I.comp);if(!c)return;
    const key='asm:'+I.path.join('/');
    let done=false;
    if(exact){
      try{
        asmExactOfQuiet(c).forEach(b=>{
          const sh=asmPlaced(b.shape,I.F);
          let geo=null,tri=null;
          try{const T=occTriPos(sh,0.3,0.4);tri=new Float32Array(T.pos); // V0.8.2 : triangles bruts (rayons des bulles)
            geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(T.pos,3));
            try{geo.setAttribute('normal',new THREE.Float32BufferAttribute(smoothNormals(T.pos,35),3));}catch(e){geo.computeVertexNormals();}
            geo.userData.occGroups=T.groups;}catch(e){geo=null;}
          if(!geo){try{sh.delete();}catch(e){}return;}
          const e=(c.doc.bodies||[]).find(x=>x.id===b.id)||{};
          const col=e.color>0?e.color:0x9a9aa0;
          const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:col}));
          list.push({kind:'body',id:key+':'+b.id,bodyId:key+':'+b.id,name:c.name+' · '+b.name,mesh,shape:sh,tri,color:col,asmComp:c.id,asmPath:I.path});
          done=true;
        });
      }catch(e){}
    }
    if(!done&&c._snap){
      // repli maillage : l'instantané d'affichage, placé
      c._snap.items.forEach((it,k)=>{
        const g=it.geo.clone();g.applyMatrix4(asmMat4(I.F));
        const mesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:it.color}));
        list.push({kind:'body',id:key+':m'+k,bodyId:key+':m'+k,name:c.name,mesh,shape:null,color:it.color,asmComp:c.id,asmPath:I.path});
      });
    }
  });
  asmPlanCache={sig,list};
  return own.concat(list);
}
function asmBomRows(lvl){
  // Nomenclature des composants : 'comp1' (premier niveau), 'all' (tous niveaux), 'parts'
  // (pièces seules : composants sans sous-composants). → [{rep,name,qty,mat,dims,ids:[compId]}]
  const base=asmActiveComp();if(!base)return [];
  let inst=asmPlanInstances();
  if(lvl==='comp1')inst=inst.filter(i=>i.path.length===1);
  if(lvl==='parts')inst=inst.filter(i=>{const c=asmComp(i.comp);return c&&!c.occ.length;});
  const rows=[];
  inst.forEach(i=>{
    let r=rows.find(q=>q.ids[0]===i.comp);
    if(r){r.qty++;return;}
    const c=asmComp(i.comp);let dims='';
    try{if(c._snap&&c._snap.items.length){const b=asmSnapBox(c._snap),S=b.getSize(new THREE.Vector3());dims=[S.x,S.y,S.z].map(v=>(+v).toFixed(1).replace('.',',')).join(' × ');}}catch(e){}
    rows.push({name:c.name,qty:1,mat:asmMatOf(c).name,dims,ids:[c.id]});
  });
  rows.forEach((q,k)=>q.rep=k+1);
  return rows;
}
/* V0.8.2 : bulles accrochées sur la surface VISIBLE de la pièce. Rayon le long du regard de la
   vue sur les corps placés du PLAN (cache asmPlanCache) et ceux du composant actif (qui cachent) */
const asmHitBox=new WeakMap(); // géométrie → boîte (rejet rapide des rayons)
function asmRayMesh(mesh,O,D,tri){
  // Distance de la première intersection du rayon O + t·D (t > 0) avec les triangles du maillage
  // (Möller–Trumbore, deux faces), ou Infinity — sans dépendre de THREE.Raycaster. tri : triangles
  // bruts déjà placés (corps des instances), sinon la géométrie du maillage
  const g=tri?{tri}:mesh&&mesh.geometry,pa=tri?{array:tri,count:tri.length/3}:g&&g.attributes&&g.attributes.position;if(!pa||!pa.array)return Infinity;
  const P=pa.array,ix=!tri&&g.index&&g.index.array,n=ix?ix.length:pa.count;
  const me=!tri&&mesh.matrixWorld&&mesh.matrixWorld.elements,id=!me||me.every((x,k)=>Math.abs(x-(k%5===0?1:0))<1e-12);
  const V=k=>{const x=P[3*k],y=P[3*k+1],z=P[3*k+2];return id?[x,y,z]:[me[0]*x+me[4]*y+me[8]*z+me[12],me[1]*x+me[5]*y+me[9]*z+me[13],me[2]*x+me[6]*y+me[10]*z+me[14]];};
  const hk=tri||g;let B=asmHitBox.get(hk);
  if(!B||B.n!==n||B.m!==(id?'':me.join())){B={n,m:id?'':me.join(),lo:[1e18,1e18,1e18],hi:[-1e18,-1e18,-1e18]};
    for(let k=0;k<pa.count;k++){const q=V(k);for(let j=0;j<3;j++){B.lo[j]=Math.min(B.lo[j],q[j]);B.hi[j]=Math.max(B.hi[j],q[j]);}}asmHitBox.set(hk,B);}
  let t0=-1e18,t1=1e18; // rejet par la boîte (dalles)
  for(let j=0;j<3;j++){if(Math.abs(D[j])<1e-15){if(O[j]<B.lo[j]-1e-6||O[j]>B.hi[j]+1e-6)return Infinity;continue;}
    let a=(B.lo[j]-O[j])/D[j],b=(B.hi[j]-O[j])/D[j];if(a>b){const s=a;a=b;b=s;}t0=Math.max(t0,a);t1=Math.min(t1,b);if(t0>t1+1e-9)return Infinity;}
  let best=Infinity;
  for(let k=0;k+2<n;k+=3){
    const A=V(ix?ix[k]:k),Bv=V(ix?ix[k+1]:k+1),Cv=V(ix?ix[k+2]:k+2);
    const e1=[Bv[0]-A[0],Bv[1]-A[1],Bv[2]-A[2]],e2=[Cv[0]-A[0],Cv[1]-A[1],Cv[2]-A[2]];
    const p=[D[1]*e2[2]-D[2]*e2[1],D[2]*e2[0]-D[0]*e2[2],D[0]*e2[1]-D[1]*e2[0]],det=e1[0]*p[0]+e1[1]*p[1]+e1[2]*p[2];
    if(Math.abs(det)<1e-14)continue;
    const inv=1/det,s=[O[0]-A[0],O[1]-A[1],O[2]-A[2]],uu=(s[0]*p[0]+s[1]*p[1]+s[2]*p[2])*inv;if(uu<-1e-9||uu>1+1e-9)continue;
    const q=[s[1]*e1[2]-s[2]*e1[1],s[2]*e1[0]-s[0]*e1[2],s[0]*e1[1]-s[1]*e1[0]],vv=(D[0]*q[0]+D[1]*q[1]+D[2]*q[2])*inv;if(vv<-1e-9||uu+vv>1+1e-9)continue;
    const tt=(e2[0]*q[0]+e2[1]*q[1]+e2[2]*q[2])*inv;if(tt>1e-9&&tt<best)best=tt;
  }
  return best;
}
function asmPlanHit(dir,u,v,lx,ly){
  // → {comp, path, p} de la première surface touchée sous (lx, ly) de la vue, ou null
  asmPlanBodies(); // cache des instances à jour
  const n=Math.hypot(dir[0],dir[1],dir[2])||1,Dn=[dir[0]/n,dir[1]/n,dir[2]/n];
  const O=[0,1,2].map(j=>u[j]*lx+v[j]*ly+Dn[j]*1e5),D=Dn.map(x=>-x);
  let best=null;
  const test=(mesh,comp,path,tri)=>{
    try{const d=asmRayMesh(mesh,O,D,tri);
      if(d<Infinity&&(!best||d<best.d))best={d,comp,path,p:[0,1,2].map(j=>O[j]+D[j]*d)};}catch(e){}
  };
  ((typeof bodies!=='undefined'&&bodies)||[]).forEach(b=>{if(b&&!b.ghost&&b.mesh&&b.mesh.visible!==false)test(b.mesh,null,null);});
  (asmPlanCache?asmPlanCache.list:[]).forEach(b=>{if(b.mesh||b.tri)test(b.mesh,b.asmComp,b.asmPath,b.tri);});
  return best;
}
function asmBalloonVisible(cid,view){
  // Point visible d'une instance du composant dans la vue, le plus proche du centre de sa boîte
  // projetée ; null si caché
  const C=asmBalloonCands(cid,view,9);
  return C.length?{p:C[0].p,path:C[0].path}:null;
}
function asmBalloonCands(cid,view,N){
  // Points VISIBLES de la première instance vue du composant (grille N × N sur sa boîte projetée),
  // du plus proche au plus loin du centre : candidats d'accroche d'une bulle
  const I=asmPlanInstances().filter(i=>i.comp===cid),c=asmComp(cid);
  if(!I.length||!c)return null;
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  asmPlanBodies(); // cache des instances (triangles exacts placés)
  for(const inst of I){
    // étendue projetée : triangles exacts de l'instance (cache du PLAN), sinon boîte de l'instantané
    let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
    const key=inst.path.join('/');
    (asmPlanCache?asmPlanCache.list:[]).forEach(e=>{if(!e.tri||(e.asmPath||[]).join('/')!==key)return;
      for(let k=0;k<e.tri.length;k+=3){const q=[e.tri[k],e.tri[k+1],e.tri[k+2]],a=dot(q,view.u),b=dot(q,view.v);
        x0=Math.min(x0,a);x1=Math.max(x1,a);y0=Math.min(y0,b);y1=Math.max(y1,b);}});
    if(!(x1>x0)&&c._snap&&c._snap.items.length){
      const B=asmSnapBox(c._snap).clone().applyMatrix4(asmMat4(inst.F));
      for(let k=0;k<8;k++){const q=[k&1?B.max.x:B.min.x,k&2?B.max.y:B.min.y,k&4?B.max.z:B.min.z];
        const a=dot(q,view.u),b=dot(q,view.v);x0=Math.min(x0,a);x1=Math.max(x1,a);y0=Math.min(y0,b);y1=Math.max(y1,b);}
    }
    if(!(x1>=x0))continue;
    const cx=(x0+x1)/2,cy=(y0+y1)/2,out=[];N=N||9;
    for(let i=0;i<N;i++)for(let j=0;j<N;j++){
      const lx=x0+(x1-x0)*(i+0.5)/N,ly=y0+(y1-y0)*(j+0.5)/N;
      const h=asmPlanHit(view.dir,view.u,view.v,lx,ly);
      if(h&&h.comp===cid)out.push({d:Math.hypot(lx-cx,ly-cy),p:h.p,path:h.path});
    }
    if(out.length)return out.sort((a,b)=>a.d-b.d);
  }
  return [];
}
function asmBalloonAnchor(cid){
  // Point d'accroche d'une bulle : centre de l'instantané de la première instance du composant
  const I=asmPlanInstances().find(i=>i.comp===cid);if(!I)return null;
  const c=asmComp(cid);let p=[0,0,0];
  try{if(c._snap&&c._snap.items.length){const b=asmSnapBox(c._snap),m=b.getCenter(new THREE.Vector3());p=[m.x,m.y,m.z];}}catch(e){}
  return asmApply(I.F,p);
}
