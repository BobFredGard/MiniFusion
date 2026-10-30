// Espace PLAN — suite de la fonction englobante ouverte dans 98-mep-00-modele.js (état privé partagé, fermée dans 98-mep-95-export-init.js) : cache géométrie, silhouettes, HLR (maillage et OCCT exact), rendu bitmap.
  /* ═══════════════ E. cache géométrie ═══════════════ */
  const mepGeoCache=new Map(); // viewId → {ver,sig,geo}
  function mepViewSig(v){
    let s=[v.kind==='dxf'?'dxf:'+((v.dxf&&v.dxf.rev)||0):'',mepRound(v.dir),mepRound(v.u),mepRound(v.v),v.bodyId||'',v.mode||'hide',v.tangent?1:0,
      v.hlrExact===false?'soft':'exact',v.shade?1:0,(v.render3d||v.real)?(v.mirror?'1m':1):0,v.real?'real':'',
      v.section?mepRound(v.section.p)+mepRound(v.section.n)+(v.section.pts?JSON.stringify(v.section.pts):''):'',v.detail?v.detail.cx+','+v.detail.cy+','+v.detail.r:'',mepOblOf(v)?'obl:'+mepOblOf(v).a+','+mepOblOf(v).k:'',mepPerspOf(v)?'persp:'+mepPerspOf(v).fov:'',v.asm?'asm:'+asmPlanSig():'',mepLocalSig(v)].join('|');
    /* l'ombrage et le rendu 3D dépendent de la couleur/opacité des corps :
       ces réglages ne changent pas _docVersion, donc on les met dans la clé
       de cache. Le thème influe aussi sur l'environnement du rendu 3D. */
    if(v.shade||v.render3d||v.real){
      try{
        s+='|'+mepMeshesOf(v).map(b=>{
          const st=mepBodyStyleOf(b);
          return (b.id||b.bodyId||'')+':'+st.col+':'+st.op;
        }).join(';');
      }catch(e){}
      if(v.real){try{s+='|rd:'+vEnvRealSig()+':'+mepMeshesOf(v).map(b=>{const L=vEnvLookOf(b.mesh);return L.mat+','+L.color+','+JSON.stringify(L.rel||0);}).join(';');}catch(e){}}
      if(v.render3d||v.real){
        try{s+='|th:'+(document.body.getAttribute('data-theme')||'');}catch(e){}
      }
    }
    return s;
  }
  function mepRound(a){return a?Array.from(a).map(x=>(+x).toFixed(3)).join(','):'';}
  /* 2026-10-22-008 : PROJECTION OBLIQUE (perspective cavalière) d'une vue principale
     (« vue caméra : vue non orthogonale avec réglage de la valeur de la fuyante ») —
     v.obl = {a: angle des fuyantes (°, depuis l'horizontale, vers le haut), k: coefficient
     de réduction}. Le plan de face reste en vraie grandeur ; la profondeur w (vers l'arrière)
     se dessine le long des fuyantes : papier = (P·u + k·w·cos a, P·v − k·w·sin a).
     Réalisé par un CISAILLEMENT exact de la forme (P' = P + k·w·(cos a·u − sin a·v), w = −P·dir)
     puis le HLR orthogonal habituel : arêtes cachées exactes pour la direction oblique. */
  function mepOblOf(v){
    const o=v&&v.kind==='base'&&!v.section&&!v.detail&&v.obl;
    if(!o)return null;
    const a=isFinite(+o.a)?Math.max(-180,Math.min(180,+o.a)):45;
    const k=(+o.k>0)?Math.min(2,+o.k):0.5;
    return{a,k};
  }
  function mepOblShear(sh,view){
    const O=mepOblOf(view);if(!O||!sh)return sh;
    const b=mepBasisOf(view),ca=Math.cos(O.a*Math.PI/180),sa=Math.sin(O.a*Math.PI/180);
    const sv=[O.k*(ca*b.u[0]-sa*b.v[0]),O.k*(ca*b.u[1]-sa*b.v[1]),O.k*(ca*b.u[2]-sa*b.v[2])];
    // M = I − s ⊗ dir  (w = −P·dir)
    const g=new occt.gp_GTrsf_1();
    for(let i=0;i<3;i++)for(let j=0;j<3;j++)g.SetValue(i+1,j+1,(i===j?1:0)-sv[i]*b.dir[j]);
    try{
      const t=new occt.BRepBuilderAPI_GTransform_2(sh,g,true);
      return t.IsDone()?t.Shape():sh;
    }catch(e){try{console.warn('mep oblique',e);}catch(e2){}return sh;}
  }
  /* 2026-10-22-010 : vue en PERSPECTIVE « comme la vue 3D » (retour : « pour la vue oblique je
     pensais plus comme la vue 3D ») — v.persp = {fov : angle de champ (°) = la « fuyante » :
     plus il est grand, plus les fuyantes convergent}. L'œil E est sur l'axe de la vue, à la
     distance qui fait tenir la pièce dans l'angle de champ ; le plan passant par le centre C
     de la pièce reste en VRAIE GRANDEUR : papier = C·(u,v) + (P−E)·(u,v) × dist / profondeur.
     Le noyau de ce build n'a pas de HLR perspective (HLRBRep_Algo absent) : arêtes EXACTES
     (occSharpEdges) + contours apparents du maillage vus depuis l'œil, visibilité par rayon
     œil → point sur le maillage. Rendu 3D : vraie caméra perspective, même cadre. */
  function mepPerspOf(v){
    const o=v&&v.kind==='base'&&!v.section&&!v.detail&&v.persp;
    if(!o)return null;
    return{fov:isFinite(+o.fov)?Math.max(5,Math.min(120,+o.fov)):35};
  }
  function mepPerspCam(view,list){
    const P=mepPerspOf(view);if(!P)return null;
    const b=mepBasisOf(view);
    let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9],n=0;
    (list||mepMeshesOf(view)).forEach(bd=>{
      try{const bb=new THREE.Box3().setFromObject(bd.mesh);if(bb.isEmpty())return;
        lo=[Math.min(lo[0],bb.min.x),Math.min(lo[1],bb.min.y),Math.min(lo[2],bb.min.z)];
        hi=[Math.max(hi[0],bb.max.x),Math.max(hi[1],bb.max.y),Math.max(hi[2],bb.max.z)];n++;}catch(e){}
    });
    if(!n)return null;
    const C=[(lo[0]+hi[0])/2,(lo[1]+hi[1])/2,(lo[2]+hi[2])/2];
    const S=Math.max(1,Math.hypot(hi[0]-lo[0],hi[1]-lo[1],hi[2]-lo[2]));
    const dist=(S/2)/Math.tan(P.fov*Math.PI/360)+S/2; // l'œil reste hors de la pièce
    const E=[C[0]+b.dir[0]*dist,C[1]+b.dir[1]*dist,C[2]+b.dir[2]*dist];
    const cu=mepDot(C,b.u),cv=mepDot(C,b.v);
    const proj=p=>{const q=[p[0]-E[0],p[1]-E[1],p[2]-E[2]],dep=Math.max(1e-6,-mepDot(q,b.dir)),f=dist/dep;
      return[cu+mepDot(q,b.u)*f,cv+mepDot(q,b.v)*f,dep];};
    return{fov:P.fov,E,C,S,dist,b,proj,cu,cv};
  }
  function mepPerspBuild(geo,view,list,shapes,exact,mode){
    const K=mepPerspCam(view,list);if(!K){geo.src='aucun corps';return geo;}
    const meshes=list.map(bd=>bd.mesh).filter(Boolean);
    meshes.forEach(m=>{try{m.updateMatrixWorld(true);}catch(e){}});
    const rc=new THREE.Raycaster(),tol=Math.max(0.05,K.S*0.004);
    const visible=p=>{
      if(mode==='wire'||!meshes.length)return true;
      const d=[p[0]-K.E[0],p[1]-K.E[1],p[2]-K.E[2]],L=Math.hypot(d[0],d[1],d[2]);if(!(L>1e-9))return true;
      rc.set(new THREE.Vector3(K.E[0],K.E[1],K.E[2]),new THREE.Vector3(d[0]/L,d[1]/L,d[2]/L));
      rc.far=L-tol;rc.near=0;
      try{return rc.intersectObjects(meshes,false).length===0;}catch(e){return true;}
    };
    const step=Math.max(0.3,K.S/120); // pas d'échantillonnage (mm modèle)
    const emit=(pts,kind)=>{
      // polyligne 3D → tronçons visibles (et cachés en mode pointillé), projetés en perspective
      const P=[];
      for(let i=0;i+1<pts.length;i++){
        const a=pts[i],c=pts[i+1],L=Math.hypot(c[0]-a[0],c[1]-a[1],c[2]-a[2]),n=Math.min(200,Math.max(1,Math.ceil(L/step)));
        for(let k=(i?1:0);k<=n;k++){const t=k/n;P.push([a[0]+(c[0]-a[0])*t,a[1]+(c[1]-a[1])*t,a[2]+(c[2]-a[2])*t]);}
      }
      if(P.length<2)return;
      const V=P.map(visible),Q=P.map(K.proj);
      for(let i=0;i+1<P.length;i++){
        const vis=V[i]&&V[i+1];
        if(!vis&&mode!=='dash')continue;
        const a=Q[i],c=Q[i+1];if(Math.hypot(c[0]-a[0],c[1]-a[1])<1e-6)continue;
        geo.els.push({t:'L',x1:a[0],y1:a[1],x2:c[0],y2:c[1],k:vis?kind:'hidden'});
      }
    };
    // arêtes exactes
    if(exact)shapes.forEach(sh=>{
      let edges=[];try{edges=occSharpEdges(sh)||[];}catch(e){edges=[];}
      edges.forEach(e=>{
        if(!e||!e.pts||e.pts.length<2)return;
        if(!e.sharp&&!view.tangent)return;
        emit(e.pts.map(p=>(p&&typeof p.x==='number')?[p.x,p.y,p.z]:p).filter(Boolean),e.sharp?'sharp':'tangent');
      });
    });
    // contours apparents vus de l'œil (faces lisses) + arêtes de maillage des corps sans solide exact
    list.forEach(bd=>{
      const g=bd.mesh&&bd.mesh.geometry;if(!g||!g.attributes||!g.attributes.position)return;
      const pos=g.attributes.position,idx=g.index,mw=bd.mesh.matrixWorld.elements;
      const nT=Math.min(120000,idx?idx.count/3:pos.count/3);
      const W=i=>{const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
        return[mw[0]*x+mw[4]*y+mw[8]*z+mw[12],mw[1]*x+mw[5]*y+mw[9]*z+mw[13],mw[2]*x+mw[6]*y+mw[10]*z+mw[14]];};
      const key=p=>p.map(x=>Math.round(x*1e3)).join(',');
      const emap=new Map();
      const hasExact=exact&&shapes.length&&!!mepExactOf(bd);
      for(let t=0;t<nT;t++){
        const ii=[idx?idx.getX(3*t):3*t,idx?idx.getX(3*t+1):3*t+1,idx?idx.getX(3*t+2):3*t+2],A=ii.map(W);
        const nn=mepCross([A[1][0]-A[0][0],A[1][1]-A[0][1],A[1][2]-A[0][2]],[A[2][0]-A[0][0],A[2][1]-A[0][1],A[2][2]-A[0][2]]);
        const nl=Math.hypot(nn[0],nn[1],nn[2]);if(!(nl>1e-12))continue;
        const N=[nn[0]/nl,nn[1]/nl,nn[2]/nl],m=[(A[0][0]+A[1][0]+A[2][0])/3,(A[0][1]+A[1][1]+A[2][1])/3,(A[0][2]+A[1][2]+A[2][2])/3];
        const front=mepDot(N,[K.E[0]-m[0],K.E[1]-m[1],K.E[2]-m[2]])>0;
        for(let k=0;k<3;k++){const a=A[k],c=A[(k+1)%3],ka=key(a),kc=key(c),kk=ka<kc?ka+'|'+kc:kc+'|'+ka;
          const r=emap.get(kk);if(r)r.f.push({front,N});else emap.set(kk,{a,c,f:[{front,N}]});}
      }
      emap.forEach(r=>{
        if(r.f.length===2){
          const s=mepDot(r.f[0].N,r.f[1].N);
          if(r.f[0].front!==r.f[1].front&&(s>0.85||!hasExact))emit([r.a,r.c],'sharp'); // contour apparent
          else if(!hasExact&&s<0.85&&(r.f[0].front||r.f[1].front))emit([r.a,r.c],'sharp'); // arête vive (maillage seul)
        }else if(r.f.length===1&&!hasExact)emit([r.a,r.c],'sharp');
      });
    });
    geo.src=exact?'OCCT (perspective)':'maillage (perspective)';
    view._persp={E:K.E,dist:K.dist,cu:K.cu,cv:K.cv};
    return geo;
  }
  function mepGeoOf(view){
    const c=mepGeoCache.get(view.id);
    const ver=(typeof _docVersion!=='undefined')?_docVersion:0;
    if(c&&c.ver===ver&&c.sig===mepViewSig(view))return c.geo;
    const geo=mepBuildGeo(view);
    mepGeoCache.set(view.id,{ver,sig:mepViewSig(view),geo});
    return geo;
  }
  /* ═══════════════ F. silhouette de maillage ═══════════════ */
  function mepSilhouettes(mesh,viewDir){
    const g=mesh&&mesh.geometry;if(!g||!g.attributes||!g.attributes.position)return[];
    const pos=g.attributes.position,idx=g.index;
    const nT=idx?idx.count/3:pos.count/3;
    if(!(nT>0)||nT>400000)return[];
    const side=new Int8Array(nT);
    const edgeMap=new Map(); // clé sommet quantisé → [tri…]
    const vi=(t,k)=>idx?idx.getX(t*3+k):t*3+k;
    // Les positions de géométrie sont locales au maillage : une pièce importée
    // peut avoir une matrice monde non identitaire. Sans cette transformation,
    // les silhouettes ne coïncident plus avec les arêtes OCCT projetées et les
    // tangentes extérieures restent grises.
    const mw=mesh.matrixWorld?mesh.matrixWorld.elements:null;
    const P=i=>{
      const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
      if(!mw)return[x,y,z];
      return[mw[0]*x+mw[4]*y+mw[8]*z+mw[12],
        mw[1]*x+mw[5]*y+mw[9]*z+mw[13],
        mw[2]*x+mw[6]*y+mw[10]*z+mw[14]];
    };
    const qp=p=>Math.round(p[0]*200)+','+Math.round(p[1]*200)+','+Math.round(p[2]*200);
    for(let t=0;t<nT;t++){
      const a=vi(t,0),b=vi(t,1),c=vi(t,2);
      const A=P(a),B=P(b),C=P(c);
      const e1=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],e2=[C[0]-A[0],C[1]-A[1],C[2]-A[2]];
      const n=mepCross(e1,e2);
      const f=mepDot(n,viewDir);
      side[t]=f>1e-9?1:(f<-1e-9?-1:1);
      [[A,B],[B,C],[C,A]].forEach(pr=>{
        const k=qp(pr[0])+';'+qp(pr[1]);
        const k2=qp(pr[1])+';'+qp(pr[0]);
        const key=edgeMap.has(k)?k:(edgeMap.has(k2)?k2:k);
        if(!edgeMap.has(key))edgeMap.set(key,[]);
        const arr=edgeMap.get(key);
        if(arr.length<2)arr.push(t);
      });
    }
    // reconstruit les coords exactes des deux sommets via le premier triangle
    const res=[];
    const done=new Set();
    edgeMap.forEach((tris,key)=>{
      if(tris.length<2||side[tris[0]]===side[tris[1]]||done.has(key))return;done.add(key);
      const t=tris[0];
      const A=P(vi(t,0)),B=P(vi(t,1)),C=P(vi(t,2));
      const parts=key.split(';');
      const findPt=qs=>{
        const cand=[A,B,C];
        for(let i=0;i<cand.length;i++){
          if(qp(cand[i])===qs)return cand[i];
        }
        const arr=qs.split(',').map(Number);
        return[arr[0]/200,arr[1]/200,arr[2]/200];
      };
      res.push([findPt(parts[0]),findPt(parts[1])]);
    });
    return res;
  }
  /* ═══════════════ G. HLR ═══════════════ */
  let mepRC=null;
  function mepMeshesOf(view){
    // vue « Assemblage » (V0.6.7) : corps du composant actif + ceux de ses instances (48-composants-plan)
    if(view&&view.asm&&asmPlanOn())return asmPlanBodies();
    const out=[];const list=(typeof bodies!=='undefined'&&bodies)||[];
    list.forEach(b=>{
      if(!b||b.ghost||b.kind==='ghost'||!b.mesh||b.mesh.visible===false)return;
      if(view.bodyId&&b.bodyId!==view.bodyId&&b.id!==view.bodyId)return;
      out.push(b);
    });
    return out;
  }
  /* style d'un corps pour l'ombrage PLAN : couleur + opacité réelles (3D) */
  function mepBodyStyleOf(b){
    let id=null;
    try{id=(typeof bodyIdOfRuntime==='function')?bodyIdOfRuntime(b):(b&&b.bodyId);}catch(e){}
    let col=(b&&b.color)||0x9a9aa0;
    try{if(id&&typeof bodyColorOf==='function')col=bodyColorOf(id)||col;}catch(e){}
    let op=1;
    const mm=b&&b.mesh&&b.mesh.material;
    const m=Array.isArray(mm)?mm[0]:mm;
    if(m&&m.transparent&&typeof m.opacity==='number')op=m.opacity;
    else{
      try{
        if(id&&typeof bodyOpOf==='function')op=bodyOpOf(id);
        if(id&&typeof bodyGlassOf==='function')op=Math.min(op,bodyGlassOf(id));
      }catch(e){}
    }
    if(!(op>0.05&&op<=1))op=1;
    return{id: id,col: col,op: op,transparent: op<0.999};
  }
  function mepShadeLights(view){
    const d=view.dir,u=view.u,v=view.v;
    return{
      L1:mepNorm([d[0]*0.50+u[0]*0.65-v[0]*0.35,
        d[1]*0.50+u[1]*0.65-v[1]*0.35,
        d[2]*0.50+u[2]*0.65-v[2]*0.35]),
      L2:mepNorm([d[0]*0.35-u[0]*0.60+v[0]*0.50,
        d[1]*0.35-u[1]*0.60+v[1]*0.50,
        d[2]*0.35-u[2]*0.60+v[2]*0.50])
    };
  }
  function mepShadeHex(c,k){
    const r=(c>>16)&255,g=(c>>8)&255,b=c&255;
    const sh=x=>Math.max(0,Math.min(255,Math.round(x*k+14)));
    return'#'+sh(r).toString(16).padStart(2,'0')+sh(g).toString(16).padStart(2,'0')+sh(b).toString(16).padStart(2,'0');
  }
  /* triangle monde → face ombrée projetée ; null si face arrière ou dégénérée */
  function mepShadeTri(view,A,B,C,col,op,lights){
    lights=lights||mepShadeLights(view);
    const e1=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],e2=[C[0]-A[0],C[1]-A[1],C[2]-A[2]];
    let n=mepCross(e1,e2);
    const nl=Math.hypot(n[0],n[1],n[2]);
    if(!(nl>1e-9))return null;
    n=[n[0]/nl,n[1]/nl,n[2]/nl];
    const d=view.dir,u=view.u,v=view.v;
    // vue oblique (cavalière) : projecteur q = dir + k(cos a·u − sin a·v), papier cisaillé
    const O=mepOblOf(view),kc=O?O.k*Math.cos(O.a*Math.PI/180):0,ks=O?O.k*Math.sin(O.a*Math.PI/180):0;
    const q=O?[d[0]+kc*u[0]-ks*v[0],d[1]+kc*u[1]-ks*v[1],d[2]+kc*u[2]-ks*v[2]]:d;
    const K=mepPerspOf(view)?(view._pk||(view._pk=mepPerspCam(view))):null; // perspective : vers l'œil
    if(K){if(mepDot(n,[K.E[0]-A[0],K.E[1]-A[1],K.E[2]-A[2]])<=1e-7)return null;}
    else if(mepDot(n,q)<=1e-7)return null;
    const P=K?(p=>{const r=K.proj(p);return[r[0],r[1],-r[2]];}):O?(p=>{const w=-mepDot(p,d);return[mepDot(p,u)+kc*w,mepDot(p,v)-ks*w,mepDot(p,d)];})
      :(p=>[mepDot(p,u),mepDot(p,v),mepDot(p,d)]);
    const a=P(A),b=P(B),c=P(C);
    const area=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
    if(Math.abs(area)<1e-6)return null;
    const k=Math.min(1.08,0.34+0.62*Math.max(0,mepDot(n,lights.L1))
      +0.22*Math.max(0,mepDot(n,lights.L2)));
    return{p:[a,b,c],c:mepShadeHex(col,k),o:op,d:(a[2]+b[2]+c[2])/3};
  }
  function mepShadedFaces(view){
    const faces=[];
    const list=mepMeshesOf(view);
    if(!list.length)return faces;
    const lights=mepShadeLights(view);
    view._pk=null; // caméra perspective recalculée pour ce jeu de faces
    const mwOf=b=>b.mesh&&b.mesh.matrixWorld;
    const wp=(pos,mw,i)=>{
      const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
      const e=mw&&mw.elements;
      if(!e)return[x,y,z];
      return[e[0]*x+e[4]*y+e[8]*z+e[12],
        e[1]*x+e[5]*y+e[9]*z+e[13],
        e[2]*x+e[6]*y+e[10]*z+e[14]];
    };
    list.forEach(bd=>{
      const g=bd.mesh&&bd.mesh.geometry;
      if(!g||!g.attributes||!g.attributes.position)return;
      const pos=g.attributes.position,idx=g.index;
      const nT=idx?idx.count/3:pos.count/3;
      if(!(nT>0)||nT>200000)return;
      try{bd.mesh.updateMatrixWorld();}catch(e){}
      const mw=mwOf(bd),st=mepBodyStyleOf(bd);
      const e=mw&&mw.elements;
      const det=e?(e[0]*(e[5]*e[10]-e[6]*e[9])-e[4]*(e[1]*e[10]-e[2]*e[9])+e[8]*(e[1]*e[6]-e[2]*e[5])):1;
      const flip=det<0;
      const maxT=Math.min(nT,160000);
      for(let t=0;t<maxT;t++){
        const i0=idx?idx.getX(t*3):t*3;
        const i1=idx?idx.getX(t*3+1):t*3+1;
        const i2=idx?idx.getX(t*3+2):t*3+2;
        const A=wp(pos,mw,i0),B=wp(pos,mw,i1),C=wp(pos,mw,i2);
        const f=mepShadeTri(view,A,flip?C:B,flip?B:C,
          st.col,st.op,lights);
        if(f)faces.push(f);
      }
    });
    faces.sort((a,b)=>a.d-b.d); // peintre : du plus loin au plus proche
    return faces;
  }
  /* filets cosmétiques en ombrage (2026-10-23) : l'hélice de la vue 3D, projetée comme les faces ;
     seuls les morceaux visibles (lancer de rayon vers l'observateur) sont gardés. En descendant
     dans le trou, un tour entièrement caché arrête l'hélice : plus bas, tout l'est aussi. */
  function mepThreadSegs(view){
    if(typeof holeThreadPaths!=='function')return[];
    const meshes=mepMeshesOf(view);if(!meshes.length)return[];
    const d=view.dir,u=view.u,v=view.v;
    const O=mepOblOf(view),kc=O?O.k*Math.cos(O.a*Math.PI/180):0,ks=O?O.k*Math.sin(O.a*Math.PI/180):0;
    const q=O?[d[0]+kc*u[0]-ks*v[0],d[1]+kc*u[1]-ks*v[1],d[2]+kc*u[2]-ks*v[2]]:d;
    const ql=Math.hypot(q[0],q[1],q[2])||1,qn=[q[0]/ql,q[1]/ql,q[2]/ql];
    const K=mepPerspOf(view)?(view._pk||(view._pk=mepPerspCam(view))):null;
    const P=K?(p=>K.proj(p)):O?(p=>{const w=-mepDot(p,d);return[mepDot(p,u)+kc*w,mepDot(p,v)-ks*w];}):(p=>[mepDot(p,u),mepDot(p,v)]);
    const toEye=p=>{if(!K)return qn;const e=[K.E[0]-p[0],K.E[1]-p[1],K.E[2]-p[2]],l=Math.hypot(e[0],e[1],e[2])||1;return[e[0]/l,e[1]/l,e[2]/l];};
    const vis=(a,b)=>{const m=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];return mepVisible(m,toEye(m),null,meshes);};
    const out=[];
    const memo=new Map();
    holeThreadPaths(16,0.12).forEach(T=>{ // 0,12 mm vers l'axe : hors des facettes de la paroi
      if(view.bodyId&&T.bodyId&&T.bodyId!==view.bodyId)return;
      if(typeof holeThreadBodyShown==='function'&&!holeThreadBodyShown(T.bodyId,memo))return; // corps caché : ses filets aussi
      const H=T.helix,per=Math.max(4,Math.round(T.spt||16));
      let hidRun=0;
      for(let i=1;i<H.length;i++){
        if(vis(H[i-1],H[i])){const a=P(H[i-1]),b=P(H[i]);out.push([a[0],a[1],b[0],b[1],0]);hidRun=0;}
        else if(++hidRun>=per&&i>per)break;
      }
      const R=T.ring;
      for(let i=1;i<R.length;i++)if(vis(R[i-1],R[i])){const a=P(R[i-1]),b=P(R[i]);out.push([a[0],a[1],b[0],b[1],1]);}
    });
    return out;
  }
  /* ═══════════════ D2. rendu 3D bitmap d'une vue ═══════════════ */
  /* Rendu orthographique hors écran, aligné sur la base papier de la vue :
    la caméra regarde le long de view.dir, avec up=-view.v. L'image obtenue
    couvre exactement le même cadre (u,v) que les arêtes et les cotes. */
  function mepRender3dImage(view,inner){
    // rendu réaliste (V0.23.4) : même image, matières du Rendu direct (98-rendu-vue) le temps du rendu
    if(view.real&&!inner&&typeof vEnvRealDo==='function'){
      try{return vEnvRealDo(mepMeshesOf(view).map(b=>b.mesh).filter(Boolean),()=>mepRender3dImage(view,true));}catch(e){return null;}
    }
    try{
      if(typeof THREE==='undefined'||typeof renderer==='undefined'||!renderer||
        typeof scene==='undefined'||!scene)return null;
      const list=mepMeshesOf(view);
      if(!list.length)return null;
      const b=mepBasisOf(view);view.dir=b.dir;view.u=b.u;view.v=b.v;
      // miroir (option de la vue) : reflet de la pièce seule sous son point le plus bas (Z monde),
      // estompé vers le bas sur 60 % de sa hauteur — ni sol ni ombre ; le reflet entre dans le cadre
      const mir=!!view.mirror;
      let fz=Infinity,tz=-Infinity;
      const u=b.u,vv=b.v,dir=b.dir;
      const O=mepOblOf(view),kc=O?O.k*Math.cos(O.a*Math.PI/180):0,ks=O?O.k*Math.sin(O.a*Math.PI/180):0;
      let minu=1e9,maxu=-1e9,minv=1e9,maxv=-1e9,mind=1e9,maxd=-1e9,n=0;
      let su0=1e9,su1=-1e9,sv0=1e9,sv1=-1e9; // cadre papier (cisaillé en oblique)
      const K=mepPerspOf(view)?mepPerspCam(view,list):null; // perspective : cadre projeté
      for(let bi=0;bi<list.length;bi++){
        const mesh=list[bi]&&list[bi].mesh;
        const g=mesh&&mesh.geometry;
        if(!g||!g.attributes||!g.attributes.position)continue;
        try{mesh.updateMatrixWorld(true);}catch(e){}
        const pos=g.attributes.position,idx=g.index;
        const mw=mesh.matrixWorld&&mesh.matrixWorld.elements;
        const count=idx?idx.count:pos.count;
        for(let i=0;i<count;i++){
          const j=idx?idx.getX(i):i;
          const x=pos.getX(j),y=pos.getY(j),z=pos.getZ(j);
          const px=mw?(mw[0]*x+mw[4]*y+mw[8]*z+mw[12]):x;
          const py=mw?(mw[1]*x+mw[5]*y+mw[9]*z+mw[13]):y;
          const pz=mw?(mw[2]*x+mw[6]*y+mw[10]*z+mw[14]):z;
          if(pz<fz)fz=pz;if(pz>tz)tz=pz;
          const du=px*u[0]+py*u[1]+pz*u[2];
          const dv=px*vv[0]+py*vv[1]+pz*vv[2];
          const dd=px*dir[0]+py*dir[1]+pz*dir[2];
          if(du<minu)minu=du;if(du>maxu)maxu=du;
          if(dv<minv)minv=dv;if(dv>maxv)maxv=dv;
          if(dd<mind)mind=dd;if(dd>maxd)maxd=dd;
          let su=du-kc*dd,sv=dv+ks*dd; // w = −dd
          if(K){const q=K.proj([px,py,pz]);su=q[0];sv=q[1];}
          if(su<su0)su0=su;if(su>su1)su1=su;if(sv<sv0)sv0=sv;if(sv>sv1)sv1=sv;
          n++;
        }
      }
      if(!n||!(maxu>minu)||!(maxv>minv))return null;
      const fadeL=Math.max(1,(tz-fz)*0.6);
      if(mir&&isFinite(fz)){ // 2e passe : sommets réfléchis (z -> 2 fz - z, bornés à la zone de fondu), cadre élargi au reflet
        for(let bi=0;bi<list.length;bi++){
          const mesh=list[bi]&&list[bi].mesh,g=mesh&&mesh.geometry;if(!g||!g.attributes||!g.attributes.position)continue;
          const pos=g.attributes.position,mw=mesh.matrixWorld&&mesh.matrixWorld.elements,st=Math.max(1,Math.floor(pos.count/20000));
          for(let j=0;j<pos.count;j+=st){
            const x=pos.getX(j),y=pos.getY(j),z=pos.getZ(j);
            const px=mw?(mw[0]*x+mw[4]*y+mw[8]*z+mw[12]):x,py=mw?(mw[1]*x+mw[5]*y+mw[9]*z+mw[13]):y;
            const pz=Math.max(fz-fadeL,2*fz-(mw?(mw[2]*x+mw[6]*y+mw[10]*z+mw[14]):z));
            const du=px*u[0]+py*u[1]+pz*u[2],dv=px*vv[0]+py*vv[1]+pz*vv[2],dd=px*dir[0]+py*dir[1]+pz*dir[2];
            if(du<minu)minu=du;if(du>maxu)maxu=du;if(dv<minv)minv=dv;if(dv>maxv)maxv=dv;if(dd<mind)mind=dd;if(dd>maxd)maxd=dd;
            let su=du-kc*dd,sv=dv+ks*dd;
            if(K){const q=K.proj([px,py,pz]);su=q[0];sv=q[1];}
            if(su<su0)su0=su;if(su>su1)su1=su;if(sv<sv0)sv0=sv;if(sv>sv1)sv1=sv;
          }
        }
      }
      const pad=Math.max(0.5,(maxu-minu+maxv-minv)*0.012);
      const l=su0-pad,r=su1+pad,t=sv0-pad,btm=sv1+pad;
      const aspect=(r-l)/Math.max(1e-9,btm-t);
      const LONG=1600;
      let W,H;
      if(aspect>=1){W=LONG;H=Math.max(64,Math.round(W/aspect));}
      else{H=LONG;W=Math.max(64,Math.round(H*aspect));}
      const cx=(minu+maxu)/2,cy=(minv+maxv)/2,cd=(mind+maxd)/2;
      const center=new THREE.Vector3(
        u[0]*cx+vv[0]*cy+dir[0]*cd,
        u[1]*cx+vv[1]*cy+dir[1]*cd,
        u[2]*cx+vv[2]*cy+dir[2]*cd);
      /* la caméra vise le centre : le frustum est exprimé dans SES coordonnées,
         donc relatif au centre (u,v), pas dans les coordonnées papier absolues. */
      const depth=Math.max(1,maxd-mind);
      const dist=depth*2+Math.max(10,(maxu-minu+maxv-minv));
      // centre papier (cisaillé) du point visé : le frustum est relatif à lui
      const cxs=cx-kc*cd,cys=cy+ks*cd;
      let cam;
      if(K){
        // vraie caméra perspective à l'œil, frustum décentré sur le cadre papier (plan de C en vraie grandeur)
        const near=Math.max(0.05,K.dist-K.S),far=K.dist+K.S*2;
        cam=new THREE.PerspectiveCamera(K.fov,1,near,far);
        cam.up.set(-vv[0],-vv[1],-vv[2]);
        cam.position.set(K.E[0],K.E[1],K.E[2]);
        cam.lookAt(new THREE.Vector3(K.C[0],K.C[1],K.C[2]));
        const f=near/K.dist;
        cam.projectionMatrix.makePerspective((l-K.cu)*f,(r-K.cu)*f,-(t-K.cv)*f,-(btm-K.cv)*f,near,far);
        if(cam.projectionMatrixInverse)cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
      }else{
      cam=new THREE.OrthographicCamera(l-cxs,r-cxs,cys-t,cys-btm,0.01,dist+depth*3+100);
      cam.up.set(-vv[0],-vv[1],-vv[2]);
      cam.position.set(center.x+dir[0]*dist,center.y+dir[1]*dist,center.z+dir[2]*dist);
      cam.lookAt(center);
      cam.updateProjectionMatrix();
      }
      if(O){
        // repère caméra : x = u, y = −v, z = dir ; profondeur relative (P−C)·dir = z + dist
        // x' = x − kc(z + dist), y' = y − ks(z + dist)  (cavalière, cf. mepOblShear)
        const S=new THREE.Matrix4().set(1,0,-kc,-kc*dist, 0,1,-ks,-ks*dist, 0,0,1,0, 0,0,0,1);
        cam.projectionMatrix.multiply(S);
        if(cam.projectionMatrixInverse)cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
      }
      cam.updateMatrixWorld(true);
      /* ne garder que les corps de la vue et les lumières : pas de sol,
         de repère, d'arêtes ni d'esquisse dans l'image. */
      const keep=new Set();
      list.forEach(bd=>{
        let o=bd.mesh;
        while(o){keep.add(o);o=o.parent;}
      });
      // filets cosmétiques des trous de la vue (comme la 3D) : groupe temporaire
      let thrGrp=null;
      try{
        if(typeof holeThreadPaths==='function'){
          const hel=[],rng=[],seg=(arr,pts)=>{for(let i=1;i<pts.length;i++){const p=pts[i-1],q=pts[i];arr.push(p[0],p[1],p[2],q[0],q[1],q[2]);}};
          const memo=new Map();
          holeThreadPaths().forEach(T=>{if(view.bodyId&&T.bodyId&&T.bodyId!==view.bodyId)return;
            if(typeof holeThreadBodyShown==='function'&&!holeThreadBodyShown(T.bodyId,memo))return; // corps caché : ses filets aussi
            seg(hel,T.helix);seg(rng,T.ring);});
          if(hel.length){
            thrGrp=new THREE.Group();
            const mkL=(arr,dash)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));
              const m=dash?new THREE.LineDashedMaterial({color:0xe8930c,dashSize:0.8,gapSize:0.6}):new THREE.LineBasicMaterial({color:0xe8930c});
              const l=new THREE.LineSegments(g,m);if(dash&&l.computeLineDistances)l.computeLineDistances();return l;};
            thrGrp.add(mkL(hel,false));if(rng.length)thrGrp.add(mkL(rng,true));
            scene.add(thrGrp);thrGrp.traverse(o=>keep.add(o));
          }
        }
      }catch(e){thrGrp=null;}
      scene.traverse(o=>{
        if(o&&o.isLight){let p=o;while(p){keep.add(p);p=p.parent;}}
      });
      const saved=[];
      scene.traverse(o=>{
        if(o!==scene&&!keep.has(o)){saved.push([o,o.visible]);o.visible=false;}
      });
      const oldTarget=renderer.getRenderTarget?renderer.getRenderTarget():null;
      const oldClear=renderer.getClearColor?renderer.getClearColor(new THREE.Color()):null;
      const oldAlpha=renderer.getClearAlpha?renderer.getClearAlpha():1;
      const oldAuto=renderer.autoClear;
      const oldVp=renderer.getViewport?renderer.getViewport(new THREE.Vector4()):null;
      const oldBg=scene.background;
      let rt=null;
      // reflet : copie symétrique de chaque corps (même géométrie), opacité décroissante vers le bas
      const mirObjs=[];
      if(mir&&isFinite(fz)){
        try{
          const M=new THREE.Matrix4().makeTranslation(0,0,fz).multiply(new THREE.Matrix4().makeScale(1,1,-1)).multiply(new THREE.Matrix4().makeTranslation(0,0,-fz));
          list.forEach(bd=>{
            const src=bd.mesh;if(!src||!src.geometry)return;
            const mats=(Array.isArray(src.material)?src.material:[src.material]).map(m0=>{
              const m=m0.clone();m.transparent=true;m.depthWrite=true;
              const ob=inner&&m0.userData&&m0.userData.vEnv?m0.onBeforeCompile:null; // rendu réaliste : matière du Rendu direct, puis le fondu
              m.onBeforeCompile=sh=>{if(ob)ob.call(m0,sh);
                sh.uniforms.uFz={value:fz};sh.uniforms.uFl={value:fadeL};
                sh.vertexShader='varying float vMz;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vMz=(modelMatrix*vec4(transformed,1.0)).z;');
                sh.fragmentShader='uniform float uFz; uniform float uFl; varying float vMz;\n'+sh.fragmentShader.replace('#include <dithering_fragment>',
                  '#include <dithering_fragment>\n { float t=clamp((uFz-vMz)/uFl,0.0,1.0); gl_FragColor.a*=0.5*(1.0-t)*(1.0-t); }');
              };
              m.customProgramCacheKey=()=>ob?'mepMirrorReal':'mepMirror';
              return m;});
            const o=new THREE.Mesh(src.geometry,Array.isArray(src.material)?mats:mats[0]);
            o.matrixAutoUpdate=false;o.matrix.copy(M).multiply(src.matrixWorld);o.matrixWorld.copy(o.matrix);o.renderOrder=-1;
            scene.add(o);keep.add(o);mirObjs.push(o);
          });
        }catch(e){}
      }
      try{
        scene.background=null;
        rt=new THREE.WebGLRenderTarget(W,H,{minFilter:THREE.LinearFilter,
          magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,
          type:THREE.UnsignedByteType,depthBuffer:true,stencilBuffer:false});
        renderer.setRenderTarget(rt);
        /* setViewport est exprimé en pixels CSS : Three le multiplie par le
           pixel ratio du renderer. Sans division, l'image 1600 px est rendue
           dans un viewport 1600×pr puis rognée/décalée. */
        const pr=(renderer.getPixelRatio?renderer.getPixelRatio():1)||1;
        if(renderer.setViewport)renderer.setViewport(0,0,W/pr,H/pr);
        renderer.setClearColor(0x000000,0);
        renderer.autoClear=true;
        renderer.render(scene,cam);
        if(typeof renderer.readRenderTargetPixels!=='function')return null;
        const buf=new Uint8Array(W*H*4);
        renderer.readRenderTargetPixels(rt,0,0,W,H,buf);
        const cv=document.createElement('canvas');cv.width=W;cv.height=H;
        const ctx=cv.getContext('2d');
        if(!ctx)return null;
        const img=ctx.createImageData(W,H);
        const row=W*4;
        for(let y=0;y<H;y++){
          const src=(H-1-y)*row;
          img.data.set(buf.subarray(src,src+row),y*row);
        }
        // fond transparent (0,0,0,0) : un pixel semi-transparent (reflet, bords lissés) est stocké
        // « couleur × alpha » — on rend la couleur vraie, sinon le PNG l'assombrit (reflet gris)
        const px=img.data;
        for(let i=0;i<px.length;i+=4){const a=px[i+3];if(a>0&&a<255){const k=255/a;
          px[i]=Math.min(255,px[i]*k);px[i+1]=Math.min(255,px[i+1]*k);px[i+2]=Math.min(255,px[i+2]*k);}}
        ctx.putImageData(img,0,0);
        const url=cv.toDataURL('image/png');
        if(!url||url.length<16)return null;
        /* placement en coordonnées locales : le déplacement/zoom de la vue
           réutilise l'image sans refaire le rendu WebGL ni le HLR. */
        return{url:url,lx:+l.toFixed(3),ly:+t.toFixed(3),
          lw:+(r-l).toFixed(3),lh:+(btm-t).toFixed(3)};
      }finally{
        for(let i=0;i<saved.length;i++)saved[i][0].visible=saved[i][1];
        if(thrGrp){try{scene.remove(thrGrp);thrGrp.traverse(o=>{try{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();}catch(e){}});}catch(e){}}
        mirObjs.forEach(o=>{try{scene.remove(o);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}catch(e){}});
        scene.background=oldBg;
        try{if(oldClear)renderer.setClearColor(oldClear,oldAlpha);}catch(e){}
        renderer.autoClear=oldAuto;
        try{renderer.setRenderTarget(oldTarget||null);}catch(e){}
        try{if(oldVp&&renderer.setViewport)renderer.setViewport(oldVp);}catch(e){}
        try{rt&&rt.dispose();}catch(e){}
      }
    }catch(e){return null;}
  }

  function mepVisible(p3,viewDir,sec,meshes){
    // true si le point n'est pas masqué ; sec = {p0,gaze} : seuls les occludeurs derrière le plan comptent
    meshes=meshes||[];
    if(!meshes.length)return true;
    try{
      if(!mepRC)mepRC=new THREE.Raycaster();
      const rc=mepRC;
      const start=new THREE.Vector3(p3[0]+viewDir[0]*3000,p3[1]+viewDir[1]*3000,p3[2]+viewDir[2]*3000);
      const dir=new THREE.Vector3(-viewDir[0],-viewDir[1],-viewDir[2]);
      rc.set(start,dir);
      rc.far=3000.5;
      const hits=rc.intersectObjects(meshes.map(b=>b.mesh),false);
      if(!hits||!hits.length)return true;
      const dToP=3000;
      for(let i=0;i<hits.length;i++){
        const h=hits[i];
        if(h.distance>=dToP-0.4)break;              // derrière le point : pas un ocoueur
        if(sec){
          const hp=[h.point.x,h.point.y,h.point.z];
          if(mepDot(mepSub(hp,sec.p0),sec.gaze)>0.02)continue; // matière côté coupé (déjà retirée)
        }
        return false;
      }
      return true;
    }catch(e){return true;}
  }
  function mepVisFn(view,meshes){
    const vd=view.dir,sec=view._sec||null;
    meshes=(meshes||mepMeshesOf(view)).filter(b=>b.mesh);
    return p=>mepVisible(p,vd,sec,meshes);
  }
  /* HLR par tampon de profondeur logiciel : une rasterisation des triangles
     projetés (garde la profondeur max = surface la plus proche de l'observateur),
     puis test d'occlusion O(1) par point. Bien plus rapide que le raycast. */
  function mepDepthVis(view,meshes){
    try{
      const W=2048,H=2048;
      const u=view.u,vv=view.v,dir=view.dir;
      let minu=1e9,maxu=-1e9,minv=1e9,maxv=-1e9,mind=1e9,maxd=-1e9;
      const flat=[]; // triangles plats [du,dv,dd × 3]
      const tmp=new THREE.Vector3();
      for(let bi=0;bi<meshes.length;bi++){
        const g=meshes[bi].mesh&&meshes[bi].mesh.geometry;
        if(!g||!g.attributes||!g.attributes.position)continue;
        try{meshes[bi].mesh.updateMatrixWorld();}catch(e){}
        const pos=g.attributes.position,idx=g.index;
        const nT=idx?idx.count/3:pos.count/3;
        const mw=meshes[bi].mesh.matrixWorld;
        const proj=i=>{
          tmp.set(pos.getX(i),pos.getY(i),pos.getZ(i));
          try{tmp.applyMatrix4(mw);}catch(e){}
          const du=tmp.x*u[0]+tmp.y*u[1]+tmp.z*u[2];
          const dv=tmp.x*vv[0]+tmp.y*vv[1]+tmp.z*vv[2];
          const dd=tmp.x*dir[0]+tmp.y*dir[1]+tmp.z*dir[2];
          if(du<minu)minu=du;if(du>maxu)maxu=du;
          if(dv<minv)minv=dv;if(dv>maxv)maxv=dv;
          if(dd<mind)mind=dd;if(dd>maxd)maxd=dd;
          return[du,dv,dd];
        };
        for(let t=0;t<nT&&flat.length<360000;t++){
          const i0=idx?idx.getX(t*3):t*3,i1=idx?idx.getX(t*3+1):t*3+1,i2=idx?idx.getX(t*3+2):t*3+2;
          const A=proj(i0),B=proj(i1),C=proj(i2);
          flat.push(A[0],A[1],A[2],B[0],B[1],B[2],C[0],C[1],C[2]);
        }
      }
      if(flat.length<9||!(maxu>minu)||!(maxv>minv))return null;
      const pad=(maxu-minu+maxv-minv)*0.02+1;
      minu-=pad;maxu+=pad;minv-=pad;maxv+=pad;
      const su=W/(maxu-minu),sv=H/(maxv-minv);
      const buf=new Float32Array(W*H).fill(-1e30);
      for(let i=0;i<flat.length;i+=9){
        const ax=(flat[i]-minu)*su,ay=(flat[i+1]-minv)*sv,ad=flat[i+2];
        const bx=(flat[i+3]-minu)*su,by=(flat[i+4]-minv)*sv,bd2=flat[i+5];
        const cx=(flat[i+6]-minu)*su,cy=(flat[i+7]-minv)*sv,cd=flat[i+8];
        const det=(bx-ax)*(cy-ay)-(by-ay)*(cx-ax);
        if(Math.abs(det)<1e-12)continue;
        let x0=Math.max(0,Math.floor(Math.min(ax,bx,cx))),x1=Math.min(W-1,Math.ceil(Math.max(ax,bx,cx)));
        let y0=Math.max(0,Math.floor(Math.min(ay,by,cy))),y1=Math.min(H-1,Math.ceil(Math.max(ay,cy,by)));
        const inv=1/det;
        for(let py=y0;py<=y1;py++){
          for(let px2=x0;px2<=x1;px2++){
            const lx=px2+0.5-ax,ly=py+0.5-ay;
            const w1=(lx*(cy-ay)-ly*(cx-ax))*inv;
            const w2=((bx-ax)*ly-(by-ay)*lx)*inv;
            const w0=1-w1-w2;
            if(w0<0||w1<0||w2<0)continue;
            const dd=w0*ad+w1*bd2+w2*cd;
            const o=py*W+px2;
            if(dd>buf[o])buf[o]=dd;
          }
        }
      }
      const eps=Math.max((maxu-minu)/W,(maxv-minv)/H)*2+(maxd-mind)*1e-5+0.01;
      // tolérance LOOSE pour les contours (rayons rasants) : couvre l'erreur de
      // corde du maillage (~0,3-0,6 mm) sans laisser passer un vrai ocoueur
      // (paroi de perçage : les générateurs internes doivent rester coupés)
      const eps2=eps+0.3+Math.min(0.6,(maxd-mind)*0.004);
      const fn=p=>{
        const du=p[0]*u[0]+p[1]*u[1]+p[2]*u[2];
        const dv=p[0]*vv[0]+p[1]*vv[1]+p[2]*vv[2];
        const dd=p[0]*dir[0]+p[1]*dir[1]+p[2]*dir[2];
        const iu=((du-minu)*su)|0,iv=((dv-minv)*sv)|0;
        if(iu<0||iv<0||iu>=W||iv>=H)return true;
        return buf[iv*W+iu]<=dd+eps; // buffer plus proche que le point → caché
      };
      fn.loose=p=>{
        const du=p[0]*u[0]+p[1]*u[1]+p[2]*u[2];
        const dv=p[0]*vv[0]+p[1]*vv[1]+p[2]*vv[2];
        const dd=p[0]*dir[0]+p[1]*dir[1]+p[2]*dir[2];
        const iu=((du-minu)*su)|0,iv=((dv-minv)*sv)|0;
        if(iu<0||iv<0||iu>=W||iv>=H)return true;
        return buf[iv*W+iu]<=dd+eps2;
      };
      return fn;
    }catch(e){return null;}
  }
  /* segment projeté avec découpe des parties cachées */
  function mepEmitSeg(out,added,A,B,vis,kind,view,hidKind){
    // A,B = points monde ; découpe en sous-segments visibles
    // hidKind : si défini, les tronçons cachés sont ÉMIS avec cette classe (pointillés) au lieu d'être jetés
    const pushSeg=(P0,P1,kk)=>{
      const l0=[mepDot(P0,view.u),mepDot(P0,view.v)],l1=[mepDot(P1,view.u),mepDot(P1,view.v)];
      const dx=l1[0]-l0[0],dy=l1[1]-l0[1];
      if(dx*dx+dy*dy<1e-8)return;
      const k=Math.round(l0[0]*100)+','+Math.round(l0[1]*100)+','+Math.round(l1[0]*100)+','+Math.round(l1[1]*100);
      const k2=Math.round(l1[0]*100)+','+Math.round(l1[1]*100)+','+Math.round(l0[0]*100)+','+Math.round(l0[1]*100);
      if(added.has(k)||added.has(k2))return;
      added.add(k);
      out.push({t:'L',x1:l0[0],y1:l0[1],x2:l1[0],y2:l1[1],k:kk||kind});
    };
    if(!vis){pushSeg(A,B);return;} // pas de HLR : segment complet
    const sub=(P0,P1,depth)=>{
      const v0=vis(P0),v1=vis(P1);
      if(v0&&v1){
        // deux extrémités visibles ne garantissent pas le MILIEU : une arête peut
        // traverser derrière un autre corps sans que ses bouts soient masqués.
        if(depth<5){
          const M=[(P0[0]+P1[0])/2,(P0[1]+P1[1])/2,(P0[2]+P1[2])/2];
          if(!vis(M)){sub(P0,M,depth+1);sub(M,P1,depth+1);return;}
        }
        pushSeg(P0,P1);return;
      }
      if(!v0&&!v1){
        if(depth>=5){if(hidKind)pushSeg(P0,P1,hidKind);return;}
        const M=[(P0[0]+P1[0])/2,(P0[1]+P1[1])/2,(P0[2]+P1[2])/2];
        if(vis(M)){
          const a=binSearch(P0,M,true),b=binSearch(M,P1,false);
          if(hidKind){pushSeg(P0,a,hidKind);pushSeg(b,P1,hidKind);}
          pushSeg(a,b);
        }else{sub(P0,M,depth+1);sub(M,P1,depth+1);}
        return;
      }
      if(depth>=5){if(v0)pushSeg(P0,P1);else if(hidKind)pushSeg(P0,P1,hidKind);return;}
      const M=[(P0[0]+P1[0])/2,(P0[1]+P1[1])/2,(P0[2]+P1[2])/2];
      sub(v0?P0:M,v0?M:P1,depth+1);
    };
    const binSearch=(hid,visSide)=>{
      let a=hid.slice(),b=visSide.slice();
      for(let i=0;i<6;i++){
        const m=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
        if(vis(m))b=m;else a=m;
      }
      return b;
    };
    sub(A,B,0);
  }
  /* cercle reconnaissants sur une suite de points projetés */
  function mepFitCircle(pts){
    if(!pts||pts.length<4)return null;
    // OCCT ferme les arêtes circulaires en répétant le premier point à la fin.
    // Avec le fit à 3 points (premier/milieu/dernier), ce doublon donne a === c
    // et un déterminant nul : tous les trous/cercles pleins étaient ratés.
    let p=pts,closed=false;
    const first=pts[0],last=pts[pts.length-1];
    if(Math.hypot(last[0]-first[0],last[1]-first[1])<1e-6){
      closed=true;
      p=pts.slice(0,-1);
    }
    if(p.length<4)return null;
    // Points de fit bien répartis : un doublon de fermeture rend le triangle
    // quasi dégénéré si l'on garde le point voisin du départ.
    const n=p.length;
    const ia=0,ib=closed?Math.floor(n/3):(n>>1),ic=closed?Math.floor(2*n/3):n-1;
    const a=p[ia],b=p[ib],c=p[ic];
    const d=2*(a[0]*(b[1]-c[1])+b[0]*(c[1]-a[1])+c[0]*(a[1]-b[1]));
    if(Math.abs(d)<1e-9)return null;
    const ux=((a[0]*a[0]+a[1]*a[1])*(b[1]-c[1])+(b[0]*b[0]+b[1]*b[1])*(c[1]-a[1])+(c[0]*c[0]+c[1]*c[1])*(a[1]-b[1]))/d;
    const uy=((a[0]*a[0]+a[1]*a[1])*(c[0]-b[0])+(b[0]*b[0]+b[1]*b[1])*(a[0]-c[0])+(c[0]*c[0]+c[1]*c[1])*(b[0]-a[0]))/d;
    const r=Math.hypot(a[0]-ux,a[1]-uy);
    if(!(r>0.05))return null;
    for(let i=0;i<p.length;i++){
      if(Math.abs(Math.hypot(p[i][0]-ux,p[i][1]-uy)-r)>0.03)return null;
    }
    /* sweep signé : somme des deltas angulaires consécutifs bornés ±π */
    const th=i=>Math.atan2(p[i][1]-uy,p[i][0]-ux);
    let sweep=0;
    for(let i=0;i+1<p.length;i++){
      let d=th(i+1)-th(i);
      while(d>Math.PI)d-=2*Math.PI;
      while(d<-Math.PI)d+=2*Math.PI;
      sweep+=d;
    }
    if(closed){
      // delta de fermeture (le point dupliqué a été retiré)
      let d=th(0)-th(p.length-1);
      while(d>Math.PI)d-=2*Math.PI;
      while(d<-Math.PI)d+=2*Math.PI;
      sweep+=d;
    }
    return{cx:ux,cy:uy,r,a0:th(0),a1:th(0)+sweep,sweep,
      full:(closed&&Math.abs(sweep)>=Math.PI*1.5)||Math.abs(sweep)>=2*Math.PI*0.97};
  }
  /* AABB locale d'une élément projeté (L / C / A) */
  function mepElAABB(e){
    if(e.t==='L')return{minx:Math.min(e.x1,e.x2),miny:Math.min(e.y1,e.y2),maxx:Math.max(e.x1,e.x2),maxy:Math.max(e.y1,e.y2)};
    if(e.t==='C')return{minx:e.cx-e.r,miny:e.cy-e.r,maxx:e.cx+e.r,maxy:e.cy+e.r};
    if(e.t==='A'){
      // extrémités + croisements d'axes dans la plage angulaire
      const pts=[[e.cx+e.r*Math.cos(e.a0),e.cy+e.r*Math.sin(e.a0)],[e.cx+e.r*Math.cos(e.a1),e.cy+e.r*Math.sin(e.a1)]];
      const lo=Math.min(e.a0,e.a1),hi=Math.max(e.a0,e.a1);
      for(let k=0;k<4;k++){
        const t=k*Math.PI/2;
        let tt=t;
        while(tt<lo)tt+=2*Math.PI;
        if(tt<=hi)pts.push([e.cx+e.r*Math.cos(tt),e.cy+e.r*Math.sin(tt)]);
      }
      let minx=1e9,miny=1e9,maxx=-1e9,maxy=-1e9;
      pts.forEach(p=>{minx=Math.min(minx,p[0]);maxx=Math.max(maxx,p[0]);miny=Math.min(miny,p[1]);maxy=Math.max(maxy,p[1]);});
      return{minx,miny,maxx,maxy};
    }
    if(e.t==='P'&&e.pts&&e.pts.length){
      let minx=1e9,miny=1e9,maxx=-1e9,maxy=-1e9;
      e.pts.forEach(p=>{minx=Math.min(minx,p[0]);maxx=Math.max(maxx,p[0]);miny=Math.min(miny,p[1]);maxy=Math.max(maxy,p[1]);});
      return{minx,miny,maxx,maxy};
    }
    return null;
  }
  /* ═══════════════ G2. HLR exact OCCT ═══════════════ */
  /* Les arêtes renvoyées par HLRAppli_ReflectLines sont DÉJÀ découpées
     visibles/cachées et projetées depuis la géométrie exacte. On ne refait
     donc ni test de profondeur ni découpe de segment : contrairement au HLR
     maillage, les contours de révolution et les occultations sont exacts. */
  function mepHlrAddEdge(geo,added,view,shape,kind){
    if(!shape)return 0;
    let n=0;
    const bin=[];
    try{
      const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
      const ex=new occt.TopExp_Explorer_2(shape,occt.TopAbs_ShapeEnum.TopAbs_EDGE,SH);bin.push(ex);
      while(ex.More()){
        const e=occt.TopoDS.Edge_1(ex.Current());bin.push(e);
        try{
          const ad=new occt.BRepAdaptor_Curve_2(e);bin.push(ad);
          const u0=ad.FirstParameter(),u1=ad.LastParameter();
          if(u1>u0){
            const pts=occCurvePts(ad,u0,u1,0.02,400);
            if(pts&&pts.length>1){
              const lp=pts.map(p=>[mepDot(p,view.u),mepDot(p,view.v)]);
              const wp=pts.map(p=>mepDot(p,view.dir)); // profondeur (vers l'observateur) : plan d'une coupe locale (V0.23.7)
              const cir=mepFitCircle(lp);
              if(cir){
                const kc='C'+Math.round(cir.cx*100)+','+Math.round(cir.cy*100)+','+Math.round(cir.r*100);
                const ka='A'+kc+','+Math.round(cir.a0*400)+','+Math.round(cir.a1*400);
                const kk=cir.full?kc:ka;
                if(!added.has(kk)){
                  added.add(kk);
                  const w=wp.reduce((s,x)=>s+x,0)/wp.length;
                  geo.els.push(cir.full?{t:'C',cx:cir.cx,cy:cir.cy,r:cir.r,k:kind,w}:{t:'A',cx:cir.cx,cy:cir.cy,r:cir.r,a0:cir.a0,a1:cir.a1,k:kind,w});
                  n++;
                }
              }else{
                for(let i=0;i+1<lp.length;i++){
                  const A=lp[i],B=lp[i+1];
                  const dx=B[0]-A[0],dy=B[1]-A[1];
                  if(dx*dx+dy*dy<1e-8)continue;
                  const k=Math.round(A[0]*100)+','+Math.round(A[1]*100)+','+Math.round(B[0]*100)+','+Math.round(B[1]*100);
                  const k2=Math.round(B[0]*100)+','+Math.round(B[1]*100)+','+Math.round(A[0]*100)+','+Math.round(A[1]*100);
                  if(added.has(k)||added.has(k2))continue;
                  added.add(k);
                  geo.els.push({t:'L',x1:A[0],y1:A[1],x2:B[0],y2:B[1],k:kind,w:(wp[i]+wp[i+1])/2});
                  n++;
                }
              }
            }
          }
        }catch(err){}
        ex.Next();
      }
    }catch(err){}
    occDispose(bin);
    try{shape.delete();}catch(e){}
    return n;
  }
  function mepHlrExact(geo,view,shapes,added){
    if(typeof occt==='undefined'||!occt)return false;
    if(!occt.HLRAppli_ReflectLines||!occt.HLRBRep_TypeOfResultingEdge)return false;
    let model=null,hlr=null,owned=false;
    try{
      model=occCompoundOf(shapes);
      if(!model)return false;
      owned=shapes.length>1;
      hlr=new occt.HLRAppli_ReflectLines(model);
      hlr.SetAxes(view.dir[0],view.dir[1],view.dir[2],0,0,0,view.u[0],view.u[1],view.u[2]);
      hlr.Perform();
      const T=occt.HLRBRep_TypeOfResultingEdge;
      const mode=view.mode||'hide';
      const kindV=view.section?'sect':'sharp';
      let n=0;
      n+=mepHlrAddEdge(geo,added,view,hlr.GetCompoundOf3dEdges(T.HLRBRep_Sharp,true,true),kindV);
      n+=mepHlrAddEdge(geo,added,view,hlr.GetCompoundOf3dEdges(T.HLRBRep_OutLine,true,true),kindV);
      if(view.tangent)n+=mepHlrAddEdge(geo,added,view,hlr.GetCompoundOf3dEdges(T.HLRBRep_Rg1Line,true,true),view.section?'sect':'tangent');
      if(mode==='dash'){
        n+=mepHlrAddEdge(geo,added,view,hlr.GetCompoundOf3dEdges(T.HLRBRep_Sharp,false,true),'hidden');
        n+=mepHlrAddEdge(geo,added,view,hlr.GetCompoundOf3dEdges(T.HLRBRep_OutLine,false,true),'hidden');
        if(view.tangent)n+=mepHlrAddEdge(geo,added,view,hlr.GetCompoundOf3dEdges(T.HLRBRep_Rg1Line,false,true),'hidden');
      }
      return n>0;
    }catch(e){return false;}
    finally{
      try{hlr&&hlr.delete();}catch(e){}
      if(owned){try{model&&model.delete();}catch(e){}}
    }
  }
  /* 2026-10-22-009 : REPRÉSENTATION DES FILETAGES (ISO 6410-1) des perçages taraudés
     (« les représentations de filetages ISO dans les vues ») — le trou est percé au Ø du
     foret (Ø mineur, tracé par le HLR) ; on ajoute la convention :
       • vue en bout, entrée vue : 3/4 de cercle (fond de filet) au Ø nominal, ouvert en haut à droite ;
       • coupe passant par l'axe : traits du fond de filet au Ø nominal sur la longueur filetée + trait FORT
         de fin de filetage (sauf filetage débouchant) ;
       • autres vues de côté : filet caché (traits interrompus fins), en mode « cachées en pointillé ».
     Fond de filet (k 'thread') : gris clair et plus fin que le trait fin (.mepThread).
     Filet modélisé (impression 3D) : sa géométrie réelle est déjà dessinée — rien d'ajouté.
     Vue oblique / perspective : rien (convention définie pour les vues orthogonales). Détail : comme sa
     vue mère (même base), rogné ensuite par le cercle du détail (mepFinishGeo). */
  function mepThreadEls(view){
    const out=[];
    if(!view||mepOblOf(view)||mepPerspOf(view)||typeof holeAxis!=='function'||typeof isoThread!=='function')return out;
    const b=mepBasisOf(view),dot=mepDot;
    const planes=view.section?((view._step&&view._step.planes)||[view.section.p]):null;
    const nS=view.section?mepNorm(view.section.n):null;
    (doc.features||[]).forEach(f=>{
      if(!f||f.type!=='hole'||f.visible===false||!f.thread||!f.thread.size||f.thread.model)return;
      const fb=(typeof occBodyOfFeat==='function'?occBodyOfFeat(f):f.body)||null; // V0.15.11 : f.bodyId n'existe pas
      if(view.bodyId&&fb&&fb!==view.bodyId)return;
      if(typeof holeThreadBodyShown==='function'&&!holeThreadBodyShown(fb))return;
      const T=isoThread(f.thread.size);if(!T)return;
      const sk=(doc.sketches||[]).find(q=>q.id===f.sketchId);if(!sk)return;
      let A=null,N=null;try{A=holeAxis(f,sk);N=holeNorm(f);}catch(e){return;}
      if(!A||!A.pts||!A.pts.length)return;
      const D=mepNorm([A.dir.x,A.dir.y,A.dir.z]),R=T[1]/2;
      const off=(N.kind==='cbore')?N.cbH:(N.kind==='csink'?Math.max(0,(N.csD-N.d)/2/Math.tan(N.csA*Math.PI/360)):0);
      const thru=(f.thread.lenMode||'len')==='through';
      const L=Math.max(0,+f._thLen||+f.thread.len||+N.depth||0);if(!(L>0))return;
      const facing=dot(D,b.dir);
      A.pts.forEach(P=>{
        const w=[P.x,P.y,P.z];
        const at=t=>{const q=[w[0]+D[0]*t,w[1]+D[1]*t,w[2]+D[2]*t];return[dot(q,b.u),dot(q,b.v)];};
        if(Math.abs(facing)>0.999){
          // en bout : entrée vue (perçage qui s'éloigne de l'observateur) ou filetage débouchant.
          // En coupe : seulement si la partie filetée TRAVERSE le plan de coupe — un taraudage
          // enfoui dans la matière restante, ou ôté avec la matière enlevée, n'est pas vu
          // (« des cercles fantômes […] qui ne sont même pas visibles en pointillés »).
          if(planes){
            const s=(p0,t)=>dot(nS,[w[0]+D[0]*t-p0[0],w[1]+D[1]*t-p0[1],w[2]+D[2]*t-p0[2]]);
            if(!planes.some(p0=>s(p0,off)*s(p0,off+L)<=0))return;
          }else if(!(facing<0||thru))return;
          const c=at(0);
          out.push({t:'A',cx:c[0],cy:c[1],r:R,a0:0,a1:1.5*Math.PI,k:'thread'});
          return;
        }
        if(Math.abs(facing)>0.02)return; // axe oblique à la vue : pas de convention simple
        const d2=[dot(D,b.u),dot(D,b.v)],l2=Math.hypot(d2[0],d2[1])||1,nx=-d2[1]/l2,ny=d2[0]/l2;
        // coupé = le plan passe DANS le perçage (rayon du foret) : entre le foret et le Ø nominal,
        // la coupe ne montre aucun trou — pas de fond de filet isolé
        const rCut=Math.min(R,(+N.d>0?N.d/2:R));
        const inCut=!!(planes&&Math.abs(dot(nS,D))<0.02&&planes.some(p0=>Math.abs(dot(nS,[w[0]-p0[0],w[1]-p0[1],w[2]-p0[2]]))<rCut));
        if(!inCut&&view.mode!=='dash')return; // filet caché : seulement en « cachées en pointillé »
        const k=inCut?'thread':'threadH';
        const a=at(off),e=at(off+L);
        [-1,1].forEach(sg=>out.push({t:'L',x1:a[0]+nx*R*sg,y1:a[1]+ny*R*sg,x2:e[0]+nx*R*sg,y2:e[1]+ny*R*sg,k}));
        if(!thru)out.push({t:'L',x1:e[0]-nx*R,y1:e[1]-ny*R,x2:e[0]+nx*R,y2:e[1]+ny*R,k:inCut?'sharp':'threadH'}); // fin de filetage
      });
    });
    return out;
  }
  let mepCutKeys=null; // V0.8.2 : pièce de chaque forme coupée de la vue en cours de calcul
  /* Traits colinéaires bout à bout → un seul trait (« les lignes projetées appartenant à un
     cercle sont des multilignes ! Une seule suffit ») : le HLR exact rend la génératrice d'un
     cylindre comme une courbe discrétisée, le HLR maillage la découpe au test de visibilité.
     On ne soude qu'aux nœuds de degré 2 (aucun autre trait ni arc n'y aboutit) : deux arêtes
     réelles alignées séparées par un sommet où arrive une 3ᵉ arête restent distinctes. */
  function mepMergeCollinear(els){
    const key=(x,y)=>Math.round(x*500)+','+Math.round(y*500); // 0,002 mm
    const deg=new Map(),at=new Map();
    const bump=(x,y)=>{const k=key(x,y);deg.set(k,(deg.get(k)||0)+1);return k;};
    els.forEach((e,i)=>{
      if(e.t==='L'){[[e.x1,e.y1],[e.x2,e.y2]].forEach(p=>{const k=bump(p[0],p[1]);if(!at.has(k))at.set(k,[]);at.get(k).push(i);});}
      else if(e.t==='A'){bump(e.cx+e.r*Math.cos(e.a0),e.cy+e.r*Math.sin(e.a0));bump(e.cx+e.r*Math.cos(e.a1),e.cy+e.r*Math.sin(e.a1));}
    });
    const dead=new Set();
    const tryEnd=(i,end)=>{ // end 1 : (x1,y1), 2 : (x2,y2) ; true si le trait a été prolongé
      const e=els[i],px=end===1?e.x1:e.x2,py=end===1?e.y1:e.y2,k=key(px,py);
      if(deg.get(k)!==2)return false;
      const j=(at.get(k)||[]).find(n=>n!==i&&!dead.has(n));
      if(j==null)return false;
      const f=els[j];if(f.k!==e.k)return false;
      const fj=key(f.x1,f.y1)===k?2:(key(f.x2,f.y2)===k?1:0);if(!fj)return false;
      const fx=fj===1?f.x1:f.x2,fy=fj===1?f.y1:f.y2; // bout lointain de j
      const ox=end===1?e.x2:e.x1,oy=end===1?e.y2:e.y1; // bout opposé de i
      const dx=fx-ox,dy=fy-oy,L=Math.hypot(dx,dy);if(L<1e-9)return false;
      const dev=Math.abs((px-ox)*dy-(py-oy)*dx)/L; // écart du nœud à la droite fusionnée
      if(dev>0.002||((px-ox)*dx+(py-oy)*dy)<=0||((fx-px)*dx+(fy-py)*dy)<=0)return false;
      dead.add(j);
      if(end===1){e.x1=fx;e.y1=fy;}else{e.x2=fx;e.y2=fy;}
      const nk=key(fx,fy),arr=at.get(nk);if(arr)arr.push(i);
      return true;
    };
    els.forEach((e,i)=>{if(e.t!=='L'||dead.has(i))return;while(tryEnd(i,1)||tryEnd(i,2));});
    return dead.size?els.filter((e,i)=>!dead.has(i)):els;
  }
  function mepFinishGeo(geo,view,cutShapes){
    try{geo.els=mepMergeCollinear(geo.els);}catch(e){}
    try{const th=mepThreadEls(view);if(th.length)geo.els=geo.els.concat(th);}catch(e){try{console.warn('mep filetage',e);}catch(e2){}}
    if((view.render3d||view.real)&&!view.section&&!view.detail){
      try{geo.img3d=mepRender3dImage(view);}catch(e){geo.img3d=null;}
    }
    if(view.shade&&!view.render3d&&!view.real&&!view.section&&!view.detail){
      try{geo.faces=mepShadedFaces(view);}catch(e){geo.faces=[];}
      try{geo.thr3d=mepThreadSegs(view);}catch(e){geo.thr3d=[];}
    }
    if(view.section&&cutShapes.length){
      const st=view._step,P0=st?st.planes:view.section.p;
      // V0.8.2 : une boucle de hachures par pièce (composant d'assemblage, ou corps) — chaque
      // pièce coupée reçoit sa variante (angle alterné, pas) au dessin, comme l'usage le veut
      const keys=mepCutKeys&&mepCutKeys.length===cutShapes.length?mepCutKeys:null,U=keys?[...new Set(keys)]:[];
      if(U.length>1){
        geo.hatch=[];geo.hatchG=[];
        U.forEach((k,i)=>{try{const L=mepHatchLoops(cutShapes.filter((s,j)=>keys[j]===k),view,P0,view.section.n);
          if(L.length){geo.hatchG.push({k:i,loops:L});geo.hatch=geo.hatch.concat(L);}}catch(e){}});
      }else{try{geo.hatch=mepHatchLoops(cutShapes,view,P0,view.section.n);}catch(e){}}
      if(st)geo.els=mepDropStepEdges(geo.els,view,st);
    }
    // coupes locales (V0.23.7) : celles de la vue, ou de sa mère pour un détail — avant le rognage du détail
    if(!view.section&&cutShapes.length&&/^OCCT/.test(geo.src||'')&&!mepOblOf(view)&&!mepPerspOf(view)){
      const lv=view.detail&&view.parent?mepView(mepSheet(),view.parent):view,L=lv&&lv.locals;
      if(L&&L.length)try{mepLocalApply(geo,view,cutShapes,L);}catch(e){try{console.warn('mep coupe locale',e);}catch(e2){}}
    }
    if(view.detail&&view.parent){
      const par=mepView(mepSheet(),view.parent);
      if(par)geo.els=mepClipDetail(geo.els,view.detail);
    }
    return geo;
  }
