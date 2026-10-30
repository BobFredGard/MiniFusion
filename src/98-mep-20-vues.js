// Espace PLAN — suite de la fonction englobante ouverte dans 98-mep-00-modele.js (état privé partagé, fermée dans 98-mep-95-export-init.js) : construction, création et commandes des vues, vues DXF et projetées.
  /* ═══════════════ H. construction d'une vue ═══════════════ */
  function mepBuildGeo(view){
    // vue DXF (2026-10-23) : géométrie importée telle quelle ; un détail pris dessus la rogne
    {const par=view.kind==='detail'&&view.parent?mepView(mepSheet(),view.parent):null,dv=view.kind==='dxf'?view:(par&&par.kind==='dxf'?par:null);
     if(dv){let els=((dv.dxf&&dv.dxf.els)||[]).map(e=>e.t==='P'?{t:'P',pts:e.pts.map(q=>q.slice()),k:e.k}:Object.assign({},e));
       if(view!==dv&&view.detail)els=mepClipDetail(els,view.detail);
       return{els,hatch:[],src:'dxf'};}}
    const geo={els:[],hatch:[],src:''};
    const b=mepBasisOf(view);view.dir=b.dir;view.u=b.u;view.v=b.v;
    const list=mepMeshesOf(view);
    if(!list.length){geo.src='aucun corps';return geo;}
    /* mode d'affichage : wire = tout noir ; hide = HLR, cachées supprimées ;
       dash = HLR, cachées en gris pointillé */
    const mode=view.mode||'hide';
    const added=new Set();
    const sty=new Map();
    list.forEach(bd=>sty.set(bd,mepBodyStyleOf(bd)));
    const shade=!!(view.shade||view.render3d)&&!view.section&&!view.detail;
    const occList=shade?list.filter(bd=>bd.mesh&&!sty.get(bd).transparent):list;
    /* — formes exactes et coupe AVANT le HLR : le HLR doit voir la matière
       réellement coupée, pas la pièce entière. — */
    let shapes=[],shapeBodies=[];
    // 2026-10-22-010 : un import STEP a AUSSI son solide exact (importGeom.brep) —
    // seul bd.shape était lu : la vue d'un STEP tombait sur le maillage
    // d'affichage et dessinait ses triangles (« la mise en plan est très
    // facétisée »). Le BRep importé est dans les coordonnées du maillage.
    list.forEach(bd=>{const sh=mepExactOf(bd);if(sh){shapes.push(sh);shapeBodies.push(bd);}});
    const exact=shapes.length&&typeof occSharpEdges==='function';
    // V0.8.2 : pièce de chaque forme (hachures par pièce) — même ordre que cutShapes
    mepCutKeys=shapeBodies.map(bd=>bd&&bd.asmComp?'c:'+bd.asmComp:'b:'+((bd&&(bd.bodyId||bd.id))||''));
    let cutShapes=shapes;
    if(view.section&&shapes.length){
      view._sec={p0:view.section.p,gaze:mepNorm(view.section.n)};
      cutShapes=[];
      const st=mepSecStepped(view);view._step=st;
      shapes.forEach(sh=>{
        const cs=st?mepCutPrism(sh,st.poly,st.vec):mepCutHalfSpace(sh,view.section.p,view.section.n);
        if(cs)cutShapes.push(cs);else cutShapes.push(sh);
      });
    }else{view._sec=null;view._step=null;}
    if(mepOblOf(view)&&cutShapes.length)cutShapes=cutShapes.map(sh=>mepOblShear(sh,view)); // cavalière
    if(mepPerspOf(view)){mepPerspBuild(geo,view,list,cutShapes,exact,mode);return mepFinishGeo(geo,view,cutShapes);} // perspective
    /* — HLR exact OCCT (repli automatique sur l'ancien HLR si indisponible) — */
    if(mode!=='wire'&&exact&&view.hlrExact!==false&&cutShapes.length){
      const tr=shade&&shapeBodies.some(bd=>sty.get(bd).transparent);
      if(tr){
        const opq=[],trans=[];
        shapeBodies.forEach((bd,i)=>{
          if(!cutShapes[i])return;
          if(sty.get(bd).transparent)trans.push(cutShapes[i]);
          else opq.push(cutShapes[i]);
        });
        let ok=false;
        if(opq.length)ok=mepHlrExact(geo,view,opq,added)||ok;
        trans.forEach(sh=>{
          ok=mepHlrExact(geo,view,opq.concat([sh]),added)||ok;
        });
        if(ok){geo.src='OCCT HLR';return mepFinishGeo(geo,view,cutShapes);}
      }else if(mepHlrExact(geo,view,cutShapes,added)){
        geo.src='OCCT HLR';
        return mepFinishGeo(geo,view,cutShapes);
      }
    }
    let vis=null,hidKind=null;
    if(mode!=='wire'){
      if(view.section)vis=mepVisFn(view,occList); // coupe : raycast avec exclusion du demi-espace
      else{
        const mlist=occList.filter(b=>b.mesh);
        vis=mepDepthVis(view,mlist)||mepVisFn(view,mlist); // tampon de profondeur, repli raycast
      }
      if(vis&&mode==='dash')hidKind='hidden';
    }
    /* — silhouettes du maillage : contour extérieur + aide au noircissement — */
    const silSegs=[];
    const silGrid=new Map(); // cellule 3 mm → SEGMENTS de silhouette
    const silAddSeg=pr=>{
      const L=Math.hypot(pr[1][0]-pr[0][0],pr[1][1]-pr[0][1],pr[1][2]-pr[0][2]);
      const n=Math.max(1,Math.ceil(L));
      for(let i=0;i<=n;i++){
        const t=i/n;
        const p=[pr[0][0]+(pr[1][0]-pr[0][0])*t,pr[0][1]+(pr[1][1]-pr[0][1])*t,pr[0][2]+(pr[1][2]-pr[0][2])*t];
        const k=Math.floor(p[0]/3)+','+Math.floor(p[1]/3)+','+Math.floor(p[2]/3);
        if(!silGrid.has(k))silGrid.set(k,[]);
        const arr=silGrid.get(k);
        if(arr[arr.length-1]!==pr)arr.push(pr);
      }
    };
    list.forEach(bd=>{
      if(!bd.mesh)return;
      try{bd.mesh.updateMatrixWorld();}catch(e){}
      const segs=mepSilhouettes(bd.mesh,view.dir);
      segs.forEach(pr=>{silSegs.push(pr);silAddSeg(pr);});
    });
    const onSil=p=>{
      // distance point→segment (corde de maillage) : tolérance 2,2 mm
      const cx=Math.floor(p[0]/3),cy=Math.floor(p[1]/3),cz=Math.floor(p[2]/3);
      for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(let k=-1;k<=1;k++){
        const arr=silGrid.get((cx+i)+','+(cy+j)+','+(cz+k));
        if(!arr)continue;
        for(let m=0;m<arr.length;m++){
          const A=arr[m][0],B=arr[m][1];
          const ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2];
          const L2=ux*ux+uy*uy+uz*uz;
          let t=L2>1e-12?((p[0]-A[0])*ux+(p[1]-A[1])*uy+(p[2]-A[2])*uz)/L2:0;
          t=t<0?0:(t>1?1:t);
          const dx=p[0]-(A[0]+ux*t),dy=p[1]-(A[1]+uy*t),dz=p[2]-(A[2]+uz*t);
          if(dx*dx+dy*dy+dz*dz<4.84)return true;
        }
      }
      return false;
    };
    /* — forme exacte(s) — */
    /* — arêtes OCCT — */
    if(exact){
      geo.src='OCCT';
      cutShapes.forEach(sh=>{
        let edges=[];
        try{edges=occSharpEdges(sh)||[];}catch(e){edges=[];}
        edges.forEach(e=>{
          if(!e||!e.pts||e.pts.length<2)return;
          const wpts=[];
          for(let i=0;i<e.pts.length;i++){
            const p=e.pts[i];const w=(p&&typeof p.x==='number')?[p.x,p.y,p.z]:p;
            if(w)wpts.push(w);
          }
          if(wpts.length<2)return;
          let kind=e.sharp?'sharp':'tangent';
          let onContour=false;
          if(kind==='tangent'){
            // tangente SUR le contour extérieur (silhouette) → arête vive noire,
            // visibilité LOOSE (le strict la tue au rasant).
            // Les arêtes VIVES gardent le test strict : un cerclage de perçage
            // (sharp) ne doit jamais fuiler à travers une paroi.
            let hits=0,tested=0;
            for(let i=0;i<wpts.length;i++){
              tested++;if(onSil(wpts[i]))hits++;
            }
            if(tested&&hits*5>=tested*3){kind='sharp';onContour=true;} // ≥60 % des points sur le contour
          }
          if(kind==='tangent'&&!view.tangent)return;
          // visibilité LOOSE pour tout ce qui n'est PAS une arête vive d'origine :
          // contours promus ET tangentes de congés (posées SUR la face, tuées au
          // rasant par le strict à cause de l'erreur de rasterisation).
          // Les arêtes VIVES (cerclages de perçage) gardent le test strict —
          // un perçage arrière ne doit jamais fuiler à travers une paroi.
          const visE=(onContour||kind==='tangent')?(vis&&(vis.loose||vis)):vis;
          const lp=wpts.map(p=>[mepDot(p,view.u),mepDot(p,view.v)]);
          const cir=(kind==='sharp'||kind==='tangent')?mepFitCircle(lp):null;
          if(cir){
            // test de visibilité sur 6 points (pas 3) : un cerclage de perçage
            // partiellement masqué ne doit pas ressortir en noir complet
            const okV=()=>{
              if(!visE)return true;
              const n=wpts.length;
              for(let s=0;s<6;s++){
                const pt=wpts[Math.min(n-1,Math.round(s*(n-1)/5))];
                if(pt&&!visE(pt))return false;
              }
              return true;
            };
            if(okV()){
              const kc='C'+Math.round(cir.cx*100)+','+Math.round(cir.cy*100)+','+Math.round(cir.r*100);
              const ka='A'+kc+','+Math.round(cir.a0*400)+','+Math.round(cir.a1*400);
              const kk=cir.full?kc:ka;
              if(!added.has(kk)){added.add(kk);geo.els.push(cir.full?{t:'C',cx:cir.cx,cy:cir.cy,r:cir.r,k:view.section?'sect':kind}:{t:'A',cx:cir.cx,cy:cir.cy,r:cir.r,a0:cir.a0,a1:cir.a1,k:view.section?'sect':kind});}
              return;
            }
          }
          for(let i=0;i<wpts.length-1;i++)mepEmitSeg(geo.els,added,wpts[i],wpts[i+1],visE,view.section?'sect':(kind==='tangent'?'tangent':'sharp'),view,hidKind);
        });
      });
    }
    /* — arêtes de maillage (corps sans noyau exact) — */
    list.forEach(bd=>{
      if(exact&&shapeBodies.indexOf(bd)>=0)return; // déjà traité (solide exact, import compris)
      const g=bd.mesh&&bd.mesh.geometry;if(!g||!g.attributes||!g.attributes.position)return;
      try{bd.mesh.updateMatrixWorld();}catch(e){}
      const pos=g.attributes.position,idx=bd.mesh.geometry.index;
      const nT=idx?idx.count/3:pos.count/3;
      const mw=bd.mesh.matrixWorld;
      const wp=i=>{
        const v=new THREE.Vector3(pos.getX(i),pos.getY(i),pos.getZ(i));
        try{v.applyMatrix4(mw);}catch(e){}
        return[v.x,v.y,v.z];
      };
      const seenE=new Set();
      for(let t=0;t<nT&&t<120000;t++){
        const i0=idx?idx.getX(t*3):t*3,i1=idx?idx.getX(t*3+1):t*3+1,i2=idx?idx.getX(t*3+2):t*3+2;
        [[i0,i1],[i1,i2],[i2,i0]].forEach(pr=>{
          const kk=pr[0]<pr[1]?pr[0]+'_'+pr[1]:pr[1]+'_'+pr[0];
          if(seenE.has(kk))return;seenE.add(kk);
          mepEmitSeg(geo.els,added,wp(pr[0]),wp(pr[1]),vis,'sharp',view,hidKind);
        });
      }
      if(!exact)geo.src='maillage';
    });
    /* — silhouettes (générateurs de cylindres/sphères) :
       HLR en tolérance LOOSE : les contours rasants survivent à l'erreur de corde
       du maillage (~0,5 mm), mais un vrai ocoueur (paroi d'un perçage arrière)
       les coupe — les perçages ne doivent pas ressortir en noir. */
    const visSil=vis?(vis.loose||vis):null;
    silSegs.forEach(pr=>mepEmitSeg(geo.els,added,pr[0],pr[1],visSil,view.section?'sect':'sharp',view,hidKind));
    return mepFinishGeo(geo,view,cutShapes);
  }
  /* demi-espace : boîte orientée construite par prisme (API sondées) */
  /* 2026-10-22-013 : COUPE BRISÉE (ISO 128-44, plans parallèles) — section.pts =
     ligne de coupe en repère local de la vue mère, tronçons alternés à l'équerre.
     La matière ôtée est un prisme : profil = ligne brisée prolongée aux deux bouts
     et refermée côté regard (+n), extrudé le long du regard de la vue mère. */
  function mepSecStepped(view){
    const s=view&&view.section;
    if(!s||!Array.isArray(s.pts)||s.pts.length<3)return null;
    const sh=mepSheetOfView(view),par=sh&&mepView(sh,s.pid||view.parent);
    if(!par)return null;
    const pb=mepBasisOf(par),n=mepNorm(s.n);
    const W=(x,y)=>[pb.u[0]*x+pb.v[0]*y,pb.u[1]*x+pb.v[1]*y,pb.u[2]*x+pb.v[2]*y];
    let gx=mepDot(n,pb.u),gy=mepDot(n,pb.v);const gl=Math.hypot(gx,gy);
    if(gl<1e-6)return null;
    gx/=gl;gy/=gl;
    const P=s.pts.map(q=>({x:+q[0],y:+q[1]}));
    let tx=P[1].x-P[0].x,ty=P[1].y-P[0].y;const tl=Math.hypot(tx,ty);
    if(tl<1e-9)return null;
    tx/=tl;ty/=tl;
    const R=mepCutReach();
    const k=P.length-1;
    const poly2=[{x:P[0].x-tx*R,y:P[0].y-ty*R}].concat(P,[{x:P[k].x+tx*R,y:P[k].y+ty*R},
      {x:P[k].x+tx*R+gx*R,y:P[k].y+ty*R+gy*R},{x:P[0].x-tx*R+gx*R,y:P[0].y-ty*R+gy*R}]);
    const pd=mepNorm(pb.dir);
    const poly=poly2.map(q=>{const w=W(q.x,q.y);return[w[0]-pd[0]*R,w[1]-pd[1]*R,w[2]-pd[2]*R];});
    const planes=[],steps=[];
    for(let j=0;j<k;j++){
      if(j%2===0)planes.push(W(P[j].x,P[j].y));
      else steps.push({p:W(P[j].x,P[j].y),d:pd});
    }
    return{poly,vec:[pd[0]*2*R,pd[1]*2*R,pd[2]*2*R],planes,steps};
  }
  function mepCutReach(){
    // demi-taille englobant les corps visibles (et leur éloignement de l'origine)
    let R=0;
    try{
      const bb=new THREE.Box3();
      const list=(typeof bodies!=='undefined'&&bodies)||[];
      list.forEach(bd=>{if(bd&&bd.mesh&&bd.mesh.visible!==false&&!bd.ghost)bb.expandByObject(bd.mesh);});
      if(!bb.isEmpty()){
        const c=bb.getCenter(new THREE.Vector3());
        R=bb.getSize(new THREE.Vector3()).length()+c.length();
      }
    }catch(e){}
    return (R>1?R:400)+20;
  }
  function mepCutPrism(shape,poly,vec){
    if(typeof occt==='undefined'||!occt)return null;
    try{
      const pg=new occt.BRepBuilderAPI_MakePolygon_1();
      poly.forEach(q=>{const pt=new occt.gp_Pnt_3(q[0],q[1],q[2]);try{pg.Add_1(pt);}catch(e){try{pt.delete();}catch(e2){}}});
      try{pg.Close();}catch(e){}
      if(!pg.IsDone())return null;
      const fm=new occt.BRepBuilderAPI_MakeFace_15(pg.Wire(),true);
      fm.Build();
      if(!fm.IsDone())return null;
      const v=new occt.gp_Vec_4(vec[0],vec[1],vec[2]);
      const pr=new occt.BRepPrimAPI_MakePrism_1(fm.Face(),v,false,true);
      pr.Build();
      if(!pr.IsDone())return null;
      const cut=new occt.BRepAlgoAPI_Cut_3(shape,pr.Shape());
      let out=null;
      if(cut.IsDone&&cut.IsDone())out=cut.Shape();
      try{v.delete();}catch(e){}
      return out;
    }catch(e){return null;}
  }
  // ISO 128-44 : pas de trait dans la vue en coupe là où le plan change
  function mepDropStepEdges(els,view,st){
    if(!st||!st.steps.length)return els;
    const ln=st.steps.map(q=>{
      const px=mepDot(q.p,view.u),py=mepDot(q.p,view.v);
      let dx=mepDot(q.d,view.u),dy=mepDot(q.d,view.v);const L=Math.hypot(dx,dy);
      if(L<1e-6)return null;
      dx/=L;dy/=L;
      return{px,py,nx:-dy,ny:dx};
    }).filter(Boolean);
    const on=(x,y)=>ln.some(l=>Math.abs((x-l.px)*l.nx+(y-l.py)*l.ny)<0.01);
    return els.filter(e=>!(e.t==='L'&&on(e.x1,e.y1)&&on(e.x2,e.y2)
      &&ln.some(l=>Math.abs((e.x1-l.px)*l.nx+(e.y1-l.py)*l.ny)<0.01&&Math.abs((e.x2-l.px)*l.nx+(e.y2-l.py)*l.ny)<0.01)));
  }
  function mepCutHalfSpace(shape,p0,nrm){
    if(typeof occt==='undefined'||!occt)return null;
    try{
      const n=mepNorm(nrm),p=mepNorm(Math.abs(n[2])>0.9?[0,1,0]:[0,0,1]);
      let U=mepCross(n,p);const Lu=Math.hypot(U[0],U[1],U[2]);
      if(Lu<1e-6)return null;
      U=[U[0]/Lu,U[1]/Lu,U[2]/Lu];
      const V=mepCross(n,U);
      let diag=0,C=null;
      try{ // boîte englobante des corps visibles → demi-espace assez grand
        const bb=new THREE.Box3();
        const list=(typeof bodies!=='undefined'&&bodies)||[];
        list.forEach(bd=>{
          if(bd&&bd.mesh&&bd.mesh.visible!==false&&!bd.ghost){bb.expandByObject(bd.mesh);diag=Math.max(diag,bb.getSize(new THREE.Vector3()).length());}
        });
        if(!bb.isEmpty()){const m=bb.getCenter(new THREE.Vector3());C=[m.x,m.y,m.z];}
      }catch(e){}
      // la forme coupée peut venir d'ailleurs (instances d'un assemblage) : sa boîte compte aussi
      try{const B=asmBox(shape);if(B&&B.max[0]>=B.min[0]){const d=Math.hypot(B.max[0]-B.min[0],B.max[1]-B.min[1],B.max[2]-B.min[2]);
        if(d>diag){diag=d;C=[0,1,2].map(i=>(B.min[i]+B.max[i])/2);}}}catch(e){}
      if(!(diag>1))diag=400;
      // V0.8.5 : carré centré sur le CENTRE de la pièce projeté dans le plan de coupe — centré sur
      // le 1er point de la ligne (souvent au bord de la pièce), il n'en couvrait qu'une partie :
      // Perçages, coupe B-B tracée depuis X -50 : rien de coupé au-delà de X 30,5
      let Q=p0;
      if(C){const h=(C[0]-p0[0])*n[0]+(C[1]-p0[1])*n[1]+(C[2]-p0[2])*n[2];Q=[C[0]-n[0]*h,C[1]-n[1]*h,C[2]-n[2]*h];}
      const A=diag/2+20;
      const cor=[[-A,-A],[A,-A],[A,A],[-A,A]].map(c=>[Q[0]+U[0]*c[0]+V[0]*c[1],Q[1]+U[1]*c[0]+V[1]*c[1],Q[2]+U[2]*c[0]+V[2]*c[1]]);
      const poly=new occt.BRepBuilderAPI_MakePolygon_1();
      cor.forEach(q=>{const pt=new occt.gp_Pnt_3(q[0],q[1],q[2]);try{poly.Add_1(pt);}catch(e){try{pt.delete();}catch(e2){}}});
      try{poly.Close();}catch(e){}
      if(!poly.IsDone())return null;
      const fm=new occt.BRepBuilderAPI_MakeFace_15(poly.Wire(),true);
      fm.Build();
      if(!fm.IsDone())return null;
      const dep=diag*2+(C?Math.abs((C[0]-p0[0])*n[0]+(C[1]-p0[1])*n[1]+(C[2]-p0[2])*n[2]):0);
      const vec=new occt.gp_Vec_4(n[0]*dep,n[1]*dep,n[2]*dep);
      const pr=new occt.BRepPrimAPI_MakePrism_1(fm.Face(),vec,false,true);
      pr.Build();
      if(!pr.IsDone())return null;
      const cut=new occt.BRepAlgoAPI_Cut_3(shape,pr.Shape());
      let out=null;
      if(cut.IsDone&&cut.IsDone())out=cut.Shape();
      try{vec.delete();}catch(e){}
      return out;
    }catch(e){return null;}
  }
  /* hachures : faces planes du résultat de coupe posées sur le plan */
  function mepHatchLoops(shapes,view,p0,nrm){
    const n=mepNorm(nrm);
    const P0s=Array.isArray(p0[0])?p0:[p0]; // coupe brisée : un plan par tronçon
    const segs=[];
    shapes.forEach(sh=>{
      try{
        const fx=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);
        while(fx.More()){
          let keep=false;
          try{
            const f=occt.TopoDS.Face_1(fx.Current());
            const ad=new occt.BRepAdaptor_Surface_2(f,true);
            if(ad.GetType()===occt.GeomAbs_SurfaceType.GeomAbs_Plane){
              const pl=ad.Plane();
              const ax=pl.Axis();const d=ax.Direction();const loc=ax.Location();
              const dn=[d.X(),d.Y(),d.Z()],lp=[loc.X(),loc.Y(),loc.Z()];
              if(Math.abs(Math.abs(mepDot(dn,n))-1)<1e-3&&P0s.some(q=>Math.abs(mepDot(mepSub(lp,q),n))<0.05)){
                keep=true;
                const ee=new occt.TopExp_Explorer_2(f,occt.TopAbs_ShapeEnum.TopAbs_EDGE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);
                while(ee.More()){
                  try{
                    const e=occt.TopoDS.Edge_1(ee.Current());
                    const ca=new occt.BRepAdaptor_Curve_2(e);
                    const u0=ca.FirstParameter(),u1=ca.LastParameter();
                    if(u1>u0){
                      const N=8,pts=[];
                      for(let i=0;i<=N;i++){const q=ca.Value(u0+(u1-u0)*i/N);pts.push([q.X(),q.Y(),q.Z()]);}
                      for(let i=0;i<N;i++)segs.push([pts[i],pts[i+1]]);
                    }
                  }catch(err){}
                  ee.Next();
                }
              }
            }
          }catch(err){}
          fx.Next();
        }
      }catch(e){}
    });
    if(!segs.length)return[];
    /* projette + joint les segments en boucles */
    const ls=segs.map(pr=>[[mepDot(pr[0],view.u),mepDot(pr[0],view.v)],[mepDot(pr[1],view.u),mepDot(pr[1],view.v)]]);
    const loops=mepJoinLoops(ls);
    return loops;
  }
  function mepJoinLoops(segs){
    const q=p=>Math.round(p[0]*1000)+'_'+Math.round(p[1]*1000);
    const at=new Map();
    segs.forEach((s,i)=>{
      [0,1].forEach(k=>{
        const key=q(s[k]);
        if(!at.has(key))at.set(key,[]);
        at.get(key).push({i,k});
      });
    });
    const used=new Set(),loops=[];
    segs.forEach((s0,i0)=>{
      if(used.has(i0))return;
      const loop=[s0[0]];
      let cur=i0,curPt=s0[1],guard=0;
      used.add(i0);
      while(guard++<4000){
        loop.push(curPt);
        const cands=(at.get(q(curPt))||[]).filter(c=>!used.has(c.i));
        if(!cands.length)break;
        const c=cands[0];
        used.add(c.i);
        cur=c.i;
        curPt=segs[cur][1-c.k];
      }
      if(loop.length>2)loops.push(loop);
    });
    return loops.filter(l=>l.length>3);
  }
  /* détail : rogne la géométrie d'une vue au cercle (coords locales) */
  function mepClipDetail(els,det){
    const{cx,cy,r}=det,out=[];
    const inC=(x,y)=>Math.hypot(x-cx,y-cy)<=r-0.01;
    const clipSeg=(x1,y1,x2,y2)=>{
      const dx=x2-x1,dy=y2-y1,a=dx*dx+dy*dy;
      if(a<1e-12)return inC(x1,y1)?[[x1,y1,x2,y2]]:[];
      const bx=x1-cx,by=y1-cy;
      const bq=2*(bx*dx+by*dy),cq=bx*bx+by*by-r*r;
      const disc=bq*bq-4*a*cq;
      if(disc<0)return inC(x1,y1)?[[x1,y1,x2,y2]]:[];
      const sq=Math.sqrt(disc);
      let t0=(-bq-sq)/(2*a),t1=(-bq+sq)/(2*a);
      if(t0>t1){const t=t0;t0=t1;t1=t;}
      const segsOut=[];
      const inside0=inC(x1,y1),inside1=inC(x2,y2);
      if(inside0&&inside1)segsOut.push([x1,y1,x2,y2]);
      else if(inside0)segsOut.push([x1,y1,x1+dx*t1,y1+dy*t1]); // part de l'intérieur : sort au 2ᵉ croisement (t1 > 0)
      else if(inside1)segsOut.push([x1+dx*t0,y1+dy*t0,x2,y2]); // finit dedans : entre au 1er (t0 < 1)
      else if(t0>0&&t1<1)segsOut.push([x1+dx*t0,y1+dy*t0,x1+dx*t1,y1+dy*t1]);
      return segsOut;
    };
    els.forEach(e=>{
      if(e.t==='L'){
        clipSeg(e.x1,e.y1,e.x2,e.y2).forEach(s=>out.push({t:'L',x1:s[0],y1:s[1],x2:s[2],y2:s[3],k:e.k}));
      }else if(e.t==='C'){
        if(inC(e.cx,e.cy)&&e.r<=r-0.01)out.push(e);
        else{
          const d=Math.hypot(e.cx-cx,e.cy-cy);
          if(d>=e.r+r||d<=Math.abs(e.r-r))return;
          // cercle coupé : échantillonne l'arc intérieur
          const a0=Math.atan2(e.cy-cy,e.cx-cx);
          const cosA=(d*d+e.r*e.r-r*r)/(2*d*e.r);
          const da=Math.acos(Math.max(-1,Math.min(1,cosA)));
          const N=24,pts=[];
          for(let i=0;i<=N;i++){
            const t=a0-da+(2*da)*i/N;
            pts.push([e.cx+e.r*Math.cos(t),e.cy+e.r*Math.sin(t)]);
          }
          for(let i=0;i<N;i++)out.push({t:'L',x1:pts[i][0],y1:pts[i][1],x2:pts[i+1][0],y2:pts[i+1][1],k:e.k});
        }
      }else if(e.t==='A'){
        // arc : échantillonne puis rogne comme une polyligne
        const N=Math.max(8,Math.min(48,Math.round(Math.abs(e.a1-e.a0)*e.r*2)+4)),pts=[];
        for(let i=0;i<=N;i++){
          const t=e.a0+(e.a1-e.a0)*i/N;
          pts.push([e.cx+e.r*Math.cos(t),e.cy+e.r*Math.sin(t)]);
        }
        let run=[];
        const flush=()=>{for(let i=0;i+1<run.length;i++)out.push({t:'L',x1:run[i][0],y1:run[i][1],x2:run[i+1][0],y2:run[i+1][1],k:e.k});run=[];};
        for(let i=0;i<pts.length;i++){
          const p=pts[i];
          if(inC(p[0],p[1]))run.push(p);else flush();
        }
        flush();
      }else if(e.t==='P'&&e.pts){
        let run=[];
        const flush=()=>{for(let i=0;i+1<run.length;i++)out.push({t:'L',x1:run[i][0],y1:run[i][1],x2:run[i+1][0],y2:run[i+1][1],k:e.k});run=[];};
        for(let i=0;i<e.pts.length;i++){
          const p=e.pts[i];
          if(inC(p[0],p[1]))run.push(p);else flush();
        }
        flush();
      }
    });
    return out;
  }
  /* ═══════════════ I. création de vues ═══════════════ */
  function mepNextLabel(sh){
    const used=new Set(sh.views.map(v=>v.label).filter(Boolean));
    for(let i=0;i<26;i++){const L=String.fromCharCode(65+i);if(!used.has(L))return L;}
    return 'V'+sh.views.length;
  }
  /* AABB d'une géométrie projetée (els L/C/A) */
  function mepAABBOf(g){
    let minx=1e9,miny=1e9,maxx=-1e9,maxy=-1e9,any=false;
    g.els.forEach(e=>{
      const b=mepElAABB(e);if(!b)return;
      minx=Math.min(minx,b.minx);maxx=Math.max(maxx,b.maxx);
      miny=Math.min(miny,b.miny);maxy=Math.max(maxy,b.maxy);
      any=true;
    });
    return any?{minx,miny,maxx,maxy}:null;
  }
  function mepPlaceNear(sh,view,gx,gy){
    // évite la superposition : pousse la vue jusqu'à ce qu'elle soit libre
    const pad=18;
    const bbOf=v=>mepAABBOf(mepGeoOf(v));
    view.x=gx;view.y=gy;
    const b=bbOf(view);
    if(!b)return;
    for(let it=0;it<40;it++){
      let hit=false;
      sh.views.forEach(o=>{
        if(o===view)return;
        const ob=bbOf(o);if(!ob)return;
        const s1=mepToSheet(view,b.minx,b.miny),s2=mepToSheet(view,b.maxx,b.maxy);
        const o1=mepToSheet(o,ob.minx,ob.miny),o2=mepToSheet(o,ob.maxx,ob.maxy);
        if(s1.x<o2.x+pad&&s2.x+pad>o1.x&&s1.y<o2.y+pad&&s2.y+pad>o1.y){
          view.x+=(s2.x<o1.x+(o2.x-o1.x)/2?-(s2.x-o1.x+pad):(o2.x-s1.x+pad));
          hit=true;
        }
      });
      if(!hit)break;
    }
    const pd=mepPageDim(sh);
    view.x=Math.max(pd.ix+8,Math.min(pd.ix+pd.iw-8,view.x));
    view.y=Math.max(pd.iy+8,Math.min(pd.iy+pd.ih-8,view.y));
  }
  function mepAutoScale(sh,view){
    const b=mepAABBOf(mepGeoOf(view));
    if(!b)return;
    const{minx,miny,maxx,maxy}=b;
    const pd=mepPageDim(sh);
    const w=(maxx-minx)||1,h=(maxy-miny)||1;
    const s=Math.min(1,(pd.iw*0.42)/w,(pd.ih*0.8)/h);
    if(s>0&&s<1){
      const sc=MEP_SCALES.find(x=>x[0]<=s);
      view.scale=sc?sc[0]:Math.max(0.05,Math.round(s*20)/20);
    }
  }
  function mepAddView(opts){
    const sh=mepSheet();
    const view=Object.assign({id:mepUid('v'),kind:'base',vk:'front',bodyId:null,
      dir:[0,-1,0],u:[1,0,0],v:[0,0,-1],x:0,y:0,scale:1,mode:'hide',tangent:true,hlrExact:true,flip:false,
      label:'',parent:null,section:null,detail:null,autoAxes:false,autoPitch:false,axes:[]},opts||{});
    if(view.kind==='base'&&view.vk){
      const b=mepBasisOf(view);view.dir=b.dir;view.u=b.u;view.v=b.v;
    }
    const at=view._at,keep=view._keepScale;delete view._at;delete view._keepScale;
    mepEdit('nouvelle vue',()=>{
      sh.views.push(view);
      if(!keep)mepAutoScale(sh,view);
      if(at)mepViewCenterAt(view,at); // posée à la souris (commandes interactives)
      else{
        const pd=mepPageDim(sh);
        mepPlaceNear(sh,view,pd.ix+pd.iw*(0.28+0.16*(sh.views.length%3)),pd.iy+pd.ih*(view.kind==='detail'?0.3:0.45));
      }
    });
    mepSelect(view.id);
    return view;
  }
  /* ═══════════════ vue DXF importée (2026-10-23) ═══════════════
     Le DXF est lu par mepDxfParse (src/98-01-import-dxf.js) et rangé DANS la vue (doc.mep) :
     le projet reste autonome. Cotes, axes, accrochage et esquisse de planche s'y appliquent
     comme sur une vue projetée ; un détail peut y être pris. */
  function mepDxfPick(cb){
    const inp=document.createElement('input');inp.type='file';inp.accept='.dxf,application/dxf,image/vnd.dxf';
    inp.onchange=()=>{const f=inp.files&&inp.files[0];if(!f)return;
      const rd=new FileReader();
      rd.onload=()=>{let r=null;try{r=mepDxfParse(String(rd.result||''));}catch(e){r=null;}
        if(!r||!r.n){mepStatus('DXF : aucun élément géométrique lisible dans « '+f.name+' ».');return;}
        cb(r,f.name.replace(/\.[^.]+$/,''));};
      rd.readAsText(f);};
    inp.click();
  }
  function mepDxfSkipText(r){
    const k=Object.keys(r.skipped||{});
    return k.length?' — ignorés : '+k.map(t=>r.skipped[t]+' '+t).join(', '):'';
  }
  function mepDxfData(r,name,rev){return{name,els:r.els,n:r.n,bbox:r.bbox,units:r.units,skipped:r.skipped,rev};}
  // cotes DIMENSION du DXF → cotes natives (distance h / v / alignée, Ø, R accrochés au cercle)
  function mepDxfDims(sh,v,r){
    const out=[];let miss=0;
    const els=(v.dxf&&v.dxf.els)||[],S=q=>mepToSheet(v,q[0],q[1]);
    (r.dims||[]).forEach(D=>{
      if(D.kind==='lin'){
        const A=S(D.a),B=S(D.b),Pl=S(D.p);
        if(Math.hypot(B.x-A.x,B.y-A.y)<1e-9){miss++;return;}
        out.push({id:mepUid('d'),kind:'dist',vid:v.id,vid2:null,a:{x:D.a[0],y:D.a[1]},b:{x:D.b[0],y:D.b[1]},
          orient:D.orient,off:mepDimOffsetFromPts(A.x,A.y,B.x,B.y,D.orient,Pl),ref:false,tol:null});
      }else{
        const i=els.findIndex(e=>(e.t==='C'||e.t==='A')&&Math.hypot(e.cx-D.c[0],e.cy-D.c[1])<1e-3&&Math.abs(e.r-D.r)<1e-3);
        if(i<0){miss++;return;}
        out.push({id:mepUid('d'),kind:D.kind,vid:v.id,vid2:null,a:{x:els[i].cx,y:els[i].cy,hint:{t:'ctr',i}},b:{x:D.t[0],y:D.t[1]},ref:false,tol:null});
      }
    });
    if(out.length)mepEdit('cotes du DXF',()=>{out.forEach(d=>sh.dims.push(d));});
    return{n:out.length,miss};
  }
  function mepImportDxf(){
    mepDxfPick((r,name)=>{
      const sh=mepSheet();
      const v=mepAddView({kind:'dxf',vk:'',label:'',dxf:mepDxfData(r,name,1),mode:'wire',tangent:false,hlrExact:false});
      const cd=mepDxfDims(sh,v,r);
      mepStatus('DXF « '+name+' » importé : '+r.n+' élément(s), '+mepFmtNum(r.bbox.w,1)+' × '+mepFmtNum(r.bbox.h,1)+' mm'+
        (cd.n?' ; '+cd.n+' cote(s) reprise(s) en cotes du plan':'')+(cd.miss?' ('+cd.miss+' non reprise(s))':'')+mepDxfSkipText(r)+'.');
      mepSideShow();mepRender();return v;
    });
  }
  function mepDxfReplace(v){
    mepDxfPick((r,name)=>{
      mepEdit('DXF remplacé',()=>{v.dxf=mepDxfData(r,name,((v.dxf&&v.dxf.rev)||0)+1);});
      mepGeoCache.delete(v.id);
      mepStatus('DXF de la vue remplacé par « '+name+' » ('+r.n+' élément(s))'+mepDxfSkipText(r)+'. Les cotes gardent leurs n° d’éléments.');
      mepSideShow();mepRender();
    });
  }
  function mepSelect(id){mepSt.sel=id;mepSt.selDim=null;mepSt.selAxis=null;mepSideShow();}
  /* ═══════════════ J. commandes de vues ═══════════════ */
  function mepAddStandardView(vk,bodyId){
    const def=MEP_VIEWS[vk];if(!def)return null;
    return mepAddView({kind:'base',vk,bodyId:bodyId===undefined?null:bodyId,label:def.lab||''});
  }
  function mepAddCameraView(){
    let dir=[0,-1,0];
    try{
      const t=controls.target.clone(),d=camera.position.clone().sub(t);
      if(d.length()>1e-6){d.normalize();dir=[d.x,d.y,d.z];}
    }catch(e){}
    const b=mepBasisFromDir(dir);
    return mepAddView({kind:'base',vk:'',camera:true,dir:b.dir,u:b.u,v:b.v,label:''});
  }
  /* ═══════════════ J2. vues projetées (1er angle, méthode européenne) ═══════════════ */
  /* Règles 1er angle depuis la base du parent (d,u,v) :
     dessus    → dir=-v , u'=u   (placée SOUS la mère)
     dessous   → dir= v , u'=u   (placée SUR la mère)
     gauche    → dir=-u , u'=d   (placée à DROITE de la mère)
     droit     → dir= u , u'=-d  (placée à GAUCHE de la mère)
     Puis v'=u'×dir. L'axe libre du glissement est indiqué (axis). */
  const MEP_PROJ={
    top:   {dir:b=>[-b.v[0],-b.v[1],-b.v[2]],u:b=>b.u.slice(),lab:'Dessus',axis:'y'},
    bottom:{dir:b=>b.v.slice(),              u:b=>b.u.slice(),lab:'Dessous',axis:'y'},
    left:  {dir:b=>[-b.u[0],-b.u[1],-b.u[2]],u:b=>b.dir.slice(),lab:'Côté gauche',axis:'x'},
    right: {dir:b=>b.u.slice(),              u:b=>[-b.dir[0],-b.dir[1],-b.dir[2]],lab:'Côté droit',axis:'x'}
  };
  function mepProjFollow(sh,v,dx,dy){
    // les projections (et leurs sous-projections) suivent leur mère au glisser
    sh.views.forEach(c=>{
      if((c.kind==='proj'||c.align)&&c.parent===v.id){c.x+=dx;c.y+=dy;mepProjFollow(sh,c,dx,dy);}
    });
  }
  function mepAddProjected(par,which,at){
    const def=MEP_PROJ[which];
    if(!def){mepStatus('Projection inconnue : '+which);return null;}
    if(!par){mepStatus('Sélectionnez d’abord la vue mère à projeter.');return null;}
    const b=mepBasisOf(par);
    const dir=mepNorm(def.dir(b)),u=mepNorm(def.u(b));
    const v=mepNorm(mepCross(u,dir));
    const vObj=mepAddView(Object.assign({kind:'proj',vk:'',proj:which,dir,u,v,
      parent:par.id,label:mepNextLabel(mepSheet()),
      bodyId:par.bodyId,asm:!!par.asm,mode:par.mode,tangent:par.tangent,hlrExact:par.hlrExact!==false,scale:par.scale,
      autoAxes:!!par.autoAxes,autoPitch:!!par.autoPitch},at?{_keepScale:1,_at:at}:{}));
    // placement aligné 1er angle : l'axe commun est verrouillé sur la mère
    if(!at)mepEdit('placement vue projetée',()=>mepPlaceProj(par,vObj,which));
    mepStatus('Vue projetée « '+def.lab+' » ('+vObj.label+') — 1er angle, alignée sur la mère.');
    return vObj;
  }
  function mepPlaceProj(par,vObj,which){
    vObj.scale=par.scale; // les vues liées partagent TOUJOURS l'échelle de la mère
    const off=mepViewSpan(par)+mepViewSpan(vObj)+30;
    if(which==='top'){vObj.x=par.x;vObj.y=par.y+off;}
    else if(which==='bottom'){vObj.x=par.x;vObj.y=par.y-off;}
    else if(which==='left'){vObj.x=par.x+off;vObj.y=par.y;}
    else{vObj.x=par.x-off;vObj.y=par.y;}
  }
  /* orientation d'une vue de base (2026-10-30) : Face → Côté droit, Dessus… Les projections
     (et leurs filles) suivent en cascade, les cotes sont re-ancrées, et les projections
     directes reprennent leur place 1er angle (leur taille a changé avec la nouvelle direction). */
  const MEP_BASE_ORIENTS=['front','rear','left','right','top','bottom'];
  function mepSetBaseOrient(v,vk){
    if(!v||v.kind!=='base'||!MEP_VIEWS[vk]||v.vk===vk)return;
    const sh=mepSheet(),old=MEP_VIEWS[v.vk];
    mepEdit('orientation de vue',()=>{
      if(!v.label||(old&&v.label===old.lab))v.label=MEP_VIEWS[vk].lab;
      v.vk=vk;delete v.camera;mepOrtho(v);
    });
    mepReproject(v.id,true);
    mepEdit('placement des projections',()=>{
      sh.views.forEach(c=>{
        if(c.kind!=='proj'||c.parent!==v.id||!MEP_PROJ[c.proj||''])return;
        const x0=c.x,y0=c.y;
        mepPlaceProj(v,c,c.proj);
        mepProjFollow(sh,c,c.x-x0,c.y-y0);
      });
    },true);
    mepStatus('Vue « '+(v.label||MEP_VIEWS[vk].lab)+' » : orientation '+MEP_VIEWS[vk].lab+' — projections mises à jour.');
  }
  function mepBeginAux(){
    const s=(typeof selFaces!=='undefined'&&selFaces||[])[0];
    if(!s||!s.mesh){mepStatus('Sélectionnez une FACE inclinée dans la 3D, puis retentez « Auxiliaire ».');return;}
    let n=null;
    try{
      const fn=(typeof faceNormalWorld==='function')?faceNormalWorld(s.mesh,s.faceIndex):null;
      if(fn)n=[fn.x,fn.y,fn.z];
    }catch(e){}
    if(!n){mepStatus('Normale de face illisible — retentez après sélection.');return;}
    // oriente la normale côté caméra
    try{
      const cp=camera.position;
      const pt=s.point||{x:0,y:0,z:0};
      const toCam=[cp.x-pt.x,cp.y-pt.y,cp.z-pt.z];
      if(mepDot(n,toCam)<0)n=[-n[0],-n[1],-n[2]];
    }catch(e){}
    const par=mepView(mepSheet(),mepSt.sel)||mepSheet().views[0];
    const b=mepBasisFromDir(n);
    const v=mepAddView({kind:'aux',vk:'',dir:b.dir,u:b.u,v:b.v,parent:par?par.id:null,label:mepNextLabel(mepSheet())});
    if(par){
      // décalage en alignement standard : direction de n projetée sur le papier du parent
      const dp=[mepDot(n,par.u),mepDot(n,par.v)];
      const L=Math.hypot(dp[0],dp[1]);
      if(L>0.2){
        const off=mepViewSpan(par)+60;
        mepEdit('placement vue auxiliaire',()=>{
          v.x=par.x+(dp[0]/L)*off*(Math.sign(dp[0])||1);
          v.y=par.y+(dp[1]/L)*off*(Math.sign(dp[1])||1);
        });
      }
    }
    mepStatus('Vue auxiliaire « '+v.label+' » créée — direction de la face sélectionnée.');
    return v;
  }
  function mepViewSpan(view){
    const g=mepGeoOf(view);
    let mx=10;
    g.els.forEach(e=>{
      const b=mepElAABB(e);if(!b)return;
      mx=Math.max(mx,Math.abs(b.minx),Math.abs(b.maxx),Math.abs(b.miny),Math.abs(b.maxy));
    });
    return mx*Math.max(0.2,view.scale);
  }
  function mepBeginSection(){mepVcmdStart('section');}
  function mepBeginSectionOld(){
    const par=mepView(mepSheet(),mepSt.sel);
    if(!par){mepStatus('Sélectionnez d’abord la vue parente de la coupe.');return;}
    mepSt.tool='cut2';mepSt.cutParent=par.id;mepSt.cutPts=[];
    mepStatus('Coupe : cliquez les DEUX points de la ligne de coupe sur la vue « '+(par.label||par.vk||'vue')+' ».');
  }
  function mepSectionFromPicks(par,A,B,opt){
    if(opt&&opt.s){
      // V0.3.13 : vue alignée sur la mère (base tournée comme une projection), sens = côté de la souris
      const L=Math.hypot(B.x-A.x,B.y-A.y);if(L<1e-6){mepStatus('Coupe : les deux points sont confondus.');return null;}
      const t={x:(B.x-A.x)/L,y:(B.y-A.y)/L},np={x:-t.y,y:t.x},Bs=mepPaperBasis(par,t,np,opt.s);
      const pb=mepBasisOf(par),wA=[pb.u[0]*A.x+pb.v[0]*A.y,pb.u[1]*A.x+pb.v[1]*A.y,pb.u[2]*A.x+pb.v[2]*A.y];
      const label=mepNextLabel(mepSheet());
      const v=mepAddView({kind:'section',vk:'',dir:Bs.dir,u:Bs.u,v:Bs.v,parent:par.id,label,
        bodyId:par.bodyId,asm:!!par.asm,mode:par.mode,tangent:par.tangent,hlrExact:par.hlrExact!==false,scale:par.scale,_keepScale:1,_at:opt.at,
        align:{x:np.x*opt.s,y:np.y*opt.s},autoAxes:!!par.autoAxes,autoPitch:!!par.autoPitch,
        section:Object.assign({p:wA,n:Bs.dir.slice(),a:[A.x,A.y],b:[B.x,B.y],pid:par.id,s:opt.s},
          opt.pts&&opt.pts.length>2?{pts:opt.pts.map(q=>[+(+q.x).toFixed(4),+(+q.y).toFixed(4)])}:{})});
      try{mepCutAutoRefs(mepSheet(),v);}catch(e){}
      mepStatus('Coupe '+label+'-'+label+' posée — glisser contraint sur sa ligne de rappel. Tirer sur la ligne de coupe la brise jusqu’au centre / à la ligne visé(e).');
      return v;
    }
    const dirA=mepNorm(par.dir);
    const wA=[par.u[0]*A.x+par.v[0]*A.y,par.u[1]*A.x+par.v[1]*A.y,par.u[2]*A.x+par.v[2]*A.y];
    const wB=[par.u[0]*B.x+par.v[0]*B.y,par.u[1]*B.x+par.v[1]*B.y,par.u[2]*B.x+par.v[2]*B.y];
    const d=mepSub(wB,wA);const L=Math.hypot(d[0],d[1],d[2]);
    if(L<1e-6){mepStatus('Coupe : les deux points sont confondus.');return null;}
    const dc=[d[0]/L,d[1]/L,d[2]/L];
    let n=mepCross(dirA,dc);
    const Ln=Math.hypot(n[0],n[1],n[2]);
    if(Ln<1e-6){mepStatus('Coupe : la ligne est parallèle au regard.');return null;}
    n=[n[0]/Ln,n[1]/Ln,n[2]/Ln];
    const label=mepNextLabel(mepSheet());
    const b=mepBasisFromDir(n);
    const v=mepAddView({kind:'section',vk:'',dir:b.dir,u:b.u,v:b.v,parent:par.id,label,bodyId:par.bodyId,asm:!!par.asm, // V0.8.2 : la coupe d'une vue d'assemblage voit l'assemblage
      autoAxes:!!par.autoAxes,autoPitch:!!par.autoPitch,
      section:{p:wA.slice(),n:n.slice(),a:[A.x,A.y],b:[B.x,B.y],pid:par.id}});
    // décalage le long de la ligne de coupe, sur le papier du parent
    mepEdit('placement vue en coupe',()=>{
      const span=mepViewSpan(par)+50;
      const dpx=B.x-A.x,py=B.y-A.y,dpl=Math.hypot(dpx,py)||1;
      v.x=par.x+(dpx/dpl)*span;
      v.y=par.y+(py/dpl)*span;
    });
    mepStatus('Coupe '+label+'-'+label+' créée.');
    return v;
  }
  function mepBeginDetail(){mepVcmdStart('detail');}
  function mepBeginDetailOld(){
    const par=mepView(mepSheet(),mepSt.sel);
    if(!par){mepStatus('Sélectionnez d’abord la vue parente du détail.');return;}
    mepSt.tool='det2';mepSt.cutParent=par.id;
    mepStatus('Détail : cliquez le CENTRE du cercle de détail, puis le rayon.');
  }
  function mepDetailFromPicks(par,C,R,opt){
    const label=mepNextLabel(mepSheet());
    const src=mepBasisOf(par);
    const v=mepAddView(Object.assign({kind:'detail',vk:'',dir:src.dir.slice(),u:src.u.slice(),v:src.v.slice(),
      parent:par.id,label,scale:opt&&opt.scale||2,detail:{cx:C.x,cy:C.y,r:R},bodyId:par.bodyId,asm:!!par.asm,mode:par.mode,tangent:par.tangent,hlrExact:par.hlrExact!==false,
      autoAxes:!!par.autoAxes,autoPitch:!!par.autoPitch},opt&&opt.at?{_keepScale:1,_at:opt.at}:{}));
    if(!(opt&&opt.at))mepEdit('placement vue de détail',()=>{
      const pd=mepPageDim(mepSheet());
      v.x=pd.ix+pd.iw*0.72;v.y=pd.iy+pd.ih*0.3;
      let s=2;
      const maxR=R*2.4;
      const target=Math.min(pd.iw*0.3,pd.ih*0.35);
      s=target/maxR;
      const sc=MEP_SCALES.find(x=>x[0]>=s);
      v.scale=sc?sc[0]:Math.max(0.5,Math.round(s*2)/2);
    });
    mepStatus('Détail '+label+' ('+mepFmtNum(R*2)+' Ø) créé.');
    return v;
  }
  function mepDelView(id){
    const sh=mepSheet();
    const v=mepView(sh,id);if(!v)return;
    mepEdit('suppression de vue',()=>{
      sh.views=sh.views.filter(x=>x.id!==id&&x.parent!==id);
      sh.dims=sh.dims.filter(d=>d.vid!==id&&d.vid2!==id);
      if(mepSt.sel===id)mepSt.sel=null;
    });
    mepSideShow();
  }
  function mepSegDist(p,e){
    // distance d'un point au segment L (x1,y1)-(x2,y2)
    const dx=e.x2-e.x1,dy=e.y2-e.y1,L2=dx*dx+dy*dy;
    let t=L2>0?((p.x-e.x1)*dx+(p.y-e.y1)*dy)/L2:0;t=t<0?0:(t>1?1:t);
    return Math.hypot(p.x-(e.x1+dx*t),p.y-(e.y1+dy*t));
  }
  function mepReproject(id,noUndo){
    const sh=mepSheet();
    let list=id?[mepView(sh,id)]:sh.views;
    if(id&&list[0]){
      // cascade : rejeu aussi les filles (projections, coupes, détails) de cette vue
      const collect=par=>sh.views.filter(v=>v&&v.parent===par.id);
      const stack=[list[0]];
      while(stack.length){
        const cur=stack.pop();
        collect(cur).forEach(ch=>{if(list.indexOf(ch)<0){list.push(ch);stack.push(ch);}});
      }
    }
    mepEdit('rejeu des vues',()=>{
      // 2026-10-22-003 : entités visées par les cotes AVANT le rejeu — le re-ancrage
      // reprend le trait qui leur ressemble (au coin d'un rectangle, l'arête verticale
      // voisine était prise pour l'horizontale : cote de longueur 100 → 0)
      const before=new Map();
      sh.dims.forEach(d=>{
        const v1=mepView(sh,d.vid);if(!v1)return;
        const ent=(p,vw)=>{
          if(!p||!p.hint||typeof p.hint.i==='string'||!vw)return null;
          const e=mepEntByHint(vw,p.hint);if(!e)return null;
          // l'index doit bien désigner un trait passant par le point (sinon index périmé)
          if(e.t==='L'&&mepSegDist(p,e)<0.6)return e;
          if((e.t==='C'||e.t==='A')&&Math.hypot(e.cx-p.x,e.cy-p.y)<0.6)return e;
          return null;
        };
        before.set(d,{a:ent(d.a,v1),b:ent(d.b,d.vid2?mepView(sh,d.vid2):v1)});
      });
      list.forEach(v=>{
        if(!v)return;
        if(v.kind==='base'||v.kind==='aux'){
          if(v.vk&&MEP_VIEWS[v.vk]){const b=mepBasisOf(v);v.dir=b.dir;v.u=b.u;v.v=b.v;}
        }else if(v.kind==='proj'){
          // rejeu 1er angle : la base suit celle de la mère actuelle
          const par=mepView(sh,v.parent);
          const def=MEP_PROJ[v.proj||''];
          if(par&&def){
            const b=mepBasisOf(par);
            v.dir=mepNorm(def.dir(b));v.u=mepNorm(def.u(b));v.v=mepNorm(mepCross(v.u,v.dir));
            v.scale=par.scale;
          }
        }else if(v.kind==='section'&&v.section&&v.section.s){
          const par=mepView(sh,v.section.pid||v.parent);
          if(par){
            const A={x:v.section.a[0],y:v.section.a[1]},B={x:v.section.b[0],y:v.section.b[1]};
            const L=Math.hypot(B.x-A.x,B.y-A.y)||1,t={x:(B.x-A.x)/L,y:(B.y-A.y)/L},Bs=mepPaperBasis(par,t,{x:-t.y,y:t.x},v.section.s);
            const pb=mepBasisOf(par);
            v.section.p=[pb.u[0]*A.x+pb.v[0]*A.y,pb.u[1]*A.x+pb.v[1]*A.y,pb.u[2]*A.x+pb.v[2]*A.y];
            v.section.n=Bs.dir.slice();v.dir=Bs.dir;v.u=Bs.u;v.v=Bs.v;v.scale=par.scale;
          }
        }else if(v.kind==='aux'&&v.auxEdge){
          const par=mepView(sh,v.auxEdge.pid||v.parent);
          if(par){
            const a=v.auxEdge.a,b=v.auxEdge.b,L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,t={x:(b[0]-a[0])/L,y:(b[1]-a[1])/L};
            const Bs=mepPaperBasis(par,t,{x:-t.y,y:t.x},v.auxEdge.s);v.dir=Bs.dir;v.u=Bs.u;v.v=Bs.v;v.scale=par.scale;
          }
        }else if(v.kind==='section'&&v.section){
          const par=mepView(sh,v.section.pid||v.parent);
          if(par){
            const A={x:v.section.a[0],y:v.section.a[1]},B={x:v.section.b[0],y:v.section.b[1]};
            const wA=[par.u[0]*A.x+par.v[0]*A.y,par.u[1]*A.x+par.v[1]*A.y,par.u[2]*A.x+par.v[2]*A.y];
            const wB=[par.u[0]*B.x+par.v[0]*B.y,par.u[1]*B.x+par.v[1]*B.y,par.u[2]*B.x+par.v[2]*B.y];
            const d=mepSub(wB,wA),L=Math.hypot(d[0],d[1],d[2])||1;
            const dc=[d[0]/L,d[1]/L,d[2]/L];
            let n=mepCross(mepNorm(par.dir),dc);
            const Ln=Math.hypot(n[0],n[1],n[2])||1;
            n=[n[0]/Ln,n[1]/Ln,n[2]/Ln];
            if(v.flip)n=[-n[0],-n[1],-n[2]];
            v.section.p=wA;v.section.n=n;
            const b=mepBasisFromDir(n);
            v.dir=b.dir;v.u=b.u;v.v=b.v;
          }
        }
      });
      sh.dims.forEach(d=>{
        // re-ancrage des cotes sur la géométrie rejetée
        const v=mepView(sh,d.vid);if(!v)return;
        const old=before.get(d)||{};
        // forme du trait d'origine : extrémités (ou centre + rayon) ; une cote de longueur
        // sans entité connue se sert de ses deux points a → b
        const segMatch=(e,o)=>Math.min(
          Math.max(Math.hypot(e.x1-o.x1,e.y1-o.y1),Math.hypot(e.x2-o.x2,e.y2-o.y2)),
          Math.max(Math.hypot(e.x1-o.x2,e.y1-o.y2),Math.hypot(e.x2-o.x1,e.y2-o.y1)));
        const rebind=(a,vw,o)=>{
          if(!a||!a.hint)return a;
          if(typeof a.hint.i==='string')return a; // trait d'axe : clé stable, rien à re-ancrer
          if(a.hint.s)return a; // forme de l'entité connue : suivie par mepIdxFollow (2026-10-28)
          const g=mepGeoOf(vw);
          if(!o&&a===d.a&&d.kind==='len'&&d.b&&!d.vid2)o={t:'L',x1:d.a.x,y1:d.a.y,x2:d.b.x,y2:d.b.y};
          let best=null,bs=Infinity;
          g.els.forEach((e,i)=>{
            if(a.hint.t==='seg'&&e.t==='L'){
              const d1=Math.hypot(e.x1-a.x,e.y1-a.y),d2=Math.hypot(e.x2-a.x,e.y2-a.y);
              const dmin=Math.min(d1,d2);
              // point à une extrémité : il s'y recale ; sinon il reste sur le trait
              const near=dmin<0.6?dmin:mepSegDist(a,e);
              if(!(near<0.6))return;
              const s=near+(o&&o.t==='L'?segMatch(e,o):0);
              if(s<bs){bs=s;best=dmin<0.6?(d1<d2?{x:e.x1,y:e.y1,hint:{t:'seg',i}}:{x:e.x2,y:e.y2,hint:{t:'seg',i}}):{x:a.x,y:a.y,hint:{t:'seg',i}};}
            }else if(a.hint.t==='ctr'&&(e.t==='C'||e.t==='A')){
              const dmin=Math.hypot(e.cx-a.x,e.cy-a.y);
              if(!(dmin<0.6))return;
              const s=dmin+(o&&(o.t==='C'||o.t==='A')?Math.abs(e.r-o.r):0);
              if(s<bs){bs=s;best={x:e.cx,y:e.cy,hint:{t:'ctr',i}};}
            }
          });
          return best||a;
        };
        const v2=d.vid2?mepView(sh,d.vid2):v;
        if(d.kind==='ord'){ // origine + points : chacun suit son entité
          d.o=rebind(d.o,v,null);d.a=d.b=d.o;
          d.pts=(d.pts||[]).map(q=>rebind(q,v,null));
          return;
        }
        d.a=rebind(d.a,v,old.a);
        if(d.b)d.b=rebind(d.b,v2||v,old.b);
      });
    },noUndo);
  }
